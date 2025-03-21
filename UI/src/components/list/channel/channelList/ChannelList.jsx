import { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import "./channelList.css"
import { collection, getDocs, addDoc, doc, deleteDoc } from "firebase/firestore";

const ChannelList = ({ setCurrentServerId, currentServerId }) => {

    const [servers, setServers] = useState([]); // FIX: Declare useState for servers
    const [showAddServerModal, setShowAddServerModal] = useState(false); // Manage modal visibility
    const [newServerName, setNewServerName] = useState(""); // Store new server name
    const [newServerIcon, setNewServerIcon] = useState(""); // Store new server icon URL

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

        // Handle creating a new server
    const handleAddServer = async () => {
      if (!newServerName.trim()) return; // Validate server name
  
      try {
        const newServer = {
          name: newServerName,
          icon: newServerIcon || "/avatar.png", // Default icon if not provided
          };
  
        // Add new server to Firestore
        const docRef = await addDoc(collection(db, "servers"), newServer);
        console.log("Server created with ID:", docRef.id);
  
        // Reset the form and close the modal
        setNewServerName("");
        setNewServerIcon("");
        setShowAddServerModal(false);
  
        // Refresh server list
        const querySnapshot = await getDocs(collection(db, "servers"));
        const updatedServerList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServers(updatedServerList);
  
      } catch (error) {
        console.error("Error adding new server:", error);
      }
    };

    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewServerIcon(reader.result); // Base64 URL (temporary storage)
        };
        reader.readAsDataURL(file);
      }
    };

    const handleDeleteServer = async (serverId) => {
      if (!window.confirm("Are you sure you want to delete this server?")) return;
    
      try {
        await deleteDoc(doc(db, "servers", serverId));
        setServers((prevServers) => prevServers.filter((server) => server.id !== serverId));
        console.log("Server deleted:", serverId);
      } catch (error) {
        console.error("Error deleting server:", error);
      }
    };

    return (
      <div className="channelList">
        <button className="addServerButton" onClick={() => setShowAddServerModal(true)}>
        <img src="./plus.png" alt=""/>
        </button>
        {servers.length > 0 ? (
          servers.map((server) => (
            <div
              key={server.id}
              className={`server ${currentServerId === server.id ? "activeServer" : ""}`}
              onClick={() => setCurrentServerId(server.id)}
            >
              <img src={server.icon || "/avatar.png"} alt={server.name} />
              {/*
              <button 
                className="deleteServerButton" 
                onClick={(e) => { 
                  e.stopPropagation(); // Prevent the click from triggering the server selection
                  handleDeleteServer(server.id);
                }}
              >
                ❌
              </button>*/}
            </div>
          ))
        ) : (
          <p>Loading servers...</p>
        )}

        {showAddServerModal && (
          <div className="addServerModal">
            <div className="modalContent">
              <h3>Create a New Server</h3>
              <input
                type="text"
                placeholder="Server Name"
                value={newServerName}
                onChange={(e) => setNewServerName(e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e)}
              />
              <div className="modalButtons">
                <button className="cancelButton" onClick={() => setShowAddServerModal(false)}>
                  Cancel
                </button>
                <button className="createButton" onClick={handleAddServer}>
                  Create Server
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
};

export default ChannelList;
