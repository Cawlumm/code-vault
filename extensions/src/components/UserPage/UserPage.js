import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "@/context/AuthContext";
import "./UserPage.css";
export const UserPage = ({ onOptionsClick, onAddAccount, }) => {
    const { activeAccount, accounts, logout, switchAccount } = useAuth();
    return (_jsxs("div", { className: "user-page", children: [_jsx("div", { className: "user-page-header", children: _jsx("h4", { className: "section-title", children: "Accounts" }) }), accounts.map((acc) => {
                const isActive = acc.email === activeAccount?.email;
                return (_jsxs("div", { className: `account-card ${isActive ? "active" : ""}`, children: [_jsx("div", { className: isActive ? "avatar-large" : "avatar-small", children: acc.name?.[0]?.toUpperCase() || acc.email[0].toUpperCase() }), _jsxs("div", { className: "account-info", children: [_jsx("h4", { children: acc.name || acc.email }), _jsx("p", { className: "muted", children: acc.email }), isActive && _jsx("span", { className: "status unlocked", children: "Active" })] }), isActive ? (_jsx("button", { className: "outline-btn danger", onClick: () => logout(acc.email), children: "Log Out" })) : (_jsx("button", { className: "outline-btn", onClick: () => switchAccount(acc.email), children: "Switch" }))] }, acc.email));
            }), _jsx("div", { className: "footer-actions", children: _jsx("button", { className: "add-account-btn", onClick: onAddAccount, children: "+ Add Account" }) })] }));
};
