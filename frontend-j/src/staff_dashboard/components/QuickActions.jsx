import React, { useState } from 'react';
import {
  Box,
  Button,
  Icon,
  HStack,
  VStack,
  useColorModeValue,
  Tooltip,
  Wrap,
  WrapItem,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Textarea,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Checkbox,
  CheckboxGroup,
  Stack,
  Radio,
  RadioGroup,
  Text,
  Badge,
  Card,
  CardBody,
  Divider,
  Flex,
  Spacer,
  Avatar,
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
} from 'react-icons/fi';

const QuickActions = ({ data }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const shadowColor = useColorModeValue('sm', 'dark-lg');
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  const toast = useToast();
  
  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  
  // Modal states
  const { isOpen: isActionModalOpen, onOpen: onActionModalOpen, onClose: onActionModalClose } = useDisclosure();

  const quickActions = data || [];

  // Default quick actions if none provided
  const defaultActions = [
    { name: 'View Tasks', action: 'view_tasks', icon: '📋', route: '/tasks', color: 'blue' },
    { name: 'Add Event', action: 'add_event', icon: '📅', route: '/calendar', color: 'green' },
    { name: 'View Performance', action: 'view_performance', icon: '📊', route: '/performance', color: 'purple' },
    { name: 'Team Chat', action: 'team_chat', icon: '💬', route: '/chat', color: 'orange' },
    { name: 'Add Task', action: 'add_task', icon: '➕', route: '/tasks/new', color: 'blue' },
    { name: 'Schedule Meeting', action: 'schedule_meeting', icon: '🤝', route: '/calendar/new', color: 'green' },
    { name: 'View Leads', action: 'view_leads', icon: '👥', route: '/leads', color: 'teal' },
    { name: 'Export Data', action: 'export_data', icon: '📤', route: '/export', color: 'gray' }
  ];

  const actions = quickActions.length > 0 ? quickActions : defaultActions;

  // Handle action click
  const handleActionClick = (action) => {
    console.log(`Quick action clicked: ${action.action}`);
    
    // Show toast notification
    toast({
      title: 'Action Triggered',
      description: `${action.name} action has been triggered`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });

    // Handle specific actions
    switch (action.action) {
      case 'view_tasks':
        // Navigate to tasks or open tasks modal
        break;
      case 'add_event':
        // Open calendar event creation modal
        break;
      case 'view_performance':
        // Navigate to performance or open performance modal
        break;
      case 'team_chat':
        // Open team chat or navigate to chat
        break;
      case 'add_task':
        // Open task creation modal
        setSelectedAction(action);
        onActionModalOpen();
        break;
      case 'schedule_meeting':
        // Open meeting scheduling modal
        setSelectedAction(action);
        onActionModalOpen();
        break;
      case 'view_leads':
        // Navigate to leads
        break;
      case 'export_data':
        // Trigger data export
        break;
      default:
        console.log(`Unhandled action: ${action.action}`);
    }
  };

  // Get action color
  const getActionColor = (color) => {
    const colorMap = {
      blue: 'blue',
      green: 'green',
      purple: 'purple',
      orange: 'orange',
      teal: 'teal',
      gray: 'gray',
      red: 'red',
      yellow: 'yellow'
    };
    return colorMap[color] || 'blue';
  };

  // Get action icon
  const getActionIcon = (icon) => {
    const iconMap = {
      '📋': FiCheckCircle,
      '📅': FiCalendar,
      '📊': FiBarChart,
      '💬': FiMessageCircle,
      '➕': FiPlus,
      '🤝': FiUsers,
      '👥': FiUsers,
      '📤': FiDownload
    };
    return iconMap[icon] || FiZap;
  };

  return (
    <>
      {/* Floating Quick Actions */}
      <Box
        position="fixed"
        bottom={6}
        right={6}
        zIndex={1000}
      >
        <VStack spacing={3} align="stretch">
          {/* Expanded Actions */}
          {isExpanded && (
            <Card
              bg={cardBgColor}
              borderColor={borderColor}
              boxShadow="xl"
              borderRadius="xl"
              p={4}
              minW="200px"
              maxW="300px"
            >
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold" color={textColor} fontSize="sm">
                      Quick Actions
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setIsExpanded(false)}
                    >
                      <Icon as={FiX} />
                    </Button>
                  </HStack>
                  
                  <Wrap spacing={2}>
                    {actions.slice(0, 6).map((action, index) => (
                      <WrapItem key={index}>
                        <Tooltip label={action.name} placement="left">
                          <Button
                            size="sm"
                            colorScheme={getActionColor(action.color)}
                            variant="outline"
                            leftIcon={<Text fontSize="sm">{action.icon}</Text>}
                            onClick={() => handleActionClick(action)}
                            _hover={{ transform: 'scale(1.05)' }}
                            transition="all 0.2s ease"
                            minW="120px"
                            justifyContent="flex-start"
                          >
                            {action.name}
                          </Button>
                        </Tooltip>
                      </WrapItem>
                    ))}
                  </Wrap>
                  
                  {actions.length > 6 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="gray"
                      leftIcon={<Icon as={FiMoreVertical} />}
                    >
                      More Actions
                    </Button>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}
          
          {/* Toggle Button */}
          <Button
            size="lg"
            colorScheme="blue"
            borderRadius="full"
            boxShadow="lg"
            onClick={() => setIsExpanded(!isExpanded)}
            _hover={{ transform: 'scale(1.1)' }}
            transition="all 0.2s ease"
            position="relative"
          >
            <Icon as={isExpanded ? FiX : FiPlus} boxSize={6} />
            {!isExpanded && (
              <Badge
                position="absolute"
                top="-8px"
                right="-8px"
                colorScheme="red"
                variant="solid"
                borderRadius="full"
                fontSize="xs"
                minW="20px"
                h="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {actions.length}
              </Badge>
            )}
          </Button>
        </VStack>
      </Box>

      {/* Action Modal */}
      <Modal isOpen={isActionModalOpen} onClose={onActionModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedAction ? `${selectedAction.name} - Quick Action` : 'Quick Action'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAction && (
              <VStack spacing={4} align="stretch">
                <Box textAlign="center">
                  <Text fontSize="4xl" mb={2}>
                    {selectedAction.icon}
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color={textColor} mb={2}>
                    {selectedAction.name}
                  </Text>
                  <Text color={secondaryTextColor}>
                    This action will help you quickly {selectedAction.name.toLowerCase()}
                  </Text>
                </Box>
                
                <Divider />
                
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Action Details</FormLabel>
                    <Textarea
                      placeholder="Enter any additional details or notes..."
                      rows={3}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Priority</FormLabel>
                    <Select placeholder="Select priority">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Due Date</FormLabel>
                    <Input type="datetime-local" />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Assign To</FormLabel>
                    <Select placeholder="Select team member">
                      <option value="self">Myself</option>
                      <option value="team">Team</option>
                      <option value="manager">Manager</option>
                    </Select>
                  </FormControl>
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onActionModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme={selectedAction ? getActionColor(selectedAction.color) : 'blue'}
              onClick={() => {
                handleActionClick(selectedAction);
                onActionModalClose();
              }}
            >
              Execute Action
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default QuickActions;
