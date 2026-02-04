import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, Shield, Zap, Users } from 'lucide-react';
import { Button, Input, FormField, Alert, cn } from '../components/ui/index';

// ============================================
// LOGIN VIEW
// Clean, professional authentication interface
// ============================================
export const LoginView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const API_URL = baseUrl.replace(/\/api\/?$/, '');
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      localStorage.setItem('adminToken', data.accessToken);
      if (data.user) {
        localStorage.setItem('adminUser', JSON.stringify(data.user));
      }

      navigate('/');
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Shield, title: 'Secure Access', description: 'Enterprise-grade security for your data' },
    { icon: Zap, title: 'Fast & Reliable', description: 'Optimized for performance and uptime' },
    { icon: Users, title: 'Team Management', description: 'Full control over users and permissions' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-slate-900 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/4 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
              <span className="font-bold text-white text-xl">C</span>
            </div>
            <span className="text-2xl font-semibold text-white">ChrisLO Admin</span>
          </div>

          {/* Hero Text */}
          <div className="my-auto py-12">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6 max-w-lg">
              Manage your platform with 
              <span className="text-indigo-400"> confidence</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed mb-10">
              Complete control over protocols, user management, and organization assets in one unified dashboard.
            </p>

            {/* Feature Cards */}
            <div className="space-y-4 max-w-md">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-0.5">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>© {new Date().getFullYear()} ChrisLO. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-400">All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <span className="font-bold text-white text-lg">C</span>
            </div>
            <span className="text-xl font-semibold text-slate-900">ChrisLO Admin</span>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Enter your credentials to access your account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="error" className="mb-6" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <FormField label="Email Address" required>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                leftIcon={<Mail size={18} />}
                autoComplete="email"
                autoFocus
              />
            </FormField>

            <FormField label="Password" required>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  leftIcon={<Lock size={18} />}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </FormField>

            {/* Options Row */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer" 
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors select-none">
                  Remember me
                </span>
              </label>
              <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
              rightIcon={!isLoading ? <ArrowRight size={18} /> : undefined}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              Need an admin account?{' '}
              <a href="#" className="font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                Contact your administrator
              </a>
            </p>
          </div>

          {/* Credentials Hint */}
          <div className="mt-6 p-4 rounded-xl bg-slate-100 border border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              <strong>Admin:</strong> Use <code className="px-1.5 py-0.5 bg-white rounded text-slate-700">admin@chrislo.com</code> / <code className="px-1.5 py-0.5 bg-white rounded text-slate-700">admin</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

