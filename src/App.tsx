import { useState } from 'react'
import type { Difficulty } from './types'
import { StartScreen } from './components/StartScreen'
import { GameBoard } from './components/GameBoard'
import './index.css'

export default function App() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [gameKey, setGameKey] = useState(0)

  const handleStart = (d: Difficulty) => {
    setDifficulty(d)
    setGameKey((k) => k + 1)
  }

  const handleNewGame = () => {
    setDifficulty(null)
  }

  return (
    <div className="app">
      {difficulty === null ? (
        <StartScreen onStart={handleStart} />
      ) : (
        <GameBoard
          key={gameKey}
          difficulty={difficulty}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  )
}
