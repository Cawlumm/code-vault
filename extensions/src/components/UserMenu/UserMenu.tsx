import React from "react";
import { useAuth } from "@/context/AuthContext";
import "./UserMenu.css";

interface UserMenuProps {
    onUserPage?: () => void; // navigate to user page
}

export const UserMenu: React.FC<UserMenuProps> = ({ onUserPage }) => {
    const { activeAccount } = useAuth();

    const avatarLetter =
        activeAccount?.name?.[0]?.toUpperCase() ||
        activeAccount?.email?.[0]?.toUpperCase() ||
        "+";

    const displayEmail = activeAccount?.email ?? "No account";

    return (
        <div className="user-menu">
            <button
                className="user-menu-trigger"
                title={activeAccount ? displayEmail : "Go to user settings"}
                onClick={onUserPage}
            >
                <div className="user-avatar">
                    {avatarLetter}
                </div>
            </button>
        </div>
    );
};
