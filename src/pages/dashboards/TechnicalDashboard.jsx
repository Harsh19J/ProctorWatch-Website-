import { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Chip, LinearProgress,
    TextField, Button, Table, TableHead, TableRow, TableCell, TableBody,
    Alert, Tabs, Tab,
} from '@mui/material';
import { Storage, Memory, Speed, BugReport, Terminal, Refresh, Schema } from '@mui/icons-material';
import api from '../../lib/api';
import MermaidDiagram from '../../components/MermaidDiagram';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

const schemaGraph = `
erDiagram
    users ||--o{ enrollments : "has"
    users ||--o{ courses : "teaches"
    users ||--o{ exam_sessions : "takes"
    users ||--o{ face_registrations : "has"
    users ||--o{ consents : "gives"
    users ||--o{ parent_student : "is_parent"
    users ||--o{ parent_student : "is_student"
    courses ||--|{ tests : "contains"
    courses ||--o{ enrollments : "has"
    tests ||--o{ test_questions : "includes"
    questions ||--o{ test_questions : "is_in"
    tests ||--o{ exam_sessions : "generates"
    exam_sessions ||--o{ answers : "contains"
    exam_sessions ||--o{ flags : "triggers"
    exam_sessions ||--o{ module_overrides : "has"
    app_blacklist }|--|| users : "blocks_or_unblocks"
    telemetry }|--|| exam_sessions : "logs"
    institutions ||--o{ courses : "owns"
`;

