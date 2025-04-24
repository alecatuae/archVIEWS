import React from 'react';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';

export default function Roadmap() {
  return (
    <>
      <Head>
        <title>archView - Roadmap</title>
        <meta name="description" content="Roadmap e ciclo de vida dos componentes" />
      </Head>
      
      <Layout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-gray">Roadmap & Lifecycle</h1>
          <p className="text-neutral-gray">Visualize o ciclo de vida e planejamento dos componentes</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow">
          <p className="text-lg text-center text-neutral-gray mb-4">
            Funcionalidade em desenvolvimento
          </p>
          <p className="text-center text-neutral-gray">
            Esta funcionalidade estará disponível em breve. Aguarde novas atualizações.
          </p>
        </div>
      </Layout>
    </>
  );
} 