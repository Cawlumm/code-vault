// utils/pending.ts
export interface PendingDraft {
    title?: string;
    language?: string;
    tags?: string;
    content?: string;
    faviconUrl?: string;
    openEditor?: boolean;
}

const KEY = "pendingDraft";

export async function getPendingDraft(): Promise<unknown> {
    return new Promise((resolve) => {
        chrome.storage.local.get(KEY, (res) => resolve(res[KEY] ?? null));
    });
}

export async function setPendingDraft(draft: PendingDraft) {
    await chrome.storage.local.set({ [KEY]: draft });
}

export async function clearPendingDraft() {
    await chrome.storage.local.remove(KEY);
}
