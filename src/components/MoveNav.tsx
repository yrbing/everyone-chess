import { SkipBack, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react'
import './MoveNav.css'

interface MoveNavProps {
  total: number
  viewIndex: number | null
  onPrev: () => void
  onNext: () => void
  onBeginning: () => void
  onCurrent: () => void
}

export function MoveNav({
  total,
  viewIndex,
  onPrev,
  onNext,
  onBeginning,
  onCurrent,
}: MoveNavProps) {
  const atStart = total === 0 || viewIndex === 0
  const atLive = viewIndex === null

  return (
    <div className="move-nav">
      <button className="move-nav-btn" onClick={onBeginning} disabled={atStart}>
        <SkipBack size={16} />
      </button>
      <button className="move-nav-btn" onClick={onPrev} disabled={atStart}>
        <ChevronLeft size={16} />
      </button>
      <button className="move-nav-btn" onClick={onNext} disabled={atLive}>
        <ChevronRight size={16} />
      </button>
      <button className="move-nav-btn" onClick={onCurrent} disabled={atLive}>
        <SkipForward size={16} />
      </button>
    </div>
  )
}
