'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Menu, UserCircle, ChevronDown, Settings, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Get user from localStorage
    const [userName, setUserName] = React.useState<string>('Verifikator Staf');

    React.useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserName(user.name || user.username || 'Verifikator Staf');
        }
    }, [pathname]);

    const getTitle = () => {
        if (pathname.includes('/dashboard')) return 'DASHBOARD KERJA';
        if (pathname.includes('/laporan')) return 'VALIDASI LAPORAN';
        if (pathname.includes('/pengaturan')) return 'PENGATURAN AKUN';
        if (pathname.includes('/master/madrasah')) return 'MASTER DATA MADRASAH';
        if (pathname.includes('/master/users')) return 'MANAJEMEN PENGGUNA';
        return 'STAFF AREA';
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            <Sidebar role="staff_penmad" isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />


            <div className="flex-1 min-w-0 md:ml-[20rem] transition-all duration-300">
                <header className="h-24 bg-white/80 backdrop-blur-md border-b-[3px] border-slate-900 flex items-center px-6 md:px-12 justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-6">
                        <button
                            className="md:hidden p-4 hover:bg-slate-100 rounded-2xl border-[3px] border-slate-900 shadow-[4px_4px_0_0_#0f172a] transition-all active:translate-y-1 active:shadow-none bg-white"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu size={24} className="text-slate-900" />
                        </button>
                        <div className="flex flex-col">
                            <h2 className="font-black text-2xl leading-none text-slate-900 italic tracking-tighter">{getTitle()}</h2>
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Panel Verifikator Teknis
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/staff/pengaturan"
                            className="flex items-center gap-4 pl-6 border-l-2 border-slate-100 transition-all group"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Staf</p>
                                <p className="text-xs font-black text-slate-900 uppercase">
                                    {userName}
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl bg-amber-500 border-2 border-slate-900 text-white flex items-center justify-center font-black text-xl transition-all ${pathname === '/staff/pengaturan' ? 'bg-amber-600' : 'group-hover:bg-amber-600'}`}>
                                {userName.substring(0, 1).toUpperCase()}
                            </div>
                        </Link>
                    </div>
                </header>

                <main className="p-6 md:p-12 max-w-[1600px] mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
