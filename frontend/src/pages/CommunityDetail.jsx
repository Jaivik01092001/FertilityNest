import { useState, useEffect, useRef } from 'react';
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
  Textarea,
  VStack,
  HStack,
  IconButton,
  Badge,
  Tooltip,
  useToast,
  Avatar,
  Divider,
  Tag,
  TagLabel,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Image,
  Switch,
  Checkbox,
  Icon,
  Wrap,
  WrapItem,
  Spinner,
} from '@chakra-ui/react';
import { 
  FiMessageCircle, 
  FiUsers, 
  FiInfo, 
  FiPlus, 
  FiMoreVertical, 
  FiHeart, 
  FiMessageSquare,
  FiTrash2,
  FiEdit2,
  FiFlag,
  FiLock,
  FiUnlock,
  FiShield,
  FiChevronLeft,
  FiSend,
  FiImage,
  FiPaperclip,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CommunityDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPostLoading, setIsPostLoading] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    isAnonymous: false,
    attachments: [],
  });
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Modal controls
  const { 
    isOpen: isNewPostModalOpen, 
    onOpen: onNewPostModalOpen, 
    onClose: onNewPostModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDeletePostModalOpen, 
    onOpen: onDeletePostModalOpen, 
    onClose: onDeletePostModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isLeaveCommunityModalOpen, 
    onOpen: onLeaveCommunityModalOpen, 
    onClose: onLeaveCommunityModalClose 
  } = useDisclosure();
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Fetch community data
  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch community details
        const communityRes = await axios.get(`${API_URL}/community/${id}`);
        if (communityRes.data.success) {
          setCommunity(communityRes.data.community);
        }
        
        // Fetch community posts
        const postsRes = await axios.get(`${API_URL}/community/${id}/posts`);
        if (postsRes.data.success) {
          setPosts(postsRes.data.posts);
        }
        
        // Fetch community members
        const membersRes = await axios.get(`${API_URL}/community/${id}/members`);
        if (membersRes.data.success) {
          setMembers(membersRes.data.members);
        }
      } catch (error) {
        console.error('Error fetching community data:', error);
        toast({
          title: 'Error fetching community data',
          description: error.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        
        // Redirect to communities page if community not found
        if (error.response?.status === 404) {
          navigate('/community');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCommunityData();
  }, [id, toast, navigate]);
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPost({
      ...newPost,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewPost({
      ...newPost,
      attachments: [...newPost.attachments, ...files],
    });
  };
  
  // Remove attachment
  const handleRemoveAttachment = (index) => {
    const updatedAttachments = [...newPost.attachments];
    updatedAttachments.splice(index, 1);
    setNewPost({
      ...newPost,
      attachments: updatedAttachments,
    });
  };
  
  // Create new post
  const handleCreatePost = async () => {
    if (!newPost.content.trim() && newPost.attachments.length === 0) {
      toast({
        title: 'Post content required',
        description: 'Please add some text or attachments to your post',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsPostLoading(true);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('content', newPost.content);
      formData.append('isAnonymous', newPost.isAnonymous);
      
      // Append attachments
      newPost.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
      
      const res = await axios.post(`${API_URL}/community/${id}/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (res.data.success) {
        toast({
          title: 'Post created',
          description: 'Your post has been published',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh posts
        const postsRes = await axios.get(`${API_URL}/community/${id}/posts`);
        if (postsRes.data.success) {
          setPosts(postsRes.data.posts);
        }
        
        // Reset form and close modal
        setNewPost({
          content: '',
          isAnonymous: false,
          attachments: [],
        });
        
        onNewPostModalClose();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error creating post',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsPostLoading(false);
    }
  };
  
  // Delete post
  const handleDeletePost = async () => {
    if (!selectedPost) return;
    
    try {
      setIsLoading(true);
      
      const res = await axios.delete(`${API_URL}/community/${id}/posts/${selectedPost._id}`);
      
      if (res.data.success) {
        toast({
          title: 'Post deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Remove post from state
        setPosts(posts.filter((post) => post._id !== selectedPost._id));
        onDeletePostModalClose();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error deleting post',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Like post
  const handleLikePost = async (postId) => {
    try {
      const res = await axios.post(`${API_URL}/community/${id}/posts/${postId}/like`);
      
      if (res.data.success) {
        // Update post in state
        setPosts(
          posts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  likes: res.data.liked
                    ? [...post.likes, user._id]
                    : post.likes.filter((id) => id !== user._id),
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: 'Error liking post',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Leave community
  const handleLeaveCommunity = async () => {
    try {
      setIsLoading(true);
      
      const res = await axios.post(`${API_URL}/community/${id}/leave`);
      
      if (res.data.success) {
        toast({
          title: 'Left community',
          description: 'You have successfully left the community',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Redirect to communities page
        navigate('/community');
      }
    } catch (error) {
      console.error('Error leaving community:', error);
      toast({
        title: 'Error leaving community',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Check if user is a member
  const isMember = () => {
    return members.some((member) => member._id === user?._id);
  };
  
  // Check if user is an admin
  const isAdmin = () => {
    return community?.admins.includes(user?._id);
  };
  
  // Check if user can delete a post
  const canDeletePost = (post) => {
    return post.author._id === user?._id || isAdmin();
  };
  
  if (isLoading && !community) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="secondary.500"
          size="xl"
        />
      </Flex>
    );
  }
  
  return (
    <Box>
      {community && (
        <>
          {/* Community Header */}
          <Box
            position="relative"
            height="200px"
            mb={6}
            borderRadius="lg"
            overflow="hidden"
            bg={useColorModeValue('gray.200', 'gray.700')}
          >
            {community.coverImage && (
              <Image
                src={community.coverImage}
                alt={community.name}
                objectFit="cover"
                w="100%"
                h="100%"
              />
            )}
            
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              p={4}
              bg="rgba(0, 0, 0, 0.6)"
              color="white"
            >
              <Flex 
                justify="space-between" 
                align={{ base: 'flex-start', md: 'center' }}
                direction={{ base: 'column', md: 'row' }}
                gap={2}
              >
                <HStack>
                  <Avatar 
                    src={community.avatar} 
                    name={community.name} 
                    size="md"
                    bg="secondary.500"
                  />
                  <Box>
                    <Flex align="center">
                      <Heading size="md">{community.name}</Heading>
                      {community.isVerified && (
                        <Tooltip label="Verified Community">
                          <Icon as={FiShield} color="green.300" ml={2} />
                        </Tooltip>
                      )}
                    </Flex>
                    <HStack>
                      <Icon as={FiUsers} boxSize={3} />
                      <Text fontSize="sm">{community.memberCount} members</Text>
                      <Icon as={community.isPrivate ? FiLock : FiUnlock} boxSize={3} ml={2} />
                      <Text fontSize="sm">{community.isPrivate ? 'Private' : 'Public'}</Text>
                    </HStack>
                  </Box>
                </HStack>
                
                <HStack>
                  <Button
                    as={RouterLink}
                    to="/community"
                    leftIcon={<FiChevronLeft />}
                    colorScheme="whiteAlpha"
                    size="sm"
                  >
                    Back to Communities
                  </Button>
                  
                  {isMember() ? (
                    <Button
                      colorScheme="red"
                      variant="outline"
                      size="sm"
                      onClick={onLeaveCommunityModalOpen}
                    >
                      Leave Community
                    </Button>
                  ) : (
                    <Button
                      colorScheme="secondary"
                      size="sm"
                    >
                      Join Community
                    </Button>
                  )}
                </HStack>
              </Flex>
            </Box>
          </Box>
          
          <Tabs colorScheme="secondary" variant="enclosed" mb={6}>
            <TabList>
              <Tab>Posts</Tab>
              <Tab>About</Tab>
              <Tab>Members</Tab>
            </TabList>
            
            <TabPanels>
              {/* Posts Tab */}
              <TabPanel px={0}>
                <Flex justify="flex-end" mb={4}>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="secondary"
                    onClick={onNewPostModalOpen}
                    isDisabled={!isMember()}
                  >
                    New Post
                  </Button>
                </Flex>
                
                {posts.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {posts.map((post) => (
                      <Card key={post._id} bg={cardBg} boxShadow="md" borderRadius="lg">
                        <CardHeader pb={2}>
                          <Flex justify="space-between" align="center">
                            <HStack>
                              {post.isAnonymous ? (
                                <Avatar bg="gray.500" icon={<FiEyeOff fontSize="1.5rem" />} />
                              ) : (
                                <Avatar 
                                  name={post.author.name} 
                                  src={post.author.profilePicture}
                                />
                              )}
                              <Box>
                                <Text fontWeight="bold">
                                  {post.isAnonymous ? 'Anonymous' : post.author.name}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {formatDate(post.createdAt)}
                                </Text>
                              </Box>
                            </HStack>
                            
                            {canDeletePost(post) && (
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
                                    onClick={() => {
                                      setSelectedPost(post);
                                      onDeletePostModalOpen();
                                    }}
                                  >
                                    Delete Post
                                  </MenuItem>
                                  <MenuItem icon={<FiFlag />}>Report Post</MenuItem>
                                </MenuList>
                              </Menu>
                            )}
                          </Flex>
                        </CardHeader>
                        
                        <CardBody py={2}>
                          <Text mb={4}>{post.content}</Text>
                          
                          {post.attachments && post.attachments.length > 0 && (
                            <Grid 
                              templateColumns={`repeat(${Math.min(post.attachments.length, 3)}, 1fr)`} 
                              gap={2}
                              mb={4}
                            >
                              {post.attachments.map((attachment, index) => (
                                <Image
                                  key={index}
                                  src={attachment.url}
                                  alt={`Attachment ${index + 1}`}
                                  borderRadius="md"
                                  objectFit="cover"
                                  height="200px"
                                />
                              ))}
                            </Grid>
                          )}
                          
                          <Divider my={2} />
                          
                          <Flex justify="space-between" align="center">
                            <HStack>
                              <Button
                                leftIcon={<FiHeart />}
                                size="sm"
                                variant="ghost"
                                colorScheme={post.likes.includes(user?._id) ? 'red' : 'gray'}
                                onClick={() => handleLikePost(post._id)}
                                isDisabled={!isMember()}
                              >
                                {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                              </Button>
                              
                              <Button
                                leftIcon={<FiMessageSquare />}
                                size="sm"
                                variant="ghost"
                                colorScheme="gray"
                                isDisabled={!isMember()}
                              >
                                {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                              </Button>
                            </HStack>
                            
                            {post.tags && post.tags.length > 0 && (
                              <Wrap spacing={2}>
                                {post.tags.map((tag, index) => (
                                  <WrapItem key={index}>
                                    <Tag size="sm" colorScheme="secondary" borderRadius="full">
                                      <TagLabel>{tag}</TagLabel>
                                    </Tag>
                                  </WrapItem>
                                ))}
                              </Wrap>
                            )}
                          </Flex>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                ) : (
                  <Card bg={cardBg} boxShadow="md" borderRadius="lg" p={6}>
                    <CardBody>
                      <VStack spacing={4} align="center">
                        <Icon as={FiMessageCircle} boxSize={12} color="gray.400" />
                        <Text color="gray.500" textAlign="center">
                          No posts in this community yet. Be the first to start a conversation!
                        </Text>
                        {isMember() && (
                          <Button
                            leftIcon={<FiPlus />}
                            colorScheme="secondary"
                            onClick={onNewPostModalOpen}
                          >
                            Create First Post
                          </Button>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </TabPanel>
              
              {/* About Tab */}
              <TabPanel px={0}>
                <Card bg={cardBg} boxShadow="md" borderRadius="lg">
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md">About {community.name}</Heading>
                      <Text>{community.description}</Text>
                      
                      <Divider />
                      
                      <Box>
                        <Heading size="sm" mb={2}>Community Tags</Heading>
                        <Wrap spacing={2}>
                          {community.tags.map((tag, index) => (
                            <WrapItem key={index}>
                              <Tag colorScheme="secondary" borderRadius="full">
                                <TagLabel>{tag}</TagLabel>
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </Box>
                      
                      <Divider />
                      
                      <Box>
                        <Heading size="sm" mb={2}>Community Rules</Heading>
                        {community.rules && community.rules.length > 0 ? (
                          <VStack align="stretch" spacing={2}>
                            {community.rules.map((rule, index) => (
                              <Box key={index} p={3} borderWidth="1px" borderRadius="md">
                                <Text fontWeight="bold">Rule {index + 1}: {rule.title}</Text>
                                <Text fontSize="sm">{rule.description}</Text>
                              </Box>
                            ))}
                          </VStack>
                        ) : (
                          <Text color="gray.500">No specific rules have been set for this community.</Text>
                        )}
                      </Box>
                      
                      <Divider />
                      
                      <Box>
                        <Heading size="sm" mb={2}>Community Information</Heading>
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                          <Box>
                            <Text fontWeight="bold">Created</Text>
                            <Text>{formatDate(community.createdAt)}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Members</Text>
                            <Text>{community.memberCount}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Privacy</Text>
                            <Text>{community.isPrivate ? 'Private Community' : 'Public Community'}</Text>
                          </Box>
                          <Box>
                            <Text fontWeight="bold">Verification</Text>
                            <Text>{community.isVerified ? 'Verified Community' : 'Standard Community'}</Text>
                          </Box>
                        </Grid>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
              
              {/* Members Tab */}
              <TabPanel px={0}>
                <Card bg={cardBg} boxShadow="md" borderRadius="lg">
                  <CardBody>
                    <Heading size="md" mb={4}>Community Members</Heading>
                    
                    {members.length > 0 ? (
                      <Grid 
                        templateColumns={{ 
                          base: 'repeat(2, 1fr)', 
                          md: 'repeat(3, 1fr)', 
                          lg: 'repeat(4, 1fr)' 
                        }} 
                        gap={4}
                      >
                        {members.map((member) => (
                          <Flex 
                            key={member._id} 
                            direction="column" 
                            align="center" 
                            p={3} 
                            borderWidth="1px" 
                            borderRadius="md"
                            borderColor={borderColor}
                          >
                            <Avatar 
                              name={member.name} 
                              src={member.profilePicture} 
                              size="md" 
                              mb={2}
                            />
                            <Text fontWeight="bold" textAlign="center">{member.name}</Text>
                            {community.admins.includes(member._id) && (
                              <Badge colorScheme="purple" mt={1}>Admin</Badge>
                            )}
                            {community.moderators.includes(member._id) && (
                              <Badge colorScheme="blue" mt={1}>Moderator</Badge>
                            )}
                          </Flex>
                        ))}
                      </Grid>
                    ) : (
                      <Text color="gray.500" textAlign="center">
                        No members found in this community.
                      </Text>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
          
          {/* New Post Modal */}
          <Modal isOpen={isNewPostModalOpen} onClose={onNewPostModalClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Create New Post</ModalHeader>
              <ModalCloseButton />
              
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <Textarea
                      name="content"
                      value={newPost.content}
                      onChange={handleInputChange}
                      placeholder="What's on your mind?"
                      rows={5}
                    />
                  </FormControl>
                  
                  {newPost.attachments.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" mb={2}>Attachments:</Text>
                      <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                        {newPost.attachments.map((file, index) => (
                          <Box 
                            key={index} 
                            position="relative" 
                            borderWidth="1px" 
                            borderRadius="md"
                            p={2}
                          >
                            <Text fontSize="sm" noOfLines={1}>{file.name}</Text>
                            <IconButton
                              aria-label="Remove attachment"
                              icon={<FiTrash2 />}
                              size="xs"
                              position="absolute"
                              top={1}
                              right={1}
                              colorScheme="red"
                              onClick={() => handleRemoveAttachment(index)}
                            />
                          </Box>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  
                  <HStack>
                    <Button
                      leftIcon={<FiImage />}
                      onClick={() => fileInputRef.current.click()}
                      colorScheme="blue"
                      variant="outline"
                      size="sm"
                    >
                      Add Images
                    </Button>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      ref={fileInputRef}
                      display="none"
                      onChange={handleFileUpload}
                    />
                    
                    <FormControl display="flex" alignItems="center">
                      <Checkbox
                        name="isAnonymous"
                        isChecked={newPost.isAnonymous}
                        onChange={handleInputChange}
                        colorScheme="secondary"
                      >
                        Post anonymously
                      </Checkbox>
                    </FormControl>
                  </HStack>
                </VStack>
              </ModalBody>
              
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onNewPostModalClose}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="secondary" 
                  leftIcon={<FiSend />}
                  onClick={handleCreatePost}
                  isLoading={isPostLoading}
                >
                  Post
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          
          {/* Delete Post Modal */}
          <Modal isOpen={isDeletePostModalOpen} onClose={onDeletePostModalClose} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Delete Post</ModalHeader>
              <ModalCloseButton />
              
              <ModalBody>
                <Text>
                  Are you sure you want to delete this post? This action cannot be undone.
                </Text>
              </ModalBody>
              
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onDeletePostModalClose}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={handleDeletePost}
                  isLoading={isLoading}
                >
                  Delete
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          
          {/* Leave Community Modal */}
          <Modal isOpen={isLeaveCommunityModalOpen} onClose={onLeaveCommunityModalClose} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Leave Community</ModalHeader>
              <ModalCloseButton />
              
              <ModalBody>
                <Text>
                  Are you sure you want to leave the {community.name} community? You can always join again later.
                </Text>
              </ModalBody>
              
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onLeaveCommunityModalClose}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={handleLeaveCommunity}
                  isLoading={isLoading}
                >
                  Leave Community
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </Box>
  );
};

export default CommunityDetail;
