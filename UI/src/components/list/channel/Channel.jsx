import { useState, useEffect } from "react";
import ChannelList from "./channelList/ChannelList";
import ChannelInfo from "./channelInfo/ChannelInfo";
import "./channel.css";

const Channel = ({ selectedChannel, setSelectedChannel }) => {
  const [currentServerId, setCurrentServerId] = useState(null);

  return (
    <div className="channel">
      <ChannelList setCurrentServerId={setCurrentServerId} currentServerId={currentServerId} />
      {currentServerId ? (
        <ChannelInfo 
          selectedChannel={selectedChannel}
          serverId={currentServerId} 
          setSelectedChannel={setSelectedChannel}  // Pass the function to ChannelInfo
        />
      ) : (
        <p>Select a server to view channels</p>
      )}
    </div>
  );
};

export default Channel;


