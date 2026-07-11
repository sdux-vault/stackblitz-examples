/**
 * Mounts the hydrate example as the root React application.
 * StrictMode wraps ExampleView while the cell module owns Vault initialization.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ExampleView } from './app/ExampleView';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExampleView />
  </StrictMode>
);
