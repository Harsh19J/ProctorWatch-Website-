import { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Chip, Button,
    Table, TableHead, TableRow, TableCell, TableBody,
    LinearProgress, Avatar, Tooltip,
} from '@mui/material';
import {
    People, School, Assignment, Flag,
    Warning, PersonAdd, Upload,
    Visibility, Shield, Key, PlayArrow,
} from '@mui/icons-material';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import OverrideCodeGenerator from '../../components/OverrideCodeGenerator';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

// Animated stat card
function StatCard({ title, value, icon, color, subtitle, delay = 0 }) {
    const { ref, display } = useAnimatedCounter(value);
    return (
        <Card ref={ref} sx={{
            height: '100%',
            animation: `scaleIn 0.5s ease ${delay}s both`,
            transition: 'all 220ms ease',
            '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 20px 48px ${color}15` },
        }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}
                            sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                            {title}
                        </Typography>
                        <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: '-0.04em', color, lineHeight: 1 }}>
                            {display}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{
                        p: 1.5, borderRadius: '12px',
                        bgcolor: `${color}12`, border: `1px solid ${color}22`, color,
                        transition: 'transform 0.3s',
                        '&:hover': { transform: 'rotate(12deg) scale(1.12)' },
                    }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

// Quick action button
function QuickAction({ icon, label, onClick, color = 'primary', variant = 'outlined' }) {
    return (
        <Button
            variant={variant} startIcon={icon} color={color} onClick={onClick}
            sx={{
                borderRadius: '10px', fontWeight: 600, fontSize: '0.82rem',
                transition: 'all 200ms ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 18px rgba(0,0,0,0.12)' },
            }}
        >
            {label}
        </Button>
    );
}

