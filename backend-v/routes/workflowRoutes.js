// D:\PRJ_YCT_Final\routes\workflowRoutes.js

const express = require('express');
const router = express.Router();
const {
    createTask,
    getKanbanBoard,
    moveTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    addComment,
    logTime,
    addSubtask,
    getTaskAnalytics,
    autoAssignTasks,
    getUpcomingTasks,
    bulkUpdateTaskStatus,
    generateSOP,
    getOverdueTasks,
    getTasksByStage,
    createTaskFromLead,
    getTaskDependencies,
    addTaskDependency,
    removeTaskDependency
} = require('../controllers/workflowTaskController');

// Import unified authentication middleware
const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply unified authentication and resource filtering to all routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('tasks'));

// Kanban Board
router.get('/kanban-board', requirePermission('tasks:read'), getKanbanBoard);

// Task Management
router.route('/tasks')
    .get(requirePermission('tasks:read'), getTasks)
    .post(requirePermission('tasks:write'), createTask);

router.route('/tasks/:id')
    .get(requirePermission('tasks:read'), getTask)
    .put(requirePermission('tasks:update'), updateTask)
    .delete(requirePermission('tasks:delete'), deleteTask);

// Task Movement (Kanban)
router.put('/tasks/:taskId/move', requirePermission('tasks:update'), moveTask);

// Task Comments
router.post('/tasks/:id/comments', requirePermission('tasks:update'), addComment);

// Time Logging
router.post('/tasks/:id/time-log', requirePermission('tasks:update'), logTime);

// Subtasks
router.post('/tasks/:id/subtasks', requirePermission('tasks:write'), addSubtask);

// Task Dependencies
router.get('/tasks/:id/dependencies', requirePermission('tasks:read'), getTaskDependencies);
router.post('/tasks/:id/dependencies', requirePermission('tasks:write'), addTaskDependency);
router.delete('/tasks/:id/dependencies/:dependencyId', requirePermission('tasks:delete'), removeTaskDependency);

// Analytics
router.get('/analytics', requirePermission('tasks:read'), getTaskAnalytics);

// Auto Assignment
router.post('/auto-assign', requirePermission('tasks:assign'), autoAssignTasks);

// Upcoming Tasks
router.get('/upcoming-tasks', requirePermission('tasks:read'), getUpcomingTasks);

// Bulk Operations
router.put('/bulk-update-status', requirePermission('tasks:update'), bulkUpdateTaskStatus);

// SOP Generation
router.post('/generate-sop', requirePermission('tasks:manage'), generateSOP);

// Task Filtering
router.get('/overdue-tasks', requirePermission('tasks:read'), getOverdueTasks);
router.get('/tasks/stage/:stage', requirePermission('tasks:read'), getTasksByStage);

// Lead Integration
router.post('/tasks/from-lead/:leadId', requirePermission('tasks:write'), createTaskFromLead);

module.exports = router;
