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

const BIRTHDAY_MESSAGE: string[] = [
  'Dear Maxim,',
  ' ',
  'Happy 30th birthday! 🎉',
  'May this year bring you exciting projects, fresh ideas,',
  'and plenty of time to enjoy the things you love.',
  ' ',
  'May your code compile on the first try, your servers stay green,',
  'and your coffee cup never be empty.',
  ' ',
  'Wishing you lots of joy, health and success,',
  'Your family <3.',
];

const handleGenericCommand = (command: string): string[] => {
  const cmd = command.trim();

  switch (cmd) {
    case '':
      return [''];
    case 'help':
      return [
        'Simulated commands:',
        '  help        - show this help message',
        '  ls          - list some common directories',
        '  pwd         - print working directory',
        '  whoami      - print current user',
        '  date        - print current date and time',
        '  uname -a    - print system information',
        '  clear       - clear the terminal screen',
      ];
    case 'ls':
      return [
        'Desktop  Documents  Downloads  Music  Pictures  Videos  gift_for_maxim.txt',
      ];
    case 'pwd':
      return ['/home/mark'];
    case 'whoami':
      return [PROMPT_USER];
    case 'date':
      return [new Date().toString()];
    case 'uname -a':
      return ['Linux linux-desktop 5.15.0-Ubuntu #1 SMP x86_64 GNU/Linux'];
    case 'cat gift_for_maxim.txt':
      // handled specially (clear + show file), but keep a fallback
      return BIRTHDAY_MESSAGE;
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
  const [isIntroRunning, setIsIntroRunning] = useState<boolean>(false);

  const nextIdRef = useRef<number>(1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const appendCommandWithOutput = (
    command: string,
    outputLines: string[],
    options?: { clearBefore?: boolean }
  ) => {
    setLines((prev) => {
      const base: Line[] = options?.clearBefore ? [] : prev;
      const created: Line[] = [];

      created.push({
        id: nextIdRef.current++,
        type: 'command',
        text: command.trim(),
      });

      outputLines.forEach((text) => {
        created.push({
          id: nextIdRef.current++,
          type: 'output',
          text,
        });
      });

      return [...base, ...created];
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isIntroRunning) return;

    const trimmed = inputValue.trim();

    if (trimmed === 'clear') {
      setLines([]);
      setInputValue('');
      return;
    }

    if (trimmed === 'cat gift_for_maxim.txt') {
      appendCommandWithOutput(trimmed, BIRTHDAY_MESSAGE, { clearBefore: true });
      setInputValue('');
      return;
    }

    const output = handleGenericCommand(trimmed);
    appendCommandWithOutput(trimmed, output);
    setInputValue('');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    const typeText = async (text: string) => {
      setInputValue('');
      for (let i = 0; i < text.length; i++) {
        if (cancelled) return;
        await sleep(120);
        setInputValue((prev) => prev + text[i]);
      }
    };

    const runIntro = async () => {
      setIsIntroRunning(true);
      await sleep(700);
      if (cancelled) return;

      // Step 1: type "ls"
      await typeText('ls');
      if (cancelled) return;

      await sleep(400);
      appendCommandWithOutput('ls', [
        'Desktop  Documents  Downloads  Music  Pictures  Videos  gift_for_maxim.txt',
      ]);

      await sleep(1400);
      if (cancelled) return;

      // Step 2: type "cat gift_for_maxim.txt"
      await typeText('cat gift_for_maxim.txt');
      if (cancelled) return;

      await sleep(400);
      appendCommandWithOutput('cat gift_for_maxim.txt', BIRTHDAY_MESSAGE, {
        clearBefore: true,
      });

      await sleep(600);
      setInputValue('');
      setIsIntroRunning(false);
    };

    runIntro();

    return () => {
      cancelled = true;
    };
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
                disabled={isIntroRunning}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
