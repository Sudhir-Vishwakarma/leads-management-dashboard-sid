import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  // Users,
  BarChart2,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../public/logo.png"; 

interface SidebarProps {
  closeSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <img src={logo} alt="Logo" width={32} height={32} />
          <span className="ml-2 text-xl font-semibold text-gray-900">
            Leads Manager
          </span>
        </div>

        {closeSidebar && (
          <button
            onClick={closeSidebar}
            className="lg:hidden rounded-md text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200`
            }
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>

          {/* <NavLink
            to="/dashboard/leads"
            className={({ isActive }) =>
              `${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200`
            }
          >
            <Users className="mr-3 h-5 w-5" />
            Leads
          </NavLink> */}

          <NavLink
            to="/dashboard/analytics"
            className={({ isActive }) =>
              `${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200`
            }
          >
            <BarChart2 className="mr-3 h-5 w-5" />
            Analytics
          </NavLink>

          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200`
            }
          >
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </NavLink>
        </nav>

        <div className="px-3 py-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 hover:text-red-700 rounded-md hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
