import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Badge,
  Collapse,
  IconButton,
  Divider,
  Button,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  FiHome,
  FiUsers,
  FiBarChart,
  FiSettings,
  FiCalendar,
  FiZap,
  FiTrendingUp,
  FiMessageCircle,
  FiChevronDown,
  FiChevronRight,
  FiUser,
  FiUsers as FiTeam,
  FiVideo,
  FiCreditCard,
  FiFileText,
  FiUserCheck,
  FiMenu,
  FiX,
  FiBell,
  FiShield,
} from 'react-icons/fi';
import { IoPeopleOutline } from 'react-icons/io5';

// Enhanced SVG Icons with better styling
const FindMeLogo = () => (
  <Box
    w={10}
    h={10}
    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    borderRadius="xl"
    display="flex"
    alignItems="center"
    justifyContent="center"
    boxShadow="0 4px 15px rgba(102, 126, 234, 0.3)"
  >
    <Text fontSize="lg" fontWeight="bold" color="white">
      S
    </Text>
  </Box>
);

const StaffSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Check if we're on mobile
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // Listen for sidebar toggle events from TopNav
  React.useEffect(() => {
    const handleSidebarToggle = (event) => {
      console.log('StaffSidebar: Received toggle event:', event.detail);
      
      if (event.detail && event.detail.action === 'toggle') {
        if (event.detail.collapsed !== undefined) {
          // Use the specific collapsed value from TopNav
          setIsCollapsed(event.detail.collapsed);
          console.log('StaffSidebar: Updated state to:', event.detail.collapsed);
          
          // Also dispatch width event for MainLayout
          if (event.detail.width) {
            const widthEvent = new CustomEvent('staffSidebarToggle', {
              detail: { width: event.detail.width }
            });
            window.dispatchEvent(widthEvent);
          }
        } else {
          // Fallback to toggle behavior
          setIsCollapsed(prev => {
            const newState = !prev;
            console.log('StaffSidebar: Toggling collapsed state to:', newState);
            return newState;
          });
        }
      }
    };

    window.addEventListener('staffSidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('staffSidebarToggle', handleSidebarToggle);
  }, []);

  const menuItems = [
    { icon: FiHome, label: 'Dashboard Overview', path: '/staff_dashboard', section: 'overview', badge: null, type: 'single' },
    { icon: FiUsers, label: 'Task Management', path: '/staff_dashboard/tasks', section: 'tasks', badge: '5', type: 'single' },
    { icon: FiCalendar, label: 'Calendar Management', path: '/staff_dashboard/calendar', section: 'calendar', badge: null, type: 'single' },
    { icon: FiMessageCircle, label: 'Appointments', path: '/staff_dashboard/appointments', section: 'appointments', badge: '3', type: 'single' },
    { icon: FiBarChart, label: 'Performance Analytics', path: '/staff_dashboard/performance', section: 'performance', badge: null, type: 'single' },
    { icon: FiTrendingUp, label: 'Team Leaderboard', path: '/staff_dashboard/team', section: 'team', badge: null, type: 'single' },
    { icon: FiBell, label: 'Notifications', path: '/staff_dashboard/notifications', section: 'notifications', badge: '2', type: 'single' },
    { icon: FiUserCheck, label: 'Profile Settings', path: '/staff_dashboard/profile', section: 'profile', badge: null, type: 'single' },
    { icon: FiSettings, label: 'API Testing', path: '/staff_api_testing', section: 'api-testing', badge: 'New', type: 'single' },
    { icon: FiShield, label: 'Auth Debug', path: '/auth_debug', section: 'auth-debug', badge: 'Debug', type: 'single' },
  ];

  const handleNavigation = (path, section = null) => {
    navigate(path);
    
    // If we're navigating to the staff dashboard and have a section specified
    if (path.startsWith('/staff_dashboard') && section) {
      // Dispatch a custom event to set the active section
      const sectionEvent = new CustomEvent('staffDashboardSectionChange', {
        detail: { section: section }
      });
      window.dispatchEvent(sectionEvent);
    }
  };

  const toggleDropdown = (path) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleWhatsAppSettings = () => {
    navigate('/whatsapp_setup');
  };

  const handleZoomSettings = () => {
    navigate('/zoom_settings');
  };

  const handlePaymentGateways = () => {
    navigate('/payment_gateways');
  };

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    
    // Calculate stable width values
    const newWidth = newCollapsed ? '80px' : '320px';
    
    // Dispatch event to MainLayout for margin adjustment
    const event = new CustomEvent('staffSidebarToggle', {
      detail: {
        width: newWidth
      }
    });
    window.dispatchEvent(event);
  };

  const isActive = (path, section = null) => {
    const isPathActive = location.pathname === path || location.pathname.startsWith(path + '/');
    
    // If we're on the staff dashboard, also check if the section matches
    if (path.startsWith('/staff_dashboard') && section) {
      // Check if current path matches the section
      if (section === 'overview' && location.pathname === '/staff_dashboard') {
        return true;
      }
      return location.pathname.includes(`/${section}`);
    }
    
    return isPathActive;
  };

  const isSubItemActive = (path) => {
    return location.pathname === path;
  };

  const renderMenuItem = (item, index) => {
    const isExpanded = expandedItems.has(item.path);
    const isItemActive = isActive(item.path, item.section);
    const isHovered = hoveredItem === item.name;

    if (item.type === 'dropdown') {
      return (
        <Box key={item.path} mb={1}>
          {/* Main Dropdown Item */}
          <Box
            as="button"
            w="100%"
            p={2}
            borderRadius="xl"
            bg={isItemActive 
              ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.1) 100%)' 
              : 'transparent'
            }
            color={isItemActive ? 'white' : 'gray.300'}
            _hover={{
              bg: isItemActive 
                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.15) 100%)' 
                : 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              transform: 'translateX(4px)',
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            onClick={() => toggleDropdown(item.path)}
            position="relative"
            border="1px solid"
            borderColor={isItemActive ? 'rgba(102, 126, 234, 0.3)' : 'transparent'}
            boxShadow={isItemActive 
              ? '0 2px 8px rgba(102, 126, 234, 0.2)' 
              : 'none'
            }
            transform={isItemActive ? 'translateX(2px)' : 'translateX(0)'}
            onMouseEnter={() => setHoveredItem(item.name)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <HStack spacing={4} justify={isCollapsed ? "center" : "space-between"} align="center">
              <HStack spacing={4} align="center">
                <Box
                  p={isCollapsed ? 3 : 2.5}
                  borderRadius="lg"
                  bg={isItemActive 
                    ? 'rgba(102, 126, 234, 0.25)' 
                    : 'rgba(255, 255, 255, 0.05)'
                  }
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  transform={isHovered ? 'scale(1.1)' : 'scale(1)'}
                  transition="transform 0.2s ease"
                  w={isCollapsed ? "40px" : "auto"}
                  h={isCollapsed ? "40px" : "auto"}
                  minW={isCollapsed ? "40px" : "auto"}
                  minH={isCollapsed ? "40px" : "auto"}
                >
                  <Icon 
                    as={item.icon} 
                    boxSize={isCollapsed ? 6 : 5} 
                    color={isItemActive ? '#667eea' : 'gray.400'} 
                    flexShrink={0}
                  />
                </Box>
                {!isCollapsed && (
                  <Text 
                    fontWeight={isItemActive ? '600' : '500'} 
                    textAlign="left"
                    fontSize="sm"
                    letterSpacing="0.025em"
                  >
                    {item.label}
                  </Text>
                )}
                {!isCollapsed && item.badge && (
                  <Badge
                    colorScheme={item.badge === 'New' ? 'green' : 'red'}
                    variant="solid"
                    size="sm"
                    borderRadius="full"
                    fontSize="xs"
                    px={2}
                    py={1}
                    fontWeight="600"
                  >
                    {item.badge}
                  </Badge>
                )}
              </HStack>
              
              {/* Dropdown Arrow */}
              {!isCollapsed && (
                <Box
                  p={1.5}
                  borderRadius="md"
                  bg="rgba(255, 255, 255, 0.05)"
                  transition="all 0.3s ease"
                  transform={isHovered ? 'scale(1.1)' : 'scale(1)'}
                >
                  <Icon 
                    as={isExpanded ? FiChevronDown : FiChevronRight} 
                    boxSize={4} 
                    color={isItemActive ? '#667eea' : 'gray.400'}
                  />
                </Box>
              )}
            </HStack>
          </Box>

          {/* Dropdown Sub-items */}
          {!isCollapsed && (
            <Collapse in={isExpanded} animateOpacity>
              <VStack spacing={2} align="stretch" pl={8} mt={3}>
                {item.subItems.map((subItem) => {
                  const isSubActive = isSubItemActive(subItem.path);
                  const isSubHovered = hoveredItem === subItem.name;
                  return (
                    <Box
                      key={subItem.path}
                      as="button"
                      w="100%"
                      p={2}
                      borderRadius="lg"
                      bg={isSubActive 
                        ? 'rgba(102, 126, 234, 0.15)' 
                        : 'transparent'
                      }
                      color={isSubActive ? 'white' : 'gray.400'}
                      _hover={{
                        bg: isSubActive 
                          ? 'rgba(102, 126, 234, 0.2)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                        transform: 'translateX(3px)',
                      }}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      onClick={() => handleNavigation(subItem.path)}
                      position="relative"
                      border="1px solid"
                      borderColor={isSubActive ? 'rgba(102, 126, 234, 0.25)' : 'transparent'}
                      transform={isSubHovered ? 'translateX(2px)' : 'translateX(0)'}
                      onMouseEnter={() => setHoveredItem(subItem.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <HStack spacing={3} justify="space-between" align="center">
                        <HStack spacing={3} align="center">
                          <Box
                            p={isCollapsed ? 2 : 1.5}
                            borderRadius="md"
                            bg={isSubActive 
                              ? 'rgba(102, 126, 234, 0.2)' 
                              : 'rgba(255, 255, 255, 0.05)'
                            }
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            transform={isSubHovered ? 'scale(1.05)' : 'scale(1)'}
                            transition="transform 0.2s ease"
                            w={isCollapsed ? "32px" : "auto"}
                            h={isCollapsed ? "32px" : "auto"}
                            minW={isCollapsed ? "32px" : "auto"}
                            minH={isCollapsed ? "32px" : "auto"}
                          >
                            <Icon 
                              as={subItem.icon} 
                              boxSize={isCollapsed ? 5 : 4} 
                              color={isSubActive ? '#667eea' : 'gray.400'} 
                              flexShrink={0}
                            />
                          </Box>
                          <Text 
                            fontWeight={isSubActive ? '500' : '400'} 
                            textAlign="left"
                            fontSize="sm"
                          >
                            {subItem.label}
                          </Text>
                          {subItem.badge && (
                            <Badge
                              colorScheme="blue"
                              variant="solid"
                              size="sm"
                              borderRadius="full"
                              fontSize="xs"
                              px={1.5}
                              py={0.5}
                            >
                              {subItem.badge}
                            </Badge>
                          )}
                        </HStack>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </Collapse>
          )}
        </Box>
      );
    }

    // Single Menu Item
    return (
      <Box
        key={item.path}
        as="button"
        w="100%"
        p={4}
        borderRadius="xl"
        bg={isItemActive 
          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.1) 100%)' 
          : 'transparent'
        }
        color={isItemActive ? 'white' : 'gray.300'}
        _hover={{
          bg: isItemActive 
            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.15) 100%)' 
            : 'rgba(255, 255, 255, 0.05)',
          color: 'white',
          transform: 'translateX(4px)',
        }}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        onClick={() => handleNavigation(item.path, item.section)}
        position="relative"
        border="1px solid"
        borderColor={isItemActive ? 'rgba(102, 126, 234, 0.3)' : 'transparent'}
        mb={1}
        boxShadow={isItemActive 
          ? '0 2px 8px rgba(102, 126, 234, 0.2)' 
          : 'none'
        }
        transform={isItemActive ? 'translateX(2px)' : 'translateX(0)'}
        onMouseEnter={() => setHoveredItem(item.name)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <HStack spacing={4} justify={isCollapsed ? "center" : "flex-start"} align="center">
          <Box
            p={isCollapsed ? 3 : 2.5}
            borderRadius="lg"
            bg={isItemActive 
              ? 'rgba(102, 126, 234, 0.25)' 
              : 'rgba(255, 255, 255, 0.05)'
            }
            display="flex"
            alignItems="center"
            justifyContent="center"
            transform={hoveredItem === item.name ? 'scale(1.1)' : 'scale(1)'}
            transition="transform 0.2s ease"
            w={isCollapsed ? "40px" : "auto"}
            h={isCollapsed ? "40px" : "auto"}
            minW={isCollapsed ? "40px" : "auto"}
            minH={isCollapsed ? "40px" : "auto"}
          >
            <Icon 
              as={item.icon} 
              boxSize={isCollapsed ? 6 : 5} 
              color={isItemActive ? '#667eea' : 'gray.400'} 
              flexShrink={0}
            />
          </Box>
          {!isCollapsed && (
            <Text 
              fontWeight={isItemActive ? '600' : '500'} 
              textAlign="left"
              fontSize="sm"
              letterSpacing="0.025em"
            >
              {item.label}
            </Text>
          )}
          {!isCollapsed && item.badge && (
            <Badge
              colorScheme={item.badge === 'New' ? 'green' : 'red'}
              variant="solid"
              size="sm"
              borderRadius="full"
              fontSize="xs"
              px={2}
              py={1}
              fontWeight="600"
              ml="auto"
            >
              {item.badge}
            </Badge>
          )}
        </HStack>
      </Box>
    );
  };

  return (
    <Box
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      w={isCollapsed ? "80px" : "320px"}
      maxW={isCollapsed ? "80px" : "320px"}
      minW={isCollapsed ? "80px" : "320px"}
      bg="black"
      borderRight="1px solid rgba(255, 255, 255, 0.1)"
      zIndex={1000}
      overflow="hidden"
      boxShadow="4px 0 24px rgba(0, 0, 0, 0.5)"
      transition="width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      display={isMobile && isCollapsed ? "none" : "flex"}
      flexDirection="column"
      transform="translateZ(0)"
      willChange="width"
    >
      {/* Header */}
      <Box 
        p={isCollapsed ? 4 : 6} 
        borderBottom="1px solid rgba(255, 255, 255, 0.1)" 
        mb={6}
        flexShrink={0}
        minH="80px"
      >
        <HStack spacing={isCollapsed ? 0 : 4} justify={isCollapsed ? "center" : "space-between"}>
          <HStack spacing={isCollapsed ? 0 : 4} justify={isCollapsed ? "center" : "flex-start"}>
            <FindMeLogo />
            {!isCollapsed && (
              <Box>
                <Text 
                  fontSize="xl" 
                  fontWeight="bold" 
                  color="white"
                >
                  Staff Dashboard
                </Text>
                <Text fontSize="xs" color="gray.400" mt={-0.5}>
                  Unified System
                </Text>
              </Box>
            )}
          </HStack>
          
          {/* Toggle Button */}
          {!isCollapsed && (
            <Button
              size="sm"
              variant="ghost"
              color="gray.400"
              _hover={{
                bg: 'rgba(255, 255, 255, 0.05)',
                color: 'white'
              }}
              onClick={toggleSidebar}
              p={2}
              borderRadius="md"
            >
              <Icon as={FiX} boxSize={4} />
            </Button>
          )}
        </HStack>
      </Box>

      {/* Navigation Menu */}
      <Box 
        flex={1} 
        overflowY="auto" 
        overflowX="hidden"
        px={isCollapsed ? 2 : 3}
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          // Firefox scrollbar styling
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <VStack spacing={2} py={2} align="stretch">
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </VStack>
      </Box>

      {/* Divider */}
      {!isCollapsed && <Divider borderColor="rgba(255, 255, 255, 0.1)" mx={4} />}

      {/* Settings at Bottom */}
      <Box 
        p={4} 
        flexShrink={0}
        mt="auto"
        borderTop="1px solid rgba(255, 255, 255, 0.1)"
      >
        {!isCollapsed && (
          <>
            <Box
              as="button"
              w="100%"
              p={2}
              borderRadius="xl"
              bg="transparent"
              color="gray.300"
              _hover={{
                bg: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                transform: 'translateX(4px)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              onClick={() => toggleDropdown('settings')}
              position="relative"
              border="1px solid"
              borderColor="transparent"
            >
              <HStack spacing={4} justify={isCollapsed ? "center" : "space-between"} align="center">
                <HStack spacing={4} align="center">
                  <Box
                    p={isCollapsed ? 3 : 2.5}
                    borderRadius="lg"
                    bg="rgba(255, 255, 255, 0.05)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    w={isCollapsed ? "40px" : "auto"}
                    h={isCollapsed ? "40px" : "auto"}
                    minW={isCollapsed ? "40px" : "auto"}
                    minH={isCollapsed ? "40px" : "auto"}
                  >
                    <Icon as={FiSettings} boxSize={isCollapsed ? 6 : 5} color="gray.400" flexShrink={0} />
                  </Box>
                  {!isCollapsed && (
                    <Text fontWeight="500" textAlign="left" fontSize="sm" letterSpacing="0.025em">
                      Settings
                    </Text>
                  )}
                </HStack>
                {!isCollapsed && (
                  <Box
                    p={1.5}
                    borderRadius="md"
                    bg="rgba(255, 255, 255, 0.05)"
                    transition="all 0.3s ease"
                  >
                    <Icon 
                      as={expandedItems.has('settings') ? FiChevronDown : FiChevronRight} 
                      boxSize={4} 
                      color="gray.400"
                    />
                  </Box>
                )}
              </HStack>
            </Box>

            {/* Settings Dropdown */}
            <Collapse in={expandedItems.has('settings')} animateOpacity>
              <VStack spacing={2} align="stretch" pl={8} mt={3}>
                <Box
                  as="button"
                  w="100%"
                  p={3}
                  borderRadius="lg"
                  bg="transparent"
                  color="gray.400"
                  _hover={{
                    bg: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    transform: 'translateX(3px)',
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  onClick={handleWhatsAppSettings}
                  position="relative"
                  border="1px solid"
                  borderColor="transparent"
                >
                  <HStack spacing={3} align="center">
                    <Box
                      p={1.5}
                      borderRadius="md"
                      bg="rgba(255, 255, 255, 0.05)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiMessageCircle} boxSize={4} color="gray.500" flexShrink={0} />
                    </Box>
                    <Text fontSize="sm" fontWeight="400">WhatsApp Settings</Text>
                  </HStack>
                </Box>

                <Box
                  as="button"
                  w="100%"
                  p={3}
                  borderRadius="lg"
                  bg="transparent"
                  color="gray.400"
                  _hover={{
                    bg: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    transform: 'translateX(3px)',
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  onClick={handleZoomSettings}
                  position="relative"
                  border="1px solid"
                  borderColor="transparent"
                >
                  <HStack spacing={3} align="center">
                    <Box
                      p={1.5}
                      borderRadius="md"
                      bg="rgba(255, 255, 255, 0.05)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiVideo} boxSize={4} color="gray.500" flexShrink={0} />
                    </Box>
                    <Text fontSize="sm" fontWeight="400">Zoom Settings</Text>
                  </HStack>
                </Box>

                <Box
                  as="button"
                  w="100%"
                  p={3}
                  borderRadius="lg"
                  bg="transparent"
                  color="gray.400"
                  _hover={{
                    bg: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    transform: 'translateX(3px)',
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  onClick={handlePaymentGateways}
                  position="relative"
                  border="1px solid"
                  borderColor="transparent"
                >
                  <HStack spacing={3} align="center">
                    <Box
                      p={1.5}
                      borderRadius="md"
                      bg="rgba(255, 255, 255, 0.05)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiCreditCard} boxSize={4} color="gray.500" flexShrink={0} />
                    </Box>
                    <Text fontSize="sm" fontWeight="400">Payment Gateways Setup</Text>
                  </HStack>
                </Box>
              </VStack>
            </Collapse>
          </>
        )}

        {/* Restore Button when Collapsed */}
        {isCollapsed && (
          <Box
            as="button"
            w="100%"
            p={isCollapsed ? 4 : 3}
            borderRadius="xl"
            bg="rgba(102, 126, 234, 0.1)"
            color="white"
            _hover={{
              bg: 'rgba(102, 126, 234, 0.2)',
              transform: 'scale(1.05)',
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            onClick={toggleSidebar}
            position="relative"
            border="1px solid"
            borderColor="rgba(102, 126, 234, 0.3)"
            boxShadow="0 2px 8px rgba(102, 126, 234, 0.2)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            h={isCollapsed ? "48px" : "auto"}
            minH={isCollapsed ? "48px" : "auto"}
          >
            <Icon as={FiMenu} boxSize={isCollapsed ? 6 : 5} color="#667eea" />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StaffSidebar;