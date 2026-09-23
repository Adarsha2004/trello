import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { acceptInvitation, getInvitations, getOrganisations } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrganisationCard } from "@/components/organisations/OrganisationCard";
import { CreateOrganisationDialog } from "@/components/organisations/CreateOrganisationDialog";
import { UserMenu } from "@/components/UserMenu";

export default function OrganisationsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: organisations, isPending, isError, error } = useQuery({
    queryKey: ["organisations"],
    queryFn: getOrganisations,
  });

  const { data: invitations } = useQuery({
    queryKey: ["invitations"],
    queryFn: getInvitations,
  });

  const acceptMutation = useMutation({
    mutationFn: (orgId: string) => acceptInvitation(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["organisations"] });
    },
  });

  return (
    <div className="flex min-h-screen flex-col px-4 py-10">
      {isPending ? (
        <p className="text-muted-foreground m-auto text-sm">Loading organisations...</p>
      ) : isError ? (
        <p className="text-destructive m-auto text-sm">
          {error instanceof Error ? error.message : "Failed to load organisations"}
        </p>
      ) : (
        <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Organisations</h1>
              <p className="text-muted-foreground text-sm">Organisations you are a part of</p>
            </div>
            <UserMenu />
          </div>

          {invitations && invitations.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
              <div>
                <p className="text-sm font-semibold">Pending invitations</p>
                <p className="text-muted-foreground text-sm">
                  {invitations.map((org) => org.name).join(", ")}
                </p>
              </div>
              <div className="flex gap-2">
                {invitations.map((org) => (
                  <Button
                    key={org.id}
                    size="sm"
                    onClick={() => acceptMutation.mutate(org.id)}
                    disabled={acceptMutation.isPending}
                  >
                    Accept {org.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {organisations.length === 0 ? (
            <div className="text-muted-foreground m-auto flex flex-col items-center gap-4">
              <p className="text-sm">You are not part of any organisation yet</p>
              <Button variant="outline" onClick={() => setCreateOpen(true)}>
                <Plus />
                Create one
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {organisations.map((organisation) => (
                <OrganisationCard key={organisation.id} organisation={organisation} />
              ))}
              <button onClick={() => setCreateOpen(true)} className="text-start">
                <Card className="gap-4 border-dashed py-5 transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-4">
                    <div className="bg-muted text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-lg">
                      <Plus className="size-5" />
                    </div>
                    <span className="text-muted-foreground font-semibold">New organisation</span>
                  </CardContent>
                </Card>
              </button>
            </div>
          )}
        </section>
      )}

      <CreateOrganisationDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
