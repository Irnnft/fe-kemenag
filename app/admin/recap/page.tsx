'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileSpreadsheet, Loader2, Calendar, MapPin, Trash2, Archive, RotateCcw, ChevronDown, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { api } from '@/lib/api';
import { KECAMATAN_KAMPAR } from '@/lib/constants';

export default function RecapPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [recapData, setRecapData] = useState<any[]>([]);
    const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [kecamatan, setKecamatan] = useState('Semua Kec.');
    const [jenjang, setJenjang] = useState('Semua Jenjang');
    const [isExporting, setIsExporting] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [userRole, setUserRole] = useState<string>('');

    const fetchRecap = async () => {
        setIsLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.role === 'staff_penmad') {
                    router.push('/admin/dashboard');
                    return;
                }
                setUserRole(user.role);
            }

            const response = await api.admin.getRecap({ archived: showArchived ? 1 : 0 });
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
    }, [showArchived]);

    const formatBulan = (bulanStr: string) => {
        if (!bulanStr) return '-';
        const date = new Date(bulanStr + '-01');
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
    };

    const handleExportRecap = async () => {
        setIsExporting(true);
        try {
            const response = await api.admin.getRecap({
                bulan,
                kecamatan,
                jenjang,
                trashed: showArchived ? 1 : 0
            });
            const data = await response.json();
            const allReports = Array.isArray(data) ? data : (data.data || []);

            if (allReports.length === 0) {
                alert('Tidak ada data untuk filter yang dipilih');
                return;
            }

            const workbook = XLSX.utils.book_new();

            // Helper to generate combined data
            const prepareData = (key: string, mapper: (item: any, madrasah: any) => any) => {
                const combined: any[] = [];
                allReports.forEach((report: any) => {
                    const items = report[key] || [];
                    items.forEach((item: any) => {
                        combined.push(mapper(item, report.madrasah));
                    });
                });
                return combined;
            };

            // I. Siswa
            const siswaData = prepareData('siswa', (s, m) => ({
                'Madrasah': m?.nama_madrasah, 'Kecamatan': m?.kecamatan, 'Kelas': s.kelas, 'Rombel': s.jumlah_rombel, 'L': s.jumlah_lk, 'P': s.jumlah_pr, 'Masuk': s.mutasi_masuk, 'Keluar': s.mutasi_keluar
            }));
            if (siswaData.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(siswaData), 'REKAP SISWA');

            // II. Personal
            const personalData = prepareData('rekap_personal', (r, m) => ({
                'Madrasah': m?.nama_madrasah, 'Kategori': r.keadaan, 'L': r.jumlah_lk, 'P': r.jumlah_pr, 'Mutasi Masuk': r.mutasi_masuk, 'Mutasi Keluar': r.mutasi_keluar
            }));
            if (personalData.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(personalData), 'REKAP PERSONAL');

            // III. Guru
            const guruData = prepareData('guru', (g, m) => ({
                'Madrasah': m?.nama_madrasah, 'Nama Guru': g.nama_guru, 'NIP/NIK': g.nip_nik, 'Status': g.status_pegawai, 'Jabatan': g.jabatan, 'Pendidikan': g.pendidikan_terakhir, 'Sertifikasi': g.sertifikasi ? 'YA' : 'TIDAK'
            }));
            if (guruData.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(guruData), 'REKAP GURU');

            // IV. Sarpras
            const sarprasData = prepareData('sarpras', (s, m) => ({
                'Madrasah': m?.nama_madrasah, 'Jenis Aset': s.jenis_aset, 'Luas': s.luas, 'Baik': s.kondisi_baik, 'RR': s.kondisi_rusak_ringan, 'RB': s.kondisi_rusak_berat, 'Kekurangan': s.kekurangan
            }));
            if (sarprasData.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sarprasData), 'REKAP SARPRAS');

            // V. Mobiler
            const mobilerData = prepareData('mobiler', (item, m) => ({
                'Madrasah': m?.nama_madrasah, 'Nama Barang': item.nama_barang, 'Total': item.jumlah_total, 'Baik': item.kondisi_baik, 'RR': item.kondisi_rusak_ringan, 'RB': item.kondisi_rusak_berat, 'Kekurangan': item.kekurangan
            }));
            if (mobilerData.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(mobilerData), 'REKAP MOBILER');

            // VI. Keuangan
            const keuanganData = prepareData('keuangan', (k, m) => ({
                'Madrasah': m?.nama_madrasah, 'Uraian': k.uraian_kegiatan, 'Satuan': k.satuan, 'Volume': k.volume, 'Harga': k.harga_satuan, 'Total': Number(k.volume || 0) * Number(k.harga_satuan || 0)
            }));
            if (keuanganData.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(keuanganData), 'REKAP KEUANGAN');

            const fileName = `REKAP_LAPORAN_${jenjang}_${kecamatan}_${bulan}.xlsx`.replace(/\s+/g, '_');
            XLSX.writeFile(workbook, fileName);
        } catch (error) {
            console.error(error);
            alert('Gagal mengekspor data');
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading && !userRole) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 animate-fade-in">
                <Loader2 className="animate-spin text-emerald-700" size={64} />
                <p className="font-black text-slate-900 uppercase tracking-widest text-sm">Menyiapkan Dokumen Rekap...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in -mt-6 pb-20">
            <div className="max-w-3xl mx-auto">
                <Card title="REKAP BULANAN" className="hover:shadow-2xl transition-all duration-500">
                    <div className="space-y-10">
                        <div className="bg-emerald-50 border-2 border-emerald-100 p-8 rounded-[2rem] relative overflow-hidden group">
                            <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:scale-110 transition-transform text-emerald-900 duration-700">
                                <FileSpreadsheet size={150} />
                            </div>
                            <p className="text-emerald-900 font-black uppercase text-[10px] tracking-[0.2em] mb-3">Download Rekap Bulanan</p>
                            <p className="text-emerald-700 font-bold relative z-10 leading-relaxed text-sm">
                                Unduh rekapitulasi data (Siswa, Guru, Keuangan) per kecamatan dalam format Excel.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="input-label">Pilih Periode</label>
                                <div className="relative group">
                                    <input
                                        type="month"
                                        className="select-field border-2 pr-12 hover:border-emerald-500 transition-all cursor-pointer !h-14 !text-xs"
                                        value={bulan}
                                        onChange={(e) => setBulan(e.target.value)}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-emerald-600 transition-colors">
                                        <Calendar size={16} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="input-label">Pilih Jenjang</label>
                                <div className="relative group">
                                    <select
                                        className="select-field border-2 appearance-none pr-12 hover:border-emerald-500 transition-all cursor-pointer uppercase !h-14 !text-xs"
                                        value={jenjang}
                                        onChange={(e) => setJenjang(e.target.value)}
                                    >
                                        <option value="Semua Jenjang">Semua Jenjang</option>
                                        <option value="MI">MADRASAH IBTIDAIYAH (MI)</option>
                                        <option value="MTS">MADRASAH TSANAWIYAH (MTS)</option>
                                        <option value="MA">MADRASAH ALIYAH (MA)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-emerald-600 transition-colors">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="input-label">Filter Kecamatan</label>
                                <div className="relative group">
                                    <select
                                        className="select-field border-2 appearance-none pr-12 hover:border-emerald-500 transition-all cursor-pointer uppercase !h-14 !text-xs"
                                        value={kecamatan}
                                        onChange={(e) => setKecamatan(e.target.value)}
                                    >
                                        <option value="Semua Kec.">Semua Kec.</option>
                                        {KECAMATAN_KAMPAR.map(k => (
                                            <option key={k} value={k}>{k}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-emerald-600 transition-colors">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                variant="primary"
                                icon={<Download size={20} />}
                                className="w-full !py-8 !text-base !font-black shadow-xl shadow-emerald-200/50 hover:scale-[1.02] transition-transform uppercase tracking-widest"
                                onClick={handleExportRecap}
                                isLoading={isExporting}
                            >
                                {isExporting ? 'MENGOLAH DATABASE...' : 'UNDUH REKAP EXCEL SEKARANG'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
