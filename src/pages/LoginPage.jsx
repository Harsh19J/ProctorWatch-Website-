import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, Card, CardContent, TextField, Button, Typography,
    Alert, IconButton, InputAdornment, CircularProgress, Chip,
    Grid,
} from '@mui/material';
import { Visibility, VisibilityOff, Shield, Login, LightMode, DarkMode, Lock, ArrowBack } from '@mui/icons-material';
import { useThemeMode } from '../ThemeContext';
import useAuthStore from '../store/authStore';

const roleDashboardMap = {
    admin: '/dashboard/admin',
    teacher: '/dashboard/teacher',
    student: '/dashboard/student',
    parent: '/dashboard/parent',
    technical: '/dashboard/technical',
};

const FEATURES = [
    { icon: '🛡️', title: 'ArcFace Biometrics', desc: 'ResNet-50 face verification with liveness detection' },
    { icon: '🎙️', title: 'Audio Intelligence', desc: 'VAD + spectral analysis detects nearby speech' },
    { icon: '📊', title: 'Deep Analytics', desc: 'Score distributions, flag breakdowns, CSV export' },
    { icon: '👥', title: 'Multi-Role Portals', desc: 'Tailored dashboards for every stakeholder' },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const { mode, toggleMode } = useThemeMode();
    const { login, loading, error, clearError } = useAuthStore();
    const [form, setForm] = useState({ username: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const isDark = mode === 'dark';

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        try {
            const session = await login(form.username, form.password);
            const dest = roleDashboardMap[session.user.role] || '/dashboard/student';
            navigate(session.user.first_login ? '/first-login' : dest);
        } catch { /* error shown via store */ }
    };

    return (
        <Box sx={{
            minHeight: '100vh', display: 'flex', bgcolor: isDark ? '#09090F' : '#F8FAFF',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* ── Left panel (illustration) ── */}
            <Box sx={{
                display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
                flex: 1, position: 'relative',
                background: 'linear-gradient(145deg, #09090F 0%, #0D0F1A 100%)',
                overflow: 'hidden',
            }}>
                {/* Background orbs */}
                <Box sx={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 65%)', top: '-10%', left: '-10%', pointerEvents: 'none', animation: 'floatOrb 11s ease-in-out infinite alternate' }} />
                <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.14) 0%, transparent 65%)', bottom: '5%', right: '-5%', pointerEvents: 'none', animation: 'floatOrb 9s ease-in-out infinite alternate', animationDelay: '2s' }} />
                <Box sx={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(78,205,196,0.1) 0%, transparent 65%)', bottom: '40%', left: '60%', pointerEvents: 'none', animation: 'floatOrb 7s ease-in-out infinite alternate', animationDelay: '1s' }} />

                {/* Grid overlay */}
                <Box sx={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(rgba(108,99,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

                <Box sx={{ position: 'relative', zIndex: 1, p: 6, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Logo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 'auto' }}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: '12px',
                            background: 'linear-gradient(135deg, #6C63FF, #38BDF8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 6px 20px rgba(108,99,255,0.5)',
                            animation: 'pulseRing 3s ease-in-out infinite',
                        }}>
                            <Shield sx={{ fontSize: 22, color: '#fff' }} />
                        </Box>
                        <Typography fontWeight={800} sx={{
                            background: 'linear-gradient(90deg, #6C63FF, #38BDF8)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            fontSize: '1.15rem', letterSpacing: '-0.02em',
                        }}>
                            ProctorWatch
                        </Typography>
                    </Box>

                    {/* Headline */}
                    <Box sx={{ my: 'auto' }}>
                        <Typography variant="h3" fontWeight={900} sx={{
                            color: '#F1F5F9', mb: 2, lineHeight: 1.1,
                            letterSpacing: '-0.04em',
                            animation: 'fadeSlideRight 0.65s cubic-bezier(0.22,1,0.36,1) 0.1s both',
                        }}>
                            Secure Exams,{' '}
                            <Box component="span" sx={{
                                background: 'linear-gradient(90deg, #6C63FF, #38BDF8)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            }}>
                                Smarter
                            </Box>{' '}
                            Proctoring
                        </Typography>
                        <Typography sx={{ color: '#64748B', mb: 6, lineHeight: 1.8, fontSize: '1.02rem', animation: 'fadeSlideRight 0.65s cubic-bezier(0.22,1,0.36,1) 0.2s both' }}>
                            AI-powered exam integrity for modern educational institutions.
                        </Typography>

                        {/* Feature list */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {FEATURES.map((f, i) => (
                                <Box key={i} sx={{
                                    display: 'flex', alignItems: 'flex-start', gap: 2,
                                    p: 2, borderRadius: '12px',
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(148,163,184,0.07)',
                                    backdropFilter: 'blur(8px)',
                                    cursor: 'default',
                                    transition: 'all 200ms ease',
                                    '&:hover': { bgcolor: 'rgba(108,99,255,0.08)', borderColor: 'rgba(108,99,255,0.25)', transform: 'translateX(4px)' },
                                    animation: `fadeSlideRight 0.5s ease ${0.25 + i * 0.08}s both`,
                                }}>
                                    <Box sx={{ fontSize: '1.3rem', lineHeight: 1, mt: 0.2, flexShrink: 0 }}>{f.icon}</Box>
                                    <Box>
                                        <Typography variant="body2" fontWeight={700} sx={{ color: '#E2E8F0', mb: 0.25 }}>{f.title}</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.6 }}>{f.desc}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Bottom trust line */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                        <Lock sx={{ color: '#475569', fontSize: 14 }} />
                        <Typography variant="caption" sx={{ color: '#475569' }}>
                            AES-256 Encrypted · GDPR Compliant · ISO 27001
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* ── Right panel (form) ── */}
            <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                width: { xs: '100%', md: 420 }, flexShrink: 0,
                p: { xs: 3, md: 5 },
                bgcolor: isDark ? '#09090F' : '#F8FAFF',
                position: 'relative',
                borderLeft: { md: `1px solid rgba(108,99,255,0.1)` },
            }}>
                {/* Top controls */}
                <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 1 }}>
                    <IconButton onClick={toggleMode} size="small" sx={{
                        color: 'text.secondary',
                        transition: 'transform 0.5s, color 0.2s',
                        '&:hover': { transform: 'rotate(180deg)', color: '#FFB74D' },
                    }}>
                        {isDark ? <LightMode sx={{ fontSize: 18 }} /> : <DarkMode sx={{ fontSize: 18 }} />}
                    </IconButton>
                </Box>
                <Box sx={{ position: 'absolute', top: 20, left: 20, display: { md: 'none' } }}>
                    <Button component={Link} to="/" size="small" startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
                        sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Back
                    </Button>
                </Box>

                <Box sx={{ width: '100%', maxWidth: 360, animation: 'fadeSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) both' }}>
                    {/* Logo (mobile only) */}
                    <Box sx={{ display: { md: 'none' }, textAlign: 'center', mb: 4 }}>
                        <Box sx={{
                            width: 56, height: 56, borderRadius: '16px',
                            background: 'linear-gradient(135deg, #6C63FF, #38BDF8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
                            boxShadow: '0 8px 24px rgba(108,99,255,0.4)',
                        }}>
                            <Shield sx={{ fontSize: 28, color: '#fff' }} />
                        </Box>
                        <Typography variant="h6" fontWeight={800} sx={{
                            background: 'linear-gradient(90deg, #6C63FF, #38BDF8)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>ProctorWatch</Typography>
                    </Box>

                    <Typography variant="h5" fontWeight={800} sx={{ mb: 0.75, letterSpacing: '-0.02em' }}>
                        Welcome back
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                        Sign in to your ProctorWatch account to continue.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, animation: 'scaleIn 0.25s ease both' }} onClose={clearError}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            fullWidth label="Username or Email"
                            value={form.username}
                            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                            required autoFocus autoComplete="username"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <TextField
                            fullWidth label="Password"
                            type={showPw ? 'text' : 'password'}
                            value={form.password}
                            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                            required autoComplete="current-password"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPw(!showPw)} edge="end" tabIndex={-1} size="small"
                                            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                                            {showPw ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit" fullWidth variant="contained" size="large"
                            disabled={loading || !form.username || !form.password}
                            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Login />}
                            sx={{
                                mt: 0.5, py: 1.5, fontWeight: 700, borderRadius: '12px',
                                background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
                                backgroundSize: '200% 200%',
                                animation: 'gradientShift 3s ease infinite',
                                boxShadow: '0 8px 24px rgba(108,99,255,0.4)',
                                '&:hover': { boxShadow: '0 12px 36px rgba(108,99,255,0.6)', transform: 'translateY(-2px)' },
                                '&:disabled': { opacity: 0.55 },
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? 'Signing In…' : 'Sign In'}
                        </Button>
                    </Box>

                    <Box sx={{
                        mt: 4, pt: 3.5,
                        borderTop: `1px solid ${isDark ? 'rgba(148,163,184,0.08)' : 'rgba(0,0,0,0.06)'}`,
                        textAlign: 'center',
                    }}>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            Don't have an account? Contact your institution administrator.
                        </Typography>
                        <Chip
                            label="Web Portal — Data Management Only"
                            size="small"
                            sx={{ mt: 2, bgcolor: 'rgba(108,99,255,0.08)', color: '#8B85FF', fontSize: '0.68rem', fontWeight: 600, border: '1px solid rgba(108,99,255,0.18)' }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
