import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Chess } from 'chess.js'
import type { Move, Square } from 'chess.js'
import type { PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard'
import type { BoardTheme, Difficulty, GameMode, PlayerColor } from '@/types'
import { BOARD_THEMES } from '@/types'
import { useTheme } from '@/hooks/useTheme'
import { useStockfish } from '@/hooks/useStockfish'
import { PIECE_VALUES, getKingSquare, getStatus } from '@/utils/chess'

export function useChessGame({
  difficulty,
  gameMode,
  playerColor = 'white',
  boardTheme,
}: {
  difficulty: Difficulty
  gameMode: GameMode
  playerColor?: PlayerColor
  boardTheme: BoardTheme
}) {
  const theme = useTheme()
  const { highlightFrom, highlightTo, selectColor, legalMoveColor } = BOARD_THEMES[boardTheme][theme]
  // useRef keeps the Chess instance stable across renders without triggering
  // re-renders when mutated. game.move() mutates in-place, so useState would
  // require cloning on every move and still not detect the change.
  const gameRef = useRef(new Chess())

  // fen is the source of truth for rendering — updated after every move to
  // trigger a re-render with the new board position.
  const [fen, setFen] = useState(gameRef.current.fen())
  const [isComputerThinking, setIsComputerThinking] = useState(false)

  // Full move history with rich metadata (captured pieces, before/after FEN,
  // source/target squares). Used for move review, highlighting, and material score.
  const [verboseHistory, setVerboseHistory] = useState<Move[]>([])

  // null means live view; a number means the user is stepping through history.
  const [viewIndex, setViewIndex] = useState<number | null>(null)
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const { getBestMove } = useStockfish()

  const game = gameRef.current
  const isReviewing = viewIndex !== null

  // Asks Stockfish for the best move at currentFen, waits at least 1 s so the
  // move doesn't appear instant, then applies it to the board.
  const applyComputerMove = useCallback(
    async (currentFen: string) => {
      setIsComputerThinking(true)
      try {
        // Run Stockfish and a minimum delay in parallel so the computer doesn't
        // move instantly — gives the user time to see the board state.
        const [{ move: uciMove }] = await Promise.all([
          getBestMove(currentFen, difficulty),
          new Promise((res) => setTimeout(res, 1000)),
        ])
        const from = uciMove.slice(0, 2)
        const to = uciMove.slice(2, 4)
        const promotion = uciMove.length > 4 ? uciMove[4] : 'q'
        game.move({ from, to, promotion })
        setFen(game.fen())
        setVerboseHistory(game.history({ verbose: true }))
      } finally {
        setIsComputerThinking(false)
      }
    },
    [difficulty, getBestMove, game],
  )

  // When the player chooses to play as Black, the computer (White) must move first.
  useEffect(() => {
    if (gameMode === 'vs-computer' && playerColor === 'black') {
      applyComputerMove(game.fen())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Attempts a player move from → to. Returns true on success, false if illegal.
  // On success, syncs state and triggers the computer's reply in vs-computer mode.
  const tryMove = useCallback(
    (from: string, to: string) => {
      try {
        const move = game.move({ from, to, promotion: 'q' })
        if (!move) return false
        setFen(game.fen())
        setVerboseHistory(game.history({ verbose: true }))
        setSelectedSquare(null)
        if (!game.isGameOver() && gameMode === 'vs-computer')
          applyComputerMove(game.fen())
        return true
      } catch {
        return false
      }
    },
    [game, gameMode, applyComputerMove],
  )

  // Handles click-to-move: first click selects a piece, second click attempts
  // the move. Clicking a different friendly piece re-selects instead of moving.
  const onSquareClick = useCallback(
    ({ square, piece }: SquareHandlerArgs) => {
      if (isReviewing || isComputerThinking || game.isGameOver()) return
      if (gameMode === 'vs-computer' && game.turn() !== playerColor[0]) return

      const currentColor = game.turn() === 'w' ? 'w' : 'b'
      if (selectedSquare) {
        const moved = tryMove(selectedSquare, square)
        if (!moved) {
          // If the move was invalid, re-select if the clicked square has a
          // friendly piece; otherwise deselect.
          setSelectedSquare(
            piece?.pieceType.startsWith(currentColor)
              ? (square as Square)
              : null,
          )
        }
      } else {
        if (piece?.pieceType.startsWith(currentColor)) {
          setSelectedSquare(square as Square)
        }
      }
    },
    [isReviewing, isComputerThinking, game, gameMode, selectedSquare, tryMove],
  )

  // Handles drag-and-drop moves. Returns false to snap the piece back on failure.
  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
      if (!targetSquare) return false
      if (isReviewing || isComputerThinking || game.isGameOver()) return false
      if (gameMode === 'vs-computer' && game.turn() !== playerColor[0]) return false
      return tryMove(sourceSquare, targetSquare)
    },
    [isReviewing, isComputerThinking, game, gameMode, tryMove],
  )

  // Steps back one move. If on live view, jumps to the second-to-last position.
  const onPrev = () => {
    if (viewIndex === null) setViewIndex(verboseHistory.length - 1)
    else setViewIndex(Math.max(0, viewIndex - 1))
  }

  // Steps forward one move. Exits review mode when reaching the latest position.
  const onNext = () => {
    if (viewIndex === null) return
    setViewIndex(viewIndex + 1 >= verboseHistory.length ? null : viewIndex + 1)
  }

  // Jumps to the start of the game (before move 1).
  const onBeginning = () => {
    setViewIndex(0)
  }

  // Returns to live view (exits review mode).
  const onCurrent = () => {
    setViewIndex(null)
  }

  // --- Derived state (computed fresh each render, no extra state needed) ---

  // When reviewing, show the board at the viewed position; otherwise show live.
  const displayFen = isReviewing
    ? viewIndex === 0
      ? verboseHistory[0].before
      : verboseHistory[viewIndex - 1].after
    : fen

  const squareStyles: Record<string, CSSProperties> = {}

  // Highlight the last move played (or the reviewed move when stepping through history).
  const highlightMove = isReviewing
    ? viewIndex > 0
      ? verboseHistory[viewIndex - 1]
      : null
    : (verboseHistory[verboseHistory.length - 1] ?? null)
  if (highlightMove) {
    squareStyles[highlightMove.from] = { backgroundColor: highlightFrom }
    squareStyles[highlightMove.to] = { backgroundColor: highlightTo }
  }
  if (!isReviewing && selectedSquare) {
    squareStyles[selectedSquare] = { backgroundColor: selectColor }
    game.moves({ square: selectedSquare, verbose: true }).forEach((m) => {
      squareStyles[m.to] = { backgroundColor: legalMoveColor, borderRadius: '50%' }
    })
  }
  if (!isReviewing && game.isCheck()) {
    const kingSquare = getKingSquare(game)
    if (kingSquare) {
      squareStyles[kingSquare] = {
        ...squareStyles[kingSquare],
        animation: 'king-tremble 0.4s linear infinite',
      }
    }
  }

  // When reviewing, only count captures up to the viewed move so the material
  // score reflects the board state being displayed.
  const historySlice =
    viewIndex !== null ? verboseHistory.slice(0, viewIndex) : verboseHistory
  const whiteCaptured = historySlice
    .filter((m) => m.color === 'w' && m.captured)
    .map((m) => m.captured!)
  const blackCaptured = historySlice
    .filter((m) => m.color === 'b' && m.captured)
    .map((m) => m.captured!)
  const whiteScore = whiteCaptured.reduce(
    (s, p) => s + (PIECE_VALUES[p] ?? 0),
    0,
  )
  const blackScore = blackCaptured.reduce(
    (s, p) => s + (PIECE_VALUES[p] ?? 0),
    0,
  )

  const isPlayerTurn = gameMode === 'two-player' || game.turn() === playerColor[0]

  return {
    fen,
    displayFen,
    isComputerThinking,
    isReviewing,
    isOver: game.isGameOver(),
    isCheckmate: game.isCheckmate(),
    isPlayerTurn,
    verboseHistory,
    sanHistory: verboseHistory.map((m) => m.san),
    viewIndex,
    onPrev,
    onNext,
    onBeginning,
    onCurrent,
    onSquareClick,
    onPieceDrop,
    squareStyles,
    status: getStatus(game, isComputerThinking, gameMode, playerColor),
    whiteCaptured,
    blackCaptured,
    whiteAdv: Math.max(0, whiteScore - blackScore),
    blackAdv: Math.max(0, blackScore - whiteScore),
  }
}
