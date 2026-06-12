import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HintPanel } from '@/components/HintPanel'
import type { HintInfo } from '@/hooks/useHint'

const hint: HintInfo = {
  from: 'e2',
  to: 'e4',
  score: { type: 'cp', value: 120 },
  scoreText: 'You have a clear advantage',
  continuation: ['e4', 'e5', 'Nf3'],
  description: 'Move your Pawn forward toward the center',
  tag: 'Captures',
  explanation: null,
}

const baseProps = {
  status: 'Your turn',
  hintInfo: null as HintInfo | null,
  isHintLoading: false,
  isExplanationLoading: false,
  showHint: true,
  onToggleShow: () => {},
  explainEnabled: false,
  onToggleExplain: () => {},
}

describe('HintPanel', () => {
  it('always shows the status', () => {
    render(<HintPanel {...baseProps} status="White's turn" />)
    expect(screen.getByText("White's turn")).toBeInTheDocument()
  })

  it('shows a loading message while analysing', () => {
    render(<HintPanel {...baseProps} isHintLoading={true} />)
    expect(screen.getByText('Analysing position…')).toBeInTheDocument()
    expect(screen.queryByText('Best move')).not.toBeInTheDocument()
  })

  it('renders hint details (tag, description, score) when shown', () => {
    render(<HintPanel {...baseProps} hintInfo={hint} />)
    expect(screen.getByText('Best move')).toBeInTheDocument()
    expect(screen.getByText('Captures')).toBeInTheDocument()
    expect(screen.getByText(hint.description)).toBeInTheDocument()
    // cp 120 ≥ 50  →  the "good" score color class
    expect(screen.getByText('You have a clear advantage')).toHaveClass(
      'hint-score--good',
    )
    expect(screen.getByText('See best line')).toBeInTheDocument()
  })

  it('hides the details when showHint is false', () => {
    render(<HintPanel {...baseProps} hintInfo={hint} showHint={false} />)
    expect(screen.getByText('Show')).toBeInTheDocument()
    expect(screen.queryByText(hint.description)).not.toBeInTheDocument()
  })

  it('fires the toggle callbacks', async () => {
    const user = userEvent.setup()
    const onToggleShow = vi.fn()
    const onToggleExplain = vi.fn()
    render(
      <HintPanel
        {...baseProps}
        hintInfo={hint}
        onToggleShow={onToggleShow}
        onToggleExplain={onToggleExplain}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Hide' }))
    await user.click(
      screen.getByRole('button', { name: 'Enable explanations' }),
    )
    expect(onToggleShow).toHaveBeenCalledTimes(1)
    expect(onToggleExplain).toHaveBeenCalledTimes(1)
  })
})
