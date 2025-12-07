// src/components/Form/FormSection.tsx
import React from "react";
import "@/components/FromSection/FormSection.css";

interface FormSectionProps {
    title?: string;
    children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children }) => (
    <fieldset className="form-section">
        {title && <legend>{title}</legend>}
        {children}
    </fieldset>
);

