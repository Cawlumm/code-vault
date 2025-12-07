import React, { useState, useEffect, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { SettingsProvider, useSettingsContext } from "./src/context/SettingsContext";
import { SnippetEditor } from "./src/components/SnippetEditer/SnippetEditer";
import { SnippetsList } from "./src/components/SnippetList/SnippetsList";
import { LoginForm } from "./src/components/LoginForm/LoginForm";
import { Header } from "./src/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";
import { UserPage } from "./src/components/UserPage/UserPage";
import { Snippet } from "./src/types";
import "./src/styles.css";
import {clearPendingDraft, getPendingDraft} from "./src/utils/pending";

type Page = "login" | "list" | "view" | "editor" | "loading" | "user";

/**
 * PopupContent
 * Core component controlling the popup UI lifecycle.
 * Handles authentication state, routing between views, and content rendering.
 */
const PopupContent: React.FC = () => {
    const { activeAccount, token, accounts, isLoaded } = useAuth();
    const { ready } = useSettingsContext();

    const [page, setPage] = useState<Page>("list");
    const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [editorSaveHandler, setEditorSaveHandler] = useState<(() => void) | null>(null);
    const [editorCancelHandler, setEditorCancelHandler] = useState<(() => void) | null>(null);
    const [editorEditHandler, setEditorEditHandler] = useState<(() => void) | null>(null);
    const [editorDeleteHandler, setEditorDeleteHandler] = useState<(() => void) | null>(null);


    const handleSaveComplete = useCallback(() => {
        console.debug("[PopupContent] Snippet saved. Returning to list.");
        setPage("list");
        setRefreshKey((k) => k + 1);
    }, []);

    const handleDeleteComplete = useCallback(() => {
        console.debug("[PopupContent] Snippet deleted. Returning to list.");
        setPage("list");
        setRefreshKey((k) => k + 1);
    }, []);

    const [initialValues, setInitialValues] = useState<{
        title: string;
        language: string;
        tags: string;
        content: string;
    } | null>(null);

    useEffect(() => {
        console.debug("[PopupContent] Popup initialized → sending 'popupOpened' message");
        chrome.runtime.sendMessage({ type: "popupOpened" });

        getPendingDraft()
            .then((draft) => {
                console.debug("[PopupContent] Fetched pending draft:", draft);

                if (!draft) {
                    console.debug("[PopupContent] No pending draft found in storage.");
                    return;
                }

                if (!draft.content) {
                    console.debug("[PopupContent] Draft found, but missing content. Ignoring.");
                    return;
                }

                const newValues = {
                    title: draft.title ?? "",
                    language: draft.language ?? "",
                    tags: draft.tags ?? "",
                    content: draft.content ?? "",
                };

                console.debug("[PopupContent] Setting initialValues for editor:", newValues);
                setInitialValues(newValues);

                if (draft.openEditor) {
                    console.debug("[PopupContent] openEditor=true → navigating to 'editor' view.");
                    setPage("editor");
                } else {
                    console.debug("[PopupContent] openEditor not set → staying on current page.");
                }

                clearPendingDraft().then(() => {
                    console.debug("[PopupContent] Cleared pending draft from storage.");
                });
            })
            .catch((err) => {
                console.error("[PopupContent] Error retrieving pending draft:", err);
            });
    }, []);




    /**
     * Effect: Resets or refreshes UI state when account or token changes.
     */
    useEffect(() => {
        if (!isLoaded) return;

        if (!token) {
            console.debug("[PopupContent] No token detected. Redirecting to login view.");
            setPage("login");
            return;
        }

        if (page !== "login") {
            console.debug("[PopupContent] Active account changed or session restored:", activeAccount?.email);
            setSelectedSnippet(null);
            setRefreshKey((k) => k + 1);
        }
    }, [isLoaded, activeAccount?.email, activeAccount?.serverUrl, token]);

    /**
     * Stable handler registration callback for editor.
     * Prevents re-creation every render.
     */
    const handleRegisterHandlers = useCallback(
        (onSaveFn: () => void, onCancelFn: () => void, onEditFn: () => void,
         onDeleteFn: () => void) => {
            console.debug("[PopupContent] Registering editor handlers.");
            setEditorSaveHandler(() => onSaveFn);
            setEditorCancelHandler(() => onCancelFn);
            setEditorEditHandler(() => onEditFn);
            setEditorDeleteHandler(() => onDeleteFn);
        },
        []
    );


    /**
     * Dynamic page rendering based on authentication and state.
     */
    const renderPageContent = () => {
        if (!ready || !isLoaded) {
            console.debug("[PopupContent] Waiting for settings or auth context to load...");
            return (
                <div className="loader centered-loader">
                    <p>Loading Code Vault...</p>
                </div>
            );
        }

        if (page === "login") {
            return (
                <section className="card">
                    <LoginForm
                        onLoginComplete={() => {
                            console.debug("[PopupContent] Login complete. Switching to list view.");
                            setPage("list");
                            setRefreshKey((k) => k + 1);
                        }}
                    />
                </section>
            );
        }

        if (!token || !activeAccount) {
            console.debug("[PopupContent] Missing token or active account. Rendering login form.");
            return (
                <section className="card">
                    <LoginForm />
                </section>
            );
        }

        switch (page) {
            case "list":
                return (
                    <SnippetsList
                        key={`${activeAccount.email}-${refreshKey}`}
                        onSelect={(snippet) => {
                            console.debug("[PopupContent] Snippet selected:", snippet.id);
                            setSelectedSnippet(snippet);
                            setPage("view");
                        }}
                    />
                );

            case "view":
                return (
                    selectedSnippet && (
                        <SnippetEditor
                            snippet={selectedSnippet}
                            mode="view"
                            onEdit={() => setPage("editor")}
                            onSave={() => setPage("list")}
                        />
                    )
                );

            case "editor":
                return (
                    <SnippetEditor
                        snippet={selectedSnippet}
                        mode="edit"
                        initialValues={initialValues}
                        onSave={handleSaveComplete}
                        onDelete={handleDeleteComplete}
                        registerHandlers={handleRegisterHandlers}
                    />
                );

            case "user":
                return (
                    <UserPage
                        onOptionsClick={() => alert("Settings coming soon")}
                        onAddAccount={() => setPage("login")}
                    />
                );

            default:
                return <div>Unknown state</div>;
        }
    };

    const currentPage: Page = !ready ? "loading" : page;

    console.debug("[PopupContent] Rendering main UI:", {
        currentPage,
        activeAccount: activeAccount?.email,
        accountCount: accounts.length,
    });

    return (
        <>
            <Header
                page={currentPage}
                onNavigate={(target) => {
                    console.debug("[PopupContent] Navigation triggered:", target);
                    setPage(target);
                }}
                onNewSnippet={() => {
                    console.debug("[PopupContent] New snippet action triggered.");
                    setSelectedSnippet(null);
                    setPage("editor");
                }}
                onAddAccount={() => {
                    console.debug("[PopupContent] Add Account action triggered.");
                    setPage("login");
                }}
                onUserPage={() => {
                    console.debug("[PopupContent] User page opened.");
                    setPage("user");
                }}
            />

            <main className="wrap">{renderPageContent()}</main>

            <Footer
                page={currentPage}
                onSettingsClick={() => alert("Settings coming soon")}
                onSupportClick={() => window.open("https://github.com/carterlumm/codevault", "_blank")}
                onSaveClick={editorSaveHandler || undefined}
                onCancelClick={editorCancelHandler || undefined}
                onDeleteClick={editorDeleteHandler || undefined}
                onEditClick={() => {
                    console.debug("[PopupContent] Edit triggered from footer.");
                    setPage("editor");
                    setRefreshKey((k) => k + 1);
                }}
            />


        </>
    );
};

/**
 * App
 * Root wrapper combining Settings and Authentication contexts.
 */
const App: React.FC = () => (
    <SettingsProvider>
        <AuthProvider>
            <PopupContent />
        </AuthProvider>
    </SettingsProvider>
);

/** Mount root app */
const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    console.debug("[PopupContent] Mounting root application...");
    root.render(<App />);
} else {
    console.error("[PopupContent] Root container not found. Unable to mount app.");
}
