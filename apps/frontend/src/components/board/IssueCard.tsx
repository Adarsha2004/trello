import { useDrag } from "react-dnd";
import { GripVertical } from "lucide-react";
import type { Issue } from "@/lib/api";
import { ITEM_TYPES, type DraggedIssue } from "@/lib/dnd";
import { cn } from "@/lib/utils";

interface IssueCardProps {
  issue: Issue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const [{ isDragging }, dragRef] = useDrag({
    type: ITEM_TYPES.issue,
    item: (): DraggedIssue => ({
      issueId: issue.id,
      sectionId: issue.sectionId,
    }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <div
      ref={dragRef as unknown as React.Ref<HTMLDivElement>}
      className={cn(
        "bg-card hover:bg-card/80 cursor-grab rounded-lg border p-3 shadow-sm transition-colors active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start gap-1.5">
        <GripVertical className="text-muted-foreground/50 mt-0.5 size-3.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm leading-snug font-medium">{issue.title}</p>
          {issue.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
              {issue.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