// System stat card
function SysCard({ icon, color, value, label, delay = 0 }) {
    return (
        <Card sx={{
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
                <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>{value}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}
                    sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                    {label}
                </Typography>
            </CardContent>
        </Card>
    );
}

// DB table row
function DbTableRow({ table, idx }) {
    const { ref, display } = useAnimatedCounter(table.count);
    return (
        <TableRow ref={ref} sx={{ animation: `fadeSlideUp 0.35s ease ${idx * 0.06}s both`, '&:hover td': { bgcolor: 'action.hover' } }}>
            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem' }}>{table.name}</TableCell>
            <TableCell align="right">
                <Chip label={display} size="small" sx={{ fontFamily: 'monospace', fontWeight: 700, bgcolor: 'rgba(217,119,6,0.1)', color: '#D97706' }} />
            </TableCell>
        </TableRow>
    );
}

export default function TechnicalDashboard() {
    const [tab, setTab] = useState(0);
    const [systemInfo, setSystemInfo] = useState(null);
    const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
    const [queryResult, setQueryResult] = useState(null);
    const [queryError, setQueryError] = useState('');
    const [tables, setTables] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            if (window.electronAPI) {
                const info = await window.electronAPI.getSystemInfo();
                setSystemInfo(info);
            }
            const overview = await api.get('/api/reports/overview');
            setTables([
                { name: 'users', count: overview.totalUsers },
                { name: 'students', count: overview.totalStudents },
                { name: 'courses', count: overview.totalCourses },
                { name: 'tests', count: overview.totalTests },
                { name: 'exam_sessions', count: overview.totalSessions },
                { name: 'flags', count: overview.totalFlags },
            ]);
            const logs = await api.get('/api/reports/audit-logs');
            setAuditLogs(logs || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const runQuery = async () => {
        setQueryError(''); setQueryResult(null);
        try {
            const match = query.match(/from\s+(\w+)/i);
            if (!match) { setQueryError('Could not parse collection name'); return; }
            if (!query.trim().toLowerCase().startsWith('select')) { setQueryError('Only SELECT queries are supported'); return; }
            const data = await api.get('/api/reports/audit-logs');
            setQueryResult(data.slice(0, 50));
        } catch (err) { setQueryError(err.message); }
    };

    if (loading) return <LinearProgress sx={{ borderRadius: 8 }} />;

    return (
        <Box sx={{ animation: 'pageEnter 0.4s ease both' }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeSlideRight 0.45s ease both' }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
                        Technical{' '}
                        <Box component="span" sx={{ background: 'linear-gradient(90deg, #B45309, #78350F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Dashboard
                        </Box>
                    </Typography>
                    <Typography color="text.secondary" variant="body2">System monitoring, database inspection, and debug tools</Typography>
                </Box>
                <Button startIcon={<Refresh />} onClick={loadData} size="small" sx={{ borderRadius: '10px', fontWeight: 600 }}>
                    Refresh
                </Button>
            </Box>

            <Tabs
                value={tab} onChange={(_, v) => setTab(v)}
                sx={{
                    mb: 3,
                    '& .MuiTab-root': { fontWeight: 600, borderRadius: '8px 8px 0 0', fontSize: '0.85rem' },
                    '& .MuiTabs-indicator': { background: 'linear-gradient(90deg, #B45309, #78350F)', borderRadius: 2 },
                }}
            >
                <Tab label="System Info" icon={<Memory sx={{ fontSize: 18 }} />} iconPosition="start" />
                <Tab label="DB Query" icon={<Terminal sx={{ fontSize: 18 }} />} iconPosition="start" />
                <Tab label="Schema" icon={<Schema sx={{ fontSize: 18 }} />} iconPosition="start" />
                <Tab label="Audit Logs" icon={<Storage sx={{ fontSize: 18 }} />} iconPosition="start" />
            </Tabs>

            {/* System Info */}
            {tab === 0 && (
                <Grid container spacing={3}>
                    {[
                        { icon: <Memory />, color: '#D97706', value: systemInfo?.cpus || '—', label: 'CPU Cores' },
                        { icon: <Speed />, color: '#FBBF24', value: systemInfo?.totalMemory ? `${systemInfo.totalMemory} GB` : '—', label: 'Total RAM' },
                        { icon: <Storage />, color: '#0284C7', value: systemInfo?.freeMemory ? `${systemInfo.freeMemory} GB` : '—', label: 'Free RAM' },
                        { icon: <BugReport />, color: '#78350F', value: systemInfo?.platform || 'web', label: 'Platform' },
                    ].map((s, i) => (
                        <Grid key={i} item xs={12} sm={6} md={3}>
                            <SysCard {...s} delay={i * 0.07} />
                        </Grid>
                    ))}
                    <Grid item xs={12} sx={{ animation: 'fadeSlideUp 0.5s ease 0.2s both' }}>
                        <Card>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'rgba(217,119,6,0.1)', color: '#D97706', display: 'flex' }}>
                                        <Storage sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700}>Database Collections</Typography>
                                </Box>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>Collection</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>Documents</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tables.map((t, i) => <DbTableRow key={t.name} table={t} idx={i} />)}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* DB Query */}
            {tab === 1 && (
                <Card sx={{ animation: 'fadeSlideUp 0.4s ease both' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>SQL Query (Read-Only)</Typography>
                        <TextField
                            fullWidth multiline rows={3} value={query}
                            onChange={e => setQuery(e.target.value)}
                            sx={{
                                mb: 2,
                                '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '0.88rem' },
                                '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                            }}
                        />
                        <Button variant="contained" onClick={runQuery} startIcon={<Terminal />}
                            sx={{ mb: 2, borderRadius: '10px', fontWeight: 700, background: 'linear-gradient(135deg, #D97706, #FBBF24)', boxShadow: '0 4px 14px rgba(217,119,6,0.35)' }}>
                            Execute
                        </Button>
                        {queryError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{queryError}</Alert>}
                        {queryResult && (
                            <Box sx={{ overflowX: 'auto', animation: 'fadeSlideUp 0.3s ease both' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            {Object.keys(queryResult[0] || {}).map(k => (
                                                <TableCell key={k} sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>{k}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {queryResult.map((row, i) => (
                                            <TableRow key={i} hover sx={{ animation: `fadeSlideUp 0.3s ease ${i * 0.04}s both` }}>
                                                {Object.values(row).map((v, j) => (
                                                    <TableCell key={j} sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                        {typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Schema */}
            {tab === 2 && (
                <Card sx={{ animation: 'fadeSlideUp 0.4s ease both' }}>
                    <CardContent sx={{ p: 3, overflowX: 'auto' }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>Database Schema Diagram</Typography>
                        <MermaidDiagram chart={schemaGraph} />
                    </CardContent>
                </Card>
            )}

            {/* Audit Logs */}
            {tab === 3 && (
                <Card sx={{ animation: 'fadeSlideUp 0.4s ease both' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                            <Typography variant="h6" fontWeight={700}>Audit Logs</Typography>
                            <Button size="small" startIcon={<Refresh />} onClick={loadData} sx={{ borderRadius: '10px', fontWeight: 600 }}>Refresh</Button>
                        </Box>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    {['Action', 'User ID', 'Details', 'Timestamp'].map(h => (
                                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {auditLogs.map((log, idx) => (
                                    <TableRow key={log.id} hover sx={{ animation: `fadeSlideUp 0.32s ease ${idx * 0.04}s both` }}>
                                        <TableCell><Chip label={log.action} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} /></TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'text.secondary' }}>{log.user_id?.slice(0, 8)}</TableCell>
                                        <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.78rem' }}>{JSON.stringify(log.details)}</TableCell>
                                        <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                {auditLogs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">No audit logs found</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}
