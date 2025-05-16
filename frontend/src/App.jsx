import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main App Components
import Dashboard from './pages/Dashboard';
import CycleTracker from './pages/CycleTracker';
import MedicationTracker from './pages/MedicationTracker';
import ChatWithAnaira from './pages/ChatWithAnaira';
import PartnerPortal from './pages/PartnerPortal';
import Community from './pages/Community';
import CommunityDetail from './pages/CommunityDetail';
import Profile from './pages/Profile';
import DistressButton from './components/DistressButton';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Context
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Custom theme
const theme = extendTheme({
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    },
  },
  fonts: {
    heading: '"Poppins", sans-serif',
    body: '"Inter", sans-serif',
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route element={<Layout />}>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />

                <Route path="/cycle-tracker" element={
                  <ProtectedRoute>
                    <CycleTracker />
                  </ProtectedRoute>
                } />

                <Route path="/medication-tracker" element={
                  <ProtectedRoute>
                    <MedicationTracker />
                  </ProtectedRoute>
                } />

                <Route path="/chat" element={
                  <ProtectedRoute>
                    <ChatWithAnaira />
                  </ProtectedRoute>
                } />

                <Route path="/partner" element={
                  <ProtectedRoute>
                    <PartnerPortal />
                  </ProtectedRoute>
                } />

                <Route path="/community" element={
                  <ProtectedRoute>
                    <Community />
                  </ProtectedRoute>
                } />

                <Route path="/community/:id" element={
                  <ProtectedRoute>
                    <CommunityDetail />
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Redirect to dashboard if already logged in */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global Distress Button */}
            <DistressButton />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;