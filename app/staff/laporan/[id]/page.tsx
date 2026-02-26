'use client';

import React, { useState, useEffect, use } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    CheckCircle, XCircle, ArrowLeft, Users, Building,
    Coins, Loader2, Calendar, Package
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function StaffDetailLaporanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('siswa');
    const [isProcessing, setIsProcessing] = useState(false);
    const [catatanRevisi, setCatatanRevisi] = useState('');

    const tabs = [
        { id: 'siswa', label: '1. Siswa', icon: <Users size={15} /> },
        { id: 'rekap_personal', label: '2. Rekap Personal', icon: <Users size={15} /> },
        { id: 'guru', label: '3. Guru/Pegawai', icon: <Users size={15} /> },
        { id: 'sarpras_mobiler', label: '4. Sarpras & Mobiler', icon: <Building size={15} /> },
        { id: 'keuangan', label: '5. Keuangan', icon: <Coins size={15} /> },
    ];

    const fetchDetail = async () => {
        setIsLoading(true);
        try {
            const response = await api.operator.getLaporanDetail(id);
            const json = await response.json();
            if (response.ok) {
                const data = json.data || json;
                setReportData(data);
                setCatatanRevisi(data.catatan_revisi || '');
            }
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDetail(); }, [id]);

    const handleAction = async (status: 'verified' | 'revisi') => {
        if (status === 'revisi' && !catatanRevisi.trim()) {
            alert('Mohon tuliskan catatan revisi untuk operator.');
            return;
        }
        if (!confirm(status === 'verified' ? 'Setujui laporan ini?' : 'Kembalikan laporan untuk direvisi?')) return;
        setIsProcessing(true);
        try {
            const response = await api.admin.verifyLaporan(id, { status_laporan: status, catatan_revisi: catatanRevisi });
            if (response.ok) {
                alert(status === 'verified' ? 'Laporan Berhasil Disetujui!' : 'Laporan Dikembalikan ke Operator.');
                router.push('/staff/laporan');
            }
        } catch { alert('Gagal memproses validasi.'); }
        finally { setIsProcessing(false); }
    };

    const formatBulan = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
    };

    if (isLoading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4 animate-fade-in">
                <Loader2 className="animate-spin text-emerald-600" size={64} />
                <p className="font-black text-slate-900 uppercase tracking-widest text-sm">Audit Data Berlangsung...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full space-y-9 pb-20 animate-fade-in overflow-x-hidden p-2 md:p-3">
            <div className="w-full max-w-[1600px] mx-auto min-w-0 space-y-9">

                {/* ── Header ── */}
                <div className="bg-white border-[3px] border-slate-900 p-8 shadow-[6px_6px_0_0_#0f172a] rounded-[2rem] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <Link href="/staff/laporan">
                            <Button variant="outline" className="!h-14 !w-14 !p-0 rounded-2xl">
                                <ArrowLeft size={22} />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border-2 uppercase tracking-widest
                                ${reportData?.status_laporan === 'verified'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                        : reportData?.status_laporan === 'revisi'
                                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                                            : 'bg-amber-50 text-amber-700 border-amber-300'}`}>
                                    {reportData?.status_laporan}
                                </span>
                                <span className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    PANEL VALIDASI TEKNIS
                                </span>
                            </div>
                            <h2 className="text-2xl font-black leading-none mb-1 uppercase">
                                {reportData?.madrasah?.nama_madrasah || 'MADRASAH'}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                PERIODE LAPORAN: {formatBulan(reportData?.bulan_tahun)}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4 w-full xl:w-auto">
                        <Button
                            variant="danger"
                            className="flex-1 xl:w-52 !py-5 text-base"
                            icon={<XCircle size={20} />}
                            onClick={() => handleAction('revisi')}
                            isLoading={isProcessing}
                            disabled={reportData?.status_laporan === 'verified'}>
                            REVISI
                        </Button>
                        <Button
                            className="flex-1 xl:w-52 !py-5 text-base !bg-emerald-600 hover:!bg-emerald-700"
                            icon={<CheckCircle size={20} />}
                            onClick={() => handleAction('verified')}
                            isLoading={isProcessing}
                            disabled={reportData?.status_laporan === 'verified'}>
                            SETUJU
                        </Button>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="flex overflow-x-auto pb-1 gap-3 no-scrollbar">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shrink-0 border-[3px]
                            ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-[4px_4px_0_0_#64748b]'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-800'}`}>
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content Full Width ── */}
                <Card>
                    {activeTab === 'siswa' && <ViewSiswa data={reportData?.siswa} />}
                    {activeTab === 'rekap_personal' && <ViewRekapPersonal data={reportData?.rekap_personal} />}
                    {activeTab === 'guru' && <ViewGuru data={reportData?.guru} />}
                    {activeTab === 'sarpras_mobiler' && (
                        <div className="space-y-12">
                            <ViewSarpras data={reportData?.sarpras} />
                            <div className="border-t-[3px] border-dashed border-slate-200 pt-10">
                                <ViewMobiler data={reportData?.mobiler} />
                            </div>
                        </div>
                    )}
                    {activeTab === 'keuangan' && <ViewKeuangan data={reportData?.keuangan} />}
                </Card>

                {/* ── Bottom Row: Catatan Revisi + Rekam Jejak ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card title="CATATAN REVISI (WAJIB JIKA REJECT)">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
                            Tuliskan instruksi perbaikan untuk operator madrasah.
                        </p>
                        <textarea
                            className="w-full p-5 text-sm font-bold border-[3px] border-slate-200 rounded-3xl outline-none min-h-[160px] transition-all bg-slate-50 focus:border-emerald-500 focus:bg-white resize-none"
                            placeholder="Contoh: Mohon periksa kembali jumlah siswa kelas 7, data tidak sinkron dengan laporan bulan lalu..."
                            value={catatanRevisi}
                            onChange={(e) => setCatatanRevisi(e.target.value)}
                            disabled={reportData?.status_laporan === 'verified'}
                        />
                        {reportData?.status_laporan !== 'verified' && (
                            <div className="mt-4 flex gap-3">
                                <Button
                                    variant="danger"
                                    className="flex-1 !py-4"
                                    icon={<XCircle size={18} />}
                                    onClick={() => handleAction('revisi')}
                                    isLoading={isProcessing}>
                                    KIRIM REVISI
                                </Button>
                                <Button
                                    className="flex-1 !py-4 !bg-emerald-600 hover:!bg-emerald-700"
                                    icon={<CheckCircle size={18} />}
                                    onClick={() => handleAction('verified')}
                                    isLoading={isProcessing}>
                                    SETUJUI
                                </Button>
                            </div>
                        )}
                    </Card>

                    <Card title="REKAM JEJAK SUBMISSION">
                        <div className="space-y-6 pt-2">
                            <ActivityItem label="Pengiriman / Pembuatan Laporan" date={reportData?.created_at} active />
                            <ActivityItem label="Update / Penyimpanan Terakhir" date={reportData?.updated_at} />
                            {reportData?.status_laporan === 'verified' && (
                                <ActivityItem label="Tanggal Terverifikasi" date={reportData?.updated_at} verified />
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ─── SHARED STYLE HELPERS ─────────────────────────────────────────────────────

const TH = ({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) => (
    <th style={{
        backgroundColor: '#0f172a', color: 'white',
        padding: '16px 22px', fontWeight: 900, fontSize: '11px',
        textTransform: 'uppercase', letterSpacing: '0.15em',
        textAlign: 'center', whiteSpace: 'nowrap',
        borderRight: '1px solid #334155',
        borderBottom: '4px solid #0f172a',
        ...style
    }}>
        {children}
    </th>
);

const TD = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <td className={`px-5 py-5 border-b border-r border-slate-200 text-sm font-bold text-slate-700 text-center align-middle transition-all ${className || ''}`}>
        {children !== undefined && children !== null && children !== '' ? children : <span className="text-slate-300">N/A</span>}
    </td>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-7 pb-5 border-b-[3px] border-slate-100">
        {children}
    </p>
);

const EmptyState = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-slate-200 mb-4">{icon}</div>
        <p className="font-black text-slate-300 uppercase tracking-[0.2em]">{text}</p>
        <p className="text-xs text-slate-400 mt-2">Operator belum mengisi data ini</p>
    </div>
);

// ─── TAB VIEW COMPONENTS ──────────────────────────────────────────────────────

function ViewSiswa({ data }: { data: any[] }) {
    if (!data?.length) return <EmptyState icon={<Users size={56} />} text="Belum ada data siswa" />;
    const totLk = data.reduce((s, r) => s + (Number(r.jumlah_lk) || 0), 0);
    const totPr = data.reduce((s, r) => s + (Number(r.jumlah_pr) || 0), 0);
    return (
        <>
            <SectionTitle>Rekapitulasi Data Siswa — {data.length} kelas</SectionTitle>
            <div className="overflow-x-auto rounded-[2rem] border-[3px] border-slate-900 shadow-[8px_8px_0_0_#f1f5f9]">
                <table className="border-collapse" style={{ minWidth: '950px', width: '100%' }}>
                    <thead>
                        <tr>
                            <TH style={{ minWidth: '180px' }}>Kelas</TH>
                            <TH style={{ minWidth: '90px' }}>Rombel</TH>
                            <TH style={{ minWidth: '80px' }}>LK</TH>
                            <TH style={{ minWidth: '80px' }}>PR</TH>
                            <TH style={{ minWidth: '110px' }}>Mutasi Masuk</TH>
                            <TH style={{ minWidth: '110px' }}>Mutasi Keluar</TH>
                            <TH style={{ minWidth: '90px' }}>Total</TH>
                            <TH style={{ minWidth: '180px', borderRight: 'none' }}>Keterangan</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                <TD className="text-left font-black text-slate-900 bg-slate-50/30 group-hover:bg-white">{r.kelas}</TD>
                                <TD>{r.jumlah_rombel}</TD>
                                <TD className="font-bold">{r.jumlah_lk ?? '0'}</TD>
                                <TD className="font-bold">{r.jumlah_pr ?? '0'}</TD>
                                <TD>{r.mutasi_masuk ?? '0'}</TD>
                                <TD>{r.mutasi_keluar ?? '0'}</TD>
                                <TD className="font-black text-slate-900 bg-slate-50/30 group-hover:bg-white">{(Number(r.jumlah_lk) || 0) + (Number(r.jumlah_pr) || 0)}</TD>
                                <td className="px-5 py-4 border-b border-slate-200 text-sm text-slate-600 font-medium text-left italic">
                                    {r.keterangan || <span className="text-slate-300 not-italic">Tanpa keterangan</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #0f172a' }}>
                            <td colSpan={2} className="p-5 font-black text-slate-900 uppercase text-[11px] tracking-widest">Total Keseluruhan</td>
                            <td className="p-5 text-center font-black text-slate-900">{totLk}</td>
                            <td className="p-5 text-center font-black text-slate-900">{totPr}</td>
                            <td colSpan={3} className="p-5 text-center font-black text-slate-900">{totLk + totPr} siswa</td>
                            <td />
                        </tr>
                    </tfoot>
                </table>
            </div>
        </>
    );
}

function ViewRekapPersonal({ data }: { data: any[] }) {
    if (!data?.length) return <EmptyState icon={<Users size={56} />} text="Belum ada data rekap personal" />;
    return (
        <>
            <SectionTitle>Rekap Personal (Section B) — {data.length} baris</SectionTitle>
            <div className="overflow-x-auto rounded-[2rem] border-[3px] border-slate-900 shadow-[8px_8px_0_0_#f1f5f9]">
                <table className="border-collapse" style={{ minWidth: '900px', width: '100%' }}>
                    <thead>
                        <tr>
                            <TH style={{ minWidth: '220px' }}>Keadaan / Kategori</TH>
                            <TH style={{ minWidth: '80px' }}>LK</TH>
                            <TH style={{ minWidth: '80px' }}>PR</TH>
                            <TH style={{ minWidth: '110px' }}>Mutasi Masuk</TH>
                            <TH style={{ minWidth: '110px' }}>Mutasi Keluar</TH>
                            <TH style={{ minWidth: '200px', borderRight: 'none' }}>Keterangan</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                <TD className="text-left font-black text-slate-900 bg-slate-50/30 group-hover:bg-white">{r.keadaan}</TD>
                                <TD className="font-bold">{r.jumlah_lk ?? '0'}</TD>
                                <TD className="font-bold">{r.jumlah_pr ?? '0'}</TD>
                                <TD>{r.mutasi_masuk ?? '0'}</TD>
                                <TD>{r.mutasi_keluar ?? '0'}</TD>
                                <td className="px-5 py-4 border-b border-slate-200 text-sm text-slate-600 font-medium text-left italic">
                                    {r.keterangan || <span className="text-slate-300 not-italic">Tanpa keterangan</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #0f172a' }}>
                            <td className="p-5 font-black text-slate-900 uppercase text-[11px] tracking-widest">Total</td>
                            <td className="p-5 text-center font-black">{data.reduce((s, r) => s + (Number(r.jumlah_lk) || 0), 0)}</td>
                            <td className="p-5 text-center font-black">{data.reduce((s, r) => s + (Number(r.jumlah_pr) || 0), 0)}</td>
                            <td className="p-5 text-center font-black">{data.reduce((s, r) => s + (Number(r.mutasi_masuk) || 0), 0)}</td>
                            <td className="p-5 text-center font-black">{data.reduce((s, r) => s + (Number(r.mutasi_keluar) || 0), 0)}</td>
                            <td />
                        </tr>
                    </tfoot>
                </table>
            </div>
        </>
    );
}

function ViewGuru({ data }: { data: any[] }) {
    if (!data?.length) return <EmptyState icon={<Users size={56} />} text="Belum ada data guru/pegawai" />;
    return (
        <>
            <SectionTitle>Data Guru & Tenaga Kependidikan (Section F) — {data.length} orang</SectionTitle>
            <div className="overflow-x-auto rounded-[2rem] border-[3px] border-slate-900 shadow-[8px_8px_0_0_#f1f5f9]">
                <table className="border-collapse" style={{ minWidth: '2400px' }}>
                    <thead>
                        <tr>
                            <TH style={{ minWidth: '240px' }}>Nama Guru</TH>
                            <TH style={{ minWidth: '170px' }}>NIP / NIK</TH>
                            <TH style={{ minWidth: '60px' }}>L/P</TH>
                            <TH style={{ minWidth: '140px' }}>Tempat Lahir</TH>
                            <TH style={{ minWidth: '120px' }}>Tgl Lahir</TH>
                            <TH style={{ minWidth: '150px' }}>Status Pegawai</TH>
                            <TH style={{ minWidth: '100px' }}>Pendidikan</TH>
                            <TH style={{ minWidth: '180px' }}>Jurusan</TH>
                            <TH style={{ minWidth: '100px' }}>Golongan</TH>
                            <TH style={{ minWidth: '120px' }}>TMT Guru</TH>
                            <TH style={{ minWidth: '130px' }}>TMT Madrasah</TH>
                            <TH style={{ minWidth: '170px' }}>Mata Pelajaran</TH>
                            <TH style={{ minWidth: '180px' }}>Satminkal</TH>
                            <TH style={{ minWidth: '60px' }}>Jam</TH>
                            <TH style={{ minWidth: '140px' }}>Jabatan</TH>
                            <TH style={{ minWidth: '170px' }}>Ibu Kandung</TH>
                            <TH style={{ minWidth: '100px' }}>Sertifikasi</TH>
                            <TH style={{ minWidth: '90px', borderRight: 'none' }}>Mutasi</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((g, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                <TD className="text-left font-black text-slate-900 bg-slate-50/30 group-hover:bg-white">{g.nama_guru || g.nama}</TD>
                                <TD className="font-mono text-[10px] tracking-widest text-slate-500">{g.nip_nik || g.nip || g.nik}</TD>
                                <TD>{g.lp || g.jenis_kelamin}</TD>
                                <TD className="text-left">{g.tempat_lahir}</TD>
                                <TD className="text-xs whitespace-nowrap">{g.tanggal_lahir}</TD>
                                <TD className="text-left uppercase text-[10px] tracking-tight">{g.status_pegawai}</TD>
                                <TD>{g.pendidikan_terakhir}</TD>
                                <TD className="text-left text-xs">{g.jurusan}</TD>
                                <TD>{g.golongan}</TD>
                                <TD className="text-xs whitespace-nowrap">{g.tmt_mengajar}</TD>
                                <TD className="text-xs whitespace-nowrap">{g.tmt_di_madrasah}</TD>
                                <TD className="text-left text-xs">{g.mata_pelajaran}</TD>
                                <TD className="text-left text-xs">{g.satminkal}</TD>
                                <TD className="font-black">{g.jumlah_jam}</TD>
                                <TD className="text-left text-xs font-bold uppercase">{g.jabatan}</TD>
                                <TD className="text-left text-xs">{g.nama_ibu_kandung}</TD>
                                <TD>
                                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${g.sertifikasi ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                        {g.sertifikasi ? 'SERTIFIKASI' : 'BELUM'}
                                    </span>
                                </TD>
                                <td className="px-5 py-4 border-b border-slate-200 text-center align-middle">
                                    <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-[2px_2px_0_0_#cbd5e1]">
                                        {g.mutasi_status || 'AKTIF'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #0f172a' }}>
                            <td className="p-5 font-black text-slate-900 uppercase text-[11px] tracking-widest">Total Guru/Pegawai</td>
                            <td colSpan={17} className="p-5 font-black text-slate-700">{data.length} ORANG</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </>
    );
}

function ViewSarpras({ data }: { data: any[] }) {
    return (
        <>
            <SectionTitle>Sarana Prasarana (Section C){data?.length ? ` — ${data.length} item` : ''}</SectionTitle>
            {!data?.length
                ? <EmptyState icon={<Building size={48} />} text="Belum ada data sarpras" />
                : (
                    <div className="overflow-x-auto rounded-[2rem] border-[3px] border-slate-900 shadow-[8px_8px_0_0_#f1f5f9]">
                        <table className="border-collapse w-full" style={{ minWidth: '700px' }}>
                            <thead>
                                <tr>
                                    <th style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 14px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', borderRight: '1px solid #334155', borderBottom: '4px solid #0f172a', minWidth: '180px' }}>Jenis Aset</th>
                                    <th style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 10px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', borderRight: '1px solid #334155', borderBottom: '4px solid #0f172a', minWidth: '80px' }}>Luas</th>
                                    <th style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 10px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', borderRight: '1px solid #334155', borderBottom: '4px solid #0f172a', minWidth: '55px' }}>Baik</th>
                                    <th style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 10px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', borderRight: '1px solid #334155', borderBottom: '4px solid #0f172a', minWidth: '70px' }}>R. Ringan</th>
                                    <th style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 10px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', borderRight: '1px solid #334155', borderBottom: '4px solid #0f172a', minWidth: '70px' }}>R. Berat</th>
                                    <th style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 10px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', borderRight: '1px solid #334155', borderBottom: '4px solid #0f172a', minWidth: '65px' }}>Kurang</th>
                                    <th style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 10px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', borderRight: '1px solid #334155', borderBottom: '4px solid #0f172a', minWidth: '65px' }}>Rehab</th>
                                    <th style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 14px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left', borderRight: 'none', borderBottom: '4px solid #0f172a' }}>Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((s, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-3 py-3 border-b border-r border-slate-200 text-xs font-black text-slate-900 bg-slate-50/30 group-hover:bg-white text-center">{s.jenis_aset}</td>
                                        <td className="px-3 py-3 border-b border-r border-slate-200 text-xs font-bold text-slate-700 text-center">{s.luas || <span className="text-slate-300">-</span>}</td>
                                        <td className="px-3 py-3 border-b border-r border-slate-200 text-xs font-bold text-slate-700 text-center">{s.kondisi_baik ?? '0'}</td>
                                        <td className="px-3 py-3 border-b border-r border-slate-200 text-xs font-bold text-amber-700 text-center">{s.kondisi_rusak_ringan ?? '0'}</td>
                                        <td className="px-3 py-3 border-b border-r border-slate-200 text-xs font-bold text-rose-700 text-center">{s.kondisi_rusak_berat ?? '0'}</td>
                                        <td className="px-3 py-3 border-b border-r border-slate-200 text-xs font-bold text-slate-700 text-center">{s.kekurangan ?? '0'}</td>
                                        <td className="px-3 py-3 border-b border-r border-slate-200 text-xs font-bold text-slate-700 text-center">{s.perlu_rehab ?? '0'}</td>
                                        <td className="px-3 py-3 border-b border-slate-200 text-xs text-slate-500 font-medium text-left italic">
                                            {s.keterangan || <span className="text-slate-300 not-italic">-</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #0f172a' }}>
                                    <td className="p-4 font-black text-slate-900 uppercase text-[10px] tracking-widest">Total</td>
                                    <td colSpan={7} className="p-4 font-black text-slate-700 text-[10px]">{data.length} jenis aset</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
        </>
    );
}

function ViewMobiler({ data }: { data: any[] }) {
    return (
        <>
            <SectionTitle>Data Mobiler{data?.length ? ` — ${data.length} item` : ''}</SectionTitle>
            {!data?.length
                ? <EmptyState icon={<Package size={48} />} text="Belum ada data mobiler" />
                : (
                    <div className="overflow-x-auto rounded-[2rem] border-[3px] border-slate-900 shadow-[8px_8px_0_0_#f1f5f9]">
                        <table className="border-collapse w-full" style={{ minWidth: '650px' }}>
                            <thead>
                                <tr>
                                    <th style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 14px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', borderRight: '1px solid #334155', borderBottom: '4px solid #0f172a', minWidth: '180px' }}>Nama Barang</th>
                                    <th style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 10px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', borderRight: '1px solid #334155', borderBottom: '4px solid #0f172a', minWidth: '65px' }}>Total</th>
                                    <th style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 10px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', borderRight: '1px solid #334155', borderBottom: '4px solid #0f172a', minWidth: '55px' }}>Baik</th>
                                    <th style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 10px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', borderRight: '1px solid #334155', borderBottom: '4px solid #0f172a', minWidth: '70px' }}>R. Ringan</th>
                                    <th style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 10px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', borderRight: '1px solid #334155', borderBottom: '4px solid #0f172a', minWidth: '70px' }}>R. Berat</th>
                                    <th style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 10px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', borderRight: '1px solid #334155', borderBottom: '4px solid #0f172a', minWidth: '65px' }}>Kurang</th>
                                    <th style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 14px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left', borderRight: 'none', borderBottom: '4px solid #0f172a' }}>Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((m, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-3 py-3 border-b border-r border-slate-200 text-xs font-black text-slate-900 bg-slate-50/30 group-hover:bg-white text-center">{m.nama_barang}</td>
                                        <td className="px-3 py-3 border-b border-r border-slate-200 text-xs font-black text-slate-900 text-center">{m.jumlah_total ?? '0'}</td>
                                        <td className="px-3 py-3 border-b border-r border-slate-200 text-xs font-bold text-slate-700 text-center">{m.kondisi_baik ?? '0'}</td>
                                        <td className="px-3 py-3 border-b border-r border-slate-200 text-xs font-bold text-amber-700 text-center">{m.kondisi_rusak_ringan ?? '0'}</td>
                                        <td className="px-3 py-3 border-b border-r border-slate-200 text-xs font-bold text-rose-700 text-center">{m.kondisi_rusak_berat ?? '0'}</td>
                                        <td className="px-3 py-3 border-b border-r border-slate-200 text-xs font-bold text-slate-700 text-center">{m.kekurangan ?? '0'}</td>
                                        <td className="px-3 py-3 border-b border-slate-200 text-xs text-slate-500 font-medium text-left italic">
                                            {m.keterangan || <span className="text-slate-300 not-italic">-</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #0f172a' }}>
                                    <td className="p-4 font-black text-slate-900 uppercase text-[10px] tracking-widest">Total Barang</td>
                                    <td className="p-4 text-center font-black text-sm">{data.reduce((s, m) => s + (Number(m.jumlah_total) || 0), 0)}</td>
                                    <td colSpan={5} className="p-4 text-slate-500 text-[10px] font-black">{data.length} jenis barang</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
        </>
    );
}

function ViewKeuangan({ data }: { data: any[] }) {
    if (!data?.length) return <EmptyState icon={<Coins size={56} />} text="Belum ada data keuangan" />;
    const grandTotal = data.reduce((s, k) => s + (Number(k.volume || 0) * Number(k.harga_satuan || 0)), 0);
    return (
        <>
            <SectionTitle>Data Keuangan — {data.length} item kegiatan</SectionTitle>
            <div className="overflow-x-auto rounded-[2rem] border-[3px] border-slate-900 shadow-[8px_8px_0_0_#f1f5f9]">
                <table className="border-collapse" style={{ minWidth: '900px', width: '100%' }}>
                    <thead>
                        <tr>
                            <TH style={{ minWidth: '280px' }}>Uraian Kegiatan</TH>
                            <TH style={{ minWidth: '80px' }}>Volume</TH>
                            <TH style={{ minWidth: '100px' }}>Satuan</TH>
                            <TH style={{ textAlign: 'right', minWidth: '180px' }}>Harga Satuan</TH>
                            <TH style={{ textAlign: 'right', minWidth: '200px', borderRight: 'none' }}>Total Biaya (Rp)</TH>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((k, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                <TD className="text-left font-black text-slate-900 bg-slate-50/30 group-hover:bg-white">{k.uraian_kegiatan}</TD>
                                <TD>{k.volume}</TD>
                                <TD className="uppercase text-[10px] tracking-widest">{k.satuan}</TD>
                                <td className="px-5 py-4 border-b border-r border-slate-200 text-right font-mono text-sm text-slate-600 font-bold group-hover:text-emerald-700">
                                    Rp {Number(k.harga_satuan || 0).toLocaleString('id-ID')}
                                </td>
                                <td className="px-5 py-4 border-b border-slate-200 text-right font-mono font-black text-sm text-slate-900 bg-slate-50/10 group-hover:bg-white group-hover:text-emerald-900">
                                    Rp {(Number(k.volume || 0) * Number(k.harga_satuan || 0)).toLocaleString('id-ID')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ backgroundColor: '#f8fafc', borderTop: '3px solid #0f172a' }}>
                            <td colSpan={4} className="p-5 font-black text-slate-900 uppercase tracking-widest text-[12px]">
                                GRAND TOTAL ANGGARAN
                            </td>
                            <td className="p-5 text-right font-black font-mono text-slate-900 text-base">
                                Rp {grandTotal.toLocaleString('id-ID')}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </>
    );
}

function ActivityItem({ label, date, active, verified }: { label: string; date: any; active?: boolean; verified?: boolean }) {
    const dotColor = verified ? 'bg-emerald-600' : active ? 'bg-emerald-400' : 'bg-slate-300';
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${dotColor} ring-4 ring-white shadow-sm z-10 mt-1`} />
                <div className="flex-1 w-0.5 bg-slate-100 my-1 min-h-[20px]" />
            </div>
            <div className="flex-1 pb-2">
                <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Calendar size={14} className={verified ? 'text-emerald-600' : active ? 'text-emerald-500' : 'text-slate-400'} />
                    {date
                        ? new Date(date).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                </div>
            </div>
        </div>
    );
}
