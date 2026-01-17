import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../logo.png';
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
  FiTarget,
  FiGlobe,
  FiCheckSquare,
  FiActivity,
  FiAward,
  FiBookOpen,
  FiPieChart,
  FiHeart,
  FiMove,
  FiRepeat,
} from 'react-icons/fi';
import { IoPeopleOutline } from 'react-icons/io5';

// Enhanced Logo with image
const FindMeLogo = () => (
  <Box
    w={10}
    h={10}
    borderRadius="xl"
    display="flex"
    alignItems="center"
    justifyContent="center"
    overflow="hidden"
    p="3px"
  >
    <Box
      as="img"
      src={logoImage}
      alt="FunnelsEye Logo"
      w="100%"
      h="100%"
      objectFit="contain"
    />
  </Box>
);

const sidebarPalette = {
  background: 'linear-gradient(185deg, #11111f 0%, #05030c 100%)',
  border: 'rgba(255, 255, 255, 0.08)',
  headerBg: 'rgba(255, 255, 255, 0.02)',
  panel: 'rgba(255, 255, 255, 0.03)',
  panelHover: 'rgba(255, 255, 255, 0.06)',
  panelActive: 'linear-gradient(130deg, rgba(81, 67, 255, 0.35), rgba(168, 85, 247, 0.25))',
  icon: 'rgba(255, 255, 255, 0.05)',
  iconActive: 'rgba(119, 92, 246, 0.3)',
  text: 'rgba(255, 255, 255, 0.95)',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  divider: 'rgba(255, 255, 255, 0.08)',
  glow: '0 20px 60px rgba(5, 3, 12, 0.65)',
  highlight: '#a889ff',
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHoverMode, setIsHoverMode] = useState(() => {
    // Load hover mode from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarHoverMode');
      return saved === 'true';
    }
    return false;
  });
  const [isHovered, setIsHovered] = useState(false);
  
  // Check if we're on mobile
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // Listen for sidebar toggle events from TopNav
  React.useEffect(() => {
    const handleSidebarToggle = (event) => {
      console.log('Sidebar: Received toggle event:', event.detail);
      
      if (event.detail && event.detail.action === 'toggle') {
        if (event.detail.collapsed !== undefined) {
          // Use the specific collapsed value from TopNav
          setIsCollapsed(event.detail.collapsed);
          console.log('Sidebar: Updated state to:', event.detail.collapsed);
          
          // Also dispatch width event for MainLayout
          if (event.detail.width) {
            const widthEvent = new CustomEvent('sidebarToggle', {
              detail: { width: event.detail.width }
            });
            window.dispatchEvent(widthEvent);
          }
        } else {
          // Fallback to toggle behavior
          setIsCollapsed(prev => {
            const newState = !prev;
            console.log('Sidebar: Toggling collapsed state to:', newState);
            return newState;
          });
        }
      }
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  // Grouped menu items for better organization
  const menuGroups = [
    {
      title: 'Core',
      items: [
        { icon: FiHome, label: 'Dashboard', path: '/', badge: null, type: 'single' },
        { icon: FiBarChart, label: 'Funnels', path: '/funnels', badge: null, type: 'single' },
      ]
    },
    {
      title: 'Leads & Communication',
      items: [
        { 
          icon: IoPeopleOutline, 
          label: 'Lead Management', 
          path: '/leads', 
          badge: null, 
          type: 'dropdown',
          subItems: [
            { icon: FiUser, label: 'Customer Leads', path: '/leads_customer', badge: null },
            { icon: FiTeam, label: 'Coach Leads', path: '/leads_couch', badge: null },
          ]
        },
        { 
          icon: FiUserCheck, 
          label: 'Client Management', 
          path: '/client_management', 
          badge: null, 
          type: 'dropdown',
          subItems: [
            { icon: FiActivity, label: 'Personal Progress Tracking', path: '/client_management/personal_progress', badge: null },
            { icon: FiZap, label: 'Coaching Delivery System (Core)', path: '/client_management/coaching_delivery', badge: null },
            { icon: FiAward, label: 'Essential Gamification', path: '/client_management/gamification', badge: null },
            { icon: FiMessageCircle, label: 'Communication Tools', path: '/client_management/communication', badge: null },
            { icon: FiBookOpen, label: 'Educational Hub (Core)', path: '/client_management/educational_hub', badge: null },
            { icon: FiPieChart, label: 'Progress Analytics (Essential)', path: '/client_management/progress_analytics', badge: null },
            { icon: FiUsers, label: 'Community & Social Programs', path: '/client_management/community', badge: null },
            { icon: FiHeart, label: 'Motivational Features', path: '/client_management/motivational', badge: null },
          ]
        },
        { icon: FiMessageCircle, label: 'Messages', path: '/messaging', badge: null, type: 'single' },
        { icon: FiCalendar, label: 'Calendar', path: '/calendar', badge: null, type: 'single' },
      ]
    },
    {
      title: 'Marketing & Growth',
      items: [
        { icon: FiTarget, label: 'Marketing & Ads', path: '/ads', badge: null, type: 'single' },
        { icon: FiZap, label: 'Automations', path: '/automation', badge: null, type: 'single' },
        { icon: FiRepeat, label: 'Automation Rules', path: 'automation-rules', badge: null, type: 'single' },
        { icon: FiFileText, label: 'Courses & Content', path: '/courses', badge: null, type: 'single' },
      ]
    },
    {
      title: 'Team & Network',
      items: [
        { icon: FiUsers, label: 'Staff', path: '/staff', badge: null, type: 'single' },
        { icon: FiTrendingUp, label: 'Coach Network', path: '/mlm', badge: null, type: 'single' },
        { icon: FiCheckSquare, label: 'Tasks & Activities', path: '/tasks', badge: null, type: 'single' },
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: FiUserCheck, label: 'Profile', path: '/profile', badge: null, type: 'single' },
        // { icon: FiCreditCard, label: 'Subscription', path: '/subscription', badge: null, type: 'single' }, // Moved to Profile
        // { icon: FiGlobe, label: 'Custom Domains', path: '/dns', badge: 'New', type: 'single' }, // Commented out
      ]
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
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


  const toggleSidebar = () => {
    // In hover mode, clicking should not toggle - hover controls it
    if (isHoverMode) {
      return;
    }
    
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    
    // Calculate stable width values
    const newWidth = newCollapsed ? '80px' : '320px';
    
    // Dispatch event to MainLayout for margin adjustment
    const event = new CustomEvent('sidebarToggle', {
      detail: {
        width: newWidth,
        collapsed: newCollapsed
      }
    });
    window.dispatchEvent(event);
  };

  const toggleHoverMode = () => {
    const newHoverMode = !isHoverMode;
    setIsHoverMode(newHoverMode);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarHoverMode', String(newHoverMode));
    }
    
    if (newHoverMode) {
      // When enabling hover mode, collapse sidebar and keep it at 80px
      setIsCollapsed(true);
      setIsHovered(false);
      // Dispatch fixed width event to keep content margin at 80px
      const event = new CustomEvent('sidebarToggle', {
        detail: {
          width: '80px',
          collapsed: true,
          hoverMode: true
        }
      });
      window.dispatchEvent(event);
    } else {
      // When disabling hover mode, preserve current visual state
      // If sidebar is currently expanded (via hover), keep it expanded
      const currentlyExpanded = isHovered;
      setIsCollapsed(!currentlyExpanded);
      setIsHovered(false);
      
      // Dispatch event to update layout based on preserved state
      const newWidth = currentlyExpanded ? '320px' : '80px';
      const event = new CustomEvent('sidebarToggle', {
        detail: {
          width: newWidth,
          collapsed: !currentlyExpanded,
          hoverMode: false
        }
      });
      window.dispatchEvent(event);
    }
  };

  const handleMouseEnter = () => {
    if (isHoverMode) {
      setIsHovered(true);
      setIsCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (isHoverMode) {
      setIsHovered(false);
      setIsCollapsed(true);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isSubItemActive = (path) => {
    return location.pathname === path;
  };

  const renderMenuItem = (item, index) => {
    const isExpanded = expandedItems.has(item.path);
    const isItemActive = isActive(item.path);
    const isItemHovered = hoveredItem === item.name;
    const useNeutralBg = item.label === 'Lead Management' || item.label === 'Client Management';

    if (item.type === 'dropdown') {
      return (
        <Box key={item.path} w="100%" mb={effectiveCollapsed ? 0.5 : 1}>
          {/* Main Dropdown Item */}
          <Box
            as="button"
            w="100%"
            p={effectiveCollapsed ? 1.5 : 2}
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent={effectiveCollapsed ? "center" : "flex-start"}
            bg={
              useNeutralBg
                ? 'transparent'
                : isItemActive
                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.15) 100%)'
                : sidebarPalette.panel
            }
            color={isItemActive ? sidebarPalette.text : sidebarPalette.textMuted}
            _hover={{
              bg: useNeutralBg
                ? 'rgba(255, 255, 255, 0.04)'
                : isItemActive
                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.35) 0%, rgba(118, 75, 162, 0.2) 100%)'
                : sidebarPalette.panelHover,
              color: sidebarPalette.text,
              transform: 'translateX(3px)',
            }}
            transition="all 0.1s cubic-bezier(0.4, 0, 0.2, 1)"
            onClick={() => toggleDropdown(item.path)}
            position="relative"
            border="1px solid"
            borderColor={
              useNeutralBg
                ? 'transparent'
                : isItemActive
                ? 'rgba(102, 126, 234, 0.4)'
                : 'transparent'
            }
            boxShadow={
              useNeutralBg
                ? 'none'
                : isItemActive
                ? '0 8px 30px rgba(102, 126, 234, 0.3)'
                : '0 2px 8px rgba(3, 3, 6, 0.35)'
            }
            transform={
              useNeutralBg
                ? 'translateX(0)'
                : isItemActive
                ? 'translateX(2px)'
                : 'translateX(0)'
            }
            onMouseEnter={() => setHoveredItem(item.name)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* Always render full structure, just hide/show with opacity */}
            <HStack 
              spacing={effectiveCollapsed ? 0 : 3} 
              justify={effectiveCollapsed ? "center" : "space-between"} 
              align="center" 
              w="100%"
            >
              <HStack 
                spacing={effectiveCollapsed ? 0 : 3} 
                align="center" 
                flex={effectiveCollapsed ? 0 : 1} 
                justify={effectiveCollapsed ? "center" : "flex-start"}
                w={effectiveCollapsed ? "auto" : "100%"}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="md"
                  bg={isItemActive ? sidebarPalette.iconActive : sidebarPalette.icon}
                  w="36px"
                  h="36px"
                  minW="36px"
                  minH="36px"
                  p={effectiveCollapsed ? 0 : "4px"}
                  transform={isItemHovered ? 'scale(1.05)' : 'scale(1)'}
                  transition="transform 0.1s ease"
                >
                  <Icon 
                    as={item.icon} 
                    boxSize="15px" 
                    color={isItemActive ? sidebarPalette.text : sidebarPalette.textMuted} 
                  />
                </Box>
                <Text 
                  fontWeight={isItemActive ? '600' : '400'} 
                  fontSize="sm"
                  letterSpacing="0.01em"
                  flex={effectiveCollapsed ? 0 : 1}
                  color={isItemActive ? sidebarPalette.text : sidebarPalette.textMuted}
                  textAlign="left"
                  opacity={effectiveCollapsed ? 0 : 1}
                  visibility={effectiveCollapsed ? 'hidden' : 'visible'}
                  transition="opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.1s cubic-bezier(0.4, 0, 0.2, 1)"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  pointerEvents={effectiveCollapsed ? "none" : "auto"}
                  maxW={effectiveCollapsed ? "0" : "100%"}
                  w={effectiveCollapsed ? "0" : "auto"}
                >
                  {item.label}
                </Text>
                {item.badge && (
                  <Badge
                    bg="rgba(255, 255, 255, 0.12)"
                    color={sidebarPalette.text}
                    size="sm"
                    borderRadius="full"
                    fontSize="2xs"
                    px={1.5}
                    py={0.5}
                    fontWeight="600"
                    opacity={effectiveCollapsed ? 0 : 1}
                    visibility={effectiveCollapsed ? 'hidden' : 'visible'}
                    transition="opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.1s cubic-bezier(0.4, 0, 0.2, 1)"
                    pointerEvents={effectiveCollapsed ? "none" : "auto"}
                    maxW={effectiveCollapsed ? "0" : "100%"}
                    overflow="hidden"
                    w={effectiveCollapsed ? "0" : "auto"}
                  >
                    {item.badge}
                  </Badge>
                )}
              </HStack>
              <Icon 
                as={isExpanded ? FiChevronDown : FiChevronRight} 
                boxSize="15px" 
                color={isItemActive ? sidebarPalette.text : sidebarPalette.textMuted}
                flexShrink={0}
                display={effectiveCollapsed ? "none" : "block"}
                opacity={effectiveCollapsed ? 0 : 1}
                visibility={effectiveCollapsed ? 'hidden' : 'visible'}
                transition="opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.1s cubic-bezier(0.4, 0, 0.2, 1)"
                pointerEvents={effectiveCollapsed ? "none" : "auto"}
                w={effectiveCollapsed ? "0" : "auto"}
              />
            </HStack>
          </Box>

          {/* Dropdown Sub-items */}
          <Box
            opacity={effectiveCollapsed ? 0 : 1}
            visibility={effectiveCollapsed ? 'hidden' : 'visible'}
            transition="opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.15s cubic-bezier(0.4, 0, 0.2, 1)"
            pointerEvents={effectiveCollapsed ? "none" : "auto"}
            w="100%"
            h={effectiveCollapsed ? 0 : "auto"}
            overflow="hidden"
          >
            <Collapse in={isExpanded} animateOpacity>
              <VStack spacing={1} align="stretch" pl={7} mt={1.5}>
                {item.subItems.map((subItem) => {
                  const isSubActive = isSubItemActive(subItem.path);
                  const isSubHovered = hoveredItem === subItem.name;
                  return (
                    <Box
                      key={subItem.path}
                      as="button"
                      w="100%"
                      p={1.5}
                      borderRadius="md"
                      bg={isSubActive 
                        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.12) 100%)' 
                        : 'transparent'
                      }
                      color={isSubActive ? 'white' : 'gray.500'}
                      _hover={{
                        bg: isSubActive 
                          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.18) 100%)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                        transform: 'translateX(2px)',
                      }}
                      transition="all 0.1s cubic-bezier(0.4, 0, 0.2, 1)"
                      onClick={() => handleNavigation(subItem.path)}
                      position="relative"
                      border="1px solid"
                      borderColor={isSubActive ? 'rgba(102, 126, 234, 0.4)' : 'transparent'}
                      transform={isSubHovered ? 'translateX(2px)' : 'translateX(0)'}
                      onMouseEnter={() => setHoveredItem(subItem.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <HStack spacing={2.5} align="center">
                        <Box
                          p="4px"
                          borderRadius="sm"
                          bg={isSubActive 
                            ? 'rgba(102, 126, 234, 0.25)' 
                            : 'rgba(255, 255, 255, 0.05)'
                          }
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          transform={isSubHovered ? 'scale(1.05)' : 'scale(1)'}
                          transition="transform 0.1s ease"
                          w="28px"
                          h="28px"
                          minW="28px"
                          minH="28px"
                        >
                          <Icon 
                            as={subItem.icon} 
                            boxSize="15px" 
                            color={isSubActive ? 'white' : 'gray.500'} 
                            flexShrink={0}
                          />
                        </Box>
                        <Text 
                          fontWeight={isSubActive ? '500' : '400'} 
                          textAlign="left"
                          fontSize="xs"
                        >
                          {subItem.label}
                        </Text>
                        {subItem.badge && (
                          <Badge
                            colorScheme="blue"
                            variant="solid"
                            size="sm"
                            borderRadius="full"
                            fontSize="2xs"
                            px={1}
                            py={0.5}
                          >
                            {subItem.badge}
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </Collapse>
          </Box>
        </Box>
      );
    }

    // Single Menu Item
    return (
      <Box key={item.path} w="100%" mb={effectiveCollapsed ? 0.5 : 0.5}>
        <Box
          as="button"
          w="100%"
          p={effectiveCollapsed ? 1.5 : 2}
          borderRadius="lg"
          bg={isItemActive 
            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.15) 100%)' 
            : 'transparent'
          }
          color={isItemActive ? sidebarPalette.text : sidebarPalette.textMuted}
          _hover={{
            bg: isItemActive 
              ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.35) 0%, rgba(118, 75, 162, 0.2) 100%)' 
              : 'rgba(255, 255, 255, 0.05)',
            color: 'white',
            transform: effectiveCollapsed ? 'scale(1.05)' : 'translateX(3px)',
          }}
          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          onClick={() => handleNavigation(item.path)}
          position="relative"
          border="1px solid"
          borderColor={isItemActive ? 'rgba(102, 126, 234, 0.4)' : 'transparent'}
          boxShadow={isItemActive 
            ? '0 2px 8px rgba(102, 126, 234, 0.3)' 
            : 'none'
          }
          transform={effectiveCollapsed ? 'translateX(0)' : (isItemActive ? 'translateX(2px)' : 'translateX(0)')}
          onMouseEnter={() => setHoveredItem(item.name)}
          onMouseLeave={() => setHoveredItem(null)}
          display="flex"
          alignItems="center"
          justifyContent={effectiveCollapsed ? "center" : "flex-start"}
        >
          {/* Always render full structure, just hide/show with opacity */}
          <HStack 
            spacing={effectiveCollapsed ? 0 : 3} 
            align="center" 
            w="100%" 
            justify={effectiveCollapsed ? "center" : "flex-start"}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="md"
              bg={isItemActive 
                ? 'rgba(102, 126, 234, 0.25)' 
                : 'rgba(255, 255, 255, 0.05)'
              }
              w="36px"
              h="36px"
              minW="36px"
              minH="36px"
              p={effectiveCollapsed ? 0 : "4px"}
              transform={isItemHovered ? 'scale(1.05)' : 'scale(1)'}
              transition="transform 0.1s ease"
            >
              <Icon 
                as={item.icon} 
                boxSize="15px" 
                color={isItemActive ? sidebarPalette.text : sidebarPalette.textMuted} 
              />
            </Box>
            <Text 
              fontWeight={isItemActive ? '600' : '400'} 
              fontSize="sm"
              letterSpacing="0.01em"
              flex={effectiveCollapsed ? 0 : 1}
              textAlign="left"
              opacity={effectiveCollapsed ? 0 : 1}
              visibility={effectiveCollapsed ? 'hidden' : 'visible'}
              transition="opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.15s cubic-bezier(0.4, 0, 0.2, 1)"
              whiteSpace="nowrap"
              overflow="hidden"
              pointerEvents={effectiveCollapsed ? "none" : "auto"}
              maxW={effectiveCollapsed ? "0" : "100%"}
              w={effectiveCollapsed ? "0" : "auto"}
            >
              {item.label}
            </Text>
            {item.badge && (
              <Badge
                colorScheme={item.badge === 'New' ? 'green' : 'red'}
                variant="solid"
                size="sm"
                borderRadius="full"
                fontSize="2xs"
                px={1.5}
                py={0.5}
                fontWeight="600"
                opacity={effectiveCollapsed ? 0 : 1}
                visibility={effectiveCollapsed ? 'hidden' : 'visible'}
                transition="opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.1s cubic-bezier(0.4, 0, 0.2, 1)"
                pointerEvents={effectiveCollapsed ? "none" : "auto"}
                maxW={effectiveCollapsed ? "0" : "100%"}
                overflow="hidden"
                w={effectiveCollapsed ? "0" : "auto"}
              >
                {item.badge}
              </Badge>
            )}
          </HStack>
        </Box>
      </Box>
    );
  };

  // Determine effective collapsed state - in hover mode, use isHovered
  const effectiveCollapsed = isHoverMode ? !isHovered : isCollapsed;
  
  // Use fixed widths for smooth animation
  const sidebarWidth = effectiveCollapsed ? '80px' : '320px';

  return (
    <Box
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      bg={sidebarPalette.background}
      borderRight={`1px solid ${sidebarPalette.border}`}
      boxShadow={sidebarPalette.glow}
      zIndex={9999}
      overflow="hidden"
      display={isMobile && effectiveCollapsed ? "none" : "flex"}
      flexDirection="column"
      transform="translateZ(0)"
      backdropFilter="blur(12px)"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        maxWidth: sidebarWidth,
        transition: 'width 0.1s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.1s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'width, min-width, max-width',
        '@media (max-width: 575px)': {
          width: effectiveCollapsed ? '80px' : '100%',
          maxWidth: effectiveCollapsed ? '80px' : '100%',
          minWidth: effectiveCollapsed ? '80px' : '100%',
        },
        '@media (min-width: 576px) and (max-width: 1199px)': {
          width: sidebarWidth,
          maxWidth: sidebarWidth,
          minWidth: sidebarWidth,
        },
        '@media (min-width: 1200px) and (max-width: 1399px)': {
          width: effectiveCollapsed ? '80px' : '300px',
          maxWidth: effectiveCollapsed ? '80px' : '300px',
          minWidth: effectiveCollapsed ? '80px' : '300px',
        },
      }}
    >
      {/* Header */}
      <Box 
        p={effectiveCollapsed ? 3 : 4} 
        borderBottom={`1px solid ${sidebarPalette.border}`} 
        mb={3}
        flexShrink={0}
        minH={effectiveCollapsed ? "60px" : "70px"}
        bg={sidebarPalette.headerBg}
        position="relative"
      >
        <HStack spacing={effectiveCollapsed ? 0 : 3} justify={effectiveCollapsed ? "center" : "space-between"} align="flex-start">
          <HStack spacing={effectiveCollapsed ? 0 : 3} justify={effectiveCollapsed ? "center" : "flex-start"} flex={1}>
            <Box
              onClick={effectiveCollapsed && !isHoverMode ? toggleSidebar : undefined}
              cursor={effectiveCollapsed && !isHoverMode ? "pointer" : "default"}
              transition="transform 0.1s"
              _hover={effectiveCollapsed && !isHoverMode ? { transform: "scale(1.1)" } : {}}
            >
              <FindMeLogo />
            </Box>
            <Box
              opacity={effectiveCollapsed ? 0 : 1}
              visibility={effectiveCollapsed ? 'hidden' : 'visible'}
              transition="opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.15s cubic-bezier(0.4, 0, 0.2, 1)"
              pointerEvents={effectiveCollapsed ? "none" : "auto"}
              whiteSpace="nowrap"
              overflow="hidden"
              maxW={effectiveCollapsed ? "0" : "100%"}
            >
              <Text 
                fontSize="lg" 
                fontWeight="bold" 
                color={sidebarPalette.text}
                letterSpacing="0.04em"
              >
                FunnelsEye
              </Text>
              <Text fontSize="2xs" color={sidebarPalette.textMuted} mt={-0.5}>
                Dashboard
              </Text>
            </Box>
          </HStack>
          
          {/* Action Buttons - Top Right Corner */}
          {!effectiveCollapsed && (
            <HStack 
              spacing={1.5} 
              position="relative"
              zIndex={10}
              align="center"
            >
              {/* Hover Mode Toggle Button - Only visible when sidebar is open */}
              <IconButton
                aria-label={isHoverMode ? "Disable hover mode" : "Enable hover mode"}
                icon={<Icon as={FiMove} />}
                size="xs"
                variant="ghost"
                color={isHoverMode ? '#667eea' : sidebarPalette.textMuted}
                bg={isHoverMode ? 'rgba(102, 126, 234, 0.15)' : 'transparent'}
                _hover={{
                  bg: isHoverMode ? 'rgba(102, 126, 234, 0.25)' : sidebarPalette.panelHover,
                  color: isHoverMode ? '#667eea' : sidebarPalette.text,
                  transform: 'scale(1.1)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleHoverMode();
                }}
                borderRadius="md"
                minW="auto"
                h="auto"
                p={1.5}
                boxSize="28px"
                title={isHoverMode ? "Disable hover mode" : "Enable hover mode"}
                transition="all 0.1s ease"
              />
              
              {/* Close Button - Only show when not in hover mode */}
              {!isHoverMode && (
                <IconButton
                  aria-label="Collapse sidebar"
                  icon={<Icon as={FiX} />}
                  size="xs"
                  variant="ghost"
                  color={sidebarPalette.textMuted}
                  bg="transparent"
                  _hover={{
                    bg: sidebarPalette.panelHover,
                    color: sidebarPalette.text,
                    transform: 'scale(1.1)',
                  }}
                  onClick={toggleSidebar}
                  borderRadius="md"
                  minW="auto"
                  h="auto"
                  p={1.5}
                  boxSize="28px"
                  title="Collapse sidebar"
                  transition="all 0.1s ease"
                />
              )}
            </HStack>
          )}
        </HStack>
      </Box>

      {/* Navigation Menu */}
      <Box 
        flex={1} 
        overflowY="auto" 
        overflowX="hidden"
        px={effectiveCollapsed ? 0 : 2.5}
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <VStack 
          spacing={effectiveCollapsed ? 0.5 : 3} 
          py={effectiveCollapsed ? 1 : 2} 
          align="stretch"
          w="100%"
        >
          {menuGroups.map((group, groupIndex) => (
            <Box key={groupIndex} w="100%">
              <Text
                fontSize="2xs"
                fontWeight="600"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="0.1em"
                px={2}
                py={1.5}
                mb={1}
                opacity={effectiveCollapsed ? 0 : 1}
                visibility={effectiveCollapsed ? 'hidden' : 'visible'}
                transition="opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.1s cubic-bezier(0.4, 0, 0.2, 1)"
                pointerEvents={effectiveCollapsed ? "none" : "auto"}
                whiteSpace="nowrap"
                overflow="hidden"
                maxW={effectiveCollapsed ? "0" : "100%"}
                minH="auto"
                h="auto"
              >
                {effectiveCollapsed ? " " : group.title}
              </Text>
              <VStack 
                spacing={effectiveCollapsed ? 0.5 : 0.5} 
                align="stretch"
              >
                {group.items.map((item, index) => renderMenuItem(item, index))}
              </VStack>
              {/* Divider - Show between groups (both collapsed and expanded), hide after last group */}
              {groupIndex < menuGroups.length - 1 && (
                <Box 
                  w="100%" 
                  display="flex" 
                  justifyContent="center" 
                  my={effectiveCollapsed ? 1 : 2}
                  minH="1px"
                  h="1px"
                >
                  <Divider 
                    borderColor={effectiveCollapsed ? "transparent" : "rgba(255, 255, 255, 0.05)"}
                    w={effectiveCollapsed ? "60%" : "100%"}
                    opacity={1}
                    visibility="visible"
                    transition="border-color 0.1s cubic-bezier(0.4, 0, 0.2, 1), width 0.1s cubic-bezier(0.4, 0, 0.2, 1)"
                    minH="1px"
                    h="1px"
                  />
                </Box>
              )}
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Restore Button when Collapsed - at bottom */}
      {effectiveCollapsed && !isHoverMode && (
        <Box 
          p={2.5} 
          flexShrink={0}
          mt="auto"
          borderTop="1px solid rgba(255, 255, 255, 0.1)"
        >
          <Box
            as="button"
            w="100%"
            p={3}
            borderRadius="lg"
            bg="rgba(102, 126, 234, 0.1)"
            color="white"
            _hover={{
              bg: 'rgba(102, 126, 234, 0.2)',
              transform: 'scale(1.05)',
            }}
            transition="all 0.1s cubic-bezier(0.4, 0, 0.2, 1)"
            onClick={toggleSidebar}
            position="relative"
            border="1px solid"
            borderColor="rgba(102, 126, 234, 0.3)"
            boxShadow="0 2px 6px rgba(102, 126, 234, 0.2)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="40px"
            minH="40px"
          >
            <Icon as={FiMenu} boxSize="15px" color="#667eea" />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;