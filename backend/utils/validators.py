"""
Input validation utilities for KBee Manager
"""

import re
from datetime import datetime, date
from typing import Any, Dict, List, Optional
from .errors import ValidationError

class Validator:
    """Base validator class"""
    
    @staticmethod
    def validate_required(data: Dict[str, Any], fields: List[str]) -> None:
        """Validate required fields"""
        for field in fields:
            if field not in data or data[field] is None or data[field] == '':
                raise ValidationError(f"Trường '{field}' là bắt buộc", field=field)
    
    @staticmethod
    def validate_string(data: Dict[str, Any], field: str, min_length: int = 1, max_length: int = 255) -> str:
        """Validate string field"""
        if field not in data:
            raise ValidationError(f"Trường '{field}' là bắt buộc", field=field)
        
        value = data[field]
        if not isinstance(value, str):
            raise ValidationError(f"Trường '{field}' phải là chuỗi ký tự", field=field)
        
        if len(value) < min_length:
            raise ValidationError(f"Trường '{field}' phải có ít nhất {min_length} ký tự", field=field)
        
        if len(value) > max_length:
            raise ValidationError(f"Trường '{field}' không được quá {max_length} ký tự", field=field)
        
        return value.strip()
    
    @staticmethod
    def validate_email(data: Dict[str, Any], field: str) -> str:
        """Validate email field"""
        email = Validator.validate_string(data, field, min_length=5, max_length=120)
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            raise ValidationError(f"Trường '{field}' phải là địa chỉ email hợp lệ", field=field)
        
        return email.lower()
    
    @staticmethod
    def validate_password(data: Dict[str, Any], field: str, min_length: int = 6) -> str:
        """Validate password field"""
        password = Validator.validate_string(data, field, min_length=min_length, max_length=128)
        
        # Check for common weak passwords
        weak_passwords = ['password', '123456', 'admin', 'qwerty', 'abc123']
        if password.lower() in weak_passwords:
            raise ValidationError(f"Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn", field=field)
        
        return password
    
    @staticmethod
    def validate_date(data: Dict[str, Any], field: str, allow_future: bool = True) -> date:
        """Validate date field"""
        if field not in data:
            raise ValidationError(f"Trường '{field}' là bắt buộc", field=field)
        
        value = data[field]
        if not value:
            return None
        
        try:
            if isinstance(value, str):
                parsed_date = datetime.strptime(value, '%Y-%m-%d').date()
            elif isinstance(value, date):
                parsed_date = value
            else:
                raise ValidationError(f"Trường '{field}' phải là ngày hợp lệ", field=field)
            
            if not allow_future and parsed_date > date.today():
                raise ValidationError(f"Trường '{field}' không thể là ngày trong tương lai", field=field)
            
            return parsed_date
        except ValueError:
            raise ValidationError(f"Trường '{field}' phải có định dạng YYYY-MM-DD", field=field)
    
    @staticmethod
    def validate_choice(data: Dict[str, Any], field: str, choices: List[str]) -> str:
        """Validate choice field"""
        if field not in data:
            raise ValidationError(f"Trường '{field}' là bắt buộc", field=field)
        
        value = data[field]
        if not isinstance(value, str):
            raise ValidationError(f"Trường '{field}' phải là chuỗi ký tự", field=field)
        
        if value not in choices:
            raise ValidationError(f"Trường '{field}' phải là một trong: {', '.join(choices)}", field=field)
        
        return value
    
    @staticmethod
    def validate_boolean(data: Dict[str, Any], field: str, default: bool = False) -> bool:
        """Validate boolean field"""
        if field not in data:
            return default
        
        value = data[field]
        if isinstance(value, bool):
            return value
        elif isinstance(value, str):
            return value.lower() in ['true', '1', 'yes', 'on']
        elif isinstance(value, int):
            return bool(value)
        else:
            raise ValidationError(f"Trường '{field}' phải là giá trị boolean", field=field)
    
    @staticmethod
    def validate_integer(data: Dict[str, Any], field: str, min_value: Optional[int] = None, max_value: Optional[int] = None) -> int:
        """Validate integer field"""
        if field not in data:
            raise ValidationError(f"Trường '{field}' là bắt buộc", field=field)
        
        value = data[field]
        try:
            int_value = int(value)
        except (ValueError, TypeError):
            raise ValidationError(f"Trường '{field}' phải là số nguyên", field=field)
        
        if min_value is not None and int_value < min_value:
            raise ValidationError(f"Trường '{field}' phải có giá trị ít nhất {min_value}", field=field)
        
        if max_value is not None and int_value > max_value:
            raise ValidationError(f"Trường '{field}' không được quá {max_value}", field=field)
        
        return int_value

