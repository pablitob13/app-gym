import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Trash2, Edit3 } from 'lucide-react';
import { WorkoutSession } from '../types';

interface CalendarViewProps {
  sessions: WorkoutSession[];
  onOpenSession: (sessionId: string) => void;
  onNewSessionForDate: (dateStr: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function padZero(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  onOpenSession,
  onNewSessionForDate,
  onDeleteSession,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-11
  
  const todayStr = `${today.getFullYear()}-${padZero(today.getMonth() + 1)}-${padZero(today.getDate())}`;
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Días en el mes
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Día de la semana del 1er día: getDay() -> 0 Dom, 1 Lun, ..., 6 Sáb.
  // Convertimos a 0=Lun, 1=Mar, ..., 6=Dom
  const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7;

  // Sesiones indexadas por fecha YYYY-MM-DD
  const sessionsByDate: Record<string, WorkoutSession[]> = {};
  sessions.forEach((sess) => {
    if (!sessionsByDate[sess.date]) {
      sessionsByDate[sess.date] = [];
    }
    sessionsByDate[sess.date].push(sess);
  });

  const selectedSessions = sessionsByDate[selectedDate] || [];

  const formatDisplayDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Selector de Mes */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold tracking-tight text-slate-100">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cuadrícula del Calendario */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAY_LABELS.map((day) => (
            <span key={day} className="text-[11px] font-semibold text-slate-500 py-1">
              {day}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Celdas vacías antes del 1er día */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 rounded-lg" />
          ))}

          {/* Días del mes */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const dateStr = `${currentYear}-${padZero(currentMonth + 1)}-${padZero(dayNum)}`;
            const isSelected = selectedDate === dateStr;
            const isToday = todayStr === dateStr;
            const daySessions = sessionsByDate[dateStr] || [];
            const hasSessions = daySessions.length > 0;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-all duration-150 ${
                  isSelected
                    ? 'bg-slate-100 text-slate-900 font-bold shadow-md'
                    : isToday
                    ? 'bg-slate-800/80 text-slate-100 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <span className="text-xs leading-none">{dayNum}</span>

                {/* Indicadores de sesiones (puntos discretos) */}
                {hasSessions && (
                  <div className="flex gap-0.5 mt-1 justify-center absolute bottom-1.5">
                    {daySessions.slice(0, 3).map((s, idx) => (
                      <span
                        key={s.id || idx}
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-slate-900' : 'bg-emerald-400'
                        }`}
                      />
                    ))}
                    {daySessions.length > 3 && (
                      <span
                        className={`w-1 h-1 rounded-full opacity-60 ${
                          isSelected ? 'bg-slate-900' : 'bg-emerald-400'
                        }`}
                      />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel del día seleccionado */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Día Seleccionado
            </span>
            <h3 className="text-sm font-semibold text-slate-200 capitalize">
              {formatDisplayDate(selectedDate)}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNewSessionForDate(selectedDate)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-white text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Añadir entrenamiento</span>
          </button>
        </div>

        {/* Lista de sesiones para este día */}
        {selectedSessions.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No hay entrenamientos registrados para este día.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedSessions.map((sess, idx) => (
              <div
                key={sess.id}
                className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">
                        {sess.routineName || 'Entrenamiento libre'}
                      </span>
                      {selectedSessions.length > 1 && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          Sesión {idx + 1}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {sess.exercises.length} {sess.exercises.length === 1 ? 'ejercicio' : 'ejercicios'} ·{' '}
                      {sess.exercises.map((e) => e.name).filter(Boolean).join(', ') || 'Sin ejercicios'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenSession(sess.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
                      title="Abrir o editar sesión"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('¿Eliminar este entrenamiento de la fecha?')) {
                          onDeleteSession(sess.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                      title="Borrar sesión"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
