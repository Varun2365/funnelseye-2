import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  Icon,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Input,
  Textarea,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Spinner,
  Link,
  Checkbox,
  Collapse,
  Badge,
  SimpleGrid,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Select,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  AlertDescription,
  FormControl,
  FormLabel,
  Progress,
} from '@chakra-ui/react';
import {
  FiMapPin,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiGlobe,
  FiEdit,
  FiMoreHorizontal,
  FiUser,
  FiAward,
  FiBook,
  FiSettings,
  FiLinkedin,
  FiTwitter,
  FiFacebook,
  FiInstagram,
  FiYoutube,
  FiCalendar,
  FiCheckCircle,
  FiImage,
  FiCamera,
  FiGift,
  FiCreditCard,
  FiX,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiUsers,
  FiTarget,
  FiBookOpen,
  FiEye,
  FiShare2,
  FiExternalLink,
  FiActivity,
  FiBarChart2,
  FiDownload,
  FiFileText,
  FiPercent,
  FiPackage,
  FiHeart,
  FiCopy,
  FiDollarSign,
  FiCheck,
  FiRefreshCw,
  FiZap,
  FiTrendingUp,
  FiAlertTriangle,
  FiSearch,
} from 'react-icons/fi';
import { API_BASE_URL } from '../config/apiConfig';
import { getToken } from '../utils/authUtils';
import { subscriptionAPI } from '../services/subscriptionAPI';
import defaultBanner from '../banner.jpg';

// Countries with flag codes
const COUNTRIES = [
  { name: 'United States', code: 'us' },
  { name: 'United Kingdom', code: 'gb' },
  { name: 'Canada', code: 'ca' },
  { name: 'Australia', code: 'au' },
  { name: 'Germany', code: 'de' },
  { name: 'France', code: 'fr' },
  { name: 'Italy', code: 'it' },
  { name: 'Spain', code: 'es' },
  { name: 'India', code: 'in' },
  { name: 'China', code: 'cn' },
  { name: 'Japan', code: 'jp' },
  { name: 'Brazil', code: 'br' },
  { name: 'Mexico', code: 'mx' },
  { name: 'Russia', code: 'ru' },
  { name: 'South Korea', code: 'kr' },
  { name: 'Netherlands', code: 'nl' },
  { name: 'Sweden', code: 'se' },
  { name: 'Norway', code: 'no' },
  { name: 'Denmark', code: 'dk' },
  { name: 'Finland', code: 'fi' },
  { name: 'Switzerland', code: 'ch' },
  { name: 'Belgium', code: 'be' },
  { name: 'Austria', code: 'at' },
  { name: 'Poland', code: 'pl' },
  { name: 'Portugal', code: 'pt' },
  { name: 'Greece', code: 'gr' },
  { name: 'Ireland', code: 'ie' },
  { name: 'New Zealand', code: 'nz' },
  { name: 'South Africa', code: 'za' },
  { name: 'Argentina', code: 'ar' },
  { name: 'Chile', code: 'cl' },
  { name: 'Singapore', code: 'sg' },
  { name: 'Malaysia', code: 'my' },
  { name: 'Thailand', code: 'th' },
  { name: 'Indonesia', code: 'id' },
  { name: 'Philippines', code: 'ph' },
  { name: 'Vietnam', code: 'vn' },
  { name: 'Turkey', code: 'tr' },
  { name: 'Saudi Arabia', code: 'sa' },
  { name: 'United Arab Emirates', code: 'ae' },
  { name: 'Israel', code: 'il' },
  { name: 'Egypt', code: 'eg' },
  { name: 'Nigeria', code: 'ng' },
  { name: 'Kenya', code: 'ke' },
];

// Helper function to get flag code from country name
const getCountryCode = (countryName) => {
  if (!countryName) return null;
  const country = COUNTRIES.find(c => 
    c.name.toLowerCase() === countryName.toLowerCase()
  );
  return country ? country.code : null;
};

// Helper function to get flag image URL
const getCountryFlagUrl = (countryName) => {
  const code = getCountryCode(countryName);
  if (!code) return null;
  return `https://flagcdn.com/w20/${code}.png`;
};

// Lead Magnet definitions
const LEAD_MAGNETS = [
  {
    id: 'ai_diet_planner',
    name: 'AI Diet Planner',
    description: 'Generate personalized diet plans for your clients',
    icon: FiPackage,
    color: 'blue',
  },
  {
    id: 'bmi_calculator',
    name: 'BMI Calculator',
    description: 'Calculate BMI and provide health recommendations',
    icon: FiPercent,
    color: 'green',
  },
  {
    id: 'fitness_ebook',
    name: 'Fitness Ebook',
    description: 'Create and share fitness ebooks with your audience',
    icon: FiFileText,
    color: 'purple',
  },
  {
    id: 'meal_planner',
    name: 'Meal Planner',
    description: 'Help clients plan their meals with custom meal plans',
    icon: FiPackage,
    color: 'orange',
  },
  {
    id: 'workout_calculator',
    name: 'Workout Calculator',
    description: 'Calculate workout metrics and training zones',
    icon: FiActivity,
    color: 'red',
  },
  {
    id: 'stress_assessment',
    name: 'Stress Assessment',
    description: 'Assess stress levels and provide wellness insights',
    icon: FiHeart,
    color: 'pink',
  },
];

