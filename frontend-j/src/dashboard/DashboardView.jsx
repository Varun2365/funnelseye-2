import React, { useState, useEffect } from "react";
import { Doughnut, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title,
  Filler
} from 'chart.js';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCoachId, getToken, debugAuthState } from '../utils/authUtils';
import {
  Box,
  Text,
  Button,
  Spinner,
  Badge,
  Icon,
  Input,
  Select,
  Menu,
  MenuButton,
  MenuList,
  IconButton,
  useToast,
  useColorModeValue,
  useColorMode,
  Progress,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Flex,
  SimpleGrid,
  Tag,
  Skeleton,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { 
  FaRupeeSign, FaClock, FaRegMoneyBillAlt, 
  FaPercentage, FaTrophy, FaExclamationTriangle, 
  FaDownload, FaSyncAlt, FaArrowUp, FaSpinner, FaBell, FaBolt, FaCalendar, FaUser, FaTasks, FaEye, FaChartLine, FaCheckCircle
} from 'react-icons/fa';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { 
  IoStatsChart, IoReceiptOutline, IoWalletOutline, IoBarChart, 
  IoPeopleOutline 
} from 'react-icons/io5';

// Chart.js registration
ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler
);

// API Base URL
import { API_BASE_URL } from '../config/apiConfig';

// Import API service
import { dashboardAPI, handleAPIError } from '../services/api';

const hexToRgba = (hex, alpha = 1) => {
  if (!hex) return `rgba(99, 102, 241, ${alpha})`;
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  if (Number.isNaN(bigint)) return `rgba(99, 102, 241, ${alpha})`;
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const buildColorScale = (baseColor, count = 4) => {
  const base = baseColor || '#0284c7';

  // Convert hex to HSL for better color manipulation
  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h, s, l];
  };

  const hslToHex = (h, s, l) => {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const [h, s, l] = hexToHsl(base);

  // Generate color palette with selected color in the middle
  // Create both darker and lighter variants
  const palette = [];

  // Calculate lightness range: from 0.15 (dark) to 0.85 (light)
  // Selected color should be around 0.5 (middle)
  const minLightness = 0.15;
  const maxLightness = 0.85;
  const midLightness = 0.5; // Selected color position

  if (count === 1) {
    return [base];
  } else if (count === 2) {
    // For 2 colors: darker and lighter version
    palette.push(hslToHex(h, s, Math.max(minLightness, l - 0.2)));
    palette.push(hslToHex(h, s, Math.min(maxLightness, l + 0.2)));
  } else {
    // For 3+ colors: distribute around the selected color
    // Start with darkest, include selected color in middle, end with lightest
    const lightnessRange = maxLightness - minLightness;
    const step = lightnessRange / (count - 1);

    for (let i = 0; i < count; i++) {
      // Calculate lightness: start from darkest and go to lightest
      const targetLightness = minLightness + (step * i);
      // Adjust saturation slightly for darker colors
      const adjustedSaturation = i < count / 2 ? Math.min(1, s + 0.1) : s;
      palette.push(hslToHex(h, adjustedSaturation, targetLightness));
    }
  }

  return palette;
};

