import React, { useState, useEffect } from 'react';
import { Box, useBreakpointValue } from '@chakra-ui/react';
import StaffSidebar from './StaffSidebar';
import StaffTopNav from './StaffTopNav';

const StaffMainLayout = ({ children }) => {
  const [sidebarWidth, setSidebarWidth] = useState('320px');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Check if we're on mobile
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      console.log('StaffMainLayout: Received sidebar event:', event.detail);
      
      if (event.detail) {
        if (event.detail.width) {
          // Handle width-based events
          const newWidth = event.detail.width;
          const newCollapsed = newWidth === '80px';
          
          setSidebarWidth(newWidth);
          setSidebarCollapsed(newCollapsed);
          
          console.log('StaffMainLayout: Updated sidebar width to:', newWidth);
          console.log('StaffMainLayout: Updated collapsed state to:', newCollapsed);
        } else if (event.detail.action === 'toggle') {
          // Handle action-based events
          if (event.detail.collapsed !== undefined) {
            const newCollapsed = event.detail.collapsed;
            const newWidth = newCollapsed ? '80px' : '320px';
            
            setSidebarCollapsed(newCollapsed);
            setSidebarWidth(newWidth);
            
            console.log('StaffMainLayout: Updated collapsed state to:', newCollapsed);
            console.log('StaffMainLayout: Updated width to:', newWidth);
          } else {
            // Fallback to toggle behavior
            setSidebarCollapsed(prev => {
              const newState = !prev;
              const newWidth = newState ? '80px' : '320px';
              setSidebarWidth(newWidth);
              console.log('StaffMainLayout: Toggled collapsed state to:', newState);
              return newState;
            });
          }
        }
      }
    };

    window.addEventListener('staffSidebarToggle', handleSidebarToggle);
    return () => {
      window.removeEventListener('staffSidebarToggle', handleSidebarToggle);
    };
  }, []);

  // Calculate content margin based on sidebar state
  const getContentMargin = () => {
    if (isMobile) {
      // On mobile, sidebar is overlay, so no margin needed
      return '0';
    } else {
      // On desktop, sidebar is fixed, so add margin
      return sidebarWidth;
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      {/* Sidebar */}
      <StaffSidebar />
      
      {/* Top Navigation */}
      <StaffTopNav />
      
      {/* Main Content */}
      <Box
        ml={getContentMargin()}
        pt="80px" // Account for fixed top navigation
        transition="margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        minH="calc(100vh - 80px)"
        position="relative"
        zIndex={1}
      >
        {children}
      </Box>
    </Box>
  );
};

export default StaffMainLayout;

