import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.nextUrl);
  const openAccessId = searchParams.get("open_access_id");
  const userId = searchParams.get("user_id");
  const ret_only_url = searchParams.get("ret_only_url");

  if (!openAccessId || !userId || !ret_only_url) {
    return NextResponse.json(
      { message: "open_access_id and user_id parameters are required" },
      { status: 400 },
    );
  }

  const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

  const url = new URL(`${BACKEND_URL}/marker/annotate`);
  console.log("OpenAccessId", openAccessId);
  url.searchParams.set("open_access_id", openAccessId);
  url.searchParams.set("user_id", userId);
  if (ret_only_url.toLowerCase() == "true") {
    url.searchParams.set("ret_only_url", ret_only_url);
  }

  //   console.log("Mikasas",url);
  const response = await fetch(url, {
    method: "GET",
  });
  if (!response.ok) {
    return NextResponse.json(
      { message: "Failed to create AI message" },
      { status: 444 },
    );
  }
  return NextResponse.json(await response.json()); // Return the created message
}
