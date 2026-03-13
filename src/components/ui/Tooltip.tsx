import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  delay = 0,
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timer, setTimer] = useState<any>(null);

  const show = () => {
    const t = setTimeout(() => setIsVisible(true), delay);
    setTimer(t);
  };

  const hide = () => {
    if (timer) clearTimeout(timer);
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--color-interactive)]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-interactive)]',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--color-interactive)]',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--color-interactive)]',
  };

  return (
    <div 
      className="relative flex items-center justify-center w-fit" 
      onMouseEnter={show} 
      onMouseLeave={hide}
    >
      {children}
      {isVisible && (
        <div className={`absolute ${positionClasses[position]} px-2 py-1 bg-[var(--color-interactive)] text-[var(--color-text-inverse)] text-[11px] font-medium rounded-[var(--radius-sm)] whitespace-nowrap shadow-[var(--shadow-sm)] z-[2000] animate-in fade-in zoom-in-95 duration-150 pointer-events-none`}>
          {content}
          <div className={`absolute border-[4px] border-transparent ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
