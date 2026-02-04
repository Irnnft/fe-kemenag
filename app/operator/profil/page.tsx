'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, MapPin, Building, User } from 'lucide-react';

export default function ProfilMadrasahPage() {
    return (
        <div className="space-y-10 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase">Profil Madrasah</h1>
                    <p className="text-lg font-bold text-slate-600 mt-1 italic">Data identitas dan kontak lembaga</p>
                </div>
                <Button
                    className="py-5 px-10 text-xl font-black bg-emerald-700 shadow-xl"
                    icon={<Save size={24} />}
                >
                    SIMPAN PERUBAHAN
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column - Identity */}
                <div className="lg:col-span-2 space-y-10">
                    <Card title="Identitas Madrasah">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input label="Nama Madrasah" defaultValue="RA AL ITTIHAD" placeholder="Masukkan nama..." />
                            <Input label="NSM (Nomor Statistik Madrasah)" defaultValue="101.2.14.01.0056" />
                            <Input label="NPSN" defaultValue="69995016" />
                            <Input label="No. Piagam Izin Operasional" defaultValue="Kd.04.02/04/RA/PP.00/006/2017" />
                            <Input label="Status Madrasah" defaultValue="Swasta" />
                            <Input label="Nilai Akreditasi / Tahun" defaultValue="B / Tahun 2022" />
                            <Input label="Tahun Berdiri" defaultValue="2017" />
                            <Input label="Kode Satker" defaultValue="(Khusus Negeri)" disabled />
                        </div>
                    </Card>

                    <Card title="Alamat & Kontak">
                        <div className="grid grid-cols-1 gap-8">
                            <Input label="Jalan" defaultValue="JL. TUANKU TAMBUSAI" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input label="Desa / Kelurahan" defaultValue="TAPUNG MAKMUR" />
                                <Input label="Kecamatan" defaultValue="TAPUNG HILIR" />
                                <Input label="Kabupaten / Kota" defaultValue="KAMPAR" />
                                <Input label="Provinsi" defaultValue="RIAU" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input label="No. Telp Kepala Madrasah" defaultValue="082288622569" />
                                <Input label="Email" defaultValue="ra.alittihad17@gmail.com" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Map/Coords */}
                <div className="space-y-10">
                    <Card title="Titik Koordinat">
                        <div className="space-y-8">
                            <div className="bg-slate-100 rounded-2xl h-56 w-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-300">
                                <MapPin size={64} className="mb-4 text-emerald-700" />
                                <span className="font-bold text-lg uppercase tracking-widest">Map Preview</span>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <Input label="Latitude" defaultValue="0,3768444" />
                                <Input label="Longitude" defaultValue="101,099106" />
                            </div>
                            <Button variant="outline" className="w-full justify-center py-4 text-lg font-black border-2 border-slate-400">
                                AMBIL LOKASI SAAT INI
                            </Button>
                        </div>
                    </Card>

                    <Card title="Kepala Madrasah">
                        <div className="flex flex-col items-center text-center p-6">
                            <div className="w-32 h-32 rounded-full bg-emerald-50 mb-6 overflow-hidden border-4 border-emerald-600 shadow-lg flex items-center justify-center">
                                <User size={64} className="text-emerald-700" />
                            </div>
                            <h3 className="font-black text-2xl text-slate-900 uppercase">Hj. Suparni</h3>
                            <p className="text-slate-500 font-bold text-lg mt-1 italic">NIP. -</p>
                            <Button variant="outline" className="mt-8 w-full border-2 border-slate-300 font-black">
                                UPDATE FOTO PROFIL
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
