import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import websocketClient from '../websocket/websocketClient';
import { removeStoredWorkspaceId } from '../utils/workspaceStorage';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await authService.getMe();
          setUser(response.data.user);
          setIsAuthenticated(true);
          // Connect websocket when authenticated
          websocketClient.connect(token);
        } catch (error) {
          console.error("Failed to authenticate with token, attempting refresh...", error);
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (refreshToken) {
            try {
              const refreshResponse = await authService.refresh(refreshToken);
              const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: refreshedUser } = refreshResponse.data;
              
              localStorage.setItem('accessToken', newAccessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              
              setUser(refreshedUser || null);
              if (!refreshedUser) {
                  // if refresh didn't return user, fetch it
                  const userResponse = await authService.getMe();
                  setUser(userResponse.data.user);
              }

              setIsAuthenticated(true);
              websocketClient.connect(newAccessToken);
            } catch (refreshError) {
              console.error("Failed to refresh token", refreshError);
              logout();
            }
          } else {
            logout();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();

    return () => {
      websocketClient.disconnect();
    };
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    setUser(user);
    setIsAuthenticated(true);
    
    // Connect websocket
    websocketClient.connect(accessToken);
    return user;
  };

  const register = async (name, email, password) => {
    const response = await authService.register(name, email, password);
    // After registration, log the user in
    return login(email, password);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (error) {
        console.error("Logout API failed", error);
      }
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    removeStoredWorkspaceId();
    
    setUser(null);
    setIsAuthenticated(false);
    websocketClient.disconnect();
  };

  const updateUser = (newUserData) => {
    setUser({ ...user, ...newUserData });
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
