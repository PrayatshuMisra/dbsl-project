import { cn } from '@/lib/utils';
import { GradeValue, EnrollmentStatus } from '@/lib/types';

const gradeColors: Record<string, string> = {
  'A+': 'bg-success/15 text-success', 'A': 'bg-success/15 text-success', 'A-': 'bg-success/15 text-success',
  'B+': 'bg-info/15 text-info', 'B': 'bg-info/15 text-info', 'B-': 'bg-info/15 text-info',
  'C+': 'bg-warning/15 text-warning', 'C': 'bg-warning/15 text-warning', 'C-': 'bg-warning/15 text-warning',
  'D': 'bg-destructive/15 text-destructive', 'F': 'bg-destructive/15 text-destructive',
  'W': 'bg-muted text-muted-foreground', 'I': 'bg-muted text-muted-foreground', 'P': 'bg-success/15 text-success',
};

export function GradeBadge({ grade }: { grade: GradeValue }) {
  if (!grade) return <span className="text-sm text-muted-foreground">—</span>;
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold tracking-tight border border-current/10', gradeColors[grade] || 'bg-muted text-muted-foreground')}>
      {grade}
    </span>
  );
}

const statusColors: Record<EnrollmentStatus, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  withdrawn: 'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({ status }: { status: EnrollmentStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border', statusColors[status])}>
      {status}
    </span>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border', active ? 'bg-success/10 text-success border-success/20' : 'bg-muted/50 text-muted-foreground border-border')}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}
