import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
import { Routine, RoutineExercise, RoutineSetTarget } from '../types';

interface RoutinesManagerProps {
  routines: Routine[];
  onSaveRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
}

export const RoutinesManager: React.FC<RoutinesManagerProps> = ({
  routines,
  onSaveRoutine,
  onDeleteRoutine,
}) => {
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);

  const startCreateRoutine = () => {
    const newRoutine: Routine = {
      id: crypto.randomUUID(),
      name: '',
      exercises: [],
    };
    setEditingRoutine(newRoutine);
  };

  const handleAddExerciseToEditing = () => {
    if (!editingRoutine) return;
    const newExercise: RoutineExercise = {
      id: crypto.randomUUID(),
      name: '',
      targetSets: [
        {
          setNumber: 1,
          targetReps: '10',
          targetWeight: '',
        },
      ],
    };
    setEditingRoutine({
      ...editingRoutine,
      exercises: [...editingRoutine.exercises, newExercise],
    });
  };

  const handleRemoveExercise = (exerciseId: string) => {
    if (!editingRoutine) return;
    setEditingRoutine({
      ...editingRoutine,
      exercises: editingRoutine.exercises.filter((ex) => ex.id !== exerciseId),
    });
  };

  const handleUpdateExerciseName = (exerciseId: string, name: string) => {
    if (!editingRoutine) return;
    setEditingRoutine({
      ...editingRoutine,
      exercises: editingRoutine.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, name } : ex
      ),
    });
  };

  const handleAddSetToExercise = (exerciseId: string) => {
    if (!editingRoutine) return;
    setEditingRoutine({
      ...editingRoutine,
      exercises: editingRoutine.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const lastSet = ex.targetSets[ex.targetSets.length - 1];
        const newSet: RoutineSetTarget = {
          setNumber: ex.targetSets.length + 1,
          targetReps: lastSet ? lastSet.targetReps : '10',
          targetWeight: lastSet ? lastSet.targetWeight : '',
        };
        return {
          ...ex,
          targetSets: [...ex.targetSets, newSet],
        };
      }),
    });
  };

  const handleRemoveSetFromExercise = (exerciseId: string, setIndex: number) => {
    if (!editingRoutine) return;
    setEditingRoutine({
      ...editingRoutine,
      exercises: editingRoutine.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const filtered = ex.targetSets.filter((_, idx) => idx !== setIndex);
        const renumbered = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return {
          ...ex,
          targetSets: renumbered,
        };
      }),
    });
  };

  const handleUpdateSetTarget = (
    exerciseId: string,
    setIndex: number,
    field: 'targetReps' | 'targetWeight',
    value: string
  ) => {
    if (!editingRoutine) return;
    setEditingRoutine({
      ...editingRoutine,
      exercises: editingRoutine.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const newSets = [...ex.targetSets];
        newSets[setIndex] = {
          ...newSets[setIndex],
          [field]: value,
        };
        return {
          ...ex,
          targetSets: newSets,
        };
      }),
    });
  };

  const handleSaveEditing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoutine) return;
    const trimmedName = editingRoutine.name.trim();
    if (!trimmedName) {
      alert('Introduce un nombre para la rutina.');
      return;
    }
    const cleanExercises = editingRoutine.exercises
      .map((ex) => ({
        ...ex,
        name: ex.name.trim(),
        targetSets: ex.targetSets.length > 0 ? ex.targetSets : [{ setNumber: 1, targetReps: 10, targetWeight: '' }],
      }))
      .filter((ex) => ex.name.length > 0);

    onSaveRoutine({
      ...editingRoutine,
      name: trimmedName,
      exercises: cleanExercises,
    });
    setEditingRoutine(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera sección */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100 tracking-tight">
            Plantillas de Rutinas
          </h2>
          <p className="text-xs text-slate-400">
            Define tus programas de entrenamiento predeterminados
          </p>
        </div>
        {!editingRoutine && (
          <button
            type="button"
            onClick={startCreateRoutine}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-white text-slate-900 rounded-lg text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Rutina</span>
          </button>
        )}
      </div>

      {/* Modal / Formulario de Edición */}
      {editingRoutine && (
        <form
          onSubmit={handleSaveEditing}
          className="p-5 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl space-y-5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200">
              {editingRoutine.id && routines.some((r) => r.id === editingRoutine.id)
                ? 'Editar Rutina'
                : 'Crear Nueva Rutina'}
            </h3>
            <button
              type="button"
              onClick={() => setEditingRoutine(null)}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Nombre de la rutina
            </label>
            <input
              type="text"
              autoFocus
              value={editingRoutine.name}
              onChange={(e) => setEditingRoutine({ ...editingRoutine, name: e.target.value })}
              placeholder="Ej: Día de Pierna, Empuje / Pecho..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Lista de ejercicios de la plantilla */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ejercicios ({editingRoutine.exercises.length})
              </span>
              <button
                type="button"
                onClick={handleAddExerciseToEditing}
                className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-md transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir ejercicio</span>
              </button>
            </div>

            {editingRoutine.exercises.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2 text-center bg-slate-950/40 rounded-lg border border-slate-800/50">
                Añade ejercicios a esta rutina para configurar series y pesos objetivo.
              </p>
            ) : (
              <div className="space-y-4">
                {editingRoutine.exercises.map((exercise, eIdx) => (
                  <div
                    key={exercise.id}
                    className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500 w-5">#{eIdx + 1}</span>
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => handleUpdateExerciseName(exercise.id, e.target.value)}
                        placeholder="Nombre del ejercicio (ej: Sentadilla barra)"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(exercise.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Eliminar ejercicio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Series Objetivo */}
                    <div className="pl-6 space-y-1.5">
                      <div className="text-[11px] text-slate-400 font-medium grid grid-cols-12 gap-2 px-1">
                        <span className="col-span-2">Serie</span>
                        <span className="col-span-5">Reps objetivo</span>
                        <span className="col-span-4">Peso objetivo</span>
                        <span className="col-span-1"></span>
                      </div>

                      {exercise.targetSets.map((set, sIdx) => (
                        <div
                          key={sIdx}
                          className="grid grid-cols-12 gap-2 items-center bg-slate-900/40 px-2 py-1 rounded"
                        >
                          <span className="col-span-2 text-xs font-mono text-slate-500">
                            {set.setNumber}
                          </span>
                          <input
                            type="text"
                            value={set.targetReps}
                            onChange={(e) =>
                              handleUpdateSetTarget(exercise.id, sIdx, 'targetReps', e.target.value)
                            }
                            placeholder="10"
                            className="col-span-5 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 text-center focus:outline-none focus:border-slate-600"
                          />
                          <div className="col-span-4 flex items-center gap-1">
                            <input
                              type="text"
                              value={set.targetWeight}
                              onChange={(e) =>
                                handleUpdateSetTarget(exercise.id, sIdx, 'targetWeight', e.target.value)
                              }
                              placeholder="kg opcional"
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 text-center focus:outline-none focus:border-slate-600"
                            />
                          </div>
                          <div className="col-span-1 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveSetFromExercise(exercise.id, sIdx)}
                              className="text-slate-600 hover:text-rose-400 text-xs"
                              title="Borrar serie"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddSetToExercise(exercise.id)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 mt-1 flex items-center gap-1 py-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Añadir serie objetivo</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditingRoutine(null)}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-1.5 bg-slate-100 hover:bg-white text-slate-900 rounded-lg text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Rutina</span>
            </button>
          </div>
        </form>
      )}

      {/* Lista de rutinas existentes */}
      <div className="space-y-3">
        {routines.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/20">
            <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-400">Aún no has creado ninguna rutina</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Crea plantillas para tus sesiones habituales (ej: Empuje, Tirón, Piernas) y registra entrenamientos rápidamente.
            </p>
          </div>
        ) : (
          routines.map((routine) => {
            const isExpanded = expandedRoutineId === routine.id;
            return (
              <div
                key={routine.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-700/70"
              >
                <div className="p-4 flex items-center justify-between">
                  <div
                    className="flex-1 cursor-pointer select-none"
                    onClick={() => setExpandedRoutineId(isExpanded ? null : routine.id)}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
                        {routine.name}
                      </h3>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full">
                        {routine.exercises.length} {routine.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {routine.exercises.map((e) => e.name).filter(Boolean).join(' • ') || 'Sin ejercicios aún'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 ml-3">
                    <button
                      type="button"
                      onClick={() => setEditingRoutine(JSON.parse(JSON.stringify(routine)))}
                      className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
                      title="Editar plantilla"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Estás seguro de eliminar la rutina "${routine.name}"?`)) {
                          onDeleteRoutine(routine.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                      title="Eliminar plantilla"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedRoutineId(isExpanded ? null : routine.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Vista previa desplegable de ejercicios */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-800/60 bg-slate-950/30 text-xs space-y-2">
                    {routine.exercises.length === 0 ? (
                      <p className="text-slate-500 italic">No hay ejercicios configurados.</p>
                    ) : (
                      routine.exercises.map((ex, i) => (
                        <div key={ex.id || i} className="flex items-center justify-between text-slate-300">
                          <span className="font-medium text-slate-200">
                            {i + 1}. {ex.name || 'Sin nombre'}
                          </span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            {ex.targetSets.length} series
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
