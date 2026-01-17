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
  Switch,
  FormErrorMessage,
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
  FiUser as FiUserIcon,
  FiMail as FiMailIcon,
  FiPhone as FiPhoneIcon,
  FiMapPin as FiMapPinIcon,
  FiShield as FiShieldIcon,
  FiKey,
  FiCamera,
  FiUpload,
} from 'react-icons/fi';

const ProfileSettings = ({ data }) => {
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
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    role: 'Staff Member',
    department: 'Sales',
    location: 'New York, NY',
    bio: 'Experienced staff member with expertise in client relations and task management.',
    avatar: null,
    preferences: {
      notifications: {
        email: true,
        push: true,
        sms: false,
        taskReminders: true,
        performanceUpdates: true,
        teamUpdates: false
      },
      privacy: {
        profileVisibility: 'team',
        showPerformance: true,
        showTasks: false,
        showCalendar: true
      },
      display: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
      }
    },
    permissions: [
      'tasks:read',
      'tasks:write',
      'calendar:read',
      'calendar:write',
      'leads:read',
      'performance:read'
    ],
    isActive: true,
    joinedDate: '2024-01-15T10:00:00.000Z',
    lastActive: '2024-01-20T15:30:00.000Z'
  });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  
  // Modal states
  const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onClose: onPasswordModalClose } = useDisclosure();
  const { isOpen: isAvatarModalOpen, onOpen: onAvatarModalOpen, onClose: onAvatarModalClose } = useDisclosure();
  
  // Form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const toast = useToast();

  // Handle form validation
  const validateForm = (field, value) => {
    const errors = { ...formErrors };
    
    switch (field) {
      case 'email':
        if (!value || !/\S+@\S+\.\S+/.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'phone':
        if (!value || !/^\+?[\d\s\-\(\)]+$/.test(value)) {
          errors.phone = 'Please enter a valid phone number';
        } else {
          delete errors.phone;
        }
        break;
      case 'newPassword':
        if (value && value.length < 8) {
          errors.newPassword = 'Password must be at least 8 characters long';
        } else {
          delete errors.newPassword;
        }
        break;
      case 'confirmPassword':
        if (passwordData.newPassword && value !== passwordData.newPassword) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
      default:
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile update
  const handleProfileUpdate = async (field, value) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfileData(prev => ({ ...prev, [field]: value }));
      
      toast({
        title: 'Profile Updated',
        description: `${field} has been updated successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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

  // Handle password change
  const handlePasswordChange = async () => {
    if (!validateForm('newPassword', passwordData.newPassword) || 
        !validateForm('confirmPassword', passwordData.confirmPassword)) {
      return;
    }
    
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      onPasswordModalClose();
      
      toast({
        title: 'Password Changed',
        description: 'Your password has been changed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle preference update
  const handlePreferenceUpdate = (category, field, value) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...prev.preferences[category],
          [field]: value
        }
      }
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="7xl" py={6}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading size="xl" fontWeight="600" color={textColor} mb={2} lineHeight="1.2">
              Profile & Settings
            </Heading>
            <Text fontSize="md" color={secondaryTextColor} lineHeight="1.5">
              Manage your profile information and preferences
            </Text>
          </Box>

          {/* Profile Overview */}
          <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
            <CardBody p={8}>
              <Flex direction={{ base: 'column', md: 'row' }} spacing={8} align="center">
                <VStack spacing={4}>
                  <Avatar size="2xl" name={profileData.name} />
                  <Button size="sm" leftIcon={<FiCamera />} variant="outline" onClick={onAvatarModalOpen}>
                    Change Photo
                  </Button>
                </VStack>
                
                <VStack spacing={4} align="start" flex="1">
                  <Box>
                    <Heading size="lg" color={textColor}>{profileData.name}</Heading>
                    <Text fontSize="md" color={secondaryTextColor}>{profileData.role}</Text>
                    <Text fontSize="sm" color={mutedTextColor}>{profileData.department}</Text>
                  </Box>
                  
                  <HStack spacing={6} wrap="wrap">
                    <HStack spacing={2}>
                      <Icon as={FiMailIcon} boxSize={4} color={mutedTextColor} />
                      <Text fontSize="sm" color={secondaryTextColor}>{profileData.email}</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FiPhoneIcon} boxSize={4} color={mutedTextColor} />
                      <Text fontSize="sm" color={secondaryTextColor}>{profileData.phone}</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FiMapPinIcon} boxSize={4} color={mutedTextColor} />
                      <Text fontSize="sm" color={secondaryTextColor}>{profileData.location}</Text>
                    </HStack>
                  </HStack>
                  
                  <Box>
                    <Text fontSize="sm" color={mutedTextColor}>Member since</Text>
                    <Text fontSize="sm" color={secondaryTextColor}>{formatDate(profileData.joinedDate)}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontSize="sm" color={mutedTextColor}>Last active</Text>
                    <Text fontSize="sm" color={secondaryTextColor}>{formatDate(profileData.lastActive)}</Text>
                  </Box>
                </VStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Settings Tabs */}
          <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
            <CardBody p={0}>
              <Tabs index={activeTab} onChange={setActiveTab}>
                <TabList>
                  <Tab>Personal Info</Tab>
                  <Tab>Preferences</Tab>
                  <Tab>Security</Tab>
                  <Tab>Permissions</Tab>
                </TabList>
                
                <TabPanels>
                  {/* Personal Information Tab */}
                  <TabPanel p={6}>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md" color={textColor}>Personal Information</Heading>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl isInvalid={!!formErrors.name}>
                          <FormLabel>Full Name</FormLabel>
                          <Input
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter your full name"
                          />
                          <FormErrorMessage>{formErrors.name}</FormErrorMessage>
                        </FormControl>
                        
                        <FormControl isInvalid={!!formErrors.email}>
                          <FormLabel>Email Address</FormLabel>
                          <Input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => {
                              setProfileData(prev => ({ ...prev, email: e.target.value }));
                              validateForm('email', e.target.value);
                            }}
                            placeholder="Enter your email"
                          />
                          <FormErrorMessage>{formErrors.email}</FormErrorMessage>
                        </FormControl>
                        
                        <FormControl isInvalid={!!formErrors.phone}>
                          <FormLabel>Phone Number</FormLabel>
                          <Input
                            value={profileData.phone}
                            onChange={(e) => {
                              setProfileData(prev => ({ ...prev, phone: e.target.value }));
                              validateForm('phone', e.target.value);
                            }}
                            placeholder="Enter your phone number"
                          />
                          <FormErrorMessage>{formErrors.phone}</FormErrorMessage>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Location</FormLabel>
                          <Input
                            value={profileData.location}
                            onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Enter your location"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Department</FormLabel>
                          <Select
                            value={profileData.department}
                            onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                          >
                            <option value="Sales">Sales</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Support">Support</option>
                            <option value="Operations">Operations</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Role</FormLabel>
                          <Input
                            value={profileData.role}
                            onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
                            placeholder="Enter your role"
                          />
                        </FormControl>
                      </SimpleGrid>
                      
                      <FormControl>
                        <FormLabel>Bio</FormLabel>
                        <Textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Tell us about yourself"
                          rows={4}
                        />
                      </FormControl>
                      
                      <Button colorScheme="blue" onClick={() => handleProfileUpdate('personalInfo', profileData)} isLoading={loading}>
                        Save Changes
                      </Button>
                    </VStack>
                  </TabPanel>
                  
                  {/* Preferences Tab */}
                  <TabPanel p={6}>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md" color={textColor}>Preferences</Heading>
                      
                      {/* Notifications */}
                      <Box>
                        <Heading size="sm" color={textColor} mb={4}>Notifications</Heading>
                        <VStack spacing={4} align="stretch">
                          <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="500">Email Notifications</Text>
                              <Text fontSize="sm" color={secondaryTextColor}>Receive notifications via email</Text>
                            </VStack>
                            <Switch
                              isChecked={profileData.preferences.notifications.email}
                              onChange={(e) => handlePreferenceUpdate('notifications', 'email', e.target.checked)}
                            />
                          </Flex>
                          
                          <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="500">Push Notifications</Text>
                              <Text fontSize="sm" color={secondaryTextColor}>Receive push notifications</Text>
                            </VStack>
                            <Switch
                              isChecked={profileData.preferences.notifications.push}
                              onChange={(e) => handlePreferenceUpdate('notifications', 'push', e.target.checked)}
                            />
                          </Flex>
                          
                          <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="500">SMS Notifications</Text>
                              <Text fontSize="sm" color={secondaryTextColor}>Receive SMS notifications</Text>
                            </VStack>
                            <Switch
                              isChecked={profileData.preferences.notifications.sms}
                              onChange={(e) => handlePreferenceUpdate('notifications', 'sms', e.target.checked)}
                            />
                          </Flex>
                          
                          <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="500">Task Reminders</Text>
                              <Text fontSize="sm" color={secondaryTextColor}>Get reminded about upcoming tasks</Text>
                            </VStack>
                            <Switch
                              isChecked={profileData.preferences.notifications.taskReminders}
                              onChange={(e) => handlePreferenceUpdate('notifications', 'taskReminders', e.target.checked)}
                            />
                          </Flex>
                        </VStack>
                      </Box>
                      
                      <Divider />
                      
                      {/* Display Settings */}
                      <Box>
                        <Heading size="sm" color={textColor} mb={4}>Display Settings</Heading>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Theme</FormLabel>
                            <Select
                              value={profileData.preferences.display.theme}
                              onChange={(e) => handlePreferenceUpdate('display', 'theme', e.target.value)}
                            >
                              <option value="light">Light</option>
                              <option value="dark">Dark</option>
                              <option value="auto">Auto</option>
                            </Select>
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Language</FormLabel>
                            <Select
                              value={profileData.preferences.display.language}
                              onChange={(e) => handlePreferenceUpdate('display', 'language', e.target.value)}
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish</option>
                              <option value="fr">French</option>
                            </Select>
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Timezone</FormLabel>
                            <Select
                              value={profileData.preferences.display.timezone}
                              onChange={(e) => handlePreferenceUpdate('display', 'timezone', e.target.value)}
                            >
                              <option value="UTC">UTC</option>
                              <option value="EST">Eastern Time</option>
                              <option value="PST">Pacific Time</option>
                            </Select>
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>Date Format</FormLabel>
                            <Select
                              value={profileData.preferences.display.dateFormat}
                              onChange={(e) => handlePreferenceUpdate('display', 'dateFormat', e.target.value)}
                            >
                              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </Select>
                          </FormControl>
                        </SimpleGrid>
                      </Box>
                    </VStack>
                  </TabPanel>
                  
                  {/* Security Tab */}
                  <TabPanel p={6}>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md" color={textColor}>Security</Heading>
                      
                      <Card variant="outline" p={4}>
                        <VStack spacing={4} align="stretch">
                          <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="500">Password</Text>
                              <Text fontSize="sm" color={secondaryTextColor}>Last changed 30 days ago</Text>
                            </VStack>
                            <Button leftIcon={<FiKey />} onClick={onPasswordModalOpen}>
                              Change Password
                            </Button>
                          </HStack>
                          
                          <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="500">Two-Factor Authentication</Text>
                              <Text fontSize="sm" color={secondaryTextColor}>Add an extra layer of security</Text>
                            </VStack>
                            <Button variant="outline">
                              Enable 2FA
                            </Button>
                          </HStack>
                        </VStack>
                      </Card>
                    </VStack>
                  </TabPanel>
                  
                  {/* Permissions Tab */}
                  <TabPanel p={6}>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md" color={textColor}>Permissions</Heading>
                      
                      <Text fontSize="sm" color={secondaryTextColor}>
                        Your current permissions and access levels
                      </Text>
                      
                      <Wrap spacing={2}>
                        {profileData.permissions.map((permission, index) => (
                          <Tag key={index} colorScheme="blue" variant="subtle">
                            <TagLabel>{permission}</TagLabel>
                          </Tag>
                        ))}
                      </Wrap>
                      
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <AlertTitle fontSize="sm">Permission Changes</AlertTitle>
                          <AlertDescription fontSize="sm">
                            Contact your administrator to modify permissions.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Current Password</FormLabel>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
              </FormControl>
              
              <FormControl isInvalid={!!formErrors.newPassword}>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData(prev => ({ ...prev, newPassword: e.target.value }));
                    validateForm('newPassword', e.target.value);
                  }}
                  placeholder="Enter new password"
                />
                <FormErrorMessage>{formErrors.newPassword}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={!!formErrors.confirmPassword}>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
                    validateForm('confirmPassword', e.target.value);
                  }}
                  placeholder="Confirm new password"
                />
                <FormErrorMessage>{formErrors.confirmPassword}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPasswordModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handlePasswordChange} isLoading={loading}>
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Change Avatar Modal */}
      <Modal isOpen={isAvatarModalOpen} onClose={onAvatarModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Profile Photo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Center>
                <Avatar size="2xl" name={profileData.name} />
              </Center>
              
              <VStack spacing={2}>
                <Button leftIcon={<FiUpload />} colorScheme="blue">
                  Upload New Photo
                </Button>
                <Button variant="outline" size="sm">
                  Remove Current Photo
                </Button>
              </VStack>
              
              <Text fontSize="sm" color={secondaryTextColor} textAlign="center">
                Recommended: Square image, at least 200x200 pixels
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAvatarModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue">
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProfileSettings;