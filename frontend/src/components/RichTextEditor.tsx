import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/cn";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

interface ToolDef {
  key: string;
  icon: React.ReactNode;
  command: string;
  value?: string;
  title: string;
  divider?: boolean;
}

const tools: ToolDef[] = [
  { key: "undo", icon: <Undo2 className="h-4 w-4" />, command: "undo", title: "撤销" },
  { key: "redo", icon: <Redo2 className="h-4 w-4" />, command: "redo", title: "重做", divider: true },
  { key: "bold", icon: <Bold className="h-4 w-4" />, command: "bold", title: "加粗" },
  { key: "italic", icon: <Italic className="h-4 w-4" />, command: "italic", title: "斜体" },
  { key: "underline", icon: <Underline className="h-4 w-4" />, command: "underline", title: "下划线" },
  { key: "strike", icon: <Strikethrough className="h-4 w-4" />, command: "strikeThrough", title: "删除线", divider: true },
  { key: "h2", icon: <Heading2 className="h-4 w-4" />, command: "formatBlock", value: "H2", title: "标题 2" },
  { key: "h3", icon: <Heading3 className="h-4 w-4" />, command: "formatBlock", value: "H3", title: "标题 3" },
  { key: "ul", icon: <List className="h-4 w-4" />, command: "insertUnorderedList", title: "无序列表" },
  { key: "ol", icon: <ListOrdered className="h-4 w-4" />, command: "insertOrderedList", title: "有序列表" },
  { key: "quote", icon: <Quote className="h-4 w-4" />, command: "formatBlock", value: "BLOCKQUOTE", title: "引用" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "请输入内容...",
  minHeight = 360,
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  function exec(command: string, val?: string) {
    ref.current?.focus();
    document.execCommand(command, false, val);
    emit();
  }

  function emit() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  // 仅当外部 value 与 DOM 内容不一致时才同步（语言切换/版本回滚），避免输入时重置光标
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-gray-300 transition-colors",
        focused && "border-primary ring-2 ring-primary/20"
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-surface-muted px-2 py-1.5">
        {tools.map((tool) => (
          <span key={tool.key} className="flex items-center">
            <button
              type="button"
              title={tool.title}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec(tool.command, tool.value)}
              className="cursor-pointer rounded p-1.5 text-gray-600 transition-colors hover:bg-primary-subtle hover:text-primary"
            >
              {tool.icon}
            </button>
            {tool.divider && <span className="mx-1 h-4 w-px bg-gray-300" />}
          </span>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onInput={emit}
        style={{ minHeight }}
        className="prose-sm max-w-none px-4 py-3 text-gray-800 outline-none [&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-gray-400"
      />
    </div>
  );
}
