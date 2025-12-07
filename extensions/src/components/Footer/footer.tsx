import React from "react";
import "./Footer.css";

interface FooterProps {
    page: "login" | "list" | "editor" | "view" | "loading" | "user";
    onSettingsClick?: () => void;
    onSupportClick?: () => void;
    onSaveClick?: () => void;
    onCancelClick?: () => void;
    onEditClick?: () => void;
    onDeleteClick?: () => void;
}

const FOOTER_CONFIG = {
    login: { text: "Secure access to your snippets", showSettings: false, showSupport: false, showSaveCancel: false, showEditDelete: false },
    list: { text: "© 2025 Code Vault", showSettings: true, showSupport: true, showSaveCancel: false, showEditDelete: false },
    editor: { text: "Editing mode · Don’t forget to save", showSettings: false, showSupport: false, showSaveCancel: true, showEditDelete: false },
    view: { text: "View mode · Read-only snippet", showSettings: false, showSupport: false, showSaveCancel: false, showEditDelete: true },
    user: { text: "Account settings", showSettings: false, showSupport: false, showSaveCancel: false, showEditDelete: false },
    loading: { text: "", showSettings: false, showSupport: false, showSaveCancel: false, showEditDelete: false }
} as const;

export const Footer: React.FC<FooterProps> = ({
                                                  page,
                                                  onSettingsClick,
                                                  onSupportClick,
                                                  onSaveClick,
                                                  onCancelClick,
                                                  onEditClick,
                                                  onDeleteClick
                                              }) => {
    const config = FOOTER_CONFIG[page];

    if (page === "loading") return null;

    return (
        <footer className="footer">
            <div className="footer-left">
                <p className="footer-text">{config.text}</p>
            </div>

            <div className="footer-actions">

                {config.showSettings && (
                    <button className="footer-link" onClick={onSettingsClick}>
                        Settings
                    </button>
                )}

                {config.showSupport && (
                    <button className="footer-link" onClick={onSupportClick}>
                        Support
                    </button>
                )}

                {config.showSaveCancel && (
                    <>
                        <button className="footer-link primary" onClick={onSaveClick}>
                            Save
                        </button>

                        <button className="footer-link" onClick={onCancelClick}>
                            Cancel
                        </button>
                    </>
                )}

                {config.showEditDelete && (
                    <>
                        <button className="footer-link" onClick={onEditClick}>
                            Edit
                        </button>

                        <button className="footer-link danger" onClick={onDeleteClick}>
                            <svg
                                className="footer-icon"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </button>
                    </>
                )}
            </div>
        </footer>
    );
};
