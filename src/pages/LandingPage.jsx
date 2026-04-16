import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Container, Grid, Card, CardContent,
    IconButton, Chip, Tab, Tabs, TextField, Divider, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    Shield, Psychology, Speed, Group, BarChart, VideoLibrary,
    Download, Login, LightMode, DarkMode, Menu, Close,
    CheckCircle, ArrowForward, Star, Email, Phone, LocationOn,
    Send, GitHub, Twitter, LinkedIn, Computer, Schedule, Verified,
    MonitorHeart, AdminPanelSettings, School, FamilyRestroom, Build,
    ArrowRightAlt, PlayCircle, BubbleChart, AutoAwesome,
} from '@mui/icons-material';
import { useThemeMode } from '../ThemeContext';

// ─── Asset imports ──────────────────────────────────────────────────────────
import heroDashboard from '../assets/hero_dashboard.png';
import analyticsImg from '../assets/analytics_dash.png';
import liveMonitorImg from '../assets/live_monitor.png';
import testCreationImg from '../assets/test_creation.png';
import roleDashboards from '../assets/role_dashboards.png';

// ─── Tiny floating orb ──────────────────────────────────────────────────────
function Orb({ size, x, y, color, delay = 0 }) {
    return (
        <Box sx={{
            position: 'absolute', width: size, height: size, left: x, top: y, borderRadius: '50%',
            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
            animation: `floatOrb ${6 + delay}s ease-in-out infinite alternate`,
            animationDelay: `${delay}s`, pointerEvents: 'none',
            '@keyframes floatOrb': {
                '0%': { transform: 'translateY(0px) scale(1)' },
                '100%': { transform: 'translateY(-28px) scale(1.04)' },
            },
        }} />
    );
}

