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
  FiCalendar as FiCalendarIcon,
  FiClock as FiClockIcon,
  FiMapPin as FiMapPinIcon,
  FiUsers as FiUsersIcon,
  FiUserPlus,
  FiUserMinus,
  FiArrowRight,
} from 'react-icons/fi';
import { appointmentAPI } from '../../services/staffDashboardAPI';

const AppointmentManagement = ({ data }) => {
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
  const [appointments, setAppointments] = useState(data?.appointments || []);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [activeTab, setActiveTab] = useState(0);
  
  // Modal states
  const { isOpen: isAppointmentModalOpen, onOpen: onAppointmentModalOpen, onClose: onAppointmentModalClose } = useDisclosure();
  const { isOpen: isAssignModalOpen, onOpen: onAssignModalOpen, onClose: onAssignModalClose } = useDisclosure();
  const { isOpen: isTransferModalOpen, onOpen: onTransferModalOpen, onClose: onTransferModalClose } = useDisclosure();
  
  // Form states
  const [assignmentData, setAssignmentData] = useState({
    appointmentId: '',
    staffId: ''
  });
  const [transferData, setTransferData] = useState({
    appointmentId: '',
    fromStaffId: '',
    toStaffId: '',
    reason: '',
    notes: ''
  });
  
  const toast = useToast();

  // Filter appointments based on current filters
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const matchesStatus = !filters.status || appointment.status === filters.status;
      const matchesSearch = !filters.search || 
        appointment.leadId?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        appointment.leadId?.email.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [appointments, filters]);

  // Get appointments by status
  const appointmentsByStatus = useMemo(() => {
    return {
      scheduled: filteredAppointments.filter(apt => apt.status === 'scheduled'),
      completed: filteredAppointments.filter(apt => apt.status === 'completed'),
      cancelled: filteredAppointments.filter(apt => apt.status === 'cancelled'),
      rescheduled: filteredAppointments.filter(apt => apt.status === 'rescheduled')
    };
  }, [filteredAppointments]);

  // Handle appointment actions
  const handleAssignAppointment = async () => {
    if (!assignmentData.appointmentId || !assignmentData.staffId) return;
    
    try {
      setLoading(true);
      const result = await appointmentAPI.assignAppointment(assignmentData);
      if (result.success) {
        toast({
          title: 'Appointment Assigned',
          description: 'Appointment has been assigned successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setAppointments(prev => prev.map(apt => 
          apt._id === assignmentData.appointmentId ? { ...apt, assignedStaffId: assignmentData.staffId } : apt
        ));
        setAssignmentData({ appointmentId: '', staffId: '' });
        onAssignModalClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign appointment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferAppointment = async () => {
    if (!transferData.appointmentId || !transferData.toStaffId) return;
    
    try {
      setLoading(true);
      const result = await appointmentAPI.transferAppointment(transferData);
      if (result.success) {
        toast({
          title: 'Appointment Transferred',
          description: 'Appointment has been transferred successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setAppointments(prev => prev.map(apt => 
          apt._id === transferData.appointmentId ? { ...apt, assignedStaffId: transferData.toStaffId } : apt
        ));
        setTransferData({
          appointmentId: '',
          fromStaffId: '',
          toStaffId: '',
          reason: '',
          notes: ''
        });
        onTransferModalClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to transfer appointment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      const result = await appointmentAPI.unassignAppointment(appointmentId, {
        reason: 'Unassigned by staff',
        notes: 'Appointment unassigned from current staff member'
      });
      if (result.success) {
        toast({
          title: 'Appointment Unassigned',
          description: 'Appointment has been unassigned successfully',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        setAppointments(prev => prev.map(apt => 
          apt._id === appointmentId ? { ...apt, assignedStaffId: null } : apt
        ));
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unassign appointment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      case 'rescheduled': return 'purple';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (duration) => {
    return `${duration} minutes`;
  };

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="7xl" py={6}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading size="xl" fontWeight="600" color={textColor} mb={2} lineHeight="1.2">
              Appointment Management
            </Heading>
            <Text fontSize="md" color={secondaryTextColor} lineHeight="1.5">
              Manage appointments and staff assignments
            </Text>
          </Box>

          {/* Summary Cards */}
          <SimpleGrid columns={gridColumns} spacing={4}>
            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardBody p={6}>
                <Stat>
                  <StatLabel fontSize="sm" color={mutedTextColor}>Total Appointments</StatLabel>
                  <StatNumber fontSize="2xl" color={textColor}>{appointments.length}</StatNumber>
                  <StatHelpText>
                    {appointmentsByStatus.scheduled.length} scheduled
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardBody p={6}>
                <Stat>
                  <StatLabel fontSize="sm" color={mutedTextColor}>Completed</StatLabel>
                  <StatNumber fontSize="2xl" color="green.500">{appointmentsByStatus.completed.length}</StatNumber>
                  <StatHelpText>
                    {appointmentsByStatus.cancelled.length} cancelled
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
              <CardBody p={6}>
                <Stat>
                  <StatLabel fontSize="sm" color={mutedTextColor}>Assigned</StatLabel>
                  <StatNumber fontSize="2xl" color="blue.500">
                    {appointments.filter(apt => apt.assignedStaffId).length}
                  </StatNumber>
                  <StatHelpText>
                    {appointments.filter(apt => !apt.assignedStaffId).length} unassigned
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Filters and Actions */}
          <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
            <CardBody p={6}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} flex="1">
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiSearch} color="gray.300" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search appointments..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </InputGroup>
                  
                  <Select
                    placeholder="All Status"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rescheduled">Rescheduled</option>
                  </Select>
                </SimpleGrid>
                
                <HStack spacing={2}>
                  <Button size="sm" leftIcon={<FiUserPlus />} colorScheme="blue" onClick={onAssignModalOpen}>
                    Assign
                  </Button>
                  <Button size="sm" leftIcon={<FiArrowRight />} colorScheme="purple" onClick={onTransferModalOpen}>
                    Transfer
                  </Button>
                  <Button size="sm" leftIcon={<FiRefreshCw />} variant="outline">
                    Refresh
                  </Button>
                  <Button size="sm" leftIcon={<FiDownload />} variant="outline">
                    Export
                  </Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Appointments List */}
          <Card bg={cardBgColor} shadow="sm" borderRadius="md" border="1px" borderColor={borderColor}>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md" color={textColor}>Appointments</Heading>
                <Text fontSize="sm" color={secondaryTextColor}>
                  {filteredAppointments.length} appointments found
                </Text>
              </Flex>
            </CardHeader>
            <CardBody p={0}>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Client</Th>
                      <Th>Date & Time</Th>
                      <Th>Duration</Th>
                      <Th>Status</Th>
                      <Th>Assigned Staff</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredAppointments.map((appointment) => (
                      <Tr key={appointment._id} _hover={{ bg: hoverBg }}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="500" color={textColor}>
                              {appointment.leadId?.name || 'Unknown Client'}
                            </Text>
                            <HStack spacing={2}>
                              <HStack spacing={1}>
                                <Icon as={FiMail} boxSize={3} color={mutedTextColor} />
                                <Text fontSize="xs" color={mutedTextColor}>
                                  {appointment.leadId?.email || 'N/A'}
                                </Text>
                              </HStack>
                              <HStack spacing={1}>
                                <Icon as={FiPhone} boxSize={3} color={mutedTextColor} />
                                <Text fontSize="xs" color={mutedTextColor}>
                                  {appointment.leadId?.phone || 'N/A'}
                                </Text>
                              </HStack>
                            </HStack>
                          </VStack>
                        </Td>
                        <Td>
                          <VStack spacing={1} align="start">
                            <Text fontSize="sm" color={secondaryTextColor}>
                              {formatDate(appointment.startTime)}
                            </Text>
                            <Text fontSize="xs" color={mutedTextColor}>
                              {appointment.coachId?.name || 'Coach'}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color={secondaryTextColor}>
                            {formatDuration(appointment.duration)}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(appointment.status)} variant="subtle">
                            {appointment.status}
                          </Badge>
                        </Td>
                        <Td>
                          {appointment.assignedStaffId ? (
                            <HStack spacing={2}>
                              <Avatar size="xs" name="Staff" />
                              <Text fontSize="sm" color={secondaryTextColor}>Assigned</Text>
                            </HStack>
                          ) : (
                            <Text fontSize="sm" color={mutedTextColor}>Unassigned</Text>
                          )}
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Tooltip label="View Details">
                              <IconButton
                                size="sm"
                                icon={<FiEye />}
                                variant="ghost"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  onAppointmentModalOpen();
                                }}
                              />
                            </Tooltip>
                            
                            {!appointment.assignedStaffId ? (
                              <Tooltip label="Assign Appointment">
                                <IconButton
                                  size="sm"
                                  icon={<FiUserPlus />}
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => {
                                    setAssignmentData(prev => ({ ...prev, appointmentId: appointment._id }));
                                    onAssignModalOpen();
                                  }}
                                />
                              </Tooltip>
                            ) : (
                              <Tooltip label="Unassign Appointment">
                                <IconButton
                                  size="sm"
                                  icon={<FiUserMinus />}
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleUnassignAppointment(appointment._id)}
                                  isLoading={loading}
                                />
                              </Tooltip>
                            )}
                            
                            <Menu>
                              <MenuButton as={IconButton} size="sm" icon={<FiMoreVertical />} variant="ghost" />
                              <MenuList>
                                <MenuItem icon={<FiEdit />}>Edit Appointment</MenuItem>
                                <MenuItem icon={<FiArrowRight />} onClick={() => {
                                  setTransferData(prev => ({ 
                                    ...prev, 
                                    appointmentId: appointment._id,
                                    fromStaffId: appointment.assignedStaffId
                                  }));
                                  onTransferModalOpen();
                                }}>
                                  Transfer Appointment
                                </MenuItem>
                                <MenuDivider />
                                <MenuItem icon={<FiTrash2 />} color="red.500">Cancel Appointment</MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Appointment Details Modal */}
      <Modal isOpen={isAppointmentModalOpen} onClose={onAppointmentModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Appointment Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAppointment && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="md" mb={2}>Appointment Information</Heading>
                  <Text color={secondaryTextColor}>
                    {selectedAppointment.notes || 'No additional notes available'}
                  </Text>
                </Box>
                
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="500" color={mutedTextColor}>Status</Text>
                    <Badge colorScheme={getStatusColor(selectedAppointment.status)} variant="subtle">
                      {selectedAppointment.status}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="500" color={mutedTextColor}>Duration</Text>
                    <Text fontSize="sm">{formatDuration(selectedAppointment.duration)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="500" color={mutedTextColor}>Start Time</Text>
                    <Text fontSize="sm">{formatDate(selectedAppointment.startTime)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="500" color={mutedTextColor}>Created</Text>
                    <Text fontSize="sm">{formatDate(selectedAppointment.createdAt)}</Text>
                  </Box>
                </SimpleGrid>

                {selectedAppointment.leadId && (
                  <Box>
                    <Text fontSize="sm" fontWeight="500" color={mutedTextColor} mb={2}>Client Information</Text>
                    <Card variant="outline" p={3}>
                      <VStack spacing={2} align="start">
                        <Text fontWeight="500">{selectedAppointment.leadId.name}</Text>
                        <HStack spacing={4}>
                          <HStack spacing={1}>
                            <Icon as={FiMail} boxSize={3} color={mutedTextColor} />
                            <Text fontSize="sm" color={secondaryTextColor}>{selectedAppointment.leadId.email}</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Icon as={FiPhone} boxSize={3} color={mutedTextColor} />
                            <Text fontSize="sm" color={secondaryTextColor}>{selectedAppointment.leadId.phone}</Text>
                          </HStack>
                        </HStack>
                      </VStack>
                    </Card>
                  </Box>
                )}

                {selectedAppointment.coachId && (
                  <Box>
                    <Text fontSize="sm" fontWeight="500" color={mutedTextColor} mb={2}>Coach Information</Text>
                    <Card variant="outline" p={3}>
                      <VStack spacing={2} align="start">
                        <Text fontWeight="500">{selectedAppointment.coachId.name}</Text>
                        <HStack spacing={1}>
                          <Icon as={FiMail} boxSize={3} color={mutedTextColor} />
                          <Text fontSize="sm" color={secondaryTextColor}>{selectedAppointment.coachId.email}</Text>
                        </HStack>
                      </VStack>
                    </Card>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAppointmentModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Assign Appointment Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={onAssignModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign Appointment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Select Staff Member</FormLabel>
                <Select
                  placeholder="Choose staff member"
                  value={assignmentData.staffId}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, staffId: e.target.value }))}
                >
                  <option value="staff_1">John Smith</option>
                  <option value="staff_2">Sarah Johnson</option>
                  <option value="staff_3">Mike Wilson</option>
                </Select>
              </FormControl>
              
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Assignment Note</AlertTitle>
                  <AlertDescription fontSize="sm">
                    This will assign the selected appointment to the chosen staff member.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAssignModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAssignAppointment} isLoading={loading}>
              Assign Appointment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Transfer Appointment Modal */}
      <Modal isOpen={isTransferModalOpen} onClose={onTransferModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transfer Appointment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Transfer To</FormLabel>
                <Select
                  placeholder="Choose new staff member"
                  value={transferData.toStaffId}
                  onChange={(e) => setTransferData(prev => ({ ...prev, toStaffId: e.target.value }))}
                >
                  <option value="staff_1">John Smith</option>
                  <option value="staff_2">Sarah Johnson</option>
                  <option value="staff_3">Mike Wilson</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Reason for Transfer</FormLabel>
                <Select
                  placeholder="Select reason"
                  value={transferData.reason}
                  onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
                >
                  <option value="schedule_conflict">Schedule Conflict</option>
                  <option value="workload_redistribution">Workload Redistribution</option>
                  <option value="specialization">Specialization Required</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Additional Notes</FormLabel>
                <Textarea
                  placeholder="Add any additional notes..."
                  value={transferData.notes}
                  onChange={(e) => setTransferData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTransferModalClose}>
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={handleTransferAppointment} isLoading={loading}>
              Transfer Appointment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AppointmentManagement;