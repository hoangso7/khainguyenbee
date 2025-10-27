"""
QR Code generation utilities for KBee Manager
"""

import qrcode
import io
import os
from flask import send_file
from typing import Optional
from .errors import ExternalServiceError

class QRCodeGenerator:
    """QR Code generation utility"""
    
    @staticmethod
    def generate_qr_url(qr_token: str, domain: Optional[str] = None, protocol: Optional[str] = None, port: Optional[str] = None) -> str:
        """Generate QR code URL for beehive"""
        domain = domain or os.getenv('DOMAIN', 'localhost')
        protocol = protocol or os.getenv('PROTOCOL', 'http')
        port = port or os.getenv('PORT', '80')
        
        # Build QR URL
        if port in ['80', '443']:
            qr_url = f"{protocol}://{domain}/beehive/{qr_token}"
        else:
            qr_url = f"{protocol}://{domain}:{port}/beehive/{qr_token}"
        
        return qr_url
    
    @staticmethod
    def generate_qr_image(qr_token: str, domain: Optional[str] = None, protocol: Optional[str] = None, port: Optional[str] = None) -> io.BytesIO:
        """Generate QR code image"""
        try:
            qr_url = QRCodeGenerator.generate_qr_url(qr_token, domain, protocol, port)
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                box_size=10,
                border=5,
                error_correction=qrcode.constants.ERROR_CORRECT_L
            )
            qr.add_data(qr_url)
            qr.make(fit=True)
            
            # Create image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to bytes
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='PNG')
            img_buffer.seek(0)
            
            return img_buffer
            
        except Exception as e:
            raise ExternalServiceError(f"Failed to generate QR code: {str(e)}")
    
    @staticmethod
    def generate_qr_response(qr_token: str, domain: Optional[str] = None, protocol: Optional[str] = None, port: Optional[str] = None):
        """Generate QR code response for Flask"""
        img_buffer = QRCodeGenerator.generate_qr_image(qr_token, domain, protocol, port)
        return send_file(img_buffer, mimetype='image/png')
    
    @staticmethod
    def generate_qr_base64(qr_token: str, domain: Optional[str] = None, protocol: Optional[str] = None, port: Optional[str] = None) -> str:
        """Generate QR code as base64 string"""
        import base64
        
        img_buffer = QRCodeGenerator.generate_qr_image(qr_token, domain, protocol, port)
        img_data = img_buffer.getvalue()
        img_base64 = base64.b64encode(img_data).decode('utf-8')
        
        return f"data:image/png;base64,{img_base64}"
