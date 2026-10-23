# ⚡ Google AI Studio — Ultimate Optimizer UI (Stream Buffer & GPU Saver Fork v6.1)

🌍 **[🇷🇺 Русская документация ниже](#-о-проекте-русский) | [🇬🇧 English Documentation below](#-about-this-fork-english)**

> **Attribution & Credits / Благодарности:**
> Этот проект — глубоко модернизированный форк юзерскрипта **[Google AI Studio - Ultimate Optimizer UI](https://github.com/Kfayyy/Google-AI-Studio-Optimizer)** от автора **[Kfayyy](https://github.com/Kfayyy)** ([GreasyFork](https://greasyfork.org/scripts/578144)). Огромное спасибо Kfayyy за оригинальную идею виртуализации DOM и архитектуру экспорта чатов в Markdown/JSON!

---

## 🇷🇺 О проекте (Русский)

Даже на пустой вкладке или во время генерации ответа **Google AI Studio** может нагружать процессор (CPU) и встроенную видеокарту (GPU) на **50–80%**, вызывая тяжёлые фризы интерфейса при вводе текста, скролле и приёме потокового ответа модели.

Этот форк устраняет корневые причины тормозов на уровне рендерера браузера и сетевого стека (`XHR`), снижая фоновую нагрузку до **0%**, а блокировку основного потока во время стриминга — с **53.6% до 1.0%**.

### 🚀 Быстрая установка в 1 клик
1. Установите расширение [Tampermonkey](https://www.tampermonkey.net/) или [Violentmonkey](https://violentmonkey.github.io/).
2. **[Нажмите сюда для установки / обновления скрипта (Raw GitHub)](https://raw.githubusercontent.com/lagovi/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js)**
*(Язык интерфейса скрипта `RU / EN` определяется автоматически и переключается кнопкой `🌐` в меню `⚡ Чат`).*

### ✨ Что нового в версии v6.1

1. **📦 Двухфазный Виртуальный Буфер Стрима (`XHR.responseText` Lock):**
   * *Проблема:* Во время генерации ответа Google AI Studio получает десятки мелких пакетов в секунду и на каждый пакет **с нуля** запускает парсер Markdown и подсветку синтаксиса по всему тексту ($O(N^2)$), вешая браузер.
   * *Решение:* Скрипт позволяет блоку мыслей (**Thinking**) отрисоваться сразу, а тяжёлые чанки основного ответа и кода тихо копит в фоновом буфере при **0% нагрузки на CPU**, выдавая готовый результат одним кадром по завершении (с кнопкой *«👁️ Показать уже принятый текст»*).
2. **🛡️ Защита видеокарты (GPU) и батареи в покое и при диктовке:**
   * Останавливает бесконечные декоративные CSS-анимации промо-блоков и спиннеров после 1 цикла (`animation-iteration-count: 1`).
   * Отключает ресурсоёмкое размытие фона (`backdrop-filter: blur()`) при прокрутке длинных бесед.
   * Блокирует холостую 60 FPS перерисовку скрытого эквалайзера `<canvas 32x32>` внутри кнопки микрофона `<ms-stt-button>` во время голосовой диктовки.
3. **🧠 Ликвидация самострела оригинального скрипта (v5.17):**
   * Убран фоновый рекурсивный парсинг всего чата в Markdown каждые 100 мс при любой мутации DOM. Теперь конвертация в Markdown выполняется только при выгрузке старых сообщений в кэш или при нажатии кнопки Экспорта.
4. **✋ Удобный перетаскиваемый интерфейс (Draggable UX) + Подсказки:**
   * Верхнюю панель (`⚡ Чат | 🩺 0%`) и нижнюю кнопку `▼ Свернуть код` можно **перетащить мышкой в любое место экрана** (координаты сохраняются автоматически).
   * Добавлена **Умная парковка скролла** (после генерации длинного ответа экран встаёт на *первую строчку* нового ответа, а не улетает в подвал) и **Авто-ремонт сорванной разметки** на гигантских блоках кода (`>1000 строк`).
   * Полностью сохранён и улучшен **Экспорт всей беседы в `.MD` и `.JSON`**.

### 📊 Реальные замеры производительности (Intel i5-3317U / HD 4000 / Linux Wayland)

| Показатель | До оптимизации (Оригинал) | После оптимизации (Форк v6.1) | Итоговый эффект |
| :--- | :--- | :--- | :--- |
| **Потребление в покое (GPU Process)** | **76.6% CPU** (`79% GPU`) | **0% холостых кадров** | **Полная тишина в покое** |
| **Запись голоса (Диктовка в тишине)** | **60 FPS `<canvas 32x32>`** | **0 отрисовок (Блок)** | **Убран жор GPU от микрофона** |
| **Прокрутка длинного чата (120 000 px)** | **13.6 – 24.8 FPS** | **49.5 – 50.5 FPS** (`0` фризов) | **В 2 – 3.5 раза плавнее** |
| **Набор 8 строк текста в поле промпта** | **2.5 – 4.3 FPS** (фризы до 748 мс) | **28.7 FPS** | **В 6.7 раза быстрее** |
| **Стриминг ответа ИИ: Средний FPS** | **12.7 FPS** (провалы до **3 FPS**) | **58.4 FPS** (ровные **61 FPS**) | **Идеальные ~60 FPS** |
| **Стриминг: Время блокировки потока CPU** | **12 042 мс** (**53.6%** времени) | **656 мс** (**1.0%** времени) | **Снижение нагрузки в 18.3 РАЗА!** |
| **Мутации DOM за один ответ ИИ** | **458 мутаций** ($O(N^2)$) | **10 мутаций** ($O(1)$ One-Shot) | **В 45 раз меньше перестроек DOM** |

---

## 🇬🇧 About This Fork (English)

Google AI Studio suffers from severe CPU/GPU bottlenecks during idle states, voice dictation, scrolling, and especially while streaming long responses with code blocks due to $O(N^2)$ Markdown & syntax-highlighting re-parsing on every network chunk.

This fork introduces a **Two-Phase Virtual Stream Buffer**, an **Idle GPU Saver**, **Draggable UI controls**, **Bilingual RU/EN interface**, and **Automated Telemetry**, reducing main-thread CPU blocking during streaming from **53.6% down to 1.0%**.

### 🚀 1-Click Installation
1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. **[Click Here to Install Userscript (Raw GitHub Link)](https://raw.githubusercontent.com/lagovi/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js)**
*(The UI automatically detects English or Russian and can be toggled anytime via the `🌐` button inside the `⚡ Chat` menu).*

### ✨ Key Enhancements over v5.17
* **📦 Two-Phase Virtual Stream Buffer (`XHR.responseText` Getter Lock):** Allows the model's *Thinking* block to appear immediately, then buffers incoming response chunks in background memory at **0% CPU load**, rendering the complete answer in a single frame once finished (with an instant *"👁️ Render received text now"* button).
* **🛡️ Idle GPU & Dictation Canvas Saver:** Stops infinite CSS animations after 1 cycle, removes `backdrop-filter: blur()` lag during scrolling, and blocks the hidden 60 FPS `<canvas width="32" height="32">` equalizer inside `<ms-stt-button>` during voice dictation.
* **🧠 Zero-Overhead MutationObserver:** Eliminates the 100ms background `htmlToMarkdown()` full-chat parsing loop during streaming; Markdown is now parsed lazily only when turns are archived or exported.
* **✋ Draggable UI, Rich Tooltips & Smart Scroll Parking:** Drag the top pill or bottom `▼ Collapse Code` button anywhere on screen. Automatically parks scroll at the *top* of new AI responses and auto-repairs unrendered code blocks (`>1000 lines`).

---

## 📜 License
MIT License — Original work Copyright (c) [Kfayyy](https://github.com/Kfayyy/Google-AI-Studio-Optimizer); Fork enhancements Copyright (c) [lagovi](https://github.com/lagovi).
