// e2e-steps v3
//
// Explained, steppable end-to-end tests on top of Playwright Test.
//
//   import { test, step, flow, show, covers } from './support/steps';
//
//   export const logIn = flow('Log in', 'Signs in through the login form.', async (page: Page, email: string) => {
//     await step('Open the login page', 'We start signed out.', () => page.goto('/login'));
//     ...
//   }, { covers: ['src/auth/**'] });
//
//   test('User sees the dashboard', { annotation: covers('src/dashboard/**') }, async ({ page }) => {
//     await logIn(page, 'user@test.com');
//     await show('The dashboard', 'Their name is in the header.', () => expect(...).toBeVisible());
//   });
//
// Two modes, one test:
// - normal: runs straight through (CI, agents). Each step leaves a screenshot,
//   and the test attaches its steps as `e2e-steps` (JSON) to the report.
// - walk (E2E_WALK=1, run headed): before each step a panel in the browser
//   explains what comes next and waits. F8 runs it (a flow as a whole), F7
//   steps into a flow, F5 runs to the end. The last `show` waits so the result
//   stays on screen. Pages fill the browser window (no fixed viewport); the
//   panel moves by its title bar, resizes from its corner and folds away.
//
// Projects with their own `test` combine both: `mergeTests(appTest, stepsTest)`.
//
// This file is maintained upstream: change it there, not here.

import { test as base, type Browser, type BrowserContext, type BrowserContextOptions, type Locator, type Page, type TestInfo } from '@playwright/test';

const WALK = /^(1|true|yes)$/i.test(process.env.E2E_WALK ?? '');

export type StepOptions = {
  /** Outlined in walk mode before the step runs. */
  target?: Locator;
  /** The page to screenshot after the step (defaults to the last active one). */
  page?: Page;
};

type Kind = 'step' | 'flow' | 'show';
type Action = 'over' | 'into' | 'continue';

type Entry = {
  n: number;
  depth: number;
  kind: Kind;
  title: string;
  explain: string;
  status: 'running' | 'passed' | 'failed';
  error?: string;
  screenshot?: string;
  ms?: number;
};

/** Where the reviewer put the panel; kept for the whole walk, across pages. */
type PanelLayout = { x: number; y: number; w: number; h: number; folded: boolean };

type PanelState = {
  layout?: PanelLayout;
  status: 'paused' | 'running' | 'failed' | 'done';
  kind: Kind;
  n: number;
  title: string;
  explain: string;
  crumbs: string[];
  error?: string;
};

// ---- pages -------------------------------------------------------------------

const attached = new WeakSet<BrowserContext>();
let pages: Page[] = [];

function track(page: Page) {
  const touch = () => {
    pages = pages.filter((p) => p !== page);
    pages.push(page);
  };
  touch();
  page.on('framenavigated', (frame) => frame === page.mainFrame() && touch());
  page.on('close', () => (pages = pages.filter((p) => p !== page)));
}

function lastPage(): Page | undefined {
  return [...pages].reverse().find((p) => !p.isClosed());
}

async function attach(context: BrowserContext) {
  if (attached.has(context)) return;
  attached.add(context);
  context.on('page', track);
  context.pages().forEach(track);
  if (WALK) {
    await context.exposeBinding('__e2eWalk', (_source, action: string, data?: unknown) => walker.handle(action, data));
    await context.addInitScript(OVERLAY);
    await Promise.all(context.pages().map((p) => p.evaluate(OVERLAY).catch(() => {})));
  }
}

// ---- walk mode -----------------------------------------------------------------

class Walker {
  state: PanelState = { status: 'running', kind: 'step', n: 0, title: '', explain: '', crumbs: [] };
  private resolve?: (a: Action) => void;
  private layout?: PanelLayout;
  private continueAll = false;
  private skipBelow: number | null = null;

  reset() {
    this.continueAll = false;
    this.skipBelow = null;
  }

  skipping(depth: number) {
    return this.skipBelow !== null && depth > this.skipBelow;
  }

  stepOver(depth: number) {
    if (this.skipBelow === null) this.skipBelow = depth;
  }

  leave(depth: number) {
    if (this.skipBelow === depth) this.skipBelow = null;
  }

