import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Button,
  Badge,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Divider,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Spinner,
  Center,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Icon,
  useToast
} from '@chakra-ui/react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaPlay,
  FaStop,
  FaRedo,
  FaCode,
  FaDatabase,
  FaServer,
  FaGlobe
} from 'react-icons/fa';
import { staffAPI, staffTaskAPI, workflowAPI } from '../services/staffAPI';
import { testAuthHeaders, validateToken } from './redux';

const APITesting = () => {
  const dispatch = useDispatch();
  const { token, staffId, coachId, loading, errors } = useSelector(state => state.staff);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const toast = useToast();
  
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [testHistory, setTestHistory] = useState([]);

  const apiTests = [
    // Staff Dashboard APIs
    {
      category: 'Staff Dashboard',
      name: 'Dashboard Data',
      api: () => staffAPI.getStaffDashboardData(30),
      description: 'Get staff dashboard data for last 30 days'
    },
    {
      category: 'Staff Dashboard',
      name: 'Dashboard Overview',
      api: () => staffAPI.getStaffDashboardOverview(),
      description: 'Get staff dashboard overview'
    },
    {
      category: 'Staff Dashboard',
      name: 'Dashboard Tasks',
      api: () => staffAPI.getStaffDashboardTasks(),
      description: 'Get staff dashboard tasks'
    },
    {
      category: 'Staff Dashboard',
      name: 'Dashboard Performance',
      api: () => staffAPI.getStaffDashboardPerformance(),
      description: 'Get staff dashboard performance metrics'
    },
    {
      category: 'Staff Dashboard',
      name: 'Dashboard Achievements',
      api: () => staffAPI.getStaffDashboardAchievements(),
      description: 'Get staff dashboard achievements'
    },
    {
      category: 'Staff Dashboard',
      name: 'Dashboard Team',
      api: () => staffAPI.getStaffDashboardTeam(),
      description: 'Get staff dashboard team data'
    },
    {
      category: 'Staff Dashboard',
      name: 'Dashboard Progress',
      api: () => staffAPI.getStaffDashboardProgress(30),
      description: 'Get staff dashboard progress for last 30 days'
    },
    {
      category: 'Staff Dashboard',
      name: 'Dashboard Comparison',
      api: () => staffAPI.getStaffDashboardComparison(),
      description: 'Get staff dashboard comparison data'
    },
    {
      category: 'Staff Dashboard',
      name: 'Dashboard Goals',
      api: () => staffAPI.getStaffDashboardGoals(),
      description: 'Get staff dashboard goals'
    },
    {
      category: 'Staff Dashboard',
      name: 'Dashboard Calendar',
      api: () => staffAPI.getStaffDashboardCalendar(),
      description: 'Get staff dashboard calendar'
    },
    {
      category: 'Staff Dashboard',
      name: 'Dashboard Notifications',
      api: () => staffAPI.getStaffDashboardNotifications(),
      description: 'Get staff dashboard notifications'
    },
    {
      category: 'Staff Dashboard',
      name: 'Dashboard Analytics',
      api: () => staffAPI.getStaffDashboardAnalytics(),
      description: 'Get staff dashboard analytics'
    },
    
    // Staff Task APIs
    {
      category: 'Staff Tasks',
      name: 'Get Staff Tasks',
      api: () => staffTaskAPI.getStaffTasks(),
      description: 'Get all tasks assigned to staff member'
    },
    {
      category: 'Staff Tasks',
      name: 'Get My Tasks',
      api: () => staffTaskAPI.getMyTasks(30),
      description: 'Get personal task overview for last 30 days'
    },
    {
      category: 'Staff Tasks',
      name: 'Get Overdue Tasks',
      api: () => staffTaskAPI.getOverdueTasks(1, 10),
      description: 'Get overdue tasks with pagination'
    },
    {
      category: 'Staff Tasks',
      name: 'Get Upcoming Tasks',
      api: () => staffTaskAPI.getUpcomingTasks(7, 1, 10),
      description: 'Get upcoming tasks for next 7 days'
    },
    
    // Staff Management APIs
    {
      category: 'Staff Management',
      name: 'Get Staff Profile',
      api: () => staffAPI.getStaffProfile(),
      description: 'Get staff member profile'
    },
    {
      category: 'Staff Management',
      name: 'Get Notifications',
      api: () => staffAPI.getNotifications('unread', 'all'),
      description: 'Get staff notifications'
    },
    {
      category: 'Staff Management',
      name: 'Get Recent Activity',
      api: () => staffAPI.getRecentActivity(20, 'all'),
      description: 'Get recent activity for staff member'
    },
    
    // Workflow APIs
    {
      category: 'Workflow',
      name: 'Get Kanban Board',
      api: () => workflowAPI.getKanbanBoard(),
      description: 'Get Kanban board data'
    },
    {
      category: 'Workflow',
      name: 'Get All Tasks',
      api: () => workflowAPI.getAllTasks(),
      description: 'Get all workflow tasks'
    },
    {
      category: 'Workflow',
      name: 'Get Task Analytics',
      api: () => workflowAPI.getTaskAnalytics(),
      description: 'Get task analytics'
    },
    {
      category: 'Workflow',
      name: 'Get Overdue Tasks',
      api: () => workflowAPI.getOverdueTasks(),
      description: 'Get overdue workflow tasks'
    },
    {
      category: 'Workflow',
      name: 'Get Upcoming Tasks',
      api: () => workflowAPI.getUpcomingTasks(),
      description: 'Get upcoming workflow tasks'
    }
  ];

  const runSingleTest = async (test) => {
    setCurrentTest(test.name);
    const startTime = Date.now();
    
    try {
      const result = await test.api();
      const duration = Date.now() - startTime;
      
      const testResult = {
        name: test.name,
        category: test.category,
        status: 'success',
        duration,
        data: result,
        timestamp: new Date().toISOString(),
        error: null
      };
      
      setTestResults(prev => ({
        ...prev,
        [test.name]: testResult
      }));
      
      setTestHistory(prev => [testResult, ...prev.slice(0, 49)]); // Keep last 50 tests
      
      return testResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const testResult = {
        name: test.name,
        category: test.category,
        status: 'error',
        duration,
        data: null,
        timestamp: new Date().toISOString(),
        error: error.message
      };
      
      setTestResults(prev => ({
        ...prev,
        [test.name]: testResult
      }));
      
      setTestHistory(prev => [testResult, ...prev.slice(0, 49)]);
      
      return testResult;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setCurrentTest('');
    setTestResults({});
    
    const results = [];
    
    for (const test of apiTests) {
      const result = await runSingleTest(test);
      results.push(result);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsRunning(false);
    setCurrentTest('');
    
    // Show summary toast
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    toast({
      title: 'API Testing Complete',
      description: `${successCount} successful, ${errorCount} failed`,
      status: errorCount === 0 ? 'success' : 'warning',
      duration: 5000,
      isClosable: true,
    });
  };

  const runCategoryTests = async (category) => {
    setIsRunning(true);
    setCurrentTest('');
    
    const categoryTests = apiTests.filter(test => test.category === category);
    const results = [];
    
    for (const test of categoryTests) {
      const result = await runSingleTest(test);
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsRunning(false);
    setCurrentTest('');
  };

  const testAuth = async () => {
    try {
      const result = await dispatch(testAuthHeaders()).unwrap();
      toast({
        title: 'Auth Test Successful',
        description: 'Headers are working correctly',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Auth Test Failed',
        description: error.message || 'Authentication failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const validateAuth = async () => {
    try {
      const result = await dispatch(validateToken()).unwrap();
      toast({
        title: 'Token Validation Successful',
        description: 'Token is valid and working',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Token Validation Failed',
        description: error.message || 'Token validation failed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return FaCheckCircle;
      case 'error': return FaTimesCircle;
      case 'running': return FaPlay;
      default: return FaExclamationTriangle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'running': return 'blue';
      default: return 'gray';
    }
  };

  const categories = [...new Set(apiTests.map(test => test.category))];
  const successCount = Object.values(testResults).filter(r => r.status === 'success').length;
  const errorCount = Object.values(testResults).filter(r => r.status === 'error').length;
  const totalTests = apiTests.length;

  return (
    <Box bg={bgColor} minH="100vh" py={6}>
      <Container maxW="7xl">
        {/* Header */}
        <Box mb={8}>
          <Heading size="lg" color="gray.800" mb={2}>
            API Testing Dashboard
          </Heading>
          <Text color="gray.600">
            Test all staff dashboard and task management APIs with proper authentication
          </Text>
        </Box>

        {/* Auth Status */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} mb={6}>
          <CardBody>
            <Heading size="md" mb={4} color="gray.800">
              Authentication Status
            </Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4} mb={4}>
              <Stat>
                <StatLabel>Staff Token</StatLabel>
                <StatNumber color={token ? 'green.600' : 'red.600'}>
                  {token ? 'Present' : 'Missing'}
                </StatNumber>
                <StatHelpText>
                  {token ? `${token.substring(0, 10)}...` : 'No token found'}
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Staff ID</StatLabel>
                <StatNumber color={staffId ? 'green.600' : 'red.600'}>
                  {staffId || 'Missing'}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Coach ID</StatLabel>
                <StatNumber color={coachId ? 'green.600' : 'yellow.600'}>
                  {coachId || 'Optional'}
                </StatNumber>
              </Stat>
            </Grid>
            <HStack spacing={4}>
              <Button colorScheme="blue" onClick={testAuth} isLoading={loading.test}>
                <Icon as={FaCode} mr={2} />
                Test Headers
              </Button>
              <Button colorScheme="green" onClick={validateAuth} isLoading={loading.validation}>
                <Icon as={FaServer} mr={2} />
                Validate Token
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Test Controls */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} mb={6}>
          <CardBody>
            <Heading size="md" mb={4} color="gray.800">
              Test Controls
            </Heading>
            <HStack spacing={4} mb={4}>
              <Button 
                colorScheme="purple" 
                onClick={runAllTests} 
                isLoading={isRunning}
                loadingText="Running Tests..."
                leftIcon={<Icon as={FaPlay} />}
              >
                Run All Tests
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={() => setTestResults({})}
                leftIcon={<Icon as={FaRedo} />}
              >
                Clear Results
              </Button>
            </HStack>
            
            {isRunning && currentTest && (
              <Alert status="info" borderRadius="md">
                <Spinner size="sm" mr={2} />
                <AlertTitle>Running Test:</AlertTitle>
                <AlertDescription>{currentTest}</AlertDescription>
              </Alert>
            )}
          </CardBody>
        </Card>

        {/* Test Summary */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6} mb={8}>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Tests</StatLabel>
                <StatNumber color="purple.600">{totalTests}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Successful</StatLabel>
                <StatNumber color="green.600">{successCount}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0}% success rate
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Failed</StatLabel>
                <StatNumber color="red.600">{errorCount}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Not Run</StatLabel>
                <StatNumber color="gray.600">{totalTests - successCount - errorCount}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Test Results by Category */}
        <Accordion allowMultiple>
          {categories.map(category => {
            const categoryTests = apiTests.filter(test => test.category === category);
            const categoryResults = categoryTests.map(test => testResults[test.name]).filter(Boolean);
            const categorySuccess = categoryResults.filter(r => r.status === 'success').length;
            const categoryError = categoryResults.filter(r => r.status === 'error').length;
            
            return (
              <AccordionItem key={category}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <Heading size="md">{category}</Heading>
                      <Badge colorScheme="green">{categorySuccess}</Badge>
                      <Badge colorScheme="red">{categoryError}</Badge>
                      <Badge colorScheme="gray">{categoryTests.length - categorySuccess - categoryError}</Badge>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      <Button 
                        size="sm" 
                        colorScheme="blue" 
                        onClick={() => runCategoryTests(category)}
                        isLoading={isRunning}
                      >
                        Run Category Tests
                      </Button>
                    </HStack>
                    
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Test Name</Th>
                            <Th>Status</Th>
                            <Th>Duration</Th>
                            <Th>Description</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {categoryTests.map(test => {
                            const result = testResults[test.name];
                            return (
                              <Tr key={test.name}>
                                <Td>
                                  <Text fontWeight="medium">{test.name}</Text>
                                </Td>
                                <Td>
                                  {result ? (
                                    <Badge colorScheme={getStatusColor(result.status)}>
                                      <Icon as={getStatusIcon(result.status)} mr={1} />
                                      {result.status}
                                    </Badge>
                                  ) : (
                                    <Badge colorScheme="gray">Not Run</Badge>
                                  )}
                                </Td>
                                <Td>
                                  {result ? `${result.duration}ms` : '-'}
                                </Td>
                                <Td>
                                  <Text fontSize="sm" color="gray.600">
                                    {test.description}
                                  </Text>
                                </Td>
                                <Td>
                                  <Button 
                                    size="sm" 
                                    colorScheme="blue" 
                                    variant="outline"
                                    onClick={() => runSingleTest(test)}
                                    isLoading={isRunning && currentTest === test.name}
                                  >
                                    Run
                                  </Button>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Test History */}
        {testHistory.length > 0 && (
          <Card bg={cardBg} border="1px solid" borderColor={borderColor} mt={8}>
            <CardBody>
              <Heading size="md" mb={4} color="gray.800">
                Recent Test History
              </Heading>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Test</Th>
                      <Th>Category</Th>
                      <Th>Status</Th>
                      <Th>Duration</Th>
                      <Th>Time</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {testHistory.slice(0, 10).map((result, index) => (
                      <Tr key={index}>
                        <Td>{result.name}</Td>
                        <Td>{result.category}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(result.status)}>
                            <Icon as={getStatusIcon(result.status)} mr={1} />
                            {result.status}
                          </Badge>
                        </Td>
                        <Td>{result.duration}ms</Td>
                        <Td>{new Date(result.timestamp).toLocaleTimeString()}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default APITesting;
