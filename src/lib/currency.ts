/**
 * Format price to Indonesian Rupiah (IDR)
 * Format: Rp. 100.000
 */
export function formatIDR(price: number): string {
  // Round to nearest whole number (no decimals for IDR)
  const rounded = Math.round(price);
  
  // Format with period as thousands separator
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  return `Rp. ${formatted}`;
}
