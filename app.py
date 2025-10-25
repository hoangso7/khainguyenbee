from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_file, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
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

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost/kbee_manager')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

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

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Beehive(db.Model):
    serial_number = db.Column(db.String(50), primary_key=True)  # TO001, TO002, etc.
    qr_token = db.Column(db.String(12), unique=True, nullable=False)  # Random 12-char token for QR
    import_date = db.Column(db.Date, nullable=False)
    split_date = db.Column(db.Date, nullable=True)
    health_status = db.Column(db.String(20), nullable=False, default='Tốt')  # Tốt, Trung bình, Kém
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

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Utility functions
def generate_qr_code(data):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    
    return img_buffer

def get_beehive_qr_data(beehive):
    domain = os.getenv('DOMAIN', 'localhost:5000')
    # QR code chứa token ngẫu nhiên để bảo mật
    return f"https://{domain}/beehive/{beehive.qr_token}"

# Routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    # Check if any users exist, if not redirect to setup
    if not User.query.first():
        return redirect(url_for('setup'))
    
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            login_user(user, remember=True)
            session.permanent = True
            return redirect(url_for('dashboard'))
        else:
            flash('Tên đăng nhập hoặc mật khẩu không đúng!', 'error')
    
    return render_template('login.html')

@app.route('/setup', methods=['GET', 'POST'])
def setup():
    # Only allow setup if no users exist
    if User.query.first():
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        if User.query.filter_by(username=username).first():
            flash('Tên đăng nhập đã tồn tại!', 'error')
            return render_template('setup.html')
        
        if User.query.filter_by(email=email).first():
            flash('Email đã tồn tại!', 'error')
            return render_template('setup.html')
        
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        flash('Tài khoản quản trị đã được tạo thành công! Vui lòng đăng nhập.', 'success')
        return redirect(url_for('login'))
    
    return render_template('setup.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/change-password', methods=['GET', 'POST'])
@login_required
def change_password():
    if request.method == 'POST':
        current_password = request.form['current_password']
        new_password = request.form['new_password']
        confirm_password = request.form['confirm_password']
        
        # Verify current password
        if not current_user.check_password(current_password):
            flash('Mật khẩu hiện tại không đúng!', 'error')
            return render_template('change_password.html')
        
        # Check if new password matches confirmation
        if new_password != confirm_password:
            flash('Mật khẩu mới và xác nhận mật khẩu không khớp!', 'error')
            return render_template('change_password.html')
        
        # Check password length
        if len(new_password) < 6:
            flash('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error')
            return render_template('change_password.html')
        
        # Update password
        current_user.set_password(new_password)
        db.session.commit()
        
        flash('Mật khẩu đã được thay đổi thành công!', 'success')
        return redirect(url_for('dashboard'))
    
    return render_template('change_password.html')

@app.route('/dashboard')
@login_required
def dashboard():
    # Get sorting parameters
    sort_by = request.args.get('sort', 'created_at')
    sort_order = request.args.get('order', 'desc')
    
    # Validate sort parameters
    valid_sorts = ['created_at', 'import_date', 'split_date', 'health_status', 'status']
    if sort_by not in valid_sorts:
        sort_by = 'created_at'
    
    if sort_order not in ['asc', 'desc']:
        sort_order = 'desc'
    
    # Apply sorting
    if sort_by == 'created_at':
        if sort_order == 'asc':
            beehives = Beehive.query.order_by(Beehive.created_at.asc()).all()
        else:
            beehives = Beehive.query.order_by(Beehive.created_at.desc()).all()
    elif sort_by == 'import_date':
        if sort_order == 'asc':
            beehives = Beehive.query.order_by(Beehive.import_date.asc()).all()
        else:
            beehives = Beehive.query.order_by(Beehive.import_date.desc()).all()
    elif sort_by == 'split_date':
        if sort_order == 'asc':
            beehives = Beehive.query.order_by(Beehive.split_date.asc()).all()
        else:
            beehives = Beehive.query.order_by(Beehive.split_date.desc()).all()
    elif sort_by == 'health_status':
        if sort_order == 'asc':
            beehives = Beehive.query.order_by(Beehive.health_status.asc()).all()
        else:
            beehives = Beehive.query.order_by(Beehive.health_status.desc()).all()
    elif sort_by == 'status':
        if sort_order == 'asc':
            beehives = Beehive.query.order_by(Beehive.is_sold.asc()).all()
        else:
            beehives = Beehive.query.order_by(Beehive.is_sold.desc()).all()
    
    # Get health statistics for pie chart
    health_stats = {}
    for beehive in beehives:
        health = beehive.health_status or 'Unknown'
        health_stats[health] = health_stats.get(health, 0) + 1
    
    return render_template('dashboard.html', beehives=beehives, 
                         sort_by=sort_by, sort_order=sort_order, 
                         health_stats=health_stats)

