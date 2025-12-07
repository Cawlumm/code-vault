import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSettingsContext } from "@/context/SettingsContext";
import { SnippetItem } from "@/components/SnippetItem/SnippetItem";
import { useApiClient } from "@/hooks/useApiClient";
import "@/components/SnippetList/SnippetList.css";
export const SnippetsList = ({ onSelect }) => {
    const [snippets, setSnippets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const { activeAccount } = useAuth();
    const { settings, ready } = useSettingsContext();
    const { request } = useApiClient();
    const containerRef = useRef(null);
    const fetchSnippets = async (append = false, reset = false) => {
        if (!ready || loading || (!hasMore && append))
            return;
        try {
            setLoading(true);
            setError(null);
            const currentPage = reset ? 0 : page;
            const data = await request(`/api/v1/snippets?page=${currentPage}&size=10`);
            const newSnippets = data.content?.map((item) => ({
                id: item.id,
                title: item.title,
                body: item.body,
                language: item.language,
                faviconUrl: item.faviconUrl,
                meta: item.meta ?? {},
                tags: item.tags ?? [],
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            }));
            setSnippets((prev) => append && !reset ? [...prev, ...newSnippets] : newSnippets);
            setHasMore(!data.last);
            setPage(currentPage + 1);
        }
        catch (err) {
            console.error("Error fetching snippets:", err);
            setError(err instanceof Error ? err.message : "Failed to load snippets");
        }
        finally {
            setLoading(false);
        }
    };
    // Reload snippets when account or settings change
    useEffect(() => {
        setSnippets([]);
        setPage(0);
        setHasMore(true);
        if (ready && (activeAccount?.token || settings.apiBaseUrl)) {
            fetchSnippets(false, true);
        }
    }, [ready, activeAccount, settings.apiBaseUrl]);
    const handleScroll = (e) => {
        const el = e.currentTarget;
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
            fetchSnippets(true);
        }
    };
    const handleCopy = async (snippet) => {
        try {
            await navigator.clipboard.writeText(snippet.body || "");
        }
        catch (e) {
            console.error("Failed to copy snippet:", e);
        }
    };
    const handleEdit = (snippet) => {
        console.log("Edit snippet:", snippet);
    };
    return (_jsxs("section", { className: "card snippets-section", ref: containerRef, onScroll: handleScroll, children: [_jsx("h2", { children: "Recent Snippets" }), _jsx("div", { className: "snippets-list", children: snippets.map((s) => (_jsx(SnippetItem, { snippet: s, onSelect: onSelect, onCopy: handleCopy, onEdit: handleEdit }, s.id))) }), loading && _jsx("div", { className: "loader centered-loader" }), error && _jsx("div", { className: "muted centered-text", children: error }), !loading && !error && snippets.length === 0 && (_jsx("div", { className: "muted centered-text", children: "No snippets found" }))] }));
};
