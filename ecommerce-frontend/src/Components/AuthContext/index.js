import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create Authentication Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Clear auth function
  const clearAuth = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('sessionExpiry');
      
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('sessionId');
      sessionStorage.removeItem('sessionExpiry');

      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setAuthError(null);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  };

  // Check if session is still valid
  const isSessionValid = useCallback(() => {
    let sessionExpiry = localStorage.getItem('sessionExpiry') || sessionStorage.getItem('sessionExpiry');
    if (!sessionExpiry || Date.now() > parseInt(sessionExpiry)) {
      // Don't call logout here directly to avoid loops, just return false
      return false;
    }
    return true;
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        let storedAuth = localStorage.getItem('isAuthenticated') || sessionStorage.getItem('isAuthenticated');
        let storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (storedAuth === 'true' && storedUser) {
          if (!isSessionValid()) {
            clearAuth();
          } else {
            const userData = JSON.parse(storedUser);
            if (userData.email && userData.role) {
              setUser(userData);
              setIsAuthenticated(true);
              setIsAdmin(userData.role === 'admin');
            } else {
              clearAuth();
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [isSessionValid]);

  const saveSession = (userData, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Default 30 days for remember me, 24 hours otherwise
    const expiryTime = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    storage.setItem('user', JSON.stringify(userData));
    storage.setItem('isAuthenticated', 'true');
    storage.setItem('sessionId', userData.sessionId);
    storage.setItem('sessionExpiry', (Date.now() + expiryTime).toString());
  };

  // Login function
  const login = useCallback(async (username, password, rememberMe = false) => {
    try {
      setAuthError(null);
      if (!username || !password) throw new Error('Username and password are required');

      const cleanUsername = username.trim().toLowerCase();

      // MOCK DUMMY USERS DATABASE from localStorage
      const usersDB = JSON.parse(localStorage.getItem('dummyUsersDB') || '[]');
      const foundUser = usersDB.find(u => u.email === cleanUsername || u.username === cleanUsername);

      if (foundUser) {
        if (foundUser.password !== password) throw new Error('Invalid credentials');
        
        const userData = {
          name: foundUser.name,
          email: foundUser.email,
          username: foundUser.username,
          role: foundUser.role || 'user',
          image: 'https://dummyjson.com/icon/janes/128', // default dummy icon
          token: 'mock_token_' + Date.now(),
          loginTime: new Date().toISOString(),
          sessionId: generateSessionId()
        };

        saveSession(userData, rememberMe);
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.role === 'admin');
        return { success: true, user: userData };
      }

      // Fallback for Admin
      if (cleanUsername.includes('admin') || cleanUsername === 'admin@example.com') {
        const defaultAdminPassword = 'admin'; 
        if (password === defaultAdminPassword) {
          const userData = {
            name: 'Administrator',
            email: cleanUsername.includes('@') ? cleanUsername : 'admin@example.com',
            username: cleanUsername.includes('@') ? cleanUsername.split('@')[0] : cleanUsername,
            role: 'admin',
            image: 'https://dummyjson.com/icon/emilys/128',
            token: 'mock_admin_token_' + Date.now(),
            loginTime: new Date().toISOString(),
            sessionId: generateSessionId(),
            adminVerified: true
          };

          saveSession(userData, rememberMe);
          setUser(userData);
          setIsAuthenticated(true);
          setIsAdmin(true);
          return { success: true, user: userData };
        }
      }

      // Fallback to DummyJSON if no custom user found
      const response = await fetch('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const responseData = await response.json();
      const userData = {
        name: `${responseData.firstName} ${responseData.lastName}`,
        email: responseData.email,
        username: responseData.username,
        role: 'user',
        image: responseData.image,
        token: responseData.token,
        loginTime: new Date().toISOString(),
        sessionId: generateSessionId()
      };

      saveSession(userData, rememberMe);
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(false);

      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Signup function
  const signup = useCallback(async (userData) => {
    try {
      setAuthError(null);
      // Mock network delay
      await new Promise(res => setTimeout(res, 800));

      const { name, email, password } = userData;
      if (!name || !email || !password) throw new Error('All fields are required');

      const usersDB = JSON.parse(localStorage.getItem('dummyUsersDB') || '[]');
      if (usersDB.some(u => u.email === email.toLowerCase())) {
        throw new Error('Email already registered');
      }

      const newUser = {
        name,
        email: email.toLowerCase(),
        username: email.split('@')[0],
        password,
        role: 'user',
        createdAt: new Date().toISOString()
      };

      usersDB.push(newUser);
      localStorage.setItem('dummyUsersDB', JSON.stringify(usersDB));

      return { success: true, message: 'Signup successful' };
    } catch (error) {
      const errorMessage = error.message || 'Signup failed';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Forgot Password
  const forgotPassword = useCallback(async (email) => {
    try {
      setAuthError(null);
      await new Promise(res => setTimeout(res, 800));
      
      const usersDB = JSON.parse(localStorage.getItem('dummyUsersDB') || '[]');
      const userExists = usersDB.some(u => u.email === email.toLowerCase());
      
      // We always return success to prevent email enumeration, but we could error if desired
      if (!userExists && !email.includes('admin')) {
         // Still return success
      }
      
      return { success: true, message: 'Reset link sent if email exists' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const resetPassword = useCallback(async (email, newPassword) => {
    try {
      setAuthError(null);
      await new Promise(res => setTimeout(res, 800));
      
      const usersDB = JSON.parse(localStorage.getItem('dummyUsersDB') || '[]');
      const userIndex = usersDB.findIndex(u => u.email === email.toLowerCase());
      
      if (userIndex !== -1) {
        usersDB[userIndex].password = newPassword;
        localStorage.setItem('dummyUsersDB', JSON.stringify(usersDB));
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const verifyEmail = useCallback(async (token) => {
    await new Promise(res => setTimeout(res, 1000));
    return { success: true, message: 'Email verified successfully' };
  }, []);

  // Logout function
  const logout = useCallback(() => {
    try {
      clearAuth();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Update session expiry on activity
  const updateSessionActivity = useCallback(() => {
    if (isAuthenticated) {
      const isRemembered = !!localStorage.getItem('sessionExpiry');
      const storage = isRemembered ? localStorage : sessionStorage;
      const expiryTime = isRemembered ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      storage.setItem('sessionExpiry', (Date.now() + expiryTime).toString());
    }
  }, [isAuthenticated]);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    authError,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    isSessionValid,
    updateSessionActivity,
    clearAuthError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

function generateSessionId() {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

