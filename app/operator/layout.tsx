'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Get current page title simply
    const getTitle = () => {
        if (pathname.includes('/dashboard')) return 'Dashboard';
        if (pathname.includes('/profil')) return 'Profil Madrasah';
        if (pathname.includes('/laporan')) return 'Laporan Bulanan';
        return 'Operator Area';
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar role="operator" isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex-1 md:ml-64 transition-all duration-300">
                <header className="h-20 bg-white border-b-2 border-slate-300 flex items-center px-4 md:px-10 justify-between sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-3 hover:bg-slate-100 rounded-lg border-2 border-slate-200"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="font-black text-xl text-slate-900 uppercase tracking-wide">{getTitle()}</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-slate-900">Selamat Datang,</p>
                            <p className="text-xs font-black text-emerald-800 uppercase">Operator Madrasah</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-white shadow-md" />
                    </div>
                </header>

                <main className="p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
