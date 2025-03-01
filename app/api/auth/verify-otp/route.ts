import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, password, otp } = await req.json();

    // Initialize Supabase client
    const supabase = await createClient();

    // Step 1: Verify OTP
    const { data: storedOtp, error: otpError } = await supabase
      .from("otp")
      .select("*")
      .eq("email", email)
      .eq("otp", otp)
      .gte("expires_at", new Date().toISOString()) // Ensure OTP is not expired
      .single();

    if (otpError) {
      console.error("OTP verification error:", otpError.message);
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    if (!storedOtp) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    // Step 2: Use Supabase's signUp method to create a user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error("Error during sign-up:", authError.message);
      return NextResponse.json(
        { message: "Error creating user" },
        { status: 500 },
      );
    }

    // Step 3: Delete the used OTP
    const { error: deleteOtpError } = await supabase
      .from("otp")
      .delete()
      .eq("email", email)
      .eq("otp", otp);
    if (deleteOtpError) {
      console.error("Error deleting OTP:", deleteOtpError.message);
    }

    return NextResponse.json(
      { message: "User created successfully", data: authData },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in sign-up:", error);
    return NextResponse.json(
      { message: "An error occurred while creating user" },
      { status: 500 },
    );
  }
}
