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
            <div className="bg-white border-b-4 border-slate-900 p-8 sticky top-20 z-20 shadow-xl -mx-4 md:-mx-8 md:px-10 flex flex-col xl:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6 w-full xl:w-auto">
                    <Link href="/admin/laporan">
                        <Button variant="outline" className="h-16 w-16 p-0 rounded-2xl justify-center border-4 border-slate-900 hover:bg-slate-100 shadow-md">
                            <ArrowLeft size={32} />
                        </Button>
                    </Link>
                    <div className="w-20 h-20 bg-emerald-50 rounded-2xl border-4 border-emerald-200 flex items-center justify-center shrink-0">
                        <School className="text-emerald-700" size={40} />
                    </div>
                    <div>
                        <h2 className="font-black text-3xl text-slate-900 uppercase tracking-tighter">Validasi Laporan: RA AL ITTIHAD</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-black text-amber-900 bg-amber-100 px-4 py-1.5 rounded-full border-2 border-amber-400 uppercase tracking-widest">Menunggu Validasi</span>
                            <span className="text-xs font-black text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full border-2 border-slate-300 uppercase tracking-widest">ID: {id}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 w-full xl:w-auto">
                    <Button
                        variant="danger"
                        className="flex-1 xl:flex-none py-5 px-10 text-xl font-black bg-red-50 text-red-700 border-4 border-red-200 hover:bg-red-100"
                        icon={<XCircle size={28} />}
                        onClick={() => handleAction('reject')}
                    >
                        MINTA REVISI
                    </Button>
                    <Button
                        variant="primary"
                        className="flex-1 xl:flex-none py-5 px-10 text-xl font-black bg-emerald-700 hover:bg-emerald-800 shadow-xl"
                        icon={<CheckCircle size={28} />}
                        onClick={() => handleAction('accept')}
                    >
                        TERIMA LAPORAN
                    </Button>
                </div>
            </div>

            {/* Preview Content (Simplified for Read Only) */}
            <div className="grid gap-6">
                <Card title="A. Rekapitulasi Siswa">
                    <div className="overflow-x-auto">
                        <table className="w-full text-lg border-collapse text-center border-2 border-slate-300">
                            <thead className="bg-slate-100 text-slate-900 font-black uppercase">
                                <tr>
                                    <th className="border-2 p-3">Kelas</th>
                                    <th className="border-2 p-3">Jml Rombel</th>
                                    <th className="border-2 p-3">Siswa (L+P)</th>
                                    <th className="border-2 p-3">Mutasi Masuk</th>
                                    <th className="border-2 p-3">Mutasi Keluar</th>
                                    <th className="border-2 p-3 font-black text-emerald-800">Total Akhir</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="font-bold">
                                    <td className="border-2 p-4 text-left px-6">Kel A</td>
                                    <td className="border-2 p-4">1</td>
                                    <td className="border-2 p-4">19</td>
                                    <td className="border-2 p-4 text-blue-700">0</td>
                                    <td className="border-2 p-4 text-red-700">0</td>
                                    <td className="border-2 p-4 font-black text-xl text-slate-900 bg-slate-50">19</td>
                                </tr>
                                <tr className="font-bold">
                                    <td className="border-2 p-4 text-left px-6">Kel B</td>
                                    <td className="border-2 p-4">1</td>
                                    <td className="border-2 p-4">19</td>
                                    <td className="border-2 p-4 text-blue-700">0</td>
                                    <td className="border-2 p-4 text-red-700">0</td>
                                    <td className="border-2 p-4 font-black text-xl text-slate-900 bg-slate-50">19</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card title="Catatan Validator">
                    <textarea
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                        placeholder="Tulis catatan revisi jika ada kesalahan data..."
                    ></textarea>
                </Card>
            </div>
        </div>
    );
}
