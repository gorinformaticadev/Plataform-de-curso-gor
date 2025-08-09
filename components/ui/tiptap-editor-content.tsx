"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bold, Italic } from "lucide-react";
import { useState, useEffect } from "react";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TiptapEditorContent({
  value,
  onChange,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed && value !== editor.getHTML()) {
      editor.commands.setContent(value, false, {
        preserveWhitespace: 'full',
      });
    }
  }, [value, editor]);

  if (!editor) {
    return <div>Carregando editor...</div>;
  }

  return (
    <div className="border rounded-md flex flex-col">
      <div className="border-b p-2 flex flex-wrap gap-2">
        {/* Grupo Básico */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-gray-100" : ""}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-gray-100" : ""}
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EditorContent
        editor={editor}
        className="flex-1 min-h-[200px] p-4"
      />
    </div>
  );
}
