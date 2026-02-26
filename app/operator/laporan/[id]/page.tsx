'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Save, Send, ArrowLeft, Users, Building, Coins, Loader2, CheckCircle2, AlertCircle, FileText, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';

export default function LaporanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('siswa');
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isRevisionExpanded, setIsRevisionExpanded] = useState(false);

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
        const errors: string[] = [];
        try {
            // Gunakan sequential saving (satu per satu) untuk menghindari overload server/DB locking
            // dan untuk memastikan kita tahu bagian mana yang gagal.

            const resSiswa = await api.operator.updateSiswa(id, reportData.siswa);
            if (!resSiswa?.ok) errors.push('Siswa');

            const resRekap = await api.operator.updateRekapPersonal(id, reportData.rekap_personal);
            if (!resRekap?.ok) errors.push('Rekap Personal');

            const resGuru = await api.operator.updateGuru(id, reportData.guru);
            if (!resGuru?.ok) errors.push('Guru');

            const resSarpras = await api.operator.updateSarpras(id, reportData.sarpras);
            if (!resSarpras?.ok) errors.push('Sarpras');

            const resMobiler = await api.operator.updateMobiler(id, reportData.mobiler);
            if (!resMobiler?.ok) errors.push('Mobiler');

            const resKeuangan = await api.operator.updateKeuangan(id, reportData.keuangan);
            if (!resKeuangan?.ok) errors.push('Keuangan');

            if (errors.length === 0) {
                alert('SEMUA DATA BERHASIL DISIMPAN!');
            } else {
                alert(`Gagal menyimpan bagian: ${errors.join(', ')}. Silakan periksa data atau koneksi.`);
            }
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Terjadi kesalahan koneksi fatal saat menyimpan.');
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
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 animate-fade-in">
                <Loader2 className="animate-spin text-emerald-700" size={64} />
                <p className="font-black text-slate-900 uppercase tracking-widest text-sm">Sinkronisasi Data Database...</p>
            </div>
        );
    }

    const formatBulan = (dateStr: string) => {
        if (!dateStr) return 'LAPORAN';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
    };

    return (
        <div className="space-y-10 pb-20 animate-fade-in">
            {/* Header Sticky & Standardized */}
            <div className="bg-white border-[3px] border-slate-900 p-8 relative z-20 shadow-[6px_6px_0_0_#0f172a] rounded-[2rem] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex items-center gap-5 w-full xl:w-auto">
                    <Link href="/operator/laporan">
                        <Button variant="outline" size="sm" className="!h-12 !w-12 !p-0 rounded-2xl">
                            <ArrowLeft size={24} />
                        </Button>
                    </Link>
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl border-2 border-blue-100 flex items-center justify-center shrink-0">
                        <FileText className="text-blue-700" size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest
                                ${reportData?.status_laporan === 'verified' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                                    reportData?.status_laporan === 'revisi' ? 'bg-rose-100 text-rose-900 border-rose-300' :
                                        'bg-amber-100 text-amber-900 border-amber-300'}`}>
                                {reportData?.status_laporan}
                            </span>
                        </div>
                        <h2 className="leading-none mb-1">
                            {formatBulan(reportData?.bulan_tahun)}
                        </h2>
                        <p className="text-muted text-[10px] uppercase tracking-widest">
                            PERIODE LAPORAN BULANAN
                        </p>
                    </div>
                </div>

                <div className="flex flex-row gap-4 w-full xl:w-auto">
                    <Button
                        variant="outline"
                        className="flex-1 xl:w-48 !border-emerald-600 !text-emerald-700 hover:!bg-emerald-50"
                        icon={<Save size={20} />}
                        onClick={handleSaveSection}
                        isLoading={isSaving}
                        disabled={reportData?.status_laporan !== 'draft' && reportData?.status_laporan !== 'revisi'}
                    >
                        SIMPAN DATA
                    </Button>
                    <Button
                        variant="primary"
                        className="flex-1 xl:w-56 shadow-xl"
                        icon={<Send size={20} />}
                        onClick={handleSubmit}
                        disabled={reportData?.status_laporan !== 'draft' && reportData?.status_laporan !== 'revisi'}
                    >
                        KIRIM LAPORAN
                    </Button>
                </div>
            </div>

            {/* Alert Revisi (Compact Version) */}
            {/* Alert Revisi (Collapsible Dropdown Version) */}
            {reportData?.status_laporan === 'revisi' && (
                <div className="bg-rose-50 border-[3px] border-rose-100 rounded-[2.5rem] shadow-sm relative overflow-hidden transition-all duration-300">
                    <button
                        onClick={() => setIsRevisionExpanded(!isRevisionExpanded)}
                        className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-rose-100/50 transition-colors text-left group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 ${isRevisionExpanded ? 'bg-rose-600 text-white shadow-rose-200' : 'bg-white text-rose-600 border-2 border-rose-100'}`}>
                                <AlertCircle size={28} />
                            </div>
                            <div>
                                <h3 className="font-black text-rose-900 uppercase tracking-tighter text-lg md:text-xl group-hover:text-rose-700 transition-colors">
                                    Laporan Perlu Perbaikan
                                </h3>
                                <p className="text-rose-400 text-xs font-black uppercase tracking-widest mt-1">
                                    {isRevisionExpanded ? 'Sembunyikan detail revisi' : 'Klik untuk melihat pesan validator'}
                                </p>
                            </div>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-rose-200 text-rose-400 transition-transform duration-300 ${isRevisionExpanded ? 'rotate-180 bg-rose-200 text-rose-700' : 'bg-white'}`}>
                            <ChevronDown size={20} />
                        </div>
                    </button>

                    {isRevisionExpanded && (
                        <div className="px-6 md:px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                            <div className="border-t-2 border-rose-100 my-4" />
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Catatan Validator */}
                                <div className="bg-white p-6 rounded-3xl border-2 border-rose-100 shadow-sm relative group hover:border-rose-300 transition-all">
                                    <div className="absolute -top-3 left-6 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-200">
                                        Pesan Validator
                                    </div>
                                    <p className="text-slate-700 font-bold text-lg italic leading-relaxed pt-2">
                                        "{reportData?.catatan_revisi || 'Validator tidak memberikan catatan spesifik.'}"
                                    </p>
                                </div>

                                {/* Langkah Perbaikan */}
                                <div className="bg-rose-900 p-6 rounded-3xl border-2 border-rose-800 shadow-sm text-rose-50">
                                    <h4 className="font-black uppercase tracking-widest text-xs mb-4 text-rose-200 flex items-center gap-2">
                                        <CheckCircle2 size={14} /> Langkah Perbaikan
                                    </h4>
                                    <ul className="space-y-3 text-xs font-bold opacity-90">
                                        <li className="flex gap-3">
                                            <span className="w-5 h-5 bg-rose-800 rounded-full flex items-center justify-center text-[10px] shrink-0">1</span>
                                            <span>Perbaiki data pada tab yang sesuai.</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="w-5 h-5 bg-rose-800 rounded-full flex items-center justify-center text-[10px] shrink-0">2</span>
                                            <span>Jangan lupa klik "SIMPAN".</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="w-5 h-5 bg-rose-800 rounded-full flex items-center justify-center text-[10px] shrink-0">3</span>
                                            <span>Klik "KIRIM LAPORAN" untuk mengajukan ulang.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Compact Custom Tabs (Sama dengan tampilan Admin) */}
            <div className="flex overflow-x-auto bg-slate-900 p-2 rounded-2xl gap-2 no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-8 py-4 font-black text-[10px] transition-all rounded-xl whitespace-nowrap uppercase tracking-widest
                        ${activeTab === tab.id ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        {tab.icon && React.isValidElement(tab.icon) ? React.cloneElement(tab.icon as any, { size: 14 }) : tab.icon}
                        <span>{tab.label}</span>
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
const cellInput = "w-full h-full py-5 px-3 text-center font-bold text-sm outline-none focus:bg-slate-50 transition-all placeholder:text-slate-400 text-slate-900 bg-transparent min-h-[60px] border-none";
const headerCell = "bg-white text-slate-900 font-black uppercase text-[11px] tracking-[0.15em] p-5 border-r-2 border-slate-900 align-middle text-center border-b-2";
const subHeaderCell = "bg-white text-slate-500 font-black uppercase text-[10px] tracking-widest p-4 border-r-2 border-slate-900 align-middle text-center border-b-2";

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
        const fieldsCount = 7;
        const target = e.target as any;
        let start = 0, end = 0;
        try { start = target.selectionStart || 0; end = target.selectionEnd || 0; } catch { }
        const valLen = target.value?.toString().length || 0;
        let nr = r, nc = c;

        if (e.key === 'ArrowUp') nr--;
        else if (e.key === 'ArrowDown') nr++;
        else if (e.key === 'ArrowLeft') {
            if (start > 0) return;
            nc--;
            if (nc < 0 && nr > 0) { nr--; nc = fieldsCount - 1; }
            else if (nc < 0) return;
        } else if (e.key === 'ArrowRight') {
            if (end < valLen) return;
            nc++;
            if (nc >= fieldsCount && nr < (rows?.length || 0) - 1) { nr++; nc = 0; }
            else if (nc >= fieldsCount) return;
        } else return;

        if (nr >= 0 && nr < (rows?.length || 0) && nc >= 0 && nc < fieldsCount) {
            e.preventDefault();
            const el = document.getElementById(`siswa-${nr}-${nc}`) as any;
            if (el) {
                el.focus();
                try {
                    const len = el.value?.toString().length || 0;
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') el.setSelectionRange(0, 0);
                    else el.setSelectionRange(len, len);
                } catch { }
            }
        }
    };

    return (
        <Card title="REKAPITULASI DATA SISWA">
            <div className="table-container-simple">
                <table className="w-full">
                    <thead>
                        <tr className="!text-center">
                            <th rowSpan={2} className="w-10 border-r-2 border-b-2 border-slate-900"></th>
                            <th rowSpan={2} className={headerCell}>KELAS</th>
                            <th rowSpan={2} className={headerCell}>ROMBEL</th>
                            <th colSpan={2} className={headerCell}>JUMLAH SISWA</th>
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
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`siswa-${i}-1`} type="text" inputMode="decimal" className={cellInput} value={row.jumlah_rombel || ''} onFocus={e => e.target.select()} onChange={e => update(i, 'jumlah_rombel', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 1)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`siswa-${i}-2`} type="text" inputMode="decimal" className={cellInput} value={row.jumlah_lk || ''} onFocus={e => e.target.select()} onChange={e => update(i, 'jumlah_lk', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 2)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`siswa-${i}-3`} type="text" inputMode="decimal" className={cellInput} value={row.jumlah_pr || ''} onFocus={e => e.target.select()} onChange={e => update(i, 'jumlah_pr', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 3)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`siswa-${i}-4`} type="text" inputMode="decimal" className={cellInput} value={row.mutasi_masuk || ''} onFocus={e => e.target.select()} onChange={e => update(i, 'mutasi_masuk', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 4)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`siswa-${i}-5`} type="text" inputMode="decimal" className={cellInput} value={row.mutasi_keluar || ''} onFocus={e => e.target.select()} onChange={e => update(i, 'mutasi_keluar', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 5)} /></td>
                                <td className="p-0"><textarea id={`siswa-${i}-6`} className={`${cellInput} text-left px-3 py-3 resize-y whitespace-normal break-words underline-offset-4`} value={row.keterangan || ''} onChange={e => update(i, 'keterangan', e.target.value)} onKeyDown={e => handleArrow(e, i, 6)} placeholder="..." /></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-white text-slate-900 font-black text-xs border-t-2 border-slate-900 uppercase">
                            <td colSpan={3} className="p-4 text-right px-6 border-r-2 border-slate-900">JUMLAH KESELURUHAN</td>
                            <td className="p-4 border-r border-slate-200 text-center font-black">{rows?.reduce((sum, r) => sum + (Number(r.jumlah_lk) || 0), 0) || '0'}</td>
                            <td className="p-4 border-r border-slate-200 text-center font-black">{rows?.reduce((sum, r) => sum + (Number(r.jumlah_pr) || 0), 0) || '0'}</td>
                            <td className="p-4 border-r border-slate-200 text-center font-black">{rows?.reduce((sum, r) => sum + (Number(r.mutasi_masuk) || 0), 0) || '0'}</td>
                            <td className="p-4 border-r border-slate-200 text-center font-black">{rows?.reduce((sum, r) => sum + (Number(r.mutasi_keluar) || 0), 0) || '0'}</td>
                            <td className="p-4 font-black text-xl text-center italic border-l-2 border-slate-900">
                                {rows?.reduce((sum, r) => sum + ((Number(r.jumlah_lk || 0) + Number(r.jumlah_pr || 0) + Number(r.mutasi_masuk || 0)) - Number(r.mutasi_keluar || 0)), 0) || '0'}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div className="mt-8 flex justify-center">
                <Button onClick={addRow} variant="outline" className="px-8 py-3.5 border-2 border-slate-900 font-black tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all rounded-xl shadow-md" icon={<Plus size={18} />}>
                    TAMBAH BARIS KELAS
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
        const fieldsCount = 6;
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        let start = 0, end = 0;
        try { start = target.selectionStart || 0; end = target.selectionEnd || 0; } catch { }
        const valLen = target.value?.toString().length || 0;
        let nr = r, nc = c;

        if (e.key === 'ArrowUp') nr--;
        else if (e.key === 'ArrowDown') nr++;
        else if (e.key === 'ArrowLeft') {
            if (start > 0) return;
            nc--;
            if (nc < 0 && nr > 0) { nr--; nc = fieldsCount - 1; }
            else if (nc < 0) return;
        } else if (e.key === 'ArrowRight') {
            if (end < valLen) return;
            nc++;
            if (nc >= fieldsCount && nr < (rows?.length || 0) - 1) { nr++; nc = 0; }
            else if (nc >= fieldsCount) return;
        } else return;

        if (nr >= 0 && nr < (rows?.length || 0) && nc >= 0 && nc < fieldsCount) {
            e.preventDefault();
            const el = document.getElementById(`rekap-${nr}-${nc}`) as any;
            if (el) {
                el.focus();
                try {
                    const len = el.value?.toString().length || 0;
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') el.setSelectionRange(0, 0);
                    else el.setSelectionRange(len, len);
                } catch { }
            }
        }
    };

    return (
        <Card title="REKAP PERSONAL (SECTION B)">
            <div className="table-container-simple">
                <table className="w-full">
                    <thead>
                        <tr className="!text-center">
                            <th rowSpan={2} className="w-10 border-r-2 border-b-2 border-slate-900"></th>
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
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`rekap-${i}-1`} type="text" inputMode="decimal" className={cellInput} onFocus={e => e.target.select()} value={row.jumlah_lk || ''} onChange={e => update(i, 'jumlah_lk', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 1)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`rekap-${i}-2`} type="text" inputMode="decimal" className={cellInput} onFocus={e => e.target.select()} value={row.jumlah_pr || ''} onChange={e => update(i, 'jumlah_pr', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 2)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`rekap-${i}-3`} type="text" inputMode="decimal" className={cellInput} onFocus={e => e.target.select()} value={row.mutasi_masuk || ''} onChange={e => update(i, 'mutasi_masuk', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 3)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`rekap-${i}-4`} type="text" inputMode="decimal" className={cellInput} onFocus={e => e.target.select()} value={row.mutasi_keluar || ''} onChange={e => update(i, 'mutasi_keluar', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 4)} /></td>
                                <td className="p-0"><textarea id={`rekap-${i}-5`} className={`${cellInput} text-left px-3 py-3 resize-y whitespace-normal break-words`} value={row.keterangan || ''} onChange={e => update(i, 'keterangan', e.target.value)} onKeyDown={e => handleArrow(e, i, 5)} placeholder="..." /></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-white text-slate-900 font-black text-xs border-t-2 border-slate-900 text-center uppercase">
                            <td colSpan={2} className="p-4 text-right px-6 border-r-2 border-slate-900">JUMLAH KESELURUHAN</td>
                            <td className="p-4 border-r border-slate-200 text-center font-black">{rows?.reduce((sum, r) => sum + (Number(r.jumlah_lk) || 0), 0) || '0'}</td>
                            <td className="p-4 border-r border-slate-200 text-center font-black">{rows?.reduce((sum, r) => sum + (Number(r.jumlah_pr) || 0), 0) || '0'}</td>
                            <td className="p-4 border-r border-slate-200 text-center font-black">{rows?.reduce((sum, r) => sum + (Number(r.mutasi_masuk) || 0), 0) || '0'}</td>
                            <td className="p-4 border-r border-slate-200 text-center font-black">{rows?.reduce((sum, r) => sum + (Number(r.mutasi_keluar) || 0), 0) || '0'}</td>
                            <td className="p-4 font-black text-xl italic border-l-2 border-slate-900">
                                {rows?.reduce((sum, r) => sum + ((Number(r.jumlah_lk || 0) + Number(r.jumlah_pr || 0) + Number(r.mutasi_masuk || 0)) - Number(r.mutasi_keluar || 0)), 0) || '0'}
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

    const handleArrow = (e: React.KeyboardEvent, r: number, c: number) => {
        const fieldsCount = 18;
        const target = e.target as any;
        let start = 0, end = 0;
        try { start = target.selectionStart || 0; end = target.selectionEnd || 0; } catch { }
        const valLen = target.value?.toString().length || 0;
        let nr = r, nc = c;

        if (e.key === 'ArrowUp') nr--;
        else if (e.key === 'ArrowDown') nr++;
        else if (e.key === 'ArrowLeft') {
            if (start > 0) return;
            nc--;
            if (nc < 0 && nr > 0) { nr--; nc = fieldsCount - 1; }
            else if (nc < 0) return;
        } else if (e.key === 'ArrowRight') {
            if (end < valLen) return;
            nc++;
            if (nc >= fieldsCount && nr < (rows?.length || 0) - 1) { nr++; nc = 0; }
            else if (nc >= fieldsCount) return;
        } else return;

        if (nr >= 0 && nr < (rows?.length || 0) && nc >= 0 && nc < fieldsCount) {
            e.preventDefault();
            const el = document.getElementById(`guru-${nr}-${nc}`) as any;
            if (el) {
                el.focus();
                try {
                    const len = el.value?.toString().length || 0;
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') el.setSelectionRange(0, 0);
                    else el.setSelectionRange(len, len);
                } catch { }
            }
        }
    };

    return (
        <Card title="DATA GURU & TENAGA KEPENDIDIKAN (SECTION F)">
            <div className="table-container-simple">
                <table className="min-w-[2800px] text-black border-collapse">
                    <thead>
                        <tr className="!text-center uppercase">
                            <th className="w-16 border-r-2 border-b-2 border-slate-900 !text-center"></th>
                            <th className={`${headerCell} min-w-[300px]`}>NAMA LENGKAP GURU</th>
                            <th className={`${headerCell} min-w-[250px]`}>NIP / NIK</th>
                            <th className={`${headerCell} min-w-[100px]`}>L / P</th>
                            <th className={`${headerCell} min-w-[200px]`}>TEMPAT LAHIR</th>
                            <th className={`${headerCell} min-w-[200px]`}>TANGGAL LAHIR</th>
                            <th className={`${headerCell} min-w-[200px]`}>STATUS PEGAWAI</th>
                            <th className={`${headerCell} min-w-[200px]`}>PENDIDIKAN</th>
                            <th className={`${headerCell} min-w-[250px]`}>JURUSAN</th>
                            <th className={`${headerCell} min-w-[140px]`}>GOLONGAN</th>
                            <th className={`${headerCell} min-w-[180px]`}>TMT GURU</th>
                            <th className={`${headerCell} min-w-[180px]`}>TMT MADRASAH</th>
                            <th className={`${headerCell} min-w-[250px]`}>MATA PELAJARAN</th>
                            <th className={`${headerCell} min-w-[250px]`}>SATMINKAL</th>
                            <th className={`${headerCell} min-w-[130px]`}>JAM</th>
                            <th className={`${headerCell} min-w-[200px]`}>JABATAN</th>
                            <th className={`${headerCell} min-w-[250px]`}>IBU KANDUNG</th>
                            <th className={`${headerCell} min-w-[140px]`}>SERTIFIKASI</th>
                            <th className={`${headerCell} min-w-[140px]`}>MUTASI</th>
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
                                <td className="p-0 border-r border-slate-200"><textarea id={`guru-${i}-0`} className={`${cellInput} !text-left px-4 py-3 resize-none whitespace-normal break-words underline decoration-slate-100 underline-offset-4`} value={row.nama_guru || ''} onChange={e => update(i, 'nama_guru', e.target.value)} onKeyDown={e => handleArrow(e, i, 0)} placeholder="NAMA..." /></td>
                                <td className="p-0 border-r border-slate-200"><input id={`guru-${i}-1`} className={`${cellInput} !text-left px-4 font-mono tracking-widest`} value={row.nip_nik || ''} onChange={e => update(i, 'nip_nik', e.target.value)} onKeyDown={e => handleArrow(e, i, 1)} placeholder="..." /></td>
                                <td className="p-0 border-r border-slate-200"><input id={`guru-${i}-2`} className="w-full h-full text-center font-bold bg-transparent outline-none px-2 text-slate-900 placeholder:text-slate-300" value={row.lp || ''} onChange={e => update(i, 'lp', e.target.value)} onKeyDown={e => handleArrow(e, i, 2)} placeholder="L/P" /></td>
                                <td className="p-0 border-r border-slate-200"><input id={`guru-${i}-3`} className={`${cellInput} !text-left px-4`} value={row.tempat_lahir || ''} onChange={e => update(i, 'tempat_lahir', e.target.value)} onKeyDown={e => handleArrow(e, i, 3)} /></td>
                                <td className="p-0 border-r border-slate-200"><input id={`guru-${i}-4`} type="date" className={`${cellInput} px-4`} value={row.tanggal_lahir || ''} onChange={e => update(i, 'tanggal_lahir', e.target.value)} onKeyDown={e => handleArrow(e, i, 4)} /></td>
                                <td className="p-0 border-r border-slate-200"><input id={`guru-${i}-5`} className={`${cellInput} !text-left px-4`} value={row.status_pegawai || ''} onChange={e => update(i, 'status_pegawai', e.target.value)} onKeyDown={e => handleArrow(e, i, 5)} /></td>
                                <td className="p-0 border-r border-slate-200"><input id={`guru-${i}-6`} className={cellInput} value={row.pendidikan_terakhir || ''} onChange={e => update(i, 'pendidikan_terakhir', e.target.value)} onKeyDown={e => handleArrow(e, i, 6)} /></td>
                                <td className="p-0 border-r border-slate-200"><input id={`guru-${i}-7`} className={`${cellInput} !text-left px-4`} value={row.jurusan || ''} onChange={e => update(i, 'jurusan', e.target.value)} onKeyDown={e => handleArrow(e, i, 7)} /></td>
                                <td className="p-0 border-r border-slate-200"><input id={`guru-${i}-8`} className={cellInput} value={row.golongan || ''} onChange={e => update(i, 'golongan', e.target.value)} onKeyDown={e => handleArrow(e, i, 8)} /></td>
                                <td className="p-0 border-r border-slate-200"><input id={`guru-${i}-9`} className={cellInput} value={row.tmt_mengajar || ''} onChange={e => update(i, 'tmt_mengajar', e.target.value)} onKeyDown={e => handleArrow(e, i, 9)} /></td>
                                <td className="p-0 border-r border-slate-200"><input id={`guru-${i}-10`} className={cellInput} value={row.tmt_di_madrasah || ''} onChange={e => update(i, 'tmt_di_madrasah', e.target.value)} onKeyDown={e => handleArrow(e, i, 10)} /></td>
                                <td className="p-0 border-r border-slate-200"><input id={`guru-${i}-11`} className={`${cellInput} !text-left px-4`} value={row.mata_pelajaran || ''} onChange={e => update(i, 'mata_pelajaran', e.target.value)} onKeyDown={e => handleArrow(e, i, 11)} /></td>
                                <td className="p-0 border-r border-slate-200"><input id={`guru-${i}-12`} className={`${cellInput} !text-left px-4`} value={row.satminkal || ''} onChange={e => update(i, 'satminkal', e.target.value)} onKeyDown={e => handleArrow(e, i, 12)} /></td>
                                <td className="p-0 border-r border-slate-200"><input id={`guru-${i}-13`} type="text" inputMode="text" className="w-full h-full text-center font-bold bg-transparent outline-none px-2 text-slate-900" value={row.jumlah_jam ?? ''} onChange={e => update(i, 'jumlah_jam', e.target.value)} onKeyDown={e => handleArrow(e, i, 13)} /></td>
                                <td className="p-0 border-r border-slate-200"><input id={`guru-${i}-14`} className={`${cellInput} !text-left px-4`} value={row.jabatan || ''} onChange={e => update(i, 'jabatan', e.target.value)} onKeyDown={e => handleArrow(e, i, 14)} /></td>
                                <td className="p-0 border-r border-slate-200"><input id={`guru-${i}-15`} className={`${cellInput} !text-left px-4`} value={row.nama_ibu_kandung || ''} onChange={e => update(i, 'nama_ibu_kandung', e.target.value)} onKeyDown={e => handleArrow(e, i, 15)} /></td>
                                <td className="p-0 border-r border-slate-200"><select id={`guru-${i}-16`} className={cellInput} value={row.sertifikasi ? '1' : '0'} onChange={e => update(i, 'sertifikasi', e.target.value === '1')} onKeyDown={e => handleArrow(e, i, 16)}><option value="0">TIDAK</option><option value="1">YA</option></select></td>
                                <td className="p-0"><select id={`guru-${i}-17`} className={cellInput} value={row.mutasi_status || 'aktif'} onChange={e => update(i, 'mutasi_status', e.target.value)} onKeyDown={e => handleArrow(e, i, 17)}><option value="aktif">AKTIF</option><option value="masuk">MASUK</option><option value="keluar">KELUAR</option></select></td>
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

    const handleArrow = (e: React.KeyboardEvent, r: number, c: number) => {
        const fieldsCount = 8;
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        let start = 0, end = 0;
        try { start = target.selectionStart || 0; end = target.selectionEnd || 0; } catch { }
        const valLen = target.value?.toString().length || 0;
        let nr = r, nc = c;

        if (e.key === 'ArrowUp') nr--;
        else if (e.key === 'ArrowDown') nr++;
        else if (e.key === 'ArrowLeft') {
            if (start > 0) return;
            nc--;
            if (nc < 0 && nr > 0) { nr--; nc = fieldsCount - 1; }
            else if (nc < 0) return;
        } else if (e.key === 'ArrowRight') {
            if (end < valLen) return;
            nc++;
            if (nc >= fieldsCount && nr < (rows?.length || 0) - 1) { nr++; nc = 0; }
            else if (nc >= fieldsCount) return;
        } else return;

        if (nr >= 0 && nr < (rows?.length || 0) && nc >= 0 && nc < fieldsCount) {
            e.preventDefault();
            const el = document.getElementById(`sarpras-${nr}-${nc}`) as any;
            if (el) {
                el.focus();
                try {
                    const len = el.value?.toString().length || 0;
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') el.setSelectionRange(0, 0);
                    else el.setSelectionRange(len, len);
                } catch { }
            }
        }
    };

    return (
        <Card title="SARANA PRASARANA (SECTION C)">
            <div className="table-container-simple">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="w-10 border-r-2 border-b-2 border-slate-900"></th>
                            <th className={`${headerCell} min-w-[180px]`}>JENIS ASET</th>
                            <th className={`${headerCell} min-w-[150px]`}>LUAS</th>
                            <th className={`${subHeaderCell} min-w-[80px]`}>BAIK</th>
                            <th className={`${subHeaderCell} min-w-[80px]`}>RR</th>
                            <th className={`${subHeaderCell} min-w-[80px]`}>RB</th>
                            <th className={`${subHeaderCell} min-w-[100px]`}>KEKURANGAN</th>
                            <th className={`${subHeaderCell} min-w-[100px]`}>PERLU REHAB</th>
                            <th className={`${subHeaderCell} min-w-[150px]`}>KETERANGAN</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(rows || []).map((row, i) => (
                            <tr key={i} className="text-center group hover:bg-slate-50 transition-colors">
                                <td className="border-r border-slate-200 text-center">
                                    <button onClick={() => removeRow(i)} className="p-1.5 text-slate-400 hover:text-black transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                                <td className="p-0 border-r border-slate-200 min-w-[180px]"><textarea id={`sarpras-${i}-0`} className={`${cellInput} text-left px-3 py-3 resize-none whitespace-normal break-words underline decoration-slate-100 underline-offset-4 [&::-webkit-scrollbar]:hidden`} value={row.jenis_aset || ''} onChange={e => update(i, 'jenis_aset', e.target.value)} onKeyDown={e => handleArrow(e, i, 0)} placeholder="ASET..." /></td>
                                <td className="p-0 border-r border-slate-200 min-w-[150px]"><textarea id={`sarpras-${i}-1`} className={`${cellInput} text-center px-3 py-3 resize-none whitespace-normal break-words [&::-webkit-scrollbar]:hidden`} value={row.luas || ''} onChange={e => update(i, 'luas', e.target.value)} onKeyDown={e => handleArrow(e, i, 1)} /></td>
                                <td className="p-0 border-r border-slate-200 min-w-[80px]"><input id={`sarpras-${i}-2`} type="text" inputMode="decimal" onFocus={e => e.target.select()} className="w-full py-3 text-center bg-transparent outline-none px-0 text-slate-900 text-sm" value={row.kondisi_baik ?? ''} onChange={e => update(i, 'kondisi_baik', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 2)} /></td>
                                <td className="p-0 border-r border-slate-200 min-w-[80px]"><input id={`sarpras-${i}-3`} type="text" inputMode="decimal" onFocus={e => e.target.select()} className="w-full py-3 text-center bg-transparent outline-none px-0 text-slate-900 text-sm" value={row.kondisi_rusak_ringan ?? ''} onChange={e => update(i, 'kondisi_rusak_ringan', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 3)} /></td>
                                <td className="p-0 border-r border-slate-200 min-w-[80px]"><input id={`sarpras-${i}-4`} type="text" inputMode="decimal" onFocus={e => e.target.select()} className="w-full py-3 text-center bg-transparent outline-none px-0 text-slate-900 text-sm" value={row.kondisi_rusak_berat ?? ''} onChange={e => update(i, 'kondisi_rusak_berat', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 4)} /></td>
                                <td className="p-0 border-r border-slate-200 min-w-[100px]"><input id={`sarpras-${i}-5`} type="text" inputMode="decimal" onFocus={e => e.target.select()} className="w-full py-3 text-center bg-transparent outline-none px-0 text-slate-900 text-sm" value={row.kekurangan ?? ''} onChange={e => update(i, 'kekurangan', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 5)} /></td>
                                <td className="p-0 border-r border-slate-200 min-w-[100px]"><input id={`sarpras-${i}-6`} type="text" inputMode="decimal" onFocus={e => e.target.select()} className="w-full py-3 text-center bg-transparent outline-none px-0 text-slate-900 text-sm" value={row.perlu_rehab ?? ''} onChange={e => update(i, 'perlu_rehab', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 6)} /></td>
                                <td className="p-0"><textarea id={`sarpras-${i}-7`} className={`${cellInput} text-left px-3 py-3 resize-y whitespace-normal break-words`} value={row.keterangan || ''} onChange={e => update(i, 'keterangan', e.target.value)} onKeyDown={e => handleArrow(e, i, 7)} placeholder="..." /></td>
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

    const handleArrow = (e: React.KeyboardEvent, r: number, c: number) => {
        const fieldsCount = 7;
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        let start = 0, end = 0;
        try { start = target.selectionStart || 0; end = target.selectionEnd || 0; } catch { }
        const valLen = target.value?.toString().length || 0;
        let nr = r, nc = c;

        if (e.key === 'ArrowUp') nr--;
        else if (e.key === 'ArrowDown') nr++;
        else if (e.key === 'ArrowLeft') {
            if (start > 0) return;
            nc--;
            if (nc < 0 && nr > 0) { nr--; nc = fieldsCount - 1; }
            else if (nc < 0) return;
        } else if (e.key === 'ArrowRight') {
            if (end < valLen) return;
            nc++;
            if (nc >= fieldsCount && nr < (rows?.length || 0) - 1) { nr++; nc = 0; }
            else if (nc >= fieldsCount) return;
        } else return;

        if (nr >= 0 && nr < (rows?.length || 0) && nc >= 0 && nc < fieldsCount) {
            e.preventDefault();
            const el = document.getElementById(`mobiler-${nr}-${nc}`) as any;
            if (el) {
                el.focus();
                try {
                    const len = el.value?.toString().length || 0;
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') el.setSelectionRange(0, 0);
                    else el.setSelectionRange(len, len);
                } catch { }
            }
        }
    };

    return (
        <Card title="DATA MOBILER">
            <div className="table-container-simple">
                <table className="w-full text-black">
                    <thead>
                        <tr>
                            <th className="w-10 border-r-2 border-b-2 border-slate-900"></th>
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
                                <td className="p-0 border-r border-slate-200 min-w-[200px]"><textarea id={`mobiler-${i}-0`} className={`${cellInput} text-left px-3 py-3 resize-none whitespace-normal break-words underline decoration-slate-100 underline-offset-4`} value={row.nama_barang || ''} onChange={e => update(i, 'nama_barang', e.target.value)} onKeyDown={e => handleArrow(e, i, 0)} placeholder="BARANG..." /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`mobiler-${i}-1`} type="text" inputMode="decimal" onFocus={e => e.target.select()} className={cellInput} value={row.jumlah_total ?? ''} onChange={e => update(i, 'jumlah_total', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 1)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`mobiler-${i}-2`} type="text" inputMode="decimal" onFocus={e => e.target.select()} className={cellInput} value={row.kondisi_baik ?? ''} onChange={e => update(i, 'kondisi_baik', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 2)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`mobiler-${i}-3`} type="text" inputMode="decimal" onFocus={e => e.target.select()} className={cellInput} value={row.kondisi_rusak_ringan ?? ''} onChange={e => update(i, 'kondisi_rusak_ringan', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 3)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`mobiler-${i}-4`} type="text" inputMode="decimal" onFocus={e => e.target.select()} className={cellInput} value={row.kondisi_rusak_berat ?? ''} onChange={e => update(i, 'kondisi_rusak_berat', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 4)} /></td>
                                <td className="p-0 border-r border-slate-200 w-24"><input id={`mobiler-${i}-5`} type="text" inputMode="decimal" onFocus={e => e.target.select()} className={cellInput} value={row.kekurangan ?? ''} onChange={e => update(i, 'kekurangan', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))} onKeyDown={e => handleArrow(e, i, 5)} /></td>
                                <td className="p-0"><textarea id={`mobiler-${i}-6`} className={`${cellInput} text-left px-3 py-3 resize-y whitespace-normal break-words underline-offset-4`} value={row.keterangan || ''} onChange={e => update(i, 'keterangan', e.target.value)} onKeyDown={e => handleArrow(e, i, 6)} placeholder="..." /></td>
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
        const fieldsCount = 4; // Uraian (0), Satuan (1), Volume (2), Harga Satuan (3)
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        let start = 0, end = 0;
        try { start = target.selectionStart || 0; end = target.selectionEnd || 0; } catch { }
        const valLen = target.value?.toString().length || 0;
        let nr = r, nc = c;

        if (e.key === 'ArrowUp') nr--;
        else if (e.key === 'ArrowDown') nr++;
        else if (e.key === 'ArrowLeft') {
            if (start > 0) return;
            nc--;
            if (nc < 0 && nr > 0) { nr--; nc = fieldsCount - 1; }
            else if (nc < 0) return;
        } else if (e.key === 'ArrowRight') {
            if (end < valLen) return;
            nc++;
            if (nc >= fieldsCount && nr < (rows?.length || 0) - 1) { nr++; nc = 0; }
            else if (nc >= fieldsCount) return;
        } else return;

        if (nr >= 0 && nr < (rows?.length || 0) && nc >= 0 && nc < fieldsCount) {
            e.preventDefault();
            const el = document.getElementById(`keu-${nr}-${nc}`) as any;
            if (el) {
                el.focus();
                try {
                    const len = el.value?.toString().length || 0;
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') el.setSelectionRange(0, 0);
                    else el.setSelectionRange(len, len);
                } catch { }
            }
        }
    };

    return (
        <Card title="DATA KEUANGAN (BOS/NON-BOS)">
            <div className="table-container-simple">
                <table className="w-full text-black">
                    <thead>
                        <tr className="text-center">
                            <th className="w-12 border-r border-b-2 border-slate-900 text-xs font-black">NO</th>
                            <th className="w-12 border-r border-b-2 border-slate-900"></th>
                            <th className={`${headerCell} min-w-[300px]`}>JABATAN / KEGIATAN</th>
                            <th className={`${headerCell} min-w-[100px]`}>SATUAN</th>
                            <th className={`${headerCell} min-w-[80px]`}>VOLUME</th>
                            <th className={`${headerCell} min-w-[180px]`}>HARGA SATUAN</th>
                            <th className={`${headerCell} min-w-[180px]`}>JUMLAH</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-100">
                        {(rows || []).map((row, i) => (
                            <tr key={i} className="text-center group hover:bg-slate-50 transition-colors">
                                <td className="border-r border-slate-200 text-slate-400 font-bold text-xs">{i + 1}</td>
                                <td className="border-r border-slate-200 text-center">
                                    <button onClick={() => removeRow(i)} className="p-1.5 text-slate-400 hover:text-black transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                                <td className="p-0 border-r border-slate-200 min-w-[300px]">
                                    <textarea
                                        id={`keu-${i}-0`}
                                        className="w-full py-3 text-left bg-transparent outline-none px-3 text-slate-900 text-sm resize-none whitespace-normal break-words [&::-webkit-scrollbar]:hidden"
                                        value={row.uraian_kegiatan || ''}
                                        onChange={e => update(i, 'uraian_kegiatan', e.target.value)}
                                        onKeyDown={e => handleArrow(e, i, 0)}
                                        placeholder="JABATAN / KEGIATAN..."
                                    />
                                </td>
                                <td className="p-0 border-r border-slate-200 min-w-[100px]">
                                    <input
                                        id={`keu-${i}-1`}
                                        className="w-full py-3 text-center bg-transparent outline-none px-1 text-slate-900 text-sm"
                                        value={row.satuan || ''}
                                        onChange={e => update(i, 'satuan', e.target.value)}
                                        onKeyDown={e => handleArrow(e, i, 1)}
                                        placeholder="Org/Bln"
                                    />
                                </td>
                                <td className="p-0 border-r border-slate-200 min-w-[80px]">
                                    <input
                                        id={`keu-${i}-2`}
                                        type="text"
                                        inputMode="decimal"
                                        className="w-full py-3 text-center bg-transparent outline-none px-1 text-slate-900 text-sm"
                                        value={row.volume ?? ''}
                                        onChange={e => update(i, 'volume', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))}
                                        onKeyDown={e => handleArrow(e, i, 2)}
                                    />
                                </td>
                                <td className="p-0 border-r border-slate-200 min-w-[180px]">
                                    <input
                                        id={`keu-${i}-3`}
                                        type="text"
                                        inputMode="decimal"
                                        className="w-full py-3 text-center bg-transparent outline-none px-2 text-slate-900 text-sm font-bold"
                                        value={row.harga_satuan ?? ''}
                                        onChange={e => update(i, 'harga_satuan', e.target.value === '' ? null : Number(e.target.value.replace(/[^0-9]/g, '')))}
                                        onKeyDown={e => handleArrow(e, i, 3)}
                                    />
                                </td>
                                <td className="p-0 min-w-[180px] bg-slate-50/50">
                                    <div className="w-full py-3 text-center font-bold text-slate-700 text-sm">
                                        Rp {(Number(row.volume || 0) * Number(row.harga_satuan || 0)).toLocaleString('id-ID')}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-white border-t-4 border-slate-900">
                            <td colSpan={6} className="p-4 text-right px-6 font-black uppercase tracking-wider text-sm text-slate-900">JUMLAH</td>
                            <td className="p-4 text-center font-black text-lg text-slate-900">
                                Rp{rows?.reduce((sum, r) => sum + (Number(r.volume || 0) * Number(r.harga_satuan || 0)), 0).toLocaleString('id-ID')}
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
        </Card >
    );
}
