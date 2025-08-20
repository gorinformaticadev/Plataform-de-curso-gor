// Funções utilitárias para gerenciamento de categorias

/**
 * Gera um slug único baseado no nome da categoria
 * @param name - Nome da categoria
 * @param existingSlugs - Lista de slugs existentes para verificar duplicatas
 * @returns Slug único
 */
export function generateSlug(name: string, existingSlugs: string[] = []): string {
  // Remove acentos e caracteres especiais
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let slug = normalized || 'categoria';
  
  // Verifica se já existe e adiciona sufixo numérico se necessário
  let counter = 1;
  let uniqueSlug = slug;
  
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
}

/**
 * Valida se um slug é único
 * @param slug - Slug a ser validado
 * @param existingSlugs - Lista de slugs existentes
 * @param excludeId - ID da categoria a ser ignorado (para edição)
 * @returns true se o slug é único
 */
export function isSlugUnique(slug: string, existingSlugs: string[], excludeId?: string): boolean {
