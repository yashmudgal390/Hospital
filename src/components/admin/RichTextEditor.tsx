"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  ImageIcon, 
  Link as LinkIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      })
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base focus:outline-none min-h-[300px] w-full max-w-none rendered-content px-4 py-6 border border-brand-border rounded-xl",
      },
    },
  });

  // Keep editor synced if content prop changes externally (e.g. initial load)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    
    // cancelled
    if (url === null) return;
    
    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    
    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-brand-border overflow-hidden focus-within:ring-2 ring-brand-primary/20 transition-shadow">
      <div className="border-b border-brand-border bg-brand-50 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-brand-200 text-brand-text" : "text-brand-muted hover:bg-brand-100 hover:text-brand-text"}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-brand-200 text-brand-text" : "text-brand-muted hover:bg-brand-100"}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "bg-brand-200 text-brand-text" : "text-brand-muted hover:bg-brand-100"}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-brand-border mx-1 self-center" />
        
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-brand-200 text-brand-text" : "text-brand-muted hover:bg-brand-100"}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-brand-200 text-brand-text" : "text-brand-muted hover:bg-brand-100"}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "bg-brand-200 text-brand-text" : "text-brand-muted hover:bg-brand-100"}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-brand-border mx-1 self-center" />

        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-brand-200 text-brand-text" : "text-brand-muted hover:bg-brand-100"}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-brand-200 text-brand-text" : "text-brand-muted hover:bg-brand-100"}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-brand-200 text-brand-text" : "text-brand-muted hover:bg-brand-100"}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-brand-border mx-1 self-center" />

        <Button
          type="button" variant="ghost" size="sm"
          onClick={addLink}
          className={editor.isActive("link") ? "bg-brand-200 text-brand-text" : "text-brand-muted hover:bg-brand-100"}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button" variant="ghost" size="sm"
          onClick={addImage}
          className="text-brand-muted hover:bg-brand-100"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-2">
         <EditorContent editor={editor} />
      </div>
    </div>
  );
}
