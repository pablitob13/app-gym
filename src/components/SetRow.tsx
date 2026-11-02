import React from 'react';
import { X } from 'lucide-react';
import { ExerciseSet } from '../types';

interface SetRowProps {
  set: ExerciseSet;
  index: number;
  onUpdate: (updatedSet: ExerciseSet) => void;
  onDelete: (id: string) => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  index,
  onUpdate,
  onDelete,
}) => {
  return (
    <div className="group flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-zinc-900/60 transition-colors">
      <span className="w-5 text-center text-xs font-mono text-zinc-500 select-none">
        {index + 1}
      </span>

      <div className="flex items-center gap-1">
        <input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={set.weightKg}
          onChange={(e) => onUpdate({ ...set, weightKg: e.target.value })}
          className="w-14 bg-zinc-900 text-zinc-100 placeholder-zinc-600 text-sm font-medium text-right px-2 py-1 rounded border border-zinc-800 focus:border-zinc-500 focus:outline-none transition-colors"
        />
        <span className="text-[11px] text-zinc-500 font-mono select-none">kg</span>
      </div>

      <div className="flex items-center gap-1">
        <input
          type="number"
          inputMode="numeric"
          placeholder="0"
          value={set.reps}
          onChange={(e) => onUpdate({ ...set, reps: e.target.value })}
          className="w-12 bg-zinc-900 text-zinc-100 placeholder-zinc-600 text-sm font-medium text-right px-2 py-1 rounded border border-zinc-800 focus:border-zinc-500 focus:outline-none transition-colors"
        />
        <span className="text-[11px] text-zinc-500 font-mono select-none">reps</span>
      </div>

      <div className="flex-1 min-w-0">
        <input
          type="text"
          placeholder="Sensaciones, RPE..."
          value={set.notes}
          onChange={(e) => onUpdate({ ...set, notes: e.target.value })}
          className="w-full bg-transparent text-xs text-zinc-300 placeholder-zinc-600 px-2 py-1 rounded border border-transparent focus:border-zinc-800 focus:bg-zinc-900/40 focus:outline-none transition-colors truncate"
        />
      </div>

      <button
        type="button"
        onClick={() => onDelete(set.id)}
        className="opacity-40 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors"
        aria-label="Eliminar serie"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
