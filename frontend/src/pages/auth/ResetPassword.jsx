import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  Link,
  InputGroup,
  InputRightElement,
  IconButton,
  FormHelperText,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // Extract token from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Reset token is missing. Please use the link from your email.');
    }
  }, [location]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const result = await resetPassword(token, password);
      
      if (result.success) {
        setSuccess(true);
        toast({
          title: 'Password reset successful!',
          description: 'You can now log in with your new password.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error?.message || 'Password reset failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
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
      <Stack spacing="8">
        <Stack spacing="6" align="center">
          <Heading
            color={useColorModeValue('secondary.600', 'secondary.400')}
            fontSize={{ base: '3xl', md: '4xl' }}
          >
            FertilityNest
          </Heading>
          <Text color="muted" textAlign="center">
            Your companion on the fertility journey
          </Text>
        </Stack>
        
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={useColorModeValue('white', 'gray.800')}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing="6">
              <Stack spacing="5">
                <Heading size="md" textAlign="center">
                  Reset Password
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
                    Password reset successful! Redirecting to login...
                  </Alert>
                ) : (
                  <>
                    <Text color="muted" textAlign="center">
                      Enter your new password below.
                    </Text>
                    
                    <FormControl>
                      <FormLabel htmlFor="password">New Password</FormLabel>
                      <InputGroup>
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter new password"
                          required
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            icon={showPassword ? <FiEyeOff /> : <FiEye />}
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormHelperText>
                        Password must be at least 8 characters long
                      </FormHelperText>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                      <InputGroup>
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          required
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                  </>
                )}
              </Stack>
              
              {!success && (
                <Button
                  type="submit"
                  colorScheme="secondary"
                  isLoading={isLoading}
                  loadingText="Resetting..."
                >
                  Reset Password
                </Button>
              )}
              
              <Stack spacing="3">
                <Link
                  as={RouterLink}
                  to="/login"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  color="secondary.500"
                  fontWeight="semibold"
                >
                  <FiArrowLeft style={{ marginRight: '0.5rem' }} />
                  Back to Login
                </Link>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
};

export default ResetPassword;
