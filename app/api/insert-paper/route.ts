import { createClient } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { convertedPaper, isPublic, userId } = await req.json();

    if (!convertedPaper) {
      return NextResponse.json(
        { error: "Missing Converted Paper" },
        { status: 400 },
      );
    }

    const supabase = createClient();

    if (isPublic) {
      const { data: publicCopy, error: publicError } = await supabase
        .from("pages")
        .insert({
          user_id: userId,
          title: convertedPaper.title,
          emoji: convertedPaper.emoji,
          is_public: isPublic,
          linked_to: convertedPaper.uuid,
          is_locked: true,
        })
        .select("uuid")
        .single();

      if (publicError) {
        console.error("Error from conversion service:", publicError);
        return NextResponse.json(
          { error: "Error converting the paper" },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          message: "Paper conversion initiated successfully",
          paper: publicCopy,
        },
        { status: 200 },
      );
    } else {
      const { data: privateCopy, error: privateError } = await supabase
        .from("pages")
        .insert({
          content: convertedPaper.content,
          description: convertedPaper.description,
          emoji: convertedPaper.emoji,
          is_public: isPublic,
          title: convertedPaper.title,
          user_id: userId,
          is_locked: false,
        })
        .select("uuid")
        .single();
      if (privateError) {
        console.error("Error from conversion service:", privateError);
        return NextResponse.json(
          { error: "Error converting the paper" },
          { status: 500 },
        );
      }
      return NextResponse.json(
        {
          message: "Paper conversion initiated successfully",
          paper: privateCopy,
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Error in paper conversion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
