'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Bell, Calendar, FileText, Users, School, Loader2, Sparkles } from 'lucide-react';
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
                // Assuming dashData contains stats for the operator's school
                setDashboardData((prev: any) => ({
                    ...prev,
                    last_report_status: d[0]?.status_laporan || 'BELUM ADA', // Taking first report status if available
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
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-emerald-700" size={64} />
                <p className="font-black text-slate-900 uppercase tracking-widest text-center">Sinkronisasi Data Madrasah...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    label="Status Laporan"
                    value={dashboardData.last_report_status}
                    icon={<FileText size={40} />}
                    color="emerald"
                    subText="Status laporan terakhir bulan ini"
                />
                <StatCard
                    label="Jumlah Siswa"
                    value={dashboardData.total_siswa.toLocaleString('id-ID')}
                    icon={<Users size={40} />}
                    color="amber"
                    subText="Data siswa tervalidasi di sistem"
                />
                <StatCard
                    label="Tenaga Pendidik"
                    value={dashboardData.total_guru}
                    icon={<School size={40} />}
                    color="blue"
                    subText="Total guru dan staff aktif"
                />
            </div>

            {/* Information Section */}
            <div className="mt-16">
                <div className="flex items-center justify-between mb-8 group">
                    <h3 className="text-3xl font-black flex items-center gap-4 text-slate-900 uppercase tracking-tighter leading-none">
                        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center border-4 border-amber-300 shadow-lg group-hover:rotate-12 transition-transform">
                            <Bell className="text-amber-800" size={32} />
                        </div>
                        Pusat Informasi & Pengumuman
                    </h3>
                    <div className="hidden md:flex items-center gap-2 text-emerald-800 font-black text-sm uppercase bg-emerald-50 px-5 py-2 rounded-full border-2 border-emerald-300">
                        <Sparkles size={18} />
                        Update Real-time
                    </div>
                </div>

                <div className="grid gap-8">
                    {dashboardData.announcements.length > 0 ? (
                        dashboardData.announcements.map((item: any) => (
                            <div key={item.id} className="bg-white p-10 rounded-[2.5rem] border-4 border-slate-900 shadow-[0_15px_0_0_#f1f5f9] hover:shadow-[0_20px_0_0_#0f172a] hover:-translate-y-2 transition-all relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:bg-emerald-50 transition-colors" />

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                                    <span className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg self-start">
                                        PENGUMUMAN RESMI
                                    </span>
                                    <div className="flex items-center gap-3 text-slate-400 font-black uppercase text-sm">
                                        <Calendar size={22} className="text-emerald-600" />
                                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>

                                <h4 className="font-black text-4xl mb-6 text-slate-900 tracking-tighter uppercase leading-none group-hover:text-emerald-800 transition-colors max-w-2xl relative z-10">
                                    {item.judul}
                                </h4>

                                <div className="text-slate-600 text-xl font-bold leading-relaxed max-w-5xl bg-slate-50/80 p-6 rounded-3xl border-2 border-slate-100 relative z-10">
                                    {item.isi_info}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-32 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-300">
                            <p className="text-slate-400 font-black text-3xl uppercase italic italic tracking-tighter">BELUM ADA PENGUMUMAN TERBARU SAAT INI</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color, subText }: any) {
    const colors: any = {
        emerald: "border-emerald-600 bg-emerald-50 text-emerald-800",
        amber: "border-amber-600 bg-amber-50 text-amber-800",
        blue: "border-blue-600 bg-blue-50 text-blue-800"
    };

    return (
        <div className={`p-10 rounded-[3rem] border-4 ${colors[color]} shadow-[0_15px_45px_rgba(0,0,0,0.05)] bg-white relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-base font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
                    <h3 className="text-5xl font-black tracking-tighter leading-none group-hover:bg-emerald-100/50 transition-colors rounded-xl">{value}</h3>
                </div>
                <div className="p-6 bg-white border-4 border-slate-900 rounded-[2rem] shadow-xl group-hover:rotate-6 transition-transform">
                    {icon}
                </div>
            </div>
            <p className="text-sm font-black mt-8 uppercase tracking-tight italic opacity-70 relative z-10 border-t-2 border-slate-200 pt-4">
                {subText}
            </p>
        </div>
    );
}
