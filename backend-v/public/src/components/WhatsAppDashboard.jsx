import React, { useState, useEffect, useCallback, useRef } from 'react';
import environmentConfig from '../config/environment.js';
import { useToast } from '../contexts/ToastContext';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';

// Custom Dialog Component
const CustomDialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 animate-in fade-in duration-300"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog Content */}
      <div className="relative z-10 animate-in zoom-in-95 duration-300">
        {children}
      </div>
    </div>
  );
};

const CustomDialogContent = ({ className, style, children }) => (
  <div
    className={`relative bg-white rounded-[10px] shadow-2xl border border-gray-200/50 overflow-hidden ${className || ''}`}
    style={{ width: '50vw', ...style }}
  >
    {children}
  </div>
);

const CustomDialogHeader = ({ className, children }) => (
  <div className={`px-10 py-4 border-b border-gray-100/80 bg-gradient-to-r from-gray-50/50 to-white ${className || ''}`}>
    {children}
  </div>
);

const CustomDialogTitle = ({ className, children }) => (
  <h2 className={`text-2xl font-bold text-gray-900 ${className || ''}`}>
    {children}
  </h2>
);

const CustomDialogDescription = ({ className, children }) => (
  <p className={`text-gray-600 mt-2 ${className || ''}`}>
    {children}
  </p>
);

const CustomDialogFooter = ({ className, children }) => (
  <div className={`px-10 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-t border-gray-200/50 flex justify-end space-x-4 ${className || ''}`}>
    {children}
  </div>
);
import { Switch } from './ui/switch';
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
  Loader2,
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
  DollarSign,
  EyeOff,
  Save,
  QrCode,
  X
} from 'lucide-react';
import axios from 'axios';

