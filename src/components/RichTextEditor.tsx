import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  Send,
} from "lucide-react";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onSubmit?: () => void;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  onSubmit,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: "list-disc pl-4",
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: "list-decimal pl-4",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "mb-1",
          },
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder: placeholder || "Type your response here...",
        emptyEditorClass:
          "cursor-text before:content-[attr(data-placeholder)] before:absolute before:opacity-70 before:pointer-events-none before:text-gray-300",
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      try {
        // Get the markdown content from the editor
        const markdown = editor.storage.markdown?.getMarkdown();
        if (markdown !== undefined) {
          onChange(markdown);
        } else {
          // Fallback to plain text if markdown storage is not available
          onChange(editor.getText());
        }
      } catch (error) {
        console.error("Error getting markdown content:", error);
        // Fallback to plain text if there's an error
        onChange(editor.getText());
      }
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        // Prevent Enter from submitting
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleSubmit = () => {
    if (onSubmit) {
      // Get the final markdown content before submitting
      const markdown =
        editor.storage.markdown?.getMarkdown() || editor.getText();
      onChange(markdown); // Ensure the latest markdown content is passed to parent
      onSubmit();
      // Clear the editor content after submitting
      editor.commands.setContent("");
    }
  };

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-800">
      <div className="flex items-center gap-2 p-2 border-b border-gray-700">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded hover:bg-gray-700 ${
            editor.isActive("bold") ? "bg-gray-700" : ""
          }`}
          disabled={disabled}
          type="button"
        >
          <Bold className="w-4 h-4 text-gray-300" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded hover:bg-gray-700 ${
            editor.isActive("italic") ? "bg-gray-700" : ""
          }`}
          disabled={disabled}
          type="button"
        >
          <Italic className="w-4 h-4 text-gray-300" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1 rounded hover:bg-gray-700 ${
            editor.isActive("underline") ? "bg-gray-700" : ""
          }`}
          disabled={disabled}
          type="button"
        >
          <UnderlineIcon className="w-4 h-4 text-gray-300" />
        </button>
        <button
          onClick={() => {
            editor.chain().focus().toggleBulletList().run();
          }}
          className={`p-1 rounded hover:bg-gray-700 ${
            editor.isActive("bulletList") ? "bg-gray-700" : ""
          }`}
          disabled={disabled}
          type="button"
        >
          <List className="w-4 h-4 text-gray-300" />
        </button>
        <div className="flex-1" />
        <button
          onClick={handleSubmit}
          disabled={disabled || !editor.getText().trim()}
          className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-none p-4 min-h-[100px] focus:outline-none relative text-white [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:focus:ring-0 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_li]:pl-2"
        placeholder={placeholder}
      />
    </div>
  );
}
