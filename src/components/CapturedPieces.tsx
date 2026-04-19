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
  color: 'w' | 'b'
  advantage: number
}

export function CapturedPieces({ pieces, color, advantage }: CapturedPiecesProps) {
  const sorted = [...pieces].sort(
    (a, b) => (SORT_ORDER[a] ?? 99) - (SORT_ORDER[b] ?? 99),
  )

  return (
    <div className="captured-tray">
      <span className="captured-icons">
        {sorted.map((p, i) => (
          <span key={i}>{SYMBOLS[p]?.[color] ?? ''}</span>
        ))}
      </span>
      {advantage > 0 && (
        <span className="captured-advantage">+{advantage}</span>
      )}
    </div>
  )
}
