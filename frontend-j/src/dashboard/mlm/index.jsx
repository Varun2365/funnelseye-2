// MLMDashboard.jsx - Complete Final Version with Enhanced Team Hierarchy (FIXED)
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getCoachId, getToken, debugAuthState, getLocalStorageAuth } from '../../utils/authUtils';
import { API_BASE_URL } from '../../config/apiConfig';
import { 
  Box, 
  Container, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Button, 
  Flex, 
  Heading, 
  Text, 
  Grid, 
  GridItem,
  Card, 
  CardBody, 
  CardHeader,
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText,
  StatGroup,
  Avatar, 
  Badge, 
  VStack, 
  HStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  Switch,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
  Progress,
  Tag,
  TagLabel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Skeleton,
  SkeletonText,
  Image,
  Center,
  InputGroup,
  InputLeftElement,
  ButtonGroup,
  Tooltip,
  useColorModeValue,
  CircularProgress,
  CircularProgressLabel,
  Wrap,
  WrapItem,
  Stack,
  FormErrorMessage,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  MenuDivider,
  Checkbox,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb
} from '@chakra-ui/react';
import { 
  ChevronDownIcon, 
  AddIcon, 
  EditIcon, 
  DeleteIcon, 
  ViewIcon,
  RepeatIcon,
  SettingsIcon,
  DownloadIcon,
  SearchIcon,
  ChevronRightIcon,
  EmailIcon,
  PhoneIcon,
  CalendarIcon,
  InfoIcon,
  CheckCircleIcon,
  WarningIcon,
  TimeIcon,
  ChatIcon,
  ExternalLinkIcon,
  CopyIcon,
  StarIcon,
  ArrowBackIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SunIcon
} from '@chakra-ui/icons';
import { 
  FiFileText, FiFile, FiGrid, FiList, FiUser, FiMail, FiPhone, FiCalendar, FiFilter, FiUpload,
  FiEye, FiEdit, FiTrash2, FiCopy, FiUsers, FiMoreVertical, 
  FiPlay, FiPause, FiBarChart2, FiTrendingUp, FiTarget, FiGlobe,
  FiZoomIn, FiZoomOut, FiMaximize2, FiRefreshCw, FiPlus, FiDollarSign, FiBriefcase, FiAward, FiPieChart, FiActivity, FiCheckCircle, FiClock, FiXCircle, FiLayers, FiDownload, FiCheck
} from 'react-icons/fi';

