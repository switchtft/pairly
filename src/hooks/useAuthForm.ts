'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// --- Schematy Walidacji (Zod) ---

// Schemat dla formularza logowania
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Schemat dla formularza rejestracji
const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  // Opcjonalne pola
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  game: z.string().optional(),
  role: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // Ścieżka, gdzie pojawi się błąd
});

// Typy wywnioskowane ze schematów
type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Zoptymalizowany hook do obsługi formularzy logowania i rejestracji
 * z użyciem React Hook Form i Zod.
 */
export function useAuthForm() {
  const { login, register, csrfToken } = useAuth(); // Pobranie csrfToken z kontekstu
  const router = useRouter();

  // --- Formularz Logowania ---
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = loginForm.handleSubmit(async (data) => {
    try {
      // Dodanie csrfToken do danych logowania
      await login({ ...data, csrfToken });
      router.push('/dashboard'); // Przekierowanie po sukcesie
    } catch (error: any) {
      loginForm.setError('root.serverError', {
        type: 'manual',
        message: error.message || 'Login failed. Please check your credentials.',
      });
    }
  });

  // --- Formularz Rejestracji ---
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleRegister = registerForm.handleSubmit(async (data) => {
    try {
      // Usunięcie pola `confirmPassword` i dodanie `csrfToken`
      const { confirmPassword, ...apiData } = data;
      await register({ ...apiData, csrfToken });
      router.push('/dashboard'); // Przekierowanie po sukcesie
    } catch (error: any) {
      registerForm.setError('root.serverError', {
        type: 'manual',
        message: error.message || 'Registration failed. Please try again.',
      });
    }
  });

  return {
    // Zwracamy instancje formularzy, które zawierają wszystko: stan, błędy, metody - kamszotlol
    loginForm,
    handleLogin,
    registerForm,
    handleRegister,
  };
}
