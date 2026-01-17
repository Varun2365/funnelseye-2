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
  Checkbox,
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
  SimpleGrid
} from '@chakra-ui/react';
import {
  FaTasks,
  FaPlus,
  FaSearch,
  FaFilter,
  FaCheck,
  FaPause,
  FaPlay,
  FaEdit,
  FaTrash,
  FaClock,
  FaFlag,
  FaUser,
  FaCalendar,
  FaEllipsisV,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle
} from 'react-icons/fa';
import TaskCreationModal from './TaskCreationModal';
import { staffTaskAPI } from '../../services/staffAPI';

const TaskManagement = () => {
  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isBulkOpen, onOpen: onBulkOpen, onClose: onBulkClose } = useDisclosure();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    stage: '',
    search: ''
  });
  const [summary, setSummary] = useState({});
  const [bulkAction, setBulkAction] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await staffTaskAPI.getStaffTasks(filters);
      setTasks(response.data.tasks || []);
      setSummary(response.data.summary || {});
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: 'Error Loading Tasks',
        description: error.message || 'Failed to load tasks',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
    loadTasks(); // Refresh to get updated summary
  };

  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(task => task._id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedTasks.length === 0) return;

    setLoading(true);
    try {
      let updates = {};
      
      switch (bulkAction) {
        case 'start':
          updates.status = 'In Progress';
          break;
        case 'complete':
          updates.status = 'Completed';
          break;
        case 'pause':
          updates.status = 'Paused';
          break;
        case 'high_priority':
          updates.priority = 'HIGH';
          break;
        case 'medium_priority':
          updates.priority = 'MEDIUM';
          break;
        case 'low_priority':
          updates.priority = 'LOW';
          break;
        default:
          throw new Error('Invalid bulk action');
      }

      await staffTaskAPI.bulkUpdateTasks(selectedTasks, updates);
      
      toast({
        title: 'Bulk Action Completed',
        description: `${selectedTasks.length} task(s) updated successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setSelectedTasks([]);
      setBulkAction('');
      onBulkClose();
      loadTasks();

    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: 'Bulk Action Failed',
        description: error.message || 'Failed to update tasks',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = async (taskId, action) => {
    setLoading(true);
    try {
      let response;
      
      switch (action) {
        case 'start':
          response = await staffTaskAPI.startTask(taskId);
          break;
        case 'complete':
          response = await staffTaskAPI.completeTask(taskId, {
            completionNotes: 'Task completed',
            actualHours: 1,
            outcome: 'Successfully completed',
            qualityRating: 8
          });
          break;
        case 'pause':
          response = await staffTaskAPI.pauseTask(taskId);
          break;
        default:
          throw new Error('Invalid action');
      }

      toast({
        title: 'Task Updated',
        description: `Task ${action} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      loadTasks();

    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error Updating Task',
        description: error.message || 'Failed to update task',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'green';
      case 'In Progress': return 'blue';
      case 'Pending': return 'yellow';
      case 'Overdue': return 'red';
      case 'Paused': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return FaCheckCircle;
      case 'In Progress': return FaPlay;
      case 'Pending': return FaClock;
      case 'Overdue': return FaExclamationTriangle;
      case 'Paused': return FaPause;
      default: return FaTasks;
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.500">Loading tasks...</Text>
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
              Task Management
            </Heading>
            <Text color="gray.500">
              Manage your tasks, track progress, and stay organized
            </Text>
          </VStack>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={FaPlus} />}
            onClick={onCreateOpen}
          >
            Create Task
          </Button>
        </Flex>

        {/* Summary Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Total Tasks</StatLabel>
                <StatNumber>{summary.total || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  All assigned tasks
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
                  <StatArrow type="increase" />
                  Finished tasks
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>In Progress</StatLabel>
                <StatNumber color="blue.500">{summary.inProgress || 0}</StatNumber>
                <StatHelpText>
                  Currently working
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Overdue</StatLabel>
                <StatNumber color="red.500">{summary.overdue || 0}</StatNumber>
                <StatHelpText>
                  Need attention
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters and Actions */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4}>
              {/* Search and Filters */}
              <HStack spacing={4} w="full">
                <InputGroup flex={2}>
                  <InputLeftElement>
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search tasks..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                  />
                </InputGroup>
                
                <Select
                  placeholder="All Status"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  w="150px"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Paused">Paused</option>
                </Select>
                
                <Select
                  placeholder="All Priority"
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  w="150px"
                >
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </Select>
              </HStack>

              {/* Bulk Actions */}
              {selectedTasks.length > 0 && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Bulk Actions Available!</AlertTitle>
                    <AlertDescription>
                      {selectedTasks.length} task(s) selected. Choose an action to apply to all selected tasks.
                    </AlertDescription>
                  </Box>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={onBulkOpen}
                    ml={4}
                  >
                    Bulk Actions
                  </Button>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Tasks Table */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Your Tasks</Heading>
          </CardHeader>
          <CardBody p={0}>
            {tasks.length === 0 ? (
              <Center py={8}>
                <VStack spacing={4}>
                  <Icon as={FaTasks} boxSize={12} color="gray.400" />
                  <Text color="gray.500">No tasks found</Text>
                  <Button colorScheme="blue" onClick={onCreateOpen}>
                    Create Your First Task
                  </Button>
                </VStack>
              </Center>
            ) : (
              <Table variant="simple" size="sm">
                <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                  <Tr>
                    <Th>
                      <Checkbox
                        isChecked={selectedTasks.length === tasks.length && tasks.length > 0}
                        isIndeterminate={selectedTasks.length > 0 && selectedTasks.length < tasks.length}
                        onChange={handleSelectAll}
                      />
                    </Th>
                    <Th>Task</Th>
                    <Th>Status</Th>
                    <Th>Priority</Th>
                    <Th>Stage</Th>
                    <Th>Due Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tasks.map((task) => (
                    <Tr key={task._id}>
                      <Td>
                        <Checkbox
                          isChecked={selectedTasks.includes(task._id)}
                          onChange={() => handleSelectTask(task._id)}
                        />
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{task.name}</Text>
                          <Text fontSize="sm" color="gray.500" noOfLines={1}>
                            {task.description}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(task.status)}
                          leftIcon={<Icon as={getStatusIcon(task.status)} boxSize={3} />}
                        >
                          {task.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{task.stage}</Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          {task.status === 'Pending' && (
                            <Tooltip label="Start Task">
                              <IconButton
                                icon={<Icon as={FaPlay} />}
                                size="sm"
                                colorScheme="green"
                                variant="ghost"
                                onClick={() => handleTaskAction(task._id, 'start')}
                                isLoading={loading}
                              />
                            </Tooltip>
                          )}
                          
                          {task.status === 'In Progress' && (
                            <>
                              <Tooltip label="Complete Task">
                                <IconButton
                                  icon={<Icon as={FaCheck} />}
                                  size="sm"
                                  colorScheme="green"
                                  variant="ghost"
                                  onClick={() => handleTaskAction(task._id, 'complete')}
                                  isLoading={loading}
                                />
                              </Tooltip>
                              <Tooltip label="Pause Task">
                                <IconButton
                                  icon={<Icon as={FaPause} />}
                                  size="sm"
                                  colorScheme="orange"
                                  variant="ghost"
                                  onClick={() => handleTaskAction(task._id, 'pause')}
                                  isLoading={loading}
                                />
                              </Tooltip>
                            </>
                          )}
                          
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<Icon as={FaEllipsisV} />}
                              size="sm"
                              variant="ghost"
                            />
                            <MenuList>
                              <MenuItem icon={<Icon as={FaEdit} />}>
                                Edit Task
                              </MenuItem>
                              <MenuItem icon={<Icon as={FaClock} />}>
                                Log Time
                              </MenuItem>
                              <Divider />
                              <MenuItem icon={<Icon as={FaTrash} />} color="red.500">
                                Delete Task
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

      {/* Task Creation Modal */}
      <TaskCreationModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onTaskCreated={handleTaskCreated}
      />

      {/* Bulk Actions Modal */}
      <Modal isOpen={isBulkOpen} onClose={onBulkClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Bulk Actions</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>Select an action to apply to {selectedTasks.length} selected task(s):</Text>
              <Select
                placeholder="Choose action..."
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <option value="start">Start Tasks</option>
                <option value="complete">Complete Tasks</option>
                <option value="pause">Pause Tasks</option>
                <option value="high_priority">Set High Priority</option>
                <option value="medium_priority">Set Medium Priority</option>
                <option value="low_priority">Set Low Priority</option>
              </Select>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onBulkClose} mr={3}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleBulkAction}
              isDisabled={!bulkAction}
              isLoading={loading}
            >
              Apply Action
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TaskManagement;