  /** Wait for the reviewer. `always` pauses even after F5 (the result, a failure). */
  async pause(s: Omit<PanelState, 'status'>, depth: number, status: PanelState['status'] = 'paused', always = false): Promise<Action> {
    if (!always && (this.continueAll || this.skipping(depth))) return this.continueAll ? 'continue' : 'over';
    this.state = { ...s, status };
    await this.broadcast();
    const action = await new Promise<Action>((r) => (this.resolve = r));
    this.resolve = undefined;
    if (action === 'continue') this.continueAll = true;
    this.state = { ...this.state, status: 'running' };
    await this.broadcast();
    return action;
  }

  running(s: Omit<PanelState, 'status'>) {
    this.state = { ...s, status: 'running' };
    void this.broadcast();
  }

  handle(action: string, data?: unknown) {
    if (action === 'state') return { ...this.state, layout: this.layout };
    if (action === 'layout') {
      this.layout = data as PanelLayout;
      return null;
    }
    if (action === 'over' || action === 'into' || action === 'continue') this.resolve?.(action);
    return null;
  }

  private async broadcast() {
    const state = { ...this.state, layout: this.layout };
    await Promise.all(
      pages.filter((p) => !p.isClosed()).map((p) => p.evaluate((s) => (window as unknown as { __e2eRender?: (s: PanelState) => void }).__e2eRender?.(s), state).catch(() => {})),
    );
  }
}

const walker = new Walker();

// ---- the steps of the running test -------------------------------------------------

class Recorder {
  entries: Entry[] = [];
  covers = new Set<string>();
  shown = false;
  private n = 0;
  private stack: string[] = [];
  private shots = 0;
  private failedShown = false;

  constructor(private info: TestInfo) {}

  addCovers(globs: string[]) {
    for (const g of globs) {
      if (this.covers.has(g)) continue;
      this.covers.add(g);
      this.info.annotations.push({ type: 'covers', description: g });
    }
  }

  async run<T>(kind: Kind, title: string, explain: string, fn: (() => T | Promise<T>) | undefined, opts: StepOptions = {}): Promise<T> {
    const depth = this.stack.length;
    const entry: Entry = { n: ++this.n, depth, kind, title, explain, status: 'running' };
    this.entries.push(entry);
    const panel = { kind, n: entry.n, title, explain, crumbs: [...this.stack] };
    if (kind === 'show') this.shown = depth === 0 || this.shown;
    return base.step(title, async () => {
      if (WALK && kind !== 'show') {
        if (opts.target && !walker.skipping(depth)) await opts.target.highlight().catch(() => {});
        const action = await walker.pause(panel, depth);
        if (kind === 'flow' && action === 'over') walker.stepOver(depth);
      }
      if (WALK) walker.running(panel);
      this.stack.push(title);
      const started = Date.now();
      try {
        const value = fn ? await fn() : (undefined as T);
        entry.status = 'passed';
        return value;
      } catch (e) {
        entry.status = 'failed';
        entry.error = brief(e);
        // The innermost failing step shows it; the flows around it rethrow.
        if (WALK && !this.failedShown) {
          this.failedShown = true;
          await walker.pause({ ...panel, error: entry.error }, depth, 'failed', true);
        }
        throw e;
      } finally {
        this.stack.pop();
        entry.ms = Date.now() - started;
        if (kind === 'flow' && WALK) walker.leave(depth);
        if (kind !== 'flow' && !WALK) entry.screenshot = await this.shoot(opts.page);
        if (WALK && kind === 'show' && entry.status === 'passed') {
          await walker.pause(panel, depth, 'done', true);
        }
      }
    });
  }

  private async shoot(page?: Page): Promise<string | undefined> {
    const target = page && !page.isClosed() ? page : lastPage();
    if (!target) return undefined;
    const file = this.info.outputPath(`step-${String(++this.shots).padStart(2, '0')}.png`);
    try {
      await target.screenshot({ path: file, timeout: 5_000 });
      return file;
    } catch {
      return undefined;
    }
  }

  report() {
    return { version: 1, shown: this.shown, covers: [...this.covers], steps: this.entries };
  }
}

let active: Recorder | undefined;

