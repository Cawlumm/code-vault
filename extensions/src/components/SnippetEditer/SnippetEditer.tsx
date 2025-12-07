// SnippetEditor.tsx

import React, {
    useState,
    useEffect,
    useCallback,
    ChangeEvent,
} from "react";

import { useApiClient } from "@/hooks/useApiClient";
import { guessLanguageFromContent } from "@/utils/guessLanguage";
import { Snippet } from "@/types";
import "@/components/SnippetEditer/SnippetEditer.css";
import default_favicon from "../../../assets/default_favicon.png";
import { CodeEditor } from "@/components/CodeEditor/CodeEditor";

interface SnippetEditorProps {
    snippet?: Snippet;
    initialValues?: {
        title: string;
        language: string;
        tags: string;
        content: string;
    };
    onSave?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    mode?: "edit" | "view";
    registerHandlers?: (
        onSaveFn: () => void,
        onCancelFn: () => void,
        onEditFn: () => void,
        onDeleteFn?: () => void
    ) => void;
}

export const SnippetEditor: ({snippet, initialValues, onSave, onEdit, onDelete, mode, registerHandlers}: {
    snippet: any;
    initialValues: any;
    onSave: any;
    onEdit: any;
    onDelete: any;
    mode?: any;
    registerHandlers: any
}) => React.JSX.Element = ({
                                                                snippet,
                                                                initialValues,
                                                                onSave,
                                                                onEdit,
                                                                onDelete,
                                                                mode = "edit",
                                                                registerHandlers,
                                                            }) => {
    const isView = mode === "view";
    const titleTruncateLength = 50;
    const { request } = useApiClient();

    const [values, setValues] = useState(() => ({
        title: snippet?.title || initialValues?.title || "",
        language: snippet?.language || initialValues?.language || "",
        tags:
            (snippet?.tags as (string | { name: string })[] | undefined)
                ?.map((t) => (typeof t === "string" ? t : t.name))
                ?.join(", ") ||
            initialValues?.tags ||
            "",
        content: snippet?.body || initialValues?.content || "",
    }));

    const [status, setStatus] = useState("");
    const [faviconUrl, setFaviconUrl] = useState<string>();

    // Hydrate
    useEffect(() => {
        if (initialValues) {
            setValues({
                title: initialValues.title ?? "",
                language: initialValues.language ?? "",
                tags: initialValues.tags ?? "",
                content: initialValues.content ?? "",
            });
        }
    }, [initialValues]);

    // Load snippet
    useEffect(() => {
        if (snippet) {
            setValues({
                title: snippet.title || "",
                language: snippet.language || "",
                tags:
                    (snippet.tags as (string | { name: string })[] | undefined)
                        ?.map((t) => (typeof t === "string" ? t : t.name))
                        ?.join(", ") || "",
                content: snippet.body || "",
            });
        }
    }, [snippet]);

    // Get favicon (extension)
    useEffect(() => {
        if (typeof chrome !== "undefined" && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const tab = tabs[0];
                if (tab?.url) {
                    const url = new URL(tab.url);
                    const icon = `${url.origin}/favicon.ico`;
                    setFaviconUrl(icon);
                }
            });
        }
    }, []);

    const handleDelete = useCallback(async () => {
        if (!snippet?.id) return;

        try {
            await request(`/api/v1/snippets/${snippet.id}`, {
                method: "DELETE",
            });

            onDelete?.();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    }, [snippet, request, onDelete]);

    // Handle save
    const handleSave = useCallback(async () => {
        const trimmedContent = values.content.trim();
        if (!trimmedContent) {
            setStatus("Nothing to save");
            return;
        }

        const isUpdate = !!snippet;

        const endpoint = isUpdate
            ? `/api/v1/snippets/${snippet!.id}`
            : `/api/v1/snippets`;

        const body = {
            title: values.title || "Untitled snippet",
            body: trimmedContent,
            language:
                values.language || guessLanguageFromContent(trimmedContent) || "text",
            tags: values.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            faviconUrl,
        };

        try {
            await request(endpoint, {
                method: isUpdate ? "PUT" : "POST",
                body: JSON.stringify(body),
            });
            setStatus(isUpdate ? "Snippet updated successfully" : "Snippet saved");
            onSave?.();
        } catch (err) {
            setStatus("Failed to save snippet");
        }
    }, [values, snippet, request, faviconUrl, onSave]);

    useEffect(() => {
        registerHandlers?.(
            handleSave,
            () => onSave?.(),
            () => onEdit?.(),
            handleDelete
        );
    }, [handleSave, handleDelete, registerHandlers, onSave, onEdit]);


    const handleChange = (
        e:
            | ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
            | { target: { name: string; value: string } }
    ) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <section className="snippet-editor">

            {isView && (
                <div className="snippet-view-section">

                    <div className="snippet-view-header">

                        <div className="snippet-view-header-grid">

                            <div className="snippet-favicon-column">
                                <img
                                    src={snippet?.faviconUrl || default_favicon}
                                    className="snippet-view-favicon"
                                    alt="favicon"
                                />
                            </div>

                            <div className="snippet-text-column">
                                <h1 className="snippet-view-title">
                                    {snippet?.title
                                        ? snippet.title.slice(0, titleTruncateLength) +
                                        (snippet.title.length > titleTruncateLength ? "..." : "")
                                        : "Untitled Snippet"}
                                </h1>

                                {(values.language || values.tags.trim()) && (
                                    <div className="snippet-view-tags">

                                        {values.language && (
                                            <span className="language-tag">
                                        {values.language}
                                    </span>
                                        )}

                                        {values.tags
                                            .split(",")
                                            .map((t) => t.trim())
                                            .filter(Boolean)
                                            .map((tag) => (
                                                <span key={tag} className="tag-chip">
                                                    {tag}
                                                 </span>
                                            ))}
                                    </div>
                                )}

                            </div>
                        </div>

                    </div>

                    {/* CONTENT */}
                    <div className="snippet-view-content">
                        <CodeEditor
                            value={values.content}
                            language={values.language}
                            readOnly={true}
                            onChange={(val) =>
                                handleChange({target: {name: "content", value: val}})
                            }
                        />
                    </div>

                </div>
            )}

            {/* EDIT MODE */}
            {!isView && (
                <div className="editor-container">

                    <div className="field">
                        <label>TITLE</label>
                        <input
                            type="text"
                            name="title"
                            value={values.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="two-column">
                        <div className="field">
                            <label>LANGUAGE</label>
                            <input
                                type="text"
                                name="language"
                                value={values.language}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="field">
                            <label>TAGS</label>
                            <input
                                type="text"
                                name="tags"
                                value={values.tags}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label>CONTENT</label>
                        <div className="code-editor-wrapper">
                            <CodeEditor
                                value={values.content}
                                language={values.language}
                                readOnly={false}
                                onChange={(val) =>
                                    handleChange({target: {name: "content", value: val}})
                                }
                            />
                        </div>
                    </div>

                    {status && (
                        <div className="status-text">{status}</div>
                    )}

                </div>
            )}
        </section>
    );
};
