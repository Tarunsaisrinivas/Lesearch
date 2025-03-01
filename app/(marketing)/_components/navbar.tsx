"use client";

import { useEffect, useState } from "react";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import Logo from "../../../components/logo";
import ModeToggle from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrolled = useScrollTop();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.log("No User Found:", error.message);
      } else {
        setUser(user);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <div
      className={cn(
        "z-50 bg-background dark:bg-[#1F1F1F] fixed top-0 flex items-center w-full p-6",
        scrolled && "border-b shadow-sm",
      )}
    >
      <Logo />
      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
        {isLoading && <Spinner />}
        {!user && !isLoading && (
          <div className="flex gap-x-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>

            <Button size="sm" asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        )}
        {user && !isLoading && (
          <>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage
                    src={user.user_metadata.image || user.user_metadata.picture}
                    alt={user.email}
                  />
                  <AvatarFallback>
                    {user.email ? user.email[0].toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={
                        user.user_metadata.image || user.user_metadata.picture
                      }
                      alt={user.email}
                    />
                    <AvatarFallback>
                      {user.email ? user.email[0].toUpperCase() : "?"}
                    </AvatarFallback>
                  </Avatar>
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/documents">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        <ModeToggle />
      </div>
    </div>
  );
};
