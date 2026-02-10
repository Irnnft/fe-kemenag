'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Save, Send, ArrowLeft, Users, Building, Coins, Loader2, CheckCircle2, AlertCircle, FileText, Plus, Trash2 } from 'lucide-react';
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
                response = await api.operator.updateSiswa(id, reportData.siswa);
            } else if (activeTab === 'rekap_personal') {
                response = await api.operator.updateRekapPersonal(id, reportData.rekap_personal);
            } else if (activeTab === 'guru') {
                response = await api.operator.updateGuru(id, reportData.guru);
            } else if (activeTab === 'sarpras_mobiler') {
                await api.operator.updateSarpras(id, reportData.sarpras);
                response = await api.operator.updateMobiler(id, reportData.mobiler);
            } else if (activeTab === 'keuangan') {
                response = await api.operator.updateKeuangan(id, reportData.keuangan);
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
            {/* Compact Header */}
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-[1.5rem] border-2 border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/operator/laporan">
                        <button className="h-10 w-10 flex items-center justify-center rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-colors">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            {formatBulan(reportData?.bulan_tahun)}
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                STATUS: {reportData?.status_laporan}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="py-2.5 px-5 text-xs font-black border-2 text-emerald-700 border-emerald-600 hover:bg-emerald-50 rounded-xl"
                        icon={<Save size={18} />}
                        onClick={handleSaveSection}
                        isLoading={isSaving}
                        disabled={reportData?.status_laporan !== 'draft' && reportData?.status_laporan !== 'revisi'}
                    >
                        SIMPAN
                    </Button>
                    <Button
                        className="py-2.5 px-5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 shadow-md text-white rounded-xl"
                        icon={<Send size={18} />}
                        onClick={handleSubmit}
                        disabled={reportData?.status_laporan !== 'draft' && reportData?.status_laporan !== 'revisi'}
                    >
                        KIRIM LAPORAN
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto bg-white p-1.5 rounded-2xl border border-slate-200 gap-1.5 no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-6 py-3.5 font-bold text-xs transition-all rounded-xl whitespace-nowrap
                        ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        {tab.icon && React.isValidElement(tab.icon) ? React.cloneElement(tab.icon as any, { size: 16 }) : tab.icon}
                        <span className="uppercase tracking-tight">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Dynamic Forms (Matching exact DB columns) */}
            <div className="transition-all duration-300">
                {activeTab === 'siswa' && <SiswaForm rows={reportData?.siswa} onChange={(d) => setReportData({ ...reportData, siswa: d })} />}
                {activeTab === 'rekap_personal' && <RekapPersonalForm rows={reportData?.rekap_personal} onChange={(d) => setReportData({ ...reportData, rekap_personal: d })} />}
                {activeTab === 'guru' && <DetailGuruForm rows={reportData?.guru} onChange={(d) => setReportData({ ...reportData, guru: d })} />}
                {activeTab === 'sarpras_mobiler' && (
                    <div className="space-y-10">
                        <SarprasForm rows={reportData?.sarpras} onChange={(d) => setReportData({ ...reportData, sarpras: d })} />
                        <MobilerForm rows={reportData?.mobiler} onChange={(d) => setReportData({ ...reportData, mobiler: d })} />
                    </div>
                )}
                {activeTab === 'keuangan' && <KeuanganForm rows={reportData?.keuangan} onChange={(d) => setReportData({ ...reportData, keuangan: d })} />}
            </div>
        </div>
    );
}

// --- SHARED STYLES ---
// --- SHARED STYLES ---
// --- SHARED STYLES ---
const cellInput = "w-full h-full py-2.5 px-0 text-center font-bold text-sm outline-none focus:bg-emerald-50/50 transition-all placeholder:text-slate-400 text-black leading-none bg-transparent min-h-[48px]";
const headerCell = "bg-white text-black font-black uppercase text-[10px] tracking-tight p-2 border-r border-slate-300 align-middle border-b-2 shadow-sm !text-center";
const subHeaderCell = "bg-slate-50 text-black font-black uppercase text-[10px] p-2 border-r border-slate-200 align-middle border-b !text-center";

// --- FORM COMPONENTS (EXACT DB COLUMN MATCH) ---

