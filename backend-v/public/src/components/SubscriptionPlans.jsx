// SubscriptionPlans.jsx - Subscription plan management component
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  BarChart3,
  Star,
  CheckCircle,
  Loader2,
  X,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import adminApiService from '../services/adminApiService';

const defaultFeatures = {
      aiFeatures: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customDomain: false,
      apiAccess: false,
      whiteLabel: false,
      integrations: [],
      customBranding: false,
      advancedReporting: false,
      webhooks: false,
      whatsappAutomation: false,
      emailAutomation: false
};

const defaultLimits = {
      maxFunnels: 5,
      maxStaff: 2,
      maxDevices: 1,
      automationRules: 10,
      emailCredits: 1000,
      smsCredits: 100,
      storageGB: 10,
      maxLeads: 100,
      maxAppointments: 50,
      maxCampaigns: 5
};

const defaultCourseAccess = {
  allowCourseLibrary: false,
  allowResell: false,
  allowContentRemix: false,
  allowCustomPricing: false,
  allowCourseAssetDownload: false,
  includeMarketingKits: false,
  maxActiveResellCourses: 0,
  defaultRevenueSharePercent: 0,
  minMarkupPercent: 0,
  maxMarkupPercent: 0,
  resellPayoutFrequency: 'monthly',
  allowCouponCreation: false,
  allowPrivateBundles: false
};

const defaultAddons = {
  allowAddonPurchases: false,
  availableAddons: []
};

const createDefaultPlanForm = () => ({
  name: '',
  description: '',
  price: 0,
  currency: 'INR',
  billingCycle: 'monthly',
  duration: 1,
  features: { ...defaultFeatures },
  limits: { ...defaultLimits },
  courseAccess: { ...defaultCourseAccess },
  courseBundles: [],
  addons: {
    ...defaultAddons,
    availableAddons: []
  },
  restrictions: {},
  pricing: {
    annualDiscount: 0
    },
    isPopular: false,
    trialDays: 0,
    setupFee: 0,
    sortOrder: 0,
    category: 'professional',
    tags: [],
    isActive: true
  });

