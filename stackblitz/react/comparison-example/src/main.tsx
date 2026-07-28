import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ExampleView } from './ExampleView';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExampleView />
  </StrictMode>
);
