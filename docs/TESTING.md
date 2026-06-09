# Testing Guide

This project has two independent test layers. This doc is the practical reference: how to run them, where things live, the patterns to copy, and the gotchas to avoid.

> For the *story* of how the suite was built (and the reasoning behind it), see [`testing-the-chess-app.md`](./testing-the-chess-app.md).

---

## The two layers

| Layer | Tool | Runs in | What it covers |
|---|---|---|---|
| **Unit / component / hook** | Vitest + React Testing Library | jsdom (Node) | Pure logic, components, hooks (with the worker + network mocked) |
| **End-to-end** | Playwright | real Chromium + WebKit | The whole app: real Stockfish engine, real board, real layout |

They share **nothing** except the app under test. Different runners, different `expect`, different config, different file patterns.

---

## Commands

```bash
# Unit / component / hook (Vitest)
npm test                 # run once (CI mode)
npm run test:watch       # re-run on change
npm run test:coverage    # coverage report (writes ./coverage)

# End-to-end (Playwright)
npm run test:e2e         # headless, both projects
npm run test:e2e:ui      # interactive UI mode — watch tests run + time-travel
npx playwright show-report   # open the last HTML report
npx playwright codegen http://localhost:5173   # record clicks → generate test code
```

First-time Playwright setup needs the browser binaries:

```bash
npx playwright install chromium webkit
```

---

## Where tests live (and the naming rule)

The two runners never collide because they look in different places for different patterns:

| | Pattern | Location |
|---|---|---|
| **Vitest** | `*.test.ts` / `*.test.tsx` | co-located in `src/` next to the file under test |
| **Playwright** | `*.spec.ts` | `e2e/` |

(Vitest's config explicitly `exclude`s `e2e/`; Playwright's `testDir` is `e2e/`.)

Shared test helpers:

- `src/test/setup.ts` — registers jest-dom matchers (loaded via Vitest `setupFiles`).
- `src/test/render.tsx` — `renderWithTheme(ui, theme?)`, wraps a component in `ThemeContext` for anything that calls `useTheme()`.

---

## Writing unit tests (Vitest)

### Pure functions — no DOM, no mocks

The simplest and highest-value tests. Build chess positions through the **real chess.js API**, never hand-written FEN strings:

```ts
import { Chess } from 'chess.js'
import { getStatus } from '@/utils/chess'

it('reports checkmate', () => {
  const g = new Chess()
  g.move('f3'); g.move('e5'); g.move('g4'); g.move('Qh4') // fool's mate
  expect(getStatus(g, false, 'two-player')).toBe('Checkmate — Black wins!')
})
```

