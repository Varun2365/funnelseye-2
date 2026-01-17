// import React, { useState } from 'react';
// import {
//   Box,
//   Flex,
//   HStack,
//   Text,
//   Avatar,
//   Menu,
//   MenuButton,
//   MenuList,
//   MenuItem,
//   MenuDivider,
//   IconButton,
//   useColorModeValue,
//   Badge,
//   Input,
//   InputGroup,
//   InputLeftElement,
//   Button,
//   VStack,
//   useDisclosure,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   ModalCloseButton,
//   FormControl,
//   FormLabel,
//   Select,
//   Textarea,
//   useToast,
//   Tooltip,
//   Divider,
//   Icon,
// } from '@chakra-ui/react';
// import {
//   FiBell,
//   FiSearch,
//   FiSettings,
//   FiUser,
//   FiLogOut,
//   FiPlus,
//   FiMessageCircle,
//   FiHelpCircle,
//   FiSun,
//   FiMoon,
//   FiTrendingUp,
//   FiZap,
//   FiStar,
//   FiGift,
//   FiAward,
// } from 'react-icons/fi';

// const Topbar = () => {
//   const [notifications] = useState([
//     { id: 1, message: 'New campaign performance report ready', time: '2 min ago', type: 'success' },
//     { id: 2, message: 'Lead conversion rate increased by 15%', time: '1 hour ago', type: 'info' },
//     { id: 3, message: 'Weekly analytics summary available', time: '3 hours ago', type: 'warning' },
//   ]);

//   const [unreadCount] = useState(3);
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const toast = useToast();

//   const bgGradient = useColorModeValue(
//     'linear(to-r, blue.50, purple.50, pink.50)',
//     'linear(to-r, gray.900, blue.900, purple.900)'
//   );
//   const cardBg = useColorModeValue('white', 'gray.800');
//   const borderColor = useColorModeValue('gray.200', 'gray.700');
//   const textColor = useColorModeValue('gray.700', 'gray.100');
//   const mutedColor = useColorModeValue('gray.500', 'gray.400');

//   const handleQuickAction = () => {
//     onOpen();
//   };

//   const handleSubmitQuickAction = () => {
//     toast({
//       title: 'Action Created!',
//       description: 'Your quick action has been successfully created.',
//       status: 'success',
//       duration: 3000,
//       isClosable: true,
//       position: 'top-right',
//     });
//     onClose();
//   };

//   return (
//     <>
//       <Box
//         h="90px"
//         bgGradient={bgGradient}
//         borderBottom="1px"
//         borderColor={borderColor}
//         px={8}
//         position="sticky"
//         top={0}
//         zIndex={100}
//         _before={{
//           content: '""',
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           bgImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)',
//           zIndex: 0
//         }}
//       >
//         <Flex h="100%" align="center" justify="space-between" position="relative" zIndex={1}>
//           {/* Left Section - Enhanced Header */}
//           <Box>
//             <HStack spacing={4} align="center">
//               {/* Animated Logo */}
//               <Box
//                 position="relative"
//                 _hover={{ transform: 'scale(1.1) rotate(5deg)' }}
//                 transition="all 0.3s ease"
//               >
//                 <Box
//                   w={12}
//                   h={12}
//                   bgGradient="linear(to-br, blue.400, purple.500, pink.500)"
//                   borderRadius="2xl"
//                   display="flex"
//                   alignItems="center"
//                   justifyContent="center"
//                   boxShadow="0 8px 32px rgba(99, 102, 241, 0.3)"
//                   position="relative"
//                                      _before={{
//                      content: '""',
//                      position: 'absolute',
//                      top: -2,
//                      right: -2,
//                      w: 6,
//                      h: 6,
//                      bg: "yellow.400",
//                      borderRadius: "full",
//                      border: "3px solid white",
//                      display: "flex",
//                      alignItems: "center",
//                      justifyContent: "center",
//                      animation: "pulse 2s infinite"
//                    }}
//                 >
//                   <Text fontSize="xl" fontWeight="bold" color="white">
//                     C
//                   </Text>
//                 </Box>
//               </Box>
              
