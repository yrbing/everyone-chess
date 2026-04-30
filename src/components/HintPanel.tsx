import type { HintInfo } from '../hooks/useHint'
import './HintPanel.css'

interface HintPanelProps {
  status: string
  hintInfo: HintInfo | null
  isHintLoading: boolean
  isExplanationLoading: boolean
  showHint: boolean
  onToggleShow: () => void
  explainEnabled: boolean
  onToggleExplain: () => void
}

export function HintPanel({
  status,
  hintInfo,
  isHintLoading,
  isExplanationLoading,
  showHint,
  onToggleShow,
  explainEnabled,
  onToggleExplain,
}: HintPanelProps) {
  const isMateGood =
    hintInfo?.score?.type === 'mate' && hintInfo.score.value > 0
  const isMateBlack =
    hintInfo?.score?.type === 'mate' && hintInfo.score.value < 0
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
      <div className="hint-divider" />

      {hintAvailable && (
        <>
          <div className="hint-header">
            <p className="hint-title">Best move</p>
            <span className="hint-toggle-row">
              Explain
              <button
                type="button"
                className="ec-toggle"
                aria-pressed={explainEnabled}
                aria-label={
                  explainEnabled ? 'Disable explanations' : 'Enable explanations'
                }
                onClick={onToggleExplain}
              >
                <span className="knob" />
              </button>
            </span>
            <button
              type="button"
              className="btn-ghost hint-show-btn"
              onClick={onToggleShow}
            >
              {showHint ? 'Hide' : 'Show'}
            </button>
          </div>
        </>
      )}

      {isHintLoading && (
        <>
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
          {explainEnabled && (
            <div className="hint-explanation-wrapper">
              {isExplanationLoading && !hintInfo.explanation && (
                <p className="hint-explanation hint-explanation--loading">Understanding why…</p>
              )}
              {hintInfo.explanation && (
                <p className="hint-explanation">{hintInfo.explanation}</p>
              )}
            </div>
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
