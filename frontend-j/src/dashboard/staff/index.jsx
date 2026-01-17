import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Flex, Text, Button, Input, InputGroup, InputLeftElement, 
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, Avatar,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Select, Textarea, Switch, useDisclosure,
  HStack, VStack, Divider, IconButton, Menu, MenuButton, MenuList, MenuItem,
  Alert, AlertIcon, AlertTitle, AlertDescription, useToast,
  Skeleton, SkeletonText, Card, CardBody, CardHeader, Heading,
  SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText,
  Tabs, TabList, TabPanels, Tab, TabPanel, Checkbox, CheckboxGroup,
  Tooltip, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody,
  useColorModeValue, Container, Spacer, Tag, TagLabel, TagCloseButton,
  Progress, CircularProgress, CircularProgressLabel, Center, Wrap, WrapItem,
  GridItem, Grid, Stack, ButtonGroup, FormErrorMessage,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, MenuDivider
} from '@chakra-ui/react';
// Custom SVG Icons hii
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const AddIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6"/>
    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const ViewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
    <polyline points="17,6 23,6 23,12"/>
  </svg>
);

const AwardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const MoreVerticalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1"/>
    <circle cx="12" cy="5" r="1"/>
    <circle cx="12" cy="19" r="1"/>
  </svg>
);

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
    <polyline points="13 2 13 9 20 9"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const ReportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

import axios from 'axios';
import { useSelector } from 'react-redux';
import { getCoachId, getToken, isAuthenticated, debugAuthState } from '../../utils/authUtils';

// --- API CONFIGURATION ---
// API_BASE_URL automatically switches between:
// - Development: http://localhost:8080
// - Production: https://api.funnelseye.com
import { API_BASE_URL } from '../../config/apiConfig';

