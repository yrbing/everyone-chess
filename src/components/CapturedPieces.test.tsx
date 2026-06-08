import { render, screen } from '@testing-library/react'
import { CapturedPieces } from '@/components/CapturedPieces'

describe('CapturedPieces', () => {
  it('renders captured pieces sorted by value (pawn first)', () => {
    const { container } = render(
      <CapturedPieces pieces={['q', 'p', 'n']} color="w" advantage={0} />,
    )
    const icons = container.querySelector('.captured-icons')
    // sorted to p, n, q  →  ♙ ♘ ♕
    expect(icons?.textContent).toBe('♙♘♕')
  })

  it('uses the black glyphs when color is black', () => {
    const { container } = render(
      <CapturedPieces pieces={['p']} color="b" advantage={0} />,
    )
    expect(container.querySelector('.captured-icons')?.textContent).toBe('♟')
  })

  it('shows the material advantage badge when ahead', () => {
    render(<CapturedPieces pieces={['q']} color="w" advantage={9} />)
    expect(screen.getByText('+9')).toBeInTheDocument()
  })

  it('hides the advantage badge when not ahead', () => {
    render(<CapturedPieces pieces={['q']} color="w" advantage={0} />)

    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
  })
})
