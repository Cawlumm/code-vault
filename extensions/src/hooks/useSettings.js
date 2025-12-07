import { useState, useEffect, useCallback } from "react";
import browser from "webextension-polyfill";
export function useSettings() {
    const [settings, setSettings] = useState({
        apiBaseUrl: "",
        token: "",
        loginPathOverride: "",
    });
    const [loading, setLoading] = useState(true);
    const [ready, setReady] = useState(false);
    const DEFAULT_API_BASE = "http://localhost:8081";
    const refreshSettings = useCallback(async () => {
        setLoading(true);
        try {
            const rawData = await browser.storage.sync.get({
                apiBaseUrl: DEFAULT_API_BASE,
                token: "",
                loginPathOverride: "",
            });
            const apiBaseUrl = typeof rawData.apiBaseUrl === "string" && rawData.apiBaseUrl.startsWith("http")
                ? rawData.apiBaseUrl
                : DEFAULT_API_BASE;
            const token = typeof rawData.token === "string" ? rawData.token : "";
            const loginPathOverride = typeof rawData.loginPathOverride === "string"
                ? rawData.loginPathOverride
                : "";
            const newSettings = {
                apiBaseUrl,
                token,
                loginPathOverride,
            };
            setSettings(newSettings);
        }
        catch (e) {
            console.error("Failed to load settings:", e);
        }
        finally {
            setLoading(false);
            setReady(true);
        }
    }, []);
    const updateSetting = useCallback(async (key, value) => {
        setSettings((prev) => {
            const newSettings = { ...prev, [key]: value };
            browser.storage.sync.set(newSettings).catch(console.error);
            return newSettings;
        });
    }, []);
    useEffect(() => {
        refreshSettings();
    }, [refreshSettings]);
    useEffect(() => {
        const listener = (changes, area) => {
            if (area === "sync")
                refreshSettings();
        };
        browser.storage.onChanged.addListener(listener);
        return () => browser.storage.onChanged.removeListener(listener);
    }, [refreshSettings]);
    return { settings, loading, ready, updateSetting, refreshSettings };
}
