const mongoose = require('mongoose');

const SecurityLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    eventType: { type: String, required: true, index: true }, // 'login', 'create_student', 'delete_student', 'bulk_action'
    ipAddress: { type: String },
    userAgent: { type: String },
    details: { type: mongoose.Schema.Types.Mixed }, // Flexible object for extra data
    timestamp: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('SecurityLog', SecurityLogSchema);
