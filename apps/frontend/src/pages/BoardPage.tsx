import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, WifiOff } from "lucide-react";
import { getBoard, getIssues, getSections } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AddSectionColumn } from "@/components/board/AddSectionColumn";
import { SectionColumn } from "@/components/board/SectionColumn";
import { PresenceAvatars } from "@/components/board/PresenceAvatars";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useBoardPresence } from "@/hooks/useBoardPresence";

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();

  const boardQuery = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoard(boardId!),
    enabled: !!boardId,
  });

  const sectionsQuery = useQuery({
    queryKey: ["sections", boardId],
    queryFn: () => getSections(boardId!),
    enabled: !!boardId,
  });

  const issuesQuery = useQuery({
    queryKey: ["issues", boardId],
    queryFn: () => getIssues(boardId!),
    enabled: !!boardId,
  });

  const meQuery = useCurrentUser();
  const me = meQuery.data ?? null;
  const { users, connected } = useBoardPresence(boardId, me);

  if (boardQuery.isPending) {
    return <p className="text-muted-foreground m-auto text-sm">Loading board...</p>;
  }

  if (boardQuery.isError || !boardQuery.data) {
    return (
      <div className="m-auto flex flex-col items-center gap-4">
        <p className="text-destructive text-sm">
          {boardQuery.error instanceof Error ? boardQuery.error.message : "Failed to load board"}
        </p>
        <Button variant="outline" asChild>
          <Link to="/dashboard">
            <ArrowLeft />
            Back to dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const board = boardQuery.data;
  const sections = sectionsQuery.data ?? [];
  const issues = issuesQuery.data ?? [];
  const presentUsers = me ? (users.some((user) => user.id === me.id) ? users : [...users, me]) : users;

  return (
    <div className="flex h-screen flex-col">
      <header className="bg-background sticky top-0 z-10 border-b">
        <div className="flex h-14 items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/dashboard?orgId=${board.orgId}`}>
                <ArrowLeft />
              </Link>
            </Button>
            <h1 className="truncate text-lg font-semibold">{board.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {!connected && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <WifiOff className="size-3.5" />
                Reconnecting...
              </span>
            )}
            <PresenceAvatars users={presentUsers} />
          </div>
        </div>
      </header>

      <main className="flex flex-1 gap-4 overflow-x-auto p-4">
        {sectionsQuery.isPending ? (
          <p className="text-muted-foreground m-auto text-sm">Loading sections...</p>
        ) : sectionsQuery.isError ? (
          <p className="text-destructive m-auto text-sm">
            {sectionsQuery.error instanceof Error
              ? sectionsQuery.error.message
              : "Failed to load sections"}
          </p>
        ) : sections.length === 0 ? (
          <div className="flex w-full items-start">
            <AddSectionColumn boardId={board.id} />
          </div>
        ) : (
          <>
            {sections.map((section) => (
              <SectionColumn
                key={section.id}
                section={section}
                issues={issues.filter((issue) => issue.sectionId === section.id)}
                boardId={board.id}
              />
            ))}
            <AddSectionColumn boardId={board.id} />
          </>
        )}
      </main>
    </div>
  );
}
