import { NextRequest, NextResponse } from "next/server";
import { createNewChat } from "@/store/chat";
// import { createClient } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  const { input, user_id } = await req.json(); // Get the title from the request body

  if (!input) {
    return NextResponse.json({ message: "Title is required" }, { status: 400 });
  }
  const chat = await createNewChat(input, user_id);
  console.log(chat);
  return NextResponse.json(chat);
}
