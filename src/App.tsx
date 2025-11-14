import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const PROMPT_USER = 'mark';
const PROMPT_HOST = 'linux-desktop';
const PROMPT_PATH = '~';

type LineType = 'command' | 'output';

interface Line {
  id: number;
  type: LineType;
  text: string;
}

const commandHandlers = (command: string): string[] | null => {
  const cmd = command.trim();

  if (!cmd) return [''];

  if (cmd === 'clear') {
    return null;
  }

  switch (cmd) {
    case 'help':
      return [
        'Comenzi simulate:',
        '  help        - lista de comenzi disponibile',
        '  ls          - listează directoare uzuale',
        '  pwd         - afișează directorul curent',
        '  whoami      - afișează utilizatorul curent',
        '  date        - afișează data curentă',
        '  uname -a    - afișează informații de sistem',
        '  clear       - curăță ecranul terminalului',
      ];
    case 'ls':
      return ['Desktop  Documents  Downloads  Music  Pictures  Videos'];
    case 'pwd':
      return ['/home/mark'];
    case 'whoami':
      return [PROMPT_USER];
    case 'date':
      return [new Date().toString()];
    case 'uname -a':
      return ['Linux linux-desktop 5.15.0-Ubuntu #1 SMP x86_64 GNU/Linux'];
    default:
      return [`bash: ${cmd}: command not found`];
  }
};

function App() {
  const [lines, setLines] = useState<Line[]>([
    {
      id: 0,
      type: 'output',
      text: 'Welcome to Ubuntu 22.04. Type "help" to see available commands.',
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [lineId, setLineId] = useState<number>(1);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = inputValue.trim();

    const commandLine: Line = {
      id: lineId,
      type: 'command',
      text: trimmed,
    };

    const result = commandHandlers(trimmed);

    if (result === null) {
      setLines([]);
      setInputValue('');
      setLineId((prev) => prev + 1);
      return;
    }

    const outputLines: Line[] = result.map((text, index) => ({
      id: lineId + index + 1,
      type: 'output',
      text,
    }));

    setLines((prev) => [...prev, commandLine, ...outputLines]);
    setInputValue('');
    setLineId((prev) => prev + 1 + outputLines.length);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="ubuntu-desktop">
      <div className="ubuntu-terminal-window">
        <div className="ubuntu-terminal-titlebar">
          <div className="ubuntu-buttons">
            <span className="btn close" />
            <span className="btn minimize" />
            <span className="btn maximize" />
          </div>
          <div className="ubuntu-title">mark@linux-desktop: ~</div>
        </div>

        <div
          className="ubuntu-terminal-body"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="terminal-scroll" ref={scrollRef}>
            {lines.map((line) =>
              line.type === 'command' ? (
                <div key={line.id} className="terminal-line">
                  <span className="prompt">
                    <span className="user">{PROMPT_USER}</span>
                    <span className="at">@</span>
                    <span className="host">{PROMPT_HOST}</span>
                    <span className="colon">:</span>
                    <span className="path">{PROMPT_PATH}</span>
                    <span className="dollar">$</span>
                  </span>
                  <span className="command-text"> {line.text}</span>
                </div>
              ) : (
                <div key={line.id} className="terminal-line output-line">
                  {line.text}
                </div>
              )
            )}

            <form className="terminal-input-line" onSubmit={handleSubmit}>
              <span className="prompt">
                <span className="user">{PROMPT_USER}</span>
                <span className="at">@</span>
                <span className="host">{PROMPT_HOST}</span>
                <span className="colon">:</span>
                <span className="path">{PROMPT_PATH}</span>
                <span className="dollar">$</span>
              </span>
              <input
                ref={inputRef}
                className="terminal-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoComplete="off"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
