import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App, start } from './App';

start();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
