/**
 * Utilitário centralizado para construção e validação de URLs de imagem
 * Resolve inconsistências entre diferentes partes do sistema
 */

export class ImageUrlBuilder {
  /**
   * Constrói URL completa para imagem baseada no caminho fornecido
   * @param imagePath - Caminho da imagem (relativo ou absoluto)
   * @returns URL completa ou undefined se imagePath for inválido
   */
  static buildImageUrl(imagePath: string | undefined | null): string | undefined {
    if (!imagePath) return undefined;
    
    // Se já é uma URL completa, retorna como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Se é um caminho relativo, constrói URL completa
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3001';
    
    // Remove barra dupla se necessário
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    return `${cleanBaseUrl}${cleanPath}`;
  }
  
  /**
   * Valida se uma URL ou caminho de imagem é válido
   * @param url - URL ou caminho a ser validado
   * @returns true se válido, false caso contrário
   */
  static validateImageUrl(url: string): boolean {
    if (!url) return false;
    
    try {
      // Tenta criar URL para URLs completas
      new URL(url);
      return true;
    } catch {
      // Para caminhos relativos, verifica se é um caminho de upload válido
      return url.startsWith('/uploads/') || 
             url.startsWith('uploads/') ||
             url.startsWith('./uploads/') ||
             url.includes('/uploads/courses/');
    }
  }
  
  /**
   * Obtém URL de fallback padrão para quando imagem não carrega
   * @returns URL de imagem padrão
   */
  static getDefaultFallbackUrl(): string {
    return 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg';
  }
  
  /**
   * Normaliza caminho de upload retornado pelo backend
   * @param uploadPath - Caminho retornado pelo endpoint de upload
   * @returns Caminho normalizado
   */
  static normalizeUploadPath(uploadPath: string): string {
    if (!uploadPath) return '';
    
    // Se já está normalizado, retorna como está
    if (uploadPath.startsWith('/uploads/')) {
      return uploadPath;
    }
    
    // Remove prefixos desnecessários e adiciona /uploads/ se necessário
    let cleanPath = uploadPath;
    if (cleanPath.startsWith('./')) {
      cleanPath = cleanPath.substring(2);
    }
    if (cleanPath.startsWith('uploads/')) {
      cleanPath = `/${cleanPath}`;
    }
    if (!cleanPath.startsWith('/uploads/')) {
      cleanPath = `/uploads/${cleanPath}`;
    }
    
    return cleanPath;
  }
}

/**
 * Hook personalizado para gerenciar URLs de imagem
 */
export function useImageUrl(imagePath: string | undefined | null) {
  const imageUrl = ImageUrlBuilder.buildImageUrl(imagePath);
  const fallbackUrl = ImageUrlBuilder.getDefaultFallbackUrl();
  
  return {
    imageUrl,
    fallbackUrl,
    isValidUrl: imagePath ? ImageUrlBuilder.validateImageUrl(imagePath) : false
  };
}