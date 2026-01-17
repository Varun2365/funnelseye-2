import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Divider,
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
  Switch,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Icon,
  Flex,
  Spinner,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  Tooltip,
  IconButton,
  Avatar,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react';
import {
  FiUsers,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiEye,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiInfo,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiTrendingUp,
  FiSettings,
} from 'react-icons/fi';
import { subscriptionAPI } from '../../services/subscriptionAPI';

const CouchUpdate = () => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // State management
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  
  // Modal states
  const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
  
  // Form states
  const [updateForm, setUpdateForm] = useState({
    planId: '',
    status: 'active',
    paymentData: {
      status: 'paid',
      gateway: 'stripe',
      transactionId: '',
    },
    notes: '',
  });

  const [assignForm, setAssignForm] = useState({
    coachId: '',
    planId: '',
    paymentData: {
      status: 'paid',
      gateway: 'stripe',
      transactionId: '',
    },
    notes: '',
  });

  // Load coaches data
  useEffect(() => {
    loadCoachesData();
  }, []);

  const loadCoachesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data from real API
      let coachesData, subscriptionsData;
      
      [coachesData, subscriptionsData] = await Promise.all([
        subscriptionAPI.getAllSubscriptions({ includeCoach: true }),
        subscriptionAPI.getAnalytics(),
      ]);
      
      setCoaches(coachesData.data || []);
      setSubscriptionData(subscriptionsData.data);
      
    } catch (err) {
      console.error('Error loading coaches data:', err);
      setError(err.message);
      toast({
        title: 'Error loading coaches data',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle coach subscription update
  const handleUpdateSubscription = async () => {
    try {
      if (!selectedCoach || !updateForm.planId) {
        toast({
          title: 'Please select a coach and plan',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await subscriptionAPI.updateCoachSubscription(selectedCoach.coachId._id, {
        planId: updateForm.planId,
        status: updateForm.status,
        paymentData: updateForm.paymentData,
        notes: updateForm.notes,
      });

      toast({
        title: 'Coach subscription updated successfully!',
        description: `Subscription updated for ${selectedCoach.coachId.name}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Update local state
      setCoaches(prev => prev.map(coach => 
        coach._id === selectedCoach._id 
          ? { ...coach, ...response.data }
          : coach
      ));
      
      onUpdateClose();
      loadCoachesData();
      
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle new coach subscription assignment
  const handleAssignSubscription = async () => {
    try {
      if (!assignForm.coachId || !assignForm.planId) {
        toast({
          title: 'Please select a coach and plan',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await subscriptionAPI.subscribe({
        coachId: assignForm.coachId,
        planId: assignForm.planId,
        paymentData: assignForm.paymentData,
        notes: assignForm.notes,
      });

      toast({
        title: 'Subscription assigned successfully!',
        description: 'New subscription has been created for the coach.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onAssignClose();
      loadCoachesData();
      
    } catch (err) {
      toast({
        title: 'Assignment failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
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

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Open update modal
  const openUpdateModal = (coach) => {
    setSelectedCoach(coach);
    setUpdateForm({
      planId: coach.planId._id,
      status: coach.status,
      paymentData: {
        status: coach.billing?.paymentStatus || 'paid',
        gateway: coach.billing?.paymentMethod || 'stripe',
        transactionId: '',
      },
      notes: '',
    });
    onUpdateOpen();
  };

  // Open view modal
  const openViewModal = (coach) => {
    setSelectedCoach(coach);
    onViewOpen();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading coaches data...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error loading coaches data!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Box p={6} bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                Coach Subscription Management
              </Text>
              <Text color="gray.600">
                Update and manage coach subscriptions
              </Text>
            </Box>
            <HStack spacing={3}>
              <Button
                leftIcon={<FiRefreshCw />}
                onClick={loadCoachesData}
                variant="outline"
                size="sm"
              >
                Refresh
              </Button>
              <Button
                leftIcon={<FiPlus />}
                onClick={onAssignOpen}
                colorScheme="blue"
                size="sm"
              >
                Assign Subscription
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Statistics Overview */}
        {subscriptionData && (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Coaches</StatLabel>
                  <StatNumber color="blue.500">
                    {subscriptionData.totalSubscriptions}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Active subscriptions
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Active Subscriptions</StatLabel>
                  <StatNumber color="green.500">
                    {subscriptionData.activeSubscriptions}
                  </StatNumber>
                  <StatHelpText>
                    Currently active
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Monthly Revenue</StatLabel>
                  <StatNumber color="purple.500">
                    {formatCurrency(subscriptionData.monthlyRevenue)}
                  </StatNumber>
                  <StatHelpText>
                    This month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Churn Rate</StatLabel>
                  <StatNumber color="orange.500">
                    {subscriptionData.churnRate}%
                  </StatNumber>
                  <StatHelpText>
                    Monthly churn
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </Grid>
        )}

        {/* Coaches Table */}
        <Card>
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={FiUsers} boxSize={6} color="blue.500" />
              <Box>
                <Text fontSize="lg" fontWeight="semibold">
                  Coach Subscriptions
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Manage all coach subscriptions and their details
                </Text>
              </Box>
            </HStack>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Coach</Th>
                    <Th>Plan</Th>
                    <Th>Status</Th>
                    <Th>Billing</Th>
                    <Th>Usage</Th>
                    <Th>Next Billing</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {coaches.map((coach) => (
                    <Tr key={coach._id}>
                      <Td>
                        <HStack spacing={3}>
                          <Avatar
                            size="sm"
                            name={coach.coachId?.name}
                            src={coach.coachId?.avatar}
                          />
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm">
                              {coach.coachId?.name}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {coach.coachId?.email}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {coach.coachId?.company}
                            </Text>
                          </Box>
                        </HStack>
                      </Td>
                      <Td>
                        <Box>
                          <Text fontWeight="semibold" fontSize="sm">
                            {coach.planId?.name}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {formatCurrency(coach.planId?.price?.amount)}
                            /{coach.planId?.price?.billingCycle}
                          </Text>
                        </Box>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(coach.status)}
                          fontSize="xs"
                          px={2}
                          py={1}
                        >
                          {coach.status?.toUpperCase()}
                        </Badge>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs">
                            {formatCurrency(coach.billing?.amount)}
                          </Text>
                          <Badge
                            colorScheme={coach.billing?.paymentStatus === 'paid' ? 'green' : 'red'}
                            size="sm"
                            fontSize="xs"
                          >
                            {coach.billing?.paymentStatus}
                          </Badge>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs">
                            Funnels: {coach.usage?.currentFunnels || 0}/{coach.features?.maxFunnels || 0}
                          </Text>
                          <Text fontSize="xs">
                            Leads: {coach.usage?.currentLeads || 0}/{coach.features?.maxLeads || 0}
                          </Text>
                          <Text fontSize="xs">
                            Staff: {coach.usage?.currentStaff || 0}/{coach.features?.maxStaff || 0}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="xs" color="gray.600">
                          {formatDate(coach.billing?.nextBillingDate)}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="View Details">
                            <IconButton
                              icon={<FiEye />}
                              size="sm"
                              variant="ghost"
                              onClick={() => openViewModal(coach)}
                            />
                          </Tooltip>
                          <Tooltip label="Update Subscription">
                            <IconButton
                              icon={<FiEdit />}
                              size="sm"
                              variant="ghost"
                              onClick={() => openUpdateModal(coach)}
                            />
                          </Tooltip>
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

      {/* Update Subscription Modal */}
      <Modal isOpen={isUpdateOpen} onClose={onUpdateClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Coach Subscription</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {selectedCoach && (
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Updating subscription for:</AlertTitle>
                    <AlertDescription>
                      {selectedCoach.coachId?.name} ({selectedCoach.coachId?.email})
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              
              <FormControl>
                <FormLabel>Subscription Status</FormLabel>
                <Select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Payment Status</FormLabel>
                <Select
                  value={updateForm.paymentData.status}
                  onChange={(e) => setUpdateForm(prev => ({ 
                    ...prev, 
                    paymentData: { ...prev.paymentData, status: e.target.value }
                  }))}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Payment Gateway</FormLabel>
                <Select
                  value={updateForm.paymentData.gateway}
                  onChange={(e) => setUpdateForm(prev => ({ 
                    ...prev, 
                    paymentData: { ...prev.paymentData, gateway: e.target.value }
                  }))}
                >
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                  <option value="razorpay">Razorpay</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Transaction ID</FormLabel>
                <Input
                  value={updateForm.paymentData.transactionId}
                  onChange={(e) => setUpdateForm(prev => ({ 
                    ...prev, 
                    paymentData: { ...prev.paymentData, transactionId: e.target.value }
                  }))}
                  placeholder="Enter transaction ID"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this update..."
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUpdateClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleUpdateSubscription}>
              Update Subscription
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Coach Subscription Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedCoach && (
              <VStack spacing={6} align="stretch">
                {/* Coach Information */}
                <Card>
                  <CardHeader>
                    <HStack spacing={3}>
                      <Avatar
                        size="md"
                        name={selectedCoach.coachId?.name}
                        src={selectedCoach.coachId?.avatar}
                      />
                      <Box>
                        <Text fontSize="lg" fontWeight="semibold">
                          {selectedCoach.coachId?.name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {selectedCoach.coachId?.email}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {selectedCoach.coachId?.company}
                        </Text>
                      </Box>
                    </HStack>
                  </CardHeader>
                </Card>

                {/* Subscription Details */}
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <Card>
                    <CardHeader>
                      <Text fontSize="md" fontWeight="semibold">Plan Details</Text>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Plan Name:</Text>
                          <Text fontSize="sm" fontWeight="semibold">
                            {selectedCoach.planId?.name}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Price:</Text>
                          <Text fontSize="sm" fontWeight="semibold">
                            {formatCurrency(selectedCoach.planId?.price?.amount)}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Billing Cycle:</Text>
                          <Text fontSize="sm" fontWeight="semibold">
                            {selectedCoach.planId?.price?.billingCycle}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Status:</Text>
                          <Badge colorScheme={getStatusColor(selectedCoach.status)}>
                            {selectedCoach.status?.toUpperCase()}
                          </Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Text fontSize="md" fontWeight="semibold">Billing Information</Text>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Amount:</Text>
                          <Text fontSize="sm" fontWeight="semibold">
                            {formatCurrency(selectedCoach.billing?.amount)}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Payment Status:</Text>
                          <Badge
                            colorScheme={selectedCoach.billing?.paymentStatus === 'paid' ? 'green' : 'red'}
                          >
                            {selectedCoach.billing?.paymentStatus}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Payment Method:</Text>
                          <Text fontSize="sm" fontWeight="semibold">
                            {selectedCoach.billing?.paymentMethod}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Next Billing:</Text>
                          <Text fontSize="sm" fontWeight="semibold">
                            {formatDate(selectedCoach.billing?.nextBillingDate)}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>

                {/* Usage Statistics */}
                <Card>
                  <CardHeader>
                    <Text fontSize="md" fontWeight="semibold">Usage Statistics</Text>
                  </CardHeader>
                  <CardBody>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>Funnels</Text>
                        <Progress
                          value={(selectedCoach.usage?.currentFunnels || 0) / (selectedCoach.features?.maxFunnels || 1) * 100}
                          colorScheme="blue"
                          size="sm"
                          borderRadius="md"
                        />
                        <Text fontSize="xs" mt={1}>
                          {selectedCoach.usage?.currentFunnels || 0} / {selectedCoach.features?.maxFunnels || 0}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>Leads</Text>
                        <Progress
                          value={(selectedCoach.usage?.currentLeads || 0) / (selectedCoach.features?.maxLeads || 1) * 100}
                          colorScheme="green"
                          size="sm"
                          borderRadius="md"
                        />
                        <Text fontSize="xs" mt={1}>
                          {selectedCoach.usage?.currentLeads || 0} / {selectedCoach.features?.maxLeads || 0}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>Staff</Text>
                        <Progress
                          value={(selectedCoach.usage?.currentStaff || 0) / (selectedCoach.features?.maxStaff || 1) * 100}
                          colorScheme="purple"
                          size="sm"
                          borderRadius="md"
                        />
                        <Text fontSize="xs" mt={1}>
                          {selectedCoach.usage?.currentStaff || 0} / {selectedCoach.features?.maxStaff || 0}
                        </Text>
                      </Box>
                    </Grid>
                  </CardBody>
                </Card>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onViewClose}>
              Close
            </Button>
            <Button colorScheme="blue" onClick={() => {
              onViewClose();
              openUpdateModal(selectedCoach);
            }}>
              Update Subscription
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Assign Subscription Modal */}
      <Modal isOpen={isAssignOpen} onClose={onAssignClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign New Subscription</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Assign New Subscription</AlertTitle>
                  <AlertDescription>
                    Create a new subscription for a coach.
                  </AlertDescription>
                </Box>
              </Alert>
              
              <FormControl>
                <FormLabel>Coach ID</FormLabel>
                <Input
                  value={assignForm.coachId}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, coachId: e.target.value }))}
                  placeholder="Enter coach ID"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Payment Status</FormLabel>
                <Select
                  value={assignForm.paymentData.status}
                  onChange={(e) => setAssignForm(prev => ({ 
                    ...prev, 
                    paymentData: { ...prev.paymentData, status: e.target.value }
                  }))}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Payment Gateway</FormLabel>
                <Select
                  value={assignForm.paymentData.gateway}
                  onChange={(e) => setAssignForm(prev => ({ 
                    ...prev, 
                    paymentData: { ...prev.paymentData, gateway: e.target.value }
                  }))}
                >
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                  <option value="razorpay">Razorpay</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Transaction ID</FormLabel>
                <Input
                  value={assignForm.paymentData.transactionId}
                  onChange={(e) => setAssignForm(prev => ({ 
                    ...prev, 
                    paymentData: { ...prev.paymentData, transactionId: e.target.value }
                  }))}
                  placeholder="Enter transaction ID"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this assignment..."
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAssignClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAssignSubscription}>
              Assign Subscription
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CouchUpdate;
