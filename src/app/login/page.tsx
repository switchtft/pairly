'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthForm } from '@/hooks/useAuthForm';
import { Eye, EyeOff, Mail, Lock, Gamepad2, ArrowRight } from 'lucide-react';
import { FaGoogle, FaDiscord, FaTwitch, FaFacebook, FaApple } from 'react-icons/fa'; // Correct import of social icons
import Image from 'next/image';  // Import next/image

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { errors, isSubmitting, handleLogin } = useAuthForm();

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

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#e6915b]"></div>
      </div>
    );
  }

  // Astronaut Image Path
  const astronautPath = '/images/games/astronaut.png'; 
  console.log('Astronaut Image Path:', astronautPath);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center px-4">
      <div className="max-w-4xl w-full flex justify-between items-center p-8 bg-[#1a1a1a] border-2 border-[#333] rounded-2xl shadow-lg relative">
        
        {/* Left Section with Animated Astronaut */}
        <div className="w-1/2 flex justify-center items-center relative overflow-hidden">
          {/* Background Image and Positioning */}
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/mnt/data/fa6f8d7a-f00d-40f0-a775-9734b1cffb18.png')` }}>
            {/* Astronaut Image */}
            <div className="relative w-full h-96">
              <Image
                src={astronautPath}  // Path to astronaut image
                alt="Astronaut"
                width={500} // Width for the image
                height={500} // Height for the image
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float"  // Center the image and animate it
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-black opacity-50"></div> {/* Dark overlay */}
        </div>

        {/* Right Section with Login Form */}
        <div className="w-1/2 space-y-6">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-3xl font-bold bg-gradient-to-r from-[#e6915b] to-[#6b8ab0] bg-clip-text text-transparent mb-6 font-montserrat">
              <Gamepad2 size={32} className="mr-3 text-[#e6915b]" />
              Pairly
            </Link>
            <h2 className="text-3xl font-bold text-white mb-2 font-montserrat">Login</h2>
          </div>

          {/* Social Login Icons */}
          <div className="flex justify-center space-x-6 mb-6">
            <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center">
              <FaGoogle size={20} />
            </button>
            <button className="w-12 h-12 bg-[#7289da] text-white rounded-full flex items-center justify-center">
              <FaDiscord size={20} />
            </button>
            <button className="w-12 h-12 bg-[#9146ff] text-white rounded-full flex items-center justify-center">
              <FaTwitch size={20} />
            </button>
            <button className="w-12 h-12 bg-[#1877f2] text-white rounded-full flex items-center justify-center">
              <FaFacebook size={20} />
            </button>
            <button className="w-12 h-12 bg-[#000000] text-white rounded-full flex items-center justify-center">
              <FaApple size={20} />
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#e6915b] mb-2 font-montserrat">
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
              {errors.email && <p className="mt-2 text-sm text-red-400 font-montserrat">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#e6915b] mb-2 font-montserrat">
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
              {errors.password && <p className="mt-2 text-sm text-red-400 font-montserrat">{errors.password}</p>}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                href="/forgot-password" 
                className="text-sm text-[#6b8ab0] hover:text-[#5a79a0] transition-colors font-montserrat"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#f1c40f] text-black font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-montserrat"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
              ) : (
                <>
                  Login
                  <ArrowRight className="ml-2" size={16} />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-white">
            <span>Don't have an account? </span>
            <Link href="/register" className="text-[#6b8ab0] hover:text-[#5a79a0] font-medium transition-colors">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
