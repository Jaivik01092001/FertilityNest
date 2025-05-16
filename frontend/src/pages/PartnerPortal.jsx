import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  Flex,
  Grid,
  GridItem,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  IconButton,
  Badge,
  Tooltip,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Divider,
  Avatar,
  Icon,
  PinInput,
  PinInputField,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiCalendar, 
  FiLink, 
  FiUnlink, 
  FiCopy, 
  FiHeart, 
  FiInfo,
  FiUser,
  FiUsers,
  FiMessageSquare,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PartnerPortal = () => {
  const { user, generatePartnerCode, linkPartner } = useAuth();
  const toast = useToast();
  
  const [partnerData, setPartnerData] = useState(null);
  const [partnerCode, setPartnerCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sharedEvents, setSharedEvents] = useState([]);
  const [supportTips, setSupportTips] = useState([]);
  const [error, setError] = useState('');
  
  // Modal controls
  const { 
    isOpen: isGenerateCodeModalOpen, 
    onOpen: onGenerateCodeModalOpen, 
    onClose: onGenerateCodeModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isEnterCodeModalOpen, 
    onOpen: onEnterCodeModalOpen, 
    onClose: onEnterCodeModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isUnlinkModalOpen, 
    onOpen: onUnlinkModalOpen, 
    onClose: onUnlinkModalClose 
  } = useDisclosure();
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Fetch partner data
  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        setIsLoading(true);
        
        const res = await axios.get(`${API_URL}/partners/info`);
        
        if (res.data.success) {
          setPartnerData(res.data.partnerData);
          
          // Fetch shared events if partner is linked
          if (res.data.partnerData) {
            const eventsRes = await axios.get(`${API_URL}/partners/events`);
            if (eventsRes.data.success) {
              setSharedEvents(eventsRes.data.events);
            }
            
            // Fetch support tips
            const tipsRes = await axios.get(`${API_URL}/partners/tips`);
            if (tipsRes.data.success) {
              setSupportTips(tipsRes.data.tips);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching partner data:', error);
        if (error.response?.status !== 404) {
          // Only show error if it's not a 404 (no partner linked)
          toast({
            title: 'Error fetching partner data',
            description: error.response?.data?.message || 'An error occurred',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPartnerData();
  }, [toast]);
  
  // Generate partner code
  const handleGenerateCode = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await generatePartnerCode();
      
      if (result.success) {
        setPartnerCode(result.data.code);
      } else {
        setError(result.error?.message || 'Failed to generate partner code');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Generate partner code error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Link partner with code
  const handleLinkPartner = async () => {
    if (!enteredCode || enteredCode.length !== 6) {
      setError('Please enter a valid 6-digit partner code');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const result = await linkPartner(enteredCode);
      
      if (result.success) {
        toast({
          title: 'Partner linked successfully!',
          description: 'You are now connected with your partner.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Refresh partner data
        const res = await axios.get(`${API_URL}/partners/info`);
        if (res.data.success) {
          setPartnerData(res.data.partnerData);
        }
        
        onEnterCodeModalClose();
      } else {
        setError(result.error?.message || 'Failed to link partner');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Link partner error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Unlink partner
  const handleUnlinkPartner = async () => {
    try {
      setIsLoading(true);
      
      const res = await axios.delete(`${API_URL}/partners/unlink`);
      
      if (res.data.success) {
        toast({
          title: 'Partner unlinked',
          description: 'You are no longer connected with your partner.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        
        setPartnerData(null);
        setSharedEvents([]);
        setSupportTips([]);
        onUnlinkModalClose();
      }
    } catch (error) {
      console.error('Error unlinking partner:', error);
      toast({
        title: 'Error unlinking partner',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Copy partner code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(partnerCode);
    toast({
      title: 'Code copied to clipboard',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Partner Portal</Heading>
        {partnerData ? (
          <Button
            leftIcon={<FiUnlink />}
            colorScheme="red"
            variant="outline"
            onClick={onUnlinkModalOpen}
          >
            Unlink Partner
          </Button>
        ) : (
          <HStack>
            <Button
              leftIcon={<FiLink />}
              colorScheme="secondary"
              onClick={onGenerateCodeModalOpen}
            >
              Generate Code
            </Button>
            <Button
              leftIcon={<FiUser />}
              colorScheme="blue"
              onClick={onEnterCodeModalOpen}
            >
              Enter Partner Code
            </Button>
          </HStack>
        )}
      </Flex>
      
      {partnerData ? (
        <Tabs colorScheme="secondary" variant="enclosed">
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Shared Calendar</Tab>
            <Tab>Support Tips</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              <Card bg={cardBg} boxShadow="md" borderRadius="lg" mb={6}>
                <CardBody>
                  <Flex 
                    direction={{ base: 'column', md: 'row' }} 
                    align={{ base: 'center', md: 'flex-start' }}
                    gap={6}
                  >
                    <Avatar 
                      size="xl" 
                      name={partnerData.name} 
                      src={partnerData.profilePicture}
                    />
                    
                    <Box flex={1}>
                      <Heading size="md" mb={2}>{partnerData.name}</Heading>
                      <Text color="gray.500" mb={4}>{partnerData.email}</Text>
                      
                      <HStack spacing={4} mb={4}>
                        <Badge colorScheme="green" p={1} borderRadius="md">
                          Connected
                        </Badge>
                        <Text fontSize="sm" color="gray.500">
                          Connected since {formatDate(partnerData.connectedSince)}
                        </Text>
                      </HStack>
                      
                      <Text>
                        You and your partner can now share fertility journey information, 
                        appointments, and receive personalized support tips.
                      </Text>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>
              
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                <Card bg={cardBg} boxShadow="md" borderRadius="lg">
                  <CardHeader pb={0}>
                    <Heading size="md">Upcoming Events</Heading>
                  </CardHeader>
                  
                  <CardBody>
                    {sharedEvents.length > 0 ? (
                      <VStack spacing={3} align="stretch">
                        {sharedEvents.slice(0, 3).map((event) => (
                          <Flex 
                            key={event._id} 
                            p={3} 
                            borderWidth="1px" 
                            borderRadius="md"
                            borderColor={borderColor}
                            align="center"
                          >
                            <Icon as={FiCalendar} color="secondary.500" boxSize={5} mr={3} />
                            <Box flex={1}>
                              <Text fontWeight="bold">{event.title}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {formatDate(event.date)}
                                {event.time && ` at ${event.time}`}
                              </Text>
                            </Box>
                            <Badge colorScheme={event.shared ? 'green' : 'gray'}>
                              {event.shared ? 'Shared' : 'Private'}
                            </Badge>
                          </Flex>
                        ))}
                      </VStack>
                    ) : (
                      <Text color="gray.500">No upcoming events.</Text>
                    )}
                  </CardBody>
                  
                  <CardFooter pt={0}>
                    <Button
                      leftIcon={<FiCalendar />}
                      colorScheme="secondary"
                      variant="outline"
                      size="sm"
                    >
                      View All Events
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card bg={cardBg} boxShadow="md" borderRadius="lg">
                  <CardHeader pb={0}>
                    <Heading size="md">Quick Actions</Heading>
                  </CardHeader>
                  
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      <Button
                        leftIcon={<FiCalendar />}
                        colorScheme="secondary"
                        variant="outline"
                        justifyContent="flex-start"
                      >
                        Schedule Shared Appointment
                      </Button>
                      
                      <Button
                        leftIcon={<FiMessageSquare />}
                        colorScheme="blue"
                        variant="outline"
                        justifyContent="flex-start"
                      >
                        Send Message
                      </Button>
                      
                      <Button
                        leftIcon={<FiUsers />}
                        colorScheme="green"
                        variant="outline"
                        justifyContent="flex-start"
                      >
                        Update Sharing Preferences
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </TabPanel>
            
            <TabPanel px={0}>
              <Card bg={cardBg} boxShadow="md" borderRadius="lg">
                <CardBody>
                  <Heading size="md" mb={4}>Shared Calendar</Heading>
                  
                  {sharedEvents.length > 0 ? (
                    <VStack spacing={4} align="stretch">
                      {sharedEvents.map((event) => (
                        <Flex 
                          key={event._id} 
                          p={4} 
                          borderWidth="1px" 
                          borderRadius="md"
                          borderColor={borderColor}
                        >
                          <Icon as={FiCalendar} color="secondary.500" boxSize={6} mr={4} />
                          <Box flex={1}>
                            <Flex justify="space-between" align="center" mb={1}>
                              <Heading size="sm">{event.title}</Heading>
                              <Badge colorScheme={event.shared ? 'green' : 'gray'}>
                                {event.shared ? 'Shared' : 'Private'}
                              </Badge>
                            </Flex>
                            <Text fontSize="sm" color="gray.500" mb={2}>
                              {formatDate(event.date)}
                              {event.time && ` at ${event.time}`}
                            </Text>
                            {event.location && (
                              <Text fontSize="sm">Location: {event.location}</Text>
                            )}
                            {event.notes && (
                              <Text fontSize="sm" mt={2}>{event.notes}</Text>
                            )}
                          </Box>
                        </Flex>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="gray.500" textAlign="center">
                      No shared events found. Add events to your calendar and share them with your partner.
                    </Text>
                  )}
                </CardBody>
                
                <CardFooter pt={0}>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="secondary"
                  >
                    Add New Event
                  </Button>
                </CardFooter>
              </Card>
            </TabPanel>
            
            <TabPanel px={0}>
              <Card bg={cardBg} boxShadow="md" borderRadius="lg">
                <CardBody>
                  <Heading size="md" mb={4}>Partner Support Tips</Heading>
                  
                  {supportTips.length > 0 ? (
                    <VStack spacing={4} align="stretch">
                      {supportTips.map((tip, index) => (
                        <Card key={index} variant="outline">
                          <CardBody>
                            <Flex align="flex-start" gap={3}>
                              <Icon 
                                as={tip.type === 'info' ? FiInfo : FiHeart} 
                                color={tip.type === 'info' ? 'blue.500' : 'secondary.500'} 
                                boxSize={5} 
                                mt={1}
                              />
                              <Box>
                                <Heading size="sm" mb={2}>{tip.title}</Heading>
                                <Text>{tip.content}</Text>
                              </Box>
                            </Flex>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="gray.500" textAlign="center">
                      No support tips available at the moment.
                    </Text>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : (
        <Card bg={cardBg} boxShadow="md" borderRadius="lg" p={6}>
          <CardBody>
            <VStack spacing={6} align="center">
              <Icon as={FiUsers} boxSize={16} color="secondary.400" />
              <Heading size="md" textAlign="center">Connect with Your Partner</Heading>
              <Text textAlign="center" color="gray.500">
                Share your fertility journey with your partner. Generate a code to invite them or enter their code to connect.
              </Text>
              <HStack spacing={4}>
                <Button
                  leftIcon={<FiLink />}
                  colorScheme="secondary"
                  onClick={onGenerateCodeModalOpen}
                >
                  Generate Code
                </Button>
                <Button
                  leftIcon={<FiUser />}
                  colorScheme="blue"
                  onClick={onEnterCodeModalOpen}
                >
                  Enter Partner Code
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      )}
      
      {/* Generate Code Modal */}
      <Modal isOpen={isGenerateCodeModalOpen} onClose={onGenerateCodeModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generate Partner Code</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {error && (
              <Alert status="error" mb={4} borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
            
            <Text mb={4}>
              Generate a unique code to share with your partner. They can use this code to connect with you.
            </Text>
            
            {partnerCode ? (
              <VStack spacing={4} align="center">
                <Heading size="lg" color="secondary.500">
                  {partnerCode}
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  This code will expire in 24 hours
                </Text>
                <Button
                  leftIcon={<FiCopy />}
                  onClick={handleCopyCode}
                  colorScheme="secondary"
                  width="full"
                >
                  Copy Code
                </Button>
              </VStack>
            ) : (
              <Button
                colorScheme="secondary"
                onClick={handleGenerateCode}
                isLoading={isLoading}
                width="full"
              >
                Generate Code
              </Button>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button onClick={onGenerateCodeModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Enter Code Modal */}
      <Modal isOpen={isEnterCodeModalOpen} onClose={onEnterCodeModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter Partner Code</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {error && (
              <Alert status="error" mb={4} borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
            
            <Text mb={4}>
              Enter the 6-digit code provided by your partner to connect with them.
            </Text>
            
            <VStack spacing={4} align="center">
              <HStack>
                <PinInput
                  otp
                  size="lg"
                  value={enteredCode}
                  onChange={setEnteredCode}
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
                colorScheme="blue"
                onClick={handleLinkPartner}
                isLoading={isLoading}
                width="full"
                isDisabled={enteredCode.length !== 6}
              >
                Connect with Partner
              </Button>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" onClick={onEnterCodeModalClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Unlink Partner Modal */}
      <Modal isOpen={isUnlinkModalOpen} onClose={onUnlinkModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Unlink Partner</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <Alert status="warning" mb={4} borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Warning!</AlertTitle>
                <AlertDescription>
                  This will remove the connection between you and your partner. Shared data will no longer be accessible.
                </AlertDescription>
              </Box>
            </Alert>
            
            <Text>
              Are you sure you want to unlink from {partnerData?.name}? This action cannot be undone.
            </Text>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUnlinkModalClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleUnlinkPartner}
              isLoading={isLoading}
            >
              Unlink Partner
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PartnerPortal;
