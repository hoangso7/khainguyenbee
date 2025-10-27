"""
Beehive management routes for KBee Manager
"""

from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import logging
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

from ..models import Beehive, User, db
from ..utils.validators import BeehiveValidator, QueryValidator
from ..utils.errors import NotFoundError, DatabaseError, ValidationError, handle_database_error, validation_error_handler
from ..utils.qr_generator import QRCodeGenerator

logger = logging.getLogger(__name__)

beehives_bp = Blueprint('beehives', __name__, url_prefix='/api')

@beehives_bp.route('/beehives', methods=['GET'])
@jwt_required()
@handle_database_error
def get_beehives():
    """Get paginated list of active beehives"""
    try:
        current_user_id = get_jwt_identity()
        
        # Validate query parameters
        query_params = {
            'page': request.args.get('page', 1, type=int),
            'per_page': request.args.get('per_page', 20, type=int),
            'sort_field': request.args.get('sort_field', 'created_at'),
            'sort_order': request.args.get('sort_order', 'desc'),
            'serialNumber': request.args.get('serialNumber', ''),
            'import_date': request.args.get('import_date', ''),
            'split_date': request.args.get('split_date', ''),
        }
        
        # Validate pagination
        pagination_params = QueryValidator.validate_pagination_params(query_params)
        
        # Validate sort parameters
        allowed_sort_fields = ['serial_number', 'created_at', 'import_date', 'split_date', 'health_status']
        sort_params = QueryValidator.validate_sort_params(query_params, allowed_sort_fields)
        
        # Build query for active beehives
        query = Beehive.query.filter_by(user_id=current_user_id, is_sold=False)
        
        # Apply serial number filter
        if query_params['serialNumber']:
            query = query.filter(Beehive.serial_number.like(f'%{query_params["serialNumber"]}%'))
        
        # Apply date filters
        if query_params['import_date']:
            try:
                import_date_obj = datetime.strptime(query_params['import_date'], '%Y-%m-%d').date()
                query = query.filter(Beehive.import_date == import_date_obj)
            except ValueError:
                pass
        
        if query_params['split_date']:
            try:
                split_date_obj = datetime.strptime(query_params['split_date'], '%Y-%m-%d').date()
                query = query.filter(Beehive.split_date == split_date_obj)
            except ValueError:
                pass
        
        # Apply sorting
        sort_field = sort_params['sort_field']
        sort_order = sort_params['sort_order']
        
        if sort_field == 'serial_number':
            query = query.order_by(Beehive.serial_number.desc() if sort_order == 'desc' else Beehive.serial_number.asc())
        elif sort_field == 'created_at':
            query = query.order_by(Beehive.created_at.desc() if sort_order == 'desc' else Beehive.created_at.asc())
        elif sort_field == 'import_date':
            query = query.order_by(Beehive.import_date.desc() if sort_order == 'desc' else Beehive.import_date.asc())
        elif sort_field == 'split_date':
            query = query.order_by(Beehive.split_date.desc() if sort_order == 'desc' else Beehive.split_date.asc())
        elif sort_field == 'health_status':
            query = query.order_by(Beehive.health_status.desc() if sort_order == 'desc' else Beehive.health_status.asc())
        
        # Pagination
        pagination = query.paginate(
            page=pagination_params['page'],
            per_page=pagination_params['per_page'],
            error_out=False
        )
        
        # Calculate health statistics
        all_active_beehives = Beehive.query.filter_by(user_id=current_user_id, is_sold=False).all()
        health_stats = {}
        for beehive in all_active_beehives:
            health = beehive.health_status or 'Unknown'
            health_stats[health] = health_stats.get(health, 0) + 1
        
        return jsonify({
            'beehives': [beehive.to_dict() for beehive in pagination.items],
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'total_pages': pagination.pages,
                'has_prev': pagination.has_prev,
                'has_next': pagination.has_next,
            },
            'health_stats': health_stats
        }), 200
        
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f'Get beehives error: {str(e)}')
        raise DatabaseError('Failed to retrieve beehives')

