import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { setLoading, setError } from '../../store/slices/uiSlice';
import useApi from '../../hooks/useApi';

// Create async thunk for changing password
export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'auth', isLoading: true }));
      const response = await api.put('/users/change-password', passwordData);
      dispatch(setLoading({ feature: 'auth', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'auth', isLoading: false }));
      dispatch(
        setError({
          feature: 'auth',
          error: error.response?.data?.message || 'Failed to change password',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);
  
  const { execute, loading, error } = useApi({
    asyncAction: changePassword,
    feature: 'auth',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear password error when user types
    if (name === 'newPassword' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const validateForm = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return false;
    }
    
    if (formData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return false;
    }
    
    if (formData.newPassword === formData.currentPassword) {
      setPasswordError('New password must be different from current password');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const result = await execute({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
    
    if (result.success) {
      setChangeSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setChangeSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Change Password
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Update your account password
        </p>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {changeSuccess && (
        <div className="rounded-md bg-green-50 p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Password Changed
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your password has been changed successfully.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  required
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="sm:col-span-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters
              </p>
            </div>
            
            <div className="sm:col-span-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          {passwordError && (
            <div className="mt-4 text-sm text-red-600">
              {passwordError}
            </div>
          )}
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
