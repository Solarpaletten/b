// Файл: src/components/ui/alert.tsx
import React from 'react';
import './alert.css';

interface AlertProps {
  variant?: 'default' | 'destructive';
  className?: string;
  children?: React.ReactNode;
}

interface TitleProps {
  className?: string;
  children?: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({ 
  variant = 'default', 
  className = '', 
  children 
}) => {
  return (
    <div
      role="alert"
      className={`alert alert-${variant} ${className}`}
    >
      {children}
    </div>
  );
};

const AlertTitle: React.FC<TitleProps> = ({ 
  className = '', 
  children 
}) => {
  return (
    <h5 className={`alert-title ${className}`}>
      {children}
    </h5>
  );
};

const AlertDescription: React.FC<TitleProps> = ({ 
  className = '', 
  children 
}) => {
  return (
    <div className={`alert-description ${className}`}>
      {children}
    </div>
  );
};

export { Alert, AlertTitle, AlertDescription };