@beehives_bp.route('/sold-beehives', methods=['GET'])
@jwt_required()
@handle_database_error
def get_sold_beehives():
    """Get paginated list of sold beehives"""
    try:
        current_user_id = get_jwt_identity()
        
        # Validate query parameters
        query_params = {
            'page': request.args.get('page', 1, type=int),
            'per_page': request.args.get('per_page', 20, type=int),
            'sort_field': request.args.get('sort_field', 'sold_date'),
            'sort_order': request.args.get('sort_order', 'desc'),
            'serialNumber': request.args.get('serialNumber', ''),
            'import_date': request.args.get('import_date', ''),
            'sold_date': request.args.get('sold_date', ''),
        }
        
        # Validate pagination
        pagination_params = QueryValidator.validate_pagination_params(query_params)
        
        # Validate sort parameters
        allowed_sort_fields = ['serial_number', 'created_at', 'import_date', 'sold_date', 'health_status']
        sort_params = QueryValidator.validate_sort_params(query_params, allowed_sort_fields)
        
        # Build query for sold beehives
        query = Beehive.query.filter_by(user_id=current_user_id, is_sold=True)
        
        # Apply filters
        if query_params['serialNumber']:
            query = query.filter(Beehive.serial_number.like(f'%{query_params["serialNumber"]}%'))
        
        if query_params['import_date']:
            try:
                import_date_obj = datetime.strptime(query_params['import_date'], '%Y-%m-%d').date()
                query = query.filter(Beehive.import_date == import_date_obj)
            except ValueError:
                pass
        
        if query_params['sold_date']:
            try:
                sold_date_obj = datetime.strptime(query_params['sold_date'], '%Y-%m-%d').date()
                query = query.filter(Beehive.sold_date == sold_date_obj)
            except ValueError:
                pass
        
        # Apply sorting
        sort_field = sort_params['sort_field']
        sort_order = sort_params['sort_order']
        
        if sort_field == 'serial_number':
            query = query.order_by(Beehive.serial_number.desc() if sort_order == 'desc' else Beehive.serial_number.asc())
        elif sort_field == 'created_at':
            query = query.order_by(Beehive.created_at.desc() if sort_order == 'desc' else Beehive.created_at.asc())
        elif sort_field == 'import_date':
            query = query.order_by(Beehive.import_date.desc() if sort_order == 'desc' else Beehive.import_date.asc())
        elif sort_field == 'sold_date':
            query = query.order_by(Beehive.sold_date.desc() if sort_order == 'desc' else Beehive.sold_date.asc())
        elif sort_field == 'health_status':
            query = query.order_by(Beehive.health_status.desc() if sort_order == 'desc' else Beehive.health_status.asc())
        
        # Pagination
        pagination = query.paginate(
            page=pagination_params['page'],
            per_page=pagination_params['per_page'],
            error_out=False
        )
        
        return jsonify({
            'beehives': [beehive.to_dict() for beehive in pagination.items],
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'total_pages': pagination.pages,
                'has_prev': pagination.has_prev,
                'has_next': pagination.has_next,
            }
        }), 200
        
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f'Get sold beehives error: {str(e)}')
        raise DatabaseError('Failed to retrieve sold beehives')

@beehives_bp.route('/stats', methods=['GET'])
@jwt_required()
@handle_database_error
def get_stats():
    """Get beehive statistics"""
    try:
        current_user_id = get_jwt_identity()
        
        all_beehives = Beehive.query.filter_by(user_id=current_user_id).all()
        all_active_beehives = Beehive.query.filter_by(user_id=current_user_id, is_sold=False).all()
        all_sold_beehives = Beehive.query.filter_by(user_id=current_user_id, is_sold=True).all()
        
        total_beehives = len(all_beehives)
        active_beehives_count = len(all_active_beehives)
        sold_beehives_count = len(all_sold_beehives)
        healthy_beehives_count = len([b for b in all_active_beehives if b.health_status == 'Tốt'])
        
        return jsonify({
            'total': total_beehives,
            'active': active_beehives_count,
            'sold': sold_beehives_count,
            'healthy': healthy_beehives_count,
        }), 200
        
    except Exception as e:
        logger.error(f'Get stats error: {str(e)}')
        raise DatabaseError('Failed to retrieve statistics')

