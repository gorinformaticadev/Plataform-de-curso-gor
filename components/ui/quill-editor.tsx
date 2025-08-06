"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

/**
 * QuillEditor component - Rich text editor based on Quill.js
 * 
 * Note: Quill.js currently uses the deprecated 'DOMNodeInserted' mutation event
 * This is a known issue in the underlying library (https://github.com/quilljs/quill/issues/3529)
 * 
 * The warning doesn't affect functionality but may be removed in future browser versions.
 * TODO: Monitor Quill.js releases for a fix or consider alternative editors like Tiptap
 * if this becomes problematic in production.
 */
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function QuillEditor({ value, onChange }: QuillEditorProps) {
  return (
    <div className="border rounded-md">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        }}
      />
    </div>
  );
}