function SiswaForm({ rows, onChange }: { rows: any[], onChange: (d: any[]) => void }) {
    const update = (idx: number, field: string, val: any) => {
        const nr = [...(rows || [])];
        nr[idx] = { ...nr[idx], [field]: val };
        onChange(nr);
    };

    const addRow = () => {
        onChange([...(rows || []), { kelas: '', jumlah_rombel: null, jumlah_lk: null, jumlah_pr: null, mutasi_masuk: null, mutasi_keluar: null, keterangan: '' }]);
    };

    const removeRow = (idx: number) => {
        const nr = [...(rows || [])];
        nr.splice(idx, 1);
        onChange(nr);
    };

    const handleArrow = (e: React.KeyboardEvent, r: number, c: number) => {
        const fields = ['kelas', 'jumlah_rombel', 'jumlah_lk', 'jumlah_pr', 'mutasi_masuk', 'mutasi_keluar', 'keterangan'];
        let nr = r, nc = c;
        if (e.key === 'ArrowUp') nr--;
        else if (e.key === 'ArrowDown') nr++;
        else if (e.key === 'ArrowLeft') nc--;
        else if (e.key === 'ArrowRight') nc++;
        else return;

        if (nr >= 0 && nr < (rows?.length || 0) && nc >= 0 && nc < fields.length) {
            e.preventDefault();
            document.getElementById(`siswa-${nr}-${nc}`)?.focus();
        }
    };

    return (
        <Card title="TABEL DATA SISWA">
            <div className="overflow-x-auto border-2 border-slate-900 rounded-[1.5rem] overflow-hidden bg-white shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="!text-center">
                            <th rowSpan={2} className="w-10 bg-slate-50 border-r border-b-2 border-slate-200 !text-center"></th>
                            <th rowSpan={2} className={headerCell}>KELAS</th>
                            <th rowSpan={2} className={headerCell}>ROMBEL</th>
                            <th colSpan={2} className={headerCell}>SISWA</th>
                            <th colSpan={2} className={headerCell}>MUTASI</th>
                            <th rowSpan={2} className={headerCell}>KETERANGAN</th>
                        </tr>
                        <tr className="!text-center">
                            <th className={subHeaderCell}>L</th>
                            <th className={subHeaderCell}>P</th>
                            <th className={subHeaderCell}>MASUK</th>
                            <th className={subHeaderCell}>KELUAR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-100">
                        {(rows || []).map((row, i) => (
                            <tr key={i} className="text-center group hover:bg-slate-50 transition-colors">
                                <td className="border-r border-slate-200 text-center">
                                    <button onClick={() => removeRow(i)} className="p-1.5 text-slate-400 hover:text-black transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                                <td className="p-0 border-r border-slate-200 min-w-[150px]"><textarea id={`siswa-${i}-0`} className={`${cellInput} text-left px-3 py-3 resize-none whitespace-normal break-words`} value={row.kelas || ''} onChange={e => update(i, 'kelas', e.target.value)} onKeyDown={e => handleArrow(e, i, 0)} placeholder="KELAS..." /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`siswa-${i}-1`} type="number" className={cellInput} value={row.jumlah_rombel || ''} onWheel={e => e.currentTarget.blur()} onChange={e => update(i, 'jumlah_rombel', e.target.value === '' ? null : Number(e.target.value))} onKeyDown={e => handleArrow(e, i, 1)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`siswa-${i}-2`} type="number" className={cellInput} value={row.jumlah_lk || ''} onWheel={e => e.currentTarget.blur()} onChange={e => update(i, 'jumlah_lk', e.target.value === '' ? null : Number(e.target.value))} onKeyDown={e => handleArrow(e, i, 2)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`siswa-${i}-3`} type="number" className={cellInput} value={row.jumlah_pr || ''} onWheel={e => e.currentTarget.blur()} onChange={e => update(i, 'jumlah_pr', e.target.value === '' ? null : Number(e.target.value))} onKeyDown={e => handleArrow(e, i, 3)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`siswa-${i}-4`} type="number" className={cellInput} value={row.mutasi_masuk || ''} onWheel={e => e.currentTarget.blur()} onChange={e => update(i, 'mutasi_masuk', e.target.value === '' ? null : Number(e.target.value))} onKeyDown={e => handleArrow(e, i, 4)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`siswa-${i}-5`} type="number" className={cellInput} value={row.mutasi_keluar || ''} onWheel={e => e.currentTarget.blur()} onChange={e => update(i, 'mutasi_keluar', e.target.value === '' ? null : Number(e.target.value))} onKeyDown={e => handleArrow(e, i, 5)} /></td>
                                <td className="p-0"><textarea id={`siswa-${i}-6`} className={`${cellInput} text-left px-3 py-3 resize-y whitespace-normal break-words underline-offset-4`} value={row.keterangan || ''} onChange={e => update(i, 'keterangan', e.target.value)} onKeyDown={e => handleArrow(e, i, 6)} placeholder="..." /></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-50 text-black font-black text-sm border-t-2 border-slate-300 uppercase">
                            <td colSpan={3} className="p-3 text-right tracking-tight px-6 border-r border-slate-300">TOTAL KESELURUHAN</td>
                            <td className="p-3 border-r border-slate-300 bg-white text-center font-bold text-sm">{rows?.reduce((sum, r) => sum + (Number(r.jumlah_lk) || 0), 0) || ''}</td>
                            <td className="p-3 border-r border-slate-300 bg-white text-center font-bold text-sm">{rows?.reduce((sum, r) => sum + (Number(r.jumlah_pr) || 0), 0) || ''}</td>
                            <td className="p-3 border-r border-slate-300 bg-white text-center font-bold text-sm">{rows?.reduce((sum, r) => sum + (Number(r.mutasi_masuk) || 0), 0) || ''}</td>
                            <td className="p-3 border-r border-slate-300 bg-white text-center font-bold text-sm">{rows?.reduce((sum, r) => sum + (Number(r.mutasi_keluar) || 0), 0) || ''}</td>
                            <td className="p-3 bg-slate-50 text-black font-black text-lg text-center border-l-2 border-slate-900">
                                {rows?.reduce((sum, r) => sum + ((Number(r.jumlah_lk || 0) + Number(r.jumlah_pr || 0) + Number(r.mutasi_masuk || 0)) - Number(r.mutasi_keluar || 0)), 0) || ''}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div className="mt-4 flex justify-center">
                <Button onClick={addRow} variant="outline" className="px-8 py-3.5 border-2 border-slate-900 font-black tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all rounded-xl shadow-md" icon={<Plus size={18} />}>
                    TAMBAH BARIS KELAS BARU
                </Button>
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

    const addRow = () => {
        onChange([...(rows || []), { keadaan: '', jumlah_lk: null, jumlah_pr: null, mutasi_masuk: null, mutasi_keluar: null, keterangan: '' }]);
    };

    const removeRow = (idx: number) => {
        const nr = [...(rows || [])];
        nr.splice(idx, 1);
        onChange(nr);
    };

    const handleArrow = (e: React.KeyboardEvent, r: number, c: number) => {
        const fields = ['keadaan', 'jumlah_lk', 'jumlah_pr', 'mutasi_masuk', 'mutasi_keluar', 'keterangan'];
        let nr = r, nc = c;
        if (e.key === 'ArrowUp') nr--;
        else if (e.key === 'ArrowDown') nr++;
        else if (e.key === 'ArrowLeft') nc--;
        else if (e.key === 'ArrowRight') nc++;
        else return;

        if (nr >= 0 && nr < (rows?.length || 0) && nc >= 0 && nc < fields.length) {
            e.preventDefault();
            document.getElementById(`rekap-${nr}-${nc}`)?.focus();
        }
    };

    return (
        <Card title="TABEL REKAP PERSONAL">
            <div className="overflow-x-auto border-2 border-slate-900 rounded-[1.5rem] overflow-hidden bg-white">
                <table className="w-full">
                    <thead>
                        <tr className="!text-center">
                            <th rowSpan={2} className="w-10 bg-slate-50 border-r border-b-2 border-slate-200 !text-center"></th>
                            <th rowSpan={2} className={headerCell}>KEADAAN</th>
                            <th colSpan={2} className={headerCell}>JUMLAH</th>
                            <th colSpan={2} className={headerCell}>MUTASI</th>
                            <th rowSpan={2} className={headerCell}>KETERANGAN</th>
                        </tr>
                        <tr className="!text-center">
                            <th className={subHeaderCell}>L</th>
                            <th className={subHeaderCell}>P</th>
                            <th className={subHeaderCell}>MASUK</th>
                            <th className={subHeaderCell}>KELUAR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-100">
                        {(rows || []).map((row, i) => (
                            <tr key={i} className="text-center group hover:bg-slate-50 transition-colors">
                                <td className="border-r border-slate-200 text-center">
                                    <button onClick={() => removeRow(i)} className="p-1.5 text-slate-400 hover:text-black transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                                <td className="p-0 border-r border-slate-200 min-w-[200px]"><textarea id={`rekap-${i}-0`} className={`${cellInput} text-left px-3 py-3 resize-none whitespace-normal break-words underline decoration-slate-100 underline-offset-4`} value={row.keadaan || ''} onChange={e => update(i, 'keadaan', e.target.value)} onKeyDown={e => handleArrow(e, i, 0)} placeholder="KATEGORI..." /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`rekap-${i}-1`} type="number" className={cellInput} onWheel={e => e.currentTarget.blur()} value={row.jumlah_lk || ''} onChange={e => update(i, 'jumlah_lk', e.target.value === '' ? null : Number(e.target.value))} onKeyDown={e => handleArrow(e, i, 1)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`rekap-${i}-2`} type="number" className={cellInput} onWheel={e => e.currentTarget.blur()} value={row.jumlah_pr || ''} onChange={e => update(i, 'jumlah_pr', e.target.value === '' ? null : Number(e.target.value))} onKeyDown={e => handleArrow(e, i, 2)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`rekap-${i}-3`} type="number" className={cellInput} onWheel={e => e.currentTarget.blur()} value={row.mutasi_masuk || ''} onChange={e => update(i, 'mutasi_masuk', e.target.value === '' ? null : Number(e.target.value))} onKeyDown={e => handleArrow(e, i, 3)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`rekap-${i}-4`} type="number" className={cellInput} onWheel={e => e.currentTarget.blur()} value={row.mutasi_keluar || ''} onChange={e => update(i, 'mutasi_keluar', e.target.value === '' ? null : Number(e.target.value))} onKeyDown={e => handleArrow(e, i, 4)} /></td>
                                <td className="p-0"><textarea id={`rekap-${i}-5`} className={`${cellInput} text-left px-3 py-3 resize-y whitespace-normal break-words`} value={row.keterangan || ''} onChange={e => update(i, 'keterangan', e.target.value)} onKeyDown={e => handleArrow(e, i, 5)} placeholder="..." /></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-50 text-black font-black text-sm border-t-2 border-slate-300 text-center uppercase">
                            <td colSpan={2} className="p-3 text-right tracking-tight px-6 border-r border-slate-300">TOTAL KESELURUHAN</td>
                            <td className="p-3 border-r border-slate-300 bg-white text-center font-bold text-sm">{rows?.reduce((sum, r) => sum + (Number(r.jumlah_lk) || 0), 0) || ''}</td>
                            <td className="p-3 border-r border-slate-300 bg-white text-center font-bold text-sm">{rows?.reduce((sum, r) => sum + (Number(r.jumlah_pr) || 0), 0) || ''}</td>
                            <td className="p-3 border-r border-slate-300 bg-white text-center font-bold text-sm">{rows?.reduce((sum, r) => sum + (Number(r.mutasi_masuk) || 0), 0) || ''}</td>
                            <td className="p-3 border-r border-slate-300 bg-white text-center font-bold text-sm">{rows?.reduce((sum, r) => sum + (Number(r.mutasi_keluar) || 0), 0) || ''}</td>
                            <td className="p-3 bg-slate-50 text-black text-lg font-black border-l-2 border-slate-900">
                                {rows?.reduce((sum, r) => sum + ((Number(r.jumlah_lk || 0) + Number(r.jumlah_pr || 0) + Number(r.mutasi_masuk || 0)) - Number(r.mutasi_keluar || 0)), 0) || ''}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div className="mt-4 flex justify-center">
                <Button onClick={addRow} variant="outline" className="px-8 py-3.5 border-2 border-slate-900 font-black tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all rounded-xl shadow-md" icon={<Plus size={18} />}>
                    TAMBAH BARIS REKAP BARU
                </Button>
            </div>
        </Card>
    );
}

function DetailGuruForm({ rows, onChange }: { rows: any[], onChange: (d: any[]) => void }) {
    const update = (idx: number, field: string, val: any) => {
        const nr = [...(rows || [])];
        nr[idx] = { ...nr[idx], [field]: val };
        onChange(nr);
    };

    const addRow = () => {
        onChange([...(rows || []), { nama_guru: '', mutasi_status: 'aktif' }]);
    };

    const removeRow = (idx: number) => {
        const nr = [...(rows || [])];
        nr.splice(idx, 1);
        onChange(nr);
    };

    return (
        <Card title="TABEL DETAIL GURU (data_guru)">
            <div className="overflow-x-auto border-2 border-slate-900 rounded-[1.5rem] overflow-hidden bg-white shadow-sm">
                <table className="w-full text-black border-collapse">
                    <thead>
                        <tr>
                            <th className="w-10 bg-slate-50 border-r border-b-2 border-slate-200"></th>
                            <th className={headerCell}>NAMA LENGKAP</th>
                            <th className={headerCell}>NIP/NIK</th>
                            <th className={headerCell}>LP</th>
                            <th className={headerCell}>TEMPAT LAHIR</th>
                            <th className={headerCell}>TGL LAHIR</th>
                            <th className={headerCell}>ST PEG</th>
                            <th className={headerCell}>PEND</th>
                            <th className={headerCell}>JURUSAN</th>
                            <th className={headerCell}>GOL</th>
                            <th className={headerCell}>TMT GURU</th>
                            <th className={headerCell}>TMT MADRASAH</th>
                            <th className={headerCell}>MAPEL</th>
                            <th className={headerCell}>SATMINKAL</th>
                            <th className={headerCell}>JAM</th>
                            <th className={headerCell}>JABATAN</th>
                            <th className={headerCell}>IBU</th>
                            <th className={headerCell}>SERTI</th>
                            <th className={headerCell}>MUTASI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(rows || []).map((row, i) => (
                            <tr key={i} className="font-bold group hover:bg-slate-50 transition-colors">
                                <td className="border-r border-slate-200 text-center">
                                    <button onClick={() => removeRow(i)} className="p-1.5 text-slate-400 hover:text-black transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                                <td className="p-0 border-r border-slate-200 min-w-[200px]"><textarea className={`${cellInput} text-left px-2 py-3 resize-none whitespace-normal break-words`} value={row.nama_guru} onChange={e => update(i, 'nama_guru', e.target.value)} placeholder="NAMA..." /></td>
                                <td className="p-0 border-r border-slate-200 w-32"><input className={cellInput} value={row.nip_nik} onChange={e => update(i, 'nip_nik', e.target.value)} placeholder="..." /></td>
                                <td className="p-0 border-r border-slate-200 w-12"><select className={cellInput} value={row.lp} onChange={e => update(i, 'lp', e.target.value)}><option value=""></option><option value="L">L</option><option value="P">P</option></select></td>
                                <td className="p-0 border-r border-slate-200 w-32"><input className={cellInput} value={row.tempat_lahir} onChange={e => update(i, 'tempat_lahir', e.target.value)} /></td>
                                <td className="p-0 border-r border-slate-200 w-32"><input type="date" className={cellInput} value={row.tanggal_lahir} onChange={e => update(i, 'tanggal_lahir', e.target.value)} /></td>
                                <td className="p-0 border-r border-slate-200 w-28"><input className={cellInput} value={row.status_pegawai} onChange={e => update(i, 'status_pegawai', e.target.value)} /></td>
                                <td className="p-0 border-r border-slate-200 w-16"><input className={cellInput} value={row.pendidikan_terakhir} onChange={e => update(i, 'pendidikan_terakhir', e.target.value)} /></td>
                                <td className="p-0 border-r border-slate-200 w-32"><input className={cellInput} value={row.jurusan} onChange={e => update(i, 'jurusan', e.target.value)} /></td>
                                <td className="p-0 border-r border-slate-200 w-16"><input className={cellInput} value={row.golongan} onChange={e => update(i, 'golongan', e.target.value)} /></td>
                                <td className="p-0 border-r border-slate-200 w-28"><input className={cellInput} value={row.tmt_mengajar} onChange={e => update(i, 'tmt_mengajar', e.target.value)} /></td>
                                <td className="p-0 border-r border-slate-200 w-28"><input className={cellInput} value={row.tmt_di_madrasah} onChange={e => update(i, 'tmt_di_madrasah', e.target.value)} /></td>
                                <td className="p-0 border-r border-slate-200 w-40"><input className={cellInput} value={row.mata_pelajaran} onChange={e => update(i, 'mata_pelajaran', e.target.value)} /></td>
                                <td className="p-0 border-r border-slate-200 w-40"><input className={cellInput} value={row.satminkal} onChange={e => update(i, 'satminkal', e.target.value)} /></td>
                                <td className="p-0 border-r border-slate-200 w-16"><input type="number" onWheel={e => e.currentTarget.blur()} className={cellInput} value={row.jumlah_jam ?? ''} onChange={e => update(i, 'jumlah_jam', e.target.value === '' ? null : Number(e.target.value))} /></td>
                                <td className="p-0 border-r border-slate-200 w-32"><input className={cellInput} value={row.jabatan} onChange={e => update(i, 'jabatan', e.target.value)} /></td>
                                <td className="p-0 border-r border-slate-200 w-32"><input className={cellInput} value={row.nama_ibu_kandung} onChange={e => update(i, 'nama_ibu_kandung', e.target.value)} /></td>
                                <td className="p-0 border-r border-slate-200 w-20"><select className={cellInput} value={row.sertifikasi ? '1' : '0'} onChange={e => update(i, 'sertifikasi', e.target.value === '1')}><option value="0">TIDAK</option><option value="1">YA</option></select></td>
                                <td className="p-0 w-20"><select className={cellInput} value={row.mutasi_status} onChange={e => update(i, 'mutasi_status', e.target.value)}><option value="aktif">AKTIF</option><option value="masuk">MASUK</option><option value="keluar">KELUAR</option></select></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-center">
                <Button onClick={addRow} variant="outline" className="px-8 py-3.5 border-2 border-slate-900 font-black tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all rounded-xl shadow-md" icon={<Plus size={18} />}>
                    TAMBAH BARIS GURU BARU
                </Button>
            </div>
        </Card>
    );
}

function SarprasForm({ rows, onChange }: { rows: any[], onChange: (d: any[]) => void }) {
    const update = (idx: number, field: string, val: any) => {
        const nr = [...(rows || [])];
        nr[idx] = { ...nr[idx], [field]: val };
        onChange(nr);
    };

    const addRow = () => {
        onChange([...(rows || []), { jenis_aset: '', luas: '', kondisi_baik: null, kondisi_rusak_ringan: null, kondisi_rusak_berat: null, kekurangan: null, perlu_rehab: null, keterangan: '' }]);
    };

    const removeRow = (idx: number) => {
        const nr = [...(rows || [])];
        nr.splice(idx, 1);
        onChange(nr);
    };

    return (
        <Card title="DATA SARANA PRASARANA (data_sarpras)">
            <div className="overflow-x-auto border-4 border-slate-900 rounded-[2.5rem] overflow-hidden bg-white">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="w-10 bg-slate-50 border-r border-b-2 border-slate-200"></th>
                            <th className={headerCell}>JENIS ASET</th>
                            <th className={headerCell}>LUAS</th>
                            <th className={subHeaderCell}>BAIK</th>
                            <th className={subHeaderCell}>RR</th>
                            <th className={subHeaderCell}>RB</th>
                            <th className={subHeaderCell}>KEKURANGAN</th>
                            <th className={subHeaderCell}>PERLU REHAB</th>
                            <th className={subHeaderCell}>KETERANGAN</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-slate-100">
                        {(rows || []).map((row, i) => (
                            <tr key={i} className="text-center group hover:bg-slate-50 transition-colors">
                                <td className="border-r border-slate-200 text-center">
                                    <button onClick={() => removeRow(i)} className="p-1.5 text-slate-400 hover:text-black transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                                <td className="p-0 border-r border-slate-200 min-w-[150px]"><textarea className={`${cellInput} text-left px-3 py-3 resize-none whitespace-normal break-words underline decoration-slate-100 underline-offset-4`} value={row.jenis_aset || ''} onChange={e => update(i, 'jenis_aset', e.target.value)} placeholder="ASET..." /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input className={cellInput} value={row.luas} onChange={e => update(i, 'luas', e.target.value)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input type="number" onWheel={e => e.currentTarget.blur()} className={cellInput} value={row.kondisi_baik ?? ''} onChange={e => update(i, 'kondisi_baik', e.target.value === '' ? null : Number(e.target.value))} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input type="number" onWheel={e => e.currentTarget.blur()} className={cellInput} value={row.kondisi_rusak_ringan ?? ''} onChange={e => update(i, 'kondisi_rusak_ringan', e.target.value === '' ? null : Number(e.target.value))} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input type="number" onWheel={e => e.currentTarget.blur()} className={cellInput} value={row.kondisi_rusak_berat ?? ''} onChange={e => update(i, 'kondisi_rusak_berat', e.target.value === '' ? null : Number(e.target.value))} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input type="number" onWheel={e => e.currentTarget.blur()} className={cellInput} value={row.kekurangan ?? ''} onChange={e => update(i, 'kekurangan', e.target.value === '' ? null : Number(e.target.value))} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input type="number" onWheel={e => e.currentTarget.blur()} className={cellInput} value={row.perlu_rehab ?? ''} onChange={e => update(i, 'perlu_rehab', e.target.value === '' ? null : Number(e.target.value))} /></td>
                                <td className="p-0"><textarea className={`${cellInput} text-left px-3 py-3 resize-y whitespace-normal break-words`} value={row.keterangan || ''} onChange={e => update(i, 'keterangan', e.target.value)} placeholder="..." /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-center">
                <Button onClick={addRow} variant="outline" className="px-8 py-3.5 border-2 border-slate-900 font-black tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all rounded-xl shadow-md" icon={<Plus size={18} />}>
                    TAMBAH BARIS SARPRAS BARU
                </Button>
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

    const addRow = () => {
        onChange([...(rows || []), { nama_barang: '', jumlah_total: null, kondisi_baik: null, kondisi_rusak_ringan: null, kondisi_rusak_berat: null, kekurangan: null, keterangan: '' }]);
    };

    const removeRow = (idx: number) => {
        const nr = [...(rows || [])];
        nr.splice(idx, 1);
        onChange(nr);
    };

    return (
        <Card title="TABEL DATA MOBILER (data_mobiler)">
            <div className="overflow-x-auto border-2 border-slate-900 rounded-[1.5rem] overflow-hidden bg-white shadow-sm">
                <table className="w-full text-black">
                    <thead>
                        <tr>
                            <th className="w-10 bg-slate-50 border-r border-b-2 border-slate-200"></th>
                            <th className={headerCell}>NAMA BARANG</th>
                            <th className={headerCell}>JML TOTAL</th>
                            <th className={subHeaderCell}>BAIK</th>
                            <th className={subHeaderCell}>RR</th>
                            <th className={subHeaderCell}>RB</th>
                            <th className={subHeaderCell}>KEKURANGAN</th>
                            <th className={subHeaderCell}>KETERANGAN</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-slate-100">
                        {(rows || []).map((row, i) => (
                            <tr key={i} className="text-center group hover:bg-slate-50 transition-colors">
                                <td className="border-r border-slate-200 text-center">
                                    <button onClick={() => removeRow(i)} className="p-1.5 text-slate-400 hover:text-black transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                                <td className="p-0 border-r border-slate-200 min-w-[200px]"><textarea className={`${cellInput} text-left px-3 py-3 resize-none whitespace-normal break-words underline decoration-slate-100 underline-offset-4`} value={row.nama_barang || ''} onChange={e => update(i, 'nama_barang', e.target.value)} placeholder="BARANG..." /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input type="number" onWheel={e => e.currentTarget.blur()} className={cellInput} value={row.jumlah_total ?? ''} onChange={e => update(i, 'jumlah_total', e.target.value === '' ? null : Number(e.target.value))} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input type="number" onWheel={e => e.currentTarget.blur()} className={cellInput} value={row.kondisi_baik ?? ''} onChange={e => update(i, 'kondisi_baik', e.target.value === '' ? null : Number(e.target.value))} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input type="number" onWheel={e => e.currentTarget.blur()} className={cellInput} value={row.kondisi_rusak_ringan ?? ''} onChange={e => update(i, 'kondisi_rusak_ringan', e.target.value === '' ? null : Number(e.target.value))} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input type="number" onWheel={e => e.currentTarget.blur()} className={cellInput} value={row.kondisi_rusak_berat ?? ''} onChange={e => update(i, 'kondisi_rusak_berat', e.target.value === '' ? null : Number(e.target.value))} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input type="number" onWheel={e => e.currentTarget.blur()} className={cellInput} value={row.kekurangan ?? ''} onChange={e => update(i, 'kekurangan', e.target.value === '' ? null : Number(e.target.value))} /></td>
                                <td className="p-0"><textarea className={`${cellInput} text-left px-3 py-3 resize-y whitespace-normal break-words underline-offset-4`} value={row.keterangan || ''} onChange={e => update(i, 'keterangan', e.target.value)} placeholder="..." /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-center">
                <Button onClick={addRow} variant="outline" className="px-8 py-3.5 border-2 border-slate-900 font-black tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all rounded-xl shadow-md" icon={<Plus size={18} />}>
                    TAMBAH BARIS MOBILER BARU
                </Button>
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

    const addRow = () => {
        onChange([...(rows || []), { uraian_kegiatan: '', volume: null, satuan: '', harga_satuan: null }]);
    };

    const removeRow = (idx: number) => {
        const nr = [...(rows || [])];
        nr.splice(idx, 1);
        onChange(nr);
    };

    const handleArrow = (e: React.KeyboardEvent, r: number, c: number) => {
        const fields = ['uraian_kegiatan', 'volume', 'satuan', 'harga_satuan'];
        let nr = r, nc = c;
        if (e.key === 'ArrowUp') nr--;
        else if (e.key === 'ArrowDown') nr++;
        else if (e.key === 'ArrowLeft') nc--;
        else if (e.key === 'ArrowRight') nc++;
        else return;

        if (nr >= 0 && nr < (rows?.length || 0) && nc >= 0 && nc < fields.length) {
            e.preventDefault();
            document.getElementById(`keu-${nr}-${nc}`)?.focus();
        }
    };

    return (
        <Card title="TABEL DATA KEUANGAN">
            <div className="overflow-x-auto border-2 border-slate-900 rounded-[1.5rem] overflow-hidden bg-white shadow-sm">
                <table className="w-full text-black">
                    <thead>
                        <tr className="text-center">
                            <th className={headerCell}>URAIAN KEGIATAN</th>
                            <th className={headerCell}>VOLUME</th>
                            <th className={headerCell}>SATUAN</th>
                            <th className={headerCell}>HARGA SATUAN</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-100">
                        {(rows || []).map((row, i) => (
                            <tr key={i} className="text-center group hover:bg-slate-50">
                                <td className="border-r border-slate-200 text-center">
                                    <button onClick={() => removeRow(i)} className="p-1.5 text-slate-400 hover:text-black transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                                <td className="p-0 border-r border-slate-200 min-w-[200px]"><textarea id={`keu-${i}-0`} className={`${cellInput} text-left px-3 py-3 resize-none whitespace-normal break-words underline decoration-slate-100 underline-offset-4`} value={row.uraian_kegiatan || ''} onChange={e => update(i, 'uraian_kegiatan', e.target.value)} onKeyDown={e => handleArrow(e, i, 0)} placeholder="URAIAN..." /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`keu-${i}-1`} type="number" onWheel={e => e.currentTarget.blur()} className={cellInput} value={row.volume || ''} onChange={e => update(i, 'volume', e.target.value === '' ? null : Number(e.target.value))} onKeyDown={e => handleArrow(e, i, 1)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`keu-${i}-2`} className={cellInput} value={row.satuan || ''} onChange={e => update(i, 'satuan', e.target.value)} onKeyDown={e => handleArrow(e, i, 2)} /></td>
                                <td className="p-0 border-r border-slate-200 min-w-[150px]"><input id={`keu-${i}-3`} type="number" onWheel={e => e.currentTarget.blur()} className={cellInput} value={row.harga_satuan || ''} onChange={e => update(i, 'harga_satuan', e.target.value === '' ? null : Number(e.target.value))} onKeyDown={e => handleArrow(e, i, 3)} /></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-50 text-black font-black text-lg border-t-2 border-slate-300">
                            <td colSpan={4} className="p-4 text-right uppercase tracking-tight text-sm italic border-r-2 border-slate-900">TOTAL ANGGARAN BULANAN</td>
                            <td className="p-4 bg-white text-black text-center font-black text-xl">
                                Rp {rows?.reduce((sum, r) => sum + (Number(r.volume || 0) * Number(r.harga_satuan || 0)), 0).toLocaleString('id-ID')}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div className="mt-4 flex justify-center">
                <Button onClick={addRow} variant="outline" className="px-8 py-3.5 border-2 border-slate-900 font-black tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all rounded-xl shadow-md" icon={<Plus size={18} />}>
                    TAMBAH BARIS KEGIATAN BARU
                </Button>
            </div>
        </Card>
    );
}
