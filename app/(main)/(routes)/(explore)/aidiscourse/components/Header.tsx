"use client";
import { Button } from "@/components/ui/button";
import { Bot, Info, Menu } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "@/store/use-chat-store";

type Message = {
  id: string;
  type: "user" | "bot";
  content: string;
  isFullyTyped?: boolean;
};

type Chat = {
  id: string;
  messages: Message[];
  title: string;
};

export const Header = () => {
  const [currentChat] = useState<Chat>({
    id: "1",
    messages: [],
    title: "New Chat",
  });
  const { toggleSidebar } = useChatStore();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-white/80 dark:bg-black backdrop-blur-sm ">
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleSidebar}
          className="mr-2"
        >
          <Menu className="w-6 h-6" />
        </Button>
        <Bot className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        <h1 className="text-xl font-semibold">{currentChat.title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {currentChat.messages.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            // onClick={() => renameExistingChat(currentChat.id)}
          >
            Rename Chat
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <Info className="w-6 h-6" />
        </Button>
      </div>
    </header>
  );
};
