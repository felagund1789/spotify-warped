import React from 'react';
import '../styles/ErrorMessage.css';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ 
  title = "Something went wrong", 
  message = "We couldn't load your data. Please try again later.",
  onRetry 
}: ErrorMessageProps) {
  return (
    <div className="error-message">
      <div className="error-content">
        <div className="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        
        <div className="error-text">
          <h2 className="error-title">{title}</h2>
          <p className="error-description">{message}</p>
        </div>
        
        {onRetry && (
          <button className="error-retry-btn" onClick={onRetry}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
            </svg>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}