const express = require('express');
const router = express.Router();
const { query, run, get } = require('../database');
const { processMessage } = require('../chatbot/bot');

/**
 * @route   POST /chat
 * @desc    Process chat messages and return coaching answers
 * @access  Public
 */
router.post('/', async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        let botReply = "";

        // --- Machine Learning Feature (Teaching) ---
        if (message.toLowerCase().startsWith('teach:')) {
            const teachContent = message.substring(6).trim();
            const eqIndex = teachContent.indexOf('=');

            if (eqIndex !== -1) {
                const question = teachContent.substring(0, eqIndex).trim();
                const answer = teachContent.substring(eqIndex + 1).trim();

                console.log(`[TEACH] questions="${question}" answer="${answer}"`);

                // 1. Save to Training collection
                await run('INSERT INTO training (question, answer) VALUES (?, ?)', [question, answer]);

                // 2. Update Rules collection (Grouped Structure)
                try {
                    // Try to identify intent for this question to see if it belongs to an existing group
                    const { trainBot } = require('../chatbot/bot');
                    const nlpRes = await processMessage(question);

                    if (nlpRes.score > 0.8 && nlpRes.intent !== 'None') {
                        // Found existing intent, add this question to the group
                        const rule = await get('SELECT * FROM rules WHERE intent = ?', [nlpRes.intent]);
                        if (rule) {
                            const questions = JSON.parse(rule.questions);
                            if (!questions.includes(question)) {
                                questions.push(question);
                                await run('UPDATE rules SET questions = ?, answer = ? WHERE intent = ?', [JSON.stringify(questions), answer, rule.intent]);
                                console.log(`[TEACH] Added question to existing intent: ${rule.intent}`);
                            }
                        }
                    } else {
                        // Create a new unique intent for this new knowledge
                        const newIntent = `user.${question.toLowerCase().replace(/\s+/g, '.')}`;
                        await run('INSERT INTO rules (intent, questions, answer) VALUES (?, ?, ?)', [newIntent, JSON.stringify([question]), answer]);
                        console.log(`[TEACH] Created new intent: ${newIntent}`);
                    }

                    // Re-train bot in background so it learns the new question immediately
                    trainBot();
                } catch (ruleErr) {
                    console.error(`[TEACH] Rule save ERROR:`, ruleErr.message);
                }

                botReply = `Got it! I've learned about "${question}". You can ask me anytime.`;
            } else {
                botReply = "To teach me, use the format: teach: question = answer";
            }
        } else {
            // --- New Architecture: NLP -> Intent -> DB Lookup ---
            const nlpResult = await processMessage(message);
            console.log(`[NLP] Identified Intent: ${nlpResult.intent}, Score: ${nlpResult.score}`);

            let matchedIntent = nlpResult.intent;

            // --- Improvement: Keyword Fallback if score is low or intent is None ---
            if (!matchedIntent || matchedIntent === 'None' || nlpResult.score < 0.5) {
                console.log(`[NLP] Low confidence (${nlpResult.score}), trying keyword fallback...`);
                const allRules = await query('SELECT * FROM rules');
                const keywordMatch = allRules.find(r => {
                    const questions = JSON.parse(r.questions);
                    return questions.some(q =>
                        message.toLowerCase().includes(q.toLowerCase()) ||
                        q.toLowerCase().includes(message.toLowerCase())
                    );
                });

                if (keywordMatch) {
                    console.log(`[DB] Keyword match found for intent: ${keywordMatch.intent}`);
                    matchedIntent = keywordMatch.intent;
                }
            }

            if (matchedIntent && matchedIntent !== 'None') {
                // Search DB for this specific intent
                const rule = await get('SELECT * FROM rules WHERE intent = ?', [matchedIntent]);
                if (rule) {
                    botReply = rule.answer;
                } else {
                    botReply = nlpResult.answer || "I understand the topic but couldn't find the lesson in my database.";
                }
            } else {
                botReply = "I'm still learning and don't know this chess rule yet. Can you teach me? \n\nPlease use the format: **teach: question = answer** (e.g., *teach: pawn promotion = when a pawn reaches the last rank...*)";
            }
        }

        // --- Save Chat History ---
        await run('INSERT INTO chats (sessionId, userMessage, botReply) VALUES (?, ?, ?)', [sessionId, message, botReply]);

        return res.json({ reply: botReply });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ reply: "Oops! Something went wrong on my end." });
    }
});

/**
 * @route   GET /chat/history
 * @desc    Get all chat history for grouping
 */
router.get('/history', async (req, res) => {
    try {
        const history = await query('SELECT * FROM chats ORDER BY timestamp DESC');
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

module.exports = router;
