import React from 'react';
import { IconButton, Tooltip } from '@mui/material';

/**
 * Accessible IconButton component with built-in ARIA attributes
 * Provides consistent accessibility features across the application
 */
const AccessibleIconButton = ({
  ariaLabel,
  title,
  onClick,
  icon,
  color = 'default',
  size = 'medium',
  disabled = false,
  sx = {},
  tooltip = true,
  ...props
}) => {
  // Ensure aria-label is provided for accessibility
  if (!ariaLabel && !title) {
    console.warn('AccessibleIconButton: ariaLabel or title is required for accessibility');
  }

  const buttonElement = (
    <IconButton
      aria-label={ariaLabel || title}
      onClick={onClick}
      color={color}
      size={size}
      disabled={disabled}
      sx={{
        // Ensure minimum touch target size for mobile
        minWidth: 44,
        minHeight: 44,
        ...sx,
      }}
      {...props}
    >
      {icon}
    </IconButton>
  );

  // Wrap with tooltip if title is provided and tooltip is enabled
  if (title && tooltip) {
    return (
      <Tooltip title={title} arrow>
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
};

export default AccessibleIconButton;
