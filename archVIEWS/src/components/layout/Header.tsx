import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Cog6ToothIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';

const Header: React.FC = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [environment, setEnvironment] = useState('Ambiente');

  const isActive = (path: string) => {
    return router.pathname === path ? 'bg-computing-purple/10 text-computing-purple' : 'hover:bg-gray-100';
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const environments = ['Production', 'Staging', 'Development', 'Test'];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full px-4 mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Logo e menu à esquerda */}
          <div className="flex items-center">
            <div className="mr-4 flex items-center">
              <Link href="/">
                <div className="flex items-center">
                  <div className="h-8 w-16 bg-neutral-gray flex items-center justify-center text-white text-xs rounded">
                    Logo
                  </div>
                  <span className="text-computing-purple text-lg font-medium ml-2">Logo</span>
                </div>
              </Link>
            </div>

            {/* Menu de navegação principal */}
            <nav className="flex space-x-1">
              <Link href="/">
                <div className={`px-3 py-2 rounded text-neutral-gray ${isActive('/')}`}>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span>Home</span>
                  </div>
                </div>
              </Link>
              <Link href="/graph">
                <div className={`px-3 py-2 rounded text-neutral-gray ${isActive('/graph')}`}>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <span>Arch Visualization</span>
                  </div>
                </div>
              </Link>
              <Link href="/decision">
                <div className={`px-3 py-2 rounded text-neutral-gray ${isActive('/decision')}`}>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Arch Decision</span>
                  </div>
                </div>
              </Link>
              <Link href="/dashboards">
                <div className={`px-3 py-2 rounded text-neutral-gray ${isActive('/dashboards')}`}>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                    <span>Dashboards</span>
                  </div>
                </div>
              </Link>
              <Link href="/reports">
                <div className={`px-3 py-2 rounded text-neutral-gray ${isActive('/reports')}`}>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <span>Reports</span>
                  </div>
                </div>
              </Link>
            </nav>
            
            <div className="text-xs text-red-400 ml-2">
              <span>Expandable<br/>menu groups<br/>for scalability</span>
            </div>
          </div>

          {/* Controles à direita */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="bg-white border border-gray-300 text-neutral-gray rounded py-1 px-2 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-computing-purple"
              >
                <option value="Ambiente">Ambiente</option>
                {environments.map((env) => (
                  <option key={env} value={env}>{env}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <Link href="/settings">
              <div className="text-neutral-gray hover:text-computing-purple">
                <Cog6ToothIcon className="h-6 w-6" />
              </div>
            </Link>

            <button onClick={toggleTheme} className="text-neutral-gray hover:text-computing-purple">
              {theme === 'dark' ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>

            <Link href="/logout" className="text-red-400 text-sm">Logout</Link>
            
            <div className="text-xs text-red-400 text-right">
              <span>User Config<br/>Dark or Light<br/>Mode</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 