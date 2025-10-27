import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  size = 'medium'
}) => {
  const baseClasses = 'inline-flex items-center font-montserrat font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-neo-gray-100 text-neo-gray-800',
    success: 'bg-neo-success bg-opacity-10 text-green-800',
    warning: 'bg-neo-warning bg-opacity-10 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-neo-info bg-opacity-10 text-blue-800'
  };
  
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-1 text-sm'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;

  return (
    <span className={classes}>
      {children}
    </span>
  );
};