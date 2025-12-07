// utils/pending.ts
import { ext } from "@/utils/ext";

export interface PendingDraft {
    title?: string;
    language?: string;
    tags?: string;
    content?: string;
    faviconUrl?: string;
    openEditor?: boolean;
}

const KEY = "pendingDraft" as const;

export function getPendingDraft(): Promise<PendingDraft | null> {
    return new Promise((resolve) => {
        chrome.storage.local.get(KEY, (res) => {
            // res is `any` / `unknown` from the TS point of view
            const raw = (res as Record<string, unknown>)[KEY];

            if (raw && typeof raw === "object") {
                resolve(raw as PendingDraft);
            } else {
                resolve(null);
            }
        });
    });
}

export function setPendingDraft(draft: any) {
    return ext.storage.local.set({ draft });
}

export function clearPendingDraft() {
    return ext.storage.local.remove("draft");
}

