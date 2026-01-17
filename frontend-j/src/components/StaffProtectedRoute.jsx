import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Box, Spinner, Center, Text } from '@chakra-ui/react';

const StaffProtectedRoute = ({ children }) => {
  const staffToken = useSelector((state) => state.staff?.token);
  const isStaffAuthenticated = !!staffToken;
  
  console.log('🔒 StaffProtectedRoute - staffToken:', staffToken);
  console.log('🔒 StaffProtectedRoute - isStaffAuthenticated:', isStaffAuthenticated);
  console.log('🔒 StaffProtectedRoute - Redux state:', useSelector((state) => state));

  if (isStaffAuthenticated === null) {
    return (
      <Center minH="100vh">
        <Box textAlign="center">
          <Spinner size="xl" color="brand.500" mb={4} />
          <Text>Loading staff authentication...</Text>
        </Box>
      </Center>
    );
  }

  if (!isStaffAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default StaffProtectedRoute;
