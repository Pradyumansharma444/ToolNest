import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';
import { Swords, Users, Network, Send, RotateCcw, Copy, Check, Eraser, Bot, ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DataConnectionInstance {
  peer: string;
  open: boolean;
  send(data: unknown): void;
  on(event: 'data', cb: (data: Record<string, unknown>) => void): void;
  on(event: 'open', cb: () => void): void;
  on(event: 'error', cb: (err: Error) => void): void;
  on(event: 'close', cb: () => void): void;
  on(event: string, cb: (...args: unknown[]) => void): void;
  close(): void;
}

interface PeerInstance {
  id: string;
  on(event: 'connection', cb: (conn: DataConnectionInstance) => void): void;
  on(event: 'open', cb: (id: string) => void): void;
  on(event: 'error', cb: (err: Error) => void): void;
  on(event: string, cb: (...args: unknown[]) => void): void;
  connect(id: string): DataConnectionInstance;
  destroy(): void;
}

declare global {
  interface Window {
    Peer?: new (id?: string, options?: Record<string, unknown>) => PeerInstance;
  }
}

// Local Pass & Play external games data list
const LOCAL_EXTERNAL_GAMES = [
  { id: 'chess', name: 'Chess Game', desc: 'Classic 2-player chess board', path: '/games/chess' },
  { id: 'checkers', name: 'Checkers Game', desc: 'Drafts board pass-and-play', path: '/games/checkers' },
];

const ONLINE_PLAYABLE_GAMES = [
  { id: 'tictactoe', name: 'Tic Tac Toe', desc: 'Synchronized turn-based grid' },
  { id: 'rps', name: 'Rock Paper Scissors', desc: 'Simultaneous choice lock-in' },
  { id: 'drawguess', name: 'Draw & Guess (Sync Canvas)', desc: 'Host draws, Guest/Bot guesses' },
];

const DRAWGUESS_WORDS = [
  'House', 'Dog', 'Cat', 'Car', 'Apple', 'Bicycle', 'Sun', 'Moon', 'Tree', 'Pizza', 
  'Ring', 'Umbrella', 'Pencil', 'Flower', 'Airplane', 'Guitar', 'Hat', 'Book', 'Fish', 'Leaf'
];

interface ChatMessage {
  id: string;
  sender: 'me' | 'them' | 'system';
  text: string;
}

export default function MultiplayerLobby() {
  const tool = getToolById('multiplayer-games')!;
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'local' | 'online'>('local');
  const [peerLoaded, setPeerLoaded] = useState(false);
  
  // Connection states
  const [myPeerId, setMyPeerId] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [role, setRole] = useState<'host' | 'guest' | 'spectator' | null>(null);
  
  // Demo bot states
  const [isDemoBot, setIsDemoBot] = useState(false);

  // Peer & connection references
  const peerInstance = useRef<PeerInstance | null>(null);
  const connectionInstance = useRef<DataConnectionInstance | null>(null); // Client's single connection to Host
  const connectionsList = useRef<DataConnectionInstance[]>([]);    // Host's list of all connected clients
  const guestPlayerConnId = useRef<string | null>(null); // Connection ID of the playing opponent (Guest)

  const broadcastToAll = useCallback((payload: Record<string, unknown>, skipConnectionId?: string) => {
    connectionsList.current.forEach(conn => {
      if (conn && conn.open && conn.peer !== skipConnectionId) {
        conn.send(payload);
      }
    });
  }, []);

  // Sync game states
  const [activeOnlineGame, setActiveOnlineGame] = useState<string>('tictactoe');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Timers states for online/P2P matches
  const [tttTimer, setTttTimer] = useState(15);
  const [rpsTimer, setRpsTimer] = useState(15);
  const [drawTimer, setDrawTimer] = useState(60);

  // --- LOCAL DIRECT PLAY STATES ---
  const [activeLocalGame, setActiveLocalGame] = useState<string | null>(null);
  
  // Local Tic Tac Toe
  const [localTttBoard, setLocalTttBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [localTttTurn, setLocalTttTurn] = useState<'X' | 'O'>('X');
  const [localTttScores, setLocalTttScores] = useState({ x: 0, o: 0, ties: 0 });

  // Local Rock Paper Scissors
  const [localP1Choice, setLocalP1Choice] = useState<'rock' | 'paper' | 'scissors' | null>(null);
  const [localP2Choice, setLocalP2Choice] = useState<'rock' | 'paper' | 'scissors' | null>(null);
  const [localRpsTurn, setLocalRpsTurn] = useState<1 | 2>(1);
  const [localRpsResult, setLocalRpsResult] = useState('');
  const [localRpsScores, setLocalRpsScores] = useState({ p1: 0, p2: 0 });

  // Local Draw & Guess
  const localCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [localDrawWord, setLocalDrawWord] = useState('');
  const [localIsDrawing, setLocalIsDrawing] = useState(false);
  const [localDrawColor, setLocalDrawColor] = useState('#000000');
  const [localDrawWidth, setLocalDrawWidth] = useState(5);
  const [localDrawScores, setLocalDrawScores] = useState({ drawer: 0, guesser: 0 });
  const [localGuessInput, setLocalGuessInput] = useState('');
  const [showLocalWord, setShowLocalWord] = useState(false);
  const [localDrawStepRole, setLocalDrawStepRole] = useState<'drawing' | 'guessing'>('drawing');
  const localLastPos = useRef({ x: 0, y: 0 });

  // --- ONLINE GAME SYNC STATES ---
  // Tic Tac Toe
  const [tttBoard, setTttBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [tttTurn, setTttTurn] = useState<string>('X'); // X always hosts, O always guest
  const [tttScores, setTttScores] = useState({ host: 0, guest: 0, ties: 0 });

  // Rock Paper Scissors
  const [myRpsChoice, setMyRpsChoice] = useState<'rock' | 'paper' | 'scissors' | null>(null);
  const [theirRpsChoice, setTheirRpsChoice] = useState<'rock' | 'paper' | 'scissors' | null>(null);
  const [rpsResult, setRpsResult] = useState<string>('');
  const [rpsScores, setRpsScores] = useState({ host: 0, guest: 0 });

  // Draw and Guess
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawWord, setDrawWord] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#000000');
  const [drawWidth, setDrawWidth] = useState(5);
  const [drawScores, setDrawScores] = useState({ host: 0, guest: 0 });
  const [hasStartedDrawing, setHasStartedDrawing] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Load PeerJS dynamically
  useEffect(() => {
    if (window.Peer) {
      setPeerLoaded(true);
      return;
    }
    const existingScript = document.getElementById('peerjs-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setPeerLoaded(true));
      if (window.Peer) {
        setPeerLoaded(true);
      }
      return;
    }
    const script = document.createElement('script');
    script.id = 'peerjs-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js';
    script.async = true;
    script.onload = () => setPeerLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Cleanup peer connections on unmount
  useEffect(() => {
    return () => {
      if (connectionInstance.current) connectionInstance.current.close();
      if (peerInstance.current) peerInstance.current.destroy();
      const root = window.document.documentElement;
      root.classList.remove('toolnest-focus-mode');
    };
  }, []);

  // Helper to append chat message
  const addChatMessage = useCallback((sender: 'me' | 'them' | 'system', text: string) => {
    setChatMessages(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      sender,
      text
    }]);
  }, []);

  // Tic Tac Toe winner checker
  const checkTttWinner = (board: (string | null)[]) => {
    const combos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const combo of combos) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const clearCanvasLocally = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Draw and Guess Host: Get a new word and notify guest
  const pickNewDrawWord = useCallback(() => {
    const randomWord = DRAWGUESS_WORDS[Math.floor(Math.random() * DRAWGUESS_WORDS.length)];
    setDrawWord(randomWord);
    setHasStartedDrawing(false);
    
    // Clear canvas locally
    clearCanvasLocally();
    
    if (roleRef.current === 'host') {
      broadcastToAll({ type: 'draw-word', word: randomWord });
      broadcastToAll({ type: 'draw-clear' });
    } else if (connectionInstance.current) {
      connectionInstance.current.send({ type: 'draw-word', word: randomWord });
      connectionInstance.current.send({ type: 'draw-clear' });
    }
  }, [broadcastToAll]);

  const clearLocalCanvas = () => {
    const canvas = localCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Local Draw & Guess new word picker
  const pickNewLocalDrawWord = () => {
    const randomWord = DRAWGUESS_WORDS[Math.floor(Math.random() * DRAWGUESS_WORDS.length)];
    setLocalDrawWord(randomWord);
    setLocalGuessInput('');
    setShowLocalWord(false);
    setLocalDrawStepRole('drawing');
    clearLocalCanvas();
  };

  // Trigger draw word initialization when starting drawguess online
  useEffect(() => {
    if (activeOnlineGame === 'drawguess' && isConnected) {
      if (role === 'host') {
        pickNewDrawWord();
      }
    }
  }, [activeOnlineGame, isConnected, role, pickNewDrawWord]);

  // Trigger word load on starting local drawguess
  useEffect(() => {
    if (activeLocalGame === 'drawguess') {
      pickNewLocalDrawWord();
    }
  }, [activeLocalGame]);

  // --- ONLINE GAME PLAY HANDLERS (STABILIZED CALLBACKS) ---

  const handleTttClick = useCallback((index: number) => {
    if (role === 'spectator') return;
    if (!isConnected || tttBoard[index] || checkTttWinner(tttBoard)) return;
    
    const myMark = role === 'host' ? 'X' : 'O';
    if (tttTurn !== myMark) {
      toast({ title: "Not your turn", description: "Wait for the other player to move." });
      return;
    }

    setTttBoard(prev => {
      const nextBoard = [...prev];
      nextBoard[index] = myMark;
      
      const nextTurn = myMark === 'X' ? 'O' : 'X';
      setTttTurn(nextTurn);

      // Send payload
      if (isDemoBot) {
        const winner = checkTttWinner(nextBoard);
        const isDraw = !winner && nextBoard.every(cell => cell !== null);
        if (winner) {
          setTttScores(s => ({ ...s, host: s.host + 1 }));
          addChatMessage('system', "Round Over: You Win!");
          return nextBoard;
        } else if (isDraw) {
          setTttScores(s => ({ ...s, ties: s.ties + 1 }));
          addChatMessage('system', "Round Over: It's a Tie!");
          return nextBoard;
        }

        // Simulate Bot's move
        setTimeout(() => {
          setTttBoard(b => {
            const empties = b.map((c, i) => c === null ? i : null).filter(c => c !== null) as number[];
            if (empties.length > 0) {
               const botMove = empties[Math.floor(Math.random() * empties.length)];
               const postBotBoard = [...b];
               postBotBoard[botMove] = 'O';
               setTttTurn('X');

               const botWinner = checkTttWinner(postBotBoard);
               const botDraw = !botWinner && postBotBoard.every(cell => cell !== null);
               if (botWinner) {
                 setTttScores(s => ({ ...s, guest: s.guest + 1 }));
                 addChatMessage('system', "Round Over: BotOpponent Wins!");
               } else if (botDraw) {
                 setTttScores(s => ({ ...s, ties: s.ties + 1 }));
                 addChatMessage('system', "Round Over: It's a Tie!");
               }
               return postBotBoard;
            }
            return b;
          });
        }, 1000);
      } else {
        const payload = {
          type: 'ttt-move',
          index,
          marker: myMark,
          nextTurn
        };
        if (role === 'host') {
          broadcastToAll(payload);
        } else if (connectionInstance.current) {
          connectionInstance.current.send(payload);
        }

        const winner = checkTttWinner(nextBoard);
        const isDraw = !winner && nextBoard.every(cell => cell !== null);
        if (winner) {
          setTttScores(s => ({
            ...s,
            host: winner === 'X' ? s.host + 1 : s.host,
            guest: winner === 'O' ? s.guest + 1 : s.guest,
          }));
          addChatMessage('system', `Round Over: ${winner === 'X' ? 'Host' : 'Guest'} Wins!`);
        } else if (isDraw) {
          setTttScores(s => ({ ...s, ties: s.ties + 1 }));
          addChatMessage('system', "Round Over: It's a Tie!");
        }
      }
      return nextBoard;
    });
  }, [isConnected, role, tttTurn, tttBoard, isDemoBot, addChatMessage, toast, broadcastToAll]);

  const handleRpsSelect = useCallback((choice: 'rock' | 'paper' | 'scissors') => {
    if (role === 'spectator' || myRpsChoice || !isConnected) return;
    setMyRpsChoice(choice);
    
    if (isDemoBot) {
      const choices = ['rock', 'paper', 'scissors'] as const;
      const botChoice = choices[Math.floor(Math.random() * choices.length)];
      setTimeout(() => {
        setTheirRpsChoice(botChoice);
      }, 800);
    } else {
      const payload = {
        type: 'rps-choice',
        choice
      };
      if (role === 'host') {
        broadcastToAll(payload);
      } else if (connectionInstance.current) {
        connectionInstance.current.send(payload);
      }
    }
  }, [myRpsChoice, isConnected, isDemoBot, role, broadcastToAll]);

  // --- CANVAS & DRAWING HELPERS ---
  const drawStrokeOnCanvas = (x: number, y: number, lastX: number, lastY: number, color: string, width: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (role !== 'host') return;
    setIsDrawing(true);
    const pos = getCanvasPos(e);
    lastPos.current = pos;
  };

  const drawStep = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || role !== 'host') return;
    const pos = getCanvasPos(e);

    // Draw locally
    setHasStartedDrawing(true);
    drawStrokeOnCanvas(pos.x, pos.y, lastPos.current.x, lastPos.current.y, drawColor, drawWidth);

    // Sync to guest over data channel
    if (!isDemoBot) {
      broadcastToAll({
        type: 'draw-stroke',
        x: pos.x,
        y: pos.y,
        lastX: lastPos.current.x,
        lastY: lastPos.current.y,
        color: drawColor,
        width: drawWidth
      });
    }

    lastPos.current = pos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    clearCanvasLocally();
    setHasStartedDrawing(false);
    if (!isDemoBot) {
      broadcastToAll({ type: 'draw-clear' });
    }
  };

  // --- ONLINE GAME CONTROL HELPERS ---
  const changeOnlineGame = (gameId: string) => {
    setActiveOnlineGame(gameId);
    const game = ONLINE_PLAYABLE_GAMES.find(g => g.id === gameId);
    const gameName = game ? game.name : gameId;
    
    addChatMessage('system', `You switched active game to ${gameName}`);
    
    if (!isDemoBot) {
      if (role === 'host') {
        broadcastToAll({
          type: 'select-game',
          gameId: gameId,
          name: gameName,
          sender: 'Host'
        });
      } else if (connectionInstance.current) {
        connectionInstance.current.send({
          type: 'select-game',
          gameId: gameId,
          name: gameName,
          sender: 'Guest'
        });
      }
    }
  };

  const resetRps = () => {
    setMyRpsChoice(null);
    setTheirRpsChoice(null);
    setRpsResult('');
    if (!isDemoBot) {
      broadcastToAll({ type: 'rps-reset' });
    }
    addChatMessage('system', 'Rock Paper Scissors reset for next round.');
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const messageText = chatInput.trim();
    setChatInput('');

    // Add locally
    addChatMessage('me', messageText);

    // Sync to remote peer
    if (!isDemoBot) {
      const payload = {
        type: 'chat',
        text: messageText
      };
      if (role === 'host') {
        broadcastToAll(payload);
      } else if (connectionInstance.current) {
        connectionInstance.current.send(payload);
      }
    }

    // Special verification if playing with Demo Bot
    if (isDemoBot) {
      if (activeOnlineGame === 'drawguess' && role === 'guest') {
        const guess = messageText.toLowerCase();
        if (guess === drawWord.toLowerCase() && drawWord) {
          setDrawScores(s => ({ ...s, guest: s.guest + 10 }));
          addChatMessage('system', `You guessed the word "${drawWord}" correctly! +10 points.`);
          setTimeout(() => {
            pickNewDrawWord();
          }, 2000);
        }
      }
    }
  };

  // Setup connection handlers
  // --- STATE REFS FOR STALE CLOSURE PROTECTION ---
  const activeOnlineGameRef = useRef(activeOnlineGame);
  const roleRef = useRef(role);
  const drawWordRef = useRef(drawWord);
  const tttBoardRef = useRef(tttBoard);
  const tttTurnRef = useRef(tttTurn);
  const tttScoresRef = useRef(tttScores);
  const rpsScoresRef = useRef(rpsScores);
  const drawScoresRef = useRef(drawScores);

  activeOnlineGameRef.current = activeOnlineGame;
  roleRef.current = role; // eslint-disable-line react-hooks/immutability
  drawWordRef.current = drawWord;
  tttBoardRef.current = tttBoard;
  tttTurnRef.current = tttTurn;
  tttScoresRef.current = tttScores;
  rpsScoresRef.current = rpsScores;
  drawScoresRef.current = drawScores;

  // Setup connection handlers
  const setupConnection = useCallback((conn: DataConnectionInstance) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    conn.on('data', (data: Record<string, any>) => {
      if (!data || !data.type) return;

      switch (data.type) {
        case 'register': {
          let assignedRole: 'guest' | 'spectator' = 'spectator';
          if (data.role === 'guest' && !guestPlayerConnId.current) {
            assignedRole = 'guest';
            guestPlayerConnId.current = conn.peer;
            addChatMessage('system', 'A Guest Player has joined the match.');
          } else {
            assignedRole = 'spectator';
            addChatMessage('system', 'A Spectator has joined the lobby.');
          }

          // Welcome and sync state
          conn.send({
            type: 'welcome',
            assignedRole,
            gameState: {
              activeOnlineGame: activeOnlineGameRef.current,
              tttBoard: tttBoardRef.current,
              tttTurn: tttTurnRef.current,
              tttScores: tttScoresRef.current,
              rpsScores: rpsScoresRef.current,
              drawScores: drawScoresRef.current,
              drawWord: assignedRole === 'guest' ? '' : drawWordRef.current
            }
          });

          // Inform others
          broadcastToAll({
            type: 'chat',
            text: `System: A new ${assignedRole} has joined the lobby.`
          }, conn.peer);
          break;
        }

        case 'welcome':
          setRole(data.assignedRole);
          setActiveOnlineGame(data.gameState.activeOnlineGame);
          setTttBoard(data.gameState.tttBoard);
          setTttTurn(data.gameState.tttTurn);
          setTttScores(data.gameState.tttScores);
          setRpsScores(data.gameState.rpsScores);
          setDrawScores(data.gameState.drawScores);
          if (data.gameState.drawWord) {
            setDrawWord(data.gameState.drawWord);
          }
          addChatMessage('system', `Role confirmed: You are a ${data.assignedRole.toUpperCase()}`);
          break;

        case 'chat': {
          const isMeHost = (connectionsList.current.length > 0);
          if (isMeHost) {
            const isSenderGuest = (conn.peer === guestPlayerConnId.current);
            const senderLabel = isSenderGuest ? 'Guest' : 'Spectator';
            addChatMessage('them', `[${senderLabel}] ${data.text}`);
            
            broadcastToAll({
              type: 'chat',
              text: `[${senderLabel}] ${data.text}`
            }, conn.peer);

            // Auto-verify guesses in Draw & Guess
            if (activeOnlineGameRef.current === 'drawguess' && isSenderGuest) {
              const guess = data.text.trim().toLowerCase();
              if (guess === drawWordRef.current.toLowerCase() && drawWordRef.current) {
                setDrawScores(s => ({ ...s, guest: s.guest + 10 }));
                addChatMessage('system', `Guest Player guessed the word "${drawWordRef.current}"! +10 points.`);
                broadcastToAll({ type: 'draw-correct-guess', guesser: 'Guest', word: drawWordRef.current });
                setTimeout(() => {
                  pickNewDrawWord();
                }, 2000);
              }
            }
          } else {
            if (data.text.startsWith('[Guest]') || data.text.startsWith('[Spectator]')) {
              addChatMessage('them', data.text);
            } else {
              addChatMessage('them', `[Host] ${data.text}`);
            }
          }
          break;
        }

        case 'select-game': {
          setActiveOnlineGame(data.gameId);
          const senderLabel = data.sender || (conn.peer === guestPlayerConnId.current ? 'Guest' : 'Host');
          addChatMessage('system', `${senderLabel} switched active game to ${data.name}`);

          const isMeHost = (connectionsList.current.length > 0);
          if (isMeHost) {
            broadcastToAll({
              type: 'select-game',
              gameId: data.gameId,
              name: data.name,
              sender: senderLabel
            }, conn.peer);
          }
          break;
        }

        case 'ttt-move':
          setTttBoard(prev => {
            const next = [...prev];
            next[data.index] = data.marker;
            
            const winner = checkTttWinner(next);
            const isDraw = !winner && next.every(cell => cell !== null);
            if (winner) {
              setTttScores(s => ({
                ...s,
                host: winner === 'X' ? s.host + 1 : s.host,
                guest: winner === 'O' ? s.guest + 1 : s.guest,
              }));
              addChatMessage('system', `Round Over: ${winner === 'X' ? 'Host' : 'Guest'} Wins!`);
            } else if (isDraw) {
              setTttScores(s => ({ ...s, ties: s.ties + 1 }));
              addChatMessage('system', "Round Over: It's a Tie!");
            }
            return next;
          });
          setTttTurn(data.nextTurn);

          if (connectionsList.current.length > 0) {
            broadcastToAll({
              type: 'ttt-move',
              index: data.index,
              marker: data.marker,
              nextTurn: data.nextTurn
            }, conn.peer);
          }
          break;

        case 'ttt-reset':
          setTttBoard(Array(9).fill(null));
          setTttTurn('X');
          addChatMessage('system', 'Tic Tac Toe board was reset.');
          if (connectionsList.current.length > 0) {
            broadcastToAll({ type: 'ttt-reset' }, conn.peer);
          }
          break;

        case 'rps-choice':
          setTheirRpsChoice(data.choice);
          if (connectionsList.current.length > 0) {
            broadcastToAll({ type: 'rps-choice', choice: data.choice }, conn.peer);
          }
          break;

        case 'rps-reset':
          setMyRpsChoice(null);
          setTheirRpsChoice(null);
          setRpsResult('');
          addChatMessage('system', 'Rock Paper Scissors reset for next round.');
          if (connectionsList.current.length > 0) {
            broadcastToAll({ type: 'rps-reset' }, conn.peer);
          }
          break;

        case 'draw-stroke':
          setHasStartedDrawing(true);
          drawStrokeOnCanvas(data.x, data.y, data.lastX, data.lastY, data.color, data.width);
          if (connectionsList.current.length > 0) {
            broadcastToAll({
              type: 'draw-stroke',
              x: data.x,
              y: data.y,
              lastX: data.lastX,
              lastY: data.lastY,
              color: data.color,
              width: data.width
            }, conn.peer);
          }
          break;

        case 'draw-clear':
          clearCanvasLocally();
          setHasStartedDrawing(false);
          if (connectionsList.current.length > 0) {
            broadcastToAll({ type: 'draw-clear' }, conn.peer);
          }
          break;

        case 'draw-word':
          setDrawWord(data.word);
          setHasStartedDrawing(false);
          break;

        case 'draw-correct-guess':
          addChatMessage('system', `${data.guesser} guessed the word "${data.word}" correctly!`);
          setDrawScores(s => ({
            ...s,
            host: data.guesser === 'Host' ? s.host + 10 : s.host,
            guest: data.guesser === 'Guest' ? s.guest + 10 : s.guest,
          }));
          break;

        default:
          break;
      }
    });

    conn.on('close', () => {
      const isMeHost = (connectionsList.current.length > 0);
      if (isMeHost) {
        connectionsList.current = connectionsList.current.filter(c => c.peer !== conn.peer);
        if (conn.peer === guestPlayerConnId.current) {
          guestPlayerConnId.current = null;
          addChatMessage('system', 'Guest player disconnected from the lobby.');
          broadcastToAll({
            type: 'chat',
            text: 'System: The Guest Player has disconnected.'
          });
        } else {
          addChatMessage('system', 'A spectator disconnected from the lobby.');
          broadcastToAll({
            type: 'chat',
            text: 'System: A spectator has disconnected.'
          });
        }
      } else {
        setIsConnected(false);
        setRole(null);
        addChatMessage('system', 'Host disconnected. Connection closed.');
        toast({
          title: 'Disconnected',
          description: 'Connection closed by remote peer.',
          variant: 'destructive',
        });
      }
    });
  }, [addChatMessage, pickNewDrawWord, toast, broadcastToAll]);

  // --- ONLINE GAME TIMERS HOOKS ---

  // 1. Tic Tac Toe turn timer (15 seconds)
  useEffect(() => {
    const isBoardEmpty = tttBoard.every(cell => cell === null);
    if (!isConnected || activeOnlineGame !== 'tictactoe' || checkTttWinner(tttBoard) || isBoardEmpty || role === 'spectator') {
      return;
    }

    const interval = setInterval(() => {
      setTttTimer(prev => {
        if (prev <= 1) {
          // Timer expired! Auto-move if it's OUR turn
          const myMark = role === 'host' ? 'X' : 'O';
          if (tttTurn === myMark) {
            const empties = tttBoard.map((c, i) => c === null ? i : null).filter(c => c !== null) as number[];
            if (empties.length > 0) {
              const randomMove = empties[Math.floor(Math.random() * empties.length)];
              handleTttClick(randomMove);
              toast({
                title: "Turn Time Out!",
                description: "You took too long. A random cell was selected.",
                variant: "destructive"
              });
            }
          }
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, activeOnlineGame, tttBoard, tttTurn, role, handleTttClick, toast]);

  // Reset TTT Timer when turn order shifts
  useEffect(() => {
    setTttTimer(15);
  }, [tttTurn, tttBoard]);

  // 2. Rock Paper Scissors decision timer (15 seconds)
  useEffect(() => {
    const hasAnyChoice = (myRpsChoice !== null || theirRpsChoice !== null);
    if (!isConnected || activeOnlineGame !== 'rps' || rpsResult || !hasAnyChoice || role === 'spectator') {
      return;
    }

    const interval = setInterval(() => {
      setRpsTimer(prev => {
        if (prev <= 1) {
          // Timer expired! Auto-pick for RPS
          if (myRpsChoice === null) {
            const gestures = ['rock', 'paper', 'scissors'] as const;
            const randGesture = gestures[Math.floor(Math.random() * gestures.length)];
            handleRpsSelect(randGesture);
            toast({
              title: "Decision Time Out!",
              description: `A random choice (${randGesture.toUpperCase()}) was auto-locked.`,
              variant: "destructive"
            });
          }
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, activeOnlineGame, rpsResult, myRpsChoice, theirRpsChoice, handleRpsSelect, toast]);

  // Reset RPS Timer when choices reset
  useEffect(() => {
    if (myRpsChoice === null && theirRpsChoice === null) {
      setRpsTimer(15);
    }
  }, [myRpsChoice, theirRpsChoice]);

  // Evaluate Rock Paper Scissors outcome when choices are made
  useEffect(() => {
    if (!myRpsChoice || !theirRpsChoice) return;

    let outcome = '';
    const localWins =
      (myRpsChoice === 'rock' && theirRpsChoice === 'scissors') ||
      (myRpsChoice === 'paper' && theirRpsChoice === 'rock') ||
      (myRpsChoice === 'scissors' && theirRpsChoice === 'paper');

    if (myRpsChoice === theirRpsChoice) {
      outcome = "It's a Tie!";
    } else if (localWins) {
      outcome = isDemoBot ? "You Win!" : (role === 'host' ? "Host Wins!" : "Guest Wins!");
      setRpsScores(s => ({
        ...s,
        host: role === 'host' ? s.host + 1 : s.host,
        guest: role === 'guest' ? s.guest + 1 : s.guest,
      }));
    } else {
      outcome = isDemoBot ? "BotOpponent Wins!" : (role === 'host' ? "Guest Wins!" : "Host Wins!");
      setRpsScores(s => ({
        ...s,
        host: role === 'guest' ? s.host + 1 : s.host,
        guest: role === 'host' ? s.guest + 1 : s.guest,
      }));
    }

    setRpsResult(outcome);
    addChatMessage('system', `Round Over: ${outcome}`);
  }, [myRpsChoice, theirRpsChoice, role, isDemoBot, addChatMessage]);

  // 3. Draw & Guess round timer (60 seconds)
  useEffect(() => {
    if (!isConnected || activeOnlineGame !== 'drawguess' || !drawWord || !hasStartedDrawing) {
      return;
    }

    const interval = setInterval(() => {
      setDrawTimer(prev => {
        if (prev <= 1) {
          // Timer expired! Skip word and alert players
          if (role === 'host') {
            addChatMessage('system', `Time's up! No one guessed the word. The answer was "${drawWord}".`);
            setTimeout(() => {
              pickNewDrawWord();
            }, 1000);
          }
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, activeOnlineGame, drawWord, role, pickNewDrawWord, addChatMessage, hasStartedDrawing]);

  // Reset Draw Timer when secret word updates
  useEffect(() => {
    setDrawTimer(60);
  }, [drawWord]);


  // Host Online Room via WebRTC
  const hostRoom = () => {
    if (!peerLoaded) return;
    setIsConnecting(true);
    
    const randomId = 'toolnest-' + Math.random().toString(36).substring(2, 8);
    
    const peer = new window.Peer!(randomId, {
      debug: 1,
    });

    peerInstance.current = peer;

    peer.on('open', (id: string) => {
      setMyPeerId(id);
      setRole('host');
      setIsDemoBot(false);
      setIsConnecting(false);
      addChatMessage('system', `Online Lobby hosted! Room ID: ${id}`);
    });

    peer.on('connection', (conn) => {
      connectionsList.current.push(conn);
    setIsConnected(true);
      setupConnection(conn);
    });

    peer.on('error', (err: Error) => {
      setIsConnecting(false);
      console.error(err);
      toast({
        title: 'Connection Error',
        description: 'Failed to create room. Please try again.',
        variant: 'destructive',
      });
    });
  };

  // Join Online Room via WebRTC
  const joinRoom = (requestedRole: 'guest' | 'spectator') => {
    if (!peerLoaded || !roomIdInput.trim()) {
      toast({ title: 'Enter Room ID', description: 'Please provide a valid Room ID.', variant: 'destructive' });
      return;
    }
    setIsConnecting(true);
    
    const peer = new window.Peer!();
    peerInstance.current = peer;

    peer.on('open', () => {
      const conn = peer.connect(roomIdInput.trim());
      connectionInstance.current = conn;

      conn.on('open', () => {
        setMyPeerId(peer.id);
        setIsDemoBot(false);
        setIsConnected(true);
        setIsConnecting(false);
        
        // Register role with Host
        conn.send({
          type: 'register',
          role: requestedRole
        });
        
        addChatMessage('system', `Connected to Host at room: ${roomIdInput}. Requesting role: ${requestedRole.toUpperCase()}...`);
        setupConnection(conn);
      });

      conn.on('error', (err: Error) => {
        setIsConnecting(false);
        console.error(err);
        toast({
          title: 'Join Failed',
          description: 'Could not connect to host. Check Room ID and try again.',
          variant: 'destructive',
        });
      });
    });

    peer.on('error', (err: Error) => {
      setIsConnecting(false);
      console.error(err);
    });
  };

  // Solo Matchmaking with a simulated BotOpponent
  const connectDemoBot = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setMyPeerId('toolnest-demo-lobby');
      setRole('host'); // User acts as host
      setIsDemoBot(true);
      setIsConnected(true);
      setIsConnecting(false);
      
      setChatMessages([]);
      addChatMessage('system', 'Connected to BotOpponent! (Offline Test Mode)');
      
      setTimeout(() => {
        addChatMessage('them', "Hi! I am BotOpponent. Let's play some games! Change the active game in the selector if you'd like.");
      }, 1000);
    }, 1200);
  };

  // Disconnect active room session
  const disconnectRoom = () => {
    if (connectionInstance.current) {
      connectionInstance.current.close();
      connectionInstance.current = null;
    }
    connectionsList.current.forEach(conn => {
      if (conn) conn.close();
    });
    connectionsList.current = [];
    guestPlayerConnId.current = null;
    
    if (peerInstance.current) {
      peerInstance.current.destroy();
      peerInstance.current = null;
    }
    setIsConnected(false);
    setIsDemoBot(false);
    setRole(null);
    setMyPeerId('');
    setChatMessages([]);
  };

  // Bot guesses drawer word
  useEffect(() => {
    if (isDemoBot && activeOnlineGame === 'drawguess' && drawWord && hasStartedDrawing) {
      const interval = setInterval(() => {
        const isCorrect = Math.random() < 0.25;
        if (isCorrect) {
          addChatMessage('them', drawWord);
          setDrawScores(s => ({ ...s, guest: s.guest + 10 }));
          addChatMessage('system', `BotOpponent guessed the word "${drawWord}"! +10 points.`);
          setTimeout(() => {
            pickNewDrawWord();
          }, 2000);
        } else {
          const wrongWords = DRAWGUESS_WORDS.filter(w => w !== drawWord);
          const wrongWord = wrongWords[Math.floor(Math.random() * wrongWords.length)];
          addChatMessage('them', wrongWord);
        }
      }, 7000);

      return () => clearInterval(interval);
    }
  }, [isDemoBot, activeOnlineGame, drawWord, hasStartedDrawing, pickNewDrawWord, addChatMessage]);

  const resetTtt = () => {
    setTttBoard(Array(9).fill(null));
    setTttTurn('X');
    if (!isDemoBot) {
      broadcastToAll({ type: 'ttt-reset' });
    }
    addChatMessage('system', 'Tic Tac Toe board reset.');
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(myPeerId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
    toast({ title: 'Room ID copied to clipboard' });
  };


  // --- LOCAL GAMES LOGIC (SINGLE DEVICE, 2 PLAYERS) ---
  
  // Local Tic Tac Toe Click
  const handleLocalTttClick = (index: number) => {
    if (localTttBoard[index] || checkTttWinner(localTttBoard)) return;
    
    const nextBoard = [...localTttBoard];
    nextBoard[index] = localTttTurn;
    setLocalTttBoard(nextBoard);

    const winner = checkTttWinner(nextBoard);
    const isDraw = !winner && nextBoard.every(cell => cell !== null);

    if (winner) {
      setLocalTttScores(s => ({
        ...s,
        x: winner === 'X' ? s.x + 1 : s.x,
        o: winner === 'O' ? s.o + 1 : s.o,
      }));
    } else if (isDraw) {
      setLocalTttScores(s => ({ ...s, ties: s.ties + 1 }));
    } else {
      setLocalTttTurn(prev => prev === 'X' ? 'O' : 'X');
    }
  };

  const resetLocalTtt = () => {
    setLocalTttBoard(Array(9).fill(null));
    setLocalTttTurn('X');
  };

  // Local Rock Paper Scissors
  const handleLocalRpsSelect = (choice: 'rock' | 'paper' | 'scissors') => {
    if (localRpsTurn === 1) {
      setLocalP1Choice(choice);
      setLocalRpsTurn(2);
    } else if (localRpsTurn === 2) {
      setLocalP2Choice(choice);
    }
  };

  const revealLocalRpsWinner = () => {
    if (!localP1Choice || !localP2Choice) return;
    let outcome = '';
    if (localP1Choice === localP2Choice) {
      outcome = "It's a Tie!";
    } else if (
      (localP1Choice === 'rock' && localP2Choice === 'scissors') ||
      (localP1Choice === 'paper' && localP2Choice === 'rock') ||
      (localP1Choice === 'scissors' && localP2Choice === 'paper')
    ) {
      outcome = 'Player 1 Wins!';
      setLocalRpsScores(s => ({ ...s, p1: s.p1 + 1 }));
    } else {
      outcome = 'Player 2 Wins!';
      setLocalRpsScores(s => ({ ...s, p2: s.p2 + 1 }));
    }
    setLocalRpsResult(outcome);
  };

  const resetLocalRps = () => {
    setLocalP1Choice(null);
    setLocalP2Choice(null);
    setLocalRpsTurn(1);
    setLocalRpsResult('');
  };

  // Local Draw & Guess canvas handlers
  const handleLocalGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localGuessInput.trim() || !localDrawWord) return;

    if (localGuessInput.trim().toLowerCase() === localDrawWord.toLowerCase()) {
      setLocalDrawScores(s => ({ ...s, guesser: s.guesser + 10 }));
      toast({ title: 'Correct Guess!', description: `The word was indeed "${localDrawWord}"! +10 points.` });
      setTimeout(() => {
        pickNewLocalDrawWord();
      }, 1500);
    } else {
      toast({ title: 'Incorrect Guess', description: 'Try again!', variant: 'destructive' });
      setLocalGuessInput('');
    }
  };

  const startLocalDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setLocalIsDrawing(true);
    const pos = getLocalCanvasPos(e);
    localLastPos.current = pos;
  };

  const drawLocalStep = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!localIsDrawing) return;
    const canvas = localCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getLocalCanvasPos(e);
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = localDrawColor;
    ctx.lineWidth = localDrawWidth;
    ctx.moveTo(localLastPos.current.x, localLastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    localLastPos.current = pos;
  };

  const stopLocalDrawing = () => {
    setLocalIsDrawing(false);
  };

  const getLocalCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = localCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Tabs (only shown when not connected/in active game) */}
        {!isConnected && !activeLocalGame && (
          <div className="flex border-b select-none">
            <button
              onClick={() => setActiveTab('local')}
              className={cn(
                "px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer",
                activeTab === 'local' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Local Play (Single Device)</span>
            </button>
            <button
              onClick={() => setActiveTab('online')}
              className={cn(
                "px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer",
                activeTab === 'online' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-1.5"><Network className="w-4 h-4" /> Online P2P Play</span>
            </button>
          </div>
        )}

        {/* --- LOCAL PLAY AREA --- */}
        {activeTab === 'local' && !isConnected && (
          <div className="space-y-6">
            
            {/* Game Picker Screen */}
            {!activeLocalGame && (
              <div className="space-y-6">
                <div className="bg-muted/30 border rounded-2xl p-5">
                  <h2 className="font-extrabold text-base flex items-center gap-2 mb-1">
                    <Swords className="w-5 h-5 text-primary" /> Single Device 2-Player Games
                  </h2>
                  <p className="text-sm text-muted-foreground">Select a game below to play directly on this device with a friend, taking turns.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Inline playable Local games */}
                  <button
                    onClick={() => setActiveLocalGame('tictactoe')}
                    className="text-left rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between h-36"
                  >
                    <div>
                      <h3 className="font-bold text-base text-primary">Tic Tac Toe</h3>
                      <p className="text-xs text-muted-foreground mt-1">Grid matches with local turns alternating between X and O.</p>
                    </div>
                    <div className="bg-muted px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider text-muted-foreground uppercase self-start">Direct Play</div>
                  </button>

                  <button
                    onClick={() => setActiveLocalGame('rps')}
                    className="text-left rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between h-36"
                  >
                    <div>
                      <h3 className="font-bold text-base text-primary">Rock Paper Scissors</h3>
                      <p className="text-xs text-muted-foreground mt-1">Pass-and-play hand matches with hidden choices.</p>
                    </div>
                    <div className="bg-muted px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider text-muted-foreground uppercase self-start">Direct Play</div>
                  </button>

                  <button
                    onClick={() => setActiveLocalGame('drawguess')}
                    className="text-left rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between h-36"
                  >
                    <div>
                      <h3 className="font-bold text-base text-primary">Draw & Guess</h3>
                      <p className="text-xs text-muted-foreground mt-1">One draws a secret word, the other types guesses on screen.</p>
                    </div>
                    <div className="bg-muted px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider text-muted-foreground uppercase self-start">Direct Play</div>
                  </button>
                </div>

                {/* External local pass-and-play links */}
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">More Board Games (Local)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {LOCAL_EXTERNAL_GAMES.map((game) => (
                      <Link
                        key={game.id}
                        to={game.path}
                        className="group rounded-xl border bg-card p-4 hover:shadow-xs hover:border-primary/30 transition-all flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{game.name}</h4>
                          <p className="text-xs text-muted-foreground">{game.desc}</p>
                        </div>
                        <span className="text-xs text-primary font-semibold flex items-center gap-1">Play Game</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Local Game Active Workspaces */}
            {activeLocalGame && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => setActiveLocalGame(null)}
                  className="gap-1.5 text-muted-foreground hover:text-foreground mb-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Local Lobby
                </Button>

                <div className="bg-card border rounded-3xl p-6 min-h-[420px] flex flex-col justify-center items-center">
                  
                  {/* Local Game: Tic Tac Toe */}
                  {activeLocalGame === 'tictactoe' && (
                    <div className="max-w-xs w-full space-y-6 text-center select-none">
                      <h3 className="font-bold text-lg">Local Tic Tac Toe</h3>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="border bg-emerald-500/5 py-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                          <div className="font-extrabold uppercase text-[9px]">Player X</div>
                          <div className="text-lg font-black">{localTttScores.x}</div>
                        </div>
                        <div className="border bg-muted py-2 rounded-xl text-muted-foreground">
                          <div className="font-extrabold uppercase text-[9px]">Ties</div>
                          <div className="text-lg font-black">{localTttScores.ties}</div>
                        </div>
                        <div className="border bg-rose-500/5 py-2 rounded-xl text-rose-600 dark:text-rose-400">
                          <div className="font-extrabold uppercase text-[9px]">Player O</div>
                          <div className="text-lg font-black">{localTttScores.o}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 bg-muted/30 p-3.5 border rounded-2xl">
                        {localTttBoard.map((cell, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleLocalTttClick(idx)}
                            className={cn(
                              "w-full aspect-square rounded-xl bg-card border flex items-center justify-center text-3xl font-black transition-all cursor-pointer hover:bg-primary/5 hover:scale-95",
                              cell === 'X' ? 'text-emerald-500' : cell === 'O' ? 'text-rose-500' : ''
                            )}
                          >
                            {cell}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="font-bold">
                          {checkTttWinner(localTttBoard) ? (
                            <span className="text-emerald-500 font-extrabold">Winner: Player {checkTttWinner(localTttBoard)}!</span>
                          ) : localTttBoard.every(cell => cell !== null) ? (
                            <span className="text-muted-foreground">It's a Tie!</span>
                          ) : (
                            <span className="text-muted-foreground">Turn: Player {localTttTurn}</span>
                          )}
                        </div>
                        <Button size="sm" variant="outline" onClick={resetLocalTtt} className="gap-1 rounded-lg">
                          <RotateCcw className="w-3.5 h-3.5" /> Next Round
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Local Game: Rock Paper Scissors */}
                  {activeLocalGame === 'rps' && (
                    <div className="max-w-xs w-full text-center space-y-6 select-none">
                      <h3 className="font-bold text-lg">Local Rock Paper Scissors</h3>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="border bg-muted/40 py-2 rounded-xl">
                          <div className="font-extrabold uppercase text-[9px]">Player 1 Score</div>
                          <div className="text-lg font-black">{localRpsScores.p1}</div>
                        </div>
                        <div className="border bg-muted/40 py-2 rounded-xl">
                          <div className="font-extrabold uppercase text-[9px]">Player 2 Score</div>
                          <div className="text-lg font-black">{localRpsScores.p2}</div>
                        </div>
                      </div>

                      {/* Game Workspace steps */}
                      <div className="space-y-4">
                        {localRpsTurn === 1 && (
                          <div className="space-y-4">
                            <p className="text-sm font-semibold text-muted-foreground">Player 1: Select your hand</p>
                            <div className="flex gap-2 justify-center">
                              {(['rock', 'paper', 'scissors'] as const).map(choice => (
                                <Button
                                  key={choice}
                                  variant="outline"
                                  onClick={() => handleLocalRpsSelect(choice)}
                                  className="w-20 h-16 text-lg font-bold rounded-xl"
                                >
                                  {choice === 'rock' ? '✊' : choice === 'paper' ? '✋' : '✌️'}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        {localRpsTurn === 2 && !localP2Choice && (
                          <div className="space-y-4 bg-muted/30 p-4 border rounded-xl animate-in fade-in duration-200">
                            <p className="text-xs text-amber-600 font-bold">Player 1 choice locked! Pass the device.</p>
                            <p className="text-sm font-semibold text-muted-foreground">Player 2: Select your hand</p>
                            <div className="flex gap-2 justify-center">
                              {(['rock', 'paper', 'scissors'] as const).map(choice => (
                                <Button
                                  key={choice}
                                  variant="outline"
                                  onClick={() => handleLocalRpsSelect(choice)}
                                  className="w-20 h-16 text-lg font-bold rounded-xl"
                                >
                                  {choice === 'rock' ? '✊' : choice === 'paper' ? '✋' : '✌️'}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        {localP1Choice && localP2Choice && !localRpsResult && (
                          <div className="space-y-3 bg-muted/30 p-5 border rounded-xl text-center">
                            <p className="text-xs text-emerald-600 font-bold">Both players have locked choices!</p>
                            <Button onClick={revealLocalRpsWinner} className="w-full font-bold rounded-xl h-11">
                              Reveal Winner!
                            </Button>
                          </div>
                        )}

                        {localRpsResult && (
                          <div className="space-y-3 bg-muted/30 p-5 border rounded-xl text-center animate-in zoom-in-95 duration-200">
                            <p className="text-xl font-black text-primary">{localRpsResult}</p>
                            <p className="text-xs text-muted-foreground">
                              Player 1 chose: <strong className="capitalize">{localP1Choice}</strong> | Player 2 chose: <strong className="capitalize">{localP2Choice}</strong>
                            </p>
                            <Button variant="ghost" onClick={resetLocalRps} className="w-full font-bold text-primary">
                              Play Next Round
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Local Game: Draw & Guess */}
                  {activeLocalGame === 'drawguess' && (
                    <div className="w-full flex flex-col items-center gap-4">
                      
                      <div className="text-center bg-muted/30 border p-3 rounded-2xl w-full max-w-[500px] flex items-center justify-between text-xs">
                        <div className="text-left">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Drawer Score:</span>
                          <p className="font-extrabold">{localDrawScores.drawer}</p>
                        </div>
                        <div className="text-center">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Secret Word:</span>
                          {showLocalWord ? (
                            <p className="font-black text-sm tracking-widest text-primary capitalize">{localDrawWord}</p>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => setShowLocalWord(true)} className="h-6 text-[10px]">
                              Reveal Word
                            </Button>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Guesser Score:</span>
                          <p className="font-extrabold">{localDrawScores.guesser}</p>
                        </div>
                      </div>

                      {/* Mode selection: Draw state or guess state */}
                      <div className="flex bg-muted p-1 rounded-xl w-full max-w-[500px]">
                        <button
                          onClick={() => setLocalDrawStepRole('drawing')}
                          className={cn(
                            "flex-1 text-center py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            localDrawStepRole === 'drawing' ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Drawer Canvas
                        </button>
                        <button
                          onClick={() => setLocalDrawStepRole('guessing')}
                          className={cn(
                            "flex-1 text-center py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            localDrawStepRole === 'guessing' ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Guesser Input
                        </button>
                      </div>

                      {/* Canvas board */}
                      <div className="w-full max-w-[500px] border-4 border-foreground rounded-2xl overflow-hidden shadow-md bg-white select-none">
                        <canvas
                          ref={localCanvasRef}
                          width={500}
                          height={300}
                          onMouseDown={startLocalDrawing}
                          onMouseMove={drawLocalStep}
                          onMouseUp={stopLocalDrawing}
                          onMouseLeave={stopLocalDrawing}
                          onTouchStart={startLocalDrawing}
                          onTouchMove={drawLocalStep}
                          onTouchEnd={stopLocalDrawing}
                          className={cn(
                            "block w-full h-[300px]",
                            localDrawStepRole === 'drawing' ? "cursor-crosshair touch-none" : "cursor-default pointer-events-none"
                          )}
                        />
                      </div>

                      {/* Controls depending on drawing role */}
                      {localDrawStepRole === 'drawing' ? (
                        <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-[500px] text-xs">
                          <div className="flex gap-1.5">
                            {['#000000', '#ef4444', '#22c55e', '#3b82f6', '#eab308'].map(c => (
                              <button
                                key={c}
                                onClick={() => setLocalDrawColor(c)}
                                className={cn(
                                  "w-6 h-6 rounded-full border border-zinc-300 shadow-inner",
                                  localDrawColor === c ? "ring-2 ring-primary ring-offset-2 scale-110" : ""
                                )}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-muted-foreground">Brush: {localDrawWidth}px</span>
                            <input
                              type="range"
                              min="2"
                              max="15"
                              value={localDrawWidth}
                              onChange={(e) => setLocalDrawWidth(parseInt(e.target.value, 10))}
                            />
                          </div>

                          <Button size="sm" variant="outline" onClick={clearLocalCanvas} className="gap-1 rounded-lg">
                            <Eraser className="w-3.5 h-3.5" /> Clear
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleLocalGuessSubmit} className="flex gap-2 w-full max-w-[500px] items-center">
                          <Input
                            placeholder="Enter your guess..."
                            value={localGuessInput}
                            onChange={(e) => setLocalGuessInput(e.target.value)}
                            className="h-10 rounded-xl flex-1 border-muted"
                          />
                          <Button type="submit" className="font-bold h-10 rounded-xl px-5">Guess</Button>
                          <Button type="button" variant="outline" onClick={pickNewLocalDrawWord} className="h-10 rounded-xl">Skip</Button>
                        </form>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        )}

        {/* --- ONLINE REAL-TIME P2P PLAY AREA --- */}
        {activeTab === 'online' && (
          <div className="space-y-6">
            
            {/* Connection Lobby Menu */}
            {!isConnected && (
              <div className="space-y-6">
                
                {/* Lobby Header Option */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Host Card */}
                  <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                        <Swords className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg">Host online Match</h3>
                        <p className="text-xs text-muted-foreground">Start an online P2P room and generate a code to invite friends.</p>
                      </div>
                    </div>

                    {myPeerId ? (
                      <div className="bg-muted/50 p-3 rounded-xl space-y-2 mt-2">
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Room ID:</div>
                        <div className="flex gap-1.5">
                          <code className="bg-card px-2 py-1.5 rounded-lg border font-mono font-bold flex-1 text-xs text-center select-all">{myPeerId}</code>
                          <Button variant="outline" size="icon" onClick={copyRoomId} className="w-8 h-8 rounded-lg">
                            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                        <p className="text-[9px] text-muted-foreground animate-pulse mt-1">Waiting for connection...</p>
                      </div>
                    ) : (
                      <Button
                        onClick={hostRoom}
                        disabled={isConnecting}
                        className="w-full font-bold h-11 rounded-xl mt-4"
                      >
                        {isConnecting ? 'Hosting...' : 'Host Match'}
                      </Button>
                    )}
                  </div>

                  {/* Join Card */}
                  <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg">Join online Match</h3>
                        <p className="text-xs text-muted-foreground">Input friend's Room ID to establish a real-time WebRTC connection.</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 mt-4">
                      <Input
                        placeholder="Paste Room ID here"
                        value={roomIdInput}
                        onChange={(e) => setRoomIdInput(e.target.value)}
                        className="h-10 rounded-xl border-muted text-sm"
                        disabled={isConnecting}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => joinRoom('guest')}
                          disabled={isConnecting || !roomIdInput.trim()}
                          className="flex-1 font-bold h-10 rounded-xl border-primary text-primary hover:bg-primary/5 text-[11px] px-1"
                        >
                          {isConnecting ? 'Connecting...' : 'Join as Player'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => joinRoom('spectator')}
                          disabled={isConnecting || !roomIdInput.trim()}
                          className="flex-1 font-bold h-10 rounded-xl border-dashed text-[11px] px-1"
                        >
                          {isConnecting ? 'Connecting...' : 'Join as Spectator'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Solo Practice Bot Card */}
                  <div className="rounded-2xl border bg-card p-6 space-y-4 shadow-xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg">Play with Bot (Solo)</h3>
                        <p className="text-xs text-muted-foreground">No friend available? Connect to our simulated BotOpponent to test the system.</p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={connectDemoBot}
                      disabled={isConnecting}
                      className="w-full font-bold h-11 rounded-xl border-dashed mt-4 gap-1.5"
                    >
                      <Bot className="w-4 h-4" /> Try Demo Bot Match
                    </Button>
                  </div>

                </div>
              </div>
            )}

            {/* Real-time Synced Gameplay Center */}
            {isConnected && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Gameplay Screen (Col 1 & 2) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Sync Navigation Header */}
                  <div className="bg-card border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 select-none">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold uppercase text-muted-foreground">
                          {isDemoBot ? 'Demo Bot Match' : 'Online Connected'}
                        </span>
                      </div>
                      <span className="text-muted-foreground/30">|</span>
                      <span className="text-sm font-semibold text-foreground">
                        {isDemoBot ? 'Playing vs BotOpponent' : `Role: ${role === 'host' ? 'Host (Player X)' : role === 'guest' ? 'Guest (Player O)' : 'Spectating Match (Read-Only)'}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {role === 'host' || role === 'guest' ? (
                        <div className="flex items-center gap-1.5">
                          <label className="text-xs font-bold uppercase text-muted-foreground">Game:</label>
                          <select
                            value={activeOnlineGame}
                            onChange={(e) => changeOnlineGame(e.target.value)}
                            className="text-xs font-bold border rounded-lg p-1.5 bg-muted cursor-pointer"
                          >
                            {ONLINE_PLAYABLE_GAMES.map(g => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-xs font-bold uppercase bg-muted px-2.5 py-1 rounded-full">
                          Playing: {ONLINE_PLAYABLE_GAMES.find(g => g.id === activeOnlineGame)?.name}
                        </span>
                      )}

                      <Button variant="ghost" size="sm" onClick={disconnectRoom} className="text-xs text-destructive hover:bg-destructive/5 font-semibold">
                        Disconnect
                      </Button>
                    </div>
                  </div>

                  {/* ACTIVE ONLINE GAME INTERFACES */}
                  <div className="bg-card border rounded-3xl p-6 min-h-[420px] flex flex-col justify-center items-center">
                    
                    {/* Game 1: Tic Tac Toe Online */}
                    {activeOnlineGame === 'tictactoe' && (
                      <div className="max-w-xs w-full space-y-6 text-center select-none">
                        
                        {/* Turn Timer Progress Bar */}
                        {!checkTttWinner(tttBoard) && !tttBoard.every(cell => cell !== null) && (
                          <div className="w-full">
                            <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-1 flex">
                              <div
                                className={cn(
                                  "h-full transition-all duration-1000",
                                  tttTimer > 5 ? "bg-primary" : "bg-destructive animate-pulse"
                                )}
                                style={{ width: `${(tttTimer / 15) * 100}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-muted-foreground font-bold tracking-wider text-right flex items-center justify-end gap-1">
                              <Clock className="w-2.5 h-2.5" /> Move Timer: {tttTimer}s
                            </p>
                          </div>
                        )}

                        {/* Sync Score Tally */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="border bg-emerald-500/5 py-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <div className="font-extrabold uppercase tracking-wider text-[9px]">{isDemoBot ? 'You (X)' : 'Host (X)'}</div>
                            <div className="text-lg font-black">{tttScores.host}</div>
                          </div>
                          <div className="border bg-muted py-2 rounded-xl text-muted-foreground">
                            <div className="font-extrabold uppercase tracking-wider text-[9px]">Ties</div>
                            <div className="text-lg font-black">{tttScores.ties}</div>
                          </div>
                          <div className="border bg-rose-500/5 py-2 rounded-xl text-rose-600 dark:text-rose-400">
                            <div className="font-extrabold uppercase tracking-wider text-[9px]">{isDemoBot ? 'Bot (O)' : 'Guest (O)'}</div>
                            <div className="text-lg font-black">{tttScores.guest}</div>
                          </div>
                        </div>

                        {/* Synced board grid */}
                        <div className="grid grid-cols-3 gap-2.5 bg-muted/30 p-3.5 border rounded-2xl">
                          {tttBoard.map((cell, idx) => {
                            const isMyTurn = (role === 'host' && tttTurn === 'X') || (role === 'guest' && tttTurn === 'O');
                            return (
                              <button
                                key={idx}
                                onClick={() => handleTttClick(idx)}
                                className={cn(
                                  "w-full aspect-square rounded-xl bg-card border flex items-center justify-center text-3xl font-black transition-all",
                                  !cell && isMyTurn ? "hover:bg-primary/5 cursor-pointer hover:scale-95" : "cursor-default",
                                  cell === 'X' ? 'text-emerald-500' : cell === 'O' ? 'text-rose-500' : ''
                                )}
                              >
                                {cell}
                              </button>
                            );
                          })}
                        </div>

                        {/* Reset button & notifications */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="font-bold">
                            {checkTttWinner(tttBoard) ? (
                              <span className="text-emerald-500 font-extrabold">Round Over: {checkTttWinner(tttBoard)} wins!</span>
                            ) : tttBoard.every(cell => cell !== null) ? (
                              <span className="text-muted-foreground">Tie Round</span>
                            ) : (
                              <span className="text-muted-foreground">
                                Turn: {tttTurn === (role === 'host' ? 'X' : 'O') ? 'Your Turn' : "Opponent's Turn"}
                              </span>
                            )}
                          </div>
                          {role === 'host' && (
                            <Button size="sm" variant="outline" onClick={resetTtt} className="gap-1 rounded-lg">
                              <RotateCcw className="w-3.5 h-3.5" /> Reset Board
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Game 2: Rock Paper Scissors Online */}
                    {activeOnlineGame === 'rps' && (
                      <div className="max-w-xs w-full text-center space-y-6 select-none">
                        
                        {/* Choice Timer Progress Bar */}
                        {!rpsResult && (
                          <div className="w-full">
                            <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-1">
                              <div
                                className={cn(
                                  "h-full transition-all duration-1000",
                                  rpsTimer > 5 ? "bg-primary" : "bg-destructive animate-pulse"
                                )}
                                style={{ width: `${(rpsTimer / 15) * 100}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-muted-foreground font-bold tracking-wider text-right flex items-center justify-end gap-1">
                              <Clock className="w-2.5 h-2.5" /> Choice Timer: {rpsTimer}s
                            </p>
                          </div>
                        )}

                        {/* Score count */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="border bg-muted/40 py-2 rounded-xl">
                            <div className="font-extrabold uppercase tracking-wider text-[9px]">{isDemoBot ? 'Your Score' : 'Host Score'}</div>
                            <div className="text-lg font-black">{rpsScores.host}</div>
                          </div>
                          <div className="border bg-muted/40 py-2 rounded-xl">
                            <div className="font-extrabold uppercase tracking-wider text-[9px]">{isDemoBot ? 'Bot Score' : 'Guest Score'}</div>
                            <div className="text-lg font-black">{rpsScores.guest}</div>
                          </div>
                        </div>

                        {/* Hands choice buttons */}
                        <div className="space-y-4">
                          <div className="text-sm font-bold text-muted-foreground">Make your choice:</div>
                          <div className="flex gap-2 justify-center">
                            {(['rock', 'paper', 'scissors'] as const).map(choice => (
                              <Button
                                key={choice}
                                variant={myRpsChoice === choice ? 'default' : 'outline'}
                                onClick={() => handleRpsSelect(choice)}
                                disabled={myRpsChoice !== null || role === 'spectator'}
                                className="w-20 h-16 text-lg font-bold capitalize rounded-xl"
                              >
                                {choice === 'rock' ? '✊' : choice === 'paper' ? '✋' : '✌️'}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Status outcomes */}
                        <div className="bg-muted/30 p-4 border rounded-xl space-y-2 text-xs">
                          {myRpsChoice && !theirRpsChoice && (
                            <p className="text-amber-600 font-semibold animate-pulse">Waiting for opponent to choose...</p>
                          )}
                          {theirRpsChoice && !myRpsChoice && (
                            <p className="text-amber-600 font-semibold">Opponent has locked choice! Make your selection.</p>
                          )}
                          {rpsResult && (
                            <div className="space-y-1">
                              <p className="text-lg font-black text-primary">{rpsResult}</p>
                              <p className="text-muted-foreground">
                                You chose: <strong className="capitalize">{myRpsChoice}</strong> | Opponent chose: <strong className="capitalize">{theirRpsChoice}</strong>
                              </p>
                              {role === 'host' && (
                                <Button size="sm" variant="ghost" onClick={resetRps} className="mt-2 text-primary font-bold">
                                  Play Next Round
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Game 3: Synced Draw and Guess */}
                    {activeOnlineGame === 'drawguess' && (
                      <div className="w-full flex flex-col items-center gap-4">
                        
                        {/* Round Timer Progress Bar */}
                        {drawWord && (
                          <div className="w-full max-w-[500px]">
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                              <div
                                className={cn(
                                  "h-full transition-all duration-1000",
                                  drawTimer > 15 ? "bg-emerald-500" : "bg-destructive animate-pulse"
                                )}
                                style={{ width: `${(drawTimer / 60) * 100}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-muted-foreground font-bold tracking-wider text-right flex items-center justify-end gap-1">
                              <Clock className="w-2.5 h-2.5" /> Round Timer: {drawTimer}s remaining
                            </p>
                          </div>
                        )}

                        {/* Word indicator */}
                        <div className="text-center bg-muted/30 border p-3 rounded-2xl w-full max-w-[500px] flex items-center justify-between">
                          <div className="text-left text-xs">
                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Your Role:</span>
                            <p className="font-extrabold text-sm">{role === 'host' ? 'Drawer (You)' : role === 'guest' ? 'Guesser' : 'Spectator (Watching)'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Secret Word:</span>
                            <p className="font-extrabold text-base tracking-widest text-primary capitalize">
                              {role === 'guest' ? drawWord.split('').map(() => '•').join(' ') : drawWord}
                            </p>
                          </div>
                          {role === 'host' && (
                            <Button size="sm" variant="ghost" onClick={pickNewDrawWord} className="h-8 rounded-lg gap-1">
                              <RotateCcw className="w-3.5 h-3.5" /> Skip
                            </Button>
                          )}
                        </div>

                        {/* Score tallies */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-[500px] text-center text-xs">
                          <div className="border bg-muted/40 py-1.5 rounded-xl font-bold">{isDemoBot ? 'Your Score' : 'Drawer Score'}: {drawScores.host}</div>
                          <div className="border bg-muted/40 py-1.5 rounded-xl font-bold">{isDemoBot ? 'Bot Score' : 'Guesser Score'}: {drawScores.guest}</div>
                        </div>

                        {/* Sync drawing canvas */}
                        <div className="w-full max-w-[500px] border-4 border-foreground rounded-2xl overflow-hidden shadow-md bg-white select-none">
                          <canvas
                            ref={canvasRef}
                            width={500}
                            height={320}
                            onMouseDown={startDrawing}
                            onMouseMove={drawStep}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={drawStep}
                            onTouchEnd={stopDrawing}
                            className={cn(
                              "block w-full h-[320px]",
                              role === 'host' ? "cursor-crosshair touch-none" : "cursor-not-allowed pointer-events-none"
                            )}
                          />
                        </div>

                        {/* Control options for Host Drawer */}
                        {role === 'host' && (
                          <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-[500px]">
                            {/* Color items */}
                            <div className="flex gap-1.5">
                              {['#000000', '#ef4444', '#22c55e', '#3b82f6', '#eab308'].map(c => (
                                <button
                                  key={c}
                                  onClick={() => setDrawColor(c)}
                                  className={cn(
                                    "w-6 h-6 rounded-full border border-zinc-300 shadow-inner",
                                    drawColor === c ? "ring-2 ring-primary ring-offset-2 scale-110" : ""
                                  )}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>

                            {/* Width settings */}
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-semibold text-muted-foreground">Brush: {drawWidth}px</span>
                              <input
                                type="range"
                                min="2"
                                max="15"
                                value={drawWidth}
                                onChange={(e) => setDrawWidth(parseInt(e.target.value, 10))}
                              />
                            </div>

                            <Button size="sm" variant="outline" onClick={clearCanvas} className="gap-1 rounded-lg">
                              <Eraser className="w-3.5 h-3.5" /> Clear
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                </div>

                {/* Real-time Chat Panel (Col 3) */}
                <div className="lg:col-span-1 rounded-2xl border bg-card p-4 h-[500px] flex flex-col shadow-xs">
                  <div className="font-extrabold text-sm border-b pb-3 mb-3 flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-primary" /> Lobby Chat
                  </div>

                  {/* Messages box */}
                  <ScrollArea className="flex-1 overflow-y-auto pr-1 mb-4 h-[350px]">
                    <div className="space-y-2.5">
                      {chatMessages.map(msg => (
                        <div
                          key={msg.id}
                          className={cn(
                            "p-2.5 rounded-xl text-xs max-w-[85%] break-words leading-relaxed animate-in fade-in zoom-in-95 duration-200",
                            msg.sender === 'me'
                              ? "bg-primary text-primary-foreground ml-auto rounded-tr-none"
                              : msg.sender === 'them'
                              ? "bg-muted text-foreground mr-auto rounded-tl-none border"
                              : "bg-amber-500/5 text-amber-700 dark:text-amber-400 border border-amber-500/10 text-center max-w-full font-medium italic mx-auto"
                          )}
                        >
                          {msg.text}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Chat input box */}
                  <form onSubmit={sendChatMessage} className="flex gap-2 border-t pt-3 mt-auto">
                    <Input
                      placeholder={activeOnlineGame === 'drawguess' && role === 'guest' ? "Type guess word..." : "Type chat message..."}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="h-10 rounded-xl text-xs border-muted"
                      maxLength={100}
                    />
                    <Button type="submit" size="icon" className="w-10 h-10 rounded-xl flex-shrink-0">
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </form>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </ToolLayout>
  );
}
