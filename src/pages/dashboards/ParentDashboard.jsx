import { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Chip, LinearProgress,
    Avatar, List, ListItem, ListItemText, ListItemAvatar, Divider,
} from '@mui/material';
import { TrendingUp, CalendarMonth, ContactMail, CheckCircle, Warning, Person } from '@mui/icons-material';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

// Animated metric card
function MetricCard({ value, label, icon, color, delay = 0 }) {
    const { ref, display } = useAnimatedCounter(value);
    const isPercent = label.toLowerCase().includes('integrity') || label.toLowerCase().includes('attendance');
    return (
        <Card ref={ref} sx={{
            height: '100%',
            animation: `scaleIn 0.5s ease ${delay}s both`,
            transition: 'all 220ms ease',
            '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 20px 48px ${color}15` },
        }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{
                    width: 52, height: 52, borderRadius: '14px',
                    bgcolor: `${color}12`, border: `1px solid ${color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 2, color,
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'rotate(10deg) scale(1.1)' },
                }}>
                    {icon}
                </Box>
                <Typography variant="h3" fontWeight={900} sx={{ color, letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {display}{isPercent ? '%' : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mt: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.7rem' }}>
                    {label}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default function ParentDashboard() {
    const { user } = useAuthStore();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [childData, setChildData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadChildren(); }, []);

    const loadChildren = async () => {
        try {
            const meData = await api.get('/api/users/me');
            const childIds = meData.children || [];
            if (childIds.length === 0) { setLoading(false); return; }
            const allUsers = await api.get('/api/users');
            const kids = allUsers.filter(u => childIds.includes(u.id));
            setChildren(kids);
            if (kids.length > 0) { setSelectedChild(kids[0]); await loadChildData(kids[0].id); }
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const loadChildData = async (childId) => {
        const sessions = await api.get(`/api/sessions?student_id=${childId}`);
        const tests = await api.get('/api/tests');
        const now = new Date();
        const upcomingExams = tests.filter(t => new Date(t.end_time) > now).slice(0, 5);
        const totalExams = (sessions?.length || 0) + (upcomingExams?.length || 0);
        const attendance = totalExams > 0 ? Math.round(((sessions?.length || 0) / totalExams) * 100) : 100;
        const cleanSessions = sessions?.filter(s => (s.red_flags || 0) === 0 && (s.orange_flags || 0) === 0).length || 0;
        const integrityScore = sessions?.length ? Math.round((cleanSessions / sessions.length) * 100) : 100;
        setChildData({
            sessions: sessions || [], upcomingExams, teachers: [],
            avgScore: sessions?.length ? Math.round(sessions.reduce((a, s) => a + (s.score || 0), 0) / sessions.length) : 0,
            integrityScore, attendance,
        });
    };

    if (loading) return <LinearProgress sx={{ borderRadius: 8 }} />;

    return (
        <Box sx={{ animation: 'pageEnter 0.4s ease both' }}>
            {/* Header */}
            <Box sx={{ mb: 4, animation: 'fadeSlideRight 0.45s ease both' }}>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
                    Parent{' '}
                    <Box component="span" sx={{ background: 'linear-gradient(90deg, #78350F, #F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Dashboard
                    </Box>
                </Typography>
                <Typography color="text.secondary" variant="body2">Monitor your child's academic performance and integrity</Typography>
            </Box>

            {children.length === 0 ? (
                <Card sx={{ animation: 'scaleIn 0.45s ease both' }}>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                        <Person sx={{ fontSize: 72, color: 'text.secondary', mb: 2.5, animation: 'pulseDot 2s ease-in-out infinite' }} />
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>No children linked</Typography>
                        <Typography color="text.secondary">Contact your institution admin to link your child's account.</Typography>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Child selector */}
                    {children.length > 1 && (
                        <Box sx={{ display: 'flex', gap: 1, mb: 3.5, animation: 'fadeSlideDown 0.4s ease 0.05s both' }}>
                            {children.map(c => (
                                <Chip
                                    key={c.id} label={c.username}
                                    onClick={() => { setSelectedChild(c); loadChildData(c.id); }}
                                    variant={selectedChild?.id === c.id ? 'filled' : 'outlined'}
                                    color={selectedChild?.id === c.id ? 'primary' : 'default'}
                                    sx={{ cursor: 'pointer', fontWeight: 600, transition: 'all 200ms ease', '&:hover': { transform: 'translateY(-2px)' } }}
                                />
                            ))}
                        </Box>
                    )}

                    {childData && (
                        <Grid container spacing={3}>
                            {/* Stats */}
                            <Grid item xs={6} sm={3}>
                                <MetricCard value={childData.avgScore} label="Avg Score" icon={<TrendingUp />} color="#D97706" delay={0.05} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <MetricCard value={childData.integrityScore} label="Integrity" icon={<CheckCircle />} color="#0284C7" delay={0.11} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <MetricCard value={childData.attendance} label="Attendance" icon={<Person />} color="#FBBF24" delay={0.17} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <MetricCard value={childData.sessions.length} label="Exams Taken" icon={<Warning />} color="#78350F" delay={0.23} />
                            </Grid>

                            {/* Upcoming Exams */}
                            <Grid item xs={12} md={6} sx={{ animation: 'fadeSlideRight 0.5s ease 0.25s both' }}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                                            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(217,119,6,0.1)', color: '#D97706', display: 'flex' }}>
                                                <CalendarMonth sx={{ fontSize: 20 }} />
                                            </Box>
                                            <Typography variant="h6" fontWeight={700}>Upcoming Exams</Typography>
                                        </Box>
                                        {childData.upcomingExams.length === 0 ? (
                                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                                <CalendarMonth sx={{ fontSize: 48, color: 'text.secondary', mb: 1, animation: 'pulseDot 2s ease-in-out infinite' }} />
                                                <Typography color="text.secondary" variant="body2">No upcoming exams</Typography>
                                            </Box>
                                        ) : (
                                            childData.upcomingExams.map((e, idx) => (
                                                <Box key={e.id} sx={{
                                                    p: 2, mb: 1.5, borderRadius: 2,
                                                    bgcolor: 'action.hover',
                                                    border: '1px solid', borderColor: 'divider',
                                                    transition: 'all 180ms ease',
                                                    '&:hover': { transform: 'translateX(4px)', borderColor: 'rgba(217,119,6,0.3)' },
                                                    animation: `fadeSlideUp 0.38s ease ${idx * 0.07}s both`,
                                                }}>
                                                    <Typography variant="body2" fontWeight={600}>{e.title}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {e.courses?.name} · {new Date(e.start_time).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Teacher Contacts */}
                            <Grid item xs={12} md={6} sx={{ animation: 'fadeSlideLeft 0.5s ease 0.3s both' }}>
                                <Card sx={{ height: '100%' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                                            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(251,191,36,0.1)', color: '#FBBF24', display: 'flex' }}>
                                                <ContactMail sx={{ fontSize: 20 }} />
                                            </Box>
                                            <Typography variant="h6" fontWeight={700}>Teacher Contacts</Typography>
                                        </Box>
                                        {childData.teachers.length === 0 ? (
                                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                                <ContactMail sx={{ fontSize: 48, color: 'text.secondary', mb: 1, animation: 'pulseDot 2s ease-in-out infinite' }} />
                                                <Typography color="text.secondary" variant="body2">No teacher contacts available</Typography>
                                            </Box>
                                        ) : (
                                            <List disablePadding>
                                                {childData.teachers.map((tc, i) => (
                                                    <ListItem key={i} sx={{ px: 0, transition: 'all 180ms ease', borderRadius: 2, '&:hover': { bgcolor: 'action.hover', px: 1 } }}>
                                                        <ListItemAvatar>
                                                            <Avatar sx={{ bgcolor: 'rgba(251,191,36,0.15)', color: '#FBBF24', fontWeight: 700 }}>
                                                                {tc.users?.username?.[0] || 'T'}
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={<Typography variant="body2" fontWeight={600}>{tc.users?.username}</Typography>}
                                                            secondary={`${tc.name} · ${tc.users?.email}`}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}
                </>
            )}
        </Box>
    );
}
