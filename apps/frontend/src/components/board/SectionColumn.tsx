import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDrop } from "react-dnd";
import { generateKeyBetween } from "fractional-indexing";
import { Plus, X } from "lucide-react";
import { createIssue, type Issue, type Section } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IssueCard } from "@/components/board/IssueCard";
import { ITEM_TYPES, type DraggedIssue, type MoveIssueAction } from "@/lib/dnd";
import { cn } from "@/lib/utils";

interface SectionColumnProps {
  section: Section;
  issues: Issue[];
  boardId: string;
  onMoveIssue: (action: MoveIssueAction) => void;
}

export function SectionColumn({
  section,
  issues,
  boardId,
  onMoveIssue,
}: SectionColumnProps) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  // Which issue index the card is hovering over (-1 = end of column)
  const hoverIndexRef = useRef(-1);
  const [{ isOver }, dropRef] = useDrop({
    accept: ITEM_TYPES.issue,
    drop: (item: DraggedIssue) => {
      const raw = hoverIndexRef.current;
      hoverIndexRef.current = -1;

      // `issues` arrives sorted by order key. Neighbors are computed with
      // the dragged card itself excluded from the target column.
      const others = issues.filter((issue) => issue.id !== item.issueId);
      const currentIdx = issues.findIndex((issue) => issue.id === item.issueId);

      // Convert the hover index (over the rendered list, which still
      // contains the dragged card) into an insertion index over `others`.
      let idx = raw < 0 ? others.length : raw;
      if (currentIdx >= 0 && idx > currentIdx) idx -= 1;
      idx = Math.min(Math.max(idx, 0), others.length);

      const prev = idx > 0 ? others[idx - 1] : null;
      const next = idx < others.length ? others[idx] : null;

      // Same section and still between the same two neighbors: no-op.
      const currentPrevId =
        currentIdx > 0 ? (issues[currentIdx - 1]?.id ?? null) : null;
      const currentNextId =
        currentIdx >= 0 ? (issues[currentIdx + 1]?.id ?? null) : null;
      if (
        item.sectionId === section.id &&
        (prev?.id ?? null) === currentPrevId &&
        (next?.id ?? null) === currentNextId
      ) {
        return;
      }

      // Fractional key between the new neighbors — the only row that
      // needs to change, locally (optimistic) and on the server.
      const newKey = generateKeyBetween(
        prev?.position ?? null,
        next?.position ?? null,
      );
      onMoveIssue({
        issueId: item.issueId,
        targetSectionId: section.id,
        newKey,
      });
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });

  const createMutation = useMutation({
    mutationFn: () => createIssue(title.trim(), section.id, boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", boardId] });
      setTitle("");
      setComposerOpen(true);
      textareaRef.current?.focus();
    },
  });

  useEffect(() => {
    if (composerOpen) textareaRef.current?.focus();
  }, [composerOpen]);

  const closeComposer = () => {
    setComposerOpen(false);
    setTitle("");
    createMutation.reset();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate();
  };

  // Position before issue i if dragged-over issue's midpoint is below the cursor
  const indexBefore = (e: React.DragEvent, i: number) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return e.clientY < rect.top + rect.height / 2 ? i : i + 1;
  };

  return (
    <div
      ref={dropRef as unknown as React.Ref<HTMLDivElement>}
      className={cn(
        "bg-muted/50 flex max-h-full w-72 shrink-0 flex-col rounded-xl transition-colors",
        isOver && "bg-muted/80 ring-primary/40 ring-2",
      )}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <h2 className="truncate text-sm font-semibold">{section.title}</h2>
        <span className="text-muted-foreground text-xs">{issues.length}</span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {issues.map((issue, i) => (
          <div
            key={issue.id}
            onDragOver={(e) => {
              e.preventDefault();
              hoverIndexRef.current = indexBefore(e, i);
            }}
            onDragLeave={() => (hoverIndexRef.current = -1)}
          >
            <IssueCard issue={issue} />
          </div>
        ))}

        {composerOpen ? (
          <form onSubmit={onSubmit} className="flex flex-col gap-2">
            <Textarea
              ref={textareaRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (title.trim()) createMutation.mutate();
                }
              }}
              placeholder="Enter a title for this issue..."
              rows={3}
              className="resize-none bg-card"
            />
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={!title.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? "Adding..." : "Add issue"}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={closeComposer}
              >
                <X className="size-4" />
              </Button>
            </div>
            {createMutation.isError && (
              <p className="text-destructive text-sm">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Failed to create issue"}
              </p>
            )}
          </form>
        ) : (
          <button
            onClick={() => setComposerOpen(true)}
            className="hover:bg-muted flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors"
          >
            <Plus className="size-4" />
            Add issue
          </button>
        )}
      </div>
    </div>
  );
}
