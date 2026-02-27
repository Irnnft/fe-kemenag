'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    School,
    Users,
    LogOut,
    Menu,
    ChevronRight,
    Shield
} from 'lucide-react';
import { api } from '@/lib/api';

interface SidebarProps {
    role: 'operator_sekolah' | 'staff_penmad' | 'kasi_penmad';
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, setIsOpen }) => {
    const pathname = usePathname();

    const operatorLinks = [
        { href: '/operator/dashboard', label: 'DASHBOARD', icon: <LayoutDashboard size={20} /> },
        { href: '/operator/profil', label: 'PROFIL MADRASAH', icon: <School size={20} /> },
        { href: '/operator/laporan', label: 'LAPORAN SAYA', icon: <FileText size={20} /> },
    ];

    const staffLinks = [
        { href: '/staff/dashboard', label: 'DASHBOARD KERJA', icon: <LayoutDashboard size={20} /> },
        { href: '/staff/laporan', label: 'VALIDASI LAPORAN', icon: <FileText size={20} /> },
        { href: '/staff/master/madrasah', label: 'MASTER MADRASAH', icon: <School size={20} /> },
        { href: '/staff/master/users', label: 'KELOLA USER', icon: <Users size={20} /> },
    ];

    const kasiLinks = [
        { href: '/admin/dashboard', label: 'RADAR MONITORING', icon: <LayoutDashboard size={20} /> },
        { href: '/admin/laporan', label: 'RADAR PENGAWASAN', icon: <FileText size={20} /> },
        { href: '/admin/master/madrasah', label: 'DATABASE MADRASAH', icon: <School size={20} /> },
        { href: '/admin/master/users', label: 'KELOLA AKUN SISTEM', icon: <Users size={20} /> },
        { href: '/admin/audit', label: 'AUDIT JEJAK DIGITAL', icon: <Shield size={20} /> },
    ];

    const links = role === 'operator_sekolah' ? operatorLinks
        : role === 'staff_penmad' ? staffLinks
            : kasiLinks;

    const roleLabel = role === 'kasi_penmad' ? 'KASI PENMAD (PIMPINAN)'
        : role === 'staff_penmad' ? 'STAF DATA (VERIFIKATOR)'
            : 'OPERATOR MADRASAH';

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-4 top-4 bottom-4 w-72 bg-white border-[3px] border-slate-900 z-50 rounded-[2.5rem] shadow-[8px_8px_0_0_#0f172a] transition-all duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-[calc(100%+2rem)] md:translate-x-0'}`}
            >
                {/* Logo Section */}
                <div className="p-8 pb-6 border-b-2 border-slate-100">
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 border-[3px] border-slate-900 flex items-center justify-center text-white shadow-[6px_6px_0_0_#0f172a] transition-transform hover:scale-105">
                            <School size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="font-black text-slate-900 leading-none tracking-tight text-3xl italic">
                                MIS KAMPAR
                            </h1>
                            <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.15em] leading-none mt-2">
                                KEMENAG KAB. KAMPAR
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto no-scrollbar">
                    <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">MENU UTAMA</p>
                    {links.map((link) => {
                        const isActive = pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }}
                                className={`group flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 relative
                                    ${isActive
                                        ? 'bg-slate-900 text-white shadow-lg translate-x-1'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-500'} transition-colors`}>
                                        {link.icon}
                                    </span>
                                    <span className="text-[11px] font-black uppercase tracking-widest">{link.label}</span>
                                </div>
                                {isActive && <ChevronRight size={14} className="text-emerald-400" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Section */}
                <div className="p-6 border-t-2 border-slate-100">
                    <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-100 mb-4">
                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Role Sebagai</p>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{roleLabel}</p>
                    </div>

                    <button
                        onClick={async () => {
                            if (confirm('Konfirmasi Keluar dari Sistem?')) {
                                try {
                                    await api.auth.logout();
                                } catch (error) {
                                    console.error('Logout failed:', error);
                                } finally {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('user');
                                    window.location.href = '/';
                                }
                            }
                        }}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 font-black text-[11px] uppercase tracking-widest hover:bg-rose-50 transition-all border-2 border-transparent hover:border-rose-100 group"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        <span>LOGOUT</span>
                    </button>
                </div>
            </aside>
        </>
    );
};
