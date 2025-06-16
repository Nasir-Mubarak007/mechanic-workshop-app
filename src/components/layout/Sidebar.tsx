import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Wrench, 
  FileText, 
  BarChart3, 
  Settings,
  Package,
  Calendar,
  CalendarPlus
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  return (
    <aside className="hidden lg:flex w-64 flex-col h-full bg-red-900 text-white">
      <div className="p-5 border-b border-red-800">
        <div className="flex items-center space-x-3">
          <Wrench size={28} className="text-orange-400" />
          <span className="font-bold text-xl">MechShop Pro</span>
        </div>
      </div>
      <nav className="flex-1 pt-5 pb-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-200
                ${isActive 
                  ? 'bg-red-800 text-white' 
                  : 'text-red-100 hover:bg-red-800 hover:text-white'}`
              }
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
              >
                <Settings size={20} className="mr-3" />
                Settings
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
      <div className="p-4 text-xs text-red-200 border-t border-red-800">
        MechShop Pro v1.0.0
      </div>
    </aside>
  );
};

export default Sidebar;