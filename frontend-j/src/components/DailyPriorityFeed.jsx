import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Icon,
  Card,
  CardBody,
  useColorModeValue,
  Flex,
  Spinner,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Avatar,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Modal,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  SimpleGrid,
  IconButton,
} from '@chakra-ui/react';
import {
  FaBell,
  FaCalendar,
  FaUser,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaFire,
  FaInfoCircle,
  FaArrowRight,
  FaFilter,
  FaSyncAlt,
  FaEye,
  FaEdit,
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaTasks,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { FiMoreVertical, FiRefreshCw, FiCopy, FiExternalLink } from 'react-icons/fi';

import { API_BASE_URL } from '../config/apiConfig';

const DailyPriorityFeed = ({ token, coachId, onItemClick }) => {
  const navigate = useNavigate();
  const toast = useToast();
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  
  // State
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Priority colors and styles
  const getPriorityConfig = (priority) => {
    if (priority === 0) return { color: 'purple', bg: 'purple.50', border: 'purple.200', darkBg: 'purple.900', darkBorder: 'purple.700' };
    if (priority <= 1) return { color: 'red', bg: 'red.50', border: 'red.200', darkBg: 'red.900', darkBorder: 'red.700' };
    if (priority <= 1.5) return { color: 'orange', bg: 'orange.50', border: 'orange.200', darkBg: 'orange.900', darkBorder: 'orange.700' };
    if (priority <= 2) return { color: 'yellow', bg: 'yellow.50', border: 'yellow.200', darkBg: 'yellow.900', darkBorder: 'yellow.700' };
    if (priority <= 3) return { color: 'blue', bg: 'blue.50', border: 'blue.200', darkBg: 'blue.900', darkBorder: 'blue.700' };
    return { color: 'gray', bg: 'gray.50', border: 'gray.200', darkBg: 'gray.900', darkBorder: 'gray.700' };
  };
  
  // Type icons and colors
  const getTypeConfig = (type) => {
    const configs = {
      'Appointment': { icon: FaCalendar, color: 'purple', label: 'Appointment' },
      'Overdue Follow-up': { icon: FaExclamationTriangle, color: 'red', label: 'Overdue' },
      'New Lead': { icon: FaUser, color: 'green', label: 'New Lead' },
      'Follow-up Today': { icon: FaClock, color: 'yellow', label: 'Today' },
      'New Hot Lead': { icon: FaFire, color: 'orange', label: 'Hot Lead' },
      'Stale Lead - Re-engage': { icon: FaUser, color: 'gray', label: 'Re-engage' },
      'Recent Lead': { icon: FaUser, color: 'blue', label: 'Recent Lead' },
    };
    return configs[type] || { icon: FaBell, color: 'gray', label: type };
  };

  
  // Helper to truncate text for concise rows
  const truncate = (text, len = 80) => {
    if (!text) return '';
    if (text.length <= len) return text;
    return text.slice(0, len - 1).trimEnd() + '…';
  };
  // Load feed data
  const loadFeed = async (isRefresh = false) => {
    if (!token || !coachId) return;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/coach/daily-feed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Coach-ID': coachId,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setFeedItems(data.data || []);
        } else {
          setFeedItems([]);
        }
      } else {
        console.error('Failed to load daily feed:', response.status);
        setFeedItems([]);
      }
    } catch (error) {
      console.error('Error loading daily feed:', error);
      setFeedItems([]);
      toast({
        title: 'Error',
        description: 'Failed to load daily priority feed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadFeed();
  }, [token, coachId]);

  const filterLabel = filter === 'all' ? 'All' : filter === 'appointments' ? 'Appointments' : filter === 'followups' ? 'Follow-ups' : filter === 'leads' ? 'Leads' : 'Alerts';

  // Supported types (used in the tooltip legend)
  const supportedTypes = [
    'Appointment',
    'Overdue Follow-up',
    'New Lead',
    'Follow-up Today',
    'New Hot Lead',
    'Stale Lead - Re-engage',
    'Recent Lead',
  ];

  // Build tab options dynamically from available feed data (only show tabs that have items)
  const availableTabKeys = ['all'];
  if (feedItems.some(item => item.type === 'Appointment')) availableTabKeys.push('appointments');
  if (feedItems.some(item => (item.type || '').includes('Follow-up'))) availableTabKeys.push('followups');
  if (feedItems.some(item => (item.type || '').includes('Lead'))) availableTabKeys.push('leads');
  if (feedItems.some(item => typeof item.priority === 'number' && item.priority <= 1.5)) availableTabKeys.push('alerts');

  const tabOptions = availableTabKeys.map(key => ({
    key,
    label: key === 'all' ? 'All' : key === 'appointments' ? 'Appointments' : key === 'followups' ? 'Follow-ups' : key === 'leads' ? 'Leads' : 'Alerts'
  }));
  // Filter items based on active tab/filter
  const filteredItems = feedItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'appointments') return item.type === 'Appointment';
    if (filter === 'followups') return (item.type || '').includes('Follow-up');
    if (filter === 'leads') return (item.type || '').includes('Lead');
    if (filter === 'alerts') return item.priority <= 1.5;
    return true;
  });
  const groupedItems = filteredItems.reduce((acc, item) => {
    const priorityGroup = item.priority <= 1 ? 'urgent' :
                         item.priority <= 2 ? 'high' :
                         item.priority <= 3 ? 'medium' : 'low';
    if (!acc[priorityGroup]) acc[priorityGroup] = [];
    acc[priorityGroup].push(item);
    return acc;
  }, {});
  
  // Handle item click
  const handleItemClick = (item, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setSelectedItem(item);
    onOpen();
  };
  
  // Handle action
  const handleAction = (item, action) => {
    onClose();
    
    switch (action) {
      case 'view-lead':
        if (item.leadId) {
          navigate(`/dashboard/leads?leadId=${item.leadId}`);
        }
        break;
      case 'view-appointment':
        if (item.appointmentId) {
          navigate(`/dashboard/calendar?appointmentId=${item.appointmentId}`);
        }
        break;
      case 'create-task':
        navigate(`/dashboard/tasks?create=true&relatedLead=${item.leadId || ''}`);
        break;
      case 'send-message':
        if (item.leadId) {
          navigate(`/dashboard/inbox?leadId=${item.leadId}`);
        }
        break;
      default:
        break;
    }
  };
  
  if (loading) {
    return (
      <Box w="100%" h="100%" display="flex" alignItems="center" justifyContent="center" p={6}>
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Box>
    );
  }
  
  return (
    <>
      <VStack align="stretch" spacing={0} w="100%" h="100%">
        {/* Heading Section */}
        <Box pb={3} borderBottom="1px solid" borderColor={borderColor}>
          <Text fontSize="xl" fontWeight="bold" color={textColor} mb={1}>
            Daily Priority Feed
          </Text>
          <Text fontSize="sm" color={mutedTextColor}>
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} requiring attention
          </Text>
        </Box>

        {/* Controls Bar */}
        <Box pt={3} pb={3} borderBottom="1px solid" borderColor={borderColor}>
          <HStack spacing={3} justify="flex-start">
            <Popover placement="bottom-start" trigger="click">
              <PopoverTrigger>
                <IconButton
                  aria-label="Feed types"
                  icon={<Icon as={FaInfoCircle} />}
                  size="sm"
                  variant="ghost"
                  _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                />
              </PopoverTrigger>
              <PopoverContent w="auto" boxShadow="md" border="1px" borderColor={borderColor}>
                <PopoverBody p={4}>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="xs" fontWeight="600" color={mutedTextColor} textTransform="uppercase" letterSpacing="0.5px">
                      Feed Types
                    </Text>
                    <Divider my={1} />
                    {supportedTypes.map((type, idx) => (
                      <HStack key={idx} spacing={2} w="100%">
                        <Box w={2} h={2} borderRadius="full" bg="brand.600" />
                        <Text fontSize="sm" color={textColor}>{type}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
            <Tabs
              index={Math.max(0, tabOptions.findIndex(t => t.key === filter))}
              onChange={(idx) => setFilter(tabOptions[idx]?.key || 'all')}
              variant="line"
              colorScheme="brand"
            >
              <TabList mb={0} borderBottom="none" display="flex" gap={4}>
                {tabOptions.map(t => (
                  <Tab
                    key={t.key}
                    px={0}
                    py={1}
                    fontSize="sm"
                    fontWeight="500"
                    whiteSpace="nowrap"
                    _selected={{ color: 'brand.600', borderBottom: '2px solid', borderColor: 'brand.600' }}
                  >
                    {t.label}
                  </Tab>
                ))}
              </TabList>
            </Tabs>
            <Box ml="auto">
              <IconButton
                icon={refreshing ? <Spinner size="xs" /> : <FiRefreshCw />}
                size="sm"
                variant="ghost"
                onClick={() => loadFeed(true)}
                isLoading={refreshing}
                aria-label="Refresh feed"
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              />
            </Box>
          </HStack>
        </Box>

        {/* Feed Items */}
        <Box 
          flex={1} 
          overflowY="auto"
          pt={2}
          pr={3}
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: useColorModeValue('#cbd5e0', '#4a5568'),
              borderRadius: '2px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: useColorModeValue('#a0aec0', '#718096'),
            },
            '&::-webkit-scrollbar-button': {
              display: 'none',
            },
          }}
        >
          {filteredItems.length > 0 ? (
            <VStack spacing={0} align="stretch" divider={<Divider />}>
              {filteredItems.map((item, index) => {
                const priorityConfig = getPriorityConfig(item.priority);
                const typeConfig = getTypeConfig(item.type);
                const TypeIcon = typeConfig.icon;
                
                return (
                  <Box
                    key={index}
                    py={4}
                    px={2}
                    _hover={{ 
                      bg: hoverBg,
                    }}
                    transition="all 0.15s"
                    cursor="pointer"
                    onClick={(e) => handleItemClick(item, e)}
                  >
                    <HStack spacing={3} align="start">
                      {/* Icon */}
                      <Icon 
                        as={TypeIcon} 
                        boxSize={5} 
                        color={`${typeConfig.color}.500`}
                        mt={0.5}
                      />
                      
                      {/* Content */}
                      <VStack align="start" spacing={1.5} flex={1}>
                        {/* Compact row: single-line meta on left, single badge on right (no per-row title) */}
                        <HStack justify="space-between" w="100%">
                          <Text fontSize="sm" color={textColor} fontWeight="500" isTruncated maxW="75%">
                            {truncate(item.leadName || item.leadEmail || item.leadPhone || item.description, 80)}
                          </Text>
                          <Badge 
                            colorScheme={typeConfig.color} 
                            variant="subtle"
                            fontSize="xs"
                            px={2}
                            py={0.5}
                          >
                            {typeConfig.label}
                          </Badge>
                        </HStack>

                        {/* Next Best Actions */}
                        {item.nextBestActions && item.nextBestActions.length > 0 && (
                          <VStack align="start" spacing={0.5} pl={3} w="100%" mt={1}>
                            {item.nextBestActions.slice(0, 2).map((action, idx) => (
                              <HStack key={idx} spacing={2} fontSize="xs" color={mutedTextColor}>
                                <Box w={1} h={1} borderRadius="full" bg={mutedTextColor} />
                                <Text>{action}</Text>
                              </HStack>
                            ))}
                          </VStack>
                        )}
                      </VStack>
                      
                      {/* Arrow */}
                      <Icon 
                        as={FaArrowRight} 
                        color={mutedTextColor}
                        boxSize={3}
                        opacity={0.5}
                        mt={0.5}
                      />
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          ) : (
            <Box textAlign="center" py={16}>
              <Icon as={FaCheckCircle} boxSize={16} color="green.300" mb={4} />
              <Text color={textColor} fontWeight="semibold" fontSize="lg" mb={2}>
                All caught up!
              </Text>
              <Text fontSize="sm" color={mutedTextColor}>
                No priority items requiring attention. Great job staying on top of everything!
              </Text>
            </Box>
          )}
        </Box>
      </VStack>
      
      {/* Item Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl" boxShadow="2xl" bg={cardBg} maxH="60vh">
          <Box p={6} h="100%" overflowY="auto">
            {/* Header */}
            <Box mb={6} pb={6} borderBottom="1px solid" borderColor={borderColor}>
              <HStack spacing={3} align="start">
                {selectedItem && (() => {
                  const typeConfig = getTypeConfig(selectedItem.type);
                  const TypeIcon = typeConfig.icon;
                  return (
                    <Icon 
                      as={TypeIcon} 
                      boxSize={6} 
                      color={`${typeConfig.color}.500`}
                      flexShrink={0}
                    />
                  );
                })()}
                <Box flex={1}>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    {selectedItem?.leadName || selectedItem?.title?.split('with')[0]?.trim() || selectedItem?.type}
                  </Text>
                  <Text fontSize="sm" color={mutedTextColor} mt={1}>
                    {selectedItem?.type}
                  </Text>
                </Box>
              </HStack>
            </Box>

            {selectedItem && (
              <Box>
                {/* Description Section */}
                {selectedItem.description && (
                  <Box mb={6}>
                    <Text color={textColor} fontSize="sm" lineHeight="1.6">
                      {selectedItem.description}
                    </Text>
                  </Box>
                )}
                
                {/* Content in Three Columns */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="100%">
                  {/* Contact Information */}
                  {(selectedItem.leadName || selectedItem.leadEmail || selectedItem.leadPhone) && (
                    <Box>
                      <Text fontSize="xs" color={mutedTextColor} textTransform="uppercase" fontWeight="600" letterSpacing="0.5px" mb={3}>
                        Contact Details
                      </Text>
                      <VStack align="start" spacing={2.5}>
                        {selectedItem.leadName && (
                          <Box>
                            <Text fontSize="xs" color={mutedTextColor} mb={1}>Name</Text>
                            <Text fontSize="sm" color={textColor} fontWeight="500">{selectedItem.leadName}</Text>
                          </Box>
                        )}
                        {selectedItem.leadEmail && (
                          <Box>
                            <Text fontSize="xs" color={mutedTextColor} mb={1}>Email</Text>
                            <Text fontSize="sm" color={textColor}>{selectedItem.leadEmail}</Text>
                          </Box>
                        )}
                        {selectedItem.leadPhone && (
                          <Box>
                            <Text fontSize="xs" color={mutedTextColor} mb={1}>Phone</Text>
                            <Text fontSize="sm" color={textColor}>{selectedItem.leadPhone}</Text>
                          </Box>
                        )}
                        {(selectedItem.city || selectedItem.country) && (
                          <Box>
                            <Text fontSize="xs" color={mutedTextColor} mb={1}>Location</Text>
                            <Text fontSize="sm" color={textColor}>{[selectedItem.city, selectedItem.country].filter(Boolean).join(', ')}</Text>
                          </Box>
                        )}
                      </VStack>
                    </Box>
                  )}
                  
                  {/* Schedule Section */}
                  {(selectedItem.formattedTime || selectedItem.formattedDate || selectedItem.startTime) && (
                    <Box>
                      <Text fontSize="xs" color={mutedTextColor} textTransform="uppercase" fontWeight="600" letterSpacing="0.5px" mb={3}>
                        Schedule
                      </Text>
                      <VStack align="start" spacing={2}>
                        {(selectedItem.formattedDate || selectedItem.formattedTime) && (
                          <Box>
                            <Text fontSize="xs" color={mutedTextColor} mb={1}>Date & Time</Text>
                            <Text fontSize="sm" color={textColor}>
                              {selectedItem.formattedDate} {selectedItem.formattedTime ? `at ${selectedItem.formattedTime}` : ''}
                            </Text>
                          </Box>
                        )}
                        {selectedItem.duration && (
                          <Box>
                            <Text fontSize="xs" color={mutedTextColor} mb={1}>Duration</Text>
                            <Text fontSize="sm" color={textColor}>{selectedItem.duration} minutes</Text>
                          </Box>
                        )}
                      </VStack>
                    </Box>
                  )}
                  
                  {/* Additional Info Section */}
                  {(selectedItem.status || selectedItem.source || selectedItem.leadTemperature || selectedItem.overdueBy) && (
                    <Box>
                      <Text fontSize="xs" color={mutedTextColor} textTransform="uppercase" fontWeight="600" letterSpacing="0.5px" mb={3}>
                        Details
                      </Text>
                      <VStack align="start" spacing={2}>
                        {selectedItem.status && (
                          <Box>
                            <Text fontSize="xs" color={mutedTextColor} mb={1}>Status</Text>
                            <Badge colorScheme="brand" fontSize="xs" px={2} py={1}>
                              {selectedItem.status}
                            </Badge>
                          </Box>
                        )}
                        {selectedItem.source && (
                          <Box>
                            <Text fontSize="xs" color={mutedTextColor} mb={1}>Source</Text>
                            <Text fontSize="sm" color={textColor}>{selectedItem.source}</Text>
                          </Box>
                        )}
                        {selectedItem.leadTemperature && (
                          <Box>
                            <Text fontSize="xs" color={mutedTextColor} mb={1}>Temperature</Text>
                            <Badge colorScheme={selectedItem.leadTemperature === 'Hot' ? 'orange' : selectedItem.leadTemperature === 'Warm' ? 'yellow' : 'blue'} fontSize="xs" px={2} py={1}>
                              {selectedItem.leadTemperature}
                            </Badge>
                          </Box>
                        )}
                        {selectedItem.overdueBy && (
                          <Box>
                            <Text fontSize="xs" color={mutedTextColor} mb={1}>Overdue Since</Text>
                            <Text fontSize="sm" color="red.500" fontWeight="500">{selectedItem.overdueBy}</Text>
                          </Box>
                        )}
                      </VStack>
                    </Box>
                  )}
                </SimpleGrid>
              </Box>
            )}

            {/* Action Buttons */}
            <HStack spacing={3} mt={8} pt={6} borderTop="1px solid" borderColor={borderColor}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                flex={1}
                fontWeight="500"
                borderRadius="7px"
              >
                Close
              </Button>
              {selectedItem?.appointmentId && (
                <Button
                  colorScheme="brand"
                  size="sm"
                  onClick={() => handleAction(selectedItem, 'view-appointment')}
                  flex={1}
                  fontWeight="500"
                  borderRadius="7px"
                >
                  View
                </Button>
              )}
              {selectedItem?.leadId && (
                <Button
                  colorScheme="brand"
                  size="sm"
                  onClick={() => handleAction(selectedItem, 'send-message')}
                  flex={1}
                  fontWeight="500"
                  borderRadius="7px"
                >
                  Message
                </Button>
              )}
            </HStack>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DailyPriorityFeed;