const Profile = () => {
  const authState = useSelector((state) => state.auth);
  const user = authState?.user;
  const token = getToken(authState);
  const toast = useToast();
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const achievementImageInputRefs = useRef({});
  const achievementScrollRef = useRef(null);
  const experienceScrollRef = useRef(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isAchievementsOpen, onOpen: onAchievementsOpen, onClose: onAchievementsClose } = useDisclosure();
  const { isOpen: isExperiencesOpen, onOpen: onExperiencesOpen, onClose: onExperiencesClose } = useDisclosure();
  const [achievements, setAchievements] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [editingExperience, setEditingExperience] = useState(null);
  const [uploadingAchievementImages, setUploadingAchievementImages] = useState({});
  const { isOpen: isExperienceOpen, onToggle: onExperienceToggle } = useDisclosure({ defaultIsOpen: true });
  const { isOpen: isDeleteAchievementOpen, onOpen: onDeleteAchievementOpen, onClose: onDeleteAchievementClose } = useDisclosure();
  const { isOpen: isDeleteExperienceOpen, onOpen: onDeleteExperienceOpen, onClose: onDeleteExperienceClose } = useDisclosure();
  const [deleteAchievementIndex, setDeleteAchievementIndex] = useState(null);
  const [deleteExperienceIndex, setDeleteExperienceIndex] = useState(null);
  const cancelDeleteRef = useRef();

  // Lead Magnets state
  const [leadMagnets, setLeadMagnets] = useState({
    ai_diet_planner: { isEnabled: false, downloads: 0, leads: 0, config: {} },
    bmi_calculator: { isEnabled: false, downloads: 0, leads: 0, config: {} },
    fitness_ebook: { isEnabled: false, downloads: 0, leads: 0, config: { ebooks: [] } },
    meal_planner: { isEnabled: false, downloads: 0, leads: 0, config: {} },
    workout_calculator: { isEnabled: false, downloads: 0, leads: 0, config: {} },
    stress_assessment: { isEnabled: false, downloads: 0, leads: 0, config: {} },
  });
  const { isOpen: isLeadMagnetSetupOpen, onOpen: onLeadMagnetSetupOpen, onClose: onLeadMagnetSetupClose } = useDisclosure();
  const { isOpen: isLeadMagnetActivityOpen, onOpen: onLeadMagnetActivityOpen, onClose: onLeadMagnetActivityClose } = useDisclosure();
  const [editingLeadMagnet, setEditingLeadMagnet] = useState(null);
  const [leadMagnetActivity, setLeadMagnetActivity] = useState(null);

  // Subscription state
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  const [cancellationReason, setCancellationReason] = useState('');

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

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.900', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editData, setEditData] = useState({});
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Fetch user profile data on component mount
  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchLeadMagnets();
    }
  }, [token]);

  // Load subscription data when subscription tab is active
  useEffect(() => {
    if (activeTab === 2 && token) { // Subscription tab index
      loadSubscriptionData();
    }
  }, [activeTab, token]);

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

  const fetchLeadMagnets = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/lead-magnets/coach`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Transform the data to match our state structure
          const magnetsData = {};
          Object.keys(data.data).forEach((key) => {
            magnetsData[key] = {
              isEnabled: data.data[key]?.isEnabled || false,
              downloads: data.data[key]?.downloads || 0,
              leads: data.data[key]?.leads || 0,
              config: data.data[key]?.config || {},
            };
          });
          setLeadMagnets((prev) => ({ ...prev, ...magnetsData }));
        }
      }
    } catch (error) {
      console.error('Error fetching lead magnets:', error);
    }
  };

  // Helper functions for subscription
  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount && amount !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'green';
      case 'cancelled':
      case 'expired':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getUsagePercentage = (current, max) => {
    if (!max || max === -1) return 0;
    if (current === 0) return 0;
    const percentage = (current / max) * 100;
    return Math.min(percentage, 100);
  };

  const loadSubscriptionData = async () => {
    if (!token) return;
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

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      await subscriptionAPI.cancelSubscription({ reason: cancellationReason });
      toast({
        title: 'Subscription cancelled',
        description: 'Your subscription has been cancelled successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onCancelClose();
      setCancellationReason('');
      loadSubscriptionData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    if (token) {
      window.location.href = `${API_BASE_URL}/subscription-plans?token=${encodeURIComponent(token)}`;
    } else {
      window.location.href = `${API_BASE_URL}/subscription-plans`;
    }
  };

  const handleRenew = () => {
    if (token) {
      window.location.href = `${API_BASE_URL}/subscription-plans?token=${encodeURIComponent(token)}`;
    } else {
      window.location.href = `${API_BASE_URL}/subscription-plans`;
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
      const response = await fetch(`${API_BASE_URL}/api/coach-hierarchy/admin-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestType: 'sponsor_change',
          requestedData: {
            sponsorId: sponsorChangeData.newSponsorId
          },
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

  // Also update when user changes
  useEffect(() => {
    if (user) {
      setProfileData(user);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setImagesLoaded(false);
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setProfileData(data.user);
          setAchievements(data.user.achievements || []);
          setExperiences(data.user.experiences || []);
        }
      } else {
        // If API fails, use Redux user data as fallback
        if (user) {
          setProfileData(user);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
        // Fallback to Redux user data
      if (user) {
        setProfileData(user);
        setAchievements(user.achievements || []);
        setExperiences(user.experiences || []);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle image loading
  useEffect(() => {
    if (!loading && profileData) {
      const images = [];
      
      // Add profile picture
      if (profileData.profilePicture) {
        const img = new Image();
        let profilePicUrl = profileData.profilePicture;
        if (!profilePicUrl.startsWith('http')) {
          profilePicUrl = profilePicUrl.startsWith('/') 
            ? `${API_BASE_URL.replace('/api', '')}${profilePicUrl}`
            : `${API_BASE_URL.replace('/api', '')}/uploads/images/${profilePicUrl}`;
        }
        img.src = profilePicUrl;
        images.push(img);
      }
      
      // Add banner image (always use default if no custom)
      const bannerImg = new Image();
      let bannerUrl = defaultBanner;
      if (profileData.bannerImage) {
        bannerUrl = profileData.bannerImage.startsWith('http') 
          ? profileData.bannerImage 
          : profileData.bannerImage.startsWith('/')
          ? `${API_BASE_URL.replace('/api', '')}${profileData.bannerImage}`
          : `${API_BASE_URL.replace('/api', '')}/uploads/images/${profileData.bannerImage}`;
      }
      bannerImg.src = bannerUrl;
      images.push(bannerImg);
      
      // Add achievement images
      if (profileData.achievements) {
        profileData.achievements.forEach(achievement => {
          if (achievement.image) {
            const img = new Image();
            img.src = achievement.image;
            images.push(img);
          }
        });
      }

      if (images.length === 0) {
        setImagesLoaded(true);
        return;
      }

      let loadedCount = 0;
      const totalImages = images.length;
      let timeoutId;

      const checkAllLoaded = () => {
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };

      images.forEach(img => {
        if (img.complete) {
          loadedCount++;
          checkAllLoaded();
        } else {
          img.onload = () => {
            loadedCount++;
            checkAllLoaded();
          };
          img.onerror = () => {
            loadedCount++;
            checkAllLoaded();
          };
        }
      });

      // Timeout fallback - show content after 3 seconds even if images haven't loaded
      timeoutId = setTimeout(() => {
        if (!imagesLoaded) {
          setImagesLoaded(true);
        }
      }, 3000);

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [loading, profileData, imagesLoaded]);

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/files/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Profile picture updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Refresh user data to get updated profile picture
        await fetchProfile();
      } else {
        throw new Error(data.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload profile picture.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBannerImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setUploadingBanner(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/files/banner-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Banner image updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Refresh profile data
        await fetchProfile();
      } else {
        throw new Error(data.message || 'Failed to upload banner image');
      }
    } catch (error) {
      console.error('Error uploading banner image:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload banner image.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploadingBanner(false);
      // Reset file input
      if (bannerInputRef.current) {
        bannerInputRef.current.value = '';
      }
    }
  };

  const handleEditProfile = () => {
    if (profileData) {
      setEditData({
        name: profileData.name || '',
        tagline: profileData.tagline || '',
        bio: profileData.bio || '',
        company: profileData.company || '',
        phone: profileData.phone || '',
        country: profileData.country || '',
        state: profileData.state || '',
        website: profileData.website || '',
        linkedin: profileData.linkedin || '',
        twitter: profileData.twitter || '',
        facebook: profileData.facebook || '',
        instagram: profileData.instagram || '',
        youtube: profileData.youtube || '',
        dateOfBirth: profileData.dateOfBirth || '',
        age: profileData.age || '',
      });
      onEditOpen();
    }
  };

  const handleAddAchievement = () => {
    setEditingAchievement({ image: '', title: '', description: '' });
    onAchievementsOpen();
  };

  const handleEditAchievement = (achievement, index) => {
    setEditingAchievement({ ...achievement, _index: index });
    onAchievementsOpen();
  };

  const handleAddExperience = () => {
    setEditingExperience({
      company: '',
      position: '',
      startDate: '',
      endDate: null,
      isCurrent: false,
      description: '',
      location: '',
      employmentType: 'Full-time',
      specializations: [],
      certifications: [],
      clientCount: null,
      keyResults: '',
      programsCreated: [],
      trainingMethodologies: []
    });
    onExperiencesOpen();
  };

  const handleEditExperience = (experience, index) => {
    setEditingExperience({ ...experience, _index: index });
    onExperiencesOpen();
  };

  const scrollAchievements = (direction) => {
    if (achievementScrollRef.current) {
      const scrollAmount = 400;
      achievementScrollRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollExperiences = (direction) => {
    if (experienceScrollRef.current) {
      const scrollAmount = 400;
      experienceScrollRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Profile updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onEditClose();
        // Refresh profile data from server
        await fetchProfile();
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAchievementImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setUploadingAchievementImages(prev => ({ ...prev, editing: true }));
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/files/achievement-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEditingAchievement(prev => ({ ...prev, image: data.fileUrl }));
        
        toast({
          title: 'Success',
          description: 'Achievement image uploaded successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(data.message || 'Failed to upload achievement image');
      }
    } catch (error) {
      console.error('Error uploading achievement image:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload achievement image.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploadingAchievementImages(prev => ({ ...prev, editing: false }));
      if (achievementImageInputRefs.current.editing) {
        achievementImageInputRefs.current.editing.value = '';
      }
    }
  };

  const handleSaveAchievement = async () => {
    if (!editingAchievement || !editingAchievement.title || editingAchievement.title.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Achievement must have a title.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const currentAchievements = profileData?.achievements || [];
      let updatedAchievements;
      
      if (editingAchievement._index !== undefined) {
        // Editing existing achievement
        updatedAchievements = [...currentAchievements];
        const { _index, ...achievementData } = editingAchievement;
        updatedAchievements[_index] = achievementData;
      } else {
        // Adding new achievement
        if (currentAchievements.length >= 10) {
          toast({
            title: 'Limit Reached',
            description: 'You can add up to 10 achievements.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          setLoading(false);
          return;
        }
        const { _index, ...achievementData } = editingAchievement;
        updatedAchievements = [...currentAchievements, achievementData];
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile/achievements`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ achievements: updatedAchievements }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Achievement saved successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setEditingAchievement(null);
        onAchievementsClose();
        await fetchProfile();
      } else {
        throw new Error(data.message || 'Failed to save achievement');
      }
    } catch (error) {
      console.error('Error saving achievement:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save achievement.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExperience = async () => {
    if (!editingExperience) return;
    
    if (!editingExperience.company || editingExperience.company.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Experience must have a company name.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!editingExperience.position || editingExperience.position.trim() === '') {
      toast({
        title: 'Validation Error',
        description: 'Experience must have a position/title.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!editingExperience.startDate) {
      toast({
        title: 'Validation Error',
        description: 'Experience must have a start date.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!editingExperience.isCurrent && !editingExperience.endDate) {
      toast({
        title: 'Validation Error',
        description: 'End date is required if not current position.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const currentExperiences = profileData?.experiences || [];
      let updatedExperiences;
      
      if (editingExperience._index !== undefined) {
        // Editing existing experience
        updatedExperiences = [...currentExperiences];
        const { _index, ...experienceData } = editingExperience;
        updatedExperiences[_index] = experienceData;
      } else {
        // Adding new experience
        const { _index, ...experienceData } = editingExperience;
        updatedExperiences = [...currentExperiences, experienceData];
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile/experiences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ experiences: updatedExperiences }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Experience saved successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setEditingExperience(null);
        onExperiencesClose();
        await fetchProfile();
      } else {
        throw new Error(data.message || 'Failed to save experience');
      }
    } catch (error) {
      console.error('Error saving experience:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save experience.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAchievementClick = (index) => {
    setDeleteAchievementIndex(index);
    onDeleteAchievementOpen();
  };

  const handleDeleteAchievement = async () => {
    if (deleteAchievementIndex === null) return;
    
    try {
      setLoading(true);
      const currentAchievements = profileData?.achievements || [];
      const updatedAchievements = currentAchievements.filter((_, i) => i !== deleteAchievementIndex);

      const response = await fetch(`${API_BASE_URL}/api/auth/profile/achievements`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ achievements: updatedAchievements }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Achievement deleted successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        await fetchProfile();
        onDeleteAchievementClose();
        setDeleteAchievementIndex(null);
      } else {
        throw new Error(data.message || 'Failed to delete achievement');
      }
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete achievement.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperienceClick = (index) => {
    setDeleteExperienceIndex(index);
    onDeleteExperienceOpen();
  };

  const handleDeleteExperience = async () => {
    if (deleteExperienceIndex === null) return;
    
    try {
      setLoading(true);
      const currentExperiences = profileData?.experiences || [];
      const updatedExperiences = currentExperiences.filter((_, i) => i !== deleteExperienceIndex);

      const response = await fetch(`${API_BASE_URL}/api/auth/profile/experiences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ experiences: updatedExperiences }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Experience deleted successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        await fetchProfile();
        onDeleteExperienceClose();
        setDeleteExperienceIndex(null);
      } else {
        throw new Error(data.message || 'Failed to delete experience');
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete experience.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't show loading screen, just show content with loading indicator on the right side

  const profile = profileData || user || {};
  
  // Get profile picture - check both fields and ensure it's a valid URL
  let profilePicture = null;
  if (profile.profilePicture) {
    if (profile.profilePicture.startsWith('http://') || profile.profilePicture.startsWith('https://')) {
      profilePicture = profile.profilePicture;
    } else if (profile.profilePicture.startsWith('/')) {
      profilePicture = `${API_BASE_URL.replace('/api', '')}${profile.profilePicture}`;
    } else {
      // If it's just a filename, construct the full URL
      profilePicture = `${API_BASE_URL.replace('/api', '')}/uploads/images/${profile.profilePicture}`;
    }
  } else if (profile.profilePictureUrl) {
    profilePicture = profile.profilePictureUrl;
  }

  // Get banner image - construct full URL if needed, or use default
  let bannerImage = defaultBanner; // Default banner image
  if (profile.bannerImage) {
    if (profile.bannerImage.startsWith('http://') || profile.bannerImage.startsWith('https://')) {
      bannerImage = profile.bannerImage;
    } else if (profile.bannerImage.startsWith('/')) {
      bannerImage = `${API_BASE_URL.replace('/api', '')}${profile.bannerImage}`;
    } else {
      bannerImage = `${API_BASE_URL.replace('/api', '')}/uploads/images/${profile.bannerImage}`;
    }
  }

  return (
    <Box minH="100vh" bg={bgColor} pb={8}>
      {/* Profile Header Section - With Banner Image and Dark Background */}
      <Box 
        position="relative"
        pt={8} 
        pb={16} 
        color="white"
        overflow="hidden"
      >
        {/* Banner Image Background */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgImage={`url(${bannerImage})`}
          bgSize="cover"
          bgPosition="center"
          bgRepeat="no-repeat"
        />
        
        {/* Black Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.800"
        />

        {/* Banner Edit Button */}
        <Box
          position="absolute"
          top={4}
          right={4}
          zIndex={20}
        >
          <IconButton
            icon={<FiCamera />}
            aria-label="Edit banner image"
            variant="ghost"
            color="white"
            size="md"
            borderRadius="lg"
            onClick={() => bannerInputRef.current?.click()}
            _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
            isLoading={uploadingBanner}
          />
        </Box>

        <Box 
          position="relative"
          zIndex={10}
          maxW="1200px" 
          mx="auto" 
          px={{ base: 4, md: 8 }}
        >
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'center', md: 'flex-start' }}
            gap={6}
          >
            {/* Profile Picture - Fixed z-index with Instagram-style gradient border */}
            <Box position="relative" zIndex={15}>
              {/* Outer transparent ring */}
              <Box 
                position="relative" 
                display="inline-block"
                p="2px"
                borderRadius="full"
                bg="transparent"
                overflow="visible"
              >
                {/* Inner gradient ring */}
                <Box 
                  position="relative" 
                  display="inline-block"
                  p="2px"
                  borderRadius="full"
                  bgGradient="linear(to-r, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)"
                  overflow="visible"
                >
                  <Box
                    borderRadius="full"
                    overflow="hidden"
                    p="3px"
                    bg="transparent"
                  >
                    <Avatar
                      size="2xl"
                      name={profile.name || 'User'}
                      src={profilePicture}
                      bg="gray.200"
                    />
                  </Box>
                  {uploading && (
                    <Box
                      position="absolute"
                      top="2px"
                      left="2px"
                      right="2px"
                      bottom="2px"
                      bg="blackAlpha.500"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      zIndex={1}
                    >
                      <Spinner size="sm" color="white" />
                    </Box>
                  )}
                </Box>
              </Box>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                display="none"
                onChange={handleProfilePictureUpload}
              />
            </Box>
            <Input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              display="none"
              onChange={handleBannerImageUpload}
            />

            {/* User Info */}
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={3} flex={1}>
              <HStack spacing={3} align="center">
                <Text fontSize="3xl" fontWeight="800" color="white" textAlign={{ base: 'center', md: 'left' }}>
                  {profile.name || 'User Name'}
                </Text>
                {profile.isVerified && (
                  <Icon 
                    as={FiCheckCircle} 
                    boxSize={6} 
                    color="green.400" 
                    title="Verified Account"
                  />
                )}
              </HStack>
              {profile.tagline && (
                <Text fontSize="md" color="gray.300" fontWeight="400" textAlign={{ base: 'center', md: 'left' }}>
                  {profile.tagline}
                </Text>
              )}

              {/* User Details - Two Columns */}
              <Flex 
                direction={{ base: 'column', md: 'row' }} 
                gap={6} 
                w="100%" 
                mt={2}
              >
                {/* First Column: Email, Phone, Location */}
                <VStack align={{ base: 'center', md: 'flex-start' }} spacing={2} flex={1}>
                  {profile.email && (
                    <HStack spacing={2} color="gray.300">
                      <Icon as={FiMail} boxSize={4} />
                      <Text fontSize="sm">{profile.email}</Text>
                    </HStack>
                  )}
                  {profile.phone && (
                    <HStack spacing={2} color="gray.300">
                      <Icon as={FiPhone} boxSize={4} />
                      <Text fontSize="sm">{profile.phone}</Text>
                    </HStack>
                  )}
                  {(profile.city || profile.country) && (
                    <HStack spacing={2} color="gray.300">
                      <Icon as={FiMapPin} boxSize={4} />
                      <Text fontSize="sm">
                        {profile.city || ''}{profile.state && profile.city ? `, ${profile.state}` : profile.state || ''}{(profile.city || profile.state) && profile.country ? ', ' : ''}{profile.country || ''}
                      </Text>
                    </HStack>
                  )}
                </VStack>

                {/* Second Column: Company, Age, Website */}
                <VStack align={{ base: 'center', md: 'flex-start' }} spacing={2} flex={1}>
                  {profile.company && (
                    <HStack spacing={2} color="gray.300">
                      <Icon as={FiBriefcase} boxSize={4} />
                      <Text fontSize="sm">{profile.company}</Text>
                    </HStack>
                  )}
                  {(() => {
                    let calculatedAge = null;
                    if (profile.dateOfBirth) {
                      const birthDate = new Date(profile.dateOfBirth);
                      const today = new Date();
                      calculatedAge = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        calculatedAge--;
                      }
                    } else if (profile.age) {
                      calculatedAge = profile.age;
                    }
                    return calculatedAge ? (
                      <HStack spacing={2} color="gray.300">
                        <Icon as={FiCalendar} boxSize={4} />
                        <Text fontSize="sm">Age: {calculatedAge}</Text>
                      </HStack>
                    ) : null;
                  })()}
                  {profile.website && (
                    <HStack spacing={2} color="gray.300">
                      <Icon as={FiGlobe} boxSize={4} />
                      <Link href={profile.website} isExternal fontSize="sm" color="blue.300" _hover={{ color: 'blue.200', textDecoration: 'underline' }}>
                        {profile.website}
                      </Link>
                    </HStack>
                  )}
                </VStack>
              </Flex>

              {/* Social Media Links */}
              {(profile.linkedin || profile.twitter || profile.facebook || profile.instagram || profile.youtube) && (
                <HStack spacing={3} mt={2} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
                  {profile.linkedin && (
                    <Link href={profile.linkedin} isExternal>
                      <Icon as={FiLinkedin} boxSize={5} color="gray.300" _hover={{ color: 'blue.400' }} />
                    </Link>
                  )}
                  {profile.twitter && (
                    <Link href={profile.twitter} isExternal>
                      <Icon as={FiTwitter} boxSize={5} color="gray.300" _hover={{ color: 'blue.300' }} />
                    </Link>
                  )}
                  {profile.facebook && (
                    <Link href={profile.facebook} isExternal>
                      <Icon as={FiFacebook} boxSize={5} color="gray.300" _hover={{ color: 'blue.400' }} />
                    </Link>
                  )}
                  {profile.instagram && (
                    <Link href={profile.instagram} isExternal>
                      <Icon as={FiInstagram} boxSize={5} color="gray.300" _hover={{ color: 'pink.400' }} />
                    </Link>
                  )}
                  {profile.youtube && (
                    <Link href={profile.youtube} isExternal>
                      <Icon as={FiYoutube} boxSize={5} color="gray.300" _hover={{ color: 'red.400' }} />
                    </Link>
                  )}
                </HStack>
              )}
            </VStack>

            {/* Action Buttons - Clean and Minimal */}
            <HStack spacing={2}>
              <IconButton
                icon={<FiEdit />}
                aria-label="Edit Profile"
                variant="ghost"
                colorScheme="blue"
                size="md"
                borderRadius="lg"
                onClick={handleEditProfile}
                color="white"
                _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
              />
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreHorizontal />}
                  aria-label="More options"
                  variant="ghost"
                  size="md"
                  borderRadius="lg"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
                />
                <MenuList>
                  <MenuItem icon={<FiSettings />}>Settings</MenuItem>
                  <MenuItem icon={<FiUser />}>View Profile</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* Tab Bar Section */}
      <Box bg={cardBg} borderTop="1px solid" borderColor={borderColor} position="sticky" top={0} zIndex={10} shadow="sm">
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }}>
          <Tabs index={activeTab} onChange={setActiveTab} variant="unstyled">
            <TabList
              overflowX="auto"
              sx={{
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
              }}
            >
              <Tab
                _selected={{
                  color: 'blue.500',
                  borderBottom: '3px solid',
                  borderColor: 'blue.500',
                }}
                color={mutedTextColor}
                fontWeight="600"
                fontSize="sm"
                px={6}
                py={4}
                whiteSpace="nowrap"
                _hover={{ color: 'blue.500' }}
                transition="all 0.2s"
              >
                <HStack spacing={2}>
                  <Icon as={FiUser} boxSize={4} />
                  <Text>About</Text>
                </HStack>
              </Tab>
              <Tab
                _selected={{
                  color: 'blue.500',
                  borderBottom: '3px solid',
                  borderColor: 'blue.500',
                }}
                color={mutedTextColor}
                fontWeight="600"
                fontSize="sm"
                px={6}
                py={4}
                whiteSpace="nowrap"
                _hover={{ color: 'blue.500' }}
                transition="all 0.2s"
              >
                <HStack spacing={2}>
                  <Icon as={FiGift} boxSize={4} />
                  <Text>Lead Magnets</Text>
                </HStack>
              </Tab>
              <Tab
                _selected={{
                  color: 'blue.500',
                  borderBottom: '3px solid',
                  borderColor: 'blue.500',
                }}
                color={mutedTextColor}
                fontWeight="600"
                fontSize="sm"
                px={6}
                py={4}
                whiteSpace="nowrap"
                _hover={{ color: 'blue.500' }}
                transition="all 0.2s"
              >
                <HStack spacing={2}>
                  <Icon as={FiCreditCard} boxSize={4} />
                  <Text>Subscription</Text>
                </HStack>
              </Tab>
              <Tab
                _selected={{
                  color: 'blue.500',
                  borderBottom: '3px solid',
                  borderColor: 'blue.500',
                }}
                color={mutedTextColor}
                fontWeight="600"
                fontSize="sm"
                px={6}
                py={4}
                whiteSpace="nowrap"
                _hover={{ color: 'blue.500' }}
                transition="all 0.2s"
              >
                <HStack spacing={2}>
                  <Icon as={FiSettings} boxSize={4} />
                  <Text>Settings</Text>
                </HStack>
              </Tab>
            </TabList>

            {/* Tab Panels */}
            <TabPanels>
              <TabPanel px={0} py={8}>
                {(loading || !imagesLoaded) ? (
                  <Box 
                    minH="400px" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                    maxW="1200px" 
                    mx="auto"
                  >
                    <Spinner 
                      size="xl" 
                      color="blue.500" 
                      thickness="4px"
                      speed="0.65s"
                    />
                  </Box>
                ) : (
                  <Box maxW="1200px" mx="auto">
                    <VStack spacing={4} align="stretch">
                    {/* Bio Section */}
                    <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
                      <CardBody p={6}>
                        <Text fontSize="xl" fontWeight="700" color={textColor} mb={4}>
                          About
                        </Text>
                        <VStack align="stretch" spacing={4}>
                          {profile.bio ? (
                            <Text 
                              color={mutedTextColor} 
                              fontSize="sm"
                              lineHeight="1.7"
                              whiteSpace="pre-wrap"
                            >
                              {profile.bio}
                            </Text>
                          ) : (
                            <Text color={mutedTextColor} fontStyle="italic" fontSize="sm">
                              No bio available.
                            </Text>
                          )}
                          <Divider />
                          <VStack align="stretch" spacing={3}>
                            {(profile.state || profile.country) && (
                              <HStack>
                                <Icon as={FiMapPin} color={mutedTextColor} boxSize={5} />
                                <HStack spacing={2} align="center">
                                  {profile.country && getCountryFlagUrl(profile.country) && (
                                    <Box
                                      as="img"
                                      src={getCountryFlagUrl(profile.country)}
                                      alt={profile.country}
                                      w="20px"
                                      h="15px"
                                      objectFit="cover"
                                      borderRadius="2px"
                                      border="1px solid"
                                      borderColor={borderColor}
                                    />
                                  )}
                                  <Text color={mutedTextColor}>
                                    {[profile.state, profile.country].filter(Boolean).join(', ')}
                                  </Text>
                                </HStack>
                              </HStack>
                            )}
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Achievements Section */}
                    <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
                      <CardBody p={6}>
                        <Flex justify="space-between" align="center" mb={6}>
                          <Text fontSize="xl" fontWeight="700" color={textColor}>
                            Achievements
                          </Text>
                          <Button
                            size="sm"
                            leftIcon={<FiPlus />}
                            onClick={handleAddAchievement}
                            borderRadius="md"
                            fontSize="sm"
                            h="32px"
                            px={4}
                            bg="blue.500"
                            color="white"
                            _hover={{ bg: 'blue.600' }}
                            isDisabled={profileData?.achievements?.length >= 10}
                          >
                            Add
                          </Button>
                        </Flex>
                        {profileData?.achievements && profileData.achievements.length > 0 ? (
                          <Box position="relative">
                            <IconButton
                              icon={<Icon as={FiChevronLeft} color="blue.500" />}
                              aria-label="Scroll left"
                              position="absolute"
                              left={-4}
                              top="50%"
                              transform="translateY(-50%)"
                              zIndex={2}
                              bg={cardBg}
                              boxShadow="md"
                              borderRadius="full"
                              size="md"
                              onClick={() => scrollAchievements('prev')}
                              _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                            />
                            <Box
                              ref={achievementScrollRef}
                              display="flex"
                              gap={4}
                              overflowX="auto"
                              overflowY="hidden"
                              scrollBehavior="smooth"
                              css={{
                                '&::-webkit-scrollbar': {
                                  display: 'none',
                                },
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                              }}
                              pb={2}
                            >
                              {profileData.achievements.map((achievement, index) => {
                                const accentColors = [
                                  { border: 'blue.500', bg: 'blue.50', text: 'blue.600' },
                                  { border: 'purple.500', bg: 'purple.50', text: 'purple.600' },
                                  { border: 'pink.500', bg: 'pink.50', text: 'pink.600' },
                                  { border: 'green.500', bg: 'green.50', text: 'green.600' },
                                ];
                                const accent = accentColors[index % accentColors.length];
                                const darkAccent = {
                                  border: accent.border,
                                  bg: useColorModeValue(accent.bg, 'gray.700'),
                                  text: useColorModeValue(accent.text, accent.border),
                                };
                                
                                return (
                                  <Card
                                    key={index}
                                    bg={useColorModeValue('white', 'gray.700')}
                                    borderRadius="7px"
                                    boxShadow="md"
                                    overflow="hidden"
                                    border="1px solid"
                                    borderColor={borderColor}
                                    minW="320px"
                                    maxW="320px"
                                    flexShrink={0}
                                    position="relative"
                                  >
                                    <HStack
                                      position="absolute"
                                      top={2}
                                      right={2}
                                      zIndex={3}
                                      spacing={1}
                                    >
                                      <IconButton
                                        icon={<FiEdit />}
                                        aria-label="Edit achievement"
                                        size="sm"
                                        bg="whiteAlpha.900"
                                        color="blue.500"
                                        borderRadius="md"
                                        onClick={() => handleEditAchievement(achievement, index)}
                                        _hover={{ bg: 'blue.50' }}
                                      />
                                      <IconButton
                                        icon={<FiTrash2 />}
                                        aria-label="Delete achievement"
                                        size="sm"
                                        bg="whiteAlpha.900"
                                        color="red.500"
                                        borderRadius="md"
                                        onClick={() => handleDeleteAchievementClick(index)}
                                        _hover={{ bg: 'red.50' }}
                                      />
                                    </HStack>
                                    {achievement.image && (
                                      <Box
                                        w="100%"
                                        position="relative"
                                        overflow="hidden"
                                        bg="gray.200"
                                        pt="56.25%" // 16:9 aspect ratio (9/16 = 0.5625)
                                      >
                                        <Box
                                          position="absolute"
                                          top={0}
                                          left={0}
                                          right={0}
                                          bottom={0}
                                        >
                                          <img
                                            src={achievement.image}
                                            alt={achievement.title}
                                            style={{
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'cover',
                                            }}
                                          />
                                        </Box>
                                      </Box>
                                    )}
                                    <CardBody p={5}>
                                      <VStack align="start" spacing={3}>
                                        <Box
                                          px={2}
                                          py={1}
                                          bg={darkAccent.bg}
                                          borderRadius="sm"
                                          borderLeft="3px solid"
                                          borderLeftColor={darkAccent.border}
                                          w="100%"
                                        >
                                          <Text
                                            fontWeight="700"
                                            color={darkAccent.text}
                                            fontSize="md"
                                            lineHeight="1.4"
                                          >
                                            {achievement.title}
                                          </Text>
                                        </Box>
                                        {achievement.description && (
                                          <Text
                                            color={mutedTextColor}
                                            fontSize="sm"
                                            lineHeight="1.6"
                                            noOfLines={3}
                                          >
                                            {achievement.description}
                                          </Text>
                                        )}
                                      </VStack>
                                    </CardBody>
                                  </Card>
                                );
                              })}
                            </Box>
                            <IconButton
                              icon={<Icon as={FiChevronRight} color="blue.500" />}
                              aria-label="Scroll right"
                              position="absolute"
                              right={-4}
                              top="50%"
                              transform="translateY(-50%)"
                              zIndex={2}
                              bg={cardBg}
                              boxShadow="md"
                              borderRadius="full"
                              size="md"
                              onClick={() => scrollAchievements('next')}
                              _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                            />
                          </Box>
                        ) : (
                          <Box
                            textAlign="center"
                            py={12}
                            px={6}
                            bg={useColorModeValue('gray.50', 'gray.800')}
                            borderRadius="lg"
                            border="2px dashed"
                            borderColor={borderColor}
                          >
                            <Icon
                              as={FiAward}
                              boxSize={12}
                              color={mutedTextColor}
                              mb={3}
                            />
                            <Text color={mutedTextColor} fontStyle="italic" fontSize="sm">
                              No achievements added yet.
                            </Text>
                          </Box>
                        )}
                      </CardBody>
                    </Card>

                    {/* Experience Section - LinkedIn Style Timeline with Dropdown */}
                    <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
                      <CardBody p={0}>
                        <Flex 
                          justify="space-between" 
                          align="center" 
                          p={6}
                          pb={4}
                          cursor="pointer"
                          onClick={onExperienceToggle}
                          _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                          transition="all 0.2s"
                        >
                          <HStack spacing={3}>
                            <Icon 
                              as={isExperienceOpen ? FiChevronDown : FiChevronRight} 
                              color={mutedTextColor}
                              boxSize={5}
                              transition="transform 0.2s"
                            />
                            <Text fontSize="xl" fontWeight="700" color={textColor}>
                              Experience
                            </Text>
                            {profileData?.experiences && profileData.experiences.length > 0 && (
                              <Badge 
                                bg="blue.100" 
                                color="blue.700" 
                                borderRadius="full" 
                                px={2} 
                                py={0.5}
                                fontSize="xs"
                                fontWeight="600"
                              >
                                {profileData.experiences.length}
                              </Badge>
                            )}
                          </HStack>
                          <Button
                            size="sm"
                            leftIcon={<FiPlus />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddExperience();
                            }}
                            borderRadius="md"
                            fontSize="sm"
                            h="32px"
                            px={4}
                            bg="blue.500"
                            color="white"
                            _hover={{ bg: 'blue.600' }}
                          >
                            Add
                          </Button>
                        </Flex>
                        <Collapse in={isExperienceOpen} animateOpacity>
                          <Box px={6} pb={6}>
                            {profileData?.experiences && profileData.experiences.length > 0 ? (
                              <VStack spacing={0} align="stretch" position="relative" pl={8}>
                                {/* Vertical Timeline Line */}
                                <Box
                                  position="absolute"
                                  left="15px"
                                  top="20px"
                                  bottom="20px"
                                  w="2px"
                                  bg={useColorModeValue('blue.200', 'blue.700')}
                                  borderRadius="full"
                                />
                                
                                {[...profileData.experiences]
                                  .map((exp, idx) => ({ ...exp, _originalIndex: idx }))
                                  .sort((a, b) => {
                                    // Sort by isCurrent first (current positions first), then by startDate descending
                                    if (a.isCurrent && !b.isCurrent) return -1;
                                    if (!a.isCurrent && b.isCurrent) return 1;
                                    return new Date(b.startDate) - new Date(a.startDate);
                                  })
                                  .map((experience, index) => {
                                  const duration = experience.isCurrent || !experience.endDate
                                    ? `${new Date(experience.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - Present`
                                    : `${new Date(experience.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${new Date(experience.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
                                  
                                  const startYear = new Date(experience.startDate).getFullYear();
                                  const endYear = experience.isCurrent || !experience.endDate 
                                    ? new Date().getFullYear() 
                                    : new Date(experience.endDate).getFullYear();
                                  const yearsExperience = endYear - startYear;
                                  
                                  return (
                                    <Box 
                                      key={index} 
                                      position="relative" 
                                      pb={8}
                                      _last={{ pb: 0 }}
                                    >
                                      {/* Timeline Dot */}
                                      <Box
                                        position="absolute"
                                        left="-7px"
                                        top="4px"
                                        w="16px"
                                        h="16px"
                                        borderRadius="full"
                                        bg="blue.500"
                                        border="3px solid"
                                        borderColor={cardBg}
                                        zIndex={2}
                                        boxShadow="0 0 0 2px"
                                        boxShadowColor={useColorModeValue('blue.100', 'blue.900')}
                                      />
                                      
                                      {/* Experience Card */}
                                      <Card
                                        bg={useColorModeValue('white', 'gray.700')}
                                        borderRadius="10px"
                                        boxShadow="sm"
                                        border="1px solid"
                                        borderColor={borderColor}
                                        position="relative"
                                        w="50%"
                                        maxW="600px"
                                      >
                                        <HStack
                                          position="absolute"
                                          top={3}
                                          right={3}
                                          zIndex={3}
                                          spacing={1}
                                        >
                                          <IconButton
                                            icon={<FiEdit />}
                                            aria-label="Edit experience"
                                            size="sm"
                                            bg="whiteAlpha.900"
                                            color="blue.500"
                                            borderRadius="md"
                                            onClick={() => handleEditExperience(experience, experience._originalIndex)}
                                            _hover={{ bg: 'blue.50' }}
                                          />
                                          <IconButton
                                            icon={<FiTrash2 />}
                                            aria-label="Delete experience"
                                            size="sm"
                                            bg="whiteAlpha.900"
                                            color="red.500"
                                            borderRadius="md"
                                            onClick={() => handleDeleteExperienceClick(experience._originalIndex)}
                                            _hover={{ bg: 'red.50' }}
                                          />
                                        </HStack>
                                        
                                        <CardBody p={5}>
                                          <VStack align="stretch" spacing={3}>
                                            {/* Header Section */}
                                            <VStack align="start" spacing={2}>
                                              <HStack justify="space-between" w="100%" align="start" pr={20}>
                                                <VStack align="start" spacing={1} flex={1}>
                                                  <HStack spacing={2} align="center" flexWrap="wrap">
                                                    <Text
                                                      fontWeight="500"
                                                      color={textColor}
                                                      fontSize="sm"
                                                      lineHeight="1.4"
                                                    >
                                                      {experience.position}
                                                    </Text>
                                                    {experience.isCurrent && (
                                                      <Badge
                                                        bg="green.50"
                                                        color="green.600"
                                                        borderRadius="full"
                                                        fontSize="xs"
                                                        fontWeight="600"
                                                        px={2}
                                                        py={0.5}
                                                        border="1px solid"
                                                        borderColor="green.200"
                                                      >
                                                        Current
                                                      </Badge>
                                                    )}
                                                  </HStack>
                                                  <HStack spacing={3} flexWrap="wrap">
                                                    <HStack spacing={1}>
                                                      <Icon as={FiCalendar} color={mutedTextColor} boxSize={3.5} />
                                                      <Text color={mutedTextColor} fontSize="xs" fontWeight="500">
                                                        {duration}
                                                      </Text>
                                                      {yearsExperience > 0 && (
                                                        <Text color={mutedTextColor} fontSize="xs">
                                                          • {yearsExperience} {yearsExperience === 1 ? 'yr' : 'yrs'}
                                                        </Text>
                                                      )}
                                                    </HStack>
                                                    {experience.location && (
                                                      <HStack spacing={1}>
                                                        <Icon as={FiMapPin} color={mutedTextColor} boxSize={3.5} />
                                                        <Text color={mutedTextColor} fontSize="xs">
                                                          {experience.location}
                                                        </Text>
                                                      </HStack>
                                                    )}
                                                  </HStack>
                                                </VStack>
                                              </HStack>
                                            </VStack>
                                            
                                            {/* Description */}
                                            {experience.description && (
                                              <Text
                                                color={mutedTextColor}
                                                fontSize="sm"
                                                lineHeight="1.7"
                                                whiteSpace="pre-wrap"
                                              >
                                                {experience.description}
                                              </Text>
                                            )}
                                            
                                            {/* Fitness Coach Details */}
                                            {(experience.clientCount || 
                                              experience.keyResults || 
                                              experience.specializations?.length > 0) && (
                                              <Box pt={3} borderTop="1px solid" borderColor={borderColor}>
                                                {/* Other Details - Compact */}
                                                <SimpleGrid columns={2} spacing={3}>
                                                  {experience.clientCount && (
                                                    <HStack spacing={2}>
                                                      <Icon as={FiUsers} color="blue.500" boxSize={4} />
                                                      <VStack align="start" spacing={0}>
                                                        <Text fontSize="xs" color={mutedTextColor}>
                                                          Clients Trained
                                                        </Text>
                                                        <Text fontSize="sm" fontWeight="600" color={textColor}>
                                                          {experience.clientCount.toLocaleString()}
                                                        </Text>
                                                      </VStack>
                                                    </HStack>
                                                  )}
                                                  
                                                  {experience.specializations?.length > 0 && (
    <Box>
                                                      <Text fontSize="xs" color={mutedTextColor} mb={1}>
                                                        Specializations
                                                      </Text>
                                                      <HStack spacing={1.5} flexWrap="wrap">
                                                        {experience.specializations.slice(0, 2).map((spec, idx) => (
                                                          <Badge
                                                            key={idx}
                                                            bg="blue.50"
                                                            color="blue.600"
                                                            borderRadius="sm"
                                                            px={1.5}
                                                            py={0.5}
                                                            fontSize="xs"
                                                            fontWeight="500"
                                                          >
                                                            {spec}
                                                          </Badge>
                                                        ))}
                                                        {experience.specializations.length > 2 && (
                                                          <Text fontSize="xs" color={mutedTextColor}>
                                                            +{experience.specializations.length - 2}
                                                          </Text>
                                                        )}
                                                      </HStack>
                                                    </Box>
                                                  )}
                                                </SimpleGrid>
                                                
                                                {experience.keyResults && (
                                                  <Box mt={3}>
                                                    <Text fontSize="xs" color={mutedTextColor} mb={1}>
                                                      Key Results
                                                    </Text>
                                                    <Text fontSize="sm" color={textColor} lineHeight="1.5" noOfLines={2}>
                                                      {experience.keyResults}
                                                    </Text>
                                                  </Box>
                                                )}
                                              </Box>
                                            )}
                                          </VStack>
                                        </CardBody>
                                      </Card>
                                    </Box>
                                  );
                                })}
                              </VStack>
                            ) : (
                              <Box
                                textAlign="center"
                                py={12}
                                px={6}
                                bg={useColorModeValue('gray.50', 'gray.800')}
                                borderRadius="lg"
                                border="2px dashed"
                                borderColor={borderColor}
                              >
                                <Icon
                                  as={FiBriefcase}
                                  boxSize={12}
                                  color={mutedTextColor}
                                  mb={3}
                                />
                                <Text color={mutedTextColor} fontStyle="italic" fontSize="sm">
                                  No experience added yet.
                                </Text>
                              </Box>
                            )}
                          </Box>
                        </Collapse>
                      </CardBody>
                    </Card>

                  </VStack>
                </Box>
                )}
              </TabPanel>

              <TabPanel px={0} py={8}>
                {(loading || !imagesLoaded) ? (
                  <Box 
                    minH="400px" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                    maxW="1400px" 
                    mx="auto"
                  >
                    <Spinner 
                      size="xl" 
                      color="blue.500" 
                      thickness="4px"
                      speed="0.65s"
                    />
                  </Box>
                ) : (
                  <Box maxW="1400px" mx="auto" px={4}>
                    <VStack spacing={6} align="stretch">
                      <Box>
                        <Text fontSize="2xl" fontWeight="700" color={textColor} mb={2}>
                          Lead Magnets
                        </Text>
                        <Text color={mutedTextColor} fontSize="sm">
                          Create valuable resources to attract and convert leads. Each lead magnet has its own page that you can share.
                        </Text>
                      </Box>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {LEAD_MAGNETS.map((magnet) => {
                        const magnetData = leadMagnets[magnet.id] || { isEnabled: false, downloads: 0, leads: 0, config: {} };
                        const IconComponent = magnet.icon;
                        const isActive = magnetData.isEnabled;

                        return (
                          <Card
                            key={magnet.id}
                            bg={cardBg}
                            borderRadius="lg"
                            boxShadow="sm"
                            border="1px solid"
                            borderColor={borderColor}
                            overflow="hidden"
                            transition="all 0.2s"
                            _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                          >
                            <CardBody p={6}>
                              <VStack spacing={4} align="stretch">
                                {/* Header */}
                                <HStack justify="space-between" align="start">
                                  <HStack spacing={3}>
                                    <Box
                                      p={3}
                                      borderRadius="lg"
                                      bg={`${magnet.color}.50`}
                                      color={`${magnet.color}.600`}
                                    >
                                      <IconComponent size={24} />
                                    </Box>
                                    <VStack align="start" spacing={0}>
                                      <Text fontSize="lg" fontWeight="700" color={textColor}>
                                        {magnet.name}
                                      </Text>
                                      <Badge
                                        size="sm"
                                        colorScheme={isActive ? 'green' : 'gray'}
                                        borderRadius="full"
                                        px={2}
                                        py={0.5}
                                      >
                                        {isActive ? 'ACTIVE' : 'INACTIVE'}
                                      </Badge>
                                    </VStack>
                                  </HStack>
                                </HStack>

                                {/* Description */}
                                <Text fontSize="sm" color={mutedTextColor} noOfLines={2}>
                                  {magnet.description}
                                </Text>

                                {/* Metrics */}
                                <HStack spacing={4} pt={2} borderTop="1px solid" borderColor={borderColor}>
                                  <VStack spacing={0} align="start">
                                    <Text fontSize="xs" color={mutedTextColor} textTransform="uppercase" letterSpacing="0.5px">
                                      Downloads
                                    </Text>
                                    <Text fontSize="lg" fontWeight="700" color="blue.500">
                                      {magnetData.downloads || 0}
                                    </Text>
                                  </VStack>
                                  <VStack spacing={0} align="start">
                                    <Text fontSize="xs" color={mutedTextColor} textTransform="uppercase" letterSpacing="0.5px">
                                      Leads
                                    </Text>
                                    <Text fontSize="lg" fontWeight="700" color="green.500">
                                      {magnetData.leads || 0}
                                    </Text>
                                  </VStack>
                                </HStack>

                                {/* Actions */}
                                <HStack spacing={2} pt={2}>
                                  <IconButton
                                    icon={<FiEye />}
                                    aria-label="View"
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => {
                                      const url = `${API_BASE_URL}/lead-magnets/${magnet.id}/${user?._id || user?.id}`;
                                      window.open(url, '_blank');
                                    }}
                                  />
                                  <IconButton
                                    icon={<FiEdit />}
                                    aria-label="Setup"
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => {
                                      setEditingLeadMagnet({ ...magnet, data: magnetData });
                                      onLeadMagnetSetupOpen();
                                    }}
                                  />
                                  <IconButton
                                    icon={<FiActivity />}
                                    aria-label="Activity"
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={async () => {
                                      // Fetch activity data
                                      try {
                                        const response = await fetch(`${API_BASE_URL}/api/lead-magnets/interaction-analytics?magnetType=${magnet.id}`, {
                                          headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json',
                                          },
                                        });
                                        if (response.ok) {
                                          const data = await response.json();
                                          setLeadMagnetActivity({ magnet, data: data.data || {} });
                                          onLeadMagnetActivityOpen();
                                        }
                                      } catch (error) {
                                        console.error('Error fetching activity:', error);
                                      }
                                    }}
                                  />
                                  <IconButton
                                    icon={<FiShare2 />}
                                    aria-label="Share"
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => {
                                      const url = `${API_BASE_URL}/lead-magnets/${magnet.id}/${user?._id || user?.id}`;
                                      navigator.clipboard.writeText(url);
                                      toast({
                                        title: 'Link copied!',
                                        description: 'Lead magnet URL copied to clipboard.',
                                        status: 'success',
                                        duration: 2000,
                                        isClosable: true,
                                      });
                                    }}
                                  />
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        );
                      })}
                      </SimpleGrid>
                    </VStack>
                  </Box>
                )}
              </TabPanel>

              <TabPanel px={0} py={8}>
                {(loading || !imagesLoaded || subscriptionLoading) ? (
                  <Box 
                    minH="400px" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center"
                    maxW="1400px" 
                    mx="auto"
                  >
                    <Spinner 
                      size="xl" 
                      color="blue.500" 
                      thickness="4px"
                      speed="0.65s"
                    />
                  </Box>
                ) : (
                  <Box maxW="1400px" mx="auto" px={4}>
                    <VStack spacing={6} align="stretch">
                      <>
                        {/* No Subscription Message */}
                        {!subscription && (
                          <Card bg={cardBg} borderRadius="xl" boxShadow="sm" border="2px solid" borderColor={borderColor}>
                            <CardBody>
                              <VStack spacing={4} py={8}>
                                <Icon as={FiAlertTriangle} boxSize={12} color="orange.500" />
                                <Box textAlign="center">
                                  <Text fontSize="xl" fontWeight="700" color={textColor} mb={2}>
                                    No Active Subscription
                                  </Text>
                                  <Text color={mutedTextColor} mb={4}>
                                    You don't have an active subscription. Please select a plan below to get started.
                                  </Text>
                                  <Button
                                    colorScheme="blue"
                                    size="lg"
                                    onClick={handleUpgrade}
                                  >
                                    View Available Plans
                                  </Button>
                                </Box>
                              </VStack>
                            </CardBody>
                          </Card>
                        )}

                        {/* Current Plan Status */}
                        {subscription && (
                          <>
                            <Card 
                              bg={cardBg} 
                              border="2px solid" 
                              borderColor={subscription.status === 'active' ? 'green.200' : 'red.200'} 
                              borderRadius="xl" 
                              boxShadow="lg"
                            >
                              <CardBody p={0}>
                                <Box
                                  bg={subscription.status === 'active' ? 'green.50' : 'red.50'}
                                  borderRadius="xl"
                                  p={6}
                                  borderBottom="1px solid"
                                  borderColor={borderColor}
                                >
                                  <HStack justify="space-between" align="center">
                                    <HStack spacing={4}>
                                      <Box
                                        p={3}
                                        borderRadius="full"
                                        bg={subscription.status === 'active' ? 'green.100' : 'red.100'}
                                      >
                                        <Icon 
                                          as={subscription.status === 'active' ? FiCheck : FiX} 
                                          boxSize={6} 
                                          color={subscription.status === 'active' ? 'green.600' : 'red.600'} 
                                        />
                                      </Box>
                                      <Box>
                                        <Text fontSize="xl" fontWeight="700" color={textColor}>
                                          {subscription.planId?.name || 'No Active Plan'}
                                        </Text>
                                        <Text fontSize="sm" color={mutedTextColor}>
                                          {subscription.status === 'active' ? 'Active Subscription' : 'Inactive Subscription'}
                                        </Text>
                                      </Box>
                                    </HStack>
                                    <VStack align="end" spacing={1}>
                                      <Badge
                                        colorScheme={getStatusColor(subscription.status)}
                                        fontSize="sm"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                      >
                                        {subscription.status?.toUpperCase() || 'UNKNOWN'}
                                      </Badge>
                                      {subscription.daysUntilExpiry !== undefined && subscription.daysUntilExpiry > 0 && (
                                        <Text fontSize="xs" color={mutedTextColor}>
                                          {subscription.daysUntilExpiry} days remaining
                                        </Text>
                                      )}
                                    </VStack>
                                  </HStack>
                                </Box>
                                
                                <Box p={6}>
                                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                                    {/* Billing Info */}
                                    <Box>
                                      <HStack mb={3}>
                                        <Icon as={FiDollarSign} color="blue.500" boxSize={5} />
                                        <Text fontWeight="600" color={textColor} fontSize="sm">Billing</Text>
                                      </HStack>
                                      <VStack align="stretch" spacing={2}>
                                        <HStack justify="space-between">
                                          <Text fontSize="xs" color={mutedTextColor}>Amount:</Text>
                                          <Text fontSize="xs" fontWeight="600" color={textColor}>
                                            {formatCurrency(subscription.billing?.amount, subscription.billing?.currency)}
                                          </Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                          <Text fontSize="xs" color={mutedTextColor}>Cycle:</Text>
                                          <Text fontSize="xs" fontWeight="600" color={textColor}>
                                            {subscription.billing?.billingCycle || 'N/A'}
                                          </Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                          <Text fontSize="xs" color={mutedTextColor}>Next Billing:</Text>
                                          <Text fontSize="xs" fontWeight="600" color={textColor}>
                                            {formatDate(subscription.billing?.nextBillingDate)}
                                          </Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                          <Text fontSize="xs" color={mutedTextColor}>Payment Status:</Text>
                                          <Badge
                                            colorScheme={subscription.billing?.paymentStatus === 'paid' ? 'green' : 'red'}
                                            size="sm"
                                            fontSize="xs"
                                          >
                                            {subscription.billing?.paymentStatus || 'N/A'}
                                          </Badge>
                                        </HStack>
                                      </VStack>
                                    </Box>

                                    {/* Usage Stats */}
                                    <Box>
                                      <HStack mb={3}>
                                        <Icon as={FiBarChart2} color="green.500" boxSize={5} />
                                        <Text fontWeight="600" color={textColor} fontSize="sm">Usage</Text>
                                      </HStack>
                                      <VStack align="stretch" spacing={3}>
                                        <Box>
                                          <HStack justify="space-between" mb={1}>
                                            <Text fontSize="xs" color={mutedTextColor}>Funnels</Text>
                                            <Text fontSize="xs" fontWeight="600" color={textColor}>
                                              {subscription.usage?.currentFunnels || 0} / {subscription.planId?.features?.maxFunnels === -1 ? '∞' : subscription.planId?.features?.maxFunnels || 0}
                                            </Text>
                                          </HStack>
                                          <Progress
                                            value={getUsagePercentage(
                                              subscription.usage?.currentFunnels || 0,
                                              subscription.planId?.features?.maxFunnels || 1
                                            )}
                                            colorScheme="blue"
                                            size="sm"
                                            borderRadius="md"
                                          />
                                        </Box>
                                        <Box>
                                          <HStack justify="space-between" mb={1}>
                                            <Text fontSize="xs" color={mutedTextColor}>Leads</Text>
                                            <Text fontSize="xs" fontWeight="600" color={textColor}>
                                              {subscription.usage?.currentLeads || 0} / {subscription.limits?.maxLeads === -1 || subscription.planId?.limits?.maxLeads === -1 ? '∞' : (subscription.limits?.maxLeads || subscription.planId?.limits?.maxLeads || 0).toLocaleString()}
                                            </Text>
                                          </HStack>
                                          <Progress
                                            value={getUsagePercentage(
                                              subscription.usage?.currentLeads || 0,
                                              subscription.limits?.maxLeads || subscription.planId?.limits?.maxLeads || 1
                                            )}
                                            colorScheme="green"
                                            size="sm"
                                            borderRadius="md"
                                          />
                                        </Box>
                                        <Box>
                                          <HStack justify="space-between" mb={1}>
                                            <Text fontSize="xs" color={mutedTextColor}>Staff</Text>
                                            <Text fontSize="xs" fontWeight="600" color={textColor}>
                                              {subscription.usage?.currentStaff || 0} / {subscription.planId?.features?.maxStaff === -1 ? '∞' : subscription.planId?.features?.maxStaff || 0}
                                            </Text>
                                          </HStack>
                                          <Progress
                                            value={getUsagePercentage(
                                              subscription.usage?.currentStaff || 0,
                                              subscription.planId?.features?.maxStaff || 1
                                            )}
                                            colorScheme="purple"
                                            size="sm"
                                            borderRadius="md"
                                          />
                                        </Box>
                                      </VStack>
                                    </Box>

                                    {/* Features */}
                                    <Box>
                                      <HStack mb={3}>
                                        <Icon as={FiZap} color="purple.500" boxSize={5} />
                                        <Text fontWeight="600" color={textColor} fontSize="sm">Features</Text>
                                      </HStack>
                                      <VStack align="stretch" spacing={2}>
                                        <HStack justify="space-between">
                                          <Text fontSize="xs" color={mutedTextColor}>AI Features:</Text>
                                          <Icon
                                            as={subscription.planId?.features?.aiFeatures ? FiCheck : FiX}
                                            color={subscription.planId?.features?.aiFeatures ? 'green.500' : 'red.500'}
                                            boxSize={4}
                                          />
                                        </HStack>
                                        <HStack justify="space-between">
                                          <Text fontSize="xs" color={mutedTextColor}>Analytics:</Text>
                                          <Icon
                                            as={subscription.planId?.features?.advancedAnalytics ? FiCheck : FiX}
                                            color={subscription.planId?.features?.advancedAnalytics ? 'green.500' : 'red.500'}
                                            boxSize={4}
                                          />
                                        </HStack>
                                        <HStack justify="space-between">
                                          <Text fontSize="xs" color={mutedTextColor}>Priority Support:</Text>
                                          <Icon
                                            as={subscription.planId?.features?.prioritySupport ? FiCheck : FiX}
                                            color={subscription.planId?.features?.prioritySupport ? 'green.500' : 'red.500'}
                                            boxSize={4}
                                          />
                                        </HStack>
                                        <HStack justify="space-between">
                                          <Text fontSize="xs" color={mutedTextColor}>Custom Domain:</Text>
                                          <Icon
                                            as={subscription.planId?.features?.customDomain ? FiCheck : FiX}
                                            color={subscription.planId?.features?.customDomain ? 'green.500' : 'red.500'}
                                            boxSize={4}
                                          />
                                        </HStack>
                                      </VStack>
                                    </Box>

                                    {/* Quick Actions */}
                                    <Box>
                                      <HStack mb={3}>
                                        <Icon as={FiTrendingUp} color="orange.500" boxSize={5} />
                                        <Text fontWeight="600" color={textColor} fontSize="sm">Actions</Text>
                                      </HStack>
                                      <VStack spacing={2} align="stretch">
                                        <Button
                                          size="sm"
                                          colorScheme="blue"
                                          leftIcon={<FiTrendingUp />}
                                          onClick={handleUpgrade}
                                          isDisabled={subscription.status !== 'active'}
                                          borderRadius="md"
                                          fontSize="xs"
                                          h="32px"
                                        >
                                          Upgrade Plan
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          leftIcon={<FiRefreshCw />}
                                          onClick={handleRenew}
                                          isDisabled={subscription.status !== 'active'}
                                          borderRadius="md"
                                          fontSize="xs"
                                          h="32px"
                                        >
                                          Renew
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          colorScheme="red"
                                          leftIcon={<FiX />}
                                          onClick={onCancelOpen}
                                          isDisabled={subscription.status !== 'active'}
                                          borderRadius="md"
                                          fontSize="xs"
                                          h="32px"
                                        >
                                          Cancel
                                        </Button>
                                      </VStack>
                                    </Box>
                                  </SimpleGrid>
                                </Box>
                              </CardBody>
                            </Card>

                            {/* Detailed Usage */}
                            <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
                              <CardBody p={6}>
                                <HStack justify="space-between" align="center" mb={6}>
                                  <HStack spacing={3}>
                                    <Icon as={FiBarChart2} boxSize={6} color="blue.500" />
                                    <Box>
                                      <Text fontSize="lg" fontWeight="700" color={textColor}>
                                        Current Plan Service Usage
                                      </Text>
                                      <Text fontSize="sm" color={mutedTextColor}>
                                        {subscription?.planId?.name || 'Premium Fitness Coach'} - Used vs Available
                                      </Text>
                                    </Box>
                                  </HStack>
                                  <Button
                                    size="sm"
                                    leftIcon={<FiRefreshCw />}
                                    onClick={loadSubscriptionData}
                                    variant="outline"
                                    colorScheme="blue"
                                    borderRadius="md"
                                    fontSize="xs"
                                    h="32px"
                                  >
                                    Refresh
                                  </Button>
                                </HStack>
                                
                                <VStack spacing={6} align="stretch">
                                  {/* Funnels Usage */}
                                  <Box>
                                    <HStack justify="space-between" mb={2}>
                                      <HStack spacing={2}>
                                        <Icon as={FiTrendingUp} color="blue.500" boxSize={4} />
                                        <Text fontWeight="600" color={textColor} fontSize="sm">Funnels</Text>
                                      </HStack>
                                      <Text fontSize="sm" color={mutedTextColor}>
                                        {subscription?.usage?.currentFunnels || 0} / {subscription?.planId?.features?.maxFunnels === -1 ? '∞' : subscription?.planId?.features?.maxFunnels || 0}
                                      </Text>
                                    </HStack>
                                    <Progress
                                      value={getUsagePercentage(
                                        subscription?.usage?.currentFunnels || 0,
                                        subscription?.planId?.features?.maxFunnels || 1
                                      )}
                                      colorScheme="blue"
                                      size="lg"
                                      borderRadius="md"
                                    />
                                    <HStack justify="space-between" mt={1}>
                                      <Text fontSize="xs" color="green.600">
                                        Used: {subscription?.usage?.currentFunnels || 0}
                                      </Text>
                                      <Text fontSize="xs" color="blue.600">
                                        Remaining: {subscription?.planId?.features?.maxFunnels === -1 ? '∞' : (subscription?.planId?.features?.maxFunnels || 0) - (subscription?.usage?.currentFunnels || 0)}
                                      </Text>
                                    </HStack>
                                  </Box>

                                  {/* Leads Usage */}
                                  <Box>
                                    <HStack justify="space-between" mb={2}>
                                      <HStack spacing={2}>
                                        <Icon as={FiUsers} color="green.500" boxSize={4} />
                                        <Text fontWeight="600" color={textColor} fontSize="sm">Leads</Text>
                                      </HStack>
                                      <Text fontSize="sm" color={mutedTextColor}>
                                        {subscription?.usage?.currentLeads || 0} / {subscription?.planId?.features?.maxLeads === -1 || subscription?.limits?.maxLeads === -1 ? '∞' : (subscription?.limits?.maxLeads || subscription?.planId?.limits?.maxLeads || 0).toLocaleString()}
                                      </Text>
                                    </HStack>
                                    <Progress
                                      value={getUsagePercentage(
                                        subscription?.usage?.currentLeads || 0,
                                        subscription?.limits?.maxLeads || subscription?.planId?.limits?.maxLeads || 1
                                      )}
                                      colorScheme="green"
                                      size="lg"
                                      borderRadius="md"
                                    />
                                    <HStack justify="space-between" mt={1}>
                                      <Text fontSize="xs" color="green.600">
                                        Used: {(subscription?.usage?.currentLeads || 0).toLocaleString()}
                                      </Text>
                                      <Text fontSize="xs" color="blue.600">
                                        Remaining: {subscription?.limits?.maxLeads === -1 || subscription?.planId?.limits?.maxLeads === -1 ? '∞' : ((subscription?.limits?.maxLeads || subscription?.planId?.limits?.maxLeads || 0) - (subscription?.usage?.currentLeads || 0)).toLocaleString()}
                                      </Text>
                                    </HStack>
                                  </Box>

                                  {/* Staff Usage */}
                                  <Box>
                                    <HStack justify="space-between" mb={2}>
                                      <HStack spacing={2}>
                                        <Icon as={FiUsers} color="purple.500" boxSize={4} />
                                        <Text fontWeight="600" color={textColor} fontSize="sm">Team Members</Text>
                                      </HStack>
                                      <Text fontSize="sm" color={mutedTextColor}>
                                        {subscription?.usage?.currentStaff || 0} / {subscription?.planId?.features?.maxStaff === -1 ? '∞' : subscription?.planId?.features?.maxStaff || 0}
                                      </Text>
                                    </HStack>
                                    <Progress
                                      value={getUsagePercentage(
                                        subscription?.usage?.currentStaff || 0,
                                        subscription?.planId?.features?.maxStaff || 1
                                      )}
                                      colorScheme="purple"
                                      size="lg"
                                      borderRadius="md"
                                    />
                                    <HStack justify="space-between" mt={1}>
                                      <Text fontSize="xs" color="green.600">
                                        Used: {subscription?.usage?.currentStaff || 0}
                                      </Text>
                                      <Text fontSize="xs" color="blue.600">
                                        Remaining: {subscription?.planId?.features?.maxStaff === -1 ? '∞' : (subscription?.planId?.features?.maxStaff || 0) - (subscription?.usage?.currentStaff || 0)}
                                      </Text>
                                    </HStack>
                                  </Box>
                                </VStack>
                              </CardBody>
                            </Card>

                            {/* Payment History */}
                            {paymentHistory.length > 0 && (
                              <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
                                <CardBody p={6}>
                                  <HStack spacing={3} mb={4}>
                                    <Icon as={FiFileText} boxSize={6} color="blue.500" />
                                    <Text fontSize="lg" fontWeight="700" color={textColor}>
                                      Payment History
                                    </Text>
                                  </HStack>
                                  <TableContainer>
                                    <Table variant="simple" size="sm">
                                      <Thead>
                                        <Tr>
                                          <Th fontSize="xs" color={mutedTextColor} textTransform="uppercase" letterSpacing="0.5px">Date</Th>
                                          <Th fontSize="xs" color={mutedTextColor} textTransform="uppercase" letterSpacing="0.5px">Amount</Th>
                                          <Th fontSize="xs" color={mutedTextColor} textTransform="uppercase" letterSpacing="0.5px">Status</Th>
                                          <Th fontSize="xs" color={mutedTextColor} textTransform="uppercase" letterSpacing="0.5px">Transaction ID</Th>
                                        </Tr>
                                      </Thead>
                                      <Tbody>
                                        {paymentHistory.map((payment, index) => (
                                          <Tr key={index}>
                                            <Td fontSize="sm">{formatDate(payment.date)}</Td>
                                            <Td fontSize="sm" fontWeight="600">{formatCurrency(payment.amount, payment.currency)}</Td>
                                            <Td>
                                              <Badge colorScheme={payment.status === 'paid' ? 'green' : 'red'} fontSize="xs" borderRadius="md">
                                                {payment.status}
                                              </Badge>
                                            </Td>
                                            <Td fontSize="xs" color={mutedTextColor}>{payment.transactionId || 'N/A'}</Td>
                                          </Tr>
                                        ))}
                                      </Tbody>
                                    </Table>
                                  </TableContainer>
                                </CardBody>
                              </Card>
                            )}
                          </>
                        )}
                      </>
                    </VStack>
                  </Box>
                )}
              </TabPanel>

              <TabPanel px={0} py={8}>
                <Box maxW="1200px" mx="auto">
                  <VStack spacing={6} align="stretch">
                    {/* Sponsor Management */}
                    <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
                      <CardBody p={6}>
                        <Flex justify="space-between" align="center" mb={6}>
                          <Text fontSize="xl" fontWeight="700" color={textColor}>
                            Sponsor Management
                          </Text>
                          <Button 
                            leftIcon={<FiEdit />} 
                            size="sm" 
                            colorScheme="blue"
                            onClick={onSponsorChangeOpen}
                          >
                            Change Sponsor
                          </Button>
                        </Flex>
                        
                        <VStack spacing={4} align="stretch">
                          <HStack justify="space-between">
                            <Text fontSize="sm" color={mutedTextColor}>Current Sponsor:</Text>
                            <Text fontSize="sm" fontWeight="600" color={textColor}>
                              {sponsorDetails?.sponsorId?.name || sponsorDetails?.sponsorId?.selfCoachId || user?.sponsorId || 'Not assigned'}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color={mutedTextColor}>Sponsor Coach ID:</Text>
                            <Text fontSize="sm" fontWeight="600" color={textColor}>
                              {sponsorDetails?.sponsorId?.selfCoachId || 'N/A'}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color={mutedTextColor}>Your Coach ID:</Text>
                            <Text fontSize="sm" fontWeight="600" color={textColor}>
                              {user?.selfCoachId || 'N/A'}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color={mutedTextColor}>Current Level:</Text>
                            <Badge colorScheme="blue" fontSize="xs">
                              Level {user?.currentLevel || 1}
                            </Badge>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Other Settings */}
                    <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
                      <CardBody p={6}>
                        <Text fontSize="xl" fontWeight="700" color={textColor} mb={4}>
                          General Settings
                        </Text>
                        <Text color={mutedTextColor}>
                          Other profile settings and preferences will be displayed here.
                        </Text>
                      </CardBody>
                    </Card>
                  </VStack>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>

      {/* Edit Profile Modal - Redesigned */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent 
          borderRadius="2xl" 
          maxW="800px" 
          h="700px"
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <ModalHeader 
            borderBottom="1px solid" 
            borderColor={borderColor} 
            pb={4}
            fontSize="xl"
            fontWeight="700"
            flexShrink={0}
          >
            Edit Profile
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody 
            p={0} 
            overflowY="auto" 
            flex={1}
            css={{
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: useColorModeValue('#f1f1f1', '#2d3748'),
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: useColorModeValue('#cbd5e0', '#4a5568'),
                borderRadius: '10px',
                '&:hover': {
                  background: useColorModeValue('#a0aec0', '#718096'),
                },
              },
            }}
          >
            <Tabs variant="unstyled" colorScheme="blue">
              <TabList
                borderBottom="1px solid"
                borderColor={borderColor}
                px={6}
                bg={useColorModeValue('gray.50', 'gray.800')}
              >
                <Tab
                  _selected={{
                    color: 'blue.500',
                    borderBottom: '2px solid',
                    borderColor: 'blue.500',
                    fontWeight: '600',
                  }}
                  color={mutedTextColor}
                  fontSize="sm"
                  px={4}
                  py={3}
                  mr={4}
                  transition="all 0.2s"
                >
                  Basic Info
                </Tab>
                <Tab
                  _selected={{
                    color: 'blue.500',
                    borderBottom: '2px solid',
                    borderColor: 'blue.500',
                    fontWeight: '600',
                  }}
                  color={mutedTextColor}
                  fontSize="sm"
                  px={4}
                  py={3}
                  mr={4}
                  transition="all 0.2s"
                >
                  Contact
                </Tab>
                <Tab
                  _selected={{
                    color: 'blue.500',
                    borderBottom: '2px solid',
                    borderColor: 'blue.500',
                    fontWeight: '600',
                  }}
                  color={mutedTextColor}
                  fontSize="sm"
                  px={4}
                  py={3}
                  mr={4}
                  transition="all 0.2s"
                >
                  Location
                </Tab>
                <Tab
                  _selected={{
                    color: 'blue.500',
                    borderBottom: '2px solid',
                    borderColor: 'blue.500',
                    fontWeight: '600',
                  }}
                  color={mutedTextColor}
                  fontSize="sm"
                  px={4}
                  py={3}
                  transition="all 0.2s"
                >
                  Social
                </Tab>
              </TabList>

              <TabPanels>
                {/* Basic Info Tab */}
                <TabPanel px={6} py={6}>
                  <VStack spacing={4} align="stretch">
                    {/* Profile Picture Upload */}
    <Box>
                      <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                        Profile Picture
                      </Text>
                      <HStack spacing={4} align="center">
                        <Avatar
                          size="lg"
                          name={profile.name || 'User'}
                          src={profilePicture}
                          bg="gray.200"
                        />
                        <Box flex={1}>
                          <Button
                            size="sm"
                            variant="outline"
                            borderRadius="md"
                            fontSize="sm"
                            h="40px"
                            onClick={() => fileInputRef.current?.click()}
                            isLoading={uploading}
                            leftIcon={<FiCamera />}
                            borderColor={borderColor}
                            _hover={{ borderColor: 'blue.500', bg: useColorModeValue('blue.50', 'blue.900') }}
                          >
                            {uploading ? 'Uploading...' : 'Change Picture'}
                          </Button>
                          <Text fontSize="xs" color={mutedTextColor} mt={1}>
                            JPG, PNG or GIF. Max size 5MB
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                        Full Name
                      </Text>
                      <Input
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        placeholder="Enter your full name"
                        borderRadius="md"
                        borderColor={borderColor}
                        fontSize="sm"
                        h="40px"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                      />
                    </Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                        Tagline
                      </Text>
                      <Input
                        value={editData.tagline || ''}
                        onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                        placeholder="Your professional tagline (e.g., Fitness Coach & Nutrition Expert)"
                        borderRadius="md"
                        borderColor={borderColor}
                        fontSize="sm"
                        h="40px"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                      />
                    </Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                        Bio
                      </Text>
                      <Textarea
                        value={editData.bio || ''}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        placeholder="Tell us about yourself"
                        borderRadius="md"
                        borderColor={borderColor}
                        fontSize="sm"
                        rows={3}
                        resize="none"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                      />
                    </Box>
                    <HStack spacing={4}>
                      <Box flex={1}>
                        <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                          Company
                        </Text>
                        <Input
                          value={editData.company || ''}
                          onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                          placeholder="Company name"
                          borderRadius="md"
                          borderColor={borderColor}
                          fontSize="sm"
                          h="40px"
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                        />
                      </Box>
                      <Box flex={1}>
                        <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                          Date of Birth
                        </Text>
                        <Input
                          type="date"
                          value={editData.dateOfBirth ? new Date(editData.dateOfBirth).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const dateValue = e.target.value;
                            setEditData({ ...editData, dateOfBirth: dateValue });
                            // Calculate age automatically
                            if (dateValue) {
                              const birthDate = new Date(dateValue);
                              const today = new Date();
                              let age = today.getFullYear() - birthDate.getFullYear();
                              const monthDiff = today.getMonth() - birthDate.getMonth();
                              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                age--;
                              }
                              setEditData(prev => ({ ...prev, dateOfBirth: dateValue, age: age }));
                            }
                          }}
                          max={new Date().toISOString().split('T')[0]}
                          borderRadius="md"
                          borderColor={borderColor}
                          fontSize="sm"
                          h="40px"
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                        />
                      </Box>
                    </HStack>
                  </VStack>
                </TabPanel>

                {/* Contact Tab */}
                <TabPanel px={6} py={6}>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                        Phone Number
                      </Text>
                      <Input
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        placeholder="+1 234-567-8900"
                        borderRadius="md"
                        borderColor={borderColor}
                        fontSize="sm"
                        h="40px"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                      />
                    </Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                        Website
                      </Text>
                      <Input
                        value={editData.website || ''}
                        onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                        placeholder="https://yourwebsite.com"
                        borderRadius="md"
                        borderColor={borderColor}
                        fontSize="sm"
                        h="40px"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                      />
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Location Tab */}
                <TabPanel px={6} py={6}>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={4}>
                      <Box flex={1}>
                        <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                          State
                        </Text>
                        <Input
                          value={editData.state || ''}
                          onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                          placeholder="State"
                          borderRadius="md"
                          borderColor={borderColor}
                          fontSize="sm"
                          h="40px"
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                        />
                      </Box>
                      <Box flex={1}>
                        <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                          Country
                        </Text>
                        <Select
                          value={editData.country || ''}
                          onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                          placeholder="Select country"
                          borderRadius="md"
                          borderColor={borderColor}
                          fontSize="sm"
                          h="40px"
                          bg={useColorModeValue('white', 'gray.800')}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                          _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                        >
                          {COUNTRIES.map((country) => (
                            <option key={country.code} value={country.name}>
                              {country.name}
                            </option>
                          ))}
                        </Select>
                        {editData.country && getCountryFlagUrl(editData.country) && (
                          <HStack spacing={2} mt={2}>
                            <Box
                              as="img"
                              src={getCountryFlagUrl(editData.country)}
                              alt={editData.country}
                              w="24px"
                              h="18px"
                              objectFit="cover"
                              borderRadius="2px"
                              border="1px solid"
                              borderColor={borderColor}
                            />
                            <Text fontSize="xs" color={mutedTextColor}>
                              Selected: {editData.country}
                            </Text>
                          </HStack>
                        )}
                      </Box>
                    </HStack>
                  </VStack>
                </TabPanel>

                {/* Social Media Tab */}
                <TabPanel px={6} py={6}>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                        LinkedIn
                      </Text>
                      <Input
                        value={editData.linkedin || ''}
                        onChange={(e) => setEditData({ ...editData, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/yourprofile"
                        borderRadius="md"
                        borderColor={borderColor}
                        fontSize="sm"
                        h="40px"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                      />
                    </Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                        Twitter
                      </Text>
                      <Input
                        value={editData.twitter || ''}
                        onChange={(e) => setEditData({ ...editData, twitter: e.target.value })}
                        placeholder="https://twitter.com/yourhandle"
                        borderRadius="md"
                        borderColor={borderColor}
                        fontSize="sm"
                        h="40px"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                      />
                    </Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                        Facebook
                      </Text>
                      <Input
                        value={editData.facebook || ''}
                        onChange={(e) => setEditData({ ...editData, facebook: e.target.value })}
                        placeholder="https://facebook.com/yourprofile"
                        borderRadius="md"
                        borderColor={borderColor}
                        fontSize="sm"
                        h="40px"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                      />
                    </Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                        Instagram
                      </Text>
                      <Input
                        value={editData.instagram || ''}
                        onChange={(e) => setEditData({ ...editData, instagram: e.target.value })}
                        placeholder="https://instagram.com/yourhandle"
                        borderRadius="md"
                        borderColor={borderColor}
                        fontSize="sm"
                        h="40px"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                      />
                    </Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                        YouTube
                      </Text>
                      <Input
                        value={editData.youtube || ''}
                        onChange={(e) => setEditData({ ...editData, youtube: e.target.value })}
                        placeholder="https://youtube.com/@yourchannel"
                        borderRadius="md"
                        borderColor={borderColor}
                        fontSize="sm"
                        h="40px"
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                        _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                      />
                    </Box>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter
            borderTop="1px solid"
            borderColor={borderColor}
            pt={4}
            px={6}
            pb={6}
            flexShrink={0}
          >
            <HStack spacing={3} w="100%" justify="flex-end">
              <Button
                variant="ghost"
                onClick={onEditClose}
                borderRadius="7px"
                fontWeight="500"
                fontSize="sm"
                h="38px"
                px={4}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                isLoading={loading}
                borderRadius="7px"
                fontWeight="600"
                fontSize="sm"
                h="38px"
                px={6}
                bg="blue.500"
                color="white"
                _hover={{ bg: 'blue.600' }}
                _active={{ bg: 'blue.700' }}
                transition="all 0.2s"
              >
                Save Changes
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Achievement Edit Modal - Single Item */}
      <Modal isOpen={isAchievementsOpen} onClose={() => { setEditingAchievement(null); onAchievementsClose(); }} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent 
          borderRadius="2xl" 
          maxW="800px" 
          maxH="90vh"
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <ModalHeader 
            borderBottom="1px solid" 
            borderColor={borderColor} 
            pb={4}
            fontSize="xl"
            fontWeight="700"
            flexShrink={0}
          >
            {editingAchievement?._index !== undefined ? 'Edit Achievement' : 'Add Achievement'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody 
            p={6} 
            overflowY="auto" 
            flex={1}
            css={{
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: useColorModeValue('#f1f1f1', '#2d3748'),
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: useColorModeValue('#cbd5e0', '#4a5568'),
                borderRadius: '10px',
                '&:hover': {
                  background: useColorModeValue('#a0aec0', '#718096'),
                },
              },
            }}
          >
            {editingAchievement && (
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color={mutedTextColor} mb={2}>
                  You can add up to 10 achievements. Each achievement can have an image, title, and description.
                </Text>
                
                <Box>
                  <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                    Image
                  </Text>
                  <HStack spacing={3}>
                    {editingAchievement.image && (
                      <Box
                        w="80px"
                        h="80px"
                        borderRadius="md"
                        overflow="hidden"
                        bg="gray.200"
                        flexShrink={0}
                      >
                        <img
                          src={editingAchievement.image}
                          alt={editingAchievement.title || 'Achievement'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    )}
                    <Box flex={1}>
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => (achievementImageInputRefs.current.editing = el)}
                        style={{ display: 'none' }}
                        onChange={handleAchievementImageUpload}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        borderRadius="md"
                        fontSize="sm"
                        h="36px"
                        onClick={() => achievementImageInputRefs.current.editing?.click()}
                        isLoading={uploadingAchievementImages.editing}
                        leftIcon={<FiCamera />}
                        borderColor={borderColor}
                        _hover={{ borderColor: 'blue.500', bg: useColorModeValue('blue.50', 'blue.900') }}
                      >
                        {editingAchievement.image ? 'Change Image' : 'Upload Image'}
                      </Button>
                      <Text fontSize="xs" color={mutedTextColor} mt={1}>
                        JPG, PNG or GIF. Max size 5MB
                      </Text>
                    </Box>
                  </HStack>
                </Box>
                
                <Box>
                  <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                    Title *
                  </Text>
                  <Input
                    value={editingAchievement.title || ''}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, title: e.target.value })}
                    placeholder="Enter achievement title"
                    borderRadius="md"
                    borderColor={borderColor}
                    fontSize="sm"
                    h="40px"
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                  />
                </Box>
                
                <Box>
                  <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                    Description
                  </Text>
                  <Textarea
                    value={editingAchievement.description || ''}
                    onChange={(e) => setEditingAchievement({ ...editingAchievement, description: e.target.value })}
                    placeholder="Enter achievement description"
                    borderRadius="md"
                    borderColor={borderColor}
                    fontSize="sm"
                    rows={3}
                    resize="none"
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                  />
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter
            borderTop="1px solid"
            borderColor={borderColor}
            pt={4}
            px={6}
            pb={6}
            flexShrink={0}
          >
            <HStack spacing={3} w="100%" justify="flex-end">
              <Button
                variant="ghost"
                onClick={() => { setEditingAchievement(null); onAchievementsClose(); }}
                borderRadius="7px"
                fontWeight="500"
                fontSize="sm"
                h="38px"
                px={4}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAchievement}
                isLoading={loading}
                borderRadius="7px"
                fontWeight="600"
                fontSize="sm"
                h="38px"
                px={6}
                bg="blue.500"
                color="white"
                _hover={{ bg: 'blue.600' }}
                _active={{ bg: 'blue.700' }}
                transition="all 0.2s"
              >
                Save
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Experience Edit Modal - Single Item */}
      <Modal isOpen={isExperiencesOpen} onClose={() => { setEditingExperience(null); onExperiencesClose(); }} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent 
          borderRadius="2xl" 
          maxW="800px" 
          maxH="90vh"
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <ModalHeader 
            borderBottom="1px solid" 
            borderColor={borderColor} 
            pb={4}
            fontSize="xl"
            fontWeight="700"
            flexShrink={0}
          >
            {editingExperience?._index !== undefined ? 'Edit Experience' : 'Add Experience'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody 
            p={6} 
            overflowY="auto" 
            flex={1}
            css={{
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: useColorModeValue('#f1f1f1', '#2d3748'),
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: useColorModeValue('#cbd5e0', '#4a5568'),
                borderRadius: '10px',
                '&:hover': {
                  background: useColorModeValue('#a0aec0', '#718096'),
                },
              },
            }}
          >
            {editingExperience && (
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color={mutedTextColor} mb={2}>
                  Add your coaching experience. Highlight the programs you've created.
                </Text>
                
                <Box>
                  <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                    Program Name *
                  </Text>
                  <Input
                    value={editingExperience.position || ''}
                    onChange={(e) => setEditingExperience({ ...editingExperience, position: e.target.value })}
                    placeholder="e.g., 12-Week Transformation Program"
                    borderRadius="md"
                    borderColor={borderColor}
                    fontSize="sm"
                    h="40px"
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                  />
                </Box>
                
                <HStack spacing={3}>
                  <Box flex={1}>
                    <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                      Start Date *
                    </Text>
                    <Input
                      type="date"
                      value={editingExperience.startDate ? new Date(editingExperience.startDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditingExperience({ ...editingExperience, startDate: e.target.value })}
                      borderRadius="md"
                      borderColor={borderColor}
                      fontSize="sm"
                      h="40px"
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                      _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                    />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                      End Date
                    </Text>
                    <Input
                      type="date"
                      value={editingExperience.endDate ? new Date(editingExperience.endDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        setEditingExperience({ 
                          ...editingExperience, 
                          endDate: e.target.value,
                          isCurrent: e.target.value ? false : editingExperience.isCurrent
                        });
                      }}
                      isDisabled={editingExperience.isCurrent}
                      borderRadius="md"
                      borderColor={borderColor}
                      fontSize="sm"
                      h="40px"
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                      _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                    />
                  </Box>
                </HStack>
                
                <Box>
                  <Checkbox
                    isChecked={editingExperience.isCurrent || false}
                    onChange={(e) => {
                      setEditingExperience({ 
                        ...editingExperience, 
                        isCurrent: e.target.checked,
                        endDate: e.target.checked ? null : editingExperience.endDate
                      });
                    }}
                    colorScheme="blue"
                  >
                    <Text fontSize="sm" color={textColor}>
                      I currently work here
                    </Text>
                  </Checkbox>
                </Box>
                
                <Box>
                  <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                    Location
                  </Text>
                  <Input
                    value={editingExperience.location || ''}
                    onChange={(e) => setEditingExperience({ ...editingExperience, location: e.target.value })}
                    placeholder="e.g., New York, NY or Online"
                    borderRadius="md"
                    borderColor={borderColor}
                    fontSize="sm"
                    h="40px"
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                  />
                </Box>
                
                <Box>
                  <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                    Description
                  </Text>
                  <Textarea
                    value={editingExperience.description || ''}
                    onChange={(e) => setEditingExperience({ ...editingExperience, description: e.target.value })}
                    placeholder="Describe your role and achievements"
                    borderRadius="md"
                    borderColor={borderColor}
                    fontSize="sm"
                    rows={3}
                    resize="none"
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                  />
                </Box>
                
                <Divider />
                
                <Text fontSize="sm" fontWeight="700" color={textColor} mb={2}>
                  Coaching Details
                </Text>
                
                <HStack spacing={3}>
                  <Box flex={1}>
                    <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                      Clients Trained
                    </Text>
                    <Input
                      type="number"
                      value={editingExperience.clientCount || ''}
                      onChange={(e) => setEditingExperience({ ...editingExperience, clientCount: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="e.g., 150"
                      borderRadius="md"
                      borderColor={borderColor}
                      fontSize="sm"
                      h="40px"
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                      _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                    />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                      Specializations
                    </Text>
                    <Input
                      value={Array.isArray(editingExperience.specializations) ? editingExperience.specializations.join(', ') : (editingExperience.specializations || '')}
                      onChange={(e) => {
                        const values = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                        setEditingExperience({ ...editingExperience, specializations: values });
                      }}
                      placeholder="e.g., Strength Training, Weight Loss"
                      borderRadius="md"
                      borderColor={borderColor}
                      fontSize="sm"
                      h="40px"
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                      _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                    />
                  </Box>
                </HStack>
                
                <Box>
                  <Text fontSize="xs" fontWeight="600" color={mutedTextColor} mb={1.5} textTransform="uppercase" letterSpacing="0.5px">
                    Key Results & Achievements
                  </Text>
                  <Textarea
                    value={editingExperience.keyResults || ''}
                    onChange={(e) => setEditingExperience({ ...editingExperience, keyResults: e.target.value })}
                    placeholder="e.g., Helped 200+ clients achieve their fitness goals, Achieved 95% client retention rate"
                    borderRadius="md"
                    borderColor={borderColor}
                    fontSize="sm"
                    rows={3}
                    resize="none"
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                    _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                  />
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter
            borderTop="1px solid"
            borderColor={borderColor}
            pt={4}
            px={6}
            pb={6}
            flexShrink={0}
          >
            <HStack spacing={3} w="100%" justify="flex-end">
              <Button
                variant="ghost"
                onClick={() => { setEditingExperience(null); onExperiencesClose(); }}
                borderRadius="7px"
                fontWeight="500"
                fontSize="sm"
                h="38px"
                px={4}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveExperience}
                isLoading={loading}
                borderRadius="7px"
                fontWeight="600"
                fontSize="sm"
                h="38px"
                px={6}
                bg="blue.500"
                color="white"
                _hover={{ bg: 'blue.600' }}
                _active={{ bg: 'blue.700' }}
                transition="all 0.2s"
              >
                Save
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Achievement Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAchievementOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={onDeleteAchievementClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <AlertDialogContent borderRadius="xl" maxW="400px">
          <AlertDialogHeader fontSize="lg" fontWeight="700" pb={2}>
            Delete Achievement
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text color={mutedTextColor} fontSize="sm">
              Are you sure you want to delete this achievement? This action cannot be undone.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <HStack spacing={3} w="100%" justify="flex-end">
              <Button
                ref={cancelDeleteRef}
                onClick={onDeleteAchievementClose}
                variant="ghost"
                borderRadius="7px"
                fontWeight="500"
                fontSize="sm"
                h="36px"
                px={4}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAchievement}
                isLoading={loading}
                bg="red.500"
                color="white"
                borderRadius="7px"
                fontWeight="600"
                fontSize="sm"
                h="36px"
                px={5}
                _hover={{ bg: 'red.600' }}
                _active={{ bg: 'red.700' }}
                transition="all 0.2s"
              >
                Delete
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Experience Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteExperienceOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={onDeleteExperienceClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <AlertDialogContent borderRadius="xl" maxW="400px">
          <AlertDialogHeader fontSize="lg" fontWeight="700" pb={2}>
            Delete Experience
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text color={mutedTextColor} fontSize="sm">
              Are you sure you want to delete this experience? This action cannot be undone.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <HStack spacing={3} w="100%" justify="flex-end">
              <Button
                ref={cancelDeleteRef}
                onClick={onDeleteExperienceClose}
                variant="ghost"
                borderRadius="7px"
                fontWeight="500"
                fontSize="sm"
                h="36px"
                px={4}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteExperience}
                isLoading={loading}
                bg="red.500"
                color="white"
                borderRadius="7px"
                fontWeight="600"
                fontSize="sm"
                h="36px"
                px={5}
                _hover={{ bg: 'red.600' }}
                _active={{ bg: 'red.700' }}
                transition="all 0.2s"
              >
                Delete
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lead Magnet Setup Modal */}
      <Modal isOpen={isLeadMagnetSetupOpen} onClose={onLeadMagnetSetupClose} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" maxW="800px" maxH="90vh" display="flex" flexDirection="column" overflow="hidden">
          <ModalHeader borderBottom="1px solid" borderColor={borderColor} pb={4} fontSize="xl" fontWeight="700" flexShrink={0}>
            Setup {editingLeadMagnet?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            p={6}
            overflowY="auto"
            flex={1}
            css={{
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: useColorModeValue('#f1f1f1', '#2d3748'),
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: useColorModeValue('#cbd5e0', '#4a5568'),
                borderRadius: '10px',
                '&:hover': {
                  background: useColorModeValue('#a0aec0', '#718096'),
                },
              },
            }}
          >
            {editingLeadMagnet && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Checkbox
                    isChecked={editingLeadMagnet.data?.isEnabled || false}
                    onChange={(e) => {
                      setEditingLeadMagnet({
                        ...editingLeadMagnet,
                        data: { ...editingLeadMagnet.data, isEnabled: e.target.checked },
                      });
                    }}
                    colorScheme="blue"
                    size="lg"
                  >
                    <Text fontSize="md" fontWeight="600" color={textColor}>
                      Enable {editingLeadMagnet.name}
                    </Text>
                  </Checkbox>
                  <Text fontSize="xs" color={mutedTextColor} mt={1} ml={6}>
                    When enabled, your lead magnet will be accessible at a public URL
                  </Text>
                </Box>

                {editingLeadMagnet.id === 'fitness_ebook' && (
                  <Box>
                    <Text fontSize="sm" fontWeight="700" color={textColor} mb={3}>
                      Ebooks
                    </Text>
                    <VStack spacing={3} align="stretch">
                      {(editingLeadMagnet.data?.config?.ebooks || []).map((ebook, index) => (
                        <Card key={index} bg={useColorModeValue('gray.50', 'gray.700')} p={3}>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="600" fontSize="sm">{ebook.title || 'Untitled Ebook'}</Text>
                              <Text fontSize="xs" color={mutedTextColor}>{ebook.category || 'No category'}</Text>
                            </VStack>
                            <IconButton icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost" />
                          </HStack>
                        </Card>
                      ))}
                      <Button
                        leftIcon={<FiPlus />}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const ebooks = editingLeadMagnet.data?.config?.ebooks || [];
                          setEditingLeadMagnet({
                            ...editingLeadMagnet,
                            data: {
                              ...editingLeadMagnet.data,
                              config: {
                                ...editingLeadMagnet.data.config,
                                ebooks: [...ebooks, { title: '', category: '', file: null }],
                              },
                            },
                          });
                        }}
                      >
                        Add Ebook
                      </Button>
                    </VStack>
                  </Box>
                )}

                <Divider />

                <Box>
                  <Text fontSize="sm" fontWeight="700" color={textColor} mb={2}>
                    Share URL
                  </Text>
                  <HStack spacing={2}>
                    <Input
                      value={editingLeadMagnet?.id ? `${API_BASE_URL}/lead-magnets/${editingLeadMagnet.id}/${user?._id || user?.id}` : ''}
                      isReadOnly
                      fontSize="sm"
                      bg={useColorModeValue('gray.50', 'gray.700')}
                    />
                    <IconButton
                      icon={<FiCopy />}
                      aria-label="Copy URL"
                      onClick={() => {
                        const url = `${API_BASE_URL}/lead-magnets/${editingLeadMagnet.id}/${user?._id || user?.id}`;
                        navigator.clipboard.writeText(url);
                        toast({
                          title: 'URL copied!',
                          status: 'success',
                          duration: 2000,
                          isClosable: true,
                        });
                      }}
                    />
                  </HStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor} pt={4} px={6} pb={6} flexShrink={0}>
            <HStack spacing={3} w="100%" justify="flex-end">
              <Button
                variant="ghost"
                onClick={onLeadMagnetSetupClose}
                borderRadius="7px"
                fontWeight="500"
                fontSize="sm"
                h="38px"
                px={4}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setLoading(true);
                    const response = await fetch(`${API_BASE_URL}/api/lead-magnets/coach`, {
                      method: 'PUT',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        leadMagnetSettings: {
                          [editingLeadMagnet.id]: editingLeadMagnet.data,
                        },
                      }),
                    });
                    if (response.ok) {
                      const data = await response.json();
                      setLeadMagnets((prev) => ({
                        ...prev,
                        [editingLeadMagnet.id]: editingLeadMagnet.data,
                      }));
                      toast({
                        title: 'Success',
                        description: 'Lead magnet settings updated successfully.',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                      });
                      onLeadMagnetSetupClose();
                    }
                  } catch (error) {
                    console.error('Error updating lead magnet:', error);
                    toast({
                      title: 'Error',
                      description: 'Failed to update lead magnet settings.',
                      status: 'error',
                      duration: 3000,
                      isClosable: true,
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
                isLoading={loading}
                borderRadius="7px"
                fontWeight="600"
                fontSize="sm"
                h="38px"
                px={6}
                bg="blue.500"
                color="white"
                _hover={{ bg: 'blue.600' }}
                _active={{ bg: 'blue.700' }}
                transition="all 0.2s"
              >
                Save Changes
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Lead Magnet Activity Modal */}
      <Modal isOpen={isLeadMagnetActivityOpen} onClose={onLeadMagnetActivityClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" maxW="700px" maxH="90vh" display="flex" flexDirection="column" overflow="hidden">
          <ModalHeader borderBottom="1px solid" borderColor={borderColor} pb={4} fontSize="xl" fontWeight="700" flexShrink={0}>
            {leadMagnetActivity?.magnet?.name} Activity
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            p={6}
            overflowY="auto"
            flex={1}
            css={{
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: useColorModeValue('#f1f1f1', '#2d3748'),
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: useColorModeValue('#cbd5e0', '#4a5568'),
                borderRadius: '10px',
                '&:hover': {
                  background: useColorModeValue('#a0aec0', '#718096'),
                },
              },
            }}
          >
            {leadMagnetActivity && (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Card bg={useColorModeValue('blue.50', 'blue.900')} p={4}>
                    <VStack spacing={1} align="start">
                      <Text fontSize="xs" color={mutedTextColor} textTransform="uppercase">
                        Total Views
                      </Text>
                      <Text fontSize="2xl" fontWeight="700" color="blue.500">
                        {leadMagnetActivity.data?.totalViews || 0}
                      </Text>
                    </VStack>
                  </Card>
                  <Card bg={useColorModeValue('green.50', 'green.900')} p={4}>
                    <VStack spacing={1} align="start">
                      <Text fontSize="xs" color={mutedTextColor} textTransform="uppercase">
                        Conversions
                      </Text>
                      <Text fontSize="2xl" fontWeight="700" color="green.500">
                        {leadMagnetActivity.data?.conversions || 0}
                      </Text>
                    </VStack>
                  </Card>
                </SimpleGrid>
                <Text fontSize="sm" color={mutedTextColor} fontStyle="italic">
                  Detailed analytics and activity logs will be displayed here.
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor} pt={4} px={6} pb={6} flexShrink={0}>
            <Button
              onClick={onLeadMagnetActivityClose}
              borderRadius="7px"
              fontWeight="500"
              fontSize="sm"
              h="38px"
              px={4}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cancel Subscription Modal */}
      <Modal isOpen={isCancelOpen} onClose={onCancelClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" maxW="500px">
          <ModalHeader borderBottom="1px solid" borderColor={borderColor} pb={4} fontSize="xl" fontWeight="700">
            Cancel Subscription
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  Are you sure you want to cancel your subscription? This action cannot be undone.
                </AlertDescription>
              </Alert>
              <FormControl>
                <FormLabel fontSize="xs" fontWeight="600" color={mutedTextColor} textTransform="uppercase" letterSpacing="0.5px">
                  Reason for Cancellation (Optional)
                </FormLabel>
                <Textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please let us know why you're cancelling..."
                  rows={4}
                  borderRadius="md"
                  borderColor={borderColor}
                  fontSize="sm"
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor} pt={4} px={6} pb={6}>
            <HStack spacing={3} w="100%" justify="flex-end">
              <Button
                variant="ghost"
                onClick={onCancelClose}
                borderRadius="7px"
                fontWeight="500"
                fontSize="sm"
                h="38px"
                px={4}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                Keep Subscription
              </Button>
              <Button
                colorScheme="red"
                onClick={handleCancelSubscription}
                isLoading={loading}
                borderRadius="7px"
                fontWeight="600"
                fontSize="sm"
                h="38px"
                px={6}
                _hover={{ bg: 'red.600' }}
                _active={{ bg: 'red.700' }}
              >
                Cancel Subscription
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Sponsor Change Modal */}
      <Modal isOpen={isSponsorChangeOpen} onClose={onSponsorChangeClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <ModalHeader pb={2}>
            <VStack spacing={3} align="start">
              <Flex align="center" gap={3}>
                <Box
                  w="12px"
                  h="12px"
                  bg="blue.500"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={FiUser} boxSize={6} color="blue.500" />
                </Box>
                <Text fontSize="lg" fontWeight="600" color={textColor}>
                  Change Sponsor ID
                </Text>
              </Flex>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
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
                  resize="none"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor={borderColor} py={4}>
            <HStack spacing={3} w="full">
              <Button
                variant="outline"
                onClick={onSponsorChangeClose}
                flex={1}
                borderRadius="lg"
                fontWeight="500"
                borderColor={borderColor}
                _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
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
    </Box>
  );
};

export default Profile;
