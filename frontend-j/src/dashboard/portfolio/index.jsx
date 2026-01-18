import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { debugLocalStorage } from '../../redux/authSlice';
import { getCoachId, getToken, isAuthenticated, debugAuthState } from '../../utils/authUtils';
import { API_BASE_URL } from '../../config/apiConfig';
import {
  Box,
  Text,
  Button,
  Flex,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Input,
  Textarea,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Checkbox,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  InputGroup,
  Tabs,
  TabList,
  Tab,
  InputLeftElement,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
  Switch,
  FormControl,
  FormLabel,
  SimpleGrid,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Center,
  Skeleton,
  SkeletonText,
  Stack,
  TableContainer,
  Spinner,
  Progress,
  Divider,
  Tag,
  TagLabel,
  useColorMode
} from '@chakra-ui/react';
import {
  SearchIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  ViewIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  CopyIcon,
  WarningIcon
} from '@chakra-ui/icons';
import {
  FiEye,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiUsers,
  FiMoreVertical,
  FiPlay,
  FiPause,
  FiBarChart2,
  FiTrendingUp,
  FiCalendar,
  FiTarget,
  FiGlobe,
  FiCheckCircle,
  FiX
} from 'react-icons/fi';
import FunnelAnalytics from '../FunnelAnalytics';

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

        {/* Professional Table Skeleton */}
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
                <Skeleton height="32px" width="150px" borderRadius="lg" />
                <Skeleton height="32px" width="150px" borderRadius="lg" />
              </HStack>
            </Flex>
          </CardHeader>
          
          <CardBody pt={0} px={0}>
            <TableContainer w="full" overflowX="auto" borderRadius="lg" border="1px" borderColor="gray.100">
              <Table variant="simple" size="md" w="full">
                <Thead>
                  <Tr bg="gray.50">
                    {[...Array(9)].map((_, i) => (
                      <Th key={i} px={6} py={5}>
                        <Skeleton height="16px" width="80px" borderRadius="md" />
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {[...Array(5)].map((_, rowIndex) => (
                    <Tr key={rowIndex} borderBottom="1px" borderColor="gray.100">
                      {[...Array(9)].map((_, cellIndex) => (
                        <Td key={cellIndex} px={6} py={4}>
                          {cellIndex === 2 ? (
                            <VStack align="start" spacing={2}>
                              <Skeleton height="20px" width="180px" borderRadius="md" />
                              <Skeleton height="14px" width="250px" borderRadius="sm" />
                              <HStack spacing={2}>
                                <Skeleton height="20px" width="80px" borderRadius="full" />
                                <Skeleton height="20px" width="60px" borderRadius="full" />
                              </HStack>
                            </VStack>
                          ) : cellIndex === 5 ? (
                            <HStack spacing={2} justify="center">
                              <Skeleton height="32px" width="32px" borderRadius="md" />
                              <VStack spacing={0} align="center">
                                <Skeleton height="16px" width="20px" borderRadius="sm" />
                                <Skeleton height="12px" width="40px" borderRadius="sm" />
                              </VStack>
                            </HStack>
                          ) : cellIndex === 6 || cellIndex === 7 ? (
                            <VStack spacing={0.5} align="center">
                              <Skeleton height="12px" width="80px" borderRadius="sm" />
                              <Skeleton height="10px" width="60px" borderRadius="sm" />
                            </VStack>
                          ) : cellIndex === 8 ? (
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
            <Text color="gray.500" fontSize="sm" fontWeight="medium">
              Loading your funnels...
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

// Enhanced Toggle Switch
const FunnelToggleSwitch = ({ isActive, onToggle, isLoading }) => {
  return (
    <Tooltip label={isActive ? 'Deactivate Funnel' : 'Activate Funnel'}>
      <Box onClick={(e) => e.stopPropagation()}>
        <Switch
          isChecked={isActive}
          onChange={onToggle}
          isDisabled={isLoading}
          colorScheme="green"
          size="md"
        />
      </Box>
    </Tooltip>
  );
};

// Status Badge Component
const StatusBadge = ({ status, isActive }) => (
  <Badge 
    colorScheme={isActive ? "green" : "red"} 
    variant="solid" 
    borderRadius="md" 
    px={2}
    py={0.5}
    fontSize="10px"
    fontWeight="semibold"
  >
    {isActive ? "Active" : "Inactive"}
  </Badge>
);

// Type Badge Component
const TypeBadge = ({ type }) => {
  const colorScheme = {
    webinar: 'purple',
    vsl: 'blue', 
    quiz: 'orange',
    survey: 'teal',
    custom: 'gray'
  }[type] || 'gray';

  const displayName = {
    webinar: 'Webinar',
    vsl: 'VSL',
    quiz: 'Quiz',
    survey: 'Survey', 
    custom: 'Custom'
  }[type] || type;

  return (
    <Tag size="md" colorScheme={colorScheme} borderRadius="full">
      <TagLabel>{displayName}</TagLabel>
    </Tag>
  );
};

function FunnelManagementComponent() {
  // State Management
  const [funnels, setFunnels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFunnel, setSelectedFunnel] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [duplicateId, setDuplicateId] = useState(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishingId, setPublishingId] = useState(null);
  const [filterType, setFilterType] = useState('default');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedFunnels, setSelectedFunnels] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuFunnelId, setMenuFunnelId] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuOpen) {
        // Check if click is outside the menu
        const menuElement = document.querySelector('[data-menu-portal]');
        if (menuElement && !menuElement.contains(event.target)) {
          setActionMenuOpen(false);
          setMenuFunnelId(null);
        }
      }
    };

    if (actionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenuOpen]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAudience: 'customer',
    funnelUrl: '',
    indexPageId: '' // ID of the stage that should be the index/landing page
  });

  // Modals
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isAnalyticsModalOpen, onOpen: onAnalyticsModalOpen, onClose: onAnalyticsModalClose } = useDisclosure();
  const [selectedFunnelForAnalytics, setSelectedFunnelForAnalytics] = useState(null);
  const { isOpen: isViewModalOpen, onOpen: onViewModalOpen, onClose: onViewModalClose } = useDisclosure();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const customToast = useCustomToast();
  const authState = useSelector(state => state.auth);
  const coachID = getCoachId(authState);
  const token = getToken(authState);
  
  // Debug authentication state
  useEffect(() => {
    console.log('🔍 Portfolio - Component mounted, debugging auth state...');
    debugLocalStorage();
    debugAuthState(authState, 'Portfolio');
  }, [authState]);

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.200');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const shadowColor = useColorModeValue('md', 'dark-lg');
  const { colorMode } = useColorMode();

  // Helper Functions
  const determineFunnelType = (stages) => {
    if (!stages || !stages.length) return 'vsl';
    const types = {
      webinar: stages.some(s => s.type?.includes('webinar')),
      vsl: stages.some(s => s.type?.includes('vsl')),
      quiz: stages.some(s => s.type?.includes('quiz')),
      survey: stages.some(s => s.type?.includes('survey'))
    };
    return Object.keys(types).find(key => types[key]) || 'custom';
  };

  const generateFunnelUrl = (name) => {
    if (!name) return '';
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const couchId = coachID || 'unknown';
    return `${sanitizedName}-${couchId}-${Date.now().toString(36)}`;
  };

  const formatDateWithTime = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      customToast('URL copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to copy: ', err);
      customToast('Failed to copy URL', 'error');
    }
  };

  const handleShareFunnel = (funnel) => {
    const funnelUrl = getFunnelUrl(funnel);
    if (funnelUrl) {
      copyToClipboard(funnelUrl);
    } else {
      customToast('Funnel URL not available. Please publish the funnel first.', 'warning');
    }
  };

  // Auto-generate funnel URL when name changes (only for new funnels)
  useEffect(() => {
    if (!isEditMode && formData.name && !formData.funnelUrl) {
      const generatedUrl = generateFunnelUrl(formData.name);
      setFormData(prev => ({ ...prev, funnelUrl: generatedUrl }));
    }
  }, [formData.name, isEditMode]);

  const getFunnelUrl = (funnel) => {
    if (!funnel.funnelUrl || !funnel.stages || funnel.stages.length === 0) {
      return null;
    }
    // Use indexPageId if available, otherwise use first stage's pageId
    const pageId = funnel.indexPageId || funnel.stages[0]?.pageId;
    if (!pageId) return null;
    return `${API_BASE_URL}/funnels/${funnel.funnelUrl}/${pageId}`;
  };

  // Data Fetching
  useEffect(() => {
    const fetchFunnels = async () => {
      if (!coachID || !token) {
        customToast('Authentication data not available. Please log in again.', 'error');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/funnels/coach/${coachID}/funnels`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const { data, success } = await response.json();
        if (!success || !Array.isArray(data)) throw new Error('Invalid data format from API');

        const transformedData = data.map(f => ({
          id: f._id,
          name: f.name,
          description: f.description,
          targetAudience: f.targetAudience || 'customer',
          createdAt: f.createdAt,
          updatedAt: f.updatedAt || f.createdAt,
          // Align with docs: prefer isPublished, fallback to isActive
          isActive: (f.isActive ?? f.isPublished ?? false),
          funnelUrl: f.funnelUrl,
          stages: f.stages,
          stageCount: f.stages?.length || 0,
          coachId: f.coachId,
          funnelType: determineFunnelType(f.stages),
          isPublished: (f.isPublished ?? f.isActive ?? false),
          indexPageId: f.indexPageId || f.stages?.[0]?.pageId || ''
        }));
        
        setFunnels(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching funnels:', err);
        const errorMsg = err.response?.data?.message || err.message || "Failed to fetch funnels. Please try again.";
        setError(errorMsg);
        customToast(errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchFunnels();
  }, [coachID, token]);

  // Event Handlers
  const handleOpenModal = (editMode = false, funnel = null) => {
    setIsEditMode(editMode);
    setSelectedFunnel(funnel);
    // Set indexPageId - use the first stage's pageId if available, or empty string
    const defaultIndexPageId = editMode && funnel?.stages?.length > 0 
      ? (funnel.indexPageId || funnel.stages[0]?.pageId || '') 
      : '';
    setFormData({
      name: editMode ? funnel.name : '',
      description: editMode ? funnel.description : '',
      targetAudience: editMode ? funnel.targetAudience || 'customer' : 'customer',
      funnelUrl: editMode ? funnel.funnelUrl || '' : '',
      indexPageId: defaultIndexPageId
    });
    onModalOpen();
  };

  const handleRowClick = (funnel) => {
    console.log('Row clicked:', funnel.name);
    navigate(`/funnel_settings/${funnel.id}`);
  };

  const handleViewFunnel = (funnel) => {
    setSelectedFunnel(funnel);
    
    if (funnel.funnelUrl && funnel.stages && funnel.stages.length > 0) {
      const funnelUrl = getFunnelUrl(funnel);
      if (funnelUrl) {
        // Open funnel in new tab if it has a public URL
        window.open(funnelUrl, '_blank');
        customToast('Opening funnel in new tab', 'success');
      } else {
        // Show view modal if URL is not available
        onViewModalOpen();
      }
    } else {
      // Show view modal for funnels without published pages
      onViewModalOpen();
    }
  };

  const handleDeleteFunnel = (funnel) => {
    setSelectedFunnel(funnel);
    onDeleteModalOpen();
  };

  const confirmDeleteFunnel = async () => {
    if (!selectedFunnel) {
      customToast('No funnel selected for deletion', 'error');
      return;
    }
    
    if (!coachID || !token) {
      customToast('Authentication data not available. Please log in again.', 'error');
      return;
    }
    
    // Check if funnel is active - warn user if it is
    if (selectedFunnel.isActive) {
      customToast('Please deactivate the funnel before deleting it', 'warning');
      return;
    }
    
    try {
      // Show loading state
      setActionLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/funnels/coach/${coachID}/funnels/${selectedFunnel.id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('Delete API Error Details:', errorData);
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      // Success - remove from local state
      setFunnels(prevFunnels => prevFunnels.filter(f => f.id !== selectedFunnel.id));
      customToast('Funnel deleted successfully', 'success');
      onDeleteModalClose();
      
    } catch (err) {
      console.error('Error deleting funnel:', err);
      
      // More specific error messages
      let userMessage = 'Failed to delete funnel';
      if (err.message.includes('401')) {
        userMessage = 'Authentication failed. Please log in again.';
      } else if (err.message.includes('403')) {
        userMessage = 'You do not have permission to delete this funnel.';
      } else if (err.message.includes('404')) {
        userMessage = 'Funnel not found. It may have been already deleted.';
      } else if (err.message.includes('500')) {
        userMessage = 'Server error occurred. Please try again later.';
      } else {
        userMessage = err.message || userMessage;
      }
      
      customToast(userMessage, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (funnelId, currentStatus) => {
    setPublishLoading(true);
    setPublishingId(funnelId);
    
    try {
      const fetchRes = await fetch(`${API_BASE_URL}/api/funnels/coach/${coachID}/funnels/${funnelId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!fetchRes.ok) throw new Error('Failed to fetch funnel details');
      const { data: fullFunnel } = await fetchRes.json();
      const nextStatus = !currentStatus;
      const payload = { 
        ...fullFunnel, 
        isActive: nextStatus,
        isPublished: nextStatus
      };

      const updateRes = await fetch(`${API_BASE_URL}/api/funnels/coach/${coachID}/funnels/${funnelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!updateRes.ok) throw new Error('Failed to update funnel status');

      setFunnels(funnels.map(f => 
        f.id === funnelId 
          ? { ...f, isPublished: nextStatus, isActive: nextStatus }
          : f
      ));
      
      customToast(`Funnel ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
      
    } catch (err) {
      console.error('Error updating funnel status:', err);
      customToast('Failed to update funnel status', 'error');
    } finally {
      setPublishLoading(false);
      setPublishingId(null);
    }
  };


  // Bulk action functions
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedFunnels([]);
      setIsAllSelected(false);
    } else {
      setSelectedFunnels(paginatedFunnels.map(f => f.id));
      setIsAllSelected(true);
    }
  };

  const handleSelectFunnel = (funnelId) => {
    if (selectedFunnels.includes(funnelId)) {
      setSelectedFunnels(selectedFunnels.filter(id => id !== funnelId));
      setIsAllSelected(false);
    } else {
      const newSelected = [...selectedFunnels, funnelId];
      setSelectedFunnels(newSelected);
      setIsAllSelected(newSelected.length === filteredFunnels.length);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFunnels.length === 0) return;
    
    setActionLoading(true);
    try {
      const deletePromises = selectedFunnels.map(id => 
        fetch(`${API_BASE_URL}/api/funnels/coach/${coachID}/funnels/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );
      
      await Promise.all(deletePromises);
      
      setFunnels(funnels.filter(f => !selectedFunnels.includes(f.id)));
      setSelectedFunnels([]);
      setIsAllSelected(false);
      
      customToast(`${selectedFunnels.length} funnel(s) deleted successfully`, 'success');
    } catch (err) {
      console.error('Error deleting funnels:', err);
      customToast('Failed to delete funnels', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkToggleStatus = async (status) => {
    if (selectedFunnels.length === 0) return;
    
    setActionLoading(true);
    try {
      const updatePromises = selectedFunnels.map(async (id) => {
        const funnel = funnels.find(f => f.id === id);
        if (!funnel) return;
        
        const fetchRes = await fetch(`https://api.funnelseye.com/api/funnels/coach/${coachID}/funnels/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!fetchRes.ok) throw new Error('Failed to fetch funnel details');
        const { data: fullFunnel } = await fetchRes.json();
        
        const payload = { 
          ...fullFunnel, 
          isActive: status, 
          isPublished: status,
          updatedAt: new Date().toISOString() 
        };
        
        return fetch(`https://api.funnelseye.com/api/funnels/coach/${coachID}/funnels/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      });
      
      await Promise.all(updatePromises);
      
      setFunnels(funnels.map(f => 
        selectedFunnels.includes(f.id) 
          ? { ...f, isActive: status, isPublished: status, updatedAt: new Date().toISOString() }
          : f
      ));
      
      setSelectedFunnels([]);
      setIsAllSelected(false);
      
      customToast(`${selectedFunnels.length} funnel(s) ${status ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (err) {
      console.error('Error updating funnel status:', err);
      customToast('Failed to update funnel status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateOrUpdateFunnel = async () => {
    if (!formData.name.trim()) {
      customToast('Please enter a funnel name.', 'error');
      return;
    }
    
    setActionLoading(true);
    try {
      // Use custom funnel URL if provided, otherwise generate one
      const funnelUrl = formData.funnelUrl.trim() || generateFunnelUrl(formData.name);
      
      let payload;
      let url;
      let method;

      if (isEditMode) {
        method = 'PUT';
        url = `${API_BASE_URL}/api/funnels/coach/${coachID}/funnels/${selectedFunnel.id}`;
        const fetchRes = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` }});
        if (!fetchRes.ok) throw new Error('Failed to fetch funnel for update.');
        const { data: fullFunnel } = await fetchRes.json();
        payload = { 
          ...fullFunnel, 
          name: formData.name, 
          description: formData.description, 
          targetAudience: formData.targetAudience,
          funnelUrl: funnelUrl,
          indexPageId: formData.indexPageId || fullFunnel.indexPageId || (fullFunnel.stages?.[0]?.pageId || ''),
          // keep status fields aligned with docs
          isActive: fullFunnel.isActive ?? fullFunnel.isPublished ?? false,
          isPublished: fullFunnel.isPublished ?? fullFunnel.isActive ?? false
        };
      } else {
        method = 'POST';
        url = `${API_BASE_URL}/api/funnels/coach/${coachID}/funnels`;
        const firstStagePageId = `welcome-page-${Date.now()}`;
        payload = {
          name: formData.name,
          description: formData.description,
          targetAudience: formData.targetAudience,
          // create as draft per docs
          isActive: false,
          isPublished: false,
          funnelUrl: funnelUrl,
          couchId: coachID,
          indexPageId: formData.indexPageId || firstStagePageId, // Set first stage as default index page
          stages: [{
            pageId: firstStagePageId,
            name: 'Welcome Page',
            type: 'welcome-page',
            order: 0,
            html: `<h1>Welcome to ${formData.name}</h1><p>Get started with your journey.</p>`,
            css: '',
            js: '',
            assets: [],
            isEnabled: true,
            basicInfo: {
              title: formData.name || 'Welcome Page',
              description: formData.description || '',
              favicon: null,
              keywords: '',
              socialTitle: '',
              socialImage: null,
              socialDescription: '',
              customHtmlHead: '',
              customHtmlBody: ''
            }
          }]
        };
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to ${isEditMode ? 'update' : 'create'} funnel.`);
      }

      const { data: resultFunnel } = await response.json();
      const transformedFunnel = {
        id: resultFunnel._id,
        name: resultFunnel.name || formData.name,
        description: resultFunnel.description || formData.description,
        targetAudience: resultFunnel.targetAudience || formData.targetAudience,
        createdAt: resultFunnel.createdAt,
        isActive: (resultFunnel.isActive ?? resultFunnel.isPublished ?? false),
        funnelUrl: resultFunnel.funnelUrl || funnelUrl,
        stages: resultFunnel.stages,
        stageCount: resultFunnel.stages?.length || 0,
        coachId: resultFunnel.coachId,
        funnelType: determineFunnelType(resultFunnel.stages),
        isPublished: (resultFunnel.isPublished ?? resultFunnel.isActive ?? false),
        indexPageId: resultFunnel.indexPageId || resultFunnel.stages?.[0]?.pageId || ''
      };

      if (isEditMode) {
        setFunnels(funnels.map(f => f.id === resultFunnel._id ? transformedFunnel : f));
        customToast('Funnel updated successfully!', 'success');
      } else {
        setFunnels([...funnels, transformedFunnel]);
        customToast('Funnel created successfully!', 'success');
        // Ensure the funnel name is properly set before navigation
        navigate(`/funnel_settings/${resultFunnel._id}`);
      }
      onModalClose();
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} funnel:`, err);
      customToast(`Error: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicateFunnel = async (funnelId) => {
    setDuplicateLoading(true);
    setDuplicateId(funnelId);
    
    try {
      const response = await fetch(`https://api.funnelseye.com/api/funnels/coach/${coachID}/funnels/${funnelId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Failed to fetch original funnel: ${response.status}`);
      const { data: originalFunnel } = await response.json();
      if (!originalFunnel) throw new Error('Original funnel data not found.');

      const newFunnelName = `${originalFunnel.name} (Copy)`;
      const sanitizedSlug = newFunnelName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') + `-${Date.now().toString(36)}`;

      // Find the first stage's pageId to use as default indexPageId
      const firstStagePageId = originalFunnel.stages?.[0]?.pageId;
      const newStages = (originalFunnel.stages || []).map(stage => {
          const { _id, ...rest } = stage;
          return {
            ...rest,
            pageId: `${stage.type || 'page'}-copy-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            html: stage.html || `<h1>${stage.name || 'Page'}</h1><p>Content goes here.</p>`,
            css: stage.css || '',
            js: stage.js || '',
            assets: stage.assets || [],
            isEnabled: stage.isEnabled !== undefined ? stage.isEnabled : true,
            basicInfo: stage.basicInfo || {
              title: stage.name || 'Page',
              description: '',
              favicon: null,
              keywords: '',
              socialTitle: '',
              socialImage: null,
              socialDescription: '',
              customHtmlHead: '',
              customHtmlBody: ''
            }
          };
        });
      
      // Map the old indexPageId to the new pageId if it exists
      let newIndexPageId = '';
      if (originalFunnel.indexPageId && originalFunnel.stages?.length > 0) {
        const oldIndexStage = originalFunnel.stages.find(s => (s.pageId || s._id) === originalFunnel.indexPageId);
        if (oldIndexStage) {
          const oldIndexStageIndex = originalFunnel.stages.findIndex(s => (s.pageId || s._id) === originalFunnel.indexPageId);
          newIndexPageId = newStages[oldIndexStageIndex]?.pageId || newStages[0]?.pageId || '';
        }
      } else {
        newIndexPageId = newStages[0]?.pageId || '';
      }
      
      const payload = {
        name: newFunnelName,
        description: originalFunnel.description || '',
        targetAudience: originalFunnel.targetAudience || 'customer',
        isActive: false,
        isPublished: false,
        funnelUrl: sanitizedSlug,
        indexPageId: newIndexPageId,
        // keep existing content structure if present; ensure required fields are present
        stages: newStages
      };
      
      const createResponse = await fetch(`https://api.funnelseye.com/api/funnels/coach/${coachID}/funnels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error("Duplicate Funnel - Server Error:", errorText);
        throw new Error(`Server error on duplication: ${createResponse.status}`);
      }
      
      const { data: newFunnel } = await createResponse.json();
      
      const transformedFunnel = {
        id: newFunnel._id,
        name: newFunnel.name,
        description: newFunnel.description,
        targetAudience: newFunnel.targetAudience,
        createdAt: newFunnel.createdAt,
        isActive: (newFunnel.isActive ?? newFunnel.isPublished ?? false),
        funnelUrl: newFunnel.funnelUrl,
        stages: newFunnel.stages,
        stageCount: newFunnel.stages?.length || 0,
        coachId: newFunnel.coachId,
        funnelType: determineFunnelType(newFunnel.stages),
        isPublished: (newFunnel.isPublished ?? newFunnel.isActive ?? false)
      };
      
      setFunnels(prev => [...prev, transformedFunnel]);
      customToast('Funnel duplicated successfully!', 'success');
      navigate(`/funnel_settings/${newFunnel._id}`);
    } catch (err) {
      console.error('Error duplicating funnel:', err);
      customToast(`Failed to duplicate funnel: ${err.message}`, 'error');
    } finally {
      setDuplicateLoading(false);
      setDuplicateId(null);
    }
  };

  // Filter funnels based on search and type
  const filteredFunnels = useMemo(() => {
    const filtered = funnels.filter(funnel => {
      const safeName = (funnel?.name || '').toString().toLowerCase();
      const safeDescription = (funnel?.description || '').toString().toLowerCase();
      const term = (searchTerm || '').toString().toLowerCase();

      const matchesSearch = safeName.includes(term) || safeDescription.includes(term);

      const matchesType = filterType === 'default'
        ? funnel.targetAudience === 'customer' || !funnel.targetAudience
        : funnel.targetAudience === 'coach';

      const normalizedStatus = (funnel.status || (funnel.isActive ? 'active' : 'draft')).toString().toLowerCase();
      const matchesStatus = filterStatus === 'all' || normalizedStatus === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
    
    // Update total items for pagination
    setTotalItems(filtered.length);
    
    return filtered;
  }, [funnels, searchTerm, filterType, filterStatus]);

  const sortedFunnels = useMemo(() => {
    return [...filteredFunnels].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'conversionRate':
          return (b.conversionRate || 0) - (a.conversionRate || 0);
        case 'revenue':
          return (b.revenue || 0) - (a.revenue || 0);
        case 'createdAt':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });
  }, [filteredFunnels, sortBy]);

  // Pagination logic
  const paginatedFunnels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedFunnels.slice(startIndex, endIndex);
  }, [sortedFunnels, currentPage, itemsPerPage]);

  const funnelStats = useMemo(() => {
    const total = funnels.length;
    const active = funnels.filter((f) => f.isActive).length;
    const drafts = Math.max(total - active, 0);
    const totalStages = funnels.reduce(
      (sum, f) => sum + (f.stageCount ?? f.stages?.length ?? 0),
      0
    );
    const avgStages = total ? (totalStages / total).toFixed(1) : '0.0';

    return [
      {
        label: 'Total Funnels',
        value: total,
        helper: 'Workspace funnels',
        icon: FiGlobe,
        color: 'brand'
      },
      {
        label: 'Active Funnels',
        value: active,
        helper: 'Currently live',
        icon: FiPlay,
        color: 'green'
      },
      {
        label: 'Drafts',
        value: drafts,
        helper: 'Not live yet',
        icon: FiPause,
        color: 'orange'
      },
      {
        label: 'Total Stages',
        value: totalStages,
        helper: `Avg ${avgStages} per funnel`,
        icon: FiTarget,
        color: 'purple'
      }
    ];
  }, [funnels]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedFunnels([]); // Clear selection when changing pages
    setIsAllSelected(false);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(Number(newItemsPerPage));
    setCurrentPage(1); // Reset to first page
    setSelectedFunnels([]); // Clear selection
    setIsAllSelected(false);
  };

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: funnels.length,
      active: funnels.filter(f => f.isActive).length,
      hot: funnels.filter(f => f.isActive && f.stageCount > 2).length,
      warm: funnels.filter(f => !f.isActive).length,
      cold: funnels.filter(f => f.stageCount <= 1).length
    };
  }, [funnels]);

  if (loading && !funnels.length) {
    return <ProfessionalLoader />;
  }

  if (error) return (
    <Box 
      bg={useColorModeValue('white', 'gray.900')} 
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
      <Box maxW="500px" w="auto" mx="auto" textAlign="center">
        <VStack spacing={6}>
          {/* Minimal Icon */}
          <Box
            w="64px"
            h="64px"
            borderRadius="full"
            bg={useColorModeValue('red.50', 'red.900')}
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
          >
            <WarningIcon 
              boxSize="32px" 
              color={useColorModeValue('red.500', 'red.300')}
            />
          </Box>

          {/* Error Content */}
          <VStack spacing={3}>
            <Heading 
              size="md" 
              fontWeight="600"
              color={useColorModeValue('gray.900', 'white')}
              letterSpacing="-0.3px"
            >
              Unable to Load Funnels
            </Heading>
            <Text 
              color={useColorModeValue('gray.600', 'gray.400')} 
              fontSize="sm"
              lineHeight="1.5"
              maxW="400px"
              mx="auto"
              noOfLines={3}
            >
              {error}
            </Text>
          </VStack>

          {/* Action Button */}
          <Button 
            size="md"
            colorScheme="blue"
            borderRadius="lg"
            px={6}
            fontWeight="500"
            onClick={() => window.location.reload()}
            _hover={{ 
              transform: 'translateY(-2px)',
              boxShadow: 'lg'
            }}
            transition="all 0.2s"
          >
            Retry
          </Button>
        </VStack>
      </Box>
    </Box>
  );

  return (
    <Box bg={bgColor} minH="100vh" py={6} px={6} transition="all 0.3s ease" position="relative">
      {/* Loading Overlay */}
      {loading && funnels.length > 0 && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(255, 255, 255, 0.8)"
          backdropFilter="blur(2px)"
          zIndex={10}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <VStack spacing={4}>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
            <Text color="gray.600" fontSize="sm" fontWeight="medium">
              Updating data...
            </Text>
          </VStack>
        </Box>
      )}
      
      <Box maxW="full" mx="auto">
        <VStack spacing={8} align="stretch" w="full">
          {/* Header Section with Stats Cards */}
          <Card 
            bg={cardBg} 
            borderRadius="xl" 
            boxShadow={shadowColor} 
            border="1px" 
            borderColor={borderColor}
            transition="all 0.3s ease"
            opacity={loading ? 0.7 : 1}
            transform={loading ? 'scale(0.98)' : 'scale(1)'}
          >
            <CardHeader py={6}>
              <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
                  <VStack align={{ base: 'center', md: 'start' }} spacing={2}>
                    <HStack spacing={3}>
                      <Heading size="lg" color={textColor} fontWeight="bold">
                        Funnel Management 
                      </Heading>
                    </HStack>
                    <Text color={secondaryTextColor} fontSize="sm" fontWeight="medium">
                      Create, manage, and optimize your sales funnels for maximum conversions
                    </Text>
                  </VStack>
                  
                  <HStack spacing={3} flexWrap="wrap" alignSelf="flex-start">
                    <Button
                      leftIcon={<AddIcon />}
                      bg="linear-gradient(120deg, rgba(59,130,246,0.95), rgba(99,102,241,0.95))"
                      color="white"
                      borderRadius="lg"
                      px={6}
                      py={4}
                      fontWeight="600"
                      fontSize="sm"
                      letterSpacing="0.03em"
                      onClick={() => handleOpenModal(false, null)}
                      boxShadow="0 12px 32px -24px rgba(59,130,246,1)"
                      _hover={{ transform: 'translateY(-2px)', boxShadow: '0 18px 38px -24px rgba(59,130,246,1)' }}
                      _active={{ transform: 'translateY(0)' }}
                    >
                      New Funnel
                    </Button>
                  </HStack>
                </Flex>

                <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4} w="full">
                  {funnelStats.map((card) => {
                    const isDark = colorMode === 'dark';
                    const bgTone = isDark ? `${card.color}.900` : `${card.color}.50`;
                    const borderTone = isDark ? `${card.color}.700` : `${card.color}.200`;
                    const iconBg = isDark ? `${card.color}.800` : `${card.color}.100`;
                    const iconColor = isDark ? `${card.color}.200` : `${card.color}.600`;
                    const valueColor = isDark ? `${card.color}.100` : `${card.color}.700`;

                    return (
                      <Box
                        key={card.label}
                        p={4}
                        bg={bgTone}
                        borderRadius="lg"
                        border="1px"
                        borderColor={borderTone}
                        boxShadow="sm"
                        transition="all 0.2s ease"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                      >
                        <HStack spacing={4} align="center">
                          <Box
                            w="44px"
                            h="44px"
                            borderRadius="md"
                            bg={iconBg}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color={iconColor}
                            border="1px solid"
                            borderColor={isDark ? `${card.color}.600` : `${card.color}.200`}
                          >
                            <Box as={card.icon} boxSize={5} />
                          </Box>
                          <VStack align="start" spacing={1}>
                            <Text
                              fontSize="xs"
                              fontWeight="700"
                              color={iconColor}
                              letterSpacing="0.05em"
                              textTransform="uppercase"
                            >
                              {card.label}
                            </Text>
                            <Text fontSize="2xl" fontWeight="800" color={valueColor} lineHeight="1">
                              {card.value}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    );
                  })}
                </SimpleGrid>

                {/* Filters in header */}
                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  spacing={3}
                  align={{ base: 'stretch', md: 'center' }}
                  justify="space-between"
                  w="100%"
                >
                  <InputGroup flex="1" maxW="640px">
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color={secondaryTextColor} />
                    </InputLeftElement>
                    <Input
                      placeholder="Search funnels..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      bg="white"
                      borderRadius="lg"
                      border="1px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.300', boxShadow: '0 0 0 1px var(--chakra-colors-blue-300)' }}
                      _hover={{ borderColor: 'gray.300' }}
                      transition="all 0.2s ease"
                    />
                  </InputGroup>
                  <HStack spacing={2} alignSelf={{ base: 'stretch', md: 'flex-end' }}>
                    <Select
                      size="sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      bg="white"
                      borderRadius="lg"
                      border="1px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.300', boxShadow: '0 0 0 1px var(--chakra-colors-blue-300)', transform: 'translateY(-1px)' }}
                      _hover={{ borderColor: 'gray.300', transform: 'translateY(-1px)' }}
                      transition="all 0.15s ease"
                      minW="170px"
                      sx={{
                        '& option': {
                          transition: 'all 0.15s ease',
                          _hover: {
                            transform: 'translateX(2px)',
                            backgroundColor: 'blue.50'
                          }
                        }
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                    <Select
                      size="sm"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      bg="white"
                      borderRadius="lg"
                      border="1px"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.300', boxShadow: '0 0 0 1px var(--chakra-colors-blue-300)', transform: 'translateY(-1px)' }}
                      _hover={{ borderColor: 'gray.300', transform: 'translateY(-1px)' }}
                      transition="all 0.15s ease"
                      minW="200px"
                      sx={{
                        '& option': {
                          transition: 'all 0.15s ease',
                          _hover: {
                            transform: 'translateX(2px)',
                            backgroundColor: 'blue.50'
                          }
                        }
                      }}
                    >
                      <option value="name">Sort by Name</option>
                      <option value="conversionRate">Sort by Conversion</option>
                      <option value="revenue">Sort by Revenue</option>
                      <option value="createdAt">Sort by Date</option>
                    </Select>
                  </HStack>
                </Stack>
                
              </VStack>
            </CardHeader>
          </Card>

          {/* Main Table */}
          <Card 
            bg="white" 
            borderRadius="xl" 
            boxShadow="lg" 
            border="1px" 
            borderColor="gray.200"
            transition="all 0.3s ease"
            opacity={loading ? 0.7 : 1}
            transform={loading ? 'scale(0.98)' : 'scale(1)'}
          >
            <CardHeader py={6}>
              <VStack align="stretch" spacing={4}>
                {/* Removed bottom filters to keep controls only in the top header */}
                <Box>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium" mb={2}>
                    Funnel Type
                  </Text>
                  <Tabs
                    index={filterType === 'coach' ? 1 : 0}
                    onChange={(i) => setFilterType(i === 1 ? 'coach' : 'default')}
                    colorScheme="blue"
                  >
                    <TabList borderBottom="1px" borderColor="gray.200">
                      <Tab
                        _selected={{ color: 'blue.600', borderBottom: '2px solid', borderColor: 'blue.600' }}
                        fontWeight="600"
                        fontSize="sm"
                        px={4}
                        py={3}
                        color="gray.600"
                        _hover={{ color: 'gray.900' }}
                      >
                        Customer
                      </Tab>
                      <Tab
                        _selected={{ color: 'blue.600', borderBottom: '2px solid', borderColor: 'blue.600' }}
                        fontWeight="600"
                        fontSize="sm"
                        px={4}
                        py={3}
                        color="gray.600"
                        _hover={{ color: 'gray.900' }}
                      >
                        Coach
                      </Tab>
                    </TabList>
                  </Tabs>
                </Box>
                {selectedFunnels.length > 0 && (
                  <Box px={5} py={3} bg="gray.50" borderRadius="xl" border="1px" borderColor="gray.100">
                    <Flex
                      justify="space-between"
                      align={{ base: 'flex-start', md: 'center' }}
                      direction={{ base: 'column', md: 'row' }}
                      gap={3}
                    >
                      <Text color="gray.700" fontWeight="semibold" fontSize="sm">
                        {selectedFunnels.length} funnel(s) selected
                      </Text>
                      <HStack spacing={3}>
                        <Button
                          size="sm"
                          colorScheme="green"
                          variant="ghost"
                          borderRadius="full"
                          onClick={() => handleBulkToggleStatus(true)}
                          isLoading={actionLoading}
                          leftIcon={<Box as={FiCheckCircle} />}
                        >
                          Activate
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="orange"
                          variant="ghost"
                          borderRadius="full"
                          onClick={() => handleBulkToggleStatus(false)}
                          isLoading={actionLoading}
                          leftIcon={<Box as={FiX} />}
                        >
                          Pause
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          borderRadius="full"
                          onClick={handleBulkDelete}
                          isLoading={actionLoading}
                          leftIcon={<Box as={FiX} />}
                        >
                          Delete
                        </Button>
                      </HStack>
                    </Flex>
                  </Box>
                )}
              </VStack>
            </CardHeader>
            <CardBody pt={0} px={0}>
              <TableContainer w="full" overflowX="auto" overflowY="visible" borderRadius="lg" border="1px" borderColor="gray.100" position="relative">
                <Table variant="simple" size="md" w="full" sx={{
                  'th, td': {
                    borderColor: 'gray.100'
                  }
                }}>
                  <Thead>
                    <Tr bg="gray.50" borderBottom="2px" borderColor="gray.200">
                      <Th px={6} py={5} color="gray.500" fontWeight="semibold" fontSize="xs" textAlign="center">
                        <Checkbox
                          isChecked={isAllSelected}
                          onChange={handleSelectAll}
                          colorScheme="blue"
                          size="md"
                        />
                      </Th>
                      <Th px={4} py={5} color="gray.500" fontWeight="semibold" fontSize="xs" textAlign="center">
                        #
                      </Th>
                      <Th px={6} py={5} color="gray.500" fontWeight="semibold" fontSize="xs">
                        Funnel Overview
                      </Th>
                      <Th px={6} py={5} color="gray.500" fontWeight="semibold" fontSize="xs">
                        Status & Activity
                      </Th>
                      <Th px={6} py={5} color="gray.500" fontWeight="semibold" fontSize="xs">
                        Stages
                      </Th>
                      <Th px={4} py={5} color="gray.500" fontWeight="semibold" fontSize="xs" textAlign="right">
                        Quick Actions
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {loading && funnels.length === 0 ? (
                      [...Array(5)].map((_, index) => (
                        <Tr key={index}>
                          {[...Array(7)].map((_, cellIndex) => (
                            <Td key={cellIndex}>
                              <Skeleton 
                                height="20px" 
                                startColor="gray.200"
                                endColor="gray.300"
                                borderRadius="md"
                              />
                            </Td>
                          ))}
                        </Tr>
                      ))
                    ) : filteredFunnels.length > 0 ? (
                      paginatedFunnels.map((funnel, index) => (
                        <Tr 
                          key={funnel.id}
                          cursor="pointer"
                          onClick={(e) => {
                            console.log('Row click event:', e);
                            handleRowClick(funnel);
                          }}
                          bg="white"
                          _hover={{ bg: 'gray.50', transform: 'translateY(-1px)', boxShadow: 'sm' }}
                          borderBottom="1px"
                          borderColor="gray.100"
                          transition="all 0.3s"
                          position="relative"
                          zIndex={1}
                        >
                          <Td px={6} py={5} textAlign="center">
                            <Checkbox
                              isChecked={selectedFunnels.includes(funnel.id)}
                              onChange={() => handleSelectFunnel(funnel.id)}
                              colorScheme="blue"
                              size="md"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Td>
                          <Td px={4} py={5} textAlign="center">
                            <Text fontWeight="bold" color="gray.600" fontSize="sm">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </Text>
                          </Td>
                          <Td px={6} py={5}>
                            <VStack align="start" spacing={2}>
                              <Text fontWeight="600" fontSize="md" color="gray.900">
                                {funnel.name}
                              </Text>
                              {(() => {
                                const funnelLink = getFunnelUrl(funnel);
                                return funnelLink ? (
                                  <HStack spacing={2} onClick={(e) => e.stopPropagation()}>
                                    <Text 
                                      fontSize="xs" 
                                      color="blue.600" 
                                      fontWeight="medium"
                                      maxW="220px"
                                      isTruncated
                                      fontFamily="mono"
                                      cursor="pointer"
                                      _hover={{ textDecoration: 'underline' }}
                                      onClick={() => window.open(funnelLink, '_blank')}
                                    >
                                      {funnelLink}
                                    </Text>
                                    <Tooltip label="Copy Link">
                                      <IconButton
                                        size="xs"
                                        variant="ghost"
                                        icon={<Box as={FiCopy} />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          copyToClipboard(funnelLink);
                                        }}
                                        colorScheme="blue"
                                        aria-label="Copy funnel link"
                                        _hover={{ bg: 'blue.50' }}
                                      />
                                    </Tooltip>
                                  </HStack>
                                ) : (
                                  <Text fontSize="xs" color="gray.400" fontStyle="italic">
                                    Link not available
                                  </Text>
                                );
                              })()}
                              <Text color="gray.600" fontSize="sm" noOfLines={2}>
                                {funnel.description || 'No description provided'}
                              </Text>
                            </VStack>
                          </Td>
                          <Td px={6} py={5}>
                            <VStack align="start" spacing={3}>
                              <HStack spacing={3} align="center">
                                <StatusBadge status={funnel.status} isActive={funnel.isActive} />
                                {publishLoading && publishingId === funnel.id ? (
                                  <Spinner size="sm" color="green.500" />
                                ) : (
                                  <Box onClick={(e) => e.stopPropagation()}>
                                    <Switch
                                      isChecked={funnel.isActive}
                                      onChange={() => handleToggleStatus(funnel.id, funnel.isActive)}
                                      colorScheme="green"
                                      size="md"
                                      _focus={{ boxShadow: '0 0 0 3px rgba(72, 187, 120, 0.2)' }}
                                    />
                                  </Box>
                                )}
                              </HStack>
                              <HStack spacing={2} color="gray.500" fontSize="xs">
                                <Box w="6px" h="6px" borderRadius="full" bg="gray.300" />
                                <Text>Created • {formatDateWithTime(funnel.createdAt)}</Text>
                              </HStack>
                              <HStack spacing={2} color="gray.500" fontSize="xs">
                                <Box w="6px" h="6px" borderRadius="full" bg="gray.300" />
                                <Text>Updated • {formatDateWithTime(funnel.updatedAt)}</Text>
                              </HStack>
                            </VStack>
                          </Td>
                          <Td px={6} py={5}>
                            <HStack spacing={2}>
                              <Box
                                p={2}
                                bg="blue.50"
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Box as={FiTarget} color="blue.600" size={16} />
                              </Box>
                              <VStack spacing={0} align="flex-start">
                                <Text fontWeight="bold" color="gray.800" fontSize="md">
                                  {funnel.stageCount || 0}
                                </Text>
                                <Text fontSize="xs" color="gray.500">stages</Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td px={4} py={5}>
                            <HStack spacing={1} justify="flex-end">
                                <Tooltip label="View Funnel">
                                  <IconButton
                                    size="sm"
                                    variant="ghost"
                                    icon={<Box as={FiEye} />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewFunnel(funnel);
                                    }}
                                    colorScheme="blue"
                                    aria-label="View funnel"
                                    _hover={{ bg: 'blue.100', transform: 'scale(1.05)' }}
                                  />
                                </Tooltip>
                                
                                <Tooltip label="Edit Funnel">
                                  <IconButton
                                    size="sm"
                                    variant="ghost"
                                    icon={<Box as={FiEdit} />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenModal(true, funnel);
                                    }}
                                    colorScheme="orange"
                                    aria-label="Edit funnel"
                                    _hover={{ bg: 'orange.100', transform: 'scale(1.05)' }}
                                  />
                                </Tooltip>

                                <Tooltip label="View Analytics">
                                  <IconButton
                                    size="sm"
                                    variant="ghost"
                                    icon={<Box as={FiBarChart2} />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFunnelForAnalytics(funnel);
                                      onAnalyticsModalOpen();
                                    }}
                                    colorScheme="purple"
                                    aria-label="View analytics"
                                    _hover={{ bg: 'purple.100', transform: 'scale(1.05)' }}
                                  />
                                </Tooltip>
                                
                                <Box position="relative">
                                  <IconButton
                                    icon={<Box as={FiMoreVertical} />}
                                    variant="ghost"
                                    size="sm"
                                    aria-label="More actions"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const viewportWidth = window.innerWidth;
                                      const viewportHeight = window.innerHeight;
                                      
                                      // Calculate position to keep menu in viewport
                                      let x = rect.right - 200;
                                      let y = rect.bottom + 4;
                                      
                                      // Adjust if menu would go off screen
                                      if (x < 10) x = rect.left - 200;
                                      if (y > viewportHeight - 200) y = rect.top - 200;
                                      
                                      setMenuPosition({ x, y });
                                      setSelectedFunnel(funnel);
                                      setMenuFunnelId(funnel.id);
                                      setActionMenuOpen(true);
                                    }}
                                    _hover={{ bg: 'gray.100', transform: 'scale(1.05)' }}
                                  />
                                  {actionMenuOpen && menuFunnelId === funnel.id && createPortal(
                                    <>
                                      {/* Backdrop */}
                                      <Box
                                        position="fixed"
                                        top="0"
                                        left="0"
                                        right="0"
                                        bottom="0"
                                        zIndex={999998}
                                        onClick={() => {
                                          setActionMenuOpen(false);
                                          setMenuFunnelId(null);
                                        }}
                                      />
                                      {/* Menu */}
                                      <Box
                                        data-menu-portal
                                        position="fixed"
                                        top={`${menuPosition.y}px`}
                                        left={`${menuPosition.x}px`}
                                        bg="white"
                                        boxShadow="2xl"
                                        borderRadius="lg"
                                        border="1px solid"
                                        borderColor="gray.300"
                                        minW="200px"
                                        zIndex={999999}
                                        py={2}
                                      >
                                        <VStack spacing={0} align="stretch">
                                          <Button
                                            variant="ghost"
                                            justifyContent="flex-start"
                                            leftIcon={<Box as={FiCopy} size={16} />}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActionMenuOpen(false);
                                              setMenuFunnelId(null);
                                              handleDuplicateFunnel(funnel.id);
                                            }}
                                            _hover={{
                                              bg: 'blue.50',
                                              color: 'blue.600',
                                              transform: 'translateX(2px)'
                                            }}
                                            transition="all 0.15s ease"
                                            borderRadius="4px"
                                            py={3}
                                            px={4}
                                            mx={1}
                                            my={0.5}
                                            fontSize="sm"
                                            fontWeight="medium"
                                            h="auto"
                                            isLoading={duplicateLoading && duplicateId === funnel.id}
                                            loadingText="Duplicating..."
                                          >
                                            Duplicate Funnel
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            justifyContent="flex-start"
                                            leftIcon={<Box as={FiGlobe} size={16} />}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActionMenuOpen(false);
                                              setMenuFunnelId(null);
                                              handleShareFunnel(funnel);
                                            }}
                                            _hover={{
                                              bg: 'green.50',
                                              color: 'green.600',
                                              transform: 'translateX(2px)'
                                            }}
                                            transition="all 0.15s ease"
                                            borderRadius="4px"
                                            py={3}
                                            px={4}
                                            mx={1}
                                            my={0.5}
                                            fontSize="sm"
                                            fontWeight="medium"
                                            h="auto"
                                          >
                                            Share Funnel
                                          </Button>
                                          <Divider borderColor="gray.200" />
                                          <Button
                                            variant="ghost"
                                            justifyContent="flex-start"
                                            leftIcon={<Box as={FiTrash2} size={16} />}
                                            color="red.500"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActionMenuOpen(false);
                                              setMenuFunnelId(null);
                                              handleDeleteFunnel(funnel);
                                            }}
                                            _hover={{
                                              bg: 'red.50',
                                              color: 'red.600',
                                              transform: 'translateX(2px)'
                                            }}
                                            transition="all 0.15s ease"
                                            borderRadius="4px"
                                            py={3}
                                            px={4}
                                            mx={1}
                                            my={0.5}
                                            fontSize="sm"
                                            fontWeight="medium"
                                            h="auto"
                                          >
                                            Delete Funnel
                                          </Button>
                                        </VStack>
                                      </Box>
                                    </>,
                                    document.body
                                  )}
                                </Box>
                              </HStack>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py={24} px={8}>
                          <VStack spacing={5} align="center" maxW="480px" mx="auto">
                            {/* Minimal Icon */}
                            <Box
                              w="64px"
                              h="64px"
                              borderRadius="12px"
                              bg="gray.50"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="gray.400"
                              border="1px solid"
                              borderColor="gray.100"
                            >
                              <Box as={FiBarChart2} size="28px" />
                            </Box>
                            
                            {/* Clean Typography */}
                            <VStack spacing={2} align="center">
                              <Text 
                                fontSize="lg" 
                                fontWeight="600" 
                                color="gray.700"
                                letterSpacing="-0.02em"
                              >
                                {searchTerm ? 'No matching funnels' : 'No funnels yet'}
                              </Text>
                              <Text 
                                fontSize="sm" 
                                color="gray.500"
                                textAlign="center"
                                lineHeight="1.6"
                                maxW="360px"
                              >
                                {searchTerm 
                                  ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                                  : 'Start building your sales funnel to convert leads into customers and grow your business.'
                                }
                              </Text>
                            </VStack>
                            
                            {/* Minimal Action Button */}
                            {!searchTerm && (
                              <Button
                                size="md"
                                colorScheme="blue"
                                leftIcon={<AddIcon />}
                                onClick={() => handleOpenModal(false, null)}
                                borderRadius="8px"
                                fontWeight="500"
                                px={6}
                                _hover={{ 
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 4px 12px rgba(66, 153, 225, 0.2)'
                                }}
                                transition="all 0.2s"
                              >
                                Create Funnel
                              </Button>
                            )}
                          </VStack>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
              
              {/* Pagination Component */}
              {!loading && filteredFunnels.length > 0 && (
                <Box
                  mt={6}
                  bg="white"
                  p={6}
                  borderRadius="lg"
                  border="1px"
                  borderColor="gray.100"
                  boxShadow="sm"
                >
                  <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "stretch", md: "center" }}
                    gap={4}
                  >
                    {/* Items per page selector */}
                    <HStack spacing={3}>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        Show
                      </Text>
                      <Select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        size="sm"
                        width="auto"
                        bg="white"
                        borderColor="gray.300"
                        borderRadius="md"
                        _hover={{ borderColor: "blue.300" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </Select>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        entries
                      </Text>
                    </HStack>

                    {/* Pagination info */}
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      fontWeight="medium"
                      textAlign={{ base: "center", md: "left" }}
                    >
                      Showing {Math.min(itemsPerPage * (currentPage - 1) + 1, totalItems)} to{" "}
                      {Math.min(itemsPerPage * currentPage, totalItems)} of {totalItems} results
                    </Text>

                    {/* Pagination controls */}
                    <HStack spacing={2}>
                      <IconButton
                        icon={<ChevronDownIcon transform="rotate(90deg)" />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        aria-label="First page"
                        onClick={() => handlePageChange(1)}
                        isDisabled={currentPage === 1}
                        _hover={{ bg: "blue.50" }}
                        _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                      />
                      
                      <IconButton
                        icon={<ChevronDownIcon transform="rotate(90deg)" />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        aria-label="Previous page"
                        onClick={() => handlePageChange(currentPage - 1)}
                        isDisabled={currentPage === 1}
                        _hover={{ bg: "blue.50" }}
                        _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                      />

                      {/* Page numbers */}
                      <HStack spacing={1}>
                        {(() => {
                          const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
                          const pages = [];
                          const maxVisiblePages = 5;
                          let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                          let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                          
                          if (endPage - startPage < maxVisiblePages - 1) {
                            startPage = Math.max(1, endPage - maxVisiblePages + 1);
                          }

                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <Button
                                key={i}
                                size="sm"
                                variant={currentPage === i ? "solid" : "ghost"}
                                colorScheme="blue"
                                onClick={() => handlePageChange(i)}
                                minW="32px"
                                h="32px"
                                fontSize="sm"
                                fontWeight={currentPage === i ? "bold" : "medium"}
                                _hover={{ bg: currentPage === i ? "blue.600" : "blue.50" }}
                                _active={{ transform: "scale(0.95)" }}
                                transition="all 0.2s"
                              >
                                {i}
                              </Button>
                            );
                          }
                          return pages;
                        })()}
                      </HStack>

                      <IconButton
                        icon={<ChevronDownIcon transform="rotate(-90deg)" />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        aria-label="Next page"
                        onClick={() => handlePageChange(currentPage + 1)}
                        isDisabled={currentPage >= (Math.ceil(totalItems / itemsPerPage) || 1)}
                        _hover={{ bg: "blue.50" }}
                        _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                      />
                      
                      <IconButton
                        icon={<ChevronDownIcon transform="rotate(-90deg)" />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        aria-label="Last page"
                        onClick={() => handlePageChange(Math.ceil(totalItems / itemsPerPage) || 1)}
                        isDisabled={currentPage >= (Math.ceil(totalItems / itemsPerPage) || 1)}
                        _hover={{ bg: "blue.50" }}
                        _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                      />
                    </HStack>
                  </Flex>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Create/Edit Modal */}
          <Modal isOpen={isModalOpen} onClose={onModalClose} size="xl" isCentered>
            <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(2px)" />
            <ModalContent
              borderRadius="10px"
              boxShadow="xl"
              border="1px"
              borderColor="gray.150"
              bg="white"
            >
              <ModalHeader pb={1}>
                <VStack align="start" spacing={1}>
                  <Heading size="md" fontWeight="700" color={textColor}>
                    {isEditMode ? 'Edit Funnel' : 'Create New Funnel'}
                  </Heading>
                  <Text fontSize="sm" color="gray.500" fontWeight="500">
                    Set up the essentials for your funnel.
                  </Text>
                </VStack>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={3}>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel fontWeight="600" fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                      Funnel Name
                    </FormLabel>
                    <Input
                      size="sm"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter funnel name"
                      bg="gray.50"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-300)' }}
                      _hover={{ borderColor: 'gray.300' }}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="600" fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                      Description
                    </FormLabel>
                    <Textarea
                      size="sm"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your funnel"
                      rows={3}
                      bg="gray.50"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-300)' }}
                      _hover={{ borderColor: 'gray.300' }}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="600" fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                      Target Audience
                    </FormLabel>
                    <Select
                      size="sm"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      bg="gray.50"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-300)' }}
                      _hover={{ borderColor: 'gray.300' }}
                      transition="all 0.15s ease"
                    >
                      <option value="customer">Customer</option>
                      <option value="coach">Coach</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontWeight="600" fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                      Funnel URL
                    </FormLabel>
                    <VStack spacing={2} align="stretch">
                      <HStack spacing={2}>
                        <Input
                          size="sm"
                          value={formData.funnelUrl}
                          onChange={(e) => setFormData({ ...formData, funnelUrl: e.target.value })}
                          placeholder="funnel-url-name"
                          bg="gray.50"
                          border="1px"
                          borderColor="gray.200"
                          _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-300)' }}
                          _hover={{ borderColor: 'gray.300' }}
                        />
                        <IconButton
                          icon={<Box as={FiCopy} />}
                          aria-label="Copy URL"
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(formData.funnelUrl)}
                          isDisabled={!formData.funnelUrl}
                        />
                        <Button
                          size="sm"
                          variant="solid"
                          colorScheme="blue"
                          fontSize="sm"
                          onClick={() => setFormData({ ...formData, funnelUrl: generateFunnelUrl(formData.name) })}
                          isDisabled={!formData.name}
                        >
                          Generate
                        </Button>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        This will be your funnel's public URL. Leave empty to auto-generate or click Generate.
                      </Text>
                    </VStack>
                  </FormControl>
                  
                  {/* Index Page Selection - Only show when editing and stages exist */}
                  {isEditMode && selectedFunnel?.stages && selectedFunnel.stages.length > 0 && (
                    <FormControl>
                      <FormLabel>Index Page (Landing Page)</FormLabel>
                      <Select
                        size="sm"
                        value={formData.indexPageId}
                        onChange={(e) => setFormData({ ...formData, indexPageId: e.target.value })}
                        bg="gray.50"
                        border="1px"
                        borderColor="gray.200"
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-300)', transform: 'translateY(-1px)' }}
                        _hover={{ borderColor: 'gray.300', transform: 'translateY(-1px)' }}
                        transition="all 0.15s ease"
                        sx={{
                          '& option': {
                            transition: 'all 0.15s ease',
                            _hover: {
                              transform: 'translateX(2px)',
                              backgroundColor: 'blue.50'
                            }
                          }
                        }}
                      >
                        {selectedFunnel.stages
                          .filter(stage => stage.isEnabled !== false)
                          .map((stage) => (
                            <option key={stage.pageId || stage.id} value={stage.pageId || stage.id}>
                              {stage.name || stage.type || 'Unnamed Page'} {stage.pageId ? `(${stage.pageId})` : ''}
                            </option>
                          ))}
                      </Select>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Select which page should be shown when someone visits your funnel URL directly.
                      </Text>
                    </FormControl>
                  )}
                </VStack>
              </ModalBody>
              <ModalFooter>
                <HStack w="100%" justify="flex-end" spacing={3}>
                  <Button variant="ghost" size="sm" onClick={onModalClose}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    fontSize="sm"
                    fontWeight="600"
                    bg="blue.500"
                    color="white"
                    onClick={handleCreateOrUpdateFunnel}
                    isLoading={actionLoading}
                    loadingText={isEditMode ? 'Updating...' : 'Creating...'}
                    _hover={{ bg: 'blue.600' }}
                    _active={{ bg: 'blue.700' }}
                  >
                    {isEditMode ? 'Update Funnel' : 'Create Funnel'}
                  </Button>
                </HStack>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} isCentered>
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
            <ModalContent borderRadius="2xl">
              <ModalHeader>Delete Funnel</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Box 
                  bg="orange.50" 
                  border="1px" 
                  borderColor="orange.200" 
                  borderRadius="lg" 
                  p={4}
                >
                  <HStack spacing={3}>
                    <Box color="orange.500" fontSize="xl">⚠️</Box>
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="bold" color="orange.800">
                        Are you sure?
                      </Text>
                      <Text color="orange.700" fontSize="sm">
                        This action cannot be undone. This will permanently delete the funnel "{selectedFunnel?.name}".
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onDeleteModalClose}>
                  Cancel
                </Button>
                <Button 
                  bg="red.600" 
                  color="white" 
                  onClick={confirmDeleteFunnel}
                  isLoading={actionLoading}
                  loadingText="Deleting..."
                  _hover={{ bg: 'red.700' }}
                  _active={{ bg: 'red.800' }}
                >
                  Delete Funnel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* View Funnel Modal */}
          <Modal isOpen={isViewModalOpen} onClose={onViewModalClose} size="xl">
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
            <ModalContent borderRadius="2xl">
              <ModalHeader>
                <HStack spacing={3}>
                  <Box as={FiEye} color="blue.500" />
                  <Text>View Funnel: {selectedFunnel?.name}</Text>
                </HStack>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {selectedFunnel && (
                  <VStack spacing={6} align="stretch">
                    {/* Funnel Overview */}
                    <Box>
                      <Heading size="md" color="gray.800" mb={3}>Funnel Overview</Heading>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="semibold" color="gray.700">Name:</Text>
                          <Text color="gray.600">{selectedFunnel.name}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold" color="gray.700">Description:</Text>
                          <Text color="gray.600" maxW="300px">
                            {selectedFunnel.description || 'No description provided'}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold" color="gray.700">Target Audience:</Text>
                          <Badge colorScheme="blue" variant="subtle">
                            {selectedFunnel.targetAudience || 'General'}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold" color="gray.700">Status:</Text>
                          <StatusBadge status={selectedFunnel.status} isActive={selectedFunnel.isActive} />
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold" color="gray.700">Type:</Text>
                          <Badge colorScheme="purple" variant="solid">
                            {selectedFunnel.funnelType || 'VSL'}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold" color="gray.700">Created:</Text>
                          <Text color="gray.600">
                            {new Date(selectedFunnel.createdAt).toLocaleDateString()}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="semibold" color="gray.700">Funnel URL:</Text>
                          <HStack spacing={2}>
                            <Text color="blue.600" fontFamily="mono" fontSize="sm">
                              {selectedFunnel.funnelUrl || 'Not set'}
                            </Text>
                            {selectedFunnel.funnelUrl && (
                              <Button
                                size="xs"
                                variant="ghost"
                                leftIcon={<Box as={FiCopy} size={12} />}
                                onClick={() => copyToClipboard(selectedFunnel.funnelUrl)}
                                colorScheme="blue"
                              >
                                Copy
                              </Button>
                            )}
                          </HStack>
                        </HStack>
                      </VStack>
                    </Box>

                    {/* Stages Information */}
                    <Box>
                      <Heading size="md" color="gray.800" mb={3}>Stages ({selectedFunnel.stageCount || 0})</Heading>
                      {selectedFunnel.stages && selectedFunnel.stages.length > 0 ? (
                        <VStack spacing={3} align="stretch">
                          {selectedFunnel.stages.map((stage, index) => (
                            <Box 
                              key={index}
                              p={4}
                              bg="gray.50"
                              borderRadius="lg"
                              border="1px"
                              borderColor="gray.200"
                            >
                              <HStack justify="space-between" mb={2}>
                                <Text fontWeight="semibold" color="gray.700">
                                  {index + 1}. {stage.name || `Stage ${index + 1}`}
                                </Text>
                                <Badge 
                                  colorScheme={stage.isEnabled ? "green" : "gray"} 
                                  variant="subtle"
                                >
                                  {stage.isEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                              </HStack>
                              {/* <Text color="gray.600" fontSize="sm">
                                Type: {stage.type || 'Unknown'}
                              </Text> */}
                              {stage.basicInfo?.title && (
                                <Text color="gray.600" fontSize="sm">
                                  Title: {stage.basicInfo.title}
                                </Text>
                              )}
                            </Box>
                          ))}
                        </VStack>
                      ) : (
                        <Box p={4} bg="yellow.50" borderRadius="lg" border="1px" borderColor="yellow.200">
                          <Text color="yellow.800" textAlign="center">
                            No stages configured for this funnel
                          </Text>
                        </Box>
                      )}
                    </Box>

                    {/* Actions */}
                    <Box>
                      <Heading size="md" color="gray.800" mb={3}>Quick Actions</Heading>
                      <HStack spacing={3} wrap="wrap">
                        <Button
                          leftIcon={<Box as={FiEdit} />}
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => {
                            onViewModalClose();
                            handleOpenModal(true, selectedFunnel);
                          }}
                        >
                          Edit Funnel
                        </Button>
                        <Button
                          leftIcon={<Box as={FiCopy} />}
                          colorScheme="green"
                          variant="outline"
                          onClick={() => {
                            onViewModalClose();
                            handleDuplicateFunnel(selectedFunnel.id);
                          }}
                        >
                          Duplicate Funnel
                        </Button>
                        {selectedFunnel.funnelUrl && (
                          <Button
                            leftIcon={<Box as={FiGlobe} />}
                            colorScheme="purple"
                            variant="outline"
                            onClick={() => {
                              const url = getFunnelUrl(selectedFunnel);
                              if (url) {
                                window.open(url, '_blank');
                                onViewModalClose();
                              }
                            }}
                          >
                            Open Public URL
                          </Button>
                        )}
                      </HStack>
                    </Box>
                  </VStack>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onClick={onViewModalClose}>
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Analytics Modal - Compact, Centered */}
          <Modal 
            isOpen={isAnalyticsModalOpen} 
            onClose={onAnalyticsModalClose} 
            isCentered={true}
            size="xl"
            scrollBehavior="inside"
          >
            <ModalOverlay 
              bg="blackAlpha.800" 
              backdropFilter="blur(2px)"
              onClick={onAnalyticsModalClose}
            />
            <ModalContent 
              maxW="550px"
              maxH="85vh"
              w="90%"
              bg={useColorModeValue('white', 'gray.800')}
              borderRadius="xl"
              boxShadow="2xl"
              border="1px"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              m={0}
            >
              <ModalHeader 
                display="flex" 
                alignItems="center" 
                justifyContent="space-between"
                borderBottom="1px"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                pb={3}
                pt={4}
                px={5}
              >
                <HStack spacing={2}>
                  <Box as={FiBarChart2} size={5} color="purple.500" />
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('gray.800', 'gray.100')}>
                      Analytics
                    </Text>
                    {selectedFunnelForAnalytics && (
                      <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} fontWeight="normal" noOfLines={1}>
                        {selectedFunnelForAnalytics.name}
                      </Text>
                    )}
                  </Box>
                </HStack>
                <ModalCloseButton size="sm" />
              </ModalHeader>
              <ModalBody p={4} overflowY="auto" maxH="calc(85vh - 80px)">
                {selectedFunnelForAnalytics && (
                  <FunnelAnalytics funnelId={selectedFunnelForAnalytics.id} isCompact={true} />
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        </VStack>
      </Box>
    </Box>
  );
}

export default FunnelManagementComponent;

