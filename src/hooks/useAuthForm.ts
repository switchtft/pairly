import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface FormErrors {
  [key: string]: string;
}

export function useAuthForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const validateUsername = (username: string): string | null => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    return null;
  };

  const handleLogin = async (email: string, password: string) => {
    setIsSubmitting(true);
    setErrors({});

    // Validate inputs
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({
        ...(emailError && { email: emailError }),
        ...(passwordError && { password: passwordError }),
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Login failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (userData: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
    game?: string;
    role?: string;
  }) => {
    setIsSubmitting(true);
    setErrors({});

    // Validate inputs
    const emailError = validateEmail(userData.email);
    const usernameError = validateUsername(userData.username);
    const passwordError = validatePassword(userData.password);
    
    let confirmPasswordError = null;
    if (userData.password !== userData.confirmPassword) {
      confirmPasswordError = 'Passwords do not match';
    }

    if (emailError || usernameError || passwordError || confirmPasswordError) {
      setErrors({
        ...(emailError && { email: emailError }),
        ...(usernameError && { username: usernameError }),
        ...(passwordError && { password: passwordError }),
        ...(confirmPasswordError && { confirmPassword: confirmPasswordError }),
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = userData;
      await register(registerData);
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Registration failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    errors,
    isSubmitting,
    handleLogin,
    handleRegister,
    setErrors,
  };
} 