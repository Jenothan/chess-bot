import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const TypingEffect = ({ text, speed = 15 }) => {
  const [displayedText, setDisplayedText] = React.useState('');
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return <span>{displayedText}</span>;
};

const App = () => {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem('currentSessionId') || Date.now().toString());
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('currentSessionId', sessionId);
    fetchHistory();
    // If we're starting a new session, clear current messages view
    // (Only if the session ID changed and it's not the first load)
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/chat/history');
      setHistory(response.data);

      // Load current session messages
      const currentSessionMessages = response.data
        .filter(chat => chat.sessionId === sessionId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map(chat => ([
          { text: chat.userMessage, sender: "user", id: `${chat._id}-u`, shouldType: false },
          { text: chat.botReply, sender: "bot", id: `${chat._id}-b`, shouldType: false }
        ])).flat();

      setMessages(currentSessionMessages);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    const tempId = Date.now();
    setMessages(prev => [...prev, { text: userMessage, sender: "user", id: tempId }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:5000/chat', {
        message: userMessage,
        sessionId: sessionId
      });
      setMessages(prev => [...prev, { text: response.data.reply, sender: "bot", id: tempId + 1, shouldType: true }]);
      // Wait a bit before fetching history to avoid state overwrite while typing
      setTimeout(() => fetchHistory(), 1000); 
    } catch (error) {
      console.error("Error communicating with backend:", error);
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to the server.", sender: "bot", id: tempId + 2 }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startNewChat = () => {
    const newId = Date.now().toString();
    setSessionId(newId);
    setMessages([]);
  };

  const selectSession = (id) => {
    setSessionId(id);
  };

  // Group history by date
  const groupHistory = () => {
    const groups = {
      "Today": [],
      "Yesterday": [],
      "Previous 7 Days": [],
      "Older": []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Get unique sessions based on first message
    const sessions = [];
    const seenSessions = new Set();

    history.forEach(chat => {
      if (!seenSessions.has(chat.sessionId)) {
        seenSessions.add(chat.sessionId);
        sessions.push(chat);
      }
    });

    sessions.forEach(session => {
      const date = new Date(session.timestamp);
      if (date >= today) groups["Today"].push(session);
      else if (date >= yesterday) groups["Yesterday"].push(session);
      else if (date >= lastWeek) groups["Previous 7 Days"].push(session);
      else groups["Older"].push(session);
    });

    return groups;
  };

  const groupedHistory = groupHistory();

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">♟️</span>
          <span className="sidebar-title">Chess Bot</span>
        </div>

        <button className="new-chat-btn" onClick={startNewChat}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>

        <div className="sidebar-divider"></div>

        <div className="history-container">
          {Object.entries(groupedHistory).map(([groupTitle, items]) => (
            items.length > 0 && (
              <div key={groupTitle} className="history-group">
                <div className="history-group-title">{groupTitle}</div>
                {items.map(item => (
                  <div
                    key={item.sessionId}
                    className={`history-item ${item.sessionId === sessionId ? 'active' : ''}`}
                    onClick={() => selectSession(item.sessionId)}
                  >
                    {item.userMessage}
                  </div>
                ))}
              </div>
            )
          ))}
        </div>
      </aside>

      <main className="main-content">
        <div className="chat-window">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-logo">♟️</div>
              <h2>How can I help you learn chess today?</h2>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                <div className={`message ${msg.sender}`}>
                  <div className="avatar">{msg.sender === 'bot' ? '♟️' : 'U'}</div>
                  <div className="message-bubble">
                    <div className="message-info">{msg.sender === 'bot' ? 'Coach' : 'You'}</div>
                    <div className="text">
                      {msg.sender === 'bot' && msg.shouldType ? (
                        <TypingEffect text={msg.text} />
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="message-wrapper bot">
              <div className="message bot">
                <div className="avatar">♟️</div>
                <div className="message-bubble">
                  <div className="typing-indicator">Coach is thinking...</div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="input-container">
          <form className="input-area" onSubmit={handleSend}>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Ask a chess question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="send-btn" disabled={!input.trim() || isTyping}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" /></svg>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default App;
