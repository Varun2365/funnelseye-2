import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Plus,
  Save,
  Eye,
  Edit,
  Trash2,
  Clock,
  Star,
  BarChart3,
  Search,
  ArrowLeft,
  MoreVertical,
  Folder,
  FolderOpen,
  Image,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CourseOverview = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImageBrowser, setShowImageBrowser] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedFolders, setUploadedFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [newCourse, setNewCourse] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    difficulty: 'beginner',
    duration: '',
    thumbnail: null
  });

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/v1/courses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        const result = await response.json();
        
        if (result.success) {
          setCourses(Array.isArray(result.data) ? result.data : []);
        } else {
          toast.error(result.message || 'Error loading courses');
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Error loading courses');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCreateCourse = async () => {
    if (!newCourse.name || !newCourse.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/v1/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(newCourse)
      });

      const result = await response.json();
      
      if (result.success) {
        setCourses([result.data, ...(courses || [])]);
        setShowCreateDialog(false);
        setNewCourse({
          name: '',
          description: '',
          price: '',
          category: '',
          difficulty: 'beginner',
          duration: '',
          thumbnail: null
        });
        toast.success('Course created successfully!');
      } else {
        toast.error(result.message || 'Error creating course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Error creating course');
    }
  };

  const handleEditCourse = (courseId) => {
    navigate(`/course-creation/${courseId}`);
  };

  const handleDeleteCourse = (courseId) => {
    const course = courses.find(c => c._id === courseId);
    setCourseToDelete(course);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      const response = await fetch(`/api/admin/v1/courses/${courseToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setCourses((courses || []).filter(course => course._id !== courseToDelete._id));
        toast.success('Course deleted successfully!');
      } else {
        toast.error(result.message || 'Error deleting course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Error deleting course');
    } finally {
      setShowDeleteDialog(false);
      setCourseToDelete(null);
    }
  };

  // File browser functions
  const fetchUploadedFiles = async () => {
    try {
      const folderId = currentFolder ? currentFolder._id : 'root';
      const response = await fetch(`/api/content/admin/folder/${folderId}/contents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        // Filter only image files
        const imageFiles = result.data.files.filter(file => 
          file.mimetype && file.mimetype.startsWith('image/')
        );
        setUploadedFiles(imageFiles);
        setUploadedFolders(result.data.folders || []);
      }
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
      toast.error('Error loading files');
    }
  };

  const handleImageSelect = (file) => {
    const imageUrl = `/api/content/admin/files/${file._id}/serve`;
    setNewCourse({...newCourse, thumbnail: imageUrl});
    setShowImageBrowser(false);
    toast.success('Image selected successfully!');
  };

  const navigateToFolder = (folder) => {
    setCurrentFolder(folder);
    setFolderPath([...folderPath, folder]);
  };

  const navigateToRoot = () => {
    setCurrentFolder(null);
    setFolderPath([]);
  };

  const navigateBack = () => {
    if (folderPath.length > 0) {
      const newPath = folderPath.slice(0, -1);
      const newFolder = newPath.length > 0 ? newPath[newPath.length - 1] : null;
      setCurrentFolder(newFolder);
      setFolderPath(newPath);
    }
  };

  // Load files when image browser opens
  useEffect(() => {
    if (showImageBrowser) {
      fetchUploadedFiles();
    }
  }, [showImageBrowser, currentFolder]);

  const filteredCourses = (courses || []).filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getEnrollmentPercentage = (enrolled, total) => {
    return ((enrolled / total) * 100).toFixed(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-orange-100 text-orange-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Management (Total {(courses || []).length} courses)</h1>
          <p className="text-muted-foreground">Create and manage your courses</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create New Course</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCourses.map((course) => (
            <Card key={course._id} className="overflow-hidden hover:shadow-lg transition-shadow p-0 rounded-lg">
              <div className="relative">
                <img
                  src={course.thumbnail || `https://picsum.photos/320/180?random=${course._id}`}
                  alt={course.name || 'Untitled Course'}
                  className="w-full h-52 object-cover"
                  onError={(e) => {
                    const fallbackImages = [
                      `https://source.unsplash.com/320x180/?course,education&sig=${Math.random()}`,
                      `https://source.unsplash.com/320x180/?learning,study&sig=${Math.random()}`,
                      `https://source.unsplash.com/320x180/?book,library&sig=${Math.random()}`,
                      `https://via.placeholder.com/320x180/4F46E5/FFFFFF?text=${encodeURIComponent(course.name || 'Course')}`
                    ];
                    const currentSrc = e.target.src;
                    const currentIndex = fallbackImages.findIndex(img => img === currentSrc);
                    const nextIndex = (currentIndex + 1) % fallbackImages.length;
                    e.target.src = fallbackImages[nextIndex];
                  }}
                />
                <div className="absolute top-1 right-1 flex space-x-1">
                  <Badge className={`${getStatusColor(course.status || 'draft')} text-xs px-1 py-0`}>
                    {course.status || 'draft'}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-white/80 hover:bg-white">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(`/course-preview-standalone/${course._id}`, '_blank')}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteCourse(course._id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <CardHeader className="pb-4 px-4 pt-2">
                <CardTitle className="text-sm leading-tight">{course.name || 'Untitled Course'}</CardTitle>
                <CardDescription className="text-xs text-gray-500 leading-tight">
                  {course.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-4 pb-4 pt-0">
                {/* Price */}
                <div className="flex flex-col space-y-1 mb-3">
                  {course.originalPrice && course.originalPrice > course.price && (
                    <div className="text-xs text-gray-500 line-through">
                      ₹{course.originalPrice || 0}
                    </div>
                  )}
                  <div className="text-lg font-bold text-green-600">
                    ₹{course.price || 0}
                  </div>
                </div>

                {/* Modules */}
                <div className="text-xs text-muted-foreground mb-3">
                  {course.modules || 0} modules
                </div>
                
                {/* Actions */}
                <div className="flex space-x-1 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCourse(course._id)}
                    className="flex-1 text-xs h-7"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Create Course Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Fill in the basic details to create your new course
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Course Name *</Label>
                <Input
                  id="name"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                  placeholder="Enter course name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                  placeholder="e.g., Programming, Marketing"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                placeholder="Describe what students will learn"
                rows={3}
              />
            </div>
            
            {/* Thumbnail Preview */}
            <div className="space-y-2">
              <Label>Course Thumbnail</Label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-4">
                  <img
                    src={newCourse.thumbnail || `https://picsum.photos/120/80?random=${Date.now()}`}
                    alt="Course thumbnail preview"
                    className="w-30 h-20 object-cover rounded"
                    onError={(e) => {
                      e.target.src = `https://source.unsplash.com/120x80/?course,education&sig=${Math.random()}`;
                    }}
                  />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">
                      {newCourse.thumbnail ? 'Custom image selected' : 'Random placeholder image will be used'}
                    </p>
                    <p className="text-xs">
                      {newCourse.thumbnail ? 'Custom thumbnail selected' : 'You can select a custom image from your uploads'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImageBrowser(true)}
                  className="mt-2"
                >
                  <Image className="h-4 w-4 mr-2" />
                  {newCourse.thumbnail ? 'Change Image' : 'Select Image'}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({...newCourse, price: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (₹)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={newCourse.originalPrice}
                  onChange={(e) => setNewCourse({...newCourse, originalPrice: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={newCourse.difficulty} onValueChange={(value) => setNewCourse({...newCourse, difficulty: value})}>
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
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                  placeholder="e.g., 40 hours"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCourse}>
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              <span>Delete Course</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{courseToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Alert>
              <AlertDescription>
                This will permanently delete the course and all its modules and lessons. This action cannot be undone.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setCourseToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteCourse}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Browser Dialog */}
      <Dialog open={showImageBrowser} onOpenChange={setShowImageBrowser}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Image className="h-5 w-5" />
              <span>Select Course Thumbnail</span>
            </DialogTitle>
            <DialogDescription>
              Choose an image from your uploaded files to use as the course thumbnail.
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

            {/* Folders and Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {/* Folders */}
              {uploadedFolders.map((folder) => (
                <div
                  key={folder._id}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer bg-blue-50 hover:bg-blue-100"
                  onClick={() => navigateToFolder(folder)}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <FolderOpen className="h-8 w-8 text-blue-600" />
                    <p className="text-xs text-gray-700 text-center truncate w-full" title={folder.name}>
                      {folder.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {folder.fileCount || 0} files
                    </p>
                  </div>
                </div>
              ))}

              {/* Images */}
              {uploadedFiles.map((file) => (
                <div
                  key={file._id}
                  className="border rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleImageSelect(file)}
                >
                  <img
                    src={`/api/content/admin/files/${file._id}/serve`}
                    alt={file.originalName}
                    className="w-full h-24 object-cover rounded"
                  />
                  <p className="text-xs text-gray-600 mt-1 truncate" title={file.originalName}>
                    {file.originalName}
                  </p>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {uploadedFolders.length === 0 && uploadedFiles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No Images Available</p>
                <p className="text-sm">This folder is empty or contains no images</p>
              </div>
            )}

            {/* No Images but Folders Available */}
            {uploadedFolders.length > 0 && uploadedFiles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No Images Available</p>
                <p className="text-sm">Browse through folders to find images</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageBrowser(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseOverview;
