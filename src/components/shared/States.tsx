import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { FileQuestion, AlertTriangle, ShieldX, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LoadingCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-500">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-6 shadow-soft backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32 opacity-60" />
        </div>
      ))}
    </div>
  );
}

export function LoadingTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 shadow-card backdrop-blur-sm overflow-hidden animate-in fade-in duration-500">
      <div className="flex items-center gap-4 bg-muted/30 border-b border-border/50 p-4">
        <Skeleton className="h-10 flex-1 max-w-sm rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-5 flex-1 rounded opacity-70" />
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
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="rounded-xl bg-muted/50 p-6 mb-6 ring-1 ring-border/50 shadow-soft">
        <Icon className="h-10 w-10 text-muted-foreground/60" />
      </div>
      <h3 className="text-xl font-bold font-display tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-sm font-medium text-muted-foreground max-w-[320px] leading-relaxed">{description}</p>
      {action && (
        <Button className="mt-8 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] px-8 h-10" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({ message = 'System encountered an unexpected exception', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="rounded-xl bg-destructive/5 p-6 mb-6 ring-1 ring-destructive/20 shadow-soft">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-xl font-bold font-display tracking-tight text-foreground">Operational Error</h3>
      <p className="mt-2 text-sm font-medium text-muted-foreground max-w-[320px] leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-8 rounded-lg font-bold border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all px-8 h-10" onClick={onRetry}>
          Retry Connection
        </Button>
      )}
    </div>
  );
}

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="rounded-xl bg-destructive/5 p-6 mb-6 ring-1 ring-destructive/20 shadow-soft">
        <ShieldX className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-xl font-bold font-display tracking-tight text-foreground">Access Restricted</h3>
      <p className="mt-2 text-sm font-medium text-muted-foreground max-w-[320px] leading-relaxed">
        Unauthorized access attempt detected. You do not hold the required credentials to view this specific academic portal section.
      </p>
      <Button variant="outline" className="mt-8 rounded-lg font-bold px-8 h-10" onClick={() => window.location.href = '/'}>
        Return to Safety
      </Button>
    </div>
  );
}
