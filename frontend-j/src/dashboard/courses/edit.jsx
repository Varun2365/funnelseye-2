import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getToken } from '../../utils/authUtils';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Icon,
  Spinner,
  Center,
  useColorModeValue,
  Divider,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import {
  FiArrowLeft,
  FiSave,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiX,
  FiCheck
} from 'react-icons/fi';

const API_BASE_URL = 'https://api.funnelseye.com';

const CourseEdit = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const authState = useSelector(state => state.auth);
  const token = getToken(authState);
  const toast = useToast();
  
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    courseType: 'general_module_course',
    price: '',
    currency: 'USD',
    status: 'draft',
    thumbnail: ''
  });
  
  useEffect(() => {
    loadCourse();
  }, [courseId]);
  
  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/content/coach/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const courseData = data.data?.course || data.data;
        setCourse(courseData);
        setModules(courseData.modules || []);
        setCourseForm({
          title: courseData.title || '',
          description: courseData.description || '',
          courseType: courseData.courseType || 'general_module_course',
          price: courseData.price || '',
          currency: courseData.currency || 'USD',
          status: courseData.status || 'draft',
          thumbnail: courseData.thumbnail || ''
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load course',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/courses');
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveCourse = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/content/coach/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(courseForm)
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Course updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        loadCourse();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update course');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update course',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleAddModule = async () => {
    try {
      const moduleData = {
        title: `Module ${modules.length + 1}`,
        description: '',
        day: modules.length + 1,
        order: modules.length
      };
      
      const response = await fetch(`${API_BASE_URL}/api/content/coach/courses/${courseId}/modules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(moduleData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setModules([...modules, data.data || data.data.module]);
        toast({
          title: 'Success',
          description: 'Module added successfully',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to add module');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add module',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleUpdateModule = async (moduleId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/coach/modules/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const data = await response.json();
        setModules(modules.map(m => m._id === moduleId ? (data.data || data.data.module) : m));
        toast({
          title: 'Success',
          description: 'Module updated successfully',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to update module');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update module',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module? All content items will be deleted.')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/coach/modules/${moduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setModules(modules.filter(m => m._id !== moduleId));
        toast({
          title: 'Success',
          description: 'Module deleted successfully',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to delete module');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete module',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleAddContent = async (moduleId) => {
    try {
      const contentData = {
        title: 'New Content Item',
        description: '',
        contentType: 'video',
        content: '',
        order: 0
      };
      
      const response = await fetch(`${API_BASE_URL}/api/content/coach/modules/${moduleId}/contents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(contentData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setModules(modules.map(m => {
          if (m._id === moduleId) {
            return {
              ...m,
              contents: [...(m.contents || []), data.data || data.data.contentItem]
            };
          }
          return m;
        }));
        toast({
          title: 'Success',
          description: 'Content item added successfully',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to add content item');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add content item',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }
  
  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="7xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <HStack spacing={4}>
              <IconButton
                icon={<FiArrowLeft />}
                onClick={() => navigate('/courses')}
                variant="ghost"
                aria-label="Back"
              />
              <Box>
                <Heading size="xl" color={textColor}>
                  Edit Course
                </Heading>
                <Text color={mutedTextColor} fontSize="sm">
                  {course?.title || 'Course Editor'}
                </Text>
              </Box>
            </HStack>
            <Button
              leftIcon={<FiSave />}
              onClick={handleSaveCourse}
              colorScheme="blue"
              isLoading={saving}
            >
              Save Course
            </Button>
          </HStack>
          
          {/* Course Details */}
          <Card bg={cardBg} boxShadow="md">
            <CardHeader>
              <Heading size="md" color={textColor}>Course Information</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="Course Title"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={courseForm.status}
                    onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Course Type</FormLabel>
                  <Select
                    value={courseForm.courseType}
                    onChange={(e) => setCourseForm({ ...courseForm, courseType: e.target.value })}
                  >
                    <option value="workout_routine">Workout Routine</option>
                    <option value="meal_plan">Meal Plan</option>
                    <option value="general_module_course">General Course</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Price</FormLabel>
                  <Input
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    placeholder="0.00"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    value={courseForm.currency}
                    onChange={(e) => setCourseForm({ ...courseForm, currency: e.target.value })}
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Thumbnail URL</FormLabel>
                  <Input
                    value={courseForm.thumbnail}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                    placeholder="https://..."
                  />
                </FormControl>
              </SimpleGrid>
              
              <FormControl mt={4}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Course description"
                  rows={4}
                />
              </FormControl>
            </CardBody>
          </Card>
          
          {/* Modules */}
          <Card bg={cardBg} boxShadow="md">
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md" color={textColor}>Modules & Content</Heading>
                <Button
                  leftIcon={<FiPlus />}
                  onClick={handleAddModule}
                  size="sm"
                  colorScheme="blue"
                >
                  Add Module
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              {modules.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  No modules yet. Click "Add Module" to get started.
                </Alert>
              ) : (
                <Accordion allowToggle>
                  {modules.map((module, index) => (
                    <ModuleEditor
                      key={module._id || index}
                      module={module}
                      onUpdate={(updates) => handleUpdateModule(module._id, updates)}
                      onDelete={() => handleDeleteModule(module._id)}
                      onAddContent={() => handleAddContent(module._id)}
                      cardBg={cardBg}
                      textColor={textColor}
                      mutedTextColor={mutedTextColor}
                      token={token}
                      API_BASE_URL={API_BASE_URL}
                    />
                  ))}
                </Accordion>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

// Module Editor Component
const ModuleEditor = ({ module, onUpdate, onDelete, onAddContent, cardBg, textColor, mutedTextColor, token, API_BASE_URL }) => {
  const [editing, setEditing] = useState(false);
  const [moduleForm, setModuleForm] = useState({
    title: module.title || '',
    description: module.description || '',
    day: module.day || 1,
    order: module.order || 0
  });
  
  const handleSave = () => {
    onUpdate(moduleForm);
    setEditing(false);
  };
  
  const handleCancel = () => {
    setModuleForm({
      title: module.title || '',
      description: module.description || '',
      day: module.day || 1,
      order: module.order || 0
    });
    setEditing(false);
  };
  
  return (
    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">
          <HStack>
            <Text fontWeight="semibold" color={textColor}>
              {module.title || `Module ${module.day || 1}`}
            </Text>
            <Badge>Day {module.day || 1}</Badge>
            {module.contents && (
              <Badge colorScheme="blue">{module.contents.length} items</Badge>
            )}
          </HStack>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <VStack spacing={4} align="stretch">
          {editing ? (
            <>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  rows={2}
                />
              </FormControl>
              <HStack>
                <Button size="sm" leftIcon={<FiCheck />} onClick={handleSave} colorScheme="green">
                  Save
                </Button>
                <Button size="sm" leftIcon={<FiX />} onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
              </HStack>
            </>
          ) : (
            <>
              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="semibold" color={textColor}>{module.title}</Text>
                  {module.description && (
                    <Text fontSize="sm" color={mutedTextColor}>{module.description}</Text>
                  )}
                </Box>
                <HStack>
                  <IconButton
                    icon={<FiEdit />}
                    onClick={() => setEditing(true)}
                    size="sm"
                    variant="ghost"
                    aria-label="Edit module"
                  />
                  <IconButton
                    icon={<FiTrash2 />}
                    onClick={onDelete}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    aria-label="Delete module"
                  />
                </HStack>
              </HStack>
              
              {module.contents && module.contents.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
                    Content Items:
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {module.contents.map((content, idx) => (
                      <Card key={content._id || idx} bg={cardBg} size="sm">
                        <CardBody>
                          <HStack justify="space-between">
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                                {content.title || `Content ${idx + 1}`}
                              </Text>
                              <Text fontSize="xs" color={mutedTextColor}>
                                {content.contentType || 'video'}
                              </Text>
                            </Box>
                            <Badge>{content.contentType}</Badge>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </Box>
              )}
              
              <Button
                leftIcon={<FiPlus />}
                onClick={onAddContent}
                size="sm"
                variant="outline"
                colorScheme="blue"
              >
                Add Content Item
              </Button>
            </>
          )}
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
};

export default CourseEdit;

