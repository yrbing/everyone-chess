import type { HintInfo } from '../hooks/useHint'
import './HintPanel.css'

interface HintPanelProps {
  hintInfo: HintInfo | null
  isHintLoading: boolean
  showHint: boolean
  onToggleShow: () => void
}

export function HintPanel({
  hintInfo,
  isHintLoading,
  showHint,
  onToggleShow,
}: HintPanelProps) {
  const formatScore = (score: HintInfo['score']) => {
    if (!score) return null
    if (score.type === 'mate') return `M${Math.abs(score.value)}`
    return score.value >= 0
      ? `+${(score.value / 100).toFixed(1)}`
      : `${(score.value / 100).toFixed(1)}`
  }

  return (
    <div className="hint-panel">
      <div className="hint-header">
        <p className="hint-title">Best move</p>
        <button className="hint-toggle" onClick={onToggleShow}>
          {showHint ? 'Hide' : 'Show'}
        </button>
      </div>
      {showHint &&
        (isHintLoading ? (
          <span className="hint-thinking">Thinking…</span>
        ) : (
          <>
            {hintInfo?.score && (
              <span className="hint-score">{formatScore(hintInfo.score)}</span>
            )}
            {hintInfo && hintInfo.continuation.length > 0 && (
              <p className="hint-line">{hintInfo.continuation.join(' ')}</p>
            )}
          </>
        ))}
    </div>
  )
}
