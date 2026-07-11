import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'flex gap-1.5 px-[var(--page-px)] overflow-x-auto scrollbar-none flex-none',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base
      'flex-none h-9 px-4 rounded-full whitespace-nowrap cursor-pointer',
      'text-[0.8rem] font-semibold transition-all duration-150',
      'border border-[var(--border-strong)] bg-transparent text-[var(--text-dim)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)]',
      // Hover
      'hover:border-[var(--cyan)] hover:text-[var(--text)]',
      // Active
      'data-[state=active]:bg-[var(--cyan)] data-[state=active]:border-[var(--cyan)] data-[state=active]:text-[#04141a]',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('flex-1 overflow-hidden focus-visible:outline-none', className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// Chip-style tabs variant — smaller, for secondary filters like type filter
const ChipTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'flex gap-2 px-[var(--page-px)] pt-2 pb-1 overflow-x-auto scrollbar-none flex-none',
      className,
    )}
    {...props}
  />
));
ChipTabsList.displayName = 'ChipTabsList';

const ChipTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex-none h-7 px-3 rounded-full whitespace-nowrap cursor-pointer',
      'text-[0.72rem] font-semibold tracking-wide transition-all duration-150',
      'border border-[var(--border-strong)] bg-transparent text-[var(--text-dim)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)]',
      'hover:border-[var(--cyan)] hover:text-[var(--text)]',
      'data-[state=active]:bg-[var(--text)] data-[state=active]:border-[var(--text)] data-[state=active]:text-[var(--bg)]',
      className,
    )}
    {...props}
  />
));
ChipTabsTrigger.displayName = 'ChipTabsTrigger';

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  ChipTabsList,
  ChipTabsTrigger,
};
