import Channel from "./channel/Channel"
import "./list.css"
import UserInfo from "./userInfo/UserInfo"

const List = ({ selectedChannel, setSelectedChannel, setSelectedServer, isDMMode, setIsDMMode }) => {
    return (
        <div className="list">
            <UserInfo/>
            <Channel 
            selectedChannel={selectedChannel} 
            setSelectedChannel={setSelectedChannel} 
            setSelectedServer={setSelectedServer} 
            setIsDMMode={setIsDMMode}
            isDMMode={isDMMode}
            />
        </div>
    );
};

export default List;
