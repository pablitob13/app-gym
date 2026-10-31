import React from 'react';
import { Check, Award } from 'lucide-react';
import { ExerciseSet, SetType } from '../types';
import { calculate1RM } from '../utils/metrics';

interface SetRowProps {
  set: ExerciseSet;
  index: number;
  historicalPr1Rm: number;
  lastSessionSet?: { weightKg: number; reps: number };
  onUpdate: (updatedSet: ExerciseSet) => void;
  onComplete: (set: ExerciseSet) => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  index,
  historicalPr1Rm,
  lastSessionSet,
  onUpdate,
  onComplete
}) => {
  const current1RM = calculate1RM(set.weightKg, set.reps);
  const isPr = current1RM > historicalPr1Rm && set.weightKg > 0 && set.reps > 0;

  const handleWeightDelta = (delta: number) => {
    const newWeight = Math.max(0, Number((set.weightKg + delta).toFixed(2)));
    onUpdate({ ...set, weightKg: newWeight });
  };

  const toggleType = () => {
    const nextType: SetType = set.type === 'working' ? 'warmup' : 'working';
    onUpdate({ ...set, type: nextType });
  };

  return (
    <div
      className={`grid grid-cols-12 gap-2 items-center py-2 px-3 rounded-xl transition-colors mb-2 ${
        set.isCompleted
          ? 'bg-zinc-900/40 border border-emerald-500/30'
          : 'bg-zinc-900 border border-zinc-800'
      }`}
    >
      <div className="col-span-2 flex flex-col items-center">
        <button
          onClick={toggleType}
          className={`text-xs px-2 py-1 rounded font-bold uppercase transition ${
            set.type === 'warmup'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
          }`}
        >
          {set.type === 'warmup' ? 'W' : `S${index + 1}`}
        </button>
        {lastSessionSet && (
          <span className="text-[10px] text-zinc-500 mt-1 whitespace-nowrap">
            Prev: {lastSessionSet.weightKg}k x {lastSessionSet.reps}
          </span>
        )}
      </div>

      <div className="col-span-4 flex flex-col">
        <div className="flex items-center space-x-1">
          <input
            type="number"
            step="0.5"
            value={set.weightKg === 0 ? '' : set.weightKg}
            placeholder="0"
            onChange={(e) => onUpdate({ ...set, weightKg: Number(e.target.value) || 0 })}
            className="w-full bg-zinc-800 border border-zinc-700 text-white font-bold rounded-lg px-2 py-1.5 text-center focus:outline-none focus:border-indigo-500"
          />
          <span className="text-zinc-500 text-xs font-semibold">kg</span>
        </div>
        <div className="flex justify-between mt-1 space-x-1">
          {[1.25, 2.5, 5].map((delta) => (
            <button
              key={delta}
              onClick={() => handleWeightDelta(delta)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] py-1 rounded font-mono active:scale-95"
            >
              +{delta}
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-3 flex flex-col items-center">
        <div className="flex items-center space-x-1 w-full">
          <input
            type="number"
            value={set.reps === 0 ? '' : set.reps}
            placeholder="0"
            onChange={(e) => onUpdate({ ...set, reps: Number(e.target.value) || 0 })}
            className="w-full bg-zinc-800 border border-zinc-700 text-white font-bold rounded-lg px-2 py-1.5 text-center focus:outline-none focus:border-indigo-500"
          />
          <span className="text-zinc-500 text-xs font-semibold">reps</span>
        </div>
        <div className="flex items-center space-x-1 mt-1 text-[11px] text-zinc-400">
          <span>1RM: {current1RM}k</span>
          {isPr && <Award className="w-3.5 h-3.5 text-amber-400 animate-pulse" title="Nuevo Record Personal" />}
        </div>
      </div>

      <div className="col-span-3 flex justify-end">
        <button
          onClick={() => onComplete(set)}
          className={`p-3 rounded-xl transition duration-150 active:scale-90 flex items-center justify-center ${
            set.isCompleted
              ? 'bg-emerald-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/20'
              : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
          }`}
          aria-label="Confirmar Serie"
        >
          <Check className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
