import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  IconButton,
  FormControl,
  FormLabel,
  Checkbox,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormHelperText,
  useToast,
  Code,
  SimpleGrid,
  Switch,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tooltip,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Spinner,
  Progress,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverHeader,
  PopoverArrow,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  FiPlay,
  FiPause,
  FiSave,
  FiX,
  FiSettings,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiSearch,
  FiZap,
  FiMail,
  FiMessageSquare,
  FiCalendar,
  FiUser,
  FiClock,
  FiGitBranch,
  FiRepeat,
  FiFilter,
  FiDollarSign,
  FiCheckCircle,
  FiFileText,
  FiLink,
  FiShare2,
  FiCreditCard,
  FiShoppingCart,
  FiBarChart2,
  FiTag,
  FiTrendingUp,
  FiBell,
  FiList,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { getCoachId, getToken } from '../../utils/authUtils';
import { API_BASE_URL } from '../../config/apiConfig';
import automationRulesService from './automationRulesService';

// Custom Node Types
const TriggerNode = ({ data, selected }) => {
  return (
    <Card
      bg="green.50"
      border={`2px solid ${selected ? '#38A169' : '#9AE6B4'}`}
      borderRadius="lg"
      minW="200px"
      shadow={selected ? 'lg' : 'md'}
    >
      <CardBody p={3}>
        <HStack spacing={3} align="center">
          <Box p={2} bg="green.100" borderRadius="full" flexShrink={0}>
            <FiZap size={16} color="#38A169" />
          </Box>
          <VStack spacing={0.5} align="start" flex={1} minW={0}>
            <Text fontSize="sm" fontWeight="600" color="green.800" noOfLines={1}>
              {data.label}
            </Text>
            {data.description && (
              <Text fontSize="xs" color="green.600" noOfLines={1}>
                {data.description}
              </Text>
            )}
          </VStack>
        </HStack>
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: '#38A169',
            width: '8px',
            height: '8px',
            border: '2px solid white'
          }}
        />
      </CardBody>
    </Card>
  );
};

const ActionNode = ({ data, selected }) => {
  return (
    <Card
      bg="blue.50"
      border={`2px solid ${selected ? '#3182CE' : '#90CDF4'}`}
      borderRadius="lg"
      minW="200px"
      shadow={selected ? 'lg' : 'md'}
    >
      <CardBody p={3}>
        <HStack spacing={3} align="center">
          <Box p={2} bg="blue.100" borderRadius="full" flexShrink={0}>
            {data.icon || <FiSettings size={16} color="#3182CE" />}
          </Box>
          <VStack spacing={0.5} align="start" flex={1} minW={0}>
            <Text fontSize="sm" fontWeight="600" color="blue.800" noOfLines={1}>
              {data.label}
            </Text>
            {data.description && (
              <Text fontSize="xs" color="blue.600" noOfLines={1}>
                {data.description}
              </Text>
            )}
          </VStack>
        </HStack>
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: '#3182CE',
            width: '8px',
            height: '8px',
            border: '2px solid white'
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: '#3182CE',
            width: '8px',
            height: '8px',
            border: '2px solid white'
          }}
        />
      </CardBody>
    </Card>
  );
};

const DelayNode = ({ data, selected }) => {
  return (
    <Card
      bg="orange.50"
      border={`2px solid ${selected ? '#DD6B20' : '#FBD38D'}`}
      borderRadius="lg"
      minW="180px"
      shadow={selected ? 'lg' : 'md'}
    >
      <CardBody p={3}>
        <HStack spacing={3} align="center">
          <Box p={2} bg="orange.100" borderRadius="full" flexShrink={0}>
            <FiClock size={16} color="#DD6B20" />
          </Box>
          <VStack spacing={0.5} align="start" flex={1} minW={0}>
            <Text fontSize="sm" fontWeight="600" color="orange.800" noOfLines={1}>
              Delay
            </Text>
            <Text fontSize="xs" color="orange.600" noOfLines={1}>
              {data.delayMinutes || 0} minutes
            </Text>
          </VStack>
        </HStack>
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: '#DD6B20',
            width: '8px',
            height: '8px',
            border: '2px solid white'
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: '#DD6B20',
            width: '8px',
            height: '8px',
            border: '2px solid white'
          }}
        />
      </CardBody>
    </Card>
  );
};

const ConditionNode = ({ data, selected }) => {
  // Generate dynamic handles based on condition type and configuration
  const getConditionHandles = () => {
    const handles = [];

    // Input handle (always present)
    handles.push(
      <Handle
        key="input"
        type="target"
        position={Position.Left}
        style={{
          background: '#805AD5',
          width: '8px',
          height: '8px',
          border: '2px solid white'
        }}
      />
    );

    if (data.conditionType === 'Message Validation') {
      // YES/NO handles for Message Validation, plus optional No Reply handle
      handles.push(
        <Handle
          key="yes"
          type="source"
          position={Position.Bottom}
          id="true"
          style={{
            background: '#38A169',
            width: '8px',
            height: '8px',
            border: '2px solid white'
          }}
        />,
        <Handle
          key="no"
          type="source"
          position={Position.Top}
          id="false"
          style={{
            background: '#E53E3E',
            width: '8px',
            height: '8px',
            border: '2px solid white'
          }}
        />
      );

      // Add No Reply handle if enabled
      if (data.config?.waitForReply && data.config?.noReplyPath) {
        handles.push(
          <Handle
            key="no-reply"
            type="source"
            position={Position.Right}
            id="no-reply"
            style={{
              background: '#ED8936',
              width: '8px',
              height: '8px',
              border: '2px solid white'
            }}
          />
        );
      }
    } else {
      // Default TRUE/FALSE handles for other conditions
      handles.push(
        <Handle
          key="false"
          type="source"
          position={Position.Top}
          id="false"
          style={{
            background: '#E53E3E',
            width: '6px',
            height: '6px',
            border: '2px solid white'
          }}
        />,
        <Handle
          key="true"
          type="source"
          position={Position.Bottom}
          id="true"
          style={{
            background: '#38A169',
            width: '6px',
            height: '6px',
            border: '2px solid white'
          }}
        />
      );
    }

    return handles;
  };

  return (
    <Card
      bg="purple.50"
      border={`2px solid ${selected ? '#805AD5' : '#D6BCFA'}`}
      borderRadius="lg"
      minW="200px"
      shadow={selected ? 'lg' : 'md'}
    >
      <CardBody p={3}>
        <HStack spacing={3} align="center">
          <Box p={2} bg="purple.100" borderRadius="full" flexShrink={0}>
            <FiFilter size={16} color="#805AD5" />
          </Box>
          <VStack spacing={0.5} align="start" flex={1} minW={0}>
            <Text fontSize="sm" fontWeight="600" color="purple.800" noOfLines={1}>
              {data.conditionType === 'Message Validation' ? 'Message Check' : 'Condition'}
            </Text>
            <Text fontSize="xs" color="purple.600" noOfLines={1}>
              {data.conditionType === 'Message Validation'
                ? data.config?.waitForReply
                  ? `Wait ${data.config?.waitMinutes || 60}min → ${data.config?.noReplyPath ? 'YES/NO/No Reply' : 'YES/NO'}`
                  : `${data.config?.keywords?.split(',')[0] || 'keywords'} → YES/NO`
                : (data.conditionType || 'Custom')
              }
            </Text>
          </VStack>
        </HStack>
        {getConditionHandles()}
      </CardBody>
    </Card>
  );
};

// Node types mapping
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  delay: DelayNode,
  condition: ConditionNode,
};

// Get icon for trigger event
const getTriggerIcon = (eventValue) => {
  const eventStr = typeof eventValue === 'string' ? eventValue : eventValue.value || eventValue.label || '';
  const eventLower = eventStr.toLowerCase();

  if (eventLower.includes('lead')) {
    if (eventLower.includes('created')) return FiUser;
    if (eventLower.includes('status')) return FiEdit;
    if (eventLower.includes('score')) return FiTrendingUp;
    return FiUser;
  }
  if (eventLower.includes('appointment')) return FiCalendar;
  if (eventLower.includes('payment')) return FiDollarSign;
  if (eventLower.includes('task')) return FiCheckCircle;
  if (eventLower.includes('form')) return FiFileText;
  if (eventLower.includes('funnel')) return FiBarChart2;
  if (eventLower.includes('content')) return FiMessageSquare;
  return FiZap;
};

// Get icon for action
const getActionIcon = (actionValue) => {
  const actionStr = typeof actionValue === 'string' ? actionValue : actionValue.value || actionValue.label || '';
  const actionLower = actionStr.toLowerCase();

  if (actionLower.includes('email') || actionLower.includes('send_email')) return FiMail;
  if (actionLower.includes('whatsapp') || actionLower.includes('sms') || actionLower.includes('message')) return FiMessageSquare;
  if (actionLower.includes('task') || actionLower.includes('create_task')) return FiList;
  if (actionLower.includes('lead')) {
    if (actionLower.includes('status')) return FiEdit;
    if (actionLower.includes('score')) return FiTrendingUp;
    if (actionLower.includes('tag')) return FiTag;
    if (actionLower.includes('note')) return FiFileText;
    return FiUser;
  }
  if (actionLower.includes('calendar') || actionLower.includes('event')) return FiCalendar;
  if (actionLower.includes('notification')) return FiBell;
  if (actionLower.includes('webhook')) return FiLink;
  if (actionLower.includes('automation') || actionLower.includes('trigger')) return FiZap;
  if (actionLower.includes('invoice') || actionLower.includes('payment')) return FiCreditCard;
  if (actionLower.includes('funnel')) return FiBarChart2;
  if (actionLower.includes('deal')) return FiShoppingCart;
  return FiPlay;
};

