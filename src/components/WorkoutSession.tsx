import React, { useState } from 'react';
import { Plus, Trash2, Check, ArrowLeft, Copy, RefreshCw, MessageSquare } from 'lucide-react';
import { WorkoutSession as IWorkoutSession, Routine, SessionExercise, SessionSet } from '../types';

interface WorkoutSessionProps {
  session: IWorkoutSession;
  routines: Routine[];
  allSessions: IWorkoutSession[];
  onSaveSession: (session: IWorkoutSession) => void;
  onCancel: () => void;
}

export const WorkoutSession: React.FC<WorkoutSessionProps> = ({
  session: initialSession,
  routines,
  allSessions,
  onSaveSession,
  onCancel,
}) => {
  const [session, setSession] = useState<IWorkoutSession>(initialSession);
  const [selectedRoutineToLoad, setSelectedRoutineToLoad] = useState<string>('');
  const [newExerciseInput, setNewExerciseInput] = useState<string>('');
  const [isAddingExercise, setIsAddingExercise] = useState<boolean>(false);
  const [renamingExerciseId, setRenamingExerciseId] = useState<string | null>(null);
  const [renamedValue, setRenamedValue] = useState<string>('');

  // Busca el historial previo del ejercicio en sesiones anteriores
  const getLastPerformance = (
    exerciseName: string,
    setIndex: number
  ): { lastWeight: string; lastReps: string } => {
    if (!exerciseName) return { lastWeight: '', lastReps: '' };

    const targetName = exerciseName.trim().toLowerCase();

    // Ordenar sesiones pasadas más recientes excluyendo la actual
    const pastSessions = allSessions
      .filter((s) => s.id !== session.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const past of pastSessions) {
      const matchExercise = past.exercises.find(
        (e) => e.name.trim().toLowerCase() === targetName
      );
      if (matchExercise && matchExercise.sets && matchExercise.sets[setIndex]) {
        const foundSet = matchExercise.sets[setIndex];
        const w = foundSet.weight !== undefined && foundSet.weight !== null ? String(foundSet.weight) : '';
        const r = foundSet.reps !== undefined && foundSet.reps !== null ? String(foundSet.reps) : '';
        if (w || r) {
          return { lastWeight: w, lastReps: r };
        }
      }
    }

    return { lastWeight: '', lastReps: '' };
  };

  // Cargar una rutina seleccionada
  const handleLoadRoutine = (routineId: string) => {
    if (!routineId) return;
    const found = routines.find((r) => r.id === routineId);
    if (!found) return;

    const mappedExercises: SessionExercise[] = found.exercises.map((rex) => ({
      id: crypto.randomUUID(),
      name: rex.name,
      sets: rex.targetSets.map((ts) => ({
        id: crypto.randomUUID(),
        setNumber: ts.setNumber,
        weight: '',
        reps: '',
        notes: '',
      })),
    }));

    setSession((prev) => ({
      ...prev,
      routineName: found.name,
      routineId: found.id,
      exercises: mappedExercises,
    }));
  };

  // Añadir ejercicio en vivo
  const handleAddCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newExerciseInput.trim();
    if (!trimmed) return;

    const newEx: SessionExercise = {
      id: crypto.randomUUID(),
      name: trimmed,
      sets: [
        {
          id: crypto.randomUUID(),
          setNumber: 1,
          weight: '',
          reps: '',
          notes: '',
        },
      ],
    };

    setSession((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newEx],
    }));
    setNewExerciseInput('');
    setIsAddingExercise(false);
  };

  // Añadir serie a un ejercicio
  const handleAddSet = (exerciseId: string) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const newSet: SessionSet = {
          id: crypto.randomUUID(),
          setNumber: ex.sets.length + 1,
          weight: '',
          reps: '',
          notes: '',
        };
        return {
          ...ex,
          sets: [...ex.sets, newSet],
        };
      }),
    }));
  };

  // Eliminar serie
  const handleDeleteSet = (exerciseId: string, setId: string) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const filtered = ex.sets.filter((s) => s.id !== setId);
        const renumbered = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return {
          ...ex,
          sets: renumbered,
        };
      }),
    }));
  };

  // Actualizar datos de una serie
  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    field: keyof SessionSet,
    value: string
  ) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
        };
      }),
    }));
  };

  // Duplicar ejercicio
  const handleDuplicateExercise = (exerciseId: string) => {
    setSession((prev) => {
      const idx = prev.exercises.findIndex((e) => e.id === exerciseId);
      if (idx === -1) return prev;
      const target = prev.exercises[idx];
      const duplicated: SessionExercise = {
        id: crypto.randomUUID(),
        name: `${target.name} (Copia)`,
        notes: target.notes,
        sets: target.sets.map((s) => ({
          ...s,
          id: crypto.randomUUID(),
        })),
      };
      const updated = [...prev.exercises];
      updated.splice(idx + 1, 0, duplicated);
      return { ...prev, exercises: updated };
    });
  };

  // Sustituir / Renombrar ejercicio en vivo
  const handleStartRename = (exercise: SessionExercise) => {
    setRenamingExerciseId(exercise.id);
    setRenamedValue(exercise.name);
  };

  const handleApplyRename = (exerciseId: string) => {
    if (!renamedValue.trim()) return;
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, name: renamedValue.trim() } : ex
      ),
    }));
    setRenamingExerciseId(null);
  };

  // Eliminar ejercicio de la sesión
  const handleDeleteExercise = (exerciseId: string) => {
    setSession((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((ex) => ex.id !== exerciseId),
    }));
  };

  // Finalizar y persistir
  const handleFinish = () => {
    if (session.exercises.length === 0) {
      alert('Añade al menos un ejercicio a la sesión antes de guardarla.');
      return;
    }
    const finalized: IWorkoutSession = {
      ...session,
      routineName: session.routineName.trim() || 'Entrenamiento libre',
      completedAt: new Date().toISOString(),
    };
    onSaveSession(finalized);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Barra de cabecera de la sesión */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
            title="Volver al calendario"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <input
              type="text"
              value={session.routineName}
              onChange={(e) => setSession({ ...session, routineName: e.target.value })}
              placeholder="Nombre del entrenamiento"
              className="text-base font-semibold bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 font-mono">
              Fecha: {session.date}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFinish}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition active:scale-95"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Guardar Sesión</span>
        </button>
      </div>

      {/* Selector inicial para cargar plantilla de rutina */}
      {session.exercises.length === 0 && routines.length > 0 && (
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            ¿Quieres cargar una rutina predeterminada?
          </label>
          <div className="flex gap-2">
            <select
              value={selectedRoutineToLoad}
              onChange={(e) => setSelectedRoutineToLoad(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-600"
            >
              <option value="">Selecciona una rutina...</option>
              {routines.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.exercises.length} ejercicios)
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedRoutineToLoad}
              onClick={() => handleLoadRoutine(selectedRoutineToLoad)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-white text-slate-950 disabled:opacity-40 text-xs font-semibold rounded-lg transition"
            >
              Cargar
            </button>
          </div>
        </div>
      )}

      {/* Lista de Ejercicios en vivo */}
      <div className="space-y-6">
        {session.exercises.length === 0 && (
          <div className="py-10 text-center text-xs text-slate-500">
            Comienza cargando una rutina o añade un ejercicio libre abajo.
          </div>
        )}

        {session.exercises.map((exercise, eIndex) => (
          <section
            key={exercise.id}
            className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl space-y-3"
          >
            {/* Header del Ejercicio en vivo */}
            <div className="flex items-center justify-between">
              {renamingExerciseId === exercise.id ? (
                <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                  <input
                    type="text"
                    value={renamedValue}
                    autoFocus
                    onChange={(e) => setRenamedValue(e.target.value)}
                    placeholder="Sustituir nombre..."
                    className="flex-1 bg-slate-950 border border-slate-700 px-2 py-1 text-xs text-slate-100 rounded focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyRename(exercise.id)}
                    className="px-2 py-1 bg-slate-100 text-slate-900 text-xs font-medium rounded"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingExerciseId(null)}
                    className="text-xs text-slate-400 px-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">#{eIndex + 1}</span>
                  <h3 className="text-sm font-semibold text-slate-100">{exercise.name}</h3>
                </div>
              )}

              <div className="flex items-center gap-1">
                {/* Sustituir / Renombrar */}
                <button
                  type="button"
                  onClick={() => handleStartRename(exercise)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition"
                  title="Sustituir o renombrar ejercicio (máquina ocupada)"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                {/* Duplicar */}
                <button
                  type="button"
                  onClick={() => handleDuplicateExercise(exercise.id)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition"
                  title="Duplicar ejercicio"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {/* Eliminar ejercicio */}
                <button
                  type="button"
                  onClick={() => handleDeleteExercise(exercise.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-md transition"
                  title="Eliminar ejercicio de la sesión"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Encabezado de columnas */}
            <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2">
              <span className="col-span-1 text-center">Set</span>
              <span className="col-span-3 text-center">Kg</span>
              <span className="col-span-3 text-center">Reps</span>
              <span className="col-span-4">Sensaciones / RPE</span>
              <span className="col-span-1"></span>
            </div>

            {/* Series del ejercicio */}
            <div className="space-y-1.5">
              {exercise.sets.map((set, sIdx) => {
                const prevData = getLastPerformance(exercise.name, sIdx);
                const placeholderWeight = prevData.lastWeight ? `${prevData.lastWeight} kg` : '0 kg';
                const placeholderReps = prevData.lastReps ? `${prevData.lastReps} reps` : '0';

                return (
                  <div
                    key={set.id}
                    className="grid grid-cols-12 gap-2 items-center bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60"
                  >
                    <span className="col-span-1 text-center text-xs font-mono text-slate-400">
                      {set.setNumber}
                    </span>

                    {/* Peso */}
                    <div className="col-span-3 relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={set.weight}
                        placeholder={placeholderWeight}
                        onChange={(e) =>
                          handleUpdateSet(exercise.id, set.id, 'weight', e.target.value)
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-md py-1 px-1.5 text-xs text-center text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-500"
                      />
                    </div>

                    {/* Reps */}
                    <div className="col-span-3 relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={set.reps}
                        placeholder={placeholderReps}
                        onChange={(e) =>
                          handleUpdateSet(exercise.id, set.id, 'reps', e.target.value)
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-md py-1 px-1.5 text-xs text-center text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-500"
                      />
                    </div>

                    {/* Notas */}
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={set.notes}
                        placeholder="RPE, fácil, fallo..."
                        onChange={(e) =>
                          handleUpdateSet(exercise.id, set.id, 'notes', e.target.value)
                        }
                        className="w-full bg-transparent px-1.5 py-1 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-b focus:border-slate-600"
                      />
                    </div>

                    {/* Eliminar serie */}
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteSet(exercise.id, set.id)}
                        className="text-slate-600 hover:text-rose-400 text-xs p-1"
                        title="Borrar serie"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botón para añadir más series de forma flexible */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleAddSet(exercise.id)}
                className="text-xs text-slate-400 hover:text-slate-100 flex items-center gap-1 py-1 px-2 rounded hover:bg-slate-800/50 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir serie</span>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <MessageSquare className="w-3 h-3" />
                <input
                  type="text"
                  placeholder="Nota general del ejercicio..."
                  value={exercise.notes || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSession((prev) => ({
                      ...prev,
                      exercises: prev.exercises.map((ex) =>
                        ex.id === exercise.id ? { ...ex, notes: val } : ex
                      ),
                    }));
                  }}
                  className="bg-transparent text-slate-300 placeholder-slate-600 text-[11px] focus:outline-none"
                />
              </div>
            </div>
          </section>
        ))}

        {/* Añadir Ejercicio en vivo */}
        {isAddingExercise ? (
          <form
            onSubmit={handleAddCustomExercise}
            className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-700 rounded-xl"
          >
            <input
              type="text"
              autoFocus
              value={newExerciseInput}
              onChange={(e) => setNewExerciseInput(e.target.value)}
              placeholder="Nombre del nuevo ejercicio..."
              className="flex-1 bg-transparent px-2 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newExerciseInput.trim()}
              className="px-3 py-1 bg-slate-100 text-slate-900 text-xs font-semibold rounded-lg disabled:opacity-40"
            >
              Añadir
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingExercise(false);
                setNewExerciseInput('');
              }}
              className="text-xs text-slate-400 hover:text-slate-200 px-1"
            >
              Cancelar
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingExercise(true)}
            className="w-full py-3 border border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/60 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Añadir Ejercicio a la sesión</span>
          </button>
        )}
      </div>
    </div>
  );
};
