import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, Card, CardContent, TextField, Button, Typography,
    Alert, IconButton, InputAdornment, CircularProgress, Chip,
} from '@mui/material';
import { Visibility, VisibilityOff, Shield, Login, LightMode, DarkMode } from '@mui/icons-material';
import { useThemeMode } from '../ThemeContext';
import useAuthStore from '../store/authStore';

const roleDashboardMap = {
    admin: '/dashboard/admin',
    teacher: '/dashboard/teacher',
    student: '/dashboard/student',
    parent: '/dashboard/parent',
    technical: '/dashboard/technical',
};

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
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: isDark ? '#0A0E1A' : '#F1F5F9', position: 'relative', overflow: 'hidden',
        }}>
            {/* Background orbs */}
            <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)', top: '-10%', left: '-10%', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,217,255,0.12) 0%, transparent 70%)', bottom: '-5%', right: '-5%', pointerEvents: 'none' }} />

            {/* Theme toggle */}
            <IconButton onClick={toggleMode} sx={{ position: 'absolute', top: 20, right: 20 }}>
                {isDark ? <LightMode /> : <DarkMode />}
            </IconButton>
            {/* Back to home */}
            <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
                <Button component={Link} to="/" startIcon={<Shield />} sx={{ background: 'linear-gradient(90deg,#6C63FF,#00D9FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
                    ProctorWatch
                </Button>
            </Box>

            <Card sx={{
                width: '100%', maxWidth: 440, mx: 2, borderRadius: 4,
                border: `1px solid ${isDark ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.08)'}`,
                backdropFilter: 'blur(20px)',
                bgcolor: isDark ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.95)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
            }}>
                <CardContent sx={{ p: 5 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box sx={{ width: 60, height: 60, borderRadius: '16px', background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5, boxShadow: '0 8px 24px rgba(108,99,255,0.4)' }}>
                            <Shield sx={{ fontSize: 30, color: '#fff' }} />
                        </Box>
                        <Typography variant="h5" fontWeight={800}>Welcome Back</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Sign in to your ProctorWatch account</Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            fullWidth label="Username" value={form.username}
                            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                            required autoFocus autoComplete="username"
                        />
                        <TextField
                            fullWidth label="Password" type={showPw ? 'text' : 'password'}
                            value={form.password}
                            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                            required autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPw(!showPw)} edge="end" tabIndex={-1} size="small">
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
                            sx={{ mt: 1, py: 1.5, fontWeight: 700, background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', boxShadow: '0 8px 20px rgba(108,99,255,0.4)' }}
                        >
                            {loading ? 'Signing In…' : 'Sign In'}
                        </Button>
                    </Box>

                    <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${isDark ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.06)'}`, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account? Contact your institution administrator.
                        </Typography>
                        <Chip label="Web Portal — Data Management Only" size="small" sx={{ mt: 2, bgcolor: 'rgba(108,99,255,0.1)', color: '#8B85FF', fontSize: '0.7rem' }} />
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
