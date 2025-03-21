import React, { useState } from "react";
import List from "./components/list/List";
import Chat from "./components/chat/Chat";

const App = () => {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);

  return (
    <div className='container'>
      <List selectedChannel={selectedChannel} setSelectedChannel={setSelectedChannel} setSelectedServer={setSelectedServer} /> {/* Pass function to List */}
      <Chat channelId={selectedChannel} serverId={selectedServer}/> {/* Pass selectedChannel to Chat */}
    </div>
  );
};

export default App;
