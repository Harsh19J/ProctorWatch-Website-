import { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Chip, LinearProgress,
    IconButton, Button, Avatar, Divider,
} from '@mui/material';
import {
    ChevronLeft, ChevronRight, CalendarMonth,
    AccessTime, School, PlayArrow, CheckCircle, Schedule,
} from '@mui/icons-material';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

function getStatus(test) {
    const now = new Date();
    const start = new Date(test.start_time);
    const end = new Date(test.end_time);
    if (now < start) return { label: 'Upcoming', color: '#0284C7', bg: 'rgba(2,132,199,0.12)' };
    if (now >= start && now <= end) return { label: 'Live', color: '#16a34a', bg: 'rgba(22,163,74,0.12)' };
    return { label: 'Ended', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };
}

export default function StudentCalendar() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [today] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const isParent = user?.role === 'parent';

    useEffect(() => {
        loadTests();
    }, [user]);

    const loadTests = async () => {
        try {
            setLoading(true);
            if (isParent) {
                // Use the dedicated parent endpoint to get children
                const children = await api.get('/api/users/my-children');
                if (children && children.length > 0) {
                    // Load all tests — filter by enrolled courses later
                    const allTests = await api.get('/api/tests');
                    setTests(allTests || []);
                } else {
                    setTests([]);
                }
            } else {
                const allTests = await api.get('/api/tests');
                setTests(allTests || []);
            }
        } catch (err) {
            console.error('Calendar load error:', err);
            setTests([]);
        } finally {
            setLoading(false);
        }
    };

    // Build map: "YYYY-MM-DD" → [tests]
    const testsByDate = {};
    tests.forEach(t => {
        if (!t.start_time) return;
        const key = new Date(t.start_time).toISOString().slice(0, 10);
        if (!testsByDate[key]) testsByDate[key] = [];
        testsByDate[key].push(t);
    });

    // Calendar grid
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const todayStr = today.toISOString().slice(0, 10);

    const getDayKey = (d) => {
        if (!d) return null;
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    };

    const selectedTests = selectedDay ? (testsByDate[getDayKey(selectedDay)] || []) : [];

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const goToday = () => { setViewDate(new Date()); setSelectedDay(today.getDate()); };

    if (loading) return <LinearProgress sx={{ borderRadius: 8 }} />;

    return (
        <Box sx={{ animation: 'pageEnter 0.4s ease both' }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ animation: 'fadeSlideRight 0.45s ease both' }}>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
                        {isParent ? "Child's " : ''}
                        <Box component="span" sx={{ background: 'linear-gradient(90deg, #FBBF24, #D97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Exam Calendar
                        </Box>
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        {tests.length} exam{tests.length !== 1 ? 's' : ''} scheduled · Click a date to see details
                    </Typography>
                </Box>
                <Button variant="outlined" onClick={goToday}
                    sx={{ borderRadius: '10px', fontWeight: 600, height: 38 }}>
                    Today
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
                {/* ── Calendar grid ── */}
                <Card sx={{ flex: 1, minWidth: 0, animation: 'fadeSlideRight 0.5s ease 0.1s both' }}>
                    <CardContent sx={{ p: 3 }}>
                        {/* Month nav */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <IconButton onClick={prevMonth} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                                <ChevronLeft />
                            </IconButton>
                            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                                {MONTHS[month]} {year}
                            </Typography>
                            <IconButton onClick={nextMonth} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                                <ChevronRight />
                            </IconButton>
                        </Box>

                        {/* Day headers */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
                            {DAYS.map(d => (
                                <Box key={d} sx={{ textAlign: 'center', py: 0.75 }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary"
                                        sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        {d}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* Date cells */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                            {cells.map((day, idx) => {
                                if (!day) return <Box key={`empty-${idx}`} />;
                                const key = getDayKey(day);
                                const dayTests = testsByDate[key] || [];
                                const isToday = key === todayStr;
                                const isSelected = selectedDay === day
                                    && year === viewDate.getFullYear()
                                    && month === viewDate.getMonth();
                                const hasExams = dayTests.length > 0;
                                const hasLive = dayTests.some(t => getStatus(t).label === 'Live');
                                const dotColor = hasLive ? '#16a34a' : '#D97706';

                                return (
                                    <Box
                                        key={key}
                                        onClick={() => setSelectedDay(day)}
                                        sx={{
                                            minHeight: 52, p: 0.75,
                                            borderRadius: 2,
                                            cursor: hasExams ? 'pointer' : 'default',
                                            position: 'relative',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                            transition: 'all 180ms ease',
                                            bgcolor: isSelected
                                                ? 'rgba(217,119,6,0.15)'
                                                : isToday
                                                    ? 'rgba(217,119,6,0.07)'
                                                    : 'transparent',
                                            border: '1px solid',
                                            borderColor: isSelected
                                                ? 'rgba(217,119,6,0.5)'
                                                : isToday
                                                    ? 'rgba(217,119,6,0.25)'
                                                    : 'transparent',
                                            '&:hover': hasExams ? {
                                                bgcolor: 'rgba(217,119,6,0.1)',
                                                borderColor: 'rgba(217,119,6,0.3)',
                                                transform: 'scale(1.05)',
                                            } : {},
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            fontWeight={isToday || isSelected ? 800 : 400}
                                            sx={{
                                                width: 28, height: 28,
                                                borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                bgcolor: isToday ? '#D97706' : 'transparent',
                                                color: isToday ? '#fff' : 'text.primary',
                                                fontSize: '0.82rem',
                                            }}
                                        >
                                            {day}
                                        </Typography>
                                        {/* Exam dots */}
                                        {hasExams && (
                                            <Box sx={{ display: 'flex', gap: '2px', mt: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                                                {dayTests.slice(0, 3).map((t, i) => (
                                                    <Box key={i} sx={{
                                                        width: 5, height: 5, borderRadius: '50%',
                                                        bgcolor: getStatus(t).color,
                                                        animation: hasLive ? 'pulseDot 1.8s ease-in-out infinite' : 'none',
                                                    }} />
                                                ))}
                                                {dayTests.length > 3 && (
                                                    <Typography sx={{ fontSize: '0.55rem', color: dotColor, fontWeight: 700, lineHeight: '5px' }}>
                                                        +{dayTests.length - 3}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Legend */}
                        <Box sx={{ display: 'flex', gap: 2.5, mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap' }}>
                            {[
                                { color: '#D97706', label: 'Today' },
                                { color: '#0284C7', label: 'Upcoming Exam' },
                                { color: '#16a34a', label: 'Live Now' },
                                { color: '#6B7280', label: 'Ended' },
                            ].map(l => (
                                <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: l.color }} />
                                    <Typography variant="caption" color="text.secondary" fontWeight={500}>{l.label}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </CardContent>
                </Card>

                {/* ── Side panel ── */}
                <Box sx={{ width: { xs: '100%', lg: 340 }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Selected day exams */}
                    <Card sx={{ animation: 'fadeSlideLeft 0.5s ease 0.15s both', flex: 1 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(217,119,6,0.1)', color: '#D97706', display: 'flex' }}>
                                    <CalendarMonth sx={{ fontSize: 20 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        {selectedDay
                                            ? `${MONTHS[month]} ${selectedDay}`
                                            : 'Select a Date'}
                                    </Typography>
                                    {selectedDay && (
                                        <Typography variant="caption" color="text.secondary">
                                            {selectedTests.length} exam{selectedTests.length !== 1 ? 's' : ''} scheduled
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {!selectedDay ? (
                                <Box sx={{ textAlign: 'center', py: 5 }}>
                                    <CalendarMonth sx={{ fontSize: 52, color: 'text.secondary', mb: 1.5, opacity: 0.4 }} />
                                    <Typography color="text.secondary" variant="body2">
                                        Click any date on the calendar to view scheduled exams
                                    </Typography>
                                </Box>
                            ) : selectedTests.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 5 }}>
                                    <CheckCircle sx={{ fontSize: 44, color: 'text.secondary', mb: 1.5, opacity: 0.3 }} />
                                    <Typography color="text.secondary" fontWeight={500}>No exams on this day</Typography>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 440, overflowY: 'auto', pr: 0.5 }}>
                                    {selectedTests.map((test, idx) => {
                                        const st = getStatus(test);
                                        const isLive = st.label === 'Live';
                                        return (
                                            <Box key={test.id} sx={{
                                                p: 2, borderRadius: 2,
                                                border: '1px solid', borderColor: `${st.color}30`,
                                                bgcolor: st.bg,
                                                transition: 'all 200ms ease',
                                                '&:hover': { transform: 'translateX(4px)', borderColor: `${st.color}60` },
                                                animation: `fadeSlideUp 0.35s ease ${idx * 0.07}s both`,
                                            }}>
                                                {/* Title row */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                    <Typography variant="body2" fontWeight={700} sx={{ flex: 1, mr: 1, lineHeight: 1.4 }}>
                                                        {test.title}
                                                    </Typography>
                                                    <Chip
                                                        label={st.label}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: st.bg, color: st.color, fontWeight: 700,
                                                            border: `1px solid ${st.color}40`, fontSize: '0.67rem',
                                                            height: 20, flexShrink: 0,
                                                            ...(isLive && { animation: 'pulseDot 1.8s ease-in-out infinite' }),
                                                        }}
                                                    />
                                                </Box>

                                                {/* Course */}
                                                {test.courses?.name && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                                                        <School sx={{ fontSize: 13, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                            {test.courses.name}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {/* Time */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                                                    <AccessTime sx={{ fontSize: 13, color: 'text.secondary' }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(test.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {' — '}
                                                        {new Date(test.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {' · '}{test.duration_minutes} min
                                                    </Typography>
                                                </Box>

                                                {/* Action */}
                                                {!isParent && (
                                                    <Button
                                                        fullWidth size="small" variant={isLive ? 'contained' : 'outlined'}
                                                        startIcon={isLive ? <PlayArrow sx={{ fontSize: 16 }} /> : <Schedule sx={{ fontSize: 16 }} />}
                                                        disabled={!isLive}
                                                        onClick={() => navigate(`/dashboard/exam/${test.id}`)}
                                                        sx={{
                                                            borderRadius: '8px', fontWeight: 700, height: 32, fontSize: '0.78rem',
                                                            ...(isLive && {
                                                                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                                                                boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
                                                            }),
                                                        }}
                                                    >
                                                        {isLive ? 'Start Exam' : st.label === 'Upcoming' ? 'Not Started Yet' : 'Exam Ended'}
                                                    </Button>
                                                )}
                                                {isParent && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                                        Monitoring view only
                                                    </Typography>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming exams summary */}
                    <Card sx={{ animation: 'fadeSlideLeft 0.5s ease 0.25s both' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem', color: 'text.secondary' }}>
                                Upcoming This Month
                            </Typography>
                            {(() => {
                                const upcoming = tests.filter(t => {
                                    const d = new Date(t.start_time);
                                    return d.getFullYear() === year && d.getMonth() === month && new Date(t.end_time) >= new Date();
                                }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

                                if (upcoming.length === 0) return (
                                    <Typography variant="caption" color="text.secondary">No exams this month</Typography>
                                );

                                return upcoming.slice(0, 4).map((t, i) => {
                                    const st = getStatus(t);
                                    return (
                                        <Box key={t.id} sx={{
                                            display: 'flex', alignItems: 'center', gap: 1.5,
                                            py: 1, borderBottom: i < Math.min(upcoming.length, 4) - 1 ? '1px solid' : 'none',
                                            borderColor: 'divider',
                                        }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: `${st.color}15`, color: st.color, fontSize: '0.7rem', fontWeight: 800, border: `1px solid ${st.color}30` }}>
                                                {new Date(t.start_time).getDate()}
                                            </Avatar>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="caption" fontWeight={700} noWrap sx={{ display: 'block' }}>{t.title}</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                                    {new Date(t.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {t.duration_minutes} min
                                                </Typography>
                                            </Box>
                                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: st.color, flexShrink: 0 }} />
                                        </Box>
                                    );
                                });
                            })()}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}
