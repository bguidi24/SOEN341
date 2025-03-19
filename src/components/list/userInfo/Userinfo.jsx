import "./userInfo.css"
import { auth } from "../../../lib/firebase";
import { useUserStore } from "../../../lib/userStore";

const handleLogout = () => {
  auth.signOut();
  //resetChat()
};

const Userinfo = () => {
    const { currentUser } = useUserStore();

    return (
      <div className='userInfo'>
        <div className="user">
            <img src="./avatar.png" alt=""/>
            <h2>
              {currentUser.username}
            </h2>
        </div>
        <button className="logout" onClick={handleLogout}>
            Logout
          </button>
      </div>
    )
  }

  export default Userinfo