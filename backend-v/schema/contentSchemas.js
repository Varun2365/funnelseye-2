const mongoose = require('mongoose');

// Admin Content Upload Schema (for files uploaded by admin)
const adminContentUploadSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'video', 'pdf', 'document', 'audio'],
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Content Course Schema (Workout routines, meal plans, general module courses)
const contentCourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  courseType: {
    type: String,
    enum: ['workout_routine', 'meal_plan', 'general_module_course'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'SGD', 'HKD', 'NZD', 'CHF', 'AED', 'SAR', 'ZAR', 'BRL', 'MXN', 'ARS', 'CLP', 'COP', 'PEN', 'KRW', 'THB', 'MYR', 'PHP', 'IDR', 'VND', 'PKR', 'BDT', 'LKR', 'NPR', 'MMK', 'KHR', 'LAK', 'MNT', 'KZT', 'UZS', 'TJS', 'AFN', 'IRR', 'IQD', 'ILS', 'JOD', 'LBP', 'EGP', 'TRY', 'RUB', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'SEK', 'NOK', 'DKK', 'ISK'],
    default: 'USD',
    required: true
  },
  category: {
    type: String,
    enum: ['coach_course', 'customer_course'],
    required: true,
    default: 'customer_course'
  },
  thumbnail: {
    type: String, // URL or file path
    default: null
  },
  funnelsEyeExtras: {
    headline: {
      type: String,
      default: ''
    },
    subheadline: {
      type: String,
      default: ''
    },
    transformationPromise: {
      type: String,
      default: ''
    },
    coachSupport: {
      type: String,
      default: ''
    },
    communityAccess: {
      type: String,
      default: ''
    },
    guarantee: {
      type: String,
      default: ''
    },
    successMetrics: {
      type: [String],
      default: []
    },
    bonusResources: {
      type: [String],
      default: []
    },
    platformTools: {
      type: [String],
      default: []
    }
  },
  // Workout Routine specific fields
  workoutSpecificFields: {
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: null
    },
    duration: {
      type: Number, // Duration in minutes per session
      default: null
    },
    equipment: [{
      type: String // List of required equipment
    }],
    muscleGroups: [{
      type: String // Target muscle groups
    }],
    workoutFrequency: {
      type: String, // e.g., "3 times per week"
      default: null
    },
    customFrequency: {
      type: String, // Custom frequency description (e.g., "Every other day")
      default: null
    },
    workoutType: {
      type: String,
      enum: ['strength', 'cardio', 'hiit', 'circuit', 'endurance', 'flexibility', 'powerlifting', 'bodybuilding', 'crossfit', 'pilates', 'yoga', 'mixed'],
      default: null
    },
    targetGoal: {
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'toning', 'flexibility', 'rehabilitation', 'sports_performance', 'general_fitness'],
      default: null
    },
    restPeriods: {
      type: Number, // Rest periods in seconds
      default: null
    },
    exercisesPerSession: {
      type: Number, // Number of exercises per session
      default: null
    },
    programDuration: {
      type: String, // e.g., "4 weeks", "12 weeks"
      default: null
    },
    intensityLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'very_high'],
      default: null
    }
  },
  // Meal Plan specific fields
  mealPlanSpecificFields: {
    mealType: {
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'maintenance', 'keto', 'vegetarian', 'vegan', 'paleo', 'mediterranean', 'low_carb', 'high_protein', 'intermittent_fasting', 'diabetic', 'heart_healthy', 'custom'],
      default: null
    },
    duration: {
      type: Number, // Duration in days
      default: null
    },
    caloriesPerDay: {
      type: Number,
      default: null
    },
    mealsPerDay: {
      type: Number,
      default: null
    },
    // Macronutrient targets
    macronutrients: {
      proteinGrams: {
        type: Number, // Protein in grams per day
        default: null
      },
      carbsGrams: {
        type: Number, // Carbohydrates in grams per day
        default: null
      },
      fatsGrams: {
        type: Number, // Fats in grams per day
        default: null
      },
      proteinPercentage: {
        type: Number, // Protein as percentage of calories
        default: null
      },
      carbsPercentage: {
        type: Number, // Carbs as percentage of calories
        default: null
      },
      fatsPercentage: {
        type: Number, // Fats as percentage of calories
        default: null
      }
    },
    // Meal timing
    mealTiming: {
      breakfastTime: {
        type: String, // e.g., "7:00 AM"
        default: null
      },
      lunchTime: {
        type: String, // e.g., "12:30 PM"
        default: null
      },
      dinnerTime: {
        type: String, // e.g., "7:00 PM"
        default: null
      },
      snackTimes: [{
        type: String // e.g., ["10:00 AM", "3:00 PM"]
      }],
      fastingWindow: {
        type: String, // e.g., "16:8", "18:6"
        default: null
      }
    },
    // Dietary restrictions and preferences
    dietaryRestrictions: [{
      type: String // e.g., "gluten-free", "dairy-free", "nut-free", "soy-free", "egg-free", "shellfish-free", "fish-free"
    }],
    allergens: [{
      type: String // e.g., "peanuts", "tree_nuts", "dairy", "eggs", "soy", "wheat", "fish", "shellfish"
    }],
    // Cooking and preparation
    cookingDifficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: null
    },
    prepTimePerMeal: {
      type: Number, // Average prep time in minutes
      default: null
    },
    cookTimePerMeal: {
      type: Number, // Average cook time in minutes
      default: null
    },
    mealPrepFriendly: {
      type: Boolean,
      default: false
    },
    batchCooking: {
      type: Boolean,
      default: false
    },
    // Cuisine and style
    cuisineType: [{
      type: String // e.g., "Italian", "Asian", "Mexican", "Mediterranean", "American", "Indian", "Middle Eastern"
    }],
    mealStyle: {
      type: String,
      enum: ['simple', 'gourmet', 'quick', 'elaborate', 'one_pot', 'sheet_pan', 'slow_cooker', 'instant_pot'],
      default: null
    },
    // Additional features
    includesRecipes: {
      type: Boolean,
      default: false
    },
    includesShoppingList: {
      type: Boolean,
      default: false
    },
    includesNutritionLabels: {
      type: Boolean,
      default: false
    },
    includesMealPrepGuide: {
      type: Boolean,
      default: false
    },
    // Nutrition goals
    nutritionGoals: [{
      type: String // e.g., "high_fiber", "low_sodium", "high_antioxidants", "anti_inflammatory", "gut_health", "immune_boost"
    }],
    // Supplements and hydration
    supplementRecommendations: [{
      type: String // e.g., "protein_powder", "multivitamin", "omega3", "vitamin_d", "probiotics"
    }],
    waterIntakePerDay: {
      type: Number, // Liters per day
      default: null
    },
    // Serving information
    servingSize: {
      type: String, // e.g., "1 person", "2 people", "family of 4"
      default: null
    },
    // Budget and accessibility
    budgetLevel: {
      type: String,
      enum: ['budget', 'moderate', 'premium', 'luxury'],
      default: null
    },
    ingredientAvailability: {
      type: String,
      enum: ['common', 'specialty', 'gourmet', 'international'],
      default: null
    },
    // Special considerations
    suitableFor: [{
      type: String // e.g., "pregnancy", "elderly", "athletes", "children", "seniors", "diabetics", "heart_patients"
    }],
    // Meal plan structure
    mealPlanStructure: {
      type: String,
      enum: ['day_wise', 'week_wise', 'meal_type_wise', 'custom'],
      default: 'day_wise'
    },
    // Additional notes
    specialInstructions: {
      type: String,
      default: null
    }
  },
  // General Module Course specific fields
  generalModuleFields: {
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: null
    },
    estimatedDuration: {
      type: String, // e.g., "4 weeks", "2 months"
      default: null
    },
    prerequisites: [{
      type: String // Prerequisites for the course
    }],
    learningOutcomes: [{
      type: String // What students will learn
    }]
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentModule'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Content Module Schema (Day-wise or module-wise structure)
const contentModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  day: {
    type: Number,
    required: true,
    min: 1
  },
  order: {
    type: Number,
    default: 0
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentCourse',
    required: true
  },
  contents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentItem'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Content Item Schema (Individual content pieces - videos, PDFs, images, etc.)
const contentItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  contentType: {
    type: String,
    enum: ['video', 'image', 'pdf', 'audio', 'text', 'youtube', 'meal'], // Added 'meal' for meal planner
    required: true
  },
  content: {
    type: String, // URL, file path, or content
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentModule',
    required: true
  },
  // Meal-specific fields (only used when contentType is 'meal')
  mealData: {
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'beverage'],
      default: null
    },
    recipeName: {
      type: String,
      trim: true,
      default: null
    },
    ingredients: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      quantity: {
        type: String, // e.g., "2 cups", "500g", "1 tbsp"
        required: true
      },
      unit: {
        type: String, // e.g., "cups", "grams", "tablespoons"
        default: null
      },
      notes: {
        type: String, // Optional notes about the ingredient
        default: null
      }
    }],
    nutritionalInfo: {
      calories: {
        type: Number,
        default: null
      },
      protein: {
        type: Number, // in grams
        default: null
      },
      carbohydrates: {
        type: Number, // in grams
        default: null
      },
      fats: {
        type: Number, // in grams
        default: null
      },
      fiber: {
        type: Number, // in grams
        default: null
      },
      sugar: {
        type: Number, // in grams
        default: null
      },
      sodium: {
        type: Number, // in mg
        default: null
      }
    },
    cookingInstructions: {
      type: String, // Step-by-step cooking instructions
      default: null
    },
    prepTime: {
      type: Number, // in minutes
      default: null
    },
    cookTime: {
      type: Number, // in minutes
      default: null
    },
    totalTime: {
      type: Number, // in minutes (prep + cook)
      default: null
    },
    servingSize: {
      type: String, // e.g., "1 serving", "2-3 servings"
      default: null
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: null
    },
    mealImage: {
      type: String, // URL or file path for meal image
      default: null
    },
    mealVideo: {
      type: String, // URL or file path for cooking video (optional)
      default: null
    },
    tags: [{
      type: String // e.g., "quick", "healthy", "vegetarian", "gluten-free"
    }],
    notes: {
      type: String, // Additional notes or tips
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Customer Progress Schema (to track progress for each customer)
const customerProgressSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentCourse',
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentModule',
    required: true
  },
  contentItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentItem'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Coach Course Access Schema (tracks which coaches have access to which courses)
