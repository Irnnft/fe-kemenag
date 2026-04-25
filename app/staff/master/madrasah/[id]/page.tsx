'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import {
    School as SchoolIcon,
    MapPin,
    Phone,
    Mail,
    User,
    Calendar,
    Award,
    CheckCircle2,
    XCircle,
    Loader2,
    Building2,
    Users,
} from 'lucide-react';

export default function DetailMadrasahPage() {
    const params = useParams();
    const router = useRouter();
    const [school, setSchool] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const id = params?.id;

    useEffect(() => {
        if (id) {
            fetchDetail();
        }
    }, [id]);

    const fetchDetail = async () => {
        try {
            const response = await api.master.getMadrasahById(id as string);
            if (response.ok) {
                const data = await response.json();
                setSchool(data);
            } else {
                alert('Gagal mengambil data madrasah');
                router.push('/staff/master/madrasah');
            }
        } catch (error) {
            alert('Terjadi kesalahan koneksi');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="animate-spin text-emerald-700" size={60} />
            </div>
        );
    }

    if (!school) return null;

    return (
        <div className="space-y-8 pb-10">

            {/* Main Profile Header */}
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    <div className="w-32 h-32 bg-white border-4 border-slate-100 rounded-3xl flex items-center justify-center text-emerald-700 shadow-md shrink-0">
                        <SchoolIcon size={64} />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none mb-3">{school.nama_madrasah}</h2>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <div className="px-4 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-slate-600 text-sm font-black tracking-wider">
                                    NPSN: {school.npsn}
                                </div>
                                <div className="px-4 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-slate-600 text-sm font-black tracking-wider">
                                    NSM: {school.nsm || '-'}
                                </div>
                                <div className={`px-4 py-1.5 rounded-lg border text-sm font-black tracking-wider flex items-center gap-2 ${school.status_aktif == 1 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                    {school.status_aktif == 1 ? (
                                        <><CheckCircle2 size={16} /> AKTIF</>
                                    ) : (
                                        <><XCircle size={16} /> NON-AKTIF</>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pt-2">
                            <div className="flex items-center gap-2 text-slate-500 font-bold">
                                <MapPin size={18} />
                                <span className="uppercase">{school.alamat || 'Alamat tidak tersedia'}</span>
                            </div>
                            {(school.kecamatan || school.kabupaten) && (
                                <div className="flex items-center gap-2 text-slate-500 font-bold">
                                    <Building2 size={18} />
                                    <span className="uppercase">{school.kecamatan}, {school.kabupaten}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* THE ONE CARD - EVERYTHING INTEGRATED */}
            <Card className="overflow-hidden">
                <div className="space-y-12">
                    
                    {/* Part 1: Academic Stats (4 Columns) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <Award size={14} className="text-emerald-500" /> Akreditasi
                            </label>
                            <p className="text-xl font-bold text-slate-900">{school.akreditasi || 'Belum Terakreditasi'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <Calendar size={14} className="text-emerald-500" /> Tahun Berdiri
                            </label>
                            <p className="text-xl font-bold text-slate-900">{school.tahun_berdiri || '-'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <SchoolIcon size={14} className="text-emerald-500" /> Status Madrasah
                            </label>
                            <p className="text-xl font-bold text-slate-900 uppercase">{school.status_madrasah || '-'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <MapPin size={14} className="text-emerald-500" /> Lokasi
                            </label>
                            <p className="text-base font-bold text-slate-900 font-mono">
                                {school.latitude}, {school.longitude}
                            </p>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Part 2: Contact & Operator (Two Columns Side-by-Side) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        
                        {/* Left: Contact & Headmaster */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Kontak & Kepala</h3>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-6">
                                <div className="w-16 h-16 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                                    <User size={32} />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Kepala Madrasah</label>
                                    <p className="text-xl font-black text-slate-900 uppercase">{school.nama_kepala || 'Belum Diisi'}</p>
                                    <p className="text-sm font-bold text-slate-500 mt-1">NIP: {school.nip_kepala || '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                        <Phone size={14} /> Telepon
                                    </label>
                                    <p className="text-lg font-bold text-slate-900">{school.telp_kepala || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                        <Mail size={14} /> Email
                                    </label>
                                    <p className="text-lg font-bold text-slate-900 truncate" title={school.email_madrasah}>
                                        {school.email_madrasah || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Operator Accounts */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Akun Operator</h3>
                            </div>

                            <div className="space-y-4">
                                {school.users && school.users.length > 0 ? (
                                    school.users.map((user: any) => (
                                        <div key={user.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex justify-between items-center group hover:border-emerald-200 transition-colors">
                                            <div>
                                                <p className="font-bold text-base text-slate-900">{user.name || user.username}</p>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mt-0.5">{user.role?.replace('_', ' ')}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                AKTIF
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 font-bold italic">
                                        Belum ada operator terdaftar
                                    </div>
                                )}

                                <Button
                                    className="w-full btn-primary py-4 shadow-lg shadow-emerald-900/10 mt-4"
                                    onClick={() => router.push('/staff/master/users')}
                                >
                                    KELOLA AKSES OPERATOR
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

        </div>
    );
}
