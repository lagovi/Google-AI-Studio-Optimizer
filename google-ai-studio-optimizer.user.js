// ==UserScript==
// @name         Google AI Studio - Ultimate Optimizer UI (Stream Buffer & GPU Saver Fork)
// @name:ru      Google AI Studio - Оптимизатор интерфейса и Буфер стрима (Форк без тормозов)
// @namespace    https://github.com/lagovi/Google-AI-Studio-Optimizer
// @version      6.1.0
// @description  Zero-CPU Stream Buffering + Idle GPU Saver + Draggable UI + RU/EN i18n + MD/JSON Export. Fork of Kfayyy's Ultimate Optimizer UI.
// @description:ru Буферизация стрима ИИ (0% нагрузки CPU) + Защита видеокарты в покое + Перетаскиваемые кнопки + Экспорт чата в MD/JSON.
// @match        https://aistudio.google.com/*
// @author       lagovi (Original author: Kfayyy - https://github.com/Kfayyy/Google-AI-Studio-Optimizer)
// @license      MIT
// @icon         https://aistudio.google.com/favicon.ico
// @grant        none
// @run-at       document-start
// @downloadURL  https://raw.githubusercontent.com/lagovi/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js
// @updateURL    https://raw.githubusercontent.com/lagovi/Google-AI-Studio-Optimizer/main/google-ai-studio-optimizer.user.js
// ==/UserScript==

