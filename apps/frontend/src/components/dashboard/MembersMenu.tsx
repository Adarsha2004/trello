import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, UserPlus, Users } from "lucide-react";
import { getOrgMembers } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteMemberDialog } from "@/components/organisations/InviteMemberDialog";

interface MembersMenuProps {
  orgId: string;
  orgName: string;
  canInvite?: boolean;
}

export function MembersMenu({ orgId, orgName, canInvite = false }: MembersMenuProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: members, isPending } = useQuery({
    queryKey: ["members", orgId],
    queryFn: () => getOrgMembers(orgId),
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Users className="size-4" />
            <span className="hidden sm:inline">Members</span>
            <ChevronDown className="size-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Members</DropdownMenuLabel>
          {isPending ? (
            <p className="text-muted-foreground px-2 py-1.5 text-sm">Loading members...</p>
          ) : (
            members?.map((member) => (
              <DropdownMenuItem key={member.id} className="flex flex-col items-start gap-0.5">
                <span className="font-medium">
                  {member.name}{" "}
                  {member.role === "ADMIN" && <span className="text-primary">(A)</span>}
                </span>
                <span className="text-muted-foreground truncate text-xs">{member.email}</span>
              </DropdownMenuItem>
            ))
          )}
          {canInvite && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setInviteOpen(true)}>
                <UserPlus />
                Add member
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {canInvite && (
        <InviteMemberDialog
          orgId={orgId}
          orgName={orgName}
          open={inviteOpen}
          onClose={() => {
            setInviteOpen(false);
            queryClient.invalidateQueries({ queryKey: ["members", orgId] });
          }}
        />
      )}
    </>
  );
}
