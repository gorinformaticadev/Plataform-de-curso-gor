'use client';

import { useParams } from 'next/navigation';
import { CourseForm } from './components/CourseForm';

export default function CoursePage() {
  const params = useParams();
  const courseId = params.id as string;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {courseId === 'new' ? 'Criar Novo Curso' : 'Editar Curso'}
        </h1>
        <p className="text-muted-foreground">
          {courseId === 'new' 
            ? 'Crie um novo curso para sua plataforma de ensino' 
            : 'Edite as informações do curso existente'}
        </p>
      </div>

      <CourseForm courseId={courseId} />
    </div>
  );
}
