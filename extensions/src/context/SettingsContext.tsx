import React, { createContext, useContext } from "react";
import { useSettings, Settings } from "@/hooks/useSettings";

interface SettingsContextType {
    settings: Settings;
    loading: boolean;
    ready: boolean;
    updateSetting: (key: keyof Settings, value: string) => Promise<void>;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                              children,
                                                                          }) => {
    const hook = useSettings();
    return (
        <SettingsContext.Provider value={hook}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettingsContext = () => {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        throw new Error("useSettingsContext must be used within a SettingsProvider");
    }
    return ctx;
};
