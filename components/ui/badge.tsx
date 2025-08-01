import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'medical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-secondary text-secondary-foreground',
    success: 'bg-success-100 text-success-800 border border-success-200',
    warning: 'bg-warning-100 text-warning-800 border border-warning-200',
    danger: 'bg-danger-100 text-danger-800 border border-danger-200',
    info: 'bg-info-100 text-info-800 border border-info-200',
    medical: 'bg-medical-100 text-medical-800 border border-medical-200'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm'
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}

// Badge específico para roles médicos
export function RoleBadge({ role }: { role: string }) {
  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'danger';
      case 'Administrador':
        return 'info';
      case 'Especialista':
        return 'warning';
      case 'Paciente':
        return 'success';
      default:
        return 'medical';
    }
  };
  
  return (
    <Badge variant={getRoleVariant(role)}>
      {role}
    </Badge>
  );
} 