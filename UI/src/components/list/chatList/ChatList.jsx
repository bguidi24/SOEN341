import { useState } from "react"
import "./chatList.css"

const ChatList = () => {
    const [addMode, setAddMode] = useState(false)
    return (
        <div class className='chatList'>
            <div className="search">
                <div className="searchBar">
                    <img src="./search.png" alt="" />
                    <input type="text" placeholder="Search"/>
                </div>
                <img src={addMode ? "./minus.png" : "./plus.png"} alt="" className="add" onClick={() => setAddMode((prev) => !prev)}/>
            </div>
            <div className="item">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>Channel Name 1</span>
                    <p>Hello</p>
                </div>
            </div>
            <div className="item">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>Channel Name 2</span>
                    <p>Have a great day!</p>
                </div>
            </div>
            <div className="item">
                <img src="./avatar.png" alt="" />
                <div className="texts">
                    <span>Channel Name 3</span>
                    <p>How are you doing?</p>
                </div>
            </div>
        </div>
    )
}

export default ChatList