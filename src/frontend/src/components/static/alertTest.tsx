import React from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertCardProps {
  type: AlertType;
  title: string;
  message: string;
  onClose?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

const AlertCard: React.FC<AlertCardProps> = ({
  type,
  title,
  message,
  onClose,
  className = '',
  icon,
}) => {
  const typeStyles = {
    success: 'bg-green-100 border-green-400 text-green-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800',
  };

  return (
    <div
      className={`
        relative w-full max-w-screen-lg
        border-l-4 p-4
        transition-all duration-300
        hover:shadow-md
        ${typeStyles[type]}
        ${className}
      `}
      role="alert"
      style={{
        width: '90vw',
        margin: '1rem auto',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Icon Section */}
        <div className="flex-shrink-0">
          {icon || (
            <svg
              className={`h-6 w-6 ${typeStyles[type].replace('bg-', 'text-').split(' ')[0]}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {/* Add your default icon paths here */}
            </svg>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <h3 className="text-balance font-semibold leading-snug
            text-[clamp(1rem,2vw,1.25rem)]
            [text-wrap:balance]
          ">
            {title}
          </h3>
          <p className="mt-1 text-balance leading-normal
            text-[clamp(0.875rem,1.5vw,1rem)]
            [text-wrap:balance]
          ">
            {message}
          </p>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:opacity-75 transition-opacity"
            aria-label="Close alert"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertCard;