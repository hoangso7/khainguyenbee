"""
Authentication routes for KBee Manager
"""

from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import logging

from ..models.user import User, db
from ..utils.validators import UserValidator
from ..utils.errors import AuthenticationError, ValidationError, NotFoundError, DatabaseError, handle_database_error, validation_error_handler

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        if not data:
            raise ValidationError('No data provided')
        
        # Validate input
        validated_data = UserValidator.validate_login_data(data)
        
        # Check database connection
        try:
            user = User.query.filter_by(username=validated_data['username']).first()
        except Exception as db_error:
            logger.error(f'Database error during login: {str(db_error)}')
            raise DatabaseError('Database not ready. Please try again.')
        
        if user and user.check_password(validated_data['password']):
            # Create JWT token
            token = create_access_token(
                identity=user.id,
                expires_delta=timedelta(days=30)
            )
            
            logger.info(f'User {user.username} logged in successfully')
            
            return jsonify({
                'token': token,
                'user': user.to_dict()
            }), 200
        
        logger.warning(f'Failed login attempt for username: {validated_data["username"]}')
        raise AuthenticationError('Invalid credentials')
        
    except ValidationError:
        raise
    except AuthenticationError:
        raise
    except DatabaseError:
        raise
    except Exception as e:
        logger.error(f'Login error: {str(e)}')
        raise AuthenticationError('Login failed')

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            raise NotFoundError('User not found')
        
        return jsonify(user.to_dict()), 200
        
    except NotFoundError:
        raise
    except Exception as e:
        logger.error(f'Get current user error: {str(e)}')
        raise DatabaseError('Failed to get user information')

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """User logout endpoint"""
    try:
        # JWT tokens are stateless, so we just return success
        # In a more secure implementation, you might want to blacklist the token
        logger.info(f'User {get_jwt_identity()} logged out')
        
        return jsonify({'message': 'Logged out successfully'}), 200
        
    except Exception as e:
        logger.error(f'Logout error: {str(e)}')
        raise AuthenticationError('Logout failed')

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            raise NotFoundError('User not found')
        
        data = request.get_json()
        if not data:
            raise ValidationError('No data provided')
        
        # Validate input
        validated_data = UserValidator.validate_profile_update_data(data)
        
        # Update user fields
        if 'username' in validated_data:
            # Check if username is already taken by another user
            existing_user = User.query.filter(
                User.username == validated_data['username'],
                User.id != user_id
            ).first()
            if existing_user:
                raise ValidationError('Username already taken', field='username')
            user.username = validated_data['username']
        
        if 'email' in validated_data:
            # Check if email is already taken by another user
            existing_user = User.query.filter(
                User.email == validated_data['email'],
                User.id != user_id
            ).first()
            if existing_user:
                raise ValidationError('Email already taken', field='email')
            user.email = validated_data['email']
        
        if 'password' in validated_data:
            user.set_password(validated_data['password'])
        
        if 'farmName' in validated_data:
            user.farm_name = validated_data['farmName']
        
        if 'farmAddress' in validated_data:
            user.farm_address = validated_data['farmAddress']
        
        if 'farmPhone' in validated_data:
            user.farm_phone = validated_data['farmPhone']
        
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
        
        # Save changes
        db.session.commit()
        
        logger.info(f'User {user.username} profile updated successfully')
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except ValidationError:
        raise
    except NotFoundError:
        raise
    except Exception as e:
        db.session.rollback()
        logger.error(f'Profile update error: {str(e)}')
        raise DatabaseError('Failed to update profile')

@auth_bp.route('/setup/check', methods=['GET'])
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
            logger.error(f'Database not ready for setup check: {str(db_error)}')
            return jsonify({'setup_needed': True, 'message': 'Database not ready'}), 200
            
    except Exception as e:
        logger.error(f'Setup check error: {str(e)}')
        return jsonify({'setup_needed': True, 'message': f'Error checking setup: {str(e)}'}), 200

@auth_bp.route('/setup', methods=['POST'])
def setup_admin():
    """Create admin user if no users exist - ONE TIME ONLY"""
    try:
        # Ensure database tables exist first
        try:
            db.create_all()
        except Exception as db_error:
            logger.error(f'Error creating database tables: {str(db_error)}')
            raise DatabaseError('Database initialization failed')
        
        # Check if any users exist
        try:
            existing_user = User.query.first()
            if existing_user:
                return jsonify({
                    'message': 'Setup already completed. Admin user already exists.',
                    'setup_completed': True
                }), 400
        except Exception as db_error:
            logger.error(f'Error checking existing users: {str(db_error)}')
            raise DatabaseError('Database not ready for setup')
        
        data = request.get_json()
        if not data:
            raise ValidationError('No data provided')
        
        # Validate input
        validated_data = UserValidator.validate_registration_data(data)
        
        # Create admin user
        admin = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        admin.set_password(validated_data['password'])
        
        db.session.add(admin)
        db.session.commit()
        
        logger.info(f'Admin user {admin.username} created successfully')
        
        return jsonify({
            'message': 'Admin user created successfully',
            'username': admin.username,
            'setup_completed': True
        }), 201
        
    except ValidationError:
        raise
    except DatabaseError:
        raise
    except Exception as e:
        db.session.rollback()
        logger.error(f'Setup error: {str(e)}')
        raise DatabaseError(f'Error creating admin user: {str(e)}')
