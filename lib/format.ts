export function formatMoney(pence: number): string {
  const sign = pence < 0 ? '-' : '';
  return `${sign}£${(Math.abs(pence) / 100).toFixed(2)}`;
}

export function formatStake(pence: number): string {
  if (pence >= 100) {
    return formatMoney(pence);
  }
  return `${pence}p`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function buildSettleUpSummary(
  totals: { name: string; net: number }[],
): string {
  const lines = totals.map((t) => {
    if (t.net > 0) {
      return `${t.name} is owed ${formatMoney(t.net)}`;
    }
    if (t.net < 0) {
      return `${t.name} owes ${formatMoney(Math.abs(t.net))}`;
    }
    return `${t.name} is even`;
  });
  return lines.join('\n');
}
