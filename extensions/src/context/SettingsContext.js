import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from "react";
import { useSettings } from "@/hooks/useSettings";
const SettingsContext = createContext(null);
export const SettingsProvider = ({ children, }) => {
    const hook = useSettings();
    return (_jsx(SettingsContext.Provider, { value: hook, children: children }));
};
export const useSettingsContext = () => {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        throw new Error("useSettingsContext must be used within a SettingsProvider");
    }
    return ctx;
};
