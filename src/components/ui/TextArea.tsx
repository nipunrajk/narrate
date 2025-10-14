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

    // Auto-resize functionality
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        const adjustHeight = () => {
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        };

        textarea.addEventListener('input', adjustHeight);
        adjustHeight(); // Initial adjustment

        return () => textarea.removeEventListener('input', adjustHeight);
      }
    }, [autoResize]);

    return (
      <div className='w-full'>
        {label && (
          <label
            htmlFor={textareaId}
            className='block text-sm font-medium text-slate-700 mb-2'
          >
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
            // Journal-specific optimizations
            'leading-relaxed tracking-wide font-normal',
            // Auto-resize styles
            autoResize && 'overflow-hidden',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={textareaRef}
          id={textareaId}
          rows={autoResize ? 1 : rows}
          {...props}
        />
        {error && (
          <p className='mt-2 text-sm text-red-600' role='alert'>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className='mt-2 text-sm text-slate-500'>{helperText}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export { TextArea };
