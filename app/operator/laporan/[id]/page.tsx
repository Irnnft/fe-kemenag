'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Save, Send, ArrowLeft, Users, Building, Coins, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function LaporanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('siswa');
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    const tabs = [
        { id: 'siswa', label: '1. Data Siswa', icon: <Users size={18} /> },
        { id: 'rekap_personal', label: '2. Rekap Personal', icon: <Users size={18} /> },
        { id: 'guru', label: '3. Detail Guru', icon: <Users size={18} /> },
        { id: 'sarpras_mobiler', label: '4. Sarpras & Mobiler', icon: <Building size={18} /> },
        { id: 'keuangan', label: '5. Keuangan', icon: <Coins size={18} /> },
    ];

    const fetchDetail = async () => {
        setIsLoading(true);
        try {
            const response = await api.operator.getLaporanDetail(id);
            const data = await response.json();
            if (response.ok) {
                setReportData(data.data || data);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const handleSaveSection = async () => {
        setIsSaving(true);
        try {
            let response;
            if (activeTab === 'siswa') {
                response = await api.operator.updateSiswa(id, reportData.data_siswa);
            } else if (activeTab === 'rekap_personal') {
                response = await api.operator.updateRekapPersonal(id, reportData.data_rekap_personal);
            } else if (activeTab === 'guru') {
                response = await api.operator.updateGuru(id, reportData.data_guru);
            } else if (activeTab === 'sarpras_mobiler') {
                await api.operator.updateSarpras(id, reportData.data_sarpras);
                response = await api.operator.updateMobiler(id, reportData.data_mobiler);
            } else if (activeTab === 'keuangan') {
                response = await api.operator.updateKeuangan(id, reportData.data_keuangan);
            }

            if (response?.ok) {
                alert(`Data ${activeTab.toUpperCase()} berhasil disimpan!`);
            } else {
                alert('Gagal menyimpan data.');
            }
        } catch (error) {
            alert('Kesalahan koneksi');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!confirm('Kirim laporan ini? Data tidak bisa diubah setelah status Submitted.')) return;
        try {
            const response = await api.operator.submitLaporan(id);
            if (response.ok) {
                alert('Laporan berhasil dikirim!');
                router.push('/operator/laporan');
            } else {
                const data = await response.json();
                alert(data.message || 'Gagal mengirim laporan.');
            }
        } catch (error) {
            alert('Kesalahan koneksi');
        }
    };

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-emerald-700" size={64} />
                <p className="font-black text-slate-900 uppercase tracking-widest">Sinkronisasi Data Database...</p>
            </div>
        );
    }

    const formatBulan = (dateStr: string) => {
        if (!dateStr) return 'LAPORAN';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border-4 border-slate-900 shadow-2xl">
                <div className="flex items-center gap-6">
                    <Link href="/operator/laporan">
                        <Button variant="outline" className="h-16 w-16 p-0 rounded-2xl justify-center border-4 border-slate-900 shadow-md">
                            <ArrowLeft size={32} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                            {formatBulan(reportData?.bulan_tahun)}
                        </h1>
                        <div className="flex items-center gap-4 mt-3">
                            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full border-2 border-emerald-400 font-black text-xs uppercase tracking-widest">
                                STATUS: {reportData?.status_laporan}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none py-6 px-10 font-black border-4 text-emerald-900 border-emerald-700" icon={<Save size={26} />} onClick={handleSaveSection} isLoading={isSaving} disabled={reportData?.status_laporan !== 'draft' && reportData?.status_laporan !== 'revisi'}>
                        SIMPAN BAGIAN
                    </Button>
                    <Button className="flex-1 md:flex-none py-6 px-10 font-black bg-emerald-700 shadow-xl" icon={<Send size={26} />} onClick={handleSubmit} disabled={reportData?.status_laporan !== 'draft' && reportData?.status_laporan !== 'revisi'}>
                        KIRIM LAPORAN
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto bg-slate-100 p-2 rounded-3xl border-2 border-slate-200 gap-2 no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-8 py-5 font-black text-sm transition-all rounded-2xl whitespace-nowrap
                        ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-500 hover:bg-white'}`}
                    >
                        {tab.icon}
                        <span className="uppercase tracking-tighter">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Dynamic Forms (Matching exact DB columns) */}
            <div className="transition-all duration-300">
                {activeTab === 'siswa' && <SiswaForm rows={reportData?.data_siswa} onChange={(d) => setReportData({ ...reportData, data_siswa: d })} />}
                {activeTab === 'rekap_personal' && <RekapPersonalForm rows={reportData?.data_rekap_personal} onChange={(d) => setReportData({ ...reportData, data_rekap_personal: d })} />}
                {activeTab === 'guru' && <DetailGuruForm rows={reportData?.data_guru} onChange={(d) => setReportData({ ...reportData, data_guru: d })} />}
                {activeTab === 'sarpras_mobiler' && (
                    <div className="space-y-10">
                        <SarprasForm rows={reportData?.data_sarpras} onChange={(d) => setReportData({ ...reportData, data_sarpras: d })} />
                        <MobilerForm rows={reportData?.data_mobiler} onChange={(d) => setReportData({ ...reportData, data_mobiler: d })} />
                    </div>
                )}
                {activeTab === 'keuangan' && <KeuanganForm rows={reportData?.data_keuangan} onChange={(d) => setReportData({ ...reportData, data_keuangan: d })} />}
            </div>
        </div>
    );
}

