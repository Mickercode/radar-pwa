import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--bg-2)] text-[var(--text)] border border-[var(--border-strong)] hover:-translate-y-0.5 hover:border-[var(--cyan)] active:translate-y-0',
        primary:
          'bg-gradient-to-r from-[var(--cyan)] to-[#36e0d0] text-[#04141a] border-transparent shadow-[0_6px_24px_-8px_var(--accent-glow)] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-6px_var(--accent-glow)] active:scale-[0.97]',
        ghost:
          'bg-transparent text-[var(--text-dim)] border-transparent hover:bg-[var(--bg-hover)] hover:text-[var(--text)]',
        destructive:
          'bg-[var(--coral)] text-white border-transparent hover:opacity-90',
        outline:
          'bg-transparent border border-[var(--border-strong)] text-[var(--text-dim)] hover:border-[var(--cyan)] hover:text-[var(--text)]',
        glass:
          'bg-white/5 backdrop-blur-glass border border-white/10 text-[var(--text)] hover:bg-white/10 hover:border-white/20 active:scale-[0.97]',
      },
      size: {
        default: 'h-12 px-6',
        sm:      'h-9 px-4 text-xs',
        lg:      'h-14 px-8 text-base',
        icon:    'h-10 w-10 rounded-full p-0',
        'icon-sm': 'h-8 w-8 rounded-full p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
