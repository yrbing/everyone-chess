import { useEffect, useState } from 'react'
import type { Difficulty } from './types'
import { StartScreen } from './components/StartScreen'
import { GameBoard } from './components/GameBoard'
import { LeftSidebar } from './components/LeftSidebar'
import './index.css'

export default function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [gameKey, setGameKey] = useState(0)
  const [showStartScreen, setShowStartScreen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const handleStart = (d: Difficulty) => {
    setDifficulty(d)
    setGameKey((k) => k + 1)
    setShowStartScreen(false)
  }

  return (
    <div className="app">
      <div className="page-layout">
        <LeftSidebar
          onNewGame={() => setShowStartScreen(true)}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        />
        <GameBoard key={gameKey} difficulty={difficulty} />
      </div>
      {showStartScreen && (
        <div className="modal-overlay" onClick={() => setShowStartScreen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <StartScreen
              onStart={handleStart}
              onClose={() => setShowStartScreen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
