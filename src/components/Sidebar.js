import React from 'react';
import './Sidebar.css'; // Make sure you create this file or remove this import if you’re not using it

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Channels</h2>
      <ul>
        <li># general</li>
        <li># random</li>
      </ul>
    </div>
  );
}

export default Sidebar;
