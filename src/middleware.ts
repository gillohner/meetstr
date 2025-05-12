// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const lang =
    request.cookies.get("lang")?.value ||
    request.cookies.get("i18next")?.value || // Also check i18next cookie
    request.headers.get("accept-language")?.split(",")[0].split("-")[0] ||
    "en";

  const response = NextResponse.next();

  // Set language header for server components
  response.headers.set("x-lang", lang);

  // Ensure both cookies exist for consistency
  if (!request.cookies.has("lang")) {
    response.cookies.set("lang", lang, { path: "/" });
  }

  if (!request.cookies.has("i18next")) {
    response.cookies.set("i18next", lang, { path: "/" });
  }

  return response;
}
