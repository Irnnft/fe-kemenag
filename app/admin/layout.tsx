'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Menu, ShieldCheck, ChevronDown, Settings, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Side Effect: Auto-hide on mobile initially
    React.useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    }, []);

    const pathname = usePathname();
    const router = useRouter();

    const [userName, setUserName] = React.useState<string>('Administrator');

    React.useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserName(user.name || user.username || 'Administrator');
        }
    }, [pathname]);

    const getTitle = () => {
        if (pathname.includes('/dashboard')) return 'RADAR MONITORING';
        if (pathname.includes('/recap')) return 'REKAPITULASI FINAL';
        if (pathname.includes('/pengaturan')) return 'PENGATURAN AKUN';
        if (pathname.includes('/laporan')) return 'MONITORING LAPORAN';
        if (pathname.includes('/master/madrasah')) return 'DATABASE MADRASAH';
        if (pathname.includes('/master/users')) return 'DATABASE PENGGUNA';
        return 'PANEL PIMPINAN';
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            <Sidebar role="kasi_penmad" isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />


            <div className={`flex-1 min-w-0 transition-all duration-500 ease-in-out ${sidebarOpen ? 'md:ml-[20rem]' : 'md:ml-0'}`}>
                <header className="h-24 bg-white/80 backdrop-blur-md border-b-[3px] border-slate-900 flex items-center px-6 md:px-12 justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-6">
                        <button
                            className="p-3.5 hover:bg-slate-900 hover:text-white rounded-2xl border-[3px] border-slate-900 shadow-[4px_4px_0_0_#0f172a] transition-all active:translate-y-1 active:shadow-none bg-white group"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu size={22} className="transition-transform group-hover:rotate-90 duration-300" />
                        </button>
                        <div className="flex flex-col">
                            <h2 className="font-black text-2xl leading-none text-slate-900 italic tracking-tighter">{getTitle()}</h2>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Otoritas Kasi Penmad (Oversight)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/pengaturan"
                            className="flex items-center gap-4 pl-6 border-l-2 border-slate-100 transition-all group"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-right">AKSES PIMPINAN</p>
                                <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[150px]">
                                    {userName}
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl bg-slate-900 border-2 border-slate-900 text-white flex items-center justify-center font-black text-xl transition-all ${pathname === '/admin/pengaturan' ? 'bg-slate-700' : 'group-hover:bg-slate-800'}`}>
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
