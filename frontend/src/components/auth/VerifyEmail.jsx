import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { setLoading, setError } from '../../store/slices/uiSlice';
import useApi from '../../hooks/useApi';

// Create async thunk for email verification
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading({ feature: 'auth', isLoading: true }));
      const response = await api.get(`/auth/verify-email/${token}`);
      dispatch(setLoading({ feature: 'auth', isLoading: false }));
      return response.data;
    } catch (error) {
      dispatch(setLoading({ feature: 'auth', isLoading: false }));

      // Check if this is a 400 error with a specific message about already verified
      if (error.response?.status === 400 &&
        error.response?.data?.message?.includes('already verified')) {
        // Return a special response for already verified case
        return {
          success: true,
          alreadyVerified: true,
          message: error.response.data.message
        };
      }

      dispatch(
        setError({
          feature: 'auth',
          error: error.response?.data?.message || 'Failed to verify email',
        })
      );
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'already-verified', 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Get token from URL query params
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const { execute, loading, error } = useApi({
    asyncAction: verifyEmail,
    feature: 'auth',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
      return;
    }

    if (!token) {
      setVerificationStatus('error');
      setStatusMessage('No verification token provided. Please check your email link.');
      return;
    }

    const verifyUserEmail = async () => {
      const result = await execute(token);

      if (result.success) {
        if (result.alreadyVerified) {
          // Handle the case where the email was already verified
          setVerificationStatus('already-verified');
          setStatusMessage(result.message || 'Your email has already been verified. You can now log in to your account.');
        } else {
          // Normal success case - first time verification
          setVerificationStatus('success');
          setStatusMessage('Your email has been successfully verified. You can now log in to your account.');
        }

        // Redirect to login after 3 seconds in both cases
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setStatusMessage(error || 'The verification link is invalid or has expired.');
      }
    };

    verifyUserEmail();
  }, [token, execute, navigate, isAuthenticated, error]);

  if (loading || verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="auth-container">
          <div className="max-w-md w-full space-y-8 text-center mx-auto">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Verifying your email
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success' || verificationStatus === 'already-verified') {
    const isAlreadyVerified = verificationStatus === 'already-verified';

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="auth-container">
          <div className="max-w-md w-full space-y-8 mx-auto">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                {isAlreadyVerified ? 'Already Verified' : 'Email Verified!'}
              </h2>
              <div className="mt-6 flex justify-center">
                <div className="rounded-full bg-green-100 p-4">
                  <svg className="h-12 w-12 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="mt-6 text-center text-base text-gray-600">
                {statusMessage}
              </p>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  You will be redirected to the login page in a few seconds.
                </p>
                <Link
                  to="/login"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="auth-container">
        <div className="max-w-md w-full space-y-8 mx-auto">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verification Failed
            </h2>
            <div className="mt-6 flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <svg className="h-12 w-12 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <p className="mt-6 text-center text-base text-gray-600">
              {statusMessage}
            </p>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Please try again or contact support if you continue to have issues.
              </p>
              <div className="mt-4 space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Go to Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Register Again
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
