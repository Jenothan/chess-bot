const mongoose = require('mongoose');
const Rule = require('./models/Rule');
const Training = require('./models/Training');
const dotenv = require('dotenv');

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chessbot');
        const rules = await Rule.find();
        const trainings = await Training.find();

        console.log("--- RULES COLLECTION ---");
        console.log(JSON.stringify(rules, null, 2));

        console.log("\n--- TRAINING COLLECTION ---");
        console.log(JSON.stringify(trainings, null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
