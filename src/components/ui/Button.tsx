import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center rounded-lg font-medium',
      'transition-colors-smooth focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:pointer-events-none disabled:opacity-50',
      'touch-target' // Mobile-friendly touch target
    );

    const variants = {
      primary: cn(
        'bg-primary text-primary-foreground shadow-sm',
        'hover:bg-primary/90 active:bg-primary/95',
        'dark:shadow-soft-dark'
      ),
      secondary: cn(
        'bg-secondary text-secondary-foreground shadow-sm',
        'hover:bg-secondary/80 active:bg-secondary/90',
        'dark:shadow-soft-dark'
      ),
      outline: cn(
        'border border-input bg-background shadow-sm',
        'hover:bg-accent hover:text-accent-foreground',
        'active:bg-accent/90'
      ),
      ghost: cn(
        'hover:bg-accent hover:text-accent-foreground',
        'active:bg-accent/90'
      ),
      destructive: cn(
        'bg-destructive text-destructive-foreground shadow-sm',
        'hover:bg-destructive/90 active:bg-destructive/95',
        'dark:shadow-soft-dark'
      ),
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-md',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-11 px-6 text-base',
      xl: 'h-12 px-8 text-lg',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className='mr-2 h-4 w-4 animate-spin'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            aria-hidden='true'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
