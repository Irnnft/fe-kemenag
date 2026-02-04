'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Printer, Info, Search, Loader2, FileText } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function LaporanListPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [isLoading, setIsLoading] = useState(true);
    const [reports, setReports] = useState<any[]>([]);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const response = await api.operator.getDashboard();
            const data = await response.json();
            if (response.ok) {
                setReports(data.data || data);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const date = report.bulan_tahun || '';
            const status = report.status_laporan || '';

            const matchesSearch = date.includes(searchQuery);
            const matchesStatus = statusFilter === 'Semua Status' || status.toLowerCase() === statusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter, reports]);

    const handleCreateLaporan = async () => {
        const bulan = prompt('Masukkan Bulan (Format: YYYY-MM-DD, cth: 2026-02-01)');
        if (!bulan) return;

        try {
            const response = await api.operator.createLaporan({
                bulan_tahun: bulan
            });
            if (response.ok) {
                alert('Laporan berhasil dibuat!');
                fetchReports();
            } else {
                const data = await response.json();
                alert(data.message || 'Gagal membuat laporan baru');
            }
        } catch (error) {
            alert('Kesalahan koneksi');
        }
    };

    const formatBulan = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Daftar Laporan</h1>
                    <p className="text-lg font-bold text-slate-500 italic">Kelola arsip pelaporan madrasah rutin anda secara digital.</p>
                </div>
                <Button
                    className="py-6 px-12 text-xl font-black bg-emerald-700 shadow-[0_10px_30px_rgba(5,150,105,0.3)] hover:scale-105 transition-transform"
                    icon={<Plus size={28} />}
                    onClick={handleCreateLaporan}
                >
                    BUAT LAPORAN BARU
                </Button>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row gap-6 mb-10">
                    <div className="flex-1 max-w-md">
                        <Input
                            label="Cari Periode"
                            placeholder="YYYY-MM..."
                            icon={<Search size={22} />}
                            className="mb-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <label className="input-label">Status Verifikasi</label>
                        <select className="select-field border-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="Semua Status">Semua Status</option>
                            <option value="draft">Draft (Draf)</option>
                            <option value="submitted">Submitted (Dikirim)</option>
                            <option value="verified">Verified (Disetujui)</option>
                            <option value="revisi">Revisi (Perlu Perbaikan)</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto relative min-h-[400px]">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                            <Loader2 className="animate-spin text-emerald-700" size={60} />
                        </div>
                    )}

                    <table className="w-full text-base text-left border-collapse border-2 border-slate-100 rounded-3xl overflow-hidden">
                        <thead className="bg-slate-900 text-white uppercase font-black text-xs tracking-widest">
                            <tr>
                                <th className="px-8 py-8 border-b-2 border-white/10">Bulan / Tahun</th>
                                <th className="px-8 py-8 border-b-2 border-white/10 text-center">Status Laporan</th>
                                <th className="px-8 py-8 border-b-2 border-white/10">Terakhir Update</th>
                                <th className="px-8 py-8 border-b-2 border-white/10 text-right">Navigasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-4 divide-slate-50">
                            {filteredReports.map((report) => (
                                <tr key={report.id_laporan} className="hover:bg-emerald-50/30 transition-colors group">
                                    <td className="px-8 py-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                                                <FileText size={28} />
                                            </div>
                                            <div className="font-black text-slate-900 text-2xl uppercase tracking-tighter">
                                                {formatBulan(report.bulan_tahun)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-10 text-center">
                                        <span className={`px-6 py-3 rounded-full text-xs font-black border-2 uppercase tracking-widest shadow-sm
                                          ${report.status_laporan === 'draft' ? 'bg-slate-100 text-slate-700 border-slate-400' :
                                                report.status_laporan === 'submitted' ? 'bg-blue-100 text-blue-800 border-blue-400' :
                                                    report.status_laporan === 'verified' ? 'bg-green-100 text-green-800 border-green-400' :
                                                        'bg-red-100 text-red-800 border-red-400'
                                            }`}
                                        >
                                            {report.status_laporan}
                                        </span>
                                    </td>
                                    <td className="px-8 py-10 text-slate-500 font-black text-lg uppercase">
                                        {report.updated_at ? new Date(report.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                    </td>
                                    <td className="px-8 py-10 text-right space-x-4">
                                        <Link href={`/operator/laporan/${report.id_laporan}`}>
                                            <Button variant="outline" className="h-16 px-10 border-4 border-emerald-700 text-emerald-800 font-black text-lg shadow-md hover:bg-emerald-50 uppercase tracking-tighter" icon={<Edit size={24} />}>
                                                Kelola Data
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!isLoading && filteredReports.length === 0 && (
                        <div className="py-32 text-center text-slate-400 font-black text-2xl uppercase italic opacity-50">
                            Belum ada laporan yang tersedia.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
