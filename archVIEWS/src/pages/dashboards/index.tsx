import React from 'react';
import Layout from '@/components/layout/Layout';

const DashboardsPage: React.FC = () => {
  return (
    <Layout title="Dashboards">
      <div className="flex justify-center items-center h-full">
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl font-bold text-storage-blue mb-4">Dashboards</h1>
          <p className="text-xl text-neutral-gray mb-6">Visualização de métricas e indicadores de arquitetura</p>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-neutral-gray mb-4">Este módulo está em desenvolvimento.</p>
            <p className="text-neutral-gray">Aqui serão apresentados painéis e dashboards com métricas e indicadores importantes para monitoramento de arquitetura.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardsPage; 