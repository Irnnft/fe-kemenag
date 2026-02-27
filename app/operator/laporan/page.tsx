'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Info, Search, Loader2, FileText, Trash2, ChevronDown, Calendar, RotateCcw, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';

export default function LaporanListPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [isLoading, setIsLoading] = useState(true);
    const [reports, setReports] = useState<any[]>([]);
    const [selectedNote, setSelectedNote] = useState<string | null>(null);
    const [showTrashed, setShowTrashed] = useState(false);
    const [exportingId, setExportingId] = useState<string | null>(null);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            // Menggunakan trashed filter
            const response = await api.operator.getDashboard({ trashed: showTrashed ? 1 : 0 });
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
    }, [showTrashed]);

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

    const handleDelete = async (id: string, status: string) => {
        if (status === 'submitted') {
            alert('Laporan sedang dalam proses validasi admin, tidak bisa dihapus.');
            return;
        }

        if (confirm('Pindahkan ke tempat sampah?')) {
            try {
                const res = await api.operator.deleteLaporan(id);
                if (res.ok) fetchReports();
                else {
                    const data = await res.json();
                    alert(data.message || 'Gagal menghapus');
                }
            } catch (e) { alert('Kesalahan koneksi'); }
        }
    };

    const handleRestore = async (id: string) => {
        if (confirm('Kembalikan laporan ini ke daftar aktif?')) {
            try {
                const res = await api.operator.restoreLaporan(id);
                if (res.ok) fetchReports();
            } catch (e) { alert('Kesalahan koneksi'); }
        }
    };

    const handlePermanentDelete = async (id: string) => {
        if (confirm('⚠️ HAPUS PERMANEN?\n\nLaporan akan dihapus selamanya dan tidak bisa dikembalikan!')) {
            try {
                const res = await api.operator.permanentDeleteLaporan(id);
                if (res.ok) {
                    alert('Laporan dihapus permanen');
                    fetchReports();
                }
            } catch (e) { alert('Kesalahan koneksi'); }
        }
    };

    const handleExportIndividualExcel = async (id: string, bulanStr: string) => {
        setExportingId(id);
        try {
            const response = await api.operator.getLaporanDetail(id);
            const data = await response.json();
            const reportData = data.data || data;

            if (!response.ok) {
                alert('Gagal mengambil detail laporan');
                return;
            }

            const workbook = XLSX.utils.book_new();

            // Create a single sheet for all data (Stacked vertically for better accessibility)
            const ws = XLSX.utils.aoa_to_sheet([
                ["LAPORAN DIGITAL BULANAN - MIS KAMPAR"],
                ["Madrasah", reportData.madrasah?.nama_madrasah || "Madrasah Saya"],
                ["Periode", formatBulan(bulanStr)],
                ["Status", reportData.status_laporan?.toUpperCase() || "-"],
                ["Tanggal Ekspor", new Date().toLocaleString('id-ID')],
                [""], // Spacer
            ]);

            let currentRow = 7;

            const addSection = (title: string, data: any[], mapper: (item: any) => any) => {
                // Add Section Header
                XLSX.utils.sheet_add_aoa(ws, [[title.toUpperCase()]], { origin: `A${currentRow}` });
                currentRow++;

                if (data && data.length > 0) {
                    const mappedData = data.map(mapper);
                    XLSX.utils.sheet_add_json(ws, mappedData, { origin: `A${currentRow}`, skipHeader: false });
                    currentRow += mappedData.length + 3; // Spacer between sections
                } else {
                    XLSX.utils.sheet_add_aoa(ws, [["(Tidak ada data untuk bagian ini)"]], { origin: `A${currentRow}` });
                    currentRow += 3;
                }
            };

            // I. Data Siswa
            addSection("I. DATA SISWA (ROMBEL & MUTASI)", reportData.siswa, (s) => ({
                'Kelas': s.kelas,
                'Rombel': s.jumlah_rombel,
                'Laki-laki': s.jumlah_lk,
                'Perempuan': s.jumlah_pr,
                'Mutasi Masuk': s.mutasi_masuk,
                'Mutasi Keluar': s.mutasi_keluar,
                'Keterangan': s.keterangan || '-'
            }));

            // II. Rekap Personal
            addSection("II. REKAP DATA PERSONAL", reportData.rekap_personal, (r) => ({
                'Keadaan/Kategori': r.keadaan,
                'L': r.jumlah_lk,
                'P': r.jumlah_pr,
                'Mutasi Masuk': r.mutasi_masuk,
                'Mutasi Keluar': r.mutasi_keluar,
                'Keterangan': r.keterangan || '-'
            }));

            // III. Data Guru
            addSection("III. DETAIL GURU & TENAGA KEPENDIDIKAN", reportData.guru, (g) => ({
                'Nama Lengkap': g.nama_guru,
                'NIP/NIK': g.nip_nik,
                'L/P': g.lp,
                'Tempat Lahir': g.tempat_lahir,
                'Tanggal Lahir': g.tanggal_lahir,
                'Status Pegawai': g.status_pegawai,
                'Pendidikan': g.pendidikan_terakhir,
                'Jurusan': g.jurusan,
                'Golongan': g.golongan,
                'TMT Mengajar': g.tmt_mengajar,
                'TMT Madrasah': g.tmt_di_madrasah,
                'Mata Pelajaran': g.mata_pelajaran,
                'Satminkal': g.satminkal,
                'Jml Jam': g.jumlah_jam,
                'Jabatan': g.jabatan,
                'Ibu Kandung': g.nama_ibu_kandung,
                'Sertifikasi': g.sertifikasi ? 'YA' : 'TIDAK',
                'Status Mutasi': g.mutasi_status
            }));

            // IV. Sarpras
            addSection("IV. DATA SARANA PRASARANA", reportData.sarpras, (s) => ({
                'Jenis Aset': s.jenis_aset,
                'Luas/Volume': s.luas,
                'Kondisi Baik': s.kondisi_baik,
                'Rusak Ringan': s.kondisi_rusak_ringan,
                'Rusak Berat': s.kondisi_rusak_berat,
                'Kekurangan': s.kekurangan,
                'Perlu Rehab': s.perlu_rehab,
                'Keterangan': s.keterangan || '-'
            }));

            // V. Mobiler
            addSection("V. DATA MOBILER", reportData.mobiler, (m) => ({
                'Nama Barang': m.nama_barang,
                'Total': m.jumlah_total,
                'Kondisi Baik': m.kondisi_baik,
                'Rusak Ringan': m.kondisi_rusak_ringan,
                'Rusak Berat': m.kondisi_rusak_berat,
                'Kekurangan': m.kekurangan,
                'Keterangan': m.keterangan || '-'
            }));

            // VI. Keuangan
            addSection("VI. DATA KEUANGAN (BOS/NON-BOS)", reportData.keuangan, (k) => ({
                'Uraian Kegiatan': k.uraian_kegiatan,
                'Satuan': k.satuan,
                'Volume': k.volume,
                'Harga Satuan': k.harga_satuan,
                'Total': Number(k.volume || 0) * Number(k.harga_satuan || 0)
            }));

            XLSX.utils.book_append_sheet(workbook, ws, 'LAPORAN LENGKAP');

            // Tambahkan semua kategori sebagai tab terpisah
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
                'Uraian': k.uraian_kegiatan, 'Satuan': k.satuan, 'Vol': k.volume, 'Harga': k.harga_satuan, 'Total': Number(k.volume || 0) * Number(k.harga_satuan || 0)
            }));

            const fileName = `Export_Laporan_${formatBulan(bulanStr)}_${new Date().getTime()}.xlsx`;
            XLSX.writeFile(workbook, fileName);
        } catch (error) {
            console.error(error);
            alert('Kesalahan saat ekspor data');
        } finally {
            setExportingId(null);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <h1 className="text-slate-900 italic">Daftar Laporan {showTrashed && '(TEMPAT SAMPAH)'}</h1>
                    <p className="text-muted text-sm uppercase mt-2">Kelola arsip pelaporan madrasah rutin anda secara digital.</p>
                </div>
                <Button
                    variant="primary"
                    size="lg"
                    icon={<Plus size={28} />}
                    onClick={handleCreateLaporan}
                    className="shadow-2xl"
                >
                    BUAT LAPORAN BARU
                </Button>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row gap-8 mb-12 items-end">
                    <div className="flex-1">
                        <Input
                            label="Cari Periode Laporan"
                            placeholder="YYYY-MM..."
                            icon={<Search size={22} />}
                            className="mb-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-72 relative">
                        <label className="input-label">Filter Status Verifikasi</label>
                        <div className="relative">
                            <select
                                className="select-field appearance-none pr-10 cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="Semua Status">Semua Status</option>
                                <option value="draft">DRAFT (DRAF)</option>
                                <option value="submitted">SUBMITTED (DIKIRIM)</option>
                                <option value="verified">VERIFIED (DISETUJUI)</option>
                                <option value="revisi">REVISI (PERLU PERBAIKAN)</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronDown size={20} strokeWidth={3} />
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                        <Button
                            variant={showTrashed ? 'primary' : 'outline'}
                            icon={<Trash2 size={20} />}
                            onClick={() => setShowTrashed(!showTrashed)}
                            className="w-full md:w-auto h-14 rounded-2xl border-2 px-8"
                        >
                            {showTrashed ? 'LIHAT DATA AKTIF' : 'TEMPAT SAMPAH'}
                        </Button>
                    </div>
                </div>
                <div className="table-container relative min-h-[400px]">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                            <Loader2 className="animate-spin text-emerald-700" size={64} />
                        </div>
                    )}

                    <table>
                        <thead>
                            <tr>
                                <th>BULAN / TAHUN</th>
                                <th>STATUS LAPORAN</th>
                                <th>TERAKHIR UPDATE</th>
                                <th className="text-right">NAVIGASI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredReports.map((report) => (
                                <tr key={report.id_laporan} className="group">
                                    <td className="text-left">
                                        <div className="inline-flex items-center gap-2 font-black text-slate-700 bg-slate-100 px-4 py-2.5 rounded-xl text-[12px] uppercase whitespace-nowrap italic">
                                            <Calendar size={14} className="text-slate-400" />
                                            {formatBulan(report.bulan_tahun)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col items-center gap-3">
                                            <span className={`px-6 py-2.5 rounded-xl text-[11px] font-black border-2 uppercase tracking-[0.1em] shadow-sm
                                            ${report.status_laporan === 'draft' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                                                    report.status_laporan === 'submitted' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                                        report.status_laporan === 'verified' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                                                            'bg-rose-100 text-rose-900 border-rose-300'
                                                }`}
                                            >
                                                {report.status_laporan === 'revisi' ? 'PERLU PERBAIKAN' : report.status_laporan}
                                            </span>
                                            {/* Button revisi removed as requested */}
                                        </div>
                                    </td>
                                    <td className="text-slate-400 font-bold text-sm uppercase">
                                        {report.updated_at ? new Date(report.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                    </td>
                                    <td className="text-right py-4">
                                        <div className="flex flex-col items-end gap-2">
                                            {!showTrashed ? (
                                                <div className="flex flex-col gap-1.5 w-full max-w-[120px]">
                                                    <Link href={`/operator/laporan/${report.id_laporan}`} className="w-full">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full !font-black !tracking-wider"
                                                            icon={<Edit size={14} />}
                                                        >
                                                            {report.status_laporan === 'verified' ? 'LIHAT DATA' : 'KELOLA DATA'}
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full !text-emerald-600 !border-emerald-200 hover:!bg-emerald-50 !font-black"
                                                        icon={<Download size={14} />}
                                                        onClick={() => handleExportIndividualExcel(report.id_laporan, report.bulan_tahun)}
                                                        isLoading={exportingId === report.id_laporan}
                                                    >
                                                        EKSPOR EXCEL
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full !text-rose-500 !border-rose-200 hover:!bg-rose-50 !font-black"
                                                        icon={<Trash2 size={14} />}
                                                        onClick={() => {
                                                            if (report.status_laporan === 'submitted') {
                                                                alert('Laporan sedang divalidasi, tidak bisa dihapus.');
                                                                return;
                                                            }
                                                            handleDelete(report.id_laporan, report.status_laporan);
                                                        }}
                                                        disabled={report.status_laporan === 'submitted'}
                                                    >
                                                        HAPUS
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1.5 w-full max-w-[120px]">
                                                    <Button
                                                        variant="outline"
                                                        className="w-full !px-0 !py-2 !bg-emerald-50 !text-emerald-700 !border-emerald-200 !text-[10px] !font-black"
                                                        icon={<RotateCcw size={14} />}
                                                        onClick={() => handleRestore(report.id_laporan)}
                                                    >
                                                        RESTORE
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        className="w-full !px-0 !py-2 !text-[10px] !font-black"
                                                        icon={<Trash2 size={14} />}
                                                        onClick={() => handlePermanentDelete(report.id_laporan)}
                                                    >
                                                        HAPUS
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!isLoading && filteredReports.length === 0 && (
                        <div className="py-40 text-center text-slate-300 font-extrabold text-2xl uppercase italic opacity-30 tracking-widest leading-none">
                            {showTrashed ? 'Tempat Sampah Kosong.' : 'Arsip Laporan Belum Ada.'}
                        </div>
                    )}
                </div>
            </Card>

            <Modal
                isOpen={!!selectedNote}
                onClose={() => setSelectedNote(null)}
                title="CATATAN REVISI VALIDATOR"
            >
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-rose-50 border-[3px] border-rose-100 p-8 rounded-[2.5rem] shadow-inner text-rose-900 font-extrabold text-xl md:text-2xl leading-relaxed italic relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 p-4 opacity-5 text-rose-900">
                            <Info size={120} />
                        </div>
                        <span className="relative z-10 block">"{selectedNote}"</span>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
                        <h4 className="font-black text-emerald-400 uppercase text-[10px] tracking-widest mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                            Instruksi Perbaikan
                        </h4>
                        <p className="text-slate-300 font-bold text-sm leading-relaxed">
                            Mohon lakukan perbaikan pada data laporan sesuai dengan instruksi validator di atas. Setelah diperbaiki, jangan lupa untuk klik <span className="text-white">"SIMPAN"</span> dan kirim kembali laporan anda untuk divalidasi ulang.
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        className="w-full !py-6 shadow-2xl"
                        onClick={() => setSelectedNote(null)}
                    >
                        SAYA MENGERTI
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
