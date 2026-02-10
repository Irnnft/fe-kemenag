'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, ArrowLeft, MessageSquare, School } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLaporanVerifyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('siswa');

    const handleAction = (action: 'accept' | 'reject') => {
        // Mock action
        alert(action === 'accept' ? 'Laporan Diterima' : 'Laporan dikembalikan untuk revisi');
        router.push('/admin/laporan');
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Validation Header */}
            {/* Validation Header */}
            <div className="bg-white border-b-8 border-slate-900 p-8 md:p-10 sticky top-20 z-20 shadow-2xl -mx-4 md:-mx-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div className="flex items-start md:items-center gap-6 w-full xl:w-auto">
                    <Link href="/admin/laporan">
                        <Button variant="outline" className="h-16 w-16 p-0 rounded-2xl justify-center border-4 border-slate-900 hover:bg-slate-100 shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all">
                            <ArrowLeft size={32} />
                        </Button>
                    </Link>
                    <div className="w-20 h-20 bg-emerald-100 rounded-3xl border-4 border-emerald-800 flex items-center justify-center shrink-0 shadow-lg">
                        <School className="text-emerald-900" size={44} />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-md border-2 border-amber-400 uppercase tracking-widest">Menunggu Validasi</span>
                            <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-md border-2 border-slate-300 uppercase tracking-widest">Laporan ID: {id}</span>
                        </div>
                        <h2 className="font-black text-3xl md:text-4xl text-slate-900 uppercase tracking-tighter leading-none">RA AL ITTIHAD</h2>
                        <p className="text-slate-500 font-bold italic text-sm mt-1 uppercase tracking-wider">Laporan Bulanan: Januari 2024</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto pt-4 xl:pt-0 border-t-2 xl:border-t-0 border-slate-100">
                    <Button
                        variant="danger"
                        className="flex-1 xl:flex-none py-6 px-10 text-xl font-black bg-white text-red-700 border-4 border-red-600 hover:bg-red-50 shadow-[6px_6px_0_0_#991b1b] active:translate-y-1 active:shadow-none transition-all"
                        icon={<XCircle size={28} />}
                        onClick={() => handleAction('reject')}
                    >
                        MINTA REVISI
                    </Button>
                    <Button
                        variant="primary"
                        className="flex-1 xl:flex-none py-6 px-10 text-xl font-black bg-emerald-700 hover:bg-emerald-800 shadow-[6px_6px_0_0_#064e3b] active:translate-y-1 active:shadow-none transition-all"
                        icon={<CheckCircle size={28} />}
                        onClick={() => handleAction('accept')}
                    >
                        TERIMA LAPORAN
                    </Button>
                </div>
            </div>

            {/* Preview Content (Simplified for Read Only) */}
            <div className="grid gap-10 mt-10">
                <Card title="A. Data Rekapitulasi Siswa">
                    <div className="overflow-x-auto rounded-xl border-4 border-slate-100">
                        <table className="w-full text-lg border-collapse">
                            <thead className="bg-slate-900 text-white font-black uppercase text-xs tracking-widest">
                                <tr>
                                    <th className="p-6 text-left">Kelompok Kelas</th>
                                    <th className="p-6 text-center">Jml Rombel</th>
                                    <th className="p-6 text-center">Siswa Awal</th>
                                    <th className="p-6 text-center text-blue-300">Masuk</th>
                                    <th className="p-6 text-center text-red-300">Keluar</th>
                                    <th className="p-6 text-center bg-emerald-900">Total Akhir</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-100">
                                <tr className="font-bold hover:bg-slate-50 transition-colors">
                                    <td className="p-6 text-left px-8 text-slate-900 font-black">KELOMPOK A</td>
                                    <td className="p-6 text-center">1</td>
                                    <td className="p-6 text-center">19</td>
                                    <td className="p-6 text-center text-blue-700">0</td>
                                    <td className="p-6 text-center text-red-700">0</td>
                                    <td className="p-6 text-center font-black text-2xl text-emerald-900 bg-emerald-50/50">19</td>
                                </tr>
                                <tr className="font-bold hover:bg-slate-50 transition-colors">
                                    <td className="p-6 text-left px-8 text-slate-900 font-black">KELOMPOK B</td>
                                    <td className="p-6 text-center">1</td>
                                    <td className="p-6 text-center">19</td>
                                    <td className="p-6 text-center text-blue-700">0</td>
                                    <td className="p-6 text-center text-red-700">0</td>
                                    <td className="p-6 text-center font-black text-2xl text-emerald-900 bg-emerald-50/50">19</td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-slate-50">
                                <tr className="font-black text-slate-900">
                                    <td className="p-6 text-left px-8 uppercase tracking-widest text-sm">Total Keseluruhan</td>
                                    <td className="p-6 text-center">2</td>
                                    <td className="p-6 text-center">38</td>
                                    <td className="p-6 text-center text-blue-800">0</td>
                                    <td className="p-6 text-center text-red-800">0</td>
                                    <td className="p-6 text-center text-3xl font-black bg-emerald-100 text-emerald-900 border-l-4 border-emerald-300">38</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-8">
                    <Card title="Catatan Validator (Opsional)">
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Berikan alasan jika membutuhkan revisi</label>
                            <textarea
                                className="w-full p-6 text-lg font-bold border-4 border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 min-h-[180px] transition-all placeholder:text-slate-300 shadow-inner bg-slate-50/30"
                                placeholder="Tulis catatan revisi di sini..."
                            ></textarea>
                        </div>
                    </Card>

                    <Card title="Info Tambahan">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center py-3 border-b-2 border-slate-50">
                                <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Tipe Madrasah</span>
                                <span className="font-black text-slate-900">RAUDHATUL ATHFAL (RA)</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b-2 border-slate-50">
                                <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">NPSN</span>
                                <span className="font-black text-slate-900">69727500</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b-2 border-slate-50">
                                <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Terakhir Diupdate</span>
                                <span className="font-black text-slate-900 uppercase">12 JAN 2024</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
