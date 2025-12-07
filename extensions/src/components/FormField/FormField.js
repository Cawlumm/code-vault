import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "@/components/FormField/FormField.css";
export const FormField = ({ label, children }) => (_jsxs("fieldset", { className: "form-field", children: [_jsx("legend", { children: label }), children] }));
