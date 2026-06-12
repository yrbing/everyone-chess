import { render, screen } from '@testing-library/react'
import { Controls } from '@/components/Controls'
import { DIFFICULTY_CONFIGS } from '@/types'

describe('Controls', () => {
  it('shows the difficulty label', () => {
    render(<Controls difficulty="medium" />)
    expect(
      screen.getByText(DIFFICULTY_CONFIGS.medium.label),
    ).toBeInTheDocument()
  })
})
