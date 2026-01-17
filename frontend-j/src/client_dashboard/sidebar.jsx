// import React, { useState } from 'react';
// import {
//   Box,
//   VStack,
//   HStack,
//   Text,
//   Icon,
//   useColorModeValue,
//   Badge,
//   Button,
//   Avatar,
//   Progress,
//   Tooltip,
//   Collapse,
// } from '@chakra-ui/react';
// import {
//   FiHome,
//   FiBarChart,
//   FiCalendar,
//   FiSettings,
//   FiUser,
//   FiFileText,
//   FiTrendingUp,
//   FiStar,
//   FiAward,
//   FiTarget,
//   FiUsers,
//   FiChevronDown,
//   FiChevronRight,
//   FiPlus,
//   FiHeart,
//   FiHelpCircle,
// } from 'react-icons/fi';

// const Sidebar = () => {
//   const [activeItem, setActiveItem] = useState('dashboard');
//   const [expandedItems, setExpandedItems] = useState(new Set(['analytics']));

//   const bgGradient = useColorModeValue(
//     'linear(to-b, gray.900, blue.900, purple.900)',
//     'linear(to-b, black, gray.900, blue.900)'
//   );
//   const textColor = useColorModeValue('gray.400', 'gray.300');
//   const activeColor = useColorModeValue('brand.400', 'brand.300');
//   const borderColor = useColorModeValue('gray.700', 'gray.600');

//   const menuItems = [
//     {
//       id: 'dashboard',
//       icon: FiHome,
//       label: 'Dashboard',
//       type: 'single'
//     },
//     {
//       id: 'analytics',
//       icon: FiBarChart,
//       label: 'Analytics',
//       badge: 'New',
//       type: 'dropdown',
//       subItems: [
//         { icon: FiTrendingUp, label: 'Performance' },
//         { icon: FiBarChart, label: 'Reports' },
//         { icon: FiTrendingUp, label: 'Real-time' },
//       ]
//     },
//     {
//       id: 'campaigns',
//       icon: FiTarget,
//       label: 'Campaigns',
//       badge: '12',
//       type: 'single'
//     },
//     {
//       id: 'leads',
//       icon: FiUsers,
//       label: 'Lead Management',
//       badge: '24',
//       type: 'single'
//     },
//     {
//       id: 'calendar',
//       icon: FiCalendar,
//       label: 'Calendar',
//       type: 'single'
//     },
//     {
//       id: 'reports',
//       icon: FiFileText,
//       label: 'Reports',
//       type: 'single'
//     },
//     {
//       id: 'profile',
//       icon: FiUser,
//       label: 'Profile',
//       type: 'single'
//     },
//     {
//       id: 'settings',
//       icon: FiSettings,
//       label: 'Settings',
//       type: 'single'
//     },
//   ];

//   const toggleDropdown = (itemId) => {
//     setExpandedItems(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(itemId)) {
//         newSet.delete(itemId);
//       } else {
//         newSet.add(itemId);
//       }
//       return newSet;
//     });
//   };

//   const handleItemClick = (itemId) => {
//     setActiveItem(itemId);
//   };

//   return (
//     <Box
//       position="fixed"
//       left={0}
//       top={0}
//       h="100vh"
//       w="300px"
//       bgGradient={bgGradient}
//       borderRight="1px"
//       borderColor={borderColor}
//       zIndex={1000}
//       overflow="hidden"
//       _before={{
//         content: '""',
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         bgImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)',
//         zIndex: 0
//       }}
//     >
//       {/* Enhanced Header */}
//       <Box p={6} borderBottom="1px" borderColor={borderColor} position="relative" zIndex={1}>
//         <VStack spacing={4} align="center">
//           {/* Animated Logo */}
//           <Box
//             position="relative"
//             _hover={{ transform: 'scale(1.1) rotate(5deg)' }}
//             transition="all 0.3s ease"
//           >
//             <Box
//               w={16}
//               h={16}
//               bgGradient="linear(to-br, blue.400, purple.500, pink.500)"
//               borderRadius="3xl"
//               display="flex"
//               alignItems="center"
//               justifyContent="center"
//               boxShadow="0 12px 40px rgba(99, 102, 241, 0.4)"
//               position="relative"
//             >
//               <Text fontSize="2xl" fontWeight="bold" color="white">
//                 C
//               </Text>
//             </Box>
//           </Box>
          
