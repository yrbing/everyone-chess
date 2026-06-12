import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BoardThemePicker } from '@/components/BoardThemePicker'
import { BOARD_THEMES } from '@/types'

describe('BoardThemePicker', () => {
  it('renders one swatch per board theme', () => {
    render(<BoardThemePicker value="classic" onChange={() => {}} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(Object.keys(BOARD_THEMES).length)
  })

  it('marks the selected theme as pressed', () => {
    render(<BoardThemePicker value="midnight" onChange={() => {}} />)
    // query by accessibility. The "name" comes from the component's aria-label={label}.
    expect(screen.getByRole('button', { name: 'Midnight' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Classic' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('calls onChange with the theme key when a swatch is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<BoardThemePicker value="classic" onChange={onChange} />)

    // user-event simulates the full sequence a real click involves (pointer down, focus, mouse up, click…) and lets React flush its updates — that's asynchronous.
    await user.click(screen.getByRole('button', { name: 'Forest' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('forest')
  })
})
