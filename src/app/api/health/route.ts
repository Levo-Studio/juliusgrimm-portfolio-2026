import { NextResponse } from "next/server";

export const GET = (): NextResponse =>
  NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    site: "Julius Grimm"
  });