//               <VStack align="start" spacing={1}>
//                 <Text 
//                   fontSize="3xl" 
//                   fontWeight="800" 
//                   bgGradient="linear(to-r, blue.600, purple.600, pink.600)"
//                   bgClip="text"
//                   letterSpacing="tight"
//                 >
//                   Client Dashboard
//                 </Text>
//                 <HStack spacing={3}>
//                   <Badge 
//                     colorScheme="green" 
//                     variant="subtle" 
//                     px={3} 
//                     py={1} 
//                     borderRadius="full"
//                     fontSize="xs"
//                   >
//                     <Icon as={FiTrendingUp} mr={1} />
//                     Performance: +23%
//                   </Badge>
//                   <Text fontSize="sm" color={mutedColor}>
//                     Welcome back! Your business is growing 🚀
//                   </Text>
//                 </HStack>
//               </VStack>
//             </HStack>
//           </Box>

//           {/* Right Section - Enhanced Actions */}
//           <HStack spacing={4}>
//             {/* Enhanced Search */}
//             <Box position="relative">
//               <InputGroup>
//                 <InputLeftElement>
//                   <Icon as={FiSearch} color={mutedColor} />
//                 </InputLeftElement>
//                 <Input
//                   placeholder="Search campaigns, leads, analytics..."
//                   bg={cardBg}
//                   border="2px solid"
//                   borderColor={borderColor}
//                   borderRadius="xl"
//                   w="300px"
//                   _focus={{
//                     borderColor: 'blue.400',
//                     boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)',
//                     transform: 'scale(1.02)'
//                   }}
//                   _hover={{
//                     borderColor: 'blue.300',
//                     transform: 'translateY(-1px)',
//                     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
//                   }}
//                   transition="all 0.2s ease"
//                 />
//               </InputGroup>
//             </Box>

//             {/* Quick Action Button */}
//             <Tooltip label="Create Quick Action" placement="bottom">
//               <Button
//                 leftIcon={<FiPlus />}
//                 bgGradient="linear(to-r, green.400, blue.500)"
//                 color="white"
//                 size="md"
//                 borderRadius="xl"
//                 onClick={handleQuickAction}
//                 _hover={{
//                   bgGradient: 'linear(to-r, green.500, blue.600)',
//                   transform: 'translateY(-2px)',
//                   boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
//                 }}
//                 _active={{
//                   transform: 'translateY(0)'
//                 }}
//                 transition="all 0.2s ease"
//                 boxShadow="0 4px 15px rgba(0, 0, 0, 0.1)"
//               >
//                 Quick Action
//               </Button>
//             </Tooltip>

//             {/* Enhanced Notifications */}
//             <Box position="relative">
//               <Tooltip label={`${unreadCount} unread notifications`} placement="bottom">
//                 <IconButton
//                   icon={<FiBell />}
//                   variant="ghost"
//                   size="lg"
//                   aria-label="Notifications"
//                   position="relative"
//                   color={textColor}
//                   _hover={{
//                     bg: 'rgba(255, 255, 255, 0.1)',
//                     transform: 'scale(1.1)',
//                     color: 'blue.400'
//                   }}
//                   transition="all 0.2s ease"
//                 />
//               </Tooltip>
              
//               {/* Notification Badge */}
//               {unreadCount > 0 && (
//                 <Badge
//                   position="absolute"
//                   top="8px"
//                   right="8px"
//                   colorScheme="red"
//                   variant="solid"
//                   size="sm"
//                   borderRadius="full"
//                   px={2}
//                   py={1}
//                   fontSize="xs"
//                   fontWeight="bold"
//                   animation="pulse 2s infinite"
//                 >
//                   {unreadCount}
//                 </Badge>
//               )}
//             </Box>

//             {/* Theme Toggle */}
//             <Tooltip label="Toggle theme" placement="bottom">
//               <IconButton
//                 icon={<Icon as={useColorModeValue(FiMoon, FiSun)} />}
//                 variant="ghost"
//                 size="lg"
//                 aria-label="Toggle theme"
//                 color={textColor}
//                 _hover={{
//                   bg: 'rgba(255, 255, 255, 0.1)',
//                   transform: 'scale(1.1)',
//                   color: 'yellow.400'
//                 }}
//                 transition="all 0.2s ease"
//               />
//             </Tooltip>

