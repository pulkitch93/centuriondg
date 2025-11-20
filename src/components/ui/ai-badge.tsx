import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pill' | 'minimal';
}

export function AIBadge({ className, size = 'sm', variant = 'default' }: AIBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2'
  };

  const variantClasses = {
    default: 'bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary',
    pill: 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg',
    minimal: 'bg-primary/10 text-primary border border-primary/20'
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium whitespace-nowrap',
      sizeClasses[size],
      variantClasses[variant],
      'animate-pulse-subtle',
      className
    )}>
      <Sparkles className={cn(
        'animate-pulse',
        size === 'sm' && 'h-3 w-3',
        size === 'md' && 'h-4 w-4',
        size === 'lg' && 'h-5 w-5'
      )} />
      <span>AI</span>
    </span>
  );
}