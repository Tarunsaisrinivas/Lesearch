import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");
  console.log("Title: ", title);
  if (!title) {
    return NextResponse.json({ message: "Title is required" }, { status: 400 });
  }
  const url = new URL(`${process.env.BACKEND_URL}/marker/url_from_title`);
  url.searchParams.set("title", title);

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

  return NextResponse.json(await messageResponse.json());
}
