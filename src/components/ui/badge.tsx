import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.06em] transition-colors',
  {
    variants: {
      variant: {
        news:
          'bg-black/60 text-[var(--cyan)] backdrop-blur-sm',
        podcast:
          'bg-black/60 text-[var(--lime)] backdrop-blur-sm',
        clip:
          'bg-black/60 text-[var(--amber)] backdrop-blur-sm',
        'news-solid':
          'bg-[rgba(0,194,203,0.15)] text-[var(--cyan)] border border-[rgba(0,194,203,0.3)]',
        'podcast-solid':
          'bg-[rgba(69,212,131,0.15)] text-[var(--lime)] border border-[rgba(69,212,131,0.3)]',
        'clip-solid':
          'bg-[rgba(242,180,65,0.15)] text-[var(--amber)] border border-[rgba(242,180,65,0.3)]',
        must:
          'bg-[rgba(242,180,65,0.18)] text-[var(--amber)] backdrop-blur-sm',
        default:
          'bg-[var(--bg-2)] text-[var(--text-dim)] border border-[var(--border)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
