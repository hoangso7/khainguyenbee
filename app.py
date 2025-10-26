from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import qrcode
import io
import base64
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import os
from dotenv import load_dotenv
import jwt
from functools import wraps

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost/kbee_manager')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS for React frontend
CORS(app, origins=[
    'http://localhost:3000', 
    'http://localhost:5173',
    'http://localhost:8080',
    'https://localhost:8443',
    'http://khainguyenbee.io.vn:8080',
    'https://khainguyenbee.io.vn:8443',
    'https://khainguyenbee.io.vn',
    'http://khainguyenbee.io.vn'
])

# Session configuration
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
app.config['SESSION_COOKIE_SECURE'] = os.getenv('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Business information fields
    farm_name = db.Column(db.String(200), nullable=True)
    farm_address = db.Column(db.Text, nullable=True)
    farm_phone = db.Column(db.String(20), nullable=True)
    
    # QR display settings
    qr_show_farm_info = db.Column(db.Boolean, default=True)
    qr_show_owner_contact = db.Column(db.Boolean, default=True)
    qr_show_beehive_history = db.Column(db.Boolean, default=True)
    qr_show_health_status = db.Column(db.Boolean, default=True)
    qr_custom_message = db.Column(db.Text, nullable=True)
    qr_footer_text = db.Column(db.String(500), default='Cảm ơn bạn đã tin tưởng sản phẩm của chúng tôi')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Beehive(db.Model):
    serial_number = db.Column(db.String(50), primary_key=True)  # TO001, TO002, etc.
    qr_token = db.Column(db.String(12), unique=True, nullable=False)  # Random 12-char token for QR
    import_date = db.Column(db.Date, nullable=False)
    split_date = db.Column(db.Date, nullable=True)
    health_status = db.Column(db.String(20), nullable=False, default='Tốt')  # Tốt, Bình thường, Yếu
    notes = db.Column(db.Text, nullable=True)
    is_sold = db.Column(db.Boolean, default=False)
    sold_date = db.Column(db.Date, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Owner of beehive
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @staticmethod
    def generate_serial_number():
        """Generate next serial number in format TO001, TO002, etc."""
        # Get the highest existing serial number
        last_beehive = Beehive.query.filter(
            Beehive.serial_number.like('TO%')
        ).order_by(Beehive.serial_number.desc()).first()
        
        if last_beehive:
            # Extract number from last serial number (e.g., TO001 -> 1)
            try:
                last_number = int(last_beehive.serial_number[2:])  # Remove 'TO' prefix
                next_number = last_number + 1
            except (ValueError, IndexError):
                next_number = 1
        else:
            next_number = 1
        
        return f"TO{next_number:03d}"
    
    @staticmethod
    def generate_qr_token():
        """Generate unique 12-character random token for QR code"""
        import secrets
        import string
        
        while True:
            # Generate 12-character random string (letters + numbers)
            token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
            
            # Check if token already exists
            if not Beehive.query.filter_by(qr_token=token).first():
                return token
    
    def to_dict(self):
        """Convert beehive to dictionary for API responses"""
        return {
            'serial_number': self.serial_number,
            'qr_token': self.qr_token,
            'import_date': self.import_date.isoformat() if self.import_date else None,
            'split_date': self.split_date.isoformat() if self.split_date else None,
            'health_status': self.health_status,
            'notes': self.notes,
            'is_sold': self.is_sold,
            'sold_date': self.sold_date.isoformat() if self.sold_date else None,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Root route for health check
@app.route('/')
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'KBee Manager API is running',
        'version': '1.0.0'
    })

# API Routes
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400
            
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'message': 'Username and password are required'}), 400
        
        # Check if database is ready
        try:
            user = User.query.filter_by(username=username).first()
        except Exception as db_error:
            app.logger.error(f'Database error during login: {str(db_error)}')
            return jsonify({'message': 'Database not ready. Please try again.'}), 503
        
        if user and user.check_password(password):
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(days=30)
            }, app.config['SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'token': token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'farmName': user.farm_name,
                    'farmAddress': user.farm_address,
                    'farmPhone': user.farm_phone,
                    'qrDisplaySettings': {
                        'showFarmInfo': user.qr_show_farm_info,
                        'showOwnerContact': user.qr_show_owner_contact,
                        'showBeehiveHistory': user.qr_show_beehive_history,
                        'showHealthStatus': user.qr_show_health_status,
                        'customMessage': user.qr_custom_message,
                        'footerText': user.qr_footer_text,
                    }
                }
            })
        
        return jsonify({'message': 'Invalid credentials'}), 401
        
    except Exception as e:
        app.logger.error(f'Login error: {str(e)}')
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user_id):
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'farmName': user.farm_name,
        'farmAddress': user.farm_address,
        'farmPhone': user.farm_phone,
        'qrDisplaySettings': {
            'showFarmInfo': user.qr_show_farm_info,
            'showOwnerContact': user.qr_show_owner_contact,
            'showBeehiveHistory': user.qr_show_beehive_history,
            'showHealthStatus': user.qr_show_health_status,
            'customMessage': user.qr_custom_message,
            'footerText': user.qr_footer_text,
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
@token_required
def api_logout(current_user_id):
    return jsonify({'message': 'Logged out successfully'})

@app.route('/api/auth/profile', methods=['PUT'])
@token_required
def update_profile(current_user_id):
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update username if provided and not already taken
    if 'username' in data and data['username']:
        existing_user = User.query.filter(User.username == data['username'], User.id != current_user_id).first()
        if existing_user:
            return jsonify({'message': 'Username already taken'}), 400
        user.username = data['username']
    
    # Update email if provided and not already taken
    if 'email' in data and data['email']:
        existing_user = User.query.filter(User.email == data['email'], User.id != current_user_id).first()
        if existing_user:
            return jsonify({'message': 'Email already taken'}), 400
        user.email = data['email']
    
    # Update password if provided
    if 'password' in data and data['password']:
        if len(data['password']) < 6:
            return jsonify({'message': 'Password must be at least 6 characters long'}), 400
        user.set_password(data['password'])
    
    # Update business information
    if 'farmName' in data:
        user.farm_name = data['farmName']
    if 'farmAddress' in data:
        user.farm_address = data['farmAddress']
    if 'farmPhone' in data:
        user.farm_phone = data['farmPhone']
    
    # Update QR display settings
    if 'qrDisplaySettings' in data:
        qr_settings = data['qrDisplaySettings']
        if 'showFarmInfo' in qr_settings:
            user.qr_show_farm_info = qr_settings['showFarmInfo']
        if 'showOwnerContact' in qr_settings:
            user.qr_show_owner_contact = qr_settings['showOwnerContact']
        if 'showBeehiveHistory' in qr_settings:
            user.qr_show_beehive_history = qr_settings['showBeehiveHistory']
        if 'showHealthStatus' in qr_settings:
            user.qr_show_health_status = qr_settings['showHealthStatus']
        if 'customMessage' in qr_settings:
            user.qr_custom_message = qr_settings['customMessage']
        if 'footerText' in qr_settings:
            user.qr_footer_text = qr_settings['footerText']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'farmName': user.farm_name,
            'farmAddress': user.farm_address,
            'farmPhone': user.farm_phone,
            'qrDisplaySettings': {
                'showFarmInfo': user.qr_show_farm_info,
                'showOwnerContact': user.qr_show_owner_contact,
                'showBeehiveHistory': user.qr_show_beehive_history,
                'showHealthStatus': user.qr_show_health_status,
                'customMessage': user.qr_custom_message,
                'footerText': user.qr_footer_text,
            }
        }
    })

@app.route('/api/beehives', methods=['GET'])
@token_required
def get_beehives(current_user_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    sort_field = request.args.get('sort_field', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')
    import_date = request.args.get('import_date', '')
    split_date = request.args.get('split_date', '')
    
    # Build query for active beehives
    query = Beehive.query.filter_by(user_id=current_user_id, is_sold=False)
    
    # Apply date filters
    if import_date:
        try:
            import_date_obj = datetime.strptime(import_date, '%Y-%m-%d').date()
            query = query.filter(Beehive.import_date == import_date_obj)
        except ValueError:
            pass
    
    if split_date:
        try:
            split_date_obj = datetime.strptime(split_date, '%Y-%m-%d').date()
            query = query.filter(Beehive.split_date == split_date_obj)
        except ValueError:
            pass
    
    # Apply sorting
    if sort_field == 'created_at':
        query = query.order_by(Beehive.created_at.desc() if sort_order == 'desc' else Beehive.created_at.asc())
    elif sort_field == 'import_date':
        query = query.order_by(Beehive.import_date.desc() if sort_order == 'desc' else Beehive.import_date.asc())
    elif sort_field == 'split_date':
        query = query.order_by(Beehive.split_date.desc() if sort_order == 'desc' else Beehive.split_date.asc())
    elif sort_field == 'health_status':
        query = query.order_by(Beehive.health_status.desc() if sort_order == 'desc' else Beehive.health_status.asc())
    
    # Pagination
    pagination = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    # Calculate health statistics
    all_active_beehives = Beehive.query.filter_by(user_id=current_user_id, is_sold=False).all()
    health_stats = {}
    for beehive in all_active_beehives:
        health = beehive.health_status or 'Unknown'
        health_stats[health] = health_stats.get(health, 0) + 1
    
    return jsonify({
        'beehives': [beehive.to_dict() for beehive in pagination.items],
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'total_pages': pagination.pages,
            'has_prev': pagination.has_prev,
            'has_next': pagination.has_next,
        },
        'health_stats': health_stats
    })

@app.route('/api/sold-beehives', methods=['GET'])
@token_required
def get_sold_beehives(current_user_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    sort_field = request.args.get('sort_field', 'sold_date')
    sort_order = request.args.get('sort_order', 'desc')
    import_date = request.args.get('import_date', '')
    sold_date = request.args.get('sold_date', '')
    
    # Build query for sold beehives
    query = Beehive.query.filter_by(user_id=current_user_id, is_sold=True)
    
    # Apply date filters
    if import_date:
        try:
            import_date_obj = datetime.strptime(import_date, '%Y-%m-%d').date()
            query = query.filter(Beehive.import_date == import_date_obj)
        except ValueError:
            pass
    
    if sold_date:
        try:
            sold_date_obj = datetime.strptime(sold_date, '%Y-%m-%d').date()
            query = query.filter(Beehive.sold_date == sold_date_obj)
        except ValueError:
            pass
    
    # Apply sorting
    if sort_field == 'created_at':
        query = query.order_by(Beehive.created_at.desc() if sort_order == 'desc' else Beehive.created_at.asc())
    elif sort_field == 'import_date':
        query = query.order_by(Beehive.import_date.desc() if sort_order == 'desc' else Beehive.import_date.asc())
    elif sort_field == 'sold_date':
        query = query.order_by(Beehive.sold_date.desc() if sort_order == 'desc' else Beehive.sold_date.asc())
    elif sort_field == 'health_status':
        query = query.order_by(Beehive.health_status.desc() if sort_order == 'desc' else Beehive.health_status.asc())
    
    # Pagination
    pagination = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'beehives': [beehive.to_dict() for beehive in pagination.items],
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'total_pages': pagination.pages,
            'has_prev': pagination.has_prev,
            'has_next': pagination.has_next,
        }
    })

@app.route('/api/stats', methods=['GET'])
@token_required
def get_stats(current_user_id):
    all_beehives = Beehive.query.filter_by(user_id=current_user_id).all()
    all_active_beehives = Beehive.query.filter_by(user_id=current_user_id, is_sold=False).all()
    all_sold_beehives = Beehive.query.filter_by(user_id=current_user_id, is_sold=True).all()
    
    total_beehives = len(all_beehives)
    active_beehives_count = len(all_active_beehives)
    sold_beehives_count = len(all_sold_beehives)
    healthy_beehives_count = len([b for b in all_active_beehives if b.health_status == 'Tốt'])
    
    return jsonify({
        'total': total_beehives,
        'active': active_beehives_count,
        'sold': sold_beehives_count,
        'healthy': healthy_beehives_count,
    })

@app.route('/api/beehives', methods=['POST'])
@token_required
def create_beehive(current_user_id):
    data = request.get_json()
    
    # Generate serial number and QR token
    serial_number = Beehive.generate_serial_number()
    qr_token = Beehive.generate_qr_token()
    
    beehive = Beehive(
        serial_number=serial_number,
        qr_token=qr_token,
        user_id=current_user_id,
        import_date=datetime.strptime(data['import_date'], '%Y-%m-%d').date(),
        split_date=datetime.strptime(data['split_date'], '%Y-%m-%d').date() if data.get('split_date') else None,
        health_status=data.get('health_status', 'Tốt'),
        notes=data.get('notes', ''),
        is_sold=False
    )
    
    db.session.add(beehive)
    db.session.commit()
    
    return jsonify(beehive.to_dict()), 201

@app.route('/api/beehives/<serial_number>', methods=['PUT'])
@token_required
def update_beehive(current_user_id, serial_number):
    beehive = Beehive.query.filter_by(serial_number=serial_number, user_id=current_user_id).first()
    if not beehive:
        return jsonify({'message': 'Beehive not found'}), 404
    
    data = request.get_json()
    
    if 'import_date' in data:
        beehive.import_date = datetime.strptime(data['import_date'], '%Y-%m-%d').date()
    if 'split_date' in data:
        beehive.split_date = datetime.strptime(data['split_date'], '%Y-%m-%d').date() if data['split_date'] else None
    if 'health_status' in data:
        beehive.health_status = data['health_status']
    if 'notes' in data:
        beehive.notes = data['notes']
    
    db.session.commit()
    
    return jsonify(beehive.to_dict())

