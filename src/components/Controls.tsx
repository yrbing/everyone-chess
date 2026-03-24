import type { Difficulty } from '../types'

interface ControlsProps {
  difficulty: Difficulty
  onNewGame: () => void
}

const LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export function Controls({ difficulty, onNewGame }: ControlsProps) {
  return (
    <div className="controls">
      <div className="controls-difficulty">
        <span className="controls-label">Difficulty:</span>
        <span className="controls-value">{LABELS[difficulty]}</span>
      </div>
      <button className="new-game-btn" onClick={onNewGame}>
        New Game
      </button>
    </div>
  )
}
