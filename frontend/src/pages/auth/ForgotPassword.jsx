import { useState } from 'react';
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
  InputLeftElement,
  Icon,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { forgotPassword } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const result = await forgotPassword(email);
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error?.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Forgot password error:', err);
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
                  Forgot Password
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
                    Password reset email sent! Please check your inbox for instructions to reset your password.
                  </Alert>
                ) : (
                  <>
                    <Text color="muted" textAlign="center">
                      Enter your email address and we'll send you a link to reset your password.
                    </Text>
                    
                    <FormControl>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiMail} color="gray.400" />
                        </InputLeftElement>
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
                  </>
                )}
              </Stack>
              
              {!success && (
                <Button
                  type="submit"
                  colorScheme="secondary"
                  isLoading={isLoading}
                  loadingText="Sending..."
                >
                  Send Reset Link
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
                  <Icon as={FiArrowLeft} mr={1} />
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

export default ForgotPassword;
