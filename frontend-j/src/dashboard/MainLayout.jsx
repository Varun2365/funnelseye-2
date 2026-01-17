import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Flex, useColorModeValue, useBreakpointValue, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { selectAuthStatus, selectToken } from '../redux/authSlice';
import { getCoachId } from '../utils/authUtils';
import DailyPriorityFeed from '../components/DailyPriorityFeed';

const MainLayout = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const isAuthenticated = useSelector(selectAuthStatus);
  const token = useSelector(selectToken);
  const authState = useSelector(state => state.auth);
  const coachId = getCoachId(authState);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarWidth, setSidebarWidth] = useState('320px');
  const [isHoverMode, setIsHoverMode] = useState(false);
  const [isAccountDeactivated, setIsAccountDeactivated] = useState(false);

  // Priority Feed modal state
  const [isPriorityFeedOpen, setIsPriorityFeedOpen] = useState(false);
  const onPriorityFeedOpen = () => setIsPriorityFeedOpen(true);
  const onPriorityFeedClose = () => setIsPriorityFeedOpen(false);
  
  // Check if we're on mobile
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // Hide TopNav on profile page
  const isProfilePage = location.pathname.includes('/profile');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Check for account deactivation and under review
  useEffect(() => {
    const checkAccountStatus = () => {
      const deactivated = localStorage.getItem('account_deactivated') === 'true';
      const underReview = localStorage.getItem('account_under_review') === 'true';
      setIsAccountDeactivated(deactivated || underReview);
    };

    // Check initially
    checkAccountStatus();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'account_deactivated' || e.key === 'account_under_review') {
        checkAccountStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events
    const handleStatusEvent = () => {
      checkAccountStatus();
    };

    window.addEventListener('account-status-changed', handleStatusEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('account-status-changed', handleStatusEvent);
    };
  }, []);

  // Listen for sidebar collapse events
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      if (event.detail) {
        // Track hover mode state
        if (event.detail.hoverMode !== undefined) {
          setIsHoverMode(event.detail.hoverMode);
        }

        // In hover mode, always keep margin at 80px (collapsed width)
        // In normal mode, update margin based on sidebar width
        if (event.detail.hoverMode) {
          setSidebarWidth('80px');
        } else if (event.detail.width) {
          setSidebarWidth(event.detail.width);
        }
      }
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);

  // Priority Feed modal event listener
  useEffect(() => {
    const handleOpenPriorityFeed = () => {
      onPriorityFeedOpen();
    };

    window.addEventListener('openPriorityFeed', handleOpenPriorityFeed);

    return () => {
      window.removeEventListener('openPriorityFeed', handleOpenPriorityFeed);
    };
  }, []);

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <Box minH="100vh" bg={bgColor} position="relative">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <Box
        position="relative"
        ml={isMobile ? 0 : (isHoverMode ? '0' : sidebarWidth)}
        minH="100vh"
        bg={bgColor}
        transition="margin-left 0.1s cubic-bezier(0.4, 0, 0.2, 1)"
        w={isMobile ? "100%" : (isHoverMode ? "100%" : `calc(100% - ${sidebarWidth})`)}
        overflow="hidden"
      >
        {!isProfilePage && !isAccountDeactivated && <TopNav />}
        <Box
          as="main"
          p={isProfilePage ? 0 : 6}
          minH={isProfilePage ? "100vh" : "calc(100vh - 80px)"}
          overflowY="auto"
          bg={bgColor}
          position="relative"
        >
          <Outlet />
        </Box>
      </Box>

      {/* Priority Feed Modal */}
      <Modal isOpen={isPriorityFeedOpen} onClose={onPriorityFeedClose} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(2px)" />
        <ModalContent borderRadius="10px" boxShadow="2xl" h="80vh" display="flex" flexDirection="column">
          <ModalCloseButton />
          <ModalBody flex={1} py={4} px={6} overflowY="hidden">
            <DailyPriorityFeed
              token={token}
              coachId={coachId}
              onItemClick={(item) => {
                // Handle item click - navigate to relevant section
                if (item.leadId) {
                  navigate(`/dashboard/leads?leadId=${item.leadId}`);
                } else if (item.appointmentId) {
                  navigate(`/dashboard/calendar?appointmentId=${item.appointmentId}`);
                }
                onPriorityFeedClose();
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MainLayout;
