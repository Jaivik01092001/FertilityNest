import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';
import GeminiApiSettings from './GeminiApiSettings';

const Settings = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Settings Menu
              </h2>
              <nav className="space-y-2">
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 rounded-md hover:bg-purple-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Profile Settings
                </Link>
                <Link 
                  to="/change-password" 
                  className="block px-4 py-2 rounded-md hover:bg-purple-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Change Password
                </Link>
                <Link 
                  to="/emergency-contacts" 
                  className="block px-4 py-2 rounded-md hover:bg-purple-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Emergency Contacts
                </Link>
                <Link 
                  to="/settings" 
                  className="block px-4 py-2 rounded-md bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-400 font-medium"
                >
                  AI Settings
                </Link>
                <Link 
                  to="/partner/connect" 
                  className="block px-4 py-2 rounded-md hover:bg-purple-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Partner Connection
                </Link>
              </nav>
            </div>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-2">
            <GeminiApiSettings />
            
            {/* Additional settings sections can be added here */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
