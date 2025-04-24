import React from 'react';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';

export default function ADR() {
  return (
    <>
      <Head>
        <title>archView - Decisões Arquiteturais</title>
        <meta name="description" content="Registro de decisões arquiteturais (ADR)" />
      </Head>
      
      <Layout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-gray">Decisões Arquiteturais (ADR)</h1>
          <p className="text-neutral-gray">Registro e documentação de decisões de arquitetura</p>
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