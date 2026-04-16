import { useState } from 'react'
import { Bot, Earth, UsersRound } from 'lucide-react'

import type {
  Difficulty,
  DifficultyConfig,
  GameMode,
  PlayerColor,
} from '@/types'
import { DIFFICULTY_CONFIGS } from '@/types'
import './StartScreen.css'

interface StartScreenProps {
  onStart: (
    difficulty: Difficulty,
    mode: GameMode,
    playerColor: PlayerColor,
  ) => void
  onClose: () => void
}

const DIFFICULTIES = Object.entries(DIFFICULTY_CONFIGS) as [
  Difficulty,
  DifficultyConfig,
][]

const MODES: {
  value: GameMode
  description: string
  Icon: React.ReactElement
  disabled?: boolean
}[] = [
  {
    value: 'vs-computer',
    description: 'Play against AI',
    Icon: <Bot size={48} />,
  },
  {
    value: 'two-player',
    description: 'Play both sides',
    Icon: <UsersRound size={48} />,
  },
  {
    value: 'online-player',
    description: 'Play online (coming soon)',
    Icon: <Earth size={48} />,
    disabled: true,
  },
]

const COLORS: { value: PlayerColor; label: string; description: string }[] = [
  { value: 'white', label: 'White', description: 'You move first' },
  { value: 'black', label: 'Black', description: 'Computer moves first' },
]

export function StartScreen({ onStart, onClose }: StartScreenProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('vs-computer')
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>('medium')
  const [playerColor, setPlayerColor] = useState<PlayerColor>('white')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="start-screen">
          <h1 className="start-title">Everyone Chess</h1>
          <p className="start-subtitle">Know more about your moves</p>

          <div className="mode-cards">
            {MODES.map(({ value, description, Icon, disabled }) => (
              <button
                key={value}
                className={`mode-card ${selectedMode === value ? 'selected' : ''}`}
                onClick={() => setSelectedMode(value)}
                disabled={disabled}
              >
                {Icon}
                <span className="mode-desc">{description}</span>
              </button>
            ))}
          </div>

          {selectedMode === 'vs-computer' && (
            <>
              <div className="selection-cards">
                <div className="selection-title">Difficulty Level</div>
                {DIFFICULTIES.map(
                  ([value, { label, description, eloDisplay }]) => (
                    <button
                      key={value}
                      className={`selection-card ${selectedDifficulty === value ? 'selected' : ''}`}
                      onClick={() => setSelectedDifficulty(value)}
                    >
                      <span className="selection-label">{label}</span>
                      <span className="selection-desc">{description}</span>
                      <span className="selection-elo">{eloDisplay}</span>
                    </button>
                  ),
                )}
              </div>
              <div className="selection-cards">
                <div className="selection-title">Choose Your Color</div>
                {COLORS.map(({ value, label, description }) => (
                  <button
                    key={value}
                    className={`selection-card ${playerColor === value ? 'selected' : ''}`}
                    onClick={() => setPlayerColor(value)}
                  >
                    <span className="selection-label">{label}</span>
                    <span className="selection-desc">{description}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <button
            className="start-btn"
            onClick={() =>
              onStart(selectedDifficulty, selectedMode, playerColor)
            }
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  )
}
