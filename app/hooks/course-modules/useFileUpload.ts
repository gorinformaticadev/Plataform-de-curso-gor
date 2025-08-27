import { useState, useCallback, useRef } from 'react';

export interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

interface UseFileUploadProps {
  maxFileSize?: number; // em bytes
  allowedTypes?: string[];
  maxFiles?: number;
  uploadEndpoint?: string;
  onUploadComplete?: (files: FileUploadProgress[]) => void;
  onUploadError?: (error: string, file: File) => void;
}

interface UseFileUploadReturn {
  files: FileUploadProgress[];
  isUploading: boolean;
  uploadFile: (file: File) => Promise<string>;
  uploadFiles: (files: File[]) => Promise<string[]>;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  openFileDialog: () => void;
  getFileInputProps: () => {
    ref: React.RefObject<HTMLInputElement | null>;
    type: string;
    multiple: boolean;
    accept: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    style: { display: string };
  };
}

/**
 * Hook customizado para upload de arquivos com progress e validação
 * @param props - Configurações do upload
 * @returns Objeto com métodos e estados do upload
 */
export function useFileUpload({
  maxFileSize = 10 * 1024 * 1024, // 10MB por padrão
  allowedTypes = ['image/*', 'video/*', 'application/pdf'],
  maxFiles = 5,
  uploadEndpoint = '/api/upload',
  onUploadComplete,
  onUploadError
}: UseFileUploadProps = {}): UseFileUploadReturn {
  const [files, setFiles] = useState<FileUploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Valida um arquivo antes do upload
   */
  const validateFile = useCallback((file: File): string | null => {
    // Verifica tamanho
    if (file.size > maxFileSize) {
      return `Arquivo muito grande. Máximo permitido: ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`;
    }

    // Verifica tipo
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`;
    }

    // Verifica limite de arquivos
    if (files.length >= maxFiles) {
      return `Máximo de ${maxFiles} arquivos permitidos`;
    }

    return null;
  }, [maxFileSize, allowedTypes, maxFiles, files.length]);

  /**
   * Simula o upload de um arquivo (substitua pela implementação real)
   */
  const simulateUpload = useCallback(async (
    file: File,
    onProgress: (progress: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          // Simula URL do arquivo após upload
          const fileUrl = URL.createObjectURL(file);
          resolve(fileUrl);
        }
        onProgress(progress);
      }, 200);

      // Simula erro ocasional (5% de chance)
      if (Math.random() < 0.05) {
        setTimeout(() => {
          clearInterval(interval);
          reject(new Error('Erro simulado no upload'));
        }, 1000);
      }
    });
  }, []);

  /**
   * Faz upload de um único arquivo
   */
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const validationError = validateFile(file);
    if (validationError) {
      onUploadError?.(validationError, file);
      throw new Error(validationError);
    }

    const fileId = crypto.randomUUID();
    const fileProgress: FileUploadProgress = {
      file,
      progress: 0,
      status: 'pending'
    };

    // Adiciona arquivo à lista
    setFiles(prev => [...prev, { ...fileProgress, file: { ...file, id: fileId } as File }]);
    setIsUploading(true);

    try {
      // Atualiza status para uploading
      setFiles(prev => prev.map(f => 
        f.file.name === file.name && f.file.size === file.size
          ? { ...f, status: 'uploading' as const }
          : f
      ));

      // Executa upload com callback de progresso
      const url = await simulateUpload(file, (progress) => {
        setFiles(prev => prev.map(f => 
          f.file.name === file.name && f.file.size === file.size
            ? { ...f, progress }
            : f
        ));
      });

      // Atualiza status para completed
      setFiles(prev => prev.map(f => 
        f.file.name === file.name && f.file.size === file.size
          ? { ...f, status: 'completed' as const, url, progress: 100 }
          : f
      ));

      return url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no upload';
      
      // Atualiza status para error
      setFiles(prev => prev.map(f => 
        f.file.name === file.name && f.file.size === file.size
          ? { ...f, status: 'error' as const, error: errorMessage }
          : f
      ));

      onUploadError?.(errorMessage, file);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [validateFile, simulateUpload, onUploadError]);

  /**
   * Faz upload de múltiplos arquivos
   */
  const uploadFiles = useCallback(async (filesToUpload: File[]): Promise<string[]> => {
    setIsUploading(true);
    const urls: string[] = [];

    try {
      for (const file of filesToUpload) {
        const url = await uploadFile(file);
        urls.push(url);
      }

      onUploadComplete?.(files.filter(f => f.status === 'completed'));
      return urls;
    } finally {
      setIsUploading(false);
    }
  }, [uploadFile, files, onUploadComplete]);

  /**
   * Remove um arquivo da lista
   */
  const removeFile = useCallback((fileName: string) => {
    setFiles(prev => prev.filter(f => f.file.name !== fileName));
  }, []);

  /**
   * Limpa todos os arquivos
   */
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  /**
   * Abre o dialog de seleção de arquivos
   */
  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Manipula a seleção de arquivos via input
   */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      uploadFiles(selectedFiles);
    }
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  }, [uploadFiles]);

  /**
   * Retorna props para o input de arquivo
   */
  const getFileInputProps = useCallback(() => ({
    ref: fileInputRef,
    type: 'file' as const,
    multiple: maxFiles > 1,
    accept: allowedTypes.join(','),
    onChange: handleFileSelect,
    style: { display: 'none' }
  }), [maxFiles, allowedTypes, handleFileSelect]);

  return {
    files,
    isUploading,
    uploadFile,
    uploadFiles,
    removeFile,
    clearFiles,
    openFileDialog,
    getFileInputProps
  };
}

/**
 * Hook simplificado para upload de uma única imagem
 */
export function useImageUpload(onUploadComplete?: (url: string) => void) {
  const { uploadFile, files, isUploading, openFileDialog, getFileInputProps } = useFileUpload({
    maxFiles: 1,
    allowedTypes: ['image/*'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    onUploadComplete: (files) => {
      const completedFile = files.find(f => f.status === 'completed');
      if (completedFile?.url) {
        onUploadComplete?.(completedFile.url);
      }
    }
  });

  const currentFile = files[0];

  return {
    file: currentFile,
    isUploading,
    uploadImage: uploadFile,
    openImageDialog: openFileDialog,
    getImageInputProps: getFileInputProps,
    imageUrl: currentFile?.url,
    progress: currentFile?.progress || 0,
    error: currentFile?.error
  };
}
