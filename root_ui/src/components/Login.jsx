import { useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  VStack,
  HStack,
  Text,
  Heading,
  Flex,
  Checkbox,
  PinInput,
  PinInputField,
  useToast,
  Card,
  CardBody,
  Icon,
  Spinner,
  Stack,
  Center,
  ScaleFade,
  SlideFade,
  IconButton,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
  Progress,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  WarningIcon,
  InfoIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import {
  FaEnvelope,
  FaLock,
  FaShieldAlt,
  FaArrowLeft,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/apiConfig';
import Swal from 'sweetalert';

// Custom toast hook matching calendar style
const useCustomToast = () => {
  const toast = useToast();

  return useCallback((message, status = 'info') => {
    const statusConfig = {
      success: {
        title: 'Success',
        bg: 'white',
        borderColor: 'green.200',
        iconColor: 'green.500',
        titleColor: 'green.700',
        textColor: 'gray.700',
        icon: CheckCircleIcon
      },
      error: {
        title: 'Error',
        bg: 'white',
        borderColor: 'red.200',
        iconColor: 'red.500',
        titleColor: 'red.700',
        textColor: 'gray.700',
        icon: WarningIcon
      },
      warning: {
        title: 'Warning',
        bg: 'white',
        borderColor: 'orange.200',
        iconColor: 'orange.500',
        titleColor: 'orange.700',
        textColor: 'gray.700',
        icon: WarningIcon
      },
      info: {
        title: 'Info',
        bg: 'white',
        borderColor: 'blue.200',
        iconColor: 'blue.500',
        titleColor: 'blue.700',
        textColor: 'gray.700',
        icon: InfoIcon
      }
    };

    const config = statusConfig[status] || statusConfig.info;
    const IconComponent = config.icon;

    toast({
      duration: 4000,
      isClosable: true,
      position: 'top-right',
      render: ({ onClose }) => (
        <Box
          bg={config.bg}
          border="1px solid"
          borderColor={config.borderColor}
          borderRadius="7px"
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          p={4}
          display="flex"
          alignItems="flex-start"
          gap={3}
          minW="320px"
          maxW="400px"
        >
          <Box
            as={IconComponent}
            color={config.iconColor}
            boxSize={5}
            mt={0.5}
            flexShrink={0}
          />
          <VStack align="start" spacing={1} flex={1}>
            <Text fontSize="sm" fontWeight="600" color={config.titleColor}>
              {config.title}
            </Text>
            <Text fontSize="sm" color={config.textColor} lineHeight="1.5">
              {message}
            </Text>
          </VStack>
          <IconButton
            aria-label="Close"
            icon={<CloseIcon />}
            size="xs"
            variant="ghost"
            color="gray.400"
            onClick={onClose}
            _hover={{ color: 'gray.600', bg: 'gray.50' }}
            borderRadius="7px"
          />
        </Box>
      ),
    });
  }, [toast]);
};

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useCustomToast();

  const [input, setInput] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password modal state
  const { isOpen: isForgotPasswordOpen, onOpen: onForgotPasswordOpen, onClose: onForgotPasswordClose } = useDisclosure();
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  // Function to handle OTP request for unverified users
  const handleRequestOTP = async (email) => {
    setIsLoading(true);
    try {
      console.log('📧 Requesting OTP for email:', email);

      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('📧 OTP Response status:', response.status);

      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        console.error('📧 Non-JSON response:', textResponse);
        data = {
          success: false,
          message: 'Server returned an invalid response. Please contact support.'
        };
      }

      console.log('📧 OTP Response data:', data);

      if (response.ok && data.success) {
        toast('Verification code has been sent to your email address.', 'success');
        setShowOtpForm(true);
        setOtp('');
      } else {
        let errorMessage = data.message || 'Failed to send OTP. Please try again.';

        if (response.status === 500) {
          errorMessage = 'Server error occurred. Please try again later or contact support.';
          console.error('📧 500 Error details:', data);
        } else if (response.status === 404) {
          errorMessage = 'User account not found. Please check your email address.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. This account may already be verified.';
        }

        toast(errorMessage, 'error');

        console.error('📧 OTP Error:', {
          status: response.status,
          message: errorMessage,
          data: data
        });
      }
    } catch (error) {
      console.error('📧 OTP resend error:', error);
      toast('Network connection failed. Please check your connection and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle the final OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast('Please enter the complete 6-digit verification code.', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input.email, otp: otp })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast('Redirecting to your dashboard...', 'success');

        const { user, token } = data;

        // Store token in localStorage for future use
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Redirect to dashboard with token
        const dashboardUrl = process.env.NODE_ENV === 'production'
          ? `https://dashboard.funnelseye.com?token=${token}`
          : `http://localhost:5000?token=${token}`;

        window.location.href = dashboardUrl;
      } else {
        toast(data.message || 'Invalid OTP. Please try again.', 'error');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast('Unable to verify OTP. Please check your connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!input.email || !input.password) {
      toast('Please enter both email address and password.', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Attempting login for:', input.email);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: input.email,
          password: input.password,
        }),
      });

      console.log('🔐 Login response status:', response.status);

      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        console.error('🔐 Non-JSON response:', textResponse);

        if (response.status === 403) {
          data = {
            success: false,
            message: 'Email verification required. Please verify your email to continue.'
          };
        } else {
          data = {
            success: false,
            message: 'Server returned an invalid response. Please try again later.'
          };
        }
      }

      console.log('🔐 Login response data:', data);

      if (response.ok && data.success) {
        const { user, token } = data;

        if (!user.isVerified) {
          const result = await Swal({
            title: 'Email Verification Required',
            text: 'Your email address needs to be verified. Would you like us to send a verification code?',
            icon: 'warning',
            buttons: {
              cancel: {
                text: 'Cancel',
                value: false,
                visible: true,
                className: 'swal-button--cancel',
              },
              confirm: {
                text: 'Send Code',
                value: true,
                visible: true,
                className: 'swal-button--confirm',
              },
            },
            dangerMode: false,
          });

          if (result) {
            await handleRequestOTP(input.email);
          }
          return;
        }

        // Store token in localStorage for future use
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        toast(`Welcome back, ${user.name || 'User'}! Redirecting to dashboard...`, 'success');

        // Redirect to dashboard with token
        const dashboardUrl = process.env.NODE_ENV === 'production'
          ? `https://dashboard.funnelseye.com?token=${token}`
          : `http://localhost:5000?token=${token}`;

        window.location.href = dashboardUrl;

      } else {
        console.log('🔐 Login failed:', response.status, data);

        const isVerificationIssue =
          response.status === 403 ||
          (data.message && (
            data.message.toLowerCase().includes('verify') ||
            data.message.toLowerCase().includes('verification') ||
            data.message.toLowerCase().includes('not verified')
          ));

        if (isVerificationIssue) {
          console.log('🔐 Verification issue detected, prompting for OTP');

          const result = await Swal({
            title: 'Email Verification Required',
            text: data.message || 'Your email address needs to be verified. Would you like us to send a verification code?',
            icon: 'warning',
            buttons: {
              cancel: {
                text: 'Cancel',
                value: false,
                visible: true,
                className: 'swal-button--cancel',
              },
              confirm: {
                text: 'Send Code',
                value: true,
                visible: true,
                className: 'swal-button--confirm',
              },
            },
            dangerMode: false,
          });

          if (result) {
            console.log('🔐 User chose to send OTP');
            await handleRequestOTP(input.email);
          } else {
            console.log('🔐 User cancelled OTP request');
          }
        } else {
          let errorMessage = data.message || 'Invalid email address or password.';

          if (response.status === 401) {
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          } else if (response.status === 404) {
            errorMessage = 'Account not found. Please check your email address.';
          } else if (response.status === 500) {
            errorMessage = 'Server error occurred. Please try again later.';
          }

          console.error('🔐 Authentication error:', {
            status: response.status,
            message: errorMessage
          });

          toast(errorMessage, 'error');
        }
      }
    } catch (error) {
      console.error('🔐 Login error (catch):', error);
      toast('Unable to connect to the server. Please check your internet connection and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Handlers
  const handleOpenForgotPassword = () => {
    setForgotPasswordStep('email');
    setForgotPasswordEmail(input.email || '');
    setForgotPasswordOtp('');
    setResetToken('');
    setNewPassword('');
    setConfirmNewPassword('');
    onForgotPasswordOpen();
  };

  const handleCloseForgotPassword = () => {
    if (!forgotPasswordLoading) {
      onForgotPasswordClose();
      setForgotPasswordStep('email');
      setForgotPasswordEmail('');
      setForgotPasswordOtp('');
      setResetToken('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const handleSendResetOtp = async () => {
    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      toast('Please enter a valid email address.', 'warning');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast('Password reset OTP sent to your email.', 'success');
        setForgotPasswordStep('otp');
      } else {
        toast(data.message || 'Failed to send OTP. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Forgot password OTP error:', error);
      toast('Network error. Please check your connection.', 'error');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleVerifyResetOtp = async () => {
    if (!forgotPasswordOtp || forgotPasswordOtp.length !== 6) {
      toast('Please enter the complete 6-digit OTP.', 'warning');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-password-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail, otp: forgotPasswordOtp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast('OTP verified successfully.', 'success');
        setResetToken(data.resetToken);
        setForgotPasswordStep('newPassword');
      } else {
        toast(data.message || 'Invalid OTP. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Verify reset OTP error:', error);
      toast('Network error. Please check your connection.', 'error');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast('Password must be at least 6 characters long.', 'warning');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast('Passwords do not match.', 'error');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password-with-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken: resetToken,
          newPassword: newPassword,
          confirmPassword: confirmNewPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast('Password reset successfully! You can now login.', 'success');
        setForgotPasswordStep('success');
      } else {
        toast(data.message || 'Failed to reset password. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast('Network error. Please check your connection.', 'error');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const getStepProgress = () => {
    switch (forgotPasswordStep) {
      case 'email': return 25;
      case 'otp': return 50;
      case 'newPassword': return 75;
      case 'success': return 100;
      default: return 0;
    }
  };

  return (
    <Box minH="100vh" bg="#eef2ff" py={0} px={0}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        bg="white"
        borderRadius={0}
        overflow="hidden"
        boxShadow="none"
        border="none"
        minH="100vh"
        mx="auto"
        w="100%"
      >
          <Box
            w={{ base: '100%', md: '50%' }}
            p={{ base: 8, md: 12 }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            bgGradient="linear(to-b, #ffffff, #f5f7fb)"
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" top="-60px" left="-40px" w="200px" h="200px" bg="blue.100" opacity="0.18" filter="blur(10px)" borderRadius="full" />
            <Box position="absolute" top="35%" right="-80px" w="240px" h="240px" bg="purple.100" opacity="0.16" filter="blur(12px)" borderRadius="full" />
            <Box position="absolute" bottom="-80px" left="25%" w="220px" h="220px" bg="teal.50" opacity="0.16" filter="blur(14px)" borderRadius="full" />
            <VStack spacing={8} align="stretch" w="full" maxW="520px" mx="auto" justify="center" flex="1">
              <Heading size="lg" fontWeight="800" letterSpacing="-0.04em" color="#0f172a" lineHeight="1.2">
                {showOtpForm ? 'Verify your identity' : 'Welcome Back to FunnelsEye'}
              </Heading>

              <Box>
                {showOtpForm ? (
                  <SlideFade in={showOtpForm} offsetY="12px">
                    <VStack as="form" onSubmit={handleVerifyOTP} spacing={8}>
                      <Box textAlign="center" w="full">
                        <Flex
                          w="60px"
                          h="60px"
                          borderRadius="full"
                          bg="blue.50"
                          mb={6}
                          mx="auto"
                          align="center"
                          justify="center"
                        >
                          <Icon as={FaCheckCircle} boxSize={6} color="#4f46e5" />
                        </Flex>

                        <Text fontSize="lg" fontWeight="600" color="#312e81" mb={8}>
                          Enter 6-Digit Verification Code
                        </Text>

                        <HStack spacing={4} justify="center" mb={2}>
                          <PinInput
                            otp
                            size="lg"
                            value={otp}
                            onChange={setOtp}
                            placeholder="0"
                          >
                            {[...Array(6)].map((_, index) => (
                            <PinInputField
                                key={index}
                                borderRadius="md"
                                borderColor="blue.100"
                                border="2px solid"
                                _hover={{ borderColor: "blue.300" }}
                                _focus={{
                                  borderColor: "#4f46e5",
                                  boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.6)"
                                }}
                                fontSize="xl"
                                fontWeight="600"
                                color="#312e81"
                                bg="white"
                                h="60px"
                                w="60px"
                              />
                            ))}
                          </PinInput>
                        </HStack>

                        <Text fontSize="sm" color="gray.500" mb={8}>
                          Enter the 6-digit code sent to your email address
                        </Text>
                      </Box>

                      <Button
                        type="submit"
                        size="lg"
                        w="full"
                        bg="#4f46e5"
                        color="white"
                        _hover={{
                          bg: "#4338ca",
                          transform: "translateY(-1px)",
                          boxShadow: "0 15px 30px rgba(79, 70, 229, 0.35)"
                        }}
                        _active={{ transform: "translateY(0)" }}
                        isLoading={isLoading}
                        loadingText="Verifying..."
                        borderRadius="md"
                        fontSize="md"
                        fontWeight="600"
                        h="50px"
                        transition="all 0.2s ease"
                        boxShadow="0 2px 10px rgba(0,0,0,0.1)"
                      >
                        Verify & Continue
                      </Button>

                      <VStack spacing={4}>
                        <Button
                          variant="ghost"
                          onClick={() => handleRequestOTP(input.email)}
                          isDisabled={isLoading}
                          _hover={{ bg: "blue.50" }}
                          borderRadius="md"
                          fontWeight="500"
                          color="#4f46e5"
                        >
                          Resend Verification Code
                        </Button>

                        <Button
                          variant="ghost"
                          leftIcon={<FaArrowLeft />}
                          onClick={() => {
                            setShowOtpForm(false);
                            setOtp('');
                          }}
                          color="#4f46e5"
                          _hover={{ color: "#4338ca", bg: "blue.50" }}
                          borderRadius="md"
                          fontWeight="500"
                        >
                          Back to Sign In
                        </Button>
                      </VStack>
                    </VStack>
                  </SlideFade>
                ) : (
                  <VStack as="form" onSubmit={handleLogin} spacing={6}>
                    <FormControl>
                      <FormLabel
                        fontSize="sm"
                        fontWeight="400"
                        color="#0f172a"
                        mb={3}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        Email Address
                      </FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement h="50px">
                          <Icon as={FaEnvelope} color="#6b7280" />
                        </InputLeftElement>
                        <Input
                          type="email"
                          name="email"
                          value={input.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email address"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "#a5b4fc" }}
                          _focus={{
                            borderColor: "#4f46e5",
                            boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.35)"
                          }}
                          bg="white"
                          fontSize="md"
                          fontWeight="300"
                          h="50px"
                          required
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <Flex justify="space-between" align="center" mb={3}>
                        <FormLabel
                          fontSize="sm"
                          fontWeight="400"
                          color="#0f172a"
                          mb={0}
                          textTransform="uppercase"
                          letterSpacing="0.05em"
                        >
                          Password
                        </FormLabel>
                        <Text
                          as="button"
                          type="button"
                          onClick={handleOpenForgotPassword}
                          fontSize="sm"
                          color="brand.600"
                          fontWeight="500"
                          _hover={{ color: "brand.700", textDecoration: "underline" }}
                          cursor="pointer"
                        >
                          Forgot Password?
                        </Text>
                      </Flex>
                      <InputGroup size="lg">
                        <InputLeftElement h="50px">
                          <Icon as={FaLock} color="#6b7280" />
                        </InputLeftElement>
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={input.password}
                          onChange={handleInputChange}
                          placeholder="Enter your password"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "#a5b4fc" }}
                          _focus={{
                            borderColor: "#4f46e5",
                            boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.35)"
                          }}
                          bg="white"
                          fontSize="md"
                          fontWeight="300"
                          h="50px"
                          required
                        />
                        <InputRightElement h="50px">
                          <IconButton
                            variant="ghost"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            icon={<Icon as={showPassword ? FaEyeSlash : FaEye} />}
                            onClick={() => setShowPassword(!showPassword)}
                            color="brand.600"
                            _hover={{ color: "brand.700", bg: "transparent" }}
                            size="sm"
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <Flex w="full" justify="space-between" align="center" py={1}>
                      <Checkbox
                        colorScheme="brand"
                        size="md"
                        fontWeight="500"
                        color="brand.600"
                      >
                        Remember me
                      </Checkbox>
                    </Flex>

                    <Button
                      type="submit"
                      size="lg"
                      w="full"
                      bg="brand.600"
                      color="white"
                      _hover={{
                        bg: "brand.700",
                        transform: "translateY(-1px)",
                        boxShadow: "0 15px 30px rgba(2, 132, 199, 0.35)"
                      }}
                      _active={{ transform: "translateY(0)" }}
                      isLoading={isLoading}
                      borderRadius="md"
                      fontSize="md"
                      fontWeight="600"
                      h="50px"
                      transition="all 0.2s ease"
                      boxShadow="0 2px 10px rgba(0,0,0,0.1)"
                    >
                      {isLoading ? (
                        <HStack>
                          <Spinner size="sm" />
                          <Text>Signing In...</Text>
                        </HStack>
                      ) : (
                        'Log in'
                      )}
                    </Button>

                    <Box textAlign="center" pt={4}>
                      <Text color="gray.600" fontWeight="500">
                        Don't have an account?{' '}
                        <Link
                          to="/signup"
                          style={{
                            color: '#0284c7',
                            fontWeight: '600',
                            textDecoration: 'none'
                          }}
                          _hover={{ textDecoration: "underline", color: "#0369a1" }}
                        >
                          Register here
                        </Link>
                      </Text>
                    </Box>
                  </VStack>
                )}
              </Box>
            </VStack>

          </Box>

          <Box
            w={{ base: '100%', md: '50%' }}
            minH={{ base: '260px', md: 'auto' }}
            bgImage={`url('/login-bg.jpg')`}
            bgSize="cover"
            bgPos="center"
            position="relative"
          >
          </Box>
      </Flex>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotPasswordOpen}
        onClose={handleCloseForgotPassword}
        isCentered
        size="md"
        closeOnOverlayClick={false}
        closeOnEsc={false}
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent
          borderRadius="16px"
          mx={4}
          overflow="hidden"
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        >
          {/* Progress Bar */}
          <Progress
            value={getStepProgress()}
            size="xs"
            bg="gray.100"
            borderRadius="0"
            sx={{
              '& > div': {
                backgroundColor: '#4f46e5',
              },
            }}
          />

          <ModalHeader
            pt={6}
            pb={2}
            px={6}
            borderBottom="none"
          >
            <VStack align="start" spacing={1}>
              <Heading size="md" fontWeight="700" color="#0f172a">
                {forgotPasswordStep === 'email' && 'Reset Your Password'}
                {forgotPasswordStep === 'otp' && 'Verify Your Identity'}
                {forgotPasswordStep === 'newPassword' && 'Create New Password'}
                {forgotPasswordStep === 'success' && 'Password Reset Complete'}
              </Heading>
              <Text fontSize="sm" color="gray.500" fontWeight="400">
                {forgotPasswordStep === 'email' && 'Enter your email to receive a verification code'}
                {forgotPasswordStep === 'otp' && 'Enter the 6-digit code sent to your email'}
                {forgotPasswordStep === 'newPassword' && 'Choose a strong password for your account'}
                {forgotPasswordStep === 'success' && 'You can now login with your new password'}
              </Text>
            </VStack>
          </ModalHeader>

          <ModalCloseButton
            isDisabled={forgotPasswordLoading}
            top={4}
            right={4}
            borderRadius="full"
            _hover={{ bg: 'gray.100' }}
          />

          <ModalBody px={6} pb={6} pt={4}>
            {/* Step 1: Email Entry */}
            {forgotPasswordStep === 'email' && (
              <VStack spacing={5}>
                <Flex
                  w="64px"
                  h="64px"
                  borderRadius="full"
                  bg="blue.50"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaEnvelope} boxSize={6} color="#4f46e5" />
                </Flex>

                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="500"
                    color="gray.600"
                    mb={2}
                  >
                    Email Address
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement h="50px">
                      <Icon as={FaEnvelope} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="Enter your email address"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: "blue.200" }}
                      _focus={{
                        borderColor: "#4f46e5",
                        boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.15)"
                      }}
                      bg="white"
                      fontSize="md"
                      h="50px"
                    />
                  </InputGroup>
                </FormControl>

                <Button
                  w="full"
                  size="lg"
                  bg="#4f46e5"
                  color="white"
                  _hover={{
                    bg: "#4338ca",
                    transform: "translateY(-1px)",
                    boxShadow: "0 10px 25px rgba(79, 70, 229, 0.25)"
                  }}
                  _active={{ transform: "translateY(0)" }}
                  isLoading={forgotPasswordLoading}
                  loadingText="Sending..."
                  onClick={handleSendResetOtp}
                  borderRadius="md"
                  fontSize="md"
                  fontWeight="600"
                  h="50px"
                  transition="all 0.2s ease"
                >
                  Send Verification Code
                </Button>

                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Remember your password?{' '}
                  <Text
                    as="button"
                    type="button"
                    color="#4f46e5"
                    fontWeight="500"
                    onClick={handleCloseForgotPassword}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Back to login
                  </Text>
                </Text>
              </VStack>
            )}

            {/* Step 2: OTP Verification */}
            {forgotPasswordStep === 'otp' && (
              <VStack spacing={5}>
                <Flex
                  w="64px"
                  h="64px"
                  borderRadius="full"
                  bg="blue.50"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaShieldAlt} boxSize={6} color="#4f46e5" />
                </Flex>

                <Text fontSize="sm" color="gray.600" textAlign="center">
                  We sent a verification code to{' '}
                  <Text as="span" fontWeight="600" color="#0f172a">
                    {forgotPasswordEmail}
                  </Text>
                </Text>

                <HStack spacing={3} justify="center">
                  <PinInput
                    otp
                    size="lg"
                    value={forgotPasswordOtp}
                    onChange={setForgotPasswordOtp}
                    placeholder="0"
                  >
                    {[...Array(6)].map((_, index) => (
                      <PinInputField
                        key={index}
                        borderRadius="md"
                        borderColor="gray.200"
                        border="2px solid"
                        _hover={{ borderColor: "blue.200" }}
                        _focus={{
                          borderColor: "#4f46e5",
                          boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.15)"
                        }}
                        fontSize="xl"
                        fontWeight="600"
                        color="#0f172a"
                        bg="white"
                        h="56px"
                        w="48px"
                      />
                    ))}
                  </PinInput>
                </HStack>

                <Button
                  w="full"
                  size="lg"
                  bg="#4f46e5"
                  color="white"
                  _hover={{
                    bg: "#4338ca",
                    transform: "translateY(-1px)",
                    boxShadow: "0 10px 25px rgba(79, 70, 229, 0.25)"
                  }}
                  _active={{ transform: "translateY(0)" }}
                  isLoading={forgotPasswordLoading}
                  loadingText="Verifying..."
                  onClick={handleVerifyResetOtp}
                  borderRadius="md"
                  fontSize="md"
                  fontWeight="600"
                  h="50px"
                  transition="all 0.2s ease"
                >
                  Verify Code
                </Button>

                <HStack spacing={1} justify="center">
                  <Text fontSize="sm" color="gray.500">
                    Didn't receive the code?
                  </Text>
                  <Button
                    variant="link"
                    size="sm"
                    color="#4f46e5"
                    fontWeight="500"
                    onClick={handleSendResetOtp}
                    isDisabled={forgotPasswordLoading}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Resend
                  </Button>
                </HStack>

                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FaArrowLeft />}
                  onClick={() => setForgotPasswordStep('email')}
                  color="gray.500"
                  _hover={{ color: "#4f46e5", bg: "blue.50" }}
                  isDisabled={forgotPasswordLoading}
                >
                  Change email
                </Button>
              </VStack>
            )}

            {/* Step 3: New Password */}
            {forgotPasswordStep === 'newPassword' && (
              <VStack spacing={5}>
                <Flex
                  w="64px"
                  h="64px"
                  borderRadius="full"
                  bg="blue.50"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaLock} boxSize={6} color="#4f46e5" />
                </Flex>

                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="500"
                    color="gray.600"
                    mb={2}
                  >
                    New Password
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement h="50px">
                      <Icon as={FaLock} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: "blue.200" }}
                      _focus={{
                        borderColor: "#4f46e5",
                        boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.15)"
                      }}
                      bg="white"
                      fontSize="md"
                      h="50px"
                    />
                    <InputRightElement h="50px">
                      <IconButton
                        variant="ghost"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                        icon={<Icon as={showNewPassword ? FaEyeSlash : FaEye} />}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        color="gray.400"
                        _hover={{ color: "gray.600", bg: "transparent" }}
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel
                    fontSize="sm"
                    fontWeight="500"
                    color="gray.600"
                    mb={2}
                  >
                    Confirm New Password
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement h="50px">
                      <Icon as={FaLock} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type={showConfirmNewPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: "blue.200" }}
                      _focus={{
                        borderColor: "#4f46e5",
                        boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.15)"
                      }}
                      bg="white"
                      fontSize="md"
                      h="50px"
                    />
                    <InputRightElement h="50px">
                      <IconButton
                        variant="ghost"
                        aria-label={showConfirmNewPassword ? "Hide password" : "Show password"}
                        icon={<Icon as={showConfirmNewPassword ? FaEyeSlash : FaEye} />}
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        color="gray.400"
                        _hover={{ color: "gray.600", bg: "transparent" }}
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                  {newPassword && newPassword.length < 6 && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      Password must be at least 6 characters
                    </Text>
                  )}
                  {confirmNewPassword && newPassword !== confirmNewPassword && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      Passwords do not match
                    </Text>
                  )}
                </FormControl>

                <Button
                  w="full"
                  size="lg"
                  bg="#4f46e5"
                  color="white"
                  _hover={{
                    bg: "#4338ca",
                    transform: "translateY(-1px)",
                    boxShadow: "0 10px 25px rgba(79, 70, 229, 0.25)"
                  }}
                  _active={{ transform: "translateY(0)" }}
                  isLoading={forgotPasswordLoading}
                  loadingText="Resetting..."
                  onClick={handleResetPassword}
                  borderRadius="md"
                  fontSize="md"
                  fontWeight="600"
                  h="50px"
                  transition="all 0.2s ease"
                  isDisabled={!newPassword || newPassword.length < 6 || newPassword !== confirmNewPassword}
                >
                  Reset Password
                </Button>
              </VStack>
            )}

            {/* Step 4: Success */}
            {forgotPasswordStep === 'success' && (
              <VStack spacing={6} py={4}>
                <Flex
                  w="80px"
                  h="80px"
                  borderRadius="full"
                  bg="green.50"
                  align="center"
                  justify="center"
                >
                  <Icon as={CheckCircleIcon} boxSize={10} color="green.500" />
                </Flex>

                <VStack spacing={2}>
                  <Heading size="md" fontWeight="700" color="#0f172a" textAlign="center">
                    Password Reset Successful!
                  </Heading>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Your password has been changed successfully. You can now login with your new password.
                  </Text>
                </VStack>

                <Button
                  w="full"
                  size="lg"
                  bg="#4f46e5"
                  color="white"
                  _hover={{
                    bg: "#4338ca",
                    transform: "translateY(-1px)",
                    boxShadow: "0 10px 25px rgba(79, 70, 229, 0.25)"
                  }}
                  _active={{ transform: "translateY(0)" }}
                  onClick={handleCloseForgotPassword}
                  borderRadius="md"
                  fontSize="md"
                  fontWeight="600"
                  h="50px"
                  transition="all 0.2s ease"
                >
                  Back to Login
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Login;
