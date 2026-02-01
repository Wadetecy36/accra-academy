const mongoose = require('mongoose');

// Academic Record Schema (Embedded)
const AcademicRecordSchema = new mongoose.Schema({
    form: { type: String, required: true },
    year: { type: Number, required: true },
    gpa: { type: Number },
    remarks: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const StudentSchema = new mongoose.Schema({
    // Basic Info
    name: { type: String, required: true, index: true },
    indexNumber: { type: String, unique: true, sparse: true, index: true }, // Optional but unique if present
    password: { type: String, required: true }, // Default password
    gender: { type: String, enum: ['Male', 'Female'] },
    dateOfBirth: { type: Date },

    // Academic Info
    program: {
        type: String,
        required: true,
        enum: ["General Science", "Business", "General Arts", "Visual Arts", "Agriculture", "Home Economics"]
    },
    hall: {
        type: String,
        enum: [
            "Alema Hall", "Ellen Hall", "Halm Addo Hall", "Nana Wereko Ampem II Hall",
            "Wilson Q .Tei Hall", "Awuletey Hall", "Peter Ala Adjetey Hall",
            "Nana Akuako Sarpong Hall", "Nana Awuah Darko Ampem Hall"
        ]
    },
    classRoom: { type: String },
    enrollmentYear: { type: Number, required: true, index: true },

    // Contact Info
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String },

    // Guardian Info
    guardianName: { type: String },
    guardianPhone: { type: String },

    // Photo (Base64 or URL)
    photoFile: { type: String }, // Can store base64 string or URL path

    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If you have a User model for admins

    // Embedded Records
    academicHistory: [AcademicRecordSchema]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual: Current Form Calculation
StudentSchema.virtual('currentForm').get(function () {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (0 = Jan, 8 = Sept)

    // School year usually transitions in September/October
    // If it's before September, we are still in the previous academic year
    const academicYearOffset = currentMonth < 8 ? 0 : 1;
    const diff = (currentYear + academicYearOffset) - (this.enrollmentYear + 1);

    if (diff >= 3) return "Completed";
    if (diff === 2) return "Third Form";
    if (diff === 1) return "Second Form";
    if (diff === 0) return "First Form";
    return "Pre-Enrollment";
});

// Virtual: Age Calculation
StudentSchema.virtual('age').get(function () {
    if (!this.dateOfBirth) return null;
    const diffMs = Date.now() - this.dateOfBirth.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
});

// Indexes for Dashboard Filters
StudentSchema.index({ program: 1, enrollmentYear: 1 });
StudentSchema.index({ hall: 1, enrollmentYear: 1 });
StudentSchema.index({ name: 'text', indexNumber: 'text', email: 'text' }); // Text Search

module.exports = mongoose.model('Student', StudentSchema);
