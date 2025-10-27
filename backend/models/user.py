"""
User model for KBee Manager
"""

from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# Create a shared db instance
db = SQLAlchemy()

class User(UserMixin, db.Model):
    """User model for authentication and business information"""
    
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
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
    
    # Relationships
    beehives = db.relationship('Beehive', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Set password hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user to dictionary for API responses"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'farmName': self.farm_name,
            'farmAddress': self.farm_address,
            'farmPhone': self.farm_phone,
            'qrDisplaySettings': {
                'showFarmInfo': self.qr_show_farm_info,
                'showOwnerContact': self.qr_show_owner_contact,
                'showBeehiveHistory': self.qr_show_beehive_history,
                'showHealthStatus': self.qr_show_health_status,
                'customMessage': self.qr_custom_message,
                'footerText': self.qr_footer_text,
            },
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }
    
    def __repr__(self):
        return f'<User {self.username}>'
