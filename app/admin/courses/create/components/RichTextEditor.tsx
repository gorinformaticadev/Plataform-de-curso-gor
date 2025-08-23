'use client'

import React, { useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Undo,
  Redo,
  Table2,
  Trash2,
  Plus,
  Minus
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

interface MenuBarProps {
  editor: ReturnType<typeof useEditor>
}

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return null
  }

  const addImage = useCallback(() => {
    const url = window.prompt('URL da imagem:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL do link:', previousUrl)
    
    if (url === null) {
      return
    }
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  return (
    <div className="border border-gray-300 rounded-t-md p-2 flex flex-wrap gap-1 bg-gray-50">
      {/* Grupo: Undo/Redo */}
      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Desfazer (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refazer (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Grupo: Formatação de texto */}
      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={cn(
            "p-2 rounded hover:bg-gray-200 disabled:opacity-50",
            editor.isActive('bold') && "bg-blue-500 text-white hover:bg-blue-600"
          )}
          title="Negrito (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={cn(
            "p-2 rounded hover:bg-gray-200 disabled:opacity-50",
            editor.isActive('italic') && "bg-blue-500 text-white hover:bg-blue-600"
          )}
          title="Itálico (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={cn(
            "p-2 rounded hover:bg-gray-200 disabled:opacity-50",
            editor.isActive('strike') && "bg-blue-500 text-white hover:bg-blue-600"
          )}
          title="Tachado"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
      </div>

      {/* Grupo: Títulos */}
      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "p-2 rounded hover:bg-gray-200",
            editor.isActive('heading', { level: 2 }) && "bg-blue-500 text-white hover:bg-blue-600"
          )}
          title="Título H2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            "p-2 rounded hover:bg-gray-200",
            editor.isActive('heading', { level: 3 }) && "bg-blue-500 text-white hover:bg-blue-600"
          )}
          title="Título H3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
      </div>

      {/* Grupo: Listas */}
      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-2 rounded hover:bg-gray-200",
            editor.isActive('bulletList') && "bg-blue-500 text-white hover:bg-blue-600"
          )}
          title="Lista não ordenada"
        >
          <List className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-2 rounded hover:bg-gray-200",
            editor.isActive('orderedList') && "bg-blue-500 text-white hover:bg-blue-600"
          )}
          title="Lista ordenada"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {/* Grupo: Links e Imagens */}
      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <button
          onClick={setLink}
          className={cn(
            "p-2 rounded hover:bg-gray-200",
            editor.isActive('link') && "bg-blue-500 text-white hover:bg-blue-600"
          )}
          title="Inserir link"
        >
          <Link2 className="w-4 h-4" />
        </button>
        
        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-200"
          title="Inserir imagem"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Grupo: Tabelas */}
      <div className="flex gap-1">
        <button
          onClick={addTable}
          className="p-2 rounded hover:bg-gray-200"
          title="Inserir tabela"
        >
          <Table2 className="w-4 h-4" />
        </button>
        
        {editor.isActive('table') && (
          <>
            <button
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="p-2 rounded hover:bg-gray-200"
              title="Adicionar coluna antes"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="p-2 rounded hover:bg-gray-200 text-red-600"
              title="Remover tabela"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-md',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: placeholder || 'Comece a escrever...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  })

  return (
    <div className={cn("border border-gray-300 rounded-md", className)}>
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="border-t-0 rounded-b-md"
      />
    </div>
  )
}
