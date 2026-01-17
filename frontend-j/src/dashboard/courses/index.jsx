import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/authUtils';
import { API_BASE_URL } from '../../config/apiConfig';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
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
  Textarea,
  Select,
  SimpleGrid,
  Icon,
  Spinner,
  Center,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  Divider,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';
import {
  FiBook,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiBarChart,
  FiRefreshCw,
  FiMoreVertical,
  FiFileText,
  FiCopy,
  FiShoppingCart,
  FiSettings,
  FiDownload,
  FiUpload
} from 'react-icons/fi';

const Courses = () => {
  const navigate = useNavigate();
  const authState = useSelector(state => state.auth);
  const user = authState?.user;
  const token = getToken(authState);
  const toast = useToast();
  
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // State management
  const [myCourses, setMyCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]); // From subscription plan
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    activeCourses: 0
  });
  
  // Modal states
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isRemixOpen, onOpen: onRemixOpen, onClose: onRemixClose } = useDisclosure();
  
  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    courseType: 'general_module_course',
    price: '',
    currency: 'USD',
    category: 'customer_course', // Coaches can only create customer courses
    thumbnail: ''
  });
  
  const [remixForm, setRemixForm] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    copyModules: true,
    copyContent: true
  });
  
  // Load data
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMyCourses(),
        loadSubscription(),
        loadAvailableCourses()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function for fetch with timeout and error handling
  const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server is taking too long to respond');
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
      }
      throw error;
    }
  };

  const loadMyCourses = async () => {
    if (!token) {
      console.warn('No token available for loading courses');
      return;
    }

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/content/coach/courses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, 10000);
      
      if (response.ok) {
        const data = await response.json();
        const courses = data.data?.courses || [];
        // Filter only courses created by this coach
        const coachCourses = courses.filter(c => {
          if (!c) return false;
          const courseCreatorId = c.createdBy?._id || c.createdBy;
          const userId = user?._id || user?.id;
          // If createdBy is not set, include it if it's a customer_course (coaches can only create customer courses)
          if (!courseCreatorId && c.category === 'customer_course') {
            return true; // Include courses without createdBy if they're customer courses
          }
          return courseCreatorId?.toString() === userId?.toString();
        });
        
        // Sort by creation date (newest first)
        const sortedCourses = coachCourses.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.updatedAt || 0);
          const dateB = new Date(b.createdAt || b.updatedAt || 0);
          return dateB - dateA;
        });
        
        setMyCourses(sortedCourses);
        calculateAnalytics(sortedCourses);
      } else {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        console.error('Error loading my courses:', errorData.message || `HTTP ${response.status}`);
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: 'Your session has expired. Please log in again.',
            status: 'error',
            duration: 5000,
            isClosable: true
          });
        }
      }
    } catch (error) {
      console.error('Error loading my courses:', error);
      toast({
        title: 'Error Loading Courses',
        description: error.message || 'Failed to load your courses. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  const loadSubscription = async () => {
    if (!token) {
      console.warn('No token available for loading subscription');
      return;
    }

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/subscriptions/current`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, 10000);
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.data);
      } else {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        console.error('Error loading subscription:', errorData.message || `HTTP ${response.status}`);
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: 'Your session has expired. Please log in again.',
            status: 'error',
            duration: 5000,
            isClosable: true
          });
        }
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      // Don't show toast for subscription errors as it's not critical
    }
  };
  
  const loadAvailableCourses = async () => {
    if (!token) {
      console.warn('No token available for loading available courses');
      setAvailableCourses([]);
      return;
    }

    try {
      // Use the new available-courses endpoint
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/content/coach/available-courses?limit=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }, 10000);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailableCourses(data.data?.courses || []);
        } else {
          console.error('Error loading available courses:', data.message);
          setAvailableCourses([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        console.error('Error loading available courses:', errorData.message || `HTTP ${response.status}`);
        setAvailableCourses([]);
        if (response.status === 401) {
          toast({
            title: 'Authentication Error',
            description: 'Your session has expired. Please log in again.',
            status: 'error',
            duration: 5000,
            isClosable: true
          });
        }
      }
    } catch (error) {
      console.error('Error loading available courses:', error);
      setAvailableCourses([]);
      // Only show toast if it's a network error, not for 404s or other expected errors
      if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
        toast({
          title: 'Connection Error',
          description: error.message || 'Unable to connect to the server. Please check your internet connection.',
          status: 'warning',
          duration: 5000,
          isClosable: true
        });
      }
    }
  };
  
  // Reload available courses when subscription changes
  useEffect(() => {
    if (subscription) {
      loadAvailableCourses();
    }
  }, [subscription]);
  
  const calculateAnalytics = (coursesData) => {
    const totalCourses = coursesData.length;
    const activeCourses = coursesData.filter(c => c.status === 'published').length;
    const totalRevenue = coursesData.reduce((sum, course) => {
      return sum + (course.price || 0);
    }, 0);
    
    setAnalytics({
      totalCourses,
      totalStudents: 0, // Would need backend data
      totalRevenue,
      activeCourses
    });
  };
  
  const handleCreateCourse = async () => {
    try {
      // Ensure category is customer_course
      const courseData = {
        ...courseForm,
        category: 'customer_course'
      };
      
      const response = await fetch(`${API_BASE_URL}/api/content/coach/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
      });
      
      if (response.ok) {
        const responseData = await response.json();
        const newCourse = responseData.data?.course || responseData.data;
        
        console.log('Course created successfully:', newCourse);
        
        toast({
          title: 'Success',
          description: 'Course created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        onCreateClose();
        setCourseForm({
          title: '',
          description: '',
          courseType: 'general_module_course',
          price: '',
          currency: 'USD',
          category: 'customer_course',
          thumbnail: ''
        });
        
        // Switch to "My Courses" tab to show the newly created course
        setActiveTab('my-courses');
        
        // Add the new course immediately to state (optimistic update)
        if (newCourse && newCourse._id) {
          setMyCourses(prevCourses => {
            // Check if course already exists to avoid duplicates
            const exists = prevCourses.some(c => c._id === newCourse._id);
            if (!exists) {
              console.log('Adding new course to state:', newCourse);
              // Ensure createdBy is set for filtering
              const courseWithCreator = {
                ...newCourse,
                createdBy: newCourse.createdBy || user?._id || user?.id,
                category: newCourse.category || 'customer_course'
              };
              const updatedCourses = [courseWithCreator, ...prevCourses];
              // Update analytics with new courses list
              calculateAnalytics(updatedCourses);
              return updatedCourses;
            }
            return prevCourses;
          });
        }
        
        // Reload courses from API to ensure we have the latest data
        // Use a small delay to allow backend to process
        setTimeout(async () => {
          await loadMyCourses();
        }, 500);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create course');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleRemixCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      // First, create a new course
      const newCourseData = {
        title: remixForm.title || `${selectedCourse.title} (Remix)`,
        description: remixForm.description || selectedCourse.description || '',
        courseType: selectedCourse.courseType || 'general_module_course',
        price: parseFloat(remixForm.price) || selectedCourse.price || 0,
        currency: remixForm.currency || selectedCourse.currency || 'USD',
        category: 'customer_course',
        thumbnail: selectedCourse.thumbnail || ''
      };
      
      const createResponse = await fetchWithTimeout(`${API_BASE_URL}/api/content/coach/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newCourseData)
      }, 10000);
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create remixed course');
      }
      
      const createData = await createResponse.json();
      const newCourseId = createData.data._id || createData.data.course?._id;
      
      // If copyModules is true, copy modules and content
      if (remixForm.copyModules && selectedCourse.modules) {
        // Fetch full course details with modules
        const courseDetailsResponse = await fetchWithTimeout(`${API_BASE_URL}/api/content/coach/courses/${selectedCourse._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }, 10000);
        
        if (courseDetailsResponse.ok) {
          const courseDetails = await courseDetailsResponse.json();
          const modules = courseDetails.data?.course?.modules || courseDetails.data?.modules || [];
          
          // Copy each module
          for (const module of modules) {
            const moduleData = {
              title: module.title || '',
              description: module.description || '',
              day: module.day || 1,
              order: module.order || 0
            };
            
            const moduleResponse = await fetchWithTimeout(`${API_BASE_URL}/api/content/coach/courses/${newCourseId}/modules`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(moduleData)
            }, 10000);
            
            if (moduleResponse.ok && remixForm.copyContent) {
              const moduleResponseData = await moduleResponse.json();
              const newModuleId = moduleResponseData.data._id || moduleResponseData.data.module?._id;
              
              // Copy content items
              const contents = module.contents || [];
              for (const content of contents) {
                const contentData = {
                  title: content.title || '',
                  description: content.description || '',
                  contentType: content.contentType || 'video',
                  content: content.content || content.contentUrl || '',
                  order: content.order || 0
                };
                
                await fetchWithTimeout(`${API_BASE_URL}/api/content/coach/modules/${newModuleId}/contents`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify(contentData)
                }, 10000);
              }
            }
          }
        }
      }
      
      toast({
        title: 'Success',
        description: 'Course remixed successfully. Opening editor...',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onRemixClose();
      setRemixForm({
        title: '',
        description: '',
        price: '',
        currency: 'USD',
        copyModules: true,
        copyContent: true
      });
      setSelectedCourse(null);
      
      // Navigate to edit page (similar to admin panel)
      navigate(`/courses/${newCourseId}/edit`);
    } catch (error) {
      console.error('Error remixing course:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remix course',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const openRemixModal = async (course) => {
    try {
      // Fetch full course details
      const response = await fetch(`${API_BASE_URL}/api/content/coach/courses/${course._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const fullCourse = data.data?.course || data.data;
        setSelectedCourse(fullCourse);
        setRemixForm({
          title: `${fullCourse.title} (Remix)`,
          description: fullCourse.description || '',
          price: fullCourse.price || '',
          currency: fullCourse.currency || 'USD',
          copyModules: true,
          copyContent: true
        });
        onRemixOpen();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load course details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const openViewModal = async (course) => {
    // Open course purchase page in new tab
    const coursePurchaseUrl = `${API_BASE_URL}/api/course-purchase/${course._id}`;
    window.open(coursePurchaseUrl, '_blank');
  };
  
  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'green';
      case 'draft': return 'yellow';
      case 'archived': return 'gray';
      default: return 'gray';
    }
  };
  
  const getCourseTypeLabel = (type) => {
    switch (type) {
      case 'workout_routine': return 'Workout Routine';
      case 'meal_plan': return 'Meal Plan';
      case 'general_module_course': return 'General Course';
      default: return type;
    }
  };
  
  if (loading && myCourses.length === 0 && availableCourses.length === 0) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }
  
  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="7xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <Box>
              <Heading size="xl" color={textColor} mb={2}>
                Courses & Content
              </Heading>
              <Text color={mutedTextColor} fontSize="lg">
                Manage your courses, resell available courses, and create new content
              </Text>
            </Box>
            <HStack spacing={3}>
              <Button
                leftIcon={<FiRefreshCw />}
                onClick={loadData}
                variant="outline"
                size="sm"
                colorScheme="blue"
              >
                Refresh
              </Button>
              <Button
                leftIcon={<FiPlus />}
                onClick={onCreateOpen}
                colorScheme="blue"
                size="sm"
              >
                Create Course
              </Button>
            </HStack>
          </HStack>
          
          {/* Analytics Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg={cardBg} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color={mutedTextColor}>My Courses</StatLabel>
                  <StatNumber color={textColor}>{analytics.totalCourses}</StatNumber>
                  <StatHelpText color="green.500">
                    Active: {analytics.activeCourses}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color={mutedTextColor}>Available Courses</StatLabel>
                  <StatNumber color={textColor}>{availableCourses.length}</StatNumber>
                  <StatHelpText color="blue.500">
                    From Subscription
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color={mutedTextColor}>Total Revenue</StatLabel>
                  <StatNumber color={textColor}>{formatCurrency(analytics.totalRevenue)}</StatNumber>
                  <StatHelpText color="green.500">
                    All Time
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel color={mutedTextColor}>Active Courses</StatLabel>
                  <StatNumber color={textColor}>{analytics.activeCourses}</StatNumber>
                  <StatHelpText color="green.500">
                    Published
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {/* Tabs */}
          <Tabs index={activeTab === 'available' ? 0 : 1} onChange={(index) => setActiveTab(index === 0 ? 'available' : 'my-courses')}>
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FiShoppingCart} />
                  <Text>Available Courses</Text>
                  {availableCourses.length > 0 && (
                    <Badge colorScheme="blue">{availableCourses.length}</Badge>
                  )}
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FiBook} />
                  <Text>My Courses</Text>
                  {myCourses.length > 0 && (
                    <Badge colorScheme="green">{myCourses.length}</Badge>
                  )}
                </HStack>
              </Tab>
            </TabList>
            
            <TabPanels>
              {/* Available Courses Tab */}
              <TabPanel px={0}>
                {availableCourses.length === 0 ? (
                  <Card bg={cardBg} boxShadow="md">
                    <CardBody>
                      <Center py={10}>
                        <VStack spacing={4}>
                          <Icon as={FiShoppingCart} boxSize={12} color={mutedTextColor} />
                          <Text color={mutedTextColor} fontSize="lg">
                            No available courses
                          </Text>
                          <Text color={mutedTextColor} fontSize="sm" textAlign="center">
                            {subscription 
                              ? 'Your subscription plan does not include any courses yet.'
                              : 'Subscribe to a plan to get access to courses.'}
                          </Text>
                        </VStack>
                      </Center>
                    </CardBody>
                  </Card>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {availableCourses.map((course) => (
                      <Card key={course._id} bg={cardBg} boxShadow="md" _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
                        {course.thumbnail && (
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            h="200px"
                            w="100%"
                            objectFit="cover"
                            borderTopRadius="md"
                          />
                        )}
                        <CardHeader>
                          <HStack justify="space-between" align="start">
                            <Box flex={1}>
                              <Heading size="md" color={textColor} mb={2}>
                                {course.title}
                              </Heading>
                              <HStack spacing={2} mb={2}>
                                <Badge colorScheme={getStatusColor(course.status)}>
                                  {course.status}
                                </Badge>
                                {course.canResell && (
                                  <Badge colorScheme="green" variant="outline">Can Resell</Badge>
                                )}
                                {course.canRemix && (
                                  <Badge colorScheme="purple" variant="outline">Can Remix</Badge>
                                )}
                              </HStack>
                            </Box>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FiMoreVertical />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem icon={<FiEye />} onClick={() => openViewModal(course)}>
                                  View Details
                                </MenuItem>
                                {course.canRemix && (
                                  <MenuItem icon={<FiCopy />} onClick={() => openRemixModal(course)}>
                                    Remix Course
                                  </MenuItem>
                                )}
                              </MenuList>
                            </Menu>
                          </HStack>
                        </CardHeader>
                        <CardBody pt={0}>
                          <VStack align="stretch" spacing={3}>
                            <Text color={mutedTextColor} fontSize="sm" noOfLines={2}>
                              {course.description || 'No description'}
                            </Text>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color={mutedTextColor}>
                                Type: {getCourseTypeLabel(course.courseType)}
                              </Text>
                              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                {formatCurrency(course.suggestedPrice || course.price, course.currency)}
                              </Text>
                            </HStack>
                            {course.modules && (
                              <Text fontSize="xs" color={mutedTextColor}>
                                {course.modules.length} Modules
                              </Text>
                            )}
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                variant="outline"
                                onClick={() => openViewModal(course)}
                                flex={1}
                              >
                                View
                              </Button>
                              {course.canRemix && (
                                <Button
                                  size="sm"
                                  colorScheme="purple"
                                  leftIcon={<FiCopy />}
                                  onClick={() => openRemixModal(course)}
                                  flex={1}
                                >
                                  Remix
                                </Button>
                              )}
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>
              
              {/* My Courses Tab */}
              <TabPanel px={0}>
                {myCourses.length === 0 ? (
                  <Card bg={cardBg} boxShadow="md">
                    <CardBody>
                      <Center py={10}>
                        <VStack spacing={4}>
                          <Icon as={FiBook} boxSize={12} color={mutedTextColor} />
                          <Text color={mutedTextColor} fontSize="lg">
                            No courses created yet
                          </Text>
                          <Button
                            leftIcon={<FiPlus />}
                            onClick={onCreateOpen}
                            colorScheme="blue"
                          >
                            Create Your First Course
                          </Button>
                        </VStack>
                      </Center>
                    </CardBody>
                  </Card>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {myCourses.map((course) => (
                      <Card key={course._id} bg={cardBg} boxShadow="md" _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
                        {course.thumbnail && (
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            h="200px"
                            w="100%"
                            objectFit="cover"
                            borderTopRadius="md"
                          />
                        )}
                        <CardHeader>
                          <HStack justify="space-between" align="start">
                            <Box flex={1}>
                              <Heading size="md" color={textColor} mb={2}>
                                {course.title}
                              </Heading>
                              <Badge colorScheme={getStatusColor(course.status)}>
                                {course.status}
                              </Badge>
                            </Box>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FiMoreVertical />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem icon={<FiEye />} onClick={() => openViewModal(course)}>
                                  View Details
                                </MenuItem>
                                <MenuItem icon={<FiEdit />} onClick={() => navigate(`/courses/${course._id}/edit`)}>
                                  Edit
                                </MenuItem>
                                <MenuItem icon={<FiTrash2 />} color="red.500">
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </CardHeader>
                        <CardBody pt={0}>
                          <VStack align="stretch" spacing={3}>
                            <Text color={mutedTextColor} fontSize="sm" noOfLines={2}>
                              {course.description || 'No description'}
                            </Text>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color={mutedTextColor}>
                                Type: {getCourseTypeLabel(course.courseType)}
                              </Text>
                              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                {formatCurrency(course.price, course.currency)}
                              </Text>
                            </HStack>
                            {course.modules && (
                              <Text fontSize="xs" color={mutedTextColor}>
                                {course.modules.length} Modules
                              </Text>
                            )}
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => navigate(`/courses/${course._id}/edit`)}
                              w="full"
                            >
                              Manage Course
                            </Button>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
      
      {/* Create Course Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Course</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  Coaches can only create customer courses. All courses will be set to customer_course category.
                </AlertDescription>
              </Alert>
              
              <FormControl isRequired>
                <FormLabel>Course Title</FormLabel>
                <Input
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="Enter course title"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Enter course description"
                  rows={4}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Course Type</FormLabel>
                <Select
                  value={courseForm.courseType}
                  onChange={(e) => setCourseForm({ ...courseForm, courseType: e.target.value })}
                >
                  <option value="workout_routine">Workout Routine</option>
                  <option value="meal_plan">Meal Plan</option>
                  <option value="general_module_course">General Course</option>
                </Select>
              </FormControl>
              
              <HStack>
                <FormControl isRequired>
                  <FormLabel>Price</FormLabel>
                  <NumberInput
                    value={courseForm.price}
                    onChange={(value) => setCourseForm({ ...courseForm, price: value })}
                    min={0}
                    precision={2}
                  >
                    <NumberInputField placeholder="0.00" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    value={courseForm.currency}
                    onChange={(e) => setCourseForm({ ...courseForm, currency: e.target.value })}
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                  </Select>
                </FormControl>
              </HStack>
              
              <FormControl>
                <FormLabel>Thumbnail URL</FormLabel>
                <Input
                  value={courseForm.thumbnail}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                  placeholder="Enter thumbnail URL"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateCourse}>
              Create Course
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Remix Course Modal */}
      <Modal isOpen={isRemixOpen} onClose={onRemixClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Remix Course</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedCourse && (
              <VStack spacing={4} align="stretch">
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>
                    Create a new course based on "{selectedCourse.title}". You can copy all modules and content automatically.
                  </AlertDescription>
                </Alert>
                
                <FormControl isRequired>
                  <FormLabel>Course Title</FormLabel>
                  <Input
                    value={remixForm.title}
                    onChange={(e) => setRemixForm({ ...remixForm, title: e.target.value })}
                    placeholder="Enter course title"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={remixForm.description}
                    onChange={(e) => setRemixForm({ ...remixForm, description: e.target.value })}
                    placeholder="Enter course description"
                    rows={4}
                  />
                </FormControl>
                
                <HStack>
                  <FormControl isRequired>
                    <FormLabel>Price</FormLabel>
                    <NumberInput
                      value={remixForm.price}
                      onChange={(value) => setRemixForm({ ...remixForm, price: value })}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField placeholder="0.00" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      value={remixForm.currency}
                      onChange={(e) => setRemixForm({ ...remixForm, currency: e.target.value })}
                    >
                      <option value="USD">USD</option>
                      <option value="INR">INR</option>
                      <option value="EUR">EUR</option>
                    </Select>
                  </FormControl>
                </HStack>
                
                <Divider />
                
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <FormLabel mb={0}>Copy Modules</FormLabel>
                    <Text fontSize="sm" color={mutedTextColor}>
                      Copy all modules from the original course
                    </Text>
                  </Box>
                  <Switch
                    isChecked={remixForm.copyModules}
                    onChange={(e) => setRemixForm({ ...remixForm, copyModules: e.target.checked })}
                    colorScheme="blue"
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <FormLabel mb={0}>Copy Content</FormLabel>
                    <Text fontSize="sm" color={mutedTextColor}>
                      Copy all content items from modules (requires Copy Modules)
                    </Text>
                  </Box>
                  <Switch
                    isChecked={remixForm.copyContent}
                    onChange={(e) => setRemixForm({ ...remixForm, copyContent: e.target.checked })}
                    isDisabled={!remixForm.copyModules}
                    colorScheme="blue"
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRemixClose}>
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={handleRemixCourse}>
              Remix Course
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
    </Box>
  );
};

export default Courses;
