import { Chessboard } from 'react-chessboard'
import type React from 'react'
import type { Difficulty, GameMode, PlayerColor, BoardTheme } from '@/types'
import { BOARD_THEMES } from '@/types'
import { useChessGame } from '@/hooks/useChessGame'
import { useHint } from '@/hooks/useHint'
import { StatusBar } from '@/components/StatusBar'
import { MoveHistory } from '@/components/MoveHistory'
import { MoveNav } from '@/components/MoveNav'
import { Controls } from '@/components/Controls'
import { CapturedPieces } from '@/components/CapturedPieces'
import { HintPanel } from '@/components/HintPanel'
import { useTheme } from '@/hooks/useTheme'
import './GameBoard.css'

interface GameBoardProps {
  difficulty: Difficulty
  gameMode: GameMode
  playerColor?: PlayerColor
  boardTheme: BoardTheme
}

export function GameBoard({
  difficulty,
  gameMode,
  playerColor = 'white',
  boardTheme,
}: GameBoardProps) {
  const theme = useTheme()
  const { lightSquare, darkSquare, arrowColor } =
    BOARD_THEMES[boardTheme][theme]

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
  } = useChessGame({ difficulty, gameMode, playerColor, boardTheme })

  const { hintInfo, isHintLoading, showHint, setShowHint, arrows } = useHint({
    fen,
    isComputerThinking,
    isReviewing,
    gameMode,
    playerColor,
    arrowColor,
  })

  const lightSquareStyle: React.CSSProperties = { backgroundColor: lightSquare }
  const darkSquareStyle: React.CSSProperties = { backgroundColor: darkSquare }

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
              boardOrientation: playerColor,
              allowDragging:
                !isReviewing && !isComputerThinking && !isOver && isPlayerTurn,
              onPieceDrop,
              onSquareClick,
              squareStyles,
              arrows,
              lightSquareStyle,
              darkSquareStyle,
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
        {gameMode === 'vs-computer' && <Controls difficulty={difficulty} />}
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
