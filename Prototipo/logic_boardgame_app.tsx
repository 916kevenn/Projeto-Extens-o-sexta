import React, { useState, useEffect } from 'react';
import { 
  Play, Users, Dices, ArrowRight, CheckCircle2, 
  XCircle, RotateCcw, Trophy, BrainCircuit, ChevronRight
} from 'lucide-react';

// Banco de Perguntas (Hardcoded)
const questionsDB = {
  facil: [
    { q: "Qual é o resultado de 7 + 8?", options: ["14", "15", "16", "13"], ans: 1 },
    { q: "Quantos dias tem uma semana?", options: ["5", "6", "7", "8"], ans: 2 },
    { q: "Qual a cor do cavalo branco de Napoleão?", options: ["Marrom", "Preto", "Branco", "Cinza"], ans: 2 },
    { q: "Qual animal faz 'Miau'?", options: ["Cachorro", "Gato", "Pato", "Vaca"], ans: 1 },
    { q: "Quantas horas tem um dia?", options: ["12", "20", "24", "48"], ans: 2 },
  ],
  medio: [
    { q: "Se você ultrapassa o segundo colocado, em que lugar você fica?", options: ["Primeiro", "Segundo", "Terceiro", "Último"], ans: 1 },
    { q: "Qual é o próximo número: 2, 4, 8, 16, ...?", options: ["24", "32", "64", "20"], ans: 1 },
    { q: "Quantos meses têm 28 dias?", options: ["1", "Todos", "Nenhum", "6"], ans: 1 },
    { q: "O que tem cabeça, tem dente, tem barba, não é bicho e não é gente?", options: ["Alho", "Milho", "Pente", "Cebola"], ans: 0 },
    { q: "Qual é o dobro da metade de 10?", options: ["5", "10", "20", "15"], ans: 1 },
  ],
  dificil: [
    { q: "O pai do padre é filho único do meu pai. O que eu sou do padre?", options: ["Pai", "Tio", "Irmão", "Avô"], ans: 0 },
    { q: "Há 3 maçãs, você pega 2. Quantas você tem?", options: ["1", "2", "3", "Nenhuma"], ans: 1 },
    { q: "Divida 30 por meio e some 10. Qual o resultado?", options: ["25", "40", "70", "15"], ans: 2 },
    { q: "Alguns meses têm 31 dias, outros 30. Quantos têm 28?", options: ["1", "Todos", "Nenhum", "Depende do ano bi"], ans: 1 },
    { q: "Tenho cidades sem casas, montanhas sem árvores e água sem peixes. O que sou?", options: ["Deserto", "Globo", "Mapa", "Pintura"], ans: 2 },
  ]
};

