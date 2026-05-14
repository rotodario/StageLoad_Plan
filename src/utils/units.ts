export const MM_PER_METER = 1000;

export function mmToMeters(valueMm: number): number {
  return valueMm / MM_PER_METER;
}

export function metersToMm(valueMeters: number): number {
  return Math.round(valueMeters * MM_PER_METER);
}

export function formatMeters(valueMm: number): string {
  return `${(valueMm / MM_PER_METER).toFixed(2)} m`;
}

export function formatVolume(valueM3: number): string {
  return `${valueM3.toFixed(2)} m3`;
}
