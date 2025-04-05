import { useState, useEffect } from "react";
import ChannelList from "./channelList/ChannelList";
import ChannelInfo from "./channelInfo/ChannelInfo";
import ChatList from "./chatList/ChatList";
import "./channel.css";

const Channel = ({ selectedChannel, setSelectedChannel, setSelectedServer, isDMMode, setIsDMMode }) => {

  const [currentServerId, setCurrentServerId] = useState(null);

  const handleServerSelect = (serverId) => {
    setCurrentServerId(serverId);
    setSelectedServer(serverId);
    setIsDMMode(false); // 🔁 Go back to ChannelInfo when selecting a server
  };

  return (
    <div className="channel">
      <ChannelList
        setCurrentServerId={handleServerSelect}
        currentServerId={currentServerId}
        isDMMode={isDMMode}
        setIsDMMode={setIsDMMode} // 👈 pass this down
      />

      {isDMMode ? (
        <ChatList /> // 👈 DM View
      ) : currentServerId ? (
        <ChannelInfo
          selectedChannel={selectedChannel}
          serverId={currentServerId}
          setSelectedChannel={setSelectedChannel}
        />
      ) : (
        <p></p>
      )}
    </div>
  );
};

export default Channel;


