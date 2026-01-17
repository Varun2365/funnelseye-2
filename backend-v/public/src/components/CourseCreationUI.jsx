import React, { useState, useEffect, useRef } from 'react';
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
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Eye, 
  Play, 
  FileText, 
  Video, 
  Image, 
  Link, 
  Upload, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Copy,
  ExternalLink,
  Settings,
  FolderOpen,
  Search,
  Users
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const CourseCreationUI = () => {
  const { showToast } = useToast();
  const autosaveTimeoutRef = useRef(null);
  
  // State management
  const [selectedCategory, setSelectedCategory] = useState(null); // 'coach_course' or 'customer_course'
  const [course, setCourse] = useState({
    title: '',
    description: '',
    courseType: 'workout_routine',
    price: 0,
    category: 'customer_course',
    thumbnail: '',
    status: 'draft'
  });
  const [modules, setModules] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [fileSearchTerm, setFileSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');

  // Get auth token (coach token)
  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('adminToken');
  };

  // Load uploaded files (coaches can access admin-uploaded files)
  const loadUploadedFiles = async () => {
    try {
      const params = new URLSearchParams({
        page: 1,
        limit: 100,
        fileType: fileTypeFilter,
        search: fileSearchTerm
      });

      const response = await fetch(`/api/content/admin/uploaded-files?${params}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadedFiles(result.data.files);
      }
    } catch (error) {
      console.error('Error loading uploaded files:', error);
    }
  };

  // Autosave functionality
  const autosave = async () => {
    if (!course.title.trim()) return;

    if (!course._id) {
      // First time saving - create course
      try {
        setSaving(true);
        const response = await fetch('/api/content/coach/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            title: course.title,
            description: course.description,
            courseType: course.courseType,
            price: parseFloat(course.price) || 0,
            category: course.category,
            thumbnail: course.thumbnail,
            status: course.status
          })
        });

        const result = await response.json();
        
        if (result.success) {
          setCourse(prev => ({ ...prev, _id: result.data._id }));
          setLastSaved(new Date());
          // Load course to get modules structure
          await loadCourse(result.data._id);
        }
      } catch (error) {
        console.error('Error autosaving:', error);
      } finally {
        setSaving(false);
      }
    } else {
      // Update existing course
      try {
        setSaving(true);
        const response = await fetch(`/api/content/coach/courses/${course._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            title: course.title,
            description: course.description,
            courseType: course.courseType,
            price: parseFloat(course.price) || 0,
            category: course.category,
            thumbnail: course.thumbnail,
            status: course.status
          })
        });

        const result = await response.json();
        
        if (result.success) {
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('Error autosaving:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  // Load course by ID
  const loadCourse = async (courseId) => {
    try {
      const response = await fetch(`/api/content/coach/courses/${courseId}`, {
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
          category: category,
          thumbnail: courseData.thumbnail || '',
          status: courseData.status || 'draft',
          _id: courseData._id
        });
        
        // Set selected category based on loaded course
        setSelectedCategory(category);
        
        if (courseData.modules && courseData.modules.length > 0) {
          setModules(courseData.modules);
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    }
  };

  // Load course on mount if editing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    
    if (courseId) {
      loadCourse(courseId);
    }
  }, []);

  // Debounced autosave
  useEffect(() => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      autosave();
    }, 2000);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [course]);

  // Load uploaded files when dialog opens
  useEffect(() => {
    if (showFileDialog) {
      loadUploadedFiles();
    }
  }, [showFileDialog, fileTypeFilter, fileSearchTerm]);

  // Add new module
  const addModule = async () => {
    if (!course._id) {
      showToast('Please save the course first', 'error');
      return;
    }

    const newModuleData = {
      title: '',
      description: '',
      day: modules.length + 1,
      order: modules.length
    };
    
    setEditingModule(newModuleData);
    setShowModuleDialog(true);
  };

  // Save module
  const saveModule = async () => {
    if (!editingModule?.title?.trim()) {
      showToast('Please enter module title', 'error');
      return;
    }

    try {
      const response = editingModule._id
        ? await fetch(`/api/content/coach/modules/${editingModule._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
              title: editingModule.title,
              description: editingModule.description || '',
              day: parseInt(editingModule.day) || 1,
              order: editingModule.order || 0
            })
          })
        : await fetch(`/api/content/coach/courses/${course._id}/modules`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
              title: editingModule.title,
              description: editingModule.description || '',
              day: parseInt(editingModule.day) || 1,
              order: modules.length
            })
          });

      const result = await response.json();
      
      if (result.success) {
        showToast(editingModule._id ? 'Module updated successfully' : 'Module created successfully', 'success');
        setShowModuleDialog(false);
        setEditingModule(null);
        await loadCourse(course._id);
      } else {
        showToast(result.message || 'Error saving module', 'error');
      }
    } catch (error) {
      console.error('Error saving module:', error);
      showToast('Error saving module', 'error');
    }
  };

  // Update module
  const updateModule = async (moduleId, updatedData) => {
    try {
      const response = await fetch(`/api/content/coach/modules/${moduleId}`, {
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
      const response = await fetch(`/api/content/coach/modules/${moduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('Module deleted successfully', 'success');
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
  const addContent = (module) => {
    if (!course._id) {
      showToast('Please save the course first', 'error');
      return;
    }

    const newContentData = {
      title: '',
      description: '',
      contentType: 'video',
      content: '',
      order: 0
    };
    
    setSelectedModule(module);
    setEditingContent(newContentData);
    setShowContentDialog(true);
  };

  // Save content
  const saveContent = async () => {
    if (!editingContent?.title?.trim()) {
      showToast('Please enter content title', 'error');
      return;
    }

    if (!editingContent?.content?.trim()) {
      showToast('Please provide content (file URL or YouTube URL)', 'error');
      return;
    }

    try {
      const moduleId = selectedModule?._id || selectedModule;
      const response = editingContent._id
        ? await fetch(`/api/content/coach/contents/${editingContent._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
              title: editingContent.title,
              description: editingContent.description || '',
              contentType: editingContent.contentType,
              content: editingContent.content,
              order: editingContent.order || 0
            })
          })
        : await fetch(`/api/content/coach/modules/${moduleId}/contents`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
              title: editingContent.title,
              description: editingContent.description || '',
              contentType: editingContent.contentType,
              content: editingContent.content,
              order: 0
            })
          });

      const result = await response.json();
      
      if (result.success) {
        showToast(editingContent._id ? 'Content updated successfully' : 'Content created successfully', 'success');
        setShowContentDialog(false);
        setEditingContent(null);
        setSelectedModule(null);
        await loadCourse(course._id);
      } else {
        showToast(result.message || 'Error saving content', 'error');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      showToast('Error saving content', 'error');
    }
  };

  // Update content
  const updateContent = async (contentId, updatedData) => {
    try {
      const response = await fetch(`/api/content/coach/contents/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(updatedData)
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('Content updated successfully', 'success');
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
      const response = await fetch(`/api/content/coach/contents/${contentId}`, {
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


  // Get file icon
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'video': return <Video className="h-4 w-4 text-red-500" />;
      case 'image': return <Image className="h-4 w-4 text-green-500" />;
      case 'pdf': return <FileText className="h-4 w-4 text-red-600" />;
      case 'document': return <FileText className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Creation</h1>
          <p className="text-muted-foreground">Create comprehensive courses with modules and content</p>
        </div>
        <div className="flex items-center space-x-2">
          {lastSaved && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
          {saving && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          <Button onClick={autosave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Now
          </Button>
        </div>
      </div>

      {/* Category Selection Section */}
      {!selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Select Course Category</CardTitle>
            <CardDescription>Choose the type of course you want to create</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coach Course Option */}
              <Card 
                className="cursor-pointer hover:border-blue-500 transition-colors border-2"
                onClick={() => {
                  setSelectedCategory('coach_course');
                  setCourse(prev => ({ ...prev, category: 'coach_course', courseType: 'other_course' }));
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Coach Course</span>
                  </CardTitle>
                  <CardDescription>
                    Create default modular courses for coaches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Structured modular courses with default templates that coaches can customize and use as a base for their content.
                  </p>
                </CardContent>
              </Card>

              {/* Customer Course Option */}
              <Card 
                className="cursor-pointer hover:border-blue-500 transition-colors border-2"
                onClick={() => {
                  setSelectedCategory('customer_course');
                  setCourse(prev => ({ ...prev, category: 'customer_course', courseType: 'workout_routine' }));
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Customer Course</span>
                  </CardTitle>
                  <CardDescription>
                    Create courses for customers: Diet Plans, Meal Planner, Workouts, and Other Courses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create courses specifically for customers including diet plans, meal planners, workout routines, and other course types.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Basic Info - Only shown after category selection */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>Basic details about your {selectedCategory === 'coach_course' ? 'coach' : 'customer'} course</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedCategory(null);
                  setCourse({
                    title: '',
                    description: '',
                    courseType: 'workout_routine',
                    price: 0,
                    category: 'customer_course',
                    thumbnail: '',
                    status: 'draft',
                    _id: course._id
                  });
                }}
              >
                Change Category
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course-title">Course Title *</Label>
                <Input
                  id="course-title"
                  value={course.title}
                  onChange={(e) => setCourse(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter course title"
                />
              </div>
              {selectedCategory === 'customer_course' && (
                <div>
                  <Label htmlFor="course-type">Course Type *</Label>
                  <Select 
                    value={course.courseType} 
                    onValueChange={(value) => setCourse(prev => ({ ...prev, courseType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workout_routine">Workouts</SelectItem>
                      <SelectItem value="meal_plan">Diet Plans / Meal Planner</SelectItem>
                      <SelectItem value="other_course">Other Courses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedCategory === 'coach_course' && (
                <div>
                  <Label htmlFor="course-type">Course Type</Label>
                  <Select 
                    value={course.courseType || 'other_course'} 
                    onValueChange={(value) => setCourse(prev => ({ ...prev, courseType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="other_course">Modular Course (Default)</SelectItem>
                      <SelectItem value="workout_routine">Workout Routine</SelectItem>
                      <SelectItem value="meal_plan">Meal Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course-price">Price *</Label>
                <Input
                  id="course-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={course.price}
                  onChange={(e) => setCourse(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-end">
                <Badge variant="outline" className="w-full p-2 text-center">
                  Category: {selectedCategory === 'coach_course' ? 'Coach Course' : 'Customer Course'}
                </Badge>
              </div>
            </div>
          <div>
            <Label htmlFor="course-description">Description</Label>
            <Textarea
              id="course-description"
              value={course.description}
              onChange={(e) => setCourse(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter course description"
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="course-thumbnail">Thumbnail URL</Label>
            <Input
              id="course-thumbnail"
              value={course.thumbnail}
              onChange={(e) => setCourse(prev => ({ ...prev, thumbnail: e.target.value }))}
              placeholder="Enter thumbnail URL"
            />
          </div>
          <div>
            <Label htmlFor="course-status">Status</Label>
            <Select 
              value={course.status} 
              onValueChange={(value) => setCourse(prev => ({ ...prev, status: value }))}
            >
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
        </CardContent>
      </Card>
      )}

      {/* Course Modules - Only shown after category selection */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Course Modules</CardTitle>
                <CardDescription>
                  {selectedCategory === 'coach_course' 
                    ? 'Organize your default modular course structure'
                    : 'Organize your course content into day-wise modules'}
                </CardDescription>
              </div>
              <Button onClick={addModule} disabled={!course._id}>
                <Plus className="w-4 h-4 mr-2" />
                Add Module
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
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No modules created</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first module to organize your course content
              </p>
              <Button onClick={addModule}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Module
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module, moduleIndex) => (
                <Card key={moduleIndex} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {moduleIndex + 1}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{module.title || 'Untitled Module'}</h3>
                          <p className="text-sm text-muted-foreground">
                            Day {module.day} • {module.contents?.length || 0} content items
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addContent(module)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Content
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingModule({
                              title: module.title,
                              description: module.description || '',
                              day: module.day,
                              order: module.order,
                              _id: module._id
                            });
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
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {module.description && (
                      <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                    )}
                    
                    {module.contents && module.contents.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No content added yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {module.contents?.map((content, contentIndex) => (
                          <div key={contentIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {contentIndex + 1}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getFileIcon(content.contentType || 'video')}
                                <span className="text-sm font-medium">
                                  {content.title || 'Untitled Content'}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {content.contentType}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingContent({
                                    title: content.title,
                                    description: content.description || '',
                                    contentType: content.contentType,
                                    content: content.content,
                                    order: content.order,
                                    _id: content._id
                                  });
                                  setSelectedModule(module);
                                  setShowContentDialog(true);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteContent(content._id)}
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Module Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModule ? 'Edit Module' : 'Add New Module'}
            </DialogTitle>
            <DialogDescription>
              Configure module details and content organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="module-title">Module Title *</Label>
              <Input
                id="module-title"
                value={editingModule?.title || ''}
                onChange={(e) => setEditingModule(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Day 1: Upper Body Workout"
              />
            </div>
            <div>
              <Label htmlFor="module-day">Day Number *</Label>
              <Input
                id="module-day"
                type="number"
                min="1"
                value={editingModule?.day || 1}
                onChange={(e) => setEditingModule(prev => ({ ...prev, day: parseInt(e.target.value) || 1 }))}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                value={editingModule?.description || ''}
                onChange={(e) => setEditingModule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter module description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowModuleDialog(false);
              setEditingModule(null);
            }}>
              Cancel
            </Button>
            <Button onClick={saveModule}>
              {editingModule?._id ? 'Update Module' : 'Create Module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Dialog */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? 'Edit Content' : 'Add New Content'}
            </DialogTitle>
            <DialogDescription>
              Add files or YouTube videos to your course content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="content-title">Content Title *</Label>
                <Input
                  id="content-title"
                  value={editingContent?.title || ''}
                  onChange={(e) => setEditingContent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter content title"
                />
              </div>
              <div>
                <Label htmlFor="content-type">Content Type *</Label>
                <Select 
                  value={editingContent?.contentType || 'video'} 
                  onValueChange={(value) => setEditingContent(prev => ({ ...prev, contentType: value }))}
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
                value={editingContent?.description || ''}
                onChange={(e) => setEditingContent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter content description"
                rows={3}
              />
            </div>

            {editingContent?.contentType === 'youtube' ? (
              <div>
                <Label htmlFor="youtube-url">YouTube URL *</Label>
                <Input
                  id="youtube-url"
                  value={editingContent?.content || ''}
                  onChange={(e) => setEditingContent(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/embed/..."
                />
              </div>
            ) : editingContent?.contentType === 'text' ? (
              <div>
                <Label htmlFor="text-content">Text Content *</Label>
                <Textarea
                  id="text-content"
                  value={editingContent?.content || ''}
                  onChange={(e) => setEditingContent(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter text content"
                  rows={6}
                />
              </div>
            ) : (
              <div>
                <Label>Select File or Enter URL *</Label>
                <div className="mt-2 space-y-4">
                  <Input
                    value={editingContent?.content || ''}
                    onChange={(e) => setEditingContent(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter file URL or select from uploaded files below"
                  />
                  
                  <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search files..."
                            value={fileSearchTerm}
                            onChange={(e) => setFileSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="video">Videos</SelectItem>
                          <SelectItem value="image">Images</SelectItem>
                          <SelectItem value="pdf">PDFs</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <p className="text-sm font-medium mb-2">Select from uploaded files:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {uploadedFiles
                        .filter(file => {
                          if (fileTypeFilter === 'all') return true;
                          return file.fileType === fileTypeFilter;
                        })
                        .filter(file => {
                          if (!fileSearchTerm) return true;
                          return file.originalName.toLowerCase().includes(fileSearchTerm.toLowerCase());
                        })
                        .map((file) => {
                          const fileUrl = `/api/content/admin/files/${file._id}/serve`;
                          const isSelected = editingContent?.content === fileUrl;
                          
                          return (
                            <div
                              key={file._id}
                              className={`p-2 border rounded cursor-pointer transition-colors ${
                                isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                              }`}
                              onClick={() => setEditingContent(prev => ({
                                ...prev,
                                content: fileUrl,
                                contentType: file.fileType === 'video' ? 'video' :
                                           file.fileType === 'image' ? 'image' :
                                           file.fileType === 'pdf' ? 'pdf' :
                                           file.fileType === 'audio' ? 'audio' : 'text'
                              }))}
                            >
                              <div className="flex items-center space-x-2">
                                {getFileIcon(file.fileType)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.originalName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)} • {file.fileType}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowContentDialog(false);
              setEditingContent(null);
              setSelectedModule(null);
            }}>
              Cancel
            </Button>
            <Button onClick={saveContent}>
              {editingContent?._id ? 'Update Content' : 'Add Content'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseCreationUI;
