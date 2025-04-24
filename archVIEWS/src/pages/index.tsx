import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página de visualização de grafo após um breve atraso
    const timer = setTimeout(() => {
      router.push('/arch-visualization');
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Layout title="Home">
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-computing-purple mb-4">Bem-vindo ao ArchVIEWS</h1>
          <p className="text-xl text-neutral-gray mb-6">Plataforma de apoio à Arquitetura e Engenharia</p>
          <div className="animate-pulse text-neutral-gray">Redirecionando para visualização de arquitetura...</div>
        </div>
      </div>
    </Layout>
  );
} 