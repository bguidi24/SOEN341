import { useState, useEffect } from "react";
import { db } from "../../../../firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc, getDoc } from "firebase/firestore";
import "./channelInfo.css";

const ChannelInfo = ({ serverId, setSelectedChannel, selectedChannel, userId }) => {
  const [channels, setChannels] = useState([]);
  const [newChannelName, setNewChannelName] = useState("");
  const [showAddChannel, setShowAddChannel] = useState(false); // Toggle add channel form
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState(null);
  const [userRole, setUserRole] = useState(""); // State to store user's role
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch channels and user role
  useEffect(() => {
    if (!serverId || !userId) return;

    console.log("userId in ChannelInfo:", userId);

    // Fetch channels
    const getChannels = async () => {
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

    // Fetch user role
    const getUserRole = async () => {
      try {
        const memberRef = doc(db, "servers", serverId, "members", userId);
        const memberSnap = await getDoc(memberRef);
    
        if (memberSnap.exists()) {
          const userData = memberSnap.data();
          console.log("User role:", userData.role);
          setUserRole(userData.role); // 'admin', 'owner', etc.
        } else {
          console.log("User is not a member of this server.");
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole(null);
      }
    };

    getChannels();
    getUserRole();
  }, [serverId, userId]);

  // Handle channel creation
  const handleAddChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
  
    try {
      const newChannelRef = await addDoc(collection(db, "channels"), {
        name: newChannelName,
        serverId,
        timestamp: serverTimestamp(),
      });
  
      setChannels([...channels, { id: newChannelRef.id, name: newChannelName }]);
      setNewChannelName("");
      setShowAddChannel(false); // Hide input field after adding
    } catch (error) {
      console.error("Error adding channel:", error);
    }
  };

  // Handle channel deletion
  const handleDeleteChannel = async () => {
    if (!channelToDelete) return;
  
    try {
      await deleteDoc(doc(db, "channels", channelToDelete));
  
      // Remove deleted channel from state
      setChannels((prev) => prev.filter(channel => channel.id !== channelToDelete));
  
      // If the deleted channel was selected, reset it
      if (selectedChannel === channelToDelete) {
        setSelectedChannel(null);
      }
  
      // Close modal
      setShowDeleteModal(false);
      setChannelToDelete(null);
    } catch (error) {
      console.error("Error deleting channel:", error);
      alert("Failed to delete channel: " + error.message);
    }
  };

  const confirmDeleteChannel = (channelId) => {
    setChannelToDelete(channelId);
    setShowDeleteModal(true);
  };

  // Handle access restriction
  const handleAccessRestriction = () => {
    setErrorMessage("Sorry, you are not an Admin or the Owner.");
  };

  return (
    <div className="channelInfo">
      {channels.length > 0 ? (
        channels.map((channel) => (
          <div
            key={channel.id}
            className={`channelItem ${selectedChannel === channel.id ? "selected" : ""}`}
            onClick={() => setSelectedChannel(channel.id)}
          >
            <p>{channel.name}</p>
            {/* Check if user is Admin or Owner before showing the delete button */}
            {userRole === "admin" || userRole === "owner" ? (
              <button onClick={() => confirmDeleteChannel(channel.id)}>
                ❌
              </button>
            ) : null}
          </div>
        ))
      ) : (
        <p>No channels found for this server</p>
      )}

      {(userRole === "admin" || userRole === "owner") && (
        showAddChannel ? (
          <form onSubmit={handleAddChannel} className="addChannelForm">
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="Channel name..."
              autoFocus
            />
            <button type="submit">Create</button>
            <button type="button" onClick={() => setShowAddChannel(false)}>Cancel</button>
          </form>
        ) : (
          <button className="addChannelBtn" onClick={() => setShowAddChannel(true)}>
            ➕ Add Channel
          </button>
        )
      )}

      {showDeleteModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <p>Are you sure you want to delete this channel? This action cannot be undone.</p>
            <div className="modalButtons">
              <button className="cancelButton" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="deleteButton" onClick={handleDeleteChannel}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default ChannelInfo;