// Searchable Menu Component for dropdowns with search functionality
const SearchableMenu = ({ value, onChange, placeholder, children, buttonProps = {}, menuProps = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChildren = React.Children.map(children, (child) => {
    if (!searchTerm || !child.props.children) return child;

    const text = child.props.children.toString().toLowerCase();
    const search = searchTerm.toLowerCase();

    if (text.includes(search)) return child;
    return null;
  }).filter(Boolean);

  return (
    <Menu {...menuProps}>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        variant="outline"
        bg="white"
        borderColor="gray.200"
        _hover={{ borderColor: 'gray.300' }}
        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
        borderRadius="md"
        textAlign="left"
        justifyContent="space-between"
        w="full"
        {...buttonProps}
      >
        {value ? children.find(child => child.props.value === value)?.props.children || value : placeholder}
      </MenuButton>
      <MenuList maxH="300px" overflowY="auto">
        <Box px={3} py={2}>
          <InputGroup size="sm">
            <InputLeftElement>
              <FiSearch size={14} />
            </InputLeftElement>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="gray.50"
              border="none"
              _focus={{ boxShadow: 'none' }}
            />
          </InputGroup>
        </Box>
        <MenuDivider />
        {filteredChildren.length > 0 ? (
          filteredChildren.map((child, index) => (
            <MenuItem
              key={child.props.value || index}
              onClick={() => {
                onChange({ target: { value: child.props.value } });
                setSearchTerm('');
              }}
              bg={value === child.props.value ? 'blue.50' : 'transparent'}
              _hover={{ bg: 'gray.50' }}
            >
              {child.props.children}
            </MenuItem>
          ))
        ) : (
          <MenuItem isDisabled>No options found</MenuItem>
        )}
      </MenuList>
    </Menu>
  );
};

// Variable Input Component for dynamic variable insertion
const VariableInput = ({ fieldName, label, value, onChange, placeholder, type = 'input', rows = 4, helperText, ...props }) => {
  const [activeVariableField, setActiveVariableField] = useState(null);
  const isTextarea = type === 'textarea';
  const InputComponent = isTextarea ? Textarea : Input;

  // Available variables for automation rules
  const availableVariables = [
    { key: '{{lead.name}}', label: 'Lead Name', category: 'Lead Info' },
    { key: '{{lead.email}}', label: 'Lead Email', category: 'Lead Info' },
    { key: '{{lead.phone}}', label: 'Lead Phone', category: 'Lead Info' },
    { key: '{{lead.source}}', label: 'Lead Source', category: 'Lead Info' },
    { key: '{{lead.temperature}}', label: 'Lead Temperature', category: 'Lead Info' },
    { key: '{{lead.score}}', label: 'Lead Score', category: 'Lead Info' },
    { key: '{{lead.status}}', label: 'Lead Status', category: 'Lead Info' },
    { key: '{{lead.created_at}}', label: 'Lead Created Date', category: 'Lead Info' },
    { key: '{{lead.updated_at}}', label: 'Lead Updated Date', category: 'Lead Info' },
    { key: '{{coach.name}}', label: 'Coach Name', category: 'Coach Info' },
    { key: '{{coach.email}}', label: 'Coach Email', category: 'Coach Info' },
    { key: '{{current_date}}', label: 'Current Date', category: 'System' },
    { key: '{{current_time}}', label: 'Current Time', category: 'System' },
  ];

  const insertVariable = (variable) => {
    const currentValue = value || '';
    const input = document.getElementById(`variable-input-${fieldName}`);
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);
      onChange(newValue);
      setTimeout(() => {
        input.focus();
        const newPos = start + variable.length;
        input.setSelectionRange(newPos, newPos);
      }, 0);
    } else {
      onChange(currentValue + variable);
    }
    setActiveVariableField(null);
  };

  const groupedVariables = availableVariables.reduce((acc, variable) => {
    if (!acc[variable.category]) {
      acc[variable.category] = [];
    }
    acc[variable.category].push(variable);
    return acc;
  }, {});

  return (
    <FormControl>
      <HStack spacing={2} align="center" mb={2}>
        <FormLabel fontSize="sm" fontWeight="600" color="gray.700" mb={0} flex={1}>
          {label}
        </FormLabel>
        <Popover
          isOpen={activeVariableField === fieldName}
          onOpen={() => setActiveVariableField(fieldName)}
          onClose={() => setActiveVariableField(null)}
          placement="left"
          closeOnBlur={true}
        >
          <PopoverTrigger>
            <Button size="xs" colorScheme="blue" variant="outline" leftIcon={<FiZap size={12} />}>
              Variables
            </Button>
          </PopoverTrigger>
          <PopoverContent w="300px">
            <PopoverArrow />
            <PopoverHeader fontSize="sm" fontWeight="600">Insert Variables</PopoverHeader>
            <PopoverBody p={0}>
              <VStack spacing={0} align="stretch" maxH="300px" overflowY="auto">
                {Object.entries(groupedVariables).map(([category, variables]) => (
                  <Box key={category}>
                    <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" p={2} bg="gray.50">
                      {category}
                    </Text>
                    <VStack spacing={0} align="stretch">
                      {variables.map((variable) => (
                        <Button
                          key={variable.key}
                          size="sm"
                          variant="ghost"
                          justifyContent="flex-start"
                          onClick={() => insertVariable(variable.key)}
                          _hover={{ bg: 'blue.50' }}
                          borderRadius={0}
                        >
                          <VStack spacing={0} align="start" flex={1}>
                            <Text fontSize="xs" fontWeight="500">{variable.label}</Text>
                            <Text fontSize="xs" color="gray.500" fontFamily="mono">{variable.key}</Text>
                          </VStack>
                        </Button>
                      ))}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </HStack>
      <InputComponent
        id={`variable-input-${fieldName}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        bg="white"
        borderColor="gray.200"
        _hover={{ borderColor: 'gray.300' }}
        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
        borderRadius="md"
        {...(isTextarea ? { rows } : {})}
        {...props}
      />
      {helperText && (
        <FormHelperText fontSize="xs" color="gray.500" mt={1}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

// Node Configuration Form Component
const NodeConfigForm = ({ node, onSave, onCancel, onDelete }) => {
  const [config, setConfig] = useState(node.data || {});
  const toast = useToast();

  const handleSave = () => {
    onSave(config);
  };

  const renderConfigFields = () => {
    switch (node.type) {
      case 'trigger':
        return (
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Trigger Event
              </FormLabel>
              <Select
                value={config.nodeType || ''}
                onChange={(e) => setConfig({ ...config, nodeType: e.target.value })}
                placeholder="Select when to trigger this automation"
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              >
                {/* Lead & Customer Lifecycle */}
                <optgroup label="Lead & Customer Lifecycle">
                  <option value="lead_created">Lead Created</option>
                  <option value="lead_status_changed">Lead Status Changed</option>
                  <option value="lead_temperature_changed">Lead Temperature Changed</option>
                  <option value="lead_converted_to_client">Lead Converted to Client</option>
                  <option value="lead_updated">Lead Updated</option>
                  <option value="lead_tag_added">Lead Tag Added</option>
                  <option value="lead_tag_removed">Lead Tag Removed</option>
                </optgroup>

                {/* Funnel & Conversion */}
                <optgroup label="Funnel & Conversion">
                  <option value="form_submitted">Form Submitted</option>
                  <option value="funnel_stage_entered">Funnel Stage Entered</option>
                  <option value="funnel_stage_exited">Funnel Stage Exited</option>
                  <option value="funnel_completed">Funnel Completed</option>
                  <option value="funnel_page_viewed">Funnel Page Viewed</option>
                </optgroup>

                {/* Appointment & Calendar */}
                <optgroup label="Appointment & Calendar">
                  <option value="appointment_booked">Appointment Booked</option>
                  <option value="appointment_rescheduled">Appointment Rescheduled</option>
                  <option value="appointment_cancelled">Appointment Cancelled</option>
                  <option value="appointment_reminder_time">Appointment Reminder Time</option>
                  <option value="appointment_finished">Appointment Finished</option>
                  <option value="appointment_no_show">Appointment No Show</option>
                </optgroup>

                {/* Communication */}
                <optgroup label="Communication">
                  <option value="content_consumed">Content Consumed</option>
                  <option value="email_opened">Email Opened</option>
                  <option value="email_clicked">Email Clicked</option>
                  <option value="email_bounced">Email Bounced</option>
                  <option value="whatsapp_message_received">WhatsApp Message Received</option>
                  <option value="whatsapp_message_sent">WhatsApp Message Sent</option>
                  <option value="sms_received">SMS Received</option>
                  <option value="sms_sent">SMS Sent</option>
                </optgroup>

                {/* Task & System */}
                <optgroup label="Task & System">
                  <option value="task_created">Task Created</option>
                  <option value="task_completed">Task Completed</option>
                  <option value="task_overdue">Task Overdue</option>
                  <option value="task_assigned">Task Assigned</option>
                </optgroup>

                {/* Payment & Subscription */}
                <optgroup label="Payment & Subscription">
                  <option value="payment_successful">Payment Successful</option>
                  <option value="payment_failed">Payment Failed</option>
                  <option value="payment_link_clicked">Payment Link Clicked</option>
                  <option value="payment_abandoned">Payment Abandoned</option>
                  <option value="invoice_paid">Invoice Paid</option>
                  <option value="invoice_sent">Invoice Sent</option>
                  <option value="invoice_overdue">Invoice Overdue</option>
                  <option value="subscription_created">Subscription Created</option>
                  <option value="subscription_renewed">Subscription Renewed</option>
                  <option value="subscription_cancelled">Subscription Cancelled</option>
                  <option value="subscription_expired">Subscription Expired</option>
                  <option value="card_expired">Card Expired</option>
                  <option value="refund_issued">Refund Issued</option>
                </optgroup>
              </Select>
              <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                Choose what event will trigger this automation
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Custom Label (Optional)
              </FormLabel>
              <Input
                value={config.label || ''}
                onChange={(e) => setConfig({ ...config, label: e.target.value })}
                placeholder="e.g., New Lead Registration"
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              />
              <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                Leave empty to use default label, or enter a custom name for this trigger
              </FormHelperText>
            </FormControl>
          </VStack>
        );

      case 'action':
        const renderActionConfig = () => {
          const actionType = config.nodeType;

          switch (actionType) {
            case 'send_whatsapp_message':
            case 'send_sms_message':
              return (
                <VStack spacing={5} align="stretch">
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Message Template
                    </FormLabel>
                    <SearchableMenu
                      value={config.templateId || ''}
                      onChange={(e) => setConfig({ ...config, templateId: e.target.value })}
                      placeholder="Select template (optional)"
                    >
                      <MenuItem value="">Custom Message</MenuItem>
                      <MenuDivider />
                      {/* Template options would be populated from API */}
                      <MenuItem value="welcome">Welcome Message</MenuItem>
                      <MenuItem value="followup">Follow-up Message</MenuItem>
                      <MenuItem value="reminder">Reminder Message</MenuItem>
                      <MenuItem value="confirmation">Confirmation Message</MenuItem>
                      <MenuItem value="thankyou">Thank You Message</MenuItem>
                    </SearchableMenu>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Using a template ensures compliance with messaging platform requirements
                    </FormHelperText>
                  </FormControl>

                  {!config.templateId && (
                    <VariableInput
                      fieldName="message"
                      label="Message Content"
                      value={config.message || ''}
                      onChange={(value) => setConfig({ ...config, message: value })}
                      placeholder={`Enter your ${actionType === 'send_whatsapp_message' ? 'WhatsApp' : 'SMS'} message. Use variables for dynamic values`}
                      type="textarea"
                      rows={4}
                      helperText={`This message will be sent via ${actionType === 'send_whatsapp_message' ? 'WhatsApp' : 'SMS'}`}
                    />
                  )}

                  <SimpleGrid columns={2} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                        Send Immediately
                      </FormLabel>
                      <Switch
                        isChecked={config.sendImmediately !== false}
                        onChange={(e) => setConfig({ ...config, sendImmediately: e.target.checked })}
                        colorScheme="blue"
                      />
                      <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                        Send now or schedule for later
                      </FormHelperText>
                    </FormControl>

                    {!config.sendImmediately && (
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                          Delay (minutes)
                        </FormLabel>
                        <NumberInput
                          value={config.delayMinutes || 0}
                          onChange={(value) => setConfig({ ...config, delayMinutes: parseInt(value) || 0 })}
                          min={0}
                          max={1440}
                        >
                          <NumberInputField
                            bg="white"
                            borderColor="gray.200"
                            _hover={{ borderColor: 'gray.300' }}
                            _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                            borderRadius="md"
                          />
                        </NumberInput>
                      </FormControl>
                    )}
                  </SimpleGrid>
                </VStack>
              );

            case 'send_email_message':
              return (
                <VStack spacing={5} align="stretch">
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Email Template
                    </FormLabel>
                    <SearchableMenu
                      value={config.templateId || ''}
                      onChange={(e) => setConfig({ ...config, templateId: e.target.value })}
                      placeholder="Select template (optional)"
                    >
                      <MenuItem value="">Custom Email</MenuItem>
                      <MenuDivider />
                      <MenuItem value="welcome">Welcome Email</MenuItem>
                      <MenuItem value="newsletter">Newsletter</MenuItem>
                      <MenuItem value="followup">Follow-up Email</MenuItem>
                      <MenuItem value="confirmation">Confirmation Email</MenuItem>
                      <MenuItem value="thankyou">Thank You Email</MenuItem>
                      <MenuItem value="promotion">Promotional Email</MenuItem>
                      <MenuItem value="announcement">Announcement Email</MenuItem>
                    </SearchableMenu>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Templates ensure consistent branding and formatting
                    </FormHelperText>
                  </FormControl>

                  {!config.templateId && (
                    <>
                      <VariableInput
                        fieldName="subject"
                        label="Email Subject"
                        value={config.subject || ''}
                        onChange={(value) => setConfig({ ...config, subject: value })}
                        placeholder="Enter email subject line"
                        helperText="Subject line should be clear and engaging"
                      />

                      <VariableInput
                        fieldName="body"
                        label="Email Content"
                        value={config.body || ''}
                        onChange={(value) => setConfig({ ...config, body: value })}
                        placeholder="Enter your email content. Use variables for dynamic values"
                        type="textarea"
                        rows={6}
                        helperText="HTML formatting is supported"
                      />
                    </>
                  )}

                  <SimpleGrid columns={2} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                        Send Immediately
                      </FormLabel>
                      <Switch
                        isChecked={config.sendImmediately !== false}
                        onChange={(e) => setConfig({ ...config, sendImmediately: e.target.checked })}
                        colorScheme="blue"
                      />
                    </FormControl>

                    {!config.sendImmediately && (
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                          Delay (minutes)
                        </FormLabel>
                        <NumberInput
                          value={config.delayMinutes || 0}
                          onChange={(value) => setConfig({ ...config, delayMinutes: parseInt(value) || 0 })}
                          min={0}
                          max={1440}
                        >
                          <NumberInputField
                            bg="white"
                            borderColor="gray.200"
                            _hover={{ borderColor: 'gray.300' }}
                            _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                            borderRadius="md"
                          />
                        </NumberInput>
                      </FormControl>
                    )}
                  </SimpleGrid>
                </VStack>
              );

            case 'create_task':
              return (
                <VStack spacing={5} align="stretch">
                  <VariableInput
                    fieldName="taskName"
                    label="Task Name"
                    value={config.taskName || ''}
                    onChange={(value) => setConfig({ ...config, taskName: value })}
                    placeholder="e.g., Follow up with {{lead.name}}"
                    helperText="A clear, descriptive name for the task"
                  />

                  <VariableInput
                    fieldName="taskDescription"
                    label="Task Description"
                    value={config.taskDescription || ''}
                    onChange={(value) => setConfig({ ...config, taskDescription: value })}
                    placeholder="Detailed description of what needs to be done"
                    type="textarea"
                    rows={4}
                    helperText="Provide context and any specific instructions"
                  />

                  <SimpleGrid columns={2} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                        Priority
                      </FormLabel>
                      <SearchableMenu
                        value={config.priority || 'MEDIUM'}
                        onChange={(e) => setConfig({ ...config, priority: e.target.value })}
                        placeholder="Select priority"
                      >
                        <MenuItem value="LOW">Low</MenuItem>
                        <MenuItem value="MEDIUM">Medium</MenuItem>
                        <MenuItem value="HIGH">High</MenuItem>
                        <MenuItem value="URGENT">Urgent</MenuItem>
                      </SearchableMenu>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                        Stage
                      </FormLabel>
                      <SearchableMenu
                        value={config.stage || 'LEAD_GENERATION'}
                        onChange={(e) => setConfig({ ...config, stage: e.target.value })}
                        placeholder="Select sales stage"
                      >
                        <MenuItem value="LEAD_GENERATION">Lead Generation</MenuItem>
                        <MenuItem value="LEAD_QUALIFICATION">Lead Qualification</MenuItem>
                        <MenuItem value="PROPOSAL">Proposal</MenuItem>
                        <MenuItem value="CLOSING">Closing</MenuItem>
                        <MenuItem value="ONBOARDING">Onboarding</MenuItem>
                        <MenuItem value="FOLLOW_UP">Follow Up</MenuItem>
                        <MenuItem value="CUSTOMER_SUCCESS">Customer Success</MenuItem>
                      </SearchableMenu>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Assign To
                    </FormLabel>
                    <SearchableMenu
                      value={config.assignedTo || ''}
                      onChange={(e) => setConfig({ ...config, assignedTo: e.target.value })}
                      placeholder="Select staff (optional, defaults to coach)"
                    >
                      <MenuItem value="">Coach (Me)</MenuItem>
                      <MenuDivider />
                      {/* Staff options would be populated from API */}
                      <MenuItem value="staff1">John Doe</MenuItem>
                      <MenuItem value="staff2">Jane Smith</MenuItem>
                      <MenuItem value="staff3">Mike Johnson</MenuItem>
                      <MenuItem value="staff4">Sarah Wilson</MenuItem>
                    </SearchableMenu>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Due Date Offset (days)
                    </FormLabel>
                    <NumberInput
                      value={config.dueDateOffset || 7}
                      onChange={(value) => setConfig({ ...config, dueDateOffset: parseInt(value) || 7 })}
                      min={0}
                      max={365}
                    >
                      <NumberInputField
                        bg="white"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'gray.300' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                        borderRadius="md"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Days from now when this task should be completed
                    </FormHelperText>
                  </FormControl>
                </VStack>
              );

            case 'update_lead_score':
              return (
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Score
                    </FormLabel>
                    <NumberInput
                      value={config.score || 0}
                      onChange={(value) => setConfig({ ...config, score: parseInt(value) || 0 })}
                      min={0}
                      max={100}
                    >
                      <NumberInputField
                        bg="white"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'gray.300' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                        borderRadius="md"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Lead score from 0-100 (higher = more qualified)
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Reason
                    </FormLabel>
                    <Input
                      value={config.reason || ''}
                      onChange={(e) => setConfig({ ...config, reason: e.target.value })}
                      placeholder="Reason for score update"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Optional note explaining why the score was changed
                    </FormHelperText>
                  </FormControl>
                </VStack>
              );

            case 'add_lead_tag':
            case 'remove_lead_tag':
              return (
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Tag Name
                    </FormLabel>
                    <Input
                      value={config.tag || ''}
                      onChange={(e) => setConfig({ ...config, tag: e.target.value })}
                      placeholder="Enter tag name"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      {actionType === 'add_lead_tag' ? 'Tag to add to the lead' : 'Tag to remove from the lead'}
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Create Tag if Not Exists
                    </FormLabel>
                    <Switch
                      isChecked={config.createIfNotExists !== false}
                      onChange={(e) => setConfig({ ...config, createIfNotExists: e.target.checked })}
                      colorScheme="blue"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Automatically create the tag if it doesn't already exist
                    </FormHelperText>
                  </FormControl>
                </VStack>
              );

            case 'add_to_funnel':
              return (
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Funnel
                    </FormLabel>
                    <SearchableMenu
                      value={config.funnelId || ''}
                      onChange={(e) => setConfig({ ...config, funnelId: e.target.value })}
                      placeholder="Select funnel"
                    >
                      <MenuItem value="">Choose a funnel...</MenuItem>
                      <MenuDivider />
                      {/* Funnels would be populated from builderResources */}
                      {builderResources?.funnels?.map(funnel => (
                        <MenuItem key={funnel._id} value={funnel._id}>
                          {funnel.name}
                        </MenuItem>
                      )) || []}
                    </SearchableMenu>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      The funnel to add the lead to
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Stage (Optional)
                    </FormLabel>
                    <SearchableMenu
                      value={config.stageId || ''}
                      onChange={(e) => setConfig({ ...config, stageId: e.target.value })}
                      placeholder="Select starting stage"
                    >
                      <MenuItem value="">Entry stage</MenuItem>
                      <MenuDivider />
                      {/* Stages would be populated based on selected funnel */}
                      <MenuItem value="stage1">Stage 1</MenuItem>
                      <MenuItem value="stage2">Stage 2</MenuItem>
                      <MenuItem value="stage3">Stage 3</MenuItem>
                    </SearchableMenu>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Leave empty to add to funnel entry
                    </FormHelperText>
                  </FormControl>
                </VStack>
              );

            case 'move_to_funnel_stage':
              return (
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Stage ID
                    </FormLabel>
                    <Input
                      value={config.stageId || ''}
                      onChange={(e) => setConfig({ ...config, stageId: e.target.value })}
                      placeholder="Enter stage ID"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      The stage ID to move the lead to
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Stage Name (Optional)
                    </FormLabel>
                    <Input
                      value={config.stageName || ''}
                      onChange={(e) => setConfig({ ...config, stageName: e.target.value })}
                      placeholder="Enter stage name"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Optional descriptive name for the stage
                    </FormHelperText>
                  </FormControl>
                </VStack>
              );

            case 'update_lead_field':
              return (
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Field Name
                    </FormLabel>
                    <SearchableMenu
                      value={config.field || ''}
                      onChange={(e) => setConfig({ ...config, field: e.target.value })}
                      placeholder="Select field to update"
                    >
                      <MenuItem value="firstName">First Name</MenuItem>
                      <MenuItem value="lastName">Last Name</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="phone">Phone</MenuItem>
                      <MenuItem value="company">Company</MenuItem>
                      <MenuItem value="website">Website</MenuItem>
                      <MenuItem value="status">Status</MenuItem>
                      <MenuItem value="temperature">Temperature</MenuItem>
                      <MenuItem value="score">Score</MenuItem>
                      <MenuItem value="source">Source</MenuItem>
                      <MenuItem value="campaign">Campaign</MenuItem>
                    </SearchableMenu>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      The lead field to update
                    </FormHelperText>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      New Value
                    </FormLabel>
                    <VariableInput
                      fieldName="value"
                      value={config.value || ''}
                      onChange={(value) => setConfig({ ...config, value: value })}
                      placeholder="Enter new field value"
                      helperText="Use variables for dynamic values"
                    />
                  </FormControl>
                </VStack>
              );

            case 'update_lead_status':
              return (
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      New Status
                    </FormLabel>
                    <SearchableMenu
                      value={config.status || ''}
                      onChange={(e) => setConfig({ ...config, status: e.target.value })}
                      placeholder="Select new status"
                    >
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="contacted">Contacted</MenuItem>
                      <MenuItem value="qualified">Qualified</MenuItem>
                      <MenuItem value="proposal">Proposal</MenuItem>
                      <MenuItem value="negotiation">Negotiation</MenuItem>
                      <MenuItem value="closed_won">Closed Won</MenuItem>
                      <MenuItem value="closed_lost">Closed Lost</MenuItem>
                      <MenuItem value="nurture">Nurture</MenuItem>
                      <MenuItem value="unqualified">Unqualified</MenuItem>
                    </SearchableMenu>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Update the lead's status in the system
                    </FormHelperText>
                  </FormControl>
                </VStack>
              );

            case 'assign_lead_to_staff':
              return (
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Staff Member
                    </FormLabel>
                    <SearchableMenu
                      value={config.staffId || ''}
                      onChange={(e) => setConfig({ ...config, staffId: e.target.value })}
                      placeholder="Select staff member"
                    >
                      <MenuItem value="">Choose staff member...</MenuItem>
                      <MenuDivider />
                      {/* Staff would be populated from builderResources */}
                      {builderResources?.staff?.map(staff => (
                        <MenuItem key={staff._id} value={staff._id}>
                          {staff.name} ({staff.email})
                        </MenuItem>
                      )) || []}
                    </SearchableMenu>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      The staff member to assign this lead to
                    </FormHelperText>
                  </FormControl>
                </VStack>
              );

            case 'create_deal':
              return (
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Deal Value
                    </FormLabel>
                    <NumberInput
                      value={config.dealValue || 0}
                      onChange={(value) => setConfig({ ...config, dealValue: parseFloat(value) || 0 })}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField
                        bg="white"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'gray.300' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                        borderRadius="md"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      The monetary value of this deal
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Deal Type
                    </FormLabel>
                    <SearchableMenu
                      value={config.dealType || 'consultation'}
                      onChange={(e) => setConfig({ ...config, dealType: e.target.value })}
                      placeholder="Select deal type"
                    >
                      <MenuItem value="consultation">Consultation</MenuItem>
                      <MenuItem value="service">Service</MenuItem>
                      <MenuItem value="product">Product</MenuItem>
                      <MenuItem value="package">Package</MenuItem>
                      <MenuItem value="subscription">Subscription</MenuItem>
                    </SearchableMenu>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      The type of deal or service
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Description
                    </FormLabel>
                    <Textarea
                      value={config.description || ''}
                      onChange={(e) => setConfig({ ...config, description: e.target.value })}
                      placeholder="Describe this deal"
                      rows={3}
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Optional description of the deal
                    </FormHelperText>
                  </FormControl>
                </VStack>
              );

            case 'send_push_notification':
              return (
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Recipient
                    </FormLabel>
                    <SearchableMenu
                      value={config.recipientId || ''}
                      onChange={(e) => setConfig({ ...config, recipientId: e.target.value })}
                      placeholder="Select recipient"
                    >
                      <MenuItem value="coach">Coach</MenuItem>
                      <MenuItem value="lead">Lead</MenuItem>
                      {/* Specific staff members could be added here */}
                    </SearchableMenu>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Who should receive this notification
                    </FormHelperText>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Message
                    </FormLabel>
                    <Textarea
                      value={config.message || ''}
                      onChange={(e) => setConfig({ ...config, message: e.target.value })}
                      placeholder="Enter notification message"
                      rows={3}
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      The notification message content
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Title
                    </FormLabel>
                    <Input
                      value={config.title || ''}
                      onChange={(e) => setConfig({ ...config, title: e.target.value })}
                      placeholder="Notification title"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Optional title for the notification
                    </FormHelperText>
                  </FormControl>
                </VStack>
              );

            case 'schedule_drip_sequence':
              return (
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Sequence Name
                    </FormLabel>
                    <SearchableMenu
                      value={config.sequenceName || ''}
                      onChange={(e) => setConfig({ ...config, sequenceName: e.target.value })}
                      placeholder="Select drip sequence"
                    >
                      <MenuItem value="">Choose sequence...</MenuItem>
                      <MenuDivider />
                      {/* Sequences would be populated from API */}
                      <MenuItem value="welcome_sequence">Welcome Sequence</MenuItem>
                      <MenuItem value="followup_sequence">Follow-up Sequence</MenuItem>
                      <MenuItem value="nurture_sequence">Nurture Sequence</MenuItem>
                    </SearchableMenu>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      The drip sequence to start for this lead
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Start Delay (minutes)
                    </FormLabel>
                    <NumberInput
                      value={config.startDelay || 0}
                      onChange={(value) => setConfig({ ...config, startDelay: parseInt(value) || 0 })}
                      min={0}
                    >
                      <NumberInputField
                        bg="white"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'gray.300' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                        borderRadius="md"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Minutes to wait before starting the sequence
                    </FormHelperText>
                  </FormControl>
                </VStack>
              );

            case 'add_followup_date':
              return (
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Follow-up Date
                    </FormLabel>
                    <VariableInput
                      fieldName="followupDate"
                      value={config.followupDate || ''}
                      onChange={(value) => setConfig({ ...config, followupDate: value })}
                      placeholder="e.g., {{current_date + 7}} or 2024-01-15"
                      helperText="Use date variables or specific dates"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Follow-up Type
                    </FormLabel>
                    <SearchableMenu
                      value={config.followupType || 'general'}
                      onChange={(e) => setConfig({ ...config, followupType: e.target.value })}
                      placeholder="Select follow-up type"
                    >
                      <MenuItem value="general">General</MenuItem>
                      <MenuItem value="call">Call</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="meeting">Meeting</MenuItem>
                      <MenuItem value="task">Task</MenuItem>
                    </SearchableMenu>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      The type of follow-up activity
                    </FormHelperText>
                  </FormControl>
                </VStack>
              );

            case 'create_invoice':
              return (
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Amount
                    </FormLabel>
                    <NumberInput
                      value={config.amount || 0}
                      onChange={(value) => setConfig({ ...config, amount: parseFloat(value) || 0 })}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField
                        bg="white"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'gray.300' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                        borderRadius="md"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Invoice amount
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Currency
                    </FormLabel>
                    <SearchableMenu
                      value={config.currency || 'USD'}
                      onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                      placeholder="Select currency"
                    >
                      <MenuItem value="USD">USD ($)</MenuItem>
                      <MenuItem value="EUR">EUR (€)</MenuItem>
                      <MenuItem value="GBP">GBP (£)</MenuItem>
                      <MenuItem value="CAD">CAD (C$)</MenuItem>
                      <MenuItem value="AUD">AUD (A$)</MenuItem>
                    </SearchableMenu>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Description
                    </FormLabel>
                    <Textarea
                      value={config.description || ''}
                      onChange={(e) => setConfig({ ...config, description: e.target.value })}
                      placeholder="Invoice description"
                      rows={3}
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      What this invoice is for
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Due Date
                    </FormLabel>
                    <VariableInput
                      fieldName="dueDate"
                      value={config.dueDate || ''}
                      onChange={(value) => setConfig({ ...config, dueDate: value })}
                      placeholder="e.g., {{current_date + 30}} or 2024-02-15"
                      helperText="When payment is due"
                    />
                  </FormControl>
                </VStack>
              );

            case 'issue_refund':
              return (
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Refund Amount
                    </FormLabel>
                    <NumberInput
                      value={config.amount || 0}
                      onChange={(value) => setConfig({ ...config, amount: parseFloat(value) || 0 })}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField
                        bg="white"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'gray.300' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                        borderRadius="md"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Amount to refund
                    </FormHelperText>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Reason
                    </FormLabel>
                    <Textarea
                      value={config.reason || ''}
                      onChange={(e) => setConfig({ ...config, reason: e.target.value })}
                      placeholder="Reason for refund"
                      rows={2}
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Why this refund is being issued
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Refund Type
                    </FormLabel>
                    <SearchableMenu
                      value={config.refundType || 'partial'}
                      onChange={(e) => setConfig({ ...config, refundType: e.target.value })}
                      placeholder="Select refund type"
                    >
                      <MenuItem value="partial">Partial Refund</MenuItem>
                      <MenuItem value="full">Full Refund</MenuItem>
                    </SearchableMenu>
                  </FormControl>
                </VStack>
              );

            case 'call_webhook':
              return (
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Webhook URL
                    </FormLabel>
                    <Input
                      value={config.url || ''}
                      onChange={(e) => setConfig({ ...config, url: e.target.value })}
                      placeholder="https://your-webhook-url.com/endpoint"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      The URL to call when this action executes
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      HTTP Method
                    </FormLabel>
                    <SearchableMenu
                      value={config.method || 'POST'}
                      onChange={(e) => setConfig({ ...config, method: e.target.value })}
                      placeholder="Select HTTP method"
                    >
                      <MenuItem value="GET">GET</MenuItem>
                      <MenuItem value="POST">POST</MenuItem>
                      <MenuItem value="PUT">PUT</MenuItem>
                      <MenuItem value="PATCH">PATCH</MenuItem>
                      <MenuItem value="DELETE">DELETE</MenuItem>
                    </SearchableMenu>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Headers (JSON)
                    </FormLabel>
                    <Textarea
                      value={config.headers ? JSON.stringify(config.headers, null, 2) : ''}
                      onChange={(e) => {
                        try {
                          const headers = e.target.value ? JSON.parse(e.target.value) : {};
                          setConfig({ ...config, headers });
                        } catch (error) {
                          // Invalid JSON, keep current value
                        }
                      }}
                      placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                      rows={3}
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      HTTP headers as JSON object
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Request Body (JSON)
                    </FormLabel>
                    <Textarea
                      value={config.body ? JSON.stringify(config.body, null, 2) : ''}
                      onChange={(e) => {
                        try {
                          const body = e.target.value ? JSON.parse(e.target.value) : {};
                          setConfig({ ...config, body });
                        } catch (error) {
                          // Invalid JSON, keep current value
                        }
                      }}
                      placeholder='{"leadId": "{{lead._id}}", "event": "automation_triggered"}'
                      rows={4}
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Request body as JSON object (use variables)
                    </FormHelperText>
                  </FormControl>
                </VStack>
              );

            case 'trigger_another_automation':
              return (
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Automation Rule
                    </FormLabel>
                    <SearchableMenu
                      value={config.automationRuleId || ''}
                      onChange={(e) => setConfig({ ...config, automationRuleId: e.target.value })}
                      placeholder="Select automation rule"
                    >
                      <MenuItem value="">Choose automation rule...</MenuItem>
                      <MenuDivider />
                      {/* Automation rules would be populated from builderResources */}
                      {builderResources?.automationRules?.map(rule => (
                        <MenuItem key={rule._id} value={rule._id}>
                          {rule.name}
                        </MenuItem>
                      )) || []}
                    </SearchableMenu>
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      The automation rule to trigger
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Trigger Data (JSON)
                    </FormLabel>
                    <Textarea
                      value={config.triggerData ? JSON.stringify(config.triggerData, null, 2) : ''}
                      onChange={(e) => {
                        try {
                          const triggerData = e.target.value ? JSON.parse(e.target.value) : {};
                          setConfig({ ...config, triggerData });
                        } catch (error) {
                          // Invalid JSON, keep current value
                        }
                      }}
                      placeholder='{"customField": "value", "source": "automation"}'
                      rows={3}
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Optional data to pass to the triggered automation
                    </FormHelperText>
                  </FormControl>
                </VStack>
              );

            case 'add_note_to_lead':
              return (
                <VStack spacing={5} align="stretch">
                  <VariableInput
                    fieldName="note"
                    label="Note Content"
                    value={config.note || ''}
                    onChange={(value) => setConfig({ ...config, note: value })}
                    placeholder="Enter note content. Use variables for dynamic values"
                    type="textarea"
                    rows={6}
                    helperText="This note will be added to the lead's activity timeline"
                  />

                  <SimpleGrid columns={2} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                        Note Type
                      </FormLabel>
                      <SearchableMenu
                        value={config.noteType || 'general'}
                        onChange={(e) => setConfig({ ...config, noteType: e.target.value })}
                        placeholder="Select note type"
                      >
                        <MenuItem value="general">General</MenuItem>
                        <MenuItem value="call">Call</MenuItem>
                        <MenuItem value="meeting">Meeting</MenuItem>
                        <MenuItem value="followup">Follow-up</MenuItem>
                        <MenuItem value="important">Important</MenuItem>
                        <MenuItem value="reminder">Reminder</MenuItem>
                        <MenuItem value="internal">Internal</MenuItem>
                      </SearchableMenu>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                        Visibility
                      </FormLabel>
                      <SearchableMenu
                        value={config.visibility || 'all'}
                        onChange={(e) => setConfig({ ...config, visibility: e.target.value })}
                        placeholder="Select visibility"
                      >
                        <MenuItem value="all">All Staff</MenuItem>
                        <MenuItem value="coach">Coach Only</MenuItem>
                        <MenuItem value="assigned">Assigned Staff Only</MenuItem>
                      </SearchableMenu>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Priority
                    </FormLabel>
                    <SearchableMenu
                      value={config.priority || 'normal'}
                      onChange={(e) => setConfig({ ...config, priority: e.target.value })}
                      placeholder="Select priority"
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </SearchableMenu>
                  </FormControl>
                </VStack>
              );

            case 'create_zoom_meeting':
              return (
                <VStack spacing={5} align="stretch">
                  <VariableInput
                    fieldName="meetingTopic"
                    label="Meeting Topic"
                    value={config.meetingTopic || ''}
                    onChange={(value) => setConfig({ ...config, meetingTopic: value })}
                    placeholder="Enter meeting topic. Use variables for dynamic values"
                    helperText="The title that will appear for the Zoom meeting"
                  />

                  <VariableInput
                    fieldName="meetingDescription"
                    label="Meeting Description"
                    value={config.meetingDescription || ''}
                    onChange={(value) => setConfig({ ...config, meetingDescription: value })}
                    placeholder="Optional meeting description or agenda"
                    type="textarea"
                    rows={3}
                    helperText="Additional details about the meeting"
                  />

                  <SimpleGrid columns={2} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                        Meeting Type
                      </FormLabel>
                      <SearchableMenu
                        value={config.meetingType || 'instant'}
                        onChange={(e) => setConfig({ ...config, meetingType: e.target.value })}
                        placeholder="Select meeting type"
                      >
                        <MenuItem value="instant">Instant Meeting</MenuItem>
                        <MenuItem value="scheduled">Scheduled Meeting</MenuItem>
                      </SearchableMenu>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                        Duration (minutes)
                      </FormLabel>
                      <NumberInput
                        value={config.duration || 60}
                        onChange={(value) => setConfig({ ...config, duration: parseInt(value) || 60 })}
                        min={15}
                        max={480}
                      >
                        <NumberInputField
                          bg="white"
                          borderColor="gray.200"
                          _hover={{ borderColor: 'gray.300' }}
                          _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                          borderRadius="md"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>

                  {config.meetingType === 'scheduled' && (
                    <SimpleGrid columns={2} spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                          Start Date
                        </FormLabel>
                        <Input
                          type="date"
                          value={config.startDate || ''}
                          onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                          bg="white"
                          borderColor="gray.200"
                          _hover={{ borderColor: 'gray.300' }}
                          _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                          borderRadius="md"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                          Start Time
                        </FormLabel>
                        <Input
                          type="time"
                          value={config.startTime || ''}
                          onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
                          bg="white"
                          borderColor="gray.200"
                          _hover={{ borderColor: 'gray.300' }}
                          _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                          borderRadius="md"
                        />
                      </FormControl>
                    </SimpleGrid>
                  )}

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Timezone
                    </FormLabel>
                    <SearchableMenu
                      value={config.timezone || 'UTC'}
                      onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                      placeholder="Select timezone"
                    >
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="America/New_York">Eastern Time</MenuItem>
                      <MenuItem value="America/Chicago">Central Time</MenuItem>
                      <MenuItem value="America/Denver">Mountain Time</MenuItem>
                      <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                      <MenuItem value="Europe/London">London</MenuItem>
                      <MenuItem value="Europe/Paris">Paris</MenuItem>
                      <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                      <MenuItem value="Asia/Dubai">Dubai</MenuItem>
                      <MenuItem value="Australia/Sydney">Sydney</MenuItem>
                    </SearchableMenu>
                  </FormControl>

                  <SimpleGrid columns={2} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                        Auto Record
                      </FormLabel>
                      <Switch
                        isChecked={config.autoRecord !== false}
                        onChange={(e) => setConfig({ ...config, autoRecord: e.target.checked })}
                        colorScheme="blue"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                        Join Before Host
                      </FormLabel>
                      <Switch
                        isChecked={config.joinBeforeHost !== false}
                        onChange={(e) => setConfig({ ...config, joinBeforeHost: e.target.checked })}
                        colorScheme="blue"
                      />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Password Protection
                    </FormLabel>
                    <Switch
                      isChecked={config.passwordProtected !== false}
                      onChange={(e) => setConfig({ ...config, passwordProtected: e.target.checked })}
                      colorScheme="blue"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Require password for meeting access
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Alternative Hosts
                    </FormLabel>
                    <Input
                      value={config.alternativeHosts || ''}
                      onChange={(e) => setConfig({ ...config, alternativeHosts: e.target.value })}
                      placeholder="Enter email addresses separated by commas"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Additional hosts who can start and manage the meeting
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Send Meeting Invites
                    </FormLabel>
                    <Switch
                      isChecked={config.sendInvites !== false}
                      onChange={(e) => setConfig({ ...config, sendInvites: e.target.checked })}
                      colorScheme="blue"
                    />
                    <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                      Automatically send calendar invites to participants
                    </FormHelperText>
                  </FormControl>
                </VStack>
              );

            default:
              return (
                <VStack spacing={4} align="stretch">
                  <Alert status="info">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Advanced configuration options for {actionType || 'this action'} will be available soon.
                    </Text>
                  </Alert>

                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Custom Label (Optional)
                    </FormLabel>
                    <Input
                      value={config.label || ''}
                      onChange={(e) => setConfig({ ...config, label: e.target.value })}
                      placeholder="e.g., Send Welcome Message"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                  </FormControl>
                </VStack>
              );
          }
        };

        return (
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Action Type
              </FormLabel>
              <SearchableMenu
                value={config.nodeType || ''}
                onChange={(e) => setConfig({ ...config, nodeType: e.target.value })}
                placeholder="Select what action to perform"
              >
                {/* Lead Data & Funnel Actions */}
                <MenuItem value="update_lead_score">Update Lead Score</MenuItem>
                <MenuItem value="add_lead_tag">Add Lead Tag</MenuItem>
                <MenuItem value="remove_lead_tag">Remove Lead Tag</MenuItem>
                <MenuItem value="add_to_funnel">Add to Funnel</MenuItem>
                <MenuItem value="move_to_funnel_stage">Move to Funnel Stage</MenuItem>
                <MenuItem value="remove_from_funnel">Remove from Funnel</MenuItem>
                <MenuItem value="update_lead_field">Update Lead Field</MenuItem>
                <MenuItem value="update_lead_status">Update Lead Status</MenuItem>
                <MenuItem value="assign_lead_to_staff">Assign Lead to Staff</MenuItem>
                <MenuItem value="create_deal">Create Deal</MenuItem>
                <MenuDivider />
                {/* Communication Actions */}
                <MenuItem value="send_whatsapp_message">Send WhatsApp Message</MenuItem>
                <MenuItem value="send_email_message">Send Email Message</MenuItem>
                <MenuItem value="send_sms_message">Send SMS Message</MenuItem>
                <MenuItem value="send_internal_notification">Send Internal Notification</MenuItem>
                <MenuItem value="send_push_notification">Send Push Notification</MenuItem>
                <MenuItem value="schedule_drip_sequence">Schedule Drip Sequence</MenuItem>
                <MenuDivider />
                {/* Task & Workflow Actions */}
                <MenuItem value="create_task">Create Task</MenuItem>
                <MenuItem value="create_multiple_tasks">Create Multiple Tasks</MenuItem>
                <MenuItem value="create_calendar_event">Create Calendar Event</MenuItem>
                <MenuItem value="add_note_to_lead">Add Note to Lead</MenuItem>
                <MenuItem value="add_followup_date">Add Follow-up Date</MenuItem>
                <MenuDivider />
                {/* Zoom Integration Actions */}
                <MenuItem value="create_zoom_meeting">Create Zoom Meeting</MenuItem>
                <MenuDivider />
                {/* Payment Actions */}
                <MenuItem value="create_invoice">Create Invoice</MenuItem>
                <MenuItem value="issue_refund">Issue Refund</MenuItem>
                <MenuDivider />
                {/* System Actions */}
                <MenuItem value="call_webhook">Call Webhook</MenuItem>
                <MenuItem value="trigger_another_automation">Trigger Another Automation</MenuItem>
                <MenuItem value="wait_delay">Wait Delay</MenuItem>
              </SearchableMenu>
              <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                Choose what action to perform when the trigger fires
              </FormHelperText>
            </FormControl>

            {config.nodeType && renderActionConfig()}
          </VStack>
        );

      case 'delay':
        return (
          <VStack spacing={5} align="stretch">
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Delay Duration
              </FormLabel>
              <SimpleGrid columns={3} spacing={3}>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600">Hours</FormLabel>
                  <NumberInput
                    value={config.delayHours || 0}
                    onChange={(value) => setConfig({ ...config, delayHours: parseInt(value) || 0 })}
                    min={0}
                    max={23}
                  >
                    <NumberInputField
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600">Minutes</FormLabel>
                  <NumberInput
                    value={config.delayMinutes || 0}
                    onChange={(value) => setConfig({ ...config, delayMinutes: parseInt(value) || 0 })}
                    min={0}
                    max={59}
                  >
                    <NumberInputField
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600">Seconds</FormLabel>
                  <NumberInput
                    value={config.delaySeconds || 0}
                    onChange={(value) => setConfig({ ...config, delaySeconds: parseInt(value) || 0 })}
                    min={0}
                    max={59}
                  >
                    <NumberInputField
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
              <FormHelperText fontSize="xs" color="gray.500" mt={2}>
                The workflow will wait for the specified duration before proceeding to the next node
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Custom Label (Optional)
              </FormLabel>
              <Input
                value={config.label || ''}
                onChange={(e) => setConfig({ ...config, label: e.target.value })}
                placeholder="e.g., Wait 5 minutes"
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              />
              <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                Leave empty to auto-generate label based on delay duration
              </FormHelperText>
            </FormControl>
          </VStack>
        );

      case 'condition':
        return (
          <VStack spacing={5} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Condition Type
              </FormLabel>
              <SearchableMenu
                value={config.conditionType || 'Custom'}
                onChange={(e) => setConfig({ ...config, conditionType: e.target.value })}
                placeholder="Select condition type"
              >
                <MenuItem value="Custom">Custom Condition</MenuItem>
                <MenuDivider />
                <MenuItem value="Lead Score">Lead Score Check</MenuItem>
                <MenuItem value="Tag Check">Tag Check</MenuItem>
                <MenuItem value="Field Check">Field Value Check</MenuItem>
                <MenuItem value="Temperature Check">Temperature Check</MenuItem>
                <MenuItem value="Source Check">Source Check</MenuItem>
                <MenuItem value="Status Check">Status Check</MenuItem>
                <MenuItem value="Email Check">Email Validation</MenuItem>
                <MenuItem value="Phone Check">Phone Validation</MenuItem>
                <MenuItem value="Message Validation">Message Content Validation</MenuItem>
                <MenuDivider />
                <MenuItem value="Time Check">Time Check</MenuItem>
                <MenuItem value="Date Check">Date Check</MenuItem>
                <MenuItem value="Day Check">Day of Week Check</MenuItem>
                <MenuItem value="Age Check">Lead Age Check</MenuItem>
                <MenuDivider />
                <MenuItem value="Funnel Stage">Funnel Stage Check</MenuItem>
                <MenuItem value="Funnel Progress">Funnel Progress Check</MenuItem>
                <MenuItem value="Conversion Check">Conversion Check</MenuItem>
                <MenuDivider />
                <MenuItem value="Email Open">Email Open Check</MenuItem>
                <MenuItem value="Email Click">Email Click Check</MenuItem>
                <MenuItem value="WhatsApp Reply">WhatsApp Reply Check</MenuItem>
                <MenuItem value="SMS Reply">SMS Reply Check</MenuItem>
                <MenuDivider />
                <MenuItem value="Multiple Conditions">Multiple Conditions</MenuItem>
                <MenuItem value="Webhook Response">Webhook Response Check</MenuItem>
              </SearchableMenu>
              <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                Choose what type of condition to evaluate
              </FormHelperText>
            </FormControl>

            {/* Conditional fields based on condition type */}
            {config.conditionType === 'Lead Score' && (
              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Score Comparison
                  </FormLabel>
                  <SearchableMenu
                    value={config.scoreOperator || 'greater_than'}
                    onChange={(e) => setConfig({ ...config, scoreOperator: e.target.value })}
                    placeholder="Select comparison"
                  >
                    <MenuItem value="greater_than">Greater than</MenuItem>
                    <MenuItem value="less_than">Less than</MenuItem>
                    <MenuItem value="equals">Equals</MenuItem>
                    <MenuItem value="not_equals">Not equals</MenuItem>
                  </SearchableMenu>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Score Value
                  </FormLabel>
                  <NumberInput
                    value={config.scoreValue || 50}
                    onChange={(value) => setConfig({ ...config, scoreValue: parseInt(value) || 50 })}
                    min={0}
                    max={100}
                  >
                    <NumberInputField
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </VStack>
            )}

            {config.conditionType === 'Tag Check' && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                  Tag Name
                </FormLabel>
                <Input
                  value={config.tagName || ''}
                  onChange={(e) => setConfig({ ...config, tagName: e.target.value })}
                  placeholder="Enter tag name to check for"
                  bg="white"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  borderRadius="md"
                />
                <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                  Check if the lead has this tag (TRUE path) or doesn't have it (FALSE path)
                </FormHelperText>
              </FormControl>
            )}

            {config.conditionType === 'Field Check' && (
              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Field Name
                  </FormLabel>
                  <SearchableMenu
                    value={config.fieldName || ''}
                    onChange={(e) => setConfig({ ...config, fieldName: e.target.value })}
                    placeholder="Select field to check"
                  >
                    <MenuItem value="first_name">First Name</MenuItem>
                    <MenuItem value="last_name">Last Name</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="phone">Phone</MenuItem>
                    <MenuItem value="company">Company</MenuItem>
                    <MenuItem value="website">Website</MenuItem>
                    <MenuDivider />
                    <MenuItem value="status">Status</MenuItem>
                    <MenuItem value="temperature">Temperature</MenuItem>
                    <MenuItem value="score">Score</MenuItem>
                    <MenuItem value="source">Source</MenuItem>
                    <MenuItem value="campaign">Campaign</MenuItem>
                    <MenuDivider />
                    <MenuItem value="email_opt_in">Email Opt-in</MenuItem>
                    <MenuItem value="sms_opt_in">SMS Opt-in</MenuItem>
                    <MenuItem value="whatsapp_opt_in">WhatsApp Opt-in</MenuItem>
                    <MenuItem value="preferred_contact">Preferred Contact Method</MenuItem>
                    <MenuDivider />
                    <MenuItem value="country">Country</MenuItem>
                    <MenuItem value="state">State/Province</MenuItem>
                    <MenuItem value="city">City</MenuItem>
                    <MenuItem value="timezone">Timezone</MenuItem>
                    <MenuDivider />
                    <MenuItem value="custom_field_1">Custom Field 1</MenuItem>
                    <MenuItem value="custom_field_2">Custom Field 2</MenuItem>
                    <MenuItem value="custom_field_3">Custom Field 3</MenuItem>
                  </SearchableMenu>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Comparison Operator
                  </FormLabel>
                  <SearchableMenu
                    value={config.fieldOperator || 'equals'}
                    onChange={(e) => setConfig({ ...config, fieldOperator: e.target.value })}
                    placeholder="Select comparison operator"
                  >
                    <MenuItem value="equals">Equals</MenuItem>
                    <MenuItem value="not_equals">Not equals</MenuItem>
                    <MenuItem value="contains">Contains</MenuItem>
                    <MenuItem value="not_contains">Does not contain</MenuItem>
                    <MenuItem value="is_empty">Is empty</MenuItem>
                    <MenuItem value="is_not_empty">Is not empty</MenuItem>
                  </SearchableMenu>
                </FormControl>
                {(config.fieldOperator !== 'is_empty' && config.fieldOperator !== 'is_not_empty') && (
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Field Value
                    </FormLabel>
                    <Input
                      value={config.fieldValue || ''}
                      onChange={(e) => setConfig({ ...config, fieldValue: e.target.value })}
                      placeholder="Enter value to compare against"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                  </FormControl>
                )}
              </VStack>
            )}

            {config.conditionType === 'Temperature Check' && (
              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Temperature Comparison
                  </FormLabel>
                  <SearchableMenu
                    value={config.temperatureOperator || 'equals'}
                    onChange={(e) => setConfig({ ...config, temperatureOperator: e.target.value })}
                    placeholder="Select comparison"
                  >
                    <MenuItem value="equals">Equals</MenuItem>
                    <MenuItem value="not_equals">Not equals</MenuItem>
                    <MenuItem value="greater_than">Hotter than</MenuItem>
                    <MenuItem value="less_than">Colder than</MenuItem>
                  </SearchableMenu>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Temperature Level
                  </FormLabel>
                  <SearchableMenu
                    value={config.temperatureValue || ''}
                    onChange={(e) => setConfig({ ...config, temperatureValue: e.target.value })}
                    placeholder="Select temperature level"
                  >
                    <MenuItem value="cold">Cold</MenuItem>
                    <MenuItem value="warm">Warm</MenuItem>
                    <MenuItem value="hot">Hot</MenuItem>
                    <MenuItem value="very_hot">Very Hot</MenuItem>
                  </SearchableMenu>
                </FormControl>
              </VStack>
            )}

            {config.conditionType === 'Source Check' && (
              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Source Comparison
                  </FormLabel>
                  <SearchableMenu
                    value={config.sourceOperator || 'equals'}
                    onChange={(e) => setConfig({ ...config, sourceOperator: e.target.value })}
                    placeholder="Select comparison"
                  >
                    <MenuItem value="equals">Equals</MenuItem>
                    <MenuItem value="not_equals">Not equals</MenuItem>
                    <MenuItem value="contains">Contains</MenuItem>
                    <MenuItem value="not_contains">Does not contain</MenuItem>
                  </SearchableMenu>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Source Value
                  </FormLabel>
                  <Input
                    value={config.sourceValue || ''}
                    onChange={(e) => setConfig({ ...config, sourceValue: e.target.value })}
                    placeholder="e.g., Facebook, Google Ads, Referral"
                    bg="white"
                    borderColor="gray.200"
                    _hover={{ borderColor: 'gray.300' }}
                    _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                    borderRadius="md"
                  />
                </FormControl>
              </VStack>
            )}

            {config.conditionType === 'Status Check' && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                  Lead Status
                </FormLabel>
              <SearchableMenu
                value={config.statusValue || ''}
                onChange={(e) => setConfig({ ...config, statusValue: e.target.value })}
                placeholder="Select lead status"
              >
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="qualified">Qualified</MenuItem>
                <MenuItem value="proposal">Proposal</MenuItem>
                <MenuItem value="negotiation">Negotiation</MenuItem>
                <MenuItem value="closed_won">Closed Won</MenuItem>
                <MenuItem value="closed_lost">Closed Lost</MenuItem>
                <MenuItem value="nurture">Nurture</MenuItem>
              </SearchableMenu>
              </FormControl>
            )}

            {config.conditionType === 'Email Check' && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                  Email Validation Type
                </FormLabel>
                <SearchableMenu
                  value={config.emailCheckType || 'has_valid'}
                  onChange={(e) => setConfig({ ...config, emailCheckType: e.target.value })}
                  placeholder="Select validation type"
                >
                  <MenuItem value="has_valid">Has valid email</MenuItem>
                  <MenuItem value="has_invalid">Has invalid email</MenuItem>
                  <MenuItem value="is_empty">Email is empty</MenuItem>
                  <MenuItem value="contains_domain">Contains specific domain</MenuItem>
                </SearchableMenu>
                {config.emailCheckType === 'contains_domain' && (
                  <FormControl mt={3}>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Domain
                    </FormLabel>
                    <Input
                      value={config.domainValue || ''}
                      onChange={(e) => setConfig({ ...config, domainValue: e.target.value })}
                      placeholder="e.g., gmail.com, yahoo.com"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                  </FormControl>
                )}
              </FormControl>
            )}

            {config.conditionType === 'Phone Check' && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                  Phone Validation Type
                </FormLabel>
                <SearchableMenu
                  value={config.phoneCheckType || 'has_valid'}
                  onChange={(e) => setConfig({ ...config, phoneCheckType: e.target.value })}
                  placeholder="Select validation type"
                >
                  <MenuItem value="has_valid">Has valid phone</MenuItem>
                  <MenuItem value="has_invalid">Has invalid phone</MenuItem>
                  <MenuItem value="is_empty">Phone is empty</MenuItem>
                  <MenuItem value="contains_country">Contains country code</MenuItem>
                </SearchableMenu>
                {config.phoneCheckType === 'contains_country' && (
                  <FormControl mt={3}>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Country Code
                    </FormLabel>
                    <Input
                      value={config.countryCode || ''}
                      onChange={(e) => setConfig({ ...config, countryCode: e.target.value })}
                      placeholder="e.g., +1, +91, +44"
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                  </FormControl>
                )}
              </FormControl>
            )}

            {config.conditionType === 'Message Validation' && (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Check Message For
                  </FormLabel>
                  <Input
                    value={config.keywords || ''}
                    onChange={(e) => setConfig({ ...config, keywords: e.target.value })}
                    placeholder="yes, confirm, interested, accept"
                    bg="white"
                    borderColor="gray.200"
                    _hover={{ borderColor: 'gray.300' }}
                    _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                    borderRadius="md"
                  />
                  <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                    Comma-separated keywords that trigger YES path (case insensitive)
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Message Source
                  </FormLabel>
                  <SearchableMenu
                    value={config.messageSource || 'whatsapp'}
                    onChange={(e) => setConfig({ ...config, messageSource: e.target.value })}
                    placeholder="Select message source"
                  >
                    <MenuItem value="whatsapp">WhatsApp Messages</MenuItem>
                    <MenuItem value="sms">SMS Messages</MenuItem>
                    <MenuItem value="email">Email Replies</MenuItem>
                    <MenuItem value="all">All Message Types</MenuItem>
                  </SearchableMenu>
                </FormControl>

                <FormControl>
                  <Checkbox
                    isChecked={config.exactMatch || false}
                    onChange={(e) => setConfig({ ...config, exactMatch: e.target.checked })}
                    colorScheme="blue"
                  >
                    <Text fontSize="sm">Exact word match only (not partial matches)</Text>
                  </Checkbox>
                </FormControl>

                <Divider />

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Reply Waiting
                  </FormLabel>
                  <VStack spacing={3} align="stretch">
                    <Checkbox
                      isChecked={config.waitForReply || false}
                      onChange={(e) => setConfig({ ...config, waitForReply: e.target.checked })}
                      colorScheme="blue"
                    >
                      <Text fontSize="sm" fontWeight="500">Wait for user reply before checking</Text>
                    </Checkbox>

                    {config.waitForReply && (
                      <VStack spacing={3} align="stretch" pl={6} borderLeft="2px" borderColor="blue.200">
                        <FormControl>
                          <FormLabel fontSize="xs" color="gray.600">
                            Wait Duration (minutes)
                          </FormLabel>
                          <NumberInput
                            value={config.waitMinutes || 60}
                            onChange={(value) => setConfig({ ...config, waitMinutes: parseInt(value) || 60 })}
                            min={1}
                            max={1440}
                            size="sm"
                          >
                            <NumberInputField
                              bg="white"
                              borderColor="gray.200"
                              _hover={{ borderColor: 'gray.300' }}
                              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                            />
                          </NumberInput>
                          <FormHelperText fontSize="xs" color="gray.500">
                            How long to wait for a reply before timing out
                          </FormHelperText>
                        </FormControl>

                        <FormControl>
                          <Checkbox
                            isChecked={config.noReplyPath || false}
                            onChange={(e) => setConfig({ ...config, noReplyPath: e.target.checked })}
                            colorScheme="orange"
                            size="sm"
                          >
                            <Text fontSize="xs">Enable "No Reply" path</Text>
                          </Checkbox>
                          <FormHelperText fontSize="xs" color="gray.500">
                            Add a third path for when users don't reply within the time limit
                          </FormHelperText>
                        </FormControl>
                      </VStack>
                    )}
                  </VStack>
                </FormControl>

                <Alert status="info" borderRadius="md" bg="blue.50">
                  <AlertIcon color="blue.500" />
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="blue.800">
                      How It Works
                    </Text>
                    <VStack spacing={1} align="start" mt={2}>
                      {config.waitForReply ? (
                        <>
                          <HStack spacing={2}>
                            <Badge colorScheme="blue" variant="solid" size="sm">⏱️ Wait</Badge>
                            <Text fontSize="xs" color="gray.700">Wait {config.waitMinutes || 60} minutes for reply</Text>
                          </HStack>
                          <HStack spacing={2}>
                            <Badge colorScheme="green" variant="solid" size="sm">YES Path</Badge>
                            <Text fontSize="xs" color="gray.700">Reply contains keywords</Text>
                          </HStack>
                          <HStack spacing={2}>
                            <Badge colorScheme="red" variant="solid" size="sm">NO Path</Badge>
                            <Text fontSize="xs" color="gray.700">Reply does NOT contain keywords</Text>
                          </HStack>
                          {config.noReplyPath && (
                            <HStack spacing={2}>
                              <Badge colorScheme="orange" variant="solid" size="sm">No Reply</Badge>
                              <Text fontSize="xs" color="gray.700">No reply within time limit</Text>
                            </HStack>
                          )}
                        </>
                      ) : (
                        <>
                          <HStack spacing={2}>
                            <Badge colorScheme="green" variant="solid" size="sm">YES Path</Badge>
                            <Text fontSize="xs" color="gray.700">Message contains keywords</Text>
                          </HStack>
                          <HStack spacing={2}>
                            <Badge colorScheme="red" variant="solid" size="sm">NO Path</Badge>
                            <Text fontSize="xs" color="gray.700">Message does NOT contain keywords</Text>
                          </HStack>
                        </>
                      )}
                    </VStack>
                  </Box>
                </Alert>
              </VStack>
            )}

            {config.conditionType === 'Date Check' && (
              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Date Field
                  </FormLabel>
                  <SearchableMenu
                    value={config.dateField || 'created_at'}
                    onChange={(e) => setConfig({ ...config, dateField: e.target.value })}
                    placeholder="Select date field"
                  >
                    <MenuItem value="created_at">Lead Created Date</MenuItem>
                    <MenuItem value="updated_at">Lead Updated Date</MenuItem>
                    <MenuItem value="last_contact">Last Contact Date</MenuItem>
                    <MenuItem value="followup_date">Follow-up Date</MenuItem>
                  </SearchableMenu>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Date Comparison
                  </FormLabel>
                  <SearchableMenu
                    value={config.dateOperator || 'is_before'}
                    onChange={(e) => setConfig({ ...config, dateOperator: e.target.value })}
                    placeholder="Select comparison"
                  >
                    <MenuItem value="is_before">Is before</MenuItem>
                    <MenuItem value="is_after">Is after</MenuItem>
                    <MenuItem value="is_today">Is today</MenuItem>
                    <MenuItem value="is_yesterday">Is yesterday</MenuItem>
                    <MenuItem value="is_this_week">Is this week</MenuItem>
                    <MenuItem value="is_this_month">Is this month</MenuItem>
                  </SearchableMenu>
                </FormControl>
                {(config.dateOperator === 'is_before' || config.dateOperator === 'is_after') && (
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Days
                    </FormLabel>
                    <NumberInput
                      value={config.daysValue || 7}
                      onChange={(value) => setConfig({ ...config, daysValue: parseInt(value) || 7 })}
                      min={1}
                      max={365}
                    >
                      <NumberInputField
                        bg="white"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'gray.300' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                        borderRadius="md"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                )}
              </VStack>
            )}

            {config.conditionType === 'Day Check' && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                  Day of Week
                </FormLabel>
              <SearchableMenu
                value={config.dayOfWeek || ''}
                onChange={(e) => setConfig({ ...config, dayOfWeek: e.target.value })}
                placeholder="Select day"
              >
                <MenuItem value="monday">Monday</MenuItem>
                <MenuItem value="tuesday">Tuesday</MenuItem>
                <MenuItem value="wednesday">Wednesday</MenuItem>
                <MenuItem value="thursday">Thursday</MenuItem>
                <MenuItem value="friday">Friday</MenuItem>
                <MenuItem value="saturday">Saturday</MenuItem>
                <MenuItem value="sunday">Sunday</MenuItem>
              </SearchableMenu>
              </FormControl>
            )}

            {config.conditionType === 'Age Check' && (
              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Age Comparison
                  </FormLabel>
                  <SearchableMenu
                    value={config.ageOperator || 'greater_than'}
                    onChange={(e) => setConfig({ ...config, ageOperator: e.target.value })}
                    placeholder="Select comparison"
                  >
                    <MenuItem value="greater_than">Older than</MenuItem>
                    <MenuItem value="less_than">Newer than</MenuItem>
                    <MenuItem value="equals">Exactly</MenuItem>
                  </SearchableMenu>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Days Since Creation
                  </FormLabel>
                  <NumberInput
                    value={config.ageDays || 30}
                    onChange={(value) => setConfig({ ...config, ageDays: parseInt(value) || 30 })}
                    min={1}
                    max={3650}
                  >
                    <NumberInputField
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </VStack>
            )}

            {config.conditionType === 'Funnel Progress' && (
              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Progress Comparison
                  </FormLabel>
                  <SearchableMenu
                    value={config.progressOperator || 'greater_than'}
                    onChange={(e) => setConfig({ ...config, progressOperator: e.target.value })}
                    placeholder="Select comparison"
                  >
                    <MenuItem value="greater_than">Greater than</MenuItem>
                    <MenuItem value="less_than">Less than</MenuItem>
                    <MenuItem value="equals">Equals</MenuItem>
                  </SearchableMenu>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Progress Percentage (%)
                  </FormLabel>
                  <NumberInput
                    value={config.progressValue || 50}
                    onChange={(value) => setConfig({ ...config, progressValue: parseInt(value) || 50 })}
                    min={0}
                    max={100}
                  >
                    <NumberInputField
                      bg="white"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'gray.300' }}
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      borderRadius="md"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </VStack>
            )}

            {config.conditionType === 'Conversion Check' && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                  Conversion Status
                </FormLabel>
                <SearchableMenu
                  value={config.conversionStatus || 'converted'}
                  onChange={(e) => setConfig({ ...config, conversionStatus: e.target.value })}
                  placeholder="Select conversion status"
                >
                  <MenuItem value="converted">Has converted</MenuItem>
                  <MenuItem value="not_converted">Has not converted</MenuItem>
                  <MenuItem value="recently_converted">Converted recently</MenuItem>
                </SearchableMenu>
                {config.conversionStatus === 'recently_converted' && (
                  <FormControl mt={3}>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Within Days
                    </FormLabel>
                    <NumberInput
                      value={config.conversionDays || 7}
                      onChange={(value) => setConfig({ ...config, conversionDays: parseInt(value) || 7 })}
                      min={1}
                      max={365}
                    >
                      <NumberInputField
                        bg="white"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'gray.300' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                        borderRadius="md"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                )}
              </FormControl>
            )}

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Custom Label (Optional)
              </FormLabel>
              <Input
                value={config.label || ''}
                onChange={(e) => setConfig({ ...config, label: e.target.value })}
                placeholder="e.g., Check Lead Score > 50"
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              />
              <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                Leave empty to auto-generate label based on condition settings
              </FormHelperText>
            </FormControl>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontSize="xs" fontWeight="500">
                  Conditional Logic
                </Text>
                <Text fontSize="xs" color="gray.600">
                  TRUE path: Condition met, workflow continues to connected node
                  <br />
                  FALSE path: Condition not met, workflow follows alternative path
                </Text>
              </Box>
            </Alert>
          </VStack>
        );

      case 'sequence':
        return (
          <VStack spacing={5} align="stretch">
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                Message sequences are configured in the node itself by double-clicking on the sequence node in the workflow canvas.
              </Text>
            </Alert>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                Sequence Name
              </FormLabel>
              <Input
                value={config.label || ''}
                onChange={(e) => setConfig({ ...config, label: e.target.value })}
                placeholder="e.g., Welcome Sequence"
                bg="white"
                borderColor="gray.200"
                _hover={{ borderColor: 'gray.300' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                borderRadius="md"
              />
              <FormHelperText fontSize="xs" color="gray.500" mt={1}>
                A descriptive name for this message sequence
              </FormHelperText>
            </FormControl>

            <Box
              p={4}
              bg="gray.50"
              borderRadius="md"
              border="1px"
              borderColor="gray.200"
            >
              <VStack spacing={3} align="start">
                <HStack spacing={2}>
                  <FiMessageSquare size={16} color="#B83280" />
                  <Text fontSize="sm" fontWeight="600" color="gray.700">
                    Sequence Configuration
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  To configure the sequence steps, messages, and timing:
                </Text>
                <VStack spacing={1} align="start" pl={4}>
                  <Text fontSize="xs" color="gray.600">• Double-click this sequence node in the workflow</Text>
                  <Text fontSize="xs" color="gray.600">• Add message steps with delays</Text>
                  <Text fontSize="xs" color="gray.600">• Choose channels (WhatsApp, Email, SMS)</Text>
                  <Text fontSize="xs" color="gray.600">• Configure message templates</Text>
                </VStack>
              </VStack>
            </Box>
          </VStack>
        );

      default:
        return (
          <Text fontSize="sm" color="gray.600">
            No configuration options available for this node type.
          </Text>
        );
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {renderConfigFields()}

      <HStack spacing={3} justify="space-between">
        <Button
          colorScheme="red"
          variant="outline"
          size="sm"
          leftIcon={<FiTrash2 />}
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete this ${node.type} node? This will also remove all connections to/from this node.`)) {
              onDelete(node.id);
              onCancel();
            }
          }}
        >
          Delete Node
        </Button>
        <HStack spacing={3}>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button colorScheme="blue" size="sm" onClick={handleSave}>
            Save Configuration
          </Button>
        </HStack>
      </HStack>
    </VStack>
  );
};

