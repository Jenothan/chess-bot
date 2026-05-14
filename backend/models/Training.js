const mongoose = require('mongoose');

/**
 * Training Schema
 * Stores user-taught knowledge that can be reviewed or automatically used.
 */
const TrainingSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    taughtBy: {
        type: String,
        default: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Training', TrainingSchema);
