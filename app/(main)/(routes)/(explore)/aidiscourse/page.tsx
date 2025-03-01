"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Calendar, Globe, Mic, Send } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function NewChat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!input.trim()) return;

    try {
      const supabase = createClient();
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, user_id: userId }),
      });

      if (!response.ok) throw new Error("Failed to create new chat");

      const chat = await response.json();

      if (chat && chat.id) {
        await fetch("/api/chatMessages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chat.id,
            user_id: userId,
            content: input,
            role: "user",
          }),
        });
        router.push(`/aidiscourse/${chat.id}`);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Start a New Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What would you like to discuss?"
                className="pr-20"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <Button type="button" size="icon" variant="ghost">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button type="button" size="icon" variant="ghost">
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button type="button" size="icon" variant="ghost">
                  <Globe className="h-4 w-4" />
                </Button>
                <Button type="button" size="icon" variant="ghost">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Send className="mr-2 h-4 w-4" /> Start Chat
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
