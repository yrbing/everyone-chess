import { useEffect, useRef } from 'react'
import type { Difficulty } from '../types'
import { DIFFICULTY_CONFIGS } from '../types'

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null)
  const resolverRef = useRef<((move: string) => void) | null>(null)

  useEffect(() => {
    const worker = new Worker('/stockfish.js')
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent<string>) => {
      const line = e.data
      if (typeof line === 'string' && line.startsWith('bestmove')) {
        const move = line.split(' ')[1]
        if (resolverRef.current && move && move !== '(none)') {
          resolverRef.current(move)
          resolverRef.current = null
        }
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
  ): Promise<string> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve
      const { skillLevel, movetime } = DIFFICULTY_CONFIGS[difficulty]
      const w = workerRef.current!
      w.postMessage('ucinewgame')
      w.postMessage(`setoption name Skill Level value ${skillLevel}`)
      w.postMessage('isready')
      w.postMessage(`position fen ${fen}`)
      w.postMessage(`go movetime ${movetime}`)
    })
  }

  return { getBestMove }
}
