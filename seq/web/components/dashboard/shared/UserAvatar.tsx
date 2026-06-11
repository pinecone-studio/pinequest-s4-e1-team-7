import { initial } from "@/lib/utils";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
};

export function UserAvatar({
  name,
  avatarUrl,
  size = 40,
  className,
}: UserAvatarProps) {
  return (
    <div
      className={cn("shrink-0 overflow-hidden rounded-full", className)}
      style={{
        width: size,
        height: size,
        border: "2px solid var(--border-c)",
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-bold"
          style={{
            background:
              "linear-gradient(150deg, var(--olive-bright), var(--olive-deep))",
            color: "#0d1e35",
            fontSize: size * 0.38,
          }}
        >
          {initial(name)}
        </div>
      )}
    </div>
  );
}
