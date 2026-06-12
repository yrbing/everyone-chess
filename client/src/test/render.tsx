import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import type { Theme } from '@/types'
import { ThemeContext } from '@/context/ThemeContext'

// Wraps a component in the ThemeContext so hooks like useTheme() work in tests.
// Defaults to light; pass 'dark' to test dark-mode behavior.
export function renderWithTheme(ui: ReactElement, theme: Theme = 'light') {
  return render(
    <ThemeContext.Provider value={theme}>{ui}</ThemeContext.Provider>,
  )
}