@app.route('/add_beehive', methods=['GET', 'POST'])
@login_required
def add_beehive():
    if request.method == 'POST':
        # Generate serial number and QR token automatically
        serial_number = Beehive.generate_serial_number()
        qr_token = Beehive.generate_qr_token()
        import_date = datetime.strptime(request.form['import_date'], '%Y-%m-%d').date()
        split_date = request.form.get('split_date')
        health_status = request.form['health_status']
        notes = request.form.get('notes', '')
        
        beehive = Beehive(
            serial_number=serial_number,
            qr_token=qr_token,
            import_date=import_date,
            split_date=datetime.strptime(split_date, '%Y-%m-%d').date() if split_date else None,
            health_status=health_status,
            notes=notes,
            user_id=current_user.id  # Assign to current user
        )
        
        db.session.add(beehive)
        db.session.commit()
        
        flash(f'Thêm tổ ong thành công! Mã tổ: {serial_number}', 'success')
        return redirect(url_for('dashboard'))
    
    return render_template('add_beehive.html')

@app.route('/bulk_create_beehives', methods=['GET', 'POST'])
@login_required
def bulk_create_beehives():
    if request.method == 'POST':
        try:
            count = int(request.form['count'])
            health_status = request.form.get('health_status', 'Tốt')
            notes = request.form.get('notes', '')
            
            if count <= 0 or count > 50:
                flash('Số lượng tổ ong phải từ 1 đến 50!', 'error')
                return render_template('bulk_create_beehives.html')
            
            # Generate beehives
            created_count = 0
            today = datetime.now().date()
            
            for i in range(count):
                # Generate serial number and QR token automatically
                serial_number = Beehive.generate_serial_number()
                qr_token = Beehive.generate_qr_token()
                
                beehive = Beehive(
                    serial_number=serial_number,
                    qr_token=qr_token,
                    import_date=today,
                    health_status=health_status,
                    notes=notes,
                    is_sold=False,
                    user_id=current_user.id  # Assign to current user
                )
                db.session.add(beehive)
                created_count += 1
            
            db.session.commit()
            flash(f'Đã tạo thành công {created_count} tổ ong!', 'success')
            return redirect(url_for('dashboard'))
            
        except ValueError:
            flash('Số lượng tổ ong không hợp lệ!', 'error')
        except Exception as e:
            db.session.rollback()
            flash(f'Có lỗi xảy ra: {str(e)}', 'error')
    
    return render_template('bulk_create_beehives.html')

@app.route('/edit_beehive/<serial_number>', methods=['GET', 'POST'])
@login_required
def edit_beehive(serial_number):
    beehive = Beehive.query.get_or_404(serial_number)
    
    if request.method == 'POST':
        # Don't allow changing serial_number as it's the primary key
        beehive.import_date = datetime.strptime(request.form['import_date'], '%Y-%m-%d').date()
        split_date = request.form.get('split_date')
        beehive.split_date = datetime.strptime(split_date, '%Y-%m-%d').date() if split_date else None
        beehive.health_status = request.form['health_status']
        beehive.notes = request.form.get('notes', '')
        beehive.updated_at = datetime.utcnow()
        
        db.session.commit()
        flash('Cập nhật tổ ong thành công!', 'success')
        return redirect(url_for('dashboard'))
    
    return render_template('edit_beehive.html', beehive=beehive)

@app.route('/delete_beehive/<serial_number>')
@login_required
def delete_beehive(serial_number):
    beehive = Beehive.query.get_or_404(serial_number)
    db.session.delete(beehive)
    db.session.commit()
    flash('Xóa tổ ong thành công!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/sell_beehive/<serial_number>')
@login_required
def sell_beehive(serial_number):
    beehive = Beehive.query.get_or_404(serial_number)
    beehive.is_sold = True
    beehive.sold_date = datetime.utcnow().date()
    db.session.commit()
    flash('Đánh dấu tổ ong đã bán thành công!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/unsell_beehive/<serial_number>')
@login_required
def unsell_beehive(serial_number):
    beehive = Beehive.query.get_or_404(serial_number)
    beehive.is_sold = False
    beehive.sold_date = None
    db.session.commit()
    flash('Hủy bán tổ ong thành công!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/qr_code/<serial_number>')
@login_required
def qr_code(serial_number):
    beehive = Beehive.query.get_or_404(serial_number)
    # Tạo QR data với token ngẫu nhiên
    qr_data = get_beehive_qr_data(beehive)
    qr_img = generate_qr_code(qr_data)
    
    return send_file(qr_img, mimetype='image/png')





@app.route('/kbee-info/<serial_number>')
def kbee_info(serial_number):
    """Trang thông tin KBee cho tổ ong đã bán"""
    beehive = Beehive.query.get_or_404(serial_number)
    
    # Chỉ hiển thị cho tổ ong đã bán
    if not beehive.is_sold:
        return redirect(url_for('beehive_info', serial_number=serial_number))
    
    return render_template('kbee_info.html', beehive=beehive)

