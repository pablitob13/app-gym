export interface RoutineSetTarget {
  setNumber: number;
  targetReps: number | string;
  targetWeight: number | string;
}

export interface RoutineExercise {
  id: string;
  name: string;
  targetSets: RoutineSetTarget[];
}

export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
}

export interface SessionSet {
  id: string;
  setNumber: number;
  weight: number | string;
  reps: number | string;
  notes: string;
}

export interface SessionExercise {
  id: string;
  name: string;
  notes?: string;
  sets: SessionSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // formato YYYY-MM-DD
  routineName: string;
  routineId?: string;
  startTime?: string;
  completedAt?: string;
  exercises: SessionExercise[];
}
