import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import EnvironmentSelector from '../ui/EnvironmentSelector';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, isActive }) => {
  return (
    <Link href={href} legacyBehavior>
      <a
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive
            ? 'bg-computing-purple text-white'
            : 'text-white hover:bg-gray-700 hover:text-white'
        }`}
      >
        {children}
      </a>
    </Link>
  );
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActivePath = (path: string) => {
    return router.pathname === path;
  };

  return (
    <nav className="bg-neutral-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" legacyBehavior>
                <a className="text-white font-bold text-xl">archView</a>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink href="/" isActive={isActivePath('/')}>
                  Visualização
                </NavLink>
                <NavLink href="/admin" isActive={isActivePath('/admin')}>
                  Administração
                </NavLink>
                <NavLink href="/reports" isActive={isActivePath('/reports')}>
                  Relatórios
                </NavLink>
                <NavLink href="/roadmap" isActive={isActivePath('/roadmap')}>
                  Roadmap
                </NavLink>
                <NavLink href="/adr" isActive={isActivePath('/adr')}>
                  Decisões (ADR)
                </NavLink>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <EnvironmentSelector />
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menu principal</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" legacyBehavior>
              <a
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/')
                    ? 'bg-computing-purple text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Visualização
              </a>
            </Link>
            <Link href="/admin" legacyBehavior>
              <a
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/admin')
                    ? 'bg-computing-purple text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Administração
              </a>
            </Link>
            <Link href="/reports" legacyBehavior>
              <a
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/reports')
                    ? 'bg-computing-purple text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Relatórios
              </a>
            </Link>
            <Link href="/roadmap" legacyBehavior>
              <a
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/roadmap')
                    ? 'bg-computing-purple text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Roadmap
              </a>
            </Link>
            <Link href="/adr" legacyBehavior>
              <a
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/adr')
                    ? 'bg-computing-purple text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Decisões (ADR)
              </a>
            </Link>
            <div className="pt-4">
              <EnvironmentSelector />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 