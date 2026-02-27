'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Trash2,
    RotateCcw,
    Loader2,
    MapPin,
    Search
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function StaffLaporanPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [showTrashed, setShowTrashed] = useState(false);

    const fetchSubmissions = async () => {
        setIsLoading(true);
        try {
            const response = await api.admin.getLaporan({ trashed: showTrashed ? 1 : 0 });
            const data = await response.json();
            if (response.ok) {
                setSubmissions(data.data || data);
            }
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [showTrashed]);

    const formatBulan = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
    };



    return (
        <div className="space-y-6 animate-fade-in -mt-6">
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
                    <div className="md:col-span-8 relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors z-10">
                            <Search size={22} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari Madrasah atau Periode..."
                            className="w-full h-16 pl-16 pr-6 bg-white border-[3px] border-slate-900 rounded-[1.5rem] font-bold text-slate-900 placeholder:text-slate-300 outline-none shadow-[6px_6px_0_0_#f1f5f9] focus:shadow-[6px_6px_0_0_#10b98120] focus:border-emerald-600 transition-all"
                        />
                    </div>
                    <div className="md:col-span-4 flex items-center">
                        <Button
                            variant={showTrashed ? 'primary' : 'outline'}
                            icon={<Trash2 size={20} />}
                            onClick={() => setShowTrashed(!showTrashed)}
                            className={`w-full h-16 !text-xs !font-black border-[3px] shadow-[6px_6px_0_0_#f1f5f9] tracking-widest ${showTrashed ? 'bg-rose-600 border-rose-900 text-white shadow-rose-100' : 'border-slate-900 text-slate-900 hover:bg-slate-50'}`}
                        >
                            {showTrashed ? 'EXIT RECOVERY' : 'TEMPAT SAMPAH'}
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto -mx-10 px-10">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-6 py-6 border-b-2 border-slate-300 text-left">Madrasah & Lokasi</th>
                                <th className="px-6 py-6 border-b-2 border-slate-300 text-center">Periode Laporan</th>
                                <th className="px-6 py-6 border-b-2 border-slate-300 text-center">Status</th>
                                <th className="px-6 py-6 border-b-2 border-slate-300 text-center">Kontrol Validasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-amber-600 mb-4" size={48} />
                                        <p className="font-black text-slate-300 uppercase tracking-widest italic">Memuat Laporan...</p>
                                    </td>
                                </tr>
                            ) : submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <p className="font-black text-slate-300 uppercase tracking-widest italic opacity-40 text-xl text-center">Tidak ada laporan ditemukan</p>
                                    </td>
                                </tr>
                            ) : (
                                submissions.map((item) => (
                                    <tr key={item.id_laporan} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-8 text-left border-b align-middle">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-14 h-14 rounded-2xl bg-white border-[3px] border-slate-900 flex items-center justify-center font-black text-lg shadow-[4px_4px_0_0_#0f172a] shrink-0">
                                                    {item.madrasah?.nama_madrasah?.substring(0, 2) || 'MI'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 text-base uppercase leading-tight mb-1 tracking-tighter">
                                                        {item.madrasah?.nama_madrasah}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 leading-none">
                                                        <MapPin size={12} className="text-emerald-600" />
                                                        {item.madrasah?.kecamatan || 'Kecamatan -'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8 text-center border-b align-middle">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="font-black text-slate-900 text-sm italic mb-1 uppercase tracking-tight">{formatBulan(item.bulan_tahun)}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 leading-none">
                                                    <Clock size={12} className="text-emerald-600" />
                                                    {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Belum Submit'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-10 border-b align-middle text-center">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black border-2 uppercase tracking-widest
                                                ${item.status_laporan === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    item.status_laporan === 'revisi' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                        'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                {item.status_laporan === 'verified' ? <CheckCircle size={14} /> :
                                                    item.status_laporan === 'revisi' ? <XCircle size={14} /> :
                                                        <Clock size={14} />}
                                                {item.status_laporan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-10 border-b align-middle">
                                            <div className="flex items-center justify-center gap-3">
                                                {!showTrashed ? (
                                                    <div className="flex flex-col gap-1.5 w-full max-w-[140px]">
                                                        <Link href={`/staff/laporan/${item.id_laporan}`} className="w-full">
                                                            <Button
                                                                variant="outline"
                                                                className="w-full h-11 !text-[10px] !font-black !text-slate-900 !bg-white border-[3px] border-slate-900 shadow-[4px_4px_0_0_#0f172a10] hover:bg-slate-50"
                                                            >
                                                                PERIKSA DATA
                                                            </Button>
                                                        </Link>

                                                        <Button
                                                            variant="outline"
                                                            className="w-full h-11 !text-rose-500 !border-rose-200 hover:!bg-rose-50 !text-[10px] !font-black border-2"
                                                            icon={<Trash2 size={14} />}
                                                            onClick={async () => {
                                                                if (item.status_laporan !== 'verified') {
                                                                    alert('Laporan harus diverifikasi (Setuju/Revisi) sebelum bisa dihapus.');
                                                                    return;
                                                                }
                                                                if (confirm('Pindahkan ke tempat sampah?')) {
                                                                    try {
                                                                        const res = await api.admin.deleteLaporan(item.id_laporan);
                                                                        if (res.ok) fetchSubmissions();
                                                                    } catch (e) { alert('Kesalahan koneksi'); }
                                                                }
                                                            }}
                                                            disabled={item.status_laporan !== 'verified'}
                                                        >
                                                            HAPUS
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-1.5 w-full max-w-[140px]">
                                                        <Button
                                                            variant="outline"
                                                            className="w-full h-11 !bg-emerald-50 !text-emerald-700 !border-emerald-200 !text-[10px] !font-black border-2"
                                                            icon={<RotateCcw size={14} />}
                                                            onClick={async () => {
                                                                if (confirm('Restore laporan ini?')) {
                                                                    try {
                                                                        const res = await api.admin.restoreLaporan(item.id_laporan);
                                                                        if (res.ok) fetchSubmissions();
                                                                    } catch (e) { alert('Kesalahan koneksi'); }
                                                                }
                                                            }}
                                                        >
                                                            RESTORE
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            className="w-full h-11 !text-[10px] !font-black border-[3px] border-rose-900 shadow-[4px_4px_0_0_#be123c20]"
                                                            icon={<Trash2 size={14} />}
                                                            onClick={async () => {
                                                                if (confirm('Hapus permanen data ini?')) {
                                                                    try {
                                                                        const res = await api.admin.permanentDeleteLaporan(item.id_laporan);
                                                                        if (res.ok) fetchSubmissions();
                                                                    } catch (e) { alert('Kesalahan koneksi'); }
                                                                }
                                                            }}
                                                        >
                                                            HAPUS
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
