// e2e-steps v1
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
//   stays on screen.
//
// Projects with their own `test` combine both: `mergeTests(appTest, stepsTest)`.
//
// This file is maintained upstream: change it there, not here.

import { test as base, type Browser, type BrowserContext, type Locator, type Page, type TestInfo } from '@playwright/test';

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

type PanelState = {
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
    await context.exposeBinding('__e2eWalk', (_source, action: string) => walker.handle(action));
    await context.addInitScript(OVERLAY);
    await Promise.all(context.pages().map((p) => p.evaluate(OVERLAY).catch(() => {})));
  }
}

// ---- walk mode -----------------------------------------------------------------

class Walker {
  state: PanelState = { status: 'running', kind: 'step', n: 0, title: '', explain: '', crumbs: [] };
  private resolve?: (a: Action) => void;
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

  handle(action: string) {
    if (action === 'state') return this.state;
    if (action === 'over' || action === 'into' || action === 'continue') this.resolve?.(action);
    return null;
  }

  private async broadcast() {
    const state = this.state;
    await Promise.all(
      pages.filter((p) => !p.isClosed()).map((p) => p.evaluate((s) => (window as any).__e2eRender?.(s), state).catch(() => {})),
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

const EXTRA_ARGS = (process.env.E2E_BROWSER_ARGS ?? '').split(' ').filter(Boolean);

export const test = base.extend<{ _e2eSteps: void; context: BrowserContext }, { _e2eBrowser: void }>({
  // Extra browser flags for walks (a window class the desktop places).
  launchOptions: [
    async ({ launchOptions }, use) => {
      await use(EXTRA_ARGS.length ? { ...launchOptions, args: [...(launchOptions.args ?? []), ...EXTRA_ARGS] } : launchOptions);
    },
    { scope: 'worker' },
  ],
  _e2eBrowser: [
    async ({ browser }: { browser: Browser }, use) => {
      const original = browser.newContext.bind(browser);
      browser.newContext = async (options) => {
        const context = await original(options);
        await attach(context);
        return context;
      };
      await use();
      browser.newContext = original;
    },
    { scope: 'worker', auto: true },
  ],
  context: async ({ context }, use) => {
    await attach(context);
    await use(context);
  },
  _e2eSteps: [
    async ({}, use, info) => {
      const r = new Recorder(info);
      active = r;
      pages = pages.filter((p) => !p.isClosed());
      walker.reset();
      if (WALK) info.setTimeout(0);
      await use();
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
  let host = null;
  const css = \`
    :host { all: initial; }
    .panel { position: fixed; right: 16px; bottom: 16px; z-index: 2147483647; width: min(440px, calc(100vw - 32px));
      font: 14px/1.45 system-ui, sans-serif; color: #e8e8ea; background: rgba(24, 24, 28, .96);
      border: 1px solid #3a3a44; border-left: 4px solid #6aa0ff; border-radius: 8px; padding: 12px 14px;
      box-shadow: 0 8px 28px rgba(0,0,0,.35); }
    .panel.running { opacity: .7; border-left-color: #888; }
    .panel.failed { border-left-color: #ff6a6a; }
    .panel.done { border-left-color: #5ad08a; }
    .crumbs { font-size: 12px; color: #9a9aa6; margin-bottom: 2px; }
    .title { font-weight: 600; font-size: 15px; }
    .explain { margin-top: 4px; white-space: pre-wrap; }
    .error { margin-top: 6px; color: #ffb0b0; font-family: ui-monospace, monospace; font-size: 12px; white-space: pre-wrap; }
    .keys { margin-top: 10px; display: flex; gap: 6px; flex-wrap: wrap; }
    button { font: inherit; font-size: 12px; color: #e8e8ea; background: #2c2c34; border: 1px solid #4a4a56;
      border-radius: 5px; padding: 3px 8px; cursor: pointer; }
    button:hover { background: #3a3a46; }
    kbd { font-family: ui-monospace, monospace; color: #9fc0ff; margin-right: 4px; }
  \`;
  const act = (a) => window.__e2eWalk && window.__e2eWalk(a);
  const label = (s) => ({ step: 'Next step', flow: 'Next: a flow', show: 'Result' })[s.kind] || 'Step';
  function mount() {
    if (host && host.isConnected) return host.shadowRoot;
    host = document.createElement('e2e-walk');
    const root = host.attachShadow({ mode: 'open' });
    (document.body || document.documentElement).appendChild(host);
    return root;
  }
  function esc(t) { return String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]); }
  window.__e2eRender = (s) => {
    state = s;
    if (!document.documentElement) return;
    const root = mount();
    if (!s || !s.title) { root.innerHTML = ''; return; }
    const head = s.status === 'running' ? 'Running' : s.status === 'failed' ? 'Failed' : s.status === 'done' ? 'Result' : label(s);
    const crumbs = [head + ' ' + s.n, ...s.crumbs].join(' › ');
    let keys = '';
    if (s.status === 'paused') {
      keys = (s.kind === 'flow' ? '<button data-a="into"><kbd>F7</kbd>step into</button>' : '')
        + '<button data-a="over"><kbd>F8</kbd>' + (s.kind === 'flow' ? 'run it' : 'next') + '</button>'
        + '<button data-a="continue"><kbd>F5</kbd>run to the end</button>';
    } else if (s.status === 'done' || s.status === 'failed') {
      keys = '<button data-a="over"><kbd>F8</kbd>finish</button>';
    }
    root.innerHTML = '<style>' + css + '</style><div class="panel ' + s.status + '">'
      + '<div class="crumbs">' + esc(crumbs) + '</div>'
      + '<div class="title">' + esc(s.title) + '</div>'
      + (s.explain ? '<div class="explain">' + esc(s.explain) + '</div>' : '')
      + (s.error ? '<div class="error">' + esc(s.error) + '</div>' : '')
      + (keys ? '<div class="keys">' + keys + '</div>' : '') + '</div>';
    root.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => act(b.dataset.a)));
  };
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
