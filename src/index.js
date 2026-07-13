import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeStorage } from './utils/initializeStorage';

async function bootstrap() {
  try {
    await initializeStorage();
  } catch (error) {
    console.warn('[bootstrap] Blog storage initialization failed:', error);
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();

reportWebVitals();
