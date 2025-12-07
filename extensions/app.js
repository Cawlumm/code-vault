import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, useAuth } from "@/context/AuthContext.js";
import { SettingsProvider, useSettingsContext } from "@/context/SettingsContext.js";
import { SnippetEditor } from "@/components/SnippetEditer/SnippetEditer.js";
import { SnippetsList } from "@/components/SnippetList/SnippetsList.js";
import { LoginForm } from "@/components/LoginForm/LoginForm.js";
import { Header } from "@/components/Header/Header.js";
import "@/styles.css";
const PopupContent = () => {
    const { token, logout } = useAuth();
    const { settings, ready } = useSettingsContext();
    const [page, setPage] = useState("list");
    const [selectedSnippet, setSelectedSnippet] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    if (!ready) {
        return (_jsxs(_Fragment, { children: [_jsx(Header, { page: "loading" }), _jsx("main", { className: "wrap", children: _jsx("div", { className: "loader centered-loader" }) })] }));
    }
    // Handle login state first
    if (!token) {
        return (_jsxs(_Fragment, { children: [_jsx(Header, { page: "login" }), _jsx("main", { className: "wrap", children: _jsx("section", { className: "card", children: _jsx(LoginForm, {}) }) })] }));
    }
    const renderPageContent = () => {
        switch (page) {
            case "list":
                return (_jsxs(_Fragment, { children: [_jsx(SnippetsList, { onSelect: (snippet) => {
                                setSelectedSnippet(snippet);
                                setPage("view");
                            } }, refreshKey), _jsx("button", { style: { marginTop: "10px" }, onClick: () => {
                                setSelectedSnippet(null);
                                setPage("editor");
                            }, children: "+ New Snippet" }), _jsxs("div", { className: "links", children: [_jsxs("p", { className: "muted small-text", children: ["API: ", settings.apiBaseUrl] }), _jsx("button", { className: "linkish", onClick: logout, children: "Log out" })] })] }));
            case "view":
                if (!selectedSnippet)
                    return null;
                return (_jsx(SnippetEditor, { snippet: selectedSnippet, mode: "view", onEdit: () => setPage("editor"), onSave: () => setPage("list") }));
            case "editor":
                return (_jsx(SnippetEditor, { snippet: selectedSnippet || undefined, onSave: () => {
                        setPage("list");
                        setRefreshKey((k) => k + 1);
                    } }));
            default:
                return null;
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx(Header, { page: page, onBack: page === "view" || page === "editor"
                    ? () => setPage("list")
                    : undefined }), _jsx("main", { className: "wrap", children: renderPageContent() })] }));
};
// --- Main App Wrapper ---
const App = () => (_jsx(SettingsProvider, { children: _jsx(AuthProvider, { children: _jsx(PopupContent, {}) }) }));
const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(_jsx(App, {}));
}
