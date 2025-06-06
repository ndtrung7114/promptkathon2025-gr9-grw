import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Error boundary for the entire application
class ErrorBoundary {
  static handleError(error: Error) {
    console.error('Application error:', error);
    // Display fallback UI
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: sans-serif;">
          <h2>Something went wrong</h2>
          <p>The application encountered an error. Please try refreshing the page.</p>
          <button onclick="window.location.reload()" style="padding: 8px 16px; background: #4299e1; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      `;
    }
  }
}

// Setup global error handlers
window.addEventListener('error', (event) => {
  ErrorBoundary.handleError(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  ErrorBoundary.handleError(event.reason);
});

try {
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
} catch (error) {
  ErrorBoundary.handleError(error as Error);
}
