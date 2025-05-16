import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Define navigation items
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/cycles', label: 'Cycles' },
    { path: '/medications', label: 'Medications' },
    { path: '/chat', label: 'Chat' },
    { path: '/community', label: 'Community' },
    { path: '/partner', label: 'Partner' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-purple-600">
                  FertilityNest
                </Link>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${
                      location.pathname === item.path
                        ? 'border-purple-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <Link
                    to="/profile"
                    className={`${
                      location.pathname === '/profile'
                        ? 'bg-gray-100'
                        : 'hover:bg-gray-50'
                    } p-2 rounded-full text-gray-600 focus:outline-none`}
                  >
                    <span className="sr-only">View profile</span>
                    <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-600 font-semibold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  </Link>
                  <Link
                    to="/settings"
                    className={`${
                      location.pathname === '/settings'
                        ? 'bg-gray-100'
                        : 'hover:bg-gray-50'
                    } ml-3 p-2 rounded-full text-gray-600 focus:outline-none`}
                  >
                    <span className="sr-only">Settings</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className="sm:hidden bg-white border-t border-gray-200 fixed bottom-0 w-full z-10">
        <div className="grid grid-cols-6 h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${
                location.pathname === item.path
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              } flex flex-col items-center justify-center text-xs font-medium`}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-grow py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} FertilityNest. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
