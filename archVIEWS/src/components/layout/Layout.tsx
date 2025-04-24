import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { ErrorBoundary } from 'react-error-boundary';

interface LayoutProps {
  children: ReactNode;
}

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div className="p-8 bg-red-50 rounded-lg">
      <h2 className="text-2xl font-bold text-red-700 mb-4">Algo deu errado</h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <button
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        onClick={resetErrorBoundary}
      >
        Tentar novamente
      </button>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <ErrorBoundary 
          FallbackComponent={ErrorFallback}
          onReset={() => window.location.reload()}
        >
          {children}
        </ErrorBoundary>
      </main>
      <footer className="bg-neutral-gray py-4 text-white">
        <div className="container mx-auto px-4 text-center">
          <p>archView &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 