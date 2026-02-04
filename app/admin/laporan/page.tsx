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
                <div className="flex flex-col md:flex-row gap-6 mb-10">
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
                    <div className="w-full md:w-64">
                        <label className="input-label">Filter Status</label>
                        <select
                            className="select-field border-2"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="Semua Status">Semua Status</option>
                            <option value="submitted">MENUNGGU VALIDASI</option>
                            <option value="revisi">REVISI</option>
                            <option value="verified">DISUTUJUI</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto relative min-h-[400px]">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                            <Loader2 className="animate-spin text-emerald-700" size={64} />
                        </div>
                    )}

                    <table className="w-full text-base text-left border-collapse border-b-4 border-slate-100">
                        <thead className="bg-slate-900 text-white uppercase font-black text-xs tracking-widest">
                            <tr>
                                <th className="px-8 py-8">Madrasah</th>
                                <th className="px-8 py-8 text-center">Bulan Laporan</th>
                                <th className="px-8 py-8 text-center">Tgl Submit (submitted_at)</th>
                                <th className="px-8 py-8 text-center">Status</th>
                                <th className="px-8 py-8 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-4 divide-slate-50">
                            {filteredSubmissions.map((item) => (
                                <tr key={item.id_laporan} className="hover:bg-slate-50 transition-all group">
                                    <td className="px-8 py-10">
                                        <div className="font-black text-slate-900 text-2xl uppercase tracking-tighter group-hover:text-emerald-800 transition-colors">
                                            {item.madrasah?.nama_madrasah}
                                        </div>
                                        <div className="text-sm font-black text-emerald-800 bg-emerald-100 px-4 py-1 rounded-lg border-2 border-emerald-300 inline-block mt-3 shadow-sm italic lowercase">
                                            npsn: {item.madrasah?.npsn}
                                        </div>
                                    </td>
                                    <td className="px-8 py-10 text-center">
                                        <div className="flex items-center justify-center gap-2 font-black text-slate-800 text-lg uppercase bg-slate-100 py-2 rounded-2xl group-hover:bg-white transition-colors">
                                            <Calendar size={20} className="text-slate-400" />
                                            {formatBulan(item.bulan_tahun)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-10 text-slate-400 font-bold text-center text-sm">
                                        {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                    </td>
                                    <td className="px-8 py-10 text-center">
                                        <span className={`px-6 py-3 rounded-full text-xs font-black border-2 uppercase tracking-widest shadow-xl
                                            ${item.status_laporan === 'submitted' ? 'bg-amber-100 text-amber-800 border-amber-400 animate-pulse' :
                                                item.status_laporan === 'revisi' ? 'bg-red-100 text-red-800 border-red-400' :
                                                    'bg-green-100 text-green-800 border-green-400'
                                            }`}
                                        >
                                            {item.status_laporan === 'submitted' ? 'Menunggu' : item.status_laporan}
                                        </span>
                                    </td>
                                    <td className="px-8 py-10 text-right">
                                        <Link href={`/admin/laporan/${item.id_laporan}`}>
                                            <Button
                                                variant="outline"
                                                className="h-16 px-10 text-lg font-black bg-white border-4 border-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-[8px_8px_0_0_#1e293b] active:translate-y-1 active:shadow-none"
                                                icon={<Eye size={24} />}
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
