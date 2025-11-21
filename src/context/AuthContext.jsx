import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      console.log('✅ User loaded from localStorage:', userData);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔐 Attempting login...');
      const response = await authAPI.login(email, password);

      console.log('📦 Login response:', response);

      // Backend returns { success: true, data: { user, token } }
      if (response.success && response.data) {
        const { user, token } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        await new Promise(resolve => setTimeout(resolve, 100));

        setUser(user);
        console.log('✅ Login successful! User role:', user.role);
        return { success: true, user: user };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isSuperuser = () => {
    const result = user?.role === 'superuser';
    console.log('🔍 isSuperuser check:', { user: user?.username, role: user?.role, result });
    return result;
  };

  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'superuser';
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        logout, 
        isSuperuser, 
        isAdmin,
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
