import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StartScreen } from '@/components/StartScreen'

describe('StartScreen', () => {
  const onlineProps = {
    onCreateRoom: () => {},
    onJoinRoom: () => {},
    roomCode: null,
    onlineError: null,
  }

  it('renders the three game modes, with online enabled', () => {
    render(<StartScreen onStart={() => {}} onClose={() => {}} {...onlineProps} />)
    expect(screen.getByText('Play against AI')).toBeInTheDocument()
    expect(screen.getByText('Play both sides')).toBeInTheDocument()
    expect(screen.getByText('Play online').closest('button')).toBeEnabled()
  })

  it('starts a vs-computer game with the chosen difficulty and color', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(
      <StartScreen onStart={onStart} onClose={() => {}} {...onlineProps} />,
    )

    await user.click(screen.getByText('Easy'))
    await user.click(screen.getByText('Black'))
    await user.click(screen.getByRole('button', { name: 'Start Game' }))

    expect(onStart).toHaveBeenCalledWith('easy', 'vs-computer', 'black')
  })

  it('hides difficulty/color when not playing the computer', async () => {
    const user = userEvent.setup()
    render(<StartScreen onStart={() => {}} onClose={() => {}} {...onlineProps} />)

    expect(screen.getByText('Difficulty Level')).toBeInTheDocument()
    await user.click(screen.getByText('Play both sides')) // switch to two-player
    expect(screen.queryByText('Difficulty Level')).not.toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<StartScreen onStart={() => {}} onClose={onClose} {...onlineProps} />)
    await user.click(screen.getByRole('button', { name: 'Close dialog' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('creates a room and shows the code while waiting', async () => {
    const user = userEvent.setup()
    const onCreateRoom = vi.fn()
    render(
      <StartScreen
        onStart={() => {}}
        onClose={() => {}}
        {...onlineProps}
        onCreateRoom={onCreateRoom}
      />,
    )

    await user.click(screen.getByText('Play online'))
    await user.click(screen.getByRole('button', { name: 'Create Game' }))
    expect(onCreateRoom).toHaveBeenCalledTimes(1)
  })

  it('joins a room with an entered code', async () => {
    const user = userEvent.setup()
    const onJoinRoom = vi.fn()
    render(
      <StartScreen
        onStart={() => {}}
        onClose={() => {}}
        {...onlineProps}
        onJoinRoom={onJoinRoom}
      />,
    )

    await user.click(screen.getByText('Play online'))
    await user.click(screen.getByText('Join Room'))
    await user.type(screen.getByPlaceholderText('Enter room code'), 'abcd')
    await user.click(screen.getByRole('button', { name: 'Join' }))
    expect(onJoinRoom).toHaveBeenCalledWith('ABCD')
  })
})
