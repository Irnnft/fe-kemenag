'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, LogIn, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '', // Berubah dari email ke username sesuai DB
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.auth.login(formData);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Username atau password salah');
      }

      // Simpan Token & Data User
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect berdasarkan role (sesuai Enum di DB)
      if (data.user.role === 'kasi_penmad') {
        router.push('/admin/dashboard');
      } else {
        router.push('/operator/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 font-sans">
      {/* Left Panel */}
      <div className="hidden lg:flex relative bg-emerald-900 overflow-hidden items-center justify-center p-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="relative z-10 w-full max-w-xl text-center">

          <h1 className="text-7xl font-black text-white leading-[0.9] tracking-tighter mb-8 uppercase text-left">
            Aplikasi<br />
            <span className="text-emerald-400 italic">Pelaporan</span><br />
            Bulanan.
          </h1>
          <p className="text-emerald-100 text-xl font-medium leading-relaxed mb-12 text-left border-l-4 border-emerald-500 pl-8 py-2">
            Sistem Informasi Pelaporan Madrasah Terintegrasi Kantor Kementerian Agama Kabupaten.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center p-8 md:p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-md my-auto">
          <div className="mb-5">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight uppercase mb-4">
              Log In <br />
              <span className="text-emerald-700 bg-emerald-50 px-2">SI-LAPOR</span>
            </h2>
            <p className="text-slate-500 font-bold text-lg">Gunakan Username Akun anda untuk masuk.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-4 border-red-200 p-6 rounded-3xl mb-8 flex items-center gap-4 animate-shake">
              <AlertCircle className="text-red-600 shrink-0" size={32} />
              <div>
                <h4 className="text-red-900 font-black uppercase text-sm tracking-widest">Login Gagal</h4>
                <p className="text-red-700 font-bold">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-8" onSubmit={handleLogin}>
            <Input
              label="Username Pengguna"
              type="text"
              placeholder="admin / op_mi"
              icon={<User size={24} className="text-slate-400" />}
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <Input
              label="Kata Sandi"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={24} className="text-slate-400" />}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <Button
              variant="primary"
              className="w-full py-6 text-xl font-black bg-emerald-900 hover:bg-black transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] active:scale-95 group"
              isLoading={isLoading}
            >
              MASUK KEDALAM SISTEM <LogIn className="ml-2 group-hover:translate-x-2 transition-transform" />
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
