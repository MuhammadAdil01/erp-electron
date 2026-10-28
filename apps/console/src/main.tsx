import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App, start } from './App';
import './index.css';

start();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
