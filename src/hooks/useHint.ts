import { useEffect, useState } from 'react'
import { Chess } from 'chess.js'
import type { GameMode } from '@/types'
import { useStockfish } from '@/hooks/useStockfish'

export type HintInfo = {
  from: string
  to: string
  score: { type: 'cp' | 'mate'; value: number } | null
  continuation: string[]
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
}

export function useHint({
  fen,
  isComputerThinking,
  isReviewing,
  gameMode,
}: UseHintParams) {
  const [hintInfo, setHintInfo] = useState<HintInfo | null>(null)
  const [isHintLoading, setIsHintLoading] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const { getBestMove } = useStockfish()

  useEffect(() => {
    const game = new Chess(fen)
    if (
      (gameMode === 'vs-computer' && game.turn() !== 'w') ||
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
      setHintInfo({
        from: move.slice(0, 2),
        to: move.slice(2, 4),
        score,
        continuation,
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
            color: 'rgba(0,200,100,0.75)',
          },
        ]
      : []

  return { hintInfo, isHintLoading, showHint, setShowHint, arrows }
}
