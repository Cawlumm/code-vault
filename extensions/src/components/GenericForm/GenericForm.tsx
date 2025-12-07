import React from "react";
import { CodeEditor } from "@/components/CodeEditor/CodeEditor";
import { FormSection } from "@/components/FromSection/FormSection";
import { FormField } from "@/components/FormField/FormField";

interface GenericFormProps {
    schema: {
        section: string;
        fields: {
            label: string;
            type: "text" | "textarea" | "select" | "code";
            name: string;
            options?: string[];
            placeholder?: string;
            disabled?: boolean;
        }[];
    }[];
    values: Record<string, string>;
    onChange: (
        e:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
            | { target: { name: string; value: string } }
    ) => void;
}

export const GenericForm: React.FC<GenericFormProps> = ({
                                                            schema,
                                                            values,
                                                            onChange,
                                                        }) => (
    <>
        {schema.map((section) => (
            <FormSection key={section.section} title={section.section}>
                {section.fields.map((f) => (
                    <FormField key={f.name} label={f.label}>{f.type === "code" ? (
                        <CodeEditor
                            value={values[f.name] || ""}
                            language={values.language || "javascript"}
                            readOnly={f.disabled}
                            onChange={(val) =>
                                onChange({
                                    target: { name: f.name, value: val }
                                } as any)
                            }
                        />
                    ) : f.type === "textarea" ? (
                        <textarea
                                name={f.name}
                                rows={6}
                                value={values[f.name] || ""}
                                placeholder={f.placeholder}
                                onChange={onChange}
                                readOnly={f.disabled}
                            />
                        ) : f.type === "select" ? (
                            <select
                                name={f.name}
                                value={values[f.name] || ""}
                                onChange={onChange}
                                disabled={f.disabled}
                            >
                                <option value="">Select...</option>
                                {f.options?.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                name={f.name}
                                value={values[f.name] || ""}
                                placeholder={f.placeholder}
                                onChange={onChange}
                                disabled={f.disabled}
                            />
                        )}
                    </FormField>
                ))}
            </FormSection>
        ))}
    </>
);
