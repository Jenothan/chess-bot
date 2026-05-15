const { run } = require('./database');
const dotenv = require('dotenv');

dotenv.config();

const initialRules = [
    {
        intent: "bishop.move",
        questions: ["how bishop move", "how does bishop move", "explain bishop movement", "can bishop move diagonal"],
        answer: "A bishop moves diagonally across the board any number of squares."
    },
    {
        intent: "rook.move",
        questions: ["how rook move", "how does rook move", "rook movement", "can rook move straight"],
        answer: "A rook moves horizontally or vertically across the board any number of squares."
    },
    {
        intent: "knight.move",
        questions: ["how knight move", "knight movement", "how does knight move", "knight jump"],
        answer: "A knight moves in an L-shape (two squares in one direction, then one square perpendicular) and can jump over other pieces."
    },
    {
        intent: "queen.move",
        questions: ["how queen move", "how does queen move", "queen movement"],
        answer: "The queen moves any number of squares along a rank, file, or diagonal (combining the powers of a rook and a bishop)."
    },
    {
        intent: "king.move",
        questions: ["how king move", "how does king move", "king movement"],
        answer: "The king moves exactly one square in any direction: horizontally, vertically, or diagonally."
    },
    {
        intent: "pawn.move",
        questions: ["how pawn move", "pawn movement", "how does pawn move"],
        answer: "A pawn moves forward one square, but on its first move it can move two squares. It captures diagonally."
    },
    {
        intent: "castling",
        questions: ["what is castling", "explain castling", "how to castle"],
        answer: "Castling is a special move involving the king and either rook. It is the only time two pieces move in one turn."
    },
    {
        intent: "checkmate",
        questions: ["what is checkmate", "explain checkmate", "how to win in chess"],
        answer: "Checkmate is a position in which the king is under threat of capture and there is no way to escape."
    },
    {
        intent: "stalemate",
        questions: ["what is stalemate", "explain stalemate", "is stalemate a draw"],
        answer: "Stalemate is a situation where the player whose turn it is is not in check but has no legal moves. It results in a draw."
    },
    {
        intent: "opening",
        questions: ["tell me about openings", "chess openings", "best chess opening"],
        answer: "A chess opening is the initial stage of a game. Popular openings include the Ruy Lopez, Sicilian Defense, and the Queen's Gambit."
    },
    {
        intent: "greetings",
        questions: ["hello", "hi", "hey", "good morning", "good afternoon"],
        answer: "Hello! I am ChessBot, your friendly chess coach. How can I help you today?"
    },
    {
        intent: "thanks",
        questions: ["thanks", "thank you", "cool", "that helps", "bye"],
        answer: "You're welcome! I'm happy to help you with your chess journey."
    }
];

const seedDB = async () => {
    try {
        console.log("Seeding SQLite database...");

        // Clear existing rules
        await run('DELETE FROM rules');

        // Insert new rules
        for (const rule of initialRules) {
            await run(
                'INSERT INTO rules (intent, questions, answer) VALUES (?, ?, ?)',
                [rule.intent, JSON.stringify(rule.questions), rule.answer]
            );
        }

        console.log(`Database seeded with ${initialRules.length} intents successfully!`);
        process.exit();
    } catch (err) {
        console.error("Error seeding database:", err);
        process.exit(1);
    }
};

// Give a moment for database initialization
setTimeout(seedDB, 1000);
