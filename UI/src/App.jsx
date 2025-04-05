import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import DirectChat from "./components/directChat/DirectChat";
import Chat from "./components/chat/Chat";
import List from "./components/list/List";
import Login from "./components/login/Login";
import { useUserStore } from "./userStore";
import { useChatStore } from "./chatStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [isDMMode, setIsDMMode] = useState(false);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List 
            selectedChannel={selectedChannel} 
            setSelectedChannel={setSelectedChannel} 
            setSelectedServer={setSelectedServer} 
            setIsDMMode={setIsDMMode}
            isDMMode={isDMMode}
          />
          {isDMMode ? (
            <DirectChat />
          ) : (
            <Chat channelId={selectedChannel} serverId={selectedServer} />
          )}
        </>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;
