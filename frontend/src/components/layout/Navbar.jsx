import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useColorModeValue,
  useDisclosure,
  Avatar,
  Badge,
  useColorMode,
  HStack,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
} from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from '../notifications/NotificationItem';

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      bg={bgColor}
      color={textColor}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={borderColor}
      px={4}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex
        bg={bgColor}
        color={textColor}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        align={'center'}
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }} align="center">
          <IconButton
            display={{ base: 'none', md: 'flex' }}
            onClick={toggleSidebar}
            icon={
              sidebarOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Sidebar'}
            mr={2}
          />
          
          <Text
            textAlign={{ base: 'center', md: 'left' }}
            fontFamily={'heading'}
            color={useColorModeValue('secondary.600', 'secondary.300')}
            fontWeight="bold"
            fontSize="xl"
            as={RouterLink}
            to="/"
          >
            FertilityNest
          </Text>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
          align="center"
        >
          {/* Notifications */}
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Box position="relative">
                <IconButton
                  aria-label="Notifications"
                  icon={<BellIcon />}
                  variant="ghost"
                  fontSize="20px"
                />
                {unreadCount > 0 && (
                  <Badge
                    position="absolute"
                    top="-5px"
                    right="-5px"
                    colorScheme="red"
                    borderRadius="full"
                    fontSize="xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Box>
            </PopoverTrigger>
            <PopoverContent width="350px" maxH="400px" overflowY="auto">
              <PopoverBody p={0}>
                <Flex justify="space-between" p={3} borderBottomWidth="1px">
                  <Text fontWeight="bold">Notifications</Text>
                  {unreadCount > 0 && (
                    <Button
                      size="xs"
                      colorScheme="blue"
                      variant="link"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </Flex>
                
                {notifications.length === 0 ? (
                  <Text p={4} textAlign="center" color="gray.500">
                    No notifications
                  </Text>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onRead={() => markAsRead(notification._id)}
                    />
                  ))
                )}
                
                {notifications.length > 5 && (
                  <Button
                    as={RouterLink}
                    to="/notifications"
                    width="100%"
                    variant="ghost"
                    size="sm"
                    my={2}
                  >
                    View all notifications
                  </Button>
                )}
              </PopoverBody>
            </PopoverContent>
          </Popover>
          
          {/* Color Mode Toggle */}
          <IconButton
            aria-label="Toggle Color Mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
          />
          
          {/* User Menu */}
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <HStack spacing={3} cursor="pointer">
                <Avatar
                  size="sm"
                  name={user?.name}
                  src={user?.profilePicture}
                />
                <Text display={{ base: 'none', md: 'flex' }}>
                  {user?.name?.split(' ')[0]}
                </Text>
                <ChevronDownIcon />
              </HStack>
            </PopoverTrigger>
            <PopoverContent width="200px">
              <PopoverBody p={0}>
                <Stack spacing={0}>
                  <Button
                    as={RouterLink}
                    to="/profile"
                    variant="ghost"
                    justifyContent="flex-start"
                    py={3}
                    fontWeight="normal"
                  >
                    Profile
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/profile/settings"
                    variant="ghost"
                    justifyContent="flex-start"
                    py={3}
                    fontWeight="normal"
                  >
                    Settings
                  </Button>
                  <Button
                    onClick={logout}
                    variant="ghost"
                    justifyContent="flex-start"
                    py={3}
                    fontWeight="normal"
                    color="red.500"
                  >
                    Logout
                  </Button>
                </Stack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
};

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      <Stack spacing={4}>
        <MobileNavItem label="Dashboard" href="/" />
        <MobileNavItem label="Cycle Tracker" href="/cycle-tracker" />
        <MobileNavItem label="Medication Tracker" href="/medication-tracker" />
        <MobileNavItem label="Chat with Anaira" href="/chat" />
        <MobileNavItem label="Partner Portal" href="/partner" />
        <MobileNavItem label="Community" href="/community" />
      </Stack>
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Box as={RouterLink} key={child.label} py={2} to={child.href}>
                {child.label}
              </Box>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

export default Navbar;
