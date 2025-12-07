import React, { useEffect, useRef, useState } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { LanguageSupport, StreamLanguage } from "@codemirror/language";
import { languages as cm6Languages } from "@codemirror/language-data";
import * as legacyModes from "@codemirror/legacy-modes/mode";

import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";

/* ──────────────────────────────────────────────────────────────── */
/* QUICK LANGS (load instantly)                                     */
/* ──────────────────────────────────────────────────────────────── */
const quickLangMap: Record<string, () => LanguageSupport> = {
    javascript: () => javascript(),
    js: () => javascript(),
    python: () => python(),
    java: () => java(),
    cpp: () => cpp(),
    c: () => cpp(),
    html: () => html(),
    css: () => css(),
};

/* ──────────────────────────────────────────────────────────────── */
/* CM5 FALLBACK MAPPING                                             */
/* ──────────────────────────────────────────────────────────────── */
const cm5ModeMap: Record<string, keyof typeof legacyModes> = {
    bash: "shell",
    sh: "shell",
    shell: "shell",
    sql: "sql",
    yaml: "yaml",
    toml: "toml",
    dockerfile: "dockerfile",
    ruby: "ruby",
    perl: "perl",
    go: "go",
    rust: "rust",
    lua: "lua",
    swift: "swift",
    r: "r",
    kotlin: "kotlin",
    clike: "clike",
    htmlembedded: "htmlembedded",
};

/* ──────────────────────────────────────────────────────────────── */
/* EXTRACT CM6 LANGUAGE SUPPORT                                     */
/* (robust, avoids brittle instanceof-only checks)                  */
/* ──────────────────────────────────────────────────────────────── */
function extractCM6LanguageSupport(mod: any): LanguageSupport | null {
    if (!mod) return null;

    console.log("[LANG] extractCM6LanguageSupport: module keys =", Object.keys(mod));

    // Case 1: module *looks like* a LanguageSupport (duck-typing)
    if (looksLikeLanguageSupport(mod)) {
        console.log("[LANG] Using module directly as LanguageSupport");
        return mod as LanguageSupport;
    }

    // Case 2: default export
    if (mod.default && looksLikeLanguageSupport(mod.default)) {
        console.log("[LANG] Using default export as LanguageSupport");
        return mod.default as LanguageSupport;
    }

    // Case 3: module.support[]
    if (Array.isArray(mod.support)) {
        console.log("[LANG] Checking mod.support[] for LanguageSupport-like objects");
        for (const item of mod.support) {
            if (looksLikeLanguageSupport(item)) {
                console.log("[LANG] Found LanguageSupport in mod.support[]");
                return item as LanguageSupport;
            }
        }
    }

    // Case 4: module.extension[]
    if (Array.isArray(mod.extension)) {
        console.log("[LANG] Checking mod.extension[] for LanguageSupport-like objects");
        for (const item of mod.extension) {
            if (looksLikeLanguageSupport(item)) {
                console.log("[LANG] Found LanguageSupport in mod.extension[]");
                return item as LanguageSupport;
            }
        }
    }

    // Case 5: module.language exists (LRLanguage)
    if (mod.language) {
        console.log("[LANG] Wrapping mod.language into LanguageSupport");
        try {
            return new LanguageSupport(mod.language);
        } catch (e) {
            console.warn("[LANG] Failed wrapping mod.language:", e);
        }
    }

    console.warn("[LANG] extractCM6LanguageSupport: no usable support found");
    return null;
}

/** We avoid brittle instanceof by duck-typing LanguageSupport-ish objects */
function looksLikeLanguageSupport(obj: any): boolean {
    if (!obj || typeof obj !== "object") return false;
    // Heuristic: LanguageSupport has a .language and .support properties
    if ("language" in obj && "support" in obj) return true;
    // Or at least a .language (LRLanguage itself is an Extension)
    if ("language" in obj) return true;
    return false;
}

