import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/apiConfig';
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
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  Flex,
  Spinner,
  useColorModeValue,
  Grid,
  GridItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
  Center,
  Tooltip,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Heading,
  Container,
  Image,
} from '@chakra-ui/react';
import {
  FiCreditCard,
  FiCalendar,
  FiTrendingUp,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiInfo,
  FiDownload,
  FiFileText,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiBarChart,
  FiZap,
  FiShield,
  FiGlobe,
  FiMail,
  FiPhone,
  FiMapPin,
  FiPrinter,
} from 'react-icons/fi';
import { subscriptionAPI } from '../../services/subscriptionAPI';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SubscriptionManagement = () => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.300');
  
  // State management
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [invoiceData, setInvoiceData] = useState(null);
  
  // Modal states
  const { isOpen: isUpgradeOpen, onOpen: onUpgradeOpen, onClose: onUpgradeClose } = useDisclosure();
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  const { isOpen: isRenewOpen, onOpen: onRenewOpen, onClose: onRenewClose } = useDisclosure();
  const { isOpen: isInvoiceOpen, onOpen: onInvoiceOpen, onClose: onInvoiceClose } = useDisclosure();
  
  // Form states
  const [selectedPlan, setSelectedPlan] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [paymentData, setPaymentData] = useState({
    status: 'paid',
    gateway: 'stripe',
    transactionId: '',
  });


  // Load subscription data
  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Loading subscription data...');
      
      // Fetch data from real API with individual error handling
      const results = await Promise.allSettled([
        subscriptionAPI.getMySubscription(),
        subscriptionAPI.getPlans(),
        subscriptionAPI.getSubscriptionHistory({ limit: 50 })
      ]);
      
      console.log('📊 API Results:', results);
      
      // Handle subscription data
      if (results[0].status === 'fulfilled' && results[0].value.data) {
        console.log('✅ Subscription data loaded:', results[0].value);
        setSubscription(results[0].value.data);
      } else {
        console.log('ℹ️ No active subscription found');
        setSubscription(null);
      }
      
      // Handle plans data
      if (results[1].status === 'fulfilled') {
        console.log('✅ Plans data loaded:', results[1].value);
        setPlans(results[1].value.data || []);
      } else {
        console.error('❌ Plans data error:', results[1].reason);
        setPlans([]);
      }
      
      // Handle payment history
      if (results[2].status === 'fulfilled') {
        console.log('✅ Payment history loaded:', results[2].value);
        setPaymentHistory(results[2].value.data || []);
      } else {
        console.error('❌ Payment history error:', results[2].reason);
        setPaymentHistory([]);
      }
      
      // Check if any API failed
      const failedAPIs = results.filter(result => result.status === 'rejected');
      if (failedAPIs.length > 0) {
        console.warn(`⚠️ ${failedAPIs.length} API(s) failed, but continuing with available data`);
      }
      
      console.log('✅ Subscription data loading completed');
      
    } catch (err) {
      console.error('❌ Error loading subscription data:', err);
      setError(`Failed to load subscription data: ${err.message}`);
      
      toast({
        title: 'Error',
        description: `Failed to load subscription data: ${err.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle subscription upgrade
  const handleUpgrade = async () => {
    try {
      if (!selectedPlan) {
        toast({
          title: 'Please select a plan',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Redirect to subscription plans page for payment
      const token = localStorage.getItem('token');
      if (token) {
        window.location.href = `${API_BASE_URL}/subscription-plans?token=${encodeURIComponent(token)}`;
      } else {
        window.location.href = `${API_BASE_URL}/subscription-plans`;
      }
      
    } catch (err) {
      console.error('❌ Subscription upgrade error:', err);
      toast({
        title: 'Upgrade failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle subscription cancellation
  const handleCancel = async () => {
    try {
      const response = await subscriptionAPI.cancelSubscription({
        reason: cancellationReason,
      });

      toast({
        title: 'Subscription cancelled',
        description: 'Your subscription has been cancelled successfully.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });

      setSubscription(response.data);
      onCancelClose();
      loadSubscriptionData();
      
    } catch (err) {
      toast({
        title: 'Cancellation failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle subscription renewal
  const handleRenew = async () => {
    try {
      // Redirect to subscription plans page for payment
      const token = localStorage.getItem('token');
      if (token) {
        window.location.href = `${API_BASE_URL}/subscription-plans?token=${encodeURIComponent(token)}`;
      } else {
        window.location.href = `${API_BASE_URL}/subscription-plans`;
      }
      
    } catch (err) {
      toast({
        title: 'Renewal failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Generate invoice
  const generateInvoice = (payment) => {
    if (!payment) {
      toast({
        title: 'No payment data',
        description: 'Unable to generate invoice without payment information',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    const invoice = {
      id: payment.invoiceId || `INV-${Date.now()}`,
      date: payment.date,
      dueDate: new Date(new Date(payment.date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      transactionId: payment.transactionId,
      description: payment.description,
      planName: subscription?.planId?.name || 'Premium Fitness Coach',
      billingCycle: subscription?.billing?.billingCycle || 'monthly',
      customerInfo: {
        name: userData.name || userData.fullName || 'Customer',
        email: userData.email || 'customer@example.com',
        company: userData.company || 'Fitness Pro',
        address: userData.address || '123 Fitness Street, Health City, HC 12345',
        phone: userData.phone || '+1 (555) 123-4567'
      },
      companyInfo: {
        name: 'FunnelsEye',
        email: 'billing@funnelseye.com',
        address: '456 Business Ave, Tech City, TC 67890',
        phone: '+1 (555) 987-6543',
        website: 'www.funnelseye.com'
      }
    };
    
    console.log('📄 Generated invoice data:', invoice);
    setInvoiceData(invoice);
    onInvoiceOpen();
    
    toast({
      title: 'Invoice Generated',
      description: 'Invoice has been generated successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Download invoice as PDF
  const downloadInvoice = async () => {
    if (!invoiceData) {
      toast({
        title: 'No invoice data',
        description: 'Please generate an invoice first',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      toast({
        title: 'Generating PDF...',
        description: 'Please wait while we generate your invoice PDF',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Set font
      pdf.setFont('helvetica');
      
      // Add company header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(invoiceData.companyInfo.name, 20, 30);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(invoiceData.companyInfo.address, 20, 40);
      pdf.text(`Phone: ${invoiceData.companyInfo.phone}`, 20, 46);
      pdf.text(`Email: ${invoiceData.companyInfo.email}`, 20, 52);
      pdf.text(`Website: ${invoiceData.companyInfo.website}`, 20, 58);
      
      // Add invoice title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INVOICE', pageWidth - 60, 30);
      
      // Add invoice details
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Invoice #: ${invoiceData.id}`, pageWidth - 60, 40);
      pdf.text(`Date: ${formatDate(invoiceData.date)}`, pageWidth - 60, 46);
      pdf.text(`Due Date: ${formatDate(invoiceData.dueDate)}`, pageWidth - 60, 52);
      
      // Add customer information
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bill To:', 20, 80);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(invoiceData.customerInfo.name, 20, 88);
      pdf.text(invoiceData.customerInfo.company, 20, 94);
      pdf.text(invoiceData.customerInfo.address, 20, 100);
      pdf.text(`Phone: ${invoiceData.customerInfo.phone}`, 20, 106);
      pdf.text(`Email: ${invoiceData.customerInfo.email}`, 20, 112);
      
      // Add line separator
      pdf.setLineWidth(0.5);
      pdf.line(20, 120, pageWidth - 20, 120);
      
      // Add invoice items table header
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Description', 20, 135);
      pdf.text('Amount', pageWidth - 40, 135);
      
      // Add line under header
      pdf.line(20, 140, pageWidth - 20, 140);
      
      // Add invoice item
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(invoiceData.planName, 20, 150);
      pdf.text(`${invoiceData.billingCycle} subscription`, 20, 156);
      pdf.text(invoiceData.description, 20, 162);
      pdf.text(`Transaction ID: ${invoiceData.transactionId}`, 20, 168);
      
      // Add amount
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatCurrency(invoiceData.amount, invoiceData.currency), pageWidth - 40, 150);
      
      // Add total line
      pdf.line(20, 180, pageWidth - 20, 180);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Total:', pageWidth - 60, 190);
      pdf.text(formatCurrency(invoiceData.amount, invoiceData.currency), pageWidth - 40, 190);
      
      // Add payment status
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Payment Status: ${invoiceData.status.toUpperCase()}`, 20, 210);
      
      // Add footer
      pdf.setFontSize(8);
      pdf.text('Thank you for your business!', 20, pageHeight - 20);
      pdf.text(`If you have any questions, please contact us at ${invoiceData.companyInfo.email}`, 20, pageHeight - 15);
      
      // Save the PDF
      const fileName = `Invoice_${invoiceData.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: 'PDF Downloaded',
        description: `Invoice PDF has been downloaded as ${fileName}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: `Error generating PDF: ${error.message}`,
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

  // Calculate usage percentage
  const getUsagePercentage = (current, max) => {
    if (max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Print invoice
  const printInvoice = () => {
    if (!invoiceData) {
      toast({
        title: 'No invoice data',
        description: 'Please generate an invoice first',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceData.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .company-info h1 {
              margin: 0;
              color: #2D3748;
            }
            .invoice-title {
              font-size: 24px;
              font-weight: bold;
              color: #2D3748;
            }
            .invoice-details {
              text-align: right;
            }
            .customer-info {
              margin-bottom: 30px;
            }
            .customer-info h3 {
              margin: 0 0 10px 0;
              color: #2D3748;
            }
            .line {
              border-top: 1px solid #E2E8F0;
              margin: 20px 0;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .table th, .table td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #E2E8F0;
            }
            .table th {
              background-color: #F7FAFC;
              font-weight: bold;
            }
            .total {
              text-align: right;
              font-weight: bold;
              font-size: 16px;
            }
            .status {
              padding: 5px 10px;
              border-radius: 4px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status.paid {
              background-color: #C6F6D5;
              color: #22543D;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #718096;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-info">
              <h1>${invoiceData.companyInfo.name}</h1>
              <p>${invoiceData.companyInfo.address}</p>
              <p>Phone: ${invoiceData.companyInfo.phone}</p>
              <p>Email: ${invoiceData.companyInfo.email}</p>
              <p>Website: ${invoiceData.companyInfo.website}</p>
            </div>
            <div class="invoice-details">
              <div class="invoice-title">INVOICE</div>
              <p>Invoice #: ${invoiceData.id}</p>
              <p>Date: ${formatDate(invoiceData.date)}</p>
              <p>Due Date: ${formatDate(invoiceData.dueDate)}</p>
            </div>
          </div>

          <div class="customer-info">
            <h3>Bill To:</h3>
            <p><strong>${invoiceData.customerInfo.name}</strong></p>
            <p>${invoiceData.customerInfo.company}</p>
            <p>${invoiceData.customerInfo.address}</p>
            <p>Phone: ${invoiceData.customerInfo.phone}</p>
            <p>Email: ${invoiceData.customerInfo.email}</p>
          </div>

          <div class="line"></div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${invoiceData.planName}</strong><br>
                  ${invoiceData.billingCycle} subscription<br>
                  ${invoiceData.description}<br>
                  <small>Transaction ID: ${invoiceData.transactionId}</small>
                </td>
                <td><strong>${formatCurrency(invoiceData.amount, invoiceData.currency)}</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="line"></div>

          <div class="total">
            Total: ${formatCurrency(invoiceData.amount, invoiceData.currency)}
          </div>

          <div style="margin-top: 20px;">
            <strong>Payment Status:</strong>
            <span class="status ${invoiceData.status}">${invoiceData.status.toUpperCase()}</span>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>If you have any questions about this invoice, please contact us at ${invoiceData.companyInfo.email}</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get current plan ID
  const getCurrentPlanId = () => {
    return subscription?.planId?._id || null;
  };

  // Check if plan is current plan
  const isCurrentPlan = (planId) => {
    return planId === getCurrentPlanId();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading subscription data...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error loading subscription!</AlertTitle>
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
              <Heading size="xl" color={textColor} mb={2}>
                Subscription Dashboard
              </Heading>
              <Text color={subTextColor} fontSize="lg">
                Manage your subscription, billing, usage, and invoices
              </Text>
            </Box>
            <HStack spacing={3}>
              <Button
                leftIcon={<FiRefreshCw />}
                onClick={loadSubscriptionData}
                variant="outline"
                size="sm"
                colorScheme="blue"
                isLoading={loading}
              >
                Refresh
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Tab Navigation */}
        <Tabs index={activeTab === 'overview' ? 0 : activeTab === 'billing' ? 1 : 2} onChange={(index) => {
          const tabs = ['overview', 'billing', 'invoices'];
          setActiveTab(tabs[index]);
        }}>
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiCreditCard} />
                <Text>Overview</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiDollarSign} />
                <Text>Billing & Usage</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiFileText} />
                <Text>Invoices</Text>
              </HStack>
            </Tab>
          </TabList>
          
          <TabPanels>
            {/* Overview Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">

                {/* No Subscription Message */}
                {!subscription && (
                  <Card bg={cardBg} borderRadius="xl" boxShadow="lg" border="2px solid" borderColor="gray.200">
                    <CardBody>
                      <VStack spacing={4} py={8}>
                        <Icon as={FiAlertTriangle} boxSize={12} color="orange.500" />
                        <Box textAlign="center">
                          <Heading size="md" color={textColor} mb={2}>
                            No Active Subscription
                          </Heading>
                          <Text color={subTextColor} mb={4}>
                            You don't have an active subscription. Please select a plan below to get started.
                          </Text>
                          <Button
                            colorScheme="blue"
                            size="lg"
                            onClick={() => {
                              const token = localStorage.getItem('token');
                              if (token) {
                                window.location.href = `${API_BASE_URL}/subscription-plans?token=${encodeURIComponent(token)}`;
                              } else {
                                window.location.href = `${API_BASE_URL}/subscription-plans`;
                              }
                            }}
                          >
                            View Available Plans
                          </Button>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                {/* Current Plan Status - Highlighted */}
                {subscription && (
                  <Card bg={cardBg} border="2px solid" borderColor={subscription.status === 'active' ? 'green.200' : 'red.200'} borderRadius="xl" boxShadow="lg">
                    <CardHeader bg={subscription.status === 'active' ? 'green.50' : 'red.50'} borderRadius="xl">
                      <HStack justify="space-between" align="center">
                        <HStack spacing={4}>
                          <Box
                            p={3}
                            borderRadius="full"
                            bg={subscription.status === 'active' ? 'green.100' : 'red.100'}
                          >
                            <Icon 
                              as={subscription.status === 'active' ? FiCheck : FiX} 
                              boxSize={6} 
                              color={subscription.status === 'active' ? 'green.600' : 'red.600'} 
                            />
                          </Box>
                          <Box>
                            <Text fontSize="xl" fontWeight="bold" color={textColor}>
                              {subscription.planId?.name || 'No Active Plan'}
                            </Text>
                            <Text fontSize="md" color={subTextColor}>
                              {subscription.status === 'active' ? '✅ Active Subscription' : '❌ Inactive Subscription'}
                            </Text>
                          </Box>
                        </HStack>
                        <VStack align="end" spacing={1}>
                          <Badge
                            colorScheme={getStatusColor(subscription.status)}
                            fontSize="md"
                            px={4}
                            py={2}
                            borderRadius="full"
                          >
                            {subscription.status?.toUpperCase()}
                          </Badge>
                          {subscription.daysUntilExpiry && (
                            <Text fontSize="sm" color={subTextColor}>
                              {subscription.daysUntilExpiry} days remaining
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                        {/* Billing Info */}
                        <Box>
                          <HStack mb={3}>
                            <Icon as={FiDollarSign} color="blue.500" />
                            <Text fontWeight="semibold" color={textColor}>Billing</Text>
                          </HStack>
                          <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color={subTextColor}>Amount:</Text>
                              <Text fontSize="sm" fontWeight="bold" color={textColor}>
                                {formatCurrency(subscription.billing?.amount, subscription.billing?.currency)}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color={subTextColor}>Cycle:</Text>
                              <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                                {subscription.billing?.billingCycle}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color={subTextColor}>Next Billing:</Text>
                              <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                                {formatDate(subscription.billing?.nextBillingDate)}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="sm" color={subTextColor}>Payment Status:</Text>
                              <Badge
                                colorScheme={subscription.billing?.paymentStatus === 'paid' ? 'green' : 'red'}
                                size="sm"
                              >
                                {subscription.billing?.paymentStatus}
                              </Badge>
                            </HStack>
                          </VStack>
                        </Box>

                        {/* Usage Stats */}
                        <Box>
                          <HStack mb={3}>
                            <Icon as={FiBarChart} color="green.500" />
                            <Text fontWeight="semibold" color={textColor}>Usage</Text>
                          </HStack>
                          <VStack align="stretch" spacing={3}>
                            <Box>
                              <HStack justify="space-between" mb={1}>
                                <Text fontSize="xs" color={subTextColor}>Funnels</Text>
                                <Text fontSize="xs" fontWeight="semibold" color={textColor}>
                                  {subscription.usage?.currentFunnels || 0} / {subscription.planId?.features?.maxFunnels === -1 ? '∞' : subscription.planId?.features?.maxFunnels || 0}
                                </Text>
                              </HStack>
                              <Progress
                                value={getUsagePercentage(
                                  subscription.usage?.currentFunnels || 0,
                                  subscription.planId?.features?.maxFunnels || 1
                                )}
                                colorScheme="blue"
                                size="sm"
                                borderRadius="md"
                              />
                            </Box>
                            <Box>
                              <HStack justify="space-between" mb={1}>
                                <Text fontSize="xs" color={subTextColor}>Leads</Text>
                                <Text fontSize="xs" fontWeight="semibold" color={textColor}>
                                  {subscription.usage?.currentLeads || 0} / {subscription.limits?.maxLeads === -1 || subscription.planId?.limits?.maxLeads === -1 ? '∞' : (subscription.limits?.maxLeads || subscription.planId?.limits?.maxLeads || 0).toLocaleString()}
                                </Text>
                              </HStack>
                              <Progress
                                value={getUsagePercentage(
                                  subscription.usage?.currentLeads || 0,
                                  subscription.limits?.maxLeads || subscription.planId?.limits?.maxLeads || 1
                                )}
                                colorScheme="green"
                                size="sm"
                                borderRadius="md"
                              />
                            </Box>
                            <Box>
                              <HStack justify="space-between" mb={1}>
                                <Text fontSize="xs" color={subTextColor}>Staff</Text>
                                <Text fontSize="xs" fontWeight="semibold" color={textColor}>
                                  {subscription.usage?.currentStaff || 0} / {subscription.planId?.features?.maxStaff === -1 ? '∞' : subscription.planId?.features?.maxStaff || 0}
                                </Text>
                              </HStack>
                              <Progress
                                value={getUsagePercentage(
                                  subscription.usage?.currentStaff || 0,
                                  subscription.planId?.features?.maxStaff || 1
                                )}
                                colorScheme="purple"
                                size="sm"
                                borderRadius="md"
                              />
                            </Box>
                          </VStack>
                        </Box>

                        {/* Features */}
                        <Box>
                          <HStack mb={3}>
                            <Icon as={FiZap} color="purple.500" />
                            <Text fontWeight="semibold" color={textColor}>Features</Text>
                          </HStack>
                          <VStack align="stretch" spacing={2}>
                              <HStack justify="space-between">
                                <Text fontSize="sm" color={subTextColor}>AI Features:</Text>
                                <Icon
                                  as={subscription.planId?.features?.aiFeatures ? FiCheck : FiX}
                                  color={subscription.planId?.features?.aiFeatures ? 'green.500' : 'red.500'}
                                />
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm" color={subTextColor}>Analytics:</Text>
                                <Icon
                                  as={subscription.planId?.features?.advancedAnalytics ? FiCheck : FiX}
                                  color={subscription.planId?.features?.advancedAnalytics ? 'green.500' : 'red.500'}
                                />
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm" color={subTextColor}>Priority Support:</Text>
                                <Icon
                                  as={subscription.planId?.features?.prioritySupport ? FiCheck : FiX}
                                  color={subscription.planId?.features?.prioritySupport ? 'green.500' : 'red.500'}
                                />
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm" color={subTextColor}>Custom Domain:</Text>
                                <Icon
                                  as={subscription.planId?.features?.customDomain ? FiCheck : FiX}
                                  color={subscription.planId?.features?.customDomain ? 'green.500' : 'red.500'}
                                />
                              </HStack>
                          </VStack>
                        </Box>

                        {/* Quick Actions */}
                        <Box>
                          <HStack mb={3}>
                            <Icon as={FiTrendingUp} color="orange.500" />
                            <Text fontWeight="semibold" color={textColor}>Actions</Text>
                          </HStack>
                          <VStack spacing={2} align="stretch">
                            <Button
                              size="sm"
                              colorScheme="blue"
                              leftIcon={<FiTrendingUp />}
                              onClick={onUpgradeOpen}
                              isDisabled={subscription.status !== 'active'}
                            >
                              Upgrade Plan
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              leftIcon={<FiRefreshCw />}
                              onClick={onRenewOpen}
                              isDisabled={subscription.status !== 'active'}
                            >
                              Renew
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              leftIcon={<FiX />}
                              onClick={onCancelOpen}
                              isDisabled={subscription.status !== 'active'}
                            >
                              Cancel
                            </Button>
                          </VStack>
                        </Box>
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                )}

                {/* Current Plan Service Usage */}
                <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
                  <CardHeader>
                    <HStack justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Icon as={FiBarChart} boxSize={6} color="blue.500" />
                        <Box>
                          <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                            Current Plan Service Usage
                          </Text>
                          <Text fontSize="sm" color={subTextColor}>
                            {subscription?.planId?.name || 'Premium Fitness Coach'} - Used vs Available
                          </Text>
                        </Box>
                      </HStack>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      {/* Funnels Usage */}
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <HStack spacing={2}>
                            <Icon as={FiTrendingUp} color="blue.500" />
                            <Text fontWeight="semibold" color={textColor}>Funnels</Text>
                          </HStack>
                          <Text fontSize="sm" color={subTextColor}>
                            {subscription?.usage?.currentFunnels || 0} / {subscription?.planId?.features?.maxFunnels === -1 ? '∞' : subscription?.planId?.features?.maxFunnels || 0}
                          </Text>
                        </HStack>
                        <Progress
                          value={getUsagePercentage(
                            subscription?.usage?.currentFunnels || 0,
                            subscription?.planId?.features?.maxFunnels || 1
                          )}
                          colorScheme="blue"
                          size="lg"
                          borderRadius="md"
                        />
                        <HStack justify="space-between" mt={1}>
                          <Text fontSize="xs" color="green.600">
                            Used: {subscription?.usage?.currentFunnels || 0}
                          </Text>
                          <Text fontSize="xs" color="blue.600">
                            Remaining: {subscription?.planId?.features?.maxFunnels === -1 ? '∞' : (subscription?.planId?.features?.maxFunnels || 0) - (subscription?.usage?.currentFunnels || 0)}
                          </Text>
                        </HStack>
                      </Box>

                      {/* Leads Usage */}
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <HStack spacing={2}>
                            <Icon as={FiUsers} color="green.500" />
                            <Text fontWeight="semibold" color={textColor}>Leads</Text>
                          </HStack>
                          <Text fontSize="sm" color={subTextColor}>
                            {subscription?.usage?.currentLeads || 0} / {subscription?.planId?.features?.maxLeads === -1 || subscription?.limits?.maxLeads === -1 ? '∞' : (subscription?.limits?.maxLeads || subscription?.planId?.limits?.maxLeads || 0).toLocaleString()}
                          </Text>
                        </HStack>
                        <Progress
                          value={getUsagePercentage(
                            subscription?.usage?.currentLeads || 0,
                            subscription?.limits?.maxLeads || subscription?.planId?.limits?.maxLeads || 1
                          )}
                          colorScheme="green"
                          size="lg"
                          borderRadius="md"
                        />
                        <HStack justify="space-between" mt={1}>
                          <Text fontSize="xs" color="green.600">
                            Used: {(subscription?.usage?.currentLeads || 0).toLocaleString()}
                          </Text>
                          <Text fontSize="xs" color="blue.600">
                            Remaining: {subscription?.limits?.maxLeads === -1 || subscription?.planId?.limits?.maxLeads === -1 ? '∞' : ((subscription?.limits?.maxLeads || subscription?.planId?.limits?.maxLeads || 0) - (subscription?.usage?.currentLeads || 0)).toLocaleString()}
                          </Text>
                        </HStack>
                      </Box>

                      {/* Staff Usage */}
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <HStack spacing={2}>
                            <Icon as={FiUsers} color="purple.500" />
                            <Text fontWeight="semibold" color={textColor}>Team Members</Text>
                          </HStack>
                          <Text fontSize="sm" color={subTextColor}>
                            {subscription?.usage?.currentStaff || 0} / {subscription?.planId?.features?.maxStaff === -1 ? '∞' : subscription?.planId?.features?.maxStaff || 0}
                          </Text>
                        </HStack>
                        <Progress
                          value={getUsagePercentage(
                            subscription?.usage?.currentStaff || 0,
                            subscription?.planId?.features?.maxStaff || 1
                          )}
                          colorScheme="purple"
                          size="lg"
                          borderRadius="md"
                        />
                        <HStack justify="space-between" mt={1}>
                          <Text fontSize="xs" color="green.600">
                            Used: {subscription?.usage?.currentStaff || 0}
                          </Text>
                          <Text fontSize="xs" color="blue.600">
                            Remaining: {subscription?.planId?.features?.maxStaff === -1 ? '∞' : (subscription?.planId?.features?.maxStaff || 0) - (subscription?.usage?.currentStaff || 0)}
                          </Text>
                        </HStack>
                      </Box>

                      {/* Automation Rules Usage */}
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <HStack spacing={2}>
                            <Icon as={FiZap} color="orange.500" />
                            <Text fontWeight="semibold" color={textColor}>Automation Rules</Text>
                          </HStack>
                          <Text fontSize="sm" color={subTextColor}>
                            {subscription?.usage?.currentAutomationRules || 0} / {subscription?.planId?.features?.automationRules === -1 || subscription?.limits?.maxAutomationRules === -1 ? '∞' : (subscription?.planId?.features?.automationRules || subscription?.limits?.maxAutomationRules || 0)}
                          </Text>
                        </HStack>
                        <Progress
                          value={getUsagePercentage(
                            subscription?.usage?.currentAutomationRules || 0,
                            subscription?.planId?.features?.automationRules || subscription?.limits?.maxAutomationRules || 1
                          )}
                          colorScheme="orange"
                          size="lg"
                          borderRadius="md"
                        />
                        <HStack justify="space-between" mt={1}>
                          <Text fontSize="xs" color="green.600">
                            Used: {subscription?.usage?.currentAutomationRules || 0}
                          </Text>
                          <Text fontSize="xs" color="blue.600">
                            Remaining: {subscription?.planId?.features?.automationRules === -1 || subscription?.limits?.maxAutomationRules === -1 ? '∞' : (subscription?.planId?.features?.automationRules || subscription?.limits?.maxAutomationRules || 0) - (subscription?.usage?.currentAutomationRules || 0)}
                          </Text>
                        </HStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>


              </VStack>
            </TabPanel>

            {/* Billing & Usage Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                {/* Billing Statistics */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                  <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
                    <CardBody>
                      <Stat>
                        <StatLabel color={subTextColor}>Total Paid</StatLabel>
                        <StatNumber color={textColor}>
                          {formatCurrency(paymentHistory.reduce((sum, payment) => sum + payment.amount, 0), subscription?.billing?.currency)}
                        </StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          {paymentHistory.length} payments
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
                    <CardBody>
                      <Stat>
                        <StatLabel color={subTextColor}>Next Payment</StatLabel>
                        <StatNumber color={textColor}>
                          {formatCurrency(subscription?.billing?.amount || 0, subscription?.billing?.currency)}
                        </StatNumber>
                        <StatHelpText>
                          <Icon as={FiCalendar} mr={1} />
                          {formatDate(subscription?.billing?.nextBillingDate)}
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
                    <CardBody>
                      <Stat>
                        <StatLabel color={subTextColor}>Days Until Renewal</StatLabel>
                        <StatNumber color={textColor}>
                          {subscription?.daysUntilExpiry || 0}
                        </StatNumber>
                        <StatHelpText>
                          <Icon as={FiClock} mr={1} />
                          {subscription?.isExpiringSoon ? 'Expiring Soon' : 'Active'}
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
                    <CardBody>
                      <Stat>
                        <StatLabel color={subTextColor}>Payment Status</StatLabel>
                        <StatNumber color={textColor}>
                          <Badge
                            colorScheme={subscription?.billing?.paymentStatus === 'paid' ? 'green' : 'red'}
                            fontSize="md"
                            px={3}
                            py={1}
                          >
                            {subscription?.billing?.paymentStatus?.toUpperCase()}
                          </Badge>
                        </StatNumber>
                        <StatHelpText>
                          <Icon as={FiCreditCard} mr={1} />
                          {subscription?.billing?.paymentMethod}
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                {/* Payment History */}
                <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
                  <CardHeader>
                    <HStack justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Icon as={FiDollarSign} boxSize={6} color="green.500" />
                        <Box>
                          <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                            Payment History
                          </Text>
                          <Text fontSize="sm" color={subTextColor}>
                            Your recent subscription payments
                          </Text>
                        </Box>
                      </HStack>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th color={subTextColor}>Date</Th>
                            <Th color={subTextColor}>Amount</Th>
                            <Th color={subTextColor}>Status</Th>
                            <Th color={subTextColor}>Method</Th>
                            <Th color={subTextColor}>Transaction ID</Th>
                            <Th color={subTextColor}>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {paymentHistory.length > 0 ? (
                            paymentHistory.map((payment) => (
                              <Tr key={payment.id}>
                                <Td color={textColor}>{formatDate(payment.date)}</Td>
                                <Td color={textColor} fontWeight="semibold">
                                  {formatCurrency(payment.amount, payment.currency)}
                                </Td>
                                <Td>
                                  <Badge
                                    colorScheme={payment.status === 'paid' ? 'green' : 'red'}
                                    size="sm"
                                  >
                                    {payment.status}
                                  </Badge>
                                </Td>
                                <Td color={textColor}>{payment.method}</Td>
                                <Td color={subTextColor} fontSize="sm">{payment.transactionId}</Td>
                                <Td>
                                  <HStack spacing={2}>
                                    <Tooltip label="Generate Invoice">
                                      <IconButton
                                        size="sm"
                                        variant="ghost"
                                        icon={<FiFileText />}
                                        onClick={() => generateInvoice(payment)}
                                        colorScheme="blue"
                                      />
                                    </Tooltip>
                                    <Tooltip label="Download Receipt">
                                      <IconButton
                                        size="sm"
                                        variant="ghost"
                                        icon={<FiDownload />}
                                        onClick={() => downloadInvoice()}
                                        colorScheme="green"
                                      />
                                    </Tooltip>
                                  </HStack>
                                </Td>
                              </Tr>
                            ))
                          ) : (
                            <Tr>
                              <Td colSpan={6} textAlign="center" py={8}>
                                <VStack spacing={3}>
                                  <Icon as={FiDollarSign} boxSize={8} color="gray.300" />
                                  <Text color={subTextColor}>No payment history found</Text>
                                  <Text fontSize="sm" color={subTextColor}>
                                    Payment history will appear here once you make your first payment
                                  </Text>
                                </VStack>
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </CardBody>
                </Card>

              </VStack>
            </TabPanel>

            {/* Invoices Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
                  <CardHeader>
                    <HStack justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Icon as={FiFileText} boxSize={6} color="blue.500" />
                        <Box>
                          <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                            Invoice Management
                          </Text>
                          <Text fontSize="sm" color={subTextColor}>
                            Generate and download your invoices
                          </Text>
                        </Box>
                      </HStack>
                      <Button
                        leftIcon={<FiFileText />}
                        colorScheme="blue"
                        onClick={() => paymentHistory.length > 0 ? generateInvoice(paymentHistory[0]) : toast({
                          title: 'No payment history',
                          description: 'No payment history available to generate invoice',
                          status: 'warning',
                          duration: 3000,
                          isClosable: true,
                        })}
                      >
                        Generate Latest Invoice
                      </Button>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Text color={subTextColor} textAlign="center" py={8}>
                        Click on any payment in the billing tab to generate an invoice, or use the button above to generate the latest invoice.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
            
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Upgrade Plan Modal */}
      <Modal isOpen={isUpgradeOpen} onClose={onUpgradeClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upgrade Subscription</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Redirecting to Payment</AlertTitle>
                  <AlertDescription>
                    You will be redirected to our secure payment portal to complete your subscription upgrade.
                  </AlertDescription>
                </Box>
              </Alert>
              
              <FormControl>
                <FormLabel>Select Plan</FormLabel>
                <Select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  placeholder="Choose a plan"
                >
                  {plans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name} - {formatCurrency(plan.price || 0, plan.currency || 'INR')}/{plan.billingCycle || 'month'}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUpgradeClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleUpgrade}>
              Continue to Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cancel Subscription Modal */}
      <Modal isOpen={isCancelOpen} onClose={onCancelClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cancel Subscription</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="warning">
                <AlertIcon />
                <Box>
                  <AlertTitle>Are you sure?</AlertTitle>
                  <AlertDescription>
                    Cancelling your subscription will disable access to premium features.
                  </AlertDescription>
                </Box>
              </Alert>
              
              <FormControl>
                <FormLabel>Reason for cancellation</FormLabel>
                <Textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please tell us why you're cancelling..."
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCancelClose}>
              Keep Subscription
            </Button>
            <Button colorScheme="red" onClick={handleCancel}>
              Cancel Subscription
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Renew Subscription Modal */}
      <Modal isOpen={isRenewOpen} onClose={onRenewClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Renew Subscription</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Renewal Information</AlertTitle>
                  <AlertDescription>
                    You will be redirected to our secure payment portal to renew your subscription for another {subscription?.billing?.billingCycle || 'month'}.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRenewClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleRenew}>
              Continue to Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Invoice Modal */}
      <Modal isOpen={isInvoiceOpen} onClose={onInvoiceClose} size="4xl">
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={FiFileText} color="blue.500" />
              <Text>Invoice #{invoiceData?.id}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {invoiceData && (
              <Box>
                {/* Invoice Header */}
                <Flex justify="space-between" mb={8}>
                  <Box>
                    <Heading size="lg" color={textColor} mb={2}>
                      {invoiceData.companyInfo.name}
                    </Heading>
                    <VStack align="start" spacing={1}>
                      <Text color={subTextColor} fontSize="sm">
                        <Icon as={FiMapPin} mr={2} />
                        {invoiceData.companyInfo.address}
                      </Text>
                      <Text color={subTextColor} fontSize="sm">
                        <Icon as={FiPhone} mr={2} />
                        {invoiceData.companyInfo.phone}
                      </Text>
                      <Text color={subTextColor} fontSize="sm">
                        <Icon as={FiMail} mr={2} />
                        {invoiceData.companyInfo.email}
                      </Text>
                      <Text color={subTextColor} fontSize="sm">
                        <Icon as={FiGlobe} mr={2} />
                        {invoiceData.companyInfo.website}
                      </Text>
                    </VStack>
                  </Box>
                  <Box textAlign="right">
                    <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={2}>
                      INVOICE
                    </Text>
                    <VStack align="end" spacing={1}>
                      <Text color={subTextColor} fontSize="sm">
                        Invoice #: {invoiceData.id}
                      </Text>
                      <Text color={subTextColor} fontSize="sm">
                        Date: {formatDate(invoiceData.date)}
                      </Text>
                      <Text color={subTextColor} fontSize="sm">
                        Due: {formatDate(invoiceData.dueDate)}
                      </Text>
                    </VStack>
                  </Box>
                </Flex>

                {/* Bill To */}
                <Box mb={8}>
                  <Text fontWeight="semibold" color={textColor} mb={3}>Bill To:</Text>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold" color={textColor}>
                      {invoiceData.customerInfo.name}
                    </Text>
                    <Text color={subTextColor} fontSize="sm">
                      {invoiceData.customerInfo.company}
                    </Text>
                    <Text color={subTextColor} fontSize="sm">
                      {invoiceData.customerInfo.address}
                    </Text>
                    <Text color={subTextColor} fontSize="sm">
                      {invoiceData.customerInfo.phone}
                    </Text>
                    <Text color={subTextColor} fontSize="sm">
                      {invoiceData.customerInfo.email}
                    </Text>
                  </VStack>
                </Box>

                {/* Invoice Items */}
                <Box mb={8}>
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th color={subTextColor}>Description</Th>
                          <Th color={subTextColor} isNumeric>Amount</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td color={textColor}>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold">
                                {invoiceData.planName} - {invoiceData.billingCycle}
                              </Text>
                              <Text fontSize="sm" color={subTextColor}>
                                {invoiceData.description}
                              </Text>
                              <Text fontSize="xs" color={subTextColor}>
                                Transaction ID: {invoiceData.transactionId}
                              </Text>
                            </VStack>
                          </Td>
                          <Td color={textColor} fontWeight="semibold" isNumeric>
                            {formatCurrency(invoiceData.amount, invoiceData.currency)}
                          </Td>
                        </Tr>
                      </Tbody>
                      <Tfoot>
                        <Tr>
                          <Th color={textColor} fontSize="lg">Total</Th>
                          <Th color={textColor} fontSize="lg" fontWeight="bold" isNumeric>
                            {formatCurrency(invoiceData.amount, invoiceData.currency)}
                          </Th>
                        </Tr>
                      </Tfoot>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Payment Status */}
                <Box mb={8} p={4} bg={invoiceData.status === 'paid' ? 'green.50' : 'red.50'} borderRadius="md">
                  <HStack justify="space-between">
                    <Text fontWeight="semibold" color={textColor}>
                      Payment Status:
                    </Text>
                    <Badge
                      colorScheme={invoiceData.status === 'paid' ? 'green' : 'red'}
                      fontSize="md"
                      px={3}
                      py={1}
                    >
                      {invoiceData.status.toUpperCase()}
                    </Badge>
                  </HStack>
                </Box>

                {/* Footer */}
                <Box textAlign="center" color={subTextColor} fontSize="sm">
                  <Text>Thank you for your business!</Text>
                  <Text mt={2}>
                    If you have any questions about this invoice, please contact us at {invoiceData.companyInfo.email}
                  </Text>
                </Box>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onInvoiceClose}>
              Close
            </Button>
            <Button
              leftIcon={<FiDownload />}
              colorScheme="blue"
              onClick={downloadInvoice}
            >
              Download PDF
            </Button>
            <Button
              leftIcon={<FiPrinter />}
              colorScheme="green"
              onClick={printInvoice}
            >
              Print
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};

export default SubscriptionManagement;