import hljs from "highlight.js/lib/common";

// fallback map (if highlighting fails)
const fallbackGuesses: Record<string, string> = {
    py: "python",
    js: "javascript",
    ts: "typescript",
    html: "html",
    css: "css",
    java: "java",
    c: "c",
    cpp: "cpp",
};

export function guessLanguageFromContent(content: string): string {
    const start = performance.now();

    if (!content || content.trim().length === 0) {
        console.debug("[guessLanguage] Empty content → returning 'text'");
        return "text";
    }

    console.debug("[guessLanguage] Starting language detection", {
        length: content.length,
        preview: content.slice(0, 80), // avoid logging entire file
    });

    // Attempt highlight.js auto-detection
    try {
        const result = hljs.highlightAuto(content);

        console.debug("[guessLanguage] highlight.js result", {
            language: result?.language,
            relevance: result?.relevance,
            secondBest: result?.secondBest?.language,
        });

        if (result?.language) {
            const detected = result.language.toLowerCase();
            const duration = (performance.now() - start).toFixed(1);

            console.debug("[guessLanguage] highlight.js detected language", {
                detected,
                duration: `${duration}ms`,
            });

            return detected;
        }
    } catch (e) {
        console.warn("[guessLanguage] highlight.js failed, falling back.", {
            error: e instanceof Error ? e.message : e,
        });
    }

    // Fallback scanning
    console.debug("[guessLanguage] Running fallback keyword scan...");

    for (const key of Object.keys(fallbackGuesses)) {
        if (content.includes(key)) {
            const detected = fallbackGuesses[key];
            const duration = (performance.now() - start).toFixed(1);

            console.debug("[guessLanguage] Fallback match", {
                matchedKey: key,
                detected,
                duration: `${duration}ms`,
            });

            return detected;
        }
    }

    const duration = (performance.now() - start).toFixed(1);
    console.debug("[guessLanguage] No match found → returning 'text'", {
        duration: `${duration}ms`,
    });

    return "text";
}
