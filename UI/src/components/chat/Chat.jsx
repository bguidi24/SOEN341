import { useRef, useState, useEffect } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { db } from "../../firebase"; 
import {
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
    doc,
    getDoc,
    deleteDoc,
    getDocs,
    setDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Chat = ({ channelId, serverId }) => {
    const dropdownRef = useRef(null);
    const [open, setOpen] = useState(false);   
    const [text, setText] = useState("");   
    const [messages, setMessages] = useState([]);
    const [server, setServer] = useState(null);
    const [showPostModal, setShowPostModal] = useState(false); // Controls the modal visibility
    const [postText, setPostText] = useState(""); // Stores the message inside the modal
    const [posts, setPosts] = useState([]);
    const [userProfiles, setUserProfiles] = useState({});
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [serverRole, setServerRole] = useState(null);

        
    const allChatItems = [...messages.map(msg => ({ ...msg, isPost: false })), 
        ...posts.map(post => ({ ...post, isPost: true }))]
    .sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate());

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "";
        const date = timestamp.toDate();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
    
        return `${hours}:${minutes}`;
    };

    const [user, setUser] = useState(null); // Store user state
    const auth = getAuth();
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser); // Update state when user logs in or out
        });
    
        return () => unsubscribe(); // Cleanup listener when component unmounts
    }, []);

    // Fetch Server Details
    useEffect(() => {
        if (!serverId) return;
    
        const fetchServer = async () => {
            try {
                const serverRef = doc(db, "servers", serverId);
                const serverSnap = await getDoc(serverRef);
        
                if (!serverSnap.exists()) {
                    console.error("Server not found:", serverId);
                    setServer({ name: "Unknown", icon: "./avatar.png" });
                    return;
                }
        
                const userId = auth.currentUser?.uid;
                if (!userId) {
                    console.warn("No user logged in.");
                    setServer(null); // or show restricted message
                    return;
                }
        
                const memberRef = doc(db, "servers", serverId, "members", userId);
                const memberSnap = await getDoc(memberRef);
        
                if (!memberSnap.exists()) {
                    console.warn("User is not a member of this server:", userId);
                    setServer(null); // Or display restricted message
                    return;
                }
        
                // ✅ User is allowed to see server
                setServer(serverSnap.data());
        
            } catch (error) {
                console.error("Firestore error:", error);
            }
        };

        console.log("Fetching server for ID:", serverId); // Debugging
    
        fetchServer();
    }, [serverId]);

    // Reset messages and posts when switching servers or channels
    useEffect(() => {
        setMessages([]);
        setPosts([]);
    }, [serverId, channelId]);

    useEffect(() => {
        if (!channelId) {
            setMessages([]);
            setPosts([]);
            return;
        }
    
        const messagesQuery = query(
            collection(db, "channels", channelId, "messages"),
            orderBy("timestamp", "asc")
        );
    
        const postsQuery = query(
            collection(db, "channels", channelId, "posts"),
            orderBy("timestamp", "asc")
        );
    
        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                type: "message", // Add type identifier
                ...doc.data()
            }));
            setMessages(newMessages);
        });
    
        const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
            const newPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                type: "post", // Add type identifier
                ...doc.data()
            }));
            setPosts(newPosts);
        });
    
        return () => {
            unsubscribeMessages();
            unsubscribePosts();
        };
    }, [channelId]);

    useEffect(() => {
        const fetchUsers = async () => {
            const usersRef = collection(db, "users"); // Firestore users collection
            const snapshot = await getDocs(usersRef);
            const profiles = {};
            snapshot.forEach(doc => {
                profiles[doc.id] = doc.data(); // Store user data by UID
            });
            setUserProfiles(profiles);
        };
    
        fetchUsers();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
    
        document.addEventListener("mousedown", handleClickOutside);
    
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!serverId || !user?.uid) return;
    
            try {
                const memberRef = doc(db, "servers", serverId, "members", user.uid);
                const memberSnap = await getDoc(memberRef);
    
                if (memberSnap.exists()) {
                    const memberData = memberSnap.data();
                    setServerRole(memberData.role || null);
                } else {
                    console.warn("Member document missing for user:", user.uid);
                    setServerRole(null);
                }
            } catch (error) {
                console.error("Error fetching server role:", error);
                setServerRole(null);
            }
        };
    
        fetchUserRole();
    }, [serverId, user?.uid]);

    const handleEmoji = e => {
        setText(prev => prev + e.emoji);
        setOpen(false);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() || !channelId) return;  // Ensure the message is not empty and a channel is selected
        
        const sender = user ? user.uid : "guest";  // If no user, use "guest" as sender
        
        try {
            await addDoc(collection(db, "channels", channelId, "messages"), {
                text: text,
                timestamp: serverTimestamp(),
                sender: sender, // Store "guest" for non-authenticated users
                channelId: channelId
            });
            setText(""); // Clear input after sending
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

        // Opens the post modal
    const openPostModal = () => {
        setShowPostModal(true);
        setPostText(""); // Clear previous input
    };

    // Send Post Message (different from chat message)
    const handlePostMessage = async () => {
        if (!postText.trim() || !channelId) return;
        
        const sender = user ? user.uid : "guest";  

        try {
            await addDoc(collection(db, "channels", channelId, "posts"), {  // Posts stored separately
                text: postText,
                timestamp: serverTimestamp(),
                sender: sender,
                channelId: channelId
            });
            setShowPostModal(false);
        } catch (error) {
            console.error("Error posting message:", error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return; // If no file is selected, do nothing
    
        const reader = new FileReader();
        reader.readAsDataURL(file);  // Read file as Base64
    
        reader.onload = async () => {
            const base64String = reader.result;
    
            try {
                const sender = user ? user.uid : "guest";  // Default to "guest" if no user is logged in
                await addDoc(collection(db, "channels", channelId, "messages"), {
                    text: "",
                    imageUrl: base64String,
                    timestamp: serverTimestamp(),
                    sender: sender,
                    channelId: channelId
                });
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        };
    
        reader.onerror = (error) => {
            console.error("Error converting image to Base64:", error);
        };
    };

    const handleDeleteItem = async (item) => {
        const subcollection = item.isPost ? "posts" : "messages";
        try {
            await deleteDoc(doc(db, "channels", channelId, subcollection, item.id));
            console.log(`${subcollection.slice(0, -1)} deleted!`);
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    const handleDeleteServer = async () => {
        if (!serverId || !auth.currentUser) return;
    
        const userId = auth.currentUser.uid;
        
        try {
            // Get the member document for the current user in the server
            const memberRef = doc(db, "servers", serverId, "members", userId);
            const memberSnap = await getDoc(memberRef);
            
            if (!memberSnap.exists()) {
                console.warn("User is not a member of this server:", userId);
                return;
            }
    
            const memberData = memberSnap.data();
            if (memberData.role !== "owner") {
                setErrorMessage("Sorry, you are not the Owner and cannot delete the server.");
                return;
            }
    
            // Only allow deletion if the user is the owner
            await deleteDoc(doc(db, "servers", serverId));
            console.log("Server deleted:", serverId);
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Error deleting server:", error);
        }
    };

    const handleAddUserToServer = async (uidToAdd, role = "member") => {
        try {
            const memberRef = doc(db, "servers", serverId, "members", uidToAdd);
            await setDoc(memberRef, {
                addedAt: serverTimestamp(),
                role: role // Store role
            });
            console.log("User added to server:", uidToAdd, "with role:", role);
        } catch (error) {
            console.error("Error adding user to server:", error);
        }
    };

    return (
        <div className="chat">
            <div className="top">
                <div className="serverName">
                <img src={server ? server.icon : "./logo192.png"} alt="Server Avatar" />
                    <div className="texts">
                        <span>{server ? server.name : "Server Name"}</span>
                    </div>
                </div>
                <div className="icons">
                    <img src="./plus.png" alt="Add User" onClick={() => setShowAddUserModal(true)} style={{ cursor: "pointer" }} />
                    <img src="./info.png" alt="Server Info" onClick={() => setShowDropdown(prev => !prev)} style={{ cursor: "pointer" }} />
                    {showDropdown && (
                        <div className="dropdownMenu" ref={dropdownRef}>
                            <button 
                                className="deleteButton" 
                                onClick={() => setShowDeleteModal(true)}
                            >
                                🗑️ Delete Server
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="center">
            {channelId ? (
                allChatItems.map((item, index) => {
                    const isOwnMessage = item.sender === (user?.uid || "guest");
                    const className = item.isPost ? "postItem" : isOwnMessage ? "message right" : "message left";

                    return (
                        <div key={index} className={className}>
                            <img
                                src={userProfiles[item.sender]?.avatar || "./avatar.png"}
                                alt="User Avatar"
                                className="userAvatar"
                            />
                            <span className="username">{userProfiles[item.sender]?.username || "Guest"}</span>
                            <div className="texts">
                                {item.isPost ? (
                                    <>
                                        <h4>{item.userName} 📢 Post</h4>
                                        <p>{item.text}</p>
                                    </>
                                ) : (
                                    <>
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt="Uploaded" className="messageImage" />
                                        ) : (
                                            <p>{item.text}</p>
                                        )}
                                    </>
                                )}
                            </div>
                            {/* 🗑️ Delete Button Only for Admins and Owners */}
                            {(serverRole === "admin" || serverRole === "owner") && (
                                <button
                                    className="deleteMsgBtn"
                                    onClick={() => handleDeleteItem(item)}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            )}
                            <span className="timestamp">
                                {formatTimestamp(item.timestamp)}
                            </span>
                        </div>
                    );
                })
            ) : (
                <div className="selectChannelMessage">
                    <h3>Select a channel</h3>
                </div>
            )}
            </div>
            <div className="bottom">
            <div className="icons">
                <img
                    src="./img.png"
                    alt="Upload Image"
                    onClick={() => document.getElementById("imageInput").click()} // Trigger the file input
                />
                <input
                    type="file"
                    id="imageInput"
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleImageUpload} // Handle image upload
                />
                <img src="./edit.png" alt="Post Message" onClick={openPostModal} style={{ cursor: "pointer" }} />
            </div>
                <form className="messageInput" onSubmit={handleSendMessage}>
                <div className="messageContainer">
                        <input 
                            type="text" 
                            placeholder="Type a message..." 
                            value={text}
                            onChange={e => setText(e.target.value)}
                        />
                        <div className="emoji">
                            <img src="./emoji.png" alt="" onClick={() => setOpen(prev => !prev)} />
                            <div className="picker">
                                <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                            </div>
                        </div>
                    </div>
                    <button className="sendButton">Send</button>
                </form>
            </div>
            {showPostModal && (
                <div className="postModal">
                    <div className="postContent">
                        <h3>Create a Post</h3>
                        <textarea 
                            value={postText} 
                            onChange={(e) => setPostText(e.target.value)}
                            placeholder="Write something..."
                        />
                        <div className="postButtons">
                            <button className="cancelButton" onClick={() => setShowPostModal(false)}>Cancel</button>
                            <button className="postButton" onClick={handlePostMessage}>Post</button>
                        </div>
                    </div>
                </div>
            )}
            {showDeleteModal && (
                <div className="modalOverlay">
                    <div className="modalContent">
                        <h3>Do you really want to delete this server?</h3>
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                        <div className="modalButtons">
                            <button className="cancelButton" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="confirmDeleteButton" onClick={handleDeleteServer}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
            {showAddUserModal && (
                <div className="modalOverlay">
                    <div className="modalContentAddUser">
                    <h3>Add User to Server</h3>
                    <div className="userList">
                        {Object.entries(userProfiles).map(([uid, profile]) => (
                            <div key={uid} className="userItem">
                                <img src={profile.avatar || "./avatar.png"} alt="Avatar" />
                                <span>{profile.username || "Guest"}</span>

                                {/* Role Selector */}
                                <select
                                    value={selectedRoles[uid] || "member"} // default to member
                                    onChange={(e) =>
                                        setSelectedRoles(prev => ({ ...prev, [uid]: e.target.value }))
                                    }
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                </select>

                                <button
                                    className="addUserButton"
                                    onClick={() => {
                                        handleAddUserToServer(uid, selectedRoles[uid] || "member");
                                        setShowAddUserModal(false);
                                    }}
                                >
                                    Add
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="cancelButton" onClick={() => setShowAddUserModal(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
