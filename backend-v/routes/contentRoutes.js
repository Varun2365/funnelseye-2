const express = require('express');
const router = express.Router();

// Import controllers
const {
  // Admin methods
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  // Coach methods
  getMyCourses,
  getMyCourseById,
  getAvailableCourses,
  createMyCourse,
  updateMyCourse,
  createMyModule,
  updateMyModule,
  deleteMyModule,
  createMyContentItem,
  updateMyContentItem,
  deleteMyContentItem
} = require('../controllers/contentController');

// Import existing course management controller for file uploads
const courseManagementController = require('../controllers/courseManagementController');

// Import middleware
const { protect, authorizeCoach } = require('../middleware/auth');
const { verifyAdminToken, checkAdminPermission } = require('../middleware/adminAuth');
const { adminRateLimit } = require('../middleware/adminAuth');

/**
 * Content Management API Routes
 * Base: /api/content
 * 
 * Features:
 * - Admin can upload files, create courses, manage content
 * - Coach can view accessible courses, create own courses, manage content
 * - Supports workout routines, meal plans, and other courses
 * - Day-wise content structure
 * - Progress tracking for customers (to be implemented later)
 */

// ===== ADMIN ROUTES =====

// ===== FILE UPLOAD MANAGEMENT =====
// All file upload routes transferred from /api/admin/v1/courses/* to /api/content/admin/*

// @route   POST /api/content/admin/upload-file
// @desc    Upload file for content use (preserves folder structure)
// @access  Private (Admin)
// Body: FormData with 'file' and optional 'folderId'
// Note: Files must be uploaded inside folders (folderId required)
router.post('/admin/upload-file',
  verifyAdminToken,
  checkAdminPermission('contentManagement'),
  adminRateLimit(20, 60 * 1000),
  courseManagementController.uploadFile
);

// @route   GET /api/content/admin/uploaded-files
// @desc    Get all uploaded files with filtering and pagination
// @access  Private (Admin)
// Query Parameters:
// - page: Page number (default: 1)
// - limit: Items per page (default: 20)
// - fileType: Filter by file type (image, video, pdf, document)
// - search: Search by filename
router.get('/admin/uploaded-files',
  verifyAdminToken,
  checkAdminPermission('contentManagement'),
  courseManagementController.getUploadedFiles
);

// @route   DELETE /api/content/admin/uploaded-files/:fileId
// @desc    Delete uploaded file
// @access  Private (Admin)
router.delete('/admin/uploaded-files/:fileId',
  verifyAdminToken,
  checkAdminPermission('contentManagement'),
  adminRateLimit(20, 60 * 1000),
  courseManagementController.deleteUploadedFile
);

// @route   GET /api/content/admin/files/:fileId/serve
// @desc    Serve uploaded file (public access for serving files)
// @access  Public
router.get('/admin/files/:fileId/serve',
  courseManagementController.serveFile
);

// @route   GET /api/content/admin/files/:fileId
// @desc    Get file details
// @access  Private (Admin)
router.get('/admin/files/:fileId',
  verifyAdminToken,
  checkAdminPermission('contentManagement'),
  courseManagementController.serveFile
);

// @route   PUT /api/content/admin/files/:fileId/move
// @desc    Move file to different folder
// @access  Private (Admin)
// Body: { "folderId": "folder_id_or_null" }
router.put('/admin/files/:fileId/move',
  verifyAdminToken,
  checkAdminPermission('contentManagement'),
  adminRateLimit(15, 60 * 1000),
  courseManagementController.moveFile
);

// ===== FOLDER MANAGEMENT =====
// All folder routes transferred from /api/admin/v1/courses/* to /api/content/admin/*

// @route   GET /api/content/admin/folder-structure
// @desc    Get complete folder structure with files
// @access  Private (Admin)
router.get('/admin/folder-structure',
  verifyAdminToken,
  checkAdminPermission('contentManagement'),
  courseManagementController.getFolderStructure
);

// @route   GET /api/content/admin/folder/:folderId/contents
// @desc    Get contents of a specific folder (folders and files)
// @access  Private (Admin)
// @param folderId: Folder ID or 'root' for root level
router.get('/admin/folder/:folderId/contents',
  verifyAdminToken,
  checkAdminPermission('contentManagement'),
  courseManagementController.getFolderContents
);

// @route   POST /api/content/admin/folders
// @desc    Create new folder
// @access  Private (Admin)
// Body: { "name": "Folder Name", "description": "...", "parentFolder": "folder_id_or_null" }
router.post('/admin/folders',
  verifyAdminToken,
  checkAdminPermission('contentManagement'),
  adminRateLimit(20, 60 * 1000),
  courseManagementController.createFolder
);

// @route   GET /api/content/admin/folders
// @desc    Get folders (optionally filtered by parent)
// @access  Private (Admin)
// Query: parentFolder (optional) - filter by parent folder ID
router.get('/admin/folders',
  verifyAdminToken,
  checkAdminPermission('contentManagement'),
  courseManagementController.getFolders
);

// @route   PUT /api/content/admin/folders/:folderId
// @desc    Update folder
// @access  Private (Admin)
// Body: { "name": "...", "description": "..." }
router.put('/admin/folders/:folderId',
  verifyAdminToken,
  checkAdminPermission('contentManagement'),
  adminRateLimit(20, 60 * 1000),
  courseManagementController.updateFolder
);

// @route   DELETE /api/content/admin/folders/:folderId
// @desc    Delete folder (only if empty)
// @access  Private (Admin)
router.delete('/admin/folders/:folderId',
  verifyAdminToken,
  checkAdminPermission('contentManagement'),
  adminRateLimit(20, 60 * 1000),
  courseManagementController.deleteFolder
);

// Course Management
// @route   POST /api/content/admin/courses
// @desc    Create a new course
// @access  Private (Admin)
// 
// Request Body:
// {
//   "title": "30-Day Workout Challenge",
//   "description": "Complete workout routine",
//   "courseType": "workout_routine",
//   "price": 99.99,
//   "category": "customer_course",
//   "thumbnail": "url_or_path"
// }
router.post('/admin/courses',
  verifyAdminToken,
  createCourse
);

// @route   GET /api/content/admin/courses
// @desc    Get all courses
// @access  Private (Admin)
// 
// Query Parameters:
// - page: Page number (default: 1)
// - limit: Items per page (default: 20)
// - courseType: Filter by type (workout_routine, meal_plan, other_course)
// - category: Filter by category (coach_course, customer_course)
// - status: Filter by status (draft, published, archived)
// - search: Search in title and description
router.get('/admin/courses',
  verifyAdminToken,
  getCourses
);

// @route   GET /api/content/admin/courses/:courseId
// @desc    Get course by ID with full details
// @access  Private (Admin)
router.get('/admin/courses/:courseId',
  verifyAdminToken,
  getCourseById
);

// @route   PUT /api/content/admin/courses/:courseId
// @desc    Update course
// @access  Private (Admin)
router.put('/admin/courses/:courseId',
  verifyAdminToken,
  updateCourse
);

// @route   DELETE /api/content/admin/courses/:courseId
// @desc    Delete course (and all modules/content)
// @access  Private (Admin)
router.delete('/admin/courses/:courseId',
  verifyAdminToken,
  deleteCourse
);

// Module Management
// @route   POST /api/content/admin/courses/:courseId/modules
// @desc    Create a new module (day-wise)
// @access  Private (Admin)
// 
// Request Body:
// {
//   "title": "Day 1: Upper Body",
//   "description": "Focus on chest and back",
//   "day": 1,
//   "order": 0
// }
router.post('/admin/courses/:courseId/modules',
  verifyAdminToken,
  createModule
);

// @route   PUT /api/content/admin/modules/:moduleId
// @desc    Update module
// @access  Private (Admin)
router.put('/admin/modules/:moduleId',
  verifyAdminToken,
  updateModule
);

// @route   DELETE /api/content/admin/modules/:moduleId
// @desc    Delete module (and all content items)
// @access  Private (Admin)
router.delete('/admin/modules/:moduleId',
  verifyAdminToken,
  deleteModule
);

// Content Item Management
// @route   POST /api/content/admin/modules/:moduleId/contents
// @desc    Create a new content item (video, PDF, image, etc.)
// @access  Private (Admin)
// 
// Request Body:
// {
//   "title": "Introduction Video",
//   "description": "Welcome to Day 1",
//   "contentType": "video",
//   "content": "url_or_file_path",
//   "order": 0
// }
router.post('/admin/modules/:moduleId/contents',
  verifyAdminToken,
  createContentItem
);

// @route   PUT /api/content/admin/contents/:itemId
// @desc    Update content item
// @access  Private (Admin)
router.put('/admin/contents/:itemId',
  verifyAdminToken,
  updateContentItem
);

// @route   DELETE /api/content/admin/contents/:itemId
// @desc    Delete content item
// @access  Private (Admin)
router.delete('/admin/contents/:itemId',
  verifyAdminToken,
  deleteContentItem
);

