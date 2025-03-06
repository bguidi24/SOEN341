// App.js
import React, { useState } from 'react';
import './App.css';

import Sidebar from './components/Sidebar.js';
import ChatWindow from './components/ChatWindow.js';

function App() {
  // This state holds which user is "logged in"
  const [userId, setUserId] = useState('user1');

  return (
    <div className="app">
      {/* Demo login buttons */}
      <div style={{ padding: '1rem' }}>
        <button onClick={() => setUserId('user1')}>Login as user1</button>
        <button onClick={() => setUserId('user2')}>Login as user2</button>
        <p>Current user: {userId}</p>
      </div>

      <Sidebar />
      {/* Pass userId to ChatWindow so it knows who's sending messages */}
      <ChatWindow userId={userId} />
    </div>
  );
}

export default App;

