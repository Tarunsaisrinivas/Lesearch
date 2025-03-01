import { createClient } from "@/lib/supabase/client";

export type ChatId = {
  id: string | null;
};

export async function createNewChat(
  title: string,
  user_id: string,
): Promise<ChatId | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chats")
    .insert([{ title, user_id }]) // Insert the title and user_id into the chats table
    .select("id")
    .single();

  if (error) {
    console.error("Error creating chat:", error);
    return null;
  }

  console.log("Chat created:", data);
  return data; // Return the chat with its ID
}

export async function createNewMessage(
  chatId: string,
  user_id: string,
  content: string,
  role: string,
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chat_messages")
    .insert([{ chat_id: chatId, user_id, content, role }]) // Insert the message into chat_messages
    .select("id") // Return the message ID if necessary
    .single();

  if (error) {
    console.error("Error creating message:", error);
    return null;
  }

  return data; // Return the new message
}
