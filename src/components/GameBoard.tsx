import { useCallback, useEffect, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import type { Move, Square } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import type { PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard'
import type { Difficulty } from '../types'
import { useStockfish } from '../hooks/useStockfish'
import { StatusBar } from './StatusBar'
import { MoveHistory } from './MoveHistory'
import { MoveNav } from './MoveNav'
import { Controls } from './Controls'
import { CapturedPieces } from './CapturedPieces'
import './GameBoard.css'

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }

interface GameBoardProps {
  difficulty: Difficulty
}

function getKingSquare(game: Chess): string | null {
  const color = game.turn()
  const files = 'abcdefgh'
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = game.board()[r][c]
      if (piece?.type === 'k' && piece.color === color) {
        return files[c] + (8 - r)
      }
    }
  }
  return null
}

function getStatus(game: Chess, isComputerThinking: boolean): string {
  if (game.isCheckmate()) {
    return game.turn() === 'w'
      ? 'Checkmate — Computer wins!'
      : 'Checkmate — You win!'
  }
  if (game.isStalemate()) return 'Stalemate — Draw!'
  if (game.isDraw()) return 'Draw!'
  if (isComputerThinking) return 'Computer is thinking...'
  if (game.isCheck()) return 'Check! Your turn'
  return game.turn() === 'w' ? 'Your turn' : "Computer's turn"
}

