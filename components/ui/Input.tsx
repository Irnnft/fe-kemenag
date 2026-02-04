import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, className, id, icon, ...props }) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={`input-group ${className || ''}`}>
            <label htmlFor={inputId} className="input-label">
                {label}
            </label>
            <div className="relative flex items-center w-full">
                {icon && (
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 z-10 flex items-center justify-center pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    id={inputId}
                    className="input-field"
                    style={{ paddingLeft: icon ? '4rem' : undefined }}
                    {...props}
                />
            </div>
            {error && <span className="text-sm font-bold text-red-700 mt-2 block">{error}</span>}
        </div>
    );
};
