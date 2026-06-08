import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MoveHistory } from '@/components/MoveHistory'

// jsdom doesn't implement Element.scrollTo, and MoveHistory's effect calls it.
// Stub it so the effect runs without crashing.
beforeAll(() => {
  Element.prototype.scrollTo = vi.fn()
})

const noop = () => {}

describe('MoveHistory', () => {
  it('shows an empty state when there are no moves', () => {
    render(
      <MoveHistory
        history={[]}
        viewIndex={null}
        total={0}
        onPrev={noop}
        onNext={noop}
        onBeginning={noop}
        onCurrent={noop}
      />,
    )
    expect(screen.getByText('No moves yet')).toBeInTheDocument()
  })

  it('renders moves in numbered pairs', () => {
    render(
      <MoveHistory
        history={['e4', 'e5', 'Nf3']}
        viewIndex={null}
        total={3}
        onPrev={noop}
        onNext={noop}
        onBeginning={noop}
        onCurrent={noop}
      />,
    )
    expect(screen.getByText('e4')).toBeInTheDocument()
    expect(screen.getByText('e5')).toBeInTheDocument()
    expect(screen.getByText('Nf3')).toBeInTheDocument()
    expect(screen.getByText('1.')).toBeInTheDocument()
    expect(screen.getByText('2.')).toBeInTheDocument()
  })

  it('calls the right callback for each nav button', async () => {
    const user = userEvent.setup()
    const onBeginning = vi.fn()
    const onPrev = vi.fn()
    const onNext = vi.fn()
    const onCurrent = vi.fn()
    render(
      <MoveHistory
        history={['e4', 'e5']}
        viewIndex={1}
        total={2}
        onPrev={onPrev}
        onNext={onNext}
        onBeginning={onBeginning}
        onCurrent={onCurrent}
      />,
    )
    await user.click(screen.getByLabelText('Go to start'))
    await user.click(screen.getByLabelText('Previous move'))
    await user.click(screen.getByLabelText('Next move'))
    await user.click(screen.getByLabelText('Go to latest'))
    expect(onBeginning).toHaveBeenCalledTimes(1)
    expect(onPrev).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(onCurrent).toHaveBeenCalledTimes(1)
  })

  it('disables navigation based on position', () => {
    const { rerender } = render(
      <MoveHistory
        history={['e4', 'e5']}
        viewIndex={null} /* live view */
        total={2}
        onPrev={noop}
        onNext={noop}
        onBeginning={noop}
        onCurrent={noop}
      />,
    )

    expect(screen.getByRole('button', { name: 'Next move' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Go to latest' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Go to start' })).toBeEnabled()

    rerender(
      <MoveHistory
        history={['e4', 'e5']}
        viewIndex={0} /* at start */
        total={2}
        onPrev={noop}
        onNext={noop}
        onBeginning={noop}
        onCurrent={noop}
      />,
    )

    expect(screen.getByRole('button', { name: 'Go to start' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous move' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next move' })).toBeEnabled()
  })
})
