import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrganisation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateOrganisationDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateOrganisationDialog({ open, onClose }: CreateOrganisationDialogProps) {
  const [orgName, setOrgName] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => createOrganisation(orgName),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organisations"] });
      setOrgName("");
      onClose();
    },
  });

  useEffect(() => {
    if (!open) return;
    setOrgName("");
    mutation.reset();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
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
        aria-label="Create organisation"
      >
        <form className="flex flex-col gap-6 p-6" onSubmit={onSubmit}>
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-lg font-semibold">Create organisation</h1>
            <p className="text-muted-foreground text-sm">You will be the admin of this organisation.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="orgName">Name</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Google Inc"
              autoFocus
              required
            />
          </div>
          {mutation.isError && (
            <p className="text-destructive text-sm">
              {mutation.error ? mutation.error.message : "Failed to create organisation"}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !orgName.trim()}>
              {mutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
