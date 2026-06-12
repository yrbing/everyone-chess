import { renderHook } from '@testing-library/react'
import { useStockfish } from '@/hooks/useStockfish'

// A stand-in for the browser's Web Worker. It records every postMessage,
// and lets the test simulate engine output by calling emit().
class FakeWorker {
  static instances: FakeWorker[] = []
  url: string
  onmessage: ((e: { data: string }) => void) | null = null
  posted: string[] = []
  terminated = false

  constructor(url: string) {
    this.url = url
    FakeWorker.instances.push(this)
  }
  postMessage(msg: string) {
    this.posted.push(msg)
  }
  terminate() {
    this.terminated = true
  }
  // Simulate the engine sending a line back to the app.
  emit(line: string) {
    this.onmessage?.({ data: line })
  }
}

beforeEach(() => {
  FakeWorker.instances = []
  vi.stubGlobal('Worker', FakeWorker)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useStockfish', () => {
  it('boots the engine worker on mount', () => {
    renderHook(() => useStockfish())

    expect(FakeWorker.instances).toHaveLength(1)
    const worker = FakeWorker.instances[0]
    expect(worker.url).toBe('/stockfish.js')
    expect(worker.posted).toContain('uci')
    expect(worker.posted).toContain('isready')
  })

  it('limits Elo on easy and resolves with the parsed best move', async () => {
    const { result } = renderHook(() => useStockfish())
    const worker = FakeWorker.instances[0]

    const promise = result.current.getBestMove('some-fen', 'easy')

    // It configured a limited-strength search at the easy Elo (400).
    expect(worker.posted).toContain(
      'setoption name UCI_LimitStrength value true',
    )
    expect(worker.posted).toContain('setoption name UCI_Elo value 400')
    expect(worker.posted).toContain('position fen some-fen')
    expect(worker.posted.some((m) => m.startsWith('go movetime'))).toBe(true)

    // Simulate the engine streaming analysis, then announcing its move.
    worker.emit('info depth 5 score cp 35 pv e2e4 e7e5')
    worker.emit('bestmove e2e4 ponder e7e5')

    await expect(promise).resolves.toEqual({
      move: 'e2e4',
      pv: ['e2e4', 'e7e5'],
      score: { type: 'cp', value: 35 },
    })
  })

  it('uses full strength (no Elo limit) on hard', () => {
    const { result } = renderHook(() => useStockfish())
    const worker = FakeWorker.instances[0]

    result.current.getBestMove('fen', 'hard')

    expect(worker.posted).toContain(
      'setoption name UCI_LimitStrength value false',
    )
  })

  it('terminates the worker on unmount', () => {
    // Unmount tears down the rendered tree — which triggers React's cleanup: every useEffect's eturn function runs. That's exactly why it's how we test teardown.
    // By default, RTL automatically unmounts after every test (it registers an afterEach cleanup for you). So you don't have to call unmount for hygiene — it happens anyway.
    const { unmount } = renderHook(() => useStockfish())
    const worker = FakeWorker.instances[0]

    expect(worker.terminated).toBe(false)
    unmount()
    expect(worker.terminated).toBe(true)
  })
})
