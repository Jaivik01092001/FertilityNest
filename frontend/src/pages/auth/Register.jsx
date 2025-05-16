import { useState } from 'react';
import {
  Box,
  Button,
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
  Select,
  FormHelperText,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    fertilityStage: '',
    journeyType: '',
    dateOfBirth: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Call register function from auth context
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        fertilityStage: formData.fertilityStage || undefined,
        journeyType: formData.journeyType || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
      });
      
      if (result.success) {
        // Show success toast
        toast({
          title: 'Account created successfully!',
          description: 'Please check your email to verify your account.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Redirect to verification page
        navigate('/verify-email');
      } else {
        setError(result.error?.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
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
                  Create your account
                </Heading>
                
                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}
                
                <FormControl isRequired>
                  <FormLabel htmlFor="name">Full Name</FormLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="********"
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
                  <FormHelperText>
                    Must be at least 6 characters long
                  </FormHelperText>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="********"
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="fertilityStage">Fertility Stage</FormLabel>
                  <Select
                    id="fertilityStage"
                    name="fertilityStage"
                    value={formData.fertilityStage}
                    onChange={handleChange}
                    placeholder="Select your fertility stage"
                  >
                    <option value="Trying to Conceive">Trying to Conceive</option>
                    <option value="IVF">IVF</option>
                    <option value="IUI">IUI</option>
                    <option value="PCOS Management">PCOS Management</option>
                    <option value="Pregnancy">Pregnancy</option>
                    <option value="Postpartum">Postpartum</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="journeyType">Journey Type</FormLabel>
                  <Select
                    id="journeyType"
                    name="journeyType"
                    value={formData.journeyType}
                    onChange={handleChange}
                    placeholder="Select your journey type"
                  >
                    <option value="Natural">Natural</option>
                    <option value="IVF">IVF</option>
                    <option value="IUI">IUI</option>
                    <option value="PCOS">PCOS</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="dateOfBirth">Date of Birth</FormLabel>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </FormControl>
              </Stack>
              
              <Stack spacing="4">
                <Button
                  type="submit"
                  colorScheme="secondary"
                  isLoading={isLoading}
                  loadingText="Creating account..."
                >
                  Create Account
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
                  Sign up with Google
                </Button>
              </Stack>
              
              <HStack spacing="1" justify="center">
                <Text color="muted">Already have an account?</Text>
                <Link
                  as={RouterLink}
                  to="/login"
                  color="secondary.500"
                  fontWeight="semibold"
                >
                  Log in
                </Link>
              </HStack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
};

export default Register;
