import React from 'react';
import Layout from '@/components/layout/Layout';

const ReportsPage: React.FC = () => {
  return (
    <Layout title="Reports">
      <div className="flex justify-center items-center h-full">
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl font-bold text-dependency-orange mb-4">Relatórios</h1>
          <p className="text-xl text-neutral-gray mb-6">Geração de relatórios de arquitetura</p>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-neutral-gray mb-4">Este módulo está em desenvolvimento.</p>
            <p className="text-neutral-gray">Aqui serão gerados relatórios detalhados sobre a arquitetura, dependências, riscos e oportunidades de melhoria.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage; 