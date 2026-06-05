"use client";
import { useRouter } from "next/navigation";
import { LogOut, Settings as Cog } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk } from "@clerk/nextjs";
import { initial } from "@/lib/utils";

export const AvatarMenu = () => {
  const { user } = useApp();
  const { signOut, user: clerkUser } = useClerk();
  const router = useRouter();

  const logout = () => {
    signOut(() => router.push("/"));
  };

  const displayName = clerkUser?.firstName ?? clerkUser?.emailAddresses?.[0]?.emailAddress ?? user?.name ?? "Х";
  const displayEmail = clerkUser?.emailAddresses?.[0]?.emailAddress ?? user?.email ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer ring-2 ring-card">
          <AvatarFallback>{initial(displayName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="text-sm font-bold">{displayName}</div>
          <div className="text-xs text-muted-foreground">{displayEmail}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
          <Cog /> Тохиргоо
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          <LogOut /> Гарах
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
