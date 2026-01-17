// D:\PRJ_YCT_Final\controllers/workflowTaskController.js

const { Task, Lead } = require('../schema');
const { getUserContext } = require('../middleware/unifiedCoachAuth');
const workflowTaskService = require('../services/workflowTaskService');
const asyncHandler = require('../middleware/async');

// @desc    Create a new task with intelligent assignment
// @route   POST /api/workflow/tasks
// @access  Private (Coaches)
exports.createTask = asyncHandler(async (req, res, next) => {
    const {
        name,
        description,
        dueDate,
        relatedLead,
        assignedTo,
        priority = 'MEDIUM',
        stage = 'LEAD_GENERATION',
        estimatedHours = 1,
        tags = []
    } = req.body;
    const coachId = req.coachId;

    // Validate required fields
    if (!name || !dueDate) {
        return res.status(400).json({
            success: false,
            message: 'name and dueDate are required'
        });
    }

    // Validate and set assignedTo (default to coach if not provided)
    let finalAssignedTo = assignedTo;
    if (!finalAssignedTo || finalAssignedTo === '') {
        finalAssignedTo = coachId;
    }

    // Validate relatedLead - if not provided or empty, try to find a fallback
    // The schema requires it, so we'll use the most recent lead as a fallback
    let finalRelatedLead = relatedLead;
    if (!finalRelatedLead || finalRelatedLead === '' || finalRelatedLead === null) {
        // Try to find the most recent lead for this coach as a fallback
        const recentLead = await Lead.findOne({ coachId })
            .sort({ createdAt: -1 })
            .select('_id name email');
        
        if (recentLead) {
            finalRelatedLead = recentLead._id;
            console.log(`[WorkflowTaskController] No relatedLead provided, using most recent lead: ${recentLead.name || recentLead.email || recentLead._id}`);
        } else {
            // If no leads exist, return a helpful error message
            return res.status(400).json({
                success: false,
                message: 'No leads found. Please create a lead first, or select an existing lead when creating the task.',
                error: 'NO_LEADS_AVAILABLE',
                suggestion: 'You can create a lead from the Leads section, or use the task creation form to select a lead.'
            });
        }
    }

    const taskData = {
        name: name.trim(),
        description: description || '',
        dueDate: new Date(dueDate),
        relatedLead: finalRelatedLead,
        assignedTo: finalAssignedTo,
        coachId,
        priority,
        stage,
        estimatedHours,
        tags
    };

    const task = await workflowTaskService.createTask(taskData);

    res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
    });
});

// @desc    Get Kanban board data
// @route   GET /api/workflow/kanban-board
// @access  Private (Coaches)
exports.getKanbanBoard = asyncHandler(async (req, res, next) => {
    const coachId = req.coachId;

    const boardData = await workflowTaskService.getKanbanBoard(coachId);

    res.status(200).json({
        success: true,
        data: boardData
    });
});

// @desc    Move task between stages (Kanban drag & drop)
// @route   PUT /api/workflow/tasks/:taskId/move
// @access  Private (Coaches)
exports.moveTask = asyncHandler(async (req, res, next) => {
    const { taskId } = req.params;
    const { newStage, status } = req.body;
    const coachId = req.coachId;

    // Support both stage-based and status-based moves
    if (!newStage && !status) {
        return res.status(400).json({
            success: false,
            message: 'newStage or status is required'
        });
    }

    let task;
    if (status) {
        // Update status directly
        task = await Task.findOneAndUpdate(
            { _id: taskId, coachId },
            { status, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate('assignedTo', 'name email')
         .populate('relatedLead', 'name email phone status');
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
    } else {
        // Use stage-based move
        task = await workflowTaskService.moveTask(taskId, newStage, coachId);
    }

    res.status(200).json({
        success: true,
        message: 'Task moved successfully',
        data: task
    });
});

// @desc    Get all tasks with filtering and pagination
// @route   GET /api/workflow/tasks
// @access  Private (Coaches)
exports.getTasks = asyncHandler(async (req, res, next) => {
    const coachId = req.coachId;
    const { 
        status, 
        priority, 
        stage, 
        assignedTo, 
        dueDate,
        page = 1, 
        limit = 100, // Increased default limit for dashboard
        sortBy = 'dueDate',
        sortOrder = 'asc'
    } = req.query;

    const filter = { coachId };
    
    // Log for debugging
    console.log(`[WorkflowTaskController] getTasks - Coach ID: ${coachId}`);
    console.log(`[WorkflowTaskController] getTasks - Filter:`, filter);
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (stage) filter.stage = stage;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (dueDate) {
        const date = new Date(dueDate);
        filter.dueDate = {
            $gte: date,
            $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
        };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const tasks = await Task.find(filter)
        .populate('assignedTo', 'name email role')
        .populate('relatedLead', 'name email phone status')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);
    
    // Log for debugging
    console.log(`[WorkflowTaskController] getTasks - Found ${tasks.length} tasks (Total: ${total})`);

    res.status(200).json({
        success: true,
        data: tasks,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Get single task by ID
// @route   GET /api/workflow/tasks/:id
// @access  Private (Coaches)
exports.getTask = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const coachId = req.coachId;

    const task = await Task.findOne({ _id: id, coachId })
        .populate('assignedTo', 'name email role')
        .populate('relatedLead', 'name email phone status')
        .populate('dependencies', 'name status dueDate');

    if (!task) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }

    res.status(200).json({
        success: true,
        data: task
    });
});

// @desc    Update task
// @route   PUT /api/workflow/tasks/:id
// @access  Private (Coaches)
exports.updateTask = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const coachId = req.coachId;
    const updateData = req.body;

    const task = await Task.findOneAndUpdate(
        { _id: id, coachId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('relatedLead', 'name email phone status');

    if (!task) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task
    });
});

// @desc    Delete task
// @route   DELETE /api/workflow/tasks/:id
// @access  Private (Coaches)
exports.deleteTask = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const coachId = req.coachId;

    const task = await Task.findOneAndDelete({ _id: id, coachId });

    if (!task) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
    });
});

