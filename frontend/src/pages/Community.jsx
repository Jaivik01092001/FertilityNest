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
  InputGroup,
  InputLeftElement,
  Icon,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  Divider,
  Tag,
  TagLabel,
  TagLeftIcon,
  Wrap,
  WrapItem,
  SimpleGrid,
  Image,
} from '@chakra-ui/react';
import { 
  FiSearch, 
  FiUsers, 
  FiHeart, 
  FiMessageCircle, 
  FiPlus,
  FiChevronRight,
  FiStar,
  FiShield,
  FiLock,
  FiUnlock,
  FiUserPlus,
} from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Community = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [communities, setCommunities] = useState([]);
  const [featuredCommunities, setFeaturedCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Fetch communities
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all communities
        const allCommunitiesRes = await axios.get(`${API_URL}/community`);
        if (allCommunitiesRes.data.success) {
          setCommunities(allCommunitiesRes.data.communities);
          
          // Extract featured communities
          const featured = allCommunitiesRes.data.communities.filter(
            (community) => community.isFeatured
          );
          setFeaturedCommunities(featured);
        }
        
        // Fetch user's communities
        const myCommunitiesRes = await axios.get(`${API_URL}/community/my-communities`);
        if (myCommunitiesRes.data.success) {
          setMyCommunities(myCommunitiesRes.data.communities);
        }
      } catch (error) {
        console.error('Error fetching communities:', error);
        toast({
          title: 'Error fetching communities',
          description: error.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCommunities();
  }, [toast]);
  
  // Filter communities based on search query
  const filteredCommunities = communities.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Join community
  const handleJoinCommunity = async (communityId) => {
    try {
      setIsLoading(true);
      
      const res = await axios.post(`${API_URL}/community/${communityId}/join`);
      
      if (res.data.success) {
        toast({
          title: 'Joined community',
          description: 'You have successfully joined the community',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Refresh communities
        const myCommunitiesRes = await axios.get(`${API_URL}/community/my-communities`);
        if (myCommunitiesRes.data.success) {
          setMyCommunities(myCommunitiesRes.data.communities);
        }
      }
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: 'Error joining community',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format member count
  const formatMemberCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count;
  };
  
  // Check if user is a member of a community
  const isMember = (communityId) => {
    return myCommunities.some((community) => community._id === communityId);
  };
  
  return (
    <Box>
      <Flex 
        justify="space-between" 
        align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        mb={6}
        gap={4}
      >
        <Heading size="lg">Community Circles</Heading>
        
        <InputGroup maxW={{ base: 'full', md: '300px' }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </Flex>
      
      {/* My Communities */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">My Communities</Heading>
          <Button
            as={RouterLink}
            to="/community/create"
            leftIcon={<FiPlus />}
            colorScheme="secondary"
            size="sm"
          >
            Create Community
          </Button>
        </Flex>
        
        {myCommunities.length > 0 ? (
          <Grid 
            templateColumns={{ 
              base: '1fr', 
              md: 'repeat(2, 1fr)', 
              lg: 'repeat(3, 1fr)' 
            }} 
            gap={4}
          >
            {myCommunities.map((community) => (
              <Card 
                key={community._id} 
                bg={cardBg} 
                boxShadow="md" 
                borderRadius="lg"
                as={RouterLink}
                to={`/community/${community._id}`}
                _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s' }}
              >
                <CardBody>
                  <Flex direction="column" height="100%">
                    <Flex align="center" mb={3}>
                      <Avatar 
                        src={community.avatar} 
                        name={community.name} 
                        size="md" 
                        mr={3}
                        bg="secondary.500"
                      />
                      <Box>
                        <Heading size="sm" mb={1}>{community.name}</Heading>
                        <HStack>
                          <Icon as={FiUsers} color="gray.500" boxSize={3} />
                          <Text fontSize="xs" color="gray.500">
                            {formatMemberCount(community.memberCount)} members
                          </Text>
                        </HStack>
                      </Box>
                    </Flex>
                    
                    <Text fontSize="sm" noOfLines={2} mb={3}>
                      {community.description}
                    </Text>
                    
                    <Wrap spacing={2} mb={3}>
                      {community.tags.slice(0, 3).map((tag, index) => (
                        <WrapItem key={index}>
                          <Tag size="sm" colorScheme="secondary" borderRadius="full">
                            <TagLabel>{tag}</TagLabel>
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                    
                    <Flex justify="space-between" align="center" mt="auto">
                      <HStack>
                        <Icon 
                          as={community.isPrivate ? FiLock : FiUnlock} 
                          color="gray.500" 
                          boxSize={3} 
                        />
                        <Text fontSize="xs" color="gray.500">
                          {community.isPrivate ? 'Private' : 'Public'}
                        </Text>
                      </HStack>
                      
                      <HStack>
                        <Icon as={FiMessageCircle} color="gray.500" boxSize={3} />
                        <Text fontSize="xs" color="gray.500">
                          {community.postCount} posts
                        </Text>
                      </HStack>
                    </Flex>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </Grid>
        ) : (
          <Card bg={cardBg} boxShadow="md" borderRadius="lg" p={6}>
            <CardBody>
              <VStack spacing={4} align="center">
                <Icon as={FiUsers} boxSize={12} color="gray.400" />
                <Text color="gray.500" textAlign="center">
                  You haven't joined any communities yet. Explore the communities below and join ones that interest you.
                </Text>
                <Button
                  leftIcon={<FiSearch />}
                  colorScheme="secondary"
                  onClick={() => setSearchQuery('')}
                >
                  Explore Communities
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}
      </Box>
      
      {/* Featured Communities */}
      {featuredCommunities.length > 0 && (
        <Box mb={8}>
          <Heading size="md" mb={4}>Featured Communities</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {featuredCommunities.slice(0, 2).map((community) => (
              <Card 
                key={community._id} 
                direction={{ base: 'column', sm: 'row' }}
                overflow="hidden"
                variant="outline"
                bg={cardBg}
                boxShadow="md"
                borderRadius="lg"
              >
                <Image
                  objectFit="cover"
                  maxW={{ base: '100%', sm: '200px' }}
                  src={community.coverImage || 'https://via.placeholder.com/200x200?text=Community'}
                  alt={community.name}
                />
                
                <CardBody>
                  <Flex direction="column" height="100%">
                    <Flex align="center" mb={2}>
                      <Heading size="md">{community.name}</Heading>
                      {community.isVerified && (
                        <Tooltip label="Verified Community">
                          <Icon as={FiShield} color="green.500" ml={2} />
                        </Tooltip>
                      )}
                    </Flex>
                    
                    <Text fontSize="sm" mb={3}>
                      {community.description}
                    </Text>
                    
                    <Wrap spacing={2} mb={3}>
                      {community.tags.map((tag, index) => (
                        <WrapItem key={index}>
                          <Tag size="sm" colorScheme="secondary" borderRadius="full">
                            <TagLabel>{tag}</TagLabel>
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                    
                    <HStack mt="auto">
                      <Button
                        as={RouterLink}
                        to={`/community/${community._id}`}
                        rightIcon={<FiChevronRight />}
                        colorScheme="secondary"
                        size="sm"
                      >
                        View Community
                      </Button>
                      
                      {!isMember(community._id) && (
                        <Button
                          leftIcon={<FiUserPlus />}
                          colorScheme="blue"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            handleJoinCommunity(community._id);
                          }}
                          isLoading={isLoading}
                        >
                          Join
                        </Button>
                      )}
                    </HStack>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      )}
      
      {/* All Communities */}
      <Box>
        <Heading size="md" mb={4}>All Communities</Heading>
        
        {filteredCommunities.length > 0 ? (
          <Grid 
            templateColumns={{ 
              base: '1fr', 
              md: 'repeat(2, 1fr)', 
              lg: 'repeat(3, 1fr)' 
            }} 
            gap={4}
          >
            {filteredCommunities.map((community) => (
              <Card 
                key={community._id} 
                bg={cardBg} 
                boxShadow="md" 
                borderRadius="lg"
                as={RouterLink}
                to={`/community/${community._id}`}
                _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s' }}
                position="relative"
                overflow="hidden"
              >
                {community.isFeatured && (
                  <Badge
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme="yellow"
                    display="flex"
                    alignItems="center"
                    px={2}
                    py={1}
                    borderRadius="md"
                    zIndex={1}
                  >
                    <Icon as={FiStar} mr={1} />
                    Featured
                  </Badge>
                )}
                
                <CardBody>
                  <Flex direction="column" height="100%">
                    <Flex align="center" mb={3}>
                      <Avatar 
                        src={community.avatar} 
                        name={community.name} 
                        size="md" 
                        mr={3}
                        bg="secondary.500"
                      />
                      <Box>
                        <Flex align="center">
                          <Heading size="sm" mb={1}>{community.name}</Heading>
                          {community.isVerified && (
                            <Tooltip label="Verified Community">
                              <Icon as={FiShield} color="green.500" ml={1} boxSize={3} />
                            </Tooltip>
                          )}
                        </Flex>
                        <HStack>
                          <Icon as={FiUsers} color="gray.500" boxSize={3} />
                          <Text fontSize="xs" color="gray.500">
                            {formatMemberCount(community.memberCount)} members
                          </Text>
                        </HStack>
                      </Box>
                    </Flex>
                    
                    <Text fontSize="sm" noOfLines={2} mb={3}>
                      {community.description}
                    </Text>
                    
                    <Wrap spacing={2} mb={3}>
                      {community.tags.slice(0, 3).map((tag, index) => (
                        <WrapItem key={index}>
                          <Tag size="sm" colorScheme="secondary" borderRadius="full">
                            <TagLabel>{tag}</TagLabel>
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                    
                    <Flex justify="space-between" align="center" mt="auto">
                      <HStack>
                        <Icon 
                          as={community.isPrivate ? FiLock : FiUnlock} 
                          color="gray.500" 
                          boxSize={3} 
                        />
                        <Text fontSize="xs" color="gray.500">
                          {community.isPrivate ? 'Private' : 'Public'}
                        </Text>
                      </HStack>
                      
                      {!isMember(community._id) && (
                        <Button
                          size="xs"
                          leftIcon={<FiUserPlus />}
                          colorScheme="blue"
                          onClick={(e) => {
                            e.preventDefault();
                            handleJoinCommunity(community._id);
                          }}
                          isLoading={isLoading}
                        >
                          Join
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </Grid>
        ) : (
          <Card bg={cardBg} boxShadow="md" borderRadius="lg" p={6}>
            <CardBody>
              <VStack spacing={4} align="center">
                <Icon as={FiSearch} boxSize={12} color="gray.400" />
                <Text color="gray.500" textAlign="center">
                  No communities found matching your search. Try different keywords or explore all communities.
                </Text>
                <Button
                  colorScheme="secondary"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default Community;
