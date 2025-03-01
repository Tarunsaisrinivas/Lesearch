"use client";

import type React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSidebar } from "./components/Sidebar";
import { Header } from "./components/Header";

export default function AIDiscourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="flex h-full overflow-hidden">
        <ChatSidebar />
        <div className="flex flex-col flex-grow overflow-hidden">
          <Header />
          <ScrollArea className="flex-grow">
            <main>{children}</main>
          </ScrollArea>
        </div>
      </div>
  );
}
