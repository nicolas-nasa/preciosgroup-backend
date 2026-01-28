/**
 * Validates if a string is a valid CPF or CNPJ
 * @param document - The document string (CPF or CNPJ)
 * @returns true if it's a valid CPF or CNPJ, false otherwise
 */
export function isValidCPFOrCNPJ(document: string): boolean {
  // Remove common formatting characters
  const cleanDocument = document.replace(/[.\-\/]/g, '');

  // Check if it's empty or contains non-numeric characters
  if (!cleanDocument || /\D/.test(cleanDocument)) {
    return false;
  }

  // CPF has 11 digits, CNPJ has 14 digits
  if (cleanDocument.length === 11) {
    return isValidCPF(cleanDocument);
  } else if (cleanDocument.length === 14) {
    return isValidCNPJ(cleanDocument);
  }

  return false;
}

/**
 * Validates if a string is a valid CPF
 * @param cpf - The CPF string (without formatting)
 * @returns true if it's a valid CPF, false otherwise
 */
export function isValidCPF(cpf: string): boolean {
  // Remove formatting
  const cleanCPF = cpf.replace(/[.\-]/g, '');

  // Check if all digits are the same (invalid CPF)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Check format and calculate first verification digit
  if (cleanCPF.length !== 11) {
    return false;
  }

  let sum = 0;
  let remainder = 0;

  // Calculate first verification digit
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cleanCPF.substring(9, 10))) {
    return false;
  }

  // Calculate second verification digit
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cleanCPF.substring(10, 11))) {
    return false;
  }

  return true;
}

/**
 * Validates if a string is a valid CNPJ
 * @param cnpj - The CNPJ string (without formatting)
 * @returns true if it's a valid CNPJ, false otherwise
 */
export function isValidCNPJ(cnpj: string): boolean {
  // Remove formatting
  const cleanCNPJ = cnpj.replace(/[.\-\/]/g, '');

  // Check if all digits are the same (invalid CNPJ)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }

  // Check format
  if (cleanCNPJ.length !== 14) {
    return false;
  }

  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  let digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;

  // Calculate first verification digit
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return false;
  }

  // Calculate second verification digit
  size = size + 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) {
    return false;
  }

  return true;
}
