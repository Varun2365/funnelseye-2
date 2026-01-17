import { useToast as originalUseToast } from '@chakra-ui/react';
import { useCallback, useEffect } from 'react';

// Global toast blocker - runs immediately when module loads
const isAccountDeactivated = typeof window !== 'undefined' && localStorage.getItem('account_deactivated') === 'true';
const isAccountUnderReview = typeof window !== 'undefined' && localStorage.getItem('account_under_review') === 'true';

if (isAccountDeactivated || isAccountUnderReview) {
  // Override the global toast function immediately
  if (typeof window !== 'undefined') {
    window.originalToast = window.toast;
    window.toast = () => {
      console.log('Global toast blocked: Account is deactivated or under review');
    };
  }
}
import {
  Box,
  Text,
  VStack,
  IconButton,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  WarningIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import { CloseIcon } from '@chakra-ui/icons';

/**
 * Custom toast hook with consistent styling across the app
 * All toasts will have:
 * - Fixed width: 400px
 * - Fixed height: auto (but consistent padding)
 * - Position: top-right
 * - Same styling as calendar section
 * - Blocked when account is deactivated
 */
// Create a blocked toast function
const createBlockedToast = () => ({
  success: () => console.log('Toast blocked: Account is deactivated'),
  error: () => console.log('Toast blocked: Account is deactivated'),
  warning: () => console.log('Toast blocked: Account is deactivated'),
  info: () => console.log('Toast blocked: Account is deactivated'),
  close: () => console.log('Toast close blocked: Account is deactivated'),
  closeAll: () => console.log('Toast closeAll blocked: Account is deactivated'),
  isActive: () => false,
});

export const useCustomToast = () => {
  const toast = useToast();

  return useCallback((message, status = 'info', options = {}) => {
    // Block all toasts when account is deactivated or under review
    const isAccountDeactivated = typeof window !== 'undefined' && localStorage.getItem('account_deactivated') === 'true';
    const isAccountUnderReview = typeof window !== 'undefined' && localStorage.getItem('account_under_review') === 'true';
    if (isAccountDeactivated || isAccountUnderReview) {
      console.log('Toast blocked: Account is deactivated or under review');
      return;
    }
    const statusConfig = {
      success: {
        title: options.title || 'Success',
        bg: 'white',
        borderColor: 'green.200',
        iconColor: 'green.500',
        titleColor: 'green.700',
        textColor: 'gray.700',
        icon: CheckCircleIcon
      },
      error: {
        title: options.title || 'Error',
        bg: 'white',
        borderColor: 'red.200',
        iconColor: 'red.500',
        titleColor: 'red.700',
        textColor: 'gray.700',
        icon: WarningIcon
      },
      warning: {
        title: options.title || 'Warning',
        bg: 'white',
        borderColor: 'orange.200',
        iconColor: 'orange.500',
        titleColor: 'orange.700',
        textColor: 'gray.700',
        icon: WarningIcon
      },
      info: {
        title: options.title || 'Info',
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
      title: config.title,
      description: message,
      status,
      duration: options.duration || 4000,
      isClosable: true,
      position: 'top-right',
      variant: 'subtle',
      containerStyle: {
        maxWidth: '400px',
      },
      render: ({ title, description, onClose }) => (
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
          minW="400px"
          maxW="400px"
          w="400px"
          minH="80px"
          h="auto"
        >
          <Box
            as={IconComponent}
            color={config.iconColor}
            boxSize={5}
            mt={0.5}
            flexShrink={0}
          />
          <VStack align="start" spacing={1} flex={1} minH="48px">
            <Text
              fontSize="sm"
              fontWeight="600"
              color={config.titleColor}
            >
              {title}
            </Text>
            <Text
              fontSize="sm"
              color={config.textColor}
              lineHeight="1.5"
              wordBreak="break-word"
            >
              {description}
            </Text>
          </VStack>
          <IconButton
            aria-label="Close"
            icon={<CloseIcon />}
            size="xs"
            variant="ghost"
            onClick={onClose}
            color="gray.400"
            _hover={{ color: 'gray.600', bg: 'gray.50' }}
            borderRadius="7px"
            flexShrink={0}
          />
        </Box>
      ),
    });
  }, [toast]);
};

// Custom useToast that blocks when account is deactivated or under review
export const useToast = () => {
  const originalToast = originalUseToast();

  // Check if account is deactivated or under review
  const isAccountDeactivated = typeof window !== 'undefined' && localStorage.getItem('account_deactivated') === 'true';
  const isAccountUnderReview = typeof window !== 'undefined' && localStorage.getItem('account_under_review') === 'true';

  if (isAccountDeactivated || isAccountUnderReview) {
    return createBlockedToast();
  }

  return originalToast;
};

/**
 * Global toast blocker for deactivated accounts
 * This hook can be used to completely disable all toasts when account is deactivated
 */
export const useBlockedToast = () => {
  const originalToast = originalUseToast();

  useEffect(() => {
    const isAccountDeactivated = localStorage.getItem('account_deactivated') === 'true';
    const isAccountUnderReview = localStorage.getItem('account_under_review') === 'true';

    if (isAccountDeactivated || isAccountUnderReview) {
      // Override the global toast function
      const originalToastFn = window.toast;
      window.toast = () => {
        console.log('Global toast blocked: Account is deactivated or under review');
      };

      return () => {
        // Restore original functions
        window.toast = originalToastFn;
      };
    }
  }, [originalToast]);

  // Return a no-op function when deactivated or under review
  const isAccountDeactivated = localStorage.getItem('account_deactivated') === 'true';
  const isAccountUnderReview = localStorage.getItem('account_under_review') === 'true';
  if (isAccountDeactivated || isAccountUnderReview) {
    return createBlockedToast();
  }

  return originalToast;
};
