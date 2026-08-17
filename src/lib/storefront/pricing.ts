export function formatAed(amount: string | number): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return `AED ${value.toFixed(2)}`;
}

export function discountPercent(basePrice: string, compareAtPrice: string | null): number | null {
  if (!compareAtPrice) return null;
  const base = Number(basePrice);
  const compare = Number(compareAtPrice);
  if (compare <= base) return null;
  return Math.round(((compare - base) / compare) * 100);
}
