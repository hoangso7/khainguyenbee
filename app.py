from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import qrcode
import io
import base64
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost/kbee_manager')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

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
    id = db.Column(db.Integer, primary_key=True)
    serial_number = db.Column(db.String(50), unique=True, nullable=False)
    import_date = db.Column(db.Date, nullable=False)
    split_date = db.Column(db.Date, nullable=True)
    health_status = db.Column(db.String(20), nullable=False, default='Tốt')  # Tốt, Trung bình, Kém
    notes = db.Column(db.Text, nullable=True)
    is_sold = db.Column(db.Boolean, default=False)
    sold_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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
    if beehive.is_sold:
        return f"Trại ong KBee\nĐịa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM\nSĐT: 0123-456-789\nNgày bán: {beehive.sold_date.strftime('%d/%m/%Y')}"
    else:
        return f"Tổ ong KBee\nSố thứ tự: {beehive.serial_number}\nNgày nhập: {beehive.import_date.strftime('%d/%m/%Y')}\nSức khỏe: {beehive.health_status}\nGhi chú: {beehive.notes or 'Không có'}"

# Routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('dashboard'))
        else:
            flash('Tên đăng nhập hoặc mật khẩu không đúng!', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        if User.query.filter_by(username=username).first():
            flash('Tên đăng nhập đã tồn tại!', 'error')
            return render_template('register.html')
        
        if User.query.filter_by(email=email).first():
            flash('Email đã tồn tại!', 'error')
            return render_template('register.html')
        
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        flash('Đăng ký thành công! Vui lòng đăng nhập.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    beehives = Beehive.query.order_by(Beehive.created_at.desc()).all()
    return render_template('dashboard.html', beehives=beehives)

@app.route('/add_beehive', methods=['GET', 'POST'])
@login_required
def add_beehive():
    if request.method == 'POST':
        serial_number = request.form['serial_number']
        import_date = datetime.strptime(request.form['import_date'], '%Y-%m-%d').date()
        split_date = request.form.get('split_date')
        health_status = request.form['health_status']
        notes = request.form.get('notes', '')
        
        if Beehive.query.filter_by(serial_number=serial_number).first():
            flash('Số thứ tự tổ ong đã tồn tại!', 'error')
            return render_template('add_beehive.html')
        
        beehive = Beehive(
            serial_number=serial_number,
            import_date=import_date,
            split_date=datetime.strptime(split_date, '%Y-%m-%d').date() if split_date else None,
            health_status=health_status,
            notes=notes
        )
        
        db.session.add(beehive)
        db.session.commit()
        
        flash('Thêm tổ ong thành công!', 'success')
        return redirect(url_for('dashboard'))
    
    return render_template('add_beehive.html')

@app.route('/edit_beehive/<int:beehive_id>', methods=['GET', 'POST'])
@login_required
def edit_beehive(beehive_id):
    beehive = Beehive.query.get_or_404(beehive_id)
    
    if request.method == 'POST':
        beehive.serial_number = request.form['serial_number']
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

@app.route('/delete_beehive/<int:beehive_id>')
@login_required
def delete_beehive(beehive_id):
    beehive = Beehive.query.get_or_404(beehive_id)
    db.session.delete(beehive)
    db.session.commit()
    flash('Xóa tổ ong thành công!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/sell_beehive/<int:beehive_id>')
@login_required
def sell_beehive(beehive_id):
    beehive = Beehive.query.get_or_404(beehive_id)
    beehive.is_sold = True
    beehive.sold_date = datetime.utcnow().date()
    db.session.commit()
    flash('Đánh dấu tổ ong đã bán thành công!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/unsell_beehive/<int:beehive_id>')
@login_required
def unsell_beehive(beehive_id):
    beehive = Beehive.query.get_or_404(beehive_id)
    beehive.is_sold = False
    beehive.sold_date = None
    db.session.commit()
    flash('Hủy bán tổ ong thành công!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/qr_code/<int:beehive_id>')
@login_required
def qr_code(beehive_id):
    beehive = Beehive.query.get_or_404(beehive_id)
    qr_data = get_beehive_qr_data(beehive)
    qr_img = generate_qr_code(qr_data)
    
    return send_file(qr_img, mimetype='image/png')

@app.route('/export_qr_pdf')
@login_required
def export_qr_pdf():
    beehives = Beehive.query.all()
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        alignment=1,
        textColor=colors.HexColor('#D2691E')
    )
    title = Paragraph("Danh sách mã QR tổ ong KBee", title_style)
    story.append(title)
    story.append(Spacer(1, 20))
    
    # Create QR codes in grid
    qr_size = 3 * cm  # 3x3 cm as requested
    
    for i, beehive in enumerate(beehives):
        if i % 2 == 0:  # Start new row every 2 QR codes
            if i > 0:
                story.append(Spacer(1, 20))
        
        qr_data = get_beehive_qr_data(beehive)
        qr_img = generate_qr_code(qr_data)
        
        # Create image from QR code
        img = Image(qr_img, width=qr_size, height=qr_size)
        story.append(img)
        
        # Add beehive info below QR
        info_text = f"Số tổ: {beehive.serial_number}"
        if beehive.is_sold:
            info_text += f" (Đã bán - {beehive.sold_date.strftime('%d/%m/%Y')})"
        
        info_para = Paragraph(info_text, styles['Normal'])
        story.append(info_para)
        story.append(Spacer(1, 10))
    
    doc.build(story)
    buffer.seek(0)
    
    return send_file(buffer, as_attachment=True, download_name='beehive_qr_codes.pdf', mimetype='application/pdf')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Create default admin user if not exists
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', email='admin@kbee.com')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("Default admin user created: username=admin, password=admin123")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
