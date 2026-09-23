import { useState } from "react";
import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Trash2, UserPlus } from "lucide-react";
import type { Organisation } from "@/lib/api";
import { deleteOrganisation } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InviteMemberDialog } from "@/components/organisations/InviteMemberDialog";
import { cn } from "@/lib/utils";

interface OrganisationCardProps {
  organisation: Organisation;
}

export function OrganisationCard({ organisation }: OrganisationCardProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteOrganisation(organisation.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["organisations"] }),
  });

  return (
    <div className="relative">
      {organisation.role === "ADMIN" && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="size-8"
            title="Invite member"
            aria-label={`Invite member to ${organisation.name}`}
            onClick={(e) => {
              e.preventDefault();
              setInviteOpen(true);
            }}
          >
            <UserPlus className="size-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="hover:text-destructive size-8"
            title="Delete organisation"
            aria-label={`Delete ${organisation.name}`}
            disabled={deleteMutation.isPending}
            onClick={(e) => {
              e.preventDefault();
              if (confirm(`Delete "${organisation.name}" and all its boards?`)) {
                deleteMutation.mutate();
              }
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      )}
      <Link to={`/dashboard?orgId=${organisation.id}`}>
        <Card className="gap-4 py-5 pr-24 transition-shadow hover:shadow-md">
          <CardContent className="flex items-start gap-4">
            <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
              <Building2 className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate font-semibold">{organisation.name}</span>
              <span
                className={cn(
                  "w-fit rounded-full px-2 py-0.5 text-xs font-medium",
                  organisation.role === "ADMIN"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {organisation.role}
              </span>
              {organisation.description && (
                <p className="text-muted-foreground line-clamp-2 text-sm">{organisation.description}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
      <InviteMemberDialog
        orgId={organisation.id}
        orgName={organisation.name}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  );
}
