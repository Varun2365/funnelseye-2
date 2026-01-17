import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Folder, 
  File, 
  Home, 
  ChevronRight,
  Search,
  X,
  Image,
  Video,
  FileText,
  Play,
  RefreshCw
} from 'lucide-react';

const FileExplorerDialog = ({ open, onOpenChange, onSelectFile, fileTypeFilter = null, title = "Select File" }) => {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('adminToken');
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load folder contents (for a specific folder)
  const loadFolderContents = async (folderId = 'root') => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/content/admin/folder/${folderId}/contents`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        // API returns folders and files for the current folder
        setFolders(result.data.folders || []);
        setFiles(result.data.files || []);
        console.log('Loaded folders:', result.data.folders?.length || 0, 'files:', result.data.files?.length || 0);
      } else {
        console.error('Error loading folder contents:', result.message);
      }
    } catch (error) {
      console.error('Error loading folder contents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get current folder contents
  const getCurrentFolderContents = () => {
    // API already returns only the contents of the current folder, so use them directly
    let folderContents = [...folders];
    let fileContents = [...files];

    // Apply file type filter if provided (only filter files, not folders)
    if (fileTypeFilter) {
      fileContents = fileContents.filter(file => {
        const fileType = file.fileType || (file.mimetype ? file.mimetype.split('/')[0] : null);
        return fileType === fileTypeFilter;
      });
    }

    // Apply search filter if search query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      folderContents = folderContents.filter(folder => 
        folder.name.toLowerCase().includes(query) ||
        (folder.description && folder.description.toLowerCase().includes(query))
      );
      
      fileContents = fileContents.filter(file => {
        const passesSearch = file.originalName.toLowerCase().includes(query) ||
          (file.filename && file.filename.toLowerCase().includes(query)) ||
          (file.mimetype && file.mimetype.toLowerCase().includes(query));
        
        return passesSearch;
      });
    }

    // Combine folders and files, sort by name
    const combinedItems = [
      ...folderContents.map(folder => ({ ...folder, type: 'folder' })),
      ...fileContents.map(file => ({ ...file, type: 'file' }))
    ];

    combinedItems.sort((a, b) => {
      const nameA = a.type === 'folder' ? a.name : a.originalName;
      const nameB = b.type === 'folder' ? b.name : b.originalName;
      return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
    });

    return { 
      folders: folderContents, 
      files: fileContents,
      allItems: combinedItems
    };
  };

  // Navigate to folder
  const navigateToFolder = (folder) => {
    const folderIndex = folderPath.findIndex(f => f._id === folder._id);
    
    if (folderIndex !== -1) {
      const newPath = folderPath.slice(0, folderIndex + 1);
      setFolderPath(newPath);
      setCurrentFolder(folder);
      // Load contents for this folder
      loadFolderContents(folder._id);
    } else {
      setCurrentFolder(folder);
      setFolderPath([...folderPath, folder]);
      // Load contents for this folder
      loadFolderContents(folder._id);
    }
    setSelectedFile(null);
  };

  // Navigate to root
  const navigateToRoot = () => {
    setCurrentFolder(null);
    setFolderPath([]);
    setSelectedFile(null);
    // Load root contents
    loadFolderContents('root');
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedFile && onSelectFile) {
      const fileUrl = `/api/content/admin/files/${selectedFile._id}/serve`;
      onSelectFile({
        file: selectedFile,
        url: fileUrl,
        fileId: selectedFile._id
      });
      onOpenChange(false);
      setSelectedFile(null);
      setSearchQuery('');
    }
  };

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      // Load root folder contents (like AdminUploadsManager)
      loadFolderContents('root');
      setCurrentFolder(null);
      setFolderPath([]);
      setSelectedFile(null);
      setSearchQuery('');
    }
  }, [open]);

  const { folders: currentFolders, files: currentFiles, allItems } = getCurrentFolderContents();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="flex flex-col p-6"
        style={{ width: '80vw', height: '80vh', maxWidth: 'none', maxHeight: 'none' }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Browse and select a file from your uploaded files
          </DialogDescription>
        </DialogHeader>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between border-b pb-3">
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
                    loadFolderContents(folder._id);
                  }}
                >
                  {folder.name}
                </Button>
              </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadFolderContents(currentFolder?._id || 'root')} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="relative py-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* File List - Table Layout */}
        <div className="flex-1 overflow-y-auto border rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : allItems.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {currentFolder ? `No files in "${currentFolder.name}"` : 'No files or folders'}
              </h3>
              <p className="text-muted-foreground">
                {fileTypeFilter ? `No ${fileTypeFilter} files found` : 'No files available'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg">
              {/* Table Header */}
              <div className="px-6 py-3 border-b bg-gray-50">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                  <div className="col-span-6">Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Modified</div>
                </div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y">
                {allItems.map((item) => (
                  <div 
                    key={`${item.type}-${item._id}`}
                    className={`px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      item.type === 'file' && selectedFile?._id === item._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => {
                      if (item.type === 'folder') {
                        navigateToFolder(item);
                      } else {
                        handleFileSelect(item);
                      }
                    }}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Name Column */}
                      <div className="col-span-6 flex items-center space-x-3">
                        {item.type === 'folder' ? (
                          <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        ) : (
                          (() => {
                            const fileType = item.fileType || item.mimetype?.split('/')[0];
                            switch (fileType) {
                              case 'image': return <Image className="h-5 w-5 text-green-500 flex-shrink-0" />;
                              case 'video': return <Video className="h-5 w-5 text-red-500 flex-shrink-0" />;
                              case 'pdf': return <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />;
                              case 'audio': return <Play className="h-5 w-5 text-blue-500 flex-shrink-0" />;
                              default: return <File className="h-5 w-5 text-gray-500 flex-shrink-0" />;
                            }
                          })()
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {item.type === 'folder' ? item.name : item.originalName}
                          </div>
                        </div>
                        {item.type === 'file' && selectedFile?._id === item._id && (
                          <Badge variant="default" className="bg-blue-600 ml-2">Selected</Badge>
                        )}
                      </div>
                      
                      {/* Type Column */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">
                          {item.type === 'folder' ? 'Folder' : (item.fileType || (item.mimetype ? item.mimetype.split('/')[1] : 'File'))}
                        </span>
                      </div>
                      
                      {/* Size Column */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">
                          {item.type === 'folder' ? formatFileSize(item.totalSize || 0) : formatFileSize(item.size)}
                        </span>
                      </div>
                      
                      {/* Modified Column */}
                      <div className="col-span-2">
                        <span className="text-sm text-gray-500">
                          {item.type === 'folder' 
                            ? new Date(item.createdAt).toLocaleDateString()
                            : new Date(item.uploadedAt).toLocaleDateString()
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => {
            onOpenChange(false);
            setSelectedFile(null);
            setSearchQuery('');
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedFile}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Select File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileExplorerDialog;

