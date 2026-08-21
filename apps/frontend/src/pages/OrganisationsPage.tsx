import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Plus } from "lucide-react";
import { getOrganisations } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { OrganisationCard } from "@/components/organisations/OrganisationCard";
import { CreateOrganisationDialog } from "@/components/organisations/CreateOrganisationDialog";

export default function OrganisationsPage() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const { data: organisations, isPending, isError, error } = useQuery({
    queryKey: ["organisations"],
    queryFn: getOrganisations,
  });

  useEffect(() => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      navigate("/signin");
    }
  }, [error, navigate]);

  return (
    <div className="min-h-screen px-4 py-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {isPending ? (
          <p className="text-muted-foreground py-16 text-center text-sm">Loading organisations...</p>
        ) : isError ? (
          <p className="text-destructive py-16 text-center text-sm">
            {error instanceof Error ? error.message : "Failed to load organisations"}
          </p>
        ) : (
          <>
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
              <div className="text-muted-foreground flex flex-col items-center gap-4 rounded-xl border border-dashed py-16">
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
          </>
        )}

        <CreateOrganisationDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      </section>
    </div>
  );
}
