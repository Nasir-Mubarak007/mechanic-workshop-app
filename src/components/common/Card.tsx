import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  icon: Icon,
  iconColor = 'text-red-600',
  children,
  footer,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden border border-red-100 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-red-100 flex items-center bg-red-50">
          {Icon && <Icon className={`mr-3 ${iconColor}`} size={20} />}
          <h3 className="font-medium text-red-900">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;