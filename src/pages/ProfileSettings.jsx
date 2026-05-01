import { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, TextField, Button, Avatar,
    Grid, Alert, Divider, CircularProgress, Chip,
} from '@mui/material';
import { CameraAlt, Save, Lock } from '@mui/icons-material';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

export default function ProfileSettings() {
    const { user, changePassword } = useAuthStore();
    const [photoPreview, setPhotoPreview] = useState(user?.profile_photo_url || null);
    const [photoFile, setPhotoFile] = useState(null);
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [saving, setSaving] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [phone, setPhone] = useState(user?.phone || '');
    const [email, setEmail] = useState(user?.email || '');
    const [fullName, setFullName] = useState(user?.full_name || '');

    if (!user) return null;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.get('/api/users/me');
                if (data?.full_name) {
                    setFullName(data.full_name);
                    useAuthStore.setState({ user: { ...user, full_name: data.full_name } });
                    const stored = JSON.parse(localStorage.getItem('pw_session'));
                    if (stored) { stored.user.full_name = data.full_name; localStorage.setItem('pw_session', JSON.stringify(stored)); }
                }
            } catch (err) { console.error('Failed to fetch fresh profile data:', err); }
        };
        fetchProfile();
    }, [user.id]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => setPhotoPreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true); setError(''); setSuccess('');
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) { setError('Please enter a valid email address.'); setSaving(false); return; }
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) { setError('Phone number must be exactly 10 digits.'); setSaving(false); return; }
        try {
            let profileUrl = user.profile_photo_url;
            if (photoFile) {
                // Convert file to base64 data URL
                profileUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = ev => resolve(ev.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(photoFile);
                });
            }
            await api.patch(`/api/users/${user.id}/profile`, { phone, email, full_name: fullName, profile_photo_url: profileUrl });
            const stored = JSON.parse(localStorage.getItem('pw_session'));
            if (stored) { stored.user = { ...stored.user, phone, email, full_name: fullName, profile_photo_url: profileUrl }; localStorage.setItem('pw_session', JSON.stringify(stored)); }
            useAuthStore.setState({ user: { ...user, phone, email, full_name: fullName, profile_photo_url: profileUrl } });
            setSuccess('Profile updated successfully'); setPhotoFile(null);
        } catch (err) { setError(err.message); }
        setSaving(false);
    };

    const handleChangePassword = async () => {
        setPwSaving(true); setError(''); setSuccess('');
        if (newPw.length < 8) { setError('Password must be at least 8 characters'); setPwSaving(false); return; }
        if (newPw !== confirmPw) { setError('Passwords do not match'); setPwSaving(false); return; }
        try {
            await changePassword(currentPw, newPw);
            setSuccess('Password changed successfully');
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
        } catch (err) { setError(err.message); }
        setPwSaving(false);
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>Profile Settings</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Manage your profile, photo, and password</Typography>

            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Grid container spacing={3}>
                {/* Profile Info */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card><CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>Profile Information</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar src={photoPreview} sx={{ width: 88, height: 88, fontSize: 32, border: '3px solid rgba(217,119,6,0.3)' }}>
                                    {(fullName || user.username)?.[0]?.toUpperCase()}
                                </Avatar>
                                <input type="file" accept="image/*" onChange={handlePhotoChange} id="avatar-upload" style={{ display: 'none' }} />
                                <label htmlFor="avatar-upload">
                                    <Box sx={{
                                        position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%',
                                        bgcolor: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    }}>
                                        <CameraAlt sx={{ fontSize: 14, color: '#fff' }} />
                                    </Box>
                                </label>
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight={600}>{fullName || user.username}</Typography>
                                <Chip label={user.role} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                            </Box>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField fullWidth label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth label="Username" value={user.username} disabled helperText="Cannot be changed" />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth label="Email" value={email} onChange={e => setEmail(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth label="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth label="Role" value={user.role} disabled />
                            </Grid>
                        </Grid>

                        <Button variant="contained" startIcon={saving ? <CircularProgress size={18} /> : <Save />}
                            onClick={handleSaveProfile} disabled={saving} sx={{ mt: 3 }}>
                            Save Changes
                        </Button>
                    </CardContent></Card>
                </Grid>

                {/* Change Password */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card><CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Lock color="primary" />
                            <Typography variant="h6" fontWeight={600}>Change Password</Typography>
                        </Box>
                        <TextField fullWidth label="Current Password" type="password" value={currentPw}
                            onChange={e => setCurrentPw(e.target.value)} sx={{ mb: 2 }} />
                        <TextField fullWidth label="New Password" type="password" value={newPw}
                            onChange={e => setNewPw(e.target.value)} sx={{ mb: 2 }} helperText="At least 8 characters" />
                        <TextField fullWidth label="Confirm New Password" type="password" value={confirmPw}
                            onChange={e => setConfirmPw(e.target.value)} sx={{ mb: 3 }} />
                        <Button fullWidth variant="outlined" startIcon={pwSaving ? <CircularProgress size={18} /> : <Lock />}
                            onClick={handleChangePassword} disabled={pwSaving || !currentPw || !newPw || !confirmPw}>
                            Update Password
                        </Button>
                    </CardContent></Card>
                </Grid>
            </Grid>
        </Box>
    );
}
