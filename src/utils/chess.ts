import { Chess } from 'chess.js'
import type { GameMode, PlayerColor } from '@/types'

export const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }

// Returns the square of the side-to-move's king (e.g. "e1"), used to apply
// the check animation to the correct square.
export function getKingSquare(game: Chess): string | null {
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

// Returns a human-readable status string for the status bar. Priority order:
// checkmate > stalemate > draw > computer thinking > check > whose turn.
export function getStatus(
  game: Chess,
  isComputerThinking: boolean,
  gameMode: GameMode,
  playerColor: PlayerColor = 'white',
): string {
  if (game.isCheckmate()) {
    if (gameMode === 'two-player') {
      return game.turn() === 'w'
        ? 'Checkmate — Black wins!'
        : 'Checkmate — White wins!'
    }
    // The side to move is in checkmate, so the other side won
    const playerWon = game.turn() !== playerColor[0]
    return playerWon ? 'Checkmate — You win!' : 'Checkmate — Computer wins!'
  }
  if (game.isStalemate()) return 'Stalemate — Draw!'
  if (game.isDraw()) return 'Draw!'
  if (isComputerThinking) return 'Computer is thinking...'
  if (gameMode === 'two-player') {
    if (game.isCheck())
      return `Check! ${game.turn() === 'w' ? "White's" : "Black's"} turn`
    return game.turn() === 'w' ? "White's turn" : "Black's turn"
  }
  const isPlayerTurn = game.turn() === playerColor[0]
  if (game.isCheck()) return isPlayerTurn ? 'Check! Your turn' : 'Check!'
  return isPlayerTurn ? 'Your turn' : "Computer's turn"
}
