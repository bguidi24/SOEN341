import { useEffect, useRef, useState } from "react"
import "./directChat.css"
import EmojiPicker from "emoji-picker-react"
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore"
import { db } from "../../firebase"
import { useChatStore } from "../../chatStore"
import { useUserStore } from "../../userStore"
// import { format } from "timeago.js"

const DirectChat = () => {
  const [chat, setChat] = useState()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")

  const { chatId, user } = useChatStore()
  const { currentUser } = useUserStore()

  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat?.messages?.length]) // 👈 update on new messages

  useEffect(() => {
    if (!chatId) return // 🛡️ Guard clause

    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data())
    })

    return () => {
      unSub()
    }
  }, [chatId])

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji)
    setOpen(false)
  }

  const handleSend = async () => {
    if (!text || !chatId || !currentUser?.id || !user?.id) return // 🛡️ prevent errors

    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
        }),
      })

      const userIds = [currentUser.id, user.id]

      userIds.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id)
        const userChatsSnapshot = await getDoc(userChatsRef)

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data()

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          )

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id
            userChatsData.chats[chatIndex].updatedAt = Date.now()

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            })
          }
        }
      })

      setText("") // Clear input after send
    } catch (err) {
      console.log(err)
    }
  }

  if (!chatId) {
    return (
      <div className="directchat no-chat-selected">
        <p style={{ textAlign: "center", marginTop: "2rem", color: "#888" }}>
          Select a user to start chatting!
        </p>
      </div>
    )
  }

  return (
    <div className="directchat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p></p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser?.id
                ? "message own"
                : "message"
            }
            key={message?.createdAt}
          >
            <img src="./avatar.png" alt="" />
            <div className="texts">
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="" />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <div className="messageContainer">
            <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            />
            <div className="emoji">
            <img
                src="./emoji.png"
                alt=""
                onClick={() => setOpen((prev) => !prev)}
            />
            <div className="picker">
                <EmojiPicker open={open} onEmojiClick={handleEmoji} />
            </div>
            </div>
        </div>
        <button className="sendButton" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  )
}

export default DirectChat