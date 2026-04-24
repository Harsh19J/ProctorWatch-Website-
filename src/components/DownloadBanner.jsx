import { Box, Button, Typography, Chip } from '@mui/material';
import { Download, Computer } from '@mui/icons-material';
import { useState } from 'react';

/**
 * DownloadBanner
 * Shown on dashboards to remind users the actual exam requires the Windows app.
 *
 * @param {string}  feature   – The action that requires the desktop app e.g. "Exam Taking"
 * @param {boolean} compact   – If true, renders as a small button/chip
 */
export default function DownloadBanner({ feature = 'This Feature', compact = false }) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    if (compact) {
        return (
            <Chip
                icon={<Computer sx={{ fontSize: 14 }} />}
                label="Desktop App Required"
                size="small"
                sx={{
                    bgcolor: 'rgba(249,115,22,0.1)',
                    color: '#F97316',
                    fontWeight: 600,
                    border: '1px solid rgba(249,115,22,0.28)',
                    fontSize: '0.7rem',
                    cursor: 'default',
                }}
            />
        );
    }

    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 2, flexWrap: 'wrap',
            p: 2, mb: 3.5, borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.04))',
            border: '1px solid rgba(249,115,22,0.22)',
            animation: 'fadeSlideDown 0.4s ease both',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 0.75, borderRadius: '8px', bgcolor: 'rgba(249,115,22,0.12)', color: '#F97316', display: 'flex' }}>
                    <Computer sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#F97316', lineHeight: 1.2 }}>
                        Desktop App Required for {feature}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        The ProctorWatch Windows app handles live exam sessions. Coming soon.
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                    size="small" startIcon={<Download sx={{ fontSize: 14 }} />}
                    href="#download"
                    sx={{
                        borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem',
                        bgcolor: 'rgba(249,115,22,0.12)', color: '#F97316',
                        border: '1px solid rgba(249,115,22,0.3)',
                        '&:hover': { bgcolor: 'rgba(249,115,22,0.2)' },
                    }}
                >
                    Learn More
                </Button>
                <Button
                    size="small" onClick={() => setDismissed(true)}
                    sx={{ color: 'text.disabled', fontSize: '0.72rem', minWidth: 0, p: '4px 8px' }}
                >
                    Dismiss
                </Button>
            </Box>
        </Box>
    );
}
