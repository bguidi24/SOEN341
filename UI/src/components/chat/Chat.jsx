import { useState, useEffect } from "react";
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
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Chat = ({ channelId, serverId }) => {
    const [open, setOpen] = useState(false);   
    const [text, setText] = useState("");   
    const [messages, setMessages] = useState([]);
    const [server, setServer] = useState(null);
    const [showPostModal, setShowPostModal] = useState(false); // Controls the modal visibility
    const [postText, setPostText] = useState(""); // Stores the message inside the modal
    const [posts, setPosts] = useState([]);

    const auth = getAuth();
    const user = auth.currentUser; // Get logged-in user

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
            setMessages([]); // Clear messages if no channelId
            return; // Don't fetch messages if no channel is selected
        }
    
        const q = query(
            collection(db, "channels", channelId, "messages"), // Adjusted path to use the subcollection
            orderBy("timestamp", "asc")
        );
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    
        return () => unsubscribe(); // Cleanup listener on unmount
    }, [channelId]);

    // Fetch Posts
    useEffect(() => {
        if (!channelId) {
            setPosts([]);
            return;
        }

        const q = query(
            collection(db, "channels", channelId, "posts"), 
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, [channelId]);

    const handleEmoji = e => {
        setText(prev => prev + e.emoji);
        setOpen(false);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() || !channelId) return;  // Ensure the message is not empty and a channel is selected
        
        const auth = getAuth();
        const user = auth.currentUser; // Get logged-in user
        
        const sender = user ? user.uid : "guest";  // If logged in, use the user's UID; otherwise, "guest"
        
        try {
            // Ensure the channelId is passed correctly
            await addDoc(collection(db, "channels", channelId, "messages"), {
                text: text,
                timestamp: serverTimestamp(),  // Firestore server time
                sender: sender, // Store either the user's UID or "guest"
                channelId: channelId // Store the message under the selected channel
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
        const file = e.target.files[0]; // Get the selected file
        if (!file) return; // If no file is selected, do nothing
    
        // Convert file to Base64 string
        const reader = new FileReader();
        reader.readAsDataURL(file);  // Read file as Base64
    
        reader.onload = async () => {
            const base64String = reader.result;  // Get the Base64 string
    
            try {
                // Send the Base64 string as a message
                await addDoc(collection(db, "channels", channelId, "messages"), {
                    text: "",  // No text for image message
                    imageUrl: base64String,  // Store the Base64 string
                    timestamp: serverTimestamp(),
                    sender: user ? user.uid : "guest",
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
                    <img src="./phone.png" alt="" />
                    <img src="./video.png" alt="" />
                    <img src="./info.png" alt="" />
                </div>
            </div>
            {posts.length > 0 && (
                <div className="postsSection">
                    {posts.map((post) => (
                        <div key={post.id} className="post">
                            <div className="texts">
                                <h4>📢 Post</h4>
                                <p>{post.text}</p>
                                <span>{post.timestamp ? new Date(post.timestamp.toDate()).toLocaleTimeString() : "Now"}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="center">
                {channelId ? (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message ${msg.sender === (user ? user.uid : "guest") ? "own" : ""}`}
                        >
                            <div className="texts">
                                {msg.text && <p>{msg.text}</p>}
                                {msg.imageUrl && (
                                    <img src={msg.imageUrl} alt="Uploaded" className="messageImage" />
                                )}
                                <span>{msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : "Now"}</span>
                            </div>
                        </div>
                    ))
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
        </div>
    );
};

export default Chat;