// --- BEAUTIFUL SKELETON COMPONENTS ---
const BeautifulSkeleton = () => {
  return (
    <Box bg="gray.50" minH="100vh" py={6} px={6}>
      <Box maxW="full" mx="auto">
        <VStack spacing={6} align="stretch" w="full">
          {/* Header Skeleton */}
          <Card bg="white" borderRadius="7px" boxShadow="lg" border="1px" borderColor="gray.200">
            <CardHeader py={6}>
              <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
                  <VStack align={{ base: 'center', md: 'start' }} spacing={2}>
                    <Skeleton height="32px" width="300px" />
                    <Skeleton height="16px" width="400px" />
                  </VStack>
                  <HStack spacing={4}>
                    <Skeleton height="40px" width="300px" />
                    <Skeleton height="48px" width="150px" />
                  </HStack>
                </Flex>
                
                {/* Stats Cards Skeleton */}
                <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} variant="outline">
                      <CardBody>
                        <VStack spacing={3}>
                          <Skeleton height="60px" width="60px" borderRadius="7px" />
                          <SkeletonText noOfLines={2} spacing="4" />
                          <Skeleton height="30px" width="80px" />
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </VStack>
            </CardHeader>
          </Card>

          {/* Table Skeleton */}
          <Card bg="white" borderRadius="7px" boxShadow="lg" border="1px" borderColor="gray.200">
            <CardBody>
              <VStack spacing={4} align="stretch">
                {[...Array(5)].map((_, i) => (
                  <HStack key={i} spacing={4} justify="space-between">
                    <Skeleton height="20px" width="200px" />
                    <Skeleton height="20px" width="150px" />
                    <Skeleton height="20px" width="100px" />
                    <Skeleton height="20px" width="120px" />
                    <Skeleton height="20px" width="100px" />
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
};

// --- BEAUTIFUL TOAST NOTIFICATIONS ---
const useCustomToast = () => {
  const toast = useToast();
  
  return useCallback((message, status = 'success') => {
    let title = 'Success!';
    if (status === 'error') title = 'Error!';
    else if (status === 'warning') title = 'Warning!';
    else if (status === 'info') title = 'Info!';
    
    toast({
      title,
      description: message,
      status,
      duration: 5000,
      isClosable: true,
      position: 'top-right',
      variant: 'subtle',
    });
  }, [toast]);
};

// --- STATS CARDS (Matching AI & Automation Theme) ---
const StatsCard = ({ title, value, icon, color = "blue", trend, isLoading = false }) => {
  const cardBgColor = useColorModeValue(`${color}.50`, `${color}.900`);
  const cardBorderColor = useColorModeValue(`${color}.200`, `${color}.700`);
  const iconBg = useColorModeValue(`${color}.100`, `${color}.800`);
  const iconColor = useColorModeValue(`${color}.600`, `${color}.300`);
  
  return (
    <Card 
      bg={cardBgColor} 
      border="1px" 
      borderColor={cardBorderColor}
      borderRadius="7px"
      _hover={{ borderColor: `${color}.300`, boxShadow: 'sm' }}
      transition="all 0.2s"
      boxShadow="none"
      flex="1"
    >
      <CardBody p={4}>
        <HStack spacing={3} align="center">
          <Box
            p={2.5}
            bg={iconBg}
            borderRadius="7px"
            color={iconColor}
          >
            {icon}
          </Box>
          <VStack align="start" spacing={0} flex={1}>
            <Text fontSize="xs" color={`${color}.600`} fontWeight="600" textTransform="uppercase" letterSpacing="0.5px">
              {title}
            </Text>
            {isLoading ? (
              <Skeleton height="28px" width="80px" />
            ) : (
              <>
                <Text fontSize="xl" fontWeight="700" color={`${color}.800`}>
                  {value}
                </Text>
                {trend && (
                  <Text fontSize="xs" color={`${color}.500`} fontWeight="500">
                    {trend}
                  </Text>
                )}
              </>
            )}
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
};

// Helper function to calculate total team size recursively
const calculateTotalTeamSize = (coach) => {
  if (!coach.downline || coach.downline.length === 0) return 0;
  
  let total = coach.downline.length;
  coach.downline.forEach(child => {
    total += calculateTotalTeamSize(child);
  });
  
  return total;
};

// --- ENHANCED HIERARCHY NODE COMPONENT ---
const HierarchyNode = ({ coach, level = 0, onViewCoach, onEditCoach, maxLevels = 5 }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0); // Root level always expanded, others collapsed
  const hasChildren = coach.downline && coach.downline.length > 0;
  const canExpand = level < maxLevels && hasChildren;

  const nodeColors = {
    0: { bg: 'blue.500', border: 'blue.600', bgCard: 'blue.50', shadowColor: 'blue.200' },
    1: { bg: 'purple.500', border: 'purple.600', bgCard: 'purple.50', shadowColor: 'purple.200' },
    2: { bg: 'green.500', border: 'green.600', bgCard: 'green.50', shadowColor: 'green.200' },
    3: { bg: 'orange.500', border: 'orange.600', bgCard: 'orange.50', shadowColor: 'orange.200' },
    4: { bg: 'red.500', border: 'red.600', bgCard: 'red.50', shadowColor: 'red.200' },
  };

  const colorScheme = nodeColors[Math.min(level, 4)];

  return (
    <Box position="relative" className="hierarchy-node-container">
      {/* Enhanced Coach Node with Professional Design */}
      <Card
        className="coach-card"
        borderRadius="7px"
        boxShadow={level === 0 
          ? `0 15px 35px -10px var(--chakra-colors-${colorScheme.shadowColor}), 0 20px 25px -10px var(--chakra-colors-gray-400)` 
          : `0 8px 25px -5px var(--chakra-colors-${colorScheme.shadowColor}), 0 10px 10px -5px var(--chakra-colors-gray-300)`
        }
        bg={level === 0 ? "linear-gradient(135deg, white 0%, #f8fafc 100%)" : "white"}
        border="3px solid"
        borderColor={coach.isActive ? colorScheme.border : 'gray.400'}
        _hover={{
          transform: level === 0 ? 'translateY(-8px) scale(1.05)' : 'translateY(-4px) scale(1.02)',
          boxShadow: level === 0 
            ? `0 25px 50px -15px var(--chakra-colors-${colorScheme.shadowColor}), 0 25px 35px -15px var(--chakra-colors-gray-500)` 
            : `0 20px 40px -10px var(--chakra-colors-${colorScheme.shadowColor}), 0 15px 20px -5px var(--chakra-colors-gray-400)`,
          borderColor: coach.isActive ? colorScheme.bg : 'gray.500'
        }}
        transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        mb={level === 0 ? 12 : 8}
        minW={level === 0 ? "400px" : "380px"}
        maxW={level === 0 ? "420px" : "400px"}
        opacity={coach.isActive ? 1 : 0.8}
        position="relative"
        overflow="hidden"
      >
        {/* Gradient Background Overlay */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="4px"
          bgGradient={`linear(to-r, ${colorScheme.bg}, ${colorScheme.border})`}
        />
        
        {/* Special Crown Indicator for Head Coach */}
        {level === 0 && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="6px"
            bgGradient="linear(45deg, #FFD700, #FFA500, #FFD700)"
            backgroundSize="200% 200%"
            animation="shimmer 2s infinite"
          />
        )}
        
        {/* Level Indicator Strip */}
        <Box
          position="absolute"
          top={level === 0 ? "6px" : "0"}
          right="0"
          width="60px"
          height="60px"
          bgGradient={`linear(135deg, ${colorScheme.bg}, ${colorScheme.border})`}
          clipPath="polygon(50% 0%, 100% 0%, 100% 100%)"
          display="flex"
          alignItems="flex-start"
          justifyContent="flex-end"
          pt={2}
          pr={2}
        >
          <VStack spacing={0}>
            <Text fontSize="xs" fontWeight="bold" color="white">
              {level === 0 ? 'H' : `L${level}`}
            </Text>
            {level === 0 && (
              <Text fontSize="8px" fontWeight="bold" color="white" opacity={0.9}>
                HEAD
              </Text>
            )}
          </VStack>
        </Box>

        <CardBody p={6}>
          <VStack spacing={5}>
            {/* Header with Avatar and Level Badge */}
            <HStack spacing={4} w="full" justify="space-between">
              <HStack spacing={4}>
                <Box position="relative">
                  <Avatar
                    name={coach.name}
                    size="xl"
                    bg={coach.isActive ? colorScheme.bg : 'gray.400'}
                    color="white"
                    boxShadow="0 8px 16px -4px rgba(0,0,0,0.3)"
                    border="4px solid white"
                    position="relative"
                    borderRadius="full"
                    _after={{
                      content: '""',
                      position: 'absolute',
                      top: '-2px',
                      left: '-2px',
                      right: '-2px',
                      bottom: '-2px',
                      borderRadius: 'full',
                      border: '2px solid',
                      borderColor: coach.isActive ? colorScheme.border : 'gray.500',
                    }}
                  />
                  {/* Status Indicator */}
                  <Box
                    position="absolute"
                    bottom="0"
                    right="0"
                    w="20px"
                    h="20px"
                    bg={coach.isActive ? 'green.400' : 'red.400'}
                    borderRadius="7px"
                    border="3px solid white"
                    boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                  />
                </Box>
                
                <VStack align="start" spacing={2} flex="1">
                  <Text fontWeight="bold" fontSize="lg" color="gray.800" noOfLines={1}>
                    {coach.name}
                  </Text>
                  <Text fontSize="sm" color="gray.600" noOfLines={1}>
                    {coach.email}
                  </Text>
                  <HStack spacing={2}>
                    <Badge
                      colorScheme={coach.isActive ? 'green' : 'red'}
                      size="sm"
                      borderRadius="7px"
                      px={3}
                      py={1}
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      {coach.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {level === 0 && (
                      <Badge
                        bg="linear-gradient(45deg, #FFD700, #FFA500)"
                        color="white"
                        size="sm"
                        borderRadius="7px"
                        px={3}
                        py={1}
                        fontSize="xs"
                        fontWeight="bold"
                        boxShadow="0 4px 8px rgba(255, 215, 0, 0.3)"
                        animation="shimmer 2s infinite"
                      >
                        HEAD COACH
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </HStack>
            </HStack>

            {/* Professional Stats Grid */}
            <Box 
              w="full" 
              p={4} 
              bgGradient={`linear(135deg, ${colorScheme.bgCard}, white)`}
              borderRadius="7px"
              border="1px solid"
              borderColor={`${colorScheme.bg}20`}
              boxShadow="inset 0 1px 3px rgba(0,0,0,0.1)"
            >
              <SimpleGrid columns={2} spacing={4}>
                <VStack spacing={2} align="center">
                  <Box
                    w="12px"
                    h="12px"
                    bg={colorScheme.bg}
                    borderRadius="7px"
                    boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                  />
                  <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Level</Text>
                  <Text fontSize="lg" fontWeight="bold" color={colorScheme.bg}>
                    {coach.currentLevel || (level + 1)}
                  </Text>
                </VStack>
                
                <VStack spacing={2} align="center">
                  <Box
                    w="12px"
                    h="12px"
                    bg="green.400"
                    borderRadius="7px"
                    boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                  />
                  <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Team Size</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.600">
                    {calculateTotalTeamSize(coach)}
                  </Text>
                </VStack>
                
                <VStack spacing={2} align="center">
                  <Box
                    w="12px"
                    h="12px"
                    bg="purple.400"
                    borderRadius="7px"
                    boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                  />
                  <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Direct</Text>
                  <Text fontSize="lg" fontWeight="bold" color="purple.600">
                    {coach.downline ? coach.downline.length : 0}
                  </Text>
                </VStack>
                
                <VStack spacing={2} align="center">
                  <Box
                    w="12px"
                    h="12px"
                    bg="orange.400"
                    borderRadius="7px"
                    boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                  />
                  <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Rank</Text>
                  <Text fontSize="sm" fontWeight="bold" color="orange.600" noOfLines={1}>
                    {coach.teamRankName || 'N/A'}
                  </Text>
                </VStack>
              </SimpleGrid>
            </Box>

            {/* Enhanced Performance Section */}
            {coach.performance && (
              <HStack 
                w="full" 
                justify="space-between" 
                p={4} 
                bg="white" 
                borderRadius="7px" 
                border="2px solid" 
                borderColor="gray.100"
                boxShadow="0 4px 12px rgba(0,0,0,0.05)"
              >
                <VStack spacing={2} align="center">
                  <CircularProgress
                    value={coach.performance.performanceScore || 0}
                    size="60px"
                    color={colorScheme.bg}
                    thickness="6px"
                    trackColor="gray.100"
                  >
                    <CircularProgressLabel fontSize="sm" fontWeight="bold" color={colorScheme.bg}>
                      {coach.performance.performanceScore || 0}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text fontSize="xs" color="gray.600" fontWeight="medium" textAlign="center">
                    Performance
                  </Text>
                </VStack>
                
                <VStack spacing={2} align="center">
                  <Box textAlign="center">
                    <Text fontSize="xl" fontWeight="bold" color="green.600">
                      {coach.performance.activityStreak || 0}
                    </Text>
                    <Text fontSize="xs" color="green.600" fontWeight="medium">days</Text>
                  </Box>
                  <Text fontSize="xs" color="gray.600" fontWeight="medium" textAlign="center">
                    Streak
                  </Text>
                </VStack>

                <VStack spacing={2} align="center">
                  <Badge 
                    colorScheme={coach.performance.isActive ? 'green' : 'orange'} 
                    variant="solid"
                    borderRadius="7px"
                    px={3}
                    py={1}
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {coach.performance.isActive ? 'ACTIVE' : 'IDLE'}
                  </Badge>
                  <Text fontSize="xs" color="gray.600" fontWeight="medium" textAlign="center">
                    Status
                  </Text>
                </VStack>
              </HStack>
            )}

            {/* Consolidated Action Menu */}
            <HStack spacing={2} w="full" justify="space-between">
              <Menu>
                <MenuButton
                  as={Button}
                  size="md"
                  variant="outline"
                  colorScheme="blue"
                  rightIcon={<ChevronDownIcon />}
                  flex="1"
                  borderRadius="7px"
                  borderWidth="2px"
                  _hover={{ 
                    bg: 'blue.50', 
                    borderColor: 'blue.400',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                  transition="all 0.3s"
                >
                  Actions
                </MenuButton>
                <MenuList borderRadius="7px">
                  <MenuItem icon={<ViewIcon />} onClick={() => onViewCoach(coach)}>
                    View Details
                  </MenuItem>
                  <MenuItem icon={<EditIcon />} onClick={() => onEditCoach(coach)}>
                    Edit Coach
                  </MenuItem>
                </MenuList>
              </Menu>
              {/* Only show expand button for non-root levels */}
              {level > 0 && canExpand && (
                <IconButton
                  size="md"
                  variant="outline"
                  colorScheme={colorScheme.bg.split('.')[0]}
                  icon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                  onClick={() => setIsExpanded(!isExpanded)}
                  borderRadius="7px"
                  borderWidth="2px"
                  _hover={{ 
                    bg: colorScheme.bgCard,
                    borderColor: colorScheme.border,
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${colorScheme.shadowColor}`
                  }}
                  transition="all 0.3s"
                />
              )}
            </HStack>

            {/* Team Overview */}
            {hasChildren && (
              <Box 
                w="full" 
                textAlign="center" 
                p={3} 
                bgGradient={`linear(135deg, ${colorScheme.bgCard}, white)`}
                borderRadius="7px"
                border="1px solid"
                borderColor={`${colorScheme.bg}30`}
              >
                <HStack justify="center" spacing={2}>
                  <Box
                    w="8px"
                    h="8px"
                    bg={isExpanded ? 'green.400' : 'gray.400'}
                    borderRadius="7px"
                    animation={isExpanded ? "pulse 2s infinite" : "none"}
                  />
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    {isExpanded ? 'Showing' : 'Hidden'} {coach.downline.length} Direct Members
                  </Text>
                </HStack>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Team Member Indicator */}
      {hasChildren && (
        <Box 
          w="full" 
          textAlign="center" 
          p={3} 
          bgGradient={`linear(135deg, ${colorScheme.bgCard}, white)`}
          borderRadius="7px"
          border="1px solid"
          borderColor={`${colorScheme.bg}30`}
          mt={4}
        >
          <HStack justify="center" spacing={2}>
            <Box
              w="8px"
              h="8px"
              bg={colorScheme.bg}
              borderRadius="full"
              animation="pulse 2s infinite"
            />
            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              {coach.downline.length} Team Member{coach.downline.length !== 1 ? 's' : ''}
            </Text>
            {canExpand && (
              <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2} py={1}>
                Expandable
              </Badge>
            )}
          </HStack>
        </Box>
      )}
    </Box>
  );
};

// --- RECURSIVE TREE NODE COMPONENT ---
const TreeNode = ({ node, level, onViewCoach, onEditCoach, maxLevels }) => {
  const hasChildren = node.downline && node.downline.length > 0;
  const [expanded, setExpanded] = useState(level < maxLevels);

  useEffect(() => {
    setExpanded(level < maxLevels);
  }, [maxLevels, level]);

  return (
    <VStack spacing={0} align="center">
      <Box zIndex={10}>
        <HierarchyNode 
          coach={node} 
          level={level} 
          onViewCoach={onViewCoach} 
          onEditCoach={onEditCoach}
          maxLevels={maxLevels}
        />
      </Box>

      {hasChildren && expanded && (
        <VStack spacing={0} align="center" w="full">
          {/* Line from Parent Down */}
          <Box w="2px" h="40px" bg="gray.300" />
          
          <HStack align="flex-start" spacing={8} pt={0} position="relative">
            {node.downline.map((child, index) => {
              const isFirst = index === 0;
              const isLast = index === node.downline.length - 1;
              const isOnly = node.downline.length === 1;
              
              return (
                <VStack key={child._id || index} spacing={0} align="center" position="relative">
                  {/* Connector Lines Area */}
                  <Box h="40px" w="100%" position="relative">
                    {/* Vertical Line Up */}
                    <Box 
                      position="absolute" 
                      bottom="0" 
                      left="50%" 
                      h="100%" 
                      w="2px" 
                      bg="gray.300" 
                      transform="translateX(-50%)" 
                    />
                    
                    {/* Horizontal Line */}
                    {!isOnly && (
                      <>
                        {/* Line to Right (for first and middle) */}
                        {!isLast && (
                          <Box 
                            position="absolute" 
                            top="0" 
                            left="50%" 
                            right="0" 
                            h="2px" 
                            bg="gray.300" 
                          />
                        )}
                        {/* Line to Left (for last and middle) */}
                        {!isFirst && (
                          <Box 
                            position="absolute" 
                            top="0" 
                            left="0" 
                            right="50%" 
                            h="2px" 
                            bg="gray.300" 
                          />
                        )}
                      </>
                    )}
                  </Box>
                  
                  <TreeNode 
                    node={child} 
                    level={level + 1} 
                    onViewCoach={onViewCoach} 
                    onEditCoach={onEditCoach} 
                    maxLevels={maxLevels}
                  />
                </VStack>
              );
            })}
          </HStack>
        </VStack>
      )}
    </VStack>
  );
};

// --- ENHANCED HIERARCHY OVERVIEW COMPONENT (FIXED) ---
const HierarchyOverview = ({ 
  hierarchyData, 
  loading, 
  onViewCoach, 
  onEditCoach, 
  levelsToShow,
  nodeSpacing = 6,
  treeHeight = 8,
  setNodeSpacing = () => {},
  setTreeHeight = () => {}
}) => {
  const [viewMode, setViewMode] = useState('tree');
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [treeDepth, setTreeDepth] = useState(3); // Control tree depth

  // Process hierarchy data to build proper tree structure from real backend data
  const processedHierarchy = useMemo(() => {
    // If no real data, return null (will show empty state)
    if (!hierarchyData) {
      return null;
    }
    
    // Handle the nested tree structure from backend hierarchy API
    if (hierarchyData.downline && Array.isArray(hierarchyData.downline)) {
      // Backend returns nested structure directly
      return {
        ...hierarchyData,
        downline: hierarchyData.downline,
        downlineHierarchy: hierarchyData.downlineHierarchy || hierarchyData.downline
      };
    }
    
    // Handle flat structure with downlineHierarchy
    if (hierarchyData.downlineHierarchy && Array.isArray(hierarchyData.downlineHierarchy)) {
      // Build tree from flat structure using sponsorId relationships
      const buildTree = (parentId, members, level = 0) => {
        return members
          .filter(m => {
            // For root level, get direct children of the current coach
            if (level === 0) {
              // Check if member's sponsorId matches parent coach ID
              return (m.sponsorId && m.sponsorId.toString() === parentId.toString()) ||
                     (m.sponsorId === hierarchyData._id) ||
                     (m.level === 1 && !m.sponsorId);
            }
            // For deeper levels, filter by sponsorId matching parent
            return m.sponsorId && m.sponsorId.toString() === parentId.toString();
          })
          .map(member => ({
            ...member,
            currentLevel: level + 1, // Set proper level for each node
            downline: buildTree(member._id, members, level + 1),
            downlineHierarchy: buildTree(member._id, members, level + 1)
          }));
      };
      
      const rootNode = {
        ...hierarchyData,
        downline: buildTree(hierarchyData._id || hierarchyData.coachId, hierarchyData.downlineHierarchy, 0),
        downlineHierarchy: hierarchyData.downlineHierarchy
      };
      
      console.log('🌳 BUILT TREE STRUCTURE:');
      console.log('Root Node:', rootNode);
      console.log('Direct Children:', rootNode.downline);
      
      return rootNode;
    }
    
    // Return hierarchy data as-is if it has the expected structure
    if (hierarchyData.name || hierarchyData._id) {
      return hierarchyData;
    }
    
    // Return null if no valid data
    return null;
  }, [hierarchyData]);

  // Calculate hierarchy stats - always calculate this to avoid hooks error
  const hierarchyStats = useMemo(() => {
    if (!processedHierarchy) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        maxDepth: 0,
        levelCounts: {}
      };
    }
    
    const calculateStats = (node, level = 0) => {
      let stats = {
        totalMembers: 1,
        activeMembers: node.isActive ? 1 : 0,
        maxDepth: level,
        levelCounts: { [level]: 1 }
      };
      
      if (node.downline) {
        node.downline.forEach(child => {
          const childStats = calculateStats(child, level + 1);
          stats.totalMembers += childStats.totalMembers;
          stats.activeMembers += childStats.activeMembers;
          stats.maxDepth = Math.max(stats.maxDepth, childStats.maxDepth);
          
          Object.keys(childStats.levelCounts).forEach(lvl => {
            stats.levelCounts[lvl] = (stats.levelCounts[lvl] || 0) + childStats.levelCounts[lvl];
          });
        });
      }
      
      return stats;
    };
    
    return calculateStats(processedHierarchy);
  }, [processedHierarchy]);

  // Always render the component structure to avoid hooks error
  return (
    <VStack spacing={6} align="stretch">
      {/* Enhanced Hierarchy Controls */}
      <Card bg="white" border="1px" borderColor="gray.200" borderRadius="7px" boxShadow="md">
        <CardBody p={6}>
          <VStack spacing={4}>
            <HStack justify="space-between" w="full" wrap="wrap" spacing={4}>
              <HStack spacing={6}>
                <FormControl maxW="200px">
                  <FormLabel fontSize="sm" mb={2} color="gray.700" fontWeight="bold">View Mode</FormLabel>
                  <ButtonGroup size="md" isAttached variant="outline" colorScheme="blue">
                    <Button
                      bg={viewMode === 'tree' ? 'blue.500' : 'white'}
                      color={viewMode === 'tree' ? 'white' : 'blue.500'}
                      onClick={() => setViewMode('tree')}
                      leftIcon={<Box as={FiBarChart2} />}
                      _hover={{ bg: viewMode === 'tree' ? 'blue.600' : 'blue.50' }}
                    >
                      Tree View
                    </Button>
                    <Button
                      bg={viewMode === 'table' ? 'blue.500' : 'white'}
                      color={viewMode === 'table' ? 'white' : 'blue.500'}
                      onClick={() => setViewMode('table')}
                      leftIcon={<Box as={FiFileText} />}
                      _hover={{ bg: viewMode === 'table' ? 'blue.600' : 'blue.50' }}
                    >
                      Table View
                    </Button>
                  </ButtonGroup>
                <InputGroup maxW="300px">
                  <InputLeftElement>
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    size="md"
                    placeholder="Search coaches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'gray.400' }}
                    _focus={{ borderColor: 'blue.500' }}
                  />
                </InputGroup>
                </FormControl>
              </HStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Show loading state */}
      {loading && (
        <VStack spacing={6}>
          <Skeleton height="150px" borderRadius="7px" />
          <HStack spacing={4} overflowX="auto">
            <Skeleton height="300px" width="350px" borderRadius="7px" />
            <Skeleton height="300px" width="350px" borderRadius="7px" />
            <Skeleton height="300px" width="350px" borderRadius="7px" />
          </HStack>
        </VStack>
      )}

      {/* Show no data state */}
      {!loading && !processedHierarchy && (
        <Card bg="white" borderRadius="7px" border="2px dashed" borderColor="gray.200">
          <CardBody py={16}>
            <Center>
              <VStack spacing={6}>
                <Box
                  w="120px"
                  h="120px"
                  bg="linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="blue.500"
                  boxShadow="lg"
                >
                  <Box as={FiUsers} size="48px" />
                </Box>
                <VStack spacing={3}>
                  <Heading size="lg" color="gray.700" textAlign="center">
                    Build Your Team Hierarchy
                  </Heading>
                  <Text color="gray.600" textAlign="center" fontSize="md" maxW="400px">
                    Start building your MLM team structure by adding coaches. You'll be the head coach, 
                    and all team members will be organized under their respective sponsors.
                  </Text>
                </VStack>
                <Button
                  colorScheme="blue"
                  size="lg"
                  leftIcon={<AddIcon />}
                  onClick={() => {/* This should open add modal */}}
                  borderRadius="full"
                  px={8}
                  py={6}
                  fontSize="md"
                  fontWeight="bold"
                  boxShadow="lg"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl'
                  }}
                >
                  Add Your First Team Member
                </Button>
              </VStack>
            </Center>
          </CardBody>
        </Card>
      )}

      {/* Show hierarchy data */}
      {!loading && processedHierarchy && (
        <>
          {/* Enhanced Hierarchy Stats */}
          <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
            <StatsCard
              title="Total Team"
              value={hierarchyStats.totalMembers}
              icon={<Box as={FiUsers} size="24px" />}
              color="blue"
              trend="All members"
            />
            <StatsCard
              title="Active Members"
              value={hierarchyStats.activeMembers}
              icon={<CheckCircleIcon />}
              color="green"
              trend="Currently active"
            />
            <StatsCard
              title="Direct Reports"
              value={processedHierarchy?.downline ? processedHierarchy.downline.length : 0}
              icon={<Box as={FiUser} size="24px" />}
              color="purple"
              trend="Level 1"
            />
            <StatsCard
              title="Max Depth"
              value={hierarchyStats.maxDepth + 1}
              icon={<Box as={FiTrendingUp} size="24px" />}
              color="orange"
              trend="Hierarchy levels"
            />
            <StatsCard
              title="Active Rate"
              value={`${Math.round((hierarchyStats.activeMembers / hierarchyStats.totalMembers) * 100)}%`}
              icon={<Box as={FiTarget} size="24px" />}
              color="red"
              trend="Team activity"
            />
          </SimpleGrid>

          {/* Main Hierarchy Display */}
          <Card 
            borderRadius="7px" 
            boxShadow="xl" 
            overflow="hidden" 
            border="1px" 
            borderColor="gray.200"
            bg="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
            sx={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%,rgb(16, 56, 109) 1px, transparent 1px),
                radial-gradient(circle at 75% 75%, #e2e8f0 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          >
            <CardHeader 
              bg="white" 
              color="gray.800" 
              py={6}
            >
              <HStack justify="space-between" align="center">
                <HStack align="center" spacing={3}>
                  <Heading size="lg" color="gray.800">
                    {viewMode === 'tree' ? 'Team Hierarchy Tree' : 'Team Structure Table'}
                  </Heading>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="md" color="gray.600">
                      {processedHierarchy?.name || 'Your'} Complete MLM Network Structure
                    </Text>
                  </VStack>
                </HStack>
                <Badge colorScheme="blue" variant="solid" px={4} py={2} borderRadius="full" fontSize="sm">
                  {hierarchyStats.totalMembers} Total Members
                </Badge>
              </HStack>
            </CardHeader>
            
            <CardBody p={8}>
              {viewMode === 'tree' ? (
                <VStack spacing={6} align="stretch">
                  {/* Tree Controls with Smart Sliders */}
                  <Card bg="gray.50" border="1px" borderColor="gray.200" borderRadius="7px">
                    <CardBody p={4}>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between" align="center" wrap="wrap" spacing={4}>
                          <HStack spacing={4}>
                            <Text fontSize="sm" fontWeight="medium" color="gray.700">
                              🌳 Tree Layout Controls:
                            </Text>
                            <Badge colorScheme="blue" variant="subtle" borderRadius="full">
                              Professional Layout
                            </Badge>
                          </HStack>
                        </HStack>
                        
                        {/* Tree Depth Slider - Always visible */}
                        <FormControl w="full">
                          <FormLabel fontSize="sm" mb={2} color="gray.700" fontWeight="bold">
                            Tree Depth Control
                          </FormLabel>
                          <HStack spacing={4} align="center">
                            <Text fontSize="xs" color="gray.500" fontWeight="medium">Level 1</Text>
                            <Slider 
                              value={treeDepth} 
                              min={1} 
                              max={5} 
                              step={1}
                              onChange={(val) => setTreeDepth(val)}
                              size="lg"
                              colorScheme="blue"
                              flex={1}
                            >
                              <SliderTrack>
                                <SliderFilledTrack />
                              </SliderTrack>
                              <SliderThumb />
                            </Slider>
                            <Text fontSize="xs" color="gray.500" fontWeight="medium">Level 5</Text>
                            <Badge colorScheme="blue" variant="solid" px={3} py={1} borderRadius="full">
                              {treeDepth} Levels
                            </Badge>
                          </HStack>
                          <Text fontSize="xs" color="gray.600" mt={1}>
                            Control how many levels of the hierarchy tree to display
                          </Text>
                        </FormControl>
                        
                        {/* Additional Layout Controls */}
                        {/* Tree Structure Info */}
                        <Box 
                          p={3} 
                          bg="blue.50" 
                          borderRadius="7px" 
                          border="1px solid" 
                          borderColor="blue.200"
                          mb={4}
                        >
                          <VStack spacing={3}>
                            {/* Connection Lines Legend */}
                            <Box 
                              p={3} 
                              bg="purple.50" 
                              borderRadius="7px" 
                              border="1px solid" 
                              borderColor="purple.200"
                              w="full"
                            >
                              <VStack spacing={2}>
                                <Text fontSize="sm" color="purple.700" fontWeight="bold" textAlign="center">
                                  🔗 Connection Lines Guide
                                </Text>
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} w="full">
                                  <HStack spacing={2} justify="center">
                                    <Box w="3px" h="16px" bg="blue.500" borderRadius="full" />
                                    <Text fontSize="xs" color="purple.700" fontWeight="medium">
                                      Head Coach → Level 1
                                    </Text>
                                  </HStack>
                                  <HStack spacing={2} justify="center">
                                    <Box w="3px" h="16px" bg="purple.500" borderRadius="full" />
                                    <Text fontSize="xs" color="purple.700" fontWeight="medium">
                                      Level 1 → Level 2
                                    </Text>
                                  </HStack>
                                  <HStack spacing={2} justify="center">
                                    <Box w="3px" h="16px" bg="green.500" borderRadius="full" />
                                    <Text fontSize="xs" color="purple.700" fontWeight="medium">
                                      Level 2 → Level 3
                                    </Text>
                                  </HStack>
                                </SimpleGrid>
                              </VStack>
                            </Box>
                            
                            <HStack spacing={3} justify="center">
                              <Box w="3px" h="20px" bg="blue.500" borderRadius="full" />
                              <Text fontSize="sm" color="blue.700" fontWeight="medium">
                                Level 1: {processedHierarchy?.downline ? processedHierarchy.downline.length : 0} Direct Members
                              </Text>
                              {treeDepth > 1 && (
                                <>
                                  <Box w="3px" h="20px" bg="purple.500" borderRadius="full" />
                                  <Text fontSize="sm" color="purple.700" fontWeight="medium">
                                    Level 2: {processedHierarchy?.downline ? 
                                      processedHierarchy.downline.reduce((total, child) => 
                                        total + (child.downline ? child.downline.length : 0), 0
                                      ) : 0
                                    } Members
                                  </Text>
                                </>
                              )}
                              {treeDepth > 2 && (
                                <>
                                  <Box w="3px" h="20px" bg="green.500" borderRadius="full" />
                                  <Text fontSize="sm" color="green.700" fontWeight="medium">
                                    Level 3: {processedHierarchy?.downline ? 
                                      processedHierarchy.downline.reduce((total, child) => 
                                        total + (child.downline ? 
                                          child.downline.reduce((subTotal, grandChild) => 
                                            subTotal + (grandChild.downline ? grandChild.downline.length : 0), 0
                                          ) : 0
                                        ), 0
                                      ) : 0
                                    } Members
                                  </Text>
                                </>
                              )}
                            </HStack>
                          </VStack>
                        </Box>
                        
                        <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
                          {/* Node Spacing Slider */}
                          <FormControl w="200px" display={processedHierarchy?.downline && processedHierarchy.downline.length > 3 ? 'block' : 'none'}>
                            <FormLabel fontSize="xs" mb={1} color="gray.600">Node Spacing</FormLabel>
                            <HStack spacing={2}>
                              <Text fontSize="xs" color="gray.500">Tight</Text>
                              <Slider 
                                defaultValue={6} 
                                min={2} 
                                max={12} 
                                step={1}
                                onChange={(val) => setNodeSpacing(val)}
                                size="sm"
                                colorScheme="blue"
                              >
                                <SliderTrack>
                                  <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb />
                              </Slider>
                              <Text fontSize="xs" color="gray.500">Wide</Text>
                            </HStack>
                          </FormControl>
                          
                          {/* Tree Height Slider */}
                          <FormControl w="200px" display={processedHierarchy?.downline && processedHierarchy.downline.length > 2 ? 'block' : 'none'}>
                            <FormLabel fontSize="xs" mb={1} color="gray.600">Tree Height</FormLabel>
                            <HStack spacing={2}>
                              <Text fontSize="xs" color="gray.500">Compact</Text>
                              <Slider 
                                defaultValue={8} 
                                min={4} 
                                max={16} 
                                step={1}
                                onChange={(val) => setTreeHeight(val)}
                                size="sm"
                                colorScheme="green"
                              >
                                <SliderTrack>
                                  <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb />
                              </Slider>
                              <Text fontSize="xs" color="gray.500">Spacious</Text>
                            </HStack>
                          </FormControl>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Tree Container with Smart Overflow */}
                  <Box 
                    overflowX="auto" 
                    overflowY="visible" 
                    minH="600px" 
                    pb={8}
                    sx={{
                      '&::-webkit-scrollbar': {
                        height: '8px',
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'gray.100',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'blue.400',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: 'blue.500',
                      },
                    }}
                  >
                                      <Box 
                    minW="fit-content" 
                    p={6}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    className="tree-container"
                    sx={{
                      '--node-spacing': `${nodeSpacing}rem`,
                      '--tree-height': `${treeHeight}rem`,
                    }}
                  >
                                        {/* Root Node - Top Center */}
                    <Box textAlign="center" mb={`var(--tree-height)`}>
                      {/* Head Coach Title */}
                      <VStack spacing={3} mb={6}>
                        <Box
                          w="80px"
                          h="80px"
                          bgGradient="linear(135deg, #3b82f6, #8b5cf6)"
                          borderRadius="7px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          boxShadow="xl"
                          border="4px solid white"
                          className="head-coach-icon"
                        >
                          <Text fontSize="32px" color="white">👑</Text>
                        </Box>
                        <VStack spacing={1}>
                          <Heading size="md" color="blue.800">
                            Head Coach
                          </Heading>
                          <Text fontSize="sm" color="blue.600" fontWeight="medium">
                            Network Leader
                          </Text>
                        </VStack>
                      </VStack>
                      
                      <HierarchyNode
                        coach={processedHierarchy}
                        level={0}
                        onViewCoach={onViewCoach}
                        onEditCoach={onEditCoach}
                        maxLevels={treeDepth}
                      />
                    </Box>
                    
                    {/* Dynamic Tree Levels */}
                    {processedHierarchy.downline && processedHierarchy.downline.length > 0 && (
                      <Box w="full">
                                                {/* Level 1 - Direct Children */}
                        <Box mb={`var(--tree-height)`}>
                          {/* Connection Lines from Root to Level 1 */}
                          <Box position="relative" height={`calc(var(--tree-height) - 2rem)`} mb={4}>
                            <Center>
                              <Box position="relative" width="100%">
                                {/* Main vertical line from root */}
                                <Box
                                  position="absolute"
                                  left="50%"
                                  top="0"
                                  width="4px"
                                  height="40px"
                                  bgGradient="linear(to-b, blue.500, blue.400)"
                                  borderRadius="7px"
                                  transform="translateX(-50%)"
                                  zIndex={1}
                                  className="connection-line-root"
                                  _hover={{
                                    width: "6px",
                                    boxShadow: "0 0 10px rgba(59, 130, 246, 0.6)",
                                    transition: "all 0.3s ease"
                                  }}
                                  transition="all 0.3s ease"
                                />
                                
                                {/* Horizontal distribution line */}
                                {(processedHierarchy?.downline?.length || 0) > 1 && (
                                  <Box
                                    position="absolute"
                                    top="40px"
                                    left="25%"
                                    right="25%"
                                    height="4px"
                                    bgGradient="linear(to-r, blue.400, purple.500, blue.400)"
                                    borderRadius="7px"
                                    zIndex={1}
                                    className="connection-line-horizontal"
                                  />
                                )}
                                
                                {/* Individual vertical lines to each child */}
                                {(processedHierarchy?.downline || []).map((_, index) => {
                                  const totalChildren = processedHierarchy?.downline?.length || 0;
                                  const childPosition = (index - (totalChildren - 1) / 2) * (100 / Math.max(totalChildren - 1, 1));
                                  return (
                                    <Box
                                      key={index}
                                      position="absolute"
                                      top="40px"
                                      left={`${50 + childPosition}%`}
                                      width="4px"
                                      height="20px"
                                      bgGradient="linear(to-b, purple.500, purple.400)"
                                      borderRadius="7px"
                                      transform="translateX(-50%)"
                                      zIndex={1}
                                      className="connection-line-level1"
                                      style={{ animationDelay: `${1.2 + index * 0.1}s` }}
                                    />
                                  );
                                })}
                              </Box>
                            </Center>
                          </Box>
                          
                          {/* Level 1 Children in Horizontal Row */}
                          <SimpleGrid 
                            columns={{ base: 1, md: processedHierarchy?.downline?.length || 1 }} 
                            spacing={`var(--node-spacing)`}
                            justifyItems="center"
                            w="full"
                          >
                            {(processedHierarchy?.downline || []).map((childCoach, index) => (
                              <Box key={childCoach._id || index} position="relative">
                                {/* Connection indicator above each child */}
                                <Box
                                  position="absolute"
                                  top="-20px"
                                  left="50%"
                                  transform="translateX(-50%)"
                                  zIndex={2}
                                >
                                  <Box
                                    w="12px"
                                    h="12px"
                                    bg="purple.500"
                                    borderRadius="7px"
                                    border="2px solid white"
                                    boxShadow="0 0 0 2px purple.500"
                                    className="connection-point-level1"
                                    style={{ animationDelay: `${1.3 + index * 0.1}s` }}
                                  />
                                </Box>
                                
                                <HierarchyNode
                                  coach={childCoach}
                                  level={1}
                                  onViewCoach={onViewCoach}
                                  onEditCoach={onEditCoach}
                                  maxLevels={treeDepth}
                                />
                              </Box>
                            ))}
                          </SimpleGrid>
                        </Box>
                        
                                                                         {/* Level 2 - Grandchildren (if depth > 1) */}
                        {treeDepth > 1 && (
                          <Box mb={`var(--tree-height)`}>
                            {/* Connection Lines from Level 1 to Level 2 */}
                            <Box position="relative" height={`calc(var(--tree-height) - 2rem)`} mb={4}>
                              <Center>
                                <Box position="relative" width="100%">
                                  {/* Main horizontal distribution line */}
                                  <Box
                                    position="absolute"
                                    left="10%"
                                    right="10%"
                                    top="0"
                                    height="4px"
                                    bgGradient="linear(to-r, purple.400, green.500, purple.400)"
                                    borderRadius="7px"
                                    zIndex={1}
                                    className="connection-line-horizontal"
                                    style={{ animationDelay: "1.4s" }}
                                  />
                                  
                                  {/* Individual connection points */}
                                  {processedHierarchy?.downline?.map((childCoach, childIndex) => {
                                    if (childCoach.downline && childCoach.downline.length > 0) {
                                      return childCoach.downline.map((_, grandIndex) => {
                                        const totalGrandChildren = (processedHierarchy?.downline || []).reduce((total, child) => 
                                          total + (child.downline ? child.downline.length : 0), 0
                                        );
                                        const grandChildPosition = (grandIndex + childIndex * 2) * (80 / Math.max(totalGrandChildren - 1, 1));
                                                                                  return (
                                            <Box
                                              key={`connection-${childIndex}-${grandIndex}`}
                                              position="absolute"
                                              top="0"
                                              left={`${10 + grandChildPosition}%`}
                                              width="8px"
                                              height="8px"
                                              bg="green.500"
                                              borderRadius="7px"
                                              border="2px solid white"
                                              boxShadow="0 0 0 2px green.500"
                                              zIndex={2}
                                              className="connection-point-level2"
                                              style={{ animationDelay: `${1.6 + grandIndex * 0.1}s` }}
                                            />
                                          );
                                      });
                                    }
                                    return null;
                                  })}
                                </Box>
                              </Center>
                            </Box>
                            
                            {/* Level 2 Children in Horizontal Row */}
                            <Box 
                              w="full" 
                              overflowX="auto"
                              sx={{
                                '&::-webkit-scrollbar': { height: '8px' },
                                '&::-webkit-scrollbar-track': { background: 'gray.100', borderRadius: '4px' },
                                '&::-webkit-scrollbar-thumb': { background: 'green.400', borderRadius: '4px' }
                              }}
                            >
                              <HStack 
                                spacing={`var(--node-spacing)`} 
                                justify="center" 
                                minW="max-content"
                                px={4}
                              >
                                {processedHierarchy.downline.map((childCoach, childIndex) => (
                                  childCoach.downline && childCoach.downline.length > 0 ? (
                                    childCoach.downline.map((grandChildCoach, grandIndex) => (
                                      <Box key={`${childIndex}-${grandIndex}`} position="relative">
                                        {/* Connection line from Level 1 to Level 2 */}
                                        <Tooltip 
                                          label={`${childCoach.name} → ${grandChildCoach.name}`}
                                          placement="top"
                                          hasArrow
                                          bg="purple.500"
                                          color="white"
                                        >
                                          <Box
                                            position="absolute"
                                            bottom="100%"
                                            left="50%"
                                            width="4px"
                                            height="30px"
                                            bgGradient="linear(to-b, purple.500, green.500)"
                                            borderRadius="7px"
                                            transform="translateX(-50%)"
                                            zIndex={1}
                                            className="connection-line-level2"
                                            style={{ animationDelay: `${1.5 + grandIndex * 0.1}s` }}
                                            _hover={{
                                              width: "6px",
                                              boxShadow: "0 0 10px rgba(147, 51, 234, 0.6)",
                                              transition: "all 0.3s ease"
                                            }}
                                            transition="all 0.3s ease"
                                            cursor="pointer"
                                          />
                                        </Tooltip>
                                        
                                        {/* Connection indicator above Level 2 */}
                                        <Box
                                          position="absolute"
                                          top="-20px"
                                          left="50%"
                                          transform="translateX(-50%)"
                                          zIndex={2}
                                        >
                                          <Box
                                            w="10px"
                                            h="10px"
                                            bg="green.500"
                                            borderRadius="7px"
                                            border="2px solid white"
                                            boxShadow="0 0 0 2px green.500"
                                            className="connection-point-level2"
                                            style={{ animationDelay: `${1.6 + grandIndex * 0.1}s` }}
                                          />
                                        </Box>
                                        
                                        <HierarchyNode
                                          coach={grandChildCoach}
                                          level={2}
                                          onViewCoach={onViewCoach}
                                          onEditCoach={onEditCoach}
                                          maxLevels={treeDepth}
                                        />
                                      </Box>
                                    ))
                                  ) : (
                                    <Box key={`empty-${childIndex}`} w="200px" h="100px" />
                                  )
                                ))}
                              </HStack>
                            </Box>
                          </Box>
                        )}
                        
                                                                         {/* Level 3 - Great Grandchildren (if depth > 2) */}
                        {treeDepth > 2 && (
                          <Box mb={`var(--tree-height)`}>
                            {/* Connection Lines from Level 2 to Level 3 */}
                            <Box position="relative" height={`calc(var(--tree-height) - 2rem)`} mb={4}>
                              <Center>
                                <Box position="relative" width="100%">
                                  {/* Main horizontal distribution line */}
                                  <Box
                                    position="absolute"
                                    left="15%"
                                    right="15%"
                                    top="0"
                                    height="4px"
                                    bgGradient="linear(to-r, green.400, orange.500, green.400)"
                                    borderRadius="7px"
                                    zIndex={1}
                                    className="connection-line-horizontal"
                                    style={{ animationDelay: "1.7s" }}
                                  />
                                  
                                  {/* Individual connection points for Level 3 */}
                                  {(processedHierarchy?.downline || []).map((childCoach, childIndex) => {
                                    if (childCoach.downline && childCoach.downline.length > 0) {
                                      return childCoach.downline.map((grandChildCoach, grandIndex) => {
                                        if (grandChildCoach.downline && grandChildCoach.downline.length > 0) {
                                          return grandChildCoach.downline.map((_, greatGrandIndex) => {
                                            const totalGreatGrandChildren = (processedHierarchy?.downline || []).reduce((total, child) => 
                                              total + (child.downline ? 
                                                child.downline.reduce((subTotal, grandChild) => 
                                                  subTotal + (grandChild.downline ? grandChild.downline.length : 0), 0
                                                ) : 0
                                              ), 0
                                            );
                                            const greatGrandChildPosition = (greatGrandIndex + grandIndex * 2 + childIndex * 3) * (70 / Math.max(totalGreatGrandChildren - 1, 1));
                                            return (
                                              <Box
                                                key={`connection-l3-${childIndex}-${grandIndex}-${greatGrandIndex}`}
                                                position="absolute"
                                                top="0"
                                                left={`${15 + greatGrandChildPosition}%`}
                                                width="8px"
                                                height="8px"
                                                bg="orange.500"
                                                borderRadius="7px"
                                                border="2px solid white"
                                                boxShadow="0 0 0 2px orange.500"
                                                zIndex={2}
                                                className="connection-point-level3"
                                                style={{ animationDelay: `${1.9 + greatGrandIndex * 0.1}s` }}
                                              />
                                            );
                                          });
                                        }
                                        return null;
                                      });
                                    }
                                    return null;
                                  })}
                                </Box>
                              </Center>
                            </Box>
                            
                            {/* Level 3 Children in Horizontal Row */}
                            <Box 
                              w="full" 
                              overflowX="auto"
                              sx={{
                                '&::-webkit-scrollbar': { height: '8px' },
                                '&::-webkit-scrollbar-track': { background: 'gray.100', borderRadius: '4px' },
                                '&::-webkit-scrollbar-thumb': { background: 'orange.400', borderRadius: '4px' }
                              }}
                            >
                              <HStack 
                                spacing={`var(--node-spacing)`} 
                                justify="center" 
                                minW="max-content"
                                px={4}
                              >
                                {(processedHierarchy?.downline || []).map((childCoach, childIndex) => (
                                  childCoach.downline && childCoach.downline.length > 0 ? (
                                    childCoach.downline.map((grandChildCoach, grandIndex) => (
                                      grandChildCoach.downline && grandChildCoach.downline.length > 0 ? (
                                        grandChildCoach.downline.map((greatGrandChildCoach, greatGrandIndex) => (
                                          <Box key={`${childIndex}-${grandIndex}-${greatGrandIndex}`} position="relative">
                                            {/* Connection line from Level 2 to Level 3 */}
                                            <Box
                                              position="absolute"
                                              bottom="100%"
                                              left="50%"
                                              width="4px"
                                              height="30px"
                                              bgGradient="linear(to-b, green.500, orange.500)"
                                              borderRadius="7px"
                                              transform="translateX(-50%)"
                                              zIndex={1}
                                              className="connection-line-level3"
                                              style={{ animationDelay: `${1.8 + greatGrandIndex * 0.1}s` }}
                                            />
                                            
                                            {/* Connection indicator above Level 3 */}
                                            <Box
                                              position="absolute"
                                              top="-20px"
                                              left="50%"
                                              transform="translateX(-50%)"
                                              zIndex={2}
                                            >
                                              <Box
                                                w="8px"
                                                h="8px"
                                                bg="orange.500"
                                                borderRadius="7px"
                                                border="2px solid white"
                                                boxShadow="0 0 0 2px orange.500"
                                                className="connection-point-level3"
                                                style={{ animationDelay: `${1.9 + greatGrandIndex * 0.1}s` }}
                                              />
                                            </Box>
                                            
                                            <HierarchyNode
                                              coach={greatGrandChildCoach}
                                              level={3}
                                              onViewCoach={onViewCoach}
                                              onEditCoach={onEditCoach}
                                              maxLevels={treeDepth}
                                            />
                                          </Box>
                                        ))
                                      ) : (
                                        <Box key={`empty-l2-${childIndex}-${grandIndex}`} w="200px" h="100px" />
                                      )
                                    ))
                                  ) : (
                                    <Box key={`empty-l1-${childIndex}`} w="200px" h="100px" />
                                  )
                                ))}
                              </HStack>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                  </Box>
                </VStack>
              ) : (
                <TableView 
                  hierarchyData={processedHierarchy} 
                  onViewCoach={onViewCoach}
                  onEditCoach={onEditCoach}
                  searchTerm={searchTerm}
                />
              )}
            </CardBody>
          </Card>

          {/* Enhanced Hierarchy Legend */}
          <Card bg="white" border="1px" borderColor="gray.200" borderRadius="7px" boxShadow="sm">
            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Heading size="md" color="blue.800">
                    Hierarchy Legend & Guide
                  </Heading>
                  <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                    MLM Structure Guide
                  </Badge>
                </HStack>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <VStack align="start" spacing={3}>
                    <Text fontWeight="bold" color="blue.700" fontSize="sm">
                      Level Color Coding:
                    </Text>
                    <SimpleGrid columns={1} spacing={2}>
                      <HStack spacing={3}>
                        <Box w="16px" h="16px" bg="blue.500" borderRadius="full" />
                        <Text fontSize="sm" color="blue.700">Head Coach (You) - Level 0</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Box w="16px" h="16px" bg="purple.500" borderRadius="full" />
                        <Text fontSize="sm" color="blue.700">Direct Team - Level 1</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Box w="16px" h="16px" bg="green.500" borderRadius="full" />
                        <Text fontSize="sm" color="blue.700">Second Level - Level 2</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Box w="16px" h="16px" bg="orange.500" borderRadius="full" />
                        <Text fontSize="sm" color="blue.700">Third Level - Level 3</Text>
                      </HStack>
                      <HStack spacing={3}>
                        <Box w="16px" h="16px" bg="red.500" borderRadius="full" />
                        <Text fontSize="sm" color="blue.700">Level 4 and beyond</Text>
                      </HStack>
                    </SimpleGrid>
                  </VStack>

                  <VStack align="start" spacing={3}>
                    <Text fontWeight="bold" color="blue.700" fontSize="sm">
                      Understanding the Structure:
                    </Text>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" color="blue.600">
                        • <strong>Direct:</strong> Coaches directly sponsored by this member
                      </Text>
                      <Text fontSize="sm" color="blue.600">
                        • <strong>Team Size:</strong> Total members in downline (all levels)
                      </Text>
                      <Text fontSize="sm" color="blue.600">
                        • <strong>Performance:</strong> Activity score and streak days
                      </Text>
                      <Text fontSize="sm" color="blue.600">
                        • <strong>Active:</strong> Currently participating members
                      </Text>
                      <Text fontSize="sm" color="blue.600">
                        • <strong>Lines:</strong> Show sponsor-downline relationships
                      </Text>
                    </VStack>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        </>
      )}
    </VStack>
  );
};

// --- TABLE VIEW COMPONENT ---
const TableView = ({ hierarchyData, onViewCoach, onEditCoach, searchTerm }) => {
  const flattenHierarchy = (node, level = 0, parentName = '', sponsorName = '') => {
    let result = [{
      ...node,
      level,
      parentName,
      sponsorName,
      indentedName: '  '.repeat(level) + node.name
    }];
    
    if (node.downline) {
      node.downline.forEach(child => {
        result = result.concat(flattenHierarchy(child, level + 1, node.name, node.name));
      });
    }
    
    return result;
  };

  const flatData = flattenHierarchy(hierarchyData);
  const filteredData = flatData.filter(coach =>
    coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.sponsorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TableContainer>
      <Table variant="simple" size="md">
        <Thead>
          <Tr bg="gray.50">
            <Th py={4} color="gray.700" fontWeight="bold">COACH HIERARCHY</Th>
            <Th py={4} color="gray.700" fontWeight="bold">LEVEL</Th>
            <Th py={4} color="gray.700" fontWeight="bold">SPONSOR</Th>
            <Th py={4} color="gray.700" fontWeight="bold">STATUS</Th>
            <Th py={4} color="gray.700" fontWeight="bold">PERFORMANCE</Th>
            <Th py={4} color="gray.700" fontWeight="bold">TEAM</Th>
            <Th py={4} color="gray.700" fontWeight="bold">ACTIONS</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredData.map((coach, index) => {
            const levelColors = ['blue', 'purple', 'green', 'orange', 'red'];
            const colorScheme = levelColors[Math.min(coach.level, 4)];
            
            return (
              <Tr key={coach._id || index} _hover={{ bg: 'gray.50' }} borderBottom="1px" borderColor="gray.100">
                <Td py={4}>
                  <HStack spacing={3}>
                    <Box w={`${coach.level * 24}px`} />
                    {coach.level > 0 && (
                      <Box w="16px" h="2px" bg={`${colorScheme}.300`} />
                    )}
                    <Avatar 
                      size="sm" 
                      name={coach.name} 
                      bg={`${colorScheme}.500`}
                      color="white"
                    />
                    <VStack align="start" spacing={1}>
                      <HStack spacing={2}>
                        <Text fontSize="sm" fontWeight="bold" color="gray.800">
                          {coach.name}
                        </Text>
                        {coach.level === 0 && (
                          <Badge colorScheme="blue" size="sm" borderRadius="full">
                            YOU
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {coach.email}
                      </Text>
                    </VStack>
                  </HStack>
                </Td>
                <Td py={4}>
                  <Badge colorScheme={colorScheme} size="md" borderRadius="full" px={3} py={1}>
                    {coach.level === 0 ? 'HEAD' : `L${coach.level}`}
                  </Badge>
                </Td>
                <Td py={4}>
                  <Text fontSize="sm" color="gray.700">
                    {coach.sponsorName || (coach.level === 0 ? 'Self' : 'N/A')}
                  </Text>
                </Td>
                <Td py={4}>
                  <VStack align="start" spacing={1}>
                    <Badge 
                      colorScheme={coach.isActive ? 'green' : 'red'} 
                      size="sm"
                      borderRadius="7px"
                    >
                      {coach.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      {coach.teamRankName || 'No rank'}
                    </Text>
                  </VStack>
                </Td>
                <Td py={4}>
                  {coach.performance ? (
                    <HStack spacing={3}>
                      <CircularProgress
                        value={coach.performance.performanceScore || 0}
                        size="35px"
                        color={`${colorScheme}.400`}
                        thickness="6px"
                      >
                        <CircularProgressLabel fontSize="10px" fontWeight="bold">
                          {coach.performance.performanceScore || 0}
                        </CircularProgressLabel>
                      </CircularProgress>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="bold" color="gray.700">
                          {coach.performance.performanceScore || 0}%
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {coach.performance.activityStreak || 0}d streak
                        </Text>
                      </VStack>
                    </HStack>
                  ) : (
                    <Text fontSize="sm" color="gray.400">No data</Text>
                  )}
                </Td>
                <Td py={4}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color={`${colorScheme}.600`}>
                      {coach.downline ? coach.downline.length : 0} Direct
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {calculateTotalTeamSize(coach)} Total
                    </Text>
                  </VStack>
                </Td>
                <Td py={4}>
                  <ButtonGroup size="sm" spacing={1}>
                    <Tooltip label="View Details">
                      <IconButton
                        icon={<ViewIcon />}
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => onViewCoach(coach)}
                        _hover={{ bg: 'blue.100' }}
                      />
                    </Tooltip>
                    <Tooltip label="Edit Coach">
                      <IconButton
                        icon={<EditIcon />}
                        colorScheme="orange"
                        variant="ghost"
                        onClick={() => onEditCoach(coach)}
                        _hover={{ bg: 'orange.100' }}
                      />
                    </Tooltip>
                  </ButtonGroup>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

// --- BEAUTIFUL CONFIRMATION MODAL ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
      <ModalContent borderRadius="7px">
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box 
            bg="orange.50" 
            border="1px" 
            borderColor="orange.200" 
            borderRadius="7px" 
            p={4}
          >
            <HStack spacing={3}>
              <Box color="orange.500" fontSize="xl">⚠️</Box>
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold" color="orange.800">
                  Are you sure?
                </Text>
                <Text color="orange.700" fontSize="sm">
                  {message}
                </Text>
              </VStack>
            </HStack>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            bg="red.600" 
            color="white" 
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText="Deleting..."
            _hover={{ bg: 'red.700' }}
            _active={{ bg: 'red.800' }}
          >
            Confirm Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// --- MAIN MLM DASHBOARD COMPONENT ---
const MLMDashboard = () => {
  const authState = useSelector(state => state.auth);
  const token = getToken(authState);
  const coachId = getCoachId(authState);
  const user = authState?.user;
  const toast = useCustomToast();
  
  // Color scheme matching calendar component
  const textColor = useColorModeValue('gray.900', 'gray.100');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  const subtleBg = useColorModeValue('gray.50', 'gray.700');
  
  // Enhanced authentication with fallback
  const [effectiveAuth, setEffectiveAuth] = useState({ coachId, token, user });
  
  // Debug authentication state and set fallback
  useEffect(() => {
    console.log('🔍 Authentication Debug:');
    console.log('  - Redux authState:', authState);
    console.log('  - Redux coachId:', coachId);
    console.log('  - Redux token:', token ? 'Present' : 'Missing');
    console.log('  - Redux user:', user ? 'Present' : 'Missing');
    
    // Check localStorage as fallback
    const localAuth = getLocalStorageAuth();
    console.log('  - localStorage auth:', localAuth);
    
    // Use Redux data if available, otherwise fallback to localStorage
    const finalCoachId = coachId || localAuth.coachId;
    const finalToken = token || localAuth.token;
    const finalUser = user || localAuth.user;
    
    console.log('  - Final coachId:', finalCoachId);
    console.log('  - Final token:', finalToken ? 'Present' : 'Missing');
    console.log('  - Final user:', finalUser ? 'Present' : 'Missing');
    
    setEffectiveAuth({
      coachId: finalCoachId,
      token: finalToken,
      user: finalUser
    });
    
    if (!finalCoachId || !finalToken) {
      console.error('❌ Authentication data not available!');
      toast('Authentication data not available. Please log in again.', 'warning');
    } else {
      console.log('✅ Authentication data available');
    }
  }, [authState, coachId, token, user, toast]);
  
  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [performanceSubTab, setPerformanceSubTab] = useState(0); // Sub-tab for performance metrics
  const [loading, setLoading] = useState(false);
  const [downlineData, setDownlineData] = useState([]);
  const [hierarchyData, setHierarchyData] = useState(null);
  const [teamPerformance, setTeamPerformance] = useState(null);
  const [reports, setReports] = useState([]);
  const [hierarchyLevels, setHierarchyLevels] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [commissionSummary, setCommissionSummary] = useState({ totalEarned: 0, pendingAmount: 0, totalCommissions: 0 });
  const [adminRequests, setAdminRequests] = useState([]);
  const [currentSponsor, setCurrentSponsor] = useState(null);
  const [showAdminRequestForm, setShowAdminRequestForm] = useState(false);
  const [sponsorSearchResults, setSponsorSearchResults] = useState([]);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [requestForm, setRequestForm] = useState({
    requestType: 'sponsor_change',
    requestedSponsorId: '',
    reason: ''
  });
  const [coachPerformance, setCoachPerformance] = useState(null);
  const [salesPerformance, setSalesPerformance] = useState(null);
  const [clientPerformance, setClientPerformance] = useState(null);
  const [leadPerformance, setLeadPerformance] = useState(null);

  // Calculate hierarchy stats for team performance fallback
  const hierarchyStats = useMemo(() => {
    if (!hierarchyData) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        maxDepth: 0,
        levelCounts: {}
      };
    }
    
    const calculateStats = (node, level = 0) => {
      let stats = {
        totalMembers: 1,
        activeMembers: node.isActive ? 1 : 0,
        maxDepth: level,
        levelCounts: { [level]: 1 }
      };
      
      if (node.downline) {
        node.downline.forEach(child => {
          const childStats = calculateStats(child, level + 1);
          stats.totalMembers += childStats.totalMembers;
          stats.activeMembers += childStats.activeMembers;
          stats.maxDepth = Math.max(stats.maxDepth, childStats.maxDepth);
          
          Object.keys(childStats.levelCounts).forEach(lvl => {
            stats.levelCounts[lvl] = (stats.levelCounts[lvl] || 0) + childStats.levelCounts[lvl];
          });
        });
      }
      
      return stats;
    };
    
    const stats = calculateStats(hierarchyData);
    return stats;
  }, [hierarchyData]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [levelsToShow, setLevelsToShow] = useState(5);
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [reportFilter, setReportFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoaches, setSelectedCoaches] = useState(new Set());
  const [treeZoom, setTreeZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [treePosition, setTreePosition] = useState({ x: 0, y: 0 });

  // Request deduplication - prevent multiple simultaneous calls
  const fetchingRef = useRef({
    hierarchy: false,
    downline: false,
    teamPerformance: false,
    reports: false
  });
  
  // Tree Layout State
  const [nodeSpacing, setNodeSpacing] = useState(6);
  const [treeHeight, setTreeHeight] = useState(8);

  // Modal States
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isReportModalOpen, onOpen: onReportModalOpen, onClose: onReportModalClose } = useDisclosure();

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    sponsorId: '',
    selfCoachId: '',
    currentLevel: 1,
    bio: '',
    city: '',
    country: '',
    company: '',
    experienceYears: 0,
    specializations: '',
    isActive: true,
    teamRankName: '',
    presidentTeamRankName: ''
  });
  
  // Update formData when effectiveAuth changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      sponsorId: effectiveAuth.coachId || user?.id || ''
    }));
  }, [effectiveAuth.coachId, user?.id]);

  const [reportConfig, setReportConfig] = useState({
    reportType: 'team_summary',
    period: 'monthly',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // Today
  });

  const BASE_URL = API_BASE_URL; // Keep for compatibility

  const [isReportDetailOpen, setIsReportDetailOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetail, setReportDetail] = useState(null);

  // Helper Functions for Team Structure
  const getMaxLevel = (data) => {
    if (!data) return 0;
    const calculateLevel = (node, currentLevel = 0) => {
      if (!node.downlineHierarchy && !node.downline) return currentLevel;
      const children = node.downlineHierarchy || node.downline || [];
      if (children.length === 0) return currentLevel;
      return Math.max(...children.map(child => calculateLevel(child, currentLevel + 1)));
    };
    return calculateLevel(data);
  };

  const getActiveCoachesCount = (data) => {
    if (!data) return 0;
    let count = 0;
    const traverse = (node) => {
      if (node.isActive !== false) count++; // Count if not explicitly inactive
      const children = node.downlineHierarchy || node.downline || [];
      children.forEach(traverse);
    };
    traverse(data);
    return count;
  };

  const getTotalTeamSize = (data) => {
    if (!data) return 0;
    let count = 0;
    const traverse = (node) => {
      count++;
      const children = node.downlineHierarchy || node.downline || [];
      children.forEach(traverse);
    };
    traverse(data);
    return count - 1; // Exclude the root node
  };

  // API Headers - ENHANCED with fallback authentication
  const getHeaders = () => {
    const authData = effectiveAuth;
    console.log('🔐 getHeaders - effectiveAuth:', authData);
    console.log('🔑 Token being used:', authData.token ? 'Present' : 'Missing');
    console.log('🆔 Coach-ID being used:', authData.coachId);
    
    const headers = {
      'Authorization': `Bearer ${authData.token}`,
      'Coach-ID': authData.coachId || '',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    console.log('📤 Headers being sent:', headers);
    return headers;
  };

  // API Functions
  const fetchHierarchyLevels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/advanced-mlm/hierarchy-levels`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setHierarchyLevels(data.success ? data.data : data);
      }
    } catch (error) {
      console.error('💥 fetchHierarchyLevels Error:', error);
    }
  };

  const fetchDownline = async () => {
    // Prevent duplicate calls
    if (fetchingRef.current.downline) {
      return;
    }
    
    const authData = effectiveAuth;
    
    if (!authData.coachId || !authData.token) {
      console.error('❌ Missing authentication data:', authData);
      toast('Authentication data not available. Please log in again.', 'error');
      return;
    }
    
    fetchingRef.current.downline = true;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/advanced-mlm/downline/${authData.coachId}?includePerformance=true`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        const downlineArray = data.success && data.data ? 
          (data.data.downlineWithPerformance || data.data.downline || data.data) : 
          (data.downlineWithPerformance || data.downline || data);
        
        setDownlineData(Array.isArray(downlineArray) ? downlineArray : []);
      } else {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        // Check if it's a 404 with "no data" message (not a real error)
        if (response.status === 404 && (
          errorData.message?.toLowerCase().includes('no downline found') ||
          errorData.message?.toLowerCase().includes('not found')
        )) {
          // No downline yet - this is normal, just set empty array (no error logging)
          setDownlineData([]);
        } else {
          // Real error - only log if it's not a 404
          if (response.status !== 404) {
            console.error('💥 fetchDownline Error:', errorText);
            toast('Failed to fetch downline data', 'error');
          }
          setDownlineData([]);
        }
      }
    } catch (error) {
      console.error('💥 fetchDownline Error:', error);
      // Only show toast for network errors, not 404s
      if (error.message && !error.message.includes('404')) {
        toast('Failed to fetch downline data', 'error');
      }
      setDownlineData([]);
    } finally {
      fetchingRef.current.downline = false;
      setLoading(false);
    }
  };

  const fetchHierarchy = async () => {
    // Prevent duplicate calls
    if (fetchingRef.current.hierarchy) {
      return;
    }
    
    const authData = effectiveAuth;
    
    if (!authData.coachId || !authData.token) {
      console.error('❌ Missing authentication data:', authData);
      toast('Authentication data not available. Please log in again.', 'error');
      return;
    }
    
    fetchingRef.current.hierarchy = true;
    setLoading(true);
    try {
      // Use the proper hierarchy API endpoint
      const response = await fetch(`${API_BASE_URL}/api/advanced-mlm/hierarchy/${authData.coachId}?levels=${levelsToShow || 5}&includePerformance=true`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Process the data from hierarchy API
        let processedData;
        if (data.success && data.data) {
          // Hierarchy API returns nested structure with root data
          processedData = data.data;
        } else if (data.data) {
          processedData = data.data;
        } else {
          processedData = data;
        }
        
        // Ensure the data has the expected structure
        if (!processedData.downline && !processedData.downlineHierarchy) {
          processedData = {
            ...processedData,
            downline: [],
            downlineHierarchy: []
          };
        }
        
        setHierarchyData(processedData);
        
        // Console log Team Structure data
        console.log('🏗️ TEAM STRUCTURE DATA:');
        console.log('Hierarchy Data:', processedData);
        if (processedData) {
          console.log('Root Coach:', processedData.name);
          console.log('Available fields in data:', Object.keys(processedData));
          
          if (processedData.downlineHierarchy && processedData.downlineHierarchy.length > 0) {
            console.log('Sample member fields:', Object.keys(processedData.downlineHierarchy[0]));
            console.log('First member data:', processedData.downlineHierarchy[0]);
          }
          
          console.log('Total Direct Members:', processedData.downline ? processedData.downline.length : 0);
          console.log('Total Team Members:', calculateTotalTeamSize(processedData));
          if (processedData.downline && processedData.downline.length > 0) {
            console.log('Direct Members List:', processedData.downline.map(member => ({
              name: member.name,
              email: member.email,
              level: member.currentLevel || member.level,
              sponsorId: member.sponsorId,
              _id: member._id
            })));
          }
        }
      } else {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        // Check if it's a 404 with "no data" message (not a real error)
        if (response.status === 404 && (
          errorData.message?.toLowerCase().includes('no downline') ||
          errorData.message?.toLowerCase().includes('not found')
        )) {
          // Set empty hierarchy data (no downline yet) - this is expected, not an error
          const emptyData = {
            name: effectiveAuth.user?.name || user?.name || 'Network Leader',
            email: effectiveAuth.user?.email || user?.email || '',
            _id: effectiveAuth.coachId || user?.id,
            profilePictureUrl: effectiveAuth.user?.profilePictureUrl || user?.profilePictureUrl,
            isActive: true,
            currentLevel: 0,
            downline: [],
            downlineHierarchy: []
          };
          setHierarchyData(emptyData);
        } else {
          // Real error - only log if it's not a 404
          if (response.status !== 404) {
            console.error('fetchHierarchy Failed - Status:', response.status);
            console.error('fetchHierarchy Failed - Error:', errorText);
            toast('Failed to fetch hierarchy data', 'error');
          }
          // Set empty data on error
          const emptyData = {
            name: effectiveAuth.user?.name || user?.name || 'Network Leader',
            email: effectiveAuth.user?.email || user?.email || '',
            _id: effectiveAuth.coachId || user?.id,
            profilePictureUrl: effectiveAuth.user?.profilePictureUrl || user?.profilePictureUrl,
            isActive: true,
            currentLevel: 0,
            downline: [],
            downlineHierarchy: []
          };
          setHierarchyData(emptyData);
        }
      }
    } catch (error) {
      console.error('💥 fetchHierarchy Error:', error);
      toast('Failed to fetch hierarchy data', 'error');
      
      // Set empty data on network error
      const emptyData = {
        name: effectiveAuth.user?.name || user?.name || 'Network Leader',
        email: effectiveAuth.user?.email || user?.email || '',
        _id: effectiveAuth.coachId || user?.id,
        profilePictureUrl: effectiveAuth.user?.profilePictureUrl || user?.profilePictureUrl,
        isActive: true,
        currentLevel: 0,
        downline: [],
        downlineHierarchy: []
      };
      
      setHierarchyData(emptyData);
    } finally {
      fetchingRef.current.hierarchy = false;
      setLoading(false);
    }
  };

  const fetchTeamPerformance = async () => {
    // Prevent duplicate calls
    if (fetchingRef.current.teamPerformance) {
      return;
    }
    
    const authData = effectiveAuth;
    
    if (!authData.coachId || !authData.token) {
      console.error('❌ Missing authentication data:', authData);
      return;
    }
    
    fetchingRef.current.teamPerformance = true;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/advanced-mlm/team-performance/${authData.coachId}?period=monthly`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        
        console.log('✅ Team Performance Data Received:', data);
        
        if (data.success && data.data) {
          // Map the backend data structure to frontend expectations
          const performanceData = {
            // Team summary stats
            totalTeamSize: data.data.summary?.teamSize || 0,
            activeCoaches: data.data.summary?.memberDetails?.filter(m => m.performance?.isActive)?.length || 0,
            totalRevenue: data.data.summary?.totalRevenue || 0,
            averagePerformanceScore: data.data.summary?.memberDetails?.length > 0 
              ? data.data.summary.memberDetails.reduce((sum, m) => sum + (m.performance?.score || 0), 0) / data.data.summary.memberDetails.length 
              : 0,
            
            // Detailed metrics
            totalLeads: data.data.summary?.totalLeads || 0,
            totalSales: data.data.summary?.totalSales || 0,
            averageConversionRate: data.data.summary?.averageConversionRate || 0,
            
            // Member details for individual performance
            memberDetails: data.data.summary?.memberDetails || [],
            
            // Top and under performers
            topPerformers: data.data.summary?.topPerformers || [],
            underPerformers: data.data.summary?.underPerformers || [],
            
            // Additional metrics
            period: data.data.period || 'monthly',
            dateRange: data.data.dateRange || {},
            
            // Calculated metrics
            totalTasks: data.data.summary?.memberDetails?.reduce((sum, m) => sum + (m.tasks?.total || 0), 0) || 0,
            completedTasks: data.data.summary?.memberDetails?.reduce((sum, m) => sum + (m.tasks?.completed || 0), 0) || 0,
            qualifiedLeads: data.data.summary?.memberDetails?.reduce((sum, m) => sum + (m.leads?.qualified || 0), 0) || 0,
            convertedLeads: data.data.summary?.memberDetails?.reduce((sum, m) => sum + (m.leads?.converted || 0), 0) || 0,
          };
          
          setTeamPerformance(performanceData);
          console.log('✅ Processed Performance Data:', performanceData);
        } else {
          console.warn('⚠️ No performance data available');
          setTeamPerformance(null);
        }
      } else {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        // Check if it's a 404 with "no data" message (not a real error)
        if (response.status === 404 && (
          errorData.message?.toLowerCase().includes('no team members found') ||
          errorData.message?.toLowerCase().includes('not found')
        )) {
          console.log('ℹ️ No team members found - setting empty performance data');
          setTeamPerformance(null);
        } else {
          console.error('❌ Team Performance API Error:', response.status, errorData);
          toast(errorData.message || 'Failed to fetch team performance', 'error');
          setTeamPerformance(null);
        }
      }
    } catch (error) {
      console.error('💥 fetchTeamPerformance Error:', error);
      toast('Failed to fetch team performance', 'error');
      setTeamPerformance(null);
    } finally {
      fetchingRef.current.teamPerformance = false;
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    // Prevent duplicate calls
    if (fetchingRef.current.reports) {
      return;
    }
    
    const authData = effectiveAuth;
    if (!authData.coachId || !authData.token) {
      console.warn('⚠️ fetchReports: Missing authentication data');
      return;
    }
    
    fetchingRef.current.reports = true;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/advanced-mlm/reports/${authData.coachId}?limit=10`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data.success ? data.data : data);
        console.log('✅ Reports fetched successfully:', data);
      } else {
        console.error('❌ fetchReports: API Error', response.status, response.statusText);
        setReports([]);
      }
    } catch (error) {
      console.error('💥 fetchReports Error:', error);
      toast('Failed to fetch reports', 'error');
      setReports([]);
    } finally {
      fetchingRef.current.reports = false;
      setLoading(false);
    }
  };

  const fetchReportDetail = async reportId => {
    if (!reportId) {
      console.warn('⚠️ fetchReportDetail: No report ID provided');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/advanced-mlm/reports/detail/${reportId}`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        const reportData = data.success ? data.data : data;
        setReportDetail(reportData);
        console.log('✅ Report detail fetched successfully:', reportData);
      } else {
        console.error('❌ fetchReportDetail: API Error', response.status, response.statusText);
        setReportDetail(null);
        toast('Failed to fetch report details', 'error');
      }
    } catch (error) {
      console.error('💥 fetchReportDetail Error:', error);
      setReportDetail(null);
      toast('Failed to fetch report details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openReportDetail = report => {
    setSelectedReport(report);
    setIsReportDetailOpen(true);
    if (report?._id) {
      fetchReportDetail(report._id);
    } else {
      console.warn('⚠️ openReportDetail: No report ID found');
      setReportDetail(null);
    }
  };

  const closeReportDetail = () => {
    setIsReportDetailOpen(false);
    setSelectedReport(null);
    setReportDetail(null);
  };

  const downloadReportAs = async (format) => {
    try {
      const data = reportDetail;
      if (!data) {
        toast('No report data available', 'error');
        return;
      }

      const fileName = `report-${data.reportType || 'summary'}-${new Date().toISOString().split('T')[0]}`;
      
      switch (format) {
        case 'json':
          downloadAsJSON(data, fileName);
          break;
        case 'pdf':
          downloadAsPDF(data, fileName);
          break;
        case 'excel':
          downloadAsExcel(data, fileName);
          break;
        case 'word':
          downloadAsWord(data, fileName);
          break;
        case 'csv':
          downloadAsCSV(data, fileName);
          break;
        default:
          downloadAsJSON(data, fileName);
      }
      
      toast(`Report downloaded as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('💥 downloadReportAs Error:', error);
      toast('Failed to download report', 'error');
    }
  };

  const downloadAsJSON = (data, fileName) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    downloadBlob(blob, `${fileName}.json`);
  };

  const downloadAsPDF = (data, fileName) => {
    // Create a simple HTML representation for PDF
    const htmlContent = generateReportHTML(data);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    downloadBlob(blob, `${fileName}.html`);
    toast('PDF download: HTML file generated (convert to PDF using browser)', 'info');
  };

  const downloadAsExcel = (data, fileName) => {
    // Create CSV format for Excel compatibility
    const csvContent = generateReportCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadBlob(blob, `${fileName}.csv`);
    toast('Excel download: CSV file generated (open in Excel)', 'info');
  };

  const downloadAsWord = (data, fileName) => {
    // Create a simple HTML representation for Word
    const htmlContent = generateReportHTML(data);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    downloadBlob(blob, `${fileName}.html`);
    toast('Word download: HTML file generated (open in Word)', 'info');
  };

  const downloadAsCSV = (data, fileName) => {
    const csvContent = generateReportCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadBlob(blob, `${fileName}.csv`);
  };

  const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateReportHTML = (data) => {
    const reportType = data.reportType || 'team_summary';
    const reportData = data.reportData || {};
    
    let content = '';
    
    switch (reportType) {
      case 'team_summary':
        content = generateTeamSummaryHTML(reportData);
        break;
      case 'performance_analysis':
        content = generatePerformanceAnalysisHTML(reportData);
        break;
      case 'coach_activity':
        content = generateCoachActivityHTML(reportData);
        break;
      case 'commission_report':
        content = generateCommissionReportHTML(reportData);
        break;
      default:
        content = generateTeamSummaryHTML(reportData);
    }
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${reportType.replace(/_/g, ' ').toUpperCase()} Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .metric { display: inline-block; margin: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .growth { color: ${reportData.comparisons?.previousPeriod?.leadsGrowth >= 0 ? 'green' : 'red'}; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 ${reportType.replace(/_/g, ' ').toUpperCase()} Report</h1>
        <p>Generated: ${new Date(data.generatedAt).toLocaleDateString()}</p>
        <p>Period: ${data.reportPeriod?.period || 'Custom Period'}</p>
    </div>
    ${content}
</body>
</html>
    `;
  };

  const generateTeamSummaryHTML = (data) => {
    return `
    <div class="section">
        <h2>Individual Metrics</h2>
        <div class="metric">Leads: ${data.individualMetrics?.leadsGenerated || 0}</div>
        <div class="metric">Conversions: ${data.individualMetrics?.leadsConverted || 0}</div>
        <div class="metric">Sales: ${data.individualMetrics?.salesClosed || 0}</div>
        <div class="metric">Revenue: ₹${(data.individualMetrics?.revenueGenerated || 0).toLocaleString()}</div>
    </div>
    
    <div class="section">
        <h2>Team Metrics</h2>
        <div class="metric">Team Size: ${data.teamMetrics?.teamSize || 0}</div>
        <div class="metric">Team Leads: ${data.teamMetrics?.teamLeads || 0}</div>
        <div class="metric">Team Sales: ${data.teamMetrics?.teamSales || 0}</div>
        <div class="metric">Team Revenue: ₹${(data.teamMetrics?.teamRevenue || 0).toLocaleString()}</div>
    </div>
    
    ${data.summary ? `
    <div class="section">
        <h2>Summary</h2>
        <div class="metric">Total Revenue: ₹${data.summary.totalRevenue?.toLocaleString() || 0}</div>
        <div class="metric">Total Leads: ${data.summary.totalLeads || 0}</div>
        <div class="metric">Total Sales: ${data.summary.totalSales || 0}</div>
        <div class="metric">Overall Conversion: ${data.summary.overallConversionRate?.toFixed(1) || 0}%</div>
    </div>
    ` : ''}
    `;
  };

  const generatePerformanceAnalysisHTML = (data) => {
    return `
    <div class="section">
        <h2>Performance Metrics</h2>
        <div class="metric">Leads Generated: ${data.performanceMetrics?.leadsGenerated || 0}</div>
        <div class="metric">Conversion Rate: ${(data.performanceMetrics?.conversionRate || 0).toFixed(1)}%</div>
        <div class="metric">Revenue Generated: ₹${(data.performanceMetrics?.revenueGenerated || 0).toLocaleString()}</div>
        <div class="metric">Sales Closed: ${data.performanceMetrics?.salesClosed || 0}</div>
    </div>
    
    ${data.growthAnalysis ? `
    <div class="section">
        <h2>Growth Analysis</h2>
        <div class="metric growth">Leads Growth: ${data.growthAnalysis.leadsGrowth >= 0 ? '+' : ''}${data.growthAnalysis.leadsGrowth?.toFixed(1) || 0}%</div>
        <div class="metric growth">Sales Growth: ${data.growthAnalysis.salesGrowth >= 0 ? '+' : ''}${data.growthAnalysis.salesGrowth?.toFixed(1) || 0}%</div>
        <div class="metric growth">Conversion Growth: ${data.growthAnalysis.conversionGrowth >= 0 ? '+' : ''}${data.growthAnalysis.conversionGrowth?.toFixed(1) || 0}%</div>
        <div class="metric growth">Revenue Growth: ${data.growthAnalysis.revenueGrowth >= 0 ? '+' : ''}${data.growthAnalysis.revenueGrowth?.toFixed(1) || 0}%</div>
    </div>
    ` : ''}
    
    ${data.trends ? `
    <div class="section">
        <h2>Performance Trends</h2>
        <div class="metric">Lead Trend: ${data.trends.leadTrend || 'stable'}</div>
        <div class="metric">Sales Trend: ${data.trends.salesTrend || 'stable'}</div>
        <div class="metric">Conversion Trend: ${data.trends.conversionTrend || 'stable'}</div>
    </div>
    ` : ''}
    
    ${data.insights && data.insights.length > 0 ? `
    <div class="section">
        <h2>Performance Insights</h2>
        ${data.insights.map(insight => `
        <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <strong>${insight.title}</strong> (${insight.type})<br>
            ${insight.description}<br>
            <em>Recommendation: ${insight.recommendation}</em>
        </div>
        `).join('')}
    </div>
    ` : ''}
    `;
  };

  const generateCoachActivityHTML = (data) => {
    return `
    <div class="section">
        <h2>Activity Metrics</h2>
        <div class="metric">Tasks Completed: ${data.activityMetrics?.tasksCompleted || 0}</div>
        <div class="metric">Leads Contacted: ${data.activityMetrics?.leadsContacted || 0}</div>
        <div class="metric">Task Completion Rate: ${(data.activityMetrics?.taskCompletionRate || 0).toFixed(1)}%</div>
        <div class="metric">Lead Conversion Rate: ${(data.activityMetrics?.leadConversionRate || 0).toFixed(1)}%</div>
    </div>
    
    ${data.productivity ? `
    <div class="section">
        <h2>Productivity Metrics</h2>
        <div class="metric">Total Activities: ${data.productivity.totalActivities || 0}</div>
        <div class="metric">Overall Completion Rate: ${(data.productivity.completionRate || 0).toFixed(1)}%</div>
        <div class="metric">Average Tasks/Day: ${(data.productivity.averageTasksPerDay || 0).toFixed(1)}</div>
        <div class="metric">Average Leads/Day: ${(data.productivity.averageLeadsPerDay || 0).toFixed(1)}</div>
    </div>
    ` : ''}
    
    ${data.recentActivities && data.recentActivities.length > 0 ? `
    <div class="section">
        <h2>Recent Activities</h2>
        <table>
            <tr><th>Type</th><th>Status</th><th>Value</th><th>Date</th></tr>
            ${data.recentActivities.slice(0, 20).map(activity => `
            <tr>
                <td>${activity.type === 'lead' ? 'Lead Activity' : 'Task Activity'}</td>
                <td>${activity.status}</td>
                <td>${activity.value ? `₹${activity.value.toLocaleString()}` : '-'}</td>
                <td>${new Date(activity.date).toLocaleDateString()}</td>
            </tr>
            `).join('')}
        </table>
    </div>
    ` : ''}
    `;
  };

  const generateCommissionReportHTML = (data) => {
    return `
    ${data.commissionSummary ? `
    <div class="section">
        <h2>Commission Summary</h2>
        <div class="metric">Total Earned: ₹${(data.commissionSummary.totalEarned || 0).toLocaleString()}</div>
        <div class="metric">Pending: ₹${(data.commissionSummary.totalPending || 0).toLocaleString()}</div>
        <div class="metric">Paid: ₹${(data.commissionSummary.totalPaid || 0).toLocaleString()}</div>
        <div class="metric">Average Commission: ₹${(data.commissionSummary.averageCommission || 0).toLocaleString()}</div>
    </div>
    ` : ''}
    
    ${data.commissionBreakdown ? `
    <div class="section">
        <h2>Commission Breakdown</h2>
        <h3>By Status</h3>
        <div class="metric">Pending: ₹${(data.commissionBreakdown.byStatus?.pending || 0).toLocaleString()}</div>
        <div class="metric">Paid: ₹${(data.commissionBreakdown.byStatus?.paid || 0).toLocaleString()}</div>
        <div class="metric">Failed: ₹${(data.commissionBreakdown.byStatus?.failed || 0).toLocaleString()}</div>
        
        ${data.commissionBreakdown.byMonth && data.commissionBreakdown.byMonth.length > 0 ? `
        <h3>Monthly Breakdown</h3>
        <table>
            <tr><th>Month</th><th>Amount</th><th>Count</th></tr>
            ${data.commissionBreakdown.byMonth.map(month => `
            <tr>
                <td>${month.month}</td>
                <td>₹${month.amount.toLocaleString()}</td>
                <td>${month.count}</td>
            </tr>
            `).join('')}
        </table>
        ` : ''}
    </div>
    ` : ''}
    
    ${data.commissionDetails && data.commissionDetails.length > 0 ? `
    <div class="section">
        <h2>Commission Details</h2>
        <table>
            <tr><th>Commission ID</th><th>Amount</th><th>Status</th><th>Date</th></tr>
            ${data.commissionDetails.slice(0, 50).map(commission => `
            <tr>
                <td>${commission.commissionId}</td>
                <td>₹${commission.amount.toLocaleString()}</td>
                <td>${commission.status}</td>
                <td>${new Date(commission.date).toLocaleDateString()}</td>
            </tr>
            `).join('')}
        </table>
    </div>
    ` : ''}
    `;
  };

  const generateReportCSV = (data) => {
    const reportType = data.reportType || 'team_summary';
    const reportData = data.reportData || {};
    
    let headers = ['Metric', 'Value', 'Category'];
    let rows = [];
    
    switch (reportType) {
      case 'team_summary':
        rows = [
          ['Leads Generated', reportData.individualMetrics?.leadsGenerated || 0, 'Individual'],
          ['Leads Converted', reportData.individualMetrics?.leadsConverted || 0, 'Individual'],
          ['Sales Closed', reportData.individualMetrics?.salesClosed || 0, 'Individual'],
          ['Revenue Generated', reportData.individualMetrics?.revenueGenerated || 0, 'Individual'],
          ['Team Size', reportData.teamMetrics?.teamSize || 0, 'Team'],
          ['Team Leads', reportData.teamMetrics?.teamLeads || 0, 'Team'],
          ['Team Sales', reportData.teamMetrics?.teamSales || 0, 'Team'],
          ['Team Revenue', reportData.teamMetrics?.teamRevenue || 0, 'Team'],
        ];
        
        if (reportData.summary) {
          rows.push(
            ['Total Revenue', reportData.summary.totalRevenue || 0, 'Summary'],
            ['Total Leads', reportData.summary.totalLeads || 0, 'Summary'],
            ['Total Sales', reportData.summary.totalSales || 0, 'Summary'],
            ['Overall Conversion Rate', reportData.summary.overallConversionRate?.toFixed(1) || 0, 'Summary']
          );
        }
        break;
        
      case 'performance_analysis':
        rows = [
          ['Leads Generated', reportData.performanceMetrics?.leadsGenerated || 0, 'Performance'],
          ['Leads Converted', reportData.performanceMetrics?.leadsConverted || 0, 'Performance'],
          ['Conversion Rate', (reportData.performanceMetrics?.conversionRate || 0).toFixed(1), 'Performance'],
          ['Sales Closed', reportData.performanceMetrics?.salesClosed || 0, 'Performance'],
          ['Revenue Generated', reportData.performanceMetrics?.revenueGenerated || 0, 'Performance'],
          ['Average Deal Size', reportData.performanceMetrics?.averageDealSize || 0, 'Performance'],
        ];
        
        if (reportData.growthAnalysis) {
          rows.push(
            ['Leads Growth %', reportData.growthAnalysis.leadsGrowth || 0, 'Growth'],
            ['Sales Growth %', reportData.growthAnalysis.salesGrowth || 0, 'Growth'],
            ['Conversion Growth %', reportData.growthAnalysis.conversionGrowth || 0, 'Growth'],
            ['Revenue Growth %', reportData.growthAnalysis.revenueGrowth || 0, 'Growth']
          );
        }
        
        if (reportData.trends) {
          rows.push(
            ['Lead Trend', reportData.trends.leadTrend || 'stable', 'Trends'],
            ['Sales Trend', reportData.trends.salesTrend || 'stable', 'Trends'],
            ['Conversion Trend', reportData.trends.conversionTrend || 'stable', 'Trends']
          );
        }
        break;
        
      case 'coach_activity':
        rows = [
          ['Tasks Completed', reportData.activityMetrics?.tasksCompleted || 0, 'Activity'],
          ['Tasks In Progress', reportData.activityMetrics?.tasksInProgress || 0, 'Activity'],
          ['Tasks Pending', reportData.activityMetrics?.tasksPending || 0, 'Activity'],
          ['Task Completion Rate', (reportData.activityMetrics?.taskCompletionRate || 0).toFixed(1), 'Activity'],
          ['Leads Contacted', reportData.activityMetrics?.leadsContacted || 0, 'Activity'],
          ['Leads Converted', reportData.activityMetrics?.leadsConverted || 0, 'Activity'],
          ['Lead Conversion Rate', (reportData.activityMetrics?.leadConversionRate || 0).toFixed(1), 'Activity'],
        ];
        
        if (reportData.productivity) {
          rows.push(
            ['Total Activities', reportData.productivity.totalActivities || 0, 'Productivity'],
            ['Overall Completion Rate', (reportData.productivity.completionRate || 0).toFixed(1), 'Productivity'],
            ['Average Tasks Per Day', (reportData.productivity.averageTasksPerDay || 0).toFixed(1), 'Productivity'],
            ['Average Leads Per Day', (reportData.productivity.averageLeadsPerDay || 0).toFixed(1), 'Productivity']
          );
        }
        break;
        
      case 'commission_report':
        rows = [
          ['Total Earned', reportData.commissionSummary?.totalEarned || 0, 'Commission'],
          ['Total Pending', reportData.commissionSummary?.totalPending || 0, 'Commission'],
          ['Total Paid', reportData.commissionSummary?.totalPaid || 0, 'Commission'],
          ['Average Commission', reportData.commissionSummary?.averageCommission || 0, 'Commission'],
          ['Commission Count', reportData.commissionSummary?.commissionCount || 0, 'Commission'],
        ];
        
        if (reportData.commissionBreakdown?.byStatus) {
          rows.push(
            ['Pending Commissions', reportData.commissionBreakdown.byStatus.pending || 0, 'Breakdown'],
            ['Paid Commissions', reportData.commissionBreakdown.byStatus.paid || 0, 'Breakdown'],
            ['Failed Commissions', reportData.commissionBreakdown.byStatus.failed || 0, 'Breakdown']
          );
        }
        break;
        
      default:
        rows = [
          ['Leads Generated', reportData.individualMetrics?.leadsGenerated || 0, 'Individual'],
          ['Leads Converted', reportData.individualMetrics?.leadsConverted || 0, 'Individual'],
          ['Sales Closed', reportData.individualMetrics?.salesClosed || 0, 'Individual'],
          ['Revenue Generated', reportData.individualMetrics?.revenueGenerated || 0, 'Individual'],
          ['Team Size', reportData.teamMetrics?.teamSize || 0, 'Team'],
          ['Team Leads', reportData.teamMetrics?.teamLeads || 0, 'Team'],
          ['Team Sales', reportData.teamMetrics?.teamSales || 0, 'Team'],
          ['Team Revenue', reportData.teamMetrics?.teamRevenue || 0, 'Team'],
        ];
    }

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadReport = async (report) => {
    try {
      const authData = effectiveAuth;
      if (!authData.token) {
        toast('Authentication required', 'error');
        return;
      }

      // Fetch full report data
      const response = await fetch(`${API_BASE_URL}/api/advanced-mlm/reports/detail/${report._id || report.reportId}`, {
        headers: getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        const reportData = data.success ? data.data : data;
        
        // Download as JSON
        const fileName = `report-${reportData.reportId || report.reportType || 'report'}-${new Date().toISOString().split('T')[0]}.json`;
        const jsonStr = JSON.stringify(reportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast('Report downloaded successfully', 'success');
      } else {
        throw new Error('Failed to download report');
      }
    } catch (error) {
      console.error('💥 downloadReport Error:', error);
      toast('Failed to download report', 'error');
    }
  };

  const downloadIndividualReport = async (report) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/advanced-mlm/reports/download/${report._id}`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${report.reportType}-${report._id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast('Report downloaded successfully', 'success');
      } else {
        // Fallback to JSON download if PDF not available
        const detailResponse = await fetch(`${API_BASE_URL}/api/advanced-mlm/reports/detail/${report._id}`, {
          headers: getHeaders()
        });
        
        if (detailResponse.ok) {
          const data = await detailResponse.json();
          const reportData = data.success ? data.data : data;
          const fileName = `report-${report.reportType}-${report._id}.json`;
          const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast('Report downloaded successfully', 'success');
        } else {
          throw new Error('Failed to download report');
        }
      }
    } catch (error) {
      console.error('💥 downloadIndividualReport Error:', error);
      toast('Failed to download report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (report) => {
    try {
      const authData = effectiveAuth;
      if (!authData.token) {
        toast('Authentication required', 'error');
        return;
      }

      // Show confirmation dialog
      const confirmed = window.confirm(`Are you sure you want to delete "${report.name || 'this report'}"? This action cannot be undone.`);
      
      if (!confirmed) {
        return;
      }

      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/advanced-mlm/reports/${report._id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (response.ok) {
        toast('Report deleted successfully', 'success');
        fetchReports(); // Refresh the reports list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete report');
      }
    } catch (error) {
      console.error('💥 deleteReport Error:', error);
      toast(error.message || 'Failed to delete report', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Commissions
  const fetchCommissions = async () => {
    console.log('🚀 fetchCommissions called!');
    const authData = effectiveAuth;
    console.log('🔐 Auth Data:', authData);
    console.log('👤 Current Coach ID:', authData.coachId);
    console.log('📝 Coach Name:', authData.name || authData.fullName || 'Unknown');
    
    if (!authData.coachId || !authData.token) {
      console.log('❌ Missing auth data - coachId:', authData.coachId, 'token:', authData.token ? 'exists' : 'missing');
      return;
    }
    
    setLoading(true);
    try {
      const apiUrl = `${API_BASE_URL}/api/advanced-mlm/commissions/${authData.coachId}`;
      console.log('🌐 API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: getHeaders()
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      console.log('📡 Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Raw API Response:', data);
        console.log('📊 Data success:', data.success);
        console.log('📊 Data exists:', !!data.data);
        
        if (data.success && data.data) {
          const commissions = data.data.commissions || [];
          const summary = data.data.summary || { totalEarned: 0, pendingAmount: 0, totalCommissions: 0 };
          
          console.log('💰 Commissions data:', commissions);
          console.log('📈 Summary data:', summary);
          console.log('💰 Commissions count:', commissions.length);
          
          setCommissions(commissions);
          setCommissionSummary(summary);
          
          console.log('✅ Commissions state updated successfully!');
        } else {
          console.log('⚠️ API returned success=false or no data');
        }
      } else {
        console.log('❌ API response not ok:', response.status);
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('💥 fetchCommissions Error:', error);
      toast('Failed to fetch commissions', 'error');
    } finally {
      setLoading(false);
      console.log('🏁 fetchCommissions finished');
    }
  };

  // Test Commissions Data - Debug Function
  const testCommissionsData = () => {
    console.log('🧪 Testing Commissions Data...');
    console.log('💰 Current commissions state:', commissions);
    console.log('📈 Current summary state:', commissionSummary);
    console.log('🔍 Loading state:', loading);
    
    // Check if we have any sample data to display
    if (commissions.length === 0) {
      console.log('⚠️ No commissions found. Adding sample data for testing...');
      const sampleCommissions = [
        {
          _id: 'sample_1',
          sourceName: 'Test Direct Commission',
          amount: 2500,
          date: new Date().toISOString(),
          type: 'direct',
          status: 'paid',
          level: 1
        },
        {
          _id: 'sample_2', 
          sourceName: 'Test Team Commission',
          amount: 1200,
          date: new Date().toISOString(),
          type: 'indirect',
          status: 'pending',
          level: 2
        }
      ];
      setCommissions(sampleCommissions);
      setCommissionSummary({
        totalEarned: 3700,
        pendingAmount: 1200,
        totalCommissions: 2
      });
      console.log('✅ Sample data added for testing!');
    }
  };

  // Fetch Admin Requests
  const fetchAdminRequests = async () => {
    console.log('🚀 fetchAdminRequests called!');
    const authData = effectiveAuth;
    console.log('🔐 Auth data:', authData);
    if (!authData.coachId || !authData.token) {
      console.error('❌ Missing authentication data:', authData);
      return;
    }
    
    console.log('🔍 Making request to:', `${API_BASE_URL}/api/coach-hierarchy/relevant-requests`);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/coach-hierarchy/relevant-requests`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 fetchAdminRequests Response:', data);
        console.log('🔍 Admin Requests Count:', data.success ? (data.data || []).length : 0);
        setAdminRequests(data.success ? (data.data || []) : []);
      } else {
        console.error('❌ fetchAdminRequests Failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('💥 fetchAdminRequests Error:', error);
      toast('Failed to fetch admin requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch current sponsor information
  const fetchCurrentSponsor = async () => {
    const authData = effectiveAuth;
    if (!authData.coachId || !authData.token) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/coach-hierarchy/details`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.sponsorId) {
          setCurrentSponsor(data.data.sponsorId);
        }
      }
    } catch (error) {
      console.error('💥 fetchCurrentSponsor Error:', error);
    }
  };

  // Search for sponsors
  const searchSponsors = async (query) => {
    if (!query || query.length < 3) {
      setSponsorSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/coach-hierarchy/search-sponsor?query=${encodeURIComponent(query)}`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Combine digital and external sponsors
          const allSponsors = [
            ...(data.data?.digitalSponsors || []).map(s => ({
              ...s,
              type: 'digital',
              displayId: s.selfCoachId
            })),
            ...(data.data?.externalSponsors || []).map(s => ({
              ...s,
              type: 'external',
              displayId: s.phone || s.email
            }))
          ];
          setSponsorSearchResults(allSponsors);
        }
      }
    } catch (error) {
      console.error('💥 searchSponsors Error:', error);
    }
  };

  // Submit admin request
  const submitAdminRequest = async () => {
    const authData = effectiveAuth;
    if (!authData.coachId || !authData.token) {
      toast('Authentication required', 'error');
      return;
    }

    if (!selectedSponsor || !requestForm.reason.trim()) {
      toast('Please select a sponsor and provide a reason', 'error');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        requestType: 'sponsor_change',
        requestedData: {
          sponsorId: selectedSponsor._id,
          sponsorName: selectedSponsor.name,
          sponsorType: selectedSponsor.type
        },
        reason: requestForm.reason
      };

      const response = await fetch(`${API_BASE_URL}/api/coach-hierarchy/admin-request`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast('Admin request submitted successfully', 'success');
          setShowAdminRequestForm(false);
          setSelectedSponsor(null);
          setRequestForm({ requestType: 'sponsor_change', requestedSponsorId: '', reason: '' });
          setSponsorSearchResults([]);
          fetchAdminRequests(); // Refresh the list
        } else {
          toast(data.message || 'Failed to submit request', 'error');
        }
      } else {
        toast('Failed to submit admin request', 'error');
      }
    } catch (error) {
      console.error('💥 submitAdminRequest Error:', error);
      toast('Failed to submit admin request', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Coach Performance
  const fetchCoachPerformance = async () => {
    const authData = effectiveAuth;
    if (!authData.coachId || !authData.token) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/advanced-mlm/coach-performance/${authData.coachId}`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setCoachPerformance(data.success ? data.data : data);
      }
    } catch (error) {
      console.error('💥 fetchCoachPerformance Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Sales Performance
  const fetchSalesPerformance = async () => {
    const authData = effectiveAuth;
    if (!authData.coachId || !authData.token) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/advanced-mlm/sales-performance/${authData.coachId}`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setSalesPerformance(data.success ? data.data : data);
      }
    } catch (error) {
      console.error('💥 fetchSalesPerformance Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Client Performance
  const fetchClientPerformance = async () => {
    const authData = effectiveAuth;
    if (!authData.coachId || !authData.token) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/advanced-mlm/client-performance/${authData.coachId}`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setClientPerformance(data.success ? data.data : data);
      }
    } catch (error) {
      console.error('💥 fetchClientPerformance Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Lead Performance
  const fetchLeadPerformance = async () => {
    const authData = effectiveAuth;
    if (!authData.coachId || !authData.token) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/advanced-mlm/lead-performance/${authData.coachId}`, {
        headers: getHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setLeadPerformance(data.success ? data.data : data);
      }
    } catch (error) {
      console.error('💥 fetchLeadPerformance Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCoach = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.password || !formData.selfCoachId) {
        toast('Please fill all required fields: name, email, password, and Coach ID', 'error');
        setLoading(false);
        return;
      }

      // Ensure sponsorId is set correctly
      const sponsorId = formData.sponsorId || effectiveAuth.coachId || user?.id;
      if (!sponsorId) {
        toast('Sponsor ID is missing. Please log in again.', 'error');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/advanced-mlm/downline`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          sponsorId: sponsorId,
          selfCoachId: formData.selfCoachId,
          currentLevel: formData.currentLevel || 1,
          bio: formData.bio,
          city: formData.city,
          country: formData.country,
          company: formData.company,
          experienceYears: formData.experienceYears,
          specializations: formData.specializations,
          isActive: formData.isActive,
          teamRankName: formData.teamRankName,
          presidentTeamRankName: formData.presidentTeamRankName
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast(data.message || 'Coach added successfully', 'success');
        onAddModalClose();
        resetForm();
        fetchDownline();
        fetchHierarchy(); // Refresh hierarchy when adding new coach
        fetchTeamPerformance();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add coach');
      }
    } catch (error) {
      console.error('💥 addCoach Error:', error);
      toast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateCoach = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!selectedCoach || !selectedCoach._id) {
      toast('Coach selection error', 'error');
      setLoading(false);
      return;
    }

    // Check if trying to update sponsorId and it's not the coach's own profile
    const isUpdatingSponsor = formData.sponsorId && formData.sponsorId !== selectedCoach.sponsorId;
    const isOwnProfile = effectiveAuth.coachId === selectedCoach._id;
    
    if (isUpdatingSponsor && !isOwnProfile) {
      // Use the downline sponsor update endpoint
      try {
        const response = await fetch(`${API_BASE_URL}/api/coach-hierarchy/update-downline-sponsor/${selectedCoach._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveAuth.token}`,
            'X-Coach-Id': effectiveAuth.coachId
          },
          body: JSON.stringify({
            sponsorId: formData.sponsorId,
            reason: `Sponsor change requested for ${selectedCoach.name} (${selectedCoach.email})`
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Sponsor change request submitted:', data);
          toast('Sponsor change request submitted for admin approval', 'success');
          onEditModalClose();
          fetchHierarchy(); // Refresh the data
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to submit sponsor change request');
        }
      } catch (error) {
        console.error('💥 Sponsor change request Error:', error);
        toast(error.message, 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Prepare update data - include all fields except sponsorId for downline updates
    const updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      country: formData.country,
      selfCoachId: formData.selfCoachId,
      currentLevel: formData.currentLevel,
      isActive: formData.isActive,
      bio: formData.bio,
      teamRankName: formData.teamRankName,
      presidentTeamRankName: formData.presidentTeamRankName,
      company: formData.company,
      experienceYears: formData.experienceYears,
      specializations: formData.specializations ? formData.specializations.split(',').map(s => s.trim()).filter(s => s) : []
    };

    // Only include sponsorId if updating own profile
    if (isOwnProfile && formData.sponsorId) {
      updateData.sponsorId = formData.sponsorId;
    }

    // Only include password if it's provided
    if (formData.password && formData.password.trim()) {
      updateData.password = formData.password;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/coach-hierarchy/update-coach/${selectedCoach._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveAuth.token}`,
          'X-Coach-Id': effectiveAuth.coachId
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Coach updated:', data);
        toast('Coach profile updated successfully', 'success');
        onEditModalClose();
        fetchHierarchy(); // Refresh the data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update coach');
      }
    } catch (error) {
      console.error('💥 updateCoach Error:', error);
      toast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (e) => {
    e.preventDefault();
    
    const authData = effectiveAuth;
    if (!authData.coachId || !authData.token) {
      toast('Authentication required', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/advanced-mlm/generate-report`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          sponsorId: authData.coachId,
          ...reportConfig
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Report generation started:', data);
        toast('Report generation started', 'success');
        onReportModalClose();
        fetchReports();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('💥 generateReport Error:', error);
      toast(error.message || 'Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      sponsorId: effectiveAuth.coachId || user?.id || '',
      selfCoachId: '',
      currentLevel: 1,
      bio: '',
      city: '',
      country: '',
      company: '',
      experienceYears: 0,
      specializations: '',
      isActive: true,
      teamRankName: '',
      presidentTeamRankName: ''
    });
  };

  const openEditModal = (coach) => {
    setSelectedCoach(coach);
    setFormData({
      name: coach.name || '',
      email: coach.email || '',
      password: '',
      phone: coach.phone || '',
      sponsorId: coach.sponsorId || effectiveAuth.coachId || user?.id || '',
      selfCoachId: coach.selfCoachId || '',
      currentLevel: coach.currentLevel || 1,
      bio: coach.bio || '',
      city: coach.city || '',
      country: coach.country || '',
      company: coach.company || '',
      experienceYears: coach.portfolio?.experienceYears || 0,
      specializations: coach.portfolio?.specializations?.map(s => s.name).join(', ') || '',
      isActive: coach.isActive !== undefined ? coach.isActive : true,
      teamRankName: coach.teamRankName || '',
      presidentTeamRankName: coach.presidentTeamRankName || ''
    });
    onEditModalOpen();
  };

  const openViewModal = (coach) => {
    setSelectedCoach(coach);
    onViewModalOpen();
  };

  const openDeleteModal = (coach) => {
    setSelectedCoach(coach);
    onDeleteModalOpen();
  };

  const handleSelectCoach = (coachId) => {
    setSelectedCoaches(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(coachId)) {
        newSelected.delete(coachId);
      } else {
        newSelected.add(coachId);
      }
      return newSelected;
    });
  };

  const handleSelectAllCoaches = (isChecked, coaches) => {
    setSelectedCoaches(isChecked ? new Set(coaches.map(coach => coach._id)) : new Set());
  };

  // Memoized filtered data
  const filteredDownlineData = useMemo(() => {
    if (!Array.isArray(downlineData)) return [];
    
    let filtered = [...downlineData];
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(coach => 
        coach.name?.toLowerCase().includes(searchLower) ||
        coach.email?.toLowerCase().includes(searchLower) ||
        coach.city?.toLowerCase().includes(searchLower) ||
        coach.country?.toLowerCase().includes(searchLower)
      );
    }
    
    // Performance filter
    if (performanceFilter !== 'all') {
      filtered = filtered.filter(coach => {
        switch (performanceFilter) {
          case 'active': return coach.isActive;
          case 'inactive': return !coach.isActive;
          case 'top': return coach.performance?.performanceScore >= 80;
          default: return true;
        }
      });
    }
    
    return filtered;
  }, [downlineData, searchTerm, performanceFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    // Use team performance data if available and valid, otherwise fallback to hierarchy data
    const totalTeam = teamPerformance?.totalTeamSize || hierarchyStats?.totalMembers || filteredDownlineData.length;
    const activeCoaches = teamPerformance?.activeCoaches || hierarchyStats?.activeMembers || filteredDownlineData.filter(c => c.isActive).length;
    const totalRevenue = teamPerformance?.totalRevenue || 0;
    const avgPerformance = teamPerformance?.averagePerformanceScore || 0;
    
    const calculatedStats = { totalTeam, activeCoaches, totalRevenue, avgPerformance };
    
    return calculatedStats;
  }, [teamPerformance, filteredDownlineData, hierarchyStats]);

  // Load data on component mount - only fetch hierarchy levels
  useEffect(() => {
    fetchHierarchyLevels();
  }, []);

  // Load data based on active tab - only once when tab changes
  useEffect(() => {
    console.log('🔄 Tab switching - activeTab:', activeTab);
    console.log('🔄 Performance sub-tab:', performanceSubTab);
    
    switch (activeTab) {
      case 0: // Hierarchy
        if (!hierarchyData) {
          console.log('🌳 Calling fetchHierarchy()');
          fetchHierarchy();
        }
        break;
      case 1: // Direct Coaches
        if (!fetchingRef.current.downline && downlineData.length === 0) {
          console.log('👥 Calling fetchDownline()');
          fetchDownline();
        }
        break;
      case 2: // Performance
        if (!fetchingRef.current.teamPerformance && !teamPerformance) {
          console.log('📊 Calling fetchTeamPerformance()');
          fetchTeamPerformance();
        }
        // Load sub-tab data based on performanceSubTab
        if (performanceSubTab === 0 && !coachPerformance) {
          fetchCoachPerformance();
        } else if (performanceSubTab === 1 && !salesPerformance) {
          fetchSalesPerformance();
        } else if (performanceSubTab === 2 && !clientPerformance) {
          fetchClientPerformance();
        } else if (performanceSubTab === 3 && !leadPerformance) {
          fetchLeadPerformance();
        }
        break;
      case 3: // Real Commissions
        console.log('🔄 Tab 3: Real Commissions - checking if fetchCommissions needed');
        if (commissions.length === 0) {
          console.log('💰 Calling fetchCommissions()');
          fetchCommissions();
        }
        break;
      case 4: // Real Reports
        if (!fetchingRef.current.reports && reports.length === 0) {
          console.log('📊 Calling fetchReports()');
          fetchReports();
        }
        break;
      case 5: // Admin Requests
        console.log(`🔄 Tab 5: Admin Requests - checking if fetchAdminRequests needed`);
        console.log('🔢 Current adminRequests length:', adminRequests.length);
        // CLEAR STATE AND FORCE CALL: Always call fetchAdminRequests when Admin Requests tab is selected
        setAdminRequests([]); // Clear existing data
        console.log('📋 FORCE CALLING fetchAdminRequests()');
        fetchAdminRequests();
        if (!currentSponsor) {
          console.log('👤 Calling fetchCurrentSponsor()');
          fetchCurrentSponsor();
        }
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, performanceSubTab]); // Only depend on activeTab and performanceSubTab

  // Auto-refresh performance data every 30 seconds when on performance tab
  useEffect(() => {
    let intervalId = null;
    
    if (activeTab === 2) { // Performance tab
      // Set up interval to refresh performance data
      intervalId = setInterval(() => {
        console.log('🔄 Auto-refreshing performance data...');
        fetchTeamPerformance();
      }, 30000); // 30 seconds
    }
    
    // Cleanup interval when tab changes or component unmounts
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeTab]); // Only depend on activeTab

  // Conditional rendering for loading
  if (loading && !downlineData.length && !hierarchyData && !teamPerformance) {
    return <BeautifulSkeleton />;
  }

  // Render report content based on report type
  const renderReportContent = (report) => {
    const reportType = report?.reportType || 'team_summary';
    const data = report?.reportData || {};

    switch (reportType) {
      case 'team_summary':
        return renderTeamSummaryReport(data);
      case 'performance_analysis':
        return renderPerformanceAnalysisReport(data);
      case 'coach_activity':
        return renderCoachActivityReport(data);
      case 'commission_report':
        return renderCommissionReport(data);
      default:
        return renderTeamSummaryReport(data);
    }
  };

  // Render team summary report
  const renderTeamSummaryReport = (data) => {
    return (
      <VStack spacing={6}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
          <VStack align="start" spacing={3}>
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Leads Generated</Text>
              <HStack spacing={2} align="baseline">
                <Text fontSize="3xl" fontWeight="800" color="blue.600" lineHeight="1">{data?.individualMetrics?.leadsGenerated || 0}</Text>
                <Box w="1.5" h="1.5" bg="blue.500" borderRadius="full" />
              </HStack>
              <Text fontSize="xs" color="gray.600">Target based performance</Text>
            </Box>
          </VStack>
          <VStack align="start" spacing={3}>
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Conversions</Text>
              <HStack spacing={2} align="baseline">
                <Text fontSize="3xl" fontWeight="800" color="green.600" lineHeight="1">{data?.individualMetrics?.leadsConverted || 0}</Text>
                <Box w="1.5" h="1.5" bg="green.500" borderRadius="full" />
              </HStack>
              <Text fontSize="xs" color="gray.600">Success rate metrics</Text>
            </Box>
          </VStack>
          <VStack align="start" spacing={3}>
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Sales Closed</Text>
              <HStack spacing={2} align="baseline">
                <Text fontSize="3xl" fontWeight="800" color="purple.600" lineHeight="1">{data?.individualMetrics?.salesClosed || 0}</Text>
                <Box w="1.5" h="1.5" bg="purple.500" borderRadius="full" />
              </HStack>
              <Text fontSize="xs" color="gray.600">Revenue generation</Text>
            </Box>
          </VStack>
          <VStack align="start" spacing={3}>
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Revenue</Text>
              <HStack spacing={2} align="baseline">
                <Text fontSize="3xl" fontWeight="800" color="orange.600" lineHeight="1">₹{(data?.individualMetrics?.revenueGenerated || 0).toLocaleString()}</Text>
                <Box w="1.5" h="1.5" bg="orange.500" borderRadius="full" />
              </HStack>
              <Text fontSize="xs" color="gray.600">Total income generated</Text>
            </Box>
          </VStack>
        </SimpleGrid>
      </VStack>
    );
  };

  // Render performance analysis report
  const renderPerformanceAnalysisReport = (data) => {
    return (
      <VStack spacing={6}>
        {/* Performance Metrics */}
        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={8}>
          <VStack align="start" spacing={3}>
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Leads Generated</Text>
              <HStack spacing={2} align="baseline">
                <Text fontSize="3xl" fontWeight="800" color="blue.600" lineHeight="1">{data?.performanceMetrics?.leadsGenerated || 0}</Text>
                <Box w="1.5" h="1.5" bg="blue.500" borderRadius="full" />
              </HStack>
              <Text fontSize="xs" color="gray.600">Total leads in period</Text>
            </Box>
          </VStack>
          <VStack align="start" spacing={3}>
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Conversion Rate</Text>
              <HStack spacing={2} align="baseline">
                <Text fontSize="3xl" fontWeight="800" color="green.600" lineHeight="1">{(data?.performanceMetrics?.conversionRate || 0).toFixed(1)}%</Text>
                <Box w="1.5" h="1.5" bg="green.500" borderRadius="full" />
              </HStack>
              <Text fontSize="xs" color="gray.600">Lead to customer rate</Text>
            </Box>
          </VStack>
          <VStack align="start" spacing={3}>
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Revenue Generated</Text>
              <HStack spacing={2} align="baseline">
                <Text fontSize="3xl" fontWeight="800" color="orange.600" lineHeight="1">₹{(data?.performanceMetrics?.revenueGenerated || 0).toLocaleString()}</Text>
                <Box w="1.5" h="1.5" bg="orange.500" borderRadius="full" />
              </HStack>
              <Text fontSize="xs" color="gray.600">Total revenue</Text>
            </Box>
          </VStack>
        </SimpleGrid>

        {/* Growth Analysis */}
        {data?.growthAnalysis && (
          <Card bg="blue.50" border="1px" borderColor="blue.200" borderRadius="8px">
            <CardBody py={4}>
              <Heading size="sm" color="blue.800" mb={4}>Growth Analysis</Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                <VStack align="start">
                  <Text fontSize="sm" color="gray.600" fontWeight="600">Leads Growth</Text>
                  <HStack>
                    <Text fontSize="lg" fontWeight="700" color={data.growthAnalysis.leadsGrowth >= 0 ? 'green.600' : 'red.600'}>
                      {data.growthAnalysis.leadsGrowth >= 0 ? '+' : ''}{data.growthAnalysis.leadsGrowth?.toFixed(1) || 0}%
                    </Text>
                    <Box as={data.growthAnalysis.leadsGrowth >= 0 ? FiTrendingUp : FiTrendingDown} 
                         color={data.growthAnalysis.leadsGrowth >= 0 ? 'green.500' : 'red.500'} />
                  </HStack>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" color="gray.600" fontWeight="600">Sales Growth</Text>
                  <HStack>
                    <Text fontSize="lg" fontWeight="700" color={data.growthAnalysis.salesGrowth >= 0 ? 'green.600' : 'red.600'}>
                      {data.growthAnalysis.salesGrowth >= 0 ? '+' : ''}{data.growthAnalysis.salesGrowth?.toFixed(1) || 0}%
                    </Text>
                    <Box as={data.growthAnalysis.salesGrowth >= 0 ? FiTrendingUp : FiTrendingDown} 
                         color={data.growthAnalysis.salesGrowth >= 0 ? 'green.500' : 'red.500'} />
                  </HStack>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" color="gray.600" fontWeight="600">Conversion Growth</Text>
                  <HStack>
                    <Text fontSize="lg" fontWeight="700" color={data.growthAnalysis.conversionGrowth >= 0 ? 'green.600' : 'red.600'}>
                      {data.growthAnalysis.conversionGrowth >= 0 ? '+' : ''}{data.growthAnalysis.conversionGrowth?.toFixed(1) || 0}%
                    </Text>
                    <Box as={data.growthAnalysis.conversionGrowth >= 0 ? FiTrendingUp : FiTrendingDown} 
                         color={data.growthAnalysis.conversionGrowth >= 0 ? 'green.500' : 'red.500'} />
                  </HStack>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" color="gray.600" fontWeight="600">Revenue Growth</Text>
                  <HStack>
                    <Text fontSize="lg" fontWeight="700" color={data.growthAnalysis.revenueGrowth >= 0 ? 'green.600' : 'red.600'}>
                      {data.growthAnalysis.revenueGrowth >= 0 ? '+' : ''}{data.growthAnalysis.revenueGrowth?.toFixed(1) || 0}%
                    </Text>
                    <Box as={data.growthAnalysis.revenueGrowth >= 0 ? FiTrendingUp : FiTrendingDown} 
                         color={data.growthAnalysis.revenueGrowth >= 0 ? 'green.500' : 'red.500'} />
                  </HStack>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}

        {/* Trends */}
        {data?.trends && (
          <Card bg="purple.50" border="1px" borderColor="purple.200" borderRadius="8px">
            <CardBody py={4}>
              <Heading size="sm" color="purple.800" mb={4}>Performance Trends</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Lead Trend</Text>
                  <Badge colorScheme={data.trends.leadTrend === 'increasing' ? 'green' : data.trends.leadTrend === 'decreasing' ? 'red' : 'gray'}>
                    {data.trends.leadTrend || 'stable'}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Sales Trend</Text>
                  <Badge colorScheme={data.trends.salesTrend === 'increasing' ? 'green' : data.trends.salesTrend === 'decreasing' ? 'red' : 'gray'}>
                    {data.trends.salesTrend || 'stable'}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">Conversion Trend</Text>
                  <Badge colorScheme={data.trends.conversionTrend === 'improving' ? 'green' : data.trends.conversionTrend === 'declining' ? 'red' : 'gray'}>
                    {data.trends.conversionTrend || 'stable'}
                  </Badge>
                </HStack>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}

        {/* Insights */}
        {data?.insights && data.insights.length > 0 && (
          <Card bg="yellow.50" border="1px" borderColor="yellow.200" borderRadius="8px">
            <CardBody py={4}>
              <Heading size="sm" color="yellow.800" mb={4}>Performance Insights</Heading>
              <VStack spacing={3} align="start">
                {data.insights.map((insight, index) => (
                  <Box key={index} p={3} bg="white" borderRadius="6px" border="1px" borderColor="yellow.100">
                    <HStack mb={2}>
                      <Badge colorScheme={insight.type === 'positive' ? 'green' : insight.type === 'warning' ? 'orange' : 'blue'}>
                        {insight.type}
                      </Badge>
                      <Text fontSize="sm" fontWeight="600" color="gray.800">{insight.title}</Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.600" mb={2}>{insight.description}</Text>
                    <Text fontSize="xs" color="blue.600" fontStyle="italic">{insight.recommendation}</Text>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    );
  };

  // Render coach activity report
  const renderCoachActivityReport = (data) => {
    return (
      <VStack spacing={6}>
        {/* Activity Metrics */}
        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={8}>
          <VStack align="start" spacing={3}>
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Tasks Completed</Text>
              <HStack spacing={2} align="baseline">
                <Text fontSize="3xl" fontWeight="800" color="blue.600" lineHeight="1">{data?.activityMetrics?.tasksCompleted || 0}</Text>
                <Box w="1.5" h="1.5" bg="blue.500" borderRadius="full" />
              </HStack>
              <Text fontSize="xs" color="gray.600">Finished tasks</Text>
            </Box>
          </VStack>
          <VStack align="start" spacing={3}>
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Leads Contacted</Text>
              <HStack spacing={2} align="baseline">
                <Text fontSize="3xl" fontWeight="800" color="green.600" lineHeight="1">{data?.activityMetrics?.leadsContacted || 0}</Text>
                <Box w="1.5" h="1.5" bg="green.500" borderRadius="full" />
              </HStack>
              <Text fontSize="xs" color="gray.600">Total leads worked</Text>
            </Box>
          </VStack>
          <VStack align="start" spacing={3}>
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Completion Rate</Text>
              <HStack spacing={2} align="baseline">
                <Text fontSize="3xl" fontWeight="800" color="purple.600" lineHeight="1">{(data?.activityMetrics?.taskCompletionRate || 0).toFixed(1)}%</Text>
                <Box w="1.5" h="1.5" bg="purple.500" borderRadius="full" />
              </HStack>
              <Text fontSize="xs" color="gray.600">Task success rate</Text>
            </Box>
          </VStack>
        </SimpleGrid>

        {/* Productivity */}
        {data?.productivity && (
          <Card bg="green.50" border="1px" borderColor="green.200" borderRadius="8px">
            <CardBody py={4}>
              <Heading size="sm" color="green.800" mb={4}>Productivity Metrics</Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                <VStack align="start">
                  <Text fontSize="sm" color="gray.600" fontWeight="600">Total Activities</Text>
                  <Text fontSize="xl" fontWeight="700" color="gray.800">{data.productivity.totalActivities || 0}</Text>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" color="gray.600" fontWeight="600">Overall Completion</Text>
                  <Text fontSize="xl" fontWeight="700" color="green.600">{(data.productivity.completionRate || 0).toFixed(1)}%</Text>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" color="gray.600" fontWeight="600">Avg Tasks/Day</Text>
                  <Text fontSize="xl" fontWeight="700" color="blue.600">{(data.productivity.averageTasksPerDay || 0).toFixed(1)}</Text>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" color="gray.600" fontWeight="600">Avg Leads/Day</Text>
                  <Text fontSize="xl" fontWeight="700" color="purple.600">{(data.productivity.averageLeadsPerDay || 0).toFixed(1)}</Text>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}

        {/* Recent Activities */}
        {data?.recentActivities && data.recentActivities.length > 0 && (
          <Card bg="orange.50" border="1px" borderColor="orange.200" borderRadius="8px">
            <CardBody py={4}>
              <Heading size="sm" color="orange.800" mb={4}>Recent Activities</Heading>
              <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
                {data.recentActivities.slice(0, 10).map((activity, index) => (
                  <HStack key={index} justify="space-between" p={2} bg="white" borderRadius="4px">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="600" color="gray.800">
                        {activity.type === 'lead' ? 'Lead Activity' : 'Task Activity'}
                      </Text>
                      <Text fontSize="xs" color="gray.600">{activity.status}</Text>
                    </VStack>
                    <VStack align="end" spacing={0}>
                      <Text fontSize="sm" color="gray.800">
                        {activity.value ? `₹${activity.value.toLocaleString()}` : '-'}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(activity.date).toLocaleDateString()}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    );
  };

  // Render commission report
  const renderCommissionReport = (data) => {
    return (
      <VStack spacing={6}>
        {/* Commission Summary */}
        {data?.commissionSummary && (
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
            <VStack align="start" spacing={3}>
              <Box>
                <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Total Earned</Text>
                <HStack spacing={2} align="baseline">
                  <Text fontSize="3xl" fontWeight="800" color="green.600" lineHeight="1">₹{(data.commissionSummary.totalEarned || 0).toLocaleString()}</Text>
                  <Box w="1.5" h="1.5" bg="green.500" borderRadius="full" />
                </HStack>
                <Text fontSize="xs" color="gray.600">Total commissions</Text>
              </Box>
            </VStack>
            <VStack align="start" spacing={3}>
              <Box>
                <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Pending</Text>
                <HStack spacing={2} align="baseline">
                  <Text fontSize="3xl" fontWeight="800" color="orange.600" lineHeight="1">₹{(data.commissionSummary.totalPending || 0).toLocaleString()}</Text>
                  <Box w="1.5" h="1.5" bg="orange.500" borderRadius="full" />
                </HStack>
                <Text fontSize="xs" color="gray.600">Awaiting payment</Text>
              </Box>
            </VStack>
            <VStack align="start" spacing={3}>
              <Box>
                <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Paid</Text>
                <HStack spacing={2} align="baseline">
                  <Text fontSize="3xl" fontWeight="800" color="blue.600" lineHeight="1">₹{(data.commissionSummary.totalPaid || 0).toLocaleString()}</Text>
                  <Box w="1.5" h="1.5" bg="blue.500" borderRadius="full" />
                </HStack>
                <Text fontSize="xs" color="gray.600">Received payments</Text>
              </Box>
            </VStack>
            <VStack align="start" spacing={3}>
              <Box>
                <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Average</Text>
                <HStack spacing={2} align="baseline">
                  <Text fontSize="3xl" fontWeight="800" color="purple.600" lineHeight="1">₹{(data.commissionSummary.averageCommission || 0).toLocaleString()}</Text>
                  <Box w="1.5" h="1.5" bg="purple.500" borderRadius="full" />
                </HStack>
                <Text fontSize="xs" color="gray.600">Per commission</Text>
              </Box>
            </VStack>
          </SimpleGrid>
        )}

        {/* Commission Breakdown */}
        {data?.commissionBreakdown && (
          <Card bg="blue.50" border="1px" borderColor="blue.200" borderRadius="8px">
            <CardBody py={4}>
              <Heading size="sm" color="blue.800" mb={4}>Commission Breakdown</Heading>
              <VStack spacing={4}>
                {/* By Status */}
                <Box>
                  <Text fontSize="sm" fontWeight="600" color="gray.700" mb={2}>By Status</Text>
                  <SimpleGrid columns={{ base: 3 }} spacing={4}>
                    <VStack align="start">
                      <Text fontSize="xs" color="gray.600">Pending</Text>
                      <Text fontSize="lg" fontWeight="700" color="orange.600">₹{(data.commissionBreakdown.byStatus.pending || 0).toLocaleString()}</Text>
                    </VStack>
                    <VStack align="start">
                      <Text fontSize="xs" color="gray.600">Paid</Text>
                      <Text fontSize="lg" fontWeight="700" color="green.600">₹{(data.commissionBreakdown.byStatus.paid || 0).toLocaleString()}</Text>
                    </VStack>
                    <VStack align="start">
                      <Text fontSize="xs" color="gray.600">Failed</Text>
                      <Text fontSize="lg" fontWeight="700" color="red.600">₹{(data.commissionBreakdown.byStatus.failed || 0).toLocaleString()}</Text>
                    </VStack>
                  </SimpleGrid>
                </Box>

                {/* By Month */}
                {data.commissionBreakdown.byMonth && data.commissionBreakdown.byMonth.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="gray.700" mb={2}>Monthly Breakdown</Text>
                    <VStack spacing={2} maxH="200px" overflowY="auto">
                      {data.commissionBreakdown.byMonth.map((month, index) => (
                        <HStack key={index} justify="space-between" p={2} bg="white" borderRadius="4px">
                          <Text fontSize="sm" color="gray.800">{month.month}</Text>
                          <VStack align="end" spacing={0}>
                            <Text fontSize="sm" fontWeight="600" color="gray.800">₹{month.amount.toLocaleString()}</Text>
                            <Text fontSize="xs" color="gray.500">{month.count} commissions</Text>
                          </VStack>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Commission Details */}
        {data?.commissionDetails && data.commissionDetails.length > 0 && (
          <Card bg="gray.50" border="1px" borderColor="gray.200" borderRadius="8px">
            <CardBody py={4}>
              <Heading size="sm" color="gray.800" mb={4}>Recent Commissions</Heading>
              <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
                {data.commissionDetails.slice(0, 15).map((commission, index) => (
                  <HStack key={index} justify="space-between" p={2} bg="white" borderRadius="4px">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="600" color="gray.800">{commission.commissionId}</Text>
                      <Text fontSize="xs" color="gray.600">{commission.month}/{commission.year}</Text>
                    </VStack>
                    <VStack align="end" spacing={0}>
                      <Text fontSize="sm" fontWeight="600" color="gray.800">₹{commission.amount.toLocaleString()}</Text>
                      <Badge size="sm" colorScheme={commission.status === 'paid' ? 'green' : commission.status === 'pending' ? 'orange' : 'red'}>
                        {commission.status}
                      </Badge>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    );
  };

  return (
    <Box bg="gray.50" minH="100vh" py={6} px={6}>
      <Box maxW="full" mx="auto">
        <VStack spacing={6} align="stretch" w="full">
          {/* Minimalist Header */}
          <Card 
            bg="rgba(255, 255, 255, 0.9)" 
            backdropFilter="blur(20px)" 
            borderRadius="7px" 
            border="1px solid" 
            borderColor="rgba(0, 0, 0, 0.08)"
            boxShadow="sm"
          >
            {/* Header with Title and Actions */}
            <CardHeader py={4} px={6} borderBottom="1px" borderColor="gray.100">
              <Flex justify="space-between" align="center">
                <Heading fontSize="2xl" fontWeight="700" color={textColor} letterSpacing="-0.5px">
                  Coach Network
                </Heading>
                <HStack spacing={2}>
                  <IconButton
                    icon={<RepeatIcon />}
                    variant="ghost"
                    size="sm"
                    borderRadius="7px"
                    onClick={() => {
                      switch (activeTab) {
                        case 0: fetchHierarchy(); break;
                        case 1: fetchDownline(); break;
                        case 2: fetchTeamPerformance(); break;
                        case 3: fetchCommissions(); break;
                        case 4: fetchReports(); break;
                        case 5: fetchAdminRequests(); break;
                      }
                    }}
                    _hover={{ bg: 'gray.100' }}
                    color="gray.600"
                    isLoading={loading}
                    aria-label="Refresh"
                  />
                  <Button
                    leftIcon={<AddIcon />}
                    bg="blue.500"
                    color="white"
                    size="sm"
                    onClick={onAddModalOpen}
                    borderRadius="7px"
                    _hover={{ bg: 'blue.600' }}
                  >
                    Add Coach
                  </Button>
                </HStack>
              </Flex>
            </CardHeader>
            <CardBody px={6} py={4}>
                
                {/* Stats Cards - Minimalist Design */}
                <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                  <StatsCard
                    title="Total Team Size"
                    value={stats.totalTeam}
                    icon={<Box as={FiUsers} size="20px" />}
                    color="blue"
                    isLoading={loading}
                    trend="All levels"
                  />
                  <StatsCard
                    title="Active Coaches"
                    value={stats.activeCoaches}
                    icon={<CheckCircleIcon />}
                    color="green"
                    isLoading={loading}
                    trend="Qualified"
                  />
                  <StatsCard
                    title="Team Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={<Box as={FiTrendingUp} size="20px" />}
                    color="purple"
                    isLoading={loading}
                    trend="Total generated"
                  />
                  <StatsCard
                    title="Avg Performance"
                    value={`${stats.avgPerformance}%`}
                    icon={<Box as={FiTarget} size="20px" />}
                    color="orange"
                    isLoading={loading}
                    trend="Overall score"
                  />
                </SimpleGrid>
            </CardBody>
          </Card>

          {/* Bulk Actions Toolbar */}
          {selectedCoaches.size > 0 && activeTab === 1 && (
            <Card bg="blue.50" border="1px solid" borderColor="blue.200" borderRadius="7px" shadow="md">
              <CardBody py={4}>
                <HStack justify="space-between" align="center">
                  <HStack spacing={3} align="center">
                    <Box
                      w="8px"
                      h="8px"
                      bg="blue.500"
                      borderRadius="7px"
                      animation="pulse 2s infinite"
                    />
                    <Text fontWeight="semibold" color="blue.700" fontSize="md">
                      {selectedCoaches.size} coaches selected
                    </Text>
                    <Badge colorScheme="blue" variant="subtle" borderRadius="full">
                      Bulk Actions Available
                    </Badge>
                  </HStack>
                  
                  <ButtonGroup size="md" spacing={3}>
                    <Button 
                      leftIcon={<DownloadIcon />} 
                      colorScheme="blue"
                      variant="outline"
                      _hover={{ 
                        transform: 'translateY(-1px)', 
                        shadow: 'md',
                        bg: 'blue.50'
                      }}
                      transition="all 0.2s"
                      borderRadius="7px"
                    >
                      Export Selected
                    </Button>
                    <Button 
                      leftIcon={<DeleteIcon />} 
                      colorScheme="red"
                      variant="outline"
                      _hover={{ 
                        transform: 'translateY(-1px)', 
                        shadow: 'md',
                        bg: 'red.50'
                      }}
                      transition="all 0.2s"
                      borderRadius="7px"
                    >
                      Delete Selected
                    </Button>
                  </ButtonGroup>
                </HStack>
              </CardBody>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Card 
            bg="rgba(255, 255, 255, 0.9)" 
            backdropFilter="blur(20px)" 
            borderRadius="7px" 
            border="1px solid" 
            borderColor="rgba(0, 0, 0, 0.08)"
            boxShadow="sm"
          >
            <Tabs index={activeTab} onChange={setActiveTab} colorScheme="blue">
              <TabList borderBottom="1px" borderColor="gray.200" px={6} pt={4}>
                <Tab 
                  _selected={{ 
                    color: 'blue.600', 
                    borderBottom: '2px solid',
                    borderColor: 'blue.600',
                  }}
                  fontWeight="500"
                  fontSize="sm"
                  px={4}
                  py={3}
                  color="gray.600"
                  _hover={{ color: 'gray.900' }}
                >
                  Hierarchy
                </Tab>
                <Tab 
                  _selected={{ 
                    color: 'blue.600', 
                    borderBottom: '2px solid',
                    borderColor: 'blue.600',
                  }}
                  fontWeight="500"
                  fontSize="sm"
                  px={4}
                  py={3}
                  color="gray.600"
                  _hover={{ color: 'gray.900' }}
                >
                  Direct Coaches
                </Tab>
                <Tab 
                  _selected={{ 
                    color: 'blue.600', 
                    borderBottom: '2px solid',
                    borderColor: 'blue.600',
                  }}
                  fontWeight="500"
                  fontSize="sm"
                  px={4}
                  py={3}
                  color="gray.600"
                  _hover={{ color: 'gray.900' }}
                >
                  Performance
                </Tab>

     
                <Tab 
                  _selected={{ 
                    color: 'blue.600', 
                    borderBottom: '2px solid',
                    borderColor: 'blue.600',
                  }}
                  fontWeight="500"
                  fontSize="sm"
                  px={4}
                  py={3}
                  color="gray.600"
                  _hover={{ color: 'gray.900' }}
                >
                  Real Commissions
                </Tab>
     
                <Tab 
                  _selected={{ 
                    color: 'blue.600', 
                    borderBottom: '2px solid',
                    borderColor: 'blue.600',
                  }}
                  fontWeight="500"
                  fontSize="sm"
                  px={4}
                  py={3}
                  color="gray.600"
                  _hover={{ color: 'gray.900' }}
                >
                  Real Reports
                </Tab>

                <Tab 
                  _selected={{ 
                    color: 'blue.600', 
                    borderBottom: '2px solid',
                    borderColor: 'blue.600',
                  }}
                  fontWeight="500"
                  fontSize="sm"
                  px={4}
                  py={3}
                  color="gray.600"
                  _hover={{ color: 'gray.900' }}
                >
                  Admin Requests
                </Tab>



              </TabList>




              <TabPanels>
                {/* Hierarchy Tab - Professional Team Structure */}
                <TabPanel p={0}>
                  <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh" py={8} px={6}>
                    <Box maxW="full" mx="auto">
                      {/* Header Section */}
                      <Flex justify="space-between" align="center" mb={8}>
                        <VStack align="start" spacing={2}>
                          <Heading fontSize="2xl" fontWeight="700" color={useColorModeValue('gray.800', 'gray.100')} letterSpacing="-0.5px">
                            👥 Team Structure
                          </Heading>
                          <Text fontSize="md" color={useColorModeValue('gray.600', 'gray.400')}>
                            Manage your MLM network hierarchy and team relationships
                          </Text>
                        </VStack>
                        
                        <HStack spacing={3}>
                          <Button 
                            leftIcon={<AddIcon />}
                            colorScheme="blue"
                            onClick={onAddModalOpen}
                            borderRadius="10px"
                            fontWeight="600"
                            size="md"
                            px={6}
                            _hover={{
                              transform: 'translateY(-2px)',
                              boxShadow: 'lg'
                            }}
                            transition="all 0.2s"
                          >
                            Add Member
                          </Button>
                        </HStack>
                      </Flex>

                      {/* Stats Cards */}
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
                        <StatsCard 
                          title="TOTAL TEAM" 
                          value={hierarchyData?.downlineHierarchy?.length || hierarchyData?.downline?.length || 0} 
                          icon={<FiUsers size="24px" />} 
                          color="blue"
                          trend="Direct members"
                        />
                        <StatsCard 
                          title="TEAM LEVELS" 
                          value={getMaxLevel(hierarchyData)} 
                          icon={<FiLayers size="24px" />} 
                          color="purple"
                          trend="Hierarchy depth"
                        />
                        <StatsCard 
                          title="ACTIVE COACHES" 
                          value={getActiveCoachesCount(hierarchyData)} 
                          icon={<FiCheckCircle size="24px" />} 
                          color="green"
                          trend="Currently active"
                        />
                        <StatsCard 
                          title="GROWTH RATE" 
                          value="+12%" 
                          icon={<FiTrendingUp size="24px" />} 
                          color="orange"
                          trend="This month"
                        />
                      </SimpleGrid>
                      {/* Team Structure Visualization */}
                      {loading && !hierarchyData ? (
                        <VStack spacing={6}>
                          {[1, 2, 3].map((i) => (
                            <Card key={i} borderRadius="12px" border="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                              <CardBody p={6}>
                                <SkeletonText noOfLines={4} spacing="4" />
                              </CardBody>
                            </Card>
                          ))}
                        </VStack>
                      ) : (() => {
                        // Use real hierarchy data from backend
                        const dataToUse = hierarchyData;
                        
                        // Get the members list - handle both downlineHierarchy and downline structures
                        const members = dataToUse?.downlineHierarchy || dataToUse?.downline || [];
                        const hasMembers = Array.isArray(members) && members.length > 0;
                        
                        // Stats Cards - Move members definition before usage
                        const statsMembers = members;
                        
                        if (!hasMembers) {
                          return (
                            <Card 
                              bg={useColorModeValue('white', 'gray.800')} 
                              border="1px" 
                              borderColor={useColorModeValue('gray.200', 'gray.700')} 
                              borderRadius="16px"
                              boxShadow={useColorModeValue('0 4px 6px rgba(0,0,0,0.05)', '0 4px 6px rgba(0,0,0,0.2)')}
                            >
                              <CardBody py={16}>
                                <Center>
                                  <VStack spacing={6}>
                                    <Box 
                                      p={6} 
                                      bg={useColorModeValue('blue.50', 'blue.900/20')} 
                                      borderRadius="20px"
                                      border="2px"
                                      borderColor={useColorModeValue('blue.200', 'blue.700')}
                                    >
                                      <FiUsers size={64} color={useColorModeValue('blue.500', 'blue.400')} />
                                    </Box>
                                    <VStack spacing={3}>
                                      <Heading fontSize="xl" fontWeight="700" color={useColorModeValue('gray.800', 'gray.100')}>
                                        No Team Members Yet
                                      </Heading>
                                      <Text fontSize="md" color={useColorModeValue('gray.600', 'gray.400')} textAlign="center" maxW="400px">
                                        Start building your MLM network by adding your first team member and watch your organization grow
                                      </Text>
                                    </VStack>
                                    <Button
                                      leftIcon={<AddIcon />}
                                      colorScheme="blue"
                                      onClick={onAddModalOpen}
                                      borderRadius="10px"
                                      fontWeight="600"
                                      size="lg"
                                      px={8}
                                      py={6}
                                      _hover={{
                                        transform: 'translateY(-2px)',
                                        boxShadow: 'lg'
                                      }}
                                      transition="all 0.2s"
                                    >
                                      Add Your First Team Member
                                    </Button>
                                  </VStack>
                                </Center>
                              </CardBody>
                            </Card>
                          );
                        }
                      
                      // Professional Team Hierarchy View
                      return (
                        <VStack spacing={8} align="stretch">
                          {/* Controls Bar */}
                          <Flex justify="space-between" align="center" bg={useColorModeValue('white', 'gray.800')} p={4} borderRadius="12px" border="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                            <HStack spacing={4}>
                              <Text fontSize="sm" fontWeight="600" color={useColorModeValue('gray.700', 'gray.300')}>
                                👥 {members.length} Direct Members
                              </Text>
                              <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                                •
                              </Text>
                              <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                                {getTotalTeamSize(hierarchyData)} Total Team Size
                              </Text>
                            </HStack>
                            
                            <HStack spacing={3}>
                              <Menu>
                                <MenuButton
                                  as={Button}
                                  rightIcon={<ChevronDownIcon />}
                                  size="sm"
                                  w="140px"
                                  borderRadius="8px"
                                  borderColor={useColorModeValue('gray.300', 'gray.600')}
                                  bg={useColorModeValue('white', 'gray.700')}
                                  fontWeight="500"
                                  _hover={{
                                    borderColor: 'blue.400',
                                    boxShadow: useColorModeValue('0 0 0 1px rgba(66, 153, 225, 0.2)', '0 0 0 1px rgba(66, 153, 225, 0.3)')
                                  }}
                                >
                                  {levelsToShow === 1 ? 'Level 1' : 
                                   levelsToShow === 2 ? 'Level 2' :
                                   levelsToShow === 3 ? 'Level 3' :
                                   'All Levels'}
                                </MenuButton>
                                <MenuList
                                  bg={useColorModeValue('white', 'gray.800')}
                                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                                  boxShadow="lg"
                                  minW="140px"
                                >
                                  <MenuItem onClick={() => setLevelsToShow(1)}>Level 1</MenuItem>
                                  <MenuItem onClick={() => setLevelsToShow(2)}>Level 2</MenuItem>
                                  <MenuItem onClick={() => setLevelsToShow(3)}>Level 3</MenuItem>
                                  <MenuItem onClick={() => setLevelsToShow(0)}>All Levels</MenuItem>
                                </MenuList>
                              </Menu>
                              
                              <IconButton
                                icon={<RepeatIcon />}
                                size="sm"
                                variant="outline"
                                onClick={fetchHierarchy}
                                isLoading={loading}
                                aria-label="Refresh"
                                borderRadius="8px"
                                borderColor={useColorModeValue('gray.300', 'gray.600')}
                                _hover={{
                                  bg: useColorModeValue('gray.50', 'gray.700')
                                }}
                              />
                            </HStack>
                          </Flex>

                          {/* Professional Team Tree Visualization */}
                          <Card 
                            border="1px" 
                            borderColor={useColorModeValue('gray.200', 'gray.700')} 
                            borderRadius="16px" 
                            overflow="hidden"
                            bg={useColorModeValue('white', 'gray.800')}
                            boxShadow={useColorModeValue('0 4px 6px rgba(0,0,0,0.05)', '0 4px 6px rgba(0,0,0,0.2)')}
                          >
                            {/* Zoom Controls */}
                            <HStack 
                              justify="space-between" 
                              align="center"
                              p={4} 
                              bg={useColorModeValue('gray.50', 'gray.900')} 
                              borderBottom="1px" 
                              borderColor={useColorModeValue('gray.200', 'gray.700')}
                            >
                              <HStack spacing={4} flex={1} maxW="400px">
                                <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} fontWeight="500">
                                  🔍 Zoom: {Math.round(treeZoom * 100)}%
                                </Text>
                                <Slider
                                  aria-label="Zoom slider"
                                  value={treeZoom}
                                  min={0.5}
                                  max={2}
                                  step={0.1}
                                  onChange={(val) => setTreeZoom(val)}
                                  colorScheme="blue"
                                  flex={1}
                                >
                                  <SliderTrack>
                                    <SliderFilledTrack />
                                  </SliderTrack>
                                  <SliderThumb />
                                </Slider>
                              </HStack>
                              <IconButton
                                icon={<FiMaximize2 />}
                                size="sm"
                                onClick={() => setTreeZoom(1)}
                                aria-label="Reset Zoom"
                                variant="outline"
                                borderRadius="8px"
                                borderColor={useColorModeValue('gray.300', 'gray.600')}
                                _hover={{
                                  bg: useColorModeValue('gray.50', 'gray.700')
                                }}
                              />
                            </HStack>
                            
                            {/* Enhanced Tree Container */}
                            <Box
                              position="relative"
                              overflow="auto"
                              bg={useColorModeValue('white', 'gray.900')}
                              minH="600px"
                              cursor={isDragging ? 'grabbing' : 'default'}
                              onMouseDown={(e) => {
                                const target = e.target;
                                const isInteractive = target.closest('button') || 
                                                     target.closest('[role="button"]') || 
                                                     target.closest('img') ||
                                                     target.closest('svg') ||
                                                     target.closest('.tooltip-container');
                                
                                if (!isInteractive) {
                                  setIsDragging(true);
                                  setDragStart({
                                    x: e.clientX - treePosition.x,
                                    y: e.clientY - treePosition.y
                                  });
                                  e.preventDefault();
                                }
                              }}
                              onMouseMove={(e) => {
                                if (isDragging) {
                                  const newX = e.clientX - dragStart.x;
                                  const newY = e.clientY - dragStart.y;
                                  setTreePosition({ x: newX, y: newY });
                                }
                              }}
                              onMouseUp={() => setIsDragging(false)}
                              onMouseLeave={() => setIsDragging(false)}
                              sx={{
                                backgroundImage: `
                                  linear-gradient(to right, ${useColorModeValue('rgba(156, 163, 175, 0.1)', 'rgba(75, 85, 99, 0.2)')} 1px, transparent 1px),
                                  linear-gradient(to bottom, ${useColorModeValue('rgba(156, 163, 175, 0.1)', 'rgba(75, 85, 99, 0.2)')} 1px, transparent 1px)
                                `,
                                backgroundSize: '20px 20px',
                                backgroundPosition: `${treePosition.x % 20}px ${treePosition.y % 20}px, ${treePosition.x % 20}px ${treePosition.y % 20}px`,
                                '&::-webkit-scrollbar': {
                                  width: '8px',
                                  height: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                  background: useColorModeValue('rgba(0, 0, 0, 0.02)', 'rgba(255, 255, 255, 0.02)'),
                                  borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                  background: useColorModeValue('rgba(156, 163, 175, 0.3)', 'rgba(156, 163, 175, 0.4)'),
                                  borderRadius: '4px',
                                  border: '1px solid transparent',
                                  backgroundClip: 'padding-box',
                                  '&:hover': {
                                    background: useColorModeValue('rgba(156, 163, 175, 0.5)', 'rgba(156, 163, 175, 0.6)'),
                                    backgroundClip: 'padding-box',
                                  },
                                },
                                scrollbarWidth: 'thin',
                                scrollbarColor: useColorModeValue('rgba(156, 163, 175, 0.3) rgba(0, 0, 0, 0.02)', 'rgba(156, 163, 175, 0.4) rgba(255, 255, 255, 0.02)'),
                              }}
                            >
                              <Box
                                className="tree-background"
                                minW="fit-content"
                                position="relative"
                                py={8}
                                px={10}
                                transform={`scale(${treeZoom}) translate(${treePosition.x / treeZoom}px, ${treePosition.y / treeZoom}px)`}
                                transformOrigin="top left"
                                transition={isDragging ? 'none' : 'transform 0.05s ease-out'}
                                style={{ userSelect: 'none' }}
                              >
                                <VStack spacing={16} align="stretch">
                                  {/* Root Node - Professional Head Coach */}
                                  <Box textAlign="center" position="relative" zIndex={3}>
                                    <Tooltip
                                      label={
                                        <Box p={4} bg="gray.800" borderRadius="8px">
                                          <VStack align="start" spacing={3}>
                                            <HStack spacing={3}>
                                              <Text fontWeight="700" color="white" fontSize="sm">
                                                👑 {dataToUse.name || 'You'}
                                              </Text>
                                              <Box w={3} h={3} bg="green.400" borderRadius="full" />
                                            </HStack>
                                            <Text fontSize="xs" color="gray.300">
                                              Head Coach • Level 0
                                            </Text>
                                            {dataToUse.email && (
                                              <Text fontSize="xs" color="gray.400">
                                                ✉️ {dataToUse.email}
                                              </Text>
                                            )}
                                            <HStack spacing={6} pt={3} borderTop="1px" borderColor="gray.600">
                                              <VStack spacing={1} align="start">
                                                <Text fontSize="xs" color="gray.400">Team Size</Text>
                                                <Text fontSize="md" fontWeight="800" color="white">
                                                  {members.length}
                                                </Text>
                                              </VStack>
                                              {dataToUse.performance?.performanceScore !== undefined && (
                                                <VStack spacing={1} align="start">
                                                  <Text fontSize="xs" color="gray.400">Performance</Text>
                                                  <Text fontSize="md" fontWeight="800" color="white">
                                                    {dataToUse.performance.performanceScore}%
                                                  </Text>
                                                </VStack>
                                              )}
                                            </HStack>
                                          </VStack>
                                        </Box>
                                      }
                                      bg={useColorModeValue('gray.800', 'gray.900')}
                                      color="white"
                                      borderRadius="12px"
                                      placement="top"
                                      hasArrow
                                      arrowSize={10}
                                    >
                                      <Box
                                        as="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openViewModal(dataToUse);
                                        }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        cursor="pointer"
                                        _hover={{ transform: 'scale(1.05)' }}
                                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                        position="relative"
                                        zIndex={3}
                                      >
                                        <Box position="relative" display="inline-block">
                                          <Image
                                            src={dataToUse.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(dataToUse.name || 'User')}&background=3182ce&color=fff&size=128`}
                                            alt={dataToUse.name || 'You'}
                                            borderRadius="16px"
                                            boxSize="100px"
                                            border="4px solid"
                                            borderColor={useColorModeValue('blue.400', 'blue.600')}
                                            boxShadow={useColorModeValue('0 8px 25px rgba(59, 130, 246, 0.3)', '0 8px 25px rgba(59, 130, 246, 0.4)')}
                                            objectFit="cover"
                                            fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(dataToUse.name || 'User')}&background=3182ce&color=fff&size=128`}
                                          />
                                          <Box
                                            position="absolute"
                                            bottom="-3px"
                                            right="-3px"
                                            w={6}
                                            h={6}
                                            bg="green.500"
                                            borderRadius="8px"
                                            border="3px solid"
                                            borderColor={useColorModeValue('white', 'gray.800')}
                                            boxShadow="0 2px 8px rgba(0,0,0,0.2)"
                                          />
                                        </Box>
                                      </Box>
                                    </Tooltip>
                                    <VStack spacing={2} mt={4}>
                                      <Heading 
                                        fontSize="lg" 
                                        fontWeight="700" 
                                        color={useColorModeValue('gray.800', 'gray.100')}
                                        letterSpacing="-0.3px"
                                      >
                                        👑 {dataToUse.name || 'You'}
                                      </Heading>
                                      <HStack spacing={2}>
                                        <Text 
                                          fontSize="sm" 
                                          fontWeight="600" 
                                          color={useColorModeValue('blue.600', 'blue.400')}
                                        >
                                          Head Coach
                                        </Text>
                                        <Box 
                                          px={2} 
                                          py={1} 
                                          bg={useColorModeValue('green.100', 'green.900/30')}
                                          borderRadius="7px"
                                        >
                                          <Text 
                                            fontSize="xs" 
                                            fontWeight="700" 
                                            color={useColorModeValue('green.700', 'green.300')}
                                          >
                                            LEVEL 0
                                          </Text>
                                        </Box>
                                      </HStack>
                                    </VStack>
                                  </Box>

                                {/* Level 1 Members */}
                                {members.length > 0 && (
                                  <Box position="relative" mt={2}>
                                    {/* SVG Connection Lines - Properly Connected */}
                                    <Box
                                      position="absolute"
                                      top="-80px"
                                      left="0"
                                      right="0"
                                      height="80px"
                                      zIndex={1}
                                      pointerEvents="none"
                                    >
                                      <svg
                                        width="100%"
                                        height="100%"
                                        style={{ position: 'absolute', top: 0, left: 0 }}
                                      >
                                        {/* Vertical line from root to horizontal branch */}
                                        <line
                                          x1="50%"
                                          y1="0"
                                          x2="50%"
                                          y2="40"
                                          stroke="#9CA3AF"
                                          strokeWidth="2.5"
                                        />
                                        {/* Horizontal line connecting all level 1 members */}
                                        {members.length > 1 && (
                                          <line
                                            x1={`${100 / (members.length * 2)}%`}
                                            y1="40"
                                            x2={`${100 - (100 / (members.length * 2))}%`}
                                            y2="40"
                                            stroke="#9CA3AF"
                                            strokeWidth="2.5"
                                          />
                                        )}
                                        {/* Vertical lines from horizontal branch to each member avatar */}
                                        {members.map((_, index) => {
                                          const colCount = members.length > 4 ? 5 : members.length;
                                          const colWidth = 100 / colCount;
                                          const xPos = (index % colCount) * colWidth + colWidth / 2;
                                          return (
                                            <line
                                              key={`line-${index}`}
                                              x1={`${xPos}%`}
                                              y1="40"
                                              x2={`${xPos}%`}
                                              y2="80"
                                              stroke="#9CA3AF"
                                              strokeWidth="2.5"
                                            />
                                          );
                                        })}
                                      </svg>
                                    </Box>

                                    <SimpleGrid 
                                      columns={{ base: 2, md: members.length > 3 ? 4 : members.length, lg: members.length > 4 ? 5 : members.length }} 
                                      spacing={6}
                                      mt={10}
                                    >
                                      {members
                                        .filter((_, index) => levelsToShow === 0 || levelsToShow >= 1)
                                        .map((member, index) => {
                                          const memberDownline = member.downlineHierarchy || member.downline || [];
                                          const hasChildren = memberDownline.length > 0;
                                          
                                          return (
                                            <Box key={member._id || index} position="relative" textAlign="center" id={`member-${index}`}>
                                              <VStack spacing={2}>
                                                <Tooltip
                                                  label={
                                                    <Box p={3}>
                                                      <VStack align="start" spacing={2}>
                                                        <HStack spacing={2}>
                                                          <Text fontWeight="600" color="white" fontSize="sm">
                                                            {member.name}
                                                          </Text>
                                                          {member.isActive !== false ? (
                                                            <Box w={2} h={2} bg="green.500" borderRadius="full" />
                                                          ) : (
                                                            <Box w={2} h={2} bg="gray.400" borderRadius="full" />
                                                          )}
                                                        </HStack>
                                                        <Text fontSize="xs" color="gray.200">
                                                          Level {member.currentLevel || 1}
                                                        </Text>
                                                        {member.email && (
                                                          <Text fontSize="xs" color="gray.300">
                                                            {member.email}
                                                          </Text>
                                                        )}
                                                        <HStack spacing={4} pt={2} borderTop="1px" borderColor="gray.600">
                                                          {member.performance?.performanceScore !== undefined && (
                                                            <VStack spacing={0} align="start">
                                                              <Text fontSize="xs" color="gray.400">Performance</Text>
                                                              <Text fontSize="sm" fontWeight="700" color="white">
                                                                {member.performance.performanceScore}%
                                                              </Text>
                                                            </VStack>
                                                          )}
                                                          {hasChildren && (
                                                            <VStack spacing={0} align="start">
                                                              <Text fontSize="xs" color="gray.400">Team</Text>
                                                              <Text fontSize="sm" fontWeight="700" color="white">
                                                                {memberDownline.length}
                                                              </Text>
                                                            </VStack>
                                                          )}
                                                        </HStack>
                                                      </VStack>
                                                    </Box>
                                                  }
                                                  bg="gray.800"
                                                  color="white"
                                                  borderRadius="7px"
                                                  placement="top"
                                                  hasArrow
                                                >
                                                  <Box
                                                    as="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      openViewModal(member);
                                                    }}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    cursor="pointer"
                                                    _hover={{ transform: 'scale(1.1)' }}
                                                    transition="all 0.2s"
                                                    position="relative"
                                                    zIndex={2}
                                                    id={`member-avatar-${index}`}
                                                  >
                                                    <Box position="relative" display="inline-block">
                                                      <Image
                                                        src={member.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=3182ce&color=fff&size=128`}
                                                        alt={member.name}
                                                        borderRadius="7px"
                                                        boxSize="64px"
                                                        border="3px solid"
                                                        borderColor={member.isActive !== false ? "green.400" : "gray.400"}
                                                        boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                                                        objectFit="cover"
                                                        fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=3182ce&color=fff&size=128`}
                                                      />
                                                      <Box
                                                        position="absolute"
                                                        bottom="-2px"
                                                        right="-2px"
                                                        w={3}
                                                        h={3}
                                                        bg={member.isActive !== false ? "green.500" : "gray.400"}
                                                        borderRadius="7px"
                                                        border="2px solid"
                                                        borderColor="white"
                                                      />
                                                    </Box>
                                                  </Box>
                                                </Tooltip>
                                                <Text fontSize="xs" color="gray.700" mt={1} fontWeight="500" noOfLines={1} maxW="80px" mx="auto">
                                                  {member.name}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500">
                                                  L{member.currentLevel || 1}
                                                </Text>
                                              </VStack>

                                              {/* Level 2 Members - Nested */}
                                              {hasChildren && levelsToShow >= 2 && memberDownline.length > 0 && (
                                                <Box mt={8} position="relative">
                                                  {/* SVG Connection Lines for Level 2 - Properly Connected */}
                                                  <Box
                                                    position="absolute"
                                                    top="-50px"
                                                    left="50%"
                                                    transform="translateX(-50%)"
                                                    width={`${Math.min(memberDownline.length * 70, 350)}px`}
                                                    height="50px"
                                                    zIndex={1}
                                                    pointerEvents="none"
                                                  >
                                                    <svg
                                                      width="100%"
                                                      height="100%"
                                                      style={{ position: 'absolute', top: 0, left: 0 }}
                                                    >
                                                      {/* Vertical line from level 1 member */}
                                                      <line
                                                        x1="50%"
                                                        y1="0"
                                                        x2="50%"
                                                        y2="25"
                                                        stroke="#9CA3AF"
                                                        strokeWidth="2.5"
                                                      />
                                                      {/* Horizontal line for level 2 */}
                                                      {memberDownline.length > 1 && (
                                                        <line
                                                          x1={`${50 - ((memberDownline.length - 1) * 30)}%`}
                                                          y1="25"
                                                          x2={`${50 + ((memberDownline.length - 1) * 30)}%`}
                                                          y2="25"
                                                          stroke="#9CA3AF"
                                                          strokeWidth="2.5"
                                                        />
                                                      )}
                                                      {/* Vertical lines to each level 2 member */}
                                                      {memberDownline.map((_, childIndex) => {
                                                        if (memberDownline.length === 1) {
                                                          return (
                                                            <line
                                                              key={`line-l2-${childIndex}`}
                                                              x1="50%"
                                                              y1="25"
                                                              x2="50%"
                                                              y2="50"
                                                              stroke="#9CA3AF"
                                                              strokeWidth="2.5"
                                                            />
                                                          );
                                                        }
                                                        const spacing = 100 / (memberDownline.length - 1);
                                                        const xPos = childIndex * spacing;
                                                        return (
                                                          <line
                                                            key={`line-l2-${childIndex}`}
                                                            x1={`${xPos}%`}
                                                            y1="25"
                                                            x2={`${xPos}%`}
                                                            y2="50"
                                                            stroke="#9CA3AF"
                                                            strokeWidth="2.5"
                                                          />
                                                        );
                                                      })}
                                                    </svg>
                                                  </Box>

                                                  <HStack spacing={3} justify="center" flexWrap="wrap" mt={6}>
                                                    {memberDownline
                                                      .filter((_, idx) => levelsToShow === 0 || idx < 6)
                                                      .map((child, childIndex) => {
                                                        return (
                                                          <VStack key={child._id || childIndex} spacing={1} position="relative">
                                                            <Tooltip
                                                              label={
                                                                <Box p={3}>
                                                                  <VStack align="start" spacing={2}>
                                                                    <HStack spacing={2}>
                                                                      <Text fontWeight="600" color="white" fontSize="sm">
                                                                        {child.name}
                                                                      </Text>
                                                                      {child.isActive !== false ? (
                                                                        <Box w={2} h={2} bg="green.500" borderRadius="full" />
                                                                      ) : (
                                                                        <Box w={2} h={2} bg="gray.400" borderRadius="full" />
                                                                      )}
                                                                    </HStack>
                                                                    <Text fontSize="xs" color="gray.200">
                                                                      Level {child.currentLevel || 2}
                                                                    </Text>
                                                                    {child.email && (
                                                                      <Text fontSize="xs" color="gray.300">
                                                                        {child.email}
                                                                      </Text>
                                                                    )}
                                                                    {child.performance?.performanceScore !== undefined && (
                                                                      <VStack spacing={0} align="start" pt={2} borderTop="1px" borderColor="gray.600">
                                                                        <Text fontSize="xs" color="gray.400">Performance</Text>
                                                                        <Text fontSize="sm" fontWeight="700" color="white">
                                                                          {child.performance.performanceScore}%
                                                                        </Text>
                                                                      </VStack>
                                                                    )}
                                                                  </VStack>
                                                                </Box>
                                                              }
                                                              bg="gray.800"
                                                              color="white"
                                                              borderRadius="7px"
                                                              placement="top"
                                                              hasArrow
                                                            >
                                                              <Box
                                                                as="button"
                                                                onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  openViewModal(child);
                                                                }}
                                                                onMouseDown={(e) => e.stopPropagation()}
                                                                cursor="pointer"
                                                                _hover={{ transform: 'scale(1.1)' }}
                                                                transition="all 0.2s"
                                                                position="relative"
                                                                zIndex={2}
                                                              >
                                                                <Box position="relative" display="inline-block">
                                                                  <Image
                                                                    src={child.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name || 'User')}&background=3182ce&color=fff&size=128`}
                                                                    alt={child.name}
                                                                    borderRadius="7px"
                                                                    boxSize="48px"
                                                                    border="2px solid"
                                                                    borderColor={child.isActive !== false ? "green.400" : "gray.400"}
                                                                    boxShadow="0 2px 6px rgba(0,0,0,0.1)"
                                                                    objectFit="cover"
                                                                    fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(child.name || 'User')}&background=3182ce&color=fff&size=128`}
                                                                  />
                                                                  <Box
                                                                    position="absolute"
                                                                    bottom="-1px"
                                                                    right="-1px"
                                                                    w={2.5}
                                                                    h={2.5}
                                                                    bg={child.isActive !== false ? "green.500" : "gray.400"}
                                                                    borderRadius="7px"
                                                                    border="2px solid"
                                                                    borderColor="white"
                                                                  />
                                                                </Box>
                                                              </Box>
                                                            </Tooltip>
                                                            <Text fontSize="xs" color="gray.600" noOfLines={1} maxW="60px">
                                                              {child.name}
                                                            </Text>
                                                          </VStack>
                                                        );
                                                      })}
                                                  </HStack>
                                                </Box>
                                              )}
                                            </Box>
                                          );
                                        })}
                                    </SimpleGrid>
                                  </Box>
                                )}
                              </VStack>
                            </Box>
                          </Box>
                        </Card>
                        </VStack>
                      );
                    })()}
                  </Box>
                    </Box>
                </TabPanel>

                {/* Direct Coaches Tab */}
                <TabPanel p={6}>
                  <VStack spacing={6} align="stretch">
                    {/* Header with Search and Filters */}
                    <Flex justify="space-between" align="start" direction={{ base: 'column', lg: 'row' }} gap={4}>
                      <VStack align="start" spacing={1}>
                        <Heading size="md" color="gray.800">Direct Team Coaches</Heading>
                        <Text fontSize="sm" color="gray.600">
                          Manage and monitor your direct team members
                        </Text>
                      </VStack>
                      
                      <HStack spacing={4}>
                        <InputGroup maxW="300px">
                          <InputLeftElement>
                            <SearchIcon color="gray.400" />
                          </InputLeftElement>
                          <Input
                            placeholder="Search coaches..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            bg="white"
                            borderRadius="7px"
                            border="2px"
                            borderColor="gray.200"
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                            _hover={{ borderColor: 'gray.300' }}
                          />
                        </InputGroup>
                        
                        <Menu>
                          <MenuButton
                            as={Button}
                            rightIcon={<ChevronDownIcon />}
                            w="200px"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: 'gray.400' }}
                            justifyContent="space-between"
                          >
                            {performanceFilter === 'all' ? 'All Coaches' : 
                             performanceFilter === 'active' ? 'Active Only' :
                             performanceFilter === 'inactive' ? 'Inactive Only' :
                             'Top Performers'}
                          </MenuButton>
                          <MenuList
                            bg="white"
                            borderColor="gray.200"
                            boxShadow="lg"
                            py={2}
                            fontSize="sm"
                            minW="200px"
                          >
                            <MenuItem 
                              onClick={() => setPerformanceFilter('all')}
                              fontSize="sm"
                              _hover={{ bg: 'gray.100' }}
                            >
                              All Coaches
                            </MenuItem>
                            <MenuItem 
                              onClick={() => setPerformanceFilter('active')}
                              fontSize="sm"
                              _hover={{ bg: 'gray.100' }}
                            >
                              Active Only
                            </MenuItem>
                            <MenuItem 
                              onClick={() => setPerformanceFilter('inactive')}
                              fontSize="sm"
                              _hover={{ bg: 'gray.100' }}
                            >
                              Inactive Only
                            </MenuItem>
                            <MenuItem 
                              onClick={() => setPerformanceFilter('top')}
                              fontSize="sm"
                              _hover={{ bg: 'gray.100' }}
                            >
                              Top Performers
                            </MenuItem>
                          </MenuList>
                        </Menu>
                        
                        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onAddModalOpen}>
                          Add Coach
                        </Button>
                      </HStack>
                    </Flex>

                    {/* Enhanced Table or Cards View */}
                    {loading ? (
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                        {Array(6).fill(0).map((_, i) => (
                          <Card key={i} borderRadius="7px">
                            <CardBody>
                              <VStack spacing={4}>
                                <Skeleton height="60px" width="60px" borderRadius="full" />
                                <SkeletonText noOfLines={4} spacing="4" />
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    ) : filteredDownlineData.length > 0 ? (
                      <Card borderRadius="7px" overflow="hidden" border="1px" borderColor="gray.200">
                        <TableContainer>
                          <Table variant="simple" size="md">
                            <Thead>
                              <Tr bg="gray.50">
                                <Th py={4} color="gray.700" fontWeight="bold" fontSize="sm">
                                  <Checkbox
                                    isChecked={selectedCoaches.size === filteredDownlineData.length && filteredDownlineData.length > 0}
                                    onChange={(e) => handleSelectAllCoaches(e.target.checked, filteredDownlineData)}
                                  />
                                </Th>
                                <Th py={4} color="gray.700" fontWeight="bold" fontSize="sm">COACH</Th>
                                <Th py={4} color="gray.700" fontWeight="bold" fontSize="sm">CONTACT</Th>
                                <Th py={4} color="gray.700" fontWeight="bold" fontSize="sm">LOCATION</Th>
                                <Th py={4} color="gray.700" fontWeight="bold" fontSize="sm">STATUS</Th>
                                <Th py={4} color="gray.700" fontWeight="bold" fontSize="sm">PERFORMANCE</Th>
                                <Th py={4} color="gray.700" fontWeight="bold" fontSize="sm">ACTIONS</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {filteredDownlineData.map((coach, index) => (
                                <Tr 
                                  key={coach._id || index}
                                  _hover={{ bg: 'gray.50' }}
                                  borderBottom="1px"
                                  borderColor="gray.100"
                                  bg={selectedCoaches.has(coach._id) ? 'blue.50' : 'white'}
                                >
                                  <Td py={4}>
                                    <Checkbox
                                      isChecked={selectedCoaches.has(coach._id)}
                                      onChange={() => handleSelectCoach(coach._id)}
                                    />
                                  </Td>
                                  <Td py={4}>
                                    <HStack spacing={3}>
                                      <Avatar 
                                        name={coach.name} 
                                        bg="blue.500" 
                                        color="white" 
                                        size="md"
                                        boxShadow="md"
                                      />
                                      <VStack align="start" spacing={1}>
                                        <Text fontWeight="bold" color="gray.800">{coach.name}</Text>
                                        <Text fontSize="xs" color="gray.500">Sponsor ID: {coach.sponsorId || 'N/A'}</Text>
                                        <HStack spacing={2}>
                                          <Badge colorScheme={coach.isActive ? 'green' : 'red'} size="sm" borderRadius="full">
                                            {coach.isActive ? 'Active' : 'Inactive'}
                                          </Badge>
                                          <Badge colorScheme="blue" size="sm" borderRadius="full">
                                            Level {coach.currentLevel || 1}
                                          </Badge>
                                        </HStack>
                                      </VStack>
                                    </HStack>
                                  </Td>
                                  <Td py={4}>
                                    <VStack align="start" spacing={1}>
                                      <HStack spacing={2}>
                                        <Box as={FiMail} color="blue.500" size="14px" />
                                        <Text fontSize="sm" color="gray.700">{coach.email}</Text>
                                      </HStack>
                                      <HStack spacing={2}>
                                        <Box as={FiPhone} color="green.500" size="14px" />
                                        <Text fontSize="sm" color="gray.700">{coach.phone || 'N/A'}</Text>
                                      </HStack>
                                    </VStack>
                                  </Td>
                                  <Td py={4}>
                                    <VStack align="start" spacing={1}>
                                      <Text fontSize="sm" color="gray.700">
                                        {coach.city || 'N/A'}
                                      </Text>
                                      <Text fontSize="sm" color="gray.500">
                                        {coach.country || 'N/A'}
                                      </Text>
                                    </VStack>
                                  </Td>
                                  <Td py={4}>
                                    <VStack align="start" spacing={2}>
                                      <Badge 
                                        colorScheme={coach.isActive ? 'green' : 'gray'} 
                                        variant="solid"
                                        borderRadius="7px"
                                        px={3}
                                        py={1}
                                      >
                                        {coach.isActive ? 'Active' : 'Inactive'}
                                      </Badge>
                                      <Text fontSize="xs" color="gray.500">
                                        {coach.teamRankName || 'No rank'}
                                      </Text>
                                    </VStack>
                                  </Td>
                                  <Td py={4}>
                                    {coach.performance ? (
                                      <VStack align="start" spacing={2}>
                                        <HStack spacing={2}>
                                          <CircularProgress 
                                            value={coach.performance.performanceScore || 0} 
                                            size="40px" 
                                            color="blue.400"
                                            thickness="8px"
                                          >
                                            <CircularProgressLabel fontSize="xs">
                                              {coach.performance.performanceScore || 0}
                                            </CircularProgressLabel>
                                          </CircularProgress>
                                          <VStack align="start" spacing={0}>
                                            <Text fontSize="sm" fontWeight="bold" color="gray.700">
                                              {coach.performance.performanceScore || 0}%
                                            </Text>
                                            <Text fontSize="xs" color="gray.500">
                                              {coach.performance.activityStreak || 0}d streak
                                            </Text>
                                          </VStack>
                                        </HStack>
                                      </VStack>
                                    ) : (
                                      <Text fontSize="sm" color="gray.400">No data</Text>
                                    )}
                                  </Td>
                                  <Td py={4}>
                                    <ButtonGroup size="sm" variant="ghost" spacing={1}>
                                      <Tooltip label="View Details">
                                        <IconButton
                                          icon={<ViewIcon />}
                                          onClick={() => openViewModal(coach)}
                                          colorScheme="blue"
                                          _hover={{ bg: 'blue.100' }}
                                        />
                                      </Tooltip>
                                      <Tooltip label="Edit Coach">
                                        <IconButton
                                          icon={<EditIcon />}
                                          onClick={() => openEditModal(coach)}
                                          colorScheme="orange"
                                          _hover={{ bg: 'orange.100' }}
                                        />
                                      </Tooltip>
                                      <Menu>
                                        <MenuButton
                                          as={IconButton}
                                          icon={<Box as={FiMoreVertical} />}
                                          variant="ghost"
                                          size="sm"
                                          _hover={{ bg: 'gray.100' }}
                                        />
                                        <MenuList>
                                          <MenuItem icon={<Box as={FiMail} />}>
                                            Send Email
                                          </MenuItem>
                                          <MenuItem icon={<ChatIcon />}>
                                            Send Message
                                          </MenuItem>
                                          <MenuDivider />
                                          <MenuItem 
                                            icon={<DeleteIcon />} 
                                            color="red.500"
                                            onClick={() => openDeleteModal(coach)}
                                          >
                                            Delete Coach
                                          </MenuItem>
                                        </MenuList>
                                      </Menu>
                                    </ButtonGroup>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      </Card>
                    ) : (
                      <Card bg="gray.50" borderRadius="7px" border="2px dashed" borderColor="gray.300">
                        <CardBody py={12}>
                          <Center>
                            <VStack spacing={4}>
                              <Box
                                w="80px"
                                h="80px"
                                bg="gray.200"
                                borderRadius="7px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                color="gray.500"
                              >
                                <Box as={FiUsers} size="32px" />
                              </Box>
                              <VStack spacing={2}>
                                <Text fontSize="lg" fontWeight="semibold" color="gray.600">
                                  No Coaches Found
                                </Text>
                                <Text color="gray.500" textAlign="center" fontSize="sm">
                                  {searchTerm || performanceFilter !== 'all' 
                                    ? 'No coaches match your current filters.' 
                                    : 'Start building your team by adding your first coach.'
                                  }
                                </Text>
                              </VStack>
                              <Button colorScheme="blue" onClick={onAddModalOpen} size="sm">
                                Add New Coach
                              </Button>
                            </VStack>
                          </Center>
                        </CardBody>
                      </Card>
                    )}
                  </VStack>
                </TabPanel>

                {/* Performance Tab - Matching Page Theme */}
                <TabPanel p={6}>
                  <VStack spacing={6} align="stretch">
                    {/* Header with Search and Filters */}
                    <Flex justify="space-between" align="start" direction={{ base: 'column', lg: 'row' }} gap={4}>
                      <VStack align="start" spacing={1}>
                        <Heading size="md" color="gray.800">Team Performance Analytics</Heading>
                        <Text fontSize="sm" color="gray.600">
                          Comprehensive insights into your team's performance and growth metrics
                        </Text>
                      </VStack>
                      
                      <HStack spacing={4}>
                        <Select 
                          w="200px" 
                          value={performanceFilter} 
                          onChange={(e) => setPerformanceFilter(e.target.value)}
                          bg={useColorModeValue('white', 'gray.800')}
                          borderColor={useColorModeValue('gray.300', 'gray.600')}
                          _hover={{ borderColor: useColorModeValue('gray.400', 'gray.500') }}
                          borderRadius="7px"
                          size="sm"
                        >
                          <option value="all">🌍 All Members</option>
                          <option value="top">⭐ Top Performers</option>
                          <option value="active">🔥 Active Only</option>
                          <option value="inactive">⚠️ Needs Attention</option>
                        </Select>
                        
                        <Button 
                          leftIcon={<RepeatIcon />} 
                          colorScheme="blue" 
                          onClick={fetchTeamPerformance}
                          isLoading={loading}
                          size="sm"
                          borderRadius="7px"
                          _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                          transition="all 0.2s"
                        >
                          Refresh Data
                        </Button>
                      </HStack>
                    </Flex>
                    {loading ? (
                      <VStack spacing={6}>
                        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                          {[1, 2, 3, 4].map((i) => (
                            <Card 
                              key={i} 
                              borderRadius="7px" 
                              border="1px" 
                              borderColor={useColorModeValue('gray.200', 'gray.600')}
                              bg={useColorModeValue('white', 'gray.800')}
                            >
                              <CardBody>
                                <Skeleton height="120px" />
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
                          {[1, 2, 3].map((i) => (
                            <Card 
                              key={i} 
                              borderRadius="7px" 
                              border="1px" 
                              borderColor={useColorModeValue('gray.200', 'gray.600')}
                              bg={useColorModeValue('white', 'gray.800')}
                            >
                              <CardBody>
                                <Skeleton height="200px" />
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      </VStack>
                    ) : teamPerformance ? (
                      <VStack spacing={6} align="stretch">
                        {/* Performance Overview Cards */}
                        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                          <StatsCard 
                            title="TEAM SIZE" 
                            value={teamPerformance.totalTeamSize || 0} 
                            icon="👥"
                            color="blue"
                            trend="Total Members"
                          />
                          <StatsCard 
                            title="TOTAL LEADS" 
                            value={teamPerformance.totalLeads || 0} 
                            icon="🎯"
                            color="purple"
                            trend="This Month"
                          />
                          <StatsCard 
                            title="TOTAL SALES" 
                            value={teamPerformance.totalSales || 0} 
                            icon="💰"
                            color="green"
                            trend="Completed"
                          />
                          <StatsCard 
                            title="REVENUE" 
                            value={`$${(teamPerformance.totalRevenue || 0).toLocaleString()}`} 
                            icon="📈"
                            color="orange"
                            trend="Monthly"
                          />
                        </SimpleGrid>

                        {/* Performance Analytics */}
                        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
                          {/* Performance Distribution */}
                          <Card 
                            borderRadius="7px" 
                            border="1px" 
                            borderColor={useColorModeValue('gray.200', 'gray.600')}
                            bg={useColorModeValue('white', 'gray.800')}
                            _hover={{ 
                              borderColor: 'blue.300', 
                              boxShadow: 'md', 
                              transform: 'translateY(-1px)'
                            }}
                            transition="all 0.2s"
                          >
                            <CardHeader>
                              <Heading size="md" color="gray.800">Performance Distribution</Heading>
                              <Text fontSize="sm" color="gray.600">Team performance breakdown</Text>
                            </CardHeader>
                            <CardBody>
                              <VStack spacing={4} align="stretch">
                                <Box>
                                  <HStack justify="space-between" mb={2}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.700">Top Performers (80-100%)</Text>
                                    <Text fontSize="sm" fontWeight="bold" color="green.600">
                                      {teamPerformance.memberDetails ? 
                                        teamPerformance.memberDetails.filter(m => (m.performance?.score || 0) >= 80).length
                                        : 0}
                                    </Text>
                                  </HStack>
                                  <Progress 
                                    value={teamPerformance.memberDetails ? 
                                      (teamPerformance.memberDetails.filter(m => (m.performance?.score || 0) >= 80).length / teamPerformance.memberDetails.length) * 100
                                      : 0} 
                                    colorScheme="green" 
                                    size="lg" 
                                    borderRadius="7px"
                                  />
                                </Box>

                                <Box>
                                  <HStack justify="space-between" mb={2}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.700">Average Performers (40-79%)</Text>
                                    <Text fontSize="sm" fontWeight="bold" color="yellow.600">
                                      {teamPerformance.memberDetails ? 
                                        teamPerformance.memberDetails.filter(m => (m.performance?.score || 0) >= 40 && (m.performance?.score || 0) < 80).length
                                        : 0}
                                    </Text>
                                  </HStack>
                                  <Progress 
                                    value={teamPerformance.memberDetails ? 
                                      (teamPerformance.memberDetails.filter(m => (m.performance?.score || 0) >= 40 && (m.performance?.score || 0) < 80).length / teamPerformance.memberDetails.length) * 100
                                      : 0} 
                                    colorScheme="yellow" 
                                    size="lg" 
                                    borderRadius="7px"
                                  />
                                </Box>

                                <Box>
                                  <HStack justify="space-between" mb={2}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.700">Needs Support (0-39%)</Text>
                                    <Text fontSize="sm" fontWeight="bold" color="red.600">
                                      {teamPerformance.memberDetails ? 
                                        teamPerformance.memberDetails.filter(m => (m.performance?.score || 0) < 40).length
                                        : 0}
                                    </Text>
                                  </HStack>
                                  <Progress 
                                    value={teamPerformance.memberDetails ? 
                                      (teamPerformance.memberDetails.filter(m => (m.performance?.score || 0) < 40).length / teamPerformance.memberDetails.length) * 100
                                      : 0} 
                                    colorScheme="red" 
                                    size="lg" 
                                    borderRadius="7px"
                                  />
                                </Box>
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Key Metrics */}
                          <Card borderRadius="7px" border="1px" borderColor="gray.200">
                            <CardHeader>
                              <Heading size="md" color="gray.800">Key Performance Metrics</Heading>
                              <Text fontSize="sm" color="gray.600">Critical business indicators</Text>
                            </CardHeader>
                            <CardBody>
                              <VStack spacing={4} align="stretch">
                                <Box>
                                  <HStack justify="space-between" mb={2}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.700">Conversion Rate</Text>
                                    <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                      {teamPerformance.totalLeads > 0 
                                        ? ((teamPerformance.totalSales / teamPerformance.totalLeads) * 100).toFixed(1)
                                        : 0}%
                                    </Text>
                                  </HStack>
                                  <Progress 
                                    value={teamPerformance.totalLeads > 0 
                                      ? (teamPerformance.totalSales / teamPerformance.totalLeads) * 100
                                      : 0} 
                                    colorScheme="blue" 
                                    size="lg" 
                                    borderRadius="7px"
                                  />
                                </Box>

                                <Box>
                                  <HStack justify="space-between" mb={2}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.700">Team Activity Rate</Text>
                                    <Text fontSize="sm" fontWeight="bold" color="purple.600">
                                      {teamPerformance.memberDetails ? 
                                        Math.round((teamPerformance.memberDetails.filter(m => m.performance?.isActive).length / teamPerformance.memberDetails.length) * 100)
                                        : 0}%
                                    </Text>
                                  </HStack>
                                  <Progress 
                                    value={teamPerformance.memberDetails ? 
                                      (teamPerformance.memberDetails.filter(m => m.performance?.isActive).length / teamPerformance.memberDetails.length) * 100
                                      : 0} 
                                    colorScheme="purple" 
                                    size="lg" 
                                    borderRadius="7px"
                                  />
                                </Box>

                                <Box textAlign="center" p={4} bg="gray.50" borderRadius="7px">
                                  <Text fontSize="xs" color="gray.500" mb={1}>AVERAGE DEAL SIZE</Text>
                                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                                    ${teamPerformance.totalSales > 0 
                                      ? (teamPerformance.totalRevenue / teamPerformance.totalSales).toFixed(0)
                                      : 0}
                                  </Text>
                                </Box>
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Performance Trends */}
                          <Card 
                            borderRadius="7px" 
                            border="1px" 
                            borderColor={useColorModeValue('gray.200', 'gray.600')}
                            bg={useColorModeValue('white', 'gray.800')}
                            _hover={{ 
                              borderColor: 'purple.300', 
                              boxShadow: 'md', 
                              transform: 'translateY(-1px)'
                            }}
                            transition="all 0.2s"
                          >
                            <CardHeader>
                              <Heading size="md" color="gray.800">Performance Trends</Heading>
                              <Text fontSize="sm" color="gray.600">Monthly growth indicators</Text>
                            </CardHeader>
                            <CardBody>
                              <VStack spacing={4} align="stretch">
                                <Box>
                                  <HStack justify="space-between" mb={2}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.700">Revenue Growth</Text>
                                    <Badge colorScheme="green" fontSize="xs">+22%</Badge>
                                  </HStack>
                                  <Progress value={75} colorScheme="green" size="lg" borderRadius="7px" />
                                </Box>

                                <Box>
                                  <HStack justify="space-between" mb={2}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.700">Team Expansion</Text>
                                    <Badge colorScheme="blue" fontSize="xs">+12%</Badge>
                                  </HStack>
                                  <Progress value={60} colorScheme="blue" size="lg" borderRadius="7px" />
                                </Box>

                                <Box>
                                  <HStack justify="space-between" mb={2}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.700">Lead Quality</Text>
                                    <Badge colorScheme="purple" fontSize="xs">+8%</Badge>
                                  </HStack>
                                  <Progress value={85} colorScheme="purple" size="lg" borderRadius="7px" />
                                </Box>

                                <Box p={4} bg="orange.50" borderRadius="7px" textAlign="center">
                                  <Text fontSize="xs" color="orange.600" mb={1} fontWeight="600">PERFORMANCE SCORE</Text>
                                  <Text fontSize="3xl" fontWeight="bold" color="orange.500">87.5</Text>
                                  <Text fontSize="xs" color="orange.500" mt={1}>Excellent</Text>
                                </Box>
                              </VStack>
                            </CardBody>
                          </Card>
                        </SimpleGrid>

                        {/* Team Performance Table */}
                        <Card 
                          borderRadius="7px" 
                          border="1px" 
                          borderColor={useColorModeValue('gray.200', 'gray.600')}
                          bg={useColorModeValue('white', 'gray.800')}
                          _hover={{ 
                            borderColor: 'green.300', 
                            boxShadow: 'md', 
                            transform: 'translateY(-1px)'
                          }}
                          transition="all 0.2s"
                        >
                          <CardHeader>
                            <Flex justify="space-between" align="center">
                              <Heading size="md" color="gray.800">Team Member Performance</Heading>
                              <Badge colorScheme="blue" variant="solid">
                                {teamPerformance.memberDetails?.length || 0} Members
                              </Badge>
                            </Flex>
                          </CardHeader>
                          <CardBody>
                            <TableContainer>
                              <Table variant="simple" size="sm">
                                <Thead>
                                  <Tr>
                                    <Th>Coach Name</Th>
                                    <Th>Performance Score</Th>
                                    <Th>Leads</Th>
                                    <Th>Sales</Th>
                                    <Th>Revenue</Th>
                                    <Th>Status</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {teamPerformance.memberDetails?.map((member, index) => (
                                    <Tr key={member.coachId || index}>
                                      <Td>
                                        <VStack align="start" spacing={0}>
                                          <Text fontSize="sm" fontWeight="bold">{member.name}</Text>
                                          <Text fontSize="xs" color="gray.500">{member.email}</Text>
                                        </VStack>
                                      </Td>
                                      <Td>
                                        <HStack spacing={2}>
                                          <CircularProgress
                                            value={member.performance?.score || 0}
                                            size="30px"
                                            color={member.performance?.score >= 80 ? 'green.400' : 
                                                   member.performance?.score >= 40 ? 'yellow.400' : 'red.400'}
                                            thickness="6px"
                                          >
                                            <CircularProgressLabel fontSize="10px" fontWeight="bold">
                                              {member.performance?.score || 0}
                                            </CircularProgressLabel>
                                          </CircularProgress>
                                          <Text fontSize="xs" color="gray.600">
                                            {member.performance?.score >= 80 ? 'Excellent' :
                                             member.performance?.score >= 40 ? 'Good' : 'Needs Help'}
                                          </Text>
                                        </HStack>
                                      </Td>
                                      <Td>
                                        <VStack align="start" spacing={0}>
                                          <Text fontSize="sm" fontWeight="bold">{member.leads?.total || 0}</Text>
                                          <Text fontSize="xs" color="green.600">
                                            {member.leads?.converted || 0} converted
                                          </Text>
                                        </VStack>
                                      </Td>
                                      <Td>
                                        <VStack align="start" spacing={0}>
                                          <Text fontSize="sm" fontWeight="bold">{member.sales?.total || 0}</Text>
                                          <Text fontSize="xs" color="blue.600">
                                            {(member.leads?.total > 0 ? 
                                              ((member.leads?.converted || 0) / member.leads?.total * 100) : 0).toFixed(1)}% rate
                                          </Text>
                                        </VStack>
                                      </Td>
                                      <Td>
                                        <Text fontSize="sm" fontWeight="bold" color="green.600">
                                          ${member.revenue?.total || 0}
                                        </Text>
                                      </Td>
                                      <Td>
                                        <Badge 
                                          colorScheme={member.performance?.isActive ? 'green' : 'red'}
                                          fontSize="xs"
                                        >
                                          {member.performance?.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </TableContainer>
                          </CardBody>
                        </Card>
                      </VStack>
                    ) : (
                      <Card bg="gray.50" borderRadius="7px" border="2px dashed" borderColor="gray.300">
                        <CardBody py={12}>
                          <Center>
                            <VStack spacing={4}>
                              <Box
                                w="80px"
                                h="80px"
                                bg="gray.200"
                                borderRadius="7px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                color="gray.500"
                              >
                                <Text fontSize="3xl">📊</Text>
                              </Box>
                              <VStack spacing={2}>
                                <Text fontSize="lg" fontWeight="semibold" color="gray.600">
                                  No Performance Data Available
                                </Text>
                                <Text color="gray.500" textAlign="center" fontSize="sm">
                                  Performance analytics will appear once your team starts generating activity and sales data.
                                </Text>
                              </VStack>
                              <Button 
                                colorScheme="blue" 
                                onClick={fetchTeamPerformance}
                                isLoading={loading}
                                leftIcon={<RepeatIcon />}
                              >
                                Load Performance Data
                              </Button>
                            </VStack>
                          </Center>
                        </CardBody>
                      </Card>
                    )}
                  </VStack>
                </TabPanel>

 
             

                {/* Commissions Tab - Professional MLM Commission Management */}
                <TabPanel p={6}>
                  <VStack spacing={6} align="stretch">
                    {/* Header Section */}
                    <Flex justify="space-between" align="start" direction={{ base: 'column', lg: 'row' }} gap={4}>
                      <VStack align="start" spacing={1}>
                        <Heading size="md" color="gray.800">Commission Management</Heading>
                        <Text fontSize="sm" color="gray.600">
                          Track earnings, payouts, and commission breakdowns from your MLM network
                        </Text>
                      </VStack>
                      
                      <HStack spacing={2}>
                        <Select 
                          w="160px" 
                          bg="white"
                          borderColor="gray.300"
                          _hover={{ borderColor: 'gray.400' }}
                          size="sm"
                          borderRadius="7px"
                        >
                          <option value="all">💰 All Types</option>
                          <option value="direct">👤 Direct</option>
                          <option value="indirect">👥 Indirect</option>
                          <option value="bonus">🎯 Bonus</option>
                        </Select>
                        
                        <Button 
                          leftIcon={<FiDownload />} 
                          colorScheme="green" 
                          size="sm"
                          borderRadius="7px"
                          _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                          transition="all 0.2s"
                        >
                          Download Statement
                        </Button>
                        
                        <Button 
                          leftIcon={<RepeatIcon />} 
                          colorScheme="gray" 
                          onClick={fetchCommissions}
                          isLoading={loading}
                          size="sm"
                          borderRadius="7px"
                          variant="outline"
                          _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                          transition="all 0.2s"
                        >
                          Refresh
                        </Button>
                      </HStack>
                    </Flex>

                    {/* Commission Summary Cards */}
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                      <StatsCard 
                        title="TOTAL EARNED" 
                        value={`₹${commissionSummary.totalEarned || 0}`} 
                        icon={<FiDollarSign size="24px" />} 
                        color="green"
                        trend="All time earnings"
                      />
                      <StatsCard 
                        title="PENDING" 
                        value={`₹${commissionSummary.pendingAmount || 0}`} 
                        icon={<FiClock size="24px" />} 
                        color="yellow"
                        trend="Awaiting payout"
                      />
                      <StatsCard 
                        title="THIS MONTH" 
                        value={`₹${(commissionSummary.totalEarned || 0) * 0.3}`} 
                        icon={<FiTrendingUp size="24px" />} 
                        color="blue"
                        trend="Current month"
                      />
                      <StatsCard 
                        title="COMMISSIONS" 
                        value={commissionSummary.totalCommissions || 0} 
                        icon={<FiAward size="24px" />} 
                        color="purple"
                        trend="Total transactions"
                      />
                    </SimpleGrid>

                    {/* Sample Commission List */}
                    <Card borderRadius="7px" border="1px" borderColor="gray.200">
                      <CardHeader>
                        <Flex justify="space-between" align="center">
                          <Heading size="sm" color="gray.800">Recent Commissions</Heading>
                          <HStack spacing={2}>
                            <Badge colorScheme="green" fontSize="xs">Paid</Badge>
                            <Badge colorScheme="yellow" fontSize="xs">Pending</Badge>
                            <Badge colorScheme="blue" fontSize="xs">Processing</Badge>
                          </HStack>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        {loading ? (
                          <VStack spacing={3}>
                            {[1, 2, 3, 4].map(i => (
                              <Skeleton key={i} height="60px" borderRadius="7px" />
                            ))}
                          </VStack>
                        ) : commissions.length > 0 ? (
                          <VStack spacing={3} align="stretch">
                            {commissions.map((commission, index) => (
                              <HStack 
                                key={commission._id || index} 
                                p={3} 
                                bg="gray.50" 
                                borderRadius="7px" 
                                justify="space-between"
                                _hover={{ bg: 'gray.100', transition: 'all 0.2s' }}
                              >
                                <HStack spacing={3}>
                                  <Box 
                                    w="8" 
                                    h="8" 
                                    bg={commission.type === 'direct' ? 'green.100' : 
                                        commission.type === 'indirect' ? 'blue.100' : 
                                        'purple.100'} 
                                    borderRadius="7px" 
                                    display="flex" 
                                    alignItems="center" 
                                    justifyContent="center"
                                  >
                                    <Text fontSize="sm">
                                      {commission.type === 'direct' ? '💰' : 
                                       commission.type === 'indirect' ? '👥' : '🎯'}
                                    </Text>
                                  </Box>
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.800">
                                      {commission.sourceName || commission.description || 'Commission'}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {new Date(commission.date || commission.createdAt || Date.now()).toLocaleDateString()} • 
                                      {commission.type || 'Direct'} • 
                                      Level {commission.level || 1}
                                    </Text>
                                  </VStack>
                                </HStack>
                                
                                <VStack align="end" spacing={1}>
                                  <Text fontSize="md" fontWeight="700" color="green.600">
                                    ₹{commission.amount || 0}
                                  </Text>
                                  <Badge 
                                    colorScheme={
                                      commission.status === 'paid' ? 'green' : 
                                      commission.status === 'pending' ? 'yellow' : 
                                      'blue'
                                    } 
                                    fontSize="xs"
                                  >
                                    {commission.status || 'pending'}
                                  </Badge>
                                </VStack>
                              </HStack>
                            ))}
                          </VStack>
                        ) : (
                          <VStack py={8} spacing={3}>
                            <Box 
                              w="16" 
                              h="16" 
                              bg="gray.100" 
                              borderRadius="50%" 
                              display="flex" 
                              alignItems="center" 
                              justifyContent="center"
                            >
                              <FiDollarSign size="32px" color="gray.400" />
                            </Box>
                            <VStack spacing={1}>
                              <Text fontSize="lg" fontWeight="600" color="gray.700">
                                No commissions yet
                              </Text>
                              <Text fontSize="sm" color="gray.500" textAlign="center">
                                Start building your team to earn commissions from sales and network growth
                              </Text>
                            </VStack>
                            <Button 
                              colorScheme="blue" 
                              size="sm" 
                              borderRadius="7px"
                              leftIcon={<FiUsers />}
                            >
                              View Team Structure
                            </Button>
                          </VStack>
                        )}
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* Real Reports Tab - Direct Access to Reports */}
                <TabPanel p={6}>
                  <VStack spacing={6} align="stretch">
                    {/* Header Section */}
                    <Flex justify="space-between" align="start" direction={{ base: 'column', lg: 'row' }} gap={4}>
                      <VStack align="start" spacing={1}>
                        <Heading size="md" color="gray.800">Real Reports Dashboard</Heading>
                        <Text fontSize="sm" color="gray.600">
                          Direct access to all your business reports and analytics
                        </Text>
                      </VStack>
                      
                      <HStack spacing={2}>
                        <Button 
                          leftIcon={<FiFileText />} 
                          colorScheme="blue" 
                          onClick={onReportModalOpen}
                          size="sm"
                          borderRadius="7px"
                          _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                          transition="all 0.2s"
                        >
                          Generate Report
                        </Button>
                        <Button 
                          leftIcon={<FiRefreshCw />} 
                          colorScheme="green" 
                          onClick={fetchReports}
                          isLoading={loading}
                          size="sm"
                          borderRadius="7px"
                          _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                          transition="all 0.2s"
                        >
                          Refresh
                        </Button>
                        <Button 
                          leftIcon={<FiDownload />} 
                          colorScheme="purple" 
                          onClick={() => {
                            console.log('📥 Download button clicked');
                            // Add your download logic here
                          }}
                          size="sm"
                          borderRadius="7px"
                          _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                          transition="all 0.2s"
                        >
                          Download
                        </Button>
                      </HStack>
                    </Flex>

                    {/* Quick Stats */}
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                      <StatsCard 
                        title="TOTAL REPORTS" 
                        value={reports.length} 
                        icon="📊"
                        color="blue"
                        trend="Available"
                      />
                      
                      <StatsCard 
                        title="REVENUE" 
                        value="₹2.4L" 
                        icon="💰"
                        color="green"
                        trend="+18%"
                      />
                      
                      <StatsCard 
                        title="TEAM" 
                        value="156" 
                        icon="👥"
                        color="purple"
                        trend="Members"
                      />
                      
                      <StatsCard 
                        title="GROWTH" 
                        value="24%" 
                        icon="📈"
                        color="orange"
                        trend="Monthly"
                      />
                    </SimpleGrid>

                    {/* All Reports Grid */}
                    <VStack spacing={4} align="stretch">
                      <Heading size="sm" color="gray.800">All Available Reports</Heading>
                      
                      {loading ? (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                          {Array(6).fill(0).map((_, i) => (
                            <Card 
                              key={i} 
                              borderRadius="7px" 
                              border="1px" 
                              borderColor={useColorModeValue('gray.200', 'gray.600')}
                              bg={useColorModeValue('white', 'gray.800')}
                            >
                              <CardBody>
                                <SkeletonText noOfLines={4} spacing="4" />
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      ) : reports.length > 0 ? (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                          {reports.map((report, index) => {
                            const getReportColor = (type) => {
                              switch(type) {
                                case 'team_summary': return 'blue';
                                case 'performance_analysis': return 'purple';
                                case 'coach_activity': return 'orange';
                                case 'commission_report': return 'green';
                                case 'individual_performance': return 'green';
                                case 'downline_analysis': return 'blue';
                                case 'comparison_report': return 'purple';
                                case 'trend_analysis': return 'orange';
                                case 'goal_tracking': return 'red';
                                default: return 'gray';
                              }
                            };
                            
                            const reportColor = getReportColor(report.reportType);
                            const cardBgColor = useColorModeValue('white', 'gray.800');
                            const cardBorderColor = useColorModeValue('gray.200', 'gray.600');
                            
                            return (
                            <Card 
                              key={report._id || index} 
                              bg={cardBgColor}
                              border="1px" 
                              borderColor={cardBorderColor}
                              borderRadius="7px"
                              _hover={{ 
                                borderColor: `${reportColor}.300`, 
                                boxShadow: 'md', 
                                transform: 'translateY(-2px)',
                                bg: useColorModeValue(`${reportColor}.50`, `${reportColor}.900`)
                              }}
                              transition="all 0.2s"
                              cursor="pointer"
                            >
                              <CardBody p={4}>
                                <VStack spacing={3} align="stretch">
                                  <HStack justify="space-between">
                                    <Box 
                                      w="10" 
                                      h="10" 
                                      bg={useColorModeValue(`${reportColor}.100`, `${reportColor}.800`)}
                                      borderRadius="7px" 
                                      display="flex" 
                                      alignItems="center" 
                                      justifyContent="center"
                                    >
                                      <Text fontSize="sm" color={useColorModeValue(`${reportColor}.600`, `${reportColor}.300`)}>
                                        {
                                          report.reportType === 'team_summary' ? '👥' : 
                                          report.reportType === 'performance_analysis' ? '📈' : 
                                          report.reportType === 'coach_activity' ? '⚡' : 
                                          report.reportType === 'commission_report' ? '💰' :
                                          report.reportType === 'individual_performance' ? '🎯' :
                                          report.reportType === 'downline_analysis' ? '🌐' :
                                          report.reportType === 'comparison_report' ? '📊' :
                                          report.reportType === 'trend_analysis' ? '📉' :
                                          report.reportType === 'goal_tracking' ? '🎯' :
                                          '📊'
                                        }
                                      </Text>
                                    </Box>
                                    <Badge 
                                      colorScheme={
                                        report.status === 'completed' ? 'green' : 
                                        report.status === 'processing' ? 'yellow' : 
                                        'gray'
                                      } 
                                      fontSize="xs"
                                      variant="solid"
                                      borderRadius="7px"
                                      px={2}
                                      py={1}
                                    >
                                      {report.status || 'completed'}
                                    </Badge>
                                  </HStack>
                                  
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.800" noOfLines={2}>
                                      {report.name || 'Business Report'}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {report.reportType ? report.reportType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General'} • 
                                      {report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : 'Today'}
                                    </Text>
                                    <Text fontSize="xs" color="blue.600">
                                      {report.fileSize || '2.1 MB'}
                                    </Text>
                                  </VStack>
                                  
                                  <HStack spacing={2}>
                                    <Button 
                                      size="xs" 
                                      colorScheme="blue" 
                                      variant="outline"
                                      flex={1}
                                      onClick={() => openReportDetail(report)}
                                    >
                                      View
                                    </Button>
                                    <Button 
                                      size="xs" 
                                      colorScheme="green" 
                                      variant="outline"
                                      onClick={() => downloadReport(report)}
                                    >
                                      <FiDownload size="12px" />
                                    </Button>
                                    <Button 
                                      size="xs" 
                                      colorScheme="red" 
                                      variant="outline"
                                      onClick={() => deleteReport(report)}
                                    >
                                      <FiTrash2 size="12px" />
                                    </Button>
                                  </HStack>
                                </VStack>
                              </CardBody>
                            </Card>
                            );
                          })}
                        </SimpleGrid>
                      ) : (
                        <Card 
                          borderRadius="7px" 
                          border="1px" 
                          borderColor={useColorModeValue('gray.200', 'gray.600')}
                          bg={useColorModeValue('white', 'gray.800')}
                        >
                          <CardBody textAlign="center" py={12}>
                            <VStack spacing={4}>
                              <Box 
                                w="16" 
                                h="16" 
                                bg="gray.100" 
                                borderRadius="50%" 
                                display="flex" 
                                alignItems="center" 
                                justifyContent="center"
                              >
                                <FiFileText size="32px" color="gray.400" />
                              </Box>
                              <VStack spacing={1}>
                                <Text fontSize="lg" fontWeight="600" color="gray.700">
                                  No Reports Available
                                </Text>
                                <Text fontSize="sm" color="gray.500" textAlign="center">
                                  Generate reports to track your business performance
                                </Text>
                              </VStack>
                              <Button 
                                colorScheme="blue" 
                                size="sm" 
                                borderRadius="7px"
                                onClick={onReportModalOpen}
                              >
                                Generate Report
                              </Button>
                            </VStack>
                          </CardBody>
                        </Card>
                      )}
                    </VStack>
                  </VStack>
                </TabPanel>

                {/* Real Reports Tab - Professional Report Management */}
            

                {/* Admin Requests Tab - Professional UI */}
                <TabPanel p={0}>
                  <Box bg="gray.50" minH="100vh" py={6} px={6}>
                    <Box maxW="full" mx="auto">
                      <VStack spacing={6} align="stretch" w="full">
                        {/* Main Header Card */}
                        <Card 
                          bg="white" 
                          backdropFilter="blur(20px)" 
                          borderRadius="7px" 
                          border="1px solid" 
                          borderColor="gray.200"
                          boxShadow="sm"
                        >
                          {/* Header with Title and Actions */}
                          <CardHeader py={4} px={6} borderBottom="1px" borderColor="gray.100">
                            <Flex justify="space-between" align="center">
                              <VStack align="start" spacing={1}>
                                <Heading fontSize="2xl" fontWeight="700" color="gray.800" letterSpacing="-0.5px">
                                  Admin Requests Management
                                </Heading>
                                <Text fontSize="sm" color="gray.600">
                                  Track and manage hierarchy change requests, sponsor changes, and administrative approvals
                                </Text>
                              </VStack>
                              
                              <HStack spacing={2}>
                                <Select 
                                  w="180px" 
                                  bg="white"
                                  borderColor="gray.300"
                                  _hover={{ borderColor: 'gray.400' }}
                                  size="sm"
                                  borderRadius="7px"
                                >
                                  <option value="all">📋 All Requests</option>
                                  <option value="pending">⏳ Pending</option>
                                  <option value="approved">✅ Approved</option>
                                  <option value="rejected">❌ Rejected</option>
                                </Select>
                                
                                <Button 
                                  leftIcon={<AddIcon />} 
                                  colorScheme="blue" 
                                  onClick={() => setShowAdminRequestForm(true)}
                                  size="sm"
                                  borderRadius="7px"
                                  _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                                  transition="all 0.2s"
                                >
                                  New Request
                                </Button>
                                
                                <Button 
                                  leftIcon={<RepeatIcon />} 
                                  colorScheme="gray" 
                                  onClick={() => {
                                    console.log('🔄 Refresh button clicked - calling fetchAdminRequests manually');
                                    fetchAdminRequests();
                                  }} 
                                  isLoading={loading}
                                  size="sm"
                                  borderRadius="7px"
                                  variant="outline"
                                  _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                                  transition="all 0.2s"
                                >
                                  Refresh
                                </Button>
                              </HStack>
                            </Flex>
                          </CardHeader>
                        </Card>

                    {/* Quick Stats */}
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                          <StatsCard 
                            title="TOTAL REQUESTS" 
                            value={adminRequests.length} 
                            icon={<FiBriefcase size="24px" />} 
                            color="blue"
                            trend="All time"
                          />
                          <StatsCard 
                            title="PENDING" 
                            value={adminRequests.filter(r => r.status === 'pending').length} 
                            icon={<FiClock size="24px" />} 
                            color="yellow"
                            trend="Awaiting review"
                          />
                          <StatsCard 
                            title="APPROVED" 
                            value={adminRequests.filter(r => r.status === 'approved').length} 
                            icon={<FiCheckCircle size="24px" />} 
                            color="green"
                            trend="Completed"
                          />
                          <StatsCard 
                            title="REJECTED" 
                            value={adminRequests.filter(r => r.status === 'rejected').length} 
                            icon={<FiXCircle size="24px" />} 
                            color="red"
                            trend="Declined"
                          />
                        </SimpleGrid>

                    {/* Admin Requests List */}
                    
                    {/* Simplified rendering logic */}
                    {loading && (
                      <VStack spacing={4}>
                        {[1, 2, 3].map(i => (
                          <Card key={i} borderRadius="7px" border="1px" borderColor="gray.200">
                            <CardBody>
                              <SkeletonText noOfLines={4} spacing="4" />
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    )}
                    
                    {!loading && adminRequests.length > 0 && (
                      <VStack spacing={6} align="stretch">
                        {adminRequests.map((request, index) => {
                          const isOwnRequest = request.coachId?._id === effectiveAuth.coachId;
                          const statusColor = {
                            pending: 'yellow',
                            approved: 'green', 
                            rejected: 'red'
                          }[request.status] || 'gray';
                          
                          return (
                            <Card 
                              key={request._id || index} 
                              borderRadius="12px" 
                              border="1px" 
                              borderColor={useColorModeValue(`${statusColor}.200`, `${statusColor}.700`)}
                              bg={useColorModeValue('white', 'gray.800')}
                              boxShadow={useColorModeValue('0 1px 3px rgba(0,0,0,0.1)', '0 1px 3px rgba(0,0,0,0.3)')}
                              transition="all 0.2s"
                              _hover={{ 
                                borderColor: useColorModeValue(`${statusColor}.300`, `${statusColor}.600`),
                                boxShadow: useColorModeValue('0 4px 6px rgba(0,0,0,0.1)', '0 4px 6px rgba(0,0,0,0.4)')
                              }}
                            >
                              <CardBody p={6}>
                                <VStack align="stretch" spacing={5}>
                                  {/* Request Header */}
                                  <Flex justify="space-between" align="start">
                                    <VStack align="start" spacing={3} flex={1}>
                                      <HStack spacing={3}>
                                        <Box 
                                          px={3} 
                                          py={1.5} 
                                          bg={useColorModeValue(`${statusColor}.100`, `${statusColor}.900`)}
                                          borderRadius="8px"
                                          border="1px"
                                          borderColor={useColorModeValue(`${statusColor}.200`, `${statusColor}.700`)}
                                        >
                                          <Text 
                                            fontSize="xs" 
                                            fontWeight="700" 
                                            color={useColorModeValue(`${statusColor}.700`, `${statusColor}.300`)}
                                            letterSpacing="0.5px"
                                          >
                                            {request.status?.toUpperCase() || 'PENDING'}
                                          </Text>
                                        </Box>
                                        
                                        <Box 
                                          px={3} 
                                          py={1.5} 
                                          bg={useColorModeValue(isOwnRequest ? 'blue.50' : 'orange.50', isOwnRequest ? 'blue.900' : 'orange.900')}
                                          borderRadius="8px"
                                          border="1px"
                                          borderColor={useColorModeValue(isOwnRequest ? 'blue.200' : 'orange.200', isOwnRequest ? 'blue.700' : 'orange.700')}
                                        >
                                          <Text 
                                            fontSize="xs" 
                                            fontWeight="600" 
                                            color={useColorModeValue(isOwnRequest ? 'blue.700' : 'orange.700', isOwnRequest ? 'blue.300' : 'orange.300')}
                                            letterSpacing="0.3px"
                                          >
                                            {isOwnRequest ? 'MY REQUEST' : 'DOWNLINE REQUEST'}
                                          </Text>
                                        </Box>
                                      </HStack>
                                      
                                      <Heading 
                                        size="md" 
                                        fontWeight="700" 
                                        color={useColorModeValue('gray.800', 'gray.100')}
                                        letterSpacing="-0.3px"
                                      >
                                        {request.requestType?.replace(/_/g, ' ').toUpperCase() || 'HIERARCHY CHANGE'}
                                      </Heading>
                                      
                                      <Text 
                                        fontSize="sm" 
                                        color={useColorModeValue('gray.600', 'gray.400')}
                                        lineHeight="1.5"
                                      >
                                        {request.reason || request.description || 'No description provided'}
                                      </Text>
                                    </VStack>
                                    
                                    <VStack align="end" spacing={2}>
                                      <Text 
                                        fontSize="xs" 
                                        fontWeight="600" 
                                        color={useColorModeValue('gray.500', 'gray.400')}
                                      >
                                        {new Date(request.createdAt || request.submittedAt).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short', 
                                          day: 'numeric'
                                        })}
                                      </Text>
                                      <Text 
                                        fontSize="xs" 
                                        color={useColorModeValue('gray.400', 'gray.500')}
                                      >
                                        {new Date(request.createdAt || request.submittedAt).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </Text>
                                    </VStack>
                                  </Flex>

                                  {/* Coach Information */}
                                  {!isOwnRequest && request.coachId && (
                                    <HStack 
                                      p={4} 
                                      bg={useColorModeValue('orange.50', 'orange.900/20')} 
                                      borderRadius="10px" 
                                      spacing={4}
                                      border="1px"
                                      borderColor={useColorModeValue('orange.200', 'orange.700')}
                                    >
                                      <Avatar 
                                        size="md" 
                                        name={request.coachId.name} 
                                        bg={useColorModeValue('orange.200', 'orange.700')}
                                        color={useColorModeValue('orange.800', 'orange.200')}
                                        fontWeight="600"
                                      />
                                      <VStack align="start" spacing={1} flex={1}>
                                        <Text 
                                          fontSize="sm" 
                                          fontWeight="700" 
                                          color={useColorModeValue('orange.800', 'orange.200')}
                                          letterSpacing="-0.2px"
                                        >
                                          {request.coachId.name}
                                        </Text>
                                        <HStack spacing={2}>
                                          <Text 
                                            fontSize="xs" 
                                            fontWeight="600" 
                                            color={useColorModeValue('orange.600', 'orange.300')}
                                          >
                                            {request.coachId.selfCoachId}
                                          </Text>
                                          <Text 
                                            fontSize="xs" 
                                            color={useColorModeValue('orange.400', 'orange.400')}
                                          >
                                            •
                                          </Text>
                                          <Text 
                                            fontSize="xs" 
                                            color={useColorModeValue('orange.600', 'orange.300')}
                                          >
                                            {request.coachId.email}
                                          </Text>
                                        </HStack>
                                      </VStack>
                                    </HStack>
                                  )}

                                  {/* Request Details */}
                                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                                    <Box 
                                      p={4} 
                                      bg={useColorModeValue('gray.50', 'gray.900')} 
                                      borderRadius="10px"
                                      border="1px"
                                      borderColor={useColorModeValue('gray.200', 'gray.700')}
                                    >
                                      <HStack spacing={2} mb={3}>
                                        <Box 
                                          w={1} 
                                          h={4} 
                                          bg={useColorModeValue('gray.400', 'gray.500')} 
                                          borderRadius="2px"
                                        />
                                        <Text 
                                          fontSize="xs" 
                                          fontWeight="700" 
                                          color={useColorModeValue('gray.600', 'gray.400')}
                                          letterSpacing="0.5px"
                                        >
                                          CURRENT DATA
                                        </Text>
                                      </HStack>
                                      <VStack align="start" spacing={2}>
                                        {request.currentData?.selfCoachId && (
                                          <HStack spacing={2}>
                                            <Text 
                                              fontSize="xs" 
                                              fontWeight="600" 
                                              color={useColorModeValue('gray.500', 'gray.400')}
                                              minW="80px"
                                            >
                                              Coach ID:
                                            </Text>
                                            <Text 
                                              fontSize="xs" 
                                              color={useColorModeValue('gray.700', 'gray.300')}
                                              fontWeight="500"
                                            >
                                              {request.currentData.selfCoachId}
                                            </Text>
                                          </HStack>
                                        )}
                                        {request.currentData?.currentLevel && (
                                          <HStack spacing={2}>
                                            <Text 
                                              fontSize="xs" 
                                              fontWeight="600" 
                                              color={useColorModeValue('gray.500', 'gray.400')}
                                              minW="80px"
                                            >
                                              Level:
                                            </Text>
                                            <Text 
                                              fontSize="xs" 
                                              color={useColorModeValue('gray.700', 'gray.300')}
                                              fontWeight="500"
                                            >
                                              {request.currentData.currentLevel}
                                            </Text>
                                          </HStack>
                                        )}
                                        {request.currentData?.sponsorId && (
                                          <HStack spacing={2}>
                                            <Text 
                                              fontSize="xs" 
                                              fontWeight="600" 
                                              color={useColorModeValue('gray.500', 'gray.400')}
                                              minW="80px"
                                            >
                                              Sponsor:
                                            </Text>
                                            <Text 
                                              fontSize="xs" 
                                              color={useColorModeValue('gray.700', 'gray.300')}
                                              fontWeight="500"
                                            >
                                              {request.currentData.sponsorId}
                                            </Text>
                                          </HStack>
                                        )}
                                      </VStack>
                                    </Box>
                                    
                                    <Box 
                                      p={4} 
                                      bg={useColorModeValue('blue.50', 'blue.900/20')} 
                                      borderRadius="10px"
                                      border="1px"
                                      borderColor={useColorModeValue('blue.200', 'blue.700')}
                                    >
                                      <HStack spacing={2} mb={3}>
                                        <Box 
                                          w={1} 
                                          h={4} 
                                          bg={useColorModeValue('blue.500', 'blue.400')} 
                                          borderRadius="2px"
                                        />
                                        <Text 
                                          fontSize="xs" 
                                          fontWeight="700" 
                                          color={useColorModeValue('blue.600', 'blue.400')}
                                          letterSpacing="0.5px"
                                        >
                                          REQUESTED CHANGES
                                        </Text>
                                      </HStack>
                                      <VStack align="start" spacing={2}>
                                        {request.requestedData?.sponsorId && (
                                          <HStack spacing={2}>
                                            <Text 
                                              fontSize="xs" 
                                              fontWeight="600" 
                                              color={useColorModeValue('blue.500', 'blue.400')}
                                              minW="80px"
                                            >
                                              New Sponsor:
                                            </Text>
                                            <Text 
                                              fontSize="xs" 
                                              color={useColorModeValue('blue.700', 'blue.300')}
                                              fontWeight="600"
                                            >
                                              {request.requestedData.sponsorId}
                                            </Text>
                                          </HStack>
                                        )}
                                        {request.requestedData?.currentLevel && (
                                          <HStack spacing={2}>
                                            <Text 
                                              fontSize="xs" 
                                              fontWeight="600" 
                                              color={useColorModeValue('blue.500', 'blue.400')}
                                              minW="80px"
                                            >
                                              New Level:
                                            </Text>
                                            <Text 
                                              fontSize="xs" 
                                              color={useColorModeValue('blue.700', 'blue.300')}
                                              fontWeight="600"
                                            >
                                              {request.requestedData.currentLevel}
                                            </Text>
                                          </HStack>
                                        )}
                                        {request.requestedData?.selfCoachId && (
                                          <HStack spacing={2}>
                                            <Text 
                                              fontSize="xs" 
                                              fontWeight="600" 
                                              color={useColorModeValue('blue.500', 'blue.400')}
                                              minW="80px"
                                            >
                                              New Coach ID:
                                            </Text>
                                            <Text 
                                              fontSize="xs" 
                                              color={useColorModeValue('blue.700', 'blue.300')}
                                              fontWeight="600"
                                            >
                                              {request.requestedData.selfCoachId}
                                            </Text>
                                          </HStack>
                                        )}
                                      </VStack>
                                    </Box>
                                  </SimpleGrid>

                                  {/* Admin Response */}
                                  {request.adminNotes && (
                                    <Box 
                                      p={4} 
                                      bg={useColorModeValue('green.50', 'green.900/20')} 
                                      borderRadius="10px"
                                      border="1px"
                                      borderColor={useColorModeValue('green.200', 'green.700')}
                                    >
                                      <HStack spacing={2} mb={3}>
                                        <Box 
                                          w={1} 
                                          h={4} 
                                          bg={useColorModeValue('green.500', 'green.400')} 
                                          borderRadius="2px"
                                        />
                                        <Text 
                                          fontSize="xs" 
                                          fontWeight="700" 
                                          color={useColorModeValue('green.700', 'green.400')}
                                          letterSpacing="0.5px"
                                        >
                                          ADMIN RESPONSE
                                        </Text>
                                      </HStack>
                                      <Text 
                                        fontSize="sm" 
                                        color={useColorModeValue('green.800', 'green.200')}
                                        lineHeight="1.6"
                                        fontWeight="500"
                                      >
                                        {request.adminNotes}
                                      </Text>
                                      {request.processedAt && (
                                        <Text 
                                          fontSize="xs" 
                                          color={useColorModeValue('green.600', 'green.400')} 
                                          mt={3}
                                          fontWeight="600"
                                        >
                                          Processed on {new Date(request.processedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short', 
                                            day: 'numeric'
                                          })}
                                        </Text>
                                      )}
                                    </Box>
                                  )}

                                  {/* Action Buttons */}
                                  {request.status === 'pending' && isOwnRequest && (
                                    <Flex justify="end" spacing={3}>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        colorScheme="gray"
                                        borderRadius="8px"
                                        fontWeight="600"
                                        fontSize="xs"
                                        px={4}
                                        _hover={{
                                          bg: useColorModeValue('gray.50', 'gray.700')
                                        }}
                                      >
                                        Edit Request
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        colorScheme="red"
                                        borderRadius="8px"
                                        fontWeight="600"
                                        fontSize="xs"
                                        px={4}
                                        _hover={{
                                          bg: useColorModeValue('red.50', 'red.900/20')
                                        }}
                                      >
                                        Cancel Request
                                      </Button>
                                    </Flex>
                                  )}
                                </VStack>
                              </CardBody>
                            </Card>
                          );
                        })}
                      </VStack>
                    )}
                    
                    {!loading && adminRequests.length === 0 && (
                      /* No Admin Requests Found State */
                      <Card borderRadius="7px" border="1px" borderColor="gray.200">
                        <CardBody>
                          <Center py={12}>
                            <VStack spacing={6}>
                              <Box 
                                w="80px"
                                h="80px"
                                bg="gray.200"
                                borderRadius="7px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                color="gray.500"
                              >
                                <Text fontSize="3xl">📋</Text>
                              </Box>
                              <VStack spacing={2}>
                                <Text fontSize="lg" fontWeight="semibold" color="gray.600">
                                  No Admin Requests Found
                                </Text>
                                <Text color="gray.500" textAlign="center" fontSize="sm">
                                  You haven't submitted any admin requests yet. Create your first request to change your hierarchy or sponsor.
                                </Text>
                              </VStack>
                              <Button 
                                colorScheme="blue" 
                                onClick={() => setShowAdminRequestForm(true)}
                                leftIcon={<AddIcon />}
                              >
                                Create First Request
                              </Button>
                            </VStack>
                          </Center>
                        </CardBody>
                      </Card>
                    )}
                      </VStack>
                    </Box>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Card>

      {/* Enhanced Add Coach Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose} size="2xl">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="7px" maxH="90vh" overflowY="auto">
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="blue.100" borderRadius="7px" color="blue.600">
                <AddIcon />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold">➕ Add New Team Coach</Text>
                <Text fontSize="sm" color="gray.500">Expand your network with a new team member</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={addCoach}>
            <ModalBody>
              <VStack spacing={6} align="stretch">
                {/* Personal Information Section */}
                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={4} color="gray.700">
                    👤 Personal Information
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel color="gray.700">Full Name</FormLabel>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter full name"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.700">Email Address</FormLabel>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter email address"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.700">Password</FormLabel>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter secure password"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.700">Coach ID (Unique)</FormLabel>
                      <Input
                        value={formData.selfCoachId}
                        onChange={(e) => handleInputChange('selfCoachId', e.target.value.toUpperCase())}
                        placeholder="Enter unique Coach ID (e.g., COACH123)"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        textTransform="uppercase"
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        This must be a unique identifier for the coach
                      </Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700">Level</FormLabel>
                      <NumberInput
                        min={1}
                        max={12}
                        value={formData.currentLevel}
                        onChange={(_, value) => handleInputChange('currentLevel', value)}
                        bg="white"
                      >
                        <NumberInputField 
                          borderColor="gray.300"
                          _hover={{ borderColor: 'gray.400' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* Location Information Section */}
                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={4} color="gray.700">
                    Location Information
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel color="gray.700">City</FormLabel>
                      <Input
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter city"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700">Country</FormLabel>
                      <Input
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        placeholder="Enter country"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* Professional Information Section */}
                <Box>
                  <Text fontSize="md" fontWeight="semibold" mb={4} color="gray.700">
                    💼 Professional Information
                  </Text>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel color="gray.700">Company/Organization</FormLabel>
                      <Input
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Company or organization name"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                      />
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel color="gray.700">Team Rank</FormLabel>
                        <Input
                          value={formData.teamRankName}
                          onChange={(e) => handleInputChange('teamRankName', e.target.value)}
                          placeholder="Team rank designation"
                          bg="white"
                          borderColor="gray.300"
                          _hover={{ borderColor: 'gray.400' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel color="gray.700">Experience (Years)</FormLabel>
                        <NumberInput
                          min={0}
                          max={50}
                          value={formData.experienceYears}
                          onChange={(_, value) => handleInputChange('experienceYears', value)}
                          bg="white"
                        >
                          <NumberInputField 
                            borderColor="gray.300"
                            _hover={{ borderColor: 'gray.400' }}
                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </SimpleGrid>

                    <FormControl>
                      <FormLabel color="gray.700">Bio/Description</FormLabel>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Brief description about the coach and their expertise"
                        rows={3}
                        resize="vertical"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700">Specializations</FormLabel>
                      <Input
                        value={formData.specializations}
                        onChange={(e) => handleInputChange('specializations', e.target.value)}
                        placeholder="e.g., Leadership, Sales, Marketing (comma separated)"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Separate multiple specializations with commas
                      </Text>
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700">Status</FormLabel>
                      <HStack spacing={3}>
                        <Switch
                          isChecked={formData.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          colorScheme="blue"
                        />
                        <Text color="gray.700" fontWeight="medium">
                          {formData.isActive ? 'Active Coach' : 'Inactive Coach'}
                        </Text>
                      </HStack>
                    </FormControl>
                  </VStack>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter bg="gray.50" borderBottomRadius="2xl">
              <ButtonGroup spacing={4}>
                <Button 
                  variant="ghost" 
                  onClick={onAddModalClose} 
                  disabled={loading}
                  color="gray.600"
                  _hover={{ bg: 'gray.100' }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  bg="blue.500"
                  color="white"
                  isLoading={loading}
                  loadingText="Adding Coach..."
                  leftIcon={<AddIcon />}
                  _hover={{ bg: 'blue.600' }}
                  _active={{ bg: 'blue.700' }}
                  px={8}
                >
                  ➕ Add Coach to Team
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Enhanced Edit Coach Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="2xl">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="7px" maxH="90vh" overflowY="auto">
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="orange.100" borderRadius="7px" color="orange.600">
                <EditIcon />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="bold">Edit Coach Profile</Text>
                <Text fontSize="sm" color="gray.500">Update coach information and settings</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={updateCoach}>
            <ModalBody>
              <VStack spacing={6} align="stretch">
                {/* Basic Information */}
                <Box>
                  <Heading size="sm" color="gray.700" mb={4}>👤 Basic Information</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel color="gray.700">Full Name</FormLabel>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        placeholder="Enter coach name"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.700">Email Address</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        placeholder="coach@example.com"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700">Phone Number</FormLabel>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        placeholder="+1 234 567 8900"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700">Self Coach ID</FormLabel>
                      <Input
                        name="selfCoachId"
                        value={formData.selfCoachId}
                        onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        placeholder="Unique coach identifier"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                {/* Location Information */}
                <Box>
                  <Heading size="sm" color="gray.700" mb={4}>📍 Location Information</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel color="gray.700">City</FormLabel>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        placeholder="New York"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700">Country</FormLabel>
                      <Input
                        name="country"
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        placeholder="United States"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700">Company</FormLabel>
                      <Input
                        name="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        placeholder="Company name"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700">Experience (Years)</FormLabel>
                      <Input
                        name="experienceYears"
                        type="number"
                        value={formData.experienceYears}
                        onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: parseInt(e.target.value) || 0 }))}
                        placeholder="5"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                {/* Professional Information */}
                <Box>
                  <Heading size="sm" color="gray.700" mb={4}>💼 Professional Information</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel color="gray.700">Current Level</FormLabel>
                      <Select
                        name="currentLevel"
                        value={formData.currentLevel}
                        onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: parseInt(e.target.value) }))}
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      >
                        <option value={1}>Level 1</option>
                        <option value={2}>Level 2</option>
                        <option value={3}>Level 3</option>
                        <option value={4}>Level 4</option>
                        <option value={5}>Level 5</option>
                        <option value={6}>Level 6</option>
                        <option value={7}>Level 7</option>
                        <option value={8}>Level 8</option>
                        <option value={9}>Level 9</option>
                        <option value={10}>Level 10</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700">Status</FormLabel>
                      <Select
                        name="isActive"
                        value={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value === 'true' }))}
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      >
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700">Team Rank</FormLabel>
                      <Input
                        name="teamRankName"
                        value={formData.teamRankName}
                        onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        placeholder="Team rank name"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="gray.700">President Team Rank</FormLabel>
                      <Input
                        name="presidentTeamRankName"
                        value={formData.presidentTeamRankName}
                        onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                        placeholder="President team rank"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                {/* Specializations */}
                <Box>
                  <Heading size="sm" color="gray.700" mb={4}>🎯 Specializations</Heading>
                  <FormControl>
                    <FormLabel color="gray.700">Specializations (comma-separated)</FormLabel>
                    <Input
                      name="specializations"
                      value={formData.specializations}
                      onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                      placeholder="Sales, Marketing, Leadership"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                    />
                  </FormControl>
                </Box>

                {/* Bio */}
                <Box>
                  <Heading size="sm" color="gray.700" mb={4}>📝 Bio / Description</Heading>
                  <FormControl>
                    <FormLabel color="gray.700">Bio</FormLabel>
                    <Textarea
                      name="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                      placeholder="Tell us about this coach..."
                      rows={4}
                      resize="none"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                    />
                  </FormControl>
                </Box>

                {/* Password Reset */}
                <Box>
                  <Heading size="sm" color="gray.700" mb={4}>🔐 Password Reset</Heading>
                  <FormControl>
                    <FormLabel color="gray.700">New Password (leave empty to keep current)</FormLabel>
                    <Input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                      placeholder="Enter new password only if you want to change it"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                    />
                  </FormControl>
                </Box>

                <Box p={4} bg="orange.50" borderRadius="7px" border="1px" borderColor="orange.200">
                  <HStack spacing={3}>
                    <Box color="orange.500">●</Box>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="bold" color="orange.800">
                        🔄 Complete Edit Access
                      </Text>
                      <Text fontSize="xs" color="orange.700">
                        You can now update ALL coach information. Password field is optional - only fill if you want to change the password.
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter bg="gray.50" borderBottomRadius="2xl">
              <ButtonGroup spacing={4}>
                <Button 
                  variant="ghost" 
                  onClick={onEditModalClose} 
                  disabled={loading}
                  color="gray.600"
                  _hover={{ bg: 'gray.100' }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  bg="orange.500"
                  color="white"
                  isLoading={loading}
                  loadingText="Updating Coach..."
                  leftIcon={<EditIcon />}
                  _hover={{ bg: 'orange.600' }}
                  _active={{ bg: 'orange.700' }}
                  px={8}
                >
                   Update Coach Profile
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Enhanced Generate Report Modal */}
      <Modal isOpen={isReportModalOpen} onClose={onReportModalClose} size="lg">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="7px">
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="blue.100" borderRadius="7px" color="blue.600">
                <Box as={FiFileText} />
              </Box>
              <VStack align="start" spacing={0}>
                                  <Text fontSize="lg" fontWeight="bold">Generate Team Report</Text>
                <Text fontSize="sm" color="gray.500">Create comprehensive analytics and insights</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={generateReport}>
            <ModalBody>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel color="gray.700">Report Type</FormLabel>
                  <Select
                    value={reportConfig.reportType}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, reportType: e.target.value }))}
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'gray.400' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  >
                    <option value="team_summary">Team Summary Report</option>
                    <option value="performance_analysis">Performance Analysis</option>
                    <option value="coach_activity">Coach Activity Report</option>
                    <option value="commission_report">Commission Report</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.700">Time Period</FormLabel>
                  <Select
                    value={reportConfig.period}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, period: e.target.value }))}
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'gray.400' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                  >
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                    <option value="quarterly">Quarterly Report</option>
                    <option value="yearly">Yearly Report</option>
                  </Select>
                </FormControl>

                <SimpleGrid columns={2} spacing={4}>
                  <FormControl>
                    <FormLabel color="gray.700">Start Date</FormLabel>
                    <Input
                      type="date"
                      value={reportConfig.startDate}
                      onChange={(e) => setReportConfig(prev => ({ ...prev, startDate: e.target.value }))}
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700">End Date</FormLabel>
                    <Input
                      type="date"
                      value={reportConfig.endDate}
                      onChange={(e) => setReportConfig(prev => ({ ...prev, endDate: e.target.value }))}
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    />
                  </FormControl>
                </SimpleGrid>

                <Box p={4} bg="blue.50" borderRadius="7px" border="1px" borderColor="blue.200">
                  <HStack spacing={3}>
                    <Box color="blue.500">●</Box>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="bold" color="blue.800">
                        Report Generation Info
                      </Text>
                      <Text fontSize="xs" color="blue.700">
                        Reports typically take 1-3 minutes to generate. You'll receive a notification when ready.
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter bg="gray.50" borderBottomRadius="2xl">
              <ButtonGroup spacing={4}>
                <Button 
                  variant="ghost" 
                  onClick={onReportModalClose} 
                  disabled={loading}
                  color="gray.600"
                  _hover={{ bg: 'gray.100' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="blue.500"
                  color="white"
                  isLoading={loading}
                  loadingText="Generating..."
                  leftIcon={<Box as={FiFileText} />}
                  _hover={{ bg: 'blue.600' }}
                  _active={{ bg: 'blue.700' }}
                  px={8}
                >
                  Generate Report
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <Modal isOpen={isReportDetailOpen} onClose={closeReportDetail} size="xl">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="7px">
          <ModalHeader bg="gray.50" borderBottom="1px" borderColor="gray.200">
            <HStack spacing={4} justifyContent="space-between" w="full">
              <VStack align="start" spacing={2}>
                <HStack spacing={3}>
                  <Box 
                    w="12" 
                    h="12" 
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                    borderRadius="10px" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                    boxShadow="md"
                  >
                    <Box as={FiPieChart} color="white" size="20px" />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Heading size="lg" fontWeight="700" color="gray.800" letterSpacing="-0.5px">
                      {selectedReport?.reportType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Team Summary'}
                    </Heading>
                    <HStack spacing={4}>
                      <HStack spacing={1}>
                        <Box w="2" h="2" bg="blue.500" borderRadius="full" />
                        <Text fontSize="sm" color="gray.600">
                          {selectedReport?.reportPeriod?.period || 'monthly'}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">•</Text>
                      <Text fontSize="sm" color="gray.600">
                        {selectedReport?.generatedAt ? new Date(selectedReport.generatedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : 'N/A'}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              </VStack>
              
              <Menu>
                <MenuButton 
                  as={Button} 
                  rightIcon={<ChevronDownIcon />} 
                  bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  color="white"
                  _hover={{ bg: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
                  size="sm"
                  borderRadius="8px"
                  boxShadow="md"
                  isDisabled={!reportDetail}
                  fontWeight="600"
                >
                  <HStack spacing={2}>
                    <DownloadIcon boxSize={4} />
                    <Text>Download</Text>
                  </HStack>
                </MenuButton>
                <MenuList borderRadius="12px" shadow="xl" border="1px" borderColor="gray.200" py={2}>
                  <MenuItem onClick={() => downloadReportAs('json')} _hover={{ bg: 'blue.50' }} borderRadius="8px" mx={2}>
                    <HStack w="full" justify="space-between">
                      <HStack spacing={3}>
                        <Box w="8" h="8" bg="blue.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                          <Box as={FiFile} color="blue.600" fontSize="16px" />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600" color="gray.800">Download as JSON</Text>
                          <Text fontSize="xs" color="gray.500">Raw data format</Text>
                        </VStack>
                      </HStack>
                      <Tag size="sm" variant="subtle" colorScheme="blue">.json</Tag>
                    </HStack>
                  </MenuItem>
                  <MenuItem onClick={() => downloadReportAs('pdf')} _hover={{ bg: 'red.50' }} borderRadius="8px" mx={2}>
                    <HStack w="full" justify="space-between">
                      <HStack spacing={3}>
                        <Box w="8" h="8" bg="red.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                          <Box as={FiFileText} color="red.600" fontSize="16px" />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600" color="gray.800">Download as PDF</Text>
                          <Text fontSize="xs" color="gray.500">Print-ready format</Text>
                        </VStack>
                      </HStack>
                      <Tag size="sm" variant="subtle" colorScheme="red">.pdf</Tag>
                    </HStack>
                  </MenuItem>
                  <MenuItem onClick={() => downloadReportAs('excel')} _hover={{ bg: 'green.50' }} borderRadius="8px" mx={2}>
                    <HStack w="full" justify="space-between">
                      <HStack spacing={3}>
                        <Box w="8" h="8" bg="green.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                          <Box as={FiGrid} color="green.600" fontSize="16px" />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600" color="gray.800">Download as Excel</Text>
                          <Text fontSize="xs" color="gray.500">Spreadsheet format</Text>
                        </VStack>
                      </HStack>
                      <Tag size="sm" variant="subtle" colorScheme="green">.xlsx</Tag>
                    </HStack>
                  </MenuItem>
                  <MenuItem onClick={() => downloadReportAs('word')} _hover={{ bg: 'blue.50' }} borderRadius="8px" mx={2}>
                    <HStack w="full" justify="space-between">
                      <HStack spacing={3}>
                        <Box w="8" h="8" bg="blue.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                          <Box as={FiFileText} color="blue.600" fontSize="16px" />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600" color="gray.800">Download as Word</Text>
                          <Text fontSize="xs" color="gray.500">Document format</Text>
                        </VStack>
                      </HStack>
                      <Tag size="sm" variant="subtle" colorScheme="blue">.docx</Tag>
                    </HStack>
                  </MenuItem>
                  <MenuDivider my={2} />
                  <MenuItem onClick={() => downloadReportAs('csv')} _hover={{ bg: 'purple.50' }} borderRadius="8px" mx={2}>
                    <HStack w="full" justify="space-between">
                      <HStack spacing={3}>
                        <Box w="8" h="8" bg="purple.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                          <Box as={FiList} color="purple.600" fontSize="16px" />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600" color="gray.800">Download as CSV</Text>
                          <Text fontSize="xs" color="gray.500">Data analysis format</Text>
                        </VStack>
                      </HStack>
                      <Tag size="sm" variant="subtle" colorScheme="purple">.csv</Tag>
                    </HStack>
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loading && !reportDetail ? (
              <VStack spacing={4} align="stretch">
                <Skeleton height="24px" />
                <Skeleton height="120px" />
                <Skeleton height="24px" />
                <Skeleton height="200px" />
              </VStack>
            ) : reportDetail ? (
              <VStack spacing={6} align="stretch">
                {/* Status Cards */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Card 
                    bg="white" 
                    borderRadius="12px" 
                    border="1px" 
                    borderColor="gray.200" 
                    boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                    _hover={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    transition="all 0.2s"
                  >
                    <CardBody py={6}>
                      <VStack align="start" spacing={3}>
                        <HStack>
                          <Box 
                            w="3" 
                            h="3" 
                            bg={reportDetail.status === 'completed' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : reportDetail.status === 'generating' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'} 
                            borderRadius="full" 
                            boxShadow="sm"
                          />
                          <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Report Status</Text>
                        </HStack>
                        <VStack align="start" spacing={2}>
                          <Text fontSize="2xl" fontWeight="800" color="gray.800">
                            {reportDetail.status === 'completed' ? 'Completed' : reportDetail.status === 'generating' ? 'Generating' : 'Failed'}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {reportDetail.status === 'completed' ? 'Report is ready for download' : reportDetail.status === 'generating' ? 'Report is being processed' : 'Report generation failed'}
                          </Text>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                  
                  <Card 
                    bg="white" 
                    borderRadius="12px" 
                    border="1px" 
                    borderColor="gray.200" 
                    boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                    _hover={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    transition="all 0.2s"
                  >
                    <CardBody py={6}>
                      <VStack align="start" spacing={3}>
                        <HStack>
                          <Box 
                            w="3" 
                            h="3" 
                            bg="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" 
                            borderRadius="full" 
                            boxShadow="sm"
                          />
                          <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Time Period</Text>
                        </HStack>
                        <VStack align="start" spacing={2}>
                          <Text fontSize="2xl" fontWeight="800" color="gray.800">
                            {reportDetail.reportPeriod?.period || 'monthly'}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Report coverage duration
                          </Text>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                  
                  <Card 
                    bg="white" 
                    borderRadius="12px" 
                    border="1px" 
                    borderColor="gray.200" 
                    boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                    _hover={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    transition="all 0.2s"
                  >
                    <CardBody py={6}>
                      <VStack align="start" spacing={3}>
                        <HStack>
                          <Box 
                            w="3" 
                            h="3" 
                            bg="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" 
                            borderRadius="full" 
                            boxShadow="sm"
                          />
                          <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Generated On</Text>
                        </HStack>
                        <VStack align="start" spacing={2}>
                          <Text fontSize="2xl" fontWeight="800" color="gray.800">
                            {reportDetail.generatedAt ? new Date(reportDetail.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Report creation date
                          </Text>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
                {/* Individual Metrics Card */}
                <Card 
                  bg="white" 
                  borderRadius="12px" 
                  border="1px" 
                  borderColor="gray.200" 
                  boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                  _hover={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                  transition="all 0.2s"
                >
                  <CardHeader 
                    bg="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" 
                    borderBottom="none"
                    borderRadius="12px 12px 0 0"
                    py={4}
                  >
                    <HStack spacing={3}>
                      <Box 
                        w="10" 
                        h="10" 
                        bg="rgba(255, 255, 255, 0.2)" 
                        borderRadius="8px" 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                        backdropFilter="blur(10px)"
                      >
                        <Box as={FiUser} color="white" size="20px" />
                      </Box>
                      <VStack align="start" spacing={1}>
                        <Heading size="md" color="white" fontWeight="700">Individual Performance</Heading>
                        <Text fontSize="xs" color="rgba(255, 255, 255, 0.8)">Personal achievements & metrics</Text>
                      </VStack>
                    </HStack>
                  </CardHeader>
                  <CardBody py={8}>
                    {renderReportContent(reportDetail)}
                  </CardBody>
                </Card>
                {/* Team Metrics Card */}
                <Card 
                  bg="white" 
                  borderRadius="12px" 
                  border="1px" 
                  borderColor="gray.200" 
                  boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                  _hover={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                  transition="all 0.2s"
                >
                  <CardHeader 
                    bg="linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                    borderBottom="none"
                    borderRadius="12px 12px 0 0"
                    py={4}
                  >
                    <HStack spacing={3}>
                      <Box 
                        w="10" 
                        h="10" 
                        bg="rgba(255, 255, 255, 0.2)" 
                        borderRadius="8px" 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                        backdropFilter="blur(10px)"
                      >
                        <Box as={FiUsers} color="white" size="20px" />
                      </Box>
                      <VStack align="start" spacing={1}>
                        <Heading size="md" color="white" fontWeight="700">Team Performance</Heading>
                        <Text fontSize="xs" color="rgba(255, 255, 255, 0.8)">Collective achievements & growth</Text>
                      </VStack>
                    </HStack>
                  </CardHeader>
                  <CardBody py={8}>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
                      <VStack align="start" spacing={3}>
                        <Box>
                          <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Team Size</Text>
                          <HStack spacing={2} align="baseline">
                            <Text fontSize="3xl" fontWeight="800" color="gray.800" lineHeight="1">{reportDetail.reportData?.teamMetrics?.teamSize || 0}</Text>
                            <Box w="1.5" h="1.5" bg="green.500" borderRadius="full" />
                          </HStack>
                          <Text fontSize="xs" color="gray.600">Active team members</Text>
                        </Box>
                      </VStack>
                      <VStack align="start" spacing={3}>
                        <Box>
                          <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Team Leads</Text>
                          <HStack spacing={2} align="baseline">
                            <Text fontSize="3xl" fontWeight="800" color="blue.600" lineHeight="1">{reportDetail.reportData?.teamMetrics?.teamLeads || 0}</Text>
                            <Box w="1.5" h="1.5" bg="blue.500" borderRadius="full" />
                          </HStack>
                          <Text fontSize="xs" color="gray.600">Total leads generated</Text>
                        </Box>
                      </VStack>
                      <VStack align="start" spacing={3}>
                        <Box>
                          <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Team Sales</Text>
                          <HStack spacing={2} align="baseline">
                            <Text fontSize="3xl" fontWeight="800" color="purple.600" lineHeight="1">{reportDetail.reportData?.teamMetrics?.teamSales || 0}</Text>
                            <Box w="1.5" h="1.5" bg="purple.500" borderRadius="full" />
                          </HStack>
                          <Text fontSize="xs" color="gray.600">Total conversions</Text>
                        </Box>
                      </VStack>
                      <VStack align="start" spacing={3}>
                        <Box>
                          <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Team Revenue</Text>
                          <HStack spacing={2} align="baseline">
                            <Text fontSize="3xl" fontWeight="800" color="orange.600" lineHeight="1">₹{(reportDetail.reportData?.teamMetrics?.teamRevenue || 0).toLocaleString()}</Text>
                            <Box w="1.5" h="1.5" bg="orange.500" borderRadius="full" />
                          </HStack>
                          <Text fontSize="xs" color="gray.600">Combined team income</Text>
                        </Box>
                      </VStack>
                    </SimpleGrid>
                    {reportDetail.reportData?.summary && (
                      <Box mt={6}>
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                          <VStack align="start">
                            <Text fontSize="sm" color="gray.600" fontWeight="600">Total Revenue</Text>
                            <Text fontSize="xl" fontWeight="700" color="gray.800">₹{reportDetail.reportData.summary.totalRevenue?.toLocaleString() || 0}</Text>
                          </VStack>
                          <VStack align="start">
                            <Text fontSize="sm" color="gray.600" fontWeight="600">Total Leads</Text>
                            <Text fontSize="xl" fontWeight="700" color="blue.600">{reportDetail.reportData.summary.totalLeads || 0}</Text>
                          </VStack>
                          <VStack align="start">
                            <Text fontSize="sm" color="gray.600" fontWeight="600">Total Sales</Text>
                            <Text fontSize="xl" fontWeight="700" color="purple.600">{reportDetail.reportData.summary.totalSales || 0}</Text>
                          </VStack>
                          <VStack align="start">
                            <Text fontSize="sm" color="gray.600" fontWeight="600">Overall Conversion</Text>
                            <Text fontSize="xl" fontWeight="700" color="green.600">{reportDetail.reportData.summary.overallConversionRate?.toFixed(1) || 0}%</Text>
                          </VStack>
                        </SimpleGrid>
                      </Box>
                    )}
                  </CardBody>
                </Card>
                
                {/* Growth Comparisons */}
                {reportDetail.reportData?.comparisons?.previousPeriod && (
                  <Card 
                    bg="white" 
                    borderRadius="12px" 
                    border="1px" 
                    borderColor="gray.200" 
                    boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                    _hover={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    transition="all 0.2s"
                  >
                    <CardHeader 
                      bg="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" 
                      borderBottom="none"
                      borderRadius="12px 12px 0 0"
                      py={4}
                    >
                      <HStack spacing={3}>
                        <Box 
                          w="10" 
                          h="10" 
                          bg="rgba(255, 255, 255, 0.2)" 
                          borderRadius="8px" 
                          display="flex" 
                          alignItems="center" 
                          justifyContent="center"
                          backdropFilter="blur(10px)"
                        >
                          <Box as={FiTrendingUp} color="white" size="20px" />
                        </Box>
                        <VStack align="start" spacing={1}>
                          <Heading size="md" color="white" fontWeight="700">Growth Analysis</Heading>
                          <Text fontSize="xs" color="rgba(255, 255, 255, 0.8)">Performance vs previous period</Text>
                        </VStack>
                      </HStack>
                    </CardHeader>
                    <CardBody py={8}>
                      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
                        <VStack align="start" spacing={3}>
                          <Box>
                            <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Leads Growth</Text>
                            <HStack spacing={2} align="baseline">
                              <Text fontSize="3xl" fontWeight="800" color={reportDetail.reportData.comparisons.previousPeriod.leadsGrowth >= 0 ? 'green.600' : 'red.600'} lineHeight="1">
                                {reportDetail.reportData.comparisons.previousPeriod.leadsGrowth >= 0 ? '+' : ''}{reportDetail.reportData.comparisons.previousPeriod.leadsGrowth.toFixed(1)}%
                              </Text>
                              <Box 
                                w="6" 
                                h="6" 
                                bg={reportDetail.reportData.comparisons.previousPeriod.leadsGrowth >= 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'} 
                                borderRadius="full" 
                                display="flex" 
                                alignItems="center" 
                                justifyContent="center"
                              >
                                <Text color="white" fontSize="xs" fontWeight="bold">
                                  {reportDetail.reportData.comparisons.previousPeriod.leadsGrowth >= 0 ? '↑' : '↓'}
                                </Text>
                              </Box>
                            </HStack>
                            <Text fontSize="xs" color="gray.600">Lead generation change</Text>
                          </Box>
                        </VStack>
                        <VStack align="start" spacing={3}>
                          <Box>
                            <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Sales Growth</Text>
                            <HStack spacing={2} align="baseline">
                              <Text fontSize="3xl" fontWeight="800" color={reportDetail.reportData.comparisons.previousPeriod.salesGrowth >= 0 ? 'green.600' : 'red.600'} lineHeight="1">
                                {reportDetail.reportData.comparisons.previousPeriod.salesGrowth >= 0 ? '+' : ''}{reportDetail.reportData.comparisons.previousPeriod.salesGrowth.toFixed(1)}%
                              </Text>
                              <Box 
                                w="6" 
                                h="6" 
                                bg={reportDetail.reportData.comparisons.previousPeriod.salesGrowth >= 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'} 
                                borderRadius="full" 
                                display="flex" 
                                alignItems="center" 
                                justifyContent="center"
                              >
                                <Text color="white" fontSize="xs" fontWeight="bold">
                                  {reportDetail.reportData.comparisons.previousPeriod.salesGrowth >= 0 ? '↑' : '↓'}
                                </Text>
                              </Box>
                            </HStack>
                            <Text fontSize="xs" color="gray.600">Sales performance change</Text>
                          </Box>
                        </VStack>
                        <VStack align="start" spacing={3}>
                          <Box>
                            <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Revenue Growth</Text>
                            <HStack spacing={2} align="baseline">
                              <Text fontSize="3xl" fontWeight="800" color={reportDetail.reportData.comparisons.previousPeriod.revenueGrowth >= 0 ? 'green.600' : 'red.600'} lineHeight="1">
                                {reportDetail.reportData.comparisons.previousPeriod.revenueGrowth >= 0 ? '+' : ''}{reportDetail.reportData.comparisons.previousPeriod.revenueGrowth.toFixed(1)}%
                              </Text>
                              <Box 
                                w="6" 
                                h="6" 
                                bg={reportDetail.reportData.comparisons.previousPeriod.revenueGrowth >= 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'} 
                                borderRadius="full" 
                                display="flex" 
                                alignItems="center" 
                                justifyContent="center"
                              >
                                <Text color="white" fontSize="xs" fontWeight="bold">
                                  {reportDetail.reportData.comparisons.previousPeriod.revenueGrowth >= 0 ? '↑' : '↓'}
                                </Text>
                              </Box>
                            </HStack>
                            <Text fontSize="xs" color="gray.600">Revenue performance change</Text>
                          </Box>
                        </VStack>
                        <VStack align="start" spacing={3}>
                          <Box>
                            <Text fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">Conversion Change</Text>
                            <HStack spacing={2} align="baseline">
                              <Text fontSize="3xl" fontWeight="800" color={reportDetail.reportData.comparisons.previousPeriod.conversionChange >= 0 ? 'green.600' : 'red.600'} lineHeight="1">
                                {reportDetail.reportData.comparisons.previousPeriod.conversionChange >= 0 ? '+' : ''}{reportDetail.reportData.comparisons.previousPeriod.conversionChange.toFixed(1)}%
                              </Text>
                              <Box 
                                w="6" 
                                h="6" 
                                bg={reportDetail.reportData.comparisons.previousPeriod.conversionChange >= 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'} 
                                borderRadius="full" 
                                display="flex" 
                                alignItems="center" 
                                justifyContent="center"
                              >
                                <Text color="white" fontSize="xs" fontWeight="bold">
                                  {reportDetail.reportData.comparisons.previousPeriod.conversionChange >= 0 ? '↑' : '↓'}
                                </Text>
                              </Box>
                            </HStack>
                            <Text fontSize="xs" color="gray.600">Conversion rate change</Text>
                          </Box>
                        </VStack>
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                )}
                
                {/* Lead Sources Breakdown */}
                {reportDetail.reportData?.breakdown?.leadSources && (
                  <Card bg="white" borderRadius="7px" border="1px" borderColor="gray.200">
                    <CardHeader pb={3}>
                      <Heading size="sm" color="gray.700">Lead Sources</Heading>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                        <VStack align="start">
                          <Text fontSize="xs" color="gray.500">Website</Text>
                          <Text fontWeight="600">{reportDetail.reportData.breakdown.leadSources.website || 0}</Text>
                        </VStack>
                        <VStack align="start">
                          <Text fontSize="xs" color="gray.500">Social Media</Text>
                          <Text fontWeight="600">{reportDetail.reportData.breakdown.leadSources.socialMedia || 0}</Text>
                        </VStack>
                        <VStack align="start">
                          <Text fontSize="xs" color="gray.500">Referrals</Text>
                          <Text fontWeight="600">{reportDetail.reportData.breakdown.leadSources.referrals || 0}</Text>
                        </VStack>
                        <VStack align="start">
                          <Text fontSize="xs" color="gray.500">Ads</Text>
                          <Text fontWeight="600">{reportDetail.reportData.breakdown.leadSources.ads || 0}</Text>
                        </VStack>
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                )}
                
                {/* AI Insights */}
                {reportDetail.reportData?.insights && reportDetail.reportData.insights.length > 0 && (
                  <Card bg="white" borderRadius="7px" border="1px" borderColor="gray.200">
                    <CardHeader pb={3}>
                      <Heading size="sm" color="gray.700" display="flex" alignItems="center">
                        <SunIcon mr={2} color="yellow.500" />
                        AI Insights & Recommendations
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        {reportDetail.reportData.insights.map((insight, index) => (
                          <Alert 
                            key={index} 
                            status={
                              insight.type === 'warning' ? 'warning' : 
                              insight.type === 'performance' ? 'success' : 
                              'info'
                            }
                            variant="subtle" 
                            borderRadius="7px"
                          >
                            <AlertIcon boxSize={4} />
                            <VStack align="start" spacing={1} flex={1}>
                              <Text fontWeight="600" fontSize="sm">{insight.title}</Text>
                              <Text fontSize="xs" color="gray.600">{insight.description}</Text>
                              {insight.actionItems && insight.actionItems.length > 0 && (
                                <VStack align="start" spacing={1} mt={2}>
                                  <Text fontSize="xs" fontWeight="500" color="gray.700">Action Items:</Text>
                                  {insight.actionItems.map((item, itemIndex) => (
                                    <HStack key={itemIndex} spacing={2}>
                                      <CheckCircleIcon boxSize={3} color="green.500" />
                                      <Text fontSize="xs" color="gray.600">{item}</Text>
                                    </HStack>
                                  ))}
                                </VStack>
                              )}
                            </VStack>
                          </Alert>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            ) : (
              <Text color="gray.600">No report details available</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeReportDetail}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Enhanced View Coach Modal */}
      {selectedCoach && (
        <Modal isOpen={isViewModalOpen} onClose={onViewModalClose} size="4xl">
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
          <ModalContent maxH="90vh" overflowY="auto" borderRadius="7px">
            <ModalHeader>
              <HStack spacing={4}>
                <Avatar 
                  size="lg" 
                  name={selectedCoach.name} 
                  bg="blue.500" 
                  color="white"
                  boxShadow="lg"
                />
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color="gray.800">{selectedCoach.name}</Heading>
                  <HStack spacing={2}>
                    <Badge colorScheme={selectedCoach.isActive ? 'green' : 'red'} variant="solid" borderRadius="full">
                      {selectedCoach.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge colorScheme="blue" variant="subtle" borderRadius="full">
                      Level {selectedCoach.currentLevel || 1}
                    </Badge>
                    <Badge colorScheme="purple" variant="outline" borderRadius="full">
                      👤 Coach Profile
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">{selectedCoach.email}</Text>
                </VStack>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={6} align="stretch">
                {/* Quick Actions */}
                <Card bg="gray.50" borderRadius="7px">
                  <CardBody>
                    <ButtonGroup spacing={3} size="sm" w="full" justifyContent="center">
                      <Button
                        leftIcon={<Box as={FiMail} />}
                        colorScheme="blue"
                        variant="outline"
                        _hover={{ bg: 'blue.50' }}
                      >
                        Send Email
                      </Button>
                      <Button
                        leftIcon={<ChatIcon />}
                        colorScheme="green"
                        variant="outline"
                        _hover={{ bg: 'green.50' }}
                      >
                        💬 Send Message
                      </Button>
                      <Button
                        leftIcon={<EditIcon />}
                        colorScheme="orange"
                        variant="outline"
                        onClick={() => {
                          onViewModalClose();
                          openEditModal(selectedCoach);
                        }}
                        _hover={{ bg: 'orange.50' }}
                      >
                        Edit Profile
                      </Button>
                    </ButtonGroup>
                  </CardBody>
                </Card>

                {/* Contact Information */}
                <Card borderRadius="7px" boxShadow="sm">
                  <CardHeader>
                    <Heading size="md" color="gray.800">Contact Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <VStack align="start" spacing={3}>
                        <HStack spacing={3}>
                          <Box p={2} bg="blue.100" borderRadius="7px" color="blue.600">
                            <EmailIcon />
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.500" textTransform="uppercase">Email</Text>
                            <Text fontWeight="medium" color="gray.800">{selectedCoach.email}</Text>
                          </VStack>
                        </HStack>
                        
                        <HStack spacing={3}>
                          <Box p={2} bg="green.100" borderRadius="7px" color="green.600">
                            <PhoneIcon />
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.500" textTransform="uppercase">Phone</Text>
                            <Text fontWeight="medium" color="gray.800">{selectedCoach.phone || 'Not provided'}</Text>
                          </VStack>
                        </HStack>
                      </VStack>

                      <VStack align="start" spacing={3}>
                        <HStack spacing={3}>
                          <Box p={2} bg="purple.100" borderRadius="7px" color="purple.600">
                            <Box as={FiGlobe} />
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.500" textTransform="uppercase">Location</Text>
                            <Text fontWeight="medium" color="gray.800">
                              {[selectedCoach.city, selectedCoach.country].filter(Boolean).join(', ') || 'Not specified'}
                            </Text>
                          </VStack>
                        </HStack>
                        
                        <HStack spacing={3}>
                          <Box p={2} bg="orange.100" borderRadius="7px" color="orange.600">
                            <Box as={FiUser} />
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="xs" color="gray.500" textTransform="uppercase">Company</Text>
                            <Text fontWeight="medium" color="gray.800">{selectedCoach.company || 'Not specified'}</Text>
                          </VStack>
                        </HStack>
                      </VStack>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Performance Metrics */}
                {selectedCoach.performance && (
                  <Card borderRadius="7px" boxShadow="sm">
                    <CardHeader>
                      <Heading size="md" color="gray.800">Performance Metrics</Heading>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <VStack spacing={2}>
                          <CircularProgress 
                            value={selectedCoach.performance.performanceScore || 0}
                            size="80px"
                            color="blue.400"
                            thickness="8px"
                          >
                            <CircularProgressLabel fontSize="lg" fontWeight="bold">
                              {selectedCoach.performance.performanceScore || 0}%
                            </CircularProgressLabel>
                          </CircularProgress>
                          <Text fontSize="sm" fontWeight="medium" color="gray.700">Performance Score</Text>
                        </VStack>

                        <VStack spacing={2}>
                          <Box textAlign="center">
                            <Text fontSize="3xl" fontWeight="bold" color="green.600">
                              {selectedCoach.performance.activityStreak || 0}
                            </Text>
                            <Text fontSize="lg" color="green.600">days</Text>
                          </Box>
                          <Text fontSize="sm" fontWeight="medium" color="gray.700">Activity Streak</Text>
                        </VStack>

                        <VStack spacing={2}>
                          <Box textAlign="center">
                            <Text fontSize="sm" color="gray.500">Last Activity</Text>
                            <Text fontSize="md" fontWeight="bold" color="gray.800">
                              {selectedCoach.performance.lastActivity 
                                ? new Date(selectedCoach.performance.lastActivity).toLocaleDateString()
                                : 'N/A'
                              }
                            </Text>
                          </Box>
                          <Badge 
                            colorScheme={selectedCoach.performance.isActive ? 'green' : 'red'} 
                            variant="subtle"
                            borderRadius="7px"
                            px={3}
                            py={1}
                          >
                            {selectedCoach.performance.isActive ? 'Currently Active' : 'Inactive'}
                          </Badge>
                        </VStack>
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                )}

                {/* Professional Details */}
                <Card borderRadius="7px" boxShadow="sm">
                  <CardHeader>
                    <Heading size="md" color="gray.800">💼 Professional Details</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <VStack align="start" spacing={4}>
                        <Box>
                          <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>Team Rank</Text>
                          <Text fontWeight="medium" color="gray.800">{selectedCoach.teamRankName || 'Not assigned'}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>President Team Rank</Text>
                          <Text fontWeight="medium" color="gray.800">{selectedCoach.presidentTeamRankName || 'Not assigned'}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>Experience</Text>
                          <Text fontWeight="medium" color="gray.800">
                            {selectedCoach.portfolio?.experienceYears || 0} years
                          </Text>
                        </Box>
                      </VStack>

                      <VStack align="start" spacing={4}>
                        <Box>
                          <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>Member Since</Text>
                          <Text fontWeight="medium" color="gray.800">
                            {selectedCoach.createdAt ? new Date(selectedCoach.createdAt).toLocaleDateString() : 'N/A'}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>Current Level</Text>
                          <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3} py={1}>
                            Level {selectedCoach.currentLevel || 1}
                          </Badge>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>Status</Text>
                          <Badge 
                            colorScheme={selectedCoach.isActive ? 'green' : 'red'} 
                            variant="solid"
                            borderRadius="7px"
                            px={3}
                            py={1}
                          >
                            {selectedCoach.isActive ? 'Active Member' : 'Inactive Member'}
                          </Badge>
                        </Box>
                      </VStack>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Bio Section */}
                {selectedCoach.bio && (
                  <Card borderRadius="7px" boxShadow="sm">
                    <CardHeader>
                      <Heading size="md" color="gray.800">Bio & Description</Heading>
                    </CardHeader>
                    <CardBody>
                      <Text color="gray.700" lineHeight="1.6" fontSize="sm">
                        {selectedCoach.bio}
                      </Text>
                    </CardBody>
                  </Card>
                )}

                {/* Specializations */}
                {selectedCoach.portfolio && selectedCoach.portfolio.specializations && selectedCoach.portfolio.specializations.length > 0 && (
                  <Card borderRadius="7px" boxShadow="sm">
                    <CardHeader>
                      <Heading size="md" color="gray.800">Specializations</Heading>
                    </CardHeader>
                    <CardBody>
                      <Wrap spacing={2}>
                        {selectedCoach.portfolio.specializations.map((spec, idx) => (
                          <WrapItem key={idx}>
                            <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={3} py={1}>
                              {spec.name || spec}
                            </Badge>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter bg="gray.50" borderBottomRadius="2xl">
              <ButtonGroup spacing={4}>
                <Button variant="ghost" onClick={onViewModalClose} color="gray.600">
                  Close
                </Button>
                <Button 
                  colorScheme="orange" 
                  leftIcon={<EditIcon />}
                  onClick={() => {
                    onViewModalClose();
                    openEditModal(selectedCoach);
                  }}
                >
                  Edit Coach
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Admin Request Form Modal */}
      <Modal isOpen={showAdminRequestForm} onClose={() => setShowAdminRequestForm(false)} size="lg">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="7px">
          <ModalHeader>
            <HStack spacing={3}>
              <Box p={2} bg="blue.100" borderRadius="7px" color="blue.600">
                <FiUser />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="lg" color="gray.800">Submit Admin Request</Heading>
                <Text fontSize="sm" color="gray.600">Request sponsor ID change</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="7px">
                <AlertIcon />
                <Box>
                  <Text fontWeight="600" color="blue.800">Hierarchy Locking Policy</Text>
                  <Text fontSize="sm" color="blue.700" mt={1}>
                    Your sponsor ID is locked after signup for security. Any changes require admin approval.
                  </Text>
                </Box>
              </Alert>

              <FormControl>
                <FormLabel fontWeight="600" color="gray.700">Request Type</FormLabel>
                <Input value="Sponsor ID Change" isReadOnly bg="gray.50" />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="600" color="gray.700">Search New Sponsor</FormLabel>
                <Input
                  placeholder="Search by name, coach ID, phone, or email..."
                  onChange={(e) => searchSponsors(e.target.value)}
                  bg="white"
                />
                {sponsorSearchResults.length > 0 && (
                  <VStack align="stretch" spacing={2} mt={2} maxH="200px" overflowY="auto">
                    {sponsorSearchResults.map((sponsor) => (
                      <Card
                        key={sponsor._id}
                        p={3}
                        border="1px"
                        borderColor="gray.200"
                        borderRadius="7px"
                        cursor="pointer"
                        onClick={() => {
                          setSelectedSponsor(sponsor);
                          setSponsorSearchResults([]);
                        }}
                        bg={selectedSponsor?._id === sponsor._id ? "blue.50" : "white"}
                        _hover={{ bg: "gray.50" }}
                      >
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="600" color="gray.800">{sponsor.name}</Text>
                            <Text fontSize="xs" color="gray.600">
                              {sponsor.type === 'digital' ? `ID: ${sponsor.displayId}` : `${sponsor.displayId}`}
                            </Text>
                          </VStack>
                          <Badge colorScheme={sponsor.type === 'digital' ? 'blue' : 'green'} variant="subtle">
                            {sponsor.type === 'digital' ? 'Digital System' : 'External'}
                          </Badge>
                        </HStack>
                      </Card>
                    ))}
                  </VStack>
                )}
              </FormControl>

              {selectedSponsor && (
                <Card p={3} bg="green.50" border="1px" borderColor="green.200" borderRadius="7px">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="600" color="green.800">Selected Sponsor</Text>
                      <Text color="green.700">{selectedSponsor.name}</Text>
                      <Text fontSize="xs" color="green.600">
                        {selectedSponsor.type === 'digital' ? `ID: ${selectedSponsor.displayId}` : `${selectedSponsor.displayId}`}
                      </Text>
                    </VStack>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => setSelectedSponsor(null)}
                    >
                      <FiTrash2 />
                    </Button>
                  </HStack>
                </Card>
              )}

              <FormControl>
                <FormLabel fontWeight="600" color="gray.700">Reason for Change</FormLabel>
                <Textarea
                  placeholder="Please explain why you need to change your sponsor ID..."
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  rows={4}
                  resize="none"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup spacing={3}>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowAdminRequestForm(false);
                  setSelectedSponsor(null);
                  setRequestForm({ requestType: 'sponsor_change', requestedSponsorId: '', reason: '' });
                  setSponsorSearchResults([]);
                }}
              >
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={submitAdminRequest}
                isLoading={loading}
                isDisabled={!selectedSponsor || !requestForm.reason.trim()}
              >
                Submit Request
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        onConfirm={async () => {
          // Handle delete confirmation
          onDeleteModalClose();
          toast('Coach deletion confirmed', 'success');
        }}
        title="Delete Coach"
        message="This action cannot be undone. This will permanently remove the coach from your team."
        isLoading={loading}
      />
      </VStack>
    </Box>
  </Box>
);
};

// Add custom CSS animations for the tree structure
const treeStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideDown {
    from {
      height: 0;
      opacity: 0;
    }
    to {
      height: 100%;
      opacity: 1;
    }
  }
  
  @keyframes slideRight {
    from {
      width: 0;
      opacity: 0;
    }
    to {
      width: 100%;
      opacity: 1;
    }
  }
  
  @keyframes expandWidth {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }
  
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(72, 187, 120, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(72, 187, 120, 0);
    }
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes fadeInOut {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
  }
  
  /* Animated Line Drawing Animations */
  @keyframes drawLineVertical {
    from {
      height: 0;
      opacity: 0;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      height: 100%;
      opacity: 1;
    }
  }
  
  @keyframes drawLineHorizontal {
    0% {
      width: 0;
      opacity: 0;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      width: 100%;
      opacity: 1;
    }
  }
  
  @keyframes drawConnectionPoint {
    0% {
      transform: scale(0) rotate(0deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.2) rotate(180deg);
      opacity: 0.7;
    }
    100% {
      transform: scale(1) rotate(360deg);
      opacity: 1;
    }
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .hierarchy-node-container {
    animation: fadeInUp 0.6s ease-out both;
  }
  
  .coach-card {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  .coach-card:hover {
    transform: translateY(-8px) scale(1.03);
  }
  
  /* Animated Connection Lines */
  .connection-line-root {
    animation: drawLineVertical 1.2s ease-out 0.5s both;
  }
  
  .connection-line-horizontal {
    animation: drawLineHorizontal 1.5s ease-out 1s both;
  }
  
  .connection-line-level1 {
    animation: drawLineVertical 1s ease-out 1.2s both;
  }
  
  .connection-line-level2 {
    animation: drawLineVertical 1s ease-out 1.5s both;
  }
  
  .connection-line-level3 {
    animation: drawLineVertical 1s ease-out 1.8s both;
  }
  
  .connection-point {
    animation: drawConnectionPoint 0.8s ease-out both;
  }
  
  .connection-point-level1 {
    animation: drawConnectionPoint 0.8s ease-out 1.3s both;
  }
  
  .connection-point-level2 {
    animation: drawConnectionPoint 0.8s ease-out 1.6s both;
  }
  
  .connection-point-level3 {
    animation: drawConnectionPoint 0.8s ease-out 1.9s both;
  }
  
  /* Tree Container Animation */
  .tree-container {
    animation: fadeInUp 0.8s ease-out 0.2s both;
  }
  
  /* Progressive Node Animation */
  .hierarchy-node-container {
    animation: fadeInUp 0.6s ease-out both;
  }
  
  .hierarchy-node-container:nth-child(1) { animation-delay: 0.3s; }
  .hierarchy-node-container:nth-child(2) { animation-delay: 0.5s; }
  .hierarchy-node-container:nth-child(3) { animation-delay: 0.7s; }
  .hierarchy-node-container:nth-child(4) { animation-delay: 0.9s; }
  .hierarchy-node-container:nth-child(5) { animation-delay: 1.1s; }
  
  /* Head Coach Icon Animation */
  .head-coach-icon {
    animation: drawConnectionPoint 1s ease-out 0.1s both;
  }
`;

// Inject the styles into the document ja
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = treeStyles;
  document.head.appendChild(styleElement);
}

export default MLMDashboard;
