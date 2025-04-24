import React from 'react';
import Layout from '@/components/layout/Layout';

const ArchDecisionPage: React.FC = () => {
  return (
    <Layout title="Arch Decision">
      <div className="flex justify-center items-center h-full">
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl font-bold text-computing-purple mb-4">Decisões de Arquitetura</h1>
          <p className="text-xl text-neutral-gray mb-6">Registro e análise de decisões arquiteturais</p>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-neutral-gray mb-4">Este módulo está em desenvolvimento.</p>
            <p className="text-neutral-gray">Aqui serão registradas as decisões de arquitetura, suas justificativas, alternativas consideradas e impactos.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ArchDecisionPage; 