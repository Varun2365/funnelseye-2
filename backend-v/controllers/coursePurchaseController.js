const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');
const mongoose = require('mongoose');
const ContentCourse = require('../schema/contentSchemas').ContentCourse;
const CustomerCoursePurchase = require('../schema/customerCoursePurchaseSchema');
const logger = require('../utils/logger');
const { Coach, User, AdminUser } = require('../schema');

class CoursePurchaseController {
  constructor() {
    // Initialize Razorpay
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      logger.warn('[CoursePurchaseController] Razorpay credentials not found');
      this.razorpay = null;
    } else {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
      logger.info('[CoursePurchaseController] Razorpay initialized successfully');
    }

    // Bind all methods to preserve 'this' context when used as route handlers
    this.renderCoursePage = this.renderCoursePage.bind(this);
    this.getCourseDetails = this.getCourseDetails.bind(this);
    this.createOrder = this.createOrder.bind(this);
    this.verifyPayment = this.verifyPayment.bind(this);
    this.handleWebhook = this.handleWebhook.bind(this);
    this.getCustomerCourses = this.getCustomerCourses.bind(this);
    this.checkAccess = this.checkAccess.bind(this);
  }

  /**
   * Render course purchase page
   * GET /api/course-purchase/:courseId
   */
  async renderCoursePage(req, res) {
    try {
      const { courseId } = req.params;
      
      if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).send('Invalid course ID');
      }

      const course = await ContentCourse.findById(courseId)
        .populate('modules')
        .lean();

      if (!course) {
        return res.status(404).send('Course not found');
      }

      // Only customer courses are available for sale
      if (course.category !== 'customer_course') {
        return res.status(403).send('This course is not available for purchase');
      }

      // Send the HTML page
      res.sendFile(path.join(__dirname, '../public/course-purchase.html'));
    } catch (error) {
      logger.error('[CoursePurchaseController] Error rendering course page:', error);
      res.status(500).send('Error loading course page');
    }
  }

  /**
   * Get course details for purchase page
   * GET /api/course-purchase/:courseId/details
   */
  async getCourseDetails(req, res) {
    try {
      const { courseId } = req.params;
      
      if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid course ID'
        });
      }

      const course = await ContentCourse.findById(courseId)
        .populate({
          path: 'modules',
          populate: {
            path: 'contents',
            select: 'title contentType order'
          }
        })
        .lean();

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Only customer courses are available for sale
      if (course.category !== 'customer_course') {
        return res.status(403).json({
          success: false,
          message: 'This course is not available for purchase'
        });
      }

      // Check if customer already purchased this course
      // customerId can come from query param or from token in cookie/header
      let customerId = req.query.customerId || null;
      
      // TODO: When customer auth is implemented, extract customerId from token
      // For now, we'll use the query param or token from cookie
      const authToken = req.headers['x-customer-token'] || req.cookies?.customer_token || null;
      if (authToken && !customerId) {
        // In future, decode JWT token to get customerId
        // For now, use token as customerId (temporary solution)
        customerId = authToken;
      }
      
      let alreadyPurchased = false;
      if (customerId) {
        const purchase = await CustomerCoursePurchase.findOne({
          customerId,
          courseId,
          paymentStatus: 'completed',
          accessGranted: true
        });
        alreadyPurchased = !!purchase;
      }

      const coachProfile = await this.buildCoursePresenterProfile(course);

      res.json({
        success: true,
        data: {
          course: {
            _id: course._id,
            title: course.title,
            description: course.description,
            courseType: course.courseType,
            price: course.price,
            currency: course.currency,
            thumbnail: course.thumbnail,
            category: course.courseType,
            modules: course.modules || [],
          funnelsEyeExtras: course.funnelsEyeExtras || {
            headline: '',
            subheadline: '',
            transformationPromise: '',
            coachSupport: '',
            communityAccess: '',
            guarantee: '',
            successMetrics: [],
            bonusResources: [],
            platformTools: []
          },
            workoutSpecificFields: course.workoutSpecificFields,
            mealPlanSpecificFields: course.mealPlanSpecificFields
          },
          alreadyPurchased,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          coachProfile
        }
      });
    } catch (error) {
      logger.error('[CoursePurchaseController] Error getting course details:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching course details',
        error: error.message
      });
    }
  }
  
  async buildCoursePresenterProfile(course) {
    const defaultProfile = {
      name: 'FunnelsEye Official',
      avatar: null,
      headline: 'Official FunnelsEye Program',
      specs: [
        'Expert FunnelsEye curriculum',
        'Backed by the FunnelsEye success team'
      ],
      isVerified: true,
      isOfficial: true
    };

    if (!course || !course.createdBy) {
      return defaultProfile;
    }

    const buildSpecsFromPortfolio = (portfolio = {}) => {
      const specs = [];
      const specializations = Array.isArray(portfolio.specializations)
        ? portfolio.specializations
            .map((item) => item && item.name)
            .filter(Boolean)
        : [];
      if (specializations.length) {
        specs.push(`Specializes in ${specializations.slice(0, 3).join(', ')}`);
      }
      if (portfolio.experienceYears) {
        specs.push(`${portfolio.experienceYears}+ years experience`);
      }
      if (portfolio.totalProjectsCompleted) {
        specs.push(`${portfolio.totalProjectsCompleted}+ clients served`);
      }
      return specs;
    };

    try {
      const coachDoc = await Coach.findById(course.createdBy).lean();
      if (coachDoc) {
        const portfolio = coachDoc.portfolio || {};
        const specs = buildSpecsFromPortfolio(portfolio);
        if (!specs.length && (coachDoc.city || coachDoc.country)) {
          const location = [coachDoc.city, coachDoc.country].filter(Boolean).join(', ');
          if (location) {
            specs.push(location);
          }
        }
        return {
          name: coachDoc.name || 'Accredited Coach',
          avatar:
            coachDoc.profilePictureUrl ||
            (portfolio.profileImages && portfolio.profileImages[0] && portfolio.profileImages[0].url) ||
            null,
          headline: portfolio.headline || coachDoc.bio || 'Certified FunnelsEye Coach',
          specs,
          isVerified: coachDoc.isVerified !== undefined ? coachDoc.isVerified : true,
          isOfficial: false
        };
      }

      const userDoc = await User.findById(course.createdBy).lean();
      if (userDoc) {
        const specs = [];
        if (userDoc.company) {
          specs.push(userDoc.company);
        }
        if (userDoc.city || userDoc.country) {
          specs.push([userDoc.city, userDoc.country].filter(Boolean).join(', '));
        }
        return {
          name: userDoc.name || 'Certified Coach',
          avatar: userDoc.profilePictureUrl || null,
          headline: userDoc.bio || 'Trusted FunnelsEye Coach',
          specs,
          isVerified: userDoc.isVerified !== undefined ? userDoc.isVerified : true,
          isOfficial: false
        };
      }

      const adminDoc = await AdminUser.findById(course.createdBy).lean();
      if (adminDoc) {
        const specs = [
          'Expert FunnelsEye curriculum',
          'Premium automation playbooks'
        ];
        return {
          name: 'FunnelsEye Official',
          avatar: adminDoc.profile?.avatar || null,
          headline: 'Official FunnelsEye Program',
          specs,
          isVerified: true,
          isOfficial: true
        };
      }
    } catch (error) {
      logger.error('[CoursePurchaseController] Error building course presenter profile:', error);
    }

    return defaultProfile;
  }

  /**
   * Create Razorpay order for course purchase
   * POST /api/course-purchase/:courseId/create-order
   */
  async createOrder(req, res) {
    try {
      if (!this.razorpay) {
        return res.status(500).json({
          success: false,
          message: 'Payment gateway not configured'
        });
      }

      const { courseId } = req.params;
      const { customerEmail, customerName, customerPhone, customerId } = req.body;

      if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid course ID'
        });
      }

      if (!customerEmail) {
        return res.status(400).json({
          success: false,
          message: 'Customer email is required'
        });
      }

      // Get course details
      const course = await ContentCourse.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Only customer courses are available for sale
      if (course.category !== 'customer_course') {
        return res.status(403).json({
          success: false,
          message: 'This course is not available for purchase'
        });
      }

      // Check if already purchased
      if (customerId) {
        const existingPurchase = await CustomerCoursePurchase.findOne({
          customerId,
          courseId,
          paymentStatus: 'completed',
          accessGranted: true
        });
        if (existingPurchase) {
          return res.status(400).json({
            success: false,
            message: 'You already have access to this course'
          });
        }
      }

      // Calculate amount in paise (Razorpay expects amount in smallest currency unit)
      // For INR, it's paise. For USD, it's cents (multiply by 100)
      const amountInSmallestUnit = Math.round(course.price * 100);

      // Create receipt ID (Razorpay limit: 40 characters max)
      // Format: C{last8ofCourseId}{timestamp} = max 1 + 8 + 10 = 19 chars
      const courseIdStr = courseId.toString();
      const shortCourseId = courseIdStr.slice(-8); // Last 8 chars of ObjectId
      const timestamp = Date.now().toString().slice(-10); // Last 10 digits of timestamp
      const receiptId = `C${shortCourseId}${timestamp}`; // Max 19 characters

      // Create Razorpay order
      const orderOptions = {
        amount: amountInSmallestUnit,
        currency: course.currency,
        receipt: receiptId,
        notes: {
          courseId: courseId.toString(),
          customerEmail,
          customerName: customerName || '',
          customerPhone: customerPhone || '',
          customerId: customerId || '',
          businessType: 'course_purchase'
        }
      };

      const razorpayOrder = await this.razorpay.orders.create(orderOptions);

      // Create purchase record
      const purchase = new CustomerCoursePurchase({
        courseId,
        customerId: customerId || `guest_${Date.now()}`,
        customerEmail,
        customerName: customerName || '',
        customerPhone: customerPhone || '',
        razorpayOrderId: razorpayOrder.id,
        amount: course.price,
        currency: course.currency,
        paymentStatus: 'pending',
        courseSnapshot: {
          title: course.title,
          description: course.description,
          courseType: course.courseType,
          price: course.price,
          currency: course.currency,
          thumbnail: course.thumbnail
        }
      });

      await purchase.save();

      logger.info(`[CoursePurchaseController] Order created: ${razorpayOrder.id} for course: ${courseId}`);

      res.json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: process.env.RAZORPAY_KEY_ID,
          purchaseId: purchase._id
        }
      });
    } catch (error) {
      logger.error('[CoursePurchaseController] Error creating order:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating order',
        error: error.message
      });
    }
  }

  /**
   * Verify payment and grant access
   * POST /api/course-purchase/verify-payment
   */
  async verifyPayment(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, purchaseId } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !purchaseId) {
        return res.status(400).json({
          success: false,
          message: 'Missing payment verification details'
        });
      }

      // Get purchase record
      const purchase = await CustomerCoursePurchase.findById(purchaseId);
      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: 'Purchase record not found'
        });
      }

      // Verify signature
      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        logger.warn(`[CoursePurchaseController] Invalid signature for order: ${razorpay_order_id}`);
        purchase.paymentStatus = 'failed';
        await purchase.save();
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed'
        });
      }

      // Update purchase record
      purchase.razorpayPaymentId = razorpay_payment_id;
      purchase.razorpaySignature = razorpay_signature;
      purchase.paymentStatus = 'completed';
      purchase.accessGranted = true;
      purchase.accessGrantedAt = new Date();
      await purchase.save();

      logger.info(`[CoursePurchaseController] Payment verified and access granted for purchase: ${purchaseId}`);

      res.json({
        success: true,
        message: 'Payment verified successfully. Access granted!',
        data: {
          purchaseId: purchase._id,
          courseId: purchase.courseId,
          accessGranted: true
        }
      });
    } catch (error) {
      logger.error('[CoursePurchaseController] Error verifying payment:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying payment',
        error: error.message
      });
    }
  }

  /**
   * Razorpay webhook handler
   * POST /api/course-purchase/webhook
   */
  async handleWebhook(req, res) {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers['x-razorpay-signature'];

      if (!webhookSecret || !signature) {
        logger.warn('[CoursePurchaseController] Webhook secret or signature missing');
        return res.status(400).send('Missing webhook credentials');
      }

      // Verify webhook signature
      const text = JSON.stringify(req.body);
      const generatedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(text)
        .digest('hex');

      if (generatedSignature !== signature) {
        logger.warn('[CoursePurchaseController] Invalid webhook signature');
        return res.status(400).send('Invalid signature');
      }

      const event = req.body.event;
      const payment = req.body.payload.payment?.entity;
      const order = req.body.payload.order?.entity;

      if (event === 'payment.captured' && payment && order) {
        // Find purchase by order ID
        const purchase = await CustomerCoursePurchase.findOne({
          razorpayOrderId: order.id
        });

        if (purchase && purchase.paymentStatus !== 'completed') {
          purchase.razorpayPaymentId = payment.id;
          purchase.paymentStatus = 'completed';
          purchase.accessGranted = true;
          purchase.accessGrantedAt = new Date();
          await purchase.save();

          logger.info(`[CoursePurchaseController] Webhook: Access granted for purchase: ${purchase._id}`);
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      logger.error('[CoursePurchaseController] Error handling webhook:', error);
      res.status(500).send('Webhook processing failed');
    }
  }

  /**
   * Get customer's purchased courses
   * GET /api/course-purchase/customer/:customerId/courses
   */
  async getCustomerCourses(req, res) {
    try {
      const { customerId } = req.params;

      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: 'Customer ID is required'
        });
      }

      const purchases = await CustomerCoursePurchase.getCustomerCourses(customerId);

      res.json({
        success: true,
        data: {
          courses: purchases.map(p => ({
            purchase: {
              _id: p._id,
              purchasedAt: p.purchasedAt,
              amount: p.amount,
              currency: p.currency
            },
            course: p.courseId
          }))
        }
      });
    } catch (error) {
      logger.error('[CoursePurchaseController] Error getting customer courses:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching customer courses',
        error: error.message
      });
    }
  }

  /**
   * Check if customer has access to a course
   * GET /api/course-purchase/check-access/:courseId
   */
  async checkAccess(req, res) {
    try {
      const { courseId } = req.params;
      let customerId = req.query.customerId || null;
      
      // Try to get customerId from token in cookie/header
      const authToken = req.headers['x-customer-token'] || req.cookies?.customer_token || null;
      if (authToken && !customerId) {
        // In future, decode JWT token to get customerId
        // For now, use token as customerId (temporary solution)
        customerId = authToken;
      }

      if (!customerId) {
        return res.json({
          success: true,
          data: { hasAccess: false }
        });
      }

      const hasAccess = await CustomerCoursePurchase.hasAccess(customerId, courseId);

      res.json({
        success: true,
        data: { hasAccess }
      });
    } catch (error) {
      logger.error('[CoursePurchaseController] Error checking access:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking access',
        error: error.message
      });
    }
  }
}

module.exports = new CoursePurchaseController();

