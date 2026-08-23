import { useState } from 'react'

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
  onCreateRoom: (color: 'white' | 'black') => void
  onJoinRoom: (code: string) => void
  roomCode: string | null
  onlineError: string | null
  connected?: boolean
}

const DIFFICULTIES = Object.entries(DIFFICULTY_CONFIGS) as [
  Difficulty,
  DifficultyConfig,
][]

const MODES: {
  value: GameMode
  label: string
  description: string
}[] = [
  { value: 'vs-computer', label: 'VS CPU', description: 'Play against AI' },
  { value: 'two-player', label: '2 PLAYER', description: 'Play both sides' },
  { value: 'online-player', label: 'ONLINE', description: 'Play online' },
]

const TWO_PLAYER_SIDES: {
  value: 'white' | 'black'
  label: string
  description: string
}[] = [
  { value: 'white', label: 'White', description: 'You move first' },
  {
    value: 'black',
    label: 'Black',
    description: 'Your opponent moves first',
  },
]

export function StartScreen({
  onStart,
  onClose,
  onCreateRoom,
  onJoinRoom,
  roomCode,
  onlineError,
  connected = true,
}: StartScreenProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('vs-computer')
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>('medium')
  const [playerColor, setPlayerColor] = useState<PlayerColor>('white')
  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [onlineAction, setOnlineAction] = useState<'create' | 'join'>('create')

  function copyCode() {
    if (!roomCode) return
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode).catch(() => {})
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="ss-ov" onClick={onClose}>
      <div className="ss-md" onClick={(e) => e.stopPropagation()}>
        <button className="ss-x" onClick={onClose} aria-label="Close dialog">
          {'✕'}
        </button>
        <h1 className="ss-t">
          Everyone <i>Chess</i>
        </h1>
        <p className="ss-sub">Know more about your moves</p>

        <div className="ss-sec">
          <div className="ss-ey">Mode</div>
          <div className="ss-modes">
            {MODES.map(({ value, label, description }) => (
              <button
                key={value}
                className={`ss-mode${selectedMode === value ? ' ss-sel' : ''}`}
                onClick={() => setSelectedMode(value)}
              >
                <span className="ss-mode-cur">
                  {selectedMode === value ? '▶' : ''}
                </span>
                <span className="ss-mode-lb">{label}</span>
                <span className="ss-mode-d">{description}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedMode === 'vs-computer' && (
          <>
            <div className="ss-sec">
              <div className="ss-ey">Difficulty Level</div>
              {DIFFICULTIES.map(
                ([value, { label, description, eloDisplay }]) => (
                  <button
                    key={value}
                    className={`ss-row${selectedDifficulty === value ? ' ss-sel' : ''}`}
                    onClick={() => setSelectedDifficulty(value)}
                  >
                    <span className="ss-cur">
                      {selectedDifficulty === value ? '▶' : ''}
                    </span>
                    <span className="ss-lb">{label}</span>
                    <span className="ss-d">{description}</span>
                    <span className="ss-elo">{eloDisplay}</span>
                  </button>
                ),
              )}
            </div>
          </>
        )}

        {selectedMode === 'online-player' && (
          <div className="ss-sec">
            <div className="ss-ey">Play Online</div>
            <div className="ss-pair">
              <button
                className={`ss-pill${onlineAction === 'create' ? ' ss-sel' : ''}`}
                onClick={() => setOnlineAction('create')}
              >
                <span className="ss-pill-lb">Create Room</span>
                <span className="ss-pill-d">Get a code to share</span>
              </button>
              <button
                className={`ss-pill${onlineAction === 'join' ? ' ss-sel' : ''}`}
                onClick={() => setOnlineAction('join')}
              >
                <span className="ss-pill-lb">Join Room</span>
                <span className="ss-pill-d">Enter a friend's code</span>
              </button>
            </div>
          </div>
        )}

        {/* choose color */}
        {(selectedMode !== 'online-player' || onlineAction !== 'join') && (
          <div className="ss-sec">
            <div className="ss-ey">Choose Your Color</div>
            <div className="ss-pair">
              {TWO_PLAYER_SIDES.map(({ value, label, description }) => (
                <button
                  key={value}
                  className={`ss-pill${playerColor === value ? ' ss-sel' : ''}`}
                  onClick={() => setPlayerColor(value)}
                  disabled={selectedMode === 'online-player' && !!roomCode}
                >
                  <span className="ss-pill-lb">{label}</span>
                  <span className="ss-pill-d">{description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedMode === 'online-player' && (
          <div className="ss-sec">
            {onlineAction === 'create' ? (
              roomCode ? (
                <div className="ss-room">
                  <div className="ss-room-cap">SHARE THIS CODE</div>
                  <div
                    className="ss-code"
                    aria-label={`Room code ${roomCode.split('').join(' ')}`}
                  >
                    {roomCode.split('').map((char, i) => (
                      <span className="ss-digit" key={i}>
                        {char}
                      </span>
                    ))}
                  </div>
                  <div className="ss-room-acts">
                    <button
                      type="button"
                      className="ss-mini"
                      onClick={copyCode}
                    >
                      {copied ? '✓ COPIED' : 'COPY'}
                    </button>
                  </div>
                  <p className="ss-room-hint">waiting for opponent…</p>
                </div>
              ) : (
                <button
                  className="ss-btn ss-btn-full"
                  onClick={() => onCreateRoom(playerColor)}
                  disabled={!connected}
                >
                  Create Game
                </button>
              )
            ) : (
              <>
                <div className="ss-join-row">
                  <input
                    className="ss-join"
                    placeholder="Enter room code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  />
                </div>
                <button
                  className="ss-btn ss-btn-full"
                  onClick={() => onJoinRoom(joinCode)}
                  disabled={!joinCode || !connected}
                >
                  Join
                </button>
              </>
            )}
            {!connected && (
              <p className="ss-room-hint">Connecting to server…</p>
            )}
            {onlineError && <p className="ss-error">{onlineError}</p>}
          </div>
        )}

        {selectedMode !== 'online-player' && (
          <button
            className="ss-go"
            onClick={() =>
              onStart(selectedDifficulty, selectedMode, playerColor)
            }
          >
            Start Game
          </button>
        )}
      </div>
    </div>
  )
}
