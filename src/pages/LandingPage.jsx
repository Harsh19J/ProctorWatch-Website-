import { useState, useEffect, useRef, useCallback, cloneElement } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Container, Grid, Card, CardContent,
    IconButton, Chip, TextField, Divider, useMediaQuery, Modal,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    Shield, Psychology, Speed, Group, BarChart, VideoLibrary,
    Download, Login, LightMode, DarkMode, Menu, Close,
    CheckCircle, ArrowForward, Star, Email, Phone, LocationOn,
    Send, GitHub, Twitter, LinkedIn, Computer, Schedule, Verified,
    MonitorHeart, AdminPanelSettings, School, FamilyRestroom, Build,
    AutoAwesome, BubbleChart, Lock, Security, Notifications,
} from '@mui/icons-material';
import { useThemeMode } from '../ThemeContext';


import analyticsImg from '../assets/analytics_dash.png';
import liveMonitorImg from '../assets/live_monitor.png';
import testCreationImg from '../assets/test_creation.png';
import roleDashboards from '../assets/role_dashboards.png';

// ─── Scroll Sequence Animation ────────────────────────────────────────────────
function ScrollSequence({ children }) {
    const canvasRef = useRef(null);
    const imagesRef = useRef([]);
    const loadedRef = useRef(0);
    const [loadProgress, setLoadProgress] = useState(0);
    const [ready, setReady] = useState(false);
    const rafRef = useRef(null);
    const lastFrameRef = useRef(-1);

    // Phase 1: load frames eagerly, draw frame 0 as soon as it arrives
    useEffect(() => {
        const TOTAL = 200;
        const imgs = new Array(TOTAL);
        imagesRef.current = imgs;

        for (let i = 0; i < TOTAL; i++) {
            const img = new Image();
            img.src = `/frames/ezgif-frame-${(i + 1).toString().padStart(3, '0')}.jpg`;
            img.onload = () => {
                imgs[i] = img;
                loadedRef.current++;
                setLoadProgress(Math.round((loadedRef.current / TOTAL) * 100));
                // draw first frame immediately so canvas is never blank
                if (i === 0) drawFrame(img);
                if (loadedRef.current === TOTAL) setReady(true);
            };
        }
    }, []);

    const drawFrame = (img) => {
        const canvas = canvasRef.current;
        if (!canvas || !img) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        const W = canvas.width;
        const H = canvas.height;
        const scale = Math.max(W / img.width, H / img.height);
        const dx = (W - img.width * scale) / 2;
        const dy = (H - img.height * scale) / 2;
        ctx.fillStyle = '#2B231D';
        ctx.fillRect(0, 0, W, H);
        ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, img.width * scale, img.height * scale);
    };

    // Phase 2: wire scroll → frame scrubbing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleScroll = () => {
            // document height
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const rawProgress = scrollable > 0 ? (window.scrollY / scrollable) : 0;
            const progress = Math.max(0, Math.min(1, rawProgress));
            const frameIndex = Math.min(199, Math.floor(progress * 200));

            if (frameIndex === lastFrameRef.current) return;
            lastFrameRef.current = frameIndex;

            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                drawFrame(imagesRef.current[frameIndex]);
            });
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            handleScroll();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);
        handleResize(); // set initial size + draw

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []); // no deps — uses refs, not state

    return (
        <Box id="scroll-container" sx={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
            {/* Loading bar — shown until all 200 frames are in memory */}
            {!ready && (
                <Box sx={{
                    position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999,
                    background: 'rgba(43,35,29,0.4)',
                }}>
                    <Box sx={{
                        height: '100%', background: 'linear-gradient(90deg, #D97706, #FBBF24)',
                        width: `${loadProgress}%`, transition: 'width 0.2s ease',
                    }} />
                </Box>
            )}
            
            {/* Fixed Background Canvas */}
            <Box sx={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: '100%', overflow: 'hidden', zIndex: 0 }}>
                <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
                {/* Gradient overlay to make text readable */}
                <Box sx={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(43,35,29,0.65) 0%, rgba(43,35,29,0.95) 100%)',
                    pointerEvents: 'none',
                }} />
            </Box>
            
            {/* All page content overlays here */}
            <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                {children}
            </Box>
        </Box>
    );
}

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(words, { typingSpeed = 75, deletingSpeed = 38, pause = 1800 } = {}) {
    const [display, setDisplay] = useState('');
    const [wordIdx, setWordIdx] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const word = words[wordIdx % words.length];
        let timeout;
        if (!isDeleting && display === word) {
            timeout = setTimeout(() => setIsDeleting(true), pause);
        } else if (isDeleting && display === '') {
            setIsDeleting(false);
            setWordIdx(i => i + 1);
        } else {
            const speed = isDeleting ? deletingSpeed : typingSpeed;
            const next = isDeleting ? word.slice(0, display.length - 1) : word.slice(0, display.length + 1);
            timeout = setTimeout(() => setDisplay(next), speed);
        }
        return () => clearTimeout(timeout);
    }, [display, isDeleting, wordIdx, words, typingSpeed, deletingSpeed, pause]);

    return display;
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', duration = 1800 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const numeric = parseFloat(target.replace(/[^0-9.]/g, ''));
                const steps = 60;
                let step = 0;
                const interval = setInterval(() => {
                    step++;
                    const eased = 1 - Math.pow(1 - step / steps, 3);
                    setCount(Math.min(numeric * eased, numeric));
                    if (step >= steps) { setCount(numeric); clearInterval(interval); }
                }, duration / steps);
            }
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    const display = target.includes('.') ? count.toFixed(1) : Math.round(count);
    return <span ref={ref}>{display}{suffix}</span>;
}

// ─── Scroll-reveal wrapper ────────────────────────────────────────────────────
function Reveal({ children, animation = 'fadeSlideUp', delay = 0, threshold = 0.12 }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
        }, { threshold });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);

    return (
        <Box ref={ref} sx={{
            opacity: visible ? 1 : 0,
            animation: visible ? `${animation} 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}s both` : 'none',
        }}>
            {children}
        </Box>
    );
}

