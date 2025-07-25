/**
 * Valida um número de CPF.
 * @param cpf O CPF a ser validado (pode conter máscara).
 * @returns `true` se o CPF for válido, `false` caso contrário.
 */
export const validateCpf = (cpf: string): boolean => {
  const cpfClean = cpf.replace(/[^\d]+/g, '');
  if (cpfClean.length !== 11 || !!cpfClean.match(/(\d)\1{10}/)) {
    return false;
  }
  const digits = cpfClean.split('').map(Number);
  const validator = (n: number) => (digits.slice(0, n).reduce((sum, digit, i) => sum + digit * (n + 1 - i), 0) * 10) % 11 % 10;
  return validator(9) === digits[9] && validator(10) === digits[10];
};