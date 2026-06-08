import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '@/test/render'
import { MainMenu } from '@/components/MainMenu'

const noop = () => {}

describe('MainMenu', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('calls onNewGame when the New Game button is clicked', async () => {
    const user = userEvent.setup()
    const onNewGame = vi.fn()
    renderWithTheme(
      <MainMenu
        onNewGame={onNewGame}
        onToggleTheme={noop}
        boardTheme="classic"
        onBoardThemeChange={noop}
      />,
    )
    // aria-label is an override, needed only when there's no visible text to name the element — i.e., icon-only buttons.
    // A button that already shows readable text gets its name for free from that text.
    await user.click(screen.getByRole('button', { name: 'New Game' }))
    expect(onNewGame).toHaveBeenCalledTimes(1)
  })

  it('shows "Dark Mode" in light theme and toggles on click', async () => {
    const user = userEvent.setup()
    const onToggleTheme = vi.fn()
    renderWithTheme(
      <MainMenu
        onNewGame={noop}
        onToggleTheme={onToggleTheme}
        boardTheme="classic"
        onBoardThemeChange={noop}
      />,
      'light',
    )
    await user.click(screen.getByRole('button', { name: 'Dark Mode' }))
    expect(onToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('shows "Light Mode" when the theme is dark', () => {
    renderWithTheme(
      <MainMenu
        onNewGame={noop}
        onToggleTheme={noop}
        boardTheme="classic"
        onBoardThemeChange={noop}
      />,
      'dark',
    )
    expect(
      screen.getByRole('button', { name: 'Light Mode' }),
    ).toBeInTheDocument()
  })

  it('persists the collapsed state to localStorage', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <MainMenu
        onNewGame={noop}
        onToggleTheme={noop}
        boardTheme="classic"
        onBoardThemeChange={noop}
      />,
    )
    // Starts expanded, so the fold button offers to "Collapse sidebar".
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(localStorage.getItem('sidebarCollapsed')).toBe('true')
  })
})
