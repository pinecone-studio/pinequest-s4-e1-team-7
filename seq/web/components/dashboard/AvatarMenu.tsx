"use client";
import { useRouter } from "next/navigation";
import { LogOut, Settings as Cog } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk, useUser } from "@clerk/nextjs";
import { initial } from "@/lib/utils";

export const AvatarMenu = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

  const name = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? "Хэрэглэгч";
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer ring-2 ring-card">
          <AvatarFallback>{initial(name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="text-sm font-bold">{name}</div>
          <div className="text-xs text-muted-foreground">{email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
          <Cog /> Тохиргоо
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => signOut(() => router.push("/"))}
          className="text-destructive focus:text-destructive"
        >
          <LogOut /> Гарах
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
