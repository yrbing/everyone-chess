import { render, screen } from '@testing-library/react'
import App from '@/App'

// GameBoard pulls in the engine worker + react-chessboard (real-browser stuff).
// Stub it so this smoke test checks App's own composition, not the board.
vi.mock('@/components/GameBoard', () => ({
  GameBoard: () => <div data-testid="game-board" />,
}))

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('mounts and shows the start screen over the (stubbed) board', () => {
    render(<App />)

    // Start screen is visible by default.
    expect(
      screen.getByRole('button', { name: 'Start Game' }),
    ).toBeInTheDocument()
    // The rest of the app (here, the stubbed GameBoard) mounted too.
    expect(screen.getByTestId('game-board')).toBeInTheDocument()
  })
})
