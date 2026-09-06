import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import './index.css';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: any) { console.error('Caught by ErrorBoundary:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'var(--color-error)', fontFamily: 'monospace' }}>
          <h2>Something went wrong.</h2>
          <pre style={{ background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', padding: '1rem', overflow: 'auto' }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const container = document.getElementById('root')!;
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
