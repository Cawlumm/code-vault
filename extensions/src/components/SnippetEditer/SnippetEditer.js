import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// SnippetEditor.tsx
import { useState, useEffect, useCallback, } from "react";
import { useApiClient } from "@/hooks/useApiClient";
import { guessLanguageFromContent } from "@/utils/guessLanguage";
import "@/components/SnippetEditer/SnippetEditer.css";
import default_favicon from "../../../assets/default_favicon.png";
import { CodeEditor } from "@/components/CodeEditor/CodeEditor";
export const SnippetEditor = ({ snippet, initialValues, onSave, onEdit, onDelete, mode = "edit", registerHandlers, }) => {
    const isView = mode === "view";
    const titleTruncateLength = 50;
    const { request } = useApiClient();
    const [values, setValues] = useState(() => ({
        title: snippet?.title || initialValues?.title || "",
        language: snippet?.language || initialValues?.language || "",
        tags: snippet?.tags
            ?.map((t) => (typeof t === "string" ? t : t.name))
            ?.join(", ") ||
            initialValues?.tags ||
            "",
        content: snippet?.body || initialValues?.content || "",
    }));
    const [status, setStatus] = useState("");
    const [faviconUrl, setFaviconUrl] = useState();
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
                tags: snippet.tags
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
        if (!snippet?.id)
            return;
        try {
            await request(`/api/v1/snippets/${snippet.id}`, {
                method: "DELETE",
            });
            onDelete?.();
        }
        catch (err) {
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
            ? `/api/v1/snippets/${snippet.id}`
            : `/api/v1/snippets`;
        const body = {
            title: values.title || "Untitled snippet",
            body: trimmedContent,
            language: values.language || guessLanguageFromContent(trimmedContent) || "text",
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
        }
        catch (err) {
            setStatus("Failed to save snippet");
        }
    }, [values, snippet, request, faviconUrl, onSave]);
    useEffect(() => {
        registerHandlers?.(handleSave, () => onSave?.(), () => onEdit?.(), handleDelete);
    }, [handleSave, handleDelete, registerHandlers, onSave, onEdit]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };
    return (_jsxs("section", { className: "snippet-editor", children: [isView && (_jsxs("div", { className: "snippet-view-section", children: [_jsx("div", { className: "snippet-view-header", children: _jsxs("div", { className: "snippet-view-header-grid", children: [_jsx("div", { className: "snippet-favicon-column", children: _jsx("img", { src: snippet?.faviconUrl || default_favicon, className: "snippet-view-favicon", alt: "favicon" }) }), _jsxs("div", { className: "snippet-text-column", children: [_jsx("h1", { className: "snippet-view-title", children: snippet?.title
                                                ? snippet.title.slice(0, titleTruncateLength) +
                                                    (snippet.title.length > titleTruncateLength ? "..." : "")
                                                : "Untitled Snippet" }), (values.language || values.tags.trim()) && (_jsxs("div", { className: "snippet-view-tags", children: [values.language && (_jsx("span", { className: "language-tag", children: values.language })), values.tags
                                                    .split(",")
                                                    .map((t) => t.trim())
                                                    .filter(Boolean)
                                                    .map((tag) => (_jsx("span", { className: "tag-chip", children: tag }, tag)))] }))] })] }) }), _jsx("div", { className: "snippet-view-content", children: _jsx(CodeEditor, { value: values.content, language: values.language, readOnly: true, onChange: (val) => handleChange({ target: { name: "content", value: val } }) }) })] })), !isView && (_jsxs("div", { className: "editor-container", children: [_jsxs("div", { className: "field", children: [_jsx("label", { children: "TITLE" }), _jsx("input", { type: "text", name: "title", value: values.title, onChange: handleChange })] }), _jsxs("div", { className: "two-column", children: [_jsxs("div", { className: "field", children: [_jsx("label", { children: "LANGUAGE" }), _jsx("input", { type: "text", name: "language", value: values.language, onChange: handleChange })] }), _jsxs("div", { className: "field", children: [_jsx("label", { children: "TAGS" }), _jsx("input", { type: "text", name: "tags", value: values.tags, onChange: handleChange })] })] }), _jsxs("div", { className: "field", children: [_jsx("label", { children: "CONTENT" }), _jsx("div", { className: "code-editor-wrapper", children: _jsx(CodeEditor, { value: values.content, language: values.language, readOnly: false, onChange: (val) => handleChange({ target: { name: "content", value: val } }) }) })] }), status && (_jsx("div", { className: "status-text", children: status }))] }))] }));
};