// @desc    Add comment to task
// @route   POST /api/workflow/tasks/:id/comments
// @access  Private (Coaches)
exports.addComment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { content } = req.body;
    const coachId = req.coachId;

    if (!content) {
        return res.status(400).json({
            success: false,
            message: 'Comment content is required'
        });
    }

    const task = await Task.findOne({ _id: id, coachId });
    if (!task) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }

    await task.addComment(coachId, content);

    res.status(200).json({
        success: true,
        message: 'Comment added successfully',
        data: task
    });
});

// @desc    Log time to task
// @route   POST /api/workflow/tasks/:id/time-log
// @access  Private (Coaches)
exports.logTime = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { startTime, endTime, description } = req.body;
    const coachId = req.coachId;

    if (!startTime || !endTime) {
        return res.status(400).json({
            success: false,
            message: 'startTime and endTime are required'
        });
    }

    const task = await Task.findOne({ _id: id, coachId });
    if (!task) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }

    await task.logTime(coachId, new Date(startTime), new Date(endTime), description);

    res.status(200).json({
        success: true,
        message: 'Time logged successfully',
        data: task
    });
});

// @desc    Add subtask to task
// @route   POST /api/workflow/tasks/:id/subtasks
// @access  Private (Coaches)
exports.addSubtask = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, description, dueDate } = req.body;
    const coachId = req.coachId;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Subtask name is required'
        });
    }

    const task = await Task.findOne({ _id: id, coachId });
    if (!task) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }

    await task.addSubtask(name, description, dueDate ? new Date(dueDate) : null);

    res.status(200).json({
        success: true,
        message: 'Subtask added successfully',
        data: task
    });
});

// @desc    Get task analytics
// @route   GET /api/workflow/analytics
// @access  Private (Coaches)
exports.getTaskAnalytics = asyncHandler(async (req, res, next) => {
    const coachId = req.coachId;
    const { dateRange = 30 } = req.query;

    const analytics = await workflowTaskService.getTaskAnalytics(coachId, parseInt(dateRange));

    res.status(200).json({
        success: true,
        data: analytics
    });
});

// @desc    Auto-assign unassigned tasks
// @route   POST /api/workflow/auto-assign
// @access  Private (Coaches)
exports.autoAssignTasks = asyncHandler(async (req, res, next) => {
    const coachId = req.coachId;

    const result = await workflowTaskService.autoAssignTasks(coachId);

    res.status(200).json({
        success: true,
        data: result
    });
});

// @desc    Get upcoming tasks
// @route   GET /api/workflow/upcoming-tasks
// @access  Private (Coaches)
exports.getUpcomingTasks = asyncHandler(async (req, res, next) => {
    const coachId = req.coachId;
    const { days = 7 } = req.query;

    const tasks = await workflowTaskService.getUpcomingTasks(coachId, parseInt(days));

    res.status(200).json({
        success: true,
        data: tasks
    });
});

