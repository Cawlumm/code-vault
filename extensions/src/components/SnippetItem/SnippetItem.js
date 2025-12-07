import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Copy, MoreVertical } from "lucide-react"; // icons
import "@/components/SnippetItem/SnippetItem.css";
import default_favicon from "../../../assets/default_favicon.png";
export const SnippetItem = ({ snippet, onSelect, onCopy, onEdit, }) => {
    const faviconUrl = snippet.faviconUrl || default_favicon;
    console.log("Rendering SnippetItem for snippet:", snippet);
    console.log("Favicon URL:", faviconUrl);
    return (_jsxs("div", { className: "snippet-item", onClick: () => onSelect(snippet), children: [_jsx("div", { className: "snippet-left", children: _jsx("img", { src: faviconUrl, alt: "site icon", className: "snippet-favicon" }) }), _jsxs("div", { className: "snippet-center", children: [_jsx("div", { className: "snippet-title", children: snippet.title || "Untitled Snippet" }), _jsx("div", { className: "snippet-desc", children: snippet.body
                            ? snippet.body.slice(0, 80) + (snippet.body.length > 80 ? "..." : "")
                            : snippet.tags?.join(", ") || "No body" })] }), _jsxs("div", { className: "snippet-right", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { className: "icon-btn", title: "Copy to clipboard", onClick: () => onCopy(snippet), children: _jsx(Copy, { size: 16 }) }), _jsx("button", { className: "icon-btn", title: "Edit snippet", onClick: () => onEdit(snippet), children: _jsx(MoreVertical, { size: 16 }) })] })] }));
};
