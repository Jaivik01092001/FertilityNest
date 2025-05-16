import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create context
const AuthContext = createContext();

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  
  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);
  
  // Load user on initial render if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          setLoading(true);
          const res = await axios.get(`${API_URL}/auth/me`);
          setUser(res.data.user);
          setError(null);
        } catch (err) {
          console.error('Error loading user:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setError('Session expired. Please login again.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    loadUser();
  }, [token]);
  
  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      
      // Set token and user
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setError(null);
      
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      // Set token and user
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setError(null);
      
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };
  
  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.put(`${API_URL}/users/profile`, userData);
      setUser(res.data.user);
      setError(null);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const res = await axios.put(`${API_URL}/users/change-password`, {
        currentPassword,
        newPassword
      });
      setError(null);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setError(null);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Forgot password request failed');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password
  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/reset-password/${token}`, {
        password
      });
      setError(null);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Verify email
  const verifyEmail = async (token) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/auth/verify-email/${token}`);
      
      // Update user verification status if logged in
      if (user) {
        setUser({ ...user, isVerified: true });
      }
      
      setError(null);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Email verification failed');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Generate partner code
  const generatePartnerCode = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/users/partner-code`);
      
      // Update user with partner code
      setUser({ ...user, partnerCode: res.data.partnerCode });
      
      setError(null);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate partner code');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Link partner
  const linkPartner = async (partnerCode) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/users/link-partner`, { partnerCode });
      
      // Update user with partner info
      setUser({ ...user, partnerId: res.data.partner.id });
      
      setError(null);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to link partner');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        verifyEmail,
        generatePartnerCode,
        linkPartner,
        isAuthenticated: !!user,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
