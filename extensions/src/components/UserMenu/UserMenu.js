import { jsx as _jsx } from "react/jsx-runtime";
import { useAuth } from "@/context/AuthContext";
import "./UserMenu.css";
export const UserMenu = ({ onUserPage }) => {
    const { activeAccount } = useAuth();
    const avatarLetter = activeAccount?.name?.[0]?.toUpperCase() ||
        activeAccount?.email?.[0]?.toUpperCase() ||
        "+";
    const displayEmail = activeAccount?.email ?? "No account";
    return (_jsx("div", { className: "user-menu", children: _jsx("button", { className: "user-menu-trigger", title: activeAccount ? displayEmail : "Go to user settings", onClick: onUserPage, children: _jsx("div", { className: "user-avatar", children: avatarLetter }) }) }));
};