const WhatsAppDashboard = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Central WhatsApp Configuration
  const [config, setConfig] = useState(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  
  // Email Configuration
  const [emailConfig, setEmailConfig] = useState(null);
  const [emailConfigDialogOpen, setEmailConfigDialogOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailConfigForm, setEmailConfigForm] = useState({
    email: '',
    password: ''
  });
  
  // Credit Management
  const [creditSettings, setCreditSettings] = useState(null);
  const [settingsOverview, setSettingsOverview] = useState(null);
  
  // Inbox/Conversations
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  
  // Channels loading refs to prevent infinite loops and unnecessary requests
  const channelsLoadingRef = useRef(false);
  const channelsLoadedRef = useRef(false);

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
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateSyncLoading, setSyncLoading] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: 'UTILITY',
    language: 'en_US',
    components: []
  });
  
  // Contacts data
  const [contacts, setContacts] = useState([]);
  const [contactsTotal, setContactsTotal] = useState(0);
  
  // Send message dialog
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendForm, setSendForm] = useState({
    countryCode: '+91',
    phoneNumber: '',
    message: '',
    templateName: '',
    templateParameters: [],
    mediaUrl: '',
    mediaType: 'image',
    leadId: '',
    clientId: ''
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [contactSearch, setContactSearch] = useState('');
  const [showContactSuggestions, setShowContactSuggestions] = useState(false);
  const [countryCodeSearch, setCountryCodeSearch] = useState('');
  const [showCountryCodeList, setShowCountryCodeList] = useState(false);
  
  // Bulk messaging state
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [bulkMessage, setBulkMessage] = useState('');
  const [contactSuggestions, setContactSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Messaging channels state
  const [createChannelDialogOpen, setCreateChannelDialogOpen] = useState(false);
  const [channels, setChannels] = useState([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [showApiToken, setShowApiToken] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  // Bailey's WhatsApp Scanner state
  const [baileySession, setBaileySession] = useState(null);
  const [baileyQR, setBaileyQR] = useState(null);
  const [baileyStatus, setBaileyStatus] = useState('disconnected');
  const [baileyLoading, setBaileyLoading] = useState(false);
  const [baileyRetryInfo, setBaileyRetryInfo] = useState(null);
  const [channelForm, setChannelForm] = useState({
    name: '',
    type: 'whatsapp_api',
    whatsappApi: {
      phoneNumberId: '',
      accessToken: '',
      businessAccountId: '',
      verifyToken: '',
      webhookUrl: '',
      apiVersion: 'v18.0'
    },
    whatsappBailey: {
      deviceId: '',
      sessionId: '',
      phoneNumber: ''
    },
    emailSmtp: {
      host: '',
      port: 587,
      secure: false,
      auth: {
        user: '',
        pass: ''
      },
      fromEmail: '',
      fromName: '',
      testEmailAddress: ''
    }
  });
  
  // Contact editing state
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

  // Country codes for phone number input
  const countryCodes = [
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  ];


  // Helper function to extract template parameters from template components
  const extractTemplateParameters = (template) => {
    if (!template || !template.components) return [];
    
    const params = [];
    template.components.forEach(component => {
      if (component.type === 'BODY' && component.text) {
        // Extract {{1}}, {{2}}, etc.
        const matches = component.text.match(/\{\{(\d+)\}\}/g);
        if (matches) {
          matches.forEach(match => {
            const index = parseInt(match.replace(/\{\{|\}\}/g, ''));
            params.push({
              index,
              placeholder: match,
              value: ''
            });
          });
        }
      }
    });
    return params.sort((a, b) => a.index - b.index);
  };

  // Helper function to generate message preview
  const generateMessagePreview = () => {
    if (!selectedTemplate || !selectedTemplate.components) return '';
    
    let preview = '';
    selectedTemplate.components.forEach(component => {
      if (component.type === 'HEADER' && component.text) {
        preview += `*${component.text}*\n\n`;
      }
      if (component.type === 'BODY' && component.text) {
        let bodyText = component.text;
        sendForm.templateParameters.forEach((param, idx) => {
          if (param && param.value) {
            bodyText = bodyText.replace(`{{${idx + 1}}}`, param.value);
          }
        });
        preview += bodyText + '\n\n';
      }
      if (component.type === 'FOOTER' && component.text) {
        preview += `_${component.text}_`;
      }
    });
    return preview || 'Preview will appear here...';
  };

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => 
    contact.phoneNumber?.includes(contactSearch) ||
    contact.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.profileName?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  // Filter country codes based on search
  const filteredCountryCodes = countryCodes.filter(item =>
    item.country.toLowerCase().includes(countryCodeSearch.toLowerCase()) ||
    item.code.includes(countryCodeSearch)
  );

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
          if (window.API_CONFIG && window.API_CONFIG.apiBaseUrl) {
            return window.API_CONFIG.apiBaseUrl;
          }
          
          // Use environment config API_ENDPOINT directly
          return environmentConfig.API_ENDPOINT;
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
        showToast(`Failed to load configuration: ${err.message}`, 'error');
      }
    }
  };

  // Fetch Email configuration
  const fetchEmailConfig = async () => {
    try {
      console.log('🔄 [EMAIL] Fetching email configuration...');
      const result = await apiCall('/central-messaging/v1/admin/email/config');
      setEmailConfig(result.data);
      console.log('✅ [EMAIL] Email configuration fetched successfully');
    } catch (err) {
      console.error('❌ [EMAIL] Error fetching email configuration:', err.message);
      if (err.message.includes('not configured')) {
        setEmailConfig(null);
      } else {
        showToast(`Failed to load email configuration: ${err.message}`, 'error');
      }
    }
  };

  // Test configuration
  const testConfiguration = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 [WHATSAPP] Testing configuration...');
      
      const result = await apiCall('/central-messaging/v1/test-config');
      showToast('Configuration test successful! WhatsApp API is working properly.', 'success');
      console.log('✅ [WHATSAPP] Configuration test successful');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error testing configuration:', err.message);
      
      // Handle specific error types
      if (err.response?.status === 401) {
        const errorData = err.response.data;
        if (errorData?.errorCode === 'TOKEN_EXPIRED') {
          showToast('WhatsApp access token has expired. Please reconfigure your WhatsApp settings using the "Reconfigure" button.', 'error');
        } else if (errorData?.errorCode === 'OAUTH_ERROR') {
          showToast('WhatsApp authentication failed. Please check your credentials and reconfigure.', 'error');
        } else {
          showToast(`Configuration test failed: ${err.message}`, 'error');
        }
      } else {
        showToast(`Configuration test failed: ${err.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Fetch email status
  const fetchEmailStatus = async () => {
    try {
      console.log('🔄 [EMAIL] Fetching email status...');
      const result = await apiCall('/central-messaging/v1/admin/email/status');
      setEmailStatus(result.data);
      console.log('✅ [EMAIL] Email status fetched successfully');
    } catch (err) {
      console.error('❌ [EMAIL] Error fetching email status:', err.message);
      setEmailStatus(null);
    }
  };

  // Test email configuration
  const testEmailConfiguration = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 [EMAIL] Testing email configuration...');
      
      const result = await apiCall('/central-messaging/v1/admin/email/test-config');
      showToast('Email configuration test successful! Email service is working properly.', 'success');
      console.log('✅ [EMAIL] Email configuration test successful');
    } catch (err) {
      console.error('❌ [EMAIL] Error testing email configuration:', err.message);
      
      // Handle specific error types
      if (err.response?.status === 401) {
        showToast('Email authentication failed. Please check your email credentials and reconfigure.', 'error');
      } else if (err.response?.status === 500) {
        showToast('Email server connection failed. Please check your SMTP settings.', 'error');
      } else {
        showToast(`Email configuration test failed: ${err.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Send test email
  const sendTestEmail = useCallback(async (toEmail, subject, message) => {
    try {
      setLoading(true);
      console.log('🔄 [EMAIL] Sending test email...');
      
      const result = await apiCall('/central-messaging/v1/admin/email/send-test', {
        method: 'POST',
        data: {
          to: toEmail,
          subject: subject || 'FunnelsEye - Test Email',
          message: message || 'This is a test email from FunnelsEye platform.'
        }
      });
      showToast(`Test email sent successfully to ${toEmail}!`, 'success');
      console.log('✅ [EMAIL] Test email sent successfully');
    } catch (err) {
      console.error('❌ [EMAIL] Error sending test email:', err.message);
      showToast(`Failed to send test email: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Setup Central WhatsApp
  const setupCentralWhatsApp = useCallback(async () => {
    try {
      setLoading(true);
      // Error cleared
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
        showToast('Please provide at least one field to update', 'error');
        return;
      }
      
      const result = await apiCall('/central-messaging/v1/setup', {
        method: 'POST',
        data: config ? { ...configForm, isUpdate: true } : configForm
      });
      
      const isUpdate = result.data.isUpdate;
      showToast(isUpdate ? 'Central WhatsApp configuration updated successfully!' : 'Central WhatsApp configured successfully!', 'success');
      setConfigDialogOpen(false);
      setConfigForm({ phoneNumberId: '', accessToken: '' });
      await fetchConfig();
      console.log('✅ [WHATSAPP] Central WhatsApp setup successful');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error setting up Central WhatsApp:', err.message);
      showToast(`Failed to ${config ? 'update' : 'configure'} Central WhatsApp: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [config, configForm, apiCall]);

  // Setup Email Configuration
  const setupEmailConfig = useCallback(async () => {
    try {
      setLoading(true);
      // Error cleared
      console.log('🔄 [EMAIL] Setting up email configuration...');
      
      // Prepare configuration data (simplified)
      const configData = {
        email: emailConfigForm.email,
        password: emailConfigForm.password
      };
      
      const result = await apiCall('/central-messaging/v1/admin/email/setup', {
        method: 'POST',
        data: emailConfig ? { ...configData, isUpdate: true } : configData
      });
      
      const isUpdate = result.data.isUpdate;
      showToast(isUpdate ? 'Email configuration updated successfully!' : 'Email configured successfully!', 'success');
      setEmailConfigDialogOpen(false);
      setEmailConfigForm({ 
        email: '', 
        password: ''
      });
      await Promise.all([
        fetchEmailConfig(),
        fetchEmailStatus()
      ]);
      console.log('✅ [EMAIL] Email configuration setup successful');
    } catch (err) {
      console.error('❌ [EMAIL] Error setting up email configuration:', err.message);
      showToast(`Failed to ${emailConfig ? 'update' : 'configure'} email: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [emailConfig, emailConfigForm, apiCall]);

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
          showToast('WhatsApp access token has expired. Please reconfigure your WhatsApp settings.', 'error');
        } else if (errorData?.errorCode === 'OAUTH_ERROR') {
          showToast('WhatsApp authentication failed. Please check your credentials.', 'error');
        } else {
          showToast(`Failed to load analytics: ${err.message}`, 'error');
        }
      } else {
        showToast(`Failed to load analytics: ${err.message}`, 'error');
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
      showToast(`Failed to load messages: ${err.message}`, 'error');
    }
  }, [filters, apiCall]);

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      console.log('🔄 [WHATSAPP] Fetching templates...');
      const result = await apiCall('/central-messaging/v1/admin/whatsapp/templates');
      console.log('🔄 [TEMPLATES] API Response:', result);
      console.log('🔄 [TEMPLATES] Templates data:', result.data);
      setTemplates(Array.isArray(result.data) ? result.data : (result.data?.templates || []));
      console.log('✅ [WHATSAPP] Templates fetched successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error fetching templates:', err.message);
      
      // Handle specific error types
      if (err.response?.status === 401) {
        const errorData = err.response.data;
        if (errorData?.errorCode === 'TOKEN_EXPIRED') {
          showToast('WhatsApp access token has expired. Please reconfigure your WhatsApp settings.', 'error');
        } else if (errorData?.errorCode === 'OAUTH_ERROR') {
          showToast('WhatsApp authentication failed. Please check your credentials.', 'error');
        } else {
          showToast(`Failed to load templates: ${err.message}`, 'error');
        }
      } else {
        showToast(`Failed to load templates: ${err.message}`, 'error');
      }
    }
  };

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      console.log('🔄 [WHATSAPP] Fetching contacts...');
      const result = await apiCall('/central-messaging/v1/contacts');
      console.log('📞 [WHATSAPP] Contacts API response:', result);
      
      // Handle different response structures
      const contactsData = result.data?.contacts || result.contacts || result.data || [];
      setContacts(contactsData);
      setContactsTotal(result.data?.total || contactsData.length);
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
        setContactsTotal(sampleContacts.length);
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
      setContactsTotal(sampleContacts.length);
      console.log('📞 [WHATSAPP] Using sample contacts due to API error');
    }
  };

  // Send message
  const sendMessage = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 [WHATSAPP] Sending message...');
      
      // Combine country code and phone number
      const fullPhoneNumber = `${sendForm.countryCode}${sendForm.phoneNumber}`;
      
      const messageData = {
        to: fullPhoneNumber,
        leadId: sendForm.leadId || null,
        clientId: sendForm.clientId || null
      };

      // Determine message type and validate content
      const hasTemplate = sendForm.templateName && sendForm.templateName !== 'SELECT_TEMPLATE' && selectedTemplate;
      const hasMedia = sendForm.mediaUrl && sendForm.mediaUrl.trim() !== '' && sendForm.mediaUrl !== 'MEDIA';
      const hasTextMessage = sendForm.message && sendForm.message.trim() !== '';
      
      // Validate that at least one type of content is provided
      if (!hasTemplate && !hasMedia && !hasTextMessage) {
        showToast('Please provide a message, select a template, or add media to send', 'error');
        setLoading(false);
        return;
      }
      
      if (hasTemplate) {
        messageData.templateName = sendForm.templateName;
        messageData.type = 'template';
        // Extract parameter values from templateParameters array
        const paramValues = sendForm.templateParameters.map(p => p.value).filter(v => v);
        if (paramValues.length > 0) {
          messageData.parameters = paramValues;
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
      
      showToast('Message sent successfully!', 'success');
      setSendDialogOpen(false);
      resetSendForm();
      await fetchMessages(messagesPage);
      await fetchContacts(); // Refresh contacts to include the new number
      console.log('✅ [WHATSAPP] Message sent successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error sending message:', err.message);
      showToast(`Failed to send message: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [sendForm, selectedTemplate, apiCall, messagesPage, fetchMessages, fetchContacts]);

  // Reset send form helper
  const resetSendForm = () => {
    setSendForm({
      countryCode: '+91',
      phoneNumber: '',
      message: '',
      templateName: '',
      templateParameters: [],
      mediaUrl: '',
      mediaType: 'image',
      leadId: '',
      clientId: ''
    });
    setSelectedTemplate(null);
    setContactSearch('');
    setBulkMode(false);
    setSelectedContacts([]);
    setBulkMessage('');
    setShowSuggestions(false);
  };

  // Handle template selection
  const handleTemplateSelect = (templateName) => {
    console.log('🔄 [TEMPLATE] Selecting template:', templateName);
    const template = (templates || []).find(t => t.templateName === templateName);
    console.log('🔄 [TEMPLATE] Found template:', template);
    setSelectedTemplate(template);
    setSendForm({
      ...sendForm,
      templateName,
      templateParameters: extractTemplateParameters(template)
    });
    console.log('✅ [TEMPLATE] Template selected, form updated');
  };

  // Handle template parameter change
  const handleParameterChange = (index, value) => {
    const newParams = [...sendForm.templateParameters];
    if (newParams[index]) {
      newParams[index] = { ...newParams[index], value };
      setSendForm({ ...sendForm, templateParameters: newParams });
    }
  };

  // Handle contact selection
  const handleContactSelect = (contact) => {
    if (bulkMode) {
      // Add to selected contacts for bulk messaging
      if (!selectedContacts.find(c => c.phoneNumber === contact.phoneNumber)) {
        setSelectedContacts([...selectedContacts, contact]);
      }
    } else {
      // Extract phone number and country code
      const phone = contact.phoneNumber || contact.phone || '';
      const countryCode = phone.match(/^\+\d{1,4}/)?.[0] || '+91';
      const phoneNumber = phone.replace(countryCode, '');
      
      setSendForm({
        ...sendForm,
        countryCode,
        phoneNumber
      });
      setContactSearch(contact.name || contact.profileName || phone);
    }
    setShowContactSuggestions(false);
    setShowSuggestions(false);
  };

  // Handle phone number input change with suggestions
  const handlePhoneNumberChange = (value) => {
    if (bulkMode) {
      // For bulk mode, we don't update sendForm.to
      console.log('🔍 [WHATSAPP] Bulk mode search:', value);
    } else {
      setContactSearch(value);
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

  // Handle contact edit
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
      showToast('Contact updated successfully!', 'success');
      setContactEditDialog(false);
      await fetchContacts(); // Refresh contacts
    } catch (err) {
      console.error('❌ [WHATSAPP] Error updating contact:', err.message);
      showToast(`Failed to update contact: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle bulk mode
  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    if (bulkMode) {
      setSelectedContacts([]);
      setBulkMessage('');
    } else {
      setContactSearch('');
    }
  };

  // Remove from bulk selection
  const removeFromBulkSelection = (phoneNumber) => {
    setSelectedContacts(selectedContacts.filter(c => c.phoneNumber !== phoneNumber));
  };

  // Send bulk messages
  const sendBulkMessages = async () => {
    if (selectedContacts.length === 0) {
      showToast('Please select at least one contact', 'error');
      return;
    }

    // Validate based on message type
    if (sendForm.templateName && sendForm.templateName !== '') {
      if (!selectedTemplate) {
        showToast('Please select a template', 'error');
        return;
      }
      if (sendForm.templateParameters.some(p => !p.value)) {
        showToast('Please fill all template parameters', 'error');
        return;
      }
    } else if (sendForm.mediaUrl && sendForm.mediaUrl !== '') {
      if (sendForm.mediaUrl === 'MEDIA') {
        showToast('Please enter a media URL', 'error');
        return;
      }
    } else {
      if (!bulkMessage.trim()) {
        showToast('Please enter a message', 'error');
        return;
      }
    }

    try {
      setLoading(true);
      
      // Prepare message data based on type
      let messageData = {
        contacts: selectedContacts.map(c => c.phoneNumber)
      };

      if (sendForm.templateName && sendForm.templateName !== '') {
        messageData.templateName = sendForm.templateName;
        const paramValues = sendForm.templateParameters.map(p => p.value).filter(v => v);
        if (paramValues.length > 0) {
          messageData.parameters = paramValues;
        }
      } else if (sendForm.mediaUrl && sendForm.mediaUrl !== '') {
        messageData.mediaUrl = sendForm.mediaUrl;
        messageData.mediaType = sendForm.mediaType;
        if (sendForm.message) {
          messageData.message = sendForm.message;
        }
      } else {
        messageData.message = bulkMessage;
      }

      const result = await apiCall('/central-messaging/v1/admin/send-bulk', {
        method: 'POST',
        data: messageData
      });
      
      showToast(`Bulk messages sent successfully to ${selectedContacts.length} contacts!`, 'success');
      setBulkMode(false);
      setSelectedContacts([]);
      setBulkMessage('');
      await fetchMessages(messagesPage);
      await fetchContacts();
    } catch (err) {
      console.error('❌ [WHATSAPP] Error sending bulk messages:', err.message);
      showToast(`Failed to send bulk messages: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Send test message
  const testMessage = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 [WHATSAPP] Sending test message...');
      
      const messageData = {
        to: sendForm.to,
        message: sendForm.message || 'This is a test message from WhatsApp Admin'
      };

      if (sendForm.templateName) {
        messageData.templateName = sendForm.templateName;
        if (sendForm.parameters) {
          messageData.parameters = sendForm.parameters.split(',').map(p => p.trim());
        }
      }

      const result = await apiCall('/central-messaging/v1/test-message', {
        method: 'POST',
        data: messageData
      });
      
      showToast('Test message sent successfully!', 'success');
      console.log('✅ [WHATSAPP] Test message sent successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error sending test message:', err.message);
      showToast(`Failed to send test message: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [sendForm, apiCall]);

  // Sync templates from Meta
  const syncTemplates = async () => {
    try {
      setSyncLoading(true);
      console.log('🔄 [WHATSAPP] Syncing templates...');
      const result = await apiCall('/central-messaging/v1/admin/whatsapp/templates/sync', {
        method: 'POST'
      });
      showToast(`Templates synced successfully! ${result.data.syncedCount || 0} templates processed.`, 'success');
      await fetchTemplates();
      console.log('✅ [WHATSAPP] Templates synced successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error syncing templates:', err.message);
      showToast(`Failed to sync templates: ${err.message}`, 'error');
    } finally {
      setSyncLoading(false);
    }
  };

  // Messaging channels functions
  const loadChannels = useCallback(async () => {
    // Prevent infinite loops by checking if already loading
    if (channelsLoadingRef.current) {
      console.log('🔄 loadChannels already in progress, skipping to prevent infinite loop...');
      return;
    }

    try {
      console.log('📡 Loading messaging channels...');
      channelsLoadingRef.current = true;
      setChannelsLoading(true);

      // Use messaging/v3 API for getting channels
      const response = await fetch('/api/messaging/v3/channels', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();
      console.log('📡 Channels API response:', result);

      if (result.success) {
        // Flatten the grouped channels into a single array
        const allChannels = [];
        if (result.data?.meta_whatsapp) allChannels.push(...result.data.meta_whatsapp);
        if (result.data?.baileys_whatsapp) allChannels.push(...result.data.baileys_whatsapp);
        if (result.data?.email) allChannels.push(...result.data.email);

        setChannels(allChannels);
        channelsLoadedRef.current = true; // Mark as loaded even if 0 channels
        console.log('✅ Loaded', allChannels.length, 'channels');
      } else {
        console.error('❌ API returned error:', result.message);
        showToast(result.message || 'Failed to load channels', 'error');
      }
    } catch (error) {
      console.error('❌ Error loading channels:', error);
      showToast('Failed to load messaging channels', 'error');
    } finally {
      setChannelsLoading(false);
      channelsLoadingRef.current = false;
    }
  }, []);

  const handleCreateChannel = async () => {
    try {
      setChannelsLoading(true);

      // Use messaging/v3 API for channel creation
      const response = await fetch('/api/messaging/v3/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          name: channelForm.name,
          type: channelForm.type === 'whatsapp_api' ? 'whatsapp_api' :
                channelForm.type === 'whatsapp_bailey' ? 'whatsapp_bailey' : 'email_smtp',
          config: {
            whatsappApi: channelForm.whatsappApi,
            whatsappBailey: channelForm.whatsappBailey,
            emailSmtp: channelForm.emailSmtp
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setCreateChannelDialogOpen(false);
        setShowApiToken(false);
        setShowSmtpPassword(false);
        // Reset Bailey state
        disconnectBaileySession();

        setChannelForm({
          name: '',
          type: 'whatsapp_api',
          whatsappApi: {
            phoneNumberId: '',
            accessToken: '',
            businessAccountId: '',
            verifyToken: '',
            webhookUrl: '',
            apiVersion: 'v18.0'
          },
          whatsappBailey: {
            deviceId: '',
            sessionId: '',
            phoneNumber: ''
          },
          emailSmtp: {
            host: '',
            port: 587,
            secure: false,
            auth: {
              user: '',
              pass: ''
            },
            fromEmail: '',
            fromName: '',
            testEmailAddress: ''
          }
        });
        await loadChannels();
        showToast('Messaging channel created successfully', 'success');
      } else {
        showToast(result.message || 'Failed to create channel', 'error');
      }
    } catch (error) {
      console.error('Error creating channel:', error);
      showToast('Failed to create messaging channel', 'error');
    } finally {
      setChannelsLoading(false);
    }
  };

  // Bailey's WhatsApp Scanner functions
  const initBaileySession = async () => {
    try {
      setBaileyLoading(true);
      const response = await fetch('/api/baileys/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          deviceName: channelForm.name || 'FunnelsEye Device'
        })
      });

      const result = await response.json();

      if (result.success) {
        setBaileySession(result.data);
        setBaileyStatus('initializing');
        pollBaileyStatus(result.data.sessionId);
        showToast('Bailey session initialized. Generating QR code...', 'info');
      } else {
        showToast(result.message || 'Failed to initialize Bailey session', 'error');
      }
    } catch (error) {
      console.error('Error initializing Bailey session:', error);
      showToast('Failed to initialize Bailey session', 'error');
    } finally {
      setBaileyLoading(false);
    }
  };

  const pollBaileyStatus = (sessionId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/baileys/${sessionId}/status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        const result = await response.json();

        if (result.success) {
          const status = result.data.status;
          setBaileyStatus(status);

          // Update retry information
          if (result.data.retryCount !== undefined) {
            setBaileyRetryInfo({
              retryCount: result.data.retryCount,
              maxRetries: result.data.maxRetries,
              isRetrying: result.data.isRetrying
            });
          }

          if (status === 'qr_ready') {
            // Get QR code
            const qrResponse = await fetch(`/api/baileys/${sessionId}/qr`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
              }
            });

            const qrResult = await qrResponse.json();
            if (qrResult.success && qrResult.data.qrCode) {
              // Validate QR data format (Bailey's QR should start with "2@")
              if (!qrResult.data.qrCode.startsWith('2@')) {
                console.error('❌ Invalid QR data format:', qrResult.data.qrCode);
                showToast('Invalid QR code format received', 'error');
                return;
              }

              // Use a more reliable QR code generation service
              const qrData = encodeURIComponent(qrResult.data.qrCode);
              const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}&format=png&ecc=M&qzone=2`;

              // Set QR code directly - error handling will be done in the UI component
              setBaileyQR(qrImageUrl);
              clearInterval(pollInterval);

              console.log('🎯 Bailey\'s QR Code generated successfully');
              console.log('📄 Raw QR Data:', qrResult.data.qrCode);
              console.log('🖼️ QR Image URL:', qrImageUrl);
              showToast('QR code ready! Scan with WhatsApp on your phone.', 'success');

              // Log QR code data
              console.log('🎯 Bailey\'s Raw QR Data:', qrResult.data.qrCode);
              console.log('🖼️ QR Image URL:', qrImageUrl);
            }
          } else if (status === 'connected') {
            clearInterval(pollInterval);
            // Auto-fill the form with connection details
            setChannelForm({
              ...channelForm,
              whatsappBailey: {
                ...channelForm.whatsappBailey,
                deviceId: result.data.deviceId,
                sessionId: result.data.sessionId
              }
            });
            setBaileySession(null);
            setBaileyQR(null);
            showToast('WhatsApp scanner connected successfully!', 'success');
          }
        }
      } catch (error) {
        console.error('Error polling Bailey status:', error);
        clearInterval(pollInterval);
      }
    }, 2000);

    // Clear polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (baileyStatus !== 'connected') {
        setBaileyStatus('timeout');
        showToast('QR code expired. Please try again.', 'warning');
      }
    }, 300000); // 5 minutes
  };

  const disconnectBaileySession = async () => {
    if (baileySession?.sessionId) {
      try {
        await fetch(`/api/baileys/${baileySession.sessionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
      } catch (error) {
        console.error('Error disconnecting Bailey session:', error);
      }
    }

    setBaileySession(null);
    setBaileyQR(null);
    setBaileyStatus('disconnected');
  };

  // Redirect to Meta Business Manager to create template
  const createTemplate = () => {
    if (!config) {
      showToast('Please configure WhatsApp first before creating templates.', 'error');
      return;
    }

    // Construct the Meta Business Manager template URL
    const businessAccountId = config.businessAccountId;
    const metaTemplateUrl = `https://business.facebook.com/latest/whatsapp_manager/message_templates?asset_id=${businessAccountId}&business_id=${businessAccountId}`;
    
    console.log('🔄 [WHATSAPP] Redirecting to Meta Business Manager for template creation...');
    console.log('📍 [WHATSAPP] URL:', metaTemplateUrl);
    
    // Open in new tab
    window.open(metaTemplateUrl, '_blank');
    
    setTemplateDialogOpen(false);
    showToast('Opening Meta Business Manager. After creating your template there, come back and click "Sync Templates" to import it.', 'info');
  };

  // Fetch credit settings
  const fetchCreditSettings = async () => {
    try {
      console.log('🔄 [WHATSAPP] Fetching credit settings...');
      const result = await apiCall('/central-messaging/v1/credit-settings');
      setCreditSettings(result.data);
      console.log('✅ [WHATSAPP] Credit settings fetched successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error fetching credit settings:', err.message);
      showToast(`Failed to load credit settings: ${err.message}`, 'error');
    }
  };

  // Update credit settings
  const updateCreditSettings = async (settings) => {
    try {
      setLoading(true);
      console.log('🔄 [WHATSAPP] Updating credit settings...');
      const result = await apiCall('/central-messaging/v1/credit-settings', {
        method: 'PUT',
        data: settings
      });
      showToast('Credit settings updated successfully!', 'success');
      await fetchCreditSettings();
      console.log('✅ [WHATSAPP] Credit settings updated successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error updating credit settings:', err.message);
      showToast(`Failed to update credit settings: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings overview
  const fetchSettingsOverview = async () => {
    try {
      console.log('🔄 [WHATSAPP] Fetching settings overview...');
      const result = await apiCall('/central-messaging/v1/settings-overview');
      setSettingsOverview(result.data);
      console.log('✅ [WHATSAPP] Settings overview fetched successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error fetching settings overview:', err.message);
    }
  };

  // Fetch conversations for inbox
  const fetchConversations = async () => {
    try {
      console.log('🔄 [WHATSAPP] Fetching conversations...');
      // Group messages by conversation ID
      const result = await apiCall('/central-messaging/v1/messages?limit=100');
      
      // Create unique conversations from messages
      const convMap = new Map();
      result.data.messages.forEach(msg => {
        if (!convMap.has(msg.conversationId)) {
          convMap.set(msg.conversationId, {
            conversationId: msg.conversationId,
            recipientPhone: msg.recipientPhone,
            recipientName: msg.recipientName || msg.recipientPhone,
            lastMessage: msg,
            unreadCount: 0,
            messages: []
          });
        }
      });
      
      setConversations(Array.from(convMap.values()));
      console.log('✅ [WHATSAPP] Conversations fetched successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error fetching conversations:', err.message);
      showToast(`Failed to load conversations: ${err.message}`, 'error');
    }
  };

  // Fetch messages for a specific conversation
  const fetchConversationMessages = async (conversationId) => {
    try {
      console.log('🔄 [WHATSAPP] Fetching conversation messages...');
      const result = await apiCall(`/central-messaging/v1/messages/conversation/${conversationId}`);
      setConversationMessages(result.data.messages || []);
      console.log('✅ [WHATSAPP] Conversation messages fetched successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error fetching conversation messages:', err.message);
      showToast(`Failed to load conversation: ${err.message}`, 'error');
    }
  };

  // Health check
  const healthCheck = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 [WHATSAPP] Performing health check...');
      
      const result = await apiCall('/central-messaging/v1/health');
      showToast('Health check successful! All systems operational.', 'success');
      console.log('✅ [WHATSAPP] Health check successful');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error in health check:', err.message);
      showToast(`Health check failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Error cleared
      
      try {
        // Always fetch configs first
        await Promise.all([
          fetchConfig(),
          fetchEmailConfig(),
          fetchEmailStatus()
        ]);
        
        switch (activeTab) {
          case 'overview':
            await Promise.all([
              fetchTemplates(),
              fetchMessages(),
              fetchContacts(),
              fetchSettingsOverview()
            ]);
            break;
          case 'messages':
            await fetchMessages();
            break;
          case 'inbox':
            await fetchConversations();
            break;
          case 'templates':
            await fetchTemplates();
            break;
          case 'contacts':
            await fetchContacts();
            break;
          case 'credits':
            await Promise.all([
              fetchCreditSettings(),
              fetchSettingsOverview()
            ]);
            break;
          case 'settings':
            await Promise.all([
              fetchConfig(),
              fetchEmailConfig(),
              fetchEmailStatus(),
              fetchCreditSettings()
            ]);
            break;
          case 'analytics':
            await Promise.all([
              fetchTemplates(),
              fetchMessages(),
              fetchContacts(),
              fetchAnalytics()
            ]);
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

  // Pre-populate email form when reconfiguring
  const handleEmailConfigDialogOpen = (open) => {
    console.log('🔄 [EMAIL] handleEmailConfigDialogOpen called with:', open, 'emailConfig:', emailConfig);
    if (open) {
      if (emailConfig) {
        // Pre-populate with existing config
        setEmailConfigForm({
          email: emailConfig.email || '',
          password: '' // Don't show existing password for security
        });
      } else {
        // Reset form for new setup
        setEmailConfigForm({
          email: '',
          password: ''
        });
      }
    }
    setEmailConfigDialogOpen(open);
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

  // Overview Tab Content
  const OverviewContent = ({ setCreateChannelDialogOpen }) => (
    <div className="space-y-6">
      {/* Configuration Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp Configuration */}
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

        {/* Email Configuration */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-green-600" />
                <span>Email Configuration</span>
              </span>
              <div className="flex items-center space-x-2">
                {!emailConfig ? (
                  <Button onClick={() => handleEmailConfigDialogOpen(true)} size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Setup
                  </Button>
                ) : (
                  <>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Configured
                    </Badge>
                    <Button
                      onClick={testEmailConfiguration} 
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                    <Button
                      onClick={() => handleEmailConfigDialogOpen(true)} 
                      variant="outline"
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Reconfigure
                    </Button>
                    <Button
                      onClick={() => {
                        const testEmail = prompt('Enter email address to send test email to:', emailConfig?.email || '');
                        if (testEmail) {
                          sendTestEmail(testEmail);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Test Email
                    </Button>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emailConfig ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm text-muted-foreground">{emailConfig.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Service:</span>
                  <span className="text-sm text-muted-foreground capitalize">
                    {emailConfig.email?.includes('gmail') ? 'Gmail' : 
                     emailConfig.email?.includes('yahoo') ? 'Yahoo' : 
                     emailConfig.email?.includes('outlook') || emailConfig.email?.includes('hotmail') ? 'Outlook' : 
                     'Custom'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={emailStatus?.isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {emailStatus?.isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                {emailStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Test:</span>
                    <span className="text-sm text-muted-foreground">
                      {emailStatus.lastTested ? new Date(emailStatus.lastTested).toLocaleString() : 'Never'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Email Not Configured</h3>
                <p className="text-muted-foreground mb-4">
                  Set up your email service credentials to enable email notifications and communications.
                </p>
                <Button onClick={() => handleEmailConfigDialogOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Setup Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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

      {/* Messaging Channels Overview */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-purple-600" />
            <span>Messaging Channels</span>
          </CardTitle>
          <CardDescription>
            Overview of all configured messaging channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Channel Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">WhatsApp API</p>
                    <p className="text-2xl font-bold text-green-900">{config ? '1' : '0'}</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Bailey Scanner</p>
                    <p className="text-2xl font-bold text-blue-900">0</p>
                  </div>
                  <Smartphone className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800">Email SMTP</p>
                    <p className="text-2xl font-bold text-purple-900">{emailConfig ? '1' : '0'}</p>
                  </div>
                  <Mail className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateChannelDialogOpen(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Channel</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('overview')}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>View All Channels</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
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
            <Button onClick={syncTemplates} variant="outline" size="sm" disabled={templateSyncLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${templateSyncLoading ? 'animate-spin' : ''}`} />
              Sync Templates
            </Button>
            <Button onClick={() => setTemplateDialogOpen(true)} size="sm">
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
              {(templates || []).map((template) => (
                <TableRow key={template.templateId || template._id || template.templateName}>
                  <TableCell className="font-medium">{template.templateName}</TableCell>
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

  // Contacts Tab Content
  const ContactsContent = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>WhatsApp Contacts</span>
            </CardTitle>
            <CardDescription className="mt-1">Manage WhatsApp contacts and conversations</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button onClick={fetchContacts} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No contacts found</h3>
            <p className="text-muted-foreground mb-4">
              Contacts will appear here when messages are sent or received
            </p>
            <Button onClick={() => setSendDialogOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Send First Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Inbox Tab Content
  const InboxContent = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span>WhatsApp Inbox</span>
            </CardTitle>
            <CardDescription className="mt-1">View and manage conversations</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button onClick={fetchConversations} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setSendDialogOpen(true)} size="sm">
              <Send className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {conversations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Conversations List */}
              <div className="md:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
                {conversations.map((conv) => (
                  <Card 
                    key={conv.conversationId}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.conversationId === conv.conversationId ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      setSelectedConversation(conv);
                      fetchConversationMessages(conv.conversationId);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-blue-600" />
                            <p className="font-medium">{conv.recipientName}</p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {conv.recipientPhone}
                          </p>
                          {conv.lastMessage && (
                            <p className="text-xs text-muted-foreground mt-2 truncate">
                              {conv.lastMessage.content?.text || conv.lastMessage.content?.templateName || 'Media message'}
                            </p>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-blue-600">{conv.unreadCount}</Badge>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(conv.lastMessage.sentAt).toLocaleString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Chat Window */}
              <div className="md:col-span-2">
                {selectedConversation ? (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{selectedConversation.recipientName}</CardTitle>
                          <CardDescription>{selectedConversation.recipientPhone}</CardDescription>
                        </div>
                        <Button 
                          onClick={() => {
                            const phone = selectedConversation.recipientPhone;
                            const countryCode = phone.match(/^\+\d{1,4}/)?.[0] || '+91';
                            const phoneNumber = phone.replace(countryCode, '');
                            setSendForm({
                              ...sendForm,
                              countryCode,
                              phoneNumber
                            });
                            setContactSearch(selectedConversation.recipientName);
                            setSendDialogOpen(true);
                          }}
                          size="sm"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 max-h-[400px] overflow-y-auto">
                      <div className="space-y-4">
                        {conversationMessages.map((msg) => (
                          <div 
                            key={msg._id}
                            className={`flex ${msg.senderType === 'admin' || msg.senderType === 'coach' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] rounded-lg p-3 ${
                              msg.senderType === 'admin' || msg.senderType === 'coach' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm">
                                {msg.content?.text || msg.content?.templateName || 'Media message'}
                              </p>
                              <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                                <span>{new Date(msg.sentAt).toLocaleTimeString()}</span>
                                {msg.senderType === 'admin' || msg.senderType === 'coach' ? (
                                  <span className="ml-2">
                                    {msg.status === 'read' && <CheckCircle className="h-3 w-3 inline" />}
                                    {msg.status === 'delivered' && <CheckCircle className="h-3 w-3 inline" />}
                                    {msg.status === 'sent' && <Clock className="h-3 w-3 inline" />}
                                    {msg.status === 'failed' && <XCircle className="h-3 w-3 inline" />}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-12 text-center">
                      <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                      <p className="text-muted-foreground">
                        Choose a conversation from the list to view messages
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
              <p className="text-muted-foreground mb-4">
                Start a conversation by sending a message
              </p>
              <Button onClick={() => setSendDialogOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Send First Message
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Credits Tab Content
  const CreditsContent = () => (
    <div className="space-y-6">
      {/* Credit Settings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${creditSettings?.creditPrice || '0.01'}
            </div>
            <p className="text-xs text-muted-foreground">Per message</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Credits</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settingsOverview?.systemStats?.totalCreditsInSystem || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total in system</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coaches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settingsOverview?.systemStats?.totalActiveCoaches || 0}
            </div>
            <p className="text-xs text-muted-foreground">Using WhatsApp</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {creditSettings?.isEnabled ? (
              <Badge className="bg-green-500">Enabled</Badge>
            ) : (
              <Badge variant="destructive">Disabled</Badge>
            )}
            <p className="text-xs text-muted-foreground mt-2">Credit system</p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Settings Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>Credit System Configuration</span>
          </CardTitle>
          <CardDescription>Manage credit pricing and auto-recharge settings</CardDescription>
        </CardHeader>
        <CardContent>
          {creditSettings ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="creditPrice">Credit Price (per message)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="creditPrice"
                      type="number"
                      step="0.001"
                      min="0"
                      value={creditSettings.creditPrice}
                      onChange={(e) => setCreditSettings({...creditSettings, creditPrice: parseFloat(e.target.value)})}
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Price coaches pay per WhatsApp message
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>System Status</Label>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Label htmlFor="isEnabled" className="flex-1 cursor-pointer">
                      Enable Credit System
                    </Label>
                    <Badge className={creditSettings.isEnabled ? 'bg-green-500' : 'bg-gray-500'}>
                      {creditSettings.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rechargeThreshold">Recharge Threshold</Label>
                  <Input
                    id="rechargeThreshold"
                    type="number"
                    min="1"
                    value={creditSettings.rechargeThreshold}
                    onChange={(e) => setCreditSettings({...creditSettings, rechargeThreshold: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Trigger recharge when balance falls below this
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rechargeAmount">Recharge Amount</Label>
                  <Input
                    id="rechargeAmount"
                    type="number"
                    min="1"
                    value={creditSettings.rechargeAmount}
                    onChange={(e) => setCreditSettings({...creditSettings, rechargeAmount: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Credits to add during auto-recharge
                  </p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Changes to credit pricing will affect all future transactions. Existing balances remain unchanged.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end">
                <Button 
                  onClick={() => updateCreditSettings(creditSettings)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Update Credit Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Loading credit settings...</h3>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Analytics Tab Content
  const AnalyticsContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">{messagesTotal}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold">{templates?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contacts</p>
                <p className="text-2xl font-bold">{contactsTotal}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{config ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>Message Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
            <p className="text-muted-foreground">
              Detailed analytics and reporting features will be available soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Settings Tab Content
  const SettingsContent = () => (
    <div className="space-y-6">
      {/* WhatsApp Configuration */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>WhatsApp Configuration</span>
          </CardTitle>
          <CardDescription>Manage your WhatsApp Business API settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {config ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Phone Number ID</Label>
                  <p className="text-sm text-muted-foreground">{config.phoneNumberId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Business Account ID</Label>
                  <p className="text-sm text-muted-foreground">{config.businessAccountId}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => handleConfigDialogOpen(true)} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Configuration
                </Button>
                <Button onClick={healthCheck} variant="outline">
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Configuration Found</h3>
              <p className="text-muted-foreground mb-4">
                Set up your WhatsApp Business API configuration to get started
              </p>
              <Button onClick={() => handleConfigDialogOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Setup Configuration
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Mail className="h-5 w-5 text-green-600" />
            <span>Email Configuration</span>
          </CardTitle>
          <CardDescription>Manage your email service settings for notifications and communications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailConfig ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email Address</Label>
                  <p className="text-sm text-muted-foreground">{emailConfig.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Service</Label>
                  <p className="text-sm text-muted-foreground capitalize">
                    {emailConfig.email?.includes('gmail') ? 'Gmail' : 
                     emailConfig.email?.includes('yahoo') ? 'Yahoo' : 
                     emailConfig.email?.includes('outlook') || emailConfig.email?.includes('hotmail') ? 'Outlook' : 
                     'Custom'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => handleEmailConfigDialogOpen(true)} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Configuration
                </Button>
                <Button onClick={testEmailConfiguration} variant="outline">
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button 
                  onClick={() => {
                    const testEmail = prompt('Enter email address to send test email to:', emailConfig?.email || '');
                    if (testEmail) {
                      sendTestEmail(testEmail);
                    }
                  }}
                  variant="outline"
                  disabled={loading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Email Configuration Found</h3>
              <p className="text-muted-foreground mb-4">
                Set up your email service configuration to enable email notifications
              </p>
              <Button onClick={() => handleEmailConfigDialogOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Setup Email Configuration
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 text-green-600" />
            <span>Template Management</span>
          </CardTitle>
          <CardDescription>Sync and manage your WhatsApp templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button onClick={syncTemplates} disabled={templateSyncLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${templateSyncLoading ? 'animate-spin' : ''}`} />
              {templateSyncLoading ? 'Syncing...' : 'Sync Templates'}
            </Button>
            <Button onClick={() => setTemplateDialogOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Credit Settings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${creditSettings?.creditPrice || '0.01'}
            </div>
            <p className="text-xs text-muted-foreground">Per message</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Credits</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settingsOverview?.systemStats?.totalCreditsInSystem || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total in system</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coaches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settingsOverview?.systemStats?.totalActiveCoaches || 0}
            </div>
            <p className="text-xs text-muted-foreground">Using WhatsApp</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {creditSettings?.isEnabled ? (
              <Badge className="bg-green-500">Enabled</Badge>
            ) : (
              <Badge variant="destructive">Disabled</Badge>
            )}
            <p className="text-xs text-muted-foreground mt-2">Credit system</p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Settings Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>Credit System Configuration</span>
          </CardTitle>
          <CardDescription>Manage credit pricing and auto-recharge settings</CardDescription>
        </CardHeader>
        <CardContent>
          {creditSettings ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="creditPrice">Credit Price (per message)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="creditPrice"
                      type="number"
                      step="0.001"
                      min="0"
                      value={creditSettings.creditPrice}
                      onChange={(e) => setCreditSettings({...creditSettings, creditPrice: parseFloat(e.target.value)})}
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Price coaches pay per WhatsApp message
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>System Status</Label>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Label htmlFor="isEnabled" className="flex-1 cursor-pointer">
                      Enable Credit System
                    </Label>
                    <Badge className={creditSettings.isEnabled ? 'bg-green-500' : 'bg-gray-500'}>
                      {creditSettings.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rechargeThreshold">Recharge Threshold</Label>
                  <Input
                    id="rechargeThreshold"
                    type="number"
                    min="1"
                    value={creditSettings.rechargeThreshold}
                    onChange={(e) => setCreditSettings({...creditSettings, rechargeThreshold: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Trigger recharge when balance falls below this
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rechargeAmount">Recharge Amount</Label>
                  <Input
                    id="rechargeAmount"
                    type="number"
                    min="1"
                    value={creditSettings.rechargeAmount}
                    onChange={(e) => setCreditSettings({...creditSettings, rechargeAmount: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Credits to add during auto-recharge
                  </p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Changes to credit pricing will affect all future transactions. Existing balances remain unchanged.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end">
                <Button
                  onClick={() => updateCreditSettings(creditSettings)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Update Credit Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Loading credit settings...</h3>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Messaging Channels Content Component
  const ChannelsContent = ({
    createChannelDialogOpen,
    setCreateChannelDialogOpen,
    channels,
    setChannels,
    channelsLoading,
    channelForm,
    setChannelForm,
    handleCreateChannel,
    loadChannels
  }) => {
    const [selectedChannelType, setSelectedChannelType] = useState('');

    useEffect(() => {
      if (activeTab === 'overview' && !channelsLoadedRef.current && !channelsLoadingRef.current) {
        console.log('🔄 [OVERVIEW] Tab activated, loading channels for first time...');
        loadChannels();
      } else if (activeTab === 'overview' && channelsLoadedRef.current) {
        console.log('🔄 [OVERVIEW] Tab activated, channels already loaded, skipping...');
      } else if (activeTab === 'overview' && channelsLoadingRef.current) {
        console.log('🔄 [OVERVIEW] Tab activated, channels loading in progress, skipping...');
      }
    }, [activeTab, loadChannels]);

    // Toggle channel status
    const handleToggleChannel = async (channelId) => {
      try {
        const response = await fetch(`/api/messaging-channels/${channelId}/toggle`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        const result = await response.json();

        if (result.success) {
          await loadChannels();
        } else {
          showToast(result.message || 'Failed to toggle channel status', 'error');
        }
      } catch (error) {
        console.error('Error toggling channel:', error);
        showToast('Failed to toggle channel status', 'error');
      }
    };

    // Delete channel
    const handleDeleteChannel = async (channelId) => {
      if (!confirm('Are you sure you want to delete this messaging channel? This action cannot be undone.')) {
        return;
      }

      try {
        const response = await fetch(`/api/messaging-channels/${channelId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        const result = await response.json();

        if (result.success) {
          await loadChannels();
          showToast('Messaging channel deleted successfully', 'success');
        } else {
          showToast(result.message || 'Failed to delete channel', 'error');
        }
      } catch (error) {
        console.error('Error deleting channel:', error);
        setChannelsError('Failed to delete messaging channel');
      }
    };

    const getChannelTypeIcon = (type) => {
      switch (type) {
        case 'whatsapp_api':
          return <MessageCircle className="h-4 w-4 text-green-600" />;
        case 'whatsapp_bailey':
          return <Smartphone className="h-4 w-4 text-blue-600" />;
        case 'email_smtp':
          return <Mail className="h-4 w-4 text-purple-600" />;
        default:
          return <Settings className="h-4 w-4" />;
      }
    };

    const getChannelTypeLabel = (type) => {
      switch (type) {
        case 'whatsapp_api':
          return 'WhatsApp API';
        case 'whatsapp_bailey':
          return 'Bailey Scanner';
        case 'email_smtp':
          return 'Email SMTP';
        default:
          return type;
      }
    };

    const getChannelStatusBadge = (channel) => {
      if (!channel.isActive) {
        return <Badge variant="secondary">Inactive</Badge>;
      }

      if (channel.type === 'whatsapp_api') {
        return <Badge className="bg-green-100 text-green-800">API Connected</Badge>;
      } else if (channel.type === 'whatsapp_bailey') {
        return channel.whatsappBailey?.isConnected ?
          <Badge className="bg-blue-100 text-blue-800">Scanner Connected</Badge> :
          <Badge variant="outline">Scanner Disconnected</Badge>;
      } else if (channel.type === 'email_smtp') {
        return channel.configMetadata?.testStatus === 'success' ?
          <Badge className="bg-purple-100 text-purple-800">SMTP Verified</Badge> :
          <Badge variant="outline">SMTP Unverified</Badge>;
      }

      return <Badge variant="outline">Configured</Badge>;
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Messaging Channels</h2>
            <p className="text-muted-foreground">
              Manage different messaging channels (WhatsApp API, Bailey Scanner, Email SMTP)
            </p>
          </div>
          <Button onClick={() => setCreateChannelDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Channel
          </Button>
        </div>

        {/* Channels Table */}
        <Card>
          <CardHeader>
            <CardTitle>Configured Channels</CardTitle>
            <CardDescription>
              All messaging channels configured in your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {channelsLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : channels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No messaging channels configured</h3>
                <p className="text-sm">Create your first messaging channel to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Messages Sent</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channels.map((channel) => (
                    <TableRow key={channel._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{channel.name}</div>
                          <div className="text-sm text-muted-foreground">{channel.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelTypeIcon(channel.type)}
                          <span>{getChannelTypeLabel(channel.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelStatusBadge(channel)}
                          <Switch
                            checked={channel.isActive}
                            onCheckedChange={() => handleToggleChannel(channel._id)}
                            size="sm"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{channel.statistics?.totalMessagesSent || 0}</div>
                          <div className="text-muted-foreground">
                            Today: {channel.statistics?.messagesSentToday || 0}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {channel.isDefault && (
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            Default
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteChannel(channel._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f9fafb;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 10px;
            transition: background-color 0.2s ease;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #d1d5db #f9fafb;
          }
        `
      }} />
      <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central Messaging</h1>
          <p className="text-muted-foreground mt-2">
            Manage centralized WhatsApp messaging and templates
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {config && (
            <Button onClick={() => setSendDialogOpen(true)} size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          )}
        </div>
      </div>

      {/* Error/Success Messages - Now shown as toast notifications */}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-fit max-w-4xl">
          <TabsTrigger value="overview" className="flex items-center space-x-2 px-3">
            <Network className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="inbox" className="flex items-center space-x-2 px-3">
            <MessageCircle className="h-4 w-4" />
            <span>Inbox</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2 px-3">
            <FileText className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2 px-3">
            <Activity className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2 px-3">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ChannelsContent
            createChannelDialogOpen={createChannelDialogOpen}
            setCreateChannelDialogOpen={setCreateChannelDialogOpen}
            channels={channels}
            setChannels={setChannels}
            channelsLoading={channelsLoading}
            channelForm={channelForm}
            setChannelForm={setChannelForm}
            handleCreateChannel={handleCreateChannel}
            loadChannels={loadChannels}
          />
        </TabsContent>

        <TabsContent value="inbox">
          <InboxContent />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesContent />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesContent />
        </TabsContent>

        <TabsContent value="contacts">
          <ContactsContent />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsContent />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsContent />
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

      <Dialog open={sendDialogOpen} onOpenChange={(open) => {
        setSendDialogOpen(open);
        if (!open && !loading) resetSendForm();
      }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-4">
              {!bulkMode ? (
                // Single Message Mode
                <>
                  {/* Contact/Phone Number with Suggestions */}
                  <div className="space-y-2">
                    <Label>Contact or Phone Number</Label>
                    <div className="relative">
                      <Input
                        placeholder="Search contacts or enter number..."
                        value={contactSearch}
                        onChange={(e) => {
                          setContactSearch(e.target.value);
                          setShowContactSuggestions(true);
                        }}
                        onFocus={() => setShowContactSuggestions(true)}
                      />
                      {showContactSuggestions && filteredContacts.length > 0 && contactSearch && (
                        <Card className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto">
                          <CardContent className="p-2">
                            {filteredContacts.slice(0, 5).map((contact, idx) => (
                              <div
                                key={idx}
                                className="flex items-center space-x-2 p-2 hover:bg-gray-100 cursor-pointer rounded"
                                onClick={() => handleContactSelect(contact)}
                              >
                                <Phone className="h-4 w-4 text-blue-600" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {contact.name || contact.profileName || 'Unknown'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {contact.phoneNumber || contact.phone}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>

                  {/* Country Code and Phone Number */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label>Country Code</Label>
                      <div className="relative">
                        <Select 
                          value={sendForm.countryCode} 
                          onValueChange={(value) => setSendForm({...sendForm, countryCode: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            <div className="p-2 sticky top-0 bg-white">
                              <Input
                                placeholder="Search country..."
                                value={countryCodeSearch}
                                onChange={(e) => setCountryCodeSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            {filteredCountryCodes.map((item) => (
                              <SelectItem key={item.code} value={item.code}>
                                <span className="flex items-center space-x-2">
                                  <span>{item.flag}</span>
                                  <span>{item.code}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Phone Number</Label>
                      <div className="relative">
                        <Input
                          type="tel"
                          placeholder="Enter phone number or search contacts..."
                          value={sendForm.phoneNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setSendForm({...sendForm, phoneNumber: value});
                            // Show contact suggestions when typing
                            if (value.length > 0) {
                              const filtered = contacts.filter(contact => 
                                contact.phoneNumber.includes(value) || 
                                (contact.name && contact.name.toLowerCase().includes(value.toLowerCase()))
                              );
                              setContactSuggestions(filtered.slice(0, 5));
                              setShowSuggestions(true);
                            } else {
                              setContactSuggestions([]);
                              setShowSuggestions(false);
                            }
                          }}
                          onFocus={() => {
                            console.log('🔍 [WHATSAPP] Phone input focused, contacts:', contacts.length);
                            if (contacts.length > 0 && sendForm.phoneNumber.length === 0) {
                              // Show all contacts when focused and empty
                              setContactSuggestions(contacts.slice(0, 5));
                              setShowSuggestions(true);
                            }
                          }}
                          onBlur={() => {
                            // Delay hiding suggestions to allow click on suggestion
                            setTimeout(() => setShowSuggestions(false), 200);
                          }}
                        />
                        
                        {/* Contact Suggestions Dropdown for Phone Number */}
                        {showSuggestions && contactSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                            {contactSuggestions.map((contact, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                onClick={() => {
                                  // Extract phone number without country code
                                  const phone = contact.phoneNumber || contact.phone || '';
                                  const phoneNumber = phone.replace(sendForm.countryCode, '');
                                  setSendForm({
                                    ...sendForm,
                                    phoneNumber: phoneNumber.replace(/\D/g, '')
                                  });
                                  setShowSuggestions(false);
                                }}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Phone className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {contact.name || 'Unknown Contact'}
                                    </p>
                                    <p className="text-xs text-gray-500">{contact.phoneNumber}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditContact(contact);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Full Number Display */}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                    <Phone className="h-4 w-4" />
                    <span>Full Number: {sendForm.countryCode}{sendForm.phoneNumber || '___________'}</span>
                  </div>
                </>
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
                            className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                            onClick={() => handleContactSelect(contact)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Phone className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {contact.name || 'Unknown Contact'}
                                </p>
                                <p className="text-xs text-gray-500">{contact.phoneNumber}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditContact(contact);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleContactSelect(contact);
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
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
                        {selectedContacts.map((contact) => (
                          <div
                            key={contact.phoneNumber}
                            className="flex items-center justify-between p-2 bg-blue-50 rounded border"
                          >
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">{contact.name || 'Unknown'}</span>
                              <span className="text-xs text-gray-500">({contact.phoneNumber})</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
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

              {/* Message Type Selection */}
              <div className="space-y-2">
                <Label>Message Type</Label>
                <Select 
                  value={sendForm.templateName && sendForm.templateName !== '' ? 'template' : sendForm.mediaUrl && sendForm.mediaUrl !== '' ? 'media' : 'text'} 
                  onValueChange={(value) => {
                    console.log('🔄 [MESSAGE_TYPE] Changing to:', value, 'Current templateName:', sendForm.templateName);
                    if (value === 'text') {
                      setSendForm({...sendForm, templateName: '', mediaUrl: '', templateParameters: []});
                      setSelectedTemplate(null);
                    } else if (value === 'template') {
                      // Set a flag to show template selection
                      setSendForm({...sendForm, templateName: 'SELECT_TEMPLATE', mediaUrl: '', message: '', templateParameters: []});
                      setSelectedTemplate(null);
                    } else if (value === 'media') {
                      setSendForm({...sendForm, templateName: '', message: '', templateParameters: [], mediaUrl: 'MEDIA'});
                      setSelectedTemplate(null);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">
                      <span className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Text Message</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="template">
                      <span className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Template Message</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="media">
                      <span className="flex items-center space-x-2">
                        <Image className="h-4 w-4" />
                        <span>Media Message</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Text Message */}
              {!sendForm.templateName && !sendForm.mediaUrl && (
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your message..."
                    value={sendForm.message}
                    onChange={(e) => setSendForm({...sendForm, message: e.target.value})}
                    rows={6}
                  />
                </div>
              )}

              {/* Template Message */}
              {sendForm.templateName && sendForm.templateName !== '' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Template</Label>
                    <Select 
                      value={sendForm.templateName === 'SELECT_TEMPLATE' ? '' : sendForm.templateName} 
                      onValueChange={(value) => {
                        console.log('🔄 [TEMPLATE_SELECT] onValueChange called with:', value);
                        handleTemplateSelect(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {(() => {
                          console.log('🔄 [TEMPLATE_DROPDOWN] Templates array:', templates);
                          console.log('🔄 [TEMPLATE_DROPDOWN] Templates length:', templates?.length || 0);
                          return !templates || templates.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p>No templates available</p>
                              <p className="text-xs mt-1">Create templates in Meta Business Manager</p>
                            </div>
                          ) : (
                          <>
                            {/* Show all templates, highlight approved ones */}
                            {(templates || []).map((template) => {
                              console.log('🔄 [TEMPLATE_ITEM] Rendering template:', template);
                              return (
                                <SelectItem 
                                  key={template.templateId || template.templateName} 
                                  value={template.templateName}
                                  disabled={template.status !== 'APPROVED'}
                                >
                                <div className="flex items-center justify-between w-full gap-2">
                                  <div className="flex-1">
                                    <div className="font-medium">{template.templateName}</div>
                                    {template.components?.find(c => c.type === 'BODY')?.text && (
                                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {template.components.find(c => c.type === 'BODY').text.substring(0, 50)}...
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Badge 
                                      className={`text-xs ${
                                        template.status === 'APPROVED' 
                                          ? 'bg-green-500' 
                                          : template.status === 'PENDING'
                                          ? 'bg-yellow-500'
                                          : 'bg-red-500'
                                      }`}
                                    >
                                      {template.status}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {template.category}
                                    </Badge>
                                  </div>
                                </div>
                              </SelectItem>
                              );
                            })}
                          </>
                        );
                        })()}
                      </SelectContent>
                    </Select>
                    {templates && templates.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {(templates || []).filter(t => t.status === 'APPROVED').length} approved template(s) available
                      </p>
                    )}
                  </div>

                  {/* Show Template Body Preview */}
                  {selectedTemplate && selectedTemplate.components && (
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        <strong className="text-sm">Template Body:</strong>
                        <pre className="text-xs mt-2 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                          {selectedTemplate.components?.find(c => c.type === 'BODY')?.text || 'No body text'}
                        </pre>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Template Parameters */}
                  {selectedTemplate && selectedTemplate.components && sendForm.templateParameters.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Fill Template Parameters</Label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800 mb-3">
                          <Info className="h-3 w-3 inline mr-1" />
                          Replace the placeholders with actual values
                        </p>
                        {sendForm.templateParameters.map((param, index) => (
                          <div key={index} className="mb-3 last:mb-0">
                            <Label className="text-sm font-medium text-gray-700">
                              {param.placeholder} - Parameter {index + 1}
                            </Label>
                            <Input
                              placeholder={`Enter value for ${param.placeholder}`}
                              value={param.value || ''}
                              onChange={(e) => handleParameterChange(index, e.target.value)}
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              This will replace <code className="bg-gray-200 px-1 rounded">{param.placeholder}</code> in the message
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Media Message */}
              {sendForm.mediaUrl !== '' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mediaUrl">Media URL</Label>
                    <Input
                      id="mediaUrl"
                      placeholder="https://example.com/image.jpg"
                      value={sendForm.mediaUrl}
                      onChange={(e) => setSendForm({...sendForm, mediaUrl: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mediaType">Media Type</Label>
                    <Select 
                      value={sendForm.mediaType} 
                      onValueChange={(value) => setSendForm({...sendForm, mediaType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">
                          <span className="flex items-center space-x-2">
                            <Image className="h-4 w-4" />
                            <span>Image</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="video">
                          <span className="flex items-center space-x-2">
                            <Video className="h-4 w-4" />
                            <span>Video</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="document">
                          <span className="flex items-center space-x-2">
                            <File className="h-4 w-4" />
                            <span>Document</span>
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caption">Caption (Optional)</Label>
                    <Textarea
                      id="caption"
                      placeholder="Enter caption..."
                      value={sendForm.message}
                      onChange={(e) => setSendForm({...sendForm, message: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Bulk Message Input for Bulk Mode - Only show for text messages */}
              {bulkMode && !sendForm.templateName && !sendForm.mediaUrl && (
                <div className="space-y-2">
                  <Label htmlFor="bulk-message">Message</Label>
                  <Textarea
                    id="bulk-message"
                    placeholder="Enter your message..."
                    value={bulkMessage}
                    onChange={(e) => setBulkMessage(e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              {/* Optional Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadId">Lead ID (Optional)</Label>
                  <Input
                    id="leadId"
                    placeholder="Lead ID"
                    value={sendForm.leadId}
                    onChange={(e) => setSendForm({...sendForm, leadId: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID (Optional)</Label>
                  <Input
                    id="clientId"
                    placeholder="Client ID"
                    value={sendForm.clientId}
                    onChange={(e) => setSendForm({...sendForm, clientId: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-4">
              <div className="sticky top-0">
                <Label className="text-lg font-semibold">Message Preview</Label>
                <Card className="mt-2 border-2 border-blue-200">
                  <CardHeader className="bg-blue-50">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">WhatsApp Business</CardTitle>
                        <CardDescription className="text-xs">
                          {bulkMode ? `To: ${selectedContacts.length} contacts` : `To: ${sendForm.countryCode}${sendForm.phoneNumber || '___________'}`}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 min-h-[300px] bg-[#e5ddd5] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik0wIDBoMTAwdjEwMEgweiIgZmlsbD0iI2U1ZGRkNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')]">
                    <div className="flex justify-end">
                      <div className="bg-[#dcf8c6] rounded-lg p-3 max-w-[85%] shadow-sm">
                        {bulkMode ? (
                          <div className="space-y-2">
                            {sendForm.templateName && selectedTemplate ? (
                              <div className="space-y-2">
                                <pre className="text-sm whitespace-pre-wrap font-sans text-gray-800">
                                  {generateMessagePreview()}
                                </pre>
                                {sendForm.templateParameters.some(p => !p.value) && (
                                  <p className="text-xs text-amber-600 italic">
                                    * Fill all parameters to see complete preview
                                  </p>
                                )}
                              </div>
                            ) : sendForm.mediaUrl && sendForm.mediaUrl !== 'MEDIA' ? (
                              <div className="space-y-2">
                                <div className="bg-gray-200 rounded p-4 text-center">
                                  <Image className="h-12 w-12 mx-auto text-gray-400" />
                                  <p className="text-xs text-gray-500 mt-2">Media Preview</p>
                                </div>
                                {sendForm.message && (
                                  <p className="text-sm text-gray-800">{sendForm.message}</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap text-gray-800">
                                {bulkMessage || 'Your bulk message will appear here...'}
                              </p>
                            )}
                            {selectedContacts.length > 0 && (
                              <p className="text-xs text-blue-600">
                                Will be sent to {selectedContacts.length} contacts
                              </p>
                            )}
                          </div>
                        ) : selectedTemplate && selectedTemplate.components ? (
                          <div className="space-y-2">
                            <pre className="text-sm whitespace-pre-wrap font-sans text-gray-800">
                              {generateMessagePreview()}
                            </pre>
                            {sendForm.templateParameters.some(p => !p.value) && (
                              <p className="text-xs text-amber-600 italic">
                                * Fill all parameters to see complete preview
                              </p>
                            )}
                          </div>
                        ) : sendForm.message ? (
                          <p className="text-sm whitespace-pre-wrap text-gray-800">
                            {sendForm.message}
                          </p>
                        ) : sendForm.mediaUrl ? (
                          <div className="space-y-2">
                            <div className="bg-gray-200 rounded p-4 text-center">
                              <Image className="h-12 w-12 mx-auto text-gray-400" />
                              <p className="text-xs text-gray-500 mt-2">Media Preview</p>
                            </div>
                            {sendForm.message && (
                              <p className="text-sm text-gray-800">{sendForm.message}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            Your message preview will appear here...
                          </p>
                        )}
                        <div className="flex justify-end items-center space-x-1 mt-2">
                          <span className="text-[10px] text-gray-500">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <CheckCircle className="h-3 w-3 text-blue-500" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Template Info */}
                {selectedTemplate && selectedTemplate.components && (
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Template:</strong> {selectedTemplate.templateName}<br />
                      <strong>Category:</strong> {selectedTemplate.category}<br />
                      <strong>Language:</strong> {selectedTemplate.language}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
              Cancel
            </Button>
            {bulkMode ? (
              <Button 
                onClick={sendBulkMessages} 
                disabled={
                  loading || 
                  selectedContacts.length === 0 || 
                  (!sendForm.templateName && !sendForm.mediaUrl && !bulkMessage.trim()) ||
                  (sendForm.templateName && !selectedTemplate) ||
                  (selectedTemplate && sendForm.templateParameters.some(p => !p.value)) ||
                  (sendForm.mediaUrl === 'MEDIA')
                }
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send to {selectedContacts.length} Contacts
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={sendMessage} 
                disabled={
                  loading || 
                  !sendForm.phoneNumber || 
                  (!sendForm.message && !sendForm.templateName && !sendForm.mediaUrl) ||
                  (sendForm.templateName === 'SELECT_TEMPLATE') ||
                  (sendForm.mediaUrl === 'MEDIA') ||
                  (selectedTemplate && sendForm.templateParameters.some(p => !p.value)) ||
                  (sendForm.templateName && !selectedTemplate)
                }
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Edit Dialog */}
      <Dialog open={contactEditDialog} onOpenChange={setContactEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update the contact name and phone number.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={contactEditForm.phoneNumber}
                onChange={(e) => setContactEditForm({...contactEditForm, phoneNumber: e.target.value})}
                disabled
              />
            </div>
            
            <div className="space-y-2">
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
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Creation Dialog - Redirects to Meta */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Create WhatsApp Template
            </DialogTitle>
            <DialogDescription>
              WhatsApp templates must be created and approved through Meta Business Manager
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Templates need to be created directly in Meta Business Manager and approved by WhatsApp before they can be used.
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-blue-900">Steps to Create a Template:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li>Click "Open Meta Business Manager" below</li>
                <li>Create your template with message content and variables</li>
                <li>Submit for WhatsApp approval (usually takes 15 minutes - 24 hours)</li>
                <li>Once approved, return here and click "Sync Templates"</li>
                <li>Your template will be available for sending messages!</li>
              </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-gray-900">Template Components Stored:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Template name, category, and language</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Body text with variable placeholders (e.g., {'{{1}}'} )</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Header and footer components</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Button actions and quick replies</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Approval status and metadata</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2">Template Variable Example:</h4>
              <div className="space-y-2 text-sm">
                <p className="text-amber-800">When you create a template with variables like:</p>
                <code className="block bg-white p-2 rounded border border-amber-200 text-amber-900">
                  Hello {'{{1}}'}, your appointment is on {'{{2}}'} at {'{{3}}'}.
                </code>
                <p className="text-amber-800 mt-2">After syncing, you can send messages by providing:</p>
                <code className="block bg-white p-2 rounded border border-amber-200 text-amber-900">
                  parameters: ["John Doe", "Dec 25, 2024", "2:00 PM"]
                </code>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createTemplate} className="bg-blue-600 hover:bg-blue-700">
                <Globe className="h-4 w-4 mr-2" />
                Open Meta Business Manager
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Configuration Dialog */}
      <Dialog open={emailConfigDialogOpen} onOpenChange={handleEmailConfigDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              {emailConfig ? 'Update Email Configuration' : 'Setup Email Configuration'}
            </DialogTitle>
            <DialogDescription>
              {loading 
                ? (emailConfig ? 'Updating your email configuration. This may take a few moments...' : 'Setting up your email configuration. This may take a few moments...')
                : (emailConfig 
                  ? 'Update your email service credentials. All fields are required for updates.'
                  : 'Configure your email service credentials to enable email notifications and communications.'
                )
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">

            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={emailConfigForm.email}
                onChange={(e) => setEmailConfigForm({...emailConfigForm, email: e.target.value})}
              />
              {emailConfig && (
                <p className="text-xs text-muted-foreground">
                  Current: {emailConfig.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password / App Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your email password or app password"
                value={emailConfigForm.password}
                onChange={(e) => setEmailConfigForm({...emailConfigForm, password: e.target.value})}
              />
              {emailConfig && (
                <p className="text-xs text-muted-foreground">
                  Current: ••••••••••••••••••••••••••••••••
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                For Gmail, use an App Password instead of your regular password. Enable 2FA and generate an App Password in your Google Account settings.
              </p>
            </div>

            {/* Instructions */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Setup Instructions:</strong> Enter your email address and password. For Gmail, Yahoo, and Outlook, 
                you may need to use an App Password instead of your regular password. The system will automatically 
                detect the email service and configure the appropriate SMTP settings.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEmailConfigDialogOpen(false)}>
                Cancel
              </Button>
              {emailConfig && (
                <Button 
                  onClick={() => {
                    const testEmail = prompt('Enter email address to send test email to:', emailConfigForm.email || '');
                    if (testEmail) {
                      sendTestEmail(testEmail);
                    }
                  }}
                  variant="outline"
                  disabled={loading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </Button>
              )}
              <Button 
                onClick={setupEmailConfig}
                disabled={loading || !emailConfigForm.email || !emailConfigForm.password}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {emailConfig ? 'Updating...' : 'Setting up...'}
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    {emailConfig ? 'Update Configuration' : 'Setup Email'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Channel Dialog */}
      <CustomDialog open={createChannelDialogOpen} onOpenChange={(open) => {
        setCreateChannelDialogOpen(open);
        if (!open) {
          setShowApiToken(false);
          setShowSmtpPassword(false);
          // Cleanup Bailey session on dialog close
          if (baileySession) {
            disconnectBaileySession();
          }
        }
      }}>
        <CustomDialogContent
          className="flex flex-col"
          style={{
            height: '70vh',
            background: '#ffffff'
          }}
        >
          <CustomDialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CustomDialogTitle>Create Messaging Channel</CustomDialogTitle>
                  <CustomDialogDescription>
                    Add a new messaging channel to your platform
                  </CustomDialogDescription>
                </div>
              </div>
              <button
                onClick={() => setCreateChannelDialogOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </CustomDialogHeader>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 h-full divide-x divide-gray-200">
              {/* Left Column - Basic Information */}
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Channel Setup</h3>
                  <p className="text-sm text-gray-600">Configure your messaging channel</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="channel-name" className="text-sm font-medium text-gray-700">Channel Name</Label>
                    <Input
                      id="channel-name"
                      placeholder="e.g., Main Business Channel"
                      value={channelForm.name}
                      onChange={(e) => setChannelForm({...channelForm, name: e.target.value})}
                      className="h-11 mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="channel-type" className="text-sm font-medium text-gray-700">Channel Type</Label>
                    <Select value={channelForm.type} onValueChange={(value) => setChannelForm({...channelForm, type: value})}>
                      <SelectTrigger className="h-11 mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select channel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp_api">
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="h-4 w-4 text-green-600" />
                            <span>Meta WhatsApp</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="whatsapp_bailey">
                          <div className="flex items-center space-x-2">
                            <Smartphone className="h-4 w-4 text-blue-600" />
                            <span>WhatsApp Scanner</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="email_smtp">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-purple-600" />
                            <span>Email SMTP</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Right Column - Configuration */}
              <div className="p-8">
                {/* WhatsApp API Configuration */}
                {channelForm.type === 'whatsapp_api' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Meta WhatsApp Configuration</h3>
                      <p className="text-sm text-gray-600">Configure your WhatsApp Business API</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="phone-number-id" className="text-sm font-medium text-gray-700">Phone Number ID</Label>
                        <Input
                          id="phone-number-id"
                          placeholder="Enter your WhatsApp phone number ID"
                          value={channelForm.whatsappApi.phoneNumberId}
                          onChange={(e) => setChannelForm({
                            ...channelForm,
                            whatsappApi: {...channelForm.whatsappApi, phoneNumberId: e.target.value}
                          })}
                          className="h-11 mt-2 border-gray-200 focus:border-green-500 focus:ring-green-500 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="access-token" className="text-sm font-medium text-gray-700">Access Token</Label>
                        <div className="relative mt-2">
                          <Input
                            id="access-token"
                            type={showApiToken ? "text" : "password"}
                            placeholder="Enter your WhatsApp access token"
                            value={channelForm.whatsappApi.accessToken}
                            onChange={(e) => setChannelForm({
                              ...channelForm,
                              whatsappApi: {...channelForm.whatsappApi, accessToken: e.target.value}
                            })}
                            className="h-11 pr-12 border-gray-200 focus:border-green-500 focus:ring-green-500 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiToken(!showApiToken)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showApiToken ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="business-account-id" className="text-sm font-medium text-gray-700">Business Account ID</Label>
                        <Input
                          id="business-account-id"
                          placeholder="Enter your business account ID"
                          value={channelForm.whatsappApi.businessAccountId}
                          onChange={(e) => setChannelForm({
                            ...channelForm,
                            whatsappApi: {...channelForm.whatsappApi, businessAccountId: e.target.value}
                          })}
                          className="h-11 mt-2 border-gray-200 focus:border-green-500 focus:ring-green-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bailey's Scanner Configuration */}
                {channelForm.type === 'whatsapp_bailey' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">WhatsApp Scanner Setup</h3>
                      <p className="text-sm text-gray-600">Connect using Bailey's WhatsApp integration</p>
                    </div>

                    <div className="space-y-6">
                      {/* QR Code Display */}
                      <div className="text-center">
                        {!baileySession ? (
                          <div className="py-8">
                            <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-sm text-gray-600 mb-6">
                              Generate a QR code to connect your WhatsApp scanner
                            </p>
                            <Button
                              onClick={initBaileySession}
                              disabled={baileyLoading}
                              className="bg-blue-600 hover:bg-blue-700 px-6"
                            >
                              {baileyLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Initializing...
                                </>
                              ) : (
                                <>
                                  <QrCode className="h-4 w-4 mr-2" />
                                  Generate QR Code
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <>
                            {baileyStatus === 'initializing' && (
                              <div className="py-8">
                                <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600 mb-4" />
                                <p className="text-sm text-gray-600">Initializing WhatsApp scanner...</p>
                              </div>
                            )}

                            {baileyStatus === 'qr_ready' && baileyQR && (
                              <div className="py-4">
                                <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                                  <img
                                    src={baileyQR}
                                    alt="WhatsApp QR Code"
                                    className="w-full max-w-sm mx-auto"
                                    onError={(e) => {
                                      console.warn('❌ Primary QR code failed to load, trying fallback...');
                                      // Try to use fallback QR if available (would need to be passed from API)
                                      e.target.src = `data:image/svg+xml;base64,${btoa(`
                                        <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                                          <rect width="256" height="256" fill="white"/>
                                          <rect x="32" y="32" width="192" height="192" fill="black"/>
                                          <rect x="64" y="64" width="128" height="128" fill="white"/>
                                          <rect x="96" y="96" width="64" height="64" fill="black"/>
                                          <text x="128" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white">QR Code</text>
                                          <text x="128" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="white">Loading...</text>
                                        </svg>
                                      `)}`;
                                    }}
                                  />
                                </div>
                                <div className="space-y-3">
                                  <p className="text-sm font-semibold text-gray-800">Scan QR Code</p>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                    Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
                                  </p>
                                  <div className="flex items-center justify-center space-x-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                                    <Clock className="h-3 w-3" />
                                    <span>Expires in 2 minutes</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {baileyStatus === 'connecting' && (
                              <div className="py-8">
                                <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600 mb-4" />
                                <p className="text-sm text-gray-600">Connecting to WhatsApp...</p>
                              </div>
                            )}

                            {baileyStatus === 'retrying' && baileyRetryInfo && (
                              <div className="py-8">
                                <Loader2 className="h-10 w-10 animate-spin mx-auto text-orange-600 mb-4" />
                                <p className="text-sm font-semibold text-orange-800 mb-2">Reconnecting...</p>
                                <p className="text-xs text-gray-600">
                                  Attempt {baileyRetryInfo.retryCount} of {baileyRetryInfo.maxRetries}
                                </p>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(baileyRetryInfo.retryCount / baileyRetryInfo.maxRetries) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {baileyStatus === 'error' && (
                              <div className="py-8">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <XCircle className="h-8 w-8 text-red-600" />
                                </div>
                                <p className="text-sm font-semibold text-red-800 mb-2">Connection Failed</p>
                                <p className="text-xs text-gray-600 mb-4">Unable to connect to WhatsApp. Please try again.</p>
                                <Button
                                  onClick={() => {
                                    disconnectBaileySession();
                                    setTimeout(() => initBaileySession(), 1000);
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Try Again
                                </Button>
                              </div>
                            )}

                            {baileyStatus === 'connected' && (
                              <div className="py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <p className="text-sm font-semibold text-green-800 mb-2">Connected Successfully!</p>
                                <p className="text-xs text-gray-600">Your WhatsApp scanner is now ready to use.</p>
                              </div>
                            )}

                            {baileyStatus === 'logged_out' && (
                              <div className="py-8">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <XCircle className="h-8 w-8 text-red-600" />
                                </div>
                                <p className="text-sm font-semibold text-red-800 mb-2">Session Logged Out</p>
                                <p className="text-xs text-gray-600 mb-4">Your WhatsApp session has been logged out. Please scan QR code again.</p>
                                <Button
                                  onClick={() => {
                                    disconnectBaileySession();
                                    setTimeout(() => initBaileySession(), 1000);
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Start New Session
                                </Button>
                              </div>
                            )}

                            {baileyStatus === 'timeout' && (
                              <div className="py-8">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <XCircle className="h-8 w-8 text-red-600" />
                                </div>
                                <p className="text-sm font-semibold text-red-800 mb-2">QR Code Expired</p>
                                <p className="text-xs text-gray-600 mb-4">Please generate a new QR code.</p>
                                <Button
                                  onClick={initBaileySession}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Try Again
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Device Configuration */}
                      {(channelForm.whatsappBailey.deviceId || channelForm.whatsappBailey.sessionId) && (
                        <div className="border-t pt-6">
                          <h4 className="text-sm font-semibold text-gray-800 mb-4">Device Configuration</h4>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="device-id" className="text-sm font-medium text-gray-700">Device ID</Label>
                              <Input
                                id="device-id"
                                placeholder="Auto-filled after QR scan"
                                value={channelForm.whatsappBailey.deviceId}
                                onChange={(e) => setChannelForm({
                                  ...channelForm,
                                  whatsappBailey: {...channelForm.whatsappBailey, deviceId: e.target.value}
                                })}
                                className="h-11 mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                readOnly={!!channelForm.whatsappBailey.deviceId}
                              />
                              {channelForm.whatsappBailey.deviceId && (
                                <p className="text-xs text-green-600 mt-1 flex items-center">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Connected and ready
                                </p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="session-id" className="text-sm font-medium text-gray-700">Session ID</Label>
                              <Input
                                id="session-id"
                                placeholder="Auto-filled after connection"
                                value={channelForm.whatsappBailey.sessionId}
                                onChange={(e) => setChannelForm({
                                  ...channelForm,
                                  whatsappBailey: {...channelForm.whatsappBailey, sessionId: e.target.value}
                                })}
                                className="h-11 mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                readOnly={!!channelForm.whatsappBailey.sessionId}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <Alert className="border-blue-200 bg-blue-50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-sm text-blue-800">
                          After scanning the QR code, your device ID and session information will be automatically filled.
                          The channel will be ready to use once connected.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                )}

                {/* Email SMTP Configuration */}
                {channelForm.type === 'email_smtp' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Email SMTP Configuration</h3>
                      <p className="text-sm text-gray-600">Configure your email SMTP settings</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="smtp-host" className="text-sm font-medium text-gray-700">SMTP Host</Label>
                        <Input
                          id="smtp-host"
                          placeholder="smtp.gmail.com"
                          value={channelForm.emailSmtp.host}
                          onChange={(e) => setChannelForm({
                            ...channelForm,
                            emailSmtp: {...channelForm.emailSmtp, host: e.target.value}
                          })}
                          className="h-11 mt-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="smtp-port" className="text-sm font-medium text-gray-700">Port</Label>
                          <Input
                            id="smtp-port"
                            type="number"
                            placeholder="587"
                            value={channelForm.emailSmtp.port}
                            onChange={(e) => setChannelForm({
                              ...channelForm,
                              emailSmtp: {...channelForm.emailSmtp, port: parseInt(e.target.value)}
                            })}
                            className="h-11 mt-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtp-user" className="text-sm font-medium text-gray-700">Email</Label>
                          <Input
                            id="smtp-user"
                            type="email"
                            placeholder="your-email@gmail.com"
                            value={channelForm.emailSmtp.auth.user}
                            onChange={(e) => setChannelForm({
                              ...channelForm,
                              emailSmtp: {
                                ...channelForm.emailSmtp,
                                auth: {...channelForm.emailSmtp.auth, user: e.target.value},
                                fromEmail: channelForm.emailSmtp.fromEmail || e.target.value
                              }
                            })}
                            className="h-11 mt-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="smtp-pass" className="text-sm font-medium text-gray-700">App Password</Label>
                        <div className="relative mt-2">
                          <Input
                            id="smtp-pass"
                            type={showSmtpPassword ? "text" : "password"}
                            placeholder="Enter your app password"
                            value={channelForm.emailSmtp.auth.pass}
                            onChange={(e) => setChannelForm({
                              ...channelForm,
                              emailSmtp: {
                                ...channelForm.emailSmtp,
                                auth: {...channelForm.emailSmtp.auth, pass: e.target.value}
                              }
                            })}
                            className="h-11 pr-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showSmtpPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          <CustomDialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateChannelDialogOpen(false)}
              className="border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChannel}
              disabled={channelsLoading || !channelForm.name || !channelForm.type}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {channelsLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Channel
                </>
              )}
            </Button>
          </CustomDialogFooter>
        </CustomDialogContent>
      </CustomDialog>
    </div>
  </>
);
};

export default WhatsAppDashboard;