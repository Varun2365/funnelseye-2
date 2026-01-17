const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    productType: {
        type: String,
        enum: ['coaching_session', 'program', 'course', 'consultation', 'package'],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { _id: false });

const CartSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    items: {
        type: [CartItemSchema],
        default: []
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    status: {
        type: String,
        enum: ['active', 'abandoned', 'recovery_sent', 'completed', 'expired'],
        default: 'active'
    },
    abandonedAt: {
        type: Date
    },
    recoverySentAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    paymentId: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
CartSchema.index({ coachId: 1, status: 1 });
CartSchema.index({ leadId: 1 });
CartSchema.index({ status: 1, updatedAt: 1 });
CartSchema.index({ status: 'active', updatedAt: 1 });

// Virtual for item count
CartSchema.virtual('itemCount').get(function() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Pre-save middleware to calculate totals
CartSchema.pre('save', function(next) {
    // Calculate subtotal from items
    this.subtotal = this.items.reduce((total, item) => total + item.total, 0);
    
    // Calculate final total
    this.total = this.subtotal + this.tax - this.discount;
    
    next();
});

// Method to add item to cart
CartSchema.methods.addItem = function(itemData) {
    const existingItemIndex = this.items.findIndex(item => 
        item.productId === itemData.productId && 
        item.productType === itemData.productType
    );

    if (existingItemIndex > -1) {
        // Update existing item
        this.items[existingItemIndex].quantity += itemData.quantity || 1;
        this.items[existingItemIndex].total = this.items[existingItemIndex].quantity * this.items[existingItemIndex].unitPrice;
    } else {
        // Add new item
        const newItem = {
            ...itemData,
            total: (itemData.quantity || 1) * itemData.unitPrice
        };
        this.items.push(newItem);
    }

    this.status = 'active';
    this.updatedAt = new Date();
};

// Method to remove item from cart
CartSchema.methods.removeItem = function(productId, productType) {
    this.items = this.items.filter(item => 
        !(item.productId === productId && item.productType === productType)
    );
    
    this.updatedAt = new Date();
};

// Method to clear cart
CartSchema.methods.clearCart = function() {
    this.items = [];
    this.subtotal = 0;
    this.tax = 0;
    this.discount = 0;
    this.total = 0;
    this.updatedAt = new Date();
};

// Method to apply discount
CartSchema.methods.applyDiscount = function(discountAmount, discountCode) {
    this.discount = Math.min(discountAmount, this.subtotal);
    this.metadata.discountCode = discountCode;
    this.updatedAt = new Date();
};

// Method to mark as abandoned
CartSchema.methods.markAbandoned = function() {
    this.status = 'abandoned';
    this.abandonedAt = new Date();
    this.updatedAt = new Date();
};

// Method to mark recovery sent
CartSchema.methods.markRecoverySent = function() {
    this.status = 'recovery_sent';
    this.recoverySentAt = new Date();
    this.updatedAt = new Date();
};

// Method to mark completed
CartSchema.methods.markCompleted = function(paymentId) {
    this.status = 'completed';
    this.completedAt = new Date();
    this.paymentId = paymentId;
    this.updatedAt = new Date();
};

// Static method to find abandoned carts
CartSchema.statics.findAbandonedCarts = function(hoursThreshold = 24) {
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - hoursThreshold);
    
    return this.find({
        status: 'active',
        updatedAt: { $lt: thresholdDate }
    });
};

// Static method to find carts for recovery
CartSchema.statics.findCartsForRecovery = function() {
    const recoveryThreshold = new Date();
    recoveryThreshold.setHours(recoveryThreshold.getHours() - 24);
    
    return this.find({
        status: 'active',
        updatedAt: { $lt: recoveryThreshold },
        items: { $exists: true, $ne: [] }
    });
};

module.exports = mongoose.models.Cart || mongoose.model('Cart', CartSchema);
