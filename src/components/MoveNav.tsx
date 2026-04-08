import './MoveNav.css'

interface MoveNavProps {
  total: number
  viewIndex: number | null
  onPrev: () => void
  onNext: () => void
}

export function MoveNav({ total, viewIndex, onPrev, onNext }: MoveNavProps) {
  const current = viewIndex === null ? total : viewIndex
  const atStart = total === 0 || viewIndex === 0
  const atLive = viewIndex === null

  return (
    <div className="move-nav">
      <button className="move-nav-btn" onClick={onPrev} disabled={atStart}>&#8592;</button>
      <span className="move-nav-counter">{current} / {total}</span>
      <button className="move-nav-btn" onClick={onNext} disabled={atLive}>&#8594;</button>
    </div>
  )
}
