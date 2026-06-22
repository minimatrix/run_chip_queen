export const PLAYER_COLORS = [
  '#2563EB',
  '#DC2626',
  '#9333EA',
  '#EA580C',
  '#0891B2',
  '#16A34A',
  '#DB2777',
  '#CA8A04',
  '#4F46E5',
  '#0D9488',
];

export function pickPlayerColor(existingColors: string[]): string {
  const available = PLAYER_COLORS.find((c) => !existingColors.includes(c));
  return available ?? PLAYER_COLORS[existingColors.length % PLAYER_COLORS.length];
}
