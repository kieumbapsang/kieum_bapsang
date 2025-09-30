import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', isLoading = false, disabled = false, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg text-base font-medium transition-all active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50 touch-none',
          {
            'bg-primary-500 text-white shadow-soft active:bg-primary-600 active:shadow-pressed': variant === 'default',
            'bg-destructive-500 text-white shadow-soft active:bg-destructive-600 active:shadow-pressed': variant === 'destructive',
            'border-2 border-neutral-300 bg-transparent active:bg-neutral-100 active:border-neutral-400': variant === 'outline',
            'bg-chart-500 text-white shadow-soft active:bg-chart-600 active:shadow-pressed': variant === 'secondary',
            'hover:bg-neutral-100 active:bg-neutral-200 active:text-neutral-900': variant === 'ghost',
            'text-primary-500 underline-offset-4 hover:underline active:text-primary-600': variant === 'link',
            'h-12 py-3 px-6': size === 'default',
            'h-10 px-4': size === 'sm',
            'h-14 px-8': size === 'lg',
            'h-12 w-12': size === 'icon',
          },
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };