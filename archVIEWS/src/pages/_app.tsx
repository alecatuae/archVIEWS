import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Carrega o ambiente do localStorage ao iniciar, se existir
    if (typeof window !== 'undefined' && router.isReady && !router.query.env) {
      const storedEnvironment = localStorage.getItem('selectedEnvironment');
      
      if (storedEnvironment && storedEnvironment !== 'all') {
        router.push({
          pathname: router.pathname,
          query: { ...router.query, env: storedEnvironment }
        }, undefined, { shallow: true });
      }
    }
  }, [router.isReady]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Component {...pageProps} />
    </ThemeProvider>
  );
} 