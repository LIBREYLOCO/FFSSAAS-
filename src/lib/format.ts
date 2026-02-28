/**
 * Format a value as Mexican pesos with exactly 2 decimal places.
 * e.g.  3500      → "$3,500.00"
 *       1234.5    → "$1,234.50"
 *       undefined → "$0.00"
 */
export function formatMXN(value: number | string | null | undefined): string {
    const n = Number(value ?? 0);
    if (isNaN(n)) return "$0.00";
    return n.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * Format a percentage with 2 decimal places.
 * e.g.  5    → "5.00%"
 *       12.5 → "12.50%"
 */
export function formatPct(value: number | string | null | undefined): string {
    const n = Number(value ?? 0);
    if (isNaN(n)) return "0.00%";
    return `${n.toFixed(2)}%`;
}
