import { Building2 } from "lucide-react";
import type { Organisation } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OrganisationCardProps {
  organisation: Organisation;
}

export function OrganisationCard({ organisation }: OrganisationCardProps) {
  return (
    <Card className="gap-4 py-5 transition-shadow hover:shadow-md">
      <CardContent className="flex items-start gap-4">
        <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
          <Building2 className="size-5" />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold">{organisation.name}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                organisation.role === "ADMIN"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {organisation.role}
            </span>
          </div>
          {organisation.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm">{organisation.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
