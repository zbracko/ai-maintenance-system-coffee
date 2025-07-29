import { createTheme, alpha } from '@mui/material/styles';

// Advanced color palette with semantic meanings
const colors = {
  // Primary gradient system
  primary: {
    50: '#f0f4ff',
    100: '#e0ebff',
    200: '#c7d7fe',
    300: '#a5b9fc',
    400: '#8b92f8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  
  // Accent colors
  accent: {
    coral: '#ff6b6b',
    mint: '#4ecdc4',
    gold: '#ffe66d',
    lavender: '#a8e6cf',
    sunset: '#ff8b94',
  },
  
  // Neutral grays with subtle tints
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  
  // Status colors
  success: {
    light: '#6ee7b7',
    main: '#10b981',
    dark: '#047857',
    bg: 'rgba(16, 185, 129, 0.1)',
  },
  warning: {
    light: '#fcd34d',
    main: '#f59e0b',
    dark: '#d97706',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  error: {
    light: '#f87171',
    main: '#ef4444',
    dark: '#dc2626',
    bg: 'rgba(239, 68, 68, 0.1)',
  },
  info: {
    light: '#60a5fa',
    main: '#3b82f6',
    dark: '#2563eb',
    bg: 'rgba(59, 130, 246, 0.1)',
  },
};

const theme = createTheme({
  palette: {
    mode: 'light', // Switch to light mode for better visibility
    primary: {
      main: colors.primary[600],
      light: colors.primary[500],
      dark: colors.primary[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.accent.coral,
      light: colors.accent.sunset,
      dark: '#e55555',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Very light background
      paper: '#ffffff',   // Pure white for papers
    },
    text: {
      primary: colors.gray[900],
      secondary: colors.gray[600],
      disabled: colors.gray[400],
    },
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    divider: alpha(colors.gray[300], 0.8), // Subtle but visible dividers
  },
  
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      lineHeight: 1.1,
      letterSpacing: '-0.05em',
      color: colors.gray[900],
    },
    h2: {
      fontWeight: 600,
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      lineHeight: 1.2,
      letterSpacing: '-0.04em',
      color: colors.gray[900],
    },
    h3: {
      fontWeight: 600,
      fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
      lineHeight: 1.3,
      letterSpacing: '-0.03em',
      color: colors.gray[900],
    },
    h4: {
      fontWeight: 600,
      fontSize: 'clamp(1.25rem, 2.5vw, 1.875rem)',
      lineHeight: 1.4,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
      fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: colors.gray[400],
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.875rem',
      letterSpacing: '0.025em',
    },
  },
  
  shape: {
    borderRadius: 16,
  },
  
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
    '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
    '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
    '0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)',
    // Glassmorphism shadows
    '0 8px 32px rgba(31, 38, 135, 0.37)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    '0 32px 64px -12px rgba(0, 0, 0, 0.4)',
    // Neon glow effects
    `0 0 20px ${alpha(colors.primary[500], 0.3)}`,
    `0 0 40px ${alpha(colors.primary[500], 0.2)}`,
    `0 0 60px ${alpha(colors.primary[500], 0.1)}`,
    // Enhanced depth
    '0 35px 60px -12px rgba(0, 0, 0, 0.3)',
    '0 40px 80px -12px rgba(0, 0, 0, 0.25)',
    '0 50px 100px -20px rgba(0, 0, 0, 0.25)',
    // Maximum depth
    '0 60px 120px -20px rgba(0, 0, 0, 0.3)',
    // Colored shadows
    `0 20px 40px ${alpha(colors.primary[500], 0.15)}`,
    `0 25px 50px ${alpha(colors.accent.coral, 0.15)}`,
    `0 30px 60px ${alpha(colors.accent.gold, 0.15)}`,
    // Ultra premium
    '0 50px 100px -20px rgba(50, 50, 93, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3)',
    // Final premium shadow
    'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 50px 100px -20px rgba(50, 50, 93, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3)',
    // Additional variations
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.primary[500]} ${colors.gray[800]}`,
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: colors.gray[100],
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb': {
          background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.accent.coral} 100%)`,
          borderRadius: '4px',
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.accent.sunset} 100%)`,
          },
        },
        body: {
          background: `linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)`,
          backgroundAttachment: 'fixed',
          fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: colors.gray[900],
        },
      },
    },
    
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 500,
          textTransform: 'none',
          fontSize: '0.875rem',
          letterSpacing: '0.025em',
          minHeight: '40px',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: colors.primary[600],
          color: '#ffffff',
          boxShadow: `0 2px 8px ${alpha(colors.primary[600], 0.3)}`,
          '&:hover': {
            background: colors.primary[700],
            boxShadow: `0 4px 12px ${alpha(colors.primary[600], 0.4)}`,
          },
          '&.MuiButton-containedSecondary': {
            background: colors.accent.coral,
            color: '#ffffff',
            '&:hover': {
              background: '#e55555',
            },
          },
        },
        outlined: {
          borderColor: colors.primary[300],
          color: colors.primary[700],
          background: '#ffffff',
          '&:hover': {
            borderColor: colors.primary[500],
            background: alpha(colors.primary[50], 0.8),
            color: colors.primary[800],
          },
        },
        text: {
          color: colors.primary[700],
          '&:hover': {
            background: alpha(colors.primary[50], 0.8),
            color: colors.primary[800],
          },
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: '#ffffff',
          border: `1px solid ${alpha(colors.gray[200], 1)}`,
          borderRadius: 12,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            border: `1px solid ${alpha(colors.primary[300], 0.8)}`,
            boxShadow: `0 4px 20px ${alpha(colors.primary[500], 0.08)}`,
            transform: 'translateY(-1px)',
          },
        },
        elevation1: {
          boxShadow: `0 1px 3px ${alpha(colors.gray[400], 0.15)}`,
        },
        elevation2: {
          boxShadow: `0 2px 8px ${alpha(colors.gray[400], 0.15)}`,
        },
        elevation3: {
          boxShadow: `0 4px 16px ${alpha(colors.gray[400], 0.15)}`,
        },
      },
    },
    
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          color: colors.gray[900],
          borderBottom: `1px solid ${alpha(colors.gray[200], 1)}`,
          boxShadow: `0 1px 3px ${alpha(colors.gray[400], 0.1)}`,
        },
      },
    },
    
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            background: '#ffffff',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: alpha(colors.gray[300], 1),
              transition: 'border-color 0.3s ease',
            },
            '&:hover': {
              '& fieldset': {
                borderColor: alpha(colors.primary[400], 0.8),
              },
            },
            '&.Mui-focused': {
              '& fieldset': {
                borderColor: colors.primary[500],
                borderWidth: '2px',
                boxShadow: `0 0 0 3px ${alpha(colors.primary[500], 0.1)}`,
              },
            },
          },
          '& .MuiInputLabel-root': {
            color: colors.gray[600],
            '&.Mui-focused': {
              color: colors.primary[600],
            },
          },
          '& .MuiOutlinedInput-input': {
            color: colors.gray[900],
          },
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: '#ffffff',
          border: `1px solid ${alpha(colors.gray[200], 1)}`,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 25px ${alpha(colors.primary[500], 0.12)}`,
            border: `1px solid ${alpha(colors.primary[300], 0.6)}`,
          },
        },
      },
    },
    
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          marginBottom: '8px',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: alpha(colors.primary[500], 0.08),
            transform: 'translateX(4px)',
          },
        },
      },
    },
    
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: alpha(colors.primary[100], 0.8),
          color: colors.primary[800],
          border: `1px solid ${alpha(colors.primary[200], 1)}`,
          '&:hover': {
            background: alpha(colors.primary[200], 0.8),
          },
        },
      },
    },
    
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          background: '#ffffff',
          border: `1px solid ${alpha(colors.gray[200], 1)}`,
          boxShadow: `0 8px 32px ${alpha(colors.gray[900], 0.15)}`,
        },
      },
    },
    
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          background: '#ffffff',
          border: `1px solid ${alpha(colors.gray[200], 1)}`,
          boxShadow: `0 4px 20px ${alpha(colors.gray[900], 0.15)}`,
        },
      },
    },
    
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: colors.gray[800],
          color: '#ffffff',
          border: `1px solid ${alpha(colors.gray[600], 0.2)}`,
          borderRadius: 6,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default theme;
