import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = 'text', label, error, helperText, id, ...props },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className='w-full space-y-2'>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium leading-none',
              'text-foreground',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            )}
          >
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border border-input',
            'bg-background px-3 py-2 text-sm text-foreground',
            'ring-offset-background transition-colors-smooth',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            // Mobile optimizations
            'touch-target',
            // Error state
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          id={inputId}
          {...props}
        />
        {error && (
          <p
            className='text-sm text-destructive animate-slide-down'
            role='alert'
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className='text-sm text-muted-foreground'>{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
