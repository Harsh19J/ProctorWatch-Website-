import { Box, Button, Typography, Chip } from '@mui/material';
import { Download, OpenInNew } from '@mui/icons-material';

/**
 * DownloadBanner — shown wherever desktop-only features are referenced.
 * Props:
 *   feature: string — name of the feature (e.g. "Exam Taking")
 *   compact: bool — smaller variant for inline use
 */
export default function DownloadBanner({ feature = 'This feature', compact = false }) {
    if (compact) {
        return (
            <Chip
                label={`${feature} requires the desktop app`}
                icon={<Download sx={{ fontSize: '14px !important' }} />}
                size="small"
                sx={{ bgcolor: 'rgba(108,99,255,0.1)', color: '#8B85FF', border: '1px solid rgba(108,99,255,0.25)', fontWeight: 500 }}
            />
        );
    }

    return (
        <Box sx={{
            p: 3, borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(0,217,255,0.05) 100%)',
            border: '1px solid rgba(108,99,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 2,
        }}>
            <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#8B85FF', mb: 0.5 }}>
                    🖥️ Desktop App Required
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    <strong>{feature}</strong> requires the ProctorWatch Windows application for hardware-level enforcement.
                </Typography>
            </Box>
            <Button
                variant="outlined" size="small" startIcon={<Download />} endIcon={<OpenInNew fontSize="small" />}
                href="#download"
                sx={{ borderColor: '#6C63FF', color: '#6C63FF', whiteSpace: 'nowrap', flexShrink: 0, '&:hover': { bgcolor: 'rgba(108,99,255,0.08)' } }}
            >
                Download App
            </Button>
        </Box>
    );
}
