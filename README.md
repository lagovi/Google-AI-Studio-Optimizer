# ⚡ Google AI Studio — Ultimate Optimizer UI (Stream Buffer & GPU Saver Fork v6.3)

**[RU] [Описание на русском языке ниже](#-ru-о-проекте) | [EN] [English Documentation below](#-en-about-this-fork)**

> **Attribution & Credits / Благодарности:**
> Этот проект — модернизированный форк юзерскрипта **[Google AI Studio - Ultimate Optimizer UI](https://github.com/Kfayyy/Google-AI-Studio-Optimizer)** от автора **[Kfayyy](https://github.com/Kfayyy)** ([GreasyFork](https://greasyfork.org/scripts/578144)). Огромное спасибо Kfayyy за оригинальную идею виртуализации DOM и архитектуру экспорта чатов в Markdown/JSON!

---

## [RU] О проекте

Даже на пустой вкладке или во время генерации ответа **Google AI Studio** может нагружать процессор (CPU) и встроенную видеокарту (GPU) на **50–80%**, вызывая тяжёлые фризы при вводе текста, прокрутке и приёме потокового ответа модели, а при переключении на другую вкладку — останавливать рендеринг ответа.

Этот форк устраняет причины тормозов на уровне рендерера браузера и сетевого стека (`XHR`), поддерживает непрерывный рендеринг в фоновой вкладке, снижает нагрузку в покое до **0%**, а блокировку основного потока во время стриминга кода — с **53.6% до 1.0%**.

### 🚀 Быстрая установка в 1 клик
1. Установите расширение [Tampermonkey](https://www.tampermonkey.net/) или [Violentmonkey](https://violentmonkey.github.io/).
2. **[Нажмите сюда для установки / обновления скрипта (Raw GitHub)](https://raw.githubusercontent.com/lagovi/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js)**
*(Язык интерфейса `RU / EN` определяется автоматически и переключается кнопкой `🌐` в меню `⚡ Чат`).*

### ✨ Что нового в версии v6.3

1. **📦 Умный двухфазный буфер «Текст сразу — Код одним кадром» (Prose-First / Code-Gate Buffer):**
   * *Проблема:* Главный источник тормозов при генерации ответа — пересчёт подсветки синтаксиса внутри длинных блоков кода на каждый приходящий сетевой пакет ($O(N^2)$).
   * *Решение:* Блок размышлений (**Thinking**) и весь вступительный текст **ДО** начала блока кода выводятся на экран сразу же, чтобы вы могли спокойно читать объяснение модели. Как только начинается генерация тяжёлого блока кода, буфер запирается (0% нагрузки на CPU, экран не прыгает), и готовый код появляется целиком сразу после приёма.
2. **🔄 Непрерывная генерация и рендеринг в фоновой вкладке (Background Keep-Alive):**
   * Обходит блокировку Page Visibility API и автоматически переводит кадры рендеринга в фоновой вкладке на фоновый таймер, поэтому ответ полностью дорисовывается даже тогда, когда вы переключились на другую вкладку или другой рабочий стол.
3. **🛡️ Защита видеокарты (GPU) в покое и при голосовой диктовке:**
   * Останавливает бесконечные декоративные CSS-анимации промо-блоков и спиннеров после 1 цикла (`animation-iteration-count: 1`).
   * Отключает ресурсоёмкое размытие фона (`backdrop-filter: blur()`) при прокрутке.
   * Блокирует холостую 60 FPS перерисовку скрытого эквалайзера `<canvas 32x32>` внутри кнопки микрофона `<ms-stt-button>`.
4. **✋ Перетаскиваемый интерфейс (Draggable UX), Умная парковка скролла и Экспорт:**
   * Верхнюю панель и нижнюю кнопку `▼ Свернуть код` можно **перетащить мышкой в любое место экрана** (позиция запоминается).
   * После завершения ответа экран мягко паркуется на **первой строчке** нового сообщения (а не улетает в самый низ).
   * Автоматически чинит сорванную разметку гигантских блоков кода (`>1000 строк`) и поддерживает полный экспорт беседы в `.MD` и `.JSON`.

### 📊 Реальные замеры производительности (Intel i5-3317U / HD 4000 / Linux Wayland)

| Показатель | До оптимизации (Оригинал) | После оптимизации (Форк v6.3) | Итоговый эффект |
| :--- | :--- | :--- | :--- |
| **Потребление в покое (GPU Process)** | **76.6% CPU** (`79% GPU`) | **0% холостых кадров** | **Полная тишина в покое** |
| **Запись голоса (Диктовка в тишине)** | **60 FPS `<canvas 32x32>`** | **0 отрисовок (Блок)** | **Убран жор GPU от микрофона** |
| **Прокрутка длинного чата (120 000 px)** | **13.6 – 24.8 FPS** | **49.5 – 50.5 FPS** (`0` фризов) | **В 2 – 3.5 раза плавнее** |
| **Набор 8 строк текста в поле промпта** | **2.5 – 4.3 FPS** (фризы до 748 мс) | **28.7 FPS** | **В 6.7 раза быстрее** |
| **Стриминг ответа ИИ: Средний FPS** | **12.7 FPS** (провалы до **3 FPS**) | **58.4 FPS** (ровные **61 FPS**) | **Идеальные ~60 FPS** |
| **Стриминг: Время блокировки потока CPU** | **12 042 мс** (**53.6%** времени) | **656 мс** (**1.0%** времени) | **Снижение нагрузки в 18.3 РАЗА!** |
| **Мутации DOM за один ответ ИИ** | **458 мутаций** ($O(N^2)$) | **10 мутаций** ($O(1)$) | **В 45 раз меньше перестроек DOM** |

---

## [EN] About This Fork

Google AI Studio suffers from heavy CPU/GPU bottlenecks during idle states, voice dictation, scrolling, and especially while streaming responses with code blocks due to $O(N^2)$ Markdown & syntax-highlighting re-parsing on every network chunk.

This fork introduces a **Prose-First / Code-Gate Stream Buffer**, **Background Tab Keep-Alive**, an **Idle GPU Saver**, **Draggable UI controls**, and a **Bilingual RU/EN interface**, reducing main-thread CPU blocking during streaming from **53.6% down to 1.0%**.

### 🚀 1-Click Installation
1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. **[Click Here to Install Userscript (Raw GitHub Link)](https://raw.githubusercontent.com/lagovi/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js)**
*(The UI automatically detects English or Russian and can be switched anytime via the `🌐` button inside the `⚡ Chat` menu).*

### ✨ Key Enhancements over v5.17
* **📦 Prose-First / Code-Gate Stream Buffer:** Renders the model's *Thinking* block and introductory prose **before** code blocks immediately so you can read right away, then locks the buffer while heavy code blocks are streaming (at **0% CPU load**) and flushes the completed code block in one shot.
* **🔄 Background Tab Rendering Keep-Alive:** Overrides Page Visibility suspension and routes background `requestAnimationFrame` calls to a timer so responses continue streaming and rendering even when you switch tabs or workspaces.
* **🛡️ Idle GPU & Dictation Canvas Saver:** Stops infinite CSS animations after 1 cycle, removes `backdrop-filter: blur()` lag during scrolling, and blocks the hidden 60 FPS `<canvas width="32" height="32">` equalizer inside `<ms-stt-button>`.
* **✋ Draggable UI, Rich Tooltips & Smart Scroll Parking:** Drag the top pill or bottom `▼ Collapse Code` button anywhere on screen. Automatically parks scroll at the *top* of new AI responses and auto-repairs unrendered code blocks (`>1000 lines`).

---

## 📜 License
MIT License — Original work Copyright (c) [Kfayyy](https://github.com/Kfayyy/Google-AI-Studio-Optimizer); Fork enhancements Copyright (c) [lagovi](https://github.com/lagovi).
