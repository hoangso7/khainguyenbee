/**
 * Form validation utilities for KhaiNguyenBee Manager
 * Centralized validation logic with Vietnamese error messages
 */

// Validation rules
export const VALIDATION_RULES = {
  REQUIRED: 'required',
  EMAIL: 'email',
  PHONE: 'phone',
  DATE: 'date',
  DATE_RANGE: 'dateRange',
  NUMBER: 'number',
  NUMBER_RANGE: 'numberRange',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
};

// Error messages in Vietnamese
export const ERROR_MESSAGES = {
  required: 'Trường này là bắt buộc',
  email: 'Vui lòng nhập địa chỉ email hợp lệ',
  phone: 'Vui lòng nhập số điện thoại hợp lệ (10-11 chữ số)',
  date: 'Vui lòng nhập ngày hợp lệ',
  dateRange: 'Ngày tách không thể sớm hơn ngày nhập',
  number: 'Vui lòng nhập số hợp lệ',
  numberRange: 'Số lượng phải từ {min} đến {max}',
  minLength: 'Tối thiểu {min} ký tự',
  maxLength: 'Tối đa {max} ký tự',
};

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Vietnamese phone number
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate date format and range
 * @param {string} date
 * @param {string} minDate
 * @param {string} maxDate
 * @returns {boolean}
 */
export const isValidDate = (date, minDate = null, maxDate = null) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  
  if (minDate) {
    const minDateObj = new Date(minDate);
    if (dateObj < minDateObj) return false;
  }
  
  if (maxDate) {
    const maxDateObj = new Date(maxDate);
    if (dateObj > maxDateObj) return false;
  }
  
  return true;
};

/**
 * Validate number range
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export const isValidNumberRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validate string length
 * @param {string} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export const isValidLength = (value, min = 0, max = Infinity) => {
  const length = value ? value.length : 0;
  return length >= min && length <= max;
};

/**
 * Main validation function
 * @param {any} value - Value to validate
 * @param {string|Array} rules - Validation rules
 * @param {Object} options - Additional options
 * @returns {string|null} - Error message or null if valid
 */
export const validateField = (value, rules, options = {}) => {
  // Handle single rule
  if (typeof rules === 'string') {
    rules = [rules];
  }
  
  // Handle required validation first
  if (rules.includes(VALIDATION_RULES.REQUIRED)) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return ERROR_MESSAGES.required;
    }
  }
  
  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }
  
  // Apply other validation rules
  for (const rule of rules) {
    switch (rule) {
      case VALIDATION_RULES.EMAIL:
        if (!isValidEmail(value)) {
          return ERROR_MESSAGES.email;
        }
        break;
        
      case VALIDATION_RULES.PHONE:
        if (!isValidPhone(value)) {
          return ERROR_MESSAGES.phone;
        }
        break;
        
      case VALIDATION_RULES.DATE:
        if (!isValidDate(value)) {
          return ERROR_MESSAGES.date;
        }
        break;
        
      case VALIDATION_RULES.DATE_RANGE:
        if (options.minDate && !isValidDate(value, options.minDate)) {
          return ERROR_MESSAGES.dateRange;
        }
        break;
        
      case VALIDATION_RULES.NUMBER:
        if (isNaN(Number(value))) {
          return ERROR_MESSAGES.number;
        }
        break;
        
      case VALIDATION_RULES.NUMBER_RANGE:
        if (options.min !== undefined && options.max !== undefined) {
          if (!isValidNumberRange(value, options.min, options.max)) {
            return ERROR_MESSAGES.numberRange
              .replace('{min}', options.min)
              .replace('{max}', options.max);
          }
        }
        break;
        
      case VALIDATION_RULES.MIN_LENGTH:
        if (options.minLength && !isValidLength(value, options.minLength)) {
          return ERROR_MESSAGES.minLength.replace('{min}', options.minLength);
        }
        break;
        
      case VALIDATION_RULES.MAX_LENGTH:
        if (options.maxLength && !isValidLength(value, 0, options.maxLength)) {
          return ERROR_MESSAGES.maxLength.replace('{max}', options.maxLength);
        }
        break;
    }
  }
  
  return null;
};

/**
 * Validate entire form
 * @param {Object} formData - Form data object
 * @param {Object} validationSchema - Validation schema
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateForm = (formData, validationSchema) => {
  const errors = {};
  let isValid = true;
  
  for (const [fieldName, rules] of Object.entries(validationSchema)) {
    const error = validateField(formData[fieldName], rules.rules, rules.options);
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  }
  
  return { isValid, errors };
};

/**
 * Common validation schemas for forms
 */
export const VALIDATION_SCHEMAS = {
  // Login form
  login: {
    username: {
      rules: [VALIDATION_RULES.REQUIRED],
    },
    password: {
      rules: [VALIDATION_RULES.REQUIRED],
    },
  },
  
  // Add beehive form
  addBeehive: {
    importDate: {
      rules: [VALIDATION_RULES.REQUIRED, VALIDATION_RULES.DATE],
    },
    splitDate: {
      rules: [VALIDATION_RULES.DATE_RANGE],
      options: { minDate: 'importDate' },
    },
    healthStatus: {
      rules: [VALIDATION_RULES.REQUIRED],
    },
    notes: {
      rules: [VALIDATION_RULES.MAX_LENGTH],
      options: { maxLength: 500 },
    },
  },
  
  // Profile settings form
  profileSettings: {
    email: {
      rules: [VALIDATION_RULES.EMAIL],
    },
    farmName: {
      rules: [VALIDATION_RULES.MAX_LENGTH],
      options: { maxLength: 100 },
    },
    farmAddress: {
      rules: [VALIDATION_RULES.MAX_LENGTH],
      options: { maxLength: 200 },
    },
    farmPhone: {
      rules: [VALIDATION_RULES.PHONE],
    },
  },
  
  // Bulk add beehives form
  bulkAddBeehives: {
    quantity: {
      rules: [VALIDATION_RULES.REQUIRED, VALIDATION_RULES.NUMBER_RANGE],
      options: { min: 1, max: 100 },
    },
    importDate: {
      rules: [VALIDATION_RULES.REQUIRED, VALIDATION_RULES.DATE],
    },
    splitDate: {
      rules: [VALIDATION_RULES.DATE_RANGE],
      options: { minDate: 'importDate' },
    },
  },
};
