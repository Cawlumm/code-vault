import { useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/hooks/useSettings";
/**
 * useApiClient
 *
 * Centralized API client hook for making authenticated requests.
 * Handles token refresh, retry logic, and detailed structured debug logging.
 */
export const useApiClient = () => {
    const { activeAccount, getAndRefreshTokenIfNeeded } = useAuth();
    const { settings } = useSettings();
    const baseUrl = activeAccount?.serverUrl || settings.apiBaseUrl;
    /**
     * Performs an authenticated network request.
     * Automatically refreshes tokens if near expiry and retries once if 401 is returned.
     */
    const request = useCallback(async (path, options = {}) => {
        const url = `${baseUrl}${path}`;
        // Refresh token if needed before every request
        const token = await getAndRefreshTokenIfNeeded();
        if (!token) {
            console.error("[useApiClient] No valid token available. Aborting request.");
            throw new Error("Authentication required.");
        }
        const headers = new Headers(options.headers || {});
        headers.set("Authorization", `Bearer ${token}`);
        headers.set("Content-Type", "application/json");
        const config = {
            ...options,
            headers,
        };
        console.debug("[useApiClient] Request initiated:", {
            url,
            method: config.method || "GET",
            hasBody: !!config.body,
        });
        const startTime = performance.now();
        const executeRequest = async () => {
            const res = await fetch(url, config);
            if (res.status === 401) {
                console.warn("[useApiClient] Received 401. Attempting token refresh...");
                const newToken = await getAndRefreshTokenIfNeeded();
                if (newToken && newToken !== token) {
                    headers.set("Authorization", `Bearer ${newToken}`);
                    return fetch(url, { ...config, headers });
                }
            }
            return res;
        };
        try {
            const res = await executeRequest();
            const duration = (performance.now() - startTime).toFixed(1);
            if (!res.ok) {
                const errText = await res.text();
                console.error("[useApiClient] API error:", {
                    url,
                    status: res.status,
                    statusText: res.statusText,
                    message: errText,
                    duration: `${duration}ms`,
                });
                throw new Error(`API error: ${res.status} ${errText}`);
            }
            const contentType = res.headers.get("content-type") || "";
            const data = contentType.includes("application/json")
                ? await res.json()
                : await res.text();
            console.debug("[useApiClient] Request successful:", {
                url,
                status: res.status,
                duration: `${duration}ms`,
            });
            return data;
        }
        catch (err) {
            console.error("[useApiClient] Request failed:", {
                url,
                error: err,
            });
            throw err;
        }
    }, [baseUrl, getAndRefreshTokenIfNeeded]);
    return useMemo(() => ({
        request,
        baseUrl,
    }), [request, baseUrl]);
};