@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('404.html'), 500

@app.route('/favicon.ico')
def favicon():
    return send_file('static/icon/bee.png', mimetype='image/png')

@app.route('/export_qr_pdf')
@login_required
def export_qr_pdf():
    beehives = Beehive.query.all()
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    
    # Register Vietnamese font
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    
    # Try to register a font that supports Vietnamese
    try:
        # Use DejaVu Sans which supports Vietnamese
        pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
        vietnamese_font = 'DejaVuSans'
    except:
        try:
            # Fallback to Liberation Sans
            pdfmetrics.registerFont(TTFont('LiberationSans', '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'))
            vietnamese_font = 'LiberationSans'
        except:
            # Final fallback to default font
            vietnamese_font = 'Helvetica'
    
    # Create custom styles with Vietnamese font
    styles = getSampleStyleSheet()
    
    # Title style
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName=vietnamese_font,
        fontSize=18,
        spaceAfter=30,
        alignment=1,
        textColor=colors.HexColor('#D2691E')
    )
    
    # Normal style for Vietnamese text
    normal_style = ParagraphStyle(
        'VietnameseNormal',
        parent=styles['Normal'],
        fontName=vietnamese_font,
        fontSize=10,
        spaceAfter=5
    )
    
    story = []
    
    # Title
    title = Paragraph("Danh sách mã QR tổ ong KBee", title_style)
    story.append(title)
    story.append(Spacer(1, 20))
    
    # Create QR codes in horizontal grid (5 per row)
    qr_per_row = 5  # 5 QR codes per row to save paper
    # Calculate QR size to fit 5 per row on A4 paper
    available_width = A4[0] - 4*cm  # A4 width minus margins
    qr_size = (available_width / qr_per_row) - 0.5*cm  # Leave some space between QR codes
    
    # Process beehives in batches of qr_per_row
    for i in range(0, len(beehives), qr_per_row):
        batch = beehives[i:i + qr_per_row]
        table_data = []
        
        for beehive in batch:
            # Tạo QR data với token ngẫu nhiên
            qr_data = get_beehive_qr_data(beehive)
            qr_img = generate_qr_code(qr_data)
            
            # Create image from QR code
            img = Image(qr_img, width=qr_size, height=qr_size)
            
            # Add beehive info below QR
            info_text = f"St: {beehive.serial_number}"
            if beehive.is_sold:
                info_text += f" (đã bán - {beehive.sold_date.strftime('%d/%m/%Y')})"
            
            # Create a cell with QR code and text
            cell_content = [img, Paragraph(info_text, normal_style)]
            table_data.append(cell_content)
        
        # Pad row if necessary
        while len(table_data) < qr_per_row:
            table_data.append([Spacer(1, 1), Spacer(1, 1)])  # Empty cell with spacers
        
        # Create table for this row - adjust column width for 5 QR codes
        col_width = (A4[0] - 4*cm) / qr_per_row  # Available width divided by number of columns
        table = Table([table_data], colWidths=[col_width] * qr_per_row)
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        story.append(table)
        story.append(Spacer(1, 20))
    
    doc.build(story)
    buffer.seek(0)
    
    return send_file(buffer, as_attachment=True, download_name='beehive_qr_codes.pdf', mimetype='application/pdf')


# Add routes at the end to ensure they are loaded
@app.route('/beehive/<qr_token>')
def beehive_by_token(qr_token):
    """Route xử lý QR code scanning với token ngẫu nhiên"""
    # Tìm beehive theo QR token
    beehive = Beehive.query.filter_by(qr_token=qr_token).first()
    if not beehive:
        return render_template('404.html'), 404
    
    # Lấy thông tin user sở hữu beehive
    owner = User.query.get(beehive.user_id)
    if not owner:
        return render_template('404.html'), 404
    
    # Kiểm tra xem user hiện tại có đăng nhập không
    if not current_user.is_authenticated:
        # Chưa đăng nhập - yêu cầu đăng nhập
        flash('Vui lòng đăng nhập để xem thông tin tổ ong', 'info')
        return redirect(url_for('login', next=request.url))
    
    # Kiểm tra quyền truy cập
    if current_user.id != beehive.user_id:
        # User đăng nhập không phải chủ sở hữu - trả về 404
        return render_template('404.html'), 404
    
    # Kiểm tra trạng thái tổ ong
    if beehive.is_sold:
        # Nếu đã bán, hiển thị thông tin KBee
        return render_template('kbee_info.html', beehive=beehive, owner=owner)
    else:
        # Nếu chưa bán, hiển thị thông tin chi tiết
        return render_template('beehive_detail.html', beehive=beehive, owner=owner)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    app.run(debug=True, host='0.0.0.0', port=5000)
