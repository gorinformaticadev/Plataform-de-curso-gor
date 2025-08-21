'use client';

import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { useCourseForm } from '../hooks/useCourseForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload } from 'lucide-react';

interface CourseFormProps {
  courseId: string;
}

export function CourseForm({ courseId }: CourseFormProps) {
  const {
    form,
    isLoading,
    isSaving,
    saveCourse,
    uploadThumbnail,
    addModule,
    removeModule,
    addLesson,
    removeLesson
  } = useCourseForm({
    courseId,
    onSuccess: (data) => {
      console.log('Curso salvo com sucesso:', data);
    },
    onError: (error) => {
      console.error('Erro ao salvar curso:', error);
    }
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;

  const { fields: modules } = useFieldArray({
    control: form.control,
    name: 'modules'
  });

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const url = await uploadThumbnail(file);
        setValue('image', url);
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
      }
    }
  };

  const onSubmit = async (data: any) => {
    await saveCourse(data);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>
            Configure as informações principais do curso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título do Curso</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Digite o título do curso"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descreva o curso"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="Ex: Programação, Design, Marketing"
              />
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="level">Nível</Label>
              <Select
                value={watch('level')}
                onValueChange={(value) => setValue('level', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="published">Publicar Curso</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={watch('published')}
                  onCheckedChange={(checked) => setValue('published', checked)}
                />
                <span>{watch('published') ? 'Publicado' : 'Rascunho'}</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="thumbnail">Thumbnail do Curso</Label>
            <div className="flex items-center space-x-4">
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('thumbnail')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Imagem
              </Button>
              {watch('image') && (
                <img
                  src={watch('image')}
                  alt="Thumbnail"
                  className="w-20 h-20 object-cover rounded"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Módulos */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos</CardTitle>
          <CardDescription>
            Organize seu curso em módulos e lições
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Módulo {moduleIndex + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeModule(moduleIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      {...register(`modules.${moduleIndex}.title`)}
                      placeholder="Título do módulo"
                    />
                    <Textarea
                      {...register(`modules.${moduleIndex}.description`)}
                      placeholder="Descrição do módulo"
                      rows={2}
                    />

                    {/* Lições */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Lições</h4>
                      {watch(`modules.${moduleIndex}.lessons`)?.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="flex gap-2 items-start">
                          <Input
                            {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.title`)}
                            placeholder="Título da lição"
                            className="flex-1"
                          />
                          <Input
                            {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.videoUrl`)}
                            placeholder="URL do vídeo"
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.duration`, { valueAsNumber: true })}
                            placeholder="Duração (min)"
                            className="w-32"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLesson(moduleIndex, lessonIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addLesson(moduleIndex)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Lição
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addModule}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Módulo
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar Curso'}
        </Button>
      </div>
    </form>
  );
}
