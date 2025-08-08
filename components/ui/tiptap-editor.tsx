"use client";

import { NoSSR } from "@/components/no-ssr";
import { TiptapEditorContent } from "./tiptap-editor-content";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  placeholder?: string;
}

// Componente de loading
function TiptapEditorSkeleton() {
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

export function TiptapEditor(props: TiptapEditorProps) {
  return (
    <NoSSR fallback={<TiptapEditorSkeleton />}>
      <TiptapEditorContent {...props} />
    </NoSSR>
  );
}
