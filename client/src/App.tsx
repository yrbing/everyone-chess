import { useEffect, useState } from 'react'
import type {
  Theme,
  Difficulty,
  GameMode,
  PlayerColor,
  BoardTheme,
} from '@/types'
import { StartScreen } from '@/components/StartScreen'
import { GameBoard } from '@/components/GameBoard'
import { MainMenu } from '@/components/MainMenu'
import { ThemeContext } from '@/context/ThemeContext'

import { useGameSocket } from '@/hooks/useGameSocket'

export default function App() {
  const [gameKey, setGameKey] = useState(0)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [gameMode, setGameMode] = useState<GameMode>('vs-computer')
  const [playerColor, setPlayerColor] = useState<PlayerColor>('white')
  const [showStartScreen, setShowStartScreen] = useState(true)
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) ?? 'light',
  )
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(
    () => (localStorage.getItem('boardTheme') as BoardTheme) ?? 'forest',
  )

  const [onlineRoomCode, setOnlineRoomCode] = useState<string | null>(null)
  const [onlineError, setOnlineError] = useState<string | null>(null)
  const [incomingMove, setIncomingMove] = useState<{
    from: string
    to: string
    promotion?: string
  } | null>(null)
  const [opponentLeft, setOpponentLeft] = useState(false)

  const [incomingChat, setIncomingChat] = useState<{ text: string } | null>(
    null,
  )
  const { createRoom, joinRoom, sendMove, sendChat, connected } =
    useGameSocket((msg) => {
    switch (msg.type) {
      case 'created':
        setOnlineRoomCode(msg.code)
        break
      case 'start':
        setPlayerColor(msg.color)
        setGameMode('online-player')
        setOpponentLeft(false)
        setIncomingMove(null) // add this — clear stale pointer before the fresh GameBoard mounts
        setIncomingChat(null) // add this — clear stale pointer before the fresh GameBoard mounts
        setGameKey((k) => k + 1)
        setShowStartScreen(false)
        break
      case 'move':
        setIncomingMove({
          from: msg.from,
          to: msg.to,
          promotion: msg.promotion,
        })
        break
      case 'chat':
        setIncomingChat({
          text: msg.text,
        })
        break
      case 'opponentLeft':
        setOpponentLeft(true)
        break
      case 'error':
        setOnlineError(msg.message)
        break
    }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('boardTheme', boardTheme)
  }, [boardTheme])

  const handleStart = (d: Difficulty, mode: GameMode, color: PlayerColor) => {
    setDifficulty(d)
    setGameMode(mode)
    setPlayerColor(color)
    setGameKey((k) => k + 1)
    setShowStartScreen(false)
  }

  return (
    <div className="app">
      <div className="page-layout">
        <ThemeContext.Provider value={theme}>
          <MainMenu
            onNewGame={() => setShowStartScreen(true)}
            onToggleTheme={() =>
              setTheme((t) => (t === 'light' ? 'dark' : 'light'))
            }
            boardTheme={boardTheme}
            onBoardThemeChange={setBoardTheme}
          />
          <GameBoard
            key={gameKey}
            difficulty={difficulty}
            gameMode={gameMode}
            playerColor={playerColor}
            boardTheme={boardTheme}
            sendMove={sendMove}
            incomingMove={incomingMove}
            opponentLeft={opponentLeft}
            sendChat={sendChat}
            incomingChat={incomingChat}
            connected={connected}
          />
        </ThemeContext.Provider>
      </div>
      {showStartScreen && (
        <StartScreen
          onStart={handleStart}
          onClose={() => setShowStartScreen(false)}
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          roomCode={onlineRoomCode}
          onlineError={onlineError}
          connected={connected}
        />
      )}
    </div>
  )
}
