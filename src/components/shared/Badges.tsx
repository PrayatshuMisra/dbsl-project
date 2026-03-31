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
    <span className={cn('inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold', gradeColors[grade] || 'bg-muted text-muted-foreground')}>
      {grade}
    </span>
  );
}

const statusColors: Record<EnrollmentStatus, string> = {
  pending: 'bg-warning/15 text-warning',
  approved: 'bg-success/15 text-success',
  rejected: 'bg-destructive/15 text-destructive',
  withdrawn: 'bg-muted text-muted-foreground',
};

export function StatusBadge({ status }: { status: EnrollmentStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize', statusColors[status])}>
      {status}
    </span>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', active ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground')}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}
