import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { getBoards, getOrganisations } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BoardCard } from "@/components/dashboard/BoardCard";
import { CreateBoardDialog } from "@/components/dashboard/CreateBoardDialog";

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);

  const selectOrg = (orgId: string) => {
    setSearchParams({ orgId });
  };

  const { data: organisations, isPending: orgsPending, isError: orgsError, error: orgsErrorObj } = useQuery({
    queryKey: ["organisations"],
    queryFn: getOrganisations,
  });

  const selectedOrgId = searchParams.get("orgId");
  const selectedOrg =
    organisations?.find((org) => org.id === selectedOrgId) ?? organisations?.[0] ?? null;

  const { data: boards, isPending: boardsPending } = useQuery({
    queryKey: ["boards", selectedOrg?.id],
    queryFn: () => getBoards(selectedOrg!.id),
    enabled: !!selectedOrg,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background sticky top-0 border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between">
          <div className="flex items-center gap-4 border rounded-xl">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  {orgsPending ? "Loading..." : selectedOrg ? selectedOrg.name : "No organisation"}
                  <ChevronsUpDown className="size-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Organisations</DropdownMenuLabel>
                {organisations?.map((org) => (
                  <DropdownMenuItem key={org.id} onClick={() => selectOrg(org.id)}>
                    <Check className={org.id === selectedOrg?.id ? "opacity-100" : "opacity-0"} />
                    {org.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/organisations">
                    <Plus />
                    Manage organisations
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 py-10">
        <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
          {orgsPending ? (
            <p className="text-muted-foreground m-auto text-sm">Loading organisations...</p>
          ) : orgsError ? (
            <p className="text-destructive m-auto text-sm">
              {orgsErrorObj instanceof Error ? orgsErrorObj.message : "Failed to load organisations"}
            </p>
          ) : !selectedOrg ? (
            <div className="text-muted-foreground m-auto flex flex-col items-center gap-4">
              <p className="text-sm">You are not part of any organisation yet</p>
              <Button variant="outline" asChild>
                <Link to="/organisations">
                  <Plus />
                  Create one
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">{selectedOrg.name}</h1>
                  <p className="text-muted-foreground text-sm">Boards</p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus />
                  New board
                </Button>
              </div>

              {boardsPending ? (
                <p className="text-muted-foreground m-auto text-sm">Loading boards...</p>
              ) : boards && boards.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {boards.map((board) => (
                    <BoardCard key={board.id} board={board} />
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground m-auto flex flex-col items-center gap-4">
                  <p className="text-sm">No boards yet</p>
                  <Button variant="outline" onClick={() => setCreateOpen(true)}>
                    <Plus />
                    Create one
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {selectedOrg && (
        <CreateBoardDialog orgId={selectedOrg.id} open={createOpen} onClose={() => setCreateOpen(false)} />
      )}
    </div>
  );
}
