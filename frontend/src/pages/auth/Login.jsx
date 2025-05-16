import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Link,
  Stack,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Call login function from auth context
      const result = await login(email, password);
      
      if (result.success) {
        // Redirect to dashboard
        navigate('/');
      } else {
        setError(result.error?.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
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
                  Log in to your account
                </Heading>
                
                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}
                
                <FormControl>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <InputGroup>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </InputGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      required
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              </Stack>
              
              <HStack justify="space-between">
                <Checkbox
                  isChecked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                >
                  Remember me
                </Checkbox>
                <Link
                  as={RouterLink}
                  to="/forgot-password"
                  color="secondary.500"
                  fontWeight="semibold"
                  fontSize="sm"
                >
                  Forgot password?
                </Link>
              </HStack>
              
              <Stack spacing="4">
                <Button
                  type="submit"
                  colorScheme="secondary"
                  isLoading={isLoading}
                  loadingText="Logging in..."
                >
                  Sign in
                </Button>
                
                <HStack>
                  <Divider />
                  <Text fontSize="sm" color="muted">
                    OR
                  </Text>
                  <Divider />
                </HStack>
                
                <Button
                  variant="outline"
                  leftIcon={<FcGoogle />}
                  isDisabled={isLoading}
                >
                  Continue with Google
                </Button>
              </Stack>
              
              <HStack spacing="1" justify="center">
                <Text color="muted">Don't have an account?</Text>
                <Link
                  as={RouterLink}
                  to="/register"
                  color="secondary.500"
                  fontWeight="semibold"
                >
                  Sign up
                </Link>
              </HStack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
};

export default Login;