@beehives_bp.route('/beehives', methods=['POST'])
@jwt_required()
@validation_error_handler
@handle_database_error
def create_beehive():
    """Create a new beehive"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            raise ValidationError('No data provided')
        
        # Validate input
        validated_data = BeehiveValidator.validate_beehive_data(data)
        
        # Generate serial number and QR token
        serial_number = Beehive.generate_serial_number()
        qr_token = Beehive.generate_qr_token()
        
        beehive = Beehive(
            serial_number=serial_number,
            qr_token=qr_token,
            user_id=current_user_id,
            import_date=validated_data['import_date'],
            split_date=validated_data.get('split_date'),
            health_status=validated_data['health_status'],
            notes=validated_data.get('notes', ''),
            is_sold=False
        )
        
        db.session.add(beehive)
        db.session.commit()
        
        logger.info(f'Beehive {serial_number} created successfully by user {current_user_id}')
        
        return jsonify(beehive.to_dict()), 201
        
    except ValidationError:
        raise
    except Exception as e:
        db.session.rollback()
        logger.error(f'Create beehive error: {str(e)}')
        raise DatabaseError('Failed to create beehive')

@beehives_bp.route('/beehives/<serial_number>', methods=['GET'])
@jwt_required()
@handle_database_error
def get_beehive(serial_number):
    """Get specific beehive details"""
    try:
        current_user_id = get_jwt_identity()
        
        beehive = Beehive.query.filter_by(serial_number=serial_number, user_id=current_user_id).first()
        if not beehive:
            raise NotFoundError('Beehive not found')
        
        return jsonify(beehive.to_dict()), 200
        
    except NotFoundError:
        raise
    except Exception as e:
        logger.error(f'Get beehive error: {str(e)}')
        raise DatabaseError('Failed to retrieve beehive')

@beehives_bp.route('/beehives/<serial_number>', methods=['PUT'])
@jwt_required()
@validation_error_handler
@handle_database_error
def update_beehive(serial_number):
    """Update beehive information"""
    try:
        current_user_id = get_jwt_identity()
        
        beehive = Beehive.query.filter_by(serial_number=serial_number, user_id=current_user_id).first()
        if not beehive:
            raise NotFoundError('Beehive not found')
        
        data = request.get_json()
        if not data:
            raise ValidationError('No data provided')
        
        # Validate input
        validated_data = BeehiveValidator.validate_beehive_update_data(data)
        
        # Update fields
        if 'import_date' in validated_data:
            beehive.import_date = validated_data['import_date']
        if 'split_date' in validated_data:
            beehive.split_date = validated_data['split_date']
        if 'health_status' in validated_data:
            beehive.health_status = validated_data['health_status']
        if 'notes' in validated_data:
            beehive.notes = validated_data['notes']
        
        db.session.commit()
        
        logger.info(f'Beehive {serial_number} updated successfully by user {current_user_id}')
        
        return jsonify(beehive.to_dict()), 200
        
    except ValidationError:
        raise
    except NotFoundError:
        raise
    except Exception as e:
        db.session.rollback()
        logger.error(f'Update beehive error: {str(e)}')
        raise DatabaseError('Failed to update beehive')

@beehives_bp.route('/beehives/<serial_number>', methods=['DELETE'])
@jwt_required()
@handle_database_error
def delete_beehive(serial_number):
    """Delete beehive"""
    try:
        current_user_id = get_jwt_identity()
        
        beehive = Beehive.query.filter_by(serial_number=serial_number, user_id=current_user_id).first()
        if not beehive:
            raise NotFoundError('Beehive not found')
        
        db.session.delete(beehive)
        db.session.commit()
        
        logger.info(f'Beehive {serial_number} deleted successfully by user {current_user_id}')
        
        return jsonify({'message': 'Beehive deleted successfully'}), 200
        
    except NotFoundError:
        raise
    except Exception as e:
        db.session.rollback()
        logger.error(f'Delete beehive error: {str(e)}')
        raise DatabaseError('Failed to delete beehive')

@beehives_bp.route('/beehives/<serial_number>/sell', methods=['POST'])
@jwt_required()
@handle_database_error
def sell_beehive(serial_number):
    """Mark beehive as sold"""
    try:
        current_user_id = get_jwt_identity()
        
        beehive = Beehive.query.filter_by(serial_number=serial_number, user_id=current_user_id).first()
        if not beehive:
            raise NotFoundError('Beehive not found')
        
        beehive.is_sold = True
        beehive.sold_date = datetime.utcnow().date()
        
        db.session.commit()
        
        logger.info(f'Beehive {serial_number} marked as sold by user {current_user_id}')
        
        return jsonify(beehive.to_dict()), 200
        
    except NotFoundError:
        raise
    except Exception as e:
        db.session.rollback()
        logger.error(f'Sell beehive error: {str(e)}')
        raise DatabaseError('Failed to sell beehive')

@beehives_bp.route('/beehives/<serial_number>/unsell', methods=['POST'])
@jwt_required()
@handle_database_error
def unsell_beehive(serial_number):
    """Mark beehive as not sold"""
    try:
        current_user_id = get_jwt_identity()
        
        beehive = Beehive.query.filter_by(serial_number=serial_number, user_id=current_user_id).first()
        if not beehive:
            raise NotFoundError('Beehive not found')
        
        beehive.is_sold = False
        beehive.sold_date = None
        
        db.session.commit()
        
        logger.info(f'Beehive {serial_number} marked as not sold by user {current_user_id}')
        
        return jsonify(beehive.to_dict()), 200
        
    except NotFoundError:
        raise
    except Exception as e:
        db.session.rollback()
        logger.error(f'Unsell beehive error: {str(e)}')
        raise DatabaseError('Failed to unsell beehive')

@beehives_bp.route('/beehive/<qr_token>', methods=['GET'])
@handle_database_error
def get_beehive_by_token(qr_token):
    """Get beehive by QR token (public endpoint)"""
    try:
        beehive = Beehive.query.filter_by(qr_token=qr_token).first()
        if not beehive:
            raise NotFoundError('Beehive not found')
        
        owner = User.query.get(beehive.user_id)
        
        return jsonify({
            'beehive': beehive.to_dict(),
            'owner': {
                'id': owner.id,
                'username': owner.username,
                'email': owner.email,
            } if owner else None,
            'business_info': {
                'farm_name': owner.farm_name,
                'farm_address': owner.farm_address,
                'farm_phone': owner.farm_phone,
                'qr_show_farm_info': owner.qr_show_farm_info,
                'qr_show_owner_contact': owner.qr_show_owner_contact,
                'qr_show_beehive_history': owner.qr_show_beehive_history,
                'qr_show_health_status': owner.qr_show_health_status,
                'qr_custom_message': owner.qr_custom_message,
                'qr_footer_text': owner.qr_footer_text,
            } if owner else None
        }), 200
        
    except NotFoundError:
        raise
    except Exception as e:
        logger.error(f'Get beehive by token error: {str(e)}')
        raise DatabaseError('Failed to retrieve beehive information')

@beehives_bp.route('/qr/<serial_number>')
@jwt_required()
def qr_code(serial_number):
    """Generate QR code for beehive"""
    try:
        current_user_id = get_jwt_identity()
        
        beehive = Beehive.query.filter_by(serial_number=serial_number, user_id=current_user_id).first()
        if not beehive:
            raise NotFoundError('Beehive not found')
        
        return QRCodeGenerator.generate_qr_response(beehive.qr_token)
        
    except NotFoundError:
        raise
    except Exception as e:
        logger.error(f'QR code generation error: {str(e)}')
        raise DatabaseError('Failed to generate QR code')

@beehives_bp.route('/export_pdf/<serial_number>')
@jwt_required()
@handle_database_error
def export_pdf(serial_number):
    """Export beehive information as PDF"""
    try:
        current_user_id = get_jwt_identity()
        
        beehive = Beehive.query.filter_by(serial_number=serial_number, user_id=current_user_id).first()
        if not beehive:
            raise NotFoundError('Beehive not found')
        
        # Create PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        
        # Title
        title = Paragraph("Thông tin tổ ong", styles['Title'])
        
        # Beehive info
        data = [
            ['Mã tổ:', beehive.serial_number],
            ['Ngày nhập:', beehive.import_date.strftime('%d/%m/%Y')],
            ['Ngày tách:', beehive.split_date.strftime('%d/%m/%Y') if beehive.split_date else 'Chưa tách'],
            ['Sức khỏe:', beehive.health_status],
            ['Ghi chú:', beehive.notes or 'Không có'],
        ]
        
        table = Table(data, colWidths=[4*cm, 6*cm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (1, 0), (1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        # Build PDF
        elements = [title, Spacer(1, 20), table]
        doc.build(elements)
        
        buffer.seek(0)
        
        logger.info(f'PDF exported for beehive {serial_number} by user {current_user_id}')
        
        return send_file(buffer, as_attachment=True, download_name=f'{beehive.serial_number}.pdf', mimetype='application/pdf')
        
    except NotFoundError:
        raise
    except Exception as e:
        logger.error(f'PDF export error: {str(e)}')
        raise DatabaseError('Failed to export PDF')
