import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { getOrganisations } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { OrganisationCard } from "@/components/organisations/OrganisationCard";
import { CreateOrganisationDialog } from "@/components/organisations/CreateOrganisationDialog";

export default function OrganisationsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: organisations, isPending, isError, error } = useQuery({
    queryKey: ["organisations"],
    queryFn: getOrganisations,
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
            <Button onClick={() => setCreateOpen(true)}>
              <Plus />
              New organisation
            </Button>
          </div>

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
            </div>
          )}
        </section>
      )}

      <CreateOrganisationDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
