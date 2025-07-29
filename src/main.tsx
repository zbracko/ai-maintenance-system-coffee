import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import App from './App.tsx';
import theme from './theme';
import { Buffer } from 'buffer';
import React from 'react';
import ReactDOM from 'react-dom';
import './i18n';
// Polyfills for global, Buffer and process if needed
window.Buffer = window.Buffer || Buffer;
window.global = window;
window.process = { env: {} };

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);