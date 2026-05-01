import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar, Typography, List, ListItemButton,
    ListItemIcon, ListItemText, Avatar, IconButton, Divider, Chip,
    Tooltip, useTheme,
} from '@mui/material';
import {
    Dashboard, People, School, Assignment, Assessment,
    Security, Logout, Menu as MenuIcon,
    Flag, CalendarMonth, AccountCircle,
    Storage, Visibility,
    TrendingUp, AdminPanelSettings,
    Brightness4, Brightness7,
    KeyboardArrowLeft, KeyboardArrowRight,
    Notifications,
} from '@mui/icons-material';
import useAuthStore from '../store/authStore';
import { useThemeMode } from '../ThemeContext';

const DRAWER_WIDTH = 256;
const COLLAPSED_WIDTH = 68;

const navConfig = {
    technical: [
        { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard/technical' },
        { label: 'Blacklist', icon: <Security />, path: '/dashboard/blacklist' },
        { label: 'Profile', icon: <AccountCircle />, path: '/dashboard/profile' },
    ],
    admin: [
        { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard/admin' },
        { label: 'Users', icon: <People />, path: '/dashboard/users' },
        { label: 'Courses', icon: <School />, path: '/dashboard/courses' },
        { label: 'Flags', icon: <Flag />, path: '/dashboard/flags' },
        { label: 'Reports', icon: <Assessment />, path: '/dashboard/reports' },
        { label: 'Blacklist', icon: <Security />, path: '/dashboard/blacklist' },
        { label: 'Profile', icon: <AccountCircle />, path: '/dashboard/profile' },
    ],
    teacher: [
        { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard/teacher' },
        { label: 'My Courses', icon: <School />, path: '/dashboard/courses' },
        { label: 'Create Test', icon: <Assignment />, path: '/dashboard/tests/create' },
        { label: 'My Tests', icon: <Assignment />, path: '/dashboard/tests' },
        { label: 'Performance', icon: <TrendingUp />, path: '/dashboard/performance' },
        { label: 'Review Flags', icon: <Flag />, path: '/dashboard/flags' },
        { label: 'Profile', icon: <AccountCircle />, path: '/dashboard/profile' },
    ],
    student: [
        { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard/student' },
        { label: 'My Courses', icon: <School />, path: '/dashboard/courses' },
        { label: 'Performance', icon: <TrendingUp />, path: '/dashboard/performance' },
        { label: 'Calendar', icon: <CalendarMonth />, path: '/dashboard/calendar' },
        { label: 'Profile', icon: <AccountCircle />, path: '/dashboard/profile' },
    ],
    parent: [
        { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard/parent' },
        { label: 'Performance', icon: <TrendingUp />, path: '/dashboard/performance' },
        { label: 'Calendar', icon: <CalendarMonth />, path: '/dashboard/calendar' },
        { label: 'Profile', icon: <AccountCircle />, path: '/dashboard/profile' },
    ],
};

export const roleColors = {
    technical: '#B45309',
    admin: '#D97706',
    teacher: '#FBBF24',
    student: '#0284C7',
    parent: '#78350F',
};

const roleLabels = {
    technical: 'Technical',
    admin: 'Admin',
    teacher: 'Teacher',
    student: 'Student',
    parent: 'Parent',
};

// Animated sidebar nav item
function NavItem({ item, active, collapsed, delay = 0 }) {
    const muiTheme = useTheme();
    const navigate = useNavigate();
    const roleColor = muiTheme.palette.primary.main;

    return (
        <Tooltip title={collapsed ? item.label : ''} placement="right" arrow>
            <ListItemButton
                onClick={() => navigate(item.path)}
                selected={active}
                sx={{
                    borderRadius: '10px', mb: 0.5,
                    px: collapsed ? 1.5 : 2,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    minHeight: 44,
                    position: 'relative', overflow: 'hidden',
                    animation: `sidebarItemIn 0.35s ease ${delay}s both`,
                    transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
                    '&.Mui-selected': {
                        background: `linear-gradient(135deg, ${roleColor}20, ${roleColor}0A)`,
                        borderLeft: collapsed ? 'none' : `3px solid ${roleColor}`,
                        pl: collapsed ? 1.5 : `calc(16px - 3px)`,
                        '&::before': {
                            content: '""',
                            position: 'absolute', inset: 0,
                            background: `radial-gradient(ellipse at left, ${roleColor}12 0%, transparent 70%)`,
                            pointerEvents: 'none',
                        },
                    },
                    '&:hover': {
                        background: muiTheme.palette.action.hover,
                        transform: 'translateX(4px)',
                    },
                    '&.Mui-selected:hover': {
                        transform: 'translateX(2px)',
                    },
                }}
            >
                <ListItemIcon sx={{
                    minWidth: collapsed ? 0 : 40,
                    justifyContent: 'center',
                    color: active ? roleColor : 'text.secondary',
                    transition: 'color 180ms ease, transform 180ms ease',
                    ...(active && { transform: 'scale(1.12)' }),
                }}>
                    {item.icon}
                </ListItemIcon>
                {!collapsed && (
                    <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: active ? 700 : 400,
                            noWrap: true,
                            sx: { transition: 'font-weight 150ms ease' },
                        }}
                    />
                )}
                {/* active indicator dot */}
                {active && collapsed && (
                    <Box sx={{
                        position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                        width: 4, height: 4, borderRadius: '50%', bgcolor: roleColor,
                    }} />
                )}
            </ListItemButton>
        </Tooltip>
    );
}

export default function DashboardLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const muiTheme = useTheme();
    const { mode, toggleMode } = useThemeMode();
    const { user, logout } = useAuthStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [pageKey, setPageKey] = useState(location.pathname);

    // Animate on route change
    useEffect(() => {
        setPageKey(location.pathname);
    }, [location.pathname]);

    if (!user) return null;

    const navItems = navConfig[user.role] || navConfig.student;
    const currentWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;
    const roleColor = roleColors[user.role] || '#D97706';

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const currentLabel = navItems.find(i =>
        location.pathname === i.path || location.pathname.startsWith(i.path + '/')
    )?.label || 'Dashboard';

    const drawer = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Brand */}
            <Box sx={{
                p: collapsed ? 1.5 : 2.5,
                display: 'flex', alignItems: 'center', gap: 1.5,
                justifyContent: collapsed ? 'center' : 'flex-start',
                minHeight: 66,
            }}>
                <Box sx={{
                    width: 38, height: 38, borderRadius: '11px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #D97706, #FBBF24)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(217,119,6,0.35)',
                    animation: 'pulseRing 3s ease-in-out infinite',
                    cursor: 'pointer',
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'rotate(12deg) scale(1.08)' },
                }} onClick={() => navigate('/')}>
                    <Security sx={{ fontSize: 20, color: '#fff' }} />
                </Box>
                {!collapsed && (
                    <Box sx={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'fadeSlideRight 0.3s ease both' }}>
                        <Typography variant="subtitle1" fontWeight={800} sx={{
                            lineHeight: 1.2, letterSpacing: '-0.01em',
                            background: 'linear-gradient(90deg, #D97706, #FBBF24)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            ProctorWatch
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                            Web Portal
                        </Typography>
                    </Box>
                )}
            </Box>

            <Divider sx={{ mx: collapsed ? 1 : 2, opacity: 0.5 }} />

            {/* Navigation */}
            <List sx={{ flex: 1, px: collapsed ? 0.75 : 1.5, py: 1.5, overflowY: 'auto' }}>
                {navItems.map((item, idx) => (
                    <NavItem
                        key={item.label}
                        item={item}
                        active={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
                        collapsed={collapsed}
                        delay={idx * 0.04}
                    />
                ))}
            </List>

            <Divider sx={{ mx: collapsed ? 1 : 2, opacity: 0.5 }} />

            {/* User area */}
            {!collapsed ? (
                <Box sx={{ p: 2 }}>
                    <Box 
                        onClick={() => navigate('/dashboard/profile')}
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
                            borderRadius: '12px',
                            background: `linear-gradient(135deg, ${roleColor}0A, ${roleColor}05)`,
                            border: `1px solid ${roleColor}18`,
                            transition: 'all 200ms ease',
                            cursor: 'pointer',
                            '&:hover': { borderColor: `${roleColor}35`, background: `linear-gradient(135deg, ${roleColor}15, ${roleColor}0A)` },
                        }}
                    >
                        <Avatar sx={{
                            bgcolor: roleColor, width: 38, height: 38, flexShrink: 0,
                            fontSize: '0.95rem', fontWeight: 700,
                            boxShadow: `0 0 0 2px ${roleColor}30`,
                            animation: 'pulseRing 3s ease-in-out infinite',
                        }}>
                            {(user.full_name || user.username)?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box sx={{ overflow: 'hidden', flex: 1 }}>
                            <Typography variant="body2" fontWeight={700} noWrap>
                                {user.full_name || user.username}
                            </Typography>
                            <Chip
                                size="small" label={roleLabels[user.role]}
                                sx={{ height: 18, fontSize: '0.6rem', bgcolor: `${roleColor}18`, color: roleColor, fontWeight: 700 }}
                            />
                        </Box>
                        <Tooltip title="Logout">
                            <IconButton onClick={(e) => { e.stopPropagation(); handleLogout(); }} size="small" sx={{
                                color: 'text.secondary',
                                transition: 'all 0.2s',
                                '&:hover': { color: '#B45309', transform: 'rotate(10deg)' },
                            }}>
                                <Logout fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            ) : (
                <Box 
                    onClick={() => navigate('/dashboard/profile')}
                    sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 0.5, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                >
                    <Tooltip title={user.full_name || user.username} placement="right">
                        <Avatar sx={{
                            bgcolor: roleColor, width: 36, height: 36, fontSize: '0.875rem', fontWeight: 700,
                            boxShadow: `0 0 0 2px ${roleColor}30`,
                            cursor: 'pointer',
                        }}>
                            {(user.full_name || user.username)?.[0]?.toUpperCase()}
                        </Avatar>
                    </Tooltip>
                    <Tooltip title="Logout" placement="right">
                        <IconButton onClick={(e) => { e.stopPropagation(); handleLogout(); }} size="small" sx={{
                            color: 'text.secondary',
                            '&:hover': { color: '#B45309' },
                        }}>
                            <Logout fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Sidebar */}
            <Box component="nav" sx={{ width: { md: currentWidth }, flexShrink: { md: 0 }, transition: 'width 220ms cubic-bezier(0.4,0,0.2,1)' }}>
                <Drawer
                    variant="temporary" open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            width: currentWidth,
                            transition: 'width 220ms cubic-bezier(0.4,0,0.2,1)',
                            overflowX: 'hidden',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                {/* AppBar */}
                <AppBar
                    position="static" elevation={0} color="transparent"
                    sx={{ borderBottom: `1px solid ${muiTheme.palette.divider}`, backdropFilter: 'blur(8px)' }}
                >
                    <Toolbar sx={{ gap: 1, minHeight: '56px !important' }}>
                        {/* Mobile menu toggle */}
                        <IconButton
                            onClick={() => setMobileOpen(true)}
                            sx={{ display: { md: 'none' }, color: 'text.primary' }}
                        >
                            <MenuIcon />
                        </IconButton>

                        {/* Sidebar collapse toggle */}
                        <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                            <IconButton
                                onClick={() => setCollapsed(!collapsed)}
                                sx={{
                                    display: { xs: 'none', md: 'flex' },
                                    color: 'text.secondary',
                                    transition: 'transform 0.3s, color 0.2s',
                                    '&:hover': { color: 'text.primary' },
                                }}
                            >
                                {collapsed ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                            </IconButton>
                        </Tooltip>

                        {/* Page title */}
                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                            <Typography
                                variant="h6" fontWeight={700}
                                noWrap
                                sx={{
                                    color: 'text.primary',
                                    letterSpacing: '-0.01em',
                                    fontSize: '1rem',
                                    animation: 'fadeSlideDown 0.3s ease both',
                                }}
                                key={currentLabel}
                            >
                                {currentLabel}
                            </Typography>
                        </Box>

                        {/* Right actions */}
                        <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
                            <IconButton onClick={toggleMode} sx={{
                                color: 'text.secondary',
                                transition: 'transform 0.5s, color 0.2s',
                                '&:hover': { transform: 'rotate(180deg)', color: '#78350F' },
                            }}>
                                {mode === 'dark' ? <Brightness7 sx={{ fontSize: 20 }} /> : <Brightness4 sx={{ fontSize: 20 }} />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Notifications (coming soon)">
                            <IconButton sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                                <Notifications sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>

                        <Chip
                            icon={<AdminPanelSettings sx={{ fontSize: 14 }} />}
                            label={roleLabels[user.role]}
                            size="small"
                            sx={{
                                bgcolor: `${roleColor}12`,
                                color: roleColor,
                                border: `1px solid ${roleColor}25`,
                                fontWeight: 700, fontSize: '0.72rem',
                            }}
                        />
                    </Toolbar>
                </AppBar>

                {/* Page content */}
                <Box
                    key={pageKey}
                    sx={{
                        flex: 1, overflow: 'auto', p: 3,
                        background: mode === 'dark'
                            ? `radial-gradient(ellipse at 20% 0%, ${roleColor}06 0%, transparent 60%)`
                            : `radial-gradient(ellipse at 20% 0%, ${roleColor}04 0%, transparent 60%)`,
                        animation: 'pageEnter 0.38s cubic-bezier(0.22,1,0.36,1) both',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
