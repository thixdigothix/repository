'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, XCircle, RefreshCw, Layers, Swords, User, AlertTriangle, Settings, Plus, Trash2, Download, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';

// --- Socket Setup ---
let socket: Socket;

// --- Data ---
interface RankingItem {
  posicao: number;
  nome: string;
  variantes?: string[];
  dica?: string;
}

interface JogoLista {
  titulo: string;
  subtitulo: string;
  respostas: RankingItem[];
}

const LISTAS_POP: JogoLista[] = [
  {
    titulo: "Top 10 Séries Mais Assistidas da Netflix",
    subtitulo: "Baseado em horas assistidas (Top Global)",
    respostas: [
      { posicao: 1, nome: "Squid Game", variantes: ["Round 6"], dica: "Série coreana" },
      { posicao: 2, nome: "Wednesday", variantes: ["Wandinha"], dica: "Quarta" },
      { posicao: 3, nome: "Stranger Things", variantes: ["Stranger Things"], dica: "Muptet" },
      { posicao: 4, nome: "Dahmer", variantes: ["Monster Dahmer"], dica: "Serial killer" },
      { posicao: 5, nome: "Money Heist Part 5", variantes: ["La Casa de Papel"], dica: "Assalto" },
      { posicao: 6, nome: "Bridgerton", variantes: ["Brigerton"], dica: "Drama de época" },
      { posicao: 7, nome: "The Witcher", variantes: ["Witcher"], dica: "Geralt" },
      { posicao: 8, nome: "The Night Agent", variantes: ["Night Agent"], dica: "Série política" },
      { posicao: 9, nome: "Lupin", variantes: ["Lupan"], dica: "Ladrão francês" },
      { posicao: 10, nome: "Sex Education", variantes: ["Sex Education"], dica: "Comédia adolescente" },
    ]
  },
  {
    titulo: "Top 10 Países com Maior IDH",
    subtitulo: "Índice de Desenvolvimento Humano Global",
    respostas: [
      { posicao: 1, nome: "Suíça", variantes: ["Suica", "Switzerland"], dica: "Sede de diversas organizações internacionais na Europa" },
      { posicao: 2, nome: "Noruega", variantes: ["Norway"], dica: "Grande fundo soberano vindo de recursos naturais" },
      { posicao: 3, nome: "Islândia", variantes: ["Islandia", "Iceland"], dica: "Baixa população e alta produção de energia geotérmica" },
      { posicao: 4, nome: "Hong Kong", variantes: ["Hong Kong SAR"], dica: "Importante centro financeiro asiático com status especial" },
      { posicao: 5, nome: "Austrália", variantes: ["Australia"], dica: "Economia desenvolvida baseada também em mineração" },
      { posicao: 6, nome: "Dinamarca", variantes: ["Denmark"], dica: "Monarquia europeia com alto índice de bem-estar social" },
      { posicao: 7, nome: "Suécia", variantes: ["Suecia", "Sweden"], dica: "País escandinavo com forte estado de bem-estar" },
      { posicao: 8, nome: "Irlanda", variantes: ["Ireland"], dica: "Sede europeia de várias multinacionais de tecnologia" },
      { posicao: 9, nome: "Alemanha", variantes: ["Germany"], dica: "Potência industrial e exportadora da Europa" },
      { posicao: 10, nome: "Países Baixos", variantes: ["Paises Baixos", "Netherlands", "Holanda"], dica: "Grande hub logístico com porto de Rotterdam" },
    ]
  },
  {
    titulo: "Top 10 Brasileiros Mais Seguidos no Instagram",
    subtitulo: "Personalidades com maior alcance digital",
    respostas: [
      { posicao: 1, nome: "Neymar", variantes: ["Neymar Jr", "Neymar Junior"], dica: "Jogador brasileiro com passagem pelo Barcelona e PSG" },
      { posicao: 2, nome: "Ronaldinho Gaúcho", variantes: ["Ronaldinho", "R10"], dica: "Ex-jogador eleito melhor do mundo nos anos 2000" },
      { posicao: 3, nome: "Marcelo", variantes: ["Marcelo Vieira", "Marcelo Jr"], dica: "Lateral histórico do Real Madrid" },
      { posicao: 4, nome: "Anitta", variantes: ["Larissa de Macedo Machado"], dica: "Cantora pop brasileira com carreira internacional" },
      { posicao: 5, nome: "Vinicius Jr", variantes: ["Vini Jr", "Vinicius Junior"], dica: "Atacante brasileiro destaque no Real Madrid" },
      { posicao: 6, nome: "Whindersson Nunes", variantes: ["Whindersson", "Whinderson"], dica: "Criador de conteúdo que começou no YouTube" },
      { posicao: 7, nome: "Tatá Werneck", variantes: ["Tata Werneck"], dica: "Atriz e apresentadora brasileira" },
      { posicao: 8, nome: "Virginia Fonseca", variantes: ["Virginia"], dica: "Influenciadora e empresária digital" },
      { posicao: 9, nome: "Larissa Manoela", variantes: ["Larissa"], dica: "Atriz revelada em novelas infantis" },
      { posicao: 10, nome: "Maisa", variantes: ["Maisa Silva"], dica: "Apresentadora e atriz jovem brasileira" },
    ]
  },
  {
    titulo: "Músicas da Sabrina Carpenter mais vistas no Youtube",
    subtitulo: "Hits da artista com maior número de visualizações",
    respostas: [
      { posicao: 1, nome: "Espresso", variantes: ["Expresso", "Espreso"], dica: "Café" },
      { posicao: 2, nome: "Please Please Please", variantes: ["Please", "Please Please"], dica: "Por obsequio" },
      { posicao: 3, nome: "Thumbs", variantes: ["Thumb", "Tumbs"], dica: "Dedo" },
      { posicao: 4, nome: "Taste", variantes: ["Tastes"], dica: "Jenna" },
      { posicao: 5, nome: "Manchild", variantes: ["Manchield"], dica: "And they are pigs" },
      { posicao: 6, nome: "Feather", variantes: ["Fether", "Feater"], dica: "Catolicismo" },
      { posicao: 7, nome: "Nonsense", variantes: ["Non sense", "No sense", "Nosense"], dica: "Aos que se referem" },
      { posicao: 8, nome: "Eyes Wide Open", variantes: ["Eyes", "Eyes wide open", "eye wide open", "eyes open"], dica: "Olhos" },
      { posicao: 9, nome: "Tears", variantes: ["Tear"], dica: "Chorar" },
      { posicao: 10, nome: "Can't Blame a Girl", variantes: ["Cant Blame a Girl", "Blame a Girl"], dica: "12 anos atrás" },
    ]
  },
  {
    titulo: "Bairros mais populosos de Teresópolis",
    subtitulo: "Bairros oficiais da cidade",
    respostas: [
      { posicao: 1, nome: "São Pedro", variantes: ["Vidigueira", "Sao Pedro"], dica: "Tiro de Guerra" },
      { posicao: 2, nome: "Várzea", variantes: ["Varzea", "Varsea"], dica: "Rolés" },
      { posicao: 3, nome: "Barra do Imbúi", variantes: ["Barra", "Barra do Imbui"], dica: "Corte da..." },
      { posicao: 4, nome: "Meudon", variantes: ["Meudom", "Meudon"], dica: "Meu atacadista" },
      { posicao: 5, nome: "Quinta Lebrão", variantes: ["Quinta Lebrao", "Quinta Lebron"], dica: "Quarta..." },
      { posicao: 6, nome: "Alto", variantes: ["Auto"], dica: "Feira" },
      { posicao: 7, nome: "Granja Florestal", variantes: ["Granja"], dica: "Pedra da Tartartuga" },
      { posicao: 8, nome: "Jardim Meudon", variantes: ["Jardim Meudom"], dica: "Garden" },
      { posicao: 9, nome: "Tijuca", variantes: ["Tiguca"], dica: "Alterdata" },
      { posicao: 10, nome: "Agriões", variantes: ["Agrioes"], dica: "Sylvio Neto" },
    ]
  },
  {
    titulo: "Os 10 artistas favoritos de Thiago Alencar",
    subtitulo: "Um tema feito em maio de 2025",
    respostas: [
      { posicao: 1, nome: "The Beatles", variantes: ["Beatles"], dica: "Goats" },
      { posicao: 2, nome: "Yun Li", variantes: ["Yung Lixo", "Yun Lixo"], dica: "Todos odeiam mas eu amo" },
      { posicao: 3, nome: "Tyler, The Creator", variantes: ["Tyler The Creator", "Tyler", "Tyler the cretor"], dica: "Quera geta quis" },
      { posicao: 4, nome: "Pink Floyd", variantes: ["Pink Floid"], dica: "Dark side" },
      { posicao: 5, nome: "Bob Dylan", variantes: ["Bob Dilan", "Bob"], dica: "Folk e gaita" },
      { posicao: 6, nome: "Lô Borges", variantes: ["Lo Borges"], dica: "Clube da esquina" },
      { posicao: 7, nome: "One Direction", variantes: ["1D", "One Diretion", "One D"], dica: "Valor sentimental" },
      { posicao: 8, nome: "Tears For Fears", variantes: ["ters For fears", "Tears for fers"], dica: "Evebody wants to rule the world" },
      { posicao: 9, nome: "Clairo", variantes: ["Claire", "Claro"], dica: "Bedroom pop" },
      { posicao: 10, nome: "Kanye West", variantes: ["Ye", "Kanye"], dica: "Work hard make better" },
    ]
  }
];

