'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Upewnij się, że ścieżka jest poprawna

interface ProtectedPageProps {
  children: React.ReactNode;
}

/**
 * Komponent wyższego rzędu (HOC), który chroni stronę przed dostępem
 * przez niezalogowanych użytkowników.
 */
const ProtectedPage = ({ children }: ProtectedPageProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Przekieruj, jeśli ładowanie się zakończyło, a użytkownik nie jest zalogowany.
    if (!isLoading && !isAuthenticated) {
      // W pełnej aplikacji Next.js użyłbyś:
      // import { useRouter } from 'next/navigation';
      // const router = useRouter();
      // router.push('/login');
      // Dla uproszczenia używamy bezpośredniego przekierowania:
      window.location.href = '/login';
    }
  }, [isAuthenticated, isLoading]);

  // Podczas sprawdzania statusu logowania, wyświetlaj wskaźnik ładowania.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl">Loading session...</p>
      </div>
    );
  }

  // Jeśli użytkownik jest zalogowany, wyświetl zawartość strony.
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Jeśli użytkownik nie jest zalogowany (i przekierowanie jest w toku),
  // nie renderuj nic, aby uniknąć "mignięcia" chronionej treści.
  return null;
};

export default ProtectedPage;
