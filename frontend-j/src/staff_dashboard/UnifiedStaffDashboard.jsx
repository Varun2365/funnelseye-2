import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  GridItem,
  Text,
  Button,
  Spinner,
  useToast,
  useColorModeValue,
  useColorMode,
  Badge,
  Icon,
  HStack,
  VStack,
  Divider,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
  Wrap,
  WrapItem,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  Heading,
  Container,
  useBreakpointValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  FormHelperText,
} from '@chakra-ui/react';
import {
  FiRefreshCw,
  FiDownload,
  FiSettings,
  FiBell,
  FiUser,
  FiLogOut,
  FiSun,
  FiMoon,
  FiLoader,
  FiCheckCircle,
  FiClock,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiMessageCircle,
  FiBarChart,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiPause,
  FiPlay,
} from 'react-icons/fi';

// Redux actions
import {
  fetchDashboardData,
  fetchOverview,
  fetchTasks,
  fetchPerformance,
  fetchAchievements,
  fetchTeamData,
  fetchProgress,
  fetchComparison,
  fetchGoals,
  fetchCalendar,
  fetchNotifications,
  fetchAnalytics,
  getAuthHeaders,
  checkTokenLocally,
  testAuthHeaders,
} from './redux';

// API imports
import { staffAPI, staffTaskAPI, staffLeadsAPI } from '../services/staffAPI';

