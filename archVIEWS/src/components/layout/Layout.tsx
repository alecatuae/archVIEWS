import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  HomeIcon, 
  CubeTransparentIcon, 
  ScaleIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  Cog6ToothIcon, 
  ClipboardDocumentListIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'ArchVIEWS' }) => {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [environment, setEnvironment] = useState('Ambiente');
  
  // Detectar preferência de tema do sistema
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true' || 
                 window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
  }, []);

  // Alternar modo escuro/claro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  // Verificar se o caminho atual está ativo
  const isActive = (path: string) => {
    return router.pathname.startsWith(path);
  };

  // Links do menu
  const menuLinks = [
    { 
      href: '/', 
      label: 'Home', 
      icon: <HomeIcon className="w-5 h-5" />,
      active: isActive('/')
    },
    { 
      href: '/arch-visualization', 
      label: 'Arch Visualization', 
      icon: <CubeTransparentIcon className="w-5 h-5" />,
      active: isActive('/arch-visualization')
    },
    { 
      href: '/arch-decision', 
      label: 'Arch Decision', 
      icon: <ScaleIcon className="w-5 h-5" />,
      active: isActive('/arch-decision')
    },
    { 
      href: '/dashboards', 
      label: 'Dashboards', 
      icon: <ChartBarIcon className="w-5 h-5" />,
      active: isActive('/dashboards')
    },
    { 
      href: '/reports', 
      label: 'Reports', 
      icon: <DocumentTextIcon className="w-5 h-5" />,
      active: isActive('/reports')
    }
  ];

  // Links do menu administrativo
  const adminLinks = [
    { 
      href: '/administration', 
      label: 'Administration', 
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      active: isActive('/administration')
    },
    { 
      href: '/logs', 
      label: 'Logs', 
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
      active: isActive('/logs')
    }
  ];

  // Links rápidos do rodapé
  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/explorer', label: 'Explorador' },
    { href: '/docs', label: 'Documentação' }
  ];

  // Links de suporte do rodapé
  const supportLinks = [
    { href: '/docs', label: 'Documentação' },
    { href: 'https://github.com/archview', label: 'GitHub' }
  ];

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'dark' : ''}`}>
      <Head>
        <title>{title} | ArchVIEWS</title>
        <meta name="description" content="Plataforma de apoio à Arquitetura e Engenharia" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-1 overflow-hidden">
        {/* Barra lateral / Menu */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <div className="bg-neutral-gray text-white text-center py-2 px-4 rounded font-bold">
              Logo
            </div>
          </div>

          {/* Menu principal */}
          <nav className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-1">
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className={`flex items-center px-4 py-3 rounded-md ${
                      link.active
                        ? 'bg-computing-purple/10 text-computing-purple border-l-4 border-computing-purple'
                        : 'text-neutral-gray hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{link.icon}</span>
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Separador */}
            <div className="my-4 border-t border-gray-200"></div>

            {/* Menu administrativo */}
            <ul className="space-y-1">
              {adminLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className={`flex items-center px-4 py-3 rounded-md ${
                      link.active
                        ? 'bg-computing-purple/10 text-computing-purple border-l-4 border-computing-purple'
                        : 'text-neutral-gray hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{link.icon}</span>
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-2 text-xs text-neutral-gray/60 border-t border-gray-200">
            <div className="text-center">Active Selection / Focus Indicator</div>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Cabeçalho */}
          <header className="bg-white border-b border-gray-200 py-2 px-4 flex justify-between items-center">
            <div className="flex-1"></div>
            
            {/* Ambientes e Configurações */}
            <div className="flex items-center space-x-2">
              <select 
                className="border border-gray-300 rounded-md py-1 px-3 text-sm"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
              >
                <option value="Ambiente">Ambiente</option>
                <option value="Produção">Produção</option>
                <option value="Homologação">Homologação</option>
                <option value="Desenvolvimento">Desenvolvimento</option>
              </select>
              
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                title="Configurações"
              >
                <Cog6ToothIcon className="w-6 h-6 text-neutral-gray" />
              </button>
              
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                title={darkMode ? "Modo Claro" : "Modo Escuro"}
                onClick={toggleDarkMode}
              >
                {darkMode ? (
                  <SunIcon className="w-6 h-6 text-neutral-gray" />
                ) : (
                  <MoonIcon className="w-6 h-6 text-neutral-gray" />
                )}
              </button>
              
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6 text-neutral-gray" />
              </button>
            </div>
          </header>

          {/* Área de conteúdo com rolagem */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            {children}
          </div>
          
          {/* Rodapé */}
          <footer className="bg-white border-t border-gray-200 py-4 px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-neutral-gray text-white text-center py-1 px-2 rounded text-sm font-bold mr-3">
                  Logo
                </div>
                <div className="text-sm text-gray-600">
                  <p>Plataforma de apoio à Arquitetura e Engenharia</p>
                  <p>© 2025 ArchView Todos os direitos reservados</p>
                  <p className="text-xs">Desenvolvido por Alexandre Nascimento | alecatuae@gmail.com</p>
                </div>
              </div>
              
              <div className="flex space-x-8">
                <div>
                  <h3 className="font-medium text-sm text-neutral-gray mb-2">LINKS RÁPIDOS</h3>
                  <ul className="space-y-1">
                    {quickLinks.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="text-sm text-gray-600 hover:text-computing-purple">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-neutral-gray mb-2">SUPORTE</h3>
                  <ul className="space-y-1">
                    {supportLinks.map((link) => (
                      <li key={link.href}>
                        <Link 
                          href={link.href} 
                          className="text-sm text-gray-600 hover:text-computing-purple"
                          target={link.href.startsWith('http') ? '_blank' : undefined}
                          rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout; 