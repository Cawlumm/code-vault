import React from "react";
import { useAuth } from "@/context/AuthContext";
import "./UserPage.css";

interface UserPageProps {
    onOptionsClick?: () => void;
    onAddAccount?: () => void;
}

export const UserPage: React.FC<UserPageProps> = ({
                                                      onOptionsClick,
                                                      onAddAccount,
                                                  }) => {
    const { activeAccount, accounts, logout, switchAccount } = useAuth();

    return (
        <div className="user-page">
            {/* Header */}
            <div className="user-page-header">
                <h4 className="section-title">Accounts</h4>
            </div>

            {/* Account List */}
            {accounts.map((acc) => {
                const isActive = acc.email === activeAccount?.email;
                return (
                    <div
                        key={acc.email}
                        className={`account-card ${isActive ? "active" : ""}`}
                    >
                        <div className={isActive ? "avatar-large" : "avatar-small"}>
                            {acc.name?.[0]?.toUpperCase() || acc.email[0].toUpperCase()}
                        </div>

                        <div className="account-info">
                            <h4>{acc.name || acc.email}</h4>
                            <p className="muted">{acc.email}</p>
                            {isActive && <span className="status unlocked">Active</span>}
                        </div>

                        {isActive ? (
                            <button
                                className="outline-btn danger"
                                onClick={() => logout(acc.email)}
                            >
                                Log Out
                            </button>
                        ) : (
                            <button
                                className="outline-btn"
                                onClick={() => switchAccount(acc.email)}
                            >
                                Switch
                            </button>
                        )}
                    </div>
                );
            })}

            {/* Add Account Button */}
            <div className="footer-actions">
                <button className="add-account-btn" onClick={onAddAccount}>
                    + Add Account
                </button>
            </div>
        </div>
    );
};
