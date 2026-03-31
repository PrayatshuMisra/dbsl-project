import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { FileQuestion, AlertTriangle, ShieldX, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoadingCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
          <Skeleton className="mt-3 h-8 w-16" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function LoadingTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl border bg-card">
      <div className="flex items-center gap-4 border-b p-4">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface EmptyStateProps { title: string; description: string; icon?: React.ElementType; action?: { label: string; onClick: () => void }; }
export function EmptyState({ title, description, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-2xl bg-muted p-4 mb-4"><Icon className="h-8 w-8 text-muted-foreground" /></div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md">{description}</p>
      {action && <Button className="mt-4" onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-2xl bg-destructive/10 p-4 mb-4"><AlertTriangle className="h-8 w-8 text-destructive" /></div>
      <h3 className="text-lg font-semibold">Error</h3>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {onRetry && <Button variant="outline" className="mt-4" onClick={onRetry}>Try Again</Button>}
    </div>
  );
}

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-2xl bg-destructive/10 p-4 mb-4"><ShieldX className="h-8 w-8 text-destructive" /></div>
      <h3 className="text-lg font-semibold">Access Denied</h3>
      <p className="mt-1 text-sm text-muted-foreground">You don't have permission to view this page.</p>
    </div>
  );
}
