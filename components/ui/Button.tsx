import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    icon,
    className,
    ...props
}) => {
    const baseClass = "btn";

    let variantClass = "";
    if (variant === 'primary') variantClass = "btn-primary";
    else if (variant === 'outline') variantClass = "btn-outline";
    else if (variant === 'danger') variantClass = "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200";
    else if (variant === 'ghost') variantClass = "hover:bg-slate-100 text-slate-600 border-transparent shadow-none";

    const sizeClass = size === 'sm' ? "text-xs px-3 py-1.5 h-8 gap-1" :
        size === 'lg' ? "text-base px-6 py-3" : "";

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${className || ''} ${!children ? 'aspect-square !p-0 flex items-center justify-center rounded-xl' : ''}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            {!isLoading && icon && (
                <span className={children ? (size === 'sm' ? "mr-1" : "mr-2") : "flex items-center justify-center"}>
                    {icon}
                </span>
            )}
            {children}
        </button>
    );
};