// ─── Image in a styled frame ─────────────────────────────────────────────────
function FramedImage({ src, alt, glowColor = '#6C63FF', floatAnim = false }) {
    return (
        <Box sx={{ position: 'relative', width: '100%' }}>
            {/* Glow halo */}
            <Box sx={{
                position: 'absolute', inset: -16,
                background: `radial-gradient(ellipse, ${glowColor}30 0%, transparent 70%)`,
                borderRadius: 4, filter: 'blur(24px)', zIndex: 0,
            }} />
            {/* Screenshot frame */}
            <Box sx={{
                position: 'relative', zIndex: 1,
                borderRadius: 3, overflow: 'hidden',
                border: `1px solid ${glowColor}40`,
                boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${glowColor}20`,
                animation: floatAnim ? 'imgFloat 6s ease-in-out infinite alternate' : 'none',
                '@keyframes imgFloat': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-10px)' },
                },
            }}>
                {/* Fake browser bar */}
                <Box sx={{ bgcolor: '#1a1f2e', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderBottom: `1px solid ${glowColor}20` }}>
                    {['#FF4D6A', '#FFB74D', '#4ECDC4'].map((c, i) => (
                        <Box key={i} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />
                    ))}
                    <Box sx={{ flex: 1, mx: 2, bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: 18 }} />
                </Box>
                <Box component="img" src={src} alt={alt} sx={{ width: '100%', display: 'block' }} />
            </Box>
        </Box>
    );
}

// ─── Section header ──────────────────────────────────────────────────────────
function SectionHeader({ chip, chipColor = '#6C63FF', title, highlight, after = '', subtitle }) {
    return (
        <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label={chip} sx={{ mb: 2.5, bgcolor: `${chipColor}18`, color: chipColor, fontWeight: 700, border: `1px solid ${chipColor}30`, fontSize: '0.8rem' }} />
            <Typography variant="h2" fontWeight={900} sx={{ mb: 2, fontSize: { xs: '2rem', md: '2.8rem' } }}>
                {title}{' '}
                {highlight && (
                    <Box component="span" sx={{ background: `linear-gradient(90deg, ${chipColor}, #00D9FF)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {highlight}
                    </Box>
                )}
                {after}
            </Typography>
            {subtitle && (
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto', fontWeight: 400, lineHeight: 1.7 }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
}

// ─── Data ────────────────────────────────────────────────────────────────────
const FEATURES = [
    { icon: <Shield fontSize="large" />, color: '#6C63FF', title: 'ArcFace Verification', desc: 'ResNet-50 with 512D embeddings and MiniFASNet liveness detection ensures only the right student takes the exam.', tag: 'AI · Biometric' },
    { icon: <Psychology fontSize="large" />, color: '#00D9FF', title: 'Audio Intelligence', desc: 'Silero VAD + FFT spectral analysis detects nearby speech with ambient noise calibration and lip-sync correlation.', tag: 'AI · Acoustic' },
    { icon: <MonitorHeart fontSize="large" />, color: '#FF4D6A', title: 'Real-Time Monitoring', desc: 'Invigilators see live webcam feeds, flag counts, and active session status — intervene with a single click.', tag: 'Live · Dashboard' },
    { icon: <Group fontSize="large" />, color: '#4ECDC4', title: 'Multi-Role Dashboards', desc: 'Tailored views for Students, Teachers, Admins, Parents and Technical staff with role-scoped permissions.', tag: '5 Roles' },
    { icon: <BarChart fontSize="large" />, color: '#FFB74D', title: 'Deep Analytics', desc: 'Score distributions, flag breakdowns by module, performance trends and CSV export powered by Recharts.', tag: 'Reports' },
    { icon: <VideoLibrary fontSize="large" />, color: '#FF9800', title: 'Evidence Capture', desc: 'Circular buffer captures 30-second clips on every flag. Teachers and admins review evidence with full audit logs.', tag: 'Video · Audit' },
];

const ROLES = [
    { label: 'Student', icon: <School />, color: '#6C63FF', desc: 'View upcoming exams, check scores, track performance, and access your calendar — all from the browser.', bullets: ['Upcoming exam schedule', 'Score & performance history', 'Exam result breakdowns', 'Personal calendar view'] },
    { label: 'Teacher', icon: <Verified />, color: '#00D9FF', desc: 'Create and manage tests with AI-generated questions, review proctoring flags, grade exams, and manage courses.', bullets: ['AI-powered test creation', 'Flag review + evidence video', 'Grading & score overrides', 'Course enrollment management'] },
    { label: 'Admin', icon: <AdminPanelSettings />, color: '#FF4D6A', desc: 'Full platform oversight — manage all users, courses, analytics reports, and configure the application blacklist.', bullets: ['User CRUD + bulk CSV upload', 'Institution-wide analytics', 'Application blacklist config', 'Audit log access'] },
    { label: 'Parent', icon: <FamilyRestroom />, color: '#4ECDC4', desc: "Monitor your child's academic progress — upcoming exams, scores, integrity metrics, and teacher contacts.", bullets: ['Child performance dashboard', 'Upcoming exam schedule', 'Integrity & flag summary', 'Teacher contact info'] },
    { label: 'Technical', icon: <Build />, color: '#FFB74D', desc: 'Database inspection, audit log review, and live system schema visualization for platform maintenance.', bullets: ['Audit trail review', 'Schema diagrams', 'Blacklist configuration', 'Emergency controls'] },
];

const PRICING = [
    { title: 'Starter', price: 'Free', period: '', color: '#6C63FF', features: ['Up to 50 students', '2 teacher accounts', 'Basic analytics', 'Email support'], cta: 'Get Started' },
    { title: 'Institution', price: '₹XXXXX', period: '/month', color: '#00D9FF', features: ['Unlimited students', 'Unlimited teachers', 'Advanced analytics + CSV', 'Priority support', 'Custom branding'], cta: 'Contact Sales', popular: true },
    { title: 'Enterprise', price: 'Custom', period: '', color: '#4ECDC4', features: ['Multi-institution', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'On-premise option'], cta: 'Talk to Us' },
];

const HOW_STEPS = [
    {
        step: '01', color: '#6C63FF', icon: <Computer sx={{ fontSize: 28 }} />, title: 'Install & Configure',
        desc: 'Your institution admin downloads the ProctorWatch Windows app, creates user accounts in bulk via CSV, sets up courses, and configures the application blacklist. Everything syncs to the cloud in seconds.',
        bullets: ['One-click bulk user import via CSV', 'Course and enrollment setup', 'App blacklist configuration', 'Role assignment per user'],
        img: liveMonitorImg,
        imgAlt: 'Admin dashboard setup',
        imgColor: '#6C63FF',
    },
    {
        step: '02', color: '#00D9FF', icon: <AutoAwesome sx={{ fontSize: 28 }} />, title: 'Create Tests with AI',
        desc: 'Teachers build exams using a rich text editor with LaTeX/image support, or let the AI Question Generator (powered by Gemini/Groq) auto-generate a complete question set from a topic prompt in seconds.',
        bullets: ['AI question generation from topic prompts', 'Rich text + code + image questions', 'Negative marking & randomization', 'Schedule exam windows per course'],
        img: testCreationImg,
        imgAlt: 'Test creation interface',
        imgColor: '#00D9FF',
    },
    {
        step: '03', color: '#4ECDC4', icon: <BarChart sx={{ fontSize: 28 }} />, title: 'Review Evidence & Analytics',
        desc: 'After exams, teachers and admins review AI-generated proctoring flags, watch 30-second evidence clips, and access rich analytics dashboards with score distributions, flag breakdowns, and course-level trends.',
        bullets: ['Flag review with evidence video', 'Score override & grading tools', 'Institution-wide analytics', 'CSV export for reports'],
        img: analyticsImg,
        imgAlt: 'Analytics dashboard',
        imgColor: '#4ECDC4',
    },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LandingPage() {
    const navigate = useNavigate();
    const { mode, toggleMode } = useThemeMode();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileMenu, setMobileMenu] = useState(false);
    const [roleTab, setRoleTab] = useState(0);
    const [pageTab, setPageTab] = useState(0); // for Pricing/Contact tab section
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [contactSent, setContactSent] = useState(false);

    const isDark = mode === 'dark';
    const bg = isDark ? '#0A0E1A' : '#F0F4FF';
    const cardBg = isDark ? 'rgba(17,24,39,0.85)' : 'rgba(255,255,255,0.95)';
    const border = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(108,99,255,0.12)';
    const sectionBg = isDark ? 'rgba(15,20,40,0.6)' : 'rgba(108,99,255,0.04)';

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Dashboards', href: '#dashboards' },
        { label: 'Pricing & Contact', href: '#pricing-contact' },
    ];

    const handleContact = (e) => {
        e.preventDefault();
        setContactSent(true);
        setContactForm({ name: '', email: '', message: '' });
    };

    return (
        <Box sx={{ bgcolor: bg, minHeight: '100vh', color: 'text.primary' }}>

            {/* ═══ NAVBAR ═════════════════════════════════════════════════════ */}
            <Box component="nav" sx={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100,
                backdropFilter: 'blur(24px) saturate(180%)',
                bgcolor: isDark ? 'rgba(10,14,26,0.88)' : 'rgba(240,244,255,0.88)',
                borderBottom: `1px solid ${border}`, transition: 'all 0.3s',
            }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1.5, gap: 2 }}>
                        {/* Logo */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <Box sx={{ width: 38, height: 38, borderRadius: '10px', background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(108,99,255,0.4)' }}>
                                <Shield sx={{ fontSize: 20, color: '#fff' }} />
                            </Box>
                            <Typography variant="h6" fontWeight={800} sx={{ background: 'linear-gradient(90deg, #6C63FF, #00D9FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                ProctorWatch
                            </Typography>
                        </Box>

                        {!isMobile && (
                            <Box sx={{ display: 'flex', gap: 0.5, ml: 4, flex: 1 }}>
                                {navLinks.map(link => (
                                    <Button key={link.label} href={link.href} sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: '#6C63FF', bgcolor: 'transparent' }, transition: 'color 0.2s' }}>
                                        {link.label}
                                    </Button>
                                ))}
                            </Box>
                        )}

                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton onClick={toggleMode} size="small" sx={{ color: 'text.secondary' }}>
                                {isDark ? <LightMode sx={{ fontSize: 20 }} /> : <DarkMode sx={{ fontSize: 20 }} />}
                            </IconButton>
                            {!isMobile && (
                                <>
                                    <Button variant="outlined" size="small" startIcon={<Login />} onClick={() => navigate('/login')}
                                        sx={{ borderColor: 'rgba(108,99,255,0.5)', color: '#6C63FF', '&:hover': { borderColor: '#6C63FF', bgcolor: 'rgba(108,99,255,0.08)' } }}>
                                        Login
                                    </Button>
                                    <Button variant="contained" size="small" startIcon={<Download />} href="#pricing-contact"
                                        sx={{ background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.4)', '&:hover': { boxShadow: '0 6px 20px rgba(108,99,255,0.6)' } }}>
                                        Download
                                    </Button>
                                </>
                            )}
                            {isMobile && (
                                <IconButton onClick={() => setMobileMenu(!mobileMenu)}>
                                    {mobileMenu ? <Close /> : <Menu />}
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                </Container>
                {mobileMenu && (
                    <Box sx={{ px: 3, pb: 2, borderTop: `1px solid ${border}` }}>
                        {navLinks.map(link => (
                            <Button key={link.label} fullWidth href={link.href} sx={{ justifyContent: 'flex-start', color: 'text.primary', py: 1 }} onClick={() => setMobileMenu(false)}>
                                {link.label}
                            </Button>
                        ))}
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Button fullWidth variant="outlined" onClick={() => navigate('/login')} sx={{ borderColor: '#6C63FF', color: '#6C63FF' }}>Login</Button>
                            <Button fullWidth variant="contained" href="#pricing-contact" sx={{ background: 'linear-gradient(135deg, #6C63FF, #00D9FF)' }}>Download</Button>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
            <Box id="home" sx={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', pt: 8 }}>
                <Box sx={{ position: 'absolute', inset: 0, background: isDark ? 'linear-gradient(135deg, #0A0E1A 0%, #0F1629 50%, #0A0E1A 100%)' : 'linear-gradient(135deg, #F0F4FF 0%, #E8EFFE 100%)' }} />
                <Box sx={{ position: 'absolute', inset: 0, opacity: isDark ? 0.03 : 0.05, backgroundImage: 'linear-gradient(rgba(108,99,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
                <Orb size={600} x="-15%" y="5%" color="#6C63FF" delay={0} />
                <Orb size={500} x="55%" y="45%" color="#00D9FF" delay={2} />
                <Orb size={350} x="75%" y="-5%" color="#FF4D6A" delay={4} />

                <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 4 } }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={5}>
                            <Chip label="✦ AI Question Generation — Powered by Gemini" sx={{ mb: 3, bgcolor: 'rgba(108,99,255,0.12)', color: '#8B85FF', fontWeight: 600, border: '1px solid rgba(108,99,255,0.25)', fontSize: '0.78rem' }} />
                            <Typography variant="h1" fontWeight={900} sx={{ fontSize: { xs: '2.4rem', md: '3.2rem', lg: '3.8rem' }, lineHeight: 1.08, mb: 3 }}>
                                <Box component="span" sx={{ color: 'text.primary' }}>AI-Powered</Box><br />
                                <Box component="span" sx={{ background: 'linear-gradient(90deg, #6C63FF, #00D9FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Exam Integrity
                                </Box><br />
                                <Box component="span" sx={{ color: 'text.primary' }}>Platform</Box>
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 460, fontWeight: 400, lineHeight: 1.75 }}>
                                Proctor exams with face verification, audio intelligence, and live monitoring. Manage tests, users, results, and evidence from one unified portal.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5 }}>
                                <Button variant="contained" size="large" endIcon={<ArrowForward />} onClick={() => navigate('/login')}
                                    sx={{ background: 'linear-gradient(135deg, #6C63FF, #8B85FF)', boxShadow: '0 8px 28px rgba(108,99,255,0.55)', px: 4, py: 1.5, fontSize: '1rem', fontWeight: 700 }}>
                                    Access Dashboard
                                </Button>
                                <Button variant="outlined" size="large" startIcon={<Download />} href="#pricing-contact"
                                    sx={{ borderColor: 'rgba(148,163,184,0.35)', color: 'text.primary', px: 4, py: 1.5, '&:hover': { borderColor: '#6C63FF', bgcolor: 'rgba(108,99,255,0.06)' } }}>
                                    Download App
                                </Button>
                            </Box>
                            {/* Stats inline */}
                            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {[['500+', 'Institutions'], ['50K+', 'Exams Proctored'], ['99.8%', 'Uptime']].map(([val, label]) => (
                                    <Box key={label}>
                                        <Typography variant="h5" fontWeight={900} sx={{ color: '#6C63FF', lineHeight: 1 }}>{val}</Typography>
                                        <Typography variant="caption" color="text.secondary">{label}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={7}>
                            <FramedImage src={heroDashboard} alt="ProctorWatch Dashboard" glowColor="#6C63FF" floatAnim />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* ═══ FEATURES ═══════════════════════════════════════════════════ */}
            <Box id="features" sx={{ py: 14 }}>
                <Container maxWidth="xl">
                    <SectionHeader chip="Core Features" chipColor="#6C63FF" title="Everything You Need for " highlight="Secure Exams" subtitle="A full suite of AI-driven tools designed for modern educational institutions — from biometric verification to deep analytics." />

                    <Grid container spacing={3}>
                        {FEATURES.map((f, i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Card sx={{
                                    bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: 3,
                                    height: '100%', p: 0.5,
                                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                    '&:hover': { transform: 'translateY(-6px)', borderColor: `${f.color}50`, boxShadow: `0 20px 48px ${f.color}20` },
                                }}>
                                    <CardContent sx={{ p: 3.5 }}>
                                        {/* Icon badge */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                                            <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: `${f.color}15`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color }}>
                                                {f.icon}
                                            </Box>
                                            <Chip label={f.tag} size="small" sx={{ bgcolor: `${f.color}10`, color: f.color, fontSize: '0.68rem', fontWeight: 700, border: `1px solid ${f.color}20` }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{f.title}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>{f.desc}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* ═══ HOW IT WORKS ═══════════════════════════════════════════════ */}
            <Box id="how-it-works" sx={{ py: 14, bgcolor: sectionBg, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
                <Container maxWidth="xl">
                    <SectionHeader chip="Workflow" chipColor="#00D9FF" title="How " highlight="ProctorWatch" after=" Works" subtitle="From first setup to post-exam review — three simple stages, each powered by AI." />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {HOW_STEPS.map((step, i) => (
                            <Grid container spacing={6} key={i} alignItems="center" direction={i % 2 === 1 ? 'row-reverse' : 'row'}>
                                {/* Text side */}
                                <Grid item xs={12} md={5}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${step.color}15`, border: `1px solid ${step.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.color, flexShrink: 0 }}>
                                            {step.icon}
                                        </Box>
                                        <Typography fontFamily="monospace" fontWeight={900} sx={{ fontSize: '1.8rem', color: `${step.color}50`, letterSpacing: '-2px' }}>
                                            {step.step}
                                        </Typography>
                                    </Box>
                                    <Typography variant="h4" fontWeight={800} sx={{ mb: 2, lineHeight: 1.2 }}>{step.title}</Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.85 }}>{step.desc}</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {step.bullets.map((b, j) => (
                                            <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: `${step.color}15`, border: `1px solid ${step.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <CheckCircle sx={{ fontSize: 14, color: step.color }} />
                                                </Box>
                                                <Typography variant="body2" fontWeight={500}>{b}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Grid>
                                {/* Image side */}
                                <Grid item xs={12} md={7}>
                                    <FramedImage src={step.img} alt={step.imgAlt} glowColor={step.imgColor} />
                                </Grid>
                            </Grid>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* ═══ ROLE DASHBOARDS ════════════════════════════════════════════ */}
            <Box id="dashboards" sx={{ py: 14 }}>
                <Container maxWidth="xl">
                    <SectionHeader chip="Dashboards" chipColor="#4ECDC4" title="Built for " highlight="Every Role" subtitle="Each user gets a tailored interface with exactly the tools they need — no more, no less." />

                    <Grid container spacing={4}>
                        {/* Role selector tabs vertical */}
                        <Grid item xs={12} md={3}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 1, flexWrap: 'wrap' }}>
                                {ROLES.map((role, i) => (
                                    <Box key={i} onClick={() => setRoleTab(i)} sx={{
                                        p: { xs: 1.5, md: 2 }, borderRadius: 2, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 1.5,
                                        bgcolor: roleTab === i ? `${role.color}15` : 'transparent',
                                        border: `1px solid ${roleTab === i ? role.color + '60' : border}`,
                                        transition: 'all 0.2s ease',
                                        '&:hover': { bgcolor: `${role.color}10` },
                                    }}>
                                        <Box sx={{ color: role.color, display: 'flex' }}>{role.icon}</Box>
                                        <Typography fontWeight={roleTab === i ? 700 : 500} sx={{ display: { xs: 'none', md: 'block' } }}>{role.label}</Typography>
                                        {roleTab === i && <ArrowForward sx={{ ml: 'auto', fontSize: 16, color: role.color, display: { xs: 'none', md: 'flex' } }} />}
                                    </Box>
                                ))}
                            </Box>
                        </Grid>

                        {/* Role detail card */}
                        <Grid item xs={12} md={9}>
                            {ROLES[roleTab] && (() => {
                                const role = ROLES[roleTab];
                                return (
                                    <Card sx={{ bgcolor: cardBg, border: `1px solid ${role.color}30`, borderRadius: 3, overflow: 'hidden' }}>
                                        <Box sx={{ height: 3, background: `linear-gradient(90deg, ${role.color}, ${role.color}50)` }} />
                                        <CardContent sx={{ p: 4 }}>
                                            <Grid container spacing={4} alignItems="flex-start">
                                                <Grid item xs={12} md={5}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                        <Box sx={{ color: role.color, p: 1.5, bgcolor: `${role.color}15`, borderRadius: 2, display: 'flex' }}>{role.icon}</Box>
                                                        <Typography variant="h5" fontWeight={800}>{role.label} Dashboard</Typography>
                                                    </Box>
                                                    <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>{role.desc}</Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                        {role.bullets.map((b, j) => (
                                                            <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <CheckCircle sx={{ fontSize: 18, color: role.color, flexShrink: 0 }} />
                                                                <Typography variant="body2" fontWeight={500}>{b}</Typography>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={7}>
                                                    <FramedImage src={roleDashboards} alt={`${role.label} dashboard preview`} glowColor={role.color} />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                );
                            })()}
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* ═══ PRICING & CONTACT (TABBED) ══════════════════════════════════ */}
            <Box id="pricing-contact" sx={{ py: 14, bgcolor: sectionBg, borderTop: `1px solid ${border}` }}>
                <Container maxWidth="lg">

                    {/* Tab switcher */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 8 }}>
                        <Box sx={{
                            display: 'inline-flex', bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(108,99,255,0.06)',
                            border: `1px solid ${border}`, borderRadius: 3, p: 0.75, gap: 0.75,
                        }}>
                            {['💳  Pricing', '✉️  Contact Us'].map((label, i) => (
                                <Button key={i} onClick={() => setPageTab(i)} variant={pageTab === i ? 'contained' : 'text'}
                                    sx={{
                                        borderRadius: 2, px: 3, py: 1, fontWeight: 700, fontSize: '0.9rem',
                                        background: pageTab === i ? 'linear-gradient(135deg, #6C63FF, #00D9FF)' : 'transparent',
                                        color: pageTab === i ? '#fff' : 'text.secondary',
                                        boxShadow: pageTab === i ? '0 4px 14px rgba(108,99,255,0.4)' : 'none',
                                        transition: 'all 0.25s ease',
                                    }}>
                                    {label}
                                </Button>
                            ))}
                        </Box>
                    </Box>

                    {/* ─── PRICING TAB ─── */}
                    {pageTab === 0 && (
                        <Box>
                            <SectionHeader chip="Pricing" chipColor="#FFB74D" title="Simple, " highlight="Transparent" after=" Pricing" subtitle="Choose the plan that fits your institution — no hidden fees." />
                            <Grid container spacing={3} justifyContent="center" alignItems="stretch">
                                {PRICING.map((plan, i) => (
                                    <Grid item xs={12} md={4} key={i}>
                                        <Card sx={{
                                            bgcolor: cardBg, height: '100%',
                                            border: `1px solid ${plan.popular ? plan.color + '50' : border}`,
                                            borderRadius: 3, position: 'relative', overflow: 'visible',
                                            transform: plan.popular ? 'scale(1.04)' : 'scale(1)',
                                            boxShadow: plan.popular ? `0 20px 60px ${plan.color}25` : 'none',
                                            transition: 'all 0.3s', '&:hover': { transform: plan.popular ? 'scale(1.06) translateY(-4px)' : 'translateY(-4px)', boxShadow: `0 20px 48px ${plan.color}25` },
                                        }}>
                                            {plan.popular && (
                                                <Box sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>
                                                    <Chip label="Most Popular" icon={<Star sx={{ fontSize: '14px !important' }} />} sx={{ bgcolor: plan.color, color: '#fff', fontWeight: 700 }} />
                                                </Box>
                                            )}
                                            <CardContent sx={{ p: 4 }}>
                                                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${plan.color}15`, border: `1px solid ${plan.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                                    <BubbleChart sx={{ color: plan.color }} />
                                                </Box>
                                                <Typography variant="overline" sx={{ color: plan.color, fontWeight: 800, letterSpacing: 2 }}>{plan.title}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, my: 1.5 }}>
                                                    <Typography variant="h3" fontWeight={900}>{plan.price}</Typography>
                                                    <Typography color="text.secondary" fontWeight={500}>{plan.period}</Typography>
                                                </Box>
                                                <Divider sx={{ my: 2.5 }} />
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
                                                    {plan.features.map((f, j) => (
                                                        <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <CheckCircle sx={{ fontSize: 17, color: plan.color, flexShrink: 0 }} />
                                                            <Typography variant="body2">{f}</Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                                <Button fullWidth variant={plan.popular ? 'contained' : 'outlined'}
                                                    sx={plan.popular
                                                        ? { background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, boxShadow: `0 8px 20px ${plan.color}40`, py: 1.5, fontWeight: 700 }
                                                        : { borderColor: plan.color, color: plan.color, py: 1.5, fontWeight: 700 }}>
                                                    {plan.cta}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Download CTA inside Pricing tab */}
                            <Box sx={{ mt: 10, p: { xs: 4, md: 6 }, borderRadius: 4, background: isDark ? 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,217,255,0.06))' : 'linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,217,255,0.04))', border: `1px solid rgba(108,99,255,0.2)`, textAlign: 'center' }}>
                                <Box sx={{ width: 68, height: 68, borderRadius: '18px', background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, boxShadow: '0 12px 36px rgba(108,99,255,0.5)' }}>
                                    <Computer sx={{ fontSize: 34, color: '#fff' }} />
                                </Box>
                                <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
                                    Proctor with{' '}
                                    <Box component="span" sx={{ background: 'linear-gradient(90deg, #6C63FF, #00D9FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        Full Confidence
                                    </Box>
                                </Typography>
                                <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto', lineHeight: 1.8 }}>
                                    The ProctorWatch Windows app delivers hardware-level enforcement — keyboard locking, process control, and AI proctoring — that a browser simply cannot match.
                                </Typography>
                                <Button variant="contained" size="large" startIcon={<Download />}
                                    sx={{ background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', boxShadow: '0 8px 24px rgba(108,99,255,0.5)', px: 5, py: 1.75, fontSize: '1rem', fontWeight: 700 }}>
                                    Download for Windows
                                </Button>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                                    Windows 10/11 × 64-bit · ~180 MB · Requires Admin privileges
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* ─── CONTACT TAB ─── */}
                    {pageTab === 1 && (
                        <Box>
                            <SectionHeader chip="Contact" chipColor="#FF4D6A" title="Let's " highlight="Talk" subtitle="Have questions about ProctorWatch? Our team is here to help." />
                            <Grid container spacing={5} alignItems="flex-start">
                                {/* Info */}
                                <Grid item xs={12} md={4}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Get in Touch</Typography>
                                    {[
                                        { icon: <Email />, color: '#6C63FF', label: 'Email', value: 'contact@proctorwatch.com' },
                                        { icon: <Phone />, color: '#00D9FF', label: 'Phone', value: '+XX XXXXX XXXXX' },
                                        { icon: <LocationOn />, color: '#FF4D6A', label: 'Address', value: 'XXXXX, XXXXX, India' },
                                    ].map((item, i) => (
                                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                                            <Box sx={{ color: item.color, p: 1.5, bgcolor: `${item.color}12`, border: `1px solid ${item.color}25`, borderRadius: 2, flexShrink: 0 }}>{item.icon}</Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">{item.label}</Typography>
                                                <Typography fontWeight={500}>{item.value}</Typography>
                                            </Box>
                                        </Box>
                                    ))}

                                    {/* Social */}
                                    <Box sx={{ mt: 4 }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700}>Follow Us</Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                            {[<Twitter />, <LinkedIn />, <GitHub />].map((icon, i) => (
                                                <IconButton key={i} size="small" sx={{ bgcolor: `rgba(108,99,255,0.1)`, border: `1px solid rgba(108,99,255,0.2)`, color: '#8B85FF', '&:hover': { bgcolor: 'rgba(108,99,255,0.2)' } }}>
                                                    {icon}
                                                </IconButton>
                                            ))}
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* Form */}
                                <Grid item xs={12} md={8}>
                                    <Card sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: 3 }}>
                                        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                                            {contactSent ? (
                                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                                    <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'rgba(78,205,196,0.15)', border: '2px solid #4ECDC4', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                                                        <CheckCircle sx={{ fontSize: 36, color: '#4ECDC4' }} />
                                                    </Box>
                                                    <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Message Sent!</Typography>
                                                    <Typography color="text.secondary">We'll get back to you within 24–48 hours.</Typography>
                                                    <Button sx={{ mt: 3 }} onClick={() => setContactSent(false)} variant="outlined">Send Another</Button>
                                                </Box>
                                            ) : (
                                                <Box component="form" onSubmit={handleContact} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                    <Typography variant="h6" fontWeight={700}>Send us a Message</Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField fullWidth label="Your Name" value={contactForm.name} onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))} required />
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <TextField fullWidth label="Email Address" type="email" value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} required />
                                                        </Grid>
                                                    </Grid>
                                                    <TextField fullWidth label="Subject" value={contactForm.subject || ''} onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))} />
                                                    <TextField fullWidth label="Message" multiline rows={5} value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} required />
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                        <Button type="submit" variant="contained" size="large" endIcon={<Send />}
                                                            sx={{ background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', boxShadow: '0 8px 20px rgba(108,99,255,0.4)', px: 5, py: 1.5, fontWeight: 700 }}>
                                                            Send Message
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Container>
            </Box>

            {/* ═══ FOOTER ═════════════════════════════════════════════════════ */}
            <Box component="footer" sx={{ py: 8, bgcolor: '#060910', borderTop: `1px solid rgba(108,99,255,0.15)` }}>
                <Container maxWidth="xl">
                    <Grid container spacing={6} sx={{ mb: 6 }}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Box sx={{ width: 34, height: 34, borderRadius: '9px', background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Shield sx={{ fontSize: 18, color: '#fff' }} />
                                </Box>
                                <Typography fontWeight={800} sx={{ background: 'linear-gradient(90deg, #6C63FF, #00D9FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    ProctorWatch
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.8, maxWidth: 280, mb: 3 }}>
                                AI-powered exam integrity platform for modern educational institutions. Proctor smarter, not harder.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {[<Twitter />, <LinkedIn />, <GitHub />].map((icon, i) => (
                                    <IconButton key={i} size="small" sx={{ color: '#64748B', '&:hover': { color: '#6C63FF' }, transition: 'color 0.2s' }}>{icon}</IconButton>
                                ))}
                            </Box>
                        </Grid>
                        {[
                            { title: 'Product', links: ['Features', 'How It Works', 'Dashboards', 'Pricing', 'Download'] },
                            { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact'] },
                            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Data Processing'] },
                        ].map((col, i) => (
                            <Grid item xs={6} md={2} key={i}>
                                <Typography variant="overline" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: 2 }}>{col.title}</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                                    {col.links.map(link => (
                                        <Typography key={link} variant="body2" sx={{ color: '#475569', cursor: 'pointer', '&:hover': { color: '#6C63FF' }, transition: 'color 0.2s' }}>{link}</Typography>
                                    ))}
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                    <Divider sx={{ bgcolor: 'rgba(148,163,184,0.08)', mb: 4 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: '#475569' }}>© 2026 ProctorWatch. All rights reserved.</Typography>
                        <Typography variant="body2" sx={{ color: '#475569' }}>Made with ♥ for secure education</Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}
