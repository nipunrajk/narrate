import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  ...props
}) => {
  const baseStyles = 'animate-pulse bg-slate-200 rounded';

  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseStyles,
              variants.text,
              index === lines - 1 && 'w-3/4', // Last line is shorter
              className
            )}
            style={{ width, height }}
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      style={{ width, height }}
      {...props}
    />
  );
};

// Predefined skeleton components for common use cases
const EntryListSkeleton: React.FC = () => (
  <div className='space-y-4'>
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className='p-4 border border-slate-200 rounded-lg'>
        <div className='flex items-center justify-between mb-2'>
          <Skeleton variant='text' width='120px' height='16px' />
          <Skeleton variant='text' width='80px' height='14px' />
        </div>
        <Skeleton variant='text' lines={3} />
      </div>
    ))}
  </div>
);

const SummaryModalSkeleton: React.FC = () => (
  <div className='space-y-4'>
    <Skeleton variant='text' width='200px' height='20px' />
    <Skeleton variant='text' lines={6} />
    <div className='pt-4 border-t border-slate-200'>
      <Skeleton variant='text' width='150px' height='16px' />
      <div className='mt-2'>
        <Skeleton variant='text' lines={2} />
      </div>
    </div>
  </div>
);

const FormSkeleton: React.FC = () => (
  <div className='space-y-4'>
    <div>
      <Skeleton variant='text' width='100px' height='16px' className='mb-2' />
      <Skeleton variant='rectangular' height='120px' />
    </div>
    <div className='flex justify-end'>
      <Skeleton variant='rectangular' width='120px' height='40px' />
    </div>
  </div>
);

export { Skeleton, EntryListSkeleton, SummaryModalSkeleton, FormSkeleton };
