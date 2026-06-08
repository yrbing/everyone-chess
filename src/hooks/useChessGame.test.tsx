import type { ReactNode } from 'react'
import type { PieceDropHandlerArgs } from 'react-chessboard'
import { renderHook, act } from '@testing-library/react'
import { ThemeContext } from '@/context/ThemeContext'
import { useChessGame } from '@/hooks/useChessGame'

// useChessGame uses useStockfish internally — mock it so no real worker spawns.
const { mockGetBestMove } = vi.hoisted(() => ({ mockGetBestMove: vi.fn() }))
vi.mock('@/hooks/useStockfish', () => ({
  useStockfish: () => ({ getBestMove: mockGetBestMove }),
}))

// useChessGame calls useTheme(), so it needs a ThemeContext provider.
const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeContext.Provider value="light">{children}</ThemeContext.Provider>
)

// The board handler's type wants a `piece` field we don't use at runtime;
// cast so TS is happy while we pass only what the logic reads.
const dropArgs = (from: string, to: string) =>
  ({ sourceSquare: from, targetSquare: to }) as unknown as PieceDropHandlerArgs

describe('useChessGame', () => {
  beforeEach(() => {
    mockGetBestMove.mockReset()
  })

  it('applies a legal move and rejects an illegal one (two-player)', () => {
    const { result } = renderHook(
      () =>
        useChessGame({
          difficulty: 'easy',
          gameMode: 'two-player',
          boardTheme: 'classic',
        }),
      { wrapper },
    )

    expect(result.current.sanHistory).toEqual([])

    let accepted: boolean | undefined
    act(() => {
      accepted = result.current.onPieceDrop(dropArgs('e2', 'e4'))
    })
    expect(accepted).toBe(true)
    expect(result.current.sanHistory).toEqual(['e4'])

    let rejected: boolean | undefined
    act(() => {
      rejected = result.current.onPieceDrop(dropArgs('e4', 'e7')) // illegal
    })
    expect(rejected).toBe(false)
    expect(result.current.sanHistory).toEqual(['e4']) // unchanged
  })

  it('lets the computer reply after the player moves (vs-computer)', async () => {
    mockGetBestMove.mockResolvedValue({
      move: 'e7e5',
      pv: ['e7e5'],
      score: { type: 'cp', value: 0 },
    })
    vi.useFakeTimers()
    try {
      const { result } = renderHook(
        () =>
          useChessGame({
            difficulty: 'easy',
            gameMode: 'vs-computer',
            playerColor: 'white',
            boardTheme: 'classic',
          }),
        { wrapper },
      )

      await act(async () => {
        result.current.onPieceDrop(dropArgs('e2', 'e4'))
      })

      // Player's move landed; the computer is now "thinking".
      expect(result.current.sanHistory).toEqual(['e4'])
      expect(result.current.isComputerThinking).toBe(true)

      // Fast-forward past the 1s delay; the mocked engine reply resolves.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000)
      })

      expect(result.current.isComputerThinking).toBe(false)
      expect(result.current.sanHistory).toEqual(['e4', 'e5'])
    } finally {
      vi.useRealTimers()
    }
  })
})
