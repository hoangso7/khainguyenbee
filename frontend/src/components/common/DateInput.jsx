import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';

const DateInput = ({ 
  value, 
  onChange, 
  label, 
  fullWidth = true, 
  size = 'small',
  error = false,
  helperText = '',
  disabled = false,
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  // Convert ISO date (YYYY-MM-DD) to DD/MM/YYYY format
  const formatDateToDisplay = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Convert DD/MM/YYYY format to ISO date (YYYY-MM-DD)
  const parseDisplayToISO = (displayDate) => {
    if (!displayDate) return '';
    
    // Remove any non-digit characters except /
    const cleaned = displayDate.replace(/[^\d/]/g, '');
    
    // Check if it matches DD/MM/YYYY pattern
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = cleaned.match(dateRegex);
    
    if (!match) return '';
    
    const [, day, month, year] = match;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    // Validate date
    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 2100) {
      return '';
    }
    
    // Create date object to validate
    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (date.getDate() !== dayNum || date.getMonth() !== monthNum - 1 || date.getFullYear() !== yearNum) {
      return '';
    }
    
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(formatDateToDisplay(value));
  }, [value]);

  const handleChange = (event) => {
    const inputValue = event.target.value;
    setDisplayValue(inputValue);
    
    const isoDate = parseDisplayToISO(inputValue);
    const valid = !inputValue || isoDate !== '';
    setIsValid(valid);
    
    if (onChange) {
      onChange({
        ...event,
        target: {
          ...event.target,
          value: isoDate
        }
      });
    }
  };

  const handleBlur = () => {
    // Format the display value on blur
    if (displayValue && isValid) {
      const isoDate = parseDisplayToISO(displayValue);
      if (isoDate) {
        setDisplayValue(formatDateToDisplay(isoDate));
      }
    }
  };

  return (
    <TextField
      {...props}
      fullWidth={fullWidth}
      size={size}
      label={label}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error || !isValid}
      helperText={helperText || (!isValid && displayValue ? 'Định dạng ngày không hợp lệ (dd/mm/yyyy)' : '')}
      disabled={disabled}
      placeholder="dd/mm/yyyy"
      inputProps={{
        maxLength: 10,
        ...props.inputProps
      }}
    />
  );
};

export default DateInput;