/** An error's first lines, without terminal colours. */
function brief(e: unknown): string {
  const text = (e instanceof Error ? e.message : String(e)).replace(/\x1b\[[0-9;]*m/g, '');
  return text.split('\n').filter((l) => l.trim()).slice(0, 4).join('\n');
}

function recorder(what: string): Recorder {
  if (!active) {
    throw new Error(`${what}() runs inside a test that uses \`test\` from support/steps (or mergeTests with it).`);
  }
  return active;
}

// ---- the API -------------------------------------------------------------------

/** One explained action. `explain` says, for a person watching, what happens and why. */
export function step<T>(title: string, explain: string, fn?: () => T | Promise<T>, opts?: StepOptions): Promise<T> {
  return recorder('step').run('step', title, explain, fn, opts);
}

/**
 * The result the test leaves on screen: its last step. `fn` checks it (an
 * expect); in walk mode the browser stays on it until F8.
 */
export function show<T>(title: string, explain: string, fn?: () => T | Promise<T>, opts?: StepOptions): Promise<T> {
  return recorder('show').run('show', title, explain, fn, opts);
}

/**
 * A reusable group of steps (log in, create an invoice) that tests and other
 * flows call. Walk mode runs it as one step unless the reviewer steps into it
 * (F7). `covers` are the source globs it exercises; a test that uses the flow
 * covers them too, and so does the file the flow is defined in.
 */
export function flow<A extends unknown[], T>(
  title: string,
  explain: string,
  fn: (...args: A) => Promise<T>,
  opts: { covers?: string[] } = {},
): (...args: A) => Promise<T> {
  const globs = [...(opts.covers ?? []), ...definedIn()];
  return (...args: A) => {
    const r = recorder('flow');
    r.addCovers(globs);
    return r.run('flow', title, explain, () => fn(...args));
  };
}

/** Source globs a test exercises, for `test(title, { annotation: covers(...) }, ...)`. */
export function covers(...globs: string[]) {
  return globs.map((g) => ({ type: 'covers', description: g }));
}

/** The file that called flow(), relative to where the tests run. */
function definedIn(): string[] {
  const line = new Error().stack?.split('\n')[3] ?? '';
  const m = line.match(/\(?((?:file:\/\/)?\/[^():]+):\d+:\d+\)?$/);
  if (!m) return [];
  const file = m[1].replace(/^file:\/\//, '');
  const cwd = process.cwd().replace(/\/$/, '') + '/';
  return file.startsWith(cwd) ? [file.slice(cwd.length)] : [];
}

const EXTRA_ARGS = [...(process.env.E2E_BROWSER_ARGS ?? '').split(' ').filter(Boolean), ...(WALK ? ['--start-maximized'] : [])];

/**
 * Walking, pages fill the window: no fixed viewport (nor what needs one, like
 * a device scale factor or mobile emulation), whatever the project or a
 * fixture asked for.
 */
function windowSized(options: BrowserContextOptions = {}): BrowserContextOptions {
  if (!WALK) return options;
  const sized: BrowserContextOptions = { ...options, viewport: null };
  delete sized.deviceScaleFactor;
  delete sized.isMobile;
  delete sized.screen;
  return sized;
}

// Fixture callbacks are named `provide`: lint rules for React hooks read `use(...)` as one.
export const test = base.extend<{ _e2eSteps: void; context: BrowserContext }, { _e2eBrowser: void }>({
  // Extra browser flags for walks (a window class the desktop places).
  launchOptions: [
    async ({ launchOptions }, provide) => {
      await provide(EXTRA_ARGS.length ? { ...launchOptions, args: [...(launchOptions.args ?? []), ...EXTRA_ARGS] } : launchOptions);
    },
    { scope: 'worker' },
  ],
  _e2eBrowser: [
    async ({ browser }: { browser: Browser }, provide) => {
      const original = browser.newContext.bind(browser);
      browser.newContext = async (options) => {
        const context = await original(windowSized(options));
        await attach(context);
        return context;
      };
      await provide();
      browser.newContext = original;
    },
    { scope: 'worker', auto: true },
  ],
  context: async ({ context }, provide) => {
    await attach(context);
    await provide(context);
  },
  _e2eSteps: [
    async ({}, provide, info) => {
      const r = new Recorder(info);
      active = r;
      pages = pages.filter((p) => !p.isClosed());
      walker.reset();
      if (WALK) info.setTimeout(0);
      await provide();
      active = undefined;
      await info.attach('e2e-steps', { body: JSON.stringify(r.report()), contentType: 'application/json' });
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';

// ---- the walk panel (runs in the page) ---------------------------------------------

const OVERLAY = `(() => {
  if (window.__e2eRender) return;
  let state = null;
  let layout = null;
  let host = null;
  const MIN_W = 260, MIN_H = 90, GAP = 16;
  const css = \`
    :host { all: initial; }
    .panel { position: fixed; z-index: 2147483647; box-sizing: border-box; display: flex; flex-direction: column;
      width: 440px; max-width: calc(100vw - 32px); right: 16px; bottom: 16px;
      font: 14px/1.45 system-ui, sans-serif; color: #e8e8ea; background: rgba(24, 24, 28, .96);
      border: 1px solid #3a3a44; border-left: 4px solid #6aa0ff; border-radius: 8px;
      box-shadow: 0 8px 28px rgba(0,0,0,.35); overflow: hidden; }
    .panel.running { opacity: .75; border-left-color: #888; }
    .panel.failed { border-left-color: #ff6a6a; }
    .panel.done { border-left-color: #5ad08a; }
    .bar { display: flex; align-items: center; gap: 8px; padding: 6px 8px 6px 14px; cursor: move; user-select: none;
      background: rgba(255,255,255,.04); border-bottom: 1px solid #2e2e36; touch-action: none; }
    .crumbs { flex: 1; min-width: 0; font-size: 12px; color: #9a9aa6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .fold { all: unset; cursor: pointer; color: #9a9aa6; font-size: 14px; line-height: 1; padding: 2px 6px; border-radius: 4px; }
    .fold:hover { background: #3a3a46; color: #e8e8ea; }
    .body { flex: 1; min-height: 0; overflow: auto; padding: 10px 14px 12px; }
    .folded .body, .folded .grip { display: none; }
    .folded .bar { border-bottom: none; }
    .title { font-weight: 600; font-size: 15px; }
    .explain { margin-top: 4px; white-space: pre-wrap; }
    .error { margin-top: 6px; color: #ffb0b0; font-family: ui-monospace, monospace; font-size: 12px; white-space: pre-wrap; }
    .keys { margin-top: 10px; display: flex; gap: 6px; flex-wrap: wrap; }
    button.k { font: inherit; font-size: 12px; color: #e8e8ea; background: #2c2c34; border: 1px solid #4a4a56;
      border-radius: 5px; padding: 3px 8px; cursor: pointer; }
    button.k:hover { background: #3a3a46; }
    kbd { font-family: ui-monospace, monospace; color: #9fc0ff; margin-right: 4px; }
    .grip { position: absolute; right: 0; bottom: 0; width: 16px; height: 16px; cursor: nwse-resize; touch-action: none;
      background: linear-gradient(135deg, transparent 50%, #5a5a66 50%, #5a5a66 60%, transparent 60%, transparent 70%, #5a5a66 70%, #5a5a66 80%, transparent 80%); }
  \`;
  const act = (a, data) => window.__e2eWalk && window.__e2eWalk(a, data);
  const label = (s) => ({ step: 'Next step', flow: 'Next: a flow', show: 'Result' })[s.kind] || 'Step';
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function esc(t) { return String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]); }
  function mount() {
    if (host && host.isConnected) return host.shadowRoot;
    host = document.createElement('e2e-walk');
    const root = host.attachShadow({ mode: 'open' });
    (document.body || document.documentElement).appendChild(host);
    return root;
  }
  // The panel's place: where the reviewer left it (kept by the test process,
  // so it survives navigations and new pages), always inside the window.
  function place(panel) {
    if (!layout) return;
    const w = clamp(layout.w, MIN_W, Math.max(MIN_W, innerWidth - 2 * GAP));
    const h = layout.folded ? null : clamp(layout.h, MIN_H, Math.max(MIN_H, innerHeight - 2 * GAP));
    Object.assign(panel.style, {
      right: 'auto', bottom: 'auto', maxWidth: 'none',
      width: w + 'px', height: h === null ? 'auto' : h + 'px',
      left: clamp(layout.x, 0, Math.max(0, innerWidth - w)) + 'px',
      top: clamp(layout.y, 0, Math.max(0, innerHeight - 40)) + 'px',
    });
  }
  function current(panel) {
    const r = panel.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: layout && layout.folded ? layout.h : r.height, folded: !!(layout && layout.folded) };
  }
  // The test process keeps it (it outlives the page); the next render here
  // must not bring back the old one.
  function save(next) {
    layout = next;
    if (state) state = { ...state, layout: next };
    act('layout', next);
  }
  // Pointer drags: on the bar it moves the panel, on the grip it resizes it.
  function drag(panel, ev, resize) {
    if (ev.button !== 0 || (ev.target.closest && ev.target.closest('.fold'))) return;
    ev.preventDefault();
    const start = current(panel);
    const sx = ev.clientX, sy = ev.clientY;
    const target = ev.currentTarget;
    target.setPointerCapture(ev.pointerId);
    const move = (e) => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      layout = resize
        ? { ...start, w: start.w + dx, h: start.h + dy, folded: false }
        : { ...start, x: start.x + dx, y: start.y + dy };
      panel.classList.toggle('folded', !!layout.folded);
      place(panel);
    };
    const up = () => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
      if (layout) save(current(panel));
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
  }
  window.__e2eRender = (s) => {
    state = s;
    if (s && s.layout) layout = s.layout;
    if (!document.documentElement) return;
    const root = mount();
    if (!s || !s.title) { root.innerHTML = ''; return; }
    const head = s.status === 'running' ? 'Running' : s.status === 'failed' ? 'Failed' : s.status === 'done' ? 'Result' : label(s);
    const crumbs = [head + ' ' + s.n, ...s.crumbs].join(' › ');
    let keys = '';
    if (s.status === 'paused') {
      keys = (s.kind === 'flow' ? '<button class="k" data-a="into"><kbd>F7</kbd>step into</button>' : '')
        + '<button class="k" data-a="over"><kbd>F8</kbd>' + (s.kind === 'flow' ? 'run it' : 'next') + '</button>'
        + '<button class="k" data-a="continue"><kbd>F5</kbd>run to the end</button>';
    } else if (s.status === 'done' || s.status === 'failed') {
      keys = '<button class="k" data-a="over"><kbd>F8</kbd>finish</button>';
    }
    const folded = !!(layout && layout.folded);
    root.innerHTML = '<style>' + css + '</style><div class="panel ' + s.status + (folded ? ' folded' : '') + '">'
      + '<div class="bar" title="Drag to move · double-click to put it back"><div class="crumbs">' + esc(crumbs + (folded ? ' — ' + s.title : '')) + '</div>'
      + '<button class="fold" title="' + (folded ? 'Unfold' : 'Fold') + '">' + (folded ? '▢' : '–') + '</button></div>'
      + '<div class="body"><div class="title">' + esc(s.title) + '</div>'
      + (s.explain ? '<div class="explain">' + esc(s.explain) + '</div>' : '')
      + (s.error ? '<div class="error">' + esc(s.error) + '</div>' : '')
      + (keys ? '<div class="keys">' + keys + '</div>' : '') + '</div>'
      + '<div class="grip" title="Drag to resize"></div></div>';
    const panel = root.querySelector('.panel');
    place(panel);
    root.querySelectorAll('button.k').forEach((b) => b.addEventListener('click', () => act(b.dataset.a)));
    const bar = root.querySelector('.bar');
    bar.addEventListener('pointerdown', (e) => drag(panel, e, false));
    bar.addEventListener('dblclick', () => { save(null); window.__e2eRender(state); });
    root.querySelector('.grip').addEventListener('pointerdown', (e) => drag(panel, e, true));
    root.querySelector('.fold').addEventListener('click', () => {
      save({ ...current(panel), folded: !folded });
      window.__e2eRender(state);
    });
  };
  // Keep it inside the window when the window shrinks.
  window.addEventListener('resize', () => { const p = host && host.shadowRoot && host.shadowRoot.querySelector('.panel'); if (p) place(p); });
  window.addEventListener('keydown', (e) => {
    const a = { F8: 'over', F7: 'into', F5: 'continue' }[e.key];
    if (!a || !state || state.status === 'running') return;
    e.preventDefault();
    e.stopImmediatePropagation();
    act(state.status === 'paused' ? a : 'over');
  }, true);
  const start = (tries = 0) => {
    if (!window.__e2eWalk) return tries < 50 && setTimeout(() => start(tries + 1), 50);
    window.__e2eWalk('state').then(window.__e2eRender, () => {});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => start()); else start();
})()`;
