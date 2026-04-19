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

function buildMoveDescription(fen: string, uci: string): { description: string; tag: string | null } {
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
    description = `Move your ${pieceName} from ${from} to ${to}`
  }

  if (isCheckmate) {
    tag = 'Checkmate!'
  } else if (givesCheck) {
    description += ' — gives check!'
    tag = tag ?? 'Check'
  }

  return { description, tag }
}

function formatScoreText(score: { type: 'cp' | 'mate'; value: number } | null): string {
  if (!score) return ''
  if (score.type === 'mate') {
    return score.value > 0 ? `Checkmate in ${score.value}` : `Opponent has mate in ${Math.abs(score.value)}`
  }
  const v = score.value
  if (v >= 400) return 'You\'re winning'
  if (v >= 150) return 'You have a clear advantage'
  if (v >= 50) return 'You\'re slightly ahead'
  if (v >= -50) return 'Equal position'
  if (v >= -150) return 'Opponent is slightly ahead'
  if (v >= -400) return 'Opponent has a clear advantage'
  return 'You\'re in trouble'
}

export type HintInfo = {
  from: string
  to: string
  score: { type: 'cp' | 'mate'; value: number } | null
  scoreText: string
  continuation: string[]
  description: string
  tag: string | null
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
}

export function useHint({
  fen,
  isComputerThinking,
  isReviewing,
  gameMode,
  playerColor,
  arrowColor,
}: UseHintParams) {
  const [hintInfo, setHintInfo] = useState<HintInfo | null>(null)
  const [isHintLoading, setIsHintLoading] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const { getBestMove } = useStockfish()

  useEffect(() => {
    const game = new Chess(fen)
    if (
      (gameMode === 'vs-computer' && game.turn() !== playerColor[0]) ||
      isComputerThinking ||
      game.isGameOver() ||
      isReviewing
    ) {
      setHintInfo(null)
      setIsHintLoading(false)
      return
    }
    let cancelled = false
    setIsHintLoading(true)
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
      })
      setIsHintLoading(false)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, isComputerThinking, isReviewing, gameMode])

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

  return { hintInfo, isHintLoading, showHint, setShowHint, arrows }
}
