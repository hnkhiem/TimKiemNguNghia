import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Add JSX namespace declaration to fix linter errors
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
