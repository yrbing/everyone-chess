import { Chess } from 'chess.js'
import { getKingSquare, getStatus } from '@/utils/chess'

/*   How to read this file:
  - The weird strings like rnb1kbnr/... are FENs — a
  compact text snapshot of a board position. Each one
  sets up an exact scenario (checkmate, stalemate,
  check…) so we can assert the status string for it.
  - This file tests pure functions only — no React, no
  DOM. That's why it needs Vitest but not RTL.
  */

describe('getKingSquare', () => {
  it('finds the white king on the starting square', () => {
    expect(getKingSquare(new Chess())).toBe('e1')
  })

  it('finds the side-to-move king (black, after 1.e4)', () => {
    const game = new Chess()
    game.move('e4') // now it is Black's turn
    expect(getKingSquare(game)).toBe('e8')
  })
})

describe('getStatus', () => {
  // Fool's mate: White is checkmated, so Black wins.
  const foolsMate =
    'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3'

  it('announces the winner on checkmate in two-player mode', () => {
    expect(getStatus(new Chess(foolsMate), false, 'two-player')).toBe(
      'Checkmate — Black wins!',
    )
  })

  it("frames checkmate from the human player's perspective vs the computer", () => {
    // White (side to move) is mated.
    expect(getStatus(new Chess(foolsMate), false, 'vs-computer', 'white')).toBe(
      'Checkmate — Computer wins!',
    )
    expect(getStatus(new Chess(foolsMate), false, 'vs-computer', 'black')).toBe(
      'Checkmate — You win!',
    )
  })

  it('reports stalemate and draw', () => {
    const stalemate = new Chess('k7/8/1Q6/8/8/8/8/7K b - - 0 1')
    expect(getStatus(stalemate, false, 'two-player')).toBe('Stalemate — Draw!')

    const insufficient = new Chess('k7/8/8/8/8/8/8/7K w - - 0 1')
    expect(getStatus(insufficient, false, 'two-player')).toBe('Draw!')
  })

  it('prioritises the "computer is thinking" message', () => {
    expect(getStatus(new Chess(), true, 'vs-computer', 'white')).toBe(
      'Computer is thinking...',
    )
  })

  it('describes check', () => {
    const inCheck = new Chess('4k3/8/8/8/7q/8/8/4K3 w - - 0 1')
    expect(getStatus(inCheck, false, 'two-player')).toBe("Check! White's turn")
    expect(getStatus(inCheck, false, 'vs-computer', 'white')).toBe(
      'Check! Your turn',
    )
  })

  it('reports whose plain turn it is', () => {
    const start = new Chess()
    expect(getStatus(start, false, 'two-player')).toBe("White's turn")
    expect(getStatus(start, false, 'vs-computer', 'white')).toBe('Your turn')
    expect(getStatus(start, false, 'vs-computer', 'black')).toBe(
      "Computer's turn",
    )
  })
})
