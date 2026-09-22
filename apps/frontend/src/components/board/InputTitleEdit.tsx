import { useRef } from "react";
import { cn } from "@/lib/utils";

interface InputTitleEditProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isPending?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Minimal inline title editor: a bare input indicated only by a bottom
 * line, plus a subtle text-only save button. Enter saves, Escape cancels.
 */
export function InputTitleEdit({
  value,
  onChange,
  onSave,
  onCancel,
  isPending = false,
  placeholder,
  className,
}: InputTitleEditProps) {
  const canSave = value.trim().length > 0 && !isPending;
  const rootRef = useRef<HTMLDivElement>(null);

  // Clicking away cancels — unless focus moved to the Save button, whose
  // click must still fire (its onClick runs after this blur).
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!rootRef.current?.contains(e.relatedTarget as Node | null)) {
      onCancel();
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn("flex min-w-0 flex-1 items-center gap-1.5", className)}
    >
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (canSave) onSave();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        placeholder={placeholder}
        className="border-b border-border focus:border-primary min-w-0 flex-1 bg-transparent pb-0.5 text-sm font-medium outline-none placeholder:font-normal"
      />
      <button
        type="button"
        disabled={!canSave}
        onClick={() => canSave && onSave()}
        className={cn(
          "shrink-0 text-xs font-medium transition-opacity",
          "text-primary hover:underline",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:no-underline",
        )}
      >
        {isPending ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
