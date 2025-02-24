import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

const TestDatabase = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "testCollection"));
        const messagesArray = querySnapshot.docs.map((doc) => doc.data());
        
        console.log("Fetched Messages:", messagesArray); // Debugging Log
        setMessages(messagesArray);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div>
      <h2>Database Messages:</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default TestDatabase;

