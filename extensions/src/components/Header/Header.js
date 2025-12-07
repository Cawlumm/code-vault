import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "@/context/AuthContext";
import { UserMenu } from "@/components/UserMenu/UserMenu";
import logo from "../../../assets/codevault_icon_backgroundless.png";
import addSnippetIcon from "../../../assets/add_snipet.png";
import "./Header.css";
/**
 * Centralized configuration for page-specific header behavior.
 */
const HEADER_CONFIG = {
    login: { title: null, showHeader: true },
    list: { title: null, showHeader: true, showNewSnippet: true },
    editor: { title: "Snippet Editor", showHeader: true, showBack: true, backTarget: "list" },
    view: { title: "Snippet Viewer", showHeader: true, showBack: true, backTarget: "list" },
    user: { title: "User Account", showHeader: true, showBack: true, backTarget: "list" },
    loading: { title: null, showHeader: false },
};
export const Header = ({ page, onNavigate, onNewSnippet, onAddAccount, onUserPage, }) => {
    const { token } = useAuth();
    const config = HEADER_CONFIG[page] || HEADER_CONFIG.list;
    if (config.showHeader === false)
        return null;
    return (_jsxs("header", { className: "header", children: [_jsx("div", { className: "header-left", children: config.showBack && config.backTarget ? (_jsx("button", { className: "back-btn", onClick: () => onNavigate(config.backTarget), "aria-label": "Back", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("polyline", { points: "15 18 9 12 15 6" }) }) })) : (_jsx("img", { src: logo, alt: "Code Vault logo", className: "header-logo" })) }), config.showTitle !== false && config.title && (_jsx("h1", { className: "header-title", children: config.title })), _jsxs("div", { className: "header-actions", children: [config.showNewSnippet && onNewSnippet && (_jsxs("button", { className: "header-link new-snippet", onClick: onNewSnippet, children: [_jsx("img", { src: addSnippetIcon, alt: "Add Snippet", className: "new-snippet-icon-img" }), _jsx("span", { children: "New Snippet" })] })), token && _jsx(UserMenu, { onUserPage: onUserPage })] })] }));
};
