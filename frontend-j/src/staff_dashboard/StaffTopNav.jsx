import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  Badge,
  useColorModeValue,
  useColorMode,
  Tooltip,
  MenuGroup,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  FiBell,
  FiSearch,
  FiSun,
  FiMoon,
  FiLogOut,
  FiSettings,
  FiUser,
  FiMessageCircle,
  FiVideo,
  FiCreditCard,
  FiMenu,
  FiX,
  FiCheckCircle,
  FiTarget,
  FiClock,
  FiBarChart,
} from 'react-icons/fi';
import { logout as staffLogout } from './redux';
import { toggleDarkMode } from '../redux/uiSlice';

const StaffTopNav = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get staff data from staff redux
  const staffData = useSelector((state) => state.staff.staffData);
  const staffId = useSelector((state) => state.staff.staffId);
  const isStaffAuthenticated = useSelector((state) => state.staff.isAuthenticated);
  
  const { colorMode, toggleColorMode } = useColorMode();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Check if we're on mobile
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Design system colors following guidelines
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.500');

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarEvent = (event) => {
      console.log('StaffTopNav: Received sidebar event:', event.detail);
      
      if (event.detail) {
        if (event.detail.width) {
          // Handle width-based events
          const newCollapsed = event.detail.width === '80px';
          setIsSidebarCollapsed(newCollapsed);
          console.log('StaffTopNav: Updated state based on width:', newCollapsed);
        } else if (event.detail.action === 'toggle') {
          // Handle action-based events
          if (event.detail.collapsed !== undefined) {
            setIsSidebarCollapsed(event.detail.collapsed);
            console.log('StaffTopNav: Updated state based on collapsed value:', event.detail.collapsed);
          } else {
            setIsSidebarCollapsed(prev => !prev);
            console.log('StaffTopNav: Toggled state to:', !event.detail.collapsed);
          }
        }
      }
    };

    window.addEventListener('staffSidebarToggle', handleSidebarEvent);
    return () => {
      window.removeEventListener('staffSidebarToggle', handleSidebarEvent);
    };
  }, []);

  const handleSidebarToggle = () => {
    console.log('StaffTopNav: Sidebar toggle clicked, current state:', isSidebarCollapsed);
    
    // Use the same logic as Sidebar - directly update state
    setIsSidebarCollapsed(prev => {
      const newState = !prev;
      console.log('StaffTopNav: Toggling sidebar state to:', newState);
      
      // Dispatch event to notify Sidebar and MainLayout
      const event = new CustomEvent('staffSidebarToggle', {
        detail: {
          action: 'toggle',
          collapsed: newState,
          width: newState ? '80px' : '320px'  // Add width for MainLayout
        }
      });
      window.dispatchEvent(event);
      
      return newState;
    });
  };

  const handleLogout = () => {
    dispatch(staffLogout());
  };

  const handleThemeToggle = () => {
    toggleColorMode();
    dispatch(toggleDarkMode());
  };

  const handleProfileClick = () => {
    navigate('/staff_dashboard/profile');
  };

  const handleTasksClick = () => {
    navigate('/staff_dashboard/tasks');
  };

  const handleGoalsClick = () => {
    navigate('/staff_dashboard/performance');
  };

  const handlePerformanceClick = () => {
    navigate('/staff_dashboard/performance');
  };

  return (
    <Box
      h="80px"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      px={6}
      position="sticky"
      top={0}
      zIndex={100}
      transition="all 0.2s"
      ml={isMobile ? "0" : (isSidebarCollapsed ? "80px" : "320px")}
      width={isMobile ? "100%" : (isSidebarCollapsed ? "calc(100% - 80px)" : "calc(100% - 320px)")}
    >
      <Flex h="100%" align="center" justify="space-between">
        {/* Left Section */}
        <HStack spacing={4} align="flex-start">
          {/* Menu Button - Always show on mobile, show on desktop when sidebar is collapsed */}
          {(isMobile || isSidebarCollapsed) && (
            <Tooltip label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
              <IconButton
                icon={isSidebarCollapsed ? <FiMenu /> : <FiX />}
                variant="ghost"
                size="md"
                aria-label="Toggle sidebar"
                onClick={handleSidebarToggle}
                color="brand.600"
                _hover={{
                  bg: 'rgba(102, 126, 234, 0.1)',
                  transform: 'scale(1.05)',
                }}
                transition="all 0.2s ease"
                // Mobile specific styling
                {...(isMobile && {
                  size: "lg",
                  color: "brand.500",
                  _hover: {
                    bg: 'rgba(102, 126, 234, 0.15)',
                    transform: 'scale(1.1)',
                  }
                })}
              />
            </Tooltip>
          )}
          
          <Box flex="1" minW={0}>  {/* Prevent text overflow */}
            <Text fontSize="xl" fontWeight="600" color={textColor} noOfLines={1} lineHeight="1.2">
              {staffData?.name || 'Staff Member'}
            </Text>
          </Box>
        </HStack>

        {/* Right Section */}
        <HStack spacing={4}>
          {/* Search */}
          <Tooltip label="Search">
            <IconButton
              icon={<FiSearch />}
              variant="ghost"
              size="md"
              aria-label="Search"
            />
          </Tooltip>

          {/* Notifications */}
          <Tooltip label="Notifications">
            <IconButton
              icon={<FiBell />}
              variant="ghost"
              size="md"
              aria-label="Notifications"
              position="relative"
            >
              <Badge
                position="absolute"
                top="8px"
                right="8px"
                colorScheme="red"
                variant="solid"
                size="sm"
                borderRadius="full"
              >
                3
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              variant="ghost"
              size="md"
              aria-label="Toggle theme"
              onClick={handleThemeToggle}
            />
          </Tooltip>

          {/* User Menu */}
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<Avatar size="sm" name={staffData?.name} src={staffData?.avatar || staffData?.profileImage} />}
              variant="ghost"
              size="md"
              aria-label="User menu"
            />
            <MenuList>
              <MenuItem icon={<FiUser />} onClick={handleProfileClick}>
                <Text>Profile</Text>
              </MenuItem>
              <Menu>
                <MenuButton as={MenuItem} icon={<FiSettings />}>
                  <Text>Quick Actions</Text>
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<FiCheckCircle />} onClick={handleTasksClick}>
                    <Text>View Tasks</Text>
                  </MenuItem>
                  <MenuItem icon={<FiTarget />} onClick={handleGoalsClick}>
                    <Text>Set Goals</Text>
                  </MenuItem>
                  <MenuItem icon={<FiBarChart />} onClick={handlePerformanceClick}>
                    <Text>Performance</Text>
                  </MenuItem>
                </MenuList>
              </Menu>
              <MenuDivider />
              <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                <Text>Logout</Text>
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

export default StaffTopNav;
