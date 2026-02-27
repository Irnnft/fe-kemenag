'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, LogIn, School, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
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

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'kasi_penmad') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'staff_penmad') {
        router.push('/staff/dashboard');
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
    <main className="h-screen w-full flex bg-slate-900 overflow-hidden font-sans select-none">
      {/* Left Side - Visual Branding (65%) */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 items-center justify-center p-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#10b981_0%,transparent_40%)] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#0f172a_0%,transparent_40%)] opacity-80" />

        {/* Abstract Pattern */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[100px] border-slate-800/30 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl text-left">
          <div className="w-24 h-24 bg-white rounded-3xl border-4 border-slate-900 flex items-center justify-center mb-10 shadow-[8px_8px_0_0_#ffffff20] overflow-hidden p-3">
            <img src="/logo.png" alt="Logo Kemenag" className="w-full h-full object-contain" />
          </div>

          <h1 className="text-9xl font-black text-white leading-[0.85] tracking-tighter mb-8 italic">
            MIS KAMPAR<br />
            <span className="text-emerald-500">KEMENAG</span>
          </h1>

          <div className="flex items-center gap-6 border-l-4 border-emerald-500 pl-8">
            <div>
              <p className="text-2xl font-bold text-slate-400 leading-tight">Sistem Informasi Pelaporan</p>
              <p className="text-2xl font-bold text-slate-500 leading-tight">Madrasah Terintegrasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (35%) */}
      <div className="w-full lg:w-[600px] bg-white flex flex-col items-center justify-center p-12 lg:p-20 relative z-20 shadow-2xl">
        <div className="w-full max-w-sm space-y-10">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic mb-3">SELAMAT DATANG</h2>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Silahkan login untuk melanjutkan</p>
          </div>

          {error && (
            <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-center gap-3 animate-shake">
              <AlertCircle className="text-rose-500 shrink-0" size={20} />
              <p className="text-rose-700 font-black text-xs uppercase tracking-wide">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">NPSN / Username</label>
                <div className="relative transition-all duration-300 focus-within:-translate-y-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-300 placeholder:font-normal"
                    placeholder="NPSN (Operator) / Username (Staf)"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Kata Sandi</label>
                <div className="relative transition-all duration-300 focus-within:-translate-y-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full h-14 pl-12 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-300 placeholder:font-normal"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer z-10"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl group disabled:opacity-70 disabled:cursor-not-allowed mt-8"
            >
              {isLoading ? (
                <span className="animate-pulse">MEMPROSES...</span>
              ) : (
                <>
                  MASUK SEKARANG
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </>
              )}
            </button>
          </form>

          <div className="pt-8 text-center border-t-2 border-slate-50">
            <p className="text-[10px] uppercase font-black text-slate-300 tracking-[0.2em] hover:text-emerald-500 transition-colors cursor-default">
              &copy; 2026 Kemenag Kabupaten
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
