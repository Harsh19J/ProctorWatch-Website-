import { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Chip, Button,
    List, ListItem, ListItemText, ListItemIcon, Avatar, Divider,
    LinearProgress,
} from '@mui/material';
import { School, Assignment, Flag, Add, Visibility, TrendingUp, People, PlayArrow } from '@mui/icons-material';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

// Animated stat card
function StatCard({ title, value, icon, color, subtitle, delay = 0 }) {
    const { ref, display } = useAnimatedCounter(value);
    return (
        <Card ref={ref} sx={{
            height: '100%',
            animation: `scaleIn 0.5s ease ${delay}s both`,
            transition: 'all 220ms ease',
            '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 20px 48px ${color}18` },
        }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                            {title}
                        </Typography>
                        <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: '-0.04em', color, lineHeight: 1 }}>
                            {display}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{
                        p: 1.5, borderRadius: '12px',
                        bgcolor: `${color}12`, border: `1px solid ${color}25`, color,
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

export default function TeacherDashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [courses, setCourses] = useState([]);
    const [tests, setTests] = useState([]);
    const [pendingFlags, setPendingFlags] = useState(0);
    const [totalStudents, setTotalStudents] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const coursesData = await api.get('/api/courses?active=true');
            setCourses(coursesData || []);
            const testsData = await api.get('/api/tests');
            setTests(testsData.slice(0, 10));
            const flags = await api.get('/api/flags?reviewed=false');
            setPendingFlags(flags.length);
            const sessions = await api.get('/api/sessions');
            const uniqueStudents = new Set((sessions || []).map(s => s.student_id));
            setTotalStudents(uniqueStudents.size);
        } catch (err) { console.error('Failed to load teacher data:', err); }
        setLoading(false);
    };

    if (loading) return <LinearProgress sx={{ borderRadius: 8 }} />;

    return (
        <Box sx={{ animation: 'pageEnter 0.4s ease both' }}>
            {/* Header with action buttons */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, animation: 'fadeSlideRight 0.45s ease both' }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
                        Teacher{' '}
                        <Box component="span" sx={{ background: 'linear-gradient(90deg, #FBBF24, #D97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Dashboard
                        </Box>
                    </Typography>
                    <Typography color="text.secondary" variant="body2">Manage your courses, tests, and review student activity</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button variant="outlined" startIcon={<Add />} onClick={() => navigate('/dashboard/tests/create')}
                        sx={{ borderRadius: '10px', fontWeight: 600, height: 38 }}>
                        Create Test
                    </Button>
                    <Button variant="contained" startIcon={<Flag />} onClick={() => navigate('/dashboard/flags')}
                        color={pendingFlags > 0 ? 'warning' : 'primary'}
                        sx={{ borderRadius: '10px', fontWeight: 600, height: 38 }}>
                        Review Flags {pendingFlags > 0 && `(${pendingFlags})`}
                    </Button>
                </Box>
            </Box>

            {/* Stats — 4 cards full width */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Assigned Courses" value={courses.length} icon={<School />} color="#FBBF24" delay={0.05} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Tests Created" value={tests.length} icon={<Assignment />} color="#D97706" delay={0.12} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Active Students" value={totalStudents} icon={<People />} color="#0284C7" subtitle="Submitted exams" delay={0.19} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Pending Flags" value={pendingFlags} icon={<Flag />} color={pendingFlags > 0 ? '#B45309' : '#0284C7'} subtitle="Need review" delay={0.26} />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Courses */}
                <Grid size={{ xs: 12, md: 5 }} sx={{ animation: 'fadeSlideRight 0.5s ease 0.15s both' }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(251,191,36,0.1)', color: '#FBBF24', display: 'flex' }}>
                                        <School sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700}>My Courses</Typography>
                                </Box>
                                <Chip label={`${courses.length} active`} size="small" sx={{ bgcolor: 'rgba(251,191,36,0.08)', color: '#FBBF24', fontWeight: 600, fontSize: '0.72rem' }} />
                            </Box>
                            {courses.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 5 }}>
                                    <School sx={{ fontSize: 52, color: 'text.secondary', mb: 1.5, animation: 'pulseDot 2s ease-in-out infinite' }} />
                                    <Typography color="text.secondary">No courses assigned yet</Typography>
                                </Box>
                            ) : (
                                <List disablePadding sx={{ maxHeight: 360, overflowY: 'auto' }}>
                                    {courses.map((course, idx) => (
                                        <Box key={course.id} sx={{ animation: `fadeSlideUp 0.38s ease ${idx * 0.06}s both` }}>
                                            <ListItem sx={{ px: 0, py: 1.25, transition: 'all 180ms ease', borderRadius: 2, '&:hover': { bgcolor: 'action.hover', pl: 1 } }}>
                                                <ListItemIcon>
                                                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(251,191,36,0.15)', color: '#FBBF24', fontSize: '0.8rem', fontWeight: 700 }}>
                                                        {course.code?.slice(0, 2)}
                                                    </Avatar>
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={<Typography variant="body2" fontWeight={600}>{course.name}</Typography>}
                                                    secondary={`Code: ${course.code}`}
                                                />
                                                <Chip label={`${course.enrollments?.[0]?.count || 0} students`} size="small" variant="outlined" sx={{ fontSize: '0.72rem' }} />
                                            </ListItem>
                                            {idx < courses.length - 1 && <Divider sx={{ opacity: 0.4 }} />}
                                        </Box>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Tests */}
                <Grid size={{ xs: 12, md: 7 }} sx={{ animation: 'fadeSlideLeft 0.5s ease 0.2s both' }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(217,119,6,0.1)', color: '#D97706', display: 'flex' }}>
                                        <Assignment sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700}>Recent Tests</Typography>
                                </Box>
                                <Button size="small" variant="contained" startIcon={<Add />} onClick={() => navigate('/dashboard/tests/create')}
                                    sx={{ borderRadius: '10px', fontWeight: 600, height: 34, fontSize: '0.8rem',
                                        background: 'linear-gradient(135deg, #D97706, #FBBF24)', boxShadow: '0 4px 12px rgba(217,119,6,0.3)' }}>
                                    Create Test
                                </Button>
                            </Box>
                            {tests.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 5 }}>
                                    <Assignment sx={{ fontSize: 52, color: 'text.secondary', mb: 1.5, animation: 'pulseDot 2s ease-in-out infinite' }} />
                                    <Typography color="text.secondary">No tests created yet</Typography>
                                </Box>
                            ) : (
                                <List disablePadding sx={{ maxHeight: 360, overflowY: 'auto' }}>
                                    {tests.map((test, idx) => {
                                        const isActive = new Date(test.start_time) <= new Date() && new Date(test.end_time) >= new Date();
                                        const isEnded = new Date(test.end_time) < new Date();
                                        return (
                                            <Box key={test.id} sx={{
                                                mb: 1.5, p: 2, borderRadius: 2, bgcolor: 'action.hover',
                                                border: '1px solid', borderColor: isActive ? '#0284C720' : 'divider',
                                                transition: 'all 180ms ease',
                                                '&:hover': { bgcolor: 'action.selected', transform: 'translateX(3px)', borderColor: isActive ? '#0284C7' : 'rgba(217,119,6,0.3)' },
                                                animation: `fadeSlideUp 0.38s ease ${idx * 0.06}s both`,
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="body2" fontWeight={700} noWrap>{test.title}</Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(test.start_time).toLocaleDateString()} · {test.duration_minutes} mins
                                                            </Typography>
                                                            {isActive && <Chip label="Live" size="small" color="success" sx={{ height: 18, fontSize: '0.65rem' }} />}
                                                            {isEnded && <Chip label="Ended" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />}
                                                            {!isActive && !isEnded && <Chip label="Upcoming" size="small" color="info" sx={{ height: 18, fontSize: '0.65rem' }} />}
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        {isActive && (
                                                            <Button size="small" variant="outlined" startIcon={<Visibility />}
                                                                onClick={() => navigate('/dashboard/live-monitor')}
                                                                sx={{ fontWeight: 600, borderRadius: '8px', fontSize: '0.75rem', height: 30 }}>
                                                                Monitor
                                                            </Button>
                                                        )}
                                                        <Button size="small" variant="outlined" startIcon={<TrendingUp />}
                                                            onClick={() => navigate(`/dashboard/test-results/${test.id}`)}
                                                            sx={{ fontWeight: 600, borderRadius: '8px', fontSize: '0.75rem', height: 30 }}>
                                                            Results
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
