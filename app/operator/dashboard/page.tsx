'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Bell, Calendar, FileText, Users, School, Loader2, Sparkles, TrendingUp, Info } from 'lucide-react';
import { api } from '@/lib/api';

export default function OperatorDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>({
        last_report_status: 'BELUM ADA',
        total_siswa: 0,
        total_guru: 0,
        announcements: []
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [dashRes, announceRes] = await Promise.all([
                api.operator.getDashboard(),
                api.master.getPengumuman()
            ]);

            const dashData = await dashRes.json();
            const announceData = await announceRes.json();

            if (dashRes.ok) {
                const d = dashData.data || dashData;
                setDashboardData((prev: any) => ({
                    ...prev,
                    last_report_status: d[0]?.status_laporan || 'BELUM ADA',
                    total_siswa: d.total_siswa || 0,
                    total_guru: d.total_guru || 0,
                }));
            }

            if (announceRes.ok) {
                setDashboardData((prev: any) => ({
                    ...prev,
                    announcements: announceData.data || announceData
                }));
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 animate-fade-in">
                <Loader2 className="animate-spin text-emerald-700" size={64} />
                <p className="font-black text-slate-900 uppercase tracking-widest text-sm text-center">Sinkronisasi Data Madrasah...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 animate-fade-in">
            {/* Header: Title & Action Status */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-slate-900 italic">Panduan & Tutorial Sistem</h1>
                    <p className="text-muted text-sm uppercase mt-2 font-bold tracking-tight text-blue-600">Pelajari instruksi penggunaan MIS KAMPAR untuk kelancaran operasional madrasah.</p>
                </div>
                <div className="flex items-center gap-4 bg-white border-2 border-slate-900 px-6 py-3 rounded-2xl shadow-[4px_4px_0_0_#0f172a]">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Navigasi</p>
                        <p className="text-xs font-black text-slate-900 uppercase">Pusat Bantuan Aktif</p>
                    </div>
                </div>
            </div>

            {/* Quick Tutorial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border-[3px] border-slate-900 shadow-[6px_6px_0_0_#10b981] group hover:-translate-y-1 transition-all">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-100 mb-6 group-hover:rotate-6 transition-transform">
                        <FileText size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-3">Unit Pelaporan</h3>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase italic">
                        1. Pilih menu "Laporan Saya"<br />
                        2. Klik tombol "Tambah Laporan"<br />
                        3. Isi data & unggah berkas PDF<br />
                        4. Klik simpan & tunggu verifikasi.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border-[3px] border-slate-900 shadow-[6px_6px_0_0_#3b82f6] group hover:-translate-y-1 transition-all">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border-2 border-blue-100 mb-6 group-hover:rotate-6 transition-transform">
                        <School size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-3">Update Kelembagaan</h3>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase italic">
                        Pastikan data NPSN, NSM, dan alamat madrasah selalu diperbarui melalui menu "Profil" agar data tersinkron ke pusat.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border-[3px] border-slate-900 shadow-[6px_6px_0_0_#f59e0b] group hover:-translate-y-1 transition-all">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border-2 border-amber-100 mb-6 group-hover:rotate-6 transition-transform">
                        <Bell size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-3">Pusat Notifikasi</h3>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase italic">
                        Selalu pantau "Papan Pengumuman" di bawah untuk instruksi terbaru, jadwal, atau perbaikan data yang diminta oleh admin.
                    </p>
                </div>
            </div>

            {/* Dashboard Content: Unified Information Hub */}
            <div className="grid grid-cols-1 gap-10">
                <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border-[3px] border-slate-900 shadow-[10px_10px_0_0_#0f172a] h-full flex flex-col relative overflow-hidden">
                    {/* Integrated Status Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 border-b-4 border-slate-100 pb-12">
                        <div className="space-y-3 px-2">
                            <span className="px-5 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                                PAPAN PENGUMUMAN
                            </span>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none mt-2">Pusat Informasi</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <Info size={16} className="text-blue-500" />
                                Update Berita & Status Laporan Anda
                            </p>
                        </div>

                        <div className="bg-emerald-50 p-6 md:p-8 rounded-[2.5rem] border-[3px] border-emerald-600 flex items-center gap-6 shadow-[6px_6px_0_0_#065f46]">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-100 shadow-sm">
                                <FileText size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Status Laporan Terakhir</p>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-black text-emerald-900 tracking-tighter italic leading-none">{dashboardData.last_report_status}</h3>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {dashboardData.announcements.length > 0 ? (
                        <div className="overflow-y-auto pr-4 space-y-10 max-h-[500px] custom-scrollbar px-2">
                            {dashboardData.announcements.map((announcement: any, index: number) => (
                                <div key={index} className="group relative border-transparent hover:border-l-4 hover:border-emerald-500 hover:pl-8 transition-all duration-300">
                                    <div className="flex items-center gap-4 text-emerald-600 font-black uppercase text-[10px] tracking-widest mb-3">
                                        <div className="bg-emerald-100 p-2 rounded-lg">
                                            <Calendar size={14} />
                                        </div>
                                        {new Date(announcement.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        {index === 0 && <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-[9px] font-black tracking-widest ml-2 animate-bounce">TERBARU</span>}
                                    </div>

                                    <h4 className="font-black text-2xl mb-4 text-slate-900 tracking-tighter uppercase italic leading-tight group-hover:text-emerald-700 transition-colors">
                                        {announcement.judul}
                                    </h4>

                                    <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 italic relative group-hover:bg-slate-100 transition-colors">
                                        <div className="flex gap-4">
                                            <Info className="shrink-0 text-slate-300 mt-1" size={18} />
                                            <span className="text-slate-600 text-base font-medium leading-relaxed">{announcement.isi_info}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-20 text-center">
                            <Bell size={64} className="mx-auto text-slate-200 mb-6 opacity-50" />
                            <p className="text-slate-300 font-black text-2xl uppercase italic tracking-widest opacity-30">Belum ada pengumuman masuk</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color, subText }: any) {
    const variants: any = {
        emerald: "border-emerald-600 bg-emerald-50 text-emerald-800",
        amber: "border-amber-600 bg-amber-50 text-amber-800",
        blue: "border-blue-600 bg-blue-50 text-blue-800"
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border-[3px] border-slate-900 shadow-[6px_6px_0_0_#0f172a] group hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">{value}</h3>
                </div>
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 border-2 border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                    {icon}
                </div>
            </div>
            <div className="pt-6 border-t-2 border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500" />
                    {subText}
                </p>
            </div>
        </div>
    );
}
