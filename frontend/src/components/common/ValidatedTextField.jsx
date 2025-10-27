import React, { useState, useEffect } from 'react';
import { TextField, FormHelperText } from '@mui/material';
import { validateField, VALIDATION_RULES } from '../../utils/formValidation';

/**
 * Validated TextField component with built-in validation
 * Provides real-time validation feedback and accessibility features
 */
const ValidatedTextField = ({
  value,
  onChange,
  validationRules = [],
  validationOptions = {},
  errorMessage,
  helperText,
  required = false,
  label,
  name,
  type = 'text',
  disabled = false,
  sx = {},
  ...props
}) => {
  const [internalError, setInternalError] = useState(null);
  const [isTouched, setIsTouched] = useState(false);

  // Validate on value change
  useEffect(() => {
    if (isTouched || value) {
      const allRules = required 
        ? [VALIDATION_RULES.REQUIRED, ...validationRules]
        : validationRules;
      const error = validateField(value, allRules, validationOptions);
      setInternalError(error);
    }
  }, [value, isTouched, required, validationRules, validationOptions]);

  const handleChange = (event) => {
    onChange(event);
    
    // Mark as touched on first interaction
    if (!isTouched) {
      setIsTouched(true);
    }
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  const handleFocus = () => {
    // Clear error on focus for better UX
    if (internalError && !errorMessage) {
      setInternalError(null);
    }
  };

  // Determine if field has error
  const hasError = Boolean(errorMessage || internalError);
  const displayError = errorMessage || internalError;

  // Determine helper text to show
  const displayHelperText = displayError || helperText;

  return (
    <>
      <TextField
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        label={label}
        name={name}
        type={type}
        disabled={disabled}
        error={hasError}
        required={required}
        aria-describedby={displayHelperText ? `${name}-helper-text` : undefined}
        aria-invalid={hasError}
        sx={{
          // Ensure minimum touch target for mobile
          '& .MuiInputBase-root': {
            minHeight: 44,
          },
          ...sx,
        }}
        {...props}
      />
      {displayHelperText && (
        <FormHelperText 
          id={`${name}-helper-text`}
          error={hasError}
          sx={{ mt: 0.5 }}
        >
          {displayHelperText}
        </FormHelperText>
      )}
    </>
  );
};

export default ValidatedTextField;