export default function App() {
  // Estados de navegação e fluxo
  const [currentScreen, setCurrentScreen] = useState('HOME'); // HOME, SETUP, ORDER, GAME, VICTORY
  const [turnPhase, setTurnPhase] = useState('ROLL'); // ROLL, QUESTION, FEEDBACK
  
  // Estados do Jogo
  const [players, setPlayers] = useState([]);
  const [playerInputs, setPlayerInputs] = useState(["", ""]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  
  // Estados do Turno
  const [diceResult, setDiceResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const handleAddPlayer = () => {
    if (playerInputs.length < 4) {
      setPlayerInputs([...playerInputs, ""]);
    }
  };

  const handleRemovePlayer = (index) => {
    if (playerInputs.length > 2) {
      const newInputs = playerInputs.filter((_, i) => i !== index);
      setPlayerInputs(newInputs);
    }
  };

  const updatePlayerName = (index, value) => {
    const newInputs = [...playerInputs];
    newInputs[index] = value;
    setPlayerInputs(newInputs);
  };

  const confirmSetup = () => {
    const validNames = playerInputs.filter(n => n.trim() !== "");
    if (validNames.length < 2) return; // Silent return se inválido
    
    const newPlayers = validNames.map((name, idx) => ({
      id: idx,
      name: name.trim(),
      position: 0,
      orderRoll: 0
    }));
    
    setPlayers(newPlayers);
    setCurrentScreen('ORDER');
  };

  const rollForOrder = () => {
    setIsRolling(true);
    setTimeout(() => {
      let rolledPlayers = players.map(p => ({
        ...p,
        orderRoll: Math.floor(Math.random() * 100) + 1 // 1 a 100 para evitar empates
      }));
      
      // Ordena do maior para o menor
      rolledPlayers.sort((a, b) => b.orderRoll - a.orderRoll);
      
      setPlayers(rolledPlayers);
      setIsRolling(false);
      
      setTimeout(() => {
        setCurrentScreen('GAME');
        setCurrentPlayerIndex(0);
        setTurnPhase('ROLL');
      }, 2000);
    }, 1000);
  };

  const getDifficulty = (pos) => {
    if (pos <= 8) return 'facil';
    if (pos <= 16) return 'medio';
    return 'dificil';
  };

  const getDifficultyLabel = (diff) => {
    switch(diff) {
      case 'facil': return { label: 'Fácil', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' };
      case 'medio': return { label: 'Médio', color: 'bg-amber-100 text-amber-700 border-amber-300' };
      case 'dificil': return { label: 'Difícil', color: 'bg-rose-100 text-rose-700 border-rose-300' };
      default: return { label: '', color: '' };
    }
  };

  const rollDice = () => {
    setIsRolling(true);
    
    // Animação falsa de rolagem
    let rolls = 0;
    const interval = setInterval(() => {
      setDiceResult(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 10) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceResult(finalRoll);
        setIsRolling(false);
        
        // Aplica o movimento após 1 segundo para visualização do dado
        setTimeout(() => {
          movePlayerAndShowQuestion(finalRoll);
        }, 1200);
      }
    }, 50);
  };

  const movePlayerAndShowQuestion = (spaces) => {
    const updatedPlayers = [...players];
    const currentPlayer = updatedPlayers[currentPlayerIndex];
    currentPlayer.position += spaces;
    setPlayers(updatedPlayers);

    // Carrega pergunta baseada na nova posição
    const diff = getDifficulty(currentPlayer.position);
    const pool = questionsDB[diff];
    const randomQ = pool[Math.floor(Math.random() * pool.length)];
    
    setCurrentQuestion({ ...randomQ, difficulty: diff });
    setTurnPhase('QUESTION');
  };

  const handleAnswer = (selectedIndex) => {
    const isCorrect = selectedIndex === currentQuestion.ans;
    const currentPlayer = players[currentPlayerIndex];
    
    if (isCorrect) {
      setFeedback({ 
        correct: true, 
        msg: "Você acertou! Mantém a sua posição.",
        targetPos: currentPlayer.position
      });
    } else {
      // Volta uma casa se errou (mínimo 0)
      const newPos = Math.max(0, currentPlayer.position - 1);
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex].position = newPos;
      setPlayers(updatedPlayers);
      
      setFeedback({ 
        correct: false, 
        msg: `A resposta correta era: ${currentQuestion.options[currentQuestion.ans]}. Você voltou 1 casa.`,
        targetPos: newPos
      });
    }
    
    setTurnPhase('FEEDBACK');
  };

  const nextTurn = () => {
    const currentPlayer = players[currentPlayerIndex];
    
    // Checa condição de vitória
    if (currentPlayer.position >= 24) {
      setWinner(currentPlayer);
      setCurrentScreen('VICTORY');
      return;
    }

    setDiceResult(null);
    setCurrentQuestion(null);
    setFeedback(null);
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setTurnPhase('ROLL');
  };

  const resetGame = () => {
    setPlayers([]);
    setPlayerInputs(["", ""]);
    setCurrentScreen('HOME');
    setWinner(null);
    setDiceResult(null);
    setCurrentQuestion(null);
    setFeedback(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center sm:py-8">
      {/* Container imitando a tela de um celular */}
      <div className="w-full max-w-md bg-white sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col relative text-slate-800 font-sans">
        
        {/* === TELA 1: HOME === */}
        {currentScreen === 'HOME' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
              <div className="bg-indigo-600 w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-6">
                <BrainCircuit className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Logic<br/>Boardgame</h1>
              <p className="text-slate-500 font-medium">Seu companheiro digital</p>
            </div>
            
            <button 
              onClick={() => setCurrentScreen('SETUP')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-6 h-6 fill-current" />
              Começar
            </button>
          </div>
        )}

        {/* === TELA 2: SETUP DE JOGADORES === */}
        {currentScreen === 'SETUP' && (
          <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-300">
            <div className="mb-8 mt-4 text-center">
              <h2 className="text-2xl font-bold text-slate-900">Jogadores</h2>
              <p className="text-slate-500 text-sm mt-1">Adicione de 2 a 4 participantes</p>
            </div>

            <div className="space-y-4 flex-1">
              {playerInputs.map((name, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      placeholder={`Nome do Jogador ${idx + 1}`}
                      value={name}
                      onChange={(e) => updatePlayerName(idx, e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors font-semibold text-slate-700"
                      maxLength={15}
                    />
                  </div>
                  {playerInputs.length > 2 && idx >= 2 && (
                    <button 
                      onClick={() => handleRemovePlayer(idx)}
                      className="p-4 text-rose-500 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  )}
                </div>
              ))}
              
              {playerInputs.length < 4 && (
                <button 
                  onClick={handleAddPlayer}
                  className="w-full py-4 border-2 border-dashed border-slate-300 text-slate-500 font-semibold rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  + Adicionar Jogador
                </button>
              )}
            </div>

            <button 
              onClick={confirmSetup}
              disabled={playerInputs.filter(n => n.trim() !== "").length < 2}
              className="w-full mt-auto bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-indigo-700 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Avançar
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* === TELA 3: SORTEIO DE ORDEM === */}
        {currentScreen === 'ORDER' && (
          <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-300">
            <div className="mb-8 mt-4 text-center">
              <h2 className="text-2xl font-bold text-slate-900">Ordem de Jogo</h2>
              <p className="text-slate-500 text-sm mt-1">Sorteando quem começa</p>
            </div>

            <div className="space-y-4 flex-1">
              {players.map((p, idx) => (
                <div key={idx} className="bg-white border-2 border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <span className="font-bold text-lg text-slate-700">{p.name}</span>
                  {p.orderRoll > 0 ? (
                    <span className="bg-indigo-100 text-indigo-700 font-bold px-4 py-1 rounded-full text-sm">
                      {idx + 1}º a jogar
                    </span>
                  ) : (
                    <span className="text-slate-400">Aguardando...</span>
                  )}
                </div>
              ))}
            </div>

            {!players[0].orderRoll && (
               <button 
                onClick={rollForOrder}
                disabled={isRolling}
                className="w-full mt-auto bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-amber-200 transition-all active:scale-95 flex items-center justify-center gap-2"
               >
                 {isRolling ? <Dices className="w-6 h-6 animate-spin" /> : <Dices className="w-6 h-6" />}
                 Sortear Ordem
               </button>
            )}
          </div>
        )}

        {/* === TELA 4: LOOP DO JOGO === */}
        {currentScreen === 'GAME' && players.length > 0 && (
          <div className="flex-1 flex flex-col bg-slate-50 animate-in fade-in duration-500">
            
            {/* Header do Jogo */}
            <div className="bg-white p-6 rounded-b-3xl shadow-sm z-10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Vez de</span>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  Casa <span className="text-indigo-600 text-sm">{players[currentPlayerIndex].position}</span> / 24
                </span>
              </div>
              <h2 className="text-3xl font-black text-indigo-600 truncate">
                {players[currentPlayerIndex].name}
              </h2>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${Math.min(100, (players[currentPlayerIndex].position / 24) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              {/* FASE A: ROLAR DADO */}
              {turnPhase === 'ROLL' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-300">
                  <div className="text-center space-y-2">
                    <p className="text-slate-500">Avance no tabuleiro físico</p>
                    <div className="w-32 h-32 bg-white rounded-3xl shadow-xl border-4 border-slate-50 flex items-center justify-center text-5xl font-black text-indigo-600">
                      {diceResult || <Dices className="w-12 h-12 text-slate-300" />}
                    </div>
                  </div>
                  
                  <button 
                    onClick={rollDice}
                    disabled={isRolling || diceResult !== null}
                    className="w-full bg-indigo-600 disabled:bg-slate-300 hover:bg-indigo-700 text-white font-bold text-lg py-5 rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-95"
                  >
                    {isRolling ? 'Rolando...' : (diceResult ? 'Avançando...' : 'Rolar Dado Virtual')}
                  </button>
                </div>
              )}

              {/* FASE B: PERGUNTA */}
              {turnPhase === 'QUESTION' && currentQuestion && (
                <div className="flex-1 flex flex-col space-y-5 animate-in slide-in-from-bottom-6 duration-500 pb-4">
                  <div className={`self-start px-3 py-1 rounded-lg border-2 text-xs font-bold uppercase tracking-wider ${getDifficultyLabel(currentQuestion.difficulty).color}`}>
                    {getDifficultyLabel(currentQuestion.difficulty).label}
                  </div>
                  
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-lg font-bold text-slate-800 leading-snug">
                      {currentQuestion.q}
                    </p>
                  </div>

                  <div className="space-y-3 mt-auto">
                    {currentQuestion.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        className="w-full text-left p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-semibold hover:border-indigo-500 hover:bg-indigo-50 transition-all active:scale-[0.98] flex items-center justify-between"
                      >
                        {opt}
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* FASE C: FEEDBACK */}
              {turnPhase === 'FEEDBACK' && feedback && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-300">
                  <div className={`p-6 rounded-full ${feedback.correct ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    {feedback.correct ? (
                      <CheckCircle2 className="w-20 h-20 text-emerald-500" />
                    ) : (
                      <XCircle className="w-20 h-20 text-rose-500" />
                    )}
                  </div>
                  
                  <div className="text-center space-y-3 bg-white p-6 rounded-3xl w-full border border-slate-100 shadow-sm">
                    <h3 className={`text-2xl font-black ${feedback.correct ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {feedback.correct ? 'Correto!' : 'Incorreto!'}
                    </h3>
                    <p className="text-slate-600 font-medium">
                      {feedback.msg}
                    </p>
                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <p className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-1">Casa Atual</p>
                      <p className="text-4xl font-black text-slate-800">{feedback.targetPos}</p>
                    </div>
                  </div>

                  <button 
                    onClick={nextTurn}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-4 rounded-2xl shadow-xl transition-all active:scale-95"
                  >
                    Passar a Vez
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === TELA 5: VITÓRIA === */}
        {currentScreen === 'VICTORY' && winner && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 bg-indigo-600 text-white animate-in slide-in-from-bottom duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 rounded-full"></div>
              <Trophy className="w-32 h-32 text-yellow-400 relative z-10" />
            </div>
            
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black text-yellow-400 uppercase tracking-widest">
                Vitória!
              </h2>
              <p className="text-xl font-medium text-indigo-100">
                Parabéns, <br/>
                <span className="text-4xl font-bold text-white mt-2 block">{winner.name}</span>
              </p>
              <p className="text-indigo-200 mt-4">
                Você chegou ao final do tabuleiro!
              </p>
            </div>

            <button 
              onClick={resetGame}
              className="w-full bg-white hover:bg-slate-50 text-indigo-600 font-bold text-lg py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 mt-8"
            >
              <RotateCcw className="w-5 h-5" />
              Jogar Novamente
            </button>
          </div>
        )}

      </div>
    </div>
  );
}