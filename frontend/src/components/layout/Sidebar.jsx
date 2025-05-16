import {
  Box,
  Flex,
  Text,
  CloseButton,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure,
  BoxProps,
  FlexProps,
  VStack,
  HStack,
  Divider,
  Avatar,
} from '@chakra-ui/react';
import {
  FiHome,
  FiCalendar,
  FiPill,
  FiMessageCircle,
  FiUsers,
  FiHeart,
  FiUser,
  FiSettings,
} from 'react-icons/fi';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const SidebarContent = ({ onClose, user, ...rest }) => {
  const location = useLocation();
  
  const LinkItems = [
    { name: 'Dashboard', icon: FiHome, path: '/' },
    { name: 'Cycle Tracker', icon: FiCalendar, path: '/cycle-tracker' },
    { name: 'Medication Tracker', icon: FiPill, path: '/medication-tracker' },
    { name: 'Chat with Anaira', icon: FiMessageCircle, path: '/chat' },
    { name: 'Partner Portal', icon: FiHeart, path: '/partner' },
    { name: 'Community', icon: FiUsers, path: '/community' },
    { name: 'Profile', icon: FiUser, path: '/profile' },
    { name: 'Settings', icon: FiSettings, path: '/profile/settings' },
  ];
  
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold" color="secondary.500">
          FertilityNest
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      
      {/* User Profile Summary */}
      <VStack px={6} mb={6} align="start">
        <HStack spacing={3}>
          <Avatar size="sm" name={user?.name} src={user?.profilePicture} />
          <Box>
            <Text fontWeight="bold" fontSize="sm" isTruncated maxW="150px">
              {user?.name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {user?.fertilityStage || 'Fertility Journey'}
            </Text>
          </Box>
        </HStack>
      </VStack>
      
      <Divider mb={6} />
      
      {/* Navigation Links */}
      {LinkItems.map((link) => (
        <NavItem 
          key={link.name} 
          icon={link.icon} 
          path={link.path}
          isActive={location.pathname === link.path}
          onClick={onClose}
        >
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};

const NavItem = ({ icon, children, path, isActive, onClick, ...rest }) => {
  const activeColor = useColorModeValue('secondary.500', 'secondary.300');
  const activeBg = useColorModeValue('secondary.50', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  
  return (
    <Box
      as={RouterLink}
      to={path}
      style={{ textDecoration: 'none' }}
      onClick={onClick}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : 'inherit'}
        fontWeight={isActive ? 'bold' : 'normal'}
        _hover={{
          bg: hoverBg,
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            as={icon}
            color={isActive ? activeColor : 'inherit'}
          />
        )}
        {children}
      </Flex>
    </Box>
  );
};

const Sidebar = ({ isOpen, isMobile, onClose, user }) => {
  if (isMobile) {
    return (
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} user={user} />
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Box
      position="fixed"
      left={0}
      w={60}
      top={0}
      h="full"
      pt="20"
      display={{ base: 'none', md: isOpen ? 'block' : 'none' }}
      zIndex={1}
    >
      <SidebarContent onClose={() => {}} user={user} />
    </Box>
  );
};

export default Sidebar;
