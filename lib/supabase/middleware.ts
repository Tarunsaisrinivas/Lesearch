import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/documents", "/reset-password", "/settings"];
const privateRoutes = ["/login", "/signup", "/forget-password"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Fetch user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  //Redirect to /login if accessing protected routes without a session
  if (
    !user &&
    (protectedRoutes.some((r) => pathname.startsWith(r)) ||
      pathname === "/complete-profile")
  ) {
    return NextResponse.redirect(
      new URL("/login", process.env.NEXT_PUBLIC_APP_URL),
    );
  }

  // Redirect to /completeprofile if session exists and 'name' is missing
  // if (user && protectedRoutes.some((r) => pathname.startsWith(r))) {
  //   if( !user.email  )
  //   {
  //     return NextResponse.redirect(new URL('/complete-profile', process.env.NEXT_PUBLIC_APP_URL));
  //   }
  // }

  // Redirect to /doc if accessing private routes with a session
  if (user && privateRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(
      new URL("/documents", process.env.NEXT_PUBLIC_APP_URL),
    );
  }

  // Return the response with updated cookies/session
  return supabaseResponse;
}
