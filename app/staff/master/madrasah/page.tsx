'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Loader2,
    Building,
    MapPin,
    ChevronDown,
    Globe
} from 'lucide-react';
import { api } from '@/lib/api';
import { KECAMATAN_KAMPAR } from '@/lib/constants';

export default function StaffMasterMadrasahPage() {
    const [schools, setSchools] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [isLoading, setIsLoading] = useState(true);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('Tambah Madrasah');
    const [formData, setFormData] = useState({
        id_madrasah: '',
        npsn: '',
        nama_madrasah: '',
        alamat: '',
        kecamatan: '',
        status_aktif: 1
    });

    const fetchSchools = async () => {
        setIsLoading(true);
        try {
            const response = await api.master.getMadrasah();
            const data = await response.json();
            if (response.ok) {
                setSchools(data.data || data);
            }
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    const filteredSchools = schools.filter(item => {
        const matchesSearch = item.nama_madrasah.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.npsn.includes(searchQuery);
        const matchesStatus = statusFilter === 'Semua Status' ||
            (statusFilter === 'Aktif' && item.status_aktif == 1) ||
            (statusFilter === 'Non-aktif' && item.status_aktif == 0);
        return matchesSearch && matchesStatus;
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let res;
            if (formData.id_madrasah) {
                res = await api.master.updateMadrasah(formData.id_madrasah, formData);
            } else {
                res = await api.master.createMadrasah(formData);
            }

            if (res.ok) {
                setIsModalOpen(false);
                fetchSchools();
                alert('Berhasil disimpan!');
            }
        } catch (error) {
            alert('Gagal menyimpan data');
        }
    };

    const handleDelete = async (id: any, name: string) => {
        if (confirm(`Hapus madrasah "${name}"? Data ini mungkin terkait dengan banyak laporan.`)) {
            try {
                const res = await api.master.deleteMadrasah(id);
                if (res.ok) fetchSchools();
            } catch (error) {
                alert('Gagal menghapus madrasah');
            }
        }
    };

    const handleToggleStatus = async (item: any) => {
        const originalSchools = [...schools];
        const newStatus = item.status_aktif == 1 ? 0 : 1;

        // Optimistic Update: Update UI immediately
        setSchools(prev => prev.map(s =>
            s.id_madrasah === item.id_madrasah
                ? { ...s, status_aktif: newStatus }
                : s
        ));

        try {
            const res = await api.master.updateMadrasah(item.id_madrasah, {
                ...item,
                status_aktif: newStatus
            });

            if (!res.ok) {
                // Revert if API fails
                setSchools(originalSchools);
                alert('Gagal mengubah status di server');
            }
        } catch (error) {
            // Revert on network error
            setSchools(originalSchools);
            alert('Gagal mengubah status: Masalah koneksi');
        }
    };

    const openAddModal = () => {
        setFormData({ id_madrasah: '', npsn: '', nama_madrasah: '', alamat: '', kecamatan: '', status_aktif: 1 });
        setModalTitle('Tambah Madrasah Terdaftar');
        setIsModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setFormData({
            id_madrasah: item.id_madrasah,
            npsn: item.npsn,
            nama_madrasah: item.nama_madrasah,
            alamat: item.alamat || '',
            kecamatan: item.kecamatan || '',
            status_aktif: item.status_aktif
        });
        setModalTitle('Edit Data Madrasah');
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 pb-10 -mt-6">

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
                    <div className="md:col-span-6 relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors z-10">
                            <Search size={22} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari NPSN atau Nama Madrasah..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-16 pr-6 bg-white border-[3px] border-slate-900 rounded-[1.5rem] font-bold text-slate-900 placeholder:text-slate-300 outline-none shadow-[6px_6px_0_0_#f1f5f9] focus:shadow-[6px_6px_0_0_#10b98120] focus:border-emerald-600 transition-all"
                        />
                    </div>
                    <div className="md:col-span-3 relative group">
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                            <ChevronDown size={20} />
                        </div>
                        <select
                            className="w-full h-16 pl-8 pr-12 appearance-none bg-white border-[3px] border-slate-900 rounded-[1.5rem] font-black text-slate-900 uppercase tracking-[0.15em] text-[11px] outline-none shadow-[6px_6px_0_0_#f1f5f9] focus:shadow-[6px_6px_0_0_#10b98120] focus:border-emerald-600 transition-all cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option>Semua Status</option>
                            <option>Aktif</option>
                            <option>Non-aktif</option>
                        </select>
                    </div>
                    <div className="md:col-span-3 flex items-center">
                        <Button
                            variant="primary"
                            className="w-full h-16 !text-xs !font-black bg-emerald-600 border-[3px] border-slate-900 shadow-[6px_6px_0_0_#0f172a] tracking-widest uppercase hover:shadow-[8px_8px_0_0_#0f172a] active:translate-y-0 active:shadow-none transition-all"
                            icon={<Plus size={20} />}
                            onClick={openAddModal}
                        >
                            TAMBAH MADRASAH
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-amber-600" size={48} />
                            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Menyelaraskan Data...</p>
                        </div>
                    ) : filteredSchools.length === 0 ? (
                        <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                            <Building size={64} className="mx-auto text-slate-200 mb-4" />
                            <p className="font-black text-slate-400 uppercase tracking-widest text-center">Belum ada sekolah terdaftar</p>
                        </div>
                    ) : (
                        filteredSchools.map((item) => (
                            <div
                                key={item.id_madrasah}
                                className="bg-white border-[3px] border-slate-900 rounded-[2rem] p-8 shadow-[6px_6px_0_0_#f1f5f9] hover:shadow-[10px_10px_0_0_#f1f5f9] transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-16 -translate-y-16 group-hover:bg-emerald-50 transition-colors duration-500" />

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-white border-[3px] border-slate-900 flex items-center justify-center text-slate-900 shadow-[4px_4px_0_0_#0f172a] shrink-0 font-black text-xl transition-all">
                                            {item.nama_madrasah.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-4 mb-2">
                                                <Link href={`/staff/master/madrasah/${item.id_madrasah}`}>
                                                    <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tighter leading-none hover:text-emerald-600 transition-colors cursor-pointer">
                                                        {item.nama_madrasah}
                                                    </h3>
                                                </Link>
                                                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${item.status_aktif == 1 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                    {item.status_aktif == 1 ? 'AKTIF' : 'NON-AKTIF'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-6 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                                                <span className="flex items-center gap-2">
                                                    <Globe size={14} className="text-emerald-500" />
                                                    <span className="text-slate-500">NPSN:</span> {item.npsn}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-emerald-500" />
                                                    <span className="text-slate-500">{item.kecamatan || 'Lokasi Belum Set'}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 shrink-0 relative z-10">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(item); }}
                                                className={`relative w-14 h-7 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${item.status_aktif == 1 ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            >
                                                <span
                                                    className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex items-center justify-center ${item.status_aktif == 1 ? 'translate-x-7' : 'translate-x-0'}`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full ${item.status_aktif == 1 ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                </span>
                                            </button>
                                        </div>

                                        <div className="h-12 w-[3px] bg-slate-100 hidden md:block" />

                                        <div className="text-right hidden sm:block min-w-[100px]">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 leading-none">Update</p>
                                            <p className="text-[10px] font-black text-slate-900 uppercase">Feb 2026</p>
                                        </div>

                                        <div className="flex items-center gap-2 pl-4 border-l-2 border-slate-100">
                                            <Button
                                                variant="outline"
                                                className="h-11 w-11 p-0 border-[3px] border-slate-900 shadow-[4px_4px_0_0_#0f172a10] hover:bg-emerald-50 hover:border-emerald-600 hover:shadow-[4px_4px_0_0_#10b98120] transition-all rounded-xl"
                                                icon={<Edit size={16} />}
                                                onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                                            />
                                            <Button
                                                variant="outline"
                                                className="h-11 w-11 p-0 !text-rose-500 !border-rose-200 hover:!bg-rose-600 hover:!text-white hover:!border-rose-900 hover:shadow-[4px_4px_0_0_#be123c20] border-2 rounded-xl transition-all"
                                                icon={<Trash2 size={16} />}
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id_madrasah, item.nama_madrasah); }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalTitle}
                footer={
                    <div className="flex gap-4">
                        <Button variant="outline" className="flex-1 font-black border-4 py-4" onClick={() => setIsModalOpen(false)}>BATAL</Button>
                        <Button type="submit" form="school-form" className="flex-1 font-black bg-amber-600 shadow-xl py-4">SIMPAN MADRASAH</Button>
                    </div>
                }
            >
                <form id="school-form" onSubmit={handleSave} className="space-y-6">
                    <Input
                        label="NPSN (Nomor Pokok Sekolah Nasional)"
                        value={formData.npsn}
                        onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                        required
                        placeholder="Contoh: 10293847"
                    />
                    <Input
                        label="Nama Resmi Madrasah"
                        value={formData.nama_madrasah}
                        onChange={(e) => setFormData({ ...formData, nama_madrasah: e.target.value })}
                        required
                        placeholder="Contoh: MIS Al-Ittihad"
                    />
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Alamat Lengkap</label>
                        <textarea
                            className="w-full min-h-[100px] p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-slate-900 font-bold text-sm focus:outline-none focus:border-amber-500 transition-all resize-none"
                            value={formData.alamat}
                            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Wilayah Kecamatan</label>
                        <div className="relative group">
                            <select
                                className="w-full h-14 pl-5 pr-12 appearance-none bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 uppercase tracking-wide text-xs focus:border-amber-500 transition-all cursor-pointer"
                                value={formData.kecamatan}
                                onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                                required
                            >
                                <option value="">PILIH KECAMATAN</option>
                                {KECAMATAN_KAMPAR.map(k => (
                                    <option key={k} value={k}>{k}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