(function() {
    'use strict';

    const FENCE = '\x60\x60\x60';
    const CONFIG_KEY = 'ai_studio_optimizer_config_v610';

    let BASE_MAX_VISIBLE = 15, MAX_VISIBLE = 15, MAX_CACHE = 50, RESTORE_COUNT = 10, enabled = true;
    let hypKillInfiniteAnim = true, hypKillBackdropBlur = true, hypSmartObserver = true, hypLazyMarkdown = true;
    let hypSafeTurnIsolate = true, hypPromptContainment = true, hypKillMicCanvas = true;
    let hypThrottleAutoscroll = true, hypCoalesceStreamRaf = true, hypAutoRepairMarkdown = true;
    let hypVirtualStreamBuffer = true, smartScrollParkOnFinish = true;
    let expIncludeThoughts = false, expIncludeSystem = true, expRemoveEmojis = false, expFormat = 'md';
    let posTopPill = null, posBottomBtn = null;
    let lang = (navigator.language || '').toLowerCase().startsWith('ru') ? 'ru' : 'en';

    const I18N = {
        ru: {
            dragTitle: 'Перетаскиваемая панель',
            dragBody: 'Зажмите левую кнопку мыши и перетащите панель в любое удобное место экрана. Позиция сохранится автоматически.',
            hdrChat: '⚡ Чат',
            hdrChatActive: (vis, hid) => `⚡ ${vis} на экране | +${hid} в архиве`,
            hdrChatSimple: (vis) => `⚡ Чат (${vis})`,
            hdrChatTtTitle: 'Управление памятью чата и Экспорт',
            hdrChatTtBody: 'Показывает, сколько последних сообщений открыто на экране, а сколько старых скрыто в архиве для ускорения браузера. Нажмите для настройки или экспорта чата.',
            hdrDiagTtTitle: 'Монитор нагрузки и Ускоритель стрима',
            hdrDiagTtBody: 'Показывает текущую занятость потока браузера (0% — вкладка работает идеально легко). Нажмите для настройки буферизации ответов и диагностики.',
            collapseBtn: '⋮⋮ ▼ Свернуть код',
            collapseDone: (c) => `⋮⋮ ▼ Свёрнуто: ${c}`,
            collapseTtTitle: 'Свернуть длинные блоки кода (можно перетащить мышкой!)',
            collapseTtBody: 'Нажмите, чтобы одним кликом свернуть все открытые простыни кода в чате. Зажмите кнопку мыши, чтобы перетащить кнопку в любое место.',
            bannerHidden: (hid) => `⬆️ В архиве скрыто старых сообщений: ${hid}`,
            bannerMore: (cnt) => `+ Показать ещё ${cnt}`,
            bannerAll: 'Показать все',
            lblMaxVis: 'Оставлять сообщений на экране:',
            ttMaxVisTitle: 'Лимит видимых сообщений в чате',
            ttMaxVisBody: 'Когда беседа становится длинной, старые сообщения сверху временно прячутся в архив, чтобы страница не тормозила при вводе текста и скролле. Рекомендуется: 15–25.',
            lblRestoreCnt: 'Подгружать за один клик по:',
            ttRestoreCntTitle: 'Шаг возврата из архива',
            ttRestoreCntBody: 'Сколько старых сообщений возвращать на экран при нажатии кнопки «Показать ещё».',
            btnOptOn: '⚡ Авто-скрытие старых сообщений: ВКЛ',
            btnOptOff: '⛔ Авто-скрытие старых сообщений: ВЫКЛ',
            ttOptTitle: 'Главный выключатель очистки ленты чата',
            ttOptBody: 'Если выключить, все сообщения диалога (даже сотни штук) всегда будут оставаться в DOM страницы.',
            btnRestore: (cnt, hid) => `⬆ Показать ещё +${cnt} старых (скрыто: ${hid})`,
            ttRestoreTitle: 'Достать сообщения из архива',
            ttRestoreBody: 'Возвращает предыдущие сообщения в верхнюю часть чата.',
            btnResetVis: '⬇ Снова скрыть старые (оставить последние)',
            ttResetVisTitle: 'Очистить экран до заданного лимита',
            ttResetVisBody: 'Скрывает ранее развёрнутые старые сообщения обратно в архив, если страница начала подтормаживать.',
            btnParkOn: '🎯 Ставить экран на начало ответа: ВКЛ',
            btnParkOff: '🎯 Ставить экран на начало ответа: ВЫКЛ',
            ttParkTitle: 'Умная парковка экрана после ответа ИИ',
            ttParkBody: 'Ставит экран ровно на ПЕРВУЮ строчку нового ответа ИИ после завершения генерации, чтобы вы сразу читали его сверху вниз, а не улетали в подвал.',
            btnLang: '🌐 Язык интерфейса: Русский (RU)',
            btnExportOpen: '📥 Экспорт всей беседы в файл (.MD / .JSON)...',
            ttExportTitle: 'Сохранить весь диалог на компьютер',
            ttExportBody: 'Открывает окно скачивания всей истории переписки (включая скрытые сообщения, системный промпт и мысли модели) в формате Markdown или JSON.',
            expModalTitle: '📥 Экспорт истории диалога',
            expFormatLbl: 'Формат файла:',
            expThoughtsLbl: 'Включить блоки размышлений (Thinking)',
            expSysLbl: 'Включить системную инструкцию (System Prompt)',
            expEmojiLbl: 'Удалить эмодзи из текста',
            expCancel: 'Отмена',
            expStart: '🚀 Сканировать и скачать',
            expPrep: '⏳ Подготовка истории...',
            expScan: (dots) => '⏳ Сканирование чата' + '.'.repeat(dots),
            expErr: 'Ошибка при экспорте чата.',
            diagModalTitle: '🩺 Ускоритель работы и Монитор ресурсов',
            t1Title: '📦 Буферизация потокового ответа ИИ (Защита от тормозов при генерации)',
            t1Sub: 'Когда ИИ пишет длинный ответ, скрипт сначала показывает блок мыслей (Thinking), а сам текст ответа копит в фоновом буфере и выдаёт готовым за 1 раз, снижая нагрузку на процессор в 15 раз.',
            t2Title: '🛡️ Отключить холостые анимации и размытие фона (Экономия видеокарты и батареи)',
            t2Sub: 'Убирает бесконечные фоновые перерисовки спиннеров, эквалайзера микрофона и полупрозрачное размытие панелей при прокрутке.',
            t3Title: '🛠️ Автоматически чинить сорванную разметку длинных блоков кода',
            t3Sub: 'Если Google AI Studio на огромном куске кода (>1000 строк) сбился и вывел его простым текстом, скрипт сам оформит его в аккуратное окно с кнопкой копирования.',
            ttStatusTitle: 'Живая телеметрия вкладки',
            ttStatusBody: '• Отклик интерфейса: 0–15 мс означает идеально плавную работу.\n• Занятость потока: какую долю секунды процессор тратит на тяжёлые задачи страницы.\n• Сэкономлено рендеров: сколько раз буфер спас страницу от лишнего пересчёта во время ответа ИИ.',
            devSum: '🔬 Инструменты разработчика (Авто-тест скорости и отправка телеметрии ИИ)',
            btnBench: '⚡ Запустить стресс-тест генерации',
            ttBenchTitle: 'Эталонный замер скорости',
            ttBenchBody: 'Отправляет в чат тестовый запрос (список + таблица + 50 функций кода), измеряет FPS и нагрузку на процессор во время ответа и отправляет JSON-отчёт.',
            btnSnap: '🚀 Отправить текущий отчёт в чат',
            ttSnapTitle: 'Отправить технические метрики',
            ttSnapBody: 'Вставляет текущую статистику производительности вкладки в поле ввода и отправляет её в чат.',
            hudStream: (kb, sec) => `⚡ Принимаем ответ ИИ без нагрузки на процессор: ${kb} КБ (${sec} сек)`,
            hudFlushBtn: '👁️ Показать уже принятый текст',
            hudFlushed: '⚡ Отрисовано!',
            hudFlushTtTitle: 'Принудительно отрисовать текущую часть ответа',
            hudFlushTtBody: 'Пока идёт генерация, скрипт копит текст ответа в лёгком буфере, чтобы браузер не тормозил на каждом слове. Нажмите сюда, если хотите прочитать начало ответа прямо сейчас.',
            codeLines: (n) => `${n} строк`,
            copyCode: '📋 Копировать код',
            copiedCode: '✅ Скопировано!',
            statusText: (isStr, idleSec, lag, busy, selfMs, bufCnt, repCnt) =>
                `Статус вкладки:      ${isStr ? '⚡ Идёт приём ответа ИИ' : `🟢 Покой (${idleSec} сек без ввода)`}\n` +
                `Отклик интерфейса:   ${lag <= 15 ? '🟢 Мгновенный' : '🟡 Задержка'} (${lag} мс)\n` +
                `Занятость потока:    ~${busy}% (сам скрипт тратит всего ${selfMs} мс/сек)\n` +
                `Сэкономлено рендеров: ${bufCnt} шт. за сессию\n` +
                `Починено кодов:      ${repCnt} шт.`
        },
        en: {
            dragTitle: 'Draggable Panel',
            dragBody: 'Hold left mouse button and drag this bar anywhere on screen. Position is saved automatically.',
            hdrChat: '⚡ Chat',
            hdrChatActive: (vis, hid) => `⚡ ${vis} visible | +${hid} archived`,
            hdrChatSimple: (vis) => `⚡ Chat (${vis})`,
            hdrChatTtTitle: 'Chat DOM Memory & Export',
            hdrChatTtBody: 'Shows how many recent messages are rendered on screen and how many older turns are archived to prevent browser lag. Click to configure or export chat.',
            hdrDiagTtTitle: 'Resource Monitor & Stream Accelerator',
            hdrDiagTtBody: 'Shows real-time main thread CPU load (0% means completely idle). Click to configure stream buffering and GPU optimizations.',
            collapseBtn: '⋮⋮ ▼ Collapse Code',
            collapseDone: (c) => `⋮⋮ ▼ Collapsed: ${c}`,
            collapseTtTitle: 'Collapse all code blocks (Draggable!)',
            collapseTtBody: 'Click to collapse all expanded code blocks in the chat. Hold mouse button to drag this button anywhere.',
            bannerHidden: (hid) => `⬆️ Older messages archived for speed: ${hid}`,
            bannerMore: (cnt) => `+ Show ${cnt} more`,
            bannerAll: 'Show all',
            lblMaxVis: 'Max visible messages on screen:',
            ttMaxVisTitle: 'Visible turns limit',
            ttMaxVisBody: 'Older messages above this limit are temporarily hidden from DOM so typing and scrolling stay fast in long sessions. Recommended: 15–25.',
            lblRestoreCnt: 'Messages to restore per click:',
            ttRestoreCntTitle: 'Restore step size',
            ttRestoreCntBody: 'How many older messages to bring back when clicking Restore.',
            btnOptOn: '⚡ Auto-Archive Old Messages: ON',
            btnOptOff: '⛔ Auto-Archive Old Messages: OFF',
            ttOptTitle: 'Master DOM Optimizer Switch',
            ttOptBody: 'When enabled, keeps only the latest messages rendered in DOM.',
            btnRestore: (cnt, hid) => `⬆ Restore +${cnt} older (${hid} hidden)`,
            ttRestoreTitle: 'Restore from archive',
            ttRestoreBody: 'Brings back older messages at the top of the conversation.',
            btnResetVis: '⬇ Trim back to Max Visible limit',
            ttResetVisTitle: 'Trim visible history',
            ttResetVisBody: 'Hides previously restored old messages back into the archive.',
            btnParkOn: '🎯 Park scroll at reply start: ON',
            btnParkOff: '🎯 Park scroll at reply start: OFF',
            ttParkTitle: 'Smart Scroll Parking after AI reply',
            ttParkBody: 'Positions the viewport right at the FIRST line of the new AI response when generation finishes, instead of jumping to the very bottom.',
            btnLang: '🌐 Interface Language: English (EN)',
            btnExportOpen: '📥 Export full conversation (.MD / .JSON)...',
            ttExportTitle: 'Save full chat history to disk',
            ttExportBody: 'Opens the export dialog to scan and download the entire conversation (including archived turns, System Prompt, and Thoughts) as Markdown or JSON.',
            expModalTitle: '📥 Export Conversation History',
            expFormatLbl: 'File Format:',
            expThoughtsLbl: "Include Model's Thoughts (Thinking)",
            expSysLbl: 'Include System Instructions',
            expEmojiLbl: 'Remove Emojis (Strict Mode)',
            expCancel: 'Cancel',
            expStart: '🚀 Auto-Scan & Download',
            expPrep: '⏳ Preparing history...',
            expScan: (dots) => '⏳ Scanning chat' + '.'.repeat(dots),
            expErr: 'Error exporting conversation.',
            diagModalTitle: '🩺 Stream Accelerator & Resource Monitor',
            t1Title: '📦 Two-Phase Virtual Stream Buffer (Zero-Lag AI Generation)',
            t1Sub: 'Renders the Thinking block first, then accumulates heavy answer chunks in a background buffer and renders once when complete — cutting CPU blocking by 15x.',
            t2Title: '🛡️ Idle GPU & Battery Saver (Freeze infinite animations & blur)',
            t2Sub: 'Stops infinite spinner animations, disables heavy backdrop-filter blur during scroll, and blocks 60fps mic canvas redraws.',
            t3Title: '🛠️ Auto-Repair broken markdown on huge code blocks',
            t3Sub: 'If AI Studio fails to format a massive code block (>1000 lines), automatically wraps it into a clean code container with a Copy button.',
            ttStatusTitle: 'Live Tab Telemetry',
            ttStatusBody: '• UI Response Lag: 0–15 ms means buttery-smooth UI.\n• Main Thread Busy: percentage of time spent in heavy tasks.\n• Saved Re-renders: intermediate DOM rebuilds prevented by the stream buffer.',
            devSum: '🔬 Developer Tools (Automated Stream Benchmark & Telemetry)',
            btnBench: '⚡ Run Deterministic Stream Benchmark',
            ttBenchTitle: 'Standardized speed benchmark',
            ttBenchBody: 'Sends a deterministic test prompt, measures FPS and CPU blocking during streaming, and outputs a JSON report.',
            btnSnap: '🚀 Send telemetry snapshot to chat',
            ttSnapTitle: 'Send technical metrics',
            ttSnapBody: 'Inserts the current performance telemetry JSON into the prompt box and sends it.',
            hudStream: (kb, sec) => `⚡ Buffering AI response at 0% CPU load: ${kb} KB (${sec}s)`,
            hudFlushBtn: '👁️ Render received text now',
            hudFlushed: '⚡ Rendered!',
            hudFlushTtTitle: 'Flush buffered text immediately',
            hudFlushTtBody: 'While generating, text is accumulated in a lightweight buffer to prevent lag. Click here to render the partial response right now.',
            codeLines: (n) => `${n} lines`,
            copyCode: '📋 Copy Code',
            copiedCode: '✅ Copied!',
            statusText: (isStr, idleSec, lag, busy, selfMs, bufCnt, repCnt) =>
                `Tab Status:          ${isStr ? '⚡ Receiving AI stream' : `🟢 Idle (${idleSec}s no input)`}\n` +
                `UI Responsiveness:   ${lag <= 15 ? '🟢 Instant' : '🟡 Delayed'} (${lag} ms lag)\n` +
                `Main Thread Load:    ~${busy}% (userscript overhead: ${selfMs} ms/s)\n` +
                `Saved DOM Rebuilds:  ${bufCnt} chunks buffered\n` +
                `Repaired CodeBlocks: ${repCnt}`
        }
    };

    const tr = () => I18N[lang] || I18N.en;

    function loadConfig() {
        try {
            const p = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
            BASE_MAX_VISIBLE = p.BASE_MAX_VISIBLE ?? 15; MAX_CACHE = p.MAX_CACHE ?? 50;
            RESTORE_COUNT = p.RESTORE_COUNT ?? 10; enabled = p.enabled ?? true;
            hypKillInfiniteAnim = p.hypKillInfiniteAnim ?? true; hypKillBackdropBlur = p.hypKillBackdropBlur ?? true;
            hypSmartObserver = p.hypSmartObserver ?? true; hypLazyMarkdown = p.hypLazyMarkdown ?? true;
            hypSafeTurnIsolate = p.hypSafeTurnIsolate ?? true; hypPromptContainment = p.hypPromptContainment ?? true;
            hypKillMicCanvas = p.hypKillMicCanvas ?? true; hypThrottleAutoscroll = p.hypThrottleAutoscroll ?? true;
            hypCoalesceStreamRaf = p.hypCoalesceStreamRaf ?? true; hypAutoRepairMarkdown = p.hypAutoRepairMarkdown ?? true;
            hypVirtualStreamBuffer = p.hypVirtualStreamBuffer ?? true;
            smartScrollParkOnFinish = p.smartScrollParkOnFinish ?? true;
            expIncludeThoughts = p.expIncludeThoughts ?? false; expIncludeSystem = p.expIncludeSystem ?? true;
            expRemoveEmojis = p.expRemoveEmojis ?? false; expFormat = p.expFormat ?? 'md';
            posTopPill = p.posTopPill || null; posBottomBtn = p.posBottomBtn || null;
            if (p.lang === 'ru' || p.lang === 'en') lang = p.lang;
        } catch (e) {}
        MAX_VISIBLE = BASE_MAX_VISIBLE;
    }

    function saveConfig() {
        try {
            localStorage.setItem(CONFIG_KEY, JSON.stringify({
                BASE_MAX_VISIBLE, MAX_CACHE, RESTORE_COUNT, enabled,
                hypKillInfiniteAnim, hypKillBackdropBlur, hypSmartObserver, hypLazyMarkdown,
                hypSafeTurnIsolate, hypPromptContainment, hypKillMicCanvas,
                hypThrottleAutoscroll, hypCoalesceStreamRaf, hypAutoRepairMarkdown,
                hypVirtualStreamBuffer, smartScrollParkOnFinish,
                expIncludeThoughts, expIncludeSystem, expRemoveEmojis, expFormat,
                posTopPill, posBottomBtn, lang
            }));
        } catch (e) {}
    }
    loadConfig();

    const diag = {
        lastInteraction: performance.now(), mutationsPerSec: 0, _mutationCount: 0,
        longTasksCount: 0, longTaskTotalMs: 0, _longTaskWindowMs: 0, eventLoopLagMs: 0,
        cpuBusyPercentEst: 0, scriptSelfTimeMs: 0, _scriptSelfTimeAccum: 0,
        runningAnimations: [], micCanvasDrawsPerSec: 0, _micCanvasDrawCount: 0,
        scrollWritesBlockedPerSec: 0, _scrollWritesBlockedCount: 0,
        bufferedChunksSuppressed: 0, bufferedBytesCurrent: 0,
        repairedBlocksCount: 0, domNodesCount: 0, isStreamingNow: false, inBenchmarkMeasurement: false,
        streamStartTs: 0, forceFlushNow: false,
        lastScanTick: 0, benchmarkHistory: []
    };

    const nativeRAF = window.requestAnimationFrame.bind(window);
    const nativeSetTimeout = window.setTimeout.bind(window);

    async function safeClipboardWrite(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {
            try {
                const ta = document.createElement('textarea');
                ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
                document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
                return true;
            } catch (e2) { return false; }
        }
    }

    function makeElementDraggable(el, initialSavedPos, onSavePos) {
        if (initialSavedPos && typeof initialSavedPos.left === 'number' && typeof initialSavedPos.top === 'number') {
            el.style.left = Math.min(window.innerWidth - 60, Math.max(5, initialSavedPos.left)) + 'px';
            el.style.top = Math.min(window.innerHeight - 40, Math.max(5, initialSavedPos.top)) + 'px';
            el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.transform = 'none';
        }
        let startX = 0, startY = 0, origLeft = 0, origTop = 0, isDragging = false, moved = false;
        el.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            const rect = el.getBoundingClientRect();
            startX = e.clientX; startY = e.clientY; origLeft = rect.left; origTop = rect.top;
            isDragging = true; moved = false;
            const onMove = (me) => {
                if (!isDragging) return;
                const dx = me.clientX - startX, dy = me.clientY - startY;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    moved = true;
                    el.style.left = Math.min(window.innerWidth - rect.width - 4, Math.max(4, origLeft + dx)) + 'px';
                    el.style.top = Math.min(window.innerHeight - rect.height - 4, Math.max(4, origTop + dy)) + 'px';
                    el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.transform = 'none';
                }
            };
            const onUp = () => {
                if (!isDragging) return;
                isDragging = false;
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
                if (moved) {
                    const finalRect = el.getBoundingClientRect();
                    onSavePos({ left: Math.round(finalRect.left), top: Math.round(finalRect.top) });
                }
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        }, true);
        el.addEventListener('click', (e) => {
            if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
        }, true);
    }

    let tooltipEl = null;
    function attachTooltip(targetEl, getTitleFn, getBodyFn) {
        targetEl.addEventListener('mouseenter', () => {
            if (!tooltipEl && document.body) {
                tooltipEl = document.createElement('div');
                Object.assign(tooltipEl.style, {
                    position: 'fixed', zIndex: 100005, background: '#111318', color: '#e8eaed',
                    padding: '10px 14px', borderRadius: '10px', border: '1px solid #4a5568',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.85)', maxWidth: '340px', fontSize: '12px',
                    fontFamily: 'sans-serif', lineHeight: '1.45', pointerEvents: 'none', display: 'none'
                });
                document.body.appendChild(tooltipEl);
            }
            if (!tooltipEl) return;
            const titleText = typeof getTitleFn === 'function' ? getTitleFn() : getTitleFn;
            const bodyText = typeof getBodyFn === 'function' ? getBodyFn() : getBodyFn;
            if (!titleText) return;
            tooltipEl.textContent = '';
            const t = document.createElement('div');
            t.style.fontWeight = 'bold'; t.style.color = '#64ffda'; t.style.marginBottom = '4px';
            t.textContent = titleText;
            const b = document.createElement('div');
            b.style.color = '#cbd5e1'; b.textContent = bodyText;
            tooltipEl.appendChild(t); tooltipEl.appendChild(b);
            tooltipEl.style.display = 'block';

            const rect = targetEl.getBoundingClientRect();
            const ttRect = tooltipEl.getBoundingClientRect();
            let left = rect.left + (rect.width / 2) - (ttRect.width / 2);
            let top = rect.bottom + 10;
            if (top + ttRect.height > window.innerHeight - 10) top = rect.top - ttRect.height - 10;
            left = Math.max(10, Math.min(window.innerWidth - ttRect.width - 10, left));
            tooltipEl.style.left = left + 'px'; tooltipEl.style.top = top + 'px';
        });
        targetEl.addEventListener('mouseleave', () => { if (tooltipEl) tooltipEl.style.display = 'none'; });
    }

    let streamStatusCard = null, streamStatusTitle = null, streamFlushBtn = null;

    function ensureStreamStatusCard() {
        if (streamStatusCard && document.body?.contains(streamStatusCard)) return streamStatusCard;
        if (!document.body) return null;
        streamStatusCard = document.createElement('div');
        Object.assign(streamStatusCard.style, {
            position: 'fixed', bottom: '86px', left: '50%', transform: 'translateX(-50%)',
            background: '#162220', color: '#e0f2f1', padding: '8px 16px', borderRadius: '20px',
            fontFamily: 'sans-serif', fontSize: '12.5px', zIndex: 99998,
            boxShadow: '0 6px 20px rgba(0,0,0,0.6)', border: '1px solid #00897b',
            display: 'none', alignItems: 'center', gap: '14px'
        });

        streamStatusTitle = document.createElement('span');
        streamStatusTitle.style.fontWeight = 'bold';
        streamStatusTitle.style.color = '#64ffda';

        streamFlushBtn = document.createElement('button');
        streamFlushBtn.textContent = tr().hudFlushBtn;
        Object.assign(streamFlushBtn.style, {
            background: '#00695c', color: '#fff', border: '1px solid #26a69a', borderRadius: '14px',
            padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', flexShrink: 0
        });
        attachTooltip(streamFlushBtn, () => tr().hudFlushTtTitle, () => tr().hudFlushTtBody);
        streamFlushBtn.onclick = () => {
            diag.forceFlushNow = true;
            streamFlushBtn.textContent = tr().hudFlushed;
            nativeSetTimeout(() => { streamFlushBtn.textContent = tr().hudFlushBtn; }, 1200);
        };

        streamStatusCard.appendChild(streamStatusTitle);
        streamStatusCard.appendChild(streamFlushBtn);
        document.body.appendChild(streamStatusCard);
        return streamStatusCard;
    }

    function updateStreamBufferHud(active, bytesCount) {
        const card = ensureStreamStatusCard();
        if (!card) return;
        if (!active || !diag.isStreamingNow) { card.style.display = 'none'; return; }
        card.style.display = 'flex';
        const kb = (bytesCount / 1024).toFixed(1);
        const elapsedSec = Math.max(1, Math.round((performance.now() - (diag.streamStartTs || performance.now())) / 1000));
        streamStatusTitle.textContent = tr().hudStream(kb, elapsedSec);
    }

    try {
        const XHRProto = window.XMLHttpRequest.prototype;
        const origOpen = XHRProto.open;
        const respTextDesc = Object.getOwnPropertyDescriptor(XHRProto, 'responseText');
        const respDesc = Object.getOwnPropertyDescriptor(XHRProto, 'response');
        const onReadyDesc = Object.getOwnPropertyDescriptor(XHRProto, 'onreadystatechange');
        const onProgDesc = Object.getOwnPropertyDescriptor(XHRProto, 'onprogress');

        XHRProto.open = function(method, url, ...rest) {
            this._aiLabUrl = String(url || '');
            this._isAiGenStream = /GenerateContent|StreamGenerate/i.test(this._aiLabUrl) && !/CountTokens|Upload/i.test(this._aiLabUrl);
            this._lastAllowedFlushTs = 0;
            this._cachedFlushedText = '';
            this._thoughtPhaseFlushed = false;
            return origOpen.call(this, method, url, ...rest);
        };

        function getSmartBufferedText(xhrInstance, realText) {
            if (!hypVirtualStreamBuffer || !xhrInstance._isAiGenStream || !diag.isStreamingNow || xhrInstance.readyState !== 3) {
                if (xhrInstance._isAiGenStream && xhrInstance.readyState === 4) updateStreamBufferHud(false, 0);
                return realText;
            }
            if (!diag.streamStartTs) diag.streamStartTs = performance.now();
            const now = performance.now(), len = realText ? realText.length : 0;

            const isEarlyThinkingWindow = !xhrInstance._thoughtPhaseFlushed && (now - diag.streamStartTs < 7000) && (now - xhrInstance._lastAllowedFlushTs > 1800);
            const hasThoughtDomAlready = Boolean(document.querySelector('ms-chat-turn:last-of-type ms-thought-chunk'));
            if (hasThoughtDomAlready && !xhrInstance._thoughtPhaseFlushed && (now - xhrInstance._lastAllowedFlushTs > 2200)) {
                xhrInstance._thoughtPhaseFlushed = true;
                xhrInstance._lastAllowedFlushTs = now;
                xhrInstance._cachedFlushedText = realText;
                return realText;
            }

            if (diag.forceFlushNow || isEarlyThinkingWindow) {
                diag.forceFlushNow = false;
                xhrInstance._lastAllowedFlushTs = now;
                xhrInstance._cachedFlushedText = realText;
                updateStreamBufferHud(true, len);
                return realText;
            }

            diag.bufferedChunksSuppressed++;
            diag.bufferedBytesCurrent = len;
            updateStreamBufferHud(true, len);
            return xhrInstance._cachedFlushedText || '';
        }

        if (respTextDesc?.get) {
            Object.defineProperty(XHRProto, 'responseText', {
                get: function() { return getSmartBufferedText(this, respTextDesc.get.call(this)); },
                configurable: true
            });
        }

        if (respDesc?.get) {
            Object.defineProperty(XHRProto, 'response', {
                get: function() {
                    const realResp = respDesc.get.call(this);
                    if (typeof realResp === 'string') return getSmartBufferedText(this, realResp);
                    return realResp;
                },
                configurable: true
            });
        }

        function shouldAllowStreamEventNow(xhr) {
            if (!hypVirtualStreamBuffer || !xhr._isAiGenStream || !diag.isStreamingNow) return true;
            if (xhr.readyState === 4) { updateStreamBufferHud(false, 0); return true; }
            if (diag.forceFlushNow) return true;
            const now = performance.now();
            if (!diag.streamStartTs) diag.streamStartTs = now;
            if (now - (xhr._lastAllowedEventTs || 0) > 1800 && (now - diag.streamStartTs < 7000)) {
                xhr._lastAllowedEventTs = now;
                return true;
            }
            diag.bufferedChunksSuppressed++;
            if (respTextDesc?.get) {
                const rt = respTextDesc.get.call(xhr);
                updateStreamBufferHud(true, rt ? rt.length : 0);
            }
            return false;
        }

        if (onReadyDesc?.set) {
            Object.defineProperty(XHRProto, 'onreadystatechange', {
                get: function() { return onReadyDesc.get.call(this); },
                set: function(fn) {
                    if (typeof fn === 'function') {
                        return onReadyDesc.set.call(this, function(evt) {
                            if (!shouldAllowStreamEventNow(this)) return;
                            return fn.call(this, evt);
                        });
                    }
                    return onReadyDesc.set.call(this, fn);
                },
                configurable: true
            });
        }

        if (onProgDesc?.set) {
            Object.defineProperty(XHRProto, 'onprogress', {
                get: function() { return onProgDesc.get.call(this); },
                set: function(fn) {
                    if (typeof fn === 'function') {
                        return onProgDesc.set.call(this, function(evt) {
                            if (!shouldAllowStreamEventNow(this)) return;
                            return fn.call(this, evt);
                        });
                    }
                    return onProgDesc.set.call(this, fn);
                },
                configurable: true
            });
        }

        ['addEventListener', '__zone_symbol__addEventListener'].forEach(methodName => {
            const origAdd = XHRProto[methodName];
            if (!origAdd) return;
            XHRProto[methodName] = function(type, listener, ...rest) {
                if ((type === 'progress' || type === 'readystatechange') && typeof listener === 'function') {
                    const wrapped = function(evt) {
                        if (!shouldAllowStreamEventNow(this)) return;
                        return listener.call(this, evt);
                    };
                    return origAdd.call(this, type, wrapped, ...rest);
                }
                return origAdd.call(this, type, listener, ...rest);
            };
        });
    } catch (e) {}

    try {
        let q = [], timer = null;
        window.requestAnimationFrame = function(cb) {
            if (hypCoalesceStreamRaf && diag.isStreamingNow && !diag.inBenchmarkMeasurement) {
                q.push(cb);
                if (!timer) {
                    timer = nativeSetTimeout(() => {
                        timer = null;
                        nativeRAF((ts) => {
                            const batch = q; q = [];
                            for (let i = 0; i < batch.length; i++) { try { batch[i](ts); } catch (e) {} }
                        });
                    }, 180);
                }
                return Math.floor(Math.random() * 1e6);
            }
            return nativeRAF(cb);
        };
    } catch (e) {}

    try {
        let lastScrollTs = 0;
        const shouldBlockScroll = () => {
            if (!hypThrottleAutoscroll || !diag.isStreamingNow || diag.inBenchmarkMeasurement) return false;
            const now = performance.now();
            if (now - lastScrollTs < 800) { diag._scrollWritesBlockedCount++; return true; }
            lastScrollTs = now; return false;
        };
        const stDesc = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
        if (stDesc?.set && stDesc?.get) {
            Object.defineProperty(Element.prototype, 'scrollTop', {
                get() { return stDesc.get.call(this); },
                set(v) { if (!shouldBlockScroll()) return stDesc.set.call(this, v); },
                configurable: true
            });
        }
        ['scrollTo', 'scrollBy', 'scrollIntoView'].forEach(m => {
            const orig = Element.prototype[m];
            if (orig) Element.prototype[m] = function(...a) { if (!shouldBlockScroll()) return orig.apply(this, a); };
        });
    } catch (e) {}

    try {
        ['clearRect', 'fillRect', 'stroke', 'fill', 'drawImage'].forEach(m => {
            const orig = CanvasRenderingContext2D.prototype[m];
            if (!orig) return;
            CanvasRenderingContext2D.prototype[m] = function(...a) {
                const c = this.canvas;
                if (c && (c.width <= 64 || c.closest?.('ms-stt-button'))) {
                    diag._micCanvasDrawCount++;
                    if (hypKillMicCanvas) return;
                }
                return orig.apply(this, a);
            };
        });
    } catch (e) {}

    ['keydown', 'mousedown', 'wheel', 'touchstart', 'pointerdown'].forEach(evt => {
        window.addEventListener(evt, () => { diag.lastInteraction = performance.now(); }, { passive: true, capture: true });
    });

    try {
        new PerformanceObserver((list) => {
            for (const e of list.getEntries()) {
                diag.longTasksCount++; diag.longTaskTotalMs += Math.round(e.duration); diag._longTaskWindowMs += e.duration;
            }
        }).observe({ entryTypes: ['longtask'] });
    } catch (e) {}

    let lastTick = performance.now();
    setInterval(() => {
        const now = performance.now();
        diag.eventLoopLagMs = Math.round(Math.max(0, (now - lastTick) - 250));
        lastTick = now;
        checkIsModelStreaming();
    }, 250);

    function parkScrollAtStartOfLastModelTurn() {
        if (!smartScrollParkOnFinish) return;
        try {
            const turns = document.querySelectorAll('ms-chat-turn');
            const lastTurn = turns[turns.length - 1];
            if (!lastTurn) return;
            const scrollEl = findScrollableChatContainer();
            if (!scrollEl) return;
            const turnRect = lastTurn.getBoundingClientRect();
            const contRect = scrollEl.getBoundingClientRect ? scrollEl.getBoundingClientRect() : { top: 0 };
            if (turnRect.top < contRect.top + 40) {
                scrollEl.scrollTop += (turnRect.top - contRect.top - 60);
            }
        } catch (e) {}
    }

    function checkIsModelStreaming() {
        const b = document.querySelector('ms-run-button button, button.run-button');
        const streaming = Boolean(b && (/stop/i.test(b.textContent || '') || /stop/i.test(b.getAttribute('aria-label') || '')));
        if (streaming !== diag.isStreamingNow) {
            diag.isStreamingNow = streaming;
            document.body?.classList.toggle('ai-studio-is-streaming', streaming);
            if (streaming) {
                diag.streamStartTs = performance.now();
            } else {
                diag.streamStartTs = 0;
                updateStreamBufferHud(false, 0);
                nativeSetTimeout(() => {
                    if (hypAutoRepairMarkdown) repairUnparsedCodeBlocks();
                    parkScrollAtStartOfLastModelTurn();
                }, 300);
            }
        }
        return streaming;
    }

    function repairUnparsedCodeBlocks() {
        if (!hypAutoRepairMarkdown || diag.isStreamingNow) return;
        const fenceRe = new RegExp(FENCE + '([a-zA-Z0-9_-]*)\\n([\\s\\S]*?)' + FENCE, 'g');
        document.querySelectorAll('ms-chat-turn ms-text-chunk, ms-chat-turn .text-chunk').forEach(chunk => {
            if (chunk.closest('ms-code-block') || chunk.dataset.repairedFence) return;
            const txt = chunk.textContent || '';
            if (!txt.includes(FENCE)) return;
            const match = fenceRe.exec(txt);
            if (match && match[2] && match[2].length > 80) {
                chunk.dataset.repairedFence = '1';
                diag.repairedBlocksCount++;
                const wrapper = document.createElement('div');
                Object.assign(wrapper.style, {
                    background: '#141418', border: '1px solid #3a3a48', borderRadius: '8px',
                    margin: '10px 0', overflow: 'hidden'
                });
                const bar = document.createElement('div');
                Object.assign(bar.style, {
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 12px', background: '#22222a', borderBottom: '1px solid #333', fontSize: '12px', color: '#80cbc4'
                });
                const lbl = document.createElement('span');
                lbl.textContent = `<> ${match[1] || 'Code'} (${tr().codeLines(match[2].split('\n').length)})`;
                const cpBtn = document.createElement('button');
                cpBtn.textContent = tr().copyCode;
                Object.assign(cpBtn.style, {
                    background: '#00695c', color: '#fff', border: 'none', borderRadius: '4px',
                    padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px'
                });
                const codeContent = match[2];
                cpBtn.onclick = () => {
                    safeClipboardWrite(codeContent);
                    cpBtn.textContent = tr().copiedCode;
                    nativeSetTimeout(() => { cpBtn.textContent = tr().copyCode; }, 2000);
                };
                bar.appendChild(lbl); bar.appendChild(cpBtn);
                const pre = document.createElement('pre');
                Object.assign(pre.style, {
                    margin: 0, padding: '10px 12px', maxHeight: '420px', overflow: 'auto',
                    fontFamily: 'monospace', fontSize: '12px', color: '#e0e0e0', whiteSpace: 'pre'
                });
                pre.textContent = codeContent;
                wrapper.appendChild(bar); wrapper.appendChild(pre);
                chunk.parentElement?.insertBefore(wrapper, chunk);
            }
        });
    }

    const hypStyleEl = document.createElement('style');
    function applyHypothesisStyles() {
        let css = '';
        if (hypKillInfiniteAnim) css += `*, *::before, *::after { animation-iteration-count: 1 !important; scroll-behavior: auto !important; }\n`;
        if (hypKillBackdropBlur) css += `*, *::before, *::after { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }\n`;
        if (hypSafeTurnIsolate) {
            css += `ms-chat-turn:not(:hover):not(:focus-within):not(:nth-last-of-type(-n+2)) { contain: layout style !important; }\n`;
            css += `body.ai-studio-is-streaming ms-items-scrollbar { display: none !important; }\n`;
        }
        if (hypPromptContainment) {
            css += `footer, ms-prompt-box, .prompt-box-container, .input-area { contain: layout style !important; }\n`;
            css += `footer textarea, ms-prompt-box textarea { max-height: 140px !important; overflow-y: auto !important; }\n`;
        }
        if (hypKillMicCanvas) {
            css += `
                ms-stt-button canvas { display: none !important; }
                ms-stt-button button.visible {
                    background: rgba(213, 0, 0, 0.25) !important;
                    outline: 2px solid #ff5252 !important;
                }
            `;
        }
        if (hypVirtualStreamBuffer) {
            css += `
                body.ai-studio-is-streaming ms-chat-turn:last-of-type ms-code-block pre {
                    content-visibility: hidden !important;
                    height: 36px !important;
                    overflow: hidden !important;
                }
            `;
        }
        hypStyleEl.textContent = css;
        if (document.head && !document.head.contains(hypStyleEl)) document.head.appendChild(hypStyleEl);
    }

    let hiddenMessages = [], detachedMessages = [], chatContainerRef = null, lastUrl = location.href;
    let inChatRestoreBanner = null, bannerMoreBtn = null, bannerAllBtn = null;
    const exportedTurns = new Map();
    const debounce = (fn, w) => { let t; return (...a) => { clearTimeout(t); t = nativeSetTimeout(() => fn(...a), w); }; };
    const getMessages = () => Array.from(document.querySelectorAll('ms-chat-turn'));

    function ensureInChatRestoreBanner() {
        if (!inChatRestoreBanner) {
            inChatRestoreBanner = document.createElement('div');
            Object.assign(inChatRestoreBanner.style, {
                display: 'none', justifyContent: 'center', alignItems: 'center', gap: '12px',
                padding: '8px 16px', margin: '10px auto', maxWidth: '580px', borderRadius: '20px',
                background: '#1e242b', border: '1px solid #37474f', color: '#90caf9',
                fontSize: '12px', fontFamily: 'sans-serif', zIndex: 10
            });
            const lbl = document.createElement('span');
            lbl.id = 'ai-opt-banner-lbl';
            bannerMoreBtn = document.createElement('button');
            Object.assign(bannerMoreBtn.style, {
                background: '#1565c0', color: '#fff', border: 'none', borderRadius: '12px',
                padding: '4px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold'
            });
            bannerMoreBtn.onclick = (e) => { e.stopPropagation(); restoreMessages(); };

            bannerAllBtn = document.createElement('button');
            Object.assign(bannerAllBtn.style, {
                background: '#37474f', color: '#fff', border: 'none', borderRadius: '12px',
                padding: '4px 10px', cursor: 'pointer', fontSize: '11px'
            });
            bannerAllBtn.onclick = (e) => { e.stopPropagation(); restoreFullDOM(); };

            inChatRestoreBanner.appendChild(lbl);
            inChatRestoreBanner.appendChild(bannerMoreBtn);
            inChatRestoreBanner.appendChild(bannerAllBtn);
        }
        bannerMoreBtn.textContent = tr().bannerMore(RESTORE_COUNT);
        bannerAllBtn.textContent = tr().bannerAll;
        return inChatRestoreBanner;
    }

    function updateUiCounters() {
        const hiddenTotal = hiddenMessages.length + detachedMessages.length;
        const visCount = getMessages().filter(t => t.style.display !== 'none').length;
        if (restoreBtn) restoreBtn.innerText = tr().btnRestore(RESTORE_COUNT, hiddenTotal);
        if (headerMainBtn) {
            headerMainBtn.innerText = hiddenTotal > 0 ? tr().hdrChatActive(visCount, hiddenTotal) : tr().hdrChatSimple(visCount);
        }
        const banner = ensureInChatRestoreBanner();
        if (hiddenTotal > 0) {
            const firstVis = getMessages().find(t => t.style.display !== 'none');
            if (firstVis && firstVis.parentNode) {
                if (banner.nextSibling !== firstVis) firstVis.parentNode.insertBefore(banner, firstVis);
                banner.style.display = 'flex';
                const lbl = banner.querySelector('#ai-opt-banner-lbl');
                if (lbl) lbl.textContent = tr().bannerHidden(hiddenTotal);
            }
        } else {
            banner.style.display = 'none';
        }
    }

    function captureSingleTurn(turn) {
        if (!turn?.id) return;
        const root = turn.querySelector('ms-prompt-chunk, .text-chunk, ms-text-chunk');
        if (!root?.textContent?.trim()) return;
        let role = 'Unknown';
        if (turn.querySelector('[data-turn-role="User"], .user, .user-prompt-container')) role = 'User';
        else if (turn.querySelector('[data-turn-role="Model"], .model, .model-prompt-container')) role = 'Gemini';
        const sig = root.textContent.length + '-' + role;
        if (exportedTurns.get(turn.id)?.signature === sig) return;
        let thoughts = '';
        const tn = turn.querySelector('ms-thought-chunk .mat-expansion-panel-body, ms-thought-chunk ms-text-chunk');
        if (tn) thoughts = htmlToMarkdown(tn).replace(/\n{3,}/g, '\n\n').trim();
        let text = htmlToMarkdown(root).replace(/\n{3,}/g, '\n\n').trim();
        if (!text && !thoughts) return;
        exportedTurns.set(turn.id, { role, thoughts, markdown: text, signature: sig });
    }

    function restoreMessages() {
        const totalAvailable = hiddenMessages.length + detachedMessages.length;
        if (totalAvailable === 0) return;
        const count = Math.min(RESTORE_COUNT, totalAvailable);
        MAX_VISIBLE += count;
        const neededFromDetached = MAX_VISIBLE - getMessages().length;
        if (neededFromDetached > 0 && detachedMessages.length > 0) {
            const toReattach = detachedMessages.splice(-Math.min(neededFromDetached, detachedMessages.length));
            const referenceNode = getMessages()[0];
            if (referenceNode?.parentNode) toReattach.forEach(el => referenceNode.parentNode.insertBefore(el, referenceNode));
            else if (chatContainerRef) toReattach.forEach(el => chatContainerRef.appendChild(el));
        }
        optimizeDOM();
    }

    function restoreFullDOM() {
        const cur = getMessages(), ref = cur[0] || null, cont = ref ? ref.parentNode : chatContainerRef;
        if (detachedMessages.length && cont) {
            detachedMessages.forEach(el => ref ? cont.insertBefore(el, ref) : cont.appendChild(el));
            detachedMessages = [];
        }
        getMessages().forEach(el => { el.style.display = ''; });
        hiddenMessages = [];
        MAX_VISIBLE = getMessages().length + 50;
        updateUiCounters();
    }

    function optimizeDOM() {
        const t0 = performance.now();
        if (location.href !== lastUrl) {
            lastUrl = location.href; hiddenMessages = []; detachedMessages = []; chatContainerRef = null; exportedTurns.clear(); MAX_VISIBLE = BASE_MAX_VISIBLE;
        }
        if (hypAutoRepairMarkdown && !diag.isStreamingNow) repairUnparsedCodeBlocks();
        if (!enabled) { diag._scriptSelfTimeAccum += (performance.now() - t0); return; }
        const msgs = getMessages();
        if (msgs.length <= MAX_VISIBLE) {
            msgs.forEach(el => { if (el.style.display === 'none') el.style.display = ''; });
            hiddenMessages = []; updateUiCounters();
            diag._scriptSelfTimeAccum += (performance.now() - t0); return;
        }
        const toHide = msgs.length - MAX_VISIBLE;
        hiddenMessages = [];
        msgs.forEach((el, i) => {
            if (i < toHide) { if (el.style.display !== 'none') el.style.display = 'none'; hiddenMessages.push(el); }
            else if (el.style.display === 'none') el.style.display = '';
        });
        if (hiddenMessages.length > MAX_CACHE) {
            const excess = hiddenMessages.length - MAX_CACHE;
            hiddenMessages.slice(0, excess).forEach(el => {
                captureSingleTurn(el);
                if (!chatContainerRef && el.parentNode) chatContainerRef = el.parentNode;
                el.remove(); detachedMessages.push(el);
            });
            hiddenMessages = hiddenMessages.slice(excess);
        }
        updateUiCounters();
        diag._scriptSelfTimeAccum += (performance.now() - t0);
    }
    const debouncedOptimizeDOM = debounce(optimizeDOM, 250);

    function getConversationTitle() {
        const titleEl = document.querySelector('.page-title h1, h1.mode-title');
        return titleEl ? titleEl.textContent.trim() : 'Google_AI_Studio_Export';
    }

    function getSystemInstructions() {
        if (!expIncludeSystem) return '';
        const p = document.querySelector('ms-system-instructions-panel');
        if (!p) return '';
        const ta = p.querySelector('textarea');
        if (ta) return ta.value.trim();
        const sub = p.querySelector('.subtitle');
        if (sub) {
            const txt = sub.textContent.trim();
            if (txt && txt.toLowerCase() !== 'optional tone and style instructions for the model') return txt;
        }
        return '';
    }

    function htmlToMarkdown(node) {
        if (!node) return '';
        if (node.nodeType === 3) return node.nodeValue;
        if (node.nodeType !== 1) return '';
        const tag = node.tagName.toLowerCase();
        if (tag === 'ms-thought-chunk') return '';
        if (tag === 'ms-code-block') {
            const lang = node.getAttribute('data-test-language') || '';
            const code = node.querySelector('pre code')?.textContent || '';
            return '\n\n' + FENCE + lang + '\n' + code + '\n' + FENCE + '\n\n';
        }
        let ch = ''; node.childNodes.forEach(c => ch += htmlToMarkdown(c));
        switch (tag) {
            case 'p': return '\n\n' + ch.trim() + '\n\n';
            case 'strong': case 'b': return '**' + ch + '**';
            case 'em': case 'i': return '*' + ch + '*';
            case 'a': return '[' + ch + '](' + (node.getAttribute('href') || '') + ')';
            case 'ul': case 'ol': return '\n' + ch + '\n';
            case 'li': return '* ' + ch.trim() + '\n';
            case 'h1': return '\n\n# ' + ch.trim() + '\n\n';
            case 'h2': return '\n\n## ' + ch.trim() + '\n\n';
            case 'h3': return '\n\n### ' + ch.trim() + '\n\n';
            case 'br': return '\n';
            default: return ch;
        }
    }

    function stripEmojisSafe(text) {
        if (!text) return text;
        const regex = new RegExp('(' + FENCE + '[\\s\\S]*?' + FENCE + '|`[\\s\\S]*?`)|([\\p{Emoji_Presentation}\\p{Extended_Pictographic}])', 'gu');
        return text.replace(regex, (m, codeBlock, emoji) => codeBlock ? codeBlock : (emoji ? '' : m));
    }

    function generateExportFile(orderedIds) {
        let title = getConversationTitle();
        let systemInstructions = getSystemInstructions();
        const date = new Date().toISOString().split('T')[0];
        if (expRemoveEmojis) {
            title = stripEmojisSafe(title);
            systemInstructions = stripEmojisSafe(systemInstructions);
        }
        let fileContent = '', fileExt = '', mimeType = '';
        if (expFormat === 'json') {
            const jsonOutput = { title, date, system_instructions: systemInstructions || undefined, history: [] };
            orderedIds.forEach(id => {
                const d = exportedTurns.get(id);
                if (d && (d.markdown || (expIncludeThoughts && d.thoughts))) {
                    const obj = { role: d.role.toLowerCase() };
                    let th = d.thoughts, ct = d.markdown;
                    if (expRemoveEmojis) { th = stripEmojisSafe(th); ct = stripEmojisSafe(ct); }
                    if (expIncludeThoughts && th) obj.thoughts = th;
                    if (ct) obj.content = ct;
                    jsonOutput.history.push(obj);
                }
            });
            fileContent = JSON.stringify(jsonOutput, null, 2);
            fileExt = 'json'; mimeType = 'application/json';
        } else {
            fileContent = '---\nTitle: ' + title + '\nDate: ' + date + '\n';
            if (systemInstructions) fileContent += 'System Instructions: |\n  ' + systemInstructions.replace(/\n/g, '\n  ') + '\n';
            fileContent += '---\n\n# Conversation History\n\n';
            const iconUser = expRemoveEmojis ? '' : '👤 ';
            const iconBot = expRemoveEmojis ? '' : '🤖 ';
            const iconThought = expRemoveEmojis ? "Gemini's Thoughts" : "💭 Gemini's Thoughts";
            orderedIds.forEach(id => {
                const d = exportedTurns.get(id);
                if (d) {
                    let txt = d.markdown, th = d.thoughts;
                    if (expRemoveEmojis) { txt = stripEmojisSafe(txt); th = stripEmojisSafe(th); }
                    if (expIncludeThoughts && th) {
                        txt = '<details>\n<summary>' + iconThought + '</summary>\n\n' + th + '\n\n</details>\n\n' + txt;
                    }
                    if (txt) {
                        if (d.role === 'User') fileContent += '### ' + iconUser + 'User\n' + txt + '\n\n';
                        else if (d.role === 'Gemini') fileContent += '### ' + iconBot + 'Gemini\n' + txt + '\n\n';
                        else fileContent += txt + '\n\n';
                    }
                }
            });
            fileExt = 'md'; mimeType = 'text/markdown';
        }
        const blob = new Blob([fileContent], { type: mimeType + ';charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '').substring(0, 15);
        a.href = url; a.download = safeTitle + '_' + timestamp + '.' + fileExt;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function performAutoScrollExport() {
        const btn = document.getElementById('modal-start-export-btn');
        if (!btn) return;
        const origTxt = btn.innerText; btn.disabled = true;
        try {
            const scrollEl = findScrollableChatContainer();
            const wasEnabled = enabled, origScroll = scrollEl.scrollTop;
            enabled = false; restoreFullDOM();
            btn.innerText = tr().expPrep;
            let lastUp = -1;
            while (scrollEl.scrollTop > 0 && scrollEl.scrollTop !== lastUp) {
                lastUp = scrollEl.scrollTop; scrollEl.scrollTop -= 2500;
                await new Promise(r => nativeSetTimeout(r, 50));
            }
            scrollEl.scrollTop = 0;
            await new Promise(r => nativeSetTimeout(r, 400));

            const orderedIds = [];
            let maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight, lastScroll = -1, dots = 0;
            const step = Math.max(500, scrollEl.clientHeight * 0.85);
            while (scrollEl.scrollTop <= maxScroll) {
                collapseAll();
                maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
                dots = (dots + 1) % 4;
                btn.innerText = tr().expScan(dots);
                document.querySelectorAll('ms-chat-turn').forEach(turn => {
                    if (!turn.id) return;
                    if (!orderedIds.includes(turn.id)) orderedIds.push(turn.id);
                    captureSingleTurn(turn);
                });
                if (scrollEl.scrollTop === lastScroll && scrollEl.scrollTop > 0) {
                    await new Promise(r => nativeSetTimeout(r, 300));
                    maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
                    if (scrollEl.scrollTop >= maxScroll) break;
                }
                lastScroll = scrollEl.scrollTop; scrollEl.scrollTop += step;
                await new Promise(r => nativeSetTimeout(r, 140));
            }
            generateExportFile(orderedIds);
            scrollEl.scrollTop = origScroll;
            if (wasEnabled) { enabled = true; MAX_VISIBLE = BASE_MAX_VISIBLE; optimizeDOM(); }
            exportModalOverlay.style.display = 'none';
        } catch (e) {
            alert(tr().expErr);
        } finally {
            btn.innerText = origTxt; btn.disabled = false;
        }
    }

    function findScrollableChatContainer() {
        const ct = document.querySelector('ms-chat-turn');
        if (ct) {
            let p = ct.parentElement;
            while (p && p !== document.body) {
                const st = window.getComputedStyle(p);
                if ((st.overflowY === 'auto' || st.overflowY === 'scroll') && p.scrollHeight > p.clientHeight) return p;
                p = p.parentElement;
            }
        }
        return document.querySelector('ms-autoscroll-container') || document.documentElement;
    }

    function buildInstantAiReportObject() {
        const vis = getMessages();
        return {
            report_version: '6.1.0-i18n-fork',
            timestamp: new Date().toISOString(),
            session_scale: {
                turns_total_known: vis.length + detachedMessages.length,
                turns_rendered_visible: vis.filter(t => t.style.display !== 'none').length,
                dom_total_nodes: document.getElementsByTagName('*').length,
                dom_code_blocks: document.querySelectorAll('ms-code-block').length
            },
            live_snapshot: {
                event_loop_lag_ms: diag.eventLoopLagMs, cpu_busy_est_pct: diag.cpuBusyPercentEst,
                long_tasks_total_count: diag.longTasksCount, long_tasks_total_ms: diag.longTaskTotalMs,
                mutations_per_sec: diag.mutationsPerSec, buffered_chunks_suppressed_total: diag.bufferedChunksSuppressed,
                userscript_self_time_ms_per_sec: diag.scriptSelfTimeMs
            },
            benchmark_runs_history: diag.benchmarkHistory
        };
    }

    function setNativeTextareaValue(ta, text) {
        if (!ta) return;
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        if (setter) setter.call(ta, text); else ta.value = text;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
    }

    async function sendTextToAiChat(msg) {
        const ta = document.querySelector('footer textarea, ms-prompt-box textarea, textarea');
        if (!ta) return false;
        let w = 0; while (checkIsModelStreaming() && w < 30) { await new Promise(r => nativeSetTimeout(r, 500)); w++; }
        setNativeTextareaValue(ta, msg);
        await new Promise(r => nativeSetTimeout(r, 250));
        const btn = document.querySelector('button.run-button, ms-run-button button, button[aria-label*="Run"]');
        if (btn && !btn.disabled) btn.click();
        else ta.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', ctrlKey: true, bubbles: true }));
        return true;
    }

    async function runDeterministicGenerationBenchmark(btnEl, autoSendAfter = true) {
        const origText = btnEl ? btnEl.innerText : '';
        if (btnEl) btnEl.disabled = true;
        try {
            const prompt = "BENCHMARK_STREAM_TEST: Reply with exact deterministic structure and NO extra commentary:\n1) Numbers from 1 to 50 separated by commas.\n2) A Markdown table with 5 columns (ID, Name, MetricA, MetricB, Status) and 12 rows.\n3) A JavaScript code block containing exactly 50 short one-line functions named fn1() through fn50().";
            const turnsBefore = getMessages().length;
            await sendTextToAiChat(prompt);
            const startT = performance.now(), sLtCnt = diag.longTasksCount, sLtMs = diag.longTaskTotalMs, sMut = diag._mutationCount, sBuf = diag.bufferedChunksSuppressed;
            const deltas = [], buckets = [];
            let bFrames = [], bStart = startT, lastT = startT, firstTok = null, started = false, done = false;

            await new Promise((resolve) => {
                function loop(now) {
                    if (done) { resolve(); return; }
                    const dt = now - lastT; lastT = now; deltas.push(dt); bFrames.push(dt);
                    const gen = checkIsModelStreaming();
                    if ((gen || getMessages().length > turnsBefore) && !started) { started = true; firstTok = now; }
                    if (now - bStart >= 1000) {
                        const sec = Math.round((now - startT) / 1000);
                        buckets.push({ sec, fps: bFrames.length, max_frame_ms: Math.round(Math.max(...bFrames)) });
                        if (btnEl) btnEl.innerText = `⏳ (${sec}s | ${bFrames.length} FPS)...`;
                        bFrames = []; bStart = now;
                    }
                    if ((started && (now - firstTok > 2000) && !gen) || (now - startT > 65000)) { done = true; resolve(); return; }
                    nativeRAF(loop);
                }
                nativeRAF(t => { lastT = t; bStart = t; nativeRAF(loop); });
            });
            await new Promise(r => nativeSetTimeout(r, 700));
            const totalMs = Math.round(performance.now() - startT);
            const clean = deltas.slice(1), avg = clean.reduce((a, b) => a + b, 0) / (clean.length || 1);
            diag.benchmarkHistory.push({
                run_id: diag.benchmarkHistory.length + 1, run_type: 'DETERMINISTIC_STREAM_V610',
                total_wall_time_ms: totalMs,
                avg_fps_during_stream: Math.round((clean.length / (totalMs / 1000)) * 10) / 10,
                avg_frame_ms: Math.round(avg * 10) / 10,
                long_tasks_count_delta: diag.longTasksCount - sLtCnt, long_tasks_total_ms_delta: diag.longTaskTotalMs - sLtMs,
                cpu_thread_blocked_pct: Math.round(((diag.longTaskTotalMs - sLtMs) / totalMs) * 1000) / 10,
                dom_mutations_delta: diag._mutationCount - sMut,
                network_chunks_buffered_delta: diag.bufferedChunksSuppressed - sBuf,
                per_second_timeline: buckets
            });
            const md = FENCE + 'json\n' + JSON.stringify(buildInstantAiReportObject(), null, 2) + '\n' + FENCE;
            await safeClipboardWrite(md);
            if (autoSendAfter) {
                await new Promise(r => nativeSetTimeout(r, 1200));
                await sendTextToAiChat("🤖 **[AUTO-TELEMETRY REPORT v6.1.0]**\n\n" + md);
            }
            if (btnEl) {
                btnEl.innerText = '✅ OK!';
                nativeSetTimeout(() => { btnEl.innerText = origText; btnEl.disabled = false; }, 3000);
            }
        } catch (e) { if (btnEl) { btnEl.innerText = origText; btnEl.disabled = false; } }
    }

    function collapseAll() {
        let count = 0;
        document.querySelectorAll('ms-code-block button[data-test-id="expand-icon-button"] span').forEach(s => {
            if (s.textContent.trim() === 'expand_less') { s.closest('button')?.click(); count++; }
        });
        return count;
    }

    let topPillContainer, headerMainBtn, headerDiagBtn, diagDot, bottomCollapseBtn, panel, diagModal, exportModalOverlay, restoreBtn;
    const i18nUpdaters = [];

    function refreshAllUiLanguage() {
        i18nUpdaters.forEach(fn => { try { fn(); } catch (e) {} });
        updateUiCounters();
    }

    function initUi() {
        topPillContainer = document.createElement('div');
        Object.assign(topPillContainer.style, {
            position: 'fixed', top: '10px', right: '190px', display: 'flex', alignItems: 'center',
            gap: '6px', zIndex: 99999, background: '#1e1f22', padding: '4px 8px', borderRadius: '20px',
            border: '1px solid #3c4043', boxShadow: '0 2px 8px rgba(0,0,0,0.35)', cursor: 'grab', userSelect: 'none'
        });

        const dragGrip = document.createElement('span');
        dragGrip.innerText = '⋮⋮';
        Object.assign(dragGrip.style, { color: '#777', fontSize: '12px', padding: '0 2px', cursor: 'grab' });
        attachTooltip(dragGrip, () => tr().dragTitle, () => tr().dragBody);

        const pillBtnStyle = {
            padding: '5px 11px', background: '#2b2d31', color: '#e8eaed', border: 'none',
            borderRadius: '14px', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
            display: 'flex', alignItems: 'center', gap: '6px'
        };

        headerMainBtn = document.createElement('button');
        headerMainBtn.innerText = tr().hdrChat;
        Object.assign(headerMainBtn.style, pillBtnStyle);
        attachTooltip(headerMainBtn, () => tr().hdrChatTtTitle, () => tr().hdrChatTtBody);

        headerDiagBtn = document.createElement('button');
        diagDot = document.createElement('span');
        Object.assign(diagDot.style, { width: '8px', height: '8px', borderRadius: '50%', background: '#00e676', display: 'inline-block' });
        const diagLbl = document.createElement('span');
        diagLbl.innerText = '🩺 0%';
        headerDiagBtn.appendChild(diagDot);
        headerDiagBtn.appendChild(diagLbl);
        Object.assign(headerDiagBtn.style, pillBtnStyle);
        attachTooltip(headerDiagBtn, () => tr().hdrDiagTtTitle, () => tr().hdrDiagTtBody);

        topPillContainer.appendChild(dragGrip);
        topPillContainer.appendChild(headerMainBtn);
        topPillContainer.appendChild(headerDiagBtn);

        makeElementDraggable(topPillContainer, posTopPill, (newPos) => { posTopPill = newPos; saveConfig(); });

        bottomCollapseBtn = document.createElement('button');
        bottomCollapseBtn.innerText = tr().collapseBtn;
        Object.assign(bottomCollapseBtn.style, {
            position: 'fixed', bottom: '22px', right: '42px',
            padding: '8px 14px', background: '#25262b', color: '#e8eaed',
            border: '1px solid #4a5568', borderRadius: '18px', cursor: 'grab',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)', fontSize: '12px', fontWeight: 'bold',
            zIndex: 99997, userSelect: 'none'
        });
        attachTooltip(bottomCollapseBtn, () => tr().collapseTtTitle, () => tr().collapseTtBody);
        bottomCollapseBtn.onclick = () => {
            const c = collapseAll();
            bottomCollapseBtn.innerText = tr().collapseDone(c);
            nativeSetTimeout(() => { bottomCollapseBtn.innerText = tr().collapseBtn; }, 1200);
        };
        i18nUpdaters.push(() => { bottomCollapseBtn.innerText = tr().collapseBtn; });

        makeElementDraggable(bottomCollapseBtn, posBottomBtn, (newPos) => { posBottomBtn = newPos; saveConfig(); });

        panel = document.createElement('div');
        Object.assign(panel.style, {
            position: 'fixed', top: '48px', right: '190px', zIndex: 99999,
            background: '#25262b', padding: '16px', borderRadius: '12px', color: '#fff', fontSize: '12.5px',
            display: 'none', flexDirection: 'column', gap: '9px', minWidth: '285px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.75)', border: '1px solid #3c4043', fontFamily: 'sans-serif'
        });

        function makeBtn(getTxtFn, act, color = '#3c3c3c', getTtTitle = null, getTtBody = null) {
            const b = document.createElement('button');
            const updateTxt = () => { b.innerText = typeof getTxtFn === 'function' ? getTxtFn() : getTxtFn; };
            updateTxt();
            i18nUpdaters.push(updateTxt);
            Object.assign(b.style, {
                background: color, color: '#fff', border: 'none', padding: '8px 10px', borderRadius: '7px',
                cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '12px', flexShrink: 0, textAlign: 'left'
            });
            b.onclick = act;
            if (getTtTitle) attachTooltip(b, getTtTitle, getTtBody);
            return b;
        }

        const inputStyle = { width: '58px', padding: '4px', borderRadius: '4px', border: '1px solid #555', background: '#161618', color: '#fff', textAlign: 'center' };

        function createSettingRow(getLabelFn, inputEl, getTtTitle, getTtBody) {
            const r = document.createElement('div');
            Object.assign(r.style, { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' });
            const s = document.createElement('span');
            const up = () => { s.innerText = typeof getLabelFn === 'function' ? getLabelFn() : getLabelFn; };
            up(); i18nUpdaters.push(up);
            r.appendChild(s); r.appendChild(inputEl);
            if (getTtTitle) attachTooltip(r, getTtTitle, getTtBody);
            return r;
        }

        const maxInput = document.createElement('input'); maxInput.type = 'number'; maxInput.value = BASE_MAX_VISIBLE; Object.assign(maxInput.style, inputStyle);
        maxInput.onchange = () => { BASE_MAX_VISIBLE = parseInt(maxInput.value) || 15; MAX_VISIBLE = BASE_MAX_VISIBLE; saveConfig(); optimizeDOM(); };

        const restoreInput = document.createElement('input'); restoreInput.type = 'number'; restoreInput.value = RESTORE_COUNT; Object.assign(restoreInput.style, inputStyle);
        restoreInput.onchange = () => { RESTORE_COUNT = parseInt(restoreInput.value) || 10; saveConfig(); updateUiCounters(); };

        panel.appendChild(createSettingRow(() => tr().lblMaxVis, maxInput, () => tr().ttMaxVisTitle, () => tr().ttMaxVisBody));
        panel.appendChild(createSettingRow(() => tr().lblRestoreCnt, restoreInput, () => tr().ttRestoreCntTitle, () => tr().ttRestoreCntBody));

        const toggleOptBtn = makeBtn(
            () => enabled ? tr().btnOptOn : tr().btnOptOff,
            () => {
                enabled = !enabled;
                toggleOptBtn.innerText = enabled ? tr().btnOptOn : tr().btnOptOff;
                toggleOptBtn.style.background = enabled ? '#2e7d32' : '#8b0000';
                saveConfig();
                if (enabled) optimizeDOM(); else restoreFullDOM();
            },
            enabled ? '#2e7d32' : '#8b0000',
            () => tr().ttOptTitle, () => tr().ttOptBody
        );
        panel.appendChild(toggleOptBtn);

        restoreBtn = makeBtn(() => tr().btnRestore(RESTORE_COUNT, hiddenMessages.length + detachedMessages.length), restoreMessages, '#0277bd', () => tr().ttRestoreTitle, () => tr().ttRestoreBody);
        panel.appendChild(restoreBtn);

        panel.appendChild(makeBtn(() => tr().btnResetVis, () => { MAX_VISIBLE = BASE_MAX_VISIBLE; optimizeDOM(); }, '#e65100', () => tr().ttResetVisTitle, () => tr().ttResetVisBody));

        const parkBtn = makeBtn(
            () => smartScrollParkOnFinish ? tr().btnParkOn : tr().btnParkOff,
            () => {
                smartScrollParkOnFinish = !smartScrollParkOnFinish;
                parkBtn.innerText = smartScrollParkOnFinish ? tr().btnParkOn : tr().btnParkOff;
                parkBtn.style.background = smartScrollParkOnFinish ? '#00695c' : '#555';
                saveConfig();
            },
            smartScrollParkOnFinish ? '#00695c' : '#555',
            () => tr().ttParkTitle, () => tr().ttParkBody
        );
        panel.appendChild(parkBtn);

        const langBtn = makeBtn(
            () => tr().btnLang,
            () => {
                lang = lang === 'ru' ? 'en' : 'ru';
                saveConfig();
                refreshAllUiLanguage();
            },
            '#37474f'
        );
        panel.appendChild(langBtn);

        const divider = document.createElement('hr');
        divider.style.borderColor = '#444'; divider.style.margin = '4px 0';
        panel.appendChild(divider);

        const openExportModalBtn = makeBtn(
            () => tr().btnExportOpen,
            () => { panel.style.display = 'none'; exportModalOverlay.style.display = 'flex'; },
            '#6a1b9a',
            () => tr().ttExportTitle, () => tr().ttExportBody
        );
        panel.appendChild(openExportModalBtn);

        exportModalOverlay = document.createElement('div');
        Object.assign(exportModalOverlay.style, {
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.65)', zIndex: 100002, display: 'none',
            alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif'
        });

        const exportModal = document.createElement('div');
        Object.assign(exportModal.style, {
            background: '#25262b', padding: '22px', borderRadius: '14px', color: '#fff', fontSize: '13.5px',
            display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '380px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.85)', border: '1px solid #444'
        });

        const expTitle = document.createElement('h3');
        expTitle.style.margin = '0 0 6px 0';
        i18nUpdaters.push(() => { expTitle.innerText = tr().expModalTitle; });
        expTitle.innerText = tr().expModalTitle;
        exportModal.appendChild(expTitle);

        const formatSelect = document.createElement('select');
        Object.assign(formatSelect.style, inputStyle, { width: '150px', cursor: 'pointer' });
        [['md', 'Markdown (.md)'], ['json', 'JSON (.json)']].forEach(([val, txt]) => {
            const opt = document.createElement('option');
            opt.value = val; opt.innerText = txt;
            if (val === expFormat) opt.selected = true;
            formatSelect.appendChild(opt);
        });
        formatSelect.onchange = () => { expFormat = formatSelect.value; saveConfig(); };
        exportModal.appendChild(createSettingRow(() => tr().expFormatLbl, formatSelect, null, null));

        function createExpCheckbox(getLabelFn, initVal, onChange) {
            const lbl = document.createElement('label');
            Object.assign(lbl.style, { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '3px 0' });
            const sp = document.createElement('span');
            const up = () => { sp.innerText = getLabelFn(); }; up(); i18nUpdaters.push(up);
            const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = initVal;
            cb.style.width = '16px'; cb.style.height = '16px'; cb.style.accentColor = '#00c853';
            cb.onchange = (e) => onChange(e.target.checked);
            lbl.appendChild(sp); lbl.appendChild(cb);
            return lbl;
        }

        exportModal.appendChild(createExpCheckbox(() => tr().expThoughtsLbl, expIncludeThoughts, v => { expIncludeThoughts = v; saveConfig(); }));
        exportModal.appendChild(createExpCheckbox(() => tr().expSysLbl, expIncludeSystem, v => { expIncludeSystem = v; saveConfig(); }));
        exportModal.appendChild(createExpCheckbox(() => tr().expEmojiLbl, expRemoveEmojis, v => { expRemoveEmojis = v; saveConfig(); }));

        const expBtnsRow = document.createElement('div');
        Object.assign(expBtnsRow.style, { display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '10px', marginTop: '8px' });
        const expCancelBtn = makeBtn(() => tr().expCancel, () => { exportModalOverlay.style.display = 'none'; }, '#555');
        expCancelBtn.style.textAlign = 'center';
        const expStartBtn = makeBtn(() => tr().expStart, performAutoScrollExport, '#2e7d32');
        expStartBtn.id = 'modal-start-export-btn';
        expStartBtn.style.textAlign = 'center';
        expBtnsRow.appendChild(expCancelBtn);
        expBtnsRow.appendChild(expStartBtn);
        exportModal.appendChild(expBtnsRow);
        exportModalOverlay.appendChild(exportModal);

        diagModal = document.createElement('div');
        Object.assign(diagModal.style, {
            position: 'fixed', top: '48px', right: '40px', zIndex: 99999,
            background: '#1e1e24', padding: '18px', borderRadius: '14px', color: '#e0e0e0', fontSize: '12.5px',
            display: 'none', flexDirection: 'column', gap: '12px', width: '540px', maxWidth: '95vw',
            maxHeight: '84vh', overflowY: 'auto', boxShadow: '0 12px 40px rgba(0,0,0,0.85)',
            border: '1px solid #3a3a48', fontFamily: 'sans-serif'
        });

        const diagHdr = document.createElement('div');
        Object.assign(diagHdr.style, { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '8px' });
        const diagTitle = document.createElement('strong');
        diagTitle.style.fontSize = '14px';
        diagTitle.innerText = tr().diagModalTitle;
        i18nUpdaters.push(() => { diagTitle.innerText = tr().diagModalTitle; });
        const diagClose = document.createElement('button');
        diagClose.innerText = '✕';
        Object.assign(diagClose.style, { background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '16px' });
        diagClose.onclick = () => { diagModal.style.display = 'none'; };
        diagHdr.appendChild(diagTitle); diagHdr.appendChild(diagClose);
        diagModal.appendChild(diagHdr);

        const togglesBox = document.createElement('div');
        Object.assign(togglesBox.style, { display: 'flex', flexDirection: 'column', gap: '8px', background: '#262630', padding: '12px', borderRadius: '10px' });

        function createHumanToggle(getTitleFn, getSubFn, initVal, onChange) {
            const row = document.createElement('label');
            Object.assign(row.style, { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', cursor: 'pointer', paddingBottom: '6px', borderBottom: '1px solid #343442' });
            const left = document.createElement('div');
            const t = document.createElement('div'); t.style.fontWeight = 'bold'; t.style.color = '#fff';
            const s = document.createElement('div'); s.style.fontSize = '11px'; s.style.color = '#aaa'; s.style.marginTop = '2px';
            const up = () => { t.innerText = getTitleFn(); s.innerText = getSubFn(); }; up(); i18nUpdaters.push(up);
            left.appendChild(t); left.appendChild(s);
            const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = initVal;
            Object.assign(cb.style, { width: '18px', height: '18px', accentColor: '#00e676', cursor: 'pointer', flexShrink: 0 });
            cb.onchange = (e) => onChange(e.target.checked);
            row.appendChild(left); row.appendChild(cb);
            togglesBox.appendChild(row);
        }

        createHumanToggle(() => tr().t1Title, () => tr().t1Sub, hypVirtualStreamBuffer, v => { hypVirtualStreamBuffer = v; saveConfig(); applyHypothesisStyles(); });
        createHumanToggle(() => tr().t2Title, () => tr().t2Sub, hypKillInfiniteAnim && hypKillBackdropBlur && hypKillMicCanvas, v => { hypKillInfiniteAnim = v; hypKillBackdropBlur = v; hypKillMicCanvas = v; saveConfig(); applyHypothesisStyles(); });
        createHumanToggle(() => tr().t3Title, () => tr().t3Sub, hypAutoRepairMarkdown, v => { hypAutoRepairMarkdown = v; saveConfig(); if (v) repairUnparsedCodeBlocks(); });

        diagModal.appendChild(togglesBox);

        const statusBox = document.createElement('div');
        Object.assign(statusBox.style, {
            background: '#141418', padding: '12px', borderRadius: '8px', border: '1px solid #2d2d38',
            whiteSpace: 'pre-wrap', lineHeight: '1.5', fontFamily: 'monospace', fontSize: '11.5px'
        });
        attachTooltip(statusBox, () => tr().ttStatusTitle, () => tr().ttStatusBody);
        diagModal.appendChild(statusBox);

        const devSpoiler = document.createElement('details');
        Object.assign(devSpoiler.style, { background: '#181820', padding: '8px 12px', borderRadius: '8px', border: '1px solid #2e3440' });
        const devSum = document.createElement('summary');
        devSum.style.cursor = 'pointer'; devSum.style.color = '#80cbc4'; devSum.style.fontSize = '11.5px';
        devSum.innerText = tr().devSum;
        i18nUpdaters.push(() => { devSum.innerText = tr().devSum; });
        devSpoiler.appendChild(devSum);

        const devBtns = document.createElement('div');
        Object.assign(devBtns.style, { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' });
        const genBtn = makeBtn(() => tr().btnBench, () => runDeterministicGenerationBenchmark(genBtn, true), '#c62828', () => tr().ttBenchTitle, () => tr().ttBenchBody);
        genBtn.style.textAlign = 'center';
        const sendSnapBtn = makeBtn(
            () => tr().btnSnap,
            async () => {
                const md = FENCE + 'json\n' + JSON.stringify(buildInstantAiReportObject(), null, 2) + '\n' + FENCE;
                await sendTextToAiChat("🤖 **[TELEMETRY REPORT v6.1.0]**\n\n" + md);
            },
            '#1565c0',
            () => tr().ttSnapTitle, () => tr().ttSnapBody
        );
        sendSnapBtn.style.textAlign = 'center';
        devBtns.appendChild(genBtn);
        devBtns.appendChild(sendSnapBtn);
        devSpoiler.appendChild(devBtns);
        diagModal.appendChild(devSpoiler);

        headerMainBtn.onclick = () => {
            diagModal.style.display = 'none';
            const r = topPillContainer.getBoundingClientRect();
            panel.style.top = (r.bottom + 8) + 'px';
            panel.style.left = Math.max(10, Math.min(window.innerWidth - 295, r.left)) + 'px';
            panel.style.right = 'auto';
            panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        };

        headerDiagBtn.onclick = () => {
            panel.style.display = 'none';
            const r = topPillContainer.getBoundingClientRect();
            diagModal.style.top = (r.bottom + 8) + 'px';
            diagModal.style.left = Math.max(10, Math.min(window.innerWidth - 555, r.right - 540)) + 'px';
            diagModal.style.right = 'auto';
            diagModal.style.display = diagModal.style.display === 'none' ? 'flex' : 'none';
            updateDiagnosticsLoop();
        };

        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && !topPillContainer.contains(e.target)) panel.style.display = 'none';
            if (!diagModal.contains(e.target) && !topPillContainer.contains(e.target)) diagModal.style.display = 'none';
            if (e.target === exportModalOverlay) exportModalOverlay.style.display = 'none';
        });

        const observer = new MutationObserver((mutations) => {
            const t0 = performance.now();
            for (let i = 0; i < mutations.length; i++) {
                const t = mutations[i].target;
                if (t && (diagModal.contains(t) || panel.contains(t) || topPillContainer.contains(t) || streamStatusCard?.contains(t) || tooltipEl?.contains(t))) return;
            }
            diag._mutationCount += mutations.length;
            let opt = false;
            for (let i = 0; i < mutations.length; i++) {
                const added = mutations[i].addedNodes;
                for (let j = 0; j < added.length; j++) {
                    const n = added[j];
                    if (n.nodeType === 1 && (n.tagName === 'MS-CHAT-TURN' || n.querySelector?.('ms-chat-turn'))) { opt = true; break; }
                }
                if (opt) break;
            }
            if (opt) debouncedOptimizeDOM();
            diag._scriptSelfTimeAccum += (performance.now() - t0);
        });

        function updateDiagnosticsLoop() {
            const now = performance.now(), idleSec = Math.floor((now - diag.lastInteraction) / 1000);
            diag.mutationsPerSec = diag._mutationCount; diag._mutationCount = 0;
            diag.scrollWritesBlockedPerSec = diag._scrollWritesBlockedCount; diag._scrollWritesBlockedCount = 0;
            diag.cpuBusyPercentEst = Math.min(100, Math.round((diag._longTaskWindowMs / 1000) * 100)); diag._longTaskWindowMs = 0;
            diag.scriptSelfTimeMs = Math.round(diag._scriptSelfTimeAccum * 10) / 10; diag._scriptSelfTimeAccum = 0;

            diagLbl.innerText = `🩺 ${diag.cpuBusyPercentEst}%`;
            diagDot.style.background = diag.cpuBusyPercentEst > 30 ? '#ff1744' : (diag.cpuBusyPercentEst > 8 ? '#ffab00' : '#00e676');

            if (diagModal.style.display === 'flex') {
                statusBox.textContent = tr().statusText(
                    diag.isStreamingNow, idleSec, diag.eventLoopLagMs,
                    diag.cpuBusyPercentEst, diag.scriptSelfTimeMs,
                    diag.bufferedChunksSuppressed, diag.repairedBlocksCount
                );
            }
        }

        applyHypothesisStyles();
        document.body.appendChild(topPillContainer);
        document.body.appendChild(bottomCollapseBtn);
        document.body.appendChild(panel);
        document.body.appendChild(diagModal);
        document.body.appendChild(exportModalOverlay);
        ensureStreamStatusCard();
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        setInterval(updateDiagnosticsLoop, 1000);
        nativeSetTimeout(() => { optimizeDOM(); collapseAll(); updateDiagnosticsLoop(); }, 1500);
    }

    function waitForBody() {
        if (!document.body || !document.head) { nativeRAF(waitForBody); return; }
        initUi();
    }
    waitForBody();
})();
