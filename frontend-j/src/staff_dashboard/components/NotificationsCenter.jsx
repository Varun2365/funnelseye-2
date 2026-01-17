import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Text,
  Button,
  Icon,
  HStack,
  VStack,
  Badge,
  Progress,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Tooltip,
  Wrap,
  WrapItem,
  Divider,
  Heading,
  Flex,
  Spacer,
  Avatar,
  AvatarGroup,
  AvatarBadge,
  useBreakpointValue,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  Checkbox,
  CheckboxGroup,
  Stack,
  Tag,
  TagLabel,
  TagCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast,
} from '@chakra-ui/react';
import {
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiTrendingUp,
  FiTarget,
  FiCalendar,
  FiBell,
  FiBarChart,
  FiActivity,
  FiAward,
  FiStar,
  FiRefreshCw,
  FiDownload,
  FiSettings,
  FiEye,
  FiPlus,
  FiFilter,
  FiSearch,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiAlertCircle,
  FiInfo,
  FiThumbsUp,
  FiThumbsDown,
  FiMessageCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiZap,
  FiShield,
  FiLock,
  FiUnlock,
  FiHeart,
  FiBookmark,
  FiShare,
  FiCopy,
  FiExternalLink,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiHome,
  FiMenu,
  FiX,
  FiMinus,
  FiPlusCircle,
  FiMinusCircle,
  FiCheck,
  FiX as FiXIcon,
  FiLoader,
  FiAlertTriangle,
  FiCheckSquare,
  FiSquare,
  FiCircle,
  FiRadio,
  FiToggleLeft,
  FiToggleRight,
  FiSun,
  FiMoon,
  FiMaximize,
  FiMinimize,
  FiWifi,
  FiPlay,
  FiPause,
  FiEdit3,
  FiSave,
  FiXCircle,
  FiBell as FiBellIcon,
  FiCheckCircle as FiCheckCircleIcon,
  FiAlertTriangle as FiAlertTriangleIcon,
  FiInfo as FiInfoIcon,
} from 'react-icons/fi';

