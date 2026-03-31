import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="mx-auto mb-6 rounded-2xl gradient-primary p-4 w-fit">
          <GraduationCap className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-7xl font-bold font-display gradient-text mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Button className="rounded-xl" onClick={() => navigate('/')}><Home className="h-4 w-4 mr-2" />Back to Dashboard</Button>
      </motion.div>
    </div>
  );
}
