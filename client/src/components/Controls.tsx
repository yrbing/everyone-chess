import type { Difficulty } from '@/types'
import { DIFFICULTY_CONFIGS } from '@/types'
import './Controls.css'

interface ControlsProps {
  difficulty: Difficulty
}

export function Controls({ difficulty }: ControlsProps) {
  return (
    <div className="controls">
      <div className="controls-difficulty">
        <span className="controls-label">Difficulty:</span>
        <span className="controls-value">
          {DIFFICULTY_CONFIGS[difficulty].label}
        </span>
      </div>
    </div>
  )
}
