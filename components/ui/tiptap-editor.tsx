"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button"; // Se você estiver usando o shadcn/ui
import { useEffect } from "react";

export default function TipTapEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Escreva aqui...</p>",
  });

  useEffect(() => {
    if (editor) {
      console.log("Editor pronto");
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-md p-4 space-y-2">
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted" : ""}>
          Negrito
        </Button>
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}>
          Itálico
        </Button>
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}>
          Lista
        </Button>
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive("paragraph") ? "bg-muted" : ""}>
          Parágrafo
        </Button>
      </div>
      <EditorContent editor={editor} className="min-h-[150px] border rounded-md p-2" />
    </div>
  );
}
