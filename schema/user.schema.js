const mongoose = require('mongoose');


const userSchema = mongoose.Schema(
  {
    firstName: { type: String },
    middleName: { type: String },
    lastName: { type: String },
    dob: { type: String },
    firstLanguage: { type: String },
    country: { type: String },
    maritalStatus: { type: String },
    gender: { type: String },
    email: { type: String },
    passport: { type: String },
    passport_expiry_date: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    state: { type: String },
    postalCode: { type: String },
    username: { type: String },
    fullName: { type: String },
    email: { type: String },
    password: { type: String },
    photo: { type: String },
    role: { type: String },
    otp: { type: Number },
    otpTimeStamp: { type: Number },
    otpVerified: { type: Boolean, default: false },
    mobile: { type: String },
    image: { type: String },
    nationality: { type: String },
    studentId: { type: String },
    qualification: [
      {
        degree: { type: String },
        country: { type: String },
        university: { type: String },
        cgpa_level: { type: String },
        score: { type: String },
        medium: { type: String },
        address: { type: String },
        course: { type: String },
        from: { type: String },
        to: { type: String },
      }
    ],
    school: [
      {
        grade: { type: String },
        name: { type: String },
        medium: { type: String },
        course: { type: String },
        address: { type: String },
        score: { type: String },
        cgpa_level: { type: String },
        from: { type: String },
        to: { type: String },
      }
    ],
    englishTest:[ {
      test: { type: String },
      overallScore: { type: String },
      listening: { type: String },
      reading: { type: String },
      speaking: { type: String },
      writing: { type: String },
      exam_date:{type:Date}
    }],
    preferred: {
      destination: { type: String },
      degree: { type: String },
      start_year: { type: String },
    },
    documents: {
      class10: { type: String },
      class12: { type: String },
      degree: { type: String },
      aadhaarFront: { type: String },
      aadhaarBack: { type: String },
      passportFirst: { type: String },
      passportLast: { type: String },
      birthCertificate: { type: String },
    },
    verificationStatus: {
      class10: {
        type: String,
        enum: ['not_uploaded', 'pending', 'approved', 'rejected'],
        default: 'not_uploaded'
      },
      class12: {
        type: String,
        enum: ['not_uploaded', 'pending', 'approved', 'rejected'],
        default: 'not_uploaded'
      },
      degree: {
        type: String,
        enum: ['not_uploaded', 'pending', 'approved', 'rejected'],
        default: 'not_uploaded'
      },
      aadhaarFront: {
        type: String,
        enum: ['not_uploaded', 'pending', 'approved', 'rejected'],
        default: 'not_uploaded'
      },
      aadhaarBack: {
        type: String,
        enum: ['not_uploaded', 'pending', 'approved', 'rejected'],
        default: 'not_uploaded'
      },
      passportFirst: {
        type: String,
        enum: ['not_uploaded', 'pending', 'approved', 'rejected'],
        default: 'not_uploaded'
      },
      passportLast: {
        type: String,
        enum: ['not_uploaded', 'pending', 'approved', 'rejected'],
        default: 'not_uploaded'
      },
      birthCertificate: {
        type: String,
        enum: ['not_uploaded', 'pending', 'approved', 'rejected'],
        default: 'not_uploaded',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'under_review'],
      default: 'pending'
    },
    uploadedOn: {
      type: Date,
      default: Date.now
    },
    verifiedOn: {
      type: Date,
      default: null
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    remarks: {
      type: String,
      default: null
    },
    applications: [
    {
      courseId: { 
        type: mongoose.Types.ObjectId, 
        ref: 'course',
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
    }
  ]
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


const User = mongoose.model('user', userSchema)

module.exports = User