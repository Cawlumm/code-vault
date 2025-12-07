import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import "./SelectBox.css";
export const SelectBox = ({ label, options, value, onChange, disabled = false, }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current &&
                !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const currentLabel = options.find((opt) => opt.value === value)?.label || "Select...";
    return (_jsxs("fieldset", { ref: dropdownRef, className: `select-box ${disabled ? "disabled" : ""} ${open ? "open" : ""}`, children: [_jsx("legend", { className: "select-label", children: label }), _jsxs("div", { className: "select-display", onClick: () => !disabled && setOpen(!open), role: "button", tabIndex: 0, onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpen(!open);
                    }
                }, children: [_jsx("span", { children: currentLabel }), _jsx("span", { className: "arrow", children: open ? "▲" : "▼" })] }), open && (_jsx("ul", { className: "select-options", children: options.map((opt) => (_jsx("li", { className: `option ${opt.value === value ? "selected" : ""}`, onClick: () => {
                        onChange(opt.value);
                        setOpen(false);
                    }, children: opt.label }, opt.value))) }))] }));
};
