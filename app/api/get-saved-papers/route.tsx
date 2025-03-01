import { createClient } from "@/lib/supabase/client";

export async function GET() {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("saved_papers") // Table name in your Supabase database
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error fetching papers:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
