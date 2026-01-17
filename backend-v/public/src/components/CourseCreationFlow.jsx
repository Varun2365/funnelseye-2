import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import FileExplorerDialog from './FileExplorerDialog';
import { 
  BookOpen,
  Plus,
  Save,
  Eye,
  Edit,
  Trash2,
  Video,
  FileText,
  Image,
  File,
  Play,
  ChevronRight,
  ChevronDown,
  DollarSign,
  Calendar,
  Clock,
  Users,
  UtensilsCrossed,
  Dumbbell,
  Layers,
  Search,
  X,
  Folder,
  Target,
  Activity,
  Zap,
  ChefHat,
  Droplet,
  ShoppingCart,

  Timer,
  DollarSign as DollarIcon,
  Heart,
  Leaf,
  Apple,
  Tag
} from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { useToast } from '../contexts/ToastContext';

const defaultFunnelsEyeExtras = {
  headline: '',
  subheadline: '',
  transformationPromise: '',
  coachSupport: '',
  communityAccess: '',
  guarantee: '',
  successMetrics: [],
  bonusResources: [],
  platformTools: []
};

const CourseCreationFlow = () => {
  const { showToast } = useToast();
  const location = useLocation();
  
  // View mode state - 'list' or 'create' or 'edit'
  const [viewMode, setViewMode] = useState('list');
  const [courseCategoryTab, setCourseCategoryTab] = useState('customer'); // 'coach' or 'customer'
  const [customerCourseTypeTab, setCustomerCourseTypeTab] = useState('workout_routine'); // 'workout_routine', 'meal_plan', 'general_module_course'
  const [courseEditTab, setCourseEditTab] = useState('modules'); // 'modules', 'lessons', 'settings'
  const [selectedModuleForLessons, setSelectedModuleForLessons] = useState(null); // Module ID for lessons tab
  
  // Course list state
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  
  // Course editing state
  const [course, setCourse] = useState({
    title: '',
    description: '',
    courseType: 'workout_routine',
    price: 0,
    currency: 'USD',
    category: 'customer_course',
    thumbnail: '',
    status: 'draft',
    workoutSpecificFields: {
      difficulty: '',
      duration: '',
      equipment: [],
      muscleGroups: [],
      workoutFrequency: '',
      customFrequency: '',
      workoutType: '',
      targetGoal: '',
      restPeriods: '',
      exercisesPerSession: '',
      programDuration: '',
      intensityLevel: ''
    },
    mealPlanSpecificFields: {
      mealType: '',
      duration: '',
      caloriesPerDay: '',
      mealsPerDay: '',
      macronutrients: {
        proteinGrams: '',
        carbsGrams: '',
        fatsGrams: '',
        proteinPercentage: '',
        carbsPercentage: '',
        fatsPercentage: ''
      },
      mealTiming: {
        breakfastTime: '',
        lunchTime: '',
        dinnerTime: '',
        snackTimes: [],
        fastingWindow: ''
      },
      dietaryRestrictions: [],
      allergens: [],
      cookingDifficulty: '',
      prepTimePerMeal: '',
      cookTimePerMeal: '',
      mealPrepFriendly: false,
      batchCooking: false,
      cuisineType: [],
      mealStyle: '',
      includesRecipes: false,
      includesShoppingList: false,
      includesNutritionLabels: false,
      includesMealPrepGuide: false,
      nutritionGoals: [],
      supplementRecommendations: [],
      waterIntakePerDay: '',
      servingSize: '',
      budgetLevel: '',
      ingredientAvailability: '',
      suitableFor: [],
      mealPlanStructure: 'day_wise',
      specialInstructions: ''
    },
    generalModuleFields: {
      difficulty: '',
      estimatedDuration: '',
      prerequisites: [],
      learningOutcomes: []
    },
    funnelsEyeExtras: { ...defaultFunnelsEyeExtras }
  });
  
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [selectedModule, setSelectedModule] = useState(null);
  
  // Course list search state
  const [courseSearchQuery, setCourseSearchQuery] = useState('');

  // Filter courses by search query
  const filteredCourses = courses.filter(course => {
    if (!courseSearchQuery.trim()) return true;
    const query = courseSearchQuery.toLowerCase();
    return (
      course.title?.toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query)
    );
  });
  
  // Form states
  const [newModule, setNewModule] = useState({ title: '', description: '', day: 1, order: 0 });
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    contentType: 'video',
    content: '',
    order: 0
  });
  
  const [availableFiles, setAvailableFiles] = useState([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(null);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingContentId, setEditingContentId] = useState(null);
  
  // Dialog states
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(false);
  const [fileExplorerContext, setFileExplorerContext] = useState(null); // 'thumbnail' or 'content'
  const [fileExplorerFileType, setFileExplorerFileType] = useState(null); // For filtering file types
  const [showCreateCourseDialog, setShowCreateCourseDialog] = useState(false);
  const [newCourseData, setNewCourseData] = useState({ title: '', category: '', courseType: '' });
  
  // Auto-save functionality
  const autoSaveTimeoutRef = useRef(null);
  
  // Get auth token (coach token)
  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('adminToken');
  };

  // Load available files (coaches can access admin-uploaded files)
  const loadAvailableFiles = async () => {
    try {
      const response = await fetch('/api/content/admin/uploaded-files?limit=1000', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setAvailableFiles(result.data.files || []);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  // Load courses list
  const loadCourses = async () => {
    try {
      setCoursesLoading(true);
      const category = courseCategoryTab === 'coach' ? 'coach_course' : 'customer_course';
      const courseType = courseCategoryTab === 'customer' ? customerCourseTypeTab : undefined;
      
      let url = `/api/content/admin/courses?category=${category}&limit=100`;
      if (courseType) {
        url += `&courseType=${courseType}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setCourses(result.data?.courses || []);
      } else {
        showToast(result.message || 'Error loading courses', 'error');
        setCourses([]);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      showToast('Error loading courses', 'error');
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Load courses when tab changes
  useEffect(() => {
    if (viewMode === 'list') {
      loadCourses();
    }
  }, [courseCategoryTab, customerCourseTypeTab, viewMode]);

  // Load course if editing and sync category from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const courseId = urlParams.get('id');
    const categoryParam = urlParams.get('category');
    
    // Set category from URL parameter if present
    if (categoryParam === 'coach' || categoryParam === 'customer') {
      setCourseCategoryTab(categoryParam);
    }
    
    // If category changes but no course ID, ensure we're in list mode
    if (!courseId && viewMode !== 'list') {
      setViewMode('list');
      setCourseEditTab('overview');
      setSelectedModuleForLessons(null);
    }
    
    // Only load course if we have an ID and we're in list mode
    if (courseId && viewMode === 'list') {
      setViewMode('edit');
      loadCourse(courseId);
    }
  }, [location.search]); // React to URL changes
    
  // Load available files on mount
  useEffect(() => {
    loadAvailableFiles();
  }, []);

  // Load course by ID
  const loadCourse = async (courseId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content/admin/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        const courseData = result.data;
        const category = courseData.category || 'customer_course';
        
        setCourse({
          title: courseData.title || '',
          description: courseData.description || '',
          courseType: courseData.courseType || 'workout_routine',
          price: courseData.price || 0,
          currency: courseData.currency || 'USD',
          category: category,
          thumbnail: courseData.thumbnail || '',
          status: courseData.status || 'draft',
          _id: courseData._id,
          workoutSpecificFields: courseData.workoutSpecificFields || {
            difficulty: '',
            duration: '',
            equipment: [],
            muscleGroups: [],
            workoutFrequency: '',
            customFrequency: '',
            workoutType: '',
            targetGoal: '',
            restPeriods: '',
            exercisesPerSession: '',
            programDuration: '',
            intensityLevel: ''
          },
          mealPlanSpecificFields: courseData.mealPlanSpecificFields || {
            mealType: '',
            duration: '',
            caloriesPerDay: '',
            mealsPerDay: '',
            macronutrients: {
              proteinGrams: '',
              carbsGrams: '',
              fatsGrams: '',
              proteinPercentage: '',
              carbsPercentage: '',
              fatsPercentage: ''
            },
            mealTiming: {
              breakfastTime: '',
              lunchTime: '',
              dinnerTime: '',
              snackTimes: [],
              fastingWindow: ''
            },
            dietaryRestrictions: [],
            allergens: [],
            cookingDifficulty: '',
            prepTimePerMeal: '',
            cookTimePerMeal: '',
            mealPrepFriendly: false,
            batchCooking: false,
            cuisineType: [],
            mealStyle: '',
            includesRecipes: false,
            includesShoppingList: false,
            includesNutritionLabels: false,
            includesMealPrepGuide: false,
            nutritionGoals: [],
            supplementRecommendations: [],
            waterIntakePerDay: '',
            servingSize: '',
            budgetLevel: '',
            ingredientAvailability: '',
            suitableFor: [],
            mealPlanStructure: 'day_wise',
            specialInstructions: ''
          },
          generalModuleFields: courseData.generalModuleFields || {
            difficulty: '',
            estimatedDuration: '',
            prerequisites: [],
            learningOutcomes: []
          },
          funnelsEyeExtras: courseData.funnelsEyeExtras ? {
            ...defaultFunnelsEyeExtras,
            ...courseData.funnelsEyeExtras,
            successMetrics: Array.isArray(courseData.funnelsEyeExtras.successMetrics) ? courseData.funnelsEyeExtras.successMetrics : [],
            bonusResources: Array.isArray(courseData.funnelsEyeExtras.bonusResources) ? courseData.funnelsEyeExtras.bonusResources : [],
            platformTools: Array.isArray(courseData.funnelsEyeExtras.platformTools) ? courseData.funnelsEyeExtras.platformTools : []
          } : { ...defaultFunnelsEyeExtras }
        });
        
        // Set tabs based on loaded course
        setCourseCategoryTab(category === 'coach_course' ? 'coach' : 'customer');
        if (category === 'customer_course') {
          setCustomerCourseTypeTab(courseData.courseType || 'workout_routine');
        }
        
        // Set view mode to edit
        setViewMode('edit');
        
        // Load modules
        if (courseData.modules && courseData.modules.length > 0) {
          setModules(courseData.modules);
        }
      } else {
        showToast(result.message || 'Error loading course', 'error');
      }
    } catch (error) {
      console.error('Error loading course:', error);
      showToast('Error loading course', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save course
  const saveCourse = async (isAutoSave = false) => {
    if (!course.title.trim()) {
      if (!isAutoSave) {
        showToast('Please enter course title', 'error');
      }
      return;
    }

    if (course.price < 0) {
      if (!isAutoSave) {
        showToast('Price must be non-negative', 'error');
      }
      return;
    }

    try {
      setSaving(true);
      
      const url = course._id ? 
        `/api/content/admin/courses/${course._id}` : 
        '/api/content/admin/courses';
      
      const method = course._id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          title: course.title,
          description: course.description,
          courseType: course.courseType,
          price: parseFloat(course.price) || 0,
          currency: course.currency || 'USD',
          category: course.category,
          thumbnail: course.thumbnail,
          status: course.status,
          workoutSpecificFields: course.courseType === 'workout_routine' ? course.workoutSpecificFields : undefined,
          mealPlanSpecificFields: course.courseType === 'meal_plan' ? course.mealPlanSpecificFields : undefined,
          generalModuleFields: course.courseType === 'general_module_course' ? course.generalModuleFields : undefined,
          funnelsEyeExtras: {
            ...course.funnelsEyeExtras,
            successMetrics: course.funnelsEyeExtras?.successMetrics || [],
            bonusResources: course.funnelsEyeExtras?.bonusResources || [],
            platformTools: course.funnelsEyeExtras?.platformTools || []
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        if (!isAutoSave) {
          showToast('Course saved successfully', 'success');
        }
        
        if (!course._id) {
          setCourse(prev => ({ ...prev, _id: result.data._id }));
          // After creating course, load it to get full structure
          await loadCourse(result.data._id);
          // Switch to edit mode after creation
          setViewMode('edit');
        } else {
          // Refresh courses list if we're in edit mode
          if (viewMode === 'edit') {
            await loadCourses();
          }
        }
        
        return result.data;
      } else {
        if (!isAutoSave) {
          showToast(result.message || 'Error saving course', 'error');
        }
        return null;
      }
    } catch (error) {
      console.error('Error saving course:', error);
      if (!isAutoSave) {
        showToast('Error saving course', 'error');
      }
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Add module
  const addModule = async () => {
    if (!newModule.title.trim()) {
      showToast('Please enter module title', 'error');
      return;
    }

    if (!course._id) {
      // Save course first if it doesn't exist
      const saved = await saveCourse(true);
      if (!saved) {
        showToast('Please save the course first', 'error');
        return;
      }
    }

    try {
      const response = await fetch(`/api/content/admin/courses/${course._id}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          title: newModule.title,
          description: newModule.description || '',
          day: parseInt(newModule.day) || 1,
          order: modules.length
        })
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('Module created successfully', 'success');
        setModules(prev => [...prev, result.data]);
        setNewModule({ title: '', description: '', day: modules.length + 1, order: 0 });
        setShowModuleDialog(false);
        await loadCourse(course._id); // Reload to get updated structure
      } else {
        showToast(result.message || 'Error creating module', 'error');
      }
    } catch (error) {
      console.error('Error creating module:', error);
      showToast('Error creating module', 'error');
    }
  };

  // Update module
  const updateModule = async (moduleId, updatedData) => {
    try {
      const response = await fetch(`/api/content/admin/modules/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(updatedData)
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('Module updated successfully', 'success');
        setModules(prev => prev.map(m => m._id === moduleId ? result.data : m));
        setEditingModuleId(null);
        setShowModuleDialog(false);
        await loadCourse(course._id);
      } else {
        showToast(result.message || 'Error updating module', 'error');
      }
    } catch (error) {
      console.error('Error updating module:', error);
      showToast('Error updating module', 'error');
    }
  };

  // Delete module
  const deleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module? All content will be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`/api/content/admin/modules/${moduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('Module deleted successfully', 'success');
        setModules(prev => prev.filter(m => m._id !== moduleId));
        await loadCourse(course._id);
      } else {
        showToast(result.message || 'Error deleting module', 'error');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      showToast('Error deleting module', 'error');
    }
  };

  // Add content to module
  const addContentToModule = async (moduleId) => {
    if (!newContent.title.trim()) {
      showToast('Please enter content title', 'error');
      return;
    }

    // For meal type, content is optional (can use recipe name or meal image)
    if (newContent.contentType !== 'meal' && !newContent.content.trim()) {
      showToast('Please provide content (file URL or YouTube URL)', 'error');
      return;
    }

    try {
      const requestBody = {
        title: newContent.title,
        description: newContent.description || '',
        contentType: newContent.contentType,
        content: newContent.content || (newContent.contentType === 'meal' ? newContent.mealData?.recipeName || newContent.mealData?.mealImage || newContent.title : ''),
        order: 0
      };

      // Add mealData if contentType is 'meal'
      if (newContent.contentType === 'meal' && newContent.mealData) {
        requestBody.mealData = newContent.mealData;
      }

      const response = await fetch(`/api/content/admin/modules/${moduleId}/contents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('Content added successfully', 'success');
        setNewContent({ 
          title: '', 
          description: '', 
          contentType: course.courseType === 'meal_plan' ? 'meal' : 'video', 
          content: '', 
          order: 0,
          mealData: course.courseType === 'meal_plan' ? {
            mealType: '',
            recipeName: '',
            ingredients: [],
            nutritionalInfo: {},
            cookingInstructions: '',
            prepTime: '',
            cookTime: '',
            servingSize: '',
            difficulty: '',
            mealImage: '',
            mealVideo: '',
            tags: [],
            notes: ''
          } : undefined
        });
        setShowContentDialog(false);
        setCurrentModuleIndex(null);
        await loadCourse(course._id);
      } else {
        showToast(result.message || 'Error adding content', 'error');
      }
    } catch (error) {
      console.error('Error adding content:', error);
      showToast('Error adding content', 'error');
    }
  };

  // Update content
  const updateContent = async (contentId, updatedData) => {
    try {
      // Prepare request body
      const requestBody = {
        title: updatedData.title,
        description: updatedData.description || '',
        contentType: updatedData.contentType,
        content: updatedData.content || (updatedData.contentType === 'meal' ? updatedData.mealData?.recipeName || updatedData.mealData?.mealImage || updatedData.title : ''),
        order: updatedData.order || 0
      };

      // Add mealData if contentType is 'meal'
      if (updatedData.contentType === 'meal' && updatedData.mealData) {
        requestBody.mealData = updatedData.mealData;
      }

      const response = await fetch(`/api/content/admin/contents/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('Content updated successfully', 'success');
        setEditingContentId(null);
        setShowContentDialog(false);
        await loadCourse(course._id);
      } else {
        showToast(result.message || 'Error updating content', 'error');
      }
    } catch (error) {
      console.error('Error updating content:', error);
      showToast('Error updating content', 'error');
    }
  };

  // Delete content
  const deleteContent = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      const response = await fetch(`/api/content/admin/contents/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('Content deleted successfully', 'success');
        await loadCourse(course._id);
      } else {
        showToast(result.message || 'Error deleting content', 'error');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      showToast('Error deleting content', 'error');
    }
  };

  // Toggle module expansion
  const toggleModuleExpansion = (moduleIndex) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleIndex)) {
      newExpanded.delete(moduleIndex);
    } else {
      newExpanded.add(moduleIndex);
    }
    setExpandedModules(newExpanded);
  };

  // Get content icon
  const getContentIcon = (contentType) => {
    switch (contentType) {
      case 'video': return <Video className="h-4 w-4 text-red-500" />;
      case 'image': return <Image className="h-4 w-4 text-green-500" />;
      case 'pdf': return <FileText className="h-4 w-4 text-red-600" />;
      case 'audio': return <Play className="h-4 w-4 text-blue-500" />;
      case 'youtube': return <Play className="h-4 w-4 text-red-600" />;
      case 'text': return <FileText className="h-4 w-4 text-gray-500" />;
      case 'meal': return <UtensilsCrossed className="h-4 w-4 text-emerald-600" />;
      default: return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  // Handle file selection from explorer
  const handleFileExplorerSelect = (fileData) => {
    if (fileExplorerContext === 'thumbnail') {
      setCourse(prev => ({ ...prev, thumbnail: fileData.url }));
    } else if (fileExplorerContext === 'content') {
      setNewContent(prev => ({
        ...prev,
        content: fileData.url
      }));
    } else if (fileExplorerContext === 'mealImage') {
      setNewContent(prev => ({
        ...prev,
        mealData: {
          ...prev.mealData,
          mealImage: fileData.url
        }
      }));
    } else if (fileExplorerContext === 'mealVideo') {
      setNewContent(prev => ({
        ...prev,
        mealData: {
          ...prev.mealData,
          mealVideo: fileData.url
        }
      }));
    }
    setShowFileExplorer(false);
    setFileExplorerContext(null);
    setFileExplorerFileType(null);
  };

  // Open file explorer for thumbnail
  const openThumbnailExplorer = () => {
    setFileExplorerContext('thumbnail');
    setFileExplorerFileType('image');
    setShowFileExplorer(true);
  };

  // Open file explorer for content
  const openContentExplorer = (contentType) => {
    setFileExplorerContext('content');
    // Map content types to file types
    const typeMap = {
      'video': 'video',
      'image': 'image',
      'pdf': 'pdf',
      'audio': 'audio'
    };
    setFileExplorerFileType(typeMap[contentType] || null);
    setShowFileExplorer(true);
  };

  // Reset course form for new course
  const resetCourseForm = () => {
    setCourse({
      title: '',
      description: '',
      courseType: courseCategoryTab === 'customer' ? customerCourseTypeTab : 'general_module_course',
      price: 0,
      currency: 'USD',
      category: courseCategoryTab === 'coach' ? 'coach_course' : 'customer_course',
      thumbnail: '',
      status: 'draft',
      workoutSpecificFields: {
        difficulty: '',
        duration: '',
        equipment: [],
        muscleGroups: [],
        workoutFrequency: ''
      },
      mealPlanSpecificFields: {
        mealType: '',
        duration: '',
        caloriesPerDay: '',
        mealsPerDay: '',
        dietaryRestrictions: []
      },
      generalModuleFields: {
        difficulty: '',
        estimatedDuration: '',
        prerequisites: [],
        learningOutcomes: []
      },
      funnelsEyeExtras: { ...defaultFunnelsEyeExtras }
    });
    setModules([]);
    setExpandedModules(new Set());
  };

  // Handle create new course - show dialog first
  const handleCreateNew = () => {
    // Set default course type based on current tab
    const defaultCourseType = courseCategoryTab === 'customer' 
      ? customerCourseTypeTab 
      : 'general_module_course';
    
    setNewCourseData({
      title: '',
      category: courseCategoryTab === 'coach' ? 'coach_course' : 'customer_course',
      courseType: defaultCourseType
    });
    setShowCreateCourseDialog(true);
  };

  // Handle create course from dialog
  const handleCreateCourseFromDialog = async () => {
    if (!newCourseData.title.trim()) {
      showToast('Please enter course name', 'error');
      return;
    }

    if (!newCourseData.category) {
      showToast('Please select course category', 'error');
      return;
    }

    if (!newCourseData.courseType) {
      showToast('Please select course type', 'error');
      return;
    }

    try {
      setLoading(true);
      setShowCreateCourseDialog(false);

      // Create course with basic info
      const response = await fetch('/api/content/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          title: newCourseData.title.trim(),
          description: '',
          courseType: newCourseData.courseType,
          price: 0,
          currency: 'USD',
          category: newCourseData.category,
          thumbnail: '',
          status: 'draft',
          funnelsEyeExtras: { ...defaultFunnelsEyeExtras }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('Course created successfully', 'success');
        
        // Set the course data and switch to edit mode
        setCourse({
          title: result.data.title,
          description: result.data.description || '',
          courseType: result.data.courseType,
          price: result.data.price || 0,
          currency: result.data.currency || 'USD',
          category: result.data.category,
          thumbnail: result.data.thumbnail || '',
          status: result.data.status || 'draft',
          _id: result.data._id,
          workoutSpecificFields: result.data.workoutSpecificFields || {
            difficulty: '',
            duration: '',
            equipment: [],
            muscleGroups: [],
            workoutFrequency: '',
            customFrequency: '',
            workoutType: '',
            targetGoal: '',
            restPeriods: '',
            exercisesPerSession: '',
            programDuration: '',
            intensityLevel: ''
          },
          mealPlanSpecificFields: result.data.mealPlanSpecificFields || {
            mealType: '',
            duration: '',
            caloriesPerDay: '',
            mealsPerDay: '',
            macronutrients: {
              proteinGrams: '',
              carbsGrams: '',
              fatsGrams: '',
              proteinPercentage: '',
              carbsPercentage: '',
              fatsPercentage: ''
            },
            mealTiming: {
              breakfastTime: '',
              lunchTime: '',
              dinnerTime: '',
              snackTimes: [],
              fastingWindow: ''
            },
            dietaryRestrictions: [],
            allergens: [],
            cookingDifficulty: '',
            prepTimePerMeal: '',
            cookTimePerMeal: '',
            mealPrepFriendly: false,
            batchCooking: false,
            cuisineType: [],
            mealStyle: '',
            includesRecipes: false,
            includesShoppingList: false,
            includesNutritionLabels: false,
            includesMealPrepGuide: false,
            nutritionGoals: [],
            supplementRecommendations: [],
            waterIntakePerDay: '',
            servingSize: '',
            budgetLevel: '',
            ingredientAvailability: '',
            suitableFor: [],
            mealPlanStructure: 'day_wise',
            specialInstructions: ''
          },
          generalModuleFields: result.data.generalModuleFields || {
            difficulty: '',
            estimatedDuration: '',
            prerequisites: [],
            learningOutcomes: []
          },
          funnelsEyeExtras: result.data.funnelsEyeExtras ? {
            ...defaultFunnelsEyeExtras,
            ...result.data.funnelsEyeExtras,
            successMetrics: Array.isArray(result.data.funnelsEyeExtras.successMetrics) ? result.data.funnelsEyeExtras.successMetrics : [],
            bonusResources: Array.isArray(result.data.funnelsEyeExtras.bonusResources) ? result.data.funnelsEyeExtras.bonusResources : [],
            platformTools: Array.isArray(result.data.funnelsEyeExtras.platformTools) ? result.data.funnelsEyeExtras.platformTools : []
          } : { ...defaultFunnelsEyeExtras }
        });

        // Update category tab if needed
        if (result.data.category === 'coach_course') {
          setCourseCategoryTab('coach');
        } else {
          setCourseCategoryTab('customer');
          setCustomerCourseTypeTab(result.data.courseType);
        }

        // Switch to edit mode and load the course
        setViewMode('edit');
        setCourseEditTab('modules');
        await loadCourse(result.data._id);
      } else {
        showToast(result.message || 'Error creating course', 'error');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      showToast('Error creating course', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit course
  const handleEditCourse = (courseId) => {
    setViewMode('edit');
    setCourseEditTab('modules');
    setSelectedModuleForLessons(null);
    loadCourse(courseId);
  };

  // Handle back to list
  const handleBackToList = () => {
    setViewMode('list');
    resetCourseForm();
    setCourseEditTab('modules');
    setSelectedModuleForLessons(null);
    loadCourses();
  };

  // Handle manage lessons for a module
  const handleManageLessons = (moduleId) => {
    setSelectedModuleForLessons(moduleId);
    setCourseEditTab('lessons');
  };

  // Get course type icon
  const getCourseTypeIcon = (courseType) => {
    switch (courseType) {
      case 'workout_routine': return <Dumbbell className="h-5 w-5" />;
      case 'meal_plan': return <UtensilsCrossed className="h-5 w-5" />;
      case 'general_module_course': return <BookOpen className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  // Get course type label
  const getCourseTypeLabel = (courseType) => {
    switch (courseType) {
      case 'workout_routine': return 'Workout Routine';
      case 'meal_plan': return 'Meal Planner';
      case 'general_module_course': return 'General Module Based Course';
      default: return 'Course';
    }
  };

  // Auto-save on course changes
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    if (course._id && course.title.trim()) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveCourse(true);
      }, 2000);
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [course.title, course.description, course.price, course.currency, course.courseType, course.category, course.thumbnail, course.status]);

  if (loading && viewMode !== 'list') {
    return (
      <div className="flex items-center justify-center h-64">
        <Clock className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Render course list view
  if (viewMode === 'list') {
  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">
              Create and manage {courseCategoryTab === 'coach' ? 'coach' : 'customer'} courses
          </p>
        </div>
        </div>

        {/* Customer Courses Content */}
        {courseCategoryTab === 'customer' && (
          <>
            {/* Header Row with Tabs, Search, and Create Button */}
            <div className="flex items-center justify-between gap-4">
              {/* Customer Course Type Tabs - Shortened */}
              <Tabs value={customerCourseTypeTab} onValueChange={setCustomerCourseTypeTab}>
                <TabsList className="grid grid-cols-3 w-fit">
                  <TabsTrigger value="workout_routine" className="flex items-center space-x-2 px-4">
                    <Dumbbell className="h-4 w-4" />
                    <span>Workout Routines</span>
                  </TabsTrigger>
                  <TabsTrigger value="meal_plan" className="flex items-center space-x-2 px-4">
                    <UtensilsCrossed className="h-4 w-4" />
                    <span>Meal Planners</span>
                  </TabsTrigger>
                  <TabsTrigger value="general_module_course" className="flex items-center space-x-2 px-4">
                    <BookOpen className="h-4 w-4" />
                    <span>General Modules</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Search and Create Button */}
              <div className="flex items-center space-x-3 flex-1 justify-end">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={courseSearchQuery}
                    onChange={(e) => setCourseSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleCreateNew} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Course
          </Button>
        </div>
      </div>

            {/* Course List */}
            <Tabs value={customerCourseTypeTab} onValueChange={setCustomerCourseTypeTab}>
              <TabsContent value={customerCourseTypeTab} className="space-y-4 mt-4">
                {coursesLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Clock className="h-8 w-8 animate-spin" />
                  </div>
                ) : filteredCourses.length === 0 ? (
        <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                      <p className="text-muted-foreground mb-4">
                        {courseSearchQuery 
                          ? `No courses found matching "${courseSearchQuery}"`
                          : `Get started by creating your first ${getCourseTypeLabel(customerCourseTypeTab).toLowerCase()} course`
                        }
                      </p>
                      <Button onClick={handleCreateNew}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Course
                      </Button>
                </CardContent>
              </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredCourses.map((courseItem) => {
                      // Get color scheme based on course type
                      const getCourseColors = (courseType) => {
                        switch (courseType) {
                          case 'workout_routine':
                            return {
                              border: 'border-l-orange-400',
                              bgGradient: 'from-orange-50 to-red-50',
                              iconBg: 'bg-orange-50',
                              iconColor: 'text-orange-600'
                            };
                          case 'meal_plan':
                            return {
                              border: 'border-l-green-400',
                              bgGradient: 'from-green-50 to-emerald-50',
                              iconBg: 'bg-green-50',
                              iconColor: 'text-green-600'
                            };
                          case 'general_module_course':
                            return {
                              border: 'border-l-blue-400',
                              bgGradient: 'from-blue-50 to-indigo-50',
                              iconBg: 'bg-blue-50',
                              iconColor: 'text-blue-600'
                            };
                          default:
                            return {
                              border: 'border-l-gray-400',
                              bgGradient: 'from-gray-50 to-slate-50',
                              iconBg: 'bg-gray-50',
                              iconColor: 'text-gray-600'
                            };
                        }
                      };
                      const colors = getCourseColors(courseItem.courseType);
                      
                      return (
              <Card 
                          key={courseItem._id} 
                          className={`cursor-pointer hover:shadow-lg transition-all duration-200 border overflow-hidden group`}
                        >
                          {/* Thumbnail Section - 16:9 aspect ratio */}
                          {courseItem.thumbnail ? (
                            <div className="w-full aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                              <img 
                                src={courseItem.thumbnail} 
                                alt={courseItem.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className={`w-full aspect-video bg-gradient-to-br ${colors.bgGradient} flex items-center justify-center`}>
                              <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                                {getCourseTypeIcon(courseItem.courseType)}
                              </div>
                            </div>
                          )}
                          
                          <CardHeader className="pb-2 pt-4 px-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-start space-x-2 flex-1 min-w-0">
                                <div className={`p-1 rounded ${colors.iconBg} ${colors.iconColor} mt-0.5 flex-shrink-0`}>
                                  {getCourseTypeIcon(courseItem.courseType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-lg font-bold line-clamp-2 leading-tight">{courseItem.title}</CardTitle>
                                </div>
                              </div>
                              <Badge 
                                variant={courseItem.status === 'published' ? 'default' : 'secondary'}
                                className="text-xs flex-shrink-0"
                              >
                                {courseItem.status}
                              </Badge>
                            </div>
                            <CardDescription className="line-clamp-2 text-xs text-muted-foreground">
                              {courseItem.description || 'No description'}
                            </CardDescription>
                          </CardHeader>
                          
                          <CardContent className="px-4 pb-4">
                            <div className="flex items-center justify-between text-xs mb-3 pb-2 border-b">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-3.5 w-3.5 text-green-600" />
                                <span className="font-bold text-gray-900">
                                  {courseItem.currency || 'USD'} {courseItem.price || 0}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Layers className="h-3.5 w-3.5 text-blue-600" />
                                <span className="text-gray-600">{courseItem.modules?.length || 0} modules</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1.5">
                              <Button
                                className="flex-1 h-10 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => handleEditCourse(courseItem._id)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 p-0 hover:bg-gray-50"
                                onClick={() => setShowPreviewDialog(true)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Coach Courses Content */}
        {courseCategoryTab === 'coach' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Coach Courses</h2>
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Course
              </Button>
            </div>

            {coursesLoading ? (
              <div className="flex items-center justify-center h-64">
                <Clock className="h-8 w-8 animate-spin" />
              </div>
            ) : courses.length === 0 ? (
        <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No coach courses yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create default modular courses that coaches can customize
                  </p>
                  <Button onClick={handleCreateNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Coach Course
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {courses.map((courseItem) => (
                  <Card key={courseItem._id} className="cursor-pointer hover:shadow-lg transition-all duration-200 border overflow-hidden">
                    {/* Thumbnail Section - 16:9 aspect ratio */}
                    {courseItem.thumbnail ? (
                      <div className="w-full aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <img 
                          src={courseItem.thumbnail} 
                          alt={courseItem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-video bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                          <Users className="h-6 w-6" />
                        </div>
                      </div>
                    )}
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-start space-x-2 flex-1 min-w-0">
                          <div className="p-1 rounded bg-blue-50 text-blue-600 mt-0.5 flex-shrink-0">
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-bold line-clamp-2 leading-tight">{courseItem.title}</CardTitle>
                          </div>
                        </div>
                        <Badge variant={courseItem.status === 'published' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                          {courseItem.status}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 text-xs text-muted-foreground">
                        {courseItem.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <div className="flex items-center justify-between text-xs mb-3 pb-2 border-b">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3.5 w-3.5 text-green-600" />
                          <span className="font-bold text-gray-900">
                            {courseItem.currency || 'USD'} {courseItem.price || 0}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3.5 w-3.5 text-blue-600" />
                          <span className="text-gray-600">{courseItem.modules?.length || 0} modules</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Button 
                          className="flex-1 h-10 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleEditCourse(courseItem._id)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 p-0 hover:bg-gray-50"
                          onClick={() => setShowPreviewDialog(true)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
              )}
            </div>

    {/* Create Course Dialog - Must be outside main div to work in list view */}
    <Dialog 
      open={showCreateCourseDialog} 
      onOpenChange={(open) => {
        setShowCreateCourseDialog(open);
        if (!open) {
          // Reset form when dialog closes
          setNewCourseData({ title: '', category: '', courseType: '' });
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Enter the course name and select the course type to get started
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="new-course-title" className="text-sm font-medium">Course Name *</Label>
            <Input
              id="new-course-title"
              value={newCourseData.title}
              onChange={(e) => setNewCourseData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Beginner Workout Program"
              className="mt-1.5"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCourseData.title.trim() && newCourseData.courseType) {
                  handleCreateCourseFromDialog();
                }
              }}
            />
          </div>
          
          <div>
            <Label htmlFor="new-course-category" className="text-sm font-medium">Category *</Label>
            <Select
              value={newCourseData.category}
              onValueChange={(value) => {
                setNewCourseData(prev => {
                  // When category changes, reset course type if needed
                  const newCourseType = value === 'coach_course' 
                    ? 'general_module_course' 
                    : (prev.courseType || 'workout_routine');
                  return { ...prev, category: value, courseType: newCourseType };
                });
              }}
            >
              <SelectTrigger className="w-full mt-1.5">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer_course">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Customer Course</span>
                  </div>
                </SelectItem>
                <SelectItem value="coach_course">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Coach Course</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {newCourseData.category === 'coach_course' 
                ? 'Default modular courses that coaches can customize'
                : 'Courses available for customers to purchase'}
            </p>
          </div>

          <div>
            <Label htmlFor="new-course-type" className="text-sm font-medium">Course Type *</Label>
            <Select
              value={newCourseData.courseType}
              onValueChange={(value) => setNewCourseData(prev => ({ ...prev, courseType: value }))}
            >
              <SelectTrigger className="w-full mt-1.5">
                <SelectValue placeholder="Select course type" />
              </SelectTrigger>
              <SelectContent>
                {newCourseData.category === 'customer_course' ? (
                  <>
                    <SelectItem value="workout_routine">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="h-4 w-4" />
                        <span>Workout Routine</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="meal_plan">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-4 w-4" />
                        <span>Meal Planner</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="general_module_course">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>General Module Based Course</span>
                      </div>
                    </SelectItem>
                  </>
                ) : (
                  <SelectItem value="general_module_course">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>General Module Based Course</span>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreateCourseDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCourseFromDialog}
            disabled={!newCourseData.title.trim() || !newCourseData.category || !newCourseData.courseType}
          >
            Create Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
  }

  // Render create/edit view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
              <div>
          <h1 className="text-3xl font-bold">
            {viewMode === 'create' ? 'Create New Course' : 'Edit Course'}
          </h1>
          <p className="text-muted-foreground">
            {viewMode === 'create' 
              ? 'Create comprehensive courses with modules and content'
              : 'Update course details and manage modules'}
          </p>
              </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleBackToList}>
            Back to List
          </Button>
          <Button variant="outline" onClick={() => setShowPreviewDialog(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => saveCourse()}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Course'}
          </Button>
              </div>
            </div>

      {/* Course Creation Tabs */}
      <Tabs value={courseEditTab} onValueChange={setCourseEditTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-fit">
          <TabsTrigger value="modules" className="flex items-center space-x-2">
            <Layers className="h-4 w-4" />
            <span>{course.courseType === 'meal_plan' ? 'Days' : 'Modules'}</span>
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex items-center space-x-2" disabled={!selectedModuleForLessons}>
            {course.courseType === 'meal_plan' ? (
              <UtensilsCrossed className="h-4 w-4" />
            ) : (
              <Video className="h-4 w-4" />
            )}
            <span>{course.courseType === 'meal_plan' ? 'Meals' : 'Lessons'}</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Modules/Days Tab */}
        <TabsContent value="modules" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{course.courseType === 'meal_plan' ? 'Meal Plan Days' : 'Course Modules'}</CardTitle>
                <CardDescription>
                    {course.courseType === 'meal_plan' 
                    ? 'Organize your meal plan by days - each day contains meals'
                    : courseCategoryTab === 'coach' 
                    ? 'Organize your default modular course structure'
                    : 'Organize your course content into day-wise modules'}
                </CardDescription>
              </div>
              <Button 
                onClick={() => {
                  setNewModule({ title: '', description: '', day: modules.length + 1, order: 0 });
                  setEditingModuleId(null);
                  setShowModuleDialog(true);
                }}
                disabled={!course._id}
              >
                <Plus className="w-4 h-4 mr-2" />
                {course.courseType === 'meal_plan' ? 'Add Day' : 'Add Module'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!course._id ? (
              <Alert>
                <AlertDescription>
                  Please save the course first before adding modules.
                </AlertDescription>
              </Alert>
            ) : modules.length === 0 ? (
            <div className="text-center py-12">
              {course.courseType === 'meal_plan' ? (
                <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              ) : (
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              )}
              <h3 className="text-lg font-medium mb-2">
                {course.courseType === 'meal_plan' ? 'No days yet' : 'No modules yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {course.courseType === 'meal_plan' 
                  ? 'Create your first day to start building your meal plan'
                  : 'Create your first module to start building your course'}
              </p>
              <Button onClick={() => {
                setNewModule({ title: '', description: '', day: 1, order: 0 });
                setEditingModuleId(null);
                setShowModuleDialog(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                {course.courseType === 'meal_plan' ? 'Create First Day' : 'Create First Module'}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Day</th>
                    <th className="text-left p-4 font-semibold">Title</th>
                    <th className="text-left p-4 font-semibold">Description</th>
                    <th className="text-left p-4 font-semibold">{course.courseType === 'meal_plan' ? 'Meals' : 'Lessons'}</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
              {modules.map((module, moduleIndex) => (
                    <tr key={module._id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <Badge variant="outline">Day {module.day}</Badge>
                      </td>
                      <td className="p-4 font-medium">{module.title}</td>
                      <td className="p-4 text-muted-foreground">
                        {module.description ? (
                          <span className="line-clamp-1">{module.description}</span>
                        ) : (
                          <span className="text-muted-foreground italic">No description</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">
                          {module.contents?.length || 0} {course.courseType === 'meal_plan' ? 'meals' : 'lessons'}
                        </Badge>
                      </td>
                      <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                            onClick={() => handleManageLessons(module._id)}
                          >
                            {course.courseType === 'meal_plan' ? (
                              <UtensilsCrossed className="w-4 h-4 mr-1" />
                            ) : (
                              <Video className="w-4 h-4 mr-1" />
                            )}
                            {course.courseType === 'meal_plan' ? 'Manage Meals' : 'Manage Lessons'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNewModule({
                              title: module.title,
                              description: module.description || '',
                              day: module.day,
                              order: module.order
                            });
                            setEditingModuleId(module._id);
                            setShowModuleDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteModule(module._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                    </div>
          )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-6">
          {selectedModuleForLessons ? (
            <>
              {(() => {
                const currentModule = modules.find(m => m._id === selectedModuleForLessons);
                if (!currentModule) return null;
                
                return (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>
                            {course.courseType === 'meal_plan' ? 'Meals' : 'Lessons'}: {currentModule.title}
                          </CardTitle>
                          <CardDescription>
                            Day {currentModule.day} • {course.courseType === 'meal_plan' ? 'Manage meals for this day' : 'Manage content for this module'}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCourseEditTab('modules');
                              setSelectedModuleForLessons(null);
                            }}
                          >
                            Back to {course.courseType === 'meal_plan' ? 'Days' : 'Modules'}
                          </Button>
                          <Button
                            onClick={() => {
                              setCurrentModuleIndex(selectedModuleForLessons);
                              const defaultContentType = course.courseType === 'meal_plan' ? 'meal' : 'video';
                              setNewContent({ 
                                title: '', 
                                description: '', 
                                contentType: defaultContentType, 
                                content: '', 
                                order: 0,
                                mealData: course.courseType === 'meal_plan' ? {
                                  mealType: '',
                                  recipeName: '',
                                  ingredients: [],
                                  nutritionalInfo: {},
                                  cookingInstructions: '',
                                  prepTime: '',
                                  cookTime: '',
                                  servingSize: '',
                                  difficulty: '',
                                  mealImage: '',
                                  mealVideo: '',
                                  tags: [],
                                  notes: ''
                                } : undefined
                              });
                              setEditingContentId(null);
                              setShowContentDialog(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {course.courseType === 'meal_plan' ? 'Add Meal' : 'Add Lesson'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {currentModule.contents && currentModule.contents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentModule.contents.map((content, contentIndex) => (
                            <Card key={content._id} className="hover:shadow-md transition-shadow">
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-3 flex-1">
                                {getContentIcon(content.contentType)}
                                    <div className="flex-1">
                                      <CardTitle className="text-base">{content.title}</CardTitle>
                                      <CardDescription className="mt-1">
                                    {content.contentType}
                                      </CardDescription>
                                </div>
                              </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                {content.description && (
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                    {content.description}
                                  </p>
                                )}
                              <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                  size="sm"
                                    className="flex-1"
                                  onClick={() => {
                                    setNewContent({
                                      title: content.title,
                                      description: content.description || '',
                                      contentType: content.contentType,
                                      content: content.content,
                                      order: content.order
                                    });
                                      setCurrentModuleIndex(selectedModuleForLessons);
                                    setEditingContentId(content._id);
                                    setShowContentDialog(true);
                                  }}
                                >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                  size="sm"
                                  onClick={() => deleteContent(content._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              </CardContent>
                            </Card>
                          ))}
                            </div>
                      ) : (
                        <div className="text-center py-12">
                          {course.courseType === 'meal_plan' ? (
                            <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          ) : (
                            <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          )}
                          <h3 className="text-lg font-medium mb-2">
                            {course.courseType === 'meal_plan' ? 'No meals yet' : 'No lessons yet'}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {course.courseType === 'meal_plan' 
                              ? 'Add your first meal to this day'
                              : 'Add your first lesson to this module'}
                          </p>
                            <Button
                              onClick={() => {
                              setCurrentModuleIndex(selectedModuleForLessons);
                                const defaultContentType = course.courseType === 'meal_plan' ? 'meal' : 'video';
                                setNewContent({ 
                                  title: '', 
                                  description: '', 
                                  contentType: defaultContentType, 
                                  content: '', 
                                  order: 0,
                                  mealData: course.courseType === 'meal_plan' ? {
                                    mealType: '',
                                    recipeName: '',
                                    ingredients: [],
                                    nutritionalInfo: {},
                                    cookingInstructions: '',
                                    prepTime: '',
                                    cookTime: '',
                                    servingSize: '',
                                    difficulty: '',
                                    mealImage: '',
                                    mealVideo: '',
                                    tags: [],
                                    notes: ''
                                  } : undefined
                                });
                                setEditingContentId(null);
                                setShowContentDialog(true);
                              }}
                            >
                            <Plus className="w-4 h-4 mr-2" />
                            {course.courseType === 'meal_plan' ? 'Add First Meal' : 'Add First Lesson'}
                            </Button>
                          </div>
                        )}
                    </CardContent>
                </Card>
                );
              })()}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                {course.courseType === 'meal_plan' ? (
                  <UtensilsCrossed className="h-16 w-16 text-muted-foreground mb-4" />
                ) : (
                  <Video className="h-16 w-16 text-muted-foreground mb-4" />
                )}
                <h3 className="text-lg font-medium mb-2">
                  Select a {course.courseType === 'meal_plan' ? 'Day' : 'Module'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {course.courseType === 'meal_plan'
                    ? 'Go to the Days tab and click "Manage Meals" on a day to add meals'
                    : 'Go to the Modules tab and click "Manage Lessons" on a module to add lessons'}
                </p>
                <Button onClick={() => setCourseEditTab('modules')}>
                  Go to {course.courseType === 'meal_plan' ? 'Days' : 'Modules'}
                </Button>
        </CardContent>
      </Card>
      )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {/* Course Overview - Content based on category */}
          {courseCategoryTab === 'customer' ? (
            <>
              {/* Course Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Settings</CardTitle>
                  <CardDescription>
                    Basic information about your customer course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info Section */}
                  <div className="space-y-4 p-5 rounded-lg border-l-2 border-blue-300">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="course-title" className="text-sm font-medium">Course Title *</Label>
                        <Input
                          id="course-title"
                          value={course.title}
                          onChange={(e) => setCourse(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter course title"
                          className="max-w-md mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="course-type" className="text-sm font-medium">Course Type *</Label>
                        <Select 
                          value={course.courseType} 
                          onValueChange={(value) => {
                            setCustomerCourseTypeTab(value);
                            setCourse(prev => ({ ...prev, courseType: value }));
                          }}
                        >
                          <SelectTrigger className="w-full mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="workout_routine">Workout Routine</SelectItem>
                            <SelectItem value="meal_plan">Meal Planner</SelectItem>
                            <SelectItem value="general_module_course">General Module Based Courses</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* FunnelsEye Experience Section */}
                  <div className="space-y-4 p-5 rounded-lg border-l-2 border-indigo-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-indigo-500" />
                      <h3 className="text-lg font-semibold">FunnelsEye Experience</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Craft the branded story learners will see on the public course page. Use these highlights to go beyond a generic marketplace listing.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="funnels-headline" className="text-sm font-medium">Hero Headline</Label>
                        <Input
                          id="funnels-headline"
                          value={course.funnelsEyeExtras.headline}
                          onChange={(e) => setCourse(prev => ({
                            ...prev,
                            funnelsEyeExtras: {
                              ...prev.funnelsEyeExtras,
                              headline: e.target.value
                            }
                          }))}
                          placeholder="Example: Build a High-Converting Coaching Engine in 8 Weeks"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="funnels-subheadline" className="text-sm font-medium">Sub Headline</Label>
                        <Input
                          id="funnels-subheadline"
                          value={course.funnelsEyeExtras.subheadline}
                          onChange={(e) => setCourse(prev => ({
                            ...prev,
                            funnelsEyeExtras: {
                              ...prev.funnelsEyeExtras,
                              subheadline: e.target.value
                            }
                          }))}
                          placeholder="Share the transformation hook in one sentence"
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="funnels-promise" className="text-sm font-medium">Transformation Promise</Label>
                        <Textarea
                          id="funnels-promise"
                          rows={3}
                          value={course.funnelsEyeExtras.transformationPromise}
                          onChange={(e) => setCourse(prev => ({
                            ...prev,
                            funnelsEyeExtras: {
                              ...prev.funnelsEyeExtras,
                              transformationPromise: e.target.value
                            }
                          }))}
                          placeholder="Describe the tangible outcome and timeline your learners can expect."
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="funnels-guarantee" className="text-sm font-medium">Guarantee / Assurance</Label>
                        <Textarea
                          id="funnels-guarantee"
                          rows={3}
                          value={course.funnelsEyeExtras.guarantee}
                          onChange={(e) => setCourse(prev => ({
                            ...prev,
                            funnelsEyeExtras: {
                              ...prev.funnelsEyeExtras,
                              guarantee: e.target.value
                            }
                          }))}
                          placeholder="Example: 30-day FunnelsEye progress guarantee"
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="funnels-support" className="text-sm font-medium">Coach Support</Label>
                        <Textarea
                          id="funnels-support"
                          rows={3}
                          value={course.funnelsEyeExtras.coachSupport}
                          onChange={(e) => setCourse(prev => ({
                            ...prev,
                            funnelsEyeExtras: {
                              ...prev.funnelsEyeExtras,
                              coachSupport: e.target.value
                            }
                          }))}
                          placeholder="Outline touchpoints, office hours, or accountability systems."
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="funnels-community" className="text-sm font-medium">Community Access</Label>
                        <Textarea
                          id="funnels-community"
                          rows={3}
                          value={course.funnelsEyeExtras.communityAccess}
                          onChange={(e) => setCourse(prev => ({
                            ...prev,
                            funnelsEyeExtras: {
                              ...prev.funnelsEyeExtras,
                              communityAccess: e.target.value
                            }
                          }))}
                          placeholder="Highlight peer groups, live events, or Slack/WhatsApp communities."
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="funnels-success-metrics" className="text-sm font-medium">Success Metrics (one per line)</Label>
                        <Textarea
                          id="funnels-success-metrics"
                          rows={3}
                          value={(course.funnelsEyeExtras.successMetrics || []).join('\n')}
                          onChange={(e) => {
                            const entries = e.target.value
                              .split('\n')
                              .map(item => item.trim())
                              .filter(Boolean);
                            setCourse(prev => ({
                              ...prev,
                              funnelsEyeExtras: {
                                ...prev.funnelsEyeExtras,
                                successMetrics: entries
                              }
                            }));
                          }}
                          placeholder="e.g. 87% completion rate in last cohort"
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="funnels-bonus" className="text-sm font-medium">Bonus Resources (one per line)</Label>
                        <Textarea
                          id="funnels-bonus"
                          rows={3}
                          value={(course.funnelsEyeExtras.bonusResources || []).join('\n')}
                          onChange={(e) => {
                            const entries = e.target.value
                              .split('\n')
                              .map(item => item.trim())
                              .filter(Boolean);
                            setCourse(prev => ({
                              ...prev,
                              funnelsEyeExtras: {
                                ...prev.funnelsEyeExtras,
                                bonusResources: entries
                              }
                            }));
                          }}
                          placeholder="e.g. Done-for-you funnel templates"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="funnels-tools" className="text-sm font-medium">Platform Tools Highlight (one per line)</Label>
                        <Textarea
                          id="funnels-tools"
                          rows={3}
                          value={(course.funnelsEyeExtras.platformTools || []).join('\n')}
                          onChange={(e) => {
                            const entries = e.target.value
                              .split('\n')
                              .map(item => item.trim())
                              .filter(Boolean);
                            setCourse(prev => ({
                              ...prev,
                              funnelsEyeExtras: {
                                ...prev.funnelsEyeExtras,
                                platformTools: entries
                              }
                            }));
                          }}
                          placeholder="e.g. AI-generated nurture scripts, CRM automations"
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Status Section */}
                  <div className="space-y-4 p-5 rounded-lg border-l-2 border-green-300">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <h3 className="text-lg font-semibold">Pricing & Status</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="course-currency" className="text-sm font-medium">Currency *</Label>
                        <Select 
                          value={course.currency || 'USD'} 
                          onValueChange={(value) => setCourse(prev => ({ ...prev, currency: value }))}
                        >
                          <SelectTrigger className="w-full mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                            <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                            <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                            <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                            <SelectItem value="HKD">HKD - Hong Kong Dollar</SelectItem>
                            <SelectItem value="NZD">NZD - New Zealand Dollar</SelectItem>
                            <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                            <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                            <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                            <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                            <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                            <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                            <SelectItem value="ARS">ARS - Argentine Peso</SelectItem>
                            <SelectItem value="KRW">KRW - South Korean Won</SelectItem>
                            <SelectItem value="THB">THB - Thai Baht</SelectItem>
                            <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
                            <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                            <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                            <SelectItem value="VND">VND - Vietnamese Dong</SelectItem>
                            <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                            <SelectItem value="BDT">BDT - Bangladeshi Taka</SelectItem>
                            <SelectItem value="TRY">TRY - Turkish Lira</SelectItem>
                            <SelectItem value="RUB">RUB - Russian Ruble</SelectItem>
                            <SelectItem value="PLN">PLN - Polish Zloty</SelectItem>
                            <SelectItem value="CZK">CZK - Czech Koruna</SelectItem>
                            <SelectItem value="SEK">SEK - Swedish Krona</SelectItem>
                            <SelectItem value="NOK">NOK - Norwegian Krone</SelectItem>
                            <SelectItem value="DKK">DKK - Danish Krone</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="course-price" className="text-sm font-medium">Price *</Label>
                        <Input
                          id="course-price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={course.price}
                          onChange={(e) => setCourse(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                          className="max-w-xs mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="course-status" className="text-sm font-medium">Status</Label>
                        <Select 
                          value={course.status} 
                          onValueChange={(value) => setCourse(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger className="w-full max-w-xs mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Badge variant="outline" className="w-full max-w-xs p-2 text-center">
                          Category: Customer Course
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="space-y-4 p-5 rounded-lg border-l-2 border-purple-300">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-purple-500" />
                      <h3 className="text-lg font-semibold">Description</h3>
                    </div>
                    <div>
                      <Label htmlFor="course-description" className="text-sm font-medium">Course Description</Label>
                      <Textarea
                        id="course-description"
                        value={course.description}
                        onChange={(e) => setCourse(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter course description"
                        rows={3}
                        className="max-w-2xl mt-1.5"
                      />
                    </div>
                  </div>

                  {/* Thumbnail Section */}
                  <div className="space-y-4 p-5 rounded-lg border-l-2 border-orange-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Image className="h-5 w-5 text-orange-500" />
                      <h3 className="text-lg font-semibold">Thumbnail</h3>
                    </div>
                    <div>
                      <Label htmlFor="course-thumbnail" className="text-sm font-medium">Thumbnail Image</Label>
                      <div className="flex items-center gap-2 max-w-2xl mt-1.5">
                        <Input
                          id="course-thumbnail"
                          value={course.thumbnail}
                          onChange={(e) => setCourse(prev => ({ ...prev, thumbnail: e.target.value }))}
                          placeholder="No thumbnail selected"
                          className="flex-1"
                          readOnly
                        />
                        <Button type="button" variant="outline" onClick={openThumbnailExplorer}>
                          <Image className="w-4 h-4 mr-2" />
                          Browse Files
                        </Button>
                        {course.thumbnail && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setCourse(prev => ({ ...prev, thumbnail: '' }))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {course.thumbnail && (
                        <div className="mt-2 max-w-xs">
                          <img src={course.thumbnail} alt="Thumbnail preview" className="rounded-lg border max-h-32 object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Workout Routine Specific Fields */}
                  {course.courseType === 'workout_routine' && (
                    <div className="space-y-6 p-5 rounded-lg border-l-2 border-red-300">
                      <div className="flex items-center gap-2 mb-4">
                        <Dumbbell className="h-5 w-5 text-red-500" />
                        <h3 className="text-lg font-semibold">Workout Routine Details</h3>
                      </div>

                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Basic Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="workout-difficulty" className="text-sm font-medium">Difficulty Level *</Label>
                            <Select 
                              value={course.workoutSpecificFields?.difficulty || ''}
                              onValueChange={(value) => setCourse(prev => ({
                                ...prev,
                                workoutSpecificFields: {
                                  ...prev.workoutSpecificFields,
                                  difficulty: value
                                }
                              }))}
                            >
                              <SelectTrigger className="w-full mt-1.5">
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="workout-duration" className="text-sm font-medium">Duration (minutes per session) *</Label>
                            <Input
                              id="workout-duration"
                              type="number"
                              min="0"
                              value={course.workoutSpecificFields?.duration || ''}
                              onChange={(e) => setCourse(prev => ({
                                ...prev,
                                workoutSpecificFields: {
                                  ...prev.workoutSpecificFields,
                                  duration: e.target.value
                                }
                              }))}
                              placeholder="e.g., 45"
                              className="w-full mt-1.5"
                            />
                          </div>
                          <div>
                            <Label htmlFor="workout-frequency" className="text-sm font-medium">Workout Frequency *</Label>
                            <Select
                              value={course.workoutSpecificFields?.workoutFrequency || ''}
                              onValueChange={(value) => setCourse(prev => ({
                                ...prev,
                                workoutSpecificFields: {
                                  ...prev.workoutSpecificFields,
                                  workoutFrequency: value
                                }
                              }))}
                            >
                              <SelectTrigger className="w-full mt-1.5">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1 time per week">1 time per week</SelectItem>
                                <SelectItem value="2 times per week">2 times per week</SelectItem>
                                <SelectItem value="3 times per week">3 times per week</SelectItem>
                                <SelectItem value="4 times per week">4 times per week</SelectItem>
                                <SelectItem value="5 times per week">5 times per week</SelectItem>
                                <SelectItem value="6 times per week">6 times per week</SelectItem>
                                <SelectItem value="Daily">Daily</SelectItem>
                                <SelectItem value="Custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {course.workoutSpecificFields?.workoutFrequency === 'Custom' && (
                          <div>
                            <Label htmlFor="custom-frequency-customer" className="text-sm font-medium">Custom Frequency</Label>
                            <Input
                              id="custom-frequency-customer"
                              value={course.workoutSpecificFields?.customFrequency || ''}
                              onChange={(e) => setCourse(prev => ({
                                ...prev,
                                workoutSpecificFields: {
                                  ...prev.workoutSpecificFields,
                                  customFrequency: e.target.value
                                }
                              }))}
                              placeholder="e.g., Every other day"
                              className="max-w-md mt-1.5"
                            />
                          </div>
                        )}
                      </div>

                      {/* Equipment Selection */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Dumbbell className="h-4 w-4" />
                          Required Equipment
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {['None', 'Dumbbells', 'Barbell', 'Kettlebells', 'Resistance Bands', 'Pull-up Bar', 'Bench', 'Cable Machine', 'Smith Machine', 'Leg Press', 'Treadmill', 'Stationary Bike', 'Rowing Machine', 'Yoga Mat', 'Medicine Ball', 'Foam Roller', 'Jump Rope', 'TRX', 'Battle Ropes', 'Plyometric Box'].map((equipment) => (
                            <div key={equipment} className="flex items-center space-x-2">
                              <Checkbox
                                id={`equipment-customer-${equipment}`}
                                checked={course.workoutSpecificFields?.equipment?.includes(equipment) || false}
                                onCheckedChange={(checked) => {
                                  const currentEquipment = course.workoutSpecificFields?.equipment || [];
                                  if (checked) {
                                    setCourse(prev => ({
                                      ...prev,
                                      workoutSpecificFields: {
                                        ...prev.workoutSpecificFields,
                                        equipment: [...currentEquipment, equipment]
                                      }
                                    }));
                                  } else {
                                    setCourse(prev => ({
                                      ...prev,
                                      workoutSpecificFields: {
                                        ...prev.workoutSpecificFields,
                                        equipment: currentEquipment.filter(e => e !== equipment)
                                      }
                                    }));
                                  }
                                }}
                              />
                              <Label htmlFor={`equipment-customer-${equipment}`} className="text-sm font-normal cursor-pointer">
                                {equipment}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Target Muscle Groups */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Target Muscle Groups
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {['Full Body', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Abs', 'Obliques', 'Forearms', 'Cardio', 'Flexibility', 'Balance'].map((muscle) => (
                            <div key={muscle} className="flex items-center space-x-2">
                              <Checkbox
                                id={`muscle-customer-${muscle}`}
                                checked={course.workoutSpecificFields?.muscleGroups?.includes(muscle) || false}
                                onCheckedChange={(checked) => {
                                  const currentMuscles = course.workoutSpecificFields?.muscleGroups || [];
                                  if (checked) {
                                    setCourse(prev => ({
                                      ...prev,
                                      workoutSpecificFields: {
                                        ...prev.workoutSpecificFields,
                                        muscleGroups: [...currentMuscles, muscle]
                                      }
                                    }));
                                  } else {
                                    setCourse(prev => ({
                                      ...prev,
                                      workoutSpecificFields: {
                                        ...prev.workoutSpecificFields,
                                        muscleGroups: currentMuscles.filter(m => m !== muscle)
                                      }
                                    }));
                                  }
                                }}
                              />
                              <Label htmlFor={`muscle-customer-${muscle}`} className="text-sm font-normal cursor-pointer">
                                {muscle}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Workout Type & Goals */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Workout Type & Goals
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="workout-type-customer" className="text-sm font-medium">Workout Type</Label>
                            <Select
                              value={course.workoutSpecificFields?.workoutType || ''}
                              onValueChange={(value) => setCourse(prev => ({
                                ...prev,
                                workoutSpecificFields: {
                                  ...prev.workoutSpecificFields,
                                  workoutType: value
                                }
                              }))}
                            >
                              <SelectTrigger className="w-full mt-1.5">
                                <SelectValue placeholder="Select workout type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="strength">Strength Training</SelectItem>
                                <SelectItem value="cardio">Cardio</SelectItem>
                                <SelectItem value="hiit">HIIT (High Intensity Interval Training)</SelectItem>
                                <SelectItem value="circuit">Circuit Training</SelectItem>
                                <SelectItem value="endurance">Endurance</SelectItem>
                                <SelectItem value="flexibility">Flexibility & Mobility</SelectItem>
                                <SelectItem value="powerlifting">Powerlifting</SelectItem>
                                <SelectItem value="bodybuilding">Bodybuilding</SelectItem>
                                <SelectItem value="crossfit">CrossFit</SelectItem>
                                <SelectItem value="pilates">Pilates</SelectItem>
                                <SelectItem value="yoga">Yoga</SelectItem>
                                <SelectItem value="mixed">Mixed Training</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="target-goal-customer" className="text-sm font-medium">Primary Goal</Label>
                            <Select
                              value={course.workoutSpecificFields?.targetGoal || ''}
                              onValueChange={(value) => setCourse(prev => ({
                                ...prev,
                                workoutSpecificFields: {
                                  ...prev.workoutSpecificFields,
                                  targetGoal: value
                                }
                              }))}
                            >
                              <SelectTrigger className="w-full mt-1.5">
                                <SelectValue placeholder="Select primary goal" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                                <SelectItem value="strength">Strength Building</SelectItem>
                                <SelectItem value="endurance">Endurance</SelectItem>
                                <SelectItem value="toning">Toning & Definition</SelectItem>
                                <SelectItem value="flexibility">Flexibility</SelectItem>
                                <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                                <SelectItem value="sports_performance">Sports Performance</SelectItem>
                                <SelectItem value="general_fitness">General Fitness</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-700">Additional Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="rest-periods-customer" className="text-sm font-medium">Rest Periods (seconds)</Label>
                            <Input
                              id="rest-periods-customer"
                              type="number"
                              min="0"
                              value={course.workoutSpecificFields?.restPeriods || ''}
                              onChange={(e) => setCourse(prev => ({
                                ...prev,
                                workoutSpecificFields: {
                                  ...prev.workoutSpecificFields,
                                  restPeriods: e.target.value
                                }
                              }))}
                              placeholder="e.g., 60"
                              className="w-full mt-1.5"
                            />
                          </div>
                          <div>
                            <Label htmlFor="exercises-per-session-customer" className="text-sm font-medium">Exercises Per Session</Label>
                            <Input
                              id="exercises-per-session-customer"
                              type="number"
                              min="1"
                              value={course.workoutSpecificFields?.exercisesPerSession || ''}
                              onChange={(e) => setCourse(prev => ({
                                ...prev,
                                workoutSpecificFields: {
                                  ...prev.workoutSpecificFields,
                                  exercisesPerSession: e.target.value
                                }
                              }))}
                              placeholder="e.g., 8"
                              className="w-full mt-1.5"
                            />
                          </div>
                          <div>
                            <Label htmlFor="program-duration-customer" className="text-sm font-medium">Program Duration</Label>
                            <Input
                              id="program-duration-customer"
                              value={course.workoutSpecificFields?.programDuration || ''}
                              onChange={(e) => setCourse(prev => ({
                                ...prev,
                                workoutSpecificFields: {
                                  ...prev.workoutSpecificFields,
                                  programDuration: e.target.value
                                }
                              }))}
                              placeholder="e.g., 4 weeks, 12 weeks"
                              className="w-full mt-1.5"
                            />
                          </div>
                          <div>
                            <Label htmlFor="intensity-level-customer" className="text-sm font-medium">Intensity Level</Label>
                            <Select
                              value={course.workoutSpecificFields?.intensityLevel || ''}
                              onValueChange={(value) => setCourse(prev => ({
                                ...prev,
                                workoutSpecificFields: {
                                  ...prev.workoutSpecificFields,
                                  intensityLevel: value
                                }
                              }))}
                            >
                              <SelectTrigger className="w-full mt-1.5">
                                <SelectValue placeholder="Select intensity" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="very_high">Very High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Selected Equipment & Muscle Groups Display */}
                      {(course.workoutSpecificFields?.equipment?.length > 0 || course.workoutSpecificFields?.muscleGroups?.length > 0) && (
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                          {course.workoutSpecificFields?.equipment?.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Selected Equipment:</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {course.workoutSpecificFields.equipment.map((eq) => (
                                  <Badge key={eq} variant="secondary">{eq}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {course.workoutSpecificFields?.muscleGroups?.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Target Muscle Groups:</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {course.workoutSpecificFields.muscleGroups.map((mg) => (
                                  <Badge key={mg} variant="secondary">{mg}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Meal Plan Specific Fields */}
                  {course.courseType === 'meal_plan' && (
                    <div className="space-y-4 p-5 rounded-lg border-l-2 border-emerald-300">
                      <div className="flex items-center gap-2 mb-2">
                        <UtensilsCrossed className="h-5 w-5 text-emerald-500" />
                        <h3 className="text-lg font-semibold">Meal Plan Details</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="meal-type" className="text-sm font-medium">Meal Plan Type</Label>
                          <Select
                            value={course.mealPlanSpecificFields?.mealType || ''}
                            onValueChange={(value) => setCourse(prev => ({
                              ...prev,
                              mealPlanSpecificFields: {
                                ...prev.mealPlanSpecificFields,
                                mealType: value
                              }
                            }))}
                          >
                            <SelectTrigger className="w-full max-w-xs mt-1.5">
                              <SelectValue placeholder="Select meal plan type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weight_loss">Weight Loss</SelectItem>
                              <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="keto">Keto</SelectItem>
                              <SelectItem value="vegetarian">Vegetarian</SelectItem>
                              <SelectItem value="vegan">Vegan</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="meal-duration" className="text-sm font-medium">Duration (days)</Label>
                          <Input
                            id="meal-duration"
                            type="number"
                            min="1"
                            value={course.mealPlanSpecificFields?.duration || ''}
                            onChange={(e) => setCourse(prev => ({
                              ...prev,
                              mealPlanSpecificFields: {
                                ...prev.mealPlanSpecificFields,
                                duration: e.target.value
                              }
                            }))}
                            placeholder="e.g., 30"
                            className="max-w-xs mt-1.5"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="calories-per-day" className="text-sm font-medium">Calories Per Day</Label>
                          <Input
                            id="calories-per-day"
                            type="number"
                            min="0"
                            value={course.mealPlanSpecificFields?.caloriesPerDay || ''}
                            onChange={(e) => setCourse(prev => ({
                              ...prev,
                              mealPlanSpecificFields: {
                                ...prev.mealPlanSpecificFields,
                                caloriesPerDay: e.target.value
                              }
                            }))}
                            placeholder="e.g., 2000"
                            className="max-w-xs mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="meals-per-day" className="text-sm font-medium">Meals Per Day</Label>
                          <Input
                            id="meals-per-day"
                            type="number"
                            min="1"
                            max="10"
                            value={course.mealPlanSpecificFields?.mealsPerDay || ''}
                            onChange={(e) => setCourse(prev => ({
                              ...prev,
                              mealPlanSpecificFields: {
                                ...prev.mealPlanSpecificFields,
                                mealsPerDay: e.target.value
                              }
                            }))}
                            placeholder="e.g., 5"
                            className="max-w-xs mt-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* General Module Course Specific Fields */}
                  {course.courseType === 'general_module_course' && (
                    <div className="space-y-4 p-5 rounded-lg border-l-2 border-indigo-300">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-5 w-5 text-indigo-500" />
                        <h3 className="text-lg font-semibold">Course Details</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="general-difficulty" className="text-sm font-medium">Difficulty Level</Label>
                          <Select
                            value={course.generalModuleFields?.difficulty || ''}
                            onValueChange={(value) => setCourse(prev => ({
                              ...prev,
                              generalModuleFields: {
                                ...prev.generalModuleFields,
                                difficulty: value
                              }
                            }))}
                          >
                            <SelectTrigger className="w-full max-w-xs mt-1.5">
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="estimated-duration" className="text-sm font-medium">Estimated Duration</Label>
                          <Input
                            id="estimated-duration"
                            value={course.generalModuleFields?.estimatedDuration || ''}
                            onChange={(e) => setCourse(prev => ({
                              ...prev,
                              generalModuleFields: {
                                ...prev.generalModuleFields,
                                estimatedDuration: e.target.value
                              }
                            }))}
                            placeholder="e.g., 4 weeks, 2 months"
                            className="max-w-xs mt-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                </Card>
            </>
          ) : (
            /* Coach Courses */
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
                <CardDescription>
                  Basic information about your coach course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info Section */}
                <div className="space-y-4 p-5 rounded-lg border-l-2 border-blue-300">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="coach-course-title" className="text-sm font-medium">Course Title *</Label>
                      <Input
                        id="coach-course-title"
                        value={course.title}
                        onChange={(e) => setCourse(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter course title"
                        className="max-w-md mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coach-course-type" className="text-sm font-medium">Course Type</Label>
                      <Select 
                        value={course.courseType || 'general_module_course'} 
                        onValueChange={(value) => setCourse(prev => ({ ...prev, courseType: value }))}
                      >
                        <SelectTrigger className="w-full mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general_module_course">General Module Based Course</SelectItem>
                          <SelectItem value="workout_routine">Workout Routine</SelectItem>
                          <SelectItem value="meal_plan">Meal Plan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Pricing & Status Section */}
                <div className="space-y-4 p-5 rounded-lg border-l-2 border-green-300">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-semibold">Pricing & Status</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="coach-course-currency" className="text-sm font-medium">Currency *</Label>
                      <Select 
                        value={course.currency || 'USD'} 
                        onValueChange={(value) => setCourse(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger className="w-full mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                          <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                          <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                          <SelectItem value="HKD">HKD - Hong Kong Dollar</SelectItem>
                          <SelectItem value="NZD">NZD - New Zealand Dollar</SelectItem>
                          <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                          <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                          <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                          <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                          <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                          <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                          <SelectItem value="ARS">ARS - Argentine Peso</SelectItem>
                          <SelectItem value="KRW">KRW - South Korean Won</SelectItem>
                          <SelectItem value="THB">THB - Thai Baht</SelectItem>
                          <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
                          <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                          <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                          <SelectItem value="VND">VND - Vietnamese Dong</SelectItem>
                          <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                          <SelectItem value="BDT">BDT - Bangladeshi Taka</SelectItem>
                          <SelectItem value="TRY">TRY - Turkish Lira</SelectItem>
                          <SelectItem value="RUB">RUB - Russian Ruble</SelectItem>
                          <SelectItem value="PLN">PLN - Polish Zloty</SelectItem>
                          <SelectItem value="CZK">CZK - Czech Koruna</SelectItem>
                          <SelectItem value="SEK">SEK - Swedish Krona</SelectItem>
                          <SelectItem value="NOK">NOK - Norwegian Krone</SelectItem>
                          <SelectItem value="DKK">DKK - Danish Krone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="coach-course-price" className="text-sm font-medium">Price *</Label>
                      <Input
                        id="coach-course-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={course.price}
                        onChange={(e) => setCourse(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                        className="max-w-xs mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coach-course-status" className="text-sm font-medium">Status</Label>
                      <Select 
                        value={course.status} 
                        onValueChange={(value) => setCourse(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="w-full max-w-xs mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Badge variant="outline" className="w-full max-w-xs p-2 text-center">
                        Category: Coach Course
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-4 p-5 rounded-lg border-l-2 border-purple-300">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <h3 className="text-lg font-semibold">Description</h3>
                  </div>
                  <div>
                    <Label htmlFor="coach-course-description" className="text-sm font-medium">Course Description</Label>
                    <Textarea
                      id="coach-course-description"
                      value={course.description}
                      onChange={(e) => setCourse(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter course description"
                      rows={3}
                      className="max-w-2xl mt-1.5"
                    />
                  </div>
                </div>

                {/* Thumbnail Section */}
                <div className="space-y-4 p-5 rounded-lg border-l-2 border-orange-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="h-5 w-5 text-orange-500" />
                    <h3 className="text-lg font-semibold">Thumbnail</h3>
                  </div>
                  <div>
                    <Label htmlFor="coach-course-thumbnail" className="text-sm font-medium">Thumbnail Image</Label>
                    <div className="flex items-center gap-2 max-w-2xl mt-1.5">
                      <Input
                        id="coach-course-thumbnail"
                        value={course.thumbnail}
                        onChange={(e) => setCourse(prev => ({ ...prev, thumbnail: e.target.value }))}
                        placeholder="No thumbnail selected"
                        className="flex-1"
                        readOnly
                      />
                      <Button type="button" variant="outline" onClick={openThumbnailExplorer}>
                        <Image className="w-4 h-4 mr-2" />
                        Browse Files
                      </Button>
                      {course.thumbnail && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setCourse(prev => ({ ...prev, thumbnail: '' }))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {course.thumbnail && (
                      <div className="mt-2 max-w-xs">
                        <img src={course.thumbnail} alt="Thumbnail preview" className="rounded-lg border max-h-32 object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Workout Routine Specific Fields */}
                {course.courseType === 'workout_routine' && (
                  <div className="space-y-6 p-5 rounded-lg border-l-2 border-red-300">
                    <div className="flex items-center gap-2 mb-4">
                      <Dumbbell className="h-5 w-5 text-red-500" />
                      <h3 className="text-lg font-semibold">Workout Routine Details</h3>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="coach-workout-difficulty" className="text-sm font-medium">Difficulty Level *</Label>
                          <Select 
                            value={course.workoutSpecificFields?.difficulty || ''}
                            onValueChange={(value) => setCourse(prev => ({
                              ...prev,
                              workoutSpecificFields: {
                                ...prev.workoutSpecificFields,
                                difficulty: value
                              }
                            }))}
                          >
                            <SelectTrigger className="w-full mt-1.5">
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="coach-workout-duration" className="text-sm font-medium">Duration (minutes per session) *</Label>
                          <Input
                            id="coach-workout-duration"
                            type="number"
                            min="0"
                            value={course.workoutSpecificFields?.duration || ''}
                            onChange={(e) => setCourse(prev => ({
                              ...prev,
                              workoutSpecificFields: {
                                ...prev.workoutSpecificFields,
                                duration: e.target.value
                              }
                            }))}
                            placeholder="e.g., 45"
                            className="w-full mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="coach-workout-frequency" className="text-sm font-medium">Workout Frequency *</Label>
                          <Select
                            value={course.workoutSpecificFields?.workoutFrequency || ''}
                            onValueChange={(value) => setCourse(prev => ({
                              ...prev,
                              workoutSpecificFields: {
                                ...prev.workoutSpecificFields,
                                workoutFrequency: value
                              }
                            }))}
                          >
                            <SelectTrigger className="w-full mt-1.5">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1 time per week">1 time per week</SelectItem>
                              <SelectItem value="2 times per week">2 times per week</SelectItem>
                              <SelectItem value="3 times per week">3 times per week</SelectItem>
                              <SelectItem value="4 times per week">4 times per week</SelectItem>
                              <SelectItem value="5 times per week">5 times per week</SelectItem>
                              <SelectItem value="6 times per week">6 times per week</SelectItem>
                              <SelectItem value="Daily">Daily</SelectItem>
                              <SelectItem value="Custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {course.workoutSpecificFields?.workoutFrequency === 'Custom' && (
                        <div>
                          <Label htmlFor="custom-frequency" className="text-sm font-medium">Custom Frequency</Label>
                          <Input
                            id="custom-frequency"
                            value={course.workoutSpecificFields?.customFrequency || ''}
                            onChange={(e) => setCourse(prev => ({
                              ...prev,
                              workoutSpecificFields: {
                                ...prev.workoutSpecificFields,
                                customFrequency: e.target.value
                              }
                            }))}
                            placeholder="e.g., Every other day"
                            className="max-w-md mt-1.5"
                          />
                        </div>
                      )}
                    </div>

                    {/* Equipment Selection */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Dumbbell className="h-4 w-4" />
                        Required Equipment
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {['None', 'Dumbbells', 'Barbell', 'Kettlebells', 'Resistance Bands', 'Pull-up Bar', 'Bench', 'Cable Machine', 'Smith Machine', 'Leg Press', 'Treadmill', 'Stationary Bike', 'Rowing Machine', 'Yoga Mat', 'Medicine Ball', 'Foam Roller', 'Jump Rope', 'TRX', 'Battle Ropes', 'Plyometric Box'].map((equipment) => (
                          <div key={equipment} className="flex items-center space-x-2">
                            <Checkbox
                              id={`equipment-${equipment}`}
                              checked={course.workoutSpecificFields?.equipment?.includes(equipment) || false}
                              onCheckedChange={(checked) => {
                                const currentEquipment = course.workoutSpecificFields?.equipment || [];
                                if (checked) {
                                  setCourse(prev => ({
                                    ...prev,
                                    workoutSpecificFields: {
                                      ...prev.workoutSpecificFields,
                                      equipment: [...currentEquipment, equipment]
                                    }
                                  }));
                                } else {
                                  setCourse(prev => ({
                                    ...prev,
                                    workoutSpecificFields: {
                                      ...prev.workoutSpecificFields,
                                      equipment: currentEquipment.filter(e => e !== equipment)
                                    }
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={`equipment-${equipment}`} className="text-sm font-normal cursor-pointer">
                              {equipment}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Target Muscle Groups */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Target Muscle Groups
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {['Full Body', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Abs', 'Obliques', 'Forearms', 'Cardio', 'Flexibility', 'Balance'].map((muscle) => (
                          <div key={muscle} className="flex items-center space-x-2">
                            <Checkbox
                              id={`muscle-${muscle}`}
                              checked={course.workoutSpecificFields?.muscleGroups?.includes(muscle) || false}
                              onCheckedChange={(checked) => {
                                const currentMuscles = course.workoutSpecificFields?.muscleGroups || [];
                                if (checked) {
                                  setCourse(prev => ({
                                    ...prev,
                                    workoutSpecificFields: {
                                      ...prev.workoutSpecificFields,
                                      muscleGroups: [...currentMuscles, muscle]
                                    }
                                  }));
                                } else {
                                  setCourse(prev => ({
                                    ...prev,
                                    workoutSpecificFields: {
                                      ...prev.workoutSpecificFields,
                                      muscleGroups: currentMuscles.filter(m => m !== muscle)
                                    }
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={`muscle-${muscle}`} className="text-sm font-normal cursor-pointer">
                              {muscle}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Workout Type & Goals */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Workout Type & Goals
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="workout-type" className="text-sm font-medium">Workout Type</Label>
                          <Select
                            value={course.workoutSpecificFields?.workoutType || ''}
                            onValueChange={(value) => setCourse(prev => ({
                              ...prev,
                              workoutSpecificFields: {
                                ...prev.workoutSpecificFields,
                                workoutType: value
                              }
                            }))}
                          >
                            <SelectTrigger className="w-full mt-1.5">
                              <SelectValue placeholder="Select workout type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="strength">Strength Training</SelectItem>
                              <SelectItem value="cardio">Cardio</SelectItem>
                              <SelectItem value="hiit">HIIT (High Intensity Interval Training)</SelectItem>
                              <SelectItem value="circuit">Circuit Training</SelectItem>
                              <SelectItem value="endurance">Endurance</SelectItem>
                              <SelectItem value="flexibility">Flexibility & Mobility</SelectItem>
                              <SelectItem value="powerlifting">Powerlifting</SelectItem>
                              <SelectItem value="bodybuilding">Bodybuilding</SelectItem>
                              <SelectItem value="crossfit">CrossFit</SelectItem>
                              <SelectItem value="pilates">Pilates</SelectItem>
                              <SelectItem value="yoga">Yoga</SelectItem>
                              <SelectItem value="mixed">Mixed Training</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="target-goal" className="text-sm font-medium">Primary Goal</Label>
                          <Select
                            value={course.workoutSpecificFields?.targetGoal || ''}
                            onValueChange={(value) => setCourse(prev => ({
                              ...prev,
                              workoutSpecificFields: {
                                ...prev.workoutSpecificFields,
                                targetGoal: value
                              }
                            }))}
                          >
                            <SelectTrigger className="w-full mt-1.5">
                              <SelectValue placeholder="Select primary goal" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weight_loss">Weight Loss</SelectItem>
                              <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                              <SelectItem value="strength">Strength Building</SelectItem>
                              <SelectItem value="endurance">Endurance</SelectItem>
                              <SelectItem value="toning">Toning & Definition</SelectItem>
                              <SelectItem value="flexibility">Flexibility</SelectItem>
                              <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                              <SelectItem value="sports_performance">Sports Performance</SelectItem>
                              <SelectItem value="general_fitness">General Fitness</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-700">Additional Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="rest-periods" className="text-sm font-medium">Rest Periods (seconds)</Label>
                          <Input
                            id="rest-periods"
                            type="number"
                            min="0"
                            value={course.workoutSpecificFields?.restPeriods || ''}
                            onChange={(e) => setCourse(prev => ({
                              ...prev,
                              workoutSpecificFields: {
                                ...prev.workoutSpecificFields,
                                restPeriods: e.target.value
                              }
                            }))}
                            placeholder="e.g., 60"
                            className="w-full mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="exercises-per-session" className="text-sm font-medium">Exercises Per Session</Label>
                          <Input
                            id="exercises-per-session"
                            type="number"
                            min="1"
                            value={course.workoutSpecificFields?.exercisesPerSession || ''}
                            onChange={(e) => setCourse(prev => ({
                              ...prev,
                              workoutSpecificFields: {
                                ...prev.workoutSpecificFields,
                                exercisesPerSession: e.target.value
                              }
                            }))}
                            placeholder="e.g., 8"
                            className="w-full mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="program-duration" className="text-sm font-medium">Program Duration</Label>
                          <Input
                            id="program-duration"
                            value={course.workoutSpecificFields?.programDuration || ''}
                            onChange={(e) => setCourse(prev => ({
                              ...prev,
                              workoutSpecificFields: {
                                ...prev.workoutSpecificFields,
                                programDuration: e.target.value
                              }
                            }))}
                            placeholder="e.g., 4 weeks, 12 weeks"
                            className="w-full mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="intensity-level" className="text-sm font-medium">Intensity Level</Label>
                          <Select
                            value={course.workoutSpecificFields?.intensityLevel || ''}
                            onValueChange={(value) => setCourse(prev => ({
                              ...prev,
                              workoutSpecificFields: {
                                ...prev.workoutSpecificFields,
                                intensityLevel: value
                              }
                            }))}
                          >
                            <SelectTrigger className="w-full mt-1.5">
                              <SelectValue placeholder="Select intensity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="very_high">Very High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Selected Equipment & Muscle Groups Display */}
                    {(course.workoutSpecificFields?.equipment?.length > 0 || course.workoutSpecificFields?.muscleGroups?.length > 0) && (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        {course.workoutSpecificFields?.equipment?.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Selected Equipment:</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {course.workoutSpecificFields.equipment.map((eq) => (
                                <Badge key={eq} variant="secondary">{eq}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {course.workoutSpecificFields?.muscleGroups?.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Target Muscle Groups:</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {course.workoutSpecificFields.muscleGroups.map((mg) => (
                                <Badge key={mg} variant="secondary">{mg}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Meal Plan Specific Fields */}
                {course.courseType === 'meal_plan' && (
                  <div className="space-y-4 p-5 rounded-lg border-l-2 border-emerald-300">
                    <div className="flex items-center gap-2 mb-2">
                      <UtensilsCrossed className="h-5 w-5 text-emerald-500" />
                      <h3 className="text-lg font-semibold">Meal Plan Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="coach-meal-type" className="text-sm font-medium">Meal Plan Type</Label>
                        <Select
                          value={course.mealPlanSpecificFields?.mealType || ''}
                          onValueChange={(value) => setCourse(prev => ({
                            ...prev,
                            mealPlanSpecificFields: {
                              ...prev.mealPlanSpecificFields,
                              mealType: value
                            }
                          }))}
                        >
                          <SelectTrigger className="w-full max-w-xs mt-1.5">
                            <SelectValue placeholder="Select meal plan type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weight_loss">Weight Loss</SelectItem>
                            <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="keto">Keto</SelectItem>
                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                            <SelectItem value="vegan">Vegan</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="coach-meal-duration" className="text-sm font-medium">Duration (days)</Label>
                        <Input
                          id="coach-meal-duration"
                          type="number"
                          min="1"
                          value={course.mealPlanSpecificFields?.duration || ''}
                          onChange={(e) => setCourse(prev => ({
                            ...prev,
                            mealPlanSpecificFields: {
                              ...prev.mealPlanSpecificFields,
                              duration: e.target.value
                            }
                          }))}
                          placeholder="e.g., 30"
                          className="max-w-xs mt-1.5"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="coach-calories-per-day" className="text-sm font-medium">Calories Per Day</Label>
                        <Input
                          id="coach-calories-per-day"
                          type="number"
                          min="0"
                          value={course.mealPlanSpecificFields?.caloriesPerDay || ''}
                          onChange={(e) => setCourse(prev => ({
                            ...prev,
                            mealPlanSpecificFields: {
                              ...prev.mealPlanSpecificFields,
                              caloriesPerDay: e.target.value
                            }
                          }))}
                          placeholder="e.g., 2000"
                          className="max-w-xs mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="coach-meals-per-day" className="text-sm font-medium">Meals Per Day</Label>
                        <Input
                          id="coach-meals-per-day"
                          type="number"
                          min="1"
                          max="10"
                          value={course.mealPlanSpecificFields?.mealsPerDay || ''}
                          onChange={(e) => setCourse(prev => ({
                            ...prev,
                            mealPlanSpecificFields: {
                              ...prev.mealPlanSpecificFields,
                              mealsPerDay: e.target.value
                            }
                          }))}
                          placeholder="e.g., 5"
                          className="max-w-xs mt-1.5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* General Module Course Specific Fields */}
                {course.courseType === 'general_module_course' && (
                  <div className="space-y-4 p-5 rounded-lg border-l-2 border-indigo-300">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-indigo-500" />
                      <h3 className="text-lg font-semibold">Course Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="coach-general-difficulty" className="text-sm font-medium">Difficulty Level</Label>
                        <Select
                          value={course.generalModuleFields?.difficulty || ''}
                          onValueChange={(value) => setCourse(prev => ({
                            ...prev,
                            generalModuleFields: {
                              ...prev.generalModuleFields,
                              difficulty: value
                            }
                          }))}
                        >
                          <SelectTrigger className="w-full max-w-xs mt-1.5">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="coach-estimated-duration" className="text-sm font-medium">Estimated Duration</Label>
                        <Input
                          id="coach-estimated-duration"
                          value={course.generalModuleFields?.estimatedDuration || ''}
                          onChange={(e) => setCourse(prev => ({
                            ...prev,
                            generalModuleFields: {
                              ...prev.generalModuleFields,
                              estimatedDuration: e.target.value
                            }
                          }))}
                          placeholder="e.g., 4 weeks, 2 months"
                          className="max-w-xs mt-1.5"
                        />
                      </div>
                    </div>
                  </div>
                )}
        </CardContent>
      </Card>
      )}
        </TabsContent>
      </Tabs>

      {/* Module Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModuleId 
                ? (course.courseType === 'meal_plan' ? 'Edit Day' : 'Edit Module')
                : (course.courseType === 'meal_plan' ? 'Create New Day' : 'Create New Module')}
            </DialogTitle>
            <DialogDescription>
              {course.courseType === 'meal_plan'
                ? 'Add a day to your meal plan'
                : 'Add a day-wise module to your course'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="module-title">
                {course.courseType === 'meal_plan' ? 'Day Title' : 'Module Title'} *
              </Label>
              <Input
                id="module-title"
                value={newModule.title}
                onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
                placeholder={course.courseType === 'meal_plan' 
                  ? "e.g., Day 1: Monday Meals"
                  : "e.g., Day 1: Upper Body Workout"}
              />
            </div>
            <div>
              <Label htmlFor="module-day">Day Number *</Label>
              <Input
                id="module-day"
                type="number"
                min="1"
                value={newModule.day}
                onChange={(e) => setNewModule(prev => ({ ...prev, day: parseInt(e.target.value) || 1 }))}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                value={newModule.description}
                onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter module description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={editingModuleId ? () => updateModule(editingModuleId, newModule) : addModule}>
              {editingModuleId 
                ? (course.courseType === 'meal_plan' ? 'Update Day' : 'Update Module')
                : (course.courseType === 'meal_plan' ? 'Create Day' : 'Create Module')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Dialog */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent 
          className={course.courseType === 'meal_plan' && newContent.contentType === 'meal' ? 'max-w-7xl' : 'max-w-4xl'}
          style={course.courseType === 'meal_plan' && newContent.contentType === 'meal' ? { 
            width: '90vw', 
            maxWidth: '1400px',
            height: '80vh',
            display: 'flex',
            flexDirection: 'column'
          } : {}}
        >
          <DialogHeader className={course.courseType === 'meal_plan' && newContent.contentType === 'meal' ? 'flex-shrink-0' : ''}>
            <DialogTitle>
              {editingContentId 
                ? (course.courseType === 'meal_plan' && newContent.contentType === 'meal' ? 'Edit Meal' : 'Edit Content')
                : (course.courseType === 'meal_plan' && newContent.contentType === 'meal' ? 'Add Meal' : 'Add Content')}
            </DialogTitle>
            <DialogDescription>
              {course.courseType === 'meal_plan' && newContent.contentType === 'meal'
                ? 'Add a meal with recipe, ingredients, and nutritional information'
                : 'Add content to this module (videos, images, PDFs, audio, text, or YouTube)'}
            </DialogDescription>
          </DialogHeader>
          <div className={course.courseType === 'meal_plan' && newContent.contentType === 'meal' ? 'flex-1 overflow-hidden flex flex-col' : 'space-y-4'}>
            {!(course.courseType === 'meal_plan' && newContent.contentType === 'meal') && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="content-title">Content Title *</Label>
                    <Input
                      id="content-title"
                      value={newContent.title}
                      onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter content title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content-type">Content Type *</Label>
                    <Select 
                      value={newContent.contentType} 
                      onValueChange={(value) => {
                        setNewContent(prev => ({ ...prev, contentType: value }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="content-description">Description</Label>
                  <Textarea
                    id="content-description"
                    value={newContent.description}
                    onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter content description"
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Meal-Specific Fields */}
            {course.courseType === 'meal_plan' && newContent.contentType === 'meal' && (
              <div className="flex-1 flex flex-col overflow-hidden p-4 rounded-lg border border-emerald-200 bg-emerald-50/30">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b flex-shrink-0">
                  <UtensilsCrossed className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold">Meal Details</h3>
                </div>

                {/* Use Tabs for better organization */}
                <Tabs defaultValue="basic" className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="grid w-full grid-cols-5 mb-4 flex-shrink-0">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                    <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                    <TabsTrigger value="cooking">Cooking</TabsTrigger>
                    <TabsTrigger value="media">Media & Tags</TabsTrigger>
                  </TabsList>

                  {/* Basic Information Tab */}
                  <TabsContent value="basic" className="flex-1 overflow-y-auto space-y-4 pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="meal-title" className="text-sm font-medium">Meal Name *</Label>
                        <Input
                          id="meal-title"
                          value={newContent.title}
                          onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Grilled Chicken Salad"
                          className="w-full mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="meal-type" className="text-sm font-medium">Meal Type *</Label>
                        <Select
                          value={newContent.mealData?.mealType || ''}
                          onValueChange={(value) => setNewContent(prev => ({
                            ...prev,
                            mealData: {
                              ...prev.mealData,
                              mealType: value
                            }
                          }))}
                        >
                          <SelectTrigger className="w-full mt-1.5">
                            <SelectValue placeholder="Select meal type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                            <SelectItem value="snack">Snack</SelectItem>
                            <SelectItem value="dessert">Dessert</SelectItem>
                            <SelectItem value="beverage">Beverage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="recipe-name" className="text-sm font-medium">Recipe Name</Label>
                      <Input
                        id="recipe-name"
                        value={newContent.mealData?.recipeName || ''}
                        onChange={(e) => setNewContent(prev => ({
                          ...prev,
                          mealData: {
                            ...prev.mealData,
                            recipeName: e.target.value
                          }
                        }))}
                        placeholder="e.g., Grilled Chicken with Vegetables"
                        className="w-full mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="meal-description" className="text-sm font-medium">Meal Description</Label>
                      <Textarea
                        id="meal-description"
                        value={newContent.description}
                        onChange={(e) => setNewContent(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe this meal..."
                        rows={4}
                        className="w-full mt-1.5"
                      />
                    </div>
                  </TabsContent>

                  {/* Ingredients Tab */}
                  <TabsContent value="ingredients" className="flex-1 overflow-y-auto space-y-4 pr-2">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Ingredients List
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewContent(prev => ({
                            ...prev,
                            mealData: {
                              ...prev.mealData,
                              ingredients: [...(prev.mealData?.ingredients || []), { name: '', quantity: '', unit: '', notes: '' }]
                            }
                          }));
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Ingredient
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {(newContent.mealData?.ingredients || []).map((ingredient, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 items-end p-4 bg-white rounded-lg border shadow-sm">
                          <div className="col-span-5">
                            <Label className="text-xs font-medium">Ingredient Name *</Label>
                            <Input
                              value={ingredient.name}
                              onChange={(e) => {
                                const updated = [...(newContent.mealData?.ingredients || [])];
                                updated[index].name = e.target.value;
                                setNewContent(prev => ({
                                  ...prev,
                                  mealData: {
                                    ...prev.mealData,
                                    ingredients: updated
                                  }
                                }));
                              }}
                              placeholder="e.g., Chicken Breast"
                              className="mt-1"
                            />
                          </div>
                          <div className="col-span-3">
                            <Label className="text-xs font-medium">Quantity *</Label>
                            <Input
                              value={ingredient.quantity}
                              onChange={(e) => {
                                const updated = [...(newContent.mealData?.ingredients || [])];
                                updated[index].quantity = e.target.value;
                                setNewContent(prev => ({
                                  ...prev,
                                  mealData: {
                                    ...prev.mealData,
                                    ingredients: updated
                                  }
                                }));
                              }}
                              placeholder="e.g., 200"
                              className="mt-1"
                            />
                          </div>
                          <div className="col-span-3">
                            <Label className="text-xs font-medium">Unit</Label>
                            <Input
                              value={ingredient.unit || ''}
                              onChange={(e) => {
                                const updated = [...(newContent.mealData?.ingredients || [])];
                                updated[index].unit = e.target.value;
                                setNewContent(prev => ({
                                  ...prev,
                                  mealData: {
                                    ...prev.mealData,
                                    ingredients: updated
                                  }
                                }));
                              }}
                              placeholder="e.g., grams"
                              className="mt-1"
                            />
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = [...(newContent.mealData?.ingredients || [])];
                                updated.splice(index, 1);
                                setNewContent(prev => ({
                                  ...prev,
                                  mealData: {
                                    ...prev.mealData,
                                    ingredients: updated
                                  }
                                }));
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!newContent.mealData?.ingredients || newContent.mealData.ingredients.length === 0) && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                          <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No ingredients added yet. Click "Add Ingredient" to get started.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Nutrition Tab */}
                  <TabsContent value="nutrition" className="flex-1 overflow-y-auto space-y-4 pr-2">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
                      <Leaf className="h-4 w-4" />
                      Nutritional Information (per serving)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="calories" className="text-sm font-medium">Calories</Label>
                        <Input
                          id="calories"
                          type="number"
                          min="0"
                          value={newContent.mealData?.nutritionalInfo?.calories || ''}
                          onChange={(e) => setNewContent(prev => ({
                            ...prev,
                            mealData: {
                              ...prev.mealData,
                              nutritionalInfo: {
                                ...prev.mealData?.nutritionalInfo,
                                calories: e.target.value ? parseFloat(e.target.value) : null
                              }
                            }
                          }))}
                          placeholder="e.g., 350"
                          className="w-full mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="protein" className="text-sm font-medium">Protein (g)</Label>
                        <Input
                          id="protein"
                          type="number"
                          min="0"
                          value={newContent.mealData?.nutritionalInfo?.protein || ''}
                          onChange={(e) => setNewContent(prev => ({
                            ...prev,
                            mealData: {
                              ...prev.mealData,
                              nutritionalInfo: {
                                ...prev.mealData?.nutritionalInfo,
                                protein: e.target.value ? parseFloat(e.target.value) : null
                              }
                            }
                          }))}
                          placeholder="e.g., 30"
                          className="w-full mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="carbs" className="text-sm font-medium">Carbs (g)</Label>
                        <Input
                          id="carbs"
                          type="number"
                          min="0"
                          value={newContent.mealData?.nutritionalInfo?.carbohydrates || ''}
                          onChange={(e) => setNewContent(prev => ({
                            ...prev,
                            mealData: {
                              ...prev.mealData,
                              nutritionalInfo: {
                                ...prev.mealData?.nutritionalInfo,
                                carbohydrates: e.target.value ? parseFloat(e.target.value) : null
                              }
                            }
                          }))}
                          placeholder="e.g., 25"
                          className="w-full mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fats" className="text-sm font-medium">Fats (g)</Label>
                        <Input
                          id="fats"
                          type="number"
                          min="0"
                          value={newContent.mealData?.nutritionalInfo?.fats || ''}
                          onChange={(e) => setNewContent(prev => ({
                            ...prev,
                            mealData: {
                              ...prev.mealData,
                              nutritionalInfo: {
                                ...prev.mealData?.nutritionalInfo,
                                fats: e.target.value ? parseFloat(e.target.value) : null
                              }
                            }
                          }))}
                          placeholder="e.g., 12"
                          className="w-full mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fiber" className="text-sm font-medium">Fiber (g)</Label>
                        <Input
                          id="fiber"
                          type="number"
                          min="0"
                          value={newContent.mealData?.nutritionalInfo?.fiber || ''}
                          onChange={(e) => setNewContent(prev => ({
                            ...prev,
                            mealData: {
                              ...prev.mealData,
                              nutritionalInfo: {
                                ...prev.mealData?.nutritionalInfo,
                                fiber: e.target.value ? parseFloat(e.target.value) : null
                              }
                            }
                          }))}
                          placeholder="e.g., 5"
                          className="w-full mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sugar" className="text-sm font-medium">Sugar (g)</Label>
                        <Input
                          id="sugar"
                          type="number"
                          min="0"
                          value={newContent.mealData?.nutritionalInfo?.sugar || ''}
                          onChange={(e) => setNewContent(prev => ({
                            ...prev,
                            mealData: {
                              ...prev.mealData,
                              nutritionalInfo: {
                                ...prev.mealData?.nutritionalInfo,
                                sugar: e.target.value ? parseFloat(e.target.value) : null
                              }
                            }
                          }))}
                          placeholder="e.g., 8"
                          className="w-full mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sodium" className="text-sm font-medium">Sodium (mg)</Label>
                        <Input
                          id="sodium"
                          type="number"
                          min="0"
                          value={newContent.mealData?.nutritionalInfo?.sodium || ''}
                          onChange={(e) => setNewContent(prev => ({
                            ...prev,
                            mealData: {
                              ...prev.mealData,
                              nutritionalInfo: {
                                ...prev.mealData?.nutritionalInfo,
                                sodium: e.target.value ? parseFloat(e.target.value) : null
                              }
                            }
                          }))}
                          placeholder="e.g., 500"
                          className="w-full mt-1.5"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Cooking Tab */}
                  <TabsContent value="cooking" className="flex-1 overflow-y-auto space-y-4 pr-2">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
                      <ChefHat className="h-4 w-4" />
                      Cooking Details & Instructions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label htmlFor="prep-time" className="text-sm font-medium">Prep Time (min)</Label>
                        <Input
                          id="prep-time"
                          type="number"
                          min="0"
                          value={newContent.mealData?.prepTime || ''}
                          onChange={(e) => setNewContent(prev => ({
                            ...prev,
                            mealData: {
                              ...prev.mealData,
                              prepTime: e.target.value ? parseFloat(e.target.value) : null
                            }
                          }))}
                          placeholder="e.g., 15"
                          className="w-full mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cook-time" className="text-sm font-medium">Cook Time (min)</Label>
                        <Input
                          id="cook-time"
                          type="number"
                          min="0"
                          value={newContent.mealData?.cookTime || ''}
                          onChange={(e) => {
                            const cookTime = e.target.value ? parseFloat(e.target.value) : null;
                            const prepTime = newContent.mealData?.prepTime ? parseFloat(newContent.mealData.prepTime) : 0;
                            setNewContent(prev => ({
                              ...prev,
                              mealData: {
                                ...prev.mealData,
                                cookTime: cookTime,
                                totalTime: cookTime && prepTime ? cookTime + prepTime : null
                              }
                            }));
                          }}
                          placeholder="e.g., 20"
                          className="w-full mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="serving-size" className="text-sm font-medium">Serving Size</Label>
                        <Input
                          id="serving-size"
                          value={newContent.mealData?.servingSize || ''}
                          onChange={(e) => setNewContent(prev => ({
                            ...prev,
                            mealData: {
                              ...prev.mealData,
                              servingSize: e.target.value
                            }
                          }))}
                          placeholder="e.g., 1 serving"
                          className="w-full mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="difficulty" className="text-sm font-medium">Difficulty</Label>
                        <Select
                          value={newContent.mealData?.difficulty || ''}
                          onValueChange={(value) => setNewContent(prev => ({
                            ...prev,
                            mealData: {
                              ...prev.mealData,
                              difficulty: value
                            }
                          }))}
                        >
                          <SelectTrigger className="w-full mt-1.5">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="cooking-instructions" className="text-sm font-medium">Cooking Instructions</Label>
                      <Textarea
                        id="cooking-instructions"
                        value={newContent.mealData?.cookingInstructions || ''}
                        onChange={(e) => setNewContent(prev => ({
                          ...prev,
                          mealData: {
                            ...prev.mealData,
                            cookingInstructions: e.target.value
                          }
                        }))}
                        placeholder="Enter step-by-step cooking instructions..."
                        rows={8}
                        className="w-full"
                      />
                    </div>
                  </TabsContent>

                  {/* Media & Tags Tab */}
                  <TabsContent value="media" className="flex-1 overflow-y-auto space-y-4 pr-2">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
                      <Image className="h-4 w-4" />
                      Media Files
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <Label htmlFor="meal-image" className="text-sm font-medium">Meal Image</Label>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Input
                            id="meal-image"
                            value={newContent.mealData?.mealImage || ''}
                            onChange={(e) => setNewContent(prev => ({
                              ...prev,
                              mealData: {
                                ...prev.mealData,
                                mealImage: e.target.value
                              }
                            }))}
                            placeholder="No image selected"
                            readOnly
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setFileExplorerContext('mealImage');
                              setFileExplorerFileType('image');
                              setShowFileExplorer(true);
                            }}
                          >
                            <Image className="w-4 h-4 mr-2" />
                            Browse
                          </Button>
                          {newContent.mealData?.mealImage && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setNewContent(prev => ({
                                ...prev,
                                mealData: {
                                  ...prev.mealData,
                                  mealImage: ''
                                }
                              }))}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="meal-video" className="text-sm font-medium">Cooking Video (Optional)</Label>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Input
                            id="meal-video"
                            value={newContent.mealData?.mealVideo || ''}
                            onChange={(e) => setNewContent(prev => ({
                              ...prev,
                              mealData: {
                                ...prev.mealData,
                                mealVideo: e.target.value
                              }
                            }))}
                            placeholder="Video URL or file path"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setFileExplorerContext('mealVideo');
                              setFileExplorerFileType('video');
                              setShowFileExplorer(true);
                            }}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Browse
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
                        <Tag className="h-4 w-4" />
                        Tags & Notes
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="meal-tags" className="text-sm font-medium">Tags</Label>
                          <Input
                            id="meal-tags"
                            value={(newContent.mealData?.tags || []).join(', ')}
                            onChange={(e) => {
                              const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                              setNewContent(prev => ({
                                ...prev,
                                mealData: {
                                  ...prev.mealData,
                                  tags: tags
                                }
                              }));
                            }}
                            placeholder="e.g., quick, healthy, vegetarian"
                            className="w-full mt-1.5"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Separate tags with commas</p>
                        </div>
                        <div>
                          <Label htmlFor="meal-notes" className="text-sm font-medium">Additional Notes</Label>
                          <Textarea
                            id="meal-notes"
                            value={newContent.mealData?.notes || ''}
                            onChange={(e) => setNewContent(prev => ({
                              ...prev,
                              mealData: {
                                ...prev.mealData,
                                notes: e.target.value
                              }
                            }))}
                            placeholder="Enter any additional notes or tips..."
                            rows={4}
                            className="w-full mt-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {newContent.contentType === 'youtube' ? (
              <div>
                <Label htmlFor="youtube-url">YouTube URL *</Label>
                <Input
                  id="youtube-url"
                  value={newContent.content}
                  onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/embed/..."
                />
              </div>
            ) : newContent.contentType === 'text' ? (
              <div>
                <Label htmlFor="text-content">Text Content *</Label>
                <Textarea
                  id="text-content"
                  value={newContent.content}
                  onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter text content"
                  rows={6}
                />
              </div>
            ) : (
              <div>
                <Label>File Content *</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                  <Input
                    value={newContent.content}
                    onChange={(e) => setNewContent(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="No file selected or enter URL manually"
                      readOnly={newContent.contentType !== 'youtube' && newContent.contentType !== 'text'}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => openContentExplorer(newContent.contentType)}
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      Browse Files
                    </Button>
                    {newContent.content && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setNewContent(prev => ({ ...prev, content: '' }))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                            </div>
                  {newContent.content && !newContent.content.startsWith('http') && (
                    <div className="text-xs text-muted-foreground">
                      Selected file will be used for this content item
                          </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className={course.courseType === 'meal_plan' && newContent.contentType === 'meal' ? 'flex-shrink-0' : ''}>
            <Button variant="outline" onClick={() => setShowContentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={editingContentId ? () => updateContent(editingContentId, newContent) : () => addContentToModule(currentModuleIndex)}>
              {editingContentId ? 'Update Content' : 'Add Content'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Course Preview</DialogTitle>
            <DialogDescription>
              Preview how your course will appear to students
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{course.title || 'Untitled Course'}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge>{course.courseType}</Badge>
                  <Badge variant="outline">
                    <DollarSign className="w-3 h-3 mr-1" />
                    ${course.price}
                  </Badge>
                  <Badge variant="outline">{course.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modules.map((module, moduleIndex) => (
                    <div key={module._id} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{module.title} (Day {module.day})</h3>
                      <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                      <div className="space-y-2">
                        {module.contents && module.contents.map((content, contentIndex) => (
                          <div key={content._id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            {getContentIcon(content.contentType)}
                            <span className="text-sm">{content.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Course Dialog */}
      <Dialog 
        open={showCreateCourseDialog} 
        onOpenChange={(open) => {
          setShowCreateCourseDialog(open);
          if (!open) {
            // Reset form when dialog closes
            setNewCourseData({ title: '', category: '', courseType: '' });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Enter the course name and select the course type to get started
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-course-title" className="text-sm font-medium">Course Name *</Label>
              <Input
                id="new-course-title"
                value={newCourseData.title}
                onChange={(e) => setNewCourseData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Beginner Workout Program"
                className="mt-1.5"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCourseData.title.trim() && newCourseData.courseType) {
                    handleCreateCourseFromDialog();
                  }
                }}
              />
            </div>
            
            <div>
              <Label htmlFor="new-course-category" className="text-sm font-medium">Category *</Label>
              <Select
                value={newCourseData.category}
                onValueChange={(value) => {
                  setNewCourseData(prev => {
                    // When category changes, reset course type if needed
                    const newCourseType = value === 'coach_course' 
                      ? 'general_module_course' 
                      : (prev.courseType || 'workout_routine');
                    return { ...prev, category: value, courseType: newCourseType };
                  });
                }}
              >
                <SelectTrigger className="w-full mt-1.5">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_course">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Customer Course</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="coach_course">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Coach Course</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {newCourseData.category === 'coach_course' 
                  ? 'Default modular courses that coaches can customize'
                  : 'Courses available for customers to purchase'}
              </p>
            </div>

            <div>
              <Label htmlFor="new-course-type" className="text-sm font-medium">Course Type *</Label>
              <Select
                value={newCourseData.courseType}
                onValueChange={(value) => setNewCourseData(prev => ({ ...prev, courseType: value }))}
              >
                <SelectTrigger className="w-full mt-1.5">
                  <SelectValue placeholder="Select course type" />
                </SelectTrigger>
                <SelectContent>
                  {newCourseData.category === 'customer_course' ? (
                    <>
                      <SelectItem value="workout_routine">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="h-4 w-4" />
                          <span>Workout Routine</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="meal_plan">
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="h-4 w-4" />
                          <span>Meal Planner</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="general_module_course">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>General Module Based Course</span>
                        </div>
                      </SelectItem>
                    </>
                  ) : (
                    <SelectItem value="general_module_course">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>General Module Based Course</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCourseDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCourseFromDialog}
              disabled={!newCourseData.title.trim() || !newCourseData.category || !newCourseData.courseType}
            >
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Explorer Dialog */}
      <FileExplorerDialog
        open={showFileExplorer}
        onOpenChange={setShowFileExplorer}
        onSelectFile={handleFileExplorerSelect}
        fileTypeFilter={fileExplorerFileType}
        title={fileExplorerContext === 'thumbnail' ? 'Select Thumbnail Image' : 'Select File'}
      />
    </div>
  );
};

export default CourseCreationFlow;
