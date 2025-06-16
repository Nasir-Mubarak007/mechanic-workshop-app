import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from 'react-hot-toast';
import { Plus, CalendarPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Layout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
        
        {/* Floating Action Buttons for Mobile */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3 lg:hidden">
          <Link
            to="/schedule"
            className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors duration-200 z-50"
            aria-label="Schedule Service"
          >
            <CalendarPlus size={20} />
          </Link>
          <Link
            to="/jobs/new"
            className="bg-red-700 text-white rounded-full p-4 shadow-lg hover:bg-red-600 transition-colors duration-200 z-50"
            aria-label="New Job"
          >
            <Plus size={24} />
          </Link>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;