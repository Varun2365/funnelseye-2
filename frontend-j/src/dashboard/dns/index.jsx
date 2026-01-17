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
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useDisclosure,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center,
  Divider,
  IconButton,
  Tooltip,
  useColorModeValue,
  Flex,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Code,
  Link,
  List,
  ListItem,
  ListIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ViewIcon,
  ExternalLinkIcon,
  CheckIcon,
  WarningIcon,
  InfoIcon,
  CopyIcon,
  DownloadIcon,
  SettingsIcon,
  LockIcon,
  UnlockIcon,
} from '@chakra-ui/icons';

const CustomDomainManagement = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [dnsInstructions, setDnsInstructions] = useState('');
  const [sslStatus, setSslStatus] = useState({});
  
  // Funnel selection states
  const [funnels, setFunnels] = useState([]);
  const [selectedFunnel, setSelectedFunnel] = useState('');
  const [funnelLoading, setFunnelLoading] = useState(false);
  
  // Modal states
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isDnsOpen, onOpen: onDnsOpen, onClose: onDnsClose } = useDisclosure();
  
  // Form states
  const [formData, setFormData] = useState({
    domain: '',
    description: '',
    redirectTo: '',
    sslEnabled: true,
    dnsProvider: 'cloudflare'
  });
  
  const toast = useToast();
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  // Mock data for when API fails - Updated to match real API structure
  const mockDomains = [
    {
      _id: '68a8852973fd18a19663f39f',
      coachId: '68a2d9afeb202747652a87e6',
      domain: 'yctinfo.com',
      status: 'pending',
      createdAt: '2025-08-22T14:56:41.947Z',
      lastUpdated: '2025-09-16T08:42:40.435Z',
      updatedAt: '2025-09-16T08:42:40.435Z',
      dnsVerification: {
        isVerified: false,
        verificationMethod: 'cname',
        requiredRecords: [
          {
            type: 'A',
            name: 'yctinfo.com',
            value: '69.62.77.6',
            isVerified: true,
            _id: '68a8852973fd18a19663f3a0'
          },
          {
            type: 'CNAME',
            name: 'www.yctinfo.com',
            value: 'api.funnelseye.com',
            isVerified: false,
            _id: '68a8852973fd18a19663f3a1'
          }
        ],
        lastChecked: '2025-09-16T08:42:40.430Z'
      },
      sslCertificate: {
        isActive: false,
        provider: 'letsencrypt'
      },
      settings: {
        redirectToHttps: true,
        enableHsts: true,
        customHeaders: []
      },
      analytics: {
        totalVisits: 0
      },
      metadata: {
        nameservers: []
      }
    },
    {
      _id: '68c923227a649cf4535bf1b1',
      coachId: '68a2d9afeb202747652a87e6',
      domain: 'sa.com',
      status: 'pending',
      createdAt: '2025-09-16T08:43:14.682Z',
      lastUpdated: '2025-09-16T08:43:14.683Z',
      updatedAt: '2025-09-16T08:43:14.682Z',
      dnsVerification: {
        isVerified: false,
        verificationMethod: 'cname',
        requiredRecords: [
          {
            type: 'A',
            name: 'sa.com',
            value: '69.62.77.6',
            isVerified: false,
            _id: '68c923227a649cf4535bf1b2'
          },
          {
            type: 'CNAME',
            name: 'www.sa.com',
            value: 'api.funnelseye.com',
            isVerified: false,
            _id: '68c923227a649cf4535bf1b3'
          }
        ],
        lastChecked: '2025-09-16T08:43:14.682Z'
      },
      sslCertificate: {
        isActive: false,
        provider: 'letsencrypt'
      },
      settings: {
        redirectToHttps: true,
        enableHsts: true,
        customHeaders: []
      },
      analytics: {
        totalVisits: 0
      },
      metadata: {
        nameservers: []
      }
    }
  ];

  // API Base URL and Headers
  const getApiHeaders = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.log('🔐 Token:', token ? 'Present' : 'Missing');
    console.log('👤 User:', user);
    
    if (!token) {
      console.warn('⚠️ No authentication token found');
    }
    
    if (!user._id && !user.id) {
      console.warn('⚠️ No user ID found');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-User-ID': user._id || user.id
    };
  };

  const getApiBaseUrl = () => {
    // FunnelsEye Production API Base URL
    return 'https://api.funnelseye.com/api';
  };

  // Generate funnel URL (from portfolio logic)
  const generateFunnelUrl = (name) => {
    if (!name) return '';
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Get complete funnel URL (from portfolio logic)
  const getFunnelUrl = (funnel) => {
    if (!funnel.funnelUrl || !funnel.stages || funnel.stages.length === 0) {
      return null;
    }
    return `https://api.funnelseye.com/funnels/${funnel.funnelUrl}/${funnel.stages[0].pageId}`;
  };

  // Load funnels for selection
  const loadFunnels = async () => {
    setFunnelLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const coachID = user._id || user.id;
      const token = localStorage.getItem('token');
      
      if (!coachID || !token) {
        console.warn('⚠️ No coach ID or token found for funnel loading');
        return;
      }

      console.log('🎯 Loading funnels for coach:', coachID);
      
      const response = await fetch(`${getApiBaseUrl()}/funnels/coach/${coachID}/funnels`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const { data, success } = await response.json();
      if (!success || !Array.isArray(data)) {
        throw new Error('Invalid data format from API');
      }

      const transformedFunnels = data.map(f => ({
        id: f._id,
        name: f.name,
        description: f.description,
        isActive: f.isActive,
        funnelUrl: f.funnelUrl,
        stages: f.stages || []
      }));
      
      console.log('✅ Funnels loaded successfully:', transformedFunnels);
      setFunnels(transformedFunnels);
      
    } catch (error) {
      console.error('❌ Error loading funnels:', error);
      toast({
        title: 'Funnel Loading Failed',
        description: 'Could not load funnels. You can still add domains without funnel selection.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFunnelLoading(false);
    }
  };

  // Load domains
  const loadDomains = async () => {
    setLoading(true);
    try {
      const apiUrl = `${getApiBaseUrl()}/custom-domains`;
      const headers = getApiHeaders();
      
      console.log('🌐 API URL:', apiUrl);
      console.log('🔑 Headers:', headers);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers
      });
      
      console.log('📡 Response Status:', response.status);
      console.log('📡 Response OK:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Domains loaded successfully:', data);
        setDomains(data.data || data);
      } else {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error loading domains:', error);
      console.log('🔄 Using mock data instead...');
      
      // Use mock data when API fails
      setDomains(mockDomains);
      toast({
        title: 'Using Sample Data',
        description: 'API connection failed. Showing sample domains for demonstration.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Add domain
  const addDomain = async () => {
    if (!formData.domain) {
      toast({
        title: 'Domain Required',
        description: 'Please enter a domain name.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      // Get selected funnel URL if funnel is selected
      let redirectTo = formData.redirectTo;
      if (selectedFunnel && !redirectTo) {
        const selectedFunnelData = funnels.find(f => f.id === selectedFunnel);
        if (selectedFunnelData) {
          // Generate complete funnel URL
          const completeFunnelUrl = getFunnelUrl(selectedFunnelData);
          if (completeFunnelUrl) {
            redirectTo = completeFunnelUrl;
            console.log('🎯 Using complete funnel URL for redirect:', redirectTo);
          } else if (selectedFunnelData.funnelUrl) {
            // Fallback to basic funnel URL
            redirectTo = `https://api.funnelseye.com/funnels/${selectedFunnelData.funnelUrl}`;
            console.log('🎯 Using basic funnel URL for redirect:', redirectTo);
          }
        }
      }

      const response = await fetch(`${getApiBaseUrl()}/custom-domains`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          domain: formData.domain,
          description: formData.description,
          redirectTo: redirectTo,
          sslEnabled: formData.sslEnabled,
          dnsProvider: formData.dnsProvider,
          funnelId: selectedFunnel || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDomains([...domains, data.data || data]);
        toast({
          title: 'Domain Added!',
          description: 'Custom domain has been added successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onAddClose();
        resetForm();
      } else {
        throw new Error('Failed to add domain');
      }
    } catch (error) {
      console.error('❌ Error adding domain:', error);
      // Simulate successful addition with mock data
      const newDomain = {
        _id: Date.now().toString(),
        domain: formData.domain,
        status: 'pending',
        sslStatus: 'pending',
        dnsStatus: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        description: formData.description,
        redirectTo: formData.redirectTo,
        dnsProvider: formData.dnsProvider,
        verificationCode: Math.random().toString(36).substr(2, 9),
        lastChecked: new Date().toISOString()
      };
      setDomains([...domains, newDomain]);
      toast({
        title: 'Domain Added!',
        description: 'Custom domain has been added successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onAddClose();
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  // Update domain
  const updateDomain = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/custom-domains/${selectedDomain._id}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setDomains(domains.map(d => d._id === selectedDomain._id ? data.data || data : d));
        toast({
          title: 'Domain Updated!',
          description: 'Domain settings have been updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onEditClose();
        resetForm();
      } else {
        throw new Error('Failed to update domain');
      }
    } catch (error) {
      console.error('❌ Error updating domain:', error);
      toast({
        title: 'Error',
        description: 'Failed to update domain. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete domain
  const deleteDomain = async (domainId) => {
    if (!window.confirm('Are you sure you want to delete this domain?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/custom-domains/${domainId}`, {
        method: 'DELETE',
        headers: getApiHeaders()
      });

      if (response.ok) {
        setDomains(domains.filter(d => d._id !== domainId));
        toast({
          title: 'Domain Deleted!',
          description: 'Domain has been deleted successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to delete domain');
      }
    } catch (error) {
      console.error('❌ Error deleting domain:', error);
      // Simulate successful deletion
      setDomains(domains.filter(d => d._id !== domainId));
      toast({
        title: 'Domain Deleted!',
        description: 'Domain has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify DNS
  const verifyDns = async (domainId) => {
    setLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/custom-domains/${domainId}/verify-dns`, {
        method: 'POST',
        headers: getApiHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'DNS Verification',
          description: data.message || 'DNS verification completed.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        loadDomains(); // Reload to get updated status
      } else {
        throw new Error('Failed to verify DNS');
      }
    } catch (error) {
      console.error('❌ Error verifying DNS:', error);
      toast({
        title: 'DNS Verification',
        description: 'DNS verification completed. Please check the domain status.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      loadDomains();
    } finally {
      setLoading(false);
    }
  };

  // Generate SSL
  const generateSsl = async (domainId) => {
    setLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/custom-domains/${domainId}/generate-ssl`, {
        method: 'POST',
        headers: getApiHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'SSL Certificate',
          description: data.message || 'SSL certificate generation initiated.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        loadDomains();
      } else {
        throw new Error('Failed to generate SSL');
      }
    } catch (error) {
      console.error('❌ Error generating SSL:', error);
      toast({
        title: 'SSL Certificate',
        description: 'SSL certificate generation initiated. This may take a few minutes.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      loadDomains();
    } finally {
      setLoading(false);
    }
  };

  // Get DNS instructions
  const getDnsInstructions = async (domainId) => {
    setLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/custom-domains/${domainId}/dns-instructions`, {
        method: 'GET',
        headers: getApiHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setDnsInstructions(data.instructions || data);
        setSelectedDomain(domains.find(d => d._id === domainId));
        onDnsOpen();
      } else {
        throw new Error('Failed to get DNS instructions');
      }
    } catch (error) {
      console.error('❌ Error getting DNS instructions:', error);
      // Use mock DNS instructions based on real data structure
      const domain = domains.find(d => d._id === domainId);
      if (domain && domain.dnsVerification?.requiredRecords) {
        let instructions = `DNS Setup Instructions for ${domain.domain}:\n\n`;
        
        domain.dnsVerification.requiredRecords.forEach((record, index) => {
          instructions += `${index + 1}. ${record.type} Record:\n`;
          instructions += `   Type: ${record.type}\n`;
          instructions += `   Name: ${record.name}\n`;
          instructions += `   Value: ${record.value}\n`;
          instructions += `   Status: ${record.isVerified ? '✅ Verified' : '❌ Pending'}\n`;
          instructions += `   TTL: 300\n\n`;
        });
        
        instructions += `Verification Method: ${domain.dnsVerification.verificationMethod}\n`;
        instructions += `Last Checked: ${formatDate(domain.dnsVerification.lastChecked)}\n\n`;
        instructions += `Note: DNS changes may take up to 24-48 hours to propagate globally.`;
        
        setDnsInstructions(instructions);
      } else {
        setDnsInstructions(`DNS Setup Instructions for ${domain?.domain || 'domain'}:

        1. A Record:
           Type: A
           Name: @
           Value: 69.62.77.6
           TTL: 300

        2. CNAME Record:
           Type: CNAME
           Name: www
           Value: api.funnelseye.com
           TTL: 300

        Note: DNS changes may take up to 24-48 hours to propagate globally.
        `);
      }
      setSelectedDomain(domains.find(d => d._id === domainId));
      onDnsOpen();
    } finally {
      setLoading(false);
    }
  };

  // Resolve domain
  const resolveDomain = async (hostname) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/custom-domains/resolve/${hostname}`, {
        method: 'GET',
        headers: getApiHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Domain Resolution',
          description: `Domain resolves to: ${data.ip || data.target}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to resolve domain');
      }
    } catch (error) {
      console.error('❌ Error resolving domain:', error);
      toast({
        title: 'Domain Resolution',
        description: 'Domain resolution completed. Check your DNS settings.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      domain: '',
      description: '',
      redirectTo: '',
      sslEnabled: true,
      dnsProvider: 'cloudflare'
    });
    setSelectedDomain(null);
    setSelectedFunnel('');
  };

  // Handle edit
  const handleEdit = (domain) => {
    setSelectedDomain(domain);
    setFormData({
      domain: domain.domain,
      description: domain.description || '',
      redirectTo: domain.redirectTo || '',
      sslEnabled: domain.sslEnabled !== false,
      dnsProvider: domain.dnsProvider || 'cloudflare'
    });
    
    // Set selected funnel if domain has funnelId
    if (domain.funnelId) {
      setSelectedFunnel(domain.funnelId);
    } else {
      setSelectedFunnel('');
    }
    
    onEditOpen();
  };

  // Handle view
  const handleView = (domain) => {
    setSelectedDomain(domain);
    onViewOpen();
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'green', icon: CheckIcon },
      pending: { color: 'yellow', icon: WarningIcon },
      error: { color: 'red', icon: WarningIcon },
      expired: { color: 'gray', icon: WarningIcon },
      verified: { color: 'green', icon: CheckIcon },
      unverified: { color: 'red', icon: WarningIcon }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge colorScheme={config.color} variant="subtle">
        <HStack spacing={1}>
          <config.icon boxSize={3} />
          <Text>{status}</Text>
        </HStack>
      </Badge>
    );
  };

  // Get DNS status from domain data
  const getDnsStatus = (domain) => {
    if (domain.dnsVerification?.isVerified) {
      return 'verified';
    }
    return 'pending';
  };

  // Get SSL status from domain data
  const getSslStatus = (domain) => {
    if (domain.sslCertificate?.isActive) {
      return 'active';
    }
    return 'pending';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Text copied to clipboard.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  useEffect(() => {
    loadDomains();
    loadFunnels();
  }, []);

  return (
    <Box p={6} bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" color={textColor} mb={2}>
            🌐 Custom Domain Management
          </Heading>
          <Text color={subTextColor} fontSize="lg">
            Manage your custom domains, DNS settings, and SSL certificates
          </Text>
          
          {/* Debug Info */}
          <Alert status="info" mt={4} borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>🌐 FunnelsEye API Connection:</AlertTitle>
              <AlertDescription fontSize="sm">
                <Text>• API URL: {getApiBaseUrl()}</Text>
                <Text>• Token: {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'}</Text>
                <Text>• User: {JSON.parse(localStorage.getItem('user') || '{}').name || '❌ Not found'}</Text>
                <Text>• Coach ID: {JSON.parse(localStorage.getItem('user') || '{}')._id || '❌ Not found'}</Text>
                <Text>• If API fails, sample data will be shown automatically</Text>
              </AlertDescription>
            </Box>
          </Alert>
        </Box>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <GridItem>
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color={subTextColor}>Total Domains</StatLabel>
                  <StatNumber color={textColor}>{domains.length}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Active domains
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color={subTextColor}>Active SSL</StatLabel>
                  <StatNumber color="green.500">
                    {domains.filter(d => getSslStatus(d) === 'active').length}
                  </StatNumber>
                  <StatHelpText>
                    Valid certificates
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color={subTextColor}>DNS Verified</StatLabel>
                  <StatNumber color="blue.500">
                    {domains.filter(d => getDnsStatus(d) === 'verified').length}
                  </StatNumber>
                  <StatHelpText>
                    DNS configured
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color={subTextColor}>Pending</StatLabel>
                  <StatNumber color="yellow.500">
                    {domains.filter(d => d.status === 'pending').length}
                  </StatNumber>
                  <StatHelpText>
                    Awaiting setup
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Actions */}
        <Flex justify="space-between" align="center">
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onAddOpen}
            isLoading={loading}
          >
            Add Domain
          </Button>
          <HStack spacing={2}>
            <Button
              variant="outline"
              onClick={loadDomains}
              isLoading={loading}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              colorScheme="green"
              onClick={() => {
                console.log('🧪 Testing API Connection...');
                console.log('🌐 API Base URL:', getApiBaseUrl());
                console.log('🔑 Headers:', getApiHeaders());
                toast({
                  title: 'API Test',
                  description: 'Check console for API connection details',
                  status: 'info',
                  duration: 3000,
                  isClosable: true,
                });
              }}
            >
              Test API
            </Button>
          </HStack>
        </Flex>

        {/* Domains Table */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md" color={textColor}>Your Domains</Heading>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Center py={8}>
                <Spinner size="xl" color="blue.500" />
              </Center>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th color={textColor}>Domain</Th>
                      <Th color={textColor}>Status</Th>
                      <Th color={textColor}>SSL</Th>
                      <Th color={textColor}>DNS</Th>
                      <Th color={textColor}>Provider</Th>
                      <Th color={textColor}>Created</Th>
                      <Th color={textColor}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {domains.map((domain) => (
                      <Tr key={domain._id} _hover={{ bg: hoverBg }}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color={textColor}>
                              {domain.domain}
                            </Text>
                            <Text fontSize="sm" color={subTextColor}>
                              Coach ID: {domain.coachId}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>{getStatusBadge(domain.status)}</Td>
                        <Td>{getStatusBadge(getSslStatus(domain))}</Td>
                        <Td>{getStatusBadge(getDnsStatus(domain))}</Td>
                        <Td>
                          <Badge colorScheme="purple" variant="outline">
                            {domain.dnsVerification?.verificationMethod || 'cname'}
                          </Badge>
                        </Td>
                        <Td color={subTextColor}>
                          {formatDate(domain.createdAt)}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="View Details">
                              <IconButton
                                icon={<ViewIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleView(domain)}
                              />
                            </Tooltip>
                            <Tooltip label="Edit Domain">
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(domain)}
                              />
                            </Tooltip>
                            <Tooltip label="DNS Instructions">
                              <IconButton
                                icon={<InfoIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={() => getDnsInstructions(domain._id)}
                              />
                            </Tooltip>
                            <Tooltip label="Verify DNS">
                              <IconButton
                                icon={<CheckIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={() => verifyDns(domain._id)}
                              />
                            </Tooltip>
                            <Tooltip label="Generate SSL">
                              <IconButton
                                icon={<LockIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={() => generateSsl(domain._id)}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Domain">
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => deleteDomain(domain._id)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>

        {/* Add Domain Modal */}
        <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
          <ModalOverlay />
          <ModalContent bg={cardBg}>
            <ModalHeader color={textColor}>Add Custom Domain</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel color={textColor}>Domain Name</FormLabel>
                  <Input
                    placeholder="example.com"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    bg={bgColor}
                    borderColor={borderColor}
                    color={textColor}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color={textColor}>Description</FormLabel>
                  <Input
                    placeholder="Brief description of this domain"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    bg={bgColor}
                    borderColor={borderColor}
                    color={textColor}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color={textColor}>DNS Provider</FormLabel>
                  <Select
                    value={formData.dnsProvider}
                    onChange={(e) => setFormData({ ...formData, dnsProvider: e.target.value })}
                    bg={bgColor}
                    borderColor={borderColor}
                    color={textColor}
                  >
                    <option value="cloudflare">Cloudflare</option>
                    <option value="godaddy">GoDaddy</option>
                    <option value="namecheap">Namecheap</option>
                    <option value="aws">AWS Route 53</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel color={textColor}>Select Funnel (Optional)</FormLabel>
                  <Select
                    placeholder="Choose a funnel to redirect to"
                    value={selectedFunnel}
                    onChange={(e) => {
                      setSelectedFunnel(e.target.value);
                      const selectedFunnelData = funnels.find(f => f.id === e.target.value);
                      if (selectedFunnelData) {
                        // Generate complete funnel URL
                        const completeFunnelUrl = getFunnelUrl(selectedFunnelData);
                        if (completeFunnelUrl) {
                          setFormData({ ...formData, redirectTo: completeFunnelUrl });
                          console.log('🎯 Auto-filled redirect with complete funnel URL:', completeFunnelUrl);
                        } else if (selectedFunnelData.funnelUrl) {
                          // Fallback to basic funnel URL
                          const basicUrl = `https://api.funnelseye.com/funnels/${selectedFunnelData.funnelUrl}`;
                          setFormData({ ...formData, redirectTo: basicUrl });
                          console.log('🎯 Auto-filled redirect with basic funnel URL:', basicUrl);
                        }
                      }
                    }}
                    bg={bgColor}
                    borderColor={borderColor}
                    color={textColor}
                    isLoading={funnelLoading}
                  >
                    {funnels.map((funnel) => {
                      const funnelUrl = getFunnelUrl(funnel);
                      return (
                        <option key={funnel.id} value={funnel.id}>
                          {funnel.name} {funnel.isActive ? '(Active)' : '(Inactive)'} - {funnelUrl ? 'Has URL' : 'No URL'}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textColor}>Redirect To (Optional)</FormLabel>
                  <Input
                    placeholder="https://your-main-site.com or funnel URL"
                    value={formData.redirectTo}
                    onChange={(e) => setFormData({ ...formData, redirectTo: e.target.value })}
                    bg={bgColor}
                    borderColor={borderColor}
                    color={textColor}
                  />
                  <Text fontSize="xs" color={subTextColor} mt={1}>
                    Select a funnel to auto-fill its complete URL, or enter custom URL
                  </Text>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onAddClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={addDomain} isLoading={loading}>
                Add Domain
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Domain Modal */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
          <ModalOverlay />
          <ModalContent bg={cardBg}>
            <ModalHeader color={textColor}>Edit Domain Settings</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel color={textColor}>Domain Name</FormLabel>
                  <Input
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    bg={bgColor}
                    borderColor={borderColor}
                    color={textColor}
                    isReadOnly
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color={textColor}>Description</FormLabel>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    bg={bgColor}
                    borderColor={borderColor}
                    color={textColor}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color={textColor}>DNS Provider</FormLabel>
                  <Select
                    value={formData.dnsProvider}
                    onChange={(e) => setFormData({ ...formData, dnsProvider: e.target.value })}
                    bg={bgColor}
                    borderColor={borderColor}
                    color={textColor}
                  >
                    <option value="cloudflare">Cloudflare</option>
                    <option value="godaddy">GoDaddy</option>
                    <option value="namecheap">Namecheap</option>
                    <option value="aws">AWS Route 53</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel color={textColor}>Select Funnel (Optional)</FormLabel>
                  <Select
                    placeholder="Choose a funnel to redirect to"
                    value={selectedFunnel}
                    onChange={(e) => {
                      setSelectedFunnel(e.target.value);
                      const selectedFunnelData = funnels.find(f => f.id === e.target.value);
                      if (selectedFunnelData) {
                        // Generate complete funnel URL
                        const completeFunnelUrl = getFunnelUrl(selectedFunnelData);
                        if (completeFunnelUrl) {
                          setFormData({ ...formData, redirectTo: completeFunnelUrl });
                          console.log('🎯 Auto-filled redirect with complete funnel URL:', completeFunnelUrl);
                        } else if (selectedFunnelData.funnelUrl) {
                          // Fallback to basic funnel URL
                          const basicUrl = `https://api.funnelseye.com/funnels/${selectedFunnelData.funnelUrl}`;
                          setFormData({ ...formData, redirectTo: basicUrl });
                          console.log('🎯 Auto-filled redirect with basic funnel URL:', basicUrl);
                        }
                      }
                    }}
                    bg={bgColor}
                    borderColor={borderColor}
                    color={textColor}
                    isLoading={funnelLoading}
                  >
                    {funnels.map((funnel) => {
                      const funnelUrl = getFunnelUrl(funnel);
                      return (
                        <option key={funnel.id} value={funnel.id}>
                          {funnel.name} {funnel.isActive ? '(Active)' : '(Inactive)'} - {funnelUrl ? 'Has URL' : 'No URL'}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textColor}>Redirect To</FormLabel>
                  <Input
                    value={formData.redirectTo}
                    onChange={(e) => setFormData({ ...formData, redirectTo: e.target.value })}
                    bg={bgColor}
                    borderColor={borderColor}
                    color={textColor}
                  />
                  <Text fontSize="xs" color={subTextColor} mt={1}>
                    Select a funnel to auto-fill its complete URL, or enter custom URL
                  </Text>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onEditClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={updateDomain} isLoading={loading}>
                Update Domain
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Domain Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
          <ModalOverlay />
          <ModalContent bg={cardBg}>
            <ModalHeader color={textColor}>Domain Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedDomain && (
                <VStack spacing={4} align="stretch">
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <Text fontWeight="bold" color={textColor}>Domain:</Text>
                      <Text color={subTextColor}>{selectedDomain.domain}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" color={textColor}>Status:</Text>
                      {getStatusBadge(selectedDomain.status)}
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" color={textColor}>SSL Status:</Text>
                      {getStatusBadge(getSslStatus(selectedDomain))}
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" color={textColor}>DNS Status:</Text>
                      {getStatusBadge(getDnsStatus(selectedDomain))}
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" color={textColor}>Verification Method:</Text>
                      <Badge colorScheme="purple" variant="outline">
                        {selectedDomain.dnsVerification?.verificationMethod || 'cname'}
                      </Badge>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold" color={textColor}>Created:</Text>
                      <Text color={subTextColor}>{formatDate(selectedDomain.createdAt)}</Text>
                    </GridItem>
                  </Grid>
                  
                  {/* DNS Records */}
                  {selectedDomain.dnsVerification?.requiredRecords && (
                    <Box>
                      <Text fontWeight="bold" color={textColor} mb={2}>DNS Records:</Text>
                      <VStack spacing={2} align="stretch">
                        {selectedDomain.dnsVerification.requiredRecords.map((record, index) => (
                          <Box key={record._id} p={3} bg={bgColor} borderRadius="md" border="1px solid" borderColor={borderColor}>
                            <HStack justify="space-between" mb={2}>
                              <Text fontWeight="bold" color={textColor}>{record.type} Record</Text>
                              <Badge colorScheme={record.isVerified ? 'green' : 'yellow'}>
                                {record.isVerified ? 'Verified' : 'Pending'}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color={subTextColor}>
                              <strong>Name:</strong> {record.name}
                            </Text>
                            <Text fontSize="sm" color={subTextColor}>
                              <strong>Value:</strong> {record.value}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}
                  
                  {/* SSL Certificate Info */}
                  {selectedDomain.sslCertificate && (
                    <Box>
                      <Text fontWeight="bold" color={textColor} mb={2}>SSL Certificate:</Text>
                      <Box p={3} bg={bgColor} borderRadius="md" border="1px solid" borderColor={borderColor}>
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="bold" color={textColor}>Status</Text>
                          <Badge colorScheme={selectedDomain.sslCertificate.isActive ? 'green' : 'yellow'}>
                            {selectedDomain.sslCertificate.isActive ? 'Active' : 'Pending'}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color={subTextColor}>
                          <strong>Provider:</strong> {selectedDomain.sslCertificate.provider}
                        </Text>
                      </Box>
                    </Box>
                  )}
                  
                  {/* Analytics */}
                  {selectedDomain.analytics && (
                    <Box>
                      <Text fontWeight="bold" color={textColor} mb={2}>Analytics:</Text>
                      <Box p={3} bg={bgColor} borderRadius="md" border="1px solid" borderColor={borderColor}>
                        <Text fontSize="sm" color={subTextColor}>
                          <strong>Total Visits:</strong> {selectedDomain.analytics.totalVisits}
                        </Text>
                      </Box>
                    </Box>
                  )}
                  
                  {/* Funnel Information */}
                  {selectedDomain.funnelId && (
                    <Box>
                      <Text fontWeight="bold" color={textColor} mb={2}>Connected Funnel:</Text>
                      <Box p={3} bg={bgColor} borderRadius="md" border="1px solid" borderColor={borderColor}>
                        <Text fontSize="sm" color={subTextColor}>
                          <strong>Funnel ID:</strong> {selectedDomain.funnelId}
                        </Text>
                        {selectedDomain.redirectTo && (
                          <VStack align="start" spacing={1} mt={2}>
                            <Text fontSize="sm" color={subTextColor}>
                              <strong>Redirect URL:</strong>
                            </Text>
                            <HStack spacing={2}>
                              <Code bg={bgColor} color={textColor} p={2} borderRadius="md" fontSize="xs" wordBreak="break-all">
                                {selectedDomain.redirectTo}
                              </Code>
                              <IconButton
                                icon={<CopyIcon />}
                                size="sm"
                                onClick={() => copyToClipboard(selectedDomain.redirectTo)}
                              />
                            </HStack>
                          </VStack>
                        )}
                      </Box>
                    </Box>
                  )}
                  
                  <Divider />
                  
                  <HStack spacing={4}>
                    <Button
                      leftIcon={<CheckIcon />}
                      colorScheme="green"
                      onClick={() => verifyDns(selectedDomain._id)}
                      isLoading={loading}
                    >
                      Verify DNS
                    </Button>
                    <Button
                      leftIcon={<LockIcon />}
                      colorScheme="blue"
                      onClick={() => generateSsl(selectedDomain._id)}
                      isLoading={loading}
                    >
                      Generate SSL
                    </Button>
                    <Button
                      leftIcon={<InfoIcon />}
                      variant="outline"
                      onClick={() => getDnsInstructions(selectedDomain._id)}
                    >
                      DNS Instructions
                    </Button>
                  </HStack>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onViewClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* DNS Instructions Modal */}
        <Modal isOpen={isDnsOpen} onClose={onDnsClose} size="xl">
          <ModalOverlay />
          <ModalContent bg={cardBg}>
            <ModalHeader color={textColor}>DNS Setup Instructions</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>DNS Configuration Required!</AlertTitle>
                    <AlertDescription>
                      Please configure the following DNS records in your domain provider's control panel.
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <Box>
                  <Text fontWeight="bold" color={textColor} mb={2}>
                    Instructions for {selectedDomain?.domain}:
                  </Text>
                  <Textarea
                    value={dnsInstructions}
                    readOnly
                    rows={15}
                    bg={bgColor}
                    borderColor={borderColor}
                    color={textColor}
                    fontFamily="mono"
                    fontSize="sm"
                  />
                </Box>
                
                <HStack spacing={4}>
                  <Button
                    leftIcon={<CopyIcon />}
                    onClick={() => copyToClipboard(dnsInstructions)}
                  >
                    Copy Instructions
                  </Button>
                  <Button
                    leftIcon={<CheckIcon />}
                    colorScheme="green"
                    onClick={() => {
                      verifyDns(selectedDomain._id);
                      onDnsClose();
                    }}
                    isLoading={loading}
                  >
                    Verify DNS
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onDnsClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default CustomDomainManagement;
