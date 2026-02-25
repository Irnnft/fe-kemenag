const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (response.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    }

    return response;
};

export const api = {
    auth: {
        login: (credentials: any) => apiFetch('/login', { method: 'POST', body: JSON.stringify(credentials) }),
        logout: () => apiFetch('/logout', { method: 'POST' }),
        me: () => apiFetch('/me'),
        updateProfile: (data: any) => apiFetch('/profile/update', { method: 'PUT', body: JSON.stringify(data) }),
        updatePassword: (data: any) => apiFetch('/profile/password', { method: 'PUT', body: JSON.stringify(data) }),
    },
    admin: {
        getStats: () => apiFetch('/admin/dashboard'),
        getLaporan: (params?: any) => {
            const searchParams = new URLSearchParams(params).toString();
            return apiFetch(`/admin/laporan?${searchParams}`);
        },
        verifyLaporan: (id: string | number, data: any) => apiFetch(`/admin/laporan/${id}/verify`, { method: 'POST', body: JSON.stringify(data) }),
        getRecap: (params?: any) => {
            const searchParams = new URLSearchParams(params).toString();
            return apiFetch(`/admin/recap?${searchParams}`);
        },
        getActivityLogs: () => apiFetch('/admin/logs'),
        deleteLog: (id: string | number) => apiFetch(`/admin/logs/${id}`, { method: 'DELETE' }),
        bulkDeleteLogs: (ids: (string | number)[]) => apiFetch('/admin/logs/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),
        deleteLaporan: (id: string | number) => apiFetch(`/admin/laporan/${id}`, { method: 'DELETE' }),
        restoreLaporan: (id: string | number) => apiFetch(`/admin/laporan/${id}/restore`, { method: 'POST' }),
        permanentDeleteLaporan: (id: string | number) => apiFetch(`/admin/laporan/${id}/permanent`, { method: 'DELETE' }),
        createPengumuman: (data: any) => apiFetch('/master/pengumuman', { method: 'POST', body: JSON.stringify(data) }),
        deletePengumuman: (id: string | number) => apiFetch(`/master/pengumuman/${id}`, { method: 'DELETE' }),
    },
    master: {
        // Madrasah (Matching DB: id_madrasah, nama_madrasah)
        getMadrasah: () => apiFetch('/master/madrasah'),
        getMadrasahById: (id: string | number) => apiFetch(`/master/madrasah/${id}`),
        createMadrasah: (data: any) => apiFetch('/master/madrasah', { method: 'POST', body: JSON.stringify(data) }),
        updateMadrasah: (id: string | number, data: any) => apiFetch(`/master/madrasah/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteMadrasah: (id: string | number) => apiFetch(`/master/madrasah/${id}`, { method: 'DELETE' }),

        // Users (Matching DB: username, role, id_madrasah)
        getUsers: () => apiFetch('/master/users'),
        createUser: (data: any) => apiFetch('/master/users', { method: 'POST', body: JSON.stringify(data) }),
        updateUser: (id: string | number, data: any) => apiFetch(`/master/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteUser: (id: string | number) => apiFetch(`/master/users/${id}`, { method: 'DELETE' }),

        // Pengumuman
        getPengumuman: () => apiFetch('/pengumuman'),
        storePengumuman: (data: any) => apiFetch('/master/pengumuman', { method: 'POST', body: JSON.stringify(data) }),
    },
    operator: {
        getDashboard: (params?: any) => {
            const searchParams = new URLSearchParams(params).toString();
            return apiFetch(`/operator/dashboard?${searchParams}`);
        },
        getLaporanDetail: (id: string) => apiFetch(`/laporan/${id}`),
        createLaporan: (data: any) => apiFetch('/laporan', { method: 'POST', body: JSON.stringify(data) }),
        deleteLaporan: (id: string) => apiFetch(`/laporan/${id}`, { method: 'DELETE' }),
        restoreLaporan: (id: string) => apiFetch(`/laporan/${id}/restore`, { method: 'POST' }),
        permanentDeleteLaporan: (id: string) => apiFetch(`/laporan/${id}/permanent`, { method: 'DELETE' }),

        // Match Backend Routes
        updateSiswa: (id: string, data: any) => apiFetch(`/laporan/${id}/siswa`, { method: 'PUT', body: JSON.stringify({ data }) }),
        updateRekapPersonal: (id: string, data: any) => apiFetch(`/laporan/${id}/rekap-personal`, { method: 'PUT', body: JSON.stringify({ data }) }),
        updateGuru: (id: string, data: any) => apiFetch(`/laporan/${id}/guru`, { method: 'PUT', body: JSON.stringify({ data }) }),
        updateSarpras: (id: string, data: any) => apiFetch(`/laporan/${id}/sarpras`, { method: 'PUT', body: JSON.stringify({ data }) }),
        updateMobiler: (id: string, data: any) => apiFetch(`/laporan/${id}/mobiler`, { method: 'PUT', body: JSON.stringify({ data }) }),
        updateKeuangan: (id: string, data: any) => apiFetch(`/laporan/${id}/keuangan`, { method: 'PUT', body: JSON.stringify({ data }) }),

        submitLaporan: (id: string) => apiFetch(`/laporan/${id}/submit`, { method: 'POST' }),

        // Profile
        getMyMadrasah: () => apiFetch('/operator/madrasah'),
        updateMyMadrasah: (data: any) => apiFetch('/operator/madrasah', { method: 'PUT', body: JSON.stringify(data) }),
    }
};
