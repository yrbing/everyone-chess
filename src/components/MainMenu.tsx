import { BookOpen, Clock, Moon, Plus, Puzzle, Star, Sun } from 'lucide-react'
import type { BoardTheme } from '@/types'
import { BoardThemePicker } from '@/components/BoardThemePicker'
import { useTheme } from '@/hooks/useTheme'
import './MainMenu.css'

interface MainMenuProps {
  onNewGame: () => void
  onToggleTheme: () => void
  boardTheme: BoardTheme
  onBoardThemeChange: (t: BoardTheme) => void
}

export function MainMenu({
  onNewGame,
  onToggleTheme,
  boardTheme,
  onBoardThemeChange,
}: MainMenuProps) {
  const theme = useTheme()

  return (
    <nav className="main-menu">
      <button
        type="button"
        className="main-menu-brand"
        onClick={onNewGame}
        aria-label="Everyone Chess — start a new game"
      >
        <span className="main-menu-logo" aria-hidden="true">
          ♞
        </span>
        <span className="main-menu-brand-text">
          <span className="main-menu-brand-name">
            Everyone <span className="main-menu-brand-accent">Chess</span>
          </span>
          <span className="main-menu-brand-tag">Know your moves</span>
        </span>
      </button>
      <button
        type="button"
        className="btn-primary main-menu-cta"
        onClick={onNewGame}
      >
        <Plus size={16} strokeWidth={2.5} />
        New Game
      </button>

      <div className="main-menu-group">Play</div>
      <button
        type="button"
        className="main-menu-item"
        disabled
        aria-disabled="true"
      >
        <span className="main-menu-icon">
          <Puzzle size={18} />
        </span>
        Puzzles
        <span className="main-menu-badge">Soon</span>
      </button>
      <button
        type="button"
        className="main-menu-item"
        disabled
        aria-disabled="true"
      >
        <span className="main-menu-icon">
          <BookOpen size={18} />
        </span>
        Lessons
        <span className="main-menu-badge">Soon</span>
      </button>

      <div className="main-menu-group">Library</div>
      <button
        type="button"
        className="main-menu-item"
        disabled
        aria-disabled="true"
      >
        <span className="main-menu-icon">
          <Clock size={18} />
        </span>
        History
        <span className="main-menu-badge">Soon</span>
      </button>
      <button
        type="button"
        className="main-menu-item"
        disabled
        aria-disabled="true"
      >
        <span className="main-menu-icon">
          <Star size={18} />
        </span>
        Favorites
        <span className="main-menu-badge">Soon</span>
      </button>

      <div className="main-menu-group">Settings</div>
      <button
        type="button"
        className="main-menu-item main-menu-item--muted"
        onClick={onToggleTheme}
      >
        <span className="main-menu-icon">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </span>
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </button>

      <div className="main-menu-board">
        <BoardThemePicker value={boardTheme} onChange={onBoardThemeChange} />
      </div>

      <div className="main-menu-spacer" />

      <div className="main-menu-footer">
        <div className="main-menu-avatar">A</div>
        <div className="main-menu-who">
          <div className="main-menu-who-name">anonymous</div>
          <div className="main-menu-who-meta">guest player</div>
        </div>
      </div>
    </nav>
  )
}