//             {/* Enhanced User Menu */}
//             <Menu>
//               <Tooltip label="User menu" placement="bottom">
//                 <MenuButton
//                   as={IconButton}
//                   icon={
//                     <Avatar 
//                       size="md" 
//                       name="Client User"
//                       src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
//                       border="3px solid"
//                       borderColor="white"
//                       boxShadow="0 4px 15px rgba(0, 0, 0, 0.1)"
//                     />
//                   }
//                   variant="ghost"
//                   size="lg"
//                   aria-label="User menu"
//                   _hover={{
//                     bg: 'rgba(255, 255, 255, 0.1)',
//                     transform: 'scale(1.05)'
//                   }}
//                   transition="all 0.2s ease"
//                 />
//               </Tooltip>
              
//               <MenuList 
//                 bg={cardBg} 
//                 border="1px solid" 
//                 borderColor={borderColor}
//                 borderRadius="xl"
//                 boxShadow="0 20px 60px rgba(0, 0, 0, 0.1)"
//                 p={2}
//               >
//                 <Box p={3} borderBottom="1px" borderColor={borderColor}>
//                   <VStack spacing={2} align="start">
//                     <Text fontWeight="bold" fontSize="md">Client User</Text>
//                     <Text fontSize="sm" color={mutedColor}>Premium Member</Text>
//                     <HStack spacing={2}>
//                       <Badge colorScheme="purple" variant="subtle" size="sm">
//                         <Icon as={FiStar} mr={1} />
//                         VIP
//                       </Badge>
//                       <Badge colorScheme="green" variant="subtle" size="sm">
//                         <Icon as={FiAward} mr={1} />
//                         Top Performer
//                       </Badge>
//                     </HStack>
//                   </VStack>
//                 </Box>
                
//                 <MenuItem icon={<FiUser />} py={3} borderRadius="lg" _hover={{ bg: 'blue.50' }}>
//                   <Text>Profile</Text>
//                 </MenuItem>
//                 <MenuItem icon={<FiSettings />} py={3} borderRadius="lg" _hover={{ bg: 'blue.50' }}>
//                   <Text>Settings</Text>
//                 </MenuItem>
//                 <MenuItem icon={<FiHelpCircle />} py={3} borderRadius="lg" _hover={{ bg: 'blue.50' }}>
//                   <Text>Help & Support</Text>
//                 </MenuItem>
//                 <MenuDivider />
//                 <MenuItem icon={<FiLogOut />} py={3} borderRadius="lg" _hover={{ bg: 'red.50' }}>
//                   <Text color="red.500">Logout</Text>
//                 </MenuItem>
//               </MenuList>
//             </Menu>
//           </HStack>
//         </Flex>
//       </Box>

//       {/* Quick Action Modal */}
//       <Modal isOpen={isOpen} onClose={onClose} size="lg">
//         <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
//         <ModalContent borderRadius="2xl" bg={cardBg}>
//           <ModalHeader>
//             <HStack spacing={3}>
//               <Box
//                 w={10}
//                 h={10}
//                 bgGradient="linear(to-r, green.400, blue.500)"
//                 borderRadius="xl"
//                 display="flex"
//                 alignItems="center"
//                 justifyContent="center"
//               >
//                 <Icon as={FiZap} color="white" />
//               </Box>
//               <Text>Create Quick Action</Text>
//             </HStack>
//           </ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <VStack spacing={4} align="stretch">
//               <FormControl>
//                 <FormLabel>Action Type</FormLabel>
//                 <Select placeholder="Select action type" borderRadius="lg">
//                   <option value="campaign">New Campaign</option>
//                   <option value="lead">Lead Follow-up</option>
//                   <option value="report">Generate Report</option>
//                   <option value="integration">Setup Integration</option>
//                 </Select>
//               </FormControl>
              
//               <FormControl>
//                 <FormLabel>Priority</FormLabel>
//                 <Select placeholder="Select priority" borderRadius="lg">
//                   <option value="low">Low</option>
//                   <option value="medium">Medium</option>
//                   <option value="high">High</option>
//                   <option value="urgent">Urgent</option>
//                 </Select>
//               </FormControl>
              
