import { useState } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Textarea,
  useDisclosure,
  VStack,
  HStack,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FiAlertTriangle } from 'react-icons/fi';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const DistressButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { sendDistressSignal } = useNotifications();
  const { user } = useAuth();
  const toast = useToast();
  
  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          
          toast({
            title: 'Location obtained',
            description: 'Your current location will be shared with your emergency contacts.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Location error',
            description: 'Unable to get your current location. Your emergency contacts will still be notified.',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
        }
      );
    } else {
      toast({
        title: 'Location not supported',
        description: 'Your browser does not support geolocation. Your emergency contacts will still be notified.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle send distress signal
  const handleSendDistressSignal = async () => {
    try {
      setIsLoading(true);
      
      // Send distress signal
      await sendDistressSignal(message, location);
      
      // Close modal
      onClose();
      setMessage('');
      setLocation(null);
      
      // Show success toast
      toast({
        title: 'Distress Signal Sent',
        description: 'Your emergency contacts have been notified.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error sending distress signal:', error);
      
      // Show error toast
      toast({
        title: 'Error Sending Distress Signal',
        description: 'Please try again or call emergency services directly.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if user has emergency contacts or partner
  const hasEmergencyContacts = user?.emergencyContacts?.length > 0 || user?.partnerId;
  
  return (
    <>
      {/* Distress Button */}
      <Box
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex={100}
      >
        <Button
          onClick={onOpen}
          colorScheme="red"
          size="lg"
          borderRadius="full"
          boxShadow="lg"
          leftIcon={<Icon as={FiAlertTriangle} />}
        >
          Distress
        </Button>
      </Box>
      
      {/* Distress Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="red.500" color="white" borderTopRadius="md">
            <HStack>
              <Icon as={FiAlertTriangle} />
              <Text>Distress Signal</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <Text>
                This will send an urgent notification to your emergency contacts
                {user?.partnerId ? ' and your partner' : ''}.
              </Text>
              
              {!hasEmergencyContacts && (
                <Text color="orange.500" fontWeight="bold">
                  Warning: You haven't set up any emergency contacts yet. 
                  Please add emergency contacts in your profile settings.
                </Text>
              )}
              
              <Textarea
                placeholder="Add a message for your emergency contacts (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                resize="vertical"
                rows={4}
              />
              
              <Button
                onClick={getCurrentLocation}
                colorScheme="blue"
                variant="outline"
                isDisabled={!!location}
              >
                {location ? 'Location Obtained' : 'Share My Current Location'}
              </Button>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleSendDistressSignal}
              isLoading={isLoading}
              loadingText="Sending..."
              isDisabled={!hasEmergencyContacts}
            >
              Send Distress Signal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DistressButton;