// --- Helpers ---
const normalizar = (texto: string) => {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
};

// --- Sound Engine ---
const playSound = (type: 'correct' | 'wrong' | 'win' | 'hint') => {
  if (typeof window === 'undefined') return;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'correct') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'wrong') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.2);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'hint') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(990, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'win') {
    osc.type = 'square';
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
    });
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc.start(now);
    osc.stop(now + 0.6);
  }
};

// --- Components ---
function VariantInput({ value, onChange }: { value: string[], onChange: (v: string[]) => void }) {
  const [internalValue, setInternalValue] = useState(value.join(', '));
  const [prevValue, setPrevValue] = useState(value);

  // Sync internal value when the external value changes (e.g. list switched)
  if (value !== prevValue) {
    setPrevValue(value);
    setInternalValue(value.join(', '));
  }

  return (
    <input 
      className="w-full bg-transparent p-1 text-[9px] opacity-40 focus:opacity-100 transition-opacity focus:outline-none"
      placeholder="Variantes (ex: Spiderman, Peter Parker)"
      value={internalValue}
      onChange={(e) => {
        const newVal = e.target.value;
        setInternalValue(newVal);
        if (!newVal.endsWith(',') && !newVal.endsWith(' ')) {
          onChange(newVal.split(',').map(v => v.trim()).filter(Boolean));
        }
      }}
      onBlur={() => {
        const finalValue = internalValue.split(',').map(v => v.trim()).filter(Boolean);
        setInternalValue(finalValue.join(', '));
        onChange(finalValue);
      }}
    />
  );
}

interface PlayerState {
  score: number;
  errors: number;
  hintsUsed: number;
  input: string;
  isBlocked: boolean;
  lastFeedback: 'correct' | 'wrong' | 'hint' | null;
}

