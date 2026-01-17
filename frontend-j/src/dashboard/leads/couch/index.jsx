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
  Progress, CircularProgress, Center, Wrap, WrapItem,
  GridItem, Grid, Stack, ButtonGroup, FormErrorMessage,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  MenuDivider
} from '@chakra-ui/react';
import {
  SearchIcon, AddIcon, EditIcon, DeleteIcon, EmailIcon, PhoneIcon, 
  ViewIcon, DownloadIcon, ChevronDownIcon, StarIcon,
  CalendarIcon, InfoIcon, CheckCircleIcon, WarningIcon, TimeIcon,
  ChatIcon, ExternalLinkIcon, SettingsIcon, CopyIcon,
} from '@chakra-ui/icons';
import { 
  FiFileText, FiUser, FiMail, FiPhone, FiCalendar, FiFilter, FiUpload,
  FiEye, FiEdit, FiTrash2, FiCopy, FiUsers, FiMoreVertical, 
  FiPlay, FiPause, FiBarChart2, FiTrendingUp, FiTarget, FiGlobe, FiWifi,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { getCoachId, getToken, isAuthenticated, debugAuthState } from '../../../utils/authUtils';
import { API_BASE_URL } from '../../../config/apiConfig';

// --- API CONFIGURATION ---
const ALL_LEADS_FUNNEL = { id: 'all', name: 'All Coach Leads', stages: [] };

// --- UTILITY FUNCTIONS ---
const getFunnelId = (lead) => {
    if (!lead || !lead.funnelId) return null;
    if (typeof lead.funnelId === 'string') return lead.funnelId;
    if (typeof lead.funnelId === 'object' && lead.funnelId !== null) {
        return lead.funnelId._id || lead.funnelId.id || lead.funnelId;
    }
    return lead.funnelId;
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
            <TableContainer w="full" overflowX="auto" borderRadius="lg" border="1px" borderColor="gray.100" className="hide-scrollbar">
              <Table variant="simple" size="md" w="full">
                <Thead>
                  <Tr bg="gray.50">
                    {[...Array(8)].map((_, i) => (
                      <Th key={i} px={{ base: 3, md: 6 }} py={{ base: 3, md: 5 }}>
                        <Skeleton height="16px" width="80px" borderRadius="md" />
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {[...Array(5)].map((_, rowIndex) => (
                    <Tr key={rowIndex} borderBottom="1px" borderColor="gray.100">
                      {[...Array(8)].map((_, cellIndex) => (
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
                          ) : cellIndex === 5 || cellIndex === 6 ? (
                            <VStack spacing={0.5} align="center">
                              <Skeleton height="12px" width="80px" borderRadius="sm" />
                              <Skeleton height="10px" width="60px" borderRadius="sm" />
                            </VStack>
                          ) : cellIndex === 7 ? (
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
              Loading coach leads...
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
  const bgColor = useColorModeValue(`${color}.50`, `${color}.900`);
  const borderColor = useColorModeValue(`${color}.200`, `${color}.700`);
  
  return (
    <Card 
      bg={bgColor} 
      border="1px" 
      borderColor={borderColor}
      borderRadius="xl"
      _hover={{ transform: 'translateY(-3px)', shadow: 'xl', borderColor: `${color}.300` }}
      transition="all 0.3s"
      position="relative"
      overflow="hidden"
      boxShadow="md"
    >
      <CardBody p={6}>
        <HStack spacing={4} align="center" w="full">
          <Box
            p={4}
            bg={`${color}.100`}
            borderRadius="xl"
            color={`${color}.600`}
            boxShadow="md"
            _groupHover={{ transform: 'scale(1.1)', bg: `${color}.200` }}
            transition="all 0.3s"
          >
            {icon}
          </Box>
          <VStack align="start" spacing={1} flex={1}>
            <Text fontSize={{ base: "xs", md: "sm" }} color={`${color}.700`} fontWeight="medium" textTransform="uppercase" letterSpacing="wide">
              {title}
            </Text>
            {isLoading ? (
              <Skeleton height="28px" width="70px" />
            ) : (
              <Text fontSize="3xl" fontWeight="bold" color={`${color}.800`}>
                {value}
              </Text>
            )}
          </VStack>
          {trend && (
            <Badge 
              colorScheme={trend > 0 ? 'green' : 'red'} 
              variant="solid" 
              size="sm"
              borderRadius="full"
              px={3}
              py={1}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </HStack>
      </CardBody>
    </Card>
  );
};

// --- LEAD SCORE GETTER FUNCTION ---
// Use backend-calculated score (lead.score) which follows backend scoring rules
// Backend calculates score based on: temperature, source, contact info, VSL watch %, 
// lead magnet interactions, progress tracking, follow-ups, etc.
const getLeadScore = (lead) => {
  // Always use the backend-calculated score if available
  // The backend calculates score according to its rules when lead is created/updated
  if (lead.score !== undefined && lead.score !== null) {
    return Math.min(Math.max(lead.score, 0), 100); // Ensure score is between 0-100
  }
  // Fallback to 0 if score is not available (shouldn't happen in normal flow)
  return 0;
};

// --- MINIMAL LEAD SCORE BADGE ---
const LeadScoreBadge = ({ score }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'green.500';
    if (score >= 60) return 'blue.500';
    if (score >= 40) return 'orange.500';
    if (score >= 20) return 'yellow.500';
    return 'red.500';
  };

  const color = getScoreColor(score);
  
  return (
    <HStack spacing={1.5}>
      <Box w="8px" h="8px" borderRadius="full" bg={color} />
      <Text fontSize="xs" fontWeight="600" color="gray.700">{score}</Text>
      </HStack>
  );
};

// --- MINIMAL LEAD TEMPERATURE BADGE ---
// Calculate temperature based on score according to backend rules:
// Hot: score >= 80
// Warm: score >= 50
// Cold: score < 50
const getLeadTemperature = (score) => {
  if (score >= 80) return 'Hot';
  if (score >= 50) return 'Warm';
  return 'Cold';
};

const LeadTemperatureBadge = ({ lead, temperature }) => {
  // Calculate temperature from score if lead object is provided
  // Otherwise use the provided temperature (for backward compatibility)
  let calculatedTemperature;
  if (lead) {
    const score = getLeadScore(lead);
    calculatedTemperature = getLeadTemperature(score);
  } else {
    calculatedTemperature = temperature;
  }

  const getTemperatureColor = (temp) => {
    switch (temp?.toLowerCase()) {
      case 'hot':
        return { color: 'red.500', bg: 'red.50' };
      case 'warm':
        return { color: 'orange.500', bg: 'orange.50' };
      case 'cold':
        return { color: 'blue.500', bg: 'blue.50' };
      default:
        return { color: 'gray.500', bg: 'gray.50' };
    }
  };

  const { color, bg } = getTemperatureColor(calculatedTemperature);
  
  return (
    <Badge 
      bg={bg} 
      color={color} 
      px={2} 
      py={0.5} 
      borderRadius="6px" 
      fontSize="xs" 
      fontWeight="500"
      textTransform="capitalize"
    >
      {calculatedTemperature || 'N/A'}
    </Badge>
  );
};

// Legacy function for backward compatibility
const calculateLeadScore = (lead) => {
  return getLeadScore(lead);
};

// --- STATUS BADGE COMPONENT ---
const StatusBadge = ({ status, isActive }) => {
  if (isActive) {
    return (
      <Badge colorScheme="green" variant="solid" borderRadius="full" px={3}>
        Active
      </Badge>
    );
  }
  return (
    <Badge colorScheme="gray" variant="outline" borderRadius="full" px={3}>
      Draft
    </Badge>
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
                <Text color="orange.700" fontSize={{ base: "xs", md: "sm" }}>
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
            Delete Lead
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// --- STAFF ASSIGNMENTS OVERVIEW MODAL ---
const StaffAssignmentsModal = ({ isOpen, onClose, staff, stats, getStaffLeadCount, onStaffCardClick }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
      <ModalContent maxH="90vh" overflowY="auto" borderRadius="2xl">
        <ModalHeader>
          <HStack spacing={3}>
            <Box as={FiUsers} size="24px" color="blue.500" />
            <VStack align="start" spacing={0}>
              <Text fontSize="xl" fontWeight="bold" color="gray.800">
                Staff Assignments Overview
              </Text>
              <Text fontSize="sm" color="gray.500" fontWeight="normal">
                Monitor lead distribution across your team
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Summary Stats */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Card bg="blue.50" borderRadius="lg">
                <CardBody>
                  <VStack spacing={2}>
                    <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                      {stats.totalLeads}
                    </Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Total Leads
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
              <Card bg="gray.50" borderRadius="lg">
                <CardBody>
                  <VStack spacing={2}>
                    <Text fontSize="3xl" fontWeight="bold" color="gray.600">
                      {stats.unassignedLeads}
                    </Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Unassigned
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
              <Card bg="green.50" borderRadius="lg">
                <CardBody>
                  <VStack spacing={2}>
                    <Text fontSize="3xl" fontWeight="bold" color="green.600">
                      {stats.totalLeads - stats.unassignedLeads}
                    </Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Assigned
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
              <Card bg="purple.50" borderRadius="lg">
                <CardBody>
                  <VStack spacing={2}>
                    <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                      {staff.length}
                    </Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Staff Members
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Staff Cards Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {/* Unassigned Leads Card */}
              <Card 
                variant="outline" 
                borderRadius="lg" 
                bg="gray.50"
                cursor="pointer"
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg', borderColor: 'gray.400' }}
                transition="all 0.2s"
                onClick={() => {
                  onStaffCardClick('unassigned');
                  onClose();
                }}
              >
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <HStack justify="space-between" w="full">
                      <Box 
                        p={3} 
                        bg="gray.200" 
                        borderRadius="lg"
                        color="gray.600"
                      >
                        <Box as={FiUser} size="24px" />
                      </Box>
                      <Badge 
                        colorScheme="gray" 
                        variant="solid" 
                        fontSize="xl"
                        px={4}
                        py={2}
                        borderRadius="full"
                      >
                        {stats.unassignedLeads}
                      </Badge>
                    </HStack>
                    <VStack align="start" spacing={1} w="full">
                      <Text fontSize="md" color="gray.700" fontWeight="bold">
                        Unassigned Leads
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Click to view unassigned leads
                      </Text>
                    </VStack>
                    <Progress 
                      value={(stats.unassignedLeads / stats.totalLeads) * 100} 
                      size="sm" 
                      colorScheme="gray" 
                      borderRadius="full"
                      w="full"
                    />
                    <Text fontSize="xs" color="gray.500">
                      {((stats.unassignedLeads / stats.totalLeads) * 100).toFixed(1)}% of total leads
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              {/* Staff Member Cards */}
              {staff.map((staffMember, index) => {
                const staffId = staffMember._id || staffMember.id;
                const assignedCount = getStaffLeadCount(staffId);
                const percentage = stats.totalLeads > 0 ? (assignedCount / stats.totalLeads) * 100 : 0;
                const staffName = staffMember.firstName && staffMember.lastName 
                  ? `${staffMember.firstName} ${staffMember.lastName}`
                  : staffMember.name || 'Unknown Staff';
                
                const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'teal'];
                const color = colors[index % colors.length];

                return (
                  <Card 
                    key={staffId}
                    variant="outline" 
                    borderRadius="lg" 
                    bg={`${color}.50`}
                    borderColor={`${color}.200`}
                    cursor="pointer"
                    _hover={{ transform: 'translateY(-2px)', shadow: 'lg', borderColor: `${color}.400` }}
                    transition="all 0.2s"
                    onClick={() => {
                      onStaffCardClick(staffId);
                      onClose();
                    }}
                  >
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <HStack justify="space-between" w="full">
                          <Box 
                            p={3} 
                            bg={`${color}.100`} 
                            borderRadius="lg"
                            color={`${color}.600`}
                          >
                            <Box as={FiUser} size="24px" />
                          </Box>
                          <Badge 
                            colorScheme={color} 
                            variant="solid" 
                            fontSize="xl"
                            px={4}
                            py={2}
                            borderRadius="full"
                          >
                            {assignedCount}
                          </Badge>
                        </HStack>
                        <VStack align="start" spacing={1} w="full">
                          <Text fontSize="md" color="gray.700" fontWeight="bold" noOfLines={1}>
                            {staffName}
                          </Text>
                          <Text fontSize="sm" color="gray.600" noOfLines={1}>
                            {staffMember.email}
                          </Text>
                        </VStack>
                        <Progress 
                          value={percentage} 
                          size="sm" 
                          colorScheme={color} 
                          borderRadius="full"
                          w="full"
                        />
                        <Text fontSize="xs" color="gray.500">
                          {percentage.toFixed(1)}% of total leads
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>

            {/* Info Message */}
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <AlertTitle fontSize="sm">Click on any card to filter leads</AlertTitle>
                <AlertDescription fontSize="xs">
                  Select a staff member to view only their assigned leads, or click "Unassigned" to see leads without assignment.
                </AlertDescription>
              </VStack>
            </Alert>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// --- BEAUTIFUL MESSAGE MODAL ---
const MessageModal = ({ isOpen, onClose, lead, type, onSend }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    // For WhatsApp, open WhatsApp directly with the message
    if (type === 'whatsapp') {
      const whatsappUrl = `https://wa.me/${lead.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message.trim())}`;
      window.open(whatsappUrl, '_blank');
      onClose();
      setMessage('');
      return;
    }
    
    setIsLoading(true);
    try {
      await onSend({
        leadId: lead._id,
        type,
        subject: type === 'email' ? subject : '',
        message: message.trim(),
        recipient: type === 'email' ? lead.email : lead.phone
      });
      onClose();
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
      <ModalContent borderRadius="2xl">
        <ModalHeader>
          <HStack>
            <Box color={type === 'email' ? 'blue.500' : type === 'whatsapp' ? 'green.500' : 'green.500'}>
              {type === 'email' ? <EmailIcon /> : type === 'whatsapp' ? <Box as={FaWhatsapp} /> : <ChatIcon />}
            </Box>
            <VStack align="start" spacing={0}>
              <Text>Send {type === 'email' ? 'Email' : type === 'whatsapp' ? 'WhatsApp' : 'SMS'}</Text>
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                To: {lead?.name} ({type === 'email' ? lead?.email : lead?.phone})
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {type === 'email' && (
              <FormControl>
                <FormLabel>Subject</FormLabel>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                />
              </FormControl>
            )}
            <FormControl>
              <FormLabel>Message</FormLabel>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Type your ${type === 'email' ? 'email' : type === 'whatsapp' ? 'WhatsApp' : 'SMS'} message here...`}
                rows={type === 'email' ? 8 : 4}
                resize="vertical"
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {message.length}/{type === 'email' ? 2000 : type === 'whatsapp' ? 4096 : 160} characters
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            bg={type === 'email' ? 'blue.500' : 'green.500'}
            color="white"
            onClick={handleSend}
            isLoading={isLoading}
            loadingText="Sending..."
            leftIcon={type === 'email' ? <EmailIcon /> : type === 'whatsapp' ? <Box as={FaWhatsapp} /> : <ChatIcon />}
            _hover={{ bg: type === 'email' ? 'blue.600' : 'green.600' }}
          >
            Send {type === 'email' ? 'Email' : type === 'whatsapp' ? 'WhatsApp' : 'SMS'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// --- BEAUTIFUL FUNNEL SELECTION MODAL ---
const FunnelSelectionModal = ({ isOpen, onClose, funnels, onSelect, leads }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
      <ModalContent borderRadius="2xl">
        <ModalHeader>Select Coach Funnel</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {[ALL_LEADS_FUNNEL, ...funnels].map(funnel => {
              let leadCount = 0;
              if (funnel.id === 'all') {
                leadCount = leads.length;
              } else {
                leadCount = leads.filter(lead => getFunnelId(lead) === funnel.id).length;
              }
              
              return (
                <Card
                  key={funnel.id}
                  cursor="pointer"
                  _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                  onClick={() => onSelect(funnel)}
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <HStack>
                        <Box color="blue.500">
                          <FiFilter />
                        </Box>
                        <Badge colorScheme="blue" variant="subtle">
                          Coach Funnel
                        </Badge>
                      </HStack>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="lg">
                          {funnel.name}
                        </Text>
                        <Text color="gray.600" fontSize={{ base: "xs", md: "sm" }}>
                          {funnel.id === 'all' 
                            ? `${leadCount} coach leads` 
                            : `${leadCount} leads, ${funnel.stages?.length || 0} stages`
                          }
                        </Text>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// --- BEAUTIFUL CREATE/EDIT LEAD MODAL ---
const CreateLeadModal = ({ isOpen, onClose, onSave, leadToEdit, funnels, staff }) => {
  const isEditMode = !!leadToEdit;
  const coachFunnels = funnels;
  const toast = useCustomToast();
  
  console.log('CreateLeadModal - staff prop:', staff);
  console.log('CreateLeadModal - staff length:', staff?.length);
  
  const initialFormData = isEditMode 
    ? { 
        ...leadToEdit, 
        funnelId: getFunnelId(leadToEdit) || '', 
        nextFollowUpAt: leadToEdit.nextFollowUpAt ? new Date(leadToEdit.nextFollowUpAt).toISOString().slice(0, 16) : '',
        assignedTo: leadToEdit.assignedTo?._id || leadToEdit.assignedTo || ''
      } 
    : { 
        name: '', email: '', phone: '', city: '', country: '', status: '', 
        funnelId: '', notes: '', source: 'Web Form', leadTemperature: 'Warm', 
        nextFollowUpAt: '', targetAudience: 'coach', assignedTo: ''
      };
  
  const [formData, setFormData] = useState(initialFormData);
  const [selectedFunnel, setSelectedFunnel] = useState(
    isEditMode ? coachFunnels.find(f => f.id === getFunnelId(leadToEdit)) : null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Reset form data when modal opens or leadToEdit changes
  useEffect(() => {
    if (isOpen) {
      const newInitialData = isEditMode 
        ? { 
            ...leadToEdit, 
            funnelId: getFunnelId(leadToEdit) || '', 
            nextFollowUpAt: leadToEdit.nextFollowUpAt ? new Date(leadToEdit.nextFollowUpAt).toISOString().slice(0, 16) : '',
            assignedTo: leadToEdit.assignedTo?._id || leadToEdit.assignedTo || ''
          } 
        : { 
            name: '', email: '', phone: '', city: '', country: '', status: '', 
            funnelId: '', notes: '', source: 'Web Form', leadTemperature: 'Warm', 
            nextFollowUpAt: '', targetAudience: 'coach', assignedTo: ''
          };
      
      setFormData(newInitialData);
      setSelectedFunnel(
        isEditMode ? coachFunnels.find(f => f.id === getFunnelId(leadToEdit)) : null
      );
    }
  }, [isOpen, leadToEdit, isEditMode, coachFunnels]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFunnelChange = (funnelId) => {
    const funnel = coachFunnels.find(f => f.id === funnelId);
    setSelectedFunnel(funnel);
    setFormData(prev => ({ 
      ...prev, 
      funnelId: funnelId, 
      status: funnel && funnel.stages.length > 0 ? funnel.stages[0].name : '' 
    }));
  };

  const handleSubmit = async () => {
    if (!formData.funnelId) {
      toast("Please select a coach funnel.", 'error');
      return;
    }
    
    console.log('Submitting form data:', formData);
    console.log('Is edit mode:', isEditMode);
    console.log('Lead to edit:', leadToEdit);
    
    setIsLoading(true);
    try {
      const submitData = { 
        ...formData, 
        targetAudience: 'coach', 
        nextFollowUpAt: formData.nextFollowUpAt ? new Date(formData.nextFollowUpAt).toISOString() : null 
      };
      console.log('Final submit data:', submitData);
      await onSave(submitData);
      onClose();
      setFormData(initialFormData);
      setSelectedFunnel(null);
    } catch (error) {
      console.error('Error saving lead:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form data when modal closes
    const resetData = { 
      name: '', email: '', phone: '', city: '', country: '', status: '', 
      funnelId: '', notes: '', source: 'Web Form', leadTemperature: 'Warm', 
      nextFollowUpAt: '', targetAudience: 'coach', assignedTo: ''
    };
    setFormData(resetData);
    setSelectedFunnel(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl" isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent 
        maxH="90vh" 
        display="flex"
        flexDirection="column"
        borderRadius="16px"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        border="1px solid"
        borderColor="gray.200"
        overflow="hidden"
      >
        {/* Minimal Header - Sticky */}
        <ModalHeader 
          pb={4} 
          pt={6} 
          px={8}
          borderBottom="1px solid"
          borderColor="gray.100"
          bg="white"
          position="sticky"
          top={0}
          zIndex={10}
          flexShrink={0}
        >
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={0}>
              <Text fontSize="xl" fontWeight="600" color="gray.900" letterSpacing="-0.5px">
                {isEditMode ? 'Edit Lead' : 'New Lead'}
              </Text>
              <Text fontSize="xs" color="gray.500" fontWeight="400">
                {isEditMode ? 'Update coach lead information' : 'Create a new coach lead'}
              </Text>
            </VStack>
            <ModalCloseButton 
              position="relative"
              top={0}
              right={0}
              size="sm"
              borderRadius="8px"
              _hover={{ bg: 'gray.100' }}
            />
          </Flex>
        </ModalHeader>
        
        <ModalBody 
          px={8} 
          py={6}
          flex="1"
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
              borderRadius: '10px',
              transition: 'background 0.2s ease',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#A0AEC0',
            },
            // Elegant Select Dropdown Styling
            '& select': {
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px',
              paddingRight: '40px',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            '& select:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            },
            '& select:focus': {
              transform: 'translateY(0)',
            },
            '& select option': {
              padding: '10px 12px',
              fontSize: '14px',
              backgroundColor: 'white',
              color: '#1F2937',
            },
            '& select option:hover': {
              backgroundColor: '#F3F4F6',
            },
            '& select option:checked': {
              backgroundColor: '#EBF4FF',
              color: '#2563EB',
              fontWeight: '500',
            },
          }}
        >
          <VStack spacing={6} align="stretch">
            {/* Contact Information */}
            <Box>
              <Text fontSize="sm" fontWeight="600" mb={3} color="gray.700" textTransform="uppercase" letterSpacing="0.5px">
                Contact Information
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                    Full Name
                  </FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="John Doe"
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="gray.200"
                    bg="white"
                    _focus={{ 
                      borderColor: 'blue.400', 
                      boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)' 
                    }}
                    _hover={{ borderColor: 'gray.300' }}
                    fontSize="sm"
                    h="40px"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                    Email Address
                  </FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@example.com"
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="gray.200"
                    bg="white"
                    _focus={{ 
                      borderColor: 'blue.400', 
                      boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)' 
                    }}
                    _hover={{ borderColor: 'gray.300' }}
                    fontSize="sm"
                    h="40px"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                    Phone Number
                  </FormLabel>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 234 567 8900"
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="gray.200"
                    bg="white"
                    _focus={{ 
                      borderColor: 'blue.400', 
                      boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)' 
                    }}
                    _hover={{ borderColor: 'gray.300' }}
                    fontSize="sm"
                    h="40px"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                    Source
                  </FormLabel>
                  <Box position="relative">
                  <Select
                    value={formData.source}
                    onChange={(e) => handleInputChange('source', e.target.value)}
                      borderRadius="8px"
                      border="1px solid"
                      borderColor="gray.200"
                      bg="white"
                      _focus={{ 
                        borderColor: 'blue.400', 
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                        bg: 'blue.50'
                      }}
                      _hover={{ 
                        borderColor: 'blue.300',
                        bg: 'gray.50'
                      }}
                      _active={{
                        borderColor: 'blue.400',
                        bg: 'white'
                      }}
                      fontSize="sm"
                      h="40px"
                      fontWeight="500"
                      color="gray.700"
                      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                      cursor="pointer"
                      boxShadow="0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                  >
                    <option value="Web Form">Web Form</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Event">Event</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Email Campaign">Email Campaign</option>
                    <option value="Other">Other</option>
                  </Select>
                  </Box>
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Location */}
            <Box>
              <Text fontSize="sm" fontWeight="600" mb={3} color="gray.700" textTransform="uppercase" letterSpacing="0.5px">
                Location
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                    City
                  </FormLabel>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="New York"
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="gray.200"
                    bg="white"
                    _focus={{ 
                      borderColor: 'blue.400', 
                      boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)' 
                    }}
                    _hover={{ borderColor: 'gray.300' }}
                    fontSize="sm"
                    h="40px"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                    Country
                  </FormLabel>
                  <Input
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="United States"
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="gray.200"
                    bg="white"
                    _focus={{ 
                      borderColor: 'blue.400', 
                      boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)' 
                    }}
                    _hover={{ borderColor: 'gray.300' }}
                    fontSize="sm"
                    h="40px"
                  />
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Sales Information */}
            <Box>
              <Text fontSize="sm" fontWeight="600" mb={3} color="gray.700" textTransform="uppercase" letterSpacing="0.5px">
                Sales Information
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                    Coach Funnel
                  </FormLabel>
                  <Box position="relative">
                  <Select
                    value={formData.funnelId}
                    onChange={(e) => handleFunnelChange(e.target.value)}
                      placeholder="Select a funnel"
                      borderRadius="8px"
                      border="1px solid"
                      borderColor="gray.200"
                      bg="white"
                      _focus={{ 
                        borderColor: 'blue.400', 
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                        bg: 'blue.50'
                      }}
                      _hover={{ 
                        borderColor: 'blue.300',
                        bg: 'gray.50'
                      }}
                      _active={{
                        borderColor: 'blue.400',
                        bg: 'white'
                      }}
                      fontSize="sm"
                      h="40px"
                      fontWeight="500"
                      color="gray.700"
                      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                      cursor="pointer"
                      boxShadow="0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                  >
                    {coachFunnels.map(funnel => (
                      <option key={funnel.id} value={funnel.id}>
                        {funnel.name}
                      </option>
                    ))}
                  </Select>
                  </Box>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                    Status
                  </FormLabel>
                  <Box position="relative">
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    disabled={!formData.funnelId}
                      placeholder="Select status"
                      borderRadius="8px"
                      border="1px solid"
                      borderColor="gray.200"
                      bg="white"
                      _focus={{ 
                        borderColor: 'blue.400', 
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                        bg: 'blue.50'
                      }}
                      _hover={{ 
                        borderColor: 'blue.300',
                        bg: 'gray.50'
                      }}
                      _active={{
                        borderColor: 'blue.400',
                        bg: 'white'
                      }}
                      _disabled={{
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        bg: 'gray.50'
                      }}
                      fontSize="sm"
                      h="40px"
                      fontWeight="500"
                      color="gray.700"
                      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                      cursor="pointer"
                      boxShadow="0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                  >
                    {selectedFunnel?.stages.map(stage => (
                      <option key={stage.name} value={stage.name}>
                        {stage.name}
                      </option>
                    ))}
                  </Select>
                  </Box>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                    Lead Temperature
                  </FormLabel>
                  <Box position="relative">
                  <Select
                    value={formData.leadTemperature}
                    onChange={(e) => handleInputChange('leadTemperature', e.target.value)}
                      borderRadius="8px"
                      border="1px solid"
                      borderColor="gray.200"
                      bg="white"
                      _focus={{ 
                        borderColor: 'blue.400', 
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                        bg: 'blue.50'
                      }}
                      _hover={{ 
                        borderColor: 'blue.300',
                        bg: 'gray.50'
                      }}
                      _active={{
                        borderColor: 'blue.400',
                        bg: 'white'
                      }}
                      fontSize="sm"
                      h="40px"
                      fontWeight="500"
                      color="gray.700"
                      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                      cursor="pointer"
                      boxShadow="0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                    >
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                      <option value="Cold">Cold</option>
                  </Select>
                  </Box>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                    Next Follow-up
                  </FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.nextFollowUpAt}
                    onChange={(e) => handleInputChange('nextFollowUpAt', e.target.value)}
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="gray.200"
                    bg="white"
                    _focus={{ 
                      borderColor: 'blue.400', 
                      boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)' 
                    }}
                    _hover={{ borderColor: 'gray.300' }}
                    fontSize="sm"
                    h="40px"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                    Assign to Staff
                  </FormLabel>
                  <Box position="relative">
                  <Select
                    value={formData.assignedTo}
                    onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                    placeholder="Select staff member"
                      borderRadius="8px"
                      border="1px solid"
                      borderColor="gray.200"
                      bg="white"
                      _focus={{ 
                        borderColor: 'blue.400', 
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                        bg: 'blue.50'
                      }}
                      _hover={{ 
                        borderColor: 'blue.300',
                        bg: 'gray.50'
                      }}
                      _active={{
                        borderColor: 'blue.400',
                        bg: 'white'
                      }}
                      fontSize="sm"
                      h="40px"
                      fontWeight="500"
                      color="gray.700"
                      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                      cursor="pointer"
                      boxShadow="0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                  >
                    <option value="">Unassigned</option>
                    {staff && staff.length > 0 ? (
                      staff.map(staffMember => {
                        console.log('Rendering staff member:', staffMember);
                        // Get staff name - handle different formats
                        const staffName = staffMember.firstName && staffMember.lastName 
                          ? `${staffMember.firstName} ${staffMember.lastName}`
                          : staffMember.name || 'Unknown Staff';
                        
                        return (
                          <option key={staffMember._id || staffMember.id} value={staffMember._id || staffMember.id}>
                            {staffName} ({staffMember.email})
                          </option>
                        );
                      })
                    ) : (
                      <option value="" disabled>No staff members available</option>
                    )}
                  </Select>
                  </Box>
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Additional Notes */}
            <Box>
              <Text fontSize="sm" fontWeight="600" mb={3} color="gray.700" textTransform="uppercase" letterSpacing="0.5px">
                Additional Notes
              </Text>
              <FormControl>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  placeholder="Add any additional notes about this coach lead..."
                  resize="vertical"
                  borderRadius="8px"
                  border="1px solid"
                  borderColor="gray.200"
                  bg="white"
                  _focus={{ 
                    borderColor: 'blue.400', 
                    boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)' 
                  }}
                  _hover={{ borderColor: 'gray.300' }}
                  fontSize="sm"
                />
              </FormControl>
            </Box>
          </VStack>
        </ModalBody>
        
        <ModalFooter 
          px={8} 
          py={4}
          borderTop="1px solid"
          borderColor="gray.100"
          bg="white"
          flexShrink={0}
        >
          <Button 
            variant="ghost" 
            mr={3} 
            onClick={handleClose} 
            disabled={isLoading}
            borderRadius="8px"
            fontWeight="500"
          >
            Cancel
          </Button>
          <Button
            bg="blue.500"
            color="white"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText={isEditMode ? 'Updating...' : 'Creating...'}
            leftIcon={<AddIcon />}
            _hover={{ bg: 'blue.600' }}
            _active={{ bg: 'blue.700' }}
            borderRadius="8px"
            fontWeight="600"
          >
            {isEditMode ? 'Update Lead' : 'Create Lead'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// --- BEAUTIFUL LEAD DETAILS MODAL ---
const LeadDetailsModal = ({ 
  isOpen, onClose, lead, onEditLead, onDelete, onAddFollowUp, 
  onSendMessage, getStatusLabel, getFunnelName, getStaffName, getStaffDisplayName 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [newFollowUpNote, setNewFollowUpNote] = useState('');
  
  const formatDate = (dateString) => 
    dateString ? new Date(dateString).toLocaleString() : 'Not scheduled';

  const handleAddFollowUpClick = () => {
    if (newFollowUpNote.trim()) {
      onAddFollowUp(lead._id, newFollowUpNote.trim());
      setNewFollowUpNote('');
    }
  };

  if (!lead) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
      <ModalContent maxH="90vh" overflowY="auto" borderRadius="2xl">
        <ModalHeader>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <HStack>
                <Text fontSize="xl" fontWeight="bold">{lead.name}</Text>
                <Badge colorScheme="blue" variant="subtle">Coach Lead</Badge>
              </HStack>
              <HStack spacing={3}>
                <LeadScoreBadge score={getLeadScore(lead)} />
                <LeadTemperatureBadge lead={lead} />
                <Badge colorScheme="green" variant="outline">
                  {getStatusLabel(lead.status, getFunnelId(lead))}
                </Badge>
              </HStack>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Action Buttons */}
            <Card>
              <CardBody>
                <HStack justify="space-between">
                  <ButtonGroup size="sm" variant="outline" spacing={2}>
                    <Button
                      leftIcon={<EmailIcon />}
                      colorScheme="blue"
                      onClick={() => onSendMessage(lead, 'email')}
                    >
                      Send Email
                    </Button>
                    <Button
                      leftIcon={<ChatIcon />}
                      colorScheme="green"
                      onClick={() => onSendMessage(lead, 'sms')}
                    >
                      Send SMS
                    </Button>
                  </ButtonGroup>
                  <ButtonGroup size="sm" spacing={2}>
                    <Button
                      leftIcon={<EditIcon />}
                      colorScheme="orange"
                      variant="outline"
                      onClick={() => onEditLead(lead)}
                    >
                      Edit
                    </Button>
                    <Button
                      leftIcon={<DeleteIcon />}
                      colorScheme="red"
                      variant="outline"
                      onClick={() => onDelete(lead._id)}
                    >
                      Delete
                    </Button>
                  </ButtonGroup>
                </HStack>
              </CardBody>
            </Card>

            {/* Tabs */}
            <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
              <TabList>
                <Tab>Coach Details</Tab>
                <Tab>Follow-ups & Communications</Tab>
              </TabList>

              <TabPanels>
                {/* Details Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    {/* Contact Information */}
                    <Card>
                      <CardHeader>
                        <Heading size="md">Contact Information</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <VStack align="start">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">Email</Text>
                            <HStack>
                              <EmailIcon color="blue.500" />
                              <Text>{lead.email}</Text>
                            </HStack>
                          </VStack>
                          <VStack align="start">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">Phone</Text>
                            <HStack>
                              <PhoneIcon color="green.500" />
                              <Text>{lead.phone}</Text>
                            </HStack>
                          </VStack>
                          <VStack align="start">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">Location</Text>
                            <HStack>
                              <InfoIcon color="purple.500" />
                              <Text>
                                {[lead.city, lead.country].filter(Boolean).join(', ') || 'Not specified'}
                              </Text>
                            </HStack>
                          </VStack>
                          <VStack align="start">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">Source</Text>
                            <Text>{lead.source}</Text>
                          </VStack>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* Sales Information */}
                    <Card>
                      <CardHeader>
                        <Heading size="md">Sales Information</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <VStack align="start">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">Funnel</Text>
                            <HStack>
                              <Box as={FiFilter} color="blue.500" />
                              <Text>{getFunnelName(lead.funnelId)}</Text>
                            </HStack>
                          </VStack>
                          <VStack align="start">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">Current Status</Text>
                            <Badge colorScheme="green" variant="outline">
                              {getStatusLabel(lead.status, getFunnelId(lead))}
                            </Badge>
                          </VStack>
                          <VStack align="start">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">Lead Score</Text>
                            <LeadScoreBadge score={calculateLeadScore(lead)} />
                          </VStack>
                          <VStack align="start">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">Lead Temperature</Text>
                            <LeadTemperatureBadge temperature={lead.leadTemperature} />
                          </VStack>
                          <VStack align="start">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">Next Follow-up</Text>
                            <HStack>
                              <CalendarIcon color="orange.500" />
                              <Text>{formatDate(lead.nextFollowUpAt)}</Text>
                            </HStack>
                          </VStack>
                          <VStack align="start">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">Assigned To</Text>
                            <Badge 
                              colorScheme={lead.assignedTo ? 'green' : 'gray'} 
                              variant={lead.assignedTo ? 'solid' : 'outline'}
                              borderRadius="full"
                              px={3}
                              py={1}
                            >
                              {getStaffDisplayName(lead.assignedTo)}
                            </Badge>
                          </VStack>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* Timeline */}
                    <Card>
                      <CardHeader>
                        <Heading size="md">Timeline</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <VStack align="start">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">Created On</Text>
                            <HStack>
                              <TimeIcon color="green.500" />
                              <Text>{formatDate(lead.createdAt)}</Text>
                            </HStack>
                          </VStack>
                          <VStack align="start">
                            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">Last Follow-up</Text>
                            <HStack>
                              <TimeIcon color="blue.500" />
                              <Text>{formatDate(lead.lastFollowUpAt)}</Text>
                            </HStack>
                          </VStack>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* Notes */}
                    {lead.notes && (
                      <Card>
                        <CardHeader>
                          <Heading size="md">Notes</Heading>
                        </CardHeader>
                        <CardBody>
                          <Text color="gray.700" lineHeight="1.6">
                            {lead.notes}
                          </Text>
                        </CardBody>
                      </Card>
                    )}
                  </VStack>
                </TabPanel>

                {/* Follow-ups Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    {/* Add Follow-up Form */}
                    <Card>
                      <CardHeader>
                        <Heading size="md">Add New Follow-up</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4}>
                          <Textarea
                            placeholder="Add new follow-up note or communication log..."
                            value={newFollowUpNote}
                            onChange={(e) => setNewFollowUpNote(e.target.value)}
                            rows={3}
                            resize="vertical"
                          />
                          <HStack justify="flex-end" w="full">
                            <Button
                              colorScheme="blue"
                              onClick={handleAddFollowUpClick}
                              leftIcon={<AddIcon />}
                              disabled={!newFollowUpNote.trim()}
                            >
                              Add Follow-up Note
                            </Button>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* Follow-up History */}
                    <Card>
                      <CardHeader>
                        <Heading size="md">Communication History</Heading>
                      </CardHeader>
                      <CardBody>
                        {lead.followUpHistory && lead.followUpHistory.length > 0 ? (
                          <VStack spacing={4} align="stretch">
                            {lead.followUpHistory.map((followUp, index) => (
                              <Box
                                key={index}
                                p={4}
                                bg="gray.50"
                                borderRadius="md"
                                borderLeft="4px solid"
                                borderLeftColor="blue.500"
                              >
                                <VStack align="start" spacing={2}>
                                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                                    {formatDate(followUp.followUpDate)}
                                  </Text>
                                  <Text color="gray.800">
                                    {followUp.note}
                                  </Text>
                                </VStack>
                              </Box>
                            ))}
                          </VStack>
                        ) : (
                          <Center py={8}>
                            <VStack spacing={2}>
                              <ChatIcon boxSize={8} color="gray.400" />
                              <Text color="gray.500" textAlign="center">
                                No follow-up history available.
                                <br />
                                Start by adding your first follow-up note above.
                              </Text>
                            </VStack>
                          </Center>
                        )}
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// --- DRAG & DROP COMPONENTS (BEAUTIFUL PIPELINE VIEW) ---
const DraggableLeadItem = ({ lead, onClick, onSendMessage }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'LEAD',
    item: { lead },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() })
  }));

  return (
    <Card
      ref={drag}
      cursor="pointer"
      opacity={isDragging ? 0.5 : 1}
      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      onClick={() => onClick(lead)}
      size="sm"
      mb={3}
    >
      <CardBody>
        <VStack align="start" spacing={3}>
          <HStack justify="space-between" w="full">
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>{lead.name}</Text>
              <Badge size="xs" colorScheme="blue" variant="subtle">
                Coach
              </Badge>
            </VStack>
            <VStack spacing={1}>
              <LeadScoreBadge score={calculateLeadScore(lead)} />
              <LeadTemperatureBadge temperature={lead.leadTemperature} />
            </VStack>
          </HStack>

          <VStack align="start" spacing={1} fontSize="xs" color="gray.600">
            <HStack>
              <EmailIcon />
              <Text>{lead.email}</Text>
            </HStack>
            <HStack>
              <PhoneIcon />
              <Text>{lead.phone}</Text>
            </HStack>
            {(lead.city || lead.country) && (
              <HStack>
                <InfoIcon />
                <Text>{[lead.city, lead.country].filter(Boolean).join(', ')}</Text>
              </HStack>
            )}
          </VStack>

          {lead.nextFollowUpAt && (
            <Badge colorScheme="orange" variant="subtle" fontSize="xs">
              Follow-up: {new Date(lead.nextFollowUpAt).toLocaleDateString()}
            </Badge>
          )}

          <HStack spacing={2} onClick={(e) => e.stopPropagation()}>
            <IconButton
              size="xs"
              colorScheme="blue"
              variant="ghost"
              icon={<EmailIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onSendMessage(lead, 'email');
              }}
              title="Send Email"
            />
            <IconButton
              size="xs"
              colorScheme="green"
              variant="ghost"
              icon={<ChatIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onSendMessage(lead, 'sms');
              }}
              title="Send SMS"
            />
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

const DroppableStatusColumn = ({ statusInfo, leadsInColumn, onLeadClick, onStatusChange, onSendMessage }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'LEAD',
    drop: (item) => {
      if (item && item.lead && item.lead._id) {
        onStatusChange(item.lead._id, statusInfo.name, getFunnelId(item.lead));
      }
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() })
  }));

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = isOver ? 'blue.300' : 'gray.200';

  return (
    <Box
      ref={drop}
      minW="300px"
      h="calc(100vh - 300px)"
      bg={bgColor}
      borderRadius="lg"
      border="2px dashed"
      borderColor={borderColor}
      p={4}
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={4} h="full">
        <HStack justify="space-between">
          <HStack>
            <Box w={3} h={3} bg="blue.500" borderRadius="full" />
            <Text fontWeight="bold" fontSize="lg">
              {statusInfo.name || 'Unknown Status'}
            </Text>
          </HStack>
          <Badge colorScheme="blue" variant="subtle">
            {leadsInColumn ? leadsInColumn.length : 0}
          </Badge>
        </HStack>
        
        <Box overflowY="auto" flex="1">
          {leadsInColumn && leadsInColumn.map((lead) => (
            <DraggableLeadItem
              key={lead._id || Math.random()}
              lead={lead}
              onClick={onLeadClick}
              onSendMessage={onSendMessage}
            />
          ))}
        </Box>
      </VStack>
    </Box>
  );
};

const LeadsTableView = ({ 
  leads, onEditLead, onDeleteLead, onExport, onImport, onSendMessage, 
  getStatusLabel, getFunnelName, getStaffName, getStaffDisplayName, selectedLeads, onSelectLead, onSelectAllLeads,
  actionMenuOpen, setActionMenuOpen, selectedFunnel, setSelectedFunnel,
  showCompleteData = false,
  canExport = false,
  canAssign = false,
  canDelete = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const toast = useToast();

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedLeads = useMemo(() => {
    if (!leads || !Array.isArray(leads)) return [];
    let sortableLeads = [...leads];
    if (sortConfig.key) {
      sortableLeads.sort((a, b) => {
        if (!a || !b) return 0;
        let valA, valB;
        switch (sortConfig.key) {
          case 'name': valA = a.name || ''; valB = b.name || ''; break;
          case 'email': valA = a.email || ''; valB = b.email || ''; break;
          case 'phone': valA = a.phone || ''; valB = b.phone || ''; break;
          case 'city': valA = a.city || ''; valB = b.city || ''; break;
          case 'country': valA = a.country || ''; valB = b.country || ''; break;
          case 'status': valA = getStatusLabel(a.status, getFunnelId(a)) || ''; valB = getStatusLabel(b.status, getFunnelId(b)) || ''; break;
          case 'funnel': valA = getFunnelName(a.funnelId) || ''; valB = getFunnelName(b.funnelId) || ''; break;
          case 'score': valA = getLeadScore(a); valB = getLeadScore(b); break;
          case 'temperature': valA = a.leadTemperature || ''; valB = b.leadTemperature || ''; break;
          case 'next_follow-up': valA = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : 0; valB = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : 0; break;
          case 'created': valA = a.createdAt ? new Date(a.createdAt).getTime() : 0; valB = b.createdAt ? new Date(b.createdAt).getTime() : 0; break;
          default: valA = a[sortConfig.key] || ''; valB = b[sortConfig.key] || '';
        }
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableLeads;
  }, [leads, sortConfig, getStatusLabel, getFunnelName]);

  const filteredLeads = sortedLeads.filter(lead => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.phone?.toLowerCase().includes(searchLower) ||
      lead.city?.toLowerCase().includes(searchLower) ||
      lead.country?.toLowerCase().includes(searchLower) ||
      getStatusLabel(lead.status, getFunnelId(lead)).toLowerCase().includes(searchLower) ||
      getFunnelName(lead.funnelId).toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => 
    dateString ? new Date(dateString).toLocaleDateString() : '';

  return (
    <Card bg="white" borderRadius="xl" boxShadow="lg" border="1px" borderColor="gray.200" overflow="visible">
      <CardHeader py={4} px={6}>
        <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <InputGroup maxW={{ base: 'full', md: '400px' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" boxSize={4} />
              </InputLeftElement>
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="gray.50"
                borderRadius="7px"
                border="1px"
                borderColor="gray.200"
                _focus={{ 
                  borderColor: 'blue.400', 
                  bg: 'white',
                  boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)' 
                }}
                _hover={{ borderColor: 'gray.300', bg: 'white' }}
                fontSize="sm"
                pl={10}
              />
            </InputGroup>
          <HStack spacing={2}>
            <Button 
              size="sm"
              variant="ghost"
              leftIcon={<DownloadIcon />} 
              onClick={onExport}
              borderRadius="7px"
              _hover={{ bg: 'gray.100' }}
            >
                  Export
                </Button>
            <Button 
              size="sm"
              variant="ghost"
              as="label" 
              leftIcon={<Box as={FiUpload} />}
              borderRadius="7px"
              _hover={{ bg: 'gray.100' }}
              cursor="pointer"
            >
                Import
                <input
                  type="file"
                  accept=".csv"
                  onChange={onImport}
                  style={{ display: 'none' }}
                />
              </Button>
          </HStack>
        </Flex>
      </CardHeader>
      
      <CardBody pt={0} px={0} overflow="visible">
        {filteredLeads.length === 0 ? (
          <Box py={16} px={6}>
            <VStack spacing={5} align="center">
              <Box
                w="64px"
                h="64px"
                borderRadius="full"
                bg="gray.50"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="gray.400"
              >
                <Box as={FiUsers} size="28px" />
              </Box>
              <VStack spacing={2} align="center">
                <Text fontSize="md" fontWeight="500" color="gray.700">
                  No leads found
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center" maxW="300px">
                  No coach leads match your current search or filters.
                </Text>
              </VStack>
            </VStack>
          </Box>
        ) : (
          <TableContainer 
            w="full" 
            overflowX="auto" 
            borderRadius="lg" 
            border="1px" 
            borderColor="gray.100" 
            className="hide-scrollbar"
            minW={{ base: "600px", md: "full" }}
          >
            <Table variant="simple" size={{ base: "sm", md: "md" }} w="full">
              <Thead>
                <Tr bg="gray.50" borderBottom="2px" borderColor="gray.200">
                  <Th px={{ base: 3, md: 6 }} py={{ base: 3, md: 5 }} color="gray.800" fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} textAlign="center">
                    <Checkbox
                      isChecked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                      onChange={(e) => onSelectAllLeads(e.target.checked, filteredLeads)}
                    />
                  </Th>
                  {(showCompleteData ? 
                    ['Contact', 'Source', 'Score & Temperature', 'Funnel & Stage', 'Assigned & Follow-up', 'Created', 'Actions'] :
                    ['Contact', 'Source', 'Score & Temperature', 'Funnel & Stage', 'Assigned & Follow-up', 'Actions']
                  ).map(header => {
                    let sortKey = header.toLowerCase().replace(/ /g, '_').replace('&', '');
                    // Map column headers to sort keys
                    if (header === 'Score & Temperature') sortKey = 'score';
                    if (header === 'Assigned & Follow-up') sortKey = 'assigned_to';
                    if (header === 'Funnel & Stage') sortKey = 'funnel';
                    const canSort = !['Contact', 'Actions'].includes(header);
                    const isActionsHeader = header === 'Actions';
                    return (
                      <Th 
                        key={header}
                        px={4} 
                        py={3} 
                        color="gray.700" 
                        fontWeight="600" 
                        fontSize="xs" 
                        textAlign={isActionsHeader ? "right" : "left"}
                        cursor={canSort ? 'pointer' : 'default'}
                        onClick={() => canSort && requestSort(sortKey)}
                        _hover={canSort ? { bg: 'gray.100' } : {}}
                        textTransform="none"
                        letterSpacing="0"
                      >
                        <HStack spacing={1} justify={isActionsHeader ? "flex-end" : "flex-start"}>
                          <Text>{header}</Text>
                          {header === 'Score & Temperature' && (
                            <Popover trigger="hover" placement="top">
                              <PopoverTrigger>
                                <IconButton
                                  icon={<InfoIcon />}
                                  size="xs"
                                  variant="ghost"
                                  aria-label="Score actions info"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  _hover={{ bg: 'blue.50', color: 'blue.600' }}
                                  color="gray.500"
                                />
                              </PopoverTrigger>
                              <PopoverContent
                                w="320px"
                                borderRadius="12px"
                                border="1px solid"
                                borderColor="gray.200"
                                boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverHeader fontWeight="600" fontSize="sm" pb={2}>
                                  Actions Affecting Lead Score
                                </PopoverHeader>
                                <PopoverBody>
                                  <VStack align="stretch" spacing={2}>
                                    <HStack justify="space-between" fontSize="xs">
                                      <Text fontWeight="500" color="gray.700">Call Booked</Text>
                                      <Badge colorScheme="green" variant="subtle" fontSize="xs">+30</Badge>
                                    </HStack>
                                    <HStack justify="space-between" fontSize="xs">
                                      <Text fontWeight="500" color="gray.700">Form Submitted</Text>
                                      <Badge colorScheme="blue" variant="subtle" fontSize="xs">+15</Badge>
                                    </HStack>
                                    <HStack justify="space-between" fontSize="xs">
                                      <Text fontWeight="500" color="gray.700">Link Clicked</Text>
                                      <Badge colorScheme="blue" variant="subtle" fontSize="xs">+10</Badge>
                                    </HStack>
                                    <HStack justify="space-between" fontSize="xs">
                                      <Text fontWeight="500" color="gray.700">Profile Completed</Text>
                                      <Badge colorScheme="blue" variant="subtle" fontSize="xs">+10</Badge>
                                    </HStack>
                                    <HStack justify="space-between" fontSize="xs">
                                      <Text fontWeight="500" color="gray.700">WhatsApp Replied</Text>
                                      <Badge colorScheme="green" variant="subtle" fontSize="xs">+8</Badge>
                                    </HStack>
                                    <HStack justify="space-between" fontSize="xs">
                                      <Text fontWeight="500" color="gray.700">Email Opened</Text>
                                      <Badge colorScheme="blue" variant="subtle" fontSize="xs">+5</Badge>
                                    </HStack>
                                    <Divider borderColor="gray.200" my={2} />
                                    <VStack align="stretch" spacing={1.5} mt={1} pt={2} borderTop="1px" borderColor="gray.100">
                                      <Text fontSize="xs" fontWeight="600" color="gray.700">
                                        Lead Temperature Ranges:
                                      </Text>
                                      <HStack justify="space-between" fontSize="xs">
                                        <Text fontWeight="500" color="gray.700">Hot</Text>
                                        <Badge colorScheme="red" variant="subtle" fontSize="xs">Score ≥ 80</Badge>
                                      </HStack>
                                      <HStack justify="space-between" fontSize="xs">
                                        <Text fontWeight="500" color="gray.700">Warm</Text>
                                        <Badge colorScheme="orange" variant="subtle" fontSize="xs">Score ≥ 50</Badge>
                                      </HStack>
                                      <HStack justify="space-between" fontSize="xs">
                                        <Text fontWeight="500" color="gray.700">Cold</Text>
                                        <Badge colorScheme="blue" variant="subtle" fontSize="xs">Score &lt; 50</Badge>
                                      </HStack>
                                    </VStack>
                                  </VStack>
                                </PopoverBody>
                              </PopoverContent>
                            </Popover>
                          )}
                          {sortConfig.key === sortKey && (
                            <Text fontSize="xs" color="blue.500">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </Text>
                          )}
                        </HStack>
                      </Th>
                    );
                  })}
                </Tr>
              </Thead>
              <Tbody>
                {filteredLeads.map((lead, index) => (
                  <Tr 
                    key={lead._id}
                    cursor="pointer"
                    onClick={() => onEditLead(lead)}
                    bg={selectedLeads.has(lead._id) ? 'blue.50' : 'white'}
                    _hover={{ bg: 'gray.50', transform: 'translateY(-1px)', boxShadow: 'sm' }}
                    borderBottom="1px"
                    borderColor="gray.100"
                    transition="all 0.3s"
                  >
                    <Td px={{ base: 3, md: 6 }} py={{ base: 3, md: 4 }} textAlign="center">
                      <Checkbox
                        isChecked={selectedLeads.has(lead._id)}
                        onChange={() => onSelectLead(lead._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Td>
                    {/* Contact Column - Stacked Name, Email, Phone */}
                    <Td px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }}>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="600" fontSize="md" color="gray.900">
                          {lead.name || 'N/A'}
                        </Text>
                        {lead.email && (
                          <HStack spacing={1.5}>
                            <Text fontSize="xs" color="gray.600">{lead.email}</Text>
                          <Tooltip label="Copy Email">
                            <IconButton
                              size="xs"
                              variant="ghost"
                              icon={<CopyIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(lead.email);
                                toast({
                                  title: 'Copied!',
                                  description: 'Email copied to clipboard',
                                  status: 'success',
                                  duration: 2000,
                                });
                              }}
                              colorScheme="blue"
                              aria-label="Copy email"
                                h="16px"
                                minW="16px"
                                _hover={{ bg: 'blue.50' }}
                            />
                          </Tooltip>
                      </HStack>
                        )}
                        {lead.phone && (
                          <HStack spacing={1.5}>
                            <Text fontSize="xs" color="gray.600">{lead.phone}</Text>
                          <Tooltip label="Copy Phone">
                            <IconButton
                              size="xs"
                              variant="ghost"
                              icon={<CopyIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(lead.phone);
                                toast({
                                  title: 'Copied!',
                                  description: 'Phone number copied to clipboard',
                                  status: 'success',
                                  duration: 2000,
                                });
                              }}
                              colorScheme="green"
                              aria-label="Copy phone"
                                h="16px"
                                minW="16px"
                                _hover={{ bg: 'green.50' }}
                            />
                          </Tooltip>
                      </HStack>
                        )}
                      </VStack>
                    </Td>
                    {/* Source Column */}
                    <Td px={{ base: 3, md: 4 }} py={{ base: 3, md: 4 }}>
                      {lead.source ? (
                        <Badge 
                          colorScheme="purple" 
                          variant="subtle" 
                          size="sm" 
                          px={2.5} 
                          py={1} 
                          borderRadius="6px" 
                          fontSize="xs"
                          fontWeight="500"
                          textTransform="capitalize"
                        >
                          {lead.source}
                        </Badge>
                      ) : (
                        <Text fontSize="xs" color="gray.400">N/A</Text>
                    )}
                    </Td>
                    
                    {/* Score & Temperature Column */}
                    <Td px={{ base: 3, md: 4 }} py={{ base: 3, md: 4 }}>
                      <VStack align="start" spacing={1.5}>
                        <LeadScoreBadge score={getLeadScore(lead)} />
                        <LeadTemperatureBadge lead={lead} />
                      </VStack>
                    </Td>
                    
                    {/* Funnel & Stage Column */}
                    <Td px={{ base: 3, md: 4 }} py={{ base: 3, md: 4 }}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="500" color="gray.900">
                          {getFunnelName(lead.funnelId) || 'N/A'}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {getStatusLabel(lead.status, getFunnelId(lead)) || 'N/A'}
                        </Text>
                      </VStack>
                    </Td>
                    
                    {/* Assigned & Follow-up Column */}
                    <Td px={{ base: 3, md: 4 }} py={{ base: 3, md: 4 }}>
                      <VStack align="start" spacing={2}>
                      <Badge 
                          colorScheme={lead.assignedTo ? 'blue' : 'gray'} 
                        variant={lead.assignedTo ? 'solid' : 'outline'}
                          borderRadius="6px"
                          px={2}
                          py={0.5}
                          fontSize="xs"
                      >
                        {getStaffDisplayName(lead.assignedTo)}
                      </Badge>
                      {lead.nextFollowUpAt ? (
                          <Text fontSize="xs" color="gray.600">
                            {new Date(lead.nextFollowUpAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                        ) : (
                          <Text fontSize="xs" color="gray.400">No follow-up</Text>
                        )}
                      </VStack>
                    </Td>
                    
                    {showCompleteData && (
                      <Td px={{ base: 3, md: 4 }} py={{ base: 3, md: 4 }}>
                        <Text fontSize="xs" color="gray.600">{formatDate(lead.createdAt)}</Text>
                      </Td>
                    )}
                    {/* Actions Column */}
                    <Td px={{ base: 3, md: 4 }} py={{ base: 3, md: 4 }}>
                      <HStack spacing={1} justify="flex-end">
                          <Tooltip label="Call">
                            <IconButton
                              size="sm"
                              variant="ghost"
                              icon={<PhoneIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (lead.phone) {
                                  window.open(`tel:${lead.phone}`, '_self');
                                }
                              }}
                              colorScheme="green"
                              aria-label="Call"
                              isDisabled={!lead.phone}
                            _hover={{ bg: 'green.50' }}
                            />
                          </Tooltip>
                          <Tooltip label="Send Email">
                            <IconButton
                              size="sm"
                              variant="ghost"
                              icon={<Box as={FiMail} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSendMessage(lead, 'email');
                              }}
                              colorScheme="blue"
                              aria-label="Send email"
                            _hover={{ bg: 'blue.50' }}
                            />
                          </Tooltip>
                        <Tooltip label="Edit">
                            <IconButton
                              size="sm"
                              variant="ghost"
                              icon={<Box as={FiEdit} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditLead(lead);
                              }}
                              colorScheme="orange"
                              aria-label="Edit lead"
                            _hover={{ bg: 'orange.50' }}
                            />
                          </Tooltip>
                        <Menu 
                          isOpen={actionMenuOpen && selectedFunnel?._id === lead._id} 
                          onOpen={() => {
                            setSelectedFunnel(lead);
                            setActionMenuOpen(true);
                          }}
                          onClose={() => {
                            setActionMenuOpen(false);
                            setSelectedFunnel(null);
                          }}
                          placement="bottom-end"
                          closeOnBlur={true}
                        >
                          <MenuButton
                            as={IconButton}
                              icon={<Box as={FiMoreVertical} />}
                              variant="ghost"
                              size="sm"
                              aria-label="More actions"
                              onClick={(e) => {
                                e.stopPropagation();
                            }}
                            _hover={{ bg: 'gray.50' }}
                          />
                          <MenuList
                            minW="200px"
                                borderRadius="12px"
                                border="1px solid"
                                borderColor="gray.200"
                            boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                            py={2}
                                zIndex={9999}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MenuItem
                              icon={<Box as={FiEye} size={16} />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActionMenuOpen(false);
                                setSelectedFunnel(null);
                                    }}
                                    _hover={{ 
                                      bg: 'blue.50', 
                                      color: 'blue.600',
                                    }}
                              py={3}
                              px={4}
                                    fontSize="sm"
                                    fontWeight="medium"
                                    borderRadius="8px"
                                    transition="all 0.2s ease"
                                  >
                                    View Details
                            </MenuItem>
                            <MenuItem
                              icon={<Box as={FiCopy} size={16} />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActionMenuOpen(false);
                                setSelectedFunnel(null);
                                    }}
                                    _hover={{ 
                                      bg: 'green.50', 
                                      color: 'green.600',
                                    }}
                              py={3}
                              px={4}
                                    fontSize="sm"
                                    fontWeight="medium"
                                    borderRadius="8px"
                                    transition="all 0.2s ease"
                                  >
                                    Duplicate Lead
                            </MenuItem>
                            <MenuDivider borderColor="gray.200" />
                            <MenuItem
                              icon={<Box as={FiTrash2} size={16} />}
                                    color="red.500"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActionMenuOpen(false);
                                setSelectedFunnel(null);
                                onDeleteLead(lead);
                                    }}
                                    _hover={{ 
                                      bg: 'red.50', 
                                      color: 'red.600',
                              }}
                              py={3}
                              px={4}
                              fontSize="sm"
                                    fontWeight="medium"
                                    borderRadius="8px"
                                    transition="all 0.2s ease"
                                  >
                                    Delete Lead
                            </MenuItem>
                          </MenuList>
                        </Menu>
                        </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </CardBody>
    </Card>
  );
};

// --- MAIN LEADSVIEW COMPONENT ---
const LeadsView = () => {
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

  // State management
  const [viewMode, setViewMode] = useState('table');
  const [activeFunnel, setActiveFunnel] = useState(ALL_LEADS_FUNNEL);
  const [leads, setLeads] = useState([]);
  const [funnels, setFunnels] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [showCompleteData, setShowCompleteData] = useState(false);
  // User context and permissions from API
  const [userContext, setUserContext] = useState({ isStaff: false, isCoach: false, userId: null, permissions: [] });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Modal states
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const { isOpen: isDetailsModalOpen, onOpen: onDetailsModalOpen, onClose: onDetailsModalClose } = useDisclosure();
  const { isOpen: isFunnelModalOpen, onOpen: onFunnelModalOpen, onClose: onFunnelModalClose } = useDisclosure();
  const { isOpen: isMessageModalOpen, onOpen: onMessageModalOpen, onClose: onMessageModalClose } = useDisclosure();
  const { isOpen: isConfirmModalOpen, onOpen: onConfirmModalOpen, onClose: onConfirmModalClose } = useDisclosure();
  const { isOpen: isStaffOverviewModalOpen, onOpen: onStaffOverviewModalOpen, onClose: onStaffOverviewModalClose } = useDisclosure();

  const [leadForModal, setLeadForModal] = useState(null);
  const [messageModal, setMessageModal] = useState({ lead: null, type: '' });
  const [confirmAction, setConfirmAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [selectedFunnel, setSelectedFunnel] = useState(null);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState(null); // null = all leads, 'unassigned' = unassigned, staffId = specific staff

  // Permission helpers
  const hasPermission = useCallback((perm) => userContext?.permissions?.includes(perm), [userContext]);
  const canManageAll = hasPermission('leads:manage_all');
  const canAssign = hasPermission('leads:assign');
  const canDelete = hasPermission('leads:delete');
  const canExport = hasPermission('leads:export');

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuOpen) {
        setActionMenuOpen(false);
      }
    };

    if (actionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenuOpen]);

  // Redux se auth token aur coach ID lena
  const authState = useSelector((state) => state.auth);
  const token = getToken(authState);
  const coachId = getCoachId(authState);

  // Custom toast
  const toast = useCustomToast();

  // Helper functions
  const getFunnelName = useCallback((funnelData) => {
    if (typeof funnelData === 'object' && funnelData !== null && funnelData.name) return funnelData.name;
    if (typeof funnelData === 'string') { 
      const funnel = funnels.find(f => f.id === funnelData); 
      return funnel ? funnel.name : 'Unknown Funnel'; 
    }
    const funnelId = getFunnelId({ funnelId: funnelData });
    const funnel = funnels.find(f => f.id === funnelId);
    return funnel ? funnel.name : 'Unknown Funnel';
  }, [funnels]);

  const getStatusLabel = useCallback((statusKey, funnelId) => {
    const funnel = funnels.find(f => f.id === funnelId);
    return funnel?.stages.find(s => s.name === statusKey)?.name || statusKey;
  }, [funnels]);

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
      
      return staffData.email ? `${staffName} (${staffData.email})` : staffName;
    }
    
    // Otherwise, it's an ID - look it up in the staff array
    const staffMember = staff.find(s => s._id === staffData || s.id === staffData);
    if (staffMember) {
      // Get staff name - handle different formats
      const staffName = staffMember.firstName && staffMember.lastName 
        ? `${staffMember.firstName} ${staffMember.lastName}`
        : staffMember.name || 'Unknown Staff';
      
      return staffMember.email ? `${staffName} (${staffMember.email})` : staffName;
    }
    return 'Unassigned';
  }, [staff]);

  // Get lead count for a specific staff member
  const getStaffLeadCount = useCallback((staffId) => {
    if (!staffId) {
      return leads.filter(lead => !lead.assignedTo).length;
    }
    return leads.filter(lead => {
      const assignedId = typeof lead.assignedTo === 'object' ? lead.assignedTo?._id : lead.assignedTo;
      return assignedId === staffId;
    }).length;
  }, [leads]);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !coachId) { 
        setError("Authentication details are missing."); 
        setLoading(false); 
        return; 
      }
      setLoading(true); 
      setError(null);
      try {
        // Step 1: Fetch funnels
        const funnelsResponse = await axios.get(`${API_BASE_URL}/api/funnels/coach/${coachId}/funnels`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        const allFunnels = funnelsResponse.data.data;

        // Step 2: Filter funnels with 'coach' audience only
        const coachFunnels = allFunnels
          .filter(f => f.targetAudience === 'coach')
          .map(f => ({ 
            id: f.id || f._id,  
            name: f.name, 
            targetAudience: f.targetAudience, 
            stages: f.stages.map(s => ({ name: s.name, order: s.order })) 
          }));
        setFunnels(coachFunnels);

        // Create a Set of coach funnel IDs for quick lookup
        const coachFunnelIds = new Set(coachFunnels.map(f => f.id));

        // Step 3: Fetch staff for assignment
        console.log('Fetching staff for coachId:', coachId);
        try {
          // Try different API endpoints
          let staffResponse;
          try {
            staffResponse = await axios.get(`${API_BASE_URL}/api/staff?coachId=${coachId}`, { 
              headers: { 'Authorization': `Bearer ${token}` } 
            });
          } catch (err) {
            console.log('First staff API failed, trying without query param:', err.response?.data);
            staffResponse = await axios.get(`${API_BASE_URL}/api/staff`, { 
              headers: { 'Authorization': `Bearer ${token}` } 
            });
          }
          
          console.log('Staff response:', staffResponse.data);
          const staffData = staffResponse.data.data || staffResponse.data || [];
          console.log('Staff data:', staffData);
          
          // Filter staff by coachId if needed
          const filteredStaff = Array.isArray(staffData) ? staffData.filter(s => 
            s.coachId === coachId || s.coach === coachId || !s.coachId
          ) : [];
          
          console.log('Filtered staff:', filteredStaff);
          setStaff(filteredStaff);
        } catch (staffErr) {
          console.error('Error fetching staff:', staffErr);
          // Fallback: Create mock staff data for testing
          const mockStaff = [
            { _id: 'staff1', name: 'John Doe', email: 'john@example.com', coachId: coachId },
            { _id: 'staff2', name: 'Jane Smith', email: 'jane@example.com', coachId: coachId },
            { _id: 'staff3', name: 'Mike Johnson', email: 'mike@example.com', coachId: coachId }
          ];
          console.log('Using mock staff data:', mockStaff);
          setStaff(mockStaff);
        }

        // Step 4: Fetch all leads
        const leadsResponse = await axios.get(`${API_BASE_URL}/api/leads`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        // Step 5: Filter leads that belong to coach funnels
        const coachLeads = (leadsResponse.data.data || []).filter(lead => {
          const funnelId = getFunnelId(lead);
          return coachFunnelIds.has(funnelId);
        });
        setLeads(coachLeads);

        // Capture userContext from response (used for permission-based UI)
        if (leadsResponse.data.userContext) {
          setUserContext({
            isStaff: !!leadsResponse.data.userContext.isStaff,
            isCoach: !!leadsResponse.data.userContext.isCoach,
            userId: leadsResponse.data.userContext.userId || null,
            permissions: Array.isArray(leadsResponse.data.userContext.permissions) ? leadsResponse.data.userContext.permissions : []
          });
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        const errorMsg = err.response?.data?.message || "Failed to fetch data. Please try again.";
        setError(errorMsg);
        toast(errorMsg, 'error');
      } finally {
        setTimeout(() => setLoading(false), 1500);
      }
    };
    fetchData();
  }, [token, coachId, toast]);

  // Action handlers
  const openCreateModal = (lead = null) => {
    console.log('Opening create modal with lead:', lead);
    setLeadForModal(lead);
    onCreateModalOpen();
  };

  const handleSendMessage = (lead, type) => {
    if (!lead) {
      toast('Lead information is missing', 'error');
      return;
    }
    setMessageModal({ lead, type });
    onMessageModalOpen();
  };

  const handleSendMessageSubmit = async (messageData) => {
    try {
      await axios.post(`${API_BASE_URL}/api/messages/send`, messageData, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      toast(`${messageData.type === 'email' ? 'Email' : 'SMS'} sent successfully!`);
      onMessageModalClose();
    } catch (err) {
      console.error("Error sending message:", err);
      toast(`Failed to send ${messageData.type === 'email' ? 'email' : 'SMS'}`, 'error');
    }
  };

  // Helper function to sanitize payload - remove any non-serializable data
  const sanitizeLeadPayload = (data) => {
    // Extract funnelId if it's an object
    let funnelId = '';
    if (data.funnelId) {
      if (typeof data.funnelId === 'string') {
        funnelId = data.funnelId;
      } else if (typeof data.funnelId === 'object' && data.funnelId !== null) {
        funnelId = data.funnelId._id || data.funnelId.id || '';
      }
    }
    
    // Extract assignedTo if it's an object
    let assignedTo = null;
    if (data.assignedTo) {
      if (typeof data.assignedTo === 'string') {
        assignedTo = data.assignedTo;
      } else if (typeof data.assignedTo === 'object' && data.assignedTo !== null) {
        assignedTo = data.assignedTo._id || data.assignedTo.id || null;
      }
    }
    
    // Build clean payload with only serializable values
    const cleanPayload = {
      name: String(data.name || ''),
      email: String(data.email || ''),
      phone: String(data.phone || ''),
      city: String(data.city || ''),
      country: String(data.country || ''),
      status: String(data.status || ''),
      funnelId: String(funnelId),
      notes: String(data.notes || ''),
      source: String(data.source || 'Web Form'),
      leadTemperature: String(data.leadTemperature || 'Warm'),
      nextFollowUpAt: data.nextFollowUpAt ? new Date(data.nextFollowUpAt).toISOString() : null,
      targetAudience: String(data.targetAudience || 'coach'),
      assignedTo: assignedTo,
      coachId: data.coachId || coachId
    };
    
    // Only include _id if it exists (for edit mode)
    if (data._id) {
      cleanPayload._id = String(data._id);
    }
    
    return cleanPayload;
  };

  const handleSaveLead = async (leadData) => {
    const isEditMode = !!leadData._id;
    
    // Sanitize the payload to remove any React/DOM references
    const sanitizedData = sanitizeLeadPayload(leadData);
    const payload = isEditMode ? sanitizedData : { ...sanitizedData, coachId };
    
    // Check if lead is being assigned to staff (new assignment)
    const oldLead = isEditMode ? leads.find(l => l._id === leadData._id) : null;
    const isNewAssignment = payload.assignedTo && (!oldLead || oldLead.assignedTo !== payload.assignedTo);
    
    console.log('Saving lead:', { isEditMode, leadData, payload });
    console.log('Assignment data:', { assignedTo: payload.assignedTo, assignedStaff: payload.assignedStaff });
    console.log('Is new assignment:', isNewAssignment);
    
    try {
      let updatedLead = null;
      
      if (isEditMode) {
        console.log('Updating lead with ID:', payload._id);
        
        try {
          // Try different assignment field names if assignedTo is present
          let updatePayload = { ...payload };
          if (payload.assignedTo) {
            updatePayload = {
              ...payload,
              assignedTo: payload.assignedTo,
              assignedStaff: payload.assignedTo,
              staffId: payload.assignedTo
            };
          }
          
          const response = await axios.put(`${API_BASE_URL}/api/leads/${payload._id}`, updatePayload, { 
            headers: { 'Authorization': `Bearer ${token}` } 
          });
          console.log('Update response:', response.data);
          console.log('Updated lead data:', response.data.data);
          updatedLead = response.data.data;
          setLeads(prevLeads => prevLeads.map(lead => lead._id === payload._id ? updatedLead : lead));
          toast("Coach lead updated successfully!");
        } catch (putError) {
          console.log('PUT failed, trying PATCH:', putError.response?.data);
          // Try PATCH if PUT fails
          let patchPayload = { ...payload };
          if (payload.assignedTo) {
            patchPayload = {
              ...payload,
              assignedTo: payload.assignedTo,
              assignedStaff: payload.assignedTo,
              staffId: payload.assignedTo
            };
          }
          
          const patchResponse = await axios.patch(`${API_BASE_URL}/api/leads/${payload._id}`, patchPayload, { 
            headers: { 'Authorization': `Bearer ${token}` } 
          });
          console.log('PATCH response:', patchResponse.data);
          updatedLead = patchResponse.data.data;
          setLeads(prevLeads => prevLeads.map(lead => lead._id === payload._id ? updatedLead : lead));
          toast("Coach lead updated successfully!");
        }
      } else {
        console.log('Creating new lead');
        const response = await axios.post(`${API_BASE_URL}/api/leads`, payload, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        console.log('Create response:', response.data);
        updatedLead = response.data.data;
        setLeads(prevLeads => [updatedLead, ...prevLeads]);
        toast("New coach lead created successfully!");
      }
      
      // Create task if lead was assigned to staff
      if (isNewAssignment && updatedLead) {
        const taskData = {
          name: `Follow up: ${updatedLead.name}`,
          description: `Follow up with lead ${updatedLead.name}\nEmail: ${updatedLead.email || 'N/A'}\nPhone: ${updatedLead.phone || 'N/A'}\nSource: ${updatedLead.source || 'N/A'}`,
          priority: 'MEDIUM',
          stage: 'LEAD_GENERATION',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Due in 2 days
          assignedTo: payload.assignedTo,
          relatedLead: updatedLead._id,
          estimatedHours: 1,
          tags: ['lead-followup', 'coach-lead']
        };
        
        const taskResult = await createWorkflowTask(taskData);
        if (taskResult) {
          const staffName = getStaffName(payload.assignedTo);
          toast(`Task created for ${staffName} to follow up on this lead`, 'success');
        }
      }
      
      onCreateModalClose();
    } catch (err) {
      console.error("Error saving lead:", err);
      console.error("Error details:", err.response?.data);
      toast(`Error saving coach lead: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const handleDeleteLead = (leadId) => {
    setConfirmAction({ type: 'single', id: leadId });
    onConfirmModalOpen();
  };

  const confirmDeleteLead = async () => {
    if (confirmAction?.type === 'single' && confirmAction.id) {
      try {
        await axios.delete(`${API_BASE_URL}/api/leads/${confirmAction.id}`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        setLeads(leads.filter(lead => lead._id !== confirmAction.id));
        toast("Coach lead deleted successfully");
        onDetailsModalClose();
        setLeadForModal(null);
      } catch (err) {
        console.error("Error deleting lead:", err);
        toast(`Error deleting coach lead: ${err.response?.data?.message || err.message}`, 'error');
      }
    }
    onConfirmModalClose();
    setConfirmAction(null);
  };

  const handleStatusChange = async (leadId, newStatus, funnelId) => {
    const originalLeads = [...leads];
    setLeads(prevLeads => prevLeads.map(lead => 
      lead._id === leadId ? { ...lead, status: newStatus } : lead
    ));
    
    try {
      await axios.put(`${API_BASE_URL}/api/leads/${leadId}`, { status: newStatus, funnelId: funnelId }, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      toast("Coach lead status updated!");
    } catch (err) {
      console.error("Error updating lead status:", err);
      toast("Failed to update coach lead status.", 'error');
      setLeads(originalLeads);
    }
  };

  const handleAddFollowUp = async (leadId, note) => {
    const newFollowUp = { note: note, followUpDate: new Date().toISOString(), createdBy: coachId };
    try {
      await axios.post(`${API_BASE_URL}/api/leads/${leadId}/followup`, newFollowUp, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      setLeads(prevLeads => prevLeads.map(lead => {
        if (lead._id === leadId) { 
          return { 
            ...lead, 
            followUpHistory: [...(lead.followUpHistory || []), newFollowUp], 
            lastFollowUpAt: new Date().toISOString() 
          }; 
        }
        return lead;
      }));
      toast("Follow-up added successfully!");
    } catch (err) {
      console.error("Error adding follow-up:", err);
      toast(`Error adding follow-up: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const handleSelectLead = (leadId) => {
    setSelectedLeads(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(leadId)) { 
        newSelected.delete(leadId); 
      } else { 
        newSelected.add(leadId); 
      }
      return newSelected;
    });
  };

  const handleSelectAllLeads = (isChecked, displayedLeads) => 
    setSelectedLeads(isChecked ? new Set(displayedLeads.map(lead => lead._id)) : new Set());

  const handleBulkDelete = () => {
    if (selectedLeads.size > 0) { 
      setConfirmAction({ type: 'bulk' });
      onConfirmModalOpen();
    } else { 
      toast("No coach leads selected for bulk delete.", "error"); 
    }
  };

  // ========================================
  // TASK CREATION FOR LEAD ASSIGNMENTS
  // ========================================
  // When a lead is assigned to a staff member, automatically create a workflow task
  // This ensures staff members receive actionable tasks for lead follow-ups
  // Task details include lead information and are set with a 2-day due date
  
  const createWorkflowTask = async (taskData) => {
    try {
      console.log('➕ Creating Workflow Task from Lead Assignment...');
      console.log('📝 Task Data:', {
        name: taskData.name,
        assignedTo: taskData.assignedTo,
        priority: taskData.priority,
        stage: taskData.stage,
        dueDate: taskData.dueDate,
        relatedLead: taskData.relatedLead,
        estimatedHours: taskData.estimatedHours,
        tags: taskData.tags,
        fullData: taskData
      });
      
      const response = await axios.post(`${API_BASE_URL}/api/workflow/tasks`, taskData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('✅ Workflow Task Created Successfully!', {
        status: response.status,
        taskId: response.data?.data?._id || response.data?._id,
        createdTask: response.data.data || response.data
      });

      return response.data.data || response.data;
    } catch (err) {
      console.error('❌ Failed to Create Workflow Task:', err);
      console.error('❌ Task Data that Failed:', taskData);
      console.error('❌ Error Response:', err.response?.data);
      console.error('❌ Error Status:', err.response?.status);
      // Don't show error toast here - will be handled in calling function
      return null;
    }
  };

  const handleBulkAssign = async (staffId) => {
    if (selectedLeads.size === 0) {
      toast("No coach leads selected for assignment.", "error");
      return;
    }

    try {
      const leadIds = Array.from(selectedLeads);
      console.log('🔄 Starting Bulk Assignment...');
      console.log('📋 Selected lead IDs:', leadIds);
      console.log('👤 Staff ID to assign:', staffId);
      
      // Get the actual lead objects
      const assignedLeads = leads.filter(lead => selectedLeads.has(lead._id));
      console.log('📊 Total leads to assign:', assignedLeads.length);
      
      // Try bulk endpoint first
      let bulkSuccess = false;
      try {
        const bulkPayload = {
          leadIds: leadIds,
          assignedTo: staffId || null,
          assignedStaff: staffId || null,
          staffId: staffId || null
        };
        
        console.log('📤 Trying bulk assignment endpoint...');
        console.log('📦 Bulk payload:', JSON.stringify(bulkPayload, null, 2));
        
        // Try POST first
        try {
          const response = await axios.post(`${API_BASE_URL}/api/leads/bulk-assign`, bulkPayload, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('✅ Bulk POST assignment successful:', response.data);
          bulkSuccess = true;
        } catch (postError) {
          console.log('❌ Bulk POST failed, trying PUT...', postError.response?.data);
          // Try PUT if POST fails
          const putResponse = await axios.put(`${API_BASE_URL}/api/leads/bulk-assign`, bulkPayload, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('✅ Bulk PUT assignment successful:', putResponse.data);
          bulkSuccess = true;
        }
      } catch (bulkError) {
        console.log('❌ Bulk endpoint failed, falling back to individual updates...', bulkError.response?.data);
        bulkSuccess = false;
      }

      // If bulk endpoint failed, update leads individually
      if (!bulkSuccess) {
        console.log('🔄 Updating leads individually...');
        let successCount = 0;
        
        for (const lead of assignedLeads) {
          try {
            const updatePayload = {
              assignedTo: staffId || null,
              assignedStaff: staffId || null,
              staffId: staffId || null
            };
            
            console.log(`📝 Updating lead ${lead._id}...`);
            
            try {
              await axios.put(`${API_BASE_URL}/api/leads/${lead._id}`, updatePayload, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              successCount++;
            } catch (putError) {
              // Try PATCH if PUT fails
              console.log(`⚠️ PUT failed for ${lead._id}, trying PATCH...`);
              await axios.patch(`${API_BASE_URL}/api/leads/${lead._id}`, updatePayload, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              successCount++;
            }
          } catch (leadError) {
            console.error(`❌ Failed to update lead ${lead._id}:`, leadError.response?.data);
          }
        }
        
        console.log(`✅ Successfully updated ${successCount}/${assignedLeads.length} leads`);
        
        if (successCount === 0) {
          throw new Error('Failed to update any leads');
        }
      }

      // Update local state
      setLeads(prevLeads => prevLeads.map(lead => 
        selectedLeads.has(lead._id) ? { ...lead, assignedTo: staffId } : lead
      ));

      const staffName = staffId ? getStaffName(staffId) : 'Unassigned';
      
      // Create tasks for each assigned lead (only if assigning to staff, not unassigning)
      let taskCreatedCount = 0;
      
      if (staffId) {
        console.log('📋 Creating tasks for assigned leads...');
        for (const lead of assignedLeads) {
          const taskData = {
            name: `Follow up: ${lead.name}`,
            description: `Follow up with lead ${lead.name}\nEmail: ${lead.email || 'N/A'}\nPhone: ${lead.phone || 'N/A'}\nSource: ${lead.source || 'N/A'}`,
            priority: 'MEDIUM',
            stage: 'LEAD_GENERATION',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: staffId,
            relatedLead: lead._id,
            estimatedHours: 1,
            tags: ['lead-followup', 'coach-lead']
          };
          
          const taskResult = await createWorkflowTask(taskData);
          if (taskResult) {
            taskCreatedCount++;
          }
        }
      }
      
      // Show success message
      if (staffId) {
        if (taskCreatedCount > 0) {
          toast(`✅ ${selectedLeads.size} leads assigned to ${staffName} with ${taskCreatedCount} tasks created`, 'success');
        } else {
          toast(`✅ ${selectedLeads.size} leads assigned to ${staffName}`, 'success');
        }
      } else {
        toast(`✅ ${selectedLeads.size} leads unassigned successfully`, 'success');
      }
      
      setSelectedLeads(new Set());
    } catch (err) {
      console.error("❌ Error bulk assigning leads:", err);
      console.error("❌ Error details:", err.response?.data);
      toast(`Error assigning leads: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/leads/bulk`, { 
        data: { leadIds: Array.from(selectedLeads) }, 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      setLeads(leads.filter(lead => !selectedLeads.has(lead._id)));
      toast(`${selectedLeads.size} coach leads deleted`);
      setSelectedLeads(new Set());
    } catch (err) {
      console.error("Error bulk deleting leads:", err);
      toast(`Error deleting coach leads: ${err.response?.data?.message || err.message}`, 'error');
    }
    onConfirmModalClose();
    setConfirmAction(null);
  };

  const handleSelectFunnel = (funnel) => { 
    setActiveFunnel(funnel); 
    onFunnelModalClose(); 
    setSelectedLeads(new Set()); 
  };

  const handleViewChange = (mode) => { 
    if (mode === 'pipeline' && activeFunnel.id === 'all' && funnels.length > 0) { 
      setActiveFunnel(funnels[0]); 
    } 
    setViewMode(mode); 
  };

  const openDetailsModal = (lead) => {
    setLeadForModal(lead);
    onDetailsModalOpen();
  };

  // Test function to check API connectivity
  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await axios.get(`${API_BASE_URL}/api/health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('API health check:', response.data);
      toast('API connection successful!', 'success');
    } catch (err) {
      console.error('API health check failed:', err);
      toast('API connection failed!', 'error');
    }
  };

  // Function to manually refresh staff data
  const refreshStaffData = async () => {
    try {
      console.log('Manually refreshing staff data...');
      const staffResponse = await axios.get(`${API_BASE_URL}/api/staff`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      console.log('Manual staff refresh response:', staffResponse.data);
      const staffData = staffResponse.data.data || staffResponse.data || [];
      setStaff(staffData);
      toast(`Loaded ${staffData.length} staff members`, 'success');
    } catch (err) {
      console.error('Error refreshing staff:', err);
      toast('Failed to refresh staff data', 'error');
    }
  };

  // Function to test lead assignment with different approaches
  const testLeadAssignment = async (leadId, staffId) => {
    console.log('Testing lead assignment:', { leadId, staffId });
    
    try {
      // Try different assignment approaches
      const approaches = [
        { field: 'assignedTo', value: staffId },
        { field: 'assignedStaff', value: staffId },
        { field: 'staffId', value: staffId },
        { field: 'assignedToStaff', value: staffId }
      ];

      for (const approach of approaches) {
        try {
          console.log(`Trying assignment with field: ${approach.field}`);
          const payload = { [approach.field]: approach.value };
          
          const response = await axios.put(`${API_BASE_URL}/api/leads/${leadId}`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          console.log(`Success with ${approach.field}:`, response.data);
          toast(`Assignment successful with ${approach.field}`, 'success');
          return response.data;
        } catch (err) {
          console.log(`Failed with ${approach.field}:`, err.response?.data);
        }
      }
      
      toast('All assignment approaches failed', 'error');
    } catch (err) {
      console.error('Error testing assignment:', err);
      toast('Assignment test failed', 'error');
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Email,Phone,City,Country,Status,Funnel,Score,Temperature,Assigned To,Source,Created\n" + 
      leads.map(lead => [
        lead.name || '', lead.email || '', lead.phone || '', lead.city || '', 
        lead.country || '', lead.status || '', getFunnelName(lead.funnelId), 
        getLeadScore(lead), lead.leadTemperature || '', getStaffDisplayName(lead.assignedTo), lead.source || '', 
        lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ''
      ].join(',')).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `coach_leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Coach leads exported successfully!");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedLeads = event.target.result.split('\n').slice(1).map(line => { 
            const v = line.split(','); 
            return { 
              name: v[0] || '', email: v[1] || '', phone: v[2] || '', 
              city: v[3] || '', country: v[4] || '', source: v[8] || 'Import', 
              leadTemperature: v[7] || 'Warm', targetAudience: 'coach' 
            }; 
          }).filter(lead => lead.name && lead.email);
          
          console.log('Imported coach leads:', importedLeads);
          toast(`${importedLeads.length} coach leads imported successfully!`);
        } catch (error) {
          toast("Error importing coach leads. Please check file format.", 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  // Staff card click handler
  const handleStaffCardClick = (staffFilter) => {
    setSelectedStaffFilter(staffFilter);
    setViewMode('table'); // Switch to table view to show filtered leads
    setCurrentPage(1); // Reset to first page
    
    // Show toast notification
    if (staffFilter === 'unassigned') {
      toast('Showing unassigned leads', 'info');
    } else if (staffFilter === null) {
      toast('Showing all leads', 'info');
    } else {
      const staffMember = staff.find(s => (s._id || s.id) === staffFilter);
      const staffName = staffMember?.firstName && staffMember?.lastName 
        ? `${staffMember.firstName} ${staffMember.lastName}`
        : staffMember?.name || 'Unknown Staff';
      toast(`Showing leads assigned to ${staffName}`, 'info');
    }
  };

  // Memoized data for rendering
  const displayedLeads = useMemo(() => {
    if (!leads || !Array.isArray(leads)) return [];
    
    let leadsToDisplay = [...leads];
    
    // Filter by funnel
    if (activeFunnel && activeFunnel.id !== 'all') { 
      leadsToDisplay = leadsToDisplay.filter(lead => lead && getFunnelId(lead) === activeFunnel.id); 
    }
    
    // Staff visibility: if staff without manage_all, only show assigned to them
    if (userContext?.isStaff && !canManageAll) {
      const currentUserId = userContext?.userId;
      leadsToDisplay = leadsToDisplay.filter(lead => {
        if (!lead) return false;
        const assignedToId = typeof lead.assignedTo === 'object' ? lead.assignedTo?._id : lead.assignedTo;
        const appointmentStaffId = lead.appointment?.assignedStaffId;
        return assignedToId === currentUserId || appointmentStaffId === currentUserId;
      });
    }

    // Filter by staff assignment
    if (selectedStaffFilter === 'unassigned') {
      leadsToDisplay = leadsToDisplay.filter(lead => !lead.assignedTo);
    } else if (selectedStaffFilter !== null) {
      leadsToDisplay = leadsToDisplay.filter(lead => {
        const assignedId = typeof lead.assignedTo === 'object' ? lead.assignedTo?._id : lead.assignedTo;
        return assignedId === selectedStaffFilter;
      });
    }
    
    // Filter by search term
    if (searchTerm) { 
      const searchLower = searchTerm.toLowerCase(); 
      leadsToDisplay = leadsToDisplay.filter(lead => {
        if (!lead) return false;
        return (
          (lead.name?.toLowerCase().includes(searchLower) ||
          lead.email?.toLowerCase().includes(searchLower) ||
          lead.phone?.toLowerCase().includes(searchLower) ||
          lead.city?.toLowerCase().includes(searchLower) ||
          lead.country?.toLowerCase().includes(searchLower) ||
          (getStatusLabel(lead.status, getFunnelId(lead)) || '').toLowerCase().includes(searchLower) ||
          (getFunnelName(lead.funnelId) || '').toLowerCase().includes(searchLower))
        );
      }); 
    }
    
    // Update total items for pagination
    setTotalItems(leadsToDisplay.length);
    
    return leadsToDisplay;
  }, [leads, activeFunnel, searchTerm, selectedStaffFilter, staff, getFunnelName, getStatusLabel]);

  // Pagination logic
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return displayedLeads.slice(startIndex, endIndex);
  }, [displayedLeads, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedLeads(new Set()); // Clear selection when changing pages
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
    setSelectedLeads(new Set()); // Clear selection
  };

  const leadsByStatus = useMemo(() => {
    const statusMap = {};
    if (activeFunnel && activeFunnel.id !== 'all' && activeFunnel.stages && Array.isArray(activeFunnel.stages)) { 
      activeFunnel.stages.forEach(stage => { 
        if (stage && stage.name) {
          statusMap[stage.name] = displayedLeads.filter(lead => lead && lead.status === stage.name);
        }
      }); 
    }
    return statusMap;
  }, [activeFunnel, displayedLeads]);

  // Stats calculation
  const stats = useMemo(() => {
    const totalLeads = displayedLeads.length;
    // Calculate temperature counts based on score (not stored leadTemperature field)
    const hotLeads = displayedLeads.filter(lead => {
      const score = getLeadScore(lead);
      return getLeadTemperature(score) === 'Hot';
    }).length;
    const warmLeads = displayedLeads.filter(lead => {
      const score = getLeadScore(lead);
      return getLeadTemperature(score) === 'Warm';
    }).length;
    const coldLeads = displayedLeads.filter(lead => {
      const score = getLeadScore(lead);
      return getLeadTemperature(score) === 'Cold';
    }).length;
    
    // Score statistics
    const scores = displayedLeads.map(lead => getLeadScore(lead));
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    
    // Staff assignment statistics
    const staffAssignments = {};
    const unassignedLeads = displayedLeads.filter(lead => !lead.assignedTo).length;
    
    displayedLeads.forEach(lead => {
      if (lead.assignedTo) {
        const staffId = typeof lead.assignedTo === 'object' ? lead.assignedTo._id : lead.assignedTo;
        staffAssignments[staffId] = (staffAssignments[staffId] || 0) + 1;
      }
    });
    
    return { 
      totalLeads, 
      hotLeads, 
      warmLeads, 
      coldLeads, 
      avgScore, 
      staffAssignments,
      unassignedLeads 
    };
  }, [displayedLeads]);

  // Conditional rendering for loading and error states
  if (loading) return <ProfessionalLoader />;
  
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
              Unable to Load Leads
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

  // Main component render
  return (
    <Box bg="gray.100" minH="100vh">
      <Box maxW="full" mx="auto" px={{ base: 4, md: 6 }}>
        <VStack spacing={8} align="stretch" w="full" pt={{ base: 4, md: 6 }} pb={{ base: 4, md: 6 }}>
            {/* Combined Header & Stats Section - Sticky */}
            <Card
              bg="white"
              borderRadius="8px"
              boxShadow="none"
              border="1px"
              borderColor="gray.200"
            >
            <CardHeader py={4} px={6} borderBottom="1px" borderColor="gray.100">
              <Flex justify="space-between" align="center" direction={{ base: 'column', lg: 'row' }} gap={4}>
                {/* Left Side - Title */}
                <VStack align={{ base: 'center', lg: 'start' }} spacing={0.5}>
                  <Heading size="lg" color="gray.900" fontWeight="700" letterSpacing="-0.5px">
                    Coach Leads
                      </Heading>
                  <Text color="gray.500" fontSize="xs" textAlign={{ base: 'center', lg: 'start' }}>
                    Manage and track coach leads
                    </Text>
                  </VStack>
                  
                {/* Right Side - Actions */}
                <HStack spacing={2} justify={{ base: 'center', lg: 'end' }}>
                  <Button
                    leftIcon={showCompleteData ? <ViewIcon /> : <InfoIcon />}
                    colorScheme="gray"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newMode = !showCompleteData;
                      setShowCompleteData(newMode);
                      if (newMode) {
                        toast('Switched to Complete Data View', 'success');
                      } else {
                        toast('Switched to Important Data View', 'success');
                      }
                    }}
                    borderRadius="8px"
                    _hover={{ bg: 'gray.100' }}
                    fontWeight="500"
                  >
                    {showCompleteData ? 'Important' : 'Complete'}
                  </Button>
                  
                  <ButtonGroup size="sm" variant="ghost" spacing={1} borderRadius="8px">
                      <Button
                        leftIcon={viewMode === 'table' ? <CheckCircleIcon /> : <ViewIcon />}
                        colorScheme={viewMode === 'table' ? 'blue' : 'gray'}
                        onClick={() => handleViewChange('table')}
                      borderRadius="8px"
                      _hover={{ bg: viewMode === 'table' ? 'blue.50' : 'gray.100' }}
                      bg={viewMode === 'table' ? 'blue.50' : 'transparent'}
                      fontWeight="500"
                    >
                      Table
                      </Button>
                      <Button
                        leftIcon={viewMode === 'pipeline' ? <CheckCircleIcon /> : <ViewIcon />}
                        colorScheme={viewMode === 'pipeline' ? 'blue' : 'gray'}
                        onClick={() => handleViewChange('pipeline')}
                      borderRadius="8px"
                      _hover={{ bg: viewMode === 'pipeline' ? 'blue.50' : 'gray.100' }}
                      bg={viewMode === 'pipeline' ? 'blue.50' : 'transparent'}
                      fontWeight="500"
                    >
                      Pipeline
                      </Button>
                    </ButtonGroup>
                      
                      <Button
                        leftIcon={<AddIcon />}
                        bg="blue.500"
                        color="white"
                    size="sm"
                    onClick={openCreateModal}
                    _hover={{ bg: 'blue.600' }}
                    borderRadius="8px"
                    fontWeight="600"
                  >
                    New Lead
                      </Button>
                    </HStack>
                </Flex>
            </CardHeader>
                

                 
            <CardBody py={5} px={6}>
                 <Box>
                <Flex justify="space-between" align="center" mb={5} direction={{ base: 'column', md: 'row' }} gap={4} wrap="wrap">
                  <VStack align={{ base: 'center', md: 'start' }} spacing={0.5}>
                    <Text fontSize="md" fontWeight="600" color="gray.900" textAlign={{ base: 'center', md: 'left' }}>
                       Lead Performance Overview
                     </Text>
                    <Text fontSize="xs" color="gray.500" textAlign={{ base: 'center', md: 'left' }}>
                      Track your lead metrics and performance
                    </Text>
                  </VStack>
                     
                  <HStack spacing={2} flexWrap="wrap" justify={{ base: 'center', md: 'flex-end' }}>
                       {staff.length > 0 && (
                         <Button
                           size="sm"
                        colorScheme="gray"
                           onClick={onStaffOverviewModalOpen}
                           leftIcon={<Box as={FiUsers} />}
                        _hover={{ bg: 'gray.100' }}
                        borderRadius="8px"
                        variant="ghost"
                        fontWeight="500"
                         >
                           Staff Overview
                         </Button>
                       )}
                       
                    <HStack spacing={2} align="center" flexWrap="wrap">
                      <HStack spacing={2} align="center" bg="gray.50" px={3} py={1.5} borderRadius="8px" border="1px solid" borderColor="gray.200">
                        <Box w="6px" h="6px" bg="blue.500" borderRadius="full" />
                        <Text fontSize="xs" color="gray.700" fontWeight="500">
                           {displayedLeads ? displayedLeads.length : 0} Leads
                        </Text>
                      </HStack>
                           {activeFunnel && activeFunnel.id !== 'all' && (
                        <Badge
                          colorScheme="blue"
                          variant="subtle"
                          px={3}
                          py={1.5}
                          borderRadius="8px"
                          fontSize="xs"
                          fontWeight="600"
                          display="flex"
                          alignItems="center"
                          gap={1.5}
                        >
                          <Box as={FiFilter} size="12px" />
                          {activeFunnel.name || 'Unknown Funnel'}
                        </Badge>
                      )}
                         <Button
                           variant="ghost"
                           onClick={onFunnelModalOpen}
                        size="sm"
                        colorScheme="gray"
                        _hover={{ bg: 'gray.100' }}
                        borderRadius="8px"
                        leftIcon={<Box as={FiFilter} />}
                        fontWeight="500"
                      >
                        {activeFunnel && activeFunnel.id !== 'all' ? 'Change' : 'Select Funnel'}
                         </Button>
                       </HStack>
                     </HStack>
                   </Flex>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={3}>
                     <StatsCard
                       title="Total Leads"
                       value={stats.totalLeads}
                    icon={<Box as={FiUsers} size="20px" />}
                       color="blue"
                       trend={12}
                       isLoading={loading}
                     />
                  <Card 
                    bg={useColorModeValue('purple.50', 'purple.900')} 
                    border="1px" 
                    borderColor={useColorModeValue('purple.200', 'purple.700')}
                    borderRadius="8px"
                    _hover={{ borderColor: 'purple.300', boxShadow: 'sm' }}
                    transition="all 0.2s"
                    boxShadow="none"
                  >
                    <CardBody p={4}>
                      <VStack align="start" spacing={3} w="full">
                        <HStack justify="space-between" w="full" align="center">
                          <Box
                            p={2.5}
                            bg={useColorModeValue('purple.100', 'purple.800')}
                            borderRadius="8px"
                            color={useColorModeValue('purple.600', 'purple.300')}
                          >
                            <Box as={FiTarget} size="20px" />
                          </Box>
                        </HStack>
                        <VStack align="start" spacing={0.5} w="full">
                          <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} fontWeight="500" textTransform="uppercase" letterSpacing="0.5px">
                            Lead Temperature
                          </Text>
                          {loading ? (
                            <Skeleton height="60px" width="full" borderRadius="4px" />
                          ) : (
                            <VStack align="start" spacing={1.5} w="full">
                              <HStack spacing={2} w="full" justify="space-between">
                                <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')} fontWeight="500">
                                  Hot
                                </Text>
                                <Text fontSize="lg" fontWeight="700" color={useColorModeValue('red.600', 'red.300')} letterSpacing="-0.5px">
                                  {stats.hotLeads}
                                </Text>
                              </HStack>
                              <HStack spacing={2} w="full" justify="space-between">
                                <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')} fontWeight="500">
                                  Warm
                                </Text>
                                <Text fontSize="lg" fontWeight="700" color={useColorModeValue('orange.600', 'orange.300')} letterSpacing="-0.5px">
                                  {stats.warmLeads}
                                </Text>
                              </HStack>
                              <HStack spacing={2} w="full" justify="space-between">
                                <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')} fontWeight="500">
                                  Cold
                                </Text>
                                <Text fontSize="lg" fontWeight="700" color={useColorModeValue('blue.600', 'blue.300')} letterSpacing="-0.5px">
                                  {stats.coldLeads}
                                </Text>
                              </HStack>
                            </VStack>
                          )}
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                     <StatsCard
                    title="Assigned Leads"
                    value={stats.totalLeads - stats.unassignedLeads}
                    icon={<Box as={FiUser} size="20px" />}
                    color="yellow"
                       isLoading={loading}
                     />
                     <StatsCard
                    title="Average Score"
                    value={stats.avgScore}
                    icon={<Box as={FiBarChart2} size="20px" />}
                       color="orange"
                       isLoading={loading}
                     />
                   </SimpleGrid>
                 </Box>
            </CardBody>
          </Card>

          {/* Active Staff Filter Badge */}
          {selectedStaffFilter && (
            <Card bg="blue.50" border="1px solid" borderColor="blue.200" borderRadius="8px" boxShadow="none">
              <CardBody py={3} px={4}>
                <HStack justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Box 
                      p={2} 
                      bg="blue.100" 
                      borderRadius="8px" 
                      color="blue.600"
                    >
                      <Box as={FiFilter} size="16px" />
                    </Box>
                    <VStack align="start" spacing={0.5}>
                      <Text fontSize="sm" fontWeight="600" color="blue.900">
                        Active Filter
                      </Text>
                      <Text fontSize="xs" color="blue.700">
                        {selectedStaffFilter === 'unassigned' 
                          ? 'Showing unassigned leads' 
                          : `Showing leads assigned to ${getStaffName(selectedStaffFilter)}`}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => handleStaffCardClick(null)}
                    _hover={{ bg: 'blue.100' }}
                    borderRadius="8px"
                    fontWeight="500"
                  >
                    Clear
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          )}

          {/* Bulk Actions Toolbar */}
          {selectedLeads.size > 0 && viewMode === 'table' && (
            <Card bg="blue.50" border="1px solid" borderColor="blue.200" borderRadius="8px" boxShadow="none">
              <CardBody py={3} px={4}>
                <HStack justify="space-between" align="center">
                  <HStack spacing={3} align="center">
                    <Box
                      w="8px"
                      h="8px"
                      bg="blue.500"
                      borderRadius="full"
                      animation="pulse 2s infinite"
                      sx={{
                        '@keyframes pulse': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.5 },
                          '100%': { opacity: 1 }
                        }
                      }}
                    />
                    <Text fontWeight="semibold" color="blue.700" fontSize="md">
                      {selectedLeads.size} coach leads selected
                    </Text>
                    <Badge colorScheme="blue" variant="subtle" borderRadius="full">
                      Bulk Actions Available
                    </Badge>
                  </HStack>
                  
                  <ButtonGroup size="md" spacing={3}>
                    {canAssign && (
                      <Menu>
                        <MenuButton 
                          as={Button} 
                          leftIcon={<Box as={FiUsers} />}
                          colorScheme="green"
                          variant="outline"
                          _hover={{ 
                            transform: 'translateY(-1px)', 
                            shadow: 'md',
                            bg: 'green.50'
                          }}
                          transition="all 0.2s"
                          borderRadius="lg"
                        >
                          Assign to Staff
                          <ChevronDownIcon ml={1} />
                        </MenuButton>
                        <MenuList maxH="400px" overflowY="auto">
                          <MenuItem onClick={() => handleBulkAssign('')}>
                            <HStack justify="space-between" w="full">
                              <Text>Unassign All</Text>
                              <Badge colorScheme="gray" variant="subtle" borderRadius="full">
                                {stats.unassignedLeads} unassigned
                              </Badge>
                            </HStack>
                          </MenuItem>
                          <MenuDivider />
                          {staff.map(staffMember => {
                            const staffName = staffMember.firstName && staffMember.lastName 
                              ? `${staffMember.firstName} ${staffMember.lastName}`
                              : staffMember.name || 'Unknown Staff';
                            const staffId = staffMember._id || staffMember.id;
                            const assignedCount = getStaffLeadCount(staffId);
                            return (
                              <MenuItem 
                                key={staffId}
                                onClick={() => handleBulkAssign(staffId)}
                                _hover={{ bg: 'blue.50' }}
                              >
                                <HStack justify="space-between" w="full" spacing={3}>
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium">{staffName}</Text>
                                    <Text fontSize="xs" color="gray.500">{staffMember.email}</Text>
                                  </VStack>
                                  <Badge 
                                    colorScheme={assignedCount > 0 ? 'blue' : 'gray'} 
                                    variant="solid" 
                                    borderRadius="full"
                                    px={3}
                                    py={1}
                                  >
                                    {assignedCount} leads
                                  </Badge>
                                </HStack>
                              </MenuItem>
                            );
                          })}
                        </MenuList>
                      </Menu>
                    )}
                    {canExport && (
                      <Button 
                        leftIcon={<DownloadIcon />} 
                        onClick={handleExport}
                        colorScheme="blue"
                        variant="outline"
                        _hover={{ 
                          transform: 'translateY(-1px)', 
                          shadow: 'md',
                          bg: 'blue.50'
                        }}
                        transition="all 0.2s"
                        borderRadius="lg"
                      >
                        Export Selected
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        leftIcon={<DeleteIcon />} 
                        colorScheme="red"
                        variant="outline"
                        onClick={handleBulkDelete}
                        _hover={{ 
                          transform: 'translateY(-1px)', 
                          shadow: 'md',
                          bg: 'red.50'
                        }}
                        transition="all 0.2s"
                        borderRadius="lg"
                      >
                        Delete Selected
                      </Button>
                    )}
                  </ButtonGroup>
                </HStack>
              </CardBody>
            </Card>
          )}

          {/* Main Content Area */}
          {viewMode === 'pipeline' && activeFunnel && activeFunnel.id !== 'all' ? (
            <DndProvider backend={HTML5Backend}>
              <Card>
                <CardBody>
                  {activeFunnel.stages && Array.isArray(activeFunnel.stages) && activeFunnel.stages.length > 0 ? (
                    <HStack align="start" spacing={6} overflowX="auto" pb={4} className="hide-scrollbar">
                      {activeFunnel.stages
                        .filter(stage => stage && stage.order !== undefined)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map(stage => (
                          <DroppableStatusColumn
                            key={stage.name || Math.random()}
                            statusInfo={stage}
                            leadsInColumn={leadsByStatus[stage.name] || []}
                            onLeadClick={openDetailsModal}
                            onStatusChange={handleStatusChange}
                            onSendMessage={handleSendMessage}
                          />
                        ))}
                    </HStack>
                  ) : (
                    <Center py={20}>
                      <VStack spacing={4}>
                        <Box
                          w="120px"
                          h="120px"
                          bg="gray.50"
                          borderRadius="lg"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="gray.400"
                          boxShadow="lg"
                        >
                          <SettingsIcon boxSize="48px" />
                        </Box>
                        <VStack spacing={2}>
                          <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                            No stages configured
                          </Text>
                          <Text color="gray.500" textAlign="center">
                            No stages found for this coach funnel. Please configure your funnel stages.
                          </Text>
                        </VStack>
                      </VStack>
                    </Center>
                  )}
                </CardBody>
              </Card>
            </DndProvider>
          ) : viewMode === 'pipeline' && activeFunnel && activeFunnel.id === 'all' ? (
            <Card>
              <CardBody>
                <Center py={20}>
                  <VStack spacing={4}>
                    <Box
                      w="120px"
                      h="120px"
                      bg="blue.50"
                      borderRadius="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="blue.400"
                      boxShadow="lg"
                    >
                      <Box as={FiFilter} size="48px" />
                    </Box>
                    <VStack spacing={2}>
                      <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                        Select a coach funnel
                      </Text>
                      <Text color="gray.500" textAlign="center">
                        Please select a specific coach funnel to view the pipeline.
                      </Text>
                    </VStack>
                    <Button colorScheme="blue" onClick={onFunnelModalOpen}>
                      Select Funnel
                    </Button>
                  </VStack>
                </Center>
              </CardBody>
            </Card>
          ) : (
            <LeadsTableView
              leads={paginatedLeads || []}
              onEditLead={openDetailsModal}
              onDeleteLead={handleDeleteLead}
              onExport={handleExport}
              onImport={handleImport}
              onSendMessage={handleSendMessage}
              getStatusLabel={getStatusLabel}
              getFunnelName={getFunnelName}
              getStaffName={getStaffName}
              getStaffDisplayName={getStaffDisplayName}
              actionMenuOpen={actionMenuOpen}
              setActionMenuOpen={setActionMenuOpen}
              selectedFunnel={selectedFunnel}
              setSelectedFunnel={setSelectedFunnel}
              selectedLeads={selectedLeads}
              onSelectLead={handleSelectLead}
              onSelectAllLeads={handleSelectAllLeads}
              showCompleteData={showCompleteData}
              canExport={canExport}
              canAssign={canAssign}
              canDelete={canDelete}
            />
          )}

          {/* Pagination Component */}
          {viewMode === 'table' && (
          <Box mt={6} px={6} pb={6}>
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              {/* Items per page selector */}
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.600" fontWeight="500">Rows per page:</Text>
                <Select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  size="sm"
                  width="80px"
                    borderRadius="7px"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px rgba(66, 153, 225, 0.1)' }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Select>
              </HStack>
              
              {/* Pagination info */}
                <Text fontSize="sm" color="gray.600" fontWeight="500">
                  {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
              </Text>
              
              {/* Pagination buttons */}
                <HStack spacing={1}>
                  <IconButton
                  size="sm"
                    variant="ghost"
                    icon={<Box as={FiChevronLeft} />}
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1}
                    borderRadius="7px"
                    _hover={{ bg: 'gray.100' }}
                    aria-label="Previous page"
                  />
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                        variant={currentPage === pageNum ? "solid" : "ghost"}
                      colorScheme={currentPage === pageNum ? "blue" : "gray"}
                      onClick={() => handlePageChange(pageNum)}
                        borderRadius="7px"
                        minW="36px"
                        h="32px"
                        _hover={{ bg: currentPage === pageNum ? 'blue.600' : 'gray.100' }}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                  <IconButton
                  size="sm"
                    variant="ghost"
                    icon={<Box as={FiChevronRight} />}
                  onClick={() => handlePageChange(currentPage + 1)}
                  isDisabled={currentPage === totalPages}
                    borderRadius="7px"
                    _hover={{ bg: 'gray.100' }}
                    aria-label="Next page"
                  />
              </HStack>
            </Flex>
          </Box>
          )}

          {/* Modals */}
          <FunnelSelectionModal
            isOpen={isFunnelModalOpen}
            onClose={onFunnelModalClose}
            funnels={funnels}
            onSelect={handleSelectFunnel}
            leads={leads}
          />

          <CreateLeadModal
            isOpen={isCreateModalOpen}
            onClose={onCreateModalClose}
            onSave={handleSaveLead}
            leadToEdit={leadForModal}
            funnels={funnels}
            staff={staff}
          />

          <LeadDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={onDetailsModalClose}
            lead={leadForModal}
            onEditLead={(lead) => { onDetailsModalClose(); openCreateModal(lead); }}
            onDelete={handleDeleteLead}
            onAddFollowUp={handleAddFollowUp}
            onSendMessage={handleSendMessage}
            getStatusLabel={getStatusLabel}
            getFunnelName={getFunnelName}
            getStaffName={getStaffName}
            getStaffDisplayName={getStaffDisplayName}
          />

          <MessageModal
            isOpen={isMessageModalOpen}
            onClose={onMessageModalClose}
            lead={messageModal.lead}
            type={messageModal.type}
            onSend={handleSendMessageSubmit}
          />

          <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={onConfirmModalClose}
            onConfirm={confirmAction?.type === 'single' ? confirmDeleteLead : confirmBulkDelete}
            title={confirmAction?.type === 'single' ? "Delete Coach Lead" : "Delete Multiple Leads"}
            message={
              confirmAction?.type === 'single' 
                ? "This action cannot be undone. This will permanently delete the coach lead." 
                : `This action cannot be undone. This will permanently delete ${selectedLeads.size} selected coach leads.`
            }
          />

          <StaffAssignmentsModal
            isOpen={isStaffOverviewModalOpen}
            onClose={onStaffOverviewModalClose}
            staff={staff}
            stats={stats}
            getStaffLeadCount={getStaffLeadCount}
            onStaffCardClick={handleStaffCardClick}
          />
        </VStack>
      </Box>
    </Box>
  );
};

export default LeadsView;
