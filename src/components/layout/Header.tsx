import React from "react";
// import { Menu, Search, Bell } from "lucide-react";
import { Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const userInitial = currentUser?.displayName
    ? currentUser.displayName[0].toUpperCase()
    : "U";
  const userName = currentUser?.displayName || "User";
  const phoneNumber = currentUser?.phoneNumber || "";

  // Get current page title from URL
  const getPageInfo = () => {
    const path = location.pathname.split("/").pop();
    switch (path) {
      case "dashboard":
        return {
          title: "Dashboard",
          subtitle: "Welcome to your leads management dashboard",
        };
      case "analytics":
        return {
          title: "Analytics",
          subtitle: "Key insights from your lead data",
        };
      case "settings":
        return {
          title: "Settings",
          subtitle: "Manage your account settings and preferences",
        };
      default:
        return {
          title: "Dashboard",
          subtitle: "Welcome to your leads management dashboard",
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <header className="flex-shrink-0 h-auto py-2 bg-white shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4">
        {/* Left: Sidebar Toggle (Mobile Only) */}
        <div className="flex items-center lg:hidden mb-2 sm:mb-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Middle: Page Title and Subtitle */}
        <div className="mb-2 sm:mb-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {pageInfo.title}
          </h1>
          <p className="text-sm text-gray-600">{pageInfo.subtitle}</p>
        </div>

        {/* Right: Notifications and User Info */}
        <div className="flex items-center space-x-4">
          {/* <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
          </button> */}

          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 flex items-center justify-center rounded-full text-white font-medium">
              {userInitial}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-700">{userName}</p>
              <p className="text-xs text-gray-500">{phoneNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
