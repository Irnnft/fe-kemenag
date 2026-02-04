'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    School,
    Users,
    Building2,
    Wallet,
    Printer,
    LogOut,
    Settings,
    Menu
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
    role: 'operator' | 'admin';
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, setIsOpen }) => {
    const pathname = usePathname();

    const operatorLinks = [
        { href: '/operator/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/operator/profil', label: 'Profil Madrasah', icon: <School size={20} /> },
        { href: '/operator/laporan', label: 'Laporan Bulanan', icon: <FileText size={20} /> },
        // These could be sub-menus or just navigating to the active report. 
        // For sidebar simplicity, we can keep high level.
    ];

    const adminLinks = [
        { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { href: '/admin/laporan', label: 'Validasi Laporan', icon: <FileText size={20} /> },
        { href: '/admin/master/madrasah', label: 'Master Sekolah', icon: <School size={20} /> },
        { href: '/admin/master/users', label: 'Manajemen User', icon: <Users size={20} /> },
        { href: '/admin/recap', label: 'Rekapitulasi', icon: <Printer size={20} /> },
    ];

    const links = role === 'operator' ? operatorLinks : adminLinks;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-30 transition-all duration-300 ease-in-out ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0'}`}
            >
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                        K
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-800">SI-EMIS</h1>
                        <p className="text-xs text-slate-500">Kemenag Reports</p>
                    </div>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-80px)]">
                    {links.map((link) => {
                        const isActive = pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-8 mt-8 border-t border-slate-100">
                        <button
                            onClick={() => {
                                if (confirm('Apakah Anda yakin ingin keluar?')) {
                                    window.location.href = '/';
                                }
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-800 font-bold hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border-2 border-transparent hover:border-red-200"
                        >
                            <LogOut size={24} className="text-red-600" />
                            <span>Keluar</span>
                        </button>
                    </div>
                </nav>
            </aside>
        </>
    );
};