export default function GamePage() {
  const [gameMode, setGameMode] = useState<'menu' | 'solo' | 'versus' | 'versus_select' | 'online_lobby' | 'dev'>('menu');
  const [isOnline, setIsOnline] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [myRole, setMyRole] = useState<number | null>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1);
  const [listasCustom, setListasCustom] = useState<JogoLista[]>(LISTAS_POP);
  const [listIndex, setListIndex] = useState(0);
  const [isListSelectorOpen, setIsListSelectorOpen] = useState(false);
  const [revealed, setRevealed] = useState<{ [key: number]: number }>({}); // pos: playerId
  const [revealedHints, setRevealedHints] = useState<number[]>([]); // New: array of positions with hints revealed
  const [p1, setP1] = useState<PlayerState>({ score: 0, errors: 0, hintsUsed: 0, input: '', isBlocked: false, lastFeedback: null });
  const [p2, setP2] = useState<PlayerState>({ score: 0, errors: 0, hintsUsed: 0, input: '', isBlocked: false, lastFeedback: null });
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');

  // Dev state
  const [editingList, setEditingList] = useState<JogoLista | null>(null);

  const currentList = listasCustom[listIndex] || { titulo: "Sem Lista", subtitulo: "Crie uma lista no Modo Dev", respostas: [] };

  // Logic
  const handleHint = (playerId: 1 | 2, pos?: number, fromRemote = false) => {
    if (gameState === 'finished') return;
    if (gameMode === 'versus' && currentTurn !== playerId) return;
    if (isOnline && !fromRemote && playerId !== myRole) return;

    if (!fromRemote && socket) {
      if (isOnline) {
        socket.emit('gameEvent', { roomCode, event: { type: 'hint', playerId, pos } });
      } else {
        socket.emit('resposta', { type: 'hint', playerId, pos });
      }
    }

    const player = playerId === 1 ? p1 : p2;
    const setPlayer = playerId === 1 ? setP1 : setP2;
    const hintLimit = gameMode === 'versus' ? 1 : 3;

    if (player.hintsUsed >= hintLimit || player.isBlocked) return;

    if (pos !== undefined) {
      if (revealed[pos] || revealedHints.includes(pos)) return;
      setRevealedHints(prev => [...prev, pos]);
      setPlayer(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1, lastFeedback: 'hint' }));
      playSound('hint');
      setTimeout(() => setPlayer(prev => ({ ...prev, lastFeedback: null })), 800);
      return;
    }

    // Fallback: Find a random unrevealed item to give a hint for
    const unrevealedItems = currentList.respostas.filter(item => !revealed[item.posicao] && !revealedHints.includes(item.posicao));
    
    if (unrevealedItems.length > 0) {
      const randomItem = unrevealedItems[Math.floor(Math.random() * unrevealedItems.length)];
      setRevealedHints(prev => [...prev, randomItem.posicao]);
      setPlayer(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1, lastFeedback: 'hint' }));
      playSound('hint');
      setTimeout(() => setPlayer(prev => ({ ...prev, lastFeedback: null })), 800);
    }
  };

  const handleGuess = (playerId: 1 | 2, value: string, fromRemote = false) => {
    if (gameState === 'finished') return;
    if (gameMode === 'versus' && currentTurn !== playerId) return;
    if (isOnline && !fromRemote && playerId !== myRole) return;
    
    if (!fromRemote && socket) {
      if (isOnline) {
        socket.emit('gameEvent', { roomCode, event: { type: 'guess', playerId, value } });
      } else {
        socket.emit('resposta', { type: 'guess', playerId, value });
      }
    }
    const player = playerId === 1 ? p1 : p2;
    const setPlayer = playerId === 1 ? setP1 : setP2;
    const otherPlayer = playerId === 1 ? p2 : p1;

    if (player.isBlocked) return;

    const normalizedGuess = normalizar(value);
    if (!normalizedGuess) return;

    // Find if guess matches any item
    let foundItem: RankingItem | null = null;
    currentList.respostas.forEach(item => {
      const isMatch = normalizar(item.nome) === normalizedGuess || 
                      (item.variantes?.some(v => normalizar(v) === normalizedGuess));
      
      if (isMatch) {
        foundItem = item;
      }
    });

    const finishTurn = (isCorrect: boolean) => {
      if (gameMode === 'versus') {
        // Switch turn if other player is not blocked
        if (!otherPlayer.isBlocked) {
          setCurrentTurn(playerId === 1 ? 2 : 1);
        }
      }
    };

    if (foundItem) {
      const item = foundItem as RankingItem;
      // Is already revealed?
      if (revealed[item.posicao]) {
        // Just clear input
        setPlayer(prev => ({ ...prev, input: '' }));
      } else {
        // Success!
        const points = item.posicao; // Position 10 = 10 pts, Position 1 = 1 pt
        playSound('correct');
        const newRevealed = { ...revealed, [item.posicao]: playerId };
        setRevealed(newRevealed);
        setPlayer(prev => ({ 
          ...prev, 
          score: prev.score + points, 
          input: '', 
          lastFeedback: 'correct' 
        }));
        
        // Check if all revealed
        if (Object.keys(newRevealed).length === 10) {
          setGameState('finished');
          playSound('win');
        } else {
          finishTurn(true);
        }

        // Reset feedback after animation
        setTimeout(() => setPlayer(prev => ({ ...prev, lastFeedback: null })), 800);
      }
    } else {
      // Error
      playSound('wrong');
      const newErrors = player.errors + 1;
      const isBlocked = newErrors >= 3;
      
      setPlayer(prev => ({ 
        ...prev, 
        errors: newErrors, 
        input: '', 
        isBlocked: isBlocked,
        lastFeedback: 'wrong'
      }));

      // Check if game over
      if (gameMode === 'solo') {
        if (isBlocked) {
          setGameState('finished');
          playSound('win');
        }
      } else {
        // Versus
        if (isBlocked && otherPlayer.isBlocked) {
          setGameState('finished');
          playSound('win');
        } else {
          finishTurn(false);
        }
      }

      setTimeout(() => setPlayer(prev => ({ ...prev, lastFeedback: null })), 800);
    }
  };

  const resetGame = (fromRemote = false) => {
    if (!fromRemote && socket) {
      if (isOnline) {
        socket.emit('gameEvent', { roomCode, event: { type: 'reset' } });
      } else {
        socket.emit('resposta', { type: 'reset' });
      }
    }
    setRevealed({});
    setRevealedHints([]);
    setP1({ score: 0, errors: 0, hintsUsed: 0, input: '', isBlocked: false, lastFeedback: null });
    setP2({ score: 0, errors: 0, hintsUsed: 0, input: '', isBlocked: false, lastFeedback: null });
    setGameState('playing');
    setCurrentTurn(1);
  };

  // Refs for handlers to avoid stale closures in socket effect
  const handleGuessRef = useRef(handleGuess);
  const handleHintRef = useRef(handleHint);
  const resetGameRef = useRef(resetGame);
  const setListIndexRef = useRef(setListIndex);
  const setGameModeRef = useRef(setGameMode);

  useEffect(() => {
    handleGuessRef.current = handleGuess;
    handleHintRef.current = handleHint;
    resetGameRef.current = resetGame;
    setListIndexRef.current = setListIndex;
    setGameModeRef.current = setGameMode;
  }, [handleGuess, handleHint, resetGame, setListIndex, setGameMode]);

  // Multi-player Socket Logic
  useEffect(() => {
    socket = io();

    socket.on('joined', ({ role, room }: any) => {
      setMyRole(role);
      setRoomData(room);
      setGameMode('versus');
      setError(null);
    });

    socket.on('roomUpdate', (room: any) => {
      setRoomData(room);
    });

    socket.on('gameEvent', (event: any) => {
      if (event.type === 'guess') {
        handleGuessRef.current(event.playerId, event.value, true);
      } else if (event.type === 'hint') {
        handleHintRef.current(event.playerId, event.pos, true);
      } else if (event.type === 'reset') {
        resetGameRef.current(true);
      }
    });

    socket.on('error', (msg: string) => {
      setError(msg);
    });

    socket.on('resposta', (data: any) => {
      console.log('Recebido via socket:', data);
      if (data.type === 'guess') {
        handleGuessRef.current(data.playerId, data.value, true);
      } else if (data.type === 'hint') {
        handleHintRef.current(data.playerId, data.pos, true);
      } else if (data.type === 'reset') {
        resetGameRef.current(true);
      } else if (data.type === 'changeList') {
        setListIndexRef.current(data.index);
        resetGameRef.current(true);
      } else if (data.type === 'mode') {
        setGameModeRef.current(data.mode);
        resetGameRef.current(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const quitToMenu = () => {
    setGameMode('menu');
    resetGame();
  };

  const nextList = () => {
    setListIndex((prev) => (prev + 1) % listasCustom.length);
    resetGame();
  };

  const winner = p1.score > p2.score ? 1 : p2.score > p1.score ? 2 : 0;

  if (gameMode === 'menu' || gameMode === 'versus_select' || gameMode === 'online_lobby') {
    return (
      <main className="min-h-screen bg-black text-[#e4e3e0] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-12">
          <header>
             <motion.div 
               initial={{ y: -20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="inline-flex items-center gap-3 px-4 py-1 mb-6 border border-[#e4e3e0]/20 rounded-full text-[10px] uppercase tracking-[0.2em] font-mono text-[#e4e3e0]/60"
             >
               Cultura Pop & Conhecimento
             </motion.div>
             <motion.h1 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="text-6xl md:text-8xl font-mono font-bold tracking-tighter uppercase italic leading-[0.85] mb-4"
             >
               Top 10 Cultural
             </motion.h1>
             <p className="text-[#e4e3e0]/40 font-mono text-sm tracking-widest uppercase">O Jogo de Listas Definitivo</p>
          </header>

          <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", listasCustom.length === 0 && "opacity-50 grayscale pointer-events-none")}>
            <button 
              disabled={listasCustom.length === 0}
              onClick={() => { 
                setGameMode('solo'); 
                resetGame();
                if (socket) socket.emit('resposta', { type: 'mode', mode: 'solo' });
              }}
              className="group relative p-8 border border-[#e4e3e0]/10 bg-[#0a0a0a] hover:border-cyan-500/50 transition-all text-left space-y-4"
            >
              <User size={32} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              <div>
                <h2 className="text-xl font-mono font-bold uppercase tracking-tight">Modo Solo</h2>
                <p className="text-xs text-[#e4e3e0]/40 font-mono leading-relaxed mt-1">Treine seus conhecimentos e tente completar o Top 10 sozinho.</p>
              </div>
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-cyan-400 group-hover:w-full transition-all duration-500" />
            </button>

            <button 
              disabled={listasCustom.length === 0}
              onClick={() => { 
                setGameMode('versus_select'); 
              }}
              className="group relative p-8 border border-[#e4e3e0]/10 bg-[#0a0a0a] hover:border-pink-500/50 transition-all text-left space-y-4"
            >
              <Swords size={32} className="text-pink-400 group-hover:scale-110 transition-transform" />
              <div>
                <h2 className="text-xl font-mono font-bold uppercase tracking-tight">Modo Versus</h2>
                <p className="text-xs text-[#e4e3e0]/40 font-mono leading-relaxed mt-1">Desafie um amigo localmente ou em uma sala online privada.</p>
              </div>
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-pink-400 group-hover:w-full transition-all duration-500" />
            </button>
          </div>

          <AnimatePresence>
            {gameMode === 'versus_select' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8"
              >
                <button 
                  onClick={() => {
                    setGameMode('versus');
                    setIsOnline(false);
                    resetGame();
                    if (socket) socket.emit('resposta', { type: 'mode', mode: 'versus' });
                  }}
                  className="p-6 border border-[#e4e3e0]/10 bg-[#0a0a0a] hover:border-pink-500/50 transition-all"
                >
                  <h3 className="font-mono font-bold uppercase">Versus Local</h3>
                  <p className="text-[10px] opacity-40 uppercase mt-1">Jogadores no mesmo dispositivo</p>
                </button>
                <button 
                  onClick={() => {
                    setGameMode('online_lobby');
                    setIsOnline(true);
                  }}
                  className="p-6 border border-[#e4e3e0]/10 bg-[#0a0a0a] hover:border-cyan-500/50 transition-all"
                >
                  <h3 className="font-mono font-bold uppercase">Versus Online</h3>
                  <p className="text-[10px] opacity-40 uppercase mt-1">Jogue contra amigos via código</p>
                </button>
              </motion.div>
            )}

            {gameMode === 'online_lobby' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="max-w-md mx-auto mt-8 p-8 border border-[#e4e3e0]/10 bg-[#0a0a0a] space-y-6"
              >
                <h3 className="text-xl font-mono font-bold uppercase text-cyan-400">Sala Online</h3>
                
                <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono opacity-40 uppercase font-bold">Seu Apelido</label>
                    <input 
                      type="text"
                      className="w-full bg-black border border-white/10 p-4 text-sm focus:border-cyan-400 outline-none uppercase"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                      placeholder="EX: THIAGO"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono opacity-40 uppercase font-bold">Código da Sala</label>
                    <input 
                      type="text"
                      className="w-full bg-black border border-white/10 p-4 text-sm focus:border-cyan-400 outline-none uppercase"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="EX: TOP10"
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-[10px] font-mono uppercase">{error}</p>}

                <div className="flex gap-4">
                  <button 
                    onClick={() => setGameMode('menu')}
                    className="flex-1 py-3 border border-white/10 text-[10px] font-mono uppercase"
                  >
                    Voltar
                  </button>
                  <button 
                    disabled={!playerName || !roomCode}
                    onClick={() => {
                      if (socket) {
                        socket.emit('joinRoom', { roomCode, playerName });
                      }
                    }}
                    className="flex-2 py-3 bg-cyan-500 text-black font-mono font-bold uppercase text-[10px] hover:bg-cyan-400 disabled:opacity-50"
                  >
                    Entrar na Sala
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {listasCustom.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[10px] uppercase tracking-widest inline-block"
            >
              ⚠️ Nenhuma lista encontrada. Ative o Modo Desenvolvedor abaixo para começar.
            </motion.div>
          )}

          {/* Hidden Dev Trigger */}
          <div className="pt-20 opacity-0 hover:opacity-10 transition-opacity">
            <button 
              onClick={() => setGameMode('dev')}
              className="font-mono text-[8px] uppercase tracking-[0.5em] text-[#e4e3e0]"
            >
              Modo Desenvolvedor [SECURE_ACCESS]
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (gameMode === 'dev') {
    return (
      <main className="min-h-screen bg-[#050505] text-[#e4e3e0] p-8 font-mono">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex justify-between items-center border-b border-[#e4e3e0]/10 pb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tighter uppercase italic flex items-center gap-3">
                <Settings className="text-cyan-400" /> Top 10 Cultural: Dev Tools
              </h1>
              <p className="text-[10px] opacity-40 mt-1 uppercase tracking-widest font-bold">Criação, Edição e Conversão para JSON</p>
            </div>
            <button 
              onClick={quitToMenu}
              className="text-[10px] bg-red-500/10 text-red-400 uppercase tracking-widest border border-red-500/20 px-6 py-2 hover:bg-red-500 hover:text-black transition-all"
            >
              Sair do Editor
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar: List Navigator */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest opacity-60">Bibliotecas de Listas</h2>
                <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded">{listasCustom.length} TOTAL</span>
              </div>
              
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {listasCustom.map((lista, idx) => (
                  <div key={idx} className={cn(
                    "group flex items-center justify-between p-4 bg-[#0a0a0a] border transition-all cursor-pointer",
                    editingList?.titulo === lista.titulo ? "border-cyan-400 ring-1 ring-cyan-400/20" : "border-[#e4e3e0]/10 hover:border-[#e4e3e0]/30"
                  )}
                  onClick={() => setEditingList(JSON.parse(JSON.stringify(lista)))}
                  >
                    <div>
                      <h3 className="text-sm font-bold uppercase truncate max-w-[180px]">{lista.titulo}</h3>
                      <p className="text-[9px] opacity-40 uppercase font-bold tracking-tighter">Posições: {lista.respostas.length}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const newListas = listasCustom.filter((_, i) => i !== idx);
                        setListasCustom(newListas);
                        if (editingList?.titulo === lista.titulo) setEditingList(null);
                      }}
                      className="p-2 hover:bg-red-500/10 text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => {
                  const newEntry: JogoLista = {
                    titulo: `Nova Lista ${listasCustom.length + 1}`,
                    subtitulo: "Descrição da nova lista",
                    respostas: Array.from({ length: 10 }, (_, i) => ({ posicao: i + 1, nome: "" }))
                  };
                  setListasCustom([...listasCustom, newEntry]);
                  setEditingList(newEntry);
                }}
                className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-500 text-black font-bold text-xs uppercase hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              >
                <Plus size={16} /> Criar Nova Lista do Zero
              </button>

              <div className="pt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">JSON Global App</h2>
                  <Download size={12} className="opacity-40" />
                </div>
                <textarea 
                  readOnly
                  value={JSON.stringify(listasCustom, null, 2)}
                  className="w-full h-40 bg-black border border-white/5 p-4 font-mono text-[9px] text-[#e4e3e0]/40 focus:outline-none custom-scrollbar resize-none"
                  placeholder="Seu código JSON completo aparecerá aqui..."
                />
              </div>
            </div>

            {/* Main Editor: Detail and Code Generation */}
            <div className="lg:col-span-8 space-y-6">
              {editingList ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="bg-[#0a0a0a] border border-cyan-500/20 p-8 space-y-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h2 className="text-xl font-bold uppercase tracking-tighter">Editor Ativo</h2>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest italic">Personalize os itens e gere o código JSON</p>
                      </div>
                      <button 
                        onClick={() => {
                          const json = JSON.stringify(editingList, null, 2);
                          navigator.clipboard.writeText(json);
                          alert("O JSON desta lista específica foi copiado!");
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold text-[10px] uppercase hover:bg-cyan-400 transition-all"
                      >
                        <Download size={14} /> Gerar JSON desta Lista
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase opacity-30">Título Principal</label>
                          <input 
                            className="w-full bg-black border border-white/10 p-4 text-sm focus:border-cyan-500/50 outline-none transition-all"
                            value={editingList.titulo}
                            onChange={(e) => setEditingList({...editingList, titulo: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase opacity-30">Subtítulo Informativo</label>
                          <input 
                            className="w-full bg-black border border-white/10 p-4 text-sm focus:border-cyan-500/50 outline-none transition-all"
                            value={editingList.subtitulo}
                            onChange={(e) => setEditingList({...editingList, subtitulo: e.target.value})}
                          />
                        </div>

                        <div className="pt-6">
                          <label className="text-[10px] font-bold uppercase opacity-30 block mb-4">Prévia do Código JSON (Lista Atual)</label>
                          <div className="bg-black/50 border border-white/5 p-4 rounded-md">
                            <pre className="text-[10px] text-cyan-400/60 overflow-x-auto max-h-[300px] custom-scrollbar">
                              {JSON.stringify(editingList, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase opacity-30 block">Configuração de Respostas</label>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                          {editingList.respostas.map((r, idx) => (
                            <div key={`${editingList.titulo}-${idx}`} className="flex gap-2 items-center bg-white/5 p-1 px-3 border border-white/5 hover:border-white/10 transition-all">
                              <span className="w-10 text-[10px] font-bold text-cyan-400">{r.posicao}º</span>
                              <div className="flex-1 space-y-1">
                                <input 
                                  className="w-full bg-transparent p-1 text-[11px] focus:outline-none border-b border-transparent focus:border-cyan-500 font-bold"
                                  placeholder="Nome"
                                  value={r.nome}
                                  onChange={(e) => {
                                    const nr = [...editingList.respostas];
                                    nr[idx] = { ...nr[idx], nome: e.target.value };
                                    setEditingList({...editingList, respostas: nr});
                                  }}
                                />
                                <VariantInput 
                                  value={r.variantes || []} 
                                  onChange={(newVariants) => {
                                    const nr = [...editingList.respostas];
                                    nr[idx] = { ...nr[idx], variantes: newVariants };
                                    setEditingList({...editingList, respostas: nr});
                                  }}
                                />
                                <input 
                                  className="w-full bg-transparent p-1 text-[10px] text-yellow-500/60 focus:text-yellow-500 focus:outline-none border-t border-white/5 mt-1"
                                  placeholder="Dica (ex: Ele usa uma capa preta)"
                                  value={r.dica || ""}
                                  onChange={(e) => {
                                    const nr = [...editingList.respostas];
                                    nr[idx] = { ...nr[idx], dica: e.target.value };
                                    setEditingList({...editingList, respostas: nr});
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => {
                          const newListas = listasCustom.map(l => l.titulo === editingList.titulo ? editingList : l);
                          setListasCustom(newListas);
                          alert("Lista salva temporariamente na memória principal!");
                        }}
                        className="flex-1 py-4 bg-cyan-500 text-black font-bold uppercase text-xs hover:bg-cyan-400 transition-all"
                      >
                        Sincronizar com Jogo
                      </button>
                      <button 
                        onClick={() => setEditingList(null)}
                        className="px-8 py-4 border border-white/10 text-xs font-bold uppercase hover:bg-white/5 transition-all"
                      >
                        Fechar Editor
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                   <div className="relative mb-6">
                      <Edit2 size={48} className="text-white/10" />
                      <Plus size={24} className="absolute -bottom-2 -right-2 text-cyan-400" />
                   </div>
                   <h3 className="text-sm font-bold uppercase tracking-widest opacity-40 mb-2">Editor Vazio</h3>
                   <p className="text-[10px] opacity-20 uppercase tracking-tighter text-center max-w-xs">
                     Selecione uma lista na barra lateral ou crie uma nova para começar a editar os dados e gerar JSON.
                   </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-[#e4e3e0] font-sans selection:bg-cyan-500/30 overflow-x-hidden p-3 md:p-8">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6 md:mb-12 text-center relative px-2">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
          <button 
            onClick={quitToMenu}
            className="text-[10px] font-mono uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
          >
            <XCircle size={14} /> Sair do Jogo
          </button>

          {isOnline && (
            <div className="flex items-center gap-4 bg-white/5 px-4 py-2 border border-white/10 rounded-full font-mono text-[10px] uppercase">
              <span className="opacity-40">Sala: <span className="text-cyan-400 font-bold">{roomCode}</span></span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="opacity-40">Jogadores: <span className="text-white/80">{roomData?.players.length || 0}/2</span></span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className={cn("font-bold", myRole === 1 ? "text-cyan-400" : "text-pink-400")}>
                VOCÊ É O P{myRole} ({playerName})
              </span>
            </div>
          )}
        </div>

        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-3 px-3 py-1 mb-4 border border-[#e4e3e0]/20 rounded-full text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-mono text-[#e4e3e0]/60"
        >
          {gameMode === 'versus' ? <Swords size={12} className="text-pink-400" /> : <User size={12} className="text-cyan-400" />}
          {gameMode === 'versus' ? (isOnline ? "Online Competitivo" : "Modo Competitivo") : "Modo Prática Solo"}
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        </motion.div>
        
        <motion.h1 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl sm:text-4xl md:text-7xl font-mono font-bold tracking-tighter uppercase italic leading-[0.85] mb-2"
        >
          Top 10 Cultural <span className={gameMode === 'versus' ? "text-pink-400" : "text-cyan-400"}>{gameMode === 'versus' ? "Versus" : "Solo"}</span>
        </motion.h1>
        <p className="text-[#e4e3e0]/50 font-mono text-[10px] md:text-sm tracking-wide px-4">{currentList.titulo} • {currentList.subtitulo}</p>
      </header>

      {/* Turn Indicator (Versus only) */}
      {gameMode === 'versus' && (
        <div className="max-w-7xl mx-auto mb-6 md:mb-8 flex justify-center px-4">
           <AnimatePresence mode="wait">
             <motion.div 
               key={currentTurn}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className={cn(
                 "px-4 md:px-8 py-2 md:py-3 rounded-full font-mono text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-3 md:gap-4 border shadow-[0_0_30px_rgba(0,0,0,1)]",
                 currentTurn === 1 ? "bg-cyan-500 text-black border-cyan-400" : "bg-pink-500 text-black border-pink-400"
               )}
             >
                <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                Vez do Jogador {currentTurn}
                <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
             </motion.div>
           </AnimatePresence>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className={cn(
        "max-w-7xl mx-auto grid gap-4 md:gap-8 items-start",
        gameMode === 'versus' ? "grid-cols-1 lg:grid-cols-[1fr_2fr_1fr]" : "grid-cols-1 lg:grid-cols-[1fr_2fr]"
      )}>
        
        {/* Player 1 Col */}
        <PlayerArea 
          id={1} 
          player={p1} 
          setPlayer={setP1} 
          onGuess={(val) => handleGuess(1, val)} 
          onHint={() => handleHint(1)}
          accentColor="text-cyan-400"
          accentBg="bg-cyan-500"
          borderColor={cn(
            "border-cyan-500/50",
            gameMode === 'versus' && currentTurn === 1 && "ring-2 ring-cyan-500 ring-offset-4 ring-offset-black"
          )}
          label={gameMode === 'solo' ? "PONTUAÇÃO" : (isOnline && roomData?.players[0] ? roomData.players[0].name : "JOGADOR 1")}
          gameState={gameState}
          isTurn={gameMode === 'versus' ? currentTurn === 1 : true}
          gameMode={gameMode}
          isMe={isOnline ? myRole === 1 : true}
        />

        {/* Center: Top 10 List */}
        <section className="order-first lg:order-none space-y-2">
          {Array.from({ length: 10 }).map((_, idx) => {
            const pos = idx + 1;
            const revealedBy = revealed[pos];
            const item = currentList.respostas.find(r => r.posicao === pos);
            
            return (
              <motion.div 
                key={pos}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "relative group flex items-center h-16 border border-[#e4e3e0]/10 overflow-hidden",
                  revealedBy === 1 ? "bg-cyan-950/20" : revealedBy === 2 ? "bg-pink-950/20" : "bg-[#141414]"
                )}
              >
                {/* Pos Indicator */}
                <div className={cn(
                  "w-16 h-full flex items-center justify-center font-mono font-bold text-2xl border-r border-[#e4e3e0]/10",
                  revealedBy === 1 ? "text-cyan-400 border-cyan-500/30" : 
                  revealedBy === 2 ? "text-pink-400 border-pink-500/30" : "text-[#e4e3e0]/20"
                )}>
                  {pos}
                </div>

                {/* Content */}
                <div className="flex-1 px-4 md:px-6 flex justify-between items-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    {revealedBy ? (
                      <motion.div 
                        key="revealed"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-col min-w-0"
                      >
                        <span className="font-mono font-bold text-sm md:text-lg uppercase tracking-tight truncate">{item?.nome}</span>
                        <span className="text-[8px] md:text-[10px] font-mono tracking-widest opacity-40 uppercase truncate">
                          {gameMode === 'versus' ? `P${revealedBy}` : 'Descoberto'} • +{pos} Pts
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="hidden"
                        className="flex items-center gap-2 md:gap-4 transition-all w-full"
                      >
                        <div className="flex items-center gap-2 opacity-20 shrink-0">
                          <div className="w-3 md:w-4 h-1 bg-[#e4e3e0]/30 rounded-full" />
                          <div className="w-12 md:w-24 h-1 bg-[#e4e3e0]/30 rounded-full" />
                        </div>
                        
                        {revealedHints.includes(pos) && item?.dica ? (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="px-2 md:px-3 py-0.5 md:py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-[8px] md:text-[10px] font-mono text-yellow-500 italic truncate flex-1 min-w-0"
                            title={item.dica}
                          >
                            💡 {item.dica}
                          </motion.div>
                        ) : (
                          <button 
                            onClick={() => handleHint(currentTurn, pos)}
                            disabled={gameState === 'finished' || (gameMode === 'versus' ? (currentTurn === 1 ? p1.hintsUsed >= 1 : p2.hintsUsed >= 1) : p1.hintsUsed >= 3)}
                            className="hidden group-hover:flex items-center gap-1.5 px-2 py-0.5 border border-yellow-500/30 text-yellow-500/60 hover:text-yellow-500 hover:border-yellow-500 transition-all font-mono text-[9px] uppercase tracking-widest rounded"
                          >
                            <AlertTriangle size={10} /> DICA
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Point Value Badge */}
                  <div className={cn(
                    "font-mono text-[9px] md:text-xs p-1 tracking-tighter border border-[#e4e3e0]/10 rounded hidden sm:block",
                    !revealedBy && "opacity-10"
                  )}>
                    VAL: {pos}
                  </div>
                </div>

                {/* Vertical Accents on Reveal */}
                {revealedBy === 1 && <div className="absolute left-0 w-1 h-full bg-cyan-400" />}
                {revealedBy === 2 && <div className="absolute right-0 w-1 h-full bg-pink-400" />}
              </motion.div>
            );
          })}
        </section>

        {/* Player 2 Col (Only in Versus) */}
        {gameMode === 'versus' && (
          <PlayerArea 
            id={2} 
            player={p2} 
            setPlayer={setP2} 
            onGuess={(val) => handleGuess(2, val)} 
            onHint={() => handleHint(2)}
            accentColor="text-pink-400"
            accentBg="bg-pink-500"
            borderColor={cn(
              "border-pink-500/50",
              currentTurn === 2 && "ring-2 ring-pink-500 ring-offset-4 ring-offset-black"
            )}
            label={isOnline && roomData?.players[1] ? roomData.players[1].name : "JOGADOR 2"}
            gameState={gameState}
            isTurn={currentTurn === 2}
            gameMode={gameMode}
            isMe={isOnline ? myRole === 2 : true}
          />
        )}

      </div>

      {/* Global Controls */}
      <div className="max-w-7xl mx-auto mt-8 md:mt-16 pt-8 border-t border-[#e4e3e0]/10 flex flex-wrap gap-3 md:gap-4 justify-center px-4 mb-8">
        <button 
          onClick={() => resetGame()}
          className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-4 md:px-6 py-3 border border-[#e4e3e0]/20 hover:bg-[#e4e3e0]/5 transition-colors font-mono uppercase tracking-widest text-[10px] md:text-xs"
        >
          <RefreshCw size={14} />
          Reiniciar
        </button>
        <button 
          onClick={() => setIsListSelectorOpen(true)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-4 md:px-6 py-3 bg-[#e4e3e0] text-black hover:bg-white transition-colors font-mono uppercase font-bold tracking-widest text-[10px] md:text-xs"
        >
          <Layers size={14} />
          Trocar Lista
        </button>
      </div>

      {/* List Selection Modal */}
      <AnimatePresence>
        {isListSelectorOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-2xl w-full bg-[#141414] border border-[#e4e3e0]/10 p-8 space-y-6 relative"
            >
              <button 
                onClick={() => setIsListSelectorOpen(false)}
                className="absolute top-4 right-4 text-[#e4e3e0]/40 hover:text-white transition-colors"
              >
                <XCircle size={20} />
              </button>

              <div className="space-y-1">
                <h2 className="text-xl font-mono font-bold uppercase tracking-tight">Escolha uma Lista</h2>
                <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Selecione o tema para a próxima partida</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {listasCustom.map((lista, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setListIndex(idx);
                      setIsListSelectorOpen(false);
                      resetGame();
                      if (socket) {
                        socket.emit('resposta', { type: 'changeList', index: idx });
                      }
                    }}
                    className={cn(
                      "text-left p-4 border transition-all space-y-1 group",
                      listIndex === idx 
                        ? "border-cyan-500 bg-cyan-500/5" 
                        : "border-[#e4e3e0]/10 bg-[#0a0a0a] hover:border-[#e4e3e0]/30"
                    )}
                  >
                    <h3 className="text-sm font-mono font-bold uppercase group-hover:text-cyan-400 transition-colors">{lista.titulo}</h3>
                    <p className="text-[9px] font-mono opacity-40 uppercase truncate">{lista.subtitulo}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameState === 'finished' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-xl w-full bg-[#141414] border border-[#e4e3e0]/10 p-12 text-center space-y-8 relative overflow-hidden"
            >
              {/* Winner Reveal */}
              <div className="space-y-2">
                <Trophy size={64} className="mx-auto text-yellow-400 animate-bounce" />
                <h2 className="text-4xl font-mono font-bold uppercase tracking-tighter">
                  {gameMode === 'solo' 
                    ? "PRÁTICA CONCLUÍDA!" 
                    : (winner === 0 ? "EMPATE TÉCNICO!" : `VITÓRIA DO JOGADOR ${winner}`)}
                </h2>
                <p className="text-[#e4e3e0]/50 font-mono text-sm tracking-wide">Fim da partida de {gameMode === 'solo' ? "conhecimento" : "competição"}</p>
              </div>

              {/* Stats Grid */}
              <div className={cn("grid gap-4", gameMode === 'versus' ? "grid-cols-2" : "grid-cols-1")}>
                <div className="p-6 border border-cyan-500/20 bg-cyan-950/10">
                  <div className="text-[10px] font-mono tracking-widest opacity-50 uppercase mb-1">{gameMode === 'solo' ? "Pontuação Final" : "Jogador 1"}</div>
                  <div className="text-3xl font-mono font-bold text-cyan-400">{p1.score}</div>
                  <div className="text-[9px] font-mono opacity-30">PTS ACUMULADOS</div>
                  {gameMode === 'solo' && (
                    <div className="mt-2 text-[10px] font-mono opacity-50">
                      ITENS DESCOBERTOS: {Object.keys(revealed).length}/10
                    </div>
                  )}
                </div>
                {gameMode === 'versus' && (
                  <div className="p-6 border border-pink-500/20 bg-pink-950/10">
                    <div className="text-[10px] font-mono tracking-widest opacity-50 uppercase mb-1">Jogador 2</div>
                    <div className="text-3xl font-mono font-bold text-pink-400">{p2.score}</div>
                    <div className="text-[9px] font-mono opacity-30">PTS ACUMULADOS</div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button 
                  onClick={() => resetGame()}
                  className="w-full py-4 bg-[#e4e3e0] text-black font-mono font-bold uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_0_30px_rgba(228,227,224,0.1)]"
                >
                  Jogar Novamente
                </button>
                <button 
                  onClick={quitToMenu}
                  className="w-full py-4 border border-[#e4e3e0]/10 text-[#e4e3e0]/50 font-mono text-[10px] uppercase tracking-widest hover:text-[#e4e3e0] hover:bg-white/5 transition-all"
                >
                  Voltar ao Menu Principal
                </button>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500/20" />
              {gameMode === 'versus' && <div className="absolute top-0 right-0 w-2 h-full bg-pink-500/20" />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Sub-component for individual player logic/UI
function PlayerArea({ 
  id, player, setPlayer, onGuess, onHint, accentColor, accentBg, borderColor, label, gameState, isTurn, gameMode, isMe
}: { 
  id: number, player: PlayerState, setPlayer: React.Dispatch<React.SetStateAction<PlayerState>>, 
  onGuess: (v: string) => void, onHint: () => void, accentColor: string, accentBg: string, borderColor: string, label: string, gameState: string,
  isTurn: boolean, gameMode: string, isMe?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hintLimit = gameMode === 'versus' ? 1 : 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (player.input.trim() && isTurn && isMe) {
      onGuess(player.input);
    }
  };

  return (
    <div className={cn(
      "space-y-4 md:space-y-6 p-4 md:p-8 border bg-[#0a0a0a] transition-all relative overflow-hidden",
      borderColor,
      (player.isBlocked || !isTurn) && "opacity-50 grayscale",
      !isMe && isTurn && "ring-1 ring-white/10"
    )}>
      {/* Turn indicator glow */}
      {isTurn && !player.isBlocked && gameState === 'playing' && (
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e4e3e0]/30 to-transparent animate-shimmer" />
      )}

      {/* Label & Status */}
      <div className="flex justify-between items-end border-b border-[#e4e3e0]/10 pb-3 md:pb-4">
        <div className="relative">
          <h3 className={cn("font-mono text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] font-bold", accentColor)}>{label}</h3>
          {isMe && <span className="absolute -top-4 left-0 text-[8px] opacity-40 font-mono uppercase bg-white/10 px-1">Você</span>}
          <div className="text-3xl md:text-4xl font-mono font-bold tracking-tighter mt-1">{player.score}</div>
          <div className="text-[8px] md:text-[9px] font-mono opacity-30 uppercase tracking-widest mt-0.5">Pontos</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-1.5">
            {[1, 2, 3].map(s => (
              <div key={s} className={cn(
                "w-3 h-3 rounded-full border transition-all",
                player.errors >= s ? "bg-red-500 border-red-500 scale-110 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "border-[#e4e3e0]/10"
              )} />
            ))}
          </div>
          <span className="text-[9px] font-mono opacity-30 uppercase tracking-widest">Erros Cometidos</span>
        </div>
      </div>

      {/* Input Group */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -top-3 right-0 scale-75 z-10">
           <AnimatePresence>
              {player.lastFeedback === 'correct' && (
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">ACERTOU!</motion.div>
              )}
              {player.lastFeedback === 'wrong' && (
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">ERROU!</motion.div>
              )}
              {player.lastFeedback === 'hint' && (
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg flex items-center gap-1">
                   DICA USADA! <Plus size={8} />
                </motion.div>
              )}
           </AnimatePresence>
        </div>

        <label className={cn(
          "block text-[10px] font-mono uppercase tracking-widest opacity-40 mb-2 transition-colors",
          isTurn && "opacity-100 font-bold"
        )}>
          {isTurn ? (isMe ? "Sua vez de digitar:" : "Aguarde o adversário...") : "Aguarde o adversário..."}
        </label>
        
        <div className="flex items-center gap-2">
          <input 
            ref={inputRef}
            type="text"
            disabled={player.isBlocked || gameState === 'finished' || !isTurn || !isMe}
            value={player.input}
            onChange={(e) => setPlayer(prev => ({ ...prev, input: e.target.value }))}
            placeholder={player.isBlocked ? "BLOQUEADO" : !isTurn ? "TURNO DO ADVERSÁRIO" : (isMe ? "Sua aposta?" : "TURNO DO ADVERSÁRIO")}
            className={cn(
              "w-full bg-[#141414] border border-[#e4e3e0]/10 p-3 md:p-4 font-mono text-xs md:text-sm tracking-wide focus:outline-none focus:border-[#e4e3e0]/40 transition-all uppercase placeholder:normal-case",
              (player.isBlocked || !isTurn || !isMe) && "cursor-not-allowed opacity-50 bg-[#050505]"
            )}
          />
          
          {/* Hint Button */}
          <button 
            type="button"
            onClick={onHint}
            disabled={player.isBlocked || gameState === 'finished' || !isTurn || !isMe || player.hintsUsed >= hintLimit}
            title={player.hintsUsed >= hintLimit ? "Dicas esgotadas" : `Usar dica (${player.hintsUsed}/${hintLimit})`}
            className={cn(
              "flex items-center justify-center w-14 h-14 transition-all active:scale-95 border",
              player.hintsUsed >= hintLimit || !isTurn || !isMe || player.isBlocked
                ? "border-white/5 text-white/10 cursor-not-allowed" 
                : "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
            )}
          >
            <AlertTriangle size={18} />
          </button>

          <button 
            type="submit"
            disabled={player.isBlocked || gameState === 'finished' || !isTurn || !isMe}
            className={cn(
              "flex items-center justify-center w-14 h-14 transition-all active:scale-95 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] shadow-lg shadow-black/20",
              accentBg,
              "text-black",
              (!isTurn || !isMe || player.isBlocked) && "grayscale opacity-50"
            )}
          >
            <User size={18} />
          </button>
        </div>
        <div className="mt-2 text-[8px] font-mono opacity-20 uppercase tracking-widest text-right">
          Dicas: {hintLimit - player.hintsUsed} restantes
        </div>
      </form>

      {/* Tip / Footer */}
      <div className="flex items-start gap-3 p-4 bg-[#141414]/50 rounded border border-[#e4e3e0]/5 italic">
        <AlertTriangle size={14} className="mt-0.5 opacity-40 shrink-0" />
        <p className="text-[10px] opacity-40 font-mono leading-relaxed uppercase tracking-tighter">
          {player.isBlocked 
            ? "Limite de erros atingido. Tente novamente em outra partida."
            : !isTurn 
            ? "Pense bem no próximo item enquanto seu adversário joga."
            : (isMe ? "Variações de nomes são aceitas automaticamente. Não se preocupe com acentos." : "Aguarde seu adversário realizar a jogada.")}
        </p>
      </div>

      {/* Visual background feedback on hit/miss */}
      <AnimatePresence>
        {player.lastFeedback === 'wrong' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
