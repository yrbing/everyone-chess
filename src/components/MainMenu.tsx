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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 384 512"
      width="16"
      height="16"
      fill="currentColor"
    >
      <path d="M32 391.6V416H352V224c0-106-86-192-192-192H12.9C5.8 32 0 37.8 0 44.9c0 2 .5 4 1.4 5.8L16 80 9.4 86.6c-6 6-9.4 14.1-9.4 22.6V242.3c0 13.1 8 24.9 20.1 29.7l46.5 18.6c8.5 3.4 18 3 26.2-1.1l6.6-3.3c8-4 14-11.2 16.5-19.8l8.3-28.9c2.5-8.6 8.4-15.8 16.5-19.8L160 208v40.4c0 24.2-13.7 46.4-35.4 57.2L67.4 334.3C45.7 345.2 32 367.3 32 391.6zM72 148c0 11-9 20-20 20s-20-9-20-20s9-20 20-20s20 9 20 20zM352 448H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H352c17.7 0 32-14.3 32-32s-14.3-32-32-32z" />
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
