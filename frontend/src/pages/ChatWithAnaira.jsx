import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Input,
  VStack,
  HStack,
  Avatar,
  IconButton,
  useColorModeValue,
  Divider,
  Badge,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  useToast,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { 
  FiSend, 
  FiMoreVertical, 
  FiTrash2, 
  FiPlus, 
  FiEdit2, 
  FiMessageCircle,
  FiHeart,
  FiInfo,
  FiChevronDown,
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ChatWithAnaira = () => {
  const { user } = useAuth();
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  
  // Modal controls
  const { 
    isOpen: isNewSessionModalOpen, 
    onOpen: onNewSessionModalOpen, 
    onClose: onNewSessionModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDeleteModalOpen, 
    onOpen: onDeleteModalOpen, 
    onClose: onDeleteModalClose 
  } = useDisclosure();
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const userBubbleBg = useColorModeValue('secondary.100', 'secondary.900');
  const aiBubbleBg = useColorModeValue('blue.100', 'blue.900');
  const sidebarBg = useColorModeValue('gray.50', 'gray.900');
  
  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    
    // Listen for new messages
    socketRef.current.on('new-message', (message) => {
      if (message.sessionId === currentSession?._id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentSession]);
  
  // Fetch chat sessions
  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        setIsLoading(true);
        
        const res = await axios.get(`${API_URL}/chat/sessions`);
        
        if (res.data.success) {
          setChatSessions(res.data.sessions);
          
          // Set current session to the most recent one if available
          if (res.data.sessions.length > 0 && !currentSession) {
            setCurrentSession(res.data.sessions[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching chat sessions:', error);
        toast({
          title: 'Error fetching chat sessions',
          description: error.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChatSessions();
  }, [toast]);
  
  // Fetch messages for current session
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentSession) return;
      
      try {
        setIsLoading(true);
        
        const res = await axios.get(`${API_URL}/chat/messages/${currentSession._id}`);
        
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error fetching messages',
          description: error.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
  }, [currentSession, toast]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Create new chat session
  const handleCreateSession = async () => {
    try {
      setIsLoading(true);
      
      const res = await axios.post(`${API_URL}/chat/sessions`, {
        title: sessionTitle || `Chat Session - ${new Date().toLocaleDateString()}`,
      });
      
      if (res.data.success) {
        toast({
          title: 'New chat session created',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Add new session to list and set as current
        const newSession = res.data.session;
        setChatSessions([newSession, ...chatSessions]);
        setCurrentSession(newSession);
        setMessages([]);
        
        onNewSessionModalClose();
      }
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast({
        title: 'Error creating chat session',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setSessionTitle('');
    }
  };
  
  // Delete chat session
  const handleDeleteSession = async () => {
    if (!currentSession) return;
    
    try {
      setIsLoading(true);
      
      const res = await axios.delete(`${API_URL}/chat/sessions/${currentSession._id}`);
      
      if (res.data.success) {
        toast({
          title: 'Chat session deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Remove deleted session and set new current session
        const updatedSessions = chatSessions.filter(
          (session) => session._id !== currentSession._id
        );
        setChatSessions(updatedSessions);
        
        if (updatedSessions.length > 0) {
          setCurrentSession(updatedSessions[0]);
        } else {
          setCurrentSession(null);
          setMessages([]);
        }
        
        onDeleteModalClose();
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
      toast({
        title: 'Error deleting chat session',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentSession) return;
    
    try {
      setIsSending(true);
      
      // Add user message to UI immediately
      const userMessage = {
        _id: Date.now().toString(),
        sender: 'user',
        content: newMessage,
        timestamp: new Date().toISOString(),
        sessionId: currentSession._id,
      };
      
      setMessages([...messages, userMessage]);
      setNewMessage('');
      
      // Send message to server
      const res = await axios.post(`${API_URL}/chat/messages`, {
        sessionId: currentSession._id,
        content: newMessage,
      });
      
      if (res.data.success) {
        // Add AI response when it comes back
        setMessages((prevMessages) => [...prevMessages, res.data.aiResponse]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSending(false);
      
      // Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };
  
  // Get emotion badge color
  const getEmotionColor = (emotion) => {
    switch (emotion) {
      case 'happy':
        return 'green';
      case 'sad':
        return 'blue';
      case 'angry':
        return 'red';
      case 'anxious':
        return 'yellow';
      case 'neutral':
        return 'gray';
      default:
        return 'gray';
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <Flex h="calc(100vh - 100px)" direction={{ base: 'column', md: 'row' }}>
      {/* Sidebar - Chat Sessions */}
      <Box
        w={{ base: 'full', md: '250px' }}
        h={{ base: '200px', md: 'full' }}
        bg={sidebarBg}
        p={4}
        overflowY="auto"
        borderRight="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Chat Sessions</Heading>
          <IconButton
            aria-label="New chat"
            icon={<FiPlus />}
            size="sm"
            colorScheme="blue"
            onClick={onNewSessionModalOpen}
          />
        </Flex>
        
        <VStack spacing={2} align="stretch">
          {chatSessions.length > 0 ? (
            chatSessions.map((session) => (
              <Button
                key={session._id}
                variant={currentSession?._id === session._id ? 'solid' : 'ghost'}
                colorScheme={currentSession?._id === session._id ? 'blue' : 'gray'}
                justifyContent="flex-start"
                leftIcon={<FiMessageCircle />}
                size="sm"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                onClick={() => setCurrentSession(session)}
              >
                {session.title}
              </Button>
            ))
          ) : (
            <Text color="gray.500" fontSize="sm" textAlign="center">
              No chat sessions yet. Start a new conversation!
            </Text>
          )}
        </VStack>
      </Box>
      
      {/* Main Chat Area */}
      <Flex flex={1} direction="column" h="full">
        {/* Chat Header */}
        <Flex
          p={4}
          borderBottom="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          justify="space-between"
          align="center"
        >
          <HStack>
            <Avatar 
              name="Anaira" 
              src="/anaira-avatar.png" 
              size="sm" 
              bg="blue.500"
            />
            <Box>
              <Heading size="md">Anaira</Heading>
              <Text fontSize="xs" color="gray.500">
                Your AI Fertility Companion
              </Text>
            </Box>
          </HStack>
          
          {currentSession && (
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
              />
              <MenuList>
                <MenuItem 
                  icon={<FiTrash2 />} 
                  color="red.500"
                  onClick={onDeleteModalOpen}
                >
                  Delete Conversation
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
        
        {/* Messages Area */}
        <Box 
          flex={1} 
          p={4} 
          overflowY="auto" 
          bg={useColorModeValue('gray.50', 'gray.900')}
        >
          {currentSession ? (
            <>
              {messages.length > 0 ? (
                <VStack spacing={4} align="stretch">
                  {messages.map((message) => (
                    <Flex
                      key={message._id}
                      justify={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                    >
                      {message.sender !== 'user' && (
                        <Avatar 
                          name="Anaira" 
                          src="/anaira-avatar.png" 
                          size="sm" 
                          mr={2}
                          bg="blue.500"
                        />
                      )}
                      
                      <Box
                        maxW={{ base: '80%', md: '70%' }}
                        bg={message.sender === 'user' ? userBubbleBg : aiBubbleBg}
                        color={useColorModeValue('gray.800', 'white')}
                        p={3}
                        borderRadius="lg"
                        borderTopRightRadius={message.sender === 'user' ? 0 : 'lg'}
                        borderTopLeftRadius={message.sender === 'user' ? 'lg' : 0}
                      >
                        <Text>{message.content}</Text>
                        
                        <Flex justify="space-between" align="center" mt={1}>
                          <Text fontSize="xs" color="gray.500">
                            {formatTime(message.timestamp)}
                          </Text>
                          
                          {message.emotionDetected && (
                            <Tooltip label={`Detected emotion: ${message.emotionDetected}`}>
                              <Badge 
                                size="sm" 
                                colorScheme={getEmotionColor(message.emotionDetected)}
                                ml={2}
                              >
                                {message.emotionDetected}
                              </Badge>
                            </Tooltip>
                          )}
                        </Flex>
                      </Box>
                      
                      {message.sender === 'user' && (
                        <Avatar 
                          name={user?.name} 
                          src={user?.profilePicture} 
                          size="sm" 
                          ml={2}
                        />
                      )}
                    </Flex>
                  ))}
                  <div ref={messagesEndRef} />
                </VStack>
              ) : (
                <VStack spacing={4} justify="center" h="full">
                  <Avatar 
                    name="Anaira" 
                    src="/anaira-avatar.png" 
                    size="xl" 
                    bg="blue.500"
                  />
                  <Heading size="md">Welcome to Anaira</Heading>
                  <Text textAlign="center" color="gray.500">
                    Your AI companion on your fertility journey. Ask me anything about fertility, 
                    treatments, or just chat if you need emotional support.
                  </Text>
                  <HStack>
                    <Button 
                      leftIcon={<FiInfo />} 
                      colorScheme="blue" 
                      variant="outline"
                      size="sm"
                      onClick={() => setNewMessage("What can you help me with?")}
                    >
                      What can you help me with?
                    </Button>
                    <Button 
                      leftIcon={<FiHeart />} 
                      colorScheme="secondary" 
                      variant="outline"
                      size="sm"
                      onClick={() => setNewMessage("I'm feeling anxious about my fertility journey.")}
                    >
                      I'm feeling anxious
                    </Button>
                  </HStack>
                </VStack>
              )}
            </>
          ) : (
            <Card bg={cardBg} boxShadow="md" borderRadius="lg" p={6}>
              <CardBody>
                <VStack spacing={4} align="center">
                  <Avatar 
                    name="Anaira" 
                    src="/anaira-avatar.png" 
                    size="xl" 
                    bg="blue.500"
                  />
                  <Heading size="md">Start a New Conversation</Heading>
                  <Text textAlign="center" color="gray.500">
                    Create a new chat session to start talking with Anaira, your AI fertility companion.
                  </Text>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    onClick={onNewSessionModalOpen}
                  >
                    New Conversation
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}
        </Box>
        
        {/* Message Input */}
        {currentSession && (
          <Flex 
            p={4} 
            borderTop="1px" 
            borderColor={useColorModeValue('gray.200', 'gray.700')}
          >
            <Input
              ref={inputRef}
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              mr={2}
            />
            <Button
              colorScheme="blue"
              onClick={handleSendMessage}
              isLoading={isSending}
              loadingText="Sending"
              leftIcon={<FiSend />}
            >
              Send
            </Button>
          </Flex>
        )}
      </Flex>
      
      {/* New Session Modal */}
      <Modal isOpen={isNewSessionModalOpen} onClose={onNewSessionModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Start New Conversation</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <FormControl>
              <Input
                placeholder="Conversation title (optional)"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onNewSessionModalClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleCreateSession}
              isLoading={isLoading}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Conversation</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <Text>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </Text>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteModalClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDeleteSession}
              isLoading={isLoading}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default ChatWithAnaira;