// --- SHARED STYLES ---
const cellInput = "w-full h-full p-4 text-center font-black text-xl outline-none focus:bg-emerald-50 transition-colors uppercase";
const headerCell = "bg-slate-900 text-white font-black uppercase text-xs tracking-widest p-5 border-r border-white/10";
const subHeaderCell = "bg-slate-800 text-emerald-300 font-bold uppercase text-[10px] p-3 border-r border-white/5";

// --- FORM COMPONENTS (EXACT DB COLUMN MATCH) ---

function SiswaForm({ rows, onChange }: { rows: any[], onChange: (d: any[]) => void }) {
    const update = (idx: number, field: string, val: any) => {
        const nr = [...(rows || [])];
        nr[idx] = { ...nr[idx], [field]: val };
        onChange(nr);
    };

    return (
        <Card title="TABEL DATA SISWA">
            <div className="overflow-x-auto border-4 border-slate-900 rounded-[2.5rem] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="text-center">
                            <th rowSpan={2} className={headerCell}>KELAS</th>
                            <th rowSpan={2} className={headerCell}>ROMBEL</th>
                            <th colSpan={3} className={headerCell}>SISWA</th>
                            <th colSpan={2} className={headerCell}>MUTASI</th>
                            <th rowSpan={2} className={`${headerCell} bg-slate-700`}>TOTAL</th>
                        </tr>
                        <tr className="text-center">
                            <th className={subHeaderCell}>LK (jumlah_lk)</th>
                            <th className={subHeaderCell}>PR (jumlah_pr)</th>
                            <th className={`${subHeaderCell} bg-slate-700`}>JML</th>
                            <th className={subHeaderCell}>IN (mutasi_masuk)</th>
                            <th className={subHeaderCell}>OUT (mutasi_keluar)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-slate-100 italic">
                        {(rows || []).map((row, i) => (
                            <tr key={i} className="text-center">
                                <td className="p-6 bg-slate-50 font-black text-xl border-r-4 border-slate-100">{row.kelas}</td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.jumlah_rombel} onChange={e => update(i, 'jumlah_rombel', Number(e.target.value))} /></td>
                                <td className="p-0 border-r-2"><input type="number" className={`${cellInput} text-blue-800`} value={row.jumlah_lk} onChange={e => update(i, 'jumlah_lk', Number(e.target.value))} /></td>
                                <td className="p-0 border-r-2"><input type="number" className={`${cellInput} text-pink-700`} value={row.jumlah_pr} onChange={e => update(i, 'jumlah_pr', Number(e.target.value))} /></td>
                                <td className="p-6 bg-slate-100 font-black text-2xl border-r-2">{(row.jumlah_lk || 0) + (row.jumlah_pr || 0)}</td>
                                <td className="p-0 border-r-2"><input type="number" className={`${cellInput} text-emerald-600`} value={row.mutasi_masuk} onChange={e => update(i, 'mutasi_masuk', Number(e.target.value))} /></td>
                                <td className="p-0 border-r-2"><input type="number" className={`${cellInput} text-red-600`} value={row.mutasi_keluar} onChange={e => update(i, 'mutasi_keluar', Number(e.target.value))} /></td>
                                <td className="p-6 bg-slate-900 text-white font-black text-3xl">{(row.jumlah_lk + row.jumlah_pr + row.mutasi_masuk) - row.mutasi_keluar}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

function RekapPersonalForm({ rows, onChange }: { rows: any[], onChange: (d: any[]) => void }) {
    const update = (idx: number, field: string, val: any) => {
        const nr = [...(rows || [])];
        nr[idx] = { ...nr[idx], [field]: val };
        onChange(nr);
    };

    return (
        <Card title="REKAP PERSONAL (data_rekap_personal)">
            <div className="overflow-x-auto border-4 border-slate-900 rounded-[2.5rem] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="text-center">
                            <th rowSpan={2} className={headerCell}>KEADAAN</th>
                            <th colSpan={3} className={headerCell}>JUMLAH</th>
                            <th colSpan={2} className={headerCell}>MUTASI</th>
                            <th rowSpan={2} className={`${headerCell} bg-slate-700`}>AKHIR</th>
                        </tr>
                        <tr>
                            <th className={subHeaderCell}>LK (jumlah_lk)</th>
                            <th className={subHeaderCell}>PR (jumlah_pr)</th>
                            <th className={`${subHeaderCell} bg-slate-700`}>TOTAL</th>
                            <th className={subHeaderCell}>MASUK (mutasi_masuk)</th>
                            <th className={subHeaderCell}>KELUAR (mutasi_keluar)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-slate-100">
                        {(rows || []).map((row, i) => (
                            <tr key={i} className="text-center">
                                <td className="p-6 bg-slate-50 font-black border-r-4 border-slate-100 text-left uppercase">{row.keadaan}</td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.jumlah_lk} onChange={e => update(i, 'jumlah_lk', Number(e.target.value))} /></td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.jumlah_pr} onChange={e => update(i, 'jumlah_pr', Number(e.target.value))} /></td>
                                <td className="p-6 bg-slate-100 border-r-2 font-black">{(row.jumlah_lk || 0) + (row.jumlah_pr || 0)}</td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.mutasi_masuk} onChange={e => update(i, 'mutasi_masuk', Number(e.target.value))} /></td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.mutasi_keluar} onChange={e => update(i, 'mutasi_keluar', Number(e.target.value))} /></td>
                                <td className="p-6 bg-slate-900 text-white font-black text-2xl">{(row.jumlah_lk + row.jumlah_pr + row.mutasi_masuk) - row.mutasi_keluar}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

function DetailGuruForm({ rows, onChange }: { rows: any[], onChange: (d: any[]) => void }) {
    // Detailed teacher list matching data_guru table
    return (
        <Card title="DATA DETAIL GURU (data_guru)">
            <div className="overflow-x-auto border-4 border-slate-900 rounded-[2.5rem] overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr>
                            <th className={headerCell}>NAMA GURU</th>
                            <th className={headerCell}>NIP/NIK</th>
                            <th className={headerCell}>L/P</th>
                            <th className={headerCell}>STATUS PEGAWAI</th>
                            <th className={headerCell}>JABATAN</th>
                            <th className={headerCell}>JAM</th>
                            <th className={headerCell}>MUTASI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-100">
                        {(rows || []).map((row, i) => (
                            <tr key={i} className="font-black">
                                <td className="p-4 bg-slate-50 border-r uppercase">{row.nama_guru}</td>
                                <td className="p-4 border-r">{row.nip_nik}</td>
                                <td className="p-4 border-r text-center">{row.lp}</td>
                                <td className="p-4 border-r uppercase">{row.status_pegawai}</td>
                                <td className="p-4 border-r uppercase">{row.jabatan}</td>
                                <td className="p-4 border-r text-center">{row.jumlah_jam}</td>
                                <td className="p-4 text-center uppercase">{row.mutasi_status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="mt-6 text-slate-500 font-bold italic text-sm text-center">Data guru ditampilkan per individu sesuai tabel database data_guru.</p>
        </Card>
    );
}

function SarprasForm({ rows, onChange }: { rows: any[], onChange: (d: any[]) => void }) {
    const update = (idx: number, field: string, val: any) => {
        const nr = [...(rows || [])];
        nr[idx] = { ...nr[idx], [field]: val };
        onChange(nr);
    };

    return (
        <Card title="DATA SARANA PRASARANA (data_sarpras)">
            <div className="overflow-x-auto border-4 border-slate-900 rounded-[2.5rem] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className={headerCell}>JENIS ASET</th>
                            <th className={headerCell}>LUAS</th>
                            <th className={subHeaderCell}>BAIK</th>
                            <th className={subHeaderCell}>RR</th>
                            <th className={subHeaderCell}>RB</th>
                            <th className={subHeaderCell}>KEKORANGAN</th>
                            <th className={subHeaderCell}>PERLU REHAB</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-slate-100 italic">
                        {(rows || []).map((row, i) => (
                            <tr key={i} className="text-center font-black">
                                <td className="p-6 bg-slate-50 border-r-4 text-left uppercase">{row.jenis_aset}</td>
                                <td className="p-0 border-r-2"><input className={cellInput} value={row.luas} onChange={e => update(i, 'luas', e.target.value)} /></td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.kondisi_baik} onChange={e => update(i, 'kondisi_baik', Number(e.target.value))} /></td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.kondisi_rusak_ringan} onChange={e => update(i, 'kondisi_rusak_ringan', Number(e.target.value))} /></td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.kondisi_rusak_berat} onChange={e => update(i, 'kondisi_rusak_berat', Number(e.target.value))} /></td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.kekurangan} onChange={e => update(i, 'kekurangan', Number(e.target.value))} /></td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.perlu_rehab} onChange={e => update(i, 'perlu_rehab', Number(e.target.value))} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

function MobilerForm({ rows, onChange }: { rows: any[], onChange: (d: any[]) => void }) {
    const update = (idx: number, field: string, val: any) => {
        const nr = [...(rows || [])];
        nr[idx] = { ...nr[idx], [field]: val };
        onChange(nr);
    };

    return (
        <Card title="DATA MOBILER (data_mobiler)">
            <div className="overflow-x-auto border-4 border-slate-900 rounded-[2.5rem] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className={headerCell}>NAMA BARANG</th>
                            <th className={headerCell}>JML TOTAL</th>
                            <th className={subHeaderCell}>BAIK</th>
                            <th className={subHeaderCell}>RR</th>
                            <th className={subHeaderCell}>RB</th>
                            <th className={subHeaderCell}>KEKORANGAN</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-slate-100">
                        {(rows || []).map((row, i) => (
                            <tr key={i} className="text-center font-black">
                                <td className="p-6 bg-slate-50 border-r-4 text-left uppercase">{row.nama_barang}</td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.jumlah_total} onChange={e => update(i, 'jumlah_total', Number(e.target.value))} /></td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.kondisi_baik} onChange={e => update(i, 'kondisi_baik', Number(e.target.value))} /></td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.kondisi_rusak_ringan} onChange={e => update(i, 'kondisi_rusak_ringan', Number(e.target.value))} /></td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.kondisi_rusak_berat} onChange={e => update(i, 'kondisi_rusak_berat', Number(e.target.value))} /></td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.kekurangan} onChange={e => update(i, 'kekurangan', Number(e.target.value))} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

function KeuanganForm({ rows, onChange }: { rows: any[], onChange: (d: any[]) => void }) {
    const update = (idx: number, field: string, val: any) => {
        const nr = [...(rows || [])];
        nr[idx] = { ...nr[idx], [field]: val };
        onChange(nr);
    };

    return (
        <Card title="DATA KEUANGAN (data_keuangan)">
            <div className="overflow-x-auto border-4 border-slate-900 rounded-[2.5rem] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-900 text-white font-black uppercase text-xs tracking-widest text-center">
                            <th className="p-6 border-r border-white/10">URAIAN KEGIATAN</th>
                            <th className="p-6 border-r border-white/10">VOLUME</th>
                            <th className="p-6 border-r border-white/10">SATUAN</th>
                            <th className="p-6 border-r border-white/10">HARGA SATUAN</th>
                            <th className="p-6">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-slate-100">
                        {(rows || []).map((row, i) => (
                            <tr key={i} className="text-center font-black">
                                <td className="p-6 bg-slate-50 border-r-4 text-left uppercase">{row.uraian_kegiatan}</td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.volume} onChange={e => update(i, 'volume', Number(e.target.value))} /></td>
                                <td className="p-0 border-r-2"><input className={cellInput} value={row.satuan} onChange={e => update(i, 'satuan', e.target.value)} /></td>
                                <td className="p-0 border-r-2"><input type="number" className={cellInput} value={row.harga_satuan} onChange={e => update(i, 'harga_satuan', Number(e.target.value))} /></td>
                                <td className="p-6 bg-slate-100 font-black text-2xl text-emerald-800">
                                    Rp {(Number(row.volume || 0) * Number(row.harga_satuan || 0)).toLocaleString('id-ID')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
