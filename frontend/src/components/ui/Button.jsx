import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export default function Button({ 
  children, 
  variant = 'primary', // primary, secondary, outline, danger
  className, 
  isLoading, 
  ...props 
}) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
    secondary: "bg-secondary text-white hover:bg-secondary-hover shadow-sm", // El Amarillo Mostaza
    outline: "border-2 border-primary text-primary hover:bg-primary-light",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "text-text-muted hover:bg-gray-100"
  };

  return (
    <button 
      className={twMerge(clsx(baseStyles, variants[variant], className))}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
}