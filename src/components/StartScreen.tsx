import { useState } from 'react'
import type { Difficulty } from '../types'

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void
}

const DIFFICULTY_INFO: {
  value: Difficulty
  label: string
  description: string
  elo: string
}[] = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'Great for beginners',
    elo: '~800 Elo',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'A solid challenge',
    elo: '~1500 Elo',
  },
  {
    value: 'hard',
    label: 'Hard',
    description: 'Near-perfect play',
    elo: '~2800 Elo',
  },
]

export function StartScreen({ onStart }: StartScreenProps) {
  const [selected, setSelected] = useState<Difficulty>('medium')

  return (
    <div className="start-screen">
      <h1 className="start-title">Chess</h1>
      <p className="start-subtitle">Play against Stockfish</p>

      <div className="difficulty-cards">
        {DIFFICULTY_INFO.map(({ value, label, description, elo }) => (
          <button
            key={value}
            className={`difficulty-card ${selected === value ? 'selected' : ''}`}
            onClick={() => setSelected(value)}
          >
            <span className="difficulty-label">{label}</span>
            <span className="difficulty-desc">{description}</span>
            <span className="difficulty-elo">{elo}</span>
          </button>
        ))}
      </div>

      <button className="start-btn" onClick={() => onStart(selected)}>
        Start Game
      </button>
    </div>
  )
}
