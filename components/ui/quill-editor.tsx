"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Note: Quill.js uses deprecated 'DOMNodeInserted' event
// This is a known issue in the underlying library
// Consider monitoring for updates or alternative editors if this becomes problematic
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
