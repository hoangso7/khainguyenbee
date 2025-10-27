"""
KBee Manager - Main Application
Refactored with modular architecture
"""

import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Import configuration
from backend.config import config

# Import models to initialize database
from backend.models import User, Beehive, db

# Import routes
from backend.routes import auth_bp, beehives_bp

# Import error handlers
from backend.utils.errors import register_error_handlers

def create_app(config_name=None):
    """Application factory pattern"""
    
    # Determine configuration
    config_name = config_name or os.getenv('FLASK_ENV', 'default')
    app_config = config.get(config_name, config['default'])
    
    # Create Flask app
    app = Flask(__name__)
    app.config.from_object(app_config)
    
    # Initialize extensions
    db.init_app(app)
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # Initialize CORS with improved security
    CORS(app, origins=app_config.CORS_ORIGINS)
    
    # Initialize rate limiting
    limiter = Limiter(
        app,
        key_func=get_remote_address,
        default_limits=[app_config.RATE_LIMIT_DEFAULT] if app_config.RATE_LIMIT_ENABLED else []
    )
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(beehives_bp)
    
    # Configure logging
    if not app.debug and not app.testing:
        # Create logs directory if it doesn't exist
        logs_dir = '/app/logs'
        os.makedirs(logs_dir, exist_ok=True)
        
        # Configure file handler for errors
        file_handler = RotatingFileHandler(
            os.path.join(logs_dir, 'error.log'),
            maxBytes=10240000,  # 10MB
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.ERROR)
        app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('KBee Manager startup')
    
    # Root route for health check
    @app.route('/')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'KBee Manager API is running',
            'version': '2.0.0',
            'environment': app_config.FLASK_ENV
        })
    
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
    
    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    # Only run in debug mode if explicitly set
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