//           <VStack spacing={2} align="center">
//             <Text fontSize="xl" fontWeight="bold" color="white">
//               ClientHub
//             </Text>
//             <Text fontSize="sm" color="gray.400" textAlign="center">
//               Premium Dashboard
//             </Text>
//           </VStack>

//           {/* User Stats */}
//           <Box
//             bg="rgba(255, 255, 255, 0.1)"
//             borderRadius="xl"
//             p={4}
//             w="full"
//             backdropFilter="blur(10px)"
//             border="1px solid"
//             borderColor="rgba(255, 255, 255, 0.2)"
//           >
//             <VStack spacing={3} align="center">
//               <Avatar
//                 size="md"
//                 name="Client User"
//                 src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
//                 border="3px solid"
//                 borderColor="white"
//                 boxShadow="0 4px 15px rgba(0, 0, 0, 0.2)"
//               />
//               <VStack spacing={1} align="center">
//                 <Text fontSize="sm" fontWeight="bold" color="white">
//                   Client User
//                 </Text>
//                 <HStack spacing={2}>
//                   <Badge colorScheme="purple" variant="subtle" size="sm">
//                     <Icon as={FiStar} mr={1} />
//                     VIP
//                   </Badge>
//                   <Badge colorScheme="green" variant="subtle" size="sm">
//                     <Icon as={FiAward} mr={1} />
//                     Top
//                   </Badge>
//                 </HStack>
//               </VStack>
              
//               {/* Progress Bar */}
//               <Box w="full">
//                 <HStack justify="space-between" mb={2}>
//                   <Text fontSize="xs" color="gray.400">Level Progress</Text>
//                   <Text fontSize="xs" color="white" fontWeight="bold">78%</Text>
//                 </HStack>
//                 <Progress
//                   value={78}
//                   size="sm"
//                   borderRadius="full"
//                   bg="rgba(255, 255, 255, 0.1)"
//                   sx={{
//                     '& > div': {
//                       background: 'linear-gradient(90deg, #48BB78, #38B2AC)',
//                     }
//                   }}
//                 />
//               </Box>
//             </VStack>
//           </Box>
//         </VStack>
//       </Box>

//       {/* Create New Button */}
//       <Box p={4} position="relative" zIndex={1}>
//         <Button
//           leftIcon={<FiPlus />}
//           w="full"
//           bgGradient="linear(to-r, green.400, blue.500)"
//           color="white"
//           size="md"
//           borderRadius="xl"
//           _hover={{
//             bgGradient: 'linear(to-r, green.500, blue.600)',
//             transform: 'translateY(-2px)',
//             boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
//           }}
//           _active={{
//             transform: 'translateY(0)'
//           }}
//           transition="all 0.2s ease"
//           boxShadow="0 4px 15px rgba(0, 0, 0, 0.2)"
//         >
//           Create New
//         </Button>
//       </Box>

//       {/* Navigation Menu */}
//       <VStack spacing={1} p={4} align="stretch" flex={1} overflowY="auto" position="relative" zIndex={1}>
//         {menuItems.map((item) => {
//           const isActive = activeItem === item.id;
//           const isExpanded = expandedItems.has(item.id);

//           if (item.type === 'dropdown') {
//             return (
//               <Box key={item.id}>
//                 {/* Main Dropdown Item */}
//                 <Box
//                   as="button"
//                   w="100%"
//                   p={3}
//                   borderRadius="xl"
//                   bg={isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent'}
//                   color={isActive ? 'white' : textColor}
//                   _hover={{
//                     bg: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
//                     transform: 'translateX(4px)',
//                     '& svg': {
//                       color: activeColor
//                     }
//                   }}
//                   transition="all 0.2s ease"
//                   onClick={() => toggleDropdown(item.id)}
//                   position="relative"
//                   border="1px solid"
//                   borderColor={isActive ? 'rgba(255, 255, 255, 0.3)' : 'transparent'}
//                 >
//                   <HStack spacing={3} justify="space-between" align="center">
//                     <HStack spacing={3} align="center">
//                       <Icon 
//                         as={item.icon} 
//                         boxSize={5} 
//                         color={isActive ? activeColor : textColor} 
//                         flexShrink={0}
//                       />
//                       <Text 
//                         fontWeight={isActive ? 'bold' : 'normal'} 
//                         textAlign="left"
//                         fontSize="sm"
//                       >
//                         {item.label}
//                       </Text>
//                       {item.badge && (
//                         <Badge
//                           colorScheme={item.badge === 'New' ? 'green' : 'blue'}
//                           variant="solid"
//                           size="sm"
//                           borderRadius="full"
//                           fontSize="xs"
//                           px={2}
//                           py={1}
//                         >
//                           {item.badge}
//                         </Badge>
//                       )}
//                     </HStack>
                    
//                     {/* Dropdown Arrow */}
//                     <Icon 
//                       as={isExpanded ? FiChevronDown : FiChevronRight} 
//                       boxSize={4} 
//                       color={isActive ? activeColor : textColor}
//                       transition="transform 0.2s ease"
//                     />
//                   </HStack>
                  
//                   {/* Active Indicator */}
//                   {isActive && (
//                     <Box
//                       position="absolute"
//                       left={0}
//                       top="50%"
//                       transform="translateY(-50%)"
//                       w="4px"
//                       h="60%"
//                       bgGradient="linear(to-b, blue.400, purple.500)"
//                       borderRadius="0 4px 4px 0"
//                       boxShadow="0 0 10px rgba(99, 102, 241, 0.5)"
//                     />
//                   )}
//                 </Box>

//                 {/* Dropdown Sub-items */}
//                 <Collapse in={isExpanded} animateOpacity>
//                   <VStack spacing={1} align="stretch" pl={6} mt={1}>
//                     {item.subItems.map((subItem, idx) => (
//                       <Box
//                         key={idx}
//                         as="button"
//                         w="100%"
//                         p={2}
//                         borderRadius="lg"
//                         bg="transparent"
//                         color="gray.400"
//                         _hover={{
//                           bg: 'rgba(255, 255, 255, 0.1)',
//                           color: 'white',
//                           transform: 'translateX(4px)',
//                           '& svg': {
//                             color: activeColor
//                           }
//                         }}
//                         transition="all 0.2s ease"
//                         position="relative"
//                       >
//                         <HStack spacing={3} align="center">
//                           <Icon 
//                             as={subItem.icon} 
//                             boxSize={4} 
//                             color="gray.500" 
//                             flexShrink={0}
//                           />
//                           <Text fontSize="xs">{subItem.label}</Text>
//                         </HStack>
//                       </Box>
//                     ))}
//                   </VStack>
//                 </Collapse>
//               </Box>
//             );
//           }

//           // Single Menu Item
//           return (
//             <Box
//               key={item.id}
//               as="button"
//               w="100%"
//               p={3}
//               borderRadius="xl"
//               bg={isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent'}
//               color={isActive ? 'white' : textColor}
//               _hover={{
//                 bg: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
//                 transform: 'translateX(4px)',
//                 '& svg': {
//                   color: activeColor
//                 }
//               }}
//               transition="all 0.2s ease"
//               onClick={() => handleItemClick(item.id)}
//               position="relative"
//               border="1px solid"
//               borderColor={isActive ? 'rgba(255, 255, 255, 0.3)' : 'transparent'}
//             >
//               <HStack spacing={3} justify="space-between" align="center">
//                 <HStack spacing={3} align="center">
//                   <Icon 
//                     as={item.icon} 
//                     boxSize={5} 
//                     color={isActive ? activeColor : textColor} 
//                     flexShrink={0}
//                   />
//                   <Text 
//                     fontWeight={isActive ? 'bold' : 'normal'} 
//                     textAlign="left"
//                     fontSize="sm"
//                   >
//                     {item.label}
//                   </Text>
//                   {item.badge && (
//                     <Badge
//                       colorScheme={item.badge === 'New' ? 'green' : 'blue'}
//                       variant="solid"
//                       size="sm"
//                       borderRadius="full"
//                       fontSize="xs"
//                       px={2}
//                       py={1}
//                     >
//                       {item.badge}
//                     </Badge>
//                   )}
//                 </HStack>
//               </HStack>
              
