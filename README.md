# ♟️ ChessBot - Intelligent Coaching AI

ChessBot is a modern, full-stack AI chatbot designed to help players learn chess rules, strategies, and concepts. It features a sleek, premium dark-mode interface inspired by ChatGPT and uses Advanced Natural Language Processing (NLP) combined with a persistent MongoDB knowledge base.

---

## 🚀 Key Features

- **Natural Language Understanding**: Uses `node-nlp` to identify user intents regardless of phrasing.
- **Intent-Based DB Lookup**: A robust architecture where NLP identifies the topic and fetches the official answer from MongoDB.
- **Machine Learning (Teaching)**: Users can teach the bot new rules in real-time using the `teach:` command.
- **Session History**: ChatGPT-style sidebar that groups your chat history by date (Today, Yesterday, etc.).
- **Premium Aesthetics**: A stunning monochrome and gold theme with responsive speech bubbles and smooth animations.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MongoDB Community Server** (Installed and running on port 27017)

---

## 💾 Database Setup

1. **Install MongoDB**: Download and install from [MongoDB Official Site](https://www.mongodb.com/try/download/community).
2. **Start MongoDB**:
   - On Windows: The service usually starts automatically. If not, run `net start MongoDB` in an Administrator terminal.
   - The bot connects to `mongodb://127.0.0.1:27017/chessbot` by default.

---

## 📥 Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd chess-coach-chatbot
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   ```

---

## 🚀 Running the Application

### 1. Seed the Knowledge Base
Populate the database with the initial 13 chess intents and 40+ training patterns:
```bash
cd backend
node seed.js
```

### 2. Start the Backend
```bash
cd backend
npm run dev
```
*Server runs on `http://localhost:5000`*

### 3. Start the Frontend
```bash
cd frontend
npm run dev
```
*Application runs on `http://localhost:5173`*

---

## 🧠 How to Teach the Bot

You can expand the bot's knowledge in real-time! Use the following format in the chat:

**Format:** `teach: [Question] = [Answer]`

**Example:**
- `teach: what is en passant = En passant is a special pawn capture move in chess...`
- `teach: who is magnus carlsen = Magnus Carlsen is a Norwegian chess grandmaster and former World Champion.`

The bot will automatically re-train itself and learn the new rule instantly!

---

## 🏗️ Folder Structure

- `backend/`: Node.js/Express server.
  - `models/`: Mongoose schemas (Rule, Chat, Training).
  - `routes/`: API endpoints (Chat logic).
  - `chatbot/`: NLP engine and training logic.
  - `seed.js`: Initial database population script.
- `frontend/`: React + Vite application.
  - `src/App.jsx`: Main UI logic and session management.
  - `src/App.css`: Premium styling and layout.

---

## 🛡️ License
Created for University Project - ChessMate AI Refactor.
