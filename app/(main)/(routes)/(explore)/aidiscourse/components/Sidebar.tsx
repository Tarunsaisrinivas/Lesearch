"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createClient } from "@/lib/supabase/client"
import { useChatStore } from "@/store/use-chat-store"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface Chat {
  id: string
  title: string
}

const supabase = createClient()

export const ChatSidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useChatStore()
  const [chats, setChats] = useState<Chat[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getUserID = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }

    getUserID()
  }, [])

  const fetchChats = useCallback(async () => {
    if (!userId) return

    const { data, error } = await supabase
      .from("chats")
      .select("id, title")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching chats:", error.message)
    } else {
      setChats(data || [])
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchChats()

      let subscription: RealtimeChannel

      const setupSubscription = () => {
        subscription = supabase
          .channel(`public:chats:user_id=eq.${userId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "chats",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log("Realtime change:", payload)

              if (payload.eventType === "INSERT") {
                setChats((prevChats) => [payload.new as Chat, ...prevChats])
              } else if (payload.eventType === "UPDATE") {
                setChats((prevChats) =>
                  prevChats.map((chat) => (chat.id === payload.new.id ? (payload.new as Chat) : chat)),
                )
              } else if (payload.eventType === "DELETE") {
                setChats((prevChats) => prevChats.filter((chat) => chat.id !== payload.old.id))
              }
            },
          )
          .subscribe()
      }

      setupSubscription()

      return () => {
        if (subscription) {
          supabase.removeChannel(subscription)
        }
      }
    }
  }, [userId, fetchChats])

  const handleChatClick = (id: string) => {
    router.push(`/aidiscourse/${id}`)
  }

  const startNewChat = () => {
    router.push("/aidiscourse")
  }

  if (!isSidebarOpen) return null

  return (
    <div className="relative w-64 bg-gray-100 dark:bg-stone-900">
      <div className="flex flex-col h-full pb-5">
        <div className="p-4">
          <Button size="icon" variant="ghost" onClick={toggleSidebar} className="absolute top-4 right-4">
            <X className="w-6 h-6" />
          </Button>
          <h2 className="text-xl font-semibold mb-4">AI Discourse</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button variant="outline" className="w-full justify-start mb-4" onClick={startNewChat}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Chat
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start a new conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ScrollArea className="overflow-y-auto h-full">
          <div className="space-y-2">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                className="w-full justify-start hover:bg-gray-200 dark:hover:bg-stone-800"
                onClick={() => handleChatClick(chat.id)}
                title={chat.title}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {chat.title.length > 25 ? chat.title.substring(0, 25) + "..." : chat.title}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

