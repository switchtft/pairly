'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DimmedLoader from '@/components/DimmedLoader';
import { useRouter } from 'next/navigation';

interface ProtectedPageProps {
  children: React.ReactNode;
}

const ProtectedPage = ({ children }: ProtectedPageProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // --- EFEKT 1: Zarządzanie wizualizacją (pasek postępu i pojawienie się treści) ---
  useEffect(() => {
    let progressTimer: NodeJS.Timeout | undefined;
    let contentTimer: NodeJS.Timeout | undefined;

    // Kiedy trwa ładowanie statusu autentykacji...
    if (isLoading) {
      setShowContent(false); // Zresetuj na wypadek nawigacji wstecz
      // Symuluj postęp paska ładowania
      progressTimer = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 10, 90));
      }, 200);
    }
    // Kiedy ładowanie się zakończy...
    else {
      clearInterval(progressTimer);
      // I jeśli użytkownik JEST zalogowany...
      if (isAuthenticated) {
        setProgress(100);
        // Pokaż treść z małym opóźnieniem dla płynnego przejścia
        contentTimer = setTimeout(() => {
          setShowContent(true);
        }, 1000); // 0.5 sekundy opóźnienia
      }
      // Jeśli nie jest zalogowany, nic tu nie robimy - tym zajmie się drugi efekt
    }

    // Funkcja czyszcząca, która uruchamia się przy zmianie zależności lub odmontowaniu komponentu
    return () => {
      clearInterval(progressTimer);
      clearTimeout(contentTimer);
    };
  }, [isLoading, isAuthenticated]); // Uruchom ten efekt tylko gdy zmieni się status ładowania lub autentykacji


  // --- EFEKT 2: Zarządzanie bezpieczeństwem (przekierowanie) ---
  // Ten efekt jest oddzielony, aby jego logika była czysta i niezależna od animacji.
  useEffect(() => {
    // Przekieruj TYLKO I WYŁĄCZNIE, gdy mamy pewność, że ładowanie się zakończyło
    // i użytkownik definitywnie NIE jest zalogowany.
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);


  // --- LOGIKA RENDEROWANIA ---
  // Pokaż treść tylko wtedy, gdy jesteśmy pewni, że użytkownik jest zalogowany
  // ORAZ gdy zakończyła się animacja wejścia (`showContent` jest true).
  if (isAuthenticated && showContent) {
    return <>{children}</>;
  }

  // W każdym innym przypadku (ładowanie, oczekiwanie na animację, lub chwila przed przekierowaniem)
  // pokazuj loader z aktualnym postępem.
  return (
    <DimmedLoader
      progress={progress}
      user={user}
    />
  );
};

export default ProtectedPage;