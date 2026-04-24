import { createTheme } from '@mui/material/styles';

/* ─── Brand & accent tokens ─── */
export const PW_COLORS = {
    brand: '#6C63FF',
    brandLight: '#8B85FF',
    brandDark: '#4B44CC',
    sky: '#38BDF8',
    cta: '#F97316',
    mint: '#4ECDC4',
    mintDark: '#3EA49D',
    rose: '#FF4D6A',
    roseDark: '#CC3D55',
    amber: '#FFB74D',
    amberDark: '#CC923E',
};

/* ─── Shared Typography ─── */
const sharedTypography = {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08 },
    h2: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.12 },
    h3: { fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600, letterSpacing: '-0.005em' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    caption: { letterSpacing: '0.02em' },
};

const sharedShape = { borderRadius: 12 };

/* ─── Shared Component Overrides ─── */
const sharedComponentOverrides = (mode) => ({
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: 10,
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
                boxShadow: `0 4px 16px rgba(108, 99, 255, 0.3)`,
                '&:hover': {
                    boxShadow: `0 8px 28px rgba(108, 99, 255, 0.5)`,
                },
            },
            outlined: {
                '&:hover': {
                    background: `rgba(108, 99, 255, 0.06)`,
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
                    ? '1px solid rgba(148, 163, 184, 0.08)'
                    : '1px solid rgba(108, 99, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                background: mode === 'dark'
                    ? 'linear-gradient(145deg, rgba(15, 17, 23, 0.95) 0%, rgba(17, 24, 39, 0.90) 100%)'
                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 255, 0.95) 100%)',
                transition: 'transform 220ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 220ms cubic-bezier(0.4, 0, 0.2, 1), border-color 220ms ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: mode === 'dark'
                        ? '0 20px 48px rgba(0,0,0,0.5)'
                        : '0 20px 48px rgba(108, 99, 255, 0.12)',
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
                    borderRadius: 10,
                    transition: 'box-shadow 150ms ease',
                    '&.Mui-focused': {
                        boxShadow: `0 0 0 3px rgba(108, 99, 255, 0.18)`,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6C63FF',
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
                    ? 'linear-gradient(180deg, #09090F 0%, #0F1117 100%)'
                    : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 100%)',
                borderRight: mode === 'dark'
                    ? '1px solid rgba(148, 163, 184, 0.07)'
                    : '1px solid rgba(108, 99, 255, 0.08)',
            },
        },
    },
    MuiChip: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '0.78rem',
                transition: 'all 150ms ease',
            },
        },
    },
    MuiListItemButton: {
        styleOverrides: {
            root: {
                borderRadius: 10,
                transition: 'all 180ms ease',
                '&:hover': {
                    transform: 'translateX(3px)',
                },
                '&.Mui-selected:hover': {
                    transform: 'translateX(2px)',
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
                light: '#7DD3FC',
                dark: '#0284C7',
            },
            error:   { main: PW_COLORS.rose,  light: '#FF7A8F', dark: PW_COLORS.roseDark },
            warning: { main: PW_COLORS.amber, light: '#FFCA80', dark: PW_COLORS.amberDark },
            success: { main: PW_COLORS.mint,  light: '#7EDBD5', dark: PW_COLORS.mintDark },
            info:    { main: PW_COLORS.cta,   light: '#FB923C', dark: '#C2410C' },
            background: {
                default: '#09090F',
                paper:   '#0F1117',
            },
            text: {
                primary:   '#F1F5F9',
                secondary: '#94A3B8',
                disabled:  '#475569',
            },
            divider: 'rgba(148, 163, 184, 0.10)',
            action: {
                hover:    'rgba(108, 99, 255, 0.08)',
                selected: 'rgba(108, 99, 255, 0.15)',
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
                main: PW_COLORS.brand,
                light: PW_COLORS.brandLight,
                dark: PW_COLORS.brandDark,
                contrastText: '#fff',
            },
            secondary: {
                main: '#0284C7',
                light: PW_COLORS.sky,
                dark: '#075985',
            },
            error:   { main: '#E53E5D', light: '#FF6B83', dark: '#B92E48' },
            warning: { main: '#D97706', light: PW_COLORS.amber, dark: '#92400E' },
            success: { main: '#0F9E8E', light: PW_COLORS.mint, dark: '#0C7A6D' },
            info:    { main: PW_COLORS.cta, light: '#FB923C', dark: '#C2410C' },
            background: {
                default: '#F8FAFF',
                paper:   '#FFFFFF',
            },
            text: {
                primary:   '#0F172A',
                secondary: '#475569',
                disabled:  '#94A3B8',
            },
            divider: 'rgba(108, 99, 255, 0.10)',
            action: {
                hover:    'rgba(108, 99, 255, 0.05)',
                selected: 'rgba(108, 99, 255, 0.10)',
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
