import { useCallback, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import type { PieceDropHandlerArgs, SquareHandlerArgs } from 'react-chessboard'
import type { Difficulty } from '../types'
import { useStockfish } from '../hooks/useStockfish'
import { StatusBar } from './StatusBar'
import { MoveHistory } from './MoveHistory'
import { Controls } from './Controls'

interface GameBoardProps {
  difficulty: Difficulty
  onNewGame: () => void
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

export function GameBoard({ difficulty, onNewGame }: GameBoardProps) {
  const gameRef = useRef(new Chess())
  const [fen, setFen] = useState(gameRef.current.fen())
  const [isComputerThinking, setIsComputerThinking] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const { getBestMove } = useStockfish()

  const game = gameRef.current

  const applyComputerMove = useCallback(
    async (currentFen: string) => {
      setIsComputerThinking(true)
      try {
        const uciMove = await getBestMove(currentFen, difficulty)
        const from = uciMove.slice(0, 2)
        const to = uciMove.slice(2, 4)
        const promotion = uciMove.length > 4 ? uciMove[4] : 'q'
        game.move({ from, to, promotion })
        setFen(game.fen())
        setHistory(game.history())
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
        setHistory(game.history())
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
      if (isComputerThinking || game.isGameOver()) return
      if (game.turn() !== 'w') return

      if (selectedSquare) {
        // try to move to the clicked square
        const moved = tryMove(selectedSquare, square)
        if (!moved) {
          // if it's another white piece, select it instead
          setSelectedSquare(piece?.pieceType.startsWith('w') ? square : null)
        }
      } else {
        // select square only if it has a white piece
        if (piece?.pieceType.startsWith('w')) {
          setSelectedSquare(square)
        }
      }
    },
    [isComputerThinking, game, selectedSquare, tryMove],
  )

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
      if (!targetSquare) return false
      if (isComputerThinking || game.isGameOver()) return false
      if (game.turn() !== 'w') return false
      return tryMove(sourceSquare, targetSquare)
    },
    [isComputerThinking, game, tryMove],
  )

  const squareStyles: Record<string, React.CSSProperties> = {}
  if (selectedSquare) {
    squareStyles[selectedSquare] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    // highlight legal moves
    game.moves({ square: selectedSquare, verbose: true }).forEach((m) => {
      squareStyles[m.to] = {
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        borderRadius: '50%',
      }
    })
  }

  const status = getStatus(game, isComputerThinking)
  const isOver = game.isGameOver()

  return (
    <div className="game-layout">
      <div className="board-container">
        <Chessboard
          options={{
            position: fen,
            boardOrientation: 'white',
            allowDragging: !isComputerThinking && !isOver,
            onPieceDrop,
            onSquareClick,
            squareStyles,
          }}
        />
      </div>
      <aside className="sidebar">
        <StatusBar status={status} />
        <Controls difficulty={difficulty} onNewGame={onNewGame} />
        <MoveHistory history={history} />
      </aside>
    </div>
  )
}
