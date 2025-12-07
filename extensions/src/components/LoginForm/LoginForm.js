import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/context/AuthContext";
import { InputBox } from "@/components/InputBox/InputBox";
import { SelectBox } from "@/components/SelectBox/SelectBox";
import "./LoginForm.css";
/**
 * LoginForm
 *
 * Handles user authentication and registration for both cloud and self-hosted environments.
 * Integrates with the AuthContext for multi-account management.
 * Automatically stores access and refresh tokens returned by the backend.
 */
export const LoginForm = ({ onLoginComplete }) => {
    const { settings } = useSettings();
    const { login, switchAccount, accounts } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [environment, setEnvironment] = useState("cloud");
    const [customServerUrl, setCustomServerUrl] = useState("");
    const [showServerModal, setShowServerModal] = useState(false);
    const emailRef = useRef(null);
    /** Automatically focus the email field when the form mounts or mode changes */
    useEffect(() => {
        emailRef.current?.focus();
    }, [isRegisterMode]);
    /**
     * Handles login or registration workflow.
     * Uses the configured base URL or custom self-hosted server.
     */
    const handleAuth = async () => {
        if (!email || !password) {
            setStatus("Please enter your email and password.");
            return;
        }
        if (isRegisterMode && password.length < 6) {
            setStatus("Password must be at least 6 characters long.");
            return;
        }
        if (isRegisterMode && !displayName.trim()) {
            setStatus("Please enter your name.");
            return;
        }
        setLoading(true);
        setStatus(isRegisterMode ? "Creating account..." : "Logging in...");
        const baseUrl = environment === "selfhosted" && customServerUrl.trim()
            ? customServerUrl.trim().replace(/\/+$/, "")
            : settings.apiBaseUrl;
        const endpoint = isRegisterMode
            ? `${baseUrl}/api/auth/register`
            : `${baseUrl}/api/auth/login`;
        console.debug("[LoginForm] Auth request started:", {
            mode: isRegisterMode ? "register" : "login",
            baseUrl,
            email,
        });
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    displayName: isRegisterMode ? displayName : undefined,
                    serverUrl: environment === "selfhosted" ? baseUrl : undefined,
                }),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Server error: ${res.status} ${errText}`);
            }
            const data = await res.json();
            const accessToken = data.accessToken;
            const refreshToken = data.refreshToken || null;
            const expiresIn = data.expiresIn || 3600;
            if (!accessToken) {
                console.error("[LoginForm] No token returned:", data);
                throw new Error(data.message || "Invalid credentials");
            }
            const existing = accounts.find((a) => a.email === email);
            if (existing) {
                await switchAccount(email);
                setStatus("Switched to existing account");
                console.debug("[LoginForm] Switched to existing account:", email);
            }
            else {
                await login(accessToken, email, displayName, baseUrl, refreshToken, expiresIn);
                setStatus(isRegisterMode
                    ? "Account created successfully"
                    : "Logged in successfully");
                console.debug("[LoginForm] Auth success:", {
                    email,
                    server: baseUrl,
                    refreshToken: !!refreshToken,
                });
            }
            // Clear fields
            setEmail("");
            setPassword("");
            setDisplayName("");
            // Short delay to show success before redirecting
            setTimeout(() => {
                onLoginComplete?.();
            }, 500);
        }
        catch (err) {
            console.error("[LoginForm] Authentication failed:", err);
            setStatus(err instanceof Error ? err.message : "Authentication failed");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("section", { className: "login-card", children: [loading && (_jsxs("div", { className: "loading-overlay", children: [_jsx("div", { className: "spinner" }), _jsx("p", { children: status })] })), _jsx("h2", { className: "login-title", children: isRegisterMode ? "Create Account" : "Sign In" }), isRegisterMode && (_jsx(SelectBox, { label: "Environment", value: environment, options: [
                    { value: "cloud", label: "Cloud (Coming soon)" },
                    { value: "selfhosted", label: "Self-Hosted" },
                ], onChange: (val) => {
                    setEnvironment(val);
                    if (val === "selfhosted")
                        setShowServerModal(true);
                } })), isRegisterMode && (_jsx(InputBox, { label: "Name", type: "text", value: displayName, onChange: (e) => setDisplayName(e.target.value), disabled: loading })), _jsx(InputBox, { ref: emailRef, label: "Email Address", type: "email", value: email, onChange: (e) => setEmail(e.target.value), disabled: loading }), _jsx(InputBox, { label: "Password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), disabled: loading }), _jsx("button", { className: "login-btn", onClick: handleAuth, disabled: loading, children: isRegisterMode ? "Register" : "Log In" }), _jsx("div", { className: "status-text", children: !loading && status }), _jsx("div", { className: "switch-mode", children: isRegisterMode ? (_jsxs(_Fragment, { children: ["Already have an account?", " ", _jsx("button", { className: "link-btn", onClick: () => {
                                setIsRegisterMode(false);
                                setStatus("");
                            }, disabled: loading, children: "Sign In" })] })) : (_jsxs(_Fragment, { children: ["Don\u2019t have an account?", " ", _jsx("button", { className: "link-btn", onClick: () => {
                                setIsRegisterMode(true);
                                setStatus("");
                            }, disabled: loading, children: "Register" })] })) }), showServerModal && (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal", children: [_jsx("h3", { children: "Enter Self-Hosted URL" }), _jsx(InputBox, { label: "Server URL", type: "text", value: customServerUrl, onChange: (e) => setCustomServerUrl(e.target.value) }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { onClick: () => {
                                        if (customServerUrl.trim()) {
                                            setShowServerModal(false);
                                        }
                                        else {
                                            alert("Please enter a valid URL.");
                                        }
                                    }, children: "Save" }), _jsx("button", { className: "outline", onClick: () => {
                                        setShowServerModal(false);
                                        setEnvironment("cloud");
                                    }, children: "Cancel" })] })] }) }))] }));
};
