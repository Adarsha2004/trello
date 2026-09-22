import { useState } from "react";
import { useDrag } from "react-dnd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Pencil, Trash2, X } from "lucide-react";
import { deleteIssue, updateIssue, type Issue, type OrgMember } from "@/lib/api";
import { useBoard } from "@/pages/BoardPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ITEM_TYPES, type DraggedIssue } from "@/lib/dnd";
import { cn } from "@/lib/utils";

interface IssueCardProps {
  issue: Issue;
  members: OrgMember[];
}

export function IssueCard({ issue, members }: IssueCardProps) {
  const queryClient = useQueryClient();
  const { broadcastBoardUpdate } = useBoard();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description ?? "");
  const [assigneeIds, setAssigneeIds] = useState<string[]>(
    issue.users?.map(({ user }) => user.id) ?? [],
  );

  const toggleAssignee = (userId: string) =>
    setAssigneeIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["issues", issue.boardId] });

  // Optimistic: remove the card from its section's list immediately and
  // restore the snapshot if the server rejects the delete.
  const deleteMutation = useMutation({
    mutationFn: () => deleteIssue(issue.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["issues", issue.boardId] });
      const prev = queryClient.getQueryData<Record<string, Issue[]>>([
        "issues",
        issue.boardId,
      ]);
      queryClient.setQueryData<Record<string, Issue[]>>(
        ["issues", issue.boardId],
        (old) => {
          const list = old?.[issue.sectionId];
          if (!old || !list) return old;
          return {
            ...old,
            [issue.sectionId]: list.filter((i) => i.id !== issue.id),
          };
        },
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["issues", issue.boardId], ctx.prev);
      }
    },
    onSuccess: () => broadcastBoardUpdate("issues"),
    onSettled: () => invalidate(),
  });

  const editMutation = useMutation({
    mutationFn: () =>
      updateIssue(issue.id, {
        title: title.trim(),
        description: description.trim(),
        assigneeIds,
      }),
    onSuccess: async () => {
      await invalidate();
      broadcastBoardUpdate("issues");
      setEditing(false);
    },
  });

  const [{ isDragging }, dragRef] = useDrag({
    type: ITEM_TYPES.issue,
    item: (): DraggedIssue => ({
      issueId: issue.id,
      sectionId: issue.sectionId,
    }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const startEdit = () => {
    setTitle(issue.title);
    setDescription(issue.description ?? "");
    setAssigneeIds(issue.users?.map(({ user }) => user.id) ?? []);
    setEditing(true);
  };

  // Typing inside the edit form must not start a card drag.
  const stopDrag = (e: React.SyntheticEvent) => e.stopPropagation();

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim() && description.trim()) editMutation.mutate();
        }}
        onMouseDown={stopDrag}
        onTouchStart={stopDrag}
        className="bg-card flex flex-col gap-2 rounded-lg border p-3 shadow-sm"
      >
        <Input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Issue title"
          className="bg-card"
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={3}
          className="resize-none bg-card"
        />
        {members.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {members.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => toggleAssignee(member.id)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                  assigneeIds.includes(member.id)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {member.name}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={
              !title.trim() || !description.trim() || editMutation.isPending
            }
          >
            {editMutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>
        {editMutation.isError && (
          <p className="text-destructive text-sm">
            {editMutation.error instanceof Error
              ? editMutation.error.message
              : "Failed to update issue"}
          </p>
        )}
      </form>
    );
  }

  return (
    <div
      ref={dragRef as unknown as React.Ref<HTMLDivElement>}
      className={cn(
        "bg-card hover:bg-card/80 group relative cursor-grab rounded-lg border p-3 shadow-sm transition-colors active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          aria-label="Edit issue"
          onClick={(e) => {
            e.stopPropagation();
            startEdit();
          }}
          className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-md p-1"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Delete issue"
          disabled={deleteMutation.isPending}
          onClick={(e) => {
            e.stopPropagation();
            deleteMutation.mutate();
          }}
          className="hover:bg-muted text-muted-foreground hover:text-destructive rounded-md p-1"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
      <div className="flex items-start gap-1.5">
        <GripVertical className="text-muted-foreground/50 mt-0.5 size-3.5 shrink-0" />
        <p className="min-w-0 flex-1 pr-14 text-sm leading-snug font-medium">
          {issue.title}
        </p>
      </div>
      {/* 20px = grip width (14px) + gap (6px): aligns with the title text */}
      <div className="pl-5">
        {issue.description && (
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
            {issue.description}
          </p>
        )}
        {(issue.users?.length ?? 0) > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {issue.users!.map(({ user }) => (
              <span
                key={user.id}
                className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px]"
              >
                {user.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
