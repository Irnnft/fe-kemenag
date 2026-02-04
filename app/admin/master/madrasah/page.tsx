'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Edit, Trash2, Save, X, MapPin, School as SchoolIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

export default function MasterMadrasahPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [isLoading, setIsLoading] = useState(true);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('Tambah Madrasah');
    const [formData, setFormData] = useState({
        id_madrasah: '',
        nama_madrasah: '',
        npsn: '',
        alamat: '',
        status_aktif: 1
    });

    const [schools, setSchools] = useState<any[]>([]);

    const fetchSchools = async () => {
        setIsLoading(true);
        try {
            const response = await api.master.getMadrasah();
            const data = await response.json();
            if (response.ok) {
                setSchools(data.data || data);
            }
        } catch (error) {
            console.error('Failed to fetch schools:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    const filteredSchools = useMemo(() => {
        return schools.filter(school => {
            const name = school.nama_madrasah || '';
            const npsn = school.npsn || '';

            const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                npsn.includes(searchQuery);

            const matchesStatus = statusFilter === 'Semua Status' ||
                (statusFilter === 'Aktif' && school.status_aktif == 1) ||
                (statusFilter === 'Non-Aktif' && school.status_aktif == 0);

            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter, schools]);

    const openAddModal = () => {
        setFormData({ id_madrasah: '', nama_madrasah: '', npsn: '', alamat: '', status_aktif: 1 });
        setModalTitle('Tambah Madrasah Baru');
        setIsModalOpen(true);
    };

    const openEditModal = (school: any) => {
        setFormData({
            id_madrasah: school.id_madrasah,
            nama_madrasah: school.nama_madrasah,
            npsn: school.npsn,
            alamat: school.alamat,
            status_aktif: school.status_aktif
        });
        setModalTitle('Ubah Data Madrasah');
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let response;
            if (formData.id_madrasah) {
                response = await api.master.updateMadrasah(Number(formData.id_madrasah), formData);
            } else {
                response = await api.master.storeMadrasah(formData);
            }

            if (response.ok) {
                alert(`Data berhasil disimpan!`);
                setIsModalOpen(false);
                fetchSchools();
            } else {
                const errorData = await response.json();
                alert(`Gagal: ${errorData.message}`);
            }
        } catch (error) {
            alert('Terjadi kesalahan koneksi');
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus madrasah ${name}?`)) {
            try {
                const response = await api.master.deleteMadrasah(id);
                if (response.ok) {
                    alert(`${name} telah dihapus`);
                    fetchSchools();
                } else {
                    alert('Gagal menghapus data.');
                }
            } catch (error) {
                alert('Terjadi kesalahan koneksi');
            }
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Data Master Madrasah</h1>
                <Button
                    variant="primary"
                    className="py-4 px-8 text-lg font-black bg-emerald-700 shadow-xl"
                    icon={<Plus size={24} />}
                    onClick={openAddModal}
                >
                    TAMBAH MADRASAH
                </Button>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row gap-6 mb-10">
                    <div className="flex-1 max-w-md">
                        <Input
                            label="Cari Madrasah"
                            placeholder="Ketik nama atau NPSN..."
                            icon={<Search size={22} />}
                            className="mb-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <label className="input-label">Filter Status</label>
                        <select
                            className="select-field"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="Semua Status">Semua Status</option>
                            <option value="Aktif">Aktif</option>
                            <option value="Non-Aktif">Non-Aktif</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto border-2 border-slate-200 rounded-2xl relative min-h-[300px]">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                            <Loader2 className="animate-spin text-emerald-700" size={60} />
                        </div>
                    )}

                    <table className="w-full text-base text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-900 uppercase font-black text-sm">
                            <tr>
                                <th className="px-6 py-6 border-b-2 border-slate-300">Nama Madrasah</th>
                                <th className="px-6 py-6 border-b-2 border-slate-300">NPSN</th>
                                <th className="px-6 py-6 border-b-2 border-slate-300">Alamat Lengkap</th>
                                <th className="px-6 py-6 border-b-2 border-slate-300 text-center">Status</th>
                                <th className="px-6 py-6 text-center border-b-2 border-slate-300">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100">
                            {filteredSchools.map((item) => (
                                <tr key={item.id_madrasah} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-8">
                                        <div className="font-black text-slate-900 text-xl uppercase tracking-tighter flex items-center gap-3">
                                            <SchoolIcon className="text-emerald-700 shrink-0" size={24} />
                                            {item.nama_madrasah}
                                        </div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="text-lg font-black bg-emerald-100/50 px-4 py-1 rounded-lg border-2 border-emerald-200 inline-block">{item.npsn}</div>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="text-slate-600 font-bold text-base leading-relaxed flex items-start gap-2 max-w-xs uppercase">
                                            <MapPin className="text-slate-400 shrink-0 mt-0.5" size={18} />
                                            {item.alamat || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-8 text-center">
                                        <span className={`px-5 py-2 rounded-full text-xs font-black border-2 uppercase tracking-widest inline-block
                                            ${item.status_aktif == 1 ? 'bg-green-100 text-green-800 border-green-400' : 'bg-red-100 text-red-800 border-red-400'}`
                                        }>
                                            {item.status_aktif == 1 ? 'AKTIF' : 'NON-AKTIF'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="flex items-center justify-center gap-3">
                                            <Button
                                                variant="outline"
                                                className="h-14 w-14 border-slate-300 shadow-md flex items-center justify-center hover:border-emerald-600 transition-all"
                                                icon={<Edit size={26} className="text-emerald-800" />}
                                                onClick={() => openEditModal(item)}
                                            />
                                            <Button
                                                variant="danger"
                                                className="h-14 w-14 border-2 shadow-md flex items-center justify-center"
                                                icon={<Trash2 size={26} />}
                                                onClick={() => handleDelete(item.id_madrasah, item.nama_madrasah)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalTitle}
                footer={
                    <div className="flex gap-4">
                        <Button variant="outline" className="flex-1 py-5 text-xl font-black border-4" onClick={() => setIsModalOpen(false)}>
                            BATAL
                        </Button>
                        <Button type="submit" form="madrasah-form" className="flex-1 py-5 text-xl font-black bg-emerald-700 shadow-xl">
                            SIMPAN DATA
                        </Button>
                    </div>
                }
            >
                <form id="madrasah-form" onSubmit={handleSave} className="space-y-6 text-left">
                    <Input
                        label="Nama Madrasah"
                        placeholder="Cth: MI NURUL HUDA"
                        required
                        value={formData.nama_madrasah}
                        onChange={(e) => setFormData({ ...formData, nama_madrasah: e.target.value.toUpperCase() })}
                    />
                    <Input
                        label="NPSN"
                        placeholder="Nomor Pokok Sekolah Nasional"
                        required
                        value={formData.npsn}
                        onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                    />
                    <div className="space-y-3">
                        <label className="input-label">Alamat Lengkap</label>
                        <textarea
                            className="select-field h-32 py-4 resize-none border-2"
                            placeholder="Alamat lengkap madrasah..."
                            required
                            value={formData.alamat}
                            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="input-label">Status Aktif</label>
                        <select
                            className="select-field border-2"
                            value={formData.status_aktif}
                            onChange={(e) => setFormData({ ...formData, status_aktif: Number(e.target.value) })}
                        >
                            <option value={1}>AKTIF</option>
                            <option value={0}>NON-AKTIF</option>
                        </select>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
