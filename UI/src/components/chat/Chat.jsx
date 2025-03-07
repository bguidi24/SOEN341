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
    orderBy
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Chat = () => {
    const [open, setOpen] = useState(false);   
    const [text, setText] = useState("");   
    const [messages, setMessages] = useState([]);

    const auth = getAuth();
    const user = auth.currentUser; // Get logged-in user

    const handleEmoji = e => {
        setText(prev => prev + e.emoji);
        setOpen(false);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        try {
            await addDoc(collection(db, "messages"), {
                text: text,
                timestamp: serverTimestamp(),  // Firestore server time
                sender: user ? user.uid : "guest", // Dynamic user ID
            });
            setText(""); // Clear input after sending
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    useEffect(() => {
        const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, []);

    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src="./avatar.png" alt="" />
                    <div className="texts">
                        <span>Channel Name</span>
                        <p>Channel Description</p>
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

export default Chat
