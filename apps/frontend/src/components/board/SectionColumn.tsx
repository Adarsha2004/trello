import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { createIssue, type Issue, type Section } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function IssueCard({ issue }: { issue: Issue }) {
  return (
    <div className="bg-card hover:bg-card/80 cursor-pointer rounded-lg border p-3 shadow-sm transition-colors">
      <p className="text-sm leading-snug font-medium">{issue.title}</p>
      {issue.description && (
        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{issue.description}</p>
      )}
    </div>
  );
}

interface SectionColumnProps {
  section: Section;
  issues: Issue[];
  boardId: string;
}

export function SectionColumn({ section, issues, boardId }: SectionColumnProps) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
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
    mutation.reset();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutation.mutate();
  };

  return (
    <div className="bg-muted/50 flex max-h-full w-72 shrink-0 flex-col rounded-xl">
      <div className="flex items-center justify-between px-3 py-2.5">
        <h2 className="truncate text-sm font-semibold">{section.title}</h2>
        <span className="text-muted-foreground text-xs">{issues.length}</span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
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
                  if (title.trim()) mutation.mutate();
                }
              }}
              placeholder="Enter a title for this issue..."
              rows={3}
              className="resize-none bg-card"
            />
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" disabled={!title.trim() || mutation.isPending}>
                {mutation.isPending ? "Adding..." : "Add issue"}
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={closeComposer}>
                <X className="size-4" />
              </Button>
            </div>
            {mutation.isError && (
              <p className="text-destructive text-sm">
                {mutation.error instanceof Error ? mutation.error.message : "Failed to create issue"}
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