export function GameBoard({ difficulty }: GameBoardProps) {
  const gameRef = useRef(new Chess())
  const [fen, setFen] = useState(gameRef.current.fen())
  const [isComputerThinking, setIsComputerThinking] = useState(false)
  const [verboseHistory, setVerboseHistory] = useState<Move[]>([])
  const [viewIndex, setViewIndex] = useState<number | null>(null)
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [hintInfo, setHintInfo] = useState<{
    from: string
    to: string
    score: { type: 'cp' | 'mate'; value: number } | null
    continuation: string[]
  } | null>(null)
  const [isHintLoading, setIsHintLoading] = useState(false)
  const { getBestMove } = useStockfish()

  const game = gameRef.current
  const isReviewing = viewIndex !== null

  useEffect(() => {
    if (
      game.turn() !== 'w' ||
      isComputerThinking ||
      game.isGameOver() ||
      isReviewing
    ) {
      setHintInfo(null)
      setIsHintLoading(false)
      return
    }
    let cancelled = false
    setIsHintLoading(true)
    getBestMove(fen, 'hard').then(({ move, pv, score }) => {
      if (cancelled) return
      const tempGame = new Chess(fen)
      const continuation = pv.slice(0, 5).flatMap((uci) => {
        try {
          const m = tempGame.move({
            from: uci.slice(0, 2),
            to: uci.slice(2, 4),
            promotion: uci[4] ?? 'q',
          })
          return [m.san]
        } catch {
          return []
        }
      })
      setHintInfo({
        from: move.slice(0, 2),
        to: move.slice(2, 4),
        score,
        continuation,
      })
      setIsHintLoading(false)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, isComputerThinking, isReviewing])

  const displayFen = isReviewing
    ? viewIndex === 0
      ? verboseHistory[0].before
      : verboseHistory[viewIndex - 1].after
    : fen

  const applyComputerMove = useCallback(
    async (currentFen: string) => {
      setIsComputerThinking(true)
      try {
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

  const tryMove = useCallback(
    (from: string, to: string) => {
      try {
        const move = game.move({ from, to, promotion: 'q' })
        if (!move) return false
        setFen(game.fen())
        setVerboseHistory(game.history({ verbose: true }))
        setSelectedSquare(null)
        if (!game.isGameOver()) applyComputerMove(game.fen())
        return true
      } catch {
        return false
      }
    },
    [game, applyComputerMove],
  )

  const onSquareClick = useCallback(
    ({ square, piece }: SquareHandlerArgs) => {
      if (isReviewing || isComputerThinking || game.isGameOver()) return
      if (game.turn() !== 'w') return

      if (selectedSquare) {
        const moved = tryMove(selectedSquare, square)
        if (!moved) {
          setSelectedSquare(piece?.pieceType.startsWith('w') ? square as Square : null)
        }
      } else {
        if (piece?.pieceType.startsWith('w')) {
          setSelectedSquare(square as Square)
        }
      }
    },
    [isReviewing, isComputerThinking, game, selectedSquare, tryMove],
  )

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
      if (!targetSquare) return false
      if (isReviewing || isComputerThinking || game.isGameOver()) return false
      if (game.turn() !== 'w') return false
      return tryMove(sourceSquare, targetSquare)
    },
    [isReviewing, isComputerThinking, game, tryMove],
  )

  const onPrev = () => {
    if (viewIndex === null) setViewIndex(verboseHistory.length - 1)
    else setViewIndex(Math.max(0, viewIndex - 1))
  }

  const onNext = () => {
    if (viewIndex === null) return
    if (viewIndex >= verboseHistory.length) setViewIndex(null)
    else
      setViewIndex(
        viewIndex + 1 >= verboseHistory.length ? null : viewIndex + 1,
      )
  }

  const squareStyles: Record<string, React.CSSProperties> = {}
  const highlightMove = isReviewing
    ? viewIndex !== null && viewIndex > 0
      ? verboseHistory[viewIndex - 1]
      : null
    : (verboseHistory[verboseHistory.length - 1] ?? null)
  if (highlightMove) {
    squareStyles[highlightMove.from] = {
      backgroundColor: 'rgba(255, 170, 0, 0.35)',
    }
    squareStyles[highlightMove.to] = {
      backgroundColor: 'rgba(255, 170, 0, 0.6)',
    }
  }
  if (!isReviewing && selectedSquare) {
    squareStyles[selectedSquare] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    game.moves({ square: selectedSquare, verbose: true }).forEach((m) => {
      squareStyles[m.to] = {
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        borderRadius: '50%',
      }
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

  const status = getStatus(game, isComputerThinking)
  const isOver = game.isGameOver()
  const sanHistory = verboseHistory.map((m) => m.san)

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
  const whiteAdv = Math.max(0, whiteScore - blackScore)
  const blackAdv = Math.max(0, blackScore - whiteScore)

  return (
    <div className="game-layout">
      <div className="board-column">
        <StatusBar status={status} />
        <CapturedPieces
          pieces={whiteCaptured}
          capturedColor="b"
          advantage={whiteAdv}
        />
        <div className="board-container">
          <Chessboard
            options={{
              position: displayFen,
              boardOrientation: 'white',
              allowDragging: !isReviewing && !isComputerThinking && !isOver,
              onPieceDrop,
              onSquareClick,
              squareStyles,
              arrows: hintInfo
                ? [
                    {
                      startSquare: hintInfo.from,
                      endSquare: hintInfo.to,
                      color: 'rgba(0,200,100,0.75)',
                    },
                  ]
                : [],
            }}
          />
          {game.isCheckmate() && !isReviewing && (
            <div className="checkmate-overlay">
              <span className="checkmate-text">CHECKMATE</span>
            </div>
          )}
        </div>
        <CapturedPieces
          pieces={blackCaptured}
          capturedColor="w"
          advantage={blackAdv}
        />
        <MoveNav
          total={verboseHistory.length}
          viewIndex={viewIndex}
          onPrev={onPrev}
          onNext={onNext}
        />
      </div>
      <aside className="sidebar">
        <Controls difficulty={difficulty} />
        <div className="hint-panel">
          <p className="hint-title">Best move</p>
          {isHintLoading ? (
            <span className="hint-thinking">Thinking…</span>
          ) : (
            <>
              {hintInfo?.score && (
                <span className="hint-score">
                  {hintInfo.score.type === 'mate'
                    ? `M${Math.abs(hintInfo.score.value)}`
                    : hintInfo.score.value >= 0
                      ? `+${(hintInfo.score.value / 100).toFixed(1)}`
                      : `${(hintInfo.score.value / 100).toFixed(1)}`}
                </span>
              )}
              {hintInfo && hintInfo.continuation.length > 0 && (
                <p className="hint-line">{hintInfo.continuation.join(' ')}</p>
              )}
            </>
          )}
        </div>
        <MoveHistory history={sanHistory} viewIndex={viewIndex} />
      </aside>
    </div>
  )
}
