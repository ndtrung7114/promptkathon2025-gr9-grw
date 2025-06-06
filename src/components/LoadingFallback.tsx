import React from 'react';

interface LoadingFallbackProps {
  message?: string;
  isError?: boolean;
  onRetry?: () => void;
}

const LoadingFallback = ({ 
  message = 'Loading application...', 
  isError = false,
  onRetry
}: LoadingFallbackProps) => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center p-6 max-w-md mx-auto rounded-lg shadow-lg bg-white">
        {!isError ? (
          <>
            <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">{message}</p>
          </>
        ) : (
          <>
            <svg 
              className="h-16 w-16 text-red-500 mx-auto" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Something went wrong</h3>
            <p className="mt-2 text-gray-600">{message}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                Try Again
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoadingFallback;
