import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { createSection } from "@/lib/api";
import { useBoard } from "@/pages/BoardPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddSectionColumnProps {
  boardId: string;
}

export function AddSectionColumn({ boardId }: AddSectionColumnProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { broadcastBoardUpdate } = useBoard();

  const mutation = useMutation({
    mutationFn: () => createSection(title.trim(), boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", boardId] });
      broadcastBoardUpdate("sections");
      setTitle("");
      setOpen(true);
      inputRef.current?.focus();
    },
  });

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    setTitle("");
    mutation.reset();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutation.mutate();
  };

  return (
    <div className="w-72 shrink-0">
      {open ? (
        <form
          onSubmit={onSubmit}
          className="bg-background flex flex-col gap-2 rounded-xl border p-3 shadow-sm"
        >
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter section title..."
            onBlur={() => !title && close()}
          />
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={!title.trim() || mutation.isPending}>
              {mutation.isPending ? "Adding..." : "Add section"}
            </Button>
            <Button type="button" size="icon" variant="ghost" onClick={close}>
              <X className="size-4" />
            </Button>
          </div>
          {mutation.isError && (
            <p className="text-destructive text-sm">
              {mutation.error instanceof Error ? mutation.error.message : "Failed to create section"}
            </p>
          )}
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-muted/50 hover:bg-muted flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
        >
          <Plus className="size-4" />
          Add section
        </button>
      )}
    </div>
  );
}
