export function normalizePhone(input: string): string {
  // 1. Remove everything but digits
  const digits = input.replace(/\D/g, '');
  
  // 2. If exactly 10 digits, assume Indian local
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  // 3. If already has a country code (11–15 digits total), just add '+'
  if (digits.length > 10 && digits.length <= 15) {
    return `+${digits}`;
  }
  
  throw new Error('Invalid phone number');
}
