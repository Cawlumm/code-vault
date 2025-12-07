import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { ext, guessLangFromText } from "@/utils/ext";
export const QuickSave = ({ onSave }) => {
    const [title, setTitle] = useState('');
    const [language, setLanguage] = useState('');
    const [tags, setTags] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();
    const { settings } = useSettings();
    useEffect(() => {
        const checkPendingSnippet = async () => {
            const { pendingSnippet } = await ext.storage.local.get("pendingSnippet");
            if (pendingSnippet) {
                const snippet = pendingSnippet;
                setContent(snippet.content || "");
                setLanguage(snippet.language || "");
                setTitle(snippet.content?.split("\n")[0]?.slice(0, 50) || "");
                await ext.storage.local.remove("pendingSnippet");
            }
        };
        checkPendingSnippet();
    }, []);
    const handleSave = async () => {
        if (!content.trim()) {
            setStatus('Nothing to save');
            return;
        }
        setLoading(true);
        setStatus('Saving...');
        try {
            const tabs = await ext.tabs.query({ active: true, currentWindow: true });
            const sourceUrl = tabs[0]?.url || '';
            const sourceTitle = tabs[0]?.title || '';
            const res = await fetch(`${settings.apiBaseUrl}/api/v1/snippets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: title || 'Untitled snippet',
                    body: content,
                    language: language || guessLangFromText(content) || 'text',
                    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                    meta: { sourceUrl, sourceTitle }
                }),
            });
            if (!res.ok)
                throw new Error(await res.text());
            setStatus('Saved');
            setContent('');
            setLanguage('');
            setTitle('');
            setTags('');
            onSave?.();
        }
        catch (err) {
            setStatus(err instanceof Error ? err.message : 'Save failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("section", { className: "card", children: [_jsx("h2", { children: "Quick Save" }), _jsxs("div", { className: "row", children: [_jsx("label", { children: "Title" }), _jsx("input", { value: title, onChange: e => setTitle(e.target.value), placeholder: "Snippet title" })] }), _jsxs("div", { className: "row", children: [_jsx("label", { children: "Language" }), _jsx("input", { value: language, onChange: e => setLanguage(e.target.value), placeholder: "e.g., javascript" })] }), _jsxs("div", { className: "row", children: [_jsx("label", { children: "Tags (comma)" }), _jsx("input", { value: tags, onChange: e => setTags(e.target.value), placeholder: "e.g., array, util" })] }), _jsxs("div", { className: "row", children: [_jsx("label", { children: "Content" }), _jsx("textarea", { rows: 6, value: content, onChange: e => setContent(e.target.value), placeholder: "Paste your code here" })] }), _jsx("button", { onClick: handleSave, disabled: loading, children: "Save to Vault" }), _jsxs("div", { className: "status-container", children: [_jsx("div", { className: "muted", children: status }), loading && _jsx("div", { className: "loader" })] })] }));
};
