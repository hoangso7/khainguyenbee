"""
Configuration management for KBee Manager
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Session Configuration
    PERMANENT_SESSION_LIFETIME = timedelta(days=30)
    SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost/kbee_manager')
    
    # Domain Configuration
    DOMAIN = os.getenv('DOMAIN', 'localhost')
    PROTOCOL = os.getenv('PROTOCOL', 'http')
    PORT = os.getenv('PORT', '80')
    
    # CORS Configuration - Improved Security
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '').split(',') if os.getenv('CORS_ORIGINS') else [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080',
        'https://localhost:8443',
    ]
    
    # Add production domains if they exist
    if os.getenv('DOMAIN'):
        domain = os.getenv('DOMAIN')
        protocol = os.getenv('PROTOCOL', 'https')
        CORS_ORIGINS.extend([
            f'{protocol}://{domain}',
            f'{protocol}://www.{domain}',
            f'http://{domain}:8080',
            f'https://{domain}:8443',
        ])
    
    # Remove empty strings and duplicates
    CORS_ORIGINS = list(set(filter(None, CORS_ORIGINS)))
    
    # Security Configuration
    RATE_LIMIT_ENABLED = False
    RATE_LIMIT_DEFAULT = os.getenv('RATE_LIMIT_DEFAULT', '1000 per hour')
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # File Upload Configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # JWT Configuration
    JWT_SECRET_KEY = SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    JWT_ALGORITHM = 'HS256'

class DevelopmentConfig(Config):
    """Development configuration"""
    
    DEBUG = True
    FLASK_ENV = 'development'
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost/kbee_manager_dev')
    SESSION_COOKIE_SECURE = False  # Allow HTTP in development

class ProductionConfig(Config):
    """Production configuration"""
    
    DEBUG = False
    FLASK_ENV = 'production'
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Strict'
    
    # Enhanced security for production
    CORS_ORIGINS = [
        f'https://{os.getenv("DOMAIN", "localhost")}',
        f'https://www.{os.getenv("DOMAIN", "localhost")}',
    ]

class TestingConfig(Config):
    """Testing configuration"""
    
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