// ─── Framed screenshot ────────────────────────────────────────────────────────
function FramedImage({ src, alt, glowColor = '#D97706', floatAnim = false, reveal = true }) {
    const inner = (
        <Box sx={{ position: 'relative', width: '100%' }}>
            <Box sx={{
                position: 'absolute', inset: -24,
                background: `radial-gradient(ellipse, ${glowColor}30 0%, transparent 70%)`,
                borderRadius: 4, filter: 'blur(32px)', zIndex: 0,
            }} />
            <Box sx={{
                position: 'relative', zIndex: 1, borderRadius: '14px', overflow: 'hidden',
                border: `1px solid ${glowColor}40`,
                boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px ${glowColor}18`,
                animation: floatAnim ? 'imgFloat 6s ease-in-out infinite alternate' : 'none',
                transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                '&:hover': {
                    transform: 'scale(1.02) translateY(-4px)',
                    boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 48px ${glowColor}28`,
                },
            }}>
                {/* Scan line */}
                <Box sx={{
                    position: 'absolute', left: 0, right: 0, height: '2px', zIndex: 10,
                    background: `linear-gradient(90deg, transparent, ${glowColor}80, transparent)`,
                    animation: 'scanLine 3s linear infinite',
                    pointerEvents: 'none',
                }} />
                {/* Browser chrome bar */}
                <Box sx={{
                    bgcolor: '#12141C', px: 2, py: 1,
                    display: 'flex', alignItems: 'center', gap: 1,
                    borderBottom: `1px solid ${glowColor}18`,
                }}>
                    {['#B45309', '#78350F', '#0284C7'].map((c, i) => (
                        <Box key={i} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c }} />
                    ))}
                    <Box sx={{ flex: 1, mx: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '6px', height: 18 }} />
                    <Lock sx={{ fontSize: 12, color: `${glowColor}80` }} />
                </Box>
                <Box component="img" src={src} alt={alt} sx={{ width: '100%', display: 'block' }} />
            </Box>
        </Box>
    );
    return reveal ? <Reveal animation="fadeSlideLeft">{inner}</Reveal> : inner;
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ chip, chipColor = '#D97706', title, highlight, after = '', subtitle }) {
    return (
        <Reveal animation="fadeSlideUp">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
                <Chip label={chip} sx={{
                    mb: 2.5, bgcolor: `${chipColor}15`, color: chipColor,
                    fontWeight: 700, border: `1px solid ${chipColor}30`,
                    fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                    animation: 'borderGlow 3s ease-in-out infinite',
                }} />
                <Typography variant="h2" fontWeight={900} sx={{ mb: 2, fontSize: { xs: '1.9rem', md: '2.75rem' }, letterSpacing: '-0.03em' }}>
                    {title}{' '}
                    {highlight && (
                        <Box component="span" sx={{
                            background: `linear-gradient(90deg, ${chipColor}, #FBBF24, ${chipColor})`,
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            animation: 'gradientShift 3s ease infinite',
                        }}>
                            {highlight}
                        </Box>
                    )}
                    {after}
                </Typography>
                {subtitle && (
                    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 580, mx: 'auto', fontWeight: 400, lineHeight: 1.75, fontSize: '1.05rem' }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Reveal>
    );
}

// ─── Trust Badge ──────────────────────────────────────────────────────────────
function TrustBadge({ icon, label }) {
    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 2, py: 0.75, borderRadius: '999px',
            border: '1px solid rgba(217,119,6,0.2)',
            bgcolor: 'rgba(217,119,6,0.06)',
            transition: 'all 200ms ease',
            '&:hover': { bgcolor: 'rgba(217,119,6,0.12)', transform: 'translateY(-2px)' },
            cursor: 'default',
        }}>
            <Box sx={{ color: '#D97706', display: 'flex', fontSize: 16 }}>{icon}</Box>
            <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                {label}
            </Typography>
        </Box>
    );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
    { icon: <Shield fontSize="large" />, color: '#D97706', title: 'ArcFace Verification', desc: 'ResNet-50 with 512D embeddings and MiniFASNet liveness detection ensures only the right student takes the exam.', tag: 'AI · Biometric' },
    { icon: <Psychology fontSize="large" />, color: '#FBBF24', title: 'Audio Intelligence', desc: 'Silero VAD + FFT spectral analysis detects nearby speech with ambient noise calibration and lip-sync correlation.', tag: 'AI · Acoustic' },
    { icon: <MonitorHeart fontSize="large" />, color: '#B45309', title: 'Real-Time Monitoring', desc: 'Invigilators see live webcam feeds, flag counts, and active session status — intervene with a single click.', tag: 'Live · Dashboard' },
    { icon: <Group fontSize="large" />, color: '#0284C7', title: 'Multi-Role Dashboards', desc: 'Tailored views for Students, Teachers, Admins, Parents and Technical staff with role-scoped permissions.', tag: '5 Roles' },
    { icon: <BarChart fontSize="large" />, color: '#78350F', title: 'Deep Analytics', desc: 'Score distributions, flag breakdowns by module, performance trends and CSV export powered by Recharts.', tag: 'Reports' },
    { icon: <VideoLibrary fontSize="large" />, color: '#F97316', title: 'Evidence Capture', desc: 'Circular buffer captures 30-second clips on every flag. Teachers and admins review evidence with full audit logs.', tag: 'Video · Audit' },
];

const ROLES = [
    { label: 'Student', icon: <School />, color: '#D97706', desc: 'View upcoming exams, check scores, track performance, and access your calendar — all from the browser.', bullets: ['Upcoming exam schedule', 'Score & performance history', 'Exam result breakdowns', 'Personal calendar view'], img: analyticsImg },
    { label: 'Teacher', icon: <Verified />, color: '#FBBF24', desc: 'Create and manage tests with AI-generated questions, review proctoring flags, grade exams, and manage courses.', bullets: ['AI-powered test creation', 'Flag review + evidence video', 'Grading & score overrides', 'Course enrollment management'], img: testCreationImg },
    { label: 'Admin', icon: <AdminPanelSettings />, color: '#B45309', desc: 'Full platform oversight — manage all users, courses, analytics reports, and configure the application blacklist.', bullets: ['User CRUD + bulk CSV upload', 'Institution-wide analytics', 'Application blacklist config', 'Audit log access'], img: liveMonitorImg },
    { label: 'Parent', icon: <FamilyRestroom />, color: '#0284C7', desc: "Monitor your child's academic progress — upcoming exams, scores, integrity metrics, and teacher contacts.", bullets: ['Child performance dashboard', 'Upcoming exam schedule', 'Integrity & flag summary', 'Teacher contact info'], img: analyticsImg },
    { label: 'Technical', icon: <Build />, color: '#78350F', desc: 'Database inspection, audit log review, and live system schema visualization for platform maintenance.', bullets: ['Audit trail review', 'Schema diagrams', 'Blacklist configuration', 'Emergency controls'], img: liveMonitorImg },
];

const PRICING = [
    { title: 'Starter', price: 'Free', period: '', color: '#D97706', features: ['Up to 50 students', '2 teacher accounts', 'Basic analytics', 'Email support'], cta: 'Get Started' },
    { title: 'Institution', price: '₹XXXXX', period: '/month', color: '#FBBF24', features: ['Unlimited students', 'Unlimited teachers', 'Advanced analytics + CSV', 'Priority support', 'Custom branding'], cta: 'Contact Sales', popular: true },
    { title: 'Enterprise', price: 'Custom', period: '', color: '#0284C7', features: ['Multi-institution', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'On-premise option'], cta: 'Talk to Us' },
];

