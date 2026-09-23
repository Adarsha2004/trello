import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { ChevronDown, LogOut } from "lucide-react";
import { authClient } from "@repo/auth/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-purple-500",
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function UserMenu() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message ?? "Failed to log out");
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/signin");
    },
  });

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto gap-2 px-2 py-2">
          {user.image ? (
            <img src={user.image} alt={user.name} className="size-8 rounded-full object-cover" />
          ) : (
            <span
              className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white ${colorFor(user.id)}`}
            >
              {initials(user.name)}
            </span>
          )}
          <span className="hidden max-w-32 truncate font-medium sm:inline">
            {user.name}
          </span>
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="truncate text-sm font-medium">{user.name}</div>
          <div className="text-muted-foreground truncate text-xs">
            {user.email}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={signOutMutation.isPending}
          onClick={() => signOutMutation.mutate()}
        >
          <LogOut />
          {signOutMutation.isPending ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
