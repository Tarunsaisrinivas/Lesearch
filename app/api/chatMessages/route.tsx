import { NextRequest, NextResponse } from "next/server";
import { createNewMessage } from "@/store/chat";

export async function POST(req: NextRequest) {
  const { chat_id, user_id, content, role } = await req.json(); // Get the chat ID and message content from the request body
  if (!chat_id || !content) {
    return NextResponse.json(
      { message: "Chat ID and content are required" },
      { status: 400 },
    );
  }
  // console.log('Before Create', chat_id, user_id, content, role);
  const data = createNewMessage(chat_id, user_id, content, role);
  if (!data) {
    return NextResponse.json(
      { message: "Failed to create user utterance" },
      { status: 400 },
    );
  }
  const messageResponse = await fetch(
    `${process.env.BACKEND_URL}/aidiscourse/completion`,
    {
      method: "POST",
      body: JSON.stringify({
        chat_id: chat_id, // Reference the newly created chat ID
        user_id: user_id,
        utterance: content, // Content of the message
      }),
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(4 * 60 * 1000),
    },
  );
  // console.log('After Fetch', messageResponse);
  if (!messageResponse.ok) {
    return NextResponse.json(
      { message: "Failed to create AI message" },
      { status: 400 },
    );
  }

  return NextResponse.json(await messageResponse.json()); // Return the created message
}
