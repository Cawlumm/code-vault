/// <reference types="node" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve } from "path";

// CodeMirror optimization blacklist
const codemirrorPackages = [
    "@codemirror/autocomplete",
    "@codemirror/commands",
    "@codemirror/lang-cpp",
    "@codemirror/lang-css",
    "@codemirror/lang-html",
    "@codemirror/lang-java",
    "@codemirror/lang-javascript",
    "@codemirror/lang-python",
    "@codemirror/language",
    "@codemirror/language-data",
    "@codemirror/lint",
    "@codemirror/state",
    "@codemirror/view"
];

export default defineConfig(({ mode }) => {

    const isBackground = mode === "background";

    // -------------------------------------------------------------------
    // BACKGROUND BUILD (single file)
    // -------------------------------------------------------------------
    if (isBackground) {
        return {
            plugins: [
                react(),
                viteStaticCopy({
                    targets: [
                        { src: "manifest.json", dest: "." },
                        { src: "icons", dest: "static" },
                    ],
                }),
            ],
            build: {
                outDir: "dist",
                emptyOutDir: false,
                target: "esnext",

                lib: {
                    entry: resolve(__dirname, "background.ts"),
                    name: "background",
                    formats: ["iife"],
                    fileName: () => "background.js",
                },

                rollupOptions: {
                    output: {
                        inlineDynamicImports: true,
                        assetFileNames: "static/[name].[ext]",
                    }
                }
            },
        };
    }

    // -------------------------------------------------------------------
    // POPUP / OPTIONS BUILD
    // -------------------------------------------------------------------
    return {
        plugins: [
            react(),
            viteStaticCopy({
                targets: [
                    { src: "manifest.json", dest: "." },
                    { src: "icons", dest: "static" },
                    { src: "assets", dest: "static" },  // your existing PNG/JPG/SVG
                ],
            }),
        ],

        resolve: {
            alias: { "@": resolve(__dirname, "src") },
        },

        optimizeDeps: {
            exclude: codemirrorPackages,
        },
        ssr: {
            noExternal: codemirrorPackages,
        },

        build: {
            target: "esnext",
            outDir: "dist",
            emptyOutDir: true,

            commonjsOptions: { include: [/node_modules/] },

            rollupOptions: {
                input: {
                    popup: resolve(__dirname, "popup.html"),
                    options: resolve(__dirname, "options.html"),
                },
                output: {
                    /** JS output goes at root */
                    entryFileNames: "[name].js",
                    chunkFileNames: "chunks/[name]-[hash].js",

                    /** Static assets only (icons, images, css) */
                    assetFileNames: "static/[name].[ext]",

                },
            },
        },
    };
});
