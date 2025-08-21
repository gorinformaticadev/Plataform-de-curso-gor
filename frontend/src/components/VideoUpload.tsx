import React, { useCallback, useState } from 'react';
import { Upload, X, Video, AlertCircle, CheckCircle } from 'lucide-react';
import { validateVideoFile, ValidationResult } from '../utils/validation';

interface VideoUploadProps {
  onVideoUpload: (file: File) => void;
  currentVideoUrl?: string;
  disabled?: boolean;
}

interface UploadState {
  isDragging: boolean;
  isUploading: boolean;
  validationResult: ValidationResult | null;
  fileInfo: {
    name: string;
    size: string;
    duration?: number;
  } | null;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  onVideoUpload,
  currentVideoUrl,
  disabled = false
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isDragging: false,
    isUploading: false,
    validationResult: null,
    fileInfo: null
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setUploadState(prev => ({ ...prev, isDragging: true }));
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;

    setUploadState(prev => ({ ...prev, isDragging: false }));
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      await processFile(videoFile);
    }
  }, [disabled]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, []);

  const processFile = async (file: File) => {
    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      validationResult: null,
      fileInfo: null
    }));

    try {
      // Valida o arquivo
      const validation = await validateVideoFile(file);
      
      if (validation.isValid) {
        // Obtém informações do vídeo
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        const duration = await new Promise<number>((resolve) => {
          video.onloadedmetadata = () => {
            resolve(video.duration);
          };
          video.src = URL.createObjectURL(file);
        });

        setUploadState(prev => ({
          ...prev,
          fileInfo: {
            name: file.name,
            size: formatFileSize(file.size),
            duration
          },
          validationResult: { isValid: true }
        }));

        // Chama o callback com o arquivo válido
        onVideoUpload(file);
      } else {
        setUploadState(prev => ({
          ...prev,
          validationResult: validation
        }));
      }
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        validationResult: {
          isValid: false,
          error: 'Erro ao processar o arquivo. Tente novamente.'
        }
      }));
    } finally {
      setUploadState(prev => ({
        ...prev,
        isUploading: false
      }));
    }
  };

  const clearFile = () => {
    setUploadState({
      isDragging: false,
      isUploading: false,
      validationResult: null,
      fileInfo: null
    });
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${uploadState.isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${uploadState.validationResult?.isValid === true ? 'border-green-500 bg-green-50' : ''}
          ${uploadState.validationResult?.isValid === false ? 'border-red-500 bg-red-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          disabled={disabled || uploadState.isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          {uploadState.isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Processando vídeo...</p>
            </div>
          ) : uploadState.fileInfo ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="mt-2 text-sm font-medium text-green-600">
                Vídeo selecionado com sucesso!
              </p>
              <div className="mt-2 text-xs text-gray-600">
                <p><strong>Nome:</strong> {uploadState.fileInfo.name}</p>
                <p><strong>Tamanho:</strong> {uploadState.fileInfo.size}</p>
                {uploadState.fileInfo.duration && (
                  <p><strong>Duração:</strong> {formatDuration(uploadState.fileInfo.duration)}</p>
                )}
              </div>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Arraste seu vídeo aqui ou <span className="text-blue-600 font-medium">clique para selecionar</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Formatos: MP4, MPEG, MOV, AVI, WEBM, 3GP, MKV • Máx: 100MB • Máx: 60 min
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {uploadState.validationResult?.error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{uploadState.validationResult.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Video */}
      {currentVideoUrl && !uploadState.fileInfo && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Video className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Vídeo atual</span>
            </div>
            <a
              href={currentVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Ver vídeo
            </a>
          </div>
        </div>
      )}

      {/* Clear Button */}
      {uploadState.fileInfo && (
        <button
          type="button"
          onClick={clearFile}
          disabled={disabled}
          className="mt-2 flex items-center text-sm text-red-600 hover:text-red-800"
        >
          <X className="h-4 w-4 mr-1" />
          Remover vídeo
        </button>
      )}
    </div>
  );
};

export default VideoUpload;
