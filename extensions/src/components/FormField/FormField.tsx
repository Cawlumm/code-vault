// src/components/FormField/FormField.tsx
import React from "react";
import "@/components/FormField/FormField.css";

interface FormFieldProps {
    label: string;
    children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children }) => (
    <fieldset className="form-field">
        <legend>{label}</legend>
        {children}
    </fieldset>
);
