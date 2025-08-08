"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  Strikethrough,
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Quote, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code as CodeIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Eraser
} from "lucide-react";
import { useState, useEffect } from "react";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  placeholder?: string;
}

export function TiptapEditorContent({ 
  value, 
  onChange, 
  height = "min-h-[200px]",
  placeholder = "Digite seu conteúdo aqui..."
}: TiptapEditorProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false, // Desabilitar link do StarterKit para usar nossa configuração
        code: false, // Desabilitar code do StarterKit para usar nossa configuração
        codeBlock: false, // Desabilitar codeBlock do StarterKit para usar nossa configuração
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline hover:text-blue-700",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-md",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Strike,
      Code.configure({
        HTMLAttributes: {
          class: "bg-gray-100 px-1 py-0.5 rounded text-sm font-mono",
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-gray-100 p-4 rounded-md font-mono text-sm",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none p-4 focus:outline-none ${height}`,
        placeholder,
      },
    },
    immediatelyRender: false,
  }, [isClient]);

  // Se não estiver no cliente, mostrar skeleton
  if (!isClient) {
    return (
      <div className="border rounded-md flex flex-col">
        <div className="border-b p-2 flex flex-wrap gap-1 flex-shrink-0">
          <div className="text-sm text-gray-500">Carregando editor...</div>
        </div>
        <div className="flex-1 p-4 min-h-[200px] bg-gray-50 flex items-center justify-center">
          <div className="text-gray-400">Editor carregando...</div>
        </div>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="border rounded-md flex flex-col">
        <div className="border-b p-2 flex flex-wrap gap-1 flex-shrink-0">
          <div className="text-sm text-gray-500">Carregando editor...</div>
        </div>
        <div className="flex-1 p-4 min-h-[200px] bg-gray-50 flex items-center justify-center">
          <div className="text-gray-400">Editor carregando...</div>
        </div>
      </div>
    );
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
    }
  };

  const setLink = () => {
    const url = window.prompt("URL do link:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const clearFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  return (
    <div className="border rounded-md flex flex-col">
      {/* Barra de ferramentas principal */}
      <div className="border-b p-2 flex flex-wrap gap-1 flex-shrink-0">
        {/* Desfazer/Refazer */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Formatação de texto */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-gray-100" : ""}
            title="Negrito"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-gray-100" : ""}
            title="Itálico"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive("underline") ? "bg-gray-100" : ""}
            title="Sublinhado"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "bg-gray-100" : ""}
            title="Tachado"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive("code") ? "bg-gray-100" : ""}
            title="Código inline"
          >
            <CodeIcon className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Títulos */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive("heading", { level: 1 }) ? "bg-gray-100" : ""}
            title="Título 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive("heading", { level: 2 }) ? "bg-gray-100" : ""}
            title="Título 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive("heading", { level: 3 }) ? "bg-gray-100" : ""}
            title="Título 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Listas */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "bg-gray-100" : ""}
            title="Lista com marcadores"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "bg-gray-100" : ""}
            title="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Alinhamento */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={editor.isActive({ textAlign: "left" }) ? "bg-gray-100" : ""}
            title="Alinhar à esquerda"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={editor.isActive({ textAlign: "center" }) ? "bg-gray-100" : ""}
            title="Centralizar"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={editor.isActive({ textAlign: "right" }) ? "bg-gray-100" : ""}
            title="Alinhar à direita"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={editor.isActive({ textAlign: "justify" }) ? "bg-gray-100" : ""}
            title="Justificar"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Elementos especiais */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive("blockquote") ? "bg-gray-100" : ""}
            title="Citação"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive("codeBlock") ? "bg-gray-100" : ""}
            title="Bloco de código"
          >
            <CodeIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={setLink}
            className={editor.isActive("link") ? "bg-gray-100" : ""}
            title="Inserir link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setImageUrl(" ")}
            title="Inserir imagem"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Limpar formatação */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearFormatting}
          title="Limpar formatação"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>

      {/* Input para URL da imagem */}
      {imageUrl !== "" && imageUrl !== " " && (
        <div className="border-b p-2 flex gap-2 flex-shrink-0 bg-gray-50">
          <input
            type="text"
            placeholder="URL da imagem..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="flex-1 px-3 py-1 text-sm border rounded-md"
            onKeyPress={(e) => e.key === "Enter" && addImage()}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImage}
            disabled={!imageUrl}
          >
            Inserir
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setImageUrl("")}
          >
            Cancelar
          </Button>
        </div>
      )}

      {/* Área de edição */}
      <EditorContent
        editor={editor}
        className="flex-1 overflow-y-auto"
      />
    </div>
  );
}
