import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";

interface InlineEditableProps {
  value: string;
  field: string;
  onEdit?: (field: string, value: string) => void;
  editable?: boolean;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
}

const InlineEditable = ({
  value,
  field,
  onEdit,
  editable = false,
  as: Tag = "p",
  className = "",
  multiline = false,
  placeholder = "Click to edit...",
  style,
}: InlineEditableProps) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (onEdit && editValue !== value) {
      onEdit(field, editValue);
    }
  };

  if (!editable) {
    return <Tag className={className} style={style}>{value || placeholder}</Tag>;
  }

  if (editing) {
    const inputClass = cn(
      className,
      "bg-transparent border-2 border-primary/50 rounded-lg px-2 py-1 outline-none focus:border-primary w-full"
    );

    if (multiline) {
      return (
        <textarea
          ref={ref as any}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setEditValue(value); setEditing(false); }
          }}
          className={cn(inputClass, "min-h-[80px] resize-none")}
        />
      );
    }

    return (
      <input
        ref={ref as any}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setEditValue(value); setEditing(false); }
        }}
        className={inputClass}
      />
    );
  }

  return (
    <Tag
      className={cn(className, "cursor-pointer relative group/edit")}
      style={style}
      onClick={() => setEditing(true)}
      title="Click to edit"
    >
      {value || placeholder}
      <span className="absolute -top-2 -right-2 opacity-0 group-hover/edit:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
        <Pencil className="h-3 w-3" />
      </span>
    </Tag>
  );
};

export default InlineEditable;
