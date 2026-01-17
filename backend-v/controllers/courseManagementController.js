const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { Course, CourseModule, CourseContent, AdminUpload, CoachCourseAssignment } = require('../schema/courseManagementSchemas');
const CourseFolder = require('../schema/courseFolderSchema');
const AdminUser = require('../schema/AdminUser');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../admin-uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|pdf|doc|docx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, PDFs, and documents are allowed.'));
    }
  }
});

class CourseManagementController {
  // File Upload Management
  async uploadFile(req, res) {
    try {
      const uploadMiddleware = upload.single('file');
      
      uploadMiddleware(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'No file uploaded'
          });
        }

        const fileData = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          uploadedBy: req.admin._id,
          uploadedAt: new Date(),
          fileType: req.file.mimetype.startsWith('video/') ? 'video' : 
                   req.file.mimetype.startsWith('image/') ? 'image' : 
                   req.file.mimetype === 'application/pdf' ? 'pdf' : 'document',
          folderId: req.body.folderId || null
        };

        const adminUpload = new AdminUpload(fileData);
        await adminUpload.save();

        console.log('File saved successfully:', {
          id: adminUpload._id,
          filename: adminUpload.filename,
          originalName: adminUpload.originalName,
          folderId: adminUpload.folderId,
          uploadedBy: adminUpload.uploadedBy
        });

        res.json({
          success: true,
          message: 'File uploaded successfully',
          data: {
            id: adminUpload._id,
            filename: adminUpload.filename,
            originalName: adminUpload.originalName,
            fileType: adminUpload.fileType,
            size: adminUpload.size,
            uploadedAt: adminUpload.uploadedAt
          }
        });
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading file'
      });
    }
  }

  async getUploadedFiles(req, res) {
    try {
      const { page = 1, limit = 20, fileType, search } = req.query;
      const skip = (page - 1) * limit;

      let query = {};
      if (fileType && fileType !== 'all') {
        query.fileType = fileType;
      }
      if (search) {
        query.originalName = { $regex: search, $options: 'i' };
      }

      const files = await AdminUpload.find(query)
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('uploadedBy', 'firstName lastName email');

      const total = await AdminUpload.countDocuments(query);

      res.json({
        success: true,
        data: {
          files,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching uploaded files'
      });
    }
  }

  async deleteUploadedFile(req, res) {
    try {
      const { fileId } = req.params;
      
      const file = await AdminUpload.findById(fileId);
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Check if file is being used in any course content
      const usedInCourses = await CourseContent.find({ 
        $or: [
          { fileId: fileId },
          { youtubeEmbed: { $exists: true } }
        ]
      });

      if (usedInCourses.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete file as it is being used in course content'
        });
      }

      // Delete physical file
      try {
        await fs.unlink(file.path);
      } catch (fsError) {
        console.warn('Physical file not found:', file.path);
      }

      // Delete database record
      await AdminUpload.findByIdAndDelete(fileId);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting file'
      });
    }
  }


  async updateCourse(req, res) {
    try {
      const { courseId } = req.params;
      const updateData = req.body;
      updateData.updatedAt = new Date();

      const course = await Course.findByIdAndUpdate(
        courseId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({
        success: true,
        message: 'Course updated successfully',
        data: course
      });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating course'
      });
    }
  }

  async getCourses(req, res) {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
      const skip = (page - 1) * limit;

      let query = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      const courses = await Course.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'firstName lastName email')
        .populate({
          path: 'modules',
          populate: {
            path: 'contents',
            model: 'CourseContent'
          }
        });

      const total = await Course.countDocuments(query);

      res.json({
        success: true,
        data: {
          courses,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching courses'
      });
    }
  }

  async getCourseById(req, res) {
    try {
      const { courseId } = req.params;
      console.log('Fetching course by ID:', courseId);

      const course = await Course.findById(courseId)
        .populate('createdBy', 'firstName lastName email')
        .populate({
          path: 'modules',
          options: { sort: { order: 1 } },
          populate: {
            path: 'contents',
            model: 'CourseContent',
            options: { sort: { order: 1 } }
          }
        });

      console.log('Course found:', course ? 'Yes' : 'No');
      if (course) {
        console.log('Course modules count:', course.modules ? course.modules.length : 0);
        if (course.modules && course.modules.length > 0) {
          console.log('First module contents count:', course.modules[0].contents ? course.modules[0].contents.length : 0);
        }
      }

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching course'
      });
    }
  }

  async deleteCourse(req, res) {
    try {
      const { courseId } = req.params;

      // Check if course is assigned to any coaches
      const assignments = await CoachCourseAssignment.find({ courseId });
      if (assignments.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete course as it is assigned to coaches'
        });
      }

      const course = await Course.findByIdAndDelete(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting course'
      });
    }
  }

  // Module Management
  async addModule(req, res) {
    try {
      const { courseId } = req.params;
      const { name, description, order } = req.body;

      const moduleData = {
        name,
        description,
        order: order || 0,
        courseId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const module = new CourseModule(moduleData);
      await module.save();

      // Add module to course
      await Course.findByIdAndUpdate(courseId, {
        $push: { modules: module._id },
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Module added successfully',
        data: module
      });
    } catch (error) {
      console.error('Error adding module:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding module'
      });
    }
  }


  async deleteModule(req, res) {
    try {
      const { moduleId } = req.params;

      const module = await CourseModule.findByIdAndDelete(moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      // Remove module from course
      await Course.findByIdAndUpdate(module.courseId, {
        $pull: { modules: moduleId },
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Module deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting module:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting module'
      });
    }
  }

  // Content Management
  async addContent(req, res) {
    try {
      const { moduleId } = req.params;
      const { title, description, contentType, fileId, youtubeEmbed, order } = req.body;

      const contentData = {
        title,
        description,
        contentType, // 'file' or 'youtube'
        fileId: contentType === 'file' ? fileId : null,
        youtubeEmbed: contentType === 'youtube' ? youtubeEmbed : null,
        order: order || 0,
        moduleId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const content = new CourseContent(contentData);
      await content.save();

      // Add content to module
      await CourseModule.findByIdAndUpdate(moduleId, {
        $push: { contents: content._id },
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Content added successfully',
        data: content
      });
    } catch (error) {
      console.error('Error adding content:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding content'
      });
    }
  }

  async updateContent(req, res) {
    try {
      const { contentId } = req.params;
      const updateData = req.body;
      updateData.updatedAt = new Date();

      const content = await CourseContent.findByIdAndUpdate(
        contentId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      res.json({
        success: true,
        message: 'Content updated successfully',
        data: content
      });
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating content'
      });
    }
  }

  async deleteContent(req, res) {
    try {
      const { contentId } = req.params;

      const content = await CourseContent.findByIdAndDelete(contentId);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      // Remove content from module
      await CourseModule.findByIdAndUpdate(content.moduleId, {
        $pull: { contents: contentId },
        updatedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Content deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting content'
      });
    }
  }

  // Course Assignment to Coaches
  async assignCourseToCoach(req, res) {
    try {
      const { courseId, coachId, permissions } = req.body;

      const assignmentData = {
        courseId,
        coachId,
        permissions: permissions || {
          canModify: false,
          canSell: true,
          canView: true
        },
        assignedBy: req.admin._id,
        assignedAt: new Date(),
        status: 'active'
      };

      const assignment = new CoachCourseAssignment(assignmentData);
      await assignment.save();

      res.json({
        success: true,
        message: 'Course assigned to coach successfully',
        data: assignment
      });
    } catch (error) {
      console.error('Error assigning course:', error);
      res.status(500).json({
        success: false,
        message: 'Error assigning course'
      });
    }
  }

  async getCoachAssignments(req, res) {
    try {
      const { coachId } = req.params;

      const assignments = await CoachCourseAssignment.find({ coachId })
        .populate('courseId', 'name description thumbnail')
        .populate('assignedBy', 'firstName lastName email');

      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      console.error('Error fetching coach assignments:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching coach assignments'
      });
    }
  }

  async updateAssignmentPermissions(req, res) {
    try {
      const { assignmentId } = req.params;
      const { permissions } = req.body;

      const assignment = await CoachCourseAssignment.findByIdAndUpdate(
        assignmentId,
        { permissions, updatedAt: new Date() },
        { new: true }
      );

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }

      res.json({
        success: true,
        message: 'Assignment permissions updated successfully',
        data: assignment
      });
    } catch (error) {
      console.error('Error updating assignment:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating assignment'
      });
    }
  }

  // Folder Management
  async createFolder(req, res) {
    try {
      const { name, description, parentFolder } = req.body;

      // Generate folder path
      let path = name;
      if (parentFolder) {
        const parent = await CourseFolder.findById(parentFolder);
        if (!parent) {
          return res.status(404).json({
            success: false,
            message: 'Parent folder not found'
          });
        }
        path = `${parent.path}/${name}`;
      }

      const folderData = {
        name,
        description,
        parentFolder: parentFolder || null,
        path,
        createdBy: req.admin._id
      };

      const folder = new CourseFolder(folderData);
      await folder.save();

      res.json({
        success: true,
        message: 'Folder created successfully',
        data: folder
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating folder'
      });
    }
  }

  async getFolders(req, res) {
    try {
      const { parentFolder } = req.query;
      
      let query = {};
      if (parentFolder === 'null' || parentFolder === null) {
        query.parentFolder = null;
      } else if (parentFolder) {
        query.parentFolder = parentFolder;
      }

      const folders = await CourseFolder.find(query)
        .sort({ name: 1 })
        .populate('createdBy', 'firstName lastName email');

      res.json({
        success: true,
        data: folders
      });
    } catch (error) {
      console.error('Error fetching folders:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching folders'
      });
    }
  }

  async updateFolder(req, res) {
    try {
      const { folderId } = req.params;
      const { name, description } = req.body;

      const folder = await CourseFolder.findByIdAndUpdate(
        folderId,
        { name, description, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!folder) {
        return res.status(404).json({
          success: false,
          message: 'Folder not found'
        });
      }

      res.json({
        success: true,
        message: 'Folder updated successfully',
        data: folder
      });
    } catch (error) {
      console.error('Error updating folder:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating folder'
      });
    }
  }

  async deleteFolder(req, res) {
    try {
      const { folderId } = req.params;

      // Check if folder has files or subfolders
      const hasFiles = await AdminUpload.findOne({ folderId });
      const hasSubfolders = await CourseFolder.findOne({ parentFolder: folderId });

      if (hasFiles || hasSubfolders) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete folder with files or subfolders'
        });
      }

      const folder = await CourseFolder.findByIdAndDelete(folderId);
      if (!folder) {
        return res.status(404).json({
          success: false,
          message: 'Folder not found'
        });
      }

      res.json({
        success: true,
        message: 'Folder deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting folder'
      });
    }
  }

  async moveFile(req, res) {
    try {
      const { fileId } = req.params;
      const { folderId } = req.body;

      const file = await AdminUpload.findByIdAndUpdate(
        fileId,
        { folderId: folderId || null },
        { new: true }
      );

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        message: 'File moved successfully',
        data: file
      });
    } catch (error) {
      console.error('Error moving file:', error);
      res.status(500).json({
        success: false,
        message: 'Error moving file'
      });
    }
  }

  async getFolderStructure(req, res) {
    try {
      console.log('Getting folder structure for admin:', req.admin._id);
      
      const folders = await CourseFolder.find()
        .sort({ path: 1 })
        .populate('createdBy', 'firstName lastName email');

      console.log('Found folders:', folders.length);

      const files = await AdminUpload.find()
        .populate('folderId', 'name path')
        .populate('uploadedBy', 'firstName lastName email')
        .sort({ uploadedAt: -1 });

      console.log('Found files:', files.length);

      // Calculate folder sizes by summing up all files within each folder
      const foldersWithSizes = await Promise.all(folders.map(async (folder) => {
        const folderFiles = await AdminUpload.find({ folderId: folder._id });
        const totalSize = folderFiles.reduce((sum, file) => sum + (file.size || 0), 0);
        
        return {
          ...folder.toObject(),
          totalSize: totalSize,
          fileCount: folderFiles.length
        };
      }));

      console.log('Folders with sizes calculated:', foldersWithSizes.length);

      res.json({
        success: true,
        data: {
          folders: foldersWithSizes,
          files
        }
      });
    } catch (error) {
      console.error('Error fetching folder structure:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching folder structure'
      });
    }
  }

  // Get contents of a specific folder
  async getFolderContents(req, res) {
    try {
      const { folderId } = req.params;
      const adminId = req.admin._id;

      console.log('Getting contents for folder:', folderId, 'by admin:', adminId);

      // If folderId is 'root' or null, get root level contents
      let folderQuery = null;
      let fileQuery = {};

      if (folderId && folderId !== 'root') {
        folderQuery = { parentFolder: folderId };
        fileQuery = { folderId: folderId };
      } else {
        folderQuery = { parentFolder: null };
        fileQuery = { folderId: null };
      }

      // Get subfolders
      const folders = await CourseFolder.find(folderQuery)
        .sort({ name: 1 })
        .populate('createdBy', 'firstName lastName email');

      // Get files in this folder
      const files = await AdminUpload.find(fileQuery)
        .populate('uploadedBy', 'firstName lastName email')
        .sort({ uploadedAt: -1 });

      // Calculate folder sizes for subfolders
      const foldersWithSizes = await Promise.all(folders.map(async (folder) => {
        const folderFiles = await AdminUpload.find({ folderId: folder._id });
        const totalSize = folderFiles.reduce((sum, file) => sum + (file.size || 0), 0);
        
        return {
          ...folder.toObject(),
          totalSize: totalSize,
          fileCount: folderFiles.length
        };
      }));

      // Get folder info if not root
      let folderInfo = null;
      if (folderId && folderId !== 'root') {
        folderInfo = await CourseFolder.findById(folderId)
          .populate('createdBy', 'firstName lastName email');
        
        // Calculate size for current folder
        const currentFolderFiles = await AdminUpload.find({ folderId: folderId });
        const currentFolderSize = currentFolderFiles.reduce((sum, file) => sum + (file.size || 0), 0);
        
        folderInfo = {
          ...folderInfo.toObject(),
          totalSize: currentFolderSize,
          fileCount: currentFolderFiles.length
        };
      }

      console.log(`Found ${foldersWithSizes.length} folders and ${files.length} files in folder:`, folderId || 'root');

      res.json({
        success: true,
        message: 'Folder contents retrieved successfully',
        data: {
          folder: folderInfo,
          folders: foldersWithSizes,
          files,
          isRoot: !folderId || folderId === 'root'
        }
      });
    } catch (error) {
      console.error('Error getting folder contents:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting folder contents'
      });
    }
  }

  // Serve uploaded files
  async serveFile(req, res) {
    try {
      const { fileId } = req.params;
      console.log('Serving file with ID:', fileId);
      
      // Basic validation for MongoDB ObjectId
      if (!fileId || fileId.length !== 24) {
        console.log('Invalid file ID format:', fileId);
        return res.status(400).json({
          success: false,
          message: 'Invalid file ID'
        });
      }
      
      const file = await AdminUpload.findById(fileId);
      if (!file) {
        console.log('File not found in database:', fileId);
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      console.log('File found:', {
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        path: file.path,
        mimetype: file.mimetype
      });

      // Convert relative path to absolute path
      const absolutePath = path.resolve(file.path);
      console.log('Absolute path:', absolutePath);
      
      // Check if file exists
      try {
        await fs.access(absolutePath);
        console.log('File exists on disk');
      } catch (error) {
        console.error('File not found on disk:', absolutePath);
        return res.status(404).json({
          success: false,
          message: 'File not found on disk'
        });
      }

      // Set appropriate headers
      res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimetype);
      
      console.log('Sending file:', absolutePath);
      // Send the file
      res.sendFile(absolutePath);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({
        success: false,
        message: 'Error serving file'
      });
    }
  }

  // Enhanced Course Management Methods
  
  // Get all courses with analytics
  async getAllCourses(req, res) {
    try {
      const courses = await Course.find()
        .populate('createdBy', 'firstName lastName email')
        .populate({
          path: 'modules',
          populate: {
            path: 'contents',
            model: 'CourseContent'
          }
        })
        .sort({ createdAt: -1 });

      const coursesWithAnalytics = await Promise.all(courses.map(async (course) => {
        // Calculate total enrollments
        const enrollments = await CoachCourseAssignment.countDocuments({ courseId: course._id });
        
        // Calculate total lessons across all modules
        const totalLessons = course.modules.reduce((total, module) => {
          return total + (module.contents ? module.contents.length : 0);
        }, 0);

        return {
          ...course.toObject(),
          enrolledUsers: enrollments,
          totalUsers: 5000, // Mock total users - can be replaced with actual user count
          rating: course.rating || 0,
          modules: course.modules.length,
          lessons: totalLessons
        };
      }));

      res.json({
        success: true,
        data: coursesWithAnalytics
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching courses'
      });
    }
  }

  // Create new course
  async createCourse(req, res) {
    try {
      const { name, description, price, category, difficulty, duration, thumbnail } = req.body;
      const adminId = req.admin._id;

      const course = new Course({
        name,
        description,
        price: parseFloat(price) || 0,
        category,
        difficulty,
        duration,
        thumbnail,
        createdBy: adminId,
        status: 'draft'
      });

      await course.save();

      res.json({
        success: true,
        message: 'Course created successfully',
        data: course
      });
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating course'
      });
    }
  }

  // Update course
  async updateCourse(req, res) {
    try {
      const { courseId } = req.params;
      const updateData = req.body;

      const course = await Course.findByIdAndUpdate(
        courseId,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).populate('createdBy', 'firstName lastName email');

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({
        success: true,
        message: 'Course updated successfully',
        data: course
      });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating course'
      });
    }
  }

  // Delete course
  async deleteCourse(req, res) {
    try {
      const { courseId } = req.params;

      // Delete course and all related data
      await Course.findByIdAndDelete(courseId);
      await CourseModule.deleteMany({ courseId });
      await CourseContent.deleteMany({ courseId });
      await CoachCourseAssignment.deleteMany({ courseId });

      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting course'
      });
    }
  }

  // Get course with modules and lessons
  async getCourseDetails(req, res) {
    try {
      const { courseId } = req.params;
      console.log('=== GET COURSE DETAILS DEBUG ===');
      console.log('Fetching course details for ID:', courseId);
      console.log('Request method:', req.method);
      console.log('Request URL:', req.url);
      console.log('Request headers:', req.headers);
      console.log('Request user:', req.user);
      console.log('Request admin:', req.admin);

      // First check if course exists
      const courseExists = await Course.findById(courseId);
      console.log('Course exists check:', courseExists ? 'Yes' : 'No');
      if (courseExists) {
        console.log('Course modules array:', courseExists.modules);
        console.log('Course modules length:', courseExists.modules ? courseExists.modules.length : 0);
      }

      const course = await Course.findById(courseId)
        .populate('createdBy', 'firstName lastName email')
        .populate({
          path: 'modules',
          options: { sort: { order: 1 } },
          populate: {
            path: 'contents',
            model: 'CourseContent',
            options: { sort: { order: 1 } }
          }
        });

      console.log('Course found after populate:', course ? 'Yes' : 'No');
      if (course) {
        console.log('Course modules count after populate:', course.modules ? course.modules.length : 0);
        if (course.modules && course.modules.length > 0) {
          console.log('First module contents count:', course.modules[0].contents ? course.modules[0].contents.length : 0);
          console.log('First module:', course.modules[0]);
        }
      }

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('=== GET COURSE DETAILS ERROR ===');
      console.error('Error fetching course details:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Error fetching course details',
        error: error.message
      });
    }
  }

  // Create module
  async createModule(req, res) {
    try {
      console.log('=== CREATE MODULE MIDDLEWARE CHECK ===');
      console.log('Request method:', req.method);
      console.log('Request URL:', req.url);
      console.log('Request headers:', req.headers);
      console.log('Request user:', req.user);
      
      const { courseId } = req.params;
      const { name, description, order } = req.body;
      console.log('=== CREATE MODULE DEBUG ===');
      console.log('Request params:', req.params);
      console.log('Request body:', req.body);
      console.log('Creating module for course:', courseId, 'with data:', { name, description, order });

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Module name is required'
        });
      }

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      const module = new CourseModule({
        name,
        description: description || '',
        order: order || 0,
        courseId
      });

      console.log('Module object before save:', module);
      await module.save();
      console.log('Module saved with ID:', module._id);

      // Add module to course
      const courseUpdate = await Course.findByIdAndUpdate(courseId, {
        $push: { modules: module._id }
      });
      console.log('Course update result:', courseUpdate ? 'Success' : 'Failed');
      
      // Verify the course was updated
      const updatedCourse = await Course.findById(courseId);
      console.log('Course modules after update:', updatedCourse ? updatedCourse.modules : 'Course not found');
      console.log('Course modules length after update:', updatedCourse ? updatedCourse.modules.length : 0);

      res.json({
        success: true,
        message: 'Module created successfully',
        data: module
      });
    } catch (error) {
      console.error('=== CREATE MODULE ERROR ===');
      console.error('Error creating module:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Error creating module',
        error: error.message
      });
    }
  }

  // Update module
  async updateModule(req, res) {
    try {
      const { moduleId } = req.params;
      const updateData = req.body;
      console.log('=== UPDATE MODULE DEBUG ===');
      console.log('Request params:', req.params);
      console.log('Request body:', req.body);
      console.log('Updating module:', moduleId, 'with data:', updateData);

      // Validate required fields
      if (!moduleId) {
        return res.status(400).json({
          success: false,
          message: 'Module ID is required'
        });
      }

      const module = await CourseModule.findByIdAndUpdate(
        moduleId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      console.log('Module update result:', module ? 'Success' : 'Failed');
      if (module) {
        console.log('Updated module:', module);
      }

      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      res.json({
        success: true,
        message: 'Module updated successfully',
        data: module
      });
    } catch (error) {
      console.error('=== UPDATE MODULE ERROR ===');
      console.error('Error updating module:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Error updating module',
        error: error.message
      });
    }
  }

  // Delete module
  async deleteModule(req, res) {
    try {
      const { moduleId } = req.params;

      // Delete module and all its lessons
      await CourseModule.findByIdAndDelete(moduleId);
      await CourseContent.deleteMany({ moduleId });

      // Remove module from course
      await Course.updateMany(
        { modules: moduleId },
        { $pull: { modules: moduleId } }
      );

      res.json({
        success: true,
        message: 'Module deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting module:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting module'
      });
    }
  }

  // Create lesson/content
  async createLesson(req, res) {
    try {
      const { moduleId } = req.params;
      const { title, description, type, content, duration, order, author, resources } = req.body;
      console.log('=== CREATE LESSON DEBUG ===');
      console.log('Request params:', req.params);
      console.log('Request body:', req.body);
      console.log('Creating lesson for module:', moduleId, 'with data:', { title, description, type, content, duration, order });

      // Validate required fields
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Lesson title is required'
        });
      }

      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Lesson type is required'
        });
      }

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Lesson content is required'
        });
      }

      if (!moduleId) {
        return res.status(400).json({
          success: false,
          message: 'Module ID is required'
        });
      }

      const lesson = new CourseContent({
        title,
        description: description || '',
        type,
        content,
        duration: duration || '',
        order: order || 0,
        author: author || '',
        resources: resources || [],
        moduleId
      });

      console.log('Lesson object before save:', lesson);
      await lesson.save();
      console.log('Lesson saved with ID:', lesson._id);

      // Add lesson to module's contents array
      const moduleUpdate = await CourseModule.findByIdAndUpdate(moduleId, {
        $push: { contents: lesson._id }
      });
      console.log('Module update result:', moduleUpdate ? 'Success' : 'Failed');
      
      // Verify the module was updated
      const updatedModule = await CourseModule.findById(moduleId);
      console.log('Module contents after update:', updatedModule ? updatedModule.contents : 'Module not found');
      console.log('Module contents length after update:', updatedModule ? updatedModule.contents.length : 0);

      res.json({
        success: true,
        message: 'Lesson created successfully',
        data: lesson
      });
    } catch (error) {
      console.error('=== CREATE LESSON ERROR ===');
      console.error('Error creating lesson:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Error creating lesson',
        error: error.message
      });
    }
  }

  // Update lesson
  async updateLesson(req, res) {
    try {
      const { lessonId } = req.params;
      const updateData = req.body;
      console.log('=== UPDATE LESSON DEBUG ===');
      console.log('Request params:', req.params);
      console.log('Request body:', req.body);
      console.log('Updating lesson:', lessonId, 'with data:', updateData);

      // Validate required fields
      if (!lessonId) {
        return res.status(400).json({
          success: false,
          message: 'Lesson ID is required'
        });
      }

      const lesson = await CourseContent.findByIdAndUpdate(
        lessonId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      console.log('Lesson update result:', lesson ? 'Success' : 'Failed');
      if (lesson) {
        console.log('Updated lesson:', lesson);
      }

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      res.json({
        success: true,
        message: 'Lesson updated successfully',
        data: lesson
      });
    } catch (error) {
      console.error('=== UPDATE LESSON ERROR ===');
      console.error('Error updating lesson:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Error updating lesson',
        error: error.message
      });
    }
  }

  // Delete lesson
  async deleteLesson(req, res) {
    try {
      const { lessonId } = req.params;

      // First get the lesson to find its moduleId
      const lesson = await CourseContent.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      // Delete the lesson
      await CourseContent.findByIdAndDelete(lessonId);

      // Remove lesson from module's contents array
      await CourseModule.findByIdAndUpdate(lesson.moduleId, {
        $pull: { contents: lessonId }
      });

      res.json({
        success: true,
        message: 'Lesson deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting lesson'
      });
    }
  }

  // Debug function to check database state
  async debugCourseState(req, res) {
    try {
      const { courseId } = req.params;
      console.log('=== DEBUG COURSE STATE ===');
      console.log('Course ID:', courseId);

      // Check course
      const course = await Course.findById(courseId);
      console.log('Course found:', course ? 'Yes' : 'No');
      if (course) {
        console.log('Course modules array:', course.modules);
        console.log('Course modules length:', course.modules ? course.modules.length : 0);
      }

      // Check modules
      const modules = await CourseModule.find({ courseId });
      console.log('Modules found:', modules.length);
      modules.forEach((module, index) => {
        console.log(`Module ${index + 1}:`, {
          id: module._id,
          name: module.name,
          contents: module.contents,
          contentsLength: module.contents ? module.contents.length : 0
        });
      });

      // Check lessons
      const lessons = await CourseContent.find({ moduleId: { $in: modules.map(m => m._id) } });
      console.log('Lessons found:', lessons.length);
      lessons.forEach((lesson, index) => {
        console.log(`Lesson ${index + 1}:`, {
          id: lesson._id,
          title: lesson.title,
          moduleId: lesson.moduleId
        });
      });

      res.json({
        success: true,
        data: {
          course,
          modules,
          lessons,
          summary: {
            courseModules: course ? course.modules.length : 0,
            actualModules: modules.length,
            totalLessons: lessons.length
          }
        }
      });
    } catch (error) {
      console.error('Debug error:', error);
      res.status(500).json({
        success: false,
        message: 'Debug error',
        error: error.message
      });
    }
  }
}

module.exports = new CourseManagementController();
