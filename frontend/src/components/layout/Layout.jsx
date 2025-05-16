import { Outlet } from 'react-router-dom';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { user } = useAuth();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const contentBgColor = useColorModeValue('white', 'gray.800');
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-close sidebar on mobile
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
      
      // Auto-open sidebar on desktop
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <Flex 
      direction="column" 
      height="100vh" 
      overflow="hidden"
      bg={bgColor}
    >
      {/* Navbar */}
      <Navbar 
        toggleSidebar={toggleSidebar} 
        sidebarOpen={sidebarOpen}
        user={user}
      />
      
      {/* Main Content */}
      <Flex flex="1" overflow="hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          isMobile={isMobile}
          onClose={() => isMobile && setSidebarOpen(false)}
          user={user}
        />
        
        {/* Page Content */}
        <Box
          flex="1"
          p={4}
          ml={sidebarOpen && !isMobile ? '250px' : 0}
          transition="margin-left 0.3s"
          overflowY="auto"
          bg={contentBgColor}
          borderRadius={sidebarOpen && !isMobile ? "xl" : "none"}
          m={sidebarOpen && !isMobile ? 4 : 0}
          mt={2}
          boxShadow={sidebarOpen && !isMobile ? "md" : "none"}
        >
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Layout;
