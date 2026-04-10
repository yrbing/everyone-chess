import { useEffect, useState } from 'react'
import type { Theme, Difficulty, GameMode } from '@/types'
import { StartScreen } from '@/components/StartScreen'
import { GameBoard } from '@/components/GameBoard'
import { MainMenu } from '@/components/MainMenu'

export default function App() {
  const [gameKey, setGameKey] = useState(0)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [gameMode, setGameMode] = useState<GameMode>('vs-computer')
  const [showStartScreen, setShowStartScreen] = useState(true)
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) ?? 'light',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleStart = (d: Difficulty, mode: GameMode) => {
    setDifficulty(d)
    setGameMode(mode)
    setGameKey((k) => k + 1)
    setShowStartScreen(false)
  }

  return (
    <div className="app">
      <div className="page-layout">
        <MainMenu
          theme={theme}
          onNewGame={() => setShowStartScreen(true)}
          onToggleTheme={() =>
            setTheme((t) => (t === 'light' ? 'dark' : 'light'))
          }
        />
        <GameBoard key={gameKey} difficulty={difficulty} gameMode={gameMode} />
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
