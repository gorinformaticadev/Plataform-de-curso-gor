/**
 * Utilitário para construção de URLs de imagem no backend
 * Deve ser usado para manter consistência com o frontend
 */

export class ImageUrlUtil {
  /**
   * Constrói URL absoluta a partir de um caminho relativo do upload
   * @param relativePath - Caminho relativo retornado pelo multer
   * @returns URL absoluta ou null se input inválido
   */
  static buildAbsoluteUrl(relativePath: string | undefined | null): string | null {
    if (!relativePath) return null;

    // Se já é uma URL completa, retorna como está
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }

    // Se é um caminho relativo, constrói URL completa
    const baseUrl = process.env.BACKEND_BASE_URL || 'http://localhost:3001';
    const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    return `${cleanBaseUrl}${cleanPath}`;
  }

  /**
   * Normaliza caminho de upload para garantir formato padrão
   * @param uploadPath - Caminho do arquivo salvo
   * @returns Caminho normalizado começando com /uploads/
   */
  static normalizeUploadPath(uploadPath: string): string {
    if (!uploadPath) return '';

    // Se já está no formato correto, retorna como está
    if (uploadPath.startsWith('/uploads/')) {
      return uploadPath;
    }

    // Remove prefixos desnecessários
    let cleanPath = uploadPath;
    if (cleanPath.startsWith('./')) {
      cleanPath = cleanPath.substring(2);
    }
    if (cleanPath.startsWith('public/')) {
      cleanPath = cleanPath.substring(7);
    }
    if (cleanPath.startsWith('uploads/')) {
      cleanPath = `/${cleanPath}`;
    }
    if (!cleanPath.startsWith('/uploads/')) {
      cleanPath = `/uploads/${cleanPath}`;
    }

    return cleanPath;
  }

  /**
   * Valida se um caminho de upload é válido
   * @param path - Caminho a ser validado
   * @returns true se válido, false caso contrário
   */
  static isValidUploadPath(path: string): boolean {
    if (!path) return false;

    // Verifica se é um caminho de upload válido
    return path.startsWith('/uploads/') || 
           path.startsWith('uploads/') ||
           path.startsWith('./uploads/') ||
           path.includes('/uploads/courses/') ||
           path.includes('/uploads/lessons/');
  }
}