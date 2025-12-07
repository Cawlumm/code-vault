import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import browser from "webextension-polyfill";
const AuthContext = createContext({
    token: null,
    isAuthenticated: false,
    activeAccount: null,
    accounts: [],
    login: async () => { },
    logout: async () => { },
    switchAccount: async () => { },
    getAndRefreshTokenIfNeeded: async () => null,
    isLoaded: false
});
export const AuthProvider = ({ children }) => {
    const STORAGE_KEY = "auth";
    const [accounts, setAccounts] = useState([]);
    const [activeEmail, setActiveEmail] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const accountsRef = useRef([]);
    const activeEmailRef = useRef(null);
    useEffect(() => {
        accountsRef.current = accounts;
        activeEmailRef.current = activeEmail;
    }, [accounts, activeEmail]);
    /* ========================================================================
       STORAGE HELPERS
       ======================================================================== */
    const getStorage = async () => {
        try {
            let raw;
            if (chrome?.storage?.sync) {
                raw = await new Promise((resolve) => {
                    chrome.storage.sync.get(STORAGE_KEY, (items) => {
                        resolve(items?.[STORAGE_KEY] ?? null);
                    });
                });
            }
            else if (browser.storage?.sync) {
                const items = await browser.storage.sync.get(STORAGE_KEY);
                raw = items?.[STORAGE_KEY] ?? null;
            }
            else {
                raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            }
            return raw || { accounts: [], activeEmail: null };
        }
        catch (err) {
            console.error("[Auth] getStorage failed:", err);
            return null;
        }
    };
    const setStorage = async (value) => {
        try {
            if (chrome?.storage?.sync) {
                await chrome.storage.sync.set({ [STORAGE_KEY]: value });
            }
            else if (browser.storage?.sync) {
                await browser.storage.sync.set({ [STORAGE_KEY]: value });
            }
            else {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
            }
        }
        catch (err) {
            console.error("[Auth] setStorage failed:", err);
        }
    };
    /* ========================================================================
       INITIAL LOAD
       ======================================================================== */
    useEffect(() => {
        const load = async () => {
            const data = await getStorage();
            const storedAccounts = data?.accounts ?? [];
            const storedActive = data?.activeEmail || storedAccounts[0]?.email || null;
            setAccounts(storedAccounts);
            setActiveEmail(storedActive);
            const activeToken = storedAccounts.find((a) => a.email === storedActive)?.token || null;
            setToken(activeToken);
            setIsLoaded(true);
        };
        load();
    }, []);
    /* ========================================================================
       PERSIST STORAGE AFTER LOADING
       ======================================================================== */
    useEffect(() => {
        if (!isLoaded)
            return;
        setStorage({ accounts, activeEmail });
    }, [accounts, activeEmail, isLoaded]);
    /* ========================================================================
       ACCOUNT ACTIONS
       ======================================================================== */
    const login = async (accessToken, email, name, serverUrl, refreshToken, expiresIn) => {
        const expiry = expiresIn ? Date.now() + expiresIn * 1000 : undefined;
        setAccounts((prev) => {
            const exists = prev.some((a) => a.email === email);
            if (exists) {
                return prev.map((a) => a.email === email
                    ? {
                        ...a,
                        token: accessToken,
                        refreshToken,
                        tokenExpiry: expiry,
                        name,
                        serverUrl,
                        lastActive: Date.now()
                    }
                    : a);
            }
            return [
                ...prev,
                {
                    email,
                    token: accessToken,
                    refreshToken,
                    tokenExpiry: expiry,
                    name,
                    serverUrl,
                    lastActive: Date.now()
                }
            ];
        });
        setActiveEmail(email);
        setToken(accessToken);
    };
    const logout = async (email) => {
        const target = email || activeEmailRef.current;
        if (!target)
            return;
        setAccounts((prev) => prev.filter((a) => a.email !== target));
        setActiveEmail((prevActive) => {
            const remaining = accountsRef.current.filter((a) => a.email !== target);
            const next = remaining[0]?.email || null;
            setToken(next ? remaining[0]?.token || null : null);
            return next;
        });
    };
    const switchAccount = async (email) => {
        const found = accountsRef.current.find((a) => a.email === email);
        if (!found)
            return;
        setActiveEmail(email);
        setToken(found.token);
    };
    const refreshTokenIfNeeded = async () => {
        const accountsNow = accountsRef.current;
        const activeNow = activeEmailRef.current;
        const account = accountsNow.find((a) => a.email === activeNow);
        if (!account)
            return token;
        console.debug("[Auth] Current activeEmailRef:", activeEmailRef.current);
        console.debug("[Auth] Current accountsRef:", accountsRef.current);
        console.debug("[Auth] account to refresh:", account);
        console.debug("[Auth] tokenExpiry:", account?.tokenExpiry, "now:", Date.now());
        // if no refresh token, stop
        if (!account.refreshToken)
            return account.token;
        const aboutToExpire = account.tokenExpiry && Date.now() + 30_000 > account.tokenExpiry;
        // const aboutToExpire = !account.tokenExpiry || Date.now() > 0;
        console.debug("[Auth] aboutToExpire:", aboutToExpire);
        if (!aboutToExpire)
            return account.token;
        // Refresh
        try {
            const res = await fetch(`${account.serverUrl}/api/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    refreshToken: account.refreshToken
                })
            });
            if (!res.ok)
                throw new Error("Refresh failed");
            const data = await res.json();
            const newToken = data.accessToken;
            const newRefresh = data.refreshToken;
            const newExpiry = Date.now() + ((data.expiresIn ?? 3600) * 1000);
            setAccounts(prev => prev.map(a => a.email === activeNow
                ? {
                    ...a,
                    token: newToken,
                    refreshToken: newRefresh,
                    tokenExpiry: newExpiry
                }
                : a));
            setToken(newToken);
            return newToken;
        }
        catch (err) {
            console.error("[Auth] Refresh failed:", err);
            await logout(activeNow ?? undefined);
            return null;
        }
    };
    const activeAccount = accounts.find((a) => a.email === activeEmail) || null;
    return (_jsx(AuthContext.Provider, { value: {
            token,
            isAuthenticated: !!token,
            activeAccount,
            accounts,
            login,
            logout,
            switchAccount,
            getAndRefreshTokenIfNeeded: refreshTokenIfNeeded,
            isLoaded
        }, children: children }));
};
export const useAuth = () => useContext(AuthContext);
