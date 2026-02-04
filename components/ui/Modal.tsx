'use client';

import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md pointer-events-auto"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 40 }}
                        className="relative bg-white w-full max-w-2xl max-h-[calc(100vh-80px)] rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border-4 border-slate-900 pointer-events-auto"
                    >
                        {/* Header - Fixed */}
                        <div className="bg-slate-900 px-10 py-8 flex items-center justify-between text-white shrink-0">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">{title}</h3>
                                <div className="h-1.5 w-12 bg-emerald-500 mt-2 rounded-full" />
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-white/20 rounded-2xl transition-all hover:rotate-90 active:scale-95 text-white"
                            >
                                <X size={32} />
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/10">
                            {children}
                        </div>

                        {/* Optional Fixed Footer */}
                        {footer && (
                            <div className="px-10 py-8 bg-white border-t-4 border-slate-100 shrink-0">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
