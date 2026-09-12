import { useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getMyProfile } from '../api/authApi';
import AuthContext from './AuthContextObject';

// Component that supplies auth state to the whole tree
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Clear session from state and storage
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // When app starts, check if there is an existing login session
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          if (isMounted) setUser(JSON.parse(storedUser));
          const res = await getMyProfile();
          if (res.data && isMounted) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch {
          if (isMounted) logout();
        }
      }
      if (isMounted) setLoading(false);
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [logout]);

  // Handle user login
  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const { user: userData, token: jwtToken } = res.data;

    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));

    return userData;
  };

  // Handle user registration
  const register = async (userData) => {
    const res = await registerUser(userData);
    const { user: newUser, token: jwtToken } = res.data;

    setUser(newUser);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    return newUser;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isBuyer: user?.role === 'BUYER',
    isSupplier: user?.role === 'SUPPLIER',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
