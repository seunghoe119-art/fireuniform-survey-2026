import { NextRequest, NextResponse } from "next/server";
import roster from "../../data/members.json";
import type { SurveyMember } from "@/lib/types";

const members = roster as SurveyMember[];

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("name") || "")
    .trim()
    .replace(/\s+/g, "")
    .normalize("NFC");
  if (!query) return NextResponse.json({ error: "성명을 입력해 주세요." }, { status: 400 });

  const matches = members.filter((member) => member.name.replace(/\s+/g, "").normalize("NFC") === query);
  return NextResponse.json({ members: matches });
}

