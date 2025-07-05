import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../utils/api';

const AuthContext = createContext({
  isInitialized: false,
  isAuthenticated: false,
  user: null,
  sessionId: null,
  login: async () => {},
  logout: async () => {},
  handleAuthCallback: async () => false,
}); 

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      // Check for auth callback in URL
      const urlParams = new URLSearchParams(window.location.search);
      const requestToken = urlParams.get('request_token');
      const approved = urlParams.get('approved');
      
      if (requestToken && approved === 'true') {
        try {
          await handleAuthCallback(requestToken);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Auth callback failed:', error);
          alert('Authentication failed. Please try again.');
        }
      } else {
        // Check for existing session
        const storedSessionId = localStorage.getItem('tmdb_session_id');
        
        if (storedSessionId) {
          try {
            const { data: accountData } = await auth.getAccount(storedSessionId);
            setUser(accountData);
            setSessionId(storedSessionId);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Failed to restore session:', error);
            localStorage.removeItem('tmdb_session_id');
          }
        }
      }
      
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  const login = async () => {
    try {
      // Step 1: Create request token
      const { data: tokenData } = await auth.createRequestToken();
      const requestToken = tokenData.request_token;
      
      if (!requestToken) {
        throw new Error('Failed to create request token');
      }
      
      // Step 2: Redirect to TMDB for user approval
      const redirectUrl = window.location.origin + window.location.pathname;
      const authUrl = `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=${encodeURIComponent(redirectUrl)}`;
      
      // Store the request token for later use
      localStorage.setItem('tmdb_request_token', requestToken);
      
      // Redirect to TMDB authentication page
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to start authentication process. Please check your internet connection and try again.');
    }
  };

  const logout = async () => {
    try {
      if (sessionId) {
        await auth.deleteSession(sessionId);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('tmdb_session_id');
      localStorage.removeItem('tmdb_request_token');
      
      setIsAuthenticated(false);
      setUser(null);
      setSessionId(null);
      
      alert('Successfully signed out!');
    }
  };

  const handleAuthCallback = async (requestToken) => {
    try {
      // Step 3: Create session with approved request token
      const { data: sessionData } = await auth.createSession(requestToken);
      const newSessionId = sessionData.session_id;
      
      if (!newSessionId) {
        throw new Error('Failed to create session');
      }
      
      // Store session ID
      localStorage.setItem('tmdb_session_id', newSessionId);
      localStorage.removeItem('tmdb_request_token');
      
      // Step 4: Get account details
      const { data: accountData } = await auth.getAccount(newSessionId);
      
      setSessionId(newSessionId);
      setUser(accountData);
      setIsAuthenticated(true);
      
      alert(`Welcome ${accountData.username}! You are now signed in with your TMDB account.`);
      
      return true;
    } catch (error) {
      console.error('Authentication callback failed:', error);
      localStorage.removeItem('tmdb_request_token');
      alert('Authentication failed. Please try signing in again.');
      throw error;
    }
  };

  const value = {
    isInitialized,
    isAuthenticated,
    user,
    sessionId,
    login,
    logout,
    handleAuthCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};