import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './global.css';
import { AuthProvider } from './contexts/AuthContext';
import { MovieProvider } from './contexts/MovieContext';
import { PersonProvider } from './contexts/PersonContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MovieProvider>
          <PersonProvider>
            <App />
          </PersonProvider>
        </MovieProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);