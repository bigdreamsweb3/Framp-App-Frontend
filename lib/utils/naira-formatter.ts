/**
 * Utility functions for formatting Naira amounts
 */

/**
 * Formats a number to Naira currency format with commas
 * @param value - The numeric value to format
 * @returns Formatted string with commas (e.g., "1,000", "1,000,000")
 */
export function formatNairaAmount(value: number | string): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue) || numericValue === 0) {
    return '';
  }
  
  return numericValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Parses a formatted Naira string back to a numeric value
 * @param formattedValue - The formatted string (e.g., "1,000", "1,000,000")
 * @returns Numeric value
 */
export function parseNairaAmount(formattedValue: string): number {
  // Remove all commas and parse as float
  const cleanValue = formattedValue.replace(/,/g, '');
  const numericValue = parseFloat(cleanValue);
  
  return isNaN(numericValue) ? 0 : numericValue;
}

/**
 * Formats input value for display while typing
 * @param value - The input value
 * @returns Formatted string for display
 */
export function formatNairaInput(value: string): string {
  // Remove all non-numeric characters except decimal point
  let cleanValue = value.replace(/[^0-9.]/g, '');
  
  // Handle multiple decimal points
  const parts = cleanValue.split('.');
  if (parts.length > 2) {
    cleanValue = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Parse and format
  const numericValue = parseFloat(cleanValue);
  if (isNaN(numericValue) || numericValue === 0) {
    return cleanValue; // Return as-is for partial input like "0." or ""
  }
  
  // Format with commas
  const formatted = numericValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  // If the original had a decimal point at the end, preserve it
  if (cleanValue.endsWith('.')) {
    return formatted + '.';
  }
  
  return formatted;
}
