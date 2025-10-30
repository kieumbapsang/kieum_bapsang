import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  helperText?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error = false, helperText = '', id, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          id={id}
          ref={ref}
          className={cn(
            'flex h-14 w-full rounded-lg border-2 border-neutral-300 bg-white px-4 py-3',
            'text-base text-neutral-900 placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all appearance-none', // ✅ 브라우저 기본 화살표 최소화
            {
              'border-destructive-500 focus:ring-destructive-500': error,
            },
            className
          )}
          {...props}
        >
          {children}
        </select>
        {helperText && (
          <p
            className={cn(
              'mt-2 text-sm font-medium',
              error ? 'text-destructive-500' : 'text-neutral-500 text-right'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export { Select };