'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { FileCheck, FileClock, FileWarning, School, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<any>({
        total_madrasah: 0,
        laporan_masuk: 0,
        terverifikasi: 0,
        perlu_revisi: 0,
        recent_submissions: [],
        kecamatan_progress: []
    });

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const response = await api.admin.getStats();
            const data = await response.json();
            if (response.ok) {
                // Ensure we handle data structural differences if any
                const d = data.data || data;
                setStats({
                    total_madrasah: d.total_madrasah || 0,
                    laporan_masuk: d.laporan_masuk || 0,
                    terverifikasi: d.terverifikasi || 0,
                    perlu_revisi: d.perlu_revisi || 0,
                    recent_submissions: d.recent_submissions || [],
                    kecamatan_progress: d.kecamatan_progress || []
                });
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-emerald-700" size={64} />
                <p className="font-black text-slate-900 uppercase tracking-widest">Memuat Statistik Real-time...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter text-slate-900 italic">Dashboard Monitoring</h1>
                <p className="text-slate-500 font-bold">Overview status laporan madrasah seluruh kabupaten.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatsCard
                    label="Total Madrasah"
                    value={stats.total_madrasah}
                    icon={<School className="text-blue-600" size={32} />}
                    bg="bg-blue-50"
                />
                <StatsCard
                    label="Laporan Masuk"
                    value={stats.laporan_masuk}
                    subValue={`${Math.round((stats.laporan_masuk / (stats.total_madrasah || 1)) * 100)}% dari total`}
                    icon={<FileClock className="text-amber-600" size={32} />}
                    bg="bg-amber-50"
                />
                <StatsCard
                    label="Terverifikasi"
                    value={stats.terverifikasi}
                    icon={<FileCheck className="text-emerald-600" size={32} />}
                    bg="bg-emerald-50"
                />
                <StatsCard
                    label="Perlu Revisi"
                    value={stats.perlu_revisi}
                    icon={<FileWarning className="text-red-600" size={32} />}
                    bg="bg-red-50"
                />
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card title="LAPORAN TERBARU MASUK">
                    <div className="space-y-4">
                        {stats.recent_submissions.length > 0 ? (
                            stats.recent_submissions.map((report: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-6 hover:bg-slate-50 rounded-2xl transition-all border-b-4 border-slate-100 last:border-0 group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors uppercase">
                                            {report.madrasah?.nama_madrasah?.substring(0, 2) || 'RA'}
                                        </div>
                                        <div>
                                            <p className="font-black text-xl text-slate-900 tracking-tighter uppercase leading-none mb-1">
                                                {report.madrasah?.nama_madrasah}
                                            </p>
                                            <p className="text-sm font-bold text-slate-400 uppercase">{report.madrasah?.alamat || 'Lokasi tidak tersedia'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black text-amber-800 bg-amber-100 px-4 py-1.5 rounded-full border-2 border-amber-300 uppercase">
                                            {report.status_laporan}
                                        </span>
                                        <p className="text-xs font-bold text-slate-400 mt-2 uppercase">
                                            {new Date(report.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center font-black text-slate-300 uppercase italic opacity-50">Belum ada laporan masuk baru-baru ini</div>
                        )}
                    </div>
                </Card>

                <Card title="PROGRESS PENGUMPULAN">
                    <div className="space-y-8 p-4">
                        {stats.kecamatan_progress.length > 0 ? (
                            stats.kecamatan_progress.map((item: any) => (
                                <div key={item.kecamatan}>
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="font-black text-lg text-slate-800 uppercase tracking-tight">{item.kecamatan}</span>
                                        <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">{item.percentage}% SLC</span>
                                    </div>
                                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center font-black text-slate-300 uppercase italic">Data progress belum tersedia</div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}

function StatsCard({ label, value, subValue, icon, bg }: any) {
    return (
        <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 shadow-[0_10px_0_0_#0f172a] flex items-start justify-between">
            <div>
                <p className="text-slate-500 text-sm font-black mb-1 uppercase tracking-widest">{label}</p>
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{value}</h3>
                {subValue && (
                    <p className="text-xs font-black text-emerald-800 mt-3 bg-emerald-100/50 px-3 py-1 rounded-lg border-2 border-emerald-300 inline-block uppercase tracking-tight">
                        {subValue}
                    </p>
                )}
            </div>
            <div className={`p-5 rounded-2xl ${bg} border-2 border-slate-900 shadow-md`}>
                {icon}
            </div>
        </div>
    );
}
