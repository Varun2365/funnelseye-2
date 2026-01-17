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
  CircularProgress,
  CircularProgressLabel,
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
  FiTrendingUp as FiTrendingUpIcon,
  FiTarget as FiTargetIcon,
  FiAward as FiAwardIcon,
  FiBarChart as FiBarChartIcon,
} from 'react-icons/fi';
import { performanceAPI } from '../../services/staffDashboardAPI';

const PerformanceAnalytics = ({ data }) => {
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
  const [performanceData, setPerformanceData] = useState(data || {});
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(30);
  const [activeTab, setActiveTab] = useState(0);
  
  const toast = useToast();

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    const currentScore = performanceData.currentScore || 0;
    const scoreBreakdown = performanceData.scoreBreakdown || {};
    const metrics = performanceData.metrics || {};
    const progress = performanceData.progress || {};
    const trends = performanceData.trends || {};
    const recommendations = performanceData.recommendations || [];

    return {
      currentScore,
      scoreBreakdown,
      metrics,
      progress,
      trends,
      recommendations
    };
  }, [performanceData]);

  // Get performance color based on score
  const getPerformanceColor = (score) => {
    if (score >= 90) return 'green';
    if (score >= 80) return 'blue';
    if (score >= 70) return 'yellow';
    if (score >= 60) return 'orange';
    return 'red';
  };

  // Get trend direction
  const getTrendDirection = (trend) => {
    if (trend === 'up') return 'increase';
    if (trend === 'down') return 'decrease';
    return 'neutral';
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${Math.round(value || 0)}%`;
  };

  // Format number with proper units
  const formatNumber = (value, unit = '') => {
    return `${value || 0}${unit}`;
  };

  // Handle time range change
  const handleTimeRangeChange = async (newTimeRange) => {
    setTimeRange(newTimeRange);
    try {
      setLoading(true);
      const result = await performanceAPI.getPerformanceData({ timeRange: newTimeRange });
      if (result.success) {
        setPerformanceData(result.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load performance data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="7xl" py={6}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading size="xl" fontWeight="600" color={textColor} mb={2} lineHeight="1.2">
              Performance Analytics
            </Heading>
            <Text fontSize="md" color={secondaryTextColor} lineHeight="1.5">
              Track your performance metrics and improvement areas
            </Text>
          </Box>

          {/* Time Range Selector */}
          <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
            <CardBody p={6}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <Text fontSize="sm" color={secondaryTextColor}>Performance Period:</Text>
                <HStack spacing={2}>
                  {[7, 30, 90].map((days) => (
                    <Button
                      key={days}
                      size="sm"
                      variant={timeRange === days ? 'solid' : 'outline'}
                      colorScheme={timeRange === days ? 'blue' : 'gray'}
                      onClick={() => handleTimeRangeChange(days)}
                    >
                      {days} days
                    </Button>
                  ))}
                </HStack>
                <HStack spacing={2}>
                  <Button size="sm" leftIcon={<FiRefreshCw />} variant="outline">
                    Refresh
                  </Button>
                  <Button size="sm" leftIcon={<FiDownload />} variant="outline">
                    Export
                  </Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Overall Performance Score */}
          <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
            <CardBody p={8}>
              <VStack spacing={6}>
                <Heading size="lg" color={textColor} textAlign="center">
                  Overall Performance Score
                </Heading>
                
                <CircularProgress
                  value={performanceMetrics.currentScore}
                  color={`${getPerformanceColor(performanceMetrics.currentScore)}.500`}
                  size="120px"
                  thickness="8px"
                  trackColor={useColorModeValue('gray.200', 'gray.700')}
                >
                  <CircularProgressLabel fontSize="2xl" fontWeight="bold">
                    {performanceMetrics.currentScore}
                  </CircularProgressLabel>
                </CircularProgress>
                
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="500" color={textColor}>
                    {performanceMetrics.currentScore >= 90 ? 'Excellent' : 
                     performanceMetrics.currentScore >= 80 ? 'Good' : 
                     performanceMetrics.currentScore >= 70 ? 'Average' : 
                     performanceMetrics.currentScore >= 60 ? 'Below Average' : 'Needs Improvement'}
                  </Text>
                  <HStack spacing={2}>
                    <Text fontSize="sm" color={secondaryTextColor}>
                      {performanceMetrics.progress.scoreChange > 0 ? '+' : ''}{performanceMetrics.progress.scoreChange} from last period
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Performance Breakdown */}
          <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" color={textColor}>Performance Breakdown</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={gridColumns} spacing={6}>
                <VStack spacing={4}>
                  <HStack spacing={3}>
                    <Icon as={FiTargetIcon} boxSize={6} color="blue.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="500" color={mutedTextColor}>Task Completion</Text>
                      <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                        {performanceMetrics.scoreBreakdown.taskCompletion || 0}
                      </Text>
                    </VStack>
                  </HStack>
                  <Progress
                    value={performanceMetrics.scoreBreakdown.taskCompletion || 0}
                    colorScheme="blue"
                    size="lg"
                    width="100%"
                    borderRadius="full"
                  />
                </VStack>

                <VStack spacing={4}>
                  <HStack spacing={3}>
                    <Icon as={FiStar} boxSize={6} color="green.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="500" color={mutedTextColor}>Quality Rating</Text>
                      <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                        {performanceMetrics.scoreBreakdown.qualityRating || 0}
                      </Text>
                    </VStack>
                  </HStack>
                  <Progress
                    value={performanceMetrics.scoreBreakdown.qualityRating || 0}
                    colorScheme="green"
                    size="lg"
                    width="100%"
                    borderRadius="full"
                  />
                </VStack>

                <VStack spacing={4}>
                  <HStack spacing={3}>
                    <Icon as={FiZap} boxSize={6} color="orange.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="500" color={mutedTextColor}>Efficiency</Text>
                      <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                        {performanceMetrics.scoreBreakdown.efficiency || 0}
                      </Text>
                    </VStack>
                  </HStack>
                  <Progress
                    value={performanceMetrics.scoreBreakdown.efficiency || 0}
                    colorScheme="orange"
                    size="lg"
                    width="100%"
                    borderRadius="full"
                  />
                </VStack>

                <VStack spacing={4}>
                  <HStack spacing={3}>
                    <Icon as={FiUsers} boxSize={6} color="purple.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="500" color={mutedTextColor}>Leadership</Text>
                      <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                        {performanceMetrics.scoreBreakdown.leadership || 0}
                      </Text>
                    </VStack>
                  </HStack>
                  <Progress
                    value={performanceMetrics.scoreBreakdown.leadership || 0}
                    colorScheme="purple"
                    size="lg"
                    width="100%"
                    borderRadius="full"
                  />
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Key Metrics */}
          <SimpleGrid columns={gridColumns} spacing={4}>
            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardBody p={6}>
                <Stat>
                  <StatLabel fontSize="sm" color={mutedTextColor}>Tasks Completed</StatLabel>
                  <StatNumber fontSize="2xl" color={textColor}>
                    {formatNumber(performanceMetrics.metrics.tasksCompleted)}
                  </StatNumber>
                  <StatHelpText>
                    {formatNumber(performanceMetrics.metrics.tasksOnTime)} on time
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardBody p={6}>
                <Stat>
                  <StatLabel fontSize="sm" color={mutedTextColor}>Leads Converted</StatLabel>
                  <StatNumber fontSize="2xl" color="green.500">
                    {formatNumber(performanceMetrics.metrics.leadsConverted)}
                  </StatNumber>
                  <StatHelpText>
                    {formatNumber(performanceMetrics.metrics.averageResponseTime, 'h')} avg response
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardBody p={6}>
                <Stat>
                  <StatLabel fontSize="sm" color={mutedTextColor}>Efficiency Rate</StatLabel>
                  <StatNumber fontSize="2xl" color="blue.500">
                    {formatPercentage(performanceMetrics.scoreBreakdown.efficiency)}
                  </StatNumber>
                  <StatHelpText>
                    Above team average
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Performance Trends */}
          <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" color={textColor}>Performance Trends</Heading>
            </CardHeader>
            <CardBody>
              <Tabs index={activeTab} onChange={setActiveTab}>
                <TabList>
                  <Tab>Score Trend</Tab>
                  <Tab>Task Trend</Tab>
                  <Tab>Conversion Trend</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Text fontSize="sm" color={secondaryTextColor}>
                        Performance score over the last {timeRange} days
                      </Text>
                      <Box height="200px" bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md" p={4}>
                        <Center height="100%">
                          <VStack spacing={2}>
                            <Icon as={FiBarChartIcon} boxSize={8} color={mutedTextColor} />
                            <Text fontSize="sm" color={mutedTextColor}>
                              Chart visualization would go here
                            </Text>
                            <Text fontSize="xs" color={mutedTextColor}>
                              Data: {performanceMetrics.trends.scoreTrend?.join(', ') || 'No data available'}
                            </Text>
                          </VStack>
                        </Center>
                      </Box>
                    </VStack>
                  </TabPanel>
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Text fontSize="sm" color={secondaryTextColor}>
                        Task completion trend over the last {timeRange} days
                      </Text>
                      <Box height="200px" bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md" p={4}>
                        <Center height="100%">
                          <VStack spacing={2}>
                            <Icon as={FiBarChartIcon} boxSize={8} color={mutedTextColor} />
                            <Text fontSize="sm" color={mutedTextColor}>
                              Chart visualization would go here
                            </Text>
                            <Text fontSize="xs" color={mutedTextColor}>
                              Data: {performanceMetrics.trends.taskTrend?.join(', ') || 'No data available'}
                            </Text>
                          </VStack>
                        </Center>
                      </Box>
                    </VStack>
                  </TabPanel>
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Text fontSize="sm" color={secondaryTextColor}>
                        Lead conversion trend over the last {timeRange} days
                      </Text>
                      <Box height="200px" bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md" p={4}>
                        <Center height="100%">
                          <VStack spacing={2}>
                            <Icon as={FiBarChartIcon} boxSize={8} color={mutedTextColor} />
                            <Text fontSize="sm" color={mutedTextColor}>
                              Chart visualization would go here
                            </Text>
                            <Text fontSize="xs" color={mutedTextColor}>
                              Data: {performanceMetrics.trends.conversionTrend?.join(', ') || 'No data available'}
                            </Text>
                          </VStack>
                        </Center>
                      </Box>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>

          {/* Recommendations */}
          {performanceMetrics.recommendations && performanceMetrics.recommendations.length > 0 && (
            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md" color={textColor}>Performance Recommendations</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {performanceMetrics.recommendations.map((recommendation, index) => (
                    <Alert
                      key={index}
                      status={recommendation.priority === 'HIGH' ? 'error' : 
                             recommendation.priority === 'MEDIUM' ? 'warning' : 'info'}
                      borderRadius="md"
                    >
                      <AlertIcon />
                      <Box>
                        <AlertTitle fontSize="sm">{recommendation.title}</AlertTitle>
                        <AlertDescription fontSize="sm">
                          {recommendation.description}
                        </AlertDescription>
                      </Box>
                    </Alert>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Detailed Metrics Table */}
          <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" color={textColor}>Detailed Metrics</Heading>
            </CardHeader>
            <CardBody p={0}>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Metric</Th>
                      <Th>Value</Th>
                      <Th>Target</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>
                        <HStack spacing={2}>
                          <Icon as={FiTargetIcon} boxSize={4} color={mutedTextColor} />
                          <Text fontSize="sm">Task Completion Rate</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight="500">
                          {formatPercentage(performanceMetrics.scoreBreakdown.taskCompletion)}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color={secondaryTextColor}>90%</Text>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={performanceMetrics.scoreBreakdown.taskCompletion >= 90 ? 'green' : 'yellow'} 
                          variant="subtle"
                        >
                          {performanceMetrics.scoreBreakdown.taskCompletion >= 90 ? 'Met' : 'Below Target'}
                        </Badge>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <HStack spacing={2}>
                          <Icon as={FiStar} boxSize={4} color={mutedTextColor} />
                          <Text fontSize="sm">Quality Rating</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight="500">
                          {formatNumber(performanceMetrics.scoreBreakdown.qualityRating)}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color={secondaryTextColor}>85</Text>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={performanceMetrics.scoreBreakdown.qualityRating >= 85 ? 'green' : 'yellow'} 
                          variant="subtle"
                        >
                          {performanceMetrics.scoreBreakdown.qualityRating >= 85 ? 'Met' : 'Below Target'}
                        </Badge>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <HStack spacing={2}>
                          <Icon as={FiZap} boxSize={4} color={mutedTextColor} />
                          <Text fontSize="sm">Efficiency</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight="500">
                          {formatPercentage(performanceMetrics.scoreBreakdown.efficiency)}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color={secondaryTextColor}>80%</Text>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={performanceMetrics.scoreBreakdown.efficiency >= 80 ? 'green' : 'yellow'} 
                          variant="subtle"
                        >
                          {performanceMetrics.scoreBreakdown.efficiency >= 80 ? 'Met' : 'Below Target'}
                        </Badge>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>
                        <HStack spacing={2}>
                          <Icon as={FiUsers} boxSize={4} color={mutedTextColor} />
                          <Text fontSize="sm">Leadership</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight="500">
                          {formatNumber(performanceMetrics.scoreBreakdown.leadership)}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color={secondaryTextColor}>75</Text>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={performanceMetrics.scoreBreakdown.leadership >= 75 ? 'green' : 'yellow'} 
                          variant="subtle"
                        >
                          {performanceMetrics.scoreBreakdown.leadership >= 75 ? 'Met' : 'Below Target'}
                        </Badge>
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default PerformanceAnalytics;