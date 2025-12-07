// ext.ts — Unified Chrome + Firefox API

// Tell TypeScript these may exist globally
declare const browser: any;
declare const chrome: any;

// -------------------------------------------------------
// Pick whichever API is available at runtime
// -------------------------------------------------------
let rawApi: any = null;

// Prefer `browser` if available (Firefox or polyfill)
if (typeof browser !== "undefined") {
    rawApi = browser;
}
// Fallback to Chrome's API
else if (typeof chrome !== "undefined") {
    rawApi = chrome;
}
// Fallback to the global if bundler injects something weird
else if (typeof globalThis !== "undefined") {
    rawApi = (globalThis as any).browser || (globalThis as any).chrome;
}

if (!rawApi) {
    throw new Error("[ext] No extension API found (chrome/browser missing)");
}

// -------------------------------------------------------
// Unified Promise-based storage wrapper
// Prevents namespace mismatch between Chrome + Firefox
// -------------------------------------------------------
export const ext = {
    ...rawApi,

    // -------------------------------------------------------
    // Unified action API (fixes Firefox MV2)
    // -------------------------------------------------------
    action: rawApi.action || rawApi.browserAction || null,

    storage: {
        local: {
            get(keys?: any): Promise<any> {
                return new Promise((resolve, reject) => {
                    try {
                        rawApi.storage.local.get(keys, (result: any) => {
                            const err = chrome?.runtime?.lastError || browser?.runtime?.lastError;
                            if (err) return reject(err);
                            resolve(result);
                        });
                    } catch (err) {
                        reject(err);
                    }
                });
            },

            set(items: any): Promise<void> {
                return new Promise((resolve, reject) => {
                    try {
                        rawApi.storage.local.set(items, () => {
                            const err = chrome?.runtime?.lastError || browser?.runtime?.lastError;
                            if (err) return reject(err);
                            resolve();
                        });
                    } catch (err) {
                        reject(err);
                    }
                });
            },

            remove(keys: any): Promise<void> {
                return new Promise((resolve, reject) => {
                    try {
                        rawApi.storage.local.remove(keys, () => {
                            const err = chrome?.runtime?.lastError || browser?.runtime?.lastError;
                            if (err) return reject(err);
                            resolve();
                        });
                    } catch (err) {
                        reject(err);
                    }
                });
            }
        }
    }
};




// -------------------------------------------------------
// Language detection helpers (unchanged)
// -------------------------------------------------------
export function guessLangFromText(text: string): string {
    if (/```(\w+)/.test(text)) return RegExp.$1.toLowerCase();
    if (/^\s*def\s+\w+\(/m.test(text)) return "python";
    if (/^\s*function\s+\w+\(|=>\s*{/.test(text)) return "javascript";
    if (/^\s*class\s+\w+\s*{/.test(text)) return "java";
    if (/#include\s+<[^>]+>/.test(text)) return "c";
    if (/#include\s+["'][^"']+["']/.test(text)) return "cpp";
    if (/^\s*SELECT\s+/im.test(text)) return "sql";
    return "text";
}


// -------------------------------------------------------
// HTML escaping helper
// -------------------------------------------------------
export function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}


// -------------------------------------------------------
// Cookie helpers (unchanged)
// -------------------------------------------------------
export function setCookie(name: string, value: string, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

export function getCookie(name: string): string | undefined {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith(name + "="))
        ?.split("=")[1];
}

export function deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
