"use client";

import { LogOut, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminSignOutAction } from "@/app/auth/actions";
import type { Role } from "@/constants/roles";

function initials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

export function AdminUserMenu({ email, roles }: { email: string; roles: Role[] }) {
  const primaryRole = roles.find((role) => role !== "customer") ?? roles[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5">
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">{initials(email)}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{email}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{email}</span>
          {primaryRole ? (
            <span className="text-xs font-normal capitalize text-muted-foreground">
              {primaryRole.replace("_", " ")}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <a href="/account">
              <UserIcon />
              My account
            </a>
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void adminSignOutAction()}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