// ===== COACH ROUTES =====

// Course Management
// @route   GET /api/content/coach/courses
// @desc    Get courses accessible to coach
// @access  Private (Coach)
// 
// Query Parameters:
// - page: Page number (default: 1)
// - limit: Items per page (default: 20)
// - courseType: Filter by type
// - category: Filter by category
// - search: Search in title and description
router.get('/coach/courses',
  protect,
  authorizeCoach('coach'),
  getMyCourses
);

// @route   GET /api/content/coach/courses/:courseId
// @desc    Get course by ID (if coach has access)
// @access  Private (Coach)
router.get('/coach/courses/:courseId',
  protect,
  authorizeCoach('coach'),
  getMyCourseById
);

// @route   GET /api/content/coach/available-courses
// @desc    Get available courses from subscription plan courseBundles
// @access  Private (Coach)
// 
// Query Parameters:
// - page: Page number (default: 1)
// - limit: Items per page (default: 100)
// - courseType: Filter by type
// - category: Filter by category
// - search: Search in title and description
// 
// Returns courses from active subscription plan's courseBundles with permissions
// Falls back to all published customer courses if no subscription
router.get('/coach/available-courses',
  protect,
  authorizeCoach('coach'),
  getAvailableCourses
);

// @route   POST /api/content/coach/courses
// @desc    Create a new course (coach's own course)
// @access  Private (Coach)
router.post('/coach/courses',
  protect,
  authorizeCoach('coach'),
  createMyCourse
);

// @route   PUT /api/content/coach/courses/:courseId
// @desc    Update course (if coach owns it or has modify access)
// @access  Private (Coach)
router.put('/coach/courses/:courseId',
  protect,
  authorizeCoach('coach'),
  updateMyCourse
);

// Module Management (for coach's courses)
// @route   POST /api/content/coach/courses/:courseId/modules
// @desc    Create a new module for coach's course
// @access  Private (Coach)
router.post('/coach/courses/:courseId/modules',
  protect,
  authorizeCoach('coach'),
  createMyModule
);

// @route   PUT /api/content/coach/modules/:moduleId
// @desc    Update module (if coach has access)
// @access  Private (Coach)
router.put('/coach/modules/:moduleId',
  protect,
  authorizeCoach('coach'),
  updateMyModule
);

// @route   DELETE /api/content/coach/modules/:moduleId
// @desc    Delete module (if coach has access)
// @access  Private (Coach)
router.delete('/coach/modules/:moduleId',
  protect,
  authorizeCoach('coach'),
  deleteMyModule
);

// Content Item Management (for coach's courses)
// @route   POST /api/content/coach/modules/:moduleId/contents
// @desc    Create a new content item
// @access  Private (Coach)
router.post('/coach/modules/:moduleId/contents',
  protect,
  authorizeCoach('coach'),
  createMyContentItem
);

// @route   PUT /api/content/coach/contents/:itemId
// @desc    Update content item (if coach has access)
// @access  Private (Coach)
router.put('/coach/contents/:itemId',
  protect,
  authorizeCoach('coach'),
  updateMyContentItem
);

// @route   DELETE /api/content/coach/contents/:itemId
// @desc    Delete content item (if coach has access)
// @access  Private (Coach)
router.delete('/coach/contents/:itemId',
  protect,
  authorizeCoach('coach'),
  deleteMyContentItem
);

// ===== COACH FILE ACCESS (Read-only access to admin-uploaded files) =====

// @route   GET /api/content/coach/uploaded-files
// @desc    Get admin-uploaded files (read-only access for coaches to reuse content)
// @access  Private (Coach)
// Query Parameters:
// - page: Page number (default: 1)
// - limit: Items per page (default: 20)
// - fileType: Filter by file type (image, video, pdf, document)
// - search: Search by filename
router.get('/coach/uploaded-files',
  protect,
  authorizeCoach('coach'),
  courseManagementController.getUploadedFiles
);

// @route   GET /api/content/coach/folder/:folderId/contents
// @desc    Get contents of a specific folder (read-only access for coaches)
// @access  Private (Coach)
// @param folderId: Folder ID or 'root' for root level
router.get('/coach/folder/:folderId/contents',
  protect,
  authorizeCoach('coach'),
  courseManagementController.getFolderContents
);

// @route   GET /api/content/coach/folder-structure
// @desc    Get complete folder structure with files (read-only access for coaches)
// @access  Private (Coach)
router.get('/coach/folder-structure',
  protect,
  authorizeCoach('coach'),
  courseManagementController.getFolderStructure
);

module.exports = router;

