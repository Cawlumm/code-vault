// utils/pending.ts
import { ext } from "@/utils/ext";
const KEY = "pendingDraft";
export function getPendingDraft() {
    return new Promise((resolve) => {
        chrome.storage.local.get(KEY, (res) => {
            // res is `any` / `unknown` from the TS point of view
            const raw = res[KEY];
            if (raw && typeof raw === "object") {
                resolve(raw);
            }
            else {
                resolve(null);
            }
        });
    });
}
export function setPendingDraft(draft) {
    return ext.storage.local.set({ draft });
}
export function clearPendingDraft() {
    return ext.storage.local.remove("draft");
}
