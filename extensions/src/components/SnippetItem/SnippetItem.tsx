import React from "react";
import { Snippet } from "@/types";
import { Copy, MoreVertical } from "lucide-react"; // icons
import "@/components/SnippetItem/SnippetItem.css";
import default_favicon from "../../../assets/default_favicon.png";


interface SnippetItemProps {
    snippet: Snippet;
    onSelect: (snippet: Snippet) => void;
    onCopy: (snippet: Snippet) => void;
    onEdit: (snippet: Snippet) => void;
}

export const SnippetItem: React.FC<SnippetItemProps> = ({
                                                            snippet,
                                                            onSelect,
                                                            onCopy,
                                                            onEdit,
                                                        }) => {
    const faviconUrl = snippet.faviconUrl || default_favicon;

    console.log("Rendering SnippetItem for snippet:", snippet);
    console.log("Favicon URL:", faviconUrl);
    return (
        <div className="snippet-item" onClick={() => onSelect(snippet)}>
            {/* Left: favicon or preview */}
            <div className="snippet-left">
                <img src={faviconUrl} alt="site icon" className="snippet-favicon"/>
            </div>

            {/* Middle: title + desc/tags */}
            <div className="snippet-center">
                <div className="snippet-title">{snippet.title || "Untitled Snippet"}</div>
                <div className="snippet-desc">
                    {snippet.body
                        ? snippet.body.slice(0, 80) + (snippet.body.length > 80 ? "..." : "")
                        : snippet.tags?.join(", ") || "No body"}
                </div>
            </div>

            {/* Right: actions */}
            <div className="snippet-right" onClick={(e) => e.stopPropagation()}>
                <button
                    className="icon-btn"
                    title="Copy to clipboard"
                    onClick={() => onCopy(snippet)}
                >
                    <Copy size={16}/>
                </button>
                <button
                    className="icon-btn"
                    title="Edit snippet"
                    onClick={() => onEdit(snippet)}
                >
                    <MoreVertical size={16}/>
                </button>
            </div>
        </div>
    );
};
