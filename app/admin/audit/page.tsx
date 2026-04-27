'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import {
    Shield,
    Clock,
    User,
    Activity,
    Search,
    Loader2,
    Calendar,
    ArrowUpRight,
    LogIn,
    LogOut,
    UserPlus,
    UserMinus,
    CheckCircle2,
    XCircle,
    Send,
    Trash2,
    CheckSquare,
    Square,
    MoreVertical,
    Settings,
    Key,
    School,
    Megaphone,
    Undo2,
    FileX
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export default function AuditLogsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [identityMap, setIdentityMap] = useState<Record<string, any>>({});

    const fetchIdentityContext = async () => {
        try {
            const [resMadrasah, resUsers] = await Promise.all([
                api.master.getMadrasah(),
                api.master.getUsers()
            ]);

            const newMap: Record<string, any> = {};

            if (resMadrasah.ok) {
                const mData = await resMadrasah.json();
                (mData.data || mData).forEach((m: any) => {
                    newMap[`m_${m.npsn}`] = m.nama_madrasah;
                });
            }

            if (resUsers.ok) {
                const uData = await resUsers.json();
                (uData.data || uData).forEach((u: any) => {
                    newMap[u.username] = {
                        name: u.name,
                        madrasah_name: u.madrasah?.nama_madrasah,
                        role: u.role
                    };
                });
            }

            setIdentityMap(newMap);
        } catch (error) {
            console.error('Failed to fetch context:', error);
        }
    };

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const response = await api.admin.getActivityLogs();
            if (response.ok) {
                const data = await response.json();
                setLogs(data.data || data);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchIdentityContext();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus log aktivitas ini secara permanen?')) return;
        setIsDeleting(true);
        try {
            const res = await api.admin.deleteLog(id);
            if (res.ok) {
                setLogs(logs.filter(l => l.id !== id));
                setSelectedIds(selectedIds.filter(sid => sid !== id));
            }
        } catch (error) {
            alert('Gagal menghapus log');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Hapus ${selectedIds.length} log aktivitas terpilih secara permanen?`)) return;

        setIsDeleting(true);
        try {
            const res = await api.admin.bulkDeleteLogs(selectedIds);
            if (res.ok) {
                setLogs(logs.filter(l => !selectedIds.includes(l.id)));
                setSelectedIds([]);
            }
        } catch (error) {
            alert('Gagal menghapus bulk log');
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectAll = (idsInGroup: number[]) => {
        const allSelected = idsInGroup.every(id => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds(selectedIds.filter(id => !idsInGroup.includes(id)));
        } else {
            const newSelected = [...selectedIds];
            idsInGroup.forEach(id => {
                if (!newSelected.includes(id)) newSelected.push(id);
            });
            setSelectedIds(newSelected);
        }
    };

    const formatRole = (role: string, username: string) => {
        // Prioritas: cek field role dari backend
        if (role === 'kasi_penmad') return 'Pimpinan';
        if (role === 'staff_penmad') return 'Staf Teknis';
        if (role === 'operator_sekolah') return 'Operator';

        // Fallback: cek dari nilai string (jika role dikirim sebagai teks biasa)
        const val = (role || '').toLowerCase();
        if (val.includes('kasi') || val.includes('pimpin')) return 'Pimpinan';
        if (val.includes('staff') || val.includes('staf') || val.includes('teknis')) return 'Staf Teknis';
        if (val.includes('operator') || val.includes('sekolah')) return 'Operator';

        // Fallback: username yang hanya angka = NPSN = Operator
        if (/^\d+$/.test(username || '')) return 'Operator';

        // Default jika tidak bisa teridentifikasi
        return 'Pengguna';
    };

    const getRoleStyle = (role: string, username: string) => {
        const r = formatRole(role, username);
        if (r === 'Pimpinan') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (r === 'Staf Teknis') return 'bg-blue-50 text-blue-700 border-blue-200';
        if (r === 'Operator') return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-slate-50 text-slate-600 border-slate-200';
    };

    const getActionMeta = (action: string) => {
        switch (action) {
            case 'LOGIN': return { label: 'Masuk Sistem', color: 'text-blue-600', bg: 'bg-blue-50', icon: <LogIn size={18} /> };
            case 'LOGOUT': return { label: 'Keluar Sistem', color: 'text-slate-500', bg: 'bg-slate-100', icon: <LogOut size={18} /> };
            case 'CREATE_USER': return { label: 'Tambah User', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <UserPlus size={18} /> };
            case 'UPDATE_USER': return { label: 'Update Akun', color: 'text-amber-600', bg: 'bg-amber-50', icon: <Settings size={18} /> };
            case 'DELETE_USER': return { label: 'Hapus Akun', color: 'text-rose-600', bg: 'bg-rose-50', icon: <UserMinus size={18} /> };
            case 'APPROVE_REPORT': return { label: 'Setujui Laporan', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: <CheckCircle2 size={18} /> };
            case 'REVISE_REPORT': return { label: 'Minta Revisi', color: 'text-amber-700', bg: 'bg-amber-100', icon: <XCircle size={18} /> };
            case 'SUBMIT_REPORT': return { label: 'Kirim Laporan', color: 'text-indigo-700', bg: 'bg-indigo-50', icon: <Send size={18} /> };
            case 'DELETE_LAPORAN': return { label: 'Hapus Laporan', color: 'text-rose-600', bg: 'bg-rose-50', icon: <Trash2 size={18} /> };
            case 'RESTORE_LAPORAN': return { label: 'Pulihkan Laporan', color: 'text-teal-600', bg: 'bg-teal-50', icon: <Undo2 size={18} /> };
            case 'PERMANENT_DELETE_LAPORAN': return { label: 'Hapus Permanen', color: 'text-rose-900', bg: 'bg-rose-100', icon: <FileX size={18} /> };
            case 'CREATE_MADRASAH': return { label: 'Tambah Madrasah', color: 'text-blue-700', bg: 'bg-blue-50', icon: <School size={18} /> };
            case 'UPDATE_MADRASAH': return { label: 'Update Madrasah', color: 'text-blue-800', bg: 'bg-blue-100', icon: <School size={18} /> };
            case 'UPDATE_PROFILE': return { label: 'Update Profil', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <User size={18} /> };
            case 'CHANGE_PASSWORD': return { label: 'Ganti Kata Sandi', color: 'text-rose-600', bg: 'bg-rose-50', icon: <Key size={18} /> };
            case 'DELETE_ANNOUNCEMENT': return { label: 'Hapus Info', color: 'text-rose-700', bg: 'bg-rose-100', icon: <Megaphone size={18} /> };
            default: return { label: action.replace(/_/g, ' '), color: 'text-slate-500', bg: 'bg-slate-100', icon: <Activity size={18} /> };
        }
    };

    const groupedLogs = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const filtered = logs.filter(log => {
            const meta = getActionMeta(log.action);
            const identity = identityMap[log.username];
            const displayName = (identity?.name || log.username).toLowerCase();
            const madrasahName = (identity?.madrasah_name || identityMap[`m_${log.username}`] || '').toLowerCase();
            const actionLabel = meta.label.toLowerCase();
            const details = (log.details || '').toLowerCase();
            const subject = (log.subject || '').toLowerCase();

            return displayName.includes(query) ||
                madrasahName.includes(query) ||
                actionLabel.includes(query) ||
                details.includes(query) ||
                subject.includes(query) ||
                log.action.toLowerCase().includes(query);
        });

        const groups: { [key: string]: any[] } = {};
        filtered.forEach(log => {
            const date = new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            if (!groups[date]) groups[date] = [];
            groups[date].push(log);
        });

        return groups;
    }, [logs, searchQuery]);

    const dateKeys = Object.keys(groupedLogs);

    return (
        <div className="space-y-8 animate-fade-in pb-20 -mt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex bg-white border-2 border-slate-900 rounded-2xl overflow-hidden shadow-[4px_4px_0_0_#0f172a] group">
                    <div className="px-4 flex items-center bg-slate-50 border-r-2 border-slate-900">
                        <Search size={20} className="text-slate-400 group-focus-within:text-emerald-600" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari aktor / kegiatan..."
                        className="py-4 px-6 outline-none font-bold text-sm min-w-[300px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-6 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a]"
                    >
                        <Trash2 size={16} />
                        Hapus {selectedIds.length} Terpilih
                    </button>
                )}
            </div>

            <Card>
                <div className="overflow-x-auto -mx-10 px-10">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                                <th className="px-6 py-6 border-b-2 border-slate-200 text-left w-20">Pilih</th>
                                <th className="px-6 py-6 border-b-2 border-slate-200 text-left">Waktu</th>
                                <th className="px-6 py-6 border-b-2 border-slate-200 text-left">Aktor</th>
                                <th className="px-6 py-6 border-b-2 border-slate-200 text-left">Kegiatan</th>
                                <th className="px-6 py-6 border-b-2 border-slate-200 text-left">Detail</th>
                                <th className="px-6 py-6 border-b-2 border-slate-200 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-emerald-600 mb-4" size={48} />
                                        <p className="font-black text-slate-300 uppercase tracking-widest text-sm">Menarik data dari server...</p>
                                    </td>
                                </tr>
                            ) : dateKeys.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center italic text-slate-300 font-black uppercase tracking-widest opacity-40">
                                        Tidak ada rekaman aktivitas
                                    </td>
                                </tr>
                            ) : dateKeys.map(date => {
                                const logsInGroup = groupedLogs[date];
                                const groupIds = logsInGroup.map(l => l.id);
                                const isAllInGroupSelected = groupIds.every(id => selectedIds.includes(id));

                                return (
                                    <React.Fragment key={date}>
                                        {/* Sticky Date Row */}
                                        <tr className="bg-slate-50 shadow-sm border-y-2 border-slate-200">
                                            <td className="px-6 py-4 text-left">
                                                <button
                                                    onClick={() => toggleSelectAll(groupIds)}
                                                    className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all ${isAllInGroupSelected ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'}`}
                                                >
                                                    {isAllInGroupSelected && <CheckSquare size={12} className="text-white" />}
                                                </button>
                                            </td>
                                            <td colSpan={5} className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={16} className="text-emerald-600" />
                                                    <span className="font-black text-slate-900 uppercase tracking-widest text-xs italic">{date}</span>
                                                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-400">{logsInGroup.length} Kejadian</span>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Data Rows */}
                                        {logsInGroup.map(log => {
                                            const meta = getActionMeta(log.action);
                                            const isSelected = selectedIds.includes(log.id);
                                            const identity = identityMap[log.username];
                                            const displayName = identity?.name || log.username;
                                            const initials = displayName.substring(0, 2).toUpperCase();

                                            return (
                                                <tr key={log.id} className={`group transition-all duration-200 ${isSelected ? 'bg-emerald-50/40' : 'hover:bg-slate-50/80'}`}>
                                                    <td className="px-6 py-2.5 text-left align-middle">
                                                        <button
                                                            onClick={() => toggleSelect(log.id)}
                                                            className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-200 group-hover:border-slate-400'}`}
                                                        >
                                                            {isSelected && <CheckSquare size={10} className="text-white" />}
                                                        </button>
                                                    </td>

                                                    <td className="px-6 py-2.5 text-left align-middle">
                                                        <div className="flex flex-col leading-tight">
                                                            <span className="font-bold text-slate-900 text-[11px]">
                                                                {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">WIB</span>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-2.5 text-left align-middle">
                                                        <div className="flex items-center gap-3 min-w-[200px]">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[9px] border-2 shadow-sm shrink-0 
                                                                ${log.role?.includes('kasi') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                                    log.role?.includes('staff') ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                                        'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                                                {initials}
                                                            </div>
                                                            <div className="flex flex-col gap-0 text-left">
                                                                <span className="font-black text-slate-900 text-[12px] uppercase tracking-tight leading-none">
                                                                    {displayName}
                                                                </span>
                                                                {(identity?.madrasah_name || identityMap[`m_${log.username}`]) && (
                                                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tight leading-normal">
                                                                        {identity?.madrasah_name || identityMap[`m_${log.username}`]}
                                                                    </span>
                                                                )}
                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em] mt-0.5 opacity-80">
                                                                    {formatRole(log.role, log.username)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-2.5 text-left align-middle">
                                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border-2 ${meta.bg} ${meta.color} border-current/10 shadow-sm`}>
                                                            {React.cloneElement(meta.icon as React.ReactElement<any>, { size: 12 })}
                                                            {meta.label}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-2.5 text-left align-middle">
                                                        <div className="flex flex-col max-w-[250px] text-left">
                                                            <div className="flex items-center gap-1.5 mb-0.5 opacity-70">
                                                                <ArrowUpRight size={10} className="text-slate-400" />
                                                                <span className="font-black text-slate-500 text-[9px] uppercase tracking-wider">
                                                                    {log.subject || 'SISTEM'}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tight line-clamp-1">
                                                                {log.details ? log.details.replace('user ', '').toUpperCase() : 'TIDAK ADA DETAIL AKTIVITAS'}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-2.5 text-left align-middle">
                                                        <button
                                                            onClick={() => handleDelete(log.id)}
                                                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
