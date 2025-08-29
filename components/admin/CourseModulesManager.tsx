"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { toast } from "sonner";
import { 
  Plus, 
  GripVertical, 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Play, 
  FileText, 
  HelpCircle,
  Video,
  FileVideo,
  File,
  MoreVertical,
  BookOpen
} from "lucide-react";
import axios from "axios";

interface Lesson {
  id?: string;
  title: string;
  description?: string;
  order: number;
  contents: {
    id?: string;
    type: "VIDEO" | "TEXT" | "QUIZ";
    videoUrl?: string;
    duration?: number;
    content?: string;
    quizData?: any;
    videoMethod?: "link" | "upload"; // Adicionado para rastrear o método de upload
    thumbnailUrl?: string; // Adicionado para a URL da thumbnail
  }[];
}

interface Module {
  id?: string;
  title: string;
  description: string;
  order: number;
  contents: Lesson[];
  isExpanded?: boolean;
}

interface CourseModulesManagerProps {
  modules: Module[];
  onModulesChange: (modules: Module[]) => void;
  token: string;
  courseId: string;
}

export default function CourseModulesManager({ 
  modules, 
  onModulesChange, 
  token, 
  courseId 
}: CourseModulesManagerProps) {
  const [draggedItem, setDraggedItem] = useState<{ type: 'module' | 'lesson'; moduleId: number; lessonId?: number } | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [isAddModuleDialogOpen, setIsAddModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<{ module: Module; index: number } | null>(null);
  const [editedModuleTitle, setEditedModuleTitle] = useState("");
  const [editedModuleDescription, setEditedModuleDescription] = useState("");
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [selectedLessonTypes, setSelectedLessonTypes] = useState<string[]>([]);
  const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ moduleId: number; lesson: Lesson; lessonIndex: number } | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState<string>("");
  const [newLessonDescription, setNewLessonDescription] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [textContent, setTextContent] = useState<string>("");
  const [videoUploadMethod, setVideoUploadMethod] = useState<"link" | "upload">("link");

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, type: 'module' | 'lesson', moduleId: number, lessonId?: number) => {
    setDraggedItem({ type, moduleId, lessonId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.innerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Função para obter estilos visuais durante drag
  const getDragStyles = (isDragging: boolean) => ({
    opacity: isDragging ? 0.5 : 1,
    cursor: isReordering ? 'wait' : (isDragging ? 'grabbing' : 'grab'),
    pointerEvents: isReordering ? 'none' : 'auto',
    transform: isDragging ? 'rotate(2deg)' : 'none',
    transition: 'all 0.2s ease-in-out'
  });

  const handleDrop = async (e: React.DragEvent, targetModuleId: number, targetLessonId?: number) => {
    e.preventDefault();
    
    if (!draggedItem || isReordering) return;

    const newModules = [...modules];
    
    if (draggedItem.type === 'module' && targetLessonId === undefined) {
      // Verificar se houve mudança de posição
      if (draggedItem.moduleId === targetModuleId) {
        setDraggedItem(null);
        return; // Não houve mudança de posição
      }

      setIsReordering(true);
      
      // Reordering modules
      const [draggedModule] = newModules.splice(draggedItem.moduleId, 1);
      newModules.splice(targetModuleId, 0, draggedModule);
      
      // Atualizar ordens sequencialmente
      const reorderedModules = newModules.map((module, index) => ({
        ...module,
        order: index,
      }));

      // Atualização otimística do estado local
      onModulesChange(reorderedModules);

      try {
        // Chamar novo endpoint de reordenação atômica
        const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/modules/reorder`,
          {
            modules: reorderedModules.map(({ id, order }) => ({ id, order }))
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Atualizar com dados do servidor se necessário
          if (response.data.modules) {
            onModulesChange(response.data.modules);
          }
          
          toast.success("Ordem dos módulos atualizada com sucesso!", {
            duration: 2000,
            style: {
              background: '#10B981',
              color: 'white',
            },
          });
        }
      } catch (error) {
        // Em caso de erro, reverter para o estado anterior
        onModulesChange(modules);
        
        console.error('Erro na reordenação:', error);
        
        // Feedback específico baseado no tipo de erro
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const message = error.response?.data?.message;
          
          if (status === 403) {
            toast.error('Você não tem permissão para reordenar estes módulos', {
              duration: 4000,
            });
          } else if (status === 404) {
            toast.error('Módulo não encontrado. Recarregue a página.', {
              duration: 4000,
            });
          } else if (status === 400) {
            toast.error(message || 'Dados inválidos para reordenação', {
              duration: 4000,
            });
          } else {
            toast.error('Erro ao salvar a nova ordem. Tente novamente.', {
              duration: 3000,
            });
          }
        } else {
          toast.error('Erro ao salvar a nova ordem. Tente novamente.', {
            duration: 3000,
          });
        }
      } finally {
        setIsReordering(false);
      }

    } else if (draggedItem.type === 'lesson' && draggedItem.lessonId !== undefined && targetLessonId !== undefined) {
      // Reordering lessons within the same module
      if (draggedItem.moduleId === targetModuleId) {
        const sourceModule = newModules[draggedItem.moduleId];
        const [draggedLesson] = sourceModule.contents.splice(draggedItem.lessonId, 1);
        sourceModule.contents.splice(targetLessonId, 0, draggedLesson);
        
        // Update order
        sourceModule.contents.forEach((lesson, index) => {
          lesson.order = index + 1;
        });

        // Persistir a nova ordem das lições no backend
        const lessonOrderUpdates = sourceModule.contents.map((lesson: any) => ({
          id: lesson.id,
          order: lesson.order
        }));

        try {
          await axios.patch(
            `${process.env.NEXT_PUBLIC_API_URL}/lessons/reorder`,
            { lessons: lessonOrderUpdates },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          toast.success("Ordem das aulas atualizada com sucesso!", {
            duration: 2000,
          });
        } catch (error) {
          console.error("Erro ao atualizar a ordem das aulas:", error);
          toast.error("Erro ao atualizar a ordem das aulas. Tente novamente.");
          // Reverter a mudança no estado local em caso de erro
          onModulesChange(modules);
        }
      }
    }
    
    setDraggedItem(null);
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) {
      toast.error("Por favor, digite um nome para o módulo");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/modules`,
        {
          title: newModuleTitle,
          description: "",
          courseId: courseId,
          order: modules.length + 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newModule = response.data;
      onModulesChange([...modules, newModule]);
      setNewModuleTitle("");
      toast.success("Módulo adicionado com sucesso!");
      setIsAddModuleDialogOpen(false); // Close dialog on success
    } catch (error) {
      console.error("Erro ao adicionar módulo:", error);
      toast.error("Erro ao adicionar módulo. Tente novamente.");
    }
  };

  const handleEditModule = (module: Module, index: number) => {
    setEditingModule({ module, index });
    setEditedModuleTitle(module.title);
    setEditedModuleDescription(module.description);
  };

  const handleSaveModule = async () => {
    if (!editingModule || !editingModule.module.id) {
      toast.error("Erro: Módulo não encontrado para edição.");
      return;
    }

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/modules/${editingModule.module.id}`,
        {
          title: editedModuleTitle,
          description: editedModuleDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedModule = response.data;
      const newModules = [...modules];
      newModules[editingModule.index] = {
        ...newModules[editingModule.index],
        title: updatedModule.title,
        description: updatedModule.description,
      };
      
      onModulesChange(newModules);
      setEditingModule(null);
      toast.success("Módulo atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar módulo:", error);
      toast.error("Erro ao atualizar módulo. Tente novamente.");
    }
  };

  const handleDeleteModule = async (index: number) => {
    const moduleToDelete = modules[index];
    if (!moduleToDelete || !moduleToDelete.id) {
      toast.error("Erro: Módulo não encontrado para exclusão.");
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/modules/${moduleToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newModules = modules.filter((_, i) => i !== index);
      // Update order
      newModules.forEach((module, i) => {
        module.order = i + 1;
      });
      onModulesChange(newModules);
      toast.success("Módulo excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir módulo:", error);
      toast.error("Erro ao excluir módulo. Tente novamente.");
    }
  };

  const toggleModuleExpansion = (index: number) => {
    const newModules = [...modules];
    newModules[index] = {
      ...newModules[index],
      isExpanded: !newModules[index].isExpanded
    };
    onModulesChange(newModules);
  };

  const handleOpenLessonDialog = (
    mode: 'add' | 'edit',
    moduleId: number,
    lessonIndex?: number
  ) => {
    setCurrentModuleId(moduleId);

    if (mode === 'edit' && lessonIndex !== undefined) {
      const lesson = modules[moduleId].contents[lessonIndex];
      setEditingLesson({ moduleId, lesson, lessonIndex });
      setNewLessonTitle(lesson.title);
      setNewLessonDescription(lesson.description || "");

      // Correção: Verificar se lesson.contents existe antes de usar .map
      const contents = lesson.contents || []; // Default para array vazio se undefined
      const types = contents.map(c => c.type);
      setSelectedLessonTypes(types);

      const videoContent = contents.find(c => c.type === 'VIDEO');
      if (videoContent) {
        setVideoUrl(videoContent.videoUrl || "");
        setVideoUploadMethod(videoContent.videoMethod || "link"); // Define o método de upload
        setThumbnailPreview(videoContent.thumbnailUrl || ""); // Carrega a URL da thumbnail
      } else {
        setVideoUrl("");
        setVideoUploadMethod("link");
        setThumbnailPreview("");
      }

      const textContentData = contents.find(c => c.type === 'TEXT');
      if (textContentData) {
        setTextContent(textContentData.content || "");
      } else {
        setTextContent("");
      }
      // Resetar outros campos
      setVideoFile(null);
      setThumbnailFile(null);
      setThumbnailPreview("");
      setVideoUploadMethod("link");

    } else {
      setEditingLesson(null);
      setNewLessonTitle("Nova Aula");
      setNewLessonDescription("");
      setSelectedLessonTypes([]);
      setVideoUrl("");
      setVideoFile(null);
      setThumbnailFile(null);
      setThumbnailPreview("");
      setVideoUploadMethod("link");
      setTextContent("");
    }

    setIsLessonDialogOpen(true);
  };

  const handleLessonTypeChange = (type: string) => {
    setSelectedLessonTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleCreateLesson = async () => {
    if (currentModuleId === null || modules[currentModuleId] === undefined) {
      toast.error("Módulo não encontrado.");
      return;
    }

    const module = modules[currentModuleId];
    if (!module.id) {
      toast.error("Salve o módulo antes de adicionar aulas.");
      return;
    }

    if (selectedLessonTypes.length === 0) {
      toast.error("Selecione pelo menos um tipo de aula.");
      return;
    }

    // Preparar dados para upload de arquivos, se necessário
    let formData = null;
    let videoFileName = "";
    let thumbnailFileName = "";
    
    // Inicializar as variáveis de URL fora do bloco if para que estejam disponíveis em todo o escopo
    let videoUrlForContent = videoUrl;
    let thumbnailUrlForContent = thumbnailPreview;
    
    // Se estiver usando upload de vídeo ou imagem, criar FormData
    if ((videoUploadMethod === 'upload' && videoFile) || thumbnailFile) {
      formData = new FormData();
      
      if (videoUploadMethod === 'upload' && videoFile) {
        videoFileName = `video_${Date.now()}_${videoFile.name}`;
        formData.append('video', videoFile, videoFileName);
        
        // Em produção, isso seria substituído pelo upload real e URL do servidor
        videoUrlForContent = URL.createObjectURL(videoFile);
        // Nota: Esta URL só é válida durante a sessão atual do navegador
      }
      
      if (thumbnailFile) {
        thumbnailFileName = `thumbnail_${Date.now()}_${thumbnailFile.name}`;
        formData.append('thumbnail', thumbnailFile, thumbnailFileName);
        
        // Em produção, isso seria substituído pelo upload real e URL do servidor
        thumbnailUrlForContent = URL.createObjectURL(thumbnailFile);
        // Nota: Esta URL só é válida durante a sessão atual do navegador
      }
      
      // Temporariamente, vamos pular o upload real dos arquivos e usar URLs locais para teste
      // Em um ambiente de produção, você precisaria implementar o upload real
      
      // Nota: Em um ambiente real, você faria o upload dos arquivos para o servidor
      // e usaria as URLs retornadas pelo servidor
    }
    
    // Criar o conteúdo baseado nos tipos selecionados
    const contentData = {
      type: "doc",
      content: selectedLessonTypes.map(type => ({
        type: type,
        ...(type === "VIDEO" ? { 
          videoUrl: videoUrlForContent,
          thumbnailUrl: thumbnailUrlForContent || null,
          videoMethod: videoUploadMethod
        } : {}),
        ...(type === "TEXT" ? { content: textContent } : {}),
        ...(type === "QUIZ" ? { quizData: {} } : {})
      }))
    };

    const newLessonData = {
      title: newLessonTitle,
      description: newLessonDescription,
      order: (module.contents?.length || 0) + 1,
      moduleId: module.id,
      content: contentData
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/lessons`,
        newLessonData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newLesson = response.data;
      const newModules = [...modules];
      // Garantir que contents existe antes de fazer push
      if (!newModules[currentModuleId].contents) {
        newModules[currentModuleId].contents = [];
      }
      newModules[currentModuleId].contents.push(newLesson);
      onModulesChange(newModules);

      toast.success("Aula criada com sucesso!");
      setIsLessonDialogOpen(false);
      setSelectedLessonTypes([]);
      setCurrentModuleId(null);
      // Limpar os campos do formulário
      setNewLessonTitle("Nova Aula");
      setNewLessonDescription("");
      setVideoUrl("");
      setVideoFile(null);
      setThumbnailFile(null);
      setThumbnailPreview("");
      setVideoUploadMethod("link");
      setTextContent("");
    } catch (error) {
      console.error("Erro ao criar aula:", error);
      toast.error("Erro ao criar aula. Tente novamente.");
    }
  };

  const handleDeleteLesson = async (moduleId: number, lessonIndex: number) => {
    const lessonToDelete = modules[moduleId].contents[lessonIndex];
    if (!lessonToDelete || !lessonToDelete.id) {
      toast.error("Erro: Aula não encontrada para exclusão.");
      return;
    }

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newModules = [...modules];
      newModules[moduleId].contents.splice(lessonIndex, 1);
      
      // Update order
      newModules[moduleId].contents.forEach((lesson, index) => {
        lesson.order = index + 1;
      });

      onModulesChange(newModules);
      toast.success("Aula excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
      toast.error("Erro ao excluir aula. Tente novamente.");
    }
  };

  const handleSaveLesson = async () => {
    if (!editingLesson) return;

    const { moduleId, lesson, lessonIndex } = editingLesson;

    const contentData = {
      type: "doc",
      content: selectedLessonTypes.map(type => ({
        type: type,
        ...(type === "VIDEO" ? {
          videoUrl: videoUrl,
          thumbnailUrl: thumbnailPreview || null,
          videoMethod: videoUploadMethod,
        } : {}),
        ...(type === "TEXT" ? { content: textContent } : {}),
        ...(type === "QUIZ" ? { quizData: {} } : {})
      }))
    };

    const updatedLessonData = {
      title: newLessonTitle,
      description: newLessonDescription,
      content: contentData,
    };

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/lessons/${lesson.id}`,
        updatedLessonData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedLesson = response.data;
      const newModules = [...modules];
      
      // A resposta do patch agora inclui o conteúdo, então podemos usá-la diretamente
      newModules[moduleId].contents[lessonIndex] = {
        ...newModules[moduleId].contents[lessonIndex],
        title: updatedLesson.title,
        description: updatedLesson.description,
        contents: updatedLesson.content.content, // Atualiza o conteúdo da aula
      };

      onModulesChange(newModules);
      setEditingLesson(null);
      setIsLessonDialogOpen(false);
      toast.success("Aula atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar aula:", error);
      toast.error("Erro ao atualizar aula. Tente novamente.");
    }
  };

  const handleLessonFormSubmit = () => {
    if (editingLesson) {
      handleSaveLesson();
    } else {
      handleCreateLesson();
    }
  };

  function getLessonIcon(lesson: Lesson) {
    // Verificar se lesson.contents existe e não está vazio
    if (!lesson.contents || lesson.contents.length === 0) {
      return <Play className="h-4 w-4" />;
    }
    
    // Verificar se o primeiro elemento existe antes de acessar .type
    const firstContent = lesson.contents[0];
    if (!firstContent) {
       return <Play className="h-4 w-4" />; // Ícone padrão se o primeiro elemento não existir
    }
    
    switch (firstContent.type) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'TEXT':
        return <FileText className="h-4 w-4" />;
      case 'QUIZ':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  }

  function getLessonTypeLabel(lesson: Lesson) {
    // Verificar se lesson.contents existe e não está vazio
    if (!lesson.contents || lesson.contents.length === 0) {
      return 'Aula';
    }
    
    // Verificar se o primeiro elemento existe antes de acessar .type
    const firstContent = lesson.contents[0];
    if (!firstContent) {
       return 'Aula'; // Label padrão se o primeiro elemento não existir
    }
    
    switch (firstContent.type) {
      case 'VIDEO':
        return 'Vídeo';
      case 'TEXT':
        return 'Texto';
      case 'QUIZ':
        return 'Questionário';
      default:
        return 'Aula';
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Module Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Módulos do Curso</h3>
          {isReordering && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Salvando ordem...</span>
            </div>
          )}
        </div>
        <Dialog open={isAddModuleDialogOpen} onOpenChange={setIsAddModuleDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddModuleDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Módulo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Módulo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Módulo</label>
                <Input
                  placeholder="Digite o nome do módulo"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setNewModuleTitle("");
                  setIsAddModuleDialogOpen(false);
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleAddModule}>
                  Adicionar Módulo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modules List */}
      <div className="space-y-3">
        {modules.map((module, moduleIndex) => (
          <Collapsible
            key={moduleIndex}
            open={module.isExpanded ?? false}
            onOpenChange={() => toggleModuleExpansion(moduleIndex)}
            className="border-2 hover:border-gray-300 transition-colors rounded-md"
          >
            <Card>
              <CardHeader
                className={`pb-3 transition-all duration-200 ${
                  isReordering ? 'pointer-events-none' : 'cursor-move hover:bg-gray-50'
                }`}
                style={getDragStyles(draggedItem?.type === 'module' && draggedItem?.moduleId === moduleIndex)}
                draggable={!isReordering}
                onDragStart={(e) => !isReordering && handleDragStart(e, 'module', moduleIndex)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, moduleIndex)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        {module.isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <div>
                      <CardTitle className="text-base">{module.title}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {module.contents?.length || 0} aula{(module.contents?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Módulo {module.order}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditModule(module, moduleIndex);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Módulo</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o módulo "{module.title}"?
                            Esta ação também excluirá todas as aulas deste módulo.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteModule(moduleIndex)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {/* Module Description */}
                  {module.description && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                  )}

                  {/* Add Lesson Button */}
                  <div className="mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenLessonDialog('add', moduleIndex)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Aula
                    </Button>
                  </div>

                  {/* Lessons List */}
                  {(module.contents?.length || 0) > 0 && (
                    <div className="space-y-2">
                      {(module.contents || []).map((lesson, lessonIndex) => (
                        <div
                          key={lessonIndex}
                          className={`flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 transition-all duration-200 ${
                            isReordering ? 'pointer-events-none' : 'hover:bg-gray-100'
                          }`}
                          style={getDragStyles(draggedItem?.type === 'lesson' && draggedItem?.moduleId === moduleIndex && draggedItem?.lessonId === lessonIndex)}
                          draggable={!isReordering}
                          onDragStart={(e) => !isReordering && handleDragStart(e, 'lesson', moduleIndex, lessonIndex)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, moduleIndex, lessonIndex)}
                        >
                          <div className="flex items-center space-x-3">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            {getLessonIcon(lesson)}
                            <div>
                              <p className="font-medium text-sm">{lesson.title}</p>
                              <p className="text-xs text-gray-500">
                                {getLessonTypeLabel(lesson)} • Aula {lesson.order}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenLessonDialog('edit', moduleIndex, lessonIndex)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Aula</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir a aula "{lesson.title}"?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteLesson(moduleIndex, lessonIndex)}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(module.contents?.length || 0) === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Play className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Nenhuma aula neste módulo</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleOpenLessonDialog('add', moduleIndex)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar primeira aula
                      </Button>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {modules.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum módulo ainda
            </h3>
            <p className="text-gray-500 mb-4">
              Comece adicionando o primeiro módulo do seu curso
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Módulo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Módulo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome do Módulo</label>
                    <Input
                      placeholder="Digite o nome do módulo"
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setNewModuleTitle("")}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddModule}>
                      Adicionar Módulo
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Edit Module Dialog */}
      <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Módulo</DialogTitle>
          </DialogHeader>
          {editingModule && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Módulo</label>
                <Input
                  value={editedModuleTitle}
                  onChange={(e) => setEditedModuleTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição do Módulo</label>
                <div className="mt-1">
                  <TiptapEditor
                    value={editedModuleDescription}
                    onChange={setEditedModuleDescription}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingModule(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveModule}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Editar Aula' : 'Adicionar Nova Aula'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título da Aula</label>
              <Input
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                placeholder="Digite o título da aula"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Descrição da Aula</label>
              <Input
                value={newLessonDescription}
                onChange={(e) => setNewLessonDescription(e.target.value)}
                placeholder="Digite uma breve descrição da aula"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Tipo de Aula</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button
                  variant={selectedLessonTypes.includes('VIDEO') ? 'default' : 'outline'}
                  onClick={() => handleLessonTypeChange('VIDEO')}
                >
                  Vídeo
                </Button>
                <Button
                  variant={selectedLessonTypes.includes('TEXT') ? 'default' : 'outline'}
                  onClick={() => handleLessonTypeChange('TEXT')}
                >
                  Texto
                </Button>
                <Button
                  variant={selectedLessonTypes.includes('QUIZ') ? 'default' : 'outline'}
                  onClick={() => handleLessonTypeChange('QUIZ')}
                >
                  Quiz
                </Button>
              </div>
            </div>

            {selectedLessonTypes.includes('VIDEO') && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Método de Adição de Vídeo</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      variant={videoUploadMethod === 'link' ? 'default' : 'outline'}
                      onClick={() => setVideoUploadMethod('link')}
                      type="button"
                    >
                      Link Externo
                    </Button>
                    <Button
                      variant={videoUploadMethod === 'upload' ? 'default' : 'outline'}
                      onClick={() => setVideoUploadMethod('upload')}
                      type="button"
                    >
                      Upload de Arquivo
                    </Button>
                  </div>
                </div>
                
                {videoUploadMethod === 'link' && (
                  <div>
                    <label className="text-sm font-medium">URL do Vídeo</label>
                    <Input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Cole aqui o link do vídeo (YouTube, Vimeo, etc.)"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Suporta links do YouTube, Vimeo e outros serviços de vídeo.
                    </p>
                    
                    {videoUrl && (
                      <div className="mt-3">
                        <label className="text-sm font-medium">Pré-visualização</label>
                        <div className="mt-2 border rounded-md overflow-hidden aspect-video">
                          {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                            <iframe 
                              src={
                                videoUrl.includes('youtube.com') 
                                  ? videoUrl.replace('watch?v=', 'embed/').split('&')[0] // Corrigido: Pegar o primeiro elemento do array
                                  : videoUrl.includes('youtu.be')
                                    ? videoUrl.replace('youtu.be/', 'youtube.com/embed/')
                                    : videoUrl
                              }
                              className="w-full h-full"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              referrerPolicy="strict-origin-when-cross-origin"
                              title="YouTube video player"
                              frameBorder="0"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gray-100">
                              <p className="text-sm text-gray-500">Preview não disponível para este link</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {videoUploadMethod === 'upload' && (
                  <div>
                    <label className="text-sm font-medium">Upload de Vídeo</label>
                    <div className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]; // Corrigido: Acessar o primeiro arquivo
                          if (file) {
                            setVideoFile(file);
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                    {videoFile && (
                      <p className="text-sm text-green-600 mt-1">
                        Arquivo selecionado: {videoFile.name}
                      </p>
                    )}
                    
                    {videoFile && (
                      <div className="mt-3">
                        <label className="text-sm font-medium">Pré-visualização</label>
                        <div className="mt-2 border rounded-md overflow-hidden">
                          <video 
                            src={URL.createObjectURL(videoFile)} 
                            controls 
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium">Imagem de Capa</label>
                  <div className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];// Corrigido: Acessar o primeiro arquivo
                        if (file) {
                          setThumbnailFile(file);
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setThumbnailPreview(e.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                  {thumbnailPreview && (
                    <div className="mt-3">
                      <label className="text-sm font-medium">Pré-visualização da Capa</label>
                      <div className="mt-2 border rounded-md overflow-hidden">
                        <img 
                          src={thumbnailPreview} 
                          alt="Imagem de capa" 
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedLessonTypes.includes('TEXT') && (
              <div>
                <label className="text-sm font-medium">Conteúdo de Texto</label>
                <div className="mt-1">
                  <TiptapEditor
                    value={textContent}
                    onChange={setTextContent}
                  />
                </div>
              </div>
            )}

            {selectedLessonTypes.includes('QUIZ') && (
              <div>
                <label className="text-sm font-medium">Tipo de Quiz</label>
                {/* TODO: Adicionar sub-opções do quiz */}
                <p className="text-sm text-gray-500 mt-2">
                  As opções de tipo de quiz (escolha única, múltipla escolha, etc.) serão adicionadas aqui.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleLessonFormSubmit}>
                {editingLesson ? 'Salvar Alterações' : 'Criar Aula'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}