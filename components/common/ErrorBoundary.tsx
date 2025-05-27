import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link, NavigateFunction, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { ROUTES } from '../../constants';
import { AlertTriangleIcon } from './Icon';
import { useSecureAuth } from '../../contexts/SecureAuthContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// New Functional component for action buttons that can use hooks
interface ErrorActionsProps {
  onRetry: () => void;
  onResetStateAndNavigate: () => void; // This will be the class method that resets error state
}

const ErrorActions: React.FC<ErrorActionsProps> = ({ onRetry, onResetStateAndNavigate }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSecureAuth();

  const handleGoHomeClick = () => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    } else {
      navigate(ROUTES.WELCOME);
    }
    onResetStateAndNavigate(); // Call the passed function to reset ErrorBoundary state
  };

  const handleReloadPage = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-3">
      <Button 
        onClick={onRetry} // onRetry directly calls the state reset in the class
        className="w-full"
        variant="primary"
      >
        Try Again
      </Button>
      
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={handleGoHomeClick} // Uses hook-based navigation
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Go Home
        </Button>
        
        <Button 
          onClick={handleReloadPage}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Reload Page
        </Button>
      </div>
    </div>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    if (import.meta.env.PROD) {
      // In production, send to error monitoring service
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // This would typically send to a service like Sentry, LogRocket, etc.
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: localStorage.getItem('detachd_user') || 'anonymous'
      };

      // Send to error monitoring service
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport)
      }).catch(fetchError => {
        console.error('Failed to send error report:', fetchError);
      });
    } catch (reportError) {
      console.error('Failed to create error report:', reportError);
    }
  };

  // Renamed to clearly indicate it just resets state for Go Home scenario
  private resetErrorStateForNavigation = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Something went wrong
                </h1>
                <p className="text-slate-300 text-sm">
                  We're sorry, but something unexpected happened. Our team has been notified.
                </p>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-slate-700 rounded-md text-left">
                  <h3 className="text-sm font-medium text-red-400 mb-2">Development Error Details:</h3>
                  <div className="text-xs text-slate-300 font-mono overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <ErrorActions 
                onRetry={this.handleRetry} 
                onResetStateAndNavigate={this.resetErrorStateForNavigation} 
              />

              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-xs text-slate-500">
                  If this problem persists, please contact{' '}
                  <a 
                    href="mailto:support@detachd.systems" 
                    className="text-blue-400 hover:text-blue-300"
                  >
                    support@detachd.systems
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Unhandled error:', error, errorInfo);
    
    // You could dispatch to a global error state here
    // or show a toast notification
  };
};

// HOC version for wrapping components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}; 