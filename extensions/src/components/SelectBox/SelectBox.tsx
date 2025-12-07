import React, { useState, useRef, useEffect } from "react";
import "./SelectBox.css";

interface SelectBoxProps {
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const SelectBox: React.FC<SelectBoxProps> = ({
                                                        label,
                                                        options,
                                                        value,
                                                        onChange,
                                                        disabled = false,
                                                    }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLFieldSetElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const currentLabel =
        options.find((opt) => opt.value === value)?.label || "Select...";

    return (
        <fieldset
            ref={dropdownRef}
            className={`select-box ${disabled ? "disabled" : ""} ${open ? "open" : ""}`}
        >
            <legend className="select-label">{label}</legend>

            <div
                className="select-display"
                onClick={() => !disabled && setOpen(!open)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpen(!open);
                    }
                }}
            >
                <span>{currentLabel}</span>
                <span className="arrow">{open ? "▲" : "▼"}</span>
            </div>

            {open && (
                <ul className="select-options">
                    {options.map((opt) => (
                        <li
                            key={opt.value}
                            className={`option ${opt.value === value ? "selected" : ""}`}
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                        >
                            {opt.label}
                        </li>
                    ))}
                </ul>
            )}
        </fieldset>
    );
};
