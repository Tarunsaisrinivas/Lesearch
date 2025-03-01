import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { data } = await req.json();
  if (!data) {
    return NextResponse.json({ message: "Data is required" }, { status: 422 });
  }

  const { input, selectedText, page_id, user_id } = data;
  const query = `Text: ${selectedText}\n\nQuestion: ${input} \n\n `;
  const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
  const url = new URL(`${BACKEND_URL}/citation_chat/completion`);

  if (!user_id) {
    return NextResponse.json({ message: "User not found" }, { status: 400 });
  }

  url.searchParams.set("query", query);
  url.searchParams.set("page_id", page_id);
  url.searchParams.set("user_id", user_id);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error fetching from backend");
    }

    const responseData = await response.json();

    if (responseData.ai_answer === null) {
      return NextResponse.json(
        { message: "Sorry, couldn't generate the answer :(" },
        { status: 500 },
      );
    }

    // Return the AI's answer directly
    return NextResponse.json({ message: responseData.ai_answer });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 },
    );
  }
}
