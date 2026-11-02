import React, { useState, useEffect } from 'react';
import { Dumbbell, Calendar, LayoutList } from 'lucide-react';
import { Routine, WorkoutSession as IWorkoutSession } from './types';
import { RoutinesManager } from './components/RoutinesManager';
import { CalendarView } from './components/CalendarView';
import { WorkoutSession } from './components/WorkoutSession';

const ROUTINES_STORAGE_KEY = 'workout_routines_v1';
const SESSIONS_STORAGE_KEY = 'workout_sessions_v1';

// Plantillas de ejemplo iniciales si está vacío
const INITIAL_ROUTINES: Routine[] = [
  {
    id: 'routine-chest-triceps',
    name: 'Pecho y Tríceps',
    exercises: [
      {
        id: 'ex-1',
        name: 'Press Banca Plano',
        targetSets: [
          { setNumber: 1, targetReps: 10, targetWeight: '60' },
          { setNumber: 2, targetReps: 8, targetWeight: '70' },
          { setNumber: 3, targetReps: 6, targetWeight: '80' },
        ],
      },
      {
        id: 'ex-2',
        name: 'Aperturas con Mancuernas',
        targetSets: [
          { setNumber: 1, targetReps: 12, targetWeight: '14' },
          { setNumber: 2, targetReps: 12, targetWeight: '14' },
          { setNumber: 3, targetReps: 10, targetWeight: '16' },
        ],
      },
      {
        id: 'ex-3',
        name: 'Extensiones de Tríceps Polea',
        targetSets: [
          { setNumber: 1, targetReps: 12, targetWeight: '25' },
          { setNumber: 2, targetReps: 12, targetWeight: '25' },
        ],
      },
    ],
  },
  {
    id: 'routine-legs',
    name: 'Pierna Completa',
    exercises: [
      {
        id: 'ex-4',
        name: 'Sentadilla Trasera',
        targetSets: [
          { setNumber: 1, targetReps: 8, targetWeight: '80' },
          { setNumber: 2, targetReps: 8, targetWeight: '90' },
          { setNumber: 3, targetReps: 6, targetWeight: '100' },
        ],
      },
      {
        id: 'ex-5',
        name: 'Prensa Inclinada',
        targetSets: [
          { setNumber: 1, targetReps: 10, targetWeight: '140' },
          { setNumber: 2, targetReps: 10, targetWeight: '160' },
          { setNumber: 3, targetReps: 10, targetWeight: '160' },
        ],
      },
      {
        id: 'ex-6',
        name: 'Curl Femoral Tumbado',
        targetSets: [
          { setNumber: 1, targetReps: 12, targetWeight: '40' },
          { setNumber: 2, targetReps: 12, targetWeight: '40' },
        ],
      },
    ],
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'routines' | 'calendar'>('calendar');

  // Rutinas persistidas
  const [routines, setRoutines] = useState<Routine[]>(() => {
    const saved = localStorage.getItem(ROUTINES_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error cargando rutinas:', e);
      }
    }
    return INITIAL_ROUTINES;
  });

  // Sesiones persistidas
  const [sessions, setSessions] = useState<IWorkoutSession[]>(() => {
    const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error cargando sesiones:', e);
      }
    }
    return [];
  });

  // Sesión activa en edición / registro
  const [activeSession, setActiveSession] = useState<IWorkoutSession | null>(null);

  // Sincronización continua en localStorage
  useEffect(() => {
    localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Manejadores de rutinas
  const handleSaveRoutine = (routine: Routine) => {
    setRoutines((prev) => {
      const idx = prev.findIndex((r) => r.id === routine.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = routine;
        return copy;
      }
      return [...prev, routine];
    });
  };

  const handleDeleteRoutine = (routineId: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== routineId));
  };

  // Manejadores de sesiones
  const handleStartNewSessionForDate = (dateStr: string) => {
    const newSession: IWorkoutSession = {
      id: crypto.randomUUID(),
      date: dateStr,
      routineName: '',
      exercises: [],
    };
    setActiveSession(newSession);
  };

  const handleOpenExistingSession = (sessionId: string) => {
    const found = sessions.find((s) => s.id === sessionId);
    if (found) {
      setActiveSession(JSON.parse(JSON.stringify(found)));
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleSaveSession = (savedSession: IWorkoutSession) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === savedSession.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedSession;
        return copy;
      }
      return [savedSession, ...prev];
    });
    setActiveSession(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-slate-700 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-200">
              <Dumbbell className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-100">
              Workout Tracker
            </span>
          </div>

          {/* Navegación por Pestañas */}
          <nav className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveSession(null);
                setActiveTab('calendar');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'calendar' && !activeSession
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendario</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSession(null);
                setActiveTab('routines');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'routines' && !activeSession
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Rutinas</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6">
        {activeSession ? (
          <WorkoutSession
            session={activeSession}
            routines={routines}
            allSessions={sessions}
            onSaveSession={handleSaveSession}
            onCancel={() => setActiveSession(null)}
          />
        ) : activeTab === 'calendar' ? (
          <CalendarView
            sessions={sessions}
            onOpenSession={handleOpenExistingSession}
            onNewSessionForDate={handleStartNewSessionForDate}
            onDeleteSession={handleDeleteSession}
          />
        ) : (
          <RoutinesManager
            routines={routines}
            onSaveRoutine={handleSaveRoutine}
            onDeleteRoutine={handleDeleteRoutine}
          />
        )}
      </main>
    </div>
  );
}
