import { NextRequest, NextResponse } from "next/server";
// import { createNewMessage } from "@/store/chat";

export async function POST(req: NextRequest) {
  const { chat_id, user_id } = await req.json(); // Get the chat ID and message content from the request body
  if (!chat_id) {
    return NextResponse.json(
      { message: "Chat ID is required" },
      { status: 400 },
    );
  }
  const url = new URL(`${process.env.BACKEND_URL}/aidiscourse/generate_report`);
  url.searchParams.set("chat_id", chat_id);
  url.searchParams.set("user_id", user_id);

  const messageResponse = await fetch(url.toString(), {
    method: "GET",
  });
  // console.log('After Fetch', messageResponse);
  if (!messageResponse.ok) {
    return NextResponse.json(
      { message: "Failed to create AI message" },
      { status: 400 },
    );
  }

  return NextResponse.json(await messageResponse.json()); // Return the created message
}
