import { useEffect, useRef } from 'react'
import { SkipBack, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react'
import './MoveHistory.css'

interface MoveHistoryProps {
  history: string[]
  viewIndex: number | null
  total: number
  onPrev: () => void
  onNext: () => void
  onBeginning: () => void
  onCurrent: () => void
}

export function MoveHistory({
  history,
  viewIndex,
  total,
  onPrev,
  onNext,
  onBeginning,
  onCurrent,
}: MoveHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (viewIndex === null) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else {
      const pairIndex = Math.floor((viewIndex - 1) / 2)
      rowRefs.current[pairIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [viewIndex, history])

  const pairs: [string, string | undefined][] = []
  for (let i = 0; i < history.length; i += 2) {
    pairs.push([history[i], history[i + 1]])
  }

  const atStart = total === 0 || viewIndex === 0
  const atLive = viewIndex === null

  return (
    <div className="move-history">
      <h3 className="move-history-title">Move History</h3>
      <div className="move-history-list">
        {pairs.length === 0 ? (
          <p className="move-history-empty">No moves yet</p>
        ) : (
          pairs.map(([white, black], i) => (
            <div
              key={i}
              className="move-row"
              ref={(el) => {
                rowRefs.current[i] = el
              }}
            >
              <span className="move-number">{i + 1}.</span>
              <span
                className={`move-white ${viewIndex === i * 2 + 1 ? 'move-active' : ''}`}
              >
                {white}
              </span>
              <span
                className={`move-black ${viewIndex === i * 2 + 2 ? 'move-active' : ''}`}
              >
                {black ?? ''}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className="move-history-nav">
        <button
          className="move-nav-btn"
          onClick={onBeginning}
          disabled={atStart}
        >
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
    </div>
  )
}
