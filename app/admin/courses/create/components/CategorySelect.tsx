'use client'

import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CATEGORY_OPTIONS } from '@/lib/constants'
import type { CourseCategory } from '@/lib/constants'

interface CategorySelectProps {
  value: string
  onChange: (value: CourseCategory) => void
  error?: string
}

export function CategorySelect({ value, onChange, error }: CategorySelectProps) {
  return (
    <div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="Selecione uma categoria" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_OPTIONS.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              <div className="flex items-center gap-2">
                <category.icon className="w-4 h-4" />
                {category.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}
