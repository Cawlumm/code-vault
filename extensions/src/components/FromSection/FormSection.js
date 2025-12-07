import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "@/components/FromSection/FormSection.css";
export const FormSection = ({ title, children }) => (_jsxs("fieldset", { className: "form-section", children: [title && _jsx("legend", { children: title }), children] }));
