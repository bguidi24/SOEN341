import "./userInfo.css"
import { useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import { useUserStore } from "../../../userStore";

const UserInfo = () => {

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { currentUser } = useUserStore();
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("User logged out");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="userInfo">
            <div className="user">
                <img src={currentUser?.photoURL || "./avatar.png"} alt="User Avatar" />
                <h2>{currentUser?.username || "Guest"}</h2>
            </div>

            <div className="icons" ref={dropdownRef}>
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
