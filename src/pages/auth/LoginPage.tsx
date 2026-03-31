import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Eye, EyeOff, User, BookOpen, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [department, setDepartment] = useState('CSE');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login, signUp, loginAs } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, role, fullName, department);
        toast({ title: 'Account created!', description: 'Welcome to MIT Manipal portal.' });
      } else {
        await login(email, password);
        toast({ title: 'Welcome back!', description: 'Login successful.' });
      }
      navigate('/');
    } catch (err: any) {
      toast({ title: isSignUp ? 'Sign up failed' : 'Login failed', description: err.message, variant: 'destructive' });
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
    <div className="min-h-screen flex bg-black bg-[url('/login-bg.png')] bg-cover bg-center relative isolate">
      <div className="absolute inset-0 bg-black/60 -z-10" />
      
      {/* Left panel - decorative (MIT Logo & Stats) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-4 mb-16">
              <div className="rounded-xl bg-white p-2.5 shadow-xl ring-2 ring-white/20">
                <img src="/mit-symb.jpg" alt="MIT Manipal Emblem" className="h-12 w-12 object-contain" />
              </div>
              <h1 className="text-4xl font-black font-display tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">MIT MANIPAL</h1>
            </div>

            <div className="space-y-10">
              <h2 className="text-7xl font-black font-display leading-[1.05] tracking-tight text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.9)]">
                {isSignUp ? 'Join Our' : 'Student Portal for'}<br />
                <span className="text-primary-foreground px-4 py-1 bg-orange-500/80 rounded-xl shadow-lg inline-block mt-4">
                  {isSignUp ? 'Elite Community' : 'Academic Excellence'}
                </span>
              </h2>
              <p className="text-2xl text-white font-bold leading-relaxed max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                Official registration and grade management portal for Manipal Institute of Technology.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel - login/signup form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-transparent overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md my-8">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="rounded-xl bg-white p-1.5 shadow-lg">
              <img src="/mit-symb.jpg" alt="MIT Manipal Emblem" className="h-8 w-8 object-contain" />
            </div>
            <h1 className="text-2xl font-extrabold font-display tracking-tight text-white">MIT MANIPAL</h1>
          </div>

          <Card className="rounded-xl shadow-premium border-white/10 glass">
            <CardHeader className="text-center pb-6 border-b border-border/40">
              <CardTitle className="text-2xl font-bold font-display tracking-tight text-foreground">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className="text-sm font-medium mt-2">
                {isSignUp ? 'Register to access your academic portal' : 'Access your portal to continue your journey'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {isSignUp && (
                    <motion.div
                      key="signup-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</Label>
                        <Input id="fullName" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} className="rounded-lg h-10 border-border/60 focus:ring-primary/20" required />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Portal Role</Label>
                          <Select value={role} onValueChange={(v: UserRole) => setRole(v)}>
                            <SelectTrigger id="role" className="rounded-lg h-10 border-border/60">
                              <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="instructor">Instructor</SelectItem>
                              <SelectItem value="admin">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dept" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Department</Label>
                          <Select value={department} onValueChange={setDepartment}>
                            <SelectTrigger id="dept" className="rounded-lg h-10 border-border/60">
                              <SelectValue placeholder="Dept" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CSE">CSE</SelectItem>
                              <SelectItem value="ECE">ECE</SelectItem>
                              <SelectItem value="IT">IT</SelectItem>
                              <SelectItem value="ME">ME</SelectItem>
                              <SelectItem value="EEE">EEE</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
                  <Input id="email" type="email" placeholder="user@example.com" value={email} onChange={e => setEmail(e.target.value)} className="rounded-lg h-10 border-border/60 focus:ring-primary/20" required />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                    {!isSignUp && <button type="button" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">Reset Help?</button>}
                  </div>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="rounded-lg h-10 pr-10 border-border/60 focus:ring-primary/20" required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {!isSignUp && (
                  <div className="flex items-center gap-2 ml-1">
                    <Checkbox id="remember" className="rounded border-border/60 data-[state=checked]:bg-primary" />
                    <Label htmlFor="remember" className="text-xs font-semibold text-muted-foreground cursor-pointer">Trust this device for 30 days</Label>
                  </div>
                )}

                <Button type="submit" className="bg-orange-500/80 hover:bg-orange-500/95 w-full h-11 rounded-lg font-bold shadow-lg shadow-primary/25 hover:translate-y-[-1px] transition-all" disabled={loading}>
                  {loading ? (isSignUp ? 'Creating Account...' : 'Authenticating...') : (isSignUp ? 'Register for Portal' : 'Sign Into Portal')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button 
                  type="button" 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
                </button>
              </div>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]"><span className="bg-black px-4 text-white/40">Demo Experience</span></div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {([
                    { role: 'student' as UserRole, icon: User, label: 'Student' },
                    { role: 'instructor' as UserRole, icon: BookOpen, label: 'Instructor' },
                    { role: 'admin' as UserRole, icon: ShieldCheck, label: 'Admin' },
                  ]).map((demo) => (
                    <Button key={demo.role} variant="outline" className="rounded-lg flex flex-col h-auto py-3 gap-1.5 border-border/50 hover:bg-primary/5 hover:border-primary/50 group transition-all" onClick={() => handleDemoLogin(demo.role)}>
                      <demo.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">{demo.label}</span>
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
