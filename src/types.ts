export type SetType = 'warmup' | 'working';

export interface ExerciseSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  type: SetType;
  weightKg: number;
  reps: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  exerciseName: string;
  technicalNotes: string;
  orderIndex: number;
  restSeconds: number;
  sets: ExerciseSet[];
  historicalPr1Rm: number;
  previousSessionSets: Array<{ weightKg: number; reps: number }>;
}

export interface WorkoutSessionData {
  id: string;
  name: string;
  startTime: string;
  endTime?: string;
  exercises: WorkoutExercise[];
}
