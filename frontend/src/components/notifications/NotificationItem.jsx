import {
  Box,
  Flex,
  Text,
  Icon,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  FiBell, 
  FiCalendar, 
  FiPill, 
  FiHeart, 
  FiUsers, 
  FiMessageCircle, 
  FiAlertTriangle 
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification, onRead }) => {
  const { 
    _id, 
    type, 
    title, 
    message, 
    read, 
    createdAt, 
    priority, 
    actionLink 
  } = notification;
  
  const bgColor = useColorModeValue(
    read ? 'white' : 'blue.50',
    read ? 'gray.800' : 'blue.900'
  );
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Get icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'cycle_reminder':
        return FiCalendar;
      case 'medication_reminder':
        return FiPill;
      case 'partner_request':
      case 'partner_accepted':
        return FiHeart;
      case 'community_invite':
      case 'community_post':
        return FiUsers;
      case 'comment_reply':
      case 'like':
        return FiMessageCircle;
      case 'distress_signal':
        return FiAlertTriangle;
      default:
        return FiBell;
    }
  };
  
  // Get badge color based on priority
  const getBadgeColor = () => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'normal':
        return 'blue';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };
  
  // Format time
  const formattedTime = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
  return (
    <Box
      as={RouterLink}
      to={actionLink || '#'}
      p={3}
      borderBottomWidth="1px"
      borderColor={borderColor}
      bg={bgColor}
      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
      transition="background-color 0.2s"
      onClick={() => !read && onRead(_id)}
    >
      <Flex align="center">
        <Box
          borderRadius="full"
          bg={useColorModeValue(`${getBadgeColor()}.100`, `${getBadgeColor()}.900`)}
          color={useColorModeValue(`${getBadgeColor()}.500`, `${getBadgeColor()}.200`)}
          p={2}
          mr={3}
        >
          <Icon as={getIcon()} />
        </Box>
        
        <Box flex="1">
          <Flex justify="space-between" align="center" mb={1}>
            <Text fontWeight="bold" fontSize="sm">
              {title}
            </Text>
            {priority !== 'normal' && (
              <Badge colorScheme={getBadgeColor()} fontSize="xs">
                {priority}
              </Badge>
            )}
          </Flex>
          
          <Text fontSize="xs" color="gray.500" mb={1}>
            {formattedTime}
          </Text>
          
          <Text fontSize="sm" noOfLines={2}>
            {message}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default NotificationItem;
