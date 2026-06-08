import type { ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { ThemeContext } from '@/context/ThemeContext'
import { useTheme } from '@/hooks/useTheme'

describe('useTheme', () => {
  it('returns the theme value from the nearest provider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current).toBe('dark')
  })

  it('throws when used outside a ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within a ThemeProvider',
    )
  })
})
