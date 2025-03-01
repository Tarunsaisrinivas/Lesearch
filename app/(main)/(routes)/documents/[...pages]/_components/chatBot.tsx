"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePageStore } from "@/store/use-page-store";
import { SelectedTextDisplay } from "./selectedTextDisplay";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export function ChatBot({ pageId }: { pageId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system",
      role: "system",
      content: `You are a helpful assistant for the document with ID ${pageId}. Provide concise and relevant answers based on the document's content.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { selectedText, setSelectedText, activeTab } = usePageStore();
  const [localSelectedText, setLocalSelectedText] = useState("");
  // const [typingText, setTypingText] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedText) {
      setLocalSelectedText(selectedText.text);
    }
  }, [selectedText]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [scrollAreaRef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleClearSelectedText = () => {
    setLocalSelectedText("");
    setSelectedText({ text: "", pageType: selectedText.pageType });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input && !localSelectedText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input || "Please explain the selected text.",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const pageid = selectedText.pageType === "stack" ? activeTab : pageId;

    try {
      const { data: user } = await supabase.auth.getUser();
      const user_id = user?.user?.id;
      if (!user_id) {
        throw new Error("User not found");
      }

      const response = await fetch("/api/page-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            input,
            selectedText: localSelectedText,
            page_id: pageid,
            user_id,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      handleClearSelectedText();

      // Trigger typing animation
      // setTypingText("");
      // for (let i = 0; i < data.message.length; i++) {
      //   await new Promise((resolve) => setTimeout(resolve, 50))
      //   setTypingText((prev) => prev + data.message[i])
      // }
      // setTypingText("");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing your request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      {/* <CardHeader>
        <CardTitle>Document Assistant</CardTitle>
      </CardHeader> */}
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[calc(100vh-200px)]" ref={scrollAreaRef}>
          {messages.map((m) => (
            <div key={m.id} className="mb-4 flex items-start">
              {m.role === "user" ? (
                <Avatar className="mr-2">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="mr-2">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg p-2 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {/* {isLoading && (
            <div className="mb-4 flex items-start">
              <Avatar className="mr-2">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-2 bg-muted">
                {typingText}
                <span className="typing-animation"></span>
              </div>
            </div>
          )} */}
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        <SelectedTextDisplay
          text={localSelectedText}
          onClear={handleClearSelectedText}
        />
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center space-x-2"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about the document..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
