import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  useColorModeValue,
  Badge,
  Icon,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Code,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  Spinner,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiPlay,
  FiSettings,
  FiDatabase,
  FiServer,
  FiShield,
  FiUsers,
  FiTarget,
  FiCalendar,
  FiBarChart,
  FiBell,
  FiUser,
} from 'react-icons/fi';

// Redux actions
import {
  fetchOverview,
  fetchTasks,
  fetchPerformance,
  fetchNotifications,
  fetchTeamData,
  fetchAnalytics,
  getAuthHeaders,
  checkTokenLocally,
  testAuthHeaders,
} from './redux';

// API imports
import { staffAPI, staffTaskAPI, staffLeadsAPI } from '../services/staffAPI';

const StaffAPITesting = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  
  const { 
    staffData, 
    staffId,
    coachId,
    token,
    isAuthenticated
  } = useSelector(state => state.staff || {});
  
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const successColor = useColorModeValue('green.500', 'green.300');
  const errorColor = useColorModeValue('red.500', 'red.300');
  const warningColor = useColorModeValue('yellow.500', 'yellow.300');
  
  // State management
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [authStatus, setAuthStatus] = useState('checking');
  const [apiEndpoints, setApiEndpoints] = useState([]);

  // Define all API endpoints to test
  const endpoints = [
    // Staff Dashboard APIs
    { name: 'Dashboard Overview', api: () => staffAPI.getStaffDashboardOverview(), category: 'Dashboard', icon: FiTarget },
    { name: 'Dashboard Data', api: () => staffAPI.getStaffDashboardData(30), category: 'Dashboard', icon: FiTarget },
    { name: 'Dashboard Stats', api: () => staffAPI.getDashboardStats('week'), category: 'Dashboard', icon: FiTarget },
    { name: 'Personal Performance', api: () => staffAPI.getPersonalPerformanceDashboard(true, true), category: 'Dashboard', icon: FiTarget },
    
    // Task Management APIs
    { name: 'Staff Tasks', api: () => staffTaskAPI.getStaffTasks(), category: 'Tasks', icon: FiTarget },
    { name: 'My Tasks', api: () => staffTaskAPI.getMyTasks(30), category: 'Tasks', icon: FiTarget },
    { name: 'Overdue Tasks', api: () => staffTaskAPI.getOverdueTasks(1, 10), category: 'Tasks', icon: FiTarget },
    { name: 'Upcoming Tasks', api: () => staffTaskAPI.getUpcomingTasks(7, 1, 10), category: 'Tasks', icon: FiTarget },
    
    // Performance APIs
    { name: 'Staff Performance', api: () => staffAPI.getStaffPerformance(staffId), category: 'Performance', icon: FiBarChart },
    { name: 'Performance Trends', api: () => staffAPI.getPerformanceTrends(staffId, 'monthly', 6), category: 'Performance', icon: FiBarChart },
    { name: 'Performance Comparison', api: () => staffAPI.getPerformanceComparison(), category: 'Performance', icon: FiBarChart },
    
    // Calendar APIs
    { name: 'Calendar Events', api: () => staffAPI.getCalendarEvents(staffId), category: 'Calendar', icon: FiCalendar },
    { name: 'Staff Availability', api: () => staffAPI.getStaffAvailability(staffId, new Date().toISOString(), new Date(Date.now() + 86400000).toISOString()), category: 'Calendar', icon: FiCalendar },
    
    // Notifications APIs
    { name: 'Notifications', api: () => staffAPI.getNotifications('unread', 'all'), category: 'Notifications', icon: FiBell },
    { name: 'Recent Activity', api: () => staffAPI.getRecentActivity(20, 'all'), category: 'Notifications', icon: FiBell },
    
    // Profile APIs
    { name: 'Staff Profile', api: () => staffAPI.getStaffProfile(), category: 'Profile', icon: FiUser },
    
    // Team APIs
    { name: 'Team Data', api: () => staffAPI.getAllStaff(coachId), category: 'Team', icon: FiUsers },
    { name: 'Team Performance', api: () => staffAPI.getPerformanceComparison(), category: 'Team', icon: FiUsers },
    
    // Leads APIs
    { name: 'My Leads', api: () => staffLeadsAPI.getMyLeads(), category: 'Leads', icon: FiTarget },
  ];

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication status for API testing...');
        console.log('🔍 Staff ID:', staffId);
        console.log('🔍 Coach ID:', coachId);
        console.log('🔍 Token:', token ? 'Present' : 'Missing');
        console.log('🔍 Is Authenticated:', isAuthenticated);

        if (!staffId || !token) {
          console.log('❌ Missing authentication credentials');
          setAuthStatus('error');
          return;
        }

        // Test basic auth headers
        const result = await dispatch(testAuthHeaders());
        if (result.payload?.valid || result.payload?.success) {
          console.log('✅ Authentication verified for API testing');
          setAuthStatus('success');
        } else {
          console.log('❌ Authentication failed for API testing');
          setAuthStatus('error');
        }
      } catch (error) {
        console.error('❌ Auth check failed for API testing:', error);
        setAuthStatus('error');
      }
    };

    checkAuth();
  }, [staffId, token, isAuthenticated, dispatch]);

  // Run all API tests
  const runAllTests = async () => {
    setIsRunning(true);
    const results = {};
    let successCount = 0;
    let errorCount = 0;

    console.log('🧪 Starting comprehensive API testing...');

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Testing ${endpoint.name}...`);
        const startTime = Date.now();
        
        const response = await endpoint.api();
        const endTime = Date.now();
        const duration = endTime - startTime;

        results[endpoint.name] = {
          status: 'success',
          duration,
          response: response,
          timestamp: new Date().toISOString(),
          category: endpoint.category,
        };
        
        successCount++;
        console.log(`✅ ${endpoint.name} - Success (${duration}ms)`);
      } catch (error) {
        console.error(`❌ ${endpoint.name} - Error:`, error);
        
        results[endpoint.name] = {
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString(),
          category: endpoint.category,
        };
        
        errorCount++;
      }
    }

    setTestResults(results);
    setIsRunning(false);

    // Show summary toast
    toast({
      title: 'API Testing Complete',
      description: `${successCount} successful, ${errorCount} failed`,
      status: errorCount === 0 ? 'success' : 'warning',
      duration: 5000,
      isClosable: true,
    });

    console.log('🧪 API testing completed:', { successCount, errorCount, results });
  };

  // Run individual test
  const runIndividualTest = async (endpoint) => {
    try {
      console.log(`🔍 Testing ${endpoint.name} individually...`);
      const startTime = Date.now();
      
      const response = await endpoint.api();
      const endTime = Date.now();
      const duration = endTime - startTime;

      setTestResults(prev => ({
        ...prev,
        [endpoint.name]: {
          status: 'success',
          duration,
          response: response,
          timestamp: new Date().toISOString(),
          category: endpoint.category,
        }
      }));

      toast({
        title: 'Test Successful',
        description: `${endpoint.name} - ${duration}ms`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      console.log(`✅ ${endpoint.name} - Success (${duration}ms)`);
    } catch (error) {
      console.error(`❌ ${endpoint.name} - Error:`, error);
      
      setTestResults(prev => ({
        ...prev,
        [endpoint.name]: {
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString(),
          category: endpoint.category,
        }
      }));

      toast({
        title: 'Test Failed',
        description: `${endpoint.name} - ${error.message}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <Icon as={FiCheckCircle} color={successColor} boxSize={5} />;
      case 'error':
        return <Icon as={FiXCircle} color={errorColor} boxSize={5} />;
      case 'checking':
        return <Icon as={FiAlertCircle} color={warningColor} boxSize={5} />;
      default:
        return <Icon as={FiAlertCircle} color={warningColor} boxSize={5} />;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <Badge colorScheme="green" variant="subtle">Success</Badge>;
      case 'error':
        return <Badge colorScheme="red" variant="subtle">Error</Badge>;
      case 'checking':
        return <Badge colorScheme="yellow" variant="subtle">Checking</Badge>;
      default:
        return <Badge colorScheme="gray" variant="subtle">Not Tested</Badge>;
    }
  };

  // Group endpoints by category
  const groupedEndpoints = endpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = [];
    }
    acc[endpoint.category].push(endpoint);
    return acc;
  }, {});

  // Calculate overall stats
  const totalTests = endpoints.length;
  const successfulTests = Object.values(testResults).filter(r => r.status === 'success').length;
  const failedTests = Object.values(testResults).filter(r => r.status === 'error').length;
  const successRate = totalTests > 0 ? Math.round((successfulTests / totalTests) * 100) : 0;

  return (
    <Box bg={bgColor} minH="100vh" p={6}>
      {/* Header */}
      <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor} mb={6}>
        <CardHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                Staff API Testing Dashboard
              </Text>
              <Text color={secondaryTextColor}>
                Comprehensive testing of all staff dashboard APIs
              </Text>
            </Box>
            <HStack spacing={3}>
              <Button
                leftIcon={isRunning ? <Spinner size="sm" /> : <FiPlay />}
                colorScheme="blue"
                onClick={runAllTests}
                isLoading={isRunning}
                loadingText="Testing..."
              >
                Run All Tests
              </Button>
              <Button
                leftIcon={<FiRefreshCw />}
                variant="outline"
                onClick={() => setTestResults({})}
              >
                Clear Results
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          {/* Authentication Status */}
          <Alert status={authStatus === 'success' ? 'success' : authStatus === 'error' ? 'error' : 'warning'} mb={4}>
            <AlertIcon />
            <Box>
              <AlertTitle>
                Authentication Status: {authStatus === 'success' ? 'Verified' : authStatus === 'error' ? 'Failed' : 'Checking'}
              </AlertTitle>
              <AlertDescription>
                Staff ID: {staffId || 'N/A'} | Coach ID: {coachId || 'N/A'} | Token: {token ? 'Present' : 'Missing'}
              </AlertDescription>
            </Box>
          </Alert>

          {/* Overall Stats */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Stat textAlign="center" p={4} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="lg">
              <StatLabel fontSize="sm" color={useColorModeValue('blue.700', 'blue.300')}>Total Tests</StatLabel>
              <StatNumber fontSize="2xl" color={useColorModeValue('blue.800', 'blue.200')}>
                {totalTests}
              </StatNumber>
            </Stat>
            
            <Stat textAlign="center" p={4} bg={useColorModeValue('green.50', 'green.900')} borderRadius="lg">
              <StatLabel fontSize="sm" color={useColorModeValue('green.700', 'green.300')}>Successful</StatLabel>
              <StatNumber fontSize="2xl" color={useColorModeValue('green.800', 'green.200')}>
                {successfulTests}
              </StatNumber>
            </Stat>
            
            <Stat textAlign="center" p={4} bg={useColorModeValue('red.50', 'red.900')} borderRadius="lg">
              <StatLabel fontSize="sm" color={useColorModeValue('red.700', 'red.300')}>Failed</StatLabel>
              <StatNumber fontSize="2xl" color={useColorModeValue('red.800', 'red.200')}>
                {failedTests}
              </StatNumber>
            </Stat>
            
            <Stat textAlign="center" p={4} bg={useColorModeValue('purple.50', 'purple.900')} borderRadius="lg">
              <StatLabel fontSize="sm" color={useColorModeValue('purple.700', 'purple.300')}>Success Rate</StatLabel>
              <StatNumber fontSize="2xl" color={useColorModeValue('purple.800', 'purple.200')}>
                {successRate}%
              </StatNumber>
            </Stat>
          </SimpleGrid>

          {/* Progress Bar */}
          {totalTests > 0 && (
            <Box mt={4}>
              <Text fontSize="sm" color={secondaryTextColor} mb={2}>
                Overall Progress: {successfulTests + failedTests} / {totalTests} tests completed
              </Text>
              <Progress 
                value={((successfulTests + failedTests) / totalTests) * 100} 
                colorScheme={successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red'}
                size="lg"
                borderRadius="full"
              />
            </Box>
          )}
        </CardBody>
      </Card>

      {/* API Endpoints by Category */}
      <Accordion allowMultiple>
        {Object.entries(groupedEndpoints).map(([category, categoryEndpoints]) => (
          <AccordionItem key={category} border="1px" borderColor={borderColor} borderRadius="md" mb={4}>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <HStack spacing={3}>
                  <Icon as={categoryEndpoints[0].icon} boxSize={5} />
                  <Text fontWeight="600" fontSize="lg">
                    {category} APIs ({categoryEndpoints.length})
                  </Text>
                  <Badge colorScheme="blue" variant="subtle">
                    {categoryEndpoints.filter(ep => testResults[ep.name]?.status === 'success').length} / {categoryEndpoints.length}
                  </Badge>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={3} align="stretch">
                {categoryEndpoints.map((endpoint) => {
                  const result = testResults[endpoint.name];
                  return (
                    <Card key={endpoint.name} bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
                      <CardBody>
                        <Flex justifyContent="space-between" alignItems="center">
                          <HStack spacing={3}>
                            {getStatusIcon(result?.status)}
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="500" color={textColor}>
                                {endpoint.name}
                              </Text>
                              <Text fontSize="sm" color={secondaryTextColor}>
                                {endpoint.category} • {result?.timestamp ? new Date(result.timestamp).toLocaleTimeString() : 'Not tested'}
                              </Text>
                            </VStack>
                          </HStack>
                          
                          <HStack spacing={3}>
                            {getStatusBadge(result?.status)}
                            {result?.duration && (
                              <Badge colorScheme="blue" variant="outline">
                                {result.duration}ms
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => runIndividualTest(endpoint)}
                              isLoading={isRunning}
                            >
                              Test
                            </Button>
                          </HStack>
                        </Flex>
                        
                        {/* Error Details */}
                        {result?.error && (
                          <Box mt={3} p={3} bg={useColorModeValue('red.50', 'red.900')} borderRadius="md">
                            <Text fontSize="sm" color={errorColor} fontWeight="500">
                              Error: {result.error}
                            </Text>
                          </Box>
                        )}
                        
                        {/* Response Preview */}
                        {result?.response && (
                          <Box mt={3}>
                            <Text fontSize="sm" color={secondaryTextColor} mb={2}>
                              Response Preview:
                            </Text>
                            <Code fontSize="xs" p={2} bg={useColorModeValue('gray.100', 'gray.700')} borderRadius="md">
                              {JSON.stringify(result.response, null, 2).substring(0, 200)}...
                            </Code>
                          </Box>
                        )}
                      </CardBody>
                    </Card>
                  );
                })}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

export default StaffAPITesting;
