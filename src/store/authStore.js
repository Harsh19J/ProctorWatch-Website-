import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set, get) => ({
    user: null,
    session: null,
    loading: true,
    error: null,

    initialize: async () => {
        try {
            const stored = localStorage.getItem('pw_session');
            if (stored) {
                const session = JSON.parse(stored);
                set({ user: session.user, session, loading: false });
            } else {
                set({ loading: false });
            }
        } catch (err) {
            set({ loading: false, error: err.message });
        }
    },

    login: async (username, password) => {
        set({ loading: true, error: null });
        try {
            const data = await api.post('/api/auth/login', { username, password });

            const session = {
                user: data.user,
                token: data.token,
            };

            localStorage.setItem('pw_session', JSON.stringify(session));
            set({ user: data.user, session, loading: false });
            return session;
        } catch (err) {
            set({ loading: false, error: err.data?.error || err.message });
            throw err;
        }
    },

    logout: async () => {
        try { await api.post('/api/auth/logout', {}); } catch { /* ignore */ }
        localStorage.removeItem('pw_session');
        set({ user: null, session: null, error: null });
    },

    changePassword: async (currentPassword, newPassword) => {
        const { user } = get();
        if (!user) throw new Error('Not logged in');
        await api.post('/api/auth/change-password', { currentPassword, newPassword });

        // Update local session
        set({ user: { ...user, first_login: false } });
        const stored = JSON.parse(localStorage.getItem('pw_session'));
        stored.user.first_login = false;
        localStorage.setItem('pw_session', JSON.stringify(stored));
    },

    verifyAdmin: async (username, password) => {
        try {
            const data = await api.post('/api/auth/verify-admin', { username, password });
            return data; // { id, role }
        } catch {
            return null;
        }
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;
