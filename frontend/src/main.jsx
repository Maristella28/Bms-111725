import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';

// Mobile performance optimizations
const optimizeForMobile = () => {
  // Prevent zoom on double tap for iOS
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Optimize scroll performance
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Prevent horizontal scroll
  document.body.style.overflowX = 'hidden';
};

// Initialize mobile optimizations
optimizeForMobile();

// Lazy load heavy CSS imports
const loadFlowbite = () => import('flowbite');
const loadFontAwesome = () => import('@fortawesome/fontawesome-free/css/all.min.css');

// Load non-critical resources after initial render
setTimeout(() => {
  loadFlowbite();
  loadFontAwesome();
}, 100);

import './utils/axiosConfig';

// Error boundary for debugging
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    
    // Handle specific DOM manipulation errors
    if (error.message && error.message.includes('removeChild')) {
      console.warn('DOM manipulation error detected, attempting cleanup...');
      // Clean up any lingering DOM elements that might cause issues
      try {
        const poppers = document.querySelectorAll('.react-datepicker-popper');
        poppers.forEach(popper => {
          if (popper && popper.parentNode) {
            popper.parentNode.removeChild(popper);
          }
        });
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const container = document.getElementById('root');
// Reuse an existing root during HMR or multiple mounts to avoid double createRoot warnings
const root = window.__appRoot || createRoot(container);
window.__appRoot = root;
root.render(
  // StrictMode disabled to prevent duplicate API calls in development
  // <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  // </StrictMode>
);
