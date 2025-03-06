// chatWindow.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';  // import our Firestore instance
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

import './ChatWindow.css';
import MessageInput from './MessageInput.js';

function ChatWindow({ userId }) {
  const [messages, setMessages] = useState([]);

  // We'll hard-code a conversation ID for this demo
  const conversationId = 'demo-convo';

  useEffect(() => {
    // Reference the messages sub-collection
    // Path: /conversations/demo-convo/messages
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');

    // Sort messages by timestamp
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    // Listen for real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [conversationId]);

  // This function is called when user hits "Send"
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    await addDoc(messagesRef, {
      text: text,
      sender: userId,
      timestamp: serverTimestamp()  // server-generated timestamp
    });
  };

  return (
    <div className="chatWindow">
      <div className="chatHeader">
        <h2># demo-convo</h2>
      </div>

      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>

      {/* Pass the send function to the input */}
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}

export default ChatWindow;

