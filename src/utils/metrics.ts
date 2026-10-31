/**
 * Calcula 1RM estimado usando la ecuacion de Epley:
 * 1RM = Peso * (1 + Reps / 30)
 */
export function calculate1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  const oneRm = weightKg * (1 + reps / 30);
  return Math.round(oneRm * 10) / 10;
}

/**
 * Calcula el tonelaje total (Volumen acumulado) de una serie o conjunto de series
 */
export function calculateVolume(weightKg: number, reps: number): number {
  return Math.max(0, weightKg) * Math.max(0, reps);
}
