import React, {
    useState,
    InputHTMLAttributes,
    forwardRef,
} from "react";
import "./InputBox.css";

interface InputBoxProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(
    ({ label, onFocus, onBlur, value, ...props }, ref) => {
        const [focused, setFocused] = useState(false);
        const [hasValue, setHasValue] = useState(!!value);

        return (
            <fieldset
                className={`input-box ${focused ? "focused" : ""} ${
                    hasValue ? "filled" : ""
                }`}
            >
                <legend className="input-label">{label}</legend>
                <input
                    {...props}
                    ref={ref}
                    className="input-field"
                    onFocus={(e) => {
                        setFocused(true);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        setHasValue(!!e.target.value);
                        onBlur?.(e);
                    }}
                />
            </fieldset>
        );
    }
);

InputBox.displayName = "InputBox";
