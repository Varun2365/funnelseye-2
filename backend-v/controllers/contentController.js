const fs = require('fs').promises;
const {
  ContentCourse,
  ContentModule,
  ContentItem,
  CustomerProgress,
  CoachCourseAccess
} = require('../schema/contentSchemas');
const SubscriptionPlan = require('../schema/SubscriptionPlan');
const CoachSubscription = require('../schema/CoachSubscription');

class ContentController {
  // ===== ADMIN METHODS =====

  // Note: File upload management is handled by courseManagementController
  // See routes/contentRoutes.js for file upload endpoints

  // Course Management
  async createCourse(req, res) {
    try {
      const { title, description, courseType, price, currency, category, thumbnail, workoutSpecificFields, mealPlanSpecificFields, generalModuleFields, funnelsEyeExtras } = req.body;

      if (!title || !courseType || price === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Title, courseType, and price are required'
        });
      }

      if (!['workout_routine', 'meal_plan', 'general_module_course'].includes(courseType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid courseType. Must be workout_routine, meal_plan, or general_module_course'
        });
      }

      if (!['coach_course', 'customer_course'].includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category. Must be coach_course or customer_course'
        });
      }

      const courseData = {
        title,
        description: description || '',
        courseType,
        price: parseFloat(price) || 0,
        currency: currency || 'USD',
        category,
        thumbnail: thumbnail || null,
        createdBy: req.admin._id,
        status: 'draft'
      };

      // Add course-type specific fields
      if (courseType === 'workout_routine' && workoutSpecificFields) {
        courseData.workoutSpecificFields = workoutSpecificFields;
      }
      if (courseType === 'meal_plan' && mealPlanSpecificFields) {
        courseData.mealPlanSpecificFields = mealPlanSpecificFields;
      }
      if (courseType === 'general_module_course' && generalModuleFields) {
        courseData.generalModuleFields = generalModuleFields;
      }

      if (funnelsEyeExtras) {
        const {
          headline = '',
          subheadline = '',
          transformationPromise = '',
          coachSupport = '',
          communityAccess = '',
          guarantee = '',
          successMetrics = [],
          bonusResources = [],
          platformTools = []
        } = funnelsEyeExtras;

        courseData.funnelsEyeExtras = {
          headline,
          subheadline,
          transformationPromise,
          coachSupport,
          communityAccess,
          guarantee,
          successMetrics: Array.isArray(successMetrics) ? successMetrics : [],
          bonusResources: Array.isArray(bonusResources) ? bonusResources : [],
          platformTools: Array.isArray(platformTools) ? platformTools : []
        };
      }

      const course = new ContentCourse(courseData);
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
        message: 'Error creating course',
        error: error.message
      });
    }
  }

  async getCourses(req, res) {
    try {
      const { page = 1, limit = 20, courseType, category, status, search } = req.query;
      const skip = (page - 1) * limit;

      // Only show courses created by admin (not by coaches)
      // Admin courses have createdBy as ObjectId (admin._id), coach courses have createdBy as ObjectId (coach._id)
      // We need to filter out courses where createdBy is a User (coach), not Admin
      const AdminUser = require('../schema/AdminUser');
      
      // Get all admin IDs
      const admins = await AdminUser.find({}).select('_id');
      const adminIds = admins.map(a => a._id.toString());
      
      let query = {
        createdBy: { $in: adminIds } // Only courses created by admins
      };
      
      if (courseType) query.courseType = courseType;
      if (category) query.category = category;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const courses = await ContentCourse.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'firstName lastName email')
        .populate('modules');

      const total = await ContentCourse.countDocuments(query);

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
        message: 'Error fetching courses',
        error: error.message
      });
    }
  }

  async getCourseById(req, res) {
    try {
      const { courseId } = req.params;

      const course = await ContentCourse.findById(courseId)
        .populate('createdBy', 'firstName lastName email')
        .populate({
          path: 'modules',
          populate: {
            path: 'contents',
            model: 'ContentItem'
          }
        });

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
        message: 'Error fetching course',
        error: error.message
      });
    }
  }

  async updateCourse(req, res) {
    try {
      const { courseId } = req.params;
      const { title, description, courseType, price, currency, category, thumbnail, status, workoutSpecificFields, mealPlanSpecificFields, generalModuleFields, funnelsEyeExtras } = req.body;

      const course = await ContentCourse.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      if (title) course.title = title;
      if (description !== undefined) course.description = description;
      if (courseType) course.courseType = courseType;
      if (price !== undefined) course.price = parseFloat(price);
      if (currency) course.currency = currency;
      if (category) course.category = category;
      if (thumbnail !== undefined) course.thumbnail = thumbnail;
      if (status) course.status = status;
      
      // Update course-type specific fields
      if (workoutSpecificFields && course.courseType === 'workout_routine') {
        course.workoutSpecificFields = { ...course.workoutSpecificFields, ...workoutSpecificFields };
      }
      if (mealPlanSpecificFields && course.courseType === 'meal_plan') {
        course.mealPlanSpecificFields = { ...course.mealPlanSpecificFields, ...mealPlanSpecificFields };
      }
      if (generalModuleFields && course.courseType === 'general_module_course') {
        course.generalModuleFields = { ...course.generalModuleFields, ...generalModuleFields };
      }

      if (funnelsEyeExtras) {
        const {
          headline,
          subheadline,
          transformationPromise,
          coachSupport,
          communityAccess,
          guarantee,
          successMetrics,
          bonusResources,
          platformTools
        } = funnelsEyeExtras;

        course.funnelsEyeExtras = {
          headline: headline !== undefined ? headline : (course.funnelsEyeExtras?.headline || ''),
          subheadline: subheadline !== undefined ? subheadline : (course.funnelsEyeExtras?.subheadline || ''),
          transformationPromise: transformationPromise !== undefined ? transformationPromise : (course.funnelsEyeExtras?.transformationPromise || ''),
          coachSupport: coachSupport !== undefined ? coachSupport : (course.funnelsEyeExtras?.coachSupport || ''),
          communityAccess: communityAccess !== undefined ? communityAccess : (course.funnelsEyeExtras?.communityAccess || ''),
          guarantee: guarantee !== undefined ? guarantee : (course.funnelsEyeExtras?.guarantee || ''),
          successMetrics: Array.isArray(successMetrics) ? successMetrics : (course.funnelsEyeExtras?.successMetrics || []),
          bonusResources: Array.isArray(bonusResources) ? bonusResources : (course.funnelsEyeExtras?.bonusResources || []),
          platformTools: Array.isArray(platformTools) ? platformTools : (course.funnelsEyeExtras?.platformTools || [])
        };
      }
      
      course.updatedAt = new Date();

      await course.save();

      res.json({
        success: true,
        message: 'Course updated successfully',
        data: course
      });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating course',
        error: error.message
      });
    }
  }

  async deleteCourse(req, res) {
    try {
      const { courseId } = req.params;

      const course = await ContentCourse.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Delete all modules and content items
      const modules = await ContentModule.find({ courseId });
      for (const module of modules) {
        await ContentItem.deleteMany({ moduleId: module._id });
        await ContentModule.findByIdAndDelete(module._id);
      }

      // Delete course
      await ContentCourse.findByIdAndDelete(courseId);

      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting course',
        error: error.message
      });
    }
  }

  // Module Management
  async createModule(req, res) {
    try {
      const { courseId } = req.params;
      const { title, description, day, order } = req.body;

      if (!title || !day) {
        return res.status(400).json({
          success: false,
          message: 'Title and day are required'
        });
      }

      const course = await ContentCourse.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const module = new ContentModule({
        title,
        description: description || '',
        day: parseInt(day),
        order: order || 0,
        courseId
      });

      await module.save();

      // Add module to course
      course.modules.push(module._id);
      await course.save();

      res.json({
        success: true,
        message: 'Module created successfully',
        data: module
      });
    } catch (error) {
      console.error('Error creating module:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating module',
        error: error.message
      });
    }
  }

  async updateModule(req, res) {
    try {
      const { moduleId } = req.params;
      const { title, description, day, order } = req.body;

      const module = await ContentModule.findById(moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      if (title) module.title = title;
      if (description !== undefined) module.description = description;
      if (day) module.day = parseInt(day);
      if (order !== undefined) module.order = order;
      module.updatedAt = new Date();

      await module.save();

      res.json({
        success: true,
        message: 'Module updated successfully',
        data: module
      });
    } catch (error) {
      console.error('Error updating module:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating module',
        error: error.message
      });
    }
  }

  async deleteModule(req, res) {
    try {
      const { moduleId } = req.params;

      const module = await ContentModule.findById(moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      // Delete all content items
      await ContentItem.deleteMany({ moduleId });

      // Remove module from course
      await ContentCourse.findByIdAndUpdate(module.courseId, {
        $pull: { modules: moduleId }
      });

      // Delete module
      await ContentModule.findByIdAndDelete(moduleId);

      res.json({
        success: true,
        message: 'Module deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting module:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting module',
        error: error.message
      });
    }
  }

  // Content Item Management
  async createContentItem(req, res) {
    try {
      const { moduleId } = req.params;
      const { title, description, contentType, content, order, mealData } = req.body;

      if (!title || !contentType) {
        return res.status(400).json({
          success: false,
          message: 'Title and contentType are required'
        });
      }

      // For meal type, content is optional (can use recipe name or meal image)
      if (contentType !== 'meal' && !content) {
        return res.status(400).json({
          success: false,
          message: 'Content is required for this content type'
        });
      }

      if (!['video', 'image', 'pdf', 'audio', 'text', 'youtube', 'meal'].includes(contentType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contentType'
        });
      }

      const module = await ContentModule.findById(moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      // For meal type, use recipe name or meal image as content if content is not provided
      const contentValue = contentType === 'meal' 
        ? (content || mealData?.recipeName || mealData?.mealImage || title)
        : content;

      const contentItemData = {
        title,
        description: description || '',
        contentType,
        content: contentValue,
        order: order || 0,
        moduleId
      };

      // Add mealData if contentType is 'meal'
      if (contentType === 'meal' && mealData) {
        contentItemData.mealData = mealData;
      }

      const contentItem = new ContentItem(contentItemData);

      await contentItem.save();

      // Add content item to module
      module.contents.push(contentItem._id);
      await module.save();

      res.json({
        success: true,
        message: 'Content item created successfully',
        data: contentItem
      });
    } catch (error) {
      console.error('Error creating content item:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating content item',
        error: error.message
      });
    }
  }

  async updateContentItem(req, res) {
    try {
      const { itemId } = req.params;
      const { title, description, contentType, content, order, mealData } = req.body;

      const contentItem = await ContentItem.findById(itemId);
      if (!contentItem) {
        return res.status(404).json({
          success: false,
          message: 'Content item not found'
        });
      }

      if (title) contentItem.title = title;
      if (description !== undefined) contentItem.description = description;
      if (contentType) contentItem.contentType = contentType;
      if (content !== undefined) {
        // For meal type, use recipe name or meal image as content if content is not provided
        contentItem.content = contentType === 'meal' && !content && mealData
          ? (mealData.recipeName || mealData.mealImage || title)
          : content;
      }
      if (order !== undefined) contentItem.order = order;
      // Update mealData if provided and contentType is 'meal'
      if (contentType === 'meal' && mealData) {
        contentItem.mealData = mealData;
      }
      contentItem.updatedAt = new Date();

      await contentItem.save();

      res.json({
        success: true,
        message: 'Content item updated successfully',
        data: contentItem
      });
    } catch (error) {
      console.error('Error updating content item:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating content item',
        error: error.message
      });
    }
  }

  async deleteContentItem(req, res) {
    try {
      const { itemId } = req.params;

      const contentItem = await ContentItem.findById(itemId);
      if (!contentItem) {
        return res.status(404).json({
          success: false,
          message: 'Content item not found'
        });
      }

      // Remove from module
      await ContentModule.findByIdAndUpdate(contentItem.moduleId, {
        $pull: { contents: itemId }
      });

      // Delete content item
      await ContentItem.findByIdAndDelete(itemId);

      res.json({
        success: true,
        message: 'Content item deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting content item:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting content item',
        error: error.message
      });
    }
  }

  // ===== COACH METHODS =====

  async getMyCourses(req, res) {
    try {
      const coachId = req.user._id;
      const { page = 1, limit = 20, courseType, category, search } = req.query;
      const skip = (page - 1) * limit;

      // Get courses accessible to this coach (via access records)
      const accessRecords = await CoachCourseAccess.find({
        coachId,
        status: 'active'
      }).select('courseId');

      const accessibleCourseIds = accessRecords.map(record => record.courseId.toString());

      // Build query: courses created by coach OR courses with access
      let query = {
        $or: [
          { createdBy: coachId }, // Courses created by this coach
          { _id: { $in: accessibleCourseIds } } // Courses with access
        ]
      };

      // Don't filter by status for coach's own courses, but filter for accessed courses
      // We'll handle this in the aggregation or fetch separately
      if (courseType) query.courseType = courseType;
      if (category) query.category = category;
      if (search) {
        query.$and = [
          {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } }
            ]
          }
        ];
      }

      const courses = await ContentCourse.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'firstName lastName email')
        .populate('modules');

      // Filter: show all coach's own courses (any status), but only published for accessed courses
      const filteredCourses = courses.filter(course => {
        const isOwner = course.createdBy?._id?.toString() === coachId.toString() || 
                       course.createdBy?.toString() === coachId.toString();
        if (isOwner) {
          return true; // Show all courses created by coach
        }
        return course.status === 'published'; // Only published for accessed courses
      });

      const total = await ContentCourse.countDocuments(query);

      res.json({
        success: true,
        data: {
          courses: filteredCourses,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Error fetching coach courses:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching courses',
        error: error.message
      });
    }
  }

  async getMyCourseById(req, res) {
    try {
      const coachId = req.user._id;
      const { courseId } = req.params;

      // Get the course first
      const course = await ContentCourse.findById(courseId)
        .populate('createdBy', 'firstName lastName email')
        .populate({
          path: 'modules',
          populate: {
            path: 'contents',
            model: 'ContentItem'
          }
        });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if coach created this course
      const isOwner = course.createdBy?._id?.toString() === coachId.toString() || 
                     course.createdBy?.toString() === coachId.toString();

      if (isOwner) {
        // Coach owns the course, full access
        return res.json({
          success: true,
          data: {
            course,
            access: {
              canModify: true,
              canSell: true
            }
          }
        });
      }

      // Check if coach has access via CoachCourseAccess
      const access = await CoachCourseAccess.findOne({
        coachId,
        courseId,
        status: 'active'
      });

      if (access) {
        return res.json({
          success: true,
          data: {
            course,
            access: {
              canModify: access.canModify,
              canSell: access.canSell
            }
          }
        });
      }

      // Check if course is in subscription plan courseBundles
      const subscription = await CoachSubscription.findOne({
        coachId,
        status: { $in: ['active', 'trial'] }
      }).populate({
        path: 'planId',
        populate: {
          path: 'courseBundles.course',
          model: 'ContentCourse'
        }
      });

      if (subscription && subscription.planId && subscription.planId.courseBundles) {
        const bundle = subscription.planId.courseBundles.find(b => {
          const bundleCourseId = b.course?._id || b.course;
          return bundleCourseId?.toString() === courseId.toString();
        });

        if (bundle) {
          // Course is in subscription bundle, return with bundle permissions
          return res.json({
            success: true,
            data: {
              course,
              access: {
                canModify: bundle.allowContentRemix || false,
                canSell: bundle.allowResell !== false,
                canRemix: bundle.allowContentRemix !== false,
                canCustomPricing: bundle.allowCustomPricing !== false
              },
              bundlePermissions: bundle
            }
          });
        }
      }

      // No access found
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this course'
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching course',
        error: error.message
      });
    }
  }

  // Get available courses from subscription plan courseBundles
  async getAvailableCourses(req, res) {
    try {
      const coachId = req.user._id;
      const { page = 1, limit = 100, courseType, category, search } = req.query;
      
      // Get coach's active subscription with populated courseBundles
      const subscription = await CoachSubscription.findOne({
        coachId,
        status: { $in: ['active', 'trial'] }
      }).populate({
        path: 'planId',
        populate: {
          path: 'courseBundles.course',
          model: 'ContentCourse'
        }
      });

      let availableCourses = [];
      let coursesWithPermissions = [];

      if (subscription && subscription.planId && subscription.planId.courseBundles) {
        const bundles = subscription.planId.courseBundles || [];
        
        // Extract course IDs from bundles (handle both populated and non-populated)
        const courseIds = bundles
          .map(bundle => {
            if (bundle.course) {
              // Handle populated course object
              if (bundle.course._id) {
                return bundle.course._id;
              }
              // Handle ObjectId reference
              return bundle.course;
            }
            return null;
          })
          .filter(id => id);

        if (courseIds.length > 0) {
          // Build query for courses
          let query = {
            _id: { $in: courseIds },
            status: 'published'
          };

          if (courseType) query.courseType = courseType;
          if (category) query.category = category;
          if (search) {
            query.$or = [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } }
            ];
          }

          // Fetch courses with all necessary data
          availableCourses = await ContentCourse.find(query)
            .populate('createdBy', 'firstName lastName email')
            .populate({
              path: 'modules',
              populate: {
                path: 'contents',
                model: 'ContentItem'
              }
            })
            .sort({ createdAt: -1 });

          // Map courses with bundle permissions
          coursesWithPermissions = availableCourses.map(course => {
            const bundle = bundles.find(b => {
              const bundleCourseId = b.course?._id || b.course;
              const courseId = course._id;
              return bundleCourseId?.toString() === courseId?.toString();
            });

            return {
              ...course.toObject(),
              bundlePermissions: bundle || null,
              canResell: bundle?.allowResell !== false,
              canRemix: bundle?.allowContentRemix !== false,
              canCustomPricing: bundle?.allowCustomPricing !== false,
              suggestedPrice: bundle?.suggestedResellPrice || course.price || 0,
              minimumPrice: bundle?.minimumResellPrice,
              maximumPrice: bundle?.maximumResellPrice,
              marketingKitIncluded: bundle?.marketingKitIncluded || false
            };
          });
        }
      }

      // If no courses from subscription, get all published customer courses as fallback
      if (coursesWithPermissions.length === 0) {
        let query = {
          category: 'customer_course',
          status: 'published'
        };

        if (courseType) query.courseType = courseType;
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];
        }

        availableCourses = await ContentCourse.find(query)
          .populate('createdBy', 'firstName lastName email')
          .populate('modules')
          .sort({ createdAt: -1 })
          .limit(parseInt(limit));

        coursesWithPermissions = availableCourses.map(course => ({
          ...course.toObject(),
          bundlePermissions: null,
          canResell: true, // Default to true if no bundle
          canRemix: true, // Default to true if no bundle
          canCustomPricing: true, // Default to true if no bundle
          suggestedPrice: course.price || 0,
          minimumPrice: null,
          maximumPrice: null,
          marketingKitIncluded: false
        }));
      }

      // Apply pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedCourses = coursesWithPermissions.slice(skip, skip + parseInt(limit));

      res.json({
        success: true,
        data: {
          courses: paginatedCourses,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(coursesWithPermissions.length / parseInt(limit)),
            total: coursesWithPermissions.length
          },
          subscription: subscription ? {
            planId: subscription.planId._id || subscription.planId,
            planName: subscription.planId?.name
          } : null
        }
      });
    } catch (error) {
      console.error('Error fetching available courses:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching available courses',
        error: error.message
      });
    }
  }

  async createMyCourse(req, res) {
    try {
      const coachId = req.user._id;
      const { title, description, courseType, price, currency, category, thumbnail } = req.body;

      if (!title || !courseType || price === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Title, courseType, and price are required'
        });
      }

      const course = new ContentCourse({
        title,
        description: description || '',
        courseType,
        price: parseFloat(price) || 0,
        currency: currency || 'USD',
        category: category || 'customer_course',
        thumbnail: thumbnail || null,
        createdBy: coachId, // Coach creates their own course
        status: 'draft'
      });

      await course.save();

      // Grant access to the coach
      const access = new CoachCourseAccess({
        coachId,
        courseId: course._id,
        accessType: 'assigned',
        canModify: true,
        canSell: true
      });
      await access.save();

      res.json({
        success: true,
        message: 'Course created successfully',
        data: course
      });
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating course',
        error: error.message
      });
    }
  }

  async updateMyCourse(req, res) {
    try {
      const coachId = req.user._id;
      const { courseId } = req.params;
      const { title, description, courseType, price, currency, category, thumbnail, status } = req.body;

      // Check if coach owns this course or has modify access
      const course = await ContentCourse.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if coach created it or has modify access
      const isOwner = course.createdBy.toString() === coachId.toString();
      if (!isOwner) {
        const access = await CoachCourseAccess.findOne({
          coachId,
          courseId,
          canModify: true,
          status: 'active'
        });
        if (!access) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to modify this course'
          });
        }
      }

      if (title) course.title = title;
      if (description !== undefined) course.description = description;
      if (courseType) course.courseType = courseType;
      if (price !== undefined) course.price = parseFloat(price);
      if (currency) course.currency = currency;
      if (category) course.category = category;
      if (thumbnail !== undefined) course.thumbnail = thumbnail;
      if (status) course.status = status;
      course.updatedAt = new Date();

      await course.save();

      res.json({
        success: true,
        message: 'Course updated successfully',
        data: course
      });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating course',
        error: error.message
      });
    }
  }

  // Coach module/content management with permission checks
  async createMyModule(req, res) {
    try {
      const coachId = req.user._id;
      const { courseId } = req.params;
      const { title, description, day, order } = req.body;

      if (!title || !day) {
        return res.status(400).json({
          success: false,
          message: 'Title and day are required'
        });
      }

      // Check if coach owns this course or has modify access
      const course = await ContentCourse.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const isOwner = course.createdBy.toString() === coachId.toString();
      if (!isOwner) {
        const access = await CoachCourseAccess.findOne({
          coachId,
          courseId,
          canModify: true,
          status: 'active'
        });
        if (!access) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to modify this course'
          });
        }
      }

      const module = new ContentModule({
        title,
        description: description || '',
        day: parseInt(day),
        order: order || 0,
        courseId
      });

      await module.save();

      // Add module to course
      course.modules.push(module._id);
      await course.save();

      res.json({
        success: true,
        message: 'Module created successfully',
        data: module
      });
    } catch (error) {
      console.error('Error creating module:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating module',
        error: error.message
      });
    }
  }

  async updateMyModule(req, res) {
    try {
      const coachId = req.user._id;
      const { moduleId } = req.params;
      const { title, description, day, order } = req.body;

      const module = await ContentModule.findById(moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      // Check if coach owns the course or has modify access
      const course = await ContentCourse.findById(module.courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const isOwner = course.createdBy.toString() === coachId.toString();
      if (!isOwner) {
        const access = await CoachCourseAccess.findOne({
          coachId,
          courseId: course._id,
          canModify: true,
          status: 'active'
        });
        if (!access) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to modify this course'
          });
        }
      }

      if (title) module.title = title;
      if (description !== undefined) module.description = description;
      if (day) module.day = parseInt(day);
      if (order !== undefined) module.order = order;
      module.updatedAt = new Date();

      await module.save();

      res.json({
        success: true,
        message: 'Module updated successfully',
        data: module
      });
    } catch (error) {
      console.error('Error updating module:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating module',
        error: error.message
      });
    }
  }

  async deleteMyModule(req, res) {
    try {
      const coachId = req.user._id;
      const { moduleId } = req.params;

      const module = await ContentModule.findById(moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      // Check if coach owns the course or has modify access
      const course = await ContentCourse.findById(module.courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const isOwner = course.createdBy.toString() === coachId.toString();
      if (!isOwner) {
        const access = await CoachCourseAccess.findOne({
          coachId,
          courseId: course._id,
          canModify: true,
          status: 'active'
        });
        if (!access) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to modify this course'
          });
        }
      }

      // Delete all content items
      await ContentItem.deleteMany({ moduleId });

      // Remove module from course
      await ContentCourse.findByIdAndUpdate(module.courseId, {
        $pull: { modules: moduleId }
      });

      // Delete module
      await ContentModule.findByIdAndDelete(moduleId);

      res.json({
        success: true,
        message: 'Module deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting module:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting module',
        error: error.message
      });
    }
  }

  async createMyContentItem(req, res) {
    try {
      const coachId = req.user._id;
      const { moduleId } = req.params;
      const { title, description, contentType, content, order } = req.body;

      if (!title || !contentType || !content) {
        return res.status(400).json({
          success: false,
          message: 'Title, contentType, and content are required'
        });
      }

      if (!['video', 'image', 'pdf', 'audio', 'text', 'youtube'].includes(contentType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contentType'
        });
      }

      const module = await ContentModule.findById(moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      // Check if coach owns the course or has modify access
      const course = await ContentCourse.findById(module.courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const isOwner = course.createdBy.toString() === coachId.toString();
      if (!isOwner) {
        const access = await CoachCourseAccess.findOne({
          coachId,
          courseId: course._id,
          canModify: true,
          status: 'active'
        });
        if (!access) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to modify this course'
          });
        }
      }

      const contentItem = new ContentItem({
        title,
        description: description || '',
        contentType,
        content,
        order: order || 0,
        moduleId
      });

      await contentItem.save();

      // Add content item to module
      module.contents.push(contentItem._id);
      await module.save();

      res.json({
        success: true,
        message: 'Content item created successfully',
        data: contentItem
      });
    } catch (error) {
      console.error('Error creating content item:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating content item',
        error: error.message
      });
    }
  }

  async updateMyContentItem(req, res) {
    try {
      const coachId = req.user._id;
      const { itemId } = req.params;
      const { title, description, contentType, content, order } = req.body;

      const contentItem = await ContentItem.findById(itemId);
      if (!contentItem) {
        return res.status(404).json({
          success: false,
          message: 'Content item not found'
        });
      }

      // Check if coach owns the course or has modify access
      const module = await ContentModule.findById(contentItem.moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      const course = await ContentCourse.findById(module.courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const isOwner = course.createdBy.toString() === coachId.toString();
      if (!isOwner) {
        const access = await CoachCourseAccess.findOne({
          coachId,
          courseId: course._id,
          canModify: true,
          status: 'active'
        });
        if (!access) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to modify this course'
          });
        }
      }

      if (title) contentItem.title = title;
      if (description !== undefined) contentItem.description = description;
      if (contentType) contentItem.contentType = contentType;
      if (content) contentItem.content = content;
      if (order !== undefined) contentItem.order = order;
      contentItem.updatedAt = new Date();

      await contentItem.save();

      res.json({
        success: true,
        message: 'Content item updated successfully',
        data: contentItem
      });
    } catch (error) {
      console.error('Error updating content item:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating content item',
        error: error.message
      });
    }
  }

  async deleteMyContentItem(req, res) {
    try {
      const coachId = req.user._id;
      const { itemId } = req.params;

      const contentItem = await ContentItem.findById(itemId);
      if (!contentItem) {
        return res.status(404).json({
          success: false,
          message: 'Content item not found'
        });
      }

      // Check if coach owns the course or has modify access
      const module = await ContentModule.findById(contentItem.moduleId);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      const course = await ContentCourse.findById(module.courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const isOwner = course.createdBy.toString() === coachId.toString();
      if (!isOwner) {
        const access = await CoachCourseAccess.findOne({
          coachId,
          courseId: course._id,
          canModify: true,
          status: 'active'
        });
        if (!access) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to modify this course'
          });
        }
      }

      // Remove from module
      await ContentModule.findByIdAndUpdate(contentItem.moduleId, {
        $pull: { contents: itemId }
      });

      // Delete content item
      await ContentItem.findByIdAndDelete(itemId);

      res.json({
        success: true,
        message: 'Content item deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting content item:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting content item',
        error: error.message
      });
    }
  }
}

