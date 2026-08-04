export function formatFee(feeMin: number, feeMax: number, feeOnApplication: boolean): string {
  if (feeOnApplication) return "Fee on application";
  const k = (n: number) => (n % 1000 === 0 ? `$${n / 1000}k` : `$${(n / 1000).toFixed(1)}k`);
  if (!feeMax || feeMax === feeMin) return `${k(feeMin)}+`;
  return `${k(feeMin)} – ${k(feeMax)}`;
}
