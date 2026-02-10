'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, MapPin, Building, User, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function ProfilMadrasahPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [madrasah, setMadrasah] = useState<any>(null);

    const fetchProfil = async () => {
        setIsLoading(true);
        try {
            const response = await api.operator.getMyMadrasah();
            const data = await response.json();
            if (response.ok) {
                setMadrasah(data);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfil();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await api.operator.updateMyMadrasah(madrasah);
            if (response.ok) {
                alert('Profil berhasil diperbarui!');
            } else {
                alert('Gagal memperbarui profil.');
            }
        } catch (error) {
            alert('Kesalahan koneksi');
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = (key: string, value: any) => {
        setMadrasah({ ...madrasah, [key]: value });
    };

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-emerald-700" size={64} />
                <p className="font-black text-slate-900 uppercase tracking-widest">Memuat Data Profil...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Profil Madrasah</h1>
                    <p className="text-lg font-bold text-slate-500 mt-2 uppercase tracking-wide">Data identitas dan kontak lembaga.</p>
                </div>
                <Button
                    className="w-full md:w-auto py-6 px-10 text-xl font-black bg-emerald-700 shadow-xl"
                    icon={<Save size={24} />}
                    onClick={handleSave}
                    isLoading={isSaving}
                >
                    SIMPAN PERUBAHAN
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column - Identity */}
                <div className="lg:col-span-2 space-y-10">
                    <Card title="Identitas Madrasah">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input label="Nama Madrasah" value={madrasah?.nama_madrasah || ''} onChange={e => updateField('nama_madrasah', e.target.value)} placeholder="Masukkan nama..." />
                            <Input label="NSM (Nomor Statistik Madrasah)" value={madrasah?.nsm || ''} onChange={e => updateField('nsm', e.target.value)} />
                            <Input label="NPSN" value={madrasah?.npsn || ''} onChange={e => updateField('npsn', e.target.value)} />
                            <Input label="No. Piagam Izin Operasional" value={madrasah?.no_piagam || ''} onChange={e => updateField('no_piagam', e.target.value)} />
                            <Input label="Status Madrasah" value={madrasah?.status_madrasah || ''} onChange={e => updateField('status_madrasah', e.target.value)} />
                            <Input label="Nilai Akreditasi / Tahun" value={madrasah?.akreditasi || ''} onChange={e => updateField('akreditasi', e.target.value)} />
                            <Input label="Tahun Berdiri" value={madrasah?.tahun_berdiri || ''} onChange={e => updateField('tahun_berdiri', e.target.value)} />
                            <Input label="Kode Satker" value={madrasah?.kode_satker || ''} onChange={e => updateField('kode_satker', e.target.value)} placeholder="(Khusus Negeri)" />
                        </div>
                    </Card>

                    <Card title="Alamat & Kontak">
                        <div className="grid grid-cols-1 gap-8">
                            <Input label="Alamat / Jalan" value={madrasah?.alamat || ''} onChange={e => updateField('alamat', e.target.value)} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input label="Desa / Kelurahan" value={madrasah?.desa || ''} onChange={e => updateField('desa', e.target.value)} />
                                <Input label="Kecamatan" value={madrasah?.kecamatan || ''} onChange={e => updateField('kecamatan', e.target.value)} />
                                <Input label="Kabupaten / Kota" value={madrasah?.kabupaten || ''} onChange={e => updateField('kabupaten', e.target.value)} />
                                <Input label="Provinsi" value={madrasah?.provinsi || ''} onChange={e => updateField('provinsi', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input label="No. Telp Kepala Madrasah" value={madrasah?.telp_kepala || ''} onChange={e => updateField('telp_kepala', e.target.value)} />
                                <Input label="Email Madrasah" value={madrasah?.email_madrasah || ''} onChange={e => updateField('email_madrasah', e.target.value)} />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Map/Coords */}
                <div className="space-y-10">
                    <Card title="Titik Koordinat">
                        <div className="space-y-8">
                            <div className="bg-slate-100 rounded-3xl h-56 w-full flex flex-col items-center justify-center text-slate-400 border-4 border-dashed border-slate-200">
                                <MapPin size={64} className="mb-4 text-emerald-700 opacity-50" />
                                <span className="font-black text-xs uppercase tracking-widest">Buka Google Maps</span>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <Input label="Latitude" value={madrasah?.latitude || ''} onChange={e => updateField('latitude', e.target.value)} />
                                <Input label="Longitude" value={madrasah?.longitude || ''} onChange={e => updateField('longitude', e.target.value)} />
                            </div>
                            <Button variant="outline" className="w-full justify-center py-4 text-lg font-black border-4 border-slate-200 text-slate-500 hover:bg-white hover:border-emerald-500 transition-all">
                                AMBIL LOKASI OTOMATIS
                            </Button>
                        </div>
                    </Card>

                    <Card title="Pimpinan Lembaga">
                        <div className="flex flex-col items-center text-center p-6">
                            <div className="w-40 h-40 rounded-[2.5rem] bg-emerald-50 mb-8 overflow-hidden border-4 border-emerald-600 shadow-xl flex items-center justify-center group relative">
                                <User size={80} className="text-emerald-700 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="space-y-4 w-full text-left">
                                <Input label="Nama Kepala Madrasah" value={madrasah?.nama_kepala || ''} onChange={e => updateField('nama_kepala', e.target.value)} />
                                <Input label="NIP / NIK" value={madrasah?.nip_kepala || ''} onChange={e => updateField('nip_kepala', e.target.value)} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
