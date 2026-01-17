import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

import { getCoachId, getToken, isAuthenticated, debugAuthState } from '../../utils/authUtils';

import { API_BASE_URL } from '../../config/apiConfig';

import {

  Box, Flex, Text, Button, Input, InputGroup, InputLeftElement, 

  Grid, GridItem, Badge, Avatar, Select, Textarea, useDisclosure,

  HStack, VStack, Divider, IconButton, Menu, MenuButton, MenuList, MenuItem,

  Alert, AlertIcon, AlertTitle, AlertDescription, useToast,

  Skeleton, SkeletonText, Card, CardBody, CardHeader, Heading,

  SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow,

  Tabs, TabList, TabPanels, Tab, TabPanel, 

  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,

  FormControl, FormLabel, FormErrorMessage,

  Tooltip, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody,

  useColorModeValue, Container, Spacer, Tag, TagLabel, TagCloseButton,

  Progress, CircularProgress, Center, Wrap, WrapItem,

  Stack, ButtonGroup, Switch, Spinner, ScaleFade, Collapse,

  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,

  MenuDivider, Table, TableContainer, Thead, Tbody, Tr, Th, Td

} from '@chakra-ui/react';

import {

  SearchIcon, AddIcon, EditIcon, DeleteIcon, CalendarIcon, TimeIcon,

  ViewIcon, SettingsIcon, ChevronLeftIcon, ChevronRightIcon, 

  RepeatIcon, CheckCircleIcon, WarningIcon, InfoIcon,

  ChatIcon, PhoneIcon, EmailIcon, StarIcon, ArrowForwardIcon,

  ArrowBackIcon, ExternalLinkIcon, CloseIcon, SmallAddIcon,

  ChevronUpIcon, ChevronDownIcon, CopyIcon

} from '@chakra-ui/icons';

import { 

  FiFileText, FiUser, FiMail, FiPhone, FiCalendar, FiFilter, FiUpload,

  FiEye, FiEdit, FiTrash2, FiCopy, FiUsers, FiMoreVertical, 

  FiPlay, FiPause, FiBarChart2, FiTrendingUp, FiTarget, FiGlobe,

  FiClock, FiMap , FiChevronDown 

} from 'react-icons/fi';



// Helper function to get appointment color based on lead type

const getAppointmentColor = (appointment, leadsData = []) => {

  if (!appointment) return 'blue';

  

  // If appointment has leadId, find the lead in leadsData

  if (appointment.leadId && leadsData.length > 0) {

    const lead = leadsData.find(l => {

      const leadId = l._id || l.id;

      return leadId === appointment.leadId;

    });

    

    if (lead) {

      const leadType = getLeadType(lead);

      return leadType === 'Client' ? 'red' : 'blue'; // Red for clients, Blue for coaches

    }

  }

  

  // If appointment has direct lead data

  if (appointment.lead) {

    const leadType = getLeadType(appointment.lead);

    return leadType === 'Client' ? 'red' : 'blue';

  }

  

  // Default fallback - assume coach if no lead data

  return 'blue';

};





const identifyAppointmentType = (appointment, leadsData = []) => {

  let lead = null;



  // Find the lead associated with this appointment

  if (appointment.leadId && leadsData.length > 0) {

    lead = leadsData.find(l => {

      const leadId = l._id || l.id;

      return leadId === appointment.leadId;

    });

  } else if (appointment.lead) {

    lead = appointment.lead;

  }



  if (!lead) return 'unknown';



  // Determine if this is a Coach or Client lead

  const leadType = getLeadType(lead);

  return leadType.toLowerCase(); // Returns 'coach' or 'client'

};





const filterAppointmentsByType = (appointments, appointmentType, leadsData = []) => {

  if (appointmentType === 'all') {

    return appointments;

  }

  

  const filtered = appointments.filter(appointment => {

    const identifiedType = identifyAppointmentType(appointment, leadsData);

    

    // Now we can properly filter by appointment type

    return identifiedType === appointmentType.toLowerCase();

  });

  

  return filtered;

};

// FIXED Timezone handling utilities

const getTimezoneOffset = (timezone) => {

  const timezoneOffsets = {

    'Asia/Kolkata': 5.5 * 60, // IST is UTC+5:30

    'America/New_York': -5 * 60, // EST is UTC-5

    'America/Chicago': -6 * 60, // CST is UTC-6

    'UTC': 0

  };

  return timezoneOffsets[timezone] || 0;

};



// FIXED: Proper timezone conversion

const convertToTimezone = (utcDateTime, timezone = 'Asia/Kolkata') => {

  if (!utcDateTime) return null;

  

  try {

    const date = new Date(utcDateTime);

    if (isNaN(date.getTime())) return null;

    

    // Use proper Intl.DateTimeFormat for timezone conversion

    return new Intl.DateTimeFormat('en-CA', {

      timeZone: timezone,

      year: 'numeric',

      month: '2-digit',

      day: '2-digit'

    }).format(date);

  } catch (error) {

    console.error('Timezone conversion error:', error);

    return null;

  }

};



const formatTimeWithTimezone = (utcDateTime, timezone = 'Asia/Kolkata') => {

  if (!utcDateTime) return 'Invalid Time';

  

  try {

    const date = new Date(utcDateTime);

    if (isNaN(date.getTime())) return 'Invalid Time';

    

    return new Intl.DateTimeFormat('en-IN', {

      hour: '2-digit',

      minute: '2-digit',

      hour12: true,

      timeZone: timezone

    }).format(date);

  } catch (error) {

    console.error('Time formatting error:', error);

    return 'Invalid Time';

  }

};



const formatDateWithTimezone = (utcDateTime, timezone = 'Asia/Kolkata') => {

  if (!utcDateTime) return 'Invalid Date';

  

  try {

    const date = new Date(utcDateTime);

    if (isNaN(date.getTime())) return 'Invalid Date';

    

    return new Intl.DateTimeFormat('en-IN', {

      year: 'numeric',

      month: 'short',

      day: 'numeric',

      timeZone: timezone

    }).format(date);

  } catch (error) {

    console.error('Date formatting error:', error);

    return 'Invalid Date';

  }

};



// FIXED: Get proper local date string for comparison

const getLocalDateString = (date) => {

  if (!date) return null;

  

  try {

    if (typeof date === 'string') {

      date = new Date(date);

    }

    if (isNaN(date.getTime())) return null;

    

    // Return YYYY-MM-DD format in local timezone

    return date.getFullYear() + '-' + 

           String(date.getMonth() + 1).padStart(2, '0') + '-' + 

           String(date.getDate()).padStart(2, '0');

  } catch (error) {

    console.error('Error getting local date string:', error);

    return null;

  }

};



// Helper function to determine lead type

const getLeadType = (lead) => {

  if (!lead) return 'Unknown';

  

  // Check if lead has client questions data

  if (lead.clientQuestions && Object.keys(lead.clientQuestions).length > 0) {

    return 'Client';

  }

  

  // Check if lead has coach questions data

  if (lead.coachQuestions && Object.keys(lead.coachQuestions).length > 0) {

    return 'Coach';

  }

  

  // Check if lead has both or neither, default to Client for now

  return 'Client';

};



// Helper function to get lead type badge color

const getLeadTypeColor = (leadType) => {

  switch (leadType) {

    case 'Client':

      return 'blue';

    case 'Coach':

      return 'green';

    default:

      return 'gray';

  }

};



// --- BEAUTIFUL SKELETON COMPONENTS ---

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



        {/* Professional Calendar Skeleton */}

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

            <VStack spacing={4} align="stretch">

              {[...Array(7)].map((_, rowIndex) => (

                <HStack key={rowIndex} spacing={4} justify="space-between" p={4}>

                  {[...Array(5)].map((_, cellIndex) => (

                    <VStack key={cellIndex} spacing={2} align="center" flex={1}>

                      <Skeleton height="20px" width="80px" borderRadius="md" />

                      <Skeleton height="60px" width="100%" borderRadius="lg" />

                    </VStack>

                  ))}

                </HStack>

              ))}

            </VStack>

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

              Loading calendar data...

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

  

  return useCallback((message, status = 'info') => {

    const statusConfig = {

      success: {

        title: 'Success',

        bg: 'white',

        borderColor: 'green.200',

        iconColor: 'green.500',

        titleColor: 'green.700',

        textColor: 'gray.700',

        icon: CheckCircleIcon

      },

      error: {

        title: 'Error',

        bg: 'white',

        borderColor: 'red.200',

        iconColor: 'red.500',

        titleColor: 'red.700',

        textColor: 'gray.700',

        icon: WarningIcon

      },

      warning: {

        title: 'Warning',

        bg: 'white',

        borderColor: 'orange.200',

        iconColor: 'orange.500',

        titleColor: 'orange.700',

        textColor: 'gray.700',

        icon: WarningIcon

      },

      info: {

        title: 'Info',

        bg: 'white',

        borderColor: 'blue.200',

        iconColor: 'blue.500',

        titleColor: 'blue.700',

        textColor: 'gray.700',

        icon: InfoIcon

      }

    };



    const config = statusConfig[status] || statusConfig.success;

    const IconComponent = config.icon;

    

    toast({

      title: config.title,

      description: message,

      status,

      duration: 4000,

      isClosable: true,

      position: 'top-right',

      variant: 'subtle',

      containerStyle: {

        maxWidth: '400px',

      },

      render: ({ title, description, onClose }) => (

        <Box

          bg={config.bg}

          border="1px solid"

          borderColor={config.borderColor}

          borderRadius="7px"

          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"

            p={4}

          display="flex"

          alignItems="flex-start"

          gap={3}

          minW="320px"

          maxW="400px"

        >

          <Box

            as={IconComponent}

            color={config.iconColor}

            boxSize={5}

            mt={0.5}

            flexShrink={0}

          />

          <VStack align="start" spacing={1} flex={1}>

            <Text

              fontSize="sm"

              fontWeight="600"

              color={config.titleColor}

            >

              {title}

            </Text>

            <Text

              fontSize="sm"

              color={config.textColor}

              lineHeight="1.5"

            >

              {description}

              </Text>

          </VStack>

          <IconButton

            aria-label="Close"

            icon={<CloseIcon />}

            size="xs"

            variant="ghost"

            onClick={onClose}

            color="gray.400"

            _hover={{ color: 'gray.600', bg: 'gray.50' }}

            borderRadius="7px"

            flexShrink={0}

          />

        </Box>

      ),

    });

  }, [toast]);

};



// --- BEAUTIFUL STATS CARDS ---

// StatsCard component moved to line 728 to avoid hooks issues



// Beautiful Status Badge Component - Compact Version

const StatusBadge = ({ status, compact = false }) => {

  const getStatusProps = (status) => {

    switch (status?.toLowerCase()) {

      case 'confirmed':

        return { colorScheme: 'green', icon: '✓', emoji: '✅' };

      case 'pending':

        return { colorScheme: 'yellow', icon: '⏱', emoji: '⏰' };

      case 'canceled':

        return { colorScheme: 'red', icon: '✕', emoji: '❌' };

      case 'completed':

        return { colorScheme: 'blue', icon: '✓', emoji: '✅' };

      case 'no-show':

        return { colorScheme: 'gray', icon: '⚠', emoji: '⚠️' };

      default:

        return { colorScheme: 'blue', icon: '✓', emoji: '✅' };

    }

  };



  const { colorScheme, icon, emoji } = getStatusProps(status);

  

  if (compact) {

    return (

      <Box

        fontSize="xs"

        color={`${colorScheme}.600`}

        fontWeight="bold"

        title={status || 'confirmed'}

      >

        {icon}

      </Box>

    );

  }

  

  return (

    <Badge 

      colorScheme={colorScheme} 

      variant="subtle" 

      px={2} 

      py={0.5} 

      borderRadius="md"

      fontSize="xs"

    >

      <HStack spacing={1}>

        <Text>{emoji}</Text>

        <Text fontWeight="medium" textTransform="capitalize">

          {status || 'confirmed'}

        </Text>

      </HStack>

    </Badge>

  );

};



// Beautiful Time Slot Component

const TimeSlot = ({ slot, onClick, isSelected }) => {

  const bgColor = useColorModeValue('green.50', 'green.900');

  const borderColor = useColorModeValue('green.200', 'green.600');

  const hoverBg = useColorModeValue('green.100', 'green.800');



  return (

    <Box

      as="button"

      onClick={onClick}

      p={2}

      bg={isSelected ? 'green.100' : bgColor}

      border="1px solid"

      borderColor={borderColor}

      borderRadius="md"

      _hover={{ bg: hoverBg, transform: 'scale(1.02)' }}

      transition="all 0.2s"

      w="full"

      textAlign="center"

    >

      <VStack spacing={1} fontSize="xs">

        <Text fontWeight="bold" color="green.600">

          {slot.displayTime}

        </Text>

        <Text color="gray.600">

          {slot.duration || 30}m

        </Text>

      </VStack>

    </Box>

  );

};



// Beautiful Appointment Card Component

const AppointmentCard = ({ appointment, onClick, onEdit, onDelete, leads = [], getStaffDisplayName }) => {

  const bgColor = useColorModeValue('white', 'gray.700');

  const appointmentColor = getAppointmentColor(appointment, leads);

  const borderColor = useColorModeValue(`${appointmentColor}.200`, `${appointmentColor}.600`);

  

  // Get lead type for this appointment

  const leadType = getLeadType(appointment.lead);

  const leadTypeColor = getLeadTypeColor(leadType);

  

  // Get staff assignment from lead or appointment

  const assignedStaff = appointment.lead?.assignedTo || appointment.assignedTo;



  return (

    <Card

      size="sm"

      bg={bgColor}

      borderLeft="4px solid"

      borderLeftColor={borderColor}  // Now uses dynamic color

      _hover={{ shadow: 'md', transform: 'translateY(-1px)' }}

      transition="all 0.2s"

      cursor="pointer"

      onClick={onClick}

    >

      <CardBody p={3}>

        <VStack align="start" spacing={2}>

          <HStack justify="space-between" w="full">

            <Text fontSize="sm" fontWeight="bold" color={`${appointmentColor}.600`}>  {/* Dynamic color */}

              {appointment.displayTime}

            </Text>

            <StatusBadge status={appointment.status} />

          </HStack>

          

          <HStack justify="space-between" w="full">

            <Text fontSize="xs" color="gray.600" noOfLines={1}>

              {appointment.title || 'Appointment'}

            </Text>

            <Badge colorScheme={leadTypeColor} size="sm" fontSize="xs">

              {leadType}

            </Badge>

          </HStack>

          

          {/* Staff Assignment Display */}

          {assignedStaff && getStaffDisplayName && (

            <HStack spacing={1} w="full">

              <Box as={FiUser} fontSize="xs" color="purple.500" />

              <Text fontSize="xs" color="purple.600" fontWeight="medium" noOfLines={1}>

                {getStaffDisplayName(assignedStaff)}

              </Text>

            </HStack>

          )}

          

          <HStack spacing={1}>

            <TimeIcon fontSize="xs" color="gray.400" />

            <Text fontSize="xs" color="gray.500">

              {appointment.duration || 30}min

            </Text>

          </HStack>



          <HStack spacing={1} onClick={(e) => e.stopPropagation()}>

            <IconButton

              size="xs"

              variant="ghost"

              icon={<EditIcon />}

              onClick={(e) => {

                e.stopPropagation();

                onEdit(appointment);

              }}

              title="Edit"

            />

            <IconButton

              size="xs"

              variant="ghost"

              colorScheme="red"

              icon={<DeleteIcon />}

              onClick={(e) => {

                e.stopPropagation();

                onDelete(appointment.id || appointment._id);

              }}

              title="Delete"

            />

          </HStack>

        </VStack>

      </CardBody>

    </Card>

  );

};





// --- BEAUTIFUL CONFIRMATION MODAL ---

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {

  return (

    <Modal isOpen={isOpen} onClose={onClose} isCentered>

      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />

      <ModalContent borderRadius="2xl">

        <ModalHeader>{title}</ModalHeader>

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

            Delete Appointment

          </Button>

        </ModalFooter>

      </ModalContent>

    </Modal>

  );

};



// Stats Card Component - defined outside to avoid hooks issues

const StatsCard = ({ title, value, icon, color = "blue" }) => {

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

            <Text fontSize="xl" fontWeight="700" color={`${color}.800`}>

              {value}

            </Text>

          </VStack>

        </HStack>

      </CardBody>

    </Card>

  );

};



// Main Component

