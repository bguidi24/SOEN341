import "./userInfo.css"
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import { useUserStore } from "../../../userStore";

const UserInfo = () => {

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { currentUser } = useUserStore();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("User logged out");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="userInfo">
            <div className="user">
                <img src={currentUser?.photoURL || "./avatar.png"} alt="User Avatar" />
                <h2>{currentUser?.displayName || "Username"}</h2>
            </div>

            {/* More Icon with Dropdown */}
            <div className="icons">
                <img 
                    src="./more.png" 
                    alt="More Options" 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />
                {isDropdownOpen && (
                    <div className="dropdownLogout">
                        <button className="logoutButton" onClick={handleLogout}>Log Out</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserInfo
