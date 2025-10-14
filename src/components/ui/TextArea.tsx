import React from 'react';
import { cn } from '@/lib/utils';

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      autoResize = false,
      id,
      rows = 6,
      ...props
    },
    ref
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

    // Auto-resize functionality with improved performance
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        let isResizing = false;

        const adjustHeight = () => {
          if (isResizing) return;
          isResizing = true;

          requestAnimationFrame(() => {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${Math.max(scrollHeight, 120)}px`;
            isResizing = false;
          });
        };

        textarea.addEventListener('input', adjustHeight);
        textarea.addEventListener('focus', adjustHeight);
        adjustHeight(); // Initial adjustment

        return () => {
          textarea.removeEventListener('input', adjustHeight);
          textarea.removeEventListener('focus', adjustHeight);
        };
      }
    }, [autoResize]);

    return (
      <div className='w-full space-y-2'>
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium leading-none',
              'text-foreground',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            )}
          >
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[120px] w-full rounded-lg border border-input',
            'bg-background px-3 py-3 text-sm text-foreground',
            'ring-offset-background transition-colors-smooth',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-none',
            // Journal-specific optimizations
            'font-serif leading-relaxed tracking-wide',
            'text-base sm:text-lg', // Larger text for better readability
            // Auto-resize styles
            autoResize && 'overflow-hidden',
            // Mobile optimizations
            'touch-target',
            // Error state
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={textareaRef}
          id={textareaId}
          rows={autoResize ? 1 : rows}
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

TextArea.displayName = 'TextArea';

export { TextArea };
