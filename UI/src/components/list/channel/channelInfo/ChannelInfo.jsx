import { useState, useEffect } from "react";
import { db } from "../../../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./channelInfo.css";

const ChannelInfo = ({ serverId, setSelectedChannel, selectedChannel }) => {
  const [channels, setChannels] = useState([]);

  useEffect(() => {

    // When serverId changes, reset the selected channel (clear the chat)
    setSelectedChannel(null);

    const getChannels = async () => {
      if (!serverId) return;

      try {
        const q = query(collection(db, "channels"), where("serverId", "==", serverId));
        const querySnapshot = await getDocs(q);
        const channelList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChannels(channelList);
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };

    getChannels();
  }, [serverId, setSelectedChannel]);

  return (
    <div className="channelInfo">
      {channels.length > 0 ? (
        channels.map((channel) => (
          <div
            key={channel.id}
            className={`channelItem ${selectedChannel === channel.id ? "selected" : ""}`}
            onClick={() => setSelectedChannel(channel.id)} // Call the function to set selected channel
          >
            <p>{channel.name}</p>
          </div>
        ))
      ) : (
        <p>No channels found for this server</p>
      )}
    </div>
  );
};

export default ChannelInfo;





