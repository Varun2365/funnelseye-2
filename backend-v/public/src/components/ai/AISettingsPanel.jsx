import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Textarea } from '../ui/textarea';
import {
  Settings,
  Key,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Search,
  Check,
  Info,
  User,
  Plus,
  Edit,
  Trash2,
  FileText,
  History,
  Clock,
  DollarSign as DollarSignIcon,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import adminApiService from '../../services/adminApiService';
import { useAuth } from '../../contexts/AuthContext';

const AISettingsPanel = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [settings, setSettings] = useState({
    enabled: false,
    apiKey: '',
    hasApiKey: false,
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-3.5-turbo'
  });

  const [balance, setBalance] = useState(null);
  const [usage, setUsage] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [showModelDialog, setShowModelDialog] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    // Load currency from localStorage on initialization
    const savedCurrency = localStorage.getItem('aiCurrency');
    return savedCurrency || 'USD';
  });
  const [currencyRates, setCurrencyRates] = useState({});
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [priceSort, setPriceSort] = useState('none'); // 'none', 'high-to-low', 'low-to-high'
  const [selectedModelInfo, setSelectedModelInfo] = useState(null);
  const [showModelInfoDialog, setShowModelInfoDialog] = useState(false);
  const [tempSelectedModel, setTempSelectedModel] = useState(null);
  const [personas, setPersonas] = useState([]);
  const [showPersonaDialog, setShowPersonaDialog] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [personaForm, setPersonaForm] = useState({
    name: '',
    tokenLimit: '',
    personaPrompt: ''
  });
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true); // Start with true to show loading initially
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsStats, setLogsStats] = useState(null);
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get tomorrow's date in YYYY-MM-DD format
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [logsFilters, setLogsFilters] = useState({
    model: '',
    status: '',
    startDate: getTodayDate(),
    endDate: getTomorrowDate()
  });
  const [logsLimit, setLogsLimit] = useState(50); // Items per page
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestPrompt, setRequestPrompt] = useState('');
  const [requestResponse, setRequestResponse] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestModel, setRequestModel] = useState('');
  const [activeTab, setActiveTab] = useState('logs');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogDialog, setShowLogDialog] = useState(false);

  // Memoize the disabled state to prevent recalculation on every render
  const isRequestButtonDisabled = useMemo(() => {
    return requestLoading || !requestPrompt.trim();
  }, [requestLoading, requestPrompt]);

  // Save currency to localStorage when it changes
  useEffect(() => {
    if (selectedCurrency) {
      localStorage.setItem('aiCurrency', selectedCurrency);
    }
  }, [selectedCurrency]);

  // Load settings on mount - but only after authentication is confirmed
  useEffect(() => {
    // Wait for auth to complete before making API calls
    // Also check if token exists in localStorage as a safety check
    const token = localStorage.getItem('adminToken');
    if (!authLoading && isAuthenticated && token) {
      console.log('🔐 [AISettingsPanel] Auth confirmed, loading settings...');
      loadSettings();
      loadCurrencyRates();
      // Load logs when component mounts (default tab is "logs")
      loadLogs();
      loadBalance();
    } else if (!authLoading && !isAuthenticated) {
      console.log('🔐 [AISettingsPanel] Not authenticated, skipping API calls');
    }
  }, [authLoading, isAuthenticated]);

  // Load currency rates
  const loadCurrencyRates = async () => {
    try {
      setCurrencyLoading(true);
      // Using a free currency API (exchangerate-api.com or similar)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      if (data.rates) {
        setCurrencyRates(data.rates);
      }
    } catch (error) {
      console.error('Error loading currency rates:', error);
      // Fallback rates (approximate)
      setCurrencyRates({
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        INR: 83.0,
        JPY: 150.0,
        CAD: 1.35,
        AUD: 1.52
      });
    } finally {
      setCurrencyLoading(false);
    }
  };

  // Convert price to selected currency (per token)
  const convertPricePerToken = (priceInUSD) => {
    if (!priceInUSD || priceInUSD === 0) return 'Free';
    const rate = currencyRates[selectedCurrency] || 1;
    const converted = parseFloat(priceInUSD) * rate;
    
    if (selectedCurrency === 'USD') {
      return `$${converted.toFixed(6)}`;
    } else if (selectedCurrency === 'EUR') {
      return `€${converted.toFixed(6)}`;
    } else if (selectedCurrency === 'GBP') {
      return `£${converted.toFixed(6)}`;
    } else if (selectedCurrency === 'INR') {
      return `₹${converted.toFixed(4)}`;
    } else if (selectedCurrency === 'JPY') {
      return `¥${converted.toFixed(4)}`;
    } else {
      return `${converted.toFixed(6)} ${selectedCurrency}`;
    }
  };

  // Convert price to selected currency (per 1 lakh tokens = 100,000 tokens)
  const convertPrice = (priceInUSD) => {
    if (!priceInUSD || priceInUSD === 0) return 'Free';
    const rate = currencyRates[selectedCurrency] || 1;
    // Multiply by 100,000 (1 lakh) to show per 1 lakh tokens
    const converted = parseFloat(priceInUSD) * rate * 100000;
    
    if (selectedCurrency === 'USD') {
      return `$${converted.toFixed(2)}`;
    } else if (selectedCurrency === 'EUR') {
      return `€${converted.toFixed(2)}`;
    } else if (selectedCurrency === 'GBP') {
      return `£${converted.toFixed(2)}`;
    } else if (selectedCurrency === 'INR') {
      return `₹${converted.toFixed(2)}`;
    } else if (selectedCurrency === 'JPY') {
      return `¥${converted.toFixed(2)}`;
    } else {
      return `${converted.toFixed(2)} ${selectedCurrency}`;
    }
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    switch (selectedCurrency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      case 'JPY': return '¥';
      case 'CAD': return 'C$';
      case 'AUD': return 'A$';
      default: return selectedCurrency + ' ';
    }
  };

  // Convert USD value to selected currency
  const convertUSDToCurrency = (usdValue) => {
    const rate = currencyRates[selectedCurrency] || 1;
    return usdValue * rate;
  };

  // Get selected model details
  const getSelectedModel = () => {
    return models.find(m => m.id === settings.defaultModel);
  };

  // Filter models based on search and price
  const filteredModels = useMemo(() => {
    let filtered = models;
    
    // Apply search filter
    if (modelSearch.trim()) {
      const searchLower = modelSearch.toLowerCase();
      filtered = filtered.filter(model =>
        model.name?.toLowerCase().includes(searchLower) ||
        model.id?.toLowerCase().includes(searchLower) ||
        model.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply price sorting
    if (priceSort !== 'none') {
      filtered = filtered.sort((a, b) => {
        const aPromptPrice = parseFloat(a.pricing?.prompt || 0);
        const aCompletionPrice = parseFloat(a.pricing?.completion || 0);
        const aAvgPrice = (aPromptPrice + aCompletionPrice) / 2;
        
        const bPromptPrice = parseFloat(b.pricing?.prompt || 0);
        const bCompletionPrice = parseFloat(b.pricing?.completion || 0);
        const bAvgPrice = (bPromptPrice + bCompletionPrice) / 2;
        
        // Convert to selected currency for sorting
        const rate = currencyRates[selectedCurrency] || 1;
        const aConvertedPrice = aAvgPrice * rate;
        const bConvertedPrice = bAvgPrice * rate;
        
        if (priceSort === 'high-to-low') {
          return bConvertedPrice - aConvertedPrice; // Descending order
        } else if (priceSort === 'low-to-high') {
          return aConvertedPrice - bConvertedPrice; // Ascending order
        }
        return 0;
      });
    }
    
    return filtered;
  }, [models, modelSearch, priceSort, selectedCurrency, currencyRates]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.apiCall('/ai/openrouter/settings');
      
      if (response.success) {
        // Never store the actual API key in frontend state - only store flags
        // The API key is stored securely in the backend database only
        setSettings({
          enabled: response.data.enabled || false,
          apiKey: '', // Never store actual API key in frontend - clear it always
          hasApiKey: response.data.hasApiKey || false,
          baseUrl: response.data.baseUrl || 'https://openrouter.ai/api/v1',
          defaultModel: response.data.defaultModel || 'openai/gpt-3.5-turbo'
        });
        // Load balance and usage if API key exists
        if (response.data.hasApiKey) {
          loadBalance();
          loadUsage();
          loadModels();
        }
      } else {
        toast.error(response.message || 'Failed to load settings');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Don't show error toast if it's an authentication error (redirect will happen)
      if (error.message && !error.message.includes('401') && !error.message.includes('Access denied')) {
        toast.error('Failed to load OpenRouter settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    try {
      setBalanceLoading(true);
      const response = await adminApiService.apiCall('/ai/openrouter/balance');
      
      if (response.success) {
        setBalance(response.data);
      }
    } catch (error) {
      console.error('Error loading balance:', error);
      // Don't show error toast for balance, it's not critical
      // Don't redirect on error - let the main loadSettings handle auth errors
    } finally {
      setBalanceLoading(false);
    }
  };

  const loadUsage = async () => {
    try {
      const response = await adminApiService.apiCall('/ai/openrouter/usage');
      
      if (response.success) {
        setUsage(response.data);
      }
    } catch (error) {
      console.error('Error loading usage:', error);
      // Don't show error toast for usage, it's not critical
      // Don't redirect on error - let the main loadSettings handle auth errors
    }
  };

  const loadModels = async () => {
    try {
      setModelsLoading(true);
      const response = await adminApiService.apiCall('/ai/openrouter/models');
      
      if (response.success) {
        setModels(response.data || []);
      }
    } catch (error) {
      console.error('Error loading models:', error);
      // Don't show error toast if it's an authentication error (redirect will happen)
      if (error.message && !error.message.includes('401') && !error.message.includes('Access denied')) {
        toast.error('Failed to load models');
      }
    } finally {
      setModelsLoading(false);
    }
  };

  const loadLogs = async (customFilters = null, customPage = null, customLimit = null) => {
    try {
      setLogsLoading(true);
      const filtersToUse = customFilters || logsFilters;
      const pageToUse = customPage !== null ? customPage : logsPage;
      const limitToUse = customLimit !== null ? customLimit : logsLimit;
      const params = new URLSearchParams({
        page: pageToUse.toString(),
        limit: limitToUse.toString(),
        ...(filtersToUse.model && filtersToUse.model.trim() !== '' && { model: filtersToUse.model.trim() }),
        ...(filtersToUse.status && filtersToUse.status.trim() !== '' && { status: filtersToUse.status.trim() }),
        ...(filtersToUse.startDate && { startDate: filtersToUse.startDate }),
        ...(filtersToUse.endDate && { endDate: filtersToUse.endDate })
      });
      
      console.log('[LoadLogs] Filters:', filtersToUse);
      console.log('[LoadLogs] Status filter:', filtersToUse.status);
      console.log('[LoadLogs] Params:', params.toString());
      
      const response = await adminApiService.apiCall(`/ai/logs?${params.toString()}`);
      
      if (response.success) {
        setLogs(response.data.logs || []);
        setLogsTotal(response.data.pagination?.total || 0);
        setLogsStats(response.data.stats || null);
      } else {
        toast.error(response.message || 'Failed to load logs');
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      toast.error('Failed to load AI request logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleSave = async () => {
    // Only require API key if enabling and we don't already have one saved
    if (settings.enabled && !settings.apiKey.trim() && !settings.hasApiKey) {
      toast.error('API key is required when enabling OpenRouter');
      return;
    }

    try {
      setSaving(true);
      // Only send API key if user provided a new one (not empty)
      const payload = {
        enabled: settings.enabled,
        defaultModel: settings.defaultModel
      };
      
      // Only include API key if user entered a new one
      if (settings.apiKey.trim()) {
        payload.apiKey = settings.apiKey.trim();
      }
      
      const response = await adminApiService.apiCall('/ai/openrouter/settings', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (response.success) {
        toast.success('OpenRouter settings saved successfully');
        // Clear API key from state after saving - it's stored securely in backend database only
        // Never store API key in frontend state or localStorage
        setSettings(prev => ({
          ...prev,
          hasApiKey: response.data.hasApiKey,
          apiKey: '', // Always clear API key from frontend state - never persist it
          defaultModel: response.data.defaultModel || prev.defaultModel
        }));
        
        // Reload balance and usage if enabled
        if (response.data.enabled && response.data.hasApiKey) {
          loadBalance();
          loadUsage();
          loadModels();
        }
      } else {
        toast.error(response.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save OpenRouter settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.hasApiKey) {
      toast.error('Please save an API key first');
      return;
    }

    try {
      setTesting(true);
      setConnectionStatus(null);
      
      const response = await adminApiService.apiCall('/ai/openrouter/test', {
        method: 'POST'
      });

      if (response.success) {
        setConnectionStatus({
          success: true,
          message: response.message,
          data: response.data
        });
        toast.success('Connection test successful!');
      } else {
        setConnectionStatus({
          success: false,
          message: response.message || 'Connection test failed'
        });
        toast.error('Connection test failed');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus({
        success: false,
        message: error.message || 'Connection test failed'
      });
      toast.error('Failed to test connection');
    } finally {
      setTesting(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadBalance(), loadUsage()]);
    setRefreshing(false);
    toast.success('Information refreshed');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-full px-4 lg:px-8 md:px-6 sm:px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Features</h1>
          <p className="text-sm text-slate-600">
            Configure and manage AI-powered features for your platform
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="logs" className="w-full" onValueChange={(value) => {
          setActiveTab(value);
          if (value === 'logs') {
            loadLogs();
            loadBalance(); // Load balance when opening logs tab
          }
        }}>
          <div className="flex justify-start mb-6">
            <TabsList className="inline-flex h-11 items-center justify-start rounded-lg bg-slate-100/50 p-1.5">
              <TabsTrigger 
                value="logs" 
                className="px-5 py-2.5 rounded-md text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-200"
              >
                <History className="h-4 w-4 mr-2" />
                Logs
              </TabsTrigger>
              <TabsTrigger 
                value="persona" 
                className="px-5 py-2.5 rounded-md text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-200"
              >
                <User className="h-4 w-4 mr-2" />
                Persona
              </TabsTrigger>
              <TabsTrigger 
                value="knowledge-base" 
                className="px-5 py-2.5 rounded-md text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                Knowledge Base
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="px-5 py-2.5 rounded-md text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="settings" className="mt-0">

            {/* OpenRouter Configuration Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      OpenRouter Configuration
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-slate-600">
                      Manage your OpenRouter API key and settings
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={settings.enabled ? "default" : "secondary"}
                    className={settings.enabled ? "bg-green-100 text-green-700 border-green-200" : ""}
                  >
                    {settings.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-0">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/60">
                  <div className="space-y-1">
                    <Label htmlFor="enable-openrouter" className="text-base font-semibold text-slate-900">
                      Enable OpenRouter
                    </Label>
                    <p className="text-sm text-slate-600">
                      Enable AI features powered by OpenRouter
                    </p>
                  </div>
                  <Switch
                    id="enable-openrouter"
                    checked={settings.enabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
                    className="data-[state=checked]:bg-slate-900"
                  />
                </div>

                {/* API Key Input */}
                <div className="space-y-3">
                  <Label htmlFor="api-key" className="text-sm font-semibold text-slate-900">
                    OpenRouter API Key
                  </Label>
                  <div className="relative">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      value={settings.apiKey}
                      onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder={settings.hasApiKey ? "API key is saved (enter new key to update)" : "sk-or-v1-..."}
                      className="pr-10 h-11 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 hover:bg-slate-100"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4 text-slate-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-600" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Get your API key from{' '}
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      OpenRouter Dashboard
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>

                {/* Model Selection */}
                {settings.hasApiKey && (
                  <div className="space-y-3">
                    <Label htmlFor="default-model" className="text-sm font-semibold text-slate-900">
                      Default Model
                    </Label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        {modelsLoading ? (
                          <div className="flex items-center justify-center p-4 border border-slate-300 rounded-lg bg-slate-50 h-11">
                            <Loader2 className="h-4 w-4 animate-spin text-slate-600 mr-2" />
                            <span className="text-sm text-slate-600">Loading models...</span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowModelDialog(true);
                              // Load models when dialog opens if not already loaded
                              if (models.length === 0 && !modelsLoading) {
                                loadModels();
                              }
                            }}
                            className="w-full h-11 justify-between border-slate-300 hover:bg-slate-50"
                          >
                            <span className="font-medium">
                              {getSelectedModel()?.name || settings.defaultModel || 'Select a model'}
                            </span>
                            <Sparkles className="h-4 w-4 text-slate-500" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Pricing Display */}
                      {getSelectedModel() ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 min-w-[200px]">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                              <span className="font-medium">Prompt:</span>
                              <span>{convertPrice(getSelectedModel().pricing?.prompt)} / 1L tokens</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-slate-400 hover:text-slate-600 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs bg-slate-900 text-white border-slate-700">
                                  <p className="text-sm font-medium mb-1">Pricing Information</p>
                                  <div className="text-xs text-slate-200 space-y-1">
                                    <p><span className="font-medium">Per 1 Lakh (100,000) tokens:</span> {convertPrice(getSelectedModel().pricing?.prompt)}</p>
                                    <p><span className="font-medium">Per token:</span> {convertPricePerToken(getSelectedModel().pricing?.prompt)}</p>
                                    <p className="mt-2 pt-2 border-t border-slate-700">
                                      A typical request uses 100-1000 tokens, so costs are very low per request.
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <span className="font-medium">Completion:</span>
                              <span>{convertPrice(getSelectedModel().pricing?.completion)} / 1L tokens</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-slate-400 hover:text-slate-600 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs bg-slate-900 text-white border-slate-700">
                                  <p className="text-sm font-medium mb-1">Pricing Information</p>
                                  <div className="text-xs text-slate-200 space-y-1">
                                    <p><span className="font-medium">Per 1 Lakh (100,000) tokens:</span> {convertPrice(getSelectedModel().pricing?.completion)}</p>
                                    <p><span className="font-medium">Per token:</span> {convertPricePerToken(getSelectedModel().pricing?.completion)}</p>
                                    <p className="mt-2 pt-2 border-t border-slate-700">
                                      A typical request uses 100-1000 tokens, so costs are very low per request.
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 min-w-[200px]">
                          <div className="text-xs text-slate-500 italic">
                            Select a model to see pricing
                          </div>
                        </div>
                      )}

                      {/* Currency Selector */}
                      <Select
                        value={selectedCurrency}
                        onValueChange={setSelectedCurrency}
                      >
                        <SelectTrigger className="w-[100px] h-11 border-slate-300 focus:border-slate-900 focus:ring-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="INR">INR</SelectItem>
                          <SelectItem value="JPY">JPY</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                          <SelectItem value="AUD">AUD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-slate-500">
                      This model will be used by default for all AI requests
                    </p>
                  </div>
                )}

                {/* Connection Status */}
                {connectionStatus && (
                  <Alert 
                    variant={connectionStatus.success ? "default" : "destructive"}
                    className={connectionStatus.success ? "bg-green-50 border-green-200" : ""}
                  >
                    {connectionStatus.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription className={connectionStatus.success ? "text-green-800" : ""}>
                      {connectionStatus.message}
                      {connectionStatus.data && (
                        <div className="mt-2 text-xs space-y-1">
                          <p className="font-medium">Provider: {connectionStatus.data.provider}</p>
                          <p className="font-medium">Model: {connectionStatus.data.model}</p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium px-8"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage & Balance Card */}
            {settings.hasApiKey && (
              <Card className="border-0 shadow-sm mt-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900">
                        Usage & Balance
                      </CardTitle>
                      <CardDescription className="mt-1.5 text-slate-600">
                        Monitor your OpenRouter API usage and account balance
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="h-9 w-9 hover:bg-slate-100"
                    >
                      <RefreshCw className={`h-4 w-4 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-0">
                  {/* Balance Information */}
                  {balance && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl border border-blue-100/60">
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-2">Account Status</p>
                          <div className="flex items-center gap-2">
                            {balance.keyValid ? (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-base font-semibold text-green-700">API Key Valid</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-5 w-5 text-red-600" />
                                <span className="text-base font-semibold text-red-700">Invalid API Key</span>
                              </>
                            )}
                          </div>
                          {balance.label && (
                            <p className="text-xs text-slate-500 mt-2">Label: {balance.label}</p>
                          )}
                        </div>
                      </div>

                      {balance.dashboardUrl && (
                        <Alert className="bg-blue-50/50 border-blue-200/60">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            <p className="text-sm">
                              View detailed usage statistics and balance in your{' '}
                              <a
                                href={balance.dashboardUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 font-medium"
                              >
                                OpenRouter Dashboard
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </p>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {/* Usage Information */}
                  {usage && (
                    <div className="space-y-3">
                      <Separator className="bg-slate-200" />
                      <div className="p-5 bg-slate-50/80 rounded-xl border border-slate-200/60">
                        <p className="text-sm font-semibold text-slate-900 mb-2">Usage Information</p>
                        {usage.message && (
                          <p className="text-sm text-slate-600">{usage.message}</p>
                        )}
                        {usage.note && (
                          <p className="text-xs text-slate-500 mt-2">{usage.note}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {!balance && !usage && (
                    <div className="text-center py-12 text-slate-500">
                      <p className="text-sm">Click refresh to load usage information</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="knowledge-base" className="mt-0">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    Knowledge Base
                  </CardTitle>
                  <CardDescription className="mt-1.5 text-slate-600">
                    Add business context and domain knowledge for AI interactions
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="knowledgeBase" className="text-sm font-medium text-slate-900">
                      Business Context & Knowledge Base
                    </Label>
                    <Textarea
                      id="knowledgeBase"
                      placeholder="Enter your business context, domain knowledge, product information, company details, or any specific information that should be available to AI interactions..."
                      value={knowledgeBase}
                      onChange={(e) => setKnowledgeBase(e.target.value)}
                      className="min-h-[300px] border-slate-300 focus:border-slate-900 focus:ring-slate-900 resize-none"
                    />
                    <p className="text-xs text-slate-500">
                      This knowledge base will be used to provide context for all AI interactions across the platform
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      onClick={() => {
                        // Save knowledge base logic here
                        toast.success('Knowledge base saved successfully');
                      }}
                      className="h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium px-8"
                    >
                      Save Knowledge Base
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-0">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      AI Request Logs
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-slate-600">
                      View all AI requests made to OpenRouter and track usage, costs, and performance
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setShowRequestDialog(true)}
                      className="h-10 bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Request
                    </Button>
                    <Button
                      onClick={loadLogs}
                      disabled={logsLoading}
                      variant="outline"
                      className="h-10"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${logsLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* OpenRouter Credits */}
                {balance && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200/60">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-purple-700">OpenRouter Account Balance</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={loadBalance}
                            disabled={balanceLoading}
                            className="h-7 w-7 p-0 hover:bg-purple-100"
                            title="Refresh balance"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 text-purple-600 ${balanceLoading ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
                        {balanceLoading ? (
                          <div className="space-y-2">
                            <div className="h-8 w-32 bg-slate-200 animate-pulse rounded"></div>
                            <div className="h-4 w-40 bg-slate-200 animate-pulse rounded"></div>
                          </div>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-purple-900">
                              ${balance.credits?.toFixed(4) || '0.0000'}
                              {balance.credits && selectedCurrency !== 'USD' && currencyRates[selectedCurrency] && (
                                <span className="text-lg font-normal text-purple-600 ml-2">
                                  (Approx. {(() => {
                                    const converted = balance.credits * currencyRates[selectedCurrency];
                                    return `${selectedCurrency === 'USD' ? '$' : ''}${converted.toFixed(4)}${selectedCurrency !== 'USD' ? ` ${selectedCurrency}` : ''}`;
                                  })()})
                                </span>
                              )}
                            </p>
                            {balance.usage && (
                              <p className="text-xs text-purple-600 mt-1">
                                Usage this month: ${balance.usage?.toFixed(4) || '0.0000'}
                                {selectedCurrency !== 'USD' && currencyRates[selectedCurrency] && (
                                  <span className="ml-1">
                                    (Approx. {(() => {
                                      const converted = balance.usage * currencyRates[selectedCurrency];
                                      return `${selectedCurrency === 'USD' ? '$' : ''}${converted.toFixed(4)}${selectedCurrency !== 'USD' ? ` ${selectedCurrency}` : ''}`;
                                    })()})
                                  </span>
                                )}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <DollarSignIcon className="h-10 w-10 text-purple-400 ml-4" />
                    </div>
                  </div>
                )}
                {/* Stats Summary */}
                {logsStats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100/60">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-blue-600 mb-1">Total Requests</p>
                          <p className="text-2xl font-bold text-blue-900">{logsStats.totalRequests?.toLocaleString() || 0}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-400" />
                      </div>
                    </div>
                    <div className="p-4 bg-green-50/50 rounded-lg border border-green-100/60">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-green-600 mb-1">Total Tokens</p>
                          <p className="text-2xl font-bold text-green-900">{logsStats.totalTokens?.toLocaleString() || 0}</p>
                        </div>
                        <Activity className="h-8 w-8 text-green-400" />
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100/60">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-purple-600 mb-1">Total Cost</p>
                        <p className="text-2xl font-bold text-purple-900">
                          ${(logsStats.totalCost || 0).toFixed(4)}
                          {logsStats.totalCost && selectedCurrency !== 'USD' && currencyRates[selectedCurrency] && (
                            <span className="text-lg font-normal text-purple-600 ml-2">
                              (Approx. {(() => {
                                const cost = logsStats.totalCost || 0;
                                const rate = currencyRates[selectedCurrency] || 1;
                                const convertedCost = cost * rate;
                                return `${selectedCurrency === 'USD' ? '$' : ''}${convertedCost.toFixed(4)}${selectedCurrency !== 'USD' ? ` ${selectedCurrency}` : ''}`;
                              })()})
                            </span>
                          )}
                        </p>
                        </div>
                        <DollarSignIcon className="h-8 w-8 text-purple-400" />
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100/60">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-slate-600 mb-1">Success Rate</p>
                          <p className="text-2xl font-bold text-slate-900">
                            {logsStats.totalRequests > 0 
                              ? ((logsStats.successCount / logsStats.totalRequests) * 100).toFixed(1)
                              : 0}%
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-slate-400" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Model</Label>
                    <Input
                      placeholder="Filter by model..."
                      value={logsFilters.model}
                      onChange={(e) => {
                        setLogsFilters(prev => ({ ...prev, model: e.target.value }));
                        setLogsPage(1);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          loadLogs();
                        }
                      }}
                      className="h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Status</Label>
                    <Select 
                      value={logsFilters.status === '' ? 'all' : logsFilters.status} 
                      onValueChange={(value) => {
                        const newStatus = value === 'all' ? '' : value;
                        const updatedFilters = { ...logsFilters, status: newStatus };
                        setLogsFilters(updatedFilters);
                        setLogsPage(1);
                        // Load logs with updated filters immediately
                        setTimeout(() => {
                          loadLogs(updatedFilters);
                        }, 0);
                      }}
                    >
                      <SelectTrigger className="h-9 mt-1">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="timeout">Timeout</SelectItem>
                        <SelectItem value="rate_limited">Rate Limited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Start Date</Label>
                    <Input
                      type="date"
                      value={logsFilters.startDate}
                      onChange={(e) => {
                        setLogsFilters(prev => ({ ...prev, startDate: e.target.value }));
                        setLogsPage(1);
                      }}
                      onBlur={loadLogs}
                      className="h-9 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">End Date</Label>
                    <Input
                      type="date"
                      value={logsFilters.endDate}
                      onChange={(e) => {
                        setLogsFilters(prev => ({ ...prev, endDate: e.target.value }));
                        setLogsPage(1);
                      }}
                      onBlur={loadLogs}
                      className="h-9 mt-1"
                    />
                  </div>
                </div>

                {/* Logs Table */}
                {logsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-600 mb-2" />
                    <p className="text-sm text-slate-500">Loading logs...</p>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm text-slate-500">No AI request logs found</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead className="font-semibold text-slate-900">Time</TableHead>
                            <TableHead className="font-semibold text-slate-900">User</TableHead>
                            <TableHead className="font-semibold text-slate-900">Model</TableHead>
                            <TableHead className="font-semibold text-slate-900">Prompt</TableHead>
                            <TableHead className="font-semibold text-slate-900">Tokens</TableHead>
                            <TableHead className="font-semibold text-slate-900">Cost</TableHead>
                            <TableHead className="font-semibold text-slate-900">Status</TableHead>
                            <TableHead className="font-semibold text-slate-900">Duration</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {logs.map((log) => (
                            <TableRow 
                              key={log._id} 
                              className="hover:bg-slate-50/50 cursor-pointer"
                              onClick={() => {
                                setSelectedLog(log);
                                setShowLogDialog(true);
                              }}
                            >
                              <TableCell className="text-slate-600">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 text-slate-400" />
                                  <span className="text-xs">
                                    {new Date(log.requestedAt).toLocaleString()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-slate-600">
                                {log.userId?.email || log.userEmail || 'System'}
                              </TableCell>
                              <TableCell className="text-slate-600">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{log.model}</span>
                                  <span className="text-xs text-slate-400">{log.provider}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-slate-600 max-w-[200px]">
                                {log.prompt ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-sm cursor-help truncate block">
                                          {log.prompt.length > 50 
                                            ? `${log.prompt.substring(0, 50)}...` 
                                            : log.prompt}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-md">
                                        <p className="text-sm whitespace-pre-wrap">{log.prompt}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <span className="text-sm text-slate-400">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-slate-600">
                                <div className="flex flex-col">
                                  <span className="text-sm">{log.totalTokens.toLocaleString()}</span>
                                  <span className="text-xs text-slate-400">
                                    {log.promptTokens}P + {log.completionTokens}C
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-slate-600">
                                <div className="flex items-center gap-1">
                                  <DollarSignIcon className="h-3 w-3" />
                                  <span className="text-sm font-medium">
                                    {(() => {
                                      const cost = log.totalCost || 0;
                                      const rate = currencyRates[selectedCurrency] || 1;
                                      const convertedCost = cost * rate;
                                      return `${selectedCurrency === 'USD' ? '$' : ''}${convertedCost.toFixed(6)}${selectedCurrency !== 'USD' ? ` ${selectedCurrency}` : ''}`;
                                    })()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    log.status === 'success'
                                      ? 'border-green-300 text-green-700 bg-green-50'
                                      : log.status === 'error'
                                      ? 'border-red-300 text-red-700 bg-red-50'
                                      : log.status === 'timeout'
                                      ? 'border-yellow-300 text-yellow-700 bg-yellow-50'
                                      : 'border-orange-300 text-orange-700 bg-orange-50'
                                  }
                                >
                                  {log.status.charAt(0).toUpperCase() + log.status.slice(1).replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-600">
                                {log.duration ? `${log.duration}ms` : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Pagination */}
                    {logsTotal > 0 && (
                      <div className="flex items-center justify-between p-4 border-t border-slate-200">
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-slate-600">
                            Showing {(logsPage - 1) * logsLimit + 1} to {Math.min(logsPage * logsLimit, logsTotal)} of {logsTotal} logs
                          </p>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="logs-per-page" className="text-sm text-slate-600">Items per page:</Label>
                            <Select 
                              value={logsLimit.toString()} 
                              onValueChange={(value) => {
                                const newLimit = parseInt(value);
                                setLogsLimit(newLimit);
                                setLogsPage(1);
                                // Pass the new limit directly to loadLogs to avoid state update delay
                                setTimeout(() => loadLogs(null, 1, newLimit), 0);
                              }}
                            >
                              <SelectTrigger id="logs-per-page" className="h-8 w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                                <SelectItem value="200">200</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setLogsPage(prev => Math.max(1, prev - 1));
                              setTimeout(() => loadLogs(), 100);
                            }}
                            disabled={logsPage === 1 || logsLoading}
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-slate-600 px-2">
                            Page {logsPage} of {Math.ceil(logsTotal / logsLimit) || 1}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setLogsPage(prev => prev + 1);
                              setTimeout(() => loadLogs(), 100);
                            }}
                            disabled={logsPage * logsLimit >= logsTotal || logsLoading}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="persona" className="mt-0">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      AI Personas
                    </CardTitle>
                    <CardDescription className="mt-1.5 text-slate-600">
                      Create and manage AI personas with custom token limits
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingPersona(null);
                      setPersonaForm({ name: '', tokenLimit: '' });
                      setShowPersonaDialog(true);
                    }}
                    className="h-10 bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Persona
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {personas.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm text-slate-500 mb-2">No personas created yet</p>
                    <p className="text-xs text-slate-400">Click "Add Persona" to create your first AI persona</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                          <TableHead className="font-semibold text-slate-900">Name</TableHead>
                          <TableHead className="font-semibold text-slate-900">Token Limit</TableHead>
                          <TableHead className="font-semibold text-slate-900">Persona Prompt</TableHead>
                          <TableHead className="font-semibold text-slate-900 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {personas.map((persona, index) => (
                          <TableRow key={index} className="hover:bg-slate-50/50">
                            <TableCell className="font-medium text-slate-900">
                              {persona.name}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {persona.tokenLimit ? `${persona.tokenLimit.toLocaleString()} tokens` : 'Unlimited'}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {persona.personaPrompt ? (
                                <div className="flex items-center gap-2">
                                  <FileText className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span className="text-xs truncate max-w-[200px]" title={persona.personaPrompt}>
                                    {persona.personaPrompt.length > 50 
                                      ? `${persona.personaPrompt.substring(0, 50)}...` 
                                      : persona.personaPrompt}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">No prompt</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingPersona(index);
                                    setPersonaForm({
                                      name: persona.name,
                                      tokenLimit: persona.tokenLimit || ''
                                    });
                                    setShowPersonaDialog(true);
                                  }}
                                  className="h-8 w-8 hover:bg-slate-100"
                                >
                                  <Edit className="h-4 w-4 text-slate-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newPersonas = personas.filter((_, i) => i !== index);
                                    setPersonas(newPersonas);
                                    toast.success('Persona deleted successfully');
                                  }}
                                  className="h-8 w-8 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Model Selection Dialog */}
      <Dialog open={showModelDialog} onOpenChange={setShowModelDialog}>
        <DialogContent 
          className="flex flex-col p-0"
          style={{ width: '70vw', maxHeight: '90vh' }}
        >
          <div className="px-6 pt-6 pb-4 border-b border-slate-200 shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Select Default Model
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 mt-1.5">
                Choose the AI model that will be used by default for all AI requests
              </DialogDescription>
            </DialogHeader>

            {/* Search Input and Price Filter */}
            <div className="mt-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search models by name or ID..."
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  className="pl-10 h-11 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                />
              </div>
              
              {/* Price Sort */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  Sort by Price:
                </Label>
                <Select value={priceSort} onValueChange={setPriceSort}>
                  <SelectTrigger className="h-9 w-[180px] border-slate-300 focus:border-slate-900 focus:ring-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Sort</SelectItem>
                    <SelectItem value="high-to-low">High to Low</SelectItem>
                    <SelectItem value="low-to-high">Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Models List - Scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {modelsLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
                  <span className="text-sm text-slate-600 font-medium">Loading models...</span>
                </div>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm text-slate-500">
                  {modelSearch ? 'No models found matching your search' : 'No models available. Please check your API key.'}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredModels.map((model) => {
                  const isSelected = model.id === (tempSelectedModel || settings.defaultModel);
                  const promptPrice = parseFloat(model.pricing?.prompt || 0);
                  const completionPrice = parseFloat(model.pricing?.completion || 0);
                  
                  return (
                    <div
                      key={model.id}
                      onClick={(e) => {
                        // Don't trigger if clicking on the info button
                        if (e.target.closest('button')) {
                          return;
                        }
                        
                        // Just update the temporary selection
                        setTempSelectedModel(model.id);
                      }}
                      className={`
                        flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer
                        ${isSelected 
                          ? 'bg-slate-900 text-white shadow-md' 
                          : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div 
                            className={`font-semibold text-base ${isSelected ? 'text-white' : 'text-slate-900'}`}
                          >
                            {model.name}
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-white shrink-0" />
                          )}
                        </div>
                        <div className={`text-xs truncate ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                          {model.id}
                        </div>
                        {/* Capabilities Badge */}
                        {model.capabilities && model.capabilities.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {model.capabilities.map((cap, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className={`text-xs px-2 py-0.5 ${
                                  isSelected 
                                    ? 'border-slate-300 text-slate-200 bg-slate-800/50' 
                                    : 'border-slate-300 text-slate-600 bg-slate-50'
                                }`}
                              >
                                {cap.charAt(0).toUpperCase() + cap.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className={`text-right ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                          <div className="text-sm font-medium mb-1">
                            Prompt: {convertPrice(promptPrice)} / 1L
                          </div>
                          <div className="text-sm font-medium">
                            Completion: {convertPrice(completionPrice)} / 1L
                          </div>
                          {model.contextLength && (
                            <div className={`text-xs mt-1 ${isSelected ? 'opacity-75' : 'opacity-60'}`}>
                              Context: {model.contextLength.toLocaleString()} tokens
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedModelInfo(model);
                            setShowModelInfoDialog(true);
                          }}
                          className={`h-8 w-8 shrink-0 ${isSelected ? 'hover:bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowModelDialog(false);
                setModelSearch('');
                setPriceSort('none');
                setTempSelectedModel(null);
              }}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                // Save the selected model when Done is clicked
                if (tempSelectedModel && tempSelectedModel !== settings.defaultModel) {
                  try {
                    // Only send defaultModel - don't include enabled or apiKey
                    // The backend will only update the defaultModel field
                    const payload = {
                      defaultModel: tempSelectedModel
                    };
                    
                    const response = await adminApiService.apiCall('/ai/openrouter/settings', {
                      method: 'PUT',
                      body: JSON.stringify(payload)
                    });

                    if (response.success) {
                      toast.success('Default model updated successfully');
                      setSettings(prev => ({
                        ...prev,
                        defaultModel: response.data.defaultModel || tempSelectedModel
                      }));
                    } else {
                      toast.error(response.message || 'Failed to update default model');
                    }
                  } catch (error) {
                    console.error('Error saving default model:', error);
                    toast.error('Failed to save default model');
                    return; // Don't close dialog on error
                  }
                }
                
                setShowModelDialog(false);
                setModelSearch('');
                setPriceSort('none');
                setTempSelectedModel(null);
              }}
              className="bg-slate-900 hover:bg-slate-800 h-10"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Model Info Dialog */}
      <Dialog open={showModelInfoDialog} onOpenChange={setShowModelInfoDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          {selectedModelInfo && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  {selectedModelInfo.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-600 mt-1">
                  Model ID: {selectedModelInfo.id}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="flex-1 min-h-0 pr-4">
                <div className="space-y-6">
                  {selectedModelInfo.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {selectedModelInfo.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Pricing</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900">Prompt</span>
                          <span className="text-sm font-semibold text-slate-900">
                            {convertPrice(parseFloat(selectedModelInfo.pricing?.prompt || 0))} / 1L tokens
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Per token: {convertPricePerToken(parseFloat(selectedModelInfo.pricing?.prompt || 0))}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900">Completion</span>
                          <span className="text-sm font-semibold text-slate-900">
                            {convertPrice(parseFloat(selectedModelInfo.pricing?.completion || 0))} / 1L tokens
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Per token: {convertPricePerToken(parseFloat(selectedModelInfo.pricing?.completion || 0))}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        A typical request uses 100-1000 tokens, so costs are very low per request.
                      </p>
                    </div>
                  </div>

                  {selectedModelInfo.contextLength && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">Context Length</h3>
                      <p className="text-sm text-slate-600">
                        {selectedModelInfo.contextLength.toLocaleString()} tokens
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <DialogFooter>
                <Button
                  onClick={() => setShowModelInfoDialog(false)}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Persona Dialog */}
      <Dialog open={showPersonaDialog} onOpenChange={setShowPersonaDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              {editingPersona !== null ? 'Edit Persona' : 'Add New Persona'}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Configure the persona's name, token limits, and system prompt
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Persona Name */}
            <div className="space-y-2">
              <Label htmlFor="persona-name" className="text-sm font-semibold text-slate-900">
                Persona Name
              </Label>
              <Input
                id="persona-name"
                value={personaForm.name}
                onChange={(e) => setPersonaForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Customer Support Agent, Sales Assistant"
                className="h-11 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
              />
            </div>

            {/* Token Limit */}
            <div className="space-y-2">
              <Label htmlFor="token-limit" className="text-sm font-semibold text-slate-900">
                Token Limit
              </Label>
              <Input
                id="token-limit"
                type="number"
                value={personaForm.tokenLimit}
                onChange={(e) => setPersonaForm(prev => ({ ...prev, tokenLimit: e.target.value }))}
                placeholder="e.g., 10000 (leave empty for unlimited)"
                className="h-11 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
              />
              <p className="text-xs text-slate-500">
                Maximum number of tokens this persona can use per request. Leave empty for unlimited.
              </p>
            </div>

            {/* Persona Prompt */}
            <div className="space-y-2">
              <Label htmlFor="persona-prompt" className="text-sm font-semibold text-slate-900">
                Persona Prompt
              </Label>
              <Textarea
                id="persona-prompt"
                value={personaForm.personaPrompt}
                onChange={(e) => setPersonaForm(prev => ({ ...prev, personaPrompt: e.target.value }))}
                placeholder="Enter the system prompt that defines this persona's behavior, role, and instructions. This will be attached before the actual user prompt in AI requests..."
                className="min-h-[120px] border-slate-300 focus:border-slate-900 focus:ring-slate-900 resize-none"
              />
              <p className="text-xs text-slate-500">
                This prompt will be used as the system message to define the persona's behavior, role, and instructions for AI interactions.
              </p>
            </div>

          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPersonaDialog(false);
                setEditingPersona(null);
                setPersonaForm({ name: '', tokenLimit: '', personaPrompt: '' });
              }}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!personaForm.name.trim()) {
                  toast.error('Persona name is required');
                  return;
                }

                const newPersona = {
                  name: personaForm.name.trim(),
                  tokenLimit: personaForm.tokenLimit ? parseInt(personaForm.tokenLimit) : null,
                  personaPrompt: personaForm.personaPrompt.trim() || null
                };

                if (editingPersona !== null) {
                  const updatedPersonas = [...personas];
                  updatedPersonas[editingPersona] = newPersona;
                  setPersonas(updatedPersonas);
                  toast.success('Persona updated successfully');
                } else {
                  setPersonas([...personas, newPersona]);
                  toast.success('Persona created successfully');
                }

                setShowPersonaDialog(false);
                setEditingPersona(null);
                setPersonaForm({ name: '', tokenLimit: '', personaPrompt: '' });
              }}
              className="h-10 bg-slate-900 hover:bg-slate-800"
            >
              {editingPersona !== null ? 'Update Persona' : 'Create Persona'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Make AI Request
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Send a prompt to the AI and get a response. This request will be logged.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="request-prompt" className="text-sm font-semibold text-slate-900">
                Prompt
              </Label>
              <Textarea
                id="request-prompt"
                value={requestPrompt}
                onChange={(e) => setRequestPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                className="min-h-[150px] border-slate-300 focus:border-slate-900 focus:ring-slate-900 resize-none"
              />
            </div>

            {/* Show model name while loading */}
            {requestLoading && requestModel && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                <span className="text-sm text-slate-600">
                  Processing with model: <span className="font-semibold text-slate-900">{requestModel}</span>
                </span>
              </div>
            )}

            {requestResponse && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-900">Response</Label>
                  {requestModel && (
                    <span className="text-xs text-slate-500">
                      Model: <span className="font-medium text-slate-700">{requestModel}</span>
                    </span>
                  )}
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-[300px] overflow-y-auto">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{requestResponse}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRequestDialog(false);
                setRequestPrompt('');
                setRequestResponse('');
                setRequestModel('');
              }}
              className="h-10"
            >
              Close
            </Button>
            <Button
              onClick={async () => {
                if (!requestPrompt.trim()) {
                  toast.error('Please enter a prompt');
                  return;
                }

                setRequestLoading(true);
                setRequestResponse('');
                // Set the model name being used
                const modelToUse = settings.defaultModel || 'Default Model';
                setRequestModel(modelToUse);

                try {
                  const response = await adminApiService.apiCall('/ai/request', {
                    method: 'POST',
                    body: JSON.stringify({
                      prompt: requestPrompt.trim(),
                      model: settings.defaultModel
                    })
                  });

                  if (response.success) {
                    setRequestResponse(response.data.response || '');
                    // Update model name from response if available
                    if (response.data.model) {
                      setRequestModel(response.data.model);
                    }
                    toast.success('Request completed successfully');
                    // Refresh logs to show the new request
                    setTimeout(() => loadLogs(), 500);
                    // Refresh balance
                    setTimeout(() => loadBalance(), 500);
                  } else {
                    toast.error(response.message || 'Failed to get response');
                    setRequestModel(''); // Clear model on error
                  }
                } catch (error) {
                  console.error('Error making AI request:', error);
                  toast.error('Failed to make AI request');
                  setRequestModel(''); // Clear model on error
                } finally {
                  setRequestLoading(false);
                }
              }}
              disabled={isRequestButtonDisabled}
              className="h-10 bg-slate-900 hover:bg-slate-800"
            >
              {requestLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Details Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="w-[70vw] max-h-[90vh] flex flex-col overflow-hidden">
          {selectedLog && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-slate-900">AI Request Details</DialogTitle>
                <DialogDescription className="text-sm text-slate-600">
                  Complete information about this AI request
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="flex-1 pr-4 max-h-[calc(90vh-180px)] overflow-y-auto">
                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={
                        selectedLog.status === 'success'
                          ? 'border-green-300 text-green-700 bg-green-50'
                          : selectedLog.status === 'error'
                          ? 'border-red-300 text-red-700 bg-red-50'
                          : selectedLog.status === 'timeout'
                          ? 'border-yellow-300 text-yellow-700 bg-yellow-50'
                          : 'border-orange-300 text-orange-700 bg-orange-50'
                      }
                    >
                      {selectedLog.status.charAt(0).toUpperCase() + selectedLog.status.slice(1).replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(selectedLog.requestedAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Request Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-slate-600 mb-1">User</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedLog.userId?.email || selectedLog.userEmail || 'System'}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-slate-600 mb-1">Provider</p>
                      <p className="text-sm font-semibold text-slate-900 capitalize">{selectedLog.provider}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-slate-600 mb-1">Model</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedLog.model}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-medium text-slate-600 mb-1">Duration</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedLog.duration ? `${selectedLog.duration}ms` : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Token Usage */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Token Usage</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-medium text-blue-600 mb-1">Prompt Tokens</p>
                        <p className="text-lg font-bold text-blue-900">{selectedLog.promptTokens?.toLocaleString() || 0}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs font-medium text-purple-600 mb-1">Completion Tokens</p>
                        <p className="text-lg font-bold text-purple-900">{selectedLog.completionTokens?.toLocaleString() || 0}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs font-medium text-green-600 mb-1">Total Tokens</p>
                        <p className="text-lg font-bold text-green-900">{selectedLog.totalTokens?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cost Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Cost Information</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs font-medium text-slate-600 mb-1">Prompt Cost</p>
                        <p className="text-sm font-semibold text-slate-900">
                          ${selectedLog.promptPrice?.toFixed(6) || '0.000000'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs font-medium text-slate-600 mb-1">Completion Cost</p>
                        <p className="text-sm font-semibold text-slate-900">
                          ${selectedLog.completionPrice?.toFixed(6) || '0.000000'}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs font-medium text-purple-600 mb-1">Total Cost</p>
                        <p className="text-lg font-bold text-purple-900">
                          ${selectedLog.totalCost?.toFixed(6) || '0.000000'}
                          {selectedLog.totalCost && selectedCurrency !== 'USD' && currencyRates[selectedCurrency] && (
                            <span className="text-sm font-normal text-purple-600 ml-1">
                              (Approx. {(() => {
                                const cost = selectedLog.totalCost || 0;
                                const rate = currencyRates[selectedCurrency] || 1;
                                const convertedCost = cost * rate;
                                return `${selectedCurrency === 'USD' ? '$' : ''}${convertedCost.toFixed(6)}${selectedCurrency !== 'USD' ? ` ${selectedCurrency}` : ''}`;
                              })()})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Prompt */}
                  {selectedLog.prompt && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">Prompt</h3>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                          {selectedLog.prompt}
                        </p>
                        {selectedLog.promptLength && (
                          <p className="text-xs text-slate-500 mt-2">
                            Length: {selectedLog.promptLength} characters
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Response */}
                  {selectedLog.response && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">Response</h3>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                          {selectedLog.response}
                        </p>
                        {selectedLog.responseLength && (
                          <p className="text-xs text-slate-500 mt-2">
                            Length: {selectedLog.responseLength} characters
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {selectedLog.errorMessage && (
                    <div>
                      <h3 className="text-sm font-semibold text-red-900 mb-2">Error Message</h3>
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-700 whitespace-pre-wrap break-words">
                          {selectedLog.errorMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">Metadata</h3>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <pre className="text-xs text-slate-600 overflow-x-auto">
                          {JSON.stringify(selectedLog.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Request ID */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs font-medium text-slate-600 mb-1">Request ID</p>
                    <p className="text-xs font-mono text-slate-700 break-all">{selectedLog.requestId}</p>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter>
                <Button
                  onClick={() => {
                    setShowLogDialog(false);
                    setSelectedLog(null);
                  }}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AISettingsPanel;
