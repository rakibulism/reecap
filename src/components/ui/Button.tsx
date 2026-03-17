import React from 'react';

interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  as?: any;
  disabled?: boolean;
  progress?: number;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  as: Component = 'button',
  disabled,
  progress,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-1.5 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-[var(--radius-sm)] relative overflow-hidden';
  
  const variantStyles = {
    primary: 'bg-[var(--color-interactive)] text-[var(--color-text-inverse)] enabled:hover:bg-opacity-90',
    secondary: 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] enabled:hover:bg-[var(--color-bg-hover)]',
    ghost: 'bg-transparent text-[var(--color-text-secondary)] enabled:hover:bg-[var(--color-bg-hover)]',
    danger: 'bg-[var(--color-bg-surface)] text-red-600 border border-red-200 enabled:hover:bg-red-50',
  };

  const sizeStyles = {
    sm: 'h-7 px-2 text-[12px]',
    md: 'h-8 px-3 text-[13px]',
    lg: 'h-9 px-4 text-[14px]',
    xl: 'h-12 px-8 text-[16px] rounded-[var(--radius-md)]',
  };

  return (
    <Component
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {progress !== undefined && progress > 0 && (
        <span 
          className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300 pointer-events-none"
          style={{ width: `${progress}%` }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {icon && <span className="flex items-center">{icon}</span>}
        {children}
      </span>
    </Component>
  );
};

export default Button;
