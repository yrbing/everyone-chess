export type Theme = 'light' | 'dark'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type GameMode = 'vs-computer' | 'two-player' | 'online-player'
export type PlayerColor = 'white' | 'black'
export type BoardTheme =
  | 'classic'
  | 'midnight'
  | 'forest'
  | 'ocean'
  | 'walnut'
  | 'slate'

export interface BoardSquares {
  lightSquare: string
  darkSquare: string
  arrowColor: string
  highlightFrom: string
  highlightTo: string
  selectColor: string
  legalMoveColor: string
}

export interface BoardThemeConfig {
  label: string
  light: BoardSquares
  dark: BoardSquares
}

export const BOARD_THEMES: Record<BoardTheme, BoardThemeConfig> = {
  classic: {
    label: 'Classic',
    light: { lightSquare: '#f0d9b5', darkSquare: '#b58863', arrowColor: 'rgba(0, 160, 80, 0.8)',    highlightFrom: 'rgba(255, 170, 0, 0.35)', highlightTo: 'rgba(255, 170, 0, 0.6)',  selectColor: 'rgba(255, 255, 0, 0.45)', legalMoveColor: 'rgba(0, 180, 60, 0.25)'  },
    dark:  { lightSquare: '#d4b896', darkSquare: '#8c6239', arrowColor: 'rgba(0, 210, 100, 0.85)',  highlightFrom: 'rgba(255, 190, 0, 0.4)',  highlightTo: 'rgba(255, 190, 0, 0.65)', selectColor: 'rgba(255, 255, 0, 0.5)',  legalMoveColor: 'rgba(0, 210, 80, 0.3)'  },
  },
  midnight: {
    label: 'Midnight',
    light: { lightSquare: '#adc8e8', darkSquare: '#4a7fcb', arrowColor: 'rgba(255, 180, 0, 0.85)', highlightFrom: 'rgba(0, 220, 255, 0.3)',   highlightTo: 'rgba(0, 220, 255, 0.55)', selectColor: 'rgba(0, 255, 255, 0.4)',  legalMoveColor: 'rgba(255, 220, 0, 0.25)' },
    dark:  { lightSquare: '#4a7fcb', darkSquare: '#0f3460', arrowColor: 'rgba(255, 220, 50, 0.9)',  highlightFrom: 'rgba(0, 240, 255, 0.35)',  highlightTo: 'rgba(0, 240, 255, 0.65)', selectColor: 'rgba(0, 255, 255, 0.45)', legalMoveColor: 'rgba(255, 240, 0, 0.3)'  },
  },
  forest: {
    label: 'Forest',
    light: { lightSquare: '#ffffdd', darkSquare: '#86a666', arrowColor: 'rgba(200, 80, 0, 0.85)',   highlightFrom: 'rgba(200, 255, 0, 0.3)',   highlightTo: 'rgba(200, 255, 0, 0.55)', selectColor: 'rgba(255, 200, 0, 0.45)', legalMoveColor: 'rgba(220, 80, 0, 0.2)'   },
    dark:  { lightSquare: '#c8d8a8', darkSquare: '#4a7040', arrowColor: 'rgba(255, 120, 20, 0.9)',  highlightFrom: 'rgba(220, 255, 0, 0.35)',  highlightTo: 'rgba(220, 255, 0, 0.6)',  selectColor: 'rgba(255, 220, 0, 0.5)',  legalMoveColor: 'rgba(255, 100, 0, 0.25)' },
  },
  ocean: {
    label: 'Ocean',
    light: { lightSquare: '#daeef7', darkSquare: '#4a90b8', arrowColor: 'rgba(220, 70, 50, 0.85)',  highlightFrom: 'rgba(255, 160, 0, 0.3)',   highlightTo: 'rgba(255, 160, 0, 0.55)', selectColor: 'rgba(255, 140, 0, 0.4)',  legalMoveColor: 'rgba(220, 60, 40, 0.2)'  },
    dark:  { lightSquare: '#4a90b8', darkSquare: '#1a5070', arrowColor: 'rgba(255, 110, 80, 0.9)',  highlightFrom: 'rgba(255, 180, 0, 0.35)',  highlightTo: 'rgba(255, 180, 0, 0.65)', selectColor: 'rgba(255, 160, 0, 0.5)',  legalMoveColor: 'rgba(255, 80, 60, 0.25)' },
  },
  walnut: {
    label: 'Walnut',
    light: { lightSquare: '#f2d9a0', darkSquare: '#8b5e3c', arrowColor: 'rgba(0, 170, 170, 0.85)', highlightFrom: 'rgba(0, 200, 220, 0.3)',   highlightTo: 'rgba(0, 200, 220, 0.55)', selectColor: 'rgba(0, 210, 210, 0.4)',  legalMoveColor: 'rgba(0, 160, 160, 0.22)' },
    dark:  { lightSquare: '#c8a870', darkSquare: '#5c3a20', arrowColor: 'rgba(0, 220, 210, 0.9)',   highlightFrom: 'rgba(0, 220, 240, 0.35)',  highlightTo: 'rgba(0, 220, 240, 0.65)', selectColor: 'rgba(0, 230, 220, 0.5)',  legalMoveColor: 'rgba(0, 190, 180, 0.28)' },
  },
  slate: {
    label: 'Slate',
    light: { lightSquare: '#e0e0e0', darkSquare: '#7a7a7a', arrowColor: 'rgba(110, 60, 200, 0.85)', highlightFrom: 'rgba(160, 80, 255, 0.3)',  highlightTo: 'rgba(160, 80, 255, 0.55)', selectColor: 'rgba(150, 60, 255, 0.4)',  legalMoveColor: 'rgba(120, 50, 220, 0.2)'  },
    dark:  { lightSquare: '#a0a0a0', darkSquare: '#484848', arrowColor: 'rgba(160, 100, 255, 0.9)', highlightFrom: 'rgba(180, 100, 255, 0.35)', highlightTo: 'rgba(180, 100, 255, 0.65)', selectColor: 'rgba(170, 80, 255, 0.5)',  legalMoveColor: 'rgba(150, 70, 255, 0.28)' },
  },
}

export interface DifficultyConfig {
  label: string
  description: string
  eloDisplay: string
  elo: number | null // null = full strength
  movetime: number
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'Easy',
    description: 'Great for beginners',
    eloDisplay: '~400 Elo',
    elo: 400,
    movetime: 50,
  },
  medium: {
    label: 'Medium',
    description: 'A solid challenge',
    eloDisplay: '~1500 Elo',
    elo: 1500,
    movetime: 500,
  },
  hard: {
    label: 'Hard',
    description: 'Near-perfect play',
    eloDisplay: '~2800 Elo',
    elo: null,
    movetime: 1500,
  },
}
