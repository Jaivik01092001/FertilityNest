import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Flex, Spinner, Text } from '@chakra-ui/react';

const ProtectedRoute = ({ children, requireVerified = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Flex 
        height="100vh" 
        width="100%" 
        justifyContent="center" 
        alignItems="center" 
        direction="column"
        gap={4}
      >
        <Spinner 
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="secondary.500"
          size="xl"
        />
        <Text color="gray.600">Loading...</Text>
      </Flex>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if email verification is required
  if (requireVerified && !user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  // Render children if authenticated
  return children;
};

export default ProtectedRoute;
