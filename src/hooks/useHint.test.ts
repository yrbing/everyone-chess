import { Chess } from 'chess.js'
import { renderHook, waitFor } from '@testing-library/react'
import { buildMoveDescription, formatScoreText, useHint } from '@/hooks/useHint'

// Replace the real useStockfish module with a fake we control.
// vi.mock is hoisted (in other words, moved) to top of the file. It means that whenever you write it (be it inside beforeEach or test), it will actually be called before that.
// This also means that you cannot use any variables inside the factory that are defined outside the factory.
// If you need to use variables inside the factory, try vi.doMock. It works the same way but isn't hoisted. Beware that it only mocks subsequent imports.
// You can also reference variables defined by vi.hoisted method if it was declared before vi.mock:
const { mockGetBestMove } = vi.hoisted(() => ({ mockGetBestMove: vi.fn() }))
vi.mock('@/hooks/useStockfish', () => ({
  useStockfish: () => ({ getBestMove: mockGetBestMove }),
}))

const baseParams = {
  fen: new Chess().fen(), // start position, White to move
  isComputerThinking: false,
  isReviewing: false,
  gameMode: 'two-player' as const,
  playerColor: 'white' as const,
  arrowColor: 'green',
  explainEnabled: false,
}

describe('buildMoveDescription', () => {
  it('describes kingside castling', () => {
    const g = new Chess()
    for (const m of ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5']) g.move(m)
    expect(buildMoveDescription(g.fen(), 'e1g1')).toEqual({
      description: 'Castle kingside — tuck your King to safety',
      tag: 'Castling',
    })
  })

  it('describes a promotion', () => {
    const fen = '8/P7/8/4k3/8/8/8/7K w - - 0 1'
    expect(buildMoveDescription(fen, 'a7a8q')).toEqual({
      description: 'Promote your Pawn to a Queen on a8',
      tag: 'Promotion',
    })
  })

  it('describes a capture', () => {
    const g = new Chess()
    g.move('e4')
    g.move('d5')
    expect(buildMoveDescription(g.fen(), 'e4d5')).toEqual({
      description: 'Capture the Pawn on d5 with your Pawn',
      tag: 'Captures',
    })
  })

  it('describes a quiet move toward the center', () => {
    expect(buildMoveDescription(new Chess().fen(), 'e2e4')).toEqual({
      description: 'Move your Pawn forward toward the center',
      tag: null,
    })
  })

  it('flags a move that gives check', () => {
    const fen = '4k3/8/8/8/8/8/8/R3K3 w Q - 0 1'
    expect(buildMoveDescription(fen, 'a1a8')).toEqual({
      description: 'Move your Rook forward — gives check!',
      tag: 'Check',
    })
  })
})

describe('formatScoreText', () => {
  it('returns empty string for no score', () => {
    expect(formatScoreText(null)).toBe('')
  })

  it('describes forced mates from both sides', () => {
    expect(formatScoreText({ type: 'mate', value: 3 })).toBe('Checkmate in 3')
    expect(formatScoreText({ type: 'mate', value: -2 })).toBe(
      'Opponent has mate in 2',
    )
  })

  it('maps centipawn ranges to plain-English phrases', () => {
    expect(formatScoreText({ type: 'cp', value: 500 })).toBe("You're winning")
    expect(formatScoreText({ type: 'cp', value: 200 })).toBe(
      'You have a clear advantage',
    )
    expect(formatScoreText({ type: 'cp', value: 80 })).toBe(
      "You're slightly ahead",
    )
    expect(formatScoreText({ type: 'cp', value: 0 })).toBe('Equal position')
    expect(formatScoreText({ type: 'cp', value: -100 })).toBe(
      'Opponent is slightly ahead',
    )
    expect(formatScoreText({ type: 'cp', value: -300 })).toBe(
      'Opponent has a clear advantage',
    )
    expect(formatScoreText({ type: 'cp', value: -900 })).toBe(
      "You're in trouble",
    )
  })
})

describe('useHint', () => {
  beforeEach(() => {
    mockGetBestMove.mockReset()
  })

  it("produces a hint with an arrow on the player's turn", async () => {
    mockGetBestMove.mockResolvedValue({
      move: 'e2e4',
      pv: ['e2e4', 'e7e5'],
      score: { type: 'cp', value: 30 },
    })

    const { result } = renderHook(() =>
      useHint({ ...baseParams, gameMode: 'vs-computer' }),
    )

    // The hint arrives asynchronously (engine promise + effect), so wait for it.
    await waitFor(() => expect(result.current.hintInfo).not.toBeNull())

    expect(result.current.hintInfo?.from).toBe('e2')
    expect(result.current.hintInfo?.to).toBe('e4')
    expect(result.current.arrows).toEqual([
      { startSquare: 'e2', endSquare: 'e4', color: 'green' },
    ])
  })

  it("gives no hint when it is the computer's turn", () => {
    // playerColor black, but White is to move → it's the computer's turn.
    const { result } = renderHook(() =>
      useHint({ ...baseParams, gameMode: 'vs-computer', playerColor: 'black' }),
    )

    expect(result.current.hintInfo).toBeNull()
    expect(mockGetBestMove).not.toHaveBeenCalled()
  })

  it('gives no hint while reviewing history', () => {
    const { result } = renderHook(() =>
      useHint({ ...baseParams, isReviewing: true }),
    )

    expect(result.current.hintInfo).toBeNull()
    expect(mockGetBestMove).not.toHaveBeenCalled()
  })
})
