import React, { useEffect, useState } from 'react';
import { Timer, X, Plus, Minus } from 'lucide-react';
import { playBeepAlert } from '../utils/audio';

interface RestTimerProps {
  initialSeconds: number;
  onClose: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ initialSeconds, onClose }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      playBeepAlert();
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining]);

  const addTime = (secs: number) => {
    setSecondsRemaining((prev) => Math.max(0, prev + secs));
    setIsActive(true);
  };

  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <aside
      aria-label="Temporizador de descanso"
      className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-zinc-900 border border-zinc-700 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between z-50 animate-bounce-short"
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${secondsRemaining === 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
          <Timer className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <span className="text-xs font-semibold text-zinc-400 block uppercase tracking-wider">Descanso</span>
          <span className="text-2xl font-black font-mono tracking-tight">{formatTime(secondsRemaining)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => addTime(-15)}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 rounded-lg text-zinc-300 font-bold text-xs"
          title="-15 seg"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => addTime(30)}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 rounded-lg text-zinc-300 font-bold text-xs flex items-center"
          title="+30 seg"
        >
          <Plus className="w-4 h-4 mr-0.5" />30s
        </button>
        <button
          onClick={onClose}
          className="p-2 ml-2 text-zinc-400 hover:text-white active:scale-90"
          title="Cerrar temporizador"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
