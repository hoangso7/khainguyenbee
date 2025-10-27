"""
Error handling utilities for KBee Manager
"""

from flask import jsonify, request
from werkzeug.exceptions import HTTPException
import logging
import traceback

logger = logging.getLogger(__name__)

class KBeeError(Exception):
    """Base exception class for KBee Manager"""
    
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

class ValidationError(KBeeError):
    """Validation error"""
    
    def __init__(self, message, field=None):
        super().__init__(message, 400)
        self.field = field

class AuthenticationError(KBeeError):
    """Authentication error"""
    
    def __init__(self, message="Authentication failed"):
        super().__init__(message, 401)

class AuthorizationError(KBeeError):
    """Authorization error"""
    
    def __init__(self, message="Access denied"):
        super().__init__(message, 403)

class NotFoundError(KBeeError):
    """Resource not found error"""
    
    def __init__(self, message="Resource not found"):
        super().__init__(message, 404)

class DatabaseError(KBeeError):
    """Database error"""
    
    def __init__(self, message="Database operation failed"):
        super().__init__(message, 500)

class ExternalServiceError(KBeeError):
    """External service error"""
    
    def __init__(self, message="External service unavailable"):
        super().__init__(message, 503)

def register_error_handlers(app):
    """Register error handlers for the Flask app"""
    
    @app.errorhandler(KBeeError)
    def handle_kbee_error(error):
        """Handle custom KBee errors"""
        logger.warning(f"KBee Error: {error.message}")
        
        response = {
            'error': True,
            'message': error.message,
            'status_code': error.status_code
        }
        
        if error.payload:
            response['payload'] = error.payload
            
        return jsonify(response), error.status_code
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        """Handle validation errors"""
        logger.warning(f"Validation Error: {error.message}")
        
        response = {
            'error': True,
            'message': error.message,
            'status_code': 400,
            'type': 'validation_error'
        }
        
        if error.field:
            response['field'] = error.field
            
        return jsonify(response), 400
    
    @app.errorhandler(AuthenticationError)
    def handle_auth_error(error):
        """Handle authentication errors"""
        logger.warning(f"Authentication Error: {error.message}")
        
        return jsonify({
            'error': True,
            'message': error.message,
            'status_code': 401,
            'type': 'authentication_error'
        }), 401
    
    @app.errorhandler(AuthorizationError)
    def handle_authorization_error(error):
        """Handle authorization errors"""
        logger.warning(f"Authorization Error: {error.message}")
        
        return jsonify({
            'error': True,
            'message': error.message,
            'status_code': 403,
            'type': 'authorization_error'
        }), 403
    
    @app.errorhandler(NotFoundError)
    def handle_not_found_error(error):
        """Handle not found errors"""
        logger.warning(f"Not Found Error: {error.message}")
        
        return jsonify({
            'error': True,
            'message': error.message,
            'status_code': 404,
            'type': 'not_found_error'
        }), 404
    
    @app.errorhandler(DatabaseError)
    def handle_database_error(error):
        """Handle database errors"""
        logger.error(f"Database Error: {error.message}")
        
        return jsonify({
            'error': True,
            'message': 'Database operation failed',
            'status_code': 500,
            'type': 'database_error'
        }), 500
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        """Handle HTTP exceptions"""
        logger.warning(f"HTTP Exception: {error.code} - {error.description}")
        
        return jsonify({
            'error': True,
            'message': error.description,
            'status_code': error.code,
            'type': 'http_error'
        }), error.code
    
    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        """Handle generic exceptions"""
        logger.error(f"Unhandled Exception: {str(error)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        # Don't expose internal errors in production
        if app.config.get('FLASK_ENV') == 'production':
            message = 'Internal server error'
        else:
            message = str(error)
        
        return jsonify({
            'error': True,
            'message': message,
            'status_code': 500,
            'type': 'internal_error'
        }), 500

def handle_database_error(func):
    """Decorator to handle database errors"""
    def db_wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Database error in {func.__name__}: {str(e)}")
            raise DatabaseError("Database operation failed")
    return db_wrapper

def validation_error_handler(func):
    """Decorator to handle validation errors"""
    def validation_wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValueError as e:
            logger.warning(f"Validation error in {func.__name__}: {str(e)}")
            raise ValidationError(str(e))
        except TypeError as e:
            logger.warning(f"Type error in {func.__name__}: {str(e)}")
            raise ValidationError("Invalid data type")
    return validation_wrapper
