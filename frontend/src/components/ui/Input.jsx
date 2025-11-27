import React from 'react';

const Input = React.forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-text-main">{label}</label>}
      <input
        ref={ref}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
          error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;