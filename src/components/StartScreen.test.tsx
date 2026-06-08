import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StartScreen } from '@/components/StartScreen'

describe('StartScreen', () => {
  it('renders the three game modes, with online disabled', () => {
    render(<StartScreen onStart={() => {}} onClose={() => {}} />)
    expect(screen.getByText('Play against AI')).toBeInTheDocument()
    expect(screen.getByText('Play both sides')).toBeInTheDocument()
    // The "online" mode card is disabled — climb from its text to the button.
    expect(
      screen.getByText('Play online (coming soon)').closest('button'),
    ).toBeDisabled()
  })

  it('starts a vs-computer game with the chosen difficulty and color', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(<StartScreen onStart={onStart} onClose={() => {}} />)

    await user.click(screen.getByText('Easy'))
    await user.click(screen.getByText('Black'))
    await user.click(screen.getByRole('button', { name: 'Start Game' }))

    expect(onStart).toHaveBeenCalledWith('easy', 'vs-computer', 'black')
  })

  it('hides difficulty/color when not playing the computer', async () => {
    const user = userEvent.setup()
    render(<StartScreen onStart={() => {}} onClose={() => {}} />)

    expect(screen.getByText('Difficulty Level')).toBeInTheDocument()
    await user.click(screen.getByText('Play both sides')) // switch to two-player
    expect(screen.queryByText('Difficulty Level')).not.toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<StartScreen onStart={() => {}} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