// Professional Loading Skeleton Component with Smooth Animations
const ProfessionalLoader = () => {
  return (
    <Box maxW="full" py={8} px={6}>
      <VStack spacing={8} align="stretch">
        {/* Header Section with Professional Animation */}
        <Card 
          bg="white" 
          borderRadius="xl" 
          boxShadow="lg" 
          border="1px" 
          borderColor="gray.200"
          overflow="hidden"
          position="relative"
        >
          <Box
            position="absolute"
            top="0"
            left="-100%"
            width="100%"
            height="100%"
            background="linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)"
            animation="shimmer 2s infinite"
            sx={{
              '@keyframes shimmer': {
                '0%': { left: '-100%' },
                '100%': { left: '100%' }
              }
            }}
          />
          <CardHeader py={6}>
            <VStack spacing={6} align="stretch">
              <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
                <VStack align={{ base: 'center', md: 'start' }} spacing={2}>
                  <Skeleton height="40px" width="400px" borderRadius="lg" />
                  <Skeleton height="20px" width="600px" borderRadius="md" />
                </VStack>
                <HStack spacing={4}>
                  <Skeleton height="40px" width="300px" borderRadius="lg" />
                  <Skeleton height="40px" width="150px" borderRadius="xl" />
                </HStack>
              </Flex>
              
              {/* Professional Stats Cards with Gradient Animation */}
              <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                {[...Array(4)].map((_, i) => (
                  <Card 
                    key={i} 
                    variant="outline"
                    borderRadius="xl"
                    overflow="hidden"
                    position="relative"
                    _hover={{ transform: 'translateY(-2px)', transition: 'all 0.3s' }}
                  >
                    <Box
                      position="absolute"
                      top="0"
                      left="-100%"
                      width="100%"
                      height="100%"
                      background={`linear-gradient(90deg, transparent, ${
                        ['rgba(59, 130, 246, 0.1)', 'rgba(34, 197, 94, 0.1)', 'rgba(251, 146, 60, 0.1)', 'rgba(168, 85, 247, 0.1)'][i]
                      }, transparent)`}
                      animation="shimmer 2.5s infinite"
                      sx={{
                        '@keyframes shimmer': {
                          '0%': { left: '-100%' },
                          '100%': { left: '100%' }
                        }
                      }}
                    />
                    <CardBody p={6}>
                      <HStack spacing={4} align="center" w="full">
                        <Skeleton 
                          height="60px" 
                          width="60px" 
                          borderRadius="xl" 
                          startColor="gray.200"
                          endColor="gray.300"
                        />
                        <VStack align="start" spacing={2} flex={1}>
                          <Skeleton height="16px" width="120px" borderRadius="md" />
                          <Skeleton height="32px" width="80px" borderRadius="lg" />
                        </VStack>
                        <Skeleton height="24px" width="60px" borderRadius="full" />
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </VStack>
          </CardHeader>
        </Card>

        {/* Professional Charts Section */}
        <Box display={{ base: "block", md: "flex" }} gap={6} mb={6}>
          {/* Performance Trends Chart Skeleton */}
          <Card 
            bg="white" 
            borderRadius="xl" 
            boxShadow="lg" 
            border="1px" 
            borderColor="gray.200"
            overflow="hidden"
            position="relative"
            w={{ base: "100%", md: "auto" }}
            flex={{ base: "none", md: "0.7" }}
            mb={{ base: 6, md: 0 }}
          >
            <Box
              position="absolute"
              top="0"
              left="-100%"
              width="100%"
              height="100%"
              background="linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.05), transparent)"
              animation="shimmer 3s infinite"
              sx={{
                '@keyframes shimmer': {
                  '0%': { left: '-100%' },
                  '100%': { left: '100%' }
                }
              }}
            />
            <CardHeader py={6}>
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Skeleton height="32px" width="200px" borderRadius="lg" />
                  <Skeleton height="16px" width="300px" borderRadius="md" />
                </VStack>
                <HStack spacing={3}>
                  <Skeleton height="32px" width="60px" borderRadius="lg" />
                  <Skeleton height="32px" width="60px" borderRadius="lg" />
                </HStack>
              </Flex>
            </CardHeader>
            <CardBody pt={0}>
              <Box h="300px" position="relative">
                <Skeleton height="100%" width="100%" borderRadius="lg" />
              </Box>
            </CardBody>
          </Card>

          {/* Lead Distribution Chart Skeleton */}
          <Card 
            bg="white" 
            borderRadius="xl" 
            boxShadow="lg" 
            border="1px" 
            borderColor="gray.200"
            overflow="hidden"
            position="relative"
            w={{ base: "100%", md: "auto" }}
            flex={{ base: "none", md: "0.3" }}
          >
            <Box
              position="absolute"
              top="0"
              left="-100%"
              width="100%"
              height="100%"
              background="linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.05), transparent)"
              animation="shimmer 3.5s infinite"
              sx={{
                '@keyframes shimmer': {
                  '0%': { left: '-100%' },
                  '100%': { left: '100%' }
                }
              }}
            />
            <CardHeader py={6}>
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Skeleton height="32px" width="180px" borderRadius="lg" />
                  <Skeleton height="16px" width="250px" borderRadius="md" />
                </VStack>
                <HStack spacing={3}>
                  <Skeleton height="32px" width="60px" borderRadius="lg" />
                  <Skeleton height="32px" width="60px" borderRadius="lg" />
                </HStack>
              </Flex>
            </CardHeader>
            <CardBody pt={0}>
              <Box h="300px" position="relative">
                <Skeleton height="100%" width="100%" borderRadius="lg" />
              </Box>
              <VStack spacing={3} mt={4}>
                {[...Array(4)].map((_, i) => (
                  <HStack key={i} spacing={2} w="full">
                    <Skeleton height="12px" width="12px" borderRadius="full" />
                    <Skeleton height="16px" width="120px" borderRadius="md" />
                    <Skeleton height="16px" width="60px" borderRadius="md" ml="auto" />
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </Box>

        {/* Loading Progress Indicator */}
        <Box textAlign="center" py={4}>
          <VStack spacing={3}>
            <HStack spacing={2}>
              <Box
                w="8px"
                h="8px"
                bg="blue.500"
                borderRadius="full"
                animation="pulse 1.4s infinite"
                sx={{
                  '@keyframes pulse': {
                    '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: 0.5 },
                    '40%': { transform: 'scale(1)', opacity: 1 }
                  }
                }}
              />
              <Box
                w="8px"
                h="8px"
                bg="blue.500"
                borderRadius="full"
                animation="pulse 1.4s infinite 0.2s"
                sx={{
                  '@keyframes pulse': {
                    '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: 0.5 },
                    '40%': { transform: 'scale(1)', opacity: 1 }
                  }
                }}
              />
              <Box
                w="8px"
                h="8px"
                bg="blue.500"
                borderRadius="full"
                animation="pulse 1.4s infinite 0.4s"
                sx={{
                  '@keyframes pulse': {
                    '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: 0.5 },
                    '40%': { transform: 'scale(1)', opacity: 1 }
                  }
                }}
              />
            </HStack>
            <Text color="gray.500" fontSize="sm" fontWeight="medium">
              Loading your amazing dashboard...
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};
// Bubble Background Component
const BubbleBackground = () => (
  <Box
    position="fixed"
    top={0}
    left={0}
    w="100vw"
    h="100vh"
    overflow="hidden"
    zIndex={-1}
    pointerEvents="none"
    bg="linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)"
  >
    {[...Array(20)].map((_, i) => (
      <Box
        key={i}
        position="absolute"
        w={`${Math.random() * 80 + 30}px`}
        h={`${Math.random() * 80 + 30}px`}
        borderRadius="50%"
        bg="linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%)"
        backdropFilter="blur(10px)"
        animation={`float ${Math.random() * 25 + 15}s ease-in-out infinite`}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 8}s`
        }}
        _before={{
          content: '""',
          position: 'absolute',
          top: '20%',
          left: '20%',
          w: '30%',
          h: '30%',
          borderRadius: '50%',
          bg: 'rgba(102, 126, 234, 0.4)'
        }}
      />
    ))}
    <style>{`
      @keyframes float {
        0%, 100% { 
          transform: translateY(0px) rotate(0deg); 
          opacity: 0.7; 
        }
        25% { 
          transform: translateY(-30px) rotate(90deg); 
          opacity: 0.9; 
        }
        50% { 
          transform: translateY(-60px) rotate(180deg); 
          opacity: 0.5; 
        }
        75% { 
          transform: translateY(-30px) rotate(270deg); 
          opacity: 0.8; 
        }
      }
    `}</style>
  </Box>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const authState = useSelector(state => state.auth);
  const user = authState?.user;
  const token = getToken(authState);
  const toast = useToast();
  const { colorMode } = useColorMode();
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const shadowColor = useColorModeValue('sm', 'dark-lg');

  const formatDateDDMMYYYY = (date) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '--';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  // Coach ID extract
  const coachId = getCoachId(authState);

  // State management
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    leads: null,
    financial: null,
    team: null,
    performance: null,
    trends: null,
    marketing: null,
    calendar: null,
    tasks: null,
    dailyFeed: null,
    funnels: null,
  });
  
  // User context state
  const [userContext, setUserContext] = useState({
    isStaff: false,
    isCoach: false,
    userId: null,
    permissions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Modal state for funnel distribution
  const { isOpen: isFunnelModalOpen, onOpen: onFunnelModalOpen, onClose: onFunnelModalClose } = useDisclosure();
  
  
  // Timeline filter state
  const [trendsTimeFilter, setTrendsTimeFilter] = useState('1W');
  const [leadsTimeFilter, setLeadsTimeFilter] = useState('1M');
  const [trendLineColor, setTrendLineColor] = useState(() => localStorage.getItem('trendLineColor') || '#0284c7');
  const chartColor = trendLineColor || '#0284c7';
  const trendColorOptions = ['#0284c7','#8b5cf6','#22c55e','#f97316','#ef4444','#f59e0b','#ec4899','#94a3b8'];
  const tasksData = dashboardData.tasks || {};
  const totalTasks = tasksData.totalTasks || 0;
  const completedTasks = tasksData.completedTasks ?? tasksData.statusDistribution?.Completed ?? tasksData.statusDistribution?.COMPLETED ?? 0;
  const overdueTasks = tasksData.overdueTasks || 0;
  const upcomingTasks = tasksData.upcomingTasks || 0;
  const inProgressTasks = tasksData.statusDistribution?.['In Progress'] ?? tasksData.statusDistribution?.IN_PROGRESS ?? tasksData.statusDistribution?.Active ?? 0;
  const dueToday = tasksData.dueToday || 0;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const openTasks = Math.max(totalTasks - completedTasks, 0);

  useEffect(() => {
    if (trendLineColor) {
      localStorage.setItem('trendLineColor', trendLineColor);
    }
  }, [trendLineColor]);
  
  // Funnels state for mapping funnelId to funnel name
  const [funnels, setFunnels] = useState([]);
  const [funnelMap, setFunnelMap] = useState({}); // Map funnelId to funnel name

  // No mock data - all data must come from backend
  // Tasks and funnels data are now included in the unified dashboard endpoint

  // Enhanced retry mechanism with exponential backoff
  const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  // Enhanced API call with better error handling
  const safeAPICall = async (apiFunction) => {
    try {
      return await retryWithBackoff(apiFunction);
    } catch (error) {
      console.error(`❌ API call failed:`, error.message);
      
      // Don't show toasts - error page will handle it
      // Just re-throw to let caller handle it properly
      throw error;
    }
  };

  // Fetch all dashboard data with enhanced error handling
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      // Debug authentication state
      console.log('🔐 Auth state:', { user, token, isAuthenticated: !!token && !!user });
      console.log('🔐 Token from Redux:', token);
      console.log('🔐 User from Redux:', user);
      console.log('🔐 Token from localStorage:', localStorage.getItem('token'));
      console.log('🔐 User from localStorage:', localStorage.getItem('user'));
      
      // Check if user is staff or coach
      const userData = user || JSON.parse(localStorage.getItem('user') || '{}');
      console.log('👤 User type check:', {
        isStaff: userData.role === 'staff' || userData.userType === 'staff',
        isCoach: userData.role === 'coach' || userData.userType === 'coach',
        userRole: userData.role,
        userType: userData.userType,
        userId: userData._id || userData.id
      });
      
      // Test token format
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        console.log('🔐 Stored token length:', storedToken.length);
        console.log('🔐 Token starts with:', storedToken.substring(0, 20) + '...');
        console.log('🔐 Token ends with:', '...' + storedToken.substring(storedToken.length - 20));
      }

      // Enhanced authentication check
      if (!token || !user) {
        console.warn('⚠️ Authentication check failed:', { token: !!token, user: !!user });
        
        // Try to get fresh data from localStorage as fallback
        const freshToken = localStorage.getItem('token');
        const freshUser = localStorage.getItem('user');
        
        if (!freshToken || !freshUser) {
          setError('Please login to view dashboard data');
          setLoading(false);
          setRefreshing(false);
          
          // Show login prompt
          toast({
            title: 'Authentication Required',
            description: 'Please login to access the dashboard',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
          return;
        } else {
          console.log('🔄 Using fresh auth data from localStorage');
          // Update the auth state with fresh data
          const parsedUser = JSON.parse(freshUser);
          console.log('🔄 Fresh user data:', parsedUser);
        }
      }

      // Try to fetch real data from API with enhanced error handling
      try {
        // Use the new unified endpoint - includes all data (tasks, funnels, etc.)
        let completeData = null;
        try {
          console.log('🚀 Attempting unified API call...');
          console.log('🔐 Using token:', token ? `${token.substring(0, 20)}...` : 'No token');
          console.log('👤 User data:', user);
          
          completeData = await safeAPICall(
            () => dashboardAPI.getCompleteData()
          );
          console.log('✅ Unified API response:', completeData);
        } catch (completeError) {
          console.log('⚠️ Complete data fetch failed, trying individual endpoints:', completeError.message);
        }

        if (completeData) {
          // Use complete data if available - Map to real API structure
          const apiData = completeData.data || completeData;
          const userCtx = completeData.userContext || {};
          console.log('📊 Processing complete API data:', apiData);
          console.log('👤 User context:', userCtx);
          
          // Set user context
          setUserContext({
            isStaff: userCtx.isStaff || false,
            isCoach: userCtx.isCoach || false,
            userId: userCtx.userId || null,
            permissions: userCtx.permissions || []
          });
          
          // Map data based on user type (Coach vs Staff)
          if (userCtx.isStaff) {
            // Staff dashboard data mapping
            setDashboardData({
              overview: {
                // Staff-specific overview metrics
                staffName: apiData.overview?.staffName || user?.name || 'Staff Member',
                staffEmail: apiData.overview?.staffEmail || user?.email || '',
                period: apiData.overview?.period || 'Last 30 days',
                lastActive: apiData.overview?.lastActive || new Date().toISOString(),
                
                // Lead metrics (staff-specific)
                myAssignedLeads: apiData.overview?.myAssignedLeads || 0,
                myNewLeadsThisPeriod: apiData.overview?.myNewLeadsThisPeriod || 0,
                myNewLeadsToday: apiData.overview?.myNewLeadsToday || 0,
                myLeadsConverted: apiData.overview?.myLeadsConverted || 0,
                myLeadsLost: apiData.overview?.myLeadsLost || 0,
                myConversionRate: apiData.overview?.myConversionRate || '0',
                myLossRate: apiData.overview?.myLossRate || '0',
                myAverageLeadScore: apiData.overview?.myAverageLeadScore || '0',
                myHotLeads: apiData.overview?.myHotLeads || 0,
                myLeadsNeedingFollowUp: apiData.overview?.myLeadsNeedingFollowUp || 0,
                
                // Appointment metrics (staff-specific)
                myTotalAppointments: apiData.overview?.myTotalAppointments || 0,
                myAppointmentsThisPeriod: apiData.overview?.myAppointmentsThisPeriod || 0,
                myAppointmentsToday: apiData.overview?.myAppointmentsToday || 0,
                myCompletedAppointments: apiData.overview?.myCompletedAppointments || 0,
                myCancelledAppointments: apiData.overview?.myCancelledAppointments || 0,
                myNoShowAppointments: apiData.overview?.myNoShowAppointments || 0,
                myUpcomingAppointments: apiData.overview?.myUpcomingAppointments || 0,
                myAppointmentCompletionRate: apiData.overview?.myAppointmentCompletionRate || '0',
                myAppointmentNoShowRate: apiData.overview?.myAppointmentNoShowRate || '0',
                
                // Messaging metrics (staff-specific)
                myTotalMessagesSent: apiData.overview?.myTotalMessagesSent || 0,
                myMessagesSentThisPeriod: apiData.overview?.myMessagesSentThisPeriod || 0,
                myMessagesToday: apiData.overview?.myMessagesToday || 0,
                myWhatsAppMessages: apiData.overview?.myWhatsAppMessages || 0,
                myEmailMessages: apiData.overview?.myEmailMessages || 0,
                myActiveConversations: apiData.overview?.myActiveConversations || 0,
                myTotalContactsMessaged: apiData.overview?.myTotalContactsMessaged || 0,
                myAverageMessagesPerDay: apiData.overview?.myAverageMessagesPerDay || '0'
              },
              
              // Staff performance score
              myPerformanceScore: apiData.myPerformanceScore || null,
              
              // Team performance (leaderboard)
              teamPerformance: apiData.teamPerformance || null,
              
              // Staff tasks
              myTasks: apiData.myTasks || null,
              
              // Staff-specific leads
              leads: apiData.leads || null,
              
              // Staff-specific messaging data
              messaging: apiData.messaging || null,
              
              // Staff-specific appointments
              appointments: apiData.appointments || null,
              
              // Other staff-specific data
              leadsBySource: apiData.leadsBySource || [],
              leadConversionFunnel: apiData.leadConversionFunnel || null,
              topPerformingLeads: apiData.topPerformingLeads || [],
              messagingTrends: apiData.messagingTrends || [],
              mostContactedLeads: apiData.mostContactedLeads || [],
              appointmentStats: apiData.appointmentStats || null,
              upcomingWeekSchedule: apiData.upcomingWeekSchedule || {},
              performanceMetrics: apiData.performanceMetrics || null,
              weeklyTrends: apiData.weeklyTrends || null,
              recentActivity: apiData.recentActivity || [],
              dailyTasks: apiData.dailyTasks || [],
              pendingActions: apiData.pendingActions || null,
              todayAppointments: apiData.todayAppointments || [],
              quickStats: apiData.quickStats || [],
              achievements: apiData.achievements || [],
              weekSummary: apiData.weekSummary || null,
              
              // Financial data not available for staff
              financial: null,
              
              // Other data
              performance: null,
              trends: null,
              marketing: null,
              calendar: null,
              tasks: apiData.tasks || {
                // Fallback for staff if tasks data not available
                totalTasks: 0,
                completedTasks: 0,
                pendingTasks: 0,
                statusDistribution: {},
                stageDistribution: {},
                priorityDistribution: {},
                overdueTasks: 0,
                upcomingTasks: 0
              },
              dailyFeed: null,
              funnels: apiData.funnels || null
            });
          } else {
            // Coach dashboard data mapping (existing logic)
          setDashboardData({
            overview: {
              // Map real overview metrics directly
              totalLeads: apiData.overview?.metrics?.totalLeads || 0,
              convertedLeads: apiData.overview?.metrics?.convertedLeads || 0,
              conversionRate: apiData.overview?.metrics?.conversionRate || 0,
              totalRevenue: apiData.overview?.metrics?.totalRevenue || 0,
              totalAppointments: apiData.overview?.metrics?.totalAppointments || 0,
              completedAppointments: apiData.overview?.metrics?.completedAppointments || 0,
              appointmentCompletionRate: apiData.overview?.metrics?.appointmentCompletionRate || 0,
              totalTasks: apiData.overview?.metrics?.totalTasks || 0,
              completedTasks: apiData.overview?.metrics?.completedTasks || 0,
              taskCompletionRate: apiData.overview?.metrics?.taskCompletionRate || 0,
              avgRevenuePerLead: apiData.overview?.metrics?.avgRevenuePerLead || 0,
              leadGrowth: apiData.overview?.metrics?.leadGrowth || 0,
              quickActions: apiData.overview?.quickActions || []
            },
            leads: {
              // Map real leads data directly
                total: apiData.leads?.total || 0,
                new: apiData.leads?.new || 0,
                contacted: apiData.leads?.contacted || 0,
                qualified: apiData.leads?.qualified || 0,
                converted: apiData.leads?.converted || 0,
                lost: apiData.leads?.lost || 0,
                recentLeads: apiData.leads?.recentLeads || [],
                leadsByStatus: apiData.leads?.leadsByStatus || {},
                leadsBySource: apiData.leads?.leadsBySource || []
            },
            team: {
              // Map real team data directly
              totalStaff: apiData.team?.totalStaff || 0,
                activeStaff: apiData.team?.activeStaff || 0,
                staffPerformance: apiData.team?.staffPerformance || [],
                topPerformer: apiData.team?.topPerformer || null,
                teamAverages: apiData.team?.teamAverages || {}
            },
            financial: {
              // Map real financial data directly
                totalRevenue: apiData.financial?.totalRevenue || 0,
                totalExpenses: apiData.financial?.totalExpenses || 0,
                netProfit: apiData.financial?.netProfit || 0,
                profitMargin: apiData.financial?.profitMargin || 0,
                revenueByMonth: apiData.financial?.revenueByMonth || [],
                topRevenueProducts: apiData.financial?.topRevenueProducts || []
            },
            performance: {
              // Map real performance data directly
                overallScore: apiData.performance?.overallScore || 0,
                trends: apiData.performance?.trends || {}
            },
            marketing: {
              // Map real marketing data directly
                totalCampaigns: apiData.marketing?.totalCampaigns || 0,
                activeCampaigns: apiData.marketing?.activeCampaigns || 0,
                totalAdSpend: apiData.marketing?.totalAdSpend || 0,
                leadsFromMarketing: apiData.marketing?.leadsFromMarketing || 0,
                costPerLead: apiData.marketing?.costPerLead || 0
            },
            calendar: {
              // Map real calendar data directly
                totalAppointments: apiData.calendar?.totalAppointments || 0,
                upcomingAppointments: apiData.calendar?.upcomingAppointments || 0,
                todayAppointments: apiData.calendar?.todayAppointments || 0
            },
            tasks: apiData.tasks || {
              // Fallback if tasks data not available
              totalTasks: 0,
              completedTasks: 0,
              pendingTasks: 0,
              statusDistribution: {},
              stageDistribution: {},
              priorityDistribution: {},
              overdueTasks: 0,
              upcomingTasks: 0
            },
              dailyFeed: apiData.dailyFeed || null,
              funnels: apiData.funnels || null
            });
          }
        } else {
          // API failed - show error and empty state
          console.error('❌ Unified dashboard API failed');
          console.error('❌ API Error details:', completeError);
          
          const errorMessage = completeError?.response?.data?.message || completeError?.message || 'Failed to load dashboard data. Please check your connection and try again.';
          setError(errorMessage);
          setDashboardData({
            overview: null,
            leads: null,
            financial: null,
            team: null,
            performance: null,
            trends: null,
            marketing: null,
            calendar: null,
            tasks: null,
            dailyFeed: null,
          });
          
          // No toast - error page will handle it
          
          setLastSyncTime(new Date());
          setLoading(false);
          setRefreshing(false);
          return;
        }
      } catch (err) {
        console.error('❌ Dashboard fetch error:', err);
        
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch dashboard data. Please try again.';
        setError(errorMessage);
        setDashboardData({
          overview: null,
          leads: null,
          financial: null,
          team: null,
          performance: null,
          trends: null,
          marketing: null,
          calendar: null,
          tasks: null,
          dailyFeed: null,
        });
        
        // No toast - error page will handle it
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('❌ Dashboard fetch error:', err);
      // No toast - error page will handle it
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Offline detection and network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      console.log('🌐 Back online - attempting to sync data');
      toast({
        title: 'Connection Restored',
        description: 'Syncing latest data...',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Auto-refresh when back online
      setTimeout(() => fetchDashboardData(true), 1000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      console.log('📴 Gone offline - using cached data');
      toast({
        title: 'Offline Mode',
        description: 'You are offline. Dashboard shows cached data.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    };

    // Check initial online status
    setIsOffline(!navigator.onLine);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  // Funnels data is now included in the unified dashboard endpoint
  // Update funnels state when dashboard data is loaded
  useEffect(() => {
    if (dashboardData && dashboardData.funnels) {
      const funnelsData = dashboardData.funnels;
      // Handle both array format and object with funnels array
      let funnelsArray = [];
      if (Array.isArray(funnelsData)) {
        funnelsArray = funnelsData;
      } else if (funnelsData.funnels && Array.isArray(funnelsData.funnels)) {
        funnelsArray = funnelsData.funnels;
      } else if (funnelsData.funnelMap) {
        // If only funnelMap is provided, extract funnels from it
        // Backend now returns funnelMap with string values (funnel names)
        // But handle both cases for backward compatibility
        const mapEntries = Object.entries(funnelsData.funnelMap);
        funnelsArray = mapEntries.map(([id, value]) => {
          // If value is an object, extract properties
          if (typeof value === 'object' && value !== null && value.name) {
            return { id, name: value.name, url: value.url };
          }
          // If value is a string (funnel name), create object
          return { id, name: value, url: null };
        });
      }
      
      if (funnelsArray.length > 0) {
        setFunnels(funnelsArray);
        // Create a map from funnelId to funnel name (always strings)
        const map = {};
        funnelsArray.forEach(funnel => {
          const funnelId = funnel.id || funnel._id;
          const funnelName = typeof funnel === 'object' && funnel !== null ? funnel.name : funnel;
          if (funnelId && funnelName) {
            // Ensure we store only the string name
            map[funnelId] = typeof funnelName === 'string' ? funnelName : (funnelName?.name || 'Unknown');
          }
        });
        // Also use funnelMap if provided (backend now returns string values)
        if (funnelsData.funnelMap) {
          Object.entries(funnelsData.funnelMap).forEach(([key, value]) => {
            // Extract name if value is object, otherwise use value directly (should be string)
            if (typeof value === 'object' && value !== null && value.name) {
              map[key] = value.name;
            } else if (typeof value === 'string') {
              map[key] = value;
            }
          });
        }
        setFunnelMap(map);
      }
    }
  }, [dashboardData]);

  // Real-time data fetching
  useEffect(() => {
    fetchDashboardData();
  }, []);


  // Chart data generators with API data
  const generateOpportunitiesData = () => {
    const leads = dashboardData.leads;
    const basePalette = buildColorScale(chartColor, 6);
    if (!leads) return {
      datasets: [{
        data: [0, 0],
        backgroundColor: basePalette.slice(0, 2),
        borderWidth: 0
      }]
    };

    // Get lead status distribution from API
    const statusData = leads.statusDistribution || {};
    const labels = Object.keys(statusData);
    const data = Object.values(statusData);
    const palette = buildColorScale(chartColor, Math.max(data.length, 4));

    return {
      labels: labels.length > 0 ? labels : [],
      datasets: [{
        data: data.length > 0 ? data : [],
        backgroundColor: palette.slice(0, data.length || 4),
        borderWidth: 0,
        hoverBackgroundColor: palette.slice(0, data.length || 4).map(() => hexToRgba(chartColor, 0.95)),
        hoverBorderWidth: 4,
        hoverBorderColor: colorMode === 'dark' ? '#374151' : '#1e293b'
      }]
    };
  };

  // Filter trends data based on selected timeline
  const getFilteredTrendsData = () => {
    const performance = dashboardData.performance;
    if (!performance?.trends) return { labels: [], revenue: [], leads: [] };

    const now = new Date();
    let cutoffDate;
    
    if (trendsTimeFilter === '1W') {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else { // 1M
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const filteredTrends = performance.trends.filter(trend => {
      const trendDate = new Date(trend.date);
      return trendDate >= cutoffDate;
    });

    return {
      labels: filteredTrends.map(t => new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      revenue: filteredTrends.map(t => t.revenue || 0),
      leads: filteredTrends.map(t => t.leads || 0)
    };
  };

  // Helper function to get funnel name from lead (ONLY from funnel, not source)
  const getFunnelName = (lead) => {
    // Try to get funnel name from various possible fields
    const funnelId = lead.funnelId?._id || lead.funnelId || lead.funnel?.id || lead.funnel?._id;
    if (funnelId && funnelMap[funnelId]) {
      return funnelMap[funnelId];
    }
    // If funnel name is directly available
    if (lead.funnelId?.name || lead.funnel?.name || lead.funnelName) {
      return lead.funnelId?.name || lead.funnel?.name || lead.funnelName;
    }
    // Return null if no funnel info - don't fallback to source or status
    return null;
  };

  // Filter leads data based on selected timeline - returns funnel distribution
  const getFilteredLeadsData = () => {
    const leads = dashboardData.leads;
    
    // Use leadsBySource from API (which now contains funnel names)
    if (leads?.leadsBySource && Array.isArray(leads.leadsBySource) && leads.leadsBySource.length > 0) {
      // Convert array format to object for chart
      const funnelDistribution = {};
      leads.leadsBySource.forEach(item => {
        funnelDistribution[item.name] = item.count;
      });
      return { 
        statusDistribution: funnelDistribution, 
        totalLeads: leads?.totalLeads || 0,
        leadsBySource: leads.leadsBySource
      };
    }

    // Fallback: If we have recentLeads, filter and calculate
    if (leads?.recentLeads && Array.isArray(leads.recentLeads)) {
      const now = new Date();
      let cutoffDate;
      
      if (leadsTimeFilter === '1W') {
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else { // 1M
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const filteredLeads = leads.recentLeads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= cutoffDate;
      });

      // Recalculate distribution by funnel name (ONLY leads with funnels)
      const funnelDistribution = {};
      filteredLeads.forEach(lead => {
        const funnelName = getFunnelName(lead);
        // Only count leads that have a funnel - ignore leads without funnels
        if (funnelName) {
          funnelDistribution[funnelName] = (funnelDistribution[funnelName] || 0) + 1;
        }
      });

      return {
        statusDistribution: funnelDistribution,
        totalLeads: filteredLeads.length > 0 ? filteredLeads.length : (leads?.totalLeads || 0)
      };
    }

    // Final fallback: use statusDistribution if available
    const statusDist = leads?.statusDistribution || {};
    return { 
      statusDistribution: statusDist, 
      totalLeads: leads?.totalLeads || 0 
    };
  };

  // Professional chart options with dark mode support
  const commonChartOptions = () => {
    const isDark = colorMode === 'dark';
    const professionalColors = [
      '#6366f1', // Indigo
      '#ec4899', // Pink
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#3b82f6', // Blue
      '#8b5cf6', // Purple
      '#06b6d4', // Cyan
      '#f97316', // Orange
      '#84cc16', // Lime
      '#ef4444'  // Red
    ];
    
    return {
      cutout: '65%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          backgroundColor: isDark ? 'rgba(17, 24, 39, 0.98)' : 'rgba(255, 255, 255, 0.98)',
          titleColor: isDark ? '#f9fafb' : '#111827',
          bodyColor: isDark ? '#d1d5db' : '#4b5563',
          borderColor: isDark ? '#4b5563' : '#e5e7eb',
          borderWidth: 1,
          cornerRadius: 16,
          displayColors: true,
          padding: 16,
          titleFont: {
            family: 'Inter, system-ui, sans-serif',
            size: 15,
            weight: '700',
            lineHeight: 1.4
          },
          bodyFont: {
            family: 'Inter, system-ui, sans-serif',
            size: 14,
            weight: '500',
            lineHeight: 1.5
          },
          boxPadding: 8,
          callbacks: {
            label: function(context) {
              if (!context || !context.label || context.parsed === null || context.parsed === undefined) {
                return 'No data';
              }
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => (a || 0) + (b || 0), 0);
              if (total === 0) return `${label}: ${value.toLocaleString()} (0%)`;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value.toLocaleString()} leads (${percentage}%)`;
            }
          }
        }
      },
      maintainAspectRatio: false,
      responsive: true,
      animation: {
        animateRotate: true,
        animateScale: false,
        duration: 600,
        easing: 'easeOutQuart',
        delay: 0
      },
      elements: {
        arc: {
          borderWidth: 3,
          borderColor: isDark ? '#1f2937' : '#ffffff',
          hoverBorderWidth: 5,
          hoverBorderColor: isDark ? '#374151' : '#f3f4f6'
        }
      }
    };
  };

  // Loading component
  if (loading) {
    return <ProfessionalLoader />;
  }

  // Professional Error Component with Animations
  if (error && !dashboardData.overview) {
    return (
      <Box 
        bg={bgColor}
        h="100vh"
        w="100vw"
        position="fixed"
        top={0}
        left={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
        overflow="hidden"
      >
        {/* Animated Background Elements */}
        <Box
          position="absolute"
          top="-50%"
          left="-50%"
          w="200%"
          h="200%"
          bg={useColorModeValue('rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.1)')}
          borderRadius="full"
          animation="float 20s ease-in-out infinite"
          sx={{
            '@keyframes float': {
              '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
              '50%': { transform: 'translate(30px, 30px) rotate(180deg)' }
            }
          }}
        />
        <Box
          position="absolute"
          bottom="-30%"
          right="-30%"
          w="150%"
          h="150%"
          bg={useColorModeValue('rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.1)')}
          borderRadius="full"
          animation="float 25s ease-in-out infinite reverse"
          sx={{
            '@keyframes float': {
              '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
              '50%': { transform: 'translate(-30px, -30px) rotate(-180deg)' }
            }
          }}
        />

        <Box 
          maxW="600px" 
          w="auto" 
          ml="30px"
          textAlign="center"
          position="relative"
          zIndex={1}
        >
          <VStack spacing={8}>
            {/* Animated Icon Container */}
            <Box
              position="relative"
              w="120px"
              h="120px"
              mx="auto"
            >
              {/* Pulsing Ring Animation */}
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="120px"
                h="120px"
                borderRadius="full"
                bg={useColorModeValue('blue.100', 'blue.900')}
                opacity={0.3}
                animation="pulse 2s ease-in-out infinite"
                sx={{
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.3 },
                    '50%': { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 0.1 }
                  }
                }}
              />
              {/* Main Icon Circle */}
              <Box
                w="120px"
                h="120px"
                borderRadius="full"
                bg={useColorModeValue('white', 'gray.800')}
                boxShadow="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                border="4px solid"
                borderColor={useColorModeValue('blue.200', 'blue.700')}
                animation="bounce 2s ease-in-out infinite"
                sx={{
                  '@keyframes bounce': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                  }
                }}
              >
                <Icon 
                  as={FaExclamationTriangle} 
                  boxSize="48px" 
                  color={useColorModeValue('blue.500', 'blue.300')}
                />
              </Box>
            </Box>

            {/* Error Content with Fade-in Animation */}
            <VStack 
              spacing={4}
              animation="fadeInUp 0.6s ease-out"
              sx={{
                '@keyframes fadeInUp': {
                  '0%': { opacity: 0, transform: 'translateY(20px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                }
              }}
            >
              <Heading 
                size="xl" 
                fontWeight="700"
                letterSpacing="-0.5px"
                color={textColor}
              >
                Dashboard Unavailable
              </Heading>
              <Text 
                color={secondaryTextColor} 
                fontSize="lg"
                lineHeight="1.7"
                maxW="500px"
                mx="auto"
                px={4}
              >
                {error}
              </Text>
            </VStack>

            {/* Action Buttons with Hover Animations */}
            <HStack 
              spacing={4}
              animation="fadeInUp 0.8s ease-out"
              sx={{
                '@keyframes fadeInUp': {
                  '0%': { opacity: 0, transform: 'translateY(20px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                }
              }}
            >
              <Button 
                size="lg"
                colorScheme="blue"
                borderRadius="8px"
                px={8}
                fontWeight="600"
                leftIcon={<FaSyncAlt />}
                onClick={() => {
                  setError(null);
                  fetchDashboardData();
                }}
                _hover={{ 
                  transform: 'translateY(-3px)',
                  boxShadow: 'xl'
                }}
                _active={{
                  transform: 'translateY(-1px)'
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                boxShadow="lg"
              >
                Refresh Dashboard
              </Button>
              <Button 
                size="lg"
                variant="outline"
                colorScheme="blue"
                borderRadius="8px"
                px={8}
                fontWeight="600"
                onClick={() => window.location.reload()}
                _hover={{ 
                  transform: 'translateY(-3px)',
                  boxShadow: 'md',
                  bg: useColorModeValue('blue.50', 'blue.900')
                }}
                _active={{
                  transform: 'translateY(-1px)'
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                Reload Page
              </Button>
            </HStack>

            {/* Subtle Help Text */}
            <Text 
              fontSize="sm" 
              color={secondaryTextColor}
              mt={4}
              animation="fadeIn 1s ease-out"
              sx={{
                '@keyframes fadeIn': {
                  '0%': { opacity: 0 },
                  '100%': { opacity: 1 }
                }
              }}
            >
              If the problem persists, please check your internet connection or contact support.
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  }

  // Helper function to check if user has permission
  const hasPermission = (permission) => {
    return userContext.permissions?.includes(permission) || false;
  };

  // Helper function to check if section should be rendered based on permissions
  const shouldRenderSection = (sectionName) => {
    if (!userContext.isStaff) return true; // Coach sees everything
    
    const permissionMap = {
      'leads': 'leads:view',
      'messaging': 'messaging:view', 
      'appointments': 'calendar:view',
      'calendar': 'calendar:view'
    };
    
    const requiredPermission = permissionMap[sectionName];
    return !requiredPermission || hasPermission(requiredPermission);
  };

  // Destructure dashboard data for easier access
  const { overview, leads, financial, team, performance, trends, marketing } = dashboardData;

  return (
    <Box bg={bgColor} minH="100vh" transition="all 0.3s ease" p={6}>
      <BubbleBackground />
      
      {/* Header Section with KPI Cards */}
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              {userContext.isStaff ? (
                <>Hello, {dashboardData.overview?.staffName || user?.name || 'Staff Member'} 👋</>
              ) : (
                <>Hello, {user?.name || 'User'} 👋</>
              )}
            </Text>
            <Text color={secondaryTextColor}>
              {userContext.isStaff ? (
                <>Here's your personal dashboard for {dashboardData.overview?.period || 'the last 30 days'}</>
              ) : (
                <>Here's what's happening with your business today</>
              )}
            </Text>
            {userContext.isStaff && dashboardData.overview?.lastActive && (
              <Text fontSize="sm" color={secondaryTextColor} mt={1}>
                Last active: {new Date(dashboardData.overview.lastActive).toLocaleString()}
              </Text>
            )}
          </Box>
          <IconButton
            icon={refreshing ? <FaSpinner className="fa-spin" /> : <FaSyncAlt />}
            aria-label="Refresh Dashboard"
            colorScheme="brand"
            size="sm"
            onClick={() => fetchDashboardData(true)}
            isLoading={refreshing}
          />
        </Box>
        
        {/* Middle Row - Date, Coach ID, and Status */}
        <Box display="flex" alignItems="center" gap={4} mb={6}>
          <Box display="flex" alignItems="center" gap={2}>
            <Icon as={FaClock} color={secondaryTextColor} />
            <Text fontSize="sm" color={secondaryTextColor}>
              {formatDateDDMMYYYY(Date.now() - 30*24*60*60*1000)} - {formatDateDDMMYYYY(Date.now())}
            </Text>
          </Box>
          {(user?.selfCoachId || JSON.parse(localStorage.getItem('user') || '{}')?.selfCoachId) && (
            <Badge colorScheme="brand" variant="subtle">
              Coach ID: {user?.selfCoachId || JSON.parse(localStorage.getItem('user') || '{}')?.selfCoachId}
            </Badge>
          )}
          {isOffline && (
            <Badge colorScheme="orange" variant="solid">
              📴 Offline Mode
            </Badge>
          )}
          {lastSyncTime && !isOffline && (
            <Badge colorScheme="green" variant="subtle">
              ✅ Last sync: {lastSyncTime.toLocaleTimeString()}
            </Badge>
          )}
        </Box>

        {/* Bottom Row - KPI Cards Grid */}
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={6}>
          {userContext.isStaff ? (
            // Staff-specific KPI cards
            <>
              {/* My Assigned Leads */}
              <Box
                bg={useColorModeValue('blue.50', 'blue.900')}
                borderRadius="xl"
                p={6}
                border="1px"
                borderColor={useColorModeValue('blue.200', 'blue.700')}
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                transition="all 0.2s"
              >
                <Box display="flex" alignItems="center" gap={4}>
                  <Box
                    bg={useColorModeValue('blue.100', 'blue.800')}
                    p={3}
                    borderRadius="lg"
                    color={useColorModeValue('blue.600', 'blue.300')}
                  >
                    <Icon as={IoPeopleOutline} boxSize={6} />
                  </Box>
                  <Box flex="1">
                    <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue('blue.800', 'blue.200')}>
                      {dashboardData.overview?.myAssignedLeads?.toLocaleString() || '0'}
                    </Text>
                    <Text color={useColorModeValue('blue.700', 'blue.300')} fontSize="sm">My Assigned Leads</Text>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Icon as={FaArrowUp} color="green.500" boxSize={3} />
                      <Text fontSize="xs" color="green.500">+{dashboardData.overview?.myNewLeadsToday || 0} today</Text>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* My Conversion Rate */}
              <Box
                bg={useColorModeValue('green.50', 'green.900')}
                borderRadius="xl"
                p={6}
                border="1px"
                borderColor={useColorModeValue('green.200', 'green.700')}
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                transition="all 0.2s"
              >
                <Box display="flex" alignItems="center" gap={4}>
                  <Box
                    bg={useColorModeValue('green.100', 'green.800')}
                    p={3}
                    borderRadius="lg"
                    color={useColorModeValue('green.600', 'green.300')}
                  >
                    <Icon as={IoStatsChart} boxSize={6} />
                  </Box>
                  <Box flex="1">
                    <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue('green.800', 'green.200')}>
                      {dashboardData.overview?.myConversionRate || '0'}%
                    </Text>
                    <Text color={useColorModeValue('green.700', 'green.300')} fontSize="sm">My Conversion Rate</Text>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Icon as={FaArrowUp} color="green.500" boxSize={3} />
                      <Text fontSize="xs" color="green.500">{dashboardData.overview?.myLeadsConverted || 0} converted</Text>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* My Messages Sent */}
              <Box
                bg={useColorModeValue('purple.50', 'purple.900')}
                borderRadius="xl"
                p={6}
                border="1px"
                borderColor={useColorModeValue('purple.200', 'purple.700')}
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                transition="all 0.2s"
              >
                <Box display="flex" alignItems="center" gap={4}>
                  <Box
                    bg={useColorModeValue('purple.100', 'purple.800')}
                    p={3}
                    borderRadius="lg"
                    color={useColorModeValue('purple.600', 'purple.300')}
                  >
                    <Icon as={FaBell} boxSize={6} />
                  </Box>
                  <Box flex="1">
                    <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue('purple.800', 'purple.200')}>
                      {dashboardData.overview?.myTotalMessagesSent?.toLocaleString() || '0'}
                    </Text>
                    <Text color={useColorModeValue('purple.700', 'purple.300')} fontSize="sm">Messages Sent</Text>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Icon as={FaArrowUp} color="green.500" boxSize={3} />
                      <Text fontSize="xs" color="green.500">{dashboardData.overview?.myMessagesToday || 0} today</Text>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* My Appointments */}
              <Box
                bg={useColorModeValue('orange.50', 'orange.900')}
                borderRadius="xl"
                p={6}
                border="1px"
                borderColor={useColorModeValue('orange.200', 'orange.700')}
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                transition="all 0.2s"
              >
                <Box display="flex" alignItems="center" gap={4}>
                  <Box
                    bg={useColorModeValue('orange.100', 'orange.800')}
                    p={3}
                    borderRadius="lg"
                    color={useColorModeValue('orange.600', 'orange.300')}
                  >
                    <Icon as={FaCalendar} boxSize={6} />
                  </Box>
                  <Box flex="1">
                    <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue('orange.800', 'orange.200')}>
                      {dashboardData.overview?.myTotalAppointments || 0}
                    </Text>
                    <Text color={useColorModeValue('orange.700', 'orange.300')} fontSize="sm">My Appointments</Text>
                  </Box>
                </Box>
              </Box>
            </>
          ) : (
            // Coach-specific KPI cards (existing)
            <>
          {/* Total Leads */}
          <Box
            bg={useColorModeValue('blue.50', 'blue.900')}
            borderRadius="xl"
            p={6}
            border="1px"
            borderColor={useColorModeValue('blue.200', 'blue.700')}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
            transition="all 0.2s"
          >
            <Box display="flex" alignItems="center" gap={4}>
              <Box
                bg={useColorModeValue('blue.100', 'blue.800')}
                p={3}
                borderRadius="lg"
                color={useColorModeValue('blue.600', 'blue.300')}
              >
                <Icon as={IoPeopleOutline} boxSize={6} />
              </Box>
              <Box flex="1">
                <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue('blue.800', 'blue.200')}>
                  {overview?.totalLeads?.toLocaleString() || '0'}
                </Text>
                <Text color={useColorModeValue('blue.700', 'blue.300')} fontSize="sm">Total Leads</Text>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Icon as={FaArrowUp} color="green.500" boxSize={3} />
                  <Text fontSize="xs" color="green.500">+{leads?.funnel?.qualified || 0} qualified</Text>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Conversion Rate */}
          <Box
            bg={useColorModeValue('green.50', 'green.900')}
            borderRadius="xl"
            p={6}
            border="1px"
            borderColor={useColorModeValue('green.200', 'green.700')}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
            transition="all 0.2s"
          >
            <Box display="flex" alignItems="center" gap={4}>
              <Box
                bg={useColorModeValue('green.100', 'green.800')}
                p={3}
                borderRadius="lg"
                color={useColorModeValue('green.600', 'green.300')}
              >
                <Icon as={IoStatsChart} boxSize={6} />
              </Box>
              <Box flex="1">
                <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue('green.800', 'green.200')}>
                  {overview?.conversionRate?.toFixed(1) || '0'}%
                </Text>
                <Text color={useColorModeValue('green.700', 'green.300')} fontSize="sm">Conversion Rate</Text>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Icon as={FaArrowUp} color="green.500" boxSize={3} />
                  <Text fontSize="xs" color="green.500">{overview?.convertedLeads || 0} converted</Text>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Total Revenue */}
          <Box
            bg={useColorModeValue('yellow.50', 'yellow.900')}
            borderRadius="xl"
            p={6}
            border="1px"
            borderColor={useColorModeValue('yellow.200', 'yellow.700')}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
            transition="all 0.2s"
          >
            <Box display="flex" alignItems="center" gap={4}>
              <Box
                bg={useColorModeValue('yellow.100', 'yellow.800')}
                p={3}
                borderRadius="lg"
                color={useColorModeValue('yellow.600', 'yellow.300')}
              >
                <Icon as={FaRupeeSign} boxSize={6} />
              </Box>
              <Box flex="1">
                <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue('yellow.800', 'yellow.200')}>
                  ₹{overview?.totalRevenue?.toLocaleString() || '0'}
                </Text>
                <Text color={useColorModeValue('yellow.700', 'yellow.300')} fontSize="sm">Total Revenue</Text>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Icon as={FaArrowUp} color="green.500" boxSize={3} />
                  <Text fontSize="xs" color="green.500">₹{financial?.metrics?.avgRevenuePerDay?.toFixed(0) || 0}/day</Text>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Total Appointments */}
          <Box
            bg={useColorModeValue('purple.50', 'purple.900')}
            borderRadius="xl"
            p={6}
            border="1px"
            borderColor={useColorModeValue('purple.200', 'purple.700')}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
            transition="all 0.2s"
          >
            <Box display="flex" alignItems="center" gap={4}>
              <Box
                bg={useColorModeValue('purple.100', 'purple.800')}
                p={3}
                borderRadius="lg"
                color={useColorModeValue('purple.600', 'purple.300')}
              >
                <Icon as={IoBarChart} boxSize={6} />
              </Box>
              <Box flex="1">
                <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue('purple.800', 'purple.200')}>
                  {overview?.totalAppointments || 0}
                </Text>
                <Text color={useColorModeValue('purple.700', 'purple.300')} fontSize="sm">Total Appointments</Text>
              </Box>
            </Box>
          </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Staff Performance Score Section - Only for Staff */}
      {userContext.isStaff && dashboardData.myPerformanceScore && (
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
          <Box display="flex" alignItems="center" gap={3} mb={4}>
            <Icon as={FaTrophy} boxSize={6} color="yellow.500" />
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              My Performance Score
            </Text>
            <Badge colorScheme="yellow" variant="subtle">
              {dashboardData.myPerformanceScore.scoreOutOf100 || 0}/100
            </Badge>
          </Box>
          
          <Box display="flex" alignItems="center" gap={6}>
            {/* Circular Progress */}
            <Box position="relative" w="120px" h="120px">
              <Box
                position="absolute"
                top="0"
                left="0"
                w="100%"
                h="100%"
                borderRadius="50%"
                bg={useColorModeValue('gray.100', 'gray.700')}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                  {dashboardData.myPerformanceScore.scoreOutOf100 || 0}
                </Text>
              </Box>
            </Box>
            
            {/* Score Details */}
            <Box flex="1">
              <Text fontSize="lg" fontWeight="semibold" color={textColor} mb={2}>
                {dashboardData.myPerformanceScore.rating?.label || 'Good'} {dashboardData.myPerformanceScore.rating?.icon || '👍'}
              </Text>
              <Text color={secondaryTextColor} mb={4}>
                Overall Score: {dashboardData.myPerformanceScore.overallScore || '0'}
              </Text>
              
              {/* Score Breakdown */}
              <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={3}>
                {dashboardData.myPerformanceScore.breakdown && Object.entries(dashboardData.myPerformanceScore.breakdown).map(([key, value]) => (
                  <Box key={key} p={3} bg={useColorModeValue('gray.50', 'gray.600')} borderRadius="lg">
                    <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={1}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Text>
                    <Text fontSize="sm" color={secondaryTextColor}>
                      {value.score || 0}/{value.max || 0} ({value.rate || value.avgScore || value.messages || value.activeDays || '0'})
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Team Performance Section - Different for Staff vs Coach */}
      {dashboardData.teamPerformance && (
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
          <Box display="flex" alignItems="center" gap={3} mb={4}>
            <Icon as={FaTrophy} boxSize={6} color="yellow.500" />
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              {userContext.isStaff ? 'Team Leaderboard' : 'Team Performance'}
            </Text>
            <Badge colorScheme="yellow" variant="subtle">
              {userContext.isStaff ? `${dashboardData.teamPerformance.totalTeamMembers || 0} members` : `${team?.totalStaff || 0} staff`}
            </Badge>
            {userContext.isStaff && dashboardData.teamPerformance.myRank && (
              <Badge colorScheme="blue" variant="solid">
                Your Rank: #{dashboardData.teamPerformance.myRank}
              </Badge>
            )}
          </Box>
          
          {userContext.isStaff ? (
            // Staff team leaderboard
            <Box>
              {dashboardData.teamPerformance?.teamLeaderboard && dashboardData.teamPerformance.teamLeaderboard.length > 0 ? (
                dashboardData.teamPerformance.teamLeaderboard.slice(0, 5).map((member, index) => (
                  <Box
                    key={member.staffId || index}
                    display="flex"
                    alignItems="center"
                    gap={4}
                    p={3}
                    borderRadius="lg"
                    bg={member.isCurrentUser ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
                    border={member.isCurrentUser ? '2px' : '1px'}
                    borderColor={member.isCurrentUser ? 'blue.500' : borderColor}
                    _hover={{ bg: hoverBg }}
                    transition="all 0.2s"
                  >
                    <Box
                      w={8}
                      h={8}
                      borderRadius="full"
                      bg={index === 0 ? 'yellow.500' : index === 1 ? 'gray.400' : index === 2 ? 'orange.500' : 'gray.200'}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontWeight="bold"
                      fontSize="sm"
                    >
                      {member.rank || index + 1}
                    </Box>
                    <Box flex="1">
                      <Text fontWeight="semibold" color={textColor}>
                        {member.staffName}
                        {member.isCurrentUser && <Badge ml={2} colorScheme="blue" size="sm">You</Badge>}
                      </Text>
                      <Text fontSize="sm" color={secondaryTextColor}>
                        Score: {member.performanceScore || 0} • {member.conversionRate || '0'}% conversion
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontWeight="bold" color="brand.600" fontSize="sm">
                        {member.leadsConverted || 0} converted
                      </Text>
                      <Text fontSize="xs" color={secondaryTextColor}>
                        {member.messagesSent || 0} messages
                      </Text>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box textAlign="center" py={8}>
                  <Icon as={IoPeopleOutline} boxSize={10} color={mutedTextColor} mb={2} />
                  <Text color={mutedTextColor} fontSize="sm">
                    No team members found
                  </Text>
                </Box>
              )}
            </Box>
          ) : (
            // Coach team performance
            <Box>
              {team?.staffPerformance && team.staffPerformance.length > 0 ? (
                team.staffPerformance.slice(0, 5).map((member, index) => (
                  <Box
                    key={member.staffId || index}
                    display="flex"
                    alignItems="center"
                    gap={4}
                    p={3}
                    borderRadius="lg"
                    _hover={{ bg: hoverBg }}
                    transition="all 0.2s"
                  >
                    <Box
                      w={8}
                      h={8}
                      borderRadius="full"
                      bg={index === 0 ? 'yellow.500' : index === 1 ? 'gray.400' : index === 2 ? 'orange.500' : 'gray.200'}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontWeight="bold"
                      fontSize="sm"
                    >
                      {member.rank || index + 1}
                    </Box>
                    <Box flex="1">
                      <Text fontWeight="semibold" color={textColor}>
                        {member.staffName || member.name}
                      </Text>
                      <Text fontSize="sm" color={secondaryTextColor}>
                        Score: {member.performanceScore || member.score || 0} • {member.conversionRate || '0'}% conversion
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontWeight="bold" color="brand.600" fontSize="sm">
                        {member.leadsConverted || 0} converted
                      </Text>
                      <Text fontSize="xs" color={secondaryTextColor}>
                        {member.messagesSent || 0} messages
                      </Text>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box textAlign="center" py={8}>
                  <Icon as={IoPeopleOutline} boxSize={10} color={mutedTextColor} mb={2} />
                  <Text color={mutedTextColor} fontSize="sm">
                    No team members found
                  </Text>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
      {/* Charts Section - Side by Side - Only for Coach or Staff with permissions */}
      {(!userContext.isStaff || shouldRenderSection('leads')) && (
      <Box 
        display={{ base: "block", md: "flex" }} 
        gap={6} 
        mb={6}
        w="100%"
        overflow="hidden"
        maxW="100%"
      >
        {/* Performance Trends Chart - 70% width on desktop, full width on mobile */}
        <Box
          bg={cardBgColor}
          borderRadius="xl"
          p={{ base: 4, md: 6 }}
          boxShadow={shadowColor}
          border="1px"
          borderColor={borderColor}
          w={{ base: "100%", md: "auto" }}
          flex={{ base: "none", md: "0.7" }}
          transition="all 0.3s ease"
          overflow="hidden"
          mb={{ base: 6, md: 0 }}
          minW="0"
          maxW="100%"
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Performance Trends
            </Text>
            <HStack spacing={3} align="center">
            <Box display="flex" gap={2}>
              <Button 
                size="sm" 
                variant={trendsTimeFilter === '1W' ? 'solid' : 'ghost'} 
                colorScheme="brand"
                onClick={() => setTrendsTimeFilter('1W')}
              >
                1W
              </Button>
              <Button 
                size="sm" 
                variant={trendsTimeFilter === '1M' ? 'solid' : 'ghost'} 
                colorScheme="brand"
                onClick={() => setTrendsTimeFilter('1M')}
              >
                1M
              </Button>
            </Box>
              <Menu placement="bottom-end" isLazy>
                <MenuButton
                  as={Button}
                  size="sm"
                  variant="outline"
                  rightIcon={<ChevronDownIcon />}
                  px={3}
                  py={2}
                  bg={useColorModeValue('white', 'gray.700')}
                  borderColor={borderColor}
                >
                  <Box
                    w="16px"
                    h="16px"
                    borderRadius="full"
                    bg={chartColor}
                    border="1px solid"
                    borderColor={useColorModeValue('gray.300', 'gray.500')}
                  />
                </MenuButton>
                <MenuList p={3} minW="200px">
                  <SimpleGrid columns={4} spacing={2}>
                    {trendColorOptions.map((color) => (
                      <Box
                        key={color}
                        w="36px"
                        h="36px"
                        borderRadius="full"
                        bg={color}
                        border="2px solid"
                        borderColor={trendLineColor === color ? useColorModeValue('gray.700', 'whiteAlpha.800') : 'transparent'}
                        boxShadow="sm"
                        cursor="pointer"
                        transition="transform 0.15s ease, box-shadow 0.15s ease"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                        onClick={() => setTrendLineColor(color)}
                      />
                    ))}
                  </SimpleGrid>
                </MenuList>
              </Menu>
            </HStack>
          </Box>
          
          {dashboardData.performance?.trends ? (
            <Box 
              h="300px" 
              position="relative"
              w="100%"
              overflow="visible"
              maxW="100%"
              minW="0"
              pt={4}
              pb={2}
            >
              <Line 
                data={{
                  labels: getFilteredTrendsData().labels,
                  datasets: [
                    {
                      label: 'Leads',
                      data: getFilteredTrendsData().leads.map(val => val || 0),
                      borderColor: chartColor,
                      backgroundColor: (context) => {
                        const { chart } = context;
                        const { ctx, chartArea } = chart || {};
                        if (!chartArea) return hexToRgba(chartColor, 0.2);
                        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, hexToRgba(chartColor, 0.25));
                        gradient.addColorStop(1, hexToRgba(chartColor, 0));
                        return gradient;
                      },
                      borderWidth: 2,
                      tension: 0.4,
                      fill: true,
                      pointBackgroundColor: chartColor,
                      pointBorderColor: colorMode === 'dark' ? '#374151' : '#ffffff',
                      pointBorderWidth: 2,
                      pointRadius: 5,
                      pointHoverRadius: 9,
                      pointHoverBackgroundColor: chartColor,
                      pointHoverBorderColor: colorMode === 'dark' ? '#374151' : '#ffffff',
                      pointHoverBorderWidth: 3,
                      cubicInterpolationMode: 'monotone',
                      fillColor: hexToRgba(chartColor, 0.1),
                      fillOpacity: 0.3
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: colorMode === 'dark' ? 'rgba(31, 41, 55, 0.98)' : 'rgba(15, 23, 42, 0.98)',
                      titleColor: colorMode === 'dark' ? '#f9fafb' : '#f8fafc',
                      bodyColor: colorMode === 'dark' ? '#d1d5db' : '#e2e8f0',
                      borderColor: chartColor,
                      borderWidth: 2,
                      cornerRadius: 16,
                      displayColors: false,
                      titleFont: {
                        family: 'Inter',
                        size: 16,
                        weight: '700'
                      },
                      bodyFont: {
                        family: 'Inter',
                        size: 14,
                        weight: '500'
                      },
                      padding: 16,
                      callbacks: {
                        title: function(context) {
                          if (!context || !context[0] || !context[0].label) return '';
                          return `${context[0].label} 2025`;
                        },
                        label: function(context) {
                          if (!context || !context.parsed || context.parsed.y === null || context.parsed.y === undefined) {
                            return 'No data';
                          }
                          return `Leads: ${context.parsed.y.toLocaleString()}`;
                        },
                        afterLabel: function(context) {
                          if (!context || !context.parsed || context.parsed.y === null || context.parsed.y === undefined) {
                            return '';
                          }
                          const data = context.parsed.y;
                          const prevData = context.dataset.data[context.dataIndex - 1];
                          if (prevData && prevData !== null && prevData !== undefined && prevData !== 0) {
                            const change = ((data - prevData) / prevData * 100).toFixed(1);
                            const isPositive = change >= 0;
                            return `${isPositive ? '+' : ''}${change}% from previous day`;
                          }
                          return '';
                        }
                      }
                    }
                  },
                  animation: {
                    duration: 600,
                    easing: 'easeOutQuart',
                    delay: 0
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: colorMode === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(148, 163, 184, 0.08)',
                        lineWidth: 1,
                        drawBorder: false,
                        drawTicks: false
                      },
                      ticks: {
                        font: {
                          family: 'Inter',
                          size: 12,
                          weight: '500'
                        },
                        color: colorMode === 'dark' ? '#9ca3af' : '#64748b',
                        padding: 12,
                        callback: function(value) {
                          return value.toLocaleString();
                        }
                      },
                      border: {
                        display: false
                      },
                      suggestedMax: function(context) {
                        const max = Math.max(...context.chart.data.datasets[0].data);
                        return max > 0 ? max * 1.15 : 100; // Add 15% padding at top
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        font: {
                          family: 'Inter',
                          size: 13,
                          weight: '600'
                        },
                        color: colorMode === 'dark' ? '#9ca3af' : '#475569',
                        padding: 12
                      },
                      border: {
                        display: true,
                        color: colorMode === 'dark' ? '#4b5563' : '#d1d5db'
                      }
                    }
                  },
                  interaction: {
                    intersect: false,
                    mode: 'index'
                  },
                  elements: {
                    point: {
                      hoverRadius: 9,
                      hoverBorderWidth: 3
                    },
                    line: {
                      borderWidth: 2
                    }
                  },
                  layout: {
                    padding: {
                      top: 20,
                      bottom: 10
                    }
                  }
                }}
              />
            </Box>
          ) : (
            <Box h="300px" display="flex" alignItems="center" justifyContent="center">
              <Spinner size="lg" color="brand.500" />
              <Text color={secondaryTextColor} ml={3}>Loading chart data...</Text>
            </Box>
          )}
        </Box>

        {/* Lead Distribution Chart - 30% width on desktop, full width on mobile */}
        <Box
          bg={cardBgColor}
          borderRadius="xl"
          p={{ base: 4, md: 6 }}
          boxShadow={shadowColor}
          border="1px"
          borderColor={borderColor}
          w={{ base: "100%", md: "auto" }}
          flex={{ base: "none", md: "0.3" }}
          transition="all 0.3s ease"
          overflow="hidden"
          minW="0"
          maxW="100%"
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Lead Distribution
            </Text>
            <Box display="flex" gap={2}>
              <Button 
                size="sm" 
                variant={leadsTimeFilter === '1W' ? 'solid' : 'ghost'} 
                colorScheme="brand"
                onClick={() => setLeadsTimeFilter('1W')}
              >
                1W
              </Button>
              <Button 
                size="sm" 
                variant={leadsTimeFilter === '1M' ? 'solid' : 'ghost'} 
                colorScheme="brand"
                onClick={() => setLeadsTimeFilter('1M')}
              >
                1M
              </Button>
            </Box>
          </Box>
          <Box 
            h="320px"
            w="100%"
            overflow="hidden"
            maxW="100%"
            minW="0"
            position="relative"
          >
            <Doughnut 
              data={(() => {
                const filteredData = Object.entries(getFilteredLeadsData().statusDistribution)
                  .filter(([name]) => name && name !== 'Unknown' && name !== null);
                const palette = buildColorScale(chartColor, Math.max(filteredData.length, 8));
                const hoverPalette = palette.map(() => hexToRgba(chartColor, 0.95));
                
                return {
                  labels: filteredData.map(([name]) => name),
                  datasets: [{
                    data: filteredData.map(([, val]) => val || 0),
                    backgroundColor: filteredData.map((_, index) => palette[index % palette.length]),
                    borderWidth: 3,
                    borderColor: colorMode === 'dark' ? '#1f2937' : '#ffffff',
                    hoverBackgroundColor: filteredData.map((_, index) => hoverPalette[index % hoverPalette.length]),
                    hoverBorderWidth: 5,
                    hoverBorderColor: colorMode === 'dark' ? '#374151' : '#f3f4f6'
                  }]
                };
              })()} 
              options={commonChartOptions()}
            />
          </Box>
          {(() => {
            const filteredData = Object.entries(getFilteredLeadsData().statusDistribution)
              .filter(([name]) => name && name !== 'Unknown' && name !== null)
              .sort(([, a], [, b]) => (b || 0) - (a || 0));
            const palette = buildColorScale(chartColor, Math.max(filteredData.length, 8));
            
            // Show at least 2 funnels, show more if available (up to 3-4), then "..." if there are more
            const minShow = 2;
            const maxShow = 4;
            const showCount = Math.min(Math.max(minShow, filteredData.length), maxShow);
            const funnelsToShow = filteredData.slice(0, showCount);
            const hasMore = filteredData.length > showCount;
            
            if (funnelsToShow.length === 0) {
              return null;
            }
            
            return (
              <Box mt={4} mb={3}>
                <HStack spacing={3} flexWrap="wrap" justify="center">
                  {funnelsToShow.map(([funnelName], index) => (
                    <HStack key={funnelName} spacing={2}>
                      <Box 
                        w={3} 
                        h={3} 
                        bg={palette[index % palette.length]} 
                        borderRadius="full"
                        flexShrink={0}
                      />
                      <Text 
                        fontSize="sm" 
                        color={textColor}
                        fontWeight="500"
                        noOfLines={1}
                        maxW="120px"
                      >
                        {funnelName}
                      </Text>
                    </HStack>
                  ))}
                  {hasMore && (
                    <Text fontSize="sm" color={secondaryTextColor} fontWeight="500">
                      ...
                    </Text>
                  )}
                </HStack>
              </Box>
            );
          })()}
          <Button
            w="100%"
            mt={2}
            colorScheme="brand"
            size="md"
            onClick={onFunnelModalOpen}
            leftIcon={<FaChartLine />}
            variant="outline"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'md'
            }}
            transition="all 0.2s"
          >
            View Funnel Distribution
          </Button>
        </Box>

        {/* Funnel Distribution Modal */}
        <Modal isOpen={isFunnelModalOpen} onClose={onFunnelModalClose} size="xl" isCentered>
          <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(2px)" />
          <ModalContent bg={cardBgColor} borderRadius="10px" maxH="90vh" overflow="hidden" maxW="800px" w="auto">
            <ModalHeader 
              display="flex" 
              alignItems="center" 
              gap={3}
              borderBottom="1px"
              borderColor={borderColor}
              pb={4}
            >
              <Icon as={FaChartLine} boxSize={6} color="brand.500" />
              <Box>
                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                  Funnel Distribution
                </Text>
                <Text fontSize="sm" color={secondaryTextColor} fontWeight="normal">
                  Leads and views by funnel
                </Text>
              </Box>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody p={0} overflowY="auto" maxH="calc(90vh - 140px)">
              {(() => {
                const filteredData = Object.entries(getFilteredLeadsData().statusDistribution)
                  .filter(([funnelName]) => funnelName && funnelName !== 'Unknown' && funnelName !== null)
                  .sort(([, a], [, b]) => (b || 0) - (a || 0));
                
                const leadsBySource = dashboardData.leads?.leadsBySource || [];
                const totalLeads = Object.values(getFilteredLeadsData().statusDistribution)
                  .reduce((sum, val) => sum + (val || 0), 0);
                
                if (filteredData.length === 0) {
                  return (
                    <Box textAlign="center" py={12} px={6}>
                      <Icon as={FaChartLine} boxSize={12} color={mutedTextColor} mb={4} />
                      <Text fontSize="md" color={secondaryTextColor} fontWeight="medium" mb={2}>
                        No Funnel Data Available
                      </Text>
                      <Text fontSize="sm" color={mutedTextColor}>
                        Leads from funnels will appear here
                      </Text>
                    </Box>
                  );
                }

                return (
                  <TableContainer>
                    <Table variant="simple" size="md">
                      <Thead bg={useColorModeValue('gray.50', 'gray.700')} position="sticky" top={0} zIndex={1}>
                        <Tr>
                          <Th color={textColor} fontWeight="700" fontSize="sm" textTransform="uppercase" letterSpacing="0.5px">
                            Funnel Name
                          </Th>
                          <Th color={textColor} fontWeight="700" fontSize="sm" textTransform="uppercase" letterSpacing="0.5px" isNumeric>
                            Leads
                          </Th>
                          <Th color={textColor} fontWeight="700" fontSize="sm" textTransform="uppercase" letterSpacing="0.5px" isNumeric>
                            Views
                          </Th>
                          <Th color={textColor} fontWeight="700" fontSize="sm" textTransform="uppercase" letterSpacing="0.5px" isNumeric>
                            %
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredData.map(([funnelName, count], index) => {
                          const percentage = totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : 0;
                          const funnelData = leadsBySource.find(item => item.name === funnelName);
                          const views = funnelData?.views || 0;
                          const uniqueViews = funnelData?.uniqueViews || 0;
                          const colors = [
                            '#6366f1', '#ec4899', '#10b981', '#f59e0b', 
                            '#3b82f6', '#8b5cf6', '#06b6d4', '#f97316',
                            '#84cc16', '#ef4444'
                          ];
                          
                          return (
                            <Tr 
                              key={funnelName}
                              borderBottom="1px"
                              borderColor={borderColor}
                            >
                              <Td>
                                <HStack spacing={3}>
                                  <Box 
                                    w={3} 
                                    h={3} 
                                    bg={colors[index % colors.length]} 
                                    borderRadius="full"
                                    flexShrink={0}
                                  />
                                  <Text 
                                    fontSize="sm" 
                                    fontWeight="600" 
                                    color={textColor}
                                    noOfLines={1}
                                    title={funnelName}
                                  >
                                    {funnelName}
                                  </Text>
                                </HStack>
                              </Td>
                              <Td isNumeric>
                                <Badge 
                                  colorScheme="blue" 
                                  variant="subtle" 
                                  fontSize="sm"
                                  px={2}
                                  py={1}
                                  borderRadius="md"
                                >
                                  {count?.toLocaleString() || 0}
                                </Badge>
                              </Td>
                              <Td isNumeric>
                                <HStack spacing={2} justify="flex-end">
                                  <Icon as={FaEye} color={secondaryTextColor} boxSize={4} />
                                  <Text fontSize="sm" fontWeight="600" color={textColor}>
                                    {views.toLocaleString()}
                                  </Text>
                                  {uniqueViews > 0 && (
                                    <Text fontSize="xs" color={secondaryTextColor}>
                                      ({uniqueViews} unique)
                                    </Text>
                                  )}
                                </HStack>
                              </Td>
                              <Td isNumeric>
                                <Badge 
                                  colorScheme="green" 
                                  variant="subtle" 
                                  fontSize="sm"
                                  px={2}
                                  py={1}
                                  borderRadius="md"
                                >
                                  {percentage}%
                                </Badge>
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>
                );
              })()}
            </ModalBody>
            <ModalFooter borderTop="1px" borderColor={borderColor} pt={4}>
              <HStack spacing={4} w="100%" justify="space-between">
                <Text fontSize="sm" color={secondaryTextColor}>
                  Total: <Text as="span" fontWeight="bold" color={textColor}>
                    {Object.values(getFilteredLeadsData().statusDistribution)
                      .reduce((sum, val) => sum + (val || 0), 0).toLocaleString()}
                  </Text> leads
                </Text>
                <Button 
                  colorScheme="brand" 
                  onClick={onFunnelModalClose}
                  size="sm"
                >
                  Close
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
      )}

      {/* Tasks Overview Section - Only for Coach or Staff with task permissions */}
      {(!userContext.isStaff || hasPermission('tasks:view')) && (
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
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4} gap={3}>
          <HStack spacing={3}>
          <Icon as={FaClock} boxSize={6} color="purple.500" />
            <VStack align="start" spacing={0}>
          <Text fontSize="lg" fontWeight="semibold" color={textColor}>
            Tasks Overview
          </Text>
              <Text fontSize="sm" color={secondaryTextColor}>
                Quick health of your task pipeline
              </Text>
            </VStack>
          </HStack>
          <HStack spacing={3}>
              <HStack spacing={2}>
              <Text fontSize="sm" color={secondaryTextColor}>Completion</Text>
              <Box minW="120px">
                <Progress value={completionRate} size="sm" h="6px" colorScheme="green" borderRadius="full" />
              </Box>
              <Text fontSize="sm" fontWeight="semibold" color={textColor}>{completionRate}%</Text>
            </HStack>
          </HStack>
              </Box>

        <Box
          display="flex"
          flexWrap="wrap"
          gap={3}
          mb={6}
          sx={{ '& > *': { flexShrink: 0 } }}
        >
          {[
            { label: 'Total', value: totalTasks, colorScheme: 'purple', icon: FaTasks },
            { label: 'In Progress', value: inProgressTasks, colorScheme: 'blue', icon: FaSpinner },
            { label: 'Due Today', value: dueToday, colorScheme: 'teal', icon: FaClock },
            { label: 'Overdue', value: overdueTasks, colorScheme: 'red', icon: FaExclamationTriangle },
            { label: 'Completed', value: completedTasks, colorScheme: 'green', icon: FaCheckCircle },
          ].map((item) => (
            <Tag
              key={item.label}
              size="lg"
              borderRadius="6px"
              variant="subtle"
              colorScheme={item.colorScheme}
              px={3}
              py={2}
            >
              <HStack spacing={2}>
                <Icon as={item.icon} />
                <Text fontWeight="700" textTransform="uppercase" fontSize="xs">
                  {item.label}
                </Text>
                <Text fontWeight="800" fontSize="md">
                  {item.value}
                </Text>
              </HStack>
            </Tag>
            ))}
          </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Box p={4} borderRadius="lg" border="1px" borderColor={borderColor} bg={useColorModeValue('white', 'gray.800')}>
            <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={3}>Status mix</Text>
            {Object.entries(tasksData.statusDistribution || {}).map(([status, count]) => {
              const total = Object.values(tasksData.statusDistribution || {}).reduce((a, b) => a + b, 0) || 1;
              const percent = Math.round((count / total) * 100);
              return (
                <Box key={status} mb={3}>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm" color={secondaryTextColor}>{status}</Text>
                    <Text fontSize="sm" fontWeight="semibold" color={textColor}>{count} ({percent}%)</Text>
                  </HStack>
                  <Progress value={percent} size="sm" h="6px" colorScheme="purple" borderRadius="full" />
              </Box>
              );
            })}
          </Box>

          <Box p={4} borderRadius="lg" border="1px" borderColor={borderColor} bg={useColorModeValue('white', 'gray.800')}>
            <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={3}>Priority mix</Text>
            {Object.entries(tasksData.priorityDistribution || {}).map(([priority, count]) => {
              const total = Object.values(tasksData.priorityDistribution || {}).reduce((a, b) => a + b, 0) || 1;
              const percent = Math.round((count / total) * 100);
              const scheme = priority === 'HIGH' ? 'red' : priority === 'MEDIUM' ? 'orange' : 'green';
              return (
                <Box key={priority} mb={3}>
                  <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" color={secondaryTextColor}>{priority}</Text>
                    <Text fontSize="sm" fontWeight="semibold" color={textColor}>{count} ({percent}%)</Text>
                  </HStack>
                  <Progress value={percent} size="sm" h="6px" colorScheme={scheme} borderRadius="full" />
              </Box>
              );
            })}
          </Box>

          <Box p={4} borderRadius="lg" border="1px" borderColor={borderColor} bg={useColorModeValue('white', 'gray.800')}>
            <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={3}>Upcoming vs Overdue</Text>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text fontSize="sm" color={secondaryTextColor}>Due soon</Text>
                <Badge colorScheme="blue" variant="subtle">{upcomingTasks}</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color={secondaryTextColor}>Overdue</Text>
                <Badge colorScheme="red" variant="subtle">{overdueTasks}</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color={secondaryTextColor}>Open</Text>
                <Badge colorScheme="orange" variant="subtle">{openTasks}</Badge>
              </HStack>
            </VStack>
              </Box>
        </SimpleGrid>
      </Box>
      )}


      {/* Recent Leads and Daily Feed Section - Permission-based rendering */}
      {(!userContext.isStaff || shouldRenderSection('leads')) && (
      <Box display="flex" gap={6} mb={6}>
        {/* Recent Leads */}
        <Box
          bg={cardBgColor}
          borderRadius="xl"
          p={6}
          boxShadow={shadowColor}
          border="1px"
          borderColor={borderColor}
          flex="1"
          transition="all 0.3s ease"
        >
          <Box display="flex" alignItems="center" gap={3} mb={4}>
            <Icon as={IoPeopleOutline} boxSize={6} color="blue.500" />
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                {userContext.isStaff ? 'My Recent Leads' : 'Recent Leads'}
            </Text>
              <Badge colorScheme="blue" variant="subtle">
                {userContext.isStaff ? 
                  (dashboardData.leads?.recentLeads?.length || 0) + ' assigned' : 
                  (leads?.recentLeads?.length || 0) + ' total'
                }
              </Badge>
          </Box>
          
          <Box 
            maxH="300px" 
            overflowY="auto"
            sx={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              // Firefox scrollbar styling
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {userContext.isStaff ? (
              // Staff leads data
              dashboardData.leads?.recentLeads && dashboardData.leads.recentLeads.length > 0 ? (
                dashboardData.leads.recentLeads.slice(0, 5).map((lead, index) => (
                  <Box
                    key={lead._id || lead.id || index}
                    display="flex"
                    alignItems="center"
                    gap={4}
                    p={3}
                    borderRadius="lg"
                    _hover={{ bg: hoverBg }}
                    transition="all 0.2s"
                    borderBottom="1px"
                    borderColor={borderColor}
                  >
                    <Box
                      w={8}
                      h={8}
                      borderRadius="full"
                      bg="blue.100"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="blue.600"
                      fontWeight="bold"
                      fontSize="sm"
                    >
                      {lead.name?.charAt(0)?.toUpperCase() || 'L'}
                    </Box>
                    <Box flex="1">
                      <Text fontWeight="semibold" color={textColor}>
                        {lead.name}
                      </Text>
                      <Text fontSize="sm" color={secondaryTextColor}>
                        {lead.email}
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Badge 
                        colorScheme={lead.status === 'Qualified' ? 'green' : lead.status === 'Converted' ? 'blue' : 'orange'} 
                        variant="subtle"
                        size="sm"
                      >
                        {lead.status}
                      </Badge>
                      <Text fontSize="xs" color={secondaryTextColor} mt={1}>
                        Score: {lead.leadScore || 0}
                      </Text>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box textAlign="center" py={8}>
                  <Icon as={FaUser} boxSize={10} color={mutedTextColor} mb={2} />
                  <Text color={mutedTextColor} fontSize="sm">
                    No recent leads
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    mt={3}
                    onClick={() => navigate('/dashboard/leads')}
                  >
                    View All Leads
                  </Button>
                </Box>
              )
            ) : (
              // Coach leads data
              leads?.recentLeads && leads.recentLeads.length > 0 ? (
                leads.recentLeads.slice(0, 5).map((lead, index) => (
                  <Box
                    key={lead.id || lead._id || index}
                    display="flex"
                    alignItems="center"
                    gap={4}
                    p={3}
                    borderRadius="lg"
                    _hover={{ bg: hoverBg }}
                    transition="all 0.2s"
                    borderBottom="1px"
                    borderColor={borderColor}
                  >
                    <Box
                      w={8}
                      h={8}
                      borderRadius="full"
                      bg="blue.100"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="blue.600"
                      fontWeight="bold"
                      fontSize="sm"
                    >
                      {lead.name?.charAt(0)?.toUpperCase() || 'L'}
                    </Box>
                    <Box flex="1">
                      <Text fontWeight="semibold" color={textColor}>
                        {lead.name}
                      </Text>
                      <Text fontSize="sm" color={secondaryTextColor}>
                        {lead.email}
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Badge 
                        colorScheme="blue"
                        variant="subtle"
                        size="sm"
                      >
                        {getFunnelName(lead)}
                      </Badge>
                      <Text fontSize="xs" color={secondaryTextColor} mt={1}>
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </Text>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box textAlign="center" py={8}>
                  <Icon as={FaUser} boxSize={10} color={mutedTextColor} mb={2} />
                  <Text color={mutedTextColor} fontSize="sm">
                    No recent leads
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    mt={3}
                    onClick={() => navigate('/dashboard/leads')}
                  >
                    View All Leads
                  </Button>
                </Box>
              )
            )}
          </Box>
        </Box>
      </Box>
      )}

      {/* Marketing and Calendar Section - Only for Coach */}
      {!userContext.isStaff && (
      <Box display="flex" gap={6} mb={6}>
        {/* Marketing Overview */}
        <Box
          bg={cardBgColor}
          borderRadius="xl"
          p={6}
          boxShadow={shadowColor}
          border="1px"
          borderColor={borderColor}
          flex="1"
          transition="all 0.3s ease"
        >
          <Box display="flex" alignItems="center" gap={3} mb={4}>
            <Icon as={IoStatsChart} boxSize={6} color="green.500" />
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Marketing Overview
            </Text>
            <Badge colorScheme="green" variant="subtle">{marketing?.activeCampaigns || 0} campaigns</Badge>
          </Box>
          
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={4}>
            <Box textAlign="center" p={4} bg={useColorModeValue('green.50', 'green.900')} borderRadius="lg">
              <Text fontSize="sm" color={secondaryTextColor}>Total Spend</Text>
              <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('green.600', 'green.300')}>
                ₹{marketing?.metrics?.totalSpend?.toLocaleString() || '0'}
              </Text>
            </Box>
            <Box textAlign="center" p={4} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="lg">
              <Text fontSize="sm" color={secondaryTextColor}>Avg CPC</Text>
              <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('blue.600', 'blue.300')}>
                ₹{marketing?.metrics?.avgCPC?.toFixed(2) || '0'}
              </Text>
            </Box>
            <Box textAlign="center" p={4} bg={useColorModeValue('purple.50', 'purple.900')} borderRadius="lg">
              <Text fontSize="sm" color={secondaryTextColor}>Avg ROAS</Text>
              <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('purple.600', 'purple.300')}>
                {marketing?.metrics?.avgROAS?.toFixed(1) || '0'}x
              </Text>
            </Box>
            <Box textAlign="center" p={4} bg={useColorModeValue('orange.50', 'orange.900')} borderRadius="lg">
              <Text fontSize="sm" color={secondaryTextColor}>Total Clicks</Text>
              <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('orange.600', 'orange.300')}>
                {marketing?.metrics?.totalClicks?.toLocaleString() || '0'}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Calendar Overview */}
        <Box
          bg={cardBgColor}
          borderRadius="xl"
          p={6}
          boxShadow={shadowColor}
          border="1px"
          borderColor={borderColor}
          flex="1"
          transition="all 0.3s ease"
        >
          <Box display="flex" alignItems="center" gap={3} mb={4}>
            <Icon as={FaCalendar} boxSize={6} color="purple.500" />
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Calendar Overview
            </Text>
            <Badge colorScheme="purple" variant="subtle">{dashboardData.calendar?.stats?.total || 0} total</Badge>
          </Box>
          
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={4}>
            <Box textAlign="center" p={4} bg={useColorModeValue('purple.50', 'purple.900')} borderRadius="lg">
              <Text fontSize="sm" color={secondaryTextColor}>Completed</Text>
              <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('purple.600', 'purple.300')}>
                {dashboardData.calendar?.stats?.completed || 0}
              </Text>
            </Box>
            <Box textAlign="center" p={4} bg={useColorModeValue('red.50', 'red.900')} borderRadius="lg">
              <Text fontSize="sm" color={secondaryTextColor}>Cancelled</Text>
              <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('red.600', 'red.300')}>
                {dashboardData.calendar?.stats?.cancelled || 0}
              </Text>
            </Box>
            <Box textAlign="center" p={4} bg={useColorModeValue('orange.50', 'orange.900')} borderRadius="lg">
              <Text fontSize="sm" color={secondaryTextColor}>No Show</Text>
              <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('orange.600', 'orange.300')}>
                {dashboardData.calendar?.stats?.noShow || 0}
              </Text>
            </Box>
            <Box textAlign="center" p={4} bg={useColorModeValue('green.50', 'green.900')} borderRadius="lg">
              <Text fontSize="sm" color={secondaryTextColor}>Completion Rate</Text>
              <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('green.600', 'green.300')}>
                {dashboardData.calendar?.stats?.completionRate?.toFixed(1) || '0'}%
              </Text>
            </Box>
          </Box>

          {/* Next Appointment */}
          {dashboardData.calendar?.nextAppointment && (
            <Box mt={4} p={4} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="lg">
              <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>Next Appointment</Text>
              <Text fontSize="sm" color={secondaryTextColor}>
                <strong>{dashboardData.calendar.nextAppointment.leadId?.name}</strong> - {dashboardData.calendar.nextAppointment.summary}
              </Text>
              <Text fontSize="xs" color={secondaryTextColor} mt={1}>
                {new Date(dashboardData.calendar.nextAppointment.startTime).toLocaleString()}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
      )}

      {/* Performance Alerts Section - Only for Coach */}
      {!userContext.isStaff && (
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
        <Box display="flex" alignItems="center" gap={3} mb={4}>
          <Icon as={FaExclamationTriangle} boxSize={6} color="orange.500" />
          <Text fontSize="lg" fontWeight="semibold" color={textColor}>
            Performance Alerts
          </Text>
          <Badge colorScheme="orange" variant="subtle">{performance?.alerts?.length || 0} alerts</Badge>
        </Box>
        
        <Box display="flex" flexDirection="column" gap={3}>
          {performance?.alerts?.map((alert, index) => (
            <Box
              key={index}
              p={4}
              borderRadius="lg"
              bg={alert.type === 'warning' ? useColorModeValue('orange.50', 'orange.900') : 
                  alert.type === 'error' ? useColorModeValue('red.50', 'red.900') : 
                  useColorModeValue('green.50', 'green.900')}
              border="1px"
              borderColor={alert.type === 'warning' ? 'orange.200' : 
                          alert.type === 'error' ? 'red.200' : 'green.200'}
            >
              <Box display="flex" alignItems="center" gap={3}>
                <Icon 
                  as={alert.type === 'warning' ? FaExclamationTriangle : 
                      alert.type === 'error' ? FaExclamationTriangle : FaTrophy} 
                  boxSize={5} 
                  color={alert.type === 'warning' ? 'orange.500' : 
                         alert.type === 'error' ? 'red.500' : 'green.500'} 
                />
                <Box flex="1">
                  <Text fontWeight="semibold" color={textColor} fontSize="sm">
                    {alert.message}
                  </Text>
                  <Text fontSize="xs" color={secondaryTextColor} mt={1}>
                    {alert.recommendation}
                  </Text>
                </Box>
                <Badge 
                  colorScheme={alert.type === 'warning' ? 'orange' : 
                              alert.type === 'error' ? 'red' : 'green'} 
                  variant="solid"
                  size="sm"
                >
                  {alert.value}
                </Badge>
              </Box>
            </Box>
          )) || (
            <Text color={secondaryTextColor} textAlign="center" py={4}>
              No performance alerts
            </Text>
          )}
        </Box>
      </Box>
      )}

      {/* Team Analytics Section - Only for Coach */}
      {!userContext.isStaff && (
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
        <Box display="flex" alignItems="center" gap={3} mb={4}>
          <Icon as={FaTrophy} boxSize={6} color="yellow.500" />
          <Text fontSize="lg" fontWeight="semibold" color={textColor}>
            Team Analytics
          </Text>
          <Badge colorScheme="yellow" variant="subtle">{team?.totalStaff || 0} staff</Badge>
        </Box>
        
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
          {/* Top Performer */}
          {team?.teamAnalytics?.topPerformer && (
            <Box p={4} bg={useColorModeValue('yellow.50', 'yellow.900')} borderRadius="lg">
              <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>🏆 Top Performer</Text>
              <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('yellow.600', 'yellow.300')}>
                {team.teamAnalytics.topPerformer.name}
              </Text>
              <Text fontSize="sm" color={secondaryTextColor}>
                Score: {team.teamAnalytics.topPerformer.score} • {team.teamAnalytics.topPerformer.rankingLevel?.name}
              </Text>
            </Box>
          )}

          {/* Most Improved */}
          {team?.teamAnalytics?.mostImproved && (
            <Box p={4} bg={useColorModeValue('green.50', 'green.900')} borderRadius="lg">
              <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>📈 Most Improved</Text>
              <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('green.600', 'green.300')}>
                {team.teamAnalytics.mostImproved.name}
              </Text>
              <Text fontSize="sm" color={secondaryTextColor}>
                +{team.teamAnalytics.mostImproved.improvement} points improvement
              </Text>
            </Box>
          )}

          {/* Team Stats */}
          <Box p={4} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="lg">
            <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>📊 Team Stats</Text>
            <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('blue.600', 'blue.300')}>
              {team?.teamAnalytics?.averageScore || 0} avg score
            </Text>
            <Text fontSize="sm" color={secondaryTextColor}>
              {team?.activeStaff || 0} active staff members
            </Text>
          </Box>

          {/* Level Distribution */}
          <Box p={4} bg={useColorModeValue('purple.50', 'purple.900')} borderRadius="lg">
            <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>🎯 Level Distribution</Text>
            {Object.entries(team?.teamAnalytics?.levelDistribution || {}).map(([level, count]) => (
              <Box key={level} display="flex" justifyContent="space-between" mb={1}>
                <Text fontSize="sm" color={secondaryTextColor}>{level}</Text>
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>{count}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      )}

      {/* Bottom Section - Team Performance and Financial Overview Side by Side - Only for Coach */}
      {!userContext.isStaff && (
      <Box display="flex" gap={6}>
        {/* Team Leaderboard */}
        <Box
          bg={cardBgColor}
          borderRadius="xl"
          p={6}
          boxShadow={shadowColor}
          border="1px"
          borderColor={borderColor}
          flex="1"
          transition="all 0.3s ease"
        >
          <Box display="flex" alignItems="center" gap={3} mb={4}>
            <Icon as={FaTrophy} boxSize={6} color="yellow.500" />
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Team Performance
            </Text>
            <Badge colorScheme="brand" variant="subtle">This Month</Badge>
          </Box>
          
          <Box>
            {team?.leaderboard?.slice(0, 5).map((member, index) => (
              <Box
                key={member.id}
                display="flex"
                alignItems="center"
                gap={4}
                p={3}
                borderRadius="lg"
                _hover={{ bg: hoverBg }}
                transition="all 0.2s"
              >
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  bg={index === 0 ? 'yellow.500' : index === 1 ? 'gray.400' : index === 2 ? 'orange.500' : 'gray.200'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontWeight="bold"
                  fontSize="sm"
                >
                  {member.rank || index + 1}
                </Box>
                <Box flex="1">
                  <Text fontWeight="semibold" color={textColor}>
                    {member.name}
                  </Text>
                  <Text fontSize="sm" color={secondaryTextColor}>
                    Score: {member.score || 0} • {member.rankingLevel?.name || 'Unknown'}
                  </Text>
                </Box>
                <Box textAlign="right">
                  <Text fontWeight="bold" color="brand.600" fontSize="sm">
                    {member.metrics?.leadsHandled || 0} leads
                  </Text>
                  <Text fontSize="xs" color={secondaryTextColor}>
                    {member.metrics?.tasksCompleted || 0}/{member.metrics?.totalTasks || 0} tasks
                  </Text>
                </Box>
              </Box>
            )) || (
              <Text color={secondaryTextColor} textAlign="center" py={4}>
                No team data available
              </Text>
            )}
          </Box>
        </Box>

        {/* Financial Overview */}
        <Box
          bg={cardBgColor}
          borderRadius="xl"
          p={6}
          boxShadow={shadowColor}
          border="1px"
          borderColor={borderColor}
          flex="1"
          transition="all 0.3s ease"
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Financial Overview
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="brand.600">
              ₹{financial?.metrics?.totalRevenue?.toLocaleString() || '0'}
            </Text>
          </Box>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={4}>
            <Box textAlign="center" p={4} bg={useColorModeValue('green.50', 'green.900')} borderRadius="lg">
              <Icon as={IoWalletOutline} boxSize={6} color={useColorModeValue('green.600', 'green.300')} mb={2} />
              <Text fontSize="sm" color={secondaryTextColor}>Total Revenue</Text>
              <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('green.600', 'green.300')}>
                ₹{financial?.metrics?.totalRevenue?.toLocaleString() || '0'}
              </Text>
            </Box>
            <Box textAlign="center" p={4} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="lg">
              <Icon as={FaRegMoneyBillAlt} boxSize={6} color={useColorModeValue('blue.600', 'blue.300')} mb={2} />
              <Text fontSize="sm" color={secondaryTextColor}>Avg Revenue/Day</Text>
              <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('blue.600', 'blue.300')}>
                ₹{financial?.metrics?.avgRevenuePerDay?.toFixed(0) || '0'}
              </Text>
            </Box>
            <Box textAlign="center" p={4} bg={useColorModeValue('purple.50', 'purple.900')} borderRadius="lg">
              <Icon as={FaPercentage} boxSize={6} color={useColorModeValue('purple.600', 'purple.300')} mb={2} />
              <Text fontSize="sm" color={secondaryTextColor}>Total Payments</Text>
              <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('purple.600', 'purple.300')}>
                {financial?.metrics?.totalPayments || '0'}
              </Text>
            </Box>
            <Box textAlign="center" p={4} bg={useColorModeValue('orange.50', 'orange.900')} borderRadius="lg">
              <Icon as={IoStatsChart} boxSize={6} color={useColorModeValue('orange.600', 'orange.300')} mb={2} />
              <Text fontSize="sm" color={secondaryTextColor}>Avg/Client</Text>
              <Text fontSize="lg" fontWeight="semibold" color={useColorModeValue('orange.600', 'orange.300')}>
                ₹{financial?.metrics?.avgRevenuePerClient?.toFixed(0) || '0'}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
      )}

    </Box>
  );
};

export default Dashboard;