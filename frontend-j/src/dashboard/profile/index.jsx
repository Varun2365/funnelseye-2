import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCoachId, getToken, debugAuthState } from '../../utils/authUtils';
import { API_BASE_URL } from '../../config/apiConfig';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Button,
  Avatar,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
  Select,
  Switch,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Image,
  SimpleGrid,
  IconButton,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tag,
  TagLabel,
  TagCloseButton,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Center
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaGlobe,
  FaCalendarAlt,
  FaClock,
  FaStar,
  FaTrophy,
  FaCertificate,
  FaImage,
  FaVideo,
  FaFileAlt,
  FaPlus,
  FaTrash,
  FaEye,
  FaDownload,
  FaShare,
  FaHeart,
  FaComment,
  FaShareAlt,
  FaBookmark,
  FaEllipsisH,
  FaCheck,
  FaExclamationTriangle,
  FaInfoCircle,
  FaWhatsapp,
  FaCreditCard
} from 'react-icons/fa';
import {
  FiCreditCard,
  FiCalendar,
  FiTrendingUp,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiInfo,
  FiDownload,
  FiFileText,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiBarChart,
  FiZap,
  FiShield,
  FiGlobe,
  FiMail,
  FiPhone,
  FiMapPin,
  FiPrinter,
  FiCheckCircle,
  FiImage,
  FiCopy,
} from 'react-icons/fi';
import { subscriptionAPI } from '../../services/subscriptionAPI';
import {
  IoLocationOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoStatsChartOutline,
  IoPeopleOutline,
  IoRocketOutline
} from 'react-icons/io5';

const MotionBox = motion(Box);