const SubscriptionPlans = () => {
  // State management
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Analytics
  const [analytics, setAnalytics] = useState(null);
  
  // Form state
  const [planForm, setPlanForm] = useState(createDefaultPlanForm());
  const [availableCourses, setAvailableCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseLoadError, setCourseLoadError] = useState('');
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [isCourseSelectorOpen, setIsCourseSelectorOpen] = useState(false);

  const mergedCourses = useMemo(() => {
    const base = Array.isArray(availableCourses) ? availableCourses : [];
    const baseIds = new Set(base.map((course) => course._id));
    const additional = (planForm.courseBundles || [])
      .filter((bundle) => bundle.course && !baseIds.has(bundle.course))
      .map((bundle) => ({
        _id: bundle.course,
        title: bundle.courseTitle || 'Included Course',
        thumbnail: bundle.courseThumbnail || '',
        price: bundle.suggestedResellPrice || 0,
        category: 'customer_course'
      }));
    return [...base, ...additional];
  }, [availableCourses, planForm.courseBundles]);

  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) {
      return mergedCourses;
    }
    const query = courseSearch.toLowerCase();
    return mergedCourses.filter((course) =>
      (course.title || '').toLowerCase().includes(query)
    );
  }, [mergedCourses, courseSearch]);

  // Load subscription plans
  const loadPlans = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit: 20,
        sortBy: 'sortOrder',
        sortOrder: 'asc'
      };
      
      
      console.log('🔍 [Frontend] Loading plans with params:', params);
      const response = await adminApiService.getSubscriptionPlans(params);
      
      //console.log('Full API response:', response);
      
      if (response.success) {
        //console.log('Response data:', response.data);
        //console.log('Plans array:', response.data.plans);
        //console.log('Pagination:', response.data.pagination);
        
        setPlans(response.data.plans || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalItems || 0);
        //console.log('Plans loaded successfully:', response.data);
      } else {
        console.error('API returned error:', response);
        setError(response.message || 'Failed to load subscription plans');
      }
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      setError('Failed to load subscription plans: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableCourses = async () => {
    try {
      if (coursesLoading) return;
      setCoursesLoading(true);
      setCourseLoadError('');

      const categories = ['customer_course', 'coach_course'];
      const responses = await Promise.all(
        categories.map((category) =>
          adminApiService.getAdminCourses({ category, limit: 200, status: 'published' }).catch(err => {
            console.error(`Error loading ${category}:`, err);
            return { success: false, data: { courses: [] } };
          })
        )
      );

      let combined = [];
      let anySuccess = false;

      responses.forEach((response, index) => {
        if (response && response.success) {
          anySuccess = true;
          const list = response.data?.courses || response.data?.items || response.data || [];
          if (Array.isArray(list)) {
            // Ensure each course has the category set
            const coursesWithCategory = list.map(course => ({
              ...course,
              category: categories[index] || course.category || 'customer_course'
            }));
            combined = combined.concat(coursesWithCategory);
          }
        }
      });

      if (!anySuccess) {
        setCourseLoadError('Failed to load courses. Please try again.');
      } else if (combined.length === 0) {
        setCourseLoadError('No courses found. Create courses first in the Courses section.');
      }

      const deduped = [];
      const seen = new Set();
      combined.forEach((course) => {
        const id = course._id || course.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          deduped.push({
            ...course,
            category: course.category || 'customer_course'
          });
        }
      });

      setAvailableCourses(deduped);
      setCoursesLoaded(true);
    } catch (error) {
      console.error('Error loading admin courses:', error);
      setCourseLoadError(error.message || 'Failed to load admin courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const response = await adminApiService.getSubscriptionPlanAnalytics({ timeRange: 30 });
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  // Debug function
  const debugSubscriptionPlans = async () => {
    try {
      console.log('🔍 [DEBUG] Testing subscription plans debug endpoint...');
      const response = await adminApiService.debugSubscriptionPlans();
      console.log('🔍 [DEBUG] Debug response:', response);
      
      if (response.success) {
        console.log('🔍 [DEBUG] Debug data:', response.debug);
        setSuccess('Debug completed - check console for details');
      } else {
        setError('Debug failed: ' + response.error);
      }
    } catch (error) {
      console.error('🔍 [DEBUG] Debug error:', error);
      setError('Debug failed: ' + error.message);
    }
  };

  // Create new plan
  const handleCreatePlan = async () => {
    try {
      // Validate required fields
      if (!planForm.name?.trim() || !planForm.description?.trim() || !planForm.price || !planForm.billingCycle || !planForm.duration) {
        setError('Please fill in all required fields: Name, Description, Price, Billing Cycle, and Duration');
        return;
      }

      const courseAccessPayload = {
        ...planForm.courseAccess,
        maxActiveResellCourses: parseInt(planForm.courseAccess.maxActiveResellCourses) || 0,
        defaultRevenueSharePercent: parseFloat(planForm.courseAccess.defaultRevenueSharePercent) || 0,
        minMarkupPercent: parseFloat(planForm.courseAccess.minMarkupPercent) || 0,
        maxMarkupPercent: parseFloat(planForm.courseAccess.maxMarkupPercent) || 0
      };

      const courseBundlesPayload = (planForm.courseBundles || []).map((bundle) => ({
        course: bundle.course,
        allowResell: bundle.allowResell,
        allowContentRemix: bundle.allowContentRemix,
        allowCustomPricing: bundle.allowCustomPricing,
        suggestedResellPrice: bundle.suggestedResellPrice === '' ? undefined : parseFloat(bundle.suggestedResellPrice),
        minimumResellPrice: bundle.minimumResellPrice === '' ? undefined : parseFloat(bundle.minimumResellPrice),
        maximumResellPrice: bundle.maximumResellPrice === '' ? undefined : parseFloat(bundle.maximumResellPrice),
        marketingKitIncluded: bundle.marketingKitIncluded,
        marketingAssets: bundle.marketingAssets || [],
        includedModules: bundle.includedModules || [],
        deliveryNotes: bundle.deliveryNotes || ''
      }));

      const addonsPayload = {
        allowAddonPurchases: planForm.addons.allowAddonPurchases,
        availableAddons: planForm.addons.allowAddonPurchases
          ? (planForm.addons.availableAddons || []).map((addon) => ({
              name: addon.name || '',
              description: addon.description || '',
              price: parseFloat(addon.price) || 0,
              billingCycle: addon.billingCycle || 'one-time'
            }))
          : []
      };

      // Prepare form data
      const formData = {
        name: planForm.name.trim(),
        description: planForm.description.trim(),
        price: parseFloat(planForm.price),
        currency: planForm.currency,
        billingCycle: planForm.billingCycle,
        duration: parseInt(planForm.duration),
        features: planForm.features,
        limits: planForm.limits,
        courseAccess: courseAccessPayload,
        courseBundles: courseBundlesPayload,
        addons: addonsPayload,
        isPopular: planForm.isPopular,
        trialDays: parseInt(planForm.trialDays) || 0,
        setupFee: parseFloat(planForm.setupFee) || 0,
        sortOrder: parseInt(planForm.sortOrder) || 0,
        category: planForm.category,
        tags: planForm.tags || [],
        isActive: planForm.isActive,
        pricing: {
          annualDiscount: parseFloat(planForm.pricing?.annualDiscount) || 0,
          currency: planForm.currency
        },
        restrictions: planForm.restrictions || {}
      };

      //console.log('Creating plan with data:', formData);
      const response = await adminApiService.createSubscriptionPlan(formData);
      
      if (response.success) {
        setSuccess('Subscription plan created successfully!');
        setIsCreateDialogOpen(false);
        resetForm();
        loadPlans();
        setError('');
      } else {
        setError(response.message || 'Failed to create subscription plan');
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      setError('Failed to create subscription plan: ' + error.message);
    }
  };

  // Update plan
  const handleUpdatePlan = async () => {
    try {
      if (!selectedPlan?._id) {
        setError('No plan selected for update');
        return;
      }

      // Validate required fields
      if (!planForm.name?.trim() || !planForm.description?.trim() || !planForm.price || !planForm.billingCycle || !planForm.duration) {
        setError('Please fill in all required fields: Name, Description, Price, Billing Cycle, and Duration');
        return;
      }

      // Prepare form data
      const formData = {
        name: planForm.name.trim(),
        description: planForm.description.trim(),
        price: parseFloat(planForm.price),
        currency: planForm.currency,
        billingCycle: planForm.billingCycle,
        duration: parseInt(planForm.duration),
        features: planForm.features,
        limits: planForm.limits,
        isPopular: planForm.isPopular,
        trialDays: parseInt(planForm.trialDays) || 0,
        setupFee: parseFloat(planForm.setupFee) || 0,
        sortOrder: parseInt(planForm.sortOrder) || 0,
        category: planForm.category,
        tags: planForm.tags || [],
        isActive: planForm.isActive
      };

      //console.log('Updating plan with data:', formData);
      const response = await adminApiService.updateSubscriptionPlan(selectedPlan._id, formData);
      
      if (response.success) {
        setSuccess('Subscription plan updated successfully!');
        setIsEditDialogOpen(false);
        resetForm();
        loadPlans();
        setError('');
      } else {
        setError(response.message || 'Failed to update subscription plan');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      setError('Failed to update subscription plan: ' + error.message);
    }
  };

  // Delete plan
  const handleDeletePlan = async () => {
    try {
      if (!selectedPlan?._id) {
        setError('No plan selected for deletion');
        return;
      }

      const response = await adminApiService.deleteSubscriptionPlan(selectedPlan._id);
      
      if (response.success) {
        setSuccess('Subscription plan deleted successfully!');
        setIsDeleteDialogOpen(false);
        setSelectedPlan(null);
        loadPlans();
        setError('');
      } else {
        setError(response.message || 'Failed to delete subscription plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      setError('Failed to delete subscription plan: ' + error.message);
    }
  };

  // Toggle plan status
  const handleToggleStatus = async (planId) => {
    try {
      const response = await adminApiService.toggleSubscriptionPlanStatus(planId);
      
      if (response.success) {
        setSuccess('Plan status updated successfully!');
        loadPlans();
        setError('');
      } else {
        setError(response.message || 'Failed to toggle plan status');
      }
    } catch (error) {
      console.error('Error toggling plan status:', error);
      setError('Failed to toggle plan status: ' + error.message);
    }
  };

  // Duplicate plan
  const handleDuplicatePlan = async (planId) => {
    try {
      const response = await adminApiService.duplicateSubscriptionPlan(planId);
      
      if (response.success) {
        setSuccess('Plan duplicated successfully!');
        loadPlans();
        setError('');
      } else {
        setError(response.message || 'Failed to duplicate plan');
      }
    } catch (error) {
      console.error('Error duplicating plan:', error);
      setError('Failed to duplicate plan: ' + error.message);
    }
  };

  // Reset form
  const resetForm = () => {
    setPlanForm(createDefaultPlanForm());
  };

  // Edit plan
  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    // Map features to limits (since schema stores maxFunnels, maxStaff, etc. in features but UI shows in limits)
    const normalizedLimits = {
      ...defaultLimits,
      ...(plan.limits || {}),
      // Map from features to limits for UI display
      maxFunnels: plan.features?.maxFunnels !== undefined ? plan.features.maxFunnels : (plan.limits?.maxFunnels ?? defaultLimits.maxFunnels),
      maxStaff: plan.features?.maxStaff !== undefined ? plan.features.maxStaff : (plan.limits?.maxStaff ?? defaultLimits.maxStaff),
      maxDevices: plan.features?.maxDevices !== undefined ? plan.features.maxDevices : (plan.limits?.maxDevices ?? defaultLimits.maxDevices),
      automationRules: plan.features?.automationRules !== undefined ? plan.features.automationRules : (plan.limits?.automationRules ?? defaultLimits.automationRules),
      emailCredits: plan.features?.emailCredits !== undefined ? plan.features.emailCredits : (plan.limits?.emailCredits ?? defaultLimits.emailCredits),
      smsCredits: plan.features?.smsCredits !== undefined ? plan.features.smsCredits : (plan.limits?.smsCredits ?? defaultLimits.smsCredits),
      storageGB: plan.features?.storageGB !== undefined ? plan.features.storageGB : (plan.limits?.storageGB ?? defaultLimits.storageGB)
    };
    // Remove limit fields from features for UI
    const { maxFunnels, maxStaff, maxDevices, automationRules, emailCredits, smsCredits, storageGB, ...cleanFeatures } = plan.features || {};
    const normalizedFeatures = { ...defaultFeatures, ...cleanFeatures };
    const normalizedCourseAccess = { ...defaultCourseAccess, ...(plan.courseAccess || {}) };
    const normalizedAddons = {
      ...defaultAddons,
      ...(plan.addons || {}),
      availableAddons: Array.isArray(plan.addons?.availableAddons)
        ? plan.addons.availableAddons.map((addon) => ({
            name: addon.name || '',
            description: addon.description || '',
            price: addon.price || 0,
            billingCycle: addon.billingCycle || 'one-time'
          }))
        : []
    };

    const normalizedBundles = Array.isArray(plan.courseBundles)
      ? plan.courseBundles.map((bundle) => ({
          course: bundle.course?._id || bundle.course,
          courseTitle: bundle.course?.title || bundle.courseTitle || '',
          courseThumbnail: bundle.course?.thumbnail || bundle.courseThumbnail || '',
          allowResell: bundle.allowResell !== undefined ? bundle.allowResell : true,
          allowContentRemix: bundle.allowContentRemix !== undefined ? bundle.allowContentRemix : true,
          allowCustomPricing: bundle.allowCustomPricing !== undefined ? bundle.allowCustomPricing : true,
          suggestedResellPrice: bundle.suggestedResellPrice ?? '',
          minimumResellPrice: bundle.minimumResellPrice ?? '',
          maximumResellPrice: bundle.maximumResellPrice ?? '',
          marketingKitIncluded: bundle.marketingKitIncluded !== undefined ? bundle.marketingKitIncluded : false,
          marketingAssets: Array.isArray(bundle.marketingAssets) ? bundle.marketingAssets : [],
          includedModules: Array.isArray(bundle.includedModules) ? bundle.includedModules : [],
          deliveryNotes: bundle.deliveryNotes || ''
        }))
      : [];

    setPlanForm({
      name: plan.name || '',
      description: plan.description || '',
      price: plan.price || 0,
      currency: plan.currency || 'INR',
      billingCycle: plan.billingCycle || 'monthly',
      duration: plan.duration || 1,
      features: normalizedFeatures,
      limits: normalizedLimits,
      courseAccess: normalizedCourseAccess,
      courseBundles: normalizedBundles,
      addons: normalizedAddons,
      restrictions: plan.restrictions || {},
      pricing: {
        annualDiscount: plan.pricing?.annualDiscount || 0
      },
      isPopular: plan.isPopular || false,
      trialDays: plan.trialDays || 0,
      setupFee: plan.setupFee || 0,
      sortOrder: plan.sortOrder || 0,
      category: plan.category || 'professional',
      tags: plan.tags || [],
      isActive: plan.isActive !== undefined ? plan.isActive : true
    });
    setIsEditDialogOpen(true);
  };

  // Format currency
  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    return status ? 'default' : 'destructive';
  };

  // Clear messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Effects
  useEffect(() => {
    loadPlans();
  }, [currentPage]);

  useEffect(() => {
    const timer = setTimeout(clearMessages, 5000);
    return () => clearTimeout(timer);
  }, [error, success]);

  useEffect(() => {
    if ((isCreateDialogOpen || isEditDialogOpen) && !coursesLoaded) {
      loadAvailableCourses();
    }
  }, [isCreateDialogOpen, isEditDialogOpen, coursesLoaded]);

  const createBundleForCourse = (course) => ({
    course: course._id,
    courseTitle: course.title || '',
    courseThumbnail: course.thumbnail || '',
    courseCategory: course.category || '',
    allowResell: true,
    allowContentRemix: true,
    allowCustomPricing: true,
    suggestedResellPrice: course.price || '',
    minimumResellPrice: '',
    maximumResellPrice: '',
    marketingKitIncluded: false,
    marketingAssets: [],
    includedModules: [],
    deliveryNotes: ''
  });

  const handleCourseBundleToggle = (course, checked) => {
    setPlanForm((prev) => {
      const existing = prev.courseBundles || [];
      if (checked) {
        if (existing.some((bundle) => bundle.course === course._id)) {
          return prev;
        }
        return {
          ...prev,
          courseBundles: [...existing, createBundleForCourse(course)]
        };
      }
      return {
        ...prev,
        courseBundles: existing.filter((bundle) => bundle.course !== course._id)
      };
    });
  };

  const removeCourseBundle = (courseId) => {
    setPlanForm((prev) => ({
      ...prev,
      courseBundles: (prev.courseBundles || []).filter((bundle) => bundle.course !== courseId)
    }));
  };

  const getCourseBundle = (courseId) => {
    return (planForm.courseBundles || []).find((bundle) => bundle.course === courseId);
  };

  const handleCourseBundleChange = (courseId, field, value) => {
    setPlanForm((prev) => ({
      ...prev,
      courseBundles: (prev.courseBundles || []).map((bundle) =>
        bundle.course === courseId ? { ...bundle, [field]: value } : bundle
      )
    }));
  };

  const updateCourseBundle = (courseId, field, value) => {
    setPlanForm((prev) => ({
      ...prev,
      courseBundles: (prev.courseBundles || []).map((bundle) =>
        bundle.course === courseId ? { ...bundle, [field]: value } : bundle
      )
    }));
  };

  const updateCourseBundleArrayField = (courseId, field, rawValue) => {
    const items = rawValue
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
    updateCourseBundle(courseId, field, items);
  };

  const addNewAddon = () => {
    setPlanForm((prev) => ({
      ...prev,
      addons: {
        ...prev.addons,
        availableAddons: [
          ...(prev.addons?.availableAddons || []),
          { name: '', description: '', price: 0, billingCycle: 'one-time' }
        ]
      }
    }));
  };

  const updateAddonField = (index, field, value) => {
    setPlanForm((prev) => ({
      ...prev,
      addons: {
        ...prev.addons,
        availableAddons: prev.addons.availableAddons.map((addon, i) =>
          i === index ? { ...addon, [field]: value } : addon
        )
      }
    }));
  };

  const removeAddon = (index) => {
    setPlanForm((prev) => ({
      ...prev,
      addons: {
        ...prev.addons,
        availableAddons: prev.addons.availableAddons.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600 mt-1">Manage platform subscription plans and pricing</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsAnalyticsDialogOpen(true);
              loadAnalytics();
            }}
            className="border-gray-300"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}


      {/* Subscription Plans */}
      <div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-6 animate-pulse" style={{ borderRadius: '8px' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full"></div>
                      <div className="h-5 w-14 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                </div>
                <div className="mb-6">
                  <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2"></div>
                  <div className="h-5 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 h-10 bg-gradient-to-r from-blue-200 to-blue-300 rounded-lg"></div>
                  <div className="flex-1 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BarChart3 className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscription plans found</h3>
            <p className="text-gray-500">Create your first subscription plan to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-4 overflow-hidden"
                style={{ borderRadius: '8px' }}
              >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400 to-purple-500 rounded-full -translate-y-12 translate-x-12"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full translate-y-10 -translate-x-10"></div>
                </div>

                <div className="relative z-10">
                  {/* Header with status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                        {plan.isPopular && (
                          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Popular
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{plan.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700"
                        >
                          {plan.category}
                        </Badge>
                        <Badge
                          variant={plan.isActive ? "default" : "secondary"}
                          className={plan.isActive ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300" : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"}
                        >
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          setSelectedPlan(plan);
                          setIsDeleteDialogOpen(true);
                        }}
                        variant="ghost"
                        size="sm"
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Switch
                        checked={plan.isActive}
                        onCheckedChange={() => handleToggleStatus(plan._id)}
                        className={`scale-60 ${
                          plan.isActive
                            ? 'data-[state=checked]:bg-[#16a34a]'
                            : 'data-[state=unchecked]:bg-[#dc2626]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {formatCurrency(plan.price, plan.currency)}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">/month</span>
                    </div>
                    {plan.setupFee > 0 && (
                      <p className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-md inline-block">
                        +{formatCurrency(plan.setupFee, plan.currency)} setup fee
                      </p>
                    )}
                  </div>

                  {/* Total Coaches */}
                  <div className="mb-4">
                    <div className="text-left">
                      <div className="text-lg font-semibold text-gray-800 mb-1">
                        {plan.enrolledCoaches || 0} Coaches
                      </div>
                      <div className="text-sm text-gray-600">Total Subscriptions</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 h-8"
                      style={{ borderRadius: '5px' }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      <span className="text-sm font-medium">Edit Plan</span>
                    </Button>
                    <Button
                      onClick={() => handleDuplicatePlan(plan._id)}
                      variant="outline"
                      className="flex-1 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200 h-8"
                      style={{ borderRadius: '5px' }}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      <span className="text-sm font-medium">Duplicate</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Plan Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent
          className="max-w-6xl p-0 overflow-hidden"
          style={{ width: '90vw', maxWidth: '1200px', height: '85vh' }}
        >
          <div className="flex h-full flex-col bg-white">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white">
              <DialogTitle className="text-2xl font-semibold text-slate-900">
                Create New Subscription Plan
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Configure the plan details, included features, and bundled courses in a few simple steps.
            </DialogDescription>
          </DialogHeader>
          
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <Tabs defaultValue="basic" className="w-full h-full">
                <TabsList className="flex flex-wrap gap-2 rounded-full bg-slate-100/70 p-1">
                  <TabsTrigger value="basic" className="px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium">
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="features" className="px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium">
                    Features
                  </TabsTrigger>
                  <TabsTrigger value="limits" className="px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium">
                    Limits
                  </TabsTrigger>
                  <TabsTrigger value="courses" className="px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium">
                    Courses
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium">
                    Advanced
                  </TabsTrigger>
            </TabsList>
            
                <TabsContent value="basic" className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                    placeholder="e.g., Professional Plan"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={planForm.category} onValueChange={(value) => setPlanForm({...planForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                  placeholder="Plan description..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({...planForm, price: parseFloat(e.target.value) || 0})}
                    placeholder="99.99"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={planForm.currency} onValueChange={(value) => setPlanForm({...planForm, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="billingCycle">Billing Cycle *</Label>
                  <Select value={planForm.billingCycle} onValueChange={(value) => setPlanForm({...planForm, billingCycle: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="duration">Duration (months) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={planForm.duration}
                  onChange={(e) => setPlanForm({...planForm, duration: parseInt(e.target.value) || 1})}
                  placeholder="1"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="space-y-6 pt-6">
              
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Automation & AI</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { id: 'aiFeatures', label: 'AI Features', key: 'aiFeatures' },
                    { id: 'whatsappAutomation', label: 'WhatsApp Automation', key: 'whatsappAutomation' },
                    { id: 'emailAutomation', label: 'Email Automation', key: 'emailAutomation' }
                  ].map(({ id, label, key }) => (
                    <div className="flex items-center space-x-2" key={id}>
                    <Switch
                        id={id}
                      className="h-6 w-11"
                        checked={planForm.features[key]}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                          features: { ...planForm.features, [key]: checked }
                      })}
                    />
                      <Label htmlFor={id}>{label}</Label>
                  </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Support</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { id: 'prioritySupport', label: 'Priority Support', key: 'prioritySupport' }
                  ].map(({ id, label, key }) => (
                    <div className="flex items-center space-x-2" key={id}>
                    <Switch
                        id={id}
                      className="h-6 w-11"
                        checked={planForm.features[key]}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                          features: { ...planForm.features, [key]: checked }
                      })}
                    />
                      <Label htmlFor={id}>{label}</Label>
                  </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Branding & Integrations</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { id: 'customDomain', label: 'Custom Domain', key: 'customDomain' },
                    { id: 'customBranding', label: 'Custom Branding', key: 'customBranding' },
                    { id: 'whiteLabel', label: 'White Label', key: 'whiteLabel' },
                    { id: 'apiAccess', label: 'API Access', key: 'apiAccess' },
                    { id: 'webhooks', label: 'Webhooks', key: 'webhooks' },
                    { id: 'advancedReporting', label: 'Advanced Reporting', key: 'advancedReporting' }
                  ].map(({ id, label, key }) => (
                    <div className="flex items-center space-x-2" key={id}>
                    <Switch
                        id={id}
                      className="h-6 w-11"
                        checked={planForm.features[key]}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                          features: { ...planForm.features, [key]: checked }
                      })}
                    />
                      <Label htmlFor={id}>{label}</Label>
                  </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Label htmlFor="integrations">Supported Integrations (comma separated)</Label>
                  <Textarea
                    id="integrations"
                    rows={2}
                    value={(planForm.features.integrations || []).join(', ')}
                    onChange={(e) => setPlanForm({
                      ...planForm,
                      features: { ...planForm.features, integrations: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) }
                    })}
                    placeholder="zapier, webhook, slack..."
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="limits" className="space-y-4 pt-6">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Core Resources</h4>
                <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="maxFunnels">Max Funnels</Label>
                  <Input
                    id="maxFunnels"
                    type="number"
                      value={planForm.limits.maxFunnels}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                        limits: { ...planForm.limits, maxFunnels: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxStaff">Max Staff</Label>
                  <Input
                    id="maxStaff"
                    type="number"
                      value={planForm.limits.maxStaff}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                        limits: { ...planForm.limits, maxStaff: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxDevices">Max Devices</Label>
                  <Input
                    id="maxDevices"
                    type="number"
                      value={planForm.limits.maxDevices}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                        limits: { ...planForm.limits, maxDevices: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                </div>
              </div>

                <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Automation & Credits</h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="automationRules">Automation Rules</Label>
                  <Input
                      id="automationRules"
                    type="number"
                      value={planForm.limits.automationRules}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                        limits: { ...planForm.limits, automationRules: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                  <div>
                    <Label htmlFor="emailCredits">Email Credits</Label>
                    <Input
                      id="emailCredits"
                      type="number"
                      value={planForm.limits.emailCredits}
                      onChange={(e) => setPlanForm({
                        ...planForm, 
                        limits: { ...planForm.limits, emailCredits: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smsCredits">SMS Credits</Label>
                    <Input
                      id="smsCredits"
                      type="number"
                      value={planForm.limits.smsCredits}
                      onChange={(e) => setPlanForm({
                        ...planForm, 
                        limits: { ...planForm.limits, smsCredits: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="storageGB">Storage (GB)</Label>
                    <Input
                      id="storageGB"
                      type="number"
                      value={planForm.limits.storageGB}
                      onChange={(e) => setPlanForm({
                        ...planForm, 
                        limits: { ...planForm.limits, storageGB: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  </div>
                  </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Business Operations</h4>
                <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="maxLeads">Max Leads</Label>
                  <Input
                    id="maxLeads"
                    type="number"
                    value={planForm.limits.maxLeads}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                        limits: { ...planForm.limits, maxLeads: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxAppointments">Max Appointments</Label>
                  <Input
                    id="maxAppointments"
                    type="number"
                    value={planForm.limits.maxAppointments}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                        limits: { ...planForm.limits, maxAppointments: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxCampaigns">Max Campaigns</Label>
                  <Input
                    id="maxCampaigns"
                    type="number"
                    value={planForm.limits.maxCampaigns}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                        limits: { ...planForm.limits, maxCampaigns: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                </div>
              </div>

              <p className="text-xs text-gray-500">Use -1 for unlimited access.</p>
            </TabsContent>
            
            <TabsContent value="courses" className="space-y-4 pt-6">
                <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Included Courses</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Select courses from the platform's library to include in this subscription plan. Coaches subscribed to this plan will gain access to these courses based on the permissions you set.
                </p>
                
                <div className="flex items-center gap-2 mb-4">
                  <Input
                    placeholder="Search courses..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={loadAvailableCourses} disabled={coursesLoading}>
                    {coursesLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {coursesLoading ? 'Loading...' : 'Load Courses'}
                  </Button>
                </div>

                {courseLoadError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{courseLoadError}</AlertDescription>
                  </Alert>
                )}

                {coursesLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No courses found.</p>
                    <p className="text-sm">Click "Load Courses" to fetch available courses from the platform.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] w-full rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                    <div className="space-y-4">
                      {/* Group courses by category */}
                      {['customer_course', 'coach_course'].map((category) => {
                        const categoryCourses = filteredCourses.filter((course) => 
                          (course.category || 'customer_course') === category
                        );
                        
                        if (categoryCourses.length === 0) return null;
                        
                        return (
                          <div key={category} className="space-y-3">
                            <h5 className="font-semibold text-sm text-gray-600 border-b pb-2">
                              {category === 'customer_course' ? 'Customer Courses' : 'Coach Courses'} ({categoryCourses.length})
                            </h5>
                            <div className="grid grid-cols-1 gap-3">
                              {categoryCourses.map((course) => {
                                const bundle = getCourseBundle(course._id);
                                const isCourseIncluded = !!bundle;
                                
                                return (
                                  <Card
                                    key={course._id}
                                    className="p-4 border border-slate-200/80 bg-white shadow-sm rounded-xl transition hover:border-slate-300/80"
                                  >
                                    <div className="flex items-start gap-4">
                                      <Checkbox
                                        id={`course-${course._id}`}
                                        checked={isCourseIncluded}
                                        onCheckedChange={(checked) => handleCourseBundleToggle(course, checked)}
                                        className="mt-1"
                                      />
                                      {course.thumbnail && (
                                        <img 
                                          src={course.thumbnail} 
                                          alt={course.title} 
                                          className="w-20 h-20 object-cover rounded-md flex-shrink-0" 
                                        />
                                      )}
                                      <div className="flex-1 min-w-0 space-y-1.5">
                                        <Label htmlFor={`course-${course._id}`} className="font-medium text-base cursor-pointer">
                                          {course.title}
                                        </Label>
                                        <p className="text-sm text-slate-500 line-clamp-2">
                                          {course.description || 'No description available'}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                          <span className="flex items-center gap-1">
                                            <span className="font-medium text-slate-600">Type:</span> {course.courseType?.replace(/_/g, ' ') || 'N/A'}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <span className="font-medium text-slate-600">Price:</span> {course.currency || 'INR'} {course.price || 0}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {isCourseIncluded && bundle && (
                                      <div className="mt-4 ml-8 border-t pt-4 space-y-4 border-slate-200">
                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              id={`resell-${course._id}`}
                                              checked={bundle.allowResell || false}
                                              onCheckedChange={(checked) => handleCourseBundleChange(course._id, 'allowResell', checked)}
                                            />
                                            <Label htmlFor={`resell-${course._id}`}>Allow Resell</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              id={`remix-${course._id}`}
                                              checked={bundle.allowContentRemix || false}
                                              onCheckedChange={(checked) => handleCourseBundleChange(course._id, 'allowContentRemix', checked)}
                                            />
                                            <Label htmlFor={`remix-${course._id}`}>Allow Content Remix</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              id={`customPricing-${course._id}`}
                                              checked={bundle.allowCustomPricing || false}
                                              onCheckedChange={(checked) => handleCourseBundleChange(course._id, 'allowCustomPricing', checked)}
                                            />
                                            <Label htmlFor={`customPricing-${course._id}`}>Allow Custom Pricing</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              id={`marketingKit-${course._id}`}
                                              checked={bundle.marketingKitIncluded || false}
                                              onCheckedChange={(checked) => handleCourseBundleChange(course._id, 'marketingKitIncluded', checked)}
                                            />
                                            <Label htmlFor={`marketingKit-${course._id}`}>Include Marketing Kit</Label>
                                          </div>
                                        </div>
                                        
                                        {bundle.allowCustomPricing && (
                                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                              <Label htmlFor={`suggestedPrice-${course._id}`}>Suggested Resell Price</Label>
                                              <Input
                                                id={`suggestedPrice-${course._id}`}
                    type="number"
                                                step="0.01"
                                                value={bundle.suggestedResellPrice ?? ''}
                                                onChange={(e) => handleCourseBundleChange(course._id, 'suggestedResellPrice', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                  />
                </div>
                                            <div>
                                              <Label htmlFor={`minPrice-${course._id}`}>Minimum Price</Label>
                                              <Input
                                                id={`minPrice-${course._id}`}
                                                type="number"
                                                step="0.01"
                                                value={bundle.minimumResellPrice ?? ''}
                                                onChange={(e) => handleCourseBundleChange(course._id, 'minimumResellPrice', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor={`maxPrice-${course._id}`}>Maximum Price</Label>
                                              <Input
                                                id={`maxPrice-${course._id}`}
                                                type="number"
                                                step="0.01"
                                                value={bundle.maximumResellPrice ?? ''}
                                                onChange={(e) => handleCourseBundleChange(course._id, 'maximumResellPrice', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                              />
                                            </div>
                                          </div>
                                        )}
                                        
                                        <div className="text-sm">
                                          <Label htmlFor={`deliveryNotes-${course._id}`}>Delivery Notes</Label>
                                          <Textarea
                                            id={`deliveryNotes-${course._id}`}
                                            rows={2}
                                            value={bundle.deliveryNotes || ''}
                                            onChange={(e) => handleCourseBundleChange(course._id, 'deliveryNotes', e.target.value)}
                                            placeholder="Notes for coach on course delivery..."
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4 pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="trialDays">Trial Days</Label>
                  <Input
                    id="trialDays"
                    type="number"
                    value={planForm.trialDays}
                    onChange={(e) => setPlanForm({ ...planForm, trialDays: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="setupFee">Setup Fee</Label>
                  <Input
                    id="setupFee"
                    type="number"
                    step="0.01"
                    value={planForm.setupFee}
                    onChange={(e) => setPlanForm({ ...planForm, setupFee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={planForm.sortOrder}
                    onChange={(e) => setPlanForm({ ...planForm, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="annualDiscount">Annual Discount (%)</Label>
                <Input
                  id="annualDiscount"
                  type="number"
                  step="0.1"
                  value={planForm.pricing?.annualDiscount ?? 0}
                  onChange={(e) => setPlanForm({
                    ...planForm,
                    pricing: { ...planForm.pricing, annualDiscount: parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowAddonPurchases"
                    className="h-6 w-11"
                    checked={planForm.addons.allowAddonPurchases}
                    onCheckedChange={(checked) => setPlanForm({
                      ...planForm,
                      addons: { ...planForm.addons, allowAddonPurchases: checked }
                    })}
                  />
                  <Label htmlFor="allowAddonPurchases">Allow optional add-on purchases</Label>
                </div>

                {planForm.addons.allowAddonPurchases && (
                  <div className="space-y-3">
                    {(planForm.addons.availableAddons || []).map((addon, index) => (
                      <div key={index} className="border rounded-md p-3 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium">Addon #{index + 1}</div>
                          <Button variant="ghost" size="icon" onClick={() => removeAddon(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={addon.name}
                              onChange={(e) => updateAddonField(index, 'name', e.target.value)}
                              placeholder="Addon name"
                            />
                          </div>
                          <div>
                            <Label>Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={addon.price}
                              onChange={(e) => updateAddonField(index, 'price', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label>Billing Cycle</Label>
                            <Select
                              value={addon.billingCycle || 'one-time'}
                              onValueChange={(value) => updateAddonField(index, 'billingCycle', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="one-time">One-time</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            rows={3}
                            value={addon.description}
                            onChange={(e) => updateAddonField(index, 'description', e.target.value)}
                            placeholder="What does this addon include?"
                          />
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addNewAddon}>
                      Add addon
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPopular"
                    className="h-6 w-11"
                    checked={planForm.isPopular}
                    onCheckedChange={(checked) => setPlanForm({ ...planForm, isPopular: checked })}
                  />
                  <Label htmlFor="isPopular">Mark as popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    className="h-6 w-11"
                    checked={planForm.isActive}
                    onCheckedChange={(checked) => setPlanForm({ ...planForm, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
          
        <DialogFooter className="px-6 py-4 border-t bg-white">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlan}>
              Create Plan
            </Button>
          </DialogFooter>
      </div>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent
          className="max-w-6xl p-0 overflow-hidden"
          style={{ width: '90vw', maxWidth: '1200px', height: '85vh' }}
        >
          <div className="flex h-full flex-col bg-white">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white">
              <DialogTitle className="text-2xl font-semibold text-slate-900">
                Edit Subscription Plan
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Update any section of the plan while keeping the layout focused and easy to scan.
            </DialogDescription>
          </DialogHeader>
          
          {/* Same form structure as create dialog */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <Tabs defaultValue="basic" className="w-full h-full">
                <TabsList className="flex flex-wrap gap-2 rounded-full bg-slate-100/70 p-1">
                  <TabsTrigger value="basic" className="px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium">
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="features" className="px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium">
                    Features
                  </TabsTrigger>
                  <TabsTrigger value="limits" className="px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium">
                    Limits
                  </TabsTrigger>
                  <TabsTrigger value="courses" className="px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium">
                    Courses
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="px-4 py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium">
                    Advanced
                  </TabsTrigger>
            </TabsList>
            
                <TabsContent value="basic" className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Plan Name *</Label>
                  <Input
                    id="edit-name"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                    placeholder="e.g., Professional Plan"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={planForm.category} onValueChange={(value) => setPlanForm({...planForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                  placeholder="Plan description..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({...planForm, price: parseFloat(e.target.value) || 0})}
                    placeholder="99.99"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-currency">Currency</Label>
                  <Select value={planForm.currency} onValueChange={(value) => setPlanForm({...planForm, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-billingCycle">Billing Cycle *</Label>
                  <Select value={planForm.billingCycle} onValueChange={(value) => setPlanForm({...planForm, billingCycle: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-duration">Duration (months) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={planForm.duration}
                  onChange={(e) => setPlanForm({...planForm, duration: parseInt(e.target.value) || 1})}
                  placeholder="1"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="space-y-6 pt-6">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Automation & AI</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { id: 'edit-aiFeatures', label: 'AI Features', key: 'aiFeatures' },
                    { id: 'edit-whatsappAutomation', label: 'WhatsApp Automation', key: 'whatsappAutomation' },
                    { id: 'edit-emailAutomation', label: 'Email Automation', key: 'emailAutomation' }
                  ].map(({ id, label, key }) => (
                    <div className="flex items-center space-x-2" key={id}>
                    <Switch
                        id={id}
                      className="h-6 w-11"
                        checked={planForm.features[key]}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                          features: { ...planForm.features, [key]: checked }
                      })}
                    />
                      <Label htmlFor={id}>{label}</Label>
                  </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Support</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { id: 'edit-prioritySupport', label: 'Priority Support', key: 'prioritySupport' }
                  ].map(({ id, label, key }) => (
                    <div className="flex items-center space-x-2" key={id}>
                    <Switch
                        id={id}
                      className="h-6 w-11"
                        checked={planForm.features[key]}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                          features: { ...planForm.features, [key]: checked }
                      })}
                    />
                      <Label htmlFor={id}>{label}</Label>
                  </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Branding & Integrations</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { id: 'edit-customDomain', label: 'Custom Domain', key: 'customDomain' },
                    { id: 'edit-customBranding', label: 'Custom Branding', key: 'customBranding' },
                    { id: 'edit-whiteLabel', label: 'White Label', key: 'whiteLabel' },
                    { id: 'edit-apiAccess', label: 'API Access', key: 'apiAccess' },
                    { id: 'edit-webhooks', label: 'Webhooks', key: 'webhooks' },
                    { id: 'edit-advancedReporting', label: 'Advanced Reporting', key: 'advancedReporting' }
                  ].map(({ id, label, key }) => (
                    <div className="flex items-center space-x-2" key={id}>
                    <Switch
                        id={id}
                      className="h-6 w-11"
                        checked={planForm.features[key]}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                          features: { ...planForm.features, [key]: checked }
                      })}
                    />
                      <Label htmlFor={id}>{label}</Label>
                  </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Label htmlFor="edit-integrations">Supported Integrations (comma separated)</Label>
                  <Textarea
                    id="edit-integrations"
                    rows={2}
                    value={(planForm.features.integrations || []).join(', ')}
                    onChange={(e) => setPlanForm({
                      ...planForm,
                      features: { ...planForm.features, integrations: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) }
                    })}
                    placeholder="zapier, webhook, slack..."
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="limits" className="space-y-4 pt-6">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Core Resources</h4>
                <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-maxFunnels">Max Funnels</Label>
                  <Input
                    id="edit-maxFunnels"
                    type="number"
                      value={planForm.limits.maxFunnels}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                        limits: { ...planForm.limits, maxFunnels: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxStaff">Max Staff</Label>
                  <Input
                    id="edit-maxStaff"
                    type="number"
                      value={planForm.limits.maxStaff}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                        limits: { ...planForm.limits, maxStaff: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxDevices">Max Devices</Label>
                  <Input
                    id="edit-maxDevices"
                    type="number"
                      value={planForm.limits.maxDevices}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                        limits: { ...planForm.limits, maxDevices: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                </div>
              </div>

                <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Automation & Credits</h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="edit-automationRules">Automation Rules</Label>
                  <Input
                      id="edit-automationRules"
                    type="number"
                      value={planForm.limits.automationRules}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                        limits: { ...planForm.limits, automationRules: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                  <div>
                    <Label htmlFor="edit-emailCredits">Email Credits</Label>
                    <Input
                      id="edit-emailCredits"
                      type="number"
                      value={planForm.limits.emailCredits}
                      onChange={(e) => setPlanForm({
                        ...planForm, 
                        limits: { ...planForm.limits, emailCredits: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-smsCredits">SMS Credits</Label>
                    <Input
                      id="edit-smsCredits"
                      type="number"
                      value={planForm.limits.smsCredits}
                      onChange={(e) => setPlanForm({
                        ...planForm, 
                        limits: { ...planForm.limits, smsCredits: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-storageGB">Storage (GB)</Label>
                    <Input
                      id="edit-storageGB"
                      type="number"
                      value={planForm.limits.storageGB}
                      onChange={(e) => setPlanForm({
                        ...planForm, 
                        limits: { ...planForm.limits, storageGB: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  </div>
                  </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Business Operations</h4>
                <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-maxLeads">Max Leads</Label>
                  <Input
                    id="edit-maxLeads"
                    type="number"
                    value={planForm.limits.maxLeads}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      limits: {...planForm.limits, maxLeads: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxAppointments">Max Appointments</Label>
                  <Input
                    id="edit-maxAppointments"
                    type="number"
                    value={planForm.limits.maxAppointments}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      limits: {...planForm.limits, maxAppointments: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxCampaigns">Max Campaigns</Label>
                  <Input
                    id="edit-maxCampaigns"
                    type="number"
                    value={planForm.limits.maxCampaigns}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      limits: {...planForm.limits, maxCampaigns: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                </div>
              </div>

              <p className="text-xs text-gray-500">Use -1 for unlimited access.</p>
            </TabsContent>
            
            <TabsContent value="courses" className="space-y-4 pt-6">
                <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Included Courses</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Select courses from the platform's library to include in this subscription plan. Coaches subscribed to this plan will gain access to these courses based on the permissions you set.
                </p>
                
                <div className="flex items-center gap-2 mb-4">
                  <Input
                    placeholder="Search courses..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={loadAvailableCourses} disabled={coursesLoading}>
                    {coursesLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {coursesLoading ? 'Loading...' : 'Load Courses'}
                  </Button>
                </div>

                {courseLoadError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{courseLoadError}</AlertDescription>
                  </Alert>
                )}

                {coursesLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No courses found.</p>
                    <p className="text-sm">Click "Load Courses" to fetch available courses from the platform.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] w-full rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                    <div className="space-y-4">
                      {/* Group courses by category */}
                      {['customer_course', 'coach_course'].map((category) => {
                        const categoryCourses = filteredCourses.filter((course) => 
                          (course.category || 'customer_course') === category
                        );
                        
                        if (categoryCourses.length === 0) return null;
                        
                        return (
                          <div key={category} className="space-y-3">
                            <h5 className="font-semibold text-sm text-gray-600 border-b pb-2">
                              {category === 'customer_course' ? 'Customer Courses' : 'Coach Courses'} ({categoryCourses.length})
                            </h5>
                            <div className="grid grid-cols-1 gap-3">
                              {categoryCourses.map((course) => {
                                const bundle = getCourseBundle(course._id);
                                const isCourseIncluded = !!bundle;
                                
                                return (
                                  <Card
                                    key={course._id}
                                    className="p-4 border border-slate-200/80 bg-white shadow-sm rounded-xl transition hover:border-slate-300/80"
                                  >
                                    <div className="flex items-start gap-4">
                                      <Checkbox
                                        id={`edit-course-${course._id}`}
                                        checked={isCourseIncluded}
                                        onCheckedChange={(checked) => handleCourseBundleToggle(course, checked)}
                                        className="mt-1"
                                      />
                                      {course.thumbnail && (
                                        <img 
                                          src={course.thumbnail} 
                                          alt={course.title} 
                                          className="w-20 h-20 object-cover rounded-md flex-shrink-0" 
                                        />
                                      )}
                                      <div className="flex-1 min-w-0 space-y-1.5">
                                        <Label htmlFor={`edit-course-${course._id}`} className="font-medium text-base cursor-pointer">
                                          {course.title}
                                        </Label>
                                        <p className="text-sm text-slate-500 line-clamp-2">
                                          {course.description || 'No description available'}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                          <span className="flex items-center gap-1">
                                            <span className="font-medium text-slate-600">Type:</span> {course.courseType?.replace(/_/g, ' ') || 'N/A'}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <span className="font-medium text-slate-600">Price:</span> {course.currency || 'INR'} {course.price || 0}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {isCourseIncluded && bundle && (
                                      <div className="mt-4 ml-8 border-t border-slate-200 pt-4 space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              id={`edit-resell-${course._id}`}
                                              checked={bundle.allowResell || false}
                                              onCheckedChange={(checked) => handleCourseBundleChange(course._id, 'allowResell', checked)}
                                            />
                                            <Label htmlFor={`edit-resell-${course._id}`}>Allow Resell</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              id={`edit-remix-${course._id}`}
                                              checked={bundle.allowContentRemix || false}
                                              onCheckedChange={(checked) => handleCourseBundleChange(course._id, 'allowContentRemix', checked)}
                                            />
                                            <Label htmlFor={`edit-remix-${course._id}`}>Allow Content Remix</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              id={`edit-customPricing-${course._id}`}
                                              checked={bundle.allowCustomPricing || false}
                                              onCheckedChange={(checked) => handleCourseBundleChange(course._id, 'allowCustomPricing', checked)}
                                            />
                                            <Label htmlFor={`edit-customPricing-${course._id}`}>Allow Custom Pricing</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              id={`edit-marketingKit-${course._id}`}
                                              checked={bundle.marketingKitIncluded || false}
                                              onCheckedChange={(checked) => handleCourseBundleChange(course._id, 'marketingKitIncluded', checked)}
                                            />
                                            <Label htmlFor={`edit-marketingKit-${course._id}`}>Include Marketing Kit</Label>
                                          </div>
                                        </div>
                                        
                                        {bundle.allowCustomPricing && (
                                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                              <Label htmlFor={`edit-suggestedPrice-${course._id}`}>Suggested Resell Price</Label>
                                              <Input
                                                id={`edit-suggestedPrice-${course._id}`}
                    type="number"
                                                step="0.01"
                                                value={bundle.suggestedResellPrice ?? ''}
                                                onChange={(e) => handleCourseBundleChange(course._id, 'suggestedResellPrice', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                  />
                </div>
                                            <div>
                                              <Label htmlFor={`edit-minPrice-${course._id}`}>Minimum Price</Label>
                                              <Input
                                                id={`edit-minPrice-${course._id}`}
                                                type="number"
                                                step="0.01"
                                                value={bundle.minimumResellPrice ?? ''}
                                                onChange={(e) => handleCourseBundleChange(course._id, 'minimumResellPrice', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor={`edit-maxPrice-${course._id}`}>Maximum Price</Label>
                                              <Input
                                                id={`edit-maxPrice-${course._id}`}
                                                type="number"
                                                step="0.01"
                                                value={bundle.maximumResellPrice ?? ''}
                                                onChange={(e) => handleCourseBundleChange(course._id, 'maximumResellPrice', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                              />
                                            </div>
                                          </div>
                                        )}
                                        
                                        <div className="text-sm">
                                          <Label htmlFor={`edit-deliveryNotes-${course._id}`}>Delivery Notes</Label>
                                          <Textarea
                                            id={`edit-deliveryNotes-${course._id}`}
                                            rows={2}
                                            value={bundle.deliveryNotes || ''}
                                            onChange={(e) => handleCourseBundleChange(course._id, 'deliveryNotes', e.target.value)}
                                            placeholder="Notes for coach on course delivery..."
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4 pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-trialDays">Trial Days</Label>
                  <Input
                    id="edit-trialDays"
                    type="number"
                    value={planForm.trialDays}
                    onChange={(e) => setPlanForm({ ...planForm, trialDays: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-setupFee">Setup Fee</Label>
                  <Input
                    id="edit-setupFee"
                    type="number"
                    step="0.01"
                    value={planForm.setupFee}
                    onChange={(e) => setPlanForm({ ...planForm, setupFee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-sortOrder">Sort Order</Label>
                  <Input
                    id="edit-sortOrder"
                    type="number"
                    value={planForm.sortOrder}
                    onChange={(e) => setPlanForm({ ...planForm, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-annualDiscount">Annual Discount (%)</Label>
                <Input
                  id="edit-annualDiscount"
                  type="number"
                  step="0.1"
                  value={planForm.pricing?.annualDiscount ?? 0}
                  onChange={(e) => setPlanForm({
                    ...planForm,
                    pricing: { ...planForm.pricing, annualDiscount: parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-allowAddonPurchases"
                    className="h-6 w-11"
                    checked={planForm.addons.allowAddonPurchases}
                    onCheckedChange={(checked) => setPlanForm({
                      ...planForm,
                      addons: { ...planForm.addons, allowAddonPurchases: checked }
                    })}
                  />
                  <Label htmlFor="edit-allowAddonPurchases">Allow optional add-on purchases</Label>
                </div>

                {planForm.addons.allowAddonPurchases && (
                  <div className="space-y-3">
                    {(planForm.addons.availableAddons || []).map((addon, index) => (
                      <div key={index} className="border rounded-md p-3 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium">Addon #{index + 1}</div>
                          <Button variant="ghost" size="icon" onClick={() => removeAddon(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={addon.name}
                              onChange={(e) => updateAddonField(index, 'name', e.target.value)}
                              placeholder="Addon name"
                            />
                          </div>
                          <div>
                            <Label>Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={addon.price}
                              onChange={(e) => updateAddonField(index, 'price', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label>Billing Cycle</Label>
                            <Select
                              value={addon.billingCycle || 'one-time'}
                              onValueChange={(value) => updateAddonField(index, 'billingCycle', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="one-time">One-time</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            rows={3}
                            value={addon.description}
                            onChange={(e) => updateAddonField(index, 'description', e.target.value)}
                            placeholder="What does this addon include?"
                          />
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addNewAddon}>
                      Add addon
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isPopular"
                    className="h-6 w-11"
                    checked={planForm.isPopular}
                    onCheckedChange={(checked) => setPlanForm({ ...planForm, isPopular: checked })}
                  />
                  <Label htmlFor="edit-isPopular">Mark as popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isActive"
                    className="h-6 w-11"
                    checked={planForm.isActive}
                    onCheckedChange={(checked) => setPlanForm({ ...planForm, isActive: checked })}
                  />
                  <Label htmlFor="edit-isActive">Active</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
          
        <DialogFooter className="px-6 py-4 border-t bg-white">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan}>
              Update Plan
            </Button>
          </DialogFooter>
      </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              Delete Subscription Plan
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              This action cannot be undone. This will permanently delete the subscription plan and remove it from the system.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Plan Name:</span>
                  <span className="font-semibold text-gray-800">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Pricing:</span>
                  <span className="font-semibold text-gray-800">
                    {selectedPlan.currency} {selectedPlan.price} / {selectedPlan.billingCycle}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Active Subscribers:</span>
                  <span className="font-semibold text-gray-800">{selectedPlan.enrolledCoaches || 0} coaches</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Status:</span>
                  <Badge
                    variant={selectedPlan.isActive ? "default" : "secondary"}
                    className={selectedPlan.isActive
                      ? "bg-green-100 text-green-800 border-green-300"
                      : "bg-gray-100 text-gray-600"
                    }
                  >
                    {selectedPlan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {(selectedPlan?.enrolledCoaches || 0) > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-amber-100 rounded-full flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800">Warning</p>
                  <p className="text-sm text-amber-700 mt-1">
                    This plan has active subscribers. Deleting it may affect {selectedPlan.enrolledCoaches} coach{selectedPlan.enrolledCoaches !== 1 ? 'es' : ''}.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePlan}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={isAnalyticsDialogOpen} onOpenChange={setIsAnalyticsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Subscription Plan Analytics</DialogTitle>
            <DialogDescription>
              View analytics and insights for subscription plans
            </DialogDescription>
          </DialogHeader>
          
          {analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{analytics.plans?.total || 0}</div>
                    <div className="text-sm text-gray-500">Total Plans</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{analytics.plans?.active || 0}</div>
                    <div className="text-sm text-gray-500">Active Plans</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{analytics.subscriptions?.active || 0}</div>
                    <div className="text-sm text-gray-500">Active Subscriptions</div>
                  </CardContent>
                </Card>
              </div>
              
              {analytics.planPopularity && analytics.planPopularity.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Popularity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plan Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Subscribers</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.planPopularity.map((plan, index) => (
                          <TableRow key={index}>
                            <TableCell>{plan.planName}</TableCell>
                            <TableCell>{formatCurrency(plan.planPrice)}</TableCell>
                            <TableCell>{plan.subscriberCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsAnalyticsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Selector Dialog */}
      <Dialog open={isCourseSelectorOpen} onOpenChange={setIsCourseSelectorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Admin Courses</DialogTitle>
            <DialogDescription>
              Choose which admin-created courses are bundled into this subscription plan. Selected courses will be available for resell and remix based on the access options above.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 mb-3">
            <Input
              placeholder="Search courses..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
            />
            <Button type="button" variant="outline" size="sm" onClick={loadAvailableCourses} disabled={coursesLoading}>
              Refresh
            </Button>
          </div>

          {courseLoadError && (
            <Alert variant="destructive" className="mb-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{courseLoadError}</AlertDescription>
            </Alert>
          )}

          <ScrollArea className="h-[60vh] border rounded-md p-3">
            {coursesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-sm text-gray-500">No admin courses found. Adjust your filters or create courses first.</div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => {
                  const bundle = planForm.courseBundles?.find((b) => b.course === course._id);
                  const isSelected = Boolean(bundle);
                  return (
                    <div key={course._id} className="border rounded-md p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{course.title}</div>
                          {course.category && (
                            <div className="text-xs text-gray-500">Category: {course.category}</div>
                          )}
                        </div>
                        <Switch
                          checked={isSelected}
                          onCheckedChange={(checked) => handleCourseBundleToggle(course, checked)}
                        />
                      </div>
                      {isSelected && (
                        <div className="mt-3 ml-4 border-l pl-4 space-y-3">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`suggestedPrice-${course._id}`}>Suggested resell price</Label>
                              <Input
                                id={`suggestedPrice-${course._id}`}
                                type="number"
                                step="0.01"
                                value={bundle.suggestedResellPrice ?? ''}
                                onChange={(e) => updateCourseBundle(course._id, 'suggestedResellPrice', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`minPrice-${course._id}`}>Minimum price</Label>
                              <Input
                                id={`minPrice-${course._id}`}
                                type="number"
                                step="0.01"
                                value={bundle.minimumResellPrice ?? ''}
                                onChange={(e) => updateCourseBundle(course._id, 'minimumResellPrice', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`maxPrice-${course._id}`}>Maximum price</Label>
                              <Input
                                id={`maxPrice-${course._id}`}
                                type="number"
                                step="0.01"
                                value={bundle.maximumResellPrice ?? ''}
                                onChange={(e) => updateCourseBundle(course._id, 'maximumResellPrice', e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            {[
                              { id: `allowResell-${course._id}`, label: 'Allow resell', key: 'allowResell' },
                              { id: `allowContentRemix-${course._id}`, label: 'Allow remix', key: 'allowContentRemix' },
                              { id: `allowCustomPricing-${course._id}`, label: 'Allow custom pricing', key: 'allowCustomPricing' },
                              { id: `marketingKitIncluded-${course._id}`, label: 'Include marketing kit', key: 'marketingKitIncluded' }
                            ].map(({ id, label, key }) => (
                              <div className="flex items-center space-x-2" key={id}>
                                <Switch
                                  id={id}
                                  className="h-6 w-11"
                                  checked={bundle[key]}
                                  onCheckedChange={(checked) => updateCourseBundle(course._id, key, checked)}
                                />
                                <Label htmlFor={id}>{label}</Label>
                              </div>
                            ))}
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Marketing assets (one per line)</Label>
                              <Textarea
                                rows={3}
                                value={(bundle.marketingAssets || []).join('\n')}
                                onChange={(e) => updateCourseBundleArrayField(course._id, 'marketingAssets', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Delivery notes</Label>
                              <Textarea
                                rows={3}
                                value={bundle.deliveryNotes || ''}
                                onChange={(e) => updateCourseBundle(course._id, 'deliveryNotes', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCourseSelectorOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPlans;