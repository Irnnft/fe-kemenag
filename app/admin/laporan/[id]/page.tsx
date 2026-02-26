'use client';

import React, { useState, useEffect, use } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Users, Building, Coins, Loader2, Calendar, ShieldCheck, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function KasiDetailLaporanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('siswa');

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
            console.error('Failed to fetch:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const formatBulan = (dateStr: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
    };

    if (isLoading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-4 animate-fade-in">
                <Loader2 className="animate-spin text-emerald-700" size={64} />
                <p className="font-black text-slate-900 uppercase tracking-widest text-sm italic text-center">Menarik Data dari Server...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20 animate-fade-in px-4">
            {/* Header & Tabs Container (Not Sticky) */}
            <div className="space-y-8">
                {/* Header Monitoring */}
                <div className="bg-white border-[3px] border-slate-900 p-8 shadow-[6px_6px_0_0_#0f172a] rounded-[2rem] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="flex items-center gap-5 w-full xl:w-auto">
                        <Link href="/admin/laporan">
                            <Button variant="outline" className="h-20 w-20 p-0 rounded-full border-[4px] border-slate-900 hover:bg-slate-900 group transition-all shadow-[6px_6px_0_0_#0f172a] flex items-center justify-center bg-white">
                                <ArrowLeft size={44} strokeWidth={3} className="text-slate-900 group-hover:text-white transition-colors" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="px-4 py-1.5 rounded-full text-[10px] font-black border-2 border-slate-900 uppercase tracking-widest bg-white text-slate-900">
                                    {reportData?.status_laporan}
                                </span>
                                <span className="bg-white text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border-2 border-slate-900">
                                    <ShieldCheck size={12} /> MODE MONITORING PIMPINAN
                                </span>
                            </div>
                            <h2 className="leading-none mb-1 text-2xl font-black italic">
                                {reportData?.madrasah?.nama_madrasah || 'MADRASAH'}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                PERIODE MONITORING: {formatBulan(reportData?.bulan_tahun)}
                            </p>
                        </div>
                    </div>

                    <div className="hidden xl:flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border-2 border-slate-900 italic">
                        <Info size={20} className="text-slate-900" />
                        <p className="text-xs font-bold text-slate-900">
                            Anda berada dalam mode tinjau pimpinan. Validasi dilakukan oleh Staf Penmad.
                        </p>
                    </div>
                </div>

                {/* Data Tabs */}
                <div className="flex overflow-x-auto gap-3 no-scrollbar bg-white p-2 rounded-2xl border-2 border-slate-900">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 border-2
                                ${activeTab === tab.id
                                    ? 'bg-white text-slate-900 border-slate-900 shadow-[4px_4px_0_0_#0f172a]'
                                    : 'text-slate-400 border-transparent hover:text-slate-900'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Layout Grid */}
            <div className="flex flex-col gap-8 items-start">
                <div className="w-full space-y-8">

                    <Card className="min-h-[400px]">
                        {activeTab === 'siswa' && <TableDataSiswa data={reportData?.siswa} />}
                        {activeTab === 'rekap_personal' && <TableDataRekapPersonal data={reportData?.rekap_personal} />}
                        {activeTab === 'guru' && <TableDataGuru data={reportData?.guru} />}
                        {activeTab === 'sarpras_mobiler' && (
                            <div className="space-y-12">
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase text-sm mb-4">A. Sarana Prasarana (Section C)</h3>
                                    <TableDataSarpras sarpras={reportData?.sarpras} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase text-sm mb-4">B. Data Mobiler</h3>
                                    <TableDataMobiler data={reportData?.mobiler} />
                                </div>
                            </div>
                        )}
                        {activeTab === 'keuangan' && <TableDataKeuangan data={reportData?.keuangan} />}
                    </Card>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card title="CATATAN VALIDATOR">
                        <div className="p-6 bg-slate-100 border-2 border-slate-200 rounded-3xl min-h-[150px]">
                            <p className="text-sm font-bold text-slate-500 italic">
                                {reportData?.catatan_revisi || 'Tidak ada catatan revisi untuk periode ini.'}
                            </p>
                        </div>
                    </Card>

                    <Card title="DATA IDENTITAS">
                        <div className="space-y-4 font-bold text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-slate-400 uppercase text-[10px]">NPSN</span>
                                <span className="text-slate-900">{reportData?.madrasah?.npsn}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-slate-400 uppercase text-[10px]">Kecamatan</span>
                                <span className="text-slate-900 uppercase">{reportData?.madrasah?.kecamatan}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 uppercase text-[10px]">Tgl Submit</span>
                                <span className="text-slate-900">
                                    {reportData?.submitted_at ? new Date(reportData.submitted_at).toLocaleDateString('id-ID') : '-'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Inner Components for Tables
function TableDataSiswa({ data }: any) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm font-bold border-collapse" style={{ minWidth: '1000px' }}>
                <thead>
                    <tr className="bg-white text-slate-900 border-b-[3px] border-slate-900">
                        <th className="p-4 rounded-tl-2xl">KELAS</th>
                        <th className="p-4 text-center">ROMBEL</th>
                        <th className="p-4 text-center">LK</th>
                        <th className="p-4 text-center">PR</th>
                        <th className="p-4 text-center">M. MASUK</th>
                        <th className="p-4 text-center">M. KELUAR</th>
                        <th className="p-4 text-center">TOTAL</th>
                        <th className="p-4 rounded-tr-2xl text-left">KETERANGAN</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100">
                    {data?.map((s: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors text-center font-bold">
                            <td className="p-5 text-slate-900 border-x-2 border-slate-50 text-left">{s.kelas}</td>
                            <td className="p-5 border-x-2 border-slate-50 text-slate-900">{s.jumlah_rombel}</td>
                            <td className="p-5 border-x-2 border-slate-50 text-slate-900">{s.jumlah_lk}</td>
                            <td className="p-5 border-x-2 border-slate-50 text-slate-900">{s.jumlah_pr}</td>
                            <td className="p-5 border-x-2 border-slate-50 text-slate-900">{s.mutasi_masuk || 0}</td>
                            <td className="p-5 border-x-2 border-slate-50 text-slate-900">{s.mutasi_keluar || 0}</td>
                            <td className="p-5 font-black text-slate-900 bg-slate-50 border-x-2 border-slate-100">{Number(s.jumlah_lk || 0) + Number(s.jumlah_pr || 0)}</td>
                            <td className="p-5 text-left italic text-xs font-normal border-x-2 border-slate-50 text-slate-500">{s.keterangan || '-'}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-white text-slate-900 font-black border-t-[3px] border-slate-900 uppercase text-[10px]">
                        <td colSpan={2} className="p-6 text-right px-8 border-r-2 border-slate-200">TOTAL KESELURUHAN</td>
                        <td className="p-6 text-center border-r-2 border-slate-200">{data?.reduce((sum: any, s: any) => sum + Number(s.jumlah_lk || 0), 0)}</td>
                        <td className="p-6 text-center border-r-2 border-slate-200">{data?.reduce((sum: any, s: any) => sum + Number(s.jumlah_pr || 0), 0)}</td>
                        <td className="p-6 text-center border-r-2 border-slate-200">{data?.reduce((sum: any, s: any) => sum + Number(s.mutasi_masuk || 0), 0)}</td>
                        <td className="p-6 text-center border-r-2 border-slate-200">{data?.reduce((sum: any, s: any) => sum + Number(s.mutasi_keluar || 0), 0)}</td>
                        <td className="p-6 text-center bg-slate-50 border-r-2 border-slate-200 text-base">
                            {data?.reduce((sum: any, s: any) => sum + (Number(s.jumlah_lk || 0) + Number(s.jumlah_pr || 0)), 0)}
                        </td>
                        <td className="p-6"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

function TableDataGuru({ data }: any) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm font-bold border-collapse" style={{ minWidth: '3200px' }}>
                <thead>
                    <tr className="bg-white text-slate-900 border-b-[3px] border-slate-900">
                        <th className="p-4 rounded-tl-2xl sticky left-0 z-10 bg-white">NAMA LENGKAP GURU</th>
                        <th className="p-4">NIP / NIK</th>
                        <th className="p-4 text-center">L/P</th>
                        <th className="p-4">TEMPAT LAHIR</th>
                        <th className="p-4">TANGGAL LAHIR</th>
                        <th className="p-4">STATUS PEGAWAI</th>
                        <th className="p-4">PENDIDIKAN</th>
                        <th className="p-4">JURUSAN</th>
                        <th className="p-4 text-center">GOL</th>
                        <th className="p-4">TMT GURU</th>
                        <th className="p-4">TMT MADRASAH</th>
                        <th className="p-4">MATA PELAJARAN</th>
                        <th className="p-4">SATMINKAL</th>
                        <th className="p-4 text-center">JAM</th>
                        <th className="p-4">JABATAN</th>
                        <th className="p-4">IBU KANDUNG</th>
                        <th className="p-4 text-center">SERTIFIKASI</th>
                        <th className="p-4 rounded-tr-2xl text-center">MUTASI</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100">
                    {data?.map((g: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-5 font-black text-slate-900 border-x-2 border-slate-50 sticky left-0 z-10 bg-white group-hover:bg-slate-50">{g.nama_guru}</td>
                            <td className="p-5 text-slate-400 font-mono border-x-2 border-slate-50 uppercase">{g.nip_nik}</td>
                            <td className="p-5 text-center border-x-2 border-slate-50">{g.lp}</td>
                            <td className="p-5 border-x-2 border-slate-50">{g.tempat_lahir}</td>
                            <td className="p-5 border-x-2 border-slate-50 whitespace-nowrap">{g.tanggal_lahir}</td>
                            <td className="p-5 uppercase text-[10px] border-x-2 border-slate-50">{g.status_pegawai}</td>
                            <td className="p-5 border-x-2 border-slate-50">{g.pendidikan_terakhir}</td>
                            <td className="p-5 border-x-2 border-slate-50 text-[11px]">{g.jurusan}</td>
                            <td className="p-5 text-center border-x-2 border-slate-50">{g.golongan}</td>
                            <td className="p-5 border-x-2 border-slate-50 whitespace-nowrap">{g.tmt_mengajar}</td>
                            <td className="p-5 border-x-2 border-slate-50 whitespace-nowrap">{g.tmt_di_madrasah}</td>
                            <td className="p-5 border-x-2 border-slate-50 text-[11px]">{g.mata_pelajaran}</td>
                            <td className="p-5 border-x-2 border-slate-50 text-[11px]">{g.satminkal}</td>
                            <td className="p-5 text-center font-black border-x-2 border-slate-50">{g.jumlah_jam}</td>
                            <td className="p-5 uppercase text-[11px] border-x-2 border-slate-50">{g.jabatan}</td>
                            <td className="p-5 border-x-2 border-slate-50 text-[11px]">{g.nama_ibu_kandung}</td>
                            <td className="p-5 text-center border-x-2 border-slate-50">
                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border-2 ${g.sertifikasi ? 'bg-white text-slate-900 border-slate-900 shadow-[2px_2px_0_0_#0f172a]' : 'bg-white text-slate-300 border-slate-200'}`}>
                                    {g.sertifikasi ? 'YA' : 'TIDAK'}
                                </span>
                            </td>
                            <td className="p-5 text-center border-x-2 border-slate-50">
                                <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white border-2 border-slate-900 text-slate-900">
                                    {g.mutasi_status || 'AKTIF'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TableDataSarpras({ sarpras }: any) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm font-bold border-collapse" style={{ minWidth: '1100px' }}>
                <thead>
                    <tr className="bg-white text-slate-900 border-b-[3px] border-slate-900">
                        <th className="p-4 rounded-tl-2xl sticky left-0 z-10 bg-white">JENIS ASET</th>
                        <th className="p-4">LUAS</th>
                        <th className="p-4 text-center">BAIK</th>
                        <th className="p-4 text-center">RR</th>
                        <th className="p-4 text-center">RB</th>
                        <th className="p-4 text-center">KURANG</th>
                        <th className="p-4 text-center">REHAB</th>
                        <th className="p-4 text-center">TOTAL</th>
                        <th className="p-4 rounded-tr-2xl text-left">KETERANGAN</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100">
                    {sarpras?.map((s: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors group font-bold">
                            <td className="p-5 text-slate-900 border-x-2 border-slate-50 sticky left-0 z-10 bg-white group-hover:bg-slate-50">{s.jenis_aset}</td>
                            <td className="p-5 font-mono text-slate-400 border-x-2 border-slate-50">{s.luas}</td>
                            <td className="p-5 text-center text-slate-900 border-x-2 border-slate-50">{s.kondisi_baik || 0}</td>
                            <td className="p-5 text-center text-slate-900 border-x-2 border-slate-50">{s.kondisi_rusak_ringan || 0}</td>
                            <td className="p-5 text-center text-slate-900 border-x-2 border-slate-50">{s.kondisi_rusak_berat || 0}</td>
                            <td className="p-5 text-center text-slate-900 border-x-2 border-slate-50">{s.kekurangan || 0}</td>
                            <td className="p-5 text-center text-slate-900 border-x-2 border-slate-50">{s.perlu_rehab || 0}</td>
                            <td className="p-5 text-center bg-white text-slate-900 font-black border-x-2 border-slate-200 border-b-[2px]">{Number(s.kondisi_baik || 0) + Number(s.kondisi_rusak_ringan || 0) + Number(s.kondisi_rusak_berat || 0)}</td>
                            <td className="p-5 text-left italic text-xs font-normal border-x-2 border-slate-50 text-slate-500">{s.keterangan || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TableDataRekapPersonal({ data }: any) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm font-bold border-collapse" style={{ minWidth: '800px' }}>
                <thead>
                    <tr className="bg-white text-slate-900 border-b-[3px] border-slate-900">
                        <th className="p-4 rounded-tl-2xl">KEADAAN</th>
                        <th className="p-4 text-center">LK</th>
                        <th className="p-4 text-center">PR</th>
                        <th className="p-4 text-center">MASUK</th>
                        <th className="p-4 text-center">KELUAR</th>
                        <th className="p-4 text-center">TOTAL</th>
                        <th className="p-4 rounded-tr-2xl text-left">KETERANGAN</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 text-center font-bold">
                    {data?.map((r: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="p-5 text-slate-900 border-x-2 border-slate-50 text-left">{r.keadaan}</td>
                            <td className="p-5 border-x-2 border-slate-50 text-slate-900">{r.jumlah_lk || 0}</td>
                            <td className="p-5 border-x-2 border-slate-50 text-slate-900">{r.jumlah_pr || 0}</td>
                            <td className="p-5 border-x-2 border-slate-50 text-slate-900">{r.mutasi_masuk || 0}</td>
                            <td className="p-5 border-x-2 border-slate-50 text-slate-900">{r.mutasi_keluar || 0}</td>
                            <td className="p-5 font-black text-slate-900 bg-slate-50 border-x-2 border-slate-100">{Number(r.jumlah_lk || 0) + Number(r.jumlah_pr || 0)}</td>
                            <td className="p-5 text-left italic text-xs font-normal border-x-2 border-slate-50 whitespace-normal text-slate-500">{r.keterangan || '-'}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-white text-slate-900 font-black border-t-[3px] border-slate-900 uppercase text-[10px]">
                        <td className="p-6 text-right px-8 border-r-2 border-slate-200">TOTAL</td>
                        <td className="p-6 text-center border-r-2 border-slate-200">{data?.reduce((sum: any, r: any) => sum + Number(r.jumlah_lk || 0), 0)}</td>
                        <td className="p-6 text-center border-r-2 border-slate-200">{data?.reduce((sum: any, r: any) => sum + Number(r.jumlah_pr || 0), 0)}</td>
                        <td className="p-6 text-center border-r-2 border-slate-200">{data?.reduce((sum: any, r: any) => sum + Number(r.mutasi_masuk || 0), 0)}</td>
                        <td className="p-6 text-center border-r-2 border-slate-200">{data?.reduce((sum: any, r: any) => sum + Number(r.mutasi_keluar || 0), 0)}</td>
                        <td className="p-6 text-center bg-slate-50 border-r-2 border-slate-200 text-base">
                            {data?.reduce((sum: any, r: any) => sum + (Number(r.jumlah_lk || 0) + Number(r.jumlah_pr || 0)), 0)}
                        </td>
                        <td className="p-6"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

function TableDataKeuangan({ data }: any) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm font-bold border-collapse" style={{ minWidth: '1000px' }}>
                <thead>
                    <tr className="bg-white text-slate-900 border-b-[3px] border-slate-900">
                        <th className="p-4 rounded-tl-2xl">URAIAN KEGIATAN</th>
                        <th className="p-4 text-center">SATUAN</th>
                        <th className="p-4 text-center">VOLUME</th>
                        <th className="p-4 text-right">HARGA SATUAN</th>
                        <th className="p-4 rounded-tr-2xl text-right">TOTAL (RP)</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 italic font-bold">
                    {data?.map((k: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="p-5 text-slate-900 uppercase tracking-tighter border-x-2 border-slate-50 not-italic">{k.uraian_kegiatan}</td>
                            <td className="p-5 text-center border-x-2 border-slate-50 uppercase text-[10px] text-slate-900">{k.satuan}</td>
                            <td className="p-5 text-center border-x-2 border-slate-50 text-slate-900">{k.volume}</td>
                            <td className="p-5 text-right font-mono text-slate-400 border-x-2 border-slate-50">
                                {Number(k.harga_satuan || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="p-5 text-right font-mono text-slate-900 bg-slate-50 border-x-2 border-slate-100">
                                {Number(Number(k.volume || 0) * Number(k.harga_satuan || 0)).toLocaleString('id-ID')}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-white text-slate-900 font-black border-t-[3px] border-slate-900 uppercase tracking-[0.2em] text-[11px]">
                        <td colSpan={4} className="p-6 text-right px-8">TOTAL BIAYA KESELURUHAN</td>
                        <td className="p-6 text-right text-base text-slate-900 font-mono border-l-2 border-slate-200">
                            RP {data?.reduce((sum: any, k: any) => sum + (Number(k.volume || 0) * Number(k.harga_satuan || 0)), 0).toLocaleString('id-ID')}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

function TableDataMobiler({ data }: any) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm font-bold border-collapse" style={{ minWidth: '950px' }}>
                <thead>
                    <tr className="bg-white text-slate-900 border-b-[3px] border-slate-900">
                        <th className="p-4 rounded-tl-2xl sticky left-0 z-10 bg-white">NAMA BARANG</th>
                        <th className="p-4 text-center">TOTAL</th>
                        <th className="p-4 text-center">BAIK</th>
                        <th className="p-4 text-center">RR</th>
                        <th className="p-4 text-center">RB</th>
                        <th className="p-4 text-center">KURANG</th>
                        <th className="p-4 rounded-tr-2xl text-left">KETERANGAN</th>
                    </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 text-center font-bold italic">
                    {data?.map((m: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-5 text-slate-900 border-x-2 border-slate-50 text-left sticky left-0 z-10 bg-white group-hover:bg-slate-50 not-italic">{m.nama_barang}</td>
                            <td className="p-5 font-mono border-x-2 border-slate-50 text-slate-400">{m.jumlah_total || 0}</td>
                            <td className="p-5 text-slate-900 border-x-2 border-slate-50">{m.kondisi_baik || 0}</td>
                            <td className="p-5 text-slate-900 border-x-2 border-slate-50">{m.kondisi_rusak_ringan || 0}</td>
                            <td className="p-5 text-slate-900 border-x-2 border-slate-50">{m.kondisi_rusak_berat || 0}</td>
                            <td className="p-5 text-slate-900 border-x-2 border-slate-50">{m.kekurangan || 0}</td>
                            <td className="p-5 bg-slate-50 text-left italic text-xs font-normal border-x-2 border-slate-50 whitespace-normal text-slate-500">{m.keterangan || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
