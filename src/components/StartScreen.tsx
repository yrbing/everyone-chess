import { useState } from 'react'
import type { Difficulty, DifficultyConfig, GameMode } from '@/types'
import { DIFFICULTY_CONFIGS } from '@/types'
import './StartScreen.css'

interface StartScreenProps {
  onStart: (difficulty: Difficulty, mode: GameMode) => void
  onClose: () => void
}

const DIFFICULTIES = Object.entries(DIFFICULTY_CONFIGS) as [
  Difficulty,
  DifficultyConfig,
][]

const MODES: { value: GameMode; label: string; description: string }[] = [
  {
    value: 'vs-computer',
    label: 'vs Computer',
    description: 'Play against the AI',
  },
  { value: 'two-player', label: 'vs Self', description: 'Play both sides' },
]

export function StartScreen({ onStart, onClose }: StartScreenProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('vs-computer')
  const [selected, setSelected] = useState<Difficulty>('medium')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="start-screen">
          <button
            className="start-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
          <h1 className="start-title">Everyone Chess</h1>
          <p className="start-subtitle">Know more about your moves</p>

          <div className="difficulty-cards">
            {MODES.map(({ value, label, description }) => (
              <button
                key={value}
                className={`difficulty-card ${selectedMode === value ? 'selected' : ''}`}
                onClick={() => setSelectedMode(value)}
              >
                <span className="difficulty-label">{label}</span>
                <span className="difficulty-desc">{description}</span>
              </button>
            ))}
          </div>

          {selectedMode === 'vs-computer' && (
            <div className="difficulty-cards">
              {DIFFICULTIES.map(
                ([value, { label, description, eloDisplay }]) => (
                  <button
                    key={value}
                    className={`difficulty-card ${selected === value ? 'selected' : ''}`}
                    onClick={() => setSelected(value)}
                  >
                    <span className="difficulty-label">{label}</span>
                    <span className="difficulty-desc">{description}</span>
                    <span className="difficulty-elo">{eloDisplay}</span>
                  </button>
                ),
              )}
            </div>
          )}

          <button
            className="start-btn"
            onClick={() => onStart(selected, selectedMode)}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  )
}
