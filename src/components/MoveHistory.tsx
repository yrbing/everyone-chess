import { useEffect, useRef } from 'react';

interface MoveHistoryProps {
  history: string[];
}

export function MoveHistory({ history }: MoveHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const pairs: [string, string | undefined][] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push([history[i], history[i + 1]]);
  }

  return (
    <div className="move-history">
      <h3 className="move-history-title">Move History</h3>
      <div className="move-history-list">
        {pairs.length === 0 ? (
          <p className="move-history-empty">No moves yet</p>
        ) : (
          pairs.map(([white, black], i) => (
            <div key={i} className="move-row">
              <span className="move-number">{i + 1}.</span>
              <span className="move-white">{white}</span>
              <span className="move-black">{black ?? ''}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
