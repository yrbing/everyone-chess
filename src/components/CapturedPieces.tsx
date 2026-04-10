import './CapturedPieces.css'

const SYMBOLS: Record<string, { w: string; b: string }> = {
  p: { w: '♙', b: '♟' },
  n: { w: '♘', b: '♞' },
  b: { w: '♗', b: '♝' },
  r: { w: '♖', b: '♜' },
  q: { w: '♕', b: '♛' },
}

const SORT_ORDER: Record<string, number> = { p: 0, n: 1, b: 2, r: 3, q: 4 }

interface CapturedPiecesProps {
  pieces: string[]
  capturedColor: 'w' | 'b'
  advantage: number
}

export function CapturedPieces({
  pieces,
  capturedColor,
  advantage,
}: CapturedPiecesProps) {
  const sorted = [...pieces].sort((a, b) => SORT_ORDER[a] - SORT_ORDER[b])

  return (
    <div className="captured-pieces">
      <span className="captured-icons">
        {sorted.map((p, i) => (
          <span key={i}>{SYMBOLS[p]?.[capturedColor] ?? ''}</span>
        ))}
      </span>
      {advantage > 0 && (
        <span className="captured-advantage">+{advantage}</span>
      )}
    </div>
  )
}
