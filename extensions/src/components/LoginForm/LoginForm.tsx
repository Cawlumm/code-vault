import React, { useState, useRef, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/context/AuthContext";
import { InputBox } from "@/components/InputBox/InputBox";
import { SelectBox } from "@/components/SelectBox/SelectBox";
import "./LoginForm.css";

interface LoginFormProps {
    /** Optional callback triggered after a successful login or registration */
    onLoginComplete?: () => void;
}

/**
 * LoginForm
 *
 * Handles user authentication and registration for both cloud and self-hosted environments.
 * Integrates with the AuthContext for multi-account management.
 * Automatically stores access and refresh tokens returned by the backend.
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onLoginComplete }) => {
    const { settings } = useSettings();
    const { login, switchAccount, accounts } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const [environment, setEnvironment] = useState<"cloud" | "selfhosted">("cloud");
    const [customServerUrl, setCustomServerUrl] = useState("");
    const [showServerModal, setShowServerModal] = useState(false);

    const emailRef = useRef<HTMLInputElement | null>(null);

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

        const baseUrl =
            environment === "selfhosted" && customServerUrl.trim()
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

            const accessToken =
                data.accessToken
            const refreshToken =
                data.refreshToken || null;
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
            } else {
                await login(accessToken, email, displayName, baseUrl, refreshToken, expiresIn);
                setStatus(
                    isRegisterMode
                        ? "Account created successfully"
                        : "Logged in successfully"
                );
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
        } catch (err) {
            console.error("[LoginForm] Authentication failed:", err);
            setStatus(
                err instanceof Error ? err.message : "Authentication failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="login-card">
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>{status}</p>
                </div>
            )}

            <h2 className="login-title">
                {isRegisterMode ? "Create Account" : "Sign In"}
            </h2>

            {isRegisterMode && (
                <SelectBox
                    label="Environment"
                    value={environment}
                    options={[
                        { value: "cloud", label: "Cloud (Coming soon)"},
                        { value: "selfhosted", label: "Self-Hosted" },
                    ]}
                    onChange={(val) => {
                        setEnvironment(val as "cloud" | "selfhosted");
                        if (val === "selfhosted") setShowServerModal(true);
                    }}
                />
            )}

            {isRegisterMode && (
                <InputBox
                    label="Name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={loading}
                />
            )}

            <InputBox
                ref={emailRef}
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
            />

            <InputBox
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
            />

            <button className="login-btn" onClick={handleAuth} disabled={loading}>
                {isRegisterMode ? "Register" : "Log In"}
            </button>

            <div className="status-text">{!loading && status}</div>

            <div className="switch-mode">
                {isRegisterMode ? (
                    <>
                        Already have an account?{" "}
                        <button
                            className="link-btn"
                            onClick={() => {
                                setIsRegisterMode(false);
                                setStatus("");
                            }}
                            disabled={loading}
                        >
                            Sign In
                        </button>
                    </>
                ) : (
                    <>
                        Don’t have an account?{" "}
                        <button
                            className="link-btn"
                            onClick={() => {
                                setIsRegisterMode(true);
                                setStatus("");
                            }}
                            disabled={loading}
                        >
                            Register
                        </button>
                    </>
                )}
            </div>

            {showServerModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Enter Self-Hosted URL</h3>
                        <InputBox
                            label="Server URL"
                            type="text"
                            value={customServerUrl}
                            onChange={(e) => setCustomServerUrl(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button
                                onClick={() => {
                                    if (customServerUrl.trim()) {
                                        setShowServerModal(false);
                                    } else {
                                        alert("Please enter a valid URL.");
                                    }
                                }}
                            >
                                Save
                            </button>
                            <button
                                className="outline"
                                onClick={() => {
                                    setShowServerModal(false);
                                    setEnvironment("cloud");
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