class UserValidator:
    """User-specific validators"""
    
    @staticmethod
    def validate_login_data(data: Dict[str, Any]) -> Dict[str, str]:
        """Validate login data"""
        Validator.validate_required(data, ['username', 'password'])
        
        username = Validator.validate_string(data, 'username', min_length=3, max_length=80)
        password = Validator.validate_string(data, 'password', min_length=1, max_length=128)
        
        return {
            'username': username,
            'password': password
        }
    
    @staticmethod
    def validate_registration_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate registration data"""
        Validator.validate_required(data, ['username', 'email', 'password'])
        
        username = Validator.validate_string(data, 'username', min_length=3, max_length=80)
        email = Validator.validate_email(data, 'email')
        password = Validator.validate_password(data, 'password', min_length=6)
        
        # Validate username format (alphanumeric and underscores only)
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            raise ValidationError("Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới", field='username')
        
        return {
            'username': username,
            'email': email,
            'password': password
        }
    
    @staticmethod
    def validate_profile_update_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate profile update data"""
        validated_data = {}
        
        if 'username' in data:
            validated_data['username'] = Validator.validate_string(data, 'username', min_length=3, max_length=80)
            if not re.match(r'^[a-zA-Z0-9_]+$', validated_data['username']):
                raise ValidationError("Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới", field='username')
        
        if 'email' in data:
            validated_data['email'] = Validator.validate_email(data, 'email')
        
        if 'password' in data and data['password']:
            validated_data['password'] = Validator.validate_password(data, 'password', min_length=6)
        
        if 'farmName' in data:
            validated_data['farmName'] = Validator.validate_string(data, 'farmName', min_length=1, max_length=200)
        
        if 'farmAddress' in data:
            validated_data['farmAddress'] = Validator.validate_string(data, 'farmAddress', min_length=1, max_length=1000)
        
        if 'farmPhone' in data:
            phone = Validator.validate_string(data, 'farmPhone', min_length=1, max_length=20)
            # Basic phone validation - allow dots, spaces, dashes, parentheses
            if not re.match(r'^[\+]?[0-9\s\-\(\)\.]+$', phone):
                raise ValidationError("Số điện thoại chứa ký tự không hợp lệ", field='farmPhone')
            validated_data['farmPhone'] = phone
        
        return validated_data

class BeehiveValidator:
    """Beehive-specific validators"""
    
    @staticmethod
    def validate_beehive_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate beehive creation/update data"""
        Validator.validate_required(data, ['import_date'])
        
        validated_data = {}
        
        # Import date is required
        validated_data['import_date'] = Validator.validate_date(data, 'import_date', allow_future=False)
        
        # Split date is optional
        if 'split_date' in data and data['split_date']:
            validated_data['split_date'] = Validator.validate_date(data, 'split_date', allow_future=False)
            
            # Split date should be after import date
            if validated_data['split_date'] < validated_data['import_date']:
                raise ValidationError("Ngày tách đàn phải sau ngày nhập", field='split_date')
        
        # Health status validation
        health_choices = ['Tốt', 'Bình thường', 'Yếu']
        validated_data['health_status'] = Validator.validate_choice(data, 'health_status', health_choices)
        
        # Notes validation
        if 'notes' in data:
            if data['notes']:
                validated_data['notes'] = Validator.validate_string(data, 'notes', min_length=1, max_length=1000)
            else:
                validated_data['notes'] = ''
        
        return validated_data
    
    @staticmethod
    def validate_beehive_update_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate beehive update data"""
        validated_data = {}
        
        if 'import_date' in data:
            validated_data['import_date'] = Validator.validate_date(data, 'import_date', allow_future=False)
        
        if 'split_date' in data:
            if data['split_date']:
                validated_data['split_date'] = Validator.validate_date(data, 'split_date', allow_future=False)
            else:
                validated_data['split_date'] = None
        
        if 'health_status' in data:
            health_choices = ['Tốt', 'Bình thường', 'Yếu']
            validated_data['health_status'] = Validator.validate_choice(data, 'health_status', health_choices)
        
        if 'notes' in data:
            if data['notes']:
                validated_data['notes'] = Validator.validate_string(data, 'notes', min_length=1, max_length=1000)
            else:
                validated_data['notes'] = ''
        
        # Validate is_sold
        if 'is_sold' in data:
            validated_data['is_sold'] = Validator.validate_boolean(data, 'is_sold')
        
        # Validate sold_date
        if 'sold_date' in data:
            if data['sold_date']:
                validated_data['sold_date'] = Validator.validate_date(data, 'sold_date', allow_future=False)
            else:
                validated_data['sold_date'] = None
        
        return validated_data

class QueryValidator:
    """Query parameter validators"""
    
    @staticmethod
    def validate_pagination_params(data: Dict[str, Any]) -> Dict[str, int]:
        """Validate pagination parameters"""
        page = Validator.validate_integer(data, 'page', min_value=1, max_value=1000) if 'page' in data else 1
        per_page = Validator.validate_integer(data, 'per_page', min_value=1, max_value=100) if 'per_page' in data else 20
        
        return {
            'page': page,
            'per_page': per_page
        }
    
    @staticmethod
    def validate_sort_params(data: Dict[str, Any], allowed_fields: List[str]) -> Dict[str, str]:
        """Validate sort parameters"""
        sort_field = data.get('sort_field', 'created_at')
        sort_order = data.get('sort_order', 'desc')
        
        if sort_field not in allowed_fields:
            raise ValidationError(f"Trường sắp xếp phải là một trong: {', '.join(allowed_fields)}", field='sort_field')
        
        if sort_order not in ['asc', 'desc']:
            raise ValidationError("Thứ tự sắp xếp phải là 'asc' hoặc 'desc'", field='sort_order')
        
        return {
            'sort_field': sort_field,
            'sort_order': sort_order
        }