@app.route('/api/beehives/<serial_number>', methods=['DELETE'])
@token_required
def delete_beehive(current_user_id, serial_number):
    beehive = Beehive.query.filter_by(serial_number=serial_number, user_id=current_user_id).first()
    if not beehive:
        return jsonify({'message': 'Beehive not found'}), 404
    
    db.session.delete(beehive)
    db.session.commit()
    
    return jsonify({'message': 'Beehive deleted successfully'})

@app.route('/api/beehives/<serial_number>/sell', methods=['POST'])
@token_required
def sell_beehive(current_user_id, serial_number):
    beehive = Beehive.query.filter_by(serial_number=serial_number, user_id=current_user_id).first()
    if not beehive:
        return jsonify({'message': 'Beehive not found'}), 404
    
    beehive.is_sold = True
    beehive.sold_date = datetime.utcnow().date()
    
    db.session.commit()
    
    return jsonify(beehive.to_dict())

@app.route('/api/beehives/<serial_number>/unsell', methods=['POST'])
@token_required
def unsell_beehive(current_user_id, serial_number):
    beehive = Beehive.query.filter_by(serial_number=serial_number, user_id=current_user_id).first()
    if not beehive:
        return jsonify({'message': 'Beehive not found'}), 404
    
    beehive.is_sold = False
    beehive.sold_date = None
    
    db.session.commit()
    
    return jsonify(beehive.to_dict())

@app.route('/api/beehive/<qr_token>', methods=['GET'])
def get_beehive_by_token(qr_token):
    beehive = Beehive.query.filter_by(qr_token=qr_token).first()
    if not beehive:
        return jsonify({'message': 'Beehive not found'}), 404
    
    owner = User.query.get(beehive.user_id)
    
    return jsonify({
        'beehive': beehive.to_dict(),
        'owner': {
            'id': owner.id,
            'username': owner.username,
            'email': owner.email,
        } if owner else None,
        'business_info': {
            'farm_name': owner.farm_name,
            'farm_address': owner.farm_address,
            'farm_phone': owner.farm_phone,
            'qr_show_farm_info': owner.qr_show_farm_info,
            'qr_show_owner_contact': owner.qr_show_owner_contact,
            'qr_show_beehive_history': owner.qr_show_beehive_history,
            'qr_show_health_status': owner.qr_show_health_status,
            'qr_custom_message': owner.qr_custom_message,
            'qr_footer_text': owner.qr_footer_text,
        } if owner else None
    })

# Beehive detail page for QR code access
@app.route('/beehive/<qr_token>')
def beehive_by_token(qr_token):
    """Route xử lý QR code scanning với token ngẫu nhiên"""
    # Tìm beehive theo QR token
    beehive = Beehive.query.filter_by(qr_token=qr_token).first()
    if not beehive:
        return jsonify({'message': 'Beehive not found'}), 404
    
    # Lấy thông tin user sở hữu beehive
    owner = User.query.get(beehive.user_id)
    if not owner:
        return jsonify({'message': 'Owner not found'}), 404
    
    # Return JSON data for React frontend
    return jsonify({
        'beehive': beehive.to_dict(),
        'owner': {
            'id': owner.id,
            'username': owner.username,
            'email': owner.email
        }
    })

