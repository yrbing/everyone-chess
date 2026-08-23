export type ClientMessage =
  | { type: 'create'; color: 'white' | 'black' }
  | { type: 'join'; code: string }
  | { type: 'move'; from: string; to: string; promotion?: string }
  | { type: 'chat'; text: string }

export type ServerMessage =
  | { type: 'created'; code: string }
  | { type: 'start'; color: 'white' | 'black' }
  | { type: 'move'; from: string; to: string; promotion?: string }
  | { type: 'chat'; text: string }
  | { type: 'opponentLeft' }
  | { type: 'error'; message: string }
