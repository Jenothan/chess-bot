const mongoose = require('mongoose');

/**
 * Rule Schema
 * Stores chess rules and answers for the chatbot fallback.
 */
const RuleSchema = new mongoose.Schema({
  intent: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  questions: [{
    type: String,
    required: true,
    trim: true,
  }],
  answer: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Rule', RuleSchema);