# QR Code generation endpoint
@app.route('/qr/<serial_number>')
def qr_code(serial_number):
    beehive = Beehive.query.filter_by(serial_number=serial_number).first()
    if not beehive:
        return "Beehive not found", 404
    
    # Get domain configuration from environment
    domain = os.getenv('DOMAIN', 'localhost')
    protocol = os.getenv('PROTOCOL', 'http')
    port = os.getenv('PORT', '80')
    
    # Build QR URL
    if port in ['80', '443']:
        qr_url = f"{protocol}://{domain}/beehive/{beehive.qr_token}"
    else:
        qr_url = f"{protocol}://{domain}:{port}/beehive/{beehive.qr_token}"
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(qr_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    
    return send_file(img_buffer, mimetype='image/png')

# Check if setup is needed
@app.route('/api/setup/check', methods=['GET'])
def check_setup():
    """Check if admin user exists"""
    try:
        # First check if database tables exist
        try:
            user_count = User.query.count()
            if user_count == 0:
                return jsonify({'setup_needed': True}), 200
            else:
                return jsonify({'setup_needed': False}), 200
        except Exception as db_error:
            # Database tables don't exist yet
            app.logger.error(f'Database not ready for setup check: {str(db_error)}')
            return jsonify({'setup_needed': True, 'message': 'Database not ready'}), 200
    except Exception as e:
        app.logger.error(f'Setup check error: {str(e)}')
        return jsonify({'setup_needed': True, 'message': f'Error checking setup: {str(e)}'}), 200

# Setup endpoint to create admin user
@app.route('/api/setup', methods=['POST'])
def setup_admin():
    """Create admin user if no users exist - ONE TIME ONLY"""
    try:
        # Ensure database tables exist first
        try:
            db.create_all()
        except Exception as db_error:
            app.logger.error(f'Error creating database tables: {str(db_error)}')
            return jsonify({'message': 'Database initialization failed'}), 500
        
        # Check if any users exist
        try:
            existing_user = User.query.first()
            if existing_user:
                return jsonify({
                    'message': 'Setup already completed. Admin user already exists.',
                    'setup_completed': True
                }), 400
        except Exception as db_error:
            app.logger.error(f'Error checking existing users: {str(db_error)}')
            return jsonify({'message': 'Database not ready for setup'}), 500
        
        data = request.get_json()
        username = data.get('username', 'admin')
        email = data.get('email', 'admin@kbee.com')
        password = data.get('password')
        
        if not password:
            return jsonify({'message': 'Password is required'}), 400
        
        if len(password) < 6:
            return jsonify({'message': 'Password must be at least 6 characters long'}), 400
        
        # Validate username and email
        if not username or len(username) < 3:
            return jsonify({'message': 'Username must be at least 3 characters long'}), 400
        
        if not email or '@' not in email:
            return jsonify({'message': 'Valid email is required'}), 400
        
        # Create admin user
        admin = User(
            username=username,
            email=email
        )
        admin.set_password(password)
        
        db.session.add(admin)
        db.session.commit()
        
        return jsonify({
            'message': 'Admin user created successfully',
            'username': username,
            'setup_completed': True
        }), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Setup error: {str(e)}')
        return jsonify({'message': f'Error creating admin user: {str(e)}'}), 500

# PDF export endpoint
@app.route('/export_pdf/<serial_number>')
@token_required
def export_pdf(current_user_id, serial_number):
    beehive = Beehive.query.filter_by(serial_number=serial_number, user_id=current_user_id).first()
    if not beehive:
        return jsonify({'message': 'Beehive not found'}), 404
    
    # Create PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    
    # Title
    title = Paragraph("Thông tin tổ ong", styles['Title'])
    
    # Beehive info
    data = [
        ['Mã tổ:', beehive.serial_number],
        ['Ngày nhập:', beehive.import_date.strftime('%d/%m/%Y')],
        ['Ngày tách:', beehive.split_date.strftime('%d/%m/%Y') if beehive.split_date else 'Chưa tách'],
        ['Sức khỏe:', beehive.health_status],
        ['Ghi chú:', beehive.notes or 'Không có'],
    ]
    
    table = Table(data, colWidths=[4*cm, 6*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (1, 0), (1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    # Build PDF
    elements = [title, Spacer(1, 20), table]
    doc.build(elements)
    
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name=f'{beehive.serial_number}.pdf', mimetype='application/pdf')

# Database initialization endpoint
@app.route('/api/init-db', methods=['POST'])
def init_database():
    """Initialize database tables"""
    try:
        with app.app_context():
            db.create_all()
            return jsonify({'message': 'Database initialized successfully'})
    except Exception as e:
        return jsonify({'message': f'Database initialization failed: {str(e)}'}), 500

# Initialize database when app starts
def init_app():
    """Initialize database and create tables"""
    with app.app_context():
        try:
            # Create all tables
            db.create_all()
            print("✓ Database tables created successfully")
            
            # Check if any users exist, if not, we're ready for setup
            user_count = User.query.count()
            if user_count == 0:
                print("✓ Database is ready for initial setup")
            else:
                print(f"✓ Database initialized with {user_count} users")
                
        except Exception as e:
            print(f"✗ Error creating database tables: {str(e)}")
            # Don't exit, let the app run and handle errors gracefully

# Initialize database on startup
init_app()

if __name__ == '__main__':
    # Only run in debug mode if explicitly set
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
