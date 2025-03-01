"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/use-user-store";
import { type User } from "@supabase/supabase-js";
import { ChevronsLeftIcon, User as UserIcon, Users } from "lucide-react";
import { useEffectOnce } from "react-use";
import { useState, type PropsWithChildren } from "react";
import { useLayoutWrapper } from "../_hooks/use-layout-wrapper";
import useDocRealtime from "../_hooks/use-doc-realtime";
import Header from "./header";
import SidebarMenu from "./sidebar-menu";
import SidebarTree from "./sidebar-tree";
import SidebarUser from "./sidebar-user";

export default function LayoutWrapper({
  children,
  currentUser,
}: PropsWithChildren & {
  currentUser: User;
}) {
  const {
    mainRef,
    topbarRef,
    sidebarRef,
    isMobile,
    minimize,
    minimizeHandler,
    resizeHandler,
    maximizeHandler,
  } = useLayoutWrapper();

  const { setCurrentUser, getCurrentProfileUserAsync } = useUserStore();
  const [isPersonal, setIsPersonal] = useState(true);
  useEffectOnce(() => {
    setCurrentUser(currentUser);
    getCurrentProfileUserAsync();
  });

  useDocRealtime();

  return (
    <div className="relative flex min-h-screen select-none text-primary">
      <aside
        data-state={minimize ? "closed" : "open"}
        ref={sidebarRef}
        className={cn(
          "group/sidebar  fixed z-50 min-h-full w-60 overflow-y-auto bg-stone-50 p-1 dark:bg-stone-900",
          "border-r border-r-secondary data-[state=closed]:-translate-x-96",
          "duration-300",
          isMobile && "data-[state=open]:w-[80%]",
        )}
      >
        <SidebarUser />
        <SidebarMenu />
        <div className="flex w-full mb-2">
          <Button
            variant="ghost"
            className={cn(
              "flex-1 h-9 justify-start px-3 font-normal",
              isPersonal
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-primary/70 hover:bg-primary/5",
            )}
            onClick={() => setIsPersonal(true)}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            Personal
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "flex-1 h-9 justify-start px-3 font-normal",
              !isPersonal
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-primary/70 hover:bg-primary/5",
            )}
            onClick={() => setIsPersonal(false)}
          >
            <Users className="mr-2 h-4 w-4" />
            Public
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-300px)] border-t pt-2">
          {isPersonal ? (
            <SidebarTree isPublic={false} />
          ) : (
            <SidebarTree isPublic={true} />
          )}
        </div>
        <Button
          size="icon"
          className={cn(
            "absolute right-3 top-3 h-7 w-7 text-muted-foreground transition",
            isMobile
              ? "opacity-100"
              : "opacity-0 group-hover/sidebar:opacity-100",
          )}
          variant="ghost"
          onClick={minimizeHandler}
        >
          <ChevronsLeftIcon className="h-6 w-6" />
        </Button>
        {/* cursor area */}
        <div
          className={cn(
            "peer absolute right-0 top-0 z-[50] min-h-full w-[12px] cursor-col-resize",
            isMobile && "hidden",
          )}
          onMouseDown={resizeHandler}
          onClick={minimizeHandler}
        />
        {/* Resize line when hover on cursor area*/}
        <div className="absolute right-0 top-0 z-[49] min-h-full w-1 opacity-100 transition peer-hover:bg-primary/5" />
      </aside>

      {/* mobile overlay backdrop */}
      <div
        data-state={minimize ? "closed" : "open"}
        className={cn(
          "fixed inset-0 right-0 top-0 z-20 bg-stone-900/30 backdrop-blur-sm !duration-300",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0",
          "data-[state=closed]:hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          !isMobile && "hidden",
        )}
        onClick={minimizeHandler}
      />
      <div
        data-state={minimize ? "closed" : "open"}
        ref={topbarRef}
        className={cn(
          "fixed left-60 right-0 top-0 w-[calc(100vw-240px)] bg-background",
          "z-1 border-b border-b-secondary data-[state=closed]:left-0 data-[state=closed]:w-full",
          "duration-300",
          isMobile && "!left-0 !w-full",
        )}
      >
        <Header maximizeHandler={maximizeHandler} />
      </div>
      <main
        data-state={minimize ? "closed" : "open"}
        className={cn(
          "ml-auto mt-12 h-[calc(100vh-48px)] select-text w-[calc(100vw-240px)] overflow-hidden bg-background ",
          "data-[state=closed]:w-full",
          "duration-300",
          isMobile && "!w-full",
        )}
        ref={mainRef}
      >
        {children}
      </main>
    </div>
  );
}
