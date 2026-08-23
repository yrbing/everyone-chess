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
  onCreateRoom: () => void
  onJoinRoom: (code: string) => void
  roomCode: string | null
  onlineError: string | null
}

const DIFFICULTIES = Object.entries(DIFFICULTY_CONFIGS) as [
  Difficulty,
  DifficultyConfig,
][]

const MODES: {
  value: GameMode
  description: string
  Icon: React.ReactElement
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
    description: 'Play online',
    Icon: <Earth size={48} />,
  },
]

const COLORS: { value: PlayerColor; label: string; description: string }[] = [
  { value: 'white', label: 'White', description: 'You move first' },
  { value: 'black', label: 'Black', description: 'Computer moves first' },
]

export function StartScreen({
  onStart,
  onClose,
  onCreateRoom,
  onJoinRoom,
  roomCode,
  onlineError,
}: StartScreenProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('vs-computer')
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>('medium')
  const [playerColor, setPlayerColor] = useState<PlayerColor>('white')
  const [joinCode, setJoinCode] = useState('')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>
        <div className="start-screen">
          <h1 className="start-title">
            Everyone <span className="start-title-accent">Chess</span>
          </h1>
          <p className="start-subtitle">Know more about your moves</p>

          <div className="mode-cards">
            {MODES.map(({ value, description, Icon }) => (
              <button
                key={value}
                className={`mode-card ${selectedMode === value ? 'selected' : ''}`}
                onClick={() => setSelectedMode(value)}
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

          {selectedMode === 'online-player' && (
            <div className="selection-cards">
              <div className="selection-title">Play Online</div>
              {roomCode ? (
                <p className="online-status">
                  Room code: <strong>{roomCode}</strong> — waiting for
                  opponent…
                </p>
              ) : (
                <>
                  <button className="btn-primary" onClick={onCreateRoom}>
                    Create Game
                  </button>
                  <div className="online-join-row">
                    <input
                      className="online-join-input"
                      placeholder="Enter room code"
                      value={joinCode}
                      onChange={(e) =>
                        setJoinCode(e.target.value.toUpperCase())
                      }
                    />
                    <button
                      className="btn-primary"
                      onClick={() => onJoinRoom(joinCode)}
                      disabled={!joinCode}
                    >
                      Join
                    </button>
                  </div>
                </>
              )}
              {onlineError && <p className="online-error">{onlineError}</p>}
            </div>
          )}

          {selectedMode !== 'online-player' && (
            <button
              className="btn-primary start-btn"
              onClick={() =>
                onStart(selectedDifficulty, selectedMode, playerColor)
              }
            >
              Start Game
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