/* ──────────────────────────────────────────────────────────────── */
/* MAIN EXPORT: UNIFIED LOADER (CM6 → CM5 fallback)                 */
/* ──────────────────────────────────────────────────────────────── */
export async function getUnifiedLanguageExtension(
    lang: string
): Promise<LanguageSupport | null> {
    const lower = (lang || "").toLowerCase();
    console.log("──────────────────────────────────────────────");
    console.log("[LANG] Requested:", lang, "→", lower);
    console.log("[LANG] *** USING UNIFIED LOADER V2 ***");

    // 1) QUICK MAP
    if (quickLangMap[lower]) {
        console.log("[LANG] ✔ Quick map hit:", lower);
        return quickLangMap[lower]();
    }

    // 2) CM6 Native
    const cm6 = cm6Languages.find(
        (l) =>
            l.name.toLowerCase() === lower ||
            (l.alias && l.alias.map((a) => a.toLowerCase()).includes(lower)) ||
            (l.extensions &&
                l.extensions.some((ext) => ext.toLowerCase().includes(lower)))
    );

    console.log("[LANG] CM6 search result:", cm6);

    if (cm6 && cm6.load) {
        try {
            console.log(`[LANG] Loading CM6 module for: ${cm6.name}…`);
            const mod = await cm6.load();
            console.log("[LANG] CM6 module loaded:", mod);

            const ext = extractCM6LanguageSupport(mod);

            if (ext) {
                console.log("[LANG] ✔ CM6 LanguageSupport loaded");
                return ext;
            }

            console.warn("[LANG] ❌ CM6 module contained no usable LanguageSupport");
        } catch (err) {
            console.warn("[LANG] ❌ CM6 load error:", err);
        }
    }

    // 3) CM5 fallback
    const cm5Key = cm5ModeMap[lower];
    if (cm5Key && legacyModes[cm5Key]) {
        console.log(`[LANG] ✔ Falling back to CM5 mode: ${cm5Key}`);
        const mode = (legacyModes as any)[cm5Key];
        return new LanguageSupport(StreamLanguage.define(mode));
    }

    console.warn("[LANG] ❌ No language found for:", lower);
    return null;
}


import "./CodeEditor.css";

/* Custom theme */
const codeVaultTheme = EditorView.theme(
    {
        "&": {
            backgroundColor: "var(--color-surface)",
            fontSize: "14px",
            borderRadius: "7px",
            border: "1px solid var(--color-border)",
        },
        ".cm-scroller": {
            padding: "1rem",
            fontFamily: "JetBrains Mono, monospace",
        },
    },
    { dark: true }
);

const baseExtensions = [
    keymap.of([...defaultKeymap, ...historyKeymap]),
    history(),
    EditorView.lineWrapping,
    codeVaultTheme,
];


interface CodeEditorProps {
    value: string;
    language?: string;
    readOnly?: boolean;
    onChange?: (value: string) => void;
}

export const CodeEditor: ({value, language, readOnly, onChange}: {
    value: any;
    language?: any;
    readOnly?: any;
    onChange: any
}) => React.JSX.Element = ({
                                                          value,
                                                          language = "javascript",
                                                          readOnly = false,
                                                          onChange,
                                                      }) => {
    console.log("EDITOR RENDER: props = ", { value, language, readOnly });

    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const langCompartment = useRef(new Compartment()).current;

    const [currentLang, setCurrentLang] = useState(language);

    // INITIALIZE EDITOR
    useEffect(() => {
        console.log("EDITOR INIT useEffect (mount)");

        if (!editorRef.current) {
            console.warn("EDITOR INIT: editorRef.current is NULL");
            return;
        }

        let mounted = true;

        const init = async () => {
            console.log("EDITOR INIT: loading initial language =", currentLang);
            const langExt = await getUnifiedLanguageExtension(currentLang);

            console.log("EDITOR INIT: loaded initial extension =", langExt);

            const startState = EditorState.create({
                doc: value,
                extensions: [
                    ...baseExtensions,
                    langCompartment.of(langExt || []),
                    readOnly
                        ? EditorState.readOnly.of(true)
                        : EditorView.updateListener.of((v) => {
                            if (v.docChanged && onChange) {
                                console.log("EDITOR CHANGE:", v.state.doc.toString());
                                onChange(v.state.doc.toString());
                            }
                        }),
                ],
            });

            if (!mounted) return;

            console.log("EDITOR INIT: creating EditorView…");

            const view = new EditorView({
                state: startState,
                parent: editorRef.current!,
            });

            viewRef.current = view;

            console.log("EDITOR INIT: EditorView created:", view);
        };

        init();

        return () => {
            console.log("EDITOR DESTROY");
            mounted = false;
            viewRef.current?.destroy();
        };
    }, []);

    // LANGUAGE SWITCHING
    useEffect(() => {
        console.log("LANGUAGE SWITCH useEffect: new language =", language);

        if (!viewRef.current) {
            console.warn("LANGUAGE SWITCH: viewRef.current is NULL");
            return;
        }

        const update = async () => {
            const langExt = await getUnifiedLanguageExtension(language);
            console.log("LANGUAGE SWITCH: extension =", langExt);

            console.log("LANGUAGE SWITCH: dispatching compartment reconfigure…");

            viewRef.current!.dispatch({
                effects: langCompartment.reconfigure(langExt || []),
            });

            setCurrentLang(language);
        };

        update();
    }, [language, readOnly]);

    return <div className="code-editor" ref={editorRef} />;
};