const ComprehensiveCoachCalendar = () => {

  // Add CSS to hide scrollbars while keeping scroll functionality

  useEffect(() => {

    const style = document.createElement('style');

    style.textContent = `

      .hide-scrollbar {

        scrollbar-width: none; /* Firefox */

        -ms-overflow-style: none; /* Internet Explorer 10+ */

      }

      .hide-scrollbar::-webkit-scrollbar {

        display: none; /* WebKit */

      }

    `;

    document.head.appendChild(style);

    

    return () => {

      document.head.removeChild(style);

    };

  }, []);



  const authState = useSelector(state => state.auth);

  const coachId = getCoachId(authState);

  const token = getToken(authState);

  const toast = useCustomToast();



  // Enhanced State Management

  const [calendarData, setCalendarData] = useState([]);

  const [allCalendarData, setAllCalendarData] = useState([]); // Store unfiltered data for modal

  const [availability, setAvailability] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [currentDate, setCurrentDate] = useState(new Date());

  const [viewType, setViewType] = useState('month');

  const [loading, setLoading] = useState(true); // Start with true to show loading initially
  const [error, setError] = useState(null);

  const [success, setSuccess] = useState(null);

  const hasInitialLoad = useRef(false); // Track if initial load has been done
  const [filterStatus, setFilterStatus] = useState('all');

  const [searchQuery, setSearchQuery] = useState('');

  const [appointmentType, setAppointmentType] = useState('all'); // 'all', 'coach' or 'client'

  

  // Modal States

  const { isOpen: isAvailabilityModalOpen, onOpen: onAvailabilityModalOpen, onClose: onAvailabilityModalClose } = useDisclosure();

  const { isOpen: isBookingModalOpen, onOpen: onBookingModalOpen, onClose: onBookingModalClose } = useDisclosure();

  const { isOpen: isAppointmentDetailsOpen, onOpen: onAppointmentDetailsOpen, onClose: onAppointmentDetailsClose } = useDisclosure();

  const { isOpen: isDayDetailsModalOpen, onOpen: onDayDetailsModalOpen, onClose: onDayDetailsModalClose } = useDisclosure();

  const { isOpen: isLeadSearchModalOpen, onOpen: onLeadSearchModalOpen, onClose: onLeadSearchModalClose } = useDisclosure();

  const { isOpen: isEditAppointmentModalOpen, onOpen: onEditAppointmentModalOpen, onClose: onEditAppointmentModalClose } = useDisclosure();

  const { isOpen: isConfirmModalOpen, onOpen: onConfirmModalOpen, onClose: onConfirmModalClose } = useDisclosure();



  // Settings Modal Tab State

  const [settingsTabIndex, setSettingsTabIndex] = useState(0);

  

  // Zoom Integration State

  const [zoomIntegrationStatus, setZoomIntegrationStatus] = useState(null);

  const [loadingZoomStatus, setLoadingZoomStatus] = useState(false);

  

  // OAuth Callback Dialog State

  const { isOpen: isOAuthDialogOpen, onOpen: onOAuthDialogOpen, onClose: onOAuthDialogClose } = useDisclosure();

  const [oauthDialogData, setOAuthDialogData] = useState({ type: 'success', title: '', message: '' });



  // Fetch Zoom Integration Status

  const fetchZoomIntegrationStatus = useCallback(async () => {

    if (!coachId || !token) return;

    

    setLoadingZoomStatus(true);

    try {

      const response = await fetch(`${API_BASE_URL}/api/zoom-integration/status`, {

        method: 'GET',

        headers: {

          'Authorization': `Bearer ${token}`,

          'Content-Type': 'application/json'

        }

      });



      const result = await response.json();

      if (result.success) {

        setZoomIntegrationStatus(result.data);

      } else {

        setZoomIntegrationStatus({ isConnected: false });

      }

    } catch (error) {

      console.error('Error fetching Zoom status:', error);

      setZoomIntegrationStatus({ isConnected: false });

    } finally {

      setLoadingZoomStatus(false);

    }

  }, [coachId, token]);



  // Handle Connect Zoom (OAuth)

  const handleConnectZoom = useCallback(() => {

    if (!coachId || !token) {

      toast('Please log in to connect Zoom', 'error');

      return;

    }



    // Redirect to backend OAuth endpoint

    const redirectUrl = `${API_BASE_URL}/api/zoom-integration/oauth/authorize?coachId=${coachId}`;

    window.location.href = redirectUrl;

  }, [coachId, token, toast]);



  // Handle Disconnect Zoom

  const handleDisconnectZoom = useCallback(async () => {

    if (!coachId || !token) {

      toast('Please log in to disconnect Zoom', 'error');

      return;

    }



    try {

      const response = await fetch(`${API_BASE_URL}/api/zoom-integration`, {

        method: 'DELETE',

        headers: {

          'Authorization': `Bearer ${token}`,

          'Content-Type': 'application/json'

        }

      });



      const result = await response.json();

      if (result.success) {

        toast('Zoom account disconnected successfully', 'success');

        setZoomIntegrationStatus({ isConnected: false });

      } else {

        toast(result.message || 'Failed to disconnect Zoom', 'error');

      }

    } catch (error) {

      console.error('Error disconnecting Zoom:', error);

      toast('Failed to disconnect Zoom account', 'error');

    }

  }, [coachId, token, toast]);



  // Fetch Zoom status when modal opens

  useEffect(() => {

    if (isAvailabilityModalOpen && settingsTabIndex === 1) {

      fetchZoomIntegrationStatus();

    }

  }, [isAvailabilityModalOpen, settingsTabIndex, fetchZoomIntegrationStatus]);



  // Handle OAuth callback redirects with dialog

  useEffect(() => {

    const urlParams = new URLSearchParams(window.location.search);

    const zoomConnected = urlParams.get('zoom_connected');

    const zoomError = urlParams.get('zoom_error');



    if (zoomConnected === 'true') {

      // Success case

      setOAuthDialogData({

        type: 'success',

        title: 'Zoom Connected Successfully!',

        message: 'Your Zoom account has been connected successfully. You can now create Zoom meetings for your appointments.'

      });

      onOAuthDialogOpen();

      fetchZoomIntegrationStatus();

      // Clean URL - preserve /calendar path and remove query params

      const cleanPath = window.location.pathname.replace(/\/calender/, '/calendar');

      window.history.replaceState({}, document.title, cleanPath);

    } else if (zoomError) {

      // Error case - decode and format error message

      const errorMessage = decodeURIComponent(zoomError);

      let userFriendlyMessage = errorMessage;

      let errorTitle = 'Zoom Connection Failed';



      // Map common error messages to user-friendly ones

      if (errorMessage.includes('Invalid scope')) {

        userFriendlyMessage = 'The required Zoom permissions were not granted. Please make sure all required scopes are enabled in your Zoom app settings.';

        errorTitle = 'Permission Error';

      } else if (errorMessage.includes('invalid_state') || errorMessage.includes('state_expired')) {

        userFriendlyMessage = 'The authorization request has expired. Please try connecting again.';

        errorTitle = 'Authorization Expired';

      } else if (errorMessage.includes('missing_parameters')) {

        userFriendlyMessage = 'Some required parameters were missing. Please try connecting again.';

        errorTitle = 'Missing Parameters';

      } else if (errorMessage.includes('oauth_not_configured')) {

        userFriendlyMessage = 'Zoom OAuth is not properly configured. Please contact your administrator.';

        errorTitle = 'Configuration Error';

      } else if (errorMessage.includes('Request failed with status code 400')) {

        userFriendlyMessage = 'The Zoom authorization failed. This might be due to missing scopes or invalid configuration. Please check your Zoom app settings and ensure all required scopes are enabled.';

        errorTitle = 'Authorization Failed';

      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {

        userFriendlyMessage = 'Authentication failed. Please try connecting again.';

        errorTitle = 'Authentication Error';

      }



      setOAuthDialogData({

        type: 'error',

        title: errorTitle,

        message: userFriendlyMessage

      });

      onOAuthDialogOpen();

      // Clean URL - preserve /calendar path and remove query params

      const cleanPath = window.location.pathname.replace(/\/calender/, '/calendar');

      window.history.replaceState({}, document.title, cleanPath);

    }

  }, [toast, fetchZoomIntegrationStatus, onOAuthDialogOpen]);



  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [selectedSlot, setSelectedSlot] = useState(null);

  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);



  // Lead Management States

  const [leads, setLeads] = useState([]);

  const [selectedLead, setSelectedLead] = useState(null);

  const [leadSearchQuery, setLeadSearchQuery] = useState('');

  const [loadingLeads, setLoadingLeads] = useState(false);

  const [leadDetails, setLeadDetails] = useState(null);

  

  // Staff Management States

  const [staff, setStaff] = useState([]);

  const [loadingStaff, setLoadingStaff] = useState(false);



  // Enhanced Form States

  const [availabilityForm, setAvailabilityForm] = useState({

    workingHours: [],

    unavailableSlots: [],

    defaultAppointmentDuration: 30,

    bufferTime: 10,

    timeZone: 'Asia/Kolkata'

  });



  const [bookingForm, setBookingForm] = useState({

    leadId: '',

    startTime: '',

    duration: 30,

    notes: '',

    timeZone: 'Asia/Kolkata',

    appointmentType: 'coach'

  });



  // Enhanced Client Questions Form State

  const [clientQuestionsForm, setClientQuestionsForm] = useState({

    watchedVideo: '',

    healthGoal: '',

    timelineForResults: '',

    seriousnessLevel: '',

    investmentRange: '',

    startTimeline: '',

    additionalInfo: '',

    vslWatchPercentage: 0

  });



  // Question Types State

  const [questionTypes, setQuestionTypes] = useState(null);

  const [loadingQuestionTypes, setLoadingQuestionTypes] = useState(false);

  

  // Form Validation State

  const [formErrors, setFormErrors] = useState({});

  const [isFormValid, setIsFormValid] = useState(false);



  // Edit Appointment Form

  const [editAppointmentForm, setEditAppointmentForm] = useState({

    id: '',

    leadId: '',

    startTime: '',

    duration: 30,

    notes: '',

    status: 'confirmed'

  });



  // Enhanced Statistics

  const [stats, setStats] = useState({

    totalAppointments: 0,

    totalAvailableSlots: 0,

    utilizationRate: 0,

    upcomingAppointments: 0,

    weeklyBookings: 0,

    monthlyRevenue: 0,

    averageSessionDuration: 0,

    canceledAppointments: 0,

    noShowRate: 0,

    popularTimeSlots: []

  });



  // API Console States

  const [apiConsoleOpen, setApiConsoleOpen] = useState(false);

  const [apiTestResults, setApiTestResults] = useState([]);

  const [selectedApiTest, setSelectedApiTest] = useState('question-types');

  const [testLeadId, setTestLeadId] = useState('');

  const [apiLoading, setApiLoading] = useState(false);

  

  // Test Data States

  const [testClientQuestions, setTestClientQuestions] = useState({

    watchedVideo: 'Yes',

    healthGoal: 'Lose Weight (5-15 kg)',

    timelineForResults: '3-6 months (Moderate)',

    seriousnessLevel: 'Very serious - willing to invest time and money',

    investmentRange: '₹25,000 - ₹50,000',

    startTimeline: 'Within 2 weeks',

    additionalInfo: 'I have tried dieting before but need proper guidance',

    vslWatchPercentage: 85.5

  });



  const [testCoachQuestions, setTestCoachQuestions] = useState({

    watchedVideo: 'Yes',

    currentProfession: 'Fitness Trainer/Gym Instructor',

    interestReasons: ['Want additional income source', 'Passionate about helping people transform'],

    incomeGoal: '₹1,00,000 - ₹2,00,000/month (Professional)',

    investmentCapacity: '₹2,00,000 - ₹3,00,000',

    timeAvailability: '6-8 hours/day (Full-time)',

    timelineToAchieveGoal: '6-12 months (Gradual building)',

    additionalInfo: 'Currently running a small gym, want to scale digitally',

    vslWatchPercentage: 95.0

  });



  // Use API_BASE_URL from config (localhost:8080 in dev, api.funnelseye.com in production)

  const BASE_URL = API_BASE_URL;



  // API Console Functions

  const testQuestionTypesAPI = useCallback(async () => {

    setApiLoading(true);

    try {

      const response = await fetch(`${BASE_URL}/api/leads/question-types`, {

        method: 'GET',

        headers: {

          'Content-Type': 'application/json'

        }

      });



      const result = await response.json();

      const testResult = {

        id: Date.now(),

        api: 'GET /api/leads/question-types',

        status: response.status,

        success: response.ok,

        timestamp: new Date().toISOString(),

        request: {

          method: 'GET',

          url: `${BASE_URL}/api/leads/question-types`,

          headers: { 'Content-Type': 'application/json' }

        },

        response: {

          status: response.status,

          statusText: response.statusText,

          data: result

        }

      };



      setApiTestResults(prev => [testResult, ...prev]);

      toast(`Question Types API Test ${response.ok ? 'Success' : 'Failed'}`, response.ok ? 'success' : 'error');

    } catch (err) {

      const testResult = {

        id: Date.now(),

        api: 'GET /api/leads/question-types',

        status: 'ERROR',

        success: false,

        timestamp: new Date().toISOString(),

        request: {

          method: 'GET',

          url: `${BASE_URL}/api/leads/question-types`,

          headers: { 'Content-Type': 'application/json' }

        },

        response: {

          error: err.message

        }

      };

      setApiTestResults(prev => [testResult, ...prev]);

      toast(`Question Types API Test Failed: ${err.message}`, 'error');

    } finally {

      setApiLoading(false);

    }

  }, [toast]);



  const testClientQuestionsAPI = useCallback(async () => {

    if (!testLeadId.trim()) {

      toast('Please enter a Lead ID for testing', 'error');

      return;

    }



    setApiLoading(true);

    try {

      const payload = {

        leadId: testLeadId.trim(),

        questionResponses: {

          clientQuestions: testClientQuestions,

          vslWatchPercentage: testClientQuestions.vslWatchPercentage

        },

        appointmentData: {

          preferredTime: '10:00 AM',

          preferredDate: new Date().toISOString().split('T')[0],

          timezone: 'Asia/Kolkata',

          notes: 'Test appointment booking'

        }

      };



      const response = await fetch(`${BASE_URL}/api/leads/question-responses`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json'

        },

        body: JSON.stringify(payload)

      });



      const result = await response.json();

      const testResult = {

        id: Date.now(),

        api: 'POST /api/leads/question-responses (Client)',

        status: response.status,

        success: response.ok,

        timestamp: new Date().toISOString(),

        request: {

          method: 'POST',

          url: `${BASE_URL}/api/leads/question-responses`,

          headers: { 'Content-Type': 'application/json' },

          body: payload

        },

        response: {

          status: response.status,

          statusText: response.statusText,

          data: result

        }

      };



      setApiTestResults(prev => [testResult, ...prev]);

      toast(`Client Questions API Test ${response.ok ? 'Success' : 'Failed'}`, response.ok ? 'success' : 'error');

    } catch (err) {

      const testResult = {

        id: Date.now(),

        api: 'POST /api/leads/question-responses (Client)',

        status: 'ERROR',

        success: false,

        timestamp: new Date().toISOString(),

        request: {

          method: 'POST',

          url: `${BASE_URL}/api/leads/question-responses`,

          headers: { 'Content-Type': 'application/json' }

        },

        response: {

          error: err.message

        }

      };

      setApiTestResults(prev => [testResult, ...prev]);

      toast(`Client Questions API Test Failed: ${err.message}`, 'error');

    } finally {

      setApiLoading(false);

    }

  }, [testLeadId, testClientQuestions, toast]);



  const testCoachQuestionsAPI = useCallback(async () => {

    if (!testLeadId.trim()) {

      toast('Please enter a Lead ID for testing', 'error');

      return;

    }



    setApiLoading(true);

    try {

      const payload = {

        leadId: testLeadId.trim(),

        questionResponses: {

          coachQuestions: testCoachQuestions,

          vslWatchPercentage: testCoachQuestions.vslWatchPercentage

        },

        appointmentData: {

          preferredTime: '2:00 PM',

          preferredDate: new Date().toISOString().split('T')[0],

          timezone: 'Asia/Kolkata',

          notes: 'Test coach consultation'

        }

      };



      const response = await fetch(`${BASE_URL}/api/leads/question-responses`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json'

        },

        body: JSON.stringify(payload)

      });



      const result = await response.json();

      const testResult = {

        id: Date.now(),

        api: 'POST /api/leads/question-responses (Coach)',

        status: response.status,

        success: response.ok,

        timestamp: new Date().toISOString(),

        request: {

          method: 'POST',

          url: `${BASE_URL}/api/leads/question-responses`,

          headers: { 'Content-Type': 'application/json' },

          body: payload

        },

        response: {

          status: response.status,

          statusText: response.statusText,

          data: result

        }

      };



      setApiTestResults(prev => [testResult, ...prev]);

      toast(`Coach Questions API Test ${response.ok ? 'Success' : 'Failed'}`, response.ok ? 'success' : 'error');

    } catch (err) {

      const testResult = {

        id: Date.now(),

        api: 'POST /api/leads/question-responses (Coach)',

        status: 'ERROR',

        success: false,

        timestamp: new Date().toISOString(),

        request: {

          method: 'POST',

          url: `${BASE_URL}/api/leads/question-responses`,

          headers: { 'Content-Type': 'application/json' }

        },

        response: {

          error: err.message

        }

      };

      setApiTestResults(prev => [testResult, ...prev]);

      toast(`Coach Questions API Test Failed: ${err.message}`, 'error');

    } finally {

      setApiLoading(false);

    }

  }, [testLeadId, testCoachQuestions, toast]);



  const testLeadUpdateAPI = useCallback(async () => {

    if (!testLeadId.trim()) {

      toast('Please enter a Lead ID for testing', 'error');

      return;

    }



    setApiLoading(true);

    try {

      const payload = {

        status: 'Contacted',

        leadTemperature: 'Hot',

        vslWatchPercentage: 75.5,

        notes: 'Test lead update from API console'

      };



      const response = await fetch(`${BASE_URL}/api/leads/${testLeadId.trim()}`, {

        method: 'PUT',

        headers: {

          'Content-Type': 'application/json'

        },

        body: JSON.stringify(payload)

      });



      const result = await response.json();

      const testResult = {

        id: Date.now(),

        api: `PUT /api/leads/${testLeadId.trim()}`,

        status: response.status,

        success: response.ok,

        timestamp: new Date().toISOString(),

        request: {

          method: 'PUT',

          url: `${BASE_URL}/api/leads/${testLeadId.trim()}`,

          headers: { 'Content-Type': 'application/json' },

          body: payload

        },

        response: {

          status: response.status,

          statusText: response.statusText,

          data: result

        }

      };



      setApiTestResults(prev => [testResult, ...prev]);

      toast(`Lead Update API Test ${response.ok ? 'Success' : 'Failed'}`, response.ok ? 'success' : 'error');

    } catch (err) {

      const testResult = {

        id: Date.now(),

        api: `PUT /api/leads/${testLeadId.trim()}`,

        status: 'ERROR',

        success: false,

        timestamp: new Date().toISOString(),

        request: {

          method: 'PUT',

          url: `${BASE_URL}/api/leads/${testLeadId.trim()}`,

          headers: { 'Content-Type': 'application/json' }

        },

        response: {

          error: err.message

        }

      };

      setApiTestResults(prev => [testResult, ...prev]);

      toast(`Lead Update API Test Failed: ${err.message}`, 'error');

    } finally {

      setApiLoading(false);

    }

  }, [testLeadId, toast]);



  const clearApiResults = useCallback(() => {

    setApiTestResults([]);

    toast('API test results cleared', 'info');

  }, [toast]);



  // Test Filtering Logic

  const testFilteringLogic = useCallback(() => {

    // Debug logging removed - functionality preserved

    toast('Filtering logic test completed', 'info');

  }, [appointmentType, leads, calendarData, toast]);



  // Debug Client Appointments Issue

  const debugClientAppointments = useCallback(async () => {

    // Debug logging removed

    try {

      // Step 1: Check if there are any funnels with targetAudience = 'customer'

      const funnelsResponse = await fetch(`${BASE_URL}/api/funnels/coach/${coachId}/funnels`, {

        method: 'GET',

        headers: { 

          'Authorization': `Bearer ${token}`, 

          'Accept': 'application/json',

          'Content-Type': 'application/json' 

        }

      });



      if (funnelsResponse.ok) {

        const funnelsResult = await funnelsResponse.json();

        const allFunnels = funnelsResult.data || [];

        const customerFunnels = allFunnels.filter(f => f.targetAudience === 'customer');

        

        // Step 2: Check if there are any leads in customer funnels

        const leadsResponse = await fetch(`${BASE_URL}/api/leads`, {

          method: 'GET',

          headers: { 

            'Authorization': `Bearer ${token}`, 

            'Accept': 'application/json',

            'Content-Type': 'application/json' 

          }

        });



        if (leadsResponse.ok) {

          const leadsResult = await leadsResponse.json();

          const allLeads = leadsResult.data || [];

          const customerFunnelIds = new Set(customerFunnels.map(f => f.id || f._id));

          const customerLeads = allLeads.filter(lead => {

            const leadFunnelId = lead.funnelId?._id || lead.funnelId?.id || lead.funnelId;

            return customerFunnelIds.has(leadFunnelId);

          });

          

          // Step 3: Check if there are any appointments for customer leads

          const customerLeadIds = new Set(customerLeads.map(l => l._id || l.id));

          const allAppointments = calendarData.reduce((acc, day) => {

            if (day.appointments) {

              acc.push(...day.appointments);

            }

            return acc;

          }, []);

          

          const customerAppointments = allAppointments.filter(apt => 

            customerLeadIds.has(apt.leadId)

          );

        }

      }

    } catch (err) {

      console.error('Error debugging client appointments:', err);

    }

    

    toast('Client appointments debug completed', 'info');

  }, [coachId, token, calendarData, toast]);



  // Enhanced Utility Functions

  const getCurrentMonthRange = useCallback(() => {

    const year = currentDate.getFullYear();

    const month = currentDate.getMonth();

    

    const startOfMonth = new Date(year, month, 1);

    const endOfMonth = new Date(year, month + 1, 0);

    

    return {

      startDate: startOfMonth.toISOString().split('T')[0],

      endDate: endOfMonth.toISOString().split('T')[0]

    };

  }, [currentDate]);



  // FIXED Lead API Functions

  // REMOVED: fetchLeads function - using fetchLeadsData instead to avoid conflicts



  const fetchSingleLead = useCallback(async (leadId) => {

    if (!token || !coachId || !leadId) return null;

    

    try {

      const response = await fetch(`${BASE_URL}/api/leads/${leadId}`, {

        method: 'GET',

        headers: {

          'Authorization': `Bearer ${token}`,

          'Content-Type': 'application/json',

          'Coach-ID': coachId

        }

      });



      if (!response.ok) throw new Error(`Failed to fetch lead: ${response.status}`);

      

      const result = await response.json();

      if (result.success) {

        return result.data;

      }

      return null;

    } catch (err) {

      console.error('Single lead fetch error:', err);

      return null;

    }

  }, [token, coachId]);



  // Fetch Question Types API

  const fetchQuestionTypes = useCallback(async () => {

    setLoadingQuestionTypes(true);

    try {

      const response = await fetch(`${BASE_URL}/api/leads/question-types`, {

        method: 'GET',

        headers: {

          'Content-Type': 'application/json'

        }

      });



      if (!response.ok) throw new Error(`Failed to fetch question types: ${response.status}`);

      

      const result = await response.json();

      if (result.success) {

        setQuestionTypes(result.data);

      }

    } catch (err) {

      console.error('Question types fetch error:', err);

      toast(`Failed to load question types: ${err.message}`, 'error');

    } finally {

      setLoadingQuestionTypes(false);

    }

  }, [toast]);



  // FIXED Calendar Data Fetch with proper timezone handling

  const fetchCalendarData = useCallback(async () => {

    if (!coachId || !token) {

      return;

    }

    

    setLoading(true);

    setError(null);

    

    try {

      const range = getCurrentMonthRange();

      const timezone = availability?.timeZone || 'Asia/Kolkata';

      

      // Fetch ALL appointments first, then filter client-side

      const baseUrl = `${BASE_URL}/api/coach/${coachId}/calendar`;

      

      const url = new URL(baseUrl);

      url.searchParams.append('startDate', range.startDate);

      url.searchParams.append('endDate', range.endDate);

      url.searchParams.append('timeZone', timezone);

      // Remove appointmentType parameter to get all appointments



      const response = await fetch(url, {

        method: 'GET',

        headers: { 

          'Authorization': `Bearer ${token}`, 

          'Accept': 'application/json',

          'Content-Type': 'application/json' 

        }

      });



      if (!response.ok) {

        throw new Error(`Failed to fetch calendar data: ${response.status}`);

      }

      

      const result = await response.json();

      

      if (result.success) {

        const rawData = Array.isArray(result.data) ? result.data : 

                        result.data && Array.isArray(result.data.calendar) ? result.data.calendar : [];

        

        // FIXED: Proper data processing with timezone conversion

        const processedData = rawData.map(day => {

          const processedDay = {

            ...day,

            appointments: [],

            availableSlots: []

          };



          // Process appointments with FIXED timezone conversion

          if (Array.isArray(day.appointments)) {

            processedDay.appointments = day.appointments.map(apt => {

              const localDateStr = convertToTimezone(apt.startTime, timezone);

              return {

                ...apt,

                displayTime: formatTimeWithTimezone(apt.startTime, timezone),

                displayDate: formatDateWithTimezone(apt.startTime, timezone),

                localDateString: localDateStr,

                originalStartTime: apt.startTime

              };

            });

          }



          // Process available slots with FIXED timezone conversion

          if (Array.isArray(day.availableSlots)) {

            processedDay.availableSlots = day.availableSlots.map(slot => {

              const localDateStr = convertToTimezone(slot.startTime, timezone);

              return {

                ...slot,

                displayTime: formatTimeWithTimezone(slot.startTime, timezone),

                displayDate: formatDateWithTimezone(slot.startTime, timezone),

                localDateString: localDateStr,

                originalStartTime: slot.startTime

              };

            });

          }



          return processedDay;

        });

        

        // Filter appointments based on appointment type using leads data

        const filteredData = processedData.map(day => {

          if (!day || !day.appointments) return day;

          

          const filteredAppointments = filterAppointmentsByType(day.appointments, appointmentType, leads);

          

          return {

            ...day,

            appointments: filteredAppointments

          };

        });

        

        // Store both filtered and unfiltered data

        setAllCalendarData(processedData); // Unfiltered data for modal

        setCalendarData(filteredData); // Filtered data for calendar view

        calculateEnhancedStats(filteredData);

        

        // Success toast removed - only show on errors

      } else {

        throw new Error(result.message || 'Failed to fetch calendar data');

      }

    } catch (err) {

      console.error('Calendar fetch error:', err);

      setCalendarData([]);

      setAllCalendarData([]);

      toast(`Calendar fetch failed: ${err.message}`, 'error');

    } finally {

      setLoading(false);

    }

  }, [coachId, token, getCurrentMonthRange, toast, availability?.timeZone, appointmentType, leads]);



  // Fetch Leads Data for Appointment Type Identification

  const fetchLeadsData = useCallback(async () => {

    if (!coachId || !token) return;

    

    try {

      // Fetch all funnels first

      const funnelsResponse = await fetch(`${BASE_URL}/api/funnels/coach/${coachId}/funnels`, {

        method: 'GET',

        headers: { 

          'Authorization': `Bearer ${token}`, 

          'Accept': 'application/json',

          'Content-Type': 'application/json' 

        }

      });



      let targetFunnels = [];

      if (funnelsResponse.ok) {

        const funnelsResult = await funnelsResponse.json();

        const allFunnels = funnelsResult.data || [];



        // Filter funnels based on appointment type (EXACT SAME LOGIC AS LEADS)

        if (appointmentType === 'coach') {

          targetFunnels = allFunnels.filter(f => f.targetAudience === 'coach');

        } else if (appointmentType === 'client') {

          targetFunnels = allFunnels.filter(f => f.targetAudience === 'customer');

        } else if (appointmentType === 'all') {

          targetFunnels = allFunnels; // Show all funnels

        }



      }



      // Fetch all leads

      const leadsResponse = await fetch(`${BASE_URL}/api/leads`, {

        method: 'GET',

        headers: { 

          'Authorization': `Bearer ${token}`, 

          'Accept': 'application/json',

          'Content-Type': 'application/json' 

        }

      });



      if (!leadsResponse.ok) {

        return;

      }



      const leadsResult = await leadsResponse.json();

      const allLeads = leadsResult.data || [];



      // Get target funnel IDs

      const targetFunnelIds = new Set(targetFunnels.map(f => f.id || f._id));



      // Filter leads by funnel IDs (EXACT SAME LOGIC AS LEADS)

      let filteredLeads;

      if (appointmentType === 'all') {

        filteredLeads = allLeads; // Show all leads

      } else {

        filteredLeads = allLeads.filter(lead => {

          const leadFunnelId = lead.funnelId?._id || lead.funnelId?.id || lead.funnelId;

          return targetFunnelIds.has(leadFunnelId);

        });

      }



      setLeads(filteredLeads);

    } catch (err) {

      console.error('Error fetching leads data:', err);

      setLeads([]);

    }

  }, [coachId, token, appointmentType]);



  // Fetch Staff Data - Similar to Customer Leads

  const fetchStaffData = useCallback(async () => {

    if (!coachId || !token) return;

    

    setLoadingStaff(true);

    try {

      

      let staffResponse;

      try {

        staffResponse = await fetch(`${BASE_URL}/api/staff?coachId=${coachId}`, {

          method: 'GET',

          headers: { 

            'Authorization': `Bearer ${token}`, 

            'Accept': 'application/json',

            'Content-Type': 'application/json' 

          }

        });

      } catch (err) {

        staffResponse = await fetch(`${BASE_URL}/api/staff`, {

          method: 'GET',

          headers: { 

            'Authorization': `Bearer ${token}`, 

            'Accept': 'application/json',

            'Content-Type': 'application/json' 

          }

        });

      }

      

      if (!staffResponse.ok) {

        return;

      }



      const staffResult = await staffResponse.json();

      const staffData = staffResult.data || staffResult || [];

      

      // Filter staff by coachId if needed

      const filteredStaff = Array.isArray(staffData) ? staffData.filter(s => 

        s.coachId === coachId || s.coach === coachId || !s.coachId

      ) : [];

      

      setStaff(filteredStaff);

    } catch (err) {

      console.error('Error fetching staff data:', err);

      setStaff([]);

    } finally {

      setLoadingStaff(false);

    }

  }, [coachId, token]);



  // Helper function to get staff name - Similar to Customer Leads

  const getStaffName = useCallback((staffData) => {

    if (!staffData) return 'Unassigned';

    

    // If staffData is already an object (populated), use it directly

    if (typeof staffData === 'object' && staffData !== null) {

      if (staffData.firstName && staffData.lastName) {

        return `${staffData.firstName} ${staffData.lastName}`;

      } else if (staffData.name) {

        return staffData.name;

      } else {

        return 'Unknown Staff';

      }

    }

    

    // Otherwise, it's an ID - look it up in the staff array

    if (!Array.isArray(staff) || staff.length === 0) {

      return 'Unknown Staff';

    }

    

    const staffMember = staff.find(s => s._id === staffData || s.id === staffData);

    if (staffMember) {

      // Handle different staff name formats

      if (staffMember.firstName && staffMember.lastName) {

        return `${staffMember.firstName} ${staffMember.lastName}`;

      } else if (staffMember.name) {

        return staffMember.name;

      } else {

        return 'Unknown Staff';

      }

    }

    return 'Unknown Staff';

  }, [staff]);



  const getStaffDisplayName = useCallback((staffData) => {

    if (!staffData) return 'Unassigned';

    

    // If staffData is already an object (populated), use it directly

    if (typeof staffData === 'object' && staffData !== null) {

      const staffName = staffData.firstName && staffData.lastName 

        ? `${staffData.firstName} ${staffData.lastName}`

        : staffData.name || 'Unknown Staff';

      

      return staffData.email ? `${staffName}` : staffName;

    }

    

    // Otherwise, it's an ID - look it up in the staff array

    if (!Array.isArray(staff) || staff.length === 0) {

      return 'Unknown Staff';

    }

    

    const staffMember = staff.find(s => s._id === staffData || s.id === staffData);

    if (staffMember) {

      // Get staff name - handle different formats

      const staffName = staffMember.firstName && staffMember.lastName 

        ? `${staffMember.firstName} ${staffMember.lastName}`

        : staffMember.name || 'Unknown Staff';

      

      return staffMember.email ? `${staffName}` : staffName;

    }

    return 'Unknown Staff';

  }, [staff]);



  // FIXED Availability Fetch

  const fetchAvailability = useCallback(async () => {

    if (!coachId || !token) return;

    

    try {

      const response = await fetch(`${BASE_URL}/api/coach/${coachId}/availability`, {

        method: 'GET',

        headers: { 

          'Authorization': `Bearer ${token}`, 

          'Accept': 'application/json',

          'Content-Type': 'application/json'

        }

      });



      if (!response.ok) {

        if (response.status === 404) {

          const defaultAvailability = {

            workingHours: [],

            defaultAppointmentDuration: 30,

            timeZone: 'Asia/Kolkata'

          };

          setAvailability(defaultAvailability);

          setAvailabilityForm(prev => ({ ...prev, ...defaultAvailability }));

          return;

        }

        throw new Error(`Failed to fetch availability: ${response.status}`);

      }

      

      const result = await response.json();

      

      if (result.success && result.data) {

        setAvailability(result.data);

        // Handle both slotDuration (legacy) and defaultAppointmentDuration

        const appointmentDuration = result.data.defaultAppointmentDuration || result.data.slotDuration || 30;

        setAvailabilityForm(prev => ({

          ...prev,

          workingHours: Array.isArray(result.data.workingHours) ? result.data.workingHours : [],

          unavailableSlots: Array.isArray(result.data.unavailableSlots) ? result.data.unavailableSlots : [],

          defaultAppointmentDuration: appointmentDuration,

          bufferTime: result.data.bufferTime || 10,

          timeZone: result.data.timeZone || 'Asia/Kolkata'

        }));

        

        // Success toast removed - only show on errors

      }

    } catch (err) {

      console.error('Availability fetch error:', err);

      const defaultAvailability = {

        workingHours: [],

        defaultAppointmentDuration: 30,

        timeZone: 'Asia/Kolkata'

      };

      setAvailability(defaultAvailability);

      toast(`Failed to load availability: ${err.message}`, 'error');

    }

  }, [coachId, token, toast]);



  // Enhanced Appointment Booking with Validation

  const bookAppointment = useCallback(async () => {

    if (!coachId || !token) {

      toast('Authentication required', 'error');

      return;

    }

    

    if (!bookingForm.leadId || !bookingForm.startTime) {

      toast('Lead and appointment time are required', 'error');

      return;

    }

    

    // Validate client questions form inline

    const validateForm = () => {

      const errors = {};

      const requiredFields = [

        'watchedVideo',

        'healthGoal', 

        'timelineForResults',

        'seriousnessLevel',

        'investmentRange',

        'startTimeline'

      ];



      requiredFields.forEach(field => {

        if (!clientQuestionsForm[field] || clientQuestionsForm[field].trim() === '') {

          errors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;

        }

      });



      // Validate VSL percentage

      if (clientQuestionsForm.vslWatchPercentage < 0 || clientQuestionsForm.vslWatchPercentage > 100) {

        errors.vslWatchPercentage = 'VSL watch percentage must be between 0 and 100';

      }



      return Object.keys(errors).length === 0;

    };

    

    if (!validateForm()) {

      toast('Please fill all required client questions correctly', 'error');

      return;

    }

    

    setLoading(true);

    try {

      const timezone = availability?.timeZone || "Asia/Kolkata";

      

      // First book the appointment

      const appointmentPayload = {

        leadId: bookingForm.leadId.trim(),

        startTime: bookingForm.startTime,

        duration: bookingForm.duration || availability?.defaultAppointmentDuration || 30,

        notes: bookingForm.notes.trim() || "Initial consultation",

        timeZone: timezone,

        appointmentType: appointmentType

      };





      const appointmentResponse = await fetch(`${BASE_URL}/api/coach/${coachId}/book`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          'Authorization': `Bearer ${token}`,

          'Accept': 'application/json'

        },

        body: JSON.stringify(appointmentPayload)

      });



      if (!appointmentResponse.ok) {

        throw new Error(`Appointment booking failed: ${appointmentResponse.status}`);

      }



      const appointmentResult = await appointmentResponse.json();

      if (!appointmentResult.success) {

        throw new Error(appointmentResult.message || 'Appointment booking failed');

      }



      // Then submit client questions with enhanced payload

      const questionsPayload = {

        leadId: bookingForm.leadId.trim(),

        questionResponses: {

          clientQuestions: {

            watchedVideo: clientQuestionsForm.watchedVideo,

            healthGoal: clientQuestionsForm.healthGoal,

            timelineForResults: clientQuestionsForm.timelineForResults,

            seriousnessLevel: clientQuestionsForm.seriousnessLevel,

            investmentRange: clientQuestionsForm.investmentRange,

            startTimeline: clientQuestionsForm.startTimeline,

            additionalInfo: clientQuestionsForm.additionalInfo || ''

          },

          vslWatchPercentage: parseFloat(clientQuestionsForm.vslWatchPercentage) || 0

        },

        appointmentData: {

          preferredTime: new Date(bookingForm.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),

          preferredDate: new Date(bookingForm.startTime).toLocaleDateString('en-US'),

          timezone: timezone,

          notes: bookingForm.notes.trim() || '',

          duration: bookingForm.duration || availability?.defaultAppointmentDuration || 30

        }

      };





      const questionsResponse = await fetch(`${BASE_URL}/api/leads/question-responses`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json'

        },

        body: JSON.stringify(questionsPayload)

      });



      if (!questionsResponse.ok) {

        toast('Appointment booked, but questions submission failed', 'warning');

      } else {

        const questionsResult = await questionsResponse.json();

        if (questionsResult.success) {

          // Show success with lead insights if available

          const insights = questionsResult.data?.qualificationInsights || [];

          const leadTemperature = questionsResult.data?.leadTemperature || 'Unknown';

          const score = questionsResult.data?.score || 0;

          

          toast(`Appointment booked successfully! Lead Score: ${score}/100 (${leadTemperature})`, 'success');

          

          // Log insights for coach reference

          if (insights.length > 0) {

          }

        } else {

          toast('Appointment booked, but questions submission failed', 'warning');

        }

      }



      onBookingModalClose();

      

      // Reset form inline to avoid circular dependency

      setBookingForm({

        leadId: '',

        startTime: '',

        duration: 30,

        notes: '',

        timeZone: 'Asia/Kolkata'

      });

      setClientQuestionsForm({

        watchedVideo: '',

        healthGoal: '',

        timelineForResults: '',

        seriousnessLevel: '',

        investmentRange: '',

        startTimeline: '',

        additionalInfo: '',

        vslWatchPercentage: 0

      });

      setSelectedLead(null);

      setLeadDetails(null);

      setSelectedSlot(null);

      setFormErrors({});

      setIsFormValid(false);

      

      fetchCalendarData(); // Refresh calendar

    } catch (err) {

      console.error('Booking error:', err);

      toast(err.message, 'error');

    } finally {

      setLoading(false);

    }

  }, [coachId, token, bookingForm, clientQuestionsForm, availability, toast, fetchCalendarData, onBookingModalClose, appointmentType]);



  const updateAppointment = useCallback(async () => {

    if (!token || !editAppointmentForm.id) {

      toast('Authentication or appointment ID required', 'error');

      return;

    }

    

    setLoading(true);

    try {

      const response = await fetch(`${BASE_URL}/api/appointments/${editAppointmentForm.id}`, {

        method: 'PUT',

        headers: {

          'Authorization': `Bearer ${token}`,

          'Content-Type': 'application/json'

        },

        body: JSON.stringify({

          leadId: editAppointmentForm.leadId,

          startTime: editAppointmentForm.startTime,

          duration: editAppointmentForm.duration,

          notes: editAppointmentForm.notes,

          status: editAppointmentForm.status

        })

      });



      if (response.ok) {

        const result = await response.json();

        if (result.success) {

          onEditAppointmentModalClose();

          toast('Appointment updated successfully!');

          fetchCalendarData();

        } else {

          throw new Error(result.message || 'Update failed');

        }

      } else {

        throw new Error(`Update failed: ${response.status}`);

      }

    } catch (err) {

      console.error('Appointment update error:', err);

      toast(`Update failed: ${err.message}`, 'error');

    } finally {

      setLoading(false);

    }

  }, [token, editAppointmentForm, toast, fetchCalendarData, onEditAppointmentModalClose]);



  const deleteAppointment = useCallback(async (appointmentId) => {

    if (!token || !appointmentId) return;

    

    setConfirmAction({ type: 'single', id: appointmentId });

    onConfirmModalOpen();

  }, [token, onConfirmModalOpen]);



  const confirmDeleteAppointment = useCallback(async () => {

    if (confirmAction?.type === 'single' && confirmAction.id) {

      setLoading(true);

      try {

        const response = await fetch(`${BASE_URL}/api/appointments/${confirmAction.id}`, {

          method: 'DELETE',

          headers: {

            'Authorization': `Bearer ${token}`,

            'Content-Type': 'application/json'

          }

        });



        if (response.ok) {

          const result = await response.json();

          if (result.success) {

            toast('Appointment deleted successfully!');

            fetchCalendarData();

            onAppointmentDetailsClose();

            onDayDetailsModalClose();

          } else {

            throw new Error(result.message || 'Delete failed');

          }

        } else {

          throw new Error(`Delete failed: ${response.status}`);

        }

      } catch (err) {

        console.error('Delete error:', err);

        toast(`Delete failed: ${err.message}`, 'error');

      } finally {

        setLoading(false);

      }

    }

    onConfirmModalClose();

    setConfirmAction(null);

  }, [token, confirmAction, toast, fetchCalendarData, onAppointmentDetailsClose, onDayDetailsModalClose, onConfirmModalClose]);



  const updateAvailability = useCallback(async () => {

    if (!token || !coachId) {

      toast('Authentication required', 'error');

      return;

    }

    

    setLoading(true);

    try {

      // Prepare data in the exact format backend expects

      // Filter and format workingHours to ensure only valid entries are sent

      const workingHours = (availabilityForm.workingHours || [])

        .filter(wh => wh != null && typeof wh === 'object')

        .map(wh => ({

          dayOfWeek: parseInt(wh.dayOfWeek) || 0,

          startTime: (wh.startTime && typeof wh.startTime === 'string' && wh.startTime.match(/^\d{2}:\d{2}$/)) 

            ? wh.startTime 

            : '09:00',

          endTime: (wh.endTime && typeof wh.endTime === 'string' && wh.endTime.match(/^\d{2}:\d{2}$/)) 

            ? wh.endTime 

            : '17:00'

        }))

        .filter(wh => wh.dayOfWeek >= 0 && wh.dayOfWeek <= 6); // Ensure valid dayOfWeek



      const payload = {

        timeZone: availabilityForm.timeZone || 'Asia/Kolkata',

        workingHours: workingHours,

        unavailableSlots: Array.isArray(availabilityForm.unavailableSlots) 

          ? availabilityForm.unavailableSlots 

          : [],

        defaultAppointmentDuration: parseInt(availabilityForm.defaultAppointmentDuration) || 30,

        bufferTime: parseInt(availabilityForm.bufferTime) || 10

      };



      const response = await fetch(`${BASE_URL}/api/coach/availability`, {

        method: 'POST',

        headers: { 

          'Authorization': `Bearer ${token}`, 

          'Content-Type': 'application/json',

          'Coach-ID': coachId

        },

        body: JSON.stringify(payload)

      });



      const result = await response.json();



      if (response.ok && result.success) {

        setAvailability(result.data);

        onAvailabilityModalClose();

        toast('Availability updated successfully!', 'success');

        fetchCalendarData();

      } else {

        // Handle specific error cases

        if (result.requiresZoomIntegration) {

          toast('You must connect your Zoom account before setting availability. Please go to Settings > Zoom Integration.', 'error');

        } else {

          throw new Error(result.message || `Update failed: ${response.status}`);

        }

      }

    } catch (err) {

      console.error('Availability update error:', err);

      toast(`Update failed: ${err.message}`, 'error');

    } finally {

      setLoading(false);

    }

  }, [token, coachId, availabilityForm, toast, fetchCalendarData, onAvailabilityModalClose]);



  const calculateEnhancedStats = useCallback((data) => {

    if (!Array.isArray(data)) return;



    let totalAppointments = 0;

    let totalAvailableSlots = 0;

    let upcomingAppointments = 0;

    let totalDuration = 0;

    const timeSlotCounts = {};

    const now = new Date();



    data.forEach(day => {

      if (!day || typeof day !== 'object') return;

      

      const appointments = Array.isArray(day.appointments) ? day.appointments : [];

      const slots = Array.isArray(day.availableSlots) ? day.availableSlots : [];

      

      totalAppointments += appointments.length;

      totalAvailableSlots += slots.length;

      

      appointments.forEach(apt => {

        if (!apt || !apt.originalStartTime) return;

        

        try {

          if (new Date(apt.originalStartTime) > now) {

            upcomingAppointments++;

          }

          

          totalDuration += apt.duration || 30;

          

          const displayTime = apt.displayTime || 'Unknown';

          timeSlotCounts[displayTime] = (timeSlotCounts[displayTime] || 0) + 1;

        } catch (error) {

          console.error('Error processing appointment:', apt, error);

        }

      });

    });



    const utilizationRate = (totalAvailableSlots + totalAppointments) > 0 

      ? ((totalAppointments / (totalAvailableSlots + totalAppointments)) * 100).toFixed(1)

      : 0;



    const averageSessionDuration = totalAppointments > 0 ? Math.round(totalDuration / totalAppointments) : 0;



    const popularTimeSlots = Object.entries(timeSlotCounts)

      .sort(([,a], [,b]) => b - a)

      .slice(0, 3)

      .map(([time, count]) => ({ time, count }));



    setStats({

      totalAppointments,

      totalAvailableSlots,

      utilizationRate: parseFloat(utilizationRate),

      upcomingAppointments,

      weeklyBookings: totalAppointments,

      monthlyRevenue: totalAppointments * 150,

      averageSessionDuration,

      canceledAppointments: 0,

      noShowRate: 0,

      popularTimeSlots,

      appointmentType: appointmentType // Add appointment type to stats

    });

  }, [toast, appointmentType]);



  // Form Validation Functions

  const validateClientQuestions = useCallback(() => {

    const errors = {};

    const requiredFields = [

      'watchedVideo',

      'healthGoal', 

      'timelineForResults',

      'seriousnessLevel',

      'investmentRange',

      'startTimeline'

    ];



    requiredFields.forEach(field => {

      if (!clientQuestionsForm[field] || clientQuestionsForm[field].trim() === '') {

        errors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;

      }

    });



    // Validate VSL percentage

    if (clientQuestionsForm.vslWatchPercentage < 0 || clientQuestionsForm.vslWatchPercentage > 100) {

      errors.vslWatchPercentage = 'VSL watch percentage must be between 0 and 100';

    }



    setFormErrors(errors);

    const isValid = Object.keys(errors).length === 0;

    setIsFormValid(isValid);

    return isValid;

  }, [clientQuestionsForm]);



  // Validate form whenever client questions change

  useEffect(() => {

    validateClientQuestions();

  }, [clientQuestionsForm, validateClientQuestions]);



  // Enhanced Form Reset Function (kept for reference but not used to avoid circular dependencies)

  // const resetBookingForm = useCallback(() => {

  //   setBookingForm({

  //     leadId: '',

  //     startTime: '',

  //     duration: 30,

  //     notes: '',

  //     timeZone: 'Asia/Kolkata'

  //   });

  //   setClientQuestionsForm({

  //     watchedVideo: '',

  //     healthGoal: '',

  //     timelineForResults: '',

  //     seriousnessLevel: '',

  //     investmentRange: '',

  //     startTimeline: '',

  //     additionalInfo: '',

  //     vslWatchPercentage: 0

  //   });

  //   setSelectedLead(null);

  //   setLeadDetails(null);

  //   setSelectedSlot(null);

  //   setFormErrors({});

  //   setIsFormValid(false);

  // }, []);



  // FIXED Event Handlers

  // handleDateClick is defined below to open day details modal



  const handleSlotClick = useCallback((slot) => {

    setSelectedSlot(slot);

    setBookingForm(prev => ({

      ...prev,

      startTime: slot.originalStartTime || slot.startTime,

      duration: slot.duration || 30

    }));

    onLeadSearchModalOpen();

  }, [onLeadSearchModalOpen]);



  const handleAppointmentClick = useCallback(async (appointment) => {

    setSelectedAppointment(appointment);

    

    // Fetch lead details if available

    if (appointment.leadId) {

      const leadData = await fetchSingleLead(appointment.leadId);

      if (leadData) {

        setLeadDetails(leadData);

      }

    }

    

    onAppointmentDetailsOpen();

  }, [fetchSingleLead, onAppointmentDetailsOpen]);



  const handleEditAppointment = useCallback((appointment) => {

    setEditAppointmentForm({

      id: appointment.id || appointment._id,

      leadId: appointment.leadId || '',

      startTime: appointment.originalStartTime || appointment.startTime,

      duration: appointment.duration || 30,

      notes: appointment.notes || '',

      status: appointment.status || 'confirmed'

    });

    onAppointmentDetailsClose();

    onEditAppointmentModalOpen();

  }, [onAppointmentDetailsClose, onEditAppointmentModalOpen]);



  const handleLeadSelect = useCallback((lead) => {

    setSelectedLead(lead);

    setBookingForm(prev => ({

      ...prev,

      leadId: lead._id || lead.id

    }));

    onLeadSearchModalClose();

    onBookingModalOpen();

  }, [onLeadSearchModalClose, onBookingModalOpen]);



  // FIXED getEventsForDate function - Uses unfiltered data for modal

  const getEventsForDate = useCallback((date) => {

    if (!date) {

      return { appointments: [], availableSlots: [] };

    }

    

    try {

      const targetDateStr = getLocalDateString(date);

      

      if (!targetDateStr) {

        return { appointments: [], availableSlots: [] };

      }



      const appointments = [];

      const availableSlots = [];



      // Use unfiltered data for modal to show ALL appointments

      const dataToSearch = allCalendarData.length > 0 ? allCalendarData : calendarData;



      dataToSearch.forEach((dayData, index) => {

        if (!dayData) {

          return;

        }



        // Check appointments

        if (Array.isArray(dayData.appointments)) {

          dayData.appointments.forEach((apt, aptIndex) => {

            if (apt && apt.localDateString === targetDateStr) {

              appointments.push(apt);

            }

          });

        }



        // Check available slots

        if (Array.isArray(dayData.availableSlots)) {

          dayData.availableSlots.forEach((slot, slotIndex) => {

            if (slot && slot.localDateString === targetDateStr) {

              availableSlots.push(slot);

            }

          });

        }

      });



      return { appointments, availableSlots };

    } catch (error) {

      console.error('❌ Error getting events for date:', date, error);

      return { appointments: [], availableSlots: [] };

    }

  }, [allCalendarData, calendarData]);



  // Handle date click - opens day details modal

  const handleDateClick = useCallback((date) => {

    setSelectedDate(date);

    const events = getEventsForDate(date);

    setSelectedDayEvents({

      date: date,

      appointments: events.appointments || [],

      availableSlots: events.availableSlots || []

    });

    onDayDetailsModalOpen();

  }, [getEventsForDate, onDayDetailsModalOpen]);



  const handleMoreEventsClick = useCallback((date) => {

    handleDateClick(date);

  }, [handleDateClick]);



  // Working Hours Management

  const addWorkingHour = useCallback(() => {

    setAvailabilityForm(prev => ({

      ...prev,

      workingHours: [...prev.workingHours, {

        dayOfWeek: 1,

        startTime: '09:00',

        endTime: '17:00'

      }]

    }));

  }, []);



  const removeWorkingHour = useCallback((index) => {

    setAvailabilityForm(prev => ({

      ...prev,

      workingHours: prev.workingHours.filter((_, i) => i !== index)

    }));

  }, []);



  const updateWorkingHour = useCallback((index, field, value) => {

    setAvailabilityForm(prev => ({

      ...prev,

      workingHours: prev.workingHours.map((wh, i) => 

        i === index ? { ...wh, [field]: value } : wh

      )

    }));

  }, []);



  // Get or create working hour for a specific day

  const getWorkingHourForDay = useCallback((dayOfWeek) => {

    const existing = availabilityForm.workingHours.find(wh => wh.dayOfWeek === dayOfWeek);

    if (existing) return existing;

    return { dayOfWeek, startTime: '09:00', endTime: '17:00' };

  }, [availabilityForm.workingHours]);



  // Toggle day enabled/disabled

  const toggleDayEnabled = useCallback((dayOfWeek) => {

    const existingIndex = availabilityForm.workingHours.findIndex(wh => wh.dayOfWeek === dayOfWeek);

    if (existingIndex >= 0) {

      // Remove if exists

      setAvailabilityForm(prev => ({

        ...prev,

        workingHours: prev.workingHours.filter((_, i) => i !== existingIndex)

      }));

    } else {

      // Add if doesn't exist

      setAvailabilityForm(prev => ({

        ...prev,

        workingHours: [...prev.workingHours, { dayOfWeek, startTime: '09:00', endTime: '17:00' }]

      }));

    }

  }, [availabilityForm.workingHours]);



  // Update working hour for a specific day

  const updateDayWorkingHour = useCallback((dayOfWeek, field, value) => {

    const existingIndex = availabilityForm.workingHours.findIndex(wh => wh.dayOfWeek === dayOfWeek);

    if (existingIndex >= 0) {

      updateWorkingHour(existingIndex, field, value);

    } else {

      // Create new if doesn't exist

      setAvailabilityForm(prev => ({

        ...prev,

        workingHours: [...prev.workingHours, { dayOfWeek, startTime: '09:00', endTime: '17:00', [field]: value }]

      }));

    }

  }, [availabilityForm.workingHours, updateWorkingHour]);



  // Professional Time Picker Component

  const TimePicker = React.memo(({ value, onChange, isDisabled, field, dayIndex }) => {

    const [isOpen, setIsOpen] = useState(false);

    

    // Parse current value

    const currentHours = value ? parseInt(value.split(':')[0]) : 9;

    const currentMinutes = value ? parseInt(value.split(':')[1]) : 0;

    const [hours, setHours] = useState(currentHours);

    const [minutes, setMinutes] = useState(currentMinutes);



    // Update local state when value prop changes

    useEffect(() => {

      if (value) {

        const [h, m] = value.split(':');

        setHours(parseInt(h) || 9);

        setMinutes(parseInt(m) || 0);

      }

    }, [value]);



    const handleTimeChange = (newHours, newMinutes) => {

      const timeString = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;

      onChange(timeString);

      setHours(newHours);

      setMinutes(newMinutes);

      setIsOpen(false);

    };



    const formatTime = (timeValue) => {

      if (!timeValue) return 'Select time';

      const [h, m] = timeValue.split(':');

      const hour = parseInt(h);

      const minute = parseInt(m);

      const period = hour >= 12 ? 'PM' : 'AM';

      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

      return `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;

    };



    if (isDisabled) {

      return (

        <Box

          w="full"

          h="40px"

          bg="gray.100"

          border="1px solid"

          borderColor="gray.200"

          borderRadius="7px"

          display="flex"

          alignItems="center"

          px={3}

          cursor="not-allowed"

          opacity={0.4}

        >

          <Text fontSize="sm" color="gray.400">

            {formatTime(value)}

          </Text>

        </Box>

      );

    }



    return (

      <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom-start">

        <PopoverTrigger>

          <Box

            as="button"

            type="button"

            w="full"

            h="40px"

            bg="white"

            border="1px solid"

            borderColor="gray.300"

            borderRadius="7px"

            display="flex"

            alignItems="center"

            justifyContent="space-between"

            px={3}

            cursor="pointer"

            _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}

            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)' }}

            onClick={() => setIsOpen(true)}

          >

            <Text fontSize="sm" fontWeight="500" color={textColor}>

              {formatTime(value)}

            </Text>

            <Box as={FiClock} color="gray.400" boxSize={4} />

          </Box>

        </PopoverTrigger>

        <PopoverContent

          w="320px"

          borderRadius="7px"

          border="1px solid"

          borderColor="gray.200"

          boxShadow="xl"

          p={4}

          bg="white"

        >

          <PopoverArrow />

          <PopoverCloseButton />

          <PopoverHeader

            fontSize="sm"

            fontWeight="600"

            color={textColor}

            borderBottom="1px solid"

            borderColor="gray.100"

            pb={2}

            mb={3}

          >

            Select Time

          </PopoverHeader>

          <PopoverBody>

            <VStack spacing={4}>

              {/* Hours */}

              <Box w="full">

                <Text fontSize="xs" fontWeight="600" color={secondaryTextColor} mb={2} textTransform="uppercase" letterSpacing="0.5px">

                  Hour

                </Text>

                <Box

                  maxH="200px"

                  overflowY="auto"

                  css={{

                    '&::-webkit-scrollbar': {

                      width: '4px',

                    },

                    '&::-webkit-scrollbar-track': {

                      background: 'transparent',

                    },

                    '&::-webkit-scrollbar-thumb': {

                      background: '#CBD5E0',

                      borderRadius: '2px',

                    },

                  }}

                >

                  <SimpleGrid columns={6} spacing={2}>

                    {Array.from({ length: 24 }, (_, i) => (

                      <Button

                        key={i}

                        size="sm"

                        variant={hours === i ? 'solid' : 'ghost'}

                        colorScheme={hours === i ? 'blue' : 'gray'}

                        onClick={() => handleTimeChange(i, minutes)}

                        borderRadius="7px"

                        fontSize="xs"

                        fontWeight={hours === i ? '600' : '500'}

                        minW="40px"

                        h="40px"

                        _hover={{ bg: hours === i ? 'blue.600' : 'gray.100' }}

                      >

                        {i}

                      </Button>

                    ))}

                  </SimpleGrid>

                </Box>

              </Box>



              {/* Minutes */}

              <Box w="full">

                <Text fontSize="xs" fontWeight="600" color={secondaryTextColor} mb={2} textTransform="uppercase" letterSpacing="0.5px">

                  Minute

                </Text>

                <SimpleGrid columns={4} spacing={2}>

                  {[0, 15, 30, 45].map((m) => (

                    <Button

                      key={m}

                      size="sm"

                      variant={minutes === m ? 'solid' : 'ghost'}

                      colorScheme={minutes === m ? 'blue' : 'gray'}

                      onClick={() => handleTimeChange(hours, m)}

                      borderRadius="7px"

                      fontSize="xs"

                      fontWeight={minutes === m ? '600' : '500'}

                      minW="60px"

                      h="40px"

                      _hover={{ bg: minutes === m ? 'blue.600' : 'gray.100' }}

                    >

                      {String(m).padStart(2, '0')}

                    </Button>

                  ))}

                </SimpleGrid>

              </Box>



              {/* Quick Actions */}

              <HStack spacing={2} w="full" pt={2} borderTop="1px solid" borderColor="gray.100">

                <Button

                  size="sm"

                  variant="ghost"

                  onClick={() => handleTimeChange(9, 0)}

                  borderRadius="7px"

                  fontSize="xs"

                  flex={1}

                  _hover={{ bg: 'gray.100' }}

                >

                  9:00 AM

                </Button>

                <Button

                  size="sm"

                  variant="ghost"

                  onClick={() => handleTimeChange(12, 0)}

                  borderRadius="7px"

                  fontSize="xs"

                  flex={1}

                  _hover={{ bg: 'gray.100' }}

                >

                  12:00 PM

                </Button>

                <Button

                  size="sm"

                  variant="ghost"

                  onClick={() => handleTimeChange(17, 0)}

                  borderRadius="7px"

                  fontSize="xs"

                  flex={1}

                  _hover={{ bg: 'gray.100' }}

                >

                  5:00 PM

                </Button>

              </HStack>

            </VStack>

          </PopoverBody>

        </PopoverContent>

      </Popover>

    );

  });



  // Load availability first, then calendar data

  useEffect(() => {

    if (coachId && token) {

      fetchAvailability();

    }

  }, [coachId, token, fetchAvailability]);



  // Load question types on component mount

  useEffect(() => {

    fetchQuestionTypes();

  }, [fetchQuestionTypes]);



  // Load leads data when appointment type changes

  useEffect(() => {

    if (coachId && token) {

      // Clear existing calendar data first to prevent showing wrong appointments

      setCalendarData([]);

      setAllCalendarData([]);

      // First fetch leads data for the new appointment type

      fetchLeadsData();

    }

  }, [coachId, token, appointmentType, fetchLeadsData]);



  // Load staff data on component mount - Similar to Customer Leads

  useEffect(() => {

    if (coachId && token) {

      fetchStaffData();

    }

  }, [coachId, token, fetchStaffData]);



  // Debug effect removed



  // Sync booking form with appointment type

  useEffect(() => {

    setBookingForm(prev => ({

      ...prev,

      appointmentType: appointmentType

    }));

  }, [appointmentType]);



  // Load calendar data after leads are fetched - only once on initial mount
  useEffect(() => {

    if (coachId && token && availability && leads.length >= 0 && !hasInitialLoad.current) { // Only load once initially
      console.log(`📅 Initial loading calendar data with ${leads.length} leads for ${appointmentType} appointments`);
      hasInitialLoad.current = true; // Mark as loaded
      // Add a small delay to ensure leads are properly set and prevent race conditions

      const timer = setTimeout(() => {

        fetchCalendarData();

      }, 200);

      

      return () => clearTimeout(timer);

    }

  }, [coachId, token, availability, leads.length, fetchCalendarData]); // Removed appointmentType from deps to prevent re-loading on filter change
  
  // Refresh data when appointmentType changes (but don't show full loading skeleton)
  useEffect(() => {
    if (hasInitialLoad.current && coachId && token && availability) {
      // Only refresh data when filter changes - this will show brief loading in stats/calendar
      fetchCalendarData();
    }
  }, [appointmentType, fetchCalendarData, coachId, token, availability]); // Include all necessary deps


  // Auto-refresh functionality

  useEffect(() => {

    const interval = setInterval(() => {

      if (coachId && token && !loading && availability) {

        fetchCalendarData();

      }

    }, 60000); // Refresh every minute



    return () => clearInterval(interval);

  }, [coachId, token, loading, availability, appointmentType, fetchCalendarData]);



  // Calendar Navigation

  const navigateMonth = useCallback((direction) => {

    setCurrentDate(prev => {

      const newDate = new Date(prev);

      newDate.setMonth(prev.getMonth() + direction);

      return newDate;

    });

  }, []);



  const goToToday = useCallback(() => {

    setCurrentDate(new Date());

    setSelectedDate(new Date());

  }, []);



  // FIXED Calendar Grid Generation - Fixed December bug
  const getDaysInMonth = useMemo(() => {

    const year = currentDate.getFullYear();

    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);

    // Fix: Use explicit calculation to ensure correct days for all months including December
    // For December (month 11), month + 1 = 12, and new Date(year, 12, 0) gives Dec 31
    // This is the standard way to get the last day of any month
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();

    
    // Debug log to verify December calculation
    if (month === 11) {
      console.log(`December calculation: year=${year}, month=${month}, daysInMonth=${daysInMonth}, lastDay=${lastDay.toISOString()}`);
    }
    
    const startingDayOfWeek = firstDay.getDay();



    const days = [];

    

    // Previous month days

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {

      const prevDate = new Date(year, month, -i);

      days.push({ date: prevDate, isCurrentMonth: false });

    }

    

    // Current month days

    for (let day = 1; day <= daysInMonth; day++) {

      days.push({ date: new Date(year, month, day), isCurrentMonth: true });

    }

    

    // Next month days to fill the grid

    const remainingDays = 42 - days.length;

    for (let day = 1; day <= remainingDays; day++) {

      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });

    }

    

    return days;

  }, [currentDate]);



  // Utility Functions

  const isToday = useCallback((date) => {

    if (!date) return false;

    try {

      const today = new Date();

      return getLocalDateString(date) === getLocalDateString(today);

    } catch (error) {

      return false;

    }

  }, []);



  const isDayAvailable = useCallback((date) => {

    if (!date || !availability?.workingHours) return false;

    try {

      const dayOfWeek = date.getDay();

      return availability.workingHours.some(wh => wh.dayOfWeek === dayOfWeek);

    } catch (error) {

      return false;

    }

  }, [availability]);



  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];



  // View tab state - must be before early return

  const [viewTab, setViewTab] = useState(0); // 0 = Calendar, 1 = All Appointments



  // Color theme matching automation/AI pages - must be before early return

  const bgColor = useColorModeValue('white', 'gray.800');

  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');

  const borderColor = useColorModeValue('rgba(0, 0, 0, 0.08)', 'rgba(255, 255, 255, 0.1)');

  const textColor = useColorModeValue('gray.900', 'gray.100');

  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');

  const subtleBg = useColorModeValue('gray.50', 'gray.700');



  // Get filtered appointments for list view - must be before early return

  const filteredAppointments = useMemo(() => {

    // Flatten calendarData to get all appointments

    const allAppointments = calendarData.reduce((acc, day) => {

      if (day.appointments && Array.isArray(day.appointments)) {

        return [...acc, ...day.appointments];

      }

      return acc;

    }, []);

    

    let filtered = filterAppointmentsByType(allAppointments, appointmentType, leads);

    

    if (searchQuery) {

      filtered = filtered.filter(apt => {

        const lead = apt.lead || leads.find(l => (l._id || l.id) === apt.leadId);

        const leadName = lead?.name || lead?.firstName || '';

        const searchLower = searchQuery.toLowerCase();

        return leadName.toLowerCase().includes(searchLower) ||

               (apt.title || '').toLowerCase().includes(searchLower) ||

               (apt.notes || '').toLowerCase().includes(searchLower);

      });

    }

    

    if (filterStatus !== 'all') {

      filtered = filtered.filter(apt => apt.status === filterStatus);

    }

    

    return filtered.sort((a, b) => {

      const dateA = new Date(a.startTime || a.start);

      const dateB = new Date(b.startTime || b.start);

      return dateA - dateB;

    });

  }, [calendarData, appointmentType, leads, searchQuery, filterStatus]);



  // Calculate stats for stat cards - must be before early return

  const allAppointments = useMemo(() => {

    if (!calendarData || calendarData.length === 0) return [];

    return calendarData.flatMap(day => day.appointments || []);

  }, [calendarData]);



  const totalAppointments = allAppointments.length;

  const confirmedAppointments = allAppointments.filter(apt => apt.status === 'confirmed').length;

  const pendingAppointments = allAppointments.filter(apt => apt.status === 'pending').length;

  const totalAvailableSlots = useMemo(() => {

    if (!calendarData || calendarData.length === 0) return 0;

    return calendarData.reduce((total, day) => total + (day.availableSlots?.length || 0), 0);

  }, [calendarData]);



  // Loading state - removed early return, we'll show loading inline


  return (

    <Box bg="gray.50" minH="100vh" py={6} px={6}>

      <Box maxW="full" mx="auto">

        <VStack spacing={6} align="stretch" w="full">

          {/* Merged Top Section with Stats */}

          <Card 

            bg={cardBg} 

            backdropFilter="blur(20px)" 

            borderRadius="7px" 

            border="1px solid" 

            borderColor={borderColor}

            boxShadow="sm"

          >

            {/* Header with Title and Actions */}

            <CardHeader py={4} px={6} borderBottom="1px" borderColor="gray.100">

              <Flex justify="space-between" align="center">

                <Heading fontSize="2xl" fontWeight="700" color={textColor} letterSpacing="-0.5px">

                  Calendar

                </Heading>

                <HStack spacing={2}>

                  <IconButton

                    icon={<SettingsIcon />}

                    onClick={onAvailabilityModalOpen}

                    variant="ghost"

                    size="sm"

                    borderRadius="7px"

                    aria-label="Settings"

                    _hover={{ bg: 'gray.100' }}

                    color="gray.600"

                  />

                      <Button

                        leftIcon={<AddIcon />}

                        bg="blue.500"

                        color="white"

                    size="sm"

                        onClick={() => {

                          onLeadSearchModalOpen();

                          setBookingForm({

                            leadId: '',

                            startTime: '',

                            duration: 30,

                            notes: '',

                            timeZone: 'Asia/Kolkata'

                          });

                          setClientQuestionsForm({

                            watchedVideo: '',

                            healthGoal: '',

                            timelineForResults: '',

                            seriousnessLevel: '',

                            investmentRange: '',

                            startTimeline: '',

                            additionalInfo: '',

                            vslWatchPercentage: 0

                          });

                          setSelectedLead(null);

                          setLeadDetails(null);

                          setSelectedSlot(null);

                          setFormErrors({});

                          setIsFormValid(false);

                        }}

                    _hover={{ bg: 'blue.600' }}

                    borderRadius="7px"

                    fontWeight="500"

                        px={4}

                    fontSize="sm"

                      >

                    Book

                      </Button>

                    </HStack>

                </Flex>

            </CardHeader>

            

            {/* Stats Cards */}

            <CardBody px={6} py={5} borderBottom="1px" borderColor="gray.100">

              {loading ? (
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} variant="outline" borderRadius="xl" p={4}>
                      <HStack spacing={4} align="center" w="full">
                        <Skeleton height="60px" width="60px" borderRadius="xl" />
                        <VStack align="start" spacing={2} flex={1}>
                          <Skeleton height="16px" width="120px" borderRadius="md" />
                          <Skeleton height="32px" width="80px" borderRadius="lg" />
                        </VStack>
                      </HStack>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : (
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>

                    <StatsCard

                  title="Total"

                  value={totalAppointments}

                  icon={<Box as={FiCalendar} boxSize={5} />}

                  color="blue"

                    />

                    <StatsCard

                  title="Confirmed"

                  value={confirmedAppointments}

                  icon={<Box as={CheckCircleIcon} boxSize={5} />}

                      color="green"

                    />

                    <StatsCard

                  title="Pending"

                  value={pendingAppointments}

                  icon={<Box as={FiClock} boxSize={5} />}

                      color="orange"

                    />

                    <StatsCard

                  title="Available"

                  value={totalAvailableSlots}

                  icon={<Box as={TimeIcon} boxSize={5} />}

                      color="purple"

                    />

                  </SimpleGrid>

              )}
            </CardBody>



            {/* Search and Appointment Type */}

            <CardBody p={6} borderBottom="1px" borderColor="gray.100">

              <Flex direction={{ base: 'column', md: 'row' }} gap={3} align={{ base: 'stretch', md: 'center' }}>

                <InputGroup flex="1" maxW={{ base: 'full', md: '400px' }}>

                  <InputLeftElement pointerEvents="none">

                    <SearchIcon color="gray.400" boxSize={4} />

                  </InputLeftElement>

                  <Input

                    placeholder="Search appointments..."

                    value={searchQuery}

                    onChange={(e) => setSearchQuery(e.target.value)}

                    bg={subtleBg}

                    borderRadius="7px"

                    border="1px"

                    borderColor={borderColor}

                    _focus={{ 

                      borderColor: 'blue.400', 

                      bg: 'white',

                      boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)' 

                    }}

                    _hover={{ borderColor: 'gray.300', bg: 'white' }}

                    fontSize="sm"

                    pl={10}

                    h="40px"

                  />

                </InputGroup>

                

                {/* Animated Appointment Type Dropdown */}

                <Menu>

                  <MenuButton

                    as={Button}

                    rightIcon={<FiChevronDown />}

                    bg={subtleBg}

                    border="1px"

                    borderColor={borderColor}

                    borderRadius="7px"

                    h="40px"

                    fontSize="sm"

                    fontWeight="500"

                    color={textColor}

                    _hover={{ bg: 'white', borderColor: 'gray.300' }}

                    _expanded={{ bg: 'white', borderColor: 'blue.400', boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)' }}

                    transition="all 0.2s"

                    minW="160px"

                    justifyContent="space-between"

                  >

                    <HStack spacing={2}>

                      {appointmentType === 'all' && <Box as={FiUsers} />}

                      {appointmentType === 'coach' && <Box as={FiUser} />}

                      {appointmentType === 'client' && <Box as={FiUsers} />}

                      <Text>

                        {appointmentType === 'all' ? 'All Appointments' : appointmentType === 'coach' ? 'Coach' : 'Client'}

                      </Text>

                    </HStack>

                  </MenuButton>

                  <MenuList

                    bg={bgColor}

                    border="1px solid"

                    borderColor={borderColor}

                    boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"

                    minW="180px"

                    py={1}

                    borderRadius="7px"

                    animation="slideDown 0.2s ease-out"

                    sx={{

                      '@keyframes slideDown': {

                        from: {

                          opacity: 0,

                          transform: 'translateY(-10px)',

                        },

                        to: {

                          opacity: 1,

                          transform: 'translateY(0)',

                        },

                      },

                    }}

                  >

                    <MenuItem

                      icon={<Box as={FiUsers} />}

                      onClick={() => setAppointmentType('all')}

                      bg={appointmentType === 'all' ? 'blue.50' : 'transparent'}

                      color={appointmentType === 'all' ? 'blue.600' : textColor}

                      _hover={{ bg: appointmentType === 'all' ? 'blue.50' : 'gray.50' }}

                      borderRadius="7px"

                      mx={1}

                      my={0.5}

                    >

                      All Appointments

                    </MenuItem>

                    <MenuItem

                      icon={<Box as={FiUser} />}

                      onClick={() => setAppointmentType('coach')}

                      bg={appointmentType === 'coach' ? 'blue.50' : 'transparent'}

                      color={appointmentType === 'coach' ? 'blue.600' : textColor}

                      _hover={{ bg: appointmentType === 'coach' ? 'blue.50' : 'gray.50' }}

                      borderRadius="7px"

                      mx={1}

                      my={0.5}

                    >

                      Coach

                    </MenuItem>

                    <MenuItem

                      icon={<Box as={FiUsers} />}

                      onClick={() => setAppointmentType('client')}

                      bg={appointmentType === 'client' ? 'blue.50' : 'transparent'}

                      color={appointmentType === 'client' ? 'blue.600' : textColor}

                      _hover={{ bg: appointmentType === 'client' ? 'blue.50' : 'gray.50' }}

                      borderRadius="7px"

                      mx={1}

                      my={0.5}

                    >

                      Client

                    </MenuItem>

                  </MenuList>

                </Menu>

              </Flex>

            </CardBody>



            {/* Tab Bar Section */}

            <Tabs index={viewTab} onChange={setViewTab} variant="unstyled">

              <TabList borderBottom="1px" borderColor="gray.200" px={6} pt={4}>

                <Tab

                  _selected={{ color: 'blue.500', borderBottom: '2px solid', borderColor: 'blue.500' }}

                  color="gray.500"

                  fontWeight="600"

                  fontSize="sm"

                  pb={3}

                  px={4}

                  borderRadius="7px 7px 0 0"

                >

                  Calendar View

                </Tab>

                <Tab

                  _selected={{ color: 'blue.500', borderBottom: '2px solid', borderColor: 'blue.500' }}

                  color="gray.500"

                  fontWeight="600"

                  fontSize="sm"

                  pb={3}

                  px={4}

                  borderRadius="7px 7px 0 0"

                >

                  All Appointments

                </Tab>

              </TabList>

              

              <TabPanels>

                {/* Calendar View Tab */}

                <TabPanel p={0}>

                  {/* Calendar Header with Navigation and Controls */}

                  <Box 

                    px={6} 

                    py={4} 

                    borderBottom="1px" 

                    borderColor="gray.100"

                    position="relative"

                  >

                      <Flex justify="space-between" align="center">

                        {/* Left - Navigation */}

                        <HStack spacing={3}>

                  <Button 

                            variant="ghost" 

                    onClick={goToToday} 

                    leftIcon={<CalendarIcon />}

                            size="sm"

                            borderRadius="7px"

                            _hover={{ bg: 'gray.100' }}

                            fontWeight="500"

                            fontSize="sm"

                  >

                    Today

                  </Button>

                  

                          <HStack spacing={1}>

                    <IconButton

                      icon={<ChevronLeftIcon />}

                      onClick={() => navigateMonth(-1)}

                              variant="ghost"

                      aria-label="Previous month"

                              size="sm"

                              borderRadius="7px"

                              _hover={{ bg: 'gray.100' }}

                            />

                            <Text fontSize="md" fontWeight="600" minW="180px" textAlign="center" color={textColor}>

                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}

                    </Text>

                    <IconButton

                      icon={<ChevronRightIcon />}

                      onClick={() => navigateMonth(1)}

                              variant="ghost"

                      aria-label="Next month"

                              size="sm"

                              borderRadius="7px"

                              _hover={{ bg: 'gray.100' }}

                    />

                  </HStack>

                </HStack>

                

                        {/* Right - Status Filter, Refresh, and Indicator */}

                <HStack spacing={2}>

                          {/* Status Filter Icon */}

                          <Menu>

                            <MenuButton

                              as={IconButton}

                              icon={<Box as={FiFilter} />}

                              variant="ghost"

                              size="sm"

                              borderRadius="7px"

                              aria-label="Filter by status"

                              _hover={{ bg: 'gray.100' }}

                              color="gray.600"

                            />

                            <MenuList

                              bg={bgColor}

                              border="1px solid"

                              borderColor={borderColor}

                              boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"

                              borderRadius="7px"

                              py={1}

                              minW="160px"

                            >

                              <MenuItem

                                onClick={() => setFilterStatus('all')}

                                bg={filterStatus === 'all' ? 'blue.50' : 'transparent'}

                                color={filterStatus === 'all' ? 'blue.600' : textColor}

                                _hover={{ bg: filterStatus === 'all' ? 'blue.50' : 'gray.50' }}

                                borderRadius="7px"

                                mx={1}

                                my={0.5}

                              >

                                All Status

                              </MenuItem>

                              <MenuItem

                                onClick={() => setFilterStatus('confirmed')}

                                bg={filterStatus === 'confirmed' ? 'blue.50' : 'transparent'}

                                color={filterStatus === 'confirmed' ? 'blue.600' : textColor}

                                _hover={{ bg: filterStatus === 'confirmed' ? 'blue.50' : 'gray.50' }}

                                borderRadius="7px"

                                mx={1}

                                my={0.5}

                              >

                                Confirmed

                              </MenuItem>

                              <MenuItem

                                onClick={() => setFilterStatus('pending')}

                                bg={filterStatus === 'pending' ? 'blue.50' : 'transparent'}

                                color={filterStatus === 'pending' ? 'blue.600' : textColor}

                                _hover={{ bg: filterStatus === 'pending' ? 'blue.50' : 'gray.50' }}

                                borderRadius="7px"

                                mx={1}

                                my={0.5}

                              >

                                Pending

                              </MenuItem>

                              <MenuItem

                                onClick={() => setFilterStatus('canceled')}

                                bg={filterStatus === 'canceled' ? 'blue.50' : 'transparent'}

                                color={filterStatus === 'canceled' ? 'blue.600' : textColor}

                                _hover={{ bg: filterStatus === 'canceled' ? 'blue.50' : 'gray.50' }}

                                borderRadius="7px"

                                mx={1}

                                my={0.5}

                              >

                                Canceled

                              </MenuItem>

                              <MenuItem

                                onClick={() => setFilterStatus('completed')}

                                bg={filterStatus === 'completed' ? 'blue.50' : 'transparent'}

                                color={filterStatus === 'completed' ? 'blue.600' : textColor}

                                _hover={{ bg: filterStatus === 'completed' ? 'blue.50' : 'gray.50' }}

                                borderRadius="7px"

                                mx={1}

                                my={0.5}

                              >

                                Completed

                              </MenuItem>

                            </MenuList>

                          </Menu>



                          {/* Refresh Icon */}

                          <IconButton

                            icon={loading ? <Spinner size="sm" /> : <RepeatIcon />}

                            variant="ghost"

                            onClick={fetchCalendarData}

                            disabled={loading}

                            size="sm"

                            borderRadius="7px"

                            aria-label="Refresh"

                            _hover={{ bg: 'gray.100' }}

                            color="gray.600"

                          />



                          {/* Clean Indicator */}

                          <HStack spacing={3} ml={2} pl={3} borderLeft="1px" borderColor="gray.200">

                            <HStack spacing={1.5}>

                              <Box w="8px" h="8px" bg="blue.500" borderRadius="full" />

                              <Text fontSize="xs" color={secondaryTextColor} fontWeight="500">

                                Appointments

                              </Text>

                    </HStack>

                            <HStack spacing={1.5}>

                              <Box w="8px" h="8px" bg="green.500" borderRadius="full" />

                              <Text fontSize="xs" color={secondaryTextColor} fontWeight="500">

                                Available

                              </Text>

                    </HStack>

                </HStack>

              </HStack>

                      </Flex>

                    </Box>



                    <Box py={6} px={6}>

              <VStack spacing={4} align="stretch">

                        {/* Weekday Headers - Elegant */}

                        <Grid templateColumns="repeat(7, 1fr)" gap={3}>

                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (

                    <Box key={day} textAlign="center" py={2}>

                              <Text fontSize="xs" fontWeight="600" color={secondaryTextColor} letterSpacing="0.5px" textTransform="uppercase">

                        {day}

                      </Text>

                    </Box>

                  ))}

                </Grid>



                {loading ? (

                  <Center py={20} minH="700px">
                    <CircularProgress isIndeterminate color="blue.500" size="60px" thickness="4px" />
                  </Center>

                ) : (

                  <Grid templateColumns="repeat(7, 1fr)" gap={3} minH="700px">

                    {getDaysInMonth.map((day, index) => {

                      const events = getEventsForDate(day.date);

                      const appointments = events.appointments || [];

                      const availableSlots = events.availableSlots || [];

                      const totalEvents = appointments.length + availableSlots.length;

                      const isAvailable = isDayAvailable(day.date);

                      const todayDate = isToday(day.date);



                      return (

                        <Box

                          key={index}

                          bg={todayDate ? 'blue.50' : day.isCurrentMonth ? 'white' : 'transparent'}

                          border="1px solid"

                          borderColor={todayDate ? 'blue.300' : day.isCurrentMonth ? 'gray.200' : 'transparent'}

                          borderRadius="7px"

                          minH="140px"

                          p={3}

                          cursor="pointer"

                          position="relative"

                          _hover={{ 

                            shadow: 'sm', 

                            borderColor: todayDate ? 'blue.400' : 'blue.300',

                            bg: todayDate ? 'blue.50' : 'gray.50',

                            transform: 'translateY(-1px)'

                          }}

                          transition="all 0.2s ease"

                          onClick={() => handleDateClick(day.date)}

                          opacity={day.isCurrentMonth ? 1 : 0.4}

                        >

                          {/* Day Number - Clean Design */}

                          <Flex justify="space-between" align="start" mb={2}>

                                  <Text

                              fontSize="sm"

                              fontWeight={todayDate ? '700' : '600'}

                              color={todayDate ? 'blue.600' : day.isCurrentMonth ? textColor : secondaryTextColor}

                                  >

                                    {day.date.getDate()}

                                  </Text>

                                  {todayDate && (

                              <Box

                                w="6px"

                                h="6px"

                                bg="blue.500"

                                      borderRadius="full" 

                              />

                            )}

                            {totalEvents > 0 && !todayDate && (

                              <Box

                                w="6px"

                                h="6px"

                                bg="blue.400"

                                borderRadius="full"

                                opacity={0.6}

                              />

                            )}

                          </Flex>

                          

                          {/* Events - Appointments show individually, Slots show combined */}

                          <VStack spacing={1.5} align="stretch" mt={2}>

                            {/* Individual Appointment Cards */}

                            {appointments.length > 0 && (

                              <VStack spacing={1} align="stretch">

                                {appointments.map((apt, aptIndex) => {

                                  const appointmentColor = getAppointmentColor(apt, leads);

                                  const lead = apt.lead || leads.find(l => (l._id || l.id) === apt.leadId);

                                  const leadName = lead?.name || lead?.firstName || lead?.clientQuestions?.fullName || 'Unknown';

                                  

                                  return (

                                    <Box

                                      key={`apt-${aptIndex}`}

                                      px={2}

                                      py={1.5}

                                      bg={`${appointmentColor}.50`}

                                      borderRadius="7px"

                                      borderLeft="3px solid"

                                      borderLeftColor={`${appointmentColor}.500`}

                                      cursor="pointer"

                                      _hover={{ 

                                        bg: `${appointmentColor}.100`,

                                        transform: 'translateX(2px)'

                                      }}

                                      transition="all 0.15s"

                                      onClick={(e) => {

                                        e.stopPropagation();

                                        handleAppointmentClick(apt);

                                      }}

                                    >

                                      <VStack align="start" spacing={0.5}>

                                        <Text fontSize="2xs" fontWeight="600" color={`${appointmentColor}.700`} noOfLines={1}>

                                          {apt.displayTime || formatTimeWithTimezone(apt.startTime || apt.start)}

                                          </Text>

                                        <Text fontSize="2xs" fontWeight="500" color={`${appointmentColor}.600`} noOfLines={1}>

                                          {leadName}

                                            </Text>

                                      </VStack>

                                    </Box>

                                  );

                                })}

                              </VStack>

                            )}

                            

                            {/* Combined Available Slots Count */}

                            {availableSlots.length > 0 && (

                              <HStack spacing={1.5} px={2} py={1} bg="green.50" borderRadius="7px" border="1px solid" borderColor="green.100">

                                <Box w="6px" h="6px" bg="green.500" borderRadius="full" />

                                <Text fontSize="2xs" fontWeight="600" color="green.700">

                                  {availableSlots.length} {availableSlots.length === 1 ? 'slot' : 'slots'}

                                </Text>

                              </HStack>

                            )}

                            

                            {/* Empty State */}

                            {totalEvents === 0 && isAvailable && day.isCurrentMonth && (

                              <Box

                                h="24px"

                                borderRadius="7px"

                                border="1px dashed"

                                borderColor="gray.200"

                                display="flex"

                                alignItems="center"

                                justifyContent="center"

                              >

                                <Text fontSize="2xs" color="gray.400" fontWeight="500">

                                  Available

                                      </Text>

                                  </Box>

                            )}

                          </VStack>

                        </Box>

                      );

                    })}

                  </Grid>

                )}

              </VStack>

                    </Box>

                </TabPanel>



                {/* All Appointments Tab */}

                <TabPanel p={6}>

                  <Card 

                    bg={cardBg} 

                    backdropFilter="blur(20px)"

                    borderRadius="7px" 

                    boxShadow="sm" 

                    border="1px solid" 

                    borderColor={borderColor}

                  >

                    <CardBody p={0}>

                      {loading ? (

                        <Center py={20}>

                          <VStack spacing={4}>

                            <Spinner size="xl" color="blue.500" thickness="4px" />

                            <Text color="gray.600">Loading appointments...</Text>

                          </VStack>

                        </Center>

                      ) : filteredAppointments.length === 0 ? (

                        <Center py={20}>

                          <VStack spacing={3}>

                            <Box as={FiCalendar} size="48px" color="gray.300" />

                            <Text color="gray.500" fontSize="lg" fontWeight="500">

                              No appointments found

                            </Text>

                            <Text color="gray.400" fontSize="sm">

                              Try adjusting your filters or book a new appointment

                                      </Text>

                                    </VStack>

                                  </Center>

                      ) : (

                        <VStack spacing={0} align="stretch" divider={<Divider />}>

                          {filteredAppointments.map((apt, index) => {

                            const appointmentColor = getAppointmentColor(apt, leads);

                            const lead = apt.lead || leads.find(l => (l._id || l.id) === apt.leadId);

                            const leadName = lead?.name || lead?.firstName || 'Unknown';

                            const leadType = lead ? getLeadType(lead) : 'Unknown';

                            const leadTypeColor = getLeadTypeColor(leadType);

                            const assignedStaff = apt.lead?.assignedTo || apt.assignedTo;

                            

                            return (

                              <Box

                                key={apt._id || apt.id || index}

                                p={4}

                                _hover={{ bg: 'gray.50' }}

                                cursor="pointer"

                                onClick={() => handleAppointmentClick(apt)}

                                transition="all 0.2s"

                              >

                                <Flex justify="space-between" align="start" gap={4}>

                                  <HStack spacing={4} flex="1">

                                    <Box

                                      w="4px"

                                      h="full"

                                      minH="60px"

                                      bg={`${appointmentColor}.500`}

                                      borderRadius="7px"

                                    />

                                    <VStack align="start" spacing={1} flex="1">

                                      <HStack spacing={2} w="full">

                                        <Text fontSize="md" fontWeight="600" color={textColor}>

                                          {leadName}

                                    </Text>

                                        <Badge colorScheme={leadTypeColor} variant="subtle" borderRadius="7px" fontSize="xs">

                                          {leadType}

                                        </Badge>

                                        <StatusBadge status={apt.status} />

                                      </HStack>

                                      <HStack spacing={4} fontSize="sm" color={secondaryTextColor}>

                                        <HStack spacing={1}>

                                          <TimeIcon />

                                          <Text>{apt.displayTime || formatTimeWithTimezone(apt.startTime || apt.start)}</Text>

                                        </HStack>

                                        <HStack spacing={1}>

                                          <CalendarIcon />

                                          <Text>{formatDateWithTimezone(apt.startTime || apt.start)}</Text>

                                        </HStack>

                                        {apt.duration && (

                                          <Text>{apt.duration} min</Text>

                                        )}

                                      </HStack>

                                      {assignedStaff && getStaffDisplayName && (

                                        <HStack spacing={1} fontSize="xs" color="purple.600">

                                          <Box as={FiUser} />

                                          <Text fontWeight="500">{getStaffDisplayName(assignedStaff)}</Text>

                                        </HStack>

                                      )}

                                      {apt.notes && (

                                        <Text fontSize="sm" color={secondaryTextColor} noOfLines={2} mt={1}>

                                          {apt.notes}

                                        </Text>

                                )}

                              </VStack>

                                  </HStack>

                                  <HStack spacing={2}>

                                    <IconButton

                                      icon={<EditIcon />}

                                      variant="ghost"

                                      size="sm"

                                      borderRadius="7px"

                                      aria-label="Edit appointment"

                                      onClick={(e) => {

                                        e.stopPropagation();

                                        handleAppointmentClick(apt);

                                      }}

                                    />

                                    <IconButton

                                      icon={<DeleteIcon />}

                                      variant="ghost"

                                      size="sm"

                                      colorScheme="red"

                                      borderRadius="7px"

                                      aria-label="Delete appointment"

                                      onClick={(e) => {

                                        e.stopPropagation();

                                        // Handle delete

                                      }}

                                    />

                                  </HStack>

                                </Flex>

                              </Box>

                      );

                    })}

              </VStack>

                      )}

            </CardBody>

                  </Card>

                </TabPanel>

              </TabPanels>

            </Tabs>

          </Card>



          {/* MODALS START HERE */}



          {/* Lead Search Modal */}

          <Modal isOpen={isLeadSearchModalOpen} onClose={onLeadSearchModalClose} size="xl">

            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />

            <ModalContent borderRadius="2xl">

              <ModalHeader>

                <HStack>

                  <SearchIcon color="blue.500" />

                  <Text>Search and Select Lead</Text>

                </HStack>

              </ModalHeader>

              <ModalCloseButton />

              

              <ModalBody>

                <VStack spacing={6} align="stretch">

                  {/* Search Box */}

                  <HStack>

                    <InputGroup flex="1">

                      <InputLeftElement>

                        <SearchIcon color="gray.400" />

                      </InputLeftElement>

                      <Input

                        placeholder="Search leads by name, email, or phone..."

                        value={leadSearchQuery}

                        onChange={(e) => setLeadSearchQuery(e.target.value)}

                      />

                    </InputGroup>

                    <Button 

                      colorScheme="blue"

                      onClick={() => fetchLeadsData()}

                      isLoading={loadingLeads}

                      loadingText="Searching..."

                    >

                      Search

                    </Button>

                  </HStack>



                  {/* Selected Slot Info */}

                  {selectedSlot && (

                    <Card>

                      <CardBody>

                        <VStack align="start" spacing={2}>

                          <Text fontWeight="bold" color="blue.600">Selected Time Slot</Text>

                          <HStack spacing={4}>

                            <HStack>

                              <TimeIcon color="blue.500" />

                              <Text>{selectedSlot.displayTime}</Text>

                            </HStack>

                            <HStack>

                              <CalendarIcon color="green.500" />

                              <Text>{selectedSlot.duration || 30} minutes</Text>

                            </HStack>

                          </HStack>

                        </VStack>

                      </CardBody>

                    </Card>

                  )}



                  {/* Leads List */}

                  {loadingLeads ? (

                    <Center py={10}>

                      <VStack spacing={4}>

                        <Spinner size="xl" color="blue.500" />

                        <Text color="gray.600">Searching leads...</Text>

                      </VStack>

                    </Center>

                  ) : (

                    <VStack spacing={3} align="stretch" maxH="400px" overflowY="auto">

                      {leads.length > 0 ? (

                        leads.map((lead) => (

                          <Card

                            key={lead._id || lead.id}

                            cursor="pointer"

                            _hover={{ shadow: 'md', transform: 'translateY(-1px)' }}

                            transition="all 0.2s"

                            onClick={() => handleLeadSelect(lead)}

                          >

                            <CardBody>

                              <HStack spacing={4}>

                                <Avatar

                                  name={lead.clientQuestions?.fullName || lead.name || 'Lead'}

                                  size="md"

                                  bg="blue.500"

                                  color="white"

                                />

                                <VStack align="start" spacing={1} flex="1">

                                  <HStack justify="space-between" w="full">

                                    <Text fontWeight="bold">

                                      {lead.clientQuestions?.fullName || lead.name || 'Unknown Lead'}

                                    </Text>

                                    <Badge colorScheme={getLeadTypeColor(getLeadType(lead))} size="sm" fontSize="xs">

                                      {getLeadType(lead)}

                                    </Badge>

                                  </HStack>

                                  <Text color="gray.600" fontSize="sm">

                                    {lead.clientQuestions?.email || lead.email || 'No email'}

                                  </Text>

                                  {lead.clientQuestions?.whatsappNumber && (

                                    <HStack spacing={1}>

                                      <PhoneIcon fontSize="xs" color="green.500" />

                                      <Text fontSize="sm" color="gray.600">

                                        {lead.clientQuestions.whatsappNumber}

                                      </Text>

                                    </HStack>

                                  )}

                                  <HStack spacing={4} fontSize="xs" color="gray.500">

                                    {lead.clientQuestions?.profession && (

                                      <Text>{lead.clientQuestions.profession}</Text>

                                    )}

                                    {lead.clientQuestions?.cityCountry && (

                                      <Text>{lead.clientQuestions.cityCountry}</Text>

                                    )}

                                  </HStack>

                                </VStack>

                                <ArrowForwardIcon color="gray.400" />

                              </HStack>

                            </CardBody>

                          </Card>

                        ))

                      ) : (

                        <Center py={10}>

                          <VStack spacing={4}>

                            <SearchIcon fontSize="3xl" color="gray.400" />

                            <VStack spacing={2}>

                              <Text fontSize="lg" fontWeight="semibold" color="gray.600">

                                No leads found

                              </Text>

                              <Text color="gray.500" textAlign="center">

                                Try adjusting your search terms or load all leads.

                              </Text>

                            </VStack>

                            <Button variant="outline" onClick={() => fetchLeadsData()}>

                              Load All Leads

                            </Button>

                          </VStack>

                        </Center>

                      )}

                    </VStack>

                  )}

                </VStack>

              </ModalBody>



              <ModalFooter>

                <Button onClick={onLeadSearchModalClose}>Cancel</Button>

              </ModalFooter>

            </ModalContent>

          </Modal>



          {/* Booking Modal */}

          <Modal isOpen={isBookingModalOpen} onClose={onBookingModalClose} size="4xl">

            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />

            <ModalContent borderRadius="2xl">

              <ModalHeader>

                <HStack>

                  <AddIcon color="blue.500" />

                  <Text>Book New Appointment</Text>

                </HStack>

              </ModalHeader>

              <ModalCloseButton />

              

              <ModalBody>

                <VStack spacing={6} align="stretch">

                  {/* Selected Slot Info */}

                  {selectedSlot && (

                    <Card>

                      <CardBody>

                        <VStack align="start" spacing={2}>

                          <Text fontWeight="bold" color="blue.600">Selected Time Slot</Text>

                          <HStack spacing={4}>

                            <HStack>

                              <TimeIcon color="blue.500" />

                              <Text>{selectedSlot.displayTime}</Text>

                            </HStack>

                            <HStack>

                              <CalendarIcon color="green.500" />

                              <Text>{selectedSlot.duration || availability?.defaultAppointmentDuration || 30} minutes</Text>

                            </HStack>

                          </HStack>

                        </VStack>

                      </CardBody>

                    </Card>

                  )}



                  {/* Selected Lead Info */}

                  {selectedLead && (

                    <Card>

                      <CardBody>

                        <VStack align="start" spacing={3}>

                          <HStack justify="space-between" w="full">

                            <Text fontWeight="bold" color="blue.600">Selected Lead</Text>

                            <Button

                              size="sm"

                              variant="outline"

                              onClick={() => {

                                onBookingModalClose();

                                onLeadSearchModalOpen();

                              }}

                            >

                              Change Lead

                            </Button>

                          </HStack>

                          <HStack spacing={4}>

                            <Avatar

                              name={selectedLead.clientQuestions?.fullName || selectedLead.name || 'Lead'}

                              size="md"

                              bg="blue.500"

                              color="white"

                            />

                            <VStack align="start" spacing={1}>

                              <Text fontWeight="medium">

                                {selectedLead.clientQuestions?.fullName || selectedLead.name || 'Unknown Lead'}

                              </Text>

                              <Text fontSize="sm" color="gray.600">

                                {selectedLead.clientQuestions?.email || selectedLead.email || 'No email'}

                              </Text>

                              {selectedLead.clientQuestions?.whatsappNumber && (

                                <Text fontSize="sm" color="gray.600">

                                  {selectedLead.clientQuestions.whatsappNumber}

                                </Text>

                              )}

                            </VStack>

                          </HStack>

                        </VStack>

                      </CardBody>

                    </Card>

                  )}



                  {/* Appointment Details Form */}

                  <Card>

                    <CardHeader>

                      <Heading size="md">Appointment Details</Heading>

                    </CardHeader>

                    <CardBody>

                      <VStack spacing={4}>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">

                          <FormControl isRequired>

                            <FormLabel>Lead ID</FormLabel>

                            <Input

                              value={bookingForm.leadId}

                              onChange={(e) => setBookingForm(prev => ({...prev, leadId: e.target.value}))}

                              placeholder="Lead ID (auto-filled when lead selected)"

                              isReadOnly={!!selectedLead}

                              bg={selectedLead ? 'gray.50' : 'white'}

                            />

                          </FormControl>

                          

                          <FormControl isRequired>

                            <FormLabel>Date & Time</FormLabel>

                            <Input

                              type="datetime-local"

                              value={bookingForm.startTime ? new Date(bookingForm.startTime).toISOString().slice(0, 16) : ''}

                              onChange={(e) => setBookingForm(prev => ({...prev, startTime: new Date(e.target.value).toISOString()}))}

                            />

                          </FormControl>

                        </SimpleGrid>



                        <FormControl>

                          <FormLabel>Duration</FormLabel>

                          <Select

                            value={bookingForm.duration}

                            onChange={(e) => setBookingForm(prev => ({...prev, duration: parseInt(e.target.value)}))}

                          >

                            <option value={15}>15 minutes</option>

                            <option value={30}>30 minutes</option>

                            <option value={45}>45 minutes</option>

                            <option value={60}>60 minutes</option>

                            <option value={90}>90 minutes</option>

                            <option value={120}>120 minutes</option>

                          </Select>

                        </FormControl>



                        <FormControl>

                          <FormLabel>Notes</FormLabel>

                          <Textarea

                            value={bookingForm.notes}

                            onChange={(e) => setBookingForm(prev => ({...prev, notes: e.target.value}))}

                            placeholder="Add any special instructions or notes..."

                            rows={4}

                            resize="vertical"

                          />

                        </FormControl>

                      </VStack>

                    </CardBody>

                  </Card>



                  {/* Form Validation Summary */}

                  {Object.keys(formErrors).length > 0 && (

                    <Card borderColor="red.200" bg="red.50">

                      <CardBody>

                        <VStack align="start" spacing={2}>

                          <HStack>

                            <WarningIcon color="red.500" />

                            <Text fontWeight="bold" color="red.700">Please fix the following issues:</Text>

                          </HStack>

                          <VStack align="start" spacing={1}>

                            {Object.entries(formErrors).map(([field, error]) => (

                              <Text key={field} fontSize="sm" color="red.600">

                                • {error}

                              </Text>

                            ))}

                          </VStack>

                        </VStack>

                      </CardBody>

                    </Card>

                  )}



                  {/* Client Questions Form */}

                  <Card>

                    <CardHeader>

                      <HStack justify="space-between">

                        <VStack align="start" spacing={1}>

                          <Heading size="md">Client Assessment Questions</Heading>

                          <Text fontSize="sm" color="gray.600">

                            Please fill out these questions to better understand the client's needs

                          </Text>

                        </VStack>

                        <Badge 

                          colorScheme={isFormValid ? "green" : "orange"} 

                          variant="subtle" 

                          px={3} 

                          py={1} 

                          borderRadius="full"

                        >

                          {isFormValid ? "Complete" : `${Object.keys(formErrors).length} Issues`}

                        </Badge>

                      </HStack>

                    </CardHeader>

                    <CardBody>

                      <VStack spacing={4}>

                        {/* Step 1: Fitness Assessment */}

                        <Box w="full">

                          <Text fontSize="md" fontWeight="semibold" mb={3} color="blue.600">

                            1. Fitness Assessment

                          </Text>

                          <VStack spacing={3} align="stretch">

                            <FormControl isRequired isInvalid={!!formErrors.watchedVideo}>

                              <FormLabel fontSize="sm">Did you watch the full video before booking this call?</FormLabel>

                              <Select

                                value={clientQuestionsForm.watchedVideo}

                                onChange={(e) => setClientQuestionsForm(prev => ({...prev, watchedVideo: e.target.value}))}

                                placeholder="Select..."

                                bg="white"

                                borderColor={formErrors.watchedVideo ? "red.300" : "gray.300"}

                                _focus={{ borderColor: formErrors.watchedVideo ? "red.500" : "blue.500" }}

                              >

                                <option value="Yes">Yes</option>

                                <option value="No">No</option>

                              </Select>

                              {formErrors.watchedVideo && (

                                <FormErrorMessage fontSize="xs">{formErrors.watchedVideo}</FormErrorMessage>

                              )}

                            </FormControl>



                            <FormControl isRequired isInvalid={!!formErrors.healthGoal}>

                              <FormLabel fontSize="sm">Primary Health Goal</FormLabel>

                              <Select

                                value={clientQuestionsForm.healthGoal}

                                onChange={(e) => setClientQuestionsForm(prev => ({...prev, healthGoal: e.target.value}))}

                                placeholder="Select Goal"

                                bg="white"

                                borderColor={formErrors.healthGoal ? "red.300" : "gray.300"}

                                _focus={{ borderColor: formErrors.healthGoal ? "red.500" : "blue.500" }}

                              >

                                <option value="Lose Weight (5-15 kg)">Lose Weight (5-15 kg)</option>

                                <option value="Lose Weight (15+ kg)">Lose Weight (15+ kg)</option>

                                <option value="Gain Weight/Muscle">Gain Weight/Muscle</option>

                                <option value="Improve Fitness & Energy">Improve Fitness & Energy</option>

                                <option value="Manage Health Condition (Diabetes, PCOS, Thyroid)">Manage Health Condition (Diabetes, PCOS, Thyroid)</option>

                                <option value="General Wellness & Lifestyle">General Wellness & Lifestyle</option>

                                <option value="Other">Other</option>

                              </Select>

                              {formErrors.healthGoal && (

                                <FormErrorMessage fontSize="xs">{formErrors.healthGoal}</FormErrorMessage>

                              )}

                            </FormControl>



                            <FormControl isRequired isInvalid={!!formErrors.timelineForResults}>

                              <FormLabel fontSize="sm">Timeline for Results</FormLabel>

                              <Select

                                value={clientQuestionsForm.timelineForResults}

                                onChange={(e) => setClientQuestionsForm(prev => ({...prev, timelineForResults: e.target.value}))}

                                placeholder="Select Timeline"

                                bg="white"

                                borderColor={formErrors.timelineForResults ? "red.300" : "gray.300"}

                                _focus={{ borderColor: formErrors.timelineForResults ? "red.500" : "blue.500" }}

                              >

                                <option value="1-3 months (Urgent)">1-3 months (Urgent)</option>

                                <option value="3-6 months (Moderate)">3-6 months (Moderate)</option>

                                <option value="6-12 months (Gradual)">6-12 months (Gradual)</option>

                                <option value="No specific timeline">No specific timeline</option>

                              </Select>

                              {formErrors.timelineForResults && (

                                <FormErrorMessage fontSize="xs">{formErrors.timelineForResults}</FormErrorMessage>

                              )}

                            </FormControl>

                          </VStack>

                        </Box>



                        {/* Step 2: Commitment & Investment */}

                        <Box w="full">

                          <Text fontSize="md" fontWeight="semibold" mb={3} color="green.600">

                            2. Commitment & Investment

                          </Text>

                          <VStack spacing={3} align="stretch">

                            <FormControl isRequired isInvalid={!!formErrors.seriousnessLevel}>

                              <FormLabel fontSize="sm">How serious are you about achieving your goals?</FormLabel>

                              <Select

                                value={clientQuestionsForm.seriousnessLevel}

                                onChange={(e) => setClientQuestionsForm(prev => ({...prev, seriousnessLevel: e.target.value}))}

                                placeholder="Select Level"

                                bg="white"

                                borderColor={formErrors.seriousnessLevel ? "red.300" : "gray.300"}

                                _focus={{ borderColor: formErrors.seriousnessLevel ? "red.500" : "blue.500" }}

                              >

                                <option value="Very serious - willing to invest time and money">Very serious - willing to invest time and money</option>

                                <option value="Serious - depends on the approach">Serious - depends on the approach</option>

                                <option value="Somewhat serious - exploring options">Somewhat serious - exploring options</option>

                                <option value="Just curious about possibilities">Just curious about possibilities</option>

                              </Select>

                              {formErrors.seriousnessLevel && (

                                <FormErrorMessage fontSize="xs">{formErrors.seriousnessLevel}</FormErrorMessage>

                              )}

                            </FormControl>



                            <FormControl isRequired isInvalid={!!formErrors.investmentRange}>

                              <FormLabel fontSize="sm">What investment range works for you?</FormLabel>

                              <Select

                                value={clientQuestionsForm.investmentRange}

                                onChange={(e) => setClientQuestionsForm(prev => ({...prev, investmentRange: e.target.value}))}

                                placeholder="Select Range"

                                bg="white"

                                borderColor={formErrors.investmentRange ? "red.300" : "gray.300"}

                                _focus={{ borderColor: formErrors.investmentRange ? "red.500" : "blue.500" }}

                              >

                                <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000</option>

                                <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>

                                <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>

                                <option value="₹1,00,000+ (Premium programs)">₹1,00,000+ (Premium programs)</option>

                                <option value="Need to understand value first">Need to understand value first</option>

                              </Select>

                              {formErrors.investmentRange && (

                                <FormErrorMessage fontSize="xs">{formErrors.investmentRange}</FormErrorMessage>

                              )}

                            </FormControl>



                            <FormControl isRequired isInvalid={!!formErrors.startTimeline}>

                              <FormLabel fontSize="sm">When would you like to start?</FormLabel>

                              <Select

                                value={clientQuestionsForm.startTimeline}

                                onChange={(e) => setClientQuestionsForm(prev => ({...prev, startTimeline: e.target.value}))}

                                placeholder="Select Timeline"

                                bg="white"

                                borderColor={formErrors.startTimeline ? "red.300" : "gray.300"}

                                _focus={{ borderColor: formErrors.startTimeline ? "red.500" : "blue.500" }}

                              >

                                <option value="Immediately (This week)">Immediately (This week)</option>

                                <option value="Within 2 weeks">Within 2 weeks</option>

                                <option value="Within a month">Within a month</option>

                                <option value="In 2-3 months">In 2-3 months</option>

                                <option value="Just exploring for now">Just exploring for now</option>

                              </Select>

                              {formErrors.startTimeline && (

                                <FormErrorMessage fontSize="xs">{formErrors.startTimeline}</FormErrorMessage>

                              )}

                            </FormControl>

                          </VStack>

                        </Box>



                        {/* Step 3: Additional Information */}

                        <Box w="full">

                          <Text fontSize="md" fontWeight="semibold" mb={3} color="purple.600">

                            3. Additional Information

                          </Text>

                          <VStack spacing={3} align="stretch">

                            <FormControl>

                              <FormLabel fontSize="sm">Any additional information you'd like to share?</FormLabel>

                              <Textarea

                                value={clientQuestionsForm.additionalInfo}

                                onChange={(e) => setClientQuestionsForm(prev => ({...prev, additionalInfo: e.target.value}))}

                                placeholder="Tell us about your fitness journey, challenges, or specific goals..."

                                rows={3}

                                resize="vertical"

                              />

                            </FormControl>



                            <FormControl isInvalid={!!formErrors.vslWatchPercentage}>

                              <FormLabel fontSize="sm">

                                How much of our video did you watch? ({clientQuestionsForm.vslWatchPercentage}%)

                              </FormLabel>

                              <NumberInput

                                value={clientQuestionsForm.vslWatchPercentage}

                                onChange={(value) => setClientQuestionsForm(prev => ({...prev, vslWatchPercentage: parseFloat(value) || 0}))}

                                min={0}

                                max={100}

                                step={5}

                                bg="white"

                                borderColor={formErrors.vslWatchPercentage ? "red.300" : "gray.300"}

                                _focus={{ borderColor: formErrors.vslWatchPercentage ? "red.500" : "blue.500" }}

                              >

                                <NumberInputField />

                                <NumberInputStepper>

                                  <NumberIncrementStepper />

                                  <NumberDecrementStepper />

                                </NumberInputStepper>

                              </NumberInput>

                              {formErrors.vslWatchPercentage && (

                                <FormErrorMessage fontSize="xs">{formErrors.vslWatchPercentage}</FormErrorMessage>

                              )}

                            </FormControl>

                          </VStack>

                        </Box>

                      </VStack>

                    </CardBody>

                  </Card>

                </VStack>

              </ModalBody>



              <ModalFooter>

                <ButtonGroup spacing={3}>

                  <Button onClick={onBookingModalClose}>Cancel</Button>

                  <Button

                    colorScheme="blue"

                    onClick={bookAppointment}

                    isLoading={loading}

                    loadingText="Booking..."

                    disabled={!bookingForm.leadId || !bookingForm.startTime || !isFormValid}

                    leftIcon={<CheckCircleIcon />}

                    _disabled={{ 

                      opacity: 0.6, 

                      cursor: 'not-allowed',

                      bg: 'gray.300'

                    }}

                  >

                    {!isFormValid ? 'Complete Required Questions' : 'Book Appointment'}

                  </Button>

                </ButtonGroup>

              </ModalFooter>

            </ModalContent>

          </Modal>



          {/* Day Details Modal - Minimal & Elegant */}

          <Modal isOpen={isDayDetailsModalOpen} onClose={onDayDetailsModalClose} size="4xl" isCentered>

            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />

            <ModalContent borderRadius="12px" maxH="85vh" overflow="hidden" display="flex" flexDirection="column">

              <ModalHeader 

                py={5} 

                px={6}

                borderBottom="1px solid"

                borderColor="gray.100"

                bg="white"

              >

                <HStack justify="space-between" align="center">

                  <VStack align="start" spacing={1}>

                    <Text fontSize="lg" fontWeight="600" color={textColor} letterSpacing="-0.02em">

                      {selectedDayEvents?.date ? new Date(selectedDayEvents.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Selected Date'}

                    </Text>

                    <HStack spacing={4} fontSize="xs" color={secondaryTextColor}>

                      <HStack spacing={1.5}>

                        <Box w="6px" h="6px" bg="blue.500" borderRadius="full" />

                        <Text fontWeight="500">{selectedDayEvents?.appointments?.length || 0} Appointments</Text>

                  </HStack>

                      <HStack spacing={1.5}>

                        <Box w="6px" h="6px" bg="green.500" borderRadius="full" />

                        <Text fontWeight="500">{selectedDayEvents?.availableSlots?.length || 0} Available</Text>

                      </HStack>

                  </HStack>

                </VStack>

                  <ModalCloseButton borderRadius="8px" _hover={{ bg: 'gray.100' }} />

                </HStack>

              </ModalHeader>

              

              <ModalBody 

                p={0}

                flex="1"

                minH="0"

                overflowY="auto"

                css={{

                  '&::-webkit-scrollbar': {

                    width: '6px',

                  },

                  '&::-webkit-scrollbar-track': {

                    background: 'transparent',

                  },

                  '&::-webkit-scrollbar-thumb': {

                    background: '#CBD5E0',

                    borderRadius: '3px',

                  },

                  '&::-webkit-scrollbar-thumb:hover': {

                    background: '#A0AEC0',

                  },

                }}

              >

                {(!selectedDayEvents?.appointments || selectedDayEvents.appointments.length === 0) && 

                 (!selectedDayEvents?.availableSlots || selectedDayEvents.availableSlots.length === 0) ? (

                  <Center py={16}>

                    <VStack spacing={4}>

                      <Box

                        w="80px"

                        h="80px"

                        bg="gray.50"

                        borderRadius="12px"

                    display="flex"

                        alignItems="center"

                        justifyContent="center"

                        color="gray.300"

                      >

                        <CalendarIcon fontSize="40px" />

                          </Box>

                      <VStack spacing={2}>

                        <Text fontSize="md" fontWeight="600" color="gray.600">

                          No events scheduled

                            </Text>

                        <Text color="gray.500" textAlign="center" fontSize="sm" maxW="sm">

                          This day has no appointments or available slots

                            </Text>

                          </VStack>

                      <HStack spacing={3} pt={2}>

                        <Button

                          size="sm"

                          colorScheme="blue"

                          leftIcon={<AddIcon />}

                          borderRadius="8px"

                          onClick={() => {

                            onDayDetailsModalClose();

                            onLeadSearchModalOpen();

                          }}

                        >

                          Book Appointment

                        </Button>

                        </HStack>

                    </VStack>

                  </Center>

                ) : (

                  <VStack spacing={0} align="stretch" divider={<Divider borderColor="gray.100" />}>

                    {/* Appointments Section */}

                    {selectedDayEvents?.appointments && selectedDayEvents.appointments.length > 0 && (

                      <Box p={6}>

                        <HStack spacing={2} mb={4}>

                          <Box w="3px" h="16px" bg="blue.500" borderRadius="full" />

                          <Text fontSize="sm" fontWeight="600" color={textColor} letterSpacing="-0.01em">

                            Appointments ({selectedDayEvents.appointments.length})

                          </Text>

                      </HStack>

                        <VStack spacing={2} align="stretch">

                          {selectedDayEvents.appointments.map((apt, i) => {

                            const appointmentColor = getAppointmentColor(apt, leads);

                            const lead = apt.lead || leads.find(l => (l._id || l.id) === apt.leadId);

                            const leadName = lead?.name || lead?.firstName || 'Unknown';

                            const leadType = lead ? getLeadType(lead) : 'Unknown';

                            const leadTypeColor = getLeadTypeColor(leadType);

                            

                            return (

                              <Box

                                key={`modal-apt-${i}`}

                                p={4}

                                bg="white"

                                border="1px solid"

                                borderColor="gray.100"

                                borderRadius="8px"

                                _hover={{ 

                                  borderColor: `${appointmentColor}.300`,

                                  bg: `${appointmentColor}.50`,

                                  shadow: 'sm'

                                }}

                                transition="all 0.2s"

                                cursor="pointer"

                                onClick={() => {

                                  handleAppointmentClick(apt);

                                  onDayDetailsModalClose();

                                }}

                              >

                                <HStack justify="space-between" align="start" spacing={4}>

                                  <HStack spacing={3} flex="1">

                                    <Box

                                      w="4px"

                                      h="full"

                                      minH="40px"

                                      bg={`${appointmentColor}.500`}

                                      borderRadius="full"

                                    />

                                    <VStack align="start" spacing={1.5} flex="1">

                                      <HStack spacing={2} w="full">

                                        <Text fontSize="sm" fontWeight="600" color={textColor}>

                                          {leadName}

                                          </Text>

                                        <Badge colorScheme={leadTypeColor} variant="subtle" fontSize="xs" borderRadius="6px">

                                          {leadType}

                                        </Badge>

                                        <StatusBadge status={apt.status} compact />

                                    </HStack>

                                      <HStack spacing={4} fontSize="xs" color={secondaryTextColor}>

                                        <HStack spacing={1}>

                                          <TimeIcon fontSize="xs" />

                                          <Text>{apt.displayTime || formatTimeWithTimezone(apt.startTime || apt.start)}</Text>

                                        </HStack>

                                        {apt.duration && (

                                          <Text>{apt.duration} min</Text>

                                        )}

                                        {lead?.email && (

                                          <HStack spacing={1}>

                                            <EmailIcon fontSize="xs" />

                                            <Text noOfLines={1} maxW="150px">{lead.email}</Text>

                                          </HStack>

                                        )}

                                      </HStack>

                                    </VStack>

                                  </HStack>

                                  <HStack spacing={1}>

                                    <IconButton

                                      icon={<EditIcon />}

                                      size="sm"

                                      variant="ghost"

                                      borderRadius="6px"

                                      aria-label="Edit"

                                        onClick={(e) => {

                                          e.stopPropagation();

                                          handleEditAppointment(apt);

                                          onDayDetailsModalClose();

                                        }}

                                    />

                                    <IconButton

                                      icon={<DeleteIcon />}

                                      size="sm"

                                      variant="ghost"

                                        colorScheme="red"

                                      borderRadius="6px"

                                      aria-label="Delete"

                                        onClick={(e) => {

                                          e.stopPropagation();

                                          deleteAppointment(apt.id || apt._id);

                                        }}

                                    />

                                    </HStack>

                                </HStack>

                              </Box>

                            );

                          })}

                        </VStack>

                      </Box>

                    )}



                  {/* Available Slots Section */}

                    {selectedDayEvents?.availableSlots && selectedDayEvents.availableSlots.length > 0 && (

                      <Box p={6}>

                        <HStack spacing={2} mb={4}>

                          <Box w="3px" h="16px" bg="green.500" borderRadius="full" />

                          <Text fontSize="sm" fontWeight="600" color={textColor} letterSpacing="-0.01em">

                            Available Slots ({selectedDayEvents.availableSlots.length})

                            </Text>

                        </HStack>

                        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={2}>

                          {selectedDayEvents.availableSlots.map((slot, i) => (

                            <Box

                              key={`modal-slot-${i}`}

                              p={3}

                              bg="white"

                              border="1px solid"

                              borderColor="green.200"

                              borderRadius="8px"

                              cursor="pointer"

                              _hover={{ 

                                borderColor: 'green.400',

                                bg: 'green.50',

                                transform: 'translateY(-2px)',

                                shadow: 'sm'

                              }}

                              transition="all 0.2s"

                              onClick={() => {

                                handleSlotClick(slot);

                                onDayDetailsModalClose();

                              }}

                            >

                              <VStack spacing={1} align="center">

                                <Text fontSize="sm" fontWeight="600" color="green.700">

                                        {slot.displayTime}

                                      </Text>

                                <Text fontSize="xs" color="gray.500">

                                      {slot.duration || 30} min

                            </Text>

                          </VStack>

                            </Box>

                          ))}

                </SimpleGrid>

                      </Box>

                    )}

                      </VStack>

                )}

              </ModalBody>



              <ModalFooter 

                py={4} 

                px={6}

                borderTop="1px solid"

                borderColor="gray.100"

                bg="white"

                flexShrink={0}

              >

                <HStack spacing={3} justify="flex-end" w="full">

                  <Button 

                    onClick={onDayDetailsModalClose} 

                    variant="ghost"

                    borderRadius="8px"

                    fontWeight="500"

                  >

                      Close

                    </Button>

                    <Button

                      colorScheme="blue"

                      leftIcon={<AddIcon />}

                    borderRadius="8px"

                    fontWeight="500"

                      onClick={() => {

                        onDayDetailsModalClose();

                        onLeadSearchModalOpen();

                      }}

                    >

                    Book Appointment

                    </Button>

                </HStack>

              </ModalFooter>

            </ModalContent>

          </Modal>



          {/* Availability Settings Modal - Elegant Redesign */}

          <Modal 

            isOpen={isAvailabilityModalOpen} 

            onClose={onAvailabilityModalClose} 

            size="4xl"

            isCentered

            motionPreset="scale"

          >

            <ModalOverlay 

              bg="blackAlpha.700" 

              backdropFilter="blur(12px)"

            />

            <ModalContent 

              borderRadius="7px"

              bg="white"

              boxShadow="xl"

              h="85vh"

              maxH="85vh"

              overflow="hidden"

              display="flex"

              flexDirection="column"

            >

              <ModalHeader 

                py={6} 

                px={8}

                borderBottom="1px solid"

                borderColor="gray.200"

                bg="white"

                flexShrink={0}

              >

                <Flex justify="space-between" align="center">

                  <HStack spacing={3}>

                    <Box

                      p={2}

                      bg="blue.50"

                      borderRadius="7px"

                      color="blue.600"

                    >

                      <SettingsIcon boxSize={5} />

                    </Box>

                    <Heading fontSize="xl" fontWeight="700" color={textColor}>

                      Availability Settings

                    </Heading>

                </HStack>

                  <ModalCloseButton 

                    size="sm"

                    borderRadius="7px"

                    _hover={{ bg: 'gray.100' }}

                    top={6}

                    right={6}

                  />

                </Flex>

              </ModalHeader>

              

              <ModalBody 

                px={8} 

                py={6}

                bg="white"

                overflowY="auto"

                flex="1"

                minH="0"

                css={{

                  '&::-webkit-scrollbar': {

                    width: '6px',

                  },

                  '&::-webkit-scrollbar-track': {

                    background: 'transparent',

                  },

                  '&::-webkit-scrollbar-thumb': {

                    background: '#CBD5E0',

                    borderRadius: '3px',

                  },

                  '&::-webkit-scrollbar-thumb:hover': {

                    background: '#A0AEC0',

                  },

                }}

              >

                <Tabs index={settingsTabIndex} onChange={setSettingsTabIndex} colorScheme="blue" variant="enclosed">

                  <TabList mb={6} borderBottom="2px solid" borderColor="gray.200">

                    <Tab 

                      fontSize="sm" 

                      fontWeight="600" 

                      color={settingsTabIndex === 0 ? 'blue.600' : 'gray.500'}

                      _selected={{ color: 'blue.600', borderColor: 'blue.500' }}

                      borderRadius="7px 7px 0 0"

                      px={6}

                      py={3}

                    >

                      Availability Settings

                    </Tab>

                    <Tab 

                      fontSize="sm" 

                      fontWeight="600" 

                      color={settingsTabIndex === 1 ? 'blue.600' : 'gray.500'}

                      _selected={{ color: 'blue.600', borderColor: 'blue.500' }}

                      borderRadius="7px 7px 0 0"

                      px={6}

                      py={3}

                    >

                      Zoom Integration

                    </Tab>

                  </TabList>



                  <TabPanels>

                    <TabPanel px={0}>

                      <VStack spacing={6} align="stretch">

                  {/* General Settings - Moved to Top */}

                  <Box>

                    <Heading fontSize="md" fontWeight="600" color={textColor} mb={4}>

                      General Settings

                    </Heading>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>

                                  <FormControl>

                        <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb={2}>

                          Default Duration

                        </FormLabel>

                        <Menu>

                          <MenuButton

                            as={Button}

                            rightIcon={<FiChevronDown />}

                            w="full"

                            bg="white"

                            border="1px solid"

                            borderColor="gray.300"

                            borderRadius="7px"

                            h="40px"

                            fontSize="sm"

                            fontWeight="500"

                            color={textColor}

                            _hover={{ bg: 'white', borderColor: 'blue.400' }}

                            _expanded={{ bg: 'white', borderColor: 'blue.500', boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)' }}

                            _active={{ bg: 'white' }}

                            transition="all 0.2s"

                            justifyContent="space-between"

                          >

                            {availabilityForm.defaultAppointmentDuration} minutes

                          </MenuButton>

                          <MenuList

                            bg="white"

                            border="1px solid"

                            borderColor={borderColor}

                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"

                            borderRadius="7px"

                            py={1}

                            minW="200px"

                            animation="slideDown 0.2s ease-out"

                            sx={{

                              '@keyframes slideDown': {

                                from: {

                                  opacity: 0,

                                  transform: 'translateY(-10px)',

                                },

                                to: {

                                  opacity: 1,

                                  transform: 'translateY(0)',

                                },

                              },

                            }}

                          >

                            {[15, 30, 45, 60, 90, 120].map((duration) => (

                              <MenuItem

                                key={duration}

                                onClick={() => setAvailabilityForm(prev => ({

                                  ...prev,

                                  defaultAppointmentDuration: duration

                                }))}

                                bg={availabilityForm.defaultAppointmentDuration === duration ? 'blue.50' : 'transparent'}

                                color={availabilityForm.defaultAppointmentDuration === duration ? 'blue.600' : textColor}

                                fontWeight={availabilityForm.defaultAppointmentDuration === duration ? '600' : '500'}

                                _hover={{ bg: availabilityForm.defaultAppointmentDuration === duration ? 'blue.50' : 'gray.50' }}

                                borderRadius="7px"

                                mx={1}

                                my={0.5}

                                transition="all 0.15s"

                              >

                                {duration} minutes

                              </MenuItem>

                            ))}

                          </MenuList>

                        </Menu>

                                  </FormControl>



                                  <FormControl>

                        <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb={2}>

                          Minimum Gap Between Meetings

                        </FormLabel>

                        <Menu>

                          <MenuButton

                            as={Button}

                            rightIcon={<FiChevronDown />}

                            w="full"

                            bg="white"

                            border="1px solid"

                            borderColor="gray.300"

                            borderRadius="7px"

                            h="40px"

                            fontSize="sm"

                            fontWeight="500"

                            color={textColor}

                            _hover={{ bg: 'white', borderColor: 'blue.400' }}

                            _expanded={{ bg: 'white', borderColor: 'blue.500', boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)' }}

                            _active={{ bg: 'white' }}

                            transition="all 0.2s"

                            justifyContent="space-between"

                          >

                            {availabilityForm.bufferTime || 0} minutes

                          </MenuButton>

                          <MenuList

                            bg="white"

                            border="1px solid"

                            borderColor={borderColor}

                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"

                            borderRadius="7px"

                            py={1}

                            minW="200px"

                            animation="slideDown 0.2s ease-out"

                            sx={{

                              '@keyframes slideDown': {

                                from: {

                                  opacity: 0,

                                  transform: 'translateY(-10px)',

                                },

                                to: {

                                  opacity: 1,

                                  transform: 'translateY(0)',

                                },

                              },

                            }}

                          >

                            {[0, 5, 10, 15, 20, 30].map((gap) => (

                              <MenuItem

                                key={gap}

                                onClick={() => setAvailabilityForm(prev => ({

                                  ...prev,

                                  bufferTime: gap

                                }))}

                                bg={availabilityForm.bufferTime === gap ? 'blue.50' : 'transparent'}

                                color={availabilityForm.bufferTime === gap ? 'blue.600' : textColor}

                                fontWeight={availabilityForm.bufferTime === gap ? '600' : '500'}

                                _hover={{ bg: availabilityForm.bufferTime === gap ? 'blue.50' : 'gray.50' }}

                                borderRadius="7px"

                                mx={1}

                                my={0.5}

                                transition="all 0.15s"

                              >

                                {gap} minutes

                              </MenuItem>

                            ))}

                          </MenuList>

                        </Menu>

                                  </FormControl>



                                  <FormControl>

                        <FormLabel fontSize="sm" fontWeight="600" color={textColor} mb={2}>

                          Time Zone

                        </FormLabel>

                        <Menu>

                          <MenuButton

                            as={Button}

                            rightIcon={<FiChevronDown />}

                            w="full"

                            bg="white"

                            border="1px solid"

                            borderColor="gray.300"

                            borderRadius="7px"

                            h="40px"

                            fontSize="sm"

                            fontWeight="500"

                            color={textColor}

                            _hover={{ bg: 'white', borderColor: 'blue.400' }}

                            _expanded={{ bg: 'white', borderColor: 'blue.500', boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)' }}

                            _active={{ bg: 'white' }}

                            transition="all 0.2s"

                            justifyContent="space-between"

                          >

                            {availabilityForm.timeZone === 'Asia/Kolkata' && 'India Standard Time (IST)'}

                            {availabilityForm.timeZone === 'America/New_York' && 'Eastern Time (EST/EDT)'}

                            {availabilityForm.timeZone === 'America/Chicago' && 'Central Time (CST/CDT)'}

                            {availabilityForm.timeZone === 'UTC' && 'UTC'}

                          </MenuButton>

                          <MenuList

                            bg="white"

                            border="1px solid"

                            borderColor={borderColor}

                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"

                            borderRadius="7px"

                            py={1}

                            minW="250px"

                            animation="slideDown 0.2s ease-out"

                            sx={{

                              '@keyframes slideDown': {

                                from: {

                                  opacity: 0,

                                  transform: 'translateY(-10px)',

                                },

                                to: {

                                  opacity: 1,

                                  transform: 'translateY(0)',

                                },

                              },

                            }}

                          >

                            <MenuItem

                              onClick={() => setAvailabilityForm(prev => ({

                                ...prev,

                                timeZone: 'Asia/Kolkata'

                              }))}

                              bg={availabilityForm.timeZone === 'Asia/Kolkata' ? 'blue.50' : 'transparent'}

                              color={availabilityForm.timeZone === 'Asia/Kolkata' ? 'blue.600' : textColor}

                              fontWeight={availabilityForm.timeZone === 'Asia/Kolkata' ? '600' : '500'}

                              _hover={{ bg: availabilityForm.timeZone === 'Asia/Kolkata' ? 'blue.50' : 'gray.50' }}

                              borderRadius="7px"

                              mx={1}

                              my={0.5}

                              transition="all 0.15s"

                            >

                              India Standard Time (IST)

                            </MenuItem>

                            <MenuItem

                              onClick={() => setAvailabilityForm(prev => ({

                                ...prev,

                                timeZone: 'America/New_York'

                              }))}

                              bg={availabilityForm.timeZone === 'America/New_York' ? 'blue.50' : 'transparent'}

                              color={availabilityForm.timeZone === 'America/New_York' ? 'blue.600' : textColor}

                              fontWeight={availabilityForm.timeZone === 'America/New_York' ? '600' : '500'}

                              _hover={{ bg: availabilityForm.timeZone === 'America/New_York' ? 'blue.50' : 'gray.50' }}

                              borderRadius="7px"

                              mx={1}

                              my={0.5}

                              transition="all 0.15s"

                            >

                              Eastern Time (EST/EDT)

                            </MenuItem>

                            <MenuItem

                              onClick={() => setAvailabilityForm(prev => ({

                                ...prev,

                                timeZone: 'America/Chicago'

                              }))}

                              bg={availabilityForm.timeZone === 'America/Chicago' ? 'blue.50' : 'transparent'}

                              color={availabilityForm.timeZone === 'America/Chicago' ? 'blue.600' : textColor}

                              fontWeight={availabilityForm.timeZone === 'America/Chicago' ? '600' : '500'}

                              _hover={{ bg: availabilityForm.timeZone === 'America/Chicago' ? 'blue.50' : 'gray.50' }}

                              borderRadius="7px"

                              mx={1}

                              my={0.5}

                              transition="all 0.15s"

                            >

                              Central Time (CST/CDT)

                            </MenuItem>

                            <MenuItem

                              onClick={() => setAvailabilityForm(prev => ({

                                ...prev,

                                timeZone: 'UTC'

                              }))}

                              bg={availabilityForm.timeZone === 'UTC' ? 'blue.50' : 'transparent'}

                              color={availabilityForm.timeZone === 'UTC' ? 'blue.600' : textColor}

                              fontWeight={availabilityForm.timeZone === 'UTC' ? '600' : '500'}

                              _hover={{ bg: availabilityForm.timeZone === 'UTC' ? 'blue.50' : 'gray.50' }}

                              borderRadius="7px"

                              mx={1}

                              my={0.5}

                              transition="all 0.15s"

                            >

                              UTC

                            </MenuItem>

                          </MenuList>

                        </Menu>

                                  </FormControl>

                    </SimpleGrid>

                  </Box>



                  {/* Weekly Schedule Table */}

                  <Box>

                    <Heading fontSize="md" fontWeight="600" color={textColor} mb={4}>

                      Weekly Schedule

                    </Heading>

                    <TableContainer>

                      <Table variant="simple" size="md">

                        <Thead>

                          <Tr bg="gray.50">

                            <Th fontSize="sm" fontWeight="600" color={textColor} py={4} px={4}>

                              Day

                            </Th>

                            <Th fontSize="sm" fontWeight="600" color={textColor} py={4} px={4} textAlign="center">

                              Enable

                            </Th>

                            <Th fontSize="sm" fontWeight="600" color={textColor} py={4} px={4}>

                              Start Time

                            </Th>

                            <Th fontSize="sm" fontWeight="600" color={textColor} py={4} px={4}>

                              End Time

                            </Th>

                          </Tr>

                        </Thead>

                        <Tbody>

                          {dayNames.map((dayName, dayIndex) => {

                            const isEnabled = availabilityForm.workingHours.some(wh => wh.dayOfWeek === dayIndex);

                            const workingHour = getWorkingHourForDay(dayIndex);

                            

                            return (

                              <Tr 

                                key={dayIndex}

                                _hover={{ bg: 'gray.50' }}

                                borderBottom="1px solid"

                                borderColor="gray.100"

                              >

                                <Td py={4} px={4}>

                                  <Text fontSize="sm" fontWeight="500" color={textColor}>

                                    {dayName}

                                  </Text>

                                </Td>

                                <Td py={4} px={4} textAlign="center">

                                  <Switch

                                    isChecked={isEnabled}

                                    onChange={() => toggleDayEnabled(dayIndex)}

                                    colorScheme="blue"

                                    size="md"

                                  />

                                </Td>

                                <Td py={4} px={4}>

                                  <TimePicker

                                    value={workingHour.startTime}

                                    onChange={(time) => updateDayWorkingHour(dayIndex, 'startTime', time)}

                                    isDisabled={!isEnabled}

                                    field="startTime"

                                    dayIndex={dayIndex}

                                  />

                                </Td>

                                <Td py={4} px={4}>

                                  <TimePicker

                                    value={workingHour.endTime}

                                    onChange={(time) => updateDayWorkingHour(dayIndex, 'endTime', time)}

                                    isDisabled={!isEnabled}

                                    field="endTime"

                                    dayIndex={dayIndex}

                                  />

                                </Td>

                              </Tr>

                            );

                          })}

                        </Tbody>

                      </Table>

                    </TableContainer>

                  </Box>

                </VStack>

                    </TabPanel>



                    <TabPanel px={0}>

                      <VStack spacing={6} align="stretch">

                        {/* Zoom Integration Content */}

                        <Box>

                          <Heading fontSize="md" fontWeight="600" color={textColor} mb={4}>

                            Connect Zoom Account

                          </Heading>

                          <Text fontSize="sm" color="gray.600" mb={6}>

                            Connect your Zoom account to automatically create meeting links for appointments. 

                            No need to manually enter API keys - just sign in with Zoom!

                          </Text>



                          {loadingZoomStatus ? (

                            <Center py={8}>

                              <Spinner size="lg" color="blue.500" />

                            </Center>

                          ) : zoomIntegrationStatus?.isConnected ? (

                            <Card bg="green.50" border="1px solid" borderColor="green.200" borderRadius="7px">

                              <CardBody p={6}>

                                <VStack spacing={4} align="stretch">

                                  <HStack spacing={3}>

                                    <CheckCircleIcon color="green.500" boxSize={6} />

                                    <VStack align="start" spacing={1}>

                                      <Text fontWeight="600" color="green.700">

                                        Zoom Account Connected

                                      </Text>

                                      <Text fontSize="sm" color="green.600">

                                        {zoomIntegrationStatus.accountInfo?.zoomEmail || 'Connected successfully'}

                                      </Text>

                                    </VStack>

                                  </HStack>

                                  <Button

                                    colorScheme="red"

                                    variant="outline"

                                    size="sm"

                                    onClick={handleDisconnectZoom}

                                    leftIcon={<CloseIcon />}

                                    borderRadius="7px"

                                  >

                                    Disconnect Zoom

                                  </Button>

                                </VStack>

                              </CardBody>

                            </Card>

                          ) : (

                            <Card bg="blue.50" border="1px solid" borderColor="blue.200" borderRadius="7px">

                              <CardBody p={6}>

                                <VStack spacing={4} align="stretch">

                                  <HStack spacing={3}>

                                    <Box

                                      p={3}

                                      bg="white"

                                      borderRadius="7px"

                                      boxShadow="sm"

                                    >

                                      <Text fontSize="2xl">📹</Text>

                                    </Box>

                                    <VStack align="start" spacing={1} flex={1}>

                                      <Text fontWeight="600" color="gray.800">

                                        Not Connected

                                      </Text>

                                      <Text fontSize="sm" color="gray.600">

                                        Click the button below to sign in with Zoom and connect your account

                            </Text>

                          </VStack>

                                  </HStack>

                                  <Button

                                    colorScheme="blue"

                                    size="lg"

                                    onClick={handleConnectZoom}

                                    leftIcon={<ExternalLinkIcon />}

                                    borderRadius="7px"

                                    fontWeight="600"

                                    w="full"

                                  >

                                    Sign in with Zoom

                                  </Button>

                                </VStack>

                    </CardBody>

                  </Card>

                          )}

                        </Box>

                </VStack>

                    </TabPanel>

                  </TabPanels>

                </Tabs>

              </ModalBody>



              <ModalFooter 

                py={5} 

                px={8}

                borderTop="1px solid"

                borderColor="gray.200"

                bg="white"

                flexShrink={0}

              >

                <HStack spacing={3} w="full" justify="flex-end">

                  <Button

                    onClick={onAvailabilityModalClose}

                    variant="ghost"

                    borderRadius="7px"

                    _hover={{ bg: 'gray.100' }}

                    fontWeight="500"

                    px={6}

                  >

                    Cancel

                  </Button>

                  <Button

                    bg="blue.500"

                    color="white"

                    onClick={updateAvailability}

                    isLoading={loading}

                    loadingText="Saving..."

                    borderRadius="7px"

                    _hover={{ bg: 'blue.600' }}

                    fontWeight="500"

                    px={6}

                  >

                    Save

                  </Button>

                </HStack>

              </ModalFooter>

            </ModalContent>

          </Modal>



          {/* Edit Appointment Modal */}

          <Modal isOpen={isEditAppointmentModalOpen} onClose={onEditAppointmentModalClose} size="xl">

            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />

            <ModalContent borderRadius="2xl">

              <ModalHeader>

                <HStack>

                  <EditIcon color="orange.500" />

                  <Text>Edit Appointment</Text>

                </HStack>

              </ModalHeader>

              <ModalCloseButton />

              

              <ModalBody>

                <VStack spacing={6} align="stretch">

                  <Card>

                    <CardHeader>

                      <Heading size="md">Appointment Details</Heading>

                    </CardHeader>

                    <CardBody>

                      <VStack spacing={4}>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">

                          <FormControl isRequired>

                            <FormLabel>Lead ID</FormLabel>

                            <Input

                              value={editAppointmentForm.leadId}

                              onChange={(e) => setEditAppointmentForm(prev => ({...prev, leadId: e.target.value}))}

                              placeholder="Enter lead ID (required)"

                            />

                          </FormControl>

                          

                          <FormControl isRequired>

                            <FormLabel>Date & Time</FormLabel>

                            <Input

                              type="datetime-local"

                              value={editAppointmentForm.startTime ? new Date(editAppointmentForm.startTime).toISOString().slice(0, 16) : ''}

                              onChange={(e) => setEditAppointmentForm(prev => ({...prev, startTime: new Date(e.target.value).toISOString()}))}

                            />

                          </FormControl>

                        </SimpleGrid>



                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">

                          <FormControl>

                            <FormLabel>Duration</FormLabel>

                            <Select

                              value={editAppointmentForm.duration}

                              onChange={(e) => setEditAppointmentForm(prev => ({...prev, duration: parseInt(e.target.value)}))}

                            >

                              <option value={15}>15 minutes</option>

                              <option value={30}>30 minutes</option>

                              <option value={45}>45 minutes</option>

                              <option value={60}>60 minutes</option>

                              <option value={90}>90 minutes</option>

                              <option value={120}>120 minutes</option>

                            </Select>

                          </FormControl>

                          

                          <FormControl>

                            <FormLabel>Status</FormLabel>

                            <Select

                              value={editAppointmentForm.status}

                              onChange={(e) => setEditAppointmentForm(prev => ({...prev, status: e.target.value}))}

                            >

                              <option value="confirmed">Confirmed</option>

                              <option value="pending">Pending</option>

                              <option value="canceled">Canceled</option>

                              <option value="completed">Completed</option>

                              <option value="no-show">No Show</option>

                            </Select>

                          </FormControl>

                        </SimpleGrid>



                        <FormControl>

                          <FormLabel>Notes</FormLabel>

                          <Textarea

                            value={editAppointmentForm.notes}

                            onChange={(e) => setEditAppointmentForm(prev => ({...prev, notes: e.target.value}))}

                            placeholder="Add any special instructions..."

                            rows={4}

                            resize="vertical"

                          />

                        </FormControl>

                      </VStack>

                    </CardBody>

                  </Card>

                </VStack>

              </ModalBody>



              <ModalFooter>

                <ButtonGroup spacing={3}>

                  <Button onClick={onEditAppointmentModalClose}>Cancel</Button>

                  <Button

                    colorScheme="orange"

                    onClick={updateAppointment}

                    isLoading={loading}

                    loadingText="Updating..."

                    disabled={!editAppointmentForm.leadId || !editAppointmentForm.startTime}

                    leftIcon={<CheckCircleIcon />}

                  >

                    Update Appointment

                  </Button>

                </ButtonGroup>

              </ModalFooter>

            </ModalContent>

          </Modal>



          {/* Enhanced Appointment Details Modal - Professional Redesign */}
          <Modal isOpen={isAppointmentDetailsOpen} onClose={onAppointmentDetailsClose} size="4xl" isCentered>
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(12px)" />
            <ModalContent borderRadius="9px" maxH="90vh" overflow="hidden" boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)">
              <ModalHeader 
                py={6} 
                px={8}
                borderBottom="1px solid"
                borderColor="gray.100"
                bg="white"
              >
                <HStack justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Box
                      w="48px"
                      h="48px"
                      bg="blue.50"
                      borderRadius="12px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <ViewIcon color="blue.500" boxSize={6} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xl" fontWeight="700" color="gray.800" letterSpacing="-0.02em">
                        Appointment Details
                      </Text>
                      <Text fontSize="sm" color="gray.500" fontWeight="500">
                        View and manage appointment information
                      </Text>
                    </VStack>
                  </HStack>
                  <ModalCloseButton 
                    borderRadius="10px" 
                    _hover={{ bg: 'gray.100' }}
                    size="lg"
                  />
                </HStack>

              </ModalHeader>

              
              <ModalBody p={0} overflowY="auto" css={{
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb:hover': { background: '#A0AEC0' },
              }}>
                {selectedAppointment && (

                  <VStack spacing={0} align="stretch">
                    {/* Appointment Information - Elegant Card */}
                    <Box p={8} bg="white">
                  <VStack spacing={6} align="stretch">

                        {/* Status Badge Header */}
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={2}>

                            <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
                              Appointment Information
                              </Text>

                            <Text fontSize="2xl" fontWeight="700" color="gray.900" letterSpacing="-0.02em">
                              {selectedAppointment.title || 'Appointment'}
                            </Text>
                          </VStack>
                          <StatusBadge status={selectedAppointment.status} />
                            </HStack>


                        {/* Key Information Grid */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <Box
                            p={5}
                            bg="gray.50"
                            borderRadius="7px"
                            border="1px solid"
                            borderColor="gray.100"
                            _hover={{ borderColor: 'blue.200', bg: 'blue.50' }}
                            transition="all 0.2s"
                          >
                            <HStack spacing={3} mb={2}>
                              <Box
                                w="40px"
                                h="40px"
                                bg="blue.100"
                                borderRadius="10px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <CalendarIcon color="blue.600" boxSize={5} />
                              </Box>
                              <VStack align="start" spacing={0}>
                                <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
                                  Date & Time
                                </Text>
                                <Text fontSize="lg" fontWeight="700" color="gray.900">
                                  {selectedAppointment.displayDate}
                                </Text>
                                <Text fontSize="md" fontWeight="600" color="blue.600">
                                  {selectedAppointment.displayTime}
                                </Text>
                          </VStack>

                            </HStack>

                          </Box>

                          <Box
                            p={5}
                            bg="gray.50"
                            borderRadius="7px"
                            border="1px solid"
                            borderColor="gray.100"
                            _hover={{ borderColor: 'green.200', bg: 'green.50' }}
                            transition="all 0.2s"
                          >
                            <HStack spacing={3} mb={2}>
                              <Box
                                w="40px"
                                h="40px"
                                bg="green.100"
                                borderRadius="10px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <TimeIcon color="green.600" boxSize={5} />
                              </Box>
                              <VStack align="start" spacing={0}>
                                <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
                                  Duration
                                </Text>
                                <Text fontSize="lg" fontWeight="700" color="gray.900">
                                  {selectedAppointment.duration || 30} minutes
                                </Text>
                          </VStack>

                            </HStack>
                          </Box>

                          <Box
                            p={5}
                            bg="gray.50"
                            borderRadius="7px"
                            border="1px solid"
                            borderColor="gray.100"
                            _hover={{ borderColor: 'purple.200', bg: 'purple.50' }}
                            transition="all 0.2s"
                          >
                            <HStack spacing={3} mb={2}>
                              <Box
                                w="40px"
                                h="40px"
                                bg="purple.100"
                                borderRadius="10px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Box as={FiUser} color="purple.600" fontSize="20px" />
                              </Box>
                              <VStack align="start" spacing={0} flex="1">
                                <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
                                  Assigned Staff
                                </Text>
                              <Badge 

                                colorScheme={selectedAppointment.lead?.assignedTo || selectedAppointment.assignedTo ? 'purple' : 'gray'} 

                                variant={selectedAppointment.lead?.assignedTo || selectedAppointment.assignedTo ? 'solid' : 'outline'}

                                borderRadius="full"

                                  px={4}
                                  py={1.5}
                                  fontSize="sm"
                                  fontWeight="600"
                                  mt={1}
                              >

                                {getStaffDisplayName(selectedAppointment.lead?.assignedTo || selectedAppointment.assignedTo)}

                              </Badge>

                              </VStack>
                            </HStack>

                          </Box>

                          <Box
                            p={5}
                            bg="gray.50"
                            borderRadius="7px"
                            border="1px solid"
                            borderColor="gray.100"
                            _hover={{ borderColor: 'gray.300', bg: 'gray.100' }}
                            transition="all 0.2s"
                          >
                            <HStack spacing={3} mb={2}>
                              <Box
                                w="40px"
                                h="40px"
                                bg="gray.200"
                                borderRadius="10px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Box as={FiUser} color="gray.600" fontSize="20px" />
                              </Box>
                              <VStack align="start" spacing={0} flex="1">
                                <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
                                  Lead Name
                                </Text>
                                <Text fontSize="sm" fontWeight="600" color="gray.700" mt={1}>
                                  {selectedAppointment.leadName || 
                                   selectedAppointment.lead?.clientQuestions?.fullName || 
                                   selectedAppointment.lead?.coachQuestions?.fullName || 
                                   selectedAppointment.lead?.name || 
                                   'Unknown Lead'}
                                </Text>
                                {selectedAppointment.leadId && (
                                  <Text fontSize="xs" color="gray.500" fontFamily="mono" mt={0.5}>
                                    ID: {selectedAppointment.leadId}
                                  </Text>
                                )}
                          </VStack>

                            </HStack>
                          </Box>
                        </SimpleGrid>


                        {/* Zoom Meeting Details - Minimal & Elegant */}
                        {((selectedAppointment.zoomMeetingLink || selectedAppointment.zoom_link || selectedAppointment.zoomUrl || selectedAppointment.meetingLink || selectedAppointment.zoomMeetingId || selectedAppointment.zoomMeetingNumber || selectedAppointment.zoomPassword) || 
                          (selectedAppointment.zoomMeeting && (selectedAppointment.zoomMeeting.joinUrl || selectedAppointment.zoomMeeting.meetingId))) && (
                          <VStack spacing={6} align="stretch" mt={2}>
                            {/* Section Header */}
                            <HStack spacing={3} align="center">
                              <Box
                                w="40px"
                                h="40px"
                                bg="blue.100"
                                borderRadius="7px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                              >
                                <Text fontSize="lg">📹</Text>
                              </Box>
                              <VStack align="start" spacing={0} flex="1">
                                <Text fontSize="md" fontWeight="700" color="gray.900" letterSpacing="-0.01em">
                                  Zoom Meeting Details
                                </Text>
                                <Text fontSize="xs" color="gray.500" fontWeight="500">
                                  Meeting access information
                                </Text>
                              </VStack>
                            </HStack>

                            <VStack spacing={4} align="stretch">
                              {/* Meeting Link */}
                              {(() => {
                                const zoomLink = selectedAppointment.zoomMeetingLink || 
                                                selectedAppointment.zoom_link || 
                                                selectedAppointment.zoomUrl || 
                                                selectedAppointment.meetingLink ||
                                                selectedAppointment.zoomMeeting?.joinUrl;
                                return zoomLink && (
                                  <Box>
                                    <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
                                      Meeting Link
                                    </Text>
                                    <HStack spacing={2}>
                                      <Box
                                        flex="1"
                                        p={3}
                                        bg="gray.50"
                                        borderRadius="7px"
                                        fontSize="sm"
                                        fontWeight="500"
                                        color="gray.700"
                                        wordBreak="break-all"
                                      >
                                        {zoomLink}
                                      </Box>
                                      <Button
                                        colorScheme="blue"
                                        leftIcon={<ExternalLinkIcon />}
                                        borderRadius="7px"
                                        fontWeight="600"
                                        px={5}
                                        h="44px"
                                        onClick={() => {
                                          if (zoomLink) {
                                            window.open(zoomLink, '_blank');
                                          }
                                        }}
                                        _hover={{ transform: 'translateY(-1px)', boxShadow: 'md', bg: 'blue.600' }}
                                        transition="all 0.2s"
                                      >
                                        Join
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        borderRadius="7px"
                                        h="44px"
                                        w="44px"
                                        p={0}
                                        onClick={() => {
                                          if (zoomLink) {
                                            navigator.clipboard.writeText(zoomLink);
                                            toast('Meeting link copied!', 'success');
                                          }
                                        }}
                                        _hover={{ bg: 'gray.100' }}
                                      >
                                        <CopyIcon />
                                      </Button>
                                    </HStack>
                                  </Box>
                                );
                              })()}

                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                {/* Meeting ID */}
                                {(() => {
                                  const meetingId = selectedAppointment.zoomMeetingId || 
                                                   selectedAppointment.zoomMeetingNumber ||
                                                   selectedAppointment.zoomMeeting?.meetingId;
                                  return meetingId && (
                                    <Box>
                                      <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
                                        Meeting ID
                                      </Text>
                                      <HStack spacing={2}>
                                        <Box
                                          flex="1"
                                          p={3}
                                          bg="gray.50"
                                          borderRadius="7px"
                                          fontSize="md"
                                          fontWeight="600"
                                          color="gray.800"
                                        >
                                          {meetingId}
                                        </Box>
                                        <Button
                                          variant="ghost"
                                          borderRadius="7px"
                                          h="44px"
                                          w="44px"
                                          p={0}
                                          onClick={() => {
                                            if (meetingId) {
                                              navigator.clipboard.writeText(meetingId);
                                              toast('Meeting ID copied!', 'success');
                                            }
                                          }}
                                          _hover={{ bg: 'gray.100' }}
                                        >
                                          <CopyIcon />
                                        </Button>
                                      </HStack>
                                    </Box>
                                  );
                                })()}

                                {/* Meeting Password */}
                                {(() => {
                                  const password = selectedAppointment.zoomPassword ||
                                                  selectedAppointment.zoomMeeting?.password;
                                  return password && (
                                    <Box>
                                      <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
                                        Meeting Password
                                      </Text>
                                      <HStack spacing={2}>
                                        <Box
                                          flex="1"
                                          p={3}
                                          bg="gray.50"
                                          borderRadius="7px"
                                          fontSize="md"
                                          fontWeight="600"
                                          color="gray.800"
                                        >
                                          {password}
                                        </Box>
                                        <Button
                                          variant="ghost"
                                          borderRadius="7px"
                                          h="44px"
                                          w="44px"
                                          p={0}
                                          onClick={() => {
                                            if (password) {
                                              navigator.clipboard.writeText(password);
                                              toast('Meeting password copied!', 'success');
                                            }
                                          }}
                                          _hover={{ bg: 'gray.100' }}
                                        >
                                          <CopyIcon />
                                        </Button>
                                      </HStack>
                                    </Box>
                                  );
                                })()}
                              </SimpleGrid>

                              {/* Meeting Time */}
                              {(() => {
                                const startTime = selectedAppointment.zoomStartTime || 
                                                 selectedAppointment.startTime ||
                                                 selectedAppointment.zoomMeeting?.startTime;
                                const timezone = selectedAppointment.timeZone || 
                                               selectedAppointment.timezone || 
                                               'Asia/Kolkata';
                                
                                if (!startTime) return null;
                                
                                const date = new Date(startTime);
                                const formattedDate = date.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                });
                                const formattedTime = date.toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true,
                                  timeZone: timezone
                                });
                                
                                // Get timezone abbreviation
                                const timezoneAbbr = new Intl.DateTimeFormat('en-US', {
                                  timeZone: timezone,
                                  timeZoneName: 'short'
                                }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value || timezone;
                                
                                return (
                                  <Box>
                                    <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
                                      Meeting Time
                                    </Text>
                                    <Box
                                      p={4}
                                      bg="gray.50"
                                      borderRadius="7px"
                                    >
                                      <VStack align="start" spacing={3}>
                                        <HStack spacing={3} align="center">
                                          <CalendarIcon color="gray.600" boxSize={5} />
                                          <Text fontSize="sm" fontWeight="600" color="gray.800">
                                            {formattedDate}
                                          </Text>
                                        </HStack>
                                        <HStack spacing={3} align="center">
                                          <TimeIcon color="gray.600" boxSize={5} />
                                          <Text fontSize="sm" fontWeight="600" color="gray.800">
                                            {formattedTime}
                                          </Text>
                                          <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2} py={1} fontSize="xs">
                                            {timezoneAbbr}
                                          </Badge>
                                        </HStack>
                                      </VStack>
                                    </Box>
                                  </Box>
                                );
                              })()}

                              {/* Additional Zoom Info */}
                              {(selectedAppointment.zoomTopic || selectedAppointment.zoomAgenda) && (
                                <VStack spacing={3} align="stretch">
                                  {selectedAppointment.zoomTopic && (
                                    <Box>
                                      <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
                                        Meeting Topic
                                      </Text>
                                      <Box
                                        p={4}
                                        bg="gray.50"
                                        borderRadius="7px"
                                      >
                                        <Text fontSize="sm" fontWeight="500" color="gray.800" lineHeight="1.6">
                                          {selectedAppointment.zoomTopic}
                                        </Text>
                                      </Box>
                                    </Box>
                                  )}
                                  {selectedAppointment.zoomAgenda && (
                                    <Box>
                                      <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
                                        Meeting Agenda
                                      </Text>
                                      <Box
                                        p={4}
                                        bg="gray.50"
                                        borderRadius="7px"
                                      >
                                        <Text fontSize="sm" fontWeight="500" color="gray.800" lineHeight="1.6">
                                          {selectedAppointment.zoomAgenda}
                                        </Text>
                                      </Box>
                                    </Box>
                                  )}
                                </VStack>
                              )}
                            </VStack>
                          </VStack>
                        )}
                      </VStack>
                    </Box>


                    {/* Lead Details with Score & VSL Score */}

                    {leadDetails && (

                      <Card border="2px solid" borderColor="blue.200" bg="blue.50" borderRadius="7px">

                        <CardHeader bg="blue.100" borderRadius="7px 7px 0 0">

                          <HStack justify="space-between">

                            <Heading size="md" color="blue.800">📊 Lead Information & Scores</Heading>

                            <Badge colorScheme="blue" variant="solid" px={3} py={1} borderRadius="full">

                              Lead Details

                            </Badge>

                          </HStack>

                        </CardHeader>

                        <CardBody>

                          <VStack spacing={6} align="stretch">

                            {/* Lead Basic Info */}

                            <HStack spacing={4} align="start">

                              <Avatar

                                name={leadDetails.clientQuestions?.fullName || leadDetails.name || 'Lead'}

                                size="xl"

                                bg="blue.500"

                                color="white"

                                border="3px solid"

                                borderColor="blue.300"

                              />

                              <VStack align="start" spacing={3} flex="1">

                                <VStack align="start" spacing={2}>

                                  <HStack justify="space-between" w="full">

                                    <Text fontSize="xl" fontWeight="bold" color="blue.800">

                                      {leadDetails.clientQuestions?.fullName || leadDetails.name || 'Unknown Lead'}

                                    </Text>

                                    <Badge colorScheme={getLeadTypeColor(getLeadType(leadDetails))} size="lg" px={3} py={1}>

                                      {getLeadType(leadDetails)}

                                    </Badge>

                                  </HStack>

                                  {leadDetails.clientQuestions?.profession && (

                                    <Badge colorScheme="blue" variant="subtle" px={3} py={1}>

                                      💼 {leadDetails.clientQuestions.profession}

                                    </Badge>

                                  )}

                                </VStack>

                                

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">

                                  {leadDetails.clientQuestions?.email && (

                                    <HStack p={2} bg="white" borderRadius="md" border="1px solid" borderColor="blue.200">

                                      <EmailIcon color="blue.500" />

                                      <Text fontSize="sm" fontWeight="medium">{leadDetails.clientQuestions.email}</Text>

                                    </HStack>

                                  )}

                                  {leadDetails.clientQuestions?.whatsappNumber && (

                                    <HStack p={2} bg="white" borderRadius="md" border="1px solid" borderColor="blue.200">

                                      <PhoneIcon color="green.500" />

                                      <Text fontSize="sm" fontWeight="medium">{leadDetails.clientQuestions.whatsappNumber}</Text>

                                    </HStack>

                                  )}

                                  {leadDetails.clientQuestions?.cityCountry && (

                                    <HStack p={2} bg="white" borderRadius="md" border="1px solid" borderColor="blue.200">

                                      <InfoIcon color="purple.500" />

                                      <Text fontSize="sm" fontWeight="medium">{leadDetails.clientQuestions.cityCountry}</Text>

                                    </HStack>

                                  )}

                                </SimpleGrid>

                              </VStack>

                            </HStack>



                            {/* Enhanced Score & VSL Score Section */}

                            <Card bg="white" border="2px solid" borderColor="green.200" shadow="lg" borderRadius="7px">

                              <CardHeader bg="gradient-to-r" bgGradient="linear(to-r, green.100, blue.100)" borderRadius="7px 7px 0 0">

                                <HStack justify="space-between">

                                  <HStack>

                                    <Box as={FiTarget} color="green.600" fontSize="28px" />

                                    <Heading size="lg" color="green.800">🎯 Lead Performance Analytics</Heading>

                                  </HStack>

                                  <Badge colorScheme="green" variant="solid" px={4} py={2} borderRadius="full" fontSize="sm">

                                    📊 Performance Metrics

                                  </Badge>

                                </HStack>

                              </CardHeader>

                              <CardBody p={6}>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>

                                  {/* Lead Score */}

                                  <VStack spacing={4} p={6} bg="gradient-to-br" bgGradient="linear(to-br, green.50, green.100)" borderRadius="xl" border="2px solid" borderColor="green.200" shadow="md" _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }} transition="all 0.3s">

                                    <HStack>

                                      <Box as={FiTarget} color="green.600" fontSize="32px" />

                                      <Text fontSize="xl" fontWeight="bold" color="green.800">Lead Score</Text>

                                    </HStack>

                                    <VStack spacing={3}>

                                      <Text fontSize="4xl" fontWeight="bold" color="green.600" textShadow="0 2px 4px rgba(0,0,0,0.1)">

                                        {leadDetails.score || leadDetails.leadScore || leadDetails.questionResponses?.score || 'N/A'}

                                      </Text>

                                      <Text fontSize="sm" color="green.700" textAlign="center" fontWeight="medium">

                                        Overall lead quality and engagement score

                                      </Text>

                                    </VStack>

                                    <Badge 

                                      colorScheme={(() => {

                                        const score = leadDetails.score || leadDetails.leadScore || leadDetails.questionResponses?.score;

                                        return score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';

                                      })()} 

                                      variant="solid" 

                                      px={4} py={2} 

                                      borderRadius="full"

                                      fontSize="sm"

                                      fontWeight="bold"

                                    >

                                      {(() => {

                                        const score = leadDetails.score || leadDetails.leadScore || leadDetails.questionResponses?.score;

                                        return score >= 80 ? '🌟 High Quality' : score >= 60 ? '⭐ Medium Quality' : '📉 Low Quality';

                                      })()}

                                    </Badge>

                                  </VStack>



                                  {/* VSL Score */}

                                  <VStack spacing={4} p={6} bg="gradient-to-br" bgGradient="linear(to-br, purple.50, purple.100)" borderRadius="xl" border="2px solid" borderColor="purple.200" shadow="md" _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }} transition="all 0.3s">

                                    <HStack>

                                      <Box as={FiBarChart2} color="purple.600" fontSize="32px" />

                                      <Text fontSize="xl" fontWeight="bold" color="purple.800">VSL Score</Text>

                                    </HStack>

                                    <VStack spacing={3}>

                                      <Text fontSize="4xl" fontWeight="bold" color="purple.600" textShadow="0 2px 4px rgba(0,0,0,0.1)">

                                        {leadDetails.vslScore || leadDetails.vsl_score || leadDetails.questionResponses?.vslScore || leadDetails.questionResponses?.vsl_score || 'N/A'}

                                      </Text>

                                      <Text fontSize="sm" color="purple.700" textAlign="center" fontWeight="medium">

                                        Video Sales Letter engagement and conversion score

                                      </Text>

                                    </VStack>

                                    <Badge 

                                      colorScheme={(() => {

                                        const vslScore = leadDetails.vslScore || leadDetails.vsl_score || leadDetails.questionResponses?.vslScore || leadDetails.questionResponses?.vsl_score;

                                        return vslScore >= 80 ? 'purple' : vslScore >= 60 ? 'orange' : 'red';

                                      })()} 

                                      variant="solid" 

                                      px={4} py={2} 

                                      borderRadius="full"

                                      fontSize="sm"

                                      fontWeight="bold"

                                    >

                                      {(() => {

                                        const vslScore = leadDetails.vslScore || leadDetails.vsl_score || leadDetails.questionResponses?.vslScore || leadDetails.questionResponses?.vsl_score;

                                        return vslScore >= 80 ? '🚀 High Engagement' : vslScore >= 60 ? '📈 Medium Engagement' : '📉 Low Engagement';

                                      })()}

                                    </Badge>

                                  </VStack>

                                </SimpleGrid>



                                {/* Enhanced Score Details */}

                                {(() => {

                                  const score = leadDetails.score || leadDetails.leadScore || leadDetails.questionResponses?.score;

                                  const vslScore = leadDetails.vslScore || leadDetails.vsl_score || leadDetails.questionResponses?.vslScore || leadDetails.questionResponses?.vsl_score;

                                  return score || vslScore;

                                })() && (

                                  <Box mt={6} p={6} bg="gradient-to-r" bgGradient="linear(to-r, gray.50, blue.50)" borderRadius="xl" border="2px solid" borderColor="gray.200" shadow="md">

                                    <HStack mb={4}>

                                      <Box as={FiTrendingUp} color="blue.600" fontSize="24px" />

                                      <Text fontSize="lg" fontWeight="bold" color="gray.700">

                                        📈 Detailed Score Breakdown

                                      </Text>

                                    </HStack>

                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>

                                      {(() => {

                                        const score = leadDetails.score || leadDetails.leadScore || leadDetails.questionResponses?.score;

                                        return score && (

                                          <HStack justify="space-between" p={3} bg="white" borderRadius="lg" border="1px solid" borderColor="green.200">

                                            <HStack>

                                              <Box as={FiTarget} color="green.500" />

                                              <Text fontSize="sm" color="gray.600" fontWeight="medium">Lead Score:</Text>

                                            </HStack>

                                            <Text fontSize="sm" fontWeight="bold" color="green.600">{score}/100</Text>

                                          </HStack>

                                        );

                                      })()}

                                      {(() => {

                                        const vslScore = leadDetails.vslScore || leadDetails.vsl_score || leadDetails.questionResponses?.vslScore || leadDetails.questionResponses?.vsl_score;

                                        return vslScore && (

                                          <HStack justify="space-between" p={3} bg="white" borderRadius="lg" border="1px solid" borderColor="purple.200">

                                            <HStack>

                                              <Box as={FiBarChart2} color="purple.500" />

                                              <Text fontSize="sm" color="gray.600" fontWeight="medium">VSL Score:</Text>

                                            </HStack>

                                            <Text fontSize="sm" fontWeight="bold" color="purple.600">{vslScore}/100</Text>

                                          </HStack>

                                        );

                                      })()}

                                      {(() => {

                                        const score = leadDetails.score || leadDetails.leadScore || leadDetails.questionResponses?.score;

                                        const vslScore = leadDetails.vslScore || leadDetails.vsl_score || leadDetails.questionResponses?.vslScore || leadDetails.questionResponses?.vsl_score;

                                        return score && vslScore && (

                                          <HStack justify="space-between" p={3} bg="white" borderRadius="lg" border="1px solid" borderColor="blue.200" gridColumn="span 2">

                                            <HStack>

                                              <Box as={FiTrendingUp} color="blue.500" />

                                              <Text fontSize="sm" color="gray.600" fontWeight="medium">Combined Score:</Text>

                                            </HStack>

                                            <Text fontSize="sm" fontWeight="bold" color="blue.600">

                                              {Math.round((score + vslScore) / 2)}/100

                                            </Text>

                                          </HStack>

                                        );

                                      })()}

                                    </SimpleGrid>

                                    

                                    {/* Debug Info */}

                                    <Box mt={4} p={3} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">

                                      <Text fontSize="xs" color="yellow.700" fontWeight="medium" mb={2}>

                                        🔍 Debug Info (Check Console for Full Lead Data):

                                      </Text>

                                      <Text fontSize="xs" color="yellow.600">

                                        Score Sources: score, leadScore, questionResponses.score | VSL Sources: vslScore, vsl_score, questionResponses.vslScore, questionResponses.vsl_score

                                      </Text>

                                    </Box>

                                  </Box>

                                )}

                              </CardBody>

                            </Card>

                          </VStack>

                        </CardBody>

                      </Card>

                    )}



                    {/* Questions and Answers */}

                    {((selectedAppointment.clientQuestions && Object.keys(selectedAppointment.clientQuestions).length > 0) || 

                      (selectedAppointment.coachQuestions && Object.keys(selectedAppointment.coachQuestions).length > 0) ||

                      (leadDetails && leadDetails.clientQuestions && Object.keys(leadDetails.clientQuestions).length > 0) ||

                      (leadDetails && leadDetails.coachQuestions && Object.keys(leadDetails.coachQuestions).length > 0)) && (

                      <Card borderRadius="7px">

                        <CardHeader borderRadius="7px 7px 0 0">

                          <Heading size="md">Questions & Answers</Heading>

                        </CardHeader>

                        <CardBody>

                          <VStack spacing={6} align="stretch">

                            {/* Client Questions */}

                            {((selectedAppointment.clientQuestions && Object.keys(selectedAppointment.clientQuestions).length > 0) ||

                              (leadDetails && leadDetails.clientQuestions && Object.keys(leadDetails.clientQuestions).length > 0)) && (

                              <Box>

                                <Text fontSize="lg" fontWeight="bold" color="green.600" mb={4}>

                                  Client Questions

                                </Text>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>

                                  {Object.entries(selectedAppointment.clientQuestions || leadDetails?.clientQuestions || {}).map(([key, value]) => {

                                    if (!value || value === '') return null;

                                    

                                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                                    

                                    return (

                                      <VStack key={key} align="start" spacing={1} p={3} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">

                                        <Text fontSize="sm" fontWeight="medium" color="green.700">

                                          {label}:

                                        </Text>

                                        <Text fontSize="sm" color="gray.800">

                                          {Array.isArray(value) ? value.join(', ') : value}

                                        </Text>

                                      </VStack>

                                    );

                                  })}

                                </SimpleGrid>

                              </Box>

                            )}



                            {/* Coach Questions */}

                            {((selectedAppointment.coachQuestions && Object.keys(selectedAppointment.coachQuestions).length > 0) ||

                              (leadDetails && leadDetails.coachQuestions && Object.keys(leadDetails.coachQuestions).length > 0)) && (

                              <Box>

                                <Text fontSize="lg" fontWeight="bold" color="blue.600" mb={4}>

                                  Coach Questions

                                </Text>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>

                                  {Object.entries(selectedAppointment.coachQuestions || leadDetails?.coachQuestions || {}).map(([key, value]) => {

                                    if (!value || value === '') return null;

                                    

                                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                                    

                                    return (

                                      <VStack key={key} align="start" spacing={1} p={3} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">

                                        <Text fontSize="sm" fontWeight="medium" color="blue.700">

                                          {label}:

                                        </Text>

                                        <Text fontSize="sm" color="gray.800">

                                          {Array.isArray(value) ? value.join(', ') : value}

                                        </Text>

                                      </VStack>

                                    );

                                  })}

                                </SimpleGrid>

                              </Box>

                            )}

                          </VStack>

                        </CardBody>

                      </Card>

                    )}



                    {/* Notes */}

                    {selectedAppointment.notes && (

                      <Card borderRadius="7px">

                        <CardHeader borderRadius="7px 7px 0 0">

                          <Heading size="md">Notes</Heading>

                        </CardHeader>

                        <CardBody>

                          <Text color="gray.700" lineHeight="1.6">

                            {selectedAppointment.notes}

                          </Text>

                        </CardBody>

                      </Card>

                    )}

                  </VStack>

                )}

              </ModalBody>



              <ModalFooter
                py={6}
                px={8}
                borderTop="1px solid"
                borderColor="gray.100"
                bg="gray.50"
              >
                <HStack spacing={3} justify="flex-end" w="full">
                  <Button
                    onClick={onAppointmentDetailsClose}
                    variant="ghost"
                    borderRadius="12px"
                    fontWeight="600"
                    px={6}
                    _hover={{ bg: 'gray.100' }}
                  >
                    Close
                  </Button>
                  <Button

                    colorScheme="orange"

                    leftIcon={<EditIcon />}

                    onClick={() => handleEditAppointment(selectedAppointment)}

                    borderRadius="12px"
                    fontWeight="600"
                    px={6}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.2s"
                  >

                    Edit Appointment

                  </Button>

                  <Button

                    colorScheme="red"

                    leftIcon={<DeleteIcon />}

                    onClick={() => deleteAppointment(selectedAppointment.id || selectedAppointment._id)}

                    borderRadius="12px"
                    fontWeight="600"
                    px={6}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.2s"
                  >

                    Delete

                  </Button>

                </HStack>
              </ModalFooter>

            </ModalContent>

          </Modal>



          {/* API Console Modal */}

          <Modal isOpen={apiConsoleOpen} onClose={() => setApiConsoleOpen(false)} size="6xl">

            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />

            <ModalContent borderRadius="2xl" maxH="90vh">

              <ModalHeader>

                <HStack>

                  <Box as={FiBarChart2} size="24px" color="purple.500" />

                  <Text>Questions API Console & Response Viewer</Text>

                  <Badge colorScheme="purple" variant="subtle" px={3} py={1} borderRadius="full">

                    Coach Dashboard

                  </Badge>

                </HStack>

              </ModalHeader>

              <ModalCloseButton />

              

              <ModalBody>

                <Tabs variant="enclosed" colorScheme="purple">

                  <TabList>

                    <Tab>API Testing</Tab>

                    <Tab>Question Types</Tab>

                    <Tab>User Responses Display</Tab>

                    <Tab>Leads Detail Console</Tab>

                    <Tab>API Results</Tab>

                  </TabList>



                  <TabPanels>

                    {/* API Testing Panel */}

                    <TabPanel>

                      <VStack spacing={6} align="stretch">

                        {/* Lead ID Input */}

                        <Card>

                          <CardHeader>

                            <Heading size="md">Test Configuration</Heading>

                          </CardHeader>

                          <CardBody>

                            <VStack spacing={4} align="stretch">

                              <FormControl isRequired>

                                <FormLabel>Lead ID for Testing</FormLabel>

                                <Input

                                  placeholder="Enter Lead ID (e.g., 64a5f8b4c123456789abcdef)"

                                  value={testLeadId}

                                  onChange={(e) => setTestLeadId(e.target.value)}

                                  bg="white"

                                />

                                <Text fontSize="xs" color="gray.500" mt={1}>

                                  Required for testing client/coach questions and lead update APIs

                                </Text>

                              </FormControl>

                            </VStack>

                          </CardBody>

                        </Card>



                        {/* API Test Buttons */}

                        <Card>

                          <CardHeader>

                            <Heading size="md">API Tests</Heading>

                          </CardHeader>

                          <CardBody>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>

                              <VStack spacing={3} align="stretch">

                                <Text fontWeight="semibold" color="blue.600">Public APIs (No Auth)</Text>

                                <Button

                                  leftIcon={<ViewIcon />}

                                  colorScheme="blue"

                                  onClick={testQuestionTypesAPI}

                                  isLoading={apiLoading}

                                  size="md"

                                >

                                  Test Question Types API

                                </Button>

                                <Button

                                  leftIcon={<CheckCircleIcon />}

                                  colorScheme="green"

                                  onClick={testClientQuestionsAPI}

                                  isLoading={apiLoading}

                                  disabled={!testLeadId.trim()}

                                  size="md"

                                >

                                  Test Client Questions API

                                </Button>

                                <Button

                                  leftIcon={<StarIcon />}

                                  colorScheme="orange"

                                  onClick={testCoachQuestionsAPI}

                                  isLoading={apiLoading}

                                  disabled={!testLeadId.trim()}

                                  size="md"

                                >

                                  Test Coach Questions API

                                </Button>

                                <Button

                                  leftIcon={<EditIcon />}

                                  colorScheme="purple"

                                  onClick={testLeadUpdateAPI}

                                  isLoading={apiLoading}

                                  disabled={!testLeadId.trim()}

                                  size="md"

                                >

                                  Test Lead Update API

                                </Button>

                              </VStack>

                              

                              <VStack spacing={3} align="stretch">

                                <Text fontWeight="semibold" color="purple.600">Actions</Text>

                                <Button

                                  leftIcon={<DeleteIcon />}

                                  colorScheme="red"

                                  variant="outline"

                                  onClick={clearApiResults}

                                  size="md"

                                >

                                  Clear Results

                                </Button>

                                <Box

                                  p={4}

                                  bg="blue.50"

                                  borderRadius="md"

                                  border="1px"

                                  borderColor="blue.200"

                                >

                                  <VStack spacing={2} align="start">

                                    <Text fontSize="sm" fontWeight="semibold" color="blue.700">

                                      Total API Tests: {apiTestResults.length}

                                    </Text>

                                    <Text fontSize="sm" color="blue.600">

                                      Success: {apiTestResults.filter(r => r.success).length}

                                    </Text>

                                    <Text fontSize="sm" color="blue.600">

                                      Failed: {apiTestResults.filter(r => !r.success).length}

                                    </Text>

                                  </VStack>

                                </Box>

                              </VStack>

                            </SimpleGrid>

                          </CardBody>

                        </Card>

                      </VStack>

                    </TabPanel>



                    {/* Question Types Panel */}

                    <TabPanel>

                      <VStack spacing={6} align="stretch">

                        {loadingQuestionTypes ? (

                          <Center py={10}>

                            <VStack spacing={4}>

                              <Spinner size="xl" color="purple.500" />

                              <Text>Loading question types...</Text>

                            </VStack>

                          </Center>

                        ) : questionTypes ? (

                          <VStack spacing={6} align="stretch">

                            {/* Client Questions */}

                            <Card>

                              <CardHeader>

                                <HStack>

                                  <Box as={FiUser} size="20px" color="blue.500" />

                                  <Heading size="md" color="blue.600">Client Questions Structure</Heading>

                                </HStack>

                              </CardHeader>

                              <CardBody>

                                <VStack spacing={4} align="stretch">

                                  <Text fontSize="sm" color="gray.600" fontStyle="italic">

                                    {questionTypes.client?.description}

                                  </Text>

                                  {questionTypes.client?.questions?.map((q, i) => (

                                    <Box key={i} p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">

                                      <VStack spacing={2} align="start">

                                        <HStack>

                                          <Badge colorScheme="blue" size="sm">{q.field}</Badge>

                                          <Badge colorScheme={q.required ? 'red' : 'gray'} size="sm">

                                            {q.required ? 'Required' : 'Optional'}

                                          </Badge>

                                          <Badge colorScheme="green" size="sm">{q.type}</Badge>

                                        </HStack>

                                        <Text fontSize="sm" fontWeight="semibold">{q.question}</Text>

                                        {q.options && (

                                          <Box>

                                            <Text fontSize="xs" color="gray.600" fontWeight="medium">Options:</Text>

                                            <Wrap spacing={1} mt={1}>

                                              {q.options.map((opt, oi) => (

                                                <WrapItem key={oi}>

                                                  <Badge variant="outline" size="sm">{opt}</Badge>

                                                </WrapItem>

                                              ))}

                                            </Wrap>

                                          </Box>

                                        )}

                                      </VStack>

                                    </Box>

                                  ))}

                                </VStack>

                              </CardBody>

                            </Card>



                            {/* Coach Questions */}

                            <Card>

                              <CardHeader>

                                <HStack>

                                  <Box as={FiUsers} size="20px" color="orange.500" />

                                  <Heading size="md" color="orange.600">Coach Questions Structure</Heading>

                                </HStack>

                              </CardHeader>

                              <CardBody>

                                <VStack spacing={4} align="stretch">

                                  <Text fontSize="sm" color="gray.600" fontStyle="italic">

                                    {questionTypes.coach?.description}

                                  </Text>

                                  {questionTypes.coach?.questions?.map((q, i) => (

                                    <Box key={i} p={4} bg="orange.50" borderRadius="md" border="1px" borderColor="orange.200">

                                      <VStack spacing={2} align="start">

                                        <HStack>

                                          <Badge colorScheme="orange" size="sm">{q.field}</Badge>

                                          <Badge colorScheme={q.required ? 'red' : 'gray'} size="sm">

                                            {q.required ? 'Required' : 'Optional'}

                                          </Badge>

                                          <Badge colorScheme="green" size="sm">{q.type}</Badge>

                                        </HStack>

                                        <Text fontSize="sm" fontWeight="semibold">{q.question}</Text>

                                        {q.options && (

                                          <Box>

                                            <Text fontSize="xs" color="gray.600" fontWeight="medium">Options:</Text>

                                            <Wrap spacing={1} mt={1}>

                                              {q.options.map((opt, oi) => (

                                                <WrapItem key={oi}>

                                                  <Badge variant="outline" size="sm">{opt}</Badge>

                                                </WrapItem>

                                              ))}

                                            </Wrap>

                                          </Box>

                                        )}

                                      </VStack>

                                    </Box>

                                  ))}

                                </VStack>

                              </CardBody>

                            </Card>

                          </VStack>

                        ) : (

                          <Center py={10}>

                            <VStack spacing={4}>

                              <WarningIcon fontSize="4xl" color="gray.400" />

                              <VStack spacing={2}>

                                <Text fontSize="lg" fontWeight="semibold" color="gray.600">

                                  No Question Types Loaded

                                </Text>

                                <Text color="gray.500" textAlign="center">

                                  Question types not loaded yet. Use API Testing tab to fetch them.

                                </Text>

                              </VStack>

                              <Button colorScheme="purple" onClick={fetchQuestionTypes}>

                                Load Question Types

                              </Button>

                            </VStack>

                          </Center>

                        )}

                      </VStack>

                    </TabPanel>



                    {/* User Responses Display Panel */}

                    <TabPanel>

                      <VStack spacing={6} align="stretch">

                        <Card>

                          <CardHeader>

                            <HStack>

                              <Box as={FiEye} size="20px" color="green.500" />

                              <Heading size="md" color="green.600">User Question Responses Viewer</Heading>

                            </HStack>

                          </CardHeader>

                          <CardBody>

                            <VStack spacing={6} align="stretch">

                              {/* Test Client Questions Display */}

                              <Box>

                                <Text fontSize="lg" fontWeight="semibold" mb={4} color="blue.600">

                                  Sample Client Questions & Answers:

                                </Text>

                                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>

                                  {Object.entries(testClientQuestions).map(([key, value]) => (

                                    <Box key={key} p={3} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">

                                      <VStack spacing={2} align="start">

                                        <Text fontSize="sm" fontWeight="bold" color="blue.700">

                                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:

                                        </Text>

                                        <Text fontSize="sm" color="blue.600" wordBreak="break-word">

                                          {typeof value === 'number' ? `${value}%` : value || 'Not provided'}

                                        </Text>

                                      </VStack>

                                    </Box>

                                  ))}

                                </SimpleGrid>

                              </Box>



                              <Divider />



                              {/* Test Coach Questions Display */}

                              <Box>

                                <Text fontSize="lg" fontWeight="semibold" mb={4} color="orange.600">

                                  Sample Coach Questions & Answers:

                                </Text>

                                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>

                                  {Object.entries(testCoachQuestions).map(([key, value]) => (

                                    <Box key={key} p={3} bg="orange.50" borderRadius="md" border="1px" borderColor="orange.200">

                                      <VStack spacing={2} align="start">

                                        <Text fontSize="sm" fontWeight="bold" color="orange.700">

                                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:

                                        </Text>

                                        <Text fontSize="sm" color="orange.600" wordBreak="break-word">

                                          {Array.isArray(value) ? value.join(', ') : 

                                           typeof value === 'number' ? `${value}%` : 

                                           value || 'Not provided'}

                                        </Text>

                                      </VStack>

                                    </Box>

                                  ))}

                                </SimpleGrid>

                              </Box>



                              {/* Live Lead Response Viewer */}

                              <Card>

                                <CardHeader>

                                  <Heading size="sm" color="purple.600">Live Lead Response Viewer</Heading>

                                </CardHeader>

                                <CardBody>

                                  <VStack spacing={4} align="stretch">

                                    <FormControl>

                                      <FormLabel>Enter Lead ID to view their responses:</FormLabel>

                                      <HStack>

                                        <Input

                                          placeholder="Lead ID"

                                          value={testLeadId}

                                          onChange={(e) => setTestLeadId(e.target.value)}

                                        />

                                        <Button

                                          colorScheme="purple"

                                          onClick={async () => {

                                            if (!testLeadId.trim()) {

                                              toast('Please enter a Lead ID', 'error');

                                              return;

                                            }

                                            const leadData = await fetchSingleLead(testLeadId.trim());

                                            if (leadData) {

                                              setLeadDetails(leadData);

                                              toast('Lead details fetched successfully!', 'success');

                                            } else {

                                              toast('Lead not found', 'error');

                                            }

                                          }}

                                          isLoading={loadingLeads}

                                        >

                                          Fetch

                                        </Button>

                                      </HStack>

                                    </FormControl>



                                    {leadDetails && (

                                      <Box p={4} bg="purple.50" borderRadius="md" border="1px" borderColor="purple.200">

                                        <VStack spacing={3} align="start">

                                          <Text fontSize="md" fontWeight="bold" color="purple.700">

                                            Lead Details for: {leadDetails.clientQuestions?.fullName || 'Unknown'}

                                          </Text>

                                          

                                          {leadDetails.clientQuestions && (

                                            <Box w="full">

                                              <Text fontSize="sm" fontWeight="semibold" color="purple.600" mb={2}>

                                                Client Questions Response:

                                              </Text>

                                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>

                                                {Object.entries(leadDetails.clientQuestions).map(([key, value]) => (

                                                  <Box key={key} p={2} bg="white" borderRadius="sm">

                                                    <Text fontSize="xs" fontWeight="bold" color="gray.700">

                                                      {key}:

                                                    </Text>

                                                    <Text fontSize="xs" color="gray.600">

                                                      {value || 'N/A'}

                                                    </Text>

                                                  </Box>

                                                ))}

                                              </SimpleGrid>

                                            </Box>

                                          )}



                                          {leadDetails.questionResponses && (

                                            <Box w="full">

                                              <Text fontSize="sm" fontWeight="semibold" color="purple.600" mb={2}>

                                                Question Responses:

                                              </Text>

                                              <Box p={3} bg="white" borderRadius="sm">

                                                <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>

                                                  {JSON.stringify(leadDetails.questionResponses, null, 2)}

                                                </pre>

                                              </Box>

                                            </Box>

                                          )}

                                        </VStack>

                                      </Box>

                                    )}

                                  </VStack>

                                </CardBody>

                              </Card>

                            </VStack>

                          </CardBody>

                        </Card>

                      </VStack>

                    </TabPanel>



                    {/* Leads Detail Console Panel */}

                    <TabPanel>

                      <VStack spacing={6} align="stretch">

                        {/* Leads Search & Filter */}

                        <Card>

                          <CardHeader>

                            <HStack>

                              <Box as={FiUsers} size="20px" color="blue.500" />

                              <Heading size="md" color="blue.600">Leads Detail Console</Heading>

                              <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">

                                {leads.length} Leads

                              </Badge>

                            </HStack>

                          </CardHeader>

                          <CardBody>

                            <VStack spacing={4} align="stretch">

                              {/* Search Controls */}

                              <HStack spacing={4}>

                                <InputGroup flex="1">

                                  <InputLeftElement>

                                    <SearchIcon color="gray.400" />

                                  </InputLeftElement>

                                  <Input

                                    placeholder="Search leads by name, email, phone..."

                                    value={leadSearchQuery}

                                    onChange={(e) => setLeadSearchQuery(e.target.value)}

                                    bg="white"

                                  />

                                </InputGroup>

                                <Button

                                  colorScheme="blue"

                                  onClick={() => fetchLeadsData()}

                                  isLoading={loadingLeads}

                                  loadingText="Searching..."

                                  leftIcon={<SearchIcon />}

                                >

                                  Search

                                </Button>

                                <Button

                                  colorScheme="green"

                                  onClick={() => fetchLeadsData()}

                                  isLoading={loadingLeads}

                                  loadingText="Loading..."

                                  leftIcon={<FiUsers />}

                                >

                                  Load All

                                </Button>

                              </HStack>



                              {/* Quick Stats */}

                              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>

                                <Box p={3} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">

                                  <VStack spacing={1}>

                                    <Text fontSize="sm" color="blue.600" fontWeight="medium">Total Leads</Text>

                                    <Text fontSize="2xl" fontWeight="bold" color="blue.700">{leads.length}</Text>

                                  </VStack>

                                </Box>

                                <Box p={3} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">

                                  <VStack spacing={1}>

                                    <Text fontSize="sm" color="green.600" fontWeight="medium">With Questions</Text>

                                    <Text fontSize="2xl" fontWeight="bold" color="green.700">

                                      {leads.filter(l => 

                                        (l.clientQuestions && Object.keys(l.clientQuestions).length > 0) || 

                                        (l.coachQuestions && Object.keys(l.coachQuestions).length > 0) || 

                                        l.questionResponses

                                      ).length}

                                    </Text>

                                  </VStack>

                                </Box>

                                <Box p={3} bg="orange.50" borderRadius="md" border="1px" borderColor="orange.200">

                                  <VStack spacing={1}>

                                    <Text fontSize="sm" color="orange.600" fontWeight="medium">Hot Leads</Text>

                                    <Text fontSize="2xl" fontWeight="bold" color="orange.700">

                                      {leads.filter(l => l.leadTemperature === 'Hot').length}

                                    </Text>

                                  </VStack>

                                </Box>

                                <Box p={3} bg="purple.50" borderRadius="md" border="1px" borderColor="purple.200">

                                  <VStack spacing={1}>

                                    <Text fontSize="sm" color="purple.600" fontWeight="medium">Qualified</Text>

                                    <Text fontSize="2xl" fontWeight="bold" color="purple.700">

                                      {leads.filter(l => l.status === 'Qualified').length}

                                    </Text>

                                  </VStack>

                                </Box>

                              </SimpleGrid>

                            </VStack>

                          </CardBody>

                        </Card>



                        {/* Leads List */}

                        {loadingLeads ? (

                          <Center py={10}>

                            <VStack spacing={4}>

                              <Spinner size="xl" color="blue.500" />

                              <Text>Loading leads...</Text>

                            </VStack>

                          </Center>

                        ) : leads.length > 0 ? (

                          <VStack spacing={4} align="stretch" maxH="600px" overflowY="auto">

                            {leads.map((lead) => (

                              <Card key={lead._id || lead.id} variant="outline" _hover={{ shadow: 'md' }}>

                                <CardBody>

                                  <VStack spacing={4} align="stretch">

                                    {/* Lead Header */}

                                    <HStack justify="space-between" align="start">

                                      <HStack spacing={4}>

                                        <Avatar

                                          name={lead.clientQuestions?.fullName || lead.name || 'Lead'}

                                          size="md"

                                          bg="blue.500"

                                          color="white"

                                        />

                                        <VStack align="start" spacing={1}>

                                          <Text fontSize="lg" fontWeight="bold" color="gray.800">

                                            {lead.clientQuestions?.fullName || lead.name || 'Unknown Lead'}

                                          </Text>

                                          <HStack spacing={4} fontSize="sm" color="gray.600">

                                            <HStack spacing={1}>

                                              <EmailIcon fontSize="xs" />

                                              <Text>{lead.clientQuestions?.email || lead.email || 'No email'}</Text>

                                            </HStack>

                                            {lead.clientQuestions?.whatsappNumber && (

                                              <HStack spacing={1}>

                                                <PhoneIcon fontSize="xs" />

                                                <Text>{lead.clientQuestions.whatsappNumber}</Text>

                                              </HStack>

                                            )}

                                          </HStack>

                                        </VStack>

                                      </HStack>

                                      

                                      <VStack spacing={2} align="end">

                                        <HStack spacing={2}>

                                          {lead.leadTemperature && (

                                            <Badge 

                                              colorScheme={

                                                lead.leadTemperature === 'Hot' ? 'red' :

                                                lead.leadTemperature === 'Warm' ? 'yellow' : 'blue'

                                              }

                                              variant="solid"

                                            >

                                              {lead.leadTemperature}

                                            </Badge>

                                          )}

                                          {lead.status && (

                                            <Badge colorScheme="green" variant="subtle">

                                              {lead.status}

                                            </Badge>

                                          )}

                                        </HStack>

                                        <Text fontSize="xs" color="gray.500">

                                          ID: {lead._id || lead.id}

                                        </Text>

                                      </VStack>

                                    </HStack>



                                    {/* Lead Details */}

                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>

                                      {/* Basic Info */}

                                      <Box>

                                        <Text fontSize="sm" fontWeight="semibold" color="blue.600" mb={2}>

                                          Basic Information

                                        </Text>

                                        <VStack spacing={2} align="stretch">

                                          {lead.clientQuestions?.profession && (

                                            <HStack justify="space-between">

                                              <Text fontSize="sm" color="gray.600">Profession:</Text>

                                              <Text fontSize="sm" fontWeight="medium">{lead.clientQuestions.profession}</Text>

                                            </HStack>

                                          )}

                                          {lead.clientQuestions?.cityCountry && (

                                            <HStack justify="space-between">

                                              <Text fontSize="sm" color="gray.600">Location:</Text>

                                              <Text fontSize="sm" fontWeight="medium">{lead.clientQuestions.cityCountry}</Text>

                                            </HStack>

                                          )}

                                          {lead.vslWatchPercentage && (

                                            <HStack justify="space-between">

                                              <Text fontSize="sm" color="gray.600">VSL Watch:</Text>

                                              <Text fontSize="sm" fontWeight="medium">{lead.vslWatchPercentage}%</Text>

                                            </HStack>

                                          )}

                                          {lead.score && (

                                            <HStack justify="space-between">

                                              <Text fontSize="sm" color="gray.600">Score:</Text>

                                              <Text fontSize="sm" fontWeight="medium">{lead.score}/100</Text>

                                            </HStack>

                                          )}

                                        </VStack>

                                      </Box>



                                      {/* Question Responses */}

                                      <Box>

                                        <Text fontSize="sm" fontWeight="semibold" color="green.600" mb={2}>

                                          Question Responses

                                        </Text>

                                        <VStack spacing={3} align="stretch" maxH="300px" overflowY="auto">

                                          {/* Client Questions */}

                                          {lead.clientQuestions && Object.keys(lead.clientQuestions).length > 0 && (

                                            <Box>

                                              <Text fontSize="xs" fontWeight="bold" color="blue.600" mb={2}>

                                                📝 Client Questions & Answers:

                                              </Text>

                                              <VStack spacing={2} align="stretch">

                                                {Object.entries(lead.clientQuestions).map(([key, value]) => (

                                                  <Box key={key} p={2} bg="blue.50" borderRadius="sm" border="1px" borderColor="blue.200">

                                                    <Text fontSize="xs" fontWeight="bold" color="blue.700">

                                                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:

                                                    </Text>

                                                    <Text fontSize="xs" color="blue.600" wordBreak="break-word">

                                                      {typeof value === 'number' ? `${value}%` : value || 'N/A'}

                                                    </Text>

                                                  </Box>

                                                ))}

                                              </VStack>

                                            </Box>

                                          )}



                                          {/* Coach Questions */}

                                          {lead.coachQuestions && Object.keys(lead.coachQuestions).length > 0 && (

                                            <Box>

                                              <Text fontSize="xs" fontWeight="bold" color="orange.600" mb={2}>

                                                🏋️ Coach Questions & Answers:

                                              </Text>

                                              <VStack spacing={2} align="stretch">

                                                {Object.entries(lead.coachQuestions).map(([key, value]) => (

                                                  <Box key={key} p={2} bg="orange.50" borderRadius="sm" border="1px" borderColor="orange.200">

                                                    <Text fontSize="xs" fontWeight="bold" color="orange.700">

                                                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:

                                                    </Text>

                                                    <Text fontSize="xs" color="orange.600" wordBreak="break-word">

                                                      {Array.isArray(value) ? value.join(', ') : (typeof value === 'number' ? `${value}%` : value || 'N/A')}

                                                    </Text>

                                                  </Box>

                                                ))}

                                              </VStack>

                                            </Box>

                                          )}



                                          {/* No Questions Available */}

                                          {(!lead.clientQuestions || Object.keys(lead.clientQuestions).length === 0) && 

                                           (!lead.coachQuestions || Object.keys(lead.coachQuestions).length === 0) && (

                                            <Text fontSize="sm" color="gray.500" fontStyle="italic">

                                              No question responses available

                                            </Text>

                                          )}

                                        </VStack>

                                      </Box>

                                    </SimpleGrid>



                                    {/* Actions */}

                                    <HStack justify="space-between">

                                      <HStack spacing={2}>

                                        <Button

                                          size="sm"

                                          colorScheme="blue"

                                          variant="outline"

                                          leftIcon={<ViewIcon />}

                                          onClick={() => {

                                            setTestLeadId(lead._id || lead.id);

                                            setLeadDetails(lead);

                                            toast('Lead details loaded for testing', 'success');

                                          }}

                                        >

                                          Load for Testing

                                        </Button>

                                        <Button

                                          size="sm"

                                          colorScheme="green"

                                          variant="outline"

                                          leftIcon={<FiEye />}

                                          onClick={() => {

                                            setLeadDetails(lead);

                                            toast('Lead details displayed', 'info');

                                          }}

                                        >

                                          View Details

                                        </Button>

                                      </HStack>

                                      

                                      <Text fontSize="xs" color="gray.500">

                                        Created: {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Unknown'}

                                      </Text>

                                    </HStack>



                                    {/* Qualification Insights */}

                                    {lead.qualificationInsights && lead.qualificationInsights.length > 0 && (

                                      <Box p={3} bg="purple.50" borderRadius="md" border="1px" borderColor="purple.200">

                                        <Text fontSize="sm" fontWeight="semibold" color="purple.600" mb={2}>

                                          Qualification Insights:

                                        </Text>

                                        <VStack spacing={1} align="stretch">

                                          {lead.qualificationInsights.map((insight, i) => (

                                            <Text key={i} fontSize="xs" color="purple.700">

                                              • {insight}

                                            </Text>

                                          ))}

                                        </VStack>

                                      </Box>

                                    )}

                                  </VStack>

                                </CardBody>

                              </Card>

                            ))}

                          </VStack>

                        ) : (

                          <Center py={10}>

                            <VStack spacing={4}>

                              <Box as={FiUsers} size="48px" color="gray.400" />

                              <VStack spacing={2}>

                                <Text fontSize="lg" fontWeight="semibold" color="gray.600">

                                  No Leads Found

                                </Text>

                                <Text color="gray.500" textAlign="center">

                                  {leadSearchQuery ? 'Try adjusting your search terms.' : 'Load leads to see them here.'}

                                </Text>

                              </VStack>

                              <Button colorScheme="blue" onClick={() => fetchLeadsData()}>

                                Load All Leads

                              </Button>

                            </VStack>

                          </Center>

                        )}

                      </VStack>

                    </TabPanel>



                    {/* API Results Panel */}

                    <TabPanel>

                      <VStack spacing={4} align="stretch">

                        {apiTestResults.length > 0 ? (

                          apiTestResults.map((result) => (

                            <Card key={result.id} variant="outline">

                              <CardHeader>

                                <HStack justify="space-between">

                                  <VStack align="start" spacing={1}>

                                    <HStack>

                                      <Badge 

                                        colorScheme={result.success ? 'green' : 'red'} 

                                        variant="solid"

                                      >

                                        {result.status}

                                      </Badge>

                                      <Text fontSize="md" fontWeight="bold">

                                        {result.api}

                                      </Text>

                                    </HStack>

                                    <Text fontSize="xs" color="gray.500">

                                      {new Date(result.timestamp).toLocaleString()}

                                    </Text>

                                  </VStack>

                                  <CopyIcon 

                                    cursor="pointer" 

                                    onClick={() => {

                                      navigator.clipboard.writeText(JSON.stringify(result, null, 2));

                                      toast('Result copied to clipboard!', 'success');

                                    }}

                                  />

                                </HStack>

                              </CardHeader>

                              <CardBody>

                                <VStack spacing={4} align="stretch">

                                  {/* Request Details */}

                                  <Box>

                                    <Text fontSize="sm" fontWeight="semibold" mb={2} color="blue.600">

                                      Request:

                                    </Text>

                                    <Box p={3} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">

                                      <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', margin: 0 }}>

                                        {JSON.stringify(result.request, null, 2)}

                                      </pre>

                                    </Box>

                                  </Box>



                                  {/* Response Details */}

                                  <Box>

                                    <Text fontSize="sm" fontWeight="semibold" mb={2} color="green.600">

                                      Response:

                                    </Text>

                                    <Box 

                                      p={3} 

                                      bg={result.success ? "green.50" : "red.50"} 

                                      borderRadius="md" 

                                      border="1px" 

                                      borderColor={result.success ? "green.200" : "red.200"}

                                    >

                                      <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', margin: 0 }}>

                                        {JSON.stringify(result.response, null, 2)}

                                      </pre>

                                    </Box>

                                  </Box>



                                  {/* Show Insights if available */}

                                  {result.response?.data?.qualificationInsights && (

                                    <Box>

                                      <Text fontSize="sm" fontWeight="semibold" mb={2} color="purple.600">

                                        Lead Qualification Insights:

                                      </Text>

                                      <VStack spacing={2} align="stretch">

                                        {result.response.data.qualificationInsights.map((insight, i) => (

                                          <Box key={i} p={2} bg="purple.50" borderRadius="sm">

                                            <Text fontSize="sm" color="purple.700">• {insight}</Text>

                                          </Box>

                                        ))}

                                        <Box p={2} bg="yellow.50" borderRadius="sm" border="1px" borderColor="yellow.200">

                                          <HStack justify="space-between">

                                            <Text fontSize="sm" fontWeight="bold" color="yellow.800">

                                              Lead Score: {result.response.data.score}/{result.response.data.maxScore || 100}

                                            </Text>

                                            <Badge 

                                              colorScheme={

                                                result.response.data.leadTemperature === 'Hot' ? 'red' :

                                                result.response.data.leadTemperature === 'Warm' ? 'yellow' : 'blue'

                                              }

                                            >

                                              {result.response.data.leadTemperature}

                                            </Badge>

                                          </HStack>

                                        </Box>

                                      </VStack>

                                    </Box>

                                  )}

                                </VStack>

                              </CardBody>

                            </Card>

                          ))

                        ) : (

                          <Center py={10}>

                            <VStack spacing={4}>

                              <Box as={FiBarChart2} size="48px" color="gray.400" />

                              <VStack spacing={2}>

                                <Text fontSize="lg" fontWeight="semibold" color="gray.600">

                                  No API Test Results Yet

                                </Text>

                                <Text color="gray.500" textAlign="center">

                                  Run some API tests to see the results here.

                                </Text>

                              </VStack>

                            </VStack>

                          </Center>

                        )}

                      </VStack>

                    </TabPanel>

                  </TabPanels>

                </Tabs>

              </ModalBody>



              <ModalFooter>

                <ButtonGroup spacing={3}>

                  <Button onClick={() => setApiConsoleOpen(false)}>Close</Button>

                  <Button

                    colorScheme="purple"

                    onClick={() => {

                      fetchQuestionTypes();

                      if (leads.length === 0) {

                        fetchLeadsData();

                      }

                    }}

                    isLoading={loadingQuestionTypes || loadingLeads}

                  >

                    Refresh All Data

                  </Button>

                </ButtonGroup>

              </ModalFooter>

            </ModalContent>

          </Modal>



          {/* Confirmation Modal */}

          <ConfirmationModal

            isOpen={isConfirmModalOpen}

            onClose={onConfirmModalClose}

            onConfirm={confirmDeleteAppointment}

            title="Delete Appointment"

            message="This action cannot be undone. This will permanently delete the appointment."

            isLoading={loading}

          />



          {/* OAuth Callback Result Dialog - Minimal & Elegant */}

          <Modal 

            isOpen={isOAuthDialogOpen} 

            onClose={onOAuthDialogClose}

            isCentered

            size="sm"

            motionPreset="scale"

          >

            <ModalOverlay 

              bg="blackAlpha.600" 

              backdropFilter="blur(8px)"

            />

            <ModalContent 

              borderRadius="12px"

              bg="white"

              boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"

              border="1px solid"

              borderColor="gray.100"

              overflow="hidden"

            >

              <ModalBody p={8}>

                <VStack spacing={6} align="center" textAlign="center">

                  {/* Icon */}

                  <Box

                    w="64px"

                    h="64px"

                    borderRadius="full"

                    bg={oauthDialogData.type === 'success' ? 'green.50' : 'red.50'}

                    display="flex"

                    alignItems="center"

                    justifyContent="center"

                  >

                    {oauthDialogData.type === 'success' ? (

                      <CheckCircleIcon color="green.500" boxSize={8} />

                    ) : (

                      <WarningIcon color="red.500" boxSize={8} />

                    )}

                  </Box>



                  {/* Title */}

                  <VStack spacing={2}>

                    <Text 

                      fontSize="xl" 

                      fontWeight="600" 

                      color={textColor}

                      letterSpacing="-0.02em"

                    >

                      {oauthDialogData.title}

                    </Text>

                    <Text 

                      fontSize="sm" 

                      color={secondaryTextColor}

                      lineHeight="1.6"

                      maxW="320px"

                    >

                      {oauthDialogData.message}

                    </Text>

                  </VStack>



                  {/* Action Buttons */}

                  <HStack spacing={3} w="full" pt={2}>

                    <Button 

                      onClick={onOAuthDialogClose}

                      variant="ghost"

                      size="md"

                      borderRadius="8px"

                      flex={1}

                      fontWeight="500"

                      color={secondaryTextColor}

                      _hover={{ bg: 'gray.50' }}

                    >

                      Close

                    </Button>

                    {oauthDialogData.type === 'success' && (

                      <Button

                        colorScheme="blue"

                        onClick={() => {

                          onOAuthDialogClose();

                          onAvailabilityModalOpen();

                          setSettingsTabIndex(1);

                        }}

                        borderRadius="8px"

                        size="md"

                        fontWeight="500"

                        flex={1}

                        bg="blue.500"

                        _hover={{ bg: 'blue.600' }}

                      >

                        View Settings

                      </Button>

                    )}

                  </HStack>

                </VStack>

              </ModalBody>

            </ModalContent>

          </Modal>

        </VStack>

      </Box>

    </Box>

  );

};



export default ComprehensiveCoachCalendar;

