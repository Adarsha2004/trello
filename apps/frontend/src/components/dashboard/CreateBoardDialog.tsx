import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoard } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateBoardDialogProps {
  orgId: string;
  open: boolean;
  onClose: () => void;
}

export function CreateBoardDialog({ orgId, open, onClose }: CreateBoardDialogProps) {
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => createBoard(title, orgId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["boards", orgId] });
      setTitle("");
      onClose();
    },
  });

  useEffect(() => {
    if (!open) return;
    setTitle("");
    mutation.reset();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutation.mutate();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-card text-card-foreground w-full max-w-md rounded-xl border shadow-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Create board"
      >
        <form className="flex flex-col gap-6 p-6" onSubmit={onSubmit}>
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-lg font-semibold">Create board</h1>
            <p className="text-muted-foreground text-sm">A new board in this organisation</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product roadmap"
              autoFocus
              required
            />
          </div>
          {mutation.isError && (
            <p className="text-destructive text-sm">
              {mutation.error instanceof Error ? mutation.error.message : "Failed to create board"}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !title.trim()}>
              {mutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
