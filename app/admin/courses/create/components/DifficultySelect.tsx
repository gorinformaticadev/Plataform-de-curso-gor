'use client'

import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DIFFICULTY_LEVELS } from '@/lib/constants'
import type { DifficultyLevel } from '@/lib/constants'

interface DifficultySelectProps {
  value: string
  onChange: (value: DifficultyLevel) => void
  error?: string
}

export function DifficultySelect({ value, onChange, error }: DifficultySelectProps) {
  return (
    <div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder="Selecione o nível de dificuldade" />
        </SelectTrigger>
        <SelectContent>
          {DIFFICULTY_LEVELS.map((level) => (
            <SelectItem key={level.value} value={level.value}>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>
                {level.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}
