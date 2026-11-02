export interface ExerciseSet {
  id: string;
  setNumber: number;
  weightKg: number | string;
  reps: number | string;
  notes: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export interface WorkoutSessionData {
  id: string;
  title: string;
  date: string;
  exercises: Exercise[];
  completedAt?: string;
}
