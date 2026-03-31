import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);
  
  if (paths.length === 0) return null;

  const crumbs = paths.map((p, i) => ({
    label: p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    path: '/' + paths.slice(0, i + 1).join('/'),
    isLast: i === paths.length - 1,
  }));

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors"><Home className="h-4 w-4" /></Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-foreground transition-colors">{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