const roleChipColors = {
    admin: '#6C63FF', teacher: '#38BDF8', student: '#4ECDC4', parent: '#FFB74D', technical: '#FF4D6A',
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ users: 0, courses: 0, students: 0, activeSessions: 0 });
    const [recentUsers, setRecentUsers] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [codeGenOpen, setCodeGenOpen] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const overview = await api.get('/api/reports/overview');
            setStats({
                users: overview.totalUsers,
                courses: overview.totalCourses,
                students: overview.totalStudents,
                activeSessions: overview.totalSessions,
            });
            const users = await api.get('/api/users');
            setRecentUsers(users.slice(0, 5));
            const sessions = await api.get('/api/sessions?status=in_progress');
            setActiveSessions(sessions);
        } catch (err) { console.error('Failed to load admin data:', err); }
        setLoading(false);
    };

    if (loading) return <LinearProgress sx={{ borderRadius: 8 }} />;

    return (
        <Box sx={{ animation: 'pageEnter 0.4s ease both' }}>
            {/* Header */}
            <Box sx={{ mb: 4, animation: 'fadeSlideRight 0.45s ease both' }}>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
                    Admin{' '}
                    <Box component="span" sx={{ background: 'linear-gradient(90deg, #6C63FF, #38BDF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Dashboard
                    </Box>
                </Typography>
                <Typography color="text.secondary" variant="body2">Manage users, courses, and monitor examinations</Typography>
            </Box>

            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    { title: 'Total Users', value: stats.users, icon: <People />, color: '#6C63FF', subtitle: 'Students, Teachers, Parents', delay: 0.05 },
                    { title: 'Courses', value: stats.courses, icon: <School />, color: '#38BDF8', delay: 0.11 },
                    { title: 'Total Students', value: stats.students, icon: <School />, color: '#4ECDC4', delay: 0.17 },
                    { title: 'Active Sessions', value: stats.activeSessions, icon: <Visibility />, color: '#FFB74D', subtitle: 'Exams in progress', delay: 0.23 },
                ].map((s, i) => (
                    <Grid key={i} item xs={12} sm={6} md={3}>
                        <StatCard {...s} />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Quick Actions */}
                <Grid item xs={12} md={6} sx={{ animation: 'fadeSlideRight 0.5s ease 0.15s both' }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>Quick Actions</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                <QuickAction icon={<PersonAdd />} label="Add User" onClick={() => navigate('/dashboard/users')} />
                                <QuickAction icon={<Upload />} label="Bulk Upload" onClick={() => navigate('/dashboard/users')} />
                                <QuickAction icon={<School />} label="Create Course" onClick={() => navigate('/dashboard/courses')} />
                                <QuickAction icon={<Flag />} label="Review Flags" onClick={() => navigate('/dashboard/flags')} color="warning" />
                                <QuickAction icon={<Shield />} label="Blacklist" onClick={() => navigate('/dashboard/blacklist')} color="error" />
                                <QuickAction
                                    icon={<Key />} label="Override Code"
                                    onClick={() => setCodeGenOpen(true)}
                                    variant="contained"
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Active Sessions */}
                <Grid item xs={12} md={6} sx={{ animation: 'fadeSlideLeft 0.5s ease 0.2s both' }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(78,205,196,0.1)', color: '#4ECDC4', display: 'flex' }}>
                                    <Visibility sx={{ fontSize: 20 }} />
                                </Box>
                                <Typography variant="h6" fontWeight={700}>Active Exam Sessions</Typography>
                                {activeSessions.length > 0 && (
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4ECDC4', ml: 'auto', animation: 'pulseDot 1.5s ease-in-out infinite' }} />
                                )}
                            </Box>
                            {activeSessions.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography color="text.secondary" variant="body2">No active sessions right now</Typography>
                                </Box>
                            ) : (
                                activeSessions.slice(0, 4).map((session, idx) => (
                                    <Box key={session.id} sx={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        p: 1.75, mb: 1, borderRadius: 2, bgcolor: 'action.hover',
                                        border: '1px solid rgba(78,205,196,0.15)',
                                        transition: 'all 180ms ease',
                                        '&:hover': { bgcolor: 'action.selected', transform: 'translateX(3px)' },
                                        animation: `fadeSlideUp 0.38s ease ${idx * 0.08}s both`,
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4ECDC4', animation: 'pulseDot 1.8s ease-in-out infinite' }} />
                                            <Typography variant="body2" fontWeight={600}>Session {session.id.slice(0, 8)}…</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {session.red_flags > 0 && <Chip label={`${session.red_flags} Red`} size="small" color="error" variant="outlined" sx={{ fontSize: '0.68rem', height: 22 }} />}
                                            {session.orange_flags > 0 && <Chip label={`${session.orange_flags} ⚑`} size="small" color="warning" variant="outlined" sx={{ fontSize: '0.68rem', height: 22 }} />}
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Users */}
            <Card sx={{ animation: 'fadeSlideUp 0.5s ease 0.25s both' }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(108,99,255,0.1)', color: '#6C63FF', display: 'flex' }}>
                                <People sx={{ fontSize: 20 }} />
                            </Box>
                            <Typography variant="h6" fontWeight={700}>Recent Users</Typography>
                        </Box>
                        <Button size="small" onClick={() => navigate('/dashboard/users')} sx={{ fontWeight: 600 }}>
                            View All
                        </Button>
                    </Box>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recentUsers.map((u, idx) => (
                                <TableRow key={u.id} hover sx={{ animation: `fadeSlideUp 0.35s ease ${idx * 0.06}s both` }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 30, height: 30, fontSize: '0.8rem', fontWeight: 700, bgcolor: `${roleChipColors[u.role]}22`, color: roleChipColors[u.role] }}>
                                                {u.username?.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={600}>{u.username}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={u.role} size="small" sx={{ bgcolor: `${roleChipColors[u.role]}12`, color: roleChipColors[u.role], fontWeight: 700, fontSize: '0.7rem', border: `1px solid ${roleChipColors[u.role]}25` }} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={u.is_active ? 'Active' : 'Inactive'}
                                            size="small"
                                            color={u.is_active ? 'success' : 'default'}
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {recentUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography color="text.secondary">No users yet</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <OverrideCodeGenerator open={codeGenOpen} onClose={() => setCodeGenOpen(false)} />
        </Box>
    );
}
