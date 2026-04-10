import { Chessboard } from 'react-chessboard'
import type { Difficulty, GameMode } from '@/types'
import { useChessGame } from '@/hooks/useChessGame'
import { useHint } from '@/hooks/useHint'
import { StatusBar } from '@/components/StatusBar'
import { MoveHistory } from '@/components/MoveHistory'
import { MoveNav } from '@/components/MoveNav'
import { Controls } from '@/components/Controls'
import { CapturedPieces } from '@/components/CapturedPieces'
import { HintPanel } from '@/components/HintPanel'
import './GameBoard.css'

interface GameBoardProps {
  difficulty: Difficulty
  gameMode: GameMode
}

export function GameBoard({ difficulty, gameMode }: GameBoardProps) {
  const {
    fen,
    displayFen,
    isComputerThinking,
    isReviewing,
    isOver,
    isCheckmate,
    isPlayerTurn,
    sanHistory,
    verboseHistory,
    viewIndex,
    onPrev,
    onNext,
    onBeginning,
    onCurrent,
    onSquareClick,
    onPieceDrop,
    squareStyles,
    status,
    whiteCaptured,
    blackCaptured,
    whiteAdv,
    blackAdv,
  } = useChessGame({ difficulty, gameMode })

  const { hintInfo, isHintLoading, showHint, setShowHint, arrows } = useHint({
    fen,
    isComputerThinking,
    isReviewing,
    gameMode,
  })

  return (
    <div className="game-layout">
      <div className="board-column">
        <StatusBar status={status} />
        <CapturedPieces
          pieces={whiteCaptured}
          capturedColor="b"
          advantage={whiteAdv}
        />
        <div className="board-container">
          <Chessboard
            options={{
              position: displayFen,
              boardOrientation: 'white',
              allowDragging:
                !isReviewing && !isComputerThinking && !isOver && isPlayerTurn,
              onPieceDrop,
              onSquareClick,
              squareStyles,
              arrows,
            }}
          />
          {isCheckmate && !isReviewing && (
            <div className="checkmate-overlay">
              <span className="checkmate-text">CHECKMATE</span>
            </div>
          )}
        </div>
        <CapturedPieces
          pieces={blackCaptured}
          capturedColor="w"
          advantage={blackAdv}
        />
        <MoveNav
          total={verboseHistory.length}
          viewIndex={viewIndex}
          onPrev={onPrev}
          onNext={onNext}
          onBeginning={onBeginning}
          onCurrent={onCurrent}
        />
      </div>
      <aside className="analyse-bar">
        <Controls difficulty={difficulty} />
        <HintPanel
          hintInfo={hintInfo}
          isHintLoading={isHintLoading}
          showHint={showHint}
          onToggleShow={() => setShowHint((v) => !v)}
        />
        <MoveHistory history={sanHistory} viewIndex={viewIndex} />
      </aside>
    </div>
  )
}
