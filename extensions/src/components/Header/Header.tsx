import React from "react";
import { useAuth } from "@/context/AuthContext";
import { UserMenu } from "@/components/UserMenu/UserMenu";
import logo from "../../../assets/codevault_icon_backgroundless.png";
import addSnippetIcon from "../../../assets/add_snipet.png";
import "./Header.css";

type PageType = "login" | "list" | "editor" | "view" | "loading" | "user";

/**
 * Centralized configuration for page-specific header behavior.
 */
const HEADER_CONFIG: Record<
    PageType,
    {
        title?: string | null;
        showHeader?: boolean;
        showBack?: boolean;
        showTitle?: boolean;
        showNewSnippet?: boolean;
        backTarget?: PageType; // 👈 NEW
    }
> = {
    login: { title: null, showHeader: true },
    list: { title: null, showHeader: true, showNewSnippet: true },
    editor: { title: "Snippet Editor", showHeader: true, showBack: true, backTarget: "list" },
    view: { title: "Snippet Viewer", showHeader: true, showBack: true, backTarget: "list" },
    user: { title: "User Account", showHeader: true, showBack: true, backTarget: "list" },
    loading: { title: null, showHeader: false },
};


interface HeaderProps {
    page: PageType;
    onNavigate: (target: PageType) => void;
    onNewSnippet?: () => void;
    onAddAccount?: () => void;
    onUserPage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
                                                  page,
                                                  onNavigate,
                                                  onNewSnippet,
                                                  onAddAccount,
                                                  onUserPage,
                                              }) => {
    const { token } = useAuth();
    const config = HEADER_CONFIG[page] || HEADER_CONFIG.list;

    if (config.showHeader === false) return null;

    return (
        <header className="header">
            {/* --- Left Section (Logo or Back) --- */}
            <div className="header-left">
                {config.showBack && config.backTarget ? (
                    <button
                        className="back-btn"
                        onClick={() => onNavigate(config.backTarget!)}
                        aria-label="Back"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                ) : (
                    <img src={logo} alt="Code Vault logo" className="header-logo" />
                )}
            </div>

            {/* --- Title --- */}
            {config.showTitle !== false && config.title && (
                <h1 className="header-title">{config.title}</h1>
            )}

            {/* --- Right Section (Actions + UserMenu) --- */}
            <div className="header-actions">
                {config.showNewSnippet && onNewSnippet && (
                    <button className="header-link new-snippet" onClick={onNewSnippet}>
                        <img
                            src={addSnippetIcon}
                            alt="Add Snippet"
                            className="new-snippet-icon-img"
                        />
                        <span>New Snippet</span>
                    </button>
                )}

                {token && <UserMenu onUserPage={onUserPage} />}
            </div>
        </header>
    );
};
