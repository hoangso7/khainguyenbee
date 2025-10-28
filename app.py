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
    CORS(app, 
         origins=app_config.CORS_ORIGINS,
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'],
         supports_credentials=True)
    
    # Initialize rate limiting with Redis storage (fallback to memory if Redis unavailable)
    try:
        limiter = Limiter(
            key_func=get_remote_address,
            app=app,
            storage_uri="redis://kbee_redis:6379",
            default_limits=[app_config.RATE_LIMIT_DEFAULT] if app_config.RATE_LIMIT_ENABLED else [],
            strategy="fixed-window",
            swallow_errors=True
        )
        app.logger.info("Rate limiting initialized with Redis storage")
    except Exception as e:
        # Fallback to memory storage if Redis is unavailable
        app.logger.warning(f"Redis unavailable for rate limiting ({e}), falling back to memory storage")
        limiter = Limiter(
            key_func=get_remote_address,
            app=app,
            storage_uri="memory://",
            default_limits=[app_config.RATE_LIMIT_DEFAULT] if app_config.RATE_LIMIT_ENABLED else [],
            strategy="fixed-window",
            swallow_errors=True
        )
    
    # Register error handlers
    register_error_handlers(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(beehives_bp)
    
    # Configure logging
    if not app.debug and not app.testing:
        # Clear existing handlers to avoid duplicates
        app.logger.handlers.clear()
        
        try:
            # Create logs directory if it doesn't exist
            logs_dir = '/app/logs'
            os.makedirs(logs_dir, exist_ok=True)
            
            # Ensure the log file is writable
            log_file_path = os.path.join(logs_dir, 'error.log')
            if os.path.exists(log_file_path):
                os.chmod(log_file_path, 0o644)
            
            # Configure file handler for errors
            file_handler = RotatingFileHandler(
                log_file_path,
                maxBytes=10240000,  # 10MB
                backupCount=10
            )
            file_handler.setFormatter(logging.Formatter(
                '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
            ))
            file_handler.setLevel(logging.ERROR)
            app.logger.addHandler(file_handler)
            
            app.logger.setLevel(logging.INFO)
            app.logger.info('KBee Manager startup with file logging')
            
        except (PermissionError, OSError) as e:
            # Fallback to console logging if file logging fails
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(logging.Formatter(
                '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
            ))
            console_handler.setLevel(logging.ERROR)
            app.logger.addHandler(console_handler)
            
            app.logger.setLevel(logging.INFO)
            app.logger.warning(f'File logging failed ({e}), using console logging')
            app.logger.info('KBee Manager startup with console logging')

    # Root route for health check
    @app.route('/')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'KBee Manager API is running',
            'version': '2.0.0',
            'environment': app_config.FLASK_ENV
        })
    
    # Public beehive route (without /api prefix)
    @app.route('/beehive/<qr_token>', methods=['GET'])
    def get_beehive_by_token_public(qr_token):
        """Public endpoint to get beehive by QR token"""
        from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
        from backend.models import Beehive
        from backend.utils.errors import NotFoundError
        
        try:
            beehive = Beehive.query.filter_by(qr_token=qr_token).first()
            if not beehive:
                raise NotFoundError('Beehive not found')
            
            # Check if user is authenticated admin
            is_admin = False
            try:
                verify_jwt_in_request()
                current_user_id = get_jwt_identity()
                if current_user_id and beehive.user_id == current_user_id:
                    is_admin = True
            except:
                # User not authenticated, that's okay for public view
                pass
            
            return jsonify({
                'beehive': beehive.to_dict(),
                'is_admin': is_admin
            })
            
        except Exception as e:
            app.logger.error(f'Error getting beehive by token: {str(e)}')
            raise NotFoundError('Beehive not found')
        
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

    return app

def init_db_on_startup(app):
    """Initialize database and create tables on app startup."""
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

# Create app instance
app = create_app()

# Initialize database on startup
init_db_on_startup(app)

if __name__ == '__main__':
    # Only run in debug mode if explicitly set
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
