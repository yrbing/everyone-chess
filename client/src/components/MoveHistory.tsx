import { useEffect, useRef } from 'react'
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
  const listRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  // Scroll only the inner list container — never scrollIntoView, which would
  // also scroll the whole page (jumps to the bottom on mobile).
  useEffect(() => {
    const list = listRef.current
    if (!list) return

    if (viewIndex === null) {
      list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
      return
    }

    const pairIndex = Math.floor((viewIndex - 1) / 2)
    const row = rowRefs.current[pairIndex]
    if (!row) return

    const top = row.offsetTop
    const bottom = top + row.offsetHeight
    if (top < list.scrollTop) {
      list.scrollTo({ top, behavior: 'smooth' })
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: bottom - list.clientHeight, behavior: 'smooth' })
    }
  }, [viewIndex, history])

  const pairs: [string, string | undefined][] = []
  for (let i = 0; i < history.length; i += 2) {
    pairs.push([history[i], history[i + 1]])
  }

  const atStart = total === 0 || viewIndex === 0
  const atLive = viewIndex === null

  return (
    <div className="mh">
      <div className="mh-t">
        MOVES
        <span>{Math.ceil(total / 2)} PAIRS</span>
      </div>
      <div className="mh-rows" ref={listRef}>
        {pairs.length === 0 ? (
          <p className="mh-empty">No moves yet</p>
        ) : (
          pairs.map(([white, black], i) => (
            <div
              key={i}
              className="mh-r"
              ref={(el) => {
                rowRefs.current[i] = el
              }}
            >
              <span className="mh-n">{i + 1}.</span>
              <span className={viewIndex === i * 2 + 1 ? 'mh-a' : 'mh-w'}>
                {white}
              </span>
              <span className={viewIndex === i * 2 + 2 ? 'mh-a' : 'mh-b'}>
                {black ?? ''}
              </span>
            </div>
          ))
        )}
      </div>
      <div className="mh-nv">
        <button
          type="button"
          className="mh-bt"
          onClick={onBeginning}
          disabled={atStart}
          aria-label="Go to start"
        >
          {'⏮'}
        </button>
        <button
          type="button"
          className="mh-bt"
          onClick={onPrev}
          disabled={atStart}
          aria-label="Previous move"
        >
          {'◀'}
        </button>
        <button
          type="button"
          className="mh-bt"
          onClick={onNext}
          disabled={atLive}
          aria-label="Next move"
        >
          {'▶'}
        </button>
        <button
          type="button"
          className="mh-bt"
          onClick={onCurrent}
          disabled={atLive}
          aria-label="Go to latest"
        >
          {'⏭'}
        </button>
      </div>
    </div>
  )
}
