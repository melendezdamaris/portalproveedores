import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, markNotificationAsRead } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const userNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleName = (role: string) => {
    const roles = {
      proveedor: 'Proveedor',
      operaciones: 'Operaciones',
      aprobador: 'Aprobador'
    };
    return roles[role as keyof typeof roles] || role;
  };

  const handleNotificationClick = (notification: any) => {
    markNotificationAsRead(notification.id);
    setShowNotifications(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-neo-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-neo-primary rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-pt-serif font-bold text-lg">N</span>
              </div>
              <div>
                <h1 className="text-xl font-pt-serif font-bold text-neo-primary">
                  NEO Consulting
                </h1>
                <p className="text-xs text-neo-gray-600 font-montserrat">
                  Portal de Proveedores
                </p>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                size="small"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-neo-gray-200 z-50">
                  <div className="p-4 border-b border-neo-gray-200">
                    <h3 className="font-montserrat font-semibold text-neo-primary">
                      Notificaciones
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {userNotifications.length === 0 ? (
                      <div className="p-4 text-center text-neo-gray-500 font-montserrat">
                        No hay notificaciones
                      </div>
                    ) : (
                      userNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-neo-gray-100 cursor-pointer hover:bg-neo-gray-50 ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <h4 className="font-montserrat font-medium text-sm text-neo-primary">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-neo-gray-600 mt-1 font-montserrat">
                            {notification.message}
                          </p>
                          <p className="text-xs text-neo-gray-400 mt-1 font-montserrat">
                            {notification.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="small"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2"
              >
                <div className="w-8 h-8 bg-neo-accent rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-montserrat font-medium text-neo-primary">
                    {user?.name}
                  </p>
                  <p className="text-xs text-neo-gray-600 font-montserrat">
                    {getRoleName(user?.role || '')}
                  </p>
                </div>
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neo-gray-200 z-50">
                  <div className="p-4 border-b border-neo-gray-200">
                    <p className="text-sm font-montserrat font-medium text-neo-primary">
                      {user?.name}
                    </p>
                    <p className="text-xs text-neo-gray-600 font-montserrat">
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm font-montserrat text-neo-gray-700 hover:bg-neo-gray-50 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Configuración</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm font-montserrat text-neo-gray-700 hover:bg-neo-gray-50 flex items-center space-x-2">
                      <HelpCircle className="w-4 h-4" />
                      <span>Ayuda</span>
                    </button>
                    <hr className="my-2 border-neo-gray-200" />
                    <button 
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-sm font-montserrat text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};