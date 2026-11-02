import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, History, ChevronRight } from 'lucide-react';
import { WorkoutSessionData, Exercise, ExerciseSet } from '../types';
import { SetRow } from './SetRow';

const CURRENT_WORKOUT_KEY = 'minimal_workout_current_session';
const HISTORY_KEY = 'minimal_workout_history';

function getFormattedDate(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

function createNewSession(): WorkoutSessionData {
  return {
    id: crypto.randomUUID(),
    title: 'Entrenamiento de hoy',
    date: new Date().toISOString(),
    exercises: [],
  };
}

export const WorkoutSession: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<WorkoutSessionData>(() => {
    const saved = localStorage.getItem(CURRENT_WORKOUT_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Ignorar error de parsing
      }
    }
    return createNewSession();
  });

  const [history, setHistory] = useState<WorkoutSessionData[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Ignorar error de parsing
      }
    }
    return [];
  });

  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [newExerciseName, setNewExerciseName] = useState<string>('');
  const [isAddingExercise, setIsAddingExercise] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(CURRENT_WORKOUT_KEY, JSON.stringify(currentSession));
  }, [currentSession]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const handleAddExercise = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newExerciseName.trim();
    if (!trimmed) return;

    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      name: trimmed,
      sets: [
        {
          id: crypto.randomUUID(),
          setNumber: 1,
          weightKg: '',
          reps: '',
          notes: '',
        },
      ],
    };

    setCurrentSession((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));

    setNewExerciseName('');
    setIsAddingExercise(false);
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setCurrentSession((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((ex) => ex.id !== exerciseId),
    }));
  };

  const handleAddSet = (exerciseId: string) => {
    setCurrentSession((prev) => {
      const updatedExercises = prev.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;

        const lastSet = exercise.sets[exercise.sets.length - 1];
        const newSet: ExerciseSet = {
          id: crypto.randomUUID(),
          setNumber: exercise.sets.length + 1,
          weightKg: lastSet ? lastSet.weightKg : '',
          reps: lastSet ? lastSet.reps : '',
          notes: '',
        };

        return {
          ...exercise,
          sets: [...exercise.sets, newSet],
        };
      });

      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleUpdateSet = (exerciseId: string, updatedSet: ExerciseSet) => {
    setCurrentSession((prev) => {
      const updatedExercises = prev.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((s) => (s.id === updatedSet.id ? updatedSet : s)),
        };
      });
      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleDeleteSet = (exerciseId: string, setId: string) => {
    setCurrentSession((prev) => {
      const updatedExercises = prev.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.filter((s) => s.id !== setId),
        };
      });
      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleFinishWorkout = () => {
    if (currentSession.exercises.length === 0) {
      alert('Añade al menos un ejercicio antes de finalizar.');
      return;
    }

    const finishedSession: WorkoutSessionData = {
      ...currentSession,
      completedAt: new Date().toISOString(),
    };

    setHistory((prev) => [finishedSession, ...prev]);
    const nextSession = createNewSession();
    setCurrentSession(nextSession);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased px-4 py-8 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-baseline justify-between mb-8 pb-4 border-b border-zinc-900">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            {currentSession.title}
          </h1>
          <p className="text-xs text-zinc-500 capitalize mt-0.5">
            {getFormattedDate(currentSession.date)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-900"
            title="Ver Historial"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleFinishWorkout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-zinc-950 hover:bg-white text-xs font-semibold rounded-lg transition-colors active:scale-95"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Finalizar</span>
          </button>
        </div>
      </header>

      {/* Historial Toggle */}
      {showHistory && (
        <section className="mb-8 p-4 bg-zinc-900/40 rounded-xl border border-zinc-900">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
              Sesiones Finalizadas ({history.length})
            </h2>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Cerrar
            </button>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-zinc-600 py-2">No hay sesiones finalizadas aún.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-900 text-xs"
                >
                  <div className="flex justify-between text-zinc-400 font-medium">
                    <span className="capitalize">{getFormattedDate(item.completedAt || item.date)}</span>
                    <span className="text-zinc-600">{item.exercises.length} ejercicios</span>
                  </div>
                  <div className="mt-1 text-zinc-500">
                    {item.exercises.map((e) => e.name).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Lista de Ejercicios */}
      <main className="space-y-6">
        {currentSession.exercises.length === 0 && !isAddingExercise && (
          <div className="py-12 text-center text-zinc-600 text-sm">
            Empieza añadiendo tu primer ejercicio.
          </div>
        )}

        {currentSession.exercises.map((exercise) => (
          <section
            key={exercise.id}
            className="pb-4 border-b border-zinc-900/80 last:border-b-0"
          >
            {/* Cabecera del ejercicio */}
            <div className="flex items-center justify-between py-1 mb-1">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-200">
                {exercise.name}
              </h2>
              <button
                type="button"
                onClick={() => handleDeleteExercise(exercise.id)}
                className="text-zinc-600 hover:text-rose-400 p-1 transition-colors"
                title="Eliminar ejercicio"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Series */}
            <div className="space-y-0.5">
              {exercise.sets.map((set, sIndex) => (
                <SetRow
                  key={set.id}
                  set={set}
                  index={sIndex}
                  onUpdate={(updated) => handleUpdateSet(exercise.id, updated)}
                  onDelete={(setId) => handleDeleteSet(exercise.id, setId)}
                />
              ))}
            </div>

            {/* Añadir serie */}
            <button
              type="button"
              onClick={() => handleAddSet(exercise.id)}
              className="mt-2 text-xs font-medium text-zinc-500 hover:text-zinc-300 py-1 px-2 rounded hover:bg-zinc-900/60 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir serie</span>
            </button>
          </section>
        ))}

        {/* Añadir Ejercicio Input / Button */}
        {isAddingExercise ? (
          <form
            onSubmit={handleAddExercise}
            className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/50 border border-zinc-800"
          >
            <input
              type="text"
              autoFocus
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              placeholder="Nombre del ejercicio (ej. Press banca)"
              className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 px-2 py-1 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newExerciseName.trim()}
              className="px-3 py-1 bg-zinc-100 text-zinc-950 font-medium text-xs rounded-lg disabled:opacity-30 transition-opacity"
            >
              Añadir
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingExercise(false);
                setNewExerciseName('');
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 px-1"
            >
              Cancelar
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingExercise(true)}
            className="w-full py-3 border border-zinc-800/80 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Ejercicio</span>
          </button>
        )}
      </main>
    </div>
  );
};
