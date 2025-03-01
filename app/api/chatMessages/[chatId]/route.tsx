import { createClient } from "@/lib/supabase/client";
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params
  // Logic to fetch chat data based on chatId
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return Response.json(
      { message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
  return Response.json({ data:data })
}