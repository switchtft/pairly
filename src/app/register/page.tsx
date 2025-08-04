// src/app/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthForm } from '@/hooks/useAuthForm';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Gamepad2, 
  ArrowRight,
  UserCircle,
  Crown
} from 'lucide-react';

const GAMES = [
  { id: 'valorant', name: 'Valorant' },
  { id: 'league', name: 'League of Legends' },
  { id: 'csgo', name: 'CS:GO 2' },
];

const ROLES = {
  valorant: ['Duelist', 'Controller', 'Initiator', 'Sentinel'],
  league: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
  csgo: ['Entry Fragger', 'AWPer', 'Support', 'IGL', 'Lurker'],
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    game: '',
    role: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { errors, isSubmitting, handleRegister } = useAuthForm();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset role when game changes
      ...(field === 'game' && { role: '' })
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleRegister(formData);
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#e6915b]"></div>
      </div>
    );
  }

  const selectedGameRoles = formData.game ? ROLES[formData.game as keyof typeof ROLES] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-3xl font-bold bg-gradient-to-r from-[#e6915b] to-[#6b8ab0] bg-clip-text text-transparent mb-6">
            <Gamepad2 size={32} className="mr-3 text-[#e6915b]" />
            Pairly
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Join the community</h2>
          <p className="text-[#e6915b]">Create your gaming account and find your perfect teammates</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
            step >= 1 ? 'bg-[#e6915b] border-[#e6915b] text-white' : 'border-gray-600 text-gray-400'
          }`}>
            1
          </div>
          <div className={`w-16 h-0.5 transition-all ${
            step >= 2 ? 'bg-[#e6915b]' : 'bg-gray-600'
          }`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
            step >= 2 ? 'bg-[#e6915b] border-[#e6915b] text-white' : 'border-gray-600 text-gray-400'
          }`}>
            2
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 space-y-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Step 1: Account Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <UserCircle className="mx-auto text-[#e6915b] mb-2" size={32} />
                  <h3 className="text-xl font-semibold text-white">Account Information</h3>
                  <p className="text-[#e6915b] text-sm">Let's get you set up with the basics</p>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#e6915b] mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e6915b]" size={20} />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className={`w-full bg-[#2a2a2a] rounded-lg px-4 py-3 pl-11 border transition-all focus:outline-none focus:ring-2 ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-500/20' 
                          : 'border-[#333] focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0]'
                      }`}
                      placeholder="Enter your email"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-[#e6915b] mb-2">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e6915b]" size={20} />
                    <input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => updateFormData('username', e.target.value)}
                      className={`w-full bg-[#2a2a2a] rounded-lg px-4 py-3 pl-11 border transition-all focus:outline-none focus:ring-2 ${
                        errors.username 
                          ? 'border-red-500 focus:ring-red-500/20' 
                          : 'border-[#333] focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0]'
                      }`}
                      placeholder="Choose a username"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-2 text-sm text-red-400">{errors.username}</p>
                  )}
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[#e6915b] mb-2">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all"
                      placeholder="First name"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-[#e6915b] mb-2">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      className="w-full bg-[#2a2a2a] rounded-lg px-4 py-3 border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0] transition-all"
                      placeholder="Last name"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#e6915b] mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e6915b]" size={20} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateFormData('password', e.target.value)}
                      className={`w-full bg-[#2a2a2a] rounded-lg px-4 py-3 pl-11 pr-11 border transition-all focus:outline-none focus:ring-2 ${
                        errors.password 
                          ? 'border-red-500 focus:ring-red-500/20' 
                          : 'border-[#333] focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0]'
                      }`}
                      placeholder="Create a password"
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

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#e6915b] mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e6915b]" size={20} />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                      className={`w-full bg-[#2a2a2a] rounded-lg px-4 py-3 pl-11 pr-11 border transition-all focus:outline-none focus:ring-2 ${
                        errors.confirmPassword 
                          ? 'border-red-500 focus:ring-red-500/20' 
                          : 'border-[#333] focus:ring-[#6b8ab0]/20 focus:border-[#6b8ab0]'
                      }`}
                      placeholder="Confirm your password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#e6915b] hover:text-white transition-colors"
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Next Button */}
                <Button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-gradient-to-r from-[#6b8ab0] to-[#6b8ab0] hover:from-[#5a79a0] hover:to-[#5a79a0] text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center"
                >
                  Continue to Gaming Profile
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </div>
            )}

            {/* Step 2: Gaming Information */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Crown className="mx-auto text-[#e6915b] mb-2" size={32} />
                  <h3 className="text-xl font-semibold text-white">Gaming Profile</h3>
                  <p className="text-[#e6915b] text-sm">Tell us about your gaming preferences</p>
                </div>

                {/* Game Selection */}
                <div>
                  <label className="block text-sm font-medium text-[#e6915b] mb-2">
                    Primary Game
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {GAMES.map((game) => (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => updateFormData('game', game.id)}
                        className={`p-4 rounded-lg border transition-all text-left ${
                          formData.game === game.id
                            ? 'border-[#e6915b] bg-[#e6915b]/10 text-white'
                            : 'border-[#333] bg-[#2a2a2a] text-gray-300 hover:border-[#6b8ab0]'
                        }`}
                        disabled={isSubmitting}
                      >
                        <div className="font-medium">{game.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role Selection */}
                {formData.game && selectedGameRoles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preferred Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedGameRoles.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => updateFormData('role', role)}
                          className={`p-3 rounded-lg border transition-all text-sm ${
                            formData.role === role
                              ? 'border-[#e6915b] bg-[#e6915b]/10 text-white'
                              : 'border-[#333] bg-[#2a2a2a] text-gray-300 hover:border-[#6b8ab0]'
                          }`}
                          disabled={isSubmitting}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 font-medium py-3 px-4 rounded-lg transition-all"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-[#e6915b] to-[#e6915b] hover:from-[#d18251] hover:to-[#d18251] text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>

          {/* Login Link */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2a2a]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1a1a1a] text-[#e6915b]">Already have an account?</span>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/login" 
              className="text-[#6b8ab0] hover:text-[#5a79a0] font-medium transition-colors"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}