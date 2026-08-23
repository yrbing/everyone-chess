import { useEffect, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import type React from 'react'
import type { Difficulty, GameMode, PlayerColor, BoardTheme } from '@/types'
import { BOARD_THEMES } from '@/types'
import { useChessGame } from '@/hooks/useChessGame'
import { useHint } from '@/hooks/useHint'
import { MoveHistory } from '@/components/MoveHistory'
import { CapturedPieces } from '@/components/CapturedPieces'
import { HintPanel } from '@/components/HintPanel'
import { ChatBox } from '@/components/ChatBox'
import { useTheme } from '@/hooks/useTheme'
import './GameBoard.css'

interface GameBoardProps {
  difficulty: Difficulty
  gameMode: GameMode
  playerColor?: PlayerColor
  boardTheme: BoardTheme
  sendMove?: (move: { from: string; to: string; promotion?: string }) => void
  incomingMove?: { from: string; to: string; promotion?: string } | null
  sendChat: (text: string) => void
  incomingChat: { text: string } | null
  opponentLeft?: boolean
  connected?: boolean
}

export function GameBoard({
  difficulty,
  gameMode,
  playerColor = 'white',
  boardTheme,
  sendMove,
  incomingMove,
  sendChat,
  incomingChat,
  opponentLeft,
  connected = true,
}: GameBoardProps) {
  const [explainEnabled, setExplainEnabled] = useState(
    () => localStorage.getItem('hint-explain') === 'true',
  )
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
    applyRemoteMove,
    squareStyles,
    status,
    whiteCaptured,
    blackCaptured,
    whiteAdv,
    blackAdv,
  } = useChessGame({ difficulty, gameMode, playerColor, boardTheme, sendMove })

  useEffect(() => {
    if (incomingMove) applyRemoteMove(incomingMove)
  }, [incomingMove, applyRemoteMove])

  const {
    hintInfo,
    isHintLoading,
    isExplanationLoading,
    showHint,
    setShowHint,
    arrows,
  } = useHint({
    fen,
    isComputerThinking,
    isReviewing,
    gameMode,
    playerColor,
    arrowColor,
    explainEnabled,
  })

  function handleToggleExplain() {
    setExplainEnabled((v) => {
      const next = !v
      localStorage.setItem('hint-explain', String(next))
      return next
    })
  }

  const lightSquareStyle: React.CSSProperties = { backgroundColor: lightSquare }
  const darkSquareStyle: React.CSSProperties = { backgroundColor: darkSquare }

  const isBlack = playerColor === 'black'
  const topPieces = isBlack ? whiteCaptured : blackCaptured
  const topColor = (isBlack ? 'b' : 'w') as 'w' | 'b'
  const topAdv = isBlack ? whiteAdv : blackAdv
  const bottomPieces = isBlack ? blackCaptured : whiteCaptured
  const bottomColor = (isBlack ? 'w' : 'b') as 'w' | 'b'
  const bottomAdv = isBlack ? blackAdv : whiteAdv

  return (
    <div className="game-layout">
      <div className="board-column">
        <div className="board-area">
          <CapturedPieces
            pieces={topPieces}
            color={topColor}
            advantage={topAdv}
          />
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
          {opponentLeft && (
            <div className="checkmate-overlay">
              <span className="checkmate-text">OPPONENT LEFT</span>
            </div>
          )}
          {gameMode === 'online-player' && !opponentLeft && !connected && (
            <div className="checkmate-overlay">
              <span className="checkmate-text">CONNECTION LOST</span>
            </div>
          )}
          <CapturedPieces
            pieces={bottomPieces}
            color={bottomColor}
            advantage={bottomAdv}
          />
        </div>
      </div>
      <aside className="analyse-bar">
        {gameMode === 'online-player' ? (
          <ChatBox
            incomingChat={incomingChat}
            sendChat={sendChat}
            disabled={opponentLeft || !connected}
          />
        ) : (
          <HintPanel
            status={status}
            hintInfo={hintInfo}
            isHintLoading={isHintLoading}
            isExplanationLoading={isExplanationLoading}
            showHint={showHint}
            onToggleShow={() => setShowHint((v) => !v)}
            explainEnabled={explainEnabled}
            onToggleExplain={handleToggleExplain}
          />
        )}
        <MoveHistory
          history={sanHistory}
          viewIndex={viewIndex}
          total={verboseHistory.length}
          onPrev={onPrev}
          onNext={onNext}
          onBeginning={onBeginning}
          onCurrent={onCurrent}
        />
      </aside>
    </div>
  )
}
