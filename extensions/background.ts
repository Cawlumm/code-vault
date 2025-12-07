// background.ts — Unified Chrome MV3 + Firefox MV2

import { ext } from "./src/utils/ext";
import { setPendingDraft } from "./src/utils/pending";
import { guessLanguageFromContent } from "/src/utils/guessLanguage";

/* =========================================================================
   Context Menu Setup
   ========================================================================= */
function createContextMenus() {
    try {
        ext.contextMenus.removeAll(() => {
            ext.contextMenus.create({
                id: "saveToVault",
                title: "Save to Code Vault",
                contexts: ["selection"],
            });
        });
    } catch (err) {
        console.error("[Background] Failed to create menus:", err);
    }
}

ext.runtime.onInstalled.addListener(() => createContextMenus());
createContextMenus();

/* =========================================================================
   Save Snippet
   ========================================================================= */
async function saveSnippet(info: any, tab: any, openEditor = false) {
    const draft = {
        title: tab?.title ?? "",
        language: guessLanguageFromContent(info.selectionText ?? ""),
        content: info.selectionText ?? "",
        faviconUrl: tab?.favIconUrl ?? "",
        openEditor,
    };

    console.log("[Background] Saving draft:", draft);

    await setPendingDraft(draft);
    console.log("[Background] Draft saved to storage.");

    await showIconNotification();
}

/* =========================================================================
   Badge Logic
   ========================================================================= */

// Show ★ for one action
async function showIconNotification() {
    try {
        if (!ext.action?.setIcon) return;

        await ext.action.setIcon({
            path: {
                "128": "/icons/icon-active-128.png"
            }
        });
    } catch (err) {
        console.error("[Background] Failed to set icon:", err);
    }
}

// Clear badge safely
async function resetIcon() {
    try {
        if (!ext.action?.setIcon) return;

        await ext.action.setIcon({
            path: {
                "16": "icons/icon_full_16.png",
                "48": "icons/icon_full_48.png",
                "128": "icons/icon_full_128.png"
            }
        });
    } catch (err) {
        console.error("[Background] Failed to reset icon:", err);
    }
}

/* =========================================================================
   Context Menu Click Handler
   ========================================================================= */
ext.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "saveToVault") {
        saveSnippet(info, tab, true);
    }
});

/* =========================================================================
   Popup → Background Messages
   ========================================================================= */
ext.runtime.onMessage.addListener((message: any) => {
    if (message.type === "popupOpened") {
        console.log("[Background] Popup opened — clearing badge");
        resetIcon();
    }
});
