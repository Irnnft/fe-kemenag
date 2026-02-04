'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar role="admin" isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex-1 md:ml-64 transition-all duration-300">
                <header className="h-20 bg-white border-b-2 border-slate-300 flex items-center px-4 md:px-10 justify-between sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-3 hover:bg-slate-100 rounded-lg border-2 border-slate-200"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex flex-col">
                            <h2 className="font-black text-xl leading-tight text-slate-900 uppercase tracking-wide">Area Admin</h2>
                            <span className="text-sm font-bold text-emerald-800">Kasi Penmad (Kabupaten)</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white">A</div>
                    </div>
                </header>

                <main className="p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
