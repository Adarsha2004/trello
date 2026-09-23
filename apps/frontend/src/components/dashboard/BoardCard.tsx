import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KanbanSquare, Trash2 } from "lucide-react";
import type { Board } from "@/lib/api";
import { deleteBoard } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BoardCardProps {
  board: Board;
  canDelete?: boolean;
}

export function BoardCard({ board, canDelete = false }: BoardCardProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteBoard(board.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boards", board.orgId] }),
  });

  return (
    <Link to={`/boards/${board.id}`} className="relative block">
      {canDelete && (
        <Button
          variant="secondary"
          size="icon"
          className="hover:text-destructive absolute top-4 right-4 z-10 size-8"
          title="Delete board"
          aria-label={`Delete ${board.title}`}
          disabled={deleteMutation.isPending}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm(`Delete "${board.title}"?`)) {
              deleteMutation.mutate();
            }
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
      <Card className="gap-4 py-5 pr-16 transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
            <KanbanSquare className="size-5" />
          </div>
          <span className="truncate font-semibold">{board.title}</span>
        </CardContent>
      </Card>
    </Link>
  );
}
