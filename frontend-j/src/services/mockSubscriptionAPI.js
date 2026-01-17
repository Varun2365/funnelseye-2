// Mock subscription API for development
// This provides sample data when the real API endpoints are not available

const mockSubscriptionData = {
  subscription: {
    _id: "64f8a1b2c3d4e5f6a7b8c9d4",
    coachId: "64f8a1b2c3d4e5f6a7b8c9d3",
    planId: {
      _id: "64f8a1b2c3d4e5f6a7b8c9d2",
      name: "Premium Fitness Coach",
      description: "Complete fitness coaching platform with AI features and advanced analytics",
      price: {
        amount: 99.99,
        currency: "USD",
        billingCycle: "monthly"
      },
      features: {
        maxFunnels: 20,
        maxLeads: 5000,
        maxStaff: 10,
        maxAutomationRules: 100,
        aiFeatures: true,
        advancedAnalytics: true,
        prioritySupport: true,
        customDomain: true
      }
    },
    status: "active",
    currentPeriod: {
      startDate: "2024-01-15T10:30:00.000Z",
      endDate: "2024-02-15T10:30:00.000Z"
    },
    billing: {
      amount: 99.99,
      currency: "USD",
      billingCycle: "monthly",
      nextBillingDate: "2024-02-15T10:30:00.000Z",
      lastPaymentDate: "2024-01-15T10:30:00.000Z",
      paymentMethod: "stripe",
      paymentStatus: "paid"
    },
    features: {
      maxFunnels: 20,
      maxLeads: 5000,
      maxStaff: 10,
      maxAutomationRules: 100,
      aiFeatures: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customDomain: true
    },
    usage: {
      currentFunnels: 5,
      currentLeads: 1250,
      currentStaff: 3,
      currentAutomationRules: 25
    },
    daysUntilExpiry: 15,
    isExpired: false,
    isExpiringSoon: false,
    isOverdue: false
  },
  
  plans: [
    {
      _id: "64f8a1b2c3d4e5f6a7b8c9d0",
      name: "Starter Plan",
      description: "Basic coaching platform for beginners",
      price: {
        amount: 29.99,
        currency: "USD",
        billingCycle: "monthly"
      },
      features: {
        maxFunnels: 5,
        maxLeads: 1000,
        maxStaff: 3,
        maxAutomationRules: 10,
        aiFeatures: false,
        advancedAnalytics: false,
        prioritySupport: false,
        customDomain: false
      },
      isActive: true,
      isPopular: false,
      sortOrder: 0
    },
    {
      _id: "64f8a1b2c3d4e5f6a7b8c9d2",
      name: "Premium Fitness Coach",
      description: "Complete fitness coaching platform with AI features and advanced analytics",
      price: {
        amount: 99.99,
        currency: "USD",
        billingCycle: "monthly"
      },
      features: {
        maxFunnels: 20,
        maxLeads: 5000,
        maxStaff: 10,
        maxAutomationRules: 100,
        aiFeatures: true,
        advancedAnalytics: true,
        prioritySupport: true,
        customDomain: true
      },
      isActive: true,
      isPopular: true,
      sortOrder: 1
    },
    {
      _id: "64f8a1b2c3d4e5f6a7b8c9d3",
      name: "Enterprise Plan",
      description: "Advanced coaching platform for large organizations",
      price: {
        amount: 199.99,
        currency: "USD",
        billingCycle: "monthly"
      },
      features: {
        maxFunnels: 50,
        maxLeads: 10000,
        maxStaff: 25,
        maxAutomationRules: 500,
        aiFeatures: true,
        advancedAnalytics: true,
        prioritySupport: true,
        customDomain: true
      },
      isActive: true,
      isPopular: false,
      sortOrder: 2
    }
  ],
  
  analytics: {
    totalSubscriptions: 45,
    activeSubscriptions: 38,
    expiredSubscriptions: 5,
    cancelledSubscriptions: 2,
    monthlyRevenue: 4567.89,
    revenueByPlan: [
      {
        planName: "Premium Fitness Coach",
        count: 25,
        revenue: 2499.75
      },
      {
        planName: "Starter Plan",
        count: 20,
        revenue: 599.80
      },
      {
        planName: "Enterprise Plan",
        count: 5,
        revenue: 999.95
      }
    ],
    subscriptionGrowth: {
      thisMonth: 8,
      lastMonth: 6,
      growthPercentage: 33.33
    },
    churnRate: 4.44,
    averageSubscriptionDuration: 4.2
  },
  
  coaches: [
    {
      _id: "64f8a1b2c3d4e5f6a7b8c9d4",
      coachId: {
        _id: "64f8a1b2c3d4e5f6a7b8c9d3",
        name: "John Doe",
        email: "john@fitnesscoach.com",
        company: "Fitness Pro",
        avatar: null
      },
      planId: {
        _id: "64f8a1b2c3d4e5f6a7b8c9d2",
        name: "Premium Fitness Coach",
        price: {
          amount: 99.99,
          currency: "USD",
          billingCycle: "monthly"
        },
        features: {
          maxFunnels: 20,
          maxLeads: 5000,
          maxStaff: 10,
          maxAutomationRules: 100,
          aiFeatures: true,
          advancedAnalytics: true,
          prioritySupport: true,
          customDomain: true
        }
      },
      status: "active",
      currentPeriod: {
        startDate: "2024-01-15T10:30:00.000Z",
        endDate: "2024-02-15T10:30:00.000Z"
      },
      billing: {
        amount: 99.99,
        currency: "USD",
        billingCycle: "monthly",
        nextBillingDate: "2024-02-15T10:30:00.000Z",
        paymentStatus: "paid",
        paymentMethod: "stripe"
      },
      features: {
        maxFunnels: 20,
        maxLeads: 5000,
        maxStaff: 10,
        maxAutomationRules: 100,
        aiFeatures: true,
        advancedAnalytics: true,
        prioritySupport: true,
        customDomain: true
      },
      usage: {
        currentFunnels: 5,
        currentLeads: 1250,
        currentStaff: 3,
        currentAutomationRules: 25
      },
      createdAt: "2024-01-15T10:30:00.000Z"
    },
    {
      _id: "64f8a1b2c3d4e5f6a7b8c9d5",
      coachId: {
        _id: "64f8a1b2c3d4e5f6a7b8c9d6",
        name: "Sarah Johnson",
        email: "sarah@wellnesscoach.com",
        company: "Wellness Solutions",
        avatar: null
      },
      planId: {
        _id: "64f8a1b2c3d4e5f6a7b8c9d0",
        name: "Starter Plan",
        price: {
          amount: 29.99,
          currency: "USD",
          billingCycle: "monthly"
        },
        features: {
          maxFunnels: 5,
          maxLeads: 1000,
          maxStaff: 3,
          maxAutomationRules: 10,
          aiFeatures: false,
          advancedAnalytics: false,
          prioritySupport: false,
          customDomain: false
        }
      },
      status: "active",
      currentPeriod: {
        startDate: "2024-01-10T10:30:00.000Z",
        endDate: "2024-02-10T10:30:00.000Z"
      },
      billing: {
        amount: 29.99,
        currency: "USD",
        billingCycle: "monthly",
        nextBillingDate: "2024-02-10T10:30:00.000Z",
        paymentStatus: "paid",
        paymentMethod: "paypal"
      },
      features: {
        maxFunnels: 5,
        maxLeads: 1000,
        maxStaff: 3,
        maxAutomationRules: 10,
        aiFeatures: false,
        advancedAnalytics: false,
        prioritySupport: false,
        customDomain: false
      },
      usage: {
        currentFunnels: 2,
        currentLeads: 450,
        currentStaff: 1,
        currentAutomationRules: 3
      },
      createdAt: "2024-01-10T10:30:00.000Z"
    }
  ]
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockSubscriptionAPI = {
  // Get all subscription plans
  getPlans: async () => {
    await delay(500);
    return {
      success: true,
      count: mockSubscriptionData.plans.length,
      data: mockSubscriptionData.plans
    };
  },

  // Get my subscription
  getMySubscription: async () => {
    await delay(500);
    return {
      success: true,
      data: mockSubscriptionData.subscription
    };
  },

  // Subscribe to a plan
  subscribe: async (subscriptionData) => {
    await delay(1000);
    return {
      success: true,
      message: "Subscription created successfully",
      data: {
        ...mockSubscriptionData.subscription,
        planId: mockSubscriptionData.plans.find(p => p._id === subscriptionData.planId),
        ...subscriptionData
      }
    };
  },

  // Renew subscription
  renewSubscription: async (renewalData) => {
    await delay(1000);
    return {
      success: true,
      message: "Subscription renewed successfully",
      data: {
        ...mockSubscriptionData.subscription,
        currentPeriod: {
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        billing: {
          ...mockSubscriptionData.subscription.billing,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastPaymentDate: new Date().toISOString(),
          paymentStatus: "paid"
        }
      }
    };
  },

  // Cancel subscription
  cancelSubscription: async (cancellationData) => {
    await delay(1000);
    return {
      success: true,
      message: "Subscription cancelled successfully",
      data: {
        ...mockSubscriptionData.subscription,
        status: "cancelled",
        cancellation: {
          cancelledAt: new Date().toISOString(),
          reason: cancellationData.reason,
          effectiveDate: mockSubscriptionData.subscription.currentPeriod.endDate
        }
      }
    };
  },

  // Get subscription analytics
  getAnalytics: async () => {
    await delay(500);
    return {
      success: true,
      data: mockSubscriptionData.analytics
    };
  },

  // Get all subscriptions (for coach management)
  getAllSubscriptions: async (params = {}) => {
    await delay(500);
    return {
      success: true,
      count: mockSubscriptionData.coaches.length,
      total: mockSubscriptionData.coaches.length,
      page: 1,
      totalPages: 1,
      data: mockSubscriptionData.coaches
    };
  },

  // Get coach subscription
  getCoachSubscription: async (coachId) => {
    await delay(500);
    const coach = mockSubscriptionData.coaches.find(c => c.coachId._id === coachId);
    return {
      success: true,
      data: coach || null
    };
  },

  // Update coach subscription
  updateCoachSubscription: async (coachId, subscriptionData) => {
    await delay(1000);
    const coach = mockSubscriptionData.coaches.find(c => c.coachId._id === coachId);
    if (!coach) {
      throw new Error('Coach not found');
    }
    
    return {
      success: true,
      message: "Coach subscription updated successfully",
      data: {
        ...coach,
        ...subscriptionData,
        updatedAt: new Date().toISOString()
      }
    };
  },

  // Create subscription plan
  createPlan: async (planData) => {
    await delay(1000);
    return {
      success: true,
      message: "Subscription plan created successfully",
      data: {
        _id: `new_plan_${Date.now()}`,
        ...planData,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  },

  // Update subscription plan
  updatePlan: async (planId, planData) => {
    await delay(1000);
    return {
      success: true,
      message: "Subscription plan updated successfully",
      data: {
        _id: planId,
        ...planData,
        updatedAt: new Date().toISOString()
      }
    };
  },

  // Delete subscription plan
  deletePlan: async (planId) => {
    await delay(1000);
    return {
      success: true,
      message: "Subscription plan deleted successfully"
    };
  },

  // Send reminders
  sendReminders: async () => {
    await delay(1000);
    return {
      success: true,
      message: "Reminders sent successfully. 5 reminders sent to coaches with expiring subscriptions."
    };
  },

  // Disable expired subscriptions
  disableExpired: async () => {
    await delay(1000);
    return {
      success: true,
      message: "Disabled 3 expired subscriptions",
      disabledCount: 3
    };
  },

  // Get subscription usage
  getUsage: async () => {
    await delay(500);
    return {
      success: true,
      data: mockSubscriptionData.subscription.usage
    };
  },

  // Update subscription settings
  updateSettings: async (settingsData) => {
    await delay(1000);
    return {
      success: true,
      message: "Settings updated successfully",
      data: settingsData
    };
  },

  // Get subscription history
  getHistory: async () => {
    await delay(500);
    return {
      success: true,
      data: [
        {
          _id: "history_1",
          action: "subscription_created",
          timestamp: "2024-01-15T10:30:00.000Z",
          details: "Premium Fitness Coach plan activated"
        },
        {
          _id: "history_2",
          action: "payment_received",
          timestamp: "2024-01-15T10:30:00.000Z",
          details: "Payment of $99.99 received via Stripe"
        }
      ]
    };
  },

  // Check feature access
  checkFeatureAccess: async (feature) => {
    await delay(300);
    const hasAccess = mockSubscriptionData.subscription.features[feature];
    return {
      success: true,
      data: {
        feature,
        hasAccess,
        reason: hasAccess ? "Feature included in current plan" : "Feature not available in current plan"
      }
    };
  },

  // Get billing information
  getBillingInfo: async () => {
    await delay(500);
    return {
      success: true,
      data: mockSubscriptionData.subscription.billing
    };
  },

  // Update billing information
  updateBillingInfo: async (billingData) => {
    await delay(1000);
    return {
      success: true,
      message: "Billing information updated successfully",
      data: {
        ...mockSubscriptionData.subscription.billing,
        ...billingData,
        updatedAt: new Date().toISOString()
      }
    };
  },

  // Get payment methods
  getPaymentMethods: async () => {
    await delay(500);
    return {
      success: true,
      data: [
        {
          _id: "pm_1",
          type: "card",
          last4: "4242",
          brand: "visa",
          expMonth: 12,
          expYear: 2025,
          isDefault: true
        }
      ]
    };
  },

  // Add payment method
  addPaymentMethod: async (paymentMethodData) => {
    await delay(1000);
    return {
      success: true,
      message: "Payment method added successfully",
      data: {
        _id: `pm_${Date.now()}`,
        ...paymentMethodData,
        createdAt: new Date().toISOString()
      }
    };
  },

  // Remove payment method
  removePaymentMethod: async (paymentMethodId) => {
    await delay(1000);
    return {
      success: true,
      message: "Payment method removed successfully"
    };
  },

  // Set default payment method
  setDefaultPaymentMethod: async (paymentMethodId) => {
    await delay(1000);
    return {
      success: true,
      message: "Default payment method updated successfully"
    };
  },

  // Get invoices
  getInvoices: async (params = {}) => {
    await delay(500);
    return {
      success: true,
      count: 3,
      data: [
        {
          _id: "inv_1",
          number: "INV-001",
          amount: 99.99,
          currency: "USD",
          status: "paid",
          dueDate: "2024-01-15T10:30:00.000Z",
          paidDate: "2024-01-15T10:30:00.000Z",
          downloadUrl: "/api/invoices/inv_1/download"
        },
        {
          _id: "inv_2",
          number: "INV-002",
          amount: 99.99,
          currency: "USD",
          status: "pending",
          dueDate: "2024-02-15T10:30:00.000Z",
          paidDate: null,
          downloadUrl: "/api/invoices/inv_2/download"
        }
      ]
    };
  },

  // Download invoice
  downloadInvoice: async (invoiceId) => {
    await delay(1000);
    return {
      success: true,
      message: "Invoice downloaded successfully"
    };
  },

  // Get subscription reports
  getReports: async (params = {}) => {
    await delay(1000);
    return {
      success: true,
      data: {
        revenue: {
          total: 4567.89,
          monthly: 4567.89,
          growth: 15.5
        },
        subscriptions: {
          total: 45,
          active: 38,
          cancelled: 2,
          expired: 5
        },
        churn: {
          rate: 4.44,
          trend: "decreasing"
        }
      }
    };
  },

  // Export subscription data
  exportData: async (format = 'csv') => {
    await delay(2000);
    return {
      success: true,
      message: "Data exported successfully"
    };
  }
};

export default mockSubscriptionAPI;