//               <FormControl>
//                 <FormLabel>Description</FormLabel>
//                 <Textarea 
//                   placeholder="Describe your quick action..." 
//                   rows={3}
//                   borderRadius="lg"
//                 />
//               </FormControl>
//             </VStack>
//           </ModalBody>
//           <ModalFooter>
//             <Button variant="ghost" mr={3} onClick={onClose}>
//               Cancel
//             </Button>
//             <Button
//               bgGradient="linear(to-r, green.400, blue.500)"
//               color="white"
//               onClick={handleSubmitQuickAction}
//               _hover={{
//                 bgGradient: 'linear(to-r, green.500, blue.600)',
//                 transform: 'translateY(-1px)'
//               }}
//               transition="all 0.2s ease"
//             >
//               Create Action
//             </Button>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </>
//   );
// };

// export default Topbar;
import React from 'react';
import {
  Box,
  Flex,
  InputGroup,
  InputLeftElement,
  Input,
  Avatar,
  Text,
  HStack,
  IconButton,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Tooltip,
  Button,
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  BellIcon, 
  ChevronDownIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon 
} from '@chakra-ui/icons';

const Topbar = () => {
  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const borderColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');

  return (
    <Box
      bg={bgColor}
      backdropFilter="blur(20px)"
      px={8}
      py={4}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.05)"
    >
      <Flex justify="space-between" align="center">
        {/* Search Bar - Ultra Modern */}
        <InputGroup maxW="450px">
          <InputLeftElement pointerEvents="none" h="full">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search anything..."
            bg="rgba(0, 0, 0, 0.02)"
            border="2px solid transparent"
            borderRadius="xl"
            h="45px"
            fontSize="sm"
            _hover={{ 
              bg: "white",
              borderColor: "brand.200",
              transform: "translateY(-1px)",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)"
            }}
            _focus={{ 
              bg: "white", 
              borderColor: "brand.400",
              boxShadow: "0 0 0 3px rgba(72, 234, 72, 0.1)"
            }}
            transition="all 0.3s ease"
          />
        </InputGroup>

        {/* Right Side - Premium Design */}
        <HStack spacing={4}>
          {/* Notifications with Badge */}
          <Tooltip label="Notifications" placement="bottom">
            <Box position="relative">
              <IconButton
                icon={<BellIcon />}
                variant="ghost"
                borderRadius="xl"
                size="lg"
                _hover={{ 
                  bg: "brand.50",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 20px rgba(30, 230, 30, 0.2)"
                }}
                transition="all 0.3s ease"
                aria-label="Notifications"
              />
              <Badge
                position="absolute"
                top="-1"
                right="-1"
                colorScheme="red"
                borderRadius="full"
                fontSize="xs"
                w="5"
                h="5"
              >
                3
              </Badge>
            </Box>
          </Tooltip>

          {/* Settings */}
          <Tooltip label="Settings" placement="bottom">
            <IconButton
              icon={<SettingsIcon />}
              variant="ghost"
              borderRadius="xl"
              size="lg"
              _hover={{ 
                bg: "brand.50",
                transform: "rotate(90deg)",
                boxShadow: "0 8px 20px rgba(30, 230, 30, 0.2)"
              }}
              transition="all 0.3s ease"
              aria-label="Settings"
            />
          </Tooltip>

          {/* User Profile Menu */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              borderRadius="xl"
              p={2}
              h="auto"
              _hover={{ 
                bg: "brand.50",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(30, 230, 30, 0.15)"
              }}
              transition="all 0.3s ease"
            >
              <HStack spacing={3}>
                <Avatar
                  size="sm"
                  name="Alex Johnson"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  border="2px solid"
                  borderColor="brand.300"
                />
                <Box textAlign="left">
                  <Text fontSize="sm" fontWeight="bold" color="gray.800">
                    Alex Johnson
                  </Text>
                  <Text fontSize="xs" color="brand.600" fontWeight="medium">
                    Premium User
                  </Text>
                </Box>
                <ChevronDownIcon color="gray.400" />
              </HStack>
            </MenuButton>
            <MenuList 
              borderRadius="xl" 
              border="none"
              boxShadow="0 20px 40px rgba(0, 0, 0, 0.1)"
              p={2}
            >
              <MenuItem borderRadius="lg" _hover={{ bg: "brand.50" }}>Profile</MenuItem>
              <MenuItem borderRadius="lg" _hover={{ bg: "brand.50" }}>Settings</MenuItem>
              <MenuItem borderRadius="lg" _hover={{ bg: "red.50", color: "red.500" }}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Topbar;
