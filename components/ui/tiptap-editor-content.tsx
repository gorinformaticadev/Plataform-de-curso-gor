"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Bold, Italic } from "lucide-react";
import { useEffect, useState } from "react";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TiptapEditorContent({
  value,
  onChange,
}: TiptapEditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    const editorInstance = new Editor({
      extensions: [StarterKit],
      content: value,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
    });

    setEditor(editorInstance);

    return () => {
      editorInstance.destroy();
    };
  }, []); // Executa apenas uma vez para criar o editor

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md flex flex-col">
      <div className="border-b p-2 flex flex-wrap gap-2">
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

      <EditorContent editor={editor} className="flex-1 min-h-[200px] p-4" />
    </div>
  );
}
