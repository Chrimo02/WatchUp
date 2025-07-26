import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './global.css';
import { AuthProvider } from './contexts/AuthContext';
import { MovieProvider } from './contexts/MovieContext';
import { PersonProvider } from './contexts/PersonContext';
import { OmdbProvider } from './contexts/OmdbContext.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
      <AuthProvider>
        <MovieProvider>
          <PersonProvider>
            <OmdbProvider>
              <App />
            </OmdbProvider>
          </PersonProvider>
        </MovieProvider>
      </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>
);