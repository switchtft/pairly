'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthForm } from '@/hooks/useAuthForm';
import { Eye, EyeOff, Mail, Lock, Gamepad2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { errors, isSubmitting, handleLogin } = useAuthForm();

  // Zapobiegaj hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, mounted]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form Submitted');
    console.log('Received email:', email);
    console.log('Received password:', password);

    if (!email || !password) {
      console.error('Email and password are required');
      return;
    }

    try {
      await handleLogin(email, password);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  // Pokazuj loading tylko po zamontowaniu
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#e6915b]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-3xl font-bold bg-gradient-to-r from-[#e6915b] to-[#6b8ab0] bg-clip-text text-transparent mb-6">
            <Gamepad2 size={32} className="mr-3 text-[#e6915b]" />
            Pairly
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-[#e6915b]">Sign in to your gaming account</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 space-y-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#e6915b] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e6915b]" size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-[#2a2a2a] rounded-lg px-4 py-3 pl-11 border transition-all focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-[#333] focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0]'}`}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#e6915b] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e6915b]" size={20} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-[#2a2a2a] rounded-lg px-4 py-3 pl-11 pr-11 border transition-all focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-[#333] focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0]'}`}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#e6915b] hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                href="/forgot-password" 
                className="text-sm text-[#6b8ab0] hover:text-[#5a79a0] transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#e6915b] to-[#e6915b] hover:from-[#d18251] hover:to-[#d18251] text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2" size={16} />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2a2a]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1a1a1a] text-[#e6915b]">Don&apos;t have an account?</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <Link 
              href="/register" 
              className="text-[#6b8ab0] hover:text-[#5a79a0] font-medium transition-colors"
            >
              Create your gaming account
            </Link>
          </div>
        </div>

        {/* Demo Account Notice */}
        <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-4">
          <p className="text-[#e6915b] text-sm text-center">
            Demo Account: Use <span className="text-[#e6915b]">demo@pairly.com</span> / <span className="text-[#e6915b]">password</span>
          </p>
        </div>
      </div>
    </div>
  );
}