export function obtenerTrimestre(fecha: Date): number {
  const mes = fecha.getMonth() + 1;
  if (mes >= 1 && mes <= 3) return 1;
  if (mes >= 4 && mes <= 6) return 2;
  if (mes >= 7 && mes <= 9) return 3;
  return 4;
}
