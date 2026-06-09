# Architecture

A high-level map of how this chess app is put together — the data flow, the key modules, and the non-obvious design decisions that are hard to infer from the code alone.

---

## Overview

A single-page React app (Vite + React 19 + TypeScript) that lets you play chess against the **Stockfish** engine (or a second human), with move review and beginner-friendly hints. Three libraries do the heavy lifting:

- **`chess.js`** — the rules engine: legal moves, board state, check/checkmate/draw detection, SAN.
- **`react-chessboard`** — the interactive board UI (rendering, drag-and-drop, click-to-move).
- **`stockfish`** — the chess AI, run in a **Web Worker** so it never blocks the UI.

---

## Directory structure

```
src/
  App.tsx                 # top-level state: which screen, theme, game config
  types.ts                # shared types + BOARD_THEMES + DIFFICULTY_CONFIGS
  context/ThemeContext.ts # light/dark theme context
  utils/chess.ts          # pure helpers (getStatus, getKingSquare, PIECE_VALUES)
  hooks/
    useChessGame.ts       # core game state machine
    useStockfish.ts       # Web Worker + UCI protocol
    useHint.ts            # best-move hints (+ optional LLM explanation)
    useTheme.ts           # context consumer
  components/
    GameBoard.tsx         # composes the board + side panels
    MainMenu.tsx          # sidebar / mobile hamburger menu
    StartScreen.tsx       # new-game modal (mode, difficulty, color)
    MoveHistory.tsx       # move list + review navigation
    CapturedPieces.tsx    # captured pieces + material advantage
    HintPanel.tsx         # status + best-move hint UI
    Controls.tsx          # difficulty display
    BoardThemePicker.tsx  # board color themes
public/stockfish.js       # the engine, loaded as a Web Worker
e2e/                      # Playwright tests
```

---

## The core data flow

The single most important thing to understand is that **three move notations** flow through the app, each for a different audience:

| Notation | Example | Used by |
|---|---|---|
| **FEN** | `rnbqkbnr/…/RNBQKBNR w KQkq - 0 1` | a full board snapshot (chess.js ↔ engine) |
| **UCI** | `e2e4`, `e7e8q` | engine ↔ app (dumb, explicit: from-square + to-square) |
| **SAN** | `e4`, `Nf3`, `O-O` | human-facing move list (smart, contextual) |

A single computer move travels the full loop:

```
1. chess.js holds the position  ──FEN──▶  useStockfish posts "position fen …" to the worker
2. Stockfish computes           ──UCI──▶  worker replies "bestmove e7e5"
3. useChessGame applies it       (chess.js .move parses UCI from/to)
4. chess.js returns a move object whose .san is "e5"
5. SAN feeds the move list; the new FEN re-renders the board
```

So: **FEN describes the board, UCI talks to the engine, SAN is shown to the human.** `useHint` additionally converts a UCI principal variation back into SAN for the "best line" display.

---

## Key modules

### `useChessGame` — the game state machine

The heart of the app. Notable design choices:

- The `Chess` instance lives in a **`useRef`**, not state. `chess.js` mutates in place, so a ref keeps it stable across renders; a `fen` state value is the render trigger after each move.
- **`applyComputerMove`** races the engine against a `setTimeout(1000)` via `Promise.all`, so the computer never moves *instantly* (it would feel jarring). This 1-second floor is why tests of this hook use fake timers.
- **Move review** is modeled with a `viewIndex` (`null` = live, a number = stepping through history). Derived values (`displayFen`, `squareStyles`, captured counts) recompute from `viewIndex` each render — no duplicated state.
- Exposes everything the board needs: `onSquareClick`, `onPieceDrop`, highlight/legal-move `squareStyles`, captured pieces + material advantage, and a human `status` string (via `getStatus`).

### `useStockfish` — the engine bridge

- Spawns `new Worker('/stockfish.js')` on mount; terminates it on unmount.
- Speaks **UCI** over `postMessage`/`onmessage`: configures strength per difficulty (`UCI_LimitStrength` / `UCI_Elo` from `DIFFICULTY_CONFIGS`), sends `position fen …` + `go movetime …`, and resolves a promise when `bestmove` arrives — also parsing the `score` (centipawns / mate) and principal variation (`pv`).

### `useHint` — beginner-friendly hints

- Asks `useStockfish` for the best move at full strength, then:
  - `buildMoveDescription` turns the move into plain English + a tag (Captures / Castling / Check / …),
  - `formatScoreText` turns the evaluation into a phrase ("You have a clear advantage"),
  - the `pv` is converted to SAN for an expandable "best line".
- **Optional LLM explanation:** if `VITE_ANTHROPIC_API_KEY` is set *and* the user enables it, it calls the Anthropic API for a one-sentence strategic "why". This is strictly optional and off by default — tests and E2E run without it.

### `utils/chess.ts` — pure helpers

Stateless functions shared across hooks: `getStatus` (the priority chain checkmate > stalemate > draw > thinking > check > turn), `getKingSquare` (for the check animation), and `PIECE_VALUES` (material scoring). Being pure, these are the easiest things to unit-test.

---

## Cross-cutting concerns

**Theming.** `App` owns the `theme` (light/dark) and provides it via `ThemeContext`; `useTheme()` reads it. The theme is persisted to `localStorage` and written to `document.documentElement.dataset.theme` so CSS variables can key off it. Separately, `boardTheme` (board colors) is chosen from `BOARD_THEMES` in `types.ts`.

**Responsive layout.** `MainMenu` renders both a desktop sidebar and a mobile hamburger menu; CSS shows the appropriate one per breakpoint, and a collapsed state persists to `localStorage`. (This is why E2E runs on both a desktop and an iPhone project.)

**Top-level flow (`App.tsx`).** Holds which screen is showing (start screen vs. game), the active game config (difficulty, mode, player color), and theming. Starting a new game bumps a `gameKey` to remount `GameBoard` with a fresh `useChessGame`.

---

## Where the tests fit

- **Pure logic** (`utils/chess.ts`, the hint helpers) → fast Vitest unit tests.
- **Components & hooks** → Vitest + React Testing Library, with the Stockfish worker mocked (jsdom has no `Worker`).
- **The real engine + real board + responsive layout** → Playwright E2E, because those depend on a real browser (WASM worker, pointer geometry, CSS) that jsdom can't simulate.

See [`TESTING.md`](./TESTING.md) for the practical guide.
