'use client'

import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCategories } from '@/app/admin/categories/categories.service'
import { BookOpen } from 'lucide-react'

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

// Mapeamento de ícones baseado no nome do ícone da categoria
const iconMap: Record<string, React.ComponentType<any>> = {
  'code': () => <span className="w-4 h-4">💻</span>,
  'book': () => <span className="w-4 h-4">📚</span>,
  'palette': () => <span className="w-4 h-4">🎨</span>,
  'camera': () => <span className="w-4 h-4">📷</span>,
  'music': () => <span className="w-4 h-4">🎵</span>,
  'briefcase': () => <span className="w-4 h-4">💼</span>,
  'megaphone': () => <span className="w-4 h-4">📢</span>,
  'heart': () => <span className="w-4 h-4">❤️</span>,
  'globe': () => <span className="w-4 h-4">🌎</span>,
  'trending-up': () => <span className="w-4 h-4">📈</span>,
  'book-open': BookOpen
}

export function CategorySelect({ value, onChange, error }: CategorySelectProps) {
  const { data: categories = [], isLoading } = useCategories()

  console.log('Categorias carregadas:', categories)
  console.log('Valor atual:', value)
  console.log('Categoria selecionada:', categories.find(cat => cat.id === value))

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName] || BookOpen
    return <IconComponent className="w-4 h-4" />
  }

  return (
    <div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={isLoading ? "Carregando categorias..." : "Selecione uma categoria"} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center gap-2">
                {getIconComponent(category.icon)}
                {category.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}
