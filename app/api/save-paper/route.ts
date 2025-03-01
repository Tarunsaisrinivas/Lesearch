import { createClient } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { arxivId, isPublic } = await req.json();

    if (!arxivId) {
      return NextResponse.json({ error: "Missing arXiv ID" }, { status: 400 });
    }

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `http://localhost:9000/open_access="arxiv"&id=${arxivId}&user_id=${user.id}&is_public=${isPublic}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error from conversion service:", errorData);
      return NextResponse.json(
        { error: "Error converting the paper" },
        { status: response.status },
      );
    }

    return NextResponse.json(
      { message: "Paper conversion initiated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in paper conversion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
