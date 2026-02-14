import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      message: "Notes API is available",
    },
    { status: 200 },
  );
}
