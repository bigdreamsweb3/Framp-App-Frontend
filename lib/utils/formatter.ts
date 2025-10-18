/**
 * Utility functions for formatting Naira amounts
 */

/**
 * Formats a number to Naira currency format with commas
 */
export function formatNairaAmount(value: number | string): string {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numericValue) || numericValue === 0) {
    return "";
  }

  return numericValue.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Parses a formatted Naira string back to a numeric value
 */
export function parseNairaAmount(formattedValue: string): number {
  const cleanValue = formattedValue.replace(/,/g, "");
  const numericValue = parseFloat(cleanValue);
  return isNaN(numericValue) ? 0 : numericValue;
}

/**
 * Formats any input value into a clean currency display
 */
export function formatCurrency(value: string | number, currency?: string): string {
  // Convert to string and remove all non-numeric except "."
  let cleanValue = String(value).replace(/[^0-9.]/g, "");

  // Prevent multiple dots (like "12.3.4")
  const parts = cleanValue.split(".");
  if (parts.length > 2) cleanValue = parts[0] + "." + parts.slice(1).join("");

  // Parse as float
  const numericValue = parseFloat(cleanValue);
  if (isNaN(numericValue)) return cleanValue; // Return raw for partial typing (like "0.")

  // Format number
  const formatted = numericValue.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  // Add ₦ if NGN or ₦
  if (currency === "NGN" || currency === "₦") {
    return `₦${formatted}`;
  }

  // If user still typing a decimal point at end, preserve it
  if (cleanValue.endsWith(".")) return formatted + ".";

  return formatted;
}
