import { useEffect, useState } from 'react'
import type { Theme, Difficulty, GameMode, PlayerColor, BoardTheme } from '@/types'
import { StartScreen } from '@/components/StartScreen'
import { GameBoard } from '@/components/GameBoard'
import { MainMenu } from '@/components/MainMenu'
import { ThemeContext } from '@/context/ThemeContext'

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
    () => (localStorage.getItem('boardTheme') as BoardTheme) ?? 'classic',
  )

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
        <ThemeContext value={theme}>
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
          />
        </ThemeContext>
      </div>
      {showStartScreen && (
        <StartScreen
          onStart={handleStart}
          onClose={() => setShowStartScreen(false)}
        />
      )}
    </div>
  )
}
