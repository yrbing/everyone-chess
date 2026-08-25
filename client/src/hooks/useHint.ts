import { useEffect, useState } from 'react'
import { Chess } from 'chess.js'
import type { GameMode, PlayerColor } from '@/types'
import { useStockfish } from '@/hooks/useStockfish'

const PIECE_NAMES: Record<string, string> = {
  p: 'Pawn',
  n: 'Knight',
  b: 'Bishop',
  r: 'Rook',
  q: 'Queen',
  k: 'King',
}

export function buildMoveDescription(
  fen: string,
  uci: string,
): { description: string; tag: string | null } {
  const game = new Chess(fen)
  const from = uci.slice(0, 2)
  const to = uci.slice(2, 4)
  const promotion = uci[4]

  const movingPiece = game.get(from as Parameters<typeof game.get>[0])
  const pieceName = movingPiece ? PIECE_NAMES[movingPiece.type] : 'Piece'

  const result = game.move({ from, to, promotion: promotion ?? 'q' })
  if (!result) return { description: `Move to ${to}`, tag: null }

  const isCapture = !!result.captured
  const givesCheck = game.inCheck()
  const isCheckmate = game.isCheckmate()
  const isCastleKing = result.flags.includes('k')
  const isCastleQueen = result.flags.includes('q')
  const isPromotion = !!promotion

  let description = ''
  let tag: string | null = null

  if (isCastleKing) {
    description = 'Castle kingside — tuck your King to safety'
    tag = 'Castling'
  } else if (isCastleQueen) {
    description = 'Castle queenside — tuck your King to safety'
    tag = 'Castling'
  } else if (isPromotion) {
    description = `Promote your Pawn to a Queen on ${to}`
    tag = 'Promotion'
  } else if (isCapture) {
    const capturedName = PIECE_NAMES[result.captured!] ?? 'piece'
    description = `Capture the ${capturedName} on ${to} with your ${pieceName}`
    tag = 'Captures'
  } else {
    const towardCenter = ['c', 'd', 'e', 'f'].includes(to[0])
    const fileDiff = to.charCodeAt(0) - from.charCodeAt(0)
    const rankDiff = parseInt(to[1]) - parseInt(from[1])
    let direction = 'into position'
    if (Math.abs(fileDiff) <= 1 && rankDiff !== 0)
      direction = rankDiff > 0 ? 'forward' : 'backward'
    else if (rankDiff === 0)
      direction = fileDiff > 0 ? 'to the right' : 'to the left'
    description = towardCenter
      ? `Move your ${pieceName} ${direction} toward the center`
      : `Move your ${pieceName} ${direction}`
  }

  if (isCheckmate) {
    tag = 'Checkmate!'
  } else if (givesCheck) {
    description += ' — gives check!'
    tag = tag ?? 'Check'
  }

  return { description, tag }
}

export function formatScoreText(
  score: { type: 'cp' | 'mate'; value: number } | null,
): string {
  if (!score) return ''
  if (score.type === 'mate') {
    return score.value > 0
      ? `Checkmate in ${score.value}`
      : `Opponent has mate in ${Math.abs(score.value)}`
  }
  const v = score.value
  if (v >= 400) return "You're winning"
  if (v >= 150) return 'You have a clear advantage'
  if (v >= 50) return "You're slightly ahead"
  if (v >= -50) return 'Equal position'
  if (v >= -150) return 'Opponent is slightly ahead'
  if (v >= -400) return 'Opponent has a clear advantage'
  return "You're in trouble"
}

export type HintInfo = {
  from: string
  to: string
  score: { type: 'cp' | 'mate'; value: number } | null
  scoreText: string
  continuation: string[]
  description: string
  tag: string | null
  explanation: string | null
}

async function fetchMoveExplanation(
  fen: string,
  uci: string,
  description: string,
): Promise<string> {
  try {
    const response = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen, move: uci, description }),
    })
    if (!response.ok) return ''
    const data = await response.json()
    return data.explanation ?? ''
  } catch {
    return ''
  }
}

export type HintArrow = {
  startSquare: string
  endSquare: string
  color: string
}

interface UseHintParams {
  fen: string
  isComputerThinking: boolean
  isReviewing: boolean
  gameMode: GameMode
  playerColor: PlayerColor
  arrowColor: string
  explainEnabled: boolean
}

export function useHint({
  fen,
  isComputerThinking,
  isReviewing,
  gameMode,
  playerColor,
  arrowColor,
  explainEnabled,
}: UseHintParams) {
  const [hintInfo, setHintInfo] = useState<HintInfo | null>(null)
  const [isHintLoading, setIsHintLoading] = useState(false)
  const [isExplanationLoading, setIsExplanationLoading] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const { getBestMove } = useStockfish()

  useEffect(() => {
    const game = new Chess(fen)
    if (
      gameMode === 'online-player' ||
      (gameMode === 'vs-computer' && game.turn() !== playerColor[0]) ||
      isComputerThinking ||
      game.isGameOver() ||
      isReviewing
    ) {
      setHintInfo(null)
      setIsHintLoading(false)
      setIsExplanationLoading(false)
      return
    }
    let cancelled = false
    setIsHintLoading(true)
    setIsExplanationLoading(false)
    getBestMove(fen, 'hard').then(({ move, pv, score }) => {
      if (cancelled) return
      const tempGame = new Chess(fen)
      const continuation = pv.slice(0, 5).flatMap((uci) => {
        try {
          const m = tempGame.move({
            from: uci.slice(0, 2),
            to: uci.slice(2, 4),
            promotion: uci[4] ?? 'q',
          })
          return [m.san]
        } catch {
          return []
        }
      })
      const { description, tag } = buildMoveDescription(fen, move)
      setHintInfo({
        from: move.slice(0, 2),
        to: move.slice(2, 4),
        score,
        scoreText: formatScoreText(score),
        continuation,
        description,
        tag,
        explanation: null,
      })
      setIsHintLoading(false)

      if (explainEnabled) {
        setIsExplanationLoading(true)
        fetchMoveExplanation(fen, move, description).then((explanation) => {
          if (cancelled) return
          setHintInfo((prev) => (prev ? { ...prev, explanation } : prev))
          setIsExplanationLoading(false)
        })
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, isComputerThinking, isReviewing, gameMode, explainEnabled])

  const arrows: HintArrow[] =
    hintInfo && showHint
      ? [
          {
            startSquare: hintInfo.from,
            endSquare: hintInfo.to,
            color: arrowColor,
          },
        ]
      : []

  return {
    hintInfo,
    isHintLoading,
    isExplanationLoading,
    showHint,
    setShowHint,
    arrows,
  }
}
