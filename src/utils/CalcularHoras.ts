// utils/CalcularHoras.ts
export function calcularHoras(entrada: Date, salida: Date): number {
  return parseFloat(((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60)).toFixed(2));
}
