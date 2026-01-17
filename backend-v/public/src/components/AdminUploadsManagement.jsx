import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Upload, 
  FileText, 
  Video, 
  Image, 
  File, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  FolderOpen,
  Plus,
  X
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const AdminUploadsManagement = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  
  // State management
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // File type icons mapping
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'video': return <Video className="h-5 w-5 text-red-500" />;
      case 'image': return <Image className="h-5 w-5 text-green-500" />;
      case 'pdf': return <FileText className="h-5 w-5 text-red-600" />;
      case 'document': return <File className="h-5 w-5 text-blue-500" />;
      default: return <File className="h-5 w-5 text-gray-500" />;
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

  // Load uploaded files
  const loadFiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        fileType: fileTypeFilter,
        search: searchTerm
      });

      const response = await fetch(`/api/content/admin/uploaded-files?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setFiles(result.data.files);
        setTotalPages(result.data.pagination.pages);
      } else {
        showToast(result.message || 'Error loading files', 'error');
      }
    } catch (error) {
      console.error('Error loading files:', error);
      showToast('Error loading files', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      showToast('File size must be less than 100MB', 'error');
      return;
    }

    // Validate file type
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|pdf|doc|docx|ppt|pptx/;
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.test(fileExtension)) {
      showToast('Invalid file type. Only images, videos, PDFs, and documents are allowed.', 'error');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/content/admin/upload-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('File uploaded successfully', 'success');
        loadFiles(); // Refresh the list
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        showToast(result.message || 'Error uploading file', 'error');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Error uploading file', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Handle file deletion
  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      const response = await fetch(`/api/content/admin/uploaded-files/${fileToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('File deleted successfully', 'success');
        loadFiles(); // Refresh the list
      } else {
        showToast(result.message || 'Error deleting file', 'error');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      showToast('Error deleting file', 'error');
    } finally {
      setShowDeleteDialog(false);
      setFileToDelete(null);
    }
  };

  // Handle file preview
  const handlePreviewFile = (file) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  // Load files on component mount and when filters change
  useEffect(() => {
    loadFiles();
  }, [currentPage, fileTypeFilter, searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [fileTypeFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Uploads</h1>
          <p className="text-muted-foreground">Manage uploaded files for course content</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.pdf,.doc,.docx,.ppt,.pptx"
          />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadFiles}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading files...</span>
        </div>
      ) : files.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No files uploaded</h3>
            <p className="text-muted-foreground text-center mb-4">
              Upload your first file to get started with course content creation
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Plus className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => (
            <Card key={file._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(file.fileType)}
                    <Badge variant="outline" className="text-xs">
                      {file.fileType}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreviewFile(file)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFileToDelete(file);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm truncate" title={file.originalName}>
                    {file.originalName}
                  </h3>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1">
                      Size: {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* File Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFile?.originalName}</DialogTitle>
            <DialogDescription>
              File Type: {selectedFile?.fileType} | Size: {selectedFile && formatFileSize(selectedFile.size)}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedFile && (
              <div className="space-y-4">
                {selectedFile.fileType === 'image' && (
                  <img
                    src={`/api/content/admin/files/${selectedFile._id}`}
                    alt={selectedFile.originalName}
                    className="max-w-full h-auto rounded-lg"
                  />
                )}
                {selectedFile.fileType === 'video' && (
                  <video
                    src={`/api/content/admin/files/${selectedFile._id}`}
                    controls
                    className="max-w-full h-auto rounded-lg"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
                {selectedFile.fileType === 'pdf' && (
                  <iframe
                    src={`/api/content/admin/files/${selectedFile._id}`}
                    className="w-full h-96 rounded-lg"
                    title={selectedFile.originalName}
                  />
                )}
                {(selectedFile.fileType === 'document') && (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <File className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Document preview not available</p>
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => window.open(`/api/course-management/files/${selectedFile._id}`, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download to View
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{fileToDelete?.originalName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              If this file is being used in any course content, the deletion will be prevented.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFile}>
              Delete File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUploadsManagement;
