import { createTheme } from '@mui/material/styles';

/* ─── Brand & accent tokens ─── */
export const PW_COLORS = {
    brand: '#D97706',      // Professional amber/gold
    brandLight: '#FBBF24',
    brandDark: '#B45309',
    sky: '#0284C7',
    cta: '#EA580C',
    mint: '#0D9488',
    mintDark: '#0F766E',
    rose: '#E11D48',
    roseDark: '#BE123C',
    amber: '#F59E0B',
    amberDark: '#B45309',
    bgDark: '#2B231D',     // Off-brown deep background
    bgDarkPaper: '#3A3028',
    bgLight: '#FDF8F5',    // Off-white warm background
    bgLightPaper: '#FFFFFF',
};

/* ─── Shared Typography ─── */
const sharedTypography = {
    fontFamily: '"Poppins", "Open Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08 },
    h2: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12 },
    h3: { fontWeight: 600, letterSpacing: '-0.015em' },
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600, letterSpacing: '-0.005em' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' },
    caption: { letterSpacing: '0.02em' },
};

const sharedShape = { borderRadius: 12 };

/* ─── Shared Component Overrides ─── */
const sharedComponentOverrides = (mode) => ({
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                padding: '9px 22px',
                fontSize: '0.9rem',
                transition: `all 180ms cubic-bezier(0.4, 0, 0.2, 1)`,
                '&:hover': {
                    transform: 'translateY(-2px)',
                },
                '&:active': {
                    transform: 'translateY(0px)',
                },
            },
            contained: {
                boxShadow: `0 4px 16px rgba(217, 119, 6, 0.25)`,
                '&:hover': {
                    boxShadow: `0 8px 24px rgba(217, 119, 6, 0.4)`,
                },
            },
            outlined: {
                '&:hover': {
                    background: `rgba(217, 119, 6, 0.08)`,
                },
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                backgroundImage: 'none',
                borderRadius: 16,
                border: mode === 'dark'
                    ? '1px solid rgba(248, 250, 252, 0.06)'
                    : '1px solid rgba(217, 119, 6, 0.1)',
                backdropFilter: 'blur(12px)',
                background: mode === 'dark'
                    ? `linear-gradient(145deg, ${PW_COLORS.bgDarkPaper} 0%, rgba(43, 35, 29, 0.90) 100%)`
                    : `linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(253, 248, 245, 0.95) 100%)`,
                transition: 'transform 220ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 220ms cubic-bezier(0.4, 0, 0.2, 1), border-color 220ms ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: mode === 'dark'
                        ? '0 20px 48px rgba(0,0,0,0.5)'
                        : '0 20px 48px rgba(217, 119, 6, 0.08)',
                },
            },
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: { backgroundImage: 'none' },
        },
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: 8,
                    transition: 'box-shadow 150ms ease',
                    '&.Mui-focused': {
                        boxShadow: `0 0 0 3px rgba(217, 119, 6, 0.15)`,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: PW_COLORS.brand,
                        borderWidth: 2,
                    },
                },
            },
        },
    },
    MuiDrawer: {
        styleOverrides: {
            paper: {
                background: mode === 'dark'
                    ? `linear-gradient(180deg, ${PW_COLORS.bgDark} 0%, rgba(25, 20, 16, 1) 100%)`
                    : `linear-gradient(180deg, ${PW_COLORS.bgLightPaper} 0%, ${PW_COLORS.bgLight} 100%)`,
                borderRight: mode === 'dark'
                    ? '1px solid rgba(248, 250, 252, 0.06)'
                    : '1px solid rgba(217, 119, 6, 0.08)',
            },
        },
    },
    MuiChip: {
        styleOverrides: {
            root: {
                borderRadius: 6,
                fontWeight: 600,
                fontSize: '0.78rem',
                transition: 'all 150ms ease',
            },
        },
    },
    MuiListItemButton: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                transition: 'all 180ms ease',
                '&:hover': {
                    transform: 'translateX(3px)',
                    backgroundColor: mode === 'dark' ? 'rgba(217, 119, 6, 0.08)' : 'rgba(217, 119, 6, 0.04)',
                },
                '&.Mui-selected': {
                    backgroundColor: mode === 'dark' ? 'rgba(217, 119, 6, 0.15)' : 'rgba(217, 119, 6, 0.08)',
                },
                '&.Mui-selected:hover': {
                    transform: 'translateX(2px)',
                    backgroundColor: mode === 'dark' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(217, 119, 6, 0.12)',
                },
            },
        },
    },
    MuiLinearProgress: {
        styleOverrides: {
            root: { borderRadius: 8 },
            bar: { borderRadius: 8 },
        },
    },
    MuiAppBar: {
        styleOverrides: {
            root: { backgroundImage: 'none' },
        },
    },
    MuiTab: {
        styleOverrides: {
            root: {
                fontWeight: 600,
                transition: 'all 180ms ease',
                borderRadius: '8px 8px 0 0',
                '&.Mui-selected': { fontWeight: 700 },
            },
        },
    },
    MuiTableRow: {
        styleOverrides: {
            root: {
                transition: 'background-color 150ms ease',
            },
        },
    },
});

