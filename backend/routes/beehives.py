"""
Beehive management routes for KBee Manager
"""

from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from datetime import datetime
import logging
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether
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
            'notes': request.args.get('notes', ''),
        }
        
        # Validate pagination
        pagination_params = QueryValidator.validate_pagination_params(query_params)
        
        # Validate sort parameters
        allowed_sort_fields = ['serial_number', 'created_at', 'import_date', 'split_date', 'health_status']
        sort_params = QueryValidator.validate_sort_params(query_params, allowed_sort_fields)
        
        # Build query for active beehives
        query = Beehive.query.filter_by(user_id=current_user_id, is_sold=False)
        
        # Apply filters with OR logic for general search
        from sqlalchemy import or_
        
        # If both serialNumber and notes are provided, use OR logic
        if query_params['serialNumber'] and query_params['notes']:
            query = query.filter(or_(
                Beehive.serial_number.like(f'%{query_params["serialNumber"]}%'),
                Beehive.notes.like(f'%{query_params["notes"]}%')
            ))
        elif query_params['serialNumber']:
            query = query.filter(Beehive.serial_number.like(f'%{query_params["serialNumber"]}%'))
        elif query_params['notes']:
            query = query.filter(Beehive.notes.like(f'%{query_params["notes"]}%'))
        
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
            'notes': request.args.get('notes', ''),
        }
        
        # Validate pagination
        pagination_params = QueryValidator.validate_pagination_params(query_params)
        
        # Validate sort parameters
        allowed_sort_fields = ['serial_number', 'created_at', 'import_date', 'sold_date', 'health_status']
        sort_params = QueryValidator.validate_sort_params(query_params, allowed_sort_fields)
        
        # Build query for sold beehives
        query = Beehive.query.filter_by(user_id=current_user_id, is_sold=True)
        
        # Apply filters with OR logic for general search
        from sqlalchemy import or_
        
        # If both serialNumber and notes are provided, use OR logic
        if query_params['serialNumber'] and query_params['notes']:
            query = query.filter(or_(
                Beehive.serial_number.like(f'%{query_params["serialNumber"]}%'),
                Beehive.notes.like(f'%{query_params["notes"]}%')
            ))
        elif query_params['serialNumber']:
            query = query.filter(Beehive.serial_number.like(f'%{query_params["serialNumber"]}%'))
        elif query_params['notes']:
            query = query.filter(Beehive.notes.like(f'%{query_params["notes"]}%'))
        
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
def get_beehive_by_token(qr_token):
    """Get beehive by QR token (public endpoint with admin privileges)"""
    try:
        beehive = Beehive.query.filter_by(qr_token=qr_token).first()
        if not beehive:
            raise NotFoundError('Beehive not found')
        
        owner = User.query.get(beehive.user_id)
        
        # Check if user is authenticated and is the owner
        is_admin = False
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            is_admin = (current_user_id == beehive.user_id)
        except:
            # User not authenticated, that's okay for public view
            pass
        
        response_data = {
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
            } if owner else None,
            'is_admin': is_admin  # Add admin flag for frontend
        }
        
        return jsonify(response_data), 200
        
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

@beehives_bp.route('/export_bulk_qr_pdf', methods=['POST'])
@jwt_required()
def export_bulk_qr_pdf():
    """Export multiple beehives with QR codes as PDF in 5x5 grid layout"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'serial_numbers' not in data:
            raise ValidationError('Serial numbers required')
        
        serial_numbers = data['serial_numbers']
        
        # Get all beehives for the user
        beehives = Beehive.query.filter_by(user_id=current_user_id).filter(
            Beehive.serial_number.in_(serial_numbers)
        ).all()
        
        if not beehives:
            raise NotFoundError('No beehives found')
        
        # Create PDF with QR codes
        buffer = io.BytesIO()
        # Set margins to 1.5cm on all sides
        doc = SimpleDocTemplate(buffer, pagesize=A4, 
                               leftMargin=1.5*cm, rightMargin=1.5*cm,
                               topMargin=1.5*cm, bottomMargin=1.5*cm)
        styles = getSampleStyleSheet()
        
        # QR code dimensions for 5x5 grid on A4
        # A4 is 210mm x 297mm, usable area: 180mm x 267mm with margins
        qr_size = 3.0*cm  # 3cm for QR code
        cell_width = 3.6*cm  # Each cell is 3.6cm wide
        cell_height = 5.3*cm  # Each cell is 5.3cm tall
        
        # Process beehives in batches of 25
        elements = []
        page_count = (len(beehives) + 24) // 25  # Ceiling division
        
        for page_idx in range(page_count):
            # Get 25 beehives for this page
            start_idx = page_idx * 25
            end_idx = min(start_idx + 25, len(beehives))
            page_beehives = beehives[start_idx:end_idx]
            
            # Generate QR codes for this page
            qr_cells = []
            for beehive in page_beehives:
                try:
                    # Get QR code image
                    qr_buffer = QRCodeGenerator.generate_qr_image(beehive.qr_token)
                    qr_img = RLImage(qr_buffer, width=qr_size, height=qr_size)
                    
                    # Create cell with QR code centered and serial number below
                    cell_elements = [
                        qr_img,
                        Spacer(1, 0.05*cm),
                        Paragraph(f'<para align="center"><font size="8"><b>{beehive.serial_number}</b></font></para>', styles['Normal'])
                    ]
                    
                    qr_cells.append(KeepTogether(cell_elements))
                except Exception as e:
                    logger.error(f'Error generating QR for {beehive.serial_number}: {str(e)}')
                    # Fallback: just show serial number
                    qr_cells.append(Paragraph(f'<para align="center"><b>{beehive.serial_number}</b></para>', styles['Normal']))
            
            # Fill remaining slots with empty cells if needed
            while len(qr_cells) < 25:
                empty_para = Paragraph('<para align="center"></para>', styles['Normal'])
                qr_cells.append(empty_para)
            
            # Create 5x5 grid table
            grid_data = []
            for row in range(5):
                row_data = []
                for col in range(5):
                    idx = row * 5 + col
                    row_data.append(qr_cells[idx])
                grid_data.append(row_data)
            
            # Create the 5x5 grid table
            grid_table = Table(grid_data, colWidths=[cell_width]*5, rowHeights=[cell_height]*5)
            grid_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('GRID', (0, 0), (-1, -1), 0.3, colors.grey),
                ('LEFTPADDING', (0, 0), (-1, -1), 1),
                ('RIGHTPADDING', (0, 0), (-1, -1), 1),
                ('TOPPADDING', (0, 0), (-1, -1), 1),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
            ]))
            
            elements.append(grid_table)
        
        doc.build(elements)
        buffer.seek(0)
        
        filename = f'QR_to_ong_{datetime.utcnow().strftime("%Y%m%d_%H%M%S")}.pdf'
        
        logger.info(f'Bulk QR PDF exported for {len(beehives)} beehives by user {current_user_id}')
        
        return send_file(buffer, as_attachment=True, download_name=filename, mimetype='application/pdf')
        
    except ValidationError:
        raise
    except NotFoundError:
        raise
    except Exception as e:
        logger.error(f'Bulk QR PDF export error: {str(e)}')
        raise DatabaseError('Failed to export bulk QR PDF')
