const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    text: String, isActive: { type: Boolean, default: true }, createdAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);

module.exports = Announcement;
