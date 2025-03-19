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
    where
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Chat = ({ channelId }) => {
    const [open, setOpen] = useState(false);   
    const [text, setText] = useState("");   
    const [messages, setMessages] = useState([]);

    const auth = getAuth();
    const user = auth.currentUser; // Get logged-in user

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

    return (
        <div className="chat">
            <div className="top">
                <div className="serverName">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <span>Server Name</span>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="" />
                    <img src="./video.png" alt="" />
                    <img src="./info.png" alt="" />
                </div>
            </div>
            <div className="center">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender === (user ? user.uid : "guest") ? "own" : ""}`}>
                        <div className="texts">
                            <p>{msg.text}</p>
                            <span>{msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : "Now"}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bottom">
            <div className="icons">
                    <img src="./img.png" alt="" />
                    <img src="./camera.png" alt="" />
                    <img src="./mic.png" alt="" />
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
        </div>
    );
};

export default Chat;