//               {/* Active Indicator */}
//               {isActive && (
//                 <Box
//                   position="absolute"
//                   left={0}
//                   top="50%"
//                   transform="translateY(-50%)"
//                   w="4px"
//                   h="60%"
//                   bgGradient="linear(to-b, blue.400, purple.500)"
//                   borderRadius="0 4px 4px 0"
//                   boxShadow="0 0 10px rgba(99, 102, 241, 0.5)"
//                 />
//               )}
//             </Box>
//           );
//         })}
//       </VStack>

//       {/* Bottom Section */}
//       <Box p={4} borderTop="1px" borderColor={borderColor} position="relative" zIndex={1}>
//         <VStack spacing={3}>
//           {/* Quick Stats */}
//           <Box
//             bg="rgba(255, 255, 255, 0.1)"
//             borderRadius="xl"
//             p={3}
//             w="full"
//             backdropFilter="blur(10px)"
//             border="1px solid"
//             borderColor="rgba(255, 255, 255, 0.2)"
//           >
//             <VStack spacing={2} align="center">
//               <HStack spacing={2}>
//                 <Icon as={FiHeart} color="red.400" />
//                 <Text fontSize="xs" color="white" fontWeight="bold">
//                   Premium Plan
//                 </Text>
//               </HStack>
//               <Text fontSize="xs" color="gray.400" textAlign="center">
//                 Next billing: Dec 15
//               </Text>
//             </VStack>
//           </Box>

//           {/* Support Button */}
//           <Button
//             leftIcon={<FiHelpCircle />}
//             variant="ghost"
//             size="sm"
//             color="gray.400"
//             w="full"
//             borderRadius="lg"
//             _hover={{
//               bg: 'rgba(255, 255, 255, 0.1)',
//               color: 'white'
//             }}
//             transition="all 0.2s ease"
//           >
//             Get Help
//           </Button>
//         </VStack>
//       </Box>
//     </Box>
//   );
// };

