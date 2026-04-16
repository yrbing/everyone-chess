import type { BoardTheme } from '@/types'
import { BOARD_THEMES } from '@/types'
import './BoardThemePicker.css'

interface BoardThemePickerProps {
  value: BoardTheme
  onChange: (theme: BoardTheme) => void
}

export function BoardThemePicker({ value, onChange }: BoardThemePickerProps) {
  return (
    <div className="board-theme-picker">
      <div className="board-theme-title">Board</div>
      <div className="board-theme-swatches">
        {(Object.entries(BOARD_THEMES) as [BoardTheme, (typeof BOARD_THEMES)[BoardTheme]][]).map(
          ([key, { label, light }]) => (
            <button
              key={key}
              className={`board-theme-swatch ${value === key ? 'selected' : ''}`}
              onClick={() => onChange(key)}
              title={label}
              aria-label={label}
              aria-pressed={value === key}
            >
              <div className="swatch-grid">
                <div style={{ background: light.lightSquare }} />
                <div style={{ background: light.darkSquare }} />
                <div style={{ background: light.darkSquare }} />
                <div style={{ background: light.lightSquare }} />
              </div>
              <span className="swatch-label">{label}</span>
            </button>
          ),
        )}
      </div>
    </div>
  )
}
