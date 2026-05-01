import { useState, useEffect, useRef } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Chip, Button,
    LinearProgress, Avatar,
} from '@mui/material';
import {
    CalendarMonth, TrendingUp, PlayArrow,
    CheckCircle, Schedule, Flag, Warning, Videocam, Assignment,
} from '@mui/icons-material';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import AdminAuthDialog from '../../components/AdminAuthDialog';
import { useNavigate } from 'react-router-dom';
import DownloadBanner from '../../components/DownloadBanner';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

// ─── Animated stat card ───────────────────────────────────────────────────────
function AnimStat({ value, label, color, icon, delay = 0 }) {
    const { ref, display } = useAnimatedCounter(value);
    return (
        <Box
            ref={ref}
            sx={{
                textAlign: 'center', p: 2.5, borderRadius: 3,
                bgcolor: `${color}0A`,
                border: `1px solid ${color}20`,
                transition: 'all 220ms ease',
                '&:hover': { transform: 'translateY(-4px)', borderColor: `${color}45`, bgcolor: `${color}12` },
                animation: `scaleIn 0.45s ease ${delay}s both`,
                cursor: 'default',
            }}
        >
            <Box sx={{ color, mb: 1, display: 'flex', justifyContent: 'center' }}>{icon}</Box>
            <Typography variant="h4" fontWeight={900} sx={{ color, lineHeight: 1, letterSpacing: '-0.03em' }}>
                {display}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mt: 0.5, display: 'block' }}>
                {label}
            </Typography>
        </Box>
    );
}

