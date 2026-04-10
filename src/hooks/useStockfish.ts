import { useEffect, useRef } from 'react'
import type { Difficulty } from '@/types'
import { DIFFICULTY_CONFIGS } from '@/types'

export type BestMoveResult = {
  move: string
  pv: string[]
  score: { type: 'cp' | 'mate'; value: number } | null
}

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null)
  const resolverRef = useRef<((result: BestMoveResult) => void) | null>(null)
  const lastPvRef = useRef<string[]>([])
  const lastScoreRef = useRef<{ type: 'cp' | 'mate'; value: number } | null>(
    null,
  )

  useEffect(() => {
    const worker = new Worker('/stockfish.js')
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent<string>) => {
      const line = e.data
      if (typeof line !== 'string') return

      if (line.startsWith('info') && line.includes(' pv ')) {
        const cpMatch = line.match(/score cp (-?\d+)/)
        const mateMatch = line.match(/score mate (-?\d+)/)
        if (cpMatch)
          lastScoreRef.current = { type: 'cp', value: parseInt(cpMatch[1]) }
        else if (mateMatch)
          lastScoreRef.current = { type: 'mate', value: parseInt(mateMatch[1]) }

        const pvIndex = line.indexOf(' pv ')
        if (pvIndex !== -1) {
          lastPvRef.current = line
            .slice(pvIndex + 4)
            .trim()
            .split(' ')
        }
      }

      if (line.startsWith('bestmove')) {
        const move = line.split(' ')[1]
        if (resolverRef.current && move && move !== '(none)') {
          resolverRef.current({
            move,
            pv: lastPvRef.current,
            score: lastScoreRef.current,
          })
          resolverRef.current = null
        }
        lastPvRef.current = []
        lastScoreRef.current = null
      }
    }

    worker.postMessage('uci')
    worker.postMessage('isready')

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  const getBestMove = (
    fen: string,
    difficulty: Difficulty,
  ): Promise<BestMoveResult> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      const { elo, movetime } = DIFFICULTY_CONFIGS[difficulty]
      const w = workerRef.current!
      w.postMessage('ucinewgame')
      if (elo !== null) {
        w.postMessage('setoption name UCI_LimitStrength value true')
        w.postMessage(`setoption name UCI_Elo value ${elo}`)
      } else {
        w.postMessage('setoption name UCI_LimitStrength value false')
      }
      w.postMessage('isready')
      w.postMessage(`position fen ${fen}`)
      w.postMessage(`go movetime ${movetime}`)
    })
  }

  return { getBestMove }
}
