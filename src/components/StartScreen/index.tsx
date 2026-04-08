import { useState } from 'react'
import type { Difficulty, DifficultyConfig } from '../../types'
import { DIFFICULTY_CONFIGS } from '../../types'
import './index.css'

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void
  onClose?: () => void
}

const DIFFICULTIES = Object.entries(DIFFICULTY_CONFIGS) as [
  Difficulty,
  DifficultyConfig,
][]

export function StartScreen({ onStart, onClose }: StartScreenProps) {
  const [selected, setSelected] = useState<Difficulty>('medium')

  return (
    <div className="start-screen">
      {onClose && (
        <button
          className="start-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      )}
      <h1 className="start-title">Everyone Chess</h1>
      <p className="start-subtitle">Know more about your moves</p>

      <div className="difficulty-cards">
        {DIFFICULTIES.map(([value, { label, description, eloDisplay }]) => (
          <button
            key={value}
            className={`difficulty-card ${selected === value ? 'selected' : ''}`}
            onClick={() => setSelected(value)}
          >
            <span className="difficulty-label">{label}</span>
            <span className="difficulty-desc">{description}</span>
            <span className="difficulty-elo">{eloDisplay}</span>
          </button>
        ))}
      </div>

      <button className="start-btn" onClick={() => onStart(selected)}>
        Start Game
      </button>
    </div>
  )
}