// --- BEAUTIFUL SKELETON COMPONENTS ---
// Professional Loading Skeleton Component with Smooth Animations
const ProfessionalLoader = () => {
  return (
    <Box maxW="full" py={8} px={6}>
      <VStack spacing={8} align="stretch">
        {/* Header Section with Professional Animation */}
        <Card 
          bg="white" 
          borderRadius="7px" 
          boxShadow="sm" 
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
                  <Skeleton height="40px" width="400px" borderRadius="7px" />
                  <Skeleton height="20px" width="600px" borderRadius="md" />
                </VStack>
                <HStack spacing={4}>
                  <Skeleton height="40px" width="300px" borderRadius="7px" />
                  <Skeleton height="40px" width="150px" borderRadius="7px" />
                </HStack>
              </Flex>
              
              {/* Professional Stats Cards with Gradient Animation */}
              <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                {[...Array(4)].map((_, i) => (
                  <Card 
                    key={i} 
                    variant="outline"
                    borderRadius="7px"
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
                          borderRadius="7px" 
                          startColor="gray.200"
                          endColor="gray.300"
                        />
                        <VStack align="start" spacing={2} flex={1}>
                          <Skeleton height="16px" width="120px" borderRadius="md" />
                          <Skeleton height="32px" width="80px" borderRadius="7px" />
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

        {/* Professional Table Skeleton */}
        <Card 
          bg="white" 
          borderRadius="7px" 
          boxShadow="sm" 
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
                <Skeleton height="32px" width="200px" borderRadius="7px" />
                <Skeleton height="16px" width="300px" borderRadius="md" />
              </VStack>
              <HStack spacing={3}>
                <Skeleton height="32px" width="150px" borderRadius="7px" />
                <Skeleton height="32px" width="150px" borderRadius="7px" />
              </HStack>
            </Flex>
          </CardHeader>
          
          <CardBody pt={0} px={0}>
            <TableContainer w="full" overflowX="auto" borderRadius="7px" border="1px" borderColor="gray.100" className="hide-scrollbar">
              <Table variant="simple" size="md" w="full">
                <Thead>
                  <Tr bg="gray.50">
                    {[...Array(6)].map((_, i) => (
                      <Th key={i} px={{ base: 3, md: 6 }} py={{ base: 3, md: 5 }}>
                        <Skeleton height="16px" width="80px" borderRadius="md" />
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {[...Array(5)].map((_, rowIndex) => (
                    <Tr key={rowIndex} borderBottom="1px" borderColor="gray.100">
                      {[...Array(6)].map((_, cellIndex) => (
                        <Td key={cellIndex} px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }}>
                          {cellIndex === 1 ? (
                            <VStack align="start" spacing={2}>
                              <Skeleton height="20px" width="180px" borderRadius="md" />
                              <Skeleton height="14px" width="250px" borderRadius="sm" />
                              <HStack spacing={2}>
                                <Skeleton height="20px" width="80px" borderRadius="full" />
                                <Skeleton height="20px" width="60px" borderRadius="full" />
                              </HStack>
                            </VStack>
                          ) : cellIndex === 4 ? (
                            <HStack spacing={2} justify="center">
                              <Skeleton height="32px" width="32px" borderRadius="md" />
                              <VStack spacing={0} align="center">
                                <Skeleton height="16px" width="20px" borderRadius="sm" />
                                <Skeleton height="12px" width="40px" borderRadius="sm" />
                              </VStack>
                            </HStack>
                          ) : cellIndex === 5 ? (
                            <HStack spacing={1} justify="center">
                              {[...Array(3)].map((_, btnIndex) => (
                                <Skeleton key={btnIndex} height="32px" width="32px" borderRadius="md" />
                              ))}
                            </HStack>
                          ) : (
                            <Skeleton height="20px" width="60px" borderRadius="md" />
                          )}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

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
            <Text color="gray.500" fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
              Loading staff data...
            </Text>
          </VStack>
        </Box>
      </VStack>
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

// --- BEAUTIFUL STATS CARDS ---
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
      _hover={{ transform: 'translateY(-3px)', shadow: 'xl', borderColor: `${color}.300` }}
      transition="all 0.3s"
      position="relative"
      overflow="hidden"
      boxShadow="sm"
    >
      <CardBody p={4}>
        <HStack spacing={4} align="center" w="full">
          <Box
            p={3}
            bg={iconBg}
            borderRadius="7px"
            color={iconColor}
            boxShadow="sm"
            _groupHover={{ transform: 'scale(1.1)', bg: `${color}.200` }}
            transition="all 0.3s"
          >
            {icon}
          </Box>
          <VStack align="start" spacing={0} flex={1}>
            <Text fontSize="xs" color={`${color}.700`} fontWeight="600" textTransform="uppercase" letterSpacing="wider">
              {title}
            </Text>
            {isLoading ? (
              <Skeleton height="28px" width="70px" />
            ) : (
              <Text fontSize="2xl" fontWeight="800" color={`${color}.800`}>
                {value}
              </Text>
            )}
          </VStack>
          {trend && (
            <Badge 
              colorScheme={trend > 0 ? 'green' : 'red'} 
              variant="subtle" 
              size="sm"
              borderRadius="full"
              px={2}
              py={0.5}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </HStack>
      </CardBody>
    </Card>
  );
};

const StaffManagement = () => {
  // --- AUTHENTICATION & STATE ---
  const { token, user } = useSelector(state => state.auth);
  const showToast = useCustomToast();
  
  // --- STATE MANAGEMENT ---
  const [staffData, setStaffData] = useState([]);
  const [permissions, setPermissions] = useState({ categories: {}, presets: {} });
  const [teamPerformance, setTeamPerformance] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [staffTasks, setStaffTasks] = useState(null);
  const [staffMetrics, setStaffMetrics] = useState(null);
  const [staffLeads, setStaffLeads] = useState(null);
  const [leadDistribution, setLeadDistribution] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  
  // Advanced filtering states
  const [permissionFilter, setPermissionFilter] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Bulk operations states
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Analytics and reports states
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Communication states
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [communicationType, setCommunicationType] = useState('email');
  
  // Export/Import states
  const [exportFormat, setExportFormat] = useState('csv');
  
  // Additional feature states
  const [staffNotes, setStaffNotes] = useState({});
  const [staffDocuments, setStaffDocuments] = useState({});
  const [staffSchedule, setStaffSchedule] = useState({});
  const [attendanceData, setAttendanceData] = useState([]);
  const [performanceReviews, setPerformanceReviews] = useState({});
  const [savedFilters, setSavedFilters] = useState([]);
  const [currentFilter, setCurrentFilter] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [staffOnboarding, setStaffOnboarding] = useState({});
  const [trainingData, setTrainingData] = useState({});
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [taskAssignments, setTaskAssignments] = useState({});
  const [communicationHistory, setCommunicationHistory] = useState({});
  const [customFields, setCustomFields] = useState({});
  const [staffHierarchy, setStaffHierarchy] = useState(null);
  const [timeTracking, setTimeTracking] = useState({});
  const [notifications, setNotifications] = useState([]);
  
  // Modal controls
  const { isOpen: isStaffModalOpen, onOpen: onStaffModalOpen, onClose: onStaffModalClose } = useDisclosure();
  const { isOpen: isPermissionModalOpen, onOpen: onPermissionModalOpen, onClose: onPermissionModalClose } = useDisclosure();
  const { isOpen: isDistributionModalOpen, onOpen: onDistributionModalOpen, onClose: onDistributionModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isDetailsModalOpen, onOpen: onDetailsModalOpen, onClose: onDetailsModalClose } = useDisclosure();
  const { isOpen: isBulkActionModalOpen, onOpen: onBulkActionModalOpen, onClose: onBulkActionModalClose } = useDisclosure();
  const { isOpen: isExportModalOpen, onOpen: onExportModalOpen, onClose: onExportModalClose } = useDisclosure();
  const { isOpen: isAnalyticsModalOpen, onOpen: onAnalyticsModalOpen, onClose: onAnalyticsModalClose } = useDisclosure();
  const { isOpen: isActivityLogModalOpen, onOpen: onActivityLogModalOpen, onClose: onActivityLogModalClose } = useDisclosure();
  const { isOpen: isCommunicationModalOpen, onOpen: onCommunicationModalOpen, onClose: onCommunicationModalClose } = useDisclosure();
  const { isOpen: isNotesModalOpen, onOpen: onNotesModalOpen, onClose: onNotesModalClose } = useDisclosure();
  const { isOpen: isDocumentsModalOpen, onOpen: onDocumentsModalOpen, onClose: onDocumentsModalClose } = useDisclosure();
  const { isOpen: isScheduleModalOpen, onOpen: onScheduleModalOpen, onClose: onScheduleModalClose } = useDisclosure();
  const { isOpen: isAttendanceModalOpen, onOpen: onAttendanceModalOpen, onClose: onAttendanceModalClose } = useDisclosure();
  const { isOpen: isReviewModalOpen, onOpen: onReviewModalOpen, onClose: onReviewModalClose } = useDisclosure();
  const { isOpen: isComparisonModalOpen, onOpen: onComparisonModalOpen, onClose: onComparisonModalClose } = useDisclosure();
  const { isOpen: isOnboardingModalOpen, onOpen: onOnboardingModalOpen, onClose: onOnboardingModalClose } = useDisclosure();
  const { isOpen: isTrainingModalOpen, onOpen: onTrainingModalOpen, onClose: onTrainingModalClose } = useDisclosure();
  const { isOpen: isLeaveModalOpen, onOpen: onLeaveModalOpen, onClose: onLeaveModalClose } = useDisclosure();
  const { isOpen: isHierarchyModalOpen, onOpen: onHierarchyModalOpen, onClose: onHierarchyModalClose } = useDisclosure();
  const { isOpen: isTimeTrackingModalOpen, onOpen: onTimeTrackingModalOpen, onClose: onTimeTrackingModalClose } = useDisclosure();
  const { isOpen: isReportsModalOpen, onOpen: onReportsModalOpen, onClose: onReportsModalClose } = useDisclosure();
  
  // Form states
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    password: '',
    permissions: []
  });
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [permissionSearch, setPermissionSearch] = useState('');
  
  // Check if user is coach
  const isCoach = user?.role === 'coach';
  
  // --- API CONFIGURATION ---
  const apiConfig = useMemo(() => ({
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }), [token]);

  // --- API FUNCTIONS ---
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/coach/staff`, apiConfig);
      if (response.data.success) {
        setStaffData(response.data.data || []);
      } else {
        showToast('Failed to fetch staff data', 'error');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      showToast(error.response?.data?.message || 'Failed to fetch staff data', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiConfig, showToast]);

  // Fetch permissions
  const fetchPermissions = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/public/permissions`);
      if (response.data.success) {
        setPermissions(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  }, []);

  // Fetch team performance
  const fetchTeamPerformance = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/coach/staff/team-performance`, apiConfig);
      if (response.data.success) {
        setTeamPerformance(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch team performance:', error);
    }
  }, [apiConfig]);

  // Fetch staff details
  const fetchStaffDetails = useCallback(async (staffId) => {
    try {
      const [tasksRes, metricsRes, leadsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/coach/staff/${staffId}/tasks`, apiConfig),
        axios.get(`${API_BASE_URL}/api/coach/staff/${staffId}/metrics`, apiConfig),
        axios.get(`${API_BASE_URL}/api/coach/staff/${staffId}/leads`, apiConfig)
      ]);
      
      if (tasksRes.data.success) setStaffTasks(tasksRes.data.data);
      if (metricsRes.data.success) setStaffMetrics(metricsRes.data.data);
      if (leadsRes.data.success) setStaffLeads(leadsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch staff details:', error);
    }
  }, [apiConfig]);

  // Fetch lead distribution (coach only)
  const fetchLeadDistribution = useCallback(async () => {
    if (!isCoach) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/coach/staff/lead-distribution`, apiConfig);
      if (response.data.success) {
        setLeadDistribution(response.data.data.staff || []);
      }
    } catch (error) {
      console.error('Failed to fetch lead distribution:', error);
    }
  }, [apiConfig, isCoach]);

  // Create new staff member
  const createStaff = useCallback(async () => {
    // Validation
    if (!newStaff.name.trim()) {
      showToast('Please enter staff name', 'error');
      return;
    }
    if (!newStaff.email.trim()) {
      showToast('Please enter staff email', 'error');
      return;
    }
    if (!newStaff.password.trim()) {
      showToast('Please enter staff password', 'error');
      return;
    }
    if (selectedPermissions.length === 0) {
      showToast('Please select at least one permission preset or custom permissions', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/coach/staff`, {
        name: newStaff.name.trim(),
        email: newStaff.email.trim(),
        password: newStaff.password.trim(),
        permissions: selectedPermissions
      }, apiConfig);
      
      if (response.data.success) {
        showToast(`Staff member "${newStaff.name}" created successfully with ${selectedPermissions.length} permissions`, 'success');
        onStaffModalClose();
        setNewStaff({ name: '', email: '', password: '', permissions: [] });
        setSelectedPermissions([]);
        setSelectedPreset('');
        fetchStaff();
      } else {
        showToast(response.data.message || 'Failed to create staff member', 'error');
      }
    } catch (error) {
      console.error('Error creating staff:', error);
      showToast(error.response?.data?.message || 'Failed to create staff member', 'error');
    } finally {
      setLoading(false);
    }
  }, [newStaff, selectedPermissions, apiConfig, showToast, onStaffModalClose, fetchStaff]);

  // Update staff permissions
  const updateStaffPermissions = useCallback(async (staffId, permissions) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/api/coach/staff/${staffId}/permissions`, {
        permissions
      }, apiConfig);
      
      if (response.data.success) {
        showToast('Staff permissions updated successfully', 'success');
        fetchStaff();
      } else {
        showToast('Failed to update permissions', 'error');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      showToast('Failed to update permissions', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiConfig, showToast, fetchStaff]);

  // Assign permission preset
  const assignPreset = useCallback(async (staffId, presetName) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/coach/staff/${staffId}/permission-group`, {
        presetName
      }, apiConfig);
      
      if (response.data.success) {
        showToast(`${presetName} preset assigned successfully`, 'success');
        fetchStaff();
      } else {
        showToast('Failed to assign preset', 'error');
      }
    } catch (error) {
      console.error('Error assigning preset:', error);
      showToast('Failed to assign preset', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiConfig, showToast, fetchStaff]);

  // Toggle staff status
  const toggleStaffStatus = useCallback(async (staffId) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/api/coach/staff/${staffId}/toggle-status`, {}, apiConfig);
      
      if (response.data.success) {
        showToast('Staff status updated successfully', 'success');
        fetchStaff();
      } else {
        showToast('Failed to update staff status', 'error');
      }
    } catch (error) {
      console.error('Error toggling staff status:', error);
      showToast('Failed to update staff status', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiConfig, showToast, fetchStaff]);

  // Update lead distribution
  const updateLeadDistribution = useCallback(async (distributions) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/api/coach/staff/lead-distribution`, {
        distributions
      }, apiConfig);
      
      if (response.data.success) {
        showToast('Lead distribution updated successfully', 'success');
        fetchLeadDistribution();
      } else {
        showToast('Failed to update lead distribution', 'error');
      }
    } catch (error) {
      console.error('Error updating lead distribution:', error);
      showToast('Failed to update lead distribution', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiConfig, showToast, fetchLeadDistribution]);

  // Delete staff member
  const deleteStaff = useCallback(async (staffId) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE_URL}/api/coach/staff/${staffId}`, apiConfig);
      
      if (response.data.success) {
        showToast('Staff member deleted successfully', 'success');
        fetchStaff();
      } else {
        showToast('Failed to delete staff member', 'error');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      showToast('Failed to delete staff member', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiConfig, showToast, fetchStaff]);

  // --- BULK OPERATIONS ---
  const bulkUpdateStatus = useCallback(async (staffIds, status) => {
    try {
      setLoading(true);
      const promises = staffIds.map(id => 
        axios.put(`${API_BASE_URL}/api/coach/staff/${id}/toggle-status`, {}, apiConfig)
      );
      await Promise.all(promises);
      showToast(`${staffIds.length} staff members ${status === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
      fetchStaff();
      setSelectedStaffIds([]);
    } catch (error) {
      console.error('Error bulk updating status:', error);
      showToast('Failed to update staff status', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiConfig, showToast, fetchStaff]);

  const bulkDeleteStaff = useCallback(async (staffIds) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/coach/staff/bulk-delete`, {
        staffIds
      }, apiConfig);
      
      if (response.data.success) {
        showToast(`Successfully deleted ${response.data.data.deletedCount} staff member(s)`, 'success');
        setSelectedStaffIds([]);
        fetchStaff();
      } else {
        showToast('Failed to delete staff members', 'error');
      }
    } catch (error) {
      console.error('Error bulk deleting staff:', error);
      showToast(error.response?.data?.message || 'Failed to delete staff members', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiConfig, showToast, fetchStaff]);

  const bulkUpdatePermissions = useCallback(async (staffIds, permissions) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE_URL}/api/coach/staff/bulk-permissions`, {
        staffIds,
        permissions
      }, apiConfig);
      
      if (response.data.success) {
        showToast(`Permissions updated for ${staffIds.length} staff members`, 'success');
        fetchStaff();
        setSelectedStaffIds([]);
      } else {
        showToast('Failed to update permissions', 'error');
      }
    } catch (error) {
      console.error('Error bulk updating permissions:', error);
      showToast('Failed to update permissions', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiConfig, showToast, fetchStaff]);

  // --- EXPORT/IMPORT ---
  const exportStaffData = useCallback(async (format = 'csv') => {
    try {
      setLoading(true);
      
      // Apply same filtering logic as filteredStaff
      let filtered = [...staffData];
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(staff => 
          staff.name?.toLowerCase().includes(searchLower) ||
          staff.email?.toLowerCase().includes(searchLower)
        );
      }
      
      if (statusFilter) {
        filtered = filtered.filter(staff => 
          statusFilter === 'active' ? staff.isActive : !staff.isActive
        );
      }
      
      if (permissionFilter) {
        filtered = filtered.filter(staff => 
          staff.permissions?.includes(permissionFilter)
        );
      }
      
      if (performanceFilter) {
        filtered = filtered.filter(staff => {
          const score = teamPerformance?.teamLeaderboard?.find(m => m.staffId === staff._id)?.performanceScore || 0;
          if (performanceFilter === 'high') return score >= 80;
          if (performanceFilter === 'medium') return score >= 50 && score < 80;
          if (performanceFilter === 'low') return score < 50;
          return true;
        });
      }
      
      if (dateRangeFilter.start || dateRangeFilter.end) {
        filtered = filtered.filter(staff => {
          const createdDate = new Date(staff.createdAt);
          if (dateRangeFilter.start && createdDate < new Date(dateRangeFilter.start)) return false;
          if (dateRangeFilter.end && createdDate > new Date(dateRangeFilter.end)) return false;
          return true;
        });
      }
      
      const data = filtered.map(staff => ({
        Name: staff.name,
        Email: staff.email,
        Status: staff.isActive ? 'Active' : 'Inactive',
        Permissions: staff.permissions?.length || 0,
        'Last Active': staff.lastActive ? new Date(staff.lastActive).toLocaleDateString() : 'Never',
        'Lead Ratio': staff.distributionRatio || 1,
        'Created At': staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : ''
      }));

      if (format === 'csv') {
        const headers = Object.keys(data[0] || {});
        const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `staff_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        showToast('Staff data exported successfully', 'success');
      } else if (format === 'json') {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `staff_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        showToast('Staff data exported successfully', 'success');
      }
    } catch (error) {
      console.error('Error exporting staff data:', error);
      showToast('Failed to export staff data', 'error');
    } finally {
      setLoading(false);
    }
  }, [staffData, searchTerm, statusFilter, permissionFilter, performanceFilter, dateRangeFilter, teamPerformance, showToast]);

  const importStaffData = useCallback(async (file) => {
    try {
      setLoading(true);
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const importedData = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const staff = {};
        headers.forEach((header, index) => {
          staff[header.toLowerCase().replace(/\s+/g, '')] = values[index] || '';
        });
        return staff;
      });

      // Create staff members
      let successCount = 0;
      for (const staffData of importedData) {
        try {
          await axios.post(`${API_BASE_URL}/api/coach/staff`, {
            name: staffData.name || staffData.Name,
            email: staffData.email || staffData.Email,
            password: 'TempPassword123!', // Default password, should be changed
            permissions: []
          }, apiConfig);
          successCount++;
        } catch (error) {
          console.error('Error importing staff:', error);
        }
      }

      showToast(`${successCount} staff members imported successfully`, 'success');
      fetchStaff();
    } catch (error) {
      console.error('Error importing staff data:', error);
      showToast('Failed to import staff data', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiConfig, showToast, fetchStaff]);

  // --- ANALYTICS & REPORTS ---
  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/coach/staff/team-performance`, apiConfig);
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, [apiConfig]);

  const fetchActivityLogs = useCallback(async (staffId = null) => {
    try {
      const url = staffId 
        ? `${API_BASE_URL}/api/coach/staff/${staffId}/activity`
        : `${API_BASE_URL}/api/coach/staff/activity`;
      const response = await axios.get(url, apiConfig);
      if (response.data.success) {
        setActivityLogs(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      // If endpoint doesn't exist, create mock data
      setActivityLogs([]);
    }
  }, [apiConfig]);

  // --- COMMUNICATION ---
  const sendCommunication = useCallback(async (staffIds, type, subject, message) => {
    try {
      setLoading(true);
      // This would integrate with your messaging system
      const response = await axios.post(`${API_BASE_URL}/api/central-messaging/v1/send`, {
        recipients: staffIds.map(id => {
          const staff = staffData.find(s => s._id === id);
          return type === 'email' ? staff?.email : staff?.phone;
        }),
        type,
        subject,
        message
      }, apiConfig);
      
      if (response.data.success) {
        showToast(`Message sent to ${staffIds.length} staff members`, 'success');
        // Update communication history
        staffIds.forEach(id => {
          setCommunicationHistory(prev => ({
            ...prev,
            [id]: [...(prev[id] || []), {
              type,
              subject,
              message,
              timestamp: new Date().toISOString(),
              sentBy: user?.email || 'System'
            }]
          }));
        });
      } else {
        showToast('Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Error sending communication:', error);
      showToast('Failed to send message', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiConfig, showToast, staffData, user]);

  // --- NOTES MANAGEMENT ---
  const saveStaffNote = useCallback(async (staffId, note) => {
    try {
      setStaffNotes(prev => ({
        ...prev,
        [staffId]: [...(prev[staffId] || []), {
          note,
          timestamp: new Date().toISOString(),
          createdBy: user?.email || 'System'
        }]
      }));
      showToast('Note saved successfully', 'success');
    } catch (error) {
      console.error('Error saving note:', error);
      showToast('Failed to save note', 'error');
    }
  }, [showToast, user]);

  const deleteStaffNote = useCallback((staffId, noteIndex) => {
    setStaffNotes(prev => ({
      ...prev,
      [staffId]: prev[staffId]?.filter((_, index) => index !== noteIndex) || []
    }));
    showToast('Note deleted successfully', 'success');
  }, [showToast]);

  // --- DOCUMENT MANAGEMENT ---
  const uploadStaffDocument = useCallback(async (staffId, file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('staffId', staffId);
      
      const response = await axios.post(`${API_BASE_URL}/api/files/upload`, formData, {
        ...apiConfig,
        headers: {
          ...apiConfig.headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setStaffDocuments(prev => ({
          ...prev,
          [staffId]: [...(prev[staffId] || []), {
            name: file.name,
            url: response.data.data.url,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          }]
        }));
        showToast('Document uploaded successfully', 'success');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      showToast('Failed to upload document', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiConfig, showToast]);

  // --- ATTENDANCE MANAGEMENT ---
  const markAttendance = useCallback(async (staffId, status, date = new Date()) => {
    try {
      const attendanceRecord = {
        staffId,
        date: date.toISOString().split('T')[0],
        status, // 'present', 'absent', 'late', 'half-day'
        markedAt: new Date().toISOString(),
        markedBy: user?.email || 'System'
      };
      
      setAttendanceData(prev => {
        const filtered = prev.filter(a => 
          a.staffId !== staffId || a.date !== attendanceRecord.date
        );
        return [...filtered, attendanceRecord];
      });
      
      showToast('Attendance marked successfully', 'success');
    } catch (error) {
      console.error('Error marking attendance:', error);
      showToast('Failed to mark attendance', 'error');
    }
  }, [showToast, user]);

  // --- PERFORMANCE REVIEWS ---
  const createPerformanceReview = useCallback(async (staffId, reviewData) => {
    try {
      setPerformanceReviews(prev => ({
        ...prev,
        [staffId]: [...(prev[staffId] || []), {
          ...reviewData,
          reviewDate: new Date().toISOString(),
          reviewedBy: user?.email || 'System'
        }]
      }));
      showToast('Performance review created successfully', 'success');
    } catch (error) {
      console.error('Error creating review:', error);
      showToast('Failed to create review', 'error');
    }
  }, [showToast, user]);

  // --- SCHEDULING ---
  const updateStaffSchedule = useCallback(async (staffId, schedule) => {
    try {
      setStaffSchedule(prev => ({
        ...prev,
        [staffId]: schedule
      }));
      showToast('Schedule updated successfully', 'success');
    } catch (error) {
      console.error('Error updating schedule:', error);
      showToast('Failed to update schedule', 'error');
    }
  }, [showToast]);

  // --- TIME TRACKING ---
  const startTimeTracking = useCallback((staffId) => {
    setTimeTracking(prev => ({
      ...prev,
      [staffId]: {
        startTime: new Date().toISOString(),
        isTracking: true
      }
    }));
    showToast('Time tracking started', 'success');
  }, [showToast]);

  const stopTimeTracking = useCallback((staffId) => {
    const tracking = timeTracking[staffId];
    if (tracking) {
      const duration = new Date() - new Date(tracking.startTime);
      setTimeTracking(prev => ({
        ...prev,
        [staffId]: {
          ...prev[staffId],
          isTracking: false,
          endTime: new Date().toISOString(),
          duration: duration
        }
      }));
      showToast('Time tracking stopped', 'success');
    }
  }, [timeTracking, showToast]);

  // --- LEAVE MANAGEMENT ---
  const requestLeave = useCallback(async (staffId, leaveData) => {
    try {
      const leaveRequest = {
        staffId,
        ...leaveData,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };
      
      setLeaveRequests(prev => [...prev, leaveRequest]);
      showToast('Leave request submitted successfully', 'success');
    } catch (error) {
      console.error('Error submitting leave request:', error);
      showToast('Failed to submit leave request', 'error');
    }
  }, [showToast]);

  const approveLeave = useCallback((requestId) => {
    setLeaveRequests(prev => prev.map(req => 
      req._id === requestId ? { ...req, status: 'approved' } : req
    ));
    showToast('Leave request approved', 'success');
  }, [showToast]);

  // --- TASK ASSIGNMENT ---
  const assignTask = useCallback(async (staffId, taskData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/workflow/tasks`, {
        ...taskData,
        assignedTo: staffId
      }, apiConfig);
      
      if (response.data.success) {
        setTaskAssignments(prev => ({
          ...prev,
          [staffId]: [...(prev[staffId] || []), response.data.data]
        }));
        showToast('Task assigned successfully', 'success');
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      showToast('Failed to assign task', 'error');
    }
  }, [apiConfig, showToast]);

  // --- STAFF ONBOARDING ---
  const updateOnboardingStatus = useCallback((staffId, step, completed) => {
    setStaffOnboarding(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [step]: completed,
        updatedAt: new Date().toISOString()
      }
    }));
    showToast('Onboarding status updated', 'success');
  }, [showToast]);

  // --- TRAINING MANAGEMENT ---
  const assignTraining = useCallback((staffId, trainingData) => {
    setTrainingData(prev => ({
      ...prev,
      [staffId]: [...(prev[staffId] || []), {
        ...trainingData,
        assignedAt: new Date().toISOString(),
        status: 'assigned'
      }]
    }));
    showToast('Training assigned successfully', 'success');
  }, [showToast]);

  // --- SAVED FILTERS ---
  const saveCurrentFilter = useCallback(() => {
    const filter = {
      id: Date.now().toString(),
      name: `Filter ${savedFilters.length + 1}`,
      searchTerm,
      statusFilter,
      permissionFilter,
      performanceFilter,
      dateRangeFilter,
      sortBy,
      sortOrder
    };
    setSavedFilters(prev => [...prev, filter]);
    showToast('Filter saved successfully', 'success');
  }, [searchTerm, statusFilter, permissionFilter, performanceFilter, dateRangeFilter, sortBy, sortOrder, savedFilters.length, showToast]);

  const loadFilter = useCallback((filter) => {
    setSearchTerm(filter.searchTerm || '');
    setStatusFilter(filter.statusFilter || '');
    setPermissionFilter(filter.permissionFilter || '');
    setPerformanceFilter(filter.performanceFilter || '');
    setDateRangeFilter(filter.dateRangeFilter || { start: '', end: '' });
    setSortBy(filter.sortBy || 'name');
    setSortOrder(filter.sortOrder || 'asc');
    setCurrentFilter(filter);
    showToast('Filter loaded successfully', 'success');
  }, [showToast]);

  // --- STAFF COMPARISON ---
  const toggleComparisonMode = useCallback(() => {
    setComparisonMode(prev => !prev);
    if (!comparisonMode) {
      setSelectedForComparison([]);
    }
  }, [comparisonMode]);

  const handleTabChange = useCallback((index) => {
    if (index === 1) {
      if (selectedForComparison.length === 0 && selectedStaffIds.length > 0) {
        setSelectedForComparison(selectedStaffIds);
      }
    }
  }, [selectedForComparison.length, selectedStaffIds]);

  // --- REPORTS GENERATION ---
  const generateReport = useCallback(async (reportType, options = {}) => {
    try {
      setLoading(true);
      const reportData = {
        type: reportType,
        staffIds: options.staffIds || staffData.map(s => s._id),
        dateRange: options.dateRange || dateRangeFilter,
        format: options.format || 'pdf'
      };
      
      // Generate report data
      const report = {
        generatedAt: new Date().toISOString(),
        type: reportType,
        data: reportData
      };
      
      showToast(`${reportType} report generated successfully`, 'success');
      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      showToast('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  }, [staffData, dateRangeFilter, showToast]);

  // --- UTILITY FUNCTIONS ---
  const handlePresetSelect = useCallback((presetName) => {
    const preset = permissions.presets[presetName];
    if (preset) {
      setSelectedPermissions(preset.permissions);
      setSelectedPreset(presetName);
    }
  }, [permissions.presets]);

  const handleStaffSelect = useCallback((staff) => {
    setSelectedStaff(staff);
    onDetailsModalOpen();
  }, [onDetailsModalOpen]);

  const handleDeleteClick = useCallback((staff) => {
    setStaffToDelete(staff);
    onDeleteModalOpen();
  }, [onDeleteModalOpen]);

  const confirmDelete = useCallback(async () => {
    if (staffToDelete) {
      await deleteStaff(staffToDelete._id);
      setStaffToDelete(null);
      onDeleteModalClose();
    }
  }, [staffToDelete, deleteStaff, onDeleteModalClose]);

  // Advanced filtering and sorting
  const filteredStaff = useMemo(() => {
    let filtered = [...staffData];
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(staff => 
        staff.name?.toLowerCase().includes(searchLower) ||
        staff.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(staff => 
        statusFilter === 'active' ? staff.isActive : !staff.isActive
      );
    }
    
    // Permission filter
    if (permissionFilter) {
      filtered = filtered.filter(staff => 
        staff.permissions?.includes(permissionFilter)
      );
    }
    
    // Performance filter
    if (performanceFilter) {
      filtered = filtered.filter(staff => {
        const score = teamPerformance?.teamLeaderboard?.find(m => m.staffId === staff._id)?.performanceScore || 0;
        if (performanceFilter === 'high') return score >= 80;
        if (performanceFilter === 'medium') return score >= 50 && score < 80;
        if (performanceFilter === 'low') return score < 50;
        return true;
      });
    }
    
    // Date range filter
    if (dateRangeFilter.start || dateRangeFilter.end) {
      filtered = filtered.filter(staff => {
        const createdDate = new Date(staff.createdAt);
        if (dateRangeFilter.start && createdDate < new Date(dateRangeFilter.start)) return false;
        if (dateRangeFilter.end && createdDate > new Date(dateRangeFilter.end)) return false;
        return true;
      });
    }
    
    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
          break;
        case 'email':
          aVal = a.email?.toLowerCase() || '';
          bVal = b.email?.toLowerCase() || '';
          break;
        case 'status':
          aVal = a.isActive ? 1 : 0;
          bVal = b.isActive ? 1 : 0;
          break;
        case 'permissions':
          aVal = a.permissions?.length || 0;
          bVal = b.permissions?.length || 0;
          break;
        case 'performance':
          aVal = teamPerformance?.teamLeaderboard?.find(m => m.staffId === a._id)?.performanceScore || 0;
          bVal = teamPerformance?.teamLeaderboard?.find(m => m.staffId === b._id)?.performanceScore || 0;
          break;
        case 'created':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        default:
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    
    return filtered;
  }, [staffData, searchTerm, statusFilter, permissionFilter, performanceFilter, dateRangeFilter, sortBy, sortOrder, teamPerformance]);

  // Load data on component mount
  useEffect(() => {
    fetchStaff();
    fetchPermissions();
    fetchTeamPerformance();
    fetchLeadDistribution();
    fetchAnalytics();
    fetchActivityLogs();
  }, [fetchStaff, fetchPermissions, fetchTeamPerformance, fetchLeadDistribution, fetchAnalytics, fetchActivityLogs]);

  // Load staff details when selected
  useEffect(() => {
    if (selectedStaff) {
      fetchStaffDetails(selectedStaff._id);
    }
  }, [selectedStaff, fetchStaffDetails]);

  // --- RENDER FUNCTIONS ---
  const renderPermissionCategories = () => {
    return Object.entries(permissions.categories || {}).map(([category, data]) => (
      <Box key={category} mb={6}>
        <Heading size="md" mb={3} color="gray.700">
          {category}
        </Heading>
        <CheckboxGroup
          value={selectedPermissions}
          onChange={setSelectedPermissions}
        >
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
            {data.permissions.map((permission) => (
              <Checkbox
                key={permission.permission}
                value={permission.permission}
                colorScheme="blue"
              >
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    {permission.icon} {permission.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {permission.description}
                  </Text>
                </VStack>
              </Checkbox>
            ))}
          </SimpleGrid>
        </CheckboxGroup>
      </Box>
    ));
  };

  const renderPermissionPresets = () => {
    return Object.entries(permissions.presets || {}).map(([name, preset]) => (
      <Button
        key={name}
        variant={selectedPreset === name ? 'solid' : 'outline'}
        size="sm"
        onClick={() => handlePresetSelect(name)}
        colorScheme={selectedPreset === name ? 'green' : 'gray'}
        mb={2}
        mr={2}
        borderRadius="7px"
        _hover={{ 
          transform: 'translateY(-2px)', 
          boxShadow: 'lg',
          bg: selectedPreset === name ? 'green.600' : 'gray.50'
        }}
        transition="all 0.3s ease"
        fontWeight="semibold"
        px={4}
        py={2}
        border="2px"
        borderColor={selectedPreset === name ? 'green.500' : 'gray.300'}
        bg={selectedPreset === name ? 'green.500' : 'white'}
        color={selectedPreset === name ? 'white' : 'gray.700'}
      >
        <HStack spacing={2}>
          <Text>{name}</Text>
          <Badge 
            colorScheme={selectedPreset === name ? 'white' : 'green'} 
            variant={selectedPreset === name ? 'solid' : 'subtle'}
            borderRadius="full"
            px={2}
            py={0}
            fontSize="xs"
          >
            {preset.permissionCount}
          </Badge>
        </HStack>
      </Button>
    ));
  };

  const renderStaffCard = (staff) => {
    const isSelected = selectedStaffIds.includes(staff._id);
    return (
      <Card 
        key={staff._id} 
        bg={isSelected ? "blue.50" : "white"}
        borderRadius="7px" 
        boxShadow={isSelected ? "md" : "sm"}
        border={isSelected ? "2px" : "1px"}
        borderColor={isSelected ? "blue.300" : "gray.200"}
        _hover={{ shadow: 'md' }}
        transition="all 0.3s"
        position="relative"
      >
        {isCoach && (
          <Box position="absolute" top={3} left={3} zIndex={1}>
            {comparisonMode ? (
              <Checkbox
                isChecked={selectedForComparison.includes(staff._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedForComparison([...selectedForComparison, staff._id]);
                  } else {
                    setSelectedForComparison(selectedForComparison.filter(id => id !== staff._id));
                  }
                }}
                colorScheme="purple"
                size="lg"
              />
            ) : (
              <Checkbox
                isChecked={isSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStaffIds([...selectedStaffIds, staff._id]);
                  } else {
                    setSelectedStaffIds(selectedStaffIds.filter(id => id !== staff._id));
                  }
                }}
                colorScheme="blue"
                size="lg"
              />
            )}
          </Box>
        )}
        <CardHeader>
          <Flex justify="space-between" align="center">
            <HStack>
              <Avatar name={staff.name} size="md" />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold" color="gray.800">
                  {staff.name}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {staff.email}
                </Text>
              </VStack>
            </HStack>
            <Menu>
              <MenuButton as={IconButton} icon={<MoreVerticalIcon />} variant="ghost" />
              <MenuList>
                <MenuItem icon={<ViewIcon />} onClick={() => handleStaffSelect(staff)}>
                  View Details
                </MenuItem>
                {isCoach && (
                  <>
                    <MenuItem icon={<EditIcon />} onClick={() => {
                      setSelectedStaff(staff);
                      setSelectedPermissions(staff.permissions || []);
                      onPermissionModalOpen();
                    }}>
                      Manage Permissions
                    </MenuItem>
                    <MenuItem icon={<SettingsIcon />} onClick={() => toggleStaffStatus(staff._id)}>
                      {staff.isActive ? 'Deactivate' : 'Activate'}
                    </MenuItem>
                    <MenuItem icon={<ViewIcon />} onClick={() => {
                      setSelectedStaff(staff);
                      fetchActivityLogs(staff._id);
                      onActivityLogModalOpen();
                    }}>
                      View Activity Logs
                    </MenuItem>
                    
                    <MenuItem icon={<ViewIcon />} onClick={() => {
                      setSelectedStaff(staff);
                      onAttendanceModalOpen();
                    }}>
                      Mark Attendance
                    </MenuItem>
                    <MenuItem icon={<AwardIcon />} onClick={() => {
                      setSelectedStaff(staff);
                      onReviewModalOpen();
                    }}>
                      Performance Review
                    </MenuItem>
                    <MenuItem icon={<TargetIcon />} onClick={() => {
                      setSelectedStaff(staff);
                      onTimeTrackingModalOpen();
                    }}>
                      Time Tracking
                    </MenuItem>
                    <MenuItem icon={<ViewIcon />} onClick={() => {
                      setSelectedStaff(staff);
                      onLeaveModalOpen();
                    }}>
                      Leave Management
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem icon={<DeleteIcon />} color="red.500" onClick={() => handleDeleteClick(staff)}>
                      Delete
                    </MenuItem>
                  </>
                )}
              </MenuList>
            </Menu>
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">Status</Text>
              <Badge colorScheme={staff.isActive ? 'green' : 'red'}>
                {staff.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">Permissions</Text>
              <Text fontSize="sm" fontWeight="medium">
                {staff.permissions?.length || 0}
              </Text>
            </HStack>
            
            {isCoach && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">Lead Ratio</Text>
                <Text fontSize="sm" fontWeight="medium">
                  {staff.distributionRatio || 1}x
                </Text>
              </HStack>
            )}
            
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">Last Active</Text>
              <Text fontSize="sm">
                {staff.lastActive ? new Date(staff.lastActive).toLocaleDateString() : 'Never'}
              </Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    );
  };

  const renderTeamLeaderboard = () => {
    if (!teamPerformance) return <Skeleton height="200px" />;
    
    return (
      <Card bg="white" borderRadius="7px" boxShadow="sm" border="1px" borderColor="gray.200">
        <CardHeader pb={3}>
          <Heading size="sm" color="gray.800" fontWeight="semibold">
            Team Performance Leaderboard
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            {teamPerformance.teamLeaderboard?.map((member, index) => (
              <HStack
                key={member.staffId}
                w="full"
                p={3}
                bg={member.isCurrentUser ? 'blue.50' : 'transparent'}
                borderRadius="md"
                border={member.isCurrentUser ? '2px solid' : '1px solid'}
                borderColor={member.isCurrentUser ? 'blue.200' : 'gray.200'}
              >
                <Text fontWeight="bold" color={member.isCurrentUser ? 'blue.600' : 'gray.800'}>
                  #{member.rank}
                </Text>
                <Avatar name={member.staffName} size="sm" />
                <VStack align="start" flex={1} spacing={0}>
                  <Text fontWeight="medium" color="gray.800">
                    {member.staffName}
                    {member.isCurrentUser && <Text as="span" color="blue.500"> (You)</Text>}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {member.leadsAssigned} leads • {member.conversionRate}% conversion
                  </Text>
                </VStack>
                <VStack align="end" spacing={0}>
                  <Text fontWeight="bold" color="green.500">
                    {member.performanceScore}
                  </Text>
                  <Text fontSize="xs" color="gray.500">Score</Text>
                </VStack>
              </HStack>
            ))}
          </VStack>
          
          {teamPerformance.teamAverage && (
            <Box mt={4} p={3} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" color="gray.500">
                Team Average: {teamPerformance.teamAverage.conversionRate}% conversion • 
                {teamPerformance.teamAverage.leadsPerStaff} leads per staff
              </Text>
            </Box>
          )}
        </CardBody>
      </Card>
    );
  };

  const renderLeadDistribution = () => {
    if (!isCoach) return null;
    
    return (
      <Card bg="white" borderRadius="7px" boxShadow="sm" border="1px" borderColor="gray.200">
        <CardHeader pb={3}>
          <Flex justify="space-between" align="center">
            <Heading size="sm" color="gray.800" fontWeight="semibold">
              Lead Distribution
            </Heading>
            <Button size="xs" variant="ghost" onClick={onDistributionModalOpen}>
              <EditIcon />
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            {leadDistribution.map((staff) => (
              <HStack key={staff.staffId} w="full" justify="space-between">
                <Text color="gray.800">{staff.name}</Text>
                <HStack>
                  <Slider
                    value={staff.distributionRatio}
                    min={0}
                    max={5}
                    step={0.1}
                    w="100px"
                    onChange={(value) => {
                      const newDistributions = leadDistribution.map(s => 
                        s.staffId === staff.staffId ? { ...s, distributionRatio: value } : s
                      );
                      setLeadDistribution(newDistributions);
                    }}
                    onChangeEnd={(value) => {
                      updateLeadDistribution([{
                        staffId: staff.staffId,
                        ratio: value
                      }]);
                    }}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text fontSize="sm" fontWeight="medium" minW="40px">
                    {staff.distributionRatio}x
                  </Text>
                </HStack>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>
    );
  };

  // --- MAIN RENDER ---
  if (loading && staffData.length === 0) {
    return <ProfessionalLoader />;
  }

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Container maxW="1600px" bg={bgColor} minH="100vh" pt={6} pb={10}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8} direction={{ base: 'column', md: 'row' }} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={textColor}>Staff Management</Heading>
          <Text color="gray.500" fontSize="md">
            {isCoach ? 'Manage your team members and their permissions' : 'View your team and performance'}
          </Text>
        </VStack>
        
        {isCoach && (
          <Button
            colorScheme="blue"
            size="md"
            leftIcon={<AddIcon />}
            onClick={onStaffModalOpen}
            borderRadius="7px"
            boxShadow="lg"
            _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
            transition="all 0.2s"
          >
            Add Staff
          </Button>
        )}
      </Flex>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6} mb={8}>
        <StatsCard
          title="Total Staff"
          value={staffData.length}
          icon={<UsersIcon />}
          color="blue"
          isLoading={loading}
        />
        <StatsCard
          title="Active Staff"
          value={staffData.filter(s => s.isActive).length}
          icon={<UsersIcon />}
          color="green"
          isLoading={loading}
        />
        <StatsCard
          title="Team Performance"
          value={`${teamPerformance?.teamAverage?.conversionRate || 0}%`}
          icon={<TrendingUpIcon />}
          color="purple"
          isLoading={loading}
        />
        <StatsCard
          title="Top Performer"
          value={teamPerformance?.topPerformer?.performanceScore || 0}
          icon={<AwardIcon />}
          color="orange"
          isLoading={loading}
        />
      </SimpleGrid>

      {/* Main Content Area */}
      <Card
        bg={cardBg}
        backdropFilter="blur(20px)"
        borderRadius="xl"
        boxShadow="sm"
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        minH="600px"
      >
        <Tabs variant="soft-rounded" colorScheme="blue" px={6} pt={6} onChange={handleTabChange}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={6} borderBottom="1px solid" borderColor="gray.100" pb={4}>
            <TabList>
              <Tab borderRadius="lg" fontWeight="600">Overview</Tab>
              <Tab borderRadius="lg" fontWeight="600">Comparison</Tab>
            </TabList>

            <HStack spacing={4}>
                {selectedStaffIds.length > 0 && (
                  <Menu>
                    <MenuButton as={Button} size="sm" colorScheme="blue" variant="solid" rightIcon={<ChevronDownIcon />}>
                      Bulk Actions ({selectedStaffIds.length})
                    </MenuButton>
                    <MenuList>
                      <MenuItem onClick={() => { setBulkAction('activate'); onBulkActionModalOpen(); }}>Activate Selected</MenuItem>
                      <MenuItem onClick={() => { setBulkAction('deactivate'); onBulkActionModalOpen(); }}>Deactivate Selected</MenuItem>
                      <MenuItem onClick={() => { setBulkAction('permissions'); onBulkActionModalOpen(); }}>Update Permissions</MenuItem>
                      <MenuDivider />
                      <MenuItem color="red.500" onClick={() => { setBulkAction('delete'); onBulkActionModalOpen(); }}>Delete Selected</MenuItem>
                    </MenuList>
                  </Menu>
                )}

                <InputGroup size="sm" w="200px">
                    <InputLeftElement pointerEvents="none">
                        <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input 
                        placeholder="Search..." 
                        borderRadius="md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
                
                <Select
                  size="sm"
                  w="120px"
                  borderRadius="md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>

                <Menu>
                  <MenuButton as={IconButton} icon={<SettingsIcon />} size="sm" variant="ghost" />
                  <MenuList>
                    {isCoach && (
                      <>
                        <MenuItem icon={<DownloadIcon />} onClick={onExportModalOpen}>Export Data</MenuItem>
                        <MenuItem icon={<AddIcon />} as="label" cursor="pointer">
                          Import Data
                          <input type="file" accept=".csv,.json" style={{ display: 'none' }} onChange={(e) => {
                            if (e.target.files[0]) importStaffData(e.target.files[0]);
                          }} />
                        </MenuItem>
                        <MenuDivider />
                      </>
                    )}
                    <MenuItem icon={<ViewIcon />} onClick={onAnalyticsModalOpen}>Analytics</MenuItem>
                    <MenuItem icon={<ViewIcon />} onClick={onActivityLogModalOpen}>Activity Logs</MenuItem>
                    <MenuItem icon={<SettingsIcon />} onClick={onReportsModalOpen}>Generate Reports</MenuItem>
                  </MenuList>
                </Menu>

                <HStack spacing={0} border="1px solid" borderColor="gray.200" borderRadius="md" p={1}>
                     <IconButton 
                        icon={<GridIcon />}
                        size="xs"
                        variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                        colorScheme={viewMode === 'grid' ? 'blue' : 'gray'}
                        onClick={() => setViewMode('grid')}
                        aria-label="Grid View"
                     />
                     <IconButton 
                        icon={<ListIcon />}
                        size="xs"
                        variant={viewMode === 'list' ? 'solid' : 'ghost'}
                        colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
                        onClick={() => setViewMode('list')}
                        aria-label="List View"
                     />
                </HStack>
            </HStack>
          </Flex>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel p={0}>
              <Grid templateColumns={{ base: "1fr", xl: "3fr 1fr" }} gap={8} pb={6}>
                {/* Staff List */}
                <Box>
                    {viewMode === 'grid' ? (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                            {filteredStaff.map((staff) => renderStaffCard(staff))}
                        </SimpleGrid>
                    ) : (
                        <Card variant="outline">
                           <CardBody p={0}>
                             <TableContainer>
                                <Table variant="simple" size="md">
                                    <Thead bg="gray.50">
                                        <Tr>
                                            <Th>Staff Member</Th>
                                            <Th>Status</Th>
                                            <Th>Role</Th>
                                            <Th>Performance</Th>
                                            <Th>Leads</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredStaff.map((staff) => (
                                            <Tr key={staff._id} _hover={{ bg: 'gray.50' }}>
                                                <Td>
                                                    <HStack>
                                                        <Avatar name={staff.name} size="sm" src={staff.avatar} />
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="bold">{staff.name}</Text>
                                                            <Text fontSize="xs" color="gray.500">{staff.email}</Text>
                                                        </VStack>
                                                    </HStack>
                                                </Td>
                                                <Td>
                                                    <Badge colorScheme={staff.isActive ? 'green' : 'red'} borderRadius="full" px={2}>
                                                        {staff.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </Td>
                                                <Td>
                                                    <Tag size="sm" colorScheme="purple" borderRadius="full">
                                                        <TagLabel>{staff.role || 'Staff'}</TagLabel>
                                                    </Tag>
                                                </Td>
                                                <Td>
                                                    <CircularProgress 
                                                        value={teamPerformance?.teamLeaderboard?.find(m => m.staffId === staff._id)?.performanceScore || 0} 
                                                        color="blue.400" 
                                                        size="40px" 
                                                        thickness="10px"
                                                    >
                                                        <CircularProgressLabel fontSize="xs">
                                                            {teamPerformance?.teamLeaderboard?.find(m => m.staffId === staff._id)?.performanceScore || 0}
                                                        </CircularProgressLabel>
                                                    </CircularProgress>
                                                </Td>
                                                <Td>
                                                    <Text fontWeight="bold">
                                                        {teamPerformance?.teamLeaderboard?.find(m => m.staffId === staff._id)?.leadsAssigned || 0}
                                                    </Text>
                                                </Td>
                                                <Td>
                                                    <Menu>
                                                        <MenuButton as={IconButton} icon={<MoreVerticalIcon />} variant="ghost" size="sm" />
                                                        <MenuList>
                                                            <MenuItem icon={<ViewIcon />} onClick={() => handleStaffClick(staff)}>View Details</MenuItem>
                                                            <MenuItem icon={<EditIcon />} onClick={() => handleEditStaff(staff)}>Edit</MenuItem>
                                                            {isCoach && (
                                                                <>
                                                                    <MenuDivider />
                                                                    <MenuItem icon={<DeleteIcon />} color="red.500" onClick={() => handleDeleteStaff(staff)}>Delete</MenuItem>
                                                                </>
                                                            )}
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                             </TableContainer>
                           </CardBody>
                        </Card>
                    )}
                </Box>
                
                {/* Sidebar */}
                <VStack spacing={6} display={{ base: 'none', xl: 'flex' }}>
                    {renderTeamLeaderboard()}
                    {isCoach && renderLeadDistribution()}
                </VStack>
              </Grid>
            </TabPanel>

            {/* Comparison Tab */}
            <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                    <HStack justify="space-between">
                         <Text fontWeight="bold" fontSize="lg">Staff Performance Comparison</Text>
                         {selectedForComparison.length > 0 && (
                             <Button size="sm" variant="outline" onClick={() => setSelectedForComparison([])}>
                                Clear Selection
                             </Button>
                         )}
                    </HStack>
                    
                    {selectedForComparison.length === 0 ? (
                        <Center p={10} border="2px dashed" borderColor="gray.200" borderRadius="xl">
                            <VStack spacing={4}>
                                <UsersIcon />
                                <Text color="gray.500">Select staff members from the Overview tab to compare them here.</Text>
                            </VStack>
                        </Center>
                    ) : (
                        <Card variant="outline">
                            <CardBody>
                              <TableContainer>
                                <Table variant="simple">
                                  <Thead>
                                    <Tr>
                                      <Th>Staff</Th>
                                      <Th>Status</Th>
                                      <Th>Permissions</Th>
                                      <Th>Performance</Th>
                                      <Th>Leads</Th>
                                      <Th>Last Active</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {selectedForComparison.map(staffId => {
                                      const staff = staffData.find(s => s._id === staffId);
                                      if (!staff) return null;
                                      const performance = teamPerformance?.teamLeaderboard?.find(m => m.staffId === staffId);
                                      return (
                                        <Tr key={staffId}>
                                          <Td>
                                            <HStack>
                                              <Avatar name={staff.name} size="sm" />
                                              <VStack align="start" spacing={0}>
                                                <Text fontWeight="medium">{staff.name}</Text>
                                                <Text fontSize="xs" color="gray.500">{staff.email}</Text>
                                              </VStack>
                                            </HStack>
                                          </Td>
                                          <Td>
                                            <Badge colorScheme={staff.isActive ? 'green' : 'red'}>
                                              {staff.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                          </Td>
                                          <Td>{staff.permissions?.length || 0}</Td>
                                          <Td>{performance?.performanceScore || 0}</Td>
                                          <Td>{performance?.leadsAssigned || 0}</Td>
                                          <Td>{staff.lastActive ? new Date(staff.lastActive).toLocaleDateString() : 'Never'}</Td>
                                        </Tr>
                                      );
                                    })}
                                  </Tbody>
                                </Table>
                              </TableContainer>
                            </CardBody>
                        </Card>
                    )}
                </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>

        {/* Staff Details Modal */}
        <Modal isOpen={isDetailsModalOpen} onClose={onDetailsModalClose} size="xl">
          <ModalOverlay />
          <ModalContent borderRadius="7px" maxH="90vh" overflow="hidden">
            <ModalHeader>
              <HStack>
                <Avatar name={selectedStaff?.name} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{selectedStaff?.name}</Text>
                  <Text fontSize="sm" color="gray.500">{selectedStaff?.email}</Text>
                </VStack>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody maxH="calc(90vh - 120px)" overflowY="auto">
              <Tabs>
                <TabList flexWrap="wrap">
                  <Tab>Overview</Tab>
                  <Tab>Tasks</Tab>
                  <Tab>Metrics</Tab>
                  <Tab>Leads</Tab>
                  <Tab>Permissions</Tab>
                  <Tab>Time Tracking</Tab>
                  <Tab>Reviews</Tab>
                </TabList>
                
                <TabPanels>
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <SimpleGrid columns={2} spacing={4}>
                        <Card bg="blue.50" borderRadius="7px">
                          <CardBody>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" color="gray.600">Status</Text>
                              <Badge colorScheme={selectedStaff?.isActive ? 'green' : 'red'} fontSize="md">
                                {selectedStaff?.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </VStack>
                          </CardBody>
                        </Card>
                        <Card bg="purple.50" borderRadius="7px">
                          <CardBody>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" color="gray.600">Permissions</Text>
                              <Text fontSize="xl" fontWeight="bold">{selectedStaff?.permissions?.length || 0}</Text>
                            </VStack>
                          </CardBody>
                        </Card>
                        <Card bg="green.50" borderRadius="7px">
                          <CardBody>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" color="gray.600">Last Active</Text>
                              <Text fontSize="sm">
                                {selectedStaff?.lastActive ? new Date(selectedStaff.lastActive).toLocaleDateString() : 'Never'}
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                        <Card bg="orange.50" borderRadius="7px">
                          <CardBody>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" color="gray.600">Lead Ratio</Text>
                              <Text fontSize="xl" fontWeight="bold">{selectedStaff?.distributionRatio || 1}x</Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>
                      <Divider />
                      <Text fontWeight="bold">Quick Actions</Text>
                      <SimpleGrid columns={2} spacing={2}>
                        <Button size="sm" leftIcon={<AwardIcon />} onClick={onReviewModalOpen}>
                          Performance Review
                        </Button>
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>
                  
                  <TabPanel>
                    {staffTasks ? (
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="bold">Total Tasks: {staffTasks.total}</Text>
                          <Badge colorScheme="green">Completion: {staffTasks.completionRate}%</Badge>
                        </HStack>
                        
                        <Box>
                          <Text fontWeight="medium" mb={2}>Today's Tasks</Text>
                          {staffTasks.todayTasks?.map((task) => (
                            <Card key={task._id} size="sm" mb={2}>
                              <CardBody>
                                <HStack justify="space-between">
                                  <Text fontSize="sm">{task.title}</Text>
                                  <Badge colorScheme={
                                    task.priority === 'high' ? 'red' :
                                    task.priority === 'medium' ? 'yellow' : 'green'
                                  }>
                                    {task.priority}
                                  </Badge>
                                </HStack>
                              </CardBody>
                            </Card>
                          ))}
                        </Box>
                      </VStack>
                    ) : (
                      <Skeleton height="200px" />
                    )}
                  </TabPanel>
                  
                  <TabPanel>
                    {staffMetrics ? (
                      <VStack spacing={4} align="stretch">
                        <Card bg="blue.50">
                          <CardBody>
                            <HStack justify="space-between">
                              <VStack align="start">
                                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                                  {staffMetrics.performanceScore?.overallScore}
                                </Text>
                                <Text fontSize="sm" color="gray.500">Performance Score</Text>
                              </VStack>
                              <VStack align="end">
                                <Text fontSize="lg" fontWeight="bold">
                                  {staffMetrics.performanceScore?.rating?.label}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  {staffMetrics.performanceScore?.rating?.icon}
                                </Text>
                              </VStack>
                            </HStack>
                          </CardBody>
                        </Card>
                        
                        <SimpleGrid columns={2} spacing={4}>
                          {Object.entries(staffMetrics.performanceScore?.breakdown || {}).map(([key, value]) => (
                            <Card key={key} size="sm">
                              <CardBody>
                                <Text fontSize="sm" fontWeight="medium" textTransform="capitalize">
                                  {key.replace(/([A-Z])/g, ' $1')}
                                </Text>
                                <Text fontSize="lg" fontWeight="bold">
                                  {value.score}/{value.max}
                                </Text>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      </VStack>
                    ) : (
                      <Skeleton height="200px" />
                    )}
                  </TabPanel>
                  
                  <TabPanel>
                    {staffLeads ? (
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="bold">Total Leads: {staffLeads.total}</Text>
                          <Badge colorScheme="green">Conversion: {staffLeads.conversionRate}%</Badge>
                        </HStack>
                        
                        <SimpleGrid columns={2} spacing={4}>
                          {Object.entries(staffLeads.leadsByStatus || {}).map(([status, count]) => (
                            <Card key={status} size="sm">
                              <CardBody>
                                <Text fontSize="sm" textTransform="capitalize">{status}</Text>
                                <Text fontSize="lg" fontWeight="bold">{count}</Text>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      </VStack>
                    ) : (
                      <Skeleton height="200px" />
                    )}
                  </TabPanel>
                  
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <Text fontWeight="bold">Permissions ({selectedStaff?.permissions?.length || 0})</Text>
                      <Wrap>
                        {selectedStaff?.permissions?.map((permission) => (
                          <WrapItem key={permission}>
                            <Tag size="sm" colorScheme="blue">
                              <TagLabel>{permission}</TagLabel>
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </VStack>
                  </TabPanel>
                  
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      {timeTracking[selectedStaff?._id]?.isTracking ? (
                        <Card bg="green.50" p={4}>
                          <VStack spacing={2}>
                            <CircularProgress isIndeterminate color="green.500" />
                            <Text fontWeight="bold">Tracking Active</Text>
                            <Button colorScheme="red" onClick={() => stopTimeTracking(selectedStaff?._id)}>
                              Stop
                            </Button>
                          </VStack>
                        </Card>
                      ) : (
                        <Button colorScheme="green" onClick={() => startTimeTracking(selectedStaff?._id)}>
                          Start Tracking
                        </Button>
                      )}
                    </VStack>
                  </TabPanel>
                  
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Performance Rating (1-10)</FormLabel>
                        <NumberInput min={1} max={10} defaultValue={5}>
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Comments</FormLabel>
                        <Textarea rows={4} placeholder="Enter review comments..." />
                      </FormControl>
                      <Divider />
                      <VStack spacing={2} align="stretch">
                        {performanceReviews[selectedStaff?._id]?.map((review, index) => (
                          <Card key={index} size="sm" bg="gray.50">
                            <CardBody>
                              <Text fontSize="sm">{review.comments}</Text>
                              <Text fontSize="xs" color="gray.500">
                                {new Date(review.reviewDate).toLocaleDateString()}
                              </Text>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Add Staff Modal */}
        <Modal isOpen={isStaffModalOpen} onClose={onStaffModalClose} size="6xl">
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
          <ModalContent 
            borderRadius="7px" 
            maxW="1200px" 
            maxH="90vh" 
            overflow="hidden"
            boxShadow="2xl"
          >
            <ModalHeader 
              bg="white" 
              borderBottom="1px solid" 
              borderColor="gray.200"
              py={6}
            >
              <HStack justify="space-between" w="full">
                <HStack spacing={4}>
                  <Box 
                    p={3} 
                    bg="blue.50" 
                    borderRadius="7px"
                    border="2px solid"
                    borderColor="blue.100"
                  >
                    <UsersIcon />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                      Add New Staff Member
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Create a team member with proper access permissions
                    </Text>
                  </VStack>
                </HStack>
                <ModalCloseButton position="static" />
              </HStack>
            </ModalHeader>
            
            <ModalBody p={0} overflowY="auto">
              <Box p={8}>
                <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={8}>
                  {/* Left Column - Basic Info & Presets */}
                  <VStack spacing={6} align="stretch">
                    {/* Basic Information Section */}
                    <Card bg="white" borderRadius="7px" boxShadow="sm" border="1px" borderColor="gray.200">
                      <CardHeader pb={4}>
                        <HStack>
                          <Box p={2} bg="blue.100" borderRadius="7px">
                            <EditIcon />
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="lg" fontWeight="bold" color="gray.800">
                              Basic Information
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              Staff member details
                            </Text>
                          </VStack>
                        </HStack>
                      </CardHeader>
                      <CardBody pt={0}>
                        <VStack spacing={4}>
                          <FormControl>
                            <FormLabel fontWeight="semibold" color="gray.700">Full Name</FormLabel>
                            <Input
                              value={newStaff.name}
                              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                              placeholder="Enter full name"
                              borderRadius="7px"
                              border="1px"
                              borderColor="gray.300"
                              _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                            />
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel fontWeight="semibold" color="gray.700">Email Address</FormLabel>
                            <Input
                              type="email"
                              value={newStaff.email}
                              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                              placeholder="Enter email address"
                              borderRadius="7px"
                              border="1px"
                              borderColor="gray.300"
                              _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                            />
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel fontWeight="semibold" color="gray.700">Password</FormLabel>
                            <Input
                              type="password"
                              value={newStaff.password}
                              onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                              placeholder="Enter secure password"
                              borderRadius="7px"
                              border="1px"
                              borderColor="gray.300"
                              _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                            />
                          </FormControl>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Permission Presets Section */}
                    <Card bg="white" borderRadius="7px" boxShadow="sm" border="1px" borderColor="gray.200">
                      <CardHeader pb={4}>
                        <HStack>
                          <Box p={2} bg="green.100" borderRadius="7px">
                            <SettingsIcon />
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="lg" fontWeight="bold" color="gray.800">
                              Role Presets
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              Quick permission templates
                            </Text>
                          </VStack>
                        </HStack>
                      </CardHeader>
                      <CardBody pt={0}>
                        <VStack spacing={4} align="stretch">
                          <Box>
                            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={3}>
                              Choose a role preset to automatically assign permissions:
                            </Text>
                            <Box>
                              {renderPermissionPresets()}
                            </Box>
                          </Box>
                          
                          {selectedPreset && (
                            <Alert status="success" borderRadius="7px" bg="green.50" border="1px" borderColor="green.200">
                              <AlertIcon color="green.500" />
                              <Box>
                                <Text fontSize="sm" fontWeight="semibold" color="green.800">
                                  ✓ {selectedPreset} Selected
                                </Text>
                                <Text fontSize="xs" color="green.600">
                                  {selectedPermissions.length} permissions assigned • {permissions.presets[selectedPreset]?.description || ''}
                                </Text>
                              </Box>
                            </Alert>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  </VStack>

                  {/* Right Column - Custom Permissions */}
                  <Card bg="white" borderRadius="7px" boxShadow="sm" border="1px" borderColor="gray.200">
                    <CardHeader pb={4}>
                      <HStack>
                        <Box p={2} bg="purple.100" borderRadius="7px">
                          <SettingsIcon />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="lg" fontWeight="bold" color="gray.800">
                            Custom Permissions
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Additional access controls
                          </Text>
                        </VStack>
                      </HStack>
                    </CardHeader>
                    <CardBody pt={0}>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between" align="center">
                          <Text fontSize="sm" color="gray.600">
                            Add specific permissions beyond the selected preset
                          </Text>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="blue"
                              onClick={() => {
                                const allPermissions = Object.values(permissions.categories || {})
                                  .flatMap(category => category.permissions.map(p => p.permission));
                                setSelectedPermissions(allPermissions);
                              }}
                              borderRadius="7px"
                            >
                              Select All
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              onClick={() => setSelectedPermissions([])}
                              borderRadius="7px"
                            >
                              Clear All
                            </Button>
                          </HStack>
                        </HStack>
                        
                        <InputGroup>
                          <InputLeftElement>
                            <SearchIcon />
                          </InputLeftElement>
                          <Input
                            placeholder="Search permissions..."
                            value={permissionSearch}
                            onChange={(e) => setPermissionSearch(e.target.value)}
                            borderRadius="7px"
                            border="1px"
                            borderColor="gray.300"
                            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                          />
                        </InputGroup>
                        
                        <Box 
                          maxH="600px" 
                          overflowY="auto" 
                          border="1px" 
                          borderColor="gray.300" 
                          borderRadius="7px" 
                          p={4}
                          bg="gray.50"
                        >
                          <CheckboxGroup
                            value={selectedPermissions}
                            onChange={setSelectedPermissions}
                          >
                            <VStack spacing={4} align="stretch">
                              {Object.entries(permissions.categories || {})
                                .filter(([category, data]) => {
                                  if (!permissionSearch) return true;
                                  const searchLower = permissionSearch.toLowerCase();
                                  return category.toLowerCase().includes(searchLower) ||
                                         data.permissions.some(p => 
                                           p.name.toLowerCase().includes(searchLower) ||
                                           p.permission.toLowerCase().includes(searchLower)
                                         );
                                })
                                .map(([category, data]) => {
                                  const filteredPermissions = data.permissions.filter(permission => {
                                    if (!permissionSearch) return true;
                                    const searchLower = permissionSearch.toLowerCase();
                                    return permission.name.toLowerCase().includes(searchLower) ||
                                           permission.permission.toLowerCase().includes(searchLower) ||
                                           category.toLowerCase().includes(searchLower);
                                  });
                                  
                                  if (filteredPermissions.length === 0) return null;
                                  
                                  return (
                                    <Box key={category} bg="white" p={4} borderRadius="7px" border="1px" borderColor="gray.200" boxShadow="sm">
                                      <HStack mb={3}>
                                        <Box p={1} bg="blue.100" borderRadius="md">
                                          <SettingsIcon />
                                        </Box>
                                        <Text fontSize="md" fontWeight="bold" color="gray.800" textTransform="capitalize">
                                          {category}
                                        </Text>
                                        <Badge colorScheme="blue" variant="subtle" borderRadius="full">
                                          {filteredPermissions.length} permissions
                                        </Badge>
                                      </HStack>
                                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={2}>
                                        {filteredPermissions.map((permission) => (
                                          <Checkbox
                                            key={permission.permission}
                                            value={permission.permission}
                                            colorScheme="blue"
                                            size="sm"
                                            borderRadius="md"
                                            _hover={{ bg: "blue.50" }}
                                            p={2}
                                          >
                                            <HStack spacing={2}>
                                              <Text fontSize="sm" color="gray.700">
                                                {permission.icon}
                                              </Text>
                                              <Text fontSize="sm" color="gray.700" fontWeight="medium">
                                                {permission.name}
                                              </Text>
                                            </HStack>
                                          </Checkbox>
                                        ))}
                                      </SimpleGrid>
                                    </Box>
                                  );
                                })
                                .filter(Boolean)}
                            </VStack>
                          </CheckboxGroup>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>
              </Box>
            </ModalBody>
            
            <ModalFooter 
              bg="gray.50" 
              borderTop="1px" 
              borderColor="gray.200"
              py={4}
            >
              <HStack justify="space-between" w="full">
                <HStack spacing={3}>
                  <Box p={2} bg="blue.100" borderRadius="7px">
                    <TargetIcon />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                      Total Permissions: {selectedPermissions.length}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {selectedPreset ? `Based on ${selectedPreset} preset` : 'Custom selection'}
                    </Text>
                  </VStack>
                </HStack>
                
                <HStack spacing={3}>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      onStaffModalClose();
                      setNewStaff({ name: '', email: '', password: '', permissions: [] });
                      setSelectedPermissions([]);
                      setSelectedPreset('');
                      setPermissionSearch('');
                    }}
                    borderRadius="7px"
                    border="1px"
                    borderColor="gray.300"
                    _hover={{ bg: "gray.50" }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={createStaff} 
                    isLoading={loading} 
                    borderRadius="7px"
                    isDisabled={selectedPermissions.length === 0}
                    colorScheme="blue"
                    _disabled={{
                      bg: "gray.300",
                      color: "gray.500",
                      cursor: "not-allowed"
                    }}
                    px={6}
                    py={2}
                    fontWeight="semibold"
                  >
                    {loading ? 'Creating Staff...' : `Create Staff Member`}
                  </Button>
                </HStack>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Permission Management Modal */}
        <Modal isOpen={isPermissionModalOpen} onClose={onPermissionModalClose} size="6xl">
          <ModalOverlay />
          <ModalContent maxH="80vh" overflowY="auto" borderRadius="7px">
            <ModalHeader>
              <HStack>
                <Avatar name={selectedStaff?.name} size="sm" />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">Manage Permissions</Text>
                  <Text fontSize="sm" color="gray.500">
                    {selectedStaff?.name} - {selectedStaff?.email}
                  </Text>
                </VStack>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={6} align="stretch">
                <Alert status="info" borderRadius="7px">
                  <AlertIcon />
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold">
                      Current Permissions: {selectedStaff?.permissions?.length || 0}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Select permissions below to update for this staff member
                    </Text>
                  </Box>
                </Alert>
                
                <Box>
                  <Text fontWeight="bold" mb={3}>Permission Presets</Text>
                  {renderPermissionPresets()}
                </Box>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" mb={3}>Custom Permissions</Text>
                  {renderPermissionCategories()}
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" color="gray.600">
                  Selected: {selectedPermissions.length} permissions
                </Text>
                <HStack>
                  <Button variant="ghost" mr={3} onClick={() => {
                    onPermissionModalClose();
                    setSelectedStaff(null);
                    setSelectedPermissions([]);
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    colorScheme="blue" 
                    onClick={() => {
                      if (selectedStaff) {
                        updateStaffPermissions(selectedStaff._id, selectedPermissions);
                        onPermissionModalClose();
                        setSelectedStaff(null);
                        setSelectedPermissions([]);
                      }
                    }}
                    isLoading={loading}
                    borderRadius="7px"
                  >
                    Update Permissions
                  </Button>
                </HStack>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} size="md">
          <ModalOverlay />
          <ModalContent borderRadius="7px">
            <ModalHeader>
              <HStack>
                <Box p={2} bg="red.50" borderRadius="7px">
                  <DeleteIcon />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color="red.600">Delete Staff Member</Text>
                  <Text fontSize="sm" color="gray.500">This action cannot be undone</Text>
                </VStack>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Alert status="warning" borderRadius="7px" mb={4}>
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <AlertTitle>Are you sure?</AlertTitle>
                  <AlertDescription>
                    You are about to permanently delete <strong>{staffToDelete?.name}</strong> from your team.
                    This will remove all their data and cannot be undone.
                  </AlertDescription>
                </VStack>
              </Alert>
              
              {staffToDelete && (
                <Card bg="gray.50" borderRadius="7px" p={4}>
                  <HStack>
                    <Avatar name={staffToDelete.name} size="md" />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">{staffToDelete.name}</Text>
                      <Text fontSize="sm" color="gray.600">{staffToDelete.email}</Text>
                      <HStack>
                        <Badge colorScheme={staffToDelete.status === 'active' ? 'green' : 'red'}>
                          {staffToDelete.status}
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                          {staffToDelete.permissions?.length || 0} permissions
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                </Card>
              )}
            </ModalBody>
            <ModalFooter>
              <HStack>
                <Button variant="ghost" mr={3} onClick={() => {
                  onDeleteModalClose();
                  setStaffToDelete(null);
                }}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={() => {
                    if (staffToDelete) {
                      deleteStaff(staffToDelete._id);
                      onDeleteModalClose();
                      setStaffToDelete(null);
                    }
                  }}
                  isLoading={loading}
                  borderRadius="7px"
                >
                  Delete Staff Member
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Lead Distribution Modal */}
        <Modal isOpen={isDistributionModalOpen} onClose={onDistributionModalClose} size="lg">
          <ModalOverlay />
          <ModalContent borderRadius="7px">
            <ModalHeader>Manage Lead Distribution</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                {leadDistribution.map((staff) => (
                  <HStack key={staff.staffId} w="full" justify="space-between">
                    <Text color="gray.800">{staff.name}</Text>
                    <HStack>
                      <Slider
                        value={staff.distributionRatio}
                        min={0}
                        max={5}
                        step={0.1}
                        w="200px"
                        onChange={(value) => {
                          const newDistributions = leadDistribution.map(s => 
                            s.staffId === staff.staffId ? { ...s, distributionRatio: value } : s
                          );
                          setLeadDistribution(newDistributions);
                        }}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                      <Text fontSize="sm" fontWeight="medium" minW="40px">
                        {staff.distributionRatio}x
                      </Text>
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDistributionModalClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={() => {
                  const distributions = leadDistribution.map(staff => ({
                    staffId: staff.staffId,
                    ratio: staff.distributionRatio
                  }));
                  updateLeadDistribution(distributions);
                  onDistributionModalClose();
                }}
                isLoading={loading}
                borderRadius="7px"
              >
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Bulk Action Modal */}
        <Modal isOpen={isBulkActionModalOpen} onClose={onBulkActionModalClose} size="lg">
          <ModalOverlay />
          <ModalContent borderRadius="7px">
            <ModalHeader>
              {bulkAction === 'delete' && 'Delete Staff Members'}
              {bulkAction === 'activate' && 'Activate Staff Members'}
              {bulkAction === 'deactivate' && 'Deactivate Staff Members'}
              {bulkAction === 'permissions' && 'Update Permissions'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {bulkAction === 'delete' && (
                <Alert status="warning" borderRadius="7px" mb={4}>
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <AlertTitle>Are you sure?</AlertTitle>
                    <AlertDescription>
                      You are about to permanently delete {selectedStaffIds.length} staff members. This action cannot be undone.
                    </AlertDescription>
                  </VStack>
                </Alert>
              )}
              {bulkAction === 'permissions' && (
                <VStack spacing={4} align="stretch">
                  <Text>Select permissions to assign to {selectedStaffIds.length} staff members:</Text>
                  <CheckboxGroup value={selectedPermissions} onChange={setSelectedPermissions}>
                    <SimpleGrid columns={2} spacing={2}>
                      {Object.values(permissions.categories || {}).flatMap(cat => 
                        cat.permissions.map(p => (
                          <Checkbox key={p.permission} value={p.permission}>
                            {p.name}
                          </Checkbox>
                        ))
                      )}
                    </SimpleGrid>
                  </CheckboxGroup>
                </VStack>
              )}
              {!bulkAction.includes('permissions') && (
                <Text>
                  This will affect {selectedStaffIds.length} staff member(s). Are you sure you want to continue?
                </Text>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onBulkActionModalClose}>
                Cancel
              </Button>
              <Button 
                colorScheme={bulkAction === 'delete' ? 'red' : 'blue'}
                onClick={async () => {
                  if (bulkAction === 'delete') {
                    await bulkDeleteStaff(selectedStaffIds);
                  } else if (bulkAction === 'activate') {
                    await bulkUpdateStatus(selectedStaffIds, 'active');
                  } else if (bulkAction === 'deactivate') {
                    await bulkUpdateStatus(selectedStaffIds, 'inactive');
                  } else if (bulkAction === 'permissions') {
                    await bulkUpdatePermissions(selectedStaffIds, selectedPermissions);
                  }
                  onBulkActionModalClose();
                }}
                isLoading={loading}
                borderRadius="7px"
              >
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Export Modal */}
        <Modal isOpen={isExportModalOpen} onClose={onExportModalClose} size="md">
          <ModalOverlay />
          <ModalContent borderRadius="7px">
            <ModalHeader>Export Staff Data</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Text>Select export format:</Text>
                <Select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                  <option value="csv">CSV (Excel compatible)</option>
                  <option value="json">JSON</option>
                </Select>
                <Text fontSize="sm" color="gray.500">
                  Exporting {filteredStaff.length} staff member(s)
                </Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onExportModalClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue"
                onClick={() => {
                  exportStaffData(exportFormat);
                  onExportModalClose();
                }}
                isLoading={loading}
                borderRadius="7px"
              >
                Export
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Analytics Modal */}
        <Modal isOpen={isAnalyticsModalOpen} onClose={onAnalyticsModalClose} size="6xl">
          <ModalOverlay />
          <ModalContent borderRadius="7px" maxH="90vh" overflowY="auto">
            <ModalHeader>
              <Heading size="lg">Staff Analytics Dashboard</Heading>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {analyticsData ? (
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Card bg="blue.50" borderRadius="7px">
                      <CardBody>
                        <Stat>
                          <StatLabel>Total Staff</StatLabel>
                          <StatNumber>{staffData.length}</StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>
                    <Card bg="green.50" borderRadius="7px">
                      <CardBody>
                        <Stat>
                          <StatLabel>Active Staff</StatLabel>
                          <StatNumber>{staffData.filter(s => s.isActive).length}</StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>
                    <Card bg="purple.50" borderRadius="7px">
                      <CardBody>
                        <Stat>
                          <StatLabel>Avg Performance</StatLabel>
                          <StatNumber>{analyticsData.teamAverage?.conversionRate || 0}%</StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                  
                  {teamPerformance?.teamLeaderboard && (
                    <Card>
                      <CardHeader>
                        <Heading size="md">Performance Breakdown</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          {teamPerformance.teamLeaderboard.map((member, index) => (
                            <HStack key={member.staffId} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                              <HStack>
                                <Text fontWeight="bold">#{index + 1}</Text>
                                <Text>{member.staffName}</Text>
                              </HStack>
                              <HStack spacing={4}>
                                <Text>Score: {member.performanceScore}</Text>
                                <Text>Leads: {member.leadsAssigned}</Text>
                                <Text>Conversion: {member.conversionRate}%</Text>
                              </HStack>
                            </HStack>
                          ))}
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              ) : (
                <Center py={8}>
                  <CircularProgress isIndeterminate />
                </Center>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onAnalyticsModalClose} borderRadius="7px">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Activity Logs Modal */}
        <Modal isOpen={isActivityLogModalOpen} onClose={onActivityLogModalClose} size="4xl">
          <ModalOverlay />
          <ModalContent borderRadius="7px" maxH="90vh" overflowY="auto">
            <ModalHeader>
              <Heading size="lg">
                {selectedStaff ? `${selectedStaff.name}'s Activity Logs` : 'All Staff Activity Logs'}
              </Heading>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {activityLogs.length > 0 ? (
                <VStack spacing={3} align="stretch">
                  {activityLogs.map((log, index) => (
                    <Card key={index} size="sm">
                      <CardBody>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{log.action || 'Activity'}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {log.description || 'No description'}
                            </Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Text fontSize="xs" color="gray.500">
                              {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown time'}
                            </Text>
                            {log.user && (
                              <Badge colorScheme="blue">{log.user}</Badge>
                            )}
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              ) : (
                <Center py={8}>
                  <VStack spacing={2}>
                    <Text color="gray.500">No activity logs found</Text>
                    <Text fontSize="sm" color="gray.400">
                      Activity logs will appear here as staff members perform actions
                    </Text>
                  </VStack>
                </Center>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onActivityLogModalClose} borderRadius="7px">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Communication Modal */}
        <Modal isOpen={isCommunicationModalOpen} onClose={onCommunicationModalClose} size="lg">
          <ModalOverlay />
          <ModalContent borderRadius="7px">
            <ModalHeader>Send Communication</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Recipients</FormLabel>
                  <Text fontSize="sm" color="gray.500">
                    {selectedStaffIds.length > 0 
                      ? `${selectedStaffIds.length} staff member(s) selected`
                      : 'Select staff members first'}
                  </Text>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Communication Type</FormLabel>
                  <Select value={communicationType} onChange={(e) => setCommunicationType(e.target.value)}>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                  </Select>
                </FormControl>
                
                {communicationType === 'email' && (
                  <FormControl>
                    <FormLabel>Subject</FormLabel>
                    <Input placeholder="Enter email subject" />
                  </FormControl>
                )}
                
                <FormControl>
                  <FormLabel>Message</FormLabel>
                  <Textarea placeholder="Enter your message..." rows={6} />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCommunicationModalClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue"
                onClick={() => {
                  // sendCommunication(selectedStaffIds, communicationType, subject, message);
                  showToast('Communication feature coming soon', 'info');
                  onCommunicationModalClose();
                }}
                isLoading={loading}
                borderRadius="7px"
              >
                Send
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Notes Modal */}
        <Modal isOpen={isNotesModalOpen} onClose={onNotesModalClose} size="lg">
          <ModalOverlay />
          <ModalContent borderRadius="7px">
            <ModalHeader>
              <HStack>
                <EditIcon />
                <Text>Notes for {selectedStaff?.name}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Add New Note</FormLabel>
                  <Textarea 
                    placeholder="Enter note about this staff member..."
                    rows={4}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey && e.target.value.trim()) {
                        saveStaffNote(selectedStaff?._id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </FormControl>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" mb={3}>Previous Notes</Text>
                  <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
                    {staffNotes[selectedStaff?._id]?.map((note, index) => (
                      <Card key={index} size="sm" bg="gray.50">
                        <CardBody>
                          <HStack justify="space-between">
                            <Text fontSize="sm">{note.note}</Text>
                            <IconButton
                              size="xs"
                              icon={<DeleteIcon />}
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => deleteStaffNote(selectedStaff?._id, index)}
                            />
                          </HStack>
                          <Text fontSize="xs" color="gray.500" mt={2}>
                            {new Date(note.timestamp).toLocaleString()}
                          </Text>
                        </CardBody>
                      </Card>
                    )) || <Text color="gray.500" fontSize="sm">No notes yet</Text>}
                  </VStack>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onNotesModalClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Documents Modal */}
        <Modal isOpen={isDocumentsModalOpen} onClose={onDocumentsModalClose} size="xl">
          <ModalOverlay />
          <ModalContent borderRadius="7px" maxH="90vh" overflowY="auto">
            <ModalHeader>
              <HStack>
                <FileIcon />
                <Text>Documents - {selectedStaff?.name}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Upload Document</FormLabel>
                  <Input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        uploadStaffDocument(selectedStaff?._id, e.target.files[0]);
                      }
                    }}
                  />
                </FormControl>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" mb={3}>Uploaded Documents</Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    {staffDocuments[selectedStaff?._id]?.map((doc, index) => (
                      <Card key={index} size="sm">
                        <CardBody>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium" fontSize="sm">{doc.name}</Text>
                              <Text fontSize="xs" color="gray.500">
                                {(doc.size / 1024).toFixed(2)} KB
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {new Date(doc.uploadedAt).toLocaleDateString()}
                              </Text>
                            </VStack>
                            <Button size="xs" onClick={() => window.open(doc.url, '_blank')}>
                              View
                            </Button>
                          </HStack>
                        </CardBody>
                      </Card>
                    )) || <Text color="gray.500" fontSize="sm">No documents uploaded</Text>}
                  </SimpleGrid>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDocumentsModalClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Schedule Modal */}
        <Modal isOpen={isScheduleModalOpen} onClose={onScheduleModalClose} size="xl">
          <ModalOverlay />
          <ModalContent borderRadius="7px">
            <ModalHeader>
              <HStack>
                <CalendarIcon />
                <Text>Schedule - {selectedStaff?.name}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={7} spacing={2}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <Box key={day} textAlign="center" fontWeight="bold" p={2} bg="gray.100" borderRadius="md">
                      {day}
                    </Box>
                  ))}
                  {Array.from({ length: 35 }).map((_, index) => (
                    <Box
                      key={index}
                      p={3}
                      border="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                      cursor="pointer"
                      _hover={{ bg: 'blue.50' }}
                    >
                      <Text fontSize="xs" textAlign="center">{index + 1}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
                
                <Card bg="blue.50" p={4} borderRadius="7px">
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">Working Hours</Text>
                    <HStack>
                      <Text fontSize="sm">Monday - Friday: 9:00 AM - 6:00 PM</Text>
                    </HStack>
                    <Text fontSize="sm">Saturday: 10:00 AM - 2:00 PM</Text>
                    <Text fontSize="sm">Sunday: Off</Text>
                  </VStack>
                </Card>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onScheduleModalClose}>
                Close
              </Button>
              <Button colorScheme="blue" onClick={onScheduleModalClose}>
                Save Schedule
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Attendance Modal */}
        <Modal isOpen={isAttendanceModalOpen} onClose={onAttendanceModalClose} size="lg">
          <ModalOverlay />
          <ModalContent borderRadius="7px">
            <ModalHeader>
              <HStack>
                <CalendarIcon />
                <Text>Attendance - {selectedStaff?.name}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Mark Attendance for Today</FormLabel>
                  <HStack spacing={2}>
                    <Button
                      colorScheme="green"
                      onClick={() => markAttendance(selectedStaff?._id, 'present')}
                      flex={1}
                    >
                      Present
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={() => markAttendance(selectedStaff?._id, 'absent')}
                      flex={1}
                    >
                      Absent
                    </Button>
                    <Button
                      colorScheme="orange"
                      onClick={() => markAttendance(selectedStaff?._id, 'late')}
                      flex={1}
                    >
                      Late
                    </Button>
                    <Button
                      colorScheme="yellow"
                      onClick={() => markAttendance(selectedStaff?._id, 'half-day')}
                      flex={1}
                    >
                      Half Day
                    </Button>
                  </HStack>
                </FormControl>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" mb={3}>Recent Attendance</Text>
                  <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
                    {attendanceData
                      .filter(a => a.staffId === selectedStaff?._id)
                      .slice(0, 10)
                      .map((record, index) => (
                        <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                          <Text fontSize="sm">{new Date(record.date).toLocaleDateString()}</Text>
                          <Badge colorScheme={
                            record.status === 'present' ? 'green' :
                            record.status === 'absent' ? 'red' :
                            record.status === 'late' ? 'orange' : 'yellow'
                          }>
                            {record.status}
                          </Badge>
                        </HStack>
                      ))}
                    {attendanceData.filter(a => a.staffId === selectedStaff?._id).length === 0 && (
                      <Text color="gray.500" fontSize="sm">No attendance records</Text>
                    )}
                  </VStack>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onAttendanceModalClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Performance Review Modal */}
        <Modal isOpen={isReviewModalOpen} onClose={onReviewModalClose} size="xl">
          <ModalOverlay />
          <ModalContent borderRadius="7px" maxH="90vh" overflowY="auto">
            <ModalHeader>
              <HStack>
                <AwardIcon />
                <Text>Performance Review - {selectedStaff?.name}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Review Period</FormLabel>
                  <Select placeholder="Select period">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Performance Rating (1-10)</FormLabel>
                  <NumberInput min={1} max={10} defaultValue={5}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Strengths</FormLabel>
                  <Textarea placeholder="List strengths..." rows={3} />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Areas for Improvement</FormLabel>
                  <Textarea placeholder="List areas for improvement..." rows={3} />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Comments</FormLabel>
                  <Textarea placeholder="Additional comments..." rows={4} />
                </FormControl>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" mb={3}>Previous Reviews</Text>
                  <VStack spacing={3} align="stretch">
                    {performanceReviews[selectedStaff?._id]?.map((review, index) => (
                      <Card key={index} size="sm" bg="gray.50">
                        <CardBody>
                          <VStack align="start" spacing={2}>
                            <HStack justify="space-between" w="full">
                              <Text fontWeight="medium">{review.period || 'Review'}</Text>
                              <Badge colorScheme="blue">Rating: {review.rating}/10</Badge>
                            </HStack>
                            <Text fontSize="sm">{review.comments}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {new Date(review.reviewDate).toLocaleDateString()}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    )) || <Text color="gray.500" fontSize="sm">No reviews yet</Text>}
                  </VStack>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onReviewModalClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={onReviewModalClose}>
                Save Review
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Time Tracking Modal */}
        <Modal isOpen={isTimeTrackingModalOpen} onClose={onTimeTrackingModalClose} size="lg">
          <ModalOverlay />
          <ModalContent borderRadius="7px">
            <ModalHeader>
              <HStack>
                <ClockIcon />
                <Text>Time Tracking - {selectedStaff?.name}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {timeTracking[selectedStaff?._id]?.isTracking ? (
                  <Card bg="green.50" p={6} borderRadius="7px">
                    <VStack spacing={3}>
                      <CircularProgress isIndeterminate color="green.500" size="60px" />
                      <Text fontWeight="bold" fontSize="lg">Time Tracking Active</Text>
                      <Text fontSize="sm" color="gray.600">
                        Started at: {new Date(timeTracking[selectedStaff?._id].startTime).toLocaleTimeString()}
                      </Text>
                      <Button
                        colorScheme="red"
                        onClick={() => stopTimeTracking(selectedStaff?._id)}
                        size="lg"
                      >
                        Stop Tracking
                      </Button>
                    </VStack>
                  </Card>
                ) : (
                  <Card bg="blue.50" p={6} borderRadius="7px">
                    <VStack spacing={3}>
                      <ClockIcon />
                      <Text fontWeight="bold">Start Time Tracking</Text>
                      <Button
                        colorScheme="green"
                        onClick={() => startTimeTracking(selectedStaff?._id)}
                        size="lg"
                      >
                        Start Tracking
                      </Button>
                    </VStack>
                  </Card>
                )}
                
                {timeTracking[selectedStaff?._id]?.duration && (
                  <Card p={4} borderRadius="7px">
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="bold">Last Session</Text>
                      <Text fontSize="sm">
                        Duration: {Math.floor(timeTracking[selectedStaff?._id].duration / 60000)} minutes
                      </Text>
                    </VStack>
                  </Card>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onTimeTrackingModalClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Leave Management Modal */}
        <Modal isOpen={isLeaveModalOpen} onClose={onLeaveModalClose} size="lg">
          <ModalOverlay />
          <ModalContent borderRadius="7px">
            <ModalHeader>
              <HStack>
                <CalendarIcon />
                <Text>Leave Management - {selectedStaff?.name}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Request Leave</FormLabel>
                  <VStack spacing={3}>
                    <Input type="date" placeholder="Start Date" />
                    <Input type="date" placeholder="End Date" />
                    <Select placeholder="Leave Type">
                      <option value="sick">Sick Leave</option>
                      <option value="vacation">Vacation</option>
                      <option value="personal">Personal</option>
                      <option value="other">Other</option>
                    </Select>
                    <Textarea placeholder="Reason..." rows={3} />
                    <Button colorScheme="blue" w="full" onClick={() => {
                      requestLeave(selectedStaff?._id, {});
                      onLeaveModalClose();
                    }}>
                      Submit Request
                    </Button>
                  </VStack>
                </FormControl>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" mb={3}>Leave Requests</Text>
                  <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
                    {leaveRequests
                      .filter(l => l.staffId === selectedStaff?._id)
                      .map((request, index) => (
                        <Card key={index} size="sm">
                          <CardBody>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {request.startDate} to {request.endDate}
                                </Text>
                                <Text fontSize="xs" color="gray.500">{request.type}</Text>
                              </VStack>
                              <Badge colorScheme={
                                request.status === 'approved' ? 'green' :
                                request.status === 'rejected' ? 'red' : 'yellow'
                              }>
                                {request.status}
                              </Badge>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    {leaveRequests.filter(l => l.staffId === selectedStaff?._id).length === 0 && (
                      <Text color="gray.500" fontSize="sm">No leave requests</Text>
                    )}
                  </VStack>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onLeaveModalClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Hierarchy Modal */}
        <Modal isOpen={isHierarchyModalOpen} onClose={onHierarchyModalClose} size="4xl">
          <ModalOverlay />
          <ModalContent borderRadius="7px" maxH="90vh" overflowY="auto">
            <ModalHeader>
              <Heading size="lg">Staff Hierarchy</Heading>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Card bg="blue.50" p={6} borderRadius="7px">
                  <VStack spacing={2}>
                    <Avatar size="xl" name={user?.name || 'Coach'} />
                    <Text fontWeight="bold" fontSize="lg">{user?.name || 'Coach'}</Text>
                    <Badge colorScheme="purple">Coach</Badge>
                  </VStack>
                </Card>
                
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {staffData.map((staff) => (
                    <Card key={staff._id} bg="white" borderRadius="7px" p={4}>
                      <VStack spacing={2}>
                        <Avatar name={staff.name} />
                        <Text fontWeight="medium">{staff.name}</Text>
                        <Badge colorScheme="blue">Staff</Badge>
                        <Text fontSize="xs" color="gray.500">{staff.email}</Text>
                      </VStack>
                    </Card>
                  ))}
                </SimpleGrid>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onHierarchyModalClose} borderRadius="7px">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Reports Modal */}
        <Modal isOpen={isReportsModalOpen} onClose={onReportsModalClose} size="xl">
          <ModalOverlay />
          <ModalContent borderRadius="7px" maxH="90vh" overflowY="auto">
            <ModalHeader>
              <HStack>
                <ReportIcon />
                <Text>Generate Reports</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Card cursor="pointer" _hover={{ shadow: 'lg' }} onClick={() => generateReport('performance')}>
                  <CardBody>
                    <VStack spacing={2}>
                      <AwardIcon />
                      <Text fontWeight="bold">Performance Report</Text>
                      <Text fontSize="sm" color="gray.500">Staff performance metrics</Text>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card cursor="pointer" _hover={{ shadow: 'lg' }} onClick={() => generateReport('attendance')}>
                  <CardBody>
                    <VStack spacing={2}>
                      <CalendarIcon />
                      <Text fontWeight="bold">Attendance Report</Text>
                      <Text fontSize="sm" color="gray.500">Attendance records</Text>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card cursor="pointer" _hover={{ shadow: 'lg' }} onClick={() => generateReport('tasks')}>
                  <CardBody>
                    <VStack spacing={2}>
                      <TargetIcon />
                      <Text fontWeight="bold">Tasks Report</Text>
                      <Text fontSize="sm" color="gray.500">Task completion stats</Text>
                    </VStack>
                  </CardBody>
                </Card>
                
                <Card cursor="pointer" _hover={{ shadow: 'lg' }} onClick={() => generateReport('leads')}>
                  <CardBody>
                    <VStack spacing={2}>
                      <UsersIcon />
                      <Text fontWeight="bold">Leads Report</Text>
                      <Text fontSize="sm" color="gray.500">Lead assignment stats</Text>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onReportsModalClose} borderRadius="7px">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Comparison Modal */}
        <Modal isOpen={isComparisonModalOpen} onClose={onComparisonModalClose} size="6xl">
          <ModalOverlay />
          <ModalContent borderRadius="7px" maxH="90vh" overflowY="auto">
            <ModalHeader>
              <Heading size="lg">Staff Comparison</Heading>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedForComparison.length > 0 ? (
                <TableContainer>
                  <Table variant="striped" size="md">
                    <Thead>
                      <Tr>
                        <Th>Staff</Th>
                        <Th>Status</Th>
                        <Th>Permissions</Th>
                        <Th>Performance</Th>
                        <Th>Leads</Th>
                        <Th>Conversion</Th>
                        <Th>Last Active</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedForComparison.map(staffId => {
                        const staff = staffData.find(s => s._id === staffId);
                        if (!staff) return null;
                        const performance = teamPerformance?.teamLeaderboard?.find(m => m.staffId === staffId);
                        return (
                          <Tr key={staffId}>
                            <Td>
                              <HStack>
                                <Avatar name={staff.name} size="sm" />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="medium">{staff.name}</Text>
                                  <Text fontSize="xs" color="gray.500">{staff.email}</Text>
                                </VStack>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge colorScheme={staff.isActive ? 'green' : 'red'}>
                                {staff.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </Td>
                            <Td>{staff.permissions?.length || 0}</Td>
                            <Td>
                              <Badge colorScheme={
                                (performance?.performanceScore || 0) >= 80 ? 'green' :
                                (performance?.performanceScore || 0) >= 50 ? 'orange' : 'red'
                              }>
                                {performance?.performanceScore || 0}
                              </Badge>
                            </Td>
                            <Td>{performance?.leadsAssigned || 0}</Td>
                            <Td>{performance?.conversionRate || 0}%</Td>
                            <Td>{staff.lastActive ? new Date(staff.lastActive).toLocaleDateString() : 'Never'}</Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <Center py={8}>
                  <VStack spacing={2}>
                    <Text color="gray.500">Select staff members to compare</Text>
                    <Text fontSize="sm" color="gray.400">
                      Use checkboxes on staff cards to select members for comparison
                    </Text>
                  </VStack>
                </Center>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onComparisonModalClose} borderRadius="7px">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Onboarding Modal */}
        <Modal isOpen={isOnboardingModalOpen} onClose={onOnboardingModalClose} size="xl">
          <ModalOverlay />
          <ModalContent borderRadius="7px">
            <ModalHeader>
              <HStack>
                <UsersIcon />
                <Text>Onboarding - {selectedStaff?.name}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {['Account Setup', 'Permissions Assigned', 'Training Completed', 'Documentation Reviewed', 'First Task Assigned'].map((step, index) => (
                  <HStack key={index} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                    <Text fontWeight="medium">{step}</Text>
                    <Switch
                      isChecked={staffOnboarding[selectedStaff?._id]?.[step.toLowerCase().replace(/\s+/g, '_')] || false}
                      onChange={(e) => updateOnboardingStatus(selectedStaff?._id, step.toLowerCase().replace(/\s+/g, '_'), e.target.checked)}
                      colorScheme="green"
                    />
                  </HStack>
                ))}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onOnboardingModalClose} borderRadius="7px">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Training Modal */}
        <Modal isOpen={isTrainingModalOpen} onClose={onTrainingModalClose} size="xl">
          <ModalOverlay />
          <ModalContent borderRadius="7px" maxH="90vh" overflowY="auto">
            <ModalHeader>
              <HStack>
                <AwardIcon />
                <Text>Training - {selectedStaff?.name}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Assign Training</FormLabel>
                  <VStack spacing={3}>
                    <Input placeholder="Training Name" />
                    <Select placeholder="Training Type">
                      <option value="onboarding">Onboarding</option>
                      <option value="skill">Skill Development</option>
                      <option value="compliance">Compliance</option>
                      <option value="product">Product Knowledge</option>
                    </Select>
                    <Input type="date" placeholder="Due Date" />
                    <Button colorScheme="blue" w="full" onClick={() => {
                      assignTraining(selectedStaff?._id, {});
                      onTrainingModalClose();
                    }}>
                      Assign Training
                    </Button>
                  </VStack>
                </FormControl>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" mb={3}>Assigned Trainings</Text>
                  <VStack spacing={2} align="stretch">
                    {trainingData[selectedStaff?._id]?.map((training, index) => (
                      <Card key={index} size="sm">
                        <CardBody>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">{training.name}</Text>
                              <Text fontSize="xs" color="gray.500">{training.type}</Text>
                            </VStack>
                            <Badge colorScheme={
                              training.status === 'completed' ? 'green' :
                              training.status === 'in-progress' ? 'blue' : 'yellow'
                            }>
                              {training.status}
                            </Badge>
                          </HStack>
                        </CardBody>
                      </Card>
                    )) || <Text color="gray.500" fontSize="sm">No trainings assigned</Text>}
                  </VStack>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onTrainingModalClose} borderRadius="7px">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
  );
};

export default StaffManagement;
