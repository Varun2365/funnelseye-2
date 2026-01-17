const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Lead must be associated with a coach.']
    },
    funnelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Funnel',
    },
    funnelName: {
        type: String,
        trim: true,
        maxlength: [100, 'Funnel name can not be more than 100 characters']
    },
    name: {
        type: String,
        required: [true, 'Please add a name for the lead'],
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters'],
        required: false
    },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted', 'Follow-up'],
        default: 'New'
    },
    source: {
        type: String,
        required: [true, 'Please add a lead source'],
        default: 'Funnel Form'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes can not be more than 500 characters']
    },
    leadTemperature: {
        type: String,
        enum: ['Cold', 'Warm', 'Hot'],
        default: 'Warm',
        required: [true, 'Please specify lead temperature']
    },
    lastFollowUpAt: {
        type: Date,
        required: false
    },
    nextFollowUpAt: {
        type: Date,
        required: false
    },
    followUpHistory: [
        {
            note: {
                type: String,
                required: [true, 'Follow-up note is required.']
            },
            followUpDate: {
                type: Date,
                default: Date.now
            },
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: false
            }
        }
    ],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true
});

LeadSchema.index({ coachId: 1, funnelId: 1, email: 1 });
LeadSchema.index({ coachId: 1, createdAt: -1 });
LeadSchema.index({ coachId: 1, leadTemperature: 1, nextFollowUpAt: 1 });

module.exports = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);



// {
//   "coachId": "60d5ec49f7b6c3a2d8e0f123",
//   "funnelId": "60d5ec49f7b6c3a2d8e0f456",
//   "funnelName": "My Awesome Marketing Funnel Q3",
//   "name": "Jane Doe",
//   "email": "jane.doe@example.com",
//   "phone": "+15551234567",
//   "status": "New",
//   "source": "Funnel Form",
//   "notes": "Interested in premium coaching package. Mentioned previous bad experience with another coach.",
//   "leadTemperature": "Hot",
//   "lastFollowUpAt": "2025-07-20T14:30:00.000Z",
//   "nextFollowUpAt": "2025-07-28T10:00:00.000Z",
//   "followUpHistory": [
//     {
//       "note": "Initial contact via email. Responded positively.",
//       "followUpDate": "2025-07-20T14:30:00.000Z",
//       "createdBy": "60d5ec49f7b6c3a2d8e0f123"
//     },
//     {
//       "note": "Follow-up call to discuss specific needs. Expressed strong interest in price point X.",
//       "followUpDate": "2025-07-22T11:00:00.000Z",
//       "createdBy": "60d5ec49f7b6c3a2d8e0f123"
//     }
//   ],
//   "assignedTo": "60d5ec49f7b6c3a2d8e0f789"
// }