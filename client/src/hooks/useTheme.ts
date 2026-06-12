import { useContext } from 'react'
import type { Theme } from '@/types'
import { ThemeContext } from '@/context/ThemeContext'

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext)
  if (ctx === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
