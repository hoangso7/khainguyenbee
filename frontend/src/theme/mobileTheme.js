import { createTheme } from '@mui/material/styles';

/**
 * Mobile-optimized theme extensions
 * Provides touch-friendly interactions and mobile-specific styling
 */
export const createMobileTheme = (baseTheme) => {
  return createTheme({
    ...baseTheme,
    components: {
      ...baseTheme.components,
      
      // Mobile-optimized Button overrides
      MuiButton: {
        ...baseTheme.components?.MuiButton,
        styleOverrides: {
          ...baseTheme.components?.MuiButton?.styleOverrides,
          root: {
            ...baseTheme.components?.MuiButton?.styleOverrides?.root,
            // Ensure minimum touch target size
            minHeight: 44,
            minWidth: 44,
            // Better spacing for mobile
            padding: '8px 16px',
            fontSize: '1rem',
            fontWeight: 600,
          },
          sizeSmall: {
            minHeight: 36,
            minWidth: 36,
            padding: '6px 12px',
            fontSize: '0.875rem',
          },
          sizeLarge: {
            minHeight: 52,
            minWidth: 52,
            padding: '12px 24px',
            fontSize: '1.125rem',
          },
        },
      },
      
      // Mobile-optimized IconButton overrides
      MuiIconButton: {
        ...baseTheme.components?.MuiIconButton,
        styleOverrides: {
          ...baseTheme.components?.MuiIconButton?.styleOverrides,
          root: {
            ...baseTheme.components?.MuiIconButton?.styleOverrides?.root,
            // Ensure minimum touch target size
            minWidth: 44,
            minHeight: 44,
            padding: 8,
          },
          sizeSmall: {
            minWidth: 36,
            minHeight: 36,
            padding: 6,
          },
          sizeLarge: {
            minWidth: 52,
            minHeight: 52,
            padding: 12,
          },
        },
      },
      
      // Mobile-optimized TextField overrides
      MuiTextField: {
        ...baseTheme.components?.MuiTextField,
        styleOverrides: {
          ...baseTheme.components?.MuiTextField?.styleOverrides,
          root: {
            ...baseTheme.components?.MuiTextField?.styleOverrides?.root,
            '& .MuiInputBase-root': {
              minHeight: 44,
              fontSize: '1rem',
            },
            '& .MuiInputLabel-root': {
              fontSize: '1rem',
            },
          },
        },
      },
      
      // Mobile-optimized FormControl overrides
      MuiFormControl: {
        ...baseTheme.components?.MuiFormControl,
        styleOverrides: {
          ...baseTheme.components?.MuiFormControl?.styleOverrides,
          root: {
            ...baseTheme.components?.MuiFormControl?.styleOverrides?.root,
            '& .MuiInputBase-root': {
              minHeight: 44,
            },
          },
        },
      },
      
      // Mobile-optimized Select overrides
      MuiSelect: {
        ...baseTheme.components?.MuiSelect,
        styleOverrides: {
          ...baseTheme.components?.MuiSelect?.styleOverrides,
          root: {
            ...baseTheme.components?.MuiSelect?.styleOverrides?.root,
            minHeight: 44,
            fontSize: '1rem',
          },
        },
      },
      
      // Mobile-optimized Checkbox overrides
      MuiCheckbox: {
        ...baseTheme.components?.MuiCheckbox,
        styleOverrides: {
          ...baseTheme.components?.MuiCheckbox?.styleOverrides,
          root: {
            ...baseTheme.components?.MuiCheckbox?.styleOverrides?.root,
            minWidth: 44,
            minHeight: 44,
            padding: 8,
          },
        },
      },
      
      // Mobile-optimized Switch overrides
      MuiSwitch: {
        ...baseTheme.components?.MuiSwitch,
        styleOverrides: {
          ...baseTheme.components?.MuiSwitch?.styleOverrides,
          root: {
            ...baseTheme.components?.MuiSwitch?.styleOverrides?.root,
            minWidth: 44,
            minHeight: 44,
            padding: 8,
          },
        },
      },
      
      // Mobile-optimized Card overrides
      MuiCard: {
        ...baseTheme.components?.MuiCard,
        styleOverrides: {
          ...baseTheme.components?.MuiCard?.styleOverrides,
          root: {
            ...baseTheme.components?.MuiCard?.styleOverrides?.root,
            // Better spacing for mobile
            marginBottom: 16,
            '&:last-child': {
              marginBottom: 0,
            },
          },
        },
      },
      
      // Mobile-optimized Table overrides
      MuiTable: {
        ...baseTheme.components?.MuiTable,
        styleOverrides: {
          ...baseTheme.components?.MuiTable?.styleOverrides,
          root: {
            ...baseTheme.components?.MuiTable?.styleOverrides?.root,
            // Better spacing for mobile tables
            '& .MuiTableCell-root': {
              padding: '8px 4px',
              fontSize: '0.875rem',
            },
            '& .MuiTableCell-head': {
              fontSize: '0.875rem',
              fontWeight: 600,
            },
          },
        },
      },
      
      // Mobile-optimized Drawer overrides
      MuiDrawer: {
        ...baseTheme.components?.MuiDrawer,
        styleOverrides: {
          ...baseTheme.components?.MuiDrawer?.styleOverrides,
          paper: {
            ...baseTheme.components?.MuiDrawer?.styleOverrides?.paper,
            // Better touch targets for drawer items
            '& .MuiListItemButton-root': {
              minHeight: 48,
              padding: '12px 16px',
            },
            '& .MuiListItemIcon-root': {
              minWidth: 40,
            },
          },
        },
      },
      
      // Mobile-optimized Container overrides
      MuiContainer: {
        ...baseTheme.components?.MuiContainer,
        styleOverrides: {
          ...baseTheme.components?.MuiContainer?.styleOverrides,
          root: {
            ...baseTheme.components?.MuiContainer?.styleOverrides?.root,
            paddingLeft: 8,
            paddingRight: 8,
            '@media (min-width: 600px)': {
              paddingLeft: 16,
              paddingRight: 16,
            },
            '@media (min-width: 900px)': {
              paddingLeft: 24,
              paddingRight: 24,
            },
          },
        },
      },
      
      // Mobile-optimized Box overrides
      MuiBox: {
        ...baseTheme.components?.MuiBox,
        styleOverrides: {
          ...baseTheme.components?.MuiBox?.styleOverrides,
          root: {
            ...baseTheme.components?.MuiBox?.styleOverrides?.root,
            // Prevent horizontal overflow
            maxWidth: '100%',
            boxSizing: 'border-box',
          },
        },
      },
    },
    
    // Mobile-specific breakpoints
    breakpoints: {
      ...baseTheme.breakpoints,
      values: {
        ...baseTheme.breakpoints.values,
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    
    // Mobile-specific spacing
    spacing: (factor) => `${baseTheme.spacing(factor)}`,
    
    // Mobile-specific typography
    typography: {
      ...baseTheme.typography,
      // Larger font sizes for mobile readability
      h4: {
        ...baseTheme.typography.h4,
        fontSize: '1.5rem',
        lineHeight: 1.3,
      },
      h5: {
        ...baseTheme.typography.h5,
        fontSize: '1.25rem',
        lineHeight: 1.3,
      },
      h6: {
        ...baseTheme.typography.h6,
        fontSize: '1.125rem',
        lineHeight: 1.3,
      },
      body1: {
        ...baseTheme.typography.body1,
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        ...baseTheme.typography.body2,
        fontSize: '0.875rem',
        lineHeight: 1.4,
      },
      button: {
        ...baseTheme.typography.button,
        fontSize: '1rem',
        fontWeight: 600,
      },
    },
  });
};

export default createMobileTheme;
