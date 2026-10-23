# ⚡ Google AI Studio — Ultimate Optimizer UI (Stream Buffer & GPU Saver Fork v6.0)

> ** Attribution & Credits:**
> This project is an enhanced performance & UX fork of **[Google AI Studio - Ultimate Optimizer UI](https://github.com/Kfayyy/Google-AI-Studio-Optimizer)** originally created by **[Kfayyy](https://github.com/Kfayyy)** ([GreasyFork](https://greasyfork.org/scripts/578144)). Huge thanks to Kfayyy for the original DOM Virtualization & Markdown/JSON Export architecture!

---

## 🚀 Direct Installation / Быстрая установка

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. **[Click Here to Install / Нажмите здесь для установки скрипта (Raw GitHub Link)](https://raw.githubusercontent.com/lagovi/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js)**

---

## 📊 Real Telemetry Benchmarks (Tested on Intel i5-3317U / Integrated HD 4000 / Linux Wayland)

| Metric / Показатель | Original / До оптимизации | v6.0 Fork / После оптимизации | Improvement / Прирост |
| :--- | :--- | :--- | :--- |
| **Idle Tab GPU / CPU Load (В покое)** | **76.6% CPU** (`79% GPU`) | **0% Idle Frames** | **Complete Silence in Idle** |
| **Voice Dictation in Silence (Микрофон)** | **60 FPS `<canvas 32x32>` redraws** | **0 redraws (Blocked)** | **No GPU waste on mic** |
| **Long Chat Scrolling (Скролл 120k px)** | **13.6 – 24.8 FPS** | **49.5 – 50.5 FPS** (`0` freezes) | **2x – 3.5x Smoother** |
| **Multiline Prompt Typing (Ввод текста)** | **2.5 – 4.3 FPS** (748ms freezes) | **28.7 FPS** | **6.7x Faster Typing** |
| **AI Streaming: Average FPS (Стрим ответа)** | **12.7 FPS** (drops to **3 FPS**) | **58.4 FPS** (steady **61 FPS**) | **Near-60 FPS Streaming** |
| **AI Streaming: Main Thread Blocked Time** | **12,042 ms** (**53.6%** of time) | **656 ms** (**1.0%** of time) | **18.3x Less CPU Blocking!** |
| **DOM Mutations per Streamed Reply** | **458 mutations** ($O(N^2)$) | **10 mutations** ($O(1)$ One-Shot) | **45x Fewer DOM Rebuilds** |

---

## ✨ What's New in v6.0 Fork / Что нового в этом форке

1. **📦 Two-Phase Virtual Stream Buffer (`XHR.responseText` Lock):**
   * Google AI Studio re-parses the entire accumulated Markdown string and syntax-highlights all code blocks on every incoming network chunk ($O(N^2)$ complexity).
   * Our buffer lets the **Thinking (Thoughts)** block render immediately, then accumulates the heavy answer chunks in background memory at **0% CPU load** and renders the final reply in a single frame (with an optional *"👁️ Show received text now"* button).
2. **🛡️ Idle GPU & CPU Saver:**
   * Freezes infinite decorative CSS animations after 1 iteration (`animation-iteration-count: 1`).
   * Disables expensive real-time `backdrop-filter: blur()` layers during scrolling.
   * Blocks 60 FPS 2D-canvas equalizer draws inside `<ms-stt-button>` during voice dictation.
3. **🧠 Fixed Userscript Self-Overhead:**
   * Replaced the 100ms full-chat background `htmlToMarkdown()` observer loop with lazy capture (parses Markdown only when old turns are detached to RAM or when exporting).
4. **✋ Draggable Human UX & Rich Tooltips:**
   * Both the top header pill (`⚡ Chat | 🩺 0%`) and the bottom `▼ Collapse Code` button can be **dragged anywhere on screen** with automatic position saving in `localStorage`.
   * Added an in-chat top banner (`⬆️ Restore older messages`) and detailed hover tooltips explaining every option in plain language.
   * Added **Smart Scroll Parking** (parks viewport at the *beginning* of the new AI reply instead of jumping to the bottom) and **Auto-Repair for broken large code blocks (>1000 lines)**.

---

## 📜 License
MIT License — Original work Copyright (c) Kfayyy; Fork enhancements Copyright (c) lagovi.
