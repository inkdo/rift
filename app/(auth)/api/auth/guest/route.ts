import { signIn } from "@/app/(auth)/auth";
import { isDevelopmentEnvironment } from "@/lib/constants";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  console.log("[AUTH] Guest auth route called");
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get("redirectUrl") || "/";

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  if (token) {
    console.log("[AUTH] User already has token, redirecting to home");
    return NextResponse.redirect(new URL("/", request.url));
  }

  console.log("[AUTH] No token found, signing in as guest");
  return signIn("guest", { redirect: true, redirectTo: redirectUrl });
}
