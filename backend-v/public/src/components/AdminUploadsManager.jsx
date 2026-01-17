import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Folder, 
  File, 
  Upload, 
  FolderPlus, 
  Search, 
  Grid, 
  List, 
  MoreVertical, 
  Download, 
  Trash2, 
  Edit, 
  Move, 
  Home, 
  ChevronRight, 
  RefreshCw,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const AdminUploadsManager = () => {
  // State management
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCancelToken, setUploadCancelToken] = useState(null);
  const [showUploadProgress, setShowUploadProgress] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Dialog states
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState([]);
  const [availableFolders, setAvailableFolders] = useState([]);

  // Form states
  const [newFolder, setNewFolder] = useState({ name: '', description: '' });
  const [editingItem, setEditingItem] = useState(null);

  // Refs
  const fileInputRef = useRef(null);

  // Toast notification function
  const showToast = (message, type = 'info') => {
    // Simple toast implementation - you can replace with your toast library
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file preview
  const handleFilePreview = (file) => {
    const fileType = file.mimetype || file.fileType;
    
    // Check if file is image or video
    if (fileType.startsWith('image/') || fileType.startsWith('video/')) {
      setPreviewFile(file);
      setShowPreviewDialog(true);
    } else {
      // For other file types, open in new tab
      window.open(`/api/content/admin/files/${file._id}/serve`, '_blank');
    }
  };

  // Load folder structure
  const loadFolderStructure = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content/admin/folder-structure', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setFolders(result.data.folders || []);
        setFiles(result.data.files || []);
      } else {
        showToast(result.message || 'Error loading folder structure', 'error');
      }
    } catch (error) {
      console.error('Error loading folder structure:', error);
      showToast('Error loading folder structure', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load contents of a specific folder
  const loadFolderContents = async (folderId = 'root') => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/content/admin/folder/${folderId}/contents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setFolders(result.data.folders || []);
        setFiles(result.data.files || []);
      } else {
        showToast(result.message || 'Error loading folder contents', 'error');
      }
    } catch (error) {
      showToast('Error loading folder contents', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get current folder contents with pagination
  const getCurrentFolderContents = () => {
    const currentFolderId = currentFolder?._id;
    
    let folderContents = folders.filter(folder => {
      const matches = folder.parentFolder === currentFolderId || 
        (currentFolderId === null && folder.parentFolder === null);
      return matches;
    });

    let fileContents = files.filter(file => {
      const matches = file.folderId === currentFolderId || 
        (currentFolderId === null && !file.folderId);
      return matches;
    });

    // Apply search filter if search query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      // Global search - search through ALL folders and files
      folderContents = folders.filter(folder => 
        folder.name.toLowerCase().includes(query) ||
        (folder.description && folder.description.toLowerCase().includes(query))
      );
      
      fileContents = files.filter(file => 
        file.originalName.toLowerCase().includes(query) ||
        (file.filename && file.filename.toLowerCase().includes(query)) ||
        (file.mimetype && file.mimetype.toLowerCase().includes(query))
      );
    }

    // Combine folders and files for pagination
    const combinedItems = [
      ...folderContents.map(folder => ({ ...folder, type: 'folder' })),
      ...fileContents.map(file => ({ ...file, type: 'file' }))
    ];

    // Sort by name
    combinedItems.sort((a, b) => {
      const nameA = a.type === 'folder' ? a.name : a.originalName;
      const nameB = b.type === 'folder' ? b.name : b.originalName;
      return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
    });

    // Calculate pagination
    const totalItems = combinedItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = combinedItems.slice(startIndex, endIndex);

    return { 
      folders: folderContents, 
      files: fileContents, 
      allItems: paginatedItems,
      totalItems,
      totalPages,
      currentPage
    };
  };

  // Handle file upload

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Prevent file uploads to root folder
    if (!currentFolder) {
      showToast('Files must be uploaded inside folders. Please navigate to a folder first.', 'error');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      setUploading(true);
      setShowUploadProgress(true);
      setUploadProgress(0);

      setUploadProgress(10);

      const formData = new FormData();
      formData.append('file', file);
      
      // Add folderId if we're in a folder
      if (currentFolder?._id) {
        formData.append('folderId', currentFolder._id);
      }

      // Create abort controller for cancellation
      const abortController = new AbortController();
      setUploadCancelToken(abortController);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await fetch('/api/content/admin/upload-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData,
        signal: abortController.signal
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();
      
      if (result.success) {
        showToast('File uploaded successfully', 'success');
        // Force refresh the structure
        await loadFolderContents(currentFolder?._id || 'root');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        showToast(result.message || 'Error uploading file', 'error');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        showToast('Upload cancelled', 'info');
      } else {
        showToast('Error uploading file', 'error');
      }
    } finally {
      setUploading(false);
      setShowUploadProgress(false);
      setUploadProgress(0);
      setUploadCancelToken(null);
    }
  };

  // Cancel upload
  const cancelUpload = () => {
    if (uploadCancelToken) {
      uploadCancelToken.abort();
    }
  };

  // Create folder
  const handleCreateFolder = async () => {
    if (!newFolder.name.trim()) {
      showToast('Please enter folder name', 'error');
      return;
    }

    try {
      const response = await fetch('/api/content/admin/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...newFolder,
          parentFolder: currentFolder?._id || null
        })
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('Folder created successfully', 'success');
        setShowCreateFolder(false);
        setNewFolder({ name: '', description: '' });
        // Force refresh the folder structure
        await loadFolderStructure();
      } else {
        showToast(result.message || 'Error creating folder', 'error');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      showToast('Error creating folder', 'error');
    }
  };

  // Delete items
  const handleDeleteItems = async () => {
    try {
      for (const item of itemsToDelete) {
        const url = item.type === 'folder' 
          ? `/api/content/admin/folders/${item.id}`
          : `/api/content/admin/uploaded-files/${item.id}`;
        
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        const result = await response.json();
        if (!result.success) {
          showToast(`Error deleting ${item.type}: ${result.message}`, 'error');
          return;
        }
      }

      showToast('Items deleted successfully', 'success');
      setShowDeleteDialog(false);
      setItemsToDelete([]);
      setSelectedItems([]);
      // Refresh current folder contents instead of loading all structure
      await loadFolderContents(currentFolder?._id || 'root');
    } catch (error) {
      showToast('Error deleting items', 'error');
    }
  };

  // Move items
  const handleMoveItems = async (targetFolderId) => {
    try {
      for (const item of selectedItems) {
        const [type, id] = item.split('-');
        
        if (type === 'file') {
          const response = await fetch(`/api/content/admin/files/${id}/move`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ folderId: targetFolderId })
          });

          const result = await response.json();
      console.log('Upload response result:', result);
          if (!result.success) {
            showToast(`Error moving file: ${result.message}`, 'error');
            return;
          }
        }
      }

      showToast('Items moved successfully', 'success');
      setShowMoveDialog(false);
      setSelectedItems([]);
      // Refresh current folder contents instead of loading all structure
      await loadFolderContents(currentFolder?._id || 'root');
    } catch (error) {
      showToast('Error moving items', 'error');
    }
  };

  // Load available folders for move operation
  const loadAvailableFolders = async () => {
    try {
      const response = await fetch('/api/content/admin/folders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const result = await response.json();
      console.log('Upload response result:', result);
      if (result.success) {
        setAvailableFolders(result.data);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  // Navigation functions
  const navigateToFolder = (folder) => {
    // Check if folder is already in the path to prevent duplication
    const folderIndex = folderPath.findIndex(f => f._id === folder._id);
    
    if (folderIndex !== -1) {
      // Folder already in path, navigate to that level
      const newPath = folderPath.slice(0, folderIndex + 1);
      setFolderPath(newPath);
      setCurrentFolder(folder);
      // Load contents for this folder
      loadFolderContents(folder._id);
    } else {
      // New folder, add to path
      setCurrentFolder(folder);
      setFolderPath([...folderPath, folder]);
      // Load contents for this folder
      loadFolderContents(folder._id);
    }
    
    setSelectedItems([]);
    setCurrentPage(1); // Reset pagination
  };

  const navigateToRoot = () => {
    setCurrentFolder(null);
    setFolderPath([]);
    setSelectedItems([]);
    setCurrentPage(1); // Reset pagination
    // Load root contents
    loadFolderContents('root');
  };

  // Selection functions
  const toggleSelection = (itemId, type) => {
    const itemKey = `${type}-${itemId}`;
    setSelectedItems(prev => 
      prev.includes(itemKey) 
        ? prev.filter(id => id !== itemKey)
        : [...prev, itemKey]
    );
  };

  const selectAll = () => {
    const { folders: currentFolders, files: currentFiles, allItems: paginatedItems, totalItems, totalPages } = getCurrentFolderContents();
    const allItems = [
      ...currentFolders.map(f => `folder-${f._id}`),
      ...currentFiles.map(f => `file-${f._id}`)
    ];
    setSelectedItems(allItems);
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Load data on component mount
  useEffect(() => {
    loadFolderContents('root');
  }, []);

  // Load available folders when move dialog opens
  useEffect(() => {
    if (showMoveDialog) {
      loadAvailableFolders();
    }
  }, [showMoveDialog]);

  // Force re-render when currentFolder changes
  useEffect(() => {
    // Folder change handled by navigation functions
  }, [currentFolder]);

  const { folders: currentFolders, files: currentFiles, allItems: paginatedItems, totalItems, totalPages } = getCurrentFolderContents();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={navigateToRoot}>
              <Home className="h-4 w-4" />
            </Button>
            {folderPath.map((folder, index) => (
              <div key={folder._id} className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    const newPath = folderPath.slice(0, index + 1);
                    setFolderPath(newPath);
                    setCurrentFolder(folder);
                    setSelectedItems([]);
                    setCurrentPage(1); // Reset pagination
                    // Load contents for this folder
                    loadFolderContents(folder._id);
                  }}
                >
                  {folder.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {currentFolder && (
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          )}
          {!currentFolder && (
            <Button onClick={() => setShowCreateFolder(true)}>
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          )}
          <Button variant="outline" onClick={() => loadFolderContents(currentFolder?._id || 'root')} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset pagination when searching
              }}
              className="pl-10 pr-10 w-64"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {searchQuery && (
            <span className="text-sm text-blue-600 font-medium">
              Search results for "{searchQuery}"
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {totalItems} {searchQuery ? 'results' : 'items'}
          </span>
        </div>
      </div>

      {/* Selection Controls */}
      {selectedItems.length > 0 && (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">
            {selectedItems.length} item(s) selected
          </span>
          <Button size="sm" variant="outline" onClick={clearSelection}>
            Clear
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowMoveDialog(true)}>
            <Move className="h-4 w-4 mr-1" />
            Move
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading...</span>
        </div>
      ) : (paginatedItems.length === 0 && folders.length === 0 && files.length === 0) ? (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {currentFolder ? `No files in "${currentFolder.name}"` : 'No files or folders'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {currentFolder ? 'Upload files to this folder' : 'Create folders first, then upload files inside them'}
          </p>
          <div className="flex justify-center space-x-2">
            {currentFolder && (
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            )}
            {!currentFolder && (
              <Button variant="outline" onClick={() => setShowCreateFolder(true)}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Folder
              </Button>
            )}
          </div>
        </div>
      ) : (paginatedItems.length === 0 && searchQuery) ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            No results found for "{searchQuery}"
          </h3>
          <p className="text-muted-foreground mb-4">
            Try a different search term or clear the search to see all items
          </p>
          <Button variant="outline" onClick={() => {
            setSearchQuery('');
            setCurrentPage(1);
          }}>
            <X className="w-4 h-4 mr-2" />
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          {/* Table Header */}
          <div className="px-6 py-3 border-b bg-gray-50">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-1">Modified</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y">
            {(paginatedItems.length > 0 ? paginatedItems : [
              ...folders.map(folder => ({ ...folder, type: 'folder' })),
              ...files.map(file => ({ ...file, type: 'file' }))
            ]).map((item) => (
              <div 
                key={`${item.type}-${item._id}`}
                className={`px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedItems.includes(`${item.type}-${item._id}`) ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  if (item.type === 'folder') {
                    navigateToFolder(item);
                  } else {
                    handleFilePreview(item);
                  }
                }}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Name Column */}
                  <div className="col-span-6 flex items-center space-x-3">
                    {item.type === 'folder' ? (
                      <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    ) : (
                      <File className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {item.type === 'folder' ? item.name : item.originalName}
                      </div>
                    </div>
                  </div>
                  
                  {/* Type Column */}
                  <div className="col-span-2">
                    <span className="text-sm text-gray-500">
                      {item.type === 'folder' ? 'Folder' : item.fileType}
                    </span>
                  </div>
                  
                  {/* Size Column */}
                  <div className="col-span-2">
                    <span className="text-sm text-gray-500">
                      {item.type === 'folder' ? formatFileSize(item.totalSize || 0) : formatFileSize(item.size)}
                    </span>
                  </div>
                  
                  {/* Modified Column */}
                  <div className="col-span-1">
                    <span className="text-sm text-gray-500">
                      {item.type === 'folder' 
                        ? new Date(item.createdAt).toLocaleDateString()
                        : new Date(item.uploadedAt).toLocaleDateString()
                      }
                    </span>
                  </div>
                  
                  {/* Actions Column */}
                  <div className="col-span-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(item._id, item.type);
                        }}>
                          {selectedItems.includes(`${item.type}-${item._id}`) ? 'Deselect' : 'Select'}
                        </DropdownMenuItem>
                        {item.type === 'file' && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/api/content/admin/files/${item._id}/serve`, '_blank');
                          }}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setItemsToDelete([{ id: item._id, type: item.type, name: item.type === 'folder' ? item.name : item.originalName }]);
                          setShowDeleteDialog(true);
                        }}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        accept=".pdf,.mp4,.avi,.mov,.jpg,.jpeg,.png,.gif,.doc,.docx,.ppt,.pptx"
      />

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your files.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Folder Name</label>
              <Input
                value={newFolder.name}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                placeholder="Enter folder name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Textarea
                value={newFolder.description}
                onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                placeholder="Enter folder description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Items</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete these items? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {itemsToDelete.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Badge variant="outline">{item.type}</Badge>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItems}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Items</DialogTitle>
            <DialogDescription>
              Select a destination folder for the selected items.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleMoveItems(null)}
            >
              <Home className="h-4 w-4 mr-2" />
              Root Folder
            </Button>
            {availableFolders.map((folder) => (
              <Button
                key={folder._id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleMoveItems(folder._id)}
              >
                <Folder className="h-4 w-4 mr-2" />
                {folder.name}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Progress Dialog */}
      <Dialog open={showUploadProgress} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Uploading File</DialogTitle>
            <DialogDescription>
              Please wait while your file is being uploaded...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{uploadProgress.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={cancelUpload}
                disabled={!uploadCancelToken}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center space-x-2">
              {previewFile?.type === 'folder' ? (
                <Folder className="h-5 w-5 text-blue-500" />
              ) : (
                <File className="h-5 w-5 text-green-500" />
              )}
              <span>{previewFile?.originalName || previewFile?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 pt-4">
            {previewFile && (
              <div className="flex flex-col items-center space-y-4">
                {/* Image Preview */}
                {previewFile.mimetype?.startsWith('image/') && (
                  <div className="w-full flex justify-center">
                    <img
                      src={`/api/content/admin/files/${previewFile._id}/serve`}
                      alt={previewFile.originalName}
                      className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden text-center text-gray-500">
                      <File className="h-12 w-12 mx-auto mb-2" />
                      <p>Unable to load image preview</p>
                    </div>
                  </div>
                )}
                
                {/* Video Preview */}
                {previewFile.mimetype?.startsWith('video/') && (
                  <div className="w-full flex justify-center">
                    <video
                      src={`/api/content/admin/files/${previewFile._id}/serve`}
                      controls
                      className="max-w-full max-h-[60vh] rounded-lg shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="hidden text-center text-gray-500">
                      <File className="h-12 w-12 mx-auto mb-2" />
                      <p>Unable to load video preview</p>
                    </div>
                  </div>
                )}
                
                {/* File Info */}
                <div className="w-full bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">File Name:</span>
                      <p className="text-gray-600">{previewFile.originalName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">File Size:</span>
                      <p className="text-gray-600">{formatFileSize(previewFile.size)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">File Type:</span>
                      <p className="text-gray-600">{previewFile.mimetype || previewFile.fileType}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Uploaded:</span>
                      <p className="text-gray-600">{new Date(previewFile.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    onClick={() => window.open(`/api/content/admin/files/${previewFile._id}/serve`, '_blank')}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `/api/content/admin/files/${previewFile._id}/serve`;
                      link.download = previewFile.originalName;
                      link.click();
                    }}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUploadsManager;