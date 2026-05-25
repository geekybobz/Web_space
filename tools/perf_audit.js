#!/usr/bin/env node

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_URL = 'http://127.0.0.1:2026/docs/index.html?localPreview=1';
const DEFAULT_PORT = 9222;
const DEFAULT_OBSERVE_MS = 12000;
const DEFAULT_OUT_DIR = path.join(ROOT, 'perf-reports');
const DEFAULT_CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];

function parseArgs(argv) {
  const options = {
    url: DEFAULT_URL,
    port: DEFAULT_PORT,
    observeMs: DEFAULT_OBSERVE_MS,
    outDir: DEFAULT_OUT_DIR,
    launchChrome: true,
    headless: true,
    chromePath: null,
    userDataDir: path.join(os.tmpdir(), 'web-space-perf-profile'),
    phaseDelayMs: 1800,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--url' && next) {
      options.url = next;
      i += 1;
    } else if (arg === '--port' && next) {
      options.port = Number(next);
      i += 1;
    } else if (arg === '--observe-ms' && next) {
      options.observeMs = Number(next);
      i += 1;
    } else if (arg === '--out-dir' && next) {
      options.outDir = path.resolve(next);
      i += 1;
    } else if (arg === '--chrome-path' && next) {
      options.chromePath = next;
      i += 1;
    } else if (arg === '--user-data-dir' && next) {
      options.userDataDir = next;
      i += 1;
    } else if (arg === '--phase-delay-ms' && next) {
      options.phaseDelayMs = Number(next);
      i += 1;
    } else if (arg === '--no-launch') {
      options.launchChrome = false;
    } else if (arg === '--headed') {
      options.headless = false;
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }

  if (!Number.isFinite(options.port) || options.port <= 0) {
    throw new Error(`Invalid --port value: ${options.port}`);
  }
  if (!Number.isFinite(options.observeMs) || options.observeMs < 1000) {
    throw new Error(`Invalid --observe-ms value: ${options.observeMs}`);
  }
  if (!Number.isFinite(options.phaseDelayMs) || options.phaseDelayMs < 0) {
    throw new Error(`Invalid --phase-delay-ms value: ${options.phaseDelayMs}`);
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node tools/perf_audit.js [options]

Options:
  --url <url>               Target page URL. Default: ${DEFAULT_URL}
  --port <port>             Chrome DevTools port. Default: ${DEFAULT_PORT}
  --observe-ms <ms>         Per-phase observation window. Default: ${DEFAULT_OBSERVE_MS}
  --out-dir <dir>           Output directory for reports. Default: ${DEFAULT_OUT_DIR}
  --chrome-path <path>      Explicit Chrome/Chromium binary path
  --user-data-dir <dir>     Browser profile dir for launched Chrome
  --phase-delay-ms <ms>     Delay between scripted phase changes. Default: 1800
  --no-launch               Do not auto-launch Chrome; expect DevTools endpoint to exist
  --headed                  Launch a visible browser instead of headless
  --help, -h                Show this help

Notes:
  - Run the local preview server first for the default URL:
      python3 tools/build_index.py
      python3 tools/local_preview_server.py --port 2026
  - The script saves both JSON and Markdown reports under perf-reports/.
`);
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

async function devtoolsVersion(port) {
  return fetchJson(`http://127.0.0.1:${port}/json/version`);
}

function findChromeBinary(explicitPath) {
  if (explicitPath) {
    if (!fs.existsSync(explicitPath)) {
      throw new Error(`Chrome binary not found: ${explicitPath}`);
    }
    return explicitPath;
  }
  for (const candidate of DEFAULT_CHROME_PATHS) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(
    'No supported Chrome/Chromium binary found. Use --chrome-path or start Chrome with remote debugging manually.',
  );
}

async function waitForDevtools(port, timeoutMs) {
  const start = Date.now();
  let lastError = null;
  while (Date.now() - start < timeoutMs) {
    try {
      return await devtoolsVersion(port);
    } catch (error) {
      lastError = error;
      await sleep(250);
    }
  }
  throw new Error(`Timed out waiting for DevTools on port ${port}: ${lastError?.message || 'unknown error'}`);
}

async function ensureChrome(options) {
  try {
    const version = await devtoolsVersion(options.port);
    return { launched: false, version, process: null };
  } catch (error) {
    if (!options.launchChrome) {
      throw new Error(
        `DevTools endpoint not available on port ${options.port}. Start Chrome with --remote-debugging-port=${options.port} or omit --no-launch.`,
      );
    }
  }

  const chromePath = findChromeBinary(options.chromePath);
  await fsp.mkdir(options.userDataDir, { recursive: true });
  const args = [
    `--remote-debugging-port=${options.port}`,
    `--user-data-dir=${options.userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    options.headless ? '--headless=new' : null,
    'about:blank',
  ].filter(Boolean);

  const chrome = spawn(chromePath, args, {
    stdio: 'ignore',
    detached: false,
  });

  const version = await waitForDevtools(options.port, 15000);
  return { launched: true, version, process: chrome, chromePath };
}

function createCdpClient(wsUrl) {
  const socket = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const events = [];

  socket.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    if (payload.id) {
      const entry = pending.get(payload.id);
      if (!entry) return;
      pending.delete(payload.id);
      if (payload.error) entry.reject(new Error(JSON.stringify(payload.error)));
      else entry.resolve(payload.result);
      return;
    }
    events.push(payload);
  };

  return {
    async ready() {
      if (socket.readyState === WebSocket.OPEN) return;
      await new Promise((resolve, reject) => {
        socket.onopen = () => resolve();
        socket.onerror = (error) => reject(error);
      });
    },
    send(method, params = {}) {
      const id = nextId++;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
      });
    },
    async waitForEvent(method, timeoutMs = 20000) {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const index = events.findIndex((event) => event.method === method);
        if (index >= 0) {
          return events.splice(index, 1)[0];
        }
        await sleep(50);
      }
      throw new Error(`Timed out waiting for event: ${method}`);
    },
    drainEvents(method) {
      const matching = events.filter((event) => event.method === method);
      for (let i = events.length - 1; i >= 0; i -= 1) {
        if (events[i].method === method) events.splice(i, 1);
      }
      return matching;
    },
    close() {
      socket.close();
    },
  };
}

async function openTarget(port, url) {
  return fetchJson(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
}

function metricMap(metrics) {
  return Object.fromEntries(metrics.map((metric) => [metric.name, metric.value]));
}

function summarizeResources(resources) {
  return resources.reduce((acc, resource) => {
    const key = resource.initiatorType || 'other';
    if (!acc[key]) {
      acc[key] = { count: 0, transfer: 0, encoded: 0, decoded: 0 };
    }
    acc[key].count += 1;
    acc[key].transfer += resource.transferSize || 0;
    acc[key].encoded += resource.encodedBodySize || 0;
    acc[key].decoded += resource.decodedBodySize || 0;
    return acc;
  }, {});
}

async function runtimeEval(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(JSON.stringify(result.exceptionDetails));
  }
  return result.result.value;
}

async function setupPageHooks(client) {
  const hookCode = `
    (() => {
      if (window.__webPerfAuditInstalled) return true;
      window.__webPerfAuditInstalled = true;
      window.__webPerfAuditState = {
        logs: [],
        errors: [],
      };

      const pushLog = (level, args) => {
        try {
          window.__webPerfAuditState.logs.push({
            level,
            text: args.map((arg) => {
              if (typeof arg === 'string') return arg;
              try { return JSON.stringify(arg); } catch { return String(arg); }
            }).join(' '),
            at: performance.now(),
          });
          if (window.__webPerfAuditState.logs.length > 200) {
            window.__webPerfAuditState.logs.shift();
          }
        } catch {}
      };

      for (const level of ['log', 'warn', 'error']) {
        const original = console[level];
        console[level] = function (...args) {
          pushLog(level, args);
          return original.apply(this, args);
        };
      }

      window.addEventListener('error', (event) => {
        window.__webPerfAuditState.errors.push({
          type: 'error',
          message: event.message,
          source: event.filename,
          line: event.lineno,
          column: event.colno,
          at: performance.now(),
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        window.__webPerfAuditState.errors.push({
          type: 'unhandledrejection',
          message: String(event.reason),
          at: performance.now(),
        });
      });

      return true;
    })()
  `;
  await runtimeEval(client, hookCode);
}

async function collectPhaseWindowMetrics(client, label, observeMs) {
  const expression = `
    (async () => {
      const observeMs = ${observeMs};
      const navigation = performance.getEntriesByType('navigation')[0] || null;
      const paints = performance.getEntriesByType('paint').map((entry) => ({
        name: entry.name,
        startTime: entry.startTime,
      }));
      const resources = performance.getEntriesByType('resource').map((entry) => ({
        name: entry.name,
        initiatorType: entry.initiatorType,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
        duration: entry.duration,
      }));
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint').map((entry) => ({
        startTime: entry.startTime,
        size: entry.size,
        id: entry.id,
        url: entry.url || null,
      }));

      const longTasks = [];
      const layoutShifts = [];
      const eventTimings = [];
      const observers = [];
      const safeObserve = (type, list) => {
        try {
          const observer = new PerformanceObserver((entries) => {
            for (const entry of entries.getEntries()) {
              list.push(entry);
            }
          });
          observer.observe({ type, buffered: true });
          observers.push(observer);
        } catch {}
      };

      safeObserve('longtask', longTasks);
      safeObserve('layout-shift', layoutShifts);
      safeObserve('event', eventTimings);

      const frameSamples = [];
      let rafCount = 0;
      let last = performance.now();
      const endAt = performance.now() + observeMs;
      await new Promise((resolve) => {
        const tick = (ts) => {
          frameSamples.push(ts - last);
          last = ts;
          rafCount += 1;
          if (ts >= endAt) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });

      for (const observer of observers) observer.disconnect();

      let uaMemory = null;
      if (performance.measureUserAgentSpecificMemory) {
        try {
          const result = await performance.measureUserAgentSpecificMemory();
          uaMemory = {
            bytes: result.bytes,
            breakdown: Array.isArray(result.breakdown)
              ? result.breakdown.map((item) => ({ bytes: item.bytes, types: item.types }))
              : [],
          };
        } catch {}
      }

      const scrollRoot = document.scrollingElement || document.documentElement;
      const runningAnimations = document.getAnimations
        ? document.getAnimations().filter((animation) => animation.playState === 'running').length
        : null;
      const allAnimations = document.getAnimations ? document.getAnimations().length : null;

      return {
        label: ${JSON.stringify(label)},
        href: location.href,
        title: document.title,
        visibility: document.visibilityState,
        readyState: document.readyState,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
        },
        navigation: navigation ? {
          domContentLoaded: navigation.domContentLoadedEventEnd,
          loadEventEnd: navigation.loadEventEnd,
          transferSize: navigation.transferSize,
          encodedBodySize: navigation.encodedBodySize,
          decodedBodySize: navigation.decodedBodySize,
          type: navigation.type,
        } : null,
        paints,
        largestContentfulPaints: lcpEntries,
        resources,
        memory: performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        } : null,
        uaMemory,
        dom: {
          nodeCount: document.getElementsByTagName('*').length,
          imageCount: document.images.length,
          iframeCount: document.querySelectorAll('iframe').length,
          scriptCount: document.scripts.length,
          styleSheetCount: document.styleSheets.length,
          runningAnimations,
          allAnimations,
          scrollHeight: scrollRoot ? scrollRoot.scrollHeight : null,
        },
        frames: {
          rafCount,
          avgFrameMs: frameSamples.reduce((sum, value) => sum + value, 0) / frameSamples.length,
          worstFrameMs: Math.max(...frameSamples),
          framesOver16: frameSamples.filter((value) => value > 16.7).length,
          framesOver33: frameSamples.filter((value) => value > 33.4).length,
          framesOver50: frameSamples.filter((value) => value > 50).length,
        },
        longTasks: longTasks.map((entry) => ({
          startTime: entry.startTime,
          duration: entry.duration,
        })),
        layoutShifts: layoutShifts
          .filter((entry) => !entry.hadRecentInput)
          .map((entry) => ({
            startTime: entry.startTime,
            value: entry.value,
          })),
        eventTimings: eventTimings
          .filter((entry) => entry.duration > 16)
          .slice(0, 20)
          .map((entry) => ({
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
          })),
        embeddedContent: Array.from(document.querySelectorAll('iframe')).map((iframe) => ({
          src: iframe.getAttribute('src'),
          loading: iframe.getAttribute('loading'),
          hidden: iframe.hidden,
        })),
        pageState: window.__webPerfAuditState ? {
          logs: window.__webPerfAuditState.logs.slice(-40),
          errors: window.__webPerfAuditState.errors.slice(-20),
        } : null,
      };
    })()
  `;

  const result = await runtimeEval(client, expression);
  result.resourceSummary = summarizeResources(result.resources);
  return result;
}

async function collectPhaseCdpMetrics(client, label) {
  const metrics = metricMap((await client.send('Performance.getMetrics')).metrics);
  const domCounters = await client.send('Memory.getDOMCounters');
  return {
    label,
    cdp: {
      JSHeapUsedSize: metrics.JSHeapUsedSize,
      JSHeapTotalSize: metrics.JSHeapTotalSize,
      Nodes: metrics.Nodes,
      Documents: metrics.Documents,
      Frames: metrics.Frames,
      JSEventListeners: metrics.JSEventListeners,
      LayoutCount: metrics.LayoutCount,
      RecalcStyleCount: metrics.RecalcStyleCount,
      LayoutDuration: metrics.LayoutDuration,
      RecalcStyleDuration: metrics.RecalcStyleDuration,
      ScriptDuration: metrics.ScriptDuration,
      TaskDuration: metrics.TaskDuration,
    },
    domCounters,
  };
}

async function takeScreenshot(client) {
  const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
  return Buffer.from(data, 'base64');
}

async function runInteractionScript(client, script) {
  await runtimeEval(client, `(async () => { ${script} })()`);
}

function summarizePhase(phase) {
  const totalLongTaskMs = phase.window.longTasks.reduce((sum, task) => sum + task.duration, 0);
  const totalLayoutShift = phase.window.layoutShifts.reduce((sum, item) => sum + item.value, 0);
  const maxEventTiming = phase.window.eventTimings.reduce(
    (max, item) => Math.max(max, item.duration || 0),
    0,
  );

  return {
    label: phase.label,
    jsHeapMb: phase.window.memory ? phase.window.memory.usedJSHeapSize / (1024 * 1024) : null,
    domNodes: phase.cdp.domCounters.nodes,
    eventListeners: phase.cdp.domCounters.jsEventListeners,
    runningAnimations: phase.window.dom.runningAnimations,
    avgFrameMs: phase.window.frames.avgFrameMs,
    worstFrameMs: phase.window.frames.worstFrameMs,
    framesOver50: phase.window.frames.framesOver50,
    longTaskCount: phase.window.longTasks.length,
    totalLongTaskMs,
    totalLayoutShift,
    maxEventTiming,
    taskDuration: phase.cdp.cdp.TaskDuration,
    scriptDuration: phase.cdp.cdp.ScriptDuration,
    recalcStyleDuration: phase.cdp.cdp.RecalcStyleDuration,
  };
}

function buildMarkdownReport(report) {
  const lines = [];
  lines.push('# Performance Audit Report');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Target');
  lines.push('');
  lines.push(`- URL: \`${report.target.url}\``);
  lines.push(`- Browser: \`${report.environment.browser.Browser}\``);
  lines.push(`- Protocol: \`${report.environment.browser['Protocol-Version']}\``);
  lines.push(`- Observe window per phase: \`${report.config.observeMs} ms\``);
  lines.push('');
  lines.push('## Phase Summary');
  lines.push('');
  lines.push('| Phase | JS Heap MB | Nodes | Listeners | Running Animations | Avg Frame ms | Worst Frame ms | Long Tasks | Frames >50ms | Layout Shift |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const phase of report.summaries) {
    lines.push(
      `| ${phase.label} | ${formatNum(phase.jsHeapMb, 2)} | ${phase.domNodes} | ${phase.eventListeners} | ${phase.runningAnimations} | ${formatNum(phase.avgFrameMs, 2)} | ${formatNum(phase.worstFrameMs, 2)} | ${phase.longTaskCount} | ${phase.framesOver50} | ${formatNum(phase.totalLayoutShift, 4)} |`,
    );
  }
  lines.push('');
  lines.push('## High-Level Findings');
  lines.push('');

  const worstPhase = [...report.summaries].sort((a, b) => b.worstFrameMs - a.worstFrameMs)[0];
  const heaviestPhase = [...report.summaries].sort((a, b) => (b.runningAnimations || 0) - (a.runningAnimations || 0))[0];
  const largestHeapPhase = [...report.summaries].sort((a, b) => (b.jsHeapMb || 0) - (a.jsHeapMb || 0))[0];

  lines.push(`- Worst frame spike: \`${formatNum(worstPhase.worstFrameMs, 2)} ms\` during **${worstPhase.label}**.`);
  lines.push(`- Highest animation count: \`${heaviestPhase.runningAnimations}\` running animations during **${heaviestPhase.label}**.`);
  lines.push(`- Peak JS heap in this run: \`${formatNum(largestHeapPhase.jsHeapMb, 2)} MB\` during **${largestHeapPhase.label}**.`);
  lines.push('');
  lines.push('## Resources');
  lines.push('');
  for (const phase of report.phases) {
    lines.push(`### ${phase.label}`);
    lines.push('');
    lines.push(`- Resource count: \`${phase.window.resources.length}\``);
    lines.push(`- HTML transfer size: \`${formatBytes(phase.window.navigation?.transferSize || 0)}\``);
    for (const [type, summary] of Object.entries(phase.window.resourceSummary)) {
      lines.push(
        `- ${type}: ${summary.count} request(s), transfer ${formatBytes(summary.transfer)}, decoded ${formatBytes(summary.decoded)}`,
      );
    }
    lines.push('');
  }
  lines.push('## Console / Error Signals');
  lines.push('');
  const allErrors = report.phases.flatMap((phase) => phase.window.pageState?.errors || []);
  const allWarnLogs = report.phases.flatMap((phase) =>
    (phase.window.pageState?.logs || []).filter((log) => log.level === 'warn' || log.level === 'error'),
  );
  if (!allErrors.length && !allWarnLogs.length) {
    lines.push('- No page-captured runtime errors were recorded during this run.');
  } else {
    for (const entry of allErrors) {
      lines.push(`- Error: ${entry.type} - ${entry.message}`);
    }
    for (const entry of allWarnLogs) {
      lines.push(`- Console ${entry.level}: ${entry.text}`);
    }
  }
  lines.push('');
  lines.push('## Artifacts');
  lines.push('');
  lines.push(`- JSON report: \`${report.artifacts.jsonPath}\``);
  lines.push(`- Markdown report: \`${report.artifacts.markdownPath}\``);
  lines.push(`- Screenshot directory: \`${report.artifacts.screenshotDir}\``);
  return `${lines.join('\n')}\n`;
}

function formatNum(value, digits) {
  if (value == null || Number.isNaN(value)) return 'n/a';
  return Number(value).toFixed(digits);
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 100 || unit === 0 ? 0 : 2)} ${units[unit]}`;
}

async function saveArtifacts(outputDir, stem, report, markdown, screenshots) {
  await fsp.mkdir(outputDir, { recursive: true });
  const screenshotDir = path.join(outputDir, `${stem}-screens`);
  await fsp.mkdir(screenshotDir, { recursive: true });

  const jsonPath = path.join(outputDir, `${stem}.json`);
  const markdownPath = path.join(outputDir, `${stem}.md`);

  for (const [label, buffer] of Object.entries(screenshots)) {
    await fsp.writeFile(path.join(screenshotDir, `${label}.png`), buffer);
  }
  await fsp.writeFile(jsonPath, JSON.stringify(report, null, 2));
  await fsp.writeFile(markdownPath, markdown);

  return { jsonPath, markdownPath, screenshotDir };
}

function timestampStem() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const chrome = await ensureChrome(options);
  const target = await openTarget(options.port, options.url);
  const client = createCdpClient(target.webSocketDebuggerUrl);
  await client.ready();

  try {
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Performance.enable');
    await client.send('Log.enable');
    await client.waitForEvent('Page.loadEventFired', 20000);
    await client.send('Page.bringToFront');
    await setupPageHooks(client);

    const screenshots = {};
    const phases = [];

    const runPhase = async (label) => {
      const windowMetrics = await collectPhaseWindowMetrics(client, label, options.observeMs);
      const cdpMetrics = await collectPhaseCdpMetrics(client, label);
      phases.push({ label, window: windowMetrics, cdp: cdpMetrics });
      screenshots[label] = await takeScreenshot(client);
    };

    await runPhase('baseline-home');

    await runInteractionScript(
      client,
      `
        document.dispatchEvent(new WheelEvent('wheel', { deltaY: 500, bubbles: true, cancelable: true }));
        await new Promise((resolve) => setTimeout(resolve, ${options.phaseDelayMs}));
      `,
    );
    await runPhase('post-wheel-home');

    await runInteractionScript(
      client,
      `
        const worksLink = document.querySelector('[data-page-link="4"]');
        if (worksLink) worksLink.click();
        await new Promise((resolve) => setTimeout(resolve, ${options.phaseDelayMs}));
        const abstractButton = document.querySelector('#research .project-toggle');
        if (abstractButton && abstractButton.getAttribute('aria-expanded') !== 'true') abstractButton.click();
        await new Promise((resolve) => setTimeout(resolve, ${Math.max(500, options.phaseDelayMs / 2)}));
        const posterButton = document.querySelector('#research .poster-toggle');
        if (posterButton && posterButton.getAttribute('aria-expanded') !== 'true') posterButton.click();
        await new Promise((resolve) => setTimeout(resolve, ${options.phaseDelayMs + 1200}));
      `,
    );
    await runPhase('research-opened');

    await runInteractionScript(
      client,
      `
        const contactLink = document.querySelector('[data-page-link="5"]');
        if (contactLink) contactLink.click();
        await new Promise((resolve) => setTimeout(resolve, ${options.phaseDelayMs}));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, ${options.phaseDelayMs}));
      `,
    );
    await runPhase('navigation-stress');

    const summaries = phases.map(summarizePhase);
    const stem = `perf-audit-${timestampStem()}`;

    const report = {
      generatedAt: new Date().toISOString(),
      target: {
        url: options.url,
        targetId: target.id,
      },
      config: {
        observeMs: options.observeMs,
        phaseDelayMs: options.phaseDelayMs,
        port: options.port,
      },
      environment: {
        browser: chrome.version,
        launchedChrome: chrome.launched,
        chromePath: chrome.chromePath || null,
        platform: process.platform,
        node: process.version,
      },
      phases,
      summaries,
      artifacts: {},
    };

    const markdown = buildMarkdownReport({
      ...report,
      artifacts: {
        jsonPath: path.join(options.outDir, `${stem}.json`),
        markdownPath: path.join(options.outDir, `${stem}.md`),
        screenshotDir: path.join(options.outDir, `${stem}-screens`),
      },
    });

    report.artifacts = await saveArtifacts(options.outDir, stem, report, markdown, screenshots);
    await client.send('Page.close');
    client.close();

    console.log(JSON.stringify({
      ok: true,
      artifacts: report.artifacts,
      summaries: report.summaries,
    }, null, 2));
  } finally {
    if (chrome.process) {
      chrome.process.kill('SIGTERM');
    }
  }
}

run().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
