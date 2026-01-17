import React, { useState, useEffect } from 'react';
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
import apiConfig from '../config/apiConfig';
import { 
  Plus,
  Save,
  Edit,
  Trash2,
  Video,
  FileText,
  Image,
  File,
  ArrowLeft,
  FolderOpen,
  Folder,
  ChevronRight,
  Settings,
  BookOpen,
  Play,
  Clock,
  User,
  Eye,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const CourseEditor = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [loading, setLoading] = useState(true);
  
  // File browser states
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedFolders, setUploadedFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [showLessonPreview, setShowLessonPreview] = useState(false);
  const [previewLesson, setPreviewLesson] = useState(null);
  const [showEditLesson, setShowEditLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showEditModuleDialog, setShowEditModuleDialog] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [showResourceBrowser, setShowResourceBrowser] = useState(false);
  const [selectedResources, setSelectedResources] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  
  // Module and lesson states
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [newModule, setNewModule] = useState({
    name: '',
    description: '',
    order: 0
  });
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    type: 'video',
    content: '',
    duration: '',
    order: 0,
    resources: []
  });

  // Loading states for different operations
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingModule, setSavingModule] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [updatingModule, setUpdatingModule] = useState(false);
  const [updatingLesson, setUpdatingLesson] = useState(false);
  const [deletingModule, setDeletingModule] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState(false);

  // Fetch course data from API
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        console.log('Fetching course data for courseId:', courseId);
        const response = await fetch(apiConfig.getApiUrl(`/admin/v1/courses/${courseId}`), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        const result = await response.json();
        console.log('Course data response:', result);
        
        if (result.success) {
          setCourse(result.data);
          setModules(result.data.modules || []);
          console.log('Course modules:', result.data.modules);
          if (result.data.modules && result.data.modules.length > 0) {
            setSelectedModule(result.data.modules[0]);
          }
        } else {
          toast.error(result.message || 'Error loading course');
          navigate('/course-creation');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Error loading course');
        navigate('/course-creation');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, navigate]);

  // File browser functions
  const fetchUploadedFiles = async () => {
    try {
      const folderId = currentFolder ? currentFolder._id : 'root';
      const response = await fetch(apiConfig.getApiUrl(`/content/admin/folder/${folderId}/contents`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadedFiles(result.data.files || []);
        setUploadedFolders(result.data.folders || []);
      }
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
      toast.error('Error loading files');
    }
  };

  // Load folder contents (wrapper for fetchUploadedFiles)
  const loadFolderContents = async (folderId = 'root') => {
    try {
      console.log('Loading folder contents for:', folderId);
      
      // Reset current folder state if loading root
      if (folderId === 'root') {
        setCurrentFolder(null);
        setFolderPath([]);
      }
      
      const response = await fetch(apiConfig.getApiUrl(`/content/admin/folder/${folderId}/contents`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();
      console.log('Folder contents response:', result);
      
      if (result.success) {
        setUploadedFiles(result.data.files || []);
        setUploadedFolders(result.data.folders || []);
        console.log('Updated files:', result.data.files?.length || 0);
        console.log('Updated folders:', result.data.folders?.length || 0);
      } else {
        console.error('Error loading folder contents:', result.message);
        toast.error('Error loading folder contents');
      }
    } catch (error) {
      console.error('Error loading folder contents:', error);
      toast.error('Error loading folder contents');
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setSelectedFileName(file.originalName);
    
    // Auto-detect content type based on file mimetype
    let detectedType = 'video'; // default
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      detectedType = 'image';
    } else if (file.mimetype && file.mimetype.includes('pdf')) {
      detectedType = 'pdf';
    } else if (file.mimetype && file.mimetype.startsWith('audio/')) {
      detectedType = 'audio';
    } else if (file.mimetype && file.mimetype.startsWith('video/')) {
      detectedType = 'video';
    }
    
    setNewLesson({
      ...newLesson, 
      content: `/api/content/admin/files/${file._id}/serve`,
      type: detectedType
    });
    
    // Auto-calculate duration for video and audio files
    if (detectedType === 'video' || detectedType === 'audio') {
      calculateMediaDuration(`/api/content/admin/files/${file._id}/serve`, detectedType);
    }
    
    setShowFileBrowser(false);
    toast.success('File selected successfully!');
  };

  const calculateMediaDuration = (src, type) => {
    return new Promise((resolve) => {
      if (type === 'video') {
        const video = document.createElement('video');
        video.addEventListener('loadedmetadata', () => {
          const duration = Math.floor(video.duration);
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          setNewLesson(prev => ({ ...prev, duration: formattedDuration }));
          resolve(formattedDuration);
        });
        video.addEventListener('error', () => {
          console.log('Could not load video for duration calculation');
          resolve(null);
        });
        video.src = src;
      } else if (type === 'audio') {
        const audio = document.createElement('audio');
        audio.addEventListener('loadedmetadata', () => {
          const duration = Math.floor(audio.duration);
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          setNewLesson(prev => ({ ...prev, duration: formattedDuration }));
          resolve(formattedDuration);
        });
        audio.addEventListener('error', () => {
          console.log('Could not load audio for duration calculation');
          resolve(null);
        });
        audio.src = src;
      }
    });
  };

  const extractYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getYouTubeDuration = async (videoId) => {
    try {
      // Using YouTube oEmbed API to get video info
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        // Note: oEmbed doesn't provide duration, we'll need to use YouTube Data API v3
        // For now, we'll return null and let user enter duration manually
        return null;
      }
    } catch (error) {
      console.log('Could not fetch YouTube video duration:', error);
    }
    return null;
  };

  const handleContentChange = async (content) => {
    setNewLesson({...newLesson, content});
    
    // Auto-calculate duration for YouTube videos
    if (newLesson.type === 'youtube' && content.includes('youtube.com')) {
      const videoId = extractYouTubeVideoId(content);
      if (videoId) {
        const duration = await getYouTubeDuration(videoId);
        if (duration) {
          setNewLesson(prev => ({ ...prev, duration }));
        }
      }
    }
  };

  const handleMoveLesson = async (lessonId, direction) => {
    if (!selectedModule) return;
    
    const currentLessons = [...selectedModule.contents];
    const currentIndex = currentLessons.findIndex(lesson => lesson._id === lessonId);
    
    if (direction === 'up' && currentIndex > 0) {
      // Move up
      [currentLessons[currentIndex], currentLessons[currentIndex - 1]] = 
      [currentLessons[currentIndex - 1], currentLessons[currentIndex]];
    } else if (direction === 'down' && currentIndex < currentLessons.length - 1) {
      // Move down
      [currentLessons[currentIndex], currentLessons[currentIndex + 1]] = 
      [currentLessons[currentIndex + 1], currentLessons[currentIndex]];
    } else {
      return; // Can't move further
    }
    
    try {
      // Update the order in the database
      const updatePromises = currentLessons.map((lesson, index) => 
        fetch(apiConfig.getApiUrl(`/admin/v1/lessons/${lesson._id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({ order: index })
        })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      const updatedModules = modules.map(module => {
        if (module._id === selectedModule._id) {
          return {
            ...module,
            contents: currentLessons
          };
        }
        return module;
      });
      
      setModules(updatedModules);
      setSelectedModule(updatedModules.find(m => m._id === selectedModule._id));
      toast.success('Lesson order updated successfully!');
    } catch (error) {
      console.error('Error updating lesson order:', error);
      toast.error('Error updating lesson order');
    }
  };

  const handleMoveModule = async (moduleId, direction) => {
    const currentModules = [...modules];
    const currentIndex = currentModules.findIndex(module => module._id === moduleId);
    
    if (direction === 'up' && currentIndex > 0) {
      // Move up
      [currentModules[currentIndex], currentModules[currentIndex - 1]] = 
      [currentModules[currentIndex - 1], currentModules[currentIndex]];
    } else if (direction === 'down' && currentIndex < currentModules.length - 1) {
      // Move down
      [currentModules[currentIndex], currentModules[currentIndex + 1]] = 
      [currentModules[currentIndex + 1], currentModules[currentIndex]];
    } else {
      return; // Can't move further
    }
    
    try {
      // Update the order in the database
      const updatePromises = currentModules.map((module, index) => 
        fetch(apiConfig.getApiUrl(`/admin/v1/modules/${module._id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({ order: index })
        })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setModules(currentModules);
      if (selectedModule?._id === moduleId) {
        setSelectedModule(currentModules[currentIndex]);
      }
      toast.success('Module order updated successfully!');
    } catch (error) {
      console.error('Error updating module order:', error);
      toast.error('Error updating module order');
    }
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setNewModule({
      name: module.name,
      description: module.description,
      order: module.order
    });
    setShowEditModuleDialog(true);
  };

  const handleUpdateModule = async () => {
    if (!editingModule || !newModule.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUpdatingModule(true);
      console.log('=== FRONTEND MODULE UPDATE ===');
      console.log('editingModule:', editingModule);
      console.log('newModule:', newModule);
      
      const response = await fetch(apiConfig.getApiUrl(`/admin/v1/modules/${editingModule._id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(newModule)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const result = await response.json();
      console.log('Module update response:', result);
      
      if (result.success) {
        // Update the module in the modules list
        const updatedModules = modules.map(module => 
          module._id === editingModule._id ? result.data : module
        );
        setModules(updatedModules);
        
        // Update selected module if it's the one being edited
        if (selectedModule?._id === editingModule._id) {
          setSelectedModule(result.data);
        }
        
        setShowEditModuleDialog(false);
        setEditingModule(null);
        setNewModule({
          name: '',
          description: '',
          order: 0
        });
        toast.success('Module updated successfully!');
      } else {
        toast.error(result.message || 'Error updating module');
      }
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Error updating module');
    } finally {
      setUpdatingModule(false);
    }
  };

  const navigateToFolder = (folder) => {
    console.log('Navigating to folder:', folder);
    setCurrentFolder(folder);
    setFolderPath([...folderPath, folder]);
    // Load contents for this folder
    loadFolderContents(folder._id);
  };

  const navigateToRoot = () => {
    console.log('Navigating to root');
    setCurrentFolder(null);
    setFolderPath([]);
    // Load root contents
    loadFolderContents('root');
  };

  // Load files when file browser opens
  useEffect(() => {
    if (showFileBrowser) {
      loadFolderContents('root');
    }
  }, [showFileBrowser]);

  // Load files when resource browser opens
  useEffect(() => {
    if (showResourceBrowser) {
      loadFolderContents('root');
    }
  }, [showResourceBrowser]);

  const handleSaveAllChanges = async () => {
    try {
      setSavingCourse(true);
      console.log('=== FRONTEND SAVE ALL CHANGES ===');
      console.log('Saving course with all modules and lessons...');
      
      // First save the course details
      const courseResponse = await fetch(apiConfig.getApiUrl(`/admin/v1/courses/${courseId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(course)
      });

      if (!courseResponse.ok) {
        throw new Error(`Course save failed: ${courseResponse.status}`);
      }

      const courseResult = await courseResponse.json();
      console.log('Course save result:', courseResult);
      
      if (!courseResult.success) {
        throw new Error(courseResult.message || 'Course save failed');
      }

      // Log summary
      console.log('=== SAVE SUMMARY ===');
      console.log('Course saved successfully');
      console.log('Modules count:', modules.length);
      console.log('Total lessons:', modules.reduce((total, module) => total + (module.contents?.length || 0), 0));
      
      // Update course state
      setCourse(courseResult.data);
      
      // Show success message
      toast.success('All changes saved successfully!');
      console.log('All changes successfully saved to database');
      
    } catch (error) {
      console.error('=== SAVE ALL CHANGES ERROR ===');
      console.error('Error saving all changes:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        courseId,
        modulesCount: modules.length,
        lessonsCount: modules.reduce((total, module) => total + (module.contents?.length || 0), 0)
      });
      toast.error('Error saving changes: ' + error.message);
    } finally {
      setSavingCourse(false);
    }
  };

  const handleSaveCourse = async () => {
    try {
      console.log('=== FRONTEND COURSE SAVE ===');
      console.log('Course data to save:', course);
      console.log('Modules count:', modules.length);
      console.log('Total lessons:', modules.reduce((total, module) => total + (module.contents?.length || 0), 0));
      
      const response = await fetch(apiConfig.getApiUrl(`/admin/v1/courses/${courseId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(course)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Course save response:', result);
      
      if (result.success) {
        setCourse(result.data);
        toast.success('Course saved successfully!');
        console.log('Course successfully saved to database:', result.data);
      } else {
        console.error('Course save failed:', result);
        toast.error(result.message || 'Error saving course');
      }
    } catch (error) {
      console.error('=== COURSE SAVE ERROR ===');
      console.error('Error saving course:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        courseId,
        courseData: course
      });
      toast.error('Error saving course: ' + error.message);
    }
  };

  const handleAddModule = async () => {
    if (!newModule.name) {
      toast.error('Please enter module name');
      return;
    }

    try {
      setSavingModule(true);
      console.log('=== FRONTEND MODULE CREATION ===');
      console.log('newModule state:', newModule);
      console.log('courseId:', courseId);
      
      // Set order based on current number of modules
      const moduleData = {
        name: newModule.name.trim(),
        description: newModule.description?.trim() || '',
        order: modules.length
      };
      
      console.log('Module data to send:', moduleData);
      
      const response = await fetch(apiConfig.getApiUrl(`/admin/v1/courses/${courseId}/modules`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(moduleData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Module creation response:', result);
      
      if (result.success && result.data) {
        // Update the modules array with the new module
        const updatedModules = [...modules, result.data];
        safeSetModules(updatedModules);
        
        // Close dialog and reset form
        setShowModuleDialog(false);
        setNewModule({ name: '', description: '', order: 0 });
        
        // Show success message
        toast.success('Module added successfully!');
        
        // Log success
        console.log('Module successfully added to database:', result.data);
      } else {
        console.error('Module creation failed:', result);
        toast.error(result.message || 'Error adding module');
      }
    } catch (error) {
      console.error('=== MODULE CREATION ERROR ===');
      console.error('Error adding module:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        courseId,
        moduleData: newModule
      });
      toast.error('Error adding module: ' + error.message);
    } finally {
      setSavingModule(false);
    }
  };

  const handleAddLesson = async () => {
    if (!newLesson.title || !selectedModule || !newLesson.content) {
      toast.error('Please fill in all required fields (title, content)');
      return;
    }

    try {
      setSavingLesson(true);
      console.log('=== FRONTEND LESSON CREATION ===');
      console.log('newLesson state:', newLesson);
      console.log('selectedModule:', selectedModule);
      
      // Set order based on current number of lessons in module
      const lessonData = {
        title: newLesson.title.trim(),
        description: newLesson.description?.trim() || '',
        type: newLesson.type,
        content: newLesson.content.trim(),
        duration: newLesson.duration?.trim() || '',
        order: selectedModule.contents ? selectedModule.contents.length : 0,
        author: newLesson.author?.trim() || '',
        resources: newLesson.resources || []
      };
      
      console.log('Lesson data to send:', lessonData);
      
      const response = await fetch(apiConfig.getApiUrl(`/admin/v1/courses/modules/${selectedModule._id}/lessons`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(lessonData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Lesson creation response:', result);
      
      if (result.success && result.data) {
        // Update the selected module with new lesson
        const updatedModules = modules.map(module => {
          if (module._id === selectedModule._id) {
            return {
              ...module,
              contents: [...(module.contents || []), result.data]
            };
          }
          return module;
        });
        
        setModules(updatedModules);
        setSelectedModule(updatedModules.find(m => m._id === selectedModule._id));
        
        // Close dialog and reset form
        setShowLessonDialog(false);
        setNewLesson({
          title: '',
          description: '',
          type: 'video',
          content: '',
          duration: '',
          order: 0,
          resources: []
        });
        setSelectedResources([]);
        setSelectedFileName('');
        
        // Show success message
        toast.success('Lesson added successfully!');
        
        // Log success
        console.log('Lesson successfully added to database:', result.data);
      } else {
        console.error('Lesson creation failed:', result);
        toast.error(result.message || 'Error adding lesson');
      }
    } catch (error) {
      console.error('=== LESSON CREATION ERROR ===');
      console.error('Error adding lesson:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        selectedModule: selectedModule?._id,
        lessonData: newLesson
      });
      toast.error('Error adding lesson: ' + error.message);
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      const response = await fetch(apiConfig.getApiUrl(`/admin/v1/modules/${moduleId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        const filteredModules = modules.filter(module => module._id !== moduleId);
        safeSetModules(filteredModules);
        if (selectedModule && selectedModule._id === moduleId) {
          setSelectedModule(filteredModules.length > 1 ? filteredModules[0] : null);
        }
        toast.success('Module deleted successfully!');
      } else {
        toast.error(result.message || 'Error deleting module');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Error deleting module');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      const response = await fetch(apiConfig.getApiUrl(`/admin/v1/lessons/${lessonId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        const updatedModules = modules.map(module => {
          if (module._id === selectedModule._id) {
            return {
              ...module,
              contents: module.contents.filter(lesson => lesson._id !== lessonId)
            };
          }
          return module;
        });
        safeSetModules(updatedModules);
        setSelectedModule(updatedModules.find(m => m._id === selectedModule._id));
        toast.success('Lesson deleted successfully!');
      } else {
        toast.error(result.message || 'Error deleting lesson');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Error deleting lesson');
    }
  };

  const handlePreviewLesson = (lesson) => {
    setPreviewLesson(lesson);
    setShowLessonPreview(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setNewLesson({
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      content: lesson.content,
      duration: lesson.duration || '',
      order: lesson.order,
      resources: lesson.resources || []
    });
    
    // Extract file name from content URL if it's a file URL
    if (lesson.content && lesson.content.includes('/api/content/admin/files/')) {
      // For now, we'll show a generic name - in a real app, you'd fetch the actual file details
      setSelectedFileName('Selected File');
    } else if (lesson.type === 'youtube') {
      setSelectedFileName('YouTube Video');
    } else {
      setSelectedFileName('');
    }
    
    // Set selected resources for display
    if (lesson.resources && lesson.resources.length > 0) {
      // For now, we'll set empty array - in a real app, you'd fetch the actual file details
      setSelectedResources([]);
    } else {
      setSelectedResources([]);
    }
    
    setShowEditLesson(true);
  };

  // Helper function to safely update modules array
  const safeSetModules = (newModules) => {
    console.log('=== SAFE SET MODULES ===');
    console.log('Current modules count:', modules.length);
    console.log('New modules count:', newModules.length);
    
    if (newModules.length === 0 && modules.length > 0) {
      console.error('CRITICAL: Attempting to set modules to empty array! Blocking this operation.');
      toast.error('Error: Cannot set modules to empty. Please refresh the page.');
      return;
    }
    
    console.log('Setting modules safely');
    setModules(newModules);
  };

  const handleUpdateLesson = async () => {
    if (!editingLesson) return;

    try {
      setUpdatingLesson(true);
      console.log('=== FRONTEND LESSON UPDATE ===');
      console.log('editingLesson:', editingLesson);
      console.log('newLesson:', newLesson);
      console.log('selectedModule:', selectedModule);
      console.log('modules before update:', modules.length);
      
      const response = await fetch(apiConfig.getApiUrl(`/admin/v1/lessons/${editingLesson._id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(newLesson)
      });

      const result = await response.json();
      console.log('Lesson update response:', result);
      
      if (result.success) {
        // Find the module that contains this lesson
        const moduleContainingLesson = modules.find(module => 
          module.contents && module.contents.some(lesson => lesson._id === editingLesson._id)
        );
        
        console.log('Module containing lesson:', moduleContainingLesson ? moduleContainingLesson._id : 'Not found');
        
        if (moduleContainingLesson) {
          // Update the lesson in the correct module
          const updatedModules = modules.map(module => {
            if (module._id === moduleContainingLesson._id) {
              return {
                ...module,
                contents: module.contents.map(lesson => 
                  lesson._id === editingLesson._id ? result.data : lesson
                )
              };
            }
            return module; // Keep other modules unchanged
          });
          
          console.log('Updated modules count:', updatedModules.length);
          console.log('Updated modules:', updatedModules.map(m => ({ id: m._id, name: m.name, contentsCount: m.contents?.length || 0 })));
          
          // Safety check: ensure we don't lose modules
          if (updatedModules.length === 0) {
            console.error('CRITICAL: Modules array would be empty! Keeping original modules.');
            toast.error('Error: Modules would be lost. Please refresh the page.');
            return;
          }
          
          safeSetModules(updatedModules);
          
          // Update selected module if it's the one being edited
          if (selectedModule && selectedModule._id === moduleContainingLesson._id) {
            const updatedSelectedModule = updatedModules.find(m => m._id === moduleContainingLesson._id);
            setSelectedModule(updatedSelectedModule);
            console.log('Updated selected module:', updatedSelectedModule);
          }
        } else {
          console.error('Could not find module containing lesson:', editingLesson._id);
        }
        
        setShowEditLesson(false);
        setEditingLesson(null);
        setNewLesson({
          title: '',
          description: '',
          type: 'video',
          content: '',
          duration: '',
          order: 0,
          resources: []
        });
        setSelectedResources([]);
        setSelectedFileName('');
        toast.success('Lesson updated successfully!');
      } else {
        toast.error(result.message || 'Error updating lesson');
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast.error('Error updating lesson');
    } finally {
      setUpdatingLesson(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
          <Button onClick={() => navigate('/course-creation')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>
        {`
          .dialog-content-custom {
            width: 60vw !important;
            max-width: none !important;
          }
        `}
      </style>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/course-creation')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span></span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{course.name}</h1>
                <p className="text-gray-600">Course Editor</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleSaveAllChanges} 
                className="flex items-center space-x-2"
                disabled={savingCourse}
              >
                <Save className="h-4 w-4" />
                <span>{savingCourse ? 'Saving...' : 'Save All Changes'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="content" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Content</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 p-6">
              <TabsContent value="content" className="mt-0">
                <div className="flex gap-6 h-[calc(100vh-200px)]">
                  {/* Left Sidebar - Modules */}
                  <div className="w-80 bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Modules</h2>
                    </div>
                    
                    <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                      {modules.map((module, index) => (
                        <div
                          key={module._id}
                          className={`flex items-center justify-between py-2 px-3 border-b border-gray-200 cursor-pointer transition-colors ${
                            selectedModule?._id === module._id
                              ? 'bg-blue-50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedModule(module)}
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            {/* Reorder Controls */}
                            <div className="flex flex-col items-center space-y-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveModule(module._id, 'up');
                                }}
                                disabled={index === 0}
                                className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                              >
                                <ChevronUp className="h-3 w-3" />
                              </Button>
                              <span className="text-xs text-gray-500">{index + 1}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveModule(module._id, 'down');
                                }}
                                disabled={index === modules.length - 1}
                                className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {/* Module Info */}
                            <div className="flex-1">
                              <h3 className="font-medium text-sm">{module.name}</h3>
                              <p className="text-xs text-gray-500">
                                {module.contents ? module.contents.length : 0} lessons
                              </p>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditModule(module);
                              }}
                              className="h-7 px-2 text-gray-600 hover:text-gray-800"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteModule(module._id);
                              }}
                              className="h-7 px-2 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add Module Button - Below the list */}
                      <Button
                        size="sm"
                        onClick={() => setShowModuleDialog(true)}
                        className="w-full flex items-center justify-center space-x-1 mt-2"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Module</span>
                      </Button>
                    </div>
                  </div>

                  {/* Right Content - Module Details */}
                  <div className="flex-1 bg-white rounded-lg border p-6">
                    {selectedModule ? (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="text-xl font-semibold">{selectedModule.name}</h2>
                            <p className="text-gray-600">{selectedModule.description}</p>
                          </div>
                          <Button
                            onClick={() => setShowLessonDialog(true)}
                            className="flex items-center space-x-2"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add Lesson</span>
                          </Button>
                        </div>

                        {/* Lessons Table */}
                        <div className="border rounded-lg overflow-hidden">
                          {selectedModule.contents && selectedModule.contents.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full table-fixed">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Order</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Type</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Duration</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {selectedModule.contents.map((lesson, index) => (
                                    <tr key={lesson._id} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex flex-col items-center space-y-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleMoveLesson(lesson._id, 'up')}
                                            disabled={index === 0}
                                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                          >
                                            <ChevronUp className="h-3 w-3" />
                                          </Button>
                                          <span className="text-xs text-gray-500">{index + 1}</span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleMoveLesson(lesson._id, 'down')}
                                            disabled={index === selectedModule.contents.length - 1}
                                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                          >
                                            <ChevronDown className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                          {lesson.type === 'video' && <Video className="h-4 w-4 text-red-500" />}
                                          {lesson.type === 'image' && <Image className="h-4 w-4 text-green-500" />}
                                          {lesson.type === 'pdf' && <FileText className="h-4 w-4 text-blue-500" />}
                                          {lesson.type === 'audio' && <File className="h-4 w-4 text-purple-500" />}
                                          {lesson.type === 'youtube' && <Play className="h-4 w-4 text-red-600" />}
                                          <span className="ml-2 text-xs font-medium text-gray-900 capitalize">{lesson.type}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div>
                                          <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                                          {lesson.description && (
                                            <div className="text-xs text-gray-600 mt-1 max-w-xs truncate" title={lesson.description}>
                                              {lesson.description}
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{lesson.duration || 'N/A'}</div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handlePreviewLesson(lesson)}
                                            className="h-7 px-2 text-blue-600 hover:text-blue-700"
                                          >
                                            <Eye className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditLesson(lesson)}
                                            className="h-7 px-2 text-green-600 hover:text-green-700"
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteLesson(lesson._id)}
                                            className="h-7 px-2 text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>No lessons in this module</p>
                              <p className="text-sm">Add lessons to get started</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No Module Selected</h3>
                        <p>Select a module from the sidebar to view its lessons</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <div className="max-w-2xl">
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Settings</CardTitle>
                      <CardDescription>Configure your course details and pricing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Course Name</Label>
                            <Input
                              id="name"
                              value={course.name}
                              onChange={(e) => setCourse({...course, name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input
                              id="category"
                              value={course.category}
                              onChange={(e) => setCourse({...course, category: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={course.description}
                            onChange={(e) => setCourse({...course, description: e.target.value})}
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Thumbnail */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Thumbnail</h3>
                        <div className="flex items-center space-x-4">
                          <img
                            src={course.thumbnail || `https://picsum.photos/200/200?random=${course._id}`}
                            alt="Course thumbnail"
                            className="w-24 h-24 object-cover rounded"
                          />
                          <Button
                            variant="outline"
                            onClick={() => setShowFileBrowser(true)}
                          >
                            <Image className="h-4 w-4 mr-2" />
                            Select Thumbnail
                          </Button>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Pricing</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input
                              id="price"
                              type="number"
                              value={course.price}
                              onChange={(e) => setCourse({...course, price: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="originalPrice">Original Price (₹)</Label>
                            <Input
                              id="originalPrice"
                              type="number"
                              value={course.originalPrice}
                              onChange={(e) => setCourse({...course, originalPrice: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Course Details */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Course Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select value={course.difficulty} onValueChange={(value) => setCourse({...course, difficulty: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Input
                              id="duration"
                              value={course.duration}
                              onChange={(e) => setCourse({...course, duration: e.target.value})}
                              placeholder="e.g., 40 hours"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Status</h3>
                        <div className="space-y-2">
                          <Label htmlFor="status">Course Status</Label>
                          <Select value={course.status} onValueChange={(value) => setCourse({...course, status: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Add Module Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
            <DialogDescription>Create a new module for your course</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="moduleName">Module Name</Label>
              <Input
                id="moduleName"
                value={newModule.name}
                onChange={(e) => setNewModule({...newModule, name: e.target.value})}
                placeholder="Enter module name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="moduleDescription">Description</Label>
              <Textarea
                id="moduleDescription"
                value={newModule.description}
                onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                placeholder="Enter module description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModuleDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddModule}
              disabled={savingModule}
            >
              {savingModule ? 'Adding...' : 'Add Module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="dialog-content-custom max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
            <DialogDescription>Add a new lesson to the selected module</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* 1. Title */}
              <div>
                <Label htmlFor="lessonTitle" className="text-sm font-medium">1. Title *</Label>
                <Input
                  id="lessonTitle"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                  placeholder="Enter lesson title"
                  className="mt-1"
                />
              </div>
              
              {/* 2. Description */}
              <div>
                <Label htmlFor="lessonDescription" className="text-sm font-medium">2. Description</Label>
                <Textarea
                  id="lessonDescription"
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                  placeholder="Enter lesson description"
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              {/* 3. Content Type */}
              <div>
                <Label className="text-sm font-medium">3. Content Type *</Label>
                <Select value={newLesson.type} onValueChange={(value) => setNewLesson({...newLesson, type: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Photo</SelectItem>
                    <SelectItem value="pdf">PDF/Documents</SelectItem>
                    <SelectItem value="youtube">YouTube Embed Links</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-8">
              {/* 4. Content Selection */}
              <div>
                <Label className="text-sm font-medium">4. Content *</Label>
                <div className="mt-1 space-y-3">
                  {/* File Browser Button or Textbox */}
                  {newLesson.type === 'youtube' ? (
                    <div className="space-y-2">
                      <Textarea
                        value={newLesson.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Paste YouTube embed iframe code here"
                        rows={4}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Example: &lt;iframe src="https://www.youtube.com/embed/VIDEO_ID" width="560" height="315" frameborder="0" allowfullscreen&gt;&lt;/iframe&gt;
                      </p>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Input
                        value={selectedFileName || newLesson.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Select a file to display its name"
                        className="flex-1"
                        readOnly
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowFileBrowser(true)}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Browse Files
                      </Button>
                    </div>
                  )}
                  
                  {/* Content Preview */}
                  {newLesson.content && (
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <Label className="text-xs font-medium text-gray-600 mb-2 block">Preview:</Label>
                      <div className="aspect-video bg-white rounded border">
                        {newLesson.type === 'youtube' && newLesson.content.includes('iframe') ? (
                          <div 
                            className="w-full h-full rounded"
                            dangerouslySetInnerHTML={{ __html: newLesson.content }}
                          />
                        ) : newLesson.type === 'video' ? (
                          <video
                            src={newLesson.content.startsWith('http') || newLesson.content.startsWith('/api/') ? newLesson.content : `/api/content/admin/files/${newLesson.content}/serve`}
                            controls
                            className="w-full h-full rounded"
                          />
                        ) : newLesson.type === 'image' ? (
                          <img
                            src={newLesson.content.startsWith('http') || newLesson.content.startsWith('/api/') ? newLesson.content : `/api/content/admin/files/${newLesson.content}/serve`}
                            alt="Content Preview"
                            className="w-full h-full object-contain rounded"
                          />
                        ) : newLesson.type === 'pdf' ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <FileText className="h-12 w-12 mx-auto mb-2 text-blue-500" />
                              <p className="text-sm font-medium">PDF Document</p>
                              <p className="text-xs text-gray-500">Click to open</p>
                            </div>
                          </div>
                        ) : newLesson.type === 'audio' ? (
                          <div className="flex items-center justify-center h-full">
                            <audio
                              src={newLesson.content.startsWith('http') || newLesson.content.startsWith('/api/') ? newLesson.content : `/api/content/admin/files/${newLesson.content}/serve`}
                              controls
                              className="w-full max-w-md"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                              <File className="h-12 w-12 mx-auto mb-2" />
                              <p className="text-sm">No preview available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Duration Field */}
              <div>
                <Label htmlFor="lessonDuration" className="text-sm font-medium">Duration</Label>
                <Input
                  id="lessonDuration"
                  value={newLesson.duration}
                  onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
                  placeholder="Auto-calculated for videos/audio, or enter manually (e.g., 5:30)"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Duration is automatically calculated for video and audio files. For YouTube videos, you may need to enter it manually.
                </p>
              </div>
            </div>
          </div>
          
          {/* Full Width Resources Field */}
          <div className="mt-8">
            <Label className="text-sm font-medium">Resources</Label>
            <div className="mt-1 space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={selectedResources.map(r => r.originalName).join(', ')}
                  placeholder="Select additional resources (PDFs, documents, etc.)"
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowResourceBrowser(true)}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Browse Resources
                </Button>
              </div>
              {selectedResources.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedResources.map((resource, index) => (
                    <div key={resource._id} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs">
                      <span>{resource.originalName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = selectedResources.filter((_, i) => i !== index);
                          setSelectedResources(updated);
                          setNewLesson({...newLesson, resources: updated.map(r => r._id)});
                        }}
                        className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-2 w-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Add supplementary materials like PDFs, documents, or other files to support this lesson.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLessonDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddLesson}
              disabled={savingLesson}
            >
              <Plus className="h-4 w-4 mr-2" />
              {savingLesson ? 'Adding...' : 'Add Lesson'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Browser Dialog */}
      <Dialog open={showFileBrowser} onOpenChange={setShowFileBrowser}>
        <DialogContent className="file-browser-custom max-h-[90vh] overflow-y-auto">
          <style>
            {`
              .file-browser-custom {
                width: auto !important;
                max-width: 80vw !important;
                min-width: 60vw !important;
              }
            `}
          </style>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5" />
              <span>Select File</span>
            </DialogTitle>
            <DialogDescription>
              Choose a file from your uploaded content to use in this lesson.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={navigateToRoot}
                className="text-blue-600 hover:text-blue-700"
              >
                <FolderOpen className="h-4 w-4 mr-1" />
                Root
              </Button>
              {folderPath.map((folder, index) => (
                <div key={folder._id} className="flex items-center space-x-1">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newPath = folderPath.slice(0, index + 1);
                      setFolderPath(newPath);
                      setCurrentFolder(folder);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Folder className="h-4 w-4 mr-1" />
                    {folder.name}
                  </Button>
                </div>
              ))}
            </div>

            {/* Files and Folders Table */}
            <div className="bg-white rounded-lg border">
              {/* Table Header */}
              <div className="px-6 py-3 border-b bg-gray-50">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                  <div className="col-span-6">Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-1">Modified</div>
                  <div className="col-span-1">Action</div>
                </div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y max-h-[90vh] overflow-y-auto">
                {/* Folders */}
                {uploadedFolders.map((folder) => (
                  <div 
                    key={folder._id} 
                    className="px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigateToFolder(folder)}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Name Column */}
                      <div className="col-span-6 flex items-center space-x-3">
                        <FolderOpen className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {folder.name}
                          </div>
                        </div>
                      </div>
                      
                      {/* Type Column */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">Folder</span>
                      </div>
                      
                      {/* Size Column */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">{folder.fileCount || 0} files</span>
                      </div>
                      
                      {/* Modified Column */}
                      <div className="col-span-1">
                        <span className="text-sm text-gray-500">
                          {folder.createdAt ? new Date(folder.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      
                      {/* Action Column */}
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToFolder(folder);
                          }}
                          className="h-7 px-2 text-blue-600 hover:text-blue-700"
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Files */}
                {uploadedFiles.map((file) => (
                  <div 
                    key={file._id} 
                    className="px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleFileSelect(file)}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Name Column */}
                      <div className="col-span-6 flex items-center space-x-3">
                        {file.mimetype && file.mimetype.startsWith('video/') && <Video className="h-5 w-5 text-red-500 flex-shrink-0" />}
                        {file.mimetype && file.mimetype.startsWith('image/') && <Image className="h-5 w-5 text-green-500 flex-shrink-0" />}
                        {file.mimetype && file.mimetype.includes('pdf') && <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                        {file.mimetype && file.mimetype.startsWith('audio/') && <File className="h-5 w-5 text-purple-500 flex-shrink-0" />}
                        {!file.mimetype && <File className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate" title={file.originalName}>
                            {file.originalName}
                          </div>
                        </div>
                      </div>
                      
                      {/* Type Column */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">
                          {file.mimetype ? file.mimetype.split('/')[0] : 'File'}
                        </span>
                      </div>
                      
                      {/* Size Column */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">
                          {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                        </span>
                      </div>
                      
                      {/* Modified Column */}
                      <div className="col-span-1">
                        <span className="text-sm text-gray-500">
                          {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      
                      {/* Action Column */}
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileSelect(file);
                          }}
                          className="h-7 px-2 text-green-600 hover:text-green-700"
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {uploadedFolders.length === 0 && uploadedFiles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No files found in this folder</p>
                <p className="text-sm">Upload some files to use in your lessons</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFileBrowser(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Preview Dialog */}
      <Dialog open={showLessonPreview} onOpenChange={setShowLessonPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Lesson Preview</span>
            </DialogTitle>
            <DialogDescription>
              Preview the content of "{previewLesson?.title}"
            </DialogDescription>
          </DialogHeader>
          
          {previewLesson && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> 
                  <span className="ml-2 capitalize">{previewLesson.type}</span>
                </div>
                <div>
                  <span className="font-medium">Duration:</span> 
                  <span className="ml-2">{previewLesson.duration || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium">Author:</span> 
                  <span className="ml-2">{previewLesson.author || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium">Order:</span> 
                  <span className="ml-2">{previewLesson.order || 0}</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Description:</h4>
                <p className="text-sm text-gray-600">{previewLesson.description || 'No description available'}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Content:</h4>
                <div className="border rounded-lg p-4 bg-gray-50">
                  {previewLesson.type === 'video' && previewLesson.content.includes('youtube.com') ? (
                    <div className="aspect-video">
                      <iframe
                        src={previewLesson.content}
                        title={previewLesson.title}
                        className="w-full h-full rounded"
                        allowFullScreen
                      />
                    </div>
                  ) : previewLesson.type === 'video' ? (
                    <div className="aspect-video">
                      <video
                        src={previewLesson.content.startsWith('http') || previewLesson.content.startsWith('/api/') ? previewLesson.content : `/api/content/admin/files/${previewLesson.content}/serve`}
                        controls
                        className="w-full h-full rounded"
                      />
                    </div>
                  ) : previewLesson.type === 'image' ? (
                    <div className="aspect-video">
                      <img
                        src={previewLesson.content.startsWith('http') || previewLesson.content.startsWith('/api/') ? previewLesson.content : `/api/content/admin/files/${previewLesson.content}/serve`}
                        alt={previewLesson.title}
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                  ) : previewLesson.type === 'pdf' ? (
                    <div className="aspect-video flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                        <p className="text-lg font-medium">PDF Document</p>
                        <p className="text-sm text-gray-600 mb-4">Click to open in new tab</p>
                        <Button
                          onClick={() => window.open(
                            previewLesson.content.startsWith('http') || previewLesson.content.startsWith('/api/') ? previewLesson.content : `/api/content/admin/files/${previewLesson.content}/serve`, 
                            '_blank'
                          )}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Open PDF
                        </Button>
                      </div>
                    </div>
                  ) : previewLesson.type === 'audio' ? (
                    <div className="aspect-video flex items-center justify-center">
                      <audio
                        src={previewLesson.content.startsWith('http') || previewLesson.content.startsWith('/api/') ? previewLesson.content : `/api/content/admin/files/${previewLesson.content}/serve`}
                        controls
                        className="w-full max-w-md"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <File className="h-16 w-16 mx-auto mb-4" />
                        <p>Content preview not available for this file type</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {previewLesson.resources && previewLesson.resources.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Resources:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {previewLesson.resources.map((resource, index) => (
                      <li key={index}>{resource}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLessonPreview(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog open={showEditLesson} onOpenChange={setShowEditLesson}>
        <DialogContent className="dialog-content-custom max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Edit Lesson</span>
            </DialogTitle>
            <DialogDescription>
              Update the lesson details
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* 1. Title */}
              <div>
                <Label htmlFor="edit-title" className="text-sm font-medium">1. Title *</Label>
                <Input
                  id="edit-title"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                  placeholder="Enter lesson title"
                  className="mt-1"
                />
              </div>
              
              {/* 2. Description */}
              <div>
                <Label htmlFor="edit-description" className="text-sm font-medium">2. Description</Label>
                <Textarea
                  id="edit-description"
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                  placeholder="Enter lesson description"
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              {/* 3. Content Type */}
              <div>
                <Label className="text-sm font-medium">3. Content Type *</Label>
                <Select value={newLesson.type} onValueChange={(value) => setNewLesson({...newLesson, type: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Photo</SelectItem>
                    <SelectItem value="pdf">PDF/Documents</SelectItem>
                    <SelectItem value="youtube">YouTube Embed Links</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-8">
              {/* 4. Content Selection */}
              <div>
                <Label className="text-sm font-medium">4. Content *</Label>
                <div className="mt-1 space-y-3">
                  {/* File Browser Button or Textbox */}
                  {newLesson.type === 'youtube' ? (
                    <div className="space-y-2">
                      <Textarea
                        value={newLesson.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Paste YouTube embed iframe code here"
                        rows={4}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Example: &lt;iframe src="https://www.youtube.com/embed/VIDEO_ID" width="560" height="315" frameborder="0" allowfullscreen&gt;&lt;/iframe&gt;
                      </p>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Input
                        value={selectedFileName || newLesson.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Select a file to display its name"
                        className="flex-1"
                        readOnly
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowFileBrowser(true)}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Browse Files
                      </Button>
                    </div>
                  )}
                  
                  {/* Content Preview */}
                  {newLesson.content && (
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <Label className="text-xs font-medium text-gray-600 mb-2 block">Preview:</Label>
                      <div className="aspect-video bg-white rounded border">
                        {newLesson.type === 'youtube' && newLesson.content.includes('iframe') ? (
                          <div 
                            className="w-full h-full rounded"
                            dangerouslySetInnerHTML={{ __html: newLesson.content }}
                          />
                        ) : newLesson.type === 'video' ? (
                          <video
                            src={newLesson.content.startsWith('http') || newLesson.content.startsWith('/api/') ? newLesson.content : `/api/content/admin/files/${newLesson.content}/serve`}
                            controls
                            className="w-full h-full rounded"
                          />
                        ) : newLesson.type === 'image' ? (
                          <img
                            src={newLesson.content.startsWith('http') || newLesson.content.startsWith('/api/') ? newLesson.content : `/api/content/admin/files/${newLesson.content}/serve`}
                            alt="Content Preview"
                            className="w-full h-full object-contain rounded"
                          />
                        ) : newLesson.type === 'pdf' ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <FileText className="h-12 w-12 mx-auto mb-2 text-blue-500" />
                              <p className="text-sm font-medium">PDF Document</p>
                              <p className="text-xs text-gray-500">Click to open</p>
                            </div>
                          </div>
                        ) : newLesson.type === 'audio' ? (
                          <div className="flex items-center justify-center h-full">
                            <audio
                              src={newLesson.content.startsWith('http') || newLesson.content.startsWith('/api/') ? newLesson.content : `/api/content/admin/files/${newLesson.content}/serve`}
                              controls
                              className="w-full max-w-md"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                              <File className="h-12 w-12 mx-auto mb-2" />
                              <p className="text-sm">No preview available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Duration Field */}
              <div>
                <Label htmlFor="editDuration" className="text-sm font-medium">Duration</Label>
                <Input
                  id="editDuration"
                  value={newLesson.duration}
                  onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
                  placeholder="Auto-calculated for videos/audio, or enter manually (e.g., 5:30)"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Duration is automatically calculated for video and audio files. For YouTube videos, you may need to enter it manually.
                </p>
              </div>
            </div>
          </div>
          
          {/* Full Width Resources Field */}
          <div className="mt-8">
            <Label className="text-sm font-medium">Resources</Label>
            <div className="mt-1 space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={selectedResources.map(r => r.originalName).join(', ')}
                  placeholder="Select additional resources (PDFs, documents, etc.)"
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowResourceBrowser(true)}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Browse Resources
                </Button>
              </div>
              {selectedResources.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedResources.map((resource, index) => (
                    <div key={resource._id} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs">
                      <span>{resource.originalName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = selectedResources.filter((_, i) => i !== index);
                          setSelectedResources(updated);
                          setNewLesson({...newLesson, resources: updated.map(r => r._id)});
                        }}
                        className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-2 w-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Add supplementary materials like PDFs, documents, or other files to support this lesson.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditLesson(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateLesson}
              disabled={updatingLesson}
            >
              <Save className="h-4 w-4 mr-2" />
              {updatingLesson ? 'Updating...' : 'Update Lesson'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resource Browser Dialog */}
      <Dialog open={showResourceBrowser} onOpenChange={setShowResourceBrowser}>
        <DialogContent className="resource-browser-custom max-h-[90vh] overflow-y-auto">
          <style>
            {`
              .resource-browser-custom {
                width: auto !important;
                max-width: 80vw !important;
                min-width: 60vw !important;
              }
            `}
          </style>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5" />
              <span>Select Resources</span>
            </DialogTitle>
            <DialogDescription>
              Choose additional resources (PDFs, documents, etc.) to support this lesson.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={navigateToRoot}
                className="text-blue-600 hover:text-blue-700"
              >
                <FolderOpen className="h-4 w-4 mr-1" />
                Root
              </Button>
              {folderPath.map((folder, index) => (
                <div key={folder._id} className="flex items-center space-x-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToFolder(folder)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {folder.name}
                  </Button>
                </div>
              ))}
            </div>

            {/* Resources Table */}
            <div className="bg-white rounded-lg border">
              {/* Table Header */}
              <div className="px-6 py-3 border-b bg-gray-50">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                  <div className="col-span-6">Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-1">Modified</div>
                  <div className="col-span-1">Action</div>
                </div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y max-h-[90vh] overflow-y-auto">
                {/* Folders */}
                {uploadedFolders.map((folder) => (
                  <div 
                    key={folder._id} 
                    className="px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigateToFolder(folder)}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Name Column */}
                      <div className="col-span-6 flex items-center space-x-3">
                        <FolderOpen className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {folder.name}
                          </div>
                        </div>
                      </div>
                      
                      {/* Type Column */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">Folder</span>
                      </div>
                      
                      {/* Size Column */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">{folder.fileCount || 0} files</span>
                      </div>
                      
                      {/* Modified Column */}
                      <div className="col-span-1">
                        <span className="text-sm text-gray-500">
                          {folder.createdAt ? new Date(folder.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      
                      {/* Action Column */}
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToFolder(folder);
                          }}
                          className="h-7 px-2 text-blue-600 hover:text-blue-700"
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Files */}
                {uploadedFiles.map((file) => (
                  <div 
                    key={file._id} 
                    className="px-6 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Name Column */}
                      <div className="col-span-6 flex items-center space-x-3">
                        {file.mimetype && file.mimetype.startsWith('video/') && <Video className="h-5 w-5 text-red-500 flex-shrink-0" />}
                        {file.mimetype && file.mimetype.startsWith('image/') && <Image className="h-5 w-5 text-green-500 flex-shrink-0" />}
                        {file.mimetype && file.mimetype.includes('pdf') && <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                        {file.mimetype && file.mimetype.startsWith('audio/') && <File className="h-5 w-5 text-purple-500 flex-shrink-0" />}
                        {!file.mimetype && <File className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate" title={file.originalName}>
                            {file.originalName}
                          </div>
                        </div>
                      </div>
                      
                      {/* Type Column */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">
                          {file.mimetype ? file.mimetype.split('/')[0] : 'File'}
                        </span>
                      </div>
                      
                      {/* Size Column */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">
                          {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                        </span>
                      </div>
                      
                      {/* Modified Column */}
                      <div className="col-span-1">
                        <span className="text-sm text-gray-500">
                          {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      
                      {/* Action Column */}
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const isSelected = selectedResources.some(r => r._id === file._id);
                            if (isSelected) {
                              const updated = selectedResources.filter(r => r._id !== file._id);
                              setSelectedResources(updated);
                              setNewLesson({...newLesson, resources: updated.map(r => r._id)});
                            } else {
                              const updated = [...selectedResources, file];
                              setSelectedResources(updated);
                              setNewLesson({...newLesson, resources: updated.map(r => r._id)});
                            }
                          }}
                          className={`h-7 px-2 ${
                            selectedResources.some(r => r._id === file._id)
                              ? 'text-green-600 hover:text-green-700 bg-green-50'
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          {selectedResources.some(r => r._id === file._id) ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {uploadedFolders.length === 0 && uploadedFiles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No files or folders found</p>
                <p className="text-sm">Upload some content first</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResourceBrowser(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowResourceBrowser(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={showEditModuleDialog} onOpenChange={setShowEditModuleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Edit Module</span>
            </DialogTitle>
            <DialogDescription>
              Update the module details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-module-name">Module Name *</Label>
              <Input
                id="edit-module-name"
                value={newModule.name}
                onChange={(e) => setNewModule({...newModule, name: e.target.value})}
                placeholder="Enter module name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-module-description">Description</Label>
              <Textarea
                id="edit-module-description"
                value={newModule.description}
                onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                placeholder="Enter module description"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModuleDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateModule}
              disabled={updatingModule}
            >
              <Save className="h-4 w-4 mr-2" />
              {updatingModule ? 'Updating...' : 'Update Module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Loading Overlay */}
      {(savingCourse || savingModule || savingLesson || updatingModule || updatingLesson || deletingModule || deletingLesson) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-lg font-medium">
              {savingCourse && 'Saving course...'}
              {savingModule && 'Adding module...'}
              {savingLesson && 'Adding lesson...'}
              {updatingModule && 'Updating module...'}
              {updatingLesson && 'Updating lesson...'}
              {deletingModule && 'Deleting module...'}
              {deletingLesson && 'Deleting lesson...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEditor;