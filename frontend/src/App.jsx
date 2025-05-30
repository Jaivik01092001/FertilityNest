import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getCurrentUser } from './store/slices/authSlice'
import { initSocket, disconnectSocket } from './services/socketService'

// Import auth components
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import VerifyEmail from './components/auth/VerifyEmail'

// Import user components
import Profile from './components/user/Profile'
import ChangePassword from './components/user/ChangePassword'
import EmergencyContacts from './components/user/EmergencyContacts'

// Import settings component
import Settings from './components/settings/Settings'

// Import dashboard component
import Dashboard from './components/dashboard/Dashboard'

// Import admin components
import AdminDashboard from './components/admin/AdminDashboard'

// Import cycle components
import CycleList from './components/cycles/CycleList'
import CreateCycle from './components/cycles/CreateCycle'

// Import medication components
import MedicationList from './components/medications/MedicationList'
import AddMedication from './components/medications/AddMedication'
import MedicationDetail from './components/medications/MedicationDetail'
import EditMedication from './components/medications/EditMedication'

// Import chat components
import ChatList from './components/chat/ChatList'
import ChatSession from './components/chat/ChatSession'

// Import community components
import CommunityList from './components/community/CommunityList'
import CommunityDetail from './components/community/CommunityDetail'
import CreateCommunity from './components/community/CreateCommunity'

// Import partner components
import PartnerDashboard from './components/partner/PartnerDashboard'
import PartnerConnect from './components/partner/PartnerConnect'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

const App = () => {
  const dispatch = useDispatch()
  const { token, user, isAuthenticated } = useSelector((state) => state.auth)

  // Initialize user data when token is available
  useEffect(() => {
    if (token) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, token])

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && user._id) {
      // Initialize socket connection with user ID
      initSocket(user._id)
    }

    // Clean up socket connection on unmount
    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated, user])

  return (
    <div className="min-h-screen bg-neutral-50">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
        theme="light"
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/change-password" element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        } />
        <Route path="/emergency-contacts" element={
          <ProtectedRoute>
            <EmergencyContacts />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/cycles" element={
          <ProtectedRoute>
            <CycleList />
          </ProtectedRoute>
        } />
        <Route path="/cycles/new" element={
          <ProtectedRoute>
            <CreateCycle />
          </ProtectedRoute>
        } />
        {/* Medication Routes */}
        <Route path="/medications" element={
          <ProtectedRoute>
            <MedicationList />
          </ProtectedRoute>
        } />
        <Route path="/medications/new" element={
          <ProtectedRoute>
            <AddMedication />
          </ProtectedRoute>
        } />
        <Route path="/medications/:medicationId" element={
          <ProtectedRoute>
            <MedicationDetail />
          </ProtectedRoute>
        } />
        <Route path="/medications/edit/:medicationId" element={
          <ProtectedRoute>
            <EditMedication />
          </ProtectedRoute>
        } />

        {/* Chat Routes */}
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatList />
          </ProtectedRoute>
        } />
        <Route path="/chat/:sessionId" element={
          <ProtectedRoute>
            <ChatSession />
          </ProtectedRoute>
        } />

        {/* Partner Routes */}
        <Route path="/partner" element={
          <ProtectedRoute>
            <PartnerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/partner/connect" element={
          <ProtectedRoute>
            <PartnerConnect />
          </ProtectedRoute>
        } />

        {/* Community Routes */}
        <Route path="/community" element={
          <ProtectedRoute>
            <CommunityList />
          </ProtectedRoute>
        } />
        <Route path="/community/create" element={
          <ProtectedRoute>
            <CreateCommunity />
          </ProtectedRoute>
        } />
        <Route path="/community/:communityId" element={
          <ProtectedRoute>
            <CommunityDetail />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App