// @desc    Bulk update task status
// @route   PUT /api/workflow/bulk-update-status
// @access  Private (Coaches)
exports.bulkUpdateTaskStatus = asyncHandler(async (req, res, next) => {
    const { taskIds, newStatus } = req.body;
    const coachId = req.coachId;

    if (!taskIds || !Array.isArray(taskIds) || !newStatus) {
        return res.status(400).json({
            success: false,
            message: 'taskIds array and newStatus are required'
        });
    }

    const result = await workflowTaskService.bulkUpdateTaskStatus(taskIds, newStatus, coachId);

    res.status(200).json({
        success: true,
        data: result
    });
});

// @desc    Generate SOP for task type
// @route   POST /api/workflow/generate-sop
// @access  Private (Coaches)
exports.generateSOP = asyncHandler(async (req, res, next) => {
    const { taskType, context } = req.body;

    if (!taskType) {
        return res.status(400).json({
            success: false,
            message: 'taskType is required'
        });
    }

    const sop = await workflowTaskService.generateSOP(taskType, context);

    res.status(200).json({
        success: true,
        data: sop
    });
});

// @desc    Get overdue tasks
// @route   GET /api/workflow/overdue-tasks
// @access  Private (Coaches)
exports.getOverdueTasks = asyncHandler(async (req, res, next) => {
    const coachId = req.coachId;

    const tasks = await Task.getOverdueTasks(coachId);

    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
    });
});

// @desc    Get tasks by stage
// @route   GET /api/workflow/tasks/stage/:stage
// @access  Private (Coaches)
exports.getTasksByStage = asyncHandler(async (req, res, next) => {
    const { stage } = req.params;
    const coachId = req.coachId;

    const tasks = await Task.getTasksByStage(coachId, stage);

    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
    });
});

// @desc    Create task from lead
// @route   POST /api/workflow/tasks/from-lead/:leadId
// @access  Private (Coaches)
exports.createTaskFromLead = asyncHandler(async (req, res, next) => {
    const { leadId } = req.params;
    const { name, description, dueDate, priority = 'MEDIUM', stage = 'LEAD_GENERATION' } = req.body;
    const coachId = req.coachId;

    // Verify lead exists and belongs to coach
    const lead = await Lead.findOne({ _id: leadId, coachId });
    if (!lead) {
        return res.status(404).json({
            success: false,
            message: 'Lead not found'
        });
    }

    const taskData = {
        name: name || `Follow up with ${lead.name}`,
        description: description || `Follow up with lead: ${lead.name} (${lead.email})`,
        dueDate: dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
        relatedLead: leadId,
        coachId,
        priority,
        stage
    };

    const task = await workflowTaskService.createTask(taskData);

    res.status(201).json({
        success: true,
        message: 'Task created from lead successfully',
        data: task
    });
});

// @desc    Get task dependencies
// @route   GET /api/workflow/tasks/:id/dependencies
// @access  Private (Coaches)
exports.getTaskDependencies = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const coachId = req.coachId;

    const task = await Task.findOne({ _id: id, coachId }).populate('dependencies');
    if (!task) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }

    res.status(200).json({
        success: true,
        data: task.dependencies
    });
});

// @desc    Add task dependency
// @route   POST /api/workflow/tasks/:id/dependencies
// @access  Private (Coaches)
exports.addTaskDependency = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { dependencyId } = req.body;
    const coachId = req.coachId;

    if (!dependencyId) {
        return res.status(400).json({
            success: false,
            message: 'dependencyId is required'
        });
    }

    const task = await Task.findOne({ _id: id, coachId });
    if (!task) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }

    // Verify dependency task exists and belongs to coach
    const dependencyTask = await Task.findOne({ _id: dependencyId, coachId });
    if (!dependencyTask) {
        return res.status(404).json({
            success: false,
            message: 'Dependency task not found'
        });
    }

    if (!task.dependencies.includes(dependencyId)) {
        task.dependencies.push(dependencyId);
        await task.save();
    }

    res.status(200).json({
        success: true,
        message: 'Dependency added successfully',
        data: task
    });
});

// @desc    Remove task dependency
// @route   DELETE /api/workflow/tasks/:id/dependencies/:dependencyId
// @access  Private (Coaches)
exports.removeTaskDependency = asyncHandler(async (req, res, next) => {
    const { id, dependencyId } = req.params;
    const coachId = req.coachId;

    const task = await Task.findOne({ _id: id, coachId });
    if (!task) {
        return res.status(404).json({
            success: false,
            message: 'Task not found'
        });
    }

    task.dependencies = task.dependencies.filter(dep => dep.toString() !== dependencyId);
    await task.save();

    res.status(200).json({
        success: true,
        message: 'Dependency removed successfully',
        data: task
    });
});
