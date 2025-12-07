import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
// Base languages
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { languages } from "@codemirror/language-data";
import { LanguageSupport } from "@codemirror/language";
import "./CodeEditor.css";
/* QUICK langs */
const quickLangMap = {
    javascript: javascript(),
    js: javascript(),
    python: python(),
    java: java(),
    cpp: cpp(),
    html: html(),
    css: css(),
};
/* Custom theme */
const codeVaultTheme = EditorView.theme({
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
}, { dark: true });
const baseExtensions = [
    keymap.of([...defaultKeymap, ...historyKeymap]),
    history(),
    EditorView.lineWrapping,
    codeVaultTheme,
];
/* Auto-language loader */
async function getLanguageExtension(lang) {
    const lower = lang.toLowerCase();
    console.log("[LANG] Requested:", lang, "→ lower:", lower);
    // Quick languages
    if (quickLangMap[lower]) {
        console.log("[LANG] Found in quickLangMap:", quickLangMap[lower]);
        return quickLangMap[lower];
    }
    // Find dynamic language
    const found = languages.find((l) => l.name.toLowerCase() === lower ||
        (l.alias && l.alias.map((a) => a.toLowerCase()).includes(lower)));
    console.log("[LANG] languages.find() result:", found);
    if (!found) {
        console.warn("[LANG] No language found for:", lower);
        return null;
    }
    if (!found.load) {
        console.warn("[LANG] Found language but no .load() method:", found);
        return null;
    }
    console.log("[LANG] Loading dynamic module for:", found.name);
    const mod = await found.load();
    console.log("[LANG] Dynamic module loaded:", mod);
    // Try extracting LanguageSupport
    const keys = Object.keys(mod);
    console.log("[LANG] Keys exported:", keys);
    for (const key of keys) {
        const exported = mod[key];
        console.log(`[LANG] Checking export: ${key}`, exported);
        // If it's a function that returns LanguageSupport
        if (typeof exported === "function") {
            try {
                const result = exported();
                console.log(`[LANG] Called function export: ${key}() →`, result);
                if (result instanceof LanguageSupport) {
                    console.log("[LANG] RESOLVED LanguageSupport from function.");
                    return result;
                }
            }
            catch (err) {
                console.error(`[LANG] Error calling ${key}():`, err);
            }
        }
        // If it's already a LanguageSupport
        if (exported instanceof LanguageSupport) {
            console.log("[LANG] RESOLVED LanguageSupport direct export.");
            return exported;
        }
    }
    console.warn("[LANG] No usable LanguageSupport found in module.");
    return null;
}
export const CodeEditor = ({ value, language = "javascript", readOnly = false, onChange, }) => {
    const editorRef = useRef(null);
    const viewRef = useRef(null);
    const langCompartment = useRef(new Compartment()).current;
    const [currentLang, setCurrentLang] = useState(language);
    // INITIALIZE EDITOR
    useEffect(() => {
        if (!editorRef.current)
            return;
        let mounted = true;
        const init = async () => {
            const langExt = await getLanguageExtension(currentLang);
            console.log("LANG:", currentLang, langExt);
            const startState = EditorState.create({
                doc: value,
                extensions: [
                    ...baseExtensions,
                    langCompartment.of(langExt ?? []),
                    readOnly
                        ? EditorState.readOnly.of(true)
                        : EditorView.updateListener.of((v) => {
                            if (v.docChanged && onChange) {
                                onChange(v.state.doc.toString());
                            }
                        }),
                ],
            });
            if (!mounted)
                return;
            const view = new EditorView({
                state: startState,
                parent: editorRef.current, // FIXED
            });
            viewRef.current = view;
        };
        init();
        return () => {
            mounted = false;
            viewRef.current?.destroy();
        };
    }, []);
    // LANGUAGE SWITCHING
    useEffect(() => {
        if (!viewRef.current)
            return;
        const update = async () => {
            const langExt = await getLanguageExtension(language);
            viewRef.current.dispatch({
                effects: langCompartment.reconfigure(langExt ?? []),
            });
            setCurrentLang(language);
        };
        update();
    }, [language, readOnly]);
    return _jsx("div", { className: "code-editor", ref: editorRef });
};
