'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import type { Course, CourseFormData } from '@/types/course'

// Schema de validação com Zod
const courseSchema = z.object({
  title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres'),
  description: z.string().min(20, 'A descrição deve ter pelo menos 20 caracteres'),
  category: z.string().min(1, 'Selecione uma categoria'),
  level: z.string().min(1, 'Selecione o nível de dificuldade'),
  price: z.number().min(0, 'O preço deve ser maior ou igual a 0'),
  duration: z.string().min(1, 'A duração deve ser informada'),
  thumbnail: z.string().url('URL da imagem inválida').optional(),
  modules: z.array(z.any()).default([])
})

interface UseCourseFormProps {
  initialData?: Course
  courseId?: string
}

export function useCourseForm({ initialData, courseId }: UseCourseFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Estado inicial do formulário
  const [formData, setFormData] = useState<CourseFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    level: initialData?.level || 'beginner',
    price: initialData?.price || 0,
    duration: initialData?.duration || '1 hora',
    thumbnail: initialData?.thumbnail || '',
    modules: initialData?.modules || []
  })

  // Atualizar campo do formulário
  const updateField = useCallback(<K extends keyof CourseFormData>(
    field: K,
    value: CourseFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  // Validar formulário
  const validateForm = useCallback(() => {
    try {
      courseSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }, [formData])

  // Submeter formulário
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const url = courseId ? `/api/courses/${courseId}` : '/api/courses'
      const method = courseId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar curso')
      }

      const result = await response.json()
      
      // Redirecionar para a página de cursos ou para o editor de módulos
      if (!courseId) {
        router.push(`/admin/courses/${result.id}/edit`)
      } else {
        router.push('/admin/courses')
      }
      
    } catch (error) {
      console.error('Erro ao salvar curso:', error)
      alert('Erro ao salvar curso. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Salvar como rascunho
  const saveAsDraft = async () => {
    setIsLoading(true)
    
    try {
      const draftData = {
        ...formData,
        published: false
      }

      const url = courseId ? `/api/courses/${courseId}` : '/api/courses'
      const method = courseId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar rascunho')
      }

      alert('Rascunho salvo com sucesso!')
      
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error)
      alert('Erro ao salvar rascunho. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    formData,
    errors,
    isLoading,
    updateField,
    handleSubmit,
    saveAsDraft,
    validateForm
  }
}
