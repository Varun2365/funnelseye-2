import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectAuthStatus } from '../redux/authSlice';
import { Box, Spinner, Center, Text, VStack, Heading, Button } from '@chakra-ui/react';
import { getAuthHeaders } from '../services/api';

// Account Deactivated Screen Component
const AccountDeactivatedScreen = () => {

  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #000430 0%, #000214 50%, #000430 100%)"
      position="relative"
      overflow="hidden"
    >
      {/* Static Background Elements - No Animations */}
      <Box
        position="absolute"
        top="10%"
        left="10%"
        w="60px"
        h="60px"
        borderRadius="50%"
        bg="rgba(255, 255, 255, 0.08)"
        backdropFilter="blur(10px)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        opacity={0.6}
      />

      <Box
        position="absolute"
        top="30%"
        right="15%"
        w="40px"
        h="40px"
        borderRadius="50%"
        bg="rgba(255, 255, 255, 0.1)"
        backdropFilter="blur(10px)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        opacity={0.7}
      />

      <Box
        position="absolute"
        bottom="20%"
        left="20%"
        w="80px"
        h="80px"
        borderRadius="50%"
        bg="rgba(255, 255, 255, 0.06)"
        backdropFilter="blur(10px)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        opacity={0.5}
      />

      <Box
        position="absolute"
        top="60%"
        right="25%"
        w="35px"
        h="35px"
        borderRadius="50%"
        bg="rgba(255, 255, 255, 0.12)"
        backdropFilter="blur(10px)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        opacity={0.8}
      />

      <Box
        position="absolute"
        bottom="40%"
        right="10%"
        w="50px"
        h="50px"
        borderRadius="50%"
        bg="rgba(255, 255, 255, 0.09)"
        backdropFilter="blur(10px)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        opacity={0.6}
      />

      {/* Main Content */}
      <Center minH="100vh" position="relative" zIndex={1}>
        <VStack
          spacing={8}
          textAlign="center"
        >
          {/* Warning Icon */}
          <Box
            position="relative"
          >
            <Box
              w="120px"
              h="120px"
              borderRadius="full"
              bg="rgba(255, 255, 255, 0.2)"
              backdropFilter="blur(20px)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 20px 40px rgba(0, 0, 0, 0.2)"
              border="2px solid rgba(255, 255, 255, 0.3)"
            >
              <Text fontSize="4xl" color="white" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))">
                ⚠️
              </Text>
            </Box>
          </Box>

          {/* Title */}
          <Heading
            size="2xl"
            color="white"
            fontWeight="700"
            textShadow="0 4px 8px rgba(0, 0, 0, 0.3)"
          >
            Account Deactivated
          </Heading>

          {/* Description */}
          <Text
            fontSize="lg"
            color="rgba(255, 255, 255, 0.9)"
            maxW="md"
            lineHeight="1.6"
            textShadow="0 2px 4px rgba(0, 0, 0, 0.2)"
          >
            Your account has been deactivated by the admin.
            Please contact support for assistance or to reactivate your account.
          </Text>

          {/* Action Button */}
          <Button
            size="lg"
            bg="rgba(255, 255, 255, 0.2)"
            color="white"
            backdropFilter="blur(10px)"
            border="1px solid rgba(255, 255, 255, 0.3)"
            _hover={{
              bg: "rgba(255, 255, 255, 0.3)",
              transform: "translateY(-2px)",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
            }}
            _active={{
              transform: "translateY(0)",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)"
            }}
            transition="all 0.3s ease"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('account_deactivated');
              window.location.href = '/login';
            }}
            px={8}
            py={4}
            fontSize="md"
            fontWeight="600"
          >
            Return to Login
          </Button>

          {/* Additional Info */}
          <Text
            fontSize="sm"
            color="rgba(255, 255, 255, 0.7)"
          >
            Need help? Contact our support team for assistance.
          </Text>
        </VStack>
      </Center>
    </Box>
  );
};