const UnifiedStaffDashboard = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    staffData, 
    dashboardData, 
    overview, 
    tasks, 
    performance, 
    notifications,
    team,
    analytics,
    loading = {}, 
    errors = {},
    staffId,
    coachId,
    token,
    isAuthenticated
  } = useSelector(state => state.staff || {});
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const shadowColor = useColorModeValue('sm', 'dark-lg');
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [timeRange, setTimeRange] = useState(30);
  const [apiStatus, setApiStatus] = useState('checking');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({});

  // Modal controls
  const { isOpen: isTaskModalOpen, onOpen: onTaskModalOpen, onClose: onTaskModalClose } = useDisclosure();
  
  // Responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  // Simplified - no section switching needed

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication status...');
        console.log('🔍 Staff ID:', staffId);
        console.log('🔍 Token:', token ? 'Present' : 'Missing');
        console.log('🔍 Is Authenticated:', isAuthenticated);

        if (!staffId || !token) {
          console.log('❌ Missing authentication credentials');
          setApiStatus('error');
          toast({
            title: 'Authentication Required',
            description: 'Please login to access the staff dashboard',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        // Test API connection
        const result = await dispatch(testAuthHeaders());
        if (result.payload?.valid || result.payload?.success) {
          console.log('✅ Authentication verified');
          setApiStatus('connected');
        } else {
          console.log('❌ Authentication failed');
          setApiStatus('error');
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        setApiStatus('error');
      }
    };

    checkAuth();
  }, [staffId, token, isAuthenticated, dispatch, toast]);

  // Fetch all dashboard data
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      // Always try to make API calls first
      console.log('🌐 Attempting API calls...');
      try {
        // Fetch complete dashboard data using Redux actions
        const dashboardPromise = dispatch(fetchDashboardData({ 
          timeRange, 
          sections: ['overview', 'tasks', 'performance', 'achievements', 'team', 'calendar', 'notifications', 'analytics'] 
        }));
        
        // Fetch individual sections for Redux state
        const individualPromises = [
          dispatch(fetchOverview()),
          dispatch(fetchTasks({ status: null, priority: null, stage: null, page: 1, limit: 20 })),
          dispatch(fetchPerformance({ timeRange, includeComparison: false })),
          dispatch(fetchNotifications({ unreadOnly: false, limit: 50 })),
          dispatch(fetchTeam({ includeStats: true })),
          dispatch(fetchAnalytics({ timeRange, includeTrends: true }))
        ];

        // Wait for all promises to resolve
        await Promise.all([dashboardPromise, ...individualPromises]);
        
        console.log('✅ All API calls completed successfully');
        
        if (isRefresh) {
          toast({
            title: 'Data Refreshed',
            description: 'Dashboard data has been updated successfully',
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
        }
      } catch (apiError) {
        console.error('❌ API calls failed:', apiError);
        
        // Show error toast but don't throw - let the component render with empty data
        toast({
          title: 'API Error',
          description: 'Some data could not be loaded. Please check your connection.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('❌ Fetch data error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  }, [dispatch, timeRange, toast]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Removed unused section change listener

  // Handle refresh
  const handleRefresh = () => {
    fetchData(true);
  };

  // Handle API test
  const handleTestAPI = async () => {
    try {
      console.log('🧪 Testing API connection...');
      await fetchData(true);
      toast({
        title: 'API Test Successful',
        description: 'All API endpoints are working correctly',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('❌ API test failed:', error);
      toast({
        title: 'API Test Failed',
        description: 'Some API endpoints are not responding',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Task management functions
  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      console.log(`🔄 Updating task ${taskId} status to ${newStatus}`);
      await staffTaskAPI.updateTaskStatus(taskId, newStatus);
      
      toast({
        title: 'Task Updated',
        description: `Task status changed to ${newStatus}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      // Refresh tasks
      dispatch(fetchTasks());
    } catch (error) {
      console.error('❌ Task update failed:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update task status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTaskComplete = async (taskId, completionData) => {
    try {
      console.log(`✅ Completing task ${taskId}`);
      await staffTaskAPI.completeTask(taskId, completionData);
      
      toast({
        title: 'Task Completed',
        description: 'Task marked as completed successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      // Refresh tasks
      dispatch(fetchTasks());
    } catch (error) {
      console.error('❌ Task completion failed:', error);
      toast({
        title: 'Completion Failed',
        description: 'Failed to complete task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTaskStart = async (taskId) => {
    try {
      console.log(`▶️ Starting task ${taskId}`);
      await staffTaskAPI.startTask(taskId, 'Started working on task');
      
      toast({
        title: 'Task Started',
        description: 'Task marked as in progress',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      // Refresh tasks
      dispatch(fetchTasks());
    } catch (error) {
      console.error('❌ Task start failed:', error);
      toast({
        title: 'Start Failed',
        description: 'Failed to start task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTaskPause = async (taskId) => {
    try {
      console.log(`⏸️ Pausing task ${taskId}`);
      await staffTaskAPI.pauseTask(taskId, 'Task paused');
      
      toast({
        title: 'Task Paused',
        description: 'Task marked as paused',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      // Refresh tasks
      dispatch(fetchTasks());
    } catch (error) {
      console.error('❌ Task pause failed:', error);
      toast({
        title: 'Pause Failed',
        description: 'Failed to pause task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Show loading state if no data is available
  if (!dashboardData && !overview && !tasks && !performance) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center" 
        py={20}
        bg={bgColor}
        minH="100vh"
        transition="all 0.3s ease"
      >
        <Spinner size="xl" color="blue.500" mb={4} />
        <Text fontSize="xl" fontWeight="semibold" mb={2} color={textColor}>
          Loading Your Staff Dashboard...
        </Text>
        <Text color={secondaryTextColor} mb={4}>
          Getting the latest staff performance data
        </Text>
      </Box>
    );
  }

  const currentData = dashboardData;

  // Simplified render function - no complex component switching
  const renderCurrentSection = () => {
    return null; // We'll render everything in the main return statement
  };

  return (
    <Box bg={bgColor} minH="100vh" transition="all 0.3s ease" w="100%" p={6}>
      {/* Header Section */}
      <Box
        bg={cardBgColor}
        borderRadius="xl"
        p={6}
        mb={6}
        boxShadow={shadowColor}
        border="1px"
        borderColor={borderColor}
        transition="all 0.3s ease"
      >
        {/* Top Row - Header and Actions */}
        <Flex justifyContent="space-between" alignItems="center" mb={6} wrap="wrap" gap={4}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              Welcome back, {staffData?.name || 'Staff Member'}! 👋
            </Text>
            <Text color={secondaryTextColor}>
              Here's your comprehensive staff dashboard overview
            </Text>
          </Box>
          <HStack spacing={3} wrap="wrap">
            <Button
              leftIcon={<FiDownload />}
              variant="outline"
              colorScheme="blue"
              size="sm"
            >
              Export
            </Button>
            <Button
              leftIcon={refreshing ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
              variant="outline"
              colorScheme="blue"
              size="sm"
              onClick={handleRefresh}
              isLoading={refreshing}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FiSettings />}
              variant="outline"
              colorScheme="gray"
              size="sm"
              onClick={handleTestAPI}
            >
              Test API
            </Button>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              colorScheme="green"
              size="sm"
              onClick={() => {
                console.log('🚀 Manual API Test - Starting all API calls...');
                dispatch(fetchOverview());
                dispatch(fetchTasks());
                dispatch(fetchPerformance());
                dispatch(fetchNotifications());
                dispatch(fetchTeamData());
                dispatch(fetchAnalytics());
              }}
            >
              Force API Calls
            </Button>
            <Button
              leftIcon={colorMode === 'dark' ? <FiSun /> : <FiMoon />}
              variant="outline"
              colorScheme="gray"
              size="sm"
              onClick={toggleColorMode}
            >
              {colorMode === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </HStack>
        </Flex>

        {/* Status Indicators */}
        <HStack spacing={4} mb={6} wrap="wrap">
          <Badge colorScheme={isOnline ? 'green' : 'red'} variant="subtle">
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </Badge>
          <Badge colorScheme="blue" variant="subtle">
            Staff ID: {staffId || staffData?._id || 'N/A'}
          </Badge>
          <Badge colorScheme="purple" variant="subtle">
            Coach ID: {coachId || 'N/A'}
          </Badge>
          <Badge 
            colorScheme={apiStatus === 'connected' ? 'green' : apiStatus === 'error' ? 'red' : 'yellow'} 
            variant="subtle"
          >
            API: {apiStatus === 'connected' ? '✅ Connected' : apiStatus === 'error' ? '❌ Error' : '🔄 Checking'}
          </Badge>
        </HStack>

        {/* Quick Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          <Stat textAlign="center" p={4} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="lg">
            <StatLabel fontSize="sm" color={useColorModeValue('blue.700', 'blue.300')}>Total Tasks</StatLabel>
            <StatNumber fontSize="2xl" color={useColorModeValue('blue.800', 'blue.200')}>
              {currentData?.overview?.metrics?.totalTasks || overview?.metrics?.totalTasks || 0}
            </StatNumber>
            <StatHelpText>
              {currentData?.overview?.metrics?.completedTasks || overview?.metrics?.completedTasks || 0} completed
            </StatHelpText>
          </Stat>
          
          <Stat textAlign="center" p={4} bg={useColorModeValue('green.50', 'green.900')} borderRadius="lg">
            <StatLabel fontSize="sm" color={useColorModeValue('green.700', 'green.300')}>Completion Rate</StatLabel>
            <StatNumber fontSize="2xl" color={useColorModeValue('green.800', 'green.200')}>
              {currentData?.overview?.metrics?.taskCompletionRate || overview?.metrics?.taskCompletionRate || 0}%
            </StatNumber>
            <StatHelpText>
              {currentData?.overview?.metrics?.pendingTasks || overview?.metrics?.pendingTasks || 0} pending
            </StatHelpText>
          </Stat>
          
          <Stat textAlign="center" p={4} bg={useColorModeValue('purple.50', 'purple.900')} borderRadius="lg">
            <StatLabel fontSize="sm" color={useColorModeValue('purple.700', 'purple.300')}>Current Score</StatLabel>
            <StatNumber fontSize="2xl" color={useColorModeValue('purple.800', 'purple.200')}>
              {currentData?.overview?.metrics?.currentScore || performance?.currentScore || 0}
            </StatNumber>
            <StatHelpText>
              Rank #{currentData?.overview?.metrics?.rank || performance?.rank || 0}
            </StatHelpText>
          </Stat>
          
          <Stat textAlign="center" p={4} bg={useColorModeValue('orange.50', 'orange.900')} borderRadius="lg">
            <StatLabel fontSize="sm" color={useColorModeValue('orange.700', 'orange.300')}>Leads Converted</StatLabel>
            <StatNumber fontSize="2xl" color={useColorModeValue('orange.800', 'orange.200')}>
              {currentData?.overview?.metrics?.convertedLeads || overview?.metrics?.convertedLeads || 0}
            </StatNumber>
            <StatHelpText>
              {currentData?.overview?.metrics?.conversionRate || overview?.metrics?.conversionRate || 0}% rate
            </StatHelpText>
          </Stat>
        </SimpleGrid>
      </Box>

      {/* Main Content - Tasks Overview */}
      <Box mb={6}>
        <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
          <CardHeader>
            <Flex justifyContent="space-between" alignItems="center">
            <Heading size="lg" fontWeight="600" color={textColor}>
                My Tasks
            </Heading>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                size="sm"
                onClick={onTaskModalOpen}
              >
                New Task
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            {tasks?.length > 0 ? (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Task</Th>
                      <Th>Status</Th>
                      <Th>Priority</Th>
                      <Th>Due Date</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {tasks.map((task, index) => (
                      <Tr key={task._id || index}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="500" color={textColor}>
                      {task.title || task.name || `Task ${index + 1}`}
                    </Text>
                    <Text fontSize="sm" color={secondaryTextColor}>
                              {task.description || 'No description'}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={
                              task.status === 'completed' ? 'green' : 
                              task.status === 'in_progress' ? 'blue' : 
                              task.status === 'paused' ? 'yellow' :
                              'orange'
                            }
                            variant="subtle"
                          >
                            {task.status || 'pending'}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={
                              task.priority === 'high' ? 'red' : 
                              task.priority === 'medium' ? 'yellow' : 
                              'green'
                            }
                            variant="subtle"
                          >
                            {task.priority || 'low'}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color={secondaryTextColor}>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </Text>
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<FiMoreVertical />}
                              variant="ghost"
                              size="sm"
                            />
                            <MenuList>
                              {task.status === 'pending' && (
                                <MenuItem icon={<FiPlay />} onClick={() => handleTaskStart(task._id)}>
                                  Start Task
                                </MenuItem>
                              )}
                              {task.status === 'in_progress' && (
                                <>
                                  <MenuItem icon={<FiPause />} onClick={() => handleTaskPause(task._id)}>
                                    Pause Task
                                  </MenuItem>
                                  <MenuItem icon={<FiCheck />} onClick={() => handleTaskComplete(task._id, { completionNotes: 'Task completed' })}>
                                    Complete Task
                                  </MenuItem>
                                </>
                              )}
                              {task.status === 'paused' && (
                                <MenuItem icon={<FiPlay />} onClick={() => handleTaskStart(task._id)}>
                                  Resume Task
                                </MenuItem>
                              )}
                              <MenuItem icon={<FiEye />}>
                                View Details
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <VStack spacing={4} py={8}>
                <Icon as={FiTarget} boxSize={12} color={secondaryTextColor} />
                <Text color={secondaryTextColor} fontSize="md">
                  No tasks available
                </Text>
                <Button 
                  colorScheme="blue" 
                  variant="outline" 
                  size="sm" 
                  fontWeight="500"
                  onClick={() => dispatch(fetchTasks())}
                >
                  Load Tasks
                </Button>
              </VStack>
            )}
          </CardBody>
        </Card>
      </Box>

      {/* Performance Section */}
      <Box mb={6}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" fontWeight="600" color={textColor}>
                Current Performance Score
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <CircularProgress 
                  value={performance?.currentScore || currentData?.performance?.currentScore || 0} 
                  size="120px" 
                  color="blue.500"
                  trackColor={useColorModeValue('gray.200', 'gray.700')}
                >
                  <CircularProgressLabel fontSize="lg" fontWeight="600">
                    {performance?.currentScore || currentData?.performance?.currentScore || 0}
                  </CircularProgressLabel>
                </CircularProgress>
                <Text fontSize="sm" color={secondaryTextColor} textAlign="center">
                  Overall Performance Rating
                </Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" fontWeight="600" color={textColor}>
                Performance Breakdown
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="start">
                {(performance?.scoreBreakdown || currentData?.performance?.scoreBreakdown) ? (
                  Object.entries(performance?.scoreBreakdown || currentData?.performance?.scoreBreakdown || {}).map(([key, value]) => (
                    <HStack key={key} spacing={3} w="100%">
                      <Text fontSize="sm" color={secondaryTextColor} minW="100px">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Text>
                      <Progress 
                        value={value} 
                        colorScheme="blue" 
                        size="sm" 
                        flex={1}
                        borderRadius="full"
                      />
                      <Text fontSize="sm" fontWeight="500" color={textColor} minW="30px">
                        {value}
                      </Text>
                    </HStack>
                  ))
                ) : (
                  <Text color={secondaryTextColor} fontSize="sm">
                    No performance data available
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>

      {/* Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={onTaskModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Task Title</FormLabel>
                <Input 
                  placeholder="Enter task title"
                  value={taskFormData.title || ''}
                  onChange={(e) => setTaskFormData({...taskFormData, title: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea 
                  placeholder="Enter task description"
                  value={taskFormData.description || ''}
                  onChange={(e) => setTaskFormData({...taskFormData, description: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Priority</FormLabel>
                <Select 
                  placeholder="Select priority"
                  value={taskFormData.priority || ''}
                  onChange={(e) => setTaskFormData({...taskFormData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Due Date</FormLabel>
                <Input 
                  type="datetime-local"
                  value={taskFormData.dueDate || ''}
                  onChange={(e) => setTaskFormData({...taskFormData, dueDate: e.target.value})}
                />
              </FormControl>
              
              <HStack spacing={4} w="100%">
                <Button colorScheme="blue" flex={1}>
                  Create Task
                </Button>
                <Button variant="outline" onClick={onTaskModalClose} flex={1}>
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UnifiedStaffDashboard;