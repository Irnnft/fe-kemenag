'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Edit, Trash2, Key, Save, X, Loader2, Shield } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

export default function MasterUsersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('Semua Role');
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [madrasahs, setMadrasahs] = useState<any[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('Tambah User Baru');
    const [formData, setFormData] = useState({
        id: '',
        username: '',
        password: '',
        role: 'operator_sekolah',
        id_madrasah: '' as any
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [userRes, madrasahRes] = await Promise.all([
                api.master.getUsers(),
                api.master.getMadrasah()
            ]);

            const userData = await userRes.json();
            const madrasahData = await madrasahRes.json();

            if (userRes.ok) setUsers(userData.data || userData);
            if (madrasahRes.ok) setMadrasahs(madrasahData.data || madrasahData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const username = user.username || '';
            const matchesSearch = username.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'Semua Role' || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [searchQuery, roleFilter, users]);

    const openAddModal = () => {
        setFormData({ id: '', username: '', password: '', role: 'operator_sekolah', id_madrasah: '' });
        setModalTitle('Tambah User Baru');
        setIsModalOpen(true);
    };

    const openEditModal = (user: any) => {
        setFormData({
            id: user.id,
            username: user.username,
            password: '',
            role: user.role,
            id_madrasah: user.id_madrasah || ''
        });
        setModalTitle('Ubah Data User');
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let response;
            const payload = { ...formData };
            if (!payload.password) delete (payload as any).password; // Jangan kirim password kosong

            if (formData.id) {
                response = await api.master.updateUser(Number(formData.id), payload);
            } else {
                response = await api.master.storeUser(payload);
            }

            if (response.ok) {
                alert(`User berhasil disimpan!`);
                setIsModalOpen(false);
                fetchData();
            } else {
                const err = await response.json();
                alert(`Gagal: ${err.message}`);
            }
        } catch (error) {
            alert('Kesalahan koneksi');
        }
    };

    const handleDelete = async (id: number, username: string) => {
        if (confirm(`Hapus user ${username}?`)) {
            try {
                const response = await api.master.deleteUser(id);
                if (response.ok) {
                    alert('User dihapus');
                    fetchData();
                }
            } catch (error) {
                alert('Gagal menghapus');
            }
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-slate-900 uppercase">Manajemen User</h1>
                <Button
                    variant="primary"
                    className="py-4 px-8 text-lg font-black bg-emerald-700 shadow-xl"
                    icon={<Plus size={24} />}
                    onClick={openAddModal}
                >
                    TAMBAH USER
                </Button>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row gap-6 mb-10">
                    <div className="flex-1 max-w-md">
                        <Input
                            label="Cari Username"
                            placeholder="Ketik username..."
                            icon={<Search size={22} />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <label className="input-label">Filter Akses</label>
                        <select
                            className="select-field border-2"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="Semua Role">Semua Role</option>
                            <option value="operator_sekolah">Operator Sekolah</option>
                            <option value="kasi_penmad">Admin (Kasi Penmad)</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto border-2 border-slate-200 rounded-xl relative min-h-[300px]">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                            <Loader2 className="animate-spin text-emerald-700" size={48} />
                        </div>
                    )}

                    <table className="w-full text-base text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-900 uppercase font-black text-sm">
                            <tr>
                                <th className="px-6 py-6 border-b-2 border-slate-300">Username</th>
                                <th className="px-6 py-6 border-b-2 border-slate-300">Akses Role</th>
                                <th className="px-6 py-6 border-b-2 border-slate-300">Madrasah</th>
                                <th className="px-6 py-6 text-center border-b-2 border-slate-300">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100">
                            {filteredUsers.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-8 font-black text-slate-900 text-xl tracking-tighter uppercase">
                                        {item.username}
                                    </td>
                                    <td className="px-6 py-8">
                                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black border-2 ${item.role === 'kasi_penmad' ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-blue-100 text-blue-900 border-blue-300'}`}>
                                            <Shield size={16} />
                                            {item.role === 'kasi_penmad' ? 'KASI PENMAD' : 'OPERATOR'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-8 font-bold text-slate-600">
                                        {madrasahs.find(m => m.id_madrasah == item.id_madrasah)?.nama_madrasah || '-'}
                                    </td>
                                    <td className="px-6 py-8">
                                        <div className="flex items-center justify-center gap-3">
                                            <Button variant="outline" className="h-12 w-12 border-slate-300" icon={<Edit size={20} className="text-emerald-800" />} onClick={() => openEditModal(item)} />
                                            <Button variant="danger" className="h-12 w-12 border-2" icon={<Trash2 size={20} />} onClick={() => handleDelete(item.id, item.username)} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}
                footer={
                    <div className="flex gap-4">
                        <Button variant="outline" className="flex-1 font-black border-4" onClick={() => setIsModalOpen(false)}>BATAL</Button>
                        <Button type="submit" form="user-form" className="flex-1 font-black bg-emerald-700 shadow-xl">SIMPAN USER</Button>
                    </div>
                }
            >
                <form id="user-form" onSubmit={handleSave} className="space-y-6 text-left">
                    <Input label="Username" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                    <Input label="Password (Kosongkan jika tidak diubah)" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

                    <div className="space-y-3">
                        <label className="input-label">Role Akses</label>
                        <select className="select-field border-2" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                            <option value="operator_sekolah">OPERATOR SEKOLAH</option>
                            <option value="kasi_penmad">KASI PENMAD (ADMIN)</option>
                        </select>
                    </div>

                    {formData.role === 'operator_sekolah' && (
                        <div className="space-y-3">
                            <label className="input-label">Pilih Madrasah</label>
                            <select className="select-field border-2" required value={formData.id_madrasah} onChange={(e) => setFormData({ ...formData, id_madrasah: e.target.value })}>
                                <option value="">-- Pilih Madrasah --</option>
                                {madrasahs.map(m => (
                                    <option key={m.id_madrasah} value={m.id_madrasah}>{m.nama_madrasah}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    );
}