const NotificationsCenter = ({ data }) => {
  // Design system colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.500');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  // Responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false });
  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 });
  
  // State management
  const [notifications, setNotifications] = useState(data || []);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    priority: '',
    search: ''
  });
  const [activeTab, setActiveTab] = useState(0);
  
  // Modal states
  const { isOpen: isNotificationModalOpen, onOpen: onNotificationModalOpen, onClose: onNotificationModalClose } = useDisclosure();
  
  const toast = useToast();

  // Filter notifications based on current filters
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesType = !filters.type || notification.type === filters.type;
      const matchesPriority = !filters.priority || notification.priority === filters.priority;
      const matchesSearch = !filters.search || 
        notification.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        notification.message.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesType && matchesPriority && matchesSearch;
    });
  }, [notifications, filters]);

  // Get notifications by type
  const notificationsByType = useMemo(() => {
    return {
      info: filteredNotifications.filter(n => n.type === 'info'),
      warning: filteredNotifications.filter(n => n.type === 'warning'),
      error: filteredNotifications.filter(n => n.type === 'error'),
      success: filteredNotifications.filter(n => n.type === 'success')
    };
  }, [filteredNotifications]);

  // Get notifications by priority
  const notificationsByPriority = useMemo(() => {
    return {
      high: filteredNotifications.filter(n => n.priority === 'HIGH'),
      medium: filteredNotifications.filter(n => n.priority === 'MEDIUM'),
      low: filteredNotifications.filter(n => n.priority === 'LOW')
    };
  }, [filteredNotifications]);

  // Handle notification actions
  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId ? { ...notification, read: true } : notification
    ));
    toast({
      title: 'Notification Marked as Read',
      description: 'Notification has been marked as read',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    toast({
      title: 'All Notifications Marked as Read',
      description: 'All notifications have been marked as read',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    toast({
      title: 'Notification Deleted',
      description: 'Notification has been deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast({
      title: 'All Notifications Cleared',
      description: 'All notifications have been cleared',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info': return FiInfoIcon;
      case 'warning': return FiAlertTriangleIcon;
      case 'error': return FiAlertCircle;
      case 'success': return FiCheckCircleIcon;
      default: return FiBellIcon;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'info': return 'blue';
      case 'warning': return 'orange';
      case 'error': return 'red';
      case 'success': return 'green';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'orange';
      case 'LOW': return 'green';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffMs = now - notificationDate;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="7xl" py={6}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading size="xl" fontWeight="600" color={textColor} mb={2} lineHeight="1.2">
              Notifications Center
            </Heading>
            <Text fontSize="md" color={secondaryTextColor} lineHeight="1.5">
              Stay updated with important alerts and announcements
            </Text>
          </Box>

          {/* Summary Cards */}
          <SimpleGrid columns={gridColumns} spacing={4}>
            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardBody p={6}>
                <Stat>
                  <StatLabel fontSize="sm" color={mutedTextColor}>Total Notifications</StatLabel>
                  <StatNumber fontSize="2xl" color={textColor}>{notifications.length}</StatNumber>
                  <StatHelpText>
                    {notifications.filter(n => !n.read).length} unread
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardBody p={6}>
                <Stat>
                  <StatLabel fontSize="sm" color={mutedTextColor}>High Priority</StatLabel>
                  <StatNumber fontSize="2xl" color="red.500">{notificationsByPriority.high.length}</StatNumber>
                  <StatHelpText>
                    {notificationsByPriority.medium.length} medium
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardBody p={6}>
                <Stat>
                  <StatLabel fontSize="sm" color={mutedTextColor}>Today</StatLabel>
                  <StatNumber fontSize="2xl" color="blue.500">
                    {notifications.filter(n => {
                      const today = new Date().toDateString();
                      const notificationDate = new Date(n.timestamp).toDateString();
                      return today === notificationDate;
                    }).length}
                  </StatNumber>
                  <StatHelpText>
                    Recent activity
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Filters and Actions */}
          <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
            <CardBody p={6}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} flex="1">
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiSearch} color="gray.300" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search notifications..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </InputGroup>
                  
                  <Select
                    placeholder="All Types"
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="success">Success</option>
                  </Select>
                  
                  <Select
                    placeholder="All Priority"
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </Select>
                </SimpleGrid>
                
                <HStack spacing={2}>
                  <Button size="sm" leftIcon={<FiCheckCircle />} colorScheme="green" onClick={handleMarkAllAsRead}>
                    Mark All Read
                  </Button>
                  <Button size="sm" leftIcon={<FiRefreshCw />} variant="outline">
                    Refresh
                  </Button>
                  <Button size="sm" leftIcon={<FiTrash2 />} colorScheme="red" variant="outline" onClick={handleClearAll}>
                    Clear All
                  </Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Notifications List */}
          <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md" color={textColor}>Notifications</Heading>
                <Text fontSize="sm" color={secondaryTextColor}>
                  {filteredNotifications.length} notifications found
                </Text>
              </Flex>
            </CardHeader>
            <CardBody p={0}>
              {filteredNotifications.length === 0 ? (
                <Center py={12}>
                  <VStack spacing={4}>
                    <Icon as={FiBellIcon} boxSize={12} color={mutedTextColor} />
                    <Text fontSize="lg" color={secondaryTextColor}>No notifications found</Text>
                    <Text fontSize="sm" color={mutedTextColor}>
                      {filters.search || filters.type || filters.priority 
                        ? 'Try adjusting your filters' 
                        : 'You\'re all caught up!'}
                    </Text>
                  </VStack>
                </Center>
              ) : (
                <VStack spacing={0} align="stretch">
                  {filteredNotifications.map((notification) => (
                    <Box
                      key={notification.id}
                      p={4}
                      borderBottom="1px"
                      borderColor={borderColor}
                      _hover={{ bg: hoverBg }}
                      bg={notification.read ? 'transparent' : useColorModeValue('blue.50', 'blue.900')}
                    >
                      <Flex justify="space-between" align="start">
                        <HStack spacing={3} align="start" flex="1">
                          <Icon
                            as={getNotificationIcon(notification.type)}
                            boxSize={5}
                            color={`${getNotificationColor(notification.type)}.500`}
                            mt={1}
                          />
                          <VStack align="start" spacing={1} flex="1">
                            <HStack spacing={2}>
                              <Text fontWeight="500" color={textColor}>
                                {notification.title}
                              </Text>
                              {!notification.read && (
                                <Badge colorScheme="blue" variant="solid" size="sm">
                                  New
                                </Badge>
                              )}
                              <Badge colorScheme={getPriorityColor(notification.priority)} variant="subtle" size="sm">
                                {notification.priority}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color={secondaryTextColor}>
                              {notification.message}
                            </Text>
                            <HStack spacing={4}>
                              <Text fontSize="xs" color={mutedTextColor}>
                                {getRelativeTime(notification.timestamp)}
                              </Text>
                              {notification.count && (
                                <Text fontSize="xs" color={mutedTextColor}>
                                  Count: {notification.count}
                                </Text>
                              )}
                            </HStack>
                          </VStack>
                        </HStack>
                        
                        <HStack spacing={1}>
                          {!notification.read && (
                            <Tooltip label="Mark as Read">
                              <IconButton
                                size="sm"
                                icon={<FiCheckCircle />}
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => handleMarkAsRead(notification.id)}
                              />
                            </Tooltip>
                          )}
                          
                          <Tooltip label="View Details">
                            <IconButton
                              size="sm"
                              icon={<FiEye />}
                              variant="ghost"
                              onClick={() => {
                                setSelectedNotification(notification);
                                onNotificationModalOpen();
                              }}
                            />
                          </Tooltip>
                          
                          <Tooltip label="Delete">
                            <IconButton
                              size="sm"
                              icon={<FiTrash2 />}
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeleteNotification(notification.id)}
                            />
                          </Tooltip>
                        </HStack>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Notification Details Modal */}
      <Modal isOpen={isNotificationModalOpen} onClose={onNotificationModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon
                as={getNotificationIcon(selectedNotification?.type)}
                boxSize={6}
                color={`${getNotificationColor(selectedNotification?.type)}.500`}
              />
              <Text>{selectedNotification?.title}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedNotification && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="sm" fontWeight="500" color={mutedTextColor} mb={2}>Message</Text>
                  <Text color={secondaryTextColor}>{selectedNotification.message}</Text>
                </Box>
                
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="500" color={mutedTextColor}>Type</Text>
                    <Badge colorScheme={getNotificationColor(selectedNotification.type)} variant="subtle">
                      {selectedNotification.type}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="500" color={mutedTextColor}>Priority</Text>
                    <Badge colorScheme={getPriorityColor(selectedNotification.priority)} variant="subtle">
                      {selectedNotification.priority}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="500" color={mutedTextColor}>Timestamp</Text>
                    <Text fontSize="sm">{formatDate(selectedNotification.timestamp)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="500" color={mutedTextColor}>Status</Text>
                    <Badge colorScheme={selectedNotification.read ? 'green' : 'blue'} variant="subtle">
                      {selectedNotification.read ? 'Read' : 'Unread'}
                    </Badge>
                  </Box>
                </SimpleGrid>

                {selectedNotification.action && (
                  <Box>
                    <Text fontSize="sm" fontWeight="500" color={mutedTextColor} mb={2}>Action</Text>
                    <Text fontSize="sm" color={secondaryTextColor}>{selectedNotification.action}</Text>
                  </Box>
                )}

                {selectedNotification.count && (
                  <Box>
                    <Text fontSize="sm" fontWeight="500" color={mutedTextColor} mb={2}>Count</Text>
                    <Text fontSize="sm" color={secondaryTextColor}>{selectedNotification.count}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onNotificationModalClose}>
              Close
            </Button>
            {selectedNotification && !selectedNotification.read && (
              <Button colorScheme="green" onClick={() => {
                handleMarkAsRead(selectedNotification.id);
                onNotificationModalClose();
              }}>
                Mark as Read
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default NotificationsCenter;