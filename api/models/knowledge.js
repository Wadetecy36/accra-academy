const mongoose = require('mongoose');

const KnowledgeSchema = new mongoose.Schema({
    topic: String, content: String, category: String
});

const Knowledge = mongoose.models.Knowledge || mongoose.model('Knowledge', KnowledgeSchema);

module.exports = Knowledge;
