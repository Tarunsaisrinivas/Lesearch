"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore } from "@/store/use-user-store";
import { ChevronsUpDownIcon } from "lucide-react";
import UserPopover from "./popover/user-popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SidebarUser() {
  const { fullname, username, image } = useUserStore();

  return (
    <UserPopover fullname={fullname} username={username} image={image}>
      {!fullname ? (
        <Skeleton className="mb-1 h-10 w-full bg-primary/5" />
      ) : (
        <Button
          variant="ghost"
          size="lg"
          className="flex h-[50px] w-full items-center justify-start px-3 gap-x-2 font-normal hover:bg-primary/5 md:h-11"
        >
          <Avatar>
            <AvatarImage src={image || ""} alt={fullname[0]} />
            <AvatarFallback>
              {fullname ? fullname[0].toUpperCase() : "?"}
            </AvatarFallback>
          </Avatar>

          <p className="mr-1 max-w-[250px] truncate capitalize md:max-w-[120px]">
            {fullname}
          </p>

          <ChevronsUpDownIcon className="h-3 w-3 text-muted-foreground" />
        </Button>
      )}
    </UserPopover>
  );
}
