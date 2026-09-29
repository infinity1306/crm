import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { CRMProvider } from './context/CRMContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { NetworkStatusBanner } from './components/shell/NetworkStatusBanner';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <CRMProvider>
        <NetworkStatusBanner />
        <App />
      </CRMProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
