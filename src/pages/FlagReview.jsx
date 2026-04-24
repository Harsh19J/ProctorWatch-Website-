import { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Chip, LinearProgress,
    Table, TableHead, TableRow, TableCell, TableBody, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
    IconButton, Tooltip, Paper, Grid, Alert,
} from '@mui/material';
import {
    Flag, CheckCircle, Warning, Visibility, FilterList,
    PlayArrow, Videocam, Person, Schedule, Info,
} from '@mui/icons-material';
import api from '../lib/api';

import useAuthStore from '../store/authStore';

export default function FlagReview() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';
    const isTeacher = user?.role === 'teacher';
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [courses, setCourses] = useState([]);
    const [tests, setTests] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [selectedTest, setSelectedTest] = useState('all');
    const [filtersLoaded, setFiltersLoaded] = useState(false);

    const [reviewOpen, setReviewOpen] = useState(false);
    const [selectedFlag, setSelectedFlag] = useState(null);
    const [reviewAction, setReviewAction] = useState('');
    const [reviewNotes, setReviewNotes] = useState('');
    const [videoBlobUrl, setVideoBlobUrl] = useState(null);
    const [videoLoading, setVideoLoading] = useState(false);

    // When a flag is selected, fetch its video as a blob to bypass Electron CORS
    // Direct https:// URLs fail in Electron with MEDIA_ERR_SRC_NOT_SUPPORTED (code 4)
    useEffect(() => {
        let objectUrl = null;

        const fetchVideoBlob = async () => {
            if (!selectedFlag?.evidence_url) {
                setVideoBlobUrl(null);
                return;
            }
            setVideoLoading(true);
            setVideoBlobUrl(null);
            try {
                console.log('[FlagReview] Fetching video blob from:', selectedFlag.evidence_url);
                const res = await fetch(selectedFlag.evidence_url);
                if (!res.ok) {
                    console.error('[FlagReview] ❌ Blob fetch failed:', res.status, res.statusText);
                    setVideoLoading(false);
                    return;
                }
                const blob = await res.blob();
                objectUrl = URL.createObjectURL(blob);
                console.log('[FlagReview] ✅ Blob URL created:', objectUrl, '| type:', blob.type, '| size:', blob.size);
                setVideoBlobUrl(objectUrl);
            } catch (err) {
                console.error('[FlagReview] ❌ Blob fetch error:', err.message);
            }
            setVideoLoading(false);
        };

        fetchVideoBlob();

        // Cleanup: revoke blob URL to free memory
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
                console.log('[FlagReview] Blob URL revoked');
            }
        };
    }, [selectedFlag?.evidence_url]);

    useEffect(() => { loadFilters(); }, []);

    const loadFilters = async () => {
        try {
            const cData = await api.get('/api/flags/filter/courses');
            setCourses(cData || []);

            const tData = await api.get('/api/tests');
            const filtered = isTeacher
                ? (tData || []).filter(t => (cData || []).some(c => c.id === t.course_id))
                : (tData || []);
            setTests(filtered);
        } catch (err) { console.error('Filter load error:', err); }
        setFiltersLoaded(true);
    };

    useEffect(() => { if (filtersLoaded) loadFlags(); }, [filter, selectedCourse, selectedTest, filtersLoaded]);

    const loadFlags = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.set('severity', filter);
            if (selectedTest !== 'all') params.set('test_id', selectedTest);
            else if (selectedCourse !== 'all') params.set('course_id', selectedCourse);

            const data = await api.get(`/api/flags?${params.toString()}`);
            console.log(`[FlagReview] ✓ Loaded ${data?.length ?? 0} flags`);
            setFlags(data || []);
        } catch (err) {
            console.error('[FlagReview] ❌ Unexpected error:', err);
            setFlags([]);
        }
        setLoading(false);
    };


    const handleReview = async () => {
        if (!selectedFlag) return;
        await api.patch(`/api/flags/${selectedFlag.id}`, {
            reviewed: true,
            review_action: reviewAction,
            review_notes: reviewNotes,
        });
        setReviewOpen(false);
        setSelectedFlag(null);
        setReviewAction('');
        setReviewNotes('');
        loadFlags();
    };

    // Stats
    const totalFlags = flags.length;
    const redFlags = flags.filter(f => f.severity === 'high' || f.severity === 'RED').length;
    const orangeFlags = flags.filter(f => f.severity === 'medium' || f.severity === 'ORANGE' || f.severity === 'YELLOW').length;
    const unreviewedFlags = flags.filter(f => !f.reviewed).length;

    if (loading) return <LinearProgress />;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h4" fontWeight={700}>
                    <Flag sx={{ mr: 1, verticalAlign: 'middle', color: '#FF4D6A' }} />
                    Flag Review
                </Typography>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    { label: 'Total Flags', value: totalFlags, color: '#6C63FF' },
                    { label: '🔴 Red Flags', value: redFlags, color: '#FF4D6A' },
                    { label: '🟠 Orange Flags', value: orangeFlags, color: '#FF9800' },
                    { label: 'Unreviewed', value: unreviewedFlags, color: '#FFC107' },
                ].map(stat => (
                    <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
                        <Paper sx={{ p: 2, textAlign: 'center', borderTop: `3px solid ${stat.color}` }}>
                            <Typography variant="h4" fontWeight={700} color={stat.color}>{stat.value}</Typography>
                            <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField select size="small" label="Course Filter" value={selectedCourse}
                    onChange={e => { setSelectedCourse(e.target.value); setSelectedTest('all'); }}
                    sx={{ minWidth: 200 }}>
                    <MenuItem value="all">All Courses</MenuItem>
                    {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </TextField>

                <TextField select size="small" label="Test Filter" value={selectedTest}
                    onChange={e => setSelectedTest(e.target.value)}
                    sx={{ minWidth: 200 }}>
                    <MenuItem value="all">All Tests</MenuItem>
                    {tests.filter(t => selectedCourse === 'all' || t.course_id === selectedCourse).map(t =>
                        <MenuItem key={t.id} value={t.id}>{t.title}</MenuItem>
                    )}
                </TextField>

                <Box sx={{ flexGrow: 1 }} />

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {[
                        { key: 'all', label: 'All', color: 'default' },
                        { key: 'red', label: '🔴 Red Flag', color: 'error' },
                        { key: 'orange', label: '🟠 Orange Flag', color: 'warning' },
                        { key: 'unreviewed', label: 'Unreviewed', color: 'info' },
                        { key: 'escalated', label: 'Escalated', color: 'error' },
                    ].map(f => (
                        <Chip
                            key={f.key}
                            label={f.label}
                            onClick={() => setFilter(f.key)}
                            size="small"
                            variant={filter === f.key ? 'filled' : 'outlined'}
                            color={f.color}
                        />
                    ))}
                </Box>
            </Box>

            {/* Flags Table */}
            <Card>
                <CardContent sx={{ p: 0 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(108,99,255,0.05)' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Test</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Evidence</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {flags.map(f => (
                                <TableRow
                                    key={f.id}
                                    hover
                                    sx={{
                                        borderLeft: (f.severity === 'high' || f.severity === 'RED') ? '3px solid #FF4D6A' :
                                            (f.severity === 'medium' || f.severity === 'ORANGE' || f.severity === 'YELLOW') ? '3px solid #FF9800' : '3px solid transparent'
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                                            {f.type || f.flag_type}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={(f.severity === 'high' || f.severity === 'RED') ? '🔴 Red' : (f.severity === 'medium' || f.severity === 'ORANGE' || f.severity === 'YELLOW') ? '🟠 Orange' : f.severity}
                                            size="small"
                                            color={(f.severity === 'high' || f.severity === 'RED') ? 'error' : (f.severity === 'medium' || f.severity === 'ORANGE' || f.severity === 'YELLOW') ? 'warning' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ maxWidth: 200, display: 'block' }}>
                                            {f.metadata?.message || '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{f.exam_sessions?.tests?.title || '—'}</TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {f.timestamp ? new Date(f.timestamp).toLocaleString() : '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {f.evidence_url ? (
                                            <Tooltip title="View Evidence">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => {
                                                        console.log('[FlagReview] 🔍 Opening flag dialog:', {
                                                            id: f.id,
                                                            type: f.flag_type || f.type,
                                                            severity: f.severity,
                                                            evidence_url: f.evidence_url,
                                                            metadata: f.metadata,
                                                            session_id: f.session_id,
                                                        });
                                                        setSelectedFlag(f);
                                                        setReviewOpen(true);
                                                    }}
                                                >
                                                    <PlayArrow />
                                                </IconButton>
                                            </Tooltip>
                                        ) : (
                                            <Typography variant="caption" color="text.disabled">—</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {f.reviewed ? (
                                            <Chip label="Reviewed" size="small" color="success" icon={<CheckCircle />} />
                                        ) : (
                                            <Chip label="Pending" size="small" color="warning" variant="outlined" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="small"
                                            variant={f.reviewed ? 'text' : 'contained'}
                                            onClick={() => { setSelectedFlag(f); setReviewOpen(true); }}
                                        >
                                            {f.reviewed ? 'View' : 'Review'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {flags.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                        <Info sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            No flags found matching this filter.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning color={(selectedFlag?.severity === 'high' || selectedFlag?.severity === 'RED') ? 'error' : 'warning'} />
                    Review Flag: {selectedFlag?.type || selectedFlag?.flag_type}
                </DialogTitle>
                <DialogContent>
                    {/* Flag Details */}
                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(108,99,255,0.03)', borderRadius: 2 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2"><strong>Type:</strong> {selectedFlag?.type || selectedFlag?.flag_type}</Typography>
                                <Typography variant="body2"><strong>Severity:</strong> {selectedFlag?.severity}</Typography>
                                <Typography variant="body2"><strong>Time:</strong> {selectedFlag?.timestamp ? new Date(selectedFlag.timestamp).toLocaleString() : '—'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2"><strong>Test:</strong> {selectedFlag?.exam_sessions?.tests?.title || '—'}</Typography>
                                <Typography variant="body2"><strong>Message:</strong> {selectedFlag?.metadata?.message || '—'}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Evidence Video */}
                    {selectedFlag?.evidence_url ? (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Videocam fontSize="small" /> Evidence Video
                            </Typography>
                            {videoLoading ? (
                                <Box sx={{ bgcolor: '#000', borderRadius: 2, p: 4, textAlign: 'center' }}>
                                    <LinearProgress sx={{ mb: 1 }} />
                                    <Typography variant="caption" color="text.secondary">Loading video...</Typography>
                                </Box>
                            ) : videoBlobUrl ? (
                                <Box sx={{ bgcolor: '#000', borderRadius: 2, overflow: 'hidden', maxHeight: 400 }}>
                                    <video
                                        key={videoBlobUrl}
                                        src={videoBlobUrl}
                                        controls
                                        autoPlay={false}
                                        style={{ width: '100%', maxHeight: 400 }}
                                        onCanPlay={() => console.log('[FlagReview] ✅ Blob video ready to play')}
                                        onError={(e) => {
                                            console.error('[FlagReview] ❌ Blob video error:', {
                                                code: e.target.error?.code,
                                                message: e.target.error?.message,
                                            });
                                            // Replace video with a link to open externally
                                            // Happens for VP9 clips recorded before codec fix
                                            e.target.style.display = 'none';
                                            const msg = document.createElement('div');
                                            msg.style.cssText = 'padding:24px;text-align:center;color:#aaa';
                                            msg.innerHTML = `<p>⚠️ This clip was encoded with VP9 (not supported in Electron).</p><a href="${selectedFlag.evidence_url}" target="_blank" rel="noreferrer" style="color:#6C63FF">Open in browser ↗</a>`;
                                            e.target.parentNode.appendChild(msg);
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Alert severity="warning" sx={{ mb: 1 }}>
                                    Failed to load video. Try opening the link directly:
                                </Alert>
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', wordBreak: 'break-all' }}>
                                {selectedFlag.evidence_url}
                            </Typography>
                        </Box>
                    ) : (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            No video evidence available for this flag.
                        </Alert>
                    )}

                    {/* Show form if unreviewed OR if it's an escalated flag viewed by Admin */}
                    {(!selectedFlag?.reviewed || (isAdmin && selectedFlag?.review_action === 'escalate')) && (
                        <>
                            <TextField
                                fullWidth
                                select
                                label="Action"
                                value={reviewAction}
                                onChange={e => setReviewAction(e.target.value)}
                                sx={{ mb: 2 }}
                            >
                                <MenuItem value="dismiss">Dismiss — No Action</MenuItem>
                                <MenuItem value="warn">Warn Student</MenuItem>
                                {isAdmin && <MenuItem value="invalidate">Invalidate Exam (Zero Score)</MenuItem>}
                                {!isAdmin && <MenuItem value="escalate">Escalate to Admin</MenuItem>}
                            </TextField>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Review Notes"
                                value={reviewNotes}
                                onChange={e => setReviewNotes(e.target.value)}
                                placeholder="Add notes about this flag..."
                            />
                        </>
                    )}

                    {selectedFlag?.reviewed && selectedFlag?.review_action !== 'escalate' && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            <strong>Reviewed</strong> — Action: {selectedFlag.review_action || 'N/A'}
                            {selectedFlag.review_notes && <Typography variant="body2" sx={{ mt: 1 }}>{selectedFlag.review_notes}</Typography>}
                        </Alert>
                    )}

                    {/* Show info for Escalated flags if Admin is viewing (before they act) */}
                    {selectedFlag?.review_action === 'escalate' && (
                        <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                            <strong>Escalated by Teacher</strong>
                            {selectedFlag.review_notes && <Typography variant="body2" sx={{ mt: 1 }}>Teacher Notes: {selectedFlag.review_notes}</Typography>}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReviewOpen(false)}>Close</Button>
                    {(!selectedFlag?.reviewed || (isAdmin && selectedFlag?.review_action === 'escalate')) && (
                        <Button variant="contained" onClick={handleReview} disabled={!reviewAction}>
                            Submit Review
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
}
