import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, Eye, EyeOff, User, BookOpen, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginAs } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: 'Welcome back!', description: 'Login successful.' });
      navigate('/');
    } catch {
      toast({ title: 'Login failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    loginAs(role);
    toast({ title: `Logged in as ${role}`, description: 'Demo mode active.' });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-2xl bg-primary-foreground/20 p-3">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold font-display">AcademIQ</h1>
            </div>
            <h2 className="text-4xl font-bold font-display leading-tight mb-4">
              Student Registration &<br />Grade Management System
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              A comprehensive academic management platform for students, instructors, and administrators.
            </p>
            <div className="mt-12 grid grid-cols-3 gap-4">
              {[
                { icon: User, label: 'Students', count: '1,200+' },
                { icon: BookOpen, label: 'Courses', count: '150+' },
                { icon: ShieldCheck, label: 'Departments', count: '8' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur">
                  <stat.icon className="h-5 w-5 mb-2" />
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-xs text-primary-foreground/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="rounded-2xl gradient-primary p-3">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold font-display">AcademIQ</h1>
          </div>

          <Card className="rounded-2xl shadow-lg border-0 bg-card">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-display">Welcome Back</CardTitle>
              <CardDescription>Sign in to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
                  </div>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="rounded-xl pr-10" required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm font-normal">Remember me</Label>
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or try demo</span></div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {([
                    { role: 'student' as UserRole, icon: User, label: 'Student' },
                    { role: 'instructor' as UserRole, icon: BookOpen, label: 'Instructor' },
                    { role: 'admin' as UserRole, icon: ShieldCheck, label: 'Admin' },
                  ]).map((demo) => (
                    <Button key={demo.role} variant="outline" className="rounded-xl flex-col h-auto py-3 gap-1" onClick={() => handleDemoLogin(demo.role)}>
                      <demo.icon className="h-4 w-4" />
                      <span className="text-xs">{demo.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
