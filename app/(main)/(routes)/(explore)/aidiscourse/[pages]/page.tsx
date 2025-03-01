"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Bot, PenIcon as UserPen, Plus, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { useSidebar } from "../SidebarContext";

type Message = {
  id: string;
  chat_id: string;
  content: string;
  role: string;
  created_at: string;
  isFullyTyped?: boolean;
};

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [latestMessage, setLatestMessage] = useState("");

  const params = useParams();
  const chatId = params.pages as string;
  // const { isSidebarOpen } = useSidebar();
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error("User not authenticated");

        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("chat_id", chatId)
          .eq("user_id", user.user.id)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (chatId) fetchMessages();
  }, [chatId, supabase]);

  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`realtime:chat_messages:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prevMessages) => [
            ...prevMessages,
            { ...newMessage, isFullyTyped: newMessage.role !== "assistant" },
          ]);

          if (newMessage.role === "assistant") {
            animateTyping(newMessage.content);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, supabase]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesEndRef]); //Corrected dependency

  const animateTyping = (content: string) => {
    setTyping(true);
    setLatestMessage("");
    let index = 0;

    const interval = setInterval(() => {
      setLatestMessage((prev) => prev + content[index]);
      index++;
      if (index >= content.length) {
        clearInterval(interval);
        setTyping(false);
        setMessages((prevMessages) =>
          prevMessages.map((msg, i) =>
            i === prevMessages.length - 1
              ? { ...msg, isFullyTyped: true }
              : msg,
          ),
        );
      }
    }, 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const messageResponse = await fetch("/api/chatMessages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: user.user.id,
          content: input,
          role: "user",
        }),
      });

      if (!messageResponse.ok) {
        throw new Error("Failed to create message");
      }

      setInput("");
    } catch (error) {
      console.error("Error creating new message:", error);
    }
  };

  const generateReport = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const response = await fetch("/api/generateReport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user.id,
          chat_id: chatId,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate report");
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-5rem)]">
      <div className="flex-grow overflow-hidden min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-4 p-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isLatest={index === messages.length - 1}
                    typing={typing}
                    latestMessage={latestMessage}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
      </div>
      <footer className="p-4 border-t bg-background sticky bottom-0">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
          <Button onClick={generateReport} size="icon" variant="outline">
            <UserPen className="h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isLatest: boolean;
  typing: boolean;
  latestMessage: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLatest,
  typing,
  latestMessage,
}) => {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      {isAssistant && <Bot className="w-6 h-6 mt-3" />}
      <div
        className={`max-w-[80%] rounded-lg p-4 ${isAssistant ? "bg-secondary" : "bg-primary text-primary-foreground"}`}
      >
        <div className="flex items-start space-x-2">
          <div className="flex-grow space-y-1">
            <p className="flex text-sm font-medium">
              {!isAssistant && <User className="w-4 h-4" />}
              {isAssistant ? "Assistant" : "You"}
            </p>
            <div className="prose dark:prose-invert">
              {isLatest && typing ? latestMessage : message.content}
            </div>
          </div>
          {isAssistant && message.isFullyTyped && (
            <Button size="icon" variant="ghost" className="mt-1">
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