const Profile = () => {
  const navigate = useNavigate();
  const authState = useSelector(state => state.auth);
  const user = authState?.user;
  const token = getToken(authState);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // Portfolio is now default (index 0 after removing Overview)
  const [editData, setEditData] = useState({});
  const [whatsappConfig, setWhatsappConfig] = useState({});
  const [creditsToAdd, setCreditsToAdd] = useState('');
  
  // Sponsor change state
  const [sponsorChangeData, setSponsorChangeData] = useState({
    newSponsorId: '',
    reason: ''
  });
  const [sponsorChangeLoading, setSponsorChangeLoading] = useState(false);
  const { isOpen: isSponsorChangeOpen, onOpen: onSponsorChangeOpen, onClose: onSponsorChangeClose } = useDisclosure();
  const [sponsorSearchResults, setSponsorSearchResults] = useState([]);
  const [sponsorSearchLoading, setSponsorSearchLoading] = useState(false);
  const [sponsorDetails, setSponsorDetails] = useState(null);
  
  // Subscription state
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const { isOpen: isUpgradeOpen, onOpen: onUpgradeOpen, onClose: onUpgradeClose } = useDisclosure();
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  const { isOpen: isRenewOpen, onOpen: onRenewOpen, onClose: onRenewClose } = useDisclosure();
  const [cancellationReason, setCancellationReason] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');

  // Initialize edit data
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        city: user.city || '',
        country: user.country || '',
        company: user.company || '',
        phone: user.phone || '',
        experienceYears: user.portfolio?.experienceYears || 0,
        totalProjectsCompleted: user.portfolio?.totalProjectsCompleted || 0,
        specializations: user.portfolio?.specializations || [],
        appointmentHeadline: user.appointmentSettings?.appointmentHeadline || 'Schedule a Call With Us',
        slotDuration: user.appointmentSettings?.slotDuration || 30,
        timeZone: user.appointmentSettings?.timeZone || 'UTC+05:30',
        availableDays: user.appointmentSettings?.availableDays || [],
        blockedDates: user.appointmentSettings?.blockedDates || []
      });

      setWhatsappConfig({
        phoneNumber: user.whatsappConfig?.phoneNumber || '',
        welcomeMessage: user.whatsappConfig?.welcomeMessage || '',
        isActive: user.whatsappConfig?.isActive || false
      });
    }
  }, [user]);

  // Load subscription data
  useEffect(() => {
    if (activeTab === 2) { // Subscription tab index (Portfolio=0, Lead Magnets=1, Subscription=2, Settings=3)
      loadSubscriptionData();
    }
  }, [activeTab]);

  // Load sponsor details
  useEffect(() => {
    if (user?.sponsorId) {
      loadSponsorDetails();
    }
  }, [user]);

  const loadSponsorDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/coach-hierarchy/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSponsorDetails(data.data);
      }
    } catch (error) {
      console.error('Error loading sponsor details:', error);
    }
  };

  const loadSubscriptionData = async () => {
    try {
      setSubscriptionLoading(true);
      const results = await Promise.allSettled([
        subscriptionAPI.getMySubscription(),
        subscriptionAPI.getSubscriptionHistory({ limit: 50 })
      ]);
      
      if (results[0].status === 'fulfilled' && results[0].value.data) {
        setSubscription(results[0].value.data);
      } else {
        setSubscription(null);
      }
      
      if (results[1].status === 'fulfilled') {
        setPaymentHistory(results[1].value.data || []);
      } else {
        setPaymentHistory([]);
      }
    } catch (err) {
      console.error('Error loading subscription data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load subscription data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = (text, label) => {
    if (!text || text === 'Not specified') return;
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied!',
        description: `${label || 'Text'} copied to clipboard`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }).catch(() => {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    });
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'cancelled': return 'red';
      case 'expired': return 'orange';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  // Calculate usage percentage
  const getUsagePercentage = (current, max) => {
    if (max === 0 || max === -1) return 0;
    return Math.min((current / max) * 100, 100);
  };

  // Handle subscription actions
  const handleUpgrade = () => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = `${API_BASE_URL}/subscription-plans?token=${encodeURIComponent(token)}`;
    } else {
      window.location.href = `${API_BASE_URL}/subscription-plans`;
    }
  };

  const handleRenew = () => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = `${API_BASE_URL}/subscription-plans?token=${encodeURIComponent(token)}`;
    } else {
      window.location.href = `${API_BASE_URL}/subscription-plans`;
    }
  };

  const handleCancel = async () => {
    try {
      await subscriptionAPI.cancelSubscription({ reason: cancellationReason });
      toast({
        title: 'Subscription cancelled',
        description: 'Your subscription has been cancelled successfully.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      onCancelClose();
      loadSubscriptionData();
    } catch (err) {
      toast({
        title: 'Cancellation failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // API Functions
  const fetchCoachProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/coach-profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update user data in Redux store if needed
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch profile data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/coach-profile/${user._id}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWhatsappConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/coach-profile/${user._id}/whatsapp-config`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(whatsappConfig)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'WhatsApp configuration updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to update WhatsApp config');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update WhatsApp configuration',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const addCredits = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/coach-profile/add-credits/${user._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credits: parseInt(creditsToAdd) })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Credits added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setCreditsToAdd('');
        onClose();
      } else {
        throw new Error('Failed to add credits');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add credits',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Sponsor change functions
  const handleSponsorChange = async () => {
    if (!sponsorChangeData.newSponsorId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a sponsor ID',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSponsorChangeLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/coach-hierarchy/update-downline-sponsor/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Coach-Id': user._id
        },
        body: JSON.stringify({
          sponsorId: sponsorChangeData.newSponsorId,
          reason: sponsorChangeData.reason || 'Sponsor change requested by user'
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Request Submitted',
          description: 'Your sponsor change request has been submitted for admin approval',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setSponsorChangeData({ newSponsorId: '', reason: '' });
        onSponsorChangeClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit sponsor change request');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSponsorChangeLoading(false);
    }
  };

  const handleSponsorInputChange = (field, value) => {
    setSponsorChangeData(prev => ({
      ...prev,
      [field]: value
    }));

    // Search for sponsors when typing in the sponsor ID field
    if (field === 'newSponsorId' && value.trim().length >= 2) {
      searchSponsors(value);
    } else if (field === 'newSponsorId' && value.trim().length < 2) {
      setSponsorSearchResults([]);
    }
  };

  const searchSponsors = async (query) => {
    try {
      setSponsorSearchLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/coach-hierarchy/search-sponsor?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSponsorSearchResults(data.data.digitalSponsors || []);
      }
    } catch (error) {
      console.error('Error searching sponsors:', error);
    } finally {
      setSponsorSearchLoading(false);
    }
  };

  const selectSponsor = (sponsor) => {
    setSponsorChangeData(prev => ({
      ...prev,
      newSponsorId: sponsor.selfCoachId
    }));
    setSponsorSearchResults([]);
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWhatsappChange = (field, value) => {
    setWhatsappConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle specializations
  const addSpecialization = () => {
    setEditData(prev => ({
      ...prev,
      specializations: [...prev.specializations, '']
    }));
  };

  const removeSpecialization = (index) => {
    const newSpecs = editData.specializations.filter((_, i) => i !== index);
    setEditData(prev => ({
      ...prev,
      specializations: newSpecs
    }));
  };

  const updateSpecialization = (index, value) => {
    const newSpecs = [...editData.specializations];
    newSpecs[index] = value;
    setEditData(prev => ({
      ...prev,
      specializations: newSpecs
    }));
  };

  if (!user) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text fontSize="lg" color={mutedTextColor}>Loading profile...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} w="100%" 
      css={{
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          background: useColorModeValue('rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.2)'),
          borderRadius: '10px',
          transition: 'background 0.2s',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: useColorModeValue('rgba(0, 0, 0, 0.3)', 'rgba(255, 255, 255, 0.3)'),
        },
        scrollbarWidth: 'thin',
        scrollbarColor: `${useColorModeValue('rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.2)')} transparent`,
      }}
    >
      {/* Profile Header - Redesigned with Banner and Overview Content */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box position="relative" w="100%">
          {/* Banner Background Image */}
          <Box
            h="160px"
            w="100%"
            bgImage={user.portfolio?.bannerImage || 'url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80)'}
            bgSize="cover"
            bgPosition="center"
            bgRepeat="no-repeat"
            position="relative"
            _after={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bg: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.4))',
            }}
          />

          {/* Profile Content - No Container */}
          <Box px={6} position="relative" mt="-60px" zIndex={1}>
            <Box maxW="6xl" mx="auto">
              {/* Profile Header Section - Compact 2 Column Layout */}
              <Box
                pt={16}
                pb={5}
                px={8}
                mb={8}
                bg={cardBg}
                borderRadius="10px"
                border="1px solid"
                borderColor={borderColor}
                boxShadow="0 8px 24px rgba(0, 0, 0, 0.12)"
              >
                  <Grid templateColumns={{ base: "1fr", lg: "300px 1px 1fr" }} gap={6} alignItems="start">
                  {/* Left Section - Avatar & Stats (Horizontal) */}
                  <VStack spacing={3} align={{ base: 'center', lg: 'start' }} w="100%">
                    {/* Avatar Section */}
                    <Box position="relative">
                      <Avatar
                        size="xl"
                        src={user.portfolio?.profileImages?.[0]}
                        name={user.name}
                        border="4px solid"
                        borderColor={cardBg}
                        boxShadow="0 4px 16px rgba(0, 0, 0, 0.2)"
                        w="100px"
                        h="100px"
                      />
                      {isEditing && (
                        <IconButton
                          icon={<FaEdit />}
                          size="xs"
                          colorScheme="blue"
                          rounded="full"
                          position="absolute"
                          bottom={0}
                          right={0}
                          boxShadow="lg"
                          _hover={{ transform: 'scale(1.1)' }}
                          transition="all 0.2s"
                          border="2px solid"
                          borderColor={cardBg}
                        />
                      )}
                    </Box>

                    {/* Stats - Horizontal Compact Layout */}
                    <HStack spacing={4} align="center" flexWrap="wrap" justify={{ base: 'center', lg: 'flex-start' }}>
                      <VStack spacing={0} align={{ base: 'center', lg: 'start' }}>
                        <Text 
                          fontSize="2xl" 
                          fontWeight="700" 
                          color="blue.500"
                          lineHeight="1"
                        >
                          {user.portfolio?.totalProjectsCompleted || 0}
                        </Text>
                        <Text 
                          fontSize="2xs" 
                          color={mutedTextColor}
                          fontWeight="500"
                          textTransform="uppercase"
                          letterSpacing="0.5px"
                          mt={0.5}
                        >
                          Projects
                        </Text>
                      </VStack>
                      <VStack spacing={0} align={{ base: 'center', lg: 'start' }}>
                        <Text 
                          fontSize="2xl" 
                          fontWeight="700" 
                          color="green.500"
                          lineHeight="1"
                        >
                          {user.portfolio?.experienceYears || 0}
                        </Text>
                        <Text 
                          fontSize="2xs" 
                          color={mutedTextColor}
                          fontWeight="500"
                          textTransform="uppercase"
                          letterSpacing="0.5px"
                          mt={0.5}
                        >
                          Years
                        </Text>
                      </VStack>
                      <VStack spacing={0} align={{ base: 'center', lg: 'start' }}>
                        <Text 
                          fontSize="2xl" 
                          fontWeight="700" 
                          color="purple.500"
                          lineHeight="1"
                        >
                          {user.credits || 0}
                        </Text>
                        <Text 
                          fontSize="2xs" 
                          color={mutedTextColor}
                          fontWeight="500"
                          textTransform="uppercase"
                          letterSpacing="0.5px"
                          mt={0.5}
                        >
                          Credits
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>

                  {/* Vertical Divider 1 */}
                  <Divider 
                    orientation="vertical" 
                    borderColor={borderColor}
                    display={{ base: 'none', lg: 'block' }}
                    h="100%"
                  />

                  {/* Middle Section - Profile Info & Contact (Compact) */}
                  <VStack 
                    align={{ base: 'center', lg: 'start' }} 
                    spacing={3}
                    w="100%"
                    px={{ base: 0, lg: 4 }}
                  >
                    {/* Name, Verified Badge, and Role - Inline */}
                    <VStack align={{ base: 'center', lg: 'start' }} spacing={1.5} w="100%">
                      <HStack spacing={2} align="center" flexWrap="wrap" justify={{ base: 'center', lg: 'flex-start' }}>
                        <Heading 
                          size="lg" 
                          color={textColor}
                          fontWeight="700"
                          fontSize={{ base: 'xl', md: '2xl' }}
                        >
                          {user.name}
                        </Heading>
                        {user.isVerified && (
                          <Box
                            as={FiCheckCircle}
                            color="green.500"
                            boxSize={5}
                            title="Verified Account"
                          />
                        )}
                        <Badge 
                          colorScheme="blue" 
                          fontSize="2xs"
                          fontWeight="600"
                          px={2} 
                          py={0.5}
                          borderRadius="6px"
                          textTransform="none"
                          letterSpacing="0.3px"
                          bg="blue.50"
                          color="blue.700"
                          border="1px solid"
                          borderColor="blue.200"
                          _dark={{
                            bg: "blue.900",
                            color: "blue.100",
                            borderColor: "blue.700"
                          }}
                        >
                          {user.role === 'coach' ? 'Fitness Coach' : 'User'}
                        </Badge>
                        <Badge 
                          colorScheme={user.isActive ? 'green' : 'red'}
                          fontSize="2xs"
                          fontWeight="600"
                          px={2} 
                          py={0.5}
                          borderRadius="6px"
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </HStack>
                    </VStack>

                    {/* Bio - Compact */}
                    {user.bio && (
                      <Text 
                        color={mutedTextColor} 
                        textAlign={{ base: 'center', lg: 'left' }}
                        fontSize="xs"
                        lineHeight="1.5"
                        w="100%"
                        noOfLines={2}
                      >
                        {user.bio}
                      </Text>
                    )}

                    {/* Contact Information - Values with Copy Buttons */}
                    <VStack spacing={2.5} align="stretch" w="100%" mt={1}>
                      {user.email && (
                        <HStack spacing={2} align="center" justify="space-between">
                          <HStack spacing={2} align="center" flex={1}>
                            <Box as={FiMail} color={mutedTextColor} boxSize={4} flexShrink={0} />
                            <Text color={textColor} fontSize="sm" fontWeight="500" noOfLines={1} flex={1}>
                              {user.email}
                            </Text>
                          </HStack>
                          <IconButton
                            icon={<FiCopy />}
                            size="xs"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => copyToClipboard(user.email, 'Email')}
                            aria-label="Copy email"
                            borderRadius="7px"
                          />
                        </HStack>
                      )}

                      {user.phone && (
                        <HStack spacing={2} align="center" justify="space-between">
                          {isEditing ? (
                            <Input
                              value={editData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="Enter phone"
                              size="sm"
                              fontSize="sm"
                              borderRadius="7px"
                              flex={1}
                            />
                          ) : (
                            <>
                              <HStack spacing={2} align="center" flex={1}>
                                <Box as={FiPhone} color={mutedTextColor} boxSize={4} flexShrink={0} />
                                <Text color={textColor} fontSize="sm" fontWeight="500" noOfLines={1} flex={1}>
                                  {user.phone}
                                </Text>
                              </HStack>
                              <IconButton
                                icon={<FiCopy />}
                                size="xs"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => copyToClipboard(user.phone, 'Phone')}
                                aria-label="Copy phone"
                                borderRadius="7px"
                              />
                            </>
                          )}
                        </HStack>
                      )}

                      {([user.city, user.country].filter(Boolean).length > 0) && (
                        <HStack spacing={2} align="center" justify="space-between">
                          {isEditing ? (
                            <HStack spacing={2} w="100%">
                              <Input
                                value={editData.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                placeholder="City"
                                size="sm"
                                fontSize="sm"
                                borderRadius="7px"
                                flex={1}
                              />
                              <Input
                                value={editData.country}
                                onChange={(e) => handleInputChange('country', e.target.value)}
                                placeholder="Country"
                                size="sm"
                                fontSize="sm"
                                borderRadius="7px"
                                flex={1}
                              />
                            </HStack>
                          ) : (
                            <>
                              <HStack spacing={2} align="center" flex={1}>
                                <Box as={FiMapPin} color={mutedTextColor} boxSize={4} flexShrink={0} />
                                <Text color={textColor} fontSize="sm" fontWeight="500" noOfLines={1} flex={1}>
                                  {[user.city, user.country].filter(Boolean).join(', ')}
                                </Text>
                              </HStack>
                              <IconButton
                                icon={<FiCopy />}
                                size="xs"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => copyToClipboard([user.city, user.country].filter(Boolean).join(', '), 'Location')}
                                aria-label="Copy location"
                                borderRadius="7px"
                              />
                            </>
                          )}
                        </HStack>
                      )}

                      {user.company && (
                        <HStack spacing={2} align="center" justify="space-between">
                          {isEditing ? (
                            <Input
                              value={editData.company}
                              onChange={(e) => handleInputChange('company', e.target.value)}
                              placeholder="Enter company"
                              size="sm"
                              fontSize="sm"
                              borderRadius="7px"
                              flex={1}
                            />
                          ) : (
                            <>
                              <HStack spacing={2} align="center" flex={1}>
                                <Box as={FiGlobe} color={mutedTextColor} boxSize={4} flexShrink={0} />
                                <Text color={textColor} fontSize="sm" fontWeight="500" noOfLines={1} flex={1}>
                                  {user.company}
                                </Text>
                              </HStack>
                              <IconButton
                                icon={<FiCopy />}
                                size="xs"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => copyToClipboard(user.company, 'Company')}
                                aria-label="Copy company"
                                borderRadius="7px"
                              />
                            </>
                          )}
                        </HStack>
                      )}
                    </VStack>
                  </VStack>

                  {/* Right Section - Experience Only */}
                  <VStack 
                    align={{ base: 'center', lg: 'start' }} 
                    spacing={3}
                    w="100%"
                    px={{ base: 0, lg: 4 }}
                  >
                    {/* Experience - Value with Copy Button */}
                    <HStack spacing={2} align="center" justify="space-between" w="100%">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editData.experienceYears}
                          onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value))}
                          placeholder="Years"
                          size="sm"
                          fontSize="sm"
                          borderRadius="7px"
                          w="120px"
                        />
                      ) : (
                        <>
                          <HStack spacing={2} align="center" flex={1}>
                            <Box as={FiTrendingUp} color={mutedTextColor} boxSize={4} flexShrink={0} />
                            <Text color={textColor} fontSize="sm" fontWeight="500">
                              {user.portfolio?.experienceYears || 0} years
                            </Text>
                          </HStack>
                          <IconButton
                            icon={<FiCopy />}
                            size="xs"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => copyToClipboard(`${user.portfolio?.experienceYears || 0} years`, 'Experience')}
                            aria-label="Copy experience"
                            borderRadius="7px"
                          />
                        </>
                      )}
                    </HStack>
                  </VStack>
                  </Grid>
              </Box>
            </Box>
          </Box>
        </Box>
      </MotionBox>

      {/* Content Container */}
      <Box px={6} pb={6}>
        <Box maxW="7xl" mx="auto">

          {/* Navigation Tabs */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs index={activeTab} onChange={setActiveTab} variant="line" colorScheme="blue">
            <TabList mb={6} overflowX="auto" borderBottom="2px solid" borderColor={borderColor}>
              <Tab 
                _selected={{ color: 'blue.600', borderBottom: '2px solid', borderColor: 'blue.600' }}
                fontWeight="500"
                fontSize="sm"
                px={6}
                py={3}
              >
                <HStack spacing={2}>
                  <FaTrophy />
                  <Text>Portfolio</Text>
                </HStack>
              </Tab>
              <Tab 
                _selected={{ color: 'blue.600', borderBottom: '2px solid', borderColor: 'blue.600' }}
                fontWeight="500"
                fontSize="sm"
                px={6}
                py={3}
              >
                <HStack spacing={2}>
                  <IoRocketOutline />
                  <Text>Lead Magnets</Text>
                </HStack>
              </Tab>
              <Tab 
                _selected={{ color: 'blue.600', borderBottom: '2px solid', borderColor: 'blue.600' }}
                fontWeight="500"
                fontSize="sm"
                px={6}
                py={3}
              >
                <HStack spacing={2}>
                  <FaCreditCard />
                  <Text>Subscription</Text>
                </HStack>
              </Tab>
              <Tab 
                _selected={{ color: 'blue.600', borderBottom: '2px solid', borderColor: 'blue.600' }}
                fontWeight="500"
                fontSize="sm"
                px={6}
                py={3}
              >
                <HStack spacing={2}>
                  <FaEdit />
                  <Text>Settings</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Portfolio Tab - Now Default */}
              <TabPanel px={0}>
                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                  {/* Profile Images */}
                  <Card bg={cardBg} shadow="md">
                    <CardHeader>
                      <Flex justify="space-between" align="center">
                        <Heading size="md" color={textColor}>Profile Images</Heading>
                        {isEditing && (
                          <IconButton icon={<FaPlus />} size="sm" colorScheme="blue" />
                        )}
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      {user.portfolio?.profileImages?.length > 0 ? (
                        <SimpleGrid columns={3} spacing={4}>
                          {user.portfolio.profileImages.map((image, index) => (
                            <Box key={index} position="relative">
                              <Image
                                src={image}
                                alt={`Profile ${index + 1}`}
                                rounded="md"
                                objectFit="cover"
                                h="100px"
                                w="100%"
                              />
                              {isEditing && (
                                <HStack position="absolute" top={1} right={1} spacing={1}>
                                  <IconButton icon={<FaEye />} size="xs" colorScheme="blue" />
                                  <IconButton icon={<FaTrash />} size="xs" colorScheme="red" />
                                </HStack>
                              )}
                            </Box>
                          ))}
                        </SimpleGrid>
                      ) : (
                        <VStack spacing={4} py={8} color={mutedTextColor}>
                          <FaImage size={40} />
                          <Text>No profile images uploaded yet</Text>
                          {isEditing && (
                            <Button leftIcon={<FaPlus />} size="sm" colorScheme="blue">
                              Upload Image
                            </Button>
                          )}
                        </VStack>
                      )}
                    </CardBody>
                  </Card>

                  {/* Gallery */}
                  <Card bg={cardBg} shadow="md">
                    <CardHeader>
                      <Flex justify="space-between" align="center">
                        <Heading size="md" color={textColor}>Gallery</Heading>
                        {isEditing && (
                          <IconButton icon={<FaPlus />} size="sm" colorScheme="blue" />
                        )}
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      {user.portfolio?.gallery?.length > 0 ? (
                        <SimpleGrid columns={3} spacing={4}>
                          {user.portfolio.gallery.map((image, index) => (
                            <Box key={index} position="relative">
                              <Image
                                src={image}
                                alt={`Gallery ${index + 1}`}
                                rounded="md"
                                objectFit="cover"
                                h="100px"
                                w="100%"
                              />
                              {isEditing && (
                                <HStack position="absolute" top={1} right={1} spacing={1}>
                                  <IconButton icon={<FaEye />} size="xs" colorScheme="blue" />
                                  <IconButton icon={<FaTrash />} size="xs" colorScheme="red" />
                                </HStack>
                              )}
                            </Box>
                          ))}
                        </SimpleGrid>
                      ) : (
                        <VStack spacing={4} py={8} color={mutedTextColor}>
                          <FaImage size={40} />
                          <Text>No gallery images uploaded yet</Text>
                          {isEditing && (
                            <Button leftIcon={<FaPlus />} size="sm" colorScheme="blue">
                              Upload Image
                            </Button>
                          )}
                        </VStack>
                      )}
                    </CardBody>
                  </Card>

                  {/* Certifications */}
                  <Card bg={cardBg} shadow="md">
                    <CardHeader>
                      <Flex justify="space-between" align="center">
                        <Heading size="md" color={textColor}>Certifications</Heading>
                        {isEditing && (
                          <IconButton icon={<FaPlus />} size="sm" colorScheme="blue" />
                        )}
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      {user.portfolio?.certificationIcons?.length > 0 ? (
                        <VStack spacing={3}>
                          {user.portfolio.certificationIcons.map((cert, index) => (
                            <HStack key={index} w="100%" p={3} bg={useColorModeValue('gray.50', 'gray.700')} rounded="md">
                              <FaCertificate color="orange" />
                              <VStack align="start" spacing={0} flex={1}>
                                <Text fontWeight="medium">{cert.name || `Certification ${index + 1}`}</Text>
                                <Text fontSize="sm" color={mutedTextColor}>{cert.issuer || 'Issuing Organization'}</Text>
                              </VStack>
                            </HStack>
                          ))}
                        </VStack>
                      ) : (
                        <VStack spacing={4} py={8} color={mutedTextColor}>
                          <FaCertificate size={40} />
                          <Text>No certifications added yet</Text>
                          {isEditing && (
                            <Button leftIcon={<FaPlus />} size="sm" colorScheme="blue">
                              Add Certification
                            </Button>
                          )}
                        </VStack>
                      )}
                    </CardBody>
                  </Card>

                  {/* Testimonials */}
                  <Card bg={cardBg} shadow="md">
                    <CardHeader>
                      <Flex justify="space-between" align="center">
                        <Heading size="md" color={textColor}>Testimonials</Heading>
                        {isEditing && (
                          <IconButton icon={<FaPlus />} size="sm" colorScheme="blue" />
                        )}
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      {user.portfolio?.testimonials?.length > 0 ? (
                        <VStack spacing={4}>
                          {user.portfolio.testimonials.map((testimonial, index) => (
                            <Card key={index} w="100%" size="sm">
                              <CardBody>
                                <Text fontSize="sm" fontStyle="italic" mb={2}>
                                  "{testimonial.content || 'Great work and dedication!'}"
                                </Text>
                                <Text fontSize="sm" fontWeight="medium" color="blue.500">
                                  - {testimonial.author || 'Client'}
                                </Text>
                                <Text fontSize="xs" color={mutedTextColor}>
                                  {testimonial.title || 'Satisfied Customer'}
                                </Text>
                              </CardBody>
                            </Card>
                          ))}
                        </VStack>
                      ) : (
                        <VStack spacing={4} py={8} color={mutedTextColor}>
                          <FaComment size={40} />
                          <Text>No testimonials added yet</Text>
                          {isEditing && (
                            <Button leftIcon={<FaPlus />} size="sm" colorScheme="blue">
                              Add Testimonial
                            </Button>
                          )}
                        </VStack>
                      )}
                    </CardBody>
                  </Card>
                </Grid>
              </TabPanel>

              {/* Lead Magnets Tab - Redesigned */}
              <TabPanel px={0}>
                <VStack spacing={8} align="stretch">
                  {/* Empty State */}
                  {(!user.leadMagnets || Object.keys(user.leadMagnets).length === 0) && (
                    <Center py={20}>
                      <VStack spacing={6} maxW="400px" textAlign="center">
                        <Box
                          p={6}
                          borderRadius="full"
                          bg="gray.100"
                          _dark={{ bg: "gray.700" }}
                        >
                          <Icon as={FaFileAlt} boxSize={8} color="gray.400" />
                        </Box>
                        <VStack spacing={2}>
                          <Text fontSize="xl" fontWeight="600" color={textColor}>
                            No Lead Magnets Yet
                          </Text>
                          <Text fontSize="sm" color={mutedTextColor} lineHeight="1.6">
                            Create engaging lead magnets to capture and nurture your audience.
                          </Text>
                        </VStack>
                        <Button
                          colorScheme="blue"
                          size="lg"
                          w="full"
                          h="12"
                          borderRadius="lg"
                          fontSize="md"
                          fontWeight="600"
                          leftIcon={<FaPlus />}
                          _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
                          transition="all 0.2s"
                        >
                          Create Lead Magnet
                        </Button>
                      </VStack>
                    </Center>
                  )}

                  {/* Lead Magnets Grid */}
                  {user.leadMagnets && Object.keys(user.leadMagnets).length > 0 && (
                    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={8}>
                      {Object.entries(user.leadMagnets).map(([key, magnet]) => (
                        <Card
                          key={key}
                          bg={cardBg}
                          borderRadius="xl"
                          boxShadow="0 2px 12px rgba(0, 0, 0, 0.04)"
                          border="1px solid"
                          borderColor="gray.100"
                          _dark={{ borderColor: "gray.700" }}
                          overflow="hidden"
                          transition="all 0.2s ease-in-out"
                          _hover={{
                            transform: 'translateY(-1px)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                            borderColor: 'gray.200'
                          }}
                        >
                          <CardBody p={8}>
                            <VStack spacing={8} align="stretch" h="full">
                              {/* Header Section - Clean and Minimal */}
                              <VStack spacing={3} align="start">
                                <Flex justify="space-between" align="start" w="full">
                                  <Heading
                                    size="lg"
                                    color={textColor}
                                    fontWeight="600"
                                    lineHeight="1.2"
                                    pr={4}
                                    flex={1}
                                  >
                                    {magnet.title || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Heading>
                                  <Badge
                                    colorScheme={magnet.isActive ? 'green' : 'gray'}
                                    variant="subtle"
                                    fontSize="xs"
                                    fontWeight="500"
                                    px={2}
                                    py={1}
                                    borderRadius="md"
                                    textTransform="none"
                                  >
                                    {magnet.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </Flex>

                                {magnet.description && (
                                  <Text
                                    color={mutedTextColor}
                                    fontSize="sm"
                                    lineHeight="1.5"
                                    opacity={0.75}
                                    noOfLines={2}
                                  >
                                    {magnet.description}
                                  </Text>
                                )}
                              </VStack>

                              {/* Stats Section - Minimal and Clean */}
                              <HStack spacing={8} justify="center" pt={4}>
                                <VStack spacing={1} align="center" flex={1}>
                                  <Text
                                    fontSize="3xl"
                                    fontWeight="700"
                                    color="blue.600"
                                    _dark={{ color: "blue.300" }}
                                    lineHeight="1"
                                  >
                                    {magnet.downloads || 0}
                                  </Text>
                                  <Text
                                    fontSize="xs"
                                    color={mutedTextColor}
                                    fontWeight="500"
                                    textTransform="uppercase"
                                    letterSpacing="0.5px"
                                    textAlign="center"
                                  >
                                    Downloads
                                  </Text>
                                </VStack>

                                <Divider orientation="vertical" h="40px" borderColor="gray.200" />

                                <VStack spacing={1} align="center" flex={1}>
                                  <Text
                                    fontSize="3xl"
                                    fontWeight="700"
                                    color="green.600"
                                    _dark={{ color: "green.300" }}
                                    lineHeight="1"
                                  >
                                    {magnet.leadsGenerated || 0}
                                  </Text>
                                  <Text
                                    fontSize="xs"
                                    color={mutedTextColor}
                                    fontWeight="500"
                                    textTransform="uppercase"
                                    letterSpacing="0.5px"
                                    textAlign="center"
                                  >
                                    Leads
                                  </Text>
                                </VStack>
                              </HStack>

                              {/* Actions - Minimal Icon Buttons */}
                              <HStack spacing={2} justify="center" pt={4}>
                                <IconButton
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                  icon={<FaEye />}
                                  borderRadius="lg"
                                  aria-label="View lead magnet"
                                  _hover={{ bg: "blue.50", color: "blue.600" }}
                                />
                                <IconButton
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="gray"
                                  icon={<FaEdit />}
                                  borderRadius="lg"
                                  aria-label="Edit lead magnet"
                                  _hover={{ bg: "gray.50" }}
                                />
                                <IconButton
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="green"
                                  icon={<FaShareAlt />}
                                  borderRadius="lg"
                                  aria-label="Share lead magnet"
                                  _hover={{ bg: "green.50", color: "green.600" }}
                                />
                              </HStack>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  )}
                </VStack>
              </TabPanel>

              {/* Settings Tab */}
              <TabPanel px={0}>
                {console.log('Settings tab rendering, user:', user)}
                <VStack spacing={6}>
                  <Heading size="lg" color={textColor}>Settings</Heading>
                  <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                  {/* Account Settings */}
                  <Card bg={cardBg} shadow="md">
                    <CardHeader>
                      <Heading size="md" color={textColor}>Account Settings</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Text>Email Notifications</Text>
                          <Switch defaultChecked colorScheme="blue" />
                        </HStack>
                        <Divider />
                        <HStack justify="space-between">
                          <Text>SMS Notifications</Text>
                          <Switch colorScheme="blue" />
                        </HStack>
                        <Divider />
                        <HStack justify="space-between">
                          <Text>Two-Factor Authentication</Text>
                          <Switch colorScheme="blue" />
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Sponsor Management */}
                  <Card bg={cardBg} shadow="md">
                    <CardHeader>
                      <Flex justify="space-between" align="center">
                        <Heading size="md" color={textColor}>Sponsor Management</Heading>
                        <Button 
                          leftIcon={<FaEdit />} 
                          size="sm" 
                          colorScheme="blue"
                          onClick={onSponsorChangeOpen}
                        >
                          Change Sponsor
                        </Button>
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={mutedTextColor}>Current Sponsor:</Text>
                          <Text fontSize="sm" fontWeight="600" color={textColor}>
                            {sponsorDetails?.sponsorId?.name || sponsorDetails?.sponsorId?.selfCoachId || user.sponsorId || 'Not assigned'}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={mutedTextColor}>Sponsor Coach ID:</Text>
                          <Text fontSize="sm" fontWeight="600" color={textColor}>
                            {sponsorDetails?.sponsorId?.selfCoachId || 'N/A'}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={mutedTextColor}>Coach ID:</Text>
                          <Text fontSize="sm" fontWeight="600" color={textColor}>
                            {user.selfCoachId || 'N/A'}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color={mutedTextColor}>Current Level:</Text>
                          <Badge colorScheme="blue" fontSize="xs">
                            Level {user.currentLevel || 1}
                          </Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Privacy Settings */}
                  <Card bg={cardBg} shadow="md">
                    <CardHeader>
                      <Heading size="md" color={textColor}>Privacy Settings</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Profile Visibility</FormLabel>
                          <Select defaultValue="public">
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="friends">Friends Only</option>
                          </Select>
                        </FormControl>

                        <HStack justify="space-between">
                          <Text>Show Contact Info</Text>
                          <Switch defaultChecked colorScheme="blue" />
                        </HStack>

                        <HStack justify="space-between">
                          <Text>Show Online Status</Text>
                          <Switch defaultChecked colorScheme="blue" />
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Data Management */}
                  <Card bg={cardBg} shadow="md" gridColumn={{ base: "1", lg: "span 2" }}>
                    <CardHeader>
                      <Heading size="md" color={textColor}>Data Management</Heading>
                    </CardHeader>
                    <CardBody>
                      <HStack spacing={4}>
                        <Button leftIcon={<FaDownload />} colorScheme="blue" variant="outline">
                          Export My Data
                        </Button>
                        <Button leftIcon={<FaTrash />} colorScheme="red" variant="outline">
                          Delete Account
                        </Button>
                      </HStack>
                    </CardBody>
                  </Card>
                </Grid>
                </VStack>
              </TabPanel>

              {/* Subscription Tab - Minimal & Elegant */}
              <TabPanel px={0}>
                <VStack spacing={8} align="stretch">
                  {subscriptionLoading ? (
                    <Center py={20}>
                      <VStack spacing={4}>
                        <Spinner size="lg" color="blue.500" thickness="3px" />
                        <Text fontSize="sm" color={mutedTextColor} fontWeight="500">
                          Loading subscription details...
                        </Text>
                      </VStack>
                    </Center>
                  ) : (
                    <>
                      {/* No Subscription State */}
                      {!subscription && (
                        <Center py={20}>
                          <VStack spacing={6} maxW="400px" textAlign="center">
                            <Box
                              p={6}
                              borderRadius="full"
                              bg="gray.100"
                              _dark={{ bg: "gray.700" }}
                            >
                              <Icon as={FaCreditCard} boxSize={8} color="gray.400" />
                            </Box>
                            <VStack spacing={2}>
                              <Text fontSize="xl" fontWeight="600" color={textColor}>
                                No Active Subscription
                              </Text>
                              <Text fontSize="sm" color={mutedTextColor} lineHeight="1.6">
                                Choose a plan to unlock premium features and grow your business.
                              </Text>
                            </VStack>
                            <Button
                              colorScheme="blue"
                              size="lg"
                              w="full"
                              h="12"
                              borderRadius="lg"
                              fontSize="md"
                              fontWeight="600"
                              onClick={() => {
                                const token = localStorage.getItem('token');
                                if (token) {
                                  window.location.href = `${API_BASE_URL}/subscription-plans?token=${encodeURIComponent(token)}`;
                                } else {
                                  window.location.href = `${API_BASE_URL}/subscription-plans`;
                                }
                              }}
                              _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
                              transition="all 0.2s"
                            >
                              View Plans
                            </Button>
                          </VStack>
                        </Center>
                      )}

                      {/* Active Subscription State */}
                      {subscription && (
                        <VStack spacing={8} align="stretch">
                          {/* Current Plan Card - Clean & Minimal */}
                          <Card
                            bg={cardBg}
                            borderRadius="2xl"
                            boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
                            border="1px solid"
                            borderColor="gray.100"
                            _dark={{ borderColor: "gray.700" }}
                            overflow="hidden"
                          >
                            <CardBody p={8}>
                              <VStack spacing={6} align="stretch">
                                {/* Plan Header */}
                                <HStack justify="space-between" align="center">
                                  <HStack spacing={4}>
                                    <Box
                                      p={3}
                                      borderRadius="xl"
                                      bg={subscription.status === 'active' ? 'green.50' : 'red.50'}
                                      _dark={{
                                        bg: subscription.status === 'active' ? 'green.900' : 'red.900'
                                      }}
                                    >
                                      <Icon
                                        as={subscription.status === 'active' ? FiCheck : FiX}
                                        boxSize={5}
                                        color={subscription.status === 'active' ? 'green.600' : 'red.600'}
                                      />
                                    </Box>
                                    <VStack align="start" spacing={1}>
                                      <Text fontSize="2xl" fontWeight="700" color={textColor}>
                                        {subscription.planId?.name || 'Premium Plan'}
                                      </Text>
                                      <HStack spacing={2}>
                                        <Badge
                                          colorScheme={getStatusColor(subscription.status)}
                                          variant="subtle"
                                          px={3}
                                          py={1}
                                          borderRadius="lg"
                                          fontSize="xs"
                                          fontWeight="600"
                                          textTransform="uppercase"
                                          letterSpacing="0.5px"
                                        >
                                          {subscription.status}
                                        </Badge>
                                        {subscription.daysUntilExpiry && (
                                          <Text fontSize="sm" color={mutedTextColor}>
                                            {subscription.daysUntilExpiry} days left
                                          </Text>
                                        )}
                                      </HStack>
                                    </VStack>
                                  </HStack>
                                  <VStack align="end" spacing={1}>
                                    <Text fontSize="3xl" fontWeight="800" color="blue.600">
                                      {formatCurrency(subscription.billing?.amount, subscription.billing?.currency)}
                                    </Text>
                                    <Text fontSize="sm" color={mutedTextColor} textTransform="uppercase" letterSpacing="1px">
                                      per {subscription.billing?.billingCycle || 'month'}
                                    </Text>
                                  </VStack>
                                </HStack>

                                {/* Key Metrics - Minimal Grid */}
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                                  <Box
                                    p={5}
                                    borderRadius="xl"
                                    bg="blue.50"
                                    _dark={{ bg: "blue.900", borderColor: "blue.700" }}
                                    border="1px solid"
                                    borderColor="blue.100"
                                  >
                                    <VStack spacing={2} align="center">
                                      <Icon as={FiUsers} boxSize={6} color="blue.600" />
                                      <Text fontSize="2xl" fontWeight="800" color="blue.700" _dark={{ color: "blue.300" }}>
                                        {subscription.usage?.currentLeads || 0}
                                      </Text>
                                      <Text fontSize="sm" color="blue.600" fontWeight="500">
                                        Total Leads
                                      </Text>
                                    </VStack>
                                  </Box>

                                  <Box
                                    p={5}
                                    borderRadius="xl"
                                    bg="green.50"
                                    _dark={{ bg: "green.900", borderColor: "green.700" }}
                                    border="1px solid"
                                    borderColor="green.100"
                                  >
                                    <VStack spacing={2} align="center">
                                      <Icon as={FiTrendingUp} boxSize={6} color="green.600" />
                                      <Text fontSize="2xl" fontWeight="800" color="green.700" _dark={{ color: "green.300" }}>
                                        {subscription.usage?.currentFunnels || 0}
                                      </Text>
                                      <Text fontSize="sm" color="green.600" fontWeight="500">
                                        Active Funnels
                                      </Text>
                                    </VStack>
                                  </Box>

                                  <Box
                                    p={5}
                                    borderRadius="xl"
                                    bg="purple.50"
                                    _dark={{ bg: "purple.900", borderColor: "purple.700" }}
                                    border="1px solid"
                                    borderColor="purple.100"
                                  >
                                    <VStack spacing={2} align="center">
                                      <Icon as={FiZap} boxSize={6} color="purple.600" />
                                      <Text fontSize="2xl" fontWeight="800" color="purple.700" _dark={{ color: "purple.300" }}>
                                        {subscription.usage?.currentStaff || 0}
                                      </Text>
                                      <Text fontSize="sm" color="purple.600" fontWeight="500">
                                        Team Members
                                      </Text>
                                    </VStack>
                                  </Box>
                                </SimpleGrid>

                                {/* Action Buttons - Minimal */}
                                {subscription.status === 'active' && (
                                  <HStack spacing={4} justify="center" pt={4}>
                                    <Button
                                      size="md"
                                      variant="outline"
                                      colorScheme="blue"
                                      leftIcon={<FiTrendingUp />}
                                      onClick={handleUpgrade}
                                      borderRadius="lg"
                                      fontWeight="500"
                                    >
                                      Upgrade Plan
                                    </Button>
                                    <Button
                                      size="md"
                                      variant="outline"
                                      colorScheme="red"
                                      leftIcon={<FiX />}
                                      onClick={onCancelOpen}
                                      borderRadius="lg"
                                      fontWeight="500"
                                    >
                                      Cancel Plan
                                    </Button>
                                  </HStack>
                                )}
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Usage Overview - Clean Cards */}
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            {/* Leads Usage */}
                            <Card bg={cardBg} borderRadius="xl" boxShadow="0 2px 10px rgba(0, 0, 0, 0.05)">
                              <CardBody p={6}>
                                <VStack spacing={4} align="stretch">
                                  <HStack justify="space-between" align="center">
                                    <HStack spacing={3}>
                                      <Box p={2} borderRadius="lg" bg="blue.100" _dark={{ bg: "blue.800" }}>
                                        <Icon as={FiUsers} boxSize={4} color="blue.600" />
                                      </Box>
                                      <Text fontSize="lg" fontWeight="600" color={textColor}>
                                        Leads Usage
                                      </Text>
                                    </HStack>
                                    <Text fontSize="sm" color={mutedTextColor}>
                                      {(subscription.usage?.currentLeads || 0).toLocaleString()} / {(subscription.limits?.maxLeads === -1 || subscription.planId?.limits?.maxLeads === -1) ? '∞' : (subscription.limits?.maxLeads || subscription.planId?.limits?.maxLeads || 0).toLocaleString()}
                                    </Text>
                                  </HStack>
                                  <Progress
                                    value={getUsagePercentage(
                                      subscription.usage?.currentLeads || 0,
                                      subscription.limits?.maxLeads || subscription.planId?.limits?.maxLeads || 1
                                    )}
                                    colorScheme="blue"
                                    size="md"
                                    borderRadius="full"
                                    bg="gray.100"
                                    _dark={{ bg: "gray.700" }}
                                  />
                                  <HStack justify="space-between">
                                    <Text fontSize="xs" color="green.600" fontWeight="500">
                                      Used: {(subscription.usage?.currentLeads || 0).toLocaleString()}
                                    </Text>
                                    <Text fontSize="xs" color="blue.600" fontWeight="500">
                                      Available: {(subscription.limits?.maxLeads === -1 || subscription.planId?.limits?.maxLeads === -1) ? '∞' : ((subscription.limits?.maxLeads || subscription.planId?.limits?.maxLeads || 0) - (subscription.usage?.currentLeads || 0)).toLocaleString()}
                                    </Text>
                                  </HStack>
                                </VStack>
                              </CardBody>
                            </Card>

                            {/* Funnels Usage */}
                            <Card bg={cardBg} borderRadius="xl" boxShadow="0 2px 10px rgba(0, 0, 0, 0.05)">
                              <CardBody p={6}>
                                <VStack spacing={4} align="stretch">
                                  <HStack justify="space-between" align="center">
                                    <HStack spacing={3}>
                                      <Box p={2} borderRadius="lg" bg="green.100" _dark={{ bg: "green.800" }}>
                                        <Icon as={FiTrendingUp} boxSize={4} color="green.600" />
                                      </Box>
                                      <Text fontSize="lg" fontWeight="600" color={textColor}>
                                        Funnels Usage
                                      </Text>
                                    </HStack>
                                    <Text fontSize="sm" color={mutedTextColor}>
                                      {subscription.usage?.currentFunnels || 0} / {subscription.planId?.features?.maxFunnels === -1 ? '∞' : subscription.planId?.features?.maxFunnels || 0}
                                    </Text>
                                  </HStack>
                                  <Progress
                                    value={getUsagePercentage(
                                      subscription.usage?.currentFunnels || 0,
                                      subscription.planId?.features?.maxFunnels || 1
                                    )}
                                    colorScheme="green"
                                    size="md"
                                    borderRadius="full"
                                    bg="gray.100"
                                    _dark={{ bg: "gray.700" }}
                                  />
                                  <HStack justify="space-between">
                                    <Text fontSize="xs" color="green.600" fontWeight="500">
                                      Used: {subscription.usage?.currentFunnels || 0}
                                    </Text>
                                    <Text fontSize="xs" color="blue.600" fontWeight="500">
                                      Available: {subscription.planId?.features?.maxFunnels === -1 ? '∞' : (subscription.planId?.features?.maxFunnels || 0) - (subscription.usage?.currentFunnels || 0)}
                                    </Text>
                                  </HStack>
                                </VStack>
                              </CardBody>
                            </Card>
                          </SimpleGrid>
                        </VStack>
                      )}
                    </>
                  )}
                </VStack>

                {/* Cancel Subscription Modal - Minimal Design */}
                <Modal isOpen={isCancelOpen} onClose={onCancelClose} size="md">
                  <ModalOverlay backdropFilter="blur(4px)" />
                  <ModalContent borderRadius="2xl" overflow="hidden">
                    <ModalHeader pb={2}>
                      <VStack spacing={2} align="center">
                        <Box p={3} borderRadius="full" bg="red.50" _dark={{ bg: "red.900" }}>
                          <Icon as={FiX} boxSize={6} color="red.500" />
                        </Box>
                        <Text fontSize="lg" fontWeight="600" color={textColor}>
                          Cancel Subscription
                        </Text>
                      </VStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <VStack spacing={4}>
                        <Alert status="warning" borderRadius="lg" p={4}>
                          <AlertIcon />
                          <AlertDescription fontSize="sm" lineHeight="1.6">
                            Are you sure you want to cancel your subscription? This action cannot be undone and you'll lose access to premium features.
                          </AlertDescription>
                        </Alert>
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="500" color={textColor}>
                            Reason for Cancellation (Optional)
                          </FormLabel>
                          <Textarea
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            placeholder="Please let us know why you're cancelling..."
                            rows={3}
                            borderRadius="lg"
                            focusBorderColor="red.300"
                          />
                        </FormControl>
                      </VStack>
                    </ModalBody>
                    <ModalFooter pt={6}>
                      <HStack spacing={3} w="full">
                        <Button
                          variant="outline"
                          onClick={onCancelClose}
                          flex={1}
                          borderRadius="lg"
                          fontWeight="500"
                        >
                          Keep Subscription
                        </Button>
                        <Button
                          colorScheme="red"
                          onClick={handleCancel}
                          flex={1}
                          borderRadius="lg"
                          fontWeight="500"
                        >
                          Cancel Subscription
                        </Button>
                      </HStack>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </TabPanel>
            </TabPanels>
            </Tabs>
          </MotionBox>
        </Box>
      </Box>

      {/* Sponsor Change Modal */}
      <Modal isOpen={isSponsorChangeOpen} onClose={onSponsorChangeClose} size="md">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <ModalHeader pb={2}>
            <VStack spacing={2} align="center">
              <Box p={3} borderRadius="full" bg="blue.50" _dark={{ bg: "blue.900" }}>
                <Icon as={FaUser} boxSize={6} color="blue.500" />
              </Box>
              <Text fontSize="lg" fontWeight="600" color={textColor}>
                Change Sponsor ID
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Alert status="info" borderRadius="lg" p={4}>
                <AlertIcon />
                <AlertDescription fontSize="sm" lineHeight="1.6">
                  Sponsor change requests require admin approval. Your current sponsor information will be updated after approval.
                </AlertDescription>
              </Alert>
              
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500" color={textColor}>
                  New Sponsor ID
                </FormLabel>
                <Box position="relative">
                  <Input
                    value={sponsorChangeData.newSponsorId}
                    onChange={(e) => handleSponsorInputChange('newSponsorId', e.target.value)}
                    placeholder="Enter new sponsor Coach ID or name"
                    borderRadius="lg"
                    focusBorderColor="blue.300"
                  />
                  {sponsorSearchLoading && (
                    <Spinner
                      size="sm"
                      position="absolute"
                      right="10px"
                      top="50%"
                      transform="translateY(-50%)"
                    />
                  )}
                </Box>
                
                {/* Sponsor Search Results */}
                {sponsorSearchResults.length > 0 && (
                  <Box
                    mt={2}
                    bg={cardBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="lg"
                    maxH="200px"
                    overflowY="auto"
                    boxShadow="md"
                  >
                    {sponsorSearchResults.map((sponsor, index) => (
                      <Box
                        key={sponsor._id}
                        p={3}
                        cursor="pointer"
                        borderBottom={index < sponsorSearchResults.length - 1 ? "1px solid" : "none"}
                        borderColor={borderColor}
                        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                        onClick={() => selectSponsor(sponsor)}
                      >
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="600" color={textColor}>
                            {sponsor.name}
                          </Text>
                          <Text fontSize="xs" color={mutedTextColor}>
                            Coach ID: {sponsor.selfCoachId}
                          </Text>
                          <Text fontSize="xs" color={mutedTextColor}>
                            Level {sponsor.currentLevel}
                          </Text>
                        </VStack>
                      </Box>
                    ))}
                  </Box>
                )}
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500" color={textColor}>
                  Reason for Change (Optional)
                </FormLabel>
                <Textarea
                  value={sponsorChangeData.reason}
                  onChange={(e) => handleSponsorInputChange('reason', e.target.value)}
                  placeholder="Please provide a reason for this sponsor change..."
                  rows={3}
                  borderRadius="lg"
                  focusBorderColor="blue.300"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter pt={6}>
            <HStack spacing={3} w="full">
              <Button
                variant="outline"
                onClick={onSponsorChangeClose}
                flex={1}
                borderRadius="lg"
                fontWeight="500"
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSponsorChange}
                flex={1}
                borderRadius="lg"
                fontWeight="500"
                isLoading={sponsorChangeLoading}
              >
                Submit Request
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Credits Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Credits</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>Credits to Add</FormLabel>
                <Input
                  type="number"
                  value={creditsToAdd}
                  onChange={(e) => setCreditsToAdd(e.target.value)}
                  placeholder="Enter number of credits"
                  min="1"
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={addCredits} isLoading={loading}>
                Add Credits
              </Button>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
    </Box>
  );
};

export default Profile;
