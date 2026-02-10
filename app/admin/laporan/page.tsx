'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Eye, Search, Filter, Loader2, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminLaporanPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [isLoading, setIsLoading] = useState(true);
    const [submissions, setSubmissions] = useState<any[]>([]);

    const fetchSubmissions = async () => {
        setIsLoading(true);
        try {
            const response = await api.admin.getLaporan();
            const data = await response.json();
            if (response.ok) {
                setSubmissions(data.data || data);
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const filteredSubmissions = useMemo(() => {
        return submissions.filter(sub => {
            const schoolName = sub.madrasah?.nama_madrasah || '';
            const nsm = sub.madrasah?.npsn || '';
            const status = sub.status_laporan || '';

            const matchesSearch = schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                nsm.includes(searchQuery);

            const matchesStatus = statusFilter === 'Semua Status' ||
                status.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter, submissions]);

    const formatBulan = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Validasi Laporan Bulanan</h1>
                    <p className="text-slate-500 font-bold italic uppercase text-xs tracking-widest mt-1">Daftar masuk laporan madrasah se-kabupaten</p>
                </div>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row gap-6 mb-10 items-start">
                    <div className="flex-1 max-w-md">
                        <Input
                            label="Cari Madrasah"
                            placeholder="Nama sekolah atau NPSN..."
                            icon={<Search size={22} />}
                            className="mb-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-64 input-group mb-0">
                        <label className="input-label">Filter Status</label>
                        <div className="relative">
                            <select
                                className="select-field"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="Semua Status">Semua Status</option>
                                <option value="submitted">MENUNGGU VALIDASI</option>
                                <option value="revisi">REVISI</option>
                                <option value="verified">DISETUJUI</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto relative min-h-[400px]">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                            <Loader2 className="animate-spin text-emerald-700" size={64} />
                        </div>
                    )}

                    <table className="w-full text-base text-left border-collapse">
                        <thead className="bg-slate-900 text-white uppercase font-black text-xs tracking-widest">
                            <tr>
                                <th className="px-8 py-6 border-none">Madrasah</th>
                                <th className="px-8 py-6 text-center border-none">Bulan Laporan</th>
                                <th className="px-8 py-6 text-center border-none">Tanggal Kirim</th>
                                <th className="px-8 py-6 text-center border-none">Status</th>
                                <th className="px-8 py-6 text-right border-none">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100">
                            {filteredSubmissions.map((item) => (
                                <tr key={item.id_laporan} className="hover:bg-slate-50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="font-black text-slate-900 text-xl uppercase tracking-tight group-hover:text-emerald-800 transition-colors">
                                            {item.madrasah?.nama_madrasah}
                                        </div>
                                        <div className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1 shadow-sm uppercase tracking-wider">
                                            npsn: {item.madrasah?.npsn}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex items-center justify-center gap-2 font-black text-slate-700 text-sm uppercase bg-slate-100/50 py-1.5 px-4 rounded-xl group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-200">
                                            <Calendar size={16} className="text-slate-400" />
                                            {formatBulan(item.bulan_tahun)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-slate-400 font-bold text-center text-xs">
                                        {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black border-2 uppercase tracking-widest shadow-sm inline-block
                                            ${item.status_laporan === 'submitted' ? 'bg-amber-100 text-amber-900 border-amber-400' :
                                                item.status_laporan === 'revisi' ? 'bg-rose-100 text-rose-900 border-rose-400' :
                                                    item.status_laporan === 'verified' ? 'bg-emerald-100 text-emerald-900 border-emerald-400' :
                                                        'bg-slate-100 text-slate-900 border-slate-400'
                                            }`}
                                        >
                                            {item.status_laporan === 'submitted' ? 'Menunggu' :
                                                item.status_laporan === 'revisi' ? 'Revisi' :
                                                    item.status_laporan === 'verified' ? 'Disetujui' :
                                                        item.status_laporan}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Link href={`/admin/laporan/${item.id_laporan}`}>
                                            <Button
                                                variant="outline"
                                                className="h-12 px-6 text-sm font-black bg-white border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-[4px_4px_0_0_#1e293b] active:translate-y-1 active:shadow-none"
                                                icon={<Eye size={18} />}
                                            >
                                                VALIDASI
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!isLoading && filteredSubmissions.length === 0 && (
                        <div className="py-40 text-center text-slate-300 font-black text-3xl uppercase italic opacity-50">
                            Tidak ada laporan yang menunggu validasi.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