const controller = new ContentController();

// Export individual methods
module.exports = {
  // Admin methods
  // Note: File upload methods are in courseManagementController
  createCourse: (req, res) => controller.createCourse(req, res),
  getCourses: (req, res) => controller.getCourses(req, res),
  getCourseById: (req, res) => controller.getCourseById(req, res),
  updateCourse: (req, res) => controller.updateCourse(req, res),
  deleteCourse: (req, res) => controller.deleteCourse(req, res),
  createModule: (req, res) => controller.createModule(req, res),
  updateModule: (req, res) => controller.updateModule(req, res),
  deleteModule: (req, res) => controller.deleteModule(req, res),
  createContentItem: (req, res) => controller.createContentItem(req, res),
  updateContentItem: (req, res) => controller.updateContentItem(req, res),
  deleteContentItem: (req, res) => controller.deleteContentItem(req, res),
  // Coach methods
  getMyCourses: (req, res) => controller.getMyCourses(req, res),
  getMyCourseById: (req, res) => controller.getMyCourseById(req, res),
  getAvailableCourses: (req, res) => controller.getAvailableCourses(req, res),
  createMyCourse: (req, res) => controller.createMyCourse(req, res),
  updateMyCourse: (req, res) => controller.updateMyCourse(req, res),
  // Coach module/content management with permission checks
  createMyModule: (req, res) => controller.createMyModule(req, res),
  updateMyModule: (req, res) => controller.updateMyModule(req, res),
  deleteMyModule: (req, res) => controller.deleteMyModule(req, res),
  createMyContentItem: (req, res) => controller.createMyContentItem(req, res),
  updateMyContentItem: (req, res) => controller.updateMyContentItem(req, res),
  deleteMyContentItem: (req, res) => controller.deleteMyContentItem(req, res)
};