const coachCourseAccessSchema = new mongoose.Schema({
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentCourse',
    required: true
  },
  subscriptionPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan'
  },
  accessType: {
    type: String,
    enum: ['subscription', 'purchased', 'assigned'],
    required: true
  },
  canModify: {
    type: Boolean,
    default: false
  },
  canSell: {
    type: Boolean,
    default: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  }
});

// Add indexes for better performance
contentCourseSchema.index({ createdBy: 1, status: 1 });
contentCourseSchema.index({ courseType: 1, category: 1 });
contentModuleSchema.index({ courseId: 1, day: 1 });
contentItemSchema.index({ moduleId: 1, order: 1 });
customerProgressSchema.index({ customerId: 1, courseId: 1 });
customerProgressSchema.index({ courseId: 1 });
coachCourseAccessSchema.index({ coachId: 1, courseId: 1 });
coachCourseAccessSchema.index({ courseId: 1, status: 1 });
adminContentUploadSchema.index({ uploadedBy: 1, fileType: 1 });

module.exports = {
  AdminContentUpload: mongoose.model('AdminContentUpload', adminContentUploadSchema),
  ContentCourse: mongoose.model('ContentCourse', contentCourseSchema),
  ContentModule: mongoose.model('ContentModule', contentModuleSchema),
  ContentItem: mongoose.model('ContentItem', contentItemSchema),
  CustomerProgress: mongoose.model('CustomerProgress', customerProgressSchema),
  CoachCourseAccess: mongoose.model('CoachCourseAccess', coachCourseAccessSchema)
};

