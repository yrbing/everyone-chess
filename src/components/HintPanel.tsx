import type { HintInfo } from '../hooks/useHint'
import './HintPanel.css'

interface HintPanelProps {
  status: string
  hintInfo: HintInfo | null
  isHintLoading: boolean
  showHint: boolean
  onToggleShow: () => void
}

export function HintPanel({
  status,
  hintInfo,
  isHintLoading,
  showHint,
  onToggleShow,
}: HintPanelProps) {
  const isMateGood = hintInfo?.score?.type === 'mate' && hintInfo.score.value > 0
  const isMateBlack = hintInfo?.score?.type === 'mate' && hintInfo.score.value < 0
  const scoreClass = isMateGood
    ? 'hint-score hint-score--great'
    : isMateBlack
      ? 'hint-score hint-score--bad'
      : hintInfo?.score?.type === 'cp'
        ? hintInfo.score.value >= 50
          ? 'hint-score hint-score--good'
          : hintInfo.score.value <= -50
            ? 'hint-score hint-score--bad'
            : 'hint-score hint-score--neutral'
        : 'hint-score'

  const hintAvailable = !isHintLoading && hintInfo

  return (
    <div className="hint-panel">
      <div className="hint-status">{status}</div>

      {hintAvailable && (
        <>
          <div className="hint-divider" />
          <div className="hint-header">
            <p className="hint-title">Best move</p>
            <button className="hint-toggle" onClick={onToggleShow}>
              {showHint ? 'Hide' : 'Show'}
            </button>
          </div>
        </>
      )}

      {isHintLoading && (
        <>
          <div className="hint-divider" />
          <span className="hint-thinking">Analysing position…</span>
        </>
      )}

      {hintAvailable && showHint && (
        <>
          {hintInfo.tag && <span className="hint-tag">{hintInfo.tag}</span>}
          <p className="hint-description">{hintInfo.description}</p>
          {hintInfo.scoreText && (
            <span className={scoreClass}>{hintInfo.scoreText}</span>
          )}
          {hintInfo.continuation.length > 0 && (
            <details className="hint-line-details">
              <summary className="hint-line-summary">See best line</summary>
              <p className="hint-line">{hintInfo.continuation.join(' ')}</p>
            </details>
          )}
        </>
      )}
    </div>
  )
}
