'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Megaphone,
    Search,
    Send,
    Trash2,
    Loader2,
    Calendar,
    MapPin,
    ArrowUpRight,
    Users,
    TrendingUp,
    Shield,
    ShieldCheck
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

export default function KasiDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        total_madrasah: 0,
        laporan_masuk: 0,
        terverifikasi: 0,
        recent_submissions: []
    });

    const [newAnnouncement, setNewAnnouncement] = useState({
        judul: '',
        isi_info: ''
    });

    const fetchDashData = async () => {
        setIsLoading(true);
        try {
            const [statsRes, annRes, logRes] = await Promise.all([
                api.admin.getStats(),
                api.master.getPengumuman(),
                api.admin.getActivityLogs()
            ]);

            if (statsRes.ok) {
                const data = await statsRes.json();
                const submissions = data.recent_submissions || data.data?.recent_submissions || [];
                setStats({
                    total_madrasah: data.total_madrasah || 0,
                    laporan_masuk: data.laporan_masuk || 0,
                    terverifikasi: data.terverifikasi || 0,
                    recent_submissions: Array.isArray(submissions) ? submissions : []
                });
            }

            if (annRes.ok) {
                const data = await annRes.json();
                setAnnouncements(data.data || data);
            }

            if (logRes.ok) {
                const data = await logRes.json();
                setActivityLogs(data.data || data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashData();
    }, []);

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAnnouncement.judul || !newAnnouncement.isi_info) return;

        setIsSubmitting(true);
        try {
            const res = await api.admin.createPengumuman(newAnnouncement);
            if (res.ok) {
                setNewAnnouncement({ judul: '', isi_info: '' });
                const updatedAnn = await api.master.getPengumuman();
                if (updatedAnn.ok) {
                    const data = await updatedAnn.json();
                    setAnnouncements(data.data || data);
                }
            }
        } catch (error) {
            console.error('Failed to create announcement:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAnnouncement = async (id: number) => {
        if (!confirm('Hapus instruksi ini?')) return;
        try {
            const res = await api.admin.deletePengumuman(id);
            if (res.ok) {
                setAnnouncements(announcements.filter(a => a.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete announcement:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 animate-fade-in">
                <Loader2 className="animate-spin text-emerald-700" size={64} />
                <p className="font-black text-slate-900 uppercase tracking-widest text-sm text-center">Menyusun Radar Monitoring Pimpinan...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in -mt-6 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MiniStatCard label="Database Madrasah" value={stats.total_madrasah} icon={<Users size={20} />} trend="+2 Baru" />
                    <MiniStatCard label="Trafik Laporan" value={stats.laporan_masuk} icon={<TrendingUp size={20} />} trend="Bulan Ini" />
                    <MiniStatCard label="Validasi Final" value={stats.terverifikasi} icon={<Shield size={20} />} trend="Audited" />
                    <MiniStatCard label="Kecamatan" value="22" icon={<MapPin size={20} />} trend="Kampar" />
                </div>

                <div className="lg:col-span-3 flex flex-col justify-center bg-slate-900 border-[3px] border-slate-900 p-6 rounded-[2rem] shadow-[6px_6px_0_0_#10b981] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-[4px_4px_0_0_#ffffff20]">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Otoritas</p>
                            <p className="text-sm font-black text-white uppercase tracking-tight">Level Pimpinan</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    <Card title="BUAT PENGUMUMAN STRATEGIS">
                        <form onSubmit={handleCreateAnnouncement} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <Input
                                    label="Judul Instruksi"
                                    placeholder="Contoh: Batas Akhir Laporan Bulan Maret 2026"
                                    value={newAnnouncement.judul}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, judul: e.target.value })}
                                />
                                <div className="space-y-2">
                                    <label className="input-label">Detail Pengumuman / Instruksi Pimpinan</label>
                                    <textarea
                                        className="w-full min-h-[150px] p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-slate-900 font-bold text-sm focus:outline-none focus:border-emerald-500 transition-all resize-none"
                                        placeholder="Tuliskan detail instruksi untuk seluruh operator madrasah..."
                                        value={newAnnouncement.isi_info}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isi_info: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="!py-5 !px-12 bg-emerald-700 shadow-xl shadow-emerald-200/50"
                                    icon={<Send size={20} />}
                                >
                                    {isSubmitting ? 'MENGIRIM...' : 'PUBLIKASIKAN INSTRUKSI'}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    <Card title="RIWAYAT PENGUMUMAN">
                        <div className="space-y-6">
                            {(announcements || []).map((ann, idx) => (
                                <div key={idx} className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 flex items-start justify-between group hover:border-emerald-200 transition-all">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 border-2 border-slate-100 shrink-0">
                                            <Megaphone size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-black text-slate-900 uppercase tracking-tight italic">{ann.judul}</h4>
                                                <span className="text-[10px] font-black text-slate-400 border border-slate-200 px-2 py-0.5 rounded uppercase">
                                                    {new Date(ann.created_at).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-500 line-clamp-2 italic">{ann.isi_info}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAnnouncement(ann.id)}
                                        className="p-3 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-2 border-slate-100 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-10">
                    <Card title="RADAR AKTIVITAS SISTEM">
                        <div className="space-y-8">
                            <div className="bg-emerald-50 p-6 rounded-[2rem] border-2 border-emerald-100 border-dashed">
                                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-4">Radar Aktivitas Sistem</p>
                                <div className="space-y-6">
                                    {(activityLogs || []).slice(0, 7).map((log: any, i: number) => {
                                        const getActionMeta = (action: string) => {
                                            switch (action) {
                                                case 'LOGIN': return { label: 'Masuk Sistem', color: 'text-blue-600', dot: 'bg-blue-500' };
                                                case 'LOGOUT': return { label: 'Keluar Sistem', color: 'text-slate-500', dot: 'bg-slate-400' };
                                                case 'CREATE_USER': return { label: 'Tambah User Baru', color: 'text-emerald-600', dot: 'bg-emerald-500' };
                                                case 'DELETE_USER': return { label: 'Hapus Akun', color: 'text-rose-600', dot: 'bg-rose-500' };
                                                case 'APPROVE_REPORT': return { label: 'Setujui Laporan', color: 'text-emerald-600', dot: 'bg-emerald-500' };
                                                case 'REVISE_REPORT': return { label: 'Minta Revisi', color: 'text-amber-600', dot: 'bg-amber-500' };
                                                case 'SUBMIT_REPORT': return { label: 'Kirim Laporan', color: 'text-indigo-600', dot: 'bg-indigo-500' };
                                                default: return { label: action, color: 'text-slate-500', dot: 'bg-slate-400' };
                                            }
                                        };
                                        const meta = getActionMeta(log.action);
                                        return (
                                            <div key={i} className="flex gap-4 relative">
                                                <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center shrink-0">
                                                    <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
                                                </div>
                                                <div className="text-[11px] leading-tight">
                                                    <span className="font-black text-slate-900 uppercase tracking-tighter block">{log.username}</span>
                                                    <span className={`font-bold ${meta.color} uppercase text-[9px] block`}>{meta.label}: {log.subject}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase italic">{new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {activityLogs.length === 0 && (
                                        <p className="text-[10px] font-bold text-slate-400 text-center py-10 uppercase italic">Belum ada aktivitas terekam</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function MiniStatCard({ label, value, icon, trend }: any) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border-[3px] border-slate-900 shadow-[6px_6px_0_0_#0f172a] hover:bg-slate-50 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl border-2 border-slate-900 flex items-center justify-center text-emerald-600 shadow-[3px_3px_0_0_#0f172a] group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    {icon}
                </div>
                <div className="text-[9px] font-black text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded-lg border border-emerald-200 uppercase tracking-tighter">
                    {trend}
                </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{value}</p>
        </div>
    );
}
