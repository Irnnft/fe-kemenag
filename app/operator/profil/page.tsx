'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, MapPin, Building, User, Loader2, ChevronDown } from 'lucide-react';
import { KECAMATAN_KAMPAR } from '@/lib/constants';
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
                <div />
                <Button
                    className="w-full md:w-auto py-6 px-10 text-xl font-black bg-emerald-700 shadow-xl"
                    icon={<Save size={24} />}
                    onClick={handleSave}
                    isLoading={isSaving}
                >
                    SIMPAN PERUBAHAN
                </Button>
            </div>

            {/* Top Section - Pimpinan & Lokasi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Pimpinan Lembaga">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Nama Kepala Madrasah" value={madrasah?.nama_kepala || ''} onChange={e => updateField('nama_kepala', e.target.value)} />
                        <Input label="NIP / NIK" value={madrasah?.nip_kepala || ''} onChange={e => updateField('nip_kepala', e.target.value)} />
                    </div>
                </Card>

                <Card title="Titik Koordinat">
                    <div className="grid grid-cols-2 gap-6">
                        <Input label="Latitude" value={madrasah?.latitude || ''} onChange={e => updateField('latitude', e.target.value)} />
                        <Input label="Longitude" value={madrasah?.longitude || ''} onChange={e => updateField('longitude', e.target.value)} />
                    </div>
                </Card>
            </div>

            {/* Bottom Section - Identitas & Alamat */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Identitas Utama */}
                <div className="space-y-8">
                    <Card title="Identitas Madrasah">
                        <div className="space-y-6">
                            <Input label="Nama Madrasah" value={madrasah?.nama_madrasah || ''} onChange={e => updateField('nama_madrasah', e.target.value)} placeholder="Masukkan nama..." />
                            <div className="grid grid-cols-2 gap-6">
                                <Input label="NSM" value={madrasah?.nsm || ''} onChange={e => updateField('nsm', e.target.value)} />
                                <Input label="NPSN" value={madrasah?.npsn || ''} onChange={e => updateField('npsn', e.target.value)} />
                            </div>
                            <Input label="No. Piagam Izin Operasional" value={madrasah?.no_piagam || ''} onChange={e => updateField('no_piagam', e.target.value)} />
                            <div className="grid grid-cols-2 gap-6">
                                <Input label="Status" value={madrasah?.status_madrasah || ''} onChange={e => updateField('status_madrasah', e.target.value)} />
                                <Input label="Akreditasi" value={madrasah?.akreditasi || ''} onChange={e => updateField('akreditasi', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <Input label="Tahun Berdiri" value={madrasah?.tahun_berdiri || ''} onChange={e => updateField('tahun_berdiri', e.target.value)} />
                                <Input label="Kode Satker (Negeri)" value={madrasah?.kode_satker || ''} onChange={e => updateField('kode_satker', e.target.value)} />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Kontak */}
                <div className="space-y-8">
                    <Card title="Alamat & Kontak">
                        <div className="space-y-6">
                            <Input label="Alamat Lengkap" value={madrasah?.alamat || ''} onChange={e => updateField('alamat', e.target.value)} />
                            <div className="grid grid-cols-2 gap-6">
                                <Input label="Desa/Kelurahan" value={madrasah?.desa || ''} onChange={e => updateField('desa', e.target.value)} />
                                <div className="space-y-2 relative group">
                                    <label className="input-label">Kecamatan</label>
                                    <div className="relative">
                                        <select
                                            className="select-field border-2 appearance-none pr-12 hover:border-emerald-500 transition-all cursor-pointer uppercase font-bold"
                                            value={madrasah?.kecamatan || ''}
                                            onChange={e => updateField('kecamatan', e.target.value)}
                                        >
                                            <option value="">Pilih Kecamatan</option>
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
                            <div className="grid grid-cols-2 gap-6">
                                <Input label="Kabupaten/Kota" value={madrasah?.kabupaten || ''} onChange={e => updateField('kabupaten', e.target.value)} />
                                <Input label="Provinsi" value={madrasah?.provinsi || ''} onChange={e => updateField('provinsi', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-slate-100">
                                <Input label="No. Telp Kepala" value={madrasah?.telp_kepala || ''} onChange={e => updateField('telp_kepala', e.target.value)} />
                                <Input label="Email Madrasah" value={madrasah?.email_madrasah || ''} onChange={e => updateField('email_madrasah', e.target.value)} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
