import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { getBoards, getOrganisations } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { UserMenu } from "@/components/UserMenu";

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);

  const selectOrg = (orgId: string) => {
    setSearchParams({ orgId });
  };

  const AllOrganisations = useQuery({
    queryKey: ["organisations"],
    queryFn: getOrganisations,
  });

  const selectedOrgId = searchParams.get("orgId");
  const selectedOrg =
    AllOrganisations.data?.find((org) => org.id === selectedOrgId) ?? AllOrganisations.data?.[0] ?? null;

  const { data: boards, isPending: boardsPending } = useQuery({
    queryKey: ["boards", selectedOrg?.id],
    queryFn: () => getBoards(selectedOrg!.id),
    enabled: !!selectedOrg,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col px-4 py-10">
        <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
          {AllOrganisations.isPending ? (
            <p className="text-muted-foreground m-auto text-sm">Loading organisations...</p>
          ) : AllOrganisations.isError ? (
            <p className="text-destructive m-auto text-sm">
              {AllOrganisations.error
                ? AllOrganisations.error.message
                : "Failed to load organisations"}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-2xl font-semibold gap-2 h-auto py-1 px-2 -ml-2">
                        {selectedOrg.name}
                        <ChevronsUpDown className="size-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Organisations</DropdownMenuLabel>
                      {AllOrganisations.data?.map((org) => (
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
                  <p className="text-muted-foreground text-sm">Boards</p>
                </div>
                <UserMenu />
              </div>

              {boardsPending ? (
                <p className="text-muted-foreground m-auto text-sm">Loading boards...</p>
              ) : boards && boards.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {boards.map((board) => (
                    <BoardCard key={board.id} board={board} />
                  ))}
                  <button onClick={() => setCreateOpen(true)} className="text-start">
                    <Card className="gap-4 border-dashed py-5 transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center gap-4">
                        <div className="bg-muted text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-lg">
                          <Plus className="size-5" />
                        </div>
                        <span className="text-muted-foreground font-semibold">New board</span>
                      </CardContent>
                    </Card>
                  </button>
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
