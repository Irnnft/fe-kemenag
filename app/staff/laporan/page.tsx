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
    Search,
    Calendar,
    ChevronDown,
    Square,
    CheckSquare
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { KECAMATAN_KAMPAR } from '@/lib/constants';

export default function StaffLaporanPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [showTrashed, setShowTrashed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [kecamatanFilter, setKecamatanFilter] = useState('Semua Kec.');
    const [periodeFilter, setPeriodeFilter] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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
        setSelectedIds(new Set());
    }, [showTrashed]);

    const formatBulan = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
    };

    const filteredSubmissions = React.useMemo(() => {
        return submissions.filter(item => {
            const query = searchQuery.toLowerCase();
            const namaMadrasah = item.madrasah?.nama_madrasah?.toLowerCase() || '';
            const periodeStr = formatBulan(item.bulan_tahun).toLowerCase();
            const kecamatan = item.madrasah?.kecamatan?.toLowerCase() || '';

            const matchesSearch = namaMadrasah.includes(query) || 
                                 periodeStr.includes(query) || 
                                 kecamatan.includes(query);
            
            const matchesStatus = statusFilter === 'Semua Status' || item.status_laporan?.toLowerCase() === statusFilter.toLowerCase();
            const matchesKecamatan = kecamatanFilter === 'Semua Kec.' || item.madrasah?.kecamatan === kecamatanFilter;
            const matchesPeriode = !periodeFilter || (item.bulan_tahun && item.bulan_tahun.startsWith(periodeFilter));

            return matchesSearch && matchesStatus && matchesKecamatan && matchesPeriode;
        });
    }, [submissions, searchQuery, statusFilter, kecamatanFilter, periodeFilter]);

    const toggleSelect = (id: number) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredSubmissions.length && filteredSubmissions.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredSubmissions.map(s => s.id_laporan)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        
        if (!showTrashed) {
            const toDelete = submissions.filter(s => selectedIds.has(s.id_laporan));
            const unverified = toDelete.filter(s => s.status_laporan !== 'verified');
            if (unverified.length > 0) {
                alert('Beberapa laporan belum diverifikasi. Laporan harus diverifikasi (Setuju/Revisi) sebelum bisa dihapus.');
                return;
            }
        }

        const confirmMsg = showTrashed ? `Hapus permanen ${selectedIds.size} data?` : `Pindahkan ${selectedIds.size} data ke tempat sampah?`;
        
        if (confirm(confirmMsg)) {
            setIsBulkDeleting(true);
            try {
                for (const id of Array.from(selectedIds)) {
                    if (showTrashed) {
                        await api.admin.permanentDeleteLaporan(id);
                    } else {
                        await api.admin.deleteLaporan(id);
                    }
                }
                fetchSubmissions();
                setSelectedIds(new Set());
            } catch (error) {
                alert('Terjadi kesalahan saat menghapus data');
            } finally {
                setIsBulkDeleting(false);
            }
        }
    };



    return (
        <div className="space-y-6 animate-fade-in -mt-6">
            <Card className="!p-0 overflow-hidden border-[3px] border-slate-900 shadow-[10px_10px_0_0_#f1f5f9]">
                <div className="p-8 border-b-[3px] border-slate-900 bg-slate-50/50">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                {selectedIds.size > 0 && (
                                    <Button
                                        variant="danger"
                                        className="!h-12 !px-6 !rounded-xl !text-[11px] !font-black tracking-[0.2em] shadow-[4px_4px_0_0_#be123c20] hover:translate-y-[-2px] transition-all border-2 border-rose-900"
                                        icon={<Trash2 size={16} />}
                                        onClick={handleBulkDelete}
                                        isLoading={isBulkDeleting}
                                    >
                                        HAPUS TERPILIH ({selectedIds.size})
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    className="!h-12 !w-12 !p-0 !rounded-xl !border-2 border-slate-200 hover:border-rose-500 hover:text-rose-500 transition-all"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('Semua Status');
                                        setKecamatanFilter('Semua Kec.');
                                        setPeriodeFilter('');
                                        setSelectedIds(new Set());
                                    }}
                                    title="Reset Filter"
                                >
                                    <RotateCcw size={18} />
                                </Button>
                                <Button
                                    variant={showTrashed ? 'primary' : 'outline'}
                                    icon={<Trash2 size={16} />}
                                    onClick={() => setShowTrashed(!showTrashed)}
                                    className={`!h-12 !px-6 !rounded-xl !text-[10px] !font-black border-2 tracking-widest ${showTrashed ? 'bg-rose-600 border-rose-900 text-white' : 'border-slate-900 text-slate-900 hover:bg-slate-50'}`}
                                >
                                    {showTrashed ? 'EXIT RECOVERY' : 'TEMPAT SAMPAH'}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="relative group">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Cari Madrasah..."
                                    className="w-full h-12 pl-12 pr-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all text-xs shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="month"
                                    className="w-full h-12 pl-12 pr-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all text-xs shadow-sm cursor-pointer"
                                    value={periodeFilter}
                                    onChange={(e) => setPeriodeFilter(e.target.value)}
                                />
                            </div>

                            <div className="relative group">
                                <select
                                    className="w-full h-12 pl-4 pr-10 appearance-none bg-white border-2 border-slate-200 rounded-xl font-black text-slate-900 uppercase tracking-widest text-[10px] outline-none focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                                    value={kecamatanFilter}
                                    onChange={(e) => setKecamatanFilter(e.target.value)}
                                >
                                    <option value="Semua Kec.">Semua Kecamatan</option>
                                    {KECAMATAN_KAMPAR.map(k => <option key={k} value={k}>{k.toUpperCase()}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="relative group">
                                <select
                                    className="w-full h-12 pl-4 pr-10 appearance-none bg-white border-2 border-slate-200 rounded-xl font-black text-slate-900 uppercase tracking-widest text-[10px] outline-none focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="Semua Status">Semua Status</option>
                                    <option value="SUBMITTED">SUBMITTED</option>
                                    <option value="VERIFIED">VERIFIED</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 border-b-2 border-slate-100 text-left w-16">
                                    <button
                                        onClick={toggleSelectAll}
                                        className={`w-6 h-6 flex items-center justify-center rounded-lg border-2 transition-all ${selectedIds.size > 0 ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-200' : 'bg-white border-slate-300'}`}
                                    >
                                        {selectedIds.size === filteredSubmissions.length && filteredSubmissions.length > 0 ? (
                                            <CheckSquare size={14} />
                                        ) : selectedIds.size > 0 ? (
                                            <div className="w-2 h-0.5 bg-white" />
                                        ) : (
                                            <Square size={14} className="text-slate-300" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-5 border-b-2 border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Madrasah & Lokasi</th>
                                <th className="px-6 py-5 border-b-2 border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Periode Laporan</th>
                                <th className="px-6 py-5 border-b-2 border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                                <th className="px-6 py-5 border-b-2 border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Kontrol Validasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-amber-600 mb-4" size={48} />
                                        <p className="font-black text-slate-300 uppercase tracking-widest italic">Memuat Laporan...</p>
                                    </td>
                                </tr>
                            ) : submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <p className="font-black text-slate-300 uppercase tracking-widest italic opacity-40 text-xl text-center">Tidak ada laporan ditemukan</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSubmissions.map((item) => (
                                    <tr key={item.id_laporan} className={`group hover:bg-slate-50 transition-colors ${selectedIds.has(item.id_laporan) ? 'bg-rose-50/50' : ''}`}>
                                        <td className="px-8 py-5 text-left align-middle">
                                            <button
                                                onClick={() => toggleSelect(item.id_laporan)}
                                                className={`w-6 h-6 flex items-center justify-center rounded-lg border-2 transition-all ${selectedIds.has(item.id_laporan) ? 'bg-rose-600 border-rose-600 text-white shadow-md' : 'bg-white border-slate-200'}`}
                                            >
                                                {selectedIds.has(item.id_laporan) ? (
                                                    <CheckSquare size={14} />
                                                ) : (
                                                    <Square size={14} className="text-slate-200" />
                                                )}
                                            </button>
                                        </td>
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
