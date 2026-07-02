/**
 * Format a number with Indian-style commas (e.g., 1,200 or 12,999)
 */
export const formatPrice = (amount: number | string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-IN");
};
