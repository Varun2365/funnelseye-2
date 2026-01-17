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

  Tooltip,

  MenuGroup,

  useBreakpointValue,

  Button,

  VStack,

  Divider,

  Spinner,

  useToast,

} from '@chakra-ui/react';

import {

  FiBell,

  FiLogOut,

  FiSettings,

  FiUser,

  FiMessageCircle,

  FiVideo,

  FiCreditCard,

  FiMenu,

  FiX,

  FiCheck,

  FiTrash2,

  FiAlertTriangle,

  FiInfo,

  FiClock,

  FiCheckCircle,

  FiCalendar,

  FiWifi,
  FiWifiOff,
} from 'react-icons/fi';

import { logout } from '../redux/authSlice';

import { selectUser } from '../redux/authSlice';

import { dashboardAPI } from '../services/api';

import { API_BASE_URL } from '../config/apiConfig';
import axios from 'axios';


const TopNav = () => {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const user = useSelector(selectUser);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userData, setUserData] = useState(user);

  const toast = useToast();

  // Fetch latest user data on mount to get updated profile picture
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUserData(data.user);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Update userData when Redux user changes
  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  // Get profile picture URL - same logic as Profile.jsx
  const currentUser = userData || user;
  let profilePictureUrl = null;
  if (currentUser?.profilePicture) {
    if (currentUser.profilePicture.startsWith('http://') || currentUser.profilePicture.startsWith('https://')) {
      profilePictureUrl = currentUser.profilePicture;
    } else if (currentUser.profilePicture.startsWith('/')) {
      profilePictureUrl = `${API_BASE_URL.replace('/api', '')}${currentUser.profilePicture}`;
    } else {
      // If it's just a filename, construct the full URL
      profilePictureUrl = `${API_BASE_URL.replace('/api', '')}/uploads/images/${currentUser.profilePicture}`;
    }
  } else if (currentUser?.profilePictureUrl) {
    profilePictureUrl = currentUser.profilePictureUrl;
  } else if (currentUser?.avatar) {
    profilePictureUrl = currentUser.avatar;
  }

  

  // Notification state

  const [notifications, setNotifications] = useState([]);

  const [notificationCount, setNotificationCount] = useState(0);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);

  

  // Check if we're on mobile

  const isMobile = useBreakpointValue({ base: true, md: false });



  const bgColor = useColorModeValue('white', 'gray.800');

  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const textColor = useColorModeValue('gray.600', 'gray.300');

  const cardBgColor = useColorModeValue('white', 'gray.700');

  const hoverBgColor = useColorModeValue('gray.50', 'gray.600');



  // Fetch notifications from notification API
  const fetchNotifications = async () => {

    // Don't fetch notifications if account is deactivated or under review
    const isAccountDeactivated = localStorage.getItem('account_deactivated') === 'true';
    const isAccountUnderReview = localStorage.getItem('account_under_review') === 'true';
    if (isAccountDeactivated || isAccountUnderReview) {
      setLoading(false);
      setNotifications([]);
      setNotificationCount(0);
      setUnreadCount(0);
      return;
    }

    setLoading(true);

    try {

      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Try to fetch from notification API first
      try {
        const response = await axios.get(`${API_BASE_URL}/api/notifications?limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          const notifications = response.data.data.notifications.map(notif => ({
            id: notif._id,
            type: notif.type,
            title: notif.title || 'Notification',
            message: notif.message,
            priority: notif.priority,
            timestamp: notif.createdAt,
            read: notif.isRead,
            category: notif.type,
            icon: notif.type === 'error' ? 'error' : notif.type === 'warning' ? 'warning' : notif.type === 'success' ? 'success' : 'info',
            actionUrl: notif.actionUrl,
            actionLabel: notif.actionLabel
          }));
          
          setNotifications(notifications);
          setUnreadCount(response.data.data.unreadCount);
          setNotificationCount(notifications.length);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.warn('Notification API not available, falling back to dashboard API:', apiError);
      }

      // Fallback to dashboard API if notification API fails
      const dashboardData = await dashboardAPI.getCompleteData();
      const notifications = [];

      // Ensure dashboardData exists and has expected structure
      if (!dashboardData) {
        console.warn('Dashboard data not available');
        setNotifications([]);
        setNotificationCount(0);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      // 1. Performance Alerts (High Priority)

      if (dashboardData.performance?.alerts) {

        const alerts = dashboardData.performance.alerts.map((alert, index) => ({

          id: `performance_alert_${index}`,

          type: 'performance_alert',

          title: alert.message,

          message: alert.recommendation,

          priority: alert.type === 'error' ? 'high' : alert.type === 'warning' ? 'medium' : 'low',

          value: alert.value,

          timestamp: new Date().toISOString(),

          read: false,

          category: 'Performance',

          icon: alert.type === 'warning' ? 'warning' : alert.type === 'error' ? 'error' : 'success'

        }));

        notifications.push(...alerts);

      }



      // 2. Recent Leads (Medium Priority)

      if (dashboardData.leads?.recentLeads) {

        const recentLeads = dashboardData.leads.recentLeads.slice(0, 3); // Latest 3 leads

        const leadNotifications = recentLeads.map((lead, index) => ({

          id: `lead_${lead.id || index}`,

          type: 'lead_notification',

          title: `New Lead: ${lead.name}`,

          message: `Status: ${lead.status} | Source: ${lead.source}`,

          priority: lead.status === 'Appointment' ? 'high' : 'medium',

          value: lead.status,

          timestamp: lead.createdAt || new Date().toISOString(),

          read: false,

          category: 'Leads',

          icon: 'info'

        }));

        notifications.push(...leadNotifications);

      }



      // 3. Task Alerts (Medium Priority)

      if (dashboardData.tasks) {

        // Overdue tasks

        if (dashboardData.tasks.overdueTasks > 0) {

          notifications.push({

            id: 'overdue_tasks',

            type: 'task_alert',

            title: `${dashboardData.tasks.overdueTasks} Overdue Task${dashboardData.tasks.overdueTasks > 1 ? 's' : ''}`,

            message: 'You have overdue tasks that need immediate attention',

            priority: 'high',

            value: `${dashboardData.tasks.overdueTasks}`,

            timestamp: new Date().toISOString(),

            read: false,

            category: 'Tasks',

            icon: 'warning'

          });

        }



        // Upcoming tasks

        if (dashboardData.tasks.upcomingTasks > 0) {

          notifications.push({

            id: 'upcoming_tasks',

            type: 'task_reminder',

            title: `${dashboardData.tasks.upcomingTasks} Task${dashboardData.tasks.upcomingTasks > 1 ? 's' : ''} Due Soon`,

            message: 'Tasks are due in the next 24 hours',

            priority: 'medium',

            value: `${dashboardData.tasks.upcomingTasks}`,

            timestamp: new Date().toISOString(),

            read: false,

            category: 'Tasks',

            icon: 'clock'

          });

        }

      }



      // 4. Calendar/Appointment Alerts (Medium Priority)

      if (dashboardData.calendar?.nextAppointment) {

        const appointment = dashboardData.calendar.nextAppointment;

        const appointmentTime = new Date(appointment.startTime);

        const now = new Date();

        const timeDiff = appointmentTime - now;

        const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));



        if (hoursUntil <= 24 && hoursUntil > 0) {

          notifications.push({

            id: `appointment_${appointment._id}`,

            type: 'appointment_reminder',

            title: `Upcoming Appointment: ${appointment.leadId.name}`,

            message: `Scheduled for ${appointmentTime.toLocaleString()} (${hoursUntil}h remaining)`,

            priority: hoursUntil <= 2 ? 'high' : 'medium',

            value: `${hoursUntil}h`,

            timestamp: new Date().toISOString(),

            read: false,

            category: 'Calendar',

            icon: 'calendar'

          });

        }

      }



      // 5. Daily Feed Items (Low-Medium Priority)

      if (dashboardData.dailyFeed) {

        // Recent leads from daily feed

        const recentFeedLeads = dashboardData.dailyFeed

          .filter(item => item.type === 'Recent Lead')

          .slice(0, 2); // Latest 2 recent leads



        const feedNotifications = recentFeedLeads.map((item, index) => ({

          id: `feed_lead_${item.leadId}`,

          type: 'feed_notification',

          title: item.title,

          message: item.description,

          priority: 'low',

          value: 'New',

          timestamp: item.createdAt || new Date().toISOString(),

          read: false,

          category: 'Daily Feed',

          icon: 'info'

        }));

        notifications.push(...feedNotifications);



        // Stale leads (high priority for re-engagement)

        const staleLeads = dashboardData.dailyFeed

          .filter(item => item.type === 'Stale Lead - Re-engage')

          .slice(0, 2); // Top 2 stale leads



        const staleNotifications = staleLeads.map((item, index) => ({

          id: `stale_lead_${item.leadId}`,

          type: 'stale_lead_alert',

          title: item.title,

          message: item.description,

          priority: 'medium',

          value: 'Stale',

          timestamp: item.lastActivityAt || new Date().toISOString(),

          read: false,

          category: 'Leads',

          icon: 'warning'

        }));

        notifications.push(...staleNotifications);

      }



      // 6. Performance Alerts (High Priority)

      if (dashboardData.performance?.alerts) {

        const performanceAlerts = dashboardData.performance.alerts.map((alert, index) => ({

          id: `performance_alert_${index}`,

          type: 'performance_alert',

          title: alert.message,

          message: alert.recommendation,

          priority: alert.type === 'error' ? 'high' : alert.type === 'warning' ? 'medium' : 'low',

          value: alert.value,

          timestamp: new Date().toISOString(),

          read: false,

          category: 'Performance',

          icon: alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : 'success'

        }));

        notifications.push(...performanceAlerts);

      }



      // 7. Team Performance Alerts (Low Priority)

      if (dashboardData.team?.teamAnalytics) {

        const analytics = dashboardData.team.teamAnalytics;

        

        // Low average score alert

        if (analytics.averageScore < 5) {

          notifications.push({

            id: 'team_performance',

            type: 'team_alert',

            title: 'Team Performance Below Target',

            message: `Average team score: ${analytics.averageScore}/10. Consider additional training.`,

            priority: 'medium',

            value: `${analytics.averageScore}/10`,

            timestamp: new Date().toISOString(),

            read: false,

            category: 'Team',

            icon: 'warning'

          });

        }

      }



      // 8. Financial Alerts (Low Priority)

      if (dashboardData.financial?.metrics) {

        const metrics = dashboardData.financial.metrics;

        

        // Zero revenue alert

        if (metrics.totalRevenue === 0) {

          notifications.push({

            id: 'zero_revenue',

            type: 'financial_alert',

            title: 'No Revenue Generated',

            message: 'Consider focusing on lead conversion and sales activities',

            priority: 'medium',

            value: '₹0',

            timestamp: new Date().toISOString(),

            read: false,

            category: 'Financial',

            icon: 'warning'

          });

        }

      }



      // Sort notifications by priority and timestamp (newest first)

      notifications.sort((a, b) => {

        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };

        const aPriority = priorityOrder[a.priority] || 0;

        const bPriority = priorityOrder[b.priority] || 0;

        

        if (aPriority !== bPriority) {

          return bPriority - aPriority; // Higher priority first

        }

        

        return new Date(b.timestamp) - new Date(a.timestamp); // Newer first

      });



      const unreadCount = notifications.filter(n => !n.read).length;



      setNotifications(notifications);

      setNotificationCount(notifications.length);

      setUnreadCount(unreadCount);



      console.log('✅ Real-time notifications fetched successfully:', notifications.length);

      console.log('📊 Notification breakdown:', {

        performance: notifications.filter(n => n.category === 'Performance').length,

        leads: notifications.filter(n => n.category === 'Leads').length,

        tasks: notifications.filter(n => n.category === 'Tasks').length,

        calendar: notifications.filter(n => n.category === 'Calendar').length,

        team: notifications.filter(n => n.category === 'Team').length,

        financial: notifications.filter(n => n.category === 'Financial').length,

        feed: notifications.filter(n => n.category === 'Daily Feed').length

      });

      console.log('🔍 All notifications:', notifications);



    } catch (error) {

      // Silently handle errors when account is deactivated
      const isAccountDeactivated = localStorage.getItem('account_deactivated') === 'true';
      if (!isAccountDeactivated) {
        console.warn('⚠️ Error fetching notifications (non-critical):', error.message);
      }

      // Set empty state if API fails
      setNotifications([]);

      setNotificationCount(0);

      setUnreadCount(0);



      // Only show toast for network errors, not for expected errors

      const errorMessage = error.message || error.toString();

      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('Network error')) {

        // Don't show toast on every failed fetch to avoid spam

        // The error is already logged to console

        console.warn('⚠️ Network error fetching notifications - this may be due to CORS, connectivity, or server issues');

      } else {

        toast({

          title: 'Error',

          description: errorMessage || 'Failed to load notifications',

          status: 'error',

          duration: 3000,

          isClosable: true,

        });

      }

    } finally {

      setLoading(false);

    }

  };



  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Update local state immediately for better UX
    setNotifications(prev => 

      prev.map(notif => 

          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
      )

    );

    setUnreadCount(prev => Math.max(0, prev - 1));


      // Call API to mark as read
      await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert local state on error
    setNotifications(prev => 

        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: false }
            : notif
        )
      );
      setUnreadCount(prev => prev + 1);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);


      // Call API
      await axios.put(`${API_BASE_URL}/api/notifications/mark-all-read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

    toast({

      title: 'Success',

      description: 'All notifications marked as read',

      status: 'success',

      duration: 2000,

      isClosable: true,

    });

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const notification = notifications.find(n => n.id === notificationId);
      const wasUnread = notification && !notification.read;

      // Update local state
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

      if (wasUnread) {
    setUnreadCount(prev => Math.max(0, prev - 1));

      }
      setNotificationCount(prev => prev - 1);

      // Call API
      await axios.delete(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        status: 'error',
        duration: 3000,
      });
    }
  };



  // Get icon for notification type

  const getNotificationIcon = (icon) => {

    switch (icon) {

      case 'warning':

        return FiAlertTriangle;

      case 'error':

        return FiAlertTriangle;

      case 'success':

        return FiCheckCircle;

      case 'info':

        return FiInfo;

      case 'clock':

        return FiClock;

      case 'calendar':

        return FiCalendar;

      default:

        return FiBell;

    }

  };



  // Get priority color

  const getPriorityColor = (priority) => {

    switch (priority) {

      case 'high':

        return 'red';

      case 'medium':

        return 'orange';

      case 'low':

        return 'green';

      default:

        return 'gray';

    }

  };



  // Format timestamp

  const formatTimestamp = (timestamp) => {

    const now = new Date();

    const time = new Date(timestamp);

    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    

    if (diffInMinutes < 1) return 'Just now';

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;

    return `${Math.floor(diffInMinutes / 1440)}d ago`;

  };



  // All useEffect hooks at the top to maintain order

  useEffect(() => {

    const handleSidebarEvent = (event) => {

      console.log('TopNav: Received sidebar event:', event.detail);

      

      if (event.detail) {

        if (event.detail.width) {

          // Handle width-based events

          const newCollapsed = event.detail.width === '80px';

          setIsSidebarCollapsed(newCollapsed);

          console.log('TopNav: Updated state based on width:', newCollapsed);

        } else if (event.detail.action === 'toggle') {

          // Handle action-based events

          if (event.detail.collapsed !== undefined) {

            setIsSidebarCollapsed(event.detail.collapsed);

            console.log('TopNav: Updated state based on collapsed value:', event.detail.collapsed);

          } else {

            setIsSidebarCollapsed(prev => !prev);

            console.log('TopNav: Toggled state to:', !event.detail.collapsed);

          }

        }

      }

    };



    window.addEventListener('sidebarToggle', handleSidebarEvent);

    return () => {

      window.removeEventListener('sidebarToggle', handleSidebarEvent);

    };

  }, []);



  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);


  const handleSidebarToggle = () => {

    console.log('TopNav: Sidebar toggle clicked, current state:', isSidebarCollapsed);

    

    // Use the same logic as Sidebar - directly update state

    setIsSidebarCollapsed(prev => {

      const newState = !prev;

      console.log('TopNav: Toggling sidebar state to:', newState);

      

      // Dispatch event to notify Sidebar and MainLayout

      const event = new CustomEvent('sidebarToggle', {

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

    dispatch(logout());

  };





  const handleProfileClick = () => {

    navigate('/profile');

  };



  const handleWhatsAppSettings = () => {

    navigate('/whatsapp_setup');

  };



  const handleZoomSettings = () => {

    navigate('/zoom-settings');

  };



  const handlePaymentGateways = () => {

    navigate('/payment-gateways');

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

            <Text fontSize="2xl" fontWeight="bold" color="brand.600" noOfLines={1}>

              Welcome back, {currentUser?.name || 'User'}!

            </Text>

            <Text fontSize="sm" color={textColor} noOfLines={1}>

              Here's what's happening with your business today

            </Text>

          </Box>

        </HStack>



        {/* Right Section */}

        <HStack spacing={4}>

          {/* Priority Feed Button */}

          <Tooltip label="Daily Priority Feed">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FiBell />}
              colorScheme="blue"
              fontSize="sm"
              fontWeight="600"
              borderRadius="md"
              onClick={() => window.dispatchEvent(new CustomEvent('openPriorityFeed'))}
              _hover={{ bg: 'blue.50', borderColor: 'blue.300' }}
              _active={{ bg: 'blue.100', borderColor: 'blue.400' }}
            >
              Show Priority Feed
            </Button>
          </Tooltip>

          {/* Notifications Dropdown */}

          <Box position="relative">

            <Tooltip label="Notifications">

              <IconButton

                icon={<FiBell />}

                variant="ghost"

                size="md"

                aria-label="Notifications"

                position="relative"

                onClick={() => setShowNotifications(!showNotifications)}

                _hover={{ bg: 'rgba(102, 126, 234, 0.1)' }}

              >

                {unreadCount > 0 && (

                  <Badge

                    position="absolute"

                    top="8px"

                    right="8px"

                    colorScheme="red"

                    variant="solid"

                    size="sm"

                    borderRadius="full"

                    fontSize="xs"

                    minW="18px"

                    h="18px"

                    display="flex"

                    alignItems="center"

                    justifyContent="center"

                  >

                    {unreadCount}

                  </Badge>

                )}

              </IconButton>

            </Tooltip>



            {/* Notifications Dropdown */}

            {showNotifications && (

              <Box

                position="absolute"

                top="100%"

                right={0}

                mt={2}

                bg={cardBgColor}

                borderRadius="xl"
                boxShadow="0 20px 60px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.08)"
                border="1px"

                borderColor={useColorModeValue('gray.200', 'gray.700')}
                minW="420px"
                maxW="480px"
                w="420px"
                zIndex={1000}

                overflow="hidden"

              >

                {/* Minimal Header */}
                <Flex
                  px={5}
                  py={4}
                  borderBottom="1px"

                  borderColor={useColorModeValue('gray.100', 'gray.700')}
                  alignItems="center"
                  justifyContent="space-between"
                  bg={useColorModeValue('white', 'gray.800')}
                >
                  <HStack spacing={3}>
                    <Text fontSize="md" fontWeight="600" color={textColor}>
                        Notifications

                      </Text>

                      {unreadCount > 0 && (

                      <Badge 
                        colorScheme="blue" 
                        variant="subtle"
                        borderRadius="full"
                        px={2}
                        py={0.5}
                        fontSize="xs"
                        fontWeight="600"
                      >
                          {unreadCount} new

                        </Badge>

                      )}

                  </HStack>
                  <HStack spacing={2}>
                      {unreadCount > 0 && (

                      <IconButton
                        size="sm"
                        variant="ghost"
                        icon={<FiCheck />}
                          onClick={markAllAsRead}

                        aria-label="Mark all as read"
                        _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                      />
                    )}
                    <IconButton
                      size="sm"
                        variant="ghost"

                      icon={<FiX />}
                        onClick={() => setShowNotifications(false)}

                      aria-label="Close"
                      _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                    />
                  </HStack>
                    </Flex>



                {/* Notifications List */}

                <Box maxH="500px" overflowY="auto" bg={useColorModeValue('gray.50', 'gray.900')}>
                  {loading ? (

                    <Box p={12} textAlign="center">
                      <Spinner size="sm" color="brand.500" thickness="2px" />
                      <Text mt={3} fontSize="sm" color="gray.500">Loading...</Text>
                    </Box>

                  ) : notifications.length === 0 ? (

                    <Box p={12} textAlign="center">
                      <Box
                        w={12}
                        h={12}
                        mx="auto"
                        mb={3}
                        borderRadius="full"
                        bg={useColorModeValue('gray.100', 'gray.700')}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FiBell size={20} color={useColorModeValue('#9CA3AF', '#6B7280')} />
                      </Box>
                      <Text fontSize="sm" fontWeight="500" color={textColor} mb={1}>
                        No notifications
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        You're all caught up
                      </Text>

                    </Box>

                  ) : (

                    <VStack spacing={0} align="stretch" divider={<Box borderColor={useColorModeValue('gray.100', 'gray.700')} />}>
                      {notifications.map((notification) => {
                        const IconComponent = getNotificationIcon(notification.icon);

                        const priorityColor = getPriorityColor(notification.priority);

                        

                        return (

                          <Box

                            key={notification.id}

                            px={5}
                            py={4}
                            bg={notification.read ? 'transparent' : useColorModeValue('blue.50', 'blue.900')}

                            _hover={{ bg: useColorModeValue('gray.100', 'gray.800') }}
                            transition="all 0.15s ease"
                            cursor={notification.actionUrl ? 'pointer' : 'default'}
                            position="relative"
                            onClick={() => {
                              if (notification.actionUrl) {
                                markAsRead(notification.id);
                                navigate(notification.actionUrl);
                                setShowNotifications(false);
                              }
                            }}
                          >
                            {!notification.read && (
                              <Box
                                position="absolute"
                                left={0}
                                top={0}
                                bottom={0}
                                w={1}
                                bg="blue.500"
                              />
                            )}
                            <Flex alignItems="flex-start" gap={3}>

                              <Box

                                w={8}
                                h={8}
                                borderRadius="lg"
                                bg={useColorModeValue(`${priorityColor}.100`, `${priorityColor}.900`)}
                                color={useColorModeValue(`${priorityColor}.600`, `${priorityColor}.300`)}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                              >

                                <IconComponent size={16} />

                              </Box>

                              

                              <Box flex="1" minW={0}>

                                <HStack spacing={2} mb={1.5} alignItems="flex-start">
                                  <Text 
                                    fontSize="sm" 
                                    fontWeight={notification.read ? "500" : "600"} 
                                    color={textColor}
                                    flex="1"
                                  >
                                    {notification.title}

                                  </Text>

                                  <Text fontSize="xs" color="gray.400" whiteSpace="nowrap">
                                    {formatTimestamp(notification.timestamp)}
                                  </Text>
                                </HStack>
                                
                                <Text 
                                      fontSize="xs"

                                  color={useColorModeValue('gray.600', 'gray.400')} 
                                  lineHeight="1.5"
                                  mb={notification.actionUrl ? 3 : 0}
                                >
                                  {notification.message}

                                </Text>

                                

                                {notification.actionUrl && (
                                  <HStack spacing={2} mt={2}>
                                      <Button

                                        size="xs"

                                        variant="ghost"

                                        colorScheme="blue"

                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                        navigate(notification.actionUrl);
                                        setShowNotifications(false);
                                      }}
                                      px={3}
                                      h={6}
                                      fontSize="xs"
                                    >
                                      {notification.actionLabel || 'View'}
                                      </Button>

                                    {!notification.read && (
                                      <IconButton
                                        size="xs"
                                        variant="ghost"
                                        icon={<FiCheck size={14} />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsRead(notification.id);
                                        }}
                                        aria-label="Mark as read"
                                        h={6}
                                        w={6}
                                      />
                                    )}
                                    <IconButton
                                      size="xs"

                                      variant="ghost"

                                      icon={<FiTrash2 size={14} />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                      }}
                                      aria-label="Delete"
                                      h={6}
                                      w={6}
                                      colorScheme="red"

                                    />
                                  </HStack>
                                )}
                              </Box>

                            </Flex>

                          </Box>

                        );

                      })}

                    </VStack>

                  )}

                </Box>

              </Box>

            )}

          </Box>



          {/* User Menu */}

          <Menu>

            <MenuButton

              as={Button}

              variant="ghost"

              size="md"

              aria-label="User menu"

              _hover={{ bg: 'rgba(102, 126, 234, 0.1)' }}

              p={0}

              minW="auto"

              h="auto"

            >

              <Box
                position="relative"
                display="inline-block"
                p="2px"
                borderRadius="full"
                bg="blue.500"
              >
                <Avatar 

                  size="md" 

                  name={currentUser?.name || 'User'} 

                  src={profilePictureUrl || undefined}

                  bg="brand.500"

                />
              </Box>

            </MenuButton>

            <MenuList 

              minW="320px" 

              borderRadius="2xl" 

              boxShadow="0 20px 60px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1)" 

              border="1px solid"

              borderColor={useColorModeValue('gray.200', 'gray.700')}

              overflow="hidden"

              p={0}

            >

              {/* User Header - Minimal & Elegant */}

              <Box 

                p={6} 

                bg={useColorModeValue('white', 'gray.800')}

                borderBottom="1px solid"

                borderColor={useColorModeValue('gray.100', 'gray.700')}

              >

                <Flex alignItems="center" gap={4}>

                  <Avatar 

                    size="lg" 

                    name={currentUser?.name || 'User'} 

                    src={profilePictureUrl || undefined}

                    border="3px solid"

                    borderColor={useColorModeValue('gray.100', 'gray.600')}

                    bg="brand.500"

                  />

                  <Box flex="1" minW={0}>

                    <Text 

                      fontWeight="600" 

                      fontSize="lg" 

                      color={useColorModeValue('gray.900', 'white')}

                      noOfLines={1}

                    >

                      {currentUser?.name || 'User'}

                    </Text>

                    <Text 

                      fontSize="sm" 

                      color={useColorModeValue('gray.500', 'gray.400')}

                      noOfLines={1}

                      mt={0.5}

                    >

                      {currentUser?.email || 'user@example.com'}

                    </Text>

                    <Badge 

                      bg={useColorModeValue('brand.50', 'brand.900')}

                      color="brand.600"

                      size="sm" 

                      mt={2}

                      px={2}

                      py={0.5}

                      borderRadius="full"

                      fontSize="xs"

                      fontWeight="500"

                    >

                      {currentUser?.role || 'User'}

                    </Badge>

                  </Box>

                </Flex>

              </Box>



              {/* Menu Items - Clean & Minimal */}

              <Box p={2}>

                <MenuItem 

                  icon={<FiUser />} 

                  onClick={handleProfileClick}

                  borderRadius="lg"

                  py={3}

                  px={4}

                  _hover={{ 

                    bg: useColorModeValue('gray.50', 'gray.700'),

                    transform: 'translateX(4px)'

                  }}

                  transition="all 0.2s ease"

                >

                  <VStack align="flex-start" spacing={0} flex="1">

                    <Text fontWeight="500" fontSize="sm" color={useColorModeValue('gray.900', 'white')}>

                      Profile Settings

                    </Text>

                    <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>

                      Manage your account

                    </Text>

                  </VStack>

                </MenuItem>



                <Menu>

                  <MenuButton 

                    as={MenuItem} 

                    icon={<FiSettings />}

                    borderRadius="lg"

                    py={3}

                    px={4}

                    _hover={{ 

                      bg: useColorModeValue('gray.50', 'gray.700'),

                      transform: 'translateX(4px)'

                    }}

                    transition="all 0.2s ease"

                  >

                    <VStack align="flex-start" spacing={0} flex="1">

                      <Text fontWeight="500" fontSize="sm" color={useColorModeValue('gray.900', 'white')}>

                        Settings

                      </Text>

                      <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>

                        Configure preferences

                      </Text>

                    </VStack>

                  </MenuButton>

                  <MenuList 

                    borderRadius="xl" 

                    boxShadow="0 10px 40px rgba(0, 0, 0, 0.1)"

                    border="1px solid"

                    borderColor={useColorModeValue('gray.200', 'gray.700')}

                    minW="200px"

                  >

                    <MenuItem 

                      icon={<FiMessageCircle />} 

                      onClick={handleWhatsAppSettings}

                      borderRadius="md"

                      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}

                    >

                      WhatsApp Integration

                    </MenuItem>

                    <MenuItem 

                      icon={<FiVideo />} 

                      onClick={handleZoomSettings}

                      borderRadius="md"

                      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}

                    >

                      Zoom Meetings

                    </MenuItem>

                    <MenuItem 

                      icon={<FiCreditCard />} 

                      onClick={handlePaymentGateways}

                      borderRadius="md"

                      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}

                    >

                      Payment Methods

                    </MenuItem>

                  </MenuList>

                </Menu>



                <MenuDivider my={2} borderColor={useColorModeValue('gray.200', 'gray.700')} />



                <MenuItem 

                  icon={<FiLogOut />} 

                  onClick={handleLogout}

                  borderRadius="lg"

                  py={3}

                  px={4}

                  _hover={{ 

                    bg: useColorModeValue('red.50', 'red.900'),

                    transform: 'translateX(4px)'

                  }}

                  transition="all 0.2s ease"

                >

                  <VStack align="flex-start" spacing={0} flex="1">

                    <Text fontWeight="500" fontSize="sm" color="red.500">

                      Sign Out

                    </Text>

                    <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>

                      Logout from account

                    </Text>

                  </VStack>

                </MenuItem>

              </Box>

            </MenuList>

          </Menu>

        </HStack>

      </Flex>

    </Box>

  );

};



export default TopNav;