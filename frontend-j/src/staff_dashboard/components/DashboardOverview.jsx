import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Badge,
  useToast,
  useColorModeValue,
  Flex,
  Spinner,
  Center,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Icon,
  Tooltip,
  Wrap,
  WrapItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import {
  FaTasks,
  FaCalendar,
  FaChartLine,
  FaUsers,
  FaBell,
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaPlay,
  FaPause,
  FaEdit,
  FaTrash,
  FaEye,
  FaFlag,
  FaUser,
  FaMapMarkerAlt,
  FaTag
} from 'react-icons/fa';
import { staffAPI, staffTaskAPI } from '../../services/staffAPI';

const DashboardOverview = () => {
  const toast = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load dashboard overview
      const dashboardResponse = await staffAPI.getStaffDashboardData(30);
      setDashboardData(dashboardResponse);

      // Load recent tasks
      const tasksResponse = await staffTaskAPI.getStaffTasks({ limit: 5 });
      setTasks(tasksResponse.tasks || tasksResponse || []);

      // Load upcoming events
      const eventsResponse = await staffAPI.getCalendarEvents({ limit: 5 });
      setEvents(eventsResponse || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error Loading Dashboard',
        description: error.message || 'Failed to load dashboard data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'green';
      case 'In Progress': return 'blue';
      case 'Pending': return 'yellow';
      case 'Overdue': return 'red';
      case 'Paused': return 'orange';
      default: return 'gray';
    }
  };

  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case 'meeting': return 'blue';
      case 'task': return 'green';
      case 'break': return 'orange';
      case 'unavailable': return 'red';
      case 'custom': return 'purple';
      default: return 'gray';
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.500">Loading dashboard...</Text>
        </VStack>
      </Center>
    );
  }

  const metrics = dashboardData?.overview?.metrics || {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    taskCompletionRate: 0,
    totalLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    currentScore: 0,
    rank: 0
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg" color={useColorModeValue('gray.800', 'white')}>
              Dashboard Overview
            </Heading>
            <Text color="gray.500">
              Your performance metrics and quick actions
            </Text>
          </VStack>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={FaPlus} />}
            onClick={() => window.location.href = '/staff_dashboard/tasks'}
          >
            Quick Actions
          </Button>
        </Flex>

        {/* Key Metrics Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Task Completion</StatLabel>
                <StatNumber>{metrics.completedTasks}/{metrics.totalTasks}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {metrics.taskCompletionRate}% completion rate
                </StatHelpText>
              </Stat>
              <Progress 
                value={metrics.taskCompletionRate} 
                colorScheme="green" 
                size="sm" 
                mt={2}
              />
            </CardBody>
          </Card>
          
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Lead Conversion</StatLabel>
                <StatNumber>{metrics.convertedLeads}/{metrics.totalLeads}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {metrics.conversionRate}% conversion rate
                </StatHelpText>
              </Stat>
              <Progress 
                value={metrics.conversionRate} 
                colorScheme="blue" 
                size="sm" 
                mt={2}
              />
            </CardBody>
          </Card>
          
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Performance Score</StatLabel>
                <StatNumber>{metrics.currentScore}</StatNumber>
                <StatHelpText>
                  Current level performance
                </StatHelpText>
              </Stat>
              <CircularProgress 
                value={metrics.currentScore} 
                color="blue.500" 
                size="60px" 
                mt={2}
              >
                <CircularProgressLabel>{metrics.currentScore}</CircularProgressLabel>
              </CircularProgress>
            </CardBody>
          </Card>
          
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Team Rank</StatLabel>
                <StatNumber>#{metrics.rank}</StatNumber>
                <StatHelpText>
                  Out of team members
                </StatHelpText>
              </Stat>
              <Icon as={FaUsers} boxSize={8} color="purple.500" mt={2} />
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Recent Activity */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Recent Tasks */}
          <Card bg={bgColor} borderColor={borderColor}>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md">
                  <HStack spacing={2}>
                    <Icon as={FaTasks} color="blue.500" />
                    <Text>Recent Tasks</Text>
                  </HStack>
                </Heading>
                <Button size="sm" variant="outline" onClick={() => window.location.href = '/staff_dashboard/tasks'}>
                  View All
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>
              {tasks.length === 0 ? (
                <Center py={4}>
                  <VStack spacing={2}>
                    <Icon as={FaTasks} boxSize={8} color="gray.400" />
                    <Text color="gray.500">No recent tasks</Text>
                  </VStack>
                </Center>
              ) : (
                <VStack spacing={3} align="stretch">
                  {tasks.slice(0, 5).map((task) => (
                    <Box
                      key={task._id}
                      p={3}
                      borderRadius="md"
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <Flex justify="space-between" align="start">
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="medium" fontSize="sm">
                            {task.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                            {task.description}
                          </Text>
                          <HStack spacing={2}>
                            <Badge colorScheme={getStatusColor(task.status)} size="sm">
                              {task.status}
                            </Badge>
                            <Badge colorScheme={getPriorityColor(task.priority)} size="sm">
                              {task.priority}
                            </Badge>
                          </HStack>
                        </VStack>
                        <HStack spacing={1}>
                          <Tooltip label="View Task">
                            <IconButton
                              icon={<Icon as={FaEye} />}
                              size="sm"
                              variant="ghost"
                              onClick={() => window.location.href = '/staff_dashboard/tasks'}
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

          {/* Upcoming Events */}
          <Card bg={bgColor} borderColor={borderColor}>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md">
                  <HStack spacing={2}>
                    <Icon as={FaCalendar} color="green.500" />
                    <Text>Upcoming Events</Text>
                  </HStack>
                </Heading>
                <Button size="sm" variant="outline" onClick={() => window.location.href = '/staff_dashboard/schedule'}>
                  View All
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>
              {events.length === 0 ? (
                <Center py={4}>
                  <VStack spacing={2}>
                    <Icon as={FaCalendar} boxSize={8} color="gray.400" />
                    <Text color="gray.500">No upcoming events</Text>
                  </VStack>
                </Center>
              ) : (
                <VStack spacing={3} align="stretch">
                  {events.slice(0, 5).map((event) => (
                    <Box
                      key={event._id}
                      p={3}
                      borderRadius="md"
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <Flex justify="space-between" align="start">
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="medium" fontSize="sm">
                            {event.title}
                          </Text>
                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                            {event.description}
                          </Text>
                          <HStack spacing={2}>
                            <Badge colorScheme={getEventTypeColor(event.eventType)} size="sm">
                              {event.eventType}
                            </Badge>
                            <Text fontSize="xs" color="gray.500">
                              {formatDateTime(event.startTime)}
                            </Text>
                          </HStack>
                          {event.location && (
                            <HStack spacing={1}>
                              <Icon as={FaMapMarkerAlt} boxSize={3} color="gray.400" />
                              <Text fontSize="xs" color="gray.500">
                                {event.location}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                        <HStack spacing={1}>
                          <Tooltip label="View Event">
                            <IconButton
                              icon={<Icon as={FaEye} />}
                              size="sm"
                              variant="ghost"
                              onClick={() => window.location.href = '/staff_dashboard/schedule'}
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
        </SimpleGrid>

        {/* Quick Actions */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">
              <HStack spacing={2}>
                <Icon as={FaPlus} color="purple.500" />
                <Text>Quick Actions</Text>
              </HStack>
            </Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Button
                colorScheme="blue"
                variant="outline"
                leftIcon={<Icon as={FaTasks} />}
                onClick={() => window.location.href = '/staff_dashboard/tasks'}
              >
                Create Task
              </Button>
              <Button
                colorScheme="green"
                variant="outline"
                leftIcon={<Icon as={FaCalendar} />}
                onClick={() => window.location.href = '/staff_dashboard/schedule'}
              >
                Schedule Event
              </Button>
              <Button
                colorScheme="purple"
                variant="outline"
                leftIcon={<Icon as={FaChartLine} />}
                onClick={() => window.location.href = '/staff_dashboard/analytics'}
              >
                View Analytics
              </Button>
              <Button
                colorScheme="orange"
                variant="outline"
                leftIcon={<Icon as={FaUsers} />}
                onClick={() => window.location.href = '/staff_dashboard/team'}
              >
                Team View
              </Button>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Performance Insights */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">
              <HStack spacing={2}>
                <Icon as={FaChartLine} color="teal.500" />
                <Text>Performance Insights</Text>
              </HStack>
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Great Progress!</AlertTitle>
                  <AlertDescription>
                    You've completed {metrics.completedTasks} out of {metrics.totalTasks} tasks this month. 
                    Keep up the excellent work!
                  </AlertDescription>
                </Box>
              </Alert>
              
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Lead Conversion Success!</AlertTitle>
                  <AlertDescription>
                    Your conversion rate of {metrics.conversionRate}% is above the team average. 
                    Continue focusing on quality interactions.
                  </AlertDescription>
                </Box>
              </Alert>
              
              {metrics.overdueTasks > 0 && (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Attention Needed</AlertTitle>
                    <AlertDescription>
                      You have {metrics.overdueTasks} overdue task(s). Please review and prioritize them.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default DashboardOverview;