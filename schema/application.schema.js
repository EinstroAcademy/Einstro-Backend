const mongoose = require('mongoose');


const applicationSchema = mongoose.Schema(
    {
        courseId: {
            type: mongoose.Types.ObjectId,
            ref: 'course',
            required: true
        },
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            required: true
        },
        universityId: {
            type: mongoose.Types.ObjectId,
            ref: 'university',
            required: true
        },
        appliedDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted'],
            default: 'pending'
        },
        applicationNumber: {
            type: String,
            unique: true
        },
        intake: {
            type: String, // e.g., "Fall 2024", "Spring 2025"
        },
        tuitionFees: {
            type: String
        },
        currency: {
            type: String,
            default: 'USD'
        },
        personalStatement: {
            type: String
        },
        additionalDocuments: [{
            documentType: String, // e.g., "SOP", "LOR", "CV"
            documentUrl: String,
            uploadedDate: { type: Date, default: Date.now }
        }],
        applicationDeadline: {
            type: Date
        },
        statusHistory: [{
            status: String,
            updatedDate: { type: Date, default: Date.now },
            updatedBy: String, // Admin/System
            remarks: String
        }],
        submittedDate: {
            type: Date
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
); 


const Application =mongoose.model('application',applicationSchema)

module.exports=Application