### Components — React Testing Library

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('fires onChange when clicked', async () => {
  const onChange = vi.fn()
  const user = userEvent.setup()
  render(<BoardThemePicker value="classic" onChange={onChange} />)
  await user.click(screen.getByRole('button', { name: 'Forest' }))
  expect(onChange).toHaveBeenCalledWith('forest')
})
```

Conventions:
- **Prefer `getByRole(role, { name })`** over text/CSS selectors.
- **`getBy*` to assert presence, `queryBy*` to assert absence** (`queryBy` returns `null` instead of throwing).
- **Always `await` `user.*` actions** — they're async.
- For components that call `useTheme()`, use `renderWithTheme(...)` from `src/test/render.tsx`.

### Hooks — `renderHook` + the right mock

| Need | Technique | Example |
|---|---|---|
| A hook in isolation | `renderHook(() => useX())` | `useTheme` |
| A missing browser global | `vi.stubGlobal('Worker', FakeWorker)` | `useStockfish` |
| Replace an imported module | `vi.mock('@/hooks/useStockfish', …)` + `vi.hoisted` | `useHint`, `useChessGame` |
| Control time | `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync()` | `useChessGame` (1s computer delay) |
| Provide context to a hook | `renderHook(fn, { wrapper })` | anything using `useTheme` |

Mocking `useStockfish` (the common case — keeps the real worker out of jsdom):

```ts
const { mockGetBestMove } = vi.hoisted(() => ({ mockGetBestMove: vi.fn() }))
vi.mock('@/hooks/useStockfish', () => ({
  useStockfish: () => ({ getBestMove: mockGetBestMove }),
}))
// then: mockGetBestMove.mockResolvedValue({ move: 'e7e5', pv: ['e7e5'], score: null })
```

For async state updates, assert inside `await waitFor(() => …)`; for manual handler calls that change state, wrap them in `act(...)`.

---

## Writing E2E tests (Playwright)

- Board squares are addressable by `data-square`: `page.locator('[data-square="e2"]')`.
- **Prefer click-to-move** (click source square, then target) over HTML5 drag — far more reliable headless.
- Run WITHOUT `VITE_ANTHROPIC_API_KEY` so no external LLM call happens (hints fall back to Stockfish only).
- The dev server boots automatically (Playwright `webServer` config) — no need to start it.
- Assertions auto-retry, so wait on the real engine with a generous timeout instead of fixed sleeps:

```ts
await page.locator('[data-square="e2"]').click()
await page.locator('[data-square="e4"]').click()
await expect(page.getByText('Your turn')).toBeVisible({ timeout: 15000 })
```

Specs run on **both** projects (`desktop` = Chromium, `mobile` = iPhone 13 / WebKit). For behavior that only exists on one, skip per project:

```ts
test('mobile menu', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'hamburger only on small screens')
  // ...
})
```

---

## Gotchas (learned the hard way)

- **`getByRole` name matching differs by tool:**
  - **RTL:** exact + **case-sensitive** (`"Next Move"` ≠ `"Next move"`). Your `aria-label` and query must match character-for-character.
  - **Playwright:** substring + **case-insensitive** (`"Close"` matches `"Close menu"`). Use `{ name, exact: true }` to disambiguate.
- **jsdom is not a browser.** It has no `Worker`, no `ResizeObserver`, no layout, and no `Element.scrollTo`. Stub what a component touches (e.g. `Element.prototype.scrollTo = vi.fn()` for `MoveHistory`).
- **Build fixtures via the API**, not hand-written FEN strings (chess.js validates strictly; a single wrong field shifts everything).
- **`vi.mock` is hoisted** above imports — any variable its factory uses must come from `vi.hoisted(...)`.
- **`erasableSyntaxOnly` is on** in `tsconfig.app.json` — no TS parameter properties (`constructor(public x)`), `enum`, or `namespace` in test code. Use plain field declarations and union types.
- **`noUnusedLocals` is on** — remove unused destructured vars or the build (`tsc -b`) fails even if Vitest passes.
- Coverage output (`coverage/`) is git-ignored and eslint-ignored; Playwright output (`test-results/`, `playwright-report/`) is git-ignored.

---

## CI

`.github/workflows/ci.yml` runs two jobs on every PR (and pushes to `main`):

- **`build`** — `npm ci` → lint → `npm test` (Vitest) → build
- **`e2e`** — `npm ci` → `npx playwright install --with-deps chromium webkit` → `npm run test:e2e` → upload `playwright-report` artifact

They're separate jobs so a slow/flaky browser run never blocks the fast unit signal. To make them *block merges*, add a branch-protection rule on `main` requiring the `build` and `e2e` checks.

---

## Checklist: adding a new test

- [ ] Unit/component → `src/**/<name>.test.tsx`; E2E → `e2e/<name>.spec.ts`.
- [ ] Component uses `useTheme()`? → `renderWithTheme`.
- [ ] Hook pulls in `useStockfish`/network? → `vi.mock` it.
- [ ] Query by role + accessible name; `await` all `user.*` actions.
- [ ] `npm test` (and `npm run test:e2e` if applicable) green.
- [ ] `npm run lint` and `npm run build` clean (CI runs `tsc -b` over test files too).
