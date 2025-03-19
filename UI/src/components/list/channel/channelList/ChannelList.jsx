import { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import "./channelList.css"
import { collection, getDocs } from "firebase/firestore";

const ChannelList = ({ setCurrentServerId, currentServerId }) => {

    const [servers, setServers] = useState([]); // FIX: Declare useState for servers

    useEffect(() => {
        const fetchServers = async () => {
          try {
            console.log("Fetching servers from Firestore..."); // Debugging log
    
            const querySnapshot = await getDocs(collection(db, "servers"));
    
            if (querySnapshot.empty) {
              console.warn("No servers found in Firestore.");
              return;
            }
    
            const serverList = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
    
            console.log("Servers retrieved:", serverList); // Debugging log
            setServers(serverList);
          } catch (error) {
            console.error("Error fetching servers:", error);
          }
        };
    
        fetchServers();
      }, []);

    return (
        <div className="channelList">
        {servers.length > 0 ? (
          servers.map((server) => (
            <div
              key={server.id}
              className={`server ${currentServerId === server.id ? "activeServer" : ""}`}
              onClick={() => setCurrentServerId(server.id)}
            >
              <img src={server.icon || "/avatar.png"} alt={server.name} />
            </div>
          ))
        ) : (
          <p>Loading servers...</p>
        )}
        </div>
    );
};

export default ChannelList;
