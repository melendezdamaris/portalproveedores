import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  CreditCard, 
  FolderOpen, 
  MessageSquare, 
  Star,
  Building2,
  CheckSquare,
  DollarSign,
  Settings,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onCollapseChange }) => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'documents', label: 'Centro de Documentación', icon: FolderOpen },
      { id: 'announcements', label: 'Comunicados', icon: MessageSquare }
    ];

    switch (user?.role) {
      case 'proveedor':
        return [
          ...commonItems.slice(0, 1), // Dashboard
          { id: 'supplier-registration', label: 'Registro del Proveedor', icon: UserCheck },
          { id: 'documents-upload', label: 'Registrar Comprobantes', icon: FileText },
          { id: 'payments', label: 'Estado de Pagos', icon: CreditCard },
          ...commonItems.slice(1), // Centro de Documentación y Comunicados
          { id: 'feedback', label: 'Encuesta de Feedback', icon: Star },
          { id: 'configuration', label: 'Configuración', icon: Settings }
        ];
      
      case 'operaciones':
        return [
          ...commonItems.slice(0, 1), // Dashboard
          { id: 'suppliers', label: 'Gestión de Proveedores', icon: Users },
          { id: 'all-documents', label: 'Todos los Comprobantes', icon: FileText },
          { id: 'payments-admin', label: 'Administrar Pagos', icon: DollarSign },
          ...commonItems.slice(1), // Centro de Documentación y Comunicados
          { id: 'feedback-admin', label: 'Ver Encuestas', icon: Star }
        ];
      
      case 'aprobador':
        return [
          ...commonItems.slice(0, 1), // Dashboard
          { id: 'approve-documents', label: 'Aprobar Comprobantes', icon: CheckSquare },
          ...commonItems.slice(1), // Centro de Documentación y Comunicados
          { id: 'feedback-admin', label: 'Ver Encuestas', icon: Star }
        ];
      
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    // Only collapse on mobile/tablet screens
    if (window.innerWidth < 1024) {
      setIsCollapsed(true);
      onCollapseChange?.(true);
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (isCollapsed) {
      setIsCollapsed(false);
      onCollapseChange?.(false);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Only auto-collapse if we were previously collapsed and not hovering
    if (isCollapsed && window.innerWidth >= 1024) {
      setTimeout(() => {
        if (!isHovering) {
          setIsCollapsed(true);
          onCollapseChange?.(true);
        }
      }, 300);
    }
  };

  // Determine if sidebar should be expanded
  const shouldExpand = !isCollapsed || isHovering;

  return (
    <aside 
      className={`bg-white shadow-lg border-r border-neo-gray-200 h-screen sticky top-16 overflow-y-auto transition-all duration-300 ease-in-out ${
        shouldExpand ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo Area - Always visible and triggers expansion */}
      <div className="p-4 border-b border-neo-gray-200 cursor-pointer hover:bg-neo-gray-50 transition-colors duration-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-neo-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-pt-serif font-bold text-lg">N</span>
          </div>
          <div className={`ml-3 transition-all duration-300 overflow-hidden ${
            shouldExpand ? 'opacity-100 w-auto' : 'opacity-0 w-0'
          }`}>
            <h1 className="text-sm font-pt-serif font-bold text-neo-primary whitespace-nowrap">
              NEO Consulting
            </h1>
            <p className="text-xs text-neo-gray-600 font-montserrat whitespace-nowrap">
              Portal de Proveedores
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-neo-accent text-white shadow-md transform scale-105'
                      : 'text-neo-gray-700 hover:bg-neo-gray-50 hover:text-neo-primary hover:shadow-sm'
                  }`}
                  title={!shouldExpand ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-neo-gray-500 group-hover:text-neo-primary'
                  }`} />
                  <span className={`font-montserrat font-medium text-sm ml-3 transition-all duration-300 overflow-hidden whitespace-nowrap ${
                    shouldExpand ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Tooltip for collapsed state */}
                  {!shouldExpand && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-neo-primary text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-neo-primary rotate-45"></div>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse/Expand Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
          shouldExpand ? 'bg-neo-gray-300' : 'bg-neo-accent shadow-md'
        }`} />
      </div>
    </aside>
  );
};