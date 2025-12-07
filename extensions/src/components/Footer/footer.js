import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import "./Footer.css";
const FOOTER_CONFIG = {
    login: { text: "Secure access to your snippets", showSettings: false, showSupport: false, showSaveCancel: false, showEditDelete: false },
    list: { text: "© 2025 Code Vault", showSettings: true, showSupport: true, showSaveCancel: false, showEditDelete: false },
    editor: { text: "Editing mode · Don’t forget to save", showSettings: false, showSupport: false, showSaveCancel: true, showEditDelete: false },
    view: { text: "View mode · Read-only snippet", showSettings: false, showSupport: false, showSaveCancel: false, showEditDelete: true },
    user: { text: "Account settings", showSettings: false, showSupport: false, showSaveCancel: false, showEditDelete: false },
    loading: { text: "", showSettings: false, showSupport: false, showSaveCancel: false, showEditDelete: false }
};
export const Footer = ({ page, onSettingsClick, onSupportClick, onSaveClick, onCancelClick, onEditClick, onDeleteClick }) => {
    const config = FOOTER_CONFIG[page];
    if (page === "loading")
        return null;
    return (_jsxs("footer", { className: "footer", children: [_jsx("div", { className: "footer-left", children: _jsx("p", { className: "footer-text", children: config.text }) }), _jsxs("div", { className: "footer-actions", children: [config.showSettings && (_jsx("button", { className: "footer-link", onClick: onSettingsClick, children: "Settings" })), config.showSupport && (_jsx("button", { className: "footer-link", onClick: onSupportClick, children: "Support" })), config.showSaveCancel && (_jsxs(_Fragment, { children: [_jsx("button", { className: "footer-link primary", onClick: onSaveClick, children: "Save" }), _jsx("button", { className: "footer-link", onClick: onCancelClick, children: "Cancel" })] })), config.showEditDelete && (_jsxs(_Fragment, { children: [_jsx("button", { className: "footer-link", onClick: onEditClick, children: "Edit" }), _jsx("button", { className: "footer-link danger", onClick: onDeleteClick, children: _jsx("svg", { className: "footer-icon", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }) })] }))] })] }));
};
