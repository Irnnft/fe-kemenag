'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileSpreadsheet, Printer, Loader2, Calendar, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

export default function RecapPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [recapData, setRecapData] = useState<any[]>([]);
    const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [kecamatan, setKecamatan] = useState('Semua Kecamatan');

    const fetchRecap = async () => {
        setIsLoading(true);
        try {
            const response = await api.admin.getRecap();
            const data = await response.json();
            if (response.ok) {
                setRecapData(data.data || data);
            }
        } catch (error) {
            console.error('Failed to fetch recap:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecap();
    }, []);

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Pusat Rekapitulasi</h1>
                    <p className="text-lg font-bold text-slate-500 mt-2 uppercase tracking-wide">Analisis & Export data laporan seluruh kabupaten.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card title="REKAP BULANAN (EXCEL)">
                    <div className="space-y-10">
                        <div className="bg-emerald-50 border-4 border-emerald-200 p-6 rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <FileSpreadsheet size={100} />
                            </div>
                            <p className="text-emerald-900 font-black uppercase text-sm tracking-widest mb-2 italic">Petunjuk Export:</p>
                            <p className="text-emerald-700 font-bold relative z-10 leading-relaxed">
                                Unduh rekapitulasi data (Siswa, Guru, Keuangan) dalam format satu file Excel untuk kebutuhan pelaporan tingkat wilayah.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="input-label">Pilih Periode</label>
                                <input
                                    type="month"
                                    className="select-field border-2"
                                    value={bulan}
                                    onChange={(e) => setBulan(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="input-label">Filter Kecamatan</label>
                                <select className="select-field border-2">
                                    <option>Semua Kecamatan</option>
                                    <option>Tapung</option>
                                    <option>Bangkinang</option>
                                    <option>Kampar</option>
                                </select>
                            </div>
                        </div>
                        <Button
                            icon={<FileSpreadsheet size={28} />}
                            className="w-full justify-center bg-emerald-700 hover:bg-emerald-800 py-8 text-2xl font-black shadow-[0_15px_40px_rgba(5,150,105,0.3)] transition-all active:scale-95"
                        >
                            UNDUH DATA EXCEL
                        </Button>
                    </div>
                </Card>

                <Card title="STATISTIK TAHUNAN (PDF)">
                    <div className="space-y-10">
                        <div className="bg-blue-50 border-4 border-blue-200 p-6 rounded-3xl">
                            <p className="text-blue-900 font-black uppercase text-sm tracking-widest mb-2 italic">Laporan PDF:</p>
                            <p className="text-blue-700 font-bold leading-relaxed">
                                Cetak grafik kepatuhan dan ringkasan data personil per tahun ajaran dalam format dokumen PDF resmi.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="input-label">Tahun Pelajaran</label>
                                <select className="select-field border-2">
                                    <option>2025/2026</option>
                                    <option>2024/2025</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="input-label">Siklus Laporan</label>
                                <select className="select-field border-2">
                                    <option>Semester Ganjil</option>
                                    <option>Semester Genap</option>
                                </select>
                            </div>
                        </div>
                        <Button
                            icon={<Printer size={28} />}
                            className="w-full justify-center py-8 text-2xl font-black border-4 border-slate-900 text-slate-900 shadow-[0_10px_0_0_#0f172a] hover:bg-slate-50 active:translate-y-2 active:shadow-none transition-all"
                            variant="outline"
                        >
                            PREVIEW PDF
                        </Button>
                    </div>
                </Card>
            </div>

            <Card title="PREVIEW DATA REAL-TIME">
                <div className="overflow-x-auto border-4 border-slate-900 rounded-[2.5rem] relative min-h-[400px]">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                            <Loader2 className="animate-spin text-emerald-700" size={60} />
                        </div>
                    )}

                    <table className="w-full text-base text-left border-collapse">
                        <thead className="bg-slate-900 text-white uppercase font-black text-xs tracking-widest">
                            <tr>
                                <th className="px-8 py-8 border-b-2 border-white/10">Madrasah</th>
                                <th className="px-8 py-8 border-b-2 border-white/10 text-center">Bulan</th>
                                <th className="px-8 py-8 border-b-2 border-white/10 text-center">Status</th>
                                <th className="px-8 py-8 border-b-2 border-white/10 text-right">Waktu Kirim</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-4 divide-slate-100">
                            {recapData.length > 0 ? (
                                recapData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-black uppercase text-xs">
                                                    MI
                                                </div>
                                                <div className="font-black text-slate-900 text-xl uppercase tracking-tighter">
                                                    {item.madrasah?.nama_madrasah}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-center">
                                            <div className="inline-flex items-center gap-2 font-black text-slate-600 bg-slate-100 px-4 py-1 rounded-full text-xs uppercase">
                                                <Calendar size={14} />
                                                {item.bulan_tahun}
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-center">
                                            <span className={`px-4 py-2 rounded-lg font-black text-[10px] border-2 uppercase tracking-wide inline-block shadow-sm
                                                ${item.status_laporan === 'verified' ? 'bg-emerald-100 text-emerald-900 border-emerald-400' :
                                                    item.status_laporan === 'revisi' ? 'bg-rose-100 text-rose-900 border-rose-400' :
                                                        'bg-amber-100 text-amber-900 border-amber-400'}`}>
                                                {item.status_laporan === 'verified' ? 'DISETUJUI' :
                                                    item.status_laporan === 'revisi' ? 'REVISI' :
                                                        item.status_laporan === 'submitted' ? 'MENUNGGU' :
                                                            item.status_laporan}
                                            </span>
                                        </td>
                                        <td className="px-8 py-8 text-right font-black text-slate-400 text-sm">
                                            {item.submitted_at ? new Date(item.submitted_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : 'DRAF'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !isLoading && (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center font-black text-slate-300 uppercase italic opacity-50 text-2xl">
                                            Belum ada data rekapitulasi masuk.
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
