// messageInput.js
import React, { useState } from 'react';
import './MessageInput.css';

function MessageInput({ onSend }) {
  const [message, setMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);   // call the parent-provided function
    setMessage('');    // clear the input
  };

  return (
    <form className="messageInput" onSubmit={handleSendMessage}>
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}

export default MessageInput;

