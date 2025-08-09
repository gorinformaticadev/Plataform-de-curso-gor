"use client";

import { useState } from "react";
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
  type: "VIDEO" | "PDF" | "QUIZ";
  url?: string;
  coverUrl?: string;
  quizTitle?: string;
  quizDescription?: string;
  order: number;
}

interface Module {
  id?: string;
  name: string;
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
  const [newModuleName, setNewModuleName] = useState("");
  const [editingModule, setEditingModule] = useState<{ module: Module; index: number } | null>(null);
  const [editedModuleName, setEditedModuleName] = useState("");
  const [editedModuleDescription, setEditedModuleDescription] = useState("");
  const [addingLesson, setAddingLesson] = useState<{ moduleId: number } | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ moduleId: number; lesson: Lesson; lessonIndex: number } | null>(null);

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

  const handleDrop = (e: React.DragEvent, targetModuleId: number, targetLessonId?: number) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const newModules = [...modules];
    
    if (draggedItem.type === 'module' && targetLessonId === undefined) {
      // Reordering modules
      const [draggedModule] = newModules.splice(draggedItem.moduleId, 1);
      newModules.splice(targetModuleId, 0, draggedModule);
      
      // Update order
      newModules.forEach((module, index) => {
        module.order = index + 1;
      });
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
      }
    }
    
    onModulesChange(newModules);
    setDraggedItem(null);
  };

  const handleAddModule = () => {
    if (!newModuleName.trim()) {
      toast.error("Por favor, digite um nome para o módulo");
      return;
    }
    
    const newModule: Module = {
      name: newModuleName,
      description: "",
      order: modules.length + 1,
      contents: [],
      isExpanded: true
    };
    
    onModulesChange([...modules, newModule]);
    setNewModuleName("");
    toast.success("Módulo adicionado com sucesso!");
  };

  const handleEditModule = (module: Module, index: number) => {
    setEditingModule({ module, index });
    setEditedModuleName(module.name);
    setEditedModuleDescription(module.description);
  };

  const handleSaveModule = () => {
    if (!editingModule) return;
    
    const newModules = [...modules];
    newModules[editingModule.index] = {
      ...newModules[editingModule.index],
      name: editedModuleName,
      description: editedModuleDescription
    };
    
    onModulesChange(newModules);
    setEditingModule(null);
    toast.success("Módulo atualizado com sucesso!");
  };

  const handleDeleteModule = (index: number) => {
    const newModules = modules.filter((_, i) => i !== index);
    // Update order
    newModules.forEach((module, i) => {
      module.order = i + 1;
    });
    onModulesChange(newModules);
    toast.success("Módulo excluído com sucesso!");
  };

  const toggleModuleExpansion = (index: number) => {
    const newModules = [...modules];
    newModules[index] = {
      ...newModules[index],
      isExpanded: !newModules[index].isExpanded
    };
    onModulesChange(newModules);
  };

  const handleAddLesson = (moduleId: number) => {
    setAddingLesson({ moduleId });
  };

  const handleSaveLesson = async () => {
    if (!addingLesson) return;
    
    const { moduleId } = addingLesson;
    const module = modules[moduleId];
    
    // This is a simplified version - in a real implementation, 
    // you would have a form to collect lesson details
    const newLesson: Lesson = {
      title: "Nova Aula",
      type: "VIDEO",
      order: module.contents.length + 1
    };
    
    const newModules = [...modules];
    newModules[moduleId] = {
      ...newModules[moduleId],
      contents: [...newModules[moduleId].contents, newLesson]
    };
    
    onModulesChange(newModules);
    setAddingLesson(null);
    toast.success("Aula adicionada com sucesso!");
  };

  const handleDeleteLesson = (moduleId: number, lessonIndex: number) => {
    const newModules = [...modules];
    newModules[moduleId] = {
      ...newModules[moduleId],
      contents: newModules[moduleId].contents.filter((_, i) => i !== lessonIndex)
    };
    
    // Update order
    newModules[moduleId].contents.forEach((lesson, index) => {
      lesson.order = index + 1;
    });
    
    onModulesChange(newModules);
    toast.success("Aula excluída com sucesso!");
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'PDF':
        return <FileText className="h-4 w-4" />;
      case 'QUIZ':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getLessonTypeLabel = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'Vídeo';
      case 'PDF':
        return 'PDF';
      case 'QUIZ':
        return 'Questionário';
      default:
        return 'Aula';
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Module Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Módulos do Curso</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
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
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setNewModuleName("")}>
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
            open={module.isExpanded}
            onOpenChange={() => toggleModuleExpansion(moduleIndex)}
            className="border-2 hover:border-gray-300 transition-colors rounded-md"
          >
            <Card>
              <CardHeader
                className="pb-3 cursor-move"
                draggable
                onDragStart={(e) => handleDragStart(e, 'module', moduleIndex)}
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
                      <CardTitle className="text-base">{module.name}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {module.contents.length} aula{module.contents.length !== 1 ? 's' : ''}
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
                            Tem certeza que deseja excluir o módulo "{module.name}"?
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
                      onClick={() => handleAddLesson(moduleIndex)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Aula
                    </Button>
                  </div>

                  {/* Lessons List */}
                  {module.contents.length > 0 && (
                    <div className="space-y-2">
                      {module.contents.map((lesson, lessonIndex) => (
                        <div
                          key={lessonIndex}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                          draggable
                          onDragStart={(e) => handleDragStart(e, 'lesson', moduleIndex, lessonIndex)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, moduleIndex, lessonIndex)}
                        >
                          <div className="flex items-center space-x-3">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            {getLessonIcon(lesson.type)}
                            <div>
                              <p className="font-medium text-sm">{lesson.title}</p>
                              <p className="text-xs text-gray-500">
                                {getLessonTypeLabel(lesson.type)} • Aula {lesson.order}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingLesson({
                                moduleId: moduleIndex,
                                lesson,
                                lessonIndex
                              })}
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

                  {module.contents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Play className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Nenhuma aula neste módulo</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleAddLesson(moduleIndex)}
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
                      value={newModuleName}
                      onChange={(e) => setNewModuleName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setNewModuleName("")}>
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
                  value={editedModuleName}
                  onChange={(e) => setEditedModuleName(e.target.value)}
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
    </div>
  );
}