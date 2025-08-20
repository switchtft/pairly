import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface FormErrors {
  [key: string]: string;
}

interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  game?: string;
  role?: string;
}

export function useAuthForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();

  // Memoized validation functions for better performance
  const validateEmail = useCallback((email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email';
    return null;
  }, []);

  const validatePassword = useCallback((password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  }, []);

  const validateUsername = useCallback((username: string): string | null => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    return null;
  }, []);

  const handleLogin = useCallback(async (email: string, password: string): Promise<void> => {
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate inputs
      const emailError = validateEmail(email);
      const passwordError = validatePassword(password);

      if (emailError || passwordError) {
        setErrors({
          ...(emailError && { email: emailError }),
          ...(passwordError && { password: passwordError }),
        });
        return;
      }

      // Call login with proper error handling
      await login({ email, password });
      
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors({ 
        general: error?.message || 'Login failed. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [login, validateEmail, validatePassword]);

  const handleRegister = useCallback(async (userData: RegisterFormData): Promise<void> => {
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate all inputs
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
        return;
      }

      // Remove confirmPassword from data sent to API
      const { confirmPassword: _, ...registerData } = userData;
      await register(registerData);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrors({ 
        general: error?.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [register, validateEmail, validateUsername, validatePassword]);

  // Clear errors function
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Clear specific error
  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    isSubmitting,
    handleLogin,
    handleRegister,
    setErrors,
    clearErrors,
    clearError,
    // Export validation functions for real-time validation
    validateEmail,
    validatePassword,
    validateUsername,
  };
}