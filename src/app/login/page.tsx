'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { FaGoogle, FaDiscord, FaTwitch, FaApple } from 'react-icons/fa';
import Image from 'next/image';
import { useNotification } from '@/contexts/NotificationContext'; // <-- 1. Import hooka

// --- Validation schema for the form ---
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;


const SocialLoginButton = ({ icon, text, bgColor, textColor, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center py-2.5 px-4 rounded-lg font-semibold transition-transform transform hover:scale-105 ${bgColor} ${textColor}`}
  >
    {icon}
    <span className="ml-2">{text}</span>
  </button>
);

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { notify } = useNotification(); // <-- 2. Użycie hooka

  // Get everything we need directly from the AuthContext
  const { isAuthenticated, isLoading, csrfToken, login } = useAuth();

  // react-hook-form setup
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => { setMounted(true); }, []);

  // This effect redirects already logged-in users
  useEffect(() => {
    if (mounted && !isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, mounted]);

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      await login({ ...data, csrfToken });
      
      // 3. Powiadomienie o sukcesie
      notify('Login successful! Redirecting...', 'success');

      // The redirect will ONLY happen after 'login' completes successfully
      router.push('/dashboard'); 

    } catch (err: any) {
      console.error('Login failed:', err);
      // 4. Powiadomienie o błędzie
      notify(err.message || 'An unexpected error occurred.', 'error');
    }
  };

  if (!mounted || (isLoading && !isSubmitting)) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  const astronautPath = '/images/games/astronaut.png';
  const logoPath = '/images/pairly_logo.png';

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a1a1a] border-2 border-[#333] rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={astronautPath}
            alt="Astronaut in space"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-40 blur-sm animate-float-slow"
          />
        </div>

        <div className="absolute inset-0 bg-black/60 z-10"></div>

        <div className="relative z-20 flex flex-col justify-center items-center p-4 sm:p-8">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-6">
                <Image src={logoPath} alt="Pairly Logo" width={80} height={80} className="w-24 h-auto" />
              </Link>
              <h2 className="text-3xl font-montserrat-medium font-semibold">Welcome back</h2>
              <p className="text-zinc-400 mt-1 text-sm font-montserrat-medium">Log in to continue your journey.</p>
            </div>

            <div className="space-y-2 mb-4">
              <SocialLoginButton icon={<FaGoogle size={18} />} text="Continue with Google" bgColor="bg-white" textColor="text-black" onClick={() => {}} />
              <SocialLoginButton icon={<FaDiscord size={18} />} text="Continue with Discord" bgColor="bg-[#5865F2]" textColor="text-white" onClick={() => {}} />
              <SocialLoginButton icon={<FaTwitch size={18} />} text="Continue with Twitch" bgColor="bg-[#9146FF]" textColor="text-white" onClick={() => {}} />
              <SocialLoginButton icon={<FaApple size={20} />} text="Continue with Apple" bgColor="bg-black" textColor="text-white" onClick={() => {}} />
            </div>

            <div className="flex items-center my-6">
              <hr className="w-full border-zinc-700" />
              <span className="px-4 text-xs font-medium text-zinc-500 font-montserrat-medium">OR</span>
              <hr className="w-full border-zinc-700" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-zinc-300 mb-1 text-left font-montserrat-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={`w-full bg-zinc-800/80 backdrop-blur-sm rounded-lg px-3 py-2 border transition-all focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500/50' : 'border-zinc-700 focus:ring-blue-500/50 focus:border-blue-500'}`}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                />
                {errors.email && <p className="mt-1 text-xs text-red-400 text-left font-montserrat-medium">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-xs font-medium text-zinc-300 font-montserrat-medium">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-blue-500 font-semibold hover:text-blue-400 transition-colors duration-200 font-montserrat-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`w-full bg-zinc-800/80 backdrop-blur-sm rounded-lg px-3 py-2 pr-10 border transition-all focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-500/50' : 'border-zinc-700 focus:ring-blue-500/50 focus:border-blue-500'}`}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-400 text-left font-montserrat-medium">{errors.password.message}</p>}
              </div>
              
              {/* 5. Usunięto stary element wyświetlający błąd */}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-montserrat-medium"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Log in</span>
                    <ArrowRight className="ml-2" size={16} />
                  </>
                )}
              </Button>
            </form>
            
            <div className="text-center text-xs text-zinc-400 mt-6 font-montserrat-medium font-semibold">
              <span>Don't have an account? </span>
              <Link 
                href="/register" 
                className="text-sm text-blue-500 font-semibold hover:text-blue-400 transition-colors duration-200 font-medium"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
