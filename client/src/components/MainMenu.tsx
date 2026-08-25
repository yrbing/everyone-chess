import { useEffect, useState } from 'react'
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  LogOut,
  Menu,
  Moon,
  Plus,
  Puzzle,
  Star,
  Sun,
  X,
} from 'lucide-react'
import type { BoardTheme } from '@/types'
import { BoardThemePicker } from '@/components/BoardThemePicker'
import { LoginScreen } from '@/components/LoginScreen'
import { useAuth } from '@/hooks/useAuth'
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
  const { user, login, signup, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authPending, setAuthPending] = useState(false)
  const [authError, setAuthError] = useState('')
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true',
  )

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(collapsed))
  }, [collapsed])

  const closeMenu = () => setOpen(false)

  const handleNewGame = () => {
    closeMenu()
    onNewGame()
  }

  const closeAuth = () => {
    setAuthOpen(false)
    setAuthError('')
  }

  const handleLogout = async () => {
    if (!confirm('Log out?')) return
    try {
      await logout()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSignIn = async ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => {
    setAuthError('')
    setAuthPending(true)
    try {
      await login(email, password)
      closeAuth()
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message.toUpperCase()
          : 'SOMETHING WENT WRONG',
      )
    } finally {
      setAuthPending(false)
    }
  }

  const handleSignUp = async ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => {
    setAuthError('')
    setAuthPending(true)
    try {
      await signup(email, password)
      closeAuth()
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message.toUpperCase()
          : 'SOMETHING WENT WRONG',
      )
    } finally {
      setAuthPending(false)
    }
  }

  return (
    <>
      <header className="app-topbar">
        <button
          type="button"
          className="app-topbar-btn"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <span className="app-topbar-brand">
          Everyone <span className="main-menu-brand-accent">Chess</span>
        </span>
      </header>

      {open && (
        <div
          className="main-menu-backdrop"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <nav
        className={`main-menu${collapsed ? ' main-menu--collapsed' : ''}${
          open ? ' main-menu--open' : ''
        }`}
      >
        <button
          type="button"
          className="main-menu-close"
          onClick={closeMenu}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        <button
          type="button"
          className="main-menu-fold"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-pressed={collapsed}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        <button
          type="button"
          className="main-menu-brand"
          onClick={() => setCollapsed((v) => !v)}
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
          onClick={handleNewGame}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="main-menu-label">New Game</span>
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
          <span className="main-menu-label">Puzzles</span>
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
          <span className="main-menu-label">Lessons</span>
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
          <span className="main-menu-label">History</span>
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
          <span className="main-menu-label">Favorites</span>
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
          <span className="main-menu-label">
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </button>

        <div className="main-menu-board">
          <BoardThemePicker value={boardTheme} onChange={onBoardThemeChange} />
        </div>

        <div className="main-menu-spacer" />

        {user ? (
          <div className="main-menu-footer">
            <div className="main-menu-avatar">
              {user.email[0].toUpperCase()}
            </div>
            <div className="main-menu-who">
              <div className="main-menu-who-name">{user.email}</div>
            </div>
            <button
              type="button"
              className="main-menu-logout"
              onClick={handleLogout}
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="main-menu-footer main-menu-footer--btn"
            onClick={() => setAuthOpen(true)}
          >
            <div className="main-menu-avatar">L</div>
            <div className="main-menu-who">
              <div className="main-menu-who-name">log in / sign up</div>
            </div>
          </button>
        )}
      </nav>

      {authOpen && (
        <LoginScreen
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onGuest={closeAuth}
          onClose={closeAuth}
          onTabChange={() => setAuthError('')}
          error={authError}
          pending={authPending}
        />
      )}
    </>
  )
}
