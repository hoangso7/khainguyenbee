"""
Beehive model for KBee Manager
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import secrets
import string

# Import the shared db instance
from .user import db

class Beehive(db.Model):
    """Beehive model for managing beehive information"""
    
    __tablename__ = 'beehive'
    
    serial_number = db.Column(db.String(50), primary_key=True)  # TO001, TO002, etc.
    qr_token = db.Column(db.String(12), unique=True, nullable=False, index=True)  # Random 12-char token for QR
    import_date = db.Column(db.Date, nullable=False, index=True)
    split_date = db.Column(db.Date, nullable=True, index=True)
    health_status = db.Column(db.String(20), nullable=False, default='Tốt', index=True)  # Tốt, Yếu
    species = db.Column(db.String(20), nullable=False, default='Furva Vàng', index=True)
    notes = db.Column(db.Text, nullable=True)
    is_sold = db.Column(db.Boolean, default=False, index=True)
    sold_date = db.Column(db.Date, nullable=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)  # Owner of beehive
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
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
            'species': self.species,
            'notes': self.notes,
            'is_sold': self.is_sold,
            'sold_date': self.sold_date.isoformat() if self.sold_date else None,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def __repr__(self):
        return f'<Beehive {self.serial_number}>'
