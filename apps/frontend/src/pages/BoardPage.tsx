import { startTransition, useMemo, useOptimistic } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, WifiOff } from "lucide-react";
import {
  getBoard,
  getIssues,
  getSections,
  moveIssue,
  type Issue,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AddSectionColumn } from "@/components/board/AddSectionColumn";
import { SectionColumn } from "@/components/board/SectionColumn";
import { PresenceAvatars } from "@/components/board/PresenceAvatars";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useBoardPresence } from "@/hooks/useBoardPresence";
import type { MoveIssueAction } from "@/lib/dnd";

// Fractional indexing: a move only rewrites the moved issue's section and
// order key (a string that sorts between the card's new neighbors) — no
// sibling shifting. Used by useOptimistic, so every pending move stays
// layered over the server state (even across refetches) until its own
// transition settles.
function applyMove(state: Issue[], action: MoveIssueAction): Issue[] {
  return state.map((issue) =>
    issue.id === action.issueId
      ? { ...issue, sectionId: action.targetSectionId, position: action.newKey }
      : issue,
  );
}

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

  const queryClient = useQueryClient();
  const moveMutation = useMutation({
    mutationFn: (vars: MoveIssueAction) =>
      moveIssue(vars.issueId, vars.targetSectionId, vars.newKey),
  });

  // The API groups issues by sectionId; the board works on a flat list so
  // the optimistic reducer stays a simple one-row patch.
  const issues = useMemo(
    () => Object.values(issuesQuery.data ?? {}).flat(),
    [issuesQuery.data],
  );
  // Pending moves stay applied on top of `issues` (including refetched data)
  // until the transition that dispatched them settles. On failure the
  // transition ends and the optimistic layer is dropped automatically.
  const [optimisticIssues, addOptimisticMove] = useOptimistic(
    issues,
    applyMove,
  );

  const handleMoveIssue = (action: MoveIssueAction) => {
    startTransition(async () => {
      addOptimisticMove(action);

      let committed = false;
      try {
        await moveMutation.mutateAsync(action);
        committed = true;
      } catch {
        // Rollback is automatic: the transition ends and the optimistic
        // move is discarded, leaving the untouched query cache state.
      }

      if (!committed) return;

      // Hold the optimistic layer until the refetched data (with the move
      // committed) is in the cache. Ending the transition before this
      // would reveal the stale pre-move cache for a moment — the card
      // would visually bounce back and then jump forward again.
      await queryClient
        .invalidateQueries({ queryKey: ["issues", boardId] })
        .catch(() => {
          // Refetch failed (e.g. offline): drop to cache state now; the
          // board converges on the next successful refetch.
        });
    });
  };

  if (boardQuery.isPending) {
    return (
      <p className="text-muted-foreground m-auto text-sm">Loading board...</p>
    );
  }

  if (boardQuery.isError || !boardQuery.data) {
    return (
      <div className="m-auto flex flex-col items-center gap-4">
        <p className="text-destructive text-sm">
          {boardQuery.error instanceof Error
            ? boardQuery.error.message
            : "Failed to load board"}
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
  const presentUsers = me
    ? users.some((user) => user.id === me.id)
      ? users
      : [...users, me]
    : users;

  const issuesInSection = (sectionId: string) =>
    optimisticIssues
      .filter((issue) => issue.sectionId === sectionId)
      // Plain lexicographic compare (ASCII keys) — localeCompare would
      // misorder keys like "a0V" vs "a10".
      .toSorted((a, b) =>
        a.position < b.position ? -1 : a.position > b.position ? 1 : 0,
      );

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
          <p className="text-muted-foreground m-auto text-sm">
            Loading sections...
          </p>
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
                issues={issuesInSection(section.id)}
                boardId={board.id}
                onMoveIssue={handleMoveIssue}
              />
            ))}
            <AddSectionColumn boardId={board.id} />
          </>
        )}
      </main>
    </div>
  );
}
