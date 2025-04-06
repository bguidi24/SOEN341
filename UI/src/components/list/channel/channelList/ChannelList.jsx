import { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import "./channelList.css"

import { collection, getDocs, addDoc, onSnapshot, doc, setDoc} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const ChannelList = ({ setCurrentServerId, currentServerId, setIsDMMode}) => {

    const [servers, setServers] = useState([]); // FIX: Declare useState for servers
    const [showAddServerModal, setShowAddServerModal] = useState(false); // Manage modal visibility
    const [newServerName, setNewServerName] = useState(""); // Store new server name
    const [newServerIcon, setNewServerIcon] = useState(""); // Store new server icon URL

    const auth = getAuth();
    const currentUserId = auth.currentUser?.uid;

    useEffect(() => {
      if (!currentUserId) return;
    
      const unsubscribe = onSnapshot(collection(db, "servers"), async (snapshot) => {
        const allServers = snapshot.docs;
        const memberServerList = [];
    
        for (const serverDoc of allServers) {
          const serverId = serverDoc.id;
          const memberDocRef = doc(db, "servers", serverId, "members", currentUserId);
    
          const memberDocSnap = await getDocs(collection(db, `servers/${serverId}/members`));
          const isMember = memberDocSnap.docs.find((doc) => doc.id === currentUserId);
    
          if (isMember) {
            memberServerList.push({
              id: serverId,
              ...serverDoc.data(),
            });
          }
        }
    
        setServers(memberServerList);
      });
    
      return () => unsubscribe();
    }, [currentUserId]);

    // Handle creating a new server
    const handleAddServer = async () => {
      if (!newServerName.trim()) return;
    
      try {
        const newServer = {
          name: newServerName,
          icon: newServerIcon || "/logo192.png",
        };
        
        // Add new server to Firestore
        const docRef = await addDoc(collection(db, "servers"), newServer);
        console.log("Server created with ID:", docRef.id);
        
        // ✅ Add current user to the new server's members subcollection
        await setDoc(doc(db, "servers", docRef.id, "members", currentUserId), {
          joinedAt: new Date(),
          role: "owner", // or "member"
        });
        
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

    return (
      <div className="channelList">
        <div className="serverContainer">
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
                <img src={server.icon || "/logo192.png"} alt={server.name} />
              </div>
            ))
          ) : (
            <p></p>
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
        <div className="directMessageContainer">
          <button
            className="directMessageButton"
            onClick={() => {
              setCurrentServerId(null);     // Optional: clear selection
              setIsDMMode(true);            // 👉 Switch to ChatList (DMs)
            }}
            >
            <img src="./messenger.png" alt="Direct Messages" />
          </button>
        </div>
      </div>
    );
};

export default ChannelList;
