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
    getDocs
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
                console.log("Fetching server:", serverId);
                const serverRef = doc(db, "servers", serverId);
                const serverSnap = await getDoc(serverRef);
            
                if (serverSnap.exists()) {
                    setServer(serverSnap.data());
                } else {
                    console.error("Server not found:", serverId);
                    setServer({ name: "Unknown", icon: "./avatar.png" }); // Prevent crash
                }
            } catch (error) {
                console.error("Firestore error:", error);
            }
        };

        console.log("Fetching server for ID:", serverId); // Debugging
    
        fetchServer();
    }, [serverId]);

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

    const handleDeleteServer = async () => {
        if (!serverId) return;
    
        try {
            await deleteDoc(doc(db, "servers", serverId));
            console.log("Server deleted:", serverId);
            setShowDeleteModal(false);
        } catch (error) {
            console.error("Error deleting server:", error);
        }
    };

    return (
        <div className="chat">
            <div className="top">
                <div className="serverName">
                <img src={server ? server.icon : "./avatar.png"} alt="Server Avatar" />
                    <div className="texts">
                        <span>{server ? server.name : "Server Name"}</span>
                    </div>
                </div>
                <div className="icons">
                    <img src="./plus.png" alt="" />
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

                    console.log(`Message ${index}: sender=${item.sender}, user=${user?.uid}, class=${className}`);

                    return (
                        <div key={index} className={className}>
                            <img
                                src={userProfiles[item.sender]?.avatar || "./avatar.png"}
                                alt="User Avatar"
                                className="userAvatar"
                            />
                            <div className="texts">
                                {item.isPost ? (
                                    <>
                                        <h4>{item.userName} 📢 Post</h4>
                                        <p>{item.text}</p>
                                    </>
                                ) : (
                                    <>
                                        <span>{item.userName}</span>
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt="Uploaded" className="messageImage" />
                                        ) : (
                                            <p>{item.text}</p>
                                        )}
                                    </>
                                )}
                            </div>
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
                        <div className="modalButtons">
                            <button className="cancelButton" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="confirmDeleteButton" onClick={handleDeleteServer}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
