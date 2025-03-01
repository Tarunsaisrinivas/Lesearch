import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { SupabaseClient } from "@supabase/supabase-js"; // Import SupabaseClient type

// Check if OTP already exists or expired
async function checkExistingOtp(supabase: SupabaseClient, email: string) {
  const { data, error } = await supabase
    .from("otp")
    .select("otp, expires_at")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error checking OTP:", error.message);
    return null;
  }

  if (data && new Date(data.expires_at) > new Date()) {
    return data.otp; // OTP still valid
  }
  return null; // No valid OTP found
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const supabase = await createClient(); // Use await to resolve the promise and get the Supabase client

    //  Check if the email already exists in the "users" table
    const { data: existingUser, error: rpcError } = await supabase.rpc(
      "get_user_id_by_email",
      { email },
    );
    if (rpcError) {
      console.error("Error fetching user ID by email:", rpcError.message);
      return NextResponse.json(
        { message: "Error checking user" },
        { status: 500 },
      );
    }
    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 },
      );
    }

    //  Check if there's already an active OTP
    const existingOtp = await checkExistingOtp(supabase, email);
    if (existingOtp) {
      return NextResponse.json(
        { message: "An OTP is already active. Please check your email." },
        { status: 400 },
      );
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    //  Store OTP in the 'otp' table with an expiration time of 10 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 10 minutes from now
    const { error: otpError } = await supabase.from("otp").insert([
      {
        email,
        otp,
        expires_at: expiresAt,
      },
    ]);

    if (otpError) {
      console.error("Error inserting OTP into Supabase:", otpError.message);
      return NextResponse.json(
        { message: "Error creating OTP" },
        { status: 500 },
      );
    }

    //  Send OTP via email using Nodemailer
    const transporter = nodemailer.createTransport({
      secure: true,
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your OTP for signup",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your OTP is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
    });

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in request-otp:", error);
    return NextResponse.json(
      { message: "An error occurred while sending OTP" },
      { status: 500 },
    );
  }
}
