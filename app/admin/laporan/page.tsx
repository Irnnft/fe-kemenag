'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Eye,
    Loader2,
    MapPin,
    Download,
    Filter,
    CheckSquare,
    Square,
    ChevronDown,
    Calendar,
    Search,
    RotateCcw,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { api } from '@/lib/api';
import { KECAMATAN_KAMPAR } from '@/lib/constants';

export default function KasiLaporanPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [exportingId, setExportingId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isBulkExporting, setIsBulkExporting] = useState(false);

    // Filters
    const [jenjangFilter, setJenjangFilter] = useState('Semua Jenjang');
    const [kecamatanFilter, setKecamatanFilter] = useState('Semua Kec.');
    const [periodeFilter, setPeriodeFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchSubmissions = async () => {
        setIsLoading(true);
        try {
            const response = await api.admin.getLaporan({ trashed: 0 });
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
    }, []);

    const filteredSubmissions = submissions.filter(item => {
        const name = (item.madrasah?.nama_madrasah || '').toUpperCase();

        // Robust Jenjang Check
        const matchesJenjang = jenjangFilter === 'Semua Jenjang' ||
            (jenjangFilter === 'MI' && (name.includes('MI ') || name.includes('MIS '))) ||
            (jenjangFilter === 'MTS' && (name.includes('MTS') || name.includes('MTSS'))) ||
            (jenjangFilter === 'MA' && (name.includes('MA ') || name.includes('MAS ')));

        const matchesKecamatan = kecamatanFilter === 'Semua Kec.' || item.madrasah?.kecamatan === kecamatanFilter;
        const matchesPeriode = !periodeFilter || (item.bulan_tahun && item.bulan_tahun.startsWith(periodeFilter));
        const matchesSearch = name.includes(searchQuery.toUpperCase()) ||
            (item.madrasah?.npsn && item.madrasah.npsn.includes(searchQuery));

        return matchesJenjang && matchesKecamatan && matchesPeriode && matchesSearch;
    });

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

    const formatBulan = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
    };

    const handleBulkExport = async () => {
        if (selectedIds.size === 0) return;
        setIsBulkExporting(true);
        try {
            const workbook = XLSX.utils.book_new();

            // We need to fetch details for each selected report
            const selectedReports = submissions.filter(s => selectedIds.has(s.id_laporan));

            // Group data by type for combined sheets
            const allSiswa: any[] = [];
            const allPersonal: any[] = [];
            const allGuru: any[] = [];
            const allSarpras: any[] = [];
            const allMobiler: any[] = [];
            const allKeuangan: any[] = [];

            for (const report of selectedReports) {
                const response = await api.operator.getLaporanDetail(report.id_laporan);
                const data = await response.json();
                const detail = data.data || data;

                const mName = report.madrasah?.nama_madrasah || 'Unknown';
                const periode = formatBulan(report.bulan_tahun);

                (detail.siswa || []).forEach((s: any) => allSiswa.push({
                    'Madrasah': mName, 'Periode': periode,
                    'Kelas': s.kelas, 'Rombel': s.jumlah_rombel,
                    'L': s.jumlah_lk, 'P': s.jumlah_pr,
                    'Masuk': s.mutasi_masuk, 'Keluar': s.mutasi_keluar,
                    'Keterangan': s.keterangan || '-'
                }));

                (detail.rekap_personal || []).forEach((r: any) => allPersonal.push({
                    'Madrasah': mName, 'Periode': periode,
                    'Kategori': r.keadaan, 'L': r.jumlah_lk, 'P': r.jumlah_pr,
                    'Mutasi Masuk': r.mutasi_masuk, 'Mutasi Keluar': r.mutasi_keluar,
                    'Keterangan': r.keterangan || '-'
                }));

                (detail.guru || []).forEach((g: any) => allGuru.push({
                    'Madrasah': mName, 'Periode': periode,
                    'Nama': g.nama_guru, 'NIP/NIK': g.nip_nik, 'L/P': g.lp,
                    'Tempat Lahir': g.tempat_lahir, 'Tanggal Lahir': g.tanggal_lahir,
                    'Status': g.status_pegawai, 'Pendidikan': g.pendidikan_terakhir,
                    'Jurusan': g.jurusan, 'Gol': g.golongan,
                    'TMT Guru': g.tmt_mengajar, 'TMT Madrasah': g.tmt_di_madrasah,
                    'Mapel': g.mata_pelajaran, 'Satminkal': g.satminkal,
                    'Jam': g.jumlah_jam, 'Jabatan': g.jabatan,
                    'Ibu Kandung': g.nama_ibu_kandung, 'Sertifikasi': g.sertifikasi ? 'YA' : 'TIDAK',
                    'Mutasi': g.mutasi_status
                }));

                (detail.sarpras || []).forEach((s: any) => allSarpras.push({
                    'Madrasah': mName, 'Periode': periode,
                    'Jenis Aset': s.jenis_aset, 'Luas': s.luas,
                    'Kondisi Baik': s.kondisi_baik, 'Rusak Ringan': s.kondisi_rusak_ringan,
                    'Rusak Berat': s.kondisi_rusak_berat, 'Kekurangan': s.kekurangan,
                    'Perlu Rehab': s.perlu_rehab, 'Keterangan': s.keterangan || '-'
                }));

                (detail.mobiler || []).forEach((m: any) => allMobiler.push({
                    'Madrasah': mName, 'Periode': periode,
                    'Nama Barang': m.nama_barang, 'Total': m.jumlah_total,
                    'Kondisi Baik': m.kondisi_baik, 'Rusak Ringan': m.kondisi_rusak_ringan,
                    'Rusak Berat': m.kondisi_rusak_berat, 'Kekurangan': m.kekurangan,
                    'Keterangan': m.keterangan || '-'
                }));

                (detail.keuangan || []).forEach((k: any) => allKeuangan.push({
                    'Madrasah': mName, 'Periode': periode,
                    'Uraian': k.uraian_kegiatan, 'Satuan': k.satuan,
                    'Volume': k.volume, 'Harga Satuan': k.harga_satuan,
                    'Total': Number(k.volume || 0) * Number(k.harga_satuan || 0)
                }));
            }

            if (allSiswa.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allSiswa), 'REKAP SISWA');
            if (allPersonal.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allPersonal), 'REKAP PERSONAL');
            if (allGuru.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allGuru), 'REKAP GURU');
            if (allSarpras.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allSarpras), 'REKAP SARPRAS');
            if (allMobiler.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allMobiler), 'REKAP MOBILER');
            if (allKeuangan.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allKeuangan), 'REKAP KEUANGAN');

            XLSX.writeFile(workbook, `REKAP_MASAL_${new Date().getTime()}.xlsx`);
        } catch (error) {
            console.error(error);
            alert('Gagal mengekspor data massal');
        } finally {
            setIsBulkExporting(false);
        }
    };

    const handleExportIndividualExcel = async (report: any) => {
        setExportingId(report.id_laporan);
        try {
            const response = await api.operator.getLaporanDetail(report.id_laporan);
            const data = await response.json();
            const reportData = data.data || data;

            if (!response.ok) {
                alert('Gagal mengambil detail laporan');
                return;
            }

            const workbook = XLSX.utils.book_new();

            // Create a single sheet for all data (Stacked vertically)
            const ws = XLSX.utils.aoa_to_sheet([
                ["LAPORAN DIGITAL BULANAN - SIPELMAD"],
                ["Madrasah", report.madrasah?.nama_madrasah || "-"],
                ["Kecamatan", report.madrasah?.kecamatan || "-"],
                ["Periode", formatBulan(report.bulan_tahun)],
                ["Status", report.status_laporan?.toUpperCase() || "-"],
                ["Tanggal Ekspor", new Date().toLocaleString('id-ID')],
                [""], // Spacer
            ]);

            let currentRow = 8;

            const addSection = (title: string, data: any[], mapper: (item: any) => any) => {
                XLSX.utils.sheet_add_aoa(ws, [[title.toUpperCase()]], { origin: `A${currentRow}` });
                currentRow++;
                if (data && data.length > 0) {
                    const mappedData = data.map(mapper);
                    XLSX.utils.sheet_add_json(ws, mappedData, { origin: `A${currentRow}`, skipHeader: false });
                    currentRow += mappedData.length + 3;
                } else {
                    XLSX.utils.sheet_add_aoa(ws, [["(Tidak ada data)"]], { origin: `A${currentRow}` });
                    currentRow += 3;
                }
            };

            addSection("I. DATA SISWA", reportData.siswa, (s) => ({
                'Kelas': s.kelas, 'Rombel': s.jumlah_rombel, 'L': s.jumlah_lk, 'P': s.jumlah_pr,
                'Masuk': s.mutasi_masuk, 'Keluar': s.mutasi_keluar, 'Keterangan': s.keterangan || '-'
            }));

            addSection("II. REKAP DATA PERSONAL", reportData.rekap_personal, (r) => ({
                'Kategori': r.keadaan, 'L': r.jumlah_lk, 'P': r.jumlah_pr,
                'Mutasi Masuk': r.mutasi_masuk, 'Mutasi Keluar': r.mutasi_keluar, 'Keterangan': r.keterangan || '-'
            }));

            addSection("III. DATA GURU & PEGAWAI", reportData.guru, (g) => ({
                'Nama': g.nama_guru, 'NIP/NIK': g.nip_nik, 'L/P': g.lp,
                'Tempat Lahir': g.tempat_lahir, 'Tanggal Lahir': g.tanggal_lahir,
                'Status': g.status_pegawai, 'Pendidikan': g.pendidikan_terakhir, 'Jurusan': g.jurusan,
                'Gol': g.golongan, 'TMT Guru': g.tmt_mengajar, 'TMT Madrasah': g.tmt_di_madrasah,
                'Mapel': g.mata_pelajaran, 'Satminkal': g.satminkal, 'Jam': g.jumlah_jam,
                'Jabatan': g.jabatan, 'Ibu Kandung': g.nama_ibu_kandung, 'Sertifikasi': g.sertifikasi ? 'YA' : 'TIDAK', 'Mutasi': g.mutasi_status
            }));

            addSection("IV. DATA SARPRAS", reportData.sarpras, (s) => ({
                'Jenis Aset': s.jenis_aset, 'Luas': s.luas, 'Baik': s.kondisi_baik, 'RR': s.kondisi_rusak_ringan, 'RB': s.kondisi_rusak_berat, 'Kurang': s.kekurangan, 'Rehab': s.perlu_rehab, 'Ket': s.keterangan || '-'
            }));

            addSection("V. DATA MOBILER", reportData.mobiler, (m) => ({
                'Nama Barang': m.nama_barang, 'Total': m.jumlah_total, 'Baik': m.kondisi_baik, 'RR': m.kondisi_rusak_ringan, 'RB': m.kondisi_rusak_berat, 'Kurang': m.kekurangan, 'Ket': m.keterangan || '-'
            }));

            addSection("VI. DATA KEUANGAN (BOS/NON-BOS)", reportData.keuangan, (k) => ({
                'Uraian': k.uraian_kegiatan, 'Satuan': k.satuan, 'Volume': k.volume, 'Harga Satuan': k.harga_satuan, 'Total': Number(k.volume || 0) * Number(k.harga_satuan || 0)
            }));

            XLSX.utils.book_append_sheet(workbook, ws, 'LAPORAN LENGKAP');

            // Tambahkan tab terpisah
            const addTab = (label: string, data: any[], mapper: (item: any) => any) => {
                if (data && data.length > 0) {
                    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.map(mapper)), label);
                }
            };

            addTab('Data Siswa', reportData.siswa, (s) => ({
                'Kelas': s.kelas, 'Rombel': s.jumlah_rombel, 'L': s.jumlah_lk, 'P': s.jumlah_pr, 'Masuk': s.mutasi_masuk, 'Keluar': s.mutasi_keluar, 'Keterangan': s.keterangan || '-'
            }));

            addTab('Rekap Personal', reportData.rekap_personal, (r) => ({
                'Kategori': r.keadaan, 'L': r.jumlah_lk, 'P': r.jumlah_pr, 'Mutasi Masuk': r.mutasi_masuk, 'Mutasi Keluar': r.mutasi_keluar, 'Keterangan': r.keterangan || '-'
            }));

            addTab('Data Guru', reportData.guru, (g) => ({
                'Nama': g.nama_guru, 'NIP/NIK': g.nip_nik, 'L/P': g.lp,
                'Tempat Lahir': g.tempat_lahir, 'Tanggal Lahir': g.tanggal_lahir,
                'Status': g.status_pegawai, 'Pendidikan': g.pendidikan_terakhir, 'Jurusan': g.jurusan,
                'Gol': g.golongan, 'TMT Guru': g.tmt_mengajar, 'TMT Madrasah': g.tmt_di_madrasah,
                'Mapel': g.mata_pelajaran, 'Satminkal': g.satminkal, 'Jam': g.jumlah_jam,
                'Jabatan': g.jabatan, 'Ibu Kandung': g.nama_ibu_kandung, 'Sertifikasi': g.sertifikasi ? 'YA' : 'TIDAK', 'Mutasi': g.mutasi_status
            }));

            addTab('Sarpras', reportData.sarpras, (s) => ({
                'Jenis Aset': s.jenis_aset, 'Luas': s.luas, 'Baik': s.kondisi_baik, 'RR': s.kondisi_rusak_ringan, 'RB': s.kondisi_rusak_berat, 'Kurang': s.kekurangan, 'Rehab': s.perlu_rehab, 'Ket': s.keterangan || '-'
            }));

            addTab('Mobiler', reportData.mobiler, (m) => ({
                'Nama Barang': m.nama_barang, 'Total': m.jumlah_total, 'Baik': m.kondisi_baik, 'RR': m.kondisi_rusak_ringan, 'RB': m.kondisi_rusak_berat, 'Kurang': m.kekurangan, 'Ket': m.keterangan || '-'
            }));

            addTab('Keuangan', reportData.keuangan, (k) => ({
                'Uraian': k.uraian_kegiatan, 'Satuan': k.satuan, 'Volume': k.volume, 'Harga': k.harga_satuan, 'Total': Number(k.volume || 0) * Number(k.harga_satuan || 0)
            }));

            const fileName = `Laporan_${report.madrasah?.nama_madrasah}_${formatBulan(report.bulan_tahun)}.xlsx`.replace(/\s+/g, '_');
            XLSX.writeFile(workbook, fileName);
        } catch (error) {
            console.error(error);
            alert('Kesalahan saat ekspor data');
        } finally {
            setExportingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in -mt-6 relative">

            <Card className="!p-0 overflow-hidden border-[3px] border-slate-900 shadow-[10px_10px_0_0_#f1f5f9]">
                {/* Header & Filter Area */}
                <div className="p-8 border-b-[3px] border-slate-900 bg-slate-50/50">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h2 className="font-black text-2xl text-slate-900 tracking-tight uppercase">Radar Pengawasan</h2>
                                <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Otoritas Kasi Penmad (Oversight)</p>
                            </div>

                            <div className="flex items-center gap-3">
                                {selectedIds.size > 0 && (
                                    <Button
                                        variant="primary"
                                        className="!h-12 !px-8 !rounded-xl !text-[11px] !font-black tracking-[0.2em] shadow-[4px_4px_0_0_#064e3b] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#064e3b] transition-all"
                                        icon={<Download size={16} />}
                                        onClick={handleBulkExport}
                                        isLoading={isBulkExporting}
                                    >
                                        REKAP TERPILIH ({selectedIds.size})
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    className="!h-12 !w-12 !p-0 !rounded-xl !border-2 border-slate-200 hover:border-rose-500 hover:text-rose-500 transition-all"
                                    onClick={() => {
                                        setJenjangFilter('Semua Jenjang');
                                        setKecamatanFilter('Semua Kec.');
                                        setPeriodeFilter('');
                                        setSearchQuery('');
                                        setSelectedIds(new Set());
                                    }}
                                    title="Reset Filter"
                                >
                                    <RotateCcw size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* Control Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                    value={jenjangFilter}
                                    onChange={(e) => setJenjangFilter(e.target.value)}
                                >
                                    <option value="Semua Jenjang">Semua Jenjang</option>
                                    <option value="MI">MI (IBTIDAIYAH)</option>
                                    <option value="MTS">MTS (TSANAWIYAH)</option>
                                    <option value="MA">MA (ALIYAH)</option>
                                    <option value="SD">RA (RAUDATUL ATHFAL)</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 border-b-2 border-slate-100 text-left w-16">
                                    <button
                                        onClick={toggleSelectAll}
                                        className={`w-6 h-6 flex items-center justify-center rounded-lg border-2 transition-all ${selectedIds.size > 0 ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-white border-slate-300'}`}
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
                                <th className="px-6 py-5 border-b-2 border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Periode</th>
                                <th className="px-6 py-5 border-b-2 border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 border-b-2 border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <Loader2 className="animate-spin mx-auto text-emerald-600 mb-4" size={48} />
                                        <p className="font-black text-slate-300 uppercase tracking-widest italic text-[10px]">Sinkronisasi Radar...</p>
                                    </td>
                                </tr>
                            ) : filteredSubmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="opacity-20 flex flex-col items-center">
                                            <Search size={64} className="mb-4 text-slate-400" />
                                            <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-sm italic">Data Tidak Ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSubmissions.map((item) => (
                                <tr key={item.id_laporan} className={`group border-l-4 transition-all ${selectedIds.has(item.id_laporan) ? 'bg-emerald-50/50 border-emerald-500' : 'hover:bg-slate-50/80 border-transparent'}`}>
                                    <td className="px-8 py-5 text-left align-middle">
                                        <button
                                            onClick={() => toggleSelect(item.id_laporan)}
                                            className={`w-6 h-6 flex items-center justify-center rounded-lg border-2 transition-all ${selectedIds.has(item.id_laporan) ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-200'}`}
                                        >
                                            {selectedIds.has(item.id_laporan) ? (
                                                <CheckSquare size={14} />
                                            ) : (
                                                <Square size={14} className="text-slate-200" />
                                            )}
                                        </button>
                                    </td>
                                    {/* Kolom 1: Madrasah & Lokasi */}
                                    <td className="px-6 py-5 text-left align-middle min-w-[320px]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white border-[3px] border-slate-900 flex items-center justify-center font-black text-sm shadow-[4px_4px_0_0_#0f172a] group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                                                {item.madrasah?.nama_madrasah?.substring(0, 2) || 'MI'}
                                            </div>
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="font-black text-slate-900 text-xs md:text-sm uppercase leading-tight tracking-tight">
                                                    {item.madrasah?.nama_madrasah}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 leading-none italic">
                                                    <MapPin size={10} className="text-emerald-600 shrink-0" />
                                                    {item.madrasah?.kecamatan || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 text-left align-middle">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 text-[11px] uppercase tracking-tighter decoration-emerald-500/30 decoration-2">
                                                {formatBulan(item.bulan_tahun)}
                                            </span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                                ID: #{item.id_laporan}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 text-left align-middle">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2
                                            ${item.status_laporan === 'verified'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : item.status_laporan === 'revisi'
                                                    ? 'bg-rose-50 text-rose-700 border-rose-100'
                                                    : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${item.status_laporan === 'verified' ? 'bg-emerald-500' : item.status_laporan === 'revisi' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                            {item.status_laporan}
                                        </div>
                                    </td>

                                    <td className="px-8 py-5 text-center align-middle">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link href={`/admin/laporan/${item.id_laporan}`}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="!h-9 !px-4 !text-[9px] !font-black !tracking-widest uppercase border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_#0f172a] transition-all"
                                                >
                                                    DETAIL
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                icon={<Download size={12} />}
                                                className="!h-9 !px-4 !text-[9px] !font-black !tracking-widest uppercase border-2 border-emerald-600 text-emerald-600 shadow-[3px_3px_0_0_#059669] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_#059669] transition-all hover:bg-emerald-50"
                                                onClick={() => handleExportIndividualExcel(item)}
                                                isLoading={exportingId === item.id_laporan}
                                            >
                                                EXCEL
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
