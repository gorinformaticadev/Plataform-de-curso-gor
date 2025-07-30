/**
 * Gera código de estudante baseado no role do usuário
 * Formato: RA + PREFIXO + ANO + SEQUENCIAL
 * 
 * STUDENT: RA + ES + ANO + SEQUENCIAL
 * ADMIN: RA + PRO + ANO + SEQUENCIAL  
 * INSTRUCTOR: RA + IN + ANO + SEQUENCIAL
 */

export function generateStudentCode(role: 'STUDENT' | 'ADMIN' | 'INSTRUCTOR', sequencial: number): string {
  const currentYear = new Date().getFullYear().toString();
  const sequentialPadded = sequencial.toString().padStart(4, '0');
  const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  let prefix: string;
  
  switch (role) {
    case 'STUDENT':
      prefix = 'ES';
      break;
    case 'ADMIN':
      prefix = 'PRO';
      break;
    case 'INSTRUCTOR':
      prefix = 'IN';
      break;
    default:
      prefix = 'ES'; // fallback para STUDENT
  }
  
  return `RA${prefix}${currentYear}${sequentialPadded}${randomSuffix}`;
}

/**
 * Extrai informações do código de estudante
 */
export function parseStudentCode(studentCode: string) {
  const match = studentCode.match(/^RA(ES|PRO|IN)(\d{4})(\d{4})(\d{2})$/);
  
  if (!match) {
    return null;
  }
  
  const [, prefix, year, sequential, randomSuffix] = match;
  
  let role: 'STUDENT' | 'ADMIN' | 'INSTRUCTOR';
  switch (prefix) {
    case 'ES':
      role = 'STUDENT';
      break;
    case 'PRO':
      role = 'ADMIN';
      break;
    case 'IN':
      role = 'INSTRUCTOR';
      break;
    default:
      return null;
  }
  
  return {
    role,
    year: parseInt(year),
    sequential: parseInt(sequential),
    randomSuffix: parseInt(randomSuffix),
    prefix
  };
}

/**
 * Valida se o código de estudante está no formato correto
 */
export function validateStudentCode(studentCode: string): boolean {
  return /^RA(ES|PRO|IN)\d{10}$/.test(studentCode);
}
