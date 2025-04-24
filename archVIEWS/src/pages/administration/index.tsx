import React from 'react';
import Layout from '@/components/layout/Layout';

const AdministrationPage: React.FC = () => {
  return (
    <Layout title="Administration">
      <div className="flex justify-center items-center h-full">
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl font-bold text-neutral-gray mb-4">Administração</h1>
          <p className="text-xl text-gray-600 mb-6">Configurações e gerenciamento de sistema</p>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-neutral-gray mb-4">Este módulo está em desenvolvimento.</p>
            <p className="text-neutral-gray">Aqui serão gerenciadas as configurações do sistema, usuários, permissões e integrações.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdministrationPage; 