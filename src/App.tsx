import React from 'react';
import { WorkoutSession } from './components/WorkoutSession';
import { WorkoutSessionData } from './types';

const INITIAL_MOCK_DATA: WorkoutSessionData = {
  id: 'workout-101',
  name: 'Día 1: Pierna y Empuje',
  startTime: new Date().toISOString(),
  exercises: [
    {
      id: 'we-1',
      workoutId: 'workout-101',
      exerciseId: 'ex-10',
      exerciseName: 'Sentadilla Trasera con Barra',
      technicalNotes: 'Pies ancho de hombros, talón bien apoyado',
      orderIndex: 0,
      restSeconds: 120,
      historicalPr1Rm: 140,
      previousSessionSets: [
        { weightKg: 100, reps: 8 },
        { weightKg: 110, reps: 6 },
        { weightKg: 110, reps: 5 }
      ],
      sets: [
        {
          id: 's-1',
          workoutExerciseId: 'we-1',
          setNumber: 1,
          type: 'warmup',
          weightKg: 60,
          reps: 10,
          isCompleted: false
        },
        {
          id: 's-2',
          workoutExerciseId: 'we-1',
          setNumber: 2,
          type: 'working',
          weightKg: 100,
          reps: 8,
          isCompleted: false
        }
      ]
    },
    {
      id: 'we-2',
      workoutId: 'workout-101',
      exerciseId: 'ex-20',
      exerciseName: 'Press Militar Mancuernas',
      technicalNotes: 'Banco a 75°, antebrazos verticales',
      orderIndex: 1,
      restSeconds: 90,
      historicalPr1Rm: 36,
      previousSessionSets: [
        { weightKg: 24, reps: 10 },
        { weightKg: 26, reps: 8 }
      ],
      sets: [
        {
          id: 's-3',
          workoutExerciseId: 'we-2',
          setNumber: 1,
          type: 'working',
          weightKg: 24,
          reps: 10,
          isCompleted: false
        }
      ]
    }
  ]
};

export default function App() {
  return <WorkoutSession initialWorkout={INITIAL_MOCK_DATA} />;
}
