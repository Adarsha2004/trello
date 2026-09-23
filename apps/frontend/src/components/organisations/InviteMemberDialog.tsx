import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { apiErrorMessage, checkUserExists, getOrgMembers, inviteMember } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InviteMemberDialogProps {
  orgId: string;
  orgName: string;
  open: boolean;
  onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteMemberDialog({ orgId, orgName, open, onClose }: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [invited, setInvited] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedEmail(email.trim()), 400);
    return () => clearTimeout(t);
  }, [email]);

  const emailValid = EMAIL_RE.test(debouncedEmail);

  const { data: me } = useCurrentUser();
  const isSelf = emailValid && !!me && debouncedEmail.toLowerCase() === me.email.toLowerCase();

  const { data: members } = useQuery({
    queryKey: ["members", orgId],
    queryFn: () => getOrgMembers(orgId),
    enabled: open,
  });
  const isMember =
    emailValid &&
    !!members?.some((member) => member.email.toLowerCase() === debouncedEmail.toLowerCase());

  const existsQuery = useQuery({
    queryKey: ["user-exists", debouncedEmail, orgId],
    queryFn: () => checkUserExists(debouncedEmail, orgId),
    enabled: open && emailValid && !isSelf && !isMember,
    staleTime: 30_000,
    retry: false,
  });

  const userExists = emailValid && !isSelf && !isMember && existsQuery.data === true;

  const mutation = useMutation({
    mutationFn: () => inviteMember(email.trim(), orgId),
    onSuccess: () => {
      setInvited(email.trim());
      setEmail("");
      mutation.reset();
    },
  });

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setInvited(null);
    mutation.reset();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);

  if (!open) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userExists) return;
    setInvited(null);
    mutation.mutate();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-card text-card-foreground w-full max-w-md rounded-xl border shadow-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Invite member"
      >
        <form className="flex flex-col gap-6 p-6" onSubmit={onSubmit}>
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-lg font-semibold">Invite to {orgName}</h1>
            <p className="text-muted-foreground text-sm">
              They need an account with this email to accept.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@example.com"
                autoFocus
                required
                aria-invalid={
                  emailValid &&
                  !existsQuery.isFetching &&
                  (isSelf || isMember || existsQuery.data === false)
                }
                className={cn(
                  "pr-9",
                  userExists &&
                    "border-green-600 focus-visible:border-green-600 focus-visible:ring-green-600/20",
                )}
              />
              {emailValid && !isSelf && !isMember && existsQuery.isFetching && (
                <Loader2 className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin" />
              )}
            </div>
          </div>
          {mutation.isError && (
            <p className="text-destructive text-sm">
              {apiErrorMessage(mutation.error, "Failed to send invite")}
            </p>
          )}
          {invited && <p className="text-sm text-green-600">Invitation sent to {invited}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Done
            </Button>
            <Button type="submit" disabled={mutation.isPending || !userExists}>
              {mutation.isPending ? "Inviting..." : "Send invite"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
