import "./userInfo.css"

const UserInfo = () => {
    return (
        <div class className='userInfo'>
            <div className="user">
            <img src="./avatar.png" alt="" />
            <h2>Username</h2>
            </div>
            <div className="icons">
                <img src="./more.png" alt="" />
            </div>
        </div>
    )
}

export default UserInfo