export default function StudentDashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [pastResults, setPastResults] = useState([]);
    const [mySessionMap, setMySessionMap] = useState({});
    const [flagCount, setFlagCount] = useState(0);
    const [faceRegistered, setFaceRegistered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [adminAuthOpen, setAdminAuthOpen] = useState(false);

    useEffect(() => {
        if (user) { loadData(); fetchSessionMap(); }
    }, [user]);

    const loadData = async () => {
        try {
            setFaceRegistered(false);
            const tests = await api.get('/api/tests');
            const now = new Date();
            setUpcomingExams(tests.filter(t => new Date(t.end_time) > now));
            const allSessions = await api.get('/api/sessions');
            const past = allSessions.filter(s => ['completed', 'invalidated'].includes(s.status));
            setPastResults(past.map(s => ({ ...s, tests: s.test })));
            const flags = await api.get('/api/flags');
            setFlagCount(flags.length);
        } catch (error) { console.error('Error loading dashboard:', error); }
        finally { setLoading(false); }
    };

    const fetchSessionMap = async () => {
        if (!user) return;
        const data = await api.get('/api/sessions');
        const map = {};
        for (const s of (data || [])) {
            if (!map[s.test_id]) {
                map[s.test_id] = { status: s.status, sessionId: s.id, score: s.score, totalMarks: s.test?.total_marks };
            }
        }
        setMySessionMap(map);
    };

    const getExamState = (test) => {
        const now = new Date(); const start = new Date(test.start_time); const end = new Date(test.end_time);
        const session = mySessionMap[test.id];
        if (session) return session.status;
        if (now > end) return 'ended';
        const minsToStart = (start - now) / 60000;
        if (minsToStart > 5) return 'upcoming';
        return 'ready';
    };

    const avgScore = pastResults.length > 0
        ? Math.round(pastResults.reduce((a, s) => a + (s.score || 0), 0) / pastResults.length)
        : 0;

    if (loading) return <LinearProgress sx={{ borderRadius: 8 }} />;

    return (
        <Box sx={{ animation: 'pageEnter 0.4s ease both' }}>
            <AdminAuthDialog
                open={adminAuthOpen}
                onClose={() => setAdminAuthOpen(false)}
                onSuccess={() => alert('Face ID reset. Please use the ProctorWatch desktop app to re-register your face.')}
                title="Reset Face ID Verification"
            />

            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ animation: 'fadeSlideRight 0.45s ease both' }}>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
                        Welcome back,{' '}
                        <Box component="span" sx={{ background: 'linear-gradient(90deg, #0284C7, #FBBF24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {user.full_name || user.username?.split('@')[0]}
                        </Box>
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        View your upcoming exams, past results, and performance.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', animation: 'fadeSlideLeft 0.45s ease both' }}>
                    <Chip
                        icon={faceRegistered ? <CheckCircle sx={{ fontSize: 14 }} /> : <Warning sx={{ fontSize: 14 }} />}
                        label={faceRegistered ? 'Face ID Active' : 'Face ID Pending'}
                        color={faceRegistered ? 'success' : 'warning'}
                        variant="outlined"
                        onClick={() => faceRegistered ? setAdminAuthOpen(true) : navigate('/dashboard/face-registration')}
                        sx={{ cursor: 'pointer', fontWeight: 600 }}
                    />
                    <Button
                        variant="outlined" startIcon={<Videocam />}
                        onClick={() => navigate('/dashboard/pw-test')}
                        size="small"
                        sx={{ borderRadius: '10px' }}
                    >
                        System Check
                    </Button>
                </Box>
            </Box>

            <DownloadBanner feature="Exam Taking" />

            {/* Stats */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid item xs={4}>
                    <AnimStat value={pastResults.length} label="Exams Taken" color="#D97706" icon={<Assignment sx={{ fontSize: 22 }} />} delay={0.1} />
                </Grid>
                <Grid item xs={4}>
                    <AnimStat value={avgScore} label="Avg Score" color="#0284C7" icon={<TrendingUp sx={{ fontSize: 22 }} />} delay={0.18} />
                </Grid>
                <Grid item xs={4}>
                    <AnimStat value={flagCount} label="Total Flags" color={flagCount > 0 ? '#B45309' : '#0284C7'} icon={<Flag sx={{ fontSize: 22 }} />} delay={0.26} />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Upcoming Exams */}
                <Grid item xs={12} md={7} sx={{ animation: 'fadeSlideRight 0.5s ease 0.1s both' }}>
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(217,119,6,0.1)', color: '#D97706', display: 'flex' }}>
                                    <CalendarMonth sx={{ fontSize: 20 }} />
                                </Box>
                                <Typography variant="h6" fontWeight={700}>Upcoming Exams</Typography>
                            </Box>
                            {upcomingExams.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 5 }}>
                                    <Schedule sx={{ fontSize: 52, color: 'text.secondary', mb: 1.5, animation: 'pulseDot 2s ease-in-out infinite' }} />
                                    <Typography color="text.secondary" fontWeight={500}>No upcoming exams</Typography>
                                    <Typography variant="caption" color="text.secondary">Check back later for scheduled exams</Typography>
                                </Box>
                            ) : (
                                <Box sx={{ maxHeight: 340, overflowY: 'auto', pr: 0.5 }}>
                                    {upcomingExams.map((exam, idx) => {
                                        const state = getExamState(exam);
                                        const session = mySessionMap[exam.id];
                                        const start = new Date(exam.start_time);
                                        const stateColors = { ready: '#0284C7', active: '#78350F', completed: '#0284C7', invalidated: '#B45309', ended: 'rgba(128,128,128,0.4)', upcoming: 'rgba(217,119,6,0.3)' };
                                        const bc = stateColors[state] || 'divider';
                                        return (
                                            <Box key={exam.id} sx={{
                                                p: 2, mb: 1.5, borderRadius: 2,
                                                border: '1px solid', borderColor: bc,
                                                bgcolor: `${bc}08`,
                                                transition: 'all 200ms ease',
                                                '&:hover': { transform: 'translateX(4px)', borderColor: bc },
                                                animation: `fadeSlideUp 0.4s ease ${idx * 0.07}s both`,
                                            }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                    <Box>
                                                        <Typography variant="body1" fontWeight={700}>{exam.title}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {exam.courses?.name} · {exam.duration_minutes} min · {start.toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                    {(state === 'ready' || state === 'active') && <DownloadBanner feature="Exam Taking" compact />}
                                                    {state === 'completed' && (
                                                        <Chip icon={<CheckCircle />}
                                                            label={session?.score != null ? `✓ ${session.score}/${session.totalMarks ?? '?'}` : '✓ Submitted'}
                                                            size="small" color="success" variant="outlined"
                                                            onClick={() => session?.sessionId && navigate(`/dashboard/results/${session.sessionId}`)}
                                                            sx={{ cursor: 'pointer' }} />
                                                    )}
                                                    {state === 'invalidated' && <Chip label="INVALIDATED" size="small" color="error" />}
                                                    {state === 'ended' && <Chip label="Session Ended" size="small" variant="outlined" sx={{ color: 'text.disabled', borderColor: 'text.disabled' }} />}
                                                    {state === 'upcoming' && <Chip label={`Starts ${start.toLocaleDateString()}`} size="small" variant="outlined" />}
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Results */}
                <Grid item xs={12} md={5} sx={{ animation: 'fadeSlideLeft 0.5s ease 0.15s both' }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(78,205,196,0.1)', color: '#0284C7', display: 'flex' }}>
                                    <TrendingUp sx={{ fontSize: 20 }} />
                                </Box>
                                <Typography variant="h6" fontWeight={700}>Recent Results</Typography>
                            </Box>
                            {pastResults.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 5 }}>
                                    <Assignment sx={{ fontSize: 52, color: 'text.secondary', mb: 1.5, animation: 'pulseDot 2s ease-in-out infinite' }} />
                                    <Typography color="text.secondary" fontWeight={500}>No results yet</Typography>
                                </Box>
                            ) : (
                                <Box sx={{ maxHeight: 340, overflowY: 'auto', pr: 0.5 }}>
                                    {pastResults.map((result, idx) => (
                                        <Box key={result.id}
                                            onClick={() => navigate(`/dashboard/results/${result.id}`)}
                                            sx={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                p: 1.75, mb: 1, borderRadius: 2,
                                                bgcolor: result.status === 'invalidated' ? 'rgba(180,83,9,0.04)' : 'action.hover',
                                                cursor: 'pointer',
                                                transition: 'all 180ms ease',
                                                border: '1px solid transparent',
                                                '&:hover': { bgcolor: 'action.selected', borderColor: 'divider', transform: 'translateX(3px)' },
                                                animation: `fadeSlideUp 0.38s ease ${idx * 0.06}s both`,
                                            }}
                                        >
                                            <Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>{result.tests?.title || 'Unknown Test'}</Typography>
                                                    {result.status === 'invalidated' && (
                                                        <Chip label="VOID" size="small" color="error" sx={{ height: 16, fontSize: 9, fontWeight: 700 }} />
                                                    )}
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {result.ended_at ? new Date(result.ended_at).toLocaleDateString() : '—'}
                                                </Typography>
                                            </Box>
                                            {result.status === 'invalidated' ? (
                                                <Typography variant="body2" fontWeight={700} color="error">VOID</Typography>
                                            ) : (
                                                <Chip
                                                    label={`${result.score || 0}/${result.tests?.total_marks || 0}`}
                                                    size="small" color="primary" variant="outlined"
                                                />
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