// export default Sidebar;
import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Icon,
  Flex,
  Button,
  Badge,
  Divider,
  Avatar,
  HStack,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import {
  MdDashboard,
  MdAnalytics,
  MdPeople,
  MdShoppingCart,
  MdSettings,
  MdNotifications,
  MdHelp,
  MdTrendingUp,
  MdAccountBalance,
  MdCampaign,
} from 'react-icons/md';
import { FiPlus, FiStar } from 'react-icons/fi';

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const bgGradient = useColorModeValue(
    'linear(to-br, rgba(240, 249, 240, 0.9), rgba(198, 246, 198, 0.6))',
    'linear(to-br, rgba(26, 32, 44, 0.9), rgba(45, 55, 72, 0.6))'
  );

  const menuItems = [
    { name: 'Dashboard', icon: MdDashboard, badge: null, color: 'blue.500' },
    { name: 'Analytics', icon: MdAnalytics, badge: 'New', color: 'purple.500' },
    { name: 'Customers', icon: MdPeople, badge: '127', color: 'green.500' },
    { name: 'Orders', icon: MdShoppingCart, badge: '23', color: 'orange.500' },
    { name: 'Revenue', icon: MdAccountBalance, badge: null, color: 'teal.500' },
    { name: 'Campaigns', icon: MdCampaign, badge: '5', color: 'pink.500' },
    { name: 'Growth', icon: MdTrendingUp, badge: 'Hot', color: 'red.500' },
  ];

  const bottomItems = [
    { name: 'Settings', icon: MdSettings, color: 'gray.500' },
    { name: 'Help', icon: MdHelp, color: 'gray.500' },
  ];

  return (
    <Box
      w="280px"
      h="100vh"
      bgGradient={bgGradient}
      backdropFilter="blur(20px)"
      borderRight="1px solid rgba(0, 0, 0, 0.05)"
      position="relative"
      overflow="hidden"
    >
      {/* Decorative Elements */}
      <Box
        position="absolute"
        top="-50px"
        right="-50px"
        w="100px"
        h="100px"
        bg="brand.200"
        borderRadius="full"
        opacity={0.3}
        filter="blur(40px)"
      />
      <Box
        position="absolute"
        bottom="100px"
        left="-30px"
        w="80px"
        h="80px"
        bg="brand.300"
        borderRadius="full"
        opacity={0.2}
        filter="blur(30px)"
      />

      <Box p={6} position="relative" zIndex={1}>
        {/* Logo Section */}
        <Box mb={8}>
          <HStack spacing={3} mb={2}>
            <Box
              w="40px"
              h="40px"
              bgGradient="linear(135deg, brand.400, brand.600)"
              borderRadius="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 8px 20px rgba(30, 230, 30, 0.3)"
            >
              <Icon as={FiStar} color="white" boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="xl" fontWeight="black" color="gray.800">
                ClientPro
              </Text>
              <Text fontSize="xs" color="brand.600" fontWeight="medium">
                Premium Dashboard
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Create Button - Premium */}
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          size="lg"
          borderRadius="xl"
          w="full"
          mb={6}
          h="50px"
          fontWeight="bold"
          bgGradient="linear(135deg, brand.400, brand.600)"
          _hover={{
            bgGradient: "linear(135deg, brand.500, brand.700)",
            transform: "translateY(-2px)",
            boxShadow: "0 12px 30px rgba(30, 230, 30, 0.4)"
          }}
          transition="all 0.3s ease"
          boxShadow="0 8px 20px rgba(30, 230, 30, 0.2)"
        >
          Create New
        </Button>

        {/* Main Menu Items */}
        <VStack spacing={2} align="stretch" mb={6}>
          {menuItems.map((item, index) => (
            <Tooltip key={index} label={item.name} placement="right" hasArrow>
              <Flex
                align="center"
                p={4}
                borderRadius="xl"
                cursor="pointer"
                bg={activeItem === item.name ? 'rgba(255, 255, 255, 0.9)' : 'transparent'}
                color={activeItem === item.name ? item.color : 'gray.600'}
                fontWeight={activeItem === item.name ? 'bold' : 'medium'}
                boxShadow={activeItem === item.name ? '0 8px 25px rgba(0, 0, 0, 0.1)' : 'none'}
                _hover={{
                  bg: activeItem === item.name ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)',
                  transform: 'translateX(5px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                }}
                transition="all 0.3s ease"
                onClick={() => setActiveItem(item.name)}
                position="relative"
                overflow="hidden"
              >
                {/* Active Indicator */}
                {activeItem === item.name && (
                  <Box
                    position="absolute"
                    left={0}
                    top={0}
                    bottom={0}
                    w="4px"
                    bg={item.color}
                    borderRadius="0 4px 4px 0"
                  />
                )}
                
                <Icon as={item.icon} boxSize={5} mr={3} />
                <Text fontSize="sm" flex={1}>{item.name}</Text>
                
                {item.badge && (
                  <Badge
                    colorScheme={item.badge === 'New' || item.badge === 'Hot' ? 'red' : 'brand'}
                    borderRadius="full"
                    fontSize="xs"
                    px={2}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Flex>
            </Tooltip>
          ))}
        </VStack>

        <Divider opacity={0.3} />

        {/* Bottom Items */}
        <VStack spacing={2} align="stretch" mt={6}>
          {bottomItems.map((item, index) => (
            <Flex
              key={index}
              align="center"
              p={3}
              borderRadius="xl"
              cursor="pointer"
              color="gray.500"
              _hover={{
                bg: 'rgba(255, 255, 255, 0.5)',
                color: 'gray.700',
                transform: 'translateX(5px)'
              }}
              transition="all 0.3s ease"
            >
              <Icon as={item.icon} boxSize={5} mr={3} />
              <Text fontSize="sm">{item.name}</Text>
            </Flex>
          ))}
        </VStack>

        {/* Premium User Card */}
        <Box
          mt={8}
          p={4}
          bg="rgba(255, 255, 255, 0.7)"
          borderRadius="xl"
          border="1px solid rgba(255, 255, 255, 0.3)"
          backdropFilter="blur(10px)"
        >
          <HStack spacing={3}>
            <Avatar
              size="sm"
              name="Alex Johnson"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            />
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="bold" color="gray.800">
                Alex Johnson
              </Text>
              <Text fontSize="xs" color="brand.600">
                Premium Plan
              </Text>
            </Box>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