const HOW_STEPS = [
    {
        step: '01', color: '#D97706', icon: <Computer sx={{ fontSize: 28 }} />, title: 'Install & Configure',
        desc: 'Your institution admin downloads the ProctorWatch Windows app, creates user accounts in bulk via CSV, sets up courses, and configures the application blacklist.',
        bullets: ['One-click bulk user import via CSV', 'Course and enrollment setup', 'App blacklist configuration', 'Role assignment per user'],
        img: liveMonitorImg, imgAlt: 'Admin dashboard setup', imgColor: '#D97706',
    },
    {
        step: '02', color: '#FBBF24', icon: <AutoAwesome sx={{ fontSize: 28 }} />, title: 'Create Tests with AI',
        desc: 'Teachers build exams using a rich text editor with LaTeX/image support, or let the AI Question Generator auto-generate a complete question set from a topic prompt in seconds.',
        bullets: ['AI question generation from topic prompts', 'Rich text + code + image questions', 'Negative marking & randomization', 'Schedule exam windows per course'],
        img: testCreationImg, imgAlt: 'Test creation interface', imgColor: '#FBBF24',
    },
    {
        step: '03', color: '#0284C7', icon: <BarChart sx={{ fontSize: 28 }} />, title: 'Review Evidence & Analytics',
        desc: 'After exams, teachers and admins review AI-generated proctoring flags, watch 30-second evidence clips, and access rich analytics dashboards with score distributions.',
        bullets: ['Flag review with evidence video', 'Score override & grading tools', 'Institution-wide analytics', 'CSV export for reports'],
        img: analyticsImg, imgAlt: 'Analytics dashboard', imgColor: '#0284C7',
    },
];

const STATS = [
    { val: '500', suffix: '+', label: 'Institutions' },
    { val: '50000', suffix: '+', label: 'Exams Proctored' },
    { val: '99.8', suffix: '%', label: 'Uptime' },
];

