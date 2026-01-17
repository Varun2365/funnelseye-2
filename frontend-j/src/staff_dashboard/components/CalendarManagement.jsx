import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Badge,
  useToast,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Icon,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Wrap,
  WrapItem,
  Tag,
  TagLabel
} from '@chakra-ui/react';
import {
  FaCalendar,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaBell,
  FaTag,
  FaEllipsisV,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaPlay,
  FaPause
} from 'react-icons/fa';
import CalendarEventModal from './CalendarEventModal';
import { staffAPI } from '../../services/staffAPI';

const CalendarManagement = () => {
  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    eventType: '',
    status: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [summary, setSummary] = useState({});

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await staffAPI.getCalendarEvents(filters);
      setEvents(response.data || []);
      
      // Calculate summary
      const summaryData = {
        total: response.data?.length || 0,
        completed: response.data?.filter(e => e.status === 'completed').length || 0,
        scheduled: response.data?.filter(e => e.status === 'scheduled').length || 0,
        cancelled: response.data?.filter(e => e.status === 'cancelled').length || 0
      };
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      toast({
        title: 'Error Loading Calendar Events',
        description: error.message || 'Failed to load calendar events',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = (newEvent) => {
    setEvents(prev => [newEvent, ...prev]);
    loadEvents(); // Refresh to get updated summary
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    onEditOpen();
  };

  const handleUpdateEvent = async (eventData) => {
    setLoading(true);
    try {
      await staffAPI.updateCalendarEvent(selectedEvent._id, eventData);
      
      toast({
        title: 'Event Updated Successfully!',
        description: 'Calendar event has been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onEditClose();
      setSelectedEvent(null);
      loadEvents();

    } catch (error) {
      console.error('Error updating calendar event:', error);
      toast({
        title: 'Error Updating Event',
        description: error.message || 'Failed to update calendar event',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    setLoading(true);
    try {
      await staffAPI.deleteCalendarEvent(eventId);
      
      toast({
        title: 'Event Deleted Successfully!',
        description: 'Calendar event has been removed.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      loadEvents();

    } catch (error) {
      console.error('Error deleting calendar event:', error);
      toast({
        title: 'Error Deleting Event',
        description: error.message || 'Failed to delete calendar event',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case 'meeting': return 'blue';
      case 'task': return 'green';
      case 'break': return 'orange';
      case 'unavailable': return 'red';
      case 'custom': return 'purple';
      default: return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'scheduled': return 'blue';
      case 'in_progress': return 'yellow';
      case 'cancelled': return 'red';
      case 'rescheduled': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return FaCheckCircle;
      case 'scheduled': return FaCalendar;
      case 'in_progress': return FaPlay;
      case 'cancelled': return FaTimesCircle;
      case 'rescheduled': return FaExclamationTriangle;
      default: return FaCalendar;
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

  const formatDuration = (duration) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (loading && events.length === 0) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.500">Loading calendar events...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg" color={useColorModeValue('gray.800', 'white')}>
              Calendar Management
            </Heading>
            <Text color="gray.500">
              Manage your calendar events, meetings, and schedule
            </Text>
          </VStack>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={FaPlus} />}
            onClick={onCreateOpen}
          >
            Create Event
          </Button>
        </Flex>

        {/* Summary Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Total Events</StatLabel>
                <StatNumber>{summary.total || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  All calendar events
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Scheduled</StatLabel>
                <StatNumber color="blue.500">{summary.scheduled || 0}</StatNumber>
                <StatHelpText>
                  Upcoming events
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Completed</StatLabel>
                <StatNumber color="green.500">{summary.completed || 0}</StatNumber>
                <StatHelpText>
                  Finished events
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Cancelled</StatLabel>
                <StatNumber color="red.500">{summary.cancelled || 0}</StatNumber>
                <StatHelpText>
                  Cancelled events
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="full">
                <InputGroup flex={2}>
                  <InputLeftElement>
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search events..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                  />
                </InputGroup>
                
                <Select
                  placeholder="All Types"
                  value={filters.eventType}
                  onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  w="150px"
                >
                  <option value="meeting">Meeting</option>
                  <option value="task">Task</option>
                  <option value="break">Break</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="custom">Custom</option>
                </Select>
                
                <Select
                  placeholder="All Status"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  w="150px"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </Select>
              </HStack>

              <HStack spacing={4} w="full">
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  w="200px"
                />
                
                <Input
                  type="date"
                  placeholder="End Date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  w="200px"
                />
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Events Table */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Your Calendar Events</Heading>
          </CardHeader>
          <CardBody p={0}>
            {events.length === 0 ? (
              <Center py={8}>
                <VStack spacing={4}>
                  <Icon as={FaCalendar} boxSize={12} color="gray.400" />
                  <Text color="gray.500">No calendar events found</Text>
                  <Button colorScheme="blue" onClick={onCreateOpen}>
                    Create Your First Event
                  </Button>
                </VStack>
              </Center>
            ) : (
              <Table variant="simple" size="sm">
                <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                  <Tr>
                    <Th>Event</Th>
                    <Th>Type</Th>
                    <Th>Status</Th>
                    <Th>Start Time</Th>
                    <Th>Duration</Th>
                    <Th>Location</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {events.map((event) => (
                    <Tr key={event._id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{event.title}</Text>
                          <Text fontSize="sm" color="gray.500" noOfLines={1}>
                            {event.description}
                          </Text>
                          {event.tags && event.tags.length > 0 && (
                            <Wrap>
                              {event.tags.slice(0, 2).map((tag, index) => (
                                <WrapItem key={index}>
                                  <Tag size="sm" colorScheme="teal">
                                    <TagLabel>{tag}</TagLabel>
                                  </Tag>
                                </WrapItem>
                              ))}
                              {event.tags.length > 2 && (
                                <WrapItem>
                                  <Tag size="sm" colorScheme="gray">
                                    <TagLabel>+{event.tags.length - 2}</TagLabel>
                                  </Tag>
                                </WrapItem>
                              )}
                            </Wrap>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={getEventTypeColor(event.eventType)}>
                          {event.eventType}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(event.status)}
                          leftIcon={<Icon as={getStatusIcon(event.status)} boxSize={3} />}
                        >
                          {event.status}
                        </Badge>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm">{formatDateTime(event.startTime)}</Text>
                          <Text fontSize="xs" color="gray.500">
                            to {formatDateTime(event.endTime)}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{formatDuration(event.duration)}</Text>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          {event.location && (
                            <>
                              <Icon as={FaMapMarkerAlt} boxSize={3} color="gray.400" />
                              <Text fontSize="sm" noOfLines={1}>{event.location}</Text>
                            </>
                          )}
                        </HStack>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Tooltip label="Edit Event">
                            <IconButton
                              icon={<Icon as={FaEdit} />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => handleEditEvent(event)}
                              isLoading={loading}
                            />
                          </Tooltip>
                          
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<Icon as={FaEllipsisV} />}
                              size="sm"
                              variant="ghost"
                            />
                            <MenuList>
                              <MenuItem icon={<Icon as={FaBell} />}>
                                Set Reminder
                              </MenuItem>
                              <MenuItem icon={<Icon as={FaUsers} />}>
                                Manage Attendees
                              </MenuItem>
                              <Divider />
                              <MenuItem 
                                icon={<Icon as={FaTrash} />} 
                                color="red.500"
                                onClick={() => handleDeleteEvent(event._id)}
                              >
                                Delete Event
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Calendar Event Creation Modal */}
      <CalendarEventModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onEventCreated={handleEventCreated}
      />

      {/* Calendar Event Edit Modal */}
      <CalendarEventModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        onEventCreated={handleUpdateEvent}
        initialData={selectedEvent}
        isEdit={true}
      />
    </Box>
  );
};

export default CalendarManagement;