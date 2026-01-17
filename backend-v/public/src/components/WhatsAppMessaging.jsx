import React, { useState, useEffect, useCallback } from 'react';
import environmentConfig from '../config/environment.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  MessageSquare, 
  Smartphone, 
  Users, 
  BarChart3, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Search,
  Download,
  Eye,
  MoreHorizontal,
  Settings,
  Plus,
  TestTube,
  FileText,
  Phone,
  Mail,
  Image,
  Video,
  File,
  Key,
  Shield,
  Zap,
  Brain,
  Webhook,
  Upload,
  Edit,
  Trash2,
  Copy,
  PlayCircle,
  PauseCircle,
  AlertTriangle,
  Info,
  Database,
  Globe,
  MessageCircle,
  Target,
  Layers,
  Archive,
  UserCheck,
  Headphones,
  BookOpen,
  Network,
  Activity,
  Save
} from 'lucide-react';
import axios from 'axios';

const WhatsAppMessaging = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Central WhatsApp Configuration
  const [config, setConfig] = useState(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  
  // Debug config dialog state changes
  useEffect(() => {
    console.log('🔄 [WHATSAPP] configDialogOpen changed to:', configDialogOpen);
  }, [configDialogOpen]);
  
  // Debug config state changes
  useEffect(() => {
    console.log('🔄 [WHATSAPP] config changed to:', config);
  }, [config]);
  const [configForm, setConfigForm] = useState({
    phoneNumberId: '',
    accessToken: '',
    businessAccountId: ''
  });

  // Analytics data
  const [analytics, setAnalytics] = useState(null);
  
  // Messages data
  const [messages, setMessages] = useState([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesTotal, setMessagesTotal] = useState(0);
  
  // Templates data
  const [templates, setTemplates] = useState([]);
  
  // Send message dialog
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendForm, setSendForm] = useState({
    to: '',
    message: '',
    templateName: '',
    parameters: '',
    mediaUrl: '',
    mediaType: 'image',
    leadId: '',
    clientId: ''
  });
  
  // Contact suggestions
  const [contacts, setContacts] = useState([]);
  const [contactSuggestions, setContactSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Bulk messaging
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [bulkMessage, setBulkMessage] = useState('');
  
  // Contact editing
  const [editingContact, setEditingContact] = useState(null);
  const [contactEditDialog, setContactEditDialog] = useState(false);
  const [contactEditForm, setContactEditForm] = useState({ name: '', phoneNumber: '' });
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    messageType: 'all',
    senderType: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });

  // Custom hook for API calls with timeout
  const useWhatsAppAPI = () => {
    const [apiLoading, setApiLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    const apiCall = useCallback(async (endpoint, options = {}) => {
      setApiLoading(true);
      setApiError(null);
      try {
        // Get base URL from environment or use default
        const getBaseUrl = () => {
          // Check for manual override first
          if (window.MANUAL_API_URL) {
            return window.MANUAL_API_URL;
          }
          
          // Check for global config
          if (window.API_CONFIG && window.API_CONFIG.API_ENDPOINT) {
            return window.API_CONFIG.API_ENDPOINT;
          }
          
          // Use environment config for API URL
          return environmentConfig.getApiUrl('');
        };
        
        const baseUrl = getBaseUrl();
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const fullUrl = `${baseUrl}${cleanEndpoint}`;
        
        console.log('🌐 [API] Making request to:', fullUrl);
        
        // Set longer timeout for setup operations
        const timeout = fullUrl.includes('/setup') ? 30000 : 10000; // 30s for setup, 10s for others
        
        const response = await axios({
          url: fullUrl,
          method: options.method || 'GET',
          data: options.data,
          timeout: timeout,
          ...options
        });
        if (!response.data.success) {
          throw new Error(response.data.message || 'API call failed');
        }
        return response.data;
      } catch (err) {
        let errorMessage;
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
          errorMessage = 'Request timed out. The operation is taking longer than expected. Please try again.';
        } else {
          errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
        }
        setApiError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setApiLoading(false);
      }
    }, []);

    return { apiCall, loading: apiLoading, error: apiError };
  };

  const { apiCall } = useWhatsAppAPI();

  // Fetch Central WhatsApp configuration
  const fetchConfig = async () => {
    try {
      console.log('🔄 [WHATSAPP] Fetching configuration...');
      const result = await apiCall('/central-messaging/v1/config');
      setConfig(result.data);
      console.log('✅ [WHATSAPP] Configuration fetched successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error fetching configuration:', err.message);
      if (err.message.includes('not configured')) {
        setConfig(null);
      } else {
        setError(`Failed to load configuration: ${err.message}`);
      }
    }
  };

  // Test configuration
  const testConfiguration = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 [WHATSAPP] Testing configuration...');
      
      const result = await apiCall('/central-messaging/v1/test-config');
      setSuccess('Configuration test successful! WhatsApp API is working properly.');
      console.log('✅ [WHATSAPP] Configuration test successful');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error testing configuration:', err.message);
      
      // Handle specific error types
      if (err.response?.status === 401) {
        const errorData = err.response.data;
        if (errorData?.errorCode === 'TOKEN_EXPIRED') {
          setError('WhatsApp access token has expired. Please reconfigure your WhatsApp settings using the "Reconfigure" button.');
        } else if (errorData?.errorCode === 'OAUTH_ERROR') {
          setError('WhatsApp authentication failed. Please check your credentials and reconfigure.');
        } else {
          setError(`Configuration test failed: ${err.message}`);
        }
      } else {
        setError(`Configuration test failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Setup Central WhatsApp
  const setupCentralWhatsApp = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 [WHATSAPP] Setting up Central WhatsApp...');
      
      // Prepare data for update - only include fields that have values
      const updateData = {};
      if (configForm.phoneNumberId) {
        updateData.phoneNumberId = configForm.phoneNumberId;
      }
      if (configForm.accessToken) {
        updateData.accessToken = configForm.accessToken;
      }
      
      // If reconfiguring and no fields provided, show error
      if (config && Object.keys(updateData).length === 0) {
        setError('Please provide at least one field to update');
        return;
      }
      
      const result = await apiCall('/central-messaging/v1/setup', {
        method: 'POST',
        data: config ? { ...configForm, isUpdate: true } : configForm
      });
      
      const isUpdate = result.data.isUpdate;
      setSuccess(isUpdate ? 'Central WhatsApp configuration updated successfully!' : 'Central WhatsApp configured successfully!');
      setConfigDialogOpen(false);
      setConfigForm({ phoneNumberId: '', accessToken: '' });
      await fetchConfig();
      console.log('✅ [WHATSAPP] Central WhatsApp setup successful');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error setting up Central WhatsApp:', err.message);
      setError(`Failed to ${config ? 'update' : 'configure'} Central WhatsApp: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [config, configForm, apiCall]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      console.log('🔄 [WHATSAPP] Fetching analytics...');
      const result = await apiCall('/central-messaging/v1/analytics');
      setAnalytics(result.data);
      console.log('✅ [WHATSAPP] Analytics fetched successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error fetching analytics:', err.message);
      
      // Handle specific error types
      if (err.response?.status === 401) {
        const errorData = err.response.data;
        if (errorData?.errorCode === 'TOKEN_EXPIRED') {
          setError('WhatsApp access token has expired. Please reconfigure your WhatsApp settings.');
        } else if (errorData?.errorCode === 'OAUTH_ERROR') {
          setError('WhatsApp authentication failed. Please check your credentials.');
        } else {
          setError(`Failed to load analytics: ${err.message}`);
        }
      } else {
        setError(`Failed to load analytics: ${err.message}`);
      }
    }
  };

  // Fetch messages
  const fetchMessages = useCallback(async (page = 1) => {
    try {
      console.log('🔄 [WHATSAPP] Fetching messages...');
      const params = new URLSearchParams({
        limit: '50',
        offset: ((page - 1) * 50).toString()
      });
      
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.messageType && filters.messageType !== 'all') params.append('messageType', filters.messageType);
      if (filters.senderType && filters.senderType !== 'all') params.append('senderType', filters.senderType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);
      
      const result = await apiCall(`/central-messaging/v1/messages?${params}`);
      setMessages(result.data.messages);
      setMessagesTotal(result.data.total);
      setMessagesPage(page);
      console.log('✅ [WHATSAPP] Messages fetched successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error fetching messages:', err.message);
      setError(`Failed to load messages: ${err.message}`);
    }
  }, [filters, apiCall]);

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      console.log('🔄 [WHATSAPP] Fetching templates...');
      const result = await apiCall('/central-messaging/v1/admin/whatsapp/templates');
      setTemplates(result.data);
      console.log('✅ [WHATSAPP] Templates fetched successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error fetching templates:', err.message);
      
      // Handle specific error types
      if (err.response?.status === 401) {
        const errorData = err.response.data;
        if (errorData?.errorCode === 'TOKEN_EXPIRED') {
          setError('WhatsApp access token has expired. Please reconfigure your WhatsApp settings.');
        } else if (errorData?.errorCode === 'OAUTH_ERROR') {
          setError('WhatsApp authentication failed. Please check your credentials.');
        } else {
          setError(`Failed to load templates: ${err.message}`);
        }
      } else {
        setError(`Failed to load templates: ${err.message}`);
      }
    }
  };

  // Fetch contacts for suggestions
  const fetchContacts = async () => {
    try {
      console.log('🔄 [WHATSAPP] Fetching contacts...');
      const result = await apiCall('/central-messaging/v1/contacts');
      console.log('📞 [WHATSAPP] Contacts API response:', result);
      
      // Handle different response structures
      const contactsData = result.data?.contacts || result.contacts || result.data || [];
      setContacts(contactsData);
      console.log('✅ [WHATSAPP] Contacts fetched successfully:', contactsData.length, 'contacts');
      
      // If no contacts, create some sample data for testing
      if (contactsData.length === 0) {
        console.log('📞 [WHATSAPP] No contacts found, creating sample data for testing');
        const sampleContacts = [
          { phoneNumber: '+1234567890', name: 'John Doe', messageCount: 5, lastMessageAt: new Date() },
          { phoneNumber: '+0987654321', name: 'Jane Smith', messageCount: 3, lastMessageAt: new Date() },
          { phoneNumber: '+5555555555', name: 'Bob Johnson', messageCount: 8, lastMessageAt: new Date() }
        ];
        setContacts(sampleContacts);
        console.log('📞 [WHATSAPP] Sample contacts created for testing');
      }
    } catch (err) {
      console.error('❌ [WHATSAPP] Error fetching contacts:', err.message);
      // Create sample data even on error for testing
      const sampleContacts = [
        { phoneNumber: '+1234567890', name: 'John Doe', messageCount: 5, lastMessageAt: new Date() },
        { phoneNumber: '+0987654321', name: 'Jane Smith', messageCount: 3, lastMessageAt: new Date() },
        { phoneNumber: '+5555555555', name: 'Bob Johnson', messageCount: 8, lastMessageAt: new Date() }
      ];
      setContacts(sampleContacts);
      console.log('📞 [WHATSAPP] Using sample contacts due to API error');
    }
  };

  // Send message
  const sendMessage = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 [WHATSAPP] Sending message...');
      
      const messageData = {
        to: sendForm.to,
        leadId: sendForm.leadId || null,
        clientId: sendForm.clientId || null
      };

      // Determine message type and validate content
      const hasTemplate = sendForm.templateName && sendForm.templateName.trim() !== '';
      const hasMedia = sendForm.mediaUrl && sendForm.mediaUrl.trim() !== '';
      const hasTextMessage = sendForm.message && sendForm.message.trim() !== '';
      
      // Validate that at least one type of content is provided
      if (!hasTemplate && !hasMedia && !hasTextMessage) {
        setError('Please provide a message, select a template, or add media to send');
        setLoading(false);
        return;
      }
      
      if (hasTemplate) {
        messageData.templateName = sendForm.templateName;
        messageData.type = 'template';
        if (sendForm.parameters) {
          messageData.parameters = sendForm.parameters.split(',').map(p => p.trim());
        }
      } else if (hasMedia) {
        messageData.mediaUrl = sendForm.mediaUrl;
        messageData.mediaType = sendForm.mediaType;
        messageData.type = 'media';
        if (hasTextMessage) {
          messageData.message = sendForm.message;
          messageData.caption = sendForm.message;
        }
      } else if (hasTextMessage) {
        messageData.message = sendForm.message;
        messageData.type = 'text';
      }

      const result = await apiCall('/central-messaging/v1/admin/send', {
        method: 'POST',
        data: messageData
      });
      
      setSuccess('Message sent successfully!');
      setSendDialogOpen(false);
      setSendForm({
        to: '',
        message: '',
        templateName: '',
        parameters: '',
        mediaUrl: '',
        mediaType: 'image',
        leadId: '',
        clientId: ''
      });
      await fetchMessages(messagesPage);
      // Refresh contacts to include the new number
      await fetchContacts();
      console.log('✅ [WHATSAPP] Message sent successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error sending message:', err.message);
      setError(`Failed to send message: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [sendForm, apiCall, messagesPage, fetchMessages, fetchContacts]);

  // Test message
  const testMessage = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 [WHATSAPP] Sending test message...');
      
      const testData = {
        to: sendForm.to,
        message: sendForm.message || 'Test message from Central WhatsApp'
      };

      const result = await apiCall('/central-messaging/v1/test-message', {
        method: 'POST',
        data: testData
      });
      
      setSuccess('Test message sent successfully!');
      console.log('✅ [WHATSAPP] Test message sent successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error sending test message:', err.message);
      setError(`Failed to send test message: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [sendForm, apiCall]);

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Always fetch config first
        await fetchConfig();
        
        switch (activeTab) {
          case 'overview':
            await fetchAnalytics();
            break;
          case 'messages':
            await fetchMessages();
            break;
          case 'templates':
            await fetchTemplates();
            break;
        }
      } catch (err) {
        console.error('❌ [WHATSAPP] Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab]);

  // Load contacts when component mounts and when send dialog opens
  useEffect(() => {
    if (config) {
      fetchContacts();
    }
  }, [config]);

  // Load contacts when send dialog opens
  useEffect(() => {
    if (sendDialogOpen && config) {
      fetchContacts();
    }
  }, [sendDialogOpen, config]);

  // Refresh data
  const refreshData = () => {
    switch (activeTab) {
      case 'overview':
        fetchAnalytics();
        break;
      case 'messages':
        fetchMessages(messagesPage);
        break;
      case 'templates':
        fetchTemplates();
        break;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'sent':
      case 'delivered':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get message type icon
  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'text':
        return <MessageSquare className="h-4 w-4" />;
      case 'template':
        return <FileText className="h-4 w-4" />;
      case 'media':
        return <Image className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Pre-populate form when reconfiguring
  const handleConfigDialogOpen = (open) => {
    console.log('🔄 [WHATSAPP] handleConfigDialogOpen called with:', open, 'config:', config);
    if (open) {
      // Only reset form when opening the dialog
      if (config) {
        // Pre-populate with existing config
        setConfigForm({
          phoneNumberId: config.phoneNumberId || '',
          accessToken: '', // Don't show existing token for security
          businessAccountId: config.businessAccountId || ''
        });
      } else {
        // Reset form for new setup
        setConfigForm({
          phoneNumberId: '',
          accessToken: '',
          businessAccountId: ''
        });
      }
    }
    setConfigDialogOpen(open);
  };

  // Handle message type change
  const handleMessageTypeChange = (value) => {
    if (value === 'text') {
      setSendForm({...sendForm, templateName: '', mediaUrl: '', message: ''});
    } else if (value === 'template') {
      setSendForm({...sendForm, mediaUrl: '', message: ''});
    } else {
      setSendForm({...sendForm, templateName: '', message: ''});
    }
  };

  // Handle phone number input change with suggestions
  const handlePhoneNumberChange = (value) => {
    if (bulkMode) {
      // For bulk mode, we don't update sendForm.to
      console.log('🔍 [WHATSAPP] Bulk mode search:', value);
    } else {
      setSendForm({...sendForm, to: value});
    }
    
    if (value.length > 0) {
      console.log('🔍 [WHATSAPP] Searching contacts for:', value);
      console.log('📞 [WHATSAPP] Available contacts:', contacts.length);
      
      const filtered = contacts.filter(contact => 
        contact.phoneNumber.includes(value) || 
        (contact.name && contact.name.toLowerCase().includes(value.toLowerCase()))
      );
      
      console.log('🔍 [WHATSAPP] Filtered contacts:', filtered.length);
      setContactSuggestions(filtered.slice(0, 5)); // Show max 5 suggestions
      setShowSuggestions(true);
    } else {
      setContactSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle contact suggestion selection
  const handleContactSelect = (contact) => {
    if (bulkMode) {
      // Add to selected contacts for bulk messaging
      if (!selectedContacts.find(c => c.phoneNumber === contact.phoneNumber)) {
        setSelectedContacts([...selectedContacts, contact]);
      }
    } else {
      // Single message mode
      setSendForm({...sendForm, to: contact.phoneNumber});
    }
    setShowSuggestions(false);
  };

  // Handle contact editing
  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setContactEditForm({
      name: contact.name || '',
      phoneNumber: contact.phoneNumber
    });
    setContactEditDialog(true);
    setShowSuggestions(false);
  };

  // Save contact edit
  const saveContactEdit = async () => {
    try {
      setLoading(true);
      const result = await apiCall('/central-messaging/v1/contacts/update', {
        method: 'PUT',
        data: {
          phoneNumber: contactEditForm.phoneNumber,
          name: contactEditForm.name
        }
      });
      
      setSuccess('Contact updated successfully!');
      setContactEditDialog(false);
      await fetchContacts(); // Refresh contacts
    } catch (err) {
      console.error('❌ [WHATSAPP] Error updating contact:', err.message);
      setError(`Failed to update contact: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Toggle bulk mode
  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    if (bulkMode) {
      // Switching to single mode - clear bulk selections
      setSelectedContacts([]);
      setBulkMessage('');
    } else {
      // Switching to bulk mode - clear single form
      setSendForm({...sendForm, to: ''});
    }
  };

  // Remove contact from bulk selection
  const removeFromBulkSelection = (phoneNumber) => {
    setSelectedContacts(selectedContacts.filter(c => c.phoneNumber !== phoneNumber));
  };

  // Send bulk messages
  const sendBulkMessages = async () => {
    if (selectedContacts.length === 0) {
      setError('Please select at least one contact for bulk messaging');
      return;
    }

    if (!bulkMessage.trim()) {
      setError('Please enter a message to send');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 [WHATSAPP] Sending bulk messages...');
      
      const result = await apiCall('/central-messaging/v1/admin/send-bulk', {
        method: 'POST',
        data: {
          contacts: selectedContacts.map(c => c.phoneNumber),
          message: bulkMessage
        }
      });
      
      setSuccess(`Bulk messages sent successfully to ${selectedContacts.length} contacts!`);
      setBulkMode(false);
      setSelectedContacts([]);
      setBulkMessage('');
      await fetchMessages(messagesPage);
      await fetchContacts();
      console.log('✅ [WHATSAPP] Bulk messages sent successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error sending bulk messages:', err.message);
      setError(`Failed to send bulk messages: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Overview Tab Content
  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Configuration Status */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Central WhatsApp Configuration</span>
            </span>
            <div className="flex items-center space-x-2">
              {!config ? (
                <Button onClick={() => handleConfigDialogOpen(true)} size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Setup
                </Button>
              ) : (
                <>
                  <Badge className={`${error && error.includes('expired') ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'}`}>
                    {error && error.includes('expired') ? (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Token Expired
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Configured
                      </>
                    )}
                  </Badge>
                <Button
                    onClick={testConfiguration} 
                  variant="outline"
                  size="sm"
                    disabled={loading}
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test
                </Button>
                <Button
                    onClick={() => handleConfigDialogOpen(true)} 
                  variant="outline"
                  size="sm"
                >
                    <Settings className="h-4 w-4 mr-2" />
                    Reconfigure
                </Button>
                </>
              )}
              </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {config ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Phone Number ID:</span>
                <span className="text-sm text-muted-foreground">{config.phoneNumberId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Business Account ID:</span>
                <span className="text-sm text-muted-foreground">{config.businessAccountId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Templates:</span>
                <span className="text-sm text-muted-foreground">{config.templatesCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contacts:</span>
                <span className="text-sm text-muted-foreground">{config.contactsCount || 0}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">WhatsApp Not Configured</h3>
              <p className="text-muted-foreground mb-4">
                Set up your WhatsApp Business API credentials to enable centralized messaging.
              </p>
              <Button onClick={() => handleConfigDialogOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Setup Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics */}
      {analytics && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{analytics.overview.totalMessages}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.overview.sentMessages} sent, {analytics.overview.deliveredMessages} delivered
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Delivery Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{analytics.overview.deliveryRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.overview.readRate}% read rate
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Failed Messages</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{analytics.overview.failedMessages}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.overview.totalMessages > 0 ? 
                    ((analytics.overview.failedMessages / analytics.overview.totalMessages) * 100).toFixed(1) : 0}% failure rate
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Credits Used</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{analytics.totalCreditsUsed}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total credits consumed
                </p>
        </CardContent>
      </Card>
          </div>

          {/* Message Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Message Types</CardTitle>
              <CardDescription>Breakdown of message types sent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.messageTypeBreakdown.map((type) => (
                  <div key={type._id} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{type._id}</span>
                    <Badge variant="outline">{type.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  // Messages Tab Content
  const MessagesContent = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>Message Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters({...filters, status: value})}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="messageType" className="text-sm font-medium">Message Type</Label>
              <Select 
                value={filters.messageType} 
                onValueChange={(value) => setFilters({...filters, messageType: value})}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderType" className="text-sm font-medium">Sender Type</Label>
              <Select 
                value={filters.senderType} 
                onValueChange={(value) => setFilters({...filters, senderType: value})}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All senders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All senders</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">Search</Label>
              <Input
                id="search"
                placeholder="Search messages..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => fetchMessages()} size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span>Message History</span>
            </CardTitle>
            <CardDescription className="mt-1">All WhatsApp messages sent through Central WhatsApp</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setSendDialogOpen(true)} size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Read</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message._id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getMessageTypeIcon(message.messageType)}
                      <span className="text-sm capitalize">{message.messageType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">
                      {message.content?.text || 
                       message.content?.templateName || 
                       message.content?.mediaUrl || 
                       'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                      <div>
                      <div className="font-medium">{message.recipientPhone}</div>
                      {message.recipientName && (
                        <div className="text-sm text-muted-foreground">{message.recipientName}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                      <div>
                      <div className="font-medium capitalize">{message.senderType}</div>
                      {message.senderId?.name && (
                        <div className="text-sm text-muted-foreground">{message.senderId.name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(message.status)}>
                      {message.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(message.sentAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {message.deliveredAt ? new Date(message.deliveredAt).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    {message.readAt ? new Date(message.readAt).toLocaleString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {messagesTotal > 50 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((messagesPage - 1) * 50) + 1} to {Math.min(messagesPage * 50, messagesTotal)} of {messagesTotal} messages
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchMessages(messagesPage - 1)}
                  disabled={messagesPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchMessages(messagesPage + 1)}
                  disabled={messagesPage * 50 >= messagesTotal}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Templates Tab Content
  const TemplatesContent = () => (
    <div className="space-y-6">
      {/* Templates Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg flex items-center space-x-2">
              <File className="h-5 w-5 text-purple-600" />
              <span>WhatsApp Templates</span>
            </CardTitle>
            <CardDescription className="mt-1">Manage WhatsApp message templates</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.name}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.category}</TableCell>
                  <TableCell>{template.language}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(template.status)}>
                      {template.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(template.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central WhatsApp Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage centralized WhatsApp messaging and templates
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
          {config && (
            <Button onClick={() => setSendDialogOpen(true)} size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          )}
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-fit">
          <TabsTrigger value="overview" className="flex items-center space-x-2 px-6">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center space-x-2 px-6">
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2 px-6">
            <File className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewContent />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesContent />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesContent />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={configDialogOpen} onOpenChange={handleConfigDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {config ? 'Update Central WhatsApp Configuration' : 'Setup Central WhatsApp'}
            </DialogTitle>
            <DialogDescription>
              {loading 
                ? (config ? 'Updating your WhatsApp configuration. This may take a few moments...' : 'Setting up your WhatsApp configuration. This may take a few moments...')
                : (config 
                  ? 'Update your WhatsApp Business API credentials. All fields are required for updates.'
                  : 'Configure your WhatsApp Business API credentials to enable centralized messaging.'
                )
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="phoneNumberId">Phone Number ID</Label>
              <Input
                id="phoneNumberId"
                placeholder="Enter your WhatsApp Business Phone Number ID"
                value={configForm.phoneNumberId}
                onChange={(e) => setConfigForm({...configForm, phoneNumberId: e.target.value})}
              />
              {config && (
                <p className="text-xs text-muted-foreground mt-1">
                  Current: {config.phoneNumberId}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="Enter your WhatsApp Business Access Token"
                value={configForm.accessToken}
                onChange={(e) => setConfigForm({...configForm, accessToken: e.target.value})}
              />
              {config && (
                <p className="text-xs text-muted-foreground mt-1">
                  Current: ••••••••••••••••••••••••••••••••
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="businessAccountId">Business Account ID</Label>
              <Input
                id="businessAccountId"
                placeholder="Enter your WhatsApp Business Account ID"
                value={configForm.businessAccountId}
                onChange={(e) => setConfigForm({...configForm, businessAccountId: e.target.value})}
              />
              {config && (
                <p className="text-xs text-muted-foreground mt-1">
                  Current: {config.businessAccountId}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={setupCentralWhatsApp}
                disabled={loading || !configForm.phoneNumberId || !configForm.accessToken || !configForm.businessAccountId}
              >
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
                {loading ? (config ? 'Updating...' : 'Setting up...') : (config ? 'Update Configuration' : 'Setup')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Message</DialogTitle>
            <DialogDescription>
              Send a message using the Central WhatsApp configuration.
            </DialogDescription>
          </DialogHeader>
          
          {/* Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Mode:</span>
              <Badge variant={bulkMode ? "default" : "outline"}>
                {bulkMode ? "Bulk Messaging" : "Single Message"}
              </Badge>
              <span className="text-xs text-gray-500">
                ({contacts.length} contacts available)
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleBulkMode}
            >
              {bulkMode ? "Switch to Single" : "Switch to Bulk"}
            </Button>
          </div>

          <div className="space-y-4">
            {!bulkMode ? (
              // Single Message Mode
              <div className="relative">
                <Label htmlFor="to">Recipient Phone Number</Label>
                <Input
                  id="to"
                  placeholder="+1234567890 or search contacts..."
                  value={sendForm.to}
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  onFocus={() => {
                    console.log('🔍 [WHATSAPP] Input focused, contacts:', contacts.length);
                    if (contacts.length > 0) {
                      // Show all contacts when focused
                      setContactSuggestions(contacts.slice(0, 5));
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow click on suggestion
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                />
                
                {/* Contact Suggestions Dropdown */}
                {showSuggestions && contactSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {contactSuggestions.map((contact, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                        onClick={() => handleContactSelect(contact)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{contact.phoneNumber}</div>
                            {contact.name && (
                              <div className="text-xs text-gray-500">{contact.name}</div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {contact.messageCount > 0 && (
                              <div className="text-xs text-gray-400">
                                {contact.messageCount} msgs
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditContact(contact);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Bulk Message Mode
              <div className="space-y-3">
                <div className="relative">
                  <Label htmlFor="bulk-search">Search and Select Contacts</Label>
                  <Input
                    id="bulk-search"
                    placeholder="Search contacts by phone or name..."
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    onFocus={() => {
                      console.log('🔍 [WHATSAPP] Bulk search focused, contacts:', contacts.length);
                      if (contacts.length > 0) {
                        const filtered = contacts.filter(contact => 
                          !selectedContacts.find(c => c.phoneNumber === contact.phoneNumber)
                        );
                        setContactSuggestions(filtered.slice(0, 5));
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                  />
                  
                  {/* Contact Suggestions Dropdown for Bulk */}
                  {showSuggestions && contactSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {contactSuggestions.map((contact, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                          onClick={() => handleContactSelect(contact)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{contact.phoneNumber}</div>
                              {contact.name && (
                                <div className="text-xs text-gray-500">{contact.name}</div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {contact.messageCount > 0 && (
                                <div className="text-xs text-gray-400">
                                  {contact.messageCount} msgs
                                </div>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditContact(contact);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Contacts */}
                {selectedContacts.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Contacts ({selectedContacts.length})</Label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {selectedContacts.map((contact, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{contact.phoneNumber}</div>
                            {contact.name && (
                              <div className="text-xs text-gray-500">{contact.name}</div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={() => removeFromBulkSelection(contact.phoneNumber)}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!bulkMode && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leadId">Lead ID (Optional)</Label>
                  <Input
                    id="leadId"
                    placeholder="Lead ID"
                    value={sendForm.leadId}
                    onChange={(e) => setSendForm({...sendForm, leadId: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="clientId">Client ID (Optional)</Label>
                  <Input
                    id="clientId"
                    placeholder="Client ID"
                    value={sendForm.clientId}
                    onChange={(e) => setSendForm({...sendForm, clientId: e.target.value})}
                  />
                </div>
              </div>
            )}

            {!bulkMode && (
              <div>
                <Label>Message Type</Label>
                <Select 
                  value={sendForm.templateName ? 'template' : sendForm.mediaUrl ? 'media' : 'text'} 
                  onValueChange={handleMessageTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Message</SelectItem>
                    <SelectItem value="template">Template Message</SelectItem>
                    <SelectItem value="media">Media Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Message Input */}
            {bulkMode ? (
              <div>
                <Label htmlFor="bulk-message">Message</Label>
                <Textarea
                  id="bulk-message"
                  placeholder="Enter your message to send to all selected contacts..."
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  rows={4}
                />
              </div>
            ) : (
              !sendForm.templateName && !sendForm.mediaUrl && (
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your message..."
                    value={sendForm.message}
                    onChange={(e) => setSendForm({...sendForm, message: e.target.value})}
                  />
                </div>
              )
            )}

            {sendForm.templateName && (
              <>
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Select value={sendForm.templateName} onValueChange={(value) => setSendForm({...sendForm, templateName: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.name} value={template.name}>
                          {template.name} ({template.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="parameters">Template Parameters (comma-separated)</Label>
                  <Input
                    id="parameters"
                    placeholder="param1, param2, param3"
                    value={sendForm.parameters}
                    onChange={(e) => setSendForm({...sendForm, parameters: e.target.value})}
                  />
                </div>
              </>
            )}

            {sendForm.mediaUrl && (
              <>
                <div>
                  <Label htmlFor="mediaUrl">Media URL</Label>
                  <Input
                    id="mediaUrl"
                    placeholder="https://example.com/image.jpg"
                    value={sendForm.mediaUrl}
                    onChange={(e) => setSendForm({...sendForm, mediaUrl: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="mediaType">Media Type</Label>
                  <Select value={sendForm.mediaType} onValueChange={(value) => setSendForm({...sendForm, mediaType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="caption">Caption (Optional)</Label>
                  <Textarea
                    id="caption"
                    placeholder="Enter caption..."
                    value={sendForm.message}
                    onChange={(e) => setSendForm({...sendForm, message: e.target.value})}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
                Cancel
              </Button>
              {!bulkMode && (
                <Button variant="outline" onClick={testMessage} disabled={loading || !sendForm.to}>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test
                </Button>
              )}
              {bulkMode ? (
                <Button 
                  onClick={sendBulkMessages} 
                  disabled={loading || selectedContacts.length === 0 || !bulkMessage.trim()}
                >
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Send to {selectedContacts.length} Contacts
                </Button>
              ) : (
                <Button onClick={sendMessage} disabled={loading || !sendForm.to || (!sendForm.message && !sendForm.templateName && !sendForm.mediaUrl)}>
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Send
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Edit Dialog */}
      <Dialog open={contactEditDialog} onOpenChange={setContactEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information for {editingContact?.phoneNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={contactEditForm.phoneNumber}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="edit-name">Contact Name (Optional)</Label>
              <Input
                id="edit-name"
                placeholder="Enter contact name..."
                value={contactEditForm.name}
                onChange={(e) => setContactEditForm({...contactEditForm, name: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setContactEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveContactEdit} disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppMessaging;