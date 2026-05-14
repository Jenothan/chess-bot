const { NlpManager } = require('node-nlp');
const Rule = require('../models/Rule');

/**
 * Chatbot Logic
 * Uses node-nlp to manage intents and process natural language.
 */

// Initialize NlpManager for English
const manager = new NlpManager({ languages: ['en'], forceNER: true });

/**
 * Train and Save the model using data from MongoDB
 */
const trainBot = async () => {
    try {
        console.log('Bot training started (Dynamic from DB)...');

        // Fetch all rules from Database
        const rules = await Rule.find();

        if (rules.length === 0) {
            console.log('No rules found in DB. Please run seed script.');
            return;
        }

        // 1. Add Documents (Patterns) from questions array
        rules.forEach(rule => {
            rule.questions.forEach(q => {
                manager.addDocument('en', q, rule.intent);
            });

            // 2. Add Answer for this intent
            manager.addAnswer('en', rule.intent, rule.answer);
        });

        await manager.train();
        await manager.save();

        // Calculate total questions for logging
        const totalQuestions = rules.reduce((acc, r) => acc + r.questions.length, 0);
        console.log(`Bot training completed with ${totalQuestions} questions across ${rules.length} intents.`);
    } catch (err) {
        console.error('Bot training error:', err);
    }
};

/**
 * Process user message
 * @param {string} message - User input
 * @returns {object} - NLP processing result
 */
const processMessage = async (message) => {
    const response = await manager.process('en', message);
    return response;
};

// We don't call trainBot() here anymore. 
// It will be called from server.js after DB is connected.

module.exports = { processMessage, trainBot };
