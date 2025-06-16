import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, Calendar, CalendarPlus, FileText, LayoutDashboard, LogOut, Menu, Package, Settings, Wrench, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdmin } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;

    
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/services') return 'Services Management';
    if (path === '/jobs') return 'Job Logs';
    if (path === '/schedule') return 'Schedule Service';
    if (path === '/calendar') return 'Service Calendar';
    if (path === '/inventory') return 'Inventory Management';
    if (path === '/reports') return 'Reports & Summaries';
    if (path === '/settings') return 'Settings';
    
    return 'Workshop Management';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <div className={`sm:flex ${mobileMenuOpen ? 'block' : 'hidden'} sm:block w-[45%] lg:hidden fixed top-0 left-0 h-full bg-red-900 shadow-lg z-20  transition-transform duration-300 ease-in-out pt-7 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button 
          className="lg:hidden p-2 text-red-200  hover:text-white focus:outline-none absolute top-4 right-4"
          onClick={toggleMobileMenu}
        >
          <X size={24} />
        </button>
        {/* Mobile Menu Content */}
        <nav className="p-4 pt-9 pb-4 h-screen">
          <ul className="space-y-2">
            <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-200
                ${isActive 
                  ? 'bg-red-800 text-white' 
                  : 'text-red-100 hover:bg-red-800 hover:text-white'}`
              }
              onClick={toggleMobileMenu}
            >
              <LayoutDashboard size={20} className="mr-3" />
              Dashboard
            </NavLink>
          </li>
          
          {isAdmin && (
            <li>
              <NavLink 
                to="/services" 
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-200
                  ${isActive 
                    ? 'bg-red-800 text-white' 
                    : 'text-red-100 hover:bg-red-800 hover:text-white'}`
                }
                 onClick={toggleMobileMenu}
              >
                <Wrench size={20} className="mr-3" />
                Services
              </NavLink>
            </li>
          )}
          
          <li>
            <NavLink 
              to="/jobs" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-200
                ${isActive 
                  ? 'bg-red-800 text-white' 
                  : 'text-red-100 hover:bg-red-800 hover:text-white'}`
              }
              onClick={toggleMobileMenu}
            >
              <FileText size={20} className="mr-3" />
              Job Logs
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/schedule" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-200
                ${isActive 
                  ? 'bg-red-800 text-white' 
                  : 'text-red-100 hover:bg-red-800 hover:text-white'}`
              }
               onClick={toggleMobileMenu}
            >
              <CalendarPlus size={20} className="mr-3" />
              Schedule Service
            </NavLink>
          </li>
          
          <li>
            <NavLink 
              to="/calendar" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-200
                ${isActive 
                  ? 'bg-red-800 text-white' 
                  : 'text-red-100 hover:bg-red-800 hover:text-white'}`
              }
               onClick={toggleMobileMenu}
            >
              <Calendar size={20} className="mr-3" />
              Service Calendar
            </NavLink>
          </li>
          
          {isAdmin && (
            <li>
              <NavLink 
                to="/inventory" 
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-200
                  ${isActive 
                    ? 'bg-red-800 text-white' 
                    : 'text-red-100 hover:bg-red-800 hover:text-white'}`
                }
                 onClick={toggleMobileMenu}
              >
                <Package size={20} className="mr-3" />
                Inventory
              </NavLink>
            </li>
          )}
          
          {isAdmin && (
            <li>
              <NavLink 
                to="/reports" 
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-200
                  ${isActive 
                    ? 'bg-red-800 text-white' 
                    : 'text-red-100 hover:bg-red-800 hover:text-white'}`
                }
                 onClick={toggleMobileMenu}
              >
                <BarChart3 size={20} className="mr-3" />
                Reports
              </NavLink>
            </li>
          )}
          
          {isAdmin && (
            <li>
              <NavLink 
                to="/settings" 
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-200
                  ${isActive 
                    ? 'bg-red-800 text-white' 
                    : 'text-red-100 hover:bg-red-800 hover:text-white'}`
                }
                onClick={toggleMobileMenu}
              >
                <Settings size={20} className="mr-3" />
                Settings
              </NavLink>
            </li>
          )}
          </ul>
        </nav>
      </div>

    <header className="bg-red-900 shadow-sm z-10 relative">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="lg:hidden mr-2 text-red-100 hover:text-white focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>
        </div>
        
        <div className="flex items-center">
          <div className="mr-4 text-right">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-red-200 capitalize">{user?.role}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 rounded-full bg-red-800 hover:bg-red-700 text-red-100 hover:text-white transition-colors duration-200"
            aria-label="Log out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;