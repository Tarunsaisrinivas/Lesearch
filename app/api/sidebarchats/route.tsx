import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/client";

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("chats")
      .select("id, title")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch chats" },
        { status: 500 },
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
