import { NextRequest, NextResponse } from "next/server";
import { kv, RKEYS } from "@/lib/db";
import { checkSession } from "@/lib/session";
import { deleteFromR2, isR2Url } from "@/lib/r2";
import type { AdminAbout } from "@/lib/admin-store";

export async function GET() {
  const about = await kv.get<AdminAbout>(RKEYS.about);
  return NextResponse.json(about ?? null);
}

export async function POST(req: NextRequest) {
  if (!(await checkSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const next = (await req.json()) as AdminAbout;

  // If the hero image was replaced (or cleared), free the old R2 object.
  const prev = await kv.get<AdminAbout>(RKEYS.about);
  if (
    prev?.heroImage &&
    isR2Url(prev.heroImage) &&
    prev.heroImage !== next?.heroImage
  ) {
    await deleteFromR2(prev.heroImage);
  }

  await kv.set(RKEYS.about, next);
  return NextResponse.json(next);
}
