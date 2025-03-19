import Channel from "./channel/Channel"
import "./list.css"
import UserInfo from "./userInfo/UserInfo"

const List = ({ selectedChannel, setSelectedChannel }) => {
    return (
        <div className="list">
            <UserInfo/>
            <Channel selectedChannel={selectedChannel} setSelectedChannel={setSelectedChannel} /> {/* Pass down the function */}
        </div>
    );
};

export default List;
