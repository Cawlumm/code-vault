const KEY = "pendingDraft";
export async function getPendingDraft() {
    return new Promise((resolve) => {
        chrome.storage.local.get(KEY, (res) => resolve(res[KEY] ?? null));
    });
}
export async function setPendingDraft(draft) {
    await chrome.storage.local.set({ [KEY]: draft });
}
export async function clearPendingDraft() {
    await chrome.storage.local.remove(KEY);
}