// Account Under Review Screen Component
const AccountUnderReviewScreen = () => {
  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #000430 0%, #000214 50%, #000430 100%)"
      position="relative"
      overflow="hidden"
    >
      {/* Static Background Elements */}
      <Box
        position="absolute"
        top="10%"
        left="10%"
        w="60px"
        h="60px"
        borderRadius="50%"
        bg="rgba(255, 255, 255, 0.08)"
        backdropFilter="blur(10px)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        opacity={0.6}
      />

      <Box
        position="absolute"
        top="30%"
        right="15%"
        w="40px"
        h="40px"
        borderRadius="50%"
        bg="rgba(255, 255, 255, 0.1)"
        backdropFilter="blur(10px)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        opacity={0.7}
      />

      <Box
        position="absolute"
        bottom="20%"
        left="20%"
        w="80px"
        h="80px"
        borderRadius="50%"
        bg="rgba(255, 255, 255, 0.06)"
        backdropFilter="blur(10px)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        opacity={0.5}
      />

      <Box
        position="absolute"
        top="60%"
        right="25%"
        w="35px"
        h="35px"
        borderRadius="50%"
        bg="rgba(255, 255, 255, 0.12)"
        backdropFilter="blur(10px)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        opacity={0.8}
      />

      <Box
        position="absolute"
        bottom="40%"
        right="10%"
        w="50px"
        h="50px"
        borderRadius="50%"
        bg="rgba(255, 255, 255, 0.09)"
        backdropFilter="blur(10px)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        opacity={0.6}
      />

      {/* Main Content */}
      <Center minH="100vh" position="relative" zIndex={1}>
        <VStack
          spacing={8}
          textAlign="center"
        >
          {/* Clock Icon */}
          <Box
            position="relative"
          >
            <Box
              w="120px"
              h="120px"
              borderRadius="full"
              bg="rgba(255, 255, 255, 0.2)"
              backdropFilter="blur(20px)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 20px 40px rgba(0, 0, 0, 0.2)"
              border="2px solid rgba(255, 255, 255, 0.3)"
            >
              <Text fontSize="4xl" color="white" filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))">
                ⏳
              </Text>
            </Box>
          </Box>

          {/* Title */}
          <Heading
            size="2xl"
            color="white"
            fontWeight="700"
            textShadow="0 4px 8px rgba(0, 0, 0, 0.3)"
          >
            Account Under Review
          </Heading>

          {/* Description */}
          <Text
            fontSize="lg"
            color="rgba(255, 255, 255, 0.9)"
            maxW="md"
            lineHeight="1.6"
            textShadow="0 2px 4px rgba(0, 0, 0, 0.2)"
          >
            Your account is being held for review by our admin team.
            Please wait for approval before accessing your dashboard.
          </Text>

          {/* Additional Info */}
          <Text
            fontSize="sm"
            color="rgba(255, 255, 255, 0.7)"
          >
            This process usually takes 24-48 hours. You'll receive access once approved.
          </Text>
        </VStack>
      </Center>
    </Box>
  );
};

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectAuthStatus);
  const staffToken = useSelector((state) => state.staff?.token);
  const staffIsAuthenticated = useSelector((state) => state.staff?.isAuthenticated);
  const [isAccountDeactivated, setIsAccountDeactivated] = useState(false);
  const [isAccountUnderReview, setIsAccountUnderReview] = useState(false);

  console.log('🔒 ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('🔒 ProtectedRoute - staffToken:', staffToken);
  console.log('🔒 ProtectedRoute - staffIsAuthenticated:', staffIsAuthenticated);

  // Check if either main auth or staff auth is valid
  const isAnyAuthenticated = isAuthenticated || !!staffToken || staffIsAuthenticated;

  console.log('🔒 ProtectedRoute - isAnyAuthenticated:', isAnyAuthenticated);

  // Verify account status when deactivation flag is detected
  useEffect(() => {
    const verifyAccountStatus = async () => {
      const storedDeactivation = localStorage.getItem('account_deactivated');
      if (storedDeactivation === 'true' && isAnyAuthenticated && !staffIsAuthenticated) {
        try {
          // Make a lightweight API call to verify account status
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/auth/me`, {
            method: 'GET',
            headers: getAuthHeaders(),
          });

          if (response.ok) {
            // Account is active, clear the deactivation flag
            console.log('✅ Account verification successful - clearing deactivation flag');
            localStorage.removeItem('account_deactivated');
            setIsAccountDeactivated(false);
          } else {
            // Account is still deactivated
            console.log('🚫 Account verification failed - account still deactivated');
            setIsAccountDeactivated(true);
          }
        } catch (error) {
          console.warn('⚠️ Account verification failed:', error);
          // Keep the deactivation state as a fallback
        }
      }
    };

    if (isAnyAuthenticated !== null) {
      verifyAccountStatus();
    }
  }, [isAnyAuthenticated, staffIsAuthenticated]);

  // Global error handler for account deactivation and under review
  useEffect(() => {
    const handleApiErrors = (event) => {
      if (event.detail && event.detail.code === 'ACCOUNT_DEACTIVATED') {
        setIsAccountDeactivated(true);
        setIsAccountUnderReview(false);
        localStorage.setItem('account_deactivated', 'true');
        localStorage.removeItem('account_under_review');
      } else if (event.detail && event.detail.code === 'ACCOUNT_UNDER_REVIEW') {
        setIsAccountUnderReview(true);
        setIsAccountDeactivated(false);
        localStorage.setItem('account_under_review', 'true');
        localStorage.removeItem('account_deactivated');
      }
    };

    // Listen for successful API calls (account reactivation)
    const handleApiSuccess = () => {
      if (isAccountDeactivated) {
        setIsAccountDeactivated(false);
        localStorage.removeItem('account_deactivated');
      }
    };

    // Listen for custom events
    window.addEventListener('api-error', handleApiErrors);
    window.addEventListener('api-success', handleApiSuccess);

    // Check for stored states on component mount
    const storedDeactivation = localStorage.getItem('account_deactivated');
    const storedUnderReview = localStorage.getItem('account_under_review');

    if (storedDeactivation === 'true') {
      setIsAccountDeactivated(true);
      setIsAccountUnderReview(false);
    } else if (storedUnderReview === 'true') {
      setIsAccountUnderReview(true);
      setIsAccountDeactivated(false);
    }

    return () => {
      window.removeEventListener('api-error', handleApiErrors);
      window.removeEventListener('api-success', handleApiSuccess);
    };
  }, [isAccountDeactivated]);

  if (isAuthenticated === null && !staffToken && !staffIsAuthenticated) {
    return (
      <Center minH="100vh">
        <Box textAlign="center">
          <Spinner size="xl" color="brand.500" mb={4} />
          <Text>Loading...</Text>
        </Box>
      </Center>
    );
  }

  if (!isAnyAuthenticated) {
    console.log('🔒 ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if account is under review
  if (isAccountUnderReview) {
    return <AccountUnderReviewScreen />;
  }

  // Check if account is deactivated
  if (isAccountDeactivated) {
    return <AccountDeactivatedScreen />;
  }

  console.log('🔒 ProtectedRoute - Authenticated, rendering children');
  return children;
};

export default ProtectedRoute;
