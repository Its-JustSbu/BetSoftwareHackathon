import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Menu, Bell, Search, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { NavLink } from "react-router-dom";
import Alert, { alertProps } from "../alert";

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, title }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<alertProps[]>([
    {
      id: "1",
      status: "info",
      title: "Welcome to the Dashboard!",
      message: "You can manage your wallets and piggy banks here.",
      onClose: (id: string) => {
        
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      },
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-gray-200 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              ref={notificationsRef}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              {notifications && <Bell className="w-5 h-5 text-gray-600" />}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger-500 rounded-full"></span>
            </motion.button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-4">
                  <p className="font-semibold text-gray-800 mb-2">
                    Notifications
                  </p>
                  <ul className="space-y-2">
                    {!notifications && (
                      <li className="text-sm text-gray-600">
                        No new notifications.
                      </li>
                    )}
                    {notifications.map((notification, index) => (
                      <li key={index}>
                        {
                          <Alert
                            id={notification.id}
                            message={notification.message}
                            status={notification.status}
                            title={notification.title}
                            onClose={notification.onClose}
                          />
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <NavLink to="/settings">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors"
              >
                <User className="w-5 h-5 text-primary-600" />
              </motion.button>
            </NavLink>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
