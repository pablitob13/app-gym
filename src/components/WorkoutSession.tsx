import React, { useState } from 'react';
import { WorkoutSessionData, ExerciseSet } from '../types';
import { SetRow } from './SetRow';
import { RestTimer } from './RestTimer';
import { Dumbbell, Plus, Info, Flame } from 'lucide-react';
import { calculateVolume } from '../utils/metrics';

interface WorkoutSessionProps {
  initialWorkout: WorkoutSessionData;
}

export const WorkoutSession: React.FC<WorkoutSessionProps> = ({ initialWorkout }) => {
  const [workout, setWorkout] = useState<WorkoutSessionData>(initialWorkout);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);

  const totalVolume = workout.exercises.reduce((acc, exercise) => {
    return (
      acc +
      exercise.sets.reduce((setAcc, set) => {
        return set.isCompleted && set.type === 'working'
          ? setAcc + calculateVolume(set.weightKg, set.reps)
          : setAcc;
      }, 0)
    );
  }, 0);

  const handleUpdateSet = (exerciseIndex: number, updatedSet: ExerciseSet) => {
    setWorkout((prev) => {
      const nextExercises = [...prev.exercises];
      const nextSets = nextExercises[exerciseIndex].sets.map((s) =>
        s.id === updatedSet.id ? updatedSet : s
      );
      nextExercises[exerciseIndex] = {
        ...nextExercises[exerciseIndex],
        sets: nextSets
      };
      return { ...prev, exercises: nextExercises };
    });
  };

  const handleCompleteSet = (exerciseIndex: number, set: ExerciseSet) => {
    const isNowCompleted = !set.isCompleted;
    const updatedSet: ExerciseSet = {
      ...set,
      isCompleted: isNowCompleted,
      completedAt: isNowCompleted ? new Date().toISOString() : undefined
    };

    handleUpdateSet(exerciseIndex, updatedSet);

    if (isNowCompleted) {
      const restTime = workout.exercises[exerciseIndex].restSeconds || 90;
      setActiveTimerSeconds(restTime);
    }
  };

  const handleAddSet = (exerciseIndex: number) => {
    setWorkout((prev) => {
      const nextExercises = [...prev.exercises];
      const targetExercise = nextExercises[exerciseIndex];
      const prevSet = targetExercise.sets[targetExercise.sets.length - 1];

      const newSet: ExerciseSet = {
        id: crypto.randomUUID(),
        workoutExerciseId: targetExercise.id,
        setNumber: targetExercise.sets.length + 1,
        type: 'working',
        weightKg: prevSet ? prevSet.weightKg : (targetExercise.previousSessionSets[0]?.weightKg || 0),
        reps: prevSet ? prevSet.reps : (targetExercise.previousSessionSets[0]?.reps || 0),
        isCompleted: false
      };

      nextExercises[exerciseIndex] = {
        ...targetExercise,
        sets: [...targetExercise.sets, newSet]
      };
      return { ...prev, exercises: nextExercises };
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-28 px-3 pt-4 max-w-lg mx-auto">
      <header className="mb-4">
        <h1 className="text-xl font-black tracking-tight text-white">{workout.name}</h1>
        <div className="flex items-center space-x-3 mt-1 text-xs text-zinc-400">
          <span className="flex items-center font-medium">
            <Flame className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            Volumen: {totalVolume.toLocaleString()} kg
          </span>
        </div>
      </header>

      <main className="space-x-0 space-y-4">
        {workout.exercises.map((exercise, exerciseIndex) => (
          <section
            key={exercise.id}
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3 shadow-lg"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="font-bold text-white text-base flex items-center">
                  <Dumbbell className="w-4 h-4 mr-2 text-indigo-400 inline" />
                  {exercise.exerciseName}
                </h2>
                {exercise.technicalNotes && (
                  <div className="flex items-center text-zinc-400 text-xs mt-0.5">
                    <Info className="w-3 h-3 mr-1 text-zinc-500" />
                    <span>{exercise.technicalNotes}</span>
                  </div>
                )}
              </div>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                Descanso: {exercise.restSeconds}s
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-zinc-500 px-3 py-1 uppercase tracking-wider">
              <span className="col-span-2 text-center">Tipo</span>
              <span className="col-span-4 text-center">Carga</span>
              <span className="col-span-3 text-center">Reps</span>
              <span className="col-span-3 text-right pr-2">Listo</span>
            </div>

            <div>
              {exercise.sets.map((set, setIndex) => (
                <SetRow
                  key={set.id}
                  set={set}
                  index={setIndex}
                  historicalPr1Rm={exercise.historicalPr1Rm}
                  lastSessionSet={exercise.previousSessionSets[setIndex]}
                  onUpdate={(updated) => handleUpdateSet(exerciseIndex, updated)}
                  onComplete={(completedSet) => handleCompleteSet(exerciseIndex, completedSet)}
                />
              ))}
            </div>

            <button
              onClick={() => handleAddSet(exerciseIndex)}
              className="w-full mt-2 py-2 border border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 active:scale-98 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Serie</span>
            </button>
          </section>
        ))}
      </main>

      {activeTimerSeconds !== null && (
        <RestTimer
          key={activeTimerSeconds}
          initialSeconds={activeTimerSeconds}
          onClose={() => setActiveTimerSeconds(null)}
        />
      )}
    </div>
  );
};
