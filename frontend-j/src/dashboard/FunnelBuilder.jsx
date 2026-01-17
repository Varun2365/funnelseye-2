import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  Spinner,
  Badge,
  Icon,
  useToast,
  Flex,
  HStack,
  VStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Input,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  FormHelperText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Divider,
  Alert,
  AlertIcon,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCopy,
  FaShare,
  FaCog,
  FaPlay,
  FaPause,
  FaStop,
  FaSave,
  FaEyeSlash,
  FaLink,
  FaImage,
  FaVideo,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaArrowLeft,
  FaGripVertical,
  FaEllipsisV,
  FaPalette,
  FaCode,
  FaMobile,
  FaDesktop,
  FaTablet,
} from 'react-icons/fa';

const FunnelBuilder = ({ funnel, onSave, onClose, automationRules = [] }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose: onDrawerClose } = useDisclosure();
  
  const [funnelData, setFunnelData] = useState({
    name: funnel?.name || '',
    description: funnel?.description || '',
    type: funnel?.type || 'sales',
    targetAudience: funnel?.targetAudience || '',
    status: funnel?.status || 'draft',
    stages: funnel?.stages || [],
    automationRuleId: funnel?.automationRuleId || '',
    settings: funnel?.settings || {
      theme: 'default',
      colors: {
        primary: '#3182ce',
        secondary: '#38a169',
        accent: '#d69e2e'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      }
    }
  });
  
  const [selectedStage, setSelectedStage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('stages');

  // Default stage templates
  const stageTemplates = [
    {
      type: 'landing',
      name: 'Landing Page',
      icon: FaImage,
      description: 'High-converting landing page',
      defaultContent: {
        title: 'Transform Your Life Today',
        subtitle: 'Join thousands who have already achieved their goals',
        cta: 'Get Started Now',
        features: ['Feature 1', 'Feature 2', 'Feature 3']
      }
    },
    {
      type: 'video',
      name: 'Video Sales Letter',
      icon: FaVideo,
      description: 'Engaging video presentation',
      defaultContent: {
        title: 'Watch This Video',
        subtitle: 'Learn how to achieve your goals',
        videoUrl: '',
        cta: 'Watch Now'
      }
    },
    {
      type: 'form',
      name: 'Application Form',
      icon: FaFileAlt,
      description: 'Lead capture form',
      defaultContent: {
        title: 'Apply Now',
        subtitle: 'Fill out this form to get started',
        fields: ['Name', 'Email', 'Phone', 'Goals'],
        cta: 'Submit Application'
      }
    },
    {
      type: 'sales',
      name: 'Sales Page',
      icon: FaCheckCircle,
      description: 'Product/service sales page',
      defaultContent: {
        title: 'Choose Your Plan',
        subtitle: 'Select the perfect plan for you',
        plans: [
          { name: 'Basic', price: '₹999', features: ['Feature 1', 'Feature 2'] },
          { name: 'Pro', price: '₹1999', features: ['All Basic', 'Feature 3', 'Feature 4'] }
        ],
        cta: 'Choose Plan'
      }
    },
    {
      type: 'checkout',
      name: 'Checkout',
      icon: FaCheckCircle,
      description: 'Payment and checkout page',
      defaultContent: {
        title: 'Complete Your Purchase',
        subtitle: 'Secure checkout process',
        orderSummary: 'Order summary will appear here',
        cta: 'Pay Now'
      }
    }
  ];

  const handleAddStage = (template) => {
    const newStage = {
      id: Date.now().toString(),
      type: template.type,
      name: template.name,
      content: { ...template.defaultContent },
      settings: {
        isActive: true,
        redirectTo: '',
        tracking: true
      },
      order: funnelData.stages.length
    };

    setFunnelData(prev => ({
      ...prev,
      stages: [...prev.stages, newStage]
    }));

    toast({
      title: 'Stage Added',
      description: `${template.name} has been added to your funnel`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleUpdateStage = (stageId, updates) => {
    setFunnelData(prev => ({
      ...prev,
      stages: prev.stages.map(stage => 
        stage.id === stageId ? { ...stage, ...updates } : stage
      )
    }));
  };

  const handleDeleteStage = (stageId) => {
    setFunnelData(prev => ({
      ...prev,
      stages: prev.stages.filter(stage => stage.id !== stageId)
    }));

    toast({
      title: 'Stage Deleted',
      description: 'Stage has been removed from your funnel',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleReorderStages = (fromIndex, toIndex) => {
    const newStages = [...funnelData.stages];
    const [movedStage] = newStages.splice(fromIndex, 1);
    newStages.splice(toIndex, 0, movedStage);
    
    // Update order property
    newStages.forEach((stage, index) => {
      stage.order = index;
    });

    setFunnelData(prev => ({
      ...prev,
      stages: newStages
    }));
  };

  const handleSave = async () => {
    try {
      // Validate funnel data
      if (!funnelData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a funnel name',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (funnelData.stages.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'Please add at least one stage to your funnel',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Call parent save function
      await onSave(funnelData);
      
      toast({
        title: 'Funnel Saved',
        description: 'Your funnel has been saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save funnel. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderStageContent = (stage) => {
    switch (stage.type) {
      case 'landing':
        return (
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Page Title</FormLabel>
              <Input
                value={stage.content.title}
                onChange={(e) => handleUpdateStage(stage.id, {
                  content: { ...stage.content, title: e.target.value }
                })}
                placeholder="Enter page title"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Subtitle</FormLabel>
              <Textarea
                value={stage.content.subtitle}
                onChange={(e) => handleUpdateStage(stage.id, {
                  content: { ...stage.content, subtitle: e.target.value }
                })}
                placeholder="Enter subtitle"
                rows={3}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Call to Action</FormLabel>
              <Input
                value={stage.content.cta}
                onChange={(e) => handleUpdateStage(stage.id, {
                  content: { ...stage.content, cta: e.target.value }
                })}
                placeholder="Enter CTA text"
              />
            </FormControl>
          </VStack>
        );
        
      case 'video':
        return (
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Video Title</FormLabel>
              <Input
                value={stage.content.title}
                onChange={(e) => handleUpdateStage(stage.id, {
                  content: { ...stage.content, title: e.target.value }
                })}
                placeholder="Enter video title"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Video URL</FormLabel>
              <Input
                value={stage.content.videoUrl}
                onChange={(e) => handleUpdateStage(stage.id, {
                  content: { ...stage.content, videoUrl: e.target.value }
                })}
                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Call to Action</FormLabel>
              <Input
                value={stage.content.cta}
                onChange={(e) => handleUpdateStage(stage.id, {
                  content: { ...stage.content, cta: e.target.value }
                })}
                placeholder="Enter CTA text"
              />
            </FormControl>
          </VStack>
        );
        
      case 'form':
        return (
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Form Title</FormLabel>
              <Input
                value={stage.content.title}
                onChange={(e) => handleUpdateStage(stage.id, {
                  content: { ...stage.content, title: e.target.value }
                })}
                placeholder="Enter form title"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Form Fields</FormLabel>
              <Textarea
                value={stage.content.fields.join(', ')}
                onChange={(e) => handleUpdateStage(stage.id, {
                  content: { ...stage.content, fields: e.target.value.split(',').map(f => f.trim()) }
                })}
                placeholder="Enter form fields separated by commas"
                rows={3}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Submit Button</FormLabel>
              <Input
                value={stage.content.cta}
                onChange={(e) => handleUpdateStage(stage.id, {
                  content: { ...stage.content, cta: e.target.value }
                })}
                placeholder="Enter submit button text"
              />
            </FormControl>
          </VStack>
        );
        
      default:
        return (
          <Text color="gray.500">Content editor for this stage type is coming soon</Text>
        );
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <Box>
            <Heading size="lg" color="gray.800">
              {isEditing ? 'Edit Funnel' : 'Create New Funnel'}
            </Heading>
            <Text color="gray.600">
              {isEditing ? 'Modify your existing funnel' : 'Build a high-converting sales funnel'}
            </Text>
          </Box>
          
          <HStack spacing={4}>
            <Button
              leftIcon={previewMode ? <FaEyeSlash /> : <FaEye />}
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? 'Hide Preview' : 'Preview'}
            </Button>
            
            <Button
              leftIcon={<FaSave />}
              colorScheme="brand"
              onClick={handleSave}
            >
              Save Funnel
            </Button>
            
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </HStack>
        </Flex>
      </Box>

      <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
        {/* Main Builder Area */}
        <Box flex="1">
          <Tabs value={activeTab} onChange={setActiveTab}>
            <TabList>
              <Tab>Stages</Tab>
              <Tab>Settings</Tab>
              <Tab>Analytics</Tab>
            </TabList>
            
            <TabPanels>
              {/* Stages Tab */}
              <TabPanel>
                <Card mb={6}>
                  <CardHeader>
                    <Flex justify="space-between" align="center">
                      <Heading size="md">Funnel Stages</Heading>
                      <Button
                        leftIcon={<FaPlus />}
                        colorScheme="brand"
                        onClick={onOpen}
                        size="sm"
                      >
                        Add Stage
                      </Button>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    {funnelData.stages.length === 0 ? (
                      <Box textAlign="center" py={10}>
                        <Text color="gray.500" fontSize="lg">No stages added yet</Text>
                        <Text color="gray.400" mb={4}>Start building your funnel by adding stages</Text>
                        <Button
                          leftIcon={<FaPlus />}
                          colorScheme="brand"
                          onClick={onOpen}
                        >
                          Add Your First Stage
                        </Button>
                      </Box>
                    ) : (
                      <VStack spacing={4} align="stretch">
                        {funnelData.stages.map((stage, index) => (
                          <Card key={stage.id} variant="outline">
                            <CardBody>
                              <Flex justify="space-between" align="center" mb={4}>
                                <HStack spacing={3}>
                                  <Icon as={FaGripVertical} color="gray.400" />
                                  <Badge colorScheme="brand" variant="subtle">
                                    {index + 1}
                                  </Badge>
                                  <Heading size="md">{stage.name}</Heading>
                                  <Badge colorScheme={stage.settings.isActive ? 'green' : 'gray'}>
                                    {stage.settings.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </HStack>
                                
                                <HStack spacing={2}>
                                  <IconButton
                                    icon={<FaEdit />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedStage(stage)}
                                  />
                                  <IconButton
                                    icon={<FaTrash />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleDeleteStage(stage.id)}
                                  />
                                </HStack>
                              </Flex>
                              
                              <Box p={4} bg="gray.50" borderRadius="lg">
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                  Stage Content Preview:
                                </Text>
                                <Text fontWeight="medium">
                                  {stage.content.title || 'No title set'}
                                </Text>
                                {stage.content.subtitle && (
                                  <Text fontSize="sm" color="gray.600">
                                    {stage.content.subtitle}
                                  </Text>
                                )}
                              </Box>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
              
              {/* Settings Tab */}
              <TabPanel>
                <Card>
                  <CardHeader>
                    <Heading size="md">Funnel Settings</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <FormControl>
                        <FormLabel>Funnel Name</FormLabel>
                        <Input
                          value={funnelData.name}
                          onChange={(e) => setFunnelData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter funnel name"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          value={funnelData.description}
                          onChange={(e) => setFunnelData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your funnel"
                          rows={3}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Funnel Type</FormLabel>
                        <Select
                          value={funnelData.type}
                          onChange={(e) => setFunnelData(prev => ({ ...prev, type: e.target.value }))}
                        >
                          <option value="sales">Sales Funnel</option>
                          <option value="lead">Lead Generation</option>
                          <option value="consulting">Consulting</option>
                          <option value="education">Education</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Target Audience</FormLabel>
                        <Input
                          value={funnelData.targetAudience}
                          onChange={(e) => setFunnelData(prev => ({ ...prev, targetAudience: e.target.value }))}
                          placeholder="e.g., Fitness enthusiasts 25-40"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Automation Rule</FormLabel>
                        <Select
                          placeholder="Select automation rule"
                          value={funnelData.automationRuleId || ''}
                          onChange={(e) => setFunnelData(prev => ({ ...prev, automationRuleId: e.target.value }))}
                        >
                          {automationRules.map(rule => (
                            <option key={rule.id} value={rule.id}>
                              {rule.name}
                            </option>
                          ))}
                        </Select>
                        <FormHelperText>Select which automation runs for leads entering this funnel.</FormHelperText>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Status</FormLabel>
                        <Select
                          value={funnelData.status}
                          onChange={(e) => setFunnelData(prev => ({ ...prev, status: e.target.value }))}
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="archived">Archived</option>
                        </Select>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
              
              {/* Analytics Tab */}
              <TabPanel>
                <Card>
                  <CardHeader>
                    <Heading size="md">Funnel Analytics</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text color="gray.500">
                      Analytics will be available once your funnel is published and starts receiving traffic.
                    </Text>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* Stage Editor Sidebar */}
        {selectedStage && (
          <Box w="400px">
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Edit Stage</Heading>
                  <IconButton
                    icon={<FaTimesCircle />}
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedStage(null)}
                  />
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Stage Name</FormLabel>
                    <Input
                      value={selectedStage.name}
                      onChange={(e) => handleUpdateStage(selectedStage.id, { name: e.target.value })}
                      placeholder="Enter stage name"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Stage Type</FormLabel>
                    <Select
                      value={selectedStage.type}
                      onChange={(e) => handleUpdateStage(selectedStage.id, { type: e.target.value })}
                    >
                      <option value="landing">Landing Page</option>
                      <option value="video">Video Sales Letter</option>
                      <option value="form">Application Form</option>
                      <option value="sales">Sales Page</option>
                      <option value="checkout">Checkout</option>
                    </Select>
                  </FormControl>
                  
                  <Divider />
                  
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Stage Content
                  </Text>
                  
                  {renderStageContent(selectedStage)}
                  
                  <Divider />
                  
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Stage Settings
                  </Text>
                  
                  <FormControl>
                    <FormLabel>Active</FormLabel>
                    <Select
                      value={selectedStage.settings.isActive ? 'true' : 'false'}
                      onChange={(e) => handleUpdateStage(selectedStage.id, {
                        settings: { ...selectedStage.settings, isActive: e.target.value === 'true' }
                      })}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Redirect To (Optional)</FormLabel>
                    <Input
                      value={selectedStage.settings.redirectTo}
                      onChange={(e) => handleUpdateStage(selectedStage.id, {
                        settings: { ...selectedStage.settings, redirectTo: e.target.value }
                      })}
                      placeholder="Enter redirect URL"
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        )}
      </Flex>

      {/* Add Stage Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onDrawerClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Add New Stage</DrawerHeader>
          
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <Text color="gray.600" fontSize="sm">
                Choose a stage type to add to your funnel:
              </Text>
              
              {stageTemplates.map((template) => (
                <Card key={template.type} variant="outline" cursor="pointer" 
                      _hover={{ borderColor: 'brand.500', bg: 'brand.50' }}
                      onClick={() => {
                        handleAddStage(template);
                        onDrawerClose();
                      }}>
                  <CardBody>
                    <HStack spacing={4}>
                      <Icon as={template.icon} boxSize={6} color="brand.500" />
                      <Box flex="1">
                        <Text fontWeight="semibold">{template.name}</Text>
                        <Text fontSize="sm" color="gray.600">{template.description}</Text>
                      </Box>
                      <Icon as={FaPlus} color="brand.500" />
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default FunnelBuilder;