const TRUST_BADGES = [
    { icon: <Lock sx={{ fontSize: 14 }} />, label: 'AES-256 Encrypted' },
    { icon: <Security sx={{ fontSize: 14 }} />, label: 'GDPR Compliant' },
    { icon: <CheckCircle sx={{ fontSize: 14 }} />, label: 'ISO 27001' },
    { icon: <Shield sx={{ fontSize: 14 }} />, label: 'SOC 2 Type II' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
    const navigate = useNavigate();
    const { mode, toggleMode } = useThemeMode();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileMenu, setMobileMenu] = useState(false);
    const [roleTab, setRoleTab] = useState(0);
    const [pageTab, setPageTab] = useState(0);
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [contactSent, setContactSent] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [downloadModal, setDownloadModal] = useState(false);

    const isDark = mode === 'dark';
    const bg = isDark ? '#09090F' : '#F8FAFF';
    const cardBg = isDark ? 'rgba(15,17,23,0.92)' : 'rgba(255,255,255,0.98)';
    const border = isDark ? 'rgba(148,163,184,0.08)' : 'rgba(217,119,6,0.1)';
    const sectionBg = isDark ? 'rgba(6,9,15,0.7)' : 'rgba(217,119,6,0.03)';

    const typedWord = useTypewriter([
        'Exam Integrity',
        'Face Verification',
        'AI Proctoring',
        'Secure Testing',
        'Smart Monitoring',
    ]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Dashboards', href: '#dashboards' },
        { label: 'Pricing', href: '#pricing-contact' },
    ];

    const handleContact = (e) => {
        e.preventDefault();
        setContactSent(true);
        setContactForm({ name: '', email: '', message: '' });
    };

    return (
        <Box sx={{ bgcolor: 'transparent', minHeight: '100vh', color: 'text.primary', overflowX: 'hidden' }}>

            {/* ═══ DOWNLOAD MODAL ══════════════════════════════════════════════ */}
            <Modal open={downloadModal} onClose={() => setDownloadModal(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: { xs: '92vw', sm: 480 }, borderRadius: 4,
                    bgcolor: isDark ? '#0F1117' : '#fff',
                    border: `1px solid rgba(217,119,6,0.25)`,
                    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
                    p: 5, textAlign: 'center',
                    animation: 'scaleIn 0.35s cubic-bezier(0.22,1,0.36,1) both',
                }}>
                    <Box sx={{
                        width: 72, height: 72, borderRadius: '20px',
                        background: 'linear-gradient(135deg, #D97706, #FBBF24)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mx: 'auto', mb: 3,
                        boxShadow: '0 12px 36px rgba(217,119,6,0.45)',
                        animation: 'pulseRing 2.5s ease-in-out infinite',
                    }}>
                        <Computer sx={{ fontSize: 34, color: '#fff' }} />
                    </Box>
                    <Chip
                        label="Coming Soon"
                        sx={{ mb: 2, bgcolor: 'rgba(249,115,22,0.12)', color: '#F97316', fontWeight: 700, border: '1px solid rgba(249,115,22,0.3)' }}
                    />
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 1.5 }}>
                        ProctorWatch for Windows
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 4 }}>
                        The desktop proctoring app is under active development. Enter your email and we'll notify you the moment it's ready to download.
                    </Typography>
                    <Box component="form" onSubmit={(e) => { e.preventDefault(); setDownloadModal(false); }} sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            fullWidth size="small" type="email" placeholder="your@email.com" required
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                        <Button
                            type="submit" variant="contained"
                            sx={{
                                background: 'linear-gradient(135deg, #D97706, #FBBF24)',
                                whiteSpace: 'nowrap', px: 3, borderRadius: '10px',
                                boxShadow: '0 6px 18px rgba(217,119,6,0.4)',
                            }}
                        >
                            Notify Me
                        </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        Windows 10/11 × 64-bit · No spam, unsubscribe anytime.
                    </Typography>
                    <IconButton onClick={() => setDownloadModal(false)} size="small"
                        sx={{ position: 'absolute', top: 12, right: 12, color: 'text.secondary' }}>
                        <Close fontSize="small" />
                    </IconButton>
                </Box>
            </Modal>

            <ScrollSequence>
            {/* ═══ NAVBAR ══════════════════════════════════════════════════════ */}
            <Box component="nav" sx={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100,
                backdropFilter: 'blur(24px) saturate(200%)',
                bgcolor: scrolled
                    ? (isDark ? 'rgba(9,9,15,0.96)' : 'rgba(248,250,255,0.96)')
                    : 'transparent',
                borderBottom: scrolled ? `1px solid ${border}` : '1px solid transparent',
                transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: scrolled ? (isDark ? '0 4px 32px rgba(0,0,0,0.5)' : '0 4px 24px rgba(217,119,6,0.08)') : 'none',
                animation: 'navEntry 0.6s cubic-bezier(0.22,1,0.36,1) both',
            }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1.5, gap: 2 }}>
                        {/* Brand */}
                        <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <Box sx={{
                                width: 38, height: 38, borderRadius: '11px',
                                background: 'linear-gradient(135deg, #D97706, #FBBF24)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 16px rgba(217,119,6,0.45)',
                                animation: 'pulseRing 3s ease-in-out infinite',
                                transition: 'transform 0.3s',
                                '&:hover': { transform: 'rotate(12deg) scale(1.1)' },
                            }}>
                                <Shield sx={{ fontSize: 20, color: '#fff' }} />
                            </Box>
                            <Typography variant="h6" fontWeight={800} sx={{
                                background: 'linear-gradient(90deg, #D97706, #FBBF24)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.02em',
                            }}>
                                ProctorWatch
                            </Typography>
                        </Box>

                        {/* Nav links */}
                        {!isMobile && (
                            <Box sx={{ display: 'flex', gap: 0.5, ml: 4, flex: 1 }}>
                                {navLinks.map((link, idx) => (
                                    <Button
                                        key={link.label}
                                        href={link.href}
                                        sx={{
                                            color: 'text.secondary', fontWeight: 500, fontSize: '0.88rem',
                                            px: 1.5, py: 0.75,
                                            position: 'relative', overflow: 'hidden',
                                            '&::after': {
                                                content: '""', position: 'absolute',
                                                bottom: 4, left: '50%', right: '50%',
                                                height: '2px', bgcolor: '#D97706',
                                                borderRadius: 2,
                                                transition: 'left 0.3s ease, right 0.3s ease',
                                            },
                                            '&:hover': { color: '#D97706', bgcolor: 'transparent' },
                                            '&:hover::after': { left: '10%', right: '10%' },
                                            transition: 'color 0.2s',
                                        }}
                                    >
                                        {link.label}
                                    </Button>
                                ))}
                            </Box>
                        )}

                        {/* Actions */}
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton onClick={toggleMode} size="small" sx={{
                                color: 'text.secondary',
                                transition: 'transform 0.5s, color 0.2s',
                                '&:hover': { transform: 'rotate(180deg)', color: '#78350F' },
                            }}>
                                {isDark ? <LightMode sx={{ fontSize: 18 }} /> : <DarkMode sx={{ fontSize: 18 }} />}
                            </IconButton>
                            {!isMobile && (
                                <>
                                    <Button
                                        variant="outlined" size="small" startIcon={<Login sx={{ fontSize: 16 }} />}
                                        onClick={() => navigate('/login')}
                                        sx={{
                                            borderColor: 'rgba(217,119,6,0.4)', color: '#D97706',
                                            '&:hover': { borderColor: '#D97706', bgcolor: 'rgba(217,119,6,0.08)', transform: 'translateY(-2px)' },
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        variant="contained" size="small" startIcon={<Download sx={{ fontSize: 16 }} />}
                                        onClick={() => setDownloadModal(true)}
                                        sx={{
                                            background: 'linear-gradient(135deg, #D97706, #FBBF24)',
                                            backgroundSize: '200% 200%',
                                            animation: 'gradientShift 3s ease infinite',
                                            boxShadow: '0 4px 16px rgba(217,119,6,0.4)',
                                            '&:hover': { boxShadow: '0 8px 28px rgba(217,119,6,0.7)', transform: 'translateY(-2px)' },
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        Download App
                                    </Button>
                                </>
                            )}
                            {isMobile && (
                                <IconButton onClick={() => setMobileMenu(!mobileMenu)} sx={{ color: 'text.primary' }}>
                                    {mobileMenu ? <Close /> : <Menu />}
                                </IconButton>
                            )}
                        </Box>
                    </Box>
                </Container>

                {/* Mobile menu */}
                {mobileMenu && (
                    <Box sx={{ px: 3, pb: 2.5, borderTop: `1px solid ${border}`, animation: 'fadeSlideDown 0.3s ease both' }}>
                        {navLinks.map(link => (
                            <Button key={link.label} fullWidth href={link.href}
                                sx={{ justifyContent: 'flex-start', color: 'text.primary', py: 1 }}
                                onClick={() => setMobileMenu(false)}>
                                {link.label}
                            </Button>
                        ))}
                        <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                            <Button fullWidth variant="outlined" onClick={() => navigate('/login')}
                                sx={{ borderColor: '#D97706', color: '#D97706', borderRadius: '10px' }}>
                                Login
                            </Button>
                            <Button fullWidth variant="contained" onClick={() => setDownloadModal(true)}
                                sx={{ background: 'linear-gradient(135deg, #D97706, #FBBF24)', borderRadius: '10px' }}>
                                Download
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>

                        {/* ═══ HERO ════════════════════════════════════════════════ */}
                <Box id="home" sx={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', pt: 8, pointerEvents: 'none', '& *': { pointerEvents: 'auto' } }}>


                
                
                
                

                <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 4 } }}>
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={5}>
                            {/* Badge */}
                            <Box sx={{ animation: 'fadeSlideRight 0.65s cubic-bezier(0.22,1,0.36,1) 0.1s both' }}>
                                <Chip
                                    label="AI Question Generation — Powered by Gemini"
                                    sx={{
                                        mb: 3, bgcolor: 'rgba(217,119,6,0.1)', color: '#FDE68A',
                                        fontWeight: 600, border: '1px solid rgba(217,119,6,0.25)',
                                        fontSize: '0.76rem', letterSpacing: '0.02em',
                                        animation: 'borderGlow 3s ease-in-out infinite',
                                    }}
                                />
                            </Box>

                            {/* Headline */}
                            <Box sx={{ animation: 'fadeSlideRight 0.65s cubic-bezier(0.22,1,0.36,1) 0.2s both' }}>
                                <Typography variant="h1" fontWeight={900} sx={{
                                    fontSize: { xs: '2.4rem', md: '3.1rem', lg: '3.8rem' },
                                    lineHeight: 1.06, mb: 3, letterSpacing: '-0.04em',
                                }}>
                                    <Box component="span" sx={{ color: 'text.primary' }}>AI-Powered</Box><br />
                                    {/* Typewriter */}
                                    <Box component="span" sx={{
                                        background: 'linear-gradient(90deg, #D97706, #FBBF24, #B45309)',
                                        backgroundSize: '200% 200%',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                        animation: 'gradientShift 4s ease infinite',
                                        minHeight: '1.2em', display: 'inline-block',
                                    }}>
                                        {typedWord}
                                        <Box component="span" sx={{
                                            display: 'inline-block', width: '3px', height: '0.85em',
                                            bgcolor: '#D97706', ml: '2px', verticalAlign: 'middle',
                                            animation: 'blink 0.9s step-end infinite',
                                        }} />
                                    </Box><br />
                                    <Box component="span" sx={{ color: 'text.primary' }}>Platform</Box>
                                </Typography>
                            </Box>

                            <Box sx={{ animation: 'fadeSlideRight 0.65s cubic-bezier(0.22,1,0.36,1) 0.32s both' }}>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 470, fontWeight: 400, lineHeight: 1.8, fontSize: '1.05rem' }}>
                                    Proctor exams with face verification, audio intelligence, and live monitoring. Manage tests, users, results, and evidence from one unified portal.
                                </Typography>
                            </Box>

                            {/* CTAs */}
                            <Box sx={{ animation: 'fadeSlideRight 0.65s cubic-bezier(0.22,1,0.36,1) 0.42s both' }}>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                                    <Button
                                        variant="contained" size="large" endIcon={<ArrowForward />}
                                        onClick={() => navigate('/login')}
                                        sx={{
                                            background: 'linear-gradient(135deg, #D97706, #FDE68A)',
                                            backgroundSize: '200% 200%',
                                            boxShadow: '0 8px 28px rgba(217,119,6,0.5)',
                                            px: 4, py: 1.5, fontSize: '0.95rem', fontWeight: 700,
                                            animation: 'gradientShift 3s ease infinite',
                                            '&:hover': { boxShadow: '0 14px 40px rgba(217,119,6,0.72)', transform: 'translateY(-3px) scale(1.03)' },
                                            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                                        }}
                                    >
                                        Access Dashboard
                                    </Button>
                                    <Button
                                        variant="outlined" size="large" startIcon={<Download />}
                                        onClick={() => setDownloadModal(true)}
                                        sx={{
                                            borderColor: 'rgba(148,163,184,0.4)', color: 'text.primary',
                                            px: 4, py: 1.5, fontSize: '0.95rem',
                                            '&:hover': { borderColor: '#D97706', bgcolor: 'rgba(217,119,6,0.06)', transform: 'translateY(-3px)' },
                                            transition: 'all 0.25s',
                                        }}
                                    >
                                        Download App
                                    </Button>
                                </Box>

                                {/* Trust badges */}
                                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                    {TRUST_BADGES.map((b, i) => (
                                        <Box key={i} sx={{ animation: `fadeSlideUp 0.5s ease ${0.5 + i * 0.07}s both` }}>
                                            <TrustBadge icon={b.icon} label={b.label} />
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            {/* Stats */}
                            <Box sx={{ animation: 'fadeSlideRight 0.65s cubic-bezier(0.22,1,0.36,1) 0.6s both', mt: 5 }}>
                                <Box sx={{ display: 'flex', gap: 3.5, flexWrap: 'wrap' }}>
                                    {STATS.map(({ val, suffix, label }) => (
                                        <Box key={label} sx={{
                                            p: 2, borderRadius: 2,
                                            bgcolor: isDark ? 'rgba(217,119,6,0.06)' : 'rgba(217,119,6,0.05)',
                                            border: '1px solid rgba(217,119,6,0.14)',
                                            transition: 'all 0.2s',
                                            '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(217,119,6,0.35)' },
                                            cursor: 'default',
                                        }}>
                                            <Typography variant="h5" fontWeight={900} sx={{
                                                background: 'linear-gradient(90deg, #D97706, #FBBF24)',
                                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1,
                                            }}>
                                                <AnimatedCounter target={val} suffix={suffix} />
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Grid>

                    </Grid>
                </Container>

                {/* Scroll indicator */}
                <Box sx={{
                    position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75,
                    animation: 'fadeSlideUp 1s ease 1.4s both',
                }}>
                    <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 3, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                        Scroll to explore
                    </Typography>
                    <Box sx={{
                        width: 24, height: 38, borderRadius: 12,
                        border: '2px solid rgba(217,119,6,0.4)',
                        display: 'flex', justifyContent: 'center', pt: 0.8,
                        animation: 'borderGlow 2s ease-in-out infinite',
                    }}>
                        <Box sx={{ width: 4, height: 8, bgcolor: '#D97706', borderRadius: 2, animation: 'floatOrb 1.2s ease-in-out infinite alternate' }} />
                    </Box>
                </Box>
                </Box>

            {/* ═══ FEATURES ════════════════════════════════════════════════════ */}
            <Box id="features" sx={{ py: 14 }}>
                <Container maxWidth="xl">
                    <SectionHeader chip="Core Features" chipColor="#D97706" title="Everything You Need for " highlight="Secure Exams" subtitle="A full suite of AI-driven tools designed for modern educational institutions — from biometric verification to deep analytics." />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                        {FEATURES.map((f, i) => (
                            <Box key={i} sx={{ width: '100%', maxWidth: 860 }}>
                                <Reveal animation="flipIn" delay={0.15}>
                                    <Card sx={{
                                        bgcolor: isDark ? 'rgba(15,17,23,0.55)' : 'rgba(255,255,255,0.7)',
                                        backdropFilter: 'blur(16px)',
                                        border: `1px solid ${border}`, borderRadius: 4,
                                        p: 1, cursor: 'default',
                                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-8px) scale(1.02) rotateX(2deg)',
                                            borderColor: `${f.color}55`,
                                            boxShadow: `0 32px 64px ${f.color}25`,
                                            bgcolor: isDark ? 'rgba(15,17,23,0.75)' : 'rgba(255,255,255,0.9)',
                                        },
                                    }}>
                                        <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, gap: 4 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, minWidth: { md: 140 } }}>
                                                <Box sx={{
                                                    width: 64, height: 64, borderRadius: '16px',
                                                    bgcolor: `${f.color}15`, border: `1px solid ${f.color}35`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: f.color,
                                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                                    '&:hover': { transform: 'rotate(10deg) scale(1.15)', boxShadow: `0 12px 28px ${f.color}40` },
                                                }}>
                                                    {/* cloneElement to make icon larger */}
                                                    {cloneElement(f.icon, { sx: { fontSize: 32 } })}
                                                </Box>
                                                <Chip label={f.tag} size="small" sx={{
                                                    bgcolor: `${f.color}0D`, color: f.color,
                                                    fontSize: '0.7rem', fontWeight: 700,
                                                    border: `1px solid ${f.color}20`,
                                                }} />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h5" fontWeight={800} sx={{ mb: 1.5, letterSpacing: '-0.02em' }}>{f.title}</Typography>
                                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>{f.desc}</Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Reveal>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* ═══ APP DOWNLOAD BAND ════════════════════════════════════════════ */}
            <Box sx={{
                py: 10,
                background: isDark
                    ? 'linear-gradient(135deg, rgba(217,119,6,0.12) 0%, rgba(56,189,248,0.08) 50%, rgba(217,119,6,0.06) 100%)'
                    : 'linear-gradient(135deg, rgba(217,119,6,0.07) 0%, rgba(56,189,248,0.05) 100%)',
                borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`,
            }}>
                <Container maxWidth="lg">
                    <Reveal animation="fadeSlideUp">
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 6 }}>
                            {/* Left */}
                            <Box sx={{ flex: 1 }}>
                                <Chip label="Desktop App" sx={{ mb: 2, bgcolor: 'rgba(249,115,22,0.1)', color: '#F97316', fontWeight: 700, border: '1px solid rgba(249,115,22,0.25)' }} />
                                <Typography variant="h3" fontWeight={900} sx={{ mb: 2.5, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                                    Start Proctoring{' '}
                                    <Box component="span" sx={{
                                        background: 'linear-gradient(90deg, #D97706, #FBBF24)',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    }}>
                                        in Minutes
                                    </Box>
                                </Typography>
                                <Typography color="text.secondary" sx={{ lineHeight: 1.85, mb: 4, maxWidth: 480, fontSize: '1.02rem' }}>
                                    Download the ProctorWatch Windows app to enable AI-powered proctoring. The web portal handles management — the desktop app runs the actual exam session with hardware-level enforcement.
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <Button
                                        variant="contained" size="large" startIcon={<Download />}
                                        onClick={() => setDownloadModal(true)}
                                        sx={{
                                            background: 'linear-gradient(135deg, #F97316, #FB923C)',
                                            backgroundSize: '200% 200%',
                                            boxShadow: '0 8px 24px rgba(249,115,22,0.45)',
                                            px: 4, py: 1.5, fontWeight: 700, fontSize: '0.95rem',
                                            '&:hover': { boxShadow: '0 14px 36px rgba(249,115,22,0.65)', transform: 'translateY(-3px)' },
                                        }}
                                    >
                                        Download for Windows
                                    </Button>
                                    <Button
                                        variant="outlined" size="large"
                                        href="#features"
                                        sx={{
                                            borderColor: 'rgba(217,119,6,0.35)', color: '#D97706', px: 4, py: 1.5, fontWeight: 600,
                                            '&:hover': { borderColor: '#D97706', bgcolor: 'rgba(217,119,6,0.06)' },
                                        }}
                                    >
                                        System Requirements
                                    </Button>
                                </Box>
                            </Box>

                            {/* Right — spec cards */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: { md: 280 } }}>
                                {[
                                    { icon: <Computer />, color: '#D97706', title: 'Windows 10 / 11', sub: '64-bit required' },
                                    { icon: <Speed />, color: '#FBBF24', title: '4 GB RAM min', sub: '8 GB recommended' },
                                    { icon: <Lock />, color: '#0284C7', title: 'Admin Privileges', sub: 'For process control' },
                                ].map((spec, i) => (
                                    <Box key={i} sx={{
                                        display: 'flex', alignItems: 'center', gap: 2,
                                        p: 2, borderRadius: 2,
                                        bgcolor: isDark ? 'rgba(15,17,23,0.7)' : 'rgba(255,255,255,0.8)',
                                        border: `1px solid ${border}`,
                                        backdropFilter: 'blur(8px)',
                                        transition: 'all 0.2s',
                                        '&:hover': { transform: 'translateX(6px)', borderColor: `${spec.color}40` },
                                    }}>
                                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: `${spec.color}15`, color: spec.color, display: 'flex' }}>
                                            {spec.icon}
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight={700}>{spec.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">{spec.sub}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Reveal>
                </Container>
            </Box>

            {/* ═══ HOW IT WORKS ════════════════════════════════════════════════ */}
            <Box id="how-it-works" sx={{ py: 14 }}>
                <Container maxWidth="xl">
                    <SectionHeader chip="Workflow" chipColor="#FBBF24" title="How " highlight="ProctorWatch" after=" Works" subtitle="From first setup to post-exam review — three simple stages, each powered by AI." />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {HOW_STEPS.map((step, i) => (
                            <Grid container spacing={7} key={i} alignItems="center" direction={i % 2 === 1 ? 'row-reverse' : 'row'}>
                                <Grid item xs={12} md={4} sx={{ maxWidth: { xs: 600, md: 'none' }, mx: 'auto' }}>
                                    <Reveal animation={i % 2 === 0 ? 'fadeSlideRight' : 'fadeSlideLeft'} delay={0.1}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                            <Box sx={{
                                                width: 52, height: 52, borderRadius: '14px',
                                                bgcolor: `${step.color}12`, border: `1px solid ${step.color}30`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: step.color, flexShrink: 0,
                                                animation: 'pulseRing 2.5s ease-in-out infinite',
                                            }}>
                                                {step.icon}
                                            </Box>
                                            <Typography fontFamily="monospace" fontWeight={900} sx={{
                                                fontSize: '2.2rem', color: `${step.color}50`,
                                                letterSpacing: '-3px',
                                            }}>
                                                {step.step}
                                            </Typography>
                                        </Box>
                                        <Typography variant="h4" fontWeight={800} sx={{ mb: 2, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                                            {step.title}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.85 }}>
                                            {step.desc}
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            {step.bullets.map((b, j) => (
                                                <Box key={j} sx={{
                                                    display: 'flex', alignItems: 'center', gap: 2,
                                                    animation: `fadeSlideRight 0.45s ease ${j * 0.08}s both`,
                                                }}>
                                                    <Box sx={{
                                                        width: 22, height: 22, borderRadius: '50%',
                                                        bgcolor: `${step.color}12`, border: `1px solid ${step.color}35`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                    }}>
                                                        <CheckCircle sx={{ fontSize: 14, color: step.color }} />
                                                    </Box>
                                                    <Typography variant="body2" fontWeight={500}>{b}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Reveal>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <FramedImage src={step.img} alt={step.imgAlt} glowColor={step.imgColor} />
                                </Grid>
                            </Grid>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* ═══ ROLE DASHBOARDS ════════════════════════════════════════════ */}
            <Box id="dashboards" sx={{ py: 14, bgcolor: sectionBg, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
                <Container maxWidth="xl">
                    <SectionHeader chip="Dashboards" chipColor="#0284C7" title="Built for " highlight="Every Role" subtitle="Each user gets a tailored interface with exactly the tools they need — no more, no less." />

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 4, md: 6 }, alignItems: 'flex-start' }}>
                        {/* Role tab list */}
                        <Box sx={{ width: { xs: '100%', md: '280px' }, flexShrink: 0 }}>
                            <Reveal animation="fadeSlideRight" delay={0.1}>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 1.5, flexWrap: 'wrap' }}>
                                    {ROLES.map((role, i) => (
                                        <Box key={i} onClick={() => setRoleTab(i)} sx={{
                                            p: { xs: 1.5, md: 2.5 }, borderRadius: '14px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 2,
                                            bgcolor: roleTab === i ? `${role.color}18` : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                            backdropFilter: 'blur(12px)',
                                            border: `1px solid ${roleTab === i ? role.color + '60' : border}`,
                                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            '&:hover': { bgcolor: `${role.color}1A`, transform: 'translateX(6px)' },
                                            transform: roleTab === i ? 'translateX(8px)' : 'none',
                                            boxShadow: roleTab === i ? `0 12px 32px ${role.color}20` : 'none',
                                        }}>
                                            <Box sx={{ color: role.color, display: 'flex', transform: roleTab === i ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s' }}>{role.icon}</Box>
                                            <Typography fontWeight={roleTab === i ? 800 : 500} sx={{ display: { xs: 'none', md: 'block' }, fontSize: '1rem', color: roleTab === i ? 'text.primary' : 'text.secondary' }}>
                                                {role.label}
                                            </Typography>
                                            {roleTab === i && (
                                                <ArrowForward sx={{ ml: 'auto', fontSize: 18, color: role.color, display: { xs: 'none', md: 'flex' } }} />
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            </Reveal>
                        </Box>

                        {/* Role content */}
                        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                            {ROLES[roleTab] && (() => {
                                const role = ROLES[roleTab];
                                return (
                                    <Box sx={{ animation: 'scaleIn 0.32s cubic-bezier(0.22,1,0.36,1) both', width: '100%' }} key={roleTab}>
                                        <Card sx={{
                                            bgcolor: cardBg,
                                            border: `1px solid ${role.color}30`,
                                            borderRadius: 3, overflow: 'hidden',
                                            width: '100%'
                                        }}>
                                            {/* Top gradient bar */}
                                            <Box sx={{
                                                height: 3,
                                                background: `linear-gradient(90deg, ${role.color}, ${role.color}60)`,
                                                backgroundSize: '200% 100%',
                                                animation: 'gradientShift 2s ease infinite',
                                            }} />
                                            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: { xs: 4, lg: 6 }, alignItems: 'center' }}>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                                                            <Box sx={{
                                                                color: role.color, p: 1.5,
                                                                bgcolor: `${role.color}12`,
                                                                border: `1px solid ${role.color}25`,
                                                                borderRadius: 2, display: 'flex',
                                                            }}>
                                                                {role.icon}
                                                            </Box>
                                                            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                                                                {role.label} Dashboard
                                                            </Typography>
                                                        </Box>
                                                        <Typography color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.82 }}>
                                                            {role.desc}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                            {role.bullets.map((b, j) => (
                                                                <Box key={j} sx={{
                                                                    display: 'flex', alignItems: 'center', gap: 2,
                                                                    animation: `fadeSlideRight 0.38s ease ${j * 0.06}s both`,
                                                                }}>
                                                                    <CheckCircle sx={{ fontSize: 18, color: role.color, flexShrink: 0 }} />
                                                                    <Typography variant="body2" fontWeight={500}>{b}</Typography>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                        <Button
                                                            variant="outlined" size="small"
                                                            onClick={() => navigate('/login')}
                                                            sx={{ mt: 4, borderColor: `${role.color}50`, color: role.color, '&:hover': { borderColor: role.color, bgcolor: `${role.color}08` } }}
                                                            endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                                                        >
                                                            Access {role.label} Portal
                                                        </Button>
                                                    </Box>
                                                    <Box sx={{ flex: 1.4, minWidth: 0, width: '100%' }}>
                                                        <FramedImage src={role.img} alt={`${role.label} dashboard preview`} glowColor={role.color} reveal={false} />
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                );
                            })()}
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* ═══ PRICING & CONTACT ══════════════════════════════════════════ */}
            <Box id="pricing-contact" sx={{ py: 14 }}>
                <Container maxWidth="lg">
                    {/* Tab switcher */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 8 }}>
                        <Box sx={{
                            display: 'inline-flex',
                            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(217,119,6,0.05)',
                            border: `1px solid ${border}`, borderRadius: '14px', p: 0.75, gap: 0.75,
                        }}>
                            {['Pricing', 'Contact Us'].map((label, i) => (
                                <Button key={i} onClick={() => setPageTab(i)}
                                    variant={pageTab === i ? 'contained' : 'text'}
                                    sx={{
                                        borderRadius: '10px', px: 3, py: 1, fontWeight: 700, fontSize: '0.88rem',
                                        background: pageTab === i ? 'linear-gradient(135deg, #D97706, #FBBF24)' : 'transparent',
                                        color: pageTab === i ? '#fff' : 'text.secondary',
                                        boxShadow: pageTab === i ? '0 4px 14px rgba(217,119,6,0.4)' : 'none',
                                        transition: 'all 0.22s ease',
                                    }}>
                                    {label}
                                </Button>
                            ))}
                        </Box>
                    </Box>

                    {pageTab === 0 && (
                        <Box sx={{ animation: 'fadeSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) both' }}>
                            <SectionHeader chip="Pricing" chipColor="#78350F" title="Simple, " highlight="Transparent" after=" Pricing" subtitle="Choose the plan that fits your institution — no hidden fees." />
                            <Grid container spacing={3} justifyContent="center" alignItems="stretch">
                                {PRICING.map((plan, i) => (
                                    <Grid item xs={12} md={4} key={i}>
                                        <Reveal animation="scaleIn" delay={i * 0.08}>
                                            <Card sx={{
                                                bgcolor: cardBg, height: '100%',
                                                border: `1px solid ${plan.popular ? plan.color + '45' : border}`,
                                                borderRadius: 3, position: 'relative', overflow: 'visible',
                                                transform: plan.popular ? 'scale(1.04)' : 'scale(1)',
                                                boxShadow: plan.popular ? `0 24px 64px ${plan.color}20` : 'none',
                                                transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                                                '&:hover': {
                                                    transform: plan.popular ? 'scale(1.06) translateY(-6px)' : 'translateY(-6px) scale(1.02)',
                                                    boxShadow: `0 32px 72px ${plan.color}28`,
                                                },
                                            }}>
                                                {/* Top gradient accent */}
                                                <Box sx={{
                                                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                                                    background: `linear-gradient(90deg, ${plan.color}, ${plan.color}70)`,
                                                    borderRadius: '16px 16px 0 0',
                                                }} />
                                                {plan.popular && (
                                                    <Box sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>
                                                        <Chip
                                                            label="Most Popular"
                                                            icon={<Star sx={{ fontSize: '14px !important' }} />}
                                                            sx={{ bgcolor: plan.color, color: '#fff', fontWeight: 700, animation: 'pulseRing 2s ease-in-out infinite' }}
                                                        />
                                                    </Box>
                                                )}
                                                <CardContent sx={{ p: 4 }}>
                                                    <Typography variant="overline" sx={{ color: plan.color, fontWeight: 800, letterSpacing: 2 }}>
                                                        {plan.title}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, my: 1.5 }}>
                                                        <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: '-0.03em' }}>{plan.price}</Typography>
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
                                                        onClick={() => setPageTab(1)}
                                                        sx={plan.popular
                                                            ? { background: `linear-gradient(135deg, ${plan.color}, ${plan.color}bb)`, boxShadow: `0 8px 20px ${plan.color}40`, py: 1.5, fontWeight: 700 }
                                                            : { borderColor: plan.color, color: plan.color, py: 1.5, fontWeight: 700, '&:hover': { bgcolor: `${plan.color}0A` } }}>
                                                        {plan.cta}
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </Reveal>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {pageTab === 1 && (
                        <Box sx={{ animation: 'fadeSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) both' }}>
                            <SectionHeader chip="Contact" chipColor="#B45309" title="Let's " highlight="Talk" subtitle="Have questions about ProctorWatch? Our team is here to help." />
                            <Grid container spacing={5} alignItems="flex-start">
                                <Grid item xs={12} md={4}>
                                    <Reveal animation="fadeSlideRight" delay={0.1}>
                                        <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Get in Touch</Typography>
                                        {[
                                            { icon: <Email />, color: '#D97706', label: 'Email', value: 'contact@proctorwatch.com' },
                                            { icon: <Phone />, color: '#FBBF24', label: 'Phone', value: '+XX XXXXX XXXXX' },
                                            { icon: <LocationOn />, color: '#B45309', label: 'Address', value: 'XXXXX, XXXXX, India' },
                                        ].map((item, i) => (
                                            <Box key={i} sx={{
                                                display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3,
                                                transition: 'transform 0.2s',
                                                '&:hover': { transform: 'translateX(6px)' },
                                            }}>
                                                <Box sx={{ color: item.color, p: 1.5, bgcolor: `${item.color}10`, border: `1px solid ${item.color}22`, borderRadius: 2, flexShrink: 0 }}>
                                                    {item.icon}
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">{item.label}</Typography>
                                                    <Typography fontWeight={500}>{item.value}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                        <Box sx={{ mt: 4 }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={700}>Follow Us</Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                                                {[<Twitter />, <LinkedIn />, <GitHub />].map((icon, i) => (
                                                    <IconButton key={i} size="small" sx={{
                                                        bgcolor: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.18)',
                                                        color: '#FDE68A', transition: 'all 0.2s',
                                                        '&:hover': { bgcolor: 'rgba(217,119,6,0.22)', transform: 'translateY(-4px) rotate(5deg)', boxShadow: '0 6px 16px rgba(217,119,6,0.3)' },
                                                    }}>
                                                        {icon}
                                                    </IconButton>
                                                ))}
                                            </Box>
                                        </Box>
                                    </Reveal>
                                </Grid>

                                <Grid item xs={12} md={8}>
                                    <Reveal animation="fadeSlideLeft" delay={0.15}>
                                        <Card sx={{ bgcolor: cardBg, border: `1px solid ${border}`, borderRadius: 3 }}>
                                            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                                                {contactSent ? (
                                                    <Box sx={{ textAlign: 'center', py: 6, animation: 'scaleIn 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
                                                        <Box sx={{
                                                            width: 80, height: 80, borderRadius: '50%',
                                                            bgcolor: 'rgba(78,205,196,0.12)', border: '2px solid #0284C7',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            mx: 'auto', mb: 3, animation: 'pulseRing 2s ease-in-out infinite',
                                                        }}>
                                                            <CheckCircle sx={{ fontSize: 40, color: '#0284C7' }} />
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
                                                        <TextField fullWidth label="Message" multiline rows={5} value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} required />
                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                            <Button type="submit" variant="contained" size="large" endIcon={<Send />}
                                                                sx={{
                                                                    background: 'linear-gradient(135deg, #D97706, #FBBF24)',
                                                                    boxShadow: '0 8px 20px rgba(217,119,6,0.4)',
                                                                    px: 5, py: 1.5, fontWeight: 700,
                                                                    '&:hover': { boxShadow: '0 14px 32px rgba(217,119,6,0.65)', transform: 'translateY(-2px)' },
                                                                }}>
                                                                Send Message
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Reveal>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Container>
            </Box>

            {/* ═══ FOOTER ══════════════════════════════════════════════════════ */}
            <Box component="footer" sx={{ py: 10, bgcolor: isDark ? 'rgba(6,9,15,0.75)' : 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(217,119,6,0.12)' }}>
                <Container maxWidth="xl">
                    <Grid container spacing={6} sx={{ mb: 8 }}>
                        {/* Brand col */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                                <Box sx={{
                                    width: 36, height: 36, borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #D97706, #FBBF24)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    animation: 'pulseRing 3s ease-in-out infinite',
                                }}>
                                    <Shield sx={{ fontSize: 18, color: '#fff' }} />
                                </Box>
                                <Typography fontWeight={800} sx={{
                                    background: 'linear-gradient(90deg, #D97706, #FBBF24)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    fontSize: '1.1rem',
                                }}>
                                    ProctorWatch
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.85, maxWidth: 280, mb: 3 }}>
                                AI-powered exam integrity platform for modern educational institutions. Proctor smarter, not harder.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                                {[<Twitter />, <LinkedIn />, <GitHub />].map((icon, i) => (
                                    <IconButton key={i} size="small" sx={{ color: '#475569', transition: 'all 0.2s', '&:hover': { color: '#D97706', transform: 'translateY(-4px)' } }}>
                                        {icon}
                                    </IconButton>
                                ))}
                            </Box>
                            <Button
                                variant="outlined" size="small" startIcon={<Download />}
                                onClick={() => setDownloadModal(true)}
                                sx={{
                                    borderColor: 'rgba(249,115,22,0.4)', color: '#F97316',
                                    fontSize: '0.8rem',
                                    '&:hover': { borderColor: '#F97316', bgcolor: 'rgba(249,115,22,0.08)', transform: 'translateY(-2px)' },
                                }}
                            >
                                Download for Windows
                            </Button>
                        </Grid>

                        {/* Link cols */}
                        {[
                            { title: 'Product', links: ['Features', 'How It Works', 'Dashboards', 'Pricing', 'Download'] },
                            { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact'] },
                            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'Security'] },
                        ].map((col, i) => (
                            <Grid item xs={6} md={2} key={i}>
                                <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.72rem' }}>
                                    {col.title}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2.5 }}>
                                    {col.links.map(link => (
                                        <Typography key={link} variant="body2" sx={{
                                            color: '#475569', cursor: 'pointer',
                                            transition: 'all 0.18s',
                                            '&:hover': { color: '#D97706', paddingLeft: '6px' },
                                        }}>
                                            {link}
                                        </Typography>
                                    ))}
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    <Divider sx={{ bgcolor: 'rgba(148,163,184,0.08)', mb: 4 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: '#475569' }}>
                            © 2026 ProctorWatch. All rights reserved.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {TRUST_BADGES.slice(0, 2).map((b, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Box sx={{ color: '#475569', display: 'flex', fontSize: 12 }}>{b.icon}</Box>
                                    <Typography variant="caption" sx={{ color: '#475569' }}>{b.label}</Typography>
                                </Box>
                            ))}
                        </Box>
                        <Typography variant="body2" sx={{ color: '#475569' }}>
                            Made with ♥ for secure education
                        </Typography>
                    </Box>
                </Container>
            </Box>
            </ScrollSequence>

            {/* ─── Scroll To Top FAB ─────────────────────────────────────────── */}
            <Box
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                sx={{
                    position: 'fixed', bottom: 32, right: 32, zIndex: 1200,
                    width: 48, height: 48, borderRadius: '50%', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #D97706, #FBBF24)',
                    boxShadow: '0 6px 24px rgba(217,119,6,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: scrolled ? 1 : 0,
                    pointerEvents: scrolled ? 'auto' : 'none',
                    transform: scrolled ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease, box-shadow 0.2s ease',
                    '&:hover': { boxShadow: '0 10px 32px rgba(217,119,6,0.65)', transform: 'translateY(-3px)' },
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
            </Box>
        </Box>
    );
}
