import type { PresenceUser } from "@/hooks/useBoardPresence";

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

interface PresenceAvatarsProps {
  users: PresenceUser[];
}

export function PresenceAvatars({ users }: PresenceAvatarsProps) {
  const shown = users.slice(0, 5);
  const overflow = users.length - shown.length;

  return (
    <div className="flex items-center -space-x-2" title={users.map((user) => user.name).join(", ")}>
      {shown.map((user) =>
        user.image ? (
          <img
            key={user.id}
            src={user.image}
            alt={user.name}
            className="border-background size-8 rounded-full border-2 object-cover"
          />
        ) : (
          <div
            key={user.id}
            className={`flex size-8 items-center justify-center rounded-full border-2 border-background text-xs font-semibold text-white ${colorFor(user.id)}`}
          >
            {initials(user.name)}
          </div>
        ),
      )}
      {overflow > 0 && (
        <div className="bg-muted flex size-8 items-center justify-center rounded-full border-2 border-background text-xs font-semibold">
          +{overflow}
        </div>
      )}
    </div>
  );
}
