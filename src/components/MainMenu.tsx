import { useState } from 'react'
import type { BoardTheme } from '@/types'
import { BOARD_THEMES } from '@/types'
import { BoardThemePicker } from '@/components/BoardThemePicker'
import { useTheme } from '@/hooks/useTheme'
import './MainMenu.css'

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {open ? (
        <polyline points="11,4 6,9 11,14" />
      ) : (
        <polyline points="7,4 12,9 7,14" />
      )}
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="10" y1="3" x2="10" y2="17" />
      <line x1="3" y1="10" x2="17" y2="10" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="7" />
      <polyline points="10,6 10,10 13,12" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="10" cy="10" r="3.5" />
      <line x1="10" y1="1.5" x2="10" y2="3.5" />
      <line x1="10" y1="16.5" x2="10" y2="18.5" />
      <line x1="1.5" y1="10" x2="3.5" y2="10" />
      <line x1="16.5" y1="10" x2="18.5" y2="10" />
      <line x1="3.9" y1="3.9" x2="5.3" y2="5.3" />
      <line x1="14.7" y1="14.7" x2="16.1" y2="16.1" />
      <line x1="14.7" y1="5.3" x2="16.1" y2="3.9" />
      <line x1="3.9" y1="16.1" x2="5.3" y2="14.7" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 10.5a6 6 0 1 1-6-6 4.5 4.5 0 0 0 6 6z" />
    </svg>
  )
}

function ChessIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20" fill="currentColor">
      <circle cx="24" cy="11" r="8" />
      <rect x="21" y="17" width="6" height="7" />
      <polygon points="13,38 21,23 27,23 35,38" />
      <rect x="10" y="36" width="28" height="9" rx="3" />
    </svg>
  )
}

interface MainMenuProps {
  onNewGame: () => void
  onToggleTheme: () => void
  boardTheme: BoardTheme
  onBoardThemeChange: (t: BoardTheme) => void
}

export function MainMenu({ onNewGame, onToggleTheme, boardTheme, onBoardThemeChange }: MainMenuProps) {
  const [open, setOpen] = useState(true)
  const theme = useTheme()

  return (
    <div className={`main-menu ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="main-menu-header"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'collapse menu' : 'Expand menu'}
      >
        <span className="main-menu-brand-icon">
          <ChessIcon />
        </span>
        <span className="main-menu-label main-menu-brand-name">
          Everyone Chess
        </span>
        <span className="main-menu-chevron">
          <ChevronIcon open={open} />
        </span>
      </button>

      <button type="button" className="main-menu-item main-menu-item--primary" onClick={onNewGame}>
        <span className="main-menu-icon">
          <PlusIcon />
        </span>
        <span className="main-menu-label">New Game</span>
      </button>

      <button type="button" className="main-menu-item" onClick={onToggleTheme}>
        <span className="main-menu-icon">
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </span>
        <span className="main-menu-label">
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </span>
      </button>

      <div className="main-menu-divider" />

      <div className="main-menu-item main-menu-item--muted">
        <span className="main-menu-icon">
          <HistoryIcon />
        </span>
        <span className="main-menu-label">Game History</span>
      </div>

      <div className="main-menu-spacer" />

      <div className="main-menu-divider" />

      <div className="main-menu-board-theme">
        <div className="main-menu-board-theme-expanded">
          <BoardThemePicker value={boardTheme} onChange={onBoardThemeChange} />
        </div>
        <button type="button" className="main-menu-board-theme-collapsed" onClick={() => setOpen(true)}>
          <div
            className="main-menu-swatch-grid"
            title={BOARD_THEMES[boardTheme].label}
          >
            <div style={{ background: BOARD_THEMES[boardTheme].light.lightSquare }} />
            <div style={{ background: BOARD_THEMES[boardTheme].light.darkSquare }} />
            <div style={{ background: BOARD_THEMES[boardTheme].light.darkSquare }} />
            <div style={{ background: BOARD_THEMES[boardTheme].light.lightSquare }} />
          </div>
        </button>
      </div>
    </div>
  )
}