/* ─── Dark Theme ─── */
export function createDarkTheme() {
    return createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: PW_COLORS.brand,
                light: PW_COLORS.brandLight,
                dark: PW_COLORS.brandDark,
                contrastText: '#fff',
            },
            secondary: {
                main: PW_COLORS.sky,
                light: '#FBBF24',
                dark: '#0369A1',
            },
            error:   { main: PW_COLORS.rose,  light: '#FB7185', dark: PW_COLORS.roseDark },
            warning: { main: PW_COLORS.amber, light: '#FCD34D', dark: PW_COLORS.amberDark },
            success: { main: PW_COLORS.mint,  light: '#2DD4BF', dark: PW_COLORS.mintDark },
            info:    { main: PW_COLORS.cta,   light: '#FB923C', dark: '#C2410C' },
            background: {
                default: PW_COLORS.bgDark,
                paper:   PW_COLORS.bgDarkPaper,
            },
            text: {
                primary:   '#F8FAFC',
                secondary: '#CBD5E1',
                disabled:  '#64748B',
            },
            divider: 'rgba(248, 250, 252, 0.08)',
            action: {
                hover:    'rgba(217, 119, 6, 0.08)',
                selected: 'rgba(217, 119, 6, 0.15)',
            },
        },
        typography: sharedTypography,
        shape: sharedShape,
        components: sharedComponentOverrides('dark'),
    });
}

/* ─── Light Theme ─── */
export function createLightTheme() {
    return createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: PW_COLORS.brandDark,
                light: PW_COLORS.brand,
                dark: '#92400E',
                contrastText: '#fff',
            },
            secondary: {
                main: '#0369A1',
                light: PW_COLORS.sky,
                dark: '#075985',
            },
            error:   { main: '#E11D48', light: '#FB7185', dark: '#BE123C' },
            warning: { main: '#D97706', light: PW_COLORS.amber, dark: '#92400E' },
            success: { main: '#0D9488', light: '#2DD4BF', dark: '#0F766E' },
            info:    { main: PW_COLORS.cta, light: '#FB923C', dark: '#C2410C' },
            background: {
                default: PW_COLORS.bgLight,
                paper:   PW_COLORS.bgLightPaper,
            },
            text: {
                primary:   '#1E1B18',
                secondary: '#5C554F',
                disabled:  '#A8A29E',
            },
            divider: 'rgba(217, 119, 6, 0.12)',
            action: {
                hover:    'rgba(217, 119, 6, 0.05)',
                selected: 'rgba(217, 119, 6, 0.10)',
            },
        },
        typography: sharedTypography,
        shape: sharedShape,
        components: sharedComponentOverrides('light'),
    });
}

/* Default export: dark theme for backward-compat */
const theme = createDarkTheme();
export default theme;