// Main Graph Builder Component
const AutomationRulesGraphBuilder = ({ rule, onSave, onClose }) => {
  const navigate = useNavigate();
  const { ruleId } = useParams();
  const toast = useToast();
  const authState = useSelector((state) => state.auth);
  const token = authState?.token || localStorage.getItem('token');
  const coachId = useSelector(getCoachId);

  // Set token on service
  useEffect(() => {
    const tokenToUse = token || localStorage.getItem('token');
    if (tokenToUse) {
      automationRulesService.setToken(tokenToUse);
    }
    if (coachId) {
      automationRulesService.setCoachId(coachId);
    }
  }, [token, coachId]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [ruleName, setRuleName] = useState(rule?.name || '');
  const [isActive, setIsActive] = useState(rule?.isActive !== false);
  const [saving, setSaving] = useState(false);

  // Available components from backend
  const [eventsActions, setEventsActions] = useState(null);
  const [loading, setLoading] = useState(true);

  // Drawer states
  const { isOpen: isNodePaletteOpen, onOpen: onNodePaletteOpen, onClose: onNodePaletteClose } = useDisclosure();
  const { isOpen: isNodeConfigOpen, onOpen: onNodeConfigOpen, onClose: onNodeConfigClose } = useDisclosure();

  const handleNodeConfigClose = useCallback(() => {
    setSelectedNode(null);
    // Clear selection from all nodes
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: false,
      }))
    );
    onNodeConfigClose();
  }, [onNodeConfigClose, setNodes]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [connectionSourceNode, setConnectionSourceNode] = useState(null);


  // Load events and actions from backend
  useEffect(() => {
    const fetchEventsActions = async () => {
      try {
        const response = await automationRulesService.getEventsAndActions();

        // Handle both direct service response and axios response structure
        const rawEventsActions = response.data || response || { events: [], actions: [] };

        // Sanitize the data (filter out billing triggers if needed)
        const sanitizedData = {
          ...rawEventsActions,
          events: (rawEventsActions.events || []).filter((event) => {
            const value = typeof event === 'string'
              ? event
              : event?.value || event?.label || event?.name || '';
            if (!value) return true;
            const normalized = value.toLowerCase();
            // Filter out billing-related triggers
            return !(
              normalized.includes('invoice') ||
              normalized.includes('subscription') ||
              normalized.includes('refund') ||
              normalized.includes('card_expired')
            );
          }),
        };

        setEventsActions(sanitizedData);
      } catch (error) {
        console.error('Error fetching events and actions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load available events and actions',
          status: 'error',
          duration: 3000,
        });

        // Fallback data if API fails
        setEventsActions({
          events: [
            {
              value: 'lead_created',
              label: 'Lead Created',
              category: 'Lead & Customer Lifecycle',
              description: 'Triggered when a new lead is created'
            },
            {
              value: 'lead_status_changed',
              label: 'Lead Status Changed',
              category: 'Lead & Customer Lifecycle',
              description: 'Triggered when a lead\'s status is updated'
            },
            {
              value: 'appointment_booked',
              label: 'Appointment Booked',
              category: 'Appointment & Calendar',
              description: 'Triggered when an appointment is booked'
            }
          ],
          actions: [
            {
              value: 'send_whatsapp_message',
              label: 'Send WhatsApp Message',
              category: 'Communication Actions',
              description: 'Send a WhatsApp message to a lead'
            },
            {
              value: 'send_email_message',
              label: 'Send Email Message',
              category: 'Communication Actions',
              description: 'Send an email message to a lead'
            },
            {
              value: 'add_lead_tag',
              label: 'Add Lead Tag',
              category: 'Lead Data & Funnel Actions',
              description: 'Add a tag to a lead'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEventsActions();
  }, [toast]);

  // Load rule data if ruleId is provided (standalone page mode)
  useEffect(() => {
    const loadRuleData = async () => {
      if (ruleId && !rule) {
        try {
          const response = await automationRulesService.getSequenceById(ruleId);
          const ruleData = response.data;
          setRuleName(ruleData.name || '');
          setIsActive(ruleData.isActive !== false);
          if (ruleData.nodes) {
            const nodesWithConfigs = ensureNodeConfigs(ruleData.nodes);
            setNodes(nodesWithConfigs);
            // Ensure existing edges have arrow markers
            const edgesWithArrows = (ruleData.edges || []).map(edge => ({
              ...edge,
              markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed, color: '#64748B' }
            }));
            setEdges(edgesWithArrows);
          }
        } catch (error) {
          console.error('Error loading rule:', error);
          toast({
            title: 'Error',
            description: 'Failed to load automation rule',
            status: 'error',
            duration: 3000,
          });
          navigate('/automation-rules');
        }
      }
    };

    loadRuleData();
  }, [ruleId, rule, navigate, toast]);

  // Function to ensure nodes have proper default configs
  const ensureNodeConfigs = (nodes) => {
    return nodes.map(node => {
      let defaultConfig = { ...node.data?.config };

      // Set default configs based on node type
      if (node.nodeType === 'create_task' || node.data?.nodeType === 'create_task') {
        if (!defaultConfig.taskName && !defaultConfig.name) {
          defaultConfig.taskName = 'New Task';
        }
        if (!defaultConfig.taskDescription && !defaultConfig.description) {
          defaultConfig.taskDescription = 'Task created by automation';
        }
      }

      return {
        ...node,
        data: {
          ...node.data,
          config: defaultConfig
        }
      };
    });
  };

  // Initialize nodes and edges if editing existing rule (drawer mode) or start empty for new rules
  useEffect(() => {
    if (rule && rule.nodes) {
      const nodesWithConfigs = ensureNodeConfigs(rule.nodes);
      setNodes(nodesWithConfigs);
      // Ensure existing edges have arrow markers
      const edgesWithArrows = (rule.edges || []).map(edge => ({
        ...edge,
        markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed, color: '#64748B' }
      }));
      setEdges(edgesWithArrows);
      setRuleName(rule.name || '');
      setIsActive(rule.isActive !== false);
    } else if (!rule && !ruleId) {
      // Start with empty graph for new rules
      setNodes([]);
      setEdges([]);
    }
  }, [rule, ruleId, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => {
      setConnectionSourceNode(null);
      setEdges((eds) => addEdge({
        ...params,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#64748B' }
      }, eds));
    },
    [setEdges]
  );

  const onConnectStart = useCallback(
    (event, { nodeId, handleId, handleType }) => {
      setConnectionSourceNode(nodeId);
    },
    []
  );

  const onConnectEnd = useCallback(
    (event) => {
      // Only open the node palette if no connection was made (connectionSourceNode still exists)
      if (connectionSourceNode) {
        onNodePaletteOpen();
      }
    },
    [connectionSourceNode, onNodePaletteOpen]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type');
      const nodeData = JSON.parse(event.dataTransfer.getData('application/reactflow/data'));

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - event.target.getBoundingClientRect().left,
        y: event.clientY - event.target.getBoundingClientRect().top,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: nodeData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const addNode = useCallback((nodeType, nodeData) => {
    const position = {
      x: Math.random() * 400 + 200,
      y: Math.random() * 400 + 100,
    };

    // Set default config based on node type
    let defaultConfig = {};
    if (nodeData.value === 'create_task' || nodeData.type === 'create_task') {
      defaultConfig = {
        taskName: 'New Task',
        taskDescription: 'Task created by automation'
      };
    }

    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: {
        label: nodeData.label || nodeData.name || nodeType,
        nodeType: nodeData.value || nodeData.type || nodeType,
        description: nodeData.description || '',
        config: { ...defaultConfig, ...nodeData.config },
        ...nodeData,
      },
    };

    setNodes((nds) => [...nds, newNode]);

    // If there's a pending connection from a source node, create the connection
    if (connectionSourceNode) {
      const sourceNode = nodes.find(n => n.id === connectionSourceNode);
      if (sourceNode) {
        const newEdge = {
          id: `edge-${connectionSourceNode}-${newNode.id}`,
          source: connectionSourceNode,
          target: newNode.id,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#64748B' }
        };
        setEdges((eds) => [...eds, newEdge]);
      }
      setConnectionSourceNode(null);
    }

    onNodePaletteClose();
  }, [setNodes, setEdges, connectionSourceNode, nodes, onNodePaletteClose]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    // Update the selected state of all nodes
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: n.id === node.id,
      }))
    );
    onNodeConfigOpen();
  }, [onNodeConfigOpen, setNodes]);

  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      handleNodeConfigClose();
    }
  }, [setNodes, setEdges, selectedNode, handleNodeConfigClose]);

  // Keyboard support for deleting nodes
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' && selectedNode) {
        event.preventDefault();
        if (window.confirm(`Are you sure you want to delete this ${selectedNode.type} node? This will also remove all connections to/from this node.`)) {
          deleteNode(selectedNode.id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, deleteNode]);

  const updateNodeConfig = useCallback((config) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                ...config,
              },
            }
          : node
      )
    );
    setSelectedNode((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        ...config,
      },
    }));

    // Show success message
    toast({
      title: 'Success',
      description: 'Node configuration saved',
      status: 'success',
      duration: 2000,
    });
  }, [selectedNode, setNodes, toast]);

  // Group triggers and actions by category
  const nodeCategories = useMemo(() => {
    if (!eventsActions) return { triggers: {}, actions: {} };

    const triggers = eventsActions.events || [];
    const actions = eventsActions.actions || [];

    // Group triggers by category
    const groupedTriggers = {};
    triggers.forEach(event => {
      const category = event.category || 'Other';
      if (!groupedTriggers[category]) {
        groupedTriggers[category] = [];
      }
      groupedTriggers[category].push(event);
    });

    // Group actions by category
    const groupedActions = {};
    actions.forEach(action => {
      const category = action.category || 'Other';
      if (!groupedActions[category]) {
        groupedActions[category] = [];
      }
      groupedActions[category].push(action);
    });

    return { triggers: groupedTriggers, actions: groupedActions };
  }, [eventsActions]);

  // Filter nodes based on search query
  const filteredTriggers = useMemo(() => {
    if (!searchQuery.trim()) return nodeCategories.triggers;
    const query = searchQuery.toLowerCase();
    const filtered = {};
    Object.keys(nodeCategories.triggers).forEach(category => {
      const categoryItems = nodeCategories.triggers[category].filter(event => {
      const label = typeof event === 'string' ? event : event.label || event.value || '';
        const desc = typeof event === 'string' ? '' : event.description || '';
        return label.toLowerCase().includes(query) || desc.toLowerCase().includes(query);
    });
      if (categoryItems.length > 0) {
        filtered[category] = categoryItems;
      }
    });
    return filtered;
  }, [nodeCategories.triggers, searchQuery]);

  const filteredActions = useMemo(() => {
    if (!searchQuery.trim()) return nodeCategories.actions;
    const query = searchQuery.toLowerCase();
    const filtered = {};
    Object.keys(nodeCategories.actions).forEach(category => {
      const categoryItems = nodeCategories.actions[category].filter(action => {
      const label = typeof action === 'string' ? action : action.label || action.value || '';
        const desc = typeof action === 'string' ? '' : action.description || '';
        return label.toLowerCase().includes(query) || desc.toLowerCase().includes(query);
    });
      if (categoryItems.length > 0) {
        filtered[category] = categoryItems;
      }
    });
    return filtered;
  }, [nodeCategories.actions, searchQuery]);

  const handleSave = async () => {
    if (!ruleName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a name for the automation rule',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Validate that there's at least one trigger and one action
    const hasTrigger = nodes.some(node => node.type === 'trigger');
    const hasAction = nodes.some(node => node.type === 'action');

    // Validate that all nodes are properly configured
    const unconfiguredNodes = [];
    const validationErrors = [];

    nodes.forEach(node => {
      const nodeData = node.data || {};
      const nodeType = node.type;

      // Check basic configuration
      if (!nodeData.nodeType || nodeData.nodeType === '') {
        unconfiguredNodes.push(`${nodeType} node: missing node type`);
        return;
      }

      // Validate based on node type
      switch (nodeType) {
        case 'trigger':
          if (!nodeData.nodeType || nodeData.nodeType === '') {
            validationErrors.push(`Trigger node: Please select a trigger event`);
          }
          break;

        case 'action':
          if (!nodeData.nodeType || nodeData.nodeType === '') {
            validationErrors.push(`Action node: Please select an action type`);
          }
          break;

        case 'condition':
          if (!nodeData.conditionType || nodeData.conditionType === '') {
            validationErrors.push(`Condition node: Please select a condition type`);
          } else {
            // Validate condition-specific fields
            if (nodeData.conditionType === 'Lead Score') {
              if (!nodeData.scoreValue && nodeData.scoreValue !== 0) {
                validationErrors.push(`Condition node: Please set a score value for Lead Score condition`);
              }
            } else if (nodeData.conditionType === 'Tag Check') {
              if (!nodeData.tagName || nodeData.tagName.trim() === '') {
                validationErrors.push(`Condition node: Please enter a tag name for Tag Check condition`);
              }
            } else if (nodeData.conditionType === 'Field Check') {
              if (!nodeData.fieldName || nodeData.fieldName === '') {
                validationErrors.push(`Condition node: Please select a field name for Field Check condition`);
              }
              if (nodeData.fieldOperator !== 'is_empty' && nodeData.fieldOperator !== 'is_not_empty') {
                if (!nodeData.fieldValue || nodeData.fieldValue.trim() === '') {
                  validationErrors.push(`Condition node: Please enter a field value for Field Check condition`);
                }
              }
            }
          }
          break;

        case 'delay':
          const hasTime = (nodeData.delayHours && nodeData.delayHours > 0) ||
                         (nodeData.delayMinutes && nodeData.delayMinutes > 0) ||
                         (nodeData.delaySeconds && nodeData.delaySeconds > 0);
          if (!hasTime) {
            validationErrors.push(`Delay node: Please set a valid delay duration (hours, minutes, or seconds)`);
          }
          break;

        case 'sequence':
          if (!nodeData.label || nodeData.label.trim() === '') {
            validationErrors.push(`Sequence node: Please enter a sequence name`);
          }
          break;
      }
    });

    // Check if we have at least one trigger
    if (!hasTrigger) {
      validationErrors.push('Workflow must contain at least one trigger node');
    }

    // Check if we have at least one action
    const hasWorkflowAction = nodes.some(node => node.type === 'action' || node.type === 'sequence');
    if (!hasWorkflowAction) {
      validationErrors.push('Workflow must contain at least one action or sequence node');
    }

    if (validationErrors.length > 0) {
      toast({
        title: 'Validation Error',
        description: (
          <VStack spacing={2} align="start" maxH="200px" overflowY="auto">
            <Text fontSize="sm">Please configure all nodes before saving:</Text>
            {validationErrors.map((error, index) => (
              <Text key={index} fontSize="xs" color="red.600">
                • {error}
              </Text>
            ))}
          </VStack>
        ),
        status: 'error',
        duration: 8000,
      });
      return;
    }

    setSaving(true);

    try {
      // Transform nodes to match backend schema
      const transformedNodes = nodes.map((node) => ({
        id: node.id,
        type: node.type,
        nodeType: node.data?.nodeType || node.data?.type || '',
        label: node.data?.label || node.data?.nodeType || 'Node',
        position: node.position || { x: 0, y: 0 },
        data: node.data || {},
        config: node.data?.config || {}
      }));

      const ruleData = {
        name: ruleName,
        coachId,
        isActive,
        workflowType: 'graph',
        nodes: transformedNodes,
        edges,
        viewport: { x: 0, y: 0, zoom: 1 }
      };

      if (onSave) {
        // Used as drawer/modal - call provided onSave function
        await onSave(ruleData);
      } else {
        // Used as standalone page - call API directly
        if (ruleId) {
          // Update existing rule
          await automationRulesService.updateSequence(ruleId, ruleData);
          toast({
            title: 'Success',
            description: 'Automation rule updated successfully',
            status: 'success',
            duration: 3000,
          });
        } else {
          // Create new rule
          await automationRulesService.createSequence(ruleData);
          toast({
            title: 'Success',
            description: 'Automation rule created successfully',
            status: 'success',
            duration: 3000,
          });
        }
        // Navigate back to automation rules list
        navigate('/automation-rules');
      }
    } catch (error) {
      console.error('Error saving rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to save automation rule',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        minH="100vh"
        h="100vh"
        w="100vw"
        position="absolute"
        top={0}
        left={0}
        p={8}
        textAlign="center"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Loading automation builder...</Text>
        </VStack>
      </Box>
    );
  }

  // Render main content function
  const renderMainContent = () => {
    return (
    <Box
      minH="100vh"
      h="100vh"
      w="100vw"
      position="absolute"
      top={0}
      left={0}
      display="flex"
      flexDirection="column"
      bg="gray.50"
    >
      {/* Header */}
      <Box p={4} borderBottom="1px" borderColor="gray.200" bg="white">
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="md" color="gray.900">
              Automation Builder - FunnelsEye
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Drag and drop components to build your automation workflow
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiPlus />}
              variant="outline"
              size="sm"
              onClick={onNodePaletteOpen}
              colorScheme="blue"
            >
              Add Node
            </Button>
            <Button
              leftIcon={<FiSave />}
              colorScheme="blue"
              onClick={handleSave}
              isLoading={saving}
              loadingText="Saving..."
            >
              Save Rule
            </Button>
            <Button
              leftIcon={<FiX />}
              variant="ghost"
              onClick={() => {
                if (onClose) {
                  onClose();
                } else {
                  navigate('/automation-rules');
                }
              }}
            >
              Cancel
            </Button>
          </HStack>
        </HStack>

        {/* Rule Settings */}
        <Box mt={4}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Rule Name</FormLabel>
              <Input
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="Enter rule name"
                size="sm"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Status</FormLabel>
              <Select
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
                size="sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormControl>
          </SimpleGrid>
        </Box>
      </Box>

      {/* Main Content */}
      {/* React Flow Canvas */}
      <Box flex={1} h="100%" position="relative">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onConnectStart={onConnectStart}
              onConnectEnd={onConnectEnd}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="top-right"
            >
              <Controls />
              <MiniMap />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </ReactFlowProvider>
        </Box>
      </Box>

    );
  };

  return (
    <>
      {/* Main Content */}
      {renderMainContent()}

      {/* Node Palette Drawer */}
      <Drawer
        isOpen={isNodePaletteOpen}
        placement="right"
        onClose={() => {
          onNodePaletteClose();
          setSearchQuery('');
          setActiveTab(0);
        }}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="bold">Add Node to Workflow</Text>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="md"
                />
              </InputGroup>
            </VStack>
          </DrawerHeader>
          <DrawerBody>
            <Tabs index={activeTab} onChange={setActiveTab}>
              <TabList>
                <Tab>Triggers</Tab>
                <Tab>Actions</Tab>
                <Tab>Flow Control</Tab>
              </TabList>

              <TabPanels>
                {/* Triggers Tab */}
                <TabPanel px={0} pt={4}>
                  <VStack spacing={2} align="stretch" maxH="calc(100vh - 300px)" overflowY="auto">
                    {Object.keys(filteredTriggers).length === 0 ? (
                      <Text color="gray.500" textAlign="center" py={8}>
                        No triggers found matching "{searchQuery}"
                      </Text>
                    ) : searchQuery.trim() ? (
                      // When searching, show all results in groups without accordion
                      Object.keys(filteredTriggers).map((category) => {
                        const simpleCategory = category
                          .replace('Lead & Customer Lifecycle', 'Leads')
                          .replace('Funnel & Conversion', 'Funnels')
                          .replace('Appointment & Calendar', 'Appointments')
                          .replace('Task & System', 'Tasks')
                          .replace('Payment & Subscription', 'Payments');

                        return (
                          <Box key={category} mb={4}>
                            <Text fontSize="xs" fontWeight="500" color="gray.500" textTransform="uppercase" mb={2} px={2}>
                              {simpleCategory}
                            </Text>
                            <VStack spacing={2} align="stretch">
                              {(filteredTriggers[category] || []).map((trigger, index) => {
                                const triggerLabel = typeof trigger === 'string' ? trigger : trigger.label || trigger.value;
                                const triggerValue = typeof trigger === 'string' ? trigger : trigger.value || trigger.label;
                                const triggerDesc = typeof trigger === 'string' ? '' : trigger.description || '';
                                const TriggerIcon = getTriggerIcon(triggerValue);
                                return (
                                  <Card
                                    key={`${category}-${index}`}
                                    cursor="pointer"
                                    onClick={() => {
                                      addNode('trigger', trigger);
                                      setSearchQuery('');
                                    }}
                                    _hover={{
                                      borderColor: 'blue.300',
                                      boxShadow: 'md',
                                      transform: 'translateY(-1px)'
                                    }}
                                    transition="all 0.2s"
                                    border="1px"
                                    borderColor="gray.200"
                                    bg="white"
                                    p={3}
                                  >
                                    <HStack spacing={3} align="start">
                                      <Box
                                        p={2}
                                        borderRadius="md"
                                        bg="blue.50"
                                        color="blue.600"
                                        flexShrink={0}
                                      >
                                        <TriggerIcon size={18} />
                                      </Box>
                                      <VStack align="start" spacing={0.5} flex={1}>
                                        <Text fontSize="sm" fontWeight="600" color="gray.700">
                                          {triggerLabel}
                                        </Text>
                                        {triggerDesc && (
                                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                            {triggerDesc}
                                          </Text>
                                        )}
                                      </VStack>
                                    </HStack>
                                  </Card>
                                );
                              })}
                            </VStack>
                          </Box>
                        );
                      })
                    ) : (
                      // When not searching, show accordion
                      <Accordion allowMultiple defaultIndex={[]}>
                        {Object.keys(filteredTriggers).map((category) => {
                          const simpleCategory = category
                            .replace('Lead & Customer Lifecycle', 'Leads')
                            .replace('Funnel & Conversion', 'Funnels')
                            .replace('Appointment & Calendar', 'Appointments')
                            .replace('Task & System', 'Tasks')
                            .replace('Payment & Subscription', 'Payments');

                          return (
                            <AccordionItem key={category} border="none" mb={2}>
                              <AccordionButton
                                px={2}
                                py={3}
                                bg="gray.50"
                                borderRadius="md"
                                minH="44px"
                                _hover={{ bg: 'gray.100' }}
                                _expanded={{ bg: 'blue.50', color: 'blue.700' }}
                              >
                                <Box flex="1" textAlign="left">
                                  <Text fontSize="xs" fontWeight="500" textTransform="uppercase">
                                    {simpleCategory}
                                  </Text>
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                              <AccordionPanel px={2} pt={2} pb={0}>
                                <VStack spacing={2} align="stretch">
                                  {(filteredTriggers[category] || []).map((trigger, index) => {
                                    const triggerLabel = typeof trigger === 'string' ? trigger : trigger.label || trigger.value;
                                    const triggerValue = typeof trigger === 'string' ? trigger : trigger.value || trigger.label;
                                    const triggerDesc = typeof trigger === 'string' ? '' : trigger.description || '';
                                    const TriggerIcon = getTriggerIcon(triggerValue);
                                    return (
                                      <Card
                                        key={`${category}-${index}`}
                                        cursor="pointer"
                                        onClick={() => {
                                          addNode('trigger', trigger);
                                          setSearchQuery('');
                                        }}
                                        _hover={{
                                          borderColor: 'blue.300',
                                          boxShadow: 'md',
                                          transform: 'translateY(-1px)'
                                        }}
                                        transition="all 0.2s"
                                        border="1px"
                                        borderColor="gray.200"
                                        bg="white"
                                        p={3}
                                      >
                                        <HStack spacing={3} align="start">
                                          <Box
                                            p={2}
                                            borderRadius="md"
                                            bg="blue.50"
                                            color="blue.600"
                                            flexShrink={0}
                                          >
                                            <TriggerIcon size={18} />
                                          </Box>
                                          <VStack align="start" spacing={0.5} flex={1}>
                                            <Text fontSize="sm" fontWeight="600" color="gray.700">
                                              {triggerLabel}
                                            </Text>
                                            {triggerDesc && (
                                              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                                {triggerDesc}
                                              </Text>
                                            )}
                                          </VStack>
                                        </HStack>
                                      </Card>
                                    );
                                  })}
                                </VStack>
                              </AccordionPanel>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    )}
                  </VStack>
                </TabPanel>

                {/* Actions Tab */}
                <TabPanel px={0} pt={4}>
                  <VStack spacing={2} align="stretch" maxH="calc(100vh - 300px)" overflowY="auto">
                    {Object.keys(filteredActions).length === 0 ? (
                      <Text color="gray.500" textAlign="center" py={8}>
                        No actions found matching "{searchQuery}"
                      </Text>
                    ) : searchQuery.trim() ? (
                      // When searching, show all results in groups without accordion
                      Object.keys(filteredActions).map((category) => {
                        const simpleCategory = category
                          .replace('Lead Data & Funnel Actions', 'Lead Actions')
                          .replace('Communication Actions', 'Messages')
                          .replace('Task & Workflow Actions', 'Tasks')
                          .replace('Zoom Integration Actions', 'Zoom')
                          .replace('Payment Actions', 'Payments')
                          .replace('System Actions', 'System');

                        return (
                          <Box key={category} mb={4}>
                            <Text fontSize="xs" fontWeight="500" color="gray.500" textTransform="uppercase" mb={2} px={2}>
                              {simpleCategory}
                            </Text>
                            <VStack spacing={2} align="stretch">
                              {(filteredActions[category] || []).map((action, index) => {
                                const actionLabel = typeof action === 'string' ? action : action.label || action.value;
                                const actionValue = typeof action === 'string' ? action : action.value || action.label;
                                const actionDesc = typeof action === 'string' ? '' : action.description || '';
                                const ActionIcon = getActionIcon(actionValue);
                                return (
                                  <Card
                                    key={`${category}-${index}`}
                                    cursor="pointer"
                                    onClick={() => {
                                      addNode('action', action);
                                      setSearchQuery('');
                                    }}
                                    _hover={{
                                      borderColor: 'green.300',
                                      boxShadow: 'md',
                                      transform: 'translateY(-1px)'
                                    }}
                                    transition="all 0.2s"
                                    border="1px"
                                    borderColor="gray.200"
                                    bg="white"
                                    p={3}
                                  >
                                    <HStack spacing={3} align="start">
                                      <Box
                                        p={2}
                                        borderRadius="md"
                                        bg="green.50"
                                        color="green.600"
                                        flexShrink={0}
                                      >
                                        <ActionIcon size={18} />
                                      </Box>
                                      <VStack align="start" spacing={0.5} flex={1}>
                                        <Text fontSize="sm" fontWeight="600" color="gray.700">
                                          {actionLabel}
                                        </Text>
                                        {actionDesc && (
                                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                            {actionDesc}
                                          </Text>
                                        )}
                                      </VStack>
                                    </HStack>
                                  </Card>
                                );
                              })}
                            </VStack>
                          </Box>
                        );
                      })
                    ) : (
                      // When not searching, show accordion
                      <Accordion allowMultiple defaultIndex={[]}>
                        {Object.keys(filteredActions).map((category) => {
                          const simpleCategory = category
                            .replace('Lead Data & Funnel Actions', 'Lead Actions')
                            .replace('Communication Actions', 'Messages')
                            .replace('Task & Workflow Actions', 'Tasks')
                            .replace('Zoom Integration Actions', 'Zoom')
                            .replace('Payment Actions', 'Payments')
                            .replace('System Actions', 'System');

                          return (
                            <AccordionItem key={category} border="none" mb={2}>
                              <AccordionButton
                                px={2}
                                py={3}
                                bg="gray.50"
                                borderRadius="md"
                                minH="44px"
                                _hover={{ bg: 'gray.100' }}
                                _expanded={{ bg: 'green.50', color: 'green.700' }}
                              >
                                <Box flex="1" textAlign="left">
                                  <Text fontSize="xs" fontWeight="500" textTransform="uppercase">
                                    {simpleCategory}
                                  </Text>
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                              <AccordionPanel px={2} pt={2} pb={0}>
                                <VStack spacing={2} align="stretch">
                                  {(filteredActions[category] || []).map((action, index) => {
                                    const actionLabel = typeof action === 'string' ? action : action.label || action.value;
                                    const actionValue = typeof action === 'string' ? action : action.value || action.label;
                                    const actionDesc = typeof action === 'string' ? '' : action.description || '';
                                    const ActionIcon = getActionIcon(actionValue);
                                    return (
                                      <Card
                                        key={`${category}-${index}`}
                                        cursor="pointer"
                                        onClick={() => {
                                          addNode('action', action);
                                          setSearchQuery('');
                                        }}
                                        _hover={{
                                          borderColor: 'green.300',
                                          boxShadow: 'md',
                                          transform: 'translateY(-1px)'
                                        }}
                                        transition="all 0.2s"
                                        border="1px"
                                        borderColor="gray.200"
                                        bg="white"
                                        p={3}
                                      >
                                        <HStack spacing={3} align="start">
                                          <Box
                                            p={2}
                                            borderRadius="md"
                                            bg="green.50"
                                            color="green.600"
                                            flexShrink={0}
                                          >
                                            <ActionIcon size={18} />
                                          </Box>
                                          <VStack align="start" spacing={0.5} flex={1}>
                                            <Text fontSize="sm" fontWeight="600" color="gray.700">
                                              {actionLabel}
                                            </Text>
                                            {actionDesc && (
                                              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                                {actionDesc}
                                              </Text>
                                            )}
                                          </VStack>
                                        </HStack>
                                      </Card>
                                    );
                                  })}
                                </VStack>
                              </AccordionPanel>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    )}
                  </VStack>
                </TabPanel>

                {/* Flow Control Tab */}
                <TabPanel px={0} pt={4}>
                  <VStack spacing={2} align="stretch" maxH="calc(100vh - 300px)" overflowY="auto">
                    {(() => {
                      const baseItems = {
                        'Flow Control': [
                          { label: 'Delay', type: 'delay', icon: FiClock, color: 'orange', data: { label: 'Delay', delayMinutes: 5 }, description: 'Wait for a specified amount of time before continuing' },
                          { label: 'Condition', type: 'condition', icon: FiFilter, color: 'purple', data: { label: 'Condition', conditionType: 'Custom' }, description: 'Branch workflow based on conditions (if/else)' },
                          { label: 'Message Validation', type: 'condition', icon: FiMessageSquare, color: 'blue', data: { label: 'Message Validation', conditionType: 'Message Validation', config: { messageSource: 'whatsapp', keywords: 'yes,confirm,interested', exactMatch: false, waitForReply: false, waitMinutes: 60, noReplyPath: false } }, description: 'Check if message contains keywords and route to YES or NO paths (with optional wait for reply)' },
                        ]
                      };

                      const flowControlItems = baseItems;

                      const filtered = {};
                      Object.keys(flowControlItems).forEach(category => {
                        const categoryItems = flowControlItems[category].filter(item =>
                          !searchQuery.trim() ||
                          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
                        );
                        if (categoryItems.length > 0) {
                          filtered[category] = categoryItems;
                        }
                      });

                      if (Object.keys(filtered).length === 0) {
                        return (
                          <Text color="gray.500" textAlign="center" py={8}>
                            No flow control items found matching "{searchQuery}"
                          </Text>
                        );
                      }

                      return searchQuery.trim() ? (
                        // When searching, show all results in groups without accordion
                        Object.keys(filtered).map((category) => {
                          const simpleCategory = category.replace('Flow Control', 'Flow');
                          return (
                            <Box key={category} mb={4}>
                              <Text fontSize="xs" fontWeight="500" color="gray.500" textTransform="uppercase" mb={2} px={2}>
                                {simpleCategory}
                              </Text>
                              <VStack spacing={2} align="stretch">
                                {filtered[category].map((item, index) => {
                                  const IconComponent = item.icon;
                                  return (
                                    <Card
                                      key={`${category}-${index}`}
                                      cursor="pointer"
                                      onClick={() => {
                                        addNode(item.type, item.data);
                                        setSearchQuery('');
                                      }}
                                      _hover={{
                                        borderColor: `${item.color}.300`,
                                        boxShadow: 'md',
                                        transform: 'translateY(-1px)'
                                      }}
                                      transition="all 0.2s"
                                      border="1px"
                                      borderColor="gray.200"
                                      bg="white"
                                      p={3}
                                    >
                                      <HStack spacing={3} align="start">
                                        <Box
                                          p={2}
                                          borderRadius="md"
                                          bg={`${item.color}.50`}
                                          color={`${item.color}.600`}
                                          flexShrink={0}
                                        >
                                          <IconComponent size={18} />
                                        </Box>
                                        <VStack align="start" spacing={0.5} flex={1}>
                                          <Text fontSize="sm" fontWeight="600" color="gray.700">
                                            {item.label}
                                          </Text>
                                          {item.description && (
                                            <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                              {item.description}
                                            </Text>
                                          )}
                                        </VStack>
                                      </HStack>
                                    </Card>
                                  );
                                })}
                              </VStack>
                            </Box>
                          );
                        })
                      ) : (
                        // When not searching, show accordion
                        <Accordion allowMultiple defaultIndex={[]}>
                          {Object.keys(filtered).map((category) => {
                            const simpleCategory = category.replace('Flow Control', 'Flow');
                            return (
                              <AccordionItem key={category} border="none" mb={2}>
                                <AccordionButton
                                  px={2}
                                  py={3}
                                  bg="gray.50"
                                  borderRadius="md"
                                  minH="44px"
                                  _hover={{ bg: 'gray.100' }}
                                  _expanded={{ bg: 'purple.50', color: 'purple.700' }}
                                >
                                  <Box flex="1" textAlign="left">
                                    <Text fontSize="xs" fontWeight="500" textTransform="uppercase">
                                      {simpleCategory}
                                    </Text>
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel px={2} pt={2} pb={0}>
                                  <VStack spacing={2} align="stretch">
                                    {filtered[category].map((item, index) => {
                                      const IconComponent = item.icon;
                                      return (
                                        <Card
                                          key={`${category}-${index}`}
                                          cursor="pointer"
                                          onClick={() => {
                                            addNode(item.type, item.data);
                                            setSearchQuery('');
                                          }}
                                          _hover={{
                                            borderColor: `${item.color}.300`,
                                            boxShadow: 'md',
                                            transform: 'translateY(-1px)'
                                          }}
                                          transition="all 0.2s"
                                          border="1px"
                                          borderColor="gray.200"
                                          bg="white"
                                          p={3}
                                        >
                                          <HStack spacing={3} align="start">
                                            <Box
                                              p={2}
                                              borderRadius="md"
                                              bg={`${item.color}.50`}
                                              color={`${item.color}.600`}
                                              flexShrink={0}
                                            >
                                              <IconComponent size={18} />
                                            </Box>
                                            <VStack align="start" spacing={0.5} flex={1}>
                                              <Text fontSize="sm" fontWeight="600" color="gray.700">
                                                {item.label}
                                              </Text>
                                              {item.description && (
                                                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                                  {item.description}
                                                </Text>
                                              )}
                                            </VStack>
                                          </HStack>
                                        </Card>
                                      );
                                    })}
                                  </VStack>
                                </AccordionPanel>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      );
                    })()}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Node Configuration Drawer */}
      <Drawer
        isOpen={isNodeConfigOpen}
        placement="right"
        onClose={handleNodeConfigClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <HStack spacing={2}>
              <FiSettings />
              <Text>Configure Node</Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody>
            {selectedNode && (
              <NodeConfigForm
                node={selectedNode}
                onSave={updateNodeConfig}
                onCancel={handleNodeConfigClose}
                onDelete={deleteNode}
              />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

  </>
  );
};



export default AutomationRulesGraphBuilder;