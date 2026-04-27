'use client';

import React, { useState, useEffect } from 'react';
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
    Shield,
    ChevronDown,
    MapPin,
    Eye,
    EyeOff
} from 'lucide-react';
import { api } from '@/lib/api';

export default function KasiMasterUsersPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [madrasahs, setMadrasahs] = useState<any[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('Registrasi Pengguna');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('Semua Akses');

    const [formData, setFormData] = useState({
        id: '',
        username: '',
        name: '',
        password: '',
        role: 'operator_sekolah',
        id_madrasah: ''
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [userRes, madrasahRes] = await Promise.all([
                api.master.getUsers(),
                api.master.getMadrasah()
            ]);

            if (userRes.ok) {
                const userData = await userRes.json();
                setUsers(userData.data || userData);
            }
            if (madrasahRes.ok) {
                const mData = await madrasahRes.json();
                setMadrasahs(mData.data || mData);
            }
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
            user.username.toLowerCase().includes(query) ||
            (user.name && user.name.toLowerCase().includes(query)) ||
            (user.madrasah?.npsn && user.madrasah.npsn.toLowerCase().includes(query)) ||
            (user.madrasah?.nama_madrasah && user.madrasah.nama_madrasah.toLowerCase().includes(query));

        const matchesRole = roleFilter === 'Semua Akses' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    }).sort((a, b) => {
        const priority: Record<string, number> = {
            'kasi_penmad': 1,
            'staff_penmad': 2,
            'operator_sekolah': 3
        };
        return (priority[a.role] || 4) - (priority[b.role] || 4);
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let response;
            const payload = { ...formData };
            if (!payload.password) delete (payload as any).password;

            if (formData.id) {
                response = await api.master.updateUser(Number(formData.id), payload);
            } else {
                response = await api.master.createUser(payload);
            }

            if (response.ok) {
                setIsModalOpen(false);
                fetchData();
                alert('Akun pengguna berhasil dikonfigurasi!');
            } else {
                const errorData = await response.json();
                alert('Gagal simpan: ' + (errorData.message || 'Cek kembali data Anda'));
            }
        } catch (error) {
            alert('Kesalahan koneksi pimpinan');
        }
    };

    const handleDelete = async (id: number, username: string) => {
        if (confirm(`Hapus permanen akun "${username}"? Tindakan ini tidak dapat dibatalkan.`)) {
            try {
                const res = await api.master.deleteUser(id);
                if (res.ok) fetchData();
            } catch (error) {
                alert('Gagal menghapus akun');
            }
        }
    };

    const openAddModal = () => {
        setFormData({ id: '', username: '', name: '', password: '', role: 'operator_sekolah', id_madrasah: '' });
        setModalTitle('Registrasi User Baru');
        setIsModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setFormData({
            id: item.id,
            username: item.username,
            name: item.name || '',
            password: '',
            role: item.role,
            id_madrasah: item.id_madrasah || ''
        });
        setModalTitle('Modifikasi Akun & Hak Akses');
        setIsModalOpen(true);
    };

    // Auto-fill username with NPSN when madrasah is selected
    const handleMadrasahChange = (madrasahId: string) => {
        const selected = madrasahs.find(m => String(m.id_madrasah) === String(madrasahId));
        setFormData(prev => ({
            ...prev,
            id_madrasah: madrasahId,
            // Only auto-fill if it's a new user (no existing id) and username hasn't been manually edited
            username: !formData.id && selected ? selected.npsn : prev.username
        }));
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
                            placeholder="Cari Username..."
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
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option>Semua Akses</option>
                            <option value="operator_sekolah">Operator Sekolah</option>
                            <option value="staff_penmad">Staf Teknis</option>
                            <option value="kasi_penmad">Pimpinan</option>
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <Button
                            variant="primary"
                            className="w-full h-16 text-sm font-black bg-slate-900 shadow-[6px_6px_0_0_#0f172a10] border-[3px] border-slate-900 rounded-[1.5rem] hover:shadow-[8px_8px_0_0_#0f172a20] transition-all"
                            icon={<Plus size={20} />}
                            onClick={openAddModal}
                        >
                            TAMBAH USER
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto -mx-10 px-10">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-6 py-6 border-b-2 border-slate-300 text-left">Entitas Pengguna</th>
                                <th className="px-6 py-6 border-b-2 border-slate-300 text-center">Level Otoritas</th>
                                <th className="px-6 py-6 border-b-2 border-slate-300 text-left">Unit Madrasah / Wilayah</th>
                                <th className="px-6 py-6 border-b-2 border-slate-300 text-center">Kontrol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <Loader2 className="animate-spin mx-auto text-emerald-600 mb-4" size={48} />
                                        <p className="font-black text-slate-300 uppercase tracking-widest text-center">Memverifikasi Database...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">
                                        Tidak ada akun terdaftar
                                    </td>
                                </tr>
                            ) : filteredUsers.map((item) => (
                                <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-8 border-b text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white border-[3px] border-slate-900 flex items-center justify-center font-black italic text-xs shadow-[4px_4px_0_0_#0f172a] group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                                                {(item.name || item.username).substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col items-start text-left">
                                                <span className="font-black text-slate-900 text-base uppercase tracking-tighter italic leading-tight">
                                                    {item.name || item.username}
                                                </span>
                                                {item.madrasah?.npsn && (
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                        NPSN: {item.madrasah.npsn}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8 text-center border-b">
                                        <div className="inline-flex flex-col items-center">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black border-2 uppercase tracking-[0.15em] flex items-center gap-2
                                                ${item.role === 'kasi_penmad' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    item.role === 'staff_penmad' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                <Shield size={14} />
                                                {item.role === 'kasi_penmad' ? 'Pimpinan' :
                                                    item.role === 'staff_penmad' ? 'Staf Teknis' :
                                                        'Operator'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-8 text-left border-b">
                                        <div className="flex items-center">
                                            {item.madrasah ? (
                                                <span className="font-black text-slate-900 text-base uppercase tracking-tighter italic flex items-center gap-2">
                                                    <MapPin size={16} className="text-emerald-500" />
                                                    {item.madrasah.nama_madrasah}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] pl-6">
                                                    Akses Global
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-8 text-center border-b">
                                        <div className="flex items-center justify-center gap-3">
                                            <Button variant="outline" className="h-12 w-12 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-xl" icon={<Edit size={20} className="text-emerald-800" />} onClick={() => openEditModal(item)} />
                                            <Button variant="danger" className="h-12 w-12 border-2 rounded-xl" icon={<Trash2 size={20} />} onClick={() => handleDelete(item.id, item.username)} />
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
                        <Button variant="outline" className="flex-1 font-black border-4 py-4" onClick={() => setIsModalOpen(false)}>BATAL</Button>
                        <Button type="submit" form="user-form" className="flex-1 font-black bg-slate-900 shadow-xl py-4">SIMPAN PENGGUNA</Button>
                    </div>
                }
            >
                <form id="user-form" onSubmit={handleSave} className="space-y-6">
                    {/* Step 1: Pilih Role */}
                    <div className="space-y-2">
                        <label className="input-label font-black text-[10px] uppercase text-slate-400 pl-1">Level Otoritas Sistem</label>
                        <select className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-200 rounded-3xl font-bold uppercase text-xs" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value, id_madrasah: '' })}>
                            <option value="operator_sekolah">OPERATOR MADRASAH (Input Data)</option>
                            <option value="staff_penmad">STAF PENMAD (Verifikator Teknis)</option>
                            <option value="kasi_penmad">KASI PENMAD (Pimpinan/Oversight)</option>
                        </select>
                    </div>

                    {/* Step 2: Pilih Madrasah (only for operator) → auto-fill username */}
                    {formData.role === 'operator_sekolah' && (
                        <div className="space-y-2">
                            <label className="input-label font-black text-[10px] uppercase text-slate-400 pl-1">Afiliasi Unit Madrasah</label>
                            <select
                                className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-200 rounded-3xl font-bold uppercase text-xs"
                                required
                                value={formData.id_madrasah}
                                onChange={(e) => handleMadrasahChange(e.target.value)}
                            >
                                <option value="">-- Pilih Madrasah --</option>
                                {madrasahs.map(m => (
                                    <option key={m.id_madrasah} value={m.id_madrasah}>{m.nama_madrasah}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="input-label font-black text-[10px] uppercase text-slate-400 pl-1">Nama Lengkap / Jabatan</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Masukkan nama lengkap atau jabatan..."
                        />
                    </div>

                    {/* Step 3: Username — auto-filled from NPSN, still editable */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between pl-1">
                            <label className="input-label font-black text-[10px] uppercase text-slate-400">Username / ID Login</label>
                            {formData.role === 'operator_sekolah' && formData.id_madrasah && !formData.id && (
                                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    ✓ Auto-isi dari NPSN
                                </span>
                            )}
                        </div>
                        <Input
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder={formData.role === 'operator_sekolah' ? 'Pilih madrasah untuk auto-isi...' : 'Masukkan username'}
                        />
                    </div>

                    {/* Step 4: Password */}
                    <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={formData.id ? 'Kosongkan jika tidak diubah' : 'Masukkan password baru'}
                        rightElement={
                            <button
                                type="button"
                                onClick={() => setShowPassword(p => !p)}
                                className="text-slate-400 hover:text-slate-700 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                    />
                </form>
            </Modal>
        </div>
    );
}
