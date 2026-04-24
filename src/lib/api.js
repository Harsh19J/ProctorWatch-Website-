/**
 * api.js — Drop-in REST client replacing @supabase/supabase-js
 * All requests go to the Express + MongoDB backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getToken() {
    try {
        const session = JSON.parse(localStorage.getItem('pw_session') || 'null');
        return session?.token || null;
    } catch {
        return null;
    }
}

function authHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function request(method, path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: authHeaders(),
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!res.ok) {
        const err = new Error(data?.error || `API ${method} ${path} failed: ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

export const api = {
    get:    (path)         => request('GET',    path),
    post:   (path, body)   => request('POST',   path, body),
    patch:  (path, body)   => request('PATCH',  path, body),
    del:    (path)         => request('DELETE', path),
};

export default api;
