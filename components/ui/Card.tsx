import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, title }) => {
    return (
        <div className={`card ${className || ''}`}>
            {title && <h3 className="text-xl font-black mb-6 border-b-2 pb-3 border-slate-300 text-slate-900 text-center tracking-tight uppercase">{title}</h3>}
            {children}
        </div>
    );
};
