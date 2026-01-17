import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Container, Flex, Grid, GridItem, Text, Heading, Button, Input, Select,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Card, CardHeader, CardBody, Badge, VStack, HStack, Stat, StatLabel, StatNumber,
  useDisclosure, useToast, Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription,
  Textarea, FormControl, FormLabel, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper, Progress, IconButton, Tooltip,
  Menu, MenuButton, MenuList, MenuItem, MenuDivider, useColorModeValue, SimpleGrid,
  Tag, TagLabel, Wrap, WrapItem, Divider, Accordion, AccordionItem, AccordionButton,
  AccordionPanel, AccordionIcon, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  Tabs, TabList, TabPanels, Tab, TabPanel, StatHelpText
} from '@chakra-ui/react';
import {
  FiCheckCircle, FiClock, FiPlay, FiPause, FiEdit, FiTrash2, FiPlus, FiMoreVertical,
  FiTarget, FiUser, FiCalendar, FiBarChart2, FiTrendingUp, FiTrendingDown,
  FiAlertCircle, FiCheck, FiX, FiEye, FiEyeOff, FiDownload, FiUpload
} from 'react-icons/fi';
import { staffTaskAPI, workflowAPI, handleAPIError } from '../services/staffAPI';

const StaffTaskManagement = () => {
  const { token, user } = useSelector(state => state.auth);
  const toast = useToast();
  
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  
  // State management
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [kanbanData, setKanbanData] = useState({});
  const [taskStats, setTaskStats] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAllTasks, setLoadingAllTasks] = useState(false);
  const [activeTab, setActiveTab] = useState('my-tasks'); // 'my-tasks' or 'all-tasks'
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    stage: 'all'
  });

  // Modal controls
  const { isOpen: isTaskModalOpen, onOpen: onTaskModalOpen, onClose: onTaskModalClose } = useDisclosure();
  const { isOpen: isTimeLogModalOpen, onOpen: onTimeLogModalOpen, onClose: onTimeLogModalClose } = useDisclosure();
  const { isOpen: isCommentModalOpen, onOpen: onCommentModalOpen, onClose: onCommentModalClose } = useDisclosure();
  const { isOpen: isCompleteModalOpen, onOpen: onCompleteModalOpen, onClose: onCompleteModalClose } = useDisclosure();

  // Form states
  const [timeLogData, setTimeLogData] = useState({
    startTime: '',
    endTime: '',
    description: ''
  });

  const [commentData, setCommentData] = useState({
    content: ''
  });

  const [completionData, setCompletionData] = useState({
    completionNotes: '',
    actualHours: 0,
    outcome: 'SUCCESS',
    qualityRating: 5,
    feedback: ''
  });

  // Show notification
  const showNotification = (type, message) => {
    toast({
      title: type === 'success' ? 'Success!' : type === 'warning' ? 'Warning!' : 'Error!',
      description: message,
      status: type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right'
    });
  };

  // Utility functions
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'yellow';
      case 'overdue': return 'red';
      case 'cancelled': return 'gray';
      case 'paused': return 'purple';
      default: return 'gray';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  // API Functions
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await staffTaskAPI.getStaffTasks(filters);
      setTasks(data.tasks || []);
      setTaskStats(data.summary || {});
    } catch (err) {
      const errorMessage = handleAPIError(err);
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchKanbanBoard = async () => {
    try {
      const data = await workflowAPI.getKanbanBoard();
      setKanbanData(data);
    } catch (err) {
      console.error('Failed to fetch kanban board:', err);
    }
  };

  const startTask = async (taskId) => {
    try {
      await staffTaskAPI.startTask(taskId, 'Starting work on task');
      showNotification('success', 'Task started successfully!');
      fetchTasks();
    } catch (err) {
      const errorMessage = handleAPIError(err);
      showNotification('error', errorMessage);
    }
  };

  const pauseTask = async (taskId) => {
    try {
      await staffTaskAPI.pauseTask(taskId, 'Pausing task work');
      showNotification('success', 'Task paused successfully!');
      fetchTasks();
    } catch (err) {
      const errorMessage = handleAPIError(err);
      showNotification('error', errorMessage);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await staffTaskAPI.updateTaskStatus(taskId, status);
      showNotification('success', 'Task status updated successfully!');
      fetchTasks();
    } catch (err) {
      const errorMessage = handleAPIError(err);
      showNotification('error', errorMessage);
    }
  };

  const logTime = async () => {
    if (!selectedTask) return;
    
    try {
      await staffTaskAPI.logTaskTime(selectedTask._id, timeLogData);
      showNotification('success', 'Time logged successfully!');
      onTimeLogModalClose();
      setTimeLogData({ startTime: '', endTime: '', description: '' });
      fetchTasks();
    } catch (err) {
      const errorMessage = handleAPIError(err);
      showNotification('error', errorMessage);
    }
  };

  const addComment = async () => {
    if (!selectedTask) return;
    
    try {
      await staffTaskAPI.addTaskComment(selectedTask._id, commentData.content);
      showNotification('success', 'Comment added successfully!');
      onCommentModalClose();
      setCommentData({ content: '' });
      fetchTasks();
    } catch (err) {
      const errorMessage = handleAPIError(err);
      showNotification('error', errorMessage);
    }
  };

  const completeTask = async () => {
    if (!selectedTask) return;
    
    try {
      await staffTaskAPI.completeTask(selectedTask._id, completionData);
      showNotification('success', 'Task completed successfully!');
      onCompleteModalClose();
      setCompletionData({
        completionNotes: '',
        actualHours: 0,
        outcome: 'SUCCESS',
        qualityRating: 5,
        feedback: ''
      });
      fetchTasks();
    } catch (err) {
      const errorMessage = handleAPIError(err);
      showNotification('error', errorMessage);
    }
  };

  const fetchMyTasks = async () => {
    try {
      const data = await staffTaskAPI.getMyTasks(30);
      return data;
    } catch (err) {
      console.error('Failed to fetch my tasks:', err);
      return null;
    }
  };

  const fetchOverdueTasks = async () => {
    try {
      const data = await staffTaskAPI.getOverdueTasks();
      return data;
    } catch (err) {
      console.error('Failed to fetch overdue tasks:', err);
      return [];
    }
  };

  const fetchUpcomingTasks = async () => {
    try {
      const data = await staffTaskAPI.getUpcomingTasks(7);
      return data;
    } catch (err) {
      console.error('Failed to fetch upcoming tasks:', err);
      return [];
    }
  };

  const fetchAllTasks = async () => {
    setLoadingAllTasks(true);
    try {
      const response = await workflowAPI.getAllTasks({
        page: 1,
        limit: 1000, // Get all tasks
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setAllTasks(response.data || []);
    } catch (err) {
      const errorMessage = handleAPIError(err);
      showNotification('error', `Failed to fetch all tasks: ${errorMessage}`);
    } finally {
      setLoadingAllTasks(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchTasks();
    fetchKanbanBoard();
    if (activeTab === 'all-tasks') {
      fetchAllTasks();
    }
  }, [filters, activeTab]);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filters.status === 'all' || task.status === filters.status;
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
    const matchesStage = filters.stage === 'all' || task.stage === filters.stage;
    return matchesStatus && matchesPriority && matchesStage;
  });

  return (
    <Box bg={bgColor} minH="100vh" py={6}>
      <Container maxW="7xl">
        {/* Header */}
        <Box mb={8}>
          <Heading size="lg" color={textColor} mb={2}>
            Task Management Dashboard
          </Heading>
          <Text color={mutedColor}>
            Manage your assigned tasks, track time, and complete work efficiently
          </Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color={mutedColor}>Total Tasks</StatLabel>
                <StatNumber color="blue.600">{taskStats.total || 0}</StatNumber>
                <StatHelpText>
                  Assigned to you
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color={mutedColor}>In Progress</StatLabel>
                <StatNumber color="orange.600">{taskStats.inProgress || 0}</StatNumber>
                <StatHelpText>
                  Currently working
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color={mutedColor}>Completed</StatLabel>
                <StatNumber color="green.600">{taskStats.completed || 0}</StatNumber>
                <StatHelpText>
                  Successfully finished
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color={mutedColor}>Overdue</StatLabel>
                <StatNumber color="red.600">{taskStats.overdue || 0}</StatNumber>
                <StatHelpText>
                  Past due date
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Tabs for My Tasks and All Tasks */}
        <Tabs index={activeTab === 'my-tasks' ? 0 : 1} onChange={(index) => setActiveTab(index === 0 ? 'my-tasks' : 'all-tasks')} mb={6}>
          <TabList>
            <Tab>My Tasks</Tab>
            <Tab>All Tasks</Tab>
          </TabList>

          <TabPanels>
            {/* My Tasks Panel */}
            <TabPanel px={0}>
              {/* Filters */}
              <Card bg={cardBg} border="1px solid" borderColor={borderColor} mb={6}>
                <CardBody>
                  <Flex gap={4} wrap="wrap">
                    <Select
                      placeholder="All Status"
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      maxW="200px"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                    </Select>

                    <Select
                      placeholder="All Priority"
                      value={filters.priority}
                      onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                      maxW="200px"
                    >
                      <option value="all">All Priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Select>

                    <Select
                      placeholder="All Stages"
                      value={filters.stage}
                      onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
                      maxW="200px"
                    >
                      <option value="all">All Stages</option>
                      <option value="LEAD_GENERATION">Lead Generation</option>
                      <option value="LEAD_QUALIFICATION">Lead Qualification</option>
                      <option value="PROPOSAL">Proposal</option>
                      <option value="CLOSING">Closing</option>
                      <option value="ONBOARDING">Onboarding</option>
                    </Select>

                    <Button
                      leftIcon={<FiPlus />}
                      onClick={onTaskModalOpen}
                      colorScheme="blue"
                      size="sm"
                    >
                      Create Task
                    </Button>

                    <Button
                      leftIcon={<FiBarChart2 />}
                      onClick={fetchKanbanBoard}
                      variant="outline"
                      size="sm"
                    >
                      View Kanban
                    </Button>
                  </Flex>
                </CardBody>
              </Card>

              {/* Loading State */}
              {loading && (
                <Center py={20}>
                  <VStack>
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                    <Text color={mutedColor}>Loading tasks...</Text>
                  </VStack>
                </Center>
              )}

              {/* Tasks Grid */}
              {!loading && (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredTasks.map((task) => (
                    <Card key={task._id} bg={cardBg} border="1px solid" borderColor={borderColor}>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          <Box>
                            <Heading size="sm" color={textColor} mb={2}>
                              {task.name}
                            </Heading>
                            <Text fontSize="sm" color={mutedColor} noOfLines={2}>
                              {task.description}
                            </Text>
                          </Box>

                          <HStack justify="space-between">
                            <Badge colorScheme={getPriorityColor(task.priority)} size="sm">
                              {task.priority}
                            </Badge>
                            <Badge colorScheme={getStatusColor(task.status)} size="sm">
                              {task.status}
                            </Badge>
                          </HStack>

                          <VStack spacing={2} align="stretch">
                            <HStack>
                              <FiCalendar size={14} />
                              <Text fontSize="sm" color={mutedColor}>
                                Due: {formatDate(task.dueDate)}
                              </Text>
                            </HStack>
                            
                            {task.estimatedHours && (
                              <HStack>
                                <FiClock size={14} />
                                <Text fontSize="sm" color={mutedColor}>
                                  Est: {task.estimatedHours}h | Actual: {task.actualHours || 0}h
                                </Text>
                              </HStack>
                            )}

                            {task.relatedLead && (
                              <HStack>
                                <FiTarget size={14} />
                                <Text fontSize="sm" color={mutedColor}>
                                  Lead: {task.relatedLead.name || 'Unknown'}
                                </Text>
                              </HStack>
                            )}
                          </VStack>

                          {/* Progress Bar */}
                          {task.status === 'in_progress' && (
                            <Box>
                              <Text fontSize="sm" color={mutedColor} mb={1}>
                                Progress
                              </Text>
                              <Progress value={task.progress || 0} colorScheme="blue" size="sm" />
                            </Box>
                          )}

                          {/* Action Buttons */}
                          <HStack spacing={2}>
                            {task.status === 'pending' && (
                              <Button
                                leftIcon={<FiPlay />}
                                onClick={() => startTask(task._id)}
                                size="sm"
                                colorScheme="green"
                                flex={1}
                              >
                                Start
                              </Button>
                            )}

                            {task.status === 'in_progress' && (
                              <>
                                <Button
                                  leftIcon={<FiPause />}
                                  onClick={() => pauseTask(task._id)}
                                  size="sm"
                                  colorScheme="orange"
                                  flex={1}
                                >
                                  Pause
                                </Button>
                                <Button
                                  leftIcon={<FiCheckCircle />}
                                  onClick={() => {
                                    setSelectedTask(task);
                                    onCompleteModalOpen();
                                  }}
                                  size="sm"
                                  colorScheme="blue"
                                  flex={1}
                                >
                                  Complete
                                </Button>
                              </>
                            )}

                            <Menu>
                              <MenuButton as={IconButton} icon={<FiMoreVertical />} size="sm" variant="outline" />
                              <MenuList>
                                <MenuItem
                                  icon={<FiClock />}
                                  onClick={() => {
                                    setSelectedTask(task);
                                    onTimeLogModalOpen();
                                  }}
                                >
                                  Log Time
                                </MenuItem>
                                <MenuItem
                                  icon={<FiEdit />}
                                  onClick={() => {
                                    setSelectedTask(task);
                                    onCommentModalOpen();
                                  }}
                                >
                                  Add Comment
                                </MenuItem>
                                <MenuDivider />
                                <MenuItem
                                  icon={<FiEye />}
                                  onClick={() => {
                                    setSelectedTask(task);
                                    // View task details
                                  }}
                                >
                                  View Details
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}

              {/* Empty State */}
              {!loading && filteredTasks.length === 0 && (
                <Center py={20}>
                  <VStack spacing={4}>
                    <FiCheckCircle size={64} color="gray.400" />
                    <VStack spacing={2}>
                      <Heading size="md" color={textColor}>
                        No tasks found
                      </Heading>
                      <Text color={mutedColor}>
                        {filters.status !== 'all' || filters.priority !== 'all' || filters.stage !== 'all'
                          ? "Try adjusting your filters"
                          : "You don't have any tasks assigned yet"
                        }
                      </Text>
                    </VStack>
                  </VStack>
                </Center>
              )}
            </TabPanel>

            {/* All Tasks Panel */}
            <TabPanel px={0}>
              <Card bg={cardBg} border="1px solid" borderColor={borderColor} mb={6}>
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">All Tasks</Heading>
                    <Button
                      leftIcon={<FiDownload />}
                      onClick={fetchAllTasks}
                      size="sm"
                      variant="outline"
                      isLoading={loadingAllTasks}
                    >
                      Refresh
                    </Button>
                  </Flex>
                </CardHeader>
                <CardBody>
                  {loadingAllTasks ? (
                    <Center py={20}>
                      <VStack>
                        <Spinner size="xl" color="blue.500" thickness="4px" />
                        <Text color={mutedColor}>Loading all tasks...</Text>
                      </VStack>
                    </Center>
                  ) : (
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Task Name</Th>
                            <Th>Assigned To</Th>
                            <Th>Related Lead</Th>
                            <Th>Status</Th>
                            <Th>Priority</Th>
                            <Th>Due Date</Th>
                            <Th>Created At</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {allTasks.length === 0 ? (
                            <Tr>
                              <Td colSpan={7} textAlign="center" py={10}>
                                <VStack spacing={2}>
                                  <Text color={mutedColor}>No tasks found</Text>
                                </VStack>
                              </Td>
                            </Tr>
                          ) : (
                            allTasks.map((task) => (
                              <Tr key={task._id} _hover={{ bg: 'gray.50' }}>
                                <Td>
                                  <VStack align="start" spacing={1}>
                                    <Text fontWeight="medium">{task.name}</Text>
                                    {task.description && (
                                      <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                                        {task.description}
                                      </Text>
                                    )}
                                  </VStack>
                                </Td>
                                <Td>
                                  {task.assignedTo ? (
                                    <Text fontSize="sm">
                                      {typeof task.assignedTo === 'object' 
                                        ? task.assignedTo.name || task.assignedTo.email || 'Unknown'
                                        : 'Unknown'}
                                    </Text>
                                  ) : (
                                    <Text fontSize="sm" color={mutedColor}>Unassigned</Text>
                                  )}
                                </Td>
                                <Td>
                                  {task.relatedLead ? (
                                    <Text fontSize="sm">
                                      {typeof task.relatedLead === 'object'
                                        ? task.relatedLead.name || task.relatedLead.email || 'Unknown'
                                        : 'Unknown'}
                                    </Text>
                                  ) : (
                                    <Text fontSize="sm" color={mutedColor}>No Lead</Text>
                                  )}
                                </Td>
                                <Td>
                                  <Badge colorScheme={getStatusColor(task.status)} size="sm">
                                    {task.status}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Badge colorScheme={getPriorityColor(task.priority)} size="sm">
                                    {task.priority}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Text fontSize="sm">{formatDate(task.dueDate)}</Text>
                                </Td>
                                <Td>
                                  <Text fontSize="sm" color={mutedColor}>
                                    {formatDateTime(task.createdAt)}
                                  </Text>
                                </Td>
                              </Tr>
                            ))
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>

      </Container>

      {/* Time Log Modal */}
      <Modal isOpen={isTimeLogModalOpen} onClose={onTimeLogModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log Time</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Start Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={timeLogData.startTime}
                  onChange={(e) => setTimeLogData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>End Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={timeLogData.endTime}
                  onChange={(e) => setTimeLogData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={timeLogData.description}
                  onChange={(e) => setTimeLogData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What did you work on?"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTimeLogModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={logTime}>
              Log Time
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Comment Modal */}
      <Modal isOpen={isCommentModalOpen} onClose={onCommentModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Comment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Comment</FormLabel>
              <Textarea
                value={commentData.content}
                onChange={(e) => setCommentData({ content: e.target.value })}
                placeholder="Add your comment here..."
                rows={4}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCommentModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={addComment}>
              Add Comment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Complete Task Modal */}
      <Modal isOpen={isCompleteModalOpen} onClose={onCompleteModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Complete Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Completion Notes</FormLabel>
                <Textarea
                  value={completionData.completionNotes}
                  onChange={(e) => setCompletionData(prev => ({ ...prev, completionNotes: e.target.value }))}
                  placeholder="Describe what was accomplished..."
                  rows={3}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Actual Hours</FormLabel>
                <NumberInput
                  value={completionData.actualHours}
                  onChange={(value) => setCompletionData(prev => ({ ...prev, actualHours: parseFloat(value) || 0 }))}
                  min={0}
                  step={0.5}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Outcome</FormLabel>
                <Select
                  value={completionData.outcome}
                  onChange={(e) => setCompletionData(prev => ({ ...prev, outcome: e.target.value }))}
                >
                  <option value="SUCCESS">Success</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Quality Rating (1-5)</FormLabel>
                <NumberInput
                  value={completionData.qualityRating}
                  onChange={(value) => setCompletionData(prev => ({ ...prev, qualityRating: parseInt(value) || 5 }))}
                  min={1}
                  max={5}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Feedback</FormLabel>
                <Textarea
                  value={completionData.feedback}
                  onChange={(e) => setCompletionData(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="Any additional feedback..."
                  rows={2}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCompleteModalClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={completeTask}>
              Complete Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default StaffTaskManagement;

