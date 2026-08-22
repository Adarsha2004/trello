import { KanbanSquare } from "lucide-react";
import type { Board } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

interface BoardCardProps {
  board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
  return (
    <Card className="gap-4 py-5 transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4">
        <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
          <KanbanSquare className="size-5" />
        </div>
        <span className="truncate font-semibold">{board.title}</span>
      </CardContent>
    </Card>
  );
}
