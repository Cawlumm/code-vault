import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, forwardRef, } from "react";
import "./InputBox.css";
export const InputBox = forwardRef(({ label, onFocus, onBlur, value, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);
    return (_jsxs("fieldset", { className: `input-box ${focused ? "focused" : ""} ${hasValue ? "filled" : ""}`, children: [_jsx("legend", { className: "input-label", children: label }), _jsx("input", { ...props, ref: ref, className: "input-field", onFocus: (e) => {
                    setFocused(true);
                    onFocus?.(e);
                }, onBlur: (e) => {
                    setFocused(false);
                    setHasValue(!!e.target.value);
                    onBlur?.(e);
                } })] }));
});
InputBox.displayName = "InputBox";
