import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; positive: boolean };
  className?: string;
  gradient?: boolean;
}

export function StatCard({ title, value, icon: Icon, description, trend, className, gradient }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'rounded-xl glass p-5 transition-all duration-300 hover:shadow-premium group overflow-hidden',
        gradient && 'border-primary/30 ring-1 ring-primary/10',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">{title}</p>
          <p className="text-3xl font-extrabold font-display tracking-tight text-foreground">{value}</p>
        </div>
        <div className={cn(
          'rounded-lg p-2.5 shadow-soft transition-transform group-hover:scale-110',
          gradient ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {(description || trend) && (
        <div className="mt-4 flex items-center gap-2 border-t border-border/40 pt-3">
          {trend && (
            <div className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
              trend.positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            )}>
              {trend.positive ? '↑' : '↓'} {trend.value}%
            </div>
          )}
          {description && <span className="text-xs font-medium text-muted-foreground">{description}</span>}
        </div>
      )}
    </motion.div>
  );
}
