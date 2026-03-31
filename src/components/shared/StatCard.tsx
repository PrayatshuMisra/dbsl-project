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
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-md',
        gradient ? 'gradient-primary text-primary-foreground border-0' : 'bg-card text-card-foreground',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className={cn('text-sm font-medium', gradient ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{title}</p>
        <div className={cn('rounded-xl p-2.5', gradient ? 'bg-primary-foreground/20' : 'bg-primary/10')}>
          <Icon className={cn('h-5 w-5', gradient ? 'text-primary-foreground' : 'text-primary')} />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold font-display">{value}</p>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-2">
            {trend && (
              <span className={cn('text-xs font-semibold', trend.positive ? 'text-success' : 'text-destructive')}>
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
            )}
            {description && <span className={cn('text-xs', gradient ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{description}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
