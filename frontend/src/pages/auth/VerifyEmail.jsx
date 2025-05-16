import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  PinInput,
  PinInputField,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
  Link,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const { verifyEmail, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // Extract token from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      setIsVerifying(true);
      handleVerifyWithToken(token);
    }
  }, [location]);
  
  // Redirect if already verified
  useEffect(() => {
    if (user?.isVerified) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleVerifyWithToken = async (token) => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await verifyEmail(token);
      
      if (result.success) {
        setSuccess(true);
        toast({
          title: 'Email verified successfully!',
          description: 'You can now access all features of FertilityNest.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(result.error?.message || 'Verification failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  };
  
  const handleVerifyWithCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Call verify function with code
      const result = await verifyEmail(verificationCode);
      
      if (result.success) {
        setSuccess(true);
        toast({
          title: 'Email verified successfully!',
          description: 'You can now access all features of FertilityNest.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(result.error?.message || 'Verification failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    // Implement resend verification code logic
    toast({
      title: 'Verification email sent',
      description: 'Please check your inbox for a new verification email',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };
  
  if (isVerifying) {
    return (
      <Container
        maxW="lg"
        py={{ base: '12', md: '24' }}
        px={{ base: '0', sm: '8' }}
        minH="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <VStack spacing={8} align="center">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="secondary.500"
            size="xl"
          />
          <Text>Verifying your email...</Text>
        </VStack>
      </Container>
    );
  }
  
  return (
    <Container
      maxW="lg"
      py={{ base: '12', md: '24' }}
      px={{ base: '0', sm: '8' }}
      minH="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Box
        py={{ base: '0', sm: '8' }}
        px={{ base: '4', sm: '10' }}
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow={{ base: 'none', sm: 'md' }}
        borderRadius={{ base: 'none', sm: 'xl' }}
      >
        <VStack spacing={6} align="center">
          <Heading
            color={useColorModeValue('secondary.600', 'secondary.400')}
            fontSize={{ base: '2xl', md: '3xl' }}
          >
            Verify Your Email
          </Heading>
          
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          {success ? (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              Email verified successfully! Redirecting to dashboard...
            </Alert>
          ) : (
            <>
              <Text textAlign="center" color="gray.600">
                We've sent a verification code to your email address. Please enter the code below to verify your account.
              </Text>
              
              <HStack spacing={2}>
                <PinInput
                  otp
                  size="lg"
                  value={verificationCode}
                  onChange={setVerificationCode}
                >
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                </PinInput>
              </HStack>
              
              <Button
                colorScheme="secondary"
                width="full"
                onClick={handleVerifyWithCode}
                isLoading={isLoading}
                loadingText="Verifying..."
              >
                Verify Email
              </Button>
              
              <HStack spacing={1} width="full" justify="center">
                <Text color="gray.500" fontSize="sm">
                  Didn't receive a code?
                </Text>
                <Link
                  color="secondary.500"
                  fontSize="sm"
                  fontWeight="semibold"
                  onClick={handleResendCode}
                  cursor="pointer"
                >
                  Resend
                </Link>
              </HStack>
              
              <HStack spacing={1} width="full" justify="center">
                <Text color="gray.500" fontSize="sm">
                  Back to
                </Text>
                <Link
                  as={RouterLink}
                  to="/login"
                  color="secondary.500"
                  fontSize="sm"
                  fontWeight="semibold"
                >
                  Login
                </Link>
              </HStack>
            </>
          )}
        </VStack>
      </Box>
    </Container>
  );
};

export default VerifyEmail